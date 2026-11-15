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
// are pinned on that point through the move (the planted left foot never slides); every burst step is a 2-frame move on
// its frame change with a 2 px pelvis drop as the weight lands (no glide). C (RIVAL_KIT_C puppet, 2.2 px per unit at
// No.10's plane) sprints in from screen-right facing -1, a stride further from the lens than No.10 (smaller, higher), so
// No.10, the ball and the ball's exposures always read on top of him: his stab reaches behind No.10's legs for the ball
// he was shown (torso thrown well back, head low and to the right, 8+ px clear of No.10's fist: a dev guard checks it),
// his stab is held through the hit-stop, then, finding only grass, he pushes back to his own side (screen-right, where
// the ball went behind him) and his feet go from under him into a comic split, leaning back so his head stays clear of
// No.10; he tips over backward and topples onto his hip there, BEHIND No.10, who bursts past in front of him toward the
// lens and screen-right (his left). C never crosses No.10's body.
//
// Beats (shot-local; touches, keys, lamps and the OLÉ on the 16th grid):
//   0.00  opens out of the whip pan (fx.radial 0.2 -> 0 over 3 frames, the frame still sliding in). FrontTouch FT1, an
//         approach touch (kick drum + tom D2). C sprints in from the right edge in the dark (plum, lilac rims).
//   0.10  C reaches the edge of the light and turns full colour (4-frame cross-fade, under the dim).
//   0.20  Elastico F2: the outside of the right boot SHOWS the ball screen-left, the whole body leaning with it (hat).
//   0.30  F3 wrap: the boot rides round the outside of the ball (hat). C plants and stabs at the shown ball, the lunge
//         accelerating late into 0.40 (his boot stays 6+ px clear of the reversing ball: a dev guard checks it).
//   0.367 F4, the smear frame, for exactly 2 frames: the ball reverses with no slowdown (the gag), travelling with the
//         inside of the right boot (EL4's anchor, then halfway to EL5's).
//   0.40  THE SNAP (F5, held to 0.55; hit-stop rate 0.06): the inside of the right boot has whipped the ball back to
//         screen-right, onto EL5's drawn anchor. The strobe fires and draws the hairpin in five ball exposures (r 10, a
//         size under the ball, on uvDeep halos), fading in time order: the way out a row nearer the lens (0.3, 0.35),
//         the turn (0.4), the way back on the ball's row (0.55, 0.7), to where the real ball sits now; an exposure of
//         F2 (leaning left, rimmed on its outer top-left contour) stands at the turn, under C. C's boot arrives with
//         its toe in the empty grass 5 px beyond the turn exposure. Beat flare, 2 ultraviolet/ivory impact frames,
//         fx.echo +0.012 for 3 frames, beat-snap zoom 1.0 -> 1.15. Snare + the special's first crash + kick + the
//         lamp tick. 0.45 the ELASTICO tag.
//   0.55  Break BR2 (west strip): the burst toward the lens and screen-right; the ball rolls to his leading boot.
//         C's stab (held through the hit-stop) finds only grass: he pushes back to his own side (a recoil breakdown at
//         0.583), his feet go from under him into a full comic split there, leaning back (0.60), he freezes, tips over
//         backward as No.10 steps past in front of him (0.70) and topples onto his hip (0.75: boom + scuff). The V
//         exposures step down on the grid (0.60, 0.70) and are gone at 0.80.
//   0.70  BR3 (west strip).
//   0.80  OLÉ! 3 (pad 3 lights, the phone lights lift): beat-snap back out and after him, his scale steps 2 -> 3 (BR2),
//         C falls back into the dark.
//   0.80-1.20 the ghost wipe: he sprints at the lens and across the frame toward the right edge, a step on each 16th
//         (BR2 / BR3 alternating, each footfall a tom of the 16th fill D3, C3, A2, F2; whooshes left -> right at 1.00 /
//         1.05). The strobe leaves an exposure of his frame where he lands at x3 (0.80) and, as he steps on, where he
//         steps FROM at x4 (0.90) and x5 (1.00, drawn over him: nearer the lens), each nearer the lens (bigger, lower),
//         sweeping left to right behind him and decaying on the grid. At 1.10 the x6, a solid ultraviolet silhouette,
//         lands ahead of him at the right and he runs into it and out of frame; the beat echo (masked to it, so the
//         HUD never echoes) throws it rightward (4 frames), and the last three frames ramp to violet: cut on the
//         violet (shot 6 opens out of it).
//
// Clock: RATE[5] (0.06 from 0.40 to 0.55). No.10 follows the brief's frame schedule in shot time; C, the ball after the
// snap, the spin and the particles run on simulation time, so the hit-stop is a rest in the bar. The picture is a pure
// function of t apart from the follow-spot operator, the ball spin and the particles, which advance in update()
// (seek-exact); init resets all module state. Roll 0, sat 1, no rings, no filtering; the exposures never touch anyone
// (C's boot stabs past the empty end of the V because he read the real outside push, not because of a ghost; the F2
// exposure goes after the dim but under C, cut out round him, so it never lands on his head). Photosensitivity: one
// impact pair (0.40) and one violet ramp into the cut in this shot; one beat flare.

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
/** The ghost wipe's steps on the 16ths after the OLÉ (each a footfall of the tom fill). */
const T_W2 = onGrid(0.9, 'wipe step 2');
const T_W3 = onGrid(1.0, 'wipe step 3');
/** The V exposures die on the grid: 0.6 -> 0.4 (0.60) -> 0.2 (0.70) -> gone (0.80). */
const T_V_END = 0.8;
/**
 * The ghost wipe: as he sprints across the frame toward the right edge, every 16th leaves an exposure of his frame at
 * x3, x4, x5 and x6, each one nearer the lens (bigger, lower): [time, scale, pelvis y] (base coordinates of his x3
 * layer; x = where he steps from, on STEP3). x3 is a normal exposure (0.80, where he lands at x3); x4 and x5 are
 * Afterimages exposures dropped in update() that decay on the grid where he WAS (x5, nearer the lens than him, is
 * drawn over him); x6 is the solid ultraviolet silhouette ahead of him at the right (X6_X), which he runs into as it
 * sweeps over the right of the frame (1.10).
 */
