// SHOT 5 — ELASTICO (1.2 s = beats 12-14, global 6.2-7.4; bar 4's ONE is 0.00, the SNAP is beat 13 at 0.40).
// SPEC.md §5: defender C.
//
// Camera: a front view at knee height from between No.10 and the goal (the same lens as shot 3: a figure at depth
// factor p stands with its soles on y = 260 + 62 p and is drawn p times his size). He stands in the D, just outside
// the box: the box line runs across the turf in front of him and the D arc curves round behind him. For variety the
// follow-spot here sits BEHIND THE CAMERA, like footlights: no shaft from the roof; the light comes over the lens (a
// faint glow in the air from the bottom of the frame, motes drifting up it), the turf in front of him glows, he is lit
// flat and frontal, and his long shadow stretches up the pitch behind him (leaning a little left: the lamp is a little
// right of the lens).
//
// No.10 (studio FrontTouch / Elastico Front at x2, the Break WEST strip from 0.55 so the chest still reads "10", x3
// from the 0.80 beat-snap). Every front frame shares one registration (body centre x 64, soles on row 102), so they
// are pinned on that point through the move (the planted left foot never slides); the burst moves in eased strides on
// his frame changes, stepped like the camera. C (RIVAL_KIT_C puppet, 2.2 px per unit at No.10's plane) sprints in from
// screen-right facing -1, a stride further from the lens than No.10 (smaller, higher), so No.10, the ball and the ball's
// exposures always read on top of him: his stab reaches behind No.10's legs for the ball he was shown (the torso thrown
// back so his head stays clear of No.10's arm), his overcommit carries him on out to screen-left into a comic split, and
// he topples onto his hip there, while No.10 escapes the other way (screen-right, his left).
//
// Beats (shot-local; touches, keys, lamps and the OLÉ on the 16th grid):
//   0.00  opens out of the whip pan (fx.radial 0.2 -> 0 over 3 frames, the frame still sliding in). FrontTouch FT1, an
//         approach touch (kick drum + tom D2). C sprints in from the right edge in the dark (plum, lilac rims).
//   0.10  C reaches the edge of the light and turns full colour (4-frame cross-fade, under the dim).
//   0.20  Elastico F2: the outside of the right boot SHOWS the ball screen-left, the whole body leaning with it (hat).
//   0.30  F3 wrap: the boot rides round the outside of the ball (hat). C plants and stabs at the shown ball, the lunge
//         accelerating into 0.40.
//   0.367 F4, the smear frame, for exactly 2 frames: the ball reverses with no slowdown (the gag), one ball-width a
//         frame, so the strobe chain reads as separate exposures.
//   0.40  THE SNAP (F5, held to 0.55; hit-stop rate 0.06): the inside of the right boot has whipped the ball back to
//         screen-right. The strobe fires: three ball exposures (alpha 0.4 at the turn, 0.55, 0.7, on uvDeep halos)
//         draw the hairpin from the turn to where the real ball sits now, an exposure of F2 (leaning left) stands at
//         the turn, and C's boot arrives in the empty end of it. Beat flare, 2 ultraviolet/ivory impact frames,
//         fx.echo +0.012 for 3 frames, beat-snap zoom 1.0 -> 1.15. Snare + the special's first crash + kick + the
//         lamp tick. 0.45 the ELASTICO tag.
//   0.55  Break BR2 (west strip): the burst toward the lens and screen-right; the ball rolls to his leading boot.
//         C's stab finds only grass: he overcommits and slides on past the empty end into a full comic split (0.60),
//         freezes there, tips (0.72) and topples onto his hip (0.75: boom + scuff). The V exposures step down on the
//         grid (0.60, 0.70) and are gone at 0.80.
//   0.70  BR3 (west strip).
//   0.80  OLÉ! 3 (pad 3 lights, the phone lights lift): beat-snap back out and after him, his scale steps 2 -> 3 (BR2),
//         C falls back into the dark.
//   0.80-1.20 the ghost wipe: as he sprints at the lens and past it, each 16th leaves an exposure of his current frame
//         where he stands at x3 (0.80), x4 (0.90), x5 (1.00, where his BR3 stride lands) and x6 (1.10), each nearer
//         the lens (bigger, lower), sweeping left to right (16th tom fill D3, C3, A2, F2; whooshes left -> right at
//         1.00 / 1.05). The x6 is a solid ultraviolet silhouette drawn over him that covers most of the frame, the
//         beat echo throws it rightward (4 frames), and the last three frames ramp to violet: cut on the violet (shot 6
//         opens out of it).
//
// Clock: RATE[5] (0.06 from 0.40 to 0.55). No.10 follows the brief's frame schedule in shot time; C, the ball after the
// snap, the spin and the particles run on simulation time, so the hit-stop is a rest in the bar. The picture is a pure
// function of t apart from the follow-spot operator, the ball spin and the particles, which advance in update()
// (seek-exact); init resets all module state. Roll 0, sat 1, no rings, no filtering; the exposures never touch anyone
// (C's boot stabs at the empty end of the V because he read the real outside push, not because of a ghost; the F2
// exposure is drawn under C so it never lands on his head). Photosensitivity: one impact pair (0.40) and one violet
// ramp into the cut in this shot; one beat flare.

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { TAU, clamp, ease, lerp, type RGB } from '../../engine/math';
import { drawGlow, glowOf } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { mixPose, type Pose } from '../../art/puppet';
import {
  Afterimages, FollowSpot, HEX, HUM, P, PAL, POSES, PuppetCache, RATE, RIVAL_KIT_C, TOMS, beatCam, drawBall, drawSolo,
  drawSoloGhost, dustBurst, echoAt, fadeIn, fourCount, grassChunks, joints, marqueeTag, onFrames, onGrid, padsFor,
  soloGrade, soloImpact, soloPic, soloPoint, stage, uvSilhouette, warmSolo, type CamKey, type Exposure, type SoloKey,
  type StagePool,
} from './common';

const DUR = 1.2;

