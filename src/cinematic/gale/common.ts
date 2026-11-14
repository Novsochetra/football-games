// Shared pieces for the GALE HAMMER shots (brief: SPEC.md in this folder; engine notes: the GALE ENGINE
// sheet). Generic helpers come from ../kit; this file adds the move's palette, the stamp positions, the
// muffle envelopes and the drawing helpers it owns (pressure stamps, isobars, the vapour ribbon, the Mach
// cone and wake, air slivers, the dew mirror, the net's exhale, the droplet curtain, the recoil spring).
//
// Rules every helper follows: additive cyan/ice always sits on a navy halo drawn in normal blend (no
// blow-outs on pale grass or floodlights); vapour is soft and turbulent (never a taut line); nothing joins
// the stamps; particles are spawned only from update() on env.rng; draw helpers are pure functions of
// their arguments (seek-safe).

import type { Env, Shot } from '../timeline';
import type { FxState } from '../../engine/post';
import { VW, VH } from '../../engine/camera';
import { PK, drawGlow, glowOf, glowSprite, softSprite } from '../../engine/particles';
import { TAU, clamp, ease, lerp, noise1, type RGB, type Rng } from '../../engine/math';
import { pixelText, ribbon, slamTitle, type TrailPt } from '../../art/fx';
import { drawNo10, no10Point, type No10Key } from '../../art/no10';
import { grassChunks, pushShock } from '../kit';

export * from '../kit';
export { drawNo10, drawNo10Boxed, no10, no10Anchor, no10Final, no10Point, NO10, type No10Key } from '../../art/no10';
export { drawDownPitch, projectDecal, DOWN_PITCH_VIEW, type DownPitchView, type Projected } from '../../art/stadium';
export { AIR_TONES } from '../../engine/audio';

export const SHOT_NAME = 'GALE HAMMER';

// ---------------------------------------------------------------- palette and grade

/** Signature palette (SPEC "GALE HAMMER palette and owned motifs"). */
export const PAL: Record<'ice' | 'cyan' | 'cobalt' | 'navy' | 'pressed' | 'pressedCore', RGB> = {
  ice: [238, 251, 255],
  cyan: [70, 216, 255],
  cobalt: [45, 82, 224],
  navy: [10, 18, 56],
  pressed: [155, 224, 138],
  pressedCore: [30, 90, 42],
};
/** The same colours as CSS hex strings. */
export const HEX = { ice: '#EEFBFF', cyan: '#46D8FF', cobalt: '#2D52E0', navy: '#0A1238', pressed: '#9BE08A', pressedCore: '#1E5A2A' } as const;
/** Dew ramp (also the 'dew' particle ramp). */
export const DEW: RGB[] = [[255, 255, 255], [214, 248, 255], [140, 220, 255], [70, 150, 210]];

/** Transition colours. */
export const BLINK: Record<'ice' | 'popFlash' | 'cyan' | 'navy' | 'fade' | 'flashIn', RGB> = {
  ice: [238, 251, 255], // shot 2 -> 3 ice flash
  popFlash: [220, 248, 255], // shot 1 ring-pop
  cyan: [70, 216, 255], // shot 4 -> 5 cyan blink
  navy: [10, 18, 56], // shot 5 -> 6 navy blink
  fade: [8, 4, 14], // shot 6 fade (the result view fades up from it)
  flashIn: [190, 240, 255], // shot 2 cyan flash-in
};

/**
 * The move's grade: high-key floodlit, cool tint around [228,242,255], contrast 1.06, saturation 1 (GALE never
 * desaturates). k 0..1 blends from the neutral grade. Extra contrast / vignette can be added on top.
 */
export function galeGrade(fx: FxState, k = 1, tint: RGB = [228, 242, 255], contrast = 1.06) {
  fx.sat = 1;
  fx.tint = [lerp(255, tint[0], k), lerp(255, tint[1], k), lerp(255, tint[2], k)];
  fx.contrast = lerp(1.04, contrast, k);
}

/** The cobalt / ice high-key impact frame (impA cobalt, impB ice, threshold 0.35). amt 0..1. */
export function galeImpact(fx: FxState, amt = 1) {
  fx.impact = amt;
  fx.impA = [36, 64, 210];
  fx.impB = [238, 251, 255];
  fx.impThresh = 0.35;
}

/** slamTitle options for GALE lettering (GOAL!, the name card): ice fill, cobalt stroke, navy outline. */
export const TITLE_STYLE = { fill: '#EEFBFF', fill2: '#8fe3ff', stroke: '#2D52E0', outer: '#0A1238' } as const;

// ---------------------------------------------------------------- the field geometry of the strike

/** World px per metre in the field view (and in every side-rail shot that uses field coordinates). */
export const M = 10;
/** Where he strikes it: 30 m out (field coordinates; the goal line is x 1180, the goal centre z 257). */
export const STRIKE = { x: 880, z: 266 } as const;
/** Where it goes in: the far top corner (field x, z, height in world px). */
export const CORNER = { x: 1180, z: 222, h: 22 } as const;
/** Ball heights above the turf, in metres: starts at 0.4, each step dips to 0.15, the peaks only climb. */
export const BALL_H = { start: 0.4, dip: 0.15, peaks: [0.7, 1.2, 2.3] } as const;

export interface Stamp {
  id: 1 | 2 | 3;
  /** Metres from the goal line. */
  m: number;
  /** Field position (x along the pitch, z across). */
  x: number;
  z: number;
  /** Shot 4 local time of this air step, and its stamp's final ring radius on the shot-4 screen (px). */
  t4: number;
  r4: number;
  /** The ball's next high point after this step (m). */
  peak: number;
}

