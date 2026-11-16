// SPOTLIGHT SOLO v2 ("Lights Out"): shared constants and helpers for the ten shots (SPEC.md §2, §3, §4, §10).
//
// Continuity (all shots): night; 1-2a fully floodlit, then the blackout stage from the snap (g 3.2) to the relight
// (g 15.2), then the stadium blazing. The goal is to the RIGHT (+x); in side views No.10 runs east (HERO_FACING 1,
// studio frames unmirrored); in front views (drawUpPitch, looking west) screen-left is HIS RIGHT. No.10 is always
// studio-drawn (./frames.ts), never a puppet. The horizon is always level (shake roll <= 0.015 rad, never a camera
// roll); sat stays 1; the mix is never filtered (SOLO's silence is the cymbal choke + a crowd duck); no drawn rings.
// The forbidden word (d-r-i-v-e) and "hammer" appear nowhere: the beam is the drop beam, his boots strike or tap.
//
// What lives where: the stage light (drop beam, splash, pool, trophy, god rays, surges, eyes, long shadow, light rain,
// fluoro, under / rim light) is shared engine code in art/stage.ts; the pitch views, banks and phone lights in
// art/stadium.ts; the beam impact chunk in engine/post.ts; the voices in engine/audio.ts. This folder holds SOLO's own
// systems: ./world.ts (the route, prints, gashes, trophies: pure functions of the global time), ./chorus.ts,
// ./print.ts (StrobePrint), ./turf.ts (gashes, turfRip, the sod carpet, the fuse), ./gluecam.ts, ./frames.ts.

import type { Env, Shot } from '../timeline';
import type { FxState } from '../../engine/post';
import { warmPost } from '../../engine/post';
import { VW, VH } from '../../engine/camera';
import { clamp, ease, lerp, mixRGB, type RGB } from '../../engine/math';
import { BallSpin, renderBall } from '../../engine/pixel';
import { PIXEL_FONT, pixelText } from '../../art/fx';
import { joints, type Kit, type Pose } from '../../art/puppet';
import { PuppetCache, keys, punch, warp, type KeyEase, type KeyRow } from '../kit';
import type { SoloKey } from './frames';

export * from '../kit';
export * from './frames';
export { stage, FollowSpot, DIM_MAX, DIM_RGB, dimColor, type StagePool, type BeamOpts, type PillarOpts } from '../../art/stage';
export { eyeGlow, crossGlint, longShadow, lightRain, underLight, rimLight, shadeSprite, fluoroMask, drawFluoro } from '../../art/stage';
export type { EyeGlowOpts, LongShadowOpts, ShadowClimb, LightRainOpts, LitPic } from '../../art/stage';
export { lampTitle2, marqueeTag, fourCount, MARQUEE, pixelText, lensFlare, sparkle, TITLE_FONT, PIXEL_FONT } from '../../art/fx';
export {
  drawFieldBackdrop, drawDownPitch, drawUpPitch, drawPitchLines, drawPhoneLights, drawGoal, drawShadow, projectDecal, horizonY,
  pitchBanks, fieldBanks, farStandRect, FIELD, type FieldBackdropOpts, type DownPitchView, type DownPitchOpts, type BankRect,
  type PhoneLightOpts, type Projected,
} from '../../art/stadium';
export { POSES, P, RIVAL_KIT, RIVAL_KIT_B, RIVAL_KIT_C, KEEPER_KIT, HERO_KIT, joints, jointWorld, poseAt, mixPose } from '../../art/puppet';

/** The special's on-screen name (the registry entry reads 'SPOTLIGHT SOLO v2' while it is in production). */
export const SHOT_NAME = 'SPOTLIGHT SOLO';
/** In side views he runs east, his studio Side view unmirrored. */
export const HERO_FACING = 1;

// ---------------------------------------------------------------- palette (§2.1; v1 keys kept, v2 keys added)

export const PAL = {
  spot: [255, 250, 236] as RGB,
  ivory: [246, 240, 223] as RGB,
  volt: [168, 128, 255] as RGB,
  uv: [122, 77, 255] as RGB,
  lilac: [201, 182, 255] as RGB,
  uvDeep: [42, 22, 96] as RGB,
  plum: [22, 10, 38] as RGB,
  void: [8, 3, 16] as RGB,
  soil: [74, 52, 36] as RGB,
  soilDeep: [34, 22, 16] as RGB,
  torn: [60, 138, 58] as RGB,
  kit: [223, 35, 33] as RGB,
};
export const HEX = {
  spot: '#FFFAEC', ivory: '#F6F0DF', volt: '#A880FF', uv: '#7A4DFF', lilac: '#C9B6FF', uvDeep: '#2A1660', plum: '#160A26',
  void: '#080310', soil: '#4A3424', soilDeep: '#22160F', torn: '#3C8A3A', kit: '#DF2321',
} as const;
/** The stage dim's multiply colour at level 1 (stage.dim). */
export const DIM: RGB = [70, 52, 120];
/** v2 stage shots cap the dim here (stage.dim o.max); blackouts pass { uncapped: true } with a level <= 0.97 for <= 0.6 s. */
export const DIM_V2 = 0.94;
/** Fade colour into the result view. */
export const FADE: RGB = [8, 4, 14];