const WIPE: readonly (readonly [number, number, number])[] = [[0.9, 4, 268], [1.0, 5, 298]];
const T_X6 = onGrid(1.1, 'ghost wipe x6');
const X6_X = 625;
const X6_Y = 328;
/** The x6 beat echo's mask radius (screen heights) round its pelvis: the four-count pads top-right stay outside it. */
const X6_ECHO_R = 0.62;

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
function layer(env: Env, cam: Cam, p: number, g: CanvasRenderingContext2D = env.ctx) {
  const S = env.S, z = cam.zoom;
  g.setTransform(S * z, 0, 0, S * z, S * (PIV.x * (1 - z) - cam.x * p * z), S * (PIV.y * (1 - z) + cam.y));
}
/** Screen point (logical px) of base point (x, y) in a layer at depth factor p. */
function scr(cam: Cam, p: number, x: number, y: number): [number, number] {
  return [PIV.x + (x - cam.x * p - PIV.x) * cam.zoom, PIV.y + (y - PIV.y) * cam.zoom + cam.y];
}

// ---------------------------------------------------------------- No.10

/** The frame schedule (shot time): [t, key, west strip]. F4 for exactly two frames; the burst on the Break west strip. */
const SEQ5: readonly (readonly [number, SoloKey, boolean])[] = [
  [0, 'FT1', false], [T_PUSH, 'EL2', false], [T_WRAP, 'EL3', false], [T_SMEAR, 'EL4', false], [T_SNAP, 'EL5', false],
  [T_HOLD, 'BR2', true], [T_BR3, 'BR3', true], [T_OLE, 'BR2', true], [T_W2, 'BR3', true], [T_W3, 'BR2', true],
  [T_X6, 'BR3', true],
];
const KEYS: readonly SoloKey[] = ['FT1', 'EL2', 'EL3', 'EL4', 'EL5', 'BR2', 'BR3'];
/** Every front frame shares one registration (body centre x 64, soles on row 102): pin that point. */
const PIVOT: [number, number] = [64, 103];
/** Where his soles stand (base x) at x2 (p 1) and x3 (p 1.5); pinned between keys, each step a 2-frame move. */
const X0 = 304;
const STEP2: readonly (readonly [number, number])[] = [[0, X0], [T_HOLD, X0 + 26], [T_BR3, X0 + 62]];
/**
 * At x3 he sprints at the lens and across the frame toward the right edge (the camera truck held at 40): a step on
 * each 16th of the ghost wipe, each one about 75 px. The wipe exposures are dropped where he steps FROM, so they sweep
 * left to right behind him and decay there on the grid.
 */
