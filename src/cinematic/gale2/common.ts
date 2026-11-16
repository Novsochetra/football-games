// GALE HAMMER v2: shared constants and helpers for the nine shots (SPEC.md §2, §3, §10.8). Storm night, ice and
// electric cyan on storm navy; cobalt only as halo, stroke and iso band. Helpers v2 still uses from v1 are re-exported
// from ../gale/common (the shipped v1 stays untouched); the heavy canvas FX live in ./air.ts, the goal rig in
// ./goal.ts, the 2.5D swing in ./swing.ts. Never the banned word (d-r-i-v-e) anywhere: gale, strike, hammer, shot, push.

import type { Env, Shot } from '../timeline';
import type { FxState } from '../../engine/post';
import { warmPost } from '../../engine/post';
import { VW, VH } from '../../engine/camera';
import { clamp, ease, lerp, mixRGB, type RGB } from '../../engine/math';
import { findAnim, findFrame, drawAnim, type StudioAnim } from '../../art/studioAnim';
import { KEEPER_KIT, POSES, type Pose } from '../../art/puppet';
import { PIXEL_FONT, pixelText } from '../../art/fx';
import { PuppetCache, warp } from '../kit';
import type { No10Key } from '../../art/no10';

export {
  recoilSpring, refractionBand, stampShock, lensAt, drawStamp, ghostStamp, isobars, inhaleField, makeBlades, leanToward,
  leanAway, drawBlades, smearArc, dewMirror, sparkleCyan, dropletCurtain, airSliver, machWake, TITLE_STYLE, DEW,
  type Blade, type IsobarOpts, type InhaleOpts, type DewMirrorOpts,
} from '../gale/common';

/** The special's on-screen name (the registry entry reads 'GALE HAMMER v2' while it is in production). */
export const SHOT_NAME = 'GALE HAMMER';

// ---------------------------------------------------------------- palette (§2)

export const PAL = {
  ice: [238, 251, 255] as RGB,
  cyan: [70, 216, 255] as RGB,
  cobalt: [45, 82, 224] as RGB,
  navy: [10, 18, 56] as RGB,
  /** Crushed backgrounds (shot 2's void, shot 6b's swing). */
  stormNavy: [6, 11, 36] as RGB,
  pressed: [155, 224, 138] as RGB,
  pressedCore: [30, 90, 42] as RGB,
};
export const HEX = {
  ice: '#EEFBFF', cyan: '#46D8FF', cobalt: '#2D52E0', navy: '#0A1238', stormNavy: '#060B24', pressed: '#9BE08A', pressedCore: '#1E5A2A',
} as const;
/** Condensation ramp (also the 'vapor' particle ramp). */
export const VAPOR: RGB[] = [[255, 255, 255], [226, 246, 255], [170, 220, 250], [90, 140, 200]];
/** Storm ramp (also the 'storm' particle ramp): cloud lid, dust curtain, ground fog; normal blend. */
export const STORM: RGB[] = [[200, 214, 240], [120, 136, 170], [58, 70, 104], [20, 26, 48]];

/** Transition colours. */
export const BLINK = {
  /** Shot 1's flash-in (not a counted flash: 0.25). */
  flashIn: [190, 240, 255] as RGB,
  /** E1: the clench (0.45 cyan). */
  clench: [70, 216, 255] as RGB,
  /** E2: the ring-pop (0.6). */
  popFlash: [220, 248, 255] as RGB,
  /** The wind wipe's streaks (ice / white with navy halos). */
  windWipe: [238, 251, 255] as RGB,
  windHalo: [10, 18, 56] as RGB,
  /** The final fade (the result view fades up from it). */
  fade: [8, 4, 14] as RGB,
};

// ---------------------------------------------------------------- grades (§2)

