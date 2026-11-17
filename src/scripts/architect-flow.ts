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
const OFFSETS = { h: [-18, 20, -14, 22, -20, 0], v: [-10, 12, -8, 12, -12, 0] } as const;
/** Vitesse du tracé, en px/s. */
const SPEED = { h: 320, v: 260 } as const;
// La boucle fait LOOP_TURNS tours en LOOP_MS.
const LOOP_MS = 2600;
const LOOP_TURNS = 1;
const HOLD_MS = 2400;
const BURST_MS = 1300;
const BURST_COLORS = ["#fff4dc", "#f2622b", "#f4b834", "#3dc4b0", "#f2622b"] as const;
// Desktop : marge identique entre le bord des panneaux et le départ (à gauche) ou
// la pointe de la flèche finale (à droite) ; l'ancre entre de CHIP_IN dans l'étiquette ;
// picto au-dessus de l'ancre.
const PAD = 28;
const CHIP_IN = 40;
// Desktop : les pictos sont alignés sur une rangée, PIC_ROW au-dessus de la ligne de base ;
// l'orbite qui les entoure reste ainsi nettement au-dessus de la courbe.
const PIC_ROW = 80;
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
  /** Longueur, sur le contour, du point de départ de la boucle. */
  s0: number;
  /** Petites flèches de sens : cachées avant la boucle, elles tournent avec elle puis se figent. */
  arrows: SVGPolylineElement[];
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
  /** Pendant la boucle, la bille devient cette flèche. */
  headArrow: SVGPolygonElement;
  steps: StepParts[];
  orbit: Orbit | null;
  phases: Phase[];
  total: number;
  tEnd: number;
  endAt: XY;
  endU: number;
  next: Element[];
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

interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/**
 * Plus petite ellipse (aire a × b), centrée horizontalement en cx, qui contient tous les
 * points de « inside », ne touche aucune boîte de « avoid », et reste à droite de minLeft
 * et sous minTop. Elle est parcourue depuis son point le plus à droite, vers le haut.
 */
function fitEllipse(
  inside: XY[],
  avoid: Box[],
  cx: number,
  minLeft: number,
  minTop: number,
): { d: string; len: number; at: (l: number) => XY; cx: number; top: number } {
  const ys = inside.map((q) => q[1]);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const maxDx = Math.max(...inside.map((q) => Math.abs(q[0] - cx)));
  type Fit = { a: number; b: number; cy: number };
  let best: Fit | null = null;
  let loose: Fit | null = null;
  for (let a = maxDx + 6; a <= Math.max(maxDx + 6, cx - minLeft); a += 2) {
    // Pour ce demi-axe a : le plus petit b, au meilleur centre vertical.
    let fit: Fit = { a, b: Number.POSITIVE_INFINITY, cy: yMin };
    for (let cy = yMin; cy <= yMax; cy += 1) {
      let b = 0;
      for (const [x, y] of inside) b = Math.max(b, Math.abs(y - cy) / Math.sqrt(1 - ((x - cx) / a) ** 2));
      if (b < fit.b) fit = { a, b, cy };
    }
    if (!loose || fit.a * fit.b < loose.a * loose.b) loose = fit;
    if (fit.cy - fit.b < minTop) continue;
    let hits = false;
    for (let k = 0; k < 120 && !hits; k++) {
      const t = (2 * Math.PI * k) / 120;
      const x = cx + a * Math.cos(t);
      const y = fit.cy + fit.b * Math.sin(t);
      hits = avoid.some((r) => x > r.x0 && x < r.x1 && y > r.y0 && y < r.y1);
    }
    if (!hits && (!best || fit.a * fit.b < best.a * best.b)) best = fit;
  }
  const { a, b, cy } = best ?? loose ?? { a: maxDx + 6, b: (yMax - yMin) / 2 + 6, cy: (yMin + yMax) / 2 };
  // Contour échantillonné : longueur et point à une longueur donnée, cohérents avec le pointillé.
  const N = 180;
  const pts = Array.from({ length: N + 1 }, (_, k): XY => {
    const t = (2 * Math.PI * k) / N;
    return [cx + a * Math.cos(t), cy - b * Math.sin(t)];
  });
  const cum = [0];
  for (let k = 1; k <= N; k++) cum.push(at(cum, k - 1) + Math.hypot(at(pts, k)[0] - at(pts, k - 1)[0], at(pts, k)[1] - at(pts, k - 1)[1]));
  const len = at(cum, N);
  const d = `M${pts.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" L")}Z`;
  const pointAt = (l: number): XY => {
    const v = clamp(l, 0, len);
    for (let k = 1; k <= N; k++) {
      if (v <= at(cum, k)) {
        const [p0, p1, c0, c1] = [at(pts, k - 1), at(pts, k), at(cum, k - 1), at(cum, k)];
        const u = (v - c0) / (c1 - c0 || 1);
        return [p0[0] + (p1[0] - p0[0]) * u, p0[1] + (p1[1] - p0[1]) * u];
      }
    }
    return at(pts, 0);
  };
  return { d, len, at: pointAt, cx, top: cy - b };
}

