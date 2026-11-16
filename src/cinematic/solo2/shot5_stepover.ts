// SPOTLIGHT SOLO v2 · shot 5 · "Step-over" (1.6 s, g 6.4-8.0, seed 515): the first victim. SPEC.md §6 shot 5.
//
// The first one to step into his light is spun into the air, photographed there by the strobe and slammed face-down.
// A front retreating dolly, low (eye 0.5 m, looking west with drawUpPitch: the horizon at his knees, he towers over the
// stands): No.10 comes at the lens under the roof follow-spot in a blacked-out stadium (300 phone lights on the far
// stand, fluorescent lines), studio-drawn at SC 2.4 (235 px), feet at (320, 340); the camera backpedals at his speed.
// A real pinhole places everything (the pitch, the defender, his print, the torn turf, the ball in flight), so depth,
// parallax and the dolly are true; a 2D layer on top carries the beat punches, the slow pushes between the keys, the
// shake, the truck-whip and the exit whip-pan. Sprites are lit at their own pixels (litSprite: the stage helpers' look,
// one sprite pixel of rim) and drawn once, scaled nearest.
//
// A is the RIVAL_KIT puppet (side-on, facing +1, through the shared PuppetCache, rendered at k 1 and scaled nearest so
// his pixels match No.10's), kept a plum silhouette with a lilac / volt rim: the beam only spills on him. His print is
// a neon photograph of the puppet (posterized by its own light, volt outline, ivory top, dark seams between limbs) of
// PRINT_POSE: the brief's corkscrew opened into a scissor (still spin 1.2 pi, at the world's print point 892 / 254 /
// 13) so it reads at a glance as a man flung upside down. His wreck runs on t (world.ts' times: pop 7.35, landed 7.55),
// with the spin kept continuous into faceDown (+2 pi). The torn turf is placed under his actual feet (the cut from his
// plant foot fanned to screen-left; the stride rips pointing back) with GASHES' kinds, claws, shafts and birth times.
//
// Beats (shot-local t; global g = 6.4 + t; every key on the 16th grid):
//   0.00 (g 6.4, ONE of bar 4) FrontTouch FT1, the approach touch; hard cut out of shot 4's macro. A BURSTS OUT OF THE
//        DARK at screen-left, sprinting at him (puppet ~300 px at the lens, facing +1), a plum silhouette with a lilac
//        rim; kickDrum + tom A2, cam.hit 0.2, a punch +0.04.
//   0.14 StepOver F2 (plant), 0.27 F3 (the leg circles the dead-still ball); hats + cloth whooshes. A brakes into his
//        jockey crouch and crosses the pool edge at 0.25: the beam's spill brings his colour up dark and hard over 4
//        frames (he stays a rim-lit menace; the camera pushes in 1.00 -> 1.06 as he closes).
//   0.40 (beat 2) THE SELL (F4, held to 0.60 at rate 0.08: the breath). His body drops to screen-right; three crisp
//        Chorus copies of F4 thrown 20 / 40 / 60 px to screen-right + the beat echo; the beam lurches 40 px right for
//        2 frames (the light is fooled too); snap punch +0.15 and a 24 px drift right through the rest; A BITES (his
//        weight already going right, frozen in the breath with the dust he kicked). Tag STEP-OVER slides in.
//   0.60 F5 (load) 0.70 F6 (push): A launches his full-stretch lunge to screen-right (lungeCommit), crossing in front
//        of him at full speed, ankles crossing.
//   0.80 (beat 3, g 7.2) THE CUT (F7): the outside of the right boot snaps the ball to screen-left. THE CUT STACK:
//        1 hit-stop rate 0.03 for 0.16 s then 2.2 for 0.10 s (the debris hangs, then rockets out);
//        2 beam impact A (0.800-0.833) + B (0.833-0.850) in the roof spot's cone (E5 / E6);
//        3 punch +0.16, cam.hit(1.0), shakeAmp 20, a shove;
//        4 the light gash: his plant foot rips 3 claws ~130 px fanned to screen-left, 6 UV shafts pouring up;
//        5 turfRip 1.5 at the lens (24 sods, 60 crumbs, 80 blades, divots past the lens);
//        6 two flat refraction shocks at the boot (s 0.06 / 0.035, sy 0.3);
//        7 light rain, 90 lines for 0.2 s round him;
//        8 CA 0.014 -> 0.002, radial 0.10 on the boot;
//        9 the ball's strobe chain (6 crisp exposures) + a uv speed streak behind it;
//       10 2 Chorus copies of F7 left at the cut;
//       11 bloom 1.15 for 0.2 s; + his eyes flash with stage-light cross glints, a light splash under the boot.
//   0.85-0.95 A IS DESTROYED: his crossed ankles give, he corkscrews and leaves the ground (spin 0 -> 1.2 pi, hip +0.4 m),
//        arms flung, a spiral of grass and dust off him. No.10 bursts to screen-left (Break BR1 from 0.867, one clean
//        F7 frame after the impact), the ball racing ahead of him with its exposures.
//   0.95 (g 7.35) THE STROBE FIRES ON A: a local flash-bulb pop (radius <= 90 px, 3 frames; A burnt to a violet shape
//        with an ivory edge) and a strobeZap leave his neon print developing over the 3 frames and hanging in the air
//        mid-corkscrew (it stays until the relight), while A finishes the corkscrew in real time and SLAMS FACE-DOWN
//        under it by 1.15 (g 7.55: boom 0.5, scuff, cam.hit 0.35, a sod burst and a dust puff).
//   0.96-1.06 the truck-whip left after him (re-centring him, ~65 px; streak 0.035 with a sharp hole on him); the
//        stride touches 1.00 BR2 / 1.15 BR3 / 1.30 BR2 / 1.45 BR3 each rip a 2-claw gash with shafts and a sod spray,
//        each leaving a Chorus copy behind (world-anchored, receding as the dolly backpedals).
//   1.05-1.25 HE OUTRUNS HIS OWN LIGHT: the operator lags, the beam lands behind him; at 1.15 he is out of its pool, a
//        backlit silhouette with glowing eyes, lit only by the gash light and his Chorus.
//   1.20 (beat 4, g 7.6) TROPHY 1: SC 2.4 -> 3 on the beat-snap (reframed on his chest, then a slow 5 % push); a
//        narrow white trophy spot CLANKs on over print A and his body; OLÉ! 1; pad 1 lights; the crowd stomps for him
//        now (the phone lights jump).
//   1.25 the beam whips 120 px to catch him (motes smeared) and slams back on with a light splash.
//   1.40-1.60 whip-pan left 500 px (inQuad, streak building to 0.06): the motion cut onto the ONE of bar 5 (shot 6).
//
// Photosensitivity (§4.4): E5 / E6 (beam impact A then B, 3 frames from g 7.20) are the only full-frame events. The pop
// (<= 90 px, 3 frames), the trophy clank, the beam's lurch and catch, the splashes and the light rain are local.

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { clamp, ease, lerp, type RGB } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import type { BallSquash } from '../../engine/pixel';
import { joints, mixPose, type Pose } from '../../art/puppet';
import {
  DEF_SIL, DIM_V2, HEX, HUM, P as PZ, PAL, POSES, PUPPETS, RATE, RIVAL_KIT, SHOTS, TOMS, drawBall, drawPhoneLights, drawPitchLines, drawUpPitch,
  echoAt, eyeGlow, flatShockAt, fluoroMask, fourCount, keys, lightRain, marqueeTag, onFrames, padsFor, projectDecal, punch, simTime, soloImpact2,
  soloPic, soloPoint, soloStage, soloTopLeft, spinAt, stage, warmBalls, warmSolo, warmSolo2, type DownPitchView, type SoloKey,
} from './common';
import { Chorus, stepFade, warmChorus } from './chorus';
import { lightGash, turfRip } from './turf';
import { GASHES, PRINT_DEFS, type Gash } from './world';

const META = SHOTS[4];
const FR = 1 / 60;
/** The shot's global start (g 6.4, the ONE of bar 4). */
const G0 = 6.4;

// ---------------------------------------------------------------- beats

const T_SELL = 0.4, T_LOAD = 0.6, T_CUT = 0.8, T_BURST = 0.8667, T_POP = 0.95, T_LAND = 1.15, T_TROPHY = 1.2, T_CATCH = 1.25, T_EXIT = 1.4;
/** The stride touches (Break frames on the 16ths / 8ths): each rips a 2-claw gash. */
const STRIDES = [1.0, 1.15, 1.3, 1.45] as const;
const STRIDE_TOM = [TOMS.A2, TOMS.F2, TOMS.D2, TOMS.F2] as const;

/** No.10's frames (SPEC §9.3 schedule; BR1 one frame late so F7 shows one clean frame after the impact frames). */
const SEQ5: readonly (readonly [number, SoloKey])[] = [
  [0, 'FT1'], [0.14, 'SO2'], [0.27, 'SO3'], [T_SELL, 'SO4'], [T_LOAD, 'SO5'], [0.7, 'SO6'], [T_CUT, 'SO7'],
  [T_BURST, 'BR1'], [1.0, 'BR2'], [1.15, 'BR3'], [1.3, 'BR2'], [1.45, 'BR3'],
];
function frameAt(t: number): SoloKey {
  let k: SoloKey = SEQ5[0][1];
  for (const [at, key] of SEQ5) if (t >= at - 1e-6) k = key;
  return k;
}

// ---------------------------------------------------------------- the pinhole (front retreating dolly, looking west)

/** World px per studio sprite px (No.10 is 98 px tall at 1x = 1.8 m = 18 world px). */
const SPX = 18 / 98;
const FOC = 560;
const EYE_H = 5;
/** The camera's lateral line (z) and his running line through the step-over. */
const CAMZ = 262;
/** The canvas point every front frame is pinned on (the registration: body centre x 64, the soles' bottom edge). */
const PIV: [number, number] = [64, 103];

