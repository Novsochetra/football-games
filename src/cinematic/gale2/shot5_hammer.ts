// GALE HAMMER v2 · shot 5 · "Hammer" (1.5 s, seed 315): hammer 1, the cone is born, the camera is blown back.
// SPEC.md §6 shot 5 (+ the art hand-off schedule for StrikeMacro / Strike F9r-F9s).
//
// Story job: BOOM. The first hammer blow: the 109 px ball crushed flat on the laces, then the camera blasted backward.
//   0.00-0.08  the macro (screen space at grass level, MD 2): the boot swings in from the left at full speed (M1, a
//              smear band and a streak blur), the flattened pressure disc of shot 4 glowing on its laces; the ball sits
//              in the dew, floodlight bokeh behind it.
//   0.08       HAMMER 1 (E4): the 12-layer stack on one frame: the isobar weather map round the contact, two shock rings,
//              the lens bulge, the squash + dent + ice ripples, the dew crown, 70 ice sparks + 30 dew beads, 120 focus
//              lines (inward, flipping outward at 0.14), CA + radial, the grass fanned flat in a 300 px crop ellipse,
//              bloom 1.3 with the bokeh pulsing x1.6, cam.hit(1) + punch +0.18 + shove. 0.14 the negative print (E5).
//   0.08-0.58  the hit-stop (rate 0.03, then 0.12): the ball crushed to sx 0.62 / sy 1.26 (M2 -> M2b -> M2c: the brief's
//              0.5 / 1.32 read as a disc edge-on at 109 px), the boot back-lit to navy, a vapour sheet squeezed out of the
//              seam (the collar being born), isobar contours breathing out of the contact, the camera trembling.
//   0.58       release: the ball springs back past round, stretches 2.2x along the flight line and is gone in 2 frames;
//              the vapour collar bursts from the boot (it hides the swap) and the barrier torus is left hanging.
//   0.62-0.87  BLOW-BACK in the side world view: zoom 2.40 on the boot -> 0.90 ('blowBack'), cam.shove(-40, -10);
//              the collar ring bursts past the frame edges, the vapour cone streaks away to the goal like a white
//              javelin and leaves a contrail, the pressed wake unzips behind it with its bow wave of dew and blades, a
//              pressure wave races out across the turf, turf and dew are thrown at the lens, his wind aura is ripped
//              off him like a cape, the barrier torus hangs round his boot.
//   0.80-1.30  F9r: the recoil skid (the plant heel ploughs 2 m back on two pressed streaks), F9s, F9, F10; the far
//              wall at the right edge rocks back, forearms up; the crowd wakes (roar).
//   1.36-1.50  whip-pan right toward the goal (streak blur): the motion cut into shot 6's ride.
//
// Clocks: the camera, cues, sprite frames, the squash and every screen-space effect run on the unwarped shot clock t;
// particles run on the warped sim clock (RATE[5]: a 0.03 / 0.12 hit-stop, then the 0.35 -> 1 slow-motion recoil).
// Every decal and camera value is a pure function of t; particles spawn only in update() on env.rng, one-shot bursts
// behind flags (reset in init); render() uses env.frng() and a frame-stable hash. Never the banned word anywhere.

import type { Env, Shot } from '../timeline';
import { STEP } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { TAU, Rng, clamp, ease, lerp, type RGB } from '../../engine/math';
import { PK, drawGlow, glowOf, softSprite } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { FIELD, drawFieldBackdrop } from '../../art/stadium';
import { drawNo10, no10, no10Point, type No10Key } from '../../art/no10';
import { drawAnim, findFrame, type StudioAnim } from '../../art/studioAnim';
import { POSES, RIVAL_KIT, RIVAL_KIT_B, RIVAL_KIT_C, joints, type Kit, type Pose } from '../../art/puppet';
import { drawBall, holdTrauma, keys, pushShock, zoomAbout, type KeyRow, type PuppetSil } from '../kit';
import {
  HEX, MUFFLE, PAL, PUPPETS, RATE, SHOTS, drawBlades, floodBack, galeIso, galeStorm, isobars, makeBlades, sparkleCyan,
  stormDarken, warmGale, type Blade,
} from './common';
import { airCrater, pressedWake, vaporCone, windAura, type WakePt } from './air';

const META = SHOTS[4];
const DUR = META.dur;
type P2 = [number, number];

/** Frame-stable hash in [0, 1). */
const hash = (n: number) => {
  const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
};
const ICE = 'rgb(238,251,255)', CYAN = 'rgb(70,216,255)', NAVY = 'rgb(10,18,56)';
/** The boot's back-lit tint on the weather map (deeper than PAL.navy). */
const BOOT_BLACK: RGB = [2, 4, 15];
const rgb = (c: RGB, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

// ---------------------------------------------------------------- timing (shot-local, unwarped)

const T = {
  hit: 0.08, iso2: 0.14, isoEnd: 0.21, deep: 0.4, thru: 0.56, rel: 0.58, swap: 0.62, f8: 0.66, skid: 0.8, blown: 0.87,
  roar: 0.9, step: 1.04, hop: 1.12, settle: 1.3, whip: 1.36,
} as const;

/** No.10's schedule (the art hand-off supersedes the brief's order and common.ts SEQ[5]). */
type Key5 = 'M1' | 'M2' | 'M2b' | 'M2c' | 'M3' | 'F7' | 'F8' | 'F9r' | 'F9s' | 'F9' | 'F10';
const SEQ5: readonly (readonly [number, Key5])[] = [
  [0, 'M1'], [0.08, 'M2'], [0.14, 'M2b'], [0.4, 'M2c'], [0.56, 'M3'],
  // F9 (the landing give), then the soft settle F10 at 1.30 (the brief's schedule: he settles before the whip).
  [0.62, 'F7'], [0.66, 'F8'], [0.8, 'F9r'], [1.04, 'F9s'], [1.12, 'F9'], [1.3, 'F10'],
];
function keyAt(t: number): Key5 {
  let k: Key5 = SEQ5[0][1];
  for (const [at, key] of SEQ5) if (t >= at - 1e-6) k = key;
  return k;
}

// ---------------------------------------------------------------- the sim clock (pure: the runner's steps of RATE[5])

const SIM = (() => {
  const n = Math.ceil(DUR / STEP) + 2;
  const a = new Float64Array(n);
  for (let k = 1; k < n; k++) a[k] = a[k - 1] + STEP * RATE[5](k * STEP);
  return a;
})();
function simAt(t: number): number {
  const f = clamp(t / STEP, 0, SIM.length - 1.001);
  const i = Math.floor(f);
  return lerp(SIM[i], SIM[i + 1], f - i);
}

// ================================================================ THE MACRO (0.00-0.62)
// Macro space = screen px at zoom 1 (the camera at the screen centre); the camera zooms about the contact face.

/** Macro draw scale (StrikeMacro is drawn at x4 in its canvas; MD 2 puts the r 23 ball at 92 px, 109 px at zoom 1.18). */
const MD = 2;
/** Where the shared laces registration (58, 86) of M1/M2/M2b/M2c lands at rest. */
const L0: P2 = [300, 150];
const mx = (cx: number) => L0[0] + (cx - 58) * MD;
const my = (cy: number) => L0[1] + (cy - 86) * MD;
/** The turf under the ball (canvas row 109) and the grass-level horizon (the lens is at ball height). */
const TURF = my(109);
const HORIZON = L0[1] - 2;
/** The ball's macro radius (studio px) and its on-screen radius at zoom 1. */
const BR = 23;
const BRS = BR * MD;
/** The contact face (the zoom anchor): M2's boot front, canvas x 59. */
const FACE0 = mx(59);
const A: P2 = [FACE0, L0[1]];
/** Ball at rest. */
const REST: P2 = [mx(81), L0[1]];
/** The flight line in the macro (slightly rising toward the goal). */
const FLIGHT = -0.08;

/** The contact glows come up only after the two impact stages (so both prints read the boot and the ball, not a blob). */
const glowK = (t: number) => (t < T.isoEnd ? 0 : ease.outQuad(clamp((t - T.isoEnd) / 0.1)));

/** The macro camera: the punch at contact, a short relax, the micro-punch on M2c, then a creep in to the release. */
const MZ: KeyRow[] = [
  [0, 1], [T.hit, 1], [T.hit + 0.05, 1.18, 'outQuad'], [0.3, 1.14, 'outQuad'],
  // A 2-frame micro-punch on M2c at 0.40, then the pressure pushing in toward the release (a visible crescendo).
  [T.deep, 1.2, 'step2'], [T.rel, 1.34, 'inQuad'], [T.swap, 1.34],
];

/** The boot: a pendulum from a knee far above (it swings in from the left at full speed), then planted on the ball. */
interface BootPose {
  key: No10Key;
  x: number;
  y: number;
  rot: number;
}
const KNEE_R = 420;
const PHI0 = -0.38;
function bootAt(t: number): BootPose {
  if (t < T.hit) {
    const u = t / T.hit;
    const phi = lerp(PHI0, 0, u);
    return { key: 'M1', x: L0[0] + KNEE_R * Math.sin(phi), y: L0[1] - KNEE_R * (1 - Math.cos(phi)), rot: -phi };
  }
  const k = keyAt(t) as No10Key;
  if (t < T.thru) {
    // The boot pushes on through the hit-stop: a 1 px shudder (it never pulls back).
    const sh = Math.sin(t * TAU * 23) > 0.3 ? 1 : 0;
    return { key: k, x: L0[0] + sh, y: L0[1], rot: 0 };
  }
  // M3 (through) placed on the shared registration, carrying on forward.
  const u = clamp((t - T.thru) / (T.swap - T.thru));
  return { key: 'M3', x: L0[0] + 46 * ease.outQuad(u), y: L0[1] - 10 * u, rot: -0.08 * u };
}

/** The contact face (macro x) of the boot drawing on the ball. */
function faceAt(t: number): number {
  if (t < T.deep) return FACE0;
  return mx(66);
}

interface BallState {
  x: number;
  y: number;
  sx: number;
  sy: number;
  dent: number;
  rot: number;
  heat: number;
  glow: number;
  show: boolean;
}
/** The squash: sx 1 -> 0.5, sy 1 -> 1.32 over 0.08-0.40 (outQuad), held to the release; the ball rides the boot face. */
function ballAt(t: number): BallState {
  if (t < T.hit) {
    // The air pushed ahead of the boot makes the ball shiver toward the goal on the last frames.
    const pre = clamp((t - 0.04) / 0.04);
    return { x: REST[0] + pre * 1.5, y: REST[1], sx: 1, sy: 1, dent: 0, rot: 0, heat: 0, glow: 0, show: true };
  }
  if (t < T.thru) {
    const k = ease.outQuad(clamp((t - T.hit) / (T.deep - T.hit)));
    const trem = t > T.hit + 0.04 ? 0.02 * Math.sin(t * TAU * 21) : 0;
    const sx = lerp(0.84, 0.62, k) + trem;
    const sy = lerp(1.08, 1.26, k) - trem;
    const dent = t < T.deep ? lerp(0.14, 0.26, k) : 0.3;
    const face = faceAt(t);
    const heat = lerp(0.2, 0.58, ease.inQuad(clamp((t - T.hit) / (T.rel - T.hit))));
    return { x: face + (1 - dent) * BRS * sx, y: REST[1] + (sy - 1) * 6, sx, sy, dent, rot: 0, heat, glow: glowK(t), show: true };
  }
  if (t < T.rel) {
    // Through: the ball springs back past round off the boot's face.
    const face = mx(86) + 46 * ease.outQuad(clamp((t - T.thru) / (T.swap - T.thru)));
    return { x: face + BRS * 1.15, y: REST[1] - 2, sx: 1.15, sy: 0.9, dent: 0, rot: FLIGHT, heat: 0.6, glow: 1, show: true };
  }
  // Gone in 2 frames: stretched 2.2x along the flight line.
  const u = (t - T.rel) / 0.04;
  const d = 40 + u * 430;
  return { x: mx(86) + BRS * 1.15 + d * Math.cos(FLIGHT), y: REST[1] - 2 + d * Math.sin(FLIGHT), sx: 2.2, sy: 0.62, dent: 0, rot: FLIGHT, heat: 0.6, glow: 1, show: u < 1 };
}

/** Distance from (x, y) along `ang` to where the ray last leaves the ball's ellipse (0 if it never crosses it). */
function exitDist(b: BallState, x: number, y: number, ang: number): number {
  const ax = BRS * b.sx, ay = BRS * b.sy;
  const c = Math.cos(ang), s = Math.sin(ang);
  let last = 0;
  for (let d = 0; d < 400; d += 1) {
    const ex = (x + c * d - b.x) / ax, ey = (y + s * d - b.y) / ay;
    if (ex * ex + ey * ey <= 1) last = d + 1;
  }
  return last;
}

// ---------------------------------------------------------------- macro scenery (pure, built at load)

interface Bokeh {
  x: number;
  y: number;
  r: number;
  c: RGB;
  a: number;
}
const BOKEH_COLS: RGB[] = [[238, 251, 255], [190, 236, 255], [120, 200, 255], [160, 180, 230]];
const BOKEH: Bokeh[] = (() => {
  const out: Bokeh[] = [];
  // Two floodlight rigs (big discs high in the frame), stand lights (small), and dew glints on the far turf.
  for (let i = 0; i < 9; i++) {
    const rig = i < 5 ? 70 : 520;
    out.push({ x: rig + (i % 5) * 26 + hash(i * 3.1) * 20 - 10, y: 18 + hash(i * 5.7) * 36, r: 15 + hash(i * 2.3) * 16, c: BOKEH_COLS[i % 2], a: 0.2 + 0.1 * hash(i * 1.9) });
  }
  for (let i = 0; i < 34; i++)
    out.push({ x: hash(i * 7.3 + 1) * 700 - 30, y: 56 + hash(i * 4.1 + 2) * 80, r: 3 + hash(i * 2.7 + 3) * 7, c: BOKEH_COLS[i % 4], a: 0.1 + 0.12 * hash(i * 6.1) });
  for (let i = 0; i < 16; i++)
    out.push({ x: hash(i * 9.1 + 4) * 680 - 20, y: HORIZON + 6 + hash(i * 3.3 + 5) * 30, r: 2 + hash(i * 5.1 + 6) * 4, c: BOKEH_COLS[(i + 1) % 3], a: 0.12 + 0.12 * hash(i * 4.4) });
  return out;
})();

// ================================================================ THE WORLD (0.62-1.50): the side view at knee height

/** World px per studio px (No.10 196 px tall; 176 px on screen at zoom 0.9). */
const D = 2;
const GY = 300;
const HZ = 247;
/** Strike-canvas point (cx, cy) in world px (the plant toe (76, 102) is world (0, GY)). */
const sx2w = (cx: number) => (cx - 76) * D;
const sy2w = (cy: number) => GY + (cy - 102) * D;

/** Measured from the studio frames in init (fallbacks = the shipped anchors). */
const W = {
  laces: [18, 282] as P2,
  hit: [30, 276] as P2,
};
/** The ball's flight in the world (unwarped: the javelin is out of frame right in about 0.15 s). */
const BALL_V = 4200;
function worldBall(t: number): P2 {
  const s = Math.max(0, t - T.rel);
  return [W.hit[0] + s * BALL_V, W.hit[1] - s * 160];
}

/** The world camera: the swap at zoom 2.40 on the boot, BLOW-BACK to 0.90, the drift west, the whip-pan east. */
const WZ: KeyRow[] = [[T.swap, 2.4], [T.blown, 0.9, 'blowBack'], [T.whip, 0.92, 'linear']];
const WSX: KeyRow[] = [[T.swap, A[0]], [T.blown, 214, 'blowBack']];
const WSY: KeyRow[] = [[T.swap, A[1]], [T.blown, 262, 'blowBack']];
function whipX(t: number): number {
  if (t < T.whip) return 0;
  const u = (t - T.whip) / 0.12;
  return u <= 1 ? 500 * ease.inCubic(u) : 500 + (t - T.whip - 0.12) * 12500;
}
/** The camera's horizontal drift: trucking back west through the settle, a lead east into the whip, the whip. */
function camDriftX(t: number): number {
  return -60 * ease.outQuad(clamp((t - T.blown) / (T.whip - T.blown))) + 40 * ease.inQuad(clamp((t - 1.28) / 0.08)) + whipX(t);
}
/** The world camera's centre x (pure: zoomAbout's cam.x plus the drift; shake lives elsewhere). */
function camCX(t: number): number {
  return W.laces[0] - (keys(WSX, t) - VW / 2) / keys(WZ, t) + camDriftX(t);
}
function placeWorldCam(env: Env, t: number) {
  const cam = env.cam;
  zoomAbout(cam, W.laces[0], W.laces[1], keys(WSX, t), keys(WSY, t), keys(WZ, t));
  cam.x += camDriftX(t);
}

/**
 * The far wall, 8 m out at the right edge: three defenders across the pitch, staged in depth (far to near, distinct
 * ground lines, staggered so the near ones overlap the far ones), dark silhouettes with an ice rim; each flinches his own
 * way and rocks back with its own amplitude as the pressure passes.
 */
const WALL5 = [
  { x: 430, s: 0.66, kit: RIVAL_KIT, tf: 0.7, rk: 0.35 },
  { x: 408, s: 0.76, kit: RIVAL_KIT_B, tf: 0.73, rk: 0.42 },
  { x: 391, s: 0.86, kit: RIVAL_KIT_C, tf: 0.76, rk: 0.5 },
] as const;
/** A wall member's world x seen from the hero's depth (ground-plane perspective about the camera centre, as the turf). */
const wallX = (t: number, d: (typeof WALL5)[number]) => {
  const cx = camCX(t);
  return cx + (d.x - cx) * d.s;
};
const DEG = Math.PI / 180;
/** Each member flinches his own way (one shields his head, one throws a forearm over his face and braces, one turtles). */
const WALL_FLINCH: readonly Pose[] = [
  POSES.flinch,
  { ...POSES.flinch, torso: -26 * DEG, head: 34 * DEG, thighN: 18 * DEG, kneeN: 30 * DEG, armN: 160 * DEG, elbowN: 40 * DEG, armF: -40 * DEG, elbowF: 30 * DEG },
  { ...POSES.flinch, torso: -6 * DEG, head: 18 * DEG, thighN: 44 * DEG, kneeN: 76 * DEG, thighF: -20 * DEG, armN: 118 * DEG, elbowN: 96 * DEG, armF: 150 * DEG, elbowF: 46 * DEG },
];
const WALL_SIL: PuppetSil = { fill: [10, 14, 36], rim: [238, 251, 255], rim2: [70, 216, 255], lx: -0.6, ly: -0.8 };
const wallK = (s: number) => Math.round(1.9 * s * 20) / 20;
function footDrop(p: Pose) {
  const j = joints(p);
  return Math.max(j.toeN[1], j.toeF[1], j.ankleN[1]) + 2;
}

/** The pressed wake from the strike to the right, unzipping 0.62-0.87 (pure). */
const WAKE: WakePt[] = (() => {
  const out: WakePt[] = [];
  for (let i = 0; i <= 26; i++) {
    const x = 26 + i * 24;
    out.push({ x, y: GY - 1 - i * 0.55, w: 26 + i * 2.2 });
  }
  return out;
})();
const wakeReveal = (t: number) => ease.outCubic(clamp((t - T.swap) / 0.25));

/** The skid: F9r's plant heel slides 10 Strike-canvas px west (outQuad) over 0.80-1.04. */
const skidDx = (t: number) => -10 * ease.outQuad(clamp((t - T.skid) / (T.step - T.skid)));

// ---------------------------------------------------------------- module state (reset in init)

const spin = new BallSpin();
let backBlades: Blade[] = [];
let midBlades: Blade[] = [];
let fgBlades: Blade[] = [];
let worldBlades: Blade[] = [];
let fired = { hit: false, rel: false, swap: false, skid: false, hop: false, wall: [false, false, false] };
let wakeSpawnX = 0;

function resetState() {
  const r = new Rng(31501);
  backBlades = makeBlades(r, -40, 680, HORIZON + 8, 150, 3, 8);
  for (const b of backBlades) b.y = lerp(HORIZON + 6, TURF - 2, r.next());
  midBlades = makeBlades(r, -40, 680, TURF, 230, 8, 22);
  for (const b of midBlades) b.y = TURF + r.range(-3, 16);
  fgBlades = makeBlades(r, -60, 700, 0, 46, 34, 80);
  for (const b of fgBlades) b.y = r.range(318, 372);
  worldBlades = makeBlades(r, -160, 640, GY, 160, 5, 12);
  for (const b of worldBlades) b.y = GY + r.range(-14, 8);
  fired = { hit: false, rel: false, swap: false, skid: false, hop: false, wall: [false, false, false] };
  wakeSpawnX = WAKE[0].x;
  // The ball's orientation is rebuilt on every entry (seek-exact): a fixed knuckle-ball pose.
  spin.m = new Float64Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  spin.rotate(0.4, 1, 0.2, 0.7);
}

function measure(env: Env) {
  W.laces = no10Point(env, 'F7', 'laces', 0, GY, D);
  W.hit = no10Point(env, 'F7', 'ballHit', 0, GY, D);
}

// ---------------------------------------------------------------- shared helpers

/** Screen position (logical px, shake and shove included) of a world point. */
function scr(env: Env, x: number, y: number): P2 {
  const [u, v] = env.cam.toUV(x, y);
  return [u * VW, v * VH];
}
/** The camera's screen-space offset (shake x zoom, shove, buffet). */
function shakeOff(env: Env): P2 {
  const [u, v] = env.cam.toUV(env.cam.x, env.cam.y);
  return [u * VW - VW / 2, v * VH - VH / 2];
}

/**
 * Focus lines round (cx, cy): `inward` = classic converging wedges (tips toward the centre); otherwise rays bursting
 * out (wide at the inner end, needle tips far out). Frame-stable via the given rng.
 */
function focus(ctx: CanvasRenderingContext2D, rng: Rng, cx: number, cy: number, n: number, r0: number, r1: number, inward: boolean, w: number, color: string, a: number, axisGap = 0) {
  if (a <= 0) return;
  ctx.globalAlpha = clamp(a);
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    let ang = rng.next() * TAU;
    if (axisGap > 0) {
      // Keep the row and the column through the contact clear (the weather map's band-count rule).
      const q = Math.PI / 2, m = ((ang % q) + q) % q;
      if (m < axisGap) ang += axisGap - m;
      else if (q - m < axisGap) ang -= axisGap - (q - m);
    }
    const ww = (0.35 + 0.65 * rng.next()) * w;
    const ri = r0 * (0.75 + 0.6 * rng.next());
    const ro = r1 * (0.7 + 0.5 * rng.next());
    const c = Math.cos(ang), s = Math.sin(ang);
    if (inward) {
      const h = ww / ro;
      ctx.moveTo(cx + c * ri, cy + s * ri);
      ctx.lineTo(cx + Math.cos(ang - h) * ro, cy + Math.sin(ang - h) * ro);
      ctx.lineTo(cx + Math.cos(ang + h) * ro, cy + Math.sin(ang + h) * ro);
    } else {
      const h = ww / ri;
      ctx.moveTo(cx + Math.cos(ang - h) * ri, cy + Math.sin(ang - h) * ri);
      ctx.lineTo(cx + c * ro, cy + s * ro);
      ctx.lineTo(cx + Math.cos(ang + h) * ri, cy + Math.sin(ang + h) * ri);
    }
    ctx.closePath();
  }
  ctx.fill();
  ctx.globalAlpha = 1;
}