// ---------------------------------------------------------------- beats (shot-local seconds)
const T_TOUCH = onGrid(0, 'FT1 touch');
const T_LIT = onGrid(0.1, 'C enters the light');
const T_PUSH = onGrid(0.2, 'EL2 outside push');
const T_WRAP = onGrid(0.3, 'EL3 wrap, C stabs');
/** F4, the smear: on screen for exactly 2 frames (frames 22 and 23). */
const T_SMEAR = 22 / 60;
const T_SNAP = onGrid(0.4, 'SNAP');
const T_HOLD = 0.55; // F5 held to here (hit-stop)
const T_TAG = 0.45;
const T_BR3 = 0.7;
const T_SPLIT = onGrid(0.6, 'C lands in the split');
const T_TIP = 0.7;
const T_TOPPLE = 0.75;
const T_OLE = onGrid(0.8, 'OLE 3');
const T_BR3B = onGrid(1.0, 'BR3 x3');
/** The V exposures die on the grid: 0.6 -> 0.4 (0.60) -> 0.2 (0.70) -> gone (0.80). */
const T_V_END = 0.8;
/**
 * The ghost wipe: as he sprints at the lens and past it to screen-right, every 16th leaves an exposure of his current
 * frame where he stands at x3, x4, x5 and x6, each one nearer the lens (bigger, lower): [time, scale, pelvis y] (base
 * coordinates of his x3 layer; x = his stride). x3 is a normal exposure (0.80); x4 and x5 stand behind him; x6 is the
 * solid ultraviolet silhouette that covers him and most of the frame (1.10).
 */
const WIPE: readonly (readonly [number, number, number])[] = [[0.9, 4, 268], [1.0, 5, 298]];
const T_X6 = onGrid(1.1, 'ghost wipe x6');
const X6_Y = 328;

// ---------------------------------------------------------------- the lens (metres -> px), as shot 3
const HZ = 260;
const EYE_PX = 62;
const Z0 = 5;
const PXM = 112;
/** The lens stands 12.5 m from the goal line (inside the box); he is at 17.5 m, in the D. */
const LENS_GD = 12.5;
const groundY = (p: number) => HZ + EYE_PX * p;
const pOf = (Z: number) => Z0 / Z;
function proj(X: number, Y: number, Z: number, camX = 0): [number, number] {
  const p = pOf(Z);
  return [VW / 2 + (X * PXM - camX) * p, HZ + (EYE_PX - Y * PXM) * p];
}

// ---------------------------------------------------------------- camera (beat-snap)
/** Zoom pivot: his body centre at x2. */
const PIV = { x: 312, y: 226 };
/** [t, truck (px at his plane), y offset, zoom]. */
const CAM: readonly CamKey[] = [
  [0, 0, 0, 1],
  [T_SNAP, -8, -30, 1.15], // the SNAP: snap in on the hairpin
  [T_OLE, 40, 0, 1], // the OLÉ: back out and truck after his burst (he runs across the frame at the lens)
];
/** The whip pan out of shot 4 arrives: the frame is still sliding left for the first 4 frames. */
const WHIP = -64;
const WHIP_T = 4 / 60;

type Cam = { x: number; y: number; zoom: number };
function camAt(t: number): Cam {
  const c = beatCam(CAM, t);
  return { x: c.x + WHIP * (1 - ease.outCubic(clamp(t / WHIP_T))), y: c.y, zoom: c.zoom };
}
/** Transform for a layer at depth factor p (base coordinates -> screen, with the truck parallax). */
function layer(env: Env, cam: Cam, p: number) {
  const S = env.S, z = cam.zoom;
  env.ctx.setTransform(S * z, 0, 0, S * z, S * (PIV.x * (1 - z) - cam.x * p * z), S * (PIV.y * (1 - z) + cam.y));
}
/** Screen point (logical px) of base point (x, y) in a layer at depth factor p. */
function scr(cam: Cam, p: number, x: number, y: number): [number, number] {
  return [PIV.x + (x - cam.x * p - PIV.x) * cam.zoom, PIV.y + (y - PIV.y) * cam.zoom + cam.y];
}

// ---------------------------------------------------------------- No.10

/** The frame schedule (shot time): [t, key, west strip]. F4 for exactly two frames; the burst on the Break west strip. */
const SEQ5: readonly (readonly [number, SoloKey, boolean])[] = [
  [0, 'FT1', false], [T_PUSH, 'EL2', false], [T_WRAP, 'EL3', false], [T_SMEAR, 'EL4', false], [T_SNAP, 'EL5', false],
  [T_HOLD, 'BR2', true], [T_BR3, 'BR3', true], [T_OLE, 'BR2', true], [T_BR3B, 'BR3', true],
];
const KEYS: readonly SoloKey[] = ['FT1', 'EL2', 'EL3', 'EL4', 'EL5', 'BR2', 'BR3'];
/** Every front frame shares one registration (body centre x 64, soles on row 102): pin that point. */
const PIVOT: [number, number] = [64, 103];
/** Where his soles stand (base x) at x2 (p 1) and x3 (p 1.5); pinned between, eased over 3 frames. */
const X0 = 304;
const STEP2: readonly (readonly [number, number])[] = [[0, X0], [T_HOLD, X0 + 26], [T_BR3, X0 + 62]];
/** At x3 he sprints at the lens and past it to screen-right, a stride on each 8th (stepped like the camera). */
const STEP3: readonly (readonly [number, number])[] = [[T_OLE, 360], [T_BR3B, 450]];
const STRIDE3_EASE = 6 / 60;
const STRIDE_EASE = 3 / 60;

interface Hero {
  key: SoloKey;
  flip: boolean;
  sc: 2 | 3;
  p: number;
  x: number;
  y: number;
}

function seqAt(t: number): readonly [number, SoloKey, boolean] {
  let s = SEQ5[0];
  for (const e of SEQ5) if (t >= e[0] - 1e-6) s = e;
  return s;
}
function strideX(steps: readonly (readonly [number, number])[], t: number, eased = true, dur = STRIDE_EASE): number {
  let i = 0;
  for (let k = 0; k < steps.length; k++) if (t >= steps[k][0] - 1e-6) i = k;
  if (i === 0 || !eased) return steps[i][1];
  const u = clamp((t - steps[i][0]) / dur);
  return lerp(steps[i - 1][1], steps[i][1], ease.outCubic(u));
}
function heroAt(t: number, eased = true): Hero {
  const [, key, flip] = seqAt(t);
  const sc: 2 | 3 = t >= T_OLE - 1e-6 ? 3 : 2;
  const p = sc / 2;
  const x = sc === 2 ? strideX(STEP2, t, eased) : strideX(STEP3, t, eased, STRIDE3_EASE);
  return { key, flip, sc, p, x, y: groundY(p) };
}
const drawOpts = (h: Hero) => ({ pivot: PIVOT, flip: h.flip });

