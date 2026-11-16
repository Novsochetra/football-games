// SPOTLIGHT SOLO stage light (canvas, not a shader, so the draw order decides exactly what is dimmed):
// the dim layer with soft pools punched out of it, the follow-spot beam with motes drifting in it, the floor pool,
// the beat flare, the operator-lag follow, and the fluorescent pitch lines.
//
// Draw order for a stage shot: world + defenders (and the dark stands) -> stage.dim -> fluorescent accents (pitch
// lines, defender lilac rims, phone lights) -> beam and floor pool -> afterimages -> No.10 -> ball -> HUD.
//
// The darkness is light only (never ink, never desaturation): `dim` multiplies the frame by a plum-violet colour.

import { clamp, lerp, type RGB } from '../engine/math';
import { RAMPS } from '../engine/particles';
import { ramp } from '../engine/math';
import { VW, VH } from '../engine/camera';
import { FIELD } from './stadium';
// SPOTLIGHT SOLO v2 (the light-as-a-weapon pieces below the v1 toolkit).
import { ease } from '../engine/math';
import { PK, drawGlow, glowOf } from '../engine/particles';
import { lensFlare } from './fx';
import type { BankRect } from './stadium';
import type { Env } from '../cinematic/timeline';

/** The dim colour at level 1 (multiply): it darkens and pulls the world toward violet. */
export const DIM_RGB: RGB = [70, 52, 120];
/** Never dim the stage further than this (the subject must never be lost in the dark). */
export const DIM_MAX = 0.88;

/** A soft elliptical hole in the dim layer (screen space, logical px). gain 1 = fully lit inside rx/ry. */
export interface StagePool {
  x: number;
  y: number;
  rx: number;
  ry: number;
  /** Width of the soft falloff beyond rx (px, default 40). */
  soft?: number;
  /** How much of the dim is removed inside the pool (0..1, default 1). */
  gain?: number;
}

let dimCv: HTMLCanvasElement | null = null;
let dimG: CanvasRenderingContext2D | null = null;

/** Multiply colour of the dim layer at `level` (white at 0, DIM_RGB at 1). */
export function dimColor(level: number, c: RGB = DIM_RGB): RGB {
  const l = clamp(level);
  return [lerp(255, c[0], l), lerp(255, c[1], l), lerp(255, c[2], l)];
}

/**
 * The stage dim: one reused 640x360 canvas filled with the dim colour (mixed from white by `level`), soft
 * elliptical holes punched out with destination-out radial gradients (up to 8 pools, screen space), multiplied onto
 * the frame. Skipped when level is 0. Level is capped at DIM_MAX unless o.uncapped (the launch blackout).
 */
function dim(ctx: CanvasRenderingContext2D, level: number, pools: readonly StagePool[] = [], o: { color?: RGB; uncapped?: boolean; max?: number } = {}) {
  // SPOTLIGHT SOLO v2: o.max raises the cap (v2 stage shots pass 0.94; blackouts pass uncapped with a level <= 0.97).
  const l = o.uncapped ? clamp(level) : Math.min(o.max ?? DIM_MAX, clamp(level));
  if (l <= 0) return;
  if (!dimCv) {
    dimCv = document.createElement('canvas');
    dimCv.width = VW;
    dimCv.height = VH;
    dimG = dimCv.getContext('2d')!;
  }
  const g = dimG!;
  const [r, gg, b] = dimColor(l, o.color);
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-over';
  g.globalAlpha = 1;
  g.clearRect(0, 0, VW, VH);
  g.fillStyle = `rgb(${r | 0},${gg | 0},${b | 0})`;
  g.fillRect(0, 0, VW, VH);
  g.globalCompositeOperation = 'destination-out';
  for (const p of pools.slice(0, 8)) {
    const soft = p.soft ?? 40;
    const gain = clamp(p.gain ?? 1);
    if (p.rx <= 0 || p.ry <= 0 || gain <= 0) continue;
    const R = p.rx + soft;
    g.save();
    g.translate(p.x, p.y);
    g.scale(1, p.ry / p.rx);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, R);
    gr.addColorStop(0, `rgba(0,0,0,${gain})`);
    gr.addColorStop(clamp(p.rx / R), `rgba(0,0,0,${gain})`);
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.fillRect(-R, -R, R * 2, R * 2);
    g.restore();
  }
  g.globalCompositeOperation = 'source-over';
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'multiply';
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(dimCv, 0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
}

