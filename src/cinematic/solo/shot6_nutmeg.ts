// SHOT 6 — NUTMEG (1.2 s = beats 15-17, global 7.4-8.6; bar 5's ONE is 0.40). SPEC.md §6: defender D.
//
// Reverse angle: the lens sits on the turf (0.31 m up) just behind D, between D and the goal, looking back up the
// pitch at No.10. D fills the foreground as a back-lit silhouette seen from behind (fill #0E0618, lilac / ultraviolet
// rims where the follow-spot's light wraps round him): his legs, spread in a wide block, form a proscenium arch
// (crotch near y 172, the inner edges of his boots 226 px apart at the bottom of frame). The arch's numbers put his
// shirt in frame up to the shoulder blades (the brief's "from the waist down" cannot hold with an arch top at y 170
// and No.10 at x1 inside it). No.10 (FrontTouch / Nutmeg / Break Front, x1) stands inside the arch in his pool; the
// beam falls behind D from the main-stand roof (top right of frame) and its light spills through the arch onto the
// turf between D's boots and No.10.
//
// Geometry (one pinhole: F 400 px/m, horizon y 272, lens 0.31 m high): No.10 at x1 (56 px/m) is 7.1 m from the lens,
// soles on y 289; D (250 px/m) is 1.6 m from it, soles on y 350; the ball (0.22 m) is r 6 at No.10's toe and r 27 on
// D's boot line. D is drawn in code (the brief's fallback: the profile puppet rig cannot spread its legs in the
// picture plane): a small back-view rig (pelvis, knees, ankles, boots, a folding torso, arms, head) rasterised into
// 3x3-px silhouette pixels in prepare(), animated on twos, rim-lit from the pool and the beam behind him.
//
// Beats (shot-local; touches, keys and the OLÉ on the 16th grid):
//   0.00  beat 15  opens out of shot 5's violet (fx.flash 0.6 -> 0 over 3 frames). FrontTouch FT1 (tom F2), eyes up.
//   0.10-0.20      D sinks into a wider block. 0.10 / 0.20 / 0.30: a 16th snare roll, crescendo.
//   0.20           Nutmeg F2: his shoulders dip screen-right. 0.22-0.32: D bites, weight onto his screen-right leg.
//   0.30           F3 set: the left foot plants beside the ball, the right toe aimed at the gap.
//   0.40  beat 16  THE POKE (F4, held to 0.55; the ONE of bar 5): the toe pokes the ball straight at the lens through
//                  the arch (kick drum + crash + the toe's tap). Beat flare (pool only), beat-snap push in (zoom 1.06),
//                  an exposure of F4 left where he poked; the ball's next four frames are strobed as exposures.
//                  0.42-0.47 D's knees twitch inward, too late.
//   0.45           the NUTMEG tag.
//   0.50-0.70      the money frame (rate 0.2): the ball rolls between D's boots (r 22 -> 28, on his boot line at 0.69),
//                  ivory-bright, framed by the arch, its four exposures trailing back to the F4 exposure's toe; No.10,
//                  in his spot, already stepping round (Break BR1, 0.55). Clean: no echo, no impact.
//   0.60-0.68      D folds forward; his upside-down head swings down into the arch, rim-lit hair hanging, eyes wide in
//                  the dark, and follows the ball through his own legs (0.70 the crowd laughs; 0.82 his eyes drop).
//   0.70           BR2: No.10 goes round behind D's left knee.
//   0.80  beat 17  OLÉ! 4, the loudest (all four pads flare, the phone lights lift) and the fill's climax (16th toms D3
//                  D3 C3 A2): the beat-snap trucks left with him as he comes round D's side, his scale 1 -> 2.
//   0.80-0.92      the ball rolls out under the lens (bottom edge).
//   0.84-0.90      D's boots slip and he sits down hard (0.90 boom), then rolls back out of the bottom of frame (1.04).
//   0.85-1.20      BR3 / BR2 / BR3: No.10 sprints out of frame-left past the lens, his pool sliding with him; the hard
//                  cut at 1.20 takes him half out of frame.
//
// The ball is poked on 0.40 and decelerates as it rolls (rolling friction, exaggerated, settling at about 4.6 m/s): on
// screen it approaches at an even pace into the slow window and crawls through it, so the window reads as a speed
// ramp, not a stop.
//
// Clock: No.10 follows the brief's frame schedule in shot time; the ball and the particles run on sim time (RATE[6]:
// 0.2 from 0.50 to 0.70, a rest in the bar); D acts on shot time (his gag is staged to the beat). Positions are pure
// functions of t apart from the follow-spot operator and the ball spin, which advance in update() at the fixed step
// (seek-exact); init resets them. Roll 0, sat 1, no rings, no filtering; the exposures never touch anyone.

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { TAU, clamp, ease, lerp, type RGB } from '../../engine/math';
import { drawGlow, glowOf } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import {
  Afterimages, FollowSpot, HEX, HUM, PAL, RATE, SCALE, SEQ, TOMS, ballGhost, beatCam, drawBall, drawSolo, fourCount,
  marqueeTag, onGrid, padsFor, soloAt, soloGrade, soloPic, soloPoint, stage, warmSolo, type CamKey, type SoloKey,
  type StagePool,
} from './common';

const DUR = 1.2;

// ---------------------------------------------------------------- beats (shot-local seconds)

const T_TOUCH = onGrid(0, 'FT1 touch');
const T_SINK = onGrid(0.1, 'D sinks');
const T_SHAPE = onGrid(0.2, 'NM2 shape');
const T_SET = onGrid(0.3, 'NM3 set');
const T_POKE = onGrid(0.4, 'THE POKE');
const T_TAG = 0.45;
const T_SLOW0 = 0.5;
const T_SLOW1 = 0.7;
const T_GO = 0.55;
const T_FOLD = onGrid(0.6, 'D folds');
const T_LAUGH = onGrid(0.7, 'crowd laugh');
const T_OLE = onGrid(0.8, 'OLE 4');
const T_SIT = onGrid(0.9, 'D sits');
/** Beat flares (pool only): THE POKE. */
const FLARES = [T_POKE] as const;
/** The exposures (F4 and the ball's strobe) step down at 0.70 and 0.80 and are gone at 0.90. */
const EXPO_END = 0.9;
/** The ball's strobe: its four frames after the poke. */
const BALL_DROPS = [T_POKE + 1 / 60, T_POKE + 2 / 60, T_POKE + 3 / 60, T_POKE + 4 / 60];

// ---------------------------------------------------------------- the lens (metres -> px)

/** Focal length (px at 1 m), horizon (eye level) and lens height (m). */
const F = 400;
const HZ = 272;
const LENS_H = 0.31;
const BALL_R = 0.11;
/** No.10 at x1 (98 art px = 1.75 m -> 56 px/m) and D (250 px/m): their distances from the lens. */
const Z_HERO = F / 56;
const Z_D = F / 250;
/** The lens stands 19.2 m from the goal line (D is at 20.8 m, at the top of the D). */
const LENS_GD = 19.2;
const groundY = (Z: number) => HZ + (F * LENS_H) / Z;
/** Project a pitch point (X m lateral, screen-right +; Y m up; Z m from the lens) with the camera trucked camX m. */
function proj(X: number, Y: number, Z: number, camX = 0): [number, number] {
  return [VW / 2 + (F * (X - camX)) / Z, HZ + (F * (LENS_H - Y)) / Z];
}

// ---------------------------------------------------------------- camera (beat-snap)

