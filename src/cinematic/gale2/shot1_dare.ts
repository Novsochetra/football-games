// GALE HAMMER v2 · shot 1 · "Thirty metres" (1.2 s, seed 311): the dare. SPEC.md §6 shot 1.
//
// Story job: the stakes. It is far, there is a wall, and the keeper thinks it is funny.
//   0.00-0.38  the keeper's bust (KeeperFront ×2, face ~120 px) smirks in front of his goal and beckons (KF1 / KF1b):
//              *come on*, each finger curl a small push of the lens. Storm-keyed (a navy shade ramping down his
//              torso, a hard cyan backlight). Storm night: cloud lid, mist bands and glare ribbons blown across the
//              floodlights, flags whipping, the howl planted under the crowd.
//   0.38-0.90  the reverse whip-truck: the camera flies 27.4 m backward down the pitch (a speed-ramped whip: a
//              ~120 m/s rush past the box lines, each painted line strobing as a hard ice stroke on the frame the lens
//              crosses it (the post streak drops for that frame) and near-lens dew tearing past; a drift at shoulder
//              height through the wall of three (backlit navy silhouettes staged in depth, the near man's shoulder
//              sweeping past the lens) as they sink into a low brace and link hands; a second surge; a slam stop). The
//              bust is flung out of frame right by its own parallax. The 30 M counter is the subject of the rush: it
//              clacks up 5 m each time the camera crosses another 5 m and, with the speed, swells (×1.9) and races up
//              into mid-frame trailing ghosts, then drops back into its slot as the camera brakes.
//   0.90       the landing: No.10 traps the rolling ball dead under his sole as the camera slams into place (a zoom
//              punch, cam.hit, cam.shove, a pressure ripple in the post) and the counter stamps 30 M: a specular ping
//              on the ball, an air crater, a pressure ring, a mist ring, a flat dew sheet and a dew crown. Then a slow
//              push onto him (zoom 0.88 -> 0.99, the frame rising toward his head).
//   0.98       the first gust (west -> east): streamlines curl through his hair, the stamped 30 M is blown off east;
//              his chest opens (F3, 0.96) and his head lifts toward the goal (F3b, 1.00), held until the wipe.
//   1.08-1.20  the wind wipe, left -> right, its front wavy with a tongue behind every streak; shot 2's first frame
//              (drawGrabVoid: the storm void and its isobar spiral round the palm) shows through behind it.
//
// Deviations from the brief (review fixes): the stadium wind is 0.6 -> 0.9 at the gust (brief 0.4 -> 0.7), because 0.4
// reads as still flags at this scale; the 30 M counter sits at (320, 326), not 318 / 302, so it clears his boots and
// the trap ring in the landing framing; the trap's dew crown is 24 drops (brief 12) and its crater R 40 (brief 24).
// Round 2: the gust is at 0.98 and F3 / F3b at 0.96 / 1.00 (brief 1.05; F3 0.98, F3b 1.10), so his answer reads before
// the wipe; the camera pushes in after the landing (0.88 -> 0.99) instead of the brief's 4 % settle out; the counter is
// blown off by the gust from 1.00 (gone by 1.13) so the pushed-in frame does not stack it on the trapped ball.
//
// The rail world: a side view at grass level, 106 world px per metre (No.10 at ×2 is 196 px, a defender puppet at k 2
// is ~186 px), the goal line at x 0 and No.10 at x -3180 (30 m). Depth is a 2.5D scale s about the vanishing point
// (cam.x, HZ): a point at depth s and height h sits at (cx + (X - cx)·s, HZ + (GY - h - HZ)·s), so the box lines,
// the goal and the wall slide past with true parallax. The stadium is the shared field backdrop under its own
// camera. Every camera value, decal and pose is a pure function of the shot clock; particles spawn only in update()
// on env.rng, one-shot bursts behind flags.

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { TAU, clamp, ease, lerp } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { FIELD, drawFieldBackdrop } from '../../art/stadium';
import { P, POSES, RIVAL_KIT, RIVAL_KIT_B, RIVAL_KIT_C, joints, mixPose, type Kit, type Pose } from '../../art/puppet';
import { drawAnim, findAnim, findFrame, type StudioAnim } from '../../art/studioAnim';
import { drawNo10, type No10Key } from '../../art/no10';
import { PIXEL_FONT, focusLines } from '../../art/fx';
import { drawBall, keys, punch, pushShock, type KeyRow, type PuppetSil } from '../kit';
import {
  HEX, MUFFLE, PAL, PUPPETS, RATE, SHOTS, counterText, drawKeeperFront, galeStorm, keeperFront, stormDarken, warmGale,
  type KeeperFrontKey,
} from './common';
import { airCrater, windWipe } from './air';
import { drawGrabVoid } from './shot2_grab';

const META = SHOTS[0];
const DUR = META.dur;

// ---------------------------------------------------------------- the rail world

/** World px per metre (a 1.8 m defender at puppet k 2 is ~186 px, No.10 at ×2 is 196 px). */
const PXM = 106;
/** Ground row of the action line (depth s = 1), and the horizon (eye height 1.2 m; it cranes down to ~0.7 m as the
 *  camera lands on No.10, a low angle that stands him against the stands and the floodlights). Set per frame. */
const GY = 300;
let HZ = 172;
const HZ_TRACK: KeyRow[] = [[0, 172], [0.78, 172], [0.9, 226, 'outCubic'], [1.2, 230, 'outQuad']];
/** The camera's distance to the action line (m): sets how strongly depth scales. */
const D0 = 14;
/** Depth scale of a point `w` metres nearer the camera than the action line. */
const sOf = (w: number) => D0 / (D0 - w);
/** World x of a point `m` metres from the goal line. */
const XM = (m: number) => -m * PXM;
/** Field z -> lateral metres from the action line (the goal is 86 field px = 7.32 m wide). */
const W_OF_Z = (z: number) => (z - 266) * (7.32 / 86);
/** No.10's planted (support) toe after the trap, and the ball under his sole. */
const X10 = XM(30);
const BALL_R = 5, BALL_D = 2;

/** Ground point of (X, depth s, height h). */
function gp(cx: number, X: number, s: number, h = 0): [number, number] {
  return [cx + (X - cx) * s, HZ + (GY - h - HZ) * s];
}

// ---------------------------------------------------------------- the camera (pure functions of t)

const T_GO = 0.38, T_LAND = 0.9;
const D_START = 1.8, D_END = 29.2;
/**
 * The whip's speed shape (unscaled): an inQuad launch, a flat-out rush past the box lines, a drift past the wall at
 * about a fifth of the speed, a second surge and a hard stop on No.10.
 */
const SPD = { a0: 0.46, a1: 0.56, b0: 0.61, b1: 0.77, c0: 0.82, w: 0.2, q: 0.7 } as const;
const sstep = (u: number) => {
  const v = clamp(u);
  return v * v * (3 - 2 * v);
};
function speedShape(t: number): number {
  const { a0, a1, b0, b1, c0, w, q } = SPD;
  if (t <= T_GO || t >= T_LAND) return 0;
  if (t < a0) return ((t - T_GO) / (a0 - T_GO)) ** 2;
  if (t < a1) return 1;
  if (t < b0) return 1 + (w - 1) * sstep((t - a1) / (b0 - a1));
  if (t < b1) return w;
  if (t < c0) return w + (q - w) * sstep((t - b1) / (c0 - b1));
  return q * (1 - (t - c0) / (T_LAND - c0)) ** 2;
}
/** The integrated track: camera distance from the goal line (m) every 1/1200 s over the whip. */
const TRACK_STEP = 1 / 1200;
const TRACK = (() => {
  const n = Math.ceil((T_LAND - T_GO) / TRACK_STEP) + 1;
  const raw = new Float64Array(n);
  for (let i = 1; i < n; i++) raw[i] = raw[i - 1] + speedShape(T_GO + (i - 0.5) * TRACK_STEP) * TRACK_STEP;
  const k = (D_END - D_START) / raw[n - 1];
  for (let i = 0; i < n; i++) raw[i] = D_START + raw[i] * k;
  return { d: raw, k };
})();
/** Camera distance from the goal line (m). */
function camD(t: number): number {
  if (t <= T_GO) return D_START;
  if (t >= T_LAND) return D_END;
  const f = (t - T_GO) / TRACK_STEP;
  const i = Math.floor(f);
  const a = TRACK.d[Math.min(i, TRACK.d.length - 1)], b = TRACK.d[Math.min(i + 1, TRACK.d.length - 1)];
  return lerp(a, b, f - i);
}
/** Camera speed (m/s). */
const camV = (t: number) => speedShape(t) * TRACK.k;
/** Peak speed (m/s), for normalising blur. */
const V_PEAK = TRACK.k;

/** The lens (the brief's zoom track): it also scales the far stands. */
const ZOOM: KeyRow[] = [
  // The beckon accents: each finger curl (KF1b at 0.14 and 0.30) is a small push of the lens.
  [0, 1.5], [0.14, 1.505], [0.17, 1.535, 'outQuad'], [0.3, 1.52], [0.33, 1.55, 'outQuad'], [T_GO, 1.53],
  // The landing slams in at 0.88, then a slow push onto him (he holds ~190 px by 1.08): the answer to the dare.
  [0.56, 1.08, 'inOutQuad'], [0.76, 0.95, 'inOutQuad'], [T_LAND, 0.88, 'outCubic'], [DUR, 0.99, 'outQuad'],
];
/** The dolly: the rail swings in to the wall's shoulders as it passes them, then back out to frame No.10. */
const DOLLY: KeyRow[] = [[0.55, 1], [0.65, 1.42, 'inOutCubic'], [0.74, 1.45, 'linear'], [0.87, 1, 'inOutCubic']];
const CAM_Y: KeyRow[] = [[0, 157], [T_GO, 157], [0.6, 168, 'inOutQuad'], [0.75, 170, 'linear'], [T_LAND, 168, 'inOutQuad'], [DUR, 152, 'inOutQuad']];
const lensZoom = (t: number) => keys(ZOOM, t);

function placeCam(env: Env, t: number) {
  const cam = env.cam;
  HZ = keys(HZ_TRACK, t);
  cam.x = XM(camD(t));
  cam.y = keys(CAM_Y, t);
  // The slam: a 7 % zoom punch as the camera lands on the trap.
  cam.zoom = lensZoom(t) * keys(DOLLY, t) * (1 + punch(t, T_LAND, 0.07, 0.02, 0.22));
  cam.rot = 0;
}

// ---------------------------------------------------------------- the cast

