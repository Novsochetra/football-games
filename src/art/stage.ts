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
 * elliptical holes punched out with destination-out radial gradients (up to 2 pools, screen space), multiplied onto
 * the frame. Skipped when level is 0. Level is capped at DIM_MAX unless o.uncapped (the launch blackout).
 */
function dim(ctx: CanvasRenderingContext2D, level: number, pools: readonly StagePool[] = [], o: { color?: RGB; uncapped?: boolean } = {}) {
  const l = o.uncapped ? clamp(level) : Math.min(DIM_MAX, clamp(level));
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
  for (const p of pools.slice(0, 2)) {
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

/** The stage-light toolkit (SPOTLIGHT SOLO). */
export const stage = { dim, beam, floorPool, flare, fluoroLines, dimColor };
