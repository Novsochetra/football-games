// Shared pieces for the MERIDIAN THREAD shots (generic helpers live in ../kit and ../../art/fx). Shot briefs: SPEC.md.
//
// What lives here (the move's own look; no other special uses these):
//   PAL / HEX           jade, emerald, pearl on manga ink and warm paper (+ gold for the HUD only)
//   LAYOUT / PATH       one table of field positions and the ball's Catmull-Rom path, fed to every view
//   meridianGrade       the post settings every shot uses (bloom 0.7 / thresh 0.72, grain 0.05, sat 1)
//   threadLine          the taut jade thread (ink under-stroke, emerald halo, jade body, pearl core),
//                       optional running stitch and plucked standing wave
//   needleEye           the almond (vesica) eye that opens like an eyelid
//   crossStitch         the target X (replaces every ring target)
//   needlePoint         the pearl needle of light
//   stitchTitle         the running-stitch title reveal (shot 1)
//   PAGE / MangaPage    shot 4's three-panel manga page with page-pans and frozen snapshots
//   placeholderShot     the labelled stand-in each shot file uses until it is produced

import type { Env, Shot } from '../timeline';
import type { FxState } from '../../engine/post';
import { VW, VH } from '../../engine/camera';
import { clamp, ease, lerp, type RGB } from '../../engine/math';
import { drawGlow, glowOf } from '../../engine/particles';
import { PIXEL_FONT, TITLE_FONT, pixelText, prepareInk, slamTitle, type TrailPt } from '../../art/fx';
import { renderPuppet, type Kit, type Pose } from '../../art/puppet';

export * from '../kit';
export { drawNo10, drawNo10Boxed, no10, no10Anchor, no10Final, no10Point, warmNo10Boxed, NO10, type No10Key } from '../../art/no10';
export { drawNo7, drawNo7Boxed, no7, no7Anchor, no7Final, no7Point, warmNo7, NO7, type No7Key } from '../../art/no7';
export { drawDownPitch, projectDecal, drawFieldBackdrop, drawGoal, FIELD, DOWN_PITCH_VIEW, type DownPitchView, type Projected } from '../../art/stadium';
export {
  inkGrade, inkNegative, prepareInk, screentone, mangaPanels, panelPoly, panelFreeze, inkSfx, spinMarks, inkSmear, INK_PAGE,
  type MangaPanel, type InkRestore,
} from '../../art/fx';
export { drawFrontFigure, frontFigure, drawGrassFore, prepareGrassFore } from '../../art/figures';
export { THREAD_NOTES } from '../../engine/audio';

export const SHOT_NAME = 'MERIDIAN THREAD';

// ---------------------------------------------------------------- palette

export const PAL: Record<'jade' | 'emerald' | 'pearl' | 'ink' | 'paper' | 'tone' | 'gold', RGB> = {
  jade: [47, 224, 138],
  emerald: [11, 143, 88],
  pearl: [251, 246, 234],
  ink: [13, 13, 20],
  paper: [239, 231, 214],
  tone: [119, 113, 107],
  gold: [252, 185, 76],
};
export const HEX = {
  jade: '#2FE08A',
  emerald: '#0B8F58',
  pearl: '#FBF6EA',
  ink: '#0D0D14',
  paper: '#EFE7D6',
  tone: '#77716B',
  gold: '#FCB94C',
} as const;
/** lensFlare tint (never the default cyan). */
export const JADE_FLARE: RGB = [150, 255, 200];
/** fx.flash colour: always paper, never pure white. */
export const PAPER_FLASH: RGB = [239, 231, 214];
/** Fade-out colour of shot 6 (the result view fades up from it). */
export const FADE_RGB: RGB = [8, 4, 14];

/**
 * Post settings for every MERIDIAN THREAD shot: bloom 0.7, paper grain 0.05, sat 1 (the grade is done on the canvas),
 * contrast 1.08 in inked shots. Bloom threshold: the brief's intent is "paper whites never bloom", but the bright pass
 * is smoothstep(thresh, thresh + 0.3, max channel) and paper's max channel is 239/255 = 0.937, so at 0.72 paper keeps
 * ~78% of its bloom and every paper area blows out to pure white. The default 0.94 keeps paper warm (pearl cores,
 * flares and sparkles at 1.0 still bloom a little). Pass 0.72 to follow the brief's number literally.
 */
export function meridianGrade(fx: FxState, inked = true, bloomThresh = 0.94) {
  fx.bloom = 0.7;
  fx.bloomThresh = bloomThresh;
  fx.grain = 0.05;
  fx.sat = 1;
  if (inked) fx.contrast = 1.08;
}

