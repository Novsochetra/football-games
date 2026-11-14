// SHOT 4 — AIR STEPS (2.6 s): the ball's scene (SPEC.md §4). No.10 is off screen.
//
// A side rail at grass level, locked to the ball (held at 0.38·VW, zoom 1.6, the horizon always level). The ball
// rips in from the left on a camera that is still catching up, then the rail takes off with it: three air steps,
// each a dip to 0.15 m over a flash of crushed air (it never touches the grass) that stamps a ring of flattened turf
// and springs it higher (0.7 m, 1.2 m, then the launch toward 2.3 m). Defender 1 steps across and jump-blocks; step 2
// skims under his studs in a hit-stop; a beat later, in the mute, the LATE BOOM: the Mach cone's trailing edge
// catches him on the way down, flings and spins him into a comic heap, opens a V-shaped wake in the grass, a
// near-planar refraction band crosses the frame, the camera is knocked back and the full stadium slams back in.
// Defender 2, one plane back, plants, snaps round and cowers as it rips past in front of him with daylight under it;
// a smaller late boom spins him down. Step 3,
// the biggest, at the edge of the six-yard box, launches it steeply up; the camera tilts after it (towers at the top
// of frame, never sky), the goal and the set keeper slide in, and a whip zoom (radial <= 0.35) ends on a cyan blink.
//
// Scale: 1 puppet unit = 1 world px (puppets k 0.8 at draw scale 1.25), 53 world px per metre (a defender is the
// 1.8 m ruler), and at zoom 1.6 every puppet and ball pixel is exactly 2 screen px.
// Clock: the brief's beats run on the unwarped t; the world (ball, defenders) runs on the warped clock W(t) (the
// 0.72-0.82 hit-stop), as pure functions, so any frame can be seeked exactly. Particles spawn only in update().

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { TAU, Rng, clamp, ease, lerp, noise1 } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { speedStreaks, type TrailPt } from '../../art/fx';
import { FIELD, drawFieldBackdrop } from '../../art/stadium';
import { KEEPER_KIT, P, POSES, RIVAL_KIT, RIVAL_KIT_B, drawPuppet, joints, mixPose, poseAt, renderPuppet, type Kit, type Pose } from '../../art/puppet';
import {
  BALL_H, BLINK, HEX, MUFFLE, PAL, STAMPS, Trail, airStepHeight, drawBall, drawStamp, galeGrade, isobars, machCone, sparkleCyan,
  machWake, recoilSpring, refractionBand, stampShock, vaporRibbon,
} from './common';

// ---------------------------------------------------------------- timing (shot-local, unwarped)
const DUR = 2.6;
const T1 = STAMPS[0].t4, T2 = STAMPS[1].t4, T3 = STAMPS[2].t4; // 0.35, 0.72, 1.85
const HS0 = 0.72, HS1 = 0.82, HS_RATE = 0.12; // the hit-stop over step 2
const BOOM1 = 0.92, BOOM2 = 1.55;
const D1_PLANT = 0.56, D1_JUMP = 0.62;
const D2_PLANT = 1.1, D2_FLINCH = 1.16, D2_PASS = 1.28;
const WHIP = 2.35;
const SLIVER = 0.08;

/** The warped (simulation) clock: the world runs at 12 % through the hit-stop. */
function W(t: number) {
  if (t < HS0) return t;
  if (t < HS1) return HS0 + (t - HS0) * HS_RATE;
  return t - (HS1 - HS0) * (1 - HS_RATE);
}

// ---------------------------------------------------------------- scale and layout
const Z0 = 1.6, Z1 = 2.2;
/** World px per metre (a 1.8 m defender puppet is 95 units = 95 world px). */
const PXM = 53;
/** Puppet pixels per unit and draw scale: k·D = 1 world px per unit, 2 screen px per puppet pixel at zoom 1.6. */
const PK_K = 0.8, PK_D = 1.25;
/** Ball art radius and draw scale (2 screen px per ball pixel at zoom 1.6: about 26 px across). */
const BALL_R = 6, BALL_D = 1.25;
/** The ball's outer radius in world px (art + outline). */
const BALL_RW = (BALL_R + 1) * BALL_D;
/** World y of the ball's ground line, and the camera's eye height above the turf (grass level). */
const GY = 300, HH = 28;
const HZ = GY - HH;
/** The ball's centre sits OFF world px above h·PXM, so a 0.15 m dip still leaves >= 4 px of air under it. */
const OFF = 5;
/** Horizontal speed on the rail (world px/s) and the start x. */
const V = 375;
const X0 = 160;
/** After step 3 the climb is added on top of the rail speed: the horizontal part only eases to 90 % over 0.35 s, so
 *  the total speed holds (~375 world px/s) and the launch reads as fired toward the corner, never as losing power. */
const VX_END = 0.9, LAUNCH = 0.35;
/** Screen x the ball is held at, and the screen y of its ground line at the 0.15 m dip. */
const LOCK_X = 0.38 * VW;
const GROUND_SY = 290;
/** Camera entrance: it holds still for CAM_A s (the ball rips in from the left), then accelerates to the rail speed over CAM_T. */
const CAM_A = 0.17, CAM_T = 0.46;

// ---------------------------------------------------------------- the ball's flight (pure functions of t)

/** The release after the hit-stop: the ball slingshots away (up to ~2x rail speed over 0.82-0.94), so by the late
 *  boom it is clearly gone from under him. Seconds of rail travel gained. */
const SLING = 0.08, SLING_T = 0.12;
const sling = (t: number) => SLING * ease.inOutQuad(clamp((t - HS1) / SLING_T));
const slingRate = (t: number) => {
  const u = (t - HS1) / SLING_T;
  return u <= 0 || u >= 1 ? 0 : (SLING / SLING_T) * (u < 0.5 ? 4 * u : 4 * (1 - u));
};
/** The ball's rail clock: the warped clock plus the slingshot. */
const railT = (t: number) => W(t) + sling(t);

function ballX(t: number) {
  if (t <= T3) return X0 + V * railT(t);
  const q = t - T3, u = Math.min(q / LAUNCH, 1);
  const integ = u < 1 ? LAUNCH * (u * u * u - (u * u * u * u) / 2) : LAUNCH * 0.5 + (q - LAUNCH);
  return X0 + V * railT(T3) + V * (q - (1 - VX_END) * integ);
}

/** Between steps 2 and 3 the arc peaks a touch late (52 %), so the ball is still climbing (~1.18 m) as it whips past
 *  defender 2 at 1.28, and the descent into the big step stays nearly symmetric (never a steep dive). 0..1, slope 0
 *  at the peak. */
function arc23(u: number) {
  const P = 0.52;
  if (u < P) {
    const v = u / P;
    return v * (2 - v);
  }
  const v = (u - P) / (1 - P);
  return 1 - v * v;
}

/** Height above the turf (m): starts 0.4, dips to 0.15 at each step, peaks 0.7 / 1.2, launches toward 2.3. Between
 *  steps 2 and 3 it runs on the warped clock, so the ball hangs under his studs through the hit-stop. */
function heightM(t: number) {
  if (t <= T2) return airStepHeight(t);
  if (t <= T3) return BALL_H.dip + (BALL_H.peaks[1] - BALL_H.dip) * arc23((W(t) - W(T2)) / (W(T3) - W(T2)));
  return airStepHeight(t, 3.0); // still climbing at the cut: shot 5 carries it on up under the bar
}

/** The ball centre's height above GY (world px). */
const ballH = (t: number) => heightM(t) * PXM + OFF;
const H_DIP = 0.15 * PXM + OFF;
const ballY = (t: number) => GY - ballH(t);

/** Travel direction (radians, screen convention), smoothed over a few frames so it never snaps at a dip. */
function ballDir(t: number) {
  const e = 0.035;
  const dx = ballX(t + e) - ballX(t - e), dy = ballY(t + e) - ballY(t - e);
  return Math.atan2(dy, Math.max(1e-3, dx));
}

// ---------------------------------------------------------------- camera (pure function of t, plus shake)

/** How far (world px) the camera still trails its lock at time t (it starts at rest, then catches the ball). */
function lagWorld(t: number) {
  if (t < CAM_A) return V * (CAM_A - t) + V * CAM_T * 0.5;
  const u = (t - CAM_A) / CAM_T;
  if (u >= 1) return 0;
  return V * CAM_T * (0.5 - u + u * u * u - (u * u * u * u) / 2);
}
/** The camera's horizontal speed as a fraction of the rail's (0 at rest), for streaks and blur. */
function camSpeed(t: number) {
  if (t < CAM_A) return 0;
  const u = clamp((t - CAM_A) / CAM_T);
  let s = u * u * (3 - 2 * u);
  if (t >= HS0 && t < HS1) s *= HS_RATE;
  s *= 1 + slingRate(t);
  if (t > T3) s *= 1 - (1 - VX_END) * clamp((t - T3) / LAUNCH);
  return s;
}

const zoomAt = (t: number) => lerp(Z0, Z1, ease.inCubic(clamp((t - WHIP) / (DUR - WHIP))));

/** The pressure lag after each late boom: the camera is knocked back and springs after the ball (screen px). */
const knock = (t: number) => recoilSpring(t, BOOM1, 30) + recoilSpring(t, BOOM2, 16);

/** Damped vertical follow: a short running average of the ball's height. */
function smoothH(t: number) {
  let s = 0;
  for (let i = 0; i < 6; i++) s += ballH(Math.max(0, t - i * 0.03));
  return s / 6;
}
/** Follow ratio: 25 % through the steps, rising after step 3 (the tilt up after the launch; capped so the top edge
 *  stops at the lamp row, never sky). */
const follow = (t: number) => 0.25 + 0.11 * ease.inOutQuad(clamp((t - T3 + 0.05) / 0.45));