/** His integer-ish sprite scale: 2.4 (235 px), 3 from the beat-snap at 1.20. */
const SC = (t: number) => (t >= T_TROPHY - 1e-6 ? 3 : 2.4);
/** The camera's distance to him (the dolly keeps it while he runs): SC = FOC·SPX / Z. */
const ZH = (t: number) => (FOC * SPX) / SC(t);
/** The principal point (horizon) y: feet at y 340 at SC 2.4 (a low lens: the horizon at his knees, he towers over the
 *  stands); reframed on his chest at SC 3 (feet at ~346). */
const HOR = (t: number) => (t >= T_TROPHY - 1e-6 ? 256 : 275);

/** His field x: the approach touch, planted through the step-over, then the burst at the lens (0 -> 6 m/s). */
function heroX(t: number) {
  if (t < 0.14) return lerp(878, 884, ease.outQuad(clamp(t / 0.14)));
  if (t < T_CUT + 0.05) return 884;
  const u = t - (T_CUT + 0.05);
  return 884 + (u < 0.25 ? (60 * u * u) / 0.5 : 7.5 + 60 * (u - 0.25));
}
/** His field z: on the line, then the burst to his right (screen-left) after the cut. */
const BURST_Z = 5;
const heroZ = (t: number) => (t < T_CUT + 0.05 ? CAMZ : CAMZ + BURST_Z * ease.outCubic(clamp((t - T_CUT - 0.05) / 0.2)));

const view = (t: number): DownPitchView => ({ x: heroX(t) + ZH(t), z: CAMZ, h: EYE_H, f: FOC, horizon: HOR(t), cx: 320, dir: -1 });

// ---------------------------------------------------------------- the 2D camera on top (punches, shake, truck, whip)

interface Xf {
  px: number;
  py: number;
  z: number;
  ox: number;
  oy: number;
}
const toScr = (xf: Xf, x: number, y: number): [number, number] => [(x - xf.px) * xf.z + xf.px + xf.ox, (y - xf.py) * xf.z + xf.py + xf.oy];
function applyXf(env: Env, xf: Xf) {
  env.screen();
  const ctx = env.ctx;
  ctx.translate(xf.px + xf.ox, xf.py + xf.oy);
  ctx.scale(xf.z, xf.z);
  ctx.translate(-xf.px, -xf.py);
}
/** The zoom: a touch kick on the cut-in, the sell's snap punch held through the rest, the cut's punch, the strides. */
function zoomAt(t: number) {
  const sell = keys([[T_SELL, 0], [T_SELL + 2 * FR, 0.15, 'outExpo'], [T_LOAD, 0.11, 'linear'], [0.72, 0, 'inOutQuad']], t);
  // Between the keys the camera keeps moving: a slow push as A closes in, a creep in on him after the trophy snap.
  const push = 0.06 * ease.inOutSine(clamp(t / T_SELL)) * (t < T_CUT ? 1 : 0) + 0.05 * ease.inOutSine(clamp((t - T_TROPHY) / 0.2));
  return (
    1 + push + punch(t, 0, 0.04, 0.02, 0.15) + sell + punch(t, T_CUT, 0.16, FR, 0.32) + punch(t, T_TROPHY, 0.05, FR, 0.18) +
    STRIDES.reduce((a, s) => a + punch(t, s, 0.02, 0.02, 0.09), 0)
  );
}
/** His screen x before the 2D pan (the pinhole). */
function heroSX0(t: number) {
  const p = projectDecal(heroX(t), heroZ(t), 0, view(t));
  return p.x;
}
/** The pan: the sell's 24 px drift right, the truck-whip after him (0.96-1.06, then he stays centred), the exit whip. */
function panAt(t: number) {
  let x = 0;
  x -= 24 * (t < T_SELL ? 0 : t < T_LOAD ? ease.inOutSine((t - T_SELL) / 0.2) : 1 - ease.inOutQuad(clamp((t - T_LOAD) / 0.2)));
  const w = ease.inOutQuad(clamp((t - 0.96) / 0.1));
  if (w > 0) x += w * (320 - heroSX0(t));
  if (t >= T_EXIT) x += 500 * ease.inQuad(clamp((t - T_EXIT) / 0.2));
  return x;
}
/** The live trauma shake + shove (screen px) of env.cam. */
function shakeOf(env: Env): [number, number] {
  const cam = env.cam;
  cam.zoom = 1;
  cam.rot = 0;
  cam.x = VW / 2;
  cam.y = VH / 2;
  const [u, w] = cam.toUV(cam.x, cam.y);
  return [u * VW - VW / 2, w * VH - VH / 2];
}
function xfAt(env: Env, t: number): Xf {
  const [sx, sy] = shakeOf(env);
  const v = view(t);
  const feet = projectDecal(heroX(t), heroZ(t), 0, v);
  return { px: feet.x, py: feet.y - 0.55 * 98 * SC(t), z: zoomAt(t), ox: panAt(t) + sx, oy: sy };
}

// ---------------------------------------------------------------- the ball

/** Ball radius in world px (12 sprite px across). */
const BALL_RW = 6 * SPX;
interface BallState {
  x: number;
  y: number;
  r: number;
  /** World position (for the strobe chain and depth). */
  wx: number;
  wz: number;
  free: boolean;
}
/** The ball where the frame's 'ball' anchor puts it (front frames: the ball sits in front of the boot it touches). */
function anchoredBall(env: Env, key: SoloKey, t: number): [number, number] {
  const p = projectDecal(heroX(t), heroZ(t), 0, view(t));
  return soloPoint(env, key, 'ball', p.x, p.y, SC(t), { pivot: PIV });
}
/** The ball's free flight after the cut (world): from F7's anchor, snapped to his right (+z) and racing toward the lens. */
function ballFree(t: number): { x: number; z: number } {
  const z0 = CAMZ + (64 - 48.5) * SPX;
  const u = Math.max(0, t - T_CUT);
  return { x: heroX(t) + 0.6 + 1.2 * (1 - Math.exp(-u / 0.05)), z: z0 + 9.5 * (1 - Math.exp(-u / 0.07)) };
}
function ballAt(env: Env, t: number): BallState {
  const v = view(t);
  const r = 6 * SC(t);
  if (t < 0.14) {
    // The approach touch rolls it from FT1's toe into the dead spot of the step-over.
    const a = anchoredBall(env, 'FT1', t), b = anchoredBall(env, 'SO2', t);
    const u = ease.outCubic(clamp(t / 0.14));
    return { x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u), r, wx: heroX(t) + 0.6, wz: CAMZ, free: false };
  }
  if (t < T_CUT) {
    const [x, y] = anchoredBall(env, 'SO2', t);
    return { x, y, r, wx: heroX(t) + 0.6, wz: CAMZ, free: false };
  }
  const f = ballFree(t);
  const pf = projectDecal(f.x, f.z, BALL_RW, v);
  if (t < T_POP) return { x: pf.x, y: pf.y, r: BALL_RW * pf.s, wx: f.x, wz: f.z, free: true };
  // Glued to the Break frame's ball anchor from 0.95 (blended over 3 frames).
  const key = frameAt(t);
  const [gx, gy] = anchoredBall(env, key, t);
  const u = ease.outQuad(clamp((t - T_POP) / (3 * FR)));
  return { x: lerp(pf.x, gx, u), y: lerp(pf.y, gy, u), r: lerp(BALL_RW * pf.s, r, u), wx: f.x, wz: f.z, free: u < 1 };
}
/** Spin (rad): alive at rest (1.2 rad/s), whipped by the cut, rolling with his run. */
function ballSpinAngle(t: number) {
  if (t < T_CUT) return 1.2 * t + (t < 0.14 ? 6 * t : 0.84);
  return 1.8 + 22 * (t - T_CUT);
}
function ballSquash(t: number): BallSquash | undefined {
  if (t >= T_CUT && t < T_CUT + 3 * FR) return { sx: 1.3, sy: 0.8, dent: 0.12 };
  if (t >= T_CUT + 3 * FR && t < T_CUT + 6 * FR) return { sx: 1.12, sy: 0.92 };
  return undefined;
}

// ---------------------------------------------------------------- defender A (puppet, facing +1) and his print

const DEG = Math.PI / 180;
const A_KIT = RIVAL_KIT;
const A_FACE = 1 as const;
/** Puppet units per world px (a standing player, ~100 units, is 18 world px tall) and the render scale (crisp pixels). */
const UNIT = 0.18;
const A_K = 1;
const PRINT_A = PRINT_DEFS[0];
/**
 * The corkscrew as this lens reads it (A side-on, facing +1): the brief's pose (his ankles gone from under him, the
 * arms flung wide) opened into a scissor so the photograph reads at a glance as a man flung upside down.
 */
const PRINT_POSE_AT = (spin: number) =>
  PZ({ torso: -12 * DEG, head: 28 * DEG, thighN: 72 * DEG, kneeN: 12 * DEG, footN: -10 * DEG, thighF: -38 * DEG, kneeF: 52 * DEG, footF: -6 * DEG,
    armN: 128 * DEG, elbowN: 14 * DEG, armF: -132 * DEG, elbowF: 26 * DEG, spin });
const PRINT_POSE = PRINT_POSE_AT(1.2 * Math.PI);
const FACE_DOWN = PZ({ ...POSES.faceDown, spin: POSES.faceDown.spin + 2 * Math.PI });
/** The bite: his weight already going right, frozen in the breath. */
const BITE = mixPose(POSES.jockey, POSES.lungeCommit, 0.32);

/** How far below the hip the pose reaches (world px): a grounded body's hip height. */
function groundH(p: Pose) {
  const j = joints(p);
  let m = 0;
  for (const q of [j.toeN, j.toeF, j.ankleN, j.kneeN, j.handN, j.handF]) m = Math.max(m, q[1] + 2.5);
  m = Math.max(m, j.head[1] + 12);
  return m * UNIT;
}

