// Shared cinematic toolkit used by every special shot: hero sprite drawing, trails,
// fire/crimson ribbons, the ball, flames, rings, sparks, dust, grass, and time-warp helpers.

import type { Env } from './timeline';
import { PK, drawGlow, glowSprite, glowOf, type RampName } from '../engine/particles';
import { ribbon, type TrailPt } from '../art/fx';
import { BallSpin, renderBall, type BallPalette, type BallSquash } from '../engine/pixel';
import type { FxState, Shock } from '../engine/post';
import { clamp, ease, lerp, TAU, type RGB, type Rng } from '../engine/math';
import type { Camera } from '../engine/camera';
import { VW, VH } from '../engine/camera';
import { renderPuppet, type Kit, type Pose } from '../art/puppet';
import { pixelText, slamTitle } from '../art/fx';


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
 * 'blacklight' (SPOTLIGHT SOLO): a uvDeep halo and a soft violet halo (both normal blend, so nothing blooms white
 * in the dark) under a small additive ivory core: the ball's own glow under the follow-spot.
 * 'pearl' (MERIDIAN THREAD): an ink halo (normal blend, the dark halo that keeps the ball the brightest point on
 * paper) under an emerald outer glow and a pearl core glow. No heat: it is a pass, not a fireball.
 */
export function drawBall(
  env: Env, spin: BallSpin, x: number, y: number, r: number, D: number, heat = 0, glow = 0, palette: BallPalette = 'fire',
  squash?: BallSquash, o: DrawBallOpts = {},
) {
  const ctx = env.ctx;
  if (o.blaze && o.blaze > 0 && palette === 'blacklight') blacklightBlaze(ctx, x, y, r * D, o.blaze, o.blazeR);
  if (glow > 0 && palette === 'cobalt' && o.storm) {
    // GALE HAMMER v2: navy halo -> cobalt halo ring (normal blend, r x 2.6, 0.35) -> cyan additive outer glow
    // (r x 4.0, 0.4). Cobalt is never an additive glow; the ice core comes from the heat glow below.
    ctx.globalCompositeOperation = 'source-over';
    drawGlow(ctx, glowOf([10, 18, 56]), x, y, r * D * 3.4, glow * 0.6);
    drawGlow(ctx, glowOf([45, 82, 224]), x, y, r * D * 2.6, glow * 0.35);
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf([70, 216, 255]), x, y, r * D * 4.0, glow * 0.4);
    drawGlow(ctx, glowOf([238, 251, 255]), x, y, r * D * 1.9, glow * 0.6);
    ctx.globalCompositeOperation = 'source-over';
  } else if (glow > 0) {
    if (palette === 'blacklight') {
      ctx.globalCompositeOperation = 'source-over';
      drawGlow(ctx, glowOf([42, 22, 96]), x, y, r * D * 3.6, glow * 0.55);
      drawGlow(ctx, glowOf([122, 77, 255]), x, y, r * D * 2.9, glow * 0.4);
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf([246, 240, 223]), x, y, r * D * 1.8, glow * 0.45);
    } else if (palette === 'pearl') {
      ctx.globalCompositeOperation = 'source-over';
      drawGlow(ctx, glowOf([13, 13, 20]), x, y, r * D * 3, glow * 0.55);
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf([11, 143, 88]), x, y, r * D * 4.4, glow * 0.5);
      drawGlow(ctx, glowOf([251, 246, 234]), x, y, r * D * 1.8, glow * 0.65);
    } else if (palette === 'cobalt') {
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
  const cv = renderBall(r, spin, heat, true, palette, squash, o.seamGlow ? { seamGlow: o.seamGlow } : undefined);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(cv, x - (cv.width / 2) * D, y - (cv.height / 2) * D, cv.width * D, cv.height * D);
  if (heat > 0.6) {
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(palette === 'cobalt' ? [238, 251, 255] : palette === 'pearl' ? [251, 246, 234] : [255, 250, 230]), x, y, r * D * 1.3, (heat - 0.6) * 2);
    ctx.globalCompositeOperation = 'source-over';
  }
}