interface Frame { x: number; y: number; z: number; bsx: number; bsy: number }
/** The ball's screen position (zoom-independent framing) and the camera that puts it there. */
function frameAt(t: number): Frame {
  const z = zoomAt(t);
  const bsx = LOCK_X - lagWorld(t) * Z0 + knock(t);
  const gys = GROUND_SY + follow(t) * (smoothH(t) - H_DIP) * Z0;
  const bsy = gys - ballH(t) * Z0;
  return { x: ballX(t) - (bsx - VW / 2) / z, y: ballY(t) - (bsy - VH / 2) / z, z, bsx, bsy };
}

// ---------------------------------------------------------------- the cast (pure functions of t)

/** World x of each landmark, from the ball's flight (stamps sit where the ball dipped). */
const XS = STAMPS.map((s) => ballX(s.t4));
const XD1 = XS[1] + 6; // his hip, so his boots hang right over the ball at the dip
/** Defender 2 stands one plane deeper than the ball's line, so the ball clearly whips past IN FRONT of him (he is
 *  smaller, his feet and shadow sit higher up the turf than the ball's). He lives in plane coordinates: gp() projects
 *  his x and ground, and his joints stay 1 unit = 1 px in that plane. */
const D2_S = 0.8;
/** His hip mark, re-solved so the projected hip still meets the ball at D2_PASS. */
const XD2 = (() => {
  const c = frameAt(D2_PASS).x;
  return c + (ballX(D2_PASS) + 2 - c) / D2_S;
})();
const XP = XS[1] + 22; // the 18-yard line: defender 1 blocks at the edge of the box
const X6 = XS[2] - 3; // the six-yard line: step 3 lands on its edge
/** The keeper, set a metre off his line: his hip enters at the right edge at 2.00 (never on the step-3 frame), so the
 *  goal and the keeper slide in by parallax over 2.00-2.35. */
const XK = ballX(2.0) + (VW + 30 - LOCK_X) / Z0;
const XG = XK + 50; // goal line

const RUN: [number, Pose][] = [[0, POSES.run1], [0.25, POSES.run2], [0.5, POSES.run3], [0.75, POSES.run4], [1, POSES.run1]];
/** Gathering for the jump: knees loaded, arms swung back, both boots on the turf (a two-footed take-off). */
const GATHER = P({ torso: 0.36, head: -0.2, thighN: 0.7, kneeN: 1.1, footN: -0.05, thighF: 0.55, kneeF: 1.05, footF: -0.2, armN: -0.75, elbowN: 0.35, armF: -0.55, elbowF: 0.4 });
/** Defender 2's set block: wide, low, arms out. */
const SET = P({ torso: 0.2, head: -0.12, thighN: 0.42, kneeN: 0.7, footN: -0.1, thighF: -0.18, kneeF: 0.5, armN: 0.5, elbowN: 0.6, armF: -0.35, elbowF: 0.7 });
/** Defender 2 turns his back on it (ending up facing the goal). TURN is the in-between he snaps round through,
 *  pivoting on the planted far boot with the free knee up and its boot tucked right over it (so the flip never pops it). */
const TURN = P({ torso: 0.05, head: 0.2, thighN: 0.45, kneeN: 1.35, thighF: 0.1, kneeF: 0.4, armN: 1.7, elbowN: 0.9, armF: 1.5, elbowF: 1.0 });
/** The flinch carried into a cower: back to the ball, bent right over toward the goal (away from the ball's line),
 *  knees loaded, the near knee drawn up, chin tucked and both hands clamped over his head. Cowering one plane back,
 *  his whole silhouette stays under the ball's path, so it rips past in front of him with daylight under it. */
const FLINCH_A: Pose = P({ torso: 1.12, head: 0.55, thighN: 1.2, kneeN: 1.8, footN: 0.3, thighF: 0.6, kneeF: 1.2, footF: -0.3, armN: 1.95, elbowN: 1.85, armF: 1.8, elbowF: 2.0 });
/** A drawn variant of the flinch (no hold without one): hunched a touch lower, the knee higher, elbows in. */
const FLINCH_B: Pose = { ...FLINCH_A, torso: FLINCH_A.torso + 0.08, head: FLINCH_A.head + 0.08, thighN: FLINCH_A.thighN + 0.14, kneeN: FLINCH_A.kneeN + 0.1, elbowN: FLINCH_A.elbowN + 0.12 };
/** Tumbling: the blast throws his head back, then he curls as he spins (so he comes down on his back, never his head). */
const CURL1 = P({ torso: 0.68, head: 0.4, thighN: 1.65, kneeN: 1.6, footN: 0.2, thighF: 1.35, kneeF: 1.45, armN: 2.3, elbowN: 0.6, armF: -1.2, elbowF: 0.9 });
const CURL2 = P({ torso: 0.15, head: 0.3, thighN: 1.1, kneeN: 1.3, thighF: 0.7, kneeF: 1.0, armN: 2.6, elbowN: 0.5, armF: 1.7, elbowF: 0.7 });
/** Comic heaps: on his back, legs up and bent, arms splayed. */
const HEAP1 = P({ torso: -0.15, head: 0.55, thighN: 1.75, kneeN: 1.35, footN: -0.3, thighF: 1.25, kneeF: 0.55, armN: 2.5, elbowN: 0.45, armF: -1.4, elbowF: 0.9, spin: -1.45 });
const HEAP2 = P({ torso: 0.1, head: 0.35, thighN: 1.2, kneeN: 1.5, thighF: 0.6, kneeF: 0.4, armN: 2.8, elbowN: 0.3, armF: 1.9, elbowF: 0.6, spin: -1.5 });

/** Distance (units = world px) from the hip down to the bottom of the lowest boot. */
function soleBelowHip(p: Pose) {
  const j = joints(p);
  return Math.max(j.ankleN[1], j.toeN[1], j.toeF[1]) + 4.4;
}

/** The hip x that keeps a planted toe on its mark (toe x = hip x + facing · joint x, 1 unit = 1 px in his plane), so
 *  a stance foot never skates while the pose (or the facing) changes above it. */
const pinX = (toeX: number, p: Pose, k: 'toeN' | 'toeF', f: number) => toeX - f * joints(p)[k][0];

interface Fig { x: number; hip: number; pose: Pose; air: number; face?: 1 | -1 }

/** A ballistic hop of the hip from h0 with vertical speed vy under gravity g. */
function arc(h0: number, vy: number, g: number, q: number) {
  return h0 + vy * q - 0.5 * g * q * q;
}
function landTime(h0: number, vy: number, g: number, floor: number) {
  return (vy + Math.sqrt(vy * vy + 2 * g * (h0 - floor))) / g;
}

/** A decelerating run that stops at x at t1 (constant speed 2·dist/(t1 − t0) before t0). */
function runIn(t: number, x: number, t0: number, t1: number, dist: number) {
  if (t >= t1) return x;
  const T = t1 - t0;
  if (t <= t0) return x + dist + ((2 * dist) / T) * (t0 - t);
  const u = (t - t0) / T;
  return x + dist * (1 - u) * (1 - u);
}

/** Run-cycle phase from the distance still to run (one cycle = two strides of ~55 px, so the feet never skate as he
 *  slows), arriving on phase `end` as he stops. */
const STRIDE2 = 110;
const cyc = (remain: number, end: number) => (((end - remain / STRIDE2) % 1) + 1) % 1;
/** The hip's bob: lowest at mid-stance (run2 / run4, a boot flat under him), highest at the scissor (run1 / run3). */
const bob = (ph: number) => Math.abs(Math.cos(ph * TAU)) * 2.5;
/** The two defenders' run-ins (runIn's [t0: starts braking, t1: stops on his mark, braking distance]). */
const D1_RUN = [0.38, D1_PLANT, 40] as const;
const D2_RUN = [0.9, D2_PLANT, 32] as const;

// Defender 1: he arrives on run4 (the far boot flat under him) and plants it; it stays put through the gather, so
// the hip settles exactly onto XD1 for the jump.
const D1_END = 0.75;
const RUN1_END = poseAt(RUN, D1_END);
const TOE1 = XD1 - joints(GATHER).toeF[0]; // facing -1
const XRUN1 = pinX(TOE1, RUN1_END, 'toeF', -1);

// Defender 1: the jump-block, then the late boom's fling.
const D1_RISE = 34, D1_HALF = 0.15;
const G1 = 1650, FLING_UP = 30, VX1 = 295, LIE1 = 13;
const d1JumpLift = (q: number) => Math.max(0, D1_RISE * (1 - ((q - D1_HALF) / D1_HALF) ** 2));
const D1_HIP_B = soleBelowHip(POSES.jumpBlock) + d1JumpLift(W(BOOM1) - D1_JUMP);
const VY1 = Math.sqrt(2 * G1 * FLING_UP);
const Q1_LAND = landTime(D1_HIP_B, VY1, G1, LIE1);
const D1_LAND = BOOM1 + Q1_LAND;

// Defender 2: his far boot plants at D2_PIN (on the push-off of his last stride) and stays on its mark through the
// set, the snap turn (the facing flip pivots on it) and the flinch, until the second boom.
const D2_END = 0.9;
const D2_PIN = D2_PLANT - 0.05;
/** The snap round: SET to the in-between (TURN, both boots together under him) by D2_SNAP, held across the facing flip
 *  at TT2 so the free boot never pops, then he hunches into the flinch from D2_HUNCH. */