/**
 * The three air steps / stamps: 25 m, 17 m and 6 m from the goal line (the last on the edge of the six-yard
 * box), on the straight line from the strike spot to the far top corner. Every shot rebuilds its decals from
 * this in init (nothing is carried between shots). No line ever joins them.
 */
export const STAMPS: readonly Stamp[] = [
  { id: 1, m: 25, x: 930, z: 259, t4: 0.35, r4: 40, peak: 0.7 },
  { id: 2, m: 17, x: 1010, z: 247, t4: 0.72, r4: 40, peak: 1.2 },
  { id: 3, m: 6, x: 1120, z: 231, t4: 1.85, r4: 80, peak: 2.3 },
];

/**
 * The ball's height above the turf in metres over shot 4's clock: 0.4 m at 0, dipping to 0.15 m at each air
 * step (STAMPS[i].t4), arcing up to each peak (0.7, 1.2) between steps, and after step 3 launching toward
 * 2.3 m by `end`. Only climbs: never a big rise-and-dip. Multiply by the shot's px per metre.
 */
export function airStepHeight(t: number, end = 2.6): number {
  const [s1, s2, s3] = STAMPS;
  const dip = BALL_H.dip;
  if (t <= s1.t4) return lerp(BALL_H.start, dip, ease.inQuad(clamp(t / s1.t4)));
  if (t <= s2.t4) {
    const u = (t - s1.t4) / (s2.t4 - s1.t4);
    return dip + (s1.peak - dip) * 4 * u * (1 - u);
  }
  if (t <= s3.t4) {
    const u = (t - s2.t4) / (s3.t4 - s2.t4);
    return dip + (s2.peak - dip) * 4 * u * (1 - u);
  }
  return dip + (s3.peak - dip) * ease.outQuad(clamp((t - s3.t4) / (end - s3.t4)));
}

// ---------------------------------------------------------------- No.10's frame schedules (SPEC "Studio art")

/** [start time, frame] keys on the shot's unwarped clock t. */
export type No10Seq = readonly (readonly [number, No10Key])[];

/** No.10's library frames per shot, exactly as the brief schedules them. */
export const SEQ: Record<2 | 3 | 6, No10Seq> = {
  2: [[0, 'R1'], [0.07, 'R2'], [0.14, 'R3'], [0.21, 'R4'], [0.3, 'AP2'], [0.55, 'F5a'], [0.75, 'F5b'], [1.0, 'F5a'], [1.25, 'F5b'], [1.5, 'F5a'], [1.58, 'F6']],
  3: [[0, 'M1'], [0.12, 'M2'], [0.62, 'M3'], [0.66, 'F7'], [0.7, 'F8'], [0.92, 'F8b'], [1.15, 'F9'], [1.45, 'F10']],
  6: [[0, 'B9'], [0.25, 'Sa'], [0.45, 'Sb'], [0.65, 'Sa'], [0.85, 'Sb'], [1.05, 'B11'], [1.3, 'B12'], [1.6, 'B11'], [1.7, 'Sa']],
};

/** The frame of a schedule at time t. */
export function no10At(seq: No10Seq, t: number): No10Key {
  let k = seq[0][1];
  for (const [at, f] of seq) if (t >= at) k = f;
  return k;
}

// ---------------------------------------------------------------- the mute (master muffle envelopes)

/**
 * Muffle level per shot (Shot.muffle), on the shot's unwarped clock t. Closed for about 1.5 s in all: it
 * closes over shot 3 0.70-1.05 and snaps open at shot 4 0.92. Shot 2 holds its breath at 0.35.
 */
export const MUFFLE: Record<1 | 2 | 3 | 4 | 5 | 6, (t: number) => number> = {
  1: () => 0,
  2: (t) => (t >= 1.55 ? 0 : 0.35 * ease.inOutQuad(clamp((t - 0.65) / 0.15))),
  3: (t) => ease.inQuad(clamp((t - 0.7) / 0.35)),
  4: (t) => (t < 0.92 ? 1 : 0),
  5: () => 0,
  6: () => 0,
};

// ---------------------------------------------------------------- time helpers

/**
 * Ratchet: a value that steps between levels. keys = [[at, value], ...] sorted; before keys[1] it is keys[0]'s
 * value; at each later key it snaps to the new value over `snap` seconds (default 2 frames) and stays there.
 */
export function steps(t: number, keys: readonly (readonly [number, number])[], snap = 2 / 60): number {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [at, val] = keys[i];
    if (t < at) break;
    v = lerp(v, val, clamp((t - at) / snap));
  }
  return v;
}

/** Damped spring back to 0 from `from`, starting at `at`, over `dur` s, overshooting once by ~18 %: from*cos(pi u)*(1-u). */
export function springBack(t: number, at: number, from: number, dur: number): number {
  if (t < at) return from;
  const u = (t - at) / dur;
  return u >= 1 ? 0 : from * Math.cos(Math.PI * u) * (1 - u);
}

/**
 * The recoil / knock-back: 0 before `at`; rises to `amp` over `rise` (2 frames), then springs back toward 0
 * with a damped oscillation (pressure lag). Use it for the shot 3 recoil shake-back and the shot 4 camera
 * knock-back after each late boom (amp 30 px for the first, smaller for the second).
 */
export function recoilSpring(t: number, at: number, amp: number, freq = 2.2, damp = 5.5, rise = 2 / 60): number {
  if (t < at) return 0;
  const tau = t - at;
  if (tau < rise) return amp * ease.outQuad(tau / rise);
  const u = tau - rise;
  return amp * Math.exp(-damp * u) * Math.cos(TAU * freq * u);
}

