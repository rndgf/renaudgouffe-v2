// Schéma animé « Comment je travaille » : une courbe qui ondule autour d'une ligne
// de base pointillée, une étiquette et un picto par étape, une boucle d'itération
// entre la découverte et l'architecture, puis un anneau et une gerbe de « € » au
// go-live. Tout est lisible sans script (voir ArchitectFlow.astro) ; ce module
// ajoute le dessin et l'animation.
//
// Repère (u, v) : u est l'axe de progression (x en desktop, y sur mobile),
// v l'axe perpendiculaire autour de la ligne de base.

import { SHOPIFY_ICON } from "@/data/shopify-icon";

const NS = "http://www.w3.org/2000/svg";
const MOBILE_QUERY = "(max-width: 759px)";
/** Écart de chaque étape à la ligne de base, en px (h : desktop, v : mobile). */
const OFFSETS = { h: [-18, 20, -14, 22, -20, -10], v: [-10, 12, -8, 12, -12, 0] } as const;
/** Vitesse du tracé, en px/s. */
const SPEED = { h: 320, v: 260 } as const;
const LOOP_MS = 1500;
const HOLD_MS = 2400;
const BURST_MS = 1300;
const BURST_COLORS = ["#fff4dc", "#f2622b", "#f4b834", "#3dc4b0", "#f2622b"] as const;
// Desktop : marge identique entre le bord des panneaux et le départ (à gauche) ou
// l'anneau final (à droite) ; picto au-dessus de l'ancre ; étiquette sous la ligne de base.
const H_PAD = 56;
const PIC_RISE = 62;
const CHIP_DROP = 88;
// Mobile : abscisses de la ligne, des pictos et des étiquettes (voir le CSS mobile).
const V_LINE = 96;
const V_PIC = 40;
const V_CHIP = 124;
const PIC_R = { h: 22, v: 20 } as const;
const ICONS: Record<string, readonly string[]> = {
  people: [
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
    "M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z",
    "M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  ],
  layers: ["m12 2 10 5-10 5L2 7z", "m2 12 10 5 10-5", "m2 17 10 5 10-5"],
  doc: ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8"],
  code: ["m16 18 6-6-6-6M8 6l-6 6 6 6"],
  check: ["M20 6 9 17l-5-5"],
};

type Attrs = Record<string, string | number>;
type XY = [number, number];

interface Seg {
  u0: number;
  u1: number;
  v0: number;
  v1: number;
  c1: number;
  c2: number;
}
interface StepParts {
  u: number;
  els: Element[];
  pic: HTMLElement;
  picAt: XY;
}
interface Orbit {
  lit: SVGPathElement;
  len: number;
  at: (p: number) => XY;
  label: HTMLElement;
  from: number;
  to: number;
  t0: number;
  t1: number;
}
interface Phase {
  t0: number;
  t1: number;
  u0: number;
  u1: number;
  kind: "travel" | "loop" | "hold";
}
interface Model {
  segs: Seg[];
  samples: { u: number; l: number }[];
  lit: SVGPathElement;
  len: number;
  head: SVGCircleElement;
  steps: StepParts[];
  orbit: Orbit | null;
  phases: Phase[];
  total: number;
  tEnd: number;
  endAt: XY;
  fx: SVGGElement;
}
interface Burst {
  t0: number;
  wave: SVGCircleElement;
  items: { el: SVGTextElement; dx: number; dy: number }[];
  at: XY;
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

function div(className: string, parent: Element, box: Partial<Record<"left" | "top" | "width" | "height", number>>): HTMLElement {
  const n = document.createElement("div");
  n.className = className;
  for (const [k, v] of Object.entries(box)) n.style.setProperty(k, `${v}px`);
  parent.appendChild(n);
  return n;
}

const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
const at = <T>(a: readonly T[], i: number): T => a[i] as T;

/** Bézier cubique à u linéaire : v(t) directement. */
function segV(s: Seg, t: number): number {
  const w = 1 - t;
  return w * w * w * s.v0 + 3 * w * w * t * s.c1 + 3 * w * t * t * s.c2 + t * t * t * s.v1;
}

/** Ellipse : longueur approchée (Ramanujan). */
const ellipseLen = (rx: number, ry: number): number =>
  Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));