/** Options for drawBall (all optional; omitted = the shipped look). */
export interface DrawBallOpts {
  /**
   * SPOTLIGHT SOLO v2 ('blacklight' only), 0..1: the blazing ball. A wide uvDeep halo (normal blend) under a violet
   * halo and an additive ivory core, so the ball glows white-hot in the dark without blowing out a flat field. Drawn
   * before the ball's own glow and pixels. blazeR = the halo radius in screen px (default max(45, 3.2 x the ball
   * radius); the brief's halos run 45-150: "a 90 px halo" = blazeR 45, "a 300 px halo" = blazeR 150).
   */
  blaze?: number;
  blazeR?: number;
  /** GALE HAMMER v2's 'cobalt' re-layering (navy halo, cobalt halo ring in normal blend, cyan additive glow). */
  storm?: boolean;
  /** MERIDIAN THREAD v2: 0..1, the panel seams lit jade (renderBall's seamGlow; r >= 10 only). */
  seamGlow?: number;
}

/** SPOTLIGHT SOLO v2: the blacklight ball's blaze (see DrawBallOpts.blaze). R = the ball's screen radius. */
function blacklightBlaze(ctx: CanvasRenderingContext2D, x: number, y: number, R: number, k: number, halo?: number) {
  const a = clamp(k);
  const H = Math.max(R * 1.5, halo ?? Math.max(45, R * 3.2));
  ctx.globalCompositeOperation = 'source-over';
  drawGlow(ctx, glowOf([42, 22, 96]), x, y, H * 1.15, 0.7 * a);
  drawGlow(ctx, glowOf([122, 77, 255]), x, y, H * 0.8, 0.42 * a);
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf([168, 128, 255]), x, y, H * 0.55, 0.35 * a);
  drawGlow(ctx, glowOf([246, 240, 223]), x, y, Math.max(R * 1.9, H * 0.28), 0.6 * a);
  drawGlow(ctx, glowOf([255, 250, 236]), x, y, R * 1.35, 0.5 * a);
  ctx.globalCompositeOperation = 'source-over';
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

// ================================================================ shared v2 camera and timing helpers
// The set's only camera helpers (MERIDIAN THREAD v2, GALE HAMMER v2, SPOTLIGHT SOLO v2): keyed tracks with per-key
// easing, an additive zoom punch, a trauma floor and a lock that puts a world point on a screen point. All are pure
// functions of the shot clock (or of the camera), so every shot seeks exactly.

/** One frame at the fixed step: the length of a 'step2' / 'vacuum' snap is two of these. */
const FRAME = 1 / 60;

/** Easing names for keys() rows: every `ease` of engine/math plus the set's step and GALE presets. */
export type KeyEase =
  | keyof typeof ease
  /** Hold the previous value until this row's time, then jump. */
  | 'step'
  /** GALE: the value snaps over the last 2 frames before this row's time (linear inside them) and holds. */
  | 'step2'
  /** GALE: as 'step2' but inExpo inside the 2 frames (a sucked lurch that accelerates into the hold). */
  | 'vacuum'
  /** GALE: outCubic over the interval overshooting by 2 % of the move, settling back onto the value at the row. */
  | 'blowBack'
  | ((u: number) => number);

/** A keyed track row: [t, value, ease from the previous row to this one (default 'inOutQuad')]. */
export type KeyRow = readonly [number, number, KeyEase?];

const blowBackEase = (u: number) => (u < 0.85 ? 1.02 * ease.outCubic(u / 0.85) : 1.02 - 0.02 * ease.inOutQuad((u - 0.85) / 0.15));

/**
 * Keyed numbers with per-key easing (rows sorted by t). Before the first row: its value; after the last: the last value.
 * Between rows i-1 and i the ease of row i applies. Pure function of t.
 */
export function keys(track: readonly KeyRow[], t: number): number {
  if (!track.length) return 0;
  if (t <= track[0][0]) return track[0][1];
  for (let i = 1; i < track.length; i++) {
    const [t1, v1, e = 'inOutQuad'] = track[i];
    if (t > t1) continue;
    const [t0, v0] = track[i - 1];
    if (e === 'step') return t < t1 ? v0 : v1;
    if (e === 'step2' || e === 'vacuum') {
      const u = clamp((t - (t1 - 2 * FRAME)) / (2 * FRAME));
      return lerp(v0, v1, e === 'vacuum' ? ease.inExpo(u) : u);
    }
    const u = t1 > t0 ? clamp((t - t0) / (t1 - t0)) : 1;
    const f = typeof e === 'function' ? e : e === 'blowBack' ? blowBackEase : ease[e];
    return lerp(v0, v1, f(u));
  }
  return track[track.length - 1][1];
}