/** A paper flash (`fx.flash` in paper). */
export function paperFlash(fx: FxState, a: number) {
  if (a <= 0) return;
  fx.flash = Math.max(fx.flash, clamp(a));
  fx.flashColor = PAPER_FLASH;
}

// ---------------------------------------------------------------- layout and path (field x, z; 10 px ~ 1 m)

export interface XZ {
  x: number;
  z: number;
}
const xz = (x: number, z: number): XZ => ({ x, z });

/** One table for the field scenario, shot 2's perspective, shot 4's panels and shot 5's wide. */
export const LAYOUT = {
  no10Start: xz(760, 264),
  strike: xz(906, 264),
  /** D1, the presser: steps out from d1 to d1Out at field t 0.8 s; poke-tackles in shot 4. */
  d1: xz(1010, 258),
  d1Out: xz(960, 257),
  d2: xz(1030, 236),
  d3: xz(1034, 268),
  /** D4, near-side full-back: the offside line. */
  d4: xz(1050, 306),
  keeper: xz(1168, 258),
  no7Start: xz(880, 342),
  /** No.7 when the ball is struck: onside, behind D4's x. */
  no7Strike: xz(1000, 334),
  /** Where the ball meets No.7's stride (the cross-stitch X). */
  target: xz(1112, 298),
  /** Inside the far post. */
  finish: xz(1222, 224),
} as const;

/** The path's control points: strike, the three needle eyes, the target. */
export const PATH_PTS: readonly XZ[] = [xz(906, 264), xz(960, 248), xz(1032, 252), xz(1068, 284), xz(1112, 298)];