// ---------------------------------------------------------------- post-FX helpers

/**
 * A near-planar refraction band (a late boom's pressure front) crossing the screen: one fx.shocks entry with its
 * centre far off-screen and a huge radius. p 0..1 = the band's progress across the frame (animate it over
 * ~0.2 s). dir +1 sweeps left -> right. Respects the 4-slot limit (pushShock).
 */
export function refractionBand(fx: FxState, p: number, s = 0.04, dir: 1 | -1 = 1, cy = 0.5, far = 6) {
  if (p <= 0 || p >= 1 || s === 0) return;
  const aspect = VW / VH;
  const bandU = lerp(-0.08, 1.08, p);
  const cU = dir > 0 ? -far : 1 + far;
  const r = Math.abs(bandU - cU) * aspect;
  pushShock(fx, { x: cU, y: cy, r, s });
}

/** Post shock ring at a stamp (world x, y) `age` s after it lands: r 0 -> r1 over dur, strength fading. */
export function stampShock(env: Env, x: number, y: number, age: number, r1 = 0.25, s = 0.03, dur = 0.35) {
  if (age < 0 || age > dur) return;
  const [u, v] = env.cam.toUV(x, y);
  const k = age / dur;
  pushShock(env.fx, { x: u, y: v, r: r1 * ease.outCubic(k), s: s * (1 - k) });
}

/** Point the pressure lens at world (x, y): k < 0 pinches (the inhale), k > 0 bulges (the contact). R in screen heights. */
export function lensAt(env: Env, x: number, y: number, k: number, R: number) {
  const [u, v] = env.cam.toUV(x, y);
  env.fx.lens = k;
  env.fx.lensX = u;
  env.fx.lensY = v;
  env.fx.lensR = R;
}

// ---------------------------------------------------------------- pressure stamps (rings in the turf)

export interface StampDecal {
  x: number;
  y: number;
  /** Time it lands, on the shot's clock. */
  at: number;
  /** Final ring radius (screen / world px of the shot). */
  r: number;
  /** Vertical squash of the ellipse (default 0.25: ground seen from grass level). */
  squash?: number;
}

/** Build a shot's stamp decals from STAMPS (return null to skip a stamp). Call in init. */
export function stampDecals(f: (s: Stamp) => StampDecal | null): StampDecal[] {
  return STAMPS.map(f).filter((d): d is StampDecal => !!d);
}

export interface StampOpts {
  squash?: number;
  /** Seconds the ring takes to expand from 0 to R (default 0.3, ease-out). */
  grow?: number;
  alpha?: number;
  /** 0..1: thin dew mist breathing off the ring (shot 6). */
  mist?: number;
  /** Clock for the mist drift. */
  time?: number;
}

/**
 * One pressure stamp decal: a pale ring of flattened grass (an expanding squashed ellipse), blades flicked
 * outward on its rim, a dark core, and for its first 0.15 s an ice rim glint (additive over a navy halo).
 * age = seconds since it landed (nothing is drawn before 0). R = final radius.
 */
export function drawStamp(ctx: CanvasRenderingContext2D, x: number, y: number, R: number, age: number, o: StampOpts = {}) {
  if (age < 0 || R <= 0) return;
  const k = o.squash ?? 0.25;
  const a = o.alpha ?? 1;
  const g = ease.outCubic(clamp(age / (o.grow ?? 0.3)));
  const r = Math.max(1, R * g);
  ctx.save();
  // Dark core (the pressed hollow).
  ctx.globalAlpha = 0.5 * a;
  ctx.fillStyle = HEX.pressedCore;
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.5, r * 0.5 * k, 0, 0, TAU);
  ctx.fill();
  // Pale ring of flattened grass (annulus, even-odd).
  ctx.globalAlpha = 0.55 * a;
  ctx.fillStyle = HEX.pressed;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * k, 0, 0, TAU);
  ctx.ellipse(x, y, r * 0.62, r * 0.62 * k, 0, 0, TAU);
  ctx.fill('evenodd');
  // Blades flicked outward on the rim: short radial ticks, longer while the ring is still expanding.
  const n = Math.max(10, Math.round(r * 0.7));
  const flick = 1 + (1 - g) * 1.5;
  ctx.globalAlpha = 0.75 * a;
  ctx.strokeStyle = '#c8f0b0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const th = (i / n) * TAU + Math.sin(i * 12.9898) * 0.08;
    const c = Math.cos(th), s = Math.sin(th);
    const L = (2 + (i % 3)) * flick * Math.max(0.6, R / 40);
    ctx.moveTo(x + c * r, y + s * r * k);
    ctx.lineTo(x + c * (r + L), y + s * (r + L) * k - L * 0.25);
  }
  ctx.stroke();
  // Birth glint: ice rim over a navy halo.
  const gl = 1 - clamp(age / 0.15);
  if (gl > 0) {
    ctx.globalAlpha = 0.45 * gl * a;
    ctx.strokeStyle = HEX.navy;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * k, 0, 0, TAU);
    ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.9 * gl * a;
    ctx.strokeStyle = HEX.ice;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  // Dew mist breathing off the ring.
  const mist = o.mist ?? 0;
  if (mist > 0) {
    ctx.globalCompositeOperation = 'source-over';
    const tt = o.time ?? 0;
    for (let i = 0; i < 6; i++) {
      const th = (i / 6) * TAU + tt * 0.4;
      const rise = ((tt * 0.35 + i / 6) % 1);
      drawGlow(ctx, softSprite('white', 0.2), x + Math.cos(th) * r * 0.85, y + Math.sin(th) * r * k * 0.85 - rise * r * 0.35, r * 0.28, 0.16 * mist * a * (1 - rise));
    }
  }
  ctx.restore();
}

