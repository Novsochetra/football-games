// MERIDIAN THREAD v2 · shot 8 · "Flying Header" (1.7 s, seed 418, contact 0.36 = global 12.46). SPEC.md shot 8.
// The payoff hit and the teamwork moment: all of No.10's line pours into No.7's header; then the keeper learns what
// the line can do.
//
// View: a close side view from the near touchline, lens at 1.34 m (eye level = the backdrop's horizon, world y 172),
// ground line at world y 318, No.7's Header frames at 2x (196 px standing), 109 px per metre on the meeting point's
// plane. A pitch-only pinhole (no yaw, no roll): everything deeper than the meeting point (the keeper, the goal, the
// far end of the bowstring) is scaled toward the eye-level vanishing point by k = 16 m / depth, so the goal mouth
// opens up on the right as the chase camera closes on it, and the far top corner sits deep inside the frame.
//
//   0.00-0.10  THE LAUNCH: H1b (the take-off), the camera dollying right 60 px with him at 1.20; held tremor 0.2 -> 0.5;
//              the needle-ball (48 px, picking up shot 7's big needle point across the motion cut, growing steadily to
//              its true size on his forehead) falls down its shaft (the arc's falling limb, curving back up toward the
//              apex off the top-left); the keeper an ink silhouette off his line at the right edge, out of reach; ink /
//              mint speed streaks rushing past.
//   0.10-0.36  FULL FLIGHT: H2 (head-locked on the forehead path, so the legs swing up behind the head), flat, arms
//              swept back; a steady push through the flight, then the CRASH ZOOM (inExpo) to 2.40 onto the meeting
//              point (to screen 300, 190).
//   0.22-0.36  THE REEL-IN: a 60 px pearl pulse enters at the frame edge and runs the shaft at ~4000 px/s down into
//              the ball; the light drains out of the shaft behind it, the tail whips taut (its curve straightens), the
//              ball charges white-hot, No.7's rim turns jade and the loom's No.7 thread (2a) flickers between the
//              shaft and his eyes for 0.14 s. No.10's pass arriving in No.7's head.
//   0.36       CONTACT (H3), STACK C, the biggest in the film: hit-stop 0.03 for 0.22 s, cam.hit 1.0 (shakeAmp 22), punch
//              +0.18, stage A "jade print" 0.36-0.43 (a jagged mint burst out of the forehead, No.7 and the ball one ink
//              silhouette, the spear printed as an ink lance with a mint core; halftone in the band only) and stage B "pearl negative"
//              0.43-0.52 (F6 / F7; the dot band at 0.10 holds 13-15 % of the frame), three post shocks, three stitched
//              rings (pearl 8 -> 300, jade 10 -> 260, emerald 12 -> 220 squashed), 80 jade sparks + 40 light-stitches
//              + 30 ink flecks spawned already flying, so the hit-stop freezes them as a starburst round his head, 120 ink
//              focus lines with jade tips (pearl with stage B), CA 0.016, radial 0.14, bloom 1.2, the ball squashed on
//              his forehead (sx 0.6, sy 1.3). THE BOWSTRING: the line snaps straight in 0.05 s into the jade spear (body
//              ~26 px, halo ~95 px, pearl core) from his forehead to the far top corner, off the right edge, ringing in
//              a standing wave (14 px -> 0 over 0.6 s, 3 nodes) and the pluck warp along it (0.030, N 1, 9 Hz, 0.4 s);
//              the night ink lifts in a ~140 px band down its length (the colour floods back along the spear).
//   0.58-1.00  THE BEAD: the ball squeezes off his forehead and rides the spear toward goal like a bead on a string,
//              popping the stitch-holes as it passes; 0.62-0.84 the WHIP-PAN right on the shared streak (0.10 along
//              (1, 0), the bead sharp in its hole), landing beside the bead; No.7 drops behind: H4 0.62, H5 0.80 belly
//              slide, grass blades flicking, teeth gritted in a grin.
//   1.00-1.70  THE KEEPER (rate 0.35): the chase holds the bead at (300, 170), zoom 1.00 -> 1.30, the goal filling the
//              right third and opening as we close on it; 1.05 the keeper dives across the bead's path from the right
//              (gkDive, ~150 px, one glove reaching, never frozen): the glove sweeps under the bead, well below it, and
//              only rises to the line behind it.
//   1.22       THE LASH: the spear's wave whips the taut line just behind the ball down across his reaching forearm (the
//              ball already ~110 px past his fingertips), a jade loop wraps it twice and bites (hit-stop 0.06 for 0.08
//              s), cam.hit 0.8, one shock, a stitched ring 8 -> 120, 40 jade sparks, CA 0.010; no impact frame, no
//              flash. 1.30 the line's recoil plucks him away: 1.5 turns down toward the turf at the near post, the
//              jade loop still on his wrist (fading over 2 s). He never enters the netting.
//   1.40-1.70  the bead closes on the far top corner, the posts and the bar catching its light; cut as it touches the
//              net (motion cut into shot 9's harp).
//
// Camera roll 0 (shakeRoll 0.015). No dolly zoom (the crash is a zoom on a static dolly; the chase dollies with the
// bead at a fixed lag), no crash pull-out (the widening rides inside the whip-pan's streak, 0.26 s after the hit).
// FlashBudget: F6 impact A at 0.36, F7 impact B at 0.43 (12.46 / 12.53 global); nothing else full-frame. Deterministic:
// init() resets every flag and list; particles spawn in update() from env.rng; spin advances in update(); render() is
// a pure function of t and that state (flicker from env.frng()). Never the banned word: loft, pass, header, arc, line.

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { BallSpin } from '../../engine/pixel';
import { TAU, clamp, ease, lerp, type Rng } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import { FIELD, drawFieldBackdrop } from '../../art/stadium';
import { ribbon, sparkle, spinMarks, type TrailPt } from '../../art/fx';
import { drawAnim } from '../../art/studioAnim';
import { KEEPER_KIT, POSES, P, joints, type Pose } from '../../art/puppet';
import { no7, no7Anchor, type No7Key } from '../../art/no7';
import { drawBall, holdTrauma, keys, punch, pushShock, zoomAbout, type PuppetSil } from '../kit';
import {
  HEX, JADE_FLARE, LAMP_JADE, LAYOUT, PAL, PUPPETS, RATE, SEQ7, SHOTS, StitchRings, WARP, arcLengths, assertMeridianFx,
  halftoneImpact, inkFlecks, lampTintFor, meridianStroke, mix, nightGrade, nightInk, pointAt, resetSpin, seqAt, setPluck,
  stitchRing, warmMeridian, whip,
} from './common';

const META = SHOTS[7];
const SEQ = SEQ7[8]!;
const DUR = META.dur;

// ---------------------------------------------------------------- beats (shot-local s, the runner's unwarped clock)

const T_H2 = 0.1;
const T_REEL = 0.22;
const T_HIT = 0.36;
const T_STAGE_B = 0.43;
const T_PRINT_END = 0.52;
const T_REL = 0.58;
const T_WHIP = 0.62;
const T_WHIP_END = 0.84;
const T_SLIDE = 0.8;
const T_CHASE = 1.0;
const T_DIVE = 1.05;
const T_LASH = 1.22;
const T_FLING = 1.3;
/** Stage A's halftone band (the dev probe measures the share of the frame inside it: <= 25 %). */
const TONE_BAND = 0.1;

// ---------------------------------------------------------------- the world

/** No.7's art scale (196 px standing) and the ground line (the meeting point's plane). */
const S = 2;
const GY = 318;
/** Eye level: the vanishing line of the pinhole (= the backdrop's far-touchline horizon, so the stands sit on it). */
const HY = FIELD.horizon;
/** World px per field px on the meeting point's plane (109 px per metre: the crossbar stands 266 px at zoom 1). */
const PXM = 10.9;
/** Main-plane world x of the meeting point. */
const MX = 400;
/** The lens's field depth (z): 16 m off the meeting point's plane. */
const CAMZ = 456;
const D0 = CAMZ - LAYOUT.target.z;
/** Scale of a field depth z relative to the meeting point's plane (1 there, < 1 deeper). */
const kOf = (z: number) => D0 / Math.max(8, CAMZ - z);
/** Field (x, h) -> main-plane world (x, y). */
const mainXY = (x: number, h: number): [number, number] => [MX + (x - LAYOUT.target.x) * PXM, GY - h * PXM];
/** The meeting point: the ball's centre at contact (0.9 m up). */
const M = mainXY(LAYOUT.target.x, LAYOUT.target.h);
/** The ball: render radius 8 at D = S (16 world px), with jade seams. */
const BR = 8;
const BALL_R = BR * S;
/** From the forehead to the ball's centre at contact (the brow-front point). */
const HIT_DIR: [number, number] = [0.8, -0.6];
/** No.7's forehead at contact. */
const FH_C: [number, number] = [M[0] - HIT_DIR[0] * BALL_R, M[1] - HIT_DIR[1] * BALL_R];
/** The squashed ball's centre on the forehead (sx 0.6 across the hit: pressed onto the brow). */
const SQ_C: [number, number] = [FH_C[0] + HIT_DIR[0] * BALL_R * 0.62, FH_C[1] + HIT_DIR[1] * BALL_R * 0.62];
/** The shaft (the arc's falling limb) leaves the ball up and to the left, curving toward the apex. */
const SHAFT_DIR: [number, number] = (() => {
  const l = Math.hypot(0.42, 1);
  return [-0.42 / l, -1 / l];
})();
const SHAFT_N: [number, number] = [SHAFT_DIR[1], -SHAFT_DIR[0]]; // left-down normal (the side the limb curves to)

/** The bowstring in field space: target -> finish (the far top corner). */
const T3 = LAYOUT.target;
const F3 = LAYOUT.finish;
function line3(s: number): { x: number; z: number; h: number } {
  return { x: lerp(T3.x, F3.x, s), z: lerp(T3.z, F3.z, s), h: lerp(T3.h, F3.h, s) };
}