function iconSvg(name: string): SVGSVGElement {
  if (name === "shop") {
    const s = svgEl("svg", { viewBox: SHOPIFY_ICON.viewBox, class: "af-filled", "aria-hidden": "true" });
    svgEl("path", { d: SHOPIFY_ICON.path }, s);
    return s;
  }
  const s = svgEl("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" });
  for (const d of ICONS[name] ?? []) svgEl("path", { d }, s);
  return s;
}

function initArchitectFlow(flow: HTMLElement): void {
  const steps = Array.from(flow.querySelectorAll<HTMLElement>(".af-step"));
  if (steps.length < 2) return;
  let made: Element[] = [];
  let model: Model | null = null;
  let burst: Burst | null = null;
  let vertical = false;
  let started = false;
  let alive = true;
  let burstLap = -1;
  let t0 = 0;

  const P = (u: number, v: number): XY => (vertical ? [v, u] : [u, v]);

  function vAt(m: Model, u: number): number {
    for (const s of m.segs) if (u <= s.u1) return segV(s, clamp((u - s.u0) / (s.u1 - s.u0), 0, 1));
    return at(m.segs, m.segs.length - 1).v1;
  }
  function lenAt(m: Model, u: number): number {
    const sm = m.samples;
    if (u <= at(sm, 0).u) return 0;
    for (let i = 1; i < sm.length; i++) {
      const b = at(sm, i);
      if (u <= b.u) {
        const a = at(sm, i - 1);
        return a.l + ((u - a.u) / (b.u - a.u || 1)) * (b.l - a.l);
      }
    }
    return m.len;
  }

  function build(): void {
    vertical = window.matchMedia(MOBILE_QUERY).matches;
    for (const el of made) el.remove();
    made = [];
    burst = null;
    // La classe change la mise en page mobile : elle se pose avant toute mesure.
    flow.classList.add("af-ready");

    const cs = getComputedStyle(flow);
    const band = Number.parseFloat(cs.getPropertyValue("--af-band")) || 380;
    const base = vertical ? V_LINE : Number.parseFloat(cs.getPropertyValue("--af-base")) || 176;
    const width = vertical ? flow.offsetWidth : flow.scrollWidth;
    const height = vertical ? flow.offsetHeight : band;
    const offs = vertical ? OFFSETS.v : OFFSETS.h;
    const picR = vertical ? PIC_R.v : PIC_R.h;

    // Panneaux (desktop) : un par groupe d'étapes consécutives de même data-panel.
    if (!vertical) {
      let start = 0;
      steps.forEach((s, i) => {
        const next = steps[i + 1];
        if (next && next.dataset["panel"] === s.dataset["panel"]) return;
        const first = at(steps, start);
        const left = start === 0 ? 0 : (at(steps, start - 1).offsetLeft + at(steps, start - 1).offsetWidth + first.offsetLeft) / 2 + 6;
        const right = next ? (s.offsetLeft + s.offsetWidth + next.offsetLeft) / 2 - 6 : width;
        const panel = div("af-panel", flow, { left, width: right - left });
        const cap = document.createElement("span");
        cap.textContent = s.dataset["panel"] ?? "";
        panel.appendChild(cap);
        made.push(panel);
        start = i + 1;
      });
    }

    const root = svgEl("svg", { width, height, viewBox: `0 0 ${width} ${height}`, "aria-hidden": "true" });
    flow.insertBefore(root, flow.firstChild);
    made.push(root);

    // Ancres : centre de colonne (desktop) ou hauteur de l'étiquette (mobile).
    // Desktop : la dernière ancre (anneau final) se place à H_PAD du bord droit.
    const anchors = steps.map((s, i) => ({
      u: vertical
        ? s.offsetTop + 21
        : i === steps.length - 1
          ? width - H_PAD
          : s.offsetLeft + s.offsetWidth / 2,
      v: base + at(offs, i),
    }));
    const start = { u: vertical ? 8 : H_PAD, v: base };
    const pts = [start, ...anchors];
    const last = at(anchors, anchors.length - 1);

    const b0 = P(start.u, base);
    const b1 = P(last.u, base);
    svgEl("line", { x1: b0[0], y1: b0[1], x2: b1[0], y2: b1[1], class: "af-base" }, root);

    // Courbe : tangentes estimées, u linéaire sur chaque segment.
    const n = pts.length;
    const slope = pts.map((_, i) =>
      i === 0 || i === n - 1 ? 0 : (0.6 * (at(pts, i + 1).v - at(pts, i - 1).v)) / (at(pts, i + 1).u - at(pts, i - 1).u),
    );
    const segs: Seg[] = [];
    const samples = [{ u: start.u, l: 0 }];
    let d = `M${P(start.u, start.v).join(" ")}`;
    let len = 0;
    for (let j = 0; j < n - 1; j++) {
      const a = at(pts, j);
      const b = at(pts, j + 1);
      const du = b.u - a.u;
      const s: Seg = { u0: a.u, u1: b.u, v0: a.v, v1: b.v, c1: a.v + (at(slope, j) * du) / 3, c2: b.v - (at(slope, j + 1) * du) / 3 };
      segs.push(s);
      d += ` C${P(a.u + du / 3, s.c1).join(" ")} ${P(b.u - du / 3, s.c2).join(" ")} ${P(b.u, b.v).join(" ")}`;
      let [pu, pv] = [a.u, a.v];
      for (let k = 1; k <= 24; k++) {
        const qu = a.u + (du * k) / 24;
        const qv = segV(s, k / 24);
        len += Math.hypot(qu - pu, qv - pv);
        samples.push({ u: qu, l: len });
        [pu, pv] = [qu, qv];
      }
    }
    svgEl("path", { d, class: "af-rail" }, root);
    const lit = svgEl("path", { d, class: "af-lit" }, root);
    lit.style.strokeDasharray = `${len} ${len + 1}`;

    // Boucle d'itération : une ellipse en pointillé autour des pictos concernés.
    let orbit: Orbit | null = null;
    const from = steps.findIndex((s) => s.dataset["loopTo"] !== undefined);
    const picAt = (i: number): XY => {
      const a = at(anchors, i);
      return vertical ? [V_PIC, a.u] : [a.u, a.v - PIC_RISE];
    };
    if (from > 0) {
      const to = Number.parseInt(at(steps, from).dataset["loopTo"] ?? "0", 10);
      const [fx, fy] = picAt(from);
      const [gx, gy] = picAt(to);
      let od: string;
      let olen: number;
      let oat: (p: number) => XY;
      let lab: XY;
      if (vertical) {
        // Ellipse verticale ; départ en bas (picto d'arrivée de la boucle), sens horaire.
        const cx = V_PIC;
        const cy = (fy + gy) / 2;
        const rx = picR + 8;
        const ry = (fy - gy) / 2 + 34;
        od = `M${cx} ${cy + ry} A${rx} ${ry} 0 1 1 ${cx} ${cy - ry} A${rx} ${ry} 0 1 1 ${cx} ${cy + ry}`;
        olen = ellipseLen(rx, ry);
        oat = (p) => [cx - rx * Math.sin(2 * Math.PI * p), cy + ry * Math.cos(2 * Math.PI * p)];
        lab = [cx, cy - 6];
      } else {
        // Ellipse horizontale ; départ à droite, vers le haut. ry assez grand pour
        // contenir les deux pictos malgré leur écart vertical.
        const cx = (fx + gx) / 2;
        const cy = (fy + gy) / 2;
        const half = (fx - gx) / 2;
        const rx = half + 44;
        const ry = Math.max(36, (Math.abs(fy - gy) / 2 + picR + 6) / Math.sqrt(1 - (half / rx) ** 2));
        od = `M${cx + rx} ${cy} A${rx} ${ry} 0 1 0 ${cx - rx} ${cy} A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}`;
        olen = ellipseLen(rx, ry);
        oat = (p) => [cx + rx * Math.cos(2 * Math.PI * p), cy - ry * Math.sin(2 * Math.PI * p)];
        lab = [cx, cy - ry - 22];
      }
      svgEl("path", { d: od, class: "af-orbit" }, root);
      const olit = svgEl("path", { d: od, class: "af-orbit-lit" }, root);
      const label = div("af-loop-label", flow, { left: lab[0], top: lab[1] });
      label.textContent = flow.dataset["loopLabel"] ?? "";
      made.push(label);
      orbit = { lit: olit, len: olen, at: oat, label, from, to, t0: 0, t1: 0 };
    }

    const head = svgEl("circle", { r: 5, class: "af-head", opacity: 0 }, root);
    const fxLayer = svgEl("g", {}, root);

    const startPt = P(start.u, start.v);
    made.push(div("af-start", flow, { left: startPt[0], top: startPt[1] }));

    // Par étape : carré (anneau pour la dernière), étiquette, picto et leurs traits.
    const parts: StepParts[] = anchors.map((a, i) => {
      const s = at(steps, i);
      const isEnd = i === anchors.length - 1;
      const r = isEnd ? 8 : 4;
      const [ax, ay] = P(a.u, a.v);
      const sq = div(isEnd ? "af-sq af-end" : "af-sq", flow, { left: ax, top: ay });

      const chip = vertical
        ? div("af-chip", flow, { left: V_CHIP, top: a.u - 15 })
        : div(isEnd ? "af-chip af-chip-end" : "af-chip", flow, { left: a.u, top: base + CHIP_DROP });
      const name = document.createElement("span");
      name.textContent = s.dataset["name"] ?? "";
      chip.appendChild(name);
      const ck = svgEl("svg", { viewBox: "0 0 24 24", width: 12, height: 12, "aria-hidden": "true" }, chip);
      svgEl("polyline", { points: "20 6 9 17 4 12" }, ck);
      const lead = vertical
        ? div("af-lead", flow, { left: a.v + r + 1, top: a.u, width: Math.max(0, V_CHIP - a.v - r - 1), height: 1 })
        : div("af-lead", flow, { left: a.u, top: a.v + r + 1, width: 1, height: Math.max(0, base + CHIP_DROP - a.v - r - 1) });

      const pAt = picAt(i);
      const pic = div("af-pic", flow, { left: pAt[0], top: pAt[1] });
      pic.appendChild(iconSvg(s.dataset["icon"] ?? ""));
      const picLead = vertical
        ? div("af-lead af-pic-lead", flow, { left: V_PIC + picR, top: a.u, width: Math.max(0, a.v - 6 - V_PIC - picR), height: 1 })
        : div("af-lead af-pic-lead", flow, { left: a.u, top: pAt[1] + picR, width: 1, height: Math.max(0, a.v - 6 - pAt[1] - picR) });

      const els = [s, sq, chip, lead, pic, picLead];
      made.push(sq, chip, lead, pic, picLead);
      return { u: a.u, els, pic, picAt: pAt };
    });

    // Chronologie : trajets, boucle à l'étape « from », pause finale.
    const speed = vertical ? SPEED.v : SPEED.h;
    const phases: Phase[] = [];
    let t = 0;
    let cu = start.u;
    const travel = (u: number): void => {
      const dur = ((u - cu) / speed) * 1000;
      if (dur > 0) phases.push({ t0: t, t1: t + dur, u0: cu, u1: u, kind: "travel" });
      t += Math.max(0, dur);
      cu = u;
    };
    if (orbit) {
      travel(at(anchors, orbit.from).u);
      orbit.t0 = t;
      orbit.t1 = t + LOOP_MS;
      phases.push({ t0: t, t1: t + LOOP_MS, u0: cu, u1: cu, kind: "loop" });
      t += LOOP_MS;
    }
    travel(last.u);
    const tEnd = t;
    phases.push({ t0: t, t1: t + HOLD_MS, u0: cu, u1: cu, kind: "hold" });
    t += HOLD_MS;

    model = {
      segs,
      samples,
      lit,
      len,
      head,
      steps: parts,
      orbit,
      phases,
      total: t,
      tEnd,
      endAt: P(last.u, last.v),
      fx: fxLayer,
    };
    render(performance.now());
  }

  function startBurst(now: number): void {
    if (!model) return;
    const [cx, cy] = model.endAt;
    const wave = svgEl("circle", { cx, cy, r: 12, class: "af-wave" }, model.fx);
    // Gerbe de mini symboles euros
    const items: Burst["items"] = [];
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2;
      const dist = 14 + Math.random() * 40;
      const el = svgEl(
        "text",
        { x: cx, y: cy, "font-size": (5 + Math.random() * 4).toFixed(1), class: "af-burst", fill: at(BURST_COLORS, i % BURST_COLORS.length) },
        model.fx,
      );
      el.textContent = "€";
      items.push({ el, dx: Math.cos(a) * dist, dy: Math.sin(a) * dist * 0.55 });
    }
    burst = { t0: now, wave, items, at: [cx, cy] };
  }

  function stepBurst(now: number): void {
    if (!burst) return;
    const u = (now - burst.t0) / BURST_MS;
    if (u >= 1) {
      for (const it of burst.items) it.el.remove();
      burst.wave.remove();
      burst = null;
      return;
    }
    const k = 1 - (1 - u) ** 3;
    const [cx, cy] = burst.at;
    for (const it of burst.items) {
      it.el.setAttribute("x", String(cx + it.dx * k));
      it.el.setAttribute("y", String(cy + it.dy * k));
      it.el.setAttribute("opacity", (0.75 * (1 - u)).toFixed(2));
    }
    const w = clamp(u / 0.55, 0, 1);
    burst.wave.setAttribute("r", String(12 + 16 * (1 - (1 - w) ** 2)));
    burst.wave.setAttribute("opacity", (0.35 * (1 - w)).toFixed(2));
  }

  /** Dessine l'état au temps now : tracé, étapes allumées, boucle, tête. */
  function render(now: number): void {
    const m = model;
    if (!m) return;
    let u = Number.NEGATIVE_INFINITY;
    let kind: Phase["kind"] | "idle" = "idle";
    let el = -1;
    if (started) {
      el = (now - t0) % m.total;
      const ph = m.phases.find((p) => el < p.t1) ?? at(m.phases, m.phases.length - 1);
      u = ph.u0 + (ph.u1 - ph.u0) * clamp((el - ph.t0) / (ph.t1 - ph.t0), 0, 1);
      kind = ph.kind;
      const lap = Math.floor((now - t0) / m.total);
      if (el >= m.tEnd && burstLap !== lap) {
        burstLap = lap;
        startBurst(now);
      }
    }
    m.lit.style.strokeDashoffset = String(m.len - lenAt(m, u));

    const o = m.orbit;
    const op = o && started ? clamp((el - o.t0) / (o.t1 - o.t0), 0, 1) : 0;
    const looping = kind === "loop" && !!o;
    const oHead = o && looping ? o.at(op) : null;
    if (o) {
      // Pointillé révélé progressivement : autant de points que la longueur parcourue.
      const dots = Math.floor((op * o.len) / 6.1);
      o.lit.style.strokeDasharray = `${"0.1 6 ".repeat(dots)}0 100000`;
      o.label.classList.toggle("af-on", op > 0.4);
    }

    for (const s of m.steps) {
      const on = u >= s.u - 0.5;
      for (const e of s.els) e.classList.toggle("af-on", on);
      const near = !!oHead && Math.abs(vertical ? oHead[1] - s.picAt[1] : oHead[0] - s.picAt[0]) < 26;
      s.pic.classList.toggle("af-pulse", near);
    }

    let hp: XY | null = null;
    if (kind === "travel") hp = P(u, vAt(m, u));
    else if (oHead) hp = oHead;
    m.head.setAttribute("opacity", hp ? "1" : "0");
    m.head.setAttribute("r", looping ? "3" : "5");
    m.head.classList.toggle("af-looping", looping);
    if (hp) {
      m.head.setAttribute("cx", hp[0].toFixed(1));
      m.head.setAttribute("cy", hp[1].toFixed(1));
    }
  }

  function tick(now: number): void {
    // Démarrage dès que le schéma entre dans l'écran, sans IntersectionObserver :
    // une mesure par image jusqu'au départ, puis plus rien.
    if (!started) {
      const r = flow.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.8 && r.bottom > window.innerHeight * 0.15) {
        started = true;
        t0 = now;
      }
    }
    if (started) {
      render(now);
      stepBurst(now);
    }
    if (alive) requestAnimationFrame(tick);
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
