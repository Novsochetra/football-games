// SHOT 3 — STEP-OVER (1.6 s = beats 3-6, global 2.6-4.2; bar 2's ONE is 0.40). SPEC.md §3: defender A.
//
// Camera: a worm's-eye front view from between No.10 and the goal, lens at knee height (0.55 m), looking straight
// back up the pitch. True perspective: a figure at depth factor p (1 = No.10's plane, 5 m from the lens) stands with
// its soles on y = 260 + 62 p and is drawn p times his size; a lateral truck of the camera moves it p times as far.
// The mowing stripes, the D arc and the halfway line recede to the horizon (y 260); behind him the far end stand and
// the side stands are dark, with steady phone lights in them; the floodlight towers are dead. The follow-spot hangs on
// the main-stand roof: its beam enters from the top-centre and lights a pool on the turf at his feet.
//
// No.10 (studio FrontTouch / StepOver Front at x2, Break at x3 from the 1.00 beat-snap) runs at the lens. Every front
// frame shares one registration (body centre x 64, soles on row 102), so they are pinned on that point: the planted
// foot never slides; after the cut each stride is placed on its drawing change and held (stepped like the camera).
// A (RIVAL_KIT puppet, x2 at k 0.86: his size at his depth) jockeys in from screen-left facing +1 in the dark, bites on THE SELL with a
// full-stretch lunge toward screen-right and is thrown on past him into the space the sell pointed at, just as the
// outside of the right boot cuts the ball back the other way; he falls past the exposures and lands on one knee.
// A stands a stride and a half FURTHER from the lens than No.10 (the brief has him a little nearer): visibly behind him
// (smaller, soles 14 px higher), so his dive across reads as depth, never as a dive through the hero or the exposure. A
// nearer A has to cross in front of No.10 between the sell and the cut, covering the hero and the dead ball, or leaves
// the cut rolling between his legs (a nutmeg read, shot 6's skill). Behind him, A's lunge and fall never cover No.10 or
// the ball.
//
// Beats (shot-local; touches, keys, lamps and the OLÉ on the 16th grid):
//   0.00  FrontTouch FT1, an approach touch with the right foot (tom A2); the ball rolls ahead and stops dead (0.14).
//   0.14  StepOver F2 plant · 0.27 F3 the left leg circles over the ball (hats). No exposure yet: F2 and F3 are
//         exposed together with F4 on THE SELL, so at the hold they show the leg circle and the shoulder dip behind him.
//   0.34  A reads the circle: his weight starts across (the bite).
//   0.40  THE SELL (F4, held to 0.60, hit-stop rate 0.1): beat flare, F4 exposure where he stands (the chronophotograph
//         of the step-over: F2, F3, F4), fx.echo +0.012 for 4 frames, 2 ultraviolet/ivory impact frames, beat-snap
//         zoom 1.12. A, frozen in his lunge, turns full colour as he enters the light (only the half of him inside the
//         pool is lit: his colour render goes under the stage dim). 0.45 the STEP-OVER tag.
//   0.60  F5 load · 0.70 F6 push: A's lunge carries him on across behind No.10 over the whole bar to the cut (12 frames,
//         an in-out that leaves at the fall's speed: no teleport, no stop on the cut), flattening out into a full-length
//         dive so his head passes behind No.10's hips, 16+ px below the F5 fist and forearm raised at screen-left (the
//         HEAD_CLEAR guard checks 8); by the cut his lead hand is well clear of the F4 exposure's right edge, out to
//         screen-right.
//   0.80  THE CUT (F7): the ball snapped screen-left (decelerating, it never stops dead; three ball exposures that
//         roll in front of his boots), fx.echo -0.012 for 3 frames, beat flare, a beat-snap push-in (zoom 1.18) that
//         throws the split apart. The camera never trucks: he and the ball do the travelling, and the operator-lagged
//         pool lets him escape its centre.
//   0.85  Break BR1 · 1.00 BR2 with the scale step 2 -> 3 on the beat-snap (the camera move starts on that same
//         frame; the ball is picked up at his x3 anchor, screen-continuous) · 1.15 BR3 · 1.30 BR2 · 1.40 BR3 · 1.50 BR2
//         (quiet stud scuffs on these drawn footfalls); he ends up filling the left of the frame.
//   0.90 / 1.00 / 1.10  the whole step-over chronophotograph (and the ball's) steps down on the grid and is gone as A,
//         back in the dark, scrambles up off the dive (three breakdowns) onto one knee (kneelStumble, 1.10) beside
//         where No.10 was and skids 20 px.
//   1.20  OLÉ! 1: four-count pad 1 lights, the phone lights in the stands lift, a beat-snap push in (zoom 1.08).
//   1.30  the stage darkens outside the pool · 1.45 CHUNK: the house goes black and the spot irises down onto him
//         (rx -> 0 by 1.567); two frames of black; cut.
//
// Clock: RATE[3] (0.1 from 0.40 to 0.60). No.10 follows the brief's frame schedule in shot time; A, the ball spin and
// the particles run on simulation time, so the hit-stop is a rest in the bar. The picture is a pure function of t apart
// from the follow-spot operator, the ball spin and the particles, which advance in update() (seek-exact); init resets.
// Roll 0, sat 1, no rings, no filtering; the exposures never touch anyone.

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { TAU, clamp, ease, lerp, type RGB } from '../../engine/math';
import { drawGlow, glowOf } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { mixPose, type Pose } from '../../art/puppet';
import {
  Afterimages, FADE, FollowSpot, HEX, HUM, P, PAL, POSES, PuppetCache, RATE, RIVAL_KIT, SEQ, TOMS, beatCam, drawBall,
  drawSolo, dustBurst, echoAt, fourCount, grassChunks, joints, marqueeTag, onFrames, onGrid, padsFor, soloAt, soloGrade,
  soloImpact, soloPic, soloPoint, stage, warmSolo, type CamKey, type SoloKey, type StagePool,
} from './common';

const DUR = 1.6;

// ---------------------------------------------------------------- beats (shot-local seconds)
const T_TOUCH = onGrid(0, 'FT1 touch');
const T_F2 = 0.14;
const T_SELL = onGrid(0.4, 'THE SELL');
const T_HOLD = 0.6; // F4 held to here (hit-stop)
const T_CUT = onGrid(0.8, 'THE CUT');
const T_SNAP = onGrid(1.0, 'scale snap 2 -> 3');
const T_KNEE = onGrid(1.1, 'A kneels');
const T_OLE = onGrid(1.2, 'OLE 1');
const T_DARK = onGrid(1.3, 'stage darkens');
const T_IRIS = 1.45; // CHUNK, the iris starts
const T_SHUT = 1.567; // the pool has closed; 1.567 and 1.583 are black
const T_TAG = 0.45;
/** Exposure decay: the whole step-over chronophotograph steps down at 0.90 and 1.00 and is gone at 1.10. */
const T_EXPO_END = 1.1;
/** Ball exposures along the cut (every 2 frames of the zip). */
const BALL_DROPS = [0.8 + 1 / 60, 0.85, 0.8 + 5 / 60];

// ---------------------------------------------------------------- the lens (metres -> px)
/** Horizon (eye level) and the lens height expressed as px at No.10's plane: his soles sit on HZ + EYE_PX. */
const HZ = 260;
const EYE_PX = 62;
/** Depth of his plane (m) and px per metre there (98 art px = 1.75 m at x2). */
const Z0 = 5;
const PXM = 112;
/** The lens stands 14 m from the goal line (inside the box); he is at 19 m, just outside it. */
const LENS_GD = 14;
/** Screen y of the ground at depth factor p, and the depth factor of a depth (m). */
const groundY = (p: number) => HZ + EYE_PX * p;
const pOf = (Z: number) => Z0 / Z;
/** Project a pitch point (X m lateral, screen-right +; Y m up; Z m from the lens) with the camera trucked camX px. */
function proj(X: number, Y: number, Z: number, camX = 0): [number, number] {
  const p = pOf(Z);
  return [VW / 2 + (X * PXM - camX) * p, HZ + (EYE_PX - Y * PXM) * p];
}