/** Zoom pivot: the arch (No.10's middle). */
const PIV = { x: 320, y: 250 };
/** [t, truck (m; - = left), tilt (px), zoom]: a push in on THE POKE, then a truck left with him on the OLÉ. */
const CAM: readonly CamKey[] = [
  [0, 0, 0, 1],
  [T_POKE, 0, 0, 1.06],
  [T_OLE, -0.32, 0, 1],
];
type Cam = { x: number; y: number; zoom: number };
/** Transform for a layer at distance Z (m): base coordinates (camera untrucked) -> screen, with the truck parallax. */
function layer(env: Env, cam: Cam, Z: number) {
  const S = env.S, z = cam.zoom, off = (-F * cam.x) / Z;
  env.ctx.setTransform(S * z, 0, 0, S * z, S * (PIV.x * (1 - z) + off * z), S * (PIV.y * (1 - z) + cam.y));
}
/** Screen point (logical px) of base point (x, y) in a layer at distance Z. */
function scr(cam: Cam, Z: number, x: number, y: number): [number, number] {
  return [PIV.x + (x - (F * cam.x) / Z - PIV.x) * cam.zoom, PIV.y + (y - PIV.y) * cam.zoom + cam.y];
}

// ---------------------------------------------------------------- No.10

/** Every front frame shares one registration (body centre x 64, soles on row 102): pin that point. */
const PIVOT: [number, number] = [64, 103];
/**
 * Stride placements: [time, base x of the pinned point, approach (px down), ease frames]. Pinned between keys (the
 * planted foot never slides), eased over 3 frames on a stride; the x1 -> x2 step on the OLÉ beat-snap is a cut.
 */
const RUN: readonly (readonly [number, number, number, number])[] = [
  [0, 320, 0, 0],
  [T_GO, 284, 0, 3], // BR1: the first step to screen-left (his right), round D
  [0.7, 254, 0, 3], // BR2: behind D's left knee
  [T_OLE, 116, 0, 0], // x2: round D's side (the beat-snap)
  [0.85, 84, 3, 3], // BR3: after the ball, toward the lens
  [1.0, 6, 7, 3], // BR2: accelerating
  [1.1, -22, 11, 3], // BR3: going out of frame-left past the lens (the cut takes him on the way out)
];

interface Hero {
  key: SoloKey;
  sc: 1 | 2;
  /** Distance from the lens (m) and base position of the pinned point (soles, body centre). */
  Z: number;
  x: number;
  y: number;
}

function heroAt(t: number): Hero {
  let i = 0;
  for (let k = 0; k < RUN.length; k++) if (t >= RUN[k][0] - 1e-6) i = k;
  let x = RUN[i][1], dy = RUN[i][2];
  if (i > 0 && RUN[i][3] > 0) {
    const u = ease.outCubic(clamp((t - RUN[i][0]) / (RUN[i][3] / 60)));
    x = lerp(RUN[i - 1][1], x, u);
    dy = lerp(RUN[i - 1][2], dy, u);
  }
  const sc: 1 | 2 = SCALE[6](t) >= 2 ? 2 : 1;
  const Z = Z_HERO / sc;
  return { key: soloAt(SEQ[6], t), sc, Z, x, y: groundY(Z) + dy };
}

// ---------------------------------------------------------------- the ball

/** Sim time of shot time t under RATE[6] (0.2 from 0.50 to 0.70). */
const sigma = (t: number) => (t <= T_SLOW0 ? t : t <= T_SLOW1 ? T_SLOW0 + (t - T_SLOW0) * 0.2 : T_SLOW0 + 0.04 + (t - T_SLOW1));
/** Before the poke the ball sits a toe ahead of him (the approach touch rolls it on 0.2 m). */
const Z_PRE0 = Z_HERO - 0.1;
const Z_PRE1 = Z_HERO - 0.3;
/**
 * The roll after the poke: v(s) = V_INF + (V0 - V_INF) e^(-s / TAU) (sim s since the poke), solved so the ball is 2.0 m
 * from the lens (r 22) as the slow window opens. On screen that is an even approach (+3 px of radius a frame), a crawl
 * through the window, then the same pace again until it rolls out under the lens.
 */
const ROLL_TAU = 0.04;
const ROLL_VINF = 4.6;
const Z_SLOW = 2.0;
const ROLL_V0 = ROLL_VINF + (Z_PRE1 - Z_SLOW - ROLL_VINF * 0.1) / (ROLL_TAU * (1 - Math.exp(-0.1 / ROLL_TAU)));
const rollDist = (s: number) => (s <= 0 ? 0 : ROLL_VINF * s + (ROLL_V0 - ROLL_VINF) * ROLL_TAU * (1 - Math.exp(-s / ROLL_TAU)));
/** Off screen once its top passes the bottom of frame (y 365). */
const Z_GONE = (F * (LENS_H - 2 * BALL_R)) / (VH + 5 - HZ);

interface Ball {
  /** Base position in its own layer, radius (px), distance (m) and lateral position (m). */
  x: number;
  y: number;
  r: number;
  Z: number;
  X: number;
}

function ballAt(env: Env, t: number): Ball {
  const hy = groundY(Z_HERO);
  let X: number, Z: number;
  if (t < T_POKE - 1e-6) {
    // The approach touch (FT1, laces) rolls it from his right boot to the set position in front of his toes (NM2/NM3).
    const [fx] = soloPoint(env, 'FT1', 'ball', 320, hy, 1, { pivot: PIVOT });
    const [sx] = soloPoint(env, 'NM2', 'ball', 320, hy, 1, { pivot: PIVOT });
    const u = ease.outQuad(clamp(t / T_SHAPE));
    Z = lerp(Z_PRE0, Z_PRE1, u);
    X = ((lerp(fx, sx, u) - 320) * Z) / F;
  } else {
    // Poked straight at the lens from the toe of F4, rolling on its own line through the arch.
    const [px] = soloPoint(env, 'NM4', 'ball', 320, hy, 1, { pivot: PIVOT });
    X = ((px - 320) * Z_PRE1) / F;
    Z = Z_PRE1 - rollDist(sigma(t) - T_POKE);
  }
  const Zc = Math.max(0.05, Z);
  return { x: VW / 2 + (F * X) / Zc, y: HZ + (F * (LENS_H - BALL_R)) / Zc, r: (F * BALL_R) / Zc, Z, X };
}

/** Distance rolled since the start of the shot (m): the spin is locked to it. */
function rolled(t: number): number {
  if (t < T_POKE - 1e-6) return (Z_PRE0 - Z_PRE1) * ease.outQuad(clamp(t / T_SHAPE));
  return Z_PRE0 - Z_PRE1 + rollDist(sigma(t) - T_POKE);
}

// ---------------------------------------------------------------- D: the back-lit arch (a back-view rig in code)

type V2 = [number, number];
/** D's pose in metres in his own plane (x screen-right, y up, origin on the turf between his boots). */
interface DPose {
  /** Pelvis centre (the hip joints sit 0.10 either side). */
  px: number;
  py: number;
  kL: V2;
  kR: V2;
  aL: V2;
  aR: V2;
  /** Boot sole centres. */
  bL: V2;
  bR: V2;
  /** Torso fold (rad): 0 upright, + bending forward (away from the lens), - leaning back toward it. */
  fold: number;
  /** Torso side lean (rad, + = screen-right). */
  lean: number;
  eL: V2;
  eR: V2;
  hL: V2;
  hR: V2;
  /** Pupils: 0 level, 1 looking down at the ball (only seen upside down, through his legs). */
  look: number;
  /** The fall out of frame: translation down (m) and growth toward the lens. */
  drop: number;
  grow: number;
}