function catmull(p0: number, p1: number, p2: number, p3: number, t: number) {
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

function buildPath() {
  const P = PATH_PTS;
  const n = P.length;
  const SUB = 64;
  const pts: XZ[] = [];
  for (let i = 0; i < n - 1; i++) {
    const a = P[Math.max(0, i - 1)], b = P[i], c = P[i + 1], d = P[Math.min(n - 1, i + 2)];
    for (let k = 0; k < SUB; k++) {
      const t = k / SUB;
      pts.push(xz(catmull(a.x, b.x, c.x, d.x, t), catmull(a.z, b.z, c.z, d.z, t)));
    }
  }
  pts.push(P[n - 1]);
  const s = [0];
  for (let i = 1; i < pts.length; i++) s.push(s[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z));
  const L = s[s.length - 1];
  const knots = P.map((_, i) => s[i * SUB] / L);
  return { pts, s, L, knots };
}
const PB = buildPath();

/** The ball path (Catmull-Rom through PATH_PTS), by arc-length fraction u (0 = strike, 1 = target). */
export const PATH = {
  /** Length in field px (~21 m). */
  length: PB.L,
  /** Arc-length fractions of the control points: [strike, E1, E2, E3, target]. */
  knots: PB.knots,
  /** Arc-length fractions of the three needle eyes. */
  eyes: [PB.knots[1], PB.knots[2], PB.knots[3]] as const,
  /** Field point at arc-length fraction u (clamped). */
  at(u: number): XZ {
    const d = clamp(u) * PB.L;
    let lo = 0, hi = PB.s.length - 1;
    while (hi - lo > 1) {
      const m = (lo + hi) >> 1;
      if (PB.s[m] <= d) lo = m;
      else hi = m;
    }
    const k = (d - PB.s[lo]) / Math.max(1e-6, PB.s[hi] - PB.s[lo]);
    return xz(lerp(PB.pts[lo].x, PB.pts[hi].x, k), lerp(PB.pts[lo].z, PB.pts[hi].z, k));
  },
  /** Unit direction of travel (field x, z) at u. */
  dir(u: number): XZ {
    const a = PATH.at(u - 0.005), b = PATH.at(u + 0.005);
    const l = Math.hypot(b.x - a.x, b.z - a.z) || 1;
    return xz((b.x - a.x) / l, (b.z - a.z) / l);
  },
  /** Field points from u0 to u1, about every `step` field px (both ends included). */
  points(u0 = 0, u1 = 1, step = 4): XZ[] {
    const a = clamp(Math.min(u0, u1)), b = clamp(Math.max(u0, u1));
    const n = Math.max(1, Math.ceil(((b - a) * PB.L) / step));
    const out: XZ[] = [];
    for (let i = 0; i <= n; i++) out.push(PATH.at(lerp(a, b, i / n)));
    return out;
  },
};

// ---------------------------------------------------------------- thread

/** Polyline slice by arc-length fraction [a, b] (the thread unspooling, the stitch line drawing itself). */
export function sliceThread(pts: readonly TrailPt[], a: number, b: number): TrailPt[] {
  const n = pts.length;
  if (n < 2) return pts.slice();
  const s = [0];
  for (let i = 1; i < n; i++) s.push(s[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  const L = s[n - 1] || 1;
  const d0 = clamp(Math.min(a, b)) * L, d1 = clamp(Math.max(a, b)) * L;
  const at = (d: number): TrailPt => {
    let i = 1;
    while (i < n - 1 && s[i] < d) i++;
    const k = (d - s[i - 1]) / Math.max(1e-6, s[i] - s[i - 1]);
    return { x: lerp(pts[i - 1].x, pts[i].x, clamp(k)), y: lerp(pts[i - 1].y, pts[i].y, clamp(k)) };
  };
  const out: TrailPt[] = [at(d0)];
  for (let i = 0; i < n; i++) if (s[i] > d0 && s[i] < d1) out.push(pts[i]);
  out.push(at(d1));
  return out;
}

export interface Pluck {
  /** Displacement amplitude (px, perpendicular to the line). */
  amp: number;
  /** Vibration phase (radians, e.g. t * 60); each segment runs faster the shorter it is (frets on a string). */
  phase: number;
  /** Interior nodes: a count (evenly spaced) or arc-length fractions (the needle eyes). Default 0: one lobe. */
  nodes?: number | readonly number[];
}

/** The plucked standing wave: the polyline displaced perpendicular to itself, zero at the ends and at every node. */
export function pluckLine(pts: readonly TrailPt[], p: Pluck): TrailPt[] {
  const n = pts.length;
  if (n < 2 || p.amp === 0) return pts.slice();
  const s = [0];
  for (let i = 1; i < n; i++) s.push(s[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  const L = s[n - 1] || 1;
  const inner = typeof p.nodes === 'number' ? Array.from({ length: p.nodes }, (_, k) => (k + 1) / (p.nodes as number + 1)) : [...(p.nodes ?? [])];
  const bounds = [0, ...inner.filter((v) => v > 0 && v < 1).sort((a, b) => a - b), 1];
  const avg = 1 / (bounds.length - 1);
  return pts.map((q, i) => {
    const f = s[i] / L;
    let k = 0;
    while (k < bounds.length - 2 && f > bounds[k + 1]) k++;
    const a = bounds[k], b = bounds[k + 1];
    const local = (f - a) / Math.max(1e-6, b - a);
    const seg = b - a;
    const d = p.amp * Math.sqrt(seg / avg) * Math.sin(Math.PI * local) * Math.cos(p.phase * (avg / Math.max(1e-3, seg)));
    const A = pts[Math.max(0, i - 1)], B = pts[Math.min(n - 1, i + 1)];
    const tl = Math.hypot(B.x - A.x, B.y - A.y) || 1;
    return { x: q.x - ((B.y - A.y) / tl) * d, y: q.y + ((B.x - A.x) / tl) * d };
  });
}

export interface ThreadOpts {
  /** Running stitch: `true` = 14 px dashes and 6 px dips with ink needle holes; or tune dash / dip / phase (px). */
  stitch?: boolean | { dash?: number; dip?: number; phase?: number };
  /** Plucked standing wave (see Pluck). */
  pluck?: Pluck;
  /** Emerald halo strength (default 1; 0 = none). */
  halo?: number;
  /** Pearl core (default true; only drawn when w >= 2). */
  core?: boolean;
  /** Ink under-stroke (default true). */
  under?: boolean;
}

/**
 * The thread: an ink under-stroke (w + 2, normal blend: it is also the manga outline, so the glow never blows out on
 * paper), an emerald halo (additive, low alpha), a jade body (w) and a pearl core. pts in the current transform.
 */
export function threadLine(ctx: CanvasRenderingContext2D, pts: readonly TrailPt[], w = 2, alpha = 1, o: ThreadOpts = {}) {
  if (pts.length < 2 || alpha <= 0) return;
  const P = o.pluck ? pluckLine(pts, o.pluck) : pts;
  const st = o.stitch ? (o.stitch === true ? {} : o.stitch) : null;
  const dash = st?.dash ?? 14, dip = st?.dip ?? 6, phase = st?.phase ?? 0;
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(P[0].x, P[0].y);
    for (let i = 1; i < P.length; i++) ctx.lineTo(P[i].x, P[i].y);
  };
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = st ? 'butt' : 'round';
  if (st) {
    ctx.setLineDash([dash, dip]);
    ctx.lineDashOffset = phase;
  }
  const a = clamp(alpha);
  if (o.under !== false) {
    ctx.globalAlpha = a;
    ctx.strokeStyle = HEX.ink;
    ctx.lineWidth = w + 2;
    path();
    ctx.stroke();
  }
  const halo = o.halo ?? 1;
  if (halo > 0) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = clamp(a * 0.22 * halo);
    ctx.strokeStyle = HEX.emerald;
    ctx.lineWidth = w * 3 + 2;
    path();
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.globalAlpha = a;
  ctx.strokeStyle = HEX.jade;
  ctx.lineWidth = w;
  path();
  ctx.stroke();
  // Pearl core (thin threads under 2 px skip it, or the pearl would swallow the jade).
  if (o.core !== false && w >= 2) {
    ctx.strokeStyle = HEX.pearl;
    ctx.lineWidth = Math.max(0.8, w * 0.4);
    path();
    ctx.stroke();
  }
  ctx.setLineDash([]);
  // Needle holes: two 1 px ink dots at each dip (where the thread goes under and comes back up).
  if (st) {
    ctx.fillStyle = HEX.ink;
    const s = [0];
    for (let i = 1; i < P.length; i++) s.push(s[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y));
    const L = s[s.length - 1];
    const per = dash + dip;
    const at = (d: number) => {
      let i = 1;
      while (i < P.length - 1 && s[i] < d) i++;
      const k = clamp((d - s[i - 1]) / Math.max(1e-6, s[i] - s[i - 1]));
      return [lerp(P[i - 1].x, P[i].x, k), lerp(P[i - 1].y, P[i].y, k)];
    };
    const start = ((phase % per) + per) % per;
    for (let d = dash - start; d < L; d += per) {
      for (const dd of [d, d + dip]) {
        if (dd <= 0 || dd >= L) continue;
        const [x, y] = at(dd);
        ctx.fillRect(Math.round(x - 0.5), Math.round(y - 0.5), 1, 1);
      }
    }
  }
  ctx.restore();
}

/**
 * A needle eye: a vesica of two thin jade arcs (ink outlined, pearl points) that opens like an eyelid.
 * len = tip-to-tip length, open 0..1, rot = axis angle (0 = horizontal), squash < 1 flattens it (perspective / ground).
 */
export function needleEye(
  ctx: CanvasRenderingContext2D, x: number, y: number, len: number, open: number, rot = 0, alpha = 1, squash = 1,
  o: { fill?: number } = {},
) {
  const a = clamp(alpha);
  if (a <= 0 || len <= 0) return;
  const h = len * 0.24 * clamp(open);
  const c = Math.cos(rot), s = Math.sin(rot);
  const T = (u: number, v: number): [number, number] => [x + u * c - v * s, y + (u * s + v * c) * squash];
  const arc = (sign: number) => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 14; i++) {
      const t = i / 14;
      const u = lerp(-len / 2, len / 2, t);
      pts.push(T(u, sign * h * 4 * t * (1 - t)));
    }
    return pts;
  };
  const up = arc(-1), dn = arc(1);
  const line = (pts: [number, number][]) => {
    ctx.beginPath();
    pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  };
  ctx.save();
  ctx.globalAlpha = a;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  if (h > 0.6 && (o.fill ?? 0.16) > 0) {
    ctx.beginPath();
    up.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    for (let i = dn.length - 1; i >= 0; i--) ctx.lineTo(dn[i][0], dn[i][1]);
    ctx.closePath();
    ctx.globalAlpha = a * (o.fill ?? 0.16);
    ctx.fillStyle = HEX.emerald;
    ctx.fill();
    ctx.globalAlpha = a;
  }
  for (const pts of [up, dn]) {
    ctx.strokeStyle = HEX.ink;
    ctx.lineWidth = 3;
    line(pts);
    ctx.stroke();
  }
  for (const pts of [up, dn]) {
    ctx.strokeStyle = HEX.jade;
    ctx.lineWidth = 1.4;
    line(pts);
    ctx.stroke();
  }
  ctx.fillStyle = HEX.pearl;
  for (const [px, py] of [T(-len / 2, 0), T(len / 2, 0)]) ctx.fillRect(Math.round(px - 1), Math.round(py - 1), 2, 2);
  ctx.restore();
}

/** The cross-stitch X target: two stitched strokes (ink outline, jade body) with a pearl knot. s = half-size. */
export function crossStitch(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, alpha = 1, squash = 1, rot = 0) {
  const a = clamp(alpha);
  if (a <= 0 || s <= 0) return;
  const c = Math.cos(rot), sn = Math.sin(rot);
  const T = (u: number, v: number): [number, number] => [x + u * c - v * sn, y + (u * sn + v * c) * squash];
  const arms = [[T(-s, -s), T(s, s)], [T(s, -s), T(-s, s)]];
  ctx.save();
  ctx.globalAlpha = a;
  ctx.lineCap = 'butt';
  const st = Math.max(2, s * 0.55), gap = Math.max(1, s * 0.16);
  for (const [w, col] of [[4, HEX.ink], [2, HEX.jade]] as const) {
    ctx.setLineDash([st, gap]);
    ctx.lineWidth = w;
    ctx.strokeStyle = col;
    for (const [p, q] of arms) {
      ctx.beginPath();
      ctx.moveTo(p[0], p[1]);
      ctx.lineTo(q[0], q[1]);
      ctx.stroke();
    }
  }
  ctx.setLineDash([]);
  ctx.fillStyle = HEX.ink;
  ctx.fillRect(Math.round(x - 2), Math.round(y - 2), 4, 4);
  ctx.fillStyle = HEX.pearl;
  ctx.fillRect(Math.round(x - 1), Math.round(y - 1), 2, 2);
  ctx.restore();
}

/** The pearl needle of light: a short ink streak behind (along -ang), an emerald halo and a 3 px pearl point. */
export function needlePoint(ctx: CanvasRenderingContext2D, x: number, y: number, ang = 0, alpha = 1, streak = 12) {
  const a = clamp(alpha);
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = HEX.ink;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - Math.cos(ang) * streak, y - Math.sin(ang) * streak);
  ctx.stroke();
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.emerald), x, y, 7, a * 0.8);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = a;
  ctx.fillStyle = HEX.pearl;
  ctx.fillRect(Math.round(x - 1.5), Math.round(y - 1.5), 3, 3);
  ctx.restore();
}