// ---------------------------------------------------------------- camera (beat-snap)
/** Zoom pivot: his body centre at x2. */
const PIV = { x: 320, y: 222 };
/**
 * [t, truck, y offset, zoom]. The camera never trucks (x stays 0): a truck at the cut slid every near layer the way
 * the sell went while he cut the other way, so his escape read backwards. He and the ball do the travelling; the cut
 * is a push-in that throws the split apart (the ball and No.10 to screen-left, A to screen-right of the pivot).
 */
const CAM: readonly CamKey[] = [
  [0, 0, 0, 1],
  [T_SELL, 0, -6, 1.12],
  [T_CUT, 0, -6, 1.18],
  [T_SNAP, 0, 0, 1],
  [T_OLE, 0, -12, 1.08], // a push in on the OLÉ
];

type Cam = { x: number; y: number; zoom: number };
/** Transform for a layer at depth factor p: base coordinates (camera untrucked) -> screen, with the truck parallax. */
function layer(env: Env, cam: Cam, p: number) {
  const S = env.S, z = cam.zoom;
  env.ctx.setTransform(S * z, 0, 0, S * z, S * (PIV.x * (1 - z) - cam.x * p * z), S * (PIV.y * (1 - z) + cam.y));
}
/**
 * The camera at shot time t. beatCam holds the previous framing on a key's first frame; from the scale snap on it is
 * read one frame ahead, so the zoom-out starts on the very frame the sprite steps 2 -> 3 (never an x3 sprite at the
 * x2 framing's zoom) and the OLÉ push lands with the shout.
 */
const camAt = (t: number): Cam => beatCam(CAM, t >= T_SNAP - 1e-6 ? t + 1 / 60 : t);
/** Screen point (logical px) of base point (x, y) in a layer at depth factor p. */
function scr(cam: Cam, p: number, x: number, y: number): [number, number] {
  return [PIV.x + (x - cam.x * p - PIV.x) * cam.zoom, PIV.y + (y - PIV.y) * cam.zoom + cam.y];
}

// ---------------------------------------------------------------- No.10

/** Every front frame shares one registration (body centre x 64, soles on row 102): pin that point. */
const PIVOT: [number, number] = [64, 103];
/**
 * Stride placements [time, X px in that plane] at x2 (p 1) and x3 (p 1.5). Each is placed on its drawing change and
 * held until the next (the stepped language of the beat-snap camera), so a planted foot never moves during a hold.
 * After the snap his body travels an even 26 px a stride (faster as the strides shorten to 8ths); the drawn contacts
 * of BR2 / BR3 sit 8 art px either side of his line (his track), so each new plant lands level with or ahead of the
 * last one, never behind it.
 */
const STEP2: readonly [number, number][] = [[0, 0], [0.85, -40]];
const STEP3: readonly [number, number][] = [[T_SNAP, -80], [1.15, -106], [1.3, -132], [1.4, -158], [1.5, -184]];

interface Hero {
  key: SoloKey;
  sc: 2 | 3;
  p: number;
  /** Base position of the pinned point (soles, body centre). */
  x: number;
  y: number;
}

/** His frame and placement at shot time t (the placement in effect: stepped, never eased). */
function heroAt(t: number): Hero {
  const sc: 2 | 3 = t >= T_SNAP - 1e-6 ? 3 : 2;
  const steps = sc === 2 ? STEP2 : STEP3;
  let X = steps[0][1];
  for (const [at, x] of steps) if (t >= at - 1e-6) X = x;
  return { key: soloAt(SEQ[3], t), sc, p: sc / 2, x: VW / 2 + X, y: groundY(sc / 2) };
}

/** How much nearer his boot the ball rolls during the run than the Break anchors put it (px at x3). */
const BALL_TUCK = 12;
const ballOf = (env: Env, h: Hero): [number, number] => soloPoint(env, h.key, 'ball', h.x, h.y, h.sc, { pivot: PIVOT });

interface Ball {
  x: number;
  y: number;
  r: number;
  p: number;
  /** Ground y under it (shadow). */
  gy: number;
}

/**
 * The ball: rolled ahead by the FT1 touch and stopped dead in front of him by F2 (its stillness sells the fake), cut
 * screen-left at 0.80 (snapped, then rolling out, decelerating but never stopping dead), picked up on the beat-snap at
 * 1.00 at his x3 ball anchor (the cut distance is solved for the zooms either side of the snap, so the ball's screen x
 * runs on continuously), then rolled from stride to stride at his leading foot.
 */
function ballAt(env: Env, t: number): Ball {
  if (t < T_CUT - 1e-6) {
    const h = heroAt(t);
    const [sx, sy] = soloPoint(env, 'SO2', 'ball', h.x, h.y, 2, { pivot: PIVOT });
    if (t >= T_F2 - 1e-6) return { x: sx, y: sy, r: 12, p: 1, gy: h.y };
    const [fx, fy] = soloPoint(env, 'FT1', 'ball', h.x, h.y, 2, { pivot: PIVOT });
    const u = ease.outQuad(clamp(t / T_F2));
    return { x: lerp(fx, sx, u), y: lerp(fy, sy, u), r: 12, p: 1, gy: h.y + (fy - sy) * (1 - u) };
  }
  if (t < T_SNAP - 1e-6) {
    const [x0, y0] = soloPoint(env, 'SO7', 'ball', VW / 2, groundY(1), 2, { pivot: PIVOT });
    const [x1] = ballOf(env, heroAt(T_SNAP));
    // Screen-continuous across the snap: the cut ends (at the push-in's zoom) on the screen x where the snap frame
    // (its own zoom, the scale step) picks the ball up at his x3 anchor.
    const zCut = camAt(T_SNAP - 1 / 60).zoom, zSnap = camAt(T_SNAP).zoom;
    const D = x0 - (PIV.x + (x1 + BALL_TUCK - PIV.x) * (zSnap / zCut));
    const u = clamp((t - T_CUT) / (T_SNAP - T_CUT));
    // Snapped out fast, decelerating into his stride (a quarter of it linear, so it is still rolling at the snap).
    const e = 0.75 * (1 - (1 - u) * (1 - u)) + 0.25 * u;
    return { x: x0 - D * e, y: y0, r: 12, p: 1, gy: groundY(1) };
  }
  // After the snap: from the anchor of one stride to the next, rolling continuously.
  const keys = STEP3.map(([at]) => at);
  let i = 0;
  for (let k = 0; k < keys.length; k++) if (t >= keys[k] - 1e-6) i = k;
  const a = ballOf(env, heroAt(keys[i]));
  let b: [number, number];
  let span: number;
  if (i + 1 < keys.length) {
    b = ballOf(env, heroAt(keys[i + 1]));
    span = keys[i + 1] - keys[i];
  } else {
    const pa = ballOf(env, heroAt(keys[i - 1]));
    b = [a[0] + (a[0] - pa[0]), a[1]];
    span = keys[i] - keys[i - 1];
  }
  const u = clamp((t - keys[i]) / span);
  // Kept a little nearer his leading boot than the anchors (it rolls on between his touches, never a stride ahead).
  return { x: lerp(a[0], b[0], u) + BALL_TUCK, y: lerp(a[1], b[1], u), r: 18, p: 1.5, gy: groundY(1.5) };
}