// ---------------------------------------------------------------- the ball

/** Sim time of shot time t under RATE[5] (0.06 from 0.40 to 0.55). */
const simT = (t: number) => (t <= T_SNAP ? t : t <= T_HOLD ? T_SNAP + (t - T_SNAP) * 0.06 : T_SNAP + 0.009 + (t - T_HOLD));
const S_HOLD = simT(T_HOLD);
/** The ball leaves the inside of the boot at ~5.4 m/s (px/s at x2): it creeps on through the hit-stop. */
const V_SNAP = 600;
/**
 * Art x of the ball through the reversal: the two smear frames and the SNAP, evenly spaced from the turn (EL3, 42.5) to
 * just past the inside of the boot (EL5's contact is 74: on the SNAP it has already left it). One ball apart, so the
 * strobe chain reads as separate exposures.
 */
const STROBE_AX = [55.7, 68.8, 82] as const;
/** In the burst the ball rolls a little nearer his leading boot than the Break anchors put it (px per scale step). */
const TUCK = 5;

interface Ball {
  x: number;
  y: number;
  r: number;
  p: number;
  /** Ground y under it (shadow). */
  gy: number;
}

/** Ball centre at a frame's ball anchor (art x `ax` overrides the anchor's x) with his soles pinned at (X0, 322). */
function ballOn(env: Env, key: SoloKey, ax?: number): [number, number] {
  const [bx, by] = soloPoint(env, key, 'ball', X0, groundY(1), 2, { pivot: PIVOT });
  return ax === undefined ? [bx, by] : [X0 + (ax + 0.5 - PIVOT[0]) * 2, by];
}

/**
 * The ball: rolled up by the approach touch to the outside of his right boot (0.00-0.20), SHOWN screen-left by the
 * outside push (0.20-0.30), ridden round by the wrap (0.30-0.367), then reversed with no slowdown: the smear frames
 * carry it back across at art x 50 and 62, and on the SNAP it sits at the inside of the boot (art 74), then rolls on
 * screen-right at V_SNAP on sim time (a creep through the hit-stop). From 0.55 it is glued to the leading boot of the
 * burst (rolling continuously from stride to stride; r 12 -> 18 on the beat-snap with him).
 */
function ballAt(env: Env, t: number): Ball {
  const gy = groundY(1);
  if (t < T_PUSH - 1e-6) {
    const [x0, y0] = ballOn(env, 'FT1'), [x1, y1] = ballOn(env, 'EL2');
    const u = ease.outQuad(clamp(t / T_PUSH));
    return { x: lerp(x0, x1, u), y: lerp(y0, y1, u), r: 12, p: 1, gy: gy + (y0 - y1) * (1 - u) };
  }
  if (t < T_WRAP - 1e-6) {
    const [x0, y0] = ballOn(env, 'EL2'), [x1] = ballOn(env, 'EL3');
    const u = ease.outQuad(clamp((t - T_PUSH) / (T_WRAP - T_PUSH)));
    return { x: lerp(x0, x1, u), y: y0, r: 12, p: 1, gy };
  }
  if (t < T_SMEAR - 1e-6) {
    const [x1, y1] = ballOn(env, 'EL3');
    return { x: x1 - 2 * clamp((t - T_WRAP) / (T_SMEAR - T_WRAP)), y: y1, r: 12, p: 1, gy };
  }
  if (t < T_SNAP - 1e-6) {
    // The two smear frames: the reversal with no slowdown.
    const f = Math.round((t - T_SMEAR) * 60);
    const [x, y] = ballOn(env, 'EL4', f <= 0 ? STROBE_AX[0] : STROBE_AX[1]);
    return { x, y, r: 12, p: 1, gy };
  }
  const [sx, sy] = ballOn(env, 'EL5', STROBE_AX[2]);
  if (t < T_HOLD - 1e-6) return { x: sx + V_SNAP * (simT(t) - T_SNAP), y: sy, r: 12, p: 1, gy };
  if (t < T_OLE - 1e-6) {
    // The burst at x2: from where the snap left it to his leading boot as each stride lands, then on toward the x3 one.
    const keys: [number, number, number][] = [[T_HOLD, sx + V_SNAP * (S_HOLD - T_SNAP), sy]];
    for (const at of [T_HOLD, T_BR3]) {
      const h = heroAt(at, false);
      const [bx, by] = soloPoint(env, h.key, 'ball', h.x, h.y, 2, drawOpts(h));
      keys.push([at + STRIDE_EASE + 0.02, bx - TUCK * 2, by]);
    }
    const [bx3, by3] = ballX3(env, T_OLE);
    keys.push([T_OLE, bx3, by3]);
    let i = 0;
    for (let k = 0; k < keys.length - 1; k++) if (t >= keys[k][0] - 1e-6) i = k;
    const [t0, x0, y0] = keys[i], [t1, x1, y1] = keys[i + 1];
    const u = clamp((t - t0) / (t1 - t0));
    return { x: lerp(x0, x1, u), y: lerp(y0, y1, u), r: 12, p: 1, gy };
  }
  const [x, y] = ballX3(env, t);
  return { x, y, r: 18, p: 1.5, gy: groundY(1.5) };
}

/** At x3 the ball is glued to his leading boot (the Break anchor, tucked in), stepping with his strides. */
function ballX3(env: Env, t: number): [number, number] {
  const h = heroAt(t);
  const [bx, by] = soloPoint(env, h.key, 'ball', h.x, h.y, 3, drawOpts(h));
  return [bx - TUCK * 3, by];
}

// ---------------------------------------------------------------- defender C (puppet, sim time)

/** C's depth factor (a stride further from the lens than No.10: smaller, higher, always drawn behind him; 2.2 px per
 *  unit at No.10's plane), px per unit, screen px per pixel. */
const PC = 0.85;
const CK = 1.1 * PC;
const CD = 2;
const CU = CK * CD;
const C_GY = groundY(PC);
const D2R = Math.PI / 180;