// ---------------------------------------------------------------- simulated time (the warp, integrated)

const W8 = WARP[8];
/** Simulation seconds elapsed by shot time t (the slow motion is baked into every key below). */
function sim(t: number): number {
  let s = t;
  for (const [a, l, r] of W8) s += (r - 1) * clamp(t - a, 0, l);
  return s;
}
const SIG_HIT = sim(T_HIT);
const SIG_REL = sim(T_REL);
const SIG_END = sim(DUR);

/** Monotone cubic (Fritsch-Carlson) through sorted (x, y) keys. */
function monotone(k: readonly (readonly [number, number])[], x: number): number {
  const n = k.length;
  if (x <= k[0][0]) return k[0][1];
  if (x >= k[n - 1][0]) return k[n - 1][1];
  let i = 0;
  while (i < n - 2 && x > k[i + 1][0]) i++;
  const d = (j: number) => (k[j + 1][1] - k[j][1]) / (k[j + 1][0] - k[j][0]);
  const m = (j: number) => {
    if (j === 0) return d(0);
    if (j === n - 1) return d(n - 2);
    const a = d(j - 1), b = d(j);
    return a * b <= 0 ? 0 : (2 * a * b) / (a + b);
  };
  const [x0, y0] = k[i], [x1, y1] = k[i + 1];
  const h = x1 - x0, s = (x - x0) / h, s2 = s * s, s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * y0 + (s3 - 2 * s2 + s) * h * m(i) + (-2 * s3 + 3 * s2) * y1 + (s3 - s2) * h * m(i + 1);
}

/**
 * The bead's position on the bowstring (0 at the forehead -> 1 at the far top corner): keyed on the simulated time
 * since the release, front-loaded (it rockets off the forehead, then the slow motion of the keeper's beat holds it).
 * Lands on the corner exactly at the cut.
 */
const BEAD_KEYS: readonly (readonly [number, number])[] = [[0, 0], [0.065, 0.06], [0.316, 0.43], [0.74, 0.75], [1, 1]];
function beadS(t: number): number {
  if (t < T_REL) return 0;
  return clamp(monotone(BEAD_KEYS, (sim(t) - SIG_REL) / (SIG_END - SIG_REL)));
}

// ---------------------------------------------------------------- the view (a pitch-only pinhole with lens shift)

/** vx = the lens's main-plane x (parallax), (px, py) = the screen point of (vx, eye level), z = zoom. */
interface View {
  vx: number;
  px: number;
  py: number;
  z: number;
}
/** The main-plane point that projects like (X, Y) at depth scale k (draw it in the main layer at size x k). */
function eq(v: View, X: number, Y: number, k: number): [number, number] {
  return [v.vx + (X - v.vx) * k, HY + (Y - HY) * k];
}
function scr(v: View, X: number, Y: number, k = 1): [number, number] {
  return [v.px + (X - v.vx) * k * v.z, v.py + (Y - HY) * k * v.z];
}
/** A field point (x, z, h) as its main-plane equivalent and its depth scale. */
function field(v: View, x: number, z: number, h: number): { q: [number, number]; k: number } {
  const k = kOf(z);
  const [X, Y] = mainXY(x, h);
  return { q: eq(v, X, Y, k), k };
}
/** The main layer: world = the meeting point's plane. */
function mainLayer(env: Env, v: View) {
  zoomAbout(env.cam, v.vx, HY, v.px, v.py, v.z);
  env.world();
}

/** The bead (ball) at s: main-plane point, depth scale. */
function beadMain(s: number): { X: number; Y: number; k: number } {
  const p = line3(s);
  const [X, Y] = mainXY(p.x, p.h);
  return { X, Y, k: kOf(p.z) };
}

/** Phase A/B: dolly with him (0-0.10), then the crash zoom onto the meeting point (inExpo) and the contact punch. */
function viewLock(t: number): View {
  const vx = M[0] - 210 + 600 * Math.min(t, T_H2);
  let sx: number, sy: number;
  if (t < T_H2) {
    sx = 420 - 720 * t;
    sy = 230;
  } else {
    const k = ease.inExpo(clamp((t - T_H2) / (T_HIT - T_H2)));
    sx = lerp(348, 300, k);
    sy = lerp(230, 190, k);
  }
  // A steady push through the flight, then the crash in the last frames (inExpo) onto the meeting.
  const push = 0.22 * ease.inOutSine(clamp((t - 0.04) / (T_HIT - 0.04)));
  const z = keys([[T_H2, 1.2], [T_HIT, 2.4 - 0.22, 'inExpo']], t) + push + punch(t, T_HIT, 0.18, 0.05, 0.3) + 0.05 * ease.inOutSine(clamp((t - 0.43) / 0.2));
  return { vx, px: sx - (M[0] - vx) * z, py: sy - (M[1] - HY) * z, z };
}
/** The chase: the bead held at (300, 170), the lens trailing it by LAG (so the goal mouth opens on the right). */
const LAG = 260;
function chaseZoom(t: number) {
  return t < T_CHASE ? lerp(1.12, 1.0, ease.outCubic(clamp((t - T_WHIP_END) / (T_CHASE - T_WHIP_END)))) : 1 + 0.3 * ease.outCubic(clamp((t - T_CHASE) / (DUR - T_CHASE)));
}
function viewChase(t: number, sx = 300, sy = 170, zz = chaseZoom(t)): View {
  const b = beadMain(beadS(t));
  const vx = b.X - LAG;
  return { vx, px: sx - (b.X - vx) * b.k * zz, py: sy - (b.Y - HY) * b.k * zz, z: zz };
}
/** The camera at t: lock -> (the whip-pan blends the lens onto the bead, the bead sharp in the streak's hole) -> chase. */
function viewAt(t: number): View {
  if (t < T_WHIP) return viewLock(t);
  if (t >= T_WHIP_END) return viewChase(t);
  const w = ease.inOutQuad((t - T_WHIP) / (T_WHIP_END - T_WHIP));
  const A = viewLock(t);
  const b = beadMain(beadS(t));
  const [ax, ay] = scr(A, b.X, b.Y, b.k);
  const zC = chaseZoom(T_WHIP_END);
  const z = Math.exp(lerp(Math.log(A.z), Math.log(zC), ease.inOutSine((t - T_WHIP) / (T_WHIP_END - T_WHIP))));
  const vx = lerp(A.vx, b.X - LAG, w);
  const sx = lerp(ax, 300, w), sy = lerp(ay, 170, w);
  return { vx, px: sx - (b.X - vx) * b.k * z, py: sy - (b.Y - HY) * b.k * z, z };
}

// ---------------------------------------------------------------- No.7

/** The forehead path into the meeting (head-locked: every airborne frame hangs on it, so H1b -> H2 swings the legs). */
function foreheadAt(t: number): [number, number] {
  const d = Math.max(0, SIG_HIT - sim(Math.min(t, T_HIT)));
  const u = d / SIG_HIT;
  return [FH_C[0] - 650 * d, FH_C[1] - 58 * Math.pow(u, 1.4)];
}
/** No.7 after contact: H3 holds on the meeting, then the pelvis drops forward onto the turf and the belly slide. */
function pelvisAfter(t: number): [number, number] {
  const k3: No7Key = 'Header.H3';
  const [fx, fy] = no7Anchor(k3, 'forehead'), [qx, qy] = no7Anchor(k3, 'pelvis');
  const p0: [number, number] = [FH_C[0] - (fx - qx) * S, FH_C[1] - (fy - qy) * S];
  const d = Math.max(0, sim(t) - SIG_REL);
  // Forward momentum (decelerating with turf friction once down), a fall onto the turf by the belly slide at 0.80.
  const dSlide = sim(T_SLIDE) - SIG_REL;
  const hy = no7Anchor('Header.H5', 'pelvis')[1], cy = no7Anchor('Header.H5', 'contact')[1];
  const yDown = GY - (cy - hy) * S;
  const fall = clamp(d / dSlide);
  const y = lerp(p0[1], yDown, fall * fall);
  const x = p0[0] + (d < dSlide ? 560 * d : 560 * dSlide + 420 * (1 - Math.exp(-(d - dSlide) / 0.25)) * 0.25);
  return [x, y];
}
interface Seven {
  key: No7Key;
  x: number;
  y: number;
  pivot: [number, number];
}
function sevenAt(t: number): Seven {
  const key = seqAt(SEQ, t);
  if (t < T_REL) {
    const [fx, fy] = foreheadAt(t);
    return { key, x: fx, y: fy, pivot: no7Anchor(key, 'forehead') };
  }
  const [px, py] = pelvisAfter(t);
  // H3 / H4 hang on the pelvis; H5 on the pelvis too (its contact row lands on the turf by construction).
  return { key, x: px, y: py, pivot: no7Anchor(key, 'pelvis') };
}
function drawSeven(env: Env, s: Seven, img?: HTMLCanvasElement | null, dx = 0, dy = 0, alpha = 1) {
  const f = no7(s.key);
  if (!f) return;
  drawAnim(env.ctx, f.a, img ?? null, f.i, s.x + dx, s.y + dy, S, { pivot: s.pivot, alpha });
}
/** A frame-space point of the current frame in the world. */
function sevenPt(s: Seven, p: [number, number]): [number, number] {
  return [s.x + (p[0] - s.pivot[0]) * S, s.y + (p[1] - s.pivot[1]) * S];
}

// ---------------------------------------------------------------- the ball before contact (falling down its shaft)

/**
 * The falling ball's draw scale: its on-screen size grows monotonically from 48 px (picking up shot 7's big needle
 * point across the cut) to its true 77 px on his forehead at the crash's end (D = S there).
 */