const NEUTRAL = { tint: [255, 255, 255] as RGB, sat: 1, contrast: 1.04, vignette: 0.45, bloom: 0.85, thresh: 0.6 };
const STORM_GRADE = { tint: [186, 206, 255] as RGB, sat: 0.92, contrast: 1.14, vignette: 0.6, bloom: 1.0, thresh: 0.62 };
const VACUUM_GRADE = { tint: [170, 198, 255] as RGB, sat: 0.75, contrast: 1.2, vignette: 0.72, bloom: 0.9, thresh: 0.62 };
type Grade = typeof NEUTRAL;
function applyGrade(fx: FxState, a: Grade, b: Grade, k: number) {
  fx.pass = 'gale';
  fx.tint = mixRGB(a.tint, b.tint, k);
  fx.sat = lerp(a.sat, b.sat, k);
  fx.contrast = lerp(a.contrast, b.contrast, k);
  fx.vignette = lerp(a.vignette, b.vignette, k);
  fx.bloom = lerp(a.bloom, b.bloom, k);
  fx.bloomThresh = lerp(a.thresh, b.thresh, k);
}
/** The default storm grade (all shots); k 0..1 from neutral. Also selects GALE's post program family (fx.pass). */
export function galeStorm(fx: FxState, k = 1) {
  applyGrade(fx, NEUTRAL, STORM_GRADE, clamp(k));
}
/** The vacuum grade (the inhale freeze, the barrier swing, the dead stop); k 0..1 from the storm grade. */
export function vacuumGrade(fx: FxState, k = 1) {
  applyGrade(fx, STORM_GRADE, VACUUM_GRADE, clamp(k));
}
/** The flood-back after a hit: u = seconds since the hit; bright ice-white grade easing to the storm grade over 0.3 s. */
export function floodBack(fx: FxState, u: number) {
  const k = ease.outQuad(clamp(u / 0.3));
  applyGrade(fx, { tint: [235, 245, 255], sat: 1.05, contrast: 1.14, vignette: 0.55, bloom: 1.3, thresh: 0.6 }, STORM_GRADE, k);
}

/**
 * Canvas darken pass: multiply everything drawn so far by navy at strength k (0.45: the stands at 35-40 %), after the
 * stadium and before any figure or additive layer, so the vapour, aura, eyes, craters and ball are the only hot pixels.
 */
export function stormDarken(ctx: CanvasRenderingContext2D, k = 0.45) {
  if (k <= 0) return;
  const c = mixRGB([255, 255, 255], PAL.navy, clamp(k));
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
}

/**
 * The isobar impact frame (§10.1 item 1), on top of the storm grade.
 * Stage 1, the weather map: 4 bands navy / cobalt / cyan / ice with ice contour lines, rings centred on `uv` (isoMix
 * 0.55-0.6), wobble 0.02: at most 4 light/dark band pairs. Stage 2, the negative print: luminance only (isoMix 0,
 * no rings, no wobble), 3 bands inverted (dark -> ice, mid -> cobalt, bright -> navy) with navy lines: a different
 * geometry, never stage 1 inverted. `amt` scales it (0..1).
 */
export function galeIso(fx: FxState, stage: 1 | 2, uv: [number, number] = [0.5, 0.5], o: { mix?: number; amt?: number; r?: number } = {}) {
  fx.pass = 'gale';
  fx.iso = o.amt ?? 1;
  if (stage === 1) {
    fx.isoBands = 4;
    fx.isoInvert = 0;
    fx.isoMix = o.mix ?? 0.55;
    fx.isoWob = 0.02;
    fx.isoCols = [PAL.navy, PAL.cobalt, PAL.cyan, PAL.ice];
    fx.isoLine = PAL.ice;
    fx.isoX = uv[0];
    fx.isoY = uv[1];
    fx.isoR = o.r ?? 0.6;
  } else {
    fx.isoBands = 3;
    fx.isoInvert = 1;
    fx.isoMix = 0;
    fx.isoWob = 0;
    fx.isoCols = [PAL.navy, PAL.cobalt, PAL.ice, PAL.ice];
    fx.isoLine = PAL.navy;
  }
}

/** Every GALE v2 prepare(): compile FINAL_GALE (lens + iso + streak) up front. */
export function warmGale() {
  warmPost('gale');
}

// ---------------------------------------------------------------- field positions (§3; 10 px = 1 m)

export const M = 10;
/** Side views: the ground row. */
export const GY = 300;
export const STRIKE = { x: 880, z: 266 } as const;
export interface Stamp {
  id: 1 | 2 | 3;
  /** Metres from the goal line. */
  m: number;
  x: number;
  z: number;
  /** Shot 6 local time of this air step and its crater's on-screen radius there (px). */
  t6: number;
  r6: number;
}
/** The three air steps: on the line from the strike to the far top corner. No line ever joins them. */
export const STAMPS: readonly Stamp[] = [
  { id: 1, m: 25, x: 930, z: 259, t6: 0.15, r6: 45 },
  { id: 2, m: 17, x: 1010, z: 247, t6: 0.82, r6: 45 },
  { id: 3, m: 6, x: 1120, z: 231, t6: 2.45, r6: 200 },
];
/** The wall of three, arms linked, 22 m out. */
export const WALL = { x: 960, z: [246, 262, 278] as const };
/** The vapour disc (sound barrier), 13.5 m out. */
export const BARRIER = { x: 1045, z: 241 } as const;
/** The keeper's dead stop, 2.2 m off his line. */
export const KEEPER = { x: 1158, z: 226 } as const;
/** The far top corner (the ball's entry; h in metres). */
export const NET_CORNER = { x: 1180, z: 222, h: 1.9 } as const;
/** The goal is shoved 2.8 m (28 world px) behind its painted line (the hero-ball licence). */
export const GOAL_SLIDE = 28;

