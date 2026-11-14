// SHOT 6 · FIRST TOUCH (2.4 s): the thread is handed over, the world wakes up, and No.7 finishes (SPEC.md §6).
//
// A side medium shot from the near side at No.7's hip height, on a rail tracking right with him. One-point
// perspective: field (x, z) is projected through an eye 6 m in front of his plane (z 298) at hip height, so the far
// stand, the turf stripes, the thread (back along PATH to No.10) and later the goal all sit in one consistent space.
// No.7 is drawn from his studio frames at integer x2 in his plane; the world is an ink page (0.85) until his touch.
//
// Beats (shot-local t, the runner's unwarped clock; positions run on the simulated clock sim(t)):
//   0.00  Run R1-R4 at 14 fps. Opens out of shot 5's push-in (zoom 1.5 -> 1.4, the radial blur carried over the cut).
//         The pearl ball rolls into his stride from screen-left, trailing the jade running stitch back to No.10.
//   0.25  Receive R1, the reach: eyes drop to the ball, right foot opens; the ball runs in behind his standing foot.
//   0.35  TOUCH (Receive R2): the inside of the right foot pushes it one stride ahead. Hit-stop 0.08 for 0.12 s.
//         The thread pulls taut: the running stitch closes into one straight line back off-screen to No.10 and
//         vibrates (nodes at the three eyes: shorter segments faster). The colour washes back ALONG the thread: a band
//         from the contact runs back toward No.10, widening until the whole frame is in colour (0.35 s, soft edge).
//   0.47  R3 push-off.  0.55-0.75 the thread is pulled through: its stitches tighten into the turf and the tail
//         zips to his boot, ending in one pearl glint on the boot (0.75).
//   0.62  R4 plant (left foot beside the ball, right leg back): the camera swings right and pulls out (1.4 -> 1.1),
//         revealing the keeper coming off his line and the goal.
//   0.80  STRIKE (R5): low side-foot finish across the keeper to the far corner; plain ball, short white streak;
//         the keeper dives late; the camera whip-pans with the ball (fx.radial 0.3).  0.88 R6 follow-through.
//   1.12  The ball slides inside the far post into the side netting: net bulge, an almond needle-eye glint in the
//         mesh (the thread's last echo), cam.hit(0.35).
//   1.25  GOAL! (pearl / jade / ink), confetti (red, gold, white, jade), camera flashes in the stands.
//   1.40  The manga diptych slides in: No.10 Point P1 -> P2 -> P3a (P3b blink 1.95) | No.7 Point Q1 -> Q2 (mirrored);
//         the jade thread runs across the gutter between their fingertips and a pearl glint travels along it.
//   1.80  Name card.  2.05-2.40 fade to [8,4,14].
//
// No.10 and No.7 come only from studio frames (integer x2). The keeper is one live puppet render per frame.

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { Rng, TAU, clamp, ease, lerp } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { focusLines, slamTitle, type TrailPt } from '../../art/fx';
import { KEEPER_KIT, P, POSES, mixPose, renderPuppet, type Pose } from '../../art/puppet';
import { anim, drawAnim, findFrame, hasAnim } from '../../art/studioAnim';
import {
  FADE_RGB, HEX, LAYOUT, PAL, PATH, THREAD_NOTES as N, TITLE_STYLE, crossStitch, drawBall, drawGrassFore, drawNo10, drawNo7, inkGrade,
  mangaPanels, meridianGrade, nameCard, needleEye, no10Point, no7Anchor, no7Point, panelPoly, pluckLine, prepareGrassFore,
  prepareInk, pulse, screentone, threadLine, warp, type No10Key, type No7Key,
} from './common';

const DUR = 2.4;
const DEG = Math.PI / 180;

// ---------------------------------------------------------------- timing (shot-local t)
const TOUCH = 0.35;
const STOP_LEN = 0.12, STOP_RATE = 0.08;
const STOPS: [number, number, number][] = [[TOUCH, STOP_LEN, STOP_RATE]];
const RELEASE = TOUCH + STOP_LEN; // 0.47 R3 push-off
const PLANT = 0.62;
const STRIKE = 0.8;
const FOLLOW = 0.88;
const NET = 1.12;
const GOAL_T = 1.25;
const DIP = 1.4;
const CARD = 1.8;
const FADE0 = 2.05;
const WASH_LEN = 0.35;
const PULL0 = 0.55, PULL1 = 0.75;

/** The simulated clock (the hit-stop slows positions; sprite frames are scheduled on t). */
const sim = (t: number) => t - clamp(t - TOUCH, 0, STOP_LEN) * (1 - STOP_RATE);

// ---------------------------------------------------------------- No.7's frames
const SEQ: readonly (readonly [number, No7Key])[] = [
  [0, 'Run.R1'], [1 / 14, 'Run.R2'], [2 / 14, 'Run.R3'], [3 / 14, 'Run.R4'], [0.25, 'Receive.R1'], [TOUCH, 'Receive.R2'],
  [RELEASE, 'Receive.R3'], [PLANT, 'Receive.R4'], [STRIKE, 'Receive.R5'], [FOLLOW, 'Receive.R6'],
  // He runs on after the ball (the right foot stays planted: Run R2-R4 continue R6's stance).
  [FOLLOW + 1 / 14, 'Run.R2'], [FOLLOW + 2 / 14, 'Run.R3'], [FOLLOW + 3 / 14, 'Run.R4'],
];

// ---------------------------------------------------------------- the space (field px: 10 px ~ 1 m)
/** World px per field px in No.7's plane (No.7 at x2 = 196 px ~ 1.8 m). */
const K = 11;
const D2 = 2;
/** His plane (field z) and the world x origin (field x): the cross-stitch X where ball and stride meet. */
const ZP = LAYOUT.target.z;
const FX0 = LAYOUT.target.x;
/** The eye: 6 m in front of his plane, at his hip height. */
const D0 = 60;
const EZ = ZP + D0;
const GY = 300;
const EYE_H = 74;
const HZ = GY - EYE_H;
const BALL_R = 6;
/** The ball's centre height (field px): its radius, 12 world px in his plane. */
const BALL_H = (BALL_R * D2) / K;

interface Cam {
  /** View centre (world) and zoom. */
  x: number;
  y: number;
  z: number;
  /** The eye's world x (the vanishing point): moves with the rail, holds still while the camera pans. */
  ex: number;
}

/** Field point (x, z) at height h (field px) -> world [x, y, depth scale]. */
function proj(c: Cam, fx: number, fz: number, h = 0): [number, number, number] {
  const s = D0 / Math.max(0.5, EZ - fz);
  const X = (fx - FX0) * K;
  return [c.ex + (X - c.ex) * s, HZ + (GY - HZ) * s - h * K * s, s];
}

// ---------------------------------------------------------------- resolved layout (from the studio anchors)
let C1 = -36, C2 = -30, C3 = 47;
let X_END = 61;
let PEL0 = -110;
let PEL5 = 23;
let CONTACT: number[] = [];

/** Offset (world px at x2) of anchor `name` from the frame's contact. */
function rel(k: No7Key, name: string): [number, number] {
  const a = no7Anchor(k), p = no7Anchor(k, name);
  return [(p[0] - a[0]) * D2, (p[1] - a[1]) * D2];
}

/**
 * Place every support phase on the turf so each planted foot stays pinned while the art moves the body over it:
 * C0 the run's right foot, C1 the left foot at the reach and the touch (R2's ball anchor lands on the X), C2 the
 * right foot's short step after the touch, C3 the long plant beside the ball (R4 and R5 share the toe), C4 the
 * landing after the strike.
 */