/** The keeper's beckon (KeeperFront, shot-local t). */
const KF_SEQ: [number, KeeperFrontKey][] = [[0, 'KF1'], [0.14, 'KF1b'], [0.22, 'KF1'], [0.3, 'KF1b'], [T_GO, 'KF1']];
/** The bust's chest anchor on screen at t = 0 (zoom 1.5, ×3 on screen) and its depth parallax (it stands near the lens). */
const BUST = { x: 330, y: 266, par: 2.2 } as const;

/**
 * The wall of three (22 m out, z 246 / 262 / 278), far to near, staged in perspective for a true lens pass (depth
 * scale s ≈ 0.88 / 1.0 / 1.4: the near man's shoulder sweeps past the lens); dx = stagger along the pitch (m).
 */
const WALL3: { kit: Kit; w: number; dx: number; id: string }[] = [
  { kit: RIVAL_KIT, w: W_OF_Z(246) - 1.2, dx: -0.8, id: 'a' },
  { kit: RIVAL_KIT_B, w: W_OF_Z(262), dx: 0, id: 'b' },
  { kit: RIVAL_KIT_C, w: W_OF_Z(278) + 3.0, dx: 0.8, id: 'c' },
];
const DEG = Math.PI / 180;
/** Shuffling across into line (a side-step, arms loose), the brace, and the lock (arms out wide, knees bent). */
const POSE_STEP: Pose = P({ torso: 6 * DEG, head: -4 * DEG, thighN: 16 * DEG, kneeN: 18 * DEG, thighF: -18 * DEG, kneeF: 12 * DEG, armN: 26 * DEG, elbowN: 34 * DEG, armF: -24 * DEG, elbowF: 30 * DEG });
/** The lock: a wide, low, linked brace (knees bent, hips sunk, both hands at belt height reaching to the neighbours). */
const POSE_LOCK: Pose = P({ torso: 14 * DEG, head: 6 * DEG, thighN: 30 * DEG, kneeN: 30 * DEG, footN: 0, thighF: -28 * DEG, kneeF: 26 * DEG, armN: 22 * DEG, elbowN: -34 * DEG, armF: -18 * DEG, elbowF: 30 * DEG });
const POSE_BRACE: Pose = mixPose(POSE_STEP, POSE_LOCK, 0.55);
const T_LOCK = 0.66;
/** Storm silhouette for the wall (navy fill, ice rim, cyan outer rim: backlit by the far floodlights). */
const WALL_SIL: PuppetSil = { fill: [10, 14, 36], rim: [238, 251, 255], rim2: [70, 216, 255], lx: 0.55, ly: -0.85 };
const wallK = (s: number) => Math.round(2 * s * 20) / 20;
/** Lowest point below the hip of a pose (puppet units), so feet sit on the turf. */
function footDrop(p: Pose) {
  const j = joints(p);
  return Math.max(j.toeN[1], j.toeF[1], j.ankleN[1]) + 2;
}

/** No.10: the braking run (F1), the sole on the ball (F2, the trap at 0.90), chest open (F3), head lifts (F3b). */
const NO10_SEQ: [number, string][] = [[0, 'F1'], [T_LAND, 'F2'], [0.96, 'F3'], [1.0, 'F3b']];
const NO10_KEY: Record<string, No10Key> = { F1: 'SetF1', F2: 'SetF3', F3: 'SetF3', F3b: 'SetF3b' };
/** His braking slide before the trap: world px still to go at time t (0 from the trap on). */
const slideLeft = (t: number) => (t >= T_LAND ? 0 : 150 * (1 - ease.outQuad(clamp((t - 0.7) / (T_LAND - 0.7)))) ** 1.4);
/** The ball's roll before the trap: world px still to go (it arrives under his sole at 0.90). */
const rollLeft = (t: number) => (t >= T_LAND ? 0 : 230 * (1 - ease.outQuad(clamp((t - 0.7) / (T_LAND - 0.7)))) ** 1.2);

// ---------------------------------------------------------------- the 30 M counter, the gust, the wipe

const CLACKS = [1200, 1320, 1440, 1560, 1680, 1800];
/** When the camera crosses distance m (m from the goal line) on the integrated track. */
const tAtD = (m: number) => {
  for (let i = 0; i < TRACK.d.length; i++) if (TRACK.d[i] >= m) return T_GO + i * TRACK_STEP;
  return T_LAND;
};
/**
 * The counter's steps follow the camera: 5, 10, 15, 20, 25 as the lens crosses each mark (racing with the rush,
 * slowing past the wall), then 30 at 0.85 just ahead of the stamp. One clack per step.
 */
const CROSS = [5, 10, 15, 20, 25].map(tAtD).concat([0.85]);
/** The readout's centre row: clear of his boots and the trap ring (his soles land on screen row ~296). */
const COUNTER_Y = 326;
const T_GUST = 0.98, T_WIPE = 1.08;

// ---------------------------------------------------------------- module state (reset in init)

const spin = new BallSpin();
let fired = { trap: false, gust: false, lock: false };
let lastRoll = 0;

// ---------------------------------------------------------------- helpers

const hash = (n: number) => {
  const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
};
let settleAnim: StudioAnim | null | undefined;
function settle(): StudioAnim | null {
  if (settleAnim === undefined) settleAnim = findAnim('Settle', 'side');
  return settleAnim;
}
/** Draw No.10's Settle frame `name` with its contact on (x, y) at `scale`; F2 is not a library key, so it is drawn from the strip. */
function drawSettle(env: Env, name: string, x: number, y: number, scale: number, img?: (a: StudioAnim, i: number) => HTMLCanvasElement, alpha = 1) {
  const a = settle();
  const i = a ? findFrame(a, name) : -1;
  if (a && i >= 0) {
    drawAnim(env.ctx, a, img ? img(a, i) : null, i, x, y, scale, { anchor: 'contact', alpha });
    return { a, i };
  }
  if (!img) drawNo10(env, NO10_KEY[name], x, y, scale, { alpha });
  return null;
}
function seqAt<T>(seq: readonly (readonly [number, T])[], t: number): T {
  let v = seq[0][1];
  for (const [at, k] of seq) if (t >= at - 1e-6) v = k;
  return v;
}

/** The stadium: the shared field backdrop under its own camera, its horizon on the rail's horizon. */
function backdropXform(env: Env) {
  const cam = env.cam;
  const zb = Math.max(0.56, 0.66 * lensZoom(curT));
  const camXb = FIELD.goalX - camD(curT) * 10 - 18;
  void cam;
  return { zb, camXb };
}
let curT = 0;
function applyBackdrop(env: Env) {
  const { zb, camXb } = backdropXform(env);
  env.world();
  env.ctx.translate(env.cam.x, HZ - 6);
  env.ctx.scale(zb / env.cam.zoom, zb / env.cam.zoom);
  env.ctx.translate(-camXb, -FIELD.horizon);
  return { zb, camXb };
}

function drawStadium(env: Env, t: number) {
  const ctx = env.ctx;
  const { zb, camXb } = applyBackdrop(env);
  const hy = VH / 2 + (HZ - 6 - env.cam.y) * env.cam.zoom;
  const camYb = FIELD.horizon + (VH / 2 - hy) / zb;
  // Wind 0.6 -> 0.9 at the gust (the brief's 0.4 -> 0.7 reads as still flags at this scale; see the header).
  const wind = t < T_GUST ? 0.6 : lerp(0.6, 0.9, ease.outQuad(clamp((t - T_GUST) / 0.12)));
  drawFieldBackdrop(ctx, env.art.stadium, camXb, camYb, t, { storm: 1, wind });
}

/** The floodlight lamps re-lit after the storm darken (the only hot light in the stands), with wind-blown glare. */
function drawLamps(env: Env, t: number) {
  const ctx = env.ctx;
  const { camXb } = applyBackdrop(env);
  // The floodlights wash the crowd back up to ~35-40 % (the storm multiplied it to ~15 %).
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.45;
  ctx.drawImage(env.art.stadium.crowd, Math.round(camXb * 0.25 - 220), FIELD.horizon - 110);
  ctx.globalAlpha = 1;
  // The underside of the cloud lid and the wet air catch the floodlight spill: a cold glow rising from the roofline,
  // so the sky reads as a lit storm ceiling, not a black void.
  const lid = ctx.createLinearGradient(0, -230, 0, FIELD.horizon - 104);
  lid.addColorStop(0, 'rgba(40,64,140,0.1)');
  lid.addColorStop(0.7, 'rgba(56,90,180,0.24)');
  lid.addColorStop(1, 'rgba(70,110,200,0.3)');
  ctx.fillStyle = lid;
  ctx.fillRect(camXb - 700, -230, 1400, FIELD.horizon - 104 + 230);
  // Scudding storm wrack just above the roofline: two dark ragged strips racing west -> east (the far one slower),
  // their undersides stepped every 24 px, so the storm reads as moving from the first frame.
  const gustS = t < T_GUST ? 0 : clamp((t - T_GUST) / 0.1);
  ctx.globalCompositeOperation = 'source-over';
  for (const [y, h, v, a] of [[-58, 22, 150, 0.55], [-30, 16, 240, 0.45]]) {
    const off = t * v * (1 + 0.8 * gustS) + y * 7;
    const k0 = Math.floor((camXb - 700 - off) / 24) - 1, k1 = Math.ceil((camXb + 700 - off) / 24) + 1;
    ctx.fillStyle = `rgba(58,70,104,${a})`;
    ctx.beginPath();
    ctx.moveTo(k0 * 24 + off, y - h * 0.15);
    for (let k = k0; k <= k1; k++) {
      // A ragged top (softer) and a deep stepped underside per 24 px cell.
      const xa = k * 24 + off;
      ctx.lineTo(xa, y - h * 0.35 * hash(k * 1.9 + y));
      ctx.lineTo(xa + 24, y - h * 0.35 * hash(k * 1.9 + y));
    }
    for (let k = k1; k >= k0; k--) {
      const xa = k * 24 + off;
      const yb = y + h * (0.6 + 0.4 * hash(k + y * 0.37));
      ctx.lineTo(xa + 24, yb);
      ctx.lineTo(xa, yb);
    }
    ctx.closePath();
    ctx.fill();
  }
  // The stands under the floodlights' spill (a cool lift; the storm multiply left them at ~15 %).
  ctx.fillStyle = 'rgba(70,96,150,0.12)';
  ctx.fillRect(camXb - 700, FIELD.horizon - 110, 1400, 110);
  const gust = t < T_GUST ? 0 : clamp((t - T_GUST) / 0.1);
  // Storm mist bands blown west -> east across the sky and the stands (normal blend), faster after the gust.
  ctx.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 8; i++) {
    const y = -60 + hash(i * 2.7) * 150, w = 260 + hash(i) * 320, h = 14 + hash(i * 9) * 30;
    const run = hash(i * 5.1) * 1120 + t * (420 + 220 * hash(i)) * (1 + 1.5 * gust) - camXb * 0.4;
    const x = camXb - 560 + (((run % 1120) + 1120) % 1120) - w / 2;
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, 'rgba(120,136,170,0)');
    g.addColorStop(0.5, 'rgba(160,180,220,0.32)');
    g.addColorStop(1, 'rgba(120,136,170,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
  }
  ctx.globalCompositeOperation = 'lighter';
  for (const tx of [120, 620, 1120, 1620]) {
    const x = tx + camXb * 0.5 - 300 + 20;
    if (x < camXb - 520 || x > camXb + 520) continue;
    const fl = 0.92 + 0.08 * Math.sin(t * 31 + tx);
    // The cloud lid catches the glare from below.
    drawGlow(ctx, glowOf([70, 110, 210]), x, -40, 300, 0.26 * fl, 1.3, 0.55);
    drawGlow(ctx, glowOf([120, 170, 255]), x, -26, 150, 0.26 * fl);
    drawGlow(ctx, glowOf([214, 240, 255]), x, -26, 80, 0.6 * fl);
    drawGlow(ctx, glowOf([255, 255, 255]), x, -26, 42, 1 * fl);
    // Anamorphic glare bar, ice: a hard horizontal streak through each lamp.
    drawGlow(ctx, glowOf([180, 225, 255]), x, -26, 9, 0.75 * fl, 18, 0.55);
    // Its reflection on the wet turf: a tall cold sheen straight below the lamp, from the far touchline toward us.
    drawGlow(ctx, glowOf([150, 200, 255]), x, FIELD.horizon + 70, 80, 0.22 * fl, 0.32, 1.1);
    drawGlow(ctx, glowOf([226, 246, 255]), x, FIELD.horizon + 34, 40, 0.42 * fl, 0.14, 1.2);
    // Wind-blown mist ribbons crossing the glare (west -> east, faster after the gust).
    for (let i = 0; i < 5; i++) {
      const ph = hash(tx * 0.01 + i * 7.3);
      const len = 50 + ph * 90;
      const span = 260;
      const mx = x - span / 2 + ((((ph * 997 + t * (90 + 70 * ph + 260 * gust)) % span) + span) % span) - len / 2;
      const my = -26 + (hash(i * 3.1 + tx) - 0.5) * 50;
      const near = clamp(1 - Math.abs(mx + len / 2 - x) / (span / 2));
      ctx.globalAlpha = 0.55 * near * fl;
      ctx.fillStyle = HEX.ice;
      ctx.fillRect(Math.round(mx), Math.round(my), Math.round(len), 4);
    }
    ctx.globalAlpha = 1;
  }
  ctx.globalCompositeOperation = 'source-over';
}