// ---------------------------------------------------------------- tempo (§4.1): one 150 BPM grid

export const BPM = 150;
export const BEAT = 0.4;
export const EIGHTH = 0.2;
export const SIXTEENTH = 0.1;
export const THIRTYSECOND = 0.05;
/** The grid's beat 0 is global 1.6 s, the first frame of shot 2 (shot 1 is the count-in). */
export const GRID0 = 1.6;
/** Global start of each shot (index 0 = shot 1), the 16.4 s end, and ENCORE's 18.0 s end (shot 10). */
export const SHOT_T0 = [0, 1.6, 4.4, 5.6, 6.4, 8.0, 10.4, 12.0, 13.6, 16.4, 18.0] as const;
/** The ONE of bar n at BAR(n) = 1.6 + (n - 1)·1.6 (1.6, 3.2, 4.8, ... 16.0, 17.6). */
export const BAR = (n: number) => GRID0 + (n - 1) * 4 * BEAT;
/** Global time of shot-local t in shot n (1-10). */
export const globalT = (shot: number, t: number) => SHOT_T0[shot - 1] + t;
/** Beat number (fractional) at global time gt. */
export const beatOf = (gt: number) => (gt - GRID0) / BEAT;
export const snapGrid = (t: number, grid = SIXTEENTH) => Math.round(t / grid) * grid;
export const isOnGrid = (t: number, grid = SIXTEENTH) => Math.abs(t / grid - Math.round(t / grid)) < 1e-6;
const warned = new Set<string>();
/**
 * Dev assert for a listed cue: warns once if `t` (shot-local; every shot from 2 on starts on a whole beat) is off the
 * grid (default the 16th; pass THIRTYSECOND where §6 lists 32nds). Returns t, so it can wrap a cue time.
 */
export function onGrid(t: number, what = '', grid: number = SIXTEENTH): number {
  if (!isOnGrid(t, grid) && !isOnGrid(t, THIRTYSECOND)) {
    const k = `${what}@${t}`;
    if (!warned.has(k)) {
      warned.add(k);
      console.warn(`SPOTLIGHT SOLO v2: cue ${what} at ${t} s is off the ${grid} s grid`);
    }
  }
  return t;
}
/** 0..1 pulse snapping to 1 on every `every` (default a beat) and decaying over `decay` s. */
export const beatPulse = (t: number, every = BEAT, decay = 0.12) => {
  const ph = ((t % every) + every) % every;
  return clamp(1 - ph / decay);
};
/** Tom pitches (Hz) as v1, and the war drum (58 Hz is built into sfx.warDrum). */
export const TOMS = { D2: 73.42, F2: 87.31, A2: 110, C3: 130.81, D3: 146.83 } as const;

/** OLÉ 1-4 (global): A's trophy, B's, C's, D's. */
export const OLE_GLOBAL = [7.6, 10.0, 11.6, 13.2] as const;
/** The four-count pads' lit times in shot-local time of shot n: fourCount(ctx, padsFor(n), t, ...). */
export const padsFor = (shot: number) => OLE_GLOBAL.map((g) => g - SHOT_T0[shot - 1]);
/** The curtain drop (global): the crowd's stomp on beat 3 of bar 9 (shot 9 local 1.60). */
export const CURTAIN = 15.2;

// ---------------------------------------------------------------- the ten shots (§5; ENCORE ships: owner's decision)

export interface ShotMeta {
  n: number;
  file: string;
  name: string;
  dur: number;
  seed: number;
}
export const SHOTS: readonly ShotMeta[] = [
  { n: 1, file: 'shot1_slam.ts', name: 'Spot slam', dur: 1.6, seed: 511 },
  { n: 2, file: 'shot2_lightsout.ts', name: 'Lights out', dur: 2.8, seed: 512 },
  { n: 3, file: 'shot3_stare.ts', name: 'The stare', dur: 1.2, seed: 513 },
  { n: 4, file: 'shot4_ignition.ts', name: 'Ignition', dur: 0.8, seed: 514 },
  { n: 5, file: 'shot5_stepover.ts', name: 'Step-over', dur: 1.6, seed: 515 },
  { n: 6, file: 'shot6_slide.ts', name: 'Over the slide', dur: 2.4, seed: 516 },
  { n: 7, file: 'shot7_elastico.ts', name: 'Elastico', dur: 1.6, seed: 517 },
  { n: 8, file: 'shot8_nutmeg.ts', name: 'Nutmeg', dur: 1.6, seed: 518 },
  { n: 9, file: 'shot9_curtain.ts', name: 'Curtain call', dur: 2.8, seed: 519 },
  { n: 10, file: 'shot10_encore.ts', name: 'Encore', dur: 1.6, seed: 520 },
];