export interface StitchTitleOpts {
  /** Seconds the needle takes from x0 to x1 (default 0.53: shot 1's 0.42-0.95). */
  dur?: number;
  /** Needle run (default: 40 px either side of the title). */
  x0?: number;
  x1?: number;
  /** 0..1: the taut yank (letters jerk 2 px onto the line). */
  yank?: number;
  /** The plucked line (letters ride it). */
  pluck?: Pluck;
  alpha?: number;
  skew?: number;
  /** Draw the running-stitch thread behind the letters (default true). */
  thread?: boolean;
}

/**
 * The stitched title (shot 1): a needle runs one straight line across at baseline y; each letter of `text` pops in
 * (scale 0 -> 1, pulled 3 px down onto the line) exactly as the needle passes its centre; behind it the thread dips
 * under the paper every half-letter (a running stitch with needle holes). Letter style: ink fill, 2 px jade inner
 * stroke, 3 px paper outer stroke, skew -0.12. t = seconds since the needle started. Returns the needle position:
 * draw needlePoint() there while it is on the run.
 */
export function stitchTitle(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, t: number, o: StitchTitleOpts = {}) {
  const dur = o.dur ?? 0.53;
  const skew = o.skew ?? -0.12;
  const a = clamp(o.alpha ?? 1);
  ctx.save();
  ctx.font = `${size}px ${TITLE_FONT}`;
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width + size * 0.03);
  const total = widths.reduce((p, q) => p + q, 0);
  const left = x - total / 2;
  const x0 = o.x0 ?? left - 40, x1 = o.x1 ?? left + total + 40;
  const speed = (x1 - x0) / Math.max(1e-3, dur);
  const nx = lerp(x0, x1, clamp(t / dur));
  const yank = clamp(o.yank ?? 0);
  const disp = (px: number) => {
    if (!o.pluck) return 0;
    const f = clamp((px - x0) / (x1 - x0));
    const pl = pluckLine([{ x: x0, y: 0 }, { x: lerp(x0, x1, f), y: 0 }, { x: x1, y: 0 }], o.pluck);
    return pl[1].y;
  };
  if (o.thread !== false && t > 0 && a > 0) {
    const pts: TrailPt[] = [];
    const end = Math.min(nx, x1);
    for (let px = x0; px < end; px += 6) pts.push({ x: px, y: y + disp(px) });
    pts.push({ x: end, y: y + disp(end) });
    const half = Math.max(4, total / chars.length / 2);
    threadLine(ctx, pts, 2, a, { stitch: { dash: half, dip: half * 0.6, phase: 0 }, halo: 0.8 });
  }
  let cx = left;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  chars.forEach((c, i) => {
    const w = widths[i];
    const mid = cx + w / 2;
    cx += w;
    if (c === ' ' || nx < mid) return;
    const lt = (nx - mid) / speed + Math.max(0, t - dur);
    const p = clamp(lt / 0.09);
    const sc = ease.outBack(p);
    const dy = -3 * (1 - ease.outCubic(clamp(lt / 0.12))) + 2 * yank + disp(mid);
    ctx.save();
    ctx.globalAlpha = a * clamp(lt / 0.03);
    ctx.translate(mid, y + dy);
    ctx.transform(1, 0, skew, 1, 0, 0);
    ctx.scale(Math.max(0.001, sc), Math.max(0.001, sc));
    ctx.strokeStyle = HEX.paper;
    ctx.lineWidth = 10;
    ctx.strokeText(c, 0, 0);
    ctx.strokeStyle = HEX.jade;
    ctx.lineWidth = 4;
    ctx.strokeText(c, 0, 0);
    ctx.fillStyle = HEX.ink;
    ctx.fillText(c, 0, 0);
    ctx.restore();
  });
  ctx.restore();
  return { needleX: nx, needleY: y + disp(nx), x0, x1, width: total, running: t >= 0 && t < dur };
}