const D2R = Math.PI / 180;
/** Wide block, seen from behind: knees bent and pushed out over the boots, weight even, arms out low for balance. */
const D_BLOCK: DPose = {
  px: 0, py: 0.78,
  kL: [-0.4, 0.47], kR: [0.4, 0.47], aL: [-0.5, 0.11], aR: [0.5, 0.11], bL: [-0.52, 0], bR: [0.52, 0],
  fold: 6 * D2R, lean: 0,
  eL: [-0.49, 1.13], eR: [0.49, 1.13], hL: [-0.55, 0.9], hR: [0.55, 0.9],
  look: 0, drop: 0, grow: 1,
};
/** Sunk deeper (0.20): hips down, knees pushed further out, arms wider. */
const D_SUNK: DPose = {
  ...D_BLOCK, py: 0.745, kL: [-0.43, 0.45], kR: [0.43, 0.45], fold: 10 * D2R,
  eL: [-0.53, 1.09], eR: [0.53, 1.09], hL: [-0.6, 0.85], hR: [0.6, 0.85],
};
/** The bite (0.32): weight thrown onto the screen-right leg (toward the dip), left heel light, right arm reaching. */
const D_LEAN: DPose = {
  ...D_SUNK, px: 0.08, py: 0.73, kL: [-0.35, 0.48], kR: [0.47, 0.41], aL: [-0.49, 0.12], bL: [-0.52, 0.012],
  lean: 7 * D2R, eL: [-0.43, 1.16], eR: [0.6, 1.02], hL: [-0.5, 0.96], hR: [0.7, 0.78],
};
/** Too late (0.47): the knees twitch inward over the ball that has already gone through. */
const D_PINCH: DPose = { ...D_LEAN, py: 0.745, kL: [-0.3, 0.49], kR: [0.41, 0.44] };
/** Looking back through his own legs (0.68): folded forward, hands on his knees, upside-down head in the arch. */
const D_LOOK: DPose = {
  ...D_LEAN, px: 0.02, py: 0.84, kL: [-0.39, 0.48], kR: [0.41, 0.47], aL: [-0.5, 0.11], aR: [0.5, 0.11],
  bL: [-0.52, 0], bR: [0.52, 0], fold: 108 * D2R, lean: 0,
  eL: [-0.26, 0.38], eR: [0.29, 0.38], hL: [-0.3, 0.25], hR: [0.33, 0.25], look: 0,
};
/** Following the ball as it rolls under the lens (0.82): head a little lower, eyes down. */
const D_LOOK2: DPose = { ...D_LOOK, py: 0.825, fold: 112 * D2R, look: 1 };
/** Overbalancing backward (0.87): his boots slip away from under him, the seat drops, arms flung up and out. */
const D_FALL: DPose = {
  ...D_LOOK2, px: 0, py: 0.4, kL: [-0.29, 0.29], kR: [0.29, 0.29], aL: [-0.37, 0.1], aR: [0.37, 0.1],
  bL: [-0.41, 0.04], bR: [0.41, 0.04], fold: 72 * D2R, look: 0,
  eL: [-0.4, 0.5], eR: [0.4, 0.5], hL: [-0.5, 0.3], hR: [0.5, 0.3], grow: 1.04,
};
/** Sat down hard (0.90): on his bottom, leaning back, hands planted behind him, boots up off the turf. */
const D_SAT: DPose = {
  ...D_FALL, py: 0.12, kL: [-0.25, 0.42], kR: [0.25, 0.42], aL: [-0.3, 0.26], aR: [0.3, 0.26], bL: [-0.33, 0.2],
  bR: [0.33, 0.2], fold: -20 * D2R, eL: [-0.38, 0.4], eR: [0.38, 0.4], hL: [-0.46, 0.04], hR: [0.46, 0.04], grow: 1.08,
};
/** Rolled back on out of the bottom of frame (1.04). */
const D_GONE: DPose = {
  ...D_SAT, fold: -52 * D2R, eL: [-0.42, 0.52], eR: [0.42, 0.52], hL: [-0.6, 0.62], hR: [0.6, 0.6], drop: 1.7, grow: 1.35,
};

function mixD(a: DPose, b: DPose, u: number): DPose {
  const v = (p: V2, q: V2): V2 => [lerp(p[0], q[0], u), lerp(p[1], q[1], u)];
  return {
    px: lerp(a.px, b.px, u), py: lerp(a.py, b.py, u),
    kL: v(a.kL, b.kL), kR: v(a.kR, b.kR), aL: v(a.aL, b.aL), aR: v(a.aR, b.aR), bL: v(a.bL, b.bL), bR: v(a.bR, b.bR),
    fold: lerp(a.fold, b.fold, u), lean: lerp(a.lean, b.lean, u),
    eL: v(a.eL, b.eL), eR: v(a.eR, b.eR), hL: v(a.hL, b.hL), hR: v(a.hR, b.hR),
    look: lerp(a.look, b.look, u), drop: lerp(a.drop, b.drop, u), grow: lerp(a.grow, b.grow, u),
  };
}

/** D's pose track in shot time: [time, pose, ease into it]. */
const D_TRACK: readonly (readonly [number, DPose, (u: number) => number])[] = [
  [0, D_BLOCK, ease.linear],
  [T_SINK, D_BLOCK, ease.linear],
  [T_SHAPE, D_SUNK, ease.inOutQuad],
  [0.22, D_SUNK, ease.linear], // he reads the dip a 16th late...
  [0.32, D_LEAN, ease.outCubic], // ...and bites
  [T_POKE + 0.02, D_LEAN, ease.linear],
  [T_POKE + 0.07, D_PINCH, ease.outQuad], // the knees twitch shut, too late
  [T_GO, D_LEAN, ease.inOutQuad],
  [T_FOLD, D_LEAN, ease.linear],
  [0.68, D_LOOK, ease.inOutCubic], // folds forward to look back through his legs
  [0.82, D_LOOK2, ease.inOutQuad],
  [0.84, D_LOOK2, ease.linear],
  [0.87, D_FALL, ease.inQuad], // overbalances backward...
  [T_SIT, D_SAT, ease.inQuad], // ...and sits down hard
  [1.04, D_GONE, ease.inQuad], // then rolls back out of the bottom of frame
];

function dPose(t: number): DPose {
  const tr = D_TRACK;
  if (t <= tr[0][0]) return tr[0][1];
  for (let i = 1; i < tr.length; i++) if (t < tr[i][0]) return mixD(tr[i - 1][1], tr[i][1], tr[i][2](clamp((t - tr[i - 1][0]) / (tr[i][0] - tr[i - 1][0]))));
  return tr[tr.length - 1][1];
}

/** Silhouette pixels: 3x3 logical px each; 250 px/m at his plane. */
const G = 3;
const M = 250 / G;
/** The silhouette canvas (silhouette px) and its origin: the turf between his boots. */
const DW = 230;
const DH = 214;
const DOX = 115;
const DOY = 190;
/** Back-lit body (#0E0618), the seams inside it, his face (in his own shadow), his eyes catching the light. */
const D_FILL: RGB = [14, 6, 24];
const D_SEAM: RGB = [32, 18, 54];
const D_FACE: RGB = [24, 13, 42];
const D_EYE: RGB = [201, 182, 255];

let dScratch: HTMLCanvasElement | null = null;
interface DMasks {
  legs: Uint8Array;
  torso: Uint8Array;
  seams: Uint8Array;
  /** Bounding box of the body (silhouette px), padded by 1. */
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}
/**
 * Rasterise a pose into binary masks (silhouette px) in one pass: the legs layer in red, the torso layer in blue, the
 * seams in green (additive, so each layer is its own channel), then one read-back.
 */