/** Draw a list of stamp decals at time t (each one's age = t - at). */
export function drawStamps(ctx: CanvasRenderingContext2D, decals: readonly StampDecal[], t: number, o: Omit<StampOpts, 'squash'> = {}) {
  for (const d of decals) drawStamp(ctx, d.x, d.y, d.r, t - d.at, { ...o, squash: d.squash ?? 0.25 });
}

/**
 * A stamp's burst (call once from update, behind a flag): a dew fountain (`dew` beads, 'dew' ramp), turf chunks,
 * and an expanding squashed ring particle in 'cobalt'. R = the stamp's radius (sets the spread). Pair it with
 * stampShock() in render and cam.hit().
 */
export function pressureStamp(env: Env, x: number, y: number, R = 40, o: { dew?: number; chunks?: number; squash?: number } = {}) {
  const rng = env.rng;
  const k = o.squash ?? 0.25;
  const nDew = o.dew ?? 30;
  for (let i = 0; i < nDew; i++) {
    const th = rng.range(0, TAU);
    const sp = rng.range(40, 160) * (R / 40);
    env.parts.spawn({
      kind: PK.Glow, x: x + Math.cos(th) * R * 0.3, y: y + Math.sin(th) * R * 0.3 * k,
      vx: Math.cos(th) * sp, vy: -rng.range(80, 240) * (R / 40), ay: 520, drag: 1.2,
      max: rng.range(0.4, 0.8), s0: rng.range(1.4, 2.6), s1: 0.8, ramp: 'dew', r0: 0, r1: 0.7, a0: 1, a1: 0, layer: 1,
    });
  }
  grassChunks(env, x, y, o.chunks ?? 6, 0.8 * Math.sqrt(R / 40));
  env.parts.spawn({ kind: PK.Ring, x, y, s0: R * 0.2, s1: R * 1.15, max: 0.32, k, ramp: 'cobalt', r0: 0, r1: 0.9, a0: 0.9, a1: 0, layer: 0 });
}

/**
 * Ghost stamp (the command window preview): a faint cyan ellipse breathing at `scale` (0.92..1), on a navy halo.
 */
export function ghostStamp(ctx: CanvasRenderingContext2D, x: number, y: number, R: number, scale: number, a = 1, squash = 0.3) {
  if (a <= 0) return;
  const r = R * scale;
  ctx.save();
  ctx.globalAlpha = 0.35 * a;
  ctx.strokeStyle = HEX.navy;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * squash, 0, 0, TAU);
  ctx.stroke();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.1 * a;
  ctx.fillStyle = HEX.cyan;
  ctx.fill();
  ctx.globalAlpha = 0.55 * a;
  ctx.strokeStyle = HEX.cyan;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------- isobars

export interface IsobarOpts {
  /** Vertical squash of each ring (1 = circle). */
  squash?: number;
  /** Clock for the wobble (rings wobble with sin(lobes*theta + t*3)). */
  t?: number;
  alpha?: number;
  /** Radius wobble amplitude as a fraction of the radius (default 0.04). */
  wobble?: number;
  lobes?: number;
  color?: string;
  /** Navy halo under each line (default true). */
  halo?: boolean;
}

/** Thin wavy isobar contour rings (pressure building) around (cx, cy), one per radius. 1 px cyan on a navy halo. */
export function isobars(ctx: CanvasRenderingContext2D, cx: number, cy: number, radii: readonly number[], o: IsobarOpts = {}) {
  const a = o.alpha ?? 0.35;
  if (a <= 0) return;
  const k = o.squash ?? 1, t = o.t ?? 0, wob = o.wobble ?? 0.04, lobes = o.lobes ?? 5;
  const path = (R: number, i: number) => {
    ctx.beginPath();
    for (let j = 0; j <= 72; j++) {
      const th = (j / 72) * TAU;
      const r = R * (1 + wob * Math.sin(lobes * th + t * 3 + i * 1.3));
      const x = cx + Math.cos(th) * r, y = cy + Math.sin(th) * r * k;
      j ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
  };
  ctx.save();
  radii.forEach((R, i) => {
    if (R <= 0.5) return;
    if (o.halo !== false) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = clamp(a * 0.9);
      ctx.strokeStyle = HEX.navy;
      ctx.lineWidth = 3;
      path(R, i);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = clamp(a);
    ctx.strokeStyle = o.color ?? HEX.cyan;
    ctx.lineWidth = 1;
    path(R, i);
    ctx.stroke();
  });
  ctx.restore();
}

// ---------------------------------------------------------------- the ball's trail, cone and air steps

/**
 * The vapour trail: navy halo (normal blend), cyan body (additive), ice core along the newest part. It WIDENS
 * toward its tail (w*2.6 at the tail, about the ball at the head) and breaks into turbulent puffs; it wobbles
 * with `time`. Keep it short (<= 18 points / 0.25 s of path): it never persists and is never a thin taut line.
 * pts: oldest first, the ball last. head = the ball's on-screen radius (optional).
 */
export function vaporRibbon(ctx: CanvasRenderingContext2D, pts: readonly TrailPt[], w: number, time: number, a = 1, head?: number) {
  const n = pts.length;
  if (n < 2 || a <= 0) return;
  const hd = head ?? w * 0.45;
  const q: TrailPt[] = [];
  for (let i = 0; i < n; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(n - 1, i + 1)];
    let tx = p1.x - p0.x, ty = p1.y - p0.y;
    const l = Math.hypot(tx, ty) || 1;
    tx /= l;
    ty /= l;
    const u = 1 - i / (n - 1); // 1 at the tail
    const off = w * 0.4 * u * u * noise1(i * 0.7 - time * 9, 3);
    q.push({ x: pts[i].x - ty * off, y: pts[i].y + tx * off });
  }
  const puffs = (fn: (x: number, y: number, r: number, u: number) => void) => {
    for (let i = 0; i < n * 0.55; i += 2) {
      const u = 1 - i / (n - 1);
      const jx = noise1(i * 1.9 + time * 5, 7) * w * 0.6, jy = noise1(i * 2.3 - time * 4, 11) * w * 0.6;
      fn(q[i].x + jx, q[i].y + jy, w * (0.9 + 1.4 * u), u);
    }
  };
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ribbon(ctx, q, w * 2.6, hd * 2.4, `rgb(${PAL.navy.join(',')})`, 0.32 * a);
  puffs((x, y, r, u) => drawGlow(ctx, glowOf(PAL.navy), x, y, r * 1.3, 0.28 * a * u));
  ctx.globalCompositeOperation = 'lighter';
  ribbon(ctx, q, w * 1.8, hd * 1.7, `rgb(${PAL.cyan.join(',')})`, 0.3 * a);
  puffs((x, y, r, u) => drawGlow(ctx, glowOf(PAL.cyan), x, y, r, 0.2 * a * u));
  const k = Math.floor(n * 0.4);
  ribbon(ctx, q.slice(k), w * 0.5, hd * 0.9, `rgb(${PAL.ice.join(',')})`, 0.7 * a);
  ctx.restore();
}