/**
 * An additive zoom envelope: 0 before `at`, rising to `amt` over `tin` (inExpo: a snap at the end), then back to 0
 * over `tout` (outCubic). Pure function of t. SOLO's punch(t, at, amt, dur) is punch(t, at, amt, 0.25·dur, 0.75·dur).
 */
export function punch(t: number, at: number, amt: number, tin = 0.05, tout = 0.3): number {
  if (t < at) return 0;
  if (t < at + tin) return amt * ease.inExpo(clamp((t - at) / Math.max(1e-6, tin)));
  const u = (t - at - tin) / Math.max(1e-6, tout);
  return u >= 1 ? 0 : amt * (1 - ease.outCubic(u));
}

/** Call in update(): trauma never decays below `floor` (a held tremor). */
export function holdTrauma(cam: Camera, floor: number) {
  if (cam.trauma < floor) cam.trauma = Math.min(1, floor);
}

/** Set the camera (rot 0) so world (wx, wy) lands on screen (sx, sy) at `zoom`: every lock, crash and punch-in. */
export function zoomAbout(cam: Camera, wx: number, wy: number, sx: number, sy: number, zoom: number) {
  cam.zoom = zoom;
  cam.rot = 0;
  cam.x = wx - (sx - VW / 2) / zoom;
  cam.y = wy - (sy - VH / 2) / zoom;
}

// ================================================================ shared puppet cache (moved here for the v2 set)

/** Silhouette colours for PuppetCache (a fill with a lit rim on the light side). */
export interface PuppetSil {
  fill?: RGB;
  rim?: RGB;
  rim2?: RGB;
  /** Light direction (screen, y down). */
  lx: number;
  ly: number;
}

/** SPOTLIGHT SOLO's silhouette colours (plum fill, lilac rim, ultraviolet outer rim): the default. */
export const PUPPET_SIL_DEFAULT: { fill: RGB; rim: RGB; rim2: RGB } = { fill: [26, 15, 46], rim: [201, 182, 255], rim2: [122, 77, 255] };

/**
 * The shared puppet cache (SPOTLIGHT SOLO's class, generalised): every (pose name, kit, scale, facing, silhouette) is
 * rendered once into its own canvas. Opponents in the v2 specials render through it (at most 3-4 live renders per frame,
 * counted in `draws` since the last frame()). `name` keys the pose: give each distinct pose its own name.
 */