/** Pointillé révélé sur [start, start + amount] d'un contour fermé de longueur len (6,1 px par point). */
function dotted(len: number, start: number, amount: number): string {
  const dots = (n: number): string => "0.1 6 ".repeat(Math.max(0, Math.floor(n / 6.1)));
  if (start + amount <= len) return `0 ${start.toFixed(1)} ${dots(amount)}0 100000`;
  const wrap = start + amount - len;
  const k = Math.floor(wrap / 6.1);
  return `${dots(wrap)}0 ${(start - k * 6.1).toFixed(1)} ${dots(len - start)}0 100000`;
}

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

/** Chevron de 7 px orienté dans le sens de la boucle, à la position q (0 à 1) de son parcours. */
function chevron(o: { at: (p: number) => XY; len: number }, q: number): string {
  const d = 3 / o.len;
  const [px, py] = o.at(q);
  const [ax, ay] = o.at((q + d) % 1);
  const [bx, by] = o.at((q - d + 1) % 1);
  const n = Math.hypot(ax - bx, ay - by) || 1;
  const [ux, uy] = [(ax - bx) / n, (ay - by) / n];
  const pts: XY[] = [
    [px - ux * 4 - uy * 4, py - uy * 4 + ux * 4],
    [px + ux * 3, py + uy * 3],
    [px - ux * 4 + uy * 4, py - uy * 4 - ux * 4],
  ];
  return pts.map((v) => `${v[0].toFixed(1)},${v[1].toFixed(1)}`).join(" ");
}