const STEP3: readonly (readonly [number, number])[] = [[T_OLE, 360], [T_W2, 430], [T_W3, 510], [T_X6, 600]];
/** Every step is a 2-frame move on its pose change, 7/8 of it on the key frame itself (pinned feet between keys). */
const STRIDE_EASE = 2 / 60;
const STRIDE3_EASE = 2 / 60;
/** The weight lands: his pelvis drops 2 px for the first 2 frames after each burst step. */
const LAND_DROP = 2;
const LAND_T = 2 / 60;

interface Hero {
  key: SoloKey;
  flip: boolean;
  sc: 2 | 3;
  p: number;
  x: number;
  /** Soles' y (with the landing drop). */
  y: number;
  /** The landing drop included in y (the ball and his shadow stay on the turf). */
  drop: number;
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
  const u = clamp((t - steps[i][0] + 1 / 60) / dur);
  return lerp(steps[i - 1][1], steps[i][1], ease.outCubic(u));
}
/** The burst steps (where the landing drop applies): STEP2's from the hold on, and every STEP3 key. */
const STEPS_AT = [...STEP2.slice(1), ...STEP3].map((s) => s[0]);
function heroAt(t: number, eased = true): Hero {
  const [, key, flip] = seqAt(t);
  const sc: 2 | 3 = t >= T_OLE - 1e-6 ? 3 : 2;
  const p = sc / 2;
  const x = sc === 2 ? strideX(STEP2, t, eased) : strideX(STEP3, t, eased, STRIDE3_EASE);
  const drop = eased && STEPS_AT.some((s) => t >= s - 1e-6 && t < s + LAND_T - 1e-6) ? LAND_DROP : 0;
  return { key, flip, sc, p, x, y: groundY(p) + drop, drop };
}
const drawOpts = (h: Hero) => ({ pivot: PIVOT, flip: h.flip });

// ---------------------------------------------------------------- the ball

/** Sim time of shot time t under RATE[5] (0.06 from 0.40 to 0.55). */
const simT = (t: number) => (t <= T_SNAP ? t : t <= T_HOLD ? T_SNAP + (t - T_SNAP) * 0.06 : T_SNAP + 0.009 + (t - T_HOLD));
const S_HOLD = simT(T_HOLD);
/** The ball leaves the inside of the boot at ~5.4 m/s (px/s at x2): it creeps on through the hit-stop. */
const V_SNAP = 600;
/**
 * Art x of the ball through the reversal: the two smear frames and the SNAP. It travels with the inside of the right
 * boot: EL4's drawn anchor (50), the midpoint (62), and on the SNAP EL5's drawn inside-of-boot anchor (74); the V_SNAP
 * creep and the burst carry it on from there. The exposures are kept apart by their size (r 10), not by moving the
 * ball off the boot.
 */
const STROBE_AX = [50, 62, 74] as const;
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
  const [bx, by] = soloPoint(env, h.key, 'ball', h.x, h.y - h.drop, 3, drawOpts(h));
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
 * pointed, the rear knee dropping toward the turf, and the torso thrown well back to balance the reach, so his head
 * sits low and to the right, clear of No.10's EL5 fist (the dev guard in update() checks 8 px), while his boot reaches
 * behind No.10's legs into the empty grass beside the turn.
 */