// ---------------------------------------------------------------- shot 4: the manga page

export interface PagePanel {
  x0: number;
  x1: number;
  /** Slant in degrees (layout, not a camera roll). */
  deg: number;
  /** Live window (shot-local seconds). */
  live: readonly [number, number];
  /** Page-space polygon. */
  poly: [number, number][];
  /** Page-space left/top of the 640 x 360 view while this panel is live (its content is drawn in this view's space). */
  view: readonly [number, number];
}

const PAGE_TOP = 18, PAGE_BOT = 342;
const mkPanel = (x0: number, x1: number, deg: number, live: readonly [number, number]): PagePanel => {
  const cx = (x0 + x1) / 2, cy = (PAGE_TOP + PAGE_BOT) / 2;
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  const hw = (x1 - x0) / 2, hh = (PAGE_BOT - PAGE_TOP) / 2;
  const poly = ([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]] as const).map(([u, v]) => [cx + u * c - v * s, cy + u * s + v * c] as [number, number]);
  return { x0, x1, deg, live, poly, view: [clamp(cx - VW / 2, 0, 1280 - VW), 0] };
};

/** Shot 4's page (page space 1280 x 360; the view is a 640 x 360 window at zoom 1 while a panel plays). */
export const PAGE = {
  w: 1280,
  h: 360,
  panels: [mkPanel(20, 540, -3, [0, 0.68]), mkPanel(560, 900, 4, [0.8, 1.4]), mkPanel(920, 1260, -2, [1.52, 2.1])] as const,
  /** Page-pans (0.12 s, inOutCubic, no zoom, no roll). */
  pans: [[0.68, 0.8], [1.4, 1.52]] as const,
  /** The whole page: zoom 1 -> 0.5 over 0.18 s (outCubic) from 2.10. */
  whole: [2.1, 2.28] as const,
  /** Page-space centre and zoom of the view at shot-local t. */
  view(t: number): { cx: number; cy: number; zoom: number } {
    const P = PAGE.panels;
    const c = (i: number) => P[i].view[0] + VW / 2;
    let cx = c(0);
    if (t >= PAGE.pans[0][0]) cx = lerp(c(0), c(1), ease.inOutCubic(clamp((t - PAGE.pans[0][0]) / (PAGE.pans[0][1] - PAGE.pans[0][0]))));
    if (t >= PAGE.pans[1][0]) cx = lerp(c(1), c(2), ease.inOutCubic(clamp((t - PAGE.pans[1][0]) / (PAGE.pans[1][1] - PAGE.pans[1][0]))));
    let zoom = 1;
    if (t >= PAGE.whole[0]) {
      const k = ease.outCubic(clamp((t - PAGE.whole[0]) / (PAGE.whole[1] - PAGE.whole[0])));
      cx = lerp(cx, PAGE.w / 2, k);
      zoom = lerp(1, 0.5, k);
    }
    return { cx, cy: VH / 2, zoom };
  },
  /** Index of the panel live at t (-1 during a page-pan or the whole page). */
  liveAt(t: number): number {
    return PAGE.panels.findIndex((p) => t >= p.live[0] && t < p.live[1]);
  },
};