function ballPreD(t: number): number {
  const z = viewLock(Math.min(t, T_HIT)).z;
  const diam = lerp(48, BALL_R * 2 * 2.4, ease.inQuad(clamp(t / T_HIT)));
  return Math.max(S, diam / (BR * 2 * z));
}
function ballFall(t: number): [number, number] {
  const d = Math.max(0, SIG_HIT - sim(Math.min(t, T_HIT)));
  return [M[0] + SHAFT_DIR[0] * 400 * d, M[1] + SHAFT_DIR[1] * 400 * d];
}

/** The shaft from the ball (last point) back up the limb (first point), curving toward the apex; `taut` 0..1. */
function shaftPts(b: [number, number], taut: number, t: number): TrailPt[] {
  const out: TrailPt[] = [];
  const L = 1100, N = 40;
  for (let i = N; i >= 0; i--) {
    const d = (i / N) * L;
    const bend = (1 - taut) * 0.00042 * d * d + taut * 0.00008 * d * d;
    // A small travelling ripple while it whips taut.
    const rip = taut > 0 && taut < 1 ? 6 * Math.sin(d * 0.02 - t * 60) * Math.sin(Math.PI * taut) * (d / L) : 0;
    out.push({ x: b[0] + SHAFT_DIR[0] * d + SHAFT_N[0] * (bend + rip), y: b[1] + SHAFT_DIR[1] * d + SHAFT_N[1] * (bend + rip) });
  }
  return out;
}

// ---------------------------------------------------------------- the keeper

const K_SIL: PuppetSil = { fill: [6, 18, 14], rim: [150, 255, 200], rim2: [47, 224, 138], lx: -0.5, ly: -0.85 };
const K_SIL_DIM: PuppetSil = { fill: [8, 20, 16], rim: [70, 96, 86], rim2: [30, 48, 42], lx: -0.5, ly: -0.8 };
/** The lashed keeper (plucked), with his reaching (near) arm kept up for the loop. */
const KEEPER_LASH: Pose = POSES.plucked;
const KEEPER_RUN: Pose = P({ ...POSES.gkReady, torso: 30 * (Math.PI / 180) });
/** The keeper's depth (field z) while he dives across the bowstring, and his puppet scale. */
const K_Z = 252;
const K_D = 1.95;
/** The dive's body angle (clockwise, facing west): the glove up-left, the body and legs trailing down-right. */
const K_ROT = 0.62;
/** Where on the bowstring his glove reaches (s): the line just behind the ball by the lash. */
const S_LASH = 0.56;

interface Keeper {
  pose: Pose;
  name: string;
  /** Main-plane hip (already at his depth: eq'd). */
  x: number;
  y: number;
  D: number;
  rot: number;
  lit: number;
  facing: 1 | -1;
}
/** The reaching hand in puppet units (facing west), for a pose. */
function handOf(p: Pose): [number, number] {
  const j = joints(p);
  return j.handN[1] < j.handF[1] ? j.handN : j.handF;
}
function rotate(p: [number, number], a: number): [number, number] {
  const c = Math.cos(a), s = Math.sin(a);
  return [p[0] * c - p[1] * s, p[0] * s + p[1] * c];
}
/** The hip that puts `pose`'s reaching hand on L at rotation rot (facing west). */
function hipFor(L: [number, number], pose: Pose, rot: number, D: number): [number, number] {
  const h = handOf(pose);
  const r = rotate([-h[0] * D, h[1] * D], rot);
  return [L[0] - r[0], L[1] - r[1]];
}
/** The lash point on the bowstring (main-plane equivalent in view v). */
function lashPoint(v: View): [number, number] {
  const b = beadMain(S_LASH);
  return eq(v, b.X, b.Y, b.k);
}
function keeperAt(v: View, t: number): Keeper | null {
  if (t < T_CHASE - 0.06) return null;
  const k = kOf(K_Z);
  const D = K_D * k;
  const L = lashPoint(v);
  // At the lash his reaching glove sits on the line, his body angled down-right under it (facing west).
  const hipL = hipFor(L, POSES.gkDive, K_ROT, D);
  if (t < T_DIVE) {
    // Off his feet at the near post, low, springing at the line.
    const u = clamp((t - (T_CHASE - 0.06)) / (T_DIVE - T_CHASE + 0.06));
    const g: [number, number] = [L[0] + 150 + 40 * (1 - u), L[1] + 80 + 40 * (1 - u)];
    const hip = hipFor(g, POSES.gkDive, 0.3, D);
    return { pose: KEEPER_RUN, name: '8-k-run', x: hip[0] + 10, y: hip[1] + 18, D, rot: 0.1, lit: 0.3, facing: -1 };
  }
  if (t < T_LASH) {
    // The dive: across and up, full stretch; the glove sweeps under the bead's path (well below it) and only rises to
    // the line behind it, so the reach never reads as a near-miss (and it is never frozen).
    const u = clamp((sim(t) - sim(T_DIVE)) / (sim(T_LASH) - sim(T_DIVE)));
    const g: [number, number] = [L[0] + 150 * (1 - ease.outCubic(u)), L[1] + 72 * (1 - ease.inCubic(u)) + 10 * Math.sin(Math.PI * u)];
    const rot = lerp(0.45, K_ROT, ease.outQuad(u));
    const hip = hipFor(g, POSES.gkDive, rot, D);
    return { pose: POSES.gkDive, name: '8-k-dive', x: hip[0], y: hip[1], D, rot, lit: 0.4, facing: -1 };
  }
  if (t < T_FLING) {
    // The bite: held on the line, the arm hauled down a little by the loop.
    const u = clamp((t - T_LASH) / (T_FLING - T_LASH));
    return { pose: POSES.gkDive, name: '8-k-dive', x: hipL[0] + 2 * u, y: hipL[1] + 6 * ease.outQuad(u), D, rot: K_ROT - 0.05 * u, lit: 0.5, facing: -1 };
  }
  // Plucked away: flung down toward the turf at the near post, spinning 1.5 turns by the cut (and still turning).
  const tau = t - T_FLING;
  const rot = K_ROT + 3 * Math.PI * (tau / (DUR - T_FLING)) * (1 + 0.25 * Math.exp(-tau / 0.05));
  return { pose: KEEPER_LASH, name: '8-k-lash', x: hipL[0] + 560 * tau + 40 * (1 - Math.exp(-tau / 0.04)), y: hipL[1] + 6 + 60 * tau + 200 * tau * tau, D, rot, lit: 0.55, facing: -1 };
}
/** The angle of his reaching forearm on screen (shoulder -> hand), for the loop's coil. */
function armAng(kp: Keeper): number {
  const j = joints(kp.pose);
  const h = handOf(kp.pose);
  const d = rotate([(h[0] - j.neck[0]) * kp.facing, h[1] - j.neck[1]], kp.rot);
  return Math.atan2(d[1], d[0]);
}
/** The keeper's reaching hand in the main plane (for the loop). */
function keeperHand(kp: Keeper): [number, number] {
  const h = handOf(kp.pose);
  const r = rotate([h[0] * kp.facing * kp.D, h[1] * kp.D], kp.rot);
  return [kp.x + r[0], kp.y + r[1]];
}

// ---------------------------------------------------------------- module state (reset in init)

let spin = new BallSpin();
const rings = new StitchRings();
const fired = { hit: false, rel: false, lash: false, fling: false };
let slideAcc = 0;

// ---------------------------------------------------------------- drawing helpers

/**
 * Stack C's sparks and light-stitches: like jadeSparks / stitchBurst, but each starts 14-110 px out along its own
 * flight, so the 0.03 hit-stop freezes them as a starburst round the forehead instead of a white pile on the ball.
 */
function starburst(env: Env, x: number, y: number, n: number, speed: number, cone: number, dir: number, kind: PK) {
  const rng = env.rng;
  for (let i = 0; i < n; i++) {
    const a = dir + rng.range(-cone / 2, cone / 2);
    const sp = speed * rng.range(0.3, 1);
    const r = rng.range(14, 110) * (0.4 + 0.6 * sp / speed);
    const c = Math.cos(a), s = Math.sin(a);
    if (kind === PK.Stitch)
      env.parts.spawn({ kind, x: x + c * r, y: y + s * r, vx: c * sp, vy: s * sp, drag: 2.5, max: rng.range(0.3, 0.7), s0: rng.range(4, 6), s1: 3, ramp: 'jade', r0: 0.1, r1: 0.9, a0: 1, a1: 0, add: false });
    else
      env.parts.spawn({ kind, x: x + c * r, y: y + s * r, vx: c * sp, vy: s * sp, drag: 3.5, ay: 200, max: rng.range(0.25, 0.7), s0: rng.range(1, 2.5), s1: 0.4, ramp: 'jade', r0: 0, r1: 1, k: 1.2 });
  }
}

const hash01 = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/** Ink focus lines with jade (stage B: pearl) tips, converging on (cx, cy). Screen space; flicker from rng. */
function inkFocus(ctx: CanvasRenderingContext2D, rng: Rng, cx: number, cy: number, rIn: number, rOut: number, n: number, a: number, pearl: boolean) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = clamp(a);
  const lines: [number, number, number][] = [];
  for (let i = 0; i < n; i++) lines.push([rng.next() * TAU, rIn * (0.75 + rng.next() * 0.7), (0.25 + rng.next() * 0.75) * 0.012]);
  ctx.fillStyle = HEX.ink;
  ctx.beginPath();
  for (const [an, r0, w] of lines) {
    ctx.moveTo(cx + Math.cos(an) * r0, cy + Math.sin(an) * r0);
    ctx.lineTo(cx + Math.cos(an - w) * rOut, cy + Math.sin(an - w) * rOut);
    ctx.lineTo(cx + Math.cos(an + w) * rOut, cy + Math.sin(an + w) * rOut);
    ctx.closePath();
  }
  ctx.fill();
  ctx.fillStyle = pearl ? HEX.pearl : HEX.jade;
  ctx.beginPath();
  for (const [an, r0, w] of lines) {
    const r1 = r0 + (rOut - r0) * 0.45, ww = w * 0.45;
    ctx.moveTo(cx + Math.cos(an) * r0, cy + Math.sin(an) * r0);
    ctx.lineTo(cx + Math.cos(an - ww) * r1, cy + Math.sin(an - ww) * r1);
    ctx.lineTo(cx + Math.cos(an + ww) * r1, cy + Math.sin(an + ww) * r1);
    ctx.closePath();
  }
  ctx.fill();
  ctx.restore();
}

