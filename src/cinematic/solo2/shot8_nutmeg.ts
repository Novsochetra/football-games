// SPOTLIGHT SOLO v2 · shot 8 · "Nutmeg" (1.6 s, g 12.0-13.6, seed 518): the false defeat, the crack, the front ride.
// SPEC.md §6 shot 8.
//
// The biggest defender swallows him: the screen goes black and silent, kids gasp. Then the ball CRACKS out through his
// legs in a burst of light, his knees buckle, and we ride in front of it: the ball rushing at the lens, No.10 behind it.
//
// 8a THE GATE (0.00-0.86). Low behind D (eye 0.4 m, looking west with drawUpPitch; the horizon at No.10's shins so he
// stands in the arch against the far stand's phone lights). D is the Tower seen from behind, back-lit: a ~400 px plum
// silhouette whose legs rise from the frame's bottom corners to the crotch at y ~150 and whose arms spread to the edges,
// with lilac rims where No.10's beam spills on his inner legs and a volt rim on his shoulders. He is a code-drawn back
// view (the rig below: the Tower's model-sheet proportions, 1.3x bulk, cropped hair, the captain's armband catching the
// rim), rasterised at 1/3 resolution and drawn nearest so his pixels are 3 px (nearer than No.10's 1.6-2 px), and lit per
// pixel from the light sources (the side puppets cannot show a back view). Beyond the gate No.10 (FrontTouch FT1 ->
// Nutmeg F2-F4 at SC 1.6, 2.0 from the smother) charges in his pool under the drop beam.
//   0.00 (g 12.0, beat 3) out of the chorus wipe (its last copy sweeps off to the right); FT1 touch. Push 1.00 -> 1.06.
//   0.10 / 0.20 / 0.30 a snare crescendo; each hit tightens the frame (punch). 0.20 D sinks wider (legs +10 %, hips
//        drop): NM2, the shoulder dip; tag NUTMEG. 0.30 NM3, the set: his eyes glint up at the giant.
//   0.40 (g 12.4, beat 4) D SMOTHERS HIM on the beat: his head ducks, his back swells over the lens, his arms sweep
//        down and close the gate (half folded on the beat frame, down by 0.48); the frame crashes in; cam.hit 0.5;
//        the cymbal choke, a gasp cut short, a boom.
//   0.48-0.80 BLACK (dim 0.97 + D's back): only a lilac rim along the dome of his back at the top and a few phone
//        lights above it; the back breathes; tk ... tk at 0.60 / 0.70 (the mass shudders: he is still in there);
//        from 0.62 a sliver of light grows at the bottom centre between D's hands (12 -> 60 px, ivory core, motes).
//   0.80 (g 12.8, ONE of bar 8) CRACK. The toe-poke is heard, then seen: MB2 a black silhouette in the gap. THE STACK:
//        1 rate 0.03 for 0.06 s, then 1.4 for 0.20 s; 2 beam impact A (0.800-0.833) in a wide fan out of the gap
//        (apex (0.5, 0.88), axis up, half 0.9; E11); 3 twelve god rays from the gap; 4 the ball blasts out of the light
//        at the lens, r 10 -> 60 in 3 frames, blazing; 5 cam.hit 0.9 (shakeAmp 20), the frame kicked back, CA 0.014,
//        radial 0.25 on the gap, 40 speed streaks (ivory and volt) + sods at the lens; 6 a flat shock at the gap;
//        7 D's knees buckle inward round the light (0.80 snap in, 0.83 fold and drop), the gate collapses.
//   0.86 the ball fills the bottom-right and passes the lens: hard cut on the pass.
//
// 8b THE FRONT RIDE (0.86-1.60). A front retreating ride at turf level, AHEAD of the ball looking back at him (never a
// chase POV behind the ball): drawUpPitch { x ball.x + 6.0 -> 5.2, z ball.z, h 1, f 240, horizon 180, tilt -0.50 }
// travelling east at 7.2 m/s. A real pinhole places the ball (r 50 -> 57 at (320, 306)), the turf flecks and lines
// streaming at the lens, the torn route and the four prints hanging in their trophy spots behind him. No.10 is Break
// BR2 / BR3 at SC 3 (294 px, crown y ~36), his front in shadow (35 %, uv tint), under-lit violet-white by the blazing
// ball (shins, knees, chin, cheekbones), rimmed by the roof spot (hair, shoulders), his eyes two glints in the shadow of
// his brow; his near boots are a forced-perspective MacroBoots layer (MB3 x5) striking the ball from behind on the 8ths.
//   0.86 BR2; the right boot follows through from the poke.
//   1.00 (g 13.0) the right boot strikes (MB3, screen-left), BR3: the ball jolts at the lens, turf spray, volt flecks,
//        a tap gash, cam.hit 0.15.
//   1.10 (g 13.1) THE STROBE FIRES ON D behind him (local pop at his print, 3 frames): print 4 hangs there; the pop lights
//        No.10 from behind (a white-hot rim down his left edge and through his hair) and throws his and the ball's
//        shadows at the lens along the lit turf (2 frames); a dust plume drifts in; D pitches on over C's leg.
//   1.20 (g 13.2, beat 2) TROPHY 4 (the double CLANK) over D's print; all four pads flare; OLÉ! 4 + a roar. The left
//        boot strikes (MB3 mirrored, screen-right).
//   1.30-1.55 the flecks and line segments stream faster (60 flecks), trauma 0.2 -> 0.6, the 32nd snare roll.
//   1.40 the right boot strikes; D lands on his back behind him (boom 0.6).
//   1.50-1.60 his right sole descends onto the crown of the ball from above (MB6, turned across the ball, side and studs
//        to the lens): match cut on the descending sole (shot 9's stop).
//
// Photosensitivity (§4.4): E11 (beam impact A, 2 frames from g 12.80) is the only full-frame event. The black is a
// darkening (not counted); the sliver, the strobe pop (<= 90 px, 3 frames), the trophy clank, the pop's lit turf and the
// god rays are local.

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { clamp, ease, lerp, type RGB } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import {
  DIM_V2, HEX, HUM, PAL, PUPPETS, RATE, SHOTS, TOMS, drawBall, drawPhoneLights, drawPitchLines, drawUpPitch, eyeGlow, flatShockAt, fluoroMask,
  fourCount, holdTrauma, keys, marqueeTag, onFrames, padsFor, projectDecal, punch, soloImpact2, soloPic, soloPoint, soloStage, soloTopLeft,
  spinAt, stage, uvSilhouette, warmBalls, warmSolo, warmSolo2, type DownPitchView, type SoloKey,
} from './common';
import { chorusCanvas, warmChorus } from './chorus';
import { lightGash, turfRip } from './turf';
import { GASHES, PRINTS, type Gash } from './world';

const META = SHOTS[7];
const FR = 1 / 60;
/** The shot's global start (g 12.0, beat 3 of bar 7). */
const G0 = 12.0;

// ---------------------------------------------------------------- beats

const T_DIP = 0.2, T_SET = 0.3, T_SMOTHER = 0.4, T_DOWN = 0.48, T_SLIVER = 0.62, T_CRACK = 0.8, T_BUCKLE2 = 0.8333, T_CUT = 0.86;
const TAPS = [1.0, 1.2, 1.4] as const;
const T_POP = 1.1, T_TROPHY = 1.2, T_SOLE = 1.5;