/** The ball's height (m) along its flight x (§3): air steps dip to 0.15 m, peaks only climb, never above 1.9 m. */
const PATH_H: [number, number, 'dip' | 'arc'][] = [
  [880, 0.4, 'arc'], [930, 0.15, 'dip'], [960, 0.35, 'arc'], [985, 0.7, 'arc'], [1010, 0.15, 'dip'],
  [1045, 1.2, 'arc'], [1120, 0.15, 'dip'], [1158, 1.5, 'arc'], [1180, 1.9, 'arc'],
];
export function ballPathH(x: number): number {
  if (x <= PATH_H[0][0]) return PATH_H[0][1];
  for (let i = 1; i < PATH_H.length; i++) {
    const [x1, h1, k1] = PATH_H[i];
    if (x > x1) continue;
    const [x0, h0, k0] = PATH_H[i - 1];
    const u = (x - x0) / (x1 - x0);
    // Into a dip: accelerate down (a sharp bounce on the air); out of a dip: decelerate up; arcs: sine.
    const e = k1 === 'dip' ? ease.inQuad(u) : k0 === 'dip' ? ease.outQuad(u) : 0.5 - 0.5 * Math.cos(Math.PI * u);
    return lerp(h0, h1, e);
  }
  return PATH_H[PATH_H.length - 1][1];
}

// ---------------------------------------------------------------- timing (§3, §6)

/** Shot durations, seeds and names (§5): fixed. */
export const SHOTS = [
  { n: 1, file: 'shot1_dare.ts', name: 'Thirty metres', dur: 1.2, seed: 311 },
  { n: 2, file: 'shot2_grab.ts', name: 'Grab the wind', dur: 1.6, seed: 312 },
  { n: 3, file: 'shot3_eye.ts', name: 'Eye of the storm', dur: 2.0, seed: 313 },
  { n: 4, file: 'shot4_inhale.ts', name: 'The inhale', dur: 1.8, seed: 314 },
  { n: 5, file: 'shot5_hammer.ts', name: 'Hammer', dur: 1.5, seed: 315 },
  { n: 6, file: 'shot6_barrier.ts', name: 'Sound barrier', dur: 2.8, seed: 316 },
  { n: 7, file: 'shot7_deadstop.ts', name: 'Dead stop', dur: 1.5, seed: 317 },
  { n: 8, file: 'shot8_thunder.ts', name: 'Thunder hammer', dur: 2.4, seed: 318 },
  { n: 9, file: 'shot9_return.ts', name: 'Return the wind', dur: 1.9, seed: 319 },
] as const;
export type ShotNo = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
/** Global start time of each shot (index 1..9; [10] = the total 16.7 s). */
export const SHOT_T0 = [0, 0, 1.2, 2.8, 4.8, 6.6, 8.1, 10.9, 12.4, 14.8, 16.7];

const ramp01 = (t: number, a: number, b: number, e: (u: number) => number = (u) => u) => e(clamp((t - a) / (b - a)));

/** The master muffle (§3, unwarped shot-local t): three vacuum gaps (shots 4, 6, 7) and shot 3's half muffle. */
export const MUFFLE: Record<ShotNo, (t: number) => number> = {
  1: () => 0,
  2: () => 0,
  3: (t) => (t >= 1.55 ? 0 : 0.45 * ramp01(t, 0.62, 0.7)),
  4: (t) => (t >= 1.4 ? 0 : 0.95 * ramp01(t, 0.55, 0.62)),
  5: () => 0,
  6: (t) => (t >= 1.1 && t < 1.6 ? 1 : 0),
  7: (t) => (t < 0.24 ? 0 : t < 0.8 ? 0.9 : 0.9 * (1 - ramp01(t, 0.8, 1.1))),
  8: () => 0,
  9: () => 0,
};