function rasterD(p: DPose): DMasks {
  if (!dScratch) {
    dScratch = document.createElement('canvas');
    dScratch.width = DW;
    dScratch.height = DH;
  }
  const g = dScratch.getContext('2d', { willReadFrequently: true })!;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-over';
  g.clearRect(0, 0, DW, DH);
  // metres -> silhouette px (with the fall's drop / growth)
  g.setTransform(M * p.grow, 0, 0, -M * p.grow, DOX, DOY + p.drop * M);
  g.globalCompositeOperation = 'lighter';
  g.lineCap = 'butt';
  g.lineWidth = 1 / (M * p.grow);
  g.fillStyle = '#f00';
  paintLegs(g, p);
  g.fillStyle = '#00f';
  paintTorso(g, p);
  g.strokeStyle = '#0f0';
  paintLegSeams(g, p);
  paintTorsoSeams(g, p);
  const d = g.getImageData(0, 0, DW, DH).data;
  const n = DW * DH;
  const legs = new Uint8Array(n), torso = new Uint8Array(n), seams = new Uint8Array(n);
  let x0 = DW, y0 = DH, x1 = -1, y1 = -1;
  for (let i = 0, y = 0; y < DH; y++)
    for (let x = 0; x < DW; x++, i++) {
      const L = d[i * 4] >= 128 ? 1 : 0, T = d[i * 4 + 2] >= 128 ? 1 : 0;
      legs[i] = L;
      torso[i] = T;
      seams[i] = d[i * 4 + 1] >= 128 ? 1 : 0;
      if (L || T) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  return { legs, torso, seams, x0: Math.max(0, x0 - 1), y0: Math.max(0, y0 - 1), x1: Math.min(DW - 1, x1 + 1), y1: Math.min(DH - 1, y1 + 1) };
}
/** Metres (D's plane) -> silhouette px. */
const toPx = (p: DPose, x: number, y: number): V2 => [DOX + x * M * p.grow, DOY + p.drop * M - y * M * p.grow];

/** A tapered capsule from a (radius ra) to b (radius rb). */
function capsule(g: CanvasRenderingContext2D, a: V2, b: V2, ra: number, rb: number) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1e-6;
  const nx = -dy / L, ny = dx / L;
  g.beginPath();
  g.moveTo(a[0] + nx * ra, a[1] + ny * ra);
  g.lineTo(b[0] + nx * rb, b[1] + ny * rb);
  g.lineTo(b[0] - nx * rb, b[1] - ny * rb);
  g.lineTo(a[0] - nx * ra, a[1] - ny * ra);
  g.closePath();
  g.fill();
  for (const [c, r] of [[a, ra], [b, rb]] as const) {
    g.beginPath();
    g.arc(c[0], c[1], r, 0, TAU);
    g.fill();
  }
}
function poly(g: CanvasRenderingContext2D, pts: V2[]) {
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
  g.fill();
}
function line(g: CanvasRenderingContext2D, a: V2, b: V2) {
  g.beginPath();
  g.moveTo(a[0], a[1]);
  g.lineTo(b[0], b[1]);
  g.stroke();
}
function ellipse(g: CanvasRenderingContext2D, c: V2, rx: number, ry: number) {
  g.beginPath();
  g.ellipse(c[0], c[1], rx, ry, 0, 0, TAU);
  g.fill();
}
const add = (a: V2, b: V2): V2 => [a[0] + b[0], a[1] + b[1]];
const at = (a: V2, b: V2, u: number): V2 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
/** Unit normal (left of a -> b). */
const nrm = (a: V2, b: V2): V2 => {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1e-6;
  return [-dy / L, dx / L];
};

/** Head size (an ellipse) and his hair line. */
const HEAD_RX = 0.106;
const HEAD_RY = 0.118;

/** Derived body points of a pose. */
function body(p: DPose) {
  const P: V2 = [p.px, p.py];
  const hipL: V2 = [p.px - 0.11, p.py], hipR: V2 = [p.px + 0.11, p.py];
  // Torso: 0.62 m from the pelvis to the shoulder line, foreshortened by the fold, turned by the lean.
  const up: V2 = [Math.sin(p.lean), Math.cos(p.lean) * Math.cos(p.fold)];
  const side: V2 = [Math.cos(p.lean), -Math.sin(p.lean)];
  const S: V2 = add(P, [up[0] * 0.62, up[1] * 0.62]);
  const shL: V2 = add(S, [-side[0] * 0.21, -side[1] * 0.21]), shR: V2 = add(S, [side[0] * 0.21, side[1] * 0.21]);
  // Head: above the shoulders when upright; as he folds past the vertical it swings down and hangs below the shoulder
  // line (upside down, his neck craned to look back between his legs).
  const inv = p.fold > Math.PI / 2;
  const k = clamp((p.fold - 80 * D2R) / (35 * D2R));
  const head: V2 = add(S, [up[0] * 0.22, lerp(up[1] * 0.22, -0.19, k * k * (3 - 2 * k))]);
  return { P, hipL, hipR, up, side, S, shL, shR, head, inv };
}

/** The legs, seat and shorts (in front of the torso once he folds forward). */
function paintLegs(g: CanvasRenderingContext2D, p: DPose) {
  const b = body(p);
  for (const [hip, k, a, s, o] of [[b.hipL, p.kL, p.aL, p.bL, -1], [b.hipR, p.kR, p.aR, p.bR, 1]] as const) {
    capsule(g, hip, k, 0.1, 0.064); // thigh
    capsule(g, k, a, 0.062, 0.04); // shin
    const calf = add(at(k, a, 0.3), [-o * 0.008, 0]);
    ellipse(g, calf, 0.07, 0.09); // calf
    // Boot from behind: the heel counter, then the sole flaring out (toes turned out of the block).
    capsule(g, add(a, [0, -0.02]), [s[0], s[1] + 0.05], 0.046, 0.054);
    poly(g, [
      [s[0] - 0.062 + Math.min(0, o) * 0.025, s[1] + 0.04], [s[0] + 0.062 + Math.max(0, o) * 0.025, s[1] + 0.04],
      [s[0] + 0.068 + Math.max(0, o) * 0.035, s[1]], [s[0] - 0.068 + Math.min(0, o) * 0.035, s[1]],
    ]);
  }
  // The seat of his shorts (rounded: when he folds forward it becomes the top of the silhouette).
  ellipse(g, [p.px, p.py + 0.06], 0.215, 0.13);
  // Shorts legs: from the hips to the hems 40% of the way down each thigh, a little looser than the legs.
  const hemL = at(b.hipL, p.kL, 0.4), hemR = at(b.hipR, p.kR, 0.4);
  const nl = nrm(b.hipL, p.kL), nr = nrm(b.hipR, p.kR);
  const w = 0.118;
  poly(g, [
    [p.px - 0.2, p.py + 0.08], [p.px + 0.2, p.py + 0.08], [p.px + 0.215, p.py + 0.0],
    add(hemR, [-nr[0] * w, -nr[1] * w]), add(hemR, [nr[0] * w, nr[1] * w]), [p.px, p.py - 0.07],
    add(hemL, [-nl[0] * w, -nl[1] * w]), add(hemL, [nl[0] * w, nl[1] * w]), [p.px - 0.215, p.py + 0.0],
  ]);
}