const STAB: Pose = P({ torso: -74 * D2R, head: 42 * D2R, thighN: 72 * D2R, kneeN: 0, footN: 80 * D2R, thighF: -50 * D2R, kneeF: 100 * D2R, footF: 20 * D2R, armN: -80 * D2R, elbowN: 30 * D2R, armF: 120 * D2R, elbowF: 20 * D2R });
/**
 * The comic split (splitFreeze staged flat on the turf: both legs straight out, arms flung up), landed on his own side
 * of No.10 and leaning back (torso -40 deg, as he tips) so his head stays clear of No.10's fist (the HEAD_CLEAR guard).
 */
const SPLIT: Pose = P({ ...POSES.splitFreeze, torso: -40 * D2R, thighN: 88 * D2R, kneeN: 0, footN: 0, thighF: -88 * D2R, kneeF: 0, footF: 90 * D2R, head: -16 * D2R, armN: 165 * D2R, elbowN: 10 * D2R, armF: 150 * D2R, elbowF: 25 * D2R });
/** Tipping (on the BR3 step, as No.10 passes in front of him): the split held, the torso going over backward, one arm
 *  windmilling, the head low and to the right. */
const TIP: Pose = P({ torso: -58 * D2R, head: 18 * D2R, thighN: 84 * D2R, kneeN: 0, footN: 0, thighF: -84 * D2R, kneeF: 4 * D2R, footF: 90 * D2R, armN: 40 * D2R, elbowN: 20 * D2R, armF: 170 * D2R, elbowF: 25 * D2R });
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
  /** The breakdown between the stab and the split: pushing back, the rear leg sliding out. */
  recoil: mixPose(STAB, SPLIT, 0.5),
  split: SPLIT,
  tip: TIP,
  topple: TOPPLE,
};
/** Pose schedule on sim time (discrete cached poses: the hip height is always the drawn pose's own). */
const C_TRACK: readonly [number, string][] = [
  [0, 'run1'], [0.05, 'run2'], [0.1, 'run3'], [0.15, 'run4'], [0.2, 'run1'], [0.25, 'plant'], [T_WRAP, 'stab0'],
  [0.39, 'stab'], [S_HOLD, 'stab'], [S_HOLD + 2 / 60, 'recoil'], [simT(T_SPLIT), 'split'], [simT(T_TIP), 'tip'], [simT(T_TOPPLE), 'topple'],
];
/** The stab's lunge: all of it in the last two frames. */
const LUNGE = (u: number) => u ** 5;
/** Hip x (base, his plane, camera untrucked) on sim time: [s, x, ease into this key]. */
const C_X: readonly [number, number, (u: number) => number][] = [
  [0, 660, ease.linear],
  [0.1, 524, ease.linear], // the edge of the light
  [0.25, 454, ease.outQuad], // the brake
  [T_WRAP, 446, ease.linear],
  // The stab, accelerating late (u^5: with inCubic his boot came within 2 px of the ball on frame 23): his boot stays
  // clear of the reversing ball (6 px or more) and arrives on the SNAP with its toe in the empty grass 5 px beyond the
  // turn exposure (the empty end of the V), just after the ball has gone.
  [T_SNAP, 339, LUNGE],
  [S_HOLD, 339, ease.linear], // frozen in the hit-stop
  // Finding only grass, he pushes back to his own side (screen-right, where the ball went behind him): never across
  // No.10's body. The stab starts back, the recoil breakdown, then his feet go from under him into the split.
  [S_HOLD + 1 / 60, 345, ease.outQuad],
  [S_HOLD + 2 / 60, 362, ease.linear],
  [simT(T_SPLIT), 380, ease.outQuad], // the split lands on his own side, leaning back
  [simT(T_TIP), 390, ease.outQuad], // frozen there (a little slide); tips back as No.10 steps past in front
  [simT(T_TOPPLE), 398, ease.inQuad], // lands on his hip
  [simT(T_TOPPLE) + 0.2, 406, ease.outCubic],
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
  // The hip height is the drawn pose's own (the poses are discrete cached renders), so its lowest point is on the turf.
  let hip = C_HIP[name];
  if (name === 'run2' || name === 'run4') hip += 1.5; // the sprint's bounce
  return { name, x, y: C_GY - hip * CU };
}