/** The simulation rate curves (§6 "Rate"), on the unwarped shot clock. */
export const RATE: Record<ShotNo, (t: number) => number> = {
  1: () => 1,
  2: () => 1,
  3: () => 1,
  4: (t) =>
    t < 0.42 ? 1 : t < 0.55 ? lerp(1, 0.06, ramp01(t, 0.42, 0.55, ease.outQuad)) : t < 1.4 ? 0.06 : t < 1.46 ? lerp(0.06, 1, ramp01(t, 1.4, 1.46, ease.inExpo)) : 1.3,
  5: (t) => {
    if (t < 0.58) return warp(t, [[0.08, 0.2, 0.03], [0.28, 0.3, 0.12]]);
    if (t < 0.62) return 1;
    if (t < 1.1) return lerp(0.35, 1, ramp01(t, 0.62, 1.1, ease.inQuad));
    return 1;
  },
  6: (t) => {
    if (t >= 2.45 && t < 2.51) return 0.2;
    if (t < 0.32) return 1;
    if (t < 0.38) return lerp(1, 0.12, ramp01(t, 0.32, 0.38));
    if (t < 0.68) return 0.12;
    if (t < 1.0) return 1;
    if (t < 1.1) return lerp(1, 0.06, ramp01(t, 1.0, 1.1, ease.inQuad));
    if (t < 1.5) return 0.06;
    if (t < 1.6) return 0.04;
    if (t < 1.75) return 1.6;
    return 1;
  },
  7: (t) => (t < 0.06 ? 1 : t < 0.16 ? 0.04 : t < 0.24 ? lerp(0.3, 1, ramp01(t, 0.16, 0.24)) : 1),
  8: (t) => warp(t, [[0.1, 0.22, 0.03], [0.32, 0.04, 0.3], [0.4, 0.08, 0.06]]),
  9: () => 1,
};

// ---------------------------------------------------------------- No.10 schedules (§9; shot-local t -> library key)

export type No10Seq = readonly (readonly [number, No10Key])[];
const alt = (t0: number, t1: number, step: number, a: No10Key, b: No10Key): [number, No10Key][] => {
  const out: [number, No10Key][] = [];
  for (let t = t0, i = 0; t < t1 - 1e-6; t += step, i++) out.push([+t.toFixed(3), i % 2 ? b : a]);
  return out;
};
export const SEQ: Record<1 | 2 | 3 | 4 | 5 | 9, No10Seq> = {
  1: [[0, 'SetF1'], [0.98, 'SetF3'], [1.1, 'SetF3b']],
  2: [[0, 'WH1'], [0.28, 'WH2'], [0.5, 'WH3'], [0.75, 'WH4'], ...alt(0.87, 1.6, 0.12, 'WH4b', 'WH4')],
  3: [...alt(0, 1.55, 0.1, 'SS1', 'SS2'), [1.55, 'SS3']],
  4: [
    [0, 'R1'], [0.06, 'R2'], [0.12, 'R3'], [0.18, 'R4'], [0.24, 'AP2'], [0.42, 'F5a'],
    [0.48, 'HC1'], [0.68, 'HC2'], [0.88, 'HC1'], [1.08, 'HC2'], [1.28, 'HC1'], [1.44, 'HCs'], [1.5, 'F6'],
  ],
  5: [[0, 'M1'], [0.08, 'M2'], [0.14, 'M2c'], [0.4, 'M2b'], [0.56, 'M3'], [0.62, 'F7'], [0.66, 'F8'], [0.8, 'F9r'], [1.12, 'F9'], [1.3, 'F10']],
  9: [[0, 'WH4'], [0.12, 'WH4b'], [0.25, 'WH5'], [0.55, 'WH6'], [0.8, 'WH7'], ...alt(1.05, 1.9, 0.2, 'Sa', 'Sb')],
};
/** The key showing at shot-local t. */
export function no10At(seq: No10Seq, t: number): No10Key {
  let k = seq[0][1];
  for (const [at, key] of seq) if (t >= at - 1e-6) k = key;
  return k;
}

// ---------------------------------------------------------------- the keeper (KeeperFront busts + puppet)