/** Seams inside the legs layer: the shorts' centre seam and hems, the sock tops, the boot collars. */
function paintLegSeams(g: CanvasRenderingContext2D, p: DPose) {
  const b = body(p);
  line(g, [p.px, p.py + 0.17], [p.px, p.py - 0.04]);
  for (const [hip, k, a] of [[b.hipL, p.kL, p.aL], [b.hipR, p.kR, p.aR]] as const) {
    const hem = at(hip, k, 0.4), n = nrm(hip, k), d = nrm(n, [0, 0]);
    const up = [-d[0] * 0.012, -d[1] * 0.012] as V2;
    line(g, add(add(hem, [-n[0] * 0.1, -n[1] * 0.1]), up), add(add(hem, [n[0] * 0.1, n[1] * 0.1]), up));
    const sock = at(k, a, 0.2), ns = nrm(k, a);
    line(g, add(sock, [-ns[0] * 0.075, -ns[1] * 0.075]), add(sock, [ns[0] * 0.075, ns[1] * 0.075]));
    line(g, [a[0] - 0.05, a[1] - 0.025], [a[0] + 0.05, a[1] - 0.025]);
  }
}

/** The torso (shirt), arms and head: behind the legs once he has folded forward, over them otherwise. */
function paintTorso(g: CanvasRenderingContext2D, p: DPose) {
  const b = body(p);
  const u = (k: number): V2 => [b.up[0] * k, b.up[1] * k];
  const s = (k: number): V2 => [b.side[0] * k, b.side[1] * k];
  // Shirt: the hem hangs loose over the waistband, the waist tucks in a little, the back widens to the shoulders.
  const hem = add(b.P, u(0.15)), waist = add(b.P, u(0.32)), chest = add(b.P, u(0.5));
  poly(g, [
    add(hem, s(-0.225)), add(waist, s(-0.19)), add(chest, s(-0.22)), add(b.S, s(-0.235)),
    add(b.S, s(0.235)), add(chest, s(0.22)), add(waist, s(0.19)), add(hem, s(0.225)),
  ]);
  capsule(g, b.shL, b.shR, 0.08, 0.08);
  // Arms: upper arm, forearm, a mitten of a hand with its thumb.
  for (const [sh, e, h, o] of [[b.shL, p.eL, p.hL, -1], [b.shR, p.eR, p.hR, 1]] as const) {
    capsule(g, sh, e, 0.064, 0.052);
    capsule(g, e, h, 0.052, 0.042);
    ellipse(g, h, 0.052, 0.058);
    ellipse(g, add(h, [-o * 0.04, 0.03]), 0.022, 0.028);
  }
  // Neck and head: the back of his head when upright; upside down between his legs when folded.
  capsule(g, b.S, b.head, 0.06, 0.055);
  ellipse(g, b.head, HEAD_RX, HEAD_RY);
  const c = b.inv ? -1 : 1;
  for (const sx of [-1, 1]) ellipse(g, [b.head[0] + sx * HEAD_RX, b.head[1] - c * 0.005], 0.024, 0.032);
  // Short cropped hair, fuller at the crown, four tufts off it (hanging down when he is upside down).
  ellipse(g, [b.head[0], b.head[1] + c * 0.045], HEAD_RX + 0.012, HEAD_RY * 0.72);
  const crown = b.head[1] + c * (HEAD_RY - 0.01);
  for (const [x0, x1, tip, len] of [[-0.11, -0.05, -0.1, 0.04], [-0.06, 0.0, -0.035, 0.055], [-0.005, 0.055, 0.03, 0.058], [0.05, 0.11, 0.095, 0.04]] as const)
    poly(g, [[b.head[0] + x0, crown - c * 0.03], [b.head[0] + x1, crown - c * 0.03], [b.head[0] + tip, crown + c * len]]);
}

/** Seams inside the torso layer: the spine of his shirt (upright only). */
function paintTorsoSeams(g: CanvasRenderingContext2D, p: DPose) {
  const b = body(p);
  if (b.inv) return;
  const u = (k: number): V2 => add(b.P, [b.up[0] * k, b.up[1] * k]);
  line(g, u(0.38), u(0.6));
}

type DLight = { x: number; y: number; w: number; reach: number };
/**
 * Per-pixel compose of one layer: fill, seams and the rim light where the follow-spot behind him wraps round the
 * edge (lilac + an inner ultraviolet pixel facing the pool, ultraviolet where it grazes, a faint uvDeep elsewhere).
 * Where this layer's edge lies over `under` (the shirt hem over the shorts...), it is a seam, not a rim.
 */
const dCls = new Uint8Array(DW * DH);
function composeD(out: Uint8ClampedArray, mask: Uint8Array, seams: Uint8Array | null, under: Uint8Array | null, lights: DLight[], bb: DMasks) {
  const inside = (x: number, y: number) => (x < 0 || y < 0 || x >= DW || y >= DH ? true : mask[y * DW + x] === 1);
  const cls = dCls; // 0 fill, 1 uvDeep rim, 2 uv rim, 3 lilac rim, 4 inner uv, 5 seam
  cls.fill(0);
  for (let y = bb.y0; y <= bb.y1; y++)
    for (let x = bb.x0; x <= bb.x1; x++) {
      const i = y * DW + x;
      if (!mask[i]) continue;
      if (inside(x - 1, y) && inside(x + 1, y) && inside(x, y - 1) && inside(x, y + 1)) continue;
      let nx = 0, ny = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && !inside(x + dx, y + dy)) (nx += dx), (ny += dy);
      const nl = Math.hypot(nx, ny);
      if (nl < 1e-6) continue;
      nx /= nl;
      ny /= nl;
      if (under) {
        const ox = Math.round(x + nx), oy = Math.round(y + ny);
        if (ox >= 0 && oy >= 0 && ox < DW && oy < DH && under[oy * DW + ox]) {
          cls[i] = 5;
          continue;
        }
      }
      let s = 0.1;
      for (const L of lights) {
        const lx = L.x - x, ly = L.y - y, ll = Math.hypot(lx, ly) || 1;
        const dot = (nx * lx + ny * ly) / ll;
        if (dot > 0) s += L.w * dot * clamp(1.2 - ll / L.reach);
      }
      cls[i] = s >= 0.62 ? 3 : s >= 0.4 ? 2 : s >= 0.22 ? 1 : 0;
      if (s >= 0.62) {
        const ix = Math.round(x - nx), iy = Math.round(y - ny);
        if (ix >= 0 && iy >= 0 && ix < DW && iy < DH) {
          const j = iy * DW + ix;
          if (mask[j] && cls[j] === 0) cls[j] = 4;
        }
      }
    }
  for (let y = bb.y0; y <= bb.y1; y++)
    for (let i = y * DW + bb.x0, e = y * DW + bb.x1; i <= e; i++) {
      if (!mask[i]) continue;
      const c = cls[i];
      const col: RGB = c === 3 ? PAL.lilac : c === 2 || c === 4 ? PAL.uv : c === 1 ? PAL.uvDeep : c === 5 || (seams && seams[i]) ? D_SEAM : D_FILL;
      out[i * 4] = col[0];
      out[i * 4 + 1] = col[1];
      out[i * 4 + 2] = col[2];
      out[i * 4 + 3] = 255;
    }
}

const dCache = new Map<string, HTMLCanvasElement>();
/** Where the light behind D comes from at time t (silhouette px): the pool through the arch, and the beam above. */
function dLights(t: number, p: DPose): DLight[] {
  const h = heroAt(t);
  // The pool sits round No.10: across in D's plane by the same screen offset.
  const lx = clamp((h.x - VW / 2) / 250, -1.1, 0.4);
  const y0 = DOY + p.drop * M;
  return [
    { x: DOX + lx * M, y: y0 - 0.3 * M, w: 1.0, reach: 1.5 * M },
    { x: DOX + (lx * 0.4 + 0.15) * M, y: y0 - 1.9 * M, w: 0.4, reach: 2.4 * M },
  ];
}