// ---------------------------------------------------------------- defender A (puppet, sim time)

/**
 * A's depth factor, puppet pixels per unit and screen px per puppet pixel. A stands a stride and a half behind No.10's
 * plane (1.4 m further from the lens: his soles sit 14 px higher and he is drawn at his depth's size, 0.78 of No.10's
 * scale), so his lunge and dive visibly pass BEHIND No.10 and the hero, the dead ball and the cut path are never covered
 * (a nearer A has to cross in front of him at the cut).
 */
const PA = 0.78;
const AK = 1.105 * PA;
const AD = 2;
const AU = AK * AD;
const A_GY = groundY(PA);
const D2R = Math.PI / 180;

/** Sim time of shot time t under RATE[3] (0.1 from 0.40 to 0.60): A, the ball spin and the dust live on it. */
const simT = (t: number) => (t <= T_SELL ? t : t <= T_HOLD ? T_SELL + (t - T_SELL) * 0.1 : T_SELL + 0.02 + (t - T_HOLD));
const S_HOLD = simT(T_HOLD); // 0.42
const S_CUT = simT(T_CUT); // 0.62
const S_KNEE = simT(T_KNEE); // 0.92
/** A falls out of the pool (back to the dark-stage silhouette over 4 frames). */
const A_DARK = 0.9;

/** The jockey shuffle's closing step (feet together, a little higher). */
const JOCKEY_CLOSE: Pose = P({ ...POSES.jockey, thighN: 14 * D2R, kneeN: 34 * D2R, thighF: -2 * D2R, kneeF: 26 * D2R, armN: 30 * D2R, armF: -26 * D2R });
/**
 * THE SELL: lungeCommit staged for the front view. The shared pose stabs the lead boot out at knee height, which from
 * this angle points at No.10's knees; here the same full-stretch commit plants the lead heel on the turf (toe up),
 * reaching for the space the sell pointed at, all his weight thrown onto it (rear knee low, rear boot off the turf).
 */
const LUNGE: Pose = P({ ...POSES.lungeCommit, torso: 34 * D2R, head: -22 * D2R, thighN: 56 * D2R, kneeN: 4 * D2R, footN: -18 * D2R, thighF: -44 * D2R, kneeF: 58 * D2R, footF: 30 * D2R, armN: 40 * D2R, elbowN: 20 * D2R, armF: -70 * D2R, elbowF: 24 * D2R });
/** The dive across: A overcommits after the bite, flat out (torso pitched 72 deg, chin up toward the space the sell
 *  pointed at), lead leg reaching, trailing leg stretched high behind. Flat and low on purpose: his head passes
 *  behind No.10 BELOW the F5 fist and forearm raised at screen-left (8+ px clear: the HEAD_CLEAR guard), never just
 *  under it (at 52 deg, upright, it slid 0-3 px under the fist: a fist-on-the-head read in a still). */
const DIVE: Pose = P({ torso: 72 * D2R, head: -24 * D2R, thighN: 80 * D2R, kneeN: 20 * D2R, footN: -8 * D2R, thighF: -72 * D2R, kneeF: 18 * D2R, footF: 30 * D2R, armN: 84 * D2R, elbowN: 14 * D2R, armF: -40 * D2R, elbowF: 30 * D2R });

/** A's pose names (all pre-rendered in prepare()). */
const A_POSES: Record<string, Pose> = {
  jk0: POSES.jockey,
  jk1: JOCKEY_CLOSE,
  bite1: mixPose(POSES.jockey, LUNGE, 0.4),
  bite2: mixPose(POSES.jockey, LUNGE, 0.75),
  lunge: LUNGE,
  dive0: mixPose(LUNGE, DIVE, 0.5),
  dive1: mixPose(LUNGE, DIVE, 0.78),
  dive: DIVE,
  fall0: mixPose(DIVE, POSES.kneelStumble, 0.2),
  fall1: mixPose(DIVE, POSES.kneelStumble, 0.45),
  fall2: mixPose(DIVE, POSES.kneelStumble, 0.75),
  kneel: POSES.kneelStumble,
};
/** Pose schedule on sim time: jockey shuffle -> the bite (from 0.34, reading the circle) -> lungeCommit on THE SELL
 *  (held through the hit-stop) -> the dive across (flattening out in two breakdowns, so the head is already low as it
 *  reaches the F5 fist at 0.65) -> pushing up off the dive to the knee in three -> kneelStumble at 1.10. */
const A_TRACK: readonly [number, string][] = [
  // the jockey shuffle: one step per 16th, in time with the hip steps below (a shuffle, not a flutter)
  [0, 'jk0'], [0.1, 'jk1'], [0.2, 'jk0'], [0.3, 'jk1'],
  [0.34, 'bite1'], [0.37, 'bite2'], [T_SELL, 'lunge'],
  // the hit-stop releases him into the dive: across behind No.10 over the whole bar to the cut
  [S_HOLD, 'dive0'], [S_HOLD + 0.03, 'dive1'], [S_HOLD + 0.06, 'dive'],
  [S_CUT + 0.06, 'fall0'], [S_CUT + 0.13, 'fall1'], [S_CUT + 0.21, 'fall2'], [S_KNEE, 'kneel'],
];
/** From bite1 on, the hip height glides between key poses. */
const A_TRACK_INTERP = A_TRACK.findIndex(([, n]) => n === 'bite1');
/** From the lunge on, a pose never sinks below its own turf line while the hip glides down toward the next (lower)
 *  pose: the frozen lunge holds still through the hit-stop, and each flatter dive breakdown lands on the turf. */
const A_TRACK_NOSINK = A_TRACK.findIndex(([, n]) => n === 'lunge');
/**
 * The dive's ease: an in-out (smoothstep, peak speed 1.4x the mean, so he never teleports) that leaves at the cut with
 * the speed the fall carries on at (outQuad 420 -> 470 over 0.3 s), so he never stops dead on the cut and restarts.
 */
const DIVE_END_SLOPE = (2 * (470 - 420) / (S_KNEE - S_CUT)) * ((S_CUT - S_HOLD) / (420 - 174));
const DIVE_EASE = (u: number) => u * u * (3 - 2 * u) + DIVE_END_SLOPE * (u * u * u - u * u);
/** Hip x (base, A's plane, camera untrucked) on sim time: [s, x, ease into this key]. */
const A_X: readonly [number, number, (u: number) => number][] = [
  [0, 140, ease.linear], // the match cut from shot 2: he starts close in, just outside the edge of the light
  [0.34, 166, ease.linear], // the shuffle in from screen-left (a step on each 16th, below)
  [T_SELL, 172, ease.outQuad], // the bite: his reach stops a hand short of No.10
  [S_HOLD, 174, ease.linear], // frozen in the hit-stop
  [S_CUT, 420, DIVE_EASE], // the dive across behind him, spread over the whole bar from the hold to the cut
  [S_KNEE, 470, ease.outQuad], // carried on past where he was, falling
  [S_KNEE + 0.2, 490, ease.outCubic], // the knee skid (20 px)
];

/** Hip height above the turf (puppet units) so the lowest joint touches it (cf. game/gauntlet.ts hipAbove). */
function hipAbove(pose: Pose): number {
  const j = joints(pose);
  return Math.max(j.toeN[1] + 3, j.toeF[1] + 3, j.ankleN[1] + 3, j.kneeN[1] + 5, j.handN[1] + 3, j.handF[1] + 3, j.head[1] + 12, j.neck[1] + 8);
}
const A_HIP: Record<string, number> = Object.fromEntries(Object.entries(A_POSES).map(([k, v]) => [k, hipAbove(v)]));

interface DefA {
  name: string;
  x: number;
  y: number;
  /** Torso centre (for the light test). */
  cx: number;
  cy: number;
}