// ---------------------------------------------------------------- rate (§6 'Rate' rows) and the lamp hum (§10.2 item 8)

/** Simulation rate per shot (hit-stops and slow windows are rests in the bar; rate never slows the shot clock). */
export const RATE: Record<number, (t: number) => number> = {
  1: (t) => warp(t, [[0.06, 0.05, 0.1]]),
  2: (t) => warp(t, [[0.0, 0.05, 0.15], [0.8, 0.05, 0.15], [1.6, 0.05, 0.05], [2.4, 0.05, 0.1]]),
  3: (t) => (t < 0.8 ? 0.35 : 1),
  4: (t) => warp(t, [[0.1, 0.08, 0.05], [0.18, 0.06, 2.0]]),
  5: (t) => warp(t, [[0.4, 0.2, 0.08], [0.8, 0.16, 0.03], [0.96, 0.1, 2.2]]),
  6: (t) => {
    if (t >= 0.6 && t < 0.8) return lerp(1, 0.3, ease.inQuad((t - 0.6) / 0.2));
    return warp(t, [[0.0, 0.06, 0.1], [0.8, 0.8, 0.03], [1.6, 0.12, 2.0]]);
  },
  7: (t) => warp(t, [[0.45, 0.25, 0.06], [0.8, 0.08, 0.03], [0.88, 0.08, 1.8]]),
  8: (t) => warp(t, [[0.8, 0.06, 0.03], [0.86, 0.2, 1.4]]),
  // ENCORE ships: no freeze at 2.20 (the brief's "0 from 2.20" is the 1-ON-1 ending's).
  9: (t) => warp(t, [[0.0, 0.1, 0.03], [1.6, 0.08, 0.05]]),
  // ENCORE: the freeze on the GOAL from the ONE of bar 11 (local 1.20).
  10: (t) => (t >= 1.2 ? 0 : 1),
};

/**
 * The simulation clock of shot n at shot time t: the integral of RATE[n] on the 1/60 grid (a pure function, so a frozen
 * tableau holds exactly and a seek lands on the same pose). Use it for anything that should obey the hit-stops in
 * render (sprite physics, falling chunks), while cues, cameras and sprite schedules stay on t.
 */
export function simTime(n: number, t: number): number {
  const r = RATE[n];
  let s = 0;
  const steps = Math.floor(t * 60 + 1e-6);
  for (let i = 1; i <= steps; i++) s += r(i / 60) / 60;
  return s + (t - steps / 60) * r(t);
}

/** The lamp hum is on whenever a SOLO lamp is lit: 1 0.06-1.45, 2 from 2.40, 3-8 throughout, 9 to 1.60, 10 never. */
export const HUM: Record<number, (t: number) => boolean> = {
  1: (t) => t >= 0.06 && t < 1.45,
  2: (t) => t >= 2.4,
  3: () => true,
  4: () => true,
  5: () => true,
  6: () => true,
  7: () => true,
  8: () => true,
  9: (t) => t < 1.6,
  10: () => false,
};

// ---------------------------------------------------------------- grades (§2.2): each selects the SOLO post program

interface Grade {
  tint: RGB;
  contrast: number;
  bloom: number;
  thresh: number;
  vignette: number;
  ca: number;
}
const G_LIT: Grade = { tint: [232, 228, 255], contrast: 1.12, bloom: 0.9, thresh: 0.66, vignette: 0.6, ca: 0.0015 };
const G_STAGE: Grade = { tint: [236, 228, 255], contrast: 1.14, bloom: 1.0, thresh: 0.66, vignette: 0.65, ca: 0.002 };
const G_BLAZE0: Grade = { tint: [246, 242, 255], contrast: 1.1, bloom: 1.25, thresh: 0.6, vignette: 0.55, ca: 0.01 };
const G_BLAZE1: Grade = { tint: [246, 242, 255], contrast: 1.1, bloom: 0.95, thresh: 0.66, vignette: 0.55, ca: 0.002 };
function apply(fx: FxState, g: Grade) {
  fx.pass = 'solo';
  fx.sat = 1;
  fx.tint = g.tint;
  fx.contrast = g.contrast;
  fx.bloom = g.bloom;
  fx.bloomThresh = g.thresh;
  fx.vignette = g.vignette;
  fx.ca = g.ca;
}
/** Shot 2a's floodlit wall. */
export function soloLit(fx: FxState) {
  apply(fx, G_LIT);
}
/** Every stage shot (the default); o overrides single values (the shot 3 bloom 1.05, shot 1's vignette 0.70...). */
export function soloStage(fx: FxState, o: Partial<Grade> = {}) {
  apply(fx, { ...G_STAGE, ...o });
}
/** The relit stadium (shot 9c from the relight, shot 10): bloom 1.25 / 0.60 -> 0.95 / 0.66 and CA 0.010 -> 0.002 over 0.3 s (u = s since the relight). */
export function soloBlaze(fx: FxState, u: number) {
  const k = ease.outQuad(clamp(u / 0.3));
  apply(fx, {
    tint: mixRGB(G_BLAZE0.tint, G_BLAZE1.tint, k), contrast: 1.1, bloom: lerp(1.25, 0.95, k), thresh: lerp(0.6, 0.66, k), vignette: 0.55,
    ca: lerp(0.01, 0.002, k),
  });
}