/**
 * D's silhouette at shot frame f. He is animated on twos (each pose held 2 frames, like hand-drawn animation), and
 * a pose that repeats (the holds) shares its picture. Pure function of the shot time; built in prepare().
 */
function dFrame(f: number): HTMLCanvasElement {
  const t = (f - (f % 2)) / 60;
  const p = dPose(t);
  const lights = dLights(t, p);
  const key = [p.px, p.py, ...p.kL, ...p.kR, ...p.aL, ...p.aR, ...p.bL, ...p.bR, p.fold, p.lean, ...p.eL, ...p.eR, ...p.hL, ...p.hR, p.look, p.drop, p.grow, lights[0].x, lights[1].x]
    .map((v) => v.toFixed(3))
    .join(',');
  let cv = dCache.get(key);
  if (cv) return cv;
  const b = body(p);
  const mk = rasterD(p);
  const { legs, torso, seams } = mk;
  cv = document.createElement('canvas');
  cv.width = DW;
  cv.height = DH;
  const g = cv.getContext('2d')!;
  const img = g.createImageData(DW, DH);
  if (b.inv) {
    composeD(img.data, torso, seams, null, lights, mk);
    composeD(img.data, legs, seams, torso, lights, mk);
  } else {
    composeD(img.data, legs, seams, null, lights, mk);
    composeD(img.data, torso, seams, legs, lights, mk);
  }
  const set = (x: number, y: number, c: RGB) => {
    if (x < 0 || y < 0 || x >= DW || y >= DH) return;
    const i = (y * DW + x) * 4;
    img.data[i] = c[0];
    img.data[i + 1] = c[1];
    img.data[i + 2] = c[2];
    img.data[i + 3] = 255;
  };
  // Looking back through his legs: the pool behind him rims his head and his hanging hair in lilac; his upside-down
  // face catches the glow of the ball rolling away under it; eyes (pupils toward the ball), brows, a dropped jaw.
  if (b.inv && p.fold > 100 * D2R) {
    const [cx, cy] = toPx(p, b.head[0], b.head[1]);
    const R = (HEAD_RY + 0.12) * M * p.grow;
    const both = (x: number, y: number) => x >= 0 && y >= 0 && x < DW && y < DH && (torso[y * DW + x] === 1 || legs[y * DW + x] === 1);
    for (let y = Math.floor(cy - R * 0.3); y <= Math.ceil(cy + R); y++)
      for (let x = Math.floor(cx - R); x <= Math.ceil(cx + R); x++) {
        if (x < 0 || y < 0 || x >= DW || y >= DH || !torso[y * DW + x] || legs[y * DW + x]) continue;
        if (!both(x - 1, y) || !both(x + 1, y) || !both(x, y - 1) || !both(x, y + 1)) set(x, y, PAL.lilac);
      }
    const rx = HEAD_RX * M * p.grow - 1.6, ry = HEAD_RY * M * p.grow - 1.6;
    const hair = cy + 4.5; // the hairline (upside down: chin at the top, the crown hangs below)
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy > 1 || y + 0.5 > hair || legs[y * DW + x]) continue;
        set(x, y, D_FACE);
      }
    const look = Math.round(p.look);
    for (const sx of [-1, 1]) {
      // Wide-open eyes in the dark (3x3), the pupil low: watching the ball roll away under him.
      const ex = Math.round(cx + sx * 0.045 * M * p.grow), ey = Math.round(cy) - 1;
      for (let dx = -1; dx <= 1; dx++) for (let dy = 0; dy < 3; dy++) set(ex + dx, ey + dy, D_EYE);
      set(ex, ey + 1 + look, D_FILL);
    }
  }
  g.putImageData(img, 0, 0);
  dCache.set(key, cv);
  return cv;
}

// ---------------------------------------------------------------- the stadium (looking back up the pitch, lights down)