const D2_SNAP = D2_FLINCH + 0.02, TT2 = D2_SNAP + 0.015, D2_HUNCH = D2_SNAP + 0.03;
const RUN2_PIN = poseAt(RUN, cyc(runIn(D2_PIN, 0, ...D2_RUN), D2_END));
const BOB2_PIN = bob(cyc(runIn(D2_PIN, 0, ...D2_RUN), D2_END));
function d2Plant(t: number): { pose: Pose; face: 1 | -1 } {
  if (t < D2_FLINCH) return { pose: mixPose(RUN2_PIN, SET, ease.outQuad(clamp((t - D2_PIN) / 0.07))), face: -1 };
  if (t < D2_SNAP) return { pose: mixPose(SET, TURN, ease.inQuad((t - D2_FLINCH) / (D2_SNAP - D2_FLINCH))), face: -1 };
  if (t < D2_HUNCH) return { pose: TURN, face: t < TT2 ? -1 : 1 };
  // Cowering with his back to it, trembling drawn variants every 0.1 s while the ball rips past over his back.
  const v = t > D2_HUNCH + 0.07 && Math.floor((t - D2_HUNCH - 0.07) / 0.1) % 2 === 0 ? FLINCH_B : FLINCH_A;
  return { pose: mixPose(TURN, v, ease.outCubic(clamp((t - D2_HUNCH) / 0.065))), face: 1 };
}
/** His planted far toe (plane x), solved so the hip is on XD2 at D2_PASS; the run-in is aimed so it lands there. */
const TOE2 = (() => {
  const { pose, face } = d2Plant(D2_PASS);
  return XD2 + face * joints(pose).toeF[0];
})();
const XRUN2 = pinX(TOE2, RUN2_PIN, 'toeF', -1) - runIn(D2_PIN, 0, ...D2_RUN);

// Defender 2: the smaller fling.
const G2 = 3000, VY2 = 170, VX2 = 160, LIE2 = 12;
/** His pose on the frame the second boom lands, and where his hip is then (the fling starts from there). */
const D2_POSE_B: Pose = d2Plant(BOOM2).pose;
const X2B = pinX(TOE2, D2_POSE_B, 'toeF', 1);
const D2_HIP_B = soleBelowHip(D2_POSE_B);
const Q2_LAND = landTime(D2_HIP_B, VY2, G2, LIE2);
const D2_LAND = BOOM2 + Q2_LAND;

function d1At(t: number): Fig {
  const s = W(t);
  if (t < D1_PLANT) {
    const x = runIn(t, XRUN1, ...D1_RUN);
    const ph = cyc(x - XRUN1, D1_END);
    const pose = poseAt(RUN, ph);
    return { x, hip: soleBelowHip(pose) + bob(ph), pose, air: 0 };
  }
  if (t < D1_JUMP) {
    const pose = mixPose(RUN1_END, GATHER, ease.outQuad(clamp((t - D1_PLANT) / 0.05)));
    return { x: pinX(TOE1, pose, 'toeF', -1), hip: soleBelowHip(pose), pose, air: 0 };
  }
  if (t < BOOM1) {
    const q = s - D1_JUMP;
    const pose = mixPose(GATHER, POSES.jumpBlock, ease.outCubic(clamp(q / 0.07)));
    const lift = d1JumpLift(q);
    return { x: XD1, hip: soleBelowHip(pose) + lift, pose, air: lift / D1_RISE };
  }
  const q = s - W(BOOM1);
  if (q < Q1_LAND) {
    const spin = -2.4 * ease.outCubic(clamp(q / 0.5));
    // The blast snaps him into the blown pose within two frames, then he curls as he spins.
    const pose = q < 0.035 ? mixPose(POSES.jumpBlock, POSES.blown, ease.outQuad(q / 0.035)) : mixPose(POSES.blown, CURL1, ease.inOutQuad(clamp((q - 0.035) / 0.3)));
    pose.spin = spin;
    const hip = arc(D1_HIP_B, VY1, G1, q);
    return { x: XD1 + (VX1 * (1 - Math.exp(-1.4 * q))) / 1.4, hip, pose, air: clamp((hip - LIE1) / 60) };
  }
  // Landed: the heap, a little bounce and a short slide that stops.
  const ql = q - Q1_LAND;
  const xl = XD1 + (VX1 * (1 - Math.exp(-1.4 * Q1_LAND))) / 1.4;
  const vl = VX1 * Math.exp(-1.4 * Q1_LAND);
  const landPose: Pose = { ...CURL1, spin: -2.4 * ease.outCubic(clamp(Q1_LAND / 0.5)) };
  const pose = mixPose(landPose, HEAP1, ease.outCubic(clamp(ql / 0.12)));
  const bounce = ql < 0.22 ? 4 * Math.sin(Math.min(1, ql / 0.16) * Math.PI) * Math.exp(-ql * 9) : 0;
  return { x: xl + (vl * (1 - Math.exp(-7 * ql))) / 7, hip: LIE1 + bounce, pose, air: 0 };
}

/** Defender 2 in his own plane coordinates (project with gp(…, D2_S)). */
function d2At(t: number): Fig {
  const s = W(t);
  if (t < D2_PIN) {
    const x = runIn(t, XRUN2, ...D2_RUN);
    const ph = cyc(x - XRUN2, D2_END);
    const pose = poseAt(RUN, ph);
    return { x, hip: soleBelowHip(pose) + bob(ph), pose, air: 0 };
  }
  if (t < BOOM2) {
    // Planted: set, snap round to turn his back (the facing flip pivots on the planted boot), hunch and tremble.
    const { pose, face } = d2Plant(t);
    const settle = 1 - ease.outQuad(clamp((t - D2_PIN) / 0.07));
    return { x: pinX(TOE2, pose, 'toeF', face), hip: soleBelowHip(pose) + BOB2_PIN * settle, pose, air: 0, face };
  }
  const q = s - W(BOOM2);
  if (q < Q2_LAND) {
    const spin = -1.3 * ease.outCubic(clamp(q / 0.3));
    const pose = q < 0.035 ? mixPose(D2_POSE_B, POSES.blown, ease.outQuad(q / 0.035)) : mixPose(POSES.blown, CURL2, ease.inOutQuad(clamp((q - 0.035) / 0.2)));
    pose.spin = spin;
    const hip = arc(D2_HIP_B, VY2, G2, q);
    return { x: X2B + (VX2 * (1 - Math.exp(-1.6 * q))) / 1.6, hip, pose, air: clamp((hip - LIE2) / 60), face: 1 };
  }
  const ql = q - Q2_LAND;
  const xl = X2B + (VX2 * (1 - Math.exp(-1.6 * Q2_LAND))) / 1.6;
  const vl = VX2 * Math.exp(-1.6 * Q2_LAND);
  const landPose: Pose = { ...CURL2, spin: -1.3 * ease.outCubic(clamp(Q2_LAND / 0.3)) };
  const pose = mixPose(landPose, HEAP2, ease.outCubic(clamp(ql / 0.12)));
  const bounce = ql < 0.2 ? 3 * Math.sin(Math.min(1, ql / 0.14) * Math.PI) * Math.exp(-ql * 9) : 0;
  return { x: xl + (vl * (1 - Math.exp(-7 * ql))) / 7, hip: LIE2 + bounce, pose, air: 0, face: 1 };
}

const READY_B: Pose = { ...POSES.gkReady, kneeN: POSES.gkReady.kneeN + 0.12, kneeF: POSES.gkReady.kneeF + 0.12, armN: POSES.gkReady.armN + 0.08 };
function keeperAt(t: number): Fig {
  // Set on his toes: a small rhythmic bounce, weight forward, eyes on the ball.
  const pose = mixPose(POSES.gkReady, READY_B, Math.sin(t * 10) * 0.5 + 0.5);
  return { x: XK, hip: soleBelowHip(pose), pose, air: 0 };
}

// ---------------------------------------------------------------- module state (reset in init)
let spin = new BallSpin();
const trail = new Trail(15);
let burst = [false, false, false];
let fired = { takeoff: false, boom1: false, land1: false, boom2: false, land2: false };
let puffAcc = 0;

interface Sparkle { X: number; s: number; ph: number; f: number }
interface GBlade { X: number; s: number; h: number; ph: number; c: number }
interface Mote { X: number; Y: number; s: number }
let sparkles: Sparkle[] = [];
let blades: GBlade[] = [];
let motes: Mote[] = [];
let fgBlades: HTMLCanvasElement[] | null = null;

// ---------------------------------------------------------------- helpers

function toScreen(env: Env, x: number, y: number): [number, number] {
  const [u, v] = env.cam.toUV(x, y);
  return [u * VW, v * VH];
}

/** Ground point for ball-plane x X at depth s (1 = the ball's plane, < 1 farther, > 1 nearer). */
function gp(cx: number, X: number, s: number): [number, number] {
  return [cx + (X - cx) * s, HZ + (GY - HZ) * s];
}

/** Out-of-focus foreground grass right at the lens (3 variants), pre-blurred once. */
function makeFgBlades(): HTMLCanvasElement[] {
  const out: HTMLCanvasElement[] = [];
  const shapes = [
    [[30, 50, 10, 6], [72, 76, 24, 5], [110, 40, -6, 6]],
    [[40, 66, -20, 6], [96, 46, 30, 7]],
    [[26, 40, 34, 5], [64, 62, -4, 7], [120, 80, 22, 5]],
  ];
  for (let v = 0; v < 3; v++) {
    const c = document.createElement('canvas');
    c.width = 170;
    c.height = 160;
    const g = c.getContext('2d')!;
    g.filter = 'blur(4px)';
    for (const [bx, tipY, lean, w] of shapes[v]) {
      g.fillStyle = tipY > 56 ? 'rgb(14,38,30)' : 'rgb(8,24,22)';
      g.beginPath();
      g.moveTo(bx - w, 160);
      g.quadraticCurveTo(bx - w * 0.4 + lean * 0.35, (160 + tipY) / 2, bx + lean, tipY);
      g.quadraticCurveTo(bx + w * 0.5 + lean * 0.4, (160 + tipY) / 2 + 6, bx + w, 160);
      g.closePath();
      g.fill();
    }
    out.push(c);
  }
  return out;
}