// ---------------------------------------------------------------- the beam impact (§2.3, §10.1 item 2)

/** The ?neon dev flag (the NEON chunk prototype on beam impact A frames; off in the shipped film). */
export const NEON_DEV = typeof location !== 'undefined' && new URLSearchParams(location.search).has('neon');

/** A beam impact's cone: apex (UV, y down), axis (screen direction), half-angle (rad). */
export interface ImpactCone {
  x: number;
  y: number;
  dx: number;
  dy: number;
  half: number;
}

/**
 * SOLO's beam impact (the two-tone impact INSIDE the spot's cone only). Stage A: volt / spot at threshold 0.40 inside,
 * void outside (amount 1.0): the subject blazes white inside a violet cone. Stage B: lilac / void at 0.40 inside (the
 * subject a black cut-out in a lilac cone), void outside at 0.85. Without a cone it is full frame (no mask). Each stage
 * lasts at most 2 frames; FlashBudget counts A and B as two events (§4.4).
 */
export function soloImpact2(fx: FxState, stage: 'A' | 'B', cone?: ImpactCone) {
  // The optional neon prototype (§10.1 item 4, never shipped by default): with ?neon, stage A also prints the Sobel edges.
  if (NEON_DEV && stage === 'A') fx.neon = 1;
  fx.impact = 1;
  fx.impThresh = 0.4;
  if (stage === 'A') {
    fx.impA = PAL.volt;
    fx.impB = PAL.spot;
  } else {
    fx.impA = PAL.lilac;
    fx.impB = PAL.void;
  }
  fx.impOut = PAL.void;
  fx.impOutAmt = stage === 'A' ? 1 : 0.85;
  if (cone) {
    fx.impMask = 1;
    fx.impMaskX = cone.x;
    fx.impMaskY = cone.y;
    fx.impMaskDX = cone.dx;
    fx.impMaskDY = cone.dy;
    fx.impMaskHalf = cone.half;
    fx.impMaskSoft = 0.04;
  } else fx.impMask = 0;
}

/**
 * The no-shader fallback (if the cone mask slips): full-frame stage A = void / lilac at threshold 0.72, with a canvas
 * pass that adds the beam cone at +40 % on the same frame (call coneBoost in render); stage B = uv / spot at 0.40.
 */
export function soloImpactFallback(fx: FxState, stage: 'A' | 'B') {
  fx.impMask = 0;
  fx.impact = 1;
  if (stage === 'A') {
    fx.impA = PAL.void;
    fx.impB = PAL.lilac;
    fx.impThresh = 0.72;
  } else {
    fx.impA = PAL.uv;
    fx.impB = PAL.spot;
    fx.impThresh = 0.4;
  }
}

/** The fallback's canvas cone (+40 % light inside the beam's cone), screen space. */
export function coneBoost(ctx: CanvasRenderingContext2D, cone: ImpactCone, len = 900, a = 0.4) {
  const x = cone.x * VW, y = cone.y * VH;
  const ang = Math.atan2(cone.dy, cone.dx);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = `rgba(255,250,236,${clamp(a)})`;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(ang - cone.half) * len, y + Math.sin(ang - cone.half) * len);
  ctx.lineTo(x + Math.cos(ang + cone.half) * len, y + Math.sin(ang + cone.half) * len);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** A flat refraction shock (never drawn): pushShock with sy (0.25-0.4 lays it along the turf; FLATSHOCK chunk). */
export function flatShock(fx: FxState, x: number, y: number, r: number, s: number, sy = 0.3) {
  if (fx.shocks.length < 4) fx.shocks.push({ x, y, r, s, sy });
  else {
    let k = 0;
    for (let i = 1; i < 4; i++) if (Math.abs(fx.shocks[i].s) < Math.abs(fx.shocks[k].s)) k = i;
    if (Math.abs(fx.shocks[k].s) < Math.abs(s)) fx.shocks[k] = { x, y, r, s, sy };
  }
}

/**
 * A flat shock from its birth time: the ring radius grows 0 -> 0.6 screen heights over 0.45 s (outCubic) while its
 * strength fades (pure function of t). (x, y) in UV.
 */
export function flatShockAt(fx: FxState, x: number, y: number, t0: number, t: number, s: number, sy = 0.3, dur = 0.45) {
  const u = (t - t0) / dur;
  if (u < 0 || u >= 1) return;
  flatShock(fx, x, y, 0.6 * ease.outCubic(u), s * (1 - u), sy);
}