/** Horizontal speed streaks (screen space): ink bars and thin mint / jade threads rushing left. */
function speedStreaks(ctx: CanvasRenderingContext2D, rng: Rng, a: number, n = 40) {
  if (a <= 0) return;
  ctx.save();
  for (let i = 0; i < n; i++) {
    const y = 6 + rng.next() * 348, x = rng.next() * VW - 80, l = 70 + rng.next() * 240;
    const lit = rng.next() < 0.45;
    ctx.globalAlpha = clamp(a * (lit ? 0.5 : 0.65) * (0.4 + 0.6 * rng.next()));
    ctx.fillStyle = lit ? (rng.next() < 0.5 ? HEX.mint : HEX.jade) : HEX.ink;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(l), lit ? 1 : 2 + (rng.next() < 0.3 ? 1 : 0));
  }
  ctx.restore();
}

/** A JADE_FLARE no wider than w px: a short horizontal streak, a pearl core and a soft jade halo (additive). */
function jadeFlare(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, a: number) {
  if (a <= 0 || w <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(JADE_FLARE), x, y, w / 10, 0.85 * a, 5, 0.22);
  drawGlow(ctx, glowOf(JADE_FLARE), x, y, w * 0.3, 0.45 * a);
  drawGlow(ctx, glowOf(PAL.pearl), x, y, w * 0.09, a);
  ctx.restore();
}