/** Backdrop parallax camera: field-art x at the start, pan factor, scale at zoom 1.6. */
const CXB0 = 560, PAR = 0.4, ZB = 1.65;
/** The camera x at t = 0 (the parallax reference). */
const FRAME0 = frameAt(0);

/** The stands: the shared field backdrop under its own parallax camera, the dark stand canopy above the roof up to the
 *  floodlight towers (never sky), the tier fronts and the LED ribbon (as in shot 2). */
function drawBackdrop(env: Env, time: number) {
  const ctx = env.ctx;
  const st = env.art.stadium;
  const cam = env.cam;
  const [hx, hy] = toScreen(env, cam.x, HZ);
  const zb = (ZB * cam.zoom) / Z0;
  const camXb = CXB0 + (cam.x - FRAME0.x) * PAR;
  env.screen();
  ctx.save();
  ctx.translate(hx, hy);
  ctx.scale(zb, zb);
  ctx.translate(-camXb, -FIELD.horizon);
  const L = camXb - hx / zb - 20, R = camXb + (VW - hx) / zb + 20;
  drawFieldBackdrop(ctx, st, camXb, FIELD.horizon - hy / zb + VH / (2 * zb), time);
  const top = FIELD.horizon - hy / zb - 10;
  const g = ctx.createLinearGradient(0, top, 0, 58);
  g.addColorStop(0, 'rgb(10,18,56)');
  g.addColorStop(0.6, 'rgb(22,36,88)');
  g.addColorStop(1, 'rgb(46,70,140)');
  ctx.fillStyle = g;
  if (top < 58) ctx.fillRect(L, top, R - L, 58 - top);
  // Towers re-drawn over the canopy so their masts read, then the lamps, cool white.
  for (const tx of [120, 620, 1120, 1620]) {
    const x = tx + camXb * 0.5 - 300;
    if (x < L - 60 || x > R + 20) continue;
    ctx.globalAlpha = 0.85;
    ctx.drawImage(st.tower, Math.round(x), -40);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf([150, 190, 255]), x + 20, -24, 150, 0.3);
    drawGlow(ctx, glowOf([235, 248, 255]), x + 20, -24, 54, 0.7);
    ctx.globalCompositeOperation = 'source-over';
  }
  const hz = ctx.createLinearGradient(0, 58, 0, FIELD.horizon);
  hz.addColorStop(0, 'rgba(70,104,170,0.5)');
  hz.addColorStop(1, 'rgba(150,186,230,0.36)');
  ctx.fillStyle = hz;
  ctx.fillRect(L, 58, R - L, FIELD.horizon - 58);
  const rx = camXb * 0.25 - 220;
  ctx.fillStyle = 'rgba(8,12,34,0.55)';
  for (let y = 74; y < 160; y += 13) ctx.fillRect(L, y, R - L, 1.4);
  ctx.fillStyle = 'rgba(190,215,255,0.16)';
  for (let y = 74; y < 160; y += 13) ctx.fillRect(L, y - 0.8, R - L, 0.8);
  for (let i = Math.floor((L - rx) / 96) - 1, n = i + Math.ceil((R - L) / 96) + 3; i < n; i++) {
    ctx.fillStyle = 'rgba(150,170,210,0.32)';
    ctx.fillRect(rx + i * 96 + 40, 64, 3, 96);
  }
  const RIBBON_Y = 106;
  ctx.fillStyle = '#070912';
  ctx.fillRect(L, RIBBON_Y - 3, R - L, 6);
  const cols = ['#3fd0ff', '#ffffff', '#ffd34a', '#3fd0ff', '#ff3b3b'];
  for (let i = Math.floor((L - rx) / 64) - 1, n = i + Math.ceil((R - L) / 64) + 3; i < n; i++) {
    ctx.fillStyle = cols[((i % 5) + 5) % 5];
    ctx.globalAlpha = 0.85;
    ctx.fillRect(rx + i * 64 + 3, RIBBON_Y - 2, 58, 4);
    ctx.fillStyle = '#070912';
    for (let k = 0; k < 5; k++) ctx.fillRect(rx + i * 64 + 8 + k * 10, RIBBON_Y - 1, 4, 2);
  }
  ctx.globalAlpha = 1;
  // (No flashes in the stands here: the stadium slams back in through sound only; the stands' late thunder is shot 6.)
  ctx.restore();
}

/** A thin white pitch line on the ground plane between (Xa, sa) and (Xb, sb) (fillStyle set by the caller). */
function pitchLine(ctx: CanvasRenderingContext2D, cx: number, Xa: number, sa: number, Xb: number, sb: number, w: number, a: number) {
  const [x0, y0] = gp(cx, Xa, sa), [x1, y1] = gp(cx, Xb, sb);
  const dx = x1 - x0, dy = y1 - y0;
  const l = Math.hypot(dx, dy) || 1;
  const nx = -dy / l, ny = dx / l;
  const w0 = w * sa * 0.5, w1 = w * sb * 0.5;
  ctx.globalAlpha = a;
  ctx.beginPath();
  ctx.moveTo(x0 + nx * w0, y0 + ny * w0 * 0.35);
  ctx.lineTo(x1 + nx * w1, y1 + ny * w1 * 0.35);
  ctx.lineTo(x1 - nx * w1, y1 - ny * w1 * 0.35);
  ctx.lineTo(x0 - nx * w0, y0 - ny * w0 * 0.35);
  ctx.closePath();
  ctx.fill();
}