/** The beat echo (v1's fx.echo), for `frames` frames (<= 4) from `at`. */
export function echoAt(env: Env, t: number, at: number, frames: number, amount: number, dx: number, o: { dy?: number; sx?: number; sy?: number; R?: number } = {}) {
  const n = Math.min(4, Math.max(1, Math.round(frames)));
  if (t < at - 1e-6 || t >= at + n / 60 - 1e-6) return false;
  const fx = env.fx;
  fx.echo = clamp(amount);
  fx.echoDX = dx;
  fx.echoDY = o.dy ?? 0;
  fx.echoX = (o.sx ?? VW / 2) / VW;
  fx.echoY = (o.sy ?? VH / 2) / VH;
  fx.echoR = o.R ?? 0;
  return true;
}

/** True on exactly the frames [at, at + frames/60). */
export const onFrames = (t: number, at: number, frames = 1) => t >= at - 1e-6 && t < at + frames / 60 - 1e-6;
/** 0 -> 1 over `frames` frames from `at` (a defender cross-fading into the light over 4 frames). */
export const fadeIn = (t: number, at: number, frames = 4) => clamp((t - at) / (frames / 60));

// ---------------------------------------------------------------- the beat-slam camera (§1.3, §10.2 item 6)

export interface CamPose {
  x: number;
  y: number;
  zoom: number;
}
export type BeatMove = 'snap' | 'cut' | 'crash' | 'whip' | 'glide' | 'track' | 'rush';
/** One beat key: the pose reached at `t` by `move` (from the previous key). */
export interface BeatKey {
  t: number;
  x: number;
  y: number;
  zoom: number;
  move?: BeatMove;
  /** Move length (s) for crash / whip / glide / rush (default: from the previous key). */
  dur?: number;
  ease?: KeyEase;
  /** Whips and rushes: the streak length (UV) at the middle of the move. */
  streak?: number;
  /** Rushes: the radial blur at the middle of the move. */
  radial?: number;
}

const MOVE_EASE: Record<BeatMove, KeyEase> = {
  snap: 'step2', cut: 'step', crash: 'inExpo', whip: 'inQuad', glide: 'inOutSine', track: 'linear', rush: 'inExpo',
};

/**
 * beatCam2: SOLO's beat grid laid over the shared kit.keys() tracks (§10.2 item 6). Each key becomes keys() rows:
 * 'snap' = a 'step2' row plus a 3 % overshoot row settling over 4 frames; 'cut' = a step; 'crash' / 'rush' inExpo;
 * 'whip' inQuad; 'glide' inOutSine; 'track' linear. A move with `dur` starts dur before its key (holding the previous
 * pose until then). Whips and rushes write fx.streak / fx.radial (when fx is given) peaking mid-move. Every key time
 * is checked with onGrid (16ths or 32nds). A pure function of t (seek is exact); roll is always 0.
 */
export function beatCam2(ks: readonly BeatKey[], t: number, fx?: FxState, o: { streakDX?: number; streakDY?: number } = {}): CamPose {
  if (!ks.length) return { x: VW / 2, y: VH / 2, zoom: 1 };
  const X: KeyRow[] = [], Y: KeyRow[] = [], Z: KeyRow[] = [];
  const F = 1 / 60;
  for (let i = 0; i < ks.length; i++) {
    const k = ks[i];
    onGrid(k.t, `beatCam2 key ${i}`, THIRTYSECOND);
    const mv = k.move ?? (i === 0 ? 'cut' : 'glide');
    const e = k.ease ?? MOVE_EASE[mv];
    if (i > 0 && k.dur !== undefined && mv !== 'cut' && mv !== 'snap') {
      const p = ks[i - 1];
      const t0 = Math.max(p.t, k.t - k.dur);
      X.push([t0, p.x, 'step']);
      Y.push([t0, p.y, 'step']);
      Z.push([t0, p.zoom, 'step']);
    }
    if (mv === 'snap' && i > 0) {
      const p = ks[i - 1];
      const ov = (a: number, b: number) => b + (b - a) * 0.03;
      X.push([k.t, ov(p.x, k.x), 'step2'], [k.t + 4 * F, k.x, 'outQuad']);
      Y.push([k.t, ov(p.y, k.y), 'step2'], [k.t + 4 * F, k.y, 'outQuad']);
      Z.push([k.t, ov(p.zoom, k.zoom), 'step2'], [k.t + 4 * F, k.zoom, 'outQuad']);
    } else {
      X.push([k.t, k.x, i === 0 ? 'step' : e]);
      Y.push([k.t, k.y, i === 0 ? 'step' : e]);
      Z.push([k.t, k.zoom, i === 0 ? 'step' : e]);
    }
    if (fx && i > 0 && (mv === 'whip' || mv === 'rush')) {
      const t0 = k.t - (k.dur ?? k.t - ks[i - 1].t);
      const u = (t - t0) / Math.max(1e-3, k.t - t0);
      if (u >= 0 && u < 1) {
        const bell = Math.sin(Math.PI * u);
        if (k.streak) {
          fx.streak = Math.max(fx.streak, k.streak * bell);
          const dx = o.streakDX ?? Math.sign(k.x - ks[i - 1].x), dy = o.streakDY ?? Math.sign(k.y - ks[i - 1].y);
          fx.streakDX = dx || 1;
          fx.streakDY = dy;
        }
        if (k.radial) fx.radial = Math.max(fx.radial, k.radial * bell);
      }
    }
  }
  const sort = (r: KeyRow[]) => r.sort((a, b) => a[0] - b[0]);
  return { x: keys(sort(X), t), y: keys(sort(Y), t), zoom: keys(sort(Z), t) };
}

