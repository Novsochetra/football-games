// Shared cinematic toolkit used by every special shot: hero sprite drawing, trails,
// fire/crimson ribbons, the ball, flames, rings, sparks, dust, grass, and time-warp helpers.

import type { Env } from './timeline';
import { PK, drawGlow, glowSprite, glowOf, type RampName } from '../engine/particles';
import { ribbon, type TrailPt } from '../art/fx';
import { BallSpin, renderBall, type BallPalette, type BallSquash } from '../engine/pixel';
import type { FxState, Shock } from '../engine/post';
import { clamp, TAU, type Rng } from '../engine/math';


/** Draw the hand-drawn hero so his feet land on (x,y). */
export function drawHero(env: Env, x: number, y: number, scale: number, img?: HTMLCanvasElement, alpha = 1) {
  const h = env.art.hero;
  const ctx = env.ctx;
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = alpha;
  ctx.drawImage(img || h.img, x - h.footX * scale, y - h.footY * scale, h.w * scale, h.h * scale);
  ctx.globalAlpha = 1;
}

/** Position history for ribbon trails. */
export class Trail {
  pts: TrailPt[] = [];
  constructor(public max = 24) {}
  push(x: number, y: number) {
    this.pts.push({ x, y });
    if (this.pts.length > this.max) this.pts.shift();
  }
  clear() {
    this.pts.length = 0;
  }
}

/**
 * Layered fire ribbon: crimson halo, orange body, white-hot core.
 * head = the ball's on-screen radius (art radius x draw scale). When given, every layer narrows into
 * a round head centred on the ball (outer layers a little larger than the ball, the core about its
 * radius), so the trail reads as a comet tail flowing out of the ball instead of ending in a flat band.
 */
export function fireRibbon(ctx: CanvasRenderingContext2D, pts: TrailPt[], w: number, a = 1, head?: number) {
  if (pts.length < 2) return;
  ctx.globalCompositeOperation = 'lighter';
  if (head === undefined) {
    ribbon(ctx, pts, 0, w * 2.4, 'rgb(170,20,40)', 0.35 * a);
    ribbon(ctx, pts, 0, w * 1.5, 'rgb(255,90,30)', 0.55 * a);
    ribbon(ctx, pts, 0, w * 0.8, 'rgb(255,200,90)', 0.75 * a);
    ribbon(ctx, pts, 0, w * 0.32, 'rgb(255,255,235)', 0.95 * a);
  } else {
    cometLayer(ctx, pts, w * 2.4, head * 1.7, 'rgb(170,20,40)', 0.35 * a);
    cometLayer(ctx, pts, w * 1.5, head * 1.4, 'rgb(255,90,30)', 0.55 * a);
    cometLayer(ctx, pts, w * 0.8, head * 1.15, 'rgb(255,200,90)', 0.75 * a);
    cometLayer(ctx, pts, w * 0.32, head, 'rgb(255,255,235)', 0.95 * a);
  }
  ctx.globalCompositeOperation = 'source-over';
}

/**
 * One fireRibbon layer with a round head. The tail grows from 0 to `w` along the trail as ribbon()
 * does; near the head the half-width is softly limited by a flare that opens from `cap` at the ball
 * (zero slope there) at about COMET_FLARE px per px of trail, and the head itself is a full circle of
 * the resulting radius on the last point, so the outline wraps round the ball with no corners.
 */
const COMET_FLARE = 0.4;
function cometLayer(ctx: CanvasRenderingContext2D, pts: TrailPt[], w: number, cap: number, color: string, alpha: number) {
  const n = pts.length;
  if (n < 2 || alpha <= 0) return;
  // Arc length back from the head, and a fallback direction for repeated points.
  const s: number[] = new Array(n).fill(0);
  let fx = 0, fy = 0;
  for (let i = n - 2; i >= 0; i--) {
    const dx = pts[i + 1].x - pts[i].x, dy = pts[i + 1].y - pts[i].y;
    const l = Math.hypot(dx, dy);
    s[i] = s[i + 1] + l;
    if (!fx && !fy && l > 1e-3) [fx, fy] = [dx / l, dy / l];
  }
  if (!fx && !fy) fx = 1;
  const L: [number, number][] = [], R: [number, number][] = [];
  let tx = fx, ty = fy, hw = 0;
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    const dx = b.x - a.x, dy = b.y - a.y;
    const l = Math.hypot(dx, dy);
    if (l > 1e-3) [tx, ty] = [dx / l, dy / l];
    const lin = 0.5 * w * (i / (n - 1));
    const fl = Math.hypot(cap, COMET_FLARE * s[i]);
    // Soft minimum of the tail width and the head flare (no ridge where they meet).
    hw = lin > 0 ? Math.pow(Math.pow(lin, -4) + Math.pow(fl, -4), -0.25) : 0;
    L.push([pts[i].x - ty * hw, pts[i].y + tx * hw]);
    R.push([pts[i].x + ty * hw, pts[i].y - tx * hw]);
  }
  ctx.globalAlpha = clamp(alpha);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(L[0][0], L[0][1]);
  for (let i = 1; i < n; i++) ctx.lineTo(L[i][0], L[i][1]);
  for (let i = n - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]);
  ctx.closePath();
  // Round head: a circle wound the same way as the body, so the union fills once (nonzero rule).
  let area = 0;
  const poly = L.concat(R.slice().reverse());
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length];
    area += p[0] * q[1] - q[0] * p[1];
  }
  const h = pts[n - 1];
  ctx.moveTo(h.x + hw, h.y);
  ctx.arc(h.x, h.y, hw, 0, TAU, area < 0);
  ctx.fill();
  ctx.globalAlpha = 1;
}