/**
 * The Mach cone: two ice lines opening back from the ball (x, y) at +-half (default 18 deg) around the reverse of
 * `dir` (the travel direction, radians), `len` px long, fading to nothing, over a navy halo. Canvas-drawn.
 * (Add a small fx.ca, ~0.002, near it from the shot.)
 */
export function machCone(ctx: CanvasRenderingContext2D, x: number, y: number, dir: number, len = 120, a = 1, half = (18 * Math.PI) / 180) {
  if (a <= 0) return;
  ctx.save();
  ctx.lineCap = 'round';
  for (const sgn of [-1, 1]) {
    const th = dir + Math.PI + sgn * half;
    const ex = x + Math.cos(th) * len, ey = y + Math.sin(th) * len;
    const grad = (c: RGB, al: number) => {
      const g = ctx.createLinearGradient(x, y, ex, ey);
      g.addColorStop(0, `rgba(${c.join(',')},${al})`);
      g.addColorStop(0.6, `rgba(${c.join(',')},${al * 0.45})`);
      g.addColorStop(1, `rgba(${c.join(',')},0)`);
      return g;
    };
    const line = (w: number) => {
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    };
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = grad(PAL.navy, 0.45 * a);
    line(5);
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = grad(PAL.cyan, 0.4 * a);
    line(2.4);
    ctx.strokeStyle = grad(PAL.ice, 0.95 * a);
    line(1);
  }
  ctx.restore();
}

/**
 * The air sliver: a bright lens-shaped cushion of crushed air between the ball's underside (yTop) and the grass
 * (yGround), w px wide, at least 4 px tall: cyan with an ice core, on a navy halo. Flash it for ~0.08 s per step.
 */