// ---------------------------------------------------------------- dev guards (tone: nothing hits a head, no studs on the ball)

const warned5 = new Set<string>();
function warnOnce(k: string, msg: string) {
  if (warned5.has(k)) return;
  warned5.add(k);
  console.warn(`SPOTLIGHT SOLO shot 5: ${msg}`);
}
/** Opaque pixel centres of an image, relative to its origin (built once per image). */
const opaqueCache = new Map<string, Float32Array>();
function opaque(id: string, w: number, h: number, pixels: () => Uint8ClampedArray): Float32Array {
  let out = opaqueCache.get(id);
  if (out) return out;
  const px = pixels();
  const pts: number[] = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (px[(y * w + x) * 4 + 3] > 40) pts.push(x + 0.5, y + 0.5);
  opaqueCache.set(id, (out = Float32Array.from(pts)));
  return out;
}
/** C's head disc (12 units, its outline and the hair) in base px at his plane. */
const C_HEAD_R = 13.5 * CU;
/** The quality bar's clearances (screen px): C's head from No.10's silhouette, any of C from the ball. */
const HEAD_CLEAR = 8;
const BALL_CLEAR = 4;

/**
 * Smallest screen gaps between a disc (screen centre sx, sy, radius R) and No.10's opaque pixels: [above his pelvis
 * (arms, fists, torso, head), all of him], and his pelvis line's screen y.
 */
function heroGap(env: Env, cam: Cam, h: Hero, sx: number, sy: number, R: number): [number, number, number] {
  const pic = soloPic(env, h.key);
  const pts = opaque(pic.id, pic.w, pic.h, () => pic.px);
  const pelvis = pic.anchor('pelvis')[1];
  const fx = h.flip ? -h.sc : h.sc, half = 0.5 * h.sc * cam.zoom;
  let up = Infinity, all = Infinity;
  for (let i = 0; i < pts.length; i += 2) {
    const [X, Y] = scr(cam, h.p, h.x + (pts[i] - PIVOT[0]) * fx, h.y + (pts[i + 1] - PIVOT[1]) * h.sc);
    const d = Math.hypot(X - sx, Y - sy) - R - half;
    all = Math.min(all, d);
    if (pts[i + 1] < pelvis) up = Math.min(up, d);
  }
  return [up, all, scr(cam, h.p, h.x, h.y + (pelvis - PIVOT[1]) * h.sc)[1]];
}
/** Smallest screen gap between C's opaque pixels and the ball. */
function ballGapC(cam: Cam, c: DefC, b: Ball): number {
  const r = pc.get(c.name, RIVAL_KIT_C, C_POSES[c.name], CK, -1);
  const pts = opaque(`C:${c.name}`, r.cv.width, r.cv.height, () => r.cv.getContext('2d')!.getImageData(0, 0, r.cv.width, r.cv.height).data);
  const [bx, by] = scr(cam, b.p, b.x, b.y);
  const R = b.r * cam.zoom, half = 0.5 * CD * cam.zoom;
  let gap = Infinity;
  for (let i = 0; i < pts.length; i += 2) {
    const [X, Y] = scr(cam, PC, c.x + (pts[i] - r.ox) * CD, c.y + (pts[i + 1] - r.oy) * CD);
    gap = Math.min(gap, Math.hypot(X - bx, Y - by) - R - half);
  }
  return gap;
}
/**
 * The tone guards, run from update(): C's head stays HEAD_CLEAR px from No.10 (as shot 4's 8 px from B: nothing reads
 * as a fist or an elbow in a face): from his arms, fists, torso and head always, and from all of him unless C's head is
 * low, below No.10's pelvis line (C is a stride further from the lens: down BEHIND his legs is depth, not contact); through the hit-stop hold, from the F2 exposure as well. Until the SNAP none of C (his stab boot above all) comes within BALL_CLEAR px of the ball (he never
 * reaches it: it has always already gone). Each warns once.
 */