interface AKey {
  s: number;
  pose: Pose;
  x: number;
  z: number;
  /** Hip height (world px); undefined = standing on the turf. */
  h?: number;
  e?: keyof typeof ease;
}
/** A's approach on the simulation clock (the breath at 0.40-0.60 holds him mid-bite with everything else). */
const A_LIVE: readonly AKey[] = [
  { s: 0.0, pose: POSES.run1, x: 893.8, z: 288 },
  { s: 0.1, pose: POSES.run2, x: 893.2, z: 282.5 },
  { s: 0.2, pose: POSES.run3, x: 892.4, z: 277.5 },
  { s: 0.3, pose: POSES.jockey, x: 891.4, z: 273.5, e: 'outQuad' },
  { s: 0.4, pose: POSES.jockey, x: 891.0, z: 272.5 },
  { s: 0.416, pose: BITE, x: 890.8, z: 271.6 },
  { s: 0.616, pose: POSES.lungeCommit, x: 890.4, z: 254.6, e: 'outExpo' },
];
/** His wreck on the shot clock (print and fall clocks run on t): the ankles give, the corkscrew, the pop, the slam. */
const A_FALL: readonly (Omit<AKey, 's'> & { t: number })[] = [
  { t: T_CUT, pose: POSES.lungeCommit, x: 890.4, z: 254.6 },
  { t: 0.867, pose: mixPose(POSES.lungeCommit, PRINT_POSE_AT(0.3 * Math.PI), 0.55), x: 891, z: 254.3, h: 8.6, e: 'inQuad' },
  { t: T_POP, pose: PRINT_POSE, x: PRINT_A.print.x, z: PRINT_A.print.z, h: PRINT_A.print.h, e: 'outQuad' },
  { t: 1.02, pose: PRINT_POSE_AT(1.62 * Math.PI), x: 893.6, z: 254, h: 10.5, e: 'linear' },
  { t: T_LAND, pose: FACE_DOWN, x: 896, z: 254, e: 'inQuad' },
];

interface AState {
  pose: Pose;
  name: string;
  x: number;
  z: number;
  h: number;
}
function keyed<K extends { pose: Pose; x: number; z: number; h?: number; e?: keyof typeof ease }>(ks: readonly K[], at: (k: K) => number, c: number) {
  if (c <= at(ks[0])) return { pose: ks[0].pose, x: ks[0].x, z: ks[0].z, h: ks[0].h ?? groundH(ks[0].pose) };
  for (let i = 1; i < ks.length; i++) {
    const b = ks[i];
    if (c > at(b)) continue;
    const a = ks[i - 1];
    const u = ease[b.e ?? 'inOutQuad'](clamp((c - at(a)) / Math.max(1e-4, at(b) - at(a))));
    const pose = mixPose(a.pose, b.pose, u);
    const ha = a.h ?? groundH(a.pose), hb = b.h ?? groundH(b.pose);
    return { pose, x: lerp(a.x, b.x, u), z: lerp(a.z, b.z, u), h: Math.max(lerp(ha, hb, u), a.h === undefined && b.h === undefined ? groundH(pose) : 0) };
  }
  const l = ks[ks.length - 1];
  return { pose: l.pose, x: l.x, z: l.z, h: l.h ?? groundH(l.pose) };
}
function aAt(t: number): AState {
  if (t < T_CUT) {
    const s = simTime(5, t);
    // On twos (30 fps): the pose cache stays small and the motion reads as drawn.
    const sq = Math.floor(s * 30 + 1e-6) / 30;
    const k = keyed(A_LIVE, (q) => q.s, sq);
    const m = keyed(A_LIVE, (q) => q.s, s);
    return { pose: k.pose, name: `A5l${Math.round(sq * 30)}`, x: m.x, z: m.z, h: m.h };
  }
  if (t >= T_LAND) return { pose: FACE_DOWN, name: 'A5down', x: 896, z: 254, h: groundH(FACE_DOWN) };
  const k = keyed(A_FALL, (q) => q.t, t);
  return { pose: k.pose, name: `A5f${Math.round(t * 60)}`, x: k.x, z: k.z, h: k.h };
}
/**
 * A's light: a plum silhouette with a lilac rim until he crosses the pool edge at 0.25 (4 frames), then the beam's
 * spill (he stays on its edge: the colour comes through dark and hard), the strobe pop photographs him in full white,
 * dark once the beam has left with No.10, then the trophy spot from straight above.
 */
function aLit(t: number) {
  if (t < 0.25) return 0;
  if (t < T_POP) return 0.24 * clamp((t - 0.25) / (4 * FR));
  if (t < T_POP + 3 * FR) return 1;
  if (t < T_TROPHY) return lerp(0.24, 0.1, clamp((t - T_POP - 3 * FR) / 0.1));
  // The trophy switch-on: half, then one over-bright frame, then on (hard white from straight above).
  return t < T_TROPHY + FR ? 0.18 : t < T_TROPHY + 2 * FR ? 0.6 : 0.32;
}

// ---------------------------------------------------------------- the stage light on a sprite (at its native pixels)

interface Rim {
  /** Unit-ish screen vector pointing to the light. */
  dir: readonly [number, number];
  color: RGB;
  a: number;
}
interface Under {
  /** The light's centre and radius in the sprite's own pixels. */
  x: number;
  y: number;
  r: number;
  color: RGB;
  a: number;
}
let litCv: HTMLCanvasElement | null = null, tmpCv: HTMLCanvasElement | null = null;
const rgbOf = (c: readonly number[], k = 1) => `rgb(${Math.round(clamp((c[0] * k) / 255) * 255)},${Math.round(clamp((c[1] * k) / 255) * 255)},${Math.round(clamp((c[2] * k) / 255) * 255)})`;
/**
 * Light a sprite at its own resolution (the shared stage helpers' look: shadeSprite's multiply, rimLight's light-side rim,
 * underLight's radial light, drawFluoro's whites) and return a scratch canvas holding it at [0, w) x [0, h), to be drawn
 * once, scaled nearest. One pixel of rim = one sprite pixel, so the light keeps the pixel-art grid; and the work is done
 * on 16-21k pixels instead of the 100-300k of the scaled sprite (60 fps on a phone).
 */
function litSprite(img: HTMLCanvasElement, o: { k: number; tint: RGB; rims?: readonly Rim[]; unders?: readonly Under[]; fluoro?: [HTMLCanvasElement, number] }) {
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
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';
  g.clearRect(0, 0, w + 2, h + 2);
  g.drawImage(img, 0, 0);
  /** The sprite's mask in tmp, filled with `fill`; the light-side edge only when `rim` is given. */
  const mask = (fill: string | CanvasGradient, rim?: readonly [number, number]) => {
    q.globalAlpha = 1;
    q.globalCompositeOperation = 'source-over';
    q.clearRect(0, 0, w + 2, h + 2);
    q.drawImage(img, 0, 0);
    if (rim) {
      const l = Math.hypot(rim[0], rim[1]) || 1;
      q.globalCompositeOperation = 'destination-out';
      q.drawImage(img, -Math.round(rim[0] / l), -Math.round(rim[1] / l));
    }
    q.globalCompositeOperation = 'source-in';
    q.fillStyle = fill;
    q.fillRect(0, 0, w + 2, h + 2);
  };
  mask(rgbOf(o.tint, o.k));
  g.globalCompositeOperation = 'multiply';
  g.drawImage(tmpCv, 0, 0);
  g.globalCompositeOperation = 'lighter';
  for (const r of o.rims ?? []) {
    if (r.a <= 0) continue;
    mask(rgbOf(r.color), r.dir);
    g.globalAlpha = clamp(r.a);
    g.drawImage(tmpCv, 0, 0);
  }
  for (const u of o.unders ?? []) {
    if (u.a <= 0 || u.r <= 0) continue;
    const gr = q.createRadialGradient(u.x, u.y, 0, u.x, u.y, u.r);
    gr.addColorStop(0, `rgba(${u.color[0]},${u.color[1]},${u.color[2]},1)`);
    gr.addColorStop(0.5, `rgba(${u.color[0]},${u.color[1]},${u.color[2]},0.45)`);
    gr.addColorStop(1, `rgba(${u.color[0]},${u.color[1]},${u.color[2]},0)`);
    mask(gr);
    g.globalAlpha = clamp(u.a);
    g.drawImage(tmpCv, 0, 0);
  }
  if (o.fluoro && o.fluoro[1] > 0) {
    g.globalAlpha = clamp(o.fluoro[1]);
    g.drawImage(o.fluoro[0], 0, 0);
  }
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';
  return litCv;
}
/** Draw the lit scratch (its [0, w) x [0, h)) with its top-left at (x, y), scaled nearest. */
function blitLit(ctx: CanvasRenderingContext2D, cv: HTMLCanvasElement, w: number, h: number, x: number, y: number, scale: number, alpha = 1) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = alpha;
  ctx.drawImage(cv, 0, 0, w, h, x, y, w * scale, h * scale);
  ctx.restore();
}