const h01 = (i: number, s: number) => {
  const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
const decay = (t: number, at: number, len: number) => (t < at ? 0 : 1 - ease.outQuad(clamp((t - at) / len)));
const rgba = (c: readonly number[], a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${clamp(a)})`;

/** The live trauma shake + shove (screen px) of env.cam (the camera itself stays centred at zoom 1, roll 0). */
function shakeOf(env: Env): [number, number] {
  const cam = env.cam;
  cam.zoom = 1;
  cam.rot = 0;
  cam.x = VW / 2;
  cam.y = VH / 2;
  const [u, w] = cam.toUV(cam.x, cam.y);
  return [u * VW - VW / 2, w * VH - VH / 2];
}

// ================================================================ 8a · THE GATE

/** No.10 beyond the gate: the frames of §9.3 (FT1, Nutmeg F2-F4), then MB2 in the gap at the crack. */
const SEQ8A: readonly (readonly [number, SoloKey])[] = [[0, 'FT1'], [T_DIP, 'NM2'], [T_SET, 'NM3'], [T_SMOTHER, 'NM4']];
const keyA = (t: number): SoloKey => {
  let k: SoloKey = 'FT1';
  for (const [at, kk] of SEQ8A) if (t >= at - 1e-6) k = kk;
  return k;
};
/** Front frames pin on the registration (body centre x 64, the soles' bottom edge). */
const PIV: [number, number] = [64, 103];
/** His sprite scale: SC 1.6, 2.0 from the smother (a beat-snap hidden by the fold). */
const SCA = (t: number) => (t >= T_SMOTHER - 1e-6 ? 2 : 1.6);
/** Low behind D (eye 0.4 m) looking west; the principal point low so No.10 (6.4 m away) stands in the arch. */
const V8A: DownPitchView = { x: 1032, z: 262, h: 4, f: 560, horizon: 295, cx: 320, dir: -1 };
/** Where his soles land (stage px): 560·0.4 / 6.4 m below the horizon. */
const FEET_A: [number, number] = [320, 330];
/** The gap between D's legs where the light and the ball burst through (stage px; the impact cone's apex). */
const GAP: [number, number] = [320, 318];

/** The 8a 2D camera: zoom about C, the push, the snare punches, the smother crash, the crack's kick-back, the shake. */
interface XfA {
  z: number;
  cx: number;
  cy: number;
  ox: number;
  oy: number;
}
const C8A: [number, number] = [320, 220];
function foldU(t: number) {
  return t < T_SMOTHER - FR ? 0 : ease.outCubic(clamp((t - T_SMOTHER + FR) / (T_DOWN - T_SMOTHER + FR)));
}
function zoomA(t: number) {
  if (t < T_SMOTHER - FR) {
    return 1 + 0.06 * ease.inOutSine(clamp(t / 0.4)) + punch(t, 0.1, 0.012, FR, 0.09) + punch(t, 0.2, 0.018, FR, 0.09) + punch(t, 0.3, 0.026, FR, 0.09);
  }
  if (t < T_CRACK) return lerp(1.06, 1.16, foldU(t)) + 0.03 * clamp((t - T_DOWN) / (T_CRACK - T_DOWN));
  // The crack: the blast kicks the frame back off D, then it creeps in on the light.
  return keys([[T_CRACK, 1.19], [T_CRACK + 2 * FR, 1.0, 'outExpo'], [T_CUT, 1.03, 'linear']], t);
}
function xfA(env: Env, t: number): XfA {
  const [sx, sy] = shakeOf(env);
  return { z: zoomA(t), cx: C8A[0], cy: C8A[1], ox: sx, oy: sy };
}
const toScrA = (xf: XfA, x: number, y: number): [number, number] => [(x - xf.cx) * xf.z + xf.cx + xf.ox, (y - xf.cy) * xf.z + xf.cy + xf.oy];
function applyXfA(env: Env, xf: XfA) {
  env.screen();
  const ctx = env.ctx;
  ctx.translate(xf.cx + xf.ox, xf.cy + xf.oy);
  ctx.scale(xf.z, xf.z);
  ctx.translate(-xf.cx, -xf.cy);
}

// ---------------------------------------------------------------- D: the Tower from behind (the rig)

/**
 * One pose of D's back-view silhouette (stage px at zoom 1). Flat number arrays so poses interpolate point by point.
 * head [x, y, rx, ry]; torso 10 points (shoulder L, trap L, neck L, neck R, trap R, shoulder R, armpit R, waist R,
 * waist L, armpit L); shorts 7 points (hip L, hip R, hem R outer, hem R inner, crotch, hem L inner, hem L outer);
 * legs [hip x, y, knee x, y, ankle x, y, r hip, r knee, r ankle]; arms [shoulder x, y, elbow x, y, hand x, y, r sh,
 * r elbow, r hand].
 */
interface RigPose {
  head: number[];
  torso: number[];
  shorts: number[];
  legL: number[];
  legR: number[];
  armL: number[];
  armR: number[];
}
/** The wide block (the gate): bowed legs from the bottom corners to the crotch at y ~154, thick arms spread to the edges. */
const GATE: RigPose = {
  head: [320, 4, 31, 35],
  torso: [158, 60, 224, 30, 292, 24, 348, 24, 416, 30, 482, 60, 466, 108, 412, 142, 228, 142, 174, 108],
  shorts: [210, 130, 430, 130, 480, 206, 350, 198, 320, 172, 290, 198, 160, 206],
  legL: [240, 174, 124, 268, 96, 396, 54, 38, 28],
  legR: [400, 174, 516, 268, 544, 396, 54, 38, 28],
  armL: [174, 74, 94, 150, 52, 230, 37, 30, 25],
  armR: [466, 74, 546, 150, 588, 230, 37, 30, 25],
};
const shiftPose = (p: RigPose, f: (k: keyof RigPose, a: number[]) => number[]): RigPose =>
  ({ head: f('head', p.head), torso: f('torso', p.torso), shorts: f('shorts', p.shorts), legL: f('legL', p.legL), legR: f('legR', p.legR), armL: f('armL', p.armL), armR: f('armR', p.armR) });
/** Move every point of a pose's upper body / hips down by dy (legs: the hip only). */
const lower = (p: RigPose, dy: number, legs = true): RigPose =>
  shiftPose(p, (k, a) => {
    const o = a.slice();
    const pts = k === 'head' ? 1 : k === 'legL' || k === 'legR' ? (legs ? 1 : 0) : k === 'armL' || k === 'armR' ? 3 : o.length / 2;
    for (let i = 0; i < pts; i++) o[i * 2 + 1] += dy;
    return o;
  });
/** 0.20: he sinks wider (knees out 10 %, hips and body drop 8 px, the fists lower). */
const SINK: RigPose = shiftPose(lower(GATE, 8), (k, a) => {
  const o = a.slice();
  if (k === 'legL' || k === 'legR') {
    const s = k === 'legL' ? -1 : 1;
    o[2] += 13 * s;
    o[3] += 4;
  }
  if (k === 'armL' || k === 'armR') o[5] += 8;
  return o;
});
/** The smother (folded over him, at the crash zoom): the head ducked inside a back that fills the frame, the arms closed round him. */
const SMOTHER: RigPose = {
  head: [320, 128, 30, 34],
  torso: [-110, 136, 70, 82, 262, 58, 378, 58, 570, 82, 750, 136, 760, 300, 700, 430, -60, 430, -120, 300],
  shorts: [-40, 410, 680, 410, 700, 450, 360, 450, 320, 440, 280, 450, -60, 450],
  legL: [150, 400, 50, 380, 130, 470, 60, 46, 34],
  legR: [490, 400, 590, 380, 510, 470, 60, 46, 34],
  armL: [40, 120, 70, 280, 262, 384, 46, 38, 30],
  armR: [600, 120, 570, 280, 378, 384, 46, 38, 30],
};
/**
 * 0.80: the crack. The blast throws his back up off him (the gate silhouette again, hunched and lower), the arms flung
 * out, and his knees snap inward round the light: the arch becomes a blazing triangle between his shins.
 */
const BUCKLE1: RigPose = shiftPose(lower(GATE, 14), (k, a) => {
  const o = a.slice();
  if (k === 'legL' || k === 'legR') {
    const s = k === 'legL' ? -1 : 1;
    o[2] = 320 + 46 * s;
    o[3] = 268;
    o[4] += -6 * s;
  }
  if (k === 'armL' || k === 'armR') {
    const s = k === 'armL' ? -1 : 1;
    o[2] += 30 * s;
    o[3] -= 26;
    o[4] += 36 * s;
    o[5] -= 60;
  }
  if (k === 'head') o[1] += 10;
  return o;
});
/** 0.83: they fold and his weight drops (18 px): the knees nearly touch. */
const BUCKLE2: RigPose = shiftPose(lower(BUCKLE1, 18), (k, a) => {
  const o = a.slice();
  if (k === 'legL' || k === 'legR') {
    const s = k === 'legL' ? -1 : 1;
    o[2] = 320 + 36 * s;
    o[3] = 286;
  }
  if (k === 'armL' || k === 'armR') {
    o[3] += 10;
    o[5] += 16;
  }
  return o;
});
function mixPoseR(a: RigPose, b: RigPose, u: number): RigPose {
  return shiftPose(a, (k, arr) => arr.map((v, i) => lerp(v, b[k][i], u)));
}
/** D's pose at shot time t (and a little breath / shudder in the black). */
function rigAt(t: number): RigPose {
  if (t < T_DIP) {
    const br = Math.sin(t * 9) * 1.2;
    return shiftPose(GATE, (k, a) => (k === 'torso' || k === 'head' ? a.map((v, i) => (i % 2 ? v + br : v)) : a));
  }
  if (t < T_SMOTHER - FR) return mixPoseR(GATE, SINK, ease.outCubic(clamp((t - T_DIP) / 0.06)));
  if (t < T_CRACK) {
    const u = foldU(t);
    let p = mixPoseR(SINK, SMOTHER, u);
    if (t >= T_DOWN) {
      // The back breathes over him; on each stick it shudders (he is still in there).
      const br = 2 * Math.sin((t - T_DOWN) * 11) + (onFrames(t, 0.6, 2) || onFrames(t, 0.7, 2) ? -3 : 0);
      p = shiftPose(p, (k, a) => (k === 'torso' ? a.map((v, i) => (i % 2 && v < 200 ? v + br : v)) : a));
    }
    return p;
  }
  if (t < T_BUCKLE2) return BUCKLE1;
  return mixPoseR(BUCKLE1, BUCKLE2, ease.outQuad(clamp((t - T_BUCKLE2) / (2 * FR))));
}

// ---- rasterising the rig (1/3 resolution, region ids, per-pixel light)

/** Rig pixel size (stage px) and the buffer's margin. */
const Q = 3, PAD = 33;
const BW = Math.ceil((VW + 2 * PAD) / Q), BH = Math.ceil((VH + 2 * PAD) / Q) + 30;
/** Region ids (red channel / 32) and their back-lit base colours. */
const R_SHIRT = 1, R_SKIN = 2, R_SHORTS = 3, R_SOCK = 4, R_BOOT = 5, R_HAIR = 6, R_BAND = 7, R_CREASE = 8;
const BASE: Record<number, RGB> = {
  [R_SHIRT]: [15, 8, 26], [R_SKIN]: [12, 6, 19], [R_SHORTS]: [8, 4, 15], [R_SOCK]: [19, 12, 30], [R_BOOT]: [6, 3, 11],
  [R_HAIR]: [7, 4, 13], [R_BAND]: [11, 13, 24], [R_CREASE]: [10, 5, 18],
};
/** A light on the rig: a point (x, y) in stage px with a range, or a direction (dx, dy) toward the light when range 0. */
interface RigLight {
  x: number;
  y: number;
  range: number;
  k: number;
  color: RGB;
  /** Rim width in rig pixels (1 or 2). */
  w?: number;
  /** Interior spill (0..1) near the light. */
  spill?: number;
}
let rigCv: HTMLCanvasElement | null = null, rigG: CanvasRenderingContext2D | null = null;
let outCv: HTMLCanvasElement | null = null, outG: CanvasRenderingContext2D | null = null;
let outImg: ImageData | null = null;
let mask: Uint8Array | null = null;

function capsule(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, r0: number, r1: number) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L;
  g.beginPath();
  g.moveTo(x0 + nx * r0, y0 + ny * r0);
  g.lineTo(x1 + nx * r1, y1 + ny * r1);
  g.lineTo(x1 - nx * r1, y1 - ny * r1);
  g.lineTo(x0 - nx * r0, y0 - ny * r0);
  g.closePath();
  g.fill();
  g.beginPath();
  g.arc(x0, y0, r0, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.arc(x1, y1, r1, 0, Math.PI * 2);
  g.fill();
}
function poly(g: CanvasRenderingContext2D, pts: readonly number[]) {
  g.beginPath();
  for (let i = 0; i < pts.length; i += 2) (i ? g.lineTo : g.moveTo).call(g, pts[i], pts[i + 1]);
  g.closePath();
  g.fill();
}
const idFill = (id: number) => `rgb(${id * 28},0,0)`;

/**
 * Draw D's back view for pose p into the rig buffer, light it per pixel and return the coloured canvas (BW x BH rig
 * pixels; stage x = i·Q − PAD). `holes` are stage-space polygons cut out of him (the sliver of light between his hands).
 */
let lastKey = '';
let edge: Uint8Array | null = null;
function renderRig(p: RigPose, lights: readonly RigLight[], holes: readonly number[][] = []): HTMLCanvasElement {
  // The same pose and light (to the rig's pixel) as the last frame: reuse it (the holds, the black between shudders).
  const r1 = (v: number) => Math.round(v);
  const key = [p.head, p.torso, p.shorts, p.legL, p.legR, p.armL, p.armR].map((a) => a.map(r1).join(',')).join('|') + '#' +
    lights.map((L) => `${r1(L.x * 10)},${r1(L.y * 10)},${r1(L.range)},${L.k.toFixed(2)},${L.color.join('.')},${L.w ?? 1},${(L.spill ?? 0).toFixed(2)}`).join(';') + '#' +
    holes.map((h) => h.map(r1).join(',')).join(';');
  if (outCv && key === lastKey) return outCv;
  lastKey = key;
  if (!rigCv) {
    rigCv = document.createElement('canvas');
    rigCv.width = BW;
    rigCv.height = BH;
    rigG = rigCv.getContext('2d', { willReadFrequently: true })!;
    outCv = document.createElement('canvas');
    outCv.width = BW;
    outCv.height = BH;
    outG = outCv.getContext('2d')!;
    outImg = outG.createImageData(BW, BH);
    mask = new Uint8Array(BW * BH);
    edge = new Uint8Array(BW * BH);
  }
  const g = rigG!;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-over';
  g.clearRect(0, 0, BW, BH);
  g.setTransform(1 / Q, 0, 0, 1 / Q, PAD / Q, PAD / Q);
  // Legs (thigh, shin, the sock over the lower shin, the boot off the bottom edge).
  for (const L of [p.legL, p.legR]) {
    const [hx, hy, kx, ky, ax, ay, rh, rk, ra] = L;
    g.fillStyle = idFill(R_SKIN);
    capsule(g, kx, ky, ax, ay, rk * 0.86, ra);
    // The calf (wide from behind) a third of the way down the shin.
    g.beginPath();
    g.arc(lerp(kx, ax, 0.28), lerp(ky, ay, 0.28), rk * 1.04, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = idFill(R_SOCK);
    capsule(g, lerp(kx, ax, 0.42), lerp(ky, ay, 0.42), ax, ay, lerp(rk * 0.86, ra, 0.42) + 1.5, ra + 1.5);
    g.fillStyle = idFill(R_BOOT);
    capsule(g, ax, ay, ax + (ax - kx) * 0.4, ay + (ay - ky) * 0.4, ra + 4, ra + 6);
    g.fillStyle = idFill(R_SKIN);
    capsule(g, hx, hy, kx, ky, rh, rk * 0.92);
    // The thigh's muscle (a bulge a third of the way down, toward the inside) and the knee's knob.
    const tx0 = lerp(hx, kx, 0.36), ty0 = lerp(hy, ky, 0.36);
    const toC = Math.sign(320 - hx) || 1;
    g.beginPath();
    g.arc(tx0 + toC * rh * 0.12, ty0 + rh * 0.05, rh * 0.98, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.arc(kx - toC * rk * 0.1, ky, rk * 0.98, 0, Math.PI * 2);
    g.fill();
  }
  // Shorts, torso, head (hair), arms.
  g.fillStyle = idFill(R_SHORTS);
  poly(g, p.shorts);
  // The gusset: a rounded arch top instead of a peak.
  g.beginPath();
  g.ellipse(p.shorts[8], p.shorts[9] + 4, 17, 12, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = idFill(R_SKIN);
  g.beginPath();
  g.ellipse(p.head[0], p.head[1] + p.head[3] * 0.55, p.head[2] * 0.62, p.head[3] * 0.6, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = idFill(R_HAIR);
  g.beginPath();
  g.ellipse(p.head[0], p.head[1], p.head[2], p.head[3], 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = idFill(R_SHIRT);
  poly(g, p.torso);
  // The spine crease and the shoulder blades (a darker shirt tone).
  g.fillStyle = idFill(R_CREASE);
  const tp = p.torso;
  const nx = (tp[4] + tp[6]) / 2, ny = (tp[5] + tp[7]) / 2 + 12, wx = (tp[14] + tp[16]) / 2, wy = (tp[15] + tp[17]) / 2 - 8;
  capsule(g, nx, ny, wx, wy, 1.5, 2);
  for (const [A, band] of [[p.armL, true], [p.armR, false]] as const) {
    const [sx, sy, ex, ey, hx, hy, rs, re, rh] = A;
    g.fillStyle = idFill(R_SKIN);
    capsule(g, ex, ey, hx, hy, re * 0.82, rh * 0.8);
    g.beginPath();
    g.arc(hx, hy, rh, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = idFill(R_SHIRT);
    capsule(g, sx, sy, lerp(sx, ex, 0.42), lerp(sy, ey, 0.42), rs, lerp(rs, re, 0.42));
    g.fillStyle = idFill(R_SKIN);
    capsule(g, lerp(sx, ex, 0.42), lerp(sy, ey, 0.42), ex, ey, lerp(rs, re, 0.42) * 0.9, re);
    if (band) {
      // The captain's armband (his left arm: screen-left in a back view).
      g.fillStyle = idFill(R_BAND);
      capsule(g, lerp(sx, ex, 0.52), lerp(sy, ey, 0.52), lerp(sx, ex, 0.66), lerp(sy, ey, 0.66), lerp(rs, re, 0.52) * 0.95 + 1, lerp(rs, re, 0.66) * 0.95 + 1);
    }
  }
  g.globalCompositeOperation = 'destination-out';
  g.fillStyle = '#000';
  for (const h of holes) poly(g, h);
  g.globalCompositeOperation = 'source-over';
  g.setTransform(1, 0, 0, 1, 0, 0);
  const src = g.getImageData(0, 0, BW, BH).data;
  const M = mask!;
  for (let i = 0; i < BW * BH; i++) M[i] = src[i * 4 + 3] >= 128 ? Math.max(1, Math.min(8, Math.round(src[i * 4] / 28))) : 0;
  // Pixels within 2 rig px of an empty one (only they can carry a rim): the rest skip the rim search.
  const E = edge!;
  E.fill(0);
  for (let y = 0; y < BH; y++)
    for (let x = 0; x < BW; x++) {
      if (M[y * BW + x]) continue;
      for (let dy = -2; dy <= 2; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= BH) continue;
        for (let dx = -2; dx <= 2; dx++) {
          const xx = x + dx;
          if (xx >= 0 && xx < BW) E[yy * BW + xx] = 1;
        }
      }
    }
  for (let x = 0; x < BW; x++) for (const y of [0, 1, BH - 2, BH - 1]) E[y * BW + x] = 1;
  for (let y = 0; y < BH; y++) for (const x of [0, 1, BW - 2, BW - 1]) E[y * BW + x] = 1;
  const d = outImg!.data;
  const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0], [1, -1], [1, 1], [-1, 1], [-1, -1]] as const;
  for (let y = 0; y < BH; y++)
    for (let x = 0; x < BW; x++) {
      const i = y * BW + x, o = i * 4;
      const id = M[i];
      if (!id) {
        d[o + 3] = 0;
        continue;
      }
      const base = BASE[id] ?? BASE[R_SHIRT];
      let r = base[0], gg = base[1], b = base[2];
      const sx = x * Q - PAD + Q / 2, sy = y * Q - PAD + Q / 2;
      for (const L of lights) {
        let lx: number, ly: number, fall: number;
        if (L.range > 0) {
          const dx = L.x - sx, dy = L.y - sy, dist = Math.hypot(dx, dy) || 1;
          lx = dx / dist;
          ly = dy / dist;
          fall = clamp(1 - dist / L.range);
          if (fall <= 0) continue;
        } else {
          lx = L.x;
          ly = L.y;
          fall = 1;
        }
        // The rim: the edge pixels whose empty neighbour faces the light (1-2 rig px deep).
        let rim = 0;
        if (E[i]) for (const [dx, dy] of DIRS) {
          const c = (dx * lx + dy * ly) / Math.hypot(dx, dy);
          if (c <= 0.35) continue;
          const nx1 = x + dx, ny1 = y + dy;
          const e1 = nx1 < 0 || ny1 < 0 || nx1 >= BW || ny1 >= BH ? 1 : M[ny1 * BW + nx1] ? 0 : 1;
          if (e1) rim = Math.max(rim, c);
          else if ((L.w ?? 1) > 1) {
            const nx2 = x + 2 * dx, ny2 = y + 2 * dy;
            const e2 = nx2 < 0 || ny2 < 0 || nx2 >= BW || ny2 >= BH ? 1 : M[ny2 * BW + nx2] ? 0 : 1;
            if (e2) rim = Math.max(rim, 0.55 * c);
          }
        }
        const k = clamp(rim * fall * L.k * (id === R_BAND ? 1.6 : 1));
        // The armband catches the rim brighter (ivory), everything else takes the light's colour.
        const col = id === R_BAND && k > 0.2 ? PAL.ivory : L.color;
        r = lerp(r, col[0], k);
        gg = lerp(gg, col[1], k);
        b = lerp(b, col[2], k);
        if (L.spill && L.range > 0) {
          const s = L.spill * fall * fall;
          r += L.color[0] * s * 0.18;
          gg += L.color[1] * s * 0.14;
          b += L.color[2] * s * 0.22;
        }
      }
      d[o] = Math.min(255, r);
      d[o + 1] = Math.min(255, gg);
      d[o + 2] = Math.min(255, b);
      d[o + 3] = 255;
    }
  outG!.putImageData(outImg!, 0, 0);
  return outCv!;
}

/**
 * The sliver of light between his hands in the black (0..1 grown): a narrow lens of light at the bottom centre of the
 * SCREEN, 12 -> 60 px wide at the bottom edge, returned in stage px through the inverse of the 2D camera.
 */
function sliverPoly(u: number, xf: XfA): number[] {
  const w = lerp(14, 72, ease.outQuad(u)), h = lerp(34, 70, u);
  const top = 362 - h;
  const scr = [320 - w * 0.12 - 1, top, 320 + w * 0.12 + 1, top, 320 + w * 0.3, top + h * 0.55, 320 + w / 2, 366, 320 - w / 2, 366, 320 - w * 0.3, top + h * 0.55];
  return scr.map((v, i) => (i % 2 ? (v - xf.cy - xf.oy) / xf.z + xf.cy : (v - xf.cx - xf.ox) / xf.z + xf.cx));
}

/** The ball blasting out of the gap at the lens (shot time, the crack): r 10 -> 60 in 3 frames, to the bottom-right. */
function crackBall(t: number): { x: number; y: number; r: number } {
  const u = (t - T_CRACK) / (3 * FR);
  const e = clamp(u);
  const x = lerp(GAP[0], 404, ease.inQuad(e)) + (u > 1 ? (u - 1) * 50 : 0);
  const y = lerp(GAP[1] + 6, 318, ease.inQuad(e)) + (u > 1 ? (u - 1) * 14 : 0);
  return { x, y, r: lerp(10, 60, e) + (u > 1 ? (u - 1) * 18 : 0) };
}

/**
 * Out of the chorus wipe: shot 7 drops its last copy (Break west at x6, contact (580, 426), additive, 0.44 then 0.22 on
 * the 32nds from g 11.95); its last 32nd at 0.22 falls in this shot (0.00-0.05), drawn here the same way so the cut is
 * seamless (the copy and its speed lines, mirrored about its anchor).
 */
const WIPE_TAIL = 0.05;
function drawWipeTail(env: Env, t: number) {
  const ctx = env.ctx;
  const x = 580, y = 150 + 46 * 6, s = 6, a = 0.22 * (t < WIPE_TAIL ? 1 : 0);
  if (a <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 9; k++) {
    const ly = y - 20 * s - 40 * s * h01(k, 3) * 1.2 + 30;
    const len = 80 + 160 * h01(k, 10);
    ctx.fillStyle = rgba(k % 3 ? PAL.volt : PAL.ivory, a * 0.6);
    ctx.fillRect(x - 30 - len, Math.round(ly), len, 1 + (k % 2));
  }
  const cv = chorusCanvas(env, 'BR2', s, 0, -1);
  const [tx, ty] = soloTopLeft(env, 'BR2', x, y, s, { flip: false });
  const S = Math.max(1, Math.round(s * 4) / 4);
  const pad = (2 * s) / S;
  ctx.imageSmoothingEnabled = false;
  ctx.translate(x, 0);
  ctx.scale(-1, 1);
  ctx.translate(-x, 0);
  ctx.globalAlpha = a;
  ctx.drawImage(cv, tx - pad, ty - pad, (cv.width * s) / S, (cv.height * s) / S);
  ctx.restore();
}

// ================================================================ 8b · THE FRONT RIDE

const RIDE0 = T_CUT, RIDE1 = 1.55;
/** The ball's field x: 1016 -> 1066 at 7.2 m/s over the ride, easing into the stop (1069.5 at 1.60). */
function ballX(t: number) {
  if (t < RIDE1) return lerp(1016, 1066, clamp((t - RIDE0) / (RIDE1 - RIDE0)));
  return 1066 + 3.5 * ease.outQuad(clamp((t - RIDE1) / 0.05));
}
const ballZ = (t: number) => lerp(262, 257, clamp((t - RIDE0) / (RIDE1 - RIDE0)));
/** The lens 0.60 -> 0.52 m ahead of the ball (it creeps at the lens), eye 0.1 m, a wide lens tilted 29° up. */
const V8B = (t: number): DownPitchView => ({
  x: ballX(t) + lerp(6.0, 5.2, clamp((t - RIDE0) / 0.74)), z: ballZ(t), h: 1, f: 240, horizon: 180, tilt: -0.5, cx: 320, dir: -1,
});
/** Ball radius in world px (0.11 m). */
const BALL_RW = 1.1;
/** No.10's frames on the 8ths (§9.3), his contact y and scale (crown at ~36). */
const keyB = (t: number): SoloKey => (t < 1.0 - 1e-6 ? 'BR2' : t < 1.2 - 1e-6 ? 'BR3' : t < 1.4 - 1e-6 ? 'BR2' : 'BR3');
const SCB = 3;
const FEET_B: [number, number] = [320, 330];
/** The eye pixels of the Break frames (sprite px: left x, right x, y). */
const EYES_B: Partial<Record<SoloKey, [number, number, number]>> = { BR2: [50.5, 59.5, 30.5], BR3: [49.5, 58.5, 30.5] };

/** The ball on screen: centred at the lens, jolting at the lens on each tap. */
function ballB(t: number) {
  const v = V8B(t);
  const p = projectDecal(ballX(t), ballZ(t), BALL_RW, v);
  const jolt = TAPS.some((a) => t >= a - 1e-6 && t < a + 2 * FR - 1e-6) ? 1 : 0;
  return { x: p.x, y: p.y + jolt * 2, r: BALL_RW * p.s + jolt * 3, v };
}

/** A strike boot (MB3 x5, the right on screen-left, the left mirrored on screen-right): swing in, strike, follow through. */
interface BootState {
  key: SoloKey;
  flip: boolean;
  x: number;
  y: number;
  scale: number;
  a: number;
}
const BOOT_SC = 1.6;
function strikeBoot(t: number, b: { x: number; y: number; r: number }): BootState | null {
  // The poke's follow-through at the cut, then the three strikes.
  const strikes: [number, boolean][] = [[T_CUT - 0.06, false], [1.0, false], [1.2, true], [1.4, false]];
  for (const [T, flip] of strikes) {
    const p = (t - T) / 0.1;
    if (p < -1 || p > 1.2) continue;
    const s = flip ? 1 : -1;
    // Contact: the boot's inside meets the back of the ball on its side.
    const cx = b.x + s * b.r * 0.98, cy = b.y + b.r * 0.3;
    let x = cx, y = cy, sc = BOOT_SC, a = 1;
    if (p < 0) {
      const q = -p;
      x += s * 22 * q;
      y -= 30 * q;
      sc *= 1 - 0.12 * q;
      a = clamp(1.4 - q);
    } else {
      x += s * 14 * p;
      y += 10 * p;
      sc *= 1 - 0.08 * p;
      a = clamp(1.3 - p);
    }
    return { key: 'MB3', flip, x, y, scale: sc, a };
  }
  return null;
}

/** This shot's tap gashes: torn under the striking boot (world-anchored: they recede as the ride goes on). */
const TAP_GASH: readonly Gash[] = TAPS.map((T, i) => ({
  id: `tap8_${i}`, kind: 'claw', x: ballX(T) - 1.4, z: ballZ(T) + (i === 1 ? -1.6 : 1.6), dir: Math.PI + (i === 1 ? -0.25 : 0.25), len: 4.5, claws: 2,
  born: G0 + T, shafts: 3, fuse: -1,
}));
/** D's lateral framing offset in the ride (world px of z; see renderRide step 4). */
const D_DZ = 9;
/** The torn route behind him (the world's gashes already open; the far ones are tiny on the horizon). */
const ROUTE_G = GASHES.filter((g) => g.born < G0 + T_CUT && !g.id.startsWith('tap'));

// ---------------------------------------------------------------- sprite light at native pixels (shot 5's litSprite)

interface Rim {
  dir: readonly [number, number];
  color: RGB;
  a: number;
}
interface Under {
  x: number;
  y: number;
  r: number;
  color: RGB;
  a: number;
}
let litCv: HTMLCanvasElement | null = null, tmpCv: HTMLCanvasElement | null = null;
const rgbOf = (c: readonly number[], k = 1) => `rgb(${Math.round(clamp((c[0] * k) / 255) * 255)},${Math.round(clamp((c[1] * k) / 255) * 255)},${Math.round(clamp((c[2] * k) / 255) * 255)})`;
/**
 * Light a sprite at its own resolution (shadeSprite's multiply, rimLight's light-side rims, underLight's radial light,
 * drawFluoro's whites) into a scratch canvas [0, w) x [0, h) drawn once, scaled nearest: one pixel of rim = one sprite
 * pixel, so the light keeps the pixel grid.
 */
function litSprite(img: HTMLCanvasElement, o: { k: number; tint: RGB; rims?: readonly Rim[]; unders?: readonly Under[]; fluoro?: [HTMLCanvasElement, number]; flip?: boolean; fadeTop?: number }) {
  const w = img.width, h = img.height;
  const size = (cv: HTMLCanvasElement | null) => {
    cv ??= document.createElement('canvas');
    if (cv.width < w || cv.height < h) {
      cv.width = Math.max(cv.width, w);
      cv.height = Math.max(cv.height, h);
    }
    return cv;
  };
  litCv = size(litCv);
  tmpCv = size(tmpCv);
  const g = litCv.getContext('2d')!, q = tmpCv.getContext('2d')!;
  for (const c of [g, q]) {
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.imageSmoothingEnabled = false;
  }
  const put = (c: CanvasRenderingContext2D, dx = 0, dy = 0) => {
    if (o.flip) {
      c.save();
      c.translate(w, 0);
      c.scale(-1, 1);
      c.drawImage(img, -dx, dy);
      c.restore();
    } else c.drawImage(img, dx, dy);
  };
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';
  g.clearRect(0, 0, w + 2, h + 2);
  put(g);
  const maskFill = (fill: string | CanvasGradient, rim?: readonly [number, number]) => {
    q.globalAlpha = 1;
    q.globalCompositeOperation = 'source-over';
    q.clearRect(0, 0, w + 2, h + 2);
    put(q);
    if (rim) {
      const l = Math.hypot(rim[0], rim[1]) || 1;
      q.globalCompositeOperation = 'destination-out';
      put(q, -Math.round(rim[0] / l), -Math.round(rim[1] / l));
    }
    q.globalCompositeOperation = 'source-in';
    q.fillStyle = fill;
    q.fillRect(0, 0, w + 2, h + 2);
  };
  maskFill(rgbOf(o.tint, o.k));
  g.globalCompositeOperation = 'multiply';
  g.drawImage(tmpCv, 0, 0);
  g.globalCompositeOperation = 'lighter';
  for (const r of o.rims ?? []) {
    if (r.a <= 0) continue;
    maskFill(rgbOf(r.color), r.dir);
    g.globalAlpha = clamp(r.a);
    g.drawImage(tmpCv, 0, 0);
  }
  for (const u of o.unders ?? []) {
    if (u.a <= 0 || u.r <= 0) continue;
    const gr = q.createRadialGradient(u.x, u.y, 0, u.x, u.y, u.r);
    gr.addColorStop(0, `rgba(${u.color[0]},${u.color[1]},${u.color[2]},1)`);
    gr.addColorStop(0.5, `rgba(${u.color[0]},${u.color[1]},${u.color[2]},0.45)`);
    gr.addColorStop(1, `rgba(${u.color[0]},${u.color[1]},${u.color[2]},0)`);
    maskFill(gr);
    g.globalAlpha = clamp(u.a);
    g.drawImage(tmpCv, 0, 0);
  }
  if (o.fluoro && o.fluoro[1] > 0) {
    g.globalAlpha = clamp(o.fluoro[1]);
    if (o.flip) {
      g.save();
      g.translate(w, 0);
      g.scale(-1, 1);
      g.drawImage(o.fluoro[0], 0, 0);
      g.restore();
    } else g.drawImage(o.fluoro[0], 0, 0);
  }
  if (o.fadeTop) {
    // Fade the top rows out (a macro shin dissolving into his leg instead of a hard crop).
    const gr = g.createLinearGradient(0, 0, 0, o.fadeTop);
    gr.addColorStop(0, 'rgba(0,0,0,1)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'destination-out';
    g.fillStyle = gr;
    g.fillRect(0, 0, w + 2, o.fadeTop);
  }
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';
  return litCv;
}
function blitLit(ctx: CanvasRenderingContext2D, cv: HTMLCanvasElement, w: number, h: number, x: number, y: number, scale: number, alpha = 1) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = alpha;
  ctx.drawImage(cv, 0, 0, w, h, x, y, w * scale, h * scale);
  ctx.restore();
}
/**
 * The dark bowl rising at both edges of the wide lens (the side stands, struck dark): plum wedges with a faint roof rim
 * and their own phone lights (deterministic, twinkling), drifting outward a little as the ride retreats.
 */
function drawBowl(ctx: CanvasRenderingContext2D, t: number, gt: number, hor: number) {
  const drift = 14 * clamp((t - RIDE0) / 0.74);
  ctx.save();
  for (const side of [-1, 1]) {
    const X = (x: number) => (side < 0 ? x - drift : VW - x + drift);
    const pts: [number, number][] = [[-30, hor + 2], [128, hor - 2], [96, 196], [58, 96], [26, 10], [-30, -30]];
    ctx.fillStyle = 'rgb(15,9,27)';
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), y) : ctx.moveTo(X(x), y)));
    ctx.closePath();
    ctx.fill();
    // The roof edge catching a little light.
    ctx.strokeStyle = 'rgba(122,77,255,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i < 5; i++) (i > 1 ? ctx.lineTo : ctx.moveTo).call(ctx, X(pts[i][0]), pts[i][1]);
    ctx.stroke();
    // Phone lights in the tiers (denser and smaller toward the horizon).
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 110; i++) {
      const v = h01(i, side + 3), u = h01(i, side + 7);
      const y = lerp(hor - 4, 10, Math.pow(v, 0.8));
      const edge = lerp(120, 22, (hor - y) / hor);
      const x = X(lerp(-10, edge, u));
      const tw = 0.55 + 0.45 * Math.sin(gt * (3 + 5 * h01(i, side + 11)) + i);
      ctx.fillStyle = h01(i, side + 13) < 0.25 ? rgba(PAL.ivory, 0.7 * tw) : rgba(PAL.lilac, 0.55 * tw);
      const sz = y < hor - 90 ? 2 : 1;
      ctx.fillRect(Math.round(x), Math.round(y), sz, sz);
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
}

/** Streaming turf flecks (world points on the ground, fixed in the world): they rush at the lens with the ride. */
function drawFlecks(ctx: CanvasRenderingContext2D, t: number, v: DownPitchView, fast: number, lights: readonly { x: number; y: number; r: number; a: number }[]) {
  const v0 = V8B(Math.max(RIDE0, t - (0.025 + 0.03 * fast)));
  const hor = 180 + 240 * Math.tan(0.5);
  const cell = 1.3;
  const x0 = v.x - 26, x1 = v.x - 0.4;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let cx = Math.floor(x0 / cell); cx <= Math.ceil(x1 / cell); cx++)
    for (let cz = Math.floor((v.z - 9) / cell); cz <= Math.ceil((v.z + 9) / cell); cz++) {
      const r = h01(cx, cz * 1.37);
      if (r > 0.42 + 0.25 * fast) continue;
      const wx = (cx + h01(cx, cz)) * cell, wz = (cz + h01(cz, cx)) * cell;
      const p = projectDecal(wx, wz, 0, v);
      if (p.y < hor + 3 || p.y > VH + 40 || p.x < -60 || p.x > VW + 60) continue;
      let L = 0.2;
      for (const l of lights) {
        const d = Math.hypot((p.x - l.x) / l.r, (p.y - l.y) / (l.r * 0.35));
        if (d < 1) L = Math.max(L, (1 - d) * l.a);
      }
      const q = projectDecal(wx, wz, 0, v0);
      const a = clamp(L * (0.5 + 0.7 * h01(cz, cx * 2.1)) * (1 + 0.6 * fast));
      ctx.strokeStyle = r < 0.1 ? rgba(PAL.ivory, a) : r < 0.2 ? rgba(PAL.lilac, a * 0.85) : rgba([90, 170, 90], a * 0.55);
      ctx.lineWidth = Math.max(1, Math.min(3, p.s * 0.05));
      ctx.beginPath();
      ctx.moveTo(Math.round(q.x), Math.round(q.y));
      ctx.lineTo(Math.round(p.x), Math.round(p.y) + 1);
      ctx.stroke();
    }
  ctx.restore();
}

// ================================================================ the shot

const WARM_KEYS: SoloKey[] = ['FT1', 'NM2', 'NM3', 'NM4', 'MB2', 'BR2', 'BR3', 'MB3', 'MB6'];

export const shotNutmeg: Shot = {
  name: META.name,
  dur: META.dur,
  seed: META.seed,
  rate: RATE[8],
  cues: [
    { at: 0, fn: (e) => { e.sfx.tom(TOMS.F2, 0.6); e.sfx.kick(0.25); e.cam.shakeAmp = 10; e.cam.hit(0.12); } },
    ...[0.1, 0.2, 0.3].map((at, i) => ({ at, fn: (e: Env) => { e.sfx.snare(0.3 + 0.2 * i); e.cam.shakeAmp = 10; e.cam.hit(0.06 + 0.04 * i); } })),
    { at: T_DIP, fn: (e) => { e.sfx.scuff(0.35, 0.2); e.sfx.whoosh(0.15, 250, 900, 0.3, 0.2); } },
    {
      at: T_SMOTHER,
      fn: (e) => {
        // D SMOTHERS HIM on the beat: the choke, a gasp cut short, a boom as he lands on us.
        e.sfx.choke();
        e.sfx.gasp(0.8);
        e.sfx.duck(0.95, 0.4);
        e.sfx.boom(0.5);
        e.sfx.whoosh(0.12, 160, 500, 0.4);
        e.cam.shakeAmp = 14;
        e.cam.hit(0.5);
      },
    },
    { at: 0.6, fn: (e) => { e.sfx.sticks(0.4); e.cam.shakeAmp = 4; e.cam.hit(0.08); } },
    { at: 0.7, fn: (e) => { e.sfx.sticks(0.4); e.cam.shakeAmp = 4; e.cam.hit(0.08); } },
    {
      at: T_CRACK,
      fn: (e) => {
        // CRACK (g 12.8): the poke through his legs.
        e.sfx.kick(1.2);
        e.sfx.crack(1.0);
        e.sfx.boom(1.3);
        e.sfx.kickDrum(1.2);
        e.sfx.crash(1.0);
        e.sfx.whoosh(0.3, 200, 3000);
        e.sfx.crowd(2.0, 0.6);
        e.cam.shakeAmp = 20;
        e.cam.hit(0.9);
        e.cam.shove(5, 6);
        // 40 speed streaks (ivory and volt) and sods out of the gap at the lens (screen space; pre-flown so they show
        // through the hit-stop: they hang, then rocket out at rate 1.4).
        const [gx, gy] = toScrA({ z: zoomA(T_CRACK), cx: C8A[0], cy: C8A[1], ox: 0, oy: 0 }, GAP[0], GAP[1]);
        const i0 = e.parts.list.length;
        const r = e.rng;
        for (let i = 0; i < 40; i++) {
          const a = -Math.PI / 2 + r.range(-1.45, 1.45) + (r.next() < 0.3 ? Math.PI : 0) * 0.4, sp = r.range(500, 1300);
          e.parts.spawn({
            kind: PK.Streak, x: gx + r.range(-10, 10), y: gy + r.range(-6, 6), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 1.4, max: r.range(0.3, 0.55),
            s0: r.range(1.5, 3), s1: 0.6, ramp: i % 3 ? 'uv' : 'glass', r0: 0, r1: 0.9, k: 1.8, layer: 1,
          });
        }
        turfRip(e, gx, gy + 20, Math.PI / 2 + 0.35, 1.1, { lens: true, ground: VH + 40, spread: 2.2 });
        for (let i = e.parts.list.length - 1; i >= i0; i--) {
          const p = e.parts.list[i];
          p.x += p.vx * 0.035;
          p.y += p.vy * 0.035;
        }
      },
    },
    {
      at: T_CUT,
      fn: (e) => {
        // The hard cut into the ride: the gate's debris belongs to the other camera.
        e.parts.clear();
        e.sfx.whoosh(0.2, 600, 2400, 0.5, 0.6);
        e.cam.shakeAmp = 12;
      },
    },
    ...TAPS.map((at, i) => ({
      at,
      fn: (e: Env) => {
        e.sfx.tom([TOMS.D3, TOMS.C3, TOMS.A2][i], 0.6, i === 1 ? 0.3 : -0.3);
        e.sfx.kick(0.3);
        e.sfx.rip(0.4, i === 1 ? 0.3 : -0.3);
        e.cam.shakeAmp = 12;
        e.cam.hit(0.15);
        // The tap: turf spray and volt flecks at the lens from under the boot.
        const b = ballB(at);
        const s = i === 1 ? 1 : -1;
        const x = b.x + s * b.r * 0.8, y = b.y + b.r * 0.85;
        turfRip(e, x, y, Math.PI / 2 + s * 0.5, 0.45, { lens: true, ground: VH + 30, spread: 1.6 });
        const r = e.rng;
        for (let k = 0; k < 14; k++) {
          const a = -Math.PI / 2 + s * r.range(0.2, 1.4), sp = r.range(200, 520);
          e.parts.spawn({
            kind: PK.Streak, x: x + r.range(-6, 6), y: y - r.range(0, 10), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, ay: 600, drag: 2.5,
            max: r.range(0.15, 0.35), s0: r.range(1.2, 2.2), s1: 0.4, ramp: 'uv', r0: 0, r1: 1, k: 1.2, layer: 1,
          });
        }
      },
    })),
    {
      at: T_POP,
      fn: (e) => {
        // D's strobe pop behind him; a dust plume drifts in at the bottom edge.
        e.sfx.boom(1.0);
        e.sfx.crack(0.5);
        e.sfx.strobeZap(0.8);
        e.sfx.gasp(0.6);
        e.cam.shakeAmp = 12;
        e.cam.hit(0.3);
        const r = e.rng;
        for (let i = 0; i < 18; i++) {
          e.parts.spawn({
            kind: PK.Smoke, x: r.range(60, 600), y: VH + r.range(-6, 14), vx: r.range(-40, 40), vy: r.range(-70, -20), drag: 1.2, max: r.range(0.5, 0.9),
            s0: r.range(14, 22), s1: r.range(40, 70), ramp: 'dust', r0: 0.3, r1: 1, a0: 0.22, a1: 0, add: false, layer: 1,
          });
        }
      },
    },
    { at: T_TROPHY, fn: (e) => { e.sfx.exhibit(1.1); e.sfx.ole(4); e.sfx.roar(1.2, 0.5); e.cam.hit(0.25); } },
    { at: T_TROPHY + FR, fn: (e) => e.sfx.exhibit(1.1) },
    { at: 1.4, fn: (e) => e.sfx.boom(0.6) },
    ...[1.3, 1.35, 1.4, 1.45, 1.5, 1.55].map((at, i) => ({ at, fn: (e: Env) => e.sfx.snare(0.3 + 0.14 * i) })),
    { at: T_SOLE, fn: (e) => e.sfx.whoosh(0.1, 300, 1200, 0.35) },
  ],
  prepare(env) {
    warmSolo2();
    warmBalls([10, 17, 27, 43, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60]);
    warmSolo(env, WARM_KEYS, { fluoro: true });
    warmChorus(env, ['BR2'], [6]);
    uvSilhouette(soloPic(env, 'MB2'), 1, -1, [8, 3, 16], PAL.spot);
    for (const p of PRINTS) p.warm([0.25, 0.35, 0.5, 0.75, 1]);
    renderRig(GATE, []);
  },
  init(env) {
    env.sfx.clearBus();
    env.cam.set(VW / 2, VH / 2, 1, 0);
    env.cam.shakeRoll = 0.015;
    env.cam.shakeAmp = 12;
    PUPPETS.frame();
  },
  update(env, t, dt) {
    env.sfx.hum(HUM[8](t), 0.025);
    const r = env.rng;
    // Motes rising in the sliver of light under him (the light is alive in the black).
    if (t >= T_SLIVER && t < T_CRACK) {
      const xf = { z: zoomA(t), cx: C8A[0], cy: C8A[1], ox: 0, oy: 0 };
      const [sx, sy] = toScrA(xf, 320, 350);
      if (r.next() < 0.6)
        env.parts.spawn({
          kind: PK.Glow, x: sx + r.range(-6, 6), y: sy + r.range(0, 10), vx: r.range(-8, 8), vy: r.range(-60, -25), drag: 0.5, max: r.range(0.3, 0.5),
          s0: 1.5, s1: 3, ramp: 'mote', r0: 0, r1: 1, a0: 0.8, a1: 0, layer: 1,
        });
    }
    // The ride: the trauma builds into the stop.
    if (t >= 1.3 && t < 1.55) holdTrauma(env.cam, lerp(0.2, 0.6, (t - 1.3) / 0.25));
    void dt;
  },
  render(env, t) {
    PUPPETS.frame();
    if (t < T_CUT) renderGate(env, t);
    else renderRide(env, t);
  },
};

// ================================================================ 8a render

function renderGate(env: Env, t: number) {
  const { ctx, fx } = env;
  const gt = G0 + t;
  const xf = xfA(env, t);
  const S = (x: number, y: number) => toScrA(xf, x, y);
  const black = t >= T_DOWN && t < T_CRACK;
  const crack = t >= T_CRACK;
  const fold = foldU(t);
  const impactF = onFrames(t, T_CRACK, 2);

  // ---- 1 · the stadium beyond the gate (drawUpPitch, banks dead), struck to plum-black, and the dim.
  env.screen();
  ctx.fillStyle = HEX.void;
  ctx.fillRect(0, 0, VW, VH);
  applyXfA(env, xf);
  drawUpPitch(ctx, env.art.stadium, V8A, gt, { towers: [0, 0, 0, 0], ambientFlashes: false });
  {
    const g = ctx.createLinearGradient(0, V8A.horizon - 150, 0, V8A.horizon + 6);
    g.addColorStop(0, 'rgba(8,3,16,0.95)');
    g.addColorStop(0.8, 'rgba(8,3,16,0.82)');
    g.addColorStop(1, 'rgba(8,3,16,0.5)');
    ctx.fillStyle = g;
    ctx.fillRect(-200, -200, VW + 400, V8A.horizon + 206);
  }
  const [fx0, fy0] = S(FEET_A[0], FEET_A[1]);
  if (black) stage.dim(ctx, 0.97, [], { uncapped: true });
  else stage.dim(ctx, 0.94, [{ x: fx0, y: fy0, rx: 80 * xf.z, ry: 26 * xf.z, soft: 40, gain: 0.9 }], { max: DIM_V2 });

  // ---- 2 · the lights beyond the gate (stage space): phone lights, his drop beam and pool.
  applyXfA(env, xf);
  drawPhoneLights(ctx, env.art.stadium, 0, gt, black ? 0.35 : 0.9, { n: 300, view: V8A, sway: true });
  if (!black) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawPitchLines(ctx, V8A, crack ? 0.2 : 0.35, 'rgba(201,182,255,0.75)');
    ctx.restore();
  }
  if (!black && !crack) {
    stage.pillar(ctx, { x0: 334, y0: -60, x1: FEET_A[0], y1: FEET_A[1] + 2, w0: 44, w1: 150, a: 1, t, pumps: [0, 0.1, 0.2, 0.3], motes: 26, seed: 81, core: 0.32 });
    stage.pool(ctx, FEET_A[0], FEET_A[1] + 2, 82, 13, 1);
  }

  // ---- 3 · No.10 beyond the gate (hidden by the smother), his ball, his eyes on the giant.
  if (t < T_DOWN) {
    const key = keyA(t);
    const sc = SCA(t);
    const pic = soloPic(env, key);
    const bob = onFrames(t, 0, 2) || onFrames(t, T_DIP, 2) || onFrames(t, T_SET, 2) ? 1 : 0;
    const [tx, ty] = soloTopLeft(env, key, FEET_A[0], FEET_A[1] + bob, sc, { pivot: PIV });
    const [bx, by] = soloPoint(env, key, 'ball', FEET_A[0], FEET_A[1] + bob, sc, { pivot: PIV });
    const nat = (x: number, y: number): [number, number] => [(x - tx) / sc, (y - ty) / sc];
    const [ubx, uby] = nat(bx, by);
    const cv = litSprite(pic.img, {
      k: 0.86, tint: [242, 236, 255],
      rims: [{ dir: [0.05, -1], color: PAL.spot, a: 0.85 }, { dir: [-1, 0.2], color: PAL.volt, a: 0.35 }, { dir: [1, 0.2], color: PAL.volt, a: 0.35 }],
      unders: [{ x: ubx, y: uby, r: 60, color: PAL.lilac, a: 0.45 }],
      fluoro: [fluoroMask(pic), 0.4],
    });
    blitLit(ctx, cv, pic.w, pic.h, tx, ty, sc);
    drawBall(env, spinAt(1.4 * t + 0.4, 0.3, 1, 0.2), Math.round(bx), Math.round(by), Math.round(6 * sc), 1, 0, 0.5, 'blacklight', undefined, { blaze: 0.7, blazeR: 42 });
    // 0.30: the set; his eyes glint up at the giant.
    if (t >= T_SET && t < T_SMOTHER) {
      const [cx0, cy0] = soloPoint(env, key, 'head', FEET_A[0], FEET_A[1], sc, { pivot: PIV });
      eyeGlow(ctx, cx0 - 1, cy0 + 8 * sc, { gap: 8 * sc, a: 0.9 * decay(t, T_SET, 0.1), cross: 26, halo: 10, px: 2 });
    }
  }

  // ---- 4 · the light behind the gate at the crack, MB2 (the poke) black in the gap.
  if (crack) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const k = lerp(1, 0.75, clamp((t - T_CRACK) / 0.06));
    drawGlow(ctx, glowOf(PAL.volt), GAP[0], GAP[1] + 20, 420, 0.75 * k);
    drawGlow(ctx, glowOf(PAL.ivory), GAP[0], GAP[1] + 26, 230, 0.95 * k);
    drawGlow(ctx, glowOf(PAL.spot), GAP[0], GAP[1] + 30, 120, 1 * k);
    ctx.restore();
    if (t < T_CRACK + 3 * FR) {
      const pic = soloPic(env, 'MB2');
      const sil = uvSilhouette(pic, 1, -1, [8, 3, 16], PAL.spot);
      const [ax, ay] = pic.anchor('toe');
      const sc = 0.9;
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(sil, GAP[0] - ax * sc, GAP[1] + 4 - ay * sc, sil.width * sc, sil.height * sc);
      ctx.restore();
    }
  }

  // ---- 5 · D: the Tower's back, lit per pixel from the light beyond him.
  {
    const p = rigAt(t);
    const lights: RigLight[] = [];
    if (crack) {
      lights.push({ x: GAP[0], y: GAP[1] + 20, range: 520, k: 2.2, color: PAL.spot, w: 2, spill: 1.2 });
      lights.push({ x: 0, y: -1, range: 0, k: 0.5, color: PAL.volt });
    } else if (black) {
      lights.push({ x: 0, y: -1, range: 0, k: 0.75, color: PAL.lilac });
      if (t >= T_SLIVER) lights.push({ x: 320, y: 342, range: 150, k: 1.4 * clamp((t - T_SLIVER) / 0.06), color: PAL.lilac, w: 2, spill: 0.6 });
    } else {
      const arch = 1 - fold;
      lights.push({ x: FEET_A[0], y: FEET_A[1] - 70, range: 300, k: 1.5 * arch, color: PAL.lilac, w: 2, spill: 0.5 * arch });
      lights.push({ x: FEET_A[0], y: FEET_A[1] - 70, range: 185, k: 1.5 * arch, color: PAL.spot });
      lights.push({ x: 0, y: -1, range: 0, k: 0.55, color: PAL.uv });
      if (fold > 0) lights.push({ x: 0, y: -1, range: 0, k: 0.4 * fold, color: PAL.lilac });
    }
    const holes = black && t >= T_SLIVER ? [sliverPoly(clamp((t - T_SLIVER) / (T_CRACK - T_SLIVER)), xf)] : [];
    const cv = renderRig(p, lights, holes);
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(cv, -PAD, -PAD, BW * Q, BH * Q);
    ctx.restore();
  }

  // ---- 6 · the sliver in the black (screen space: ivory core, volt edges, motes, a faint fan of light up the dark).
  if (black && t >= T_SLIVER) {
    const u = clamp((t - T_SLIVER) / (T_CRACK - T_SLIVER));
    const pulse = 1 + 0.35 * (decay(t, 0.7, 0.08) + decay(t, 0.6, 0.08));
    const st = sliverPoly(u, xf);
    const pts = st.map((v, i) => (i % 2 ? S(st[i - 1], v)[1] : S(v, st[i + 1])[0]));
    env.screen();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const gr = ctx.createLinearGradient(0, 366, 0, pts[1]);
    gr.addColorStop(0, rgba(PAL.spot, 0.95));
    gr.addColorStop(0.45, rgba(PAL.ivory, 0.8 * pulse));
    gr.addColorStop(1, rgba(PAL.volt, 0.35));
    ctx.fillStyle = gr;
    poly(ctx, pts);
    drawGlow(ctx, glowOf(PAL.uv), 320, 362, lerp(60, 200, u), 0.5 * pulse, 1, 0.35);
    drawGlow(ctx, glowOf(PAL.volt), 320, 360, lerp(34, 120, u), 0.65 * pulse, 1, 0.6);
    drawGlow(ctx, glowOf(PAL.ivory), 320, 362, lerp(14, 46, u), 0.9 * pulse, 1, 0.7);
    stage.godRays(ctx, 320, 366, 6, 50, lerp(70, 170, u), 3, 0.2 * u * pulse, -Math.PI / 2, 23, 0.8);
    ctx.restore();
    applyXfA(env, xf);
  }

  // ---- 7 · the crack: god rays out of the gap, the ball at the lens.
  if (crack) {
    ctx.save();
    stage.godRays(ctx, GAP[0], GAP[1], 12, 140, 460, 18, 0.5 * lerp(1, 0.7, clamp((t - T_CRACK) / 0.06)), -Math.PI / 2, 37, Math.PI * 1.05, 0.15);
    ctx.restore();
    stage.splash(ctx, GAP[0], GAP[1] + 14, 30, 260, 0.22, T_CRACK + 2 * FR, t, 1);
    const b = crackBall(t);
    drawBall(env, spinAt(t * 26, 1, 0.2, 0), Math.round(b.x), Math.round(b.y), Math.round(b.r), 1, 0, 1, 'blacklight', undefined, { blaze: 1, blazeR: b.r * 2.6 });
  }

  // ---- 8 · the chorus wipe's last copy leaving (continuity out of shot 7), particles.
  env.screen();
  if (t < WIPE_TAIL) drawWipeTail(env, t);
  env.parts.draw(ctx, 0);
  env.parts.draw(ctx, 1);

  // ---- 9 · HUD.
  fourCount(ctx, padsFor(8), t);
  marqueeTag(ctx, 'NUTMEG', 30, 300, t - T_DIP);

  // ---------------------------------------------------------------- post
  soloStage(fx);
  if (black) {
    fx.bloom = 1.1;
    fx.vignette = 0.75;
  }
  const [gu, gv] = S(GAP[0], GAP[1]);
  if (impactF) soloImpact2(fx, 'A', { x: gu / VW, y: gv / VH, dx: 0, dy: -1, half: 0.9 }); // E11
  if (crack) {
    flatShockAt(fx, gu / VW, gv / VH, T_CRACK, t, 0.06, 0.3, 0.4);
    fx.radial = 0.25 * (1 - clamp((t - T_CRACK) / 0.06));
    fx.radialX = gu / VW;
    fx.radialY = gv / VH;
    fx.ca = Math.max(fx.ca, 0.002 + 0.012 * decay(t, T_CRACK, 0.12));
    fx.bloom = 1.25;
  }
}

// ================================================================ 8b render

function renderRide(env: Env, t: number) {
  const { ctx, fx } = env;
  const gt = G0 + t;
  const [shx, shy] = shakeOf(env);
  const b = ballB(t);
  const v = b.v;
  const P = (x: number, z: number, h = 0) => projectDecal(x, z, h, v);
  const fast = clamp((t - 1.3) / 0.25);
  const popK = t >= T_POP - 1e-6 && t < T_POP + 3 * FR - 1e-6 ? 1 - (t - T_POP) / (3 * FR) : 0;
  const pop2 = t >= T_POP - 1e-6 && t < T_POP + 2 * FR - 1e-6;
  const pd = PRINTS[3];
  const dPr = P(pd.def.print.x, pd.def.print.z + D_DZ, pd.def.print.h);
  // A slight punch on each tap and the pop (the 2D layer over the pinhole).
  const z = 1 + TAPS.reduce((a, s) => a + punch(t, s, 0.025, FR, 0.1), 0) + punch(t, T_POP, 0.02, FR, 0.12) + punch(t, T_CUT, 0.05, FR, 0.14);
  // The operator running backward ahead of the ball: a bob on his strides (the 8ths) and a slow lateral drift.
  const ph = (t - RIDE0) / 0.2;
  const bobY = 2.5 * Math.abs(Math.sin(Math.PI * ph)) - 1.2, bobX = 6 * Math.sin((t - RIDE0) * 4.2);
  const apply = () => {
    env.screen();
    ctx.translate(320 + shx + bobX, 230 + shy + bobY);
    ctx.scale(z, z);
    ctx.translate(-320, -230);
  };

  // ---- 1 · the stadium (turf level, tilted up), struck dark; the dim with his pool and the trophy pools.
  env.screen();
  ctx.fillStyle = HEX.void;
  ctx.fillRect(0, 0, VW, VH);
  apply();
  drawUpPitch(ctx, env.art.stadium, v, gt, { towers: [0, 0, 0, 0], ambientFlashes: false });
  const hor = 180 + 240 * Math.tan(0.5);
  {
    const g = ctx.createLinearGradient(0, hor - 160, 0, hor + 2);
    g.addColorStop(0, 'rgba(8,3,16,0.96)');
    g.addColorStop(0.75, 'rgba(8,3,16,0.85)');
    g.addColorStop(1, 'rgba(8,3,16,0.5)');
    ctx.fillStyle = g;
    ctx.fillRect(-200, -200, VW + 400, hor + 202);
  }
  const toS = (x: number, y: number): [number, number] => [(x - 320) * z + 320 + shx + bobX, (y - 230) * z + 230 + shy + bobY];
  const pools = [
    { x: toS(320, 336)[0], y: toS(320, 336)[1], rx: 190 * z, ry: 34 * z, soft: 50, gain: 0.85 },
    { x: toS(b.x, b.y)[0], y: toS(b.x, b.y)[1], rx: 110 * z, ry: 90 * z, soft: 60, gain: 0.55 },
  ];
  for (const pr of PRINTS) {
    if (gt < pr.def.trophyAt) continue;
    const q = P(pr.def.print.x, pr.def.print.z);
    const [qx, qy] = toS(q.x, q.y);
    pools.push({ x: qx, y: qy, rx: Math.max(14, 45 * q.s * 0.25) * z, ry: 10 * z, soft: 20, gain: 0.7 });
  }
  stage.dim(ctx, 0.92, pools, { max: DIM_V2 });

  // ---- 2 · lights in the dark: phone lights on the far stand, the fluorescent lines and flecks streaming at the lens.
  apply();
  drawBowl(ctx, t, gt, hor);
  drawPhoneLights(ctx, env.art.stadium, 0, gt, 0.95, { n: 300, view: v, sway: true, jump: t >= T_TROPHY && t < T_TROPHY + 3 * FR ? 2 : 0 });
  ctx.save();
  // Only the near lines (the far ones pile up into a flat band on the horizon).
  ctx.beginPath();
  ctx.rect(-200, hor + 7, VW + 400, VH);
  ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  drawPitchLines(ctx, v, 0.55 + 0.25 * fast, 'rgba(201,182,255,0.9)');
  ctx.restore();
  drawFlecks(ctx, t, v, fast, [{ x: b.x, y: b.y + b.r, r: 260, a: 0.9 }, { x: 320, y: 340, r: 300, a: 0.5 }]);

  // ---- 3 · the torn route behind him and the tap gashes under his boots.
  // (Only what lies at least 0.4 m in front of the lens: the nutmeg line ends right under it as the ride begins.)
  for (const g of ROUTE_G) if (g.x + Math.max(0, Math.cos(g.dir)) * g.len + 1 < v.x - 4) lightGash(ctx, g, P, gt, { a: 0.9 });
  for (const g of TAP_GASH) if (gt >= g.born) lightGash(ctx, g, P, gt, { erupt: 0.5 * decay(gt, g.born, 0.25) });

  // ---- 4 · the trophy spots and the four prints over their bodies (far to near), D's pop. The lens is a hand's width
  // off the route's line, so D (and C beside him) are framed 0.9 m wider than the route puts them: just past No.10's
  // right side (screen-left) instead of hidden behind his body.
  const offZ = (pr: (typeof PRINTS)[number]) => (pr === pd ? D_DZ : pr === PRINTS[2] ? D_DZ * 0.6 : 0);
  const order = [...PRINTS].sort((a, c) => a.def.print.x - c.def.print.x);
  for (const pr of order) {
    if (gt >= pr.def.trophyAt) {
      const q = P(pr.def.print.x, pr.def.print.z + offZ(pr));
      stage.trophy(ctx, q.x, q.y, clamp(q.s * 0.22, 0.25, 1.1), pr.def.trophyAt - G0, t, { top: -80, seed: 60 + pr.def.print.x });
    }
  }
  for (const pr of order) {
    const isD = pr === pd;
    const lit = isD ? (gt >= pr.def.trophyAt ? 0.3 : 0) : 0.25;
    const dz = offZ(pr);
    pr.draw(ctx, dz ? (x, z, h = 0) => P(x, z + dz, h) : P, gt, { printAlpha: isD ? 1 : 0.6, lit });
  }
  if (gt >= pd.def.popAt) {
    // D's fresh print burns hot: an ivory core and a volt bloom on the neon (settling as the trophy spot takes over).
    const hot = 1 - clamp((gt - pd.def.popAt) / 0.35);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.volt), dPr.x, dPr.y, 26 + 30 * dPr.s * 0.25, 0.35 + 0.35 * hot);
    drawGlow(ctx, glowOf(PAL.ivory), dPr.x, dPr.y, 12 + 14 * dPr.s * 0.25, 0.2 + 0.45 * hot);
    ctx.restore();
  }

  // ---- 5 · his drop beam behind him and his pool (the roof follow-spot rims his hair and shoulders).
  stage.pillar(ctx, { x0: 352, y0: -70, x1: 320, y1: 340, w0: 40, w1: 230, a: 0.7, t: gt, pumps: TAPS.map((s) => G0 + s), motes: 22, seed: 88, core: 0.28 });
  stage.pool(ctx, 320, 338, 120, 14, 0.6);

  // ---- 6 · No.10: Break at SC 3, his front in shadow, under-lit by the ball, rimmed from behind.
  const key = keyB(t);
  const pic = soloPic(env, key);
  const dip = TAPS.some((a) => t >= a - 1e-6 && t < a + 3 * FR - 1e-6) ? 2 : 0;
  const [tx, ty] = soloTopLeft(env, key, FEET_B[0], FEET_B[1] + dip, SCB, { pivot: PIV });
  {
    const nat = (x: number, y: number): [number, number] => [(x - tx) / SCB, (y - ty) / SCB];
    const [ubx, uby] = nat(b.x, b.y);
    const rims: Rim[] = [
      { dir: [0.1, -1], color: PAL.spot, a: 0.95 },
      { dir: [-0.8, -0.6], color: PAL.lilac, a: 0.45 },
      { dir: [0.8, -0.6], color: PAL.lilac, a: 0.45 },
    ];
    if (popK > 0) rims.push({ dir: [-1, -0.3], color: PAL.spot, a: 1 }, { dir: [-0.6, -0.8], color: PAL.spot, a: 1 });
    const cv = litSprite(pic.img, {
      k: 0.36, tint: [150, 122, 255], rims,
      unders: [{ x: ubx, y: uby, r: 100, color: PAL.lilac, a: 0.95 }, { x: ubx, y: uby - 6, r: 40, color: PAL.spot, a: 0.55 }],
      fluoro: [fluoroMask(pic), 0.5],
    });
    apply();
    blitLit(ctx, cv, pic.w, pic.h, tx, ty, SCB);
    // His eyes: two glints in the shadow of his brow.
    const ey = EYES_B[key];
    if (ey) {
      const ex = tx + ((ey[0] + ey[1]) / 2) * SCB, eyy = ty + ey[2] * SCB;
      const tapGlint = TAPS.some((a) => t >= a - 1e-6 && t < a + 4 * FR) ? 1 : 0;
      eyeGlow(ctx, ex, eyy, { gap: (ey[1] - ey[0]) * SCB, a: 0.75 + 0.25 * tapGlint, cross: 14 + 16 * tapGlint, halo: 12, px: 2 });
    }
  }
  // The pop throws his and the ball's shadows at the lens along the lit turf (2 frames).
  if (pop2) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.lilac), 250, 336, 260, 0.55, 1, 0.16);
    drawGlow(ctx, glowOf(PAL.spot), 230, 330, 140, 0.4, 1, 0.14);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(8,3,16,0.88)';
    poly(ctx, [298, 334, 342, 334, 452, 420, 372, 420]);
    poly(ctx, [b.x - b.r * 0.7, b.y + b.r * 0.9, b.x + b.r * 0.7, b.y + b.r * 0.9, b.x + b.r * 2.2, 430, b.x + b.r * 0.6, 430]);
    ctx.restore();
  }

  // The taps light the turf under the ball (a filled light splash, never a ring).
  for (const T of [T_CUT, ...TAPS]) stage.splash(ctx, b.x, b.y + b.r * 0.92, 40, 210, 0.16, T, t, 0.85);
  // OLÉ 4: camera flashes pop in the bowl (local, a few a beat).
  if (t >= T_TROPHY) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) {
      const at = T_TROPHY + 0.09 * i + 0.03 * h01(i, 71);
      const age = t - at;
      if (age < 0 || age >= 0.07) continue;
      const side = i % 2 ? 1 : -1;
      const fy = lerp(hor - 8, 60, h01(i, 72));
      const fxx = side < 0 ? lerp(4, lerp(120, 26, (hor - fy) / hor), h01(i, 73)) : VW - lerp(4, lerp(120, 26, (hor - fy) / hor), h01(i, 73));
      drawGlow(ctx, glowOf([255, 255, 255]), fxx, fy, 7, 1 - age / 0.07);
    }
    ctx.restore();
  }

  // ---- 7 · the striking boot (the forced-perspective macro layer), the ball, the descending sole.
  const boot = strikeBoot(t, b);
  if (boot) {
    const bp = soloPic(env, boot.key);
    const [bx0, by0] = soloTopLeft(env, boot.key, boot.x, boot.y, boot.scale, { anchor: 'boot', flip: boot.flip });
    // Native pixels of the lit (already mirrored) canvas.
    const ux = (b.x - bx0) / boot.scale, uy = (b.y - by0) / boot.scale;
    const cv = litSprite(bp.img, {
      k: 0.42, tint: [150, 122, 255], flip: boot.flip, fadeTop: 34,
      rims: [{ dir: [0, -1], color: PAL.spot, a: 0.7 }],
      unders: [{ x: ux, y: uy, r: 70, color: PAL.lilac, a: 1 }, { x: ux, y: uy, r: 34, color: PAL.spot, a: 0.6 }],
      fluoro: [fluoroMask(bp), 0.85],
    });
    blitLit(ctx, cv, bp.w, bp.h, bx0, by0, boot.scale, boot.a);
  }
  // Uv spin streaks round the ball, then the blazing ball (a 300 px halo; it lights his front from below).
  {
    const spin = 30 * (t - RIDE0);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const a0 = spin * 0.6 + (i * Math.PI) / 2;
      ctx.strokeStyle = rgba(i % 2 ? PAL.volt : PAL.lilac, 0.55);
      ctx.beginPath();
      ctx.ellipse(b.x, b.y, b.r * 1.12, b.r * 1.12, 0, a0, a0 + 0.9);
      ctx.stroke();
    }
    ctx.restore();
    drawBall(env, spinAt(spin, 1, 0, 0.1), Math.round(b.x), Math.round(b.y), Math.round(b.r), 1, 0, 1, 'blacklight', undefined, { blaze: 1, blazeR: 150 });
  }
  if (t >= T_SOLE) {
    const mp = soloPic(env, 'MB6');
    const u = clamp((t - T_SOLE) / 0.1);
    const sc = 1.3;
    const [sx0, sy0] = soloTopLeft(env, 'MB6', b.x + 4, b.y - b.r - lerp(40, 3, ease.inQuad(u)), sc, { anchor: 'sole' });
    const [ux, uy] = [(b.x - sx0) / sc, (b.y - sy0) / sc];
    const cv = litSprite(mp.img, {
      k: 0.45, tint: [150, 122, 255], fadeTop: 30,
      rims: [{ dir: [0, -1], color: PAL.spot, a: 0.8 }, { dir: [-1, 0], color: PAL.lilac, a: 0.4 }],
      unders: [{ x: ux, y: uy, r: 70, color: PAL.lilac, a: 1 }, { x: ux, y: uy, r: 40, color: PAL.spot, a: 0.7 }],
      fluoro: [fluoroMask(mp), 0.85],
    });
    blitLit(ctx, cv, mp.w, mp.h, sx0, sy0, sc);
  }

  // ---- 8 · particles (turf at the lens), HUD.
  env.screen();
  env.parts.draw(ctx, 0);
  env.parts.draw(ctx, 1);
  fourCount(ctx, padsFor(8), t, { flareAllAt: T_TROPHY });

  // ---------------------------------------------------------------- post
  soloStage(fx);
  fx.bloom = 1.05 + 0.12 * decay(t, T_POP, 0.15) + TAPS.reduce((a, s) => a + 0.08 * decay(t, s, 0.12), 0);
  {
    const [bu, bv] = toS(b.x, b.y + b.r * 0.9);
    for (const T of TAPS) flatShockAt(fx, bu / VW, bv / VH, T, t, 0.03, 0.3, 0.35);
  }
  fx.ca = Math.max(fx.ca, 0.002 + 0.006 * decay(t, T_POP, 0.12) + 0.004 * decay(t, T_CUT, 0.1));
  void dPr;
}