/**
 * Ball with optional heat glow. r = pixel radius of the art; D = draw scale.
 * squash (optional, see BallSquash): squash-and-stretch with a flattened contact face on the −x side.
 * 'cobalt' (GALE HAMMER): a navy halo (normal blend) under a cobalt halo and an ice core, so the glow never
 * blows out on pale grass or in front of the floodlights.
 */
export function drawBall(
  env: Env, spin: BallSpin, x: number, y: number, r: number, D: number, heat = 0, glow = 0, palette: BallPalette = 'fire',
  squash?: BallSquash,
) {
  const ctx = env.ctx;
  if (glow > 0) {
    if (palette === 'cobalt') {
      ctx.globalCompositeOperation = 'source-over';
      drawGlow(ctx, glowOf([10, 18, 56]), x, y, r * D * 3.4, glow * 0.6);
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowSprite('cobalt', 0.55), x, y, r * D * 4.6, glow * 0.5);
      drawGlow(ctx, glowOf([238, 251, 255]), x, y, r * D * 1.9, glow * 0.6);
    } else {
      ctx.globalCompositeOperation = 'lighter';
      if (palette === 'crimson') {
        drawGlow(ctx, glowSprite('aura', 0.55), x, y, r * D * 5, glow * 0.6);
        drawGlow(ctx, glowOf([255, 220, 235]), x, y, r * D * 2, glow * 0.7);
      } else {
        drawGlow(ctx, glowSprite('fire', 0.35), x, y, r * D * 5, glow * 0.7);
        drawGlow(ctx, glowSprite('fire', 0.05), x, y, r * D * 2.2, glow);
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  const cv = renderBall(r, spin, heat, true, palette, squash);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(cv, x - (cv.width / 2) * D, y - (cv.height / 2) * D, cv.width * D, cv.height * D);
  if (heat > 0.6) {
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(palette === 'cobalt' ? [238, 251, 255] : [255, 250, 230]), x, y, r * D * 1.3, (heat - 0.6) * 2);
    ctx.globalCompositeOperation = 'source-over';
  }
}

/** Meteor head: corona flames around a white-hot ball. dir = travel direction (radians). */
export function meteorFlames(env: Env, x: number, y: number, R: number, dir: number, intensity: number, dt: number, palette: BallPalette = 'fire') {
  const flameRamp: RampName = palette === 'crimson' ? 'crimson' : palette === 'cobalt' ? 'cobalt' : 'fire';
  const sparkRamp: RampName = palette === 'crimson' ? 'silver' : palette === 'cobalt' ? 'dew' : 'ember';
  const p = env.parts;
  const rng = env.rng;
  const back = dir + Math.PI;
  const n = Math.ceil(36 * intensity * dt * 60) / 1;
  for (let i = 0; i < n; i++) {
    const a = back + rng.range(-0.7, 0.7);
    const sp = rng.range(80, 300) * intensity;
    p.spawn({
      kind: PK.Glow, x: x + rng.range(-R, R) * 0.6, y: y + rng.range(-R, R) * 0.6,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 2,
      max: rng.range(0.25, 0.6), s0: R * rng.range(0.8, 1.6), s1: R * 0.2, ramp: flameRamp, r0: 0.05, r1: 1, a0: 0.9, a1: 0,
      layer: 0,
    });
  }
  if (rng.next() < 0.7 * intensity) {
    const a = back + rng.range(-0.4, 0.4);
    p.spawn({
      kind: PK.Streak, x, y, vx: Math.cos(a) * rng.range(300, 700), vy: Math.sin(a) * rng.range(300, 700),
      drag: 3, max: rng.range(0.2, 0.5), s0: rng.range(1, 2.2), s1: 0.5, ramp: sparkRamp, r0: 0, r1: 1, k: 1.4, layer: 1,
    });
  }
}

/** Expanding ring particles (shock rings) */
export function ring(env: Env, x: number, y: number, r0: number, r1: number, dur: number, squash = 1, rampName: RampName = 'gold', rot = 0) {
  env.parts.spawn({ kind: PK.Ring, x, y, s0: r0, s1: r1, max: dur, k: squash, ramp: rampName, r0: 0, r1: 0.9, a0: 1, a1: 0, rot });
}

/** Burst of sparks in all directions (or a cone). */
export function sparks(env: Env, x: number, y: number, n: number, speed: number, cone = TAU, dir = 0, rampName: RampName = 'ember') {
  const rng = env.rng;
  for (let i = 0; i < n; i++) {
    const a = dir + rng.range(-cone / 2, cone / 2);
    const s = speed * rng.range(0.3, 1);
    env.parts.spawn({
      kind: PK.Streak, x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 3.5, ay: 200,
      max: rng.range(0.25, 0.7), s0: rng.range(1, 2.5), s1: 0.4, ramp: rampName, r0: 0, r1: 1, k: 1.2,
    });
  }
}

export function dustBurst(env: Env, x: number, y: number, n: number, spread: number, up = 1) {
  const rng = env.rng;
  for (let i = 0; i < n; i++) {
    const a = rng.range(Math.PI * 1.05, Math.PI * 1.95);
    const s = rng.range(40, 220) * spread;
    env.parts.spawn({
      kind: PK.Smoke, x: x + rng.range(-8, 8), y, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.35 * up, drag: 3,
      max: rng.range(0.5, 1.1), s0: rng.range(6, 12), s1: rng.range(16, 30), ramp: 'dust', r0: 0, r1: 1, a0: 0.55, a1: 0, add: false,
    });
  }
}

export function grassChunks(env: Env, x: number, y: number, n: number, power: number) {
  const rng = env.rng;
  for (let i = 0; i < n; i++) {
    const a = rng.range(-Math.PI * 0.85, -Math.PI * 0.15);
    const s = rng.range(120, 380) * power;
    env.parts.spawn({
      kind: PK.Debris, x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, ay: 900, drag: 0.6, vrot: rng.range(-12, 12),
      max: rng.range(0.5, 1), s0: rng.range(1.5, 3.5), s1: 1.5, ramp: 'grass', r0: rng.next(), r1: rng.next(), a0: 1, a1: 1, add: false,
    });
  }
}

/** Hit-stop helper: returns sim rate given a list of [start, len, rate] windows. */
export function warp(t: number, windows: [number, number, number][]) {
  for (const [s, l, r] of windows) if (t >= s && t < s + l) return r;
  return 1;
}

/** 0..1 pulse that peaks at `at` and decays over `len`. */
export function pulse(t: number, at: number, len: number) {
  if (t < at) return 0;
  return clamp(1 - (t - at) / len);
}


/** Layered crimson ribbon: deep crimson halo, rose body, silver-white core (CRIMSON CRESCENT look). */
export function crimsonRibbon(ctx: CanvasRenderingContext2D, pts: TrailPt[], w: number, a = 1) {
  if (pts.length < 2) return;
  ctx.globalCompositeOperation = 'lighter';
  ribbon(ctx, pts, 0, w * 2.4, 'rgb(120,6,40)', 0.4 * a);
  ribbon(ctx, pts, 0, w * 1.5, 'rgb(230,30,70)', 0.55 * a);
  ribbon(ctx, pts, 0, w * 0.8, 'rgb(255,120,150)', 0.7 * a);
  ribbon(ctx, pts, 0, w * 0.3, 'rgb(245,245,255)', 0.95 * a);
  ctx.globalCompositeOperation = 'source-over';
}

/**
 * Add a post-FX shock ring, respecting the shader's 4-slot limit: when all 4 slots are taken, the new ring
 * replaces the weakest one (smallest |s|) if it is stronger, otherwise it is dropped. Returns true if kept.
 */
export function pushShock(fx: FxState, sh: Shock): boolean {
  if (fx.shocks.length < 4) {
    fx.shocks.push(sh);
    return true;
  }
  let k = 0;
  for (let i = 1; i < 4; i++) if (Math.abs(fx.shocks[i].s) < Math.abs(fx.shocks[k].s)) k = i;
  if (Math.abs(fx.shocks[k].s) >= Math.abs(sh.s)) return false;
  fx.shocks[k] = sh;
  return true;
}