/** The kick-drum pump: a sum of kit.punch on each hit (amt, 0.25·decay in, 0.75·decay out). */
export function bounce(t: number, hits: readonly number[], amt = 0.025, decay = 0.1) {
  let z = 0;
  for (const h of hits) z += punch(t, h, amt, 0.25 * decay, 0.75 * decay);
  return z;
}
/** SOLO's v1-style punch(t, at, amt, dur) on the shared kit.punch (0.25·dur in, 0.75·dur out). */
export const soloPunch = (t: number, at: number, amt: number, dur = 0.1) => punch(t, at, amt, 0.25 * dur, 0.75 * dur);

/** Apply a CamPose to the camera (roll 0; the shake roll is capped at 0.015 in every init). */
export function applyCam(env: Env, p: CamPose) {
  env.cam.x = p.x;
  env.cam.y = p.y;
  env.cam.zoom = p.zoom;
  env.cam.rot = 0;
}

// ---------------------------------------------------------------- StepPrint (§10.2 item 7)

/**
 * The step-print shutter (shot 4, 0.40-0.80, n 3): update(t, n, snapshot) stores the render state on every n-th fixed
 * step inside [t0, t1); state(t) returns the held state (or null outside the window). update() runs at the fixed step
 * during seek too, so the held states are exact.
 */
export class StepPrint<S> {
  private held: S | null = null;
  private step = -1;
  constructor(public t0: number, public t1: number) {}
  reset() {
    this.held = null;
    this.step = -1;
  }
  update(t: number, n: number, snapshot: () => S) {
    if (t < this.t0 - 1e-6 || t >= this.t1 - 1e-6) return;
    const k = Math.floor((t - this.t0) * 60 + 1e-6);
    const slot = Math.floor(k / Math.max(1, n));
    if (slot !== this.step) {
      this.step = slot;
      this.held = snapshot();
    }
  }
  state(t: number): S | null {
    return t >= this.t0 - 1e-6 && t < this.t1 - 1e-6 ? this.held : null;
  }
}

// ---------------------------------------------------------------- No.10's frame schedules (§9.1, §9.3)