/** The brake: the sprint checks, weight back, lead foot reaching. */
const PLANT: Pose = P({ torso: 4 * D2R, head: -8 * D2R, thighN: 30 * D2R, kneeN: 20 * D2R, footN: -10 * D2R, thighF: -20 * D2R, kneeF: 40 * D2R, footF: 10 * D2R, armN: -30 * D2R, elbowN: 60 * D2R, armF: 40 * D2R, elbowF: 60 * D2R });
/**
 * THE STAB (lungeCommit staged for this front view): the lead leg shot out long and low at the ball he was shown, toe
 * pointed, the rear knee dropping toward the turf, and the torso thrown back to balance the reach (so his head stays
 * clear of No.10's on the right while his boot reaches behind No.10's legs).
 */
const STAB: Pose = P({ torso: -34 * D2R, head: 26 * D2R, thighN: 72 * D2R, kneeN: 0, footN: 80 * D2R, thighF: -50 * D2R, kneeF: 100 * D2R, footF: 20 * D2R, armN: -80 * D2R, elbowN: 30 * D2R, armF: 120 * D2R, elbowF: 20 * D2R });
/** The comic split (splitFreeze staged flat on the turf: both legs straight out, arms flung up). */
const SPLIT: Pose = P({ ...POSES.splitFreeze, thighN: 88 * D2R, kneeN: 0, footN: 0, thighF: -88 * D2R, kneeF: 0, footF: 90 * D2R, head: -16 * D2R, armN: 165 * D2R, elbowN: 10 * D2R, armF: 150 * D2R, elbowF: 25 * D2R });
/** Tipping: the split held, the torso going over backward, one arm windmilling. */
const TIP: Pose = P({ torso: -36 * D2R, head: 10 * D2R, thighN: 84 * D2R, kneeN: 0, footN: 0, thighF: -84 * D2R, kneeF: 4 * D2R, footF: 90 * D2R, armN: 40 * D2R, elbowN: 20 * D2R, armF: 170 * D2R, elbowF: 25 * D2R });
/** sideTopple staged in profile: down on his hip, the legs still split, propped on one arm. */
const TOPPLE: Pose = P({ torso: -74 * D2R, head: 30 * D2R, thighN: 80 * D2R, kneeN: 0, footN: 0, thighF: -80 * D2R, kneeF: 10 * D2R, footF: 90 * D2R, armN: -130 * D2R, elbowN: 30 * D2R, armF: 150 * D2R, elbowF: 25 * D2R });

const C_POSES: Record<string, Pose> = {
  run1: POSES.run1,
  run2: POSES.run2,
  run3: POSES.run3,
  run4: POSES.run4,
  plant: PLANT,
  stab0: mixPose(PLANT, STAB, 0.45),
  stab: STAB,
  over: mixPose(STAB, SPLIT, 0.5),
  split: SPLIT,
  tip: TIP,
  topple: TOPPLE,
};
/** Pose schedule on sim time. */
const C_TRACK: readonly [number, string][] = [
  [0, 'run1'], [0.05, 'run2'], [0.1, 'run3'], [0.15, 'run4'], [0.2, 'run1'], [0.25, 'plant'], [T_WRAP, 'stab0'],
  [0.37, 'stab'], [S_HOLD + 0.02, 'over'], [simT(T_SPLIT), 'split'], [simT(T_TIP) + 0.02, 'tip'], [simT(T_TOPPLE), 'topple'],
];
/** From this track index on, the hip height glides between key poses (the run keeps its bounce). */
const C_TRACK_INTERP = 6;
/** Hip x (base, his plane, camera untrucked) on sim time: [s, x, ease into this key]. */
const C_X: readonly [number, number, (u: number) => number][] = [
  [0, 660, ease.linear],
  [0.1, 524, ease.linear], // the edge of the light
  [0.25, 454, ease.outQuad], // the brake
  [T_WRAP, 446, ease.linear],
  [T_SNAP, 352, ease.inQuad], // the stab: his boot arrives in the empty end of the V just as the ball has gone
  [S_HOLD, 350, ease.linear], // frozen in the hit-stop
  [simT(T_SPLIT), 232, ease.outQuad], // the overcommit: he slides on past where the ball was, into the split
  [simT(T_TIP), 226, ease.outQuad], // frozen there (a little slide)
  [simT(T_TOPPLE), 220, ease.inQuad], // tips and lands on his hip
  [simT(T_TOPPLE) + 0.2, 214, ease.outCubic],
];

/** Hip height above the turf (puppet units) so the lowest point touches it. */
function hipAbove(pose: Pose): number {
  const j = joints(pose);
  // The rear knee (not in joints) for the kneeling stab.
  const kf = 3 + Math.cos(pose.thighF) * 19;
  return Math.max(j.toeN[1] + 3, j.toeF[1] + 3, j.ankleN[1] + 3, j.kneeN[1] + 5, kf + 5, j.handN[1] + 3, j.handF[1] + 3, j.head[1] + 12, j.neck[1] + 8);
}
const C_HIP: Record<string, number> = Object.fromEntries(Object.entries(C_POSES).map(([k, v]) => [k, hipAbove(v)]));

interface DefC {
  name: string;
  x: number;
  y: number;
}
function defAt(t: number): DefC {
  const s = simT(t);
  let ni = 0;
  for (let i = 0; i < C_TRACK.length; i++) if (s >= C_TRACK[i][0] - 1e-6) ni = i;
  const name = C_TRACK[ni][1];
  let x = C_X[C_X.length - 1][1];
  for (let i = 0; i + 1 < C_X.length; i++) {
    const [s0, x0] = C_X[i], [s1, x1, e] = C_X[i + 1];
    if (s < s1) {
      x = lerp(x0, x1, e(clamp((s - s0) / (s1 - s0))));
      break;
    }
  }
  const nxt = C_TRACK[Math.min(C_TRACK.length - 1, ni + 1)];
  const k = nxt[0] > C_TRACK[ni][0] ? clamp((s - C_TRACK[ni][0]) / (nxt[0] - C_TRACK[ni][0])) : 0;
  let hip = lerp(C_HIP[name], C_HIP[nxt[1]], ni >= C_TRACK_INTERP ? k : 0);
  if (name === 'run2' || name === 'run4') hip += 1.5; // the sprint's bounce
  return { name, x, y: C_GY - hip * CU };
}

// ---------------------------------------------------------------- the stadium (front view, lights down)