function defAt(t: number): DefA {
  const s = simT(t);
  let ni = 0;
  for (let i = 0; i < A_TRACK.length; i++) if (s >= A_TRACK[i][0] - 1e-6) ni = i;
  const name = A_TRACK[ni][1];
  // Hip x: piecewise eased; the shuffle moves on each closing step only.
  let x = A_X[A_X.length - 1][1];
  for (let i = 0; i + 1 < A_X.length; i++) {
    const [s0, x0] = A_X[i], [s1, x1, e] = A_X[i + 1];
    if (s < s1) {
      let u = clamp((s - s0) / (s1 - s0));
      if (i === 0) u = clamp((Math.floor(s / 0.1) + ease.outQuad(clamp(((s % 0.1) - 0.05) / 0.05))) / 3);
      x = lerp(x0, x1, e(u));
      break;
    }
  }
  // Hip height: glide between the key poses' hipAbove so pose switches never pop vertically.
  const nxt = A_TRACK[Math.min(A_TRACK.length - 1, ni + 1)];
  const k = nxt[0] > A_TRACK[ni][0] ? clamp((s - A_TRACK[ni][0]) / (nxt[0] - A_TRACK[ni][0])) : 0;
  let hip = lerp(A_HIP[name], A_HIP[nxt[1]], ni >= A_TRACK_INTERP ? k : 0);
  if (ni >= A_TRACK_NOSINK) hip = Math.max(hip, A_HIP[name]);
  if (name === 'jk1') hip += 1.5; // the closing step lifts him a touch
  const y = A_GY - hip * AU;
  const j = joints(A_POSES[name]);
  return { name, x, y, cx: x + j.neck[0] * 0.5 * AU, cy: y + j.neck[1] * 0.5 * AU };
}

// ---------------------------------------------------------------- dev guard (tone: nothing reads as a fist on a head)

const warned3 = new Set<string>();
function warnOnce(k: string, msg: string) {
  if (warned3.has(k)) return;
  warned3.add(k);
  console.warn(`SPOTLIGHT SOLO shot 3: ${msg}`);
}
/** A's head disc (12 units, its outline and the hair: shot 5's C_HEAD_R) in base px at his plane. */
const A_HEAD_R = 13.5 * AU;
/** The quality bar's clearance (screen px, shot 5's HEAD_CLEAR): A's head from No.10's fists, forearms and face. */
const HEAD_CLEAR = 8;
/** No.10's skin tones (Sochetra palette: light, shade). */
const SKIN = [0xf49348, 0xb8502b];
/**
 * The pixels of a studio frame that could come down on a head: his RAISED fists and forearms, i.e. the skin islands
 * above the pelvis row, other than his face (the island reaching within 15 px of the head anchor) and specks under
 * 6 px, that reach above his chin line (the face island's lowest row), plus the outline pixels touching them, as
 * centres in frame px (built once per frame). A hand hanging at his hip and his shirt and shorts are left out: A dives
 * across a stride and a half BEHIND him, so his head passing behind No.10's torso or a lowered arm is depth.
 */
const strikeCache = new Map<string, Float32Array>();
function strikePixels(env: Env, key: SoloKey): Float32Array {
  const pic = soloPic(env, key);
  let out = strikeCache.get(pic.id);
  if (out) return out;
  const { w, h, px } = pic;
  const top = Math.min(h, Math.floor(pic.anchor('pelvis')[1]));
  const [hx, hy] = pic.anchor('head');
  const skin = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= top) return false;
    const k = (y * w + x) * 4;
    return px[k + 3] > 40 && SKIN.includes((px[k] << 16) | (px[k + 1] << 8) | px[k + 2]);
  };
  const keep = new Uint8Array(w * h), seen = new Uint8Array(w * h);
  const islands: { comp: number[]; face: boolean; y0: number; y1: number }[] = [];
  for (let k0 = 0; k0 < w * top; k0++) {
    if (seen[k0] || !skin(k0 % w, (k0 / w) | 0)) continue;
    const comp: number[] = [], stack = [k0];
    seen[k0] = 1;
    let face = false, y0 = h, y1 = 0;
    while (stack.length) {
      const k = stack.pop()!;
      comp.push(k);
      const x = k % w, y = (k / w) | 0;
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
      if (Math.hypot(x + 0.5 - hx, y + 0.5 - hy) < 15) face = true;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const kk = (y + dy) * w + x + dx;
          if (skin(x + dx, y + dy) && !seen[kk]) (seen[kk] = 1), stack.push(kk);
        }
    }
    if (comp.length >= 6) islands.push({ comp, face, y0, y1 });
  }
  const chin = Math.max(-1, ...islands.filter((i) => i.face).map((i) => i.y1));
  for (const i of islands) if (!i.face && (chin < 0 || i.y0 < chin)) for (const k of i.comp) keep[k] = 1;
  const pts: number[] = [];
  for (let y = 0; y < top; y++)
    for (let x = 0; x < w; x++) {
      if (px[(y * w + x) * 4 + 3] <= 40) continue;
      let hit = false;
      for (let dy = -1; dy <= 1 && !hit; dy++)
        for (let dx = -1; dx <= 1 && !hit; dx++) {
          const xx = x + dx, yy = y + dy;
          hit = xx >= 0 && yy >= 0 && xx < w && yy < h && keep[yy * w + xx] === 1;
        }
      if (hit) pts.push(x + 0.5, y + 0.5);
    }
  strikeCache.set(pic.id, (out = Float32Array.from(pts)));
  return out;
}
/** A's head at t: screen centre and radius (his pose's head joint; the pose is the cached render he is drawn with). */
function aHead(cam: Cam, t: number): [number, number, number] {
  const a = defAt(t);
  const j = joints(A_POSES[a.name]);
  const [sx, sy] = scr(cam, PA, a.x + j.head[0] * AU, a.y + j.head[1] * AU);
  return [sx, sy, A_HEAD_R * cam.zoom];
}
/** Smallest screen gap between A's head disc (screen centre, radius) and No.10's raised fists / forearms. */
function strikeGap(env: Env, cam: Cam, h: Hero, sx: number, sy: number, R: number): [number, number, number] {
  const pts = strikePixels(env, h.key);
  const half = 0.5 * h.sc * cam.zoom;
  let gap = Infinity, fx = 0, fy = 0;
  for (let i = 0; i < pts.length; i += 2) {
    const [X, Y] = scr(cam, h.p, h.x + (pts[i] - PIVOT[0]) * h.sc, h.y + (pts[i + 1] - PIVOT[1]) * h.sc);
    const d = Math.hypot(X - sx, Y - sy) - R - half;
    if (d < gap) (gap = d), (fx = pts[i]), (fy = pts[i + 1]);
  }
  return [gap, fx, fy];
}
/**
 * The tone guard, run from update() (shot 5's toneGuards for C): from the bite to his knee, A's head stays at least
 * HEAD_CLEAR px from No.10's raised fists and forearms. The dive crosses under the F5 fist and forearm raised at
 * screen-left (0.60-0.70). Warns once per frame.
 */
function toneGuard(env: Env, t: number) {
  if (t < 0.34 - 1e-6 || t >= T_KNEE - 1e-6) return;
  const cam = camAt(t);
  const [sx, sy, R] = aHead(cam, t);
  const h = heroAt(t);
  const [g, fx, fy] = strikeGap(env, cam, h, sx, sy, R);
  if (g < HEAD_CLEAR)
    warnOnce(`head@${Math.round(t * 60)}`, `A's head ${g.toFixed(1)} px from No.10's fist / forearm at ${t.toFixed(3)} s (needs ${HEAD_CLEAR}; head at screen ${sx.toFixed(0)},${sy.toFixed(0)} r ${R.toFixed(0)}, ${h.key} px ${fx - 0.5},${fy - 0.5})`);
}