export class PuppetCache {
  private m = new Map<string, { cv: HTMLCanvasElement; ox: number; oy: number }>();
  /** Puppet draws since the last frame() call (a dev budget check). */
  draws = 0;
  get(name: string, kit: Kit, pose: Pose, k: number, facing: 1 | -1 = 1, sil?: PuppetSil) {
    const sc = sil ? { ...PUPPET_SIL_DEFAULT, ...sil } : undefined;
    const key = `${name}|${kit.hair[0]}|${kit.skin[0]}|${kit.shirt[0]}|${k}|${facing}|${sc ? `${sc.lx},${sc.ly},${sc.fill},${sc.rim},${sc.rim2}` : ''}`;
    let r = this.m.get(key);
    if (!r) {
      const out = renderPuppet(kit, pose, { k, facing, silhouette: sc ? { fill: sc.fill, rim: sc.rim, rim2: sc.rim2, lx: sc.lx, ly: sc.ly } : undefined });
      const cv = document.createElement('canvas');
      cv.width = out.cv.width;
      cv.height = out.cv.height;
      cv.getContext('2d')!.drawImage(out.cv, 0, 0);
      this.m.set(key, (r = { cv, ox: out.ox, oy: out.oy }));
    }
    return r;
  }
  /**
   * Draw a cached pose so its hip lands on (x, y) at D world px per puppet px; `lit` 0 = silhouette, 1 = full colour
   * (in between: the silhouette under a partly lit body). `rot` turns it about the hip.
   */
  draw(
    ctx: CanvasRenderingContext2D, name: string, kit: Kit, pose: Pose, k: number, facing: 1 | -1, x: number, y: number, D: number,
    lit = 1, sil: PuppetSil = { lx: 0.6, ly: -0.8 }, alpha = 1, rot = 0,
  ) {
    const l = clamp(lit);
    this.draws++;
    ctx.imageSmoothingEnabled = false;
    const one = (r: { cv: HTMLCanvasElement; ox: number; oy: number }, a: number) => {
      if (a <= 0) return;
      ctx.globalAlpha = a;
      if (rot) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.drawImage(r.cv, -r.ox * D, -r.oy * D, r.cv.width * D, r.cv.height * D);
        ctx.restore();
      } else ctx.drawImage(r.cv, x - r.ox * D, y - r.oy * D, r.cv.width * D, r.cv.height * D);
    };
    if (l < 1) one(this.get(name, kit, pose, k, facing, sil), alpha);
    if (l > 0) one(this.get(name, kit, pose, k, facing), alpha * l);
    ctx.globalAlpha = 1;
  }
  /** Start a new frame's draw count. */
  frame() {
    this.draws = 0;
  }
  clear() {
    this.m.clear();
  }
}

// ================================================================ shared name card

/** A name-card colour set. */
export interface NameCardStyle {
  bg: string;
  top: string;
  bottom: string;
  title: { fill: string; fill2: string; stroke: string; outer: string };
  line2: string;
  score: string;
  outline: string;
  /** Fill down to the bottom of the frame (SOLO) instead of a 62 px band. */
  full?: boolean;
}

/** The three v2 styles (the shipped cards' colours). */
export const NAME_CARD_STYLES = {
  gale: {
    bg: 'rgba(8,12,30,0.88)', top: '#2D52E0', bottom: '#46D8FF',
    title: { fill: '#EEFBFF', fill2: '#8fe3ff', stroke: '#2D52E0', outer: '#0A1238' }, line2: '#46D8FF', score: '#ffffff', outline: '#0A1238',
  },
  meridian: {
    bg: 'rgba(13,13,20,0.9)', top: '#0B8F58', bottom: '#2FE08A',
    title: { fill: '#FBF6EA', fill2: '#d9f5e4', stroke: '#0B8F58', outer: '#0D0D14' }, line2: '#2FE08A', score: '#ffffff', outline: '#0D0D14',
  },
  solo: {
    bg: 'rgba(22,10,38,0.9)', top: '#7A4DFF', bottom: '#C9B6FF',
    title: { fill: '#F6F0DF', fill2: '#C9B6FF', stroke: '#7A4DFF', outer: '#160A26' }, line2: '#C9B6FF', score: '#F6F0DF', outline: '#160A26', full: true,
  },
} satisfies Record<string, NameCardStyle>;

export interface NameCardOpts {
  /** The special's name (left, slammed in at 30 px). */
  title: string;
  /** The small line above it (e.g. 'No.10  ·  SPECIAL SHOT'). */
  line2: string;
  /** Right side (e.g. 'CAM 1 - 0 RIV'). */
  score: string;
  style: keyof typeof NAME_CARD_STYLES | NameCardStyle;
  /** Draw the title yourself (e.g. MERIDIAN's stitched title) at its baseline-left (x, y), 30 px; t = card time. */
  titleFn?(ctx: CanvasRenderingContext2D, x: number, y: number, t: number): void;
}

/**
 * The one name card of the set: slides in at the bottom over 0.35 s (outCubic) with the title (left), the small line
 * above it and the score (right). t = seconds since it starts; screen space.
 */