export type KeeperFrontKey = 'KF1' | 'KF1b' | 'KF2' | 'KF3' | 'KF3b' | 'KF4';
const KF_FALLBACK: Record<KeeperFrontKey, KeeperFrontKey[]> = {
  KF1: [], KF1b: ['KF1'], KF2: ['KF1'], KF3: ['KF1'], KF3b: ['KF3', 'KF1'], KF4: ['KF2', 'KF3'],
};
/** The keeper's front bust (Rivals project, strip 'KeeperFront'), or null while it is not exported. */
export function keeperFront(key: KeeperFrontKey): { a: StudioAnim; i: number } | null {
  const a = findAnim('KeeperFront', 'front') ?? findAnim('KeeperFront', 'side');
  if (!a) return null;
  const i = findFrame(a, key, ...KF_FALLBACK[key]);
  return i >= 0 ? { a, i } : null;
}
/** Shared puppet cache for the wall and the keeper (at most 3 puppet renders per frame). */
export const PUPPETS = new PuppetCache();
/**
 * Draw the keeper's bust centred on its chest anchor at (x, y) (scale = integer studio scale). Last-resort fallback
 * while KeeperFront is not exported: the keeper puppet in `pose` at about 2x (blocky).
 */
export function drawKeeperFront(env: Env, key: KeeperFrontKey, x: number, y: number, scale: number, pose: Pose = POSES.gkReady) {
  const f = keeperFront(key);
  if (f) {
    const fr = f.a.frames[f.i];
    drawAnim(env.ctx, f.a, null, f.i, x, y, scale, { pivot: fr.anchors.chest ?? [f.a.w / 2, f.a.h / 2] });
    return 'studio';
  }
  PUPPETS.draw(env.ctx, `kf-${key}`, KEEPER_KIT, pose, 1, -1, x, y + 30 * scale, scale * 1.4);
  return 'fallback';
}

// ---------------------------------------------------------------- placeholder shots (until each shot is produced)

export interface ShotSpec {
  n: ShotNo;
  cues?: { at: number; fn: (env: Env) => void }[];
}
export interface PlaceholderDemo {
  prepare?(env: Env): void;
  init?(env: Env): void;
  update?(env: Env, t: number, dt: number): void;
  /** Draw the demo (it sets its own transforms); the label card is drawn on top. */
  render?(env: Env, t: number): void;
}

/**
 * A stand-in shot with the brief's exact name, duration, seed, cues, rate curve and muffle, a rough demo of its engine
 * pieces and a small label (shot number, name, local time). init() calls sfx.clearBus() (every GALE init does).
 */
export function placeholderShot(spec: ShotSpec, demo: PlaceholderDemo = {}): Shot {
  const meta = SHOTS[spec.n - 1];
  return {
    name: meta.name,
    dur: meta.dur,
    seed: meta.seed,
    rate: RATE[spec.n],
    muffle: MUFFLE[spec.n],
    cues: spec.cues,
    prepare(env) {
      warmGale();
      demo.prepare?.(env);
    },
    init(env) {
      env.sfx.clearBus();
      env.cam.set(VW / 2, VH / 2, 1, 0);
      PUPPETS.frame();
      demo.init?.(env);
    },
    update(env, t, dt) {
      demo.update?.(env, t, dt);
    },
    render(env, t) {
      const ctx = env.ctx;
      env.screen();
      ctx.fillStyle = HEX.stormNavy;
      ctx.fillRect(0, 0, VW, VH);
      PUPPETS.frame();
      demo.render?.(env, t);
      env.screen();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(6,11,36,0.78)';
      ctx.fillRect(8, 8, 252, 30);
      ctx.fillStyle = HEX.cobalt;
      ctx.fillRect(8, 8, 3, 30);
      pixelText(ctx, `GALE v2 · SHOT ${spec.n} · ${meta.name.toUpperCase()}`, 16, 12, 9, HEX.ice, 'left', HEX.navy);
      pixelText(ctx, `PLACEHOLDER  t ${t.toFixed(2)} / ${meta.dur.toFixed(1)} s`, 16, 25, 8, HEX.cyan, 'left', HEX.navy);
      if (!env.fx.pass) galeStorm(env.fx);
    },
  };
}

/** The 30 M counter (shot 1): PIXEL_FONT 28 px, cyan with a 2 px navy outline; value in metres, `pop` 1..1.15. */
export function counterText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, sx = 1, sy = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sx, sy);
  ctx.font = `28px ${PIXEL_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = HEX.navy;
  for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [-2, -2], [2, 2], [-2, 2], [2, -2]]) ctx.fillText(text, dx, dy);
  ctx.fillStyle = HEX.cyan;
  ctx.fillText(text, 0, 0);
  ctx.restore();
}