const css = (c: RGB, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
/** Small deterministic hash -> [0, 1). */
const h01 = (i: number, s: number) => {
  const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

const STAND_Z = 98;
const STAND_X = 46;
const P_BACK = 0.06;
const BACK_PAD = 60;
let backCv: HTMLCanvasElement | null = null;
let backK = 0;

/**
 * The dark stadium behind him, built once: night above the roof canopies (no moon, no sky shot), the far end stand in
 * two tiers, the side stands receding at the edges, and two dead floodlight towers in the far corners.
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
  const sky = g.createLinearGradient(0, 0, 0, 140);
  sky.addColorStop(0, '#05030b');
  sky.addColorStop(1, '#120a22');
  g.fillStyle = sky;
  g.fillRect(-BACK_PAD, 0, W, H);
  const [xl] = proj(-STAND_X, 0, STAND_Z), [xr] = proj(STAND_X, 0, STAND_Z);
  const tier = (y0: number, y1: number, sx: number) => {
    const [, ta] = proj(0, y1, STAND_Z), [, tb] = proj(0, y0, STAND_Z);
    g.drawImage(crowd, sx, 2, 820, 94, xl, ta, xr - xl, tb - ta);
  };
  tier(13, 24.5, 520);
  tier(1.2, 11.8, 980);
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
  for (const side of [-1, 1]) {
    const x0 = side < 0 ? -BACK_PAD : Math.ceil(xr), x1 = side < 0 ? xl : VW + BACK_PAD;
    for (let x = x0; x < x1; x += 2) {
      const Z = (STAND_X * PXM * Z0) / Math.max(1, Math.abs(x + 1 - VW / 2));
      if (Z > STAND_Z) continue;
      const [, ta] = proj(0, 24.5, Z), [, tb] = proj(0, 1.2, Z), [, wb] = proj(0, 0, Z);
      const sx = (Math.floor(Z * 17) % 1500) + 40;
      g.drawImage(crowd, sx, 2, 3, 94, x, ta, 2, tb - ta);
      g.fillStyle = '#06040c';
      g.fillRect(x, tb, 2, wb - tb + 1);
    }
  }
  {
    const [, f0] = proj(0, 28, 92), [, f1] = proj(0, 26.5, 92);
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
  // The house lights are down: the stands sink into the plum, so the phone lights are the only points of light in them.
  g.globalCompositeOperation = 'multiply';
  g.fillStyle = 'rgb(170,154,196)';
  g.fillRect(-BACK_PAD, 0, W, H);
  g.globalCompositeOperation = 'source-over';
  for (const side of [-1, 1]) {
    const [bx, by] = proj(side * 54, 0, 106), [, ty] = proj(side * 54, 40, 106);
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

/** ~60 phone lights in the dark stands (seeded): steady, twinkling slowly (±30%). */
const PHONES: { x: number; y: number; c: string; rgb: RGB; ph: number; f: number }[] = [];
function phones() {
  if (PHONES.length) return PHONES;
  for (let i = 0; i < 62; i++) {
    let X: number, Y: number, Z: number;
    if (i % 5 === 4) {
      Z = lerp(74, STAND_Z - 1, h01(i, 23));
      X = (i % 2 ? 1 : -1) * STAND_X;
      Y = lerp(2.5, 22, h01(i, 24));
    } else {
      Z = STAND_Z;
      X = lerp(-STAND_X + 1, STAND_X - 1, h01(i, 25));
      Y = h01(i, 26) < 0.5 ? lerp(2, 11.4, h01(i, 27)) : lerp(13.6, 24, h01(i, 27));
    }
    const [x, y] = proj(X, Y, Z);
    const lilac = i % 3 === 1;
    PHONES.push({ x, y, c: lilac ? HEX.lilac : HEX.ivory, rgb: lilac ? PAL.lilac : PAL.ivory, ph: h01(i, 28) * TAU, f: 0.9 + (i % 5) * 0.17 });
  }
  return PHONES;
}

/** Turf grain (seeded): it slides with the truck at its own depth. */
const SPECKS: { X: number; Z: number; c: string }[] = [];
function specks() {
  if (SPECKS.length) return SPECKS;
  for (let i = 0; i < 520; i++) {
    const Z = 1.5 + Math.pow(h01(i, 31), 1.6) * 22;
    SPECKS.push({ X: (h01(i, 32) * 2 - 1) * (4 + Z * 0.62), Z, c: h01(i, 33) < 0.5 ? 'rgba(18,56,26,0.55)' : 'rgba(110,190,90,0.26)' });
  }
  return SPECKS;
}

/** The turf: 5 m mowing stripes, depth shading toward the horizon, grain. */
function drawTurf(env: Env, cam: Cam) {
  const ctx = env.ctx;
  layer(env, cam, 0);
  const L = -BACK_PAD - 40, W = VW + 2 * (BACK_PAD + 40);
  ctx.fillStyle = '#245f2d';
  ctx.fillRect(L, HZ - 4, W, VH - HZ + 60);
  for (let gd = 15; gd < 105; gd += 5) {
    const ya = groundY(pOf(Math.max(0.6, gd - LENS_GD))), yb = groundY(pOf(gd + 5 - LENS_GD));
    ctx.fillStyle = Math.round(gd / 5) % 2 === 0 ? '#2f8a3c' : '#287a35';
    ctx.fillRect(L, yb, W, Math.min(VH + 60, ya) - yb + 0.5);
  }
  const hz = ctx.createLinearGradient(0, HZ, 0, HZ + 40);
  hz.addColorStop(0, 'rgba(8,10,30,0.55)');
  hz.addColorStop(1, 'rgba(8,10,30,0)');
  ctx.fillStyle = hz;
  ctx.fillRect(L, HZ - 4, W, 44);
  for (const s of specks()) {
    const [x, y] = proj(s.X, 0, s.Z, cam.x);
    if (x < -60 || x > VW + 60 || y > VH + 40) continue;
    ctx.fillStyle = s.c;
    ctx.fillRect(Math.round(x), Math.round(y), s.Z < 4 ? 2 : 1, 1);
  }
}

function groundLine(ctx: CanvasRenderingContext2D, pts: [number, number][], camX: number) {
  ctx.beginPath();
  pts.forEach(([X, Z], i) => {
    const [x, y] = proj(X, 0, Math.max(1.2, Z), camX);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  });
  ctx.stroke();
}

/**
 * The pitch markings fluorescing lilac in the dark (after the dim): the box line across the turf in front of him (he
 * stands just outside it), the D arc curving round behind him, the halfway line and centre circle, the touchlines,
 * and the far goal frame.
 */
function drawFluoro(env: Env, cam: Cam) {
  const ctx = env.ctx;
  layer(env, cam, 0);
  ctx.save();
  ctx.lineCap = 'butt';
  ctx.strokeStyle = HEX.lilac;
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = 2;
  const box = 16.5 - LENS_GD;
  groundLine(ctx, [[-20.16, box], [20.16, box]], cam.x);
  ctx.lineWidth = 1.5;
  const D: [number, number][] = [];
  const a0 = Math.acos(5.5 / 9.15);
  for (let a = -1; a <= 1.0001; a += 1 / 32) D.push([Math.sin(a * a0) * 9.15, 11 + Math.cos(a * a0) * 9.15 - LENS_GD]);
  groundLine(ctx, D, cam.x);
  ctx.lineWidth = 1;
  const half = 52.5 - LENS_GD;
  groundLine(ctx, [[-40, half], [40, half]], cam.x);
  const cc: [number, number][] = [];
  for (let a = 0; a <= TAU + 1e-6; a += TAU / 48) cc.push([Math.sin(a) * 9.15, half + Math.cos(a) * 9.15]);
  groundLine(ctx, cc, cam.x);
  for (const s of [-1, 1]) groundLine(ctx, [[s * 34, 36], [s * 34, 105 - LENS_GD]], cam.x);
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

// ---------------------------------------------------------------- the footlight: his long shadow, his white boots

/** His shadow colour on the lit turf. */
const SHADOW: RGB = [22, 10, 38];
/**
 * The spot is behind the camera and a little to its right, so his shadow falls straight away from the lens, up the
 * pitch, leaning a little screen-left: his silhouette squashed by the grazing angle (0.3) and sheared, anchored on his
 * soles. Built from the frame's cached silhouette (one per picture), drawn on the lit turf before him.
 */
function drawShadow(env: Env, h: Hero, a: number) {
  const ctx = env.ctx;
  const pic = soloPic(env, h.key);
  const sil = uvSilhouette(pic, 0, 0, SHADOW, SHADOW);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = a;
  ctx.translate(h.x, h.y - 1);
  // x' = ±sc·u + sh·sc·v (v < 0 above the soles: the head's shadow lands up-left), y' = 0.3·sc·v.
  ctx.transform(h.flip ? -h.sc : h.sc, 0, 0.42 * h.sc, 0.3 * h.sc, 0, 0);
  ctx.drawImage(sil, -PIVOT[0], -PIVOT[1]);
  ctx.restore();
}

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

/** The white boots glow under the ultraviolet light: a uvDeep halo, a violet glow, a small ivory core. */
function bootGlow(env: Env, h: Hero, a: number) {
  const ctx = env.ctx;
  for (const [bx, by] of bootsOf(env, h.key)) {
    const x = h.x + (bx - PIVOT[0]) * h.sc * (h.flip ? -1 : 1), y = h.y + (by - PIVOT[1]) * h.sc;
    ctx.globalCompositeOperation = 'source-over';
    drawGlow(ctx, glowOf(PAL.uvDeep), x, y, 9 * h.sc, 0.4 * a);
    drawGlow(ctx, glowOf(PAL.uv), x, y, 6.5 * h.sc, 0.28 * a);
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.ivory), x, y, 3.5 * h.sc, 0.22 * a);
  }
  ctx.globalCompositeOperation = 'source-over';
}

// ---------------------------------------------------------------- module state (reset in init)

/** Draw the live hero exposures that pass `pick` (the same rules as Afterimages.draw, in the current transform). */
function heroExposures(env: Env, t: number, pick: (e: Exposure) => boolean) {
  for (const e of ghosts.hero) {
    const a = Afterimages.alpha(e, t);
    if (a > 0 && pick(e)) drawSoloGhost(env, e.key!, e.x, e.y, e.scale, { ...e.o, alpha: a * (e.o.alpha ?? 1) });
  }
}

const ghosts = new Afterimages(6, 9);
const pc = new PuppetCache();
/** The follow-spot operator: x = his soles' base x, y = his depth factor (it slides with him). */
const spot = new FollowSpot(0.06);
let spin = new BallSpin();
let lastT = 0;
let lastBallX = NaN;
let fired = { v: false, x3: false, split: false, topple: false, strides: 0 };

/** Exposures are lit by the footlight from in front and below: their lilac rim runs along the bottom edges. */
const GHOST_LIGHT = { lx: 0, ly: 1 };
/** C's rim light in the dark: the pool is on his left (screen) and the lamp is low, behind the lens. */
const LIGHT_C = { lx: -0.7, ly: 0.5 };

// ---------------------------------------------------------------- the shot

export const shotElastico: Shot = {
  name: 'Elastico',
  dur: DUR,
  seed: 505,
  rate: RATE[5],
  cues: [
    { at: T_TOUCH, fn: (env) => (env.sfx.kickDrum(0.6), env.sfx.tom(TOMS.D2, 0.5, -0.1)) },
    { at: T_PUSH, fn: (env) => env.sfx.hat(false, 0.2, -0.35) },
    { at: T_WRAP, fn: (env) => (env.sfx.hat(false, 0.22, -0.45), env.sfx.scuff(0.12, 0.45)) },
    {
      at: T_SNAP,
      fn: (env) => {
        env.sfx.snare(1.0, 0.25);
        env.sfx.crash(0.6, 0.35); // the first crash of the special
        env.sfx.kick(0.3);
        env.sfx.spotOn(0.12); // the beat flare's lamp tick
      },
    },
    { at: T_HOLD, fn: (env) => env.sfx.scuff(0.16, 0.3) },
    { at: T_SPLIT, fn: (env) => env.sfx.scuff(0.22, -0.35) },
    { at: T_BR3, fn: (env) => env.sfx.scuff(0.14, 0.4) },
    { at: T_TOPPLE, fn: (env) => (env.sfx.boom(0.2, 0.5, -0.4), env.sfx.scuff(0.18, -0.4)) },
    { at: T_OLE, fn: (env) => (env.sfx.ole(3), env.sfx.tom(TOMS.D3, 0.5, 0.1)) },
    { at: onGrid(0.9, 'fill C3'), fn: (env) => env.sfx.tom(TOMS.C3, 0.5, 0.25) },
    { at: T_BR3B, fn: (env) => (env.sfx.tom(TOMS.A2, 0.5, 0.4), env.sfx.whoosh(0.25, 300, 2400, 0.4, -0.55)) },
    { at: 1.05, fn: (env) => env.sfx.whoosh(0.2, 420, 2800, 0.3, 0.6) },
    { at: onGrid(1.1, 'fill F2'), fn: (env) => env.sfx.tom(TOMS.F2, 0.5, 0.55) },
  ],
  prepare(env) {
    warmSolo(env, KEYS, { ghosts: true });
    for (const k of KEYS) {
      const pic = soloPic(env, k);
      bootsOf(env, k);
      uvSilhouette(pic, 0, 0, SHADOW, SHADOW);
      uvSilhouette(pic, GHOST_LIGHT.lx, GHOST_LIGHT.ly);
      uvSilhouette(pic, GHOST_LIGHT.lx, GHOST_LIGHT.ly, PAL.uv);
    }
    for (const [name, pose] of Object.entries(C_POSES)) {
      pc.get(name, RIVAL_KIT_C, pose, CK, -1);
      pc.get(name, RIVAL_KIT_C, pose, CK, -1, LIGHT_C);
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
    const h = heroAt(0);
    spot.snap(h.x, h.p);
    lastT = 0;
    lastBallX = NaN;
    fired = { v: false, x3: false, split: false, topple: false, strides: 0 };
  },
  update(env, t, dt) {
    env.sfx.hum(HUM[5](t));
    const real = Math.max(0, t - lastT);
    lastT = t;
    const h = heroAt(t);
    spot.update(h.x, h.p, real);
    // THE SNAP: the strobe fires and draws the hairpin. Three ball exposures from the turn to where the real ball is,
    // and an exposure of F2 (leaning left) at the turn. They step down on the grid and are gone at 0.80.
    if (!fired.v && t >= T_SNAP - 1e-6) {
      fired.v = true;
      const life = T_V_END - T_SNAP;
      ghosts.dropHero('EL2', X0, groundY(1), 2, T_SNAP, life, { pivot: PIVOT, ...GHOST_LIGHT }, 0.6);
      const [tx, ty] = ballOn(env, 'EL3');
      ghosts.dropBall(tx - 2, ty, 12, T_SNAP, life, 0.4); // the turn: where he showed it
      for (const [at, a0] of [[T_SMEAR, 0.55], [T_SMEAR + 1 / 60, 0.7]] as const) {
        const b = ballAt(env, at);
        ghosts.dropBall(b.x, b.y, b.r, T_SNAP, life, a0);
      }
      // A spit of turf off the inside of the boot as it whips the ball back.
      const b = ballAt(env, T_SNAP);
      grassChunks(env, b.x - 10, groundY(1) - 2, 3, 0.35);
    }
    // OLÉ 3, the scale step: the first exposure of the ghost wipe, where he is.
    if (!fired.x3 && t >= T_OLE - 1e-6) {
      fired.x3 = true;
      const hh = heroAt(T_OLE, false);
      ghosts.dropHero(hh.key, hh.x, hh.y, 3, T_OLE, DUR - T_OLE + 0.1, { pivot: PIVOT, flip: hh.flip, ...GHOST_LIGHT }, 0.6);
    }
    // C: the split lands (grass and dust), the topple onto his hip (dust).
    if (!fired.split && t >= T_SPLIT - 1e-6) {
      fired.split = true;
      const c = defAt(t);
      grassChunks(env, c.x - 60, C_GY - 2, 6, 0.5);
      dustBurst(env, c.x - 30, C_GY - 2, 8, 0.6, 0.7);
    }
    if (!fired.topple && t >= T_TOPPLE - 1e-6) {
      fired.topple = true;
      const c = defAt(t);
      dustBurst(env, c.x, C_GY - 2, 9, 0.7, 0.8);
    }
    // Stud dust on his burst strides.
    const strides = [T_HOLD, T_BR3];
    while (fired.strides < strides.length && t >= strides[fired.strides] - 1e-6) {
      const hh = heroAt(strides[fired.strides++], false);
      dustBurst(env, hh.x + (hh.flip ? 10 : -10), hh.y - 1, 3, 0.35, 0.5);
    }
    // Ball spin, locked to its roll.
    const b = ballAt(env, t);
    const bx = b.x / b.p;
    if (!Number.isNaN(lastBallX) && dt > 0) {
      const dx = bx - lastBallX;
      if (Math.abs(dx) > 1e-3 && Math.abs(dx) < 80) spin.rotate(0, 0.25, 1, (-dx * b.p) / b.r);
    }
    lastBallX = bx;
  },
  render(env, t) {
    const ctx = env.ctx;
    soloGrade(env.fx);
    const cam = camAt(t);
    const h = heroAt(t);
    const c = defAt(t);
    const ball = ballAt(env, t);
    const fl = stage.flare(t, [T_SNAP]);
    const pool = { x: spot.x, p: spot.y, gy: groundY(spot.y) };

    // The whip pan arriving out of shot 4.
    if (t < 3 / 60) {
      const [hx, hy] = scr(cam, h.p, h.x, h.y - 98);
      env.fx.radial = 0.2 * (1 - clamp(t / (3 / 60)));
      env.fx.radialX = hx / VW;
      env.fx.radialY = hy / VH;
    }

    // C's light: the dark-stage silhouette until he reaches the light (0.10), his colour render (4-frame cross-fade)
    // drawn under the stage dim, so only what is inside the pool is lit; back into the dark after the OLÉ snap.
    const cLit = fadeIn(t, T_LIT, 4) * (1 - fadeIn(t, T_OLE + 0.05, 4));

    // ---- the world in the dark: night, stands, towers, turf
    env.screen();
    ctx.fillStyle = '#05030b';
    ctx.fillRect(0, 0, VW, VH);
    layer(env, cam, P_BACK);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(backdrop(env), -BACK_PAD, 0, VW + BACK_PAD * 2, HZ + 8);
    ctx.imageSmoothingEnabled = false;
    drawTurf(env, cam);

    // ---- the footlight on the turf: the pool round his feet, the light running on up the pitch behind him, and his
    // long shadow on it
    layer(env, cam, pool.p);
    const pg = fl.gain;
    stage.floorPool(ctx, pool.x, pool.gy - 10 * pool.p, 86 * pool.p, 16 * pool.p, 0.16 * pg);
    stage.floorPool(ctx, pool.x, pool.gy + 2, 132 * pool.p * fl.size, 26 * pool.p * fl.size, 0.3 * pg);
    layer(env, cam, h.p);
    drawShadow(env, h, 0.55);

    // ---- the exposure of F2 at the turn: it stands inside the pool (so the dim never touches it) and goes under C, so
    // the violet print of No.10's lean never lands on C's head while C's stab reaches behind him
    layer(env, cam, 1);
    heroExposures(env, t, (e) => e.t0 < T_OLE);

    // ---- C in the light (under the dim) and the particles
    layer(env, cam, PC);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    if (cLit > 0) {
      ctx.fillStyle = css(PAL.plum, 0.4 * cLit);
      ctx.beginPath();
      ctx.ellipse(c.x - 4, C_GY, 36, 5, 0, 0, TAU);
      ctx.fill();
      pc.draw(ctx, c.name, RIVAL_KIT_C, C_POSES[c.name], CK, -1, c.x, c.y, CD, 1, LIGHT_C);
    }
    env.parts.draw(ctx, 0);
    env.parts.draw(ctx, 1);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    // ---- the stage dim: a hole round him (it follows the operator), and the turf in front of him toward the lamp
    const [px, py] = scr(cam, pool.p, pool.x, pool.gy - 100 * pool.p);
    const z = cam.zoom;
    const hole: StagePool = { x: px, y: py, rx: 118 * pool.p * z * fl.size, ry: 160 * pool.p * z * fl.size, soft: 44, gain: 1 };
    const fore: StagePool = { x: px, y: VH + 26, rx: 210 * z, ry: 62 * z, soft: 70, gain: 0.55 };
    const holdDim = t >= T_SNAP - 1e-6 && t < T_HOLD - 1e-6 ? 0.04 : 0;
    stage.dim(ctx, 0.8 + holdDim, [hole, fore]);

    // ---- fluorescent accents: pitch lines, phone lights
    drawFluoro(env, cam);
    drawPhones(env, cam, t);

    // ---- the footlight itself: the beam comes over the lens from behind the camera (a little right of it), so the air
    // between the lens and him glows faintly, widest at the bottom of the frame, with dust motes drifting up it
    {
      layer(env, cam, 1);
      stage.beam(ctx, pool.x + 46, VH + 140, pool.x, pool.gy - 96, 620, 210, 0.1 * fl.gain, { t, motes: 22, seed: 55 });
    }

    // ---- C in the dark: plum with lilac rims on the side facing the light
    if (cLit < 1) {
      layer(env, cam, PC);
      pc.draw(ctx, c.name, RIVAL_KIT_C, C_POSES[c.name], CK, -1, c.x, c.y, CD, 0, LIGHT_C, 1 - cLit);
    }

    // ---- exposures (where he WAS), then No.10, his boots, the ball and its strobe chain
    layer(env, cam, 1.5);
    heroExposures(env, t, (e) => e.t0 >= T_OLE);
    // The ghost wipe: exposures of his current frame at x4 and x5 round his pelvis, nearer the lens each 16th.
    if (t >= WIPE[0][0] - 1e-6) {
      layer(env, cam, 1.5);
      for (const [at, sc, py] of WIPE) {
        if (t < at - 1e-6) continue;
        const [, key, flip] = seqAt(at);
        drawSoloGhost(env, key, strideX(STEP3, at, false), py, sc, { anchor: 'pelvis', flip, alpha: 0.5, ...GHOST_LIGHT });
      }
    }
    layer(env, cam, h.p);
    drawSolo(env, h.key, h.x, h.y, h.sc, drawOpts(h));
    bootGlow(env, h, 1);
    layer(env, cam, 1);
    // The ball's strobe chain sits on uvDeep halos, so it reads against the lit turf and his white boots.
    for (const e of ghosts.ball) {
      const a = Afterimages.alpha(e, t);
      if (a > 0) drawGlow(ctx, glowOf(PAL.uvDeep), e.x, e.y, e.r! * 1.7, 0.75 * a);
    }
    ghosts.draw(env, t, 'ball');
    layer(env, cam, ball.p);
    ctx.fillStyle = css(PAL.plum, 0.5);
    ctx.beginPath();
    ctx.ellipse(ball.x + 1, ball.gy - 2, ball.r * 0.9, ball.r * 0.22, 0, 0, TAU);
    ctx.fill();
    drawBall(env, spin, Math.round(ball.x), Math.round(ball.y), ball.r, 1, 0, 0.8 * fl.gain, 'blacklight');
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // ---- the SNAP: beat echo to screen-right, impact frames
    {
      const [hx, hy] = scr(cam, h.p, h.x, h.y - 98 * h.p);
      echoAt(env, t, T_SNAP, 3, 0.6, 0.012, { sx: hx, sy: hy, R: 0.35 });
      if (onFrames(t, T_SNAP, 2)) soloImpact(env.fx, 1);
    }

    // ---- the ghost wipe ends: the solid ultraviolet silhouette at x6 over the middle of the frame (1.10), the beat
    // echo throws it rightward (4 frames), and the last two frames go violet: cut on the violet.
    if (t >= T_X6 - 1e-6) {
      layer(env, cam, 1.5);
      const [, key, flip] = seqAt(T_X6);
      drawSoloGhost(env, key, strideX(STEP3, T_X6, false), X6_Y, 6, { anchor: 'pelvis', flip, alpha: 1, fill: PAL.uv, ...GHOST_LIGHT });
      echoAt(env, t, T_X6, 4, 0.9, 0.035, { R: 0 });
      const f = Math.round((t - T_X6) * 60);
      if (f >= 3) {
        env.fx.flash = f === 3 ? 0.15 : f === 4 ? 0.4 : 0.65;
        env.fx.flashColor = [...PAL.uv];
      }
    }

    // ---- HUD: the marquee tag, the four-count
    env.screen();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    marqueeTag(ctx, 'ELASTICO', 18, 12, t - T_TAG);
    fourCount(ctx, padsFor(5), t);
  },
};