function drawGround(env: Env, t: number, time: number) {
  const ctx = env.ctx;
  const cam = env.cam;
  const z = cam.zoom;
  const halfW = VW / (2 * z) + 60, halfH = VH / (2 * z) + 60;
  const L = cam.x - halfW, R = cam.x + halfW, B = cam.y + halfH;
  const g = ctx.createLinearGradient(0, HZ, 0, B);
  const kG = clamp((GY - HZ) / (B - HZ));
  g.addColorStop(0, '#3d7d5a');
  g.addColorStop(kG * 0.5, '#2f8a40');
  g.addColorStop(kG, '#2d8c3d');
  g.addColorStop(1, '#246f33');
  ctx.fillStyle = g;
  ctx.fillRect(L, HZ - 1, R - L, B - HZ + 1);
  // Mowing stripes converging on the vanishing point: full speed in the ball's plane, faster toward the lens.
  const SW = 120;
  const sB = (B - HZ) / (GY - HZ);
  ctx.fillStyle = 'rgba(190,255,190,0.075)';
  ctx.beginPath();
  const kMin = Math.floor((cam.x - (halfW + 400) / sB) / SW) - 1;
  const kMax = Math.ceil((cam.x + (halfW + 400) / sB) / SW) + 1;
  for (let k = kMin - (kMin & 1); k <= kMax; k += 2) {
    const x0 = cam.x + (k * SW - cam.x) * sB, x1 = cam.x + ((k + 1) * SW - cam.x) * sB;
    ctx.moveTo(cam.x, HZ);
    ctx.lineTo(x0, B);
    ctx.lineTo(x1, B);
    ctx.closePath();
  }
  ctx.fill();
  // The far touchline, a thin pale line just under the horizon.
  const [, ty] = gp(cam.x, 0, 0.16);
  ctx.fillStyle = 'rgba(235,245,255,0.55)';
  ctx.fillRect(L, ty, R - L, Math.max(1, 1.2 / z));
  // The box: the 18-yard line (defender 1 screens at the edge of it), the six-yard box (step 3 lands on its edge),
  // the goal line, and the box sides running toward the goal.
  ctx.fillStyle = 'rgba(240,248,255,0.8)';
  pitchLine(ctx, cam.x, XP, 0.5, XP, 1.75, 2.2, 0.75);
  pitchLine(ctx, cam.x, XP, 0.5, XG, 0.5, 1.6, 0.6);
  pitchLine(ctx, cam.x, XP, 1.75, XG, 1.75, 2.4, 0.75);
  pitchLine(ctx, cam.x, X6, 0.74, X6, 1.36, 2.2, 0.8);
  pitchLine(ctx, cam.x, X6, 0.74, XG, 0.74, 1.6, 0.65);
  pitchLine(ctx, cam.x, X6, 1.36, XG, 1.36, 2.2, 0.75);
  pitchLine(ctx, cam.x, XG, 0.16, XG, sB, 2.4, 0.8);
  ctx.globalAlpha = 1;
  // Horizon haze band (distance).
  const hb = ctx.createLinearGradient(0, HZ - 2, 0, HZ + (GY - HZ) * 0.45);
  hb.addColorStop(0, 'rgba(170,205,240,0.55)');
  hb.addColorStop(1, 'rgba(170,205,240,0)');
  ctx.fillStyle = hb;
  ctx.fillRect(L, HZ - 2, R - L, (GY - HZ) * 0.45 + 2);
  // Floodlit sheen along the ball's line (cool, soft, high-key).
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf([110, 160, 205]), cam.x, GY, halfW * 1.1, 0.16, 1, 0.16);
  // Dew sparkles on the turf (perspective-placed twinkles, streaked by the camera's speed near the lens).
  const sp = camSpeed(t);
  for (const p of sparkles) {
    const x = cam.x + (p.X - cam.x) * p.s, y = HZ + (GY - HZ) * p.s;
    if (x < L || x > R || y > B) continue;
    const tw = Math.pow(Math.max(0, Math.sin(p.ph + time * p.f)), 10);
    const sz = Math.max(1 / z, 1.1 * p.s);
    ctx.globalAlpha = 0.3 + 0.6 * tw;
    ctx.fillStyle = tw > 0.6 ? HEX.ice : 'rgb(150,220,255)';
    ctx.fillRect(x - sz / 2, y - sz / 2, sz + sp * p.s * 5, sz);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

/** The V of the late boom: apex where the ball was as the boom passed, arms opening back across the turf. */
const WAKE_X = ballX(BOOM1), WAKE_LEN = 140, WAKE_OPEN = 0.5;

/** Step 3's pressure front: once its stamp has bloomed, the ring's edge keeps rolling out across the six-yard box as a
 *  wave of flattening grass, toward the keeper's feet (shot 5 opens with it sweeping them). World px, 0 before. */
const FRONT0 = T3 + 0.25;
const frontR = (t: number) => (t < FRONT0 ? 0 : 50 + 360 * (t - FRONT0));
/** Ground-plane distance from a stamp centre to a blade at (X, s) (depth turned back into ring radius, squash 0.25). */
const ringDist = (X: number, s: number, cx: number) => Math.hypot(X - cx, ((s - 1) * (GY - HZ)) / 0.25);

/** How hard the air under the ball presses the grass at ground x (0..1): a moving hollow under a low ball. */
function cushionAt(t: number, x: number) {
  const bx = ballX(t), h = heightM(t);
  const low = clamp(1 - (h - 0.15) / 0.6);
  const d = (x - bx + 6) / 26;
  return low * Math.exp(-d * d);
}

/** Grass blades in perspective rows: idle sway, flattened under the ball's cushion, flicked outward by each stamp,
 *  laid flat in the V of the late boom. Draws the rows with depth in (s0, s1] (1 = the ball's plane). */
function drawGrass(env: Env, t: number, s0: number, s1: number) {
  const ctx = env.ctx;
  const cam = env.cam;
  const halfW = VW / (2 * cam.zoom) + 40;
  const sp = camSpeed(t);
  const bx = ballX(t), wx = WAKE_X;
  ctx.lineWidth = 1.4;
  for (let pass = 0; pass < 2; pass++) {
    ctx.strokeStyle = pass === 0 ? '#2a6e36' : '#57b85e';
    ctx.beginPath();
    for (const b of blades) {
      if (b.s <= s0 || b.s > s1) continue;
      if ((b.c > 0.5 ? 1 : 0) !== pass) continue;
      const x = cam.x + (b.X - cam.x) * b.s, y = HZ + (GY - HZ) * b.s;
      if (x < cam.x - halfW || x > cam.x + halfW) continue;
      let h = b.h * b.s;
      let lean = Math.sin(b.ph + t * 2.4) * 0.12 - 0.25 * sp; // the rush of air bends them back
      const near = clamp(1 - Math.abs(b.s - 1) / 0.45);
      // The cushion: blades under the ball press flat and part away from its ground point.
      const c = cushionAt(t, b.X) * near;
      if (c > 0.02) {
        lean += Math.sign(b.X - bx + 6) * 1.1 * c;
        h *= 1 - 0.45 * c;
      }
      // Stamps: flicked outward from the centre as the ring passes, then lying flat inside it.
      for (let i = 0; i < 3; i++) {
        const age = t - STAMPS[i].t4;
        if (age < 0) continue;
        const R = (STAMPS[i].r4 / Z0) * 1.15;
        const dx = b.X - XS[i];
        if (Math.abs(dx) > R * 1.3) continue;
        const d = ringDist(b.X, b.s, XS[i]);
        const ring = ease.outCubic(clamp(age / 0.3)) * R;
        const k = d < ring ? 0.75 : 0;
        lean += Math.sign(dx || 1) * 1.2 * k;
        h *= 1 - 0.5 * k;
      }
      // Step 3's rolling front: blades flick outward as the wave passes, then spring back up behind it.
      const rf = frontR(t);
      if (rf > 0) {
        const e = ringDist(b.X, b.s, XS[2]) - rf;
        if (e > -24 && e < 6) {
          const k = e > 0 ? 1 - e / 6 : 1 + e / 24;
          lean += Math.sign(b.X - XS[2] || 1) * 1.0 * k;
          h *= 1 - 0.35 * k;
        }
      }
      // The V of the late boom: flattened back along both arms.
      const wa = t - BOOM1;
      if (wa > 0 && b.X < wx) {
        const dx = wx - b.X;
        const len = WAKE_LEN * ease.outCubic(clamp(wa / 0.25));
        if (dx < len) {
          const arm = Math.abs(Math.abs(b.s - 1) * (GY - HZ) - dx * Math.tan(WAKE_OPEN) * 0.25);
          const k = clamp(1 - arm / 5) * 0.8;
          lean -= 1.0 * k;
          h *= 1 - 0.4 * k;
        }
      }
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + Math.sin(lean) * h * 0.4, y - h * 0.6, x + Math.sin(lean) * h, y - Math.cos(lean) * h);
    }
    ctx.stroke();
  }
}

function drawShadow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, a: number) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = HEX.navy;
  ctx.beginPath();
  ctx.ellipse(x, y + 1, w, Math.max(2, w * 0.16), 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/** Render + draw a puppet now (renderPuppet reuses one buffer per size, so draw before the next render). s = its
 *  depth plane: it is rendered at k·s and drawn at the same scale, so every puppet pixel stays 2 screen px. */
function drawFig(env: Env, kit: Kit, f: Fig, s = 1) {
  const [gx, gy] = gp(env.cam.x, f.x, s);
  const [sx] = toScreen(env, gx, gy);
  if (sx < -110 || sx > VW + 110) return;
  const r = renderPuppet(kit, f.pose, { k: PK_K * s, facing: f.face ?? -1 });
  drawPuppet(env.ctx, r, gx, gy - f.hip * s, PK_D);
}

/** The goal in a low side view: far post, back netting and roof behind the keeper; near post and side netting in front. */
const GH = 2.44 * PXM, ND = 62, SN = 1.08, SF = 0.8;
function goalPt(cx: number, X: number, s: number, h: number): [number, number] {
  const [x, y] = gp(cx, X, s);
  return [x, y - h * s];
}
function drawGoalBack(ctx: CanvasRenderingContext2D, cx: number) {
  const fb = goalPt(cx, XG, SF, 0), ft = goalPt(cx, XG, SF, GH);
  const nt = goalPt(cx, XG, SN, GH);
  const bfT = goalPt(cx, XG + ND, SF, GH * 0.8), bfB = goalPt(cx, XG + ND * 1.25, SF, 0);
  const bnT = goalPt(cx, XG + ND, SN, GH * 0.8), bnB = goalPt(cx, XG + ND * 1.25, SN, 0);
  ctx.save();
  // Back net and roof: a soft dark fill, then a square mesh.
  ctx.fillStyle = 'rgba(10,18,56,0.28)';
  ctx.beginPath();
  ctx.moveTo(ft[0], ft[1]);
  ctx.lineTo(nt[0], nt[1]);
  ctx.lineTo(bnT[0], bnT[1]);
  ctx.lineTo(bnB[0], bnB[1]);
  ctx.lineTo(bfB[0], bfB[1]);
  ctx.lineTo(fb[0], fb[1]);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(230,238,255,0.45)';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  for (let i = 0; i <= 8; i++) {
    const u = i / 8;
    const ax = lerp(bfT[0], bnT[0], u), ay = lerp(bfT[1], bnT[1], u);
    ctx.moveTo(ax, ay);
    ctx.lineTo(lerp(bfB[0], bnB[0], u), lerp(bfB[1], bnB[1], u));
    ctx.moveTo(lerp(ft[0], nt[0], u), lerp(ft[1], nt[1], u));
    ctx.lineTo(ax, ay);
  }
  for (let j = 0; j <= 7; j++) {
    const v = j / 7;
    ctx.moveTo(lerp(bfT[0], bfB[0], v), lerp(bfT[1], bfB[1], v));
    ctx.lineTo(lerp(bnT[0], bnB[0], v), lerp(bnT[1], bnB[1], v));
  }
  ctx.stroke();
  // Far post and crossbar (white, dark outline).
  const bar = (a: [number, number], b: [number, number], w: number) => {
    ctx.lineCap = 'square';
    ctx.strokeStyle = '#180411';
    ctx.lineWidth = w + 2;
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.stroke();
    ctx.strokeStyle = '#f4f6ff';
    ctx.lineWidth = w;
    ctx.stroke();
  };
  bar(fb, ft, 3 * SF);
  bar(ft, nt, 3.2);
  ctx.restore();
}
function drawGoalFront(ctx: CanvasRenderingContext2D, cx: number) {
  const nb = goalPt(cx, XG, SN, 0), nt = goalPt(cx, XG, SN, GH);
  const bT = goalPt(cx, XG + ND, SN, GH * 0.8), bB = goalPt(cx, XG + ND * 1.25, SN, 0);
  ctx.save();
  // Near side netting (diamond mesh), clipped to its panel.
  ctx.beginPath();
  ctx.moveTo(nt[0], nt[1]);
  ctx.lineTo(bT[0], bT[1]);
  ctx.lineTo(bB[0], bB[1]);
  ctx.lineTo(nb[0], nb[1]);
  ctx.closePath();
  ctx.fillStyle = 'rgba(10,18,56,0.16)';
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = 'rgba(232,240,255,0.42)';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  for (let i = -14; i < 14; i++) {
    const x = nb[0] + i * 9;
    ctx.moveTo(x, nt[1] - 10);
    ctx.lineTo(x + 160, nb[1] + 10);
    ctx.moveTo(x + 160, nt[1] - 10);
    ctx.lineTo(x, nb[1] + 10);
  }
  ctx.stroke();
  ctx.restore();
  // Roof and back stanchion of the near side.
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#180411';
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.moveTo(nt[0], nt[1]);
  ctx.lineTo(bT[0], bT[1]);
  ctx.lineTo(bB[0], bB[1]);
  ctx.stroke();
  ctx.strokeStyle = '#c9d4ee';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  // Near post: white with a dark outline and a cool shaded edge.
  const w = 3.6 * SN;
  ctx.fillStyle = '#180411';
  ctx.fillRect(nb[0] - w / 2 - 1, nt[1] - 1, w + 2, nb[1] - nt[1] + 1);
  ctx.fillStyle = '#f4f6ff';
  ctx.fillRect(nb[0] - w / 2, nt[1], w, nb[1] - nt[1]);
  ctx.fillStyle = '#b8c4e0';
  ctx.fillRect(nb[0] + w / 2 - 1, nt[1], 1, nb[1] - nt[1]);
  ctx.restore();
}