/** [shot-local start time, frame key, mirrored?] keys, contact frames on their drum hits. */
export type SoloSeq = readonly (readonly [number, SoloKey, boolean?])[];
const alt = (t0: number, t1: number, a: SoloKey, b: SoloKey, every = 0.2): [number, SoloKey][] => {
  const out: [number, SoloKey][] = [];
  for (let t = t0, i = 0; t < t1 - 1e-6; t += every, i++) out.push([Math.round(t * 1000) / 1000, i % 2 ? b : a]);
  return out;
};
export const SEQ: Record<number, SoloSeq> = {
  1: [[0, 'SF1'], [0.6, 'SF2']],
  // 2a SnapBack (SB0 the loose start, SB1 0.95, SB2 1.30, SB3 the snap 1.60); 2b the boots' fluoro from EN1; 2c SB3.
  2: [[0, 'SB0'], [0.95, 'SB1'], [1.3, 'SB2'], [1.6, 'SB3'], [1.8, 'EN1'], [2.4, 'SB3']],
  3: [...alt(0, 0.8, 'EN1', 'EN1b'), [0.8, 'EN1'], [1.0, 'MB6']],
  4: [[0, 'MB1'], [0.1, 'MB2'], [0.4, 'MB3'], [0.5, 'MB3', true], [0.6, 'MB3'], [0.7, 'MB3', true]],
  5: [
    [0, 'FT1'], [0.14, 'SO2'], [0.27, 'SO3'], [0.4, 'SO4'], [0.6, 'SO5'], [0.7, 'SO6'], [0.8, 'SO7'],
    [0.85, 'BR1'], [1.0, 'BR2'], [1.15, 'BR3'], [1.3, 'BR2'], [1.45, 'BR3'],
  ],
  6: [
    [0, 'SL3'], [0.1, 'SL4'], [0.2, 'SL5'], [0.4, 'SL6'], [0.6, 'SL7'], [0.7, 'SL8'], [0.8, 'SL8b'], [1.2, 'HF1'], [1.6, 'SL8b'],
    [1.68, 'SL9'], [1.75, 'SL10'], [2.0, 'SL11'], [2.05, 'D2'], [2.1, 'D3'], [2.15, 'D4'],
  ],
  // 7a MacroBoots (mirrored for the left boot), 7b the Break west strip (flip) on 8ths.
  7: [[0, 'MB3'], [0.2, 'MB3', true], [0.4, 'MB4'], [0.8, 'MB5'], [1.0, 'MB3', true], [1.05, 'BR2', true], [1.2, 'BR3', true], [1.4, 'BR2', true]],
  // 8a front (then hidden by the smother; MB2 in the gap at the crack); 8b Break front + MacroBoots layer (see SEQ_BOOTS_8).
  8: [[0, 'FT1'], [0.2, 'NM2'], [0.3, 'NM3'], [0.4, 'NM4'], [0.8, 'MB2'], [0.86, 'BR2'], [1.0, 'BR3'], [1.2, 'BR2'], [1.4, 'BR3']],
  // 9a Settle F2; 9b Settle F3 (0.25x cache); 9c EN1, EN2 (the cue), EN3 (on the beat), EN3 / EN3b every 0.2 s from 1.80.
  9: [[0, 'ST2'], [0.1, 'ST3'], [1.2, 'EN1'], [1.4, 'EN2'], [1.6, 'EN3'], ...alt(1.8, 2.8, 'EN3', 'EN3b')],
  // ENCORE: the drag-back past the seated keeper, the tap into the net, the ta-da (freeze from 1.20).
  10: [[0, 'DB1'], [0.2, 'DB2'], [0.3, 'DB3'], [0.4, 'DB4'], [0.8, 'DB4b'], [1.0, 'DB4c']],
};
/** Shot 8b's near-boot macro layer (MacroBoots x4): the right boot 1.00, the left (mirrored) 1.20, the right 1.40, the sole 1.50. */
export const SEQ_BOOTS_8: SoloSeq = [[0.86, 'MB3'], [1.0, 'MB3'], [1.2, 'MB3', true], [1.4, 'MB3'], [1.5, 'MB6']];
/** The frame (and mirror flag) of a schedule at shot time t. */
export function soloAt(seq: SoloSeq, t: number): { key: SoloKey; flip: boolean } {
  let k = seq[0];
  for (const e of seq) if (t >= e[0] - 1e-6) k = e;
  return { key: k[1], flip: !!k[2] };
}
/** No.10's integer sprite scale per shot (it changes only on a beat-snap or a hidden swap). */
export const SCALE: Record<number, (t: number) => number> = {
  1: () => 8,
  2: (t) => (t >= 1.8 && t < 2.4 ? 1.6 : 3.4),
  3: (t) => (t >= 1.0 - 1e-6 ? 5 : 2.8),
  4: () => 5,
  5: (t) => (t >= 1.2 - 1e-6 ? 3 : 2.4),
  6: (t) => (t >= 1.2 - 1e-6 && t < 1.6 - 1e-6 ? 2.4 : 3),
  7: (t) => (t < 1.05 - 1e-6 ? 4 : t >= 1.2 - 1e-6 ? 3 : 2.4),
  8: (t) => (t < 0.4 - 1e-6 ? 1.6 : t < 0.86 - 1e-6 ? 2 : 3),
  9: (t) => (t < 0.1 ? 3 : t < 1.2 ? 0.25 : 2.2),
  10: () => 2.2,
};

// ---------------------------------------------------------------- defenders, the Tower, the keeper

/** A defender in the dark: plum-ink body, lilac rim on the lit side, ultraviolet inner rim (PuppetCache silhouette). */
export const DEF_SIL = { fill: [26, 15, 46] as RGB, rim: PAL.lilac, rim2: PAL.uv };
/** The shots' one puppet cache (the shared kit.PuppetCache; at most 4 live puppet renders a frame: PUPPETS.draws). */
export const PUPPETS = new PuppetCache();
/** D is the Tower (MERIDIAN v2's model): RIVAL_KIT, a captain's armband, 1.3x bulk, the biggest on the pitch. */
export const TOWER_BULK = 1.3;

/**
 * The Tower's puppet (SOLO v2's own accessor of the shared model: drawn 1.3x wide and 1.06x tall about the hip, with a
 * code armband on the far upper arm). `lit` 0 = the dark-stage silhouette, 1 = full colour. Studio frames for him are
 * RivalFront RF1T-RF4T (drawRival).
 */