// ---------------------------------------------------------------- the turf

const STRIPE = 5.5 * PXM;
function drawTurf(env: Env, t: number) {
  const ctx = env.ctx;
  const cam = env.cam;
  env.world();
  const z = cam.zoom;
  const halfW = VW / (2 * z) + 80, halfH = VH / (2 * z) + 80;
  const L = cam.x - halfW, R = cam.x + halfW, B = cam.y + halfH;
  const cx = cam.x;
  const g = ctx.createLinearGradient(0, HZ, 0, B);
  const kG = clamp((GY - HZ) / Math.max(1, B - HZ));
  g.addColorStop(0, '#2c5a4c');
  g.addColorStop(kG * 0.4, '#2b7341');
  g.addColorStop(kG, '#2a8139');
  g.addColorStop(1, '#1f6a30');
  ctx.fillStyle = g;
  ctx.fillRect(L, HZ - 1, R - L, B - HZ + 1);
  // Mowing stripes, 5.5 m bands across the pitch, converging on the vanishing point.
  const sB = (B - HZ) / (GY - HZ);
  ctx.fillStyle = 'rgba(190,255,200,0.075)';
  ctx.beginPath();
  const k0 = Math.floor((cx - (halfW + 600) / sB) / STRIPE) - 1, k1 = Math.ceil((cx + (halfW + 600) / sB) / STRIPE) + 1;
  for (let k = k0 - (((k0 % 2) + 2) % 2); k <= k1; k += 2) {
    ctx.moveTo(cx, HZ);
    ctx.lineTo(cx + (k * STRIPE - cx) * sB, B);
    ctx.lineTo(cx + ((k + 1) * STRIPE - cx) * sB, B);
    ctx.closePath();
  }
  ctx.fill();
  // The far touchline and the apron beyond it.
  const sFar = sOf(-34);
  const [, yFar] = gp(cx, 0, sFar);
  ctx.fillStyle = 'rgba(16,40,44,0.55)';
  ctx.fillRect(L, HZ - 1, R - L, yFar - HZ + 1);
  ctx.fillStyle = 'rgba(235,245,255,0.6)';
  ctx.fillRect(L, yFar, R - L, 1.6);
  drawPitchLines(env, cx, B);
  // Floodlight sheen on the wet turf just under the horizon.
  ctx.globalCompositeOperation = 'lighter';
  const sh = ctx.createLinearGradient(0, yFar, 0, yFar + (GY - HZ) * 0.5);
  sh.addColorStop(0, 'rgba(120,170,230,0.18)');
  sh.addColorStop(1, 'rgba(120,170,230,0)');
  ctx.fillStyle = sh;
  ctx.fillRect(L, yFar, R - L, (GY - HZ) * 0.5);
  ctx.globalCompositeOperation = 'source-over';
  // Dew on the turf: frame-stable twinkles placed on the ground plane, smeared by the camera's speed.
  ctx.globalCompositeOperation = 'lighter';
  const sp = clamp(camV(t) / V_PEAK);
  const n0 = Math.floor((L - 900) / 41), n1 = Math.ceil((R + 900) / 41);
  for (let k = n0; k <= n1; k++) {
    const s = 0.35 + hash(k * 1.7) * 1.5;
    const X = k * 41 + hash(k * 3.1) * 41;
    const [x, y] = gp(cx, X, s);
    if (x < L || x > R || y > B) continue;
    const tw = Math.pow(Math.max(0, Math.sin(hash(k) * 40 + t * (3 + hash(k * 5) * 6))), 8);
    const sz = Math.max(1 / z, 1.3 * s);
    ctx.globalAlpha = 0.25 + 0.55 * tw;
    ctx.fillStyle = tw > 0.6 ? HEX.ice : '#8fd6ff';
    ctx.fillRect(x - sz / 2 - sp * s * 22, y - sz / 2, sz + sp * s * 44, sz);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

/**
 * The near-lens layer: frame-stable wind-blown dew drops hanging in the air between the lens and the action line
 * (depth s 2.6-4, one every ~1.6 m of pitch) and dark turf tufts along the bottom edge. At speed they cross the frame
 * in one or two frames as long ice dashes and black blurs: the foreground that sells the rush.
 */
function drawNearLens(env: Env) {
  const sp = clamp(camV(curT) / V_PEAK);
  if (sp < 0.03) return;
  env.world();
  const ctx = env.ctx;
  const cam = env.cam;
  const cx = cam.x, z = cam.zoom;
  const halfW = VW / (2 * z), top = cam.y - VH / (2 * z), bot = cam.y + VH / (2 * z);
  const a = Math.min(1, sp * 2.2);
  for (let k = 0; k < 22; k++) {
    const s = 2.6 + hash(k * 2.3) * 1.4;
    const X = -(k * 170 + hash(k) * 170);
    const x = cx + (X - cx) * s;
    const len = 6 + sp * s * 60;
    if (x + len < cx - halfW - 20 || x - len > cx + halfW + 20) continue;
    if (k % 3 === 2) {
      // A turf tuft at the bottom edge: a dark smeared clump with ice-lit blade tips.
      const y = bot - 4 - hash(k * 7.7) * 10;
      const h = (10 + hash(k * 4.4) * 12) / z;
      ctx.globalAlpha = 0.9 * a;
      ctx.fillStyle = '#04120c';
      ctx.fillRect(x - len, y - h * 0.4, len * 2, h * 1.4);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.5 * a;
      ctx.fillStyle = HEX.ice;
      ctx.fillRect(x - len * 0.8, y - h * 0.5, len * 1.6, Math.max(1, 2 / z));
      ctx.globalCompositeOperation = 'source-over';
    } else {
      // An airborne dew drop: a 2-4 px ice dash with a cyan tail.
      const y = lerp(top + 30, bot - 40, hash(k * 5.3));
      const hgt = (2 + Math.floor(hash(k * 9.1) * 3)) / z;
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.45 * a;
      ctx.fillStyle = HEX.cyan;
      ctx.fillRect(x - len * 1.4, y - hgt, len * 2.8, hgt * 2);
      ctx.globalAlpha = 0.9 * a;
      ctx.fillStyle = HEX.ice;
      ctx.fillRect(x - len, y - hgt / 2, len * 2, hgt);
      ctx.globalCompositeOperation = 'source-over';
    }
  }
  ctx.globalAlpha = 1;
}

/** A painted line across the pitch at X between depths s0 and s1 (width in metres). */
function lineAcross(ctx: CanvasRenderingContext2D, cx: number, X: number, s0: number, s1: number, wM = 0.12) {
  const hw = (wM * PXM) / 2;
  const [a0] = gp(cx, X - hw, s0), [b0] = gp(cx, X + hw, s0), [a1] = gp(cx, X - hw, s1), [b1] = gp(cx, X + hw, s1);
  const y0 = HZ + (GY - HZ) * s0, y1 = HZ + (GY - HZ) * s1;
  ctx.beginPath();
  ctx.moveTo(a0, y0);
  ctx.lineTo(b0, y0);
  ctx.lineTo(b1, y1);
  ctx.lineTo(a1, y1);
  ctx.closePath();
  ctx.fill();
}
/** A painted line along the pitch at depth s between X0 and X1. */
function lineAlong(ctx: CanvasRenderingContext2D, cx: number, s: number, X0: number, X1: number) {
  const [x0, y] = gp(cx, X0, s), [x1] = gp(cx, X1, s);
  const h = Math.max(0.8, 1.15 * s * s);
  ctx.fillRect(Math.min(x0, x1), y - h / 2, Math.abs(x1 - x0), h);
}
/** The painted landmarks the whip strobes across (m from the goal line): six-yard line, spot, box line, the D's apex. */
const LANDMARKS = [5.5, 11, 16.5, 20.15];
/** How squarely the lens sits over a landmark right now (1 = on it). */
const landmarkK = (d: number) => Math.max(...LANDMARKS.map((m) => Math.exp(-(((d - m) / 1.9) ** 2))));
function drawPitchLines(env: Env, cx: number, B: number) {
  const ctx = env.ctx;
  const sFar = sOf(-34), sBot = (B - HZ) / (GY - HZ);
  const gw = W_OF_Z(257);
  ctx.fillStyle = 'rgba(236,246,255,0.82)';
  // The goal line, the six-yard line, the penalty-area line.
  lineAcross(ctx, cx, 0, sFar, sBot);
  lineAcross(ctx, cx, XM(5.5), sOf(gw - 9.16), Math.min(sBot, sOf(gw + 9.16)));
  lineAcross(ctx, cx, XM(16.5), sOf(gw - 20.16), sBot);
  // Their far sides (the near sides run under the lens).
  lineAlong(ctx, cx, sOf(gw - 9.16), XM(5.5), 0);
  lineAlong(ctx, cx, sOf(gw - 20.16), XM(16.5), 0);
  // The penalty spot and the D.
  const sp = sOf(gw);
  const [px, py] = gp(cx, XM(11), sp);
  ctx.beginPath();
  ctx.ellipse(px, py, 8 * sp, 2.4 * sp, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(236,246,255,0.82)';
  ctx.beginPath();
  let first = true;
  for (let a = -53; a <= 53; a += 2) {
    const r = a * DEG;
    const X = XM(11 + 9.15 * Math.cos(r)), w = gw + 9.15 * Math.sin(r);
    const s = sOf(w);
    if (s > sBot + 0.3 || s <= 0) continue;
    const [x, y] = gp(cx, X, s);
    ctx.lineWidth = Math.max(1, 1.4 * s * s);
    if (first) {
      ctx.moveTo(x, y);
      first = false;
    } else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.lineWidth = 1;
}

/**
 * Landmarks strobe as the lens crosses them: each painted line catches the floodlights and becomes a hard ice stroke
 * with a wide cold halo, so the six-yard line, the spot, the box line and the D each register on the rush. Drawn after
 * the storm darken (additive, so it stays the hottest thing on the turf), and on the frame the lens is over one
 * (landmarkK > 0.7) render() drops the post streak and radial, so it prints crisp.
 */
function drawLandmarkFlares(env: Env) {
  const d = camD(curT);
  if (landmarkK(d) < 0.05) return;
  const ctx = env.ctx;
  const cam = env.cam;
  env.world();
  const cx = cam.x;
  const B = cam.y + VH / (2 * cam.zoom) + 80;
  const sBot = (B - HZ) / (GY - HZ);
  const gw = W_OF_Z(257);
  const sp = sOf(gw);
  const [px, py] = gp(cx, XM(11), sp);
  ctx.globalCompositeOperation = 'lighter';
  for (const m of LANDMARKS) {
    const k = Math.exp(-(((d - m) / 1.9) ** 2));
    if (k < 0.05) continue;
    ctx.fillStyle = `rgba(238,251,255,${k})`;
    ctx.strokeStyle = `rgba(238,251,255,${k})`;
    const bar = (s0: number, s1: number) => {
      // A hard ice core stroke and a wide cold halo along the painted line.
      lineAcross(ctx, cx, XM(m), s0, s1, 0.05);
      ctx.fillStyle = `rgba(70,216,255,${0.22 * k})`;
      lineAcross(ctx, cx, XM(m), s0, s1, 2.2);
    };
    if (m === 5.5) bar(sOf(gw - 9.16), Math.min(sBot, sOf(gw + 9.16)));
    else if (m === 16.5) bar(sOf(gw - 20.16), sBot);
    else if (m === 11) {
      // The spot: a hard ice disc with a cold glow round it.
      ctx.beginPath();
      ctx.ellipse(px, py, 12 * sp, 3.6 * sp, 0, 0, TAU);
      ctx.fill();
      drawGlow(ctx, glowOf(PAL.ice), px, py, 40 * sp, 0.6 * k, 2, 0.45);
      drawGlow(ctx, glowOf(PAL.cyan), px, py, 110 * sp, 0.3 * k, 2.4, 0.35);
    } else {
      // The D's apex (20.15 m): its arc re-stroked as a hard ice line.
      ctx.beginPath();
      let f2 = true;
      for (let a = -53; a <= 53; a += 2) {
        const r = a * DEG;
        const X = XM(11 + 9.15 * Math.cos(r)), w = gw + 9.15 * Math.sin(r);
        const s = sOf(w);
        if (s > sBot + 0.3 || s <= 0) continue;
        const [x, y] = gp(cx, X, s);
        ctx.lineWidth = Math.max(2, 2.4 * s * s);
        if (f2) {
          ctx.moveTo(x, y);
          f2 = false;
        } else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.lineWidth = 1;
}

// ---------------------------------------------------------------- the goal (behind the keeper's bust)

const GOAL_W = W_OF_Z(257);
const S_FAR = sOf(GOAL_W - 3.66), S_NEAR = sOf(GOAL_W + 3.66);
const BAR_H = 2.44 * PXM, ROOF = 1.0 * PXM, BACK = 2.0 * PXM, POST_W = 0.13 * PXM;
function goalVisible(env: Env) {
  return camD(curT) < 7;
}
function drawGoalBack(env: Env, t: number) {
  if (!goalVisible(env)) return;
  const ctx = env.ctx;
  const cx = env.cam.x;
  env.world();
  const P3 = (X: number, s: number, h: number) => gp(cx, X, s, h);
  ctx.lineWidth = 1;
  // Back net and roof (between the far and near sides), then the far side netting.
  const mesh = (pts: (u: number, v: number) => [number, number], nu: number, nv: number, a: number) => {
    ctx.strokeStyle = `rgba(214,232,255,${a})`;
    ctx.beginPath();
    for (let i = 0; i <= nu; i++) {
      for (let j = 0; j <= nv; j++) {
        const [x, y] = pts(i / nu, j / nv);
        j ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
    }
    for (let j = 0; j <= nv; j++) {
      for (let i = 0; i <= nu; i++) {
        const [x, y] = pts(i / nu, j / nv);
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
    }
    ctx.stroke();
  };
  const sway = Math.sin(t * 6.3) * 3;
  // Back panel: from the roof's back edge (X ROOF, h BAR_H) sloping to the ground at X BACK, across far -> near.
  mesh((u, v) => P3(lerp(ROOF, BACK, v) + sway * Math.sin(u * Math.PI) * (1 - v), lerp(S_FAR, S_NEAR, u), lerp(BAR_H, 0, v)), 10, 8, 0.32);
  // Roof.
  mesh((u, v) => P3(lerp(0, ROOF, v), lerp(S_FAR, S_NEAR, u), BAR_H), 10, 3, 0.3);
  // Far side netting.
  mesh((u, v) => P3(lerp(0, u < 1 ? lerp(ROOF, BACK, v) : BACK, u), S_FAR, lerp(BAR_H, 0, v)), 5, 8, 0.24);
  // Far post and the crossbar.
  const post = (s: number, shade: string) => {
    const [x0, y0] = P3(-POST_W / 2, s, 0), [x1, y1] = P3(POST_W / 2, s, BAR_H);
    ctx.fillStyle = '#0c1028';
    ctx.fillRect(x0 - 1, y1 - 1, x1 - x0 + 2, y0 - y1 + 1);
    ctx.fillStyle = '#eef3ff';
    ctx.fillRect(x0, y1, x1 - x0, y0 - y1);
    ctx.fillStyle = shade;
    ctx.fillRect(x1 - Math.max(1, (x1 - x0) * 0.3), y1, Math.max(1, (x1 - x0) * 0.3), y0 - y1);
  };
  post(S_FAR, '#9aa6cc');
  const [fx, fy] = P3(0, S_FAR, BAR_H), [nx, ny] = P3(0, S_NEAR, BAR_H);
  ctx.strokeStyle = '#eef3ff';
  ctx.lineWidth = POST_W * 0.95;
  ctx.beginPath();
  ctx.moveTo(fx, fy);
  ctx.lineTo(nx, ny);
  ctx.stroke();
  ctx.lineWidth = 1;
}
function drawGoalFront(env: Env) {
  if (!goalVisible(env)) return;
  const ctx = env.ctx;
  const cx = env.cam.x;
  env.world();
  // Near side netting and the near post (in front of the action line).
  ctx.strokeStyle = 'rgba(214,232,255,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= 6; i++) {
    const X = lerp(0, BACK, i / 6);
    const top = X < ROOF ? BAR_H : lerp(BAR_H, 0, (X - ROOF) / (BACK - ROOF));
    const [x0, y0] = gp(cx, X, S_NEAR, 0), [, y1] = gp(cx, X, S_NEAR, top);
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0, y1);
  }
  for (let j = 0; j <= 8; j++) {
    const h = (BAR_H * j) / 8;
    const Xb = h > BAR_H - 1 ? ROOF : lerp(BACK, ROOF, h / BAR_H);
    const [x0, y0] = gp(cx, 0, S_NEAR, h), [x1, y1] = gp(cx, Xb, S_NEAR, h);
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
  }
  ctx.stroke();
  const [x0, y0] = gp(cx, -POST_W / 2, S_NEAR, 0), [x1, y1] = gp(cx, POST_W / 2, S_NEAR, BAR_H);
  ctx.fillStyle = '#0c1028';
  ctx.fillRect(x0 - 1, y1 - 1, x1 - x0 + 2, y0 - y1 + 1);
  ctx.fillStyle = '#eef3ff';
  ctx.fillRect(x0, y1, x1 - x0, y0 - y1);
  ctx.fillStyle = '#9aa6cc';
  ctx.fillRect(x1 - (x1 - x0) * 0.3, y1, (x1 - x0) * 0.3, y0 - y1);
}

// ---------------------------------------------------------------- the keeper's bust

function drawBust(env: Env, t: number) {
  const ctx = env.ctx;
  const cam = env.cam;
  const z = cam.zoom;
  const shift = (cam.x - XM(D_START)) * z * -BUST.par;
  const x = VW / 2 + (BUST.x - VW / 2) * (z / 1.5) + shift;
  const y0 = VH / 2 + (BUST.y - VH / 2) * (z / 1.5);
  if (x > VW + 260) return;
  const key = seqAt(KF_SEQ, t);
  const sc = 2 * z;
  const bob = key === 'KF1b' ? -1 * sc : 0;
  env.screen();
  const [ox, oy] = cam.screenOffset;
  ctx.translate(ox, oy);
  const f = keeperFront(key);
  if (!f) {
    drawKeeperFront(env, key, x, y0, sc);
    return;
  }
  const fr = f.a.frames[f.i];
  const pivot = fr.anchors.chest ?? [f.a.w / 2, f.a.h / 2];
  const y = y0 + bob;
  // A navy halo behind him, then a cool rim (the floodlights behind the goal) peeking out on his right edge.
  ctx.globalCompositeOperation = 'source-over';
  drawGlow(ctx, glowOf(PAL.navy), x + 10, y - 70 * (sc / 3), 190 * (sc / 3), 0.55);
  ctx.globalCompositeOperation = 'lighter';
  drawAnim(ctx, f.a, f.a.tinted(f.i, [70, 216, 255]), f.i, x + 2.2 * sc, y - 0.8 * sc, sc, { pivot, alpha: 0.8 });
  drawAnim(ctx, f.a, f.a.tinted(f.i, [238, 251, 255]), f.i, x + 0.8 * sc, y - 0.6 * sc, sc, { pivot, alpha: 0.5 });
  ctx.globalCompositeOperation = 'source-over';
  drawAnim(ctx, f.a, null, f.i, x, y, sc, { pivot });
  // The storm key: a navy shade ramping down his torso from the collar (0 -> 86 % cover, in 4-row steps), so the
  // lime jersey sinks into the night and the face, the smirk and the beckoning glove stay the lit subject.
  const navy = f.a.tinted(f.i, PAL.navy);
  for (let n = 1; n <= KEY_STEPS; n++) {
    const c0 = (KEY_MAX * (n - 1)) / KEY_STEPS, c1 = (KEY_MAX * n) / KEY_STEPS;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, y + (KEY_ROW0 + (n - 1) * 4) * sc, VW, VH);
    ctx.clip();
    drawAnim(ctx, f.a, navy, f.i, x, y, sc, { pivot, alpha: 1 - (1 - c1) / (1 - c0) });
    ctx.restore();
  }
  // A navy radial shade low and left: the storm night closes in on the frame round the lit face and glove.
  ctx.globalCompositeOperation = 'source-over';
  drawGlow(ctx, glowOf(PAL.navy), x - 60 * (sc / 3), y + 40 * (sc / 3), 220 * (sc / 3), 0.45);
}
/** The bust's storm key: the first shaded row relative to the chest anchor (the collar), the step count and the final cover. */
const KEY_ROW0 = -26, KEY_STEPS = 10, KEY_MAX = 0.86;

// ---------------------------------------------------------------- the wall of three

function wallPose(t: number): [string, Pose] {
  if (t < T_LOCK - 0.05) return ['step', POSE_STEP];
  if (t < T_LOCK) return ['brace', POSE_BRACE];
  return ['lock', POSE_LOCK];
}
function drawWall(env: Env, t: number, which: number) {
  const ctx = env.ctx;
  const cam = env.cam;
  const d = WALL3[which];
  const s = sOf(d.w);
  // The side-step (a short shuffle in), then the lock dips them 3 px as the knees bend (wallHip).
  const { gx, hipY, k } = wallHip(env, t, which);
  const gy = HZ + (GY - HZ) * s;
  // Off screen? (cheap reject before any puppet render)
  const sx = VW / 2 + (gx - cam.x) * cam.zoom;
  if (sx < -200 * s || sx > VW + 200 * s) return;
  const [name, pose] = wallPose(t);
  env.world();
  // Contact shadow.
  ctx.fillStyle = 'rgba(4,8,22,0.55)';
  ctx.beginPath();
  ctx.ellipse(gx, gy + 1, 26 * s, 4 * s, 0, 0, TAU);
  ctx.fill();
  // Backlit navy silhouettes with the ice / cyan rim (lit 0.04: no kit, no faces, a menacing backlit wall).
  PUPPETS.draw(ctx, `wall-${d.id}-${name}`, d.kit, pose, k, -1, gx, hipY, 1, 0.04, WALL_SIL);
}
/** World position of wall man `which`'s ground x and hip y at t, shared by the figure and the lock chain. */
function wallHip(env: Env, t: number, which: number): { gx: number; hipY: number; k: number } {
  const d = WALL3[which];
  const s = sOf(d.w);
  const X = XM(22) + d.dx * PXM;
  const [gx, gy] = gp(env.cam.x, X, s);
  const pose = wallPose(t)[1];
  const k = wallK(s);
  const shuffle = t < T_LOCK ? Math.abs(Math.sin((t - 0.45) * 14 + which)) * 5 * s : 0;
  const dip = t >= T_LOCK ? 3 * s * ease.outBack(clamp((t - T_LOCK) / 0.06)) : 0;
  return { gx, hipY: gy - footDrop(pose) * k - shuffle + dip, k };
}
/**
 * The lock, link i (man i to man i + 1): from T_LOCK man i's far hand and man i + 1's near hand (POSE_LOCK holds both
 * at belt height) reach for each other and close in a clasp, two navy arms (3k wide, a 1 px ice top edge) hanging in a
 * shallow V between the men like a paper-doll chain (the closer the men, the deeper the hold droops). render() draws
 * each link behind both of its men, so it never crosses a torso and only the V across the gap shows. Each arm is at
 * most one straight arm (26 units, in its own man's scale) long: when the depth staging (the near man stands well in
 * front of the line for the lens pass) spreads two men wider than that on screen, the hold fades out instead of
 * stretching into a rod. Sets up shot 6's arms-linked wallJump.
 */
function drawWallChain(env: Env, t: number, i: number) {
  if (t < T_LOCK || i < 0 || i >= WALL3.length - 1) return;
  const ctx = env.ctx;
  env.world();
  const j = joints(POSE_LOCK);
  const ha = wallHip(env, t, i), hb = wallHip(env, t, i + 1);
  // Facing -1 mirrors the puppet's x.
  const ax = ha.gx - j.handF[0] * ha.k, ay = ha.hipY + j.handF[1] * ha.k;
  const bx = hb.gx - j.handN[0] * hb.k, by = hb.hipY + j.handN[1] * hb.k;
  const rA = 26 * ha.k, rB = 26 * hb.k;
  const gap = Math.hypot(bx - ax, by - ay);
  const vis = clamp((rA + rB - gap) / 24);
  if (vis <= 0) return;
  // The clasp splits the gap in proportion to the two arms; the hold droops by what the arms have to spare.
  const f = rA / (rA + rB);
  const la = gap * f;
  const kc = (ha.k + hb.k) / 2;
  const sag = Math.min(9 * kc, Math.sqrt(Math.max(0, rA * rA - la * la)) * 0.35);
  const grow = ease.outCubic(clamp((t - T_LOCK) / 0.05));
  const mx = lerp(ax, bx, f), my = lerp(ay, by, f) + sag * grow;
  ctx.save();
  ctx.globalAlpha = vis;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const [x0, y0, k] of [[ax, ay, ha.k], [bx, by, hb.k]] as const) {
    const xe = lerp(x0, mx, grow), ye = lerp(y0, my, grow);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = vis;
    ctx.strokeStyle = '#0a0e24';
    ctx.lineWidth = 3 * k;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(xe, ye);
    ctx.stroke();
    // The floodlights catch the top of the arm.
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.85 * vis;
    ctx.strokeStyle = HEX.ice;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0, y0 - 1.5 * k);
    ctx.lineTo(xe, ye - 1.5 * k);
    ctx.stroke();
  }
  if (grow >= 0.98) {
    // The clasp: two gloves locked together (a navy knot with an ice rim along its top).
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = vis;
    ctx.fillStyle = '#0a0e24';
    ctx.beginPath();
    ctx.ellipse(mx, my, 2.6 * kc, 2.2 * kc, 0, 0, TAU);
    ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.9 * vis;
    ctx.strokeStyle = HEX.ice;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(mx, my, 2.6 * kc, 2.2 * kc, 0, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- No.10, the ball, the trap

function no10Pos(t: number): number {
  return X10 - slideLeft(t);
}
function ballPos(t: number): [number, number] {
  const x = X10 + 30 * BALL_D - rollLeft(t);
  return [x, GY - 6 * BALL_D];
}
function drawNo10At(env: Env, t: number) {
  const ctx = env.ctx;
  const cam = env.cam;
  const x = no10Pos(t);
  const sx = VW / 2 + (x - cam.x) * cam.zoom;
  if (sx < -260 || sx > VW + 260) return;
  env.world();
  const name = seqAt(NO10_SEQ, t);
  // F1's contact is the front (braking) foot: register its back foot on the support toe the trap frames use.
  const cxF = name === 'F1' ? x + 8 * BALL_D : x;
  // Contact shadow.
  ctx.fillStyle = 'rgba(4,8,22,0.6)';
  ctx.beginPath();
  ctx.ellipse(x + 14, GY + 1, 34, 5, 0, 0, TAU);
  ctx.fill();
  // A cool rim from the far lamps (behind him, up-left): ice / cyan copies offset under the sprite.
  ctx.globalCompositeOperation = 'lighter';
  drawSettle(env, name, cxF - 2, GY - 2, 2, (a, i) => a.tinted(i, [70, 216, 255]), 0.85);
  drawSettle(env, name, cxF - 1, GY - 1, 2, (a, i) => a.tinted(i, [238, 251, 255]), 0.75);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  drawSettle(env, name, cxF, GY, 2);
}
function drawTheBall(env: Env, t: number) {
  const cam = env.cam;
  const [bx, by] = ballPos(t);
  const sx = VW / 2 + (bx - cam.x) * cam.zoom;
  if (sx < -60 || sx > VW + 60) return;
  env.world();
  const ctx = env.ctx;
  ctx.fillStyle = 'rgba(4,8,22,0.65)';
  ctx.beginPath();
  ctx.ellipse(bx, GY + 1, 12, 3, 0, 0, TAU);
  ctx.fill();
  drawBall(env, spin, Math.round(bx), Math.round(by), BALL_R, BALL_D, 0, 0, 'cobalt');
  // The floodlight's specular on the wet ball (up-left, the lamps' side) and a cold rim: the ball reads as lit.
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.cyan), bx, by, 16, 0.18);
  drawGlow(ctx, glowOf(PAL.ice), bx - 3, by - 4, 5, 0.75);
  ctx.globalCompositeOperation = 'source-over';
}
/** The trap's air crater (one ring) and its expanding pressure ring (pure functions of the shot clock). */
function drawTrapDecal(env: Env, t: number) {
  const age = t - T_LAND;
  if (age < 0) return;
  env.world();
  const ctx = env.ctx;
  const [bx] = ballPos(t);
  const sq = (GY - HZ) / 128;
  airCrater(ctx, bx, GY - 1, 40, 0.26 * sq, age, 1, 0.95);
  // The ball's specular ping: for 0.12 s the trapped ball is the hottest point in the frame (a full-strength ice core
  // for the first 0.06 s, hotter than the floodlights).
  if (age < 0.12) {
    const [bx2, by2] = ballPos(t);
    ctx.globalCompositeOperation = 'lighter';
    if (age < 0.06) drawGlow(ctx, glowOf(PAL.ice), bx2 + 2, by2 - 3, 12, 1);
    drawGlow(ctx, glowOf(PAL.ice), bx2 + 3, by2 - 4, 9, 0.9 * (1 - age / 0.12));
    drawGlow(ctx, glowOf(PAL.cyan), bx2, by2, 24, 0.4 * (1 - age / 0.12));
    ctx.globalCompositeOperation = 'source-over';
  }
  // The pressure ring rolling out across the turf.
  const u = clamp(age / 0.32);
  if (u < 1) {
    const r = lerp(16, 220, ease.outCubic(u));
    ctx.globalCompositeOperation = 'lighter';
    // The contact: an ice spark where the sole kills the ball (2 frames), then the ring rolls out.
    if (age < 0.035) {
      const [bx2, by2] = ballPos(t);
      drawGlow(ctx, glowOf(PAL.cyan), bx2, by2 - 8, 34, 0.55);
      drawGlow(ctx, glowOf(PAL.ice), bx2, by2 - 9, 14, 0.9);
      drawGlow(ctx, glowOf(PAL.ice), bx2, by2 - 9, 6, 0.8, 7, 0.35);
    }
    ctx.globalAlpha = 0.9 * (1 - u);
    ctx.strokeStyle = HEX.cyan;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(bx, GY - 1, r, r * 0.22 * sq, 0, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 0.5 * (1 - u);
    ctx.strokeStyle = HEX.ice;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(bx, GY - 1, r * 0.82, r * 0.82 * 0.22 * sq, 0, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
}

/** The floodlit pitch: a cool wash over the turf after the storm darken (the stadium is lit; only the sky is storm). */
function drawFloodWash(env: Env) {
  const ctx = env.ctx;
  const cam = env.cam;
  env.world();
  const z = cam.zoom;
  const halfW = VW / (2 * z) + 40, B = cam.y + VH / (2 * z) + 40;
  const [, yFar] = gp(cam.x, 0, sOf(-34));
  const g = ctx.createLinearGradient(0, yFar, 0, B);
  g.addColorStop(0, 'rgba(110,160,190,0.16)');
  g.addColorStop(0.5, 'rgba(90,140,160,0.1)');
  g.addColorStop(1, 'rgba(70,110,130,0.05)');
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = g;
  ctx.fillRect(cam.x - halfW, yFar, halfW * 2, B - yFar);
  ctx.globalCompositeOperation = 'source-over';
}

/** A cool pool of floodlight on the turf round No.10 and the ball (additive, after the storm darken). */
function drawKeyPool(env: Env, t: number) {
  const x = no10Pos(t) + 24;
  const cam = env.cam;
  const sx = VW / 2 + (x - cam.x) * cam.zoom;
  if (sx < -300 || sx > VW + 300) return;
  env.world();
  const ctx = env.ctx;
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf([120, 170, 240]), x, GY - 4, 190, 0.34, 1, 0.26);
  drawGlow(ctx, glowOf([190, 230, 255]), x, GY - 2, 70, 0.26, 1, 0.22);
  ctx.globalCompositeOperation = 'source-over';
}

// ---------------------------------------------------------------- screen-space layers

/** Horizontal speed streaks during the whip (ice, frame-stable), length and count by the camera's speed. */
function drawSpeedStreaks(env: Env, t: number) {
  const sp = clamp(camV(t) / V_PEAK);
  if (sp < 0.04) return;
  const ctx = env.ctx;
  env.screen();
  const rng = env.frng(7);
  ctx.globalCompositeOperation = 'lighter';
  const n = Math.round(40 * Math.min(1, sp * 1.6));
  for (let i = 0; i < n; i++) {
    const y = Math.round(rng.range(8, VH - 8));
    const len = (60 + rng.next() * 260) * (0.35 + sp);
    const x = rng.range(-len, VW);
    const hgt = rng.next() < 0.25 ? 2 : 1;
    ctx.globalAlpha = (0.12 + rng.next() * 0.3) * Math.min(1, sp * 1.8);
    ctx.fillStyle = rng.next() < 0.3 ? HEX.cyan : HEX.ice;
    ctx.fillRect(Math.round(x), y, Math.round(len), hgt);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

/**
 * The counter is the subject of the rush: with the camera's speed its digits swell (up to ×1.9) and race up into
 * mid-frame (row 205), trailing ghosts, then drop back into their slot as the camera brakes onto No.10 (by 0.86). It
 * keys on speed above the wall drift's (a fifth of the peak), so it sits in its slot while the wall locks arms at belt
 * height, the row it would otherwise cover.
 */
function counterRush(t: number) {
  const rush = ease.outQuad(clamp((camV(t) / V_PEAK - 0.22) / 0.4));
  return { rush, S: lerp(1, 1.9, rush), cy: lerp(COUNTER_Y, 205, rush) };
}
/**
 * The gust answers the dare: from 1.00 (his head lifts, F3b) the stamped 30 M is blown east off its slot, shearing and
 * thinning into the wind, gone by 1.13, so the ball and his answer hold the frame into the wipe.
 */
function counterBlow(t: number) {
  const u = clamp((t - (T_GUST + 0.02)) / 0.13);
  return { dx: 380 * ease.inQuad(u), shear: -0.5 * ease.outQuad(u), a: 1 - ease.inQuad(u), u };
}
/** The 30 M counter: 0 at 0.40, a 5 m step each time the camera crosses another 5 m (1-frame 115 % pop), 30 at 0.85, the stamp at 0.90. */
function drawCounter(env: Env, t: number) {
  if (t < 0.4) return;
  const blow = counterBlow(t);
  if (blow.a <= 0.01) return;
  const ctx = env.ctx;
  env.screen();
  const { rush, S, cy } = counterRush(t);
  ctx.save();
  if (blow.u > 0) {
    // Sheared about its baseline and carried east by the gust, with wind ghosts trailing behind it.
    ctx.translate(blow.dx, 0);
    ctx.transform(1, 0, blow.shear, 1, -blow.shear * COUNTER_Y, 0);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 1; i <= 3; i++) {
      ctx.globalAlpha = (0.3 / i) * blow.a;
      counterText(ctx, `${CROSS.length * 5} M`, VW / 2 - i * 22 * Math.sqrt(blow.u), COUNTER_Y, 1, 1);
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  let step = 0;
  for (const c of CROSS) if (t >= c - 1e-6) step++;
  const since = step > 0 ? t - CROSS[step - 1] : 1;
  const pop = since < 1 / 60 + 1e-6 ? 1.15 : 1;
  let sx = pop, sy = pop;
  if (t >= T_LAND) {
    const u = ease.outQuad(clamp((t - T_LAND) / 0.08));
    sx = lerp(1.3, 1, u);
    sy = lerp(0.7, 1, u);
  }
  const fadeIn = clamp((t - 0.4) / 0.05) * blow.a;
  const txt = `${step * 5} M`;
  sx *= S;
  sy *= S;
  // A speed smear trailing the racing digits (the world streams right past them). Film fix M3: one continuous blur, never
  // readable copies: eight faint cyan passes at most 3 px apart (the whole smear is under one glyph pitch), so the
  // counter never reads as a wrong number ("55 M", "115 M").
  if (rush > 0.02) {
    const n = 8, len = Math.min(22 * rush * S, 3 * n);
    for (let k = 1; k <= n; k++) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.09 * (1 - (k - 1) / n) * fadeIn;
      ctx.font = `28px ${PIXEL_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = HEX.cyan;
      ctx.translate(VW / 2 + (len * k) / n, cy);
      ctx.scale(sx, sy);
      ctx.fillText(txt, 0, 0);
      ctx.restore();
    }
  }
  ctx.globalAlpha = fadeIn;
  counterText(ctx, txt, VW / 2, cy, sx, sy);
  ctx.globalAlpha = 1;
  // An additive pass so the readout holds its own light under the storm grade and the vignette.
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.cyan), VW / 2, cy, 60 * S, 0.36 * fadeIn, 2.4, 0.45);
  ctx.globalAlpha = 0.85 * fadeIn;
  counterText(ctx, txt, VW / 2, cy, sx, sy);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  // The stamp: an ice ghost of the readout punched outward (1 -> 1.6) and a cyan underline snapping wide.
  const age = t - T_LAND;
  if (age >= 0 && age < 0.26) {
    const u = age / 0.26;
    ctx.globalCompositeOperation = 'lighter';
    const w = lerp(60, 230, ease.outExpo(clamp(u * 2)));
    ctx.globalAlpha = 0.9 * (1 - u) * blow.a;
    ctx.fillStyle = HEX.cyan;
    ctx.fillRect(Math.round(VW / 2 - w / 2), COUNTER_Y + 18, Math.round(w), 2);
    ctx.fillStyle = HEX.ice;
    ctx.fillRect(Math.round(VW / 2 - w / 4), COUNTER_Y + 18, Math.round(w / 2), 1);
    for (const sgn of [-1, 1]) ctx.fillRect(Math.round(VW / 2 + sgn * (w / 2 + 6) - 1), COUNTER_Y + 13, 2, 10);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
}

/** The first gust (T_GUST, 0.98): wavering ice streamlines sweeping west -> east across his body, ahead of the wind wipe. */
function drawGustLines(env: Env, t: number) {
  const u = (t - T_GUST) / (DUR - T_GUST);
  if (u <= 0) return;
  const ctx = env.ctx;
  env.screen();
  const [ox, oy] = env.cam.screenOffset;
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) {
    const head = lerp(-120, VW + 380, clamp(u * 1.35 - i * 0.06)) + ox;
    const y0 = 150 + i * 22 + hash(i * 2.3) * 10 + oy;
    const len = 150 + hash(i * 4.1) * 160;
    for (let pass = 0; pass < 2; pass++) {
      ctx.strokeStyle = pass ? HEX.ice : HEX.cyan;
      ctx.lineWidth = pass ? 1 : 2;
      ctx.globalAlpha = (pass ? 0.75 : 0.5) * (1 - u * 0.5);
      ctx.beginPath();
      for (let k = 0; k <= 16; k++) {
        const x = head - len * (k / 16);
        const y = y0 + pass + Math.sin(x * 0.028 + i * 1.7 + t * 9) * (3 + 3 * (k / 16));
        k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
  }
  // The gust in his hair: three short ice streamlines peel off the back of his mop (the hair anchor, GY - 190) and arc
  // up and over the crown toward the goal (never across his face), each re-launching every 0.15 s while the gust blows.
  const cam = env.cam;
  const z = cam.zoom;
  const hx = VW / 2 + (no10Pos(t) - cam.x) * z + ox, hy = VH / 2 + (GY - 190 - cam.y) * z + oy;
  const age = t - T_GUST;
  for (let i = 0; i < 3; i++) {
    const L = (60 + 20 * i) * z, lift = (10 + 7 * i) * z;
    const x0 = hx - (34 - 4 * i) * z, y0 = hy + (12 + 8 * i) * z;
    const ph = (age / 0.15 + i * 0.37) % 1;
    const p1 = ease.outQuad(clamp(ph * 1.4)), p0 = clamp(ph * 1.4 - 0.45);
    if (p1 - p0 < 0.02) continue;
    const at = (q: number): [number, number] => [x0 + L * q, y0 - lift * Math.sin(q * Math.PI * 0.85) - 4 * z * q * q];
    const fade = clamp(age / 0.04) * (1 - clamp((ph - 0.75) / 0.25));
    for (let pass = 0; pass < 2; pass++) {
      ctx.strokeStyle = pass ? HEX.ice : HEX.cyan;
      ctx.lineWidth = pass ? 1.5 : 3.5;
      ctx.globalAlpha = (pass ? 0.95 : 0.4) * fade;
      ctx.beginPath();
      for (let k = 0; k <= 12; k++) {
        const [x, y] = at(lerp(p0, p1, k / 12));
        k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

/**
 * Shot 2's opening world behind the wipe's trailing edge: shot 2's own frame-0 background (drawGrabVoid: the storm
 * void with its cold glow round the palm point and the two-arm isobar spiral), so the background and its centre carry
 * straight across the cut and any later change to shot 2's void shows here too. The clip is not a straight door: a
 * wavy front (the trailing edge windWipe returns, lead - 380), plus a tongue behind every wipe streak that runs ahead
 * of it, ending exactly at that streak's tail (windWipe's own frame-stable geometry), so each streak drags shot 2's
 * world in behind it.
 */
function drawReveal(env: Env, t: number, lead: number) {
  const edge = lead - 380;
  const ctx = env.ctx;
  env.screen();
  ctx.save();
  ctx.beginPath();
  let any = false;
  const front = (y: number) => edge + 46 * Math.sin(y * 0.023 + 0.7) + 22 * Math.sin(y * 0.071 + 2.1);
  for (let y = 0; y < VH; y += 4) {
    const e = front(y + 2);
    if (e > 0) {
      ctx.rect(0, y, Math.min(VW, e), 4);
      any = true;
    }
  }
  // windWipe's streaks (same hash, same constants as air.ts): y, height, length, lag.
  for (let i = 0; i < 60; i++) {
    const y = Math.round(hash(i * 3.7) * VH);
    const hgt = 2 + Math.floor(hash(i * 5.9) * 5);
    const len = 80 + hash(i * 1.3) * 220;
    const lag = hash(i * 8.1) * 160;
    const x0 = Math.round(lead - lag - len);
    if (x0 > 0 && x0 > front(y)) {
      ctx.rect(0, y - 1, Math.min(VW, x0), hgt + 2);
      any = true;
    }
  }
  if (!any) {
    ctx.restore();
    return;
  }
  ctx.clip();
  drawGrabVoid(ctx);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ---------------------------------------------------------------- particles (update only)

function spawnBrake(env: Env, t: number) {
  // Dew and blades sprayed off his braking studs (F1 skid).
  const rng = env.rng;
  const x = no10Pos(t) + 8 * BALL_D + 16;
  for (let i = 0; i < 2; i++) {
    env.parts.spawn({
      kind: PK.Pixel, x: x + rng.range(-10, 6), y: GY - rng.range(0, 3), vx: rng.range(60, 260), vy: rng.range(-220, -60), ay: 900,
      max: rng.range(0.25, 0.45), s0: rng.range(1.5, 3), s1: 1, ramp: 'dew', r0: 0, r1: 1, a0: 0.95, a1: 0, layer: 1,
    });
  }
  if (rng.next() < 0.6)
    env.parts.spawn({
      kind: PK.Blade, x: x + rng.range(-8, 8), y: GY - 2, vx: rng.range(40, 200), vy: rng.range(-260, -90), ay: 1000, drag: 1,
      max: rng.range(0.3, 0.5), s0: rng.range(3, 5), s1: 3, rot: rng.range(0, TAU), vrot: rng.range(-20, 20), ramp: 'grass', a0: 1, a1: 1, add: false,
    });
}
function spawnTrap(env: Env, t: number) {
  const rng = env.rng;
  const [bx] = ballPos(t);
  // The dew crown: 24 drops thrown up and out round the ball.
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * TAU + rng.range(-0.1, 0.1);
    const out = rng.range(120, 220);
    env.parts.spawn({
      kind: PK.Pixel, x: bx + Math.cos(a) * 10, y: GY - 2 + Math.sin(a) * 2.5, vx: Math.cos(a) * out, vy: -rng.range(230, 360) + Math.sin(a) * 40, ay: 1100,
      max: rng.range(0.35, 0.5), s0: rng.range(2.5, 4), s1: 1.2, ramp: 'dew', r0: 0, r1: 0.9, a0: 1, a1: 0.1, layer: 1,
    });
  }
  // The air slammed out from under the sole: a mist ring pushed out flat along the turf.
  for (let i = 0; i < 22; i++) {
    const dir = i % 2 ? 1 : -1;
    env.parts.spawn({
      kind: PK.Mist, x: bx + dir * rng.range(4, 14), y: GY - 3, vx: dir * rng.range(160, 360), vy: rng.range(-24, 0), drag: 4,
      max: rng.range(0.35, 0.6), s0: rng.range(4, 7), s1: rng.range(18, 28), ramp: 'vapor', r0: 0.3, r1: 1, a0: 0.4, a1: 0, k: 0.6, add: false, layer: 1,
    });
  }
  // ...and a flat sheet of dew blown off the grass tips, skimming out both ways.
  for (let i = 0; i < 30; i++) {
    const dir = i % 2 ? 1 : -1;
    env.parts.spawn({
      kind: PK.Pixel, x: bx + dir * rng.range(6, 20), y: GY - rng.range(1, 4), vx: dir * rng.range(260, 420), vy: rng.range(-40, -10), ay: 300, drag: 2,
      max: rng.range(0.3, 0.5), s0: rng.range(1.5, 2.6), s1: 1, ramp: 'dew', r0: 0, r1: 1, a0: 1, a1: 0, layer: 1,
    });
  }
  // A few blades pressed loose.
  for (let i = 0; i < 6; i++)
    env.parts.spawn({
      kind: PK.Blade, x: bx + rng.range(-14, 14), y: GY - 2, vx: rng.range(-140, 140), vy: rng.range(-260, -120), ay: 1000, drag: 1,
      max: rng.range(0.35, 0.55), s0: rng.range(3, 5), s1: 3, rot: rng.range(0, TAU), vrot: rng.range(-24, 24), ramp: 'grass', a0: 1, a1: 1, add: false,
    });
}
/** The wall braces: each man stamps his boots into the turf (dew and a low puff off the studs). */
function spawnLock(env: Env) {
  const rng = env.rng;
  for (const d of WALL3) {
    const s = sOf(d.w);
    const X = XM(22) + d.dx * PXM;
    const [gx, gy] = gp(env.cam.x, X, s);
    for (let i = 0; i < 6; i++)
      env.parts.spawn({
        kind: PK.Pixel, x: gx + rng.range(-24, 24) * s, y: gy - rng.range(0, 3), vx: rng.range(-160, 160), vy: rng.range(-200, -60), ay: 900,
        max: rng.range(0.25, 0.4), s0: rng.range(1.5, 3) * s, s1: 1, ramp: 'dew', r0: 0, r1: 1, a0: 0.9, a1: 0, layer: 1,
      });
    for (let i = 0; i < 3; i++)
      env.parts.spawn({
        kind: PK.Mist, x: gx + rng.range(-20, 20) * s, y: gy - 3, vx: rng.range(-120, 120), vy: rng.range(-20, -4), drag: 4,
        max: rng.range(0.3, 0.5), s0: 6 * s, s1: 16 * s, ramp: 'storm', r0: 0.1, r1: 0.8, a0: 0.35, a1: 0, k: 0.4, add: false, layer: 1,
      });
  }
}

function spawnGust(env: Env, t: number) {
  // The first gust: dew motes and mist ribbons carried west -> east across the frame (world space, round him).
  const rng = env.rng;
  const cam = env.cam;
  const halfW = VW / (2 * cam.zoom);
  for (let i = 0; i < 6; i++) {
    env.parts.spawn({
      kind: PK.Streak, x: cam.x - halfW - rng.range(0, 120), y: rng.range(cam.y - 170, GY - 4), vx: rng.range(900, 1500), vy: rng.range(-40, 10),
      max: rng.range(0.4, 0.7), s0: rng.range(1, 2.2), s1: 0.6, ramp: 'dew', r0: 0, r1: 1, a0: 0.8, a1: 0, k: 1.2, layer: 1, wind: 1,
    });
  }
  // Dew lifted off the turf round his boots, carried east.
  const x = no10Pos(t);
  for (let i = 0; i < 2; i++)
    env.parts.spawn({
      kind: PK.Pixel, x: x + rng.range(-30, 60), y: GY - rng.range(0, 6), vx: rng.range(200, 420), vy: rng.range(-120, -30), ay: 120,
      max: rng.range(0.4, 0.6), s0: rng.range(1.5, 2.5), s1: 1, ramp: 'dew', r0: 0, r1: 1, a0: 0.9, a1: 0, layer: 1, wind: 1,
    });
  if (rng.next() < 0.7)
    env.parts.spawn({
      kind: PK.Mist, x: cam.x - halfW - 40, y: rng.range(GY - 120, GY - 6), vx: rng.range(500, 800), vy: rng.range(-15, 5),
      max: rng.range(0.5, 0.8), s0: rng.range(8, 14), s1: rng.range(16, 26), ramp: 'vapor', r0: 0.4, r1: 1, a0: 0.18, a1: 0, k: 0.5, add: false, layer: 1,
    });
}
function spawnAmbient(env: Env, t: number) {
  // Storm dew motes drifting across the keeper's close-up (screen-near, world-placed).
  const rng = env.rng;
  const cam = env.cam;
  if (rng.next() < 0.6) {
    const halfW = VW / (2 * cam.zoom), halfH = VH / (2 * cam.zoom);
    env.parts.spawn({
      kind: PK.Pixel, x: cam.x - halfW - 4, y: cam.y + rng.range(-halfH, halfH), vx: rng.range(120, 260), vy: rng.range(-20, 30),
      max: rng.range(1.2, 2), s0: rng.range(1, 2.2), s1: 1, ramp: 'dew', r0: 0.2, r1: 1, a0: 0.7, a1: 0, layer: 1,
    });
  }
}

// ---------------------------------------------------------------- the shot

export const shotDare: Shot = {
  name: META.name,
  dur: DUR,
  seed: META.seed,
  rate: RATE[1],
  muffle: MUFFLE[1],
  cues: [
    // The storm is heard from frame 1: a low howl under the crowd, planted before shot 2's howl(0.5, 0.35).
    { at: 0, fn: (e) => { e.sfx.crowd(1.2, 0.35); e.sfx.rumble(1.2, 0.2); e.sfx.howl(1.2, 0.12, 0.9); } },
    // The keeper's glove fingers curling (the beckons).
    { at: 0.14, fn: (e) => e.sfx.scuff(0.06) },
    { at: 0.3, fn: (e) => e.sfx.scuff(0.06) },
    { at: T_GO, fn: (e) => e.sfx.whoosh(0.5, 300, 2400, 0.5, -0.4) },
    ...CROSS.map((at, i) => ({ at, fn: (e: Env) => e.sfx.blip(CLACKS[i], 0.18) })),
    // The camera tears past the wall at their shoulders (a short pass-by), and they stamp into their brace.
    { at: 0.62, fn: (e) => e.sfx.whoosh(0.22, 1500, 420, 0.3, 0.35) },
    { at: T_LOCK, fn: (e) => { e.sfx.scuff(0.22, 0.2); e.sfx.kick(0.2); } },
    {
      at: T_LAND,
      fn: (e) => {
        e.sfx.scuff(0.3);
        e.sfx.kick(0.4);
        e.sfx.kick(0.3);
        e.sfx.boom(0.3);
        e.cam.hit(0.32);
        e.cam.shove(-11, 3);
      },
    },
    { at: T_GUST, fn: (e) => e.sfx.gust(0.6, 0.25) },
    { at: T_WIPE, fn: (e) => e.sfx.whoosh(0.15, 800, 5000, 0.4) },
  ],
  prepare(env) {
    warmGale();
    // Warm the wall's puppet poses and the keeper's tints so the first play never hitches.
    const ctx = env.ctx;
    ctx.save();
    ctx.globalAlpha = 0;
    for (const d of WALL3) {
      const k = wallK(sOf(d.w));
      for (const [name, pose] of [['step', POSE_STEP], ['brace', POSE_BRACE], ['lock', POSE_LOCK]] as const) {
        PUPPETS.get(`wall-${d.id}-${name}`, d.kit, pose, k, -1, WALL_SIL);
        PUPPETS.get(`wall-${d.id}-${name}`, d.kit, pose, k, -1);
      }
    }
    for (const [, key] of KF_SEQ) {
      const f = keeperFront(key);
      if (f) {
        f.a.tinted(f.i, [70, 216, 255]);
        f.a.tinted(f.i, [238, 251, 255]);
        f.a.tinted(f.i, PAL.navy);
      }
    }
    const a = settle();
    if (a) for (const n of ['F1', 'F2', 'F3', 'F3b']) {
      const i = findFrame(a, n);
      if (i >= 0) {
        a.tinted(i, [70, 216, 255]);
        a.tinted(i, [238, 251, 255]);
      }
    }
    ctx.restore();
  },
  init(env) {
    env.sfx.clearBus();
    env.cam.set(VW / 2, VH / 2, 1, 0);
    env.cam.shakeRoll = 0.015;
    PUPPETS.frame();
    spin.m = new Float64Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    fired = { trap: false, gust: false, lock: false };
    lastRoll = 0;
    curT = 0;
    placeCam(env, 0);
  },
  update(env, t, dt) {
    curT = t;
    placeCam(env, t);
    // The ball rolls (true spin from the distance covered) until the sole stops it dead.
    const rolled = 230 - rollLeft(t);
    const dRoll = rolled - lastRoll;
    lastRoll = rolled;
    if (dRoll > 0) spin.rotate(0, 0, 1, dRoll / (BALL_R * BALL_D));
    if (t < 0.36) spawnAmbient(env, t);
    if (t > 0.78 && t < T_LAND) spawnBrake(env, t);
    if (!fired.lock && t >= T_LOCK) {
      fired.lock = true;
      spawnLock(env);
    }
    if (!fired.trap && t >= T_LAND) {
      fired.trap = true;
      spawnTrap(env, t);
    }
    if (t >= T_GUST) {
      if (!fired.gust) {
        fired.gust = true;
        env.parts.wind = [520, -20];
      }
      spawnGust(env, t);
    }
    void dt;
  },
  render(env, t) {
    const { ctx, fx } = env;
    curT = t;
    HZ = keys(HZ_TRACK, t);
    PUPPETS.frame();
    env.screen();
    ctx.fillStyle = HEX.stormNavy;
    ctx.fillRect(0, 0, VW, VH);

    // 1. The world, darkened under the storm.
    drawStadium(env, t);
    drawTurf(env, t);
    drawGoalBack(env, t);
    drawTrapDecal(env, t);
    stormDarken(ctx, t < T_GO ? 0.45 : 0.36);
    drawFloodWash(env);
    drawLandmarkFlares(env);
    drawLamps(env, t);
    drawKeyPool(env, t);

    // 2. Figures, far to near (the wall's far two, No.10 and the ball on the action line, the wall's near one).
    // Each lock link sits behind both of its men (POSE_LOCK's lean puts both hands just in front of the hips, so a link
    // drawn over man i would cross his waist): only the bridge across the gap between two bodies shows.
    drawWallChain(env, t, 0);
    drawWallChain(env, t, 1);
    drawWall(env, t, 0);
    drawWall(env, t, 1);
    drawTheBall(env, t);
    drawNo10At(env, t);
    drawWall(env, t, 2);
    drawGoalFront(env);
    env.world();
    env.parts.draw(ctx, 1);
    drawNearLens(env);

    // 3. The keeper's bust (near the lens), the whip's streaks, the landing's focus lines.
    drawBust(env, t);
    drawSpeedStreaks(env, t);
    drawGustLines(env, t);
    const land = t - T_LAND;
    if (land >= 0 && land < 0.16) {
      env.screen();
      const [ox, oy] = env.cam.screenOffset;
      const rng = env.frng(3);
      const [bx] = ballPos(t);
      const sx = VW / 2 + (bx - env.cam.x) * env.cam.zoom + ox;
      const sy = VH / 2 + (GY - 40 - env.cam.y) * env.cam.zoom + oy;
      ctx.globalCompositeOperation = 'lighter';
      focusLines(ctx, rng, sx, sy, 150, 560, 46, HEX.ice, 0.32 * (1 - land / 0.16), 3);
      ctx.globalCompositeOperation = 'source-over';
    }

    // 4. Ground fog along the bottom edge, the HUD and the transition.
    env.screen();
    const fog = ctx.createLinearGradient(0, 270, 0, VH);
    fog.addColorStop(0, 'rgba(6,11,36,0)');
    fog.addColorStop(1, 'rgba(6,11,36,0.4)');
    ctx.fillStyle = fog;
    ctx.fillRect(0, 270, VW, VH - 270);
    drawCounter(env, t);
    if (t >= T_WIPE) {
      // windWipe's lead starts 260 px off screen: begin at a quarter so the first streaks cross at 1.08, and end at
      // 0.85 with the seam still under the streaks (the reveal covers <= 60 % on the last frame): the cut lands on them.
      const p = 0.25 + 0.6 * ((t - T_WIPE) / (DUR - T_WIPE));
      env.screen();
      // windWipe's lead (its trailing edge, lead - 380, is where shot 2 shows through).
      const lead = lerp(-260, VW + 260, ease.inOutQuad(clamp(p)));
      drawReveal(env, t, lead);
      env.screen();
      windWipe(ctx, p, 1);
    }

    // 5. Post: the storm grade, the flash-in (0.25, under the counted threshold), the whip's streak and radial.
    galeStorm(fx);
    // A lighter vignette than the grade's 0.60: it crushed the bottom band where the counter and his boots sit.
    fx.vignette = 0.48;
    // The keeper's pale face must not bloom out in the close-up; blended back to the storm grade over the whip's launch.
    if (t < T_GO + 0.12) {
      const kb = clamp((t - T_GO) / 0.12);
      fx.bloom = lerp(0.85, fx.bloom, kb);
      fx.bloomThresh = lerp(0.72, fx.bloomThresh, kb);
    }
    if (t < 0.2) {
      fx.flash = 0.25 * (1 - t / 0.2);
      fx.flashColor = [190, 240, 255];
    }
    const sp = clamp(camV(t) / V_PEAK);
    if (sp > 0.02) {
      // No smear on the subject while drifting past the wall: the streak runs only on the rushes.
      fx.streak = 0.065 * sp * clamp((sp - 0.22) / 0.12);
      fx.streakDX = 1;
      fx.streakDY = 0;
      // Keep the racing counter readable inside the smear.
      const cr = counterRush(t);
      fx.streakHoleX = 0.5;
      fx.streakHoleY = cr.cy / VH;
      fx.streakHoleR = 0.22 + 0.12 * cr.rush;
      fx.radial = 0.06 * sp;
      // The landmark strobe: on the frame the lens is over a painted line it prints crisp, not smeared.
      if (landmarkK(camD(t)) > 0.7) {
        fx.streak *= 0.15;
        fx.radial *= 0.4;
      }
    }
    if (land >= 0 && land < 0.1) fx.ca = 0.004 * (1 - land / 0.1) + 0.0012;
    // The slam's pressure ripple rolling out of the trap (a local shock: not a full-frame flash).
    if (land >= 0 && land < 0.22) {
      const [ox, oy] = env.cam.screenOffset;
      const [bx] = ballPos(t);
      const sx = VW / 2 + (bx - env.cam.x) * env.cam.zoom + ox;
      const sy = VH / 2 + (GY - 40 - env.cam.y) * env.cam.zoom + oy;
      pushShock(fx, { x: sx / VW, y: (sy + 40) / VH, r: 0.3 * ease.outCubic(land / 0.22), s: 0.028 * (1 - land / 0.22) });
    }
  },
};