/**
 * The air sliver: a bright lens of crushed air sandwiched between the ball's underside (yTop) and the grass (yGround),
 * its tips pinched to points, cyan over a navy halo with a thin ice core and two short ice jets squirting out along
 * the turf. At least 4 screen px tall (2.5 world px at zoom 1.6), so a paused step always shows the gap.
 */
function cushionSliver(ctx: CanvasRenderingContext2D, x: number, yTop: number, yGround: number, w: number, a: number) {
  if (a <= 0.01) return;
  const h = Math.max(yGround - yTop, 2.5);
  const y0 = yGround - h, my = yGround - h / 2;
  const lens = (hw: number, top: number, bot: number) => {
    ctx.beginPath();
    ctx.moveTo(x - hw, my);
    ctx.quadraticCurveTo(x, 2 * top - my, x + hw, my);
    ctx.quadraticCurveTo(x, 2 * bot - my, x - hw, my);
    ctx.closePath();
  };
  ctx.save();
  ctx.globalAlpha = clamp(0.6 * a);
  ctx.fillStyle = HEX.navy;
  lens(w / 2 + 3, y0 - 1.2, yGround + 1.6);
  ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = clamp(0.8 * a);
  ctx.fillStyle = HEX.cyan;
  lens(w / 2, y0, yGround);
  ctx.fill();
  ctx.globalAlpha = clamp(a);
  ctx.fillStyle = HEX.ice;
  lens(w * 0.32, my - h * 0.2, my + h * 0.2);
  ctx.fill();
  // Jets of crushed air squirting out fore and aft along the turf.
  ctx.globalAlpha = clamp(0.7 * a);
  ctx.fillRect(x - w * 0.95, yGround - 1, w * 0.34, 0.8);
  ctx.fillRect(x + w * 0.6, yGround - 1, w * 0.34, 0.8);
  ctx.restore();
}

/** The ribbon's path: the trail with its interior points averaged over +-3 neighbours (the head stays on the ball),
 *  so the sharp V of a step never folds the wide ribbon over itself. Reuses one array (no per-frame garbage). */
const ribbonPts: TrailPt[] = [];
function smoothTrail(pts: readonly TrailPt[]): TrailPt[] {
  const n = pts.length;
  while (ribbonPts.length < n) ribbonPts.push({ x: 0, y: 0 });
  ribbonPts.length = n;
  for (let i = 0; i < n; i++) {
    const k = Math.min(3, n - 1 - i);
    let sx = 0, sy = 0, c = 0;
    for (let j = Math.max(0, i - k); j <= Math.min(n - 1, i + k); j++) {
      sx += pts[j].x;
      sy += pts[j].y;
      c++;
    }
    ribbonPts[i].x = sx / c;
    ribbonPts[i].y = sy / c;
  }
  return ribbonPts;
}

// ---------------------------------------------------------------- particle bursts (update only, env.rng)

/**
 * A stamp's burst: a dew fountain thrown up and out from the whole ring (spread over it, so the beads never pile
 * into one glowing blob), and the expanding cobalt ring. R = the stamp's radius (world px).
 */
function stampBurst(env: Env, x: number, R: number, n: number) {
  const rng = env.rng;
  const k = Math.sqrt(R / 30);
  for (let i = 0; i < n; i++) {
    const th = rng.range(0, TAU);
    const rr = rng.range(0.35, 1) * R;
    const y = GY + Math.sin(th) * rr * 0.25;
    env.parts.spawn({
      kind: PK.Glow, x: x + Math.cos(th) * rr, y, vx: Math.cos(th) * rng.range(30, 110) * k, vy: -rng.range(90, 230) * k, ay: 560, drag: 1.2,
      max: rng.range(0.4, 0.75), s0: rng.range(1.1, 1.9), s1: 0.6, ramp: 'dew', r0: 0.05, r1: 0.7, a0: 0.95, a1: 0, layer: y > GY ? 1 : 0,
    });
  }
  env.parts.spawn({ kind: PK.Ring, x, y: GY, s0: R * 0.2, s1: R * 1.15, max: 0.32, k: 0.25, ramp: 'cobalt', r0: 0, r1: 0.9, a0: 0.9, a1: 0, layer: 0 });
}

/** Flat turf bits (no outline: an outlined chunk reads as a dirt speck) thrown up from the ground. */
function turf(env: Env, x: number, n: number, spread: number, power: number) {
  const rng = env.rng;
  for (let i = 0; i < n; i++) {
    const a = rng.range(-Math.PI * 0.85, -Math.PI * 0.15);
    const sp = rng.range(90, 260) * power;
    env.parts.spawn({
      kind: PK.Pixel, x: x + rng.range(-spread, spread), y: GY - 1, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, ay: 760, drag: 0.7,
      max: rng.range(0.45, 0.8), s0: rng.range(1.6, 2.6), s1: 1.6, ramp: 'grass', r0: rng.range(0, 0.5), r1: 0.8, a0: 1, a1: 0.7, add: false, layer: 1,
    });
  }
}

function mist(env: Env, x: number, y: number, n: number, spread: number, up: number, a = 0.24, layer = 0) {
  const rng = env.rng;
  for (let i = 0; i < n; i++) {
    env.parts.spawn({
      kind: PK.Smoke, x: x + rng.range(-spread, spread), y: y + rng.range(-3, 2), vx: rng.range(-40, 40), vy: -rng.range(10, up), drag: 2.4,
      max: rng.range(0.4, 0.8), s0: rng.range(4, 7), s1: rng.range(12, 20), ramp: 'white', r0: 0.1, r1: 0.6, a0: a, a1: 0, add: false, layer,
    });
  }
}

function dewSpray(env: Env, x: number, y: number, n: number, sp: number, up: number, layer = 1) {
  const rng = env.rng;
  for (let i = 0; i < n; i++) {
    const a = rng.range(0, TAU);
    env.parts.spawn({
      kind: PK.Glow, x: x + rng.range(-4, 4), y: y + rng.range(-4, 4), vx: Math.cos(a) * rng.range(0.3, 1) * sp, vy: Math.sin(a) * sp * 0.6 - rng.range(0, up),
      ay: 420, drag: 1.4, max: rng.range(0.35, 0.7), s0: rng.range(1.3, 2.2), s1: 0.7, ramp: 'dew', r0: 0, r1: 0.7, a0: 1, a1: 0, layer,
    });
  }
}

// ---------------------------------------------------------------- the shot