/** Run fn with env.ctx / env.screen / env.world redirected: screen() = `m` (device matrix of the panel view), world() = m x camera. */
function withSpace(env: Env, ctx: CanvasRenderingContext2D, m: DOMMatrix, fn: () => void) {
  const saved = { ctx: env.ctx, screen: env.screen, world: env.world };
  const S = ctx.canvas.width / VW;
  env.ctx = ctx;
  env.screen = () => {
    ctx.setTransform(m);
    ctx.imageSmoothingEnabled = false;
  };
  env.world = () => {
    env.cam.apply(ctx, S);
    const camM = ctx.getTransform();
    ctx.setTransform(m.multiply(new DOMMatrix().scale(1 / S, 1 / S).multiply(camM)));
    ctx.imageSmoothingEnabled = false;
  };
  try {
    env.screen();
    fn();
  } finally {
    env.ctx = saved.ctx;
    env.screen = saved.screen;
    env.world = saved.world;
  }
}

/**
 * Draws one panel's content in that panel's own view space (VW x VH logical px, as if the panel were on screen at zoom 1):
 * env.ctx, env.screen() and env.world() are redirected for the call. `frozen` = the panel has finished: push it to full
 * ink (inkGrade 1) except the thread. Must be a pure function of tp for frozen panels (snapshots are rebuilt on seek).
 */