/** Draw A (the cached puppet: a live render while he moves, cached at rest) lit by the stage. */
function drawA(env: Env, st: AState, hx: number, hy: number, s: number, lit: number, pop: number, rimA = 1, alpha = 1) {
  const ctx = env.ctx;
  const D = (UNIT * s) / A_K;
  const L = clamp(lit);
  PUPPETS.draws++;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = alpha;
  const col = PUPPETS.get(st.name, A_KIT, st.pose, A_K, A_FACE);
  const x0 = hx - col.ox * D, y0 = hy - col.oy * D;
  if (pop > 0) {
    // The strobe photographs him: burnt out to an ivory shape with a volt edge for its 3 frames.
    const r = PUPPETS.get(st.name, A_KIT, st.pose, A_K, A_FACE, { fill: PAL.uv, rim: PAL.ivory, rim2: PAL.volt, lx: 0.2, ly: -1 });
    ctx.drawImage(r.cv, hx - r.ox * D, hy - r.oy * D, r.cv.width * D, r.cv.height * D);
    ctx.restore();
    return;
  }
  // Hard top light: deep violet shadow, the colour only where the light lands; the beam's spill on his top edges, the
  // turf's ultraviolet on his back edges (rims added on top of the dark-stage silhouette as well).
  const rims: Rim[] = [
    { dir: [0.15, -1], color: PAL.spot, a: (0.45 + 0.55 * L) * rimA },
    { dir: [-1, 0.3], color: PAL.volt, a: 0.6 * rimA },
  ];
  if (L > 0) {
    const cv = litSprite(col.cv, { k: lerp(0.22, 0.7, L), tint: [lerp(150, 236, L), lerp(124, 228, L), 255], rims });
    blitLit(ctx, cv, col.cv.width, col.cv.height, x0, y0, D, alpha);
  }
  if (L < 1) {
    const r = PUPPETS.get(st.name, A_KIT, st.pose, A_K, A_FACE, { ...DEF_SIL, lx: 0.2, ly: -1 });
    ctx.globalAlpha = alpha * (1 - L);
    ctx.drawImage(r.cv, hx - r.ox * D, hy - r.oy * D, r.cv.width * D, r.cv.height * D);
    ctx.globalAlpha = alpha;
    // The rims on the silhouette: only the light-side edges, additive.
    const cv = litSprite(col.cv, { k: 0, tint: [0, 0, 0], rims });
    ctx.globalCompositeOperation = 'lighter';
    // (k 0 leaves the body black: 'lighter' adds only the rims.)
    blitLit(ctx, cv, col.cv.width, col.cv.height, x0, y0, D, alpha * (1 - L));
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
}

interface Neon {
  cv: HTMLCanvasElement;
  halo: HTMLCanvasElement;
  ox: number;
  oy: number;
}
let neonA: Neon | null = null;
/**
 * Print A's neon snapshot (built once from the puppet render of the print pose): a uvDeep fill, a 1 px volt edge with a
 * 1 px volt band inside it, an ivory core on the lit (top) side, a 1 px uv glow outside; plus its uvDeep halo.
 */
function neonPrintA(): Neon {
  if (neonA) return neonA;
  const r = PUPPETS.get('A5print', A_KIT, PRINT_POSE, A_K, A_FACE);
  const W0 = r.cv.width, H0 = r.cv.height;
  const src = r.cv.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, W0, H0).data;
  const W = W0 + 6, H = H0 + 6;
  const op = (x: number, y: number) => x >= 0 && y >= 0 && x < W0 && y < H0 && src[(y * W0 + x) * 4 + 3] > 40;
  const cv = document.createElement('canvas'), halo = document.createElement('canvas');
  cv.width = halo.width = W;
  cv.height = halo.height = H;
  const g = cv.getContext('2d')!, hg = halo.getContext('2d')!;
  const img = g.createImageData(W, H), hi = hg.createImageData(W, H);
  const put = (d: Uint8ClampedArray, x: number, y: number, c: readonly number[], a: number) => {
    const i = ((y + 3) * W + (x + 3)) * 4;
    d[i] = c[0];
    d[i + 1] = c[1];
    d[i + 2] = c[2];
    d[i + 3] = a;
  };
  const edge = (x: number, y: number) => !op(x - 1, y) || !op(x + 1, y) || !op(x, y - 1) || !op(x, y + 1);
  for (let y = -3; y < H0 + 3; y++)
    for (let x = -3; x < W0 + 3; x++) {
      let near = false;
      for (let dy = -3; dy <= 3 && !near; dy++) for (let dx = -3; dx <= 3 && !near; dx++) if (op(x + dx, y + dy)) near = true;
      if (near) put(hi.data, x, y, PAL.uvDeep, 190);
      if (op(x, y)) {
        // A strobe photograph in neon: the outline volt, the lit top ivory, the inside posterized by the render's own
        // light (white shirt and socks -> ivory, skin -> volt, shorts and shadow -> uv / uvDeep), and a dark seam where
        // one part of the body crosses another, so the pose reads as a man and not a blob.
        const i = (y * W0 + x) * 4;
        const lum = (0.3 * src[i] + 0.59 * src[i + 1] + 0.11 * src[i + 2]) / 255;
        const j = (xx: number, yy: number) => (yy * W0 + xx) * 4;
        let seam = false;
        for (const [dx, dy] of [[1, 0], [0, 1]] as const) {
          if (!op(x + dx, y + dy)) continue;
          const k2 = j(x + dx, y + dy);
          const d = Math.abs(src[i] - src[k2]) + Math.abs(src[i + 1] - src[k2 + 1]) + Math.abs(src[i + 2] - src[k2 + 2]);
          if (d > 150) seam = true;
        }
        if (edge(x, y)) put(img.data, x, y, PAL.volt, 255);
        else if (!op(x, y - 2)) put(img.data, x, y, PAL.ivory, 255);
        else if (seam) put(img.data, x, y, PAL.uvDeep, 255);
        else if (lum > 0.78) put(img.data, x, y, PAL.ivory, 235);
        else if (lum > 0.55) put(img.data, x, y, PAL.volt, 235);
        else if (lum > 0.33) put(img.data, x, y, PAL.uv, 225);
        else put(img.data, x, y, PAL.uvDeep, 235);
      } else if (op(x - 1, y) || op(x + 1, y) || op(x, y - 1) || op(x, y + 1)) put(img.data, x, y, PAL.uv, 150);
    }
  g.putImageData(img, 0, 0);
  hg.putImageData(hi, 0, 0);
  return (neonA = { cv, halo, ox: r.ox + 3, oy: r.oy + 3 });
}
/** Draw print A at its hip (hx, hy), s = screen px per world px; a faint ivory after-glow behind it. */
function drawPrint(env: Env, hx: number, hy: number, s: number, a: number, born: number) {
  const ctx = env.ctx;
  const n = neonPrintA();
  const D = (UNIT * s) / A_K;
  // The fresh print burns hotter for a beat, then settles to its neon.
  const hot = 1 - clamp(born / 0.25);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.uv), hx, hy - 4 * s, 26 * s, 0.32 * a);
  drawGlow(ctx, glowOf(PAL.ivory), hx, hy - 4 * s, 12 * s, (0.14 + 0.12 * hot) * a);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = clamp(0.75 * a);
  ctx.drawImage(n.halo, hx - n.ox * D, hy - n.oy * D, n.cv.width * D, n.cv.height * D);
  ctx.globalAlpha = clamp(a);
  ctx.drawImage(n.cv, hx - n.ox * D, hy - n.oy * D, n.cv.width * D, n.cv.height * D);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = clamp((0.14 + 0.22 * hot) * a);
  ctx.drawImage(n.cv, hx - n.ox * D, hy - n.oy * D, n.cv.width * D, n.cv.height * D);
  ctx.restore();
}

// ---------------------------------------------------------------- the beam (the roof follow-spot)

/** The pool's field point: on him with the operator's 60 ms lag; it lurches with the sell, lags behind his burst, whips back. */
function beamPt(t: number): { x: number; z: number } {
  let lag = 0.06;
  if (t >= 1.0 && t < 1.22) lag = lerp(0.06, 0.26, ease.inQuad(clamp((t - 1.0) / 0.15)));
  else if (t >= 1.22 && t < T_CATCH) lag = lerp(0.26, 0.04, ease.inQuad((t - 1.22) / (T_CATCH - 1.22)));
  else if (t >= T_CATCH) lag = 0.04;
  const tb = Math.max(0, t - lag);
  let z = heroZ(tb);
  // The sell fools the light too: 40 px right for 2 frames.
  if (t >= T_SELL - 1e-6 && t < T_SELL + 2 * FR - 1e-6) z -= 3;
  return { x: heroX(tb), z };
}
/** How lit he is by the pool (world distance from its centre). */
function heroLit(t: number) {
  const b = beamPt(t);
  const d = Math.hypot(heroX(t) - b.x, heroZ(t) - b.z);
  return clamp(1 - (d - 5) / 4);
}

// ---------------------------------------------------------------- the torn turf (placed under his feet)

const CUT_GASH = GASHES.find((g) => g.id === 'cutA')!;
const STRIDE_GASHES = GASHES.filter((g) => g.id.startsWith('stride'));
/** The planted foot's field point at time t of key (front view: canvas x -> field z). */
function footAt(env: Env, key: SoloKey, t: number): { x: number; z: number } {
  const p = soloPic(env, key);
  const [cx] = p.anchor('contact');
  return { x: heroX(t), z: heroZ(t) + (PIV[0] - cx) * SPX };
}
/** This shot's gashes: the cut from his plant foot, fanned to screen-left; a 2-claw rip at every stride, pointing back. */
function gashes(env: Env): Gash[] {
  const out: Gash[] = [];
  const pf = footAt(env, 'SO7', T_CUT);
  out.push({ ...CUT_GASH, x: pf.x, z: pf.z, dir: 1.2, len: 10.5, born: G0 + T_CUT });
  STRIDE_GASHES.slice(0, STRIDES.length).forEach((gs, i) => {
    const ts = STRIDES[i];
    const f = footAt(env, frameAt(ts), ts);
    out.push({ ...gs, x: f.x, z: f.z, dir: Math.PI + (i % 2 ? 0.95 : -0.95), len: 4.5, born: G0 + ts });
  });
  return out;
}
let GASH5: Gash[] | null = null;

/**
 * The ultraviolet light pouring up out of the cut's wound (its own shafts, shot 4's look): six tapered shafts along the
 * rip, narrow at the turf and opening upward, a white-hot foot and core line, 1.9x tall in the eruption at the cut and
 * settling to 60-140 px over 0.45 s, flickering on the 8ths, scaled by depth (they recede as he runs on).
 */