function resolveAnchors() {
  C1 = -rel('Receive.R2', 'ball')[0];
  const pRec1 = C1 + rel('Receive.R1', 'pelvis')[0];
  const C0 = pRec1 - 10 - rel('Run.R4', 'pelvis')[0];
  C2 = C1 + 6;
  const pR3 = C2 + rel('Receive.R3', 'pelvis')[0];
  const pR4 = pR3 + 27;
  C3 = pR4 - rel('Receive.R4', 'pelvis')[0];
  PEL5 = C3 + rel('Receive.R5', 'pelvis')[0];
  const pR6 = PEL5 + 14;
  const C4 = pR6 - rel('Receive.R6', 'pelvis')[0];
  X_END = C3 + rel('Receive.R5', 'ball')[0];
  PEL0 = C0 + rel('Run.R1', 'pelvis')[0];
  CONTACT = SEQ.map(([at]) => (at < 0.25 ? C0 : at < RELEASE ? C1 : at < PLANT ? C2 : at < FOLLOW ? C3 : C4));
}

function no7At(t: number): { key: No7Key; x: number } {
  let i = 0;
  for (let k = 0; k < SEQ.length; k++) if (t >= SEQ[k][0] - 1e-6) i = k;
  return { key: SEQ[i][1], x: CONTACT[i] ?? 0 };
}

// ---------------------------------------------------------------- camera (pure functions of t)
const VR = 185; // the rail's speed (world px/s): his pace
const railT = (t: number) => (t < PLANT ? t : PLANT + 0.15 * (1 - Math.exp(-(t - PLANT) / 0.15)));

function camAt(t: number): Cam {
  const rail = PEL0 - 52 + VR * railT(t);
  const ex = rail - 14;
  // Opens with his feet nearer frame centre, where shot 5's push-in left them (the match cut), easing onto the rail.
  let x = rail + 30 * (1 - ease.outCubic(clamp(t / 0.3))), y = 214;
  // Opens tight out of shot 5's push-in (1.5), settles to the medium shot (1.4).
  let z = 1.4 + 0.1 * (1 - ease.outCubic(clamp(t / 0.3)));
  // The touch: a small push into the freeze, released after it.
  z += 0.05 * ease.outCubic(clamp((t - TOUCH) / 0.07)) * (1 - ease.inOutQuad(clamp((t - RELEASE) / 0.15)));
  // The swing: right and out, revealing the keeper and the goal.
  const sw = ease.inOutCubic(clamp((t - PLANT) / (STRIKE - PLANT)));
  x = lerp(x, PEL5 + 150, sw);
  z = lerp(z, 1.1, sw);
  y = lerp(y, 194, sw);
  // The whip-pan with the shot, onto the far corner.
  const [nx] = proj({ x, y, z, ex }, SHOT_C.x, SHOT_C.z, 2);
  const wp = ease.inOutCubic(clamp((t - STRIKE - 0.02) / (NET - STRIKE - 0.02)));
  x = lerp(x, nx + 88, wp);
  z = lerp(z, 1.16, wp);
  // The net: a short punch-in on the ball in the corner, then a slow push through the hold.
  const [bxN, byN] = proj({ x, y, z, ex }, SHOT_C.x, SHOT_C.z, 2);
  const punch = t >= NET ? Math.exp(-(t - NET) / 0.1) * ease.outCubic(clamp((t - NET) / 0.04)) : 0;
  z *= 1 + 0.18 * punch;
  x = lerp(x, bxN, 0.35 * punch);
  y = lerp(y, byN, 0.35 * punch);
  const hold = ease.inOutQuad(clamp((t - NET) / (DUR - NET)));
  z *= 1 + 0.05 * hold;
  x += 6 * hold;
  return { x, y, z, ex };
}

// ---------------------------------------------------------------- the ball

/** World px the ball still has to roll (along PATH, at his plane's scale) before it meets his stride at the touch. */
const behind = (s: number) => {
  const d = Math.max(0, TOUCH - s);
  // About 120 world px at the cut (at his heels, as shot 5 ends one stride short of the X), 28 behind at the reach
  // (0.25), and still faster than his 185 px/s pace at the touch (260 px/s).
  return 260 * d + 240 * d * d;
};
/** World px rolled after the touch (pushed one stride ahead, slowing to the R5 ball guide at the strike). */
const ahead = (s: number) => X_END * (1 - Math.pow(1 - clamp((s - TOUCH) / (sim(STRIKE) - TOUCH)), 3));
/** Distance the ball has travelled (world px), for its roll. */
const travelled = (t: number) => (sim(t) < TOUCH ? -behind(sim(t)) : ahead(sim(t)));

/** Ball centre (world) and its depth scale, before the strike. */
function ballPre(c: Cam, t: number): [number, number, number] {
  const s = sim(t);
  if (s < TOUCH) {
    const p = PATH.at(1 - behind(s) / K / PATH.length);
    return proj(c, p.x, p.z, BALL_H);
  }
  return proj(c, FX0 + ahead(s) / K, ZP, BALL_H);
}

/** The finish: from the boot across the keeper, inside the far post, into the far side netting. */
const SHOT_B = { x: 1180, z: 222 };
const SHOT_C = { x: 1186.5, z: 214.5 };
function ballShotField(t: number): { x: number; z: number; h: number } {
  const A = { x: FX0 + X_END / K, z: ZP };
  if (t < NET) {
    const u = clamp((t - STRIKE) / (NET - STRIKE));
    const f = 1 - Math.pow(1 - u, 1.35);
    const lAB = Math.hypot(SHOT_B.x - A.x, SHOT_B.z - A.z), lBC = Math.hypot(SHOT_C.x - SHOT_B.x, SHOT_C.z - SHOT_B.z);
    const d = f * (lAB + lBC);
    const p = d < lAB
      ? { x: lerp(A.x, SHOT_B.x, d / lAB), z: lerp(A.z, SHOT_B.z, d / lAB) }
      : { x: lerp(SHOT_B.x, SHOT_C.x, (d - lAB) / lBC), z: lerp(SHOT_B.z, SHOT_C.z, (d - lAB) / lBC) };
    return { ...p, h: BALL_H + 1.6 * Math.sin(Math.PI * Math.min(1, f * 1.05)) + 0.4 * f };
  }
  // In the net: it pushes the side netting back, drops and rolls a little along it.
  const k = t - NET;
  const drop = ease.outCubic(clamp(k / 0.3));
  return { x: SHOT_C.x + 9 * ease.outCubic(clamp(k / 0.6)), z: SHOT_C.z - netPush(t) * 0.9 + 2 * drop, h: lerp(BALL_H + 0.4, BALL_H, drop) };
}

/** How far (field px) the ball pushes the side netting back: a damped spring after the hit. */
function netPush(t: number) {
  if (t < NET) return 0;
  const k = t - NET;
  return 20 * Math.exp(-k / 0.3) * Math.abs(Math.sin(Math.min(Math.PI / 2, k * 14) + Math.max(0, k * 14 - Math.PI / 2) * 0.55)) + 1.2 * (1 - Math.exp(-k / 0.2));
}

// ---------------------------------------------------------------- the keeper (one live puppet render per frame)
const KR = 1.3;
const GK_READY = P({ ...POSES.gkReady });
const GK_SET = P({ ...POSES.gkReady, torso: 28 * DEG, thighN: 40 * DEG, kneeN: 80 * DEG, thighF: 0, kneeF: 80 * DEG, armN: 40 * DEG, armF: 30 * DEG });
const GK_DIVE: Pose = P({ ...POSES.gkDive, spin: -1.45 });
const GK_DOWN: Pose = P({ ...POSES.gkDive, spin: -1.5, armN: 160 * DEG, armF: 150 * DEG, kneeN: 40 * DEG, kneeF: 60 * DEG });
// Off his line to narrow the angle; the shot goes across him (past his right hand, toward the far post) and he
// only goes down once it is by him.
const GK_OUT = { x: 1154, z: 268 };
const GK_LAND = { x: 1150, z: 258 };
const GK_D0 = 0.89, GK_D1 = 1.07;