export type PanelDraw = (env: Env, i: number, tp: number, frozen: boolean) => void;

/**
 * Shot 4's manga page: the paper, each panel (live inside its clip, or blitted from its frozen snapshot), the paper
 * gutters and ink borders. Two snapshot canvases (panels 1 and 2) are allocated in prepare() and rebuilt lazily after
 * invalidate() (call it in init: a seek into panel 2 or 3 then re-renders the earlier panels' last frames exactly).
 * Panel 3 is drawn live (frozen at its end time) during the whole-page view, so at most one panel renders puppets.
 */
export class MangaPage {
  private snaps: (HTMLCanvasElement | null)[] = [null, null];
  private ok = [false, false];

  /** Allocate the snapshot canvases at the current canvas size. */
  prepare(env: Env) {
    this.alloc(env.ctx.canvas.width, env.ctx.canvas.height);
  }

  invalidate() {
    this.ok = [false, false];
  }

  private alloc(w: number, h: number) {
    for (let i = 0; i < 2; i++) {
      const c = this.snaps[i];
      if (!c || c.width !== w || c.height !== h) {
        const n = c ?? document.createElement('canvas');
        n.width = w;
        n.height = h;
        this.snaps[i] = n;
        this.ok[i] = false;
      }
    }
  }

  /** The device matrix from page space to the screen at time t. */
  pageMatrix(env: Env, t: number): DOMMatrix {
    const S = env.ctx.canvas.width / VW;
    const v = PAGE.view(t);
    return new DOMMatrix().scale(S, S).translate(VW / 2, VH / 2).scale(v.zoom, v.zoom).translate(-v.cx, -v.cy);
  }

  /** Page-space point -> logical screen point at time t. */
  toScreen(t: number, px: number, py: number): [number, number] {
    const v = PAGE.view(t);
    return [VW / 2 + (px - v.cx) * v.zoom, VH / 2 + (py - v.cy) * v.zoom];
  }

  /**
   * Draw the page at shot-local t. border(i) (optional) returns the panel's border width (3 normally, up to 5 + kick
   * during its freeze). Call from the shot's render (it sets its own transforms).
   */
  render(env: Env, t: number, draw: PanelDraw, border?: (i: number) => number) {
    const ctx = env.ctx;
    const W = ctx.canvas.width, H = ctx.canvas.height;
    this.alloc(W, H);
    const S = W / VW;
    const pm = this.pageMatrix(env, t);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = HEX.paper;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    PAGE.panels.forEach((p, i) => {
      const started = t >= p.live[0];
      const done = t >= p.live[1];
      const poly = () => {
        ctx.beginPath();
        p.poly.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.closePath();
      };
      if (!started) return;
      if (done && i < 2) {
        // Frozen snapshot (rendered once from the panel's end time).
        const snap = this.snaps[i]!;
        if (!this.ok[i]) {
          const sc = snap.getContext('2d')!;
          sc.save();
          sc.setTransform(1, 0, 0, 1, 0, 0);
          sc.globalAlpha = 1;
          sc.globalCompositeOperation = 'source-over';
          sc.fillStyle = HEX.paper;
          sc.fillRect(0, 0, W, H);
          withSpace(env, sc, new DOMMatrix().scale(S, S), () => draw(env, i, p.live[1], true));
          sc.restore();
          this.ok[i] = true;
        }
        ctx.save();
        ctx.setTransform(pm);
        poly();
        ctx.clip();
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(snap, p.view[0], p.view[1], VW, VH);
        ctx.restore();
        return;
      }
      ctx.save();
      ctx.setTransform(pm);
      poly();
      ctx.clip();
      const m = pm.translate(p.view[0], p.view[1]);
      withSpace(env, ctx, m, () => draw(env, i, done ? p.live[1] : t, done));
      ctx.restore();
    });
    // Gutters and borders over everything (every panel, started or not: an empty panel is paper with a border).
    ctx.save();
    ctx.setTransform(pm);
    ctx.lineJoin = 'miter';
    for (const pass of [0, 1])
      PAGE.panels.forEach((p, i) => {
        ctx.beginPath();
        p.poly.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.closePath();
        const b = border?.(i) ?? 3;
        if (pass === 0) {
          ctx.strokeStyle = HEX.paper;
          ctx.lineWidth = b + 6;
        } else {
          ctx.strokeStyle = HEX.ink;
          ctx.lineWidth = b;
        }
        ctx.stroke();
      });
    ctx.restore();
  }
}