function drawCutShafts(ctx: CanvasRenderingContext2D, g: Gash, Pj: (x: number, z: number, h?: number) => { x: number; y: number; s: number }, t: number) {
  const age = t - T_CUT;
  const open = clamp(age / 0.05);
  const er = age < 0.05 ? 0.9 : 0.9 * decay(t, T_CUT + 0.05, 0.45);
  const dim = lerp(1, 0.6, clamp(age / 0.8));
  const beat8 = Math.floor((G0 + t - 1.6) / 0.2 + 1e-6);
  const cx = Math.cos(g.dir), cz = Math.sin(g.dir);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < g.shafts; i++) {
    const u = (i + 0.5) / g.shafts;
    const b = Pj(g.x + cx * g.len * u, g.z + cz * g.len * u + (h01(i, 211) - 0.5) * 0.8);
    const k0 = clamp(b.s / 13, 0.4, 1.4);
    const fl = 1 + 0.15 * ((beat8 + i) % 2 ? 1 : -1);
    const H = lerp(70, 140, h01(i, 203)) * (1 + 0.9 * er) * open * k0;
    const w0 = (3 + 3 * h01(i, 204)) * k0, w1 = w0 * 3.4 * (1 + 0.6 * er);
    const k = clamp((0.55 + 0.45 * h01(i, 205)) * dim * fl * (1 + 0.5 * er));
    const x = b.x, y = b.y + 1;
    const gr = ctx.createLinearGradient(0, y, 0, y - H);
    gr.addColorStop(0, `rgba(255,250,236,${0.7 * k})`);
    gr.addColorStop(0.18, `rgba(168,128,255,${0.5 * k})`);
    gr.addColorStop(0.55, `rgba(122,77,255,${0.3 * k})`);
    gr.addColorStop(1, 'rgba(122,77,255,0)');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(x - w0 / 2, y);
    ctx.lineTo(x + w0 / 2, y);
    ctx.lineTo(x + w1 / 2, y - H);
    ctx.lineTo(x - w1 / 2, y - H);
    ctx.closePath();
    ctx.fill();
    const gc = ctx.createLinearGradient(0, y, 0, y - H * 0.8);
    gc.addColorStop(0, `rgba(255,250,236,${0.9 * k})`);
    gc.addColorStop(1, 'rgba(255,250,236,0)');
    ctx.fillStyle = gc;
    ctx.fillRect(Math.round(x), y - H * 0.8, 1, H * 0.8);
    drawGlow(ctx, glowOf(PAL.volt), x, y, (12 + 8 * er) * k0, 0.7 * k);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- eyes (the white pixels of each front frame)

const EYES: Partial<Record<SoloKey, [number, number, number]>> = {
  SO7: [55.5, 64.5, 30.5], BR1: [41.5, 50.5, 31.5], BR2: [50.5, 59.5, 30.5], BR3: [49.5, 58.5, 30.5], SO4: [74.5, 83.5, 31],
};

// ---------------------------------------------------------------- small helpers

const h01 = (i: number, s: number) => {
  const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
const decay = (t: number, at: number, len: number) => (t < at ? 0 : 1 - ease.outQuad(clamp((t - at) / len)));
const chorus = new Chorus(8, 12);
/** The Chorus copies left on the beats: [frame, born, alpha, dx, hold] (world-anchored where he was). */
const COPIES: readonly (readonly [SoloKey, number, number, number, number])[] = [
  // The step-over's rhythm: the plant and the circle each leave a faint copy (the leg going round the ball).
  ['SO2', 0.14, 0.26, 0, 0],
  ['SO3', 0.27, 0.32, 0, 0],
  // The cut: two copies of F7 stay where it happened as he bursts away.
  ['SO7', T_CUT, 0.6, 0, 0.05],
  ['SO7', T_CUT, 0.32, 22, 0],
  // Every stride leaves one copy behind.
  ...STRIDES.map((s) => [frameAt(s), s, 0.45, 0, 0] as const),
];
/** A copy born at `at` keeps its place in the world: its draw scale at t (it recedes as the dolly backpedals). */
function copyScale(at: number, t: number) {
  const p = projectDecal(heroX(at), heroZ(at), 0, view(t));
  return SC(at) * (p.s / projectDecal(heroX(at), heroZ(at), 0, view(at)).s);
}

/** Fluorescent grass glints on the turf (field points, fixed in the world): they flow at the lens as he runs. */
function drawGlints(ctx: CanvasRenderingContext2D, t: number, lights: { x: number; y: number; r: number; a: number }[]) {
  const v = view(t), v0 = view(Math.max(0, t - 0.06));
  const x0 = heroX(t) - 26, x1 = heroX(t) + ZH(t) - 3;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  // A stable lattice of glints: one per 1.5 x 1.5 world px cell in the band ahead of and behind him.
  const cell = 1.6;
  for (let cx = Math.floor(x0 / cell); cx <= Math.ceil(x1 / cell); cx++)
    for (let cz = Math.floor((CAMZ - 16) / cell); cz <= Math.ceil((CAMZ + 16) / cell); cz++) {
      const r = h01(cx, cz * 1.37);
      if (r > 0.34) continue;
      const wx = (cx + h01(cx, cz)) * cell, wz = (cz + h01(cz, cx)) * cell;
      const p = projectDecal(wx, wz, 0, v);
      if (p.y < HOR(t) + 4 || p.y > VH + 30 || p.x < -40 || p.x > VW + 40) continue;
      let L = 0;
      for (const l of lights) {
        const d = Math.hypot((p.x - l.x) / l.r, (p.y - l.y) / (l.r * 0.32));
        if (d < 1) L = Math.max(L, (1 - d) * l.a);
      }
      if (L < 0.04) continue;
      const q = projectDecal(wx, wz, 0, v0);
      const a = clamp(L * (0.55 + 0.75 * h01(cz, cx * 2.1)));
      ctx.strokeStyle = r < 0.12 ? `rgba(246,240,223,${a})` : `rgba(201,182,255,${a * 0.85})`;
      ctx.lineWidth = Math.max(1, Math.min(2, p.s * 0.08));
      ctx.beginPath();
      ctx.moveTo(Math.round(q.x), Math.round(q.y));
      ctx.lineTo(Math.round(p.x), Math.round(p.y) + 1);
      ctx.stroke();
    }
  ctx.restore();
}

// ---------------------------------------------------------------- the shot

/** Pre-fly the particles spawned since index i0 by tau seconds (so the sods hang spread out through the hit-stop). */
function preFly(env: Env, i0: number, tau: number) {
  const L = env.parts.list;
  for (let i = i0; i < L.length; i++) {
    const p = L[i];
    p.x += p.vx * tau;
    p.y += p.vy * tau + 0.5 * p.ay * tau * tau;
    p.vy += p.ay * tau;
    p.rot += p.vrot * tau;
    p.life += tau;
  }
}

/** Stage-space (zoom 1, before the 2D camera) point of A's hip and ground at time t. */
function aScreen(t: number) {
  const st = aAt(t);
  const v = view(t);
  const hip = projectDecal(st.x, st.z, st.h, v), gnd = projectDecal(st.x, st.z, 0, v);
  return { st, hip, gnd };
}

const BURST_KEYS: SoloKey[] = ['FT1', 'SO2', 'SO3', 'SO4', 'SO5', 'SO6', 'SO7', 'BR1', 'BR2', 'BR3'];

export const shotStepOver: Shot = {
  name: META.name,
  dur: META.dur,
  seed: META.seed,
  rate: RATE[5],
  cues: [
    {
      at: 0,
      fn: (e) => {
        e.sfx.kickDrum(0.8);
        e.sfx.tom(TOMS.A2, 0.6);
        e.sfx.kick(0.25);
        e.sfx.whoosh(0.25, 200, 900, 0.3, -0.6);
        e.cam.shakeAmp = 12;
        e.cam.hit(0.2);
      },
    },
    { at: 0.14, fn: (e) => { e.sfx.hat(); e.sfx.whoosh(0.15, 300, 900, 0.35, 0.1); } },
    { at: 0.27, fn: (e) => { e.sfx.hat(true); e.sfx.whoosh(0.15, 300, 900, 0.35, -0.1); } },
    {
      at: T_SELL,
      fn: (e) => {
        e.sfx.snare(1.0);
        e.sfx.kickDrum(0.8);
        e.sfx.whoosh(0.2, 300, 1600, 0.5, 0.6);
        e.sfx.crashSwell(0.2, 0.15);
        e.cam.shakeAmp = 12;
        e.cam.hit(0.3);
        e.cam.shove(4, 0);
        // A bites: dust kicked off his plant as his weight goes right (frozen in the breath).
        const a = aScreen(T_SELL);
        for (let i = 0; i < 14; i++) {
          const ang = -Math.PI / 2 + e.rng.range(-1.1, 0.6), sp = e.rng.range(60, 220);
          e.parts.spawn({
            kind: PK.Smoke, x: a.gnd.x + e.rng.range(-40, 20), y: a.gnd.y - e.rng.range(0, 6), vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp * 0.5,
            drag: 2, max: e.rng.range(0.5, 0.9), s0: e.rng.range(6, 10), s1: e.rng.range(20, 30), ramp: 'dust', r0: 0.4, r1: 1, a0: 0.35, a1: 0,
            add: false, layer: 0,
          });
        }
      },
    },
    { at: T_LOAD, fn: (e) => { e.sfx.whoosh(0.18, 250, 1400, 0.45, 0.5); e.sfx.hat(false, 0.25, 0.4); } },
    { at: 0.7, fn: (e) => { e.sfx.tom(TOMS.C3, 0.5); e.sfx.scuff(0.25); } },
    {
      at: T_CUT,
      fn: (e) => {
        // THE CUT (g 7.2): the stack's sound, the shake and the turf tearing at the lens.
        e.sfx.snare(1.4);
        e.sfx.crack(0.8);
        e.sfx.boom(1.2);
        e.sfx.kick(1.2);
        e.sfx.rip(1.0, -0.3);
        e.sfx.crash(0.8);
        e.cam.shakeAmp = 20;
        e.cam.hit(1.0);
        e.cam.shove(-6, 4);
        const v = view(T_CUT);
        const f = footAt(e, 'SO7', T_CUT);
        const p = projectDecal(f.x, f.z, 0, v);
        const i0 = e.parts.list.length;
        turfRip(e, p.x - 30, p.y, Math.PI + 0.75, 1.5, { lens: true, ground: p.y + 8, spread: 1.6 });
        // Two big divots and a fan of clods torn toward the lens (they hang in the hit-stop, then rocket past).
        for (let i = 0; i < 2; i++) {
          const ang = Math.PI + 0.35 + 0.3 * i + e.rng.range(-0.1, 0.1), sp = e.rng.range(520, 700);
          e.parts.spawn({
            kind: PK.Sod, x: p.x - 40 - 30 * i, y: p.y - 6, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp * 0.5 + 120, ay: 900, drag: 0.15,
            vrot: e.rng.range(-8, 8), rot: e.rng.range(0, 6), max: 0.6, s0: 22 + 10 * i, s1: 44 + 8 * i, a0: 1, a1: 1, layer: 1,
          });
        }
        for (let i = 0; i < 10; i++) {
          const ang = Math.PI + e.rng.range(0.1, 1.1), sp = e.rng.range(300, 600);
          e.parts.spawn({
            kind: PK.Sod, x: p.x - 20 + e.rng.range(-20, 20), y: p.y - 4, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, ay: 1000, drag: 0.3,
            vrot: e.rng.range(-14, 14), rot: e.rng.range(0, 6), max: 0.9, s0: e.rng.range(9, 14), s1: e.rng.range(10, 16), a0: 1, a1: 1, k: p.y + 30, layer: 1,
          });
        }
        // Pre-flown so the torn turf hangs spread out round him through the hit-stop (rate 0.03), then rockets out at 2.2.
        preFly(e, i0, 0.09);
      },
    },
    ...[0.85, 0.95, 1.05, 1.15].map((at, i) => ({ at, fn: (e: Env) => { e.sfx.tom([TOMS.C3, TOMS.A2, TOMS.F2, TOMS.D2][i], 0.55); e.sfx.rip(0.35); } })),
    { at: 0.86, fn: (e) => e.sfx.gasp(0.55) },
    {
      at: T_POP,
      fn: (e) => {
        e.sfx.strobeZap(1.0);
        e.cam.hit(0.25);
      },
    },
    {
      at: T_LAND,
      fn: (e) => {
        // A slams face-down under his print: a sod burst and a dust puff.
        e.sfx.boom(0.5);
        e.sfx.scuff(0.6, 0.4);
        e.cam.shakeAmp = 14;
        e.cam.hit(0.35);
        const a = aScreen(T_LAND);
        const r = e.rng;
        for (let i = 0; i < 16; i++) {
          const ang = -Math.PI / 2 + r.range(-1.3, 1.3), sp = r.range(80, 300);
          e.parts.spawn({
            kind: PK.Smoke, x: a.gnd.x + r.range(-90, 90), y: a.gnd.y - r.range(0, 8), vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp * 0.35,
            drag: 2.4, max: r.range(0.5, 0.9), s0: r.range(8, 14), s1: r.range(26, 40), ramp: 'dust', r0: 0.3, r1: 1, a0: 0.45, a1: 0,
            add: false, layer: 0,
          });
        }
        for (let i = 0; i < 8; i++) {
          const ang = -Math.PI / 2 + r.range(-0.9, 0.9), sp = r.range(140, 320);
          e.parts.spawn({
            kind: PK.Sod, x: a.gnd.x + r.range(-70, 70), y: a.gnd.y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, ay: 1100, drag: 0.4,
            vrot: r.range(-14, 14), rot: r.range(0, 6), max: 1.0, s0: r.range(6, 9), s1: 6, a0: 1, a1: 1, k: a.gnd.y + 4, layer: 1,
          });
        }
      },
    },
    ...STRIDES.map((at, i) => ({
      at,
      fn: (e: Env) => {
        // Each stride: the boot's tok, a 6-sod spray off the planted foot.
        e.sfx.kick(0.25);
        // The 16th fill (0.85-1.15) already has its toms: the later strides carry it on.
        if (at > T_TROPHY) e.sfx.tom(STRIDE_TOM[i], 0.35);
        e.cam.shakeAmp = 10;
        e.cam.hit(0.12);
        const f = footAt(e, frameAt(at), at);
        const p = projectDecal(f.x, f.z, 0, view(at));
        const r = e.rng;
        for (let k = 0; k < 6; k++) {
          const ang = -Math.PI / 2 + r.range(-0.9, 0.9), sp = r.range(160, 380);
          e.parts.spawn({
            kind: PK.Sod, x: p.x + r.range(-8, 8), y: p.y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, ay: 1100, drag: 0.4,
            vrot: r.range(-14, 14), rot: r.range(0, 6), max: 0.9, s0: r.range(5, 8), s1: 5, a0: 1, a1: 1, k: p.y + 6, layer: 1,
          });
        }
        for (let k = 0; k < 14; k++) {
          const ang = -Math.PI / 2 + r.range(-1.1, 1.1), sp = r.range(80, 300);
          e.parts.spawn({
            kind: PK.Pixel, x: p.x, y: p.y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, ay: 900, drag: 1, max: r.range(0.3, 0.6), s0: 2, s1: 1,
            ramp: 'sod', r0: 0.5, r1: 1, a0: 1, a1: 0.6, add: false, layer: 1,
          });
        }
      },
    })),
    { at: T_TROPHY, fn: (e) => { e.sfx.exhibit(1.0); e.sfx.ole(1); e.sfx.crowdStomp(2); e.cam.hit(0.2); } },
    { at: T_CATCH, fn: (e) => { e.sfx.whoosh(0.12, 500, 2600, 0.35, 0.2); e.sfx.spotOn(0.5); } },
    { at: T_EXIT, fn: (e) => e.sfx.whoosh(0.3, 300, 2000, 0.5, -0.6) },
  ],
  prepare(env) {
    warmSolo2();
    warmBalls([14, 15, 16, 17, 18]);
    warmSolo(env, BURST_KEYS, { fluoro: true });
    // Every Chorus canvas the shot will draw (each copy recedes as he runs on: one canvas per quarter scale).
    warmChorus(env, ['SO4'], [2.4]);
    const seen = new Set<string>();
    for (const [k, at] of COPIES)
      for (let tt = at; tt < META.dur; tt += FR) {
        const S = Math.round(copyScale(at, tt) * 4) / 4;
        if (seen.has(`${k}|${S}`)) continue;
        seen.add(`${k}|${S}`);
        warmChorus(env, [k], [S]);
      }
    neonPrintA();
    PUPPETS.get('A5down', A_KIT, FACE_DOWN, A_K, A_FACE);
    PUPPETS.get('A5down', A_KIT, FACE_DOWN, A_K, A_FACE, { ...DEF_SIL, lx: 0.2, ly: -1 });
  },
  init(env) {
    env.sfx.clearBus();
    env.cam.set(VW / 2, VH / 2, 1, 0);
    env.cam.shakeRoll = 0.015;
    env.cam.shakeAmp = 12;
    PUPPETS.frame();
    GASH5 = null;
  },
  update(env, t, dt) {
    env.sfx.hum(HUM[5](t), 0.025);
    const r = env.rng;
    // Smoke and a UV haze rising out of the cut's gash (slowed by the hit-stop with everything else).
    if (t >= T_CUT + FR && t < 1.3) {
      const v = view(t);
      const f = footAt(env, 'SO7', T_CUT);
      for (let i = 0; i < 2; i++) {
        const u = r.range(0, 1);
        const p = projectDecal(f.x + 3.8 * u, f.z + 9.5 * u, 0, v);
        env.parts.spawn({
          kind: PK.Smoke, x: p.x + r.range(-6, 6), y: p.y + r.range(-2, 3), vx: r.range(-25, 20), vy: r.range(-90, -40), drag: 1.2,
          max: r.range(0.5, 0.9), s0: r.range(6, 10), s1: r.range(22, 34), ramp: 'smoke', r0: 0.2, r1: 1, a0: 0.5, a1: 0, add: false, layer: 0,
        });
      }
      const p = projectDecal(f.x + 2, f.z + 5, 0, v);
      env.parts.spawn({
        kind: PK.Glow, x: p.x + r.range(-60, 60), y: p.y - r.range(0, 10), vx: r.range(-10, 10), vy: r.range(-90, -40), drag: 0.8, max: 0.5,
        s0: 6, s1: 22, ramp: 'uv', r0: 0.3, r1: 1, a0: 0.32, a1: 0, layer: 0,
      });
    }
    // The corkscrew: a spiral of grass and dust thrown off him.
    if (t >= 0.85 && t < 1.05) {
      const a = aScreen(t);
      for (let i = 0; i < 3; i++) {
        const ang = r.range(0, Math.PI * 2), sp = r.range(120, 300);
        env.parts.spawn({
          kind: PK.Blade, x: a.hip.x + r.range(-30, 30), y: a.hip.y + r.range(-40, 40), vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 60, ay: 600,
          drag: 1.2, vrot: r.range(-20, 20), rot: r.range(0, 6.28), max: r.range(0.5, 0.9), s0: r.range(4, 6), s1: 3, ramp: 'grass', r0: 0, r1: 1,
          a0: 1, a1: 0.5, add: false, layer: 1,
        });
      }
      env.parts.spawn({
        kind: PK.Smoke, x: a.hip.x + r.range(-40, 40), y: a.hip.y + r.range(-20, 50), vx: r.range(-60, 60), vy: r.range(-60, 10), drag: 1.6,
        max: r.range(0.4, 0.7), s0: 8, s1: 26, ramp: 'dust', r0: 0.3, r1: 1, a0: 0.3, a1: 0, add: false, layer: 0,
      });
    }
    void dt;
  },
  render(env, t) {
    const { ctx, fx } = env;
    const gt = G0 + t;
    chorus.frame();
    PUPPETS.frame();
    GASH5 ??= gashes(env);
    const v = view(t);
    const Pj = (x: number, z: number, h = 0) => projectDecal(x, z, h, v);
    const xf = xfAt(env, t);
    const S = (x: number, y: number) => toScr(xf, x, y);
    const key = frameAt(t);
    const sc = SC(t);
    const feet = Pj(heroX(t), heroZ(t));
    const hx = feet.x, hy = feet.y;
    const lit = heroLit(t);
    const ball = ballAt(env, t);
    const beam = beamPt(t);
    const bp = Pj(beam.x, beam.z);
    const poolRX = 8 * bp.s, poolRY = poolRX * clamp(EYE_H / Math.max(4, bp.d ?? 40)) * 1.4;
    const beamTopX = 320 + (bp.x - 320) * 0.35 + 30;
    const cutK = decay(t, T_CUT, 0.3);
    const catchK = decay(t, T_CATCH, 0.25);
    const pump = cutK * 0.25 + catchK * 0.3;
    const A = aScreen(t);
    const aLitNow = aLit(t);
    const popK = t >= T_POP - 1e-6 && t < T_POP + 3 * FR - 1e-6 ? 1 - (t - T_POP) / (3 * FR) : 0;
    const printOn = t >= T_POP - 1e-6;
    const pr = Pj(PRINT_A.print.x, PRINT_A.print.z, PRINT_A.print.h);
    const aRestG = Pj(896, 254);

    // ---- 1 · the stadium in the blackout (drawUpPitch, banks dead) and the dim.
    env.screen();
    ctx.fillStyle = HEX.void;
    ctx.fillRect(0, 0, VW, VH);
    applyXf(env, xf);
    drawUpPitch(ctx, env.art.stadium, v, gt, { towers: [0, 0, 0, 0], ambientFlashes: false });
    // The blacked-out stands: struck to plum-black (only the phone lights, drawn after the dim, show there).
    {
      const hy0 = HOR(t) + 8;
      const g = ctx.createLinearGradient(0, hy0 - 140, 0, hy0);
      g.addColorStop(0, 'rgba(8,3,16,0.92)');
      g.addColorStop(0.8, 'rgba(8,3,16,0.8)');
      g.addColorStop(1, 'rgba(8,3,16,0.45)');
      ctx.fillStyle = g;
      ctx.fillRect(-300, -300, VW + 600, hy0 + 300);
    }
    const [psx, psy] = S(bp.x, bp.y);
    const pools = [
      { x: psx, y: psy, rx: poolRX * 1.4 * xf.z, ry: poolRY * 1.6 * xf.z, soft: 50, gain: 0.85 },
      { x: S(beamTopX, 0)[0] * 0.5 + psx * 0.5, y: psy * 0.5, rx: 90 * xf.z, ry: 260, soft: 60, gain: 0.25 },
    ];
    if (t >= T_CUT) {
      const g = GASH5[0];
      const m = Pj(g.x + Math.cos(g.dir) * g.len * 0.5, g.z + Math.sin(g.dir) * g.len * 0.5);
      const [mx, my] = S(m.x, m.y);
      pools.push({ x: mx, y: my, rx: 110 * xf.z, ry: 40 * xf.z, soft: 50, gain: 0.55 });
    }
    if (t >= T_TROPHY) {
      const [tx, ty] = S(pr.x, aRestG.y);
      pools.push({ x: tx, y: ty, rx: 70 * xf.z, ry: 22 * xf.z, soft: 40, gain: 0.8 });
    }
    stage.dim(ctx, 0.94, pools, { max: DIM_V2 });

    // ---- 2 · lights in the dark (stage space): phone lights, fluorescent lines, glints, the beam and its pool.
    applyXf(env, xf);
    const stomp = t >= T_TROPHY && t < T_TROPHY + 3 * FR ? 2 : 0;
    drawPhoneLights(ctx, env.art.stadium, 0, gt, 0.9, { n: 300, view: v, sway: t >= T_TROPHY, jump: stomp });
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawPitchLines(ctx, v, 0.4, 'rgba(201,182,255,0.75)');
    ctx.restore();
    const lights = [{ x: bp.x, y: bp.y, r: poolRX * 1.6, a: 0.9 }];
    if (t >= T_CUT) {
      const g = GASH5[0];
      const m = Pj(g.x + Math.cos(g.dir) * g.len * 0.5, g.z + Math.sin(g.dir) * g.len * 0.5);
      lights.push({ x: m.x, y: m.y, r: 130, a: 0.7 });
    }
    lights.push({ x: ball.x, y: ball.y + ball.r, r: 70, a: 0.6 });
    drawGlints(ctx, t, lights);
    // The drop beam from the roof onto his pool (a plum underlay, ivory body, white-hot core, volt edges, motes).
    const whip = t >= 1.22 && t < T_CATCH + 2 * FR;
    // On the beam-impact frames the shaft's body is struck (only the subject may blaze inside the cone).
    const impactF = t >= T_CUT - 1e-6 && t < T_CUT + 3 * FR - 1e-6;
    if (!impactF) stage.pillar(ctx, {
      x0: beamTopX, y0: -80, x1: bp.x, y1: bp.y + 2, w0: 46, w1: poolRX * 2.3, a: 1, t, pumps: [T_CUT, T_CATCH, ...STRIDES],
      motes: whip ? 0 : 30, seed: 15, core: 0.32,
    });
    if (whip) {
      // The whip: motes smeared along the beam's sweep.
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const b0 = Pj(beamPt(t - 2 * FR).x, beamPt(t - 2 * FR).z);
      for (let i = 0; i < 26; i++) {
        const u = h01(i, 41), y = lerp(-40, bp.y, u);
        const xa = lerp(320 + (b0.x - 320) * 0.35 + 30, b0.x, u), xb = lerp(beamTopX, bp.x, u);
        ctx.strokeStyle = `rgba(226,220,255,${0.25 + 0.35 * h01(i, 42)})`;
        ctx.beginPath();
        ctx.moveTo(xa, y + (h01(i, 43) - 0.5) * 40);
        ctx.lineTo(xb, y + (h01(i, 43) - 0.5) * 40);
        ctx.stroke();
      }
      ctx.restore();
    }
    if (!impactF) stage.pool(ctx, bp.x, bp.y + 2, poolRX * 1.15, poolRY * 1.2, 0.95 * (1 + pump));
    stage.splash(ctx, ball.x, hy + 2, 30, 170, 0.2, T_CUT + 3 * FR, t, 0.9);
    stage.splash(ctx, hx, hy + 2, 24, 180, 0.2, T_CATCH, t, 0.85);

    // ---- 3 · the torn turf (born at the cut and on every stride; it stays as he runs on).
    for (const g of GASH5) {
      if (gt < g.born) continue;
      const isCut = g === GASH5[0];
      lightGash(ctx, g, Pj, gt, { erupt: isCut ? 0.45 * decay(t, T_CUT, 0.45) : 0.4 * decay(gt, g.born, 0.25), noShafts: isCut });
    }
    if (t >= T_CUT) drawCutShafts(ctx, GASH5[0], Pj, t);
    if (t >= T_CUT) {
      // The wound's own glow on the turf.
      const g = GASH5[0];
      const m = Pj(g.x + Math.cos(g.dir) * g.len * 0.5, g.z + Math.sin(g.dir) * g.len * 0.5);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.volt), m.x, m.y, 120, 0.5 * clamp((t - T_CUT) / 0.05) * lerp(1, 0.6, clamp((t - T_CUT) / 0.6)), 1, 0.3);
      ctx.restore();
    }
    env.parts.draw(ctx, 0);

    // ---- 4 · the trophy spot (behind the print and his body).
    if (t >= T_TROPHY) stage.trophy(ctx, pr.x, aRestG.y, 1.5, T_TROPHY, t, { top: -60, seed: 51 });

    // ---- 5 · the actors, back to front by depth (field x: bigger = nearer the lens).
    const heroDepth = heroX(t);
    const drawPrintNow = () => {
      if (!printOn) return;
      // Hot for a beat after the pop, then it settles to a hanging neon photograph (the trophy spot lifts it again).
      // It develops through the pop's 3 frames, hangs hot for a beat, then settles to a hanging neon photograph (the
      // trophy spot lifts it again).
      const dev = clamp((t - T_POP + FR) / (3 * FR));
      drawPrint(env, pr.x, pr.y, pr.s, dev * (lerp(1, 0.62, clamp((t - T_POP) / 0.3)) + (t >= T_TROPHY ? 0.2 : 0)), t - T_POP);
    };
    const drawBody = () => {
      if (A.hip.x < -260 || A.hip.x > VW + 260) return;
      // At speed (the cross, the corkscrew) a dark copy of the last frame smears behind him (no rim: a shadow).
      if ((t >= 0.62 && t < T_CUT) || (t >= 0.867 && t < T_POP)) {
        const q = aScreen(t - FR);
        const D = (UNIT * q.hip.s) / A_K;
        const r = PUPPETS.get(q.st.name, A_KIT, q.st.pose, A_K, A_FACE, { fill: DEF_SIL.fill, rim: DEF_SIL.fill, rim2: PAL.uvDeep, lx: 0.2, ly: -1 });
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.globalAlpha = 0.45;
        ctx.drawImage(r.cv, q.hip.x - r.ox * D, q.hip.y - r.oy * D, r.cv.width * D, r.cv.height * D);
        ctx.restore();
      }
      drawA(env, A.st, A.hip.x, A.hip.y, A.hip.s, aLitNow, popK);
    };
    const drawHeroAll = () => {
      // Chorus copies (world-anchored: they stay where the beat put them and recede as he runs on).
      const copy = (k: SoloKey, at: number, a: number, dx = 0, hold = 0) => {
        if (t < at) return;
        const p = projectDecal(heroX(at), heroZ(at), 0, v);
        const scl = copyScale(at, t);
        const [cx, cy] = soloPoint(env, k, 'contact', p.x + dx, p.y, scl, { pivot: PIV });
        chorus.drop(env, k, cx, cy, scl, at, t, { a, hold });
      };
      // The step-over's rhythm: the plant and the circle each leave a faint copy behind (the leg going round the ball).
      for (const [k, at, a, dx, hold] of COPIES) if (at < T_CUT) copy(k, at, a, dx, hold);
      // The sell throw: three copies of F4 thrown to screen-right (stepped fade from 0.55 / 0.4 / 0.25).
      if (t >= T_SELL && t < T_CUT + 0.1) {
        const [cx, cy] = soloPoint(env, 'SO4', 'contact', hx, hy, sc, { pivot: PIV });
        chorus.throw(env, 'SO4', cx, cy, sc, T_SELL, t, [20, 40, 60], [0.55, 0.4, 0.25], { hold: 0.12 });
      }
      // The cut: two copies of F7 stay where it happened as he bursts away.
      // ... and every stride leaves one copy behind (<= 5 copies while the print hangs).
      for (const [k, at, a, dx, hold] of COPIES) if (at >= T_CUT) copy(k, at, a, dx, hold);
      // No.10, lit by the stage.
      const pic = soloPic(env, key);
      const [tx, ty] = soloTopLeft(env, key, hx, hy, sc, { pivot: PIV });
      const L = lit;
      // Top light from the roof spot; out of it, a hard backlight rim and a volt rim from the torn turf; the blazing
      // ball and the torn turf's ultraviolet light him from below; his whites fluoresce.
      const nat = (x: number, y: number): [number, number] => [(x - tx) / sc, (y - ty) / sc];
      const unders: Under[] = [];
      const [ubx, uby] = nat(ball.x, ball.y);
      unders.push({ x: ubx, y: uby, r: 130 / sc, color: PAL.lilac, a: lerp(0.6, 0.25, L) });
      if (t >= T_CUT) {
        const g = GASH5![0];
        const m = Pj(g.x + Math.cos(g.dir) * g.len * 0.5, g.z + Math.sin(g.dir) * g.len * 0.5);
        const [ugx, ugy] = nat(m.x, m.y + 10);
        unders.push({ x: ugx, y: ugy, r: 220 / sc, color: PAL.volt, a: 0.2 * decay(t, T_CUT, 0.9) + 0.3 * (1 - L) });
      }
      const cv = litSprite(pic.img, {
        k: impactF ? 1 : lerp(0.3, 0.88, L), tint: [lerp(150, 244, L), lerp(122, 238, L), 255],
        rims: [
          { dir: [0.05, -1], color: PAL.spot, a: 0.9 * L },
          { dir: [0.55, -0.85], color: PAL.spot, a: 1 - L },
          { dir: [-0.8, 0.4], color: PAL.volt, a: 0.8 * (1 - L) },
        ],
        unders, fluoro: [fluoroMask(pic), lerp(0.6, 0.25, L)],
      });
      blitLit(ctx, cv, pic.w, pic.h, tx, ty, sc);
      // Eyes: a glint as he cuts; glowing in the dark while he is out of his light.
      const ey = EYES[key];
      const eyeA = Math.max(t >= T_CUT && t < T_CUT + 5 * FR ? 1 : 0, (1 - L) * 0.95);
      if (ey && eyeA > 0) {
        const [ex0, ey0] = soloPoint(env, key, 'center', hx, hy, sc, { pivot: PIV });
        const ox = ex0 + (ey[0] - 64) * sc, ox2 = ex0 + (ey[1] - 64) * sc, oy = ey0 + (ey[2] - 64) * sc;
        eyeGlow(ctx, (ox + ox2) / 2, oy, { gap: ox2 - ox, a: eyeA, cross: t < T_CUT + 5 * FR ? 34 : 16, halo: 14, px: Math.max(1, Math.round(sc * 0.8)) });
      }
      // The ball's strobe chain (in front of him: the ball runs between him and the lens) out of the cut (world points of its flight, crisp exposures).
      if (t >= T_CUT && t < T_CUT + 0.6) {
        const pts = [0, 1, 2, 3, 4, 5].map((i) => {
          const tc = T_CUT + i * 0.025;
          const f = ballFree(tc);
          const q = projectDecal(f.x, f.z, BALL_RW, v);
          return { x: q.x, y: q.y, t0: tc, r: Math.max(5, BALL_RW * q.s * 0.92) };
        });
        chorus.strobeChain(env, pts, t, { a: 0.75, hold: 0.12 });
      }
      // The ball (in front of the boot it touches): blazing, alive, a uv speed streak behind it in flight.
      if (ball.free) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const f0 = ballFree(T_CUT);
        const q0 = projectDecal(f0.x, f0.z, BALL_RW, v);
        const gr = ctx.createLinearGradient(q0.x, 0, ball.x, 0);
        gr.addColorStop(0, 'rgba(122,77,255,0)');
        gr.addColorStop(0.6, 'rgba(168,128,255,0.4)');
        gr.addColorStop(1, 'rgba(255,250,236,0.75)');
        ctx.fillStyle = gr;
        ctx.fillRect(Math.min(q0.x, ball.x), ball.y - ball.r * 0.6, Math.abs(ball.x - q0.x), ball.r * 1.2);
        ctx.restore();
      }
      const blaze = t >= T_CUT ? 0.8 + 0.2 * cutK : 0.7;
      drawBall(env, spinAt(ballSpinAngle(t), 0.3, 1, 0.2), Math.round(ball.x), Math.round(ball.y), Math.round(ball.r), 1, 0, 0.5, 'blacklight', ballSquash(t), {
        blaze, blazeR: ball.r * 3.4,
      });
    };
    const order: { d: number; f: () => void }[] = [
      { d: heroDepth, f: drawHeroAll },
      { d: A.st.x, f: drawBody },
      { d: PRINT_A.print.x + 0.01, f: drawPrintNow },
    ];
    order.sort((a, b) => a.d - b.d);
    for (const o of order) o.f();
    // The strobe pop on A: a local flash bulb at his chest (<= 90 px, 3 frames).
    if (popK > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const c = Pj(PRINT_A.print.x, PRINT_A.print.z, PRINT_A.print.h + 2);
      drawGlow(ctx, glowOf([255, 255, 255]), c.x, c.y, 56, 0.9 * popK);
      drawGlow(ctx, glowOf(PAL.volt), c.x, c.y, 88, 0.55 * popK);
      ctx.restore();
    }

    // ---- 6 · flying turf at the lens, light rain.
    env.parts.draw(ctx, 1);
    lightRain(ctx, hx, 440, 90, T_CUT, t, { life: 0.2, y0: -80, y1: 200, len0: 24, len1: 90, seed: 51 });

    // ---- 7 · HUD (screen).
    env.screen();
    fourCount(ctx, padsFor(5), t);
    marqueeTag(ctx, 'STEP-OVER', 30, 300, t - T_SELL);

    // ---------------------------------------------------------------- post
    soloStage(fx);
    fx.bloom = 1.0 + 0.15 * (t >= T_CUT && t < T_CUT + 0.2 ? 1 : 0) + 0.1 * catchK;
    // The sell's beat echo on him.
    const [esx, esy] = S(hx, hy - 0.55 * 98 * sc);
    echoAt(env, t, T_SELL, 4, 0.8, 0.015, { sx: esx, sy: esy, R: 0.35 });
    // E5 / E6: the beam impact in the roof spot's cone (apex at the lamp above the frame, axis onto him).
    const [ax, ay] = S(beamTopX, -80);
    const [bx2, by2] = S(hx, hy - 60);
    const L0 = Math.hypot(bx2 - ax, by2 - ay) || 1;
    const cone = { x: ax / VW, y: ay / VH, dx: (bx2 - ax) / L0, dy: (by2 - ay) / L0, half: 0.3 };
    if (onFrames(t, T_CUT, 2)) soloImpact2(fx, 'A', cone);
    else if (onFrames(t, T_CUT + 2 * FR, 1)) soloImpact2(fx, 'B', cone);
    // Two flat refraction shocks rolling out along the turf from the boot.
    const [cu, cv] = S(ball.x, hy - 4);
    flatShockAt(fx, cu / VW, cv / VH, T_CUT, t, 0.06, 0.3, 0.4);
    flatShockAt(fx, cu / VW, cv / VH, T_CUT + 0.03, t, 0.035, 0.3, 0.4);
    // CA and a radial pull on the boot.
    fx.ca = Math.max(fx.ca, 0.002 + 0.012 * decay(t, T_CUT, 0.25));
    if (t >= T_CUT && t < T_CUT + 0.1) {
      fx.radial = 0.1 * (1 - (t - T_CUT) / 0.1);
      fx.radialX = cu / VW;
      fx.radialY = cv / VH;
    }
    // The truck-whip after him (a sharp hole on him) and the exit whip-pan (the motion cut).
    if (t >= 0.96 && t < 1.06) {
      fx.streak = 0.035 * Math.sin(Math.PI * ((t - 0.96) / 0.1));
      fx.streakDX = -1;
      fx.streakDY = 0;
      fx.streakHoleX = esx / VW;
      fx.streakHoleY = esy / VH;
      fx.streakHoleR = 0.22;
    }
    if (t >= T_EXIT) {
      fx.streak = 0.06 * ease.inQuad(clamp((t - T_EXIT) / 0.2));
      fx.streakDX = -1;
      fx.streakDY = 0;
    }
  },
};