export function nameCard(ctx: CanvasRenderingContext2D, t: number, o: NameCardOpts) {
  const st: NameCardStyle = typeof o.style === 'string' ? NAME_CARD_STYLES[o.style] : o.style;
  const card = ease.outCubic(clamp(t / 0.35));
  if (card <= 0) return;
  const y = lerp(VH + 40, 286, card);
  ctx.fillStyle = st.bg;
  ctx.fillRect(0, y - 6, VW, st.full ? VH - (y - 6) + 2 : 62);
  ctx.fillStyle = st.top;
  ctx.fillRect(0, y - 6, VW, 3);
  ctx.fillStyle = st.bottom;
  ctx.fillRect(0, y + 53, VW, 3);
  if (o.titleFn) o.titleFn(ctx, 40, y + 47, t);
  else slamTitle(ctx, o.title, 40, y + 47, 30, t, { stagger: 0.02, align: 'left', ...st.title });
  pixelText(ctx, o.line2, 40, y + 1, 10, st.line2, 'left', st.outline);
  pixelText(ctx, o.score, VW - 40, y + 20, 14, st.score, 'right', st.outline);
}

// ================================================================ shared net mesh (ZENITH's spring mesh, generalised)

/**
 * A goal net as a z-only spring mesh (cols x rows cells over a rest rectangle, pinned at its frame), extracted from
 * ZENITH METEOR's net shot and generalised for the v2 set. z = displacement away from the viewer (world px).
 */
export class NetMesh {
  readonly n: number;
  z: Float32Array;
  vz: Float32Array;
  /** Snapped strands: the horizontal strand right of node k / the vertical strand below node k. */
  brokenH: Uint8Array;
  brokenV: Uint8Array;
  /** Per-strand transverse vibration offsets (screen px), filled by ringStrands(). */
  ring: Float32Array;
  constructor(
    public cols: number, public rows: number,
    /** The rest rectangle (screen or panel coordinates). */
    public x0: number, public y0: number, public x1: number, public y1: number,
    /** Spring constants: neighbour stiffness, damping, pull back to rest. */
    public k = { tension: 1400, damp: 5, pull: 6 },
  ) {
    this.n = (cols + 1) * (rows + 1);
    this.z = new Float32Array(this.n);
    this.vz = new Float32Array(this.n);
    this.brokenH = new Uint8Array(this.n);
    this.brokenV = new Uint8Array(this.n);
    this.ring = new Float32Array(this.n);
  }
  idx(i: number, j: number) {
    return j * (this.cols + 1) + i;
  }
  restX(i: number) {
    return lerp(this.x0, this.x1, i / this.cols);
  }
  restY(j: number) {
    return lerp(this.y0, this.y1, j / this.rows);
  }
  reset() {
    this.z.fill(0);
    this.vz.fill(0);
    this.brokenH.fill(0);
    this.brokenV.fill(0);
    this.ring.fill(0);
  }
  /** Press the net out to at least depth pz in a gaussian of radius sigma round (px, py). */
  push(px: number, py: number, pz: number, sigma: number) {
    const { cols, rows, z, vz } = this;
    for (let j = 1; j < rows; j++)
      for (let i = 1; i < cols; i++) {
        const dx = this.restX(i) - px, dy = this.restY(j) - py;
        const target = pz * Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
        const k = this.idx(i, j);
        if (target > z[k]) {
          z[k] = target;
          vz[k] = Math.max(vz[k], 0);
        }
      }
  }
  /** Advance the springs by dt (sub substeps). */
  step(dt: number, sub = 3) {
    const { cols, rows, z, vz, brokenH, brokenV } = this;
    const { tension, damp, pull } = this.k;
    const h = dt / sub;
    for (let s = 0; s < sub; s++) {
      for (let j = 1; j < rows; j++)
        for (let i = 1; i < cols; i++) {
          const k = this.idx(i, j);
          let sum = 0, cnt = 0;
          if (!brokenH[this.idx(i - 1, j)]) { sum += z[this.idx(i - 1, j)]; cnt++; }
          if (!brokenH[k]) { sum += z[this.idx(i + 1, j)]; cnt++; }
          if (!brokenV[this.idx(i, j - 1)]) { sum += z[this.idx(i, j - 1)]; cnt++; }
          if (!brokenV[k]) { sum += z[this.idx(i, j + 1)]; cnt++; }
          const avg = cnt ? sum / cnt : 0;
          vz[k] += ((avg - z[k]) * tension - vz[k] * damp - z[k] * pull) * h;
        }
      for (let k = 0; k < z.length; k++) z[k] += vz[k] * h;
    }
  }
  /**
   * The goal-mouth projection (ZENITH's): a node at rest (x, y) pushed z away is drawn at
   * (cx + (x - cx)·s, cy + (y - cy)·s), s = f / (f - min(z, 0.82 f)).
   */
  static front(cx: number, cy: number, f: number) {
    return (x: number, y: number, z: number): [number, number, number] => {
      const s = f / (f - Math.min(z, f * 0.82));
      return [cx + (x - cx) * s, cy + (y - cy) * s, s];
    };
  }
  /**
   * Stroke the unbroken strands through `proj`. `light` (optional, from netLight) gives each node 0..1; strands are
   * then stroked in `buckets` light levels with colours from `color(level)`.
   */
  draw(
    ctx: CanvasRenderingContext2D, proj: (x: number, y: number, z: number) => [number, number, number?],
    o: { color?: string | ((l: number) => string); width?: number; light?: Float32Array; buckets?: number } = {},
  ) {
    const { cols, rows, z, ring } = this;
    const B = o.light ? Math.max(1, o.buckets ?? 4) : 1;
    ctx.lineWidth = o.width ?? 1.4;
    for (let b = 0; b < B; b++) {
      const lv = B > 1 ? (b + 0.5) / B : 1;
      ctx.strokeStyle = typeof o.color === 'function' ? o.color(lv) : o.color ?? 'rgba(232,236,255,0.82)';
      ctx.beginPath();
      for (let j = 0; j <= rows; j++)
        for (let i = 0; i <= cols; i++) {
          const k = this.idx(i, j);
          if (o.light && Math.min(B - 1, Math.floor(o.light[k] * B)) !== b) continue;
          const [x, y] = proj(this.restX(i), this.restY(j) + ring[k], z[k]);
          if (i < cols && !this.brokenH[k]) {
            const k2 = this.idx(i + 1, j);
            const [x2, y2] = proj(this.restX(i + 1), this.restY(j) + ring[k2], z[k2]);
            ctx.moveTo(x, y);
            ctx.lineTo(x2, y2);
          }
          if (j < rows && !this.brokenV[k]) {
            const k2 = this.idx(i, j + 1);
            const [x2, y2] = proj(this.restX(i), this.restY(j + 1) + ring[k2], z[k2]);
            ctx.moveTo(x, y);
            ctx.lineTo(x2, y2);
          }
        }
      ctx.stroke();
    }
  }
}