function keeperAt(t: number): { x: number; z: number; h: number; pose: Pose } {
  const out = ease.outCubic(clamp((t - 0.45) / 0.4));
  const x0 = lerp(LAYOUT.keeper.x, GK_OUT.x, out), z0 = lerp(LAYOUT.keeper.z, GK_OUT.z, out);
  if (t < GK_D0) {
    const set = ease.inOutQuad(clamp((t - 0.76) / 0.08));
    const bob = (1 - set) * Math.abs(Math.sin(t * 22)) * 0.5;
    return { x: x0, z: z0, h: bob, pose: mixPose(GK_READY, GK_SET, set) };
  }
  const k = clamp((t - GK_D0) / (GK_D1 - GK_D0));
  const e = ease.outQuad(k);
  const pose = t < GK_D1
    ? mixPose(GK_SET, GK_DIVE, ease.outCubic(clamp(k * 1.6)))
    : mixPose(GK_DIVE, GK_DOWN, ease.outCubic(clamp((t - GK_D1) / 0.2)));
  return {
    x: lerp(GK_OUT.x, GK_LAND.x, e),
    z: lerp(GK_OUT.z, GK_LAND.z, e),
    // The hip is placed at standing height: the drop lays him on the turf by about GK_D1 (the landing dust).
    h: Math.sin(Math.PI * k) * 3.2 * (1 - k * 0.4) - 5.8 * ease.inQuad(clamp((t - GK_D0) / 0.2)),
    pose,
  };
}

// ---------------------------------------------------------------- module state (reset in init)
let spin = new BallSpin();
let prevTravel = 0;
let touched = false, struck = false, netted = false, goalBurst = false, landed = false;
interface Tuft {
  x: number;
  z: number;
  h: number;
  lean: number;
}
let TUFTS: Tuft[] = [];
interface Seat {
  u: number;
  v: number;
  ph: number;
  rate: number;
}
let SEATS: Seat[] = [];

function buildStatic() {
  const r = new Rng(6061);
  TUFTS = [];
  for (let i = 0; i < 170; i++) TUFTS.push({ x: r.range(980, 1300), z: r.range(272, 344), h: r.range(3, 8), lean: r.range(-0.5, 0.9) });
  SEATS = [];
  for (let i = 0; i < 140; i++) SEATS.push({ u: r.range(0, 1), v: r.range(0.05, 0.9), ph: r.range(0, 1), rate: r.range(1.2, 2.6) });
}

const CONFETTI = ['#E0283C', '#E0283C', '#FCB94C', '#FBF6EA', '#FBF6EA', '#2FE08A'];

// ---------------------------------------------------------------- environment

/** A floodlight bank (dark frame, a grid of warm lamps, a pole). */
function lampBank(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.fillStyle = '#1b1830';
  ctx.fillRect(x - 2 * s, y - 2 * s, 44 * s, 30 * s);
  ctx.fillRect(x + 19 * s, y + 26 * s, 3 * s, 70 * s);
  ctx.fillStyle = '#fff6dc';
  for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) ctx.fillRect(x + k * 6.6 * s, y + r * 6.4 * s, 4.6 * s, 4.4 * s);
}

/** The stand's depth plane and the far touchline (field z). */
const Z_STAND = 150, Z_TOUCH = 166;

/** Sky, floodlights, the far stand with its boards, the turf in perspective, the lines, the tufts (world transform). */
function drawEnvironment(env: Env, c: Cam, t: number) {
  const ctx = env.ctx;
  const st = env.art.stadium;
  const hw = VW / (2 * c.z) + 40, hv = VH / (2 * c.z) + 40;
  const L = c.x - hw, R = c.x + hw, T = c.y - hv, B = c.y + hv;
  ctx.imageSmoothingEnabled = false;
  const [, yStand, sSt] = proj(c, FX0, Z_STAND);
  const boardsTop = yStand - 13;
  const KS = 0.95;
  const crowdTop = boardsTop - 110 * KS;
  // Night sky.
  const sky = ctx.createLinearGradient(0, T, 0, crowdTop);
  sky.addColorStop(0, '#06040f');
  sky.addColorStop(1, '#1d1436');
  ctx.fillStyle = sky;
  ctx.fillRect(L, T, R - L, crowdTop - T + 2);
  // Floodlight banks above the stand (very far: little parallax), warm.
  for (const [lx, ly] of [[-1700, 0], [-1050, 14], [-300, 4], [520, 16], [1250, 2], [2000, 12]]) {
    const x = c.ex + (lx - c.ex) * 0.12;
    if (x < L - 140 || x > R + 140) continue;
    const y = crowdTop - 84 + ly;
    lampBank(ctx, x, y, 1);
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf([255, 236, 190]), x + 21, y + 13, 90, 0.26);
    drawGlow(ctx, glowOf([255, 250, 232]), x + 21, y + 13, 26, 0.5);
    ctx.globalCompositeOperation = 'source-over';
  }
  // Roof edge, the crowd (parallax with the stand's depth).
  ctx.fillStyle = '#07050f';
  ctx.fillRect(L, crowdTop - 12, R - L, 13);
  const cw = st.crowd.width * KS;
  const ox = c.ex + (-3000 - c.ex) * sSt;
  let x0 = ox;
  while (x0 > L) x0 -= cw;
  while (x0 + cw < L) x0 += cw;
  for (let x = x0; x < R; x += cw) ctx.drawImage(st.crowd, x, crowdTop, cw, 110 * KS);
  const haze = ctx.createLinearGradient(0, crowdTop, 0, boardsTop);
  haze.addColorStop(0, 'rgba(6,4,15,0.35)');
  haze.addColorStop(1, 'rgba(60,40,70,0)');
  ctx.fillStyle = haze;
  ctx.fillRect(L, crowdTop, R - L, boardsTop - crowdTop);
  // Camera flashes: a few all along; after GOAL! the whole stand sparkles.
  ctx.globalCompositeOperation = 'lighter';
  const goal = clamp((t - GOAL_T + 0.1) / 0.2);
  const span = R - L;
  SEATS.forEach((f, i) => {
    const ph = (t * f.rate * (1 + 2.2 * goal) + f.ph) % 1;
    const win = i < 40 ? 0.05 : 0.05 * goal;
    if (win <= 0 || ph > win) return;
    const xx = L + ((((f.u * 1600 + ox * 0.0) - L) % span) + span) % span;
    const y = crowdTop + f.v * 100 * KS;
    const a = 1 - ph / win;
    drawGlow(ctx, glowOf([255, 252, 240]), xx, y, 7, a);
  });
  ctx.globalCompositeOperation = 'source-over';
  // LED boards: a dark band with warm, red and white "logos".
  ctx.fillStyle = '#0b0a14';
  ctx.fillRect(L, boardsTop, R - L, 13);
  for (let i = -30; i < 60; i++) {
    const bx = ox + i * 120;
    if (bx < L - 130 || bx > R + 10) continue;
    ctx.fillStyle = (i + 90) % 3 === 0 ? '#e0283c' : (i + 90) % 3 === 1 ? '#fcb94c' : '#e8e4f2';
    ctx.fillRect(Math.round(bx), boardsTop + 3, 70, 7);
    ctx.fillStyle = '#0b0a14';
    for (let k = 0; k < 5; k++) ctx.fillRect(Math.round(bx + 8 + k * 12), boardsTop + 5, 4, 3);
  }
  ctx.fillStyle = '#3a3550';
  ctx.fillRect(L, boardsTop + 12, R - L, 1);
  // Turf: the strip behind the touchline, then the pitch in perspective.
  const turf = ctx.createLinearGradient(0, yStand, 0, Math.max(yStand + 4, B));
  turf.addColorStop(0, '#1b4f25');
  turf.addColorStop(0.35, '#26703a');
  turf.addColorStop(1, '#2f8a3c');
  ctx.fillStyle = turf;
  ctx.fillRect(L, yStand, R - L, B - yStand);
  // 5 m mowing stripes (constant field x), converging on the eye.
  const zN = EZ - 4;
  ctx.fillStyle = 'rgba(160,225,140,0.13)';
  ctx.beginPath();
  for (let x = 880; x < 1360; x += 100) {
    const a = proj(c, x, Z_TOUCH), b = proj(c, x + 50, Z_TOUCH), d = proj(c, x + 50, zN), e = proj(c, x, zN);
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.lineTo(d[0], d[1]);
    ctx.lineTo(e[0], e[1]);
    ctx.closePath();
  }
  ctx.fill();
  // Floodlit sheen across the middle distance.
  const [, ySheen] = proj(c, FX0, 250);
  const sheen = ctx.createLinearGradient(0, yStand, 0, ySheen + 30);
  sheen.addColorStop(0, 'rgba(210,230,190,0.18)');
  sheen.addColorStop(1, 'rgba(210,230,190,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(L, yStand, R - L, ySheen + 30 - yStand);
  // Pitch lines: far touchline, goal line, the 6-yard and 18-yard lines (constant x), the penalty spot.
  ctx.fillStyle = 'rgba(236,240,246,0.82)';
  const xLine = (x: number, w: number) => {
    const a = proj(c, x - w / 2, Z_TOUCH), b = proj(c, x + w / 2, Z_TOUCH), d = proj(c, x + w / 2, zN), e = proj(c, x - w / 2, zN);
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.lineTo(d[0], d[1]);
    ctx.lineTo(e[0], e[1]);
    ctx.closePath();
    ctx.fill();
  };
  xLine(1180, 1.2);
  xLine(1125, 1.2);
  xLine(1015, 1.2);
  {
    const [, y0] = proj(c, FX0, Z_TOUCH);
    const [, y1] = proj(c, FX0, Z_TOUCH + 1.2);
    ctx.fillRect(L, y0, R - L, Math.max(1, y1 - y0));
  }
  {
    const [px, py, s] = proj(c, 1070, 257);
    const [, py2] = proj(c, 1070, 258.2);
    ctx.beginPath();
    ctx.ellipse(px, py, 1.3 * K * s, Math.max(1, py2 - py), 0, 0, TAU);
    ctx.fill();
  }
  // Tufts (near ground: they carry the rail's speed).
  ctx.strokeStyle = '#173f20';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (const tf of TUFTS) {
    const [x, y, s] = proj(c, tf.x, tf.z);
    if (x < L || x > R || y > B) continue;
    const h = tf.h * s;
    for (let k = 0; k < 3; k++) {
      ctx.moveTo(x + (k - 1) * 3 * s, y);
      ctx.lineTo(x + (k - 1) * 3 * s + tf.lean * h + (k - 1) * 2 * s, y - h * (k === 1 ? 1.3 : 1));
    }
  }
  ctx.stroke();
}