// ---------------------------------------------------------------- the stadium (front view, lights down)

const css = (c: RGB, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
/** Small deterministic hash -> [0, 1). */
const h01 = (i: number, s: number) => {
  const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/** Far end stand and side stands (m): depth of the far stand, half-width. */
const STAND_Z = 96;
const STAND_X = 46;
/** Parallax of the whole backdrop (it is 70-100 m away). */
const P_BACK = 0.06;
const BACK_PAD = 60;
let backCv: HTMLCanvasElement | null = null;
let backK = 0;

/**
 * The dark stadium behind him, built once (it only shifts a few px with the truck): a sliver of night above the roof
 * canopies, the far end stand in two tiers (the crowd strip, without its LED boards: the ad boards died with the house
 * lights in shot 2), the side stands receding at the edges, and two dead floodlight towers in the far corners.
 */
function backdrop(env: Env): HTMLCanvasElement {
  const K = Math.max(1, Math.ceil(env.S - 1e-3));
  if (backCv && backK === K) return backCv;
  backK = K;
  const W = VW + BACK_PAD * 2, H = HZ + 8;
  const cv = (backCv = document.createElement('canvas'));
  cv.width = W * K;
  cv.height = H * K;
  const g = cv.getContext('2d')!;
  g.scale(K, K);
  g.translate(BACK_PAD, 0);
  g.imageSmoothingEnabled = true;
  const crowd = env.art.stadium.crowd;
  // Night above the roofs (no moon, no stars): plum-black.
  const sky = g.createLinearGradient(0, 0, 0, 140);
  sky.addColorStop(0, '#05030b');
  sky.addColorStop(1, '#120a22');
  g.fillStyle = sky;
  g.fillRect(-BACK_PAD, 0, W, H);
  // Far stand: two tiers of the crowd strip (fan rows only), a dark concourse between, a dead LED wall below.
  const [xl] = proj(-STAND_X, 0, STAND_Z), [xr] = proj(STAND_X, 0, STAND_Z);
  const tier = (y0: number, y1: number, sx: number) => {
    const [, ta] = proj(0, y1, STAND_Z), [, tb] = proj(0, y0, STAND_Z);
    g.drawImage(crowd, sx, 2, 820, 94, xl, ta, xr - xl, tb - ta);
  };
  tier(13, 24.5, 300);
  tier(1.2, 11.8, 760);
  {
    const [, ca] = proj(0, 13, STAND_Z), [, cb] = proj(0, 11.8, STAND_Z);
    g.fillStyle = '#0a0716';
    g.fillRect(xl, ca, xr - xl, cb - ca + 0.5);
    const [, wa] = proj(0, 1.2, STAND_Z), [, wb] = proj(0, 0, STAND_Z);
    g.fillStyle = '#06040c';
    g.fillRect(xl, wa, xr - xl, wb - wa + 1);
    g.fillStyle = '#1a1426';
    for (let x = xl + 3; x < xr - 10; x += 24) g.fillRect(Math.round(x), Math.round(wa + 2), 18, Math.max(1, Math.round(wb - wa - 4)));
  }
  // Side stands, column by column (each slice is the crowd strip squeezed to that depth's height).
  for (const side of [-1, 1]) {
    const x0 = side < 0 ? -BACK_PAD : Math.ceil(xr), x1 = side < 0 ? xl : VW + BACK_PAD;
    for (let x = x0; x < x1; x += 2) {
      const Z = (STAND_X * PXM * Z0) / Math.max(1, Math.abs(x + 1 - VW / 2));
      if (Z > STAND_Z) continue;
      const [, ta] = proj(0, 24.5, Z), [, tb] = proj(0, 1.2, Z), [, wb] = proj(0, 0, Z);
      const sx = (Math.floor(Z * 13) % 1500) + 40;
      g.drawImage(crowd, sx, 2, 3, 94, x, ta, 2, tb - ta);
      g.fillStyle = '#06040c';
      g.fillRect(x, tb, 2, wb - tb + 1);
    }
  }
  // Roof canopies: a dark fascia over the far stand, rising over the side stands toward the edges.
  {
    const [, f0] = proj(0, 28, 90), [, f1] = proj(0, 26.5, 90);
    g.fillStyle = '#07050f';
    g.beginPath();
    g.moveTo(-BACK_PAD, -10);
    g.lineTo(VW + BACK_PAD, -10);
    g.lineTo(VW + BACK_PAD, 34);
    g.lineTo(xr + 6, f1);
    g.lineTo(xl - 6, f1);
    g.lineTo(-BACK_PAD, 34);
    g.closePath();
    g.fill();
    g.fillStyle = '#0d0a1c';
    g.fillRect(xl - 6, f0, xr - xl + 12, f1 - f0);
  }
  // The house lights are down: the stands sink further into the plum (the stage dim does the rest), so the phone
  // lights read as the only points of light in them.
  g.globalCompositeOperation = 'multiply';
  g.fillStyle = 'rgb(176,160,200)';
  g.fillRect(-BACK_PAD, 0, W, H);
  g.globalCompositeOperation = 'source-over';
  // Dead floodlight towers in the far corners (lamp grids dark: the house lights are down).
  for (const side of [-1, 1]) {
    const [bx, by] = proj(side * 54, 0, 104), [, ty] = proj(side * 54, 40, 104);
    g.fillStyle = '#141126';
    g.fillRect(Math.round(bx - 2), ty, 4, by - ty);
    g.fillStyle = '#1b1830';
    for (let y = ty + 16; y < by - 4; y += 8) g.fillRect(Math.round(bx - 5), y, 10, 1);
    g.fillStyle = '#211d38';
    g.fillRect(Math.round(bx - 19), ty - 14, 38, 18);
    g.fillStyle = '#2a2440';
    for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) g.fillRect(Math.round(bx - 17 + c * 6), ty - 12 + r * 5, 4, 3);
  }
  return cv;
}

/** ~60 phone lights in the dark stands (world points, seeded): steady, twinkling slowly (±30%). */
const PHONES: { x: number; y: number; c: string; rgb: RGB; ph: number; f: number }[] = [];
function phones() {
  if (PHONES.length) return PHONES;
  for (let i = 0; i < 64; i++) {
    let X: number, Y: number, Z: number;
    if (i % 5 === 4) {
      // Side stands, visible only near the edges.
      Z = lerp(74, STAND_Z - 1, h01(i, 3));
      X = (i % 2 ? 1 : -1) * STAND_X;
      Y = lerp(2.5, 22, h01(i, 4));
    } else {
      Z = STAND_Z;
      X = lerp(-STAND_X + 1, STAND_X - 1, h01(i, 5));
      Y = h01(i, 6) < 0.5 ? lerp(2, 11.4, h01(i, 7)) : lerp(13.6, 24, h01(i, 7));
    }
    const [x, y] = proj(X, Y, Z);
    const lilac = i % 3 === 0;
    PHONES.push({ x, y, c: lilac ? HEX.lilac : HEX.ivory, rgb: lilac ? PAL.lilac : PAL.ivory, ph: h01(i, 8) * TAU, f: 0.9 + (i % 5) * 0.17 });
  }
  return PHONES;
}

/** Turf grain (world points, seeded): it slides with the truck at its own depth. */
const SPECKS: { X: number; Z: number; c: string }[] = [];
function specks() {
  if (SPECKS.length) return SPECKS;
  for (let i = 0; i < 520; i++) {
    const Z = 1.5 + Math.pow(h01(i, 11), 1.6) * 22;
    SPECKS.push({ X: (h01(i, 12) * 2 - 1) * (4 + Z * 0.62), Z, c: h01(i, 13) < 0.5 ? 'rgba(18,56,26,0.55)' : 'rgba(110,190,90,0.26)' });
  }
  return SPECKS;
}

/** The turf: 5 m mowing stripes (horizontal bands: the truck never moves them), depth shading, grain. */
function drawTurf(env: Env, cam: Cam) {
  const ctx = env.ctx;
  layer(env, cam, 0);
  const L = -BACK_PAD - 40, W = VW + 2 * (BACK_PAD + 40);
  ctx.fillStyle = '#245f2d';
  ctx.fillRect(L, HZ - 4, W, VH - HZ + 40);
  // Stripes, goal-line distances 15, 20, ... from the near goal (the lens stands at 14 m).
  for (let gd = 15; gd < 105; gd += 5) {
    const ya = groundY(pOf(gd - LENS_GD)), yb = groundY(pOf(gd + 5 - LENS_GD));
    ctx.fillStyle = Math.round(gd / 5) % 2 === 0 ? '#2f8a3c' : '#287a35';
    ctx.fillRect(L, yb, W, Math.min(VH + 40, ya) - yb + 0.5);
  }
  // Depth haze toward the horizon (far = darker).
  const hz = ctx.createLinearGradient(0, HZ, 0, HZ + 40);
  hz.addColorStop(0, 'rgba(8,10,30,0.55)');
  hz.addColorStop(1, 'rgba(8,10,30,0)');
  ctx.fillStyle = hz;
  ctx.fillRect(L, HZ - 4, W, 44);
  for (const s of specks()) {
    const [x, y] = proj(s.X, 0, s.Z, cam.x);
    if (x < -60 || x > VW + 60 || y > VH + 30) continue;
    ctx.fillStyle = s.c;
    ctx.fillRect(Math.round(x), Math.round(y), s.Z < 4 ? 2 : 1, 1);
  }
}

/** A ground polyline (metres) projected with the truck. */
function groundLine(ctx: CanvasRenderingContext2D, pts: [number, number][], camX: number) {
  ctx.beginPath();
  pts.forEach(([X, Z], i) => {
    const [x, y] = proj(X, 0, Math.max(1.2, Z), camX);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  });
  ctx.stroke();
}

/** The pitch markings fluorescing lilac in the dark (after the dim): the D arc behind him, the halfway line and the
 *  centre circle, the touchlines near the horizon, and the far goal frame. */
function drawFluoro(env: Env, cam: Cam) {
  const ctx = env.ctx;
  layer(env, cam, 0);
  ctx.save();
  ctx.lineCap = 'butt';
  ctx.strokeStyle = HEX.lilac;
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = 1.5;
  // The D: the arc of radius 9.15 m round the penalty spot (11 m from the goal), outside the box (16.5 m).
  const D: [number, number][] = [];
  const a0 = Math.acos(5.5 / 9.15);
  for (let a = -1; a <= 1.0001; a += 1 / 24) D.push([Math.sin(a * a0) * 9.15, 11 + Math.cos(a * a0) * 9.15 - LENS_GD]);
  groundLine(ctx, D, cam.x);
  ctx.lineWidth = 1;
  // Halfway line, centre circle, touchlines.
  const half = 52.5 - LENS_GD;
  groundLine(ctx, [[-40, half], [40, half]], cam.x);
  const cc: [number, number][] = [];
  for (let a = 0; a <= TAU + 1e-6; a += TAU / 48) cc.push([Math.sin(a) * 9.15, half + Math.cos(a) * 9.15]);
  groundLine(ctx, cc, cam.x);
  for (const s of [-1, 1]) groundLine(ctx, [[s * 34, 40], [s * 34, 105 - LENS_GD]], cam.x);
  // The far goal (posts and bar), tiny at the end of the pitch.
  ctx.globalAlpha = 0.34;
  const gz = 105 - LENS_GD;
  const [gx0, gy0] = proj(-3.66, 0, gz, cam.x), [gx1] = proj(3.66, 0, gz, cam.x), [, gyt] = proj(0, 2.44, gz, cam.x);
  ctx.strokeRect(Math.round(gx0) + 0.5, Math.round(gyt) + 0.5, Math.round(gx1 - gx0), Math.round(gy0 - gyt));
  ctx.restore();
}

/** Phone lights: light sources, so after the dim. They lift with the crowd on the OLÉ. */
function drawPhones(env: Env, cam: Cam, t: number) {
  const ctx = env.ctx;
  layer(env, cam, P_BACK);
  const lift = 1 + (t >= T_OLE ? 0.35 * clamp(1 - (t - T_OLE) / 0.35) : 0);
  ctx.save();
  for (const ph of phones()) {
    const k = clamp((1 + 0.3 * Math.sin(t * ph.f + ph.ph)) * 0.8 * lift);
    ctx.globalCompositeOperation = 'source-over';
    drawGlow(ctx, glowOf(PAL.uvDeep), ph.x + 0.5, ph.y + 0.5, 5, 0.35 * k);
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(ph.rgb), ph.x + 0.5, ph.y + 0.5, 3.2, 0.42 * k);
    ctx.globalAlpha = k;
    ctx.fillStyle = ph.c;
    ctx.fillRect(Math.round(ph.x), Math.round(ph.y), 1, 1);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- No.10's boots under ultraviolet

const bootCache = new Map<string, [number, number][]>();
/** Centroids (frame px) of the white boot pixels of a frame, at most two (one per foot). */
function bootsOf(env: Env, key: SoloKey): [number, number][] {
  const pic = soloPic(env, key);
  let out = bootCache.get(pic.id);
  if (out) return out;
  const pts: [number, number][] = [];
  for (let y = 78; y < Math.min(pic.h, 104); y++)
    for (let x = 0; x < pic.w; x++) {
      const i = (y * pic.w + x) * 4;
      const r = pic.px[i], g = pic.px[i + 1], b = pic.px[i + 2];
      if (pic.px[i + 3] > 200 && r > 185 && g > 180 && b > 195 && Math.max(r, g, b) - Math.min(r, g, b) < 45) pts.push([x + 0.5, y + 0.5]);
    }
  out = [];
  if (pts.length) {
    pts.sort((a, b) => a[0] - b[0]);
    let cut = 0, gap = 0;
    for (let i = 1; i < pts.length; i++) if (pts[i][0] - pts[i - 1][0] > gap) (gap = pts[i][0] - pts[i - 1][0]), (cut = i);
    const groups = gap > 3 ? [pts.slice(0, cut), pts.slice(cut)] : [pts];
    for (const gr of groups)
      if (gr.length >= 4) out.push([gr.reduce((s, p) => s + p[0], 0) / gr.length, gr.reduce((s, p) => s + p[1], 0) / gr.length]);
  }
  bootCache.set(pic.id, out);
  return out;
}

/**
 * The white boots glow under the ultraviolet spot, in two passes so the boots stay the brightest white on screen:
 * 'under' (before the sprite) lays the uvDeep halo and the violet glow on the turf round them; 'over' (after it) adds
 * only the small additive ivory core on the boots themselves.
 */
function bootGlow(env: Env, h: Hero, a: number, pass: 'under' | 'over') {
  const ctx = env.ctx;
  for (const [bx, by] of bootsOf(env, h.key)) {
    const x = h.x + (bx - PIVOT[0]) * h.sc, y = h.y + (by - PIVOT[1]) * h.sc;
    if (pass === 'under') {
      ctx.globalCompositeOperation = 'source-over';
      drawGlow(ctx, glowOf(PAL.uvDeep), x, y, 9 * h.sc, 0.4 * a);
      drawGlow(ctx, glowOf(PAL.uv), x, y, 6.5 * h.sc, 0.28 * a);
    } else {
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.ivory), x, y, 3.5 * h.sc, 0.3 * a);
    }
  }
  ctx.globalCompositeOperation = 'source-over';
}