// ---------------------------------------------------------------- cached puppets (defenders and keeper)

/** A puppet rendered once into its own canvas (renderPuppet reuses one buffer per size): hip at (ox, oy). */
export function cachePuppet(kit: Kit, pose: Pose, k: number, facing: 1 | -1 = 1) {
  const r = renderPuppet(kit, pose, { k, facing });
  const cv = document.createElement('canvas');
  cv.width = r.cv.width;
  cv.height = r.cv.height;
  cv.getContext('2d')!.drawImage(r.cv, 0, 0);
  return { cv, ox: r.ox, oy: r.oy };
}

// ---------------------------------------------------------------- titles

/** GOAL! / title style: pearl fill, jade stroke, ink outer stroke (slamTitle options). */
export const TITLE_STYLE = { fill: '#FBF6EA', fill2: '#d9f5e4', stroke: '#0B8F58', outer: '#0D0D14' } as const;

/**
 * The name card (shot 6, 1.80-2.40), matching the other specials: slides in at the bottom with MERIDIAN THREAD (left),
 * "No.10 > No.7 · SPECIAL PASS" and CAM 1 - 0 RIV (right). t = seconds since it starts. Screen space.
 */
export function nameCard(ctx: CanvasRenderingContext2D, t: number) {
  const card = ease.outCubic(clamp(t / 0.35));
  if (card <= 0) return;
  const y = lerp(VH + 40, 286, card);
  ctx.fillStyle = 'rgba(13,13,20,0.9)';
  ctx.fillRect(0, y - 6, VW, 62);
  ctx.fillStyle = HEX.emerald;
  ctx.fillRect(0, y - 6, VW, 3);
  ctx.fillStyle = HEX.jade;
  ctx.fillRect(0, y + 53, VW, 3);
  slamTitle(ctx, SHOT_NAME, 40, y + 47, 30, t, { stagger: 0.02, align: 'left', ...TITLE_STYLE });
  pixelText(ctx, 'No.10 > No.7  ·  SPECIAL PASS', 40, y + 1, 10, HEX.jade, 'left', HEX.ink);
  pixelText(ctx, 'CAM 1 - 0 RIV', VW - 40, y + 20, 14, '#ffffff', 'right', HEX.ink);
}

// ---------------------------------------------------------------- placeholder

export interface PlaceholderDemo {
  prepare?(env: Env): void;
  init?(env: Env): void;
  update?(env: Env, t: number, dt: number): void;
  /** Draws the demo (screen space; the card is drawn on top). */
  render?(env: Env, t: number): void;
  rate?(t: number): number;
}

/**
 * A stand-in shot until the real one is produced: warm paper, a small demo of the engine pieces the shot uses, and a
 * label card (shot number, name, local time). init() calls the shared sfx.clearBus() (also while silent), so a seek never
 * leaves the crowd ducked. Keep the brief's cues on the returned shot.
 */
export function placeholderShot(idx: 1 | 2 | 3 | 4 | 5 | 6, name: string, dur: number, seed: number, demo: PlaceholderDemo = {}): Shot {
  return {
    name,
    dur,
    seed,
    prepare(env) {
      prepareInk(env.ctx);
      demo.prepare?.(env);
    },
    init(env) {
      env.sfx.clearBus();
      env.cam.set(VW / 2, VH / 2, 1, 0);
      demo.init?.(env);
    },
    update(env, t, dt) {
      demo.update?.(env, t, dt);
    },
    rate: demo.rate,
    render(env, t) {
      const ctx = env.ctx;
      env.screen();
      ctx.fillStyle = HEX.paper;
      ctx.fillRect(0, 0, VW, VH);
      demo.render?.(env, t);
      env.screen();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(13,13,20,0.82)';
      ctx.fillRect(0, 8, VW, 40);
      ctx.fillStyle = HEX.jade;
      ctx.fillRect(0, 47, VW, 2);
      pixelText(ctx, `${SHOT_NAME} · SHOT ${idx} · ${name.toUpperCase()}`, VW / 2, 12, 12, HEX.pearl, 'center', HEX.ink);
      pixelText(ctx, `PLACEHOLDER  ${t.toFixed(2)} / ${dur.toFixed(2)}s`, VW / 2, 31, 10, HEX.jade, 'center', HEX.ink);
      void PIXEL_FONT;
      meridianGrade(env.fx);
    },
  };
}