export const shotAirSteps: Shot = {
  name: 'Air steps',
  dur: DUR,
  seed: 304,
  muffle: MUFFLE[4],
  rate: (t) => (t >= HS0 && t < HS1 ? HS_RATE : 1),
  cues: [
    // Under the mute: the whine from shot 3 rings on (dry bus), with a filtered rush of air.
    { at: 0, fn: (env) => env.sfx.whoosh(0.95, 2400, 900, 0.2) },
    { at: T1, fn: (env) => (env.sfx.boom(0.5, 0), env.sfx.crackle(0.3, 0.05)) },
    { at: D1_JUMP, fn: (env) => env.sfx.kick(0.1) },
    { at: T2, fn: (env) => env.sfx.boom(0.5, 0) },
    // The late boom: the muffle snaps open on this step (MUFFLE[4]) and the full stadium slams back in.
    { at: BOOM1, fn: (env) => (env.sfx.sonicBoom(1.0, -0.3), env.sfx.crowd(2.5, 0.45)) },
    { at: D1_LAND, fn: (env) => env.sfx.kick(0.14) },
    { at: BOOM2, fn: (env) => env.sfx.sonicBoom(0.6, 0.3) },
    { at: D2_LAND, fn: (env) => env.sfx.kick(0.1) },
    { at: T3, fn: (env) => (env.sfx.boom(0.9), env.sfx.crack(0.8)) },
    { at: 2.3, fn: (env) => env.sfx.whoosh(0.35, 500, 6000, 0.5) },
  ],
  prepare() {
    if (!fgBlades) fgBlades = makeFgBlades();
  },
  init(env) {
    env.sfx.clearBus();
    spin = new BallSpin();
    spin.rotate(0.4, 1, 0.3, 0.9);
    trail.clear();
    burst = [false, false, false];
    fired = { takeoff: false, boom1: false, land1: false, boom2: false, land2: false };
    puffAcc = 0;
    if (!fgBlades) fgBlades = makeFgBlades();
    // Static set dressing from its own seed (independent of the simulation RNG).
    const r = new Rng(3041);
    sparkles = [];
    for (let i = 0; i < 420; i++) sparkles.push({ X: r.range(-300, 1900), s: r.range(0.2, 2.4), ph: r.range(0, TAU), f: r.range(1.5, 4) });
    blades = [];
    for (let i = 0; i < 620; i++) blades.push({ X: r.range(-200, 1900), s: r.range(0.55, 2.2), h: r.range(4, 10), ph: r.range(0, TAU), c: r.next() });
    motes = [];
    for (let i = 0; i < 26; i++) motes.push({ X: r.range(0, 1), Y: r.range(0, 1), s: r.range(1.3, 2.6) });
    // Prime the trail with the path just before the cut (the ball is already flying), so frame 1 has its ribbon.
    for (let k = 12; k >= 1; k--) trail.push(ballX(0) - (V * k) / 60, ballY(0) + k * 0.25);
    env.cam.set(FRAME0.x, FRAME0.y, FRAME0.z, 0);
    env.cam.shakeRoll = 0; // GALE keeps every horizon level
    env.cam.shakeAmp = 9;
  },
  update(env, t, dt) {
    const rng = env.rng;
    // Near-zero spin: a knuckling ball, panels turning well under 15°/s.
    spin.rotate(0.2, 1, 0.1, dt * 0.2);
    const bx = ballX(t), by = ballY(t);
    trail.push(bx, by);

    // The air steps: a stamp burst (dew fountain, turf, the cobalt ring), a mist skirt, a camera knock.
    STAMPS.forEach((s, i) => {
      if (burst[i] || t < s.t4) return;
      burst[i] = true;
      const big = i === 2;
      const R = (s.r4 / Z0) * 1.3;
      stampBurst(env, XS[i], R, big ? 64 : 30);
      turf(env, XS[i], big ? 14 : 6, R * 0.5, big ? 1.1 : 0.7);
      mist(env, XS[i], GY, big ? 10 : 5, R * 0.9, big ? 60 : 30, 0.22);
      if (big) {
        // The curtain: a wall of dew and turf thrown straight up across the ring: fast soft beads that start cyan (never
        // crisp white strokes, which the step's shock would bend into scribbles).
        for (let k = 0; k < 24; k++) {
          const a = -Math.PI / 2 + rng.range(-0.5, 0.5);
          const v = rng.range(220, 420);
          env.parts.spawn({
            kind: PK.Glow, x: XS[i] + rng.range(-R * 0.8, R * 0.8), y: GY - rng.range(1, 8), vx: Math.cos(a) * v, vy: Math.sin(a) * v, ay: 700, drag: 1.6,
            max: rng.range(0.25, 0.45), s0: rng.range(1.2, 2), s1: 0.5, ramp: 'dew', r0: 0.3, r1: 0.8, a0: 0.85, a1: 0, layer: 1,
          });
        }
        for (let k = 0; k < 50; k++) {
          const dew = rng.next() < 0.8;
          env.parts.spawn({
            kind: dew ? PK.Glow : PK.Pixel, x: XS[i] + rng.range(-R, R), y: GY - rng.range(0, 3), vx: rng.range(-25, 25), vy: -rng.range(140, 300), ay: 560, drag: 0.8,
            max: rng.range(0.5, 0.9), s0: rng.range(1.2, 2.2), s1: 0.8, ramp: dew ? 'dew' : 'grass', r0: 0, r1: 0.7, a0: 1, a1: 0.1, add: dew, layer: 1,
          });
        }
      }
      env.cam.hit(big ? 0.5 : i === 1 ? 0.22 : 0.3);
    });

    // Defender 1's take-off: dew sprayed off the turf by his boots.
    if (!fired.takeoff && t >= D1_JUMP) {
      fired.takeoff = true;
      for (let k = 0; k < 14; k++)
        env.parts.spawn({
          kind: PK.Glow, x: XD1 + rng.range(-14, 6), y: GY - 1, vx: rng.range(-90, 70), vy: -rng.range(60, 170), ay: 600, drag: 1,
          max: rng.range(0.35, 0.6), s0: rng.range(1.2, 2), s1: 0.7, ramp: 'dew', r0: 0, r1: 0.7, a0: 1, a1: 0, layer: 1,
        });
      mist(env, XD1 - 4, GY, 3, 10, 20, 0.18);
    }

    // The late boom: dew and turf blasted up along the V of the wake, a spray off him, the vapour torn into eddies.
    if (!fired.boom1 && t >= BOOM1) {
      fired.boom1 = true;
      env.cam.hit(0.6);
      const ax = ballX(BOOM1);
      for (let k = 0; k < 34; k++) {
        const d = rng.range(6, 100);
        const sgn = rng.sign();
        env.parts.spawn({
          kind: PK.Glow, x: ax - d, y: GY + sgn * d * Math.tan(0.32) * 0.25, vx: rng.range(-30, 60), vy: -rng.range(90, 230), ay: 520, drag: 1.1,
          max: rng.range(0.4, 0.8), s0: rng.range(1.2, 2.2), s1: 0.7, ramp: 'dew', r0: 0, r1: 0.7, a0: 1, a1: 0, layer: sgn > 0 ? 1 : 0,
        });
      }
      turf(env, ax - 40, 10, 40, 0.8);
      const f = d1At(BOOM1);
      dewSpray(env, f.x, GY - f.hip - 10, 14, 160, 80);
      for (const p of trail.pts) {
        if (rng.next() < 0.5) continue;
        env.parts.spawn({
          kind: PK.Smoke, x: p.x, y: p.y, vx: rng.range(-60, 60), vy: rng.range(-50, 40), drag: 2.2,
          max: rng.range(0.35, 0.6), s0: rng.range(5, 8), s1: rng.range(14, 22), ramp: 'white', r0: 0.1, r1: 0.6, a0: 0.26, a1: 0, add: false, layer: 0,
        });
      }
    }
    if (!fired.land1 && t >= D1_LAND) {
      fired.land1 = true;
      const f = d1At(D1_LAND);
      mist(env, f.x, GY, 6, 20, 30, 0.26, 1);
      dewSpray(env, f.x, GY - 4, 10, 120, 120);
    }
    // Defender 2's bursts start on his own (deeper) plane.
    if (!fired.boom2 && t >= BOOM2) {
      fired.boom2 = true;
      env.cam.hit(0.35);
      const f = d2At(BOOM2);
      const [px, py] = gp(frameAt(t).x, f.x, D2_S);
      dewSpray(env, px, py - (f.hip + 8) * D2_S, 12, 140 * D2_S, 70 * D2_S, 0);
      mist(env, px - 20 * D2_S, py, 4, 24 * D2_S, 30, 0.18);
    }
    if (!fired.land2 && t >= D2_LAND) {
      fired.land2 = true;
      const f = d2At(D2_LAND);
      const [px, py] = gp(frameAt(t).x, f.x, D2_S);
      mist(env, px, py, 5, 18 * D2_S, 28, 0.24, 0);
      dewSpray(env, px, py - 4 * D2_S, 8, 110 * D2_S, 110 * D2_S, 0);
    }

    // Vapour shed off the ball: soft, turbulent puffs that break away behind it and dissolve (never a line).
    puffAcc += dt * 34;
    while (puffAcc >= 1) {
      puffAcc -= 1;
      const d = ballDir(t);
      env.parts.spawn({
        kind: PK.Smoke, x: bx - Math.cos(d) * 12 + rng.range(-3, 3), y: by - Math.sin(d) * 12 + rng.range(-3, 3), vx: rng.range(-30, 20), vy: rng.range(-18, 18), drag: 2,
        max: rng.range(0.22, 0.36), s0: rng.range(4, 6), s1: rng.range(10, 15), ramp: 'white', r0: 0.1, r1: 0.5, a0: 0.16, a1: 0, add: false, layer: 0,
      });
    }

    const f = frameAt(t);
    env.cam.set(f.x, f.y, f.z, 0);
  },
  render(env, t) {
    const { ctx, fx } = env;
    const cam = env.cam;
    const time = W(t);
    const sp = camSpeed(t);
    const bx = ballX(t), by = ballY(t);
    const h = heightM(t);
    const dir = ballDir(t);

    // ---- stands (own parallax camera), then the world.
    drawBackdrop(env, time);
    env.world();
    drawGround(env, t, time);

    // ---- decals in the turf: the stamps and the V of the late boom.
    for (let i = 0; i < 3; i++) drawStamp(ctx, XS[i], GY + 1, STAMPS[i].r4 / Z0, t - STAMPS[i].t4, { squash: 0.25, grow: 0.3 });
    // The V of the late boom (the Mach cone's footprint), with soft cyan dabs along its arms as it opens (never a line).
    const wAge = t - BOOM1;
    machWake(ctx, WAKE_X, GY + 1, wAge, { len: WAKE_LEN, open: WAKE_OPEN, squash: 0.25, grow: 0.25, w: 9, alpha: 1 });
    if (wAge >= 0 && wAge < 0.3) {
      const len = WAKE_LEN * ease.outCubic(clamp(wAge / 0.25));
      const ga = 1 - wAge / 0.3;
      for (const sgn of [-1, 1]) {
        for (let k = 1; k <= 6; k++) {
          const u = (k / 6) * len;
          const px = WAKE_X - Math.cos(WAKE_OPEN) * u, py = GY + 1 + sgn * Math.sin(WAKE_OPEN) * u * 0.25;
          drawGlow(ctx, glowOf(PAL.navy), px, py, 7, 0.3 * ga);
          ctx.globalCompositeOperation = 'lighter';
          drawGlow(ctx, glowOf(PAL.cyan), px, py, 5, 0.35 * ga);
          ctx.globalCompositeOperation = 'source-over';
        }
      }
    }
    const rf = frontR(t);
    if (rf > 0) {
      const fa = 1 - 0.55 * clamp((t - FRONT0) / 0.5);
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(XS[2], GY + 1, rf, rf * 0.25, 0, 0, TAU);
      ctx.globalAlpha = 0.3 * fa;
      ctx.strokeStyle = HEX.navy;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.globalAlpha = 0.5 * fa;
      ctx.strokeStyle = HEX.pressed;
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.35 * fa;
      ctx.strokeStyle = HEX.cyan;
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();
    }

    // ---- shadows (the ball's reads its height), far grass, the back of the goal.
    const d1 = d1At(t), d2 = d2At(t);
    // The keeper and the goal come in by parallax (drawn once they are near the frame; drawFig culls off-screen).
    const k = t >= 1.6 ? keeperAt(t) : null;
    drawShadow(ctx, d1.x - 4, GY, 22 + d1.air * 8 + (d1.hip < 30 ? 14 : 0), 0.34 * (1 - 0.6 * d1.air));
    // Defender 2's shadow lies on his own (deeper) row of turf, never on the ball's.
    const [s2x, s2y] = gp(cam.x, d2.x - 4, D2_S);
    drawShadow(ctx, s2x, s2y, (22 + d2.air * 8 + (d2.hip < 30 ? 14 : 0)) * D2_S, 0.34 * (1 - 0.6 * d2.air));
    if (k) drawShadow(ctx, k.x - 4, GY, 24, 0.34);
    drawShadow(ctx, bx, GY, BALL_RW * (1 + h * 0.25), 0.5 * clamp(1 - h / 3.2));
    drawGrass(env, t, 0, D2_S);
    if (k) drawGoalBack(ctx, cam.x);

    // ---- the cast (max 3 puppet renders: off-screen ones are skipped). Defender 2 one plane back, the grass between
    // his plane and the ball's over his boots, then everything in the ball's plane in front of him.
    drawFig(env, RIVAL_KIT_B, d2, D2_S);
    drawGrass(env, t, D2_S, 1);
    env.parts.draw(ctx, 0);
    if (k) drawFig(env, KEEPER_KIT, k);
    drawFig(env, RIVAL_KIT, d1);
    if (k) drawGoalFront(ctx, cam.x);
    drawGrass(env, t, 1, Infinity);

    // ---- the late booms land on the defenders: pressure rings burst off the point the cone's edge catches.
    const hitRings = (at: number, x: number, y: number, R: number, a: number) => {
      const age = t - at;
      if (age < 0 || age > 0.36) return;
      const u = age / 0.36;
      const g = ease.outCubic(u);
      isobars(ctx, x, y, [R * (0.25 + 0.75 * g), R * (0.15 + 0.6 * g), R * 0.45 * g], { squash: 0.85, t, alpha: 0.55 * a * (1 - u), wobble: 0.06, lobes: 5 });
      if (age < 0.12) {
        ctx.save();
        drawGlow(ctx, glowOf(PAL.navy), x, y, 26, 0.35 * a * (1 - age / 0.12));
        ctx.restore();
        sparkleCyan(ctx, x, y, 22 * a * (1 - age / 0.12) + 4, a * (1 - age / 0.12), 0.4);
      }
    };
    hitRings(BOOM1, XD1 - 4, GY - D1_HIP_B + 18, 70, 1);
    const [h2x, h2y] = gp(cam.x, X2B - 2, D2_S);
    hitRings(BOOM2, h2x, h2y - (D2_HIP_B - 8) * D2_S, 46 * D2_S, 0.7);

    // ---- screen space: speed streaks behind the ball (navy under-pass, then cyan).
    env.screen();
    // (A burst as the stadium slams back in on the late boom, and again into the whip zoom.)
    const sa = 0.55 * sp + 0.45 * (t >= BOOM1 ? Math.exp(-(t - BOOM1) * 7) : 0) + 0.5 * clamp((t - WHIP) / 0.2);
    if (sa > 0.02) {
      // In the band the ball travels through (never across the haze above the stands).
      const top = Math.max(10, toScreen(env, cam.x, HZ)[1] - 120);
      ctx.save();
      ctx.lineCap = 'round';
      speedStreaks(ctx, env.frng(41), -40, top, VW + 80, VH - 10 - top, Math.PI, 16, HEX.navy, 0.3 * sa, 110);
      ctx.globalCompositeOperation = 'lighter';
      speedStreaks(ctx, env.frng(41), -40, top, VW + 80, VH - 10 - top, Math.PI, 16, HEX.cyan, 0.55 * sa, 110);
      ctx.restore();
    }
    env.world();

    // ---- the cushion and the air sliver under the ball at each step (it never touches the grass).
    const low = clamp(1 - (h - 0.15) / 0.5);
    if (low > 0) {
      ctx.save();
      drawGlow(ctx, glowOf(PAL.navy), bx, GY, 22, 0.25 * low, 1, 0.3);
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.cyan), bx, GY - 1, 16, 0.22 * low, 1, 0.3);
      ctx.restore();
    }
    for (let i = 0; i < 3; i++) {
      const age = t - STAMPS[i].t4;
      // Step 2 stays lit through the hit-stop: the freeze frame shows the air gap under his studs.
      const hold = i === 1 ? HS1 - HS0 : 0;
      if (age < -0.02 || age > SLIVER + hold) continue;
      const a = age < 0 ? 0.6 : age < hold ? 1 : 1 - clamp((age - hold - 0.03) / (SLIVER - 0.03));
      const gap = GY - (by + BALL_RW);
      cushionSliver(ctx, bx, by + BALL_RW - 0.6, GY + 0.4, i === 2 ? 40 : 28, a * clamp(1 - (gap - 6) / 8));
    }

    // ---- the vapour ribbon, the Mach cone, the ball.
    vaporRibbon(ctx, smoothTrail(trail.pts), 7, time, 1, BALL_RW * 0.8);
    const flare = Math.max(t >= BOOM1 ? 1 - clamp((t - BOOM1) / 0.18) : 0, t >= BOOM2 ? 0.6 * (1 - clamp((t - BOOM2) / 0.15)) : 0);
    // The Mach cone, clipped at the turf (where it meets the ground it leaves the V of the wake instead).
    ctx.save();
    ctx.beginPath();
    ctx.rect(bx - 400, by - 400, 800, GY - 1 - (by - 400));
    ctx.clip();
    machCone(ctx, bx, by, dir, 75 + 25 * flare, clamp(0.35 + 0.65 * clamp(t / 0.12)) * (1.15 + 0.6 * flare));
    ctx.restore();
    const wob = Math.round(noise1(t * 12, 3) * 1.2) / Z0;
    const wobX = Math.round(noise1(t * 12, 9) * 0.8) / Z0;
    drawBall(env, spin, bx + wobX, by + wob, BALL_R, BALL_D, 0.38, 0.75, 'cobalt');
    env.parts.draw(ctx, 1);

    // ---- screen space: cold air motes and blurred grass right at the lens (parallax 1.6+).
    env.screen();
    const hzS = toScreen(env, cam.x, HZ)[1];
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = HEX.ice;
    for (const m of motes) {
      const px = ((((m.X * 900 - cam.x * cam.zoom * 1.3) % 900) + 900) % 900) - 130;
      const py = hzS - 20 + m.Y * (VH - hzS + 10);
      ctx.globalAlpha = 0.28 + (0.2 * m.s) / 2.6;
      ctx.fillRect(px, py, 2 + sp * 13 * m.s, m.s > 2 ? 2 : 1);
    }
    ctx.restore();
    if (fgBlades) {
      const span = VW + 340;
      const zk = Math.pow(cam.zoom / Z0, 1.3);
      const items = [[60, 0, 1.0], [360, 1, 0.85], [620, 2, 1.1]] as const;
      // Low across the bottom edge, below the ball's path (its ground line never drops under y 290).
      ctx.globalAlpha = 0.6;
      for (const [x0, v, s] of items) {
        let x = x0 - (cam.x - FRAME0.x) * cam.zoom * 1.8;
        x = ((((x + 170) % span) + span) % span) - 170;
        const cx = VW / 2 + (x - VW / 2) * zk;
        const im = fgBlades[v];
        const w = im.width * s * zk * (1 + 1.6 * sp), hh = im.height * s * zk;
        ctx.drawImage(im, cx - w / 2, VH - hh * 0.62, w, hh);
      }
      ctx.globalAlpha = 1;
    }

    // ---- post.
    galeGrade(fx);
    fx.bloom = 0.9;
    fx.bloomThresh = 0.66;
    fx.vignette = 0.36;
    fx.ca = 0.002;
    // Step 3's shock is centred under the turf and weaker, so its front passes beneath the ball (never smearing it).
    for (let i = 0; i < 3; i++) stampShock(env, XS[i], i === 2 ? GY + 14 : GY, t - STAMPS[i].t4, i === 2 ? 0.36 : 0.25, i === 2 ? 0.022 : 0.03, i === 2 ? 0.45 : 0.35);
    refractionBand(fx, (t - BOOM1) / 0.2, 0.04);
    refractionBand(fx, (t - BOOM2) / 0.2, 0.025, -1);
    if (t >= BOOM1) fx.ca = Math.max(fx.ca, 0.002 + 0.004 * (1 - clamp((t - BOOM1) / 0.3)));
    if (t >= BOOM2) fx.ca = Math.max(fx.ca, 0.002 + 0.002 * (1 - clamp((t - BOOM2) / 0.25)));
    // The door slammed open: one short ice lift on the late boom (the only full-frame light change in the shot).
    if (t >= BOOM1 && t < BOOM1 + 0.1) {
      fx.flash = 0.22 * (1 - (t - BOOM1) / 0.1);
      fx.flashColor = BLINK.ice;
    }
    // The whip zoom toward the goal: radial blur on the ball, capped at 0.35 while the ball is on screen.
    if (t >= WHIP) {
      const [u, v] = cam.toUV(bx, by);
      fx.radial = 0.35 * ease.inQuad(clamp((t - WHIP) / (DUR - WHIP)));
      fx.radialX = u;
      fx.radialY = v;
    }
    // The last 2 frames: the cyan blink, then the cut.
    if (t >= DUR - 2.5 / 60) {
      fx.flash = 0.7;
      fx.flashColor = BLINK.cyan;
    }
  },
};