/** Pointe de flèche pleine (tête de la boucle), orientée dans le sens du tour, à la position q. */
function arrowhead(o: { at: (p: number) => XY; len: number }, q: number): string {
  const d = 3 / o.len;
  const [px, py] = o.at(q);
  const [ax, ay] = o.at((q + d) % 1);
  const [bx, by] = o.at((q - d + 1) % 1);
  const n = Math.hypot(ax - bx, ay - by) || 1;
  const [ux, uy] = [(ax - bx) / n, (ay - by) / n];
  const pts: XY[] = [
    [px + ux * 5, py + uy * 5],
    [px - ux * 4 - uy * 4.5, py - uy * 4 + ux * 4.5],
    [px - ux * 4 + uy * 4.5, py - uy * 4 - ux * 4.5],
  ];
  return pts.map((v) => `${v[0].toFixed(1)},${v[1].toFixed(1)}`).join(" ");
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
    const base = vertical ? V_LINE : Number.parseFloat(cs.getPropertyValue("--af-base")) || 200;
    const width = vertical ? flow.offsetWidth : flow.scrollWidth;
    const height = flow.offsetHeight;
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

    // Ancres : dans l'étiquette de l'étape, à CHIP_IN de son bord gauche (desktop),
    // ou à mi-hauteur de l'étiquette (mobile). La dernière, l'anneau du go-live, est sur la ligne de base.
    const anchors = steps.map((s, i) => ({
      u: vertical ? s.offsetTop + 21 : s.offsetLeft + CHIP_IN,
      v: base + at(offs, i),
    }));
    const start = { u: vertical ? 8 : PAD, v: base };
    const pts = [start, ...anchors];
    const last = at(anchors, anchors.length - 1);

    const b0 = P(start.u, base);
    const b1 = P(last.u, base);
    svgEl("line", { x1: b0[0], y1: b0[1], x2: b1[0], y2: b1[1], class: "af-base" }, root);
    // Après le go-live, la ligne continue jusqu'à une flèche : le projet continue de vivre.
    const tip = vertical ? height - 14 : width - PAD;
    const n0 = P(last.u + 14, base);
    const n1 = P(tip - 3, base);
    const next = svgEl("line", { x1: n0[0], y1: n0[1], x2: n1[0], y2: n1[1], class: "af-next" }, root);
    const arrowPts = [P(tip - 7, base - 5), P(tip, base), P(tip - 7, base + 5)].map((q) => q.join(",")).join(" ");
    const arrow = svgEl("polyline", { points: arrowPts, class: "af-arrow" }, root);

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

    // Boucle d'itération : une ellipse en pointillé qui englobe les deux étapes,
    // pictos et points sur la courbe compris, sans toucher les étiquettes.
    let orbit: Orbit | null = null;
    const from = steps.findIndex((s) => s.dataset["loopTo"] !== undefined);
    const picAt = (i: number): XY => {
      const a = at(anchors, i);
      return vertical ? [V_PIC, a.u] : [a.u, base - PIC_ROW];
    };
    if (from > 0) {
      const to = Number.parseInt(at(steps, from).dataset["loopTo"] ?? "0", 10);
      const fa = at(anchors, from);
      const ga = at(anchors, to);
      const [fx, fy] = picAt(from);
      const [gx, gy] = picAt(to);
      // Ce que l'ellipse doit englober : les deux pictos et les deux points sur la courbe.
      const ring = (c: XY, r: number, n: number): XY[] =>
        Array.from({ length: n }, (_, k): XY => [c[0] + r * Math.cos((2 * Math.PI * k) / n), c[1] + r * Math.sin((2 * Math.PI * k) / n)]);
      const inside = [
        ...ring([fx, fy], picR + 6, 16),
        ...ring([gx, gy], picR + 6, 16),
        ...ring(P(fa.u, fa.v), 10, 8),
        ...ring(P(ga.u, ga.v), 10, 8),
      ];
      // Ce qu'elle ne doit pas toucher : les étiquettes de toutes les étapes.
      const avoid = steps.map((s) => {
        const t = s.querySelector<HTMLElement>(".af-tag");
        const x = s.offsetLeft + (t?.offsetLeft ?? 0);
        const y = s.offsetTop + (t?.offsetTop ?? 0);
        return { x0: x - 4, y0: y - 4, x1: x + (t?.offsetWidth ?? 0) + 4, y1: y + (t?.offsetHeight ?? 0) + 4 };
      });
      const xs = inside.map((q) => q[0]);
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
      const rr = fitEllipse(inside, avoid, cx, vertical ? 4 : 10, vertical ? 0 : 52);
      // La boucle part du point de son contour le plus proche de l'étape « from ».
      const fp = P(fa.u, fa.v);
      let s0 = 0;
      let best = Number.POSITIVE_INFINITY;
      for (let k = 0; k < 240; k++) {
        const q = rr.at((k / 240) * rr.len);
        const dd = Math.hypot(q[0] - fp[0], q[1] - fp[1]);
        if (dd < best) [best, s0] = [dd, (k / 240) * rr.len];
      }
      const lab: XY = vertical ? [V_PIC, (fy + gy) / 2 - 6] : [rr.cx, rr.top - 18];
      svgEl("path", { d: rr.d, class: "af-orbit" }, root);
      const olit = svgEl("path", { d: rr.d, class: "af-orbit-lit" }, root);
      // Deux chevrons de sens, posés pendant le rendu (voir chevron()).
      const arrows = [0, 1].map(() => svgEl("polyline", { class: "af-orbit-arrow" }, root));
      const label = div("af-loop-label", flow, { left: lab[0], top: lab[1] });
      label.textContent = flow.dataset["loopLabel"] ?? "";
      made.push(label);
      orbit = {
        lit: olit,
        len: rr.len,
        s0,
        arrows,
        at: (p) => rr.at((s0 + p * rr.len) % rr.len),
        label,
        from,
        to,
        t0: 0,
        t1: 0,
      };
    }

    const head = svgEl("circle", { r: 5, class: "af-head", opacity: 0 }, root);
    const headArrow = svgEl("polygon", { class: "af-head-arrow", opacity: 0 }, root);
    const fxLayer = svgEl("g", {}, root);

    const startPt = P(start.u, start.v);
    made.push(div("af-start", flow, { left: startPt[0], top: startPt[1] }));

    // Par étape : carré (anneau pour le go-live), trait vers l'étiquette, picto et son trait.
    const parts: StepParts[] = anchors.map((a, i) => {
      const s = at(steps, i);
      const isEnd = i === anchors.length - 1;
      const r = isEnd ? 8 : 4;
      const [ax, ay] = P(a.u, a.v);
      const sq = div(isEnd ? "af-sq af-end" : "af-sq", flow, { left: ax, top: ay });

      const lead = vertical
        ? div("af-lead", flow, { left: a.v + r + 1, top: a.u, width: Math.max(0, V_CHIP - a.v - r - 1), height: 1 })
        : div("af-lead", flow, { left: a.u, top: a.v + r + 1, width: 1, height: Math.max(0, s.offsetTop - a.v - r - 1) });

      const pAt = picAt(i);
      const pic = div("af-pic", flow, { left: pAt[0], top: pAt[1] });
      pic.appendChild(iconSvg(s.dataset["icon"] ?? ""));
      const picLead = vertical
        ? div("af-lead af-pic-lead", flow, { left: V_PIC + picR, top: a.u, width: Math.max(0, a.v - 6 - V_PIC - picR), height: 1 })
        : div("af-lead af-pic-lead", flow, { left: a.u, top: pAt[1] + picR, width: 1, height: Math.max(0, a.v - 6 - pAt[1] - picR) });

      const els = [s, sq, lead, pic, picLead];
      made.push(sq, lead, pic, picLead);
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
      headArrow,
      steps: parts,
      orbit,
      phases,
      total: t,
      tEnd,
      endAt: P(last.u, last.v),
      endU: last.u,
      next: [next, arrow],
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
    for (const e of m.next) e.classList.toggle("af-on", u >= m.endU - 0.5);

    const o = m.orbit;
    const op = o && started ? clamp((el - o.t0) / (o.t1 - o.t0), 0, 1) : 0;
    const looping = kind === "loop" && !!o;
    const oHead = o && looping ? o.at((op * LOOP_TURNS) % 1) : null;
    if (o) {
      // Pointillé révélé progressivement, depuis le départ de la boucle.
      // Le pointillé se révèle pendant le premier tour, puis reste entier.
      o.lit.style.strokeDasharray = dotted(o.len, o.s0, Math.min(1, op * LOOP_TURNS) * o.len);
      // Flèches : cachées avant la boucle ; elles font un tour avec la tête, à un demi-tour
      // d'écart ; à la fin elles se figent aux trois quarts et au quart du parcours.
      o.arrows.forEach((el, k) => {
        const q = (((op - 0.25 - 0.5 * k) % 1) + 1) % 1;
        el.setAttribute("points", chevron(o, q));
        el.classList.toggle("af-on", op > 0);
      });
      o.label.classList.toggle("af-on", op > 0.4);
    }

    for (const s of m.steps) {
      const on = u >= s.u - 0.5;
      for (const e of s.els) e.classList.toggle("af-on", on);
      const near = !!oHead && Math.abs(vertical ? oHead[1] - s.picAt[1] : oHead[0] - s.picAt[0]) < 26;
      s.pic.classList.toggle("af-pulse", near);
    }

    // Sur le chemin : une bille. Dans la boucle : une flèche orientée dans le sens du tour.
    const hp: XY | null = kind === "travel" ? P(u, vAt(m, u)) : null;
    m.head.setAttribute("opacity", hp ? "1" : "0");
    if (hp) {
      m.head.setAttribute("cx", hp[0].toFixed(1));
      m.head.setAttribute("cy", hp[1].toFixed(1));
    }
    m.headArrow.setAttribute("opacity", o && looping ? "1" : "0");
    if (o && looping) m.headArrow.setAttribute("points", arrowhead(o, (op * LOOP_TURNS) % 1));
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