/** Small deterministic hash -> [0, 1). */
const h01 = (i: number, s: number) => {
  const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

export interface BeamOpts {
  /** Shot time (s): when given, `motes` dust motes drift in the beam (a pure function of t, seek-exact). */
  t?: number;
  /** Number of motes (default 24 when t is given). */
  motes?: number;
  /** Mote pattern seed. */
  seed?: number;
}

/**
 * The follow-spot shaft: a tapered quad from (x0, y0) (width w0) to (x1, y1) (width w1) in the current transform.
 * An ivory additive gradient (strength `a`, capped at 0.18, brighter near the lamp, soft across its width) over a
 * normal-blend plum underlay at 0.2, so it never blooms white against the stands. With o.t, 20-30 seeded motes
 * ('mote' ramp, normal blend) drift slowly down through it.
 */
function beam(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, w0: number, w1: number, a: number, o: BeamOpts = {}) {
  const A = Math.min(0.18, Math.max(0, a));
  if (A <= 0) return;
  const dx = x1 - x0, dy = y1 - y0;
  const L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L;
  const quad = (k: number) => {
    ctx.beginPath();
    ctx.moveTo(x0 + nx * w0 * 0.5 * k, y0 + ny * w0 * 0.5 * k);
    ctx.lineTo(x1 + nx * w1 * 0.5 * k, y1 + ny * w1 * 0.5 * k);
    ctx.lineTo(x1 - nx * w1 * 0.5 * k, y1 - ny * w1 * 0.5 * k);
    ctx.lineTo(x0 - nx * w0 * 0.5 * k, y0 - ny * w0 * 0.5 * k);
    ctx.closePath();
  };
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 0.2 * (A / 0.18);
  ctx.fillStyle = '#160A26';
  quad(1.12);
  ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  for (const [k, share] of [[1, 0.34], [0.68, 0.33], [0.36, 0.33]] as const) {
    const gr = ctx.createLinearGradient(x0, y0, x1, y1);
    gr.addColorStop(0, `rgba(246,240,223,${A * share})`);
    gr.addColorStop(1, `rgba(246,240,223,${A * share * 0.5})`);
    ctx.globalAlpha = 1;
    ctx.fillStyle = gr;
    quad(k);
    ctx.fill();
  }
  if (o.t !== undefined) {
    ctx.globalCompositeOperation = 'source-over';
    const n = o.motes ?? 24, s = o.seed ?? 1;
    for (let i = 0; i < n; i++) {
      const u = (h01(i, s) + o.t * (0.03 + 0.04 * h01(i, s + 1))) % 1;
      const v = (h01(i, s + 2) - 0.5) * 0.9 + 0.06 * Math.sin(o.t * (0.6 + h01(i, s + 3)) + i);
      const w = lerp(w0, w1, u);
      const px = x0 + dx * u + nx * w * v, py = y0 + dy * u + ny * w * v;
      const c = ramp(RAMPS.mote, h01(i, s + 4));
      ctx.globalAlpha = clamp((0.45 + 0.4 * h01(i, s + 5)) * (A / 0.18) * Math.min(1, u * 6) * (1 - Math.abs(v) * 0.8));
      ctx.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
      const q = h01(i, s + 6) < 0.2 ? 2 : 1;
      ctx.fillRect(Math.round(px), Math.round(py), q, q);
    }
  }
  ctx.restore();
}

/** The soft ivory pool of light on the turf (additive), centred on (x, y) in the current transform. */
function floorPool(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, a: number) {
  if (a <= 0 || rx <= 0 || ry <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.translate(x, y);
  ctx.scale(1, ry / rx);
  const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  const k = clamp(a);
  gr.addColorStop(0, `rgba(246,240,223,${k})`);
  gr.addColorStop(0.55, `rgba(246,240,223,${k * 0.62})`);
  gr.addColorStop(1, 'rgba(246,240,223,0)');
  ctx.fillStyle = gr;
  ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
  ctx.restore();
}

/**
 * The beat flare on a skill key: the pool brightens x1.25 and grows +6% for exactly 2 frames from `at` (one time
 * or a list). Local to the pool, never a full-frame flash. Multiply the pool gain / floor-pool alpha by `gain` and
 * its radii by `size`.
 */
function flare(t: number, at: number | readonly number[]): { gain: number; size: number } {
  const list = typeof at === 'number' ? [at] : at;
  for (const a of list) if (t >= a - 1e-6 && t < a + 2 / 60 - 1e-6) return { gain: 1.25, size: 1.06 };
  return { gain: 1, size: 1 };
}

let linesCv: HTMLCanvasElement | null = null;
/**
 * The pitch markings of the field view alone (same geometry as the stadium pitch canvas), fluorescing faintly in
 * the dark: drawn after the dim at (0, FIELD.horizon) in field world coordinates, normal blend, alpha `a`.
 */
function fluoroLines(ctx: CanvasRenderingContext2D, a = 0.3, color = '#C9B6FF') {
  if (a <= 0) return;
  if (!linesCv) {
    linesCv = document.createElement('canvas');
    linesCv.width = FIELD.width;
    linesCv.height = 260;
    const pg = linesCv.getContext('2d')!;
    pg.fillStyle = '#ffffff';
    pg.fillRect(0, 0, FIELD.width, 2);
    const gx = FIELD.goalX, ob = 0.35;
    const line = (x0: number, y0: number, x1: number, y1: number) => {
      const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
      for (let i = 0; i <= n; i++) pg.fillRect(Math.round(lerp(x0, x1, i / n)), Math.round(lerp(y0, y1, i / n)), 2, 1);
    };
    line(gx, 0, gx + 230 * ob, 230);
    line(gx - 150, 14, gx - 150 + 190 * ob, 204);
    line(gx - 150, 14, gx, 14);
    line(gx - 150 + 190 * ob, 204, gx + 190 * ob, 204);
    line(gx - 52, 64, gx - 52 + 90 * ob, 154);
    line(gx - 52, 64, gx + 64 * ob - 22, 64);
    line(gx - 52 + 90 * ob, 154, gx + 154 * ob, 154);
    pg.fillRect(gx - 104 + 110 * ob, 110, 3, 2);
    line(260, 0, 260 + 260 * ob, 260);
  }
  ctx.save();
  // Tint the white lines: draw them through a cached tinted copy.
  const tinted = tintedLines(color);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = clamp(a);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tinted, 0, FIELD.horizon);
  ctx.restore();
}
const tintCache = new Map<string, HTMLCanvasElement>();
function tintedLines(color: string): HTMLCanvasElement {
  let cv = tintCache.get(color);
  if (!cv) {
    cv = document.createElement('canvas');
    cv.width = linesCv!.width;
    cv.height = linesCv!.height;
    const g = cv.getContext('2d')!;
    g.drawImage(linesCv!, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = color;
    g.fillRect(0, 0, cv.width, cv.height);
    tintCache.set(color, cv);
  }
  return cv;
}

/** The penalty spot of the field view (world x, z): the mark No.10's sole stops the ball on. */
export const PENALTY_SPOT = { x: 1114, z: 282 } as const;

/**
 * A follow-spot operator: the pool chases its target with a critically damped lag (smooth time ~60 ms), so a
 * sudden cut lets the player escape the centre of the light for 3-4 frames. State advanced in update() at the fixed
 * step (seek-exact). Pass the real step to lag in real time, or the warped dt to slow it with the hit-stops.
 */
export class FollowSpot {
  x = 0;
  y = 0;
  private vx = 0;
  private vy = 0;
  constructor(public smooth = 0.06) {}
  snap(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.vx = this.vy = 0;
  }
  update(tx: number, ty: number, dt: number) {
    if (dt <= 0) return;
    const w = 2 / Math.max(1e-4, this.smooth);
    const q = w * dt;
    const e = 1 / (1 + q + 0.48 * q * q + 0.235 * q * q * q);
    const step = (cur: number, v: number, target: number): [number, number] => {
      const ch = cur - target;
      const tmp = (v + w * ch) * dt;
      return [target + (ch + tmp) * e, (v - w * tmp) * e];
    };
    [this.x, this.vx] = step(this.x, this.vx, tx);
    [this.y, this.vy] = step(this.y, this.vy, ty);
  }
}

// ================================================================ SPOTLIGHT SOLO v2: light as a weapon
// Every piece below is a pure function of the times it is given (shot clock or global time), so every shot seeks
// exactly; the particle helpers (surgeBurst / surgeSparks) are called from cues and update() at the fixed step.
// Colours: spot #FFFAEC, ivory #F6F0DF, volt #A880FF, uv #7A4DFF, lilac #C9B6FF, uvDeep #2A1660, plum #160A26.

const SPOT: RGB = [255, 250, 236];
const IVORY: RGB = [246, 240, 223];
const VOLT: RGB = [168, 128, 255];
const UVC: RGB = [122, 77, 255];
const LILAC: RGB = [201, 182, 255];
const UVDEEP: RGB = [42, 22, 96];
const rgba = (c: RGB, a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${clamp(a)})`;
const FRAME = 1 / 60;

/** +15 % for 0.1 s after each of the pump times (the drop beam's pumps; multiply a pool or beam strength by it). */
function pumpAt(t: number, pumps: readonly number[] = []): number {
  for (const p of pumps) if (t >= p - 1e-6 && t < p + 0.1) return 1.15;
  return 1;
}

export interface PillarOpts {
  /** The lamp end (x0, y0) and the pool end (x1, y1) of the shaft, in the current transform. */
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** Width at the lamp and at the pool. */
  w0: number;
  w1: number;
  /** Strength 0..1. */
  a: number;
  /** Clock for the motes, the slam and the pumps. */
  t: number;
  /** The slam: before it nothing; from it the foot drops from the lamp to (x1, y1) in 2 frames with a 6 % overshoot. */
  slamAt?: number;
  /** +15 % for 0.1 s at each pump time (the beam pumping on the drums). */
  pumps?: readonly number[];
  /** Dust motes drifting in the beam (default 24; 0 = none). */
  motes?: number;
  seed?: number;
  /** White-hot core strength (default 0.3, at most 0.35). */
  core?: number;
  /** Width of each volt edge band (px, default 6). */
  edge?: number;
}

/**
 * The drop beam (SPOTLIGHT SOLO v2): a hard shaft from a lamp onto a pool. Plum underlay 0.25 (normal blend), an ivory
 * body at most 0.22 and a white-hot core at most 0.35 (additive), volt edge bands, seeded motes; with slamAt a 2-frame
 * drop with a 6 % overshoot; pumps add 15 % for 0.1 s. Returns the beam's current strength (0 before the slam).
 */
function pillar(ctx: CanvasRenderingContext2D, o: PillarOpts): number {
  let { x1, y1, w1 } = o;
  let k = clamp(o.a) * pumpAt(o.t, o.pumps);
  if (o.slamAt !== undefined) {
    const lt = o.t - o.slamAt;
    if (lt < 0) return 0;
    const p = clamp(lt / (2 * FRAME));
    const over = lt < 2 * FRAME ? 0 : Math.max(0, 1 - (lt - 2 * FRAME) / (3 * FRAME));
    const e = ease.outQuad(p);
    x1 = lerp(o.x0, o.x1, e);
    y1 = lerp(o.y0, o.y1, e);
    w1 = lerp(o.w0, o.w1, e) * (1 + 0.06 * (p >= 1 ? over : 0));
    if (lt < FRAME) k *= 1.2;
  }
  if (k <= 0) return 0;
  const dx = x1 - o.x0, dy = y1 - o.y0;
  const L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L;
  const quad = (s: number, off = 0, sw = 1) => {
    ctx.beginPath();
    ctx.moveTo(o.x0 + nx * (o.w0 * 0.5 * s + off), o.y0 + ny * (o.w0 * 0.5 * s + off));
    ctx.lineTo(x1 + nx * (w1 * 0.5 * s + off), y1 + ny * (w1 * 0.5 * s + off));
    ctx.lineTo(x1 + nx * (w1 * 0.5 * s * sw + off), y1 + ny * (w1 * 0.5 * s * sw + off));
    ctx.closePath();
  };
  const band = (s0: number, s1: number) => {
    ctx.beginPath();
    ctx.moveTo(o.x0 + nx * o.w0 * 0.5 * s0, o.y0 + ny * o.w0 * 0.5 * s0);
    ctx.lineTo(x1 + nx * w1 * 0.5 * s0, y1 + ny * w1 * 0.5 * s0);
    ctx.lineTo(x1 + nx * w1 * 0.5 * s1, y1 + ny * w1 * 0.5 * s1);
    ctx.lineTo(o.x0 + nx * o.w0 * 0.5 * s1, o.y0 + ny * o.w0 * 0.5 * s1);
    ctx.closePath();
  };
  void quad;
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 0.25 * Math.min(1, k);
  ctx.fillStyle = '#160A26';
  band(-1.12, 1.12);
  ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  const body = Math.min(0.22, 0.22 * k);
  for (const [s, share] of [[1, 0.4], [0.7, 0.32], [0.42, 0.28]] as const) {
    const gr = ctx.createLinearGradient(o.x0, o.y0, x1, y1);
    gr.addColorStop(0, rgba(IVORY, body * share * 1.25));
    gr.addColorStop(1, rgba(IVORY, body * share * 0.85));
    ctx.globalAlpha = 1;
    ctx.fillStyle = gr;
    band(-s, s);
    ctx.fill();
  }
  const core = Math.min(0.35, (o.core ?? 0.3) * k);
  const gc = ctx.createLinearGradient(o.x0, o.y0, x1, y1);
  gc.addColorStop(0, rgba(SPOT, core));
  gc.addColorStop(1, rgba(SPOT, core * 0.7));
  ctx.fillStyle = gc;
  band(-0.16, 0.16);
  ctx.fill();
  // Volt edge bands (a soft band of `edge` px inside each side).
  const ew = o.edge ?? 6;
  if (ew > 0) {
    const e0 = Math.max(0, 1 - (2 * ew) / Math.max(4, o.w0)), e1 = Math.max(0, 1 - (2 * ew) / Math.max(4, w1));
    ctx.fillStyle = rgba(VOLT, 0.3 * Math.min(1, k));
    for (const sgn of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(o.x0 + nx * o.w0 * 0.5 * sgn, o.y0 + ny * o.w0 * 0.5 * sgn);
      ctx.lineTo(x1 + nx * w1 * 0.5 * sgn, y1 + ny * w1 * 0.5 * sgn);
      ctx.lineTo(x1 + nx * w1 * 0.5 * sgn * e1, y1 + ny * w1 * 0.5 * sgn * e1);
      ctx.lineTo(o.x0 + nx * o.w0 * 0.5 * sgn * e0, o.y0 + ny * o.w0 * 0.5 * sgn * e0);
      ctx.closePath();
      ctx.fill();
    }
  }
  const n = o.motes ?? 24, sd = o.seed ?? 1;
  if (n > 0) {
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < n; i++) {
      const u = (h01(i, sd) + o.t * (0.03 + 0.04 * h01(i, sd + 1))) % 1;
      const v = (h01(i, sd + 2) - 0.5) * 0.9 + 0.06 * Math.sin(o.t * (0.6 + h01(i, sd + 3)) + i);
      const w = lerp(o.w0, w1, u);
      const px = o.x0 + dx * u + nx * w * v, py = o.y0 + dy * u + ny * w * v;
      const c = ramp(RAMPS.mote, h01(i, sd + 4));
      ctx.globalAlpha = clamp((0.5 + 0.45 * h01(i, sd + 5)) * Math.min(1, k) * Math.min(1, u * 6) * (1 - Math.abs(v) * 0.8));
      ctx.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
      const q = h01(i, sd + 6) < 0.2 ? 2 : 1;
      ctx.fillRect(Math.round(px), Math.round(py), q, q);
    }
  }
  ctx.restore();
  return k;
}

/**
 * The filled light splash (SPOTLIGHT SOLO's impact shape; never a ring): an ellipse of light growing rx0 -> rx1
 * (outCubic) over 0.15 s from t0, ry = rx·aspect, a white-hot centre and an ivory body (additive) over a uvDeep
 * halo, fading as it grows. Nothing before t0 or after t0 + 0.15.
 */
function splash(ctx: CanvasRenderingContext2D, x: number, y: number, rx0: number, rx1: number, aspect: number, t0: number, t: number, a = 1) {
  const lt = t - t0;
  if (lt < 0 || lt >= 0.15 || a <= 0) return;
  const u = lt / 0.15;
  const rx = lerp(rx0, rx1, ease.outCubic(u)), ry = rx * aspect;
  const k = clamp(a) * (1 - u * u);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, Math.max(0.05, aspect));
  ctx.globalCompositeOperation = 'source-over';
  const g0 = ctx.createRadialGradient(0, 0, 0, 0, 0, rx * 1.25);
  g0.addColorStop(0, rgba(UVDEEP, 0.45 * k));
  g0.addColorStop(1, rgba(UVDEEP, 0));
  ctx.fillStyle = g0;
  ctx.fillRect(-rx * 1.25, -rx * 1.25, rx * 2.5, rx * 2.5);
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  g.addColorStop(0, rgba(SPOT, 0.95 * k));
  g.addColorStop(0.35, rgba(IVORY, 0.7 * k));
  g.addColorStop(0.75, rgba(VOLT, 0.3 * k));
  g.addColorStop(1, rgba(VOLT, 0));
  ctx.fillStyle = g;
  ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
  ctx.restore();
  void ry;
}

/** The hot pool of a beam on the turf (additive): L > 0.92 at its centre, ivory body, a soft volt rim. */
function pool(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, a = 1) {
  if (a <= 0 || rx <= 0 || ry <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.translate(x, y);
  ctx.scale(1, ry / rx);
  const k = clamp(a);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  g.addColorStop(0, rgba(SPOT, 0.95 * k));
  g.addColorStop(0.3, rgba(SPOT, 0.8 * k));
  g.addColorStop(0.65, rgba(IVORY, 0.42 * k));
  g.addColorStop(0.9, rgba(VOLT, 0.12 * k));
  g.addColorStop(1, rgba(VOLT, 0));
  ctx.fillStyle = g;
  ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
  ctx.restore();
}

/**
 * A trophy spot (SPOTLIGHT SOLO v2): the narrow hard spot from the roof onto a print and its fallen body: a shaft
 * 12 -> 70 px x s wide from above the frame to footY, a pool rx 50·s on the turf, a 2-frame switch-on (half, then one
 * over-bright frame) and motes. Nothing before t0. `top` = the lamp's y (default -30).
 */
function trophy(ctx: CanvasRenderingContext2D, x: number, footY: number, s: number, t0: number, t: number, o: { a?: number; top?: number; seed?: number } = {}) {
  const lt = t - t0;
  if (lt < 0) return;
  const k = (lt < FRAME ? 0.5 : lt < 2 * FRAME ? 1.45 : 1) * (o.a ?? 1);
  pillar(ctx, { x0: x, y0: o.top ?? -30, x1: x, y1: footY, w0: 12 * s, w1: 70 * s, a: Math.min(1, k), t, motes: 12, seed: o.seed ?? 7, core: 0.32, edge: Math.max(1, 3 * s) });
  pool(ctx, x, footY, 50 * s, 14 * s, Math.min(1.2, 0.85 * k));
}

/**
 * Hard god rays (SPOTLIGHT SOLO v2): n thin triangles from (x, y), lengths len0-len1 (seeded), w px wide at the tip,
 * additive ivory at `a` (each ray 0.5-1 of it, flickering ±10 % with `flick`), fanned over `spread` rad (default the
 * full circle) round `rot`. Seeded and deterministic.
 */
function godRays(
  ctx: CanvasRenderingContext2D, x: number, y: number, n: number, len0: number, len1: number, w: number, a: number, rot = 0, seed = 1,
  spread = Math.PI * 2, flick = 0,
) {
  if (a <= 0 || n <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const full = spread >= Math.PI * 2 - 1e-6;
    const base = full ? (i / n) * Math.PI * 2 : n > 1 ? -spread / 2 + (spread * i) / (n - 1) : 0;
    const ang = rot + base + (h01(i, seed) - 0.5) * (spread / Math.max(1, n)) * 0.6;
    const len = lerp(len0, len1, h01(i, seed + 1));
    const ka = a * (0.5 + 0.5 * h01(i, seed + 2)) * (1 + 0.1 * Math.sin(flick * (7 + i) + i * 2.3));
    const cx = Math.cos(ang), sy = Math.sin(ang);
    const tx = x + cx * len, ty = y + sy * len;
    const g = ctx.createLinearGradient(x, y, tx, ty);
    g.addColorStop(0, rgba(SPOT, 0.55 * ka));
    g.addColorStop(0.5, rgba(IVORY, 0.25 * ka));
    g.addColorStop(1, rgba(LILAC, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - sy * 0.75, y + cx * 0.75);
    ctx.lineTo(tx - (sy * w) / 2, ty + (cx * w) / 2);
    ctx.lineTo(tx + (sy * w) / 2, ty - (cx * w) / 2);
    ctx.lineTo(x + sy * 0.75, y - cx * 0.75);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** When each of a bank's cells pops (s after t0, 0..0.08), seeded per bank cell. */
const cellAt = (i: number, seed: number) => 0.08 * h01(i, seed + 11);

/**
 * The level a backdrop should give a surging bank (FieldBackdropOpts.towers / DownPitchOpts.towers): 'out' = lit
 * before t0, dark from t0 (surge() draws the popping cells and the collapsing glow); 'in' = dark until t0 + 0.12,
 * lit after (surge() draws the cells lighting and the rising glare in between).
 */
function surgeLevel(t0: number, t: number, dir: 'out' | 'in'): number {
  return dir === 'out' ? (t < t0 ? 1 : 0) : t < t0 + 0.12 ? 0 : 1;
}

/**
 * A floodlight bank surging (SPOTLIGHT SOLO v2), drawn over a backdrop whose level for this bank is surgeLevel():
 * 'out' = the 5 x 4 lamp cells pop out one by one over 0.08 s (a 1-frame white blink each, then dead) while the bank's
 * glow collapses over 3 frames; 'in' reverses it with a rising glare (1.25 then 1) and a 120 px lilac-white lensFlare.
 * Pure function of t; the glass, cable sparks and smoke come from surgeBurst / surgeSparks (update / cues).
 */
function surge(ctx: CanvasRenderingContext2D, bank: BankRect, t0: number, t: number, dir: 'out' | 'in', o: { seed?: number; glow?: number } = {}) {
  const lt = t - t0;
  if (lt < 0 || lt > 0.3) return;
  const seed = o.seed ?? Math.round(bank.x * 7 + bank.y * 13);
  const n = bank.cols * bank.rows;
  const cw = bank.w / bank.cols, ch = bank.h / bank.rows;
  const cx = bank.x + bank.w / 2, cy = bank.y + bank.h / 2;
  const G = o.glow ?? Math.max(40, bank.w * 1.4);
  ctx.save();
  if (lt <= 0.12) {
    let lit = 0;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#0b0918';
    ctx.fillRect(bank.x - 2, bank.y - 2, bank.w + 4, bank.h + 4);
    for (let i = 0; i < n; i++) {
      const at = cellAt(i, seed);
      const on = dir === 'out' ? lt < at : lt >= at;
      const blink = lt >= at && lt < at + FRAME;
      if (on) lit++;
      ctx.fillStyle = blink ? '#ffffff' : on ? '#FFFBE8' : '#2a2440';
      const c = i % bank.cols, r = Math.floor(i / bank.cols);
      ctx.fillRect(bank.x + c * cw + cw * 0.14, bank.y + r * ch + ch * 0.14, cw * 0.72, ch * 0.66);
    }
    const frac = lit / n;
    let g: number;
    if (dir === 'out') g = frac * clamp(1 - Math.max(0, lt - 0.06) / (3 * FRAME));
    else g = frac * (lt < 0.12 ? lerp(1.25, 1, clamp((lt - 0.08) / 0.04)) : 1);
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf([255, 250, 220]), cx, cy, G * 1.6, 0.5 * g, 1.2, 0.85);
    drawGlow(ctx, glowOf([255, 255, 255]), cx, cy, G * 0.6, 0.85 * g);
  }
  if (dir === 'in' && lt < 0.25) lensFlare(ctx, cx, cy, 120, 0.9 * (1 - lt / 0.25), [226, 220, 255]);
  ctx.restore();
}

/**
 * The particles of a bank blowing (SPOTLIGHT SOLO v2; call once, from a cue at the surge's t0): 60-120 PK.Glass glints
 * falling with gravity, a smoke plume, a spray of 'glass' sparks. Coordinates in the bank's space (screen or world:
 * the shot draws env.parts in that same transform).
 */
function surgeBurst(env: Env, bank: BankRect, power = 1) {
  const { rng, parts } = env;
  const n = Math.round(clamp(60 + bank.w * 0.6, 60, 120) * Math.min(1.5, power));
  for (let i = 0; i < n; i++) {
    const x = bank.x + rng.range(0, bank.w), y = bank.y + rng.range(0, bank.h);
    parts.spawn({
      kind: PK.Glass, x, y, vx: rng.range(-90, 90), vy: rng.range(-140, 40), ay: 620, drag: 0.4, max: rng.range(0.6, 1.4),
      s0: rng.range(1, 2.4), s1: 1, ramp: 'glass', r0: rng.range(0, 0.3), r1: 1, a0: 1, a1: 0.2, k: 0.3, layer: 1,
    });
  }
  for (let i = 0; i < 10; i++) {
    parts.spawn({
      kind: PK.Smoke, x: bank.x + rng.range(0, bank.w), y: bank.y + bank.h * 0.5, vx: rng.range(-20, 20), vy: rng.range(-40, -15),
      drag: 1, max: rng.range(0.8, 1.6), s0: rng.range(6, 12), s1: rng.range(20, 36), ramp: 'smoke', r0: 0, r1: 1, a0: 0.5, a1: 0, add: false, layer: 0,
    });
  }
  for (let i = 0; i < 16; i++) {
    const a = rng.range(0, Math.PI * 2), s = rng.range(80, 320);
    parts.spawn({
      kind: PK.Streak, x: bank.x + bank.w / 2, y: bank.y + bank.h / 2, vx: Math.cos(a) * s, vy: Math.sin(a) * s, ay: 400, drag: 3,
      max: rng.range(0.2, 0.5), s0: rng.range(1, 2), s1: 0.4, ramp: 'glass', r0: 0, r1: 1, k: 1.2, layer: 1,
    });
  }
}

/** The sparking cable of a blown bank (call every update step): 6 'glass' sparks a frame for 0.2 s from t0. */
function surgeSparks(env: Env, bank: BankRect, t0: number, t: number) {
  if (t < t0 || t >= t0 + 0.2) return;
  const { rng, parts } = env;
  const x = bank.x + bank.w * 0.85, y = bank.y + bank.h + 2;
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 2 + rng.range(-1.2, 1.2), s = rng.range(60, 200);
    parts.spawn({
      kind: PK.Streak, x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, ay: 500, drag: 2.5, max: rng.range(0.15, 0.35),
      s0: rng.range(0.8, 1.6), s1: 0.3, ramp: 'glass', r0: 0, r1: 1, k: 1, layer: 1,
    });
  }
}

export const stageV2 = { pillar, splash, pool, trophy, godRays, surge, surgeLevel, surgeBurst, surgeSparks, pumpAt };

// ---------------------------------------------------------------- sprites under stage light

/** The minimal picture a sprite-light helper needs (solo2 Pics satisfy it): a stable id, size and RGBA pixels. */
export interface LitPic {
  id: string;
  w: number;
  h: number;
  px: Uint8ClampedArray;
  img: HTMLCanvasElement;
}

const fluoroCache = new Map<string, HTMLCanvasElement>();
/**
 * The fluorescent whites of a picture (SPOTLIGHT SOLO v2): the boot white (#dfdae6), sock trims, eye whites and any
 * near-white, low-saturation pixel, as a lilac-white mask (cached per picture id). drawFluoro adds it after the dim.
 */
export function fluoroMask(pic: LitPic): HTMLCanvasElement {
  let cv = fluoroCache.get(pic.id);
  if (cv) return cv;
  cv = document.createElement('canvas');
  cv.width = pic.w;
  cv.height = pic.h;
  const g = cv.getContext('2d')!;
  const out = g.createImageData(pic.w, pic.h);
  const s = pic.px, d = out.data;
  for (let i = 0; i < s.length; i += 4) {
    if (s[i + 3] < 128) continue;
    const r = s[i], gg = s[i + 1], b = s[i + 2];
    const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b);
    if (mx >= 200 && mx - mn <= 48) {
      d[i] = 226;
      d[i + 1] = 220;
      d[i + 2] = 255;
      d[i + 3] = 255;
    }
  }
  g.putImageData(out, 0, 0);
  fluoroCache.set(pic.id, cv);
  return cv;
}

/** Draw a picture's fluorescent whites (fluoroMask), additive, top-left at (x, y) at `scale` (nearest), alpha a. */
export function drawFluoro(ctx: CanvasRenderingContext2D, pic: LitPic, x: number, y: number, scale: number, a = 1, flip = false) {
  if (a <= 0) return;
  const m = fluoroMask(pic);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = clamp(a);
  if (flip) {
    ctx.translate(x + pic.w * scale, y);
    ctx.scale(-1, 1);
    ctx.drawImage(m, 0, 0, pic.w * scale, pic.h * scale);
  } else ctx.drawImage(m, x, y, pic.w * scale, pic.h * scale);
  ctx.restore();
}

let scratchCv: HTMLCanvasElement | null = null;
let scratchG: CanvasRenderingContext2D | null = null;
/** One reused scratch canvas, grown to at least w x h, cleared. */
function scratch(w: number, h: number) {
  const W = Math.max(1, Math.ceil(w)), H = Math.max(1, Math.ceil(h));
  if (!scratchCv) {
    scratchCv = document.createElement('canvas');
    scratchG = scratchCv.getContext('2d')!;
  }
  if (scratchCv.width < W || scratchCv.height < H) {
    scratchCv.width = Math.max(scratchCv.width, W);
    scratchCv.height = Math.max(scratchCv.height, H);
  }
  const g = scratchG!;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';
  g.clearRect(0, 0, W + 2, H + 2);
  g.imageSmoothingEnabled = false;
  return { cv: scratchCv, g, W, H };
}

/** Composite the scratch's [0, w) x [0, h) onto ctx at (x, y) with `op` at alpha a. */
function blitScratch(ctx: CanvasRenderingContext2D, s: { cv: HTMLCanvasElement; W: number; H: number }, x: number, y: number, op: GlobalCompositeOperation, a: number) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalCompositeOperation = op;
  ctx.globalAlpha = clamp(a);
  ctx.drawImage(s.cv, 0, 0, s.W, s.H, x, y, s.W, s.H);
  ctx.restore();
}

/**
 * Light from a point, clipped to a sprite (SPOTLIGHT SOLO v2: the blazing ball under-lighting his shins, knees and
 * chin): `img` drawn with its top-left at (x, y) at `scale` (nearest; flip mirrors) receives a radial light of radius
 * r centred on screen (lx, ly) in `color`, added on top. Use in screen space (the current transform's scale is not
 * applied to the scratch).
 */
export function underLight(
  ctx: CanvasRenderingContext2D, img: HTMLCanvasElement, x: number, y: number, scale: number, lx: number, ly: number, r: number,
  color: RGB = LILAC, a = 1, flip = false,
) {
  if (a <= 0 || r <= 0) return;
  const w = img.width * scale, h = img.height * scale;
  const s = scratch(w, h);
  drawScaled(s.g, img, w, h, flip);
  s.g.globalCompositeOperation = 'source-in';
  const gr = s.g.createRadialGradient(lx - x, ly - y, 0, lx - x, ly - y, r);
  gr.addColorStop(0, rgba(color, 1));
  gr.addColorStop(0.5, rgba(color, 0.45));
  gr.addColorStop(1, rgba(color, 0));
  s.g.fillStyle = gr;
  s.g.fillRect(0, 0, s.W, s.H);
  blitScratch(ctx, s, Math.round(x), Math.round(y), 'lighter', a);
}

/**
 * A light-side rim clipped to a sprite (SPOTLIGHT SOLO v2): the pixels of `img` (top-left (x, y), `scale`) whose
 * neighbour w px toward the light (dir = unit screen vector pointing to the light) is outside the sprite, in `color`,
 * additive at a. E.g. the pop behind him: rimLight(ctx, pic.img, x, y, 3, [-1, -0.3], 2, SPOT).
 */
export function rimLight(
  ctx: CanvasRenderingContext2D, img: HTMLCanvasElement, x: number, y: number, scale: number, dir: readonly [number, number], w: number,
  color: RGB = SPOT, a = 1, flip = false,
) {
  if (a <= 0 || w <= 0) return;
  const W = img.width * scale, H = img.height * scale;
  const s = scratch(W, H);
  drawScaled(s.g, img, W, H, flip);
  const l = Math.hypot(dir[0], dir[1]) || 1;
  s.g.globalCompositeOperation = 'destination-out';
  s.g.save();
  s.g.translate(Math.round((-dir[0] / l) * w), Math.round((-dir[1] / l) * w));
  drawScaled(s.g, img, W, H, flip);
  s.g.restore();
  s.g.globalCompositeOperation = 'source-in';
  s.g.fillStyle = rgba(color, 1);
  s.g.fillRect(0, 0, s.W, s.H);
  blitScratch(ctx, s, Math.round(x), Math.round(y), 'lighter', a);
}

/**
 * Darken a sprite in place (SPOTLIGHT SOLO v2: his front in shadow, "multiplied to 35 % with a uv tint"): multiplies
 * the sprite's own pixels on ctx by tint·k (top-left (x, y), `scale`). Draw it right after the sprite.
 */
export function shadeSprite(ctx: CanvasRenderingContext2D, img: HTMLCanvasElement, x: number, y: number, scale: number, k = 0.35, tint: RGB = [150, 120, 255], flip = false) {
  const W = img.width * scale, H = img.height * scale;
  const s = scratch(W, H);
  drawScaled(s.g, img, W, H, flip);
  s.g.globalCompositeOperation = 'source-in';
  s.g.fillStyle = `rgb(${Math.round(clamp(tint[0] * k / 255) * 255)},${Math.round(clamp(tint[1] * k / 255) * 255)},${Math.round(clamp(tint[2] * k / 255) * 255)})`;
  s.g.fillRect(0, 0, s.W, s.H);
  blitScratch(ctx, s, Math.round(x), Math.round(y), 'multiply', 1);
}

function drawScaled(g: CanvasRenderingContext2D, img: HTMLCanvasElement, w: number, h: number, flip: boolean) {
  g.save();
  g.imageSmoothingEnabled = false;
  if (flip) {
    g.translate(w, 0);
    g.scale(-1, 1);
  }
  g.drawImage(img, 0, 0, w, h);
  g.restore();
}

// ---------------------------------------------------------------- eyes, the long shadow, light rain

export interface EyeGlowOpts {
  /** Distance between the two eye centres (px; 0 = one eye at (x, y)). */
  gap?: number;
  /** Second eye's y offset (px). */
  dy?: number;
  /** 0..1: how far the lids are open (the 3-frame opening). Default 1. */
  open?: number;
  /** 0..1: the narrowing, cores 3 x 2 -> 4 x 1 (the glare / the smirk). */
  narrow?: number;
  /** Strength 0..1. */
  a?: number;
  /** The cross glint's vertical arm (centre to tip, px; at most 60; the horizontal arm is 0.6 of it). 0 = none. */
  cross?: number;
  /** Core pixel size (px per core pixel: 8 on the x8 face crop). Default 1. */
  px?: number;
  /** The uv halo radius (px, default 18). */
  halo?: number;
}

/**
 * Glowing eyes (SPOTLIGHT SOLO v2): per eye a uvDeep halo (normal) under an 18 px uv glow, a 3 x 2 ivory core (4 x 1
 * narrowed) and a stage-light CROSS glint: a 4-point star, the vertical arm the longest. Never a horizontal streak,
 * never a trail, never red.
 */
export function eyeGlow(ctx: CanvasRenderingContext2D, x: number, y: number, o: EyeGlowOpts = {}) {
  const a = clamp(o.a ?? 1);
  const open = clamp(o.open ?? 1);
  if (a <= 0 || open <= 0) return;
  const gap = o.gap ?? 0;
  const pts: [number, number][] = gap ? [[x - gap / 2, y], [x + gap / 2, y + (o.dy ?? 0)]] : [[x, y]];
  const q = o.px ?? 1, H = o.halo ?? 18, nar = clamp(o.narrow ?? 0);
  const cw = lerp(3, 4, nar) * q, chh = Math.max(q * 0.5, lerp(2, 1, nar) * q * open);
  ctx.save();
  for (const [ex, ey] of pts) {
    ctx.globalCompositeOperation = 'source-over';
    drawGlow(ctx, glowOf(UVDEEP), ex, ey, H * 1.5, 0.55 * a);
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(UVC), ex, ey, H, 0.55 * a * open);
    drawGlow(ctx, glowOf(IVORY), ex, ey, Math.max(2, H * 0.3), 0.6 * a * open);
    ctx.globalAlpha = a;
    ctx.fillStyle = '#FFFAEC';
    ctx.fillRect(Math.round(ex - cw / 2), Math.round(ey - chh / 2), Math.max(1, Math.round(cw)), Math.max(1, Math.round(chh)));
    const arm = Math.min(60, o.cross ?? 0) * open;
    if (arm > 1) crossGlint(ctx, ex, ey, arm, a);
  }
  ctx.restore();
}

/** A stage-light cross glint: a 4-point star, vertical arm `arm` (centre to tip), horizontal 0.6 x, additive. */
export function crossGlint(ctx: CanvasRenderingContext2D, x: number, y: number, arm: number, a = 1) {
  if (a <= 0 || arm <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const star = (len: number, horiz: boolean, wd: number, c: RGB, al: number) => {
    ctx.fillStyle = rgba(c, al);
    ctx.beginPath();
    if (horiz) {
      ctx.moveTo(x - len, y);
      ctx.lineTo(x, y - wd);
      ctx.lineTo(x + len, y);
      ctx.lineTo(x, y + wd);
    } else {
      ctx.moveTo(x, y - len);
      ctx.lineTo(x + wd, y);
      ctx.lineTo(x, y + len);
      ctx.lineTo(x - wd, y);
    }
    ctx.closePath();
    ctx.fill();
  };
  star(arm, false, Math.max(1, arm * 0.05), LILAC, 0.55 * a);
  star(arm * 0.6, true, Math.max(1, arm * 0.04), LILAC, 0.5 * a);
  star(arm * 0.55, false, Math.max(0.6, arm * 0.022), [255, 255, 255], 0.9 * a);
  star(arm * 0.33, true, Math.max(0.6, arm * 0.02), [255, 255, 255], 0.85 * a);
  drawGlow(ctx, glowOf([226, 220, 255]), x, y, Math.max(3, arm * 0.18), 0.7 * a);
  ctx.restore();
}

/** A plane the long shadow climbs (a defender, the net, the boards): screen x, foot y0, top y1, optional mask. */
export interface ShadowClimb {
  x: number;
  y0: number;
  y1: number;
  /** The band's width (px, default the shadow's width at x). */
  w?: number;
  /** Clip the band to this drawn image (its alpha), placed at (cx, cy, cw, ch) in screen px. */
  clip?: { img: CanvasImageSource; x: number; y: number; w: number; h: number };
}

export interface LongShadowOpts {
  /** The silhouette (any opaque mask: his studio frame), rows from the head (top) to the feet (bottom). */
  sil: HTMLCanvasElement;
  footX: number;
  footY: number;
  headX: number;
  headY: number;
  /** Strip width at the feet and at the head (perspective). */
  w0: number;
  w1: number;
  /** It shoots from his feet to its head in 4 frames from t0. */
  t0: number;
  t: number;
  climb?: readonly ShadowClimb[];
  /** Eye-slits in the shadow's head from this time (two ivory 4 x 1 glints with 30 px cross glints). */
  eyes?: { at: number; gap?: number; cross?: number };
  /** Multiply strength (default 0.85). */
  a?: number;
}

/**
 * His 30 m long shadow (SPOTLIGHT SOLO v2) in screen space: horizontal slices of `sil` laid along the strip from the
 * feet (width w0) to the head (w1), shooting out over 4 frames from t0, multiplied plum at 0.85 over a 2 px volt edge;
 * on each climb plane a band rises from its foot to its top in 0.05 s once the shadow reaches it (clipped to the
 * plane's image when given); the eye-slits open in its head. A shadow: it never moves on its own or touches anyone.
 */
export function longShadow(ctx: CanvasRenderingContext2D, o: LongShadowOpts) {
  const lt = o.t - o.t0;
  if (lt < 0) return;
  const reach = clamp(lt / (4 * FRAME));
  const A = o.a ?? 0.85;
  const sil = o.sil;
  const n = 48;
  const minX = Math.min(o.footX, o.headX) - Math.max(o.w0, o.w1), maxX = Math.max(o.footX, o.headX) + Math.max(o.w0, o.w1);
  const minY = Math.min(o.footY, o.headY) - 8, maxY = Math.max(o.footY, o.headY) + 8;
  const s = scratch(maxX - minX + 8, maxY - minY + 8);
  const ox = minX - 4, oy = minY - 4;
  // Slices: u = 0 at the feet (the sil's bottom row) to reach at the head.
  for (let i = 0; i < n; i++) {
    const u0 = (i / n) * reach, u1 = ((i + 1) / n) * reach;
    const sy0 = sil.height * (1 - (i + 1) / n), sh = sil.height / n;
    const xa = lerp(o.footX, o.headX, u0), ya = lerp(o.footY, o.headY, u0);
    const yb = lerp(o.footY, o.headY, u1);
    const w = lerp(o.w0, o.w1, (u0 + u1) / 2);
    s.g.drawImage(sil, 0, sy0, sil.width, sh, xa - w / 2 - ox, Math.min(ya, yb) - oy - 0.5, w, Math.abs(yb - ya) + 1);
  }
  s.g.globalCompositeOperation = 'source-in';
  s.g.fillStyle = '#160A26';
  s.g.fillRect(0, 0, s.W, s.H);
  // The 2 px volt edge: the mask additive in volt at +-2 px, then the plum body multiplied over it.
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.45 * clamp(A / 0.85);
  for (const [dx, dy] of [[-2, 0], [2, 0], [0, -1]] as const) {
    ctx.filter = 'none';
    ctx.drawImage(tinted(s.cv, s.W, s.H, VOLT), 0, 0, s.W, s.H, ox + dx, oy + dy, s.W, s.H);
  }
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = clamp(A);
  ctx.drawImage(s.cv, 0, 0, s.W, s.H, ox, oy, s.W, s.H);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  // Climbing bands.
  const L2 = (o.headX - o.footX) ** 2 + (o.headY - o.footY) ** 2 || 1;
  for (const c of o.climb ?? []) {
    const up = clamp(((c.x - o.footX) * (o.headX - o.footX)) / L2 + 0.0);
    const start = o.t0 + 4 * FRAME * up;
    const k = clamp((o.t - start) / 0.05);
    if (k <= 0) continue;
    const w = c.w ?? lerp(o.w0, o.w1, up) * 0.6;
    const top = lerp(c.y0, c.y1, k);
    if (c.clip) {
      const b = scratch(c.clip.w, c.clip.h);
      b.g.drawImage(c.clip.img, 0, 0, c.clip.w, c.clip.h);
      b.g.globalCompositeOperation = 'source-in';
      b.g.fillStyle = '#160A26';
      b.g.fillRect(c.x - w / 2 - c.clip.x, Math.min(top, c.y0) - c.clip.y, w, Math.abs(c.y0 - top));
      b.g.globalCompositeOperation = 'destination-in';
      b.g.fillRect(c.x - w / 2 - c.clip.x, Math.min(top, c.y0) - c.clip.y, w, Math.abs(c.y0 - top));
      blitScratch(ctx, b, c.clip.x, c.clip.y, 'multiply', A);
    } else {
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = clamp(A);
      ctx.fillStyle = '#160A26';
      ctx.fillRect(c.x - w / 2, Math.min(top, c.y0), w, Math.abs(c.y0 - top));
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.4 * clamp(A / 0.85);
      ctx.fillStyle = '#A880FF';
      ctx.fillRect(c.x - w / 2 - 2, Math.min(top, c.y0), 2, Math.abs(c.y0 - top));
      ctx.fillRect(c.x + w / 2, Math.min(top, c.y0), 2, Math.abs(c.y0 - top));
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }
  }
  ctx.restore();
  // Eye-slits in the head: two 4 x 1 ivory glints with cross glints (a 1-frame sparkle as they open).
  if (o.eyes && reach >= 1 && o.t >= o.eyes.at) {
    const el = o.t - o.eyes.at;
    const ex = o.headX, ey = o.headY + Math.max(4, o.w1 * 0.12);
    eyeGlow(ctx, ex, ey, { gap: o.eyes.gap ?? Math.max(6, o.w1 * 0.18), narrow: 1, open: clamp(el / (3 * FRAME)), cross: o.eyes.cross ?? 30, halo: 10, a: el < FRAME ? 1 : 0.9 });
  }
}

const tintCv = new Map<string, HTMLCanvasElement>();
/** A colour-filled copy of a mask (one reusable canvas per colour). */
function tinted(src: HTMLCanvasElement, w: number, h: number, c: RGB): HTMLCanvasElement {
  const k = c.join(',');
  let cv = tintCv.get(k);
  if (!cv) tintCv.set(k, (cv = document.createElement('canvas')));
  if (cv.width < w || cv.height < h) {
    cv.width = Math.max(cv.width, Math.ceil(w));
    cv.height = Math.max(cv.height, Math.ceil(h));
  }
  const g = cv.getContext('2d')!;
  g.globalCompositeOperation = 'source-over';
  g.clearRect(0, 0, cv.width, cv.height);
  g.drawImage(src, 0, 0, w, h, 0, 0, w, h);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
  g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'source-over';
  return cv;
}

export interface LightRainOpts {
  /** Spawn band in y (lines start between y0 and y1; default -40 .. 160). */
  y0?: number;
  y1?: number;
  /** Speed 900 -> 200 px/s over `decel` s (defaults). */
  v0?: number;
  v1?: number;
  decel?: number;
  /** Each line fades out over its life (default 0.25 s; 0.6 on the cut-in slam). */
  life?: number;
  /** Line lengths (default 20-90 px). */
  len0?: number;
  len1?: number;
  a?: number;
  seed?: number;
}

/**
 * Light rain (SPOTLIGHT SOLO's focus lines: parallel vertical lines of light falling from the rig, never radial):
 * n 1 px lines in the band [x - w/2, x + w/2], falling at v0 -> v1 over `decel`, ivory and volt (additive) over a
 * uvDeep underlay, each fading over `life` from t0 (with a small seeded delay). Screen space; pure function of t.
 */
export function lightRain(ctx: CanvasRenderingContext2D, x: number, w: number, n: number, t0: number, t: number, o: LightRainOpts = {}) {
  const lt = t - t0;
  const life = o.life ?? 0.25;
  if (lt < 0 || lt > life + 0.08 || n <= 0) return;
  const v0 = o.v0 ?? 900, v1 = o.v1 ?? 200, dc = o.decel ?? 0.2;
  const dist = (tau: number) => (tau < dc ? v0 * tau - ((v0 - v1) / (2 * dc)) * tau * tau : v0 * dc - ((v0 - v1) / 2) * dc + v1 * (tau - dc));
  const y0 = o.y0 ?? -40, y1 = o.y1 ?? 160, sd = o.seed ?? 3, A = o.a ?? 1;
  ctx.save();
  for (let i = 0; i < n; i++) {
    const delay = 0.06 * h01(i, sd);
    const tau = lt - delay;
    if (tau < 0) continue;
    const k = clamp(1 - tau / life);
    if (k <= 0) continue;
    const lx = Math.round(x + (h01(i, sd + 1) - 0.5) * w);
    const len = lerp(o.len0 ?? 20, o.len1 ?? 90, h01(i, sd + 2));
    const ly = lerp(y0, y1, h01(i, sd + 3)) + dist(tau) * (0.8 + 0.4 * h01(i, sd + 4));
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.5 * k * A;
    ctx.fillStyle = '#2A1660';
    ctx.fillRect(lx - 1, Math.round(ly - len), 3, Math.round(len));
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = k * A;
    ctx.fillStyle = i % 3 === 0 ? '#A880FF' : '#F6F0DF';
    ctx.fillRect(lx, Math.round(ly - len), 1, Math.round(len));
  }
  ctx.restore();
}

/** The stage-light toolkit (SPOTLIGHT SOLO; v2 adds the drop beam, splash, pool, trophy, god rays and the bank surges). */
export const stage = { dim, beam, floorPool, flare, fluoroLines, dimColor, ...stageV2 };