const css = (c: RGB, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
/** Small deterministic hash -> [0, 1). */
const h01 = (i: number, s: number) => {
  const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/** Far end stand (m from the lens) and the side stands' half-width. */
const STAND_Z = 94;
const STAND_X = 46;
/** The backdrop's layer distance (it shifts a couple of px with the truck). */
const Z_BACK = 70;
const BACK_PAD = 60;
let backCv: HTMLCanvasElement | null = null;
let backK = 0;

/**
 * The dark stadium behind him, built once: night above the roof canopies, the far end stand in two tiers (the crowd
 * strip), the side stands receding toward the edges, dead floodlight towers in the far corners.
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
  const sky = g.createLinearGradient(0, 0, 0, 170);
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
  tier(1.2, 11.8, 180);
  {
    const [, ca] = proj(0, 13, STAND_Z), [, cb] = proj(0, 11.8, STAND_Z);
    g.fillStyle = '#0a0716';
    g.fillRect(xl, ca, xr - xl, cb - ca + 0.5);
    const [, wa] = proj(0, 1.2, STAND_Z), [, wb] = proj(0, 0, STAND_Z);
    g.fillStyle = '#06040c';
    g.fillRect(xl, wa, xr - xl, wb - wa + 1);
  }
  for (const side of [-1, 1]) {
    const x0 = side < 0 ? -BACK_PAD : Math.ceil(xr), x1 = side < 0 ? xl : VW + BACK_PAD;
    for (let x = x0; x < x1; x += 2) {
      const Z = (STAND_X * F) / Math.max(1, Math.abs(x + 1 - VW / 2));
      if (Z > STAND_Z) continue;
      const [, ta] = proj(0, 24.5, Z), [, tb] = proj(0, 1.2, Z), [, wb] = proj(0, 0, Z);
      const sx = (Math.floor(Z * 13) % 1500) + 40;
      g.drawImage(crowd, sx, 2, 3, 94, x, ta, 2, tb - ta);
      g.fillStyle = '#06040c';
      g.fillRect(x, tb, 2, wb - tb + 1);
    }
  }
  {
    const [, f0] = proj(0, 28, 90), [, f1] = proj(0, 26.5, 90);
    const edge = (x: number) => proj(0, 28, (STAND_X * F) / Math.abs(x - VW / 2))[1];
    g.fillStyle = '#07050f';
    g.beginPath();
    g.moveTo(-BACK_PAD, -10);
    g.lineTo(VW + BACK_PAD, -10);
    g.lineTo(VW + BACK_PAD, edge(VW + BACK_PAD));
    g.lineTo(xr + 6, f1);
    g.lineTo(xl - 6, f1);
    g.lineTo(-BACK_PAD, edge(-BACK_PAD));
    g.closePath();
    g.fill();
    g.fillStyle = '#0d0a1c';
    g.fillRect(xl - 6, f0, xr - xl + 12, f1 - f0);
  }
  g.globalCompositeOperation = 'multiply';
  g.fillStyle = 'rgb(176,160,200)';
  g.fillRect(-BACK_PAD, 0, W, H);
  g.globalCompositeOperation = 'source-over';
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

/** ~64 phone lights in the dark stands (base points of the backdrop layer, seeded): steady, twinkling slowly. */
const PHONES: { x: number; y: number; c: string; rgb: RGB; ph: number; f: number }[] = [];
function phones() {
  if (PHONES.length) return PHONES;
  for (let i = 0; i < 64; i++) {
    let X: number, Y: number, Z: number;
    if (i % 4 === 3) {
      Z = lerp(56, STAND_Z - 1, h01(i, 3));
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

/** Turf grain (pitch points, seeded). */
const SPECKS: { X: number; Z: number; c: string }[] = [];
function specks() {
  if (SPECKS.length) return SPECKS;
  for (let i = 0; i < 560; i++) {
    const Z = 1.0 + Math.pow(h01(i, 11), 1.5) * 26;
    SPECKS.push({ X: (h01(i, 12) * 2 - 1) * (2 + Z * 0.85), Z, c: h01(i, 13) < 0.5 ? 'rgba(18,56,26,0.55)' : 'rgba(110,190,90,0.24)' });
  }
  return SPECKS;
}

/** The turf: 5 m mowing stripes (horizontal bands), depth haze, grain. Camera layer without the truck. */
function drawTurf(env: Env, cam: Cam) {
  const ctx = env.ctx;
  layer(env, cam, 1e9);
  const L = -BACK_PAD - 40, W = VW + 2 * (BACK_PAD + 40);
  ctx.fillStyle = '#245f2d';
  ctx.fillRect(L, HZ - 4, W, VH - HZ + 60);
  for (let gd = 20; gd < 105; gd += 5) {
    const ya = groundY(Math.max(0.6, gd - LENS_GD)), yb = groundY(gd + 5 - LENS_GD);
    ctx.fillStyle = Math.round(gd / 5) % 2 === 0 ? '#2f8a3c' : '#287a35';
    ctx.fillRect(L, yb, W, Math.min(VH + 60, ya) - yb + 0.5);
  }
  const hz = ctx.createLinearGradient(0, HZ, 0, HZ + 22);
  hz.addColorStop(0, 'rgba(8,10,30,0.55)');
  hz.addColorStop(1, 'rgba(8,10,30,0)');
  ctx.fillStyle = hz;
  ctx.fillRect(L, HZ - 4, W, 26);
  for (const s of specks()) {
    const [x, y] = proj(s.X, 0, s.Z, cam.x);
    if (x < -60 || x > VW + 60 || y > VH + 40) continue;
    ctx.fillStyle = s.c;
    ctx.fillRect(Math.round(x), Math.round(y), s.Z < 3 ? 2 : 1, 1);
  }
}

/** A ground polyline (metres: X, goal-line distance) projected with the truck. */
function groundLine(ctx: CanvasRenderingContext2D, pts: [number, number][], camX: number) {
  ctx.beginPath();
  pts.forEach(([X, gd], i) => {
    const [x, y] = proj(X, 0, Math.max(1, gd - LENS_GD), camX);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  });
  ctx.stroke();
}

/** The pitch markings fluorescing lilac in the dark (after the dim): halfway line, centre circle, touchlines, the far
 *  penalty area and goal, all receding up the pitch behind No.10. */
function drawFluoro(env: Env, cam: Cam) {
  const ctx = env.ctx;
  layer(env, cam, 1e9);
  ctx.save();
  ctx.lineCap = 'butt';
  ctx.strokeStyle = HEX.lilac;
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = 1;
  groundLine(ctx, [[-40, 52.5], [40, 52.5]], cam.x);
  const cc: [number, number][] = [];
  for (let a = 0; a <= TAU + 1e-6; a += TAU / 48) cc.push([Math.sin(a) * 9.15, 52.5 + Math.cos(a) * 9.15]);
  groundLine(ctx, cc, cam.x);
  for (const s of [-1, 1]) groundLine(ctx, [[s * 34, 24], [s * 34, 105]], cam.x);
  groundLine(ctx, [[-20.16, 105], [-20.16, 88.5], [20.16, 88.5], [20.16, 105]], cam.x);
  groundLine(ctx, [[-34, 105], [34, 105]], cam.x);
  ctx.globalAlpha = 0.34;
  const [gx0, gy0] = proj(-3.66, 0, 105 - LENS_GD, cam.x), [gx1] = proj(3.66, 0, 105 - LENS_GD, cam.x), [, gyt] = proj(0, 2.44, 105 - LENS_GD, cam.x);
  ctx.strokeRect(Math.round(gx0) + 0.5, Math.round(gyt) + 0.5, Math.round(gx1 - gx0), Math.round(gy0 - gyt));
  ctx.restore();
}

/** Phone lights: light sources, so after the dim. They lift with the crowd on OLÉ! 4. */
function drawPhones(env: Env, cam: Cam, t: number) {
  const ctx = env.ctx;
  layer(env, cam, Z_BACK);
  const lift = 1 + (t >= T_OLE ? 0.45 * clamp(1 - (t - T_OLE) / 0.4) : 0);
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

/** The white boots glow under the ultraviolet spot: a uvDeep halo, a violet glow, a small ivory core. */
function bootGlow(env: Env, h: Hero) {
  const ctx = env.ctx;
  for (const [bx, by] of bootsOf(env, h.key)) {
    const x = h.x + (bx - PIVOT[0]) * h.sc, y = h.y + (by - PIVOT[1]) * h.sc;
    ctx.globalCompositeOperation = 'source-over';
    drawGlow(ctx, glowOf(PAL.uvDeep), x, y, 9 * h.sc, 0.4);
    drawGlow(ctx, glowOf(PAL.uv), x, y, 6.5 * h.sc, 0.28);
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.ivory), x, y, 3.5 * h.sc, 0.22);
  }
  ctx.globalCompositeOperation = 'source-over';
}

// ---------------------------------------------------------------- module state (reset in init)

const ghosts = new Afterimages(6, 9);
/** Distance from the lens of each ball exposure (same order as ghosts.ball). */
let ballZ: number[] = [];
/** The follow-spot operator: x = his lateral position (m), y = his distance from the lens (m). */
const spot = new FollowSpot(0.06);
let spin = new BallSpin();
let lastT = 0;
let lastRoll = 0;
let fired = { ghost: false, balls: 0 };

const heroWorld = (h: Hero): [number, number] => [((h.x - VW / 2) * h.Z) / F, h.Z];

/** Stage dim outside the pool: 0.8, a touch deeper for the money frame, back as the crowd erupts. */
const dimLevel = (t: number) => 0.8 + 0.05 * ease.inOutQuad(clamp((t - 0.45) / 0.1)) - 0.05 * ease.inOutQuad(clamp((t - 0.75) / 0.1));

// ---------------------------------------------------------------- the shot

export const shotNutmeg: Shot = {
  name: 'Nutmeg',
  dur: DUR,
  seed: 506,
  rate: RATE[6],
  cues: [
    { at: T_TOUCH, fn: (env) => env.sfx.tom(TOMS.F2) },
    { at: T_SINK, fn: (env) => env.sfx.snare(0.3) },
    { at: T_SHAPE, fn: (env) => env.sfx.snare(0.5, 0.15) },
    { at: T_SET, fn: (env) => env.sfx.snare(0.7) },
    {
      at: T_POKE,
      fn: (env) => {
        env.sfx.kickDrum(0.9);
        env.sfx.crash(0.7);
        env.sfx.kick(0.25);
        env.sfx.spotOn(0.12); // the beat flare's lamp tick
      },
    },
    { at: T_LAUGH, fn: (env) => env.sfx.ooh(0.4) },
    {
      at: T_OLE,
      fn: (env) => {
        env.sfx.ole(4);
        env.sfx.crowd(1.5, 0.4);
        env.sfx.tom(TOMS.D3, 0.5, -0.2);
        env.sfx.whoosh(0.2, 300, 1800, 0.3, -0.4);
      },
    },
    { at: T_SIT, fn: (env) => (env.sfx.tom(TOMS.D3, 0.5, -0.35), env.sfx.boom(0.2, 0.5, 0.4)) },
    { at: onGrid(1.0, 'tom C3'), fn: (env) => env.sfx.tom(TOMS.C3, 0.5, -0.5) },
    { at: onGrid(1.1, 'tom A2'), fn: (env) => env.sfx.tom(TOMS.A2, 0.5, -0.65) },
  ],
  prepare(env) {
    warmSolo(env, SEQ[6].map(([, k]) => k), { ghosts: true });
    for (const [, k] of SEQ[6]) bootsOf(env, k);
    backdrop(env);
    phones();
    specks();
    for (let f = 0; f <= Math.round(DUR * 60); f++) dFrame(f);
    for (let r = 6; r <= 20; r++) ballGhost(r);
  },
  init(env) {
    env.sfx.clearBus();
    env.cam.set(VW / 2, VH / 2, 1, 0);
    ghosts.clear();
    ballZ = [];
    spin = new BallSpin();
    const [X, Z] = heroWorld(heroAt(0));
    spot.snap(X, Z);
    lastT = 0;
    lastRoll = 0;
    fired = { ghost: false, balls: 0 };
  },
  update(env, t) {
    env.sfx.hum(HUM[6](t));
    const real = Math.max(0, t - lastT);
    lastT = t;
    // The follow-spot operator: ~60 ms behind him in real time (the pool slides after him round D).
    const [X, Z] = heroWorld(heroAt(t));
    spot.update(X, Z, real);
    // The exposure of THE POKE, left where he stood (it shows once he steps round, 0.55).
    if (!fired.ghost && t >= T_POKE - 1e-6) {
      fired.ghost = true;
      ghosts.dropHero('NM4', VW / 2, groundY(Z_HERO), 1, T_POKE, EXPO_END - T_POKE, { pivot: PIVOT });
    }
    // The ball's strobe: its first four frames off the toe.
    while (fired.balls < BALL_DROPS.length && t >= BALL_DROPS[fired.balls] - 1e-6) {
      const at = BALL_DROPS[fired.balls++];
      const b = ballAt(env, at);
      ghosts.dropBall(b.x, b.y, Math.round(b.r), at, EXPO_END - at);
      ballZ.push(b.Z);
    }
    // Spin locked to the roll (capped per frame so the fast first frames do not alias backwards).
    const r = rolled(t);
    const d = r - lastRoll;
    lastRoll = r;
    if (d > 1e-5) spin.rotate(1, 0, 0, Math.min(0.9, d / BALL_R));
  },
  render(env, t) {
    const ctx = env.ctx;
    soloGrade(env.fx);
    const cam = beatCam(CAM, t);
    const h = heroAt(t);
    const ball = ballAt(env, t);
    const fl = stage.flare(t, FLARES);
    const sZ = spot.y;
    const sk = Z_HERO / sZ; // 1 at x1, 2 at x2
    const sx = VW / 2 + (F * spot.x) / sZ, sy = groundY(sZ);

    // ---- the world in the dark: night, stands, towers, turf
    env.screen();
    ctx.fillStyle = '#05030b';
    ctx.fillRect(0, 0, VW, VH);
    layer(env, cam, Z_BACK);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(backdrop(env), -BACK_PAD, 0, VW + BACK_PAD * 2, HZ + 8);
    ctx.imageSmoothingEnabled = false;
    drawTurf(env, cam);

    // ---- the stage dim, with the hole round him (it follows the operator, not him)
    const [hx, hy] = scr(cam, sZ, sx, sy - 50 * sk);
    const hole: StagePool = { x: hx, y: hy, rx: (118 + 34 * sk) * cam.zoom * fl.size, ry: (104 + 50 * sk) * cam.zoom * fl.size, soft: 46, gain: 1 };
    stage.dim(ctx, dimLevel(t), [hole]);

    // ---- fluorescent accents: pitch lines, phone lights
    drawFluoro(env, cam);
    drawPhones(env, cam, t);

    // ---- the follow-spot: the beam from the main-stand roof behind D, the pool round No.10, the spill through the arch
    {
      layer(env, cam, sZ);
      stage.beam(ctx, 468, -44, sx, sy, 34, 150 * sk * fl.size, 0.16 * fl.gain, { t, motes: 26, seed: 61 });
      stage.floorPool(ctx, sx, sy + 1, 66 * sk * fl.size, 9 * sk * fl.size, 0.34 * fl.gain);
      // The light spills on through the arch toward D's boots (while No.10 is still in it).
      const spill = 1 - clamp((t - 0.72) / 0.12);
      if (spill > 0) {
        layer(env, cam, 2.6);
        stage.floorPool(ctx, VW / 2 + (F * spot.x) / 2.6, 316, 150 * fl.size, 28 * fl.size, 0.2 * spill * fl.gain);
      }
    }

    // ---- exposures (where he poked from; the ball's strobe off his toe)
    layer(env, cam, Z_HERO);
    ghosts.draw(env, t, 'hero');
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ghosts.ball.forEach((e, i) => {
      const a = Afterimages.alpha(e, t);
      if (a <= 0) return;
      layer(env, cam, ballZ[i] ?? Z_HERO);
      const cv = ballGhost(e.r!);
      ctx.globalAlpha = a;
      ctx.drawImage(cv, Math.round(e.x - cv.width / 2), Math.round(e.y - cv.height / 2));
    });
    ctx.restore();

    // ---- No.10: his short shadow straight under him, the drawn frame, his boots glowing
    layer(env, cam, h.Z);
    ctx.fillStyle = css(PAL.plum, 0.5);
    ctx.beginPath();
    ctx.ellipse(h.x, h.y - 0.5, 15 * h.sc, 3 * h.sc, 0, 0, TAU);
    ctx.fill();
    drawSolo(env, h.key, h.x, h.y, h.sc, { pivot: PIVOT });
    bootGlow(env, h);

    // ---- the ball (behind D's plane: before him; past his boots: over him)
    const drawTheBall = () => {
      if (ball.Z < Z_GONE) return;
      layer(env, cam, Math.max(0.05, ball.Z));
      const r = Math.max(2, Math.round(ball.r));
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = css(PAL.plum, 0.5);
      ctx.beginPath();
      ctx.ellipse(ball.x, groundY(Math.max(0.05, ball.Z)) + r * 0.1, r * 0.95, Math.max(1, r * 0.24), 0, 0, TAU);
      ctx.fill();
      const glow = 0.8 * clamp(14 / r, 0.5, 1) * fl.gain;
      drawBall(env, spin, Math.round(ball.x), Math.round(ball.y), r, 1, 0, glow, 'blacklight');
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };
    if (ball.Z >= Z_D) drawTheBall();

    // ---- D: the back-lit arch in the foreground
    {
      layer(env, cam, Z_D);
      const cv = dFrame(Math.min(Math.round(DUR * 60), Math.max(0, Math.round(t * 60))));
      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = 1;
      ctx.drawImage(cv, VW / 2 - DOX * G, groundY(Z_D) - DOY * G, DW * G, DH * G);
    }
    if (ball.Z < Z_D) drawTheBall();

    // ---- HUD: the marquee tag, the four-count (OLÉ! 4: all pads flare)
    env.screen();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    marqueeTag(ctx, 'NUTMEG', 24, 60, t - T_TAG);
    fourCount(ctx, padsFor(6), t, { flareAt: T_OLE });

    // ---- opens out of shot 5's violet ghost wipe
    if (t < 3 / 60 - 1e-6) {
      env.fx.flash = 0.6 * (1 - Math.floor(t * 60 + 1e-6) / 3);
      env.fx.flashColor = [122, 77, 255];
    }
  },
};