export function airSliver(ctx: CanvasRenderingContext2D, x: number, yTop: number, yGround: number, w: number, a = 1) {
  if (a <= 0) return;
  let y0 = Math.min(yTop, yGround), y1 = Math.max(yTop, yGround);
  if (y1 - y0 < 4) {
    const m = (y0 + y1) / 2;
    y0 = m - 2;
    y1 = m + 2;
  }
  const lens = (hw: number, top: number, bot: number) => {
    const m = (top + bot) / 2, b = (bot - top) * 0.75;
    ctx.beginPath();
    ctx.moveTo(x - hw, m);
    ctx.quadraticCurveTo(x, top - b, x + hw, m);
    ctx.quadraticCurveTo(x, bot + b, x - hw, m);
    ctx.closePath();
  };
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = clamp(0.5 * a);
  ctx.fillStyle = HEX.navy;
  lens(w / 2 + 3, y0 - 2, y1 + 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = clamp(0.85 * a);
  ctx.fillStyle = HEX.cyan;
  lens(w / 2, y0, y1);
  ctx.fill();
  ctx.globalAlpha = clamp(a);
  ctx.fillStyle = HEX.ice;
  const h = y1 - y0;
  lens(w * 0.3, y0 + h * 0.28, y1 - h * 0.28);
  ctx.fill();
  drawGlow(ctx, glowOf(PAL.cyan), x, (y0 + y1) / 2, w * 0.6, 0.35 * a, 1, 0.35);
  ctx.restore();
}

/**
 * The V-shaped wake of flattened grass behind the ball (the Mach cone's footprint), a chevron decal on the turf.
 * apex = where the ball was when the boom passed; the arms open back toward -x at +-open (radians, in the ground
 * plane) and are squashed by `squash` for the low camera. It grows over `grow` s after `age` 0.
 */
export function machWake(
  ctx: CanvasRenderingContext2D, apexX: number, apexY: number, age: number,
  o: { len?: number; open?: number; squash?: number; grow?: number; alpha?: number; w?: number } = {},
) {
  if (age < 0) return;
  const len = (o.len ?? 160) * ease.outCubic(clamp(age / (o.grow ?? 0.25)));
  const open = o.open ?? 0.32, k = o.squash ?? 0.25, a = o.alpha ?? 1, w = o.w ?? 10;
  if (len < 1) return;
  ctx.save();
  for (const sgn of [-1, 1]) {
    const dx = -Math.cos(open), dz = sgn * Math.sin(open);
    const ex = apexX + dx * len, ey = apexY + dz * len * k;
    // Perpendicular in the ground plane (screen-squashed), widening toward the far end.
    const px = -dz, pz = dx;
    const arm = (wa: number, wb: number) => {
      ctx.beginPath();
      ctx.moveTo(apexX + px * wa, apexY + pz * wa * k);
      ctx.lineTo(ex + px * wb, ey + pz * wb * k);
      ctx.lineTo(ex - px * wb, ey - pz * wb * k);
      ctx.lineTo(apexX - px * wa, apexY - pz * wa * k);
      ctx.closePath();
    };
    ctx.globalAlpha = 0.5 * a;
    ctx.fillStyle = HEX.pressed;
    arm(w * 0.3, w);
    ctx.fill();
    ctx.globalAlpha = 0.35 * a;
    ctx.fillStyle = HEX.pressedCore;
    arm(w * 0.08, w * 0.3);
    ctx.fill();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the load: inhale, blades, smear

export interface InhaleOpts {
  rMin?: number;
  rMax?: number;
  /** Life range in SIMULATION seconds (under rate r it plays 1/r longer on screen). */
  life?: [number, number];
  /** Vertical squash of the spawn ring (default 0.55). */
  squash?: number;
  /** Fractions of dew beads and dust motes (the rest are grass clippings). */
  dew?: number;
  dust?: number;
}

/**
 * The inhale field: spawn n motes (dew beads, dust motes, grass clippings) on a ring around (tx, ty) that
 * accelerate toward it and vanish on arrival (constant acceleration from rest: exact, seek-safe). Call from
 * update with n proportional to dt (about 120 alive). Target = ~10 px behind the heel ('boot' anchor).
 */
export function inhaleField(env: Env, tx: number, ty: number, n: number, o: InhaleOpts = {}) {
  const rng = env.rng;
  const [l0, l1] = o.life ?? [0.35, 0.7];
  const k = o.squash ?? 0.55;
  const fd = o.dew ?? 0.5, fu = o.dust ?? 0.3;
  for (let i = 0; i < n; i++) {
    const th = rng.range(0, TAU);
    const r = rng.range(o.rMin ?? 30, o.rMax ?? 140);
    const x = tx + Math.cos(th) * r, y = ty + Math.sin(th) * r * k;
    const T = rng.range(l0, l1);
    const ax = (2 * (tx - x)) / (T * T), ay = (2 * (ty - y)) / (T * T);
    const pick = rng.next();
    if (pick < fd)
      env.parts.spawn({ kind: PK.Glow, x, y, ax, ay, max: T, s0: rng.range(1.2, 2.2), s1: 0.8, ramp: 'dew', r0: 0.1, r1: 0.4, a0: 0.9, a1: 0.5, layer: 1 });
    else if (pick < fd + fu)
      env.parts.spawn({ kind: PK.Pixel, x, y, ax, ay, max: T, s0: 1, s1: 1, ramp: 'dust', r0: 0, r1: 0.5, a0: 0.8, a1: 0.4, add: false, layer: 1 });
    else
      env.parts.spawn({ kind: PK.Debris, x, y, ax, ay, max: T, s0: 1.5, s1: 1.2, ramp: 'grass', r0: rng.next(), r1: rng.next(), a0: 1, a1: 0.7, add: false, vrot: rng.range(-8, 8), layer: 1 });
  }
}

export interface Blade {
  x: number;
  y: number;
  h: number;
  /** Phase for idle sway. */
  ph: number;
}

/** Make a row of grass blades between x0 and x1 on the ground line y (call in init with env.rng). */
export function makeBlades(rng: Rng, x0: number, x1: number, y: number, n: number, hMin = 4, hMax = 9): Blade[] {
  const out: Blade[] = [];
  for (let i = 0; i < n; i++) out.push({ x: rng.range(x0, x1), y: y + rng.range(-1.5, 1.5), h: rng.range(hMin, hMax), ph: rng.range(0, TAU) });
  return out;
}

/** Lean (radians, + = toward +x) of a blade toward a point, proportional to 1/distance (clamped to +-max). */
export const leanToward = (tx: number, ty: number, k = 60, max = 1.2) => (b: Blade) => {
  const dx = tx - b.x, dy = ty - b.y;
  const d = Math.max(4, Math.hypot(dx, dy));
  return clamp((Math.sign(dx) * k) / d, -max, max);
};

/** Lean of a blade away from a point (the contact fanning the grass flat, a stamp flicking blades outward). */
export const leanAway = (tx: number, ty: number, k = 60, max = 1.4) => (b: Blade) => -leanToward(tx, ty, k, max)(b);

/** Draw blades as 1 px strokes, each leaning by lean(b) radians from upright. */
export function drawBlades(ctx: CanvasRenderingContext2D, blades: readonly Blade[], lean: (b: Blade) => number, color = '#3f9a48', a = 1) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (const b of blades) {
    const l = lean(b);
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x + Math.sin(l) * b.h, b.y - Math.cos(l) * b.h);
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * The smear arc of the downswing: a wide translucent cobalt band along the heel's path p0 -> (through p1) -> p2
 * (F5 boot, F6 boot, the projected contact), thin at the start and widest at the head, with an ice leading edge,
 * over a navy halo. prog 0..1 grows it along the path.
 */
export function smearArc(ctx: CanvasRenderingContext2D, p0: TrailPt, p1: TrailPt, p2: TrailPt, w: number, a = 1, prog = 1) {
  const pr = clamp(prog);
  if (pr <= 0 || a <= 0) return;
  // Quadratic through p1 at its midpoint: control = 2*p1 - (p0 + p2)/2.
  const cx = 2 * p1.x - (p0.x + p2.x) / 2, cy = 2 * p1.y - (p0.y + p2.y) / 2;
  const pts: TrailPt[] = [];
  const N = 18;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * pr, u = 1 - t;
    pts.push({ x: u * u * p0.x + 2 * u * t * cx + t * t * p2.x, y: u * u * p0.y + 2 * u * t * cy + t * t * p2.y });
  }
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ribbon(ctx, pts, w * 0.2, w * 1.5, `rgb(${PAL.navy.join(',')})`, 0.35 * a);
  ctx.globalCompositeOperation = 'lighter';
  ribbon(ctx, pts, w * 0.1, w, `rgb(${PAL.cobalt.join(',')})`, 0.5 * a);
  ribbon(ctx, pts.slice(Math.floor(pts.length * 0.65)), w * 0.05, w * 0.3, `rgb(${PAL.ice.join(',')})`, 0.85 * a);
  ctx.restore();
}

export interface DewMirrorOpts {
  /** Face crop to show (default 'G4', pupils down-right on the ball; falls back to G1). */
  key?: No10Key;
  /** Integer scale of the face crop (default 2). */
  scale?: number;
  /** 0..1 cyan sparkle in his eye (1.30). */
  glint?: number;
  alpha?: number;
}

/**
 * The dew mirror: a convex dew drop of radius R hovering at (x, y) with his face inside (the Glance crop at
 * integer x2), darkening toward a navy edge, a 1 px ice rim light on the lit (upper-left) side and one ice
 * specular highlight top-left. A filled disc, never an outlined ring. Animate R for the swell / shrink.
 */
export function dewMirror(env: Env, x: number, y: number, R: number, o: DewMirrorOpts = {}) {
  if (R < 1) return;
  const ctx = env.ctx;
  const a = o.alpha ?? 1;
  const key = o.key ?? 'G4';
  const sc = o.scale ?? 2;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.beginPath();
  ctx.arc(x, y, R, 0, TAU);
  ctx.save();
  ctx.clip();
  const base = ctx.createRadialGradient(x - R * 0.2, y - R * 0.25, 0, x, y, R);
  base.addColorStop(0, 'rgb(150,214,240)');
  base.addColorStop(0.7, 'rgb(60,120,190)');
  base.addColorStop(1, HEX.navy);
  ctx.fillStyle = base;
  ctx.fillRect(x - R, y - R, R * 2, R * 2);
  // The face, upright and integer-scaled (only the eyes band fits inside a small drop).
  const fx = Math.round(x), fy = Math.round(y + R * 0.06);
  drawNo10(env, key, fx, fy, sc, { anchor: 'center', alpha: a });
  // Convex falloff: darken toward a navy edge.
  const edge = ctx.createRadialGradient(x, y, R * 0.35, x, y, R);
  edge.addColorStop(0, 'rgba(10,18,56,0)');
  edge.addColorStop(0.75, 'rgba(10,18,56,0.35)');
  edge.addColorStop(1, 'rgba(10,18,56,0.9)');
  ctx.fillStyle = edge;
  ctx.fillRect(x - R, y - R, R * 2, R * 2);
  ctx.restore();
  // Rim light on the lit side (a partial arc, not a ring) and the specular highlight.
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = `rgba(238,251,255,${0.85 * a})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, R - 0.5, Math.PI * 1.08, Math.PI * 1.62);
  ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = HEX.ice;
  ctx.beginPath();
  ctx.ellipse(x - R * 0.42, y - R * 0.46, Math.max(1, R * 0.15), Math.max(0.8, R * 0.09), -0.65, 0, TAU);
  ctx.fill();
  ctx.restore();
  const gl = o.glint ?? 0;
  if (gl > 0) {
    const [ex, ey] = no10Point(env, key, 'eye', fx, fy, sc, { anchor: 'center' });
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.cyan), ex, ey, 10, 0.6 * gl);
    ctx.restore();
    sparkleCyan(ctx, ex, ey, 7 * gl, gl);
  }
}

/** A 4-point cyan glint (ice core): the eye glints, the ankle-lock sparkle, dew glints. */
export function sparkleCyan(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a = 1, rot = 0) {
  if (a <= 0 || r <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = clamp(a);
  for (const [c, k] of [[HEX.cyan, 1], [HEX.ice, 0.6]] as const) {
    ctx.fillStyle = c;
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, -r * k);
      ctx.lineTo(r * 0.13 * k, 0);
      ctx.lineTo(-r * 0.13 * k, 0);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the net: exhale, mist, droplets

export interface NetEnvelope {
  /** Global drawGoal bulge. */
  bulge: number;
  /** Local corner dimple amount (drawGoal's NetDimple.amt). */
  dimple: number;
  /** 0..1 mist fan strength (spawn exhaleMist proportional to it). */
  mist: number;
  /** Frame knock-back in px: one 3 px shudder that settles in 0.15 s (never rings). */
  knock: number;
}

/**
 * Shot 5's net, as a pure function of t: the ball dimples the corner at hit (0.62, local bulge 0.15); the pressure
 * front at `front` (0.80) balloons the whole net 0.15 -> 0.85 in 0.08 s; it holds 0.1 s, then sighs back to 0.3
 * (ease-out) by 1.30. It never tears.
 */
export function netExhale(t: number, front = 0.8, hit = front - 0.18): NetEnvelope {
  let dimple = 0, bulge = 0;
  if (t >= hit) dimple = 0.15 * ease.outBack(clamp((t - hit) / 0.06)) * (1 - clamp((t - front) / 0.08));
  if (t >= front) {
    const u = t - front;
    if (u < 0.08) bulge = lerp(0.15, 0.85, ease.outCubic(u / 0.08));
    else if (u < 0.18) bulge = 0.85;
    else bulge = lerp(0.85, 0.3, ease.outCubic(clamp((u - 0.18) / 0.32)));
  }
  const mist = clamp((t - (front + 0.1)) / 0.1) * clamp(1 - (t - (front + 0.3)) / 0.4);
  const knock = t >= front ? 3 * (1 - ease.outCubic(clamp((t - front) / 0.15))) : 0;
  return { bulge, dimple, mist, knock };
}

/**
 * The net's exhale: n soft mist puffs from the mesh segment (x0,y0)-(x1,y1), blown out of the goal toward the
 * camera / the pitch (dir -1 = toward -x), spreading and curling. Normal blend, soft; call from update.
 */
export function exhaleMist(env: Env, x0: number, y0: number, x1: number, y1: number, n: number, dir: 1 | -1 = -1) {
  const rng = env.rng;
  for (let i = 0; i < n; i++) {
    const u = rng.next();
    env.parts.spawn({
      kind: PK.Smoke, x: lerp(x0, x1, u), y: lerp(y0, y1, u), vx: dir * rng.range(40, 130), vy: rng.range(-30, 25), drag: 1.6,
      max: rng.range(0.6, 1.1), s0: rng.range(4, 8), s1: rng.range(16, 28), ramp: 'white', r0: 0.1, r1: 0.6, a0: 0.32, a1: 0, add: false, layer: 1,
    });
  }
}

/**
 * The droplet curtain: n dew beads shaken off the bar / net top between x0 and x1 at height y, falling under
 * gravity with a little drift. Call from update (about 150 in all for shot 5).
 */
export function dropletCurtain(env: Env, x0: number, x1: number, y: number, n: number, o: { ay?: number; spread?: number } = {}) {
  const rng = env.rng;
  for (let i = 0; i < n; i++) {
    env.parts.spawn({
      kind: rng.next() < 0.6 ? PK.Glow : PK.Pixel, x: rng.range(x0, x1), y: y + rng.range(-2, 3),
      vx: rng.range(-1, 1) * (o.spread ?? 18), vy: rng.range(10, 70), ay: o.ay ?? 520, drag: 0.4,
      max: rng.range(0.5, 1.1), s0: rng.range(1, 2), s1: 0.8, ramp: 'dew', r0: 0, r1: 0.6, a0: 0.95, a1: 0.2, layer: 1,
    });
  }
}

// ---------------------------------------------------------------- cards

/**
 * The name card (shot 6, 1.70-2.60), matching Zenith and Crescent: slides in at the bottom with GALE HAMMER
 * (left), "No.10 · SPECIAL SHOT" and CAM 1 - 0 RIV (right). t = seconds since it starts. Screen space.
 */
export function nameCard(ctx: CanvasRenderingContext2D, t: number) {
  const card = ease.outCubic(clamp(t / 0.35));
  if (card <= 0) return;
  const y = lerp(VH + 40, 286, card);
  ctx.fillStyle = 'rgba(8,12,30,0.88)';
  ctx.fillRect(0, y - 6, VW, 62);
  ctx.fillStyle = HEX.cobalt;
  ctx.fillRect(0, y - 6, VW, 3);
  ctx.fillStyle = HEX.cyan;
  ctx.fillRect(0, y + 53, VW, 3);
  slamTitle(ctx, 'GALE HAMMER', 40, y + 47, 30, t, { stagger: 0.02, align: 'left', ...TITLE_STYLE });
  pixelText(ctx, 'No.10  ·  SPECIAL SHOT', 40, y + 1, 10, HEX.cyan, 'left', HEX.navy);
  pixelText(ctx, 'CAM 1 - 0 RIV', VW - 40, y + 20, 14, '#ffffff', 'right', HEX.navy);
}

/** Temporary stand-in used until a shot is implemented: a labelled card (plus an optional demo of its helpers). */
export function placeholderShot(
  idx: 1 | 2 | 3 | 4 | 5 | 6, name: string, dur: number, seed: number,
  demo?: { init?(env: Env): void; update?(env: Env, t: number, dt: number): void; render?(env: Env, t: number): void },
): Shot {
  return {
    name,
    dur,
    seed,
    muffle: MUFFLE[idx],
    init(env) {
      env.sfx.clearBus();
      env.cam.set(VW / 2, VH / 2, 1, 0);
      demo?.init?.(env);
    },
    update(env, t, dt) {
      demo?.update?.(env, t, dt);
    },
    render(env, t) {
      env.screen();
      const ctx = env.ctx;
      const g = ctx.createLinearGradient(0, 0, 0, VH);
      g.addColorStop(0, HEX.navy);
      g.addColorStop(1, '#16246e');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, VW, VH);
      demo?.render?.(env, t);
      env.screen();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(10,18,56,0.75)';
      ctx.fillRect(0, 20, VW, 54);
      pixelText(ctx, `${SHOT_NAME} · SHOT ${idx} · ${name.toUpperCase()}`, VW / 2, 28, 14, HEX.ice, 'center', HEX.navy);
      pixelText(ctx, `PLACEHOLDER  ${t.toFixed(2)} / ${dur.toFixed(2)}s  ·  muffle ${MUFFLE[idx](t).toFixed(2)}`, VW / 2, 50, 10, HEX.cyan, 'center', HEX.navy);
      galeGrade(env.fx);
    },
  };
}
