// Schéma animé « Comment je travaille » : une ligne sinueuse, des embranchements
// qui se séparent puis se rejoignent, une bille qui parcourt le chemin et une
// gerbe de particules à l'arrivée. Tout est lisible sans script (voir
// ArchitectFlow.astro) ; ce module ajoute le tracé SVG et l'animation.

const NS = "http://www.w3.org/2000/svg";
const LANE_COLORS = ["#f2622b", "#f4b834", "#3dc4b0"] as const;
const LANE_OFFSETS: Record<number, readonly number[]> = { 2: [-24, 24], 3: [-30, 0, 30] };
// Horizontal : v = y. Vertical (mobile) : v = x. Les valeurs sont dans le repère (u, v)
// où u est l'axe de progression du tracé.
const NODE_V = { h: [68, 90, 68, 90, 68, 90], v: [46, 62, 46, 62, 46, 62] } as const;
const LANE_OFFSETS_V: Record<number, readonly number[]> = { 2: [-14, 14], 3: [-20, 0, 20] };
const MOBILE_QUERY = "(max-width: 759px)";
const DRAW_MS = 2800;
const LOOP_MS = 4200;
const BURST_MS = 1300;
const BURST_COLORS = ["#fff4dc", "#f2622b", "#f4b834", "#3dc4b0", "#f2622b"] as const;
// Pictos en trait (viewBox 24), un par étape dans l'ordre : personnes, couches, document,
// code, coche, panier. Dessinés à l'échelle ICON_SCALE dans un anneau de NODE_R.
const NODE_R = 13;
const ICON_SCALE = 0.5;
const ICONS: readonly (readonly string[])[] = [
  [
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
    "M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z",
    "M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  ],
  ["M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"],
  ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8"],
  ["m16 18 6-6-6-6M8 6l-6 6 6 6"],
  ["M20 6 9 17l-5-5"],
  [
    "M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12",
    "M9 21a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM20 21a1 1 0 1 1-2 0 1 1 0 0 1 2 0z",
  ],
];

type Attrs = Record<string, string | number>;

interface Lane {
  lit: SVGPathElement;
  len: number;
  u0: number;
  u1: number;
  dot: SVGCircleElement;
  dotU: number;
  color: string;
  fork: number;
}
interface StepNode {
  u: number;
  step: HTMLElement;
  parts: SVGElement[];
}
interface Model {
  us: number[];
  main: SVGPathElement;
  mainLen: number;
  lanes: Lane[];
  nodes: StepNode[];
  pulse: SVGCircleElement;
  splits: SVGCircleElement[];
  fx: SVGGElement;
  p: number;
}
interface Burst {
  t0: number;
  cx: number;
  cy: number;
  fx: SVGGElement;
  wave: SVGCircleElement;
  items: { el: SVGTextElement; dx: number; dy: number }[];
  over: boolean;
}

function svgEl<K extends keyof SVGElementTagNameMap>(
  name: K,
  attrs: Attrs = {},
  parent?: Element,
): SVGElementTagNameMap[K] {
  const n = document.createElementNS(NS, name);
  for (const k in attrs) n.setAttribute(k, String(attrs[k]));
  parent?.appendChild(n);
  return n;
}

const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
const at = <T>(a: readonly T[], i: number): T => a[i] as T;

function initArchitectFlow(flow: HTMLElement): void {
  const steps = Array.from(flow.querySelectorAll<HTMLElement>(".af-step"));
  if (steps.length < 2) return;
  let svg: SVGSVGElement | null = null;
  let model: Model | null = null;
  let burst: Burst | null = null;
  let vertical = false;
  let started = false;
  let alive = true;
  let lastLap = -1;
  let t0 = 0;

  // (u, v) → coordonnées d'écran
  const P = (u: number, v: number): string => (vertical ? `${v} ${u}` : `${u} ${v}`);
  const pt = (u: number, v: number): { x: number; y: number } =>
    vertical ? { x: v, y: u } : { x: u, y: v };
  const U = (p: DOMPoint): number => (vertical ? p.y : p.x);
  const V = (p: DOMPoint): number => (vertical ? p.x : p.y);
  const nodeV = (i: number): number => at(vertical ? NODE_V.v : NODE_V.h, i);

  /** Longueur du tracé à la position u (tracés croissants en u : dichotomie). */
  function lengthAtU(path: SVGPathElement, len: number, u: number): number {
    let lo = 0;
    let hi = len;
    for (let i = 0; i < 18; i++) {
      const mid = (lo + hi) / 2;
      if (U(path.getPointAtLength(mid)) < u) lo = mid;
      else hi = mid;
    }
    return hi;
  }

  function build(): void {
    vertical = window.matchMedia(MOBILE_QUERY).matches;
    svg?.remove();
    flow.querySelectorAll(".af-panel").forEach((p) => {
      p.remove();
    });
    // Premières et dernières étapes de chaque panneau (espacement en vertical)
    steps.forEach((s, i) => {
      const label = s.dataset["panel"];
      s.classList.toggle("af-first", i === 0 || at(steps, i - 1).dataset["panel"] !== label);
      s.classList.toggle(
        "af-last",
        i === steps.length - 1 || at(steps, i + 1).dataset["panel"] !== label,
      );
    });

    const width = vertical ? flow.offsetWidth : flow.scrollWidth;
    const height = vertical
      ? flow.offsetHeight
      : (Number.parseFloat(getComputedStyle(flow).getPropertyValue("--af-band")) || 138) + 4;
    const root = svgEl("svg", {
      width,
      height,
      viewBox: `0 0 ${width} ${height}`,
      "aria-hidden": "true",
    });
    svg = root;
    flow.insertBefore(root, flow.firstChild);

    // Un seul panneau, sans séparation ; un libellé au début de chaque groupe
    // d'étapes consécutives qui partagent data-panel.
    const firstStep = at(steps, 0);
    const lastStep = at(steps, steps.length - 1);
    const panel = document.createElement("div");
    panel.className = "af-panel";
    const panelLeft = firstStep.offsetLeft - 20;
    if (vertical) {
      panel.style.left = "0px";
      panel.style.width = `${width}px`;
      panel.style.height = `${flow.offsetHeight}px`;
    } else {
      panel.style.left = `${panelLeft}px`;
      panel.style.width = `${lastStep.offsetLeft + lastStep.offsetWidth - panelLeft + 20}px`;
      panel.style.height = `${flow.offsetHeight}px`;
    }
    steps.forEach((s, idx) => {
      const label = s.dataset["panel"];
      if (!label || (idx > 0 && at(steps, idx - 1).dataset["panel"] === label)) return;
      const cap = document.createElement("span");
      cap.textContent = label;
      if (!vertical) cap.style.left = `${s.offsetLeft - panelLeft}px`;
      panel.appendChild(cap);
    });
    flow.insertBefore(panel, flow.firstChild);

    const us = steps.map((s) => (vertical ? s.offsetTop + 12 : s.offsetLeft + 15));
    if (!vertical) us[us.length - 1] = width - 36; // le tracé va jusqu'au bord droit
    const first = at(us, 0);
    const last = at(us, us.length - 1);

    const defs = svgEl("defs", {}, root);
    const grad = svgEl(
      "linearGradient",
      vertical
        ? { id: "af-grad", gradientUnits: "userSpaceOnUse", x1: 0, y1: first, x2: 0, y2: last }
        : { id: "af-grad", gradientUnits: "userSpaceOnUse", x1: first, y1: 0, x2: last, y2: 0 },
      defs,
    );
    svgEl("stop", { offset: "0", "stop-color": "#9c3f25" }, grad);
    svgEl("stop", { offset: "0.55", "stop-color": "#f2622b" }, grad);
    svgEl("stop", { offset: "1", "stop-color": "#f4b834" }, grad);

    // Ligne principale sinueuse
    let d = `M${P(first, nodeV(0))}`;
    for (let k = 1; k < us.length; k++) {
      const du = (at(us, k) - at(us, k - 1)) / 2;
      d += ` C${P(at(us, k - 1) + du, nodeV(k - 1))} ${P(at(us, k) - du, nodeV(k))} ${P(at(us, k), nodeV(k))}`;
    }
    svgEl("path", { d, class: "af-rail" }, root);
    const main = svgEl("path", { d, class: "af-lit", stroke: "url(#af-grad)" }, root);
    const mainLen = main.getTotalLength();
    main.style.strokeDasharray = String(mainLen);

    const mainAt = (u: number): DOMPoint => main.getPointAtLength(lengthAtU(main, mainLen, u));
    const lanes: Lane[] = [];
    const laneOffsets = vertical ? LANE_OFFSETS_V : LANE_OFFSETS;
    const tail = vertical ? 40 : 78;

    // Embranchements : ils fusionnent sur la ligne avant l'étape suivante
    steps.forEach((s, idx) => {
      const n = Number.parseInt(s.dataset["lanes"] ?? (s.dataset["kind"] === "fork" ? "2" : "0"), 10);
      const offsets = laneOffsets[n];
      if (!offsets) return;
      const u0 = at(us, idx);
      const ue = at(us, idx + 1) - tail;
      const um = (u0 + ue) / 2;
      const w = ue - u0;
      const p0 = mainAt(u0);
      const pm = mainAt(um);
      const pe = mainAt(ue);
      offsets.forEach((o, k) => {
        const color = at(LANE_COLORS, k);
        const ld =
          `M${P(u0, V(p0))} C${P(u0 + w * 0.28, V(p0))} ${P(um - w * 0.14, V(pm) + o)} ${P(um, V(pm) + o)}` +
          ` S${P(ue - w * 0.28, V(pe))} ${P(ue, V(pe))}`;
        svgEl("path", { d: ld, class: "af-rail" }, root);
        const lit = svgEl("path", { d: ld, class: "af-lit", stroke: color }, root);
        const len = lit.getTotalLength();
        lit.style.strokeDasharray = String(len);
        const c = pt(um, V(pm) + o);
        const dot = svgEl(
          "circle",
          { cx: c.x, cy: c.y, r: 5, class: "af-lane-dot", stroke: color },
          root,
        );
        lanes.push({ lit, len, u0, u1: ue, dot, dotU: um, color, fork: idx });
      });
    });

    /** Picto 24×24 centré sur (x, y), à l'échelle k ; trait épaissi pour compenser l'échelle. */
    const icon = (paths: readonly string[], x: number, y: number, k: number): SVGElement[] => {
      const g = svgEl("g", { transform: `translate(${x - 12 * k} ${y - 12 * k}) scale(${k})` }, root);
      return paths.map((d) => {
        const p = svgEl("path", { d, class: "af-flag" }, g);
        p.style.strokeWidth = String(1.5 / k); // la classe .af-flag fixe 1.5, l'échelle le réduirait
        return p;
      });
    };

    // Nœuds : un anneau et un picto par étape ; point plein si l'étape n'a pas de picto
    const nodes: StepNode[] = steps.map((s, idx) => {
      const c = pt(at(us, idx), nodeV(idx));
      const { x, y } = c;
      const parts: SVGElement[] = [];
      const paths = ICONS[idx];
      if (paths) {
        parts.push(svgEl("circle", { cx: x, cy: y, r: NODE_R, class: "af-endring" }, root));
        parts.push(...icon(paths, x, y, ICON_SCALE));
      } else {
        parts.push(svgEl("circle", { cx: x, cy: y, r: 6, class: "af-node" }, root));
      }
      return { u: at(us, idx), step: s, parts };
    });

    const c0 = pt(first, nodeV(0));
    const pulse = svgEl("circle", { cx: c0.x, cy: c0.y, r: 3.5, class: "af-pulse" }, root);
    pulse.style.opacity = "0";
    const splits = [0, 1, 2].map((k) => {
      const c = svgEl(
        "circle",
        { cx: c0.x, cy: c0.y, r: 3, class: "af-pulse", stroke: at(LANE_COLORS, k), "stroke-width": 1.5 },
        root,
      );
      c.style.opacity = "0";
      return c;
    });
    const fx = svgEl("g", {}, root);
    // Une reconstruction (polices, redimensionnement) ne doit pas orpheliner la gerbe en cours
    if (burst && !burst.over) {
      burst.fx = fx;
      for (const it of burst.items) fx.appendChild(it.el);
      fx.appendChild(burst.wave);
    }

    model = { us, main, mainLen, lanes, nodes, pulse, splits, fx, p: model?.p ?? 0 };
    flow.classList.add("af-ready");
    apply(model.p);
  }

  /** p : avancement de 0 à 1 de la ligne allumée. */
  function apply(p: number): void {
    if (!model) return;
    const uFirst = at(model.us, 0);
    const uLast = at(model.us, model.us.length - 1);
    const lu = uFirst + p * (uLast - uFirst);
    model.p = p;
    const shown = p <= 0 ? 0 : lengthAtU(model.main, model.mainLen, lu);
    model.main.style.strokeDashoffset = String(model.mainLen - shown);
    for (const g of model.nodes) {
      const on = p > 0 && lu >= g.u - 0.5;
      g.step.classList.toggle("af-on", on);
      for (const part of g.parts) part.classList.toggle("af-on", on);
    }
    for (const l of model.lanes) {
      const f = clamp((lu - l.u0) / (l.u1 - l.u0), 0, 1);
      l.lit.style.strokeDashoffset = String(l.len * (1 - f));
      const on = p > 0 && lu >= l.dotU;
      l.dot.classList.toggle("af-on", on);
      l.dot.style.fill = on ? l.color : "";
    }
  }

  /** La bille suit la ligne ; sur un embranchement elle se sépare, puis se rejoint. */
  function movePulse(p: DOMPoint, op: number): void {
    if (!model) return;
    const u = U(p);
    const fork = model.lanes.find((l) => u >= l.u0 && u <= l.u1)?.fork ?? -1;
    if (fork < 0) {
      model.pulse.setAttribute("cx", String(p.x));
      model.pulse.setAttribute("cy", String(p.y));
      model.pulse.style.opacity = op.toFixed(2);
      for (const b of model.splits) b.style.opacity = "0";
      return;
    }
    model.pulse.style.opacity = "0";
    const lanes = model.lanes.filter((l) => l.fork === fork);
    model.splits.forEach((b, k) => {
      const l = lanes[k];
      if (!l) {
        b.style.opacity = "0";
        return;
      }
      const q = l.lit.getPointAtLength(lengthAtU(l.lit, l.len, u));
      b.setAttribute("cx", String(q.x));
      b.setAttribute("cy", String(q.y));
      b.style.opacity = op.toFixed(2);
    });
  }

  function startBurst(now: number): void {
    if (!model) return;
    const n = steps.length - 1;
    const c = pt(at(model.us, n), nodeV(n));
    const wave = svgEl(
      "circle",
      { cx: c.x, cy: c.y, r: 12, fill: "none", stroke: "#f2622b", "stroke-width": 1 },
      model.fx,
    );
    // Gerbe de mini symboles euros
    const items: Burst["items"] = [];
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2;
      const dist = 14 + Math.random() * 40;
      const el = svgEl(
        "text",
        {
          x: c.x,
          y: c.y,
          "font-size": (5 + Math.random() * 4).toFixed(1),
          "font-family": "var(--font-mono)",
          "font-weight": 500,
          "text-anchor": "middle",
          "dominant-baseline": "middle",
          fill: at(BURST_COLORS, i % BURST_COLORS.length),
        },
        model.fx,
      );
      el.textContent = "€";
      items.push({ el, dx: Math.cos(a) * dist, dy: Math.sin(a) * dist * 0.55 });
    }
    burst = { t0: now, cx: c.x, cy: c.y, fx: model.fx, wave, items, over: false };
  }

  function stepBurst(now: number): void {
    if (!burst || burst.over) return;
    const u = (now - burst.t0) / BURST_MS;
    if (u >= 1) {
      for (const it of burst.items) it.el.remove();
      burst.wave.remove();
      burst.over = true;
      return;
    }
    const k = 1 - (1 - u) ** 3;
    for (const it of burst.items) {
      it.el.setAttribute("x", String(burst.cx + it.dx * k));
      it.el.setAttribute("y", String(burst.cy + it.dy * k));
      it.el.setAttribute("opacity", (0.75 * (1 - u)).toFixed(2));
    }
    const w = clamp(u / 0.55, 0, 1);
    burst.wave.setAttribute("r", String(12 + 16 * (1 - (1 - w) ** 2)));
    burst.wave.setAttribute("opacity", (0.35 * (1 - w)).toFixed(2));
  }

  function tick(now: number): void {
    stepBurst(now);
    // Démarrage dès que le schéma entre dans l'écran, sans IntersectionObserver :
    // une mesure par image jusqu'au départ, puis plus rien.
    if (!started) {
      const r = flow.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.8 && r.bottom > window.innerHeight * 0.15) start();
    }
    if (started && model) {
      const dt = now - t0;
      if (dt < DRAW_MS) {
        const t = dt / DRAW_MS;
        apply(t * t * (3 - 2 * t));
      } else {
        if (model.p < 1) apply(1);
        // Gerbe à l'arrivée du tracé, puis à chaque passage de la bille au bout de la ligne.
        const lap = Math.floor((dt - DRAW_MS) / LOOP_MS);
        if (lap !== lastLap) {
          lastLap = lap;
          startBurst(now);
        }
        const u = ((dt - DRAW_MS) % LOOP_MS) / LOOP_MS;
        const e = u * u * (3 - 2 * u);
        movePulse(model.main.getPointAtLength(model.mainLen * e), Math.sin(u * Math.PI));
      }
    }
    if (alive) requestAnimationFrame(tick);
  }

  function start(): void {
    if (started) return;
    started = true;
    t0 = performance.now();
  }

  build();
  window.addEventListener("resize", build);
  void document.fonts?.ready.then(build);
  // Arrêt propre quand ClientRouter remplace la page : plus de resize ni de tick orphelins.
  document.addEventListener(
    "astro:before-swap",
    () => {
      window.removeEventListener("resize", build);
      alive = false;
    },
    { once: true },
  );
  // Animation jouée même sous prefers-reduced-motion (choix du 2026-11-07, voir global.css).
  requestAnimationFrame(tick);
}

// Le module ne s'exécute qu'une fois par visite (ClientRouter) : init à chaque page.
function boot(): void {
  const flow = document.getElementById("architect-flow");
  if (!flow || flow.classList.contains("af-ready")) return;
  try {
    initArchitectFlow(flow);
  } catch (err) {
    // Sans script le schéma reste lisible (filet continu) ; l'erreur doit se voir en console.
    console.error("architect-flow", err);
  }
}
document.addEventListener("astro:page-load", boot);
// Si l'événement a déjà eu lieu quand ce module s'exécute (ordre de chargement variable
// selon le navigateur), on démarre quand même.
if (document.readyState !== "loading") boot();