export function drawTowerPuppet(
  ctx: CanvasRenderingContext2D, kit: Kit, name: string, pose: Pose, x: number, y: number, k: number, D: number, facing: 1 | -1 = -1,
  o: { lit?: number; rot?: number; alpha?: number; lx?: number; ly?: number } = {},
) {
  ctx.save();
  ctx.translate(x, y);
  if (o.rot) ctx.rotate(o.rot);
  ctx.scale(TOWER_BULK, 1.06);
  PUPPETS.draw(ctx, `T:${name}`, kit, pose, k, facing, 0, 0, D, o.lit ?? 1, { ...DEF_SIL, lx: o.lx ?? 0.6, ly: o.ly ?? -0.8 }, o.alpha ?? 1);
  const lit = clamp(o.lit ?? 1);
  if (lit > 0) {
    const j = joints(pose);
    const sh = j.neck, hand = j.handF;
    const kd = k * D;
    const bx = (sh[0] + (hand[0] - sh[0]) * 0.35) * facing * kd, by = (sh[1] + (hand[1] - sh[1]) * 0.35) * kd;
    ctx.globalAlpha = (o.alpha ?? 1) * lit;
    ctx.fillStyle = '#146e6e';
    ctx.fillRect(Math.round(bx - 2 * kd), Math.round(by - kd), Math.max(1, Math.round(4 * kd)), Math.max(1, Math.round(2 * kd)));
  }
  ctx.restore();
}

// ---------------------------------------------------------------- ball helpers

/** A ball spin as a pure function of an angle (rad) about an axis (screen space): seek-exact panels in render. */
export function spinAt(angle: number, ax = 0, ay = 0, az = 1): BallSpin {
  const s = new BallSpin();
  s.rotate(ax, ay, az, angle);
  return s;
}

/** The blacklight ball's radii the brief draws (warm them in prepare()): renderBall caches its buffer per size. */
export const BALL_RADII = [17, 29, 34, 35, 36, 40, 48, 50, 52, 54, 57, 60] as const;
const warmSpin = new BallSpin();
export function warmBalls(radii: readonly number[] = BALL_RADII) {
  for (const r of radii) renderBall(r, warmSpin, 0, true, 'blacklight');
}

// ---------------------------------------------------------------- placeholders (engine foundation)

export interface ShotSpec {
  n: number;
  cues?: Shot['cues'];
}
export interface PlaceholderDemo {
  prepare?(env: Env): void;
  init?(env: Env): void;
  update?(env: Env, t: number, dt: number): void;
  render?(env: Env, t: number): void;
}

let warmed = false;
/** Warm SOLO v2's post program and ball buffers once (shot 1's prepare()). */
export function warmSolo2() {
  if (warmed) return;
  warmed = true;
  warmPost('solo');
  warmBalls();
}

/**
 * A placeholder shot from the engine foundation: the brief's name, duration, seed, rate and cues, plus a demo of its
 * engine pieces (a rough draft for the shot team to replace). Every init clears the bus, caps the shake roll at 0.015
 * and resets the camera; the lamp hum follows HUM[n] every step; a label names the shot.
 */
export function placeholderShot(spec: ShotSpec, demo: PlaceholderDemo = {}): Shot {
  const meta = SHOTS[spec.n - 1];
  return {
    name: meta.name,
    dur: meta.dur,
    seed: meta.seed,
    rate: RATE[spec.n],
    cues: spec.cues,
    prepare(env) {
      warmSolo2();
      demo.prepare?.(env);
    },
    init(env) {
      env.sfx.clearBus();
      env.cam.set(VW / 2, VH / 2, 1, 0);
      env.cam.shakeRoll = 0.015;
      PUPPETS.frame();
      demo.init?.(env);
    },
    update(env, t, dt) {
      env.sfx.hum(HUM[spec.n](t), 0.025);
      demo.update?.(env, t, dt);
    },
    render(env, t) {
      const ctx = env.ctx;
      env.screen();
      ctx.fillStyle = HEX.void;
      ctx.fillRect(0, 0, VW, VH);
      PUPPETS.frame();
      demo.render?.(env, t);
      env.screen();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(8,3,16,0.78)';
      ctx.fillRect(8, 8, 266, 30);
      ctx.fillStyle = HEX.uv;
      ctx.fillRect(8, 8, 3, 30);
      pixelText(ctx, `SOLO v2 · SHOT ${spec.n} · ${meta.name.toUpperCase()}`, 16, 12, 9, HEX.ivory, 'left', HEX.plum);
      pixelText(ctx, `PLACEHOLDER  t ${t.toFixed(2)} / ${meta.dur.toFixed(1)} s  (g ${(SHOT_T0[spec.n - 1] + t).toFixed(2)})`, 16, 25, 8, HEX.lilac, 'left', HEX.plum);
      if (!env.fx.pass) soloStage(env.fx);
    },
  };
}

/** Pixel-font caption helper for placeholders and HUD tags. */
export function caption(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size = 10, color: string = HEX.lilac) {
  ctx.save();
  ctx.font = `${size}px ${PIXEL_FONT}`;
  ctx.restore();
  pixelText(ctx, text, x, y, size, color, 'center', HEX.plum);
}