/** A lamp head over the ink: the 5 x 4 grid lit white -> jade-white by k, a soft glare, a jade halo. Screen space. */
function lampOverInk(ctx: CanvasRenderingContext2D, lx: number, ly: number, s: number, k: number) {
  const col = mix(PAL.pearl, LAMP_JADE, k);
  ctx.save();
  ctx.fillStyle = `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) ctx.fillRect(Math.round(lx + (-15 + c * 7) * s), Math.round(ly + (-9 + r * 6) * s), Math.max(1, Math.round(5 * s)), Math.max(1, Math.round(4 * s)));
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(col), lx, ly, 22 * s, 0.4, 2.6, 0.5);
  if (k > 0) drawGlow(ctx, glowOf(PAL.jade), lx, ly, 36 * s, 0.45 * k, 1.6, 0.9);
  ctx.restore();
}

/**
 * The bowstring spear between two main-plane points, tapering with depth (w0 at the near end, w1 at the far end):
 * ink under-stroke, emerald halo (additive), jade body, mint inner, pearl core; `wave` px standing wave with `nodes`;
 * `dip` an extra displacement bump (the lash) {s, amp, w}. Returns the drawn points (the bead rides them).
 */
function spear(
  ctx: CanvasRenderingContext2D, a: [number, number], b: [number, number], w0: number, w1: number, wave: number, phase: number,
  nodes: number, upto = 1, dip?: { s: number; amp: number; w: number }, alpha = 1,
): TrailPt[] {
  const N = 64;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L; // the normal (ny > 0: downward for a rising spear)
  const pts: TrailPt[] = [];
  for (let i = 0; i <= N; i++) {
    const u = (i / N) * upto;
    let d = 0;
    if (wave) {
      const seg = 1 / (nodes + 1);
      d += wave * Math.sin(Math.PI * (u / seg)) * Math.cos(phase);
    }
    if (dip) d += dip.amp * Math.exp(-(((u - dip.s) / dip.w) ** 2));
    pts.push({ x: a[0] + dx * u + nx * d, y: a[1] + dy * u + ny * d });
  }
  const wEnd = lerp(w0, w1, upto);
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ribbon(ctx, pts, w0 + 8, wEnd + 8, HEX.ink, alpha);
  ctx.globalCompositeOperation = 'lighter';
  ribbon(ctx, pts, w0 * 3.7, wEnd * 3.7, HEX.emerald, 0.36 * alpha);
  ribbon(ctx, pts, w0 * 1.8, wEnd * 1.8, HEX.jade, 0.22 * alpha);
  ctx.globalCompositeOperation = 'source-over';
  ribbon(ctx, pts, w0, wEnd, HEX.jade, alpha);
  ribbon(ctx, pts, w0 * 0.55, wEnd * 0.55, HEX.mint, alpha);
  ribbon(ctx, pts, Math.max(2, w0 * 0.24), Math.max(2, wEnd * 0.24), HEX.pearl, alpha);
  ctx.restore();
  return pts;
}

/** Dry-brush bristles and ink cross-stitches along a spear's points (they make it a brush stroke, not a tube). */
function spearDetail(ctx: CanvasRenderingContext2D, pts: readonly TrailPt[], w0: number, w1: number, t: number, alpha = 1) {
  const s = arcLengths(pts), L = s[s.length - 1];
  if (L < 10) return;
  ctx.save();
  ctx.lineWidth = 1;
  for (const side of [-1, 1])
    for (let b = 0; b < 6; b++) {
      const off = 0.5 - (b / 6) * 0.22;
      ctx.strokeStyle = b % 2 ? HEX.mint : HEX.jade;
      ctx.globalAlpha = 0.55 * alpha;
      ctx.beginPath();
      let on = false;
      for (let d = 0; d <= L; d += 5) {
        const q = pointAt(pts as TrailPt[], s, d);
        const ww = lerp(w0, w1, d / L) * off * side;
        const gap = hash01(b * 31 + side * 7 + Math.floor((d + t * 40) / 11)) < 0.3;
        const x = q.x - q.ty * ww, y = q.y + q.tx * ww;
        if (gap) on = false;
        else if (!on) {
          ctx.moveTo(x, y);
          on = true;
        } else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  ctx.strokeStyle = HEX.ink;
  ctx.globalAlpha = 0.8 * alpha;
  for (let d = 40; d < L - 10; d += 80) {
    const q = pointAt(pts as TrailPt[], s, d);
    const ww = lerp(w0, w1, d / L) * 0.22;
    ctx.lineWidth = Math.max(1.5, ww * 0.35);
    ctx.beginPath();
    ctx.moveTo(q.x - (q.tx + q.ty) * ww, q.y - (q.ty - q.tx) * ww);
    ctx.lineTo(q.x + (q.tx + q.ty) * ww, q.y + (q.ty - q.tx) * ww);
    ctx.moveTo(q.x - (q.tx - q.ty) * ww, q.y - (q.ty + q.tx) * ww);
    ctx.lineTo(q.x + (q.tx - q.ty) * ww, q.y + (q.ty + q.tx) * ww);
    ctx.stroke();
  }
  // Travelling pearl glints toward the far end (the string still singing).
  ctx.globalCompositeOperation = 'lighter';
  for (let g = 0; g < 4; g++) {
    const d = (((t * 520 + g * L * 0.25) % L) + L) % L;
    const q = pointAt(pts as TrailPt[], s, d);
    drawGlow(ctx, glowOf(PAL.pearl), q.x, q.y, 3 + lerp(w0, w1, d / L) * 0.3, 0.6 * alpha);
  }
  ctx.restore();
}

/** The jade loop round a forearm: two tilted ellipses with an ink under-stroke and a pearl core. */
function jadeLoop(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, ang: number, a: number, bite: number) {
  if (a <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  for (const [ox, rr] of [[-r * 0.16, 1], [r * 0.16, 0.9]] as const) {
    const rx = r * 0.36 * rr * (1 - 0.2 * bite), ry = r * rr * (1 - 0.32 * bite);
    ctx.globalAlpha = clamp(a);
    ctx.strokeStyle = HEX.ink;
    ctx.lineWidth = Math.max(2, r * 0.32);
    ctx.beginPath();
    ctx.ellipse(ox, 0, rx, ry, 0, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = HEX.jade;
    ctx.lineWidth = Math.max(1.5, r * 0.2);
    ctx.stroke();
    ctx.strokeStyle = HEX.pearl;
    ctx.lineWidth = Math.max(1, r * 0.07);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.jade), 0, 0, r * 2.2, 0.45 * a);
  ctx.restore();
}

// ---------------------------------------------------------------- the pitch, the goal and the stadium

const TOWER_X = [120, 620, 1120, 1620];
const kFT = kOf(FIELD.horizon);

/** The perspective turf (mowing stripes and the box lines), drawn in the main layer before the ink. */
function drawTurf(ctx: CanvasRenderingContext2D, v: View) {
  const zFar = FIELD.horizon, zNear = 430;
  const yFar = HY + (GY - HY) * kFT;
  ctx.fillStyle = '#26743a';
  ctx.fillRect(v.vx - 4000, yFar, 8000, 3000);
  for (let x0 = 940; x0 < 1340; x0 += 50) {
    if (((x0 - 940) / 50) % 2) continue;
    const a = field(v, x0, zFar, 0).q, b = field(v, x0 + 50, zFar, 0).q, c = field(v, x0 + 50, zNear, 0).q, d = field(v, x0, zNear, 0).q;
    ctx.fillStyle = '#2e8442';
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.lineTo(c[0], c[1]);
    ctx.lineTo(d[0], d[1]);
    ctx.closePath();
    ctx.fill();
  }
  ctx.lineCap = 'butt';
  const seg = (x0: number, z0: number, x1: number, z1: number) => {
    const p = field(v, x0, z0, 0), q = field(v, x1, z1, 0);
    ctx.strokeStyle = 'rgba(236,242,232,0.85)';
    ctx.lineWidth = 2.2 * Math.max(p.k, q.k) * 0.6 + 1.2 * Math.min(p.k, q.k);
    ctx.beginPath();
    ctx.moveTo(p.q[0], p.q[1]);
    ctx.lineTo(q.q[0], q.q[1]);
    ctx.stroke();
  };
  // The goal line, the six-yard box, the penalty spot (the box edge is behind him).
  seg(1180, zFar, 1180, zNear);
  seg(1125, 172, 1125, 344);
  seg(1125, 344, 1180, 344);
  seg(1125, 172, 1180, 172);
  seg(1015, zFar, 1015, zNear);
  const ps = field(v, 1070, 257, 0);
  ctx.fillStyle = 'rgba(236,242,232,0.85)';
  ctx.beginPath();
  ctx.ellipse(ps.q[0], ps.q[1], 6 * ps.k, 2 * ps.k, 0, 0, TAU);
  ctx.fill();
}

const GOAL = { x: 1180, back: 1202, far: 214, near: 300, bar: 24.4, backTop: 21 } as const;

/** The net (thin strands, graded with the world). */
function drawNet(ctx: CanvasRenderingContext2D, v: View, color = 'rgba(214,226,222,0.55)', width = 1) {
  const P = (x: number, z: number, h: number) => field(v, x, z, h).q;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  const quad = (fn: (u: number, w: number) => [number, number], nu: number, nw: number) => {
    for (let i = 0; i <= nu; i++) {
      ctx.beginPath();
      for (let j = 0; j <= nw; j++) {
        const p = fn(i / nu, j / nw);
        j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
      }
      ctx.stroke();
    }
    for (let j = 0; j <= nw; j++) {
      ctx.beginPath();
      for (let i = 0; i <= nu; i++) {
        const p = fn(i / nu, j / nw);
        i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
      }
      ctx.stroke();
    }
  };
  // Far side panel, back panel, roof, near side panel (back to front).
  quad((u, w) => P(lerp(GOAL.x, GOAL.back, u), GOAL.far, lerp(lerp(GOAL.bar, GOAL.backTop, u), 0, w)), 3, 10);
  quad((u, w) => P(GOAL.back, lerp(GOAL.far, GOAL.near, u), lerp(GOAL.backTop, 0, w)), 12, 10);
  quad((u, w) => P(lerp(GOAL.x, GOAL.back, w), lerp(GOAL.far, GOAL.near, u), lerp(GOAL.bar, GOAL.backTop, w)), 12, 3);
  quad((u, w) => P(lerp(GOAL.x, GOAL.back, u), GOAL.near, lerp(lerp(GOAL.bar, GOAL.backTop, u), 0, w)), 3, 10);
  ctx.restore();
}

/** The goal frame over the ink: ink under-stroke, a pearl-grey tube, jade where the bead's light reaches it. */
function drawFrame(ctx: CanvasRenderingContext2D, v: View, glowAt: [number, number] | null, glowK: number) {
  const P = (x: number, z: number, h: number) => field(v, x, z, h);
  const tube = (a: ReturnType<typeof P>, b: ReturnType<typeof P>, back = false) => {
    const w = 13 * (a.k + b.k) * 0.5 * (back ? 0.5 : 1);
    ctx.lineCap = 'round';
    ctx.strokeStyle = HEX.ink;
    ctx.lineWidth = w + 5;
    ctx.beginPath();
    ctx.moveTo(a.q[0], a.q[1]);
    ctx.lineTo(b.q[0], b.q[1]);
    ctx.stroke();
    ctx.strokeStyle = back ? '#3c5a50' : '#a9b9b2';
    ctx.lineWidth = w;
    ctx.stroke();
    if (!back) {
      ctx.strokeStyle = '#e4ece6';
      ctx.lineWidth = Math.max(1, w * 0.3);
      ctx.beginPath();
      ctx.moveTo(a.q[0] - w * 0.18, a.q[1] - w * 0.18);
      ctx.lineTo(b.q[0] - w * 0.18, b.q[1] - w * 0.18);
      ctx.stroke();
    }
  };
  ctx.save();
  // The back stanchions (thin, dark), then the far post, the crossbar, the near post.
  tube(P(GOAL.back, GOAL.far, 0), P(GOAL.back, GOAL.far, GOAL.backTop), true);
  tube(P(GOAL.back, GOAL.near, 0), P(GOAL.back, GOAL.near, GOAL.backTop), true);
  tube(P(GOAL.x, GOAL.far, 0), P(GOAL.x, GOAL.far, GOAL.bar));
  tube(P(GOAL.x, GOAL.far, GOAL.bar), P(GOAL.x, GOAL.near, GOAL.bar));
  tube(P(GOAL.x, GOAL.near, 0), P(GOAL.x, GOAL.near, GOAL.bar));
  if (glowAt && glowK > 0) {
    // The bead lights the frame round the far top corner (additive, a smooth function of its distance).
    ctx.globalCompositeOperation = 'lighter';
    const c = P(GOAL.x, GOAL.far, GOAL.bar);
    const dd = Math.hypot(c.q[0] - glowAt[0], c.q[1] - glowAt[1]);
    const g = glowK * clamp(1 - dd / 260);
    if (g > 0) {
      drawGlow(ctx, glowOf(PAL.jade), c.q[0], c.q[1], 70, 0.55 * g);
      drawGlow(ctx, glowOf(PAL.mint), c.q[0], c.q[1], 26, 0.6 * g);
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the shot

export const shotHeader: Shot = {
  name: META.name,
  dur: META.dur,
  seed: META.seed,
  rate: RATE[8],
  cues: [
    { at: 0, fn: (e) => { e.sfx.scuff(0.3); e.sfx.whoosh(0.3, 400, 2000, 0.4); } },
    { at: T_REEL, fn: (e) => e.sfx.zip(0.14, 800, 6000, 0.45) },
    {
      at: T_HIT,
      fn: (e) => {
        e.sfx.kick(1.4);
        e.sfx.boom(1.4);
        e.sfx.crack(1.0);
        e.sfx.twang(1.0);
        e.sfx.strum([293.66, 369.99, 440, 587.33, 739.99, 880], 0.012, 1.6, 0.4);
        e.sfx.pluck(1174.66, 1.8, 0.6);
      },
    },
    { at: T_REL, fn: (e) => e.sfx.whoosh(0.5, 3000, 300, 0.5) },
    { at: T_WHIP, fn: (e) => { e.sfx.roar(1.6, 1.0); e.sfx.crowd(2.4, 0.6); } },
    { at: T_SLIDE, fn: (e) => e.sfx.scuff(0.35) },
    {
      at: T_LASH,
      fn: (e) => {
        e.sfx.twang(0.9);
        e.sfx.pluck(110, 1.5, 0.5);
        e.sfx.crack(1.0);
        e.sfx.boom(0.9);
      },
    },
    { at: T_FLING, fn: (e) => e.sfx.whoosh(0.4, 1200, 300, 0.4) },
  ],
  prepare(env) {
    warmMeridian(env);
    // Warm the keeper's puppet caches (silhouette and lit) and No.7's jade / ink tints, so the first play has no hitch.
    const ctx = env.ctx;
    ctx.save();
    ctx.globalAlpha = 0;
    for (const [name, pose] of [['8-k-run', KEEPER_RUN], ['8-k-dive', POSES.gkDive], ['8-k-lash', KEEPER_LASH], ['8-k-far', POSES.gkReady]] as const) {
      PUPPETS.draw(ctx, name, KEEPER_KIT, pose, 1, -1, 0, 0, 1, 0.4, K_SIL);
      PUPPETS.draw(ctx, name, KEEPER_KIT, pose, 1, -1, 0, 0, 1, 0, K_SIL_DIM);
    }
    ctx.restore();
    for (const [, k] of SEQ) {
      const f = no7(k);
      if (f) {
        f.a.tinted(f.i, PAL.jade);
        f.a.tinted(f.i, PAL.ink);
      }
    }
  },
  init(env) {
    env.sfx.clearBus();
    env.cam.set(VW / 2, VH / 2, 1, 0);
    env.cam.shakeRoll = 0.015;
    env.cam.shakeAmp = 12;
    spin = new BallSpin();
    resetSpin(spin);
    rings.clear();
    fired.hit = fired.rel = fired.lash = fired.fling = false;
    slideAcc = 0;
    PUPPETS.frame();
  },
  update(env, t, dt) {
    const { rng, cam } = env;
    const Pp = env.parts;
    // Spin: tumbling down the shaft, a hard topspin off the forehead, the bead spinning on its string.
    if (t < T_HIT) spin.rotate(0.3, 1, 0.2, dt * 9);
    else spin.rotate(0.2, 0.3, 1, -dt * 34);
    if (t < T_HIT) holdTrauma(cam, lerp(0.2, 0.5, t / T_HIT));

    // The flight: a few mint threads of air peeling off him, motes off the charged ball.
    if (t < T_HIT) {
      const s = sevenAt(t);
      const [hx, hy] = s.key === 'Header.H1b' ? sevenPt(s, no7Anchor(s.key, 'pelvis')) : sevenPt(s, no7Anchor(s.key, 'pelvis'));
      if (rng.next() < 0.6)
        Pp.spawn({ kind: PK.Streak, x: hx + rng.range(-60, 40), y: hy + rng.range(-40, 30), vx: -rng.range(500, 900), vy: rng.range(-20, 20), drag: 1, max: rng.range(0.15, 0.3), s0: 1, s1: 0.5, ramp: 'jade', r0: 0.2, r1: 0.9, k: 3, layer: 0 });
      if (t >= T_REEL) {
        const b = ballFall(t);
        for (let k = 0; k < 2; k++) {
          const a = rng.range(0, TAU), r = rng.range(60, 140);
          Pp.spawn({ kind: PK.Glow, x: b[0] + Math.cos(a) * r, y: b[1] + Math.sin(a) * r, vx: -Math.cos(a) * r * 5, vy: -Math.sin(a) * r * 5, drag: 0, max: 0.18, s0: rng.range(1.5, 3), s1: 0.5, ramp: 'jade', r0: 0.1, r1: 0.6, a0: 1, a1: 0.2, layer: 1 });
        }
      }
    }

    if (!fired.hit && t >= T_HIT) {
      fired.hit = true;
      cam.shakeAmp = 22;
      cam.hit(1.0);
      // Stack C: three stitched rings, sparks / stitches / ink flecks frozen by the hit-stop (rate 0.03), bursting at the
      // release; the sparks fan forward along the bowstring.
      rings.add({ x: M[0], y: M[1], t0: T_HIT, r0: 8, r1: 300, dur: 0.42, color: HEX.pearl, width: 3 });
      rings.add({ x: M[0], y: M[1], t0: T_HIT + 0.02, r0: 10, r1: 260, dur: 0.42, width: 3 });
      rings.add({ x: M[0], y: M[1], t0: T_HIT + 0.04, r0: 12, r1: 220, dur: 0.42, squash: 0.6, color: HEX.emerald, width: 3 });
      starburst(env, SQ_C[0], SQ_C[1], 50, 1300, 1.7, -0.27, PK.Streak);
      starburst(env, SQ_C[0], SQ_C[1], 30, 900, TAU, 0, PK.Streak);
      starburst(env, SQ_C[0], SQ_C[1], 40, 760, 2.3, -0.27, PK.Stitch);
      inkFlecks(env, SQ_C[0], SQ_C[1], 30, 520);
    }
    if (!fired.rel && t >= T_REL) {
      fired.rel = true;
      cam.shove(10, -3);
      // The bead leaves: light-stitches shed along the first stretch of the bowstring, a puff of pearl motes.
      for (let k = 0; k < 24; k++) {
        const u = rng.range(0, 0.12);
        const b = beadMain(u);
        const v0 = viewAt(t);
        const [x, y] = eq(v0, b.X, b.Y, b.k);
        Pp.spawn({ kind: PK.Stitch, x, y, vx: rng.range(-60, 320), vy: rng.range(-160, 160), drag: 2.5, max: rng.range(0.3, 0.6), s0: rng.range(4, 6), s1: 3, ramp: 'jade', r0: 0.1, r1: 0.9, a0: 1, a1: 0, add: false });
      }
    }
    // The bead sheds jade motes as it rides (in the main plane at its projected point).
    if (t >= T_REL) {
      const v0 = viewAt(t);
      const b = beadMain(beadS(t));
      const [x, y] = eq(v0, b.X, b.Y, b.k);
      for (let k = 0; k < 2; k++)
        Pp.spawn({ kind: PK.Glow, x: x + rng.range(-8, 8), y: y + rng.range(-8, 8), vx: rng.range(-260, -80), vy: rng.range(-50, 60), drag: 1.5, max: rng.range(0.25, 0.55), s0: rng.range(1.5, 3.5), s1: 0.5, ramp: 'jade', r0: 0.1, r1: 0.85, a0: 1, a1: 0, layer: 1 });
    }
    // The belly slide: grass blades flicking up off his chest as he skids.
    if (t >= T_SLIDE && t < 1.02) {
      const s = sevenAt(t);
      const [cx, cy] = sevenPt(s, no7Anchor('Header.H5', 'contact'));
      slideAcc += dt * 140;
      while (slideAcc >= 1) {
        slideAcc -= 1;
        Pp.spawn({ kind: PK.Blade, x: cx + rng.range(-30, 30), y: cy - 1, vx: rng.range(-60, 160), vy: -rng.range(120, 320), ay: 900, drag: 0.8, rot: rng.range(0, TAU), vrot: rng.range(-20, 20), max: rng.range(0.35, 0.7), s0: rng.range(3, 5), s1: 3, ramp: 'grass', r0: rng.next(), r1: rng.next(), a0: 1, a1: 1, add: false, layer: 1 });
      }
      if (!fired.fling && t < 0.83) {
        // (the landing: a low spray of turf dust)
        for (let k = 0; k < 10; k++) {
          const a = rng.range(Math.PI * 1.05, Math.PI * 1.9), sp = rng.range(60, 220);
          Pp.spawn({ kind: PK.Smoke, x: cx + rng.range(-20, 20), y: GY - 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.35, drag: 3, max: rng.range(0.4, 0.7), s0: 6, s1: 18, ramp: 'dust', r0: 0, r1: 1, a0: 0.4, a1: 0, add: false, layer: 0 });
        }
      }
    }
    if (!fired.lash && t >= T_LASH) {
      fired.lash = true;
      cam.hit(0.8);
      const v0 = viewAt(t);
      const kp = keeperAt(v0, t);
      if (kp) {
        const [hx, hy] = keeperHand(kp);
        starburst(env, hx, hy, 40, 700, TAU, 0, PK.Streak);
        starburst(env, hx, hy, 12, 420, TAU, 0, PK.Stitch);
      }
    }
    if (!fired.fling && t >= T_FLING) {
      fired.fling = true;
      cam.shove(-6, 8);
    }
  },
  render(env, t) {
    const { ctx, fx } = env;
    const rng = env.frng(8);
    PUPPETS.frame();
    const v = viewAt(t);
    const st = env.art.stadium;
    const seven = sevenAt(t);
    const s = beadS(t);
    const bead = beadMain(s);
    const beadQ = eq(v, bead.X, bead.Y, bead.k);
    const ballPre = ballFall(t);
    const preHit = t < T_HIT;
    const spearOn = t >= T_HIT;
    // The bowstring's far end (the far top corner) in this view.
    const far = beadMain(1);
    const farQ = eq(v, far.X, far.Y, far.k);
    const spearPtsScreen: TrailPt[] = spearOn ? [M, farQ].map((p) => ({ x: scr(v, p[0], p[1])[0], y: scr(v, p[0], p[1])[1] })) : [];

    // ---- 1. the stadium (a far layer: it scales less and slides with the pan)
    env.screen();
    ctx.fillStyle = HEX.night;
    ctx.fillRect(0, 0, VW, VH);
    const sb = Math.max(0.8, 0.5 * v.z);
    const syF = v.py + (GY - HY) * kFT * v.z;
    const syB = Math.min(syF, 250);
    const bgX = 0.35 * v.vx + (320 - v.px) / sb;
    // Lamp heads (screen) and the tint the line lends them.
    const lampScr = TOWER_X.map((tx): [number, number] => [320 + (tx + bgX * 0.5 - 300 + 20 - bgX) * sb, syB + (-26 - FIELD.horizon) * sb]);
    const lightPts: TrailPt[] = preHit
      ? shaftPts(ballPre, 0, t).map((p) => ({ x: scr(v, p.x, p.y)[0], y: scr(v, p.x, p.y)[1] }))
      : spearPtsScreen;
    const tint = lampScr.map((p) => lampTintFor(p, lightPts, 1));
    zoomAbout(env.cam, bgX, FIELD.horizon, 320, syB, sb);
    env.world();
    drawFieldBackdrop(ctx, st, bgX, FIELD.horizon + (180 - syB) / sb, 60 + t, { lampTint: tint });

    // ---- 2. the turf and the goal's net (main layer, graded with the world); the far keeper in the opening
    mainLayer(env, v);
    drawTurf(ctx, v);
    drawNet(ctx, v);

    // ---- 3. Night Ink; the colour floods back in a ~140 px band (70 + 2 x 35 soft) down the bowstring from the contact
    const flood = ease.outCubic(clamp((t - T_HIT) / 0.08));
    const bandEnd: [number, number] = [lerp(M[0], farQ[0], flood), lerp(M[1], farQ[1], flood)];
    nightInk(ctx, 0.85, spearOn ? { pts: [{ x: M[0], y: M[1] }, { x: bandEnd[0], y: bandEnd[1] }], w: 70 / v.z, soft: 35 / v.z } : undefined);

    // ---- 4. the lamp heads over the ink (passive: they only catch the line's light)
    env.screen();
    let best = -1, bestT = 0;
    lampScr.forEach((p, i) => {
      if (p[0] < -80 || p[0] > VW + 80 || p[1] < -60 || p[1] > VH + 40) return;
      lampOverInk(ctx, p[0], p[1], sb, tint[i]);
      if (tint[i] > bestT) {
        bestT = tint[i];
        best = i;
      }
    });
    if (best >= 0 && bestT > 0.05) jadeFlare(ctx, lampScr[best][0], lampScr[best][1], 120 * bestT, 0.8 * bestT);

    // ---- 5. the goal frame (inked tubes, lit by the bead near the corner), the keeper
    mainLayer(env, v);
    if (s > 0.6) {
      // The strands round the far top corner catch the bead's light as it closes (the harp is about to ring).
      const c = field(v, GOAL.x, GOAL.far, GOAL.bar - 2);
      const a = ease.inQuad(clamp((s - 0.6) / 0.4));
      ctx.save();
      ctx.beginPath();
      ctx.arc(c.q[0], c.q[1], (60 + 140 * a) / v.z, 0, TAU);
      ctx.clip();
      ctx.globalCompositeOperation = 'lighter';
      drawNet(ctx, v, `rgba(47,224,138,${(0.75 * a).toFixed(3)})`, 1.6 / v.z + 0.4);
      ctx.restore();
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.emerald), c.q[0], c.q[1], (120 + 60 * a) / v.z, 0.35 * a);
      ctx.restore();
    }
    drawFrame(ctx, v, t >= T_WHIP ? beadQ : null, clamp((s - 0.55) / 0.3));
    const kp = keeperAt(v, t);
    if (preHit) {
      // The keeper off his line in the background, out of reach: an ink silhouette at the right edge.
      const kz = kOf(270);
      const [kx, ky] = eq(v, mainXY(1150, 0)[0], GY - 46, kz);
      PUPPETS.draw(ctx, '8-k-far', KEEPER_KIT, POSES.gkReady, 1, -1, kx - 30 * t, ky, 2.1 * kz, 0, K_SIL_DIM);
    }
    if (kp && t < T_DIVE) PUPPETS.draw(ctx, kp.name, KEEPER_KIT, kp.pose, 1, kp.facing, kp.x, kp.y, kp.D, kp.lit, K_SIL, 1, kp.rot);

    // ---- 6. the line: the needle's shaft (before contact), the bowstring (after)
    const reel = clamp((t - T_REEL) / 0.12);
    let shaftNow: TrailPt[] = [];
    if (preHit) {
      const taut = ease.inOutQuad(reel);
      const pts = shaftPts(ballPre, taut, t);
      shaftNow = pts;
      // The pulse enters at the frame edge and runs down into the ball (~4000 px/s); behind it the shaft is drained.
      const sc = pts.map((p) => scr(v, p.x, p.y));
      let iEdge = 0;
      for (let i = 0; i < sc.length; i++) {
        const [x, y] = sc[i];
        if (x > -20 && y > -20 && x < VW + 20 && y < VH + 20) {
          iEdge = i;
          break;
        }
      }
      const uEdge = iEdge / (pts.length - 1);
      const w = 13;
      if (t < T_REEL) {
        meridianStroke(ctx, pts, w, { tail: 7, head: BR * ballPreD(t) * 1.15, t, stars: { spacing: 40 }, cross: { every: 72 } });
      } else {
        const uP = lerp(uEdge, 1, ease.inQuad(reel));
        const iP = Math.max(1, Math.min(pts.length - 2, Math.round(uP * (pts.length - 1))));
        const tailPart = pts.slice(0, iP + 1), headPart = pts.slice(iP);
        const wSplit = lerp(7, w, iP / (pts.length - 1));
        meridianStroke(ctx, tailPart, wSplit, { tail: 7, t, stars: false, cross: { every: 72 }, drain: 0.85, alpha: 0.8 });
        meridianStroke(ctx, headPart, w, { tail: wSplit, head: BR * ballPreD(t) * 1.15, t, stars: { spacing: 40 }, cross: false, pulse: { u: 0, w: 60 / v.z } });
        // The light that has passed pours down toward the ball: an extra mint glow on the lit stretch.
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ribbon(ctx, headPart, wSplit * 1.6, w * 2.2, HEX.mint, 0.25 * reel);
        ctx.restore();
      }
    }
    let spearPts: TrailPt[] = [];
    if (spearOn && !(t >= T_HIT && t < T_STAGE_B)) {
      const age = t - T_HIT;
      const w0 = 26 / Math.pow(v.z, 0.6);
      // The standing wave (14 px -> 0 over 0.6 s, 3 nodes); the lash adds a travelling dip that hooks the forearm,
      // bites, then springs back with a fresh ring.
      const wave = (14 / v.z) * Math.max(0, 1 - age / 0.6) + (t >= T_FLING ? (9 / v.z) * Math.exp(-(t - T_FLING) / 0.18) : 0);
      let dip: { s: number; amp: number; w: number } | undefined;
      if (t >= T_LASH - 0.07 && t < T_FLING + 0.25) {
        const kp2 = keeperAt(v, t);
        const hand = kp2 ? keeperHand(kp2) : lashPoint(v);
        // The dip follows the forearm through the bite and springs back (damped) after the release.
        const lp = lashPoint(v);
        const reach = Math.hypot(hand[0] - lp[0], hand[1] - lp[1]);
        let amp: number;
        if (t < T_LASH) amp = lerp(0, 22 / v.z, ease.inQuad((t - (T_LASH - 0.07)) / 0.07));
        else if (t < T_FLING) amp = 22 / v.z + reach;
        else amp = (22 / v.z + 10) * Math.cos((t - T_FLING) * 40) * Math.exp(-(t - T_FLING) / 0.07);
        dip = { s: S_LASH, amp, w: 0.07 };
      }
      // The snap: the line whips straight from the shaft's angle into the bowstring in 0.05 s (and overshoots).
      const snap = clamp((t - T_HIT) / 0.05);
      let tip: [number, number] = farQ;
      if (snap < 1) {
        const a0 = Math.atan2(SHAFT_DIR[1], SHAFT_DIR[0]), a1 = Math.atan2(farQ[1] - M[1], farQ[0] - M[0]);
        const len = Math.hypot(farQ[0] - M[0], farQ[1] - M[1]);
        const an = lerp(a0 + TAU, a1 + TAU, ease.outBack(snap));
        tip = [M[0] + Math.cos(an) * len, M[1] + Math.sin(an) * len];
      }
      spearPts = spear(ctx, M, tip, w0, w0 * far.k, wave, (t - T_HIT) * 9 * TAU, 3, 1, dip);
      spearDetail(ctx, spearPts, w0, w0 * far.k, t);
      // Stitch-hole stars along the bowstring: they pop as the bead passes, then hold as pearl dots.
      const L = arcLengths(spearPts);
      const Ls = L[L.length - 1];
      for (let d = 28; d < Ls; d += 30) {
        const u = d / Ls;
        const q = pointAt(spearPts, L, d);
        const behind = (s - u) * Ls;
        if (behind > 0 && behind < 60) sparkle(ctx, q.x, q.y, lerp(9, 4, behind / 60) / Math.sqrt(v.z), 1 - behind / 90, Math.PI / 4);
        else {
          ctx.globalAlpha = 0.75;
          ctx.fillStyle = HEX.pearl;
          const r = 1.2 / v.z + 0.6;
          ctx.fillRect(q.x - r, q.y - r, r * 2, r * 2);
          ctx.globalAlpha = 1;
        }
      }
      // The bead's light on the string behind it (a pearl run toward the forehead), and the anchor's glow at the meeting.
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      if (t >= T_REL) {
        const i0 = Math.max(0, Math.floor(s * (spearPts.length - 1)) - 6);
        const run = spearPts.slice(i0, Math.max(i0 + 2, Math.floor(s * (spearPts.length - 1)) + 1));
        if (run.length > 1) ribbon(ctx, run, 1, w0 * 1.2, HEX.mint, 0.35);
      }
      drawGlow(ctx, glowOf(PAL.jade), M[0], M[1], 60 / v.z + 20, 0.4 * (1 - clamp((t - T_REL) / 0.8)));
      ctx.restore();
    }
    rings.draw(ctx, t);
    if (t >= T_LASH && t < T_LASH + 0.32) {
      // The lash's stitched ring (8 -> 120 px), pinned on the line where it bit.
      const [lx, ly] = lashPoint(v);
      const u = (t - T_LASH) / 0.32;
      stitchRing(ctx, lx, ly, lerp(8, 120, ease.outCubic(u)) / v.z, 1 - ease.inQuad(u), { width: 2 / v.z + 1, phase: -u * 40 });
    }
    // The keeper (from the dive): over the line, under the ball; the loop wraps his forearm and stays on his wrist.
    if (kp && t >= T_DIVE) {
      PUPPETS.draw(ctx, kp.name, KEEPER_KIT, kp.pose, 1, kp.facing, kp.x, kp.y, kp.D, kp.lit, K_SIL, 1, kp.rot);
    }

    // ---- 7. No.7 (a jade rim from the line; the loom's No.7 thread flickers back during the reel-in)
    const fr = no7(seven.key);
    const printA = t >= T_HIT && t < T_STAGE_B;
    const rimK = preHit ? lerp(0.35, 1, reel) : t < 1.1 ? 1 - 0.5 * clamp((t - T_REL) / 0.4) : 0.5;
    if (fr && !printA && rimK > 0) {
      const img = fr.a.tinted(fr.i, PAL.jade);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawSeven(env, seven, img, 2, -2, 0.85 * rimK);
      drawSeven(env, seven, img, 1, -1, 0.5 * rimK);
      ctx.restore();
    }
    if (!printA) drawSeven(env, seven);
    if (preHit && t >= T_REEL && shaftNow.length) {
      // The loom's No.7 thread (2a): from his eyes to the shaft above him, flickering for 0.14 s.
      const fh = sevenPt(seven, no7Anchor(seven.key, 'forehead'));
      const eye: [number, number] = [fh[0] - 9, fh[1] + 5];
      let bq = shaftNow[0], bd = Infinity;
      for (const q of shaftNow) {
        const d = Math.hypot(q.x - eye[0], q.y - eye[1]) + Math.max(0, q.y - eye[1] + 40) * 6;
        if (d < bd) {
          bd = d;
          bq = q;
        }
      }
      const fl = (0.45 + 0.55 * rng.next()) * (1 - clamp((t - 0.34) / 0.02));
      const mid = { x: lerp(eye[0], bq.x, 0.5) - 6, y: lerp(eye[1], bq.y, 0.5) };
      meridianStroke(ctx, [{ x: eye[0], y: eye[1] }, mid, bq], 2, { thin: true, alpha: fl });
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.mint), eye[0], eye[1], 10, 0.8 * fl);
      drawGlow(ctx, glowOf(PAL.pearl), bq.x, bq.y, 8, 0.8 * fl);
      ctx.restore();
    }

    // ---- 8. the ball
    const charge = preHit ? ease.inQuad(reel) : 0;
    if (preHit) {
      // Falling down its shaft (stretched along the fall), charging white-hot as the light pours in.
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const Dp = ballPreD(t);
      drawGlow(ctx, glowOf(PAL.emerald), ballPre[0], ballPre[1], BR * Dp * (3 + 2 * charge), 0.5 + 0.3 * charge);
      drawGlow(ctx, glowOf(PAL.mint), ballPre[0], ballPre[1], BR * Dp * (1.6 + 1.4 * charge), 0.35 + 0.5 * charge);
      ctx.restore();
      ctx.save();
      ctx.translate(ballPre[0], ballPre[1]);
      ctx.rotate(Math.atan2(-SHAFT_DIR[1], -SHAFT_DIR[0]) - Math.PI / 2);
      drawBall(env, spin, 0, 0, BR, Dp, charge * 0.95, 1.2 + charge, 'pearl', { sx: 0.88, sy: 1.16 }, { seamGlow: 1 });
      ctx.restore();
    } else if (t < T_REL) {
      // Squashed on his forehead through the hit-stop (sx 0.6, sy 1.3 across the hit), white-hot core.
      if (!printA) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, glowOf(PAL.emerald), SQ_C[0], SQ_C[1], 80, 0.55);
        drawGlow(ctx, glowOf(PAL.jade), FH_C[0], FH_C[1], 26, 0.5);
        ctx.restore();
        ctx.save();
        ctx.translate(SQ_C[0], SQ_C[1]);
        ctx.rotate(Math.atan2(HIT_DIR[1], HIT_DIR[0]));
        drawBall(env, spin, 0, 0, BR, S, 0.35, 0.9, 'pearl', { sx: 0.6, sy: 1.3, dent: 0.4 }, { seamGlow: 1 });
        ctx.restore();
        spinMarks(ctx, SQ_C[0], SQ_C[1], BALL_R * 1.15, t * 4, { color: HEX.jade, len: 1.2, width: 5, dir: -1 });
      }
    } else {
      // The bead: riding the bowstring, stretched along it, spinning, a comet glow round it.
      const ang = Math.atan2(farQ[1] - M[1], farQ[0] - M[0]);
      const Db = S * Math.pow(bead.k, 0.35) * lerp(1.3, 1.45, s);
      const sp = clamp((t - T_REL) / 0.06);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.emerald), beadQ[0], beadQ[1], BR * Db * 4.2, 0.5);
      drawGlow(ctx, glowOf(PAL.mint), beadQ[0], beadQ[1], BR * Db * 1.8, 0.3);
      ctx.restore();
      ctx.save();
      ctx.translate(beadQ[0], beadQ[1]);
      ctx.rotate(ang);
      const sq = lerp(0.7, 0.86, sp);
      drawBall(env, spin, 0, 0, BR, Db, 0.5, 1.3, 'pearl', { sx: 1 / sq, sy: sq }, { seamGlow: 1 });
      ctx.restore();
      spinMarks(ctx, beadQ[0], beadQ[1], BR * Db * 1.05, t * 14, { color: HEX.jade, len: 1.3, width: 4, dir: -1, alpha: 0.85 });
    }

    // ---- 10. particles
    env.parts.draw(ctx, 0);
    env.parts.draw(ctx, 1);
    if (kp && t >= T_LASH) {
      // The jade loop coiled twice round his reaching forearm (over the sparks so it always reads), then on his wrist.
      const [hx, hy] = keeperHand(kp);
      const bite = t < T_FLING ? ease.outQuad(clamp((t - T_LASH) / 0.06)) : 1;
      const fade = 1 - clamp((t - T_LASH) / 2.0);
      const ang = armAng(kp);
      const back = (t < T_FLING ? 9 : 7) * kp.D;
      jadeLoop(ctx, hx - Math.cos(ang) * back, hy - Math.sin(ang) * back, (t < T_FLING ? 16 : 12) / Math.sqrt(v.z) + 4, ang, fade, bite);
    }

    // ---- 11. stage A: the jade print composition (screen space under the post's two-tone)
    const [msx, msy] = scr(v, M[0], M[1]);
    if (printA) {
      env.screen();
      ctx.save();
      ctx.fillStyle = HEX.mint;
      ctx.beginPath();
      const N = 34;
      for (let i = 0; i < N * 2; i++) {
        const an = (i / (N * 2)) * TAU + 0.05;
        const r = i % 2 ? 60 + 40 * hash01(i * 7.1) : 200 + 300 * hash01(i * 3.7) * hash01(i * 1.3 + 5);
        const x = msx + Math.cos(an) * r, y = msy + Math.sin(an) * r * 0.85;
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.mint), msx, msy, 260, 0.7);
      ctx.restore();
      // The bowstring printed as a mint lance from the forehead out of the frame.
      mainLayer(env, v);
      const pts: TrailPt[] = [{ x: M[0], y: M[1] }, { x: farQ[0], y: farQ[1] }];
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ribbon(ctx, pts, 44 / v.z, 30 / v.z, HEX.ink, 1);
      ribbon(ctx, pts, 12 / v.z, 9 / v.z, HEX.mint, 1);
      ctx.restore();
      // No.7 and the ball as one ink silhouette cutting the burst.
      if (fr) drawSeven(env, seven, fr.a.tinted(fr.i, PAL.ink));
      ctx.save();
      ctx.translate(SQ_C[0], SQ_C[1]);
      ctx.rotate(Math.atan2(HIT_DIR[1], HIT_DIR[0]));
      ctx.fillStyle = HEX.ink;
      ctx.beginPath();
      ctx.ellipse(0, 0, BALL_R * 0.66, BALL_R * 1.3, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    // ---- 12. screen-space ink: speed streaks, focus lines
    env.screen();
    speedStreaks(ctx, rng, preHit ? 1 - 0.6 * clamp((t - T_REEL) / 0.14) : t >= T_WHIP_END ? (t < T_CHASE ? 0.8 : 0.35) : 0, preHit ? 40 : 30);
    if (t >= T_HIT && t < 0.7) {
      const fa = t < T_REL ? 1 : 1 - ease.inQuad(clamp((t - T_REL) / 0.12));
      inkFocus(ctx, rng, msx, msy, 80 * v.z / 2.4, 900, 120, fa, t >= T_STAGE_B && t < T_PRINT_END);
    }
    if (t >= T_HIT - 0.04 && t < T_REL && !printA) {
      // The light pouring into the header: a jade flare on the contact.
      const fa = t < T_HIT ? (t - T_HIT + 0.04) / 0.04 : 0.6;
      jadeFlare(ctx, msx, msy, 120 * fa, 0.6 * fa);
    }

    // ---- 13. post: grade, Stack C's halftone print (F6 0.36, F7 0.43), shocks, CA, radial, the pluck warp, the whip
    nightGrade(fx, { bloom: t >= T_HIT && t < 0.62 ? 1.2 : 1.05, thresh: 0.64 });
    if (t >= T_HIT && t < T_STAGE_B) halftoneImpact(fx, 'A', 1, { band: TONE_BAND });
    else if (t >= T_STAGE_B && t < T_PRINT_END) halftoneImpact(fx, 'B');
    mainLayer(env, v);
    const [mu, mv] = env.cam.toUV(M[0], M[1]);
    if (t >= T_HIT && t < 1.0) {
      const a1 = t - T_HIT;
      pushShock(fx, { x: mu, y: mv, r: a1 * 1.6, s: 0.075 * (1 - clamp(a1 / 0.5)) });
      if (t >= T_HIT + 0.06) pushShock(fx, { x: mu, y: mv, r: (t - T_HIT - 0.06) * 1.5, s: 0.045 * (1 - clamp((t - T_HIT - 0.06) / 0.45)) });
      if (t >= T_REL) pushShock(fx, { x: mu, y: mv, r: (t - T_REL) * 1.4, s: 0.03 * (1 - clamp((t - T_REL) / 0.3)) });
      fx.ca = t < T_PRINT_END ? 0.016 : 0.016 * (1 - clamp((t - T_PRINT_END) / 0.3));
      fx.radial = t < T_PRINT_END ? 0.14 * (1 - 0.5 * clamp((t - T_HIT) / 0.16)) : t < T_REL ? 0.018 : 0.03 * (1 - clamp((t - T_REL) / 0.1));
      fx.radialX = mu;
      fx.radialY = mv;
    }
    if (spearOn && t < 1.0) {
      // The pluck along the bowstring (0.030, N 1, 9 Hz, decay 0.4, width 0.12).
      const a = spearPtsScreen[0], b = spearPtsScreen[1];
      setPluck(fx, null, [[a.x, a.y], [(a.x + b.x) / 2, (a.y + b.y) / 2], [b.x, b.y]], { amp: 0.03, n: 1, hz: 9, decay: 0.4, w: 0.12, tSince: t - T_HIT, glow: 0.3 });
    }
    if (t >= T_LASH && t < 1.62 && kp) {
      // The lash: one shock at his forearm, CA 0.010; the string rings again (a small pluck along it).
      const [hx, hy] = keeperHand(kp);
      const [hu, hv] = env.cam.toUV(hx, hy);
      pushShock(fx, { x: hu, y: hv, r: (t - T_LASH) * 1.3, s: 0.05 * (1 - clamp((t - T_LASH) / 0.35)) });
      fx.ca = Math.max(fx.ca, 0.01 * (1 - clamp((t - T_LASH) / 0.3)));
      if (spearPtsScreen.length > 1) {
        const a = spearPtsScreen[0], b = spearPtsScreen[1];
        setPluck(fx, null, [[a.x, a.y], [(a.x + b.x) / 2, (a.y + b.y) / 2], [b.x, b.y]], { amp: 0.012, n: 2, hz: 9, decay: 0.3, w: 0.1, tSince: t - T_FLING });
      }
    }
    if (t >= T_WHIP && t < T_WHIP_END) {
      const [hx, hy] = scr(v, bead.X, bead.Y, bead.k);
      whip(fx, 0.1 * Math.sin((Math.PI * (t - T_WHIP)) / (T_WHIP_END - T_WHIP)), 1, 0, { x: hx, y: hy, r: 0.08 });
    }
    assertMeridianFx(fx);
  },
};