/**
 * Manga speed lines while he sprints (screen space, a fixed set streaming left): paper streaks over the dark stand,
 * ink ones over the pale turf. They stop dead at the touch, so the freeze reads as a freeze.
 */
const RUN_LINES = (() => {
  const r = new Rng(6081);
  return Array.from({ length: 30 }, () => ({ y: r.range(70, 272), x: r.range(0, 900), len: r.range(50, 170), w: r.next() < 0.3 ? 2 : 1, a: r.range(0.18, 0.4) }));
})();
function runLines(ctx: CanvasRenderingContext2D, t: number) {
  const k = 1 - clamp((t - (TOUCH - 0.04)) / 0.04);
  if (k <= 0) return;
  ctx.save();
  ctx.lineCap = 'round';
  for (const l of RUN_LINES) {
    const x = ((l.x - t * 1500) % 900 + 900) % 900 - 130;
    ctx.strokeStyle = l.y < 222 ? HEX.paper : HEX.ink;
    ctx.globalAlpha = l.a * k * (l.y < 222 ? 0.8 : 1);
    ctx.lineWidth = l.w;
    ctx.beginPath();
    ctx.moveTo(x, l.y);
    ctx.lineTo(x + l.len, l.y);
    ctx.stroke();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the goal (field geometry, projected)
const POST_FAR = 214, POST_NEAR = 300, BAR_H = 24.4, BACK_X = 1200, BACK_H = 21;

/** The far side netting's point (x along the goal's depth, h up), pushed back by the ball. */
function sideNet(t: number, x: number, h: number) {
  const top = lerp(BAR_H, BACK_H, (x - 1180) / (BACK_X - 1180));
  const hh = Math.min(h, top);
  // Balloons around the ball: back (-z), and along x and up, so it reads from this near-side camera.
  const g = Math.exp(-(((x - SHOT_C.x) / 12) ** 2 + ((hh - 3) / 10) ** 2));
  const p = netPush(t) * g;
  return { x: x + p * 0.6, z: POST_FAR - p, h: hh + p * 0.25 };
}

function drawGoalBack(env: Env, c: Cam, t: number) {
  const ctx = env.ctx;
  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(232,236,246,0.62)';
  // Far side netting (it faces the camera), bulged back by the ball.
  ctx.beginPath();
  for (let x = 1180; x <= BACK_X + 0.01; x += 2) {
    for (let h = 0; h <= BAR_H + 0.01; h += 0.5) {
      const p = sideNet(t, x, h);
      const [px, py] = proj(c, p.x, p.z, p.h);
      if (h === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
  }
  for (let h = 0; h <= BAR_H; h += 2) {
    let first = true;
    for (let x = 1180; x <= BACK_X + 0.01; x += 1) {
      const top = lerp(BAR_H, BACK_H, (x - 1180) / (BACK_X - 1180));
      if (h > top) continue;
      const p = sideNet(t, x, h);
      const [px, py] = proj(c, p.x, p.z, p.h);
      if (first) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
      first = false;
    }
  }
  ctx.stroke();
  // Back netting (x = BACK_X), far corner to near corner, and the roof.
  ctx.strokeStyle = 'rgba(232,236,246,0.5)';
  ctx.beginPath();
  for (let z = POST_FAR; z <= POST_NEAR + 0.01; z += 3) {
    const a = proj(c, BACK_X, z, 0), b = proj(c, BACK_X, z, BACK_H), d = proj(c, 1180, z, BAR_H);
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.lineTo(d[0], d[1]);
  }
  for (let h = 0; h <= BACK_H + 0.01; h += 3) {
    const a = proj(c, BACK_X, POST_FAR, h), b = proj(c, BACK_X, POST_NEAR, h);
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
  }
  for (let x = 1183; x < BACK_X; x += 3) {
    const hh = lerp(BAR_H, BACK_H, (x - 1180) / (BACK_X - 1180));
    const a = proj(c, x, POST_FAR, hh), b = proj(c, x, POST_NEAR, hh);
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
  }
  ctx.stroke();
  // Back stanchion (white).
  ctx.strokeStyle = 'rgba(236,240,246,0.9)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  {
    const a = proj(c, BACK_X, POST_FAR, 0), b = proj(c, BACK_X, POST_FAR, BACK_H), d = proj(c, 1180, POST_FAR, BAR_H);
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.lineTo(d[0], d[1]);
  }
  ctx.stroke();
  post(ctx, c, POST_FAR);
  ctx.restore();
}

/** A goal post (white, 12 cm), a projected quad with a shaded edge. */
function post(ctx: CanvasRenderingContext2D, c: Cam, z: number) {
  const a = proj(c, 1179.4, z, 0), b = proj(c, 1180.6, z, 0), d = proj(c, 1180.6, z, BAR_H), e = proj(c, 1179.4, z, BAR_H);
  ctx.fillStyle = '#f4f6ff';
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.lineTo(d[0], d[1]);
  ctx.lineTo(e[0], e[1]);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#b8bcd8';
  const w = (b[0] - a[0]) * 0.3;
  ctx.fillRect(b[0] - w, d[1], w, a[1] - d[1]);
}

/** Near post and crossbar (in front of everything in the goal mouth). */
function drawGoalFront(env: Env, c: Cam) {
  const ctx = env.ctx;
  const a = proj(c, 1180, POST_FAR, BAR_H), b = proj(c, 1180, POST_NEAR, BAR_H);
  ctx.save();
  ctx.lineCap = 'butt';
  ctx.strokeStyle = '#f4f6ff';
  const n = 12;
  for (let i = 0; i < n; i++) {
    const u0 = i / n, u1 = (i + 1) / n;
    ctx.lineWidth = Math.max(1.5, 1.2 * K * lerp(a[2], b[2], (u0 + u1) / 2));
    ctx.beginPath();
    ctx.moveTo(lerp(a[0], b[0], u0), lerp(a[1], b[1], u0));
    ctx.lineTo(lerp(a[0], b[0], u1), lerp(a[1], b[1], u1));
    ctx.stroke();
  }
  post(ctx, c, POST_NEAR);
  ctx.restore();
}

interface KeeperImg {
  cv: HTMLCanvasElement;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
}

/** The keeper, rendered once per frame, placed by his field position (depth-scaled). */
function drawKeeper(env: Env, c: Cam, t: number): KeeperImg | null {
  const kp = keeperAt(t);
  const [x, yg, s] = proj(c, kp.x, kp.z, kp.h);
  const kw = (196 * s) / 95;
  const hw = VW / (2 * c.z);
  if (x < c.x - hw - 120 || x > c.x + hw + 120) return null;
  const r = renderPuppet(KEEPER_KIT, kp.pose, { k: KR, facing: -1 });
  const sc = kw / KR;
  const hipY = yg - 40 * kw;
  const out = { cv: r.cv, x: x - r.ox * sc, y: hipY - r.oy * sc, w: r.cv.width * sc, h: r.cv.height * sc, z: kp.z };
  const ctx = env.ctx;
  const [sx, sy, ss] = proj(c, kp.x - 1, kp.z, 0);
  ctx.fillStyle = 'rgba(6,14,8,0.35)';
  ctx.beginPath();
  ctx.ellipse(sx, sy, 34 * ss, 5 * ss, 0, 0, TAU);
  ctx.fill();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(out.cv, out.x, out.y, out.w, out.h);
  return out;
}

// ---------------------------------------------------------------- the thread
interface WPt {
  x: number;
  y: number;
  s: number;
}

const N_THREAD = 72;
/** Fractions (No.10 = 0 .. the X = 1) where the three eyes sit on the straightened line. */
const EYE_F = [960, 1032, 1068].map((x) => (x - LAYOUT.strike.x) / (LAYOUT.target.x - LAYOUT.strike.x));

/** The thread as it lay before the touch: along PATH from No.10 to path fraction uHead. */
function threadCurve(c: Cam, uHead: number): WPt[] {
  const out: WPt[] = [];
  for (let i = 0; i <= N_THREAD; i++) {
    const p = PATH.at((uHead * i) / N_THREAD);
    const [x, y, s] = proj(c, p.x, p.z, 0.15);
    out.push({ x, y, s });
  }
  return out;
}

/** The thread pulled taut: one straight line from No.10 to the head (world point), sampled like threadCurve. */
function threadTaut(c: Cam, head: [number, number]): WPt[] {
  const hf = FX0 + head[0] / K;
  const hh = Math.max(0, (GY - head[1]) / K);
  const out: WPt[] = [];
  for (let i = 0; i <= N_THREAD; i++) {
    const f = i / N_THREAD;
    // It lies on the turf; only its last few percent climbs to a raised head (the cocked boot at the plant).
    const [x, y, s] = proj(c, lerp(LAYOUT.strike.x, hf, f), lerp(LAYOUT.strike.z, ZP, f), hh * Math.pow(f, 40));
    out.push({ x, y, s });
  }
  out[N_THREAD] = { x: head[0], y: head[1], s: 1 };
  return out;
}

/** Drop the thread's leading points left of world x `xmin` (keeping one beyond), so off-screen stitches cost nothing. */
function fromX(pts: WPt[], xmin: number): WPt[] {
  let i = 0;
  while (i < pts.length - 2 && pts[i + 1].x < xmin) i++;
  return i ? pts.slice(i) : pts;
}

/** Arc fractions of the line's polyline at the eyes (pluck nodes). */
function eyeNodes(pts: WPt[]): number[] {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  const L = cum[cum.length - 1] || 1;
  return EYE_F.map((f) => cum[Math.round(f * (pts.length - 1))] / L);
}

/**
 * The running stitch (shot 4's): jade dashes that arch a little above the turf and dip "through" it, with two ink
 * needle holes per dip. `tight` 0..1 closes the dips into one continuous line (pulled taut); `sink` 0..1 shortens the
 * dashes into tight stitches (pulled through into the turf). Dash, dip and arch follow each point's depth scale.
 */
function stitch(ctx: CanvasRenderingContext2D, pts: WPt[], alpha: number, tight: number, sink = 0, phase = 0, thick = 1) {
  const n = pts.length;
  if (n < 2 || alpha <= 0) return;
  if (tight >= 0.999 && sink <= 0.001) {
    threadLine(ctx, pts, 2.4 * thick, alpha, { halo: 0.9 + 0.8 * (thick - 1) });
    return;
  }
  const cum = [0];
  for (let k = 1; k < n; k++) cum.push(cum[k - 1] + Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y));
  const L = cum[n - 1];
  let kk = 1;
  const at = (d: number): WPt => {
    if (d < cum[kk - 1]) kk = 1;
    while (kk < n - 1 && cum[kk] < d) kk++;
    const u = clamp((d - cum[kk - 1]) / Math.max(1e-6, cum[kk] - cum[kk - 1]));
    const a = pts[kk - 1], b = pts[kk];
    return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), s: lerp(a.s, b.s, u) };
  };
  ctx.save();
  // From the head backward, so the pattern stays locked to the head.
  let d = L - phase;
  let guard = 0;
  while (d > -40 && guard++ < 400) {
    kk = 1;
    const p0 = at(clamp(d, 0, L));
    const sc = Math.max(0.55, p0.s);
    const dashFull = 15 * sc, dipFull = 6 * sc;
    const dip = dipFull * (1 - tight) + sink * 9 * sc;
    const dash = Math.max(2, dashFull * (1 - 0.7 * sink) + dipFull * tight * (1 - sink));
    const d0 = Math.max(0, d - dash), d1 = Math.min(L, d);
    if (d1 > d0) {
      const seg: TrailPt[] = [];
      const m = Math.max(2, Math.ceil((d1 - d0) / 3));
      const arch = 4.2 * sc * (1 - tight) * (1 - sink);
      kk = 1;
      for (let k = 0; k <= m; k++) {
        const dd = lerp(d0, d1, k / m);
        const q = at(dd);
        const u = (dd - (d - dash)) / dash;
        seg.push({ x: q.x, y: q.y - arch * Math.sin(Math.PI * clamp(u)) });
      }
      threadLine(ctx, seg, clamp(2.2 * Math.max(0.8, p0.s), 1.6, 3), alpha, { halo: 0.9 });
      if (dip > 0.8) {
        ctx.fillStyle = HEX.ink;
        ctx.globalAlpha = alpha;
        kk = 1;
        for (const hd of [d0, d0 - dip]) {
          if (hd <= 0.5 || hd >= L - 0.5) continue;
          const q = at(hd);
          ctx.fillRect(Math.round(q.x - 0.5), Math.round(q.y - 0.5), 1.5, 1.5);
        }
      }
    }
    d -= dash + dip;
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the diptych
// Two panels slanted the same way (one diagonal paper gutter between their fingertips), chest-up at x2.
const PANEL_W = 184, PANEL_H = 152, PANEL_DEG = -3;
const LEFT = panelPoly(VW / 2 - 98, 170, PANEL_W, PANEL_H, PANEL_DEG);
const RIGHT = panelPoly(VW / 2 + 98, 170, PANEL_W, PANEL_H, PANEL_DEG);
type Q7Key = No7Key | 'Q2b';
const P10: readonly (readonly [number, No10Key])[] = [[DIP, 'P1'], [1.5, 'P2'], [1.6, 'P3a'], [1.95, 'P3b'], [2.1, 'P3a']];
const Q7: readonly (readonly [number, Q7Key])[] = [[DIP, 'Point.Q1'], [1.55, 'Point.Q2'], [2.16, 'Q2b'], [2.28, 'Point.Q2']];
function pick<Kk>(seq: readonly (readonly [number, Kk])[], t: number): Kk {
  let k = seq[0][1];
  for (const [s, f] of seq) if (t >= s - 1e-6) k = f;
  return k;
}
const FIG_Y = 302; // feet (below the panel): a chest-up crop
const TIP_Y = FIG_Y - 2 * (102 - 41);
const X10 = 248, X7 = VW - 248;

/**
 * A diptych panel's backdrop: warm paper, a dotted manga vignette, and ink focus lines converging on the gutter where
 * the two fingertips and the thread meet. side -1 = left panel, 1 = right panel.
 */
function panelBack(ctx: CanvasRenderingContext2D, side: -1 | 1, t: number) {
  const cx = VW / 2 + side * 98;
  ctx.fillStyle = HEX.paper;
  ctx.fillRect(cx - 120, 70, 240, 210);
  // A dotted manga vignette (screentone growing toward the corners).
  screentone(ctx, [cx - 112, 86, 224, 172], 4, 0.42, { corners: 0.55 });
  // Ink focus lines converging on the gutter, where their fingertips and the thread meet (a fixed burst that
  // breathes a little, never flickers).
  const k = 1 + 0.04 * Math.sin(t * 9);
  focusLines(ctx, new Rng(side < 0 ? 6101 : 6102), VW / 2, TIP_Y, 46 * k, 330, 54, HEX.ink, 0.2, 3);
}

function drawQ7(env: Env, key: Q7Key, x: number, y: number) {
  if (key === 'Q2b' && hasAnim('No7Point')) {
    const a = anim('No7Point');
    const i = findFrame(a, 'Q2b');
    if (i >= 0 && a.frames[i].name === 'Q2b') {
      drawAnim(env.ctx, a, null, i, x, y, D2, { flip: true, pivot: a.anchorOf(i) });
      return;
    }
  }
  drawNo7(env, key === 'Q2b' ? 'Point.Q2' : key, x, y, D2, { flip: true });
}

/** A small four-point pearl star (the glint on his boot). */
function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: number) {
  if (a <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = clamp(a);
  ctx.fillStyle = HEX.pearl;
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.14, 0);
    ctx.lineTo(-r * 0.14, 0);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the shot

export const shotTouch: Shot = {
  name: 'First touch',
  dur: DUR,
  seed: 406,
  rate: (t) => warp(t, STOPS),
  cues: [
    { at: TOUCH, fn: (env) => (env.sfx.kick(0.4), env.sfx.pluck(N.D6, 1.4, 0.6), env.sfx.boom(0.4)) },
    { at: 0.4, fn: (env) => (env.sfx.whoosh(0.5, 200, 1500, 0.5), env.sfx.crowd(2.6, 0.5)) },
    { at: PULL0, fn: (env) => env.sfx.zip(0.25, 3000, 800) },
    { at: STRIKE, fn: (env) => env.sfx.kick(0.7) },
    { at: NET, fn: (env) => (env.sfx.strain(0.4, 0.2), env.sfx.crack(0.3)) },
    { at: GOAL_T, fn: (env) => env.sfx.whistle() },
    { at: 1.42, fn: (env) => env.sfx.strum([N.D4, N.A4, N.E5, N.Fs5, N.A5, N.D6], 0.025) },
    { at: CARD, fn: (env) => env.sfx.blip(880) },
  ],
  prepare(env) {
    prepareInk(env.ctx);
    prepareGrassFore();
    resolveAnchors();
    buildStatic();
  },
  init(env) {
    env.sfx.clearBus();
    resolveAnchors(); // cheap; follows the studio art if it was (re)loaded after prepare()
    if (!TUFTS.length) buildStatic();
    spin = new BallSpin();
    prevTravel = travelled(0);
    touched = struck = netted = goalBurst = landed = false;
    const c = camAt(0);
    env.cam.set(c.x, c.y, c.z, 0);
    env.cam.shakeAmp = 7;
    env.cam.shakeRoll = 0; // no camera roll in this move
  },
  update(env, t, dt) {
    const { rng, parts, cam } = env;
    const c = camAt(t);
    cam.set(c.x, c.y, c.z, 0);
    // The ball's roll (the texture turns with the distance travelled), a touch of sidespin before the touch.
    if (t < STRIKE) {
      const d = travelled(t);
      spin.rotate(0, 0, 1, (d - prevTravel) / (BALL_R * D2));
      prevTravel = d;
      if (t < TOUCH) spin.rotate(0, 1, 0, -5 * dt);
    } else {
      spin.rotate(0, 0, 1, 26 * dt);
      spin.rotate(0, 1, 0, -10 * dt);
    }
    if (!touched && t >= TOUCH) {
      touched = true;
      cam.hit(0.14);
      const [bx, by] = ballPre(c, TOUCH);
      // Jade motes and pearl specks off the contact (no ring, no burst): they fade within ~20 px.
      for (let i = 0; i < 12; i++) {
        const a = rng.range(-Math.PI, 0);
        const sp = rng.range(40, 110);
        parts.spawn({
          kind: PK.Pixel, x: bx - 8, y: by + rng.range(-4, 6), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 6,
          max: rng.range(0.18, 0.32), s0: rng.range(1.5, 2.6), s1: 1, ramp: 'jade', r0: i % 3 ? 0.15 : 0, r1: 0.7, add: true, layer: 1,
        });
      }
      for (let i = 0; i < 4; i++) {
        const a = rng.range(-2.6, -1.4);
        const sp = rng.range(60, 150);
        parts.spawn({
          kind: PK.Pixel, x: bx + rng.range(-6, 6), y: GY - 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, ay: 700, drag: 1,
          max: rng.range(0.3, 0.5), s0: 2, s1: 1.5, ramp: 'grass', r0: rng.next(), r1: 0.8, add: false, layer: 1,
        });
      }
    }
    if (!struck && t >= STRIKE) {
      struck = true;
      cam.hit(0.16);
      const [bx] = ballPre(c, STRIKE);
      for (let i = 0; i < 6; i++) {
        const a = rng.range(-2.8, -1.2);
        const sp = rng.range(80, 200);
        parts.spawn({
          kind: PK.Pixel, x: bx + rng.range(-8, 4), y: GY - 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, ay: 800, drag: 1,
          max: rng.range(0.3, 0.55), s0: rng.range(1.5, 2.5), s1: 1.5, ramp: 'grass', r0: rng.next(), r1: 0.8, add: false, layer: 1,
        });
      }
    }
    if (!landed && t >= GK_D1) {
      landed = true;
      const kp = keeperAt(GK_D1);
      const [kx, ky] = proj(c, kp.x, kp.z, 0);
      for (let i = 0; i < 6; i++) {
        parts.spawn({
          kind: PK.Smoke, x: kx + rng.range(-30, 40), y: ky - rng.range(0, 4), vx: rng.range(-40, 60), vy: -rng.range(6, 30), drag: 3,
          max: rng.range(0.5, 0.9), s0: rng.range(5, 8), s1: rng.range(14, 22), ramp: 'dust', r0: 0, r1: 1, a0: 0.4, a1: 0, add: false, layer: 0,
        });
      }
    }
    if (!netted && t >= NET) {
      netted = true;
      cam.hit(0.35);
    }
    // GOAL!: confetti (screen space, layer 2) from both top corners, then a drizzle from the top edge.
    if (t >= GOAL_T) {
      if (!goalBurst) {
        goalBurst = true;
        for (let i = 0; i < 36; i++) {
          const left = i % 2 === 0;
          parts.spawn({
            kind: PK.Confetti, x: left ? -8 : VW + 8, y: rng.range(10, 110), vx: (left ? 1 : -1) * rng.range(150, 380), vy: rng.range(-170, -30),
            ay: 160, drag: 1.4, vrot: rng.range(-9, 9), max: rng.range(2.0, 2.8), s0: rng.range(5, 8), s1: 5, a0: 1, a1: 1, add: false,
            color: rng.pick(CONFETTI), k: rng.next(), layer: 2,
          });
        }
      }
      if (rng.next() < (t < GOAL_T + 0.6 ? 0.9 : 0.5)) {
        parts.spawn({
          kind: PK.Confetti, x: rng.range(-10, VW + 10), y: -10, vx: rng.range(-40, 40), vy: rng.range(30, 100),
          ay: 45, drag: 0.9, vrot: rng.range(-8, 8), max: rng.range(2.6, 3.4), s0: rng.range(4, 6.5), s1: 4.5, a0: 1, a1: 1, add: false,
          color: rng.pick(CONFETTI), k: rng.next(), layer: 2,
        });
      }
    }
  },
  render(env, t) {
    const { ctx, fx } = env;
    const c = camAt(t);
    const n7 = no7At(t);
    const toScreen = (x: number, y: number): [number, number] => {
      const [u, v] = env.cam.toUV(x, y);
      return [u * VW, v * VH];
    };

    // ================= environment (inked until the colour washes back)
    env.world();
    drawEnvironment(env, c, t);
    const showGoal = t >= PLANT - 0.08;
    if (showGoal) drawGoalBack(env, c, t);
    env.parts.draw(ctx, 0);
    // While the page is still (partly) inked the keeper is part of it; afterwards he is depth-sorted with the ball.
    const kpEarly = showGoal && t < 0.74;
    if (kpEarly) drawKeeper(env, c, t);
    if (showGoal) drawGoalFront(env, c);

    // ---- the thread's geometry (it also carries the colour wash)
    const [bx, by] = t < STRIKE ? ballPre(c, t) : [0, 0];
    let head: [number, number];
    if (t < TOUCH) head = [bx - BALL_R * D2 * 0.8, by + 2];
    else if (t < RELEASE) head = no7Point(env, 'Receive.R2', 'boot', C1, GY, D2);
    else if (t < PLANT) head = [C2 + 2, GY - 4];
    else head = no7Point(env, 'Receive.R4', 'boot', C3, GY, D2);
    const taut = threadTaut(c, head);
    const tightK = t < TOUCH ? 0 : ease.outBack(clamp((t - TOUCH) / 0.06));
    let line: WPt[];
    if (t < TOUCH) {
      line = threadCurve(c, 1 - behind(sim(t)) / K / PATH.length);
      line[line.length - 1] = { x: head[0], y: head[1], s: line[line.length - 1].s };
    } else {
      const curve = threadCurve(c, 1);
      line = curve.map((p, i) => ({ x: lerp(p.x, taut[i].x, tightK), y: lerp(p.y, taut[i].y, tightK), s: lerp(p.s, taut[i].s, clamp(tightK)) }));
    }

    // ---- the ink page, released along the thread from the touch
    const wash = clamp((t - TOUCH) / WASH_LEN);
    // Slow out of the contact, so the front (and its pearl glint) visibly crosses the frame back toward No.10.
    const run = Math.pow(clamp(wash / 0.6), 2.2);
    if (wash < 1) {
      let restore: { pts: TrailPt[]; w: number } | undefined;
      if (t >= TOUCH) {
        const pts: TrailPt[] = [];
        for (let i = N_THREAD; i >= 0; i--) {
          if (1 - i / N_THREAD > run && pts.length > 1) break;
          pts.push(taut[i]);
        }
        restore = { pts, w: 18 + 60 * wash + 1000 * wash * wash * wash };
      }
      inkGrade(ctx, 0.85, restore);
    }
    // Ink focus lines on the contact through the freeze (a fixed pattern: a freeze never flickers).
    if (t >= TOUCH && t < RELEASE + 0.06) {
      env.screen();
      const [sx, sy] = toScreen(head[0], head[1]);
      focusLines(ctx, new Rng(6071), sx, sy, 70 * c.z, 760, 52, HEX.ink, 0.5 * (1 - clamp((t - RELEASE) / 0.06)) * (1 - wash * 0.5), 3);
      env.world();
    }

    // ================= colour layer: thread, ball, No.7, the keeper (after the wash), particles
    if (t < TOUCH) {
      env.screen();
      runLines(ctx, t);
    }
    env.world();
    // Contact shadow under him.
    {
      const pel = n7.x + rel(n7.key, 'pelvis')[0];
      ctx.fillStyle = wash >= 1 ? 'rgba(6,16,8,0.3)' : 'rgba(13,13,20,0.24)';
      ctx.beginPath();
      ctx.ellipse(pel + 4, GY + 1, 46, 5, 0, 0, TAU);
      ctx.fill();
    }
    // Shot 5's target carried across the cut: the cross-stitch X on the turf where ball and stride will meet.
    if (t < 0.25) {
      const xa = 1 - ease.inQuad(t / 0.25);
      const [xx, xy] = proj(c, FX0, ZP);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.emerald), xx, xy, 30, 0.45 * xa);
      ctx.restore();
      crossStitch(ctx, xx, xy, 13, xa, 0.16);
    }
    // The thread.
    const viewL = c.x - VW / (2 * c.z) - 40;
    if (t < TOUCH) {
      stitch(ctx, fromX(line, viewL), 1, 0);
    } else if (t < PULL1) {
      const amp = 7 * Math.exp(-(t - TOUCH) / 0.22) * (t < PULL0 ? 1 : 0.6);
      let pts = line;
      if (amp > 0.05) {
        const pl = pluckLine(line, { amp, phase: (t - TOUCH) * 80, nodes: eyeNodes(line) });
        pts = pl.map((p, i) => ({ x: p.x, y: p.y, s: line[i].s }));
      }
      if (t >= PULL0) {
        // Pulled through: the tail runs to the head (off-screen up to the left edge first, then visibly along the turf).
        const hwv = VW / (2 * c.z);
        let fL = 0;
        for (let i = 0; i <= N_THREAD; i++) if (pts[i].x < c.x - hwv) fL = i / N_THREAD;
        const k1 = clamp((t - PULL0) / 0.06), k2 = clamp((t - PULL0 - 0.06) / (PULL1 - PULL0 - 0.06));
        const tail = k2 > 0 ? lerp(fL, 1, ease.inOutQuad(k2)) : lerp(0, fL, ease.inQuad(k1));
        const i0 = Math.min(N_THREAD - 1, Math.floor(tail * N_THREAD));
        const sink = ease.inOutQuad(clamp((t - PULL0) / (PULL1 - PULL0)));
        // Still taut (tight 1, no arch): as `sink` grows the solid line breaks into shortening dashes with ink holes.
        stitch(ctx, fromX(pts.slice(i0), viewL), 1 - 0.25 * sink, 1, sink, (t - PULL0) * 60);
      } else {
        stitch(ctx, fromX(pts, viewL), 1, Math.min(1, tightK), 0, 0, 1 + 0.6 * clamp(tightK) * (1 - clamp((t - RELEASE) / 0.1)));
        // A pearl glint runs back along the line with the colour front.
        const g = pts[Math.max(0, Math.min(N_THREAD, Math.round((1 - run) * N_THREAD)))];
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, glowOf([251, 246, 234]), g.x, g.y, 14 * Math.max(0.6, g.s), 0.9 * (1 - wash));
        ctx.globalCompositeOperation = 'source-over';
      }
    }
    // The ball before the strike (behind him until his touch: it runs in on the far side of his standing foot).
    const ballGlow = t < TOUCH ? 0.85 : 0.85 * (1 - clamp((t - TOUCH) / 0.3));
    const drawBallPre = () => drawBall(env, spin, bx, by, BALL_R, D2, 0, ballGlow, ballGlow > 0.02 ? 'pearl' : 'fire');
    if (t < TOUCH) drawBallPre();
    // The keeper in the colour layer.
    const kp = showGoal && !kpEarly ? drawKeeper(env, c, t) : null;
    // No.7.
    drawNo7(env, n7.key, n7.x, GY, D2);
    if (t >= TOUCH && t < STRIKE) drawBallPre();
    // The almond needle-eye glint in the mesh where the ball lands (1.12): the thread's last echo.
    {
      const ng = t >= NET ? clamp(1 - (t - NET) / 0.45) : 0;
      if (ng > 0) {
        const [nx, ny, ns] = proj(c, SHOT_C.x, SHOT_C.z - netPush(t), 2.2);
        needleEye(ctx, nx, ny, 84 * ns + 16, ease.outBack(clamp((t - NET) / 0.08)) * (0.6 + 0.4 * ng), -0.25, ng, 1);
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, glowOf([251, 246, 234]), nx, ny, 26 * ng + 6, 0.55 * ng);
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    // The finish.
    if (t >= STRIKE) {
      const f = ballShotField(t);
      const [x, y, s] = proj(c, f.x, f.z, f.h);
      // A short white motion streak (a plain ball: it is No.10's special, not No.7's).
      if (t < NET) {
        const p0 = ballShotField(Math.max(STRIKE, t - 0.05));
        const [x0, y0] = proj(c, p0.x, p0.z, p0.h);
        ctx.save();
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#ffffff';
        for (const [w, a] of [[11 * s, 0.18], [6 * s, 0.4], [2.5 * s, 0.75]] as const) {
          ctx.globalAlpha = a;
          ctx.lineWidth = w;
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
        ctx.restore();
      }
      const big = s >= 0.75;
      drawBall(env, spin, x, y, big ? BALL_R : Math.max(2, Math.round(BALL_R * D2 * s)), big ? D2 : 1, 0, 0, 'fire');
      // The keeper is nearer than the ball while it passes him: draw him over it.
      if (kp && f.z < kp.z && x > kp.x && x < kp.x + kp.w) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(kp.cv, kp.x, kp.y, kp.w, kp.h);
      }
    }
    env.parts.draw(ctx, 1);
    // The pearl glint on his boot as the last stitch pulls through (0.75).
    {
      const g = pulse(t, PULL1, 0.09);
      if (g > 0) {
        const [gx, gy] = t < STRIKE ? no7Point(env, 'Receive.R4', 'boot', C3, GY, D2) : no7Point(env, 'Receive.R5', 'boot', C3, GY, D2);
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, glowOf([251, 246, 234]), gx, gy, 10 * g + 4, 0.6 * g);
        drawGlow(ctx, glowOf([150, 255, 200]), gx, gy, 22 * g, 0.25 * g);
        ctx.globalCompositeOperation = 'source-over';
        star(ctx, gx, gy, 5 + 8 * ease.outCubic(1 - g), g);
      }
    }
    // ================= screen space
    env.screen();
    // Foreground grass: nearer than his plane, smeared by the rail.
    {
      const vx = t < PLANT ? VR : VR * Math.exp(-(t - PLANT) / 0.15);
      drawGrassFore(ctx, c.x * c.z * 1.5, clamp(vx / VR) * 16, { y: VH + 12 + 30 * ease.inOutCubic(clamp((t - PLANT) / 0.3)) });
    }
    env.parts.draw(ctx, 2);
    // The diptych: fingertip to fingertip.
    if (t >= DIP) {
      // Slammed in from both sides (a short overshoot, so the panels never cover each other), 2 frames apart.
      const slide = (u: number) => 1 + 0.04 * Math.sin(Math.PI * clamp((u - 0.75) / 0.25)) - Math.pow(1 - clamp(u / 0.75), 3);
      const slideL = slide(clamp((t - DIP) / 0.16));
      const slideR = slide(clamp((t - DIP - 2 / 60) / 0.16));
      const k10 = pick(P10, t), k7 = pick(Q7, t);
      mangaPanels(ctx, [
        { poly: LEFT, dx: lerp(-330, 0, slideL), fill: '#ece3d1', draw: (cx) => (panelBack(cx, -1, t), drawNo10(env, k10, X10, FIG_Y, D2)) },
        { poly: RIGHT, dx: lerp(330, 0, slideR), fill: '#ece3d1', draw: (cx) => (panelBack(cx, 1, t), drawQ7(env, k7, X7, FIG_Y)) },
      ], t);
      const both = clamp((t - 1.6) / 0.06);
      if (both > 0) {
        const a = no10Point(env, 'P3a', 'tip', X10, FIG_Y, D2);
        const b = no7Point(env, 'Point.Q2', 'tip', X7, FIG_Y, D2, { flip: true });
        const ax = a[0] + 1, ay = a[1], bx2 = b[0] - 1, by2 = b[1];
        const ex = lerp(ax, bx2, ease.outCubic(both));
        const pl = t > 1.66 ? { amp: 2 * Math.exp(-(t - 1.66) / 0.15), phase: (t - 1.66) * 70, nodes: 0 } : undefined;
        threadLine(ctx, [{ x: ax, y: ay }, { x: (ax + ex) / 2, y: (ay + by2) / 2 }, { x: ex, y: lerp(ay, by2, ease.outCubic(both)) }], 2, 1, { pluck: pl });
        // A pearl glint travels along it, No.10 to No.7, then again, softer.
        for (const [g0, g1, al] of [[1.68, 1.9, 1], [2.02, 2.24, 0.6]] as const) {
          const u = (t - g0) / (g1 - g0);
          if (u < 0 || u > 1) continue;
          const e = ease.inOutQuad(u);
          const gx = lerp(ax, bx2, e), gy = lerp(ay, by2, e);
          const w = Math.sin(Math.PI * u);
          ctx.globalCompositeOperation = 'lighter';
          drawGlow(ctx, glowOf([251, 246, 234]), gx, gy, 12, al * w);
          drawGlow(ctx, glowOf([150, 255, 200]), gx, gy, 22, 0.4 * al * w);
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = HEX.pearl;
          ctx.globalAlpha = al * w;
          ctx.fillRect(Math.round(gx - 1), Math.round(gy - 1), 3, 3);
          ctx.globalAlpha = 1;
        }
      }
    }
    // GOAL! (pearl fill, jade stroke, ink outer stroke), then it shrinks up and holds small over the diptych.
    if (t >= GOAL_T) {
      // Every letter has settled by ~1.43; it holds clean above the panel tops, then shrinks from 1.5.
      const shrink = ease.inOutCubic(clamp((t - 1.5) / 0.16));
      ctx.save();
      ctx.translate(VW / 2, lerp(84, 58, shrink));
      const sc = lerp(1, 0.52, shrink);
      ctx.scale(sc, sc);
      slamTitle(ctx, 'GOAL!', 0, 0, 76, t - GOAL_T, { ...TITLE_STYLE, stagger: 0.02, skew: -0.14 });
      ctx.restore();
    }
    if (t >= CARD) nameCard(ctx, t - CARD);

    // ================= post
    meridianGrade(fx, wash < 1);
    // The inked page's contrast eases out with the wash (no one-frame step when it completes).
    fx.contrast = lerp(1.08, 1, ease.inOutQuad(wash));
    fx.vignette = 0.3;
    // The push-in's radial blur carried over the cut from shot 5, then the whip-pan's.
    {
      const [nsx, nsy] = toScreen(n7.x, GY - 20);
      fx.radial = 0.06 * (1 - clamp(t / 0.07));
      fx.radialX = nsx / VW;
      fx.radialY = nsy / VH;
    }
    if (t >= STRIKE + 0.01 && t < 0.92) {
      const f = ballShotField(t);
      const [x, y] = proj(c, f.x, f.z, f.h);
      const [sx, sy] = toScreen(x, y);
      // Ends by 0.92, so the keeper's late dive (from 0.89) reads sharp as the ball slips past his gloves.
      fx.radial = 0.28 * ease.outCubic(clamp((t - STRIKE - 0.01) / 0.04)) * (1 - ease.inOutQuad(clamp((t - 0.85) / 0.07)));
      fx.radialX = sx / VW;
      fx.radialY = sy / VH;
    }
    if (t > FADE0) {
      fx.flash = ease.inQuad(clamp((t - FADE0) / (DUR - FADE0)));
      fx.flashColor = FADE_RGB;
    }
  },
};