/**
 * Per-node light of a net (0..1) by rest distance from the entry point: 1 at the entry falling to 0 at `reach` px,
 * scaled by p (0..1, the light's progress). Pair with NetMesh.draw's `light` and a colour ramp (MERIDIAN: pearl ->
 * jade -> emerald). Writes into `out` when given.
 */
export function netLight(mesh: NetMesh, entry: { x: number; y: number }, p: number, reach = 220, out?: Float32Array): Float32Array {
  const L = out && out.length === mesh.n ? out : new Float32Array(mesh.n);
  for (let j = 0; j <= mesh.rows; j++)
    for (let i = 0; i <= mesh.cols; i++) {
      const d = Math.hypot(mesh.restX(i) - entry.x, mesh.restY(j) - entry.y);
      L[mesh.idx(i, j)] = clamp((1 - d / (reach * Math.max(0.05, p))) * Math.min(1, p * 1.5));
    }
  return L;
}

/**
 * Per-strand transverse vibration: each column rings as a plucked string, amplitude `amp` px decaying with exp(-age /
 * decay), mode shapes sin(π·v) along the strand, frequencies spread by column. `age` = seconds since the pluck.
 */
export function ringStrands(mesh: NetMesh, amp: number, decay: number, age = 0, hz = 9) {
  const a = amp * Math.exp(-Math.max(0, age) / Math.max(1e-3, decay));
  for (let j = 0; j <= mesh.rows; j++)
    for (let i = 0; i <= mesh.cols; i++) {
      const v = j / mesh.rows;
      const f = hz * (1 + 0.13 * (i % 5));
      mesh.ring[mesh.idx(i, j)] = a * Math.sin(Math.PI * v) * Math.sin(TAU * f * age + i * 0.7);
    }
}