/** A soft vapour puff (normal blend) with an optional navy under-halo. */
function puff(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: number, rt = 0.1) {
  if (a <= 0 || r <= 0) return;
  ctx.globalAlpha = clamp(a);
  ctx.drawImage(softSprite('vapor', rt), x - r, y - r, r * 2, r * 2);
}

/**
 * The vapour collar (screen space): a condensation ring bursting from the boot, perpendicular to the flight (a tall
 * ellipse, rx = 0.72 r); a navy halo outside, turbulent white puffs, an ice core line and a cyan rim; `fill` fills its
 * middle (it hides the swap) and opens as it expands.
 */
function vaporCollar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, t: number, a: number, fill: number) {
  if (a <= 0 || r <= 0) return;
  const ax = r * 0.72;
  ctx.globalCompositeOperation = 'source-over';
  drawGlow(ctx, glowOf(PAL.navy), x, y, r * 1.35, 0.55 * a, 0.78, 1);
  if (fill > 0) {
    // The haze inside the ring (it hides the swap): cold storm grey, never a white disc.
    for (let i = 0; i < 9; i++) {
      const th = hash(i * 3.7) * TAU, rr = r * 0.45 * hash(i * 1.3);
      const pr = r * 0.42;
      ctx.globalAlpha = clamp(0.3 * a * fill);
      ctx.drawImage(softSprite('storm', 0.12), x + Math.cos(th) * rr * 0.72 - pr, y + Math.sin(th) * rr - pr, pr * 2, pr * 2);
    }
    ctx.globalAlpha = 1;
  }
  const n = 56;
  for (let i = 0; i < n; i++) {
    const th = (i / n) * TAU + hash(i) * 0.12;
    const j = 0.9 + 0.18 * hash(i * 7.1 + Math.floor(t * 30));
    const px = x + Math.cos(th) * ax * j, py = y + Math.sin(th) * r * j;
    puff(ctx, px, py, Math.min(26, r * (0.08 + 0.06 * hash(i * 2.9))), 0.55 * a, 0.05 + 0.2 * hash(i * 5.5));
  }
  // Condensation streaks flung outward off the ring.
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineWidth = 1;
  for (let i = 0; i < 28; i++) {
    const th = hash(i * 4.9) * TAU;
    const r0 = r * (1.02 + 0.1 * hash(i * 1.1)), r1 = r0 + r * (0.12 + 0.25 * hash(i * 8.3));
    ctx.globalAlpha = 0.55 * a;
    ctx.strokeStyle = i % 3 ? ICE : CYAN;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(th) * r0 * 0.72, y + Math.sin(th) * r0);
    ctx.lineTo(x + Math.cos(th) * r1 * 0.72, y + Math.sin(th) * r1);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.55 * a;
  ctx.strokeStyle = CYAN;
  ctx.beginPath();
  ctx.ellipse(x, y, ax * 1.04, r * 1.04, 0, 0, TAU);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.8 * a;
  ctx.strokeStyle = ICE;
  ctx.beginPath();
  ctx.ellipse(x, y, ax * 0.94, r * 0.94, 0, 0, TAU);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

/**
 * The barrier torus seen from the side: a white smoke ring round the flight axis (a tall thin ellipse, rx = aspect r),
 * breaking up as `a` falls; puffs never sink below the turf (`floor`). World or screen space (the caller's transform).
 * `half` draws only the far half (cos th < 0, behind the hero) or the near half (in front of him), so it wraps his boot.
 */
function barrierRing(
  ctx: CanvasRenderingContext2D, x: number, y: number, r: number, aspect: number, t: number, a: number, floor = Infinity,
  half: 'far' | 'near' | 'all' = 'all',
) {
  if (a <= 0 || r <= 0) return;
  const n = Math.max(18, Math.round(r / 2.6));
  ctx.globalCompositeOperation = 'source-over';
  for (let i = 0; i < n; i++) {
    if (hash(i * 13.1) > a + 0.2) continue; // the ring breaks up
    const th = (i / n) * TAU + t * 0.8;
    const far = Math.cos(th) < 0;
    if ((half === 'far' && !far) || (half === 'near' && far)) continue;
    let px = x + Math.cos(th) * r * aspect, py = y + Math.sin(th) * r;
    let s = r * (0.11 + 0.07 * hash(i * 7.3)) * (1 + (1 - a) * 0.7);
    if (py > floor) {
      // The lower arc hits the turf and spreads flat along it (a skirt of vapour rolling outward).
      const under = py - floor;
      px = x + Math.sign(Math.cos(th) || 1) * (r * aspect + under * 1.6) * (0.4 + 0.6 * Math.abs(Math.cos(th)));
      py = floor - 2 - hash(i * 3.3) * 4;
      s *= 0.8;
    }
    // The crown fades first from 1.00, so the torus top never outshines the spear.
    const top = Math.sin(th) < -0.7 ? 1 - clamp((t - 1.0) / 0.2) : 1;
    if (top <= 0) continue;
    // A faint storm under-puff only (the centre stays hollow and dark), then the white puff.
    ctx.globalAlpha = clamp(a * 0.2 * top);
    ctx.drawImage(softSprite('storm', 0.95), px - s * 1.3, py - s * 1.3, s * 2.6, s * 2.6);
    ctx.globalAlpha = clamp(a * 0.75 * top);
    ctx.drawImage(softSprite('vapor', 0.05 + 0.15 * hash(i)), px - s, py - s, s * 2, s * 2);
  }
  // The cyan inner rim (so the hole reads), kept above the turf.
  ctx.save();
  if (floor < Infinity) {
    ctx.beginPath();
    ctx.rect(x - r * 4, y - r * 4, r * 8, floor - (y - r * 4));
    ctx.clip();
  }
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = clamp(0.5 * a);
  ctx.strokeStyle = CYAN;
  ctx.lineWidth = Math.max(1, r / 70);
  ctx.beginPath();
  if (half !== 'near') ctx.ellipse(x, y, r * aspect * 0.8, r * 0.8, 0, Math.PI * 0.5, Math.PI * 1.5);
  if (half !== 'far') {
    ctx.moveTo(x, y - r * 0.8);
    ctx.ellipse(x, y, r * aspect * 0.8, r * 0.8, 0, -Math.PI * 0.5, Math.PI * 0.5);
  }
  ctx.stroke();
  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

// ================================================================ macro render

function drawMacroBackground(env: Env, t: number, z: number) {
  const ctx = env.ctx;
  const [ox, oy] = shakeOff(env);
  const bz = 1 + (z - 1) * 0.35;
  env.screen();
  ctx.save();
  ctx.translate(A[0] + ox * 0.45, A[1] + oy * 0.45);
  ctx.scale(bz, bz);
  ctx.translate(-A[0], -A[1]);
  // The storm sky and the blurred stands.
  const sky = ctx.createLinearGradient(0, -60, 0, HORIZON);
  sky.addColorStop(0, '#02040f');
  sky.addColorStop(0.45, '#070d28');
  sky.addColorStop(1, '#0f1c44');
  ctx.fillStyle = sky;
  ctx.fillRect(-120, -120, VW + 240, HORIZON + 120);
  // The stands: a dark band with a soft roofline and a few soft lighter tiers.
  ctx.fillStyle = 'rgba(4,8,24,0.75)';
  ctx.fillRect(-120, 46, VW + 240, HORIZON - 46);
  for (let i = 0; i < 4; i++) {
    const y = 64 + i * 20;
    const g = ctx.createLinearGradient(0, y - 6, 0, y + 6);
    g.addColorStop(0, 'rgba(40,60,110,0)');
    g.addColorStop(0.5, `rgba(40,60,110,${0.18 - i * 0.03})`);
    g.addColorStop(1, 'rgba(40,60,110,0)');
    ctx.fillStyle = g;
    ctx.fillRect(-120, y - 6, VW + 240, 12);
  }
  // The far turf (soft, out of focus) and the near turf.
  const far = ctx.createLinearGradient(0, HORIZON, 0, TURF + 4);
  far.addColorStop(0, '#0e2a33');
  far.addColorStop(0.35, '#123a2c');
  far.addColorStop(1, '#1a4f2f');
  ctx.fillStyle = far;
  ctx.fillRect(-120, HORIZON, VW + 240, TURF + 4 - HORIZON);
  const near = ctx.createLinearGradient(0, TURF, 0, VH + 60);
  near.addColorStop(0, '#1d5a32');
  near.addColorStop(0.4, '#14422a');
  near.addColorStop(1, '#07170f');
  ctx.fillStyle = near;
  ctx.fillRect(-120, TURF, VW + 240, VH + 120 - TURF);
  // Mown stripes converging on the vanishing point (very soft at grass level).
  ctx.fillStyle = 'rgba(160,255,190,0.045)';
  ctx.beginPath();
  for (let k = -8; k <= 8; k += 2) {
    ctx.moveTo(REST[0] + k * 6, HORIZON);
    ctx.lineTo(REST[0] + k * 150, VH + 60);
    ctx.lineTo(REST[0] + (k + 1) * 150, VH + 60);
    ctx.lineTo(REST[0] + (k + 1) * 6, HORIZON);
    ctx.closePath();
  }
  ctx.fill();
  // The mist across the floodlight glare (it drifts on the sim clock: frozen by the hit-stop, blown west by the hit).
  const st = simAt(t);
  ctx.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 7; i++) {
    const y = 20 + hash(i * 3.3) * 110;
    const x = ((hash(i * 1.7) * 900 - st * (60 + 40 * hash(i))) % 900 + 900) % 900 - 130;
    ctx.globalAlpha = 0.07 + 0.05 * hash(i * 2.2);
    ctx.drawImage(softSprite('storm', 0.2), x - 160, y - 10, 320, 20);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

/** The floodlight and stand bokeh, re-lit (additive); they pulse x1.6 on the hammer and bend with the lens (post). */
function drawBokeh(env: Env, t: number, z: number) {
  const ctx = env.ctx;
  const [ox, oy] = shakeOff(env);
  const bz = 1 + (z - 1) * 0.35;
  const pulse = t < T.hit ? 1 : 1 + 0.6 * (1 - ease.outQuad(clamp((t - T.hit) / 0.45)));
  env.screen();
  ctx.save();
  ctx.translate(A[0] + ox * 0.45, A[1] + oy * 0.45);
  ctx.scale(bz, bz);
  ctx.translate(-A[0], -A[1]);
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < BOKEH.length; i++) {
    const b = BOKEH[i];
    const tw = 0.85 + 0.15 * Math.sin(simAt(t) * (2 + hash(i) * 3) + i);
    const a = b.a * pulse * tw;
    ctx.globalAlpha = clamp(a * 0.9);
    ctx.fillStyle = rgb(b.c);
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, TAU);
    ctx.fill();
    if (b.r > 5) {
      ctx.globalAlpha = clamp(a * 1.5);
      ctx.strokeStyle = rgb(b.c);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  // The floodlight glare behind the rigs.
  drawGlow(ctx, glowOf([110, 160, 240]), 130, 30, 150, 0.22 * pulse, 1.6, 0.6);
  drawGlow(ctx, glowOf([110, 160, 240]), 580, 30, 150, 0.22 * pulse, 1.6, 0.6);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}

/** Grass lean in the macro: a breath of air ahead of the boot, then flattened away from the contact by the blast front. */
function macroLean(t: number, cx: number) {
  const front = t < T.hit ? -1 : 175 * ease.outQuad(clamp((t - T.hit) / 0.42));
  return (b: Blade) => {
    const dx = b.x - cx, dy = (b.y - TURF) * 5;
    const d = Math.hypot(dx, dy);
    const sway = 0.08 * Math.sin(b.ph + simAt(t) * 7);
    if (t < T.hit) {
      const push = clamp((t - 0.03) / 0.05) * Math.exp(-Math.abs(dx - 40) / 70) * 0.6;
      return 0.1 + sway + push;
    }
    const sgn = dx >= 0 ? 1 : -1;
    if (d < front) return sgn * (1.32 - 0.06 * hash(b.ph * 10));
    return sgn * 0.75 * Math.exp(-(d - front) / 45) + sway;
  };
}

function drawMacroTurfDecals(env: Env, t: number) {
  const ctx = env.ctx;
  env.world();
  // The contact shadow under the ball.
  const b = ballAt(t);
  if (b.show && t < T.rel) {
    ctx.fillStyle = 'rgba(3,8,14,0.6)';
    ctx.beginPath();
    ctx.ellipse(b.x, TURF + 1, BRS * b.sx * 0.95, 6, 0, 0, TAU);
    ctx.fill();
  }
  if (t >= T.hit) {
    // The crop ellipse pressed into the turf (300 px across), its cyan contour cooling.
    const age = t - T.hit;
    const R = 26 + 124 * ease.outQuad(clamp(age / 0.42));
    airCrater(ctx, A[0] + 20, TURF + 3, R, 0.09, age, 3, 0.9);
    airCrater(ctx, A[0] + 20, TURF + 3, R * 0.55, 0.09, age + 0.3, 2, 0.6);
  }
  drawBlades(ctx, backBlades, macroLean(t, A[0] + 20), '#1b4d2f', 0.75);
}

/** The flattened pressure disc of shot 4 riding the laces (before contact), along the boot's front face. */
function drawLacesDisc(env: Env, t: number, bp: BootPose) {
  if (t >= T.hit) return;
  const ctx = env.ctx;
  env.world();
  const c = Math.cos(bp.rot), s = Math.sin(bp.rot);
  const fx = 3 * MD, fy = -2 * MD;
  const x = bp.x + fx * c - fy * s, y = bp.y + fx * s + fy * c;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(bp.rot);
  ctx.globalCompositeOperation = 'source-over';
  // A navy halo so the disc separates from the white boot, then the cyan glow (wider) and the ice core.
  drawGlow(ctx, glowOf(PAL.navy), 0, 0, 46, 0.75, 0.5, 1);
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.cyan), 0, 0, 40, 1.0, 0.45, 1);
  drawGlow(ctx, glowOf(PAL.ice), 0, 0, 22, 0.95, 0.25, 1);
  // The disc's cobalt rim (a stroke, normal blend), then its cyan contour rings.
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 0.95;
  ctx.strokeStyle = HEX.cobalt;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 33, 0, 0, TAU);
  ctx.stroke();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = CYAN;
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(0, 0, 4 + i * 3, 30 - i * 3, 0, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

/** The smear band of the incoming boot (a tapered ice/cyan ribbon along its arc; never a copy of the figure). */
function drawApproachSmear(env: Env, t: number) {
  if (t >= T.hit) return;
  const ctx = env.ctx;
  env.world();
  const u1 = Math.min(1, t / T.hit);
  const pts: P2[] = [];
  for (let i = 0; i <= 12; i++) {
    const u = lerp(u1 - 0.9, u1, i / 12);
    const phi = lerp(PHI0, 0, u) - 0.06;
    pts.push([L0[0] + KNEE_R * Math.sin(phi) - 4, L0[1] - KNEE_R * (1 - Math.cos(phi)) + 18]);
  }
  ctx.globalCompositeOperation = 'source-over';
  band(ctx, pts, 4, 110, NAVY, 0.35);
  ctx.globalCompositeOperation = 'lighter';
  band(ctx, pts, 2, 86, CYAN, 0.5);
  band(ctx, pts.slice(5), 1, 22, ICE, 0.7);
  ctx.globalCompositeOperation = 'source-over';
}
function band(ctx: CanvasRenderingContext2D, pts: P2[], w0: number, w1: number, color: string, a: number) {
  const n = pts.length;
  if (n < 2 || a <= 0) return;
  const L: P2[] = [], R: P2[] = [];
  for (let i = 0; i < n; i++) {
    const p = pts[Math.max(0, i - 1)], q = pts[Math.min(n - 1, i + 1)];
    let dx = q[0] - p[0], dy = q[1] - p[1];
    const l = Math.hypot(dx, dy) || 1;
    dx /= l;
    dy /= l;
    const w = lerp(w0, w1, i / (n - 1)) * 0.5;
    L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]);
    R.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
  }
  ctx.globalAlpha = clamp(a);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(L[0][0], L[0][1]);
  for (let i = 1; i < n; i++) ctx.lineTo(L[i][0], L[i][1]);
  for (let i = n - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

/**
 * The hammer frame's lit air (stage 1 only): the compressed air round the contact glows as a flat-topped cyan halo
 * BEHIND the boot and the ball, so the weather map prints the near-black boot as a navy/cobalt silhouette inside the
 * cyan ring and the white-hot ball as ice (the halo's level keeps it below the ice band, so the ball keeps its edge).
 */
function drawContactHalo(env: Env, t: number) {
  if (t < T.hit || t >= T.iso2) return;
  const ctx = env.ctx;
  env.world();
  const x = A[0] + 10, y = A[1], R = 270;
  // A navy base first (flattens the turf and the sky under it, so the rings come out round and clean), then the halo.
  const nb = ctx.createRadialGradient(x, y, 0, x, y, R * 1.2);
  nb.addColorStop(0, 'rgba(10,18,56,0.88)');
  nb.addColorStop(0.75, 'rgba(10,18,56,0.7)');
  nb.addColorStop(1, 'rgba(10,18,56,0)');
  ctx.fillStyle = nb;
  ctx.beginPath();
  ctx.ellipse(x, y, R * 1.2, R * 1.1, 0, 0, TAU);
  ctx.fill();
  const g = ctx.createRadialGradient(x, y, 0, x, y, R);
  g.addColorStop(0, 'rgba(70,216,255,0.62)');
  g.addColorStop(0.45, 'rgba(70,216,255,0.72)');
  g.addColorStop(0.75, 'rgba(70,216,255,0.5)');
  g.addColorStop(1, 'rgba(70,216,255,0)');
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y, R, R * 0.92, 0, 0, TAU);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
}

function drawMacroBall(env: Env, t: number) {
  const b = ballAt(t);
  if (!b.show) return;
  const ctx = env.ctx;
  env.world();
  // The ball's own halo (the kit's 'cobalt' glow is sized for a 24 px ball): navy pocket, a tight cyan ring glow.
  if (b.glow > 0) {
    ctx.globalCompositeOperation = 'source-over';
    drawGlow(ctx, glowOf(PAL.navy), b.x, b.y, BRS * 2.1, 0.55 * b.glow, b.sx * 0.8 + 0.2, b.sy * 0.8 + 0.2);
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.cyan), b.x, b.y, BRS * 1.45, 0.22 * b.glow, b.sx * 0.8 + 0.2, b.sy * 0.8 + 0.2);
    ctx.globalCompositeOperation = 'source-over';
  }
  const core = b.glow;
  ctx.save();
  ctx.translate(Math.round(b.x), Math.round(b.y));
  if (b.rot) ctx.rotate(b.rot);
  const sq = b.sx !== 1 || b.sy !== 1 || b.dent ? { sx: b.sx, sy: b.sy, dent: b.dent } : undefined;
  drawBall(env, spin, 0, 0, BR, MD, b.heat, 0, 'cobalt', sq, { storm: true });
  ctx.restore();
  if (core > 0) {
    // The ice core: the hottest point in the frame is inside the crushed ball.
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.ice), b.x + BRS * b.sx * 0.1, b.y, BRS * 0.8, 0.5 * core, b.sx, b.sy * 0.9);
    drawGlow(ctx, glowOf(PAL.ice), b.x + BRS * b.sx * 0.1, b.y, BRS * 0.35, 0.45 * core, b.sx, b.sy * 0.9);
    ctx.globalCompositeOperation = 'source-over';
  }
  if (t >= T.hit && t < T.iso2) {
    // The hammer frame: the ball flashes white-hot to its dented silhouette (one band on the weather map).
    const ax = BRS * b.sx, ay = BRS * b.sy, fx = b.x - (1 - b.dent) * ax;
    ctx.save();
    ctx.beginPath();
    // From a little behind the boot face (the boot covers it): no lit panel sliver between the laces and the ball.
    ctx.rect(fx - 8, b.y - ay - 4, ax * 2 + 16, ay * 2 + 8);
    ctx.clip();
    ctx.beginPath();
    ctx.ellipse(b.x, b.y, ax - 1, ay - 1, 0, 0, TAU);
    ctx.fillStyle = ICE;
    ctx.globalAlpha = 0.92;
    ctx.fill();
    ctx.restore();
    // The white-hot seam: the crushed air between the laces and the panels (the boot, drawn next, covers its back).
    const hh = ay * Math.sqrt(Math.max(0, 1 - (1 - b.dent) * (1 - b.dent)));
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = ICE;
    ctx.fillRect(Math.round(fx - 16), Math.round(b.y - hh), 20, Math.round(hh * 2));
    ctx.globalAlpha = 1;
  }
  if (t < T.hit) {
    // Dew beads on the ball (they burst off as the crown on contact).
    for (let i = 0; i < 7; i++) {
      const th = -2.6 + i * 0.62 + hash(i) * 0.3;
      const rr = BRS * (0.55 + 0.35 * hash(i * 3.3));
      const x = Math.round(b.x + Math.cos(th) * rr), y = Math.round(b.y + Math.sin(th) * rr * 0.95);
      ctx.fillStyle = 'rgba(10,18,56,0.7)';
      ctx.fillRect(x - 1, y - 1, 4, 4);
      ctx.fillStyle = '#bfe9ff';
      ctx.fillRect(x, y, 2, 2);
      ctx.fillStyle = HEX.ice;
      ctx.fillRect(x, y, 1, 1);
    }
    return;
  }
  if (t >= T.thru) return;
  // The shock travelling through the ball: 5 ice ripple arcs from the contact face across the panels.
  const ax = BRS * b.sx, ay = BRS * b.sy;
  const fx = b.x - (1 - b.dent) * ax;
  if (t >= T.iso2 && t < T.isoEnd) {
    // The negative print: the ball gets its own band (its white panels dimmed to mid grey print cobalt, its pentagons
    // print pale) inside a dark cut line (printed pale), so the crushed ball reads apart from the boot (printed navy).
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(b.x, b.y, ax - 1, ay - 1, 0, 0, TAU);
    ctx.clip();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = NAVY;
    ctx.fillRect(b.x - ax - 2, b.y - ay - 2, ax * 2 + 4, ay * 2 + 4);
    ctx.restore();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgb(118,128,150)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(b.x, b.y, ax + 2, ay + 2, 0, 0, TAU);
    ctx.stroke();
  }
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(b.x, b.y, ax - 1, ay - 1, 0, 0, TAU);
  ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  const span = 2 * ax + 8;
  for (let i = 0; i < 5; i++) {
    const p = ((t - T.hit) * 70 + i * (span / 5)) % span;
    const a = 0.75 * (1 - p / span);
    ctx.globalAlpha = a;
    ctx.strokeStyle = i % 2 ? CYAN : ICE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(fx, b.y, Math.max(1, p * 0.7), Math.max(1, p * 1.25 + 6), 0, -1.25, 1.25);
    ctx.stroke();
  }
  ctx.restore();
  // The seam: the crushed disc of air between laces and ball, glowing INSIDE the ball (clipped to it), so the laces
  // bulging into the ball's face and the dent stay readable.
  const hh = ay * Math.sqrt(Math.max(0, 1 - (1 - b.dent) * (1 - b.dent)));
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(b.x, b.y, ax, ay, 0, 0, TAU);
  ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  const pul = 0.85 + 0.15 * Math.sin(t * TAU * 9);
  const g = 0.35 + 0.65 * glowK(t);
  drawGlow(ctx, glowOf(PAL.cyan), fx, b.y, hh * 1.25, 0.22 * pul * g, 0.22, 1);
  drawGlow(ctx, glowOf(PAL.ice), fx, b.y, hh * 0.9, 0.16 * pul * g, 0.08, 1);
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = ICE;
  ctx.fillRect(Math.round(fx) + 1, Math.round(b.y - hh), 2, Math.round(hh * 2));
  ctx.restore();
  // The contact line: a navy edge along the boot side of the dent (where the laces press into the panels).
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = NAVY;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= 10; i++) {
    const yy = b.y - hh + (2 * hh * i) / 10;
    const bow = 3 * (1 - Math.pow((yy - b.y) / Math.max(1, hh), 2));
    const xx = fx - 1 + bow;
    i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

function drawMacroBoot(env: Env, t: number) {
  const bp = bootAt(t);
  const ctx = env.ctx;
  env.world();
  const o = { pivot: [58, 86] as P2, rot: bp.rot };
  const f = no10(bp.key);
  // The contact light: a cyan rim on the boot's front edge (it glows from the seam).
  // (None on the weather map: the boot prints as one clean silhouette against the ball.)
  const rim = t < T.hit ? 0.25 : t < T.iso2 ? 0 : t < T.rel ? 0.55 : 0.3;
  if (f && rim > 0) {
    ctx.globalCompositeOperation = 'lighter';
    drawNo10(env, bp.key, bp.x + 2, bp.y - 1, MD, { ...o, alpha: rim }, f.a.tinted(f.i, PAL.cyan));
    ctx.globalCompositeOperation = 'source-over';
  }
  drawNo10(env, bp.key, bp.x, bp.y, MD, o);
  // Through the hit-stop the boot is back-lit by the blast: a navy veil, so the lit ball pops (and both impact prints
  // read boot and ball as different bands).
  // Stage 1 prints the near-black boot navy/cobalt against the ice ball and the cyan/ice contact rings; stage 2 drops
  // the veil so the pale boot prints as a navy silhouette on the ice field.
  const veil = t < T.hit ? 0 : t < T.iso2 ? 1.0 : t < T.isoEnd ? 0 : t < T.thru ? 0.58 : 0.58 - 0.4 * clamp((t - T.thru) / 0.06);
  // (Stage 1 veils it to the deepest navy, so even the toe beside the contact, where the radial term is strongest,
  // stays in band 0: the boot prints as one navy silhouette against the ice ball.)
  const veilCol: RGB = t >= T.hit && t < T.iso2 ? BOOT_BLACK : PAL.navy;
  if (f && veil > 0) drawNo10(env, bp.key, bp.x, bp.y, MD, { ...o, alpha: veil }, f.a.tinted(f.i, veilCol));
}

/**
 * The vapour sheet: the air squeezed out of the seam, a thin condensation blade standing edge-on in the contact plane
 * (perpendicular to the flight), growing up and down past the ball through the hit-stop: the collar being born.
 */
function drawSeamSheet(env: Env, t: number) {
  if (t < T.isoEnd || t >= T.thru) return;
  const ctx = env.ctx;
  env.world();
  const b = ballAt(t);
  const ax = BRS * b.sx, ay = BRS * b.sy;
  const fx = b.x - (1 - b.dent) * ax + 2;
  const grow = ease.outCubic(clamp((t - T.hit) / 0.45));
  const H = ay * 1.05 + 120 * grow;
  const k = glowK(t);
  const ph = Math.floor(t * 30);
  // Navy halo, then turbulent white puffs along the blade, thicker in the middle, fraying at the tips.
  ctx.globalCompositeOperation = 'source-over';
  drawGlow(ctx, glowOf(PAL.navy), fx, b.y, H * 1.1, 0.35 * k, 0.18, 1);
  const hh = ay * Math.sqrt(Math.max(0, 1 - (1 - b.dent) * (1 - b.dent)));
  const L = H - hh;
  // The blade lives OUTSIDE the ball (an even-odd rect + ellipse clip) and stays a soft sheet (alpha <= 0.55) until the
  // M2c punch, so the crushed cobalt ball and its seams read as the subject, not as a white sliver of glare.
  const cap = t < T.deep ? 0.55 : 1;
  ctx.save();
  ctx.beginPath();
  ctx.rect(b.x - 1000, b.y - 1000, 2000, 2000);
  ctx.ellipse(b.x, b.y, ax + 1, ay + 1, 0, 0, TAU);
  ctx.clip('evenodd');
  ctx.lineWidth = 1;
  for (const side of [-1, 1]) {
    // A blade from the end of the seam outward, thick at the root, fraying to the tip, curling back over the boot. The
    // lower blade stops at the turf (it spreads into the crop ring there).
    const Ls = side > 0 ? Math.max(4, Math.min(L, TURF + 6 - (b.y + hh))) : L;
    for (let i = 0; i <= 16; i++) {
      const u = i / 16;
      const y = b.y + side * (hh + u * Ls);
      const x = fx - 10 * u * u * grow + (hash(i * 3.1 + ph + side) - 0.5) * 3 * u;
      puff(ctx, x, y, 2 + 6 * (1 - u) * (0.5 + 0.5 * grow) + hash(i * 1.7 + ph) * 2, Math.min(cap, (0.8 - 0.55 * u) * k), 0.05 + 0.3 * u);
    }
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = Math.min(cap, 0.45 * k);
    ctx.strokeStyle = CYAN;
    ctx.beginPath();
    ctx.moveTo(fx, b.y + side * hh);
    ctx.quadraticCurveTo(fx - 1, b.y + side * (hh + Ls * 0.5), fx - 8 * grow, b.y + side * (hh + Ls * 0.85));
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

/** The isobar contours tightening in on the contact through the hit-stop (the pressure building to the release). */
function drawMacroIsobars(env: Env, t: number) {
  if (t < T.isoEnd || t >= T.rel) return;
  const ctx = env.ctx;
  env.world();
  const u = (t - T.isoEnd) / (T.rel - T.isoEnd);
  const radii: number[] = [];
  for (let i = 0; i < 4; i++) radii.push(70 + i * 46 - u * 30);
  isobars(ctx, A[0] + 6, A[1], radii, { t: t * 2, alpha: 0.4 + 0.35 * u, wobble: 0.05, lobes: 5, squash: 0.92 });
}

function drawMidBlades(env: Env, t: number) {
  const ctx = env.ctx;
  env.world();
  const lean = macroLean(t, A[0] + 20);
  // Flattened blades read pale (pressed, combed); the rest stay dark.
  const flat: Blade[] = [], up: Blade[] = [];
  for (const b of midBlades) (Math.abs(lean(b)) > 1.1 ? flat : up).push(b);
  drawBlades(ctx, up, lean, '#2c7a3e', 0.95);
  drawBlades(ctx, flat, lean, HEX.pressed, 0.7);
}

/** Out-of-focus foreground blades at the bottom edge (strong parallax), dark. */
function drawMacroForeground(env: Env, t: number) {
  const ctx = env.ctx;
  const [ox, oy] = shakeOff(env);
  env.screen();
  ctx.save();
  ctx.translate(ox * 1.5, oy * 1.5);
  ctx.strokeStyle = '#06140c';
  ctx.lineCap = 'round';
  const blast = t < T.hit ? 0 : ease.outQuad(clamp((t - T.hit) / 0.3));
  for (const b of fgBlades) {
    const dx = b.x - A[0];
    const l = 0.12 * Math.sin(b.ph + simAt(t) * 5) + blast * Math.sign(dx) * 0.5 * Math.exp(-Math.abs(dx) / 260);
    ctx.lineWidth = 3 + (b.ph % 2);
    ctx.globalAlpha = 0.92;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.quadraticCurveTo(b.x + Math.sin(l) * b.h * 0.4, b.y - b.h * 0.6, b.x + Math.sin(l) * b.h, b.y - Math.cos(l) * b.h);
    ctx.stroke();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

function renderMacro(env: Env, t: number) {
  const { ctx, cam, fx } = env;
  const z = keys(MZ, t);
  zoomAbout(cam, A[0], A[1], A[0], A[1], z);

  drawMacroBackground(env, t, z);
  // (The bokeh sits out the two impact prints: only the rings round the contact may read as circles there.)
  if (t < T.hit || t >= T.isoEnd) drawBokeh(env, t, z);
  drawMacroTurfDecals(env, t);
  drawApproachSmear(env, t);
  drawContactHalo(env, t);
  drawMacroBall(env, t);
  drawMacroBoot(env, t);
  drawLacesDisc(env, t, bootAt(t));
  drawSeamSheet(env, t);
  drawMacroIsobars(env, t);
  env.world();
  env.parts.draw(ctx, 1);
  drawMidBlades(env, t);

  // The release in the macro: the vapour cone streaking off the boot after the ball.
  if (t >= T.rel) {
    const b = ballAt(t);
    env.world();
    const len = Math.max(10, b.x - mx(86) - 30);
    vaporCone(ctx, b.x - 30, b.y, FLIGHT, 64, len, t, 0.8, { ballR: 26 });
  }

  // Focus lines: inward on the hammer frame, flipping outward at 0.14 (trembling through the hit-stop).
  const [cx, cy] = scr(env, A[0] + 8, A[1]);
  env.screen();
  if (t >= T.hit && t < T.iso2) {
    // Stage 1: 120 navy wedges converge on the contact (they cut the isobar rings); stage 2 prints them ice.
    ctx.globalCompositeOperation = 'source-over';
    focus(ctx, env.frng(51), cx, cy, 80, 95, 760, true, 10, NAVY, 0.9, 0.14);
    focus(ctx, env.frng(52), cx, cy, 40, 110, 760, true, 5, '#02040f', 0.9, 0.14);
  } else if (t >= T.iso2 && t < T.rel) {
    const u = (t - T.iso2) / (T.rel - T.iso2);
    const rng = env.frng(54 + Math.floor(t * 30));
    // Through the hold the outward lines build toward the release (a crescendo, never a fade).
    const uh = clamp((t - T.isoEnd) / (T.rel - T.isoEnd));
    const a = t < T.isoEnd ? 1 : 0.35 + 0.55 * ease.inQuad(uh);
    if (t < T.isoEnd) {
      // Stage 2 (negative print): the outward rays go dark, so they print ice; they start outside the crushed ball
      // (its far edge is 90-110 px from the contact), so the ball prints whole.
      ctx.globalCompositeOperation = 'source-over';
      focus(ctx, rng, cx, cy, 120, (175 * cam.zoom) / 1.18, 760, false, 8, '#02040f', 0.9, 0.14);
    } else {
      ctx.globalCompositeOperation = 'source-over';
      focus(ctx, env.frng(56 + Math.floor(t * 30)), cx, cy, 60, 130 + 40 * u, 760, false, 9, NAVY, a * 0.5);
      ctx.globalCompositeOperation = 'lighter';
      focus(ctx, rng, cx, cy, 60, 125 + 40 * u, 700, false, 5, CYAN, a * 0.35);
      focus(ctx, env.frng(55 + Math.floor(t * 30)), cx, cy, 34, 130 + 40 * u, 640, false, 3, ICE, a * 0.55);
    }
  } else if (t >= T.rel) {
    // The release: speed lines along the flight, tearing right.
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 30; i++) {
      const y = cy - 150 + hash(i * 3.7) * 300;
      const x0 = cx + 30 + hash(i * 1.9) * 200;
      const len = 160 + 300 * hash(i * 5.3);
      ctx.globalAlpha = 0.35 + 0.3 * hash(i * 2.1);
      ctx.fillStyle = i % 3 ? ICE : CYAN;
      ctx.fillRect(Math.round(x0), Math.round(y + (x0 - cx) * FLIGHT), Math.round(len), 1 + (i % 4 === 0 ? 1 : 0));
    }
    ctx.globalAlpha = 1;
  }
  ctx.globalCompositeOperation = 'source-over';
  drawMacroForeground(env, t);

  // ---- post
  galeStorm(fx);
  const [u, v] = cam.toUV(A[0] + 10, A[1]);
  if (t >= T.hit) {
    const s = t - T.hit;
    if (s < 0.3) floodBack(fx, s);
    // (No bloom on the weather map: its halo would lift the boot's edge into the cyan band beside the ice ball.)
    fx.bloom = t < T.iso2 ? 0 : t < T.isoEnd ? 0.5 : 1.3;
    fx.bloomThresh = 0.6;
    if (t < T.iso2) galeIso(fx, 1, [u, v], { mix: 0.25, r: 0.62 });
    else if (t < T.isoEnd) {
      galeIso(fx, 2);
      // The negative print is softened (never close to a white flash): a pale ice-grey field and a deep vignette.
      fx.isoCols = [PAL.navy, PAL.cobalt, [196, 224, 246], [196, 224, 246]];
      fx.vignette = Math.max(fx.vignette, 0.65);
    }
    for (const [at, str] of [[T.hit, 0.07], [T.iso2, 0.045]] as const) {
      const p = (t - at) / 0.35;
      if (p >= 0 && p < 1) pushShock(fx, { x: u, y: v, r: 0.9 * ease.outQuad(p), s: str * (1 - p) });
    }
    fx.lens = 0.4 * (1 - ease.outQuad(clamp(s / 0.5)));
    // Through the hold the bulge swells again toward the release (the pressure building in the ball).
    if (t >= T.isoEnd && t < T.rel) fx.lens = Math.max(fx.lens, 0.08 + 0.22 * ease.inQuad(clamp((t - T.isoEnd) / (T.rel - T.isoEnd))));
    fx.lensX = u;
    fx.lensY = v;
    fx.lensR = 0.3;
    fx.ca = lerp(0.016, 0.006, clamp(s / 0.5));
    fx.radialX = u;
    fx.radialY = v;
    fx.radial = lerp(0.08, 0.02, clamp(s / 0.4));
    if (t >= T.isoEnd && t < T.rel) {
      // The hold builds: the aberration and the radial pull climb back toward the release.
      const uh = clamp((t - T.isoEnd) / (T.rel - T.isoEnd));
      fx.ca = lerp(0.006, 0.014, ease.inQuad(uh));
      fx.radial = lerp(0.02, 0.07, uh);
    }
  }
  if (t < T.hit) {
    // The incoming boot: a hard streak blur along its swing (two frames heavy), the ball's disc kept sharp.
    const [bu, bv] = cam.toUV(REST[0], REST[1]);
    const heavy = t < 2.5 * STEP;
    fx.streak = heavy ? 0.045 : 0.02;
    fx.streakDX = 0.96;
    fx.streakDY = 0.28;
    if (heavy) {
      fx.streakHoleX = bu;
      fx.streakHoleY = bv;
      fx.streakHoleR = 0.24;
    } else {
      // Frames 3-4: the hole widens over the boot's laces too, so shot 4's flattened pressure disc reads.
      const bp = bootAt(t);
      const [lu, lv] = cam.toUV(bp.x + 6, bp.y - 4);
      fx.streakHoleX = (bu + lu) / 2;
      fx.streakHoleY = (bv + lv) / 2;
      fx.streakHoleR = 0.36;
    }
  }
  if (t >= T.rel) {
    const p = (t - T.rel) / 0.35;
    pushShock(fx, { x: u, y: v, r: 0.05 + 0.85 * ease.outQuad(p), s: 0.05 * (1 - p) });
    fx.ca = 0.014;
    fx.radial = 0.06;
    fx.streak = 0.03;
    fx.streakDX = Math.cos(FLIGHT);
    fx.streakDY = Math.sin(FLIGHT);
    fx.streakHoleR = 0;
  }
}

// ================================================================ world render

/** The stadium under its own lower-parallax scale, its horizon on the world horizon (as shot 4). */
function stadiumXf(env: Env): { hy: number; zb: number; camXb: number; ox: number } {
  const cam = env.cam;
  const [, hy] = scr(env, cam.x, HZ - 2);
  const [ox] = shakeOff(env);
  const zb = 0.92 * Math.pow(cam.zoom / 1.1, 0.5);
  const camXb = 690 + cam.x * 0.12;
  return { hy, zb, camXb, ox };
}
function drawStadium(env: Env, t: number) {
  const ctx = env.ctx;
  const { hy, zb, camXb, ox } = stadiumXf(env);
  const camYb = FIELD.horizon - hy / zb + 200;
  const bt = 7 + simAt(t) * 1.6;
  // Blasted west off the contact, then pulled east by the wake from 1.00.
  const dir: 1 | -1 = t < 1.0 ? -1 : 1;
  const wind = t < 1.0 ? lerp(1.2, 0.8, clamp((t - T.swap) / 0.38)) : lerp(0.6, 1.0, clamp((t - 1.0) / 0.2));
  env.screen();
  ctx.save();
  ctx.translate(VW / 2 + ox, hy);
  ctx.scale(zb, zb);
  ctx.translate(-camXb, -FIELD.horizon);
  drawFieldBackdrop(ctx, env.art.stadium, camXb, camYb, bt, { storm: 1, wind, windDir: dir });
  ctx.restore();
}
function drawLamps(env: Env, t: number) {
  const ctx = env.ctx;
  const { hy, zb, camXb, ox } = stadiumXf(env);
  const wake = 1 + 0.45 * clamp((t - T.roar) / 0.3);
  env.screen();
  ctx.save();
  ctx.translate(VW / 2 + ox, hy);
  ctx.scale(zb, zb);
  ctx.translate(-camXb, -FIELD.horizon);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.3 * wake;
  ctx.drawImage(env.art.stadium.crowd, Math.round(camXb * 0.25 - 220), FIELD.horizon - 110);
  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'lighter';
  for (const tx of [120, 620, 1120, 1620]) {
    const fxw = tx + camXb * 0.5 - 300 + 20;
    const x = VW / 2 + ox + (fxw - camXb) * zb, y = hy + (-26 - FIELD.horizon) * zb;
    if (x < -200 || x > VW + 200 || y < -160) continue;
    const fl = 0.93 + 0.07 * Math.sin(t * 29 + tx);
    drawGlow(ctx, glowOf([70, 110, 210]), x, y - 10, 260 * zb, 0.16 * fl, 1.3, 0.55);
    drawGlow(ctx, glowOf([150, 200, 255]), x, y, 110 * zb, 0.22 * fl);
    // (The lamp core is held under the spear: it must never be the hottest point in the recoil frames.)
    drawGlow(ctx, glowOf([235, 248, 255]), x, y, 26 * zb, 0.6 * fl);
  }
  ctx.globalCompositeOperation = 'source-over';
}

const STRIPE = 290;
function drawTurf(env: Env, t: number) {
  const ctx = env.ctx;
  const cam = env.cam;
  env.world();
  const z = cam.zoom;
  const halfW = VW / (2 * z) + 80, halfH = VH / (2 * z) + 80;
  const L = cam.x - halfW, R = cam.x + halfW, B = cam.y + halfH;
  if (B <= HZ) return;
  const g = ctx.createLinearGradient(0, HZ, 0, B);
  const kG = clamp((GY - HZ) / Math.max(1, B - HZ));
  g.addColorStop(0, '#173a33');
  g.addColorStop(kG * 0.5, '#1f5a37');
  g.addColorStop(kG, '#237036');
  g.addColorStop(1, '#1a5a2b');
  ctx.fillStyle = g;
  ctx.fillRect(L, HZ - 1, R - L, B - HZ + 1);
  const cx = cam.x;
  const sB = (B - HZ) / (GY - HZ);
  ctx.fillStyle = 'rgba(190,255,200,0.07)';
  ctx.beginPath();
  const k0 = Math.floor((cx - halfW / sB - 600) / STRIPE) - 1, k1 = Math.ceil((cx + halfW / sB + 600) / STRIPE) + 1;
  for (let k = k0 - (((k0 % 2) + 2) % 2); k <= k1; k += 2) {
    ctx.moveTo(cx, HZ);
    ctx.lineTo(cx + (k * STRIPE - cx) * sB, B);
    ctx.lineTo(cx + ((k + 1) * STRIPE - cx) * sB, B);
    ctx.closePath();
  }
  ctx.fill();
  ctx.fillStyle = 'rgba(16,40,44,0.6)';
  ctx.fillRect(L, HZ - 1, R - L, 4);
  ctx.fillStyle = 'rgba(225,240,255,0.55)';
  ctx.fillRect(L, HZ + 3, R - L, 1);
  ctx.globalCompositeOperation = 'lighter';
  const sh = ctx.createLinearGradient(0, HZ + 3, 0, HZ + 30);
  sh.addColorStop(0, 'rgba(110,160,230,0.16)');
  sh.addColorStop(1, 'rgba(110,160,230,0)');
  ctx.fillStyle = sh;
  ctx.fillRect(L, HZ + 3, R - L, 27);
  const st = simAt(t);
  const n0 = Math.floor((L - 300) / 23), n1 = Math.ceil((R + 300) / 23);
  for (let k = n0; k <= n1; k++) {
    const s = 0.3 + hash(k * 1.7) * 1.8;
    const X = k * 23 + hash(k * 3.1) * 23;
    const x = cx + (X - cx) * s, y = HZ + (GY - HZ) * s;
    if (x < L || x > R || y > B) continue;
    const tw = Math.pow(Math.max(0, Math.sin(hash(k) * 40 + st * (3 + hash(k * 5) * 6))), 8);
    const sz = Math.max(1 / z, 1.1 * s);
    ctx.globalAlpha = 0.18 + 0.5 * tw;
    ctx.fillStyle = tw > 0.6 ? HEX.ice : '#8fd6ff';
    ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

function drawWorldDecals(env: Env, t: number) {
  const ctx = env.ctx;
  env.world();
  const age = t - T.swap;
  // The plant crater of shot 4, and the blast ring the hammer pressed round the strike.
  airCrater(ctx, 2, GY, 30, 0.22, 1 + age, 3, 1);
  const R = 30 + 150 * ease.outCubic(clamp(age / 0.45));
  airCrater(ctx, W.hit[0], GY + 1, R, 0.16, age, 3, 1 - 0.5 * clamp((age - 0.3) / 0.6));
  // The pressure wave racing out across the turf: a cyan front with a low wall of dust and dew riding it.
  if (age < 0.5) {
    const Rw = 60 + 520 * ease.outQuad(age / 0.5);
    const aw = 1 - age / 0.5;
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.55 * aw;
    ctx.strokeStyle = CYAN;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(W.hit[0], GY + 2, Rw, Rw * 0.11, 0, 0, TAU);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 28; i++) {
      const th = (i / 28) * TAU + hash(i) * 0.2;
      const px = W.hit[0] + Math.cos(th) * Rw, py = GY + 2 + Math.sin(th) * Rw * 0.11;
      const r = 6 + 10 * hash(i * 3.3) + age * 20;
      ctx.globalAlpha = 0.3 * aw;
      ctx.drawImage(softSprite('storm', 0.3), px - r, py - r * 1.4, r * 2, r * 1.6);
    }
    ctx.globalAlpha = 1;
  }
  // The pressed wake unzipping toward the goal.
  pressedWake(ctx, WAKE, simAt(t), { reveal: wakeReveal(t), mist: 2.5 });
  // The skid: two pressed streaks behind the plant heel.
  if (t >= T.skid) {
    const hx = sx2w(78 + skidDx(t));
    const x0 = sx2w(78) + 4;
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = HEX.pressed;
    ctx.fillRect(Math.round(hx - 2), GY - 2, Math.round(x0 - hx + 4), 5);
    ctx.fillStyle = HEX.pressedCore;
    ctx.fillRect(Math.round(hx), GY - 1, Math.round(x0 - hx), 2);
    ctx.fillRect(Math.round(hx + 3), GY + 3, Math.round(x0 - hx - 2), 1);
    ctx.globalAlpha = 1;
  }
  // Grass round him, combed away from the strike by the blast.
  const front = 40 + 260 * ease.outCubic(clamp(age / 0.4));
  drawBlades(ctx, worldBlades, (b) => {
    const dx = b.x - W.hit[0];
    const d = Math.abs(dx);
    const sgn = dx >= 0 ? 1 : -1;
    const sway = 0.1 * Math.sin(b.ph + simAt(t) * 7);
    if (d < front) return sgn * (0.9 + 0.3 * Math.exp(-d / 120)) + sway;
    return 0.15 + sway;
  }, '#2f7a3c', 0.85);
}

/** The far wall at the right edge: linked arms, then rocked back by the passing pressure, forearms up. */
function drawWall(env: Env, t: number) {
  const ctx = env.ctx;
  env.world();
  // Far to near (WALL5 is ordered by depth).
  for (let i = 0; i < WALL5.length; i++) {
    const d = WALL5[i];
    const gy = HZ + (GY - HZ) * d.s;
    const x = wallX(t, d);
    const sxp = scr(env, x, gy)[0];
    if (sxp < -160 || sxp > VW + 160) continue;
    const hitK = t - d.tf;
    const pose = hitK >= 0 ? WALL_FLINCH[i] : POSES.wideBlock;
    const name = hitK >= 0 ? 'flinch' : 'block';
    const k = wallK(d.s);
    // The rock back: a damped spring (they face west, so leaning back turns clockwise), each with its own amplitude
    // and frequency so they never move in lockstep.
    const fq = 9 + i * 1.7;
    const rot = hitK >= 0 ? d.rk * Math.exp(-hitK * 3.2) * Math.sin(Math.min(Math.PI * 0.5, hitK * 18) + Math.max(0, hitK - 0.09) * fq) : 0;
    const slide = hitK >= 0 ? 26 * d.s * ease.outCubic(clamp(hitK / 0.25)) : 0;
    const hipY = gy - footDrop(pose) * k;
    ctx.fillStyle = 'rgba(4,8,22,0.55)';
    ctx.beginPath();
    ctx.ellipse(x + slide, gy + 1, 24 * d.s, 4 * d.s, 0, 0, TAU);
    ctx.fill();
    PUPPETS.draw(ctx, `w5-${i}-${name}`, d.kit as Kit, pose, k, -1, x + slide, hipY, 1, 0.45, WALL_SIL, 1, rot);
  }
}

/** Per-row right edges of a studio frame (art px; -1 = empty row), cached. */
const edgeCache = new Map<HTMLCanvasElement, Int16Array>();
function rightEdges(a: StudioAnim, i: number): Int16Array {
  const img = a.frames[i].img;
  let e = edgeCache.get(img);
  if (!e) {
    e = new Int16Array(a.h).fill(-1);
    const px = a.frames[i].px;
    for (let y = 0; y < a.h; y++) for (let x = a.w - 1; x >= 0; x--) if (px[(y * a.w + x) * 4 + 3] > 40) { e[y] = x; break; }
    edgeCache.set(img, e);
  }
  return e;
}

/**
 * His wind aura ripped off him toward the goal like a cape: streamers torn from the front edge of his silhouette
 * (sampled per row), dragged east at 600-700 px/s and fluttering, ice and cyan over a navy halo. Lines, never a copy of
 * the figure.
 */
function ripCape(env: Env, a: StudioAnim, i: number, x: number, y: number, pivot: P2, t: number) {
  const age = t - T.swap;
  if (age < 0 || age > 0.42) return;
  const ctx = env.ctx;
  const e = rightEdges(a, i);
  const rows: number[] = [];
  for (let r = 0; r < a.h; r += 3) if (e[r] >= 0) rows.push(r);
  if (!rows.length) return;
  const ox = x - pivot[0] * D, oy = y - pivot[1] * D;
  const fade = 1 - clamp((age - 0.12) / 0.2);
  const seg = 10;
  const pts: P2[] = [];
  for (let k = 0; k < 10; k++) {
    const r = rows[Math.floor(hash(k * 7.7) * rows.length)];
    const sp = 600 + 160 * hash(k * 3.3);
    // The root stays on his silhouette edge for the first 0.08 s (the cape is being torn off him), then lets go.
    const x0 = ox + (e[r] + 1) * D + Math.max(0, age - 0.08) * sp * 0.55;
    const y0 = oy + r * D;
    const L = 16 + age * sp * (0.6 + 0.4 * hash(k * 5.9));
    pts.length = 0;
    for (let j = 0; j <= seg; j++) {
      const u = j / seg;
      pts.push([x0 + u * L, y0 + Math.sin(u * 5 + t * 24 + k) * 5 * u - u * L * 0.04]);
    }
    // A 5 px navy under-stroke, then the streamer tapering 3 -> 1 px toward its free end.
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.45 * fade;
    ctx.strokeStyle = NAVY;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    pts.forEach((p, j) => (j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = (0.6 + 0.35 * hash(k)) * fade;
    ctx.strokeStyle = k % 3 ? ICE : CYAN;
    for (let j = 0; j < seg; j++) {
      ctx.lineWidth = lerp(3, 1, j / (seg - 1));
      ctx.beginPath();
      ctx.moveTo(pts[j][0], pts[j][1]);
      ctx.lineTo(pts[j + 1][0], pts[j + 1][1]);
      ctx.stroke();
    }
  }
  ctx.lineCap = 'butt';
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

interface HeroDraw {
  key: Key5;
  x: number;
  y: number;
  pivot?: P2;
}
function heroAt(t: number): HeroDraw {
  const key = keyAt(t);
  switch (key) {
    case 'F8':
      return { key, x: sx2w(71), y: sy2w(59), pivot: [66, 64] };
    case 'F9r':
      return { key, x: sx2w(78 + skidDx(t)), y: GY };
    case 'F9s':
      return { key, x: sx2w(68), y: GY };
    case 'F9':
    case 'F10':
      return { key, x: sx2w(97 - 18), y: GY };
    default:
      return { key: 'F7', x: 0, y: GY };
  }
}
function drawHeroWorld(env: Env, t: number, half: 'back' | 'front') {
  const ctx = env.ctx;
  env.world();
  const h = heroAt(t);
  // F9s is not a library key: drawn from the Strike strip directly (fallback: F9r at its slid position).
  const strike = no10('F9r');
  const f9s = strike && h.key === 'F9s' ? findFrame(strike.a, 'F9s') : -1;
  const lib: No10Key = h.key === 'F9s' ? 'F9r' : (h.key as No10Key);
  const fr = h.key === 'F9s' && f9s >= 0 && strike ? { a: strike.a, i: f9s } : no10(lib);
  const pivot = h.pivot ?? (fr ? fr.a.anchorOf(fr.i) : undefined);
  const ripped = clamp((t - T.swap) / 0.3);
  if (half === 'back') {
    if (fr && t < T.swap + 0.32)
      windAura(env, fr.a, fr.i, h.x, h.y, D, t, { advect: 600 * (t - T.swap), half: 'back', pivot, alpha: 1 - ripped, n: 24 });
    if (fr && pivot) ripCape(env, fr.a, fr.i, h.x, h.y, pivot, t);
    return;
  }
  // Contact shadow.
  const air = h.key === 'F8' ? 1 : 0;
  ctx.fillStyle = 'rgba(4,8,22,0.55)';
  ctx.beginPath();
  ctx.ellipse(h.x - 14, GY + 1, 44 - air * 12, 5, 0, 0, TAU);
  ctx.fill();
  const draw = (img: HTMLCanvasElement | undefined, dx: number, dy: number, alpha: number) => {
    if (h.key === 'F9s' && f9s >= 0 && strike) {
      drawAnim(ctx, strike.a, img ?? null, f9s, h.x + dx, h.y + dy, D, { alpha });
    } else if (h.key === 'F9s') {
      drawNo10(env, 'F9r', sx2w(68) + dx, GY + dy, D, { alpha }, img);
    } else {
      drawNo10(env, lib, h.x + dx, h.y + dy, D, h.pivot ? { pivot: h.pivot, alpha } : { alpha }, img);
    }
  };
  // The cyan rim from the vapour ahead of him (east), then the figure.
  const rim = 0.6 - 0.15 * clamp((t - T.swap) / 0.6);
  if (fr) {
    ctx.globalCompositeOperation = 'lighter';
    draw(fr.a.tinted(fr.i, PAL.cyan), 2, -1, rim);
    ctx.globalCompositeOperation = 'source-over';
  }
  draw(undefined, 0, 0, 1);
  if (fr && t < T.swap + 0.32) windAura(env, fr.a, fr.i, h.x, h.y, D, t, { advect: 600 * (t - T.swap), half: 'front', pivot, alpha: 1 - ripped, n: 24 });
}

/** Where the javelin's cone has broken up from its tail (world x), from 1.10 on. */
const coneTail = (t: number) => W.hit[0] + 30 + 620 * ease.inQuad(clamp((t - 1.1) / 0.4));

/**
 * The vapour javelin: the frame's giant shape from the release to the cut. The cone streaks off after the true-scale
 * ball; once the ball has left frame its mouth stays pinned just past the right edge and its tail at the strike, its
 * bell swelling 46 -> 130 px, so it spans the frame along the flight line (and the whip rides along it). An additive
 * ice core line runs the whole flight line; a hot inner core keeps the cone the brightest thing in frame. From 1.10 the
 * cone breaks into puffs from its tail. Its lower half is pressed into the turf (clipped at the ground: the wake).
 */
function drawJavelin(env: Env, t: number) {
  const ctx = env.ctx;
  const cam = env.cam;
  env.world();
  const [bx, by] = worldBall(t);
  const age = t - T.rel;
  const st = simAt(t);
  const edge = cam.x + VW / (2 * cam.zoom) + 140;
  const hx = Math.min(bx, edge), hy = W.hit[1] - (hx - W.hit[0]) * (160 / BALL_V);
  const tail = Math.min(hx - 8, coneTail(t));
  const fy = (x: number) => W.hit[1] - (x - W.hit[0]) * (160 / BALL_V);
  const bell = lerp(46, 130, ease.outQuad(clamp(age / 0.7)));
  const wa = 0.9 * (1 - 0.45 * clamp((t - 1.1) / 0.26));
  ctx.save();
  ctx.beginPath();
  ctx.rect(W.hit[0] - 400, GY - 600, 4000, 600 + 4);
  ctx.clip();
  // The contrail: vapour hanging along the flight line under the cone; behind the cone's tail it is the broken cone
  // (bigger puffs, lifting and spreading in the slow motion).
  const ca = 1 - 0.35 * clamp((t - 1.36) / 0.14);
  // Near the hero the contrail stays thin (alpha capped), so the white mass tapers to a point instead of pooling.
  const heroX = heroAt(t).x;
  for (let i = 0; i < 64; i++) {
    const x = W.hit[0] + 20 + i * 20;
    if (x > hx) break;
    const broken = x < tail;
    const bAge = broken ? clamp((tail - x) / 260) : 0;
    const yy = fy(x) + Math.sin(i * 1.7 + st * 3) * (2 + age * 8) - bAge * 26 * (0.5 + hash(i * 3.1));
    const r = 6 + age * 16 * (0.6 + 0.4 * hash(i * 2.7)) + hash(i) * 4 + bAge * (16 + 14 * hash(i * 4.3));
    const pa = broken ? 0.5 * (1 - 0.5 * bAge) : 0.24;
    const px = x + st * 40 * (broken ? 1.6 : 1);
    const dh = px - heroX;
    const cap = dh < 200 ? lerp(0.16, 0.3, clamp(dh / 200)) : lerp(0.3, 1, clamp((dh - 200) / 80));
    puff(ctx, px, yy - age * 6, r, Math.min(cap, pa * ca * (0.6 + 0.4 * hash(i * 5.1))), 0.1 + 0.3 * hash(i * 1.3));
  }
  const len = hx - tail;
  if (len > 4) {
    // The outer vapour a little dimmer than the core, so the hot core reads as a spear inside it (not a fog bank).
    vaporCone(ctx, hx, hy, -0.038, bell, len, t, wa * 0.75, { ballR: hx < bx ? 8 : 14 });
    // The hot inner core: a tapered additive ice band inside the cone (the cone's brightest layer).
    const n = 14;
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = ICE;
    ctx.globalAlpha = 0.8 * wa;
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const x = lerp(hx, tail, u);
      const w = lerp(bell * 0.2, 2, Math.pow(u, 0.7)) * (1 + 0.15 * (hash(i + Math.floor(t * 30) * 7) - 0.5));
      ctx.lineTo(x, fy(x) - w);
    }
    for (let i = n; i >= 0; i--) {
      const u = i / n;
      const x = lerp(hx, tail, u);
      const w = lerp(bell * 0.2, 2, Math.pow(u, 0.7)) * (1 + 0.15 * (hash(i + 31 + Math.floor(t * 30) * 7) - 0.5));
      ctx.lineTo(x, fy(x) + w);
    }
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
  // The ice core line along the whole flight line (screen space: a crisp 2 px line from the strike past the edge).
  const [x0, y0] = scr(env, W.hit[0] + 8, fy(W.hit[0] + 8));
  const [xt, yt] = scr(env, tail, fy(tail));
  const [x1, y1] = scr(env, hx, hy);
  env.screen();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'butt';
  ctx.strokeStyle = CYAN;
  ctx.globalAlpha = 0.28 * wa;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(xt, yt);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.strokeStyle = ICE;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.5 * wa;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(xt, yt);
  ctx.stroke();
  // (The shaft stays crisp while the vapour round it breaks up.)
  const ka = Math.max(wa, 0.72);
  ctx.globalAlpha = 0.9 * ka;
  ctx.beginPath();
  ctx.moveTo(xt, yt);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  // Four Mach diamonds along the visible stretch (screen x 380-600), pulsing at 12 Hz in a wave that runs toward the
  // goal: hot points that lead the eye down the spear.
  if (x1 - xt > 8) {
    for (let i = 0; i < 4; i++) {
      const dx = 380 + (i * 220) / 3;
      if (dx < xt + 6 || dx > x1 - 6) continue;
      const dy = lerp(yt, y1, (dx - xt) / (x1 - xt));
      const pulse = 0.5 + 0.5 * Math.sin(TAU * 12 * t - i * 1.1);
      const da = ka * (0.45 + 0.55 * pulse);
      const X = Math.round(dx), Y = Math.round(dy);
      drawGlow(ctx, glowOf(PAL.ice), X, Y, 11 + 4 * pulse, 0.35 * da, 1.4, 0.8);
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = CYAN;
      ctx.globalAlpha = 0.6 * da;
      ctx.fillRect(X - 5, Y - 3, 10, 7);
      ctx.fillRect(X - 1, Y - 5, 2, 2);
      ctx.fillRect(X - 1, Y + 4, 2, 2);
      ctx.fillStyle = ICE;
      ctx.globalAlpha = da;
      ctx.fillRect(X - 3, Y - 1, 6, 3);
    }
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  // The true-scale ball at the head while it is still in frame.
  if (bx < edge) {
    env.world();
    drawBall(env, spin, Math.round(bx), Math.round(by), 6, D, 0.8, 1, 'cobalt', undefined, { storm: true });
  }
}

/**
 * The wind in the air (screen space): thin ice streaks blasted WEST off the strike (0.62-1.00), then pulled EAST after
 * the ball by its wake (from 1.00). Irregular spacing, never a pattern.
 */
function drawWindStreaks(env: Env, t: number) {
  const s = t - T.swap;
  if (s < 0 || t >= T.whip) return;
  const ctx = env.ctx;
  env.screen();
  ctx.globalCompositeOperation = 'lighter';
  const west = t < 1.0;
  const k = west ? 1 - 0.6 * clamp(s / 0.38) : 0.55 + 0.45 * clamp((t - 1.0) / 0.12) + 0.4 * ease.inQuad(clamp((t - 1.22) / 0.14));
  for (let i = 0; i < 26; i++) {
    const y = 30 + hash(i * 6.1) * 290;
    const sp = (west ? -1 : 1) * (900 + 900 * hash(i * 2.9));
    const len = 30 + 90 * hash(i * 3.7);
    const ph = hash(i * 8.3) * (VW + 300);
    const x = ((((west ? s : t - 1.0) * sp + ph) % (VW + 300)) + VW + 300) % (VW + 300) - 150;
    ctx.globalAlpha = (0.1 + 0.16 * hash(i * 4.4)) * k;
    ctx.fillStyle = i % 4 ? ICE : CYAN;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(len), 1);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

/** Dew drops hanging in the slow-motion recoil along the wake, glinting in the floodlights (world, pure). */
function drawDewGlints(env: Env, t: number) {
  const age = t - T.swap;
  if (age < 0.06) return;
  const ctx = env.ctx;
  env.world();
  const st = simAt(t) - simAt(T.swap);
  for (let i = 0; i < 16; i++) {
    const x0 = W.hit[0] + 20 + hash(i * 3.7) * 420;
    const h0 = 20 + hash(i * 5.9) * 90;
    // Thrown up by the wake, hanging, then falling as the rate comes back.
    const y = GY - h0 * Math.sin(Math.min(Math.PI, st * 2.6 + hash(i) * 0.6)) - 4;
    const x = x0 + st * 60 * hash(i * 1.3);
    const tw = Math.pow(Math.max(0, Math.sin(t * (9 + hash(i * 2.2) * 8) + i * 1.7)), 3);
    const a = (0.35 + 0.65 * tw) * (1 - clamp((t - 1.25) / 0.15));
    if (a <= 0.02) continue;
    sparkleCyan(ctx, x, y, 3 + 5 * tw, a, i * 0.4);
  }
}

/** Turf, dew and blades thrown at the lens by the blast (screen space, pure functions of t). */
function drawLensDebris(env: Env, t: number) {
  const age = t - T.swap;
  if (age < 0 || age > 0.3) return;
  const ctx = env.ctx;
  const [cx, cy] = scr(env, W.hit[0], W.hit[1] + 8);
  env.screen();
  for (let i = 0; i < 26; i++) {
    const ang = -Math.PI * (0.05 + 0.9 * hash(i * 2.3)) + (hash(i * 7.7) - 0.5) * 0.6;
    const sp = 900 + 1500 * hash(i * 5.1);
    const d = age * sp;
    const x = cx + Math.cos(ang) * d * 1.4, y = cy + Math.sin(ang) * d * 0.9 + age * age * 900;
    const s = (3 + 10 * hash(i * 3.9)) * (1 + age * 6);
    const kind = i % 3;
    const dx = Math.cos(ang), dy = Math.sin(ang);
    ctx.globalAlpha = 0.9 * (1 - age / 0.3);
    if (kind === 0) {
      // A clod: dark, with a pale grass top.
      ctx.fillStyle = '#0a1a10';
      ctx.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), Math.round(s), Math.round(s * 0.8));
      ctx.fillStyle = '#2f7a3c';
      ctx.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), Math.round(s), Math.max(1, Math.round(s * 0.25)));
    } else if (kind === 1) {
      // A blade streaking past.
      ctx.strokeStyle = '#1f5a34';
      ctx.lineWidth = Math.max(1, s * 0.25);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - dx * s * 3, y - dy * s * 3);
      ctx.stroke();
    } else {
      // A dew drop streaking past.
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = i % 2 ? ICE : '#9fe4ff';
      ctx.lineWidth = Math.max(1, s * 0.2);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - dx * s * 4, y - dy * s * 4);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    }
  }
  ctx.globalAlpha = 1;
}

function renderWorld(env: Env, t: number) {
  const { ctx, cam, fx } = env;
  placeWorldCam(env, t);

  drawStadium(env, t);
  // The crowd wakes on the roar: the stands come up a little out of the storm.
  stormDarken(ctx, 0.45 - 0.13 * ease.outQuad(clamp((t - T.roar) / 0.3)));
  drawLamps(env, t);
  drawTurf(env, t);
  drawWorldDecals(env, t);
  drawHeroWorld(env, t, 'back');

  // The barrier torus: a white smoke ring left where the ball broke away (40 -> 80 world px: about 200 px tall on screen
  // at the swap, 145 px at the settle), hanging WHOLE as a rising vortex ring (its bottom kisses the turf, then it lifts
  // 24 px), so the hollow O reads, its crown kept clear of the floodlight; its far half behind him and its near half in
  // front, so it wraps his kicking boot; dissolving from 1.08 (the crown first, from 1.00).
  const ta = t - T.rel;
  const torR = 40 + 40 * ease.outCubic(clamp(ta / 0.6));
  const torA = 1 - clamp((ta - 0.5) / 0.45);
  const torY = Math.min(W.hit[1] - 6, GY - torR - 6) - 24 * ease.outQuad(clamp(ta / 0.7));
  env.world();
  // The hollow: a faint navy fill inside the ring (it reads as a hole, not a disc).
  if (torA > 0) drawGlow(ctx, glowOf(PAL.navy), W.hit[0] + 28, torY, torR * 0.95, 0.25 * torA, 0.42, 1);
  barrierRing(ctx, W.hit[0] + 28, torY, torR, 0.42, t, torA, GY + 2, 'far');

  drawJavelin(env, t);
  drawHeroWorld(env, t, 'front');
  env.world();
  barrierRing(ctx, W.hit[0] + 28, torY, torR, 0.42, t, torA, GY + 2, 'near');
  drawDewGlints(env, t);
  env.world();
  env.parts.draw(ctx, 1);
  // The wall after the javelin and the bow-wave mist: the vapour passes behind them, so they read as solid defenders
  // rocking back against the white spear, not frosted statues.
  drawWall(env, t);

  // The vapour collar carried over the swap, expanding past the frame edges (screen space).
  const [hx, hy] = scr(env, W.hit[0] - 6, W.hit[1]);
  const cr = collarR(t);
  env.screen();
  vaporCollar(ctx, hx, hy, cr, t, collarA(t), 1 - clamp((t - T.swap) / 0.034));

  drawWindStreaks(env, t);
  drawLensDebris(env, t);

  // Ground fog at the bottom, then the whip-pan's horizontal speed lines.
  env.screen();
  const fog = ctx.createLinearGradient(0, 280, 0, VH);
  fog.addColorStop(0, 'rgba(6,11,36,0)');
  fog.addColorStop(1, 'rgba(6,11,36,0.6)');
  ctx.fillStyle = fog;
  ctx.fillRect(0, 280, VW, VH - 280);
  if (t >= T.whip) {
    const p = clamp((t - T.whip) / 0.14);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 34; i++) {
      const y = 8 + hash(i * 4.3) * 344;
      const len = (140 + 300 * hash(i * 2.2)) * (0.3 + p);
      const x = VW + 200 - ((t - T.whip) * (4800 + 2400 * hash(i * 1.6)) + hash(i * 9.4) * 700);
      ctx.globalAlpha = (0.2 + 0.35 * hash(i * 5.2)) * (0.3 + 0.7 * p);
      ctx.fillStyle = i % 3 ? ICE : CYAN;
      ctx.fillRect(Math.round(x), Math.round(y), Math.round(len), 1 + (i % 4 === 0 ? 1 : 0));
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  // ---- post
  galeStorm(fx);
  const s = t - T.swap;
  // The flood-back of the blow-back starts half-recovered (the collar frame is not a full-frame brightness spike).
  if (s < 0.2) floodBack(fx, s + 0.1);
  // (The collar is not a flash: floodBack's bloom must not bloom it across the frame.)
  if (s < 0.12) fx.bloom = Math.min(fx.bloom, 1.0);
  const [u, v] = cam.toUV(W.hit[0], W.hit[1]);
  // The release shock (born at 0.58 in the macro) rolls on, then the turf shock of the blow-back.
  const p = (t - T.rel) / 0.35;
  if (p < 1) pushShock(fx, { x: u, y: v, r: 0.05 + 0.85 * ease.outQuad(p), s: 0.05 * (1 - p) });
  const q = (t - T.swap) / 0.4;
  if (q < 1) pushShock(fx, { x: u, y: v + 0.02, r: 0.1 + 1.0 * ease.outQuad(q), s: 0.03 * (1 - q) });
  // The wall: a small ripple at each chest as the pressure passes.
  for (const d of WALL5) {
    const a = (t - d.tf) / 0.25;
    if (a >= 0 && a < 1) {
      const [wu, wv] = cam.toUV(wallX(t, d), HZ + (GY - HZ) * d.s - 60 * d.s);
      pushShock(fx, { x: wu, y: wv, r: 0.02 + 0.2 * a, s: 0.012 * (1 - a) });
    }
  }
  fx.ca = Math.max(fx.ca, 0.01 * (1 - clamp(s / 0.3)));
  fx.radialX = u;
  fx.radialY = v;
  fx.radial = 0.05 * (1 - clamp(s / 0.25));
  // The pressure bubble left at the break-away: a soft pinch that relaxes.
  if (s < 0.5) {
    fx.lens = -0.12 * (1 - ease.outQuad(s / 0.5));
    fx.lensX = u;
    fx.lensY = v;
    fx.lensR = 0.25;
  }
  if (t >= T.whip) {
    fx.streak = 0.02 + 0.08 * ease.inCubic(clamp((t - T.whip) / 0.12));
    fx.streakDX = 1;
    fx.streakDY = 0;
    fx.streakHoleR = 0;
  } else if (s < 0.2) {
    // The blow-back: a radial pull away from the boot.
    fx.radial = Math.max(fx.radial, 0.06 * (1 - s / 0.2));
  }
}

/** The vapour collar's radius / alpha (screen px), continuous over the swap. */
function collarR(t: number): number {
  if (t < T.rel) return 0;
  const u = (t - T.rel) / 0.1;
  return u <= 1 ? 30 + 200 * ease.outCubic(u) : 230 + 260 * ease.outQuad(clamp((t - T.rel - 0.1) / 0.12));
}
function collarA(t: number): number {
  if (t < T.rel) return 0;
  return 1 - clamp((t - 0.64) / 0.12);
}

// ================================================================ the shot

export const shotHammer: Shot = {
  name: META.name,
  dur: DUR,
  seed: META.seed,
  rate: RATE[5],
  muffle: MUFFLE[5],
  cues: [
    {
      at: T.hit,
      fn: (e) => {
        e.sfx.kick(1.4);
        e.sfx.boom(1.3);
        e.sfx.crack(1.0);
        e.sfx.squash(0.5);
        e.sfx.whine(0.6, 0.12);
        e.cam.shakeAmp = 22;
        e.cam.shakeRoll = 0.015;
        e.cam.hit(1.0);
        e.cam.shove(-14, 0);
      },
    },
    // The ball under pressure through the hit-stop, the micro-punch on M2c, then a whine rising into the release.
    { at: 0.12, fn: (e) => e.sfx.strain(0.44, 0.22) },
    { at: T.deep, fn: (e) => e.cam.hit(0.35) },
    { at: 0.46, fn: (e) => e.sfx.whine(0.12, 0.08) },
    {
      at: T.rel,
      fn: (e) => {
        e.sfx.sonicBoom(1.0);
        e.sfx.whoosh(0.6, 4000, 200);
        e.cam.hit(0.9);
      },
    },
    {
      at: T.swap,
      fn: (e) => {
        e.sfx.rumble(0.8, 0.5);
        e.sfx.gust(0.6, 0.3);
        e.cam.shove(-40, -10);
        e.cam.hit(0.8);
      },
    },
    { at: T.skid, fn: (e) => { e.sfx.scrape(0.3, 0.22); e.cam.hit(0.3); } },
    { at: T.roar, fn: (e) => e.sfx.roar(1.2, 0.4) },
    { at: T.hop, fn: (e) => e.sfx.scuff(0.2) },
    { at: T.whip, fn: (e) => e.sfx.whoosh(0.15, 600, 5000) },
  ],
  prepare(env) {
    warmGale();
    // Warm the wall's poses (no hitch at the swap).
    for (let i = 0; i < WALL5.length; i++) {
      const d = WALL5[i];
      const k = wallK(d.s);
      for (const [name, pose] of [['block', POSES.wideBlock], ['flinch', WALL_FLINCH[i]]] as const) {
        PUPPETS.get(`w5-${i}-${name}`, d.kit as Kit, pose, k, -1, WALL_SIL);
        PUPPETS.get(`w5-${i}-${name}`, d.kit as Kit, pose, k, -1);
      }
    }
    for (const k of ['M1', 'M2', 'M2b', 'M2c', 'M3', 'F7', 'F8', 'F9r', 'F9', 'F10'] as No10Key[]) {
      const f = no10(k);
      if (f) f.a.tinted(f.i, PAL.cyan);
    }
    void env;
  },
  init(env) {
    env.sfx.clearBus();
    env.cam.set(VW / 2, VH / 2, 1, 0);
    PUPPETS.frame();
    resetState();
    measure(env);
  },
  update(env, t, dt) {
    const { rng, parts, cam } = env;
    // The tremble builds through the hold (0.3 -> 0.6 trauma) into the release.
    if (t > T.hit && t < T.rel) holdTrauma(cam, lerp(0.3, 0.6, clamp((t - T.isoEnd) / (T.rel - T.isoEnd))));
    // The world keeps trembling under the pressure wave until the whip.
    if (t >= T.blown && t < T.whip) holdTrauma(cam, 0.18);
    // Knuckle ball: the panels barely turn.
    spin.rotate(0.2, 1, 0.1, dt * 0.25);

    if (!fired.hit && t >= T.hit) {
      fired.hit = true;
      const b = ballAt(t);
      const fx0 = b.x - (1 - b.dent) * BRS * b.sx;
      // The dew crown: 40 beads burst off the ball's crown and sides (they hang in the hit-stop).
      for (let i = 0; i < 40; i++) {
        const ang = -Math.PI / 2 + rng.range(-1.35, 1.35);
        const sp = rng.range(260, 680);
        const lift = rng.range(4, 26);
        parts.spawn({
          kind: PK.Pixel, x: b.x + Math.cos(ang) * (BRS * 0.9 + lift), y: b.y + Math.sin(ang) * (BRS * 1.1 + lift), vx: Math.cos(ang) * sp + 120, vy: Math.sin(ang) * sp,
          ay: 900, drag: 0.5, max: rng.range(1.5, 2.5), s0: rng.range(3, 5), s1: 2, ramp: 'dew', r0: 0, r1: 0.6, a0: 1, a1: 0.8, add: false,
        });
      }
      // 70 ice sparks out of the seam (away from the boot) + 30 dew beads.
      // The ball's rim seen from the seam through the whole hold (it crushes taller and steps right on M2c), sampled.
      const hold: BallState[] = [];
      for (let s = T.hit; s < T.thru; s += 0.02) hold.push(ballAt(s));
      for (let i = 0; i < 70; i++) {
        // Rays from the seam, already thrown clear of the ball on the hammer frame, crawling outward through the
        // hit-stop (none along the row or the column through the contact: the weather map's band-count rule). Each
        // ray's tail starts at the ball's rim (never across the ball), so the crushed cobalt ball reads whole.
        let ang = rng.range(-2.0, 2.0);
        const q = Math.PI / 2, m = ((ang % q) + q) % q;
        if (m < 0.16) ang += 0.16 - m;
        else if (q - m < 0.16) ang -= 0.16 - (q - m);
        const sp = rng.range(700, 1600);
        let rim = 0;
        for (const hb of hold) rim = Math.max(rim, exitDist(hb, fx0, b.y, ang));
        const tail = sp * 0.03 * 1.3;
        const out = rim + 3 + tail + (rng.range(12, 110) - 12) * 0.45;
        parts.spawn({
          kind: PK.Streak, x: fx0 + Math.cos(ang) * out, y: b.y + Math.sin(ang) * out, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, drag: 2.2,
          max: rng.range(0.35, 0.8), s0: rng.range(1.5, 2.5), s1: 1, k: 1.3, ramp: 'cobalt', r0: rng.range(0, 0.35), r1: 0.75, a0: 0.9, a1: 0,
        });
      }
      for (let i = 0; i < 30; i++) {
        const ang = rng.range(-2.4, 2.4);
        const sp = rng.range(200, 900);
        parts.spawn({
          kind: PK.Pixel, x: fx0 + 4, y: b.y + rng.range(-40, 40), vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, ay: 600, drag: 1,
          max: rng.range(0.8, 1.6), s0: rng.range(2, 3), s1: 1, ramp: 'dew', r0: 0, r1: 0.8, a0: 1, a1: 0.6, add: true,
        });
      }
      // Blades plucked off the turf round the ball.
      for (let i = 0; i < 22; i++) {
        const x = b.x + rng.range(-120, 140);
        parts.spawn({
          kind: PK.Blade, x, y: TURF + rng.range(-2, 10), vx: Math.sign(x - fx0) * rng.range(80, 360), vy: -rng.range(120, 420), ay: 700, drag: 1.2,
          rot: rng.range(0, TAU), vrot: rng.range(-16, 16), max: rng.range(0.8, 1.4), s0: rng.range(5, 9), s1: 5, ramp: 'grass', r0: 0, r1: 0.6, a0: 1, a1: 1, add: false,
        });
      }
    }
    if (!fired.rel && t >= T.rel) {
      fired.rel = true;
      const b = ballAt(T.thru + 0.01);
      for (let i = 0; i < 26; i++) {
        const ang = FLIGHT + rng.range(-0.5, 0.5);
        const sp = rng.range(900, 2000);
        parts.spawn({
          kind: PK.Streak, x: b.x, y: b.y + rng.range(-20, 20), vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, drag: 2,
          max: 0.4, s0: 2, s1: 1, k: 1.6, ramp: 'cobalt', r0: 0, r1: 0.6, a0: 1, a1: 0,
        });
      }
    }
    if (!fired.swap && t >= T.swap) {
      fired.swap = true;
      // The macro's particles live in macro space: retire them under the collar.
      for (const p of parts.list) p.life = p.max;
      // Turf crumbs, dew and blades thrown up by the blast round the strike (they hang, then fall in the slow motion).
      for (let i = 0; i < 40; i++) {
        const x = W.hit[0] + rng.range(-70, 120);
        parts.spawn({
          kind: PK.Debris, x, y: GY - rng.range(0, 6), vx: rng.range(-160, 260), vy: -rng.range(220, 620), ay: 900, drag: 0.4,
          rot: rng.range(0, TAU), vrot: rng.range(-10, 10), max: rng.range(1.0, 1.6), s0: rng.range(1.5, 3.5), s1: 2, ramp: rng.next() < 0.6 ? 'dust' : 'grass', r0: 0, r1: 0.6, a0: 1, a1: 1, add: false,
        });
      }
      for (let i = 0; i < 70; i++) {
        const x = W.hit[0] + rng.range(-60, 160);
        parts.spawn({
          kind: PK.Pixel, x, y: GY - rng.range(0, 40), vx: rng.range(-140, 420), vy: -rng.range(150, 620), ay: 800, drag: 0.6,
          max: rng.range(1.0, 1.7), s0: rng.range(2, 3.5), s1: 1.5, ramp: 'dew', r0: 0, r1: 0.7, a0: 1, a1: 0.5, add: true,
        });
      }
      for (let i = 0; i < 24; i++) {
        const x = W.hit[0] + rng.range(-40, 160);
        parts.spawn({
          kind: PK.Blade, x, y: GY - rng.range(0, 4), vx: rng.range(-100, 420), vy: -rng.range(180, 480), ay: 700, drag: 1.1,
          rot: rng.range(0, TAU), vrot: rng.range(-18, 18), max: rng.range(0.9, 1.5), s0: rng.range(4, 7), s1: 4, ramp: 'grass', r0: 0, r1: 0.6, a0: 1, a1: 1, add: false,
        });
      }
      // Vapour puffs shed by the collar, streaming east.
      for (let i = 0; i < 18; i++) {
        const ang = rng.range(-1.4, 1.4);
        parts.spawn({
          kind: PK.Mist, x: W.hit[0] + rng.range(-10, 20), y: W.hit[1] + rng.range(-40, 40), vx: 300 + Math.cos(ang) * rng.range(100, 400), vy: Math.sin(ang) * rng.range(60, 260),
          drag: 2.4, max: rng.range(0.5, 0.9), s0: rng.range(8, 14), s1: rng.range(18, 30), k: 0.25, ramp: 'vapor', r0: 0, r1: 0.9, a0: 0.55, a1: 0,
        });
      }
    }
    // The bow wave: dew and blades thrown up along the wake's unzipping front.
    if (t >= T.swap && t < T.blown + 0.02) {
      const n = WAKE.length;
      const fi = Math.min(n - 1, Math.floor((n - 1) * wakeReveal(t)));
      const front = WAKE[fi];
      while (wakeSpawnX + 18 <= front.x) {
        wakeSpawnX += 18;
        const wp = WAKE[Math.min(n - 1, Math.round((wakeSpawnX - WAKE[0].x) / 24))];
        const power = 0.75 + 0.35 * (wakeSpawnX / WAKE[n - 1].x);
        for (let i = 0; i < 4; i++) {
          const side = rng.sign();
          parts.spawn({
            kind: PK.Pixel, x: wakeSpawnX, y: wp.y + side * wp.w * 0.3, vx: rng.range(40, 240), vy: -rng.range(300, 620) * power, ay: 760, drag: 0.8,
            max: rng.range(0.8, 1.2), s0: rng.range(1.5, 2.5), s1: 1, ramp: 'dew', r0: 0, r1: 0.8, a0: 1, a1: 0.4, add: true,
          });
          parts.spawn({
            kind: PK.Blade, x: wakeSpawnX, y: wp.y, vx: rng.range(-60, 200), vy: -rng.range(160, 330) * power, ay: 650, drag: 1.4,
            rot: rng.range(0, TAU), vrot: rng.range(-14, 14), max: rng.range(0.7, 1.1), s0: rng.range(3, 5), s1: 3, ramp: 'grass', r0: rng.next(), r1: rng.next(), a0: 1, a1: 1, add: false,
          });
        }
        parts.spawn({
          kind: PK.Mist, x: wakeSpawnX, y: wp.y - 6, vx: rng.range(60, 200), vy: -rng.range(20, 60), drag: 2, max: 1.0, s0: 10, s1: 40, k: 0.4,
          ramp: 'vapor', r0: 0, r1: 1, a0: 0.55, a1: 0,
        });
      }
    }
    // The skid: dust and crumbs off the ploughing heel.
    if (t >= T.skid && t < T.step) {
      if (!fired.skid) fired.skid = true;
      const hx = sx2w(78 + skidDx(t));
      if (rng.next() < 0.7) {
        parts.spawn({
          kind: PK.Smoke, x: hx + rng.range(-4, 6), y: GY - 2, vx: rng.range(-90, -20), vy: -rng.range(20, 70), drag: 2, max: rng.range(0.5, 0.8),
          s0: rng.range(4, 7), s1: rng.range(12, 20), ramp: 'storm', r0: 0.2, r1: 0.8, a0: 0.45, a1: 0, add: false,
        });
        parts.spawn({
          kind: PK.Debris, x: hx, y: GY - 2, vx: rng.range(-160, -40), vy: -rng.range(80, 220), ay: 900, drag: 0.5, rot: rng.range(0, TAU), vrot: rng.range(-12, 12),
          max: rng.range(0.4, 0.7), s0: rng.range(1.5, 2.5), s1: 1.5, ramp: 'dust', r0: 0, r1: 0.6, a0: 1, a1: 1, add: false,
        });
      }
    }
    if (!fired.hop && t >= T.hop) {
      fired.hop = true;
      const x = sx2w(97 - 18);
      for (let i = 0; i < 8; i++)
        parts.spawn({
          kind: PK.Smoke, x: x + rng.range(-10, 10), y: GY - 2, vx: rng.range(-60, 60), vy: -rng.range(10, 40), drag: 2, max: 0.6, s0: 4, s1: 14,
          ramp: 'storm', r0: 0.3, r1: 0.9, a0: 0.35, a1: 0, add: false,
        });
    }
    // The wall: dew and blades blown off each defender as the pressure passes.
    for (let i = 0; i < WALL5.length; i++) {
      const d = WALL5[i];
      if (fired.wall[i] || t < d.tf) continue;
      fired.wall[i] = true;
      const gy = HZ + (GY - HZ) * d.s;
      const wx = wallX(d.tf, d);
      for (let j = 0; j < 10; j++)
        parts.spawn({
          kind: PK.Pixel, x: wx + rng.range(-16, 16), y: gy - rng.range(10, 130 * d.s), vx: rng.range(160, 480), vy: rng.range(-140, 40), ay: 400, drag: 1,
          max: rng.range(0.4, 0.8), s0: rng.range(1.5, 2.5), s1: 1, ramp: 'dew', r0: 0, r1: 0.8, a0: 1, a1: 0.3, add: true,
        });
      for (let j = 0; j < 4; j++)
        parts.spawn({
          kind: PK.Blade, x: wx + rng.range(-20, 20), y: gy, vx: rng.range(100, 360), vy: -rng.range(100, 260), ay: 650, drag: 1.2,
          rot: rng.range(0, TAU), vrot: rng.range(-14, 14), max: 0.8, s0: 4, s1: 3, ramp: 'grass', r0: 0, r1: 0.6, a0: 1, a1: 1, add: false,
        });
    }
  },
  render(env, t) {
    const ctx = env.ctx;
    env.screen();
    ctx.fillStyle = HEX.stormNavy;
    ctx.fillRect(0, 0, VW, VH);
    PUPPETS.frame();
    if (t < T.swap) {
      renderMacro(env, t);
      // The vapour collar bursting off the boot (it hides the swap at 0.62).
      if (t >= T.rel) {
        const [hx, hy] = scr(env, A[0] + 4, A[1]);
        env.screen();
        vaporCollar(ctx, hx, hy, collarR(t), t, collarA(t), 1);
      }
    } else {
      renderWorld(env, t);
    }
    env.screen();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  },
};
