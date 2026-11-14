// Shared cinematic toolkit used by every special shot: hero sprite drawing, trails,
// fire/crimson ribbons, the ball, flames, rings, sparks, dust, grass, and time-warp helpers.

import type { Env } from './timeline';
import { PK, drawGlow, glowSprite, glowOf } from '../engine/particles';
import { ribbon, type TrailPt } from '../art/fx';
import { BallSpin, renderBall, type BallPalette } from '../engine/pixel';
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

/** Layered fire ribbon: crimson halo, orange body, white-hot core. */
export function fireRibbon(ctx: CanvasRenderingContext2D, pts: TrailPt[], w: number, a = 1) {
  if (pts.length < 2) return;
  ctx.globalCompositeOperation = 'lighter';
  ribbon(ctx, pts, 0, w * 2.4, 'rgb(170,20,40)', 0.35 * a);
  ribbon(ctx, pts, 0, w * 1.5, 'rgb(255,90,30)', 0.55 * a);
  ribbon(ctx, pts, 0, w * 0.8, 'rgb(255,200,90)', 0.75 * a);
  ribbon(ctx, pts, 0, w * 0.32, 'rgb(255,255,235)', 0.95 * a);
  ctx.globalCompositeOperation = 'source-over';
}

/** Ball with optional heat glow. r = pixel radius of the art; D = draw scale. */
export function drawBall(env: Env, spin: BallSpin, x: number, y: number, r: number, D: number, heat = 0, glow = 0, palette: BallPalette = 'fire') {
  const ctx = env.ctx;
  if (glow > 0) {
    ctx.globalCompositeOperation = 'lighter';
    if (palette === 'crimson') {
      drawGlow(ctx, glowSprite('aura', 0.55), x, y, r * D * 5, glow * 0.6);
      drawGlow(ctx, glowOf([255, 220, 235]), x, y, r * D * 2, glow * 0.7);
    } else {
      drawGlow(ctx, glowSprite('fire', 0.35), x, y, r * D * 5, glow * 0.7);
      drawGlow(ctx, glowSprite('fire', 0.05), x, y, r * D * 2.2, glow);
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  const cv = renderBall(r, spin, heat, true, palette);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(cv, x - (cv.width / 2) * D, y - (cv.height / 2) * D, cv.width * D, cv.height * D);
  if (heat > 0.6) {
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf([255, 250, 230]), x, y, r * D * 1.3, (heat - 0.6) * 2);
    ctx.globalCompositeOperation = 'source-over';
  }
}

/** Meteor head: corona flames around a white-hot ball. dir = travel direction (radians). */
export function meteorFlames(env: Env, x: number, y: number, R: number, dir: number, intensity: number, dt: number, palette: BallPalette = 'fire') {
  const flameRamp = palette === 'crimson' ? 'crimson' : 'fire';
  const sparkRamp = palette === 'crimson' ? 'silver' : 'ember';
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
export function ring(env: Env, x: number, y: number, r0: number, r1: number, dur: number, squash = 1, rampName: 'gold' | 'white' | 'cyan' | 'fire' | 'aura' | 'crimson' | 'silver' = 'gold', rot = 0) {
  env.parts.spawn({ kind: PK.Ring, x, y, s0: r0, s1: r1, max: dur, k: squash, ramp: rampName, r0: 0, r1: 0.9, a0: 1, a1: 0, rot });
}

/** Burst of sparks in all directions (or a cone). */
export function sparks(env: Env, x: number, y: number, n: number, speed: number, cone = TAU, dir = 0, rampName: 'ember' | 'gold' | 'cyan' | 'white' | 'crimson' | 'silver' = 'ember') {
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