function toneGuards(env: Env, t: number, h: Hero, c: DefC, b: Ball) {
  if (t < T_LIT || t >= T_OLE - 1e-6) return;
  const cam = camAt(t);
  const j = joints(C_POSES[c.name]);
  const [sx, sy] = scr(cam, PC, c.x - j.head[0] * CU, c.y + j.head[1] * CU);
  const [up, all, pelvisY] = heroGap(env, cam, h, sx, sy, C_HEAD_R * cam.zoom);
  const hg = sy > pelvisY ? up : all;
  if (hg < HEAD_CLEAR) warnOnce(`head@${Math.round(t * 60)}`, `C's head ${hg.toFixed(1)} px from No.10 at ${t.toFixed(3)} s (needs ${HEAD_CLEAR})`);
  if (t >= T_SNAP - 1e-6 && t < T_HOLD - 1e-6) {
    // The money frame: the F2 exposure's outstretched arm stays clear of his head too (it is drawn under him).
    const f2 = heroGap(env, cam, { key: 'EL2', flip: false, sc: 2, p: 1, x: X0, y: groundY(1), drop: 0 }, sx, sy, C_HEAD_R * cam.zoom)[1];
    if (f2 < HEAD_CLEAR) warnOnce(`f2@${Math.round(t * 60)}`, `C's head ${f2.toFixed(1)} px from the F2 exposure at ${t.toFixed(3)} s (needs ${HEAD_CLEAR})`);
  }
  const bg = t < T_SNAP - 1e-6 ? ballGapC(cam, c, b) : Infinity;
  if (bg < BALL_CLEAR) warnOnce(`ball@${Math.round(t * 60)}`, `C ${bg.toFixed(1)} px from the ball at ${t.toFixed(3)} s (needs ${BALL_CLEAR})`);
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
  ctx.translate(h.x, h.y - h.drop - 1);
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

let underCv: HTMLCanvasElement | null = null;
/**
 * The F2 exposure at the turn, drawn after the stage dim (so it is not multiplied by it) but still UNDER C: it goes into
 * a reused offscreen layer, C's sprite is cut out of that layer, and the layer goes onto the frame. So the violet print
 * of No.10's lean (its outstretched arm above all) never lands on C's head while C's stab reaches behind him.
 */
function exposuresUnderC(env: Env, cam: Cam, t: number, c: DefC) {
  const live = ghosts.hero.filter((e) => e.t0 < T_OLE && Afterimages.alpha(e, t) > 0);
  if (!live.length) return;
  const ctx = env.ctx, W = ctx.canvas.width, H = ctx.canvas.height;
  if (!underCv || underCv.width !== W || underCv.height !== H) {
    underCv = document.createElement('canvas');
    underCv.width = W;
    underCv.height = H;
  }
  const g = underCv.getContext('2d')!;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-over';
  g.globalAlpha = 1;
  g.clearRect(0, 0, W, H);
  g.imageSmoothingEnabled = false;
  layer(env, cam, 1, g);
  for (const e of live) {
    const pic = soloPic(env, e.key!);
    const sil = uvSilhouette(pic, e.o.lx ?? 0, e.o.ly ?? -1);
    const [ax, ay] = e.o.pivot ?? pic.anchor(e.o.anchor);
    g.globalAlpha = Afterimages.alpha(e, t) * (e.o.alpha ?? 1);
    g.drawImage(sil, e.x - ax * e.scale, e.y - ay * e.scale, sil.width * e.scale, sil.height * e.scale);
  }
  // C stands in front of the print: cut him out of it.
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'destination-out';
  layer(env, cam, PC, g);
  const r = pc.get(c.name, RIVAL_KIT_C, C_POSES[c.name], CK, -1);
  g.drawImage(r.cv, c.x - r.ox * CD, c.y - r.oy * CD, r.cv.width * CD, r.cv.height * CD);
  g.globalCompositeOperation = 'source-over';
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(underCv, 0, 0);
  ctx.restore();
}

const ghosts = new Afterimages(6, 9);
const pc = new PuppetCache();
/** The follow-spot operator: x = his soles' base x, y = his depth factor (it slides with him). */
const spot = new FollowSpot(0.06);
let spin = new BallSpin();
let lastT = 0;
let lastBallX = NaN;
let fired = { v: false, x3: false, wipe: 0, split: false, topple: false, strides: 0 };

/** Exposures are lit by the footlight from in front and below: their lilac rim runs along the bottom edges. */
const GHOST_LIGHT = { lx: 0, ly: 1 };
/**
 * The F2 exposure at the turn shows mostly as the head and shoulder of the lean beside his real head, against the dark
 * stands: its rim runs along that outer top-left contour.
 */
const F2_LIGHT = { lx: -0.8, ly: -0.6 };
/** The V's out leg: ball exposures of the push [shot time, start alpha], a row lower (V_OUT_DY px, nearer the lens). */
const V_OUT: readonly (readonly [number, number])[] = [[0, 0.3], [0.1, 0.35]];
const V_OUT_DY = 12;
/** The wipe exposures die on the grid three 16ths after they are dropped. */
const WIPE_LIFE = 0.3;
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
    { at: T_W2, fn: (env) => env.sfx.tom(TOMS.C3, 0.5, 0.25) },
    { at: T_W3, fn: (env) => (env.sfx.tom(TOMS.A2, 0.5, 0.4), env.sfx.whoosh(0.25, 300, 2400, 0.4, -0.55)) },
    { at: 1.05, fn: (env) => env.sfx.whoosh(0.2, 420, 2800, 0.3, 0.6) },
    { at: T_X6, fn: (env) => env.sfx.tom(TOMS.F2, 0.5, 0.55) },
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
    uvSilhouette(soloPic(env, 'EL2'), F2_LIGHT.lx, F2_LIGHT.ly);
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
    fired = { v: false, x3: false, wipe: 0, split: false, topple: false, strides: 0 };
  },
  update(env, t, dt) {
    env.sfx.hum(HUM[5](t));
    const real = Math.max(0, t - lastT);
    lastT = t;
    const h = heroAt(t);
    spot.update(h.x, h.p, real);
    // THE SNAP: the strobe fires and draws the hairpin. Ball exposures on the way out (the outside push carries it
    // forward, toward the lens: a row lower), the turn (the apex, where he showed it), and back on the anchor row to
    // where the real ball is now; an exposure of F2 (leaning left) at the turn. Each exposure is a size smaller than
    // the ball (r 10), so the discs read apart. They step down on the grid and are gone at 0.80.
    if (!fired.v && t >= T_SNAP - 1e-6) {
      fired.v = true;
      const life = T_V_END - T_SNAP;
      ghosts.dropHero('EL2', X0, groundY(1), 2, T_SNAP, life, { pivot: PIVOT, ...F2_LIGHT }, 0.7);
      for (const [at, a0] of V_OUT) {
        const b = ballAt(env, at);
        ghosts.dropBall(b.x, b.y + V_OUT_DY, b.r - 2, T_SNAP, life, a0);
      }
      const [tx, ty] = ballOn(env, 'EL3');
      ghosts.dropBall(tx - 2, ty, 10, T_SNAP, life, 0.4); // the turn: where he showed it
      for (const [at, a0] of [[T_SMEAR, 0.55], [T_SMEAR + 1 / 60, 0.7]] as const) {
        const b = ballAt(env, at);
        ghosts.dropBall(b.x, b.y, b.r - 2, T_SNAP, life, a0);
      }
      // A spit of turf off the inside of the boot as it whips the ball back.
      const b = ballAt(env, T_SNAP);
      grassChunks(env, b.x - 10, groundY(1) - 2, 3, 0.35);
    }
    // OLÉ 3, the scale step: the first exposure of the ghost wipe, where he is.
    if (!fired.x3 && t >= T_OLE - 1e-6) {
      fired.x3 = true;
      const hh = heroAt(T_OLE, false);
      ghosts.dropHero(hh.key, hh.x, hh.y, 3, T_OLE, WIPE_LIFE, { pivot: PIVOT, flip: hh.flip, ...GHOST_LIGHT }, 0.6);
    }
    // The ghost wipe: on each 16th he steps on, and the strobe leaves an exposure of his frame where he stepped FROM,
    // a size nearer the lens each time (x4, x5), so they sweep left to right behind him and decay there on the grid.
    while (fired.wipe < WIPE.length && t >= WIPE[fired.wipe][0] - 1e-6) {
      const [at, sc, py] = WIPE[fired.wipe++];
      const [, key, flip] = seqAt(at - 1e-3);
      ghosts.dropHero(key, strideX(STEP3, at - 1e-3, false), py, sc, at, WIPE_LIFE, { anchor: 'pelvis', flip, ...GHOST_LIGHT }, 0.55);
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
    toneGuards(env, t, h, defAt(t), b);
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
    // From the x6 on he is inside his own solid silhouette, running out of frame right: not drawn (nor the ball).
    const shown = t < T_X6 - 1e-6;
    layer(env, cam, h.p);
    if (shown) drawShadow(env, h, 0.55);

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

    // ---- the exposure of F2 at the turn (the lean): after the dim, so it is not multiplied by it, rimmed along its
    // outer top-left contour (the head and shoulder beside his real head are what shows), and still under C
    exposuresUnderC(env, cam, t, c);

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

    // ---- exposures (where he WAS: the x3 and x4 of the wipe), then No.10, his boots, the wipe exposures nearer the
    // lens than him (x5), the ball and its strobe chain
    layer(env, cam, 1.5);
    heroExposures(env, t, (e) => e.t0 >= T_OLE && e.scale <= 4);
    layer(env, cam, h.p);
    if (shown) {
      drawSolo(env, h.key, h.x, h.y, h.sc, drawOpts(h));
      bootGlow(env, h, 1);
    }
    layer(env, cam, 1.5);
    heroExposures(env, t, (e) => e.t0 >= T_OLE && e.scale >= 5);
    layer(env, cam, 1);
    // The ball's strobe chain sits on uvDeep halos, so it reads against the lit turf and his white boots.
    for (const e of ghosts.ball) {
      const a = Afterimages.alpha(e, t);
      if (a > 0) drawGlow(ctx, glowOf(PAL.uvDeep), e.x, e.y, e.r! * 1.7, 0.75 * a);
    }
    ghosts.draw(env, t, 'ball');
    if (shown) {
      layer(env, cam, ball.p);
      ctx.fillStyle = css(PAL.plum, 0.5);
      ctx.beginPath();
      ctx.ellipse(ball.x + 1, ball.gy - 2, ball.r * 0.9, ball.r * 0.22, 0, 0, TAU);
      ctx.fill();
      drawBall(env, spin, Math.round(ball.x), Math.round(ball.y), ball.r, 1, 0, 0.8 * fl.gain, 'blacklight');
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // ---- the SNAP: beat echo to screen-right, impact frames
    {
      const [hx, hy] = scr(cam, h.p, h.x, h.y - 98 * h.p);
      echoAt(env, t, T_SNAP, 3, 0.6, 0.012, { sx: hx, sy: hy, R: 0.35 });
      if (onFrames(t, T_SNAP, 2)) soloImpact(env.fx, 1);
    }

    // ---- the ghost wipe ends: the solid ultraviolet silhouette at x6 sweeping over the right of the frame as he runs
    // into it toward the right edge (1.10), the beat echo throws it rightward (4 frames, masked to the silhouette so the
    // HUD in the top corners never echoes), and the last three frames ramp to violet: cut on the violet.
    if (t >= T_X6 - 1e-6) {
      layer(env, cam, 1.5);
      const [, key, flip] = seqAt(T_X6);
      drawSoloGhost(env, key, X6_X, X6_Y, 6, { anchor: 'pelvis', flip, alpha: 1, fill: PAL.uv, ...GHOST_LIGHT });
      const [ex, ey] = scr(cam, 1.5, X6_X, X6_Y);
      echoAt(env, t, T_X6, 4, 0.9, 0.035, { sx: ex, sy: ey, R: X6_ECHO_R });
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
    if (t < T_X6 - 1e-6) marqueeTag(ctx, 'ELASTICO', 18, 12, t - T_TAG);
    fourCount(ctx, padsFor(5), t);
  },
};