// ---------------------------------------------------------------- the iris (a reused curtain)

let curtainCv: HTMLCanvasElement | null = null;
/** FADE-black outside a soft elliptical hole (screen space): the house going dark, then the spot irising down. */
function curtain(ctx: CanvasRenderingContext2D, a: number, hole: { x: number; y: number; rx: number; ry: number } | null) {
  if (a <= 0) return;
  if (!curtainCv) {
    curtainCv = document.createElement('canvas');
    curtainCv.width = VW;
    curtainCv.height = VH;
  }
  const g = curtainCv.getContext('2d')!;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-over';
  g.globalAlpha = 1;
  g.clearRect(0, 0, VW, VH);
  g.fillStyle = css(FADE, clamp(a));
  g.fillRect(0, 0, VW, VH);
  if (hole && hole.rx > 0.5 && hole.ry > 0.5) {
    g.globalCompositeOperation = 'destination-out';
    const soft = Math.min(14, hole.rx * 0.6);
    const R = hole.rx + soft;
    g.save();
    g.translate(hole.x, hole.y);
    g.scale(1, hole.ry / hole.rx);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, R);
    gr.addColorStop(0, 'rgba(0,0,0,1)');
    gr.addColorStop(clamp(hole.rx / R), 'rgba(0,0,0,1)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.fillRect(-R, -R, R * 2, R * 2);
    g.restore();
    g.globalCompositeOperation = 'source-over';
  }
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(curtainCv, 0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
}

// ---------------------------------------------------------------- module state (reset in init)

const ghosts = new Afterimages(6, 9);
const pc = new PuppetCache();
/** The follow-spot operator: x = his lateral position (m), y = his depth factor (it slides forward when he does). */
const spot = new FollowSpot(0.06);
let spin = new BallSpin();
let lastT = 0;
let lastBallX = NaN;
let fired = { sell: false, balls: 0, knee: false, skid: 0 };

/** Lateral world position (m) and depth factor of his pinned point. */
const heroWorld = (h: Hero): [number, number] => [(h.x - VW / 2) / (PXM * h.p), h.p];

/** The pool (lagged) in base coordinates of its own layer. */
function poolBase(): { x: number; gy: number; p: number } {
  const p = spot.y;
  return { x: VW / 2 + spot.x * PXM * p, gy: groundY(p), p };
}

const LIGHT_R = { lx: 0.6, ly: -0.8 };
const LIGHT_L = { lx: -0.6, ly: -0.8 };

// ---------------------------------------------------------------- the shot

export const shotStepOver: Shot = {
  name: 'Step-over',
  dur: DUR,
  seed: 503,
  rate: RATE[3],
  cues: [
    { at: T_TOUCH, fn: (env) => env.sfx.tom(TOMS.A2) },
    { at: onGrid(0.2, 'hat'), fn: (env) => env.sfx.hat() },
    { at: onGrid(0.3, 'open hat'), fn: (env) => (env.sfx.hat(true), env.sfx.whoosh(0.15, 300, 2400, 0.22)) },
    {
      at: T_SELL,
      fn: (env) => {
        env.sfx.kickDrum(0.8);
        env.sfx.whoosh(0.2, 300, 1600, 0.45, 0.6);
        env.sfx.spotOn(0.12); // the beat flare's lamp tick
      },
    },
    {
      at: T_CUT,
      fn: (env) => {
        env.sfx.snare(1.0);
        env.sfx.kick(0.4);
        env.sfx.whoosh(0.2, 300, 2400, 0.45, -0.6);
        env.sfx.spotOn(0.12);
      },
    },
    { at: 0.85, fn: (env) => env.sfx.tom(TOMS.C3, 0.5, -0.3) },
    { at: 0.95, fn: (env) => env.sfx.tom(TOMS.A2, 0.5, -0.35) },
    { at: 1.05, fn: (env) => env.sfx.tom(TOMS.F2, 0.5, -0.4) },
    // Quiet stud scuffs on the drawn footfalls of the burst (BR3, BR2, BR3, BR2), panned to his side.
    { at: 1.15, fn: (env) => env.sfx.scuff(0.12, -0.4) },
    { at: T_KNEE, fn: (env) => (env.sfx.boom(0.2, 0.5, 0.5), env.sfx.scuff(0.2, 0.5)) },
    { at: T_OLE, fn: (env) => env.sfx.ole(1) },
    { at: onGrid(1.3, 'BR2 footfall'), fn: (env) => env.sfx.scuff(0.12, -0.4) },
    { at: onGrid(1.4, 'BR3 footfall'), fn: (env) => env.sfx.scuff(0.12, -0.45) },
    { at: onGrid(1.5, 'BR2 footfall'), fn: (env) => env.sfx.scuff(0.12, -0.5) },
    { at: T_IRIS, fn: (env) => env.sfx.lightsOff(0.3) },
  ],
  prepare(env) {
    warmSolo(env, SEQ[3].map(([, k]) => k), { ghosts: true });
    for (const [, k] of SEQ[3]) bootsOf(env, k);
    for (const [name, pose] of Object.entries(A_POSES)) {
      pc.get(name, RIVAL_KIT, pose, AK, 1);
      pc.get(name, RIVAL_KIT, pose, AK, 1, LIGHT_R);
      pc.get(name, RIVAL_KIT, pose, AK, 1, LIGHT_L);
    }
    backdrop(env);
    phones();
    specks();
  },
  init(env) {
    env.sfx.clearBus();
    env.cam.set(VW / 2, VH / 2, 1, 0);
    ghosts.clear();
    spin = new BallSpin();
    const [X, p] = heroWorld(heroAt(0));
    spot.snap(X, p);
    lastT = 0;
    lastBallX = NaN;
    fired = { sell: false, balls: 0, knee: false, skid: 0 };
  },
  update(env, t, dt) {
    env.sfx.hum(HUM[3](t));
    const real = Math.max(0, t - lastT);
    lastT = t;
    // The follow-spot operator: ~60 ms behind him in real time (on the cut he is faster than the light).
    const [X, p] = heroWorld(heroAt(t));
    spot.update(X, p, real);
    // The chronophotograph of the step-over, exposed all at once on THE SELL (exposures drop only on listed beats): F2
    // and F3 behind, F4 on top. Nothing hangs behind him before the sell to give it away. The whole set steps down at
    // 0.90 and 1.00 and is gone at 1.10 (on the grid), as A lands on his knee.
    const drop = (key: SoloKey, at: number) => ghosts.dropHero(key, VW / 2, groundY(1), 2, at, T_EXPO_END - at, { pivot: PIVOT });
    if (!fired.sell && t >= T_SELL - 1e-6) (fired.sell = true), drop('SO2', T_SELL), drop('SO3', T_SELL), drop('SO4', T_SELL);
    // Three ball exposures along the cut.
    while (fired.balls < BALL_DROPS.length && t >= BALL_DROPS[fired.balls] - 1e-6) {
      const at = BALL_DROPS[fired.balls++];
      const b = ballAt(env, at);
      ghosts.dropBall(b.x, b.y, b.r, at, T_EXPO_END - at);
    }
    // Ball spin, locked to its roll (dead still under the step-over).
    const b = ballAt(env, t);
    const bx = b.x / b.p;
    if (!Number.isNaN(lastBallX) && dt > 0) {
      const dx = bx - lastBallX;
      if (Math.abs(dx) > 1e-3 && Math.abs(dx) < 60) spin.rotate(0, 0.25, 1, (-dx * b.p) / b.r);
    }
    lastBallX = bx;
    // A's knee hits the turf and skids: dust and a few torn grass bits (A's plane, untrucked coordinates).
    const kneeX = (a: DefA) => a.x + joints(POSES.kneelStumble).kneeN[0] * AU;
    if (!fired.knee && t >= T_KNEE - 1e-6) {
      fired.knee = true;
      const a = defAt(t);
      dustBurst(env, kneeX(a), A_GY - 2, 7, 0.55, 0.8);
      grassChunks(env, kneeX(a), A_GY - 2, 5, 0.45);
    }
    if (fired.knee && fired.skid < 3 && t >= T_KNEE + 0.05 * (fired.skid + 1) - 1e-6) {
      fired.skid++;
      dustBurst(env, kneeX(defAt(t)), A_GY - 1, 2, 0.3, 0.5);
    }
    toneGuard(env, t);
  },
  render(env, t) {
    const ctx = env.ctx;
    soloGrade(env.fx);
    const cam = camAt(t);
    const h = heroAt(t);
    const a = defAt(t);
    const ball = ballAt(env, t);
    const fl = stage.flare(t, [T_SELL, T_CUT]);
    const pool = poolBase();

    // A's light: the dark-stage silhouette until THE SELL, then (4-frame cross-fade) his colour render, drawn under the
    // stage dim so only the half of him inside the pool is lit; back to the silhouette once he has fallen out of it.
    // On the match cut from shot 2 (where he ends half-lit at the edge of the pool) a little of his colour carries over
    // (under the stage dim, so it is brightest on the side nearest the pool) and falls away over 0.2 s as he drops back
    // into the dark to jockey.
    const aLit = Math.max(
      clamp((t - T_SELL) / (4 / 60)) * (1 - clamp((t - A_DARK) / (4 / 60))),
      0.35 * clamp(1 - t / 0.2),
    );
    const aLight = t < T_CUT ? LIGHT_R : LIGHT_L;

    // ---- the world in the dark: night, stands, towers, turf, A's dust
    env.screen();
    ctx.fillStyle = '#05030b';
    ctx.fillRect(0, 0, VW, VH);
    layer(env, cam, P_BACK);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(backdrop(env), -BACK_PAD, 0, VW + BACK_PAD * 2, HZ + 8);
    ctx.imageSmoothingEnabled = false;
    drawTurf(env, cam);
    layer(env, cam, PA);
    env.parts.draw(ctx, 0);
    env.parts.draw(ctx, 1);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    if (aLit > 0) {
      // A short soft shadow straight under him (the light is above), then A in colour.
      ctx.fillStyle = css(PAL.plum, 0.45 * aLit);
      ctx.beginPath();
      ctx.ellipse(a.x + 8, A_GY, 40, 6, 0, 0, TAU);
      ctx.fill();
      pc.draw(ctx, a.name, RIVAL_KIT, A_POSES[a.name], AK, 1, a.x, a.y, AD, 1, aLight);
    }

    // ---- the stage dim, with the hole round him (it follows the operator, not him)
    const [px, py] = scr(cam, pool.p, pool.x, pool.gy - 100 * pool.p);
    const z = cam.zoom;
    const hole: StagePool = { x: px, y: py, rx: 110 * pool.p * z * fl.size, ry: 150 * pool.p * z * fl.size, soft: 40, gain: 1 };
    const dimLv = t < T_DARK ? 0.8 : lerp(0.8, 0.88, clamp((t - T_DARK) / (T_IRIS - T_DARK)));
    stage.dim(ctx, dimLv, [hole]);

    // ---- fluorescent accents: pitch lines, phone lights
    drawFluoro(env, cam);
    drawPhones(env, cam, t);

    // ---- the follow-spot: beam from the main-stand roof (top-centre) and its pool on the turf
    {
      layer(env, cam, 0);
      const fx = pool.x - cam.x * pool.p; // the pool's x in the untrucked zoom layer
      stage.beam(ctx, 334, -46, fx, pool.gy, 34, 2 * 90 * pool.p * 0.92, 0.16 * fl.gain, { t, motes: 26, seed: 31 });
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      drawGlow(ctx, glowOf(PAL.uvDeep), 334, -18, 70, 0.6);
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.lilac), 334, -16, 40, 0.26);
      drawGlow(ctx, glowOf(PAL.ivory), 334, -14, 18, 0.5);
      ctx.restore();
      layer(env, cam, pool.p);
      stage.floorPool(ctx, pool.x, pool.gy, 90 * pool.p * fl.size, 22 * pool.p * fl.size, 0.35 * fl.gain);
    }

    // ---- A in the dark: a plum silhouette with lilac rims on the side facing the pool (a little further from the lens
    // than No.10, so behind him and his exposures)
    if (aLit < 1) {
      layer(env, cam, PA);
      pc.draw(ctx, a.name, RIVAL_KIT, A_POSES[a.name], AK, 1, a.x, a.y, AD, 0, aLight, 1 - aLit);
    }

    // ---- exposures (where he WAS), then No.10, his shadow, boots, the ball
    layer(env, cam, 1);
    ghosts.draw(env, t, 'hero');
    layer(env, cam, h.p);
    ctx.fillStyle = css(PAL.plum, 0.5);
    ctx.beginPath();
    ctx.ellipse(h.x, h.y - 1, 30 * h.p, 6 * h.p, 0, 0, TAU);
    ctx.fill();
    bootGlow(env, h, 1, 'under');
    drawSolo(env, h.key, h.x, h.y, h.sc, { pivot: PIVOT });
    bootGlow(env, h, 1, 'over');
    // The ball's exposures: in a front view the ball rolls in front of his boots, so its strobe chain does too.
    layer(env, cam, 1);
    ghosts.draw(env, t, 'ball');
    layer(env, cam, ball.p);
    ctx.fillStyle = css(PAL.plum, 0.55);
    ctx.beginPath();
    ctx.ellipse(ball.x, ball.gy - 0.5, ball.r * 0.95, ball.r * 0.24, 0, 0, TAU);
    ctx.fill();
    drawBall(env, spin, Math.round(ball.x), Math.round(ball.y), ball.r, 1, 0, 0.8 * fl.gain, 'blacklight');
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // ---- beat echo, impact frames
    {
      const [hx, hy] = scr(cam, h.p, h.x, h.y - 98 * h.p);
      echoAt(env, t, T_SELL, 4, 0.8, 0.012, { sx: hx, sy: hy, R: 0.35 });
      echoAt(env, t, T_CUT, 3, 0.6, -0.012, { sx: hx, sy: hy, R: 0.35 });
      if (onFrames(t, T_SELL, 2)) soloImpact(env.fx, 1);
    }

    // ---- the spot iris: the house goes dark (1.30), CHUNK (1.45), the pool closes on him (1.567), black
    if (t >= T_DARK - 1e-6) {
      const pre = 0.55 * ease.inQuad(clamp((t - T_DARK) / (T_IRIS - T_DARK)));
      const f = Math.floor((t - T_IRIS) * 60 + 1e-6);
      const out = t < T_IRIS - 1e-6 ? pre : f <= 0 ? 0.86 : f === 1 ? 0.96 : 1;
      const k = ease.inOutQuad(clamp((t - T_IRIS) / (T_SHUT - T_IRIS)));
      const open = t >= T_SHUT - 1e-6 ? null : { x: hole.x, y: hole.y, rx: hole.rx * (1 - k), ry: hole.ry * (1 - k) };
      curtain(ctx, out, open);
    }

    // ---- HUD: the marquee tag, the four-count
    env.screen();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    marqueeTag(ctx, 'STEP-OVER', 18, 12, t - T_TAG);
    fourCount(ctx, padsFor(3), t);
  },
};
