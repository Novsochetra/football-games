// MERIDIAN THREAD v2 · shot 3 · "Outside Loft" (1.9 s, seed 413, contact 0.50 = global 3.70). SPEC.md shot 3.
//
// The trick, the first BOOM, the poster, the wink. Close side view from the near touchline, lens at hip height, ground
// line at world y 318, No.10's Loft frames at 2.4x (235 px), registered on the plant toe (76,102) (Approach AP1 / AP3
// on their canvas 56 art px behind it, as the art plan registers them).
//   0.00-0.22  the run-in: AP1, the bound AP3, framed LOW at 1.4 (boots, the rolling ball, the streaks; the top edge
//              just under his chin, so the Approach profile never shows his eyes on the ball), the camera dollying with
//              him (pelvis + 40) and braking into the plant; ink / mint speed streaks; the ball rolls a stride ahead.
//   0.22-0.30  the plant whip-tilts up onto LF1 (y 286 -> 200, zoom 1.4 -> 1.06, outCubic, a light vertical streak):
//              the reveal is the head already turned away.
//   0.22-0.50  THE BREATH (rate 0.3): LF1, the wide plant, head away; the vignette closes in; 0.26 the "eyes here, ball
//              there" inset slams in (GlanceFace at 4x looking away under a jade <, OUTSIDE OF THE BOOT) with a jade
//              chevron above the ball pointing down at it in the main frame; 0.46 LF1s swings through an ink smear with
//              an additive jade sweep over it.
//   0.50       CONTACT, STACK A: LF2, the 0.03 hit-stop, cam.hit 0.9 (shakeAmp 18), a +0.16 punch pinned on the ball,
//              stage A "jade print" 0.50-0.56 (a jagged mint impact burst, No.10 and the ball printed as one ink
//              silhouette, the burst's falloff printing as halftone dots, band 0.10 = 10 % of the frame) and stage B
//              "pearl negative" 0.56-0.63 (F1 / F2), two post shocks at the boot, three stitched rings (the flat ring on
//              the turf at the plant is the ground beat), 60 jade sparks + 30 light-stitches + 30 ink flecks frozen by the
//              hit-stop, 70 ink focus lines starting 300 px out so they frame the print (90 behind him after it), CA
//              0.012, radial 0.10, bloom 1.2, the ball squashed to 37 px along the boot normal with jade seams and two
//              spin marks. Stage A: the burst is centred on his torso, its inner points 160-210 px out, so the whole
//              figure (head away, boot under the ball) prints as one ink silhouette on mint and the ball is cut free of
//              the boot by a mint rim. Stage B: he and the ball are drawn as solid pearl shapes, so they print as ONE
//              emerald silhouette on pearl. The inset is blown off.
//   0.66       the release: LF3; the ball leaves the boot already flying (it leads the smear) and rockets up-right at
//              62 deg, out of the frame by ~0.77;
//              the Meridian bursts out of the boot (44 px at the root, bristles, stars, cross-stitches, 40 jade
//              droplets), ringing as a plucked string (canvas standing wave + the shader pluck warp, 9 Hz, 0.6 s);
//              the camera shoves and follows the exit up and right.
//   0.72-1.45  THE MONUMENT: LF4 / LF4b; the camera tilts up and eases out (y 180 -> 150, zoom 1.12 -> 1.00), the stand
//              layer drops 40 px so the stands loom and the lamp row (the backdrop's towers plus three in-between heads)
//              fills the top band; the risen stroke arches across the whole top of the frame like a jade rainbow (52-92
//              px body, its 2.4x halo) through the lamp row, whose heads catch its light (lampTintFor, smooth; one
//              JADE_FLARE <= 120 px); from 0.85 the arc sings (a sustained vibration, pearl pulses running up it, the
//              frame humming with ~1.6 px of tremor); jade rim light from above, motes rising, light falling on the turf
//              at the root; far behind, the line of four (the Tower at 1.3x bulk) tips its heads back at the sky one by
//              one, inked with the world (silhouettes with a trace of kit) under a mint rim.
//   1.45-1.59  the crash punch-in onto his head, inExpo 1.02 -> 3.0, locked on the drawn head through the LF4b -> T8a
//              seam (the world's jump at the swap is hidden in the crash's zoom blur); the stadium and the stroke sit
//              on a far layer that scales less, so the risen stroke stays in the close-up and glows behind his head.
//   1.62       T8b, THE WINK: a 14 px pearl sparkle on the open eye's corner, a 120 px JADE_FLARE (a jade streak), the
//              string plucked once more. The rim copies stay ~2-3 screen px out at any zoom.
//   1.78-1.90  the whip aimed along the risen stroke (whipOffset): it swings right after it, then tilts up, the stroke
//              riding the whole move (FAR_WHIP 1) so its body sweeps across the frame centre on the last frame; the
//              shared streak (0.10) and 24 jade / mint speed streaks run along the travel, straight up at the cut.
//
// Camera roll 0 (shakeRoll 0.015). No dolly zoom (the crash is a push onto him; the far layer only scales less), no
// pull-out off a hit. FlashBudget: F1 impact A at 0.50, F2 impact B at 0.56 (3.70 / 3.77 global); nothing else
// full-frame. Deterministic: init() resets every flag and list; particles spawn in update() from env.rng; spin advances
// in update(); render() is a pure function of t (flicker from env.frng()). Never the banned word: loft, pass, arc, line.

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { BallSpin } from '../../engine/pixel';
import { TAU, clamp, ease, lerp, type Rng } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import { FIELD, drawFieldBackdrop } from '../../art/stadium';
import { mangaPanels, panelPoly, pixelText, ribbon, sparkle, spinMarks, inkSmear, type TrailPt } from '../../art/fx';
import { anim, drawAnim, findFrame, hasAnim } from '../../art/studioAnim';
import { P, POSES, RIVAL_KIT, RIVAL_KIT_B, type Pose } from '../../art/puppet';
import { drawNo10, no10, no10Point, type No10Key } from '../../art/no10';
import { drawBall, holdTrauma, keys, punch, pushShock, zoomAbout, type PuppetSil } from '../kit';
import {
  HEX, JADE_FLARE, LAMP_JADE, PAL, PUPPETS, RATE, SEQ10, SHOTS, StitchRings, TOWER_BULK, arcLengths, assertMeridianFx, halftoneImpact,
  inkFlecks, jadeSparks, lampTintFor, meridianStroke, mix, nightGrade, nightInk, pointAt, resetSpin, seqAt, setPluck, stitchBurst,
  warmMeridian, whip,
} from './common';

const META = SHOTS[2];
const SEQ = SEQ10[3]!;

// ---------------------------------------------------------------- staging (world px; side view, ground line y 318)

/** No.10's art scale (235 px) and the ground line. */
const S = 2.4;
const GY = 318;
/** The plant (left, far) toe tip, world x: every Loft / Trivela frame stands on it (contact (76,102)). */
const PLANT_X = 564;
/** The Approach canvas sits 56 art px behind the Loft canvas (art plan: "shot-3 world origin +56"); AP3 rides (+38,-3). */
const AP_DX = -56;
const AP3_OFF: [number, number] = [38, -3];

// Beats (shot-local s, the runner's unwarped clock).
const T_BOUND = 0.1;
const T_PLANT = 0.22;
const T_INSET = 0.26;
const T_SWING = 0.46;
const T_HIT = 0.5;
const T_STAGE_B = 0.56;
const T_PRINT_END = 0.63;
const T_REL = 0.66;
const T_MON = 0.85;
const T_PUSH = 1.25;
const T_CRASH = 1.45;
const T_CRASH_END = 1.59;
const T_T8A = 1.58;
const T_WINK = 1.62;
const T_WHIP = 1.78;
const DUR = META.dur;
/** Stage A's halftone band (the dev probe measures the share of the frame inside it: <= 25 %). */
const TONE_BAND = 0.1;

// ---------------------------------------------------------------- the Meridian's path in this view

/**
 * The rising stroke, relative to the ball at contact (world px): a cubic Bezier leaving the boot at 62 deg and bending
 * over toward the apex far off to the right, so on the monument frame it crosses the top band like a jade rainbow at
 * the lamp row (its crest sits among the lamp heads, so two or three of them catch its jade). (The 26 m flight itself is shot 4's ride; this is the first 9 m seen from the touchline.)
 */
const SP0: [number, number] = [0, 0];
const SP1: [number, number] = [115, -216];
const SP2: [number, number] = [230, -310];
const SP3: [number, number] = [560, -300];
const bez = (a: number, b: number, c: number, d: number, u: number) => {
  const v = 1 - u;
  return v * v * v * a + 3 * v * v * u * b + 3 * v * u * u * c + u * u * u * d;
};
/** The stroke polyline relative to the ball (64 segments, then a straight run-out along the end tangent). */
const PATH: TrailPt[] = (() => {
  const out: TrailPt[] = [];
  for (let i = 0; i <= 64; i++) {
    const u = i / 64;
    out.push({ x: bez(SP0[0], SP1[0], SP2[0], SP3[0], u), y: bez(SP0[1], SP1[1], SP2[1], SP3[1], u) });
  }
  const a = out[out.length - 2], b = out[out.length - 1];
  const l = Math.hypot(b.x - a.x, b.y - a.y);
  for (let k = 1; k <= 8; k++) out.push({ x: b.x + ((b.x - a.x) / l) * 60 * k, y: b.y + ((b.y - a.y) / l) * 60 * k });
  return out;
})();
const PATH_S = arcLengths(PATH);
const PATH_L = PATH_S[PATH_S.length - 1];
/** The longest stroke ever drawn (it runs off the top-right of every frame long before this). */
const S_MAX = 980;

/**
 * Arc length of the ball along the stroke after the release: it leaves the boot already flying (60 px up the stroke on
 * the first release frame, so it leads LF3's boot rather than sitting under the smear), then rockets out (gone by ~0.77).
 */
function ballS(t: number): number {
  if (t < T_REL) return 0;
  const u = (t - T_REL) / 0.14;
  if (u <= 1) return 60 + 380 * u + 100 * u * u;
  return Math.min(S_MAX + 400, 540 + 3200 * (t - T_REL - 0.14));
}
/** Stroke points from the root to arc length s (relative to the ball at contact), every ~10 px. */
function strokeRel(s: number): TrailPt[] {
  const L = Math.min(s, S_MAX, PATH_L);
  if (L <= 1) return [];
  const n = Math.max(2, Math.ceil(L / 10));
  const out: TrailPt[] = [];
  for (let i = 0; i <= n; i++) {
    const q = pointAt(PATH, PATH_S, (i / n) * L);
    out.push({ x: q.x, y: q.y });
  }
  return out;
}

// ---------------------------------------------------------------- module state (reset in init)

let spin = new BallSpin();
const rings = new StitchRings();
const fired = { plant: false, hit: false, rel: false, wink: false };
let lastBallX = 0;

// ---------------------------------------------------------------- No.10

interface Hero {
  key: No10Key;
  x: number;
  y: number;
  anchor: 'contact' | 'pelvis';
}

/** No.10 at t: the run-in on the Approach canvas (registered to the plant), then every frame on the plant toe. */
function heroAt(t: number): Hero {
  const key = seqAt(SEQ, t);
  if (key === 'AP1') return { key, x: PLANT_X + (73 + AP_DX - 76) * S, y: GY, anchor: 'contact' };
  if (key === 'AP3') {
    // The bound: airborne on the pelvis through its registered point, 14 px hop, carried forward into the plant.
    const u = clamp((t - T_BOUND) / (T_PLANT - T_BOUND));
    const px = PLANT_X + (60 + AP3_OFF[0] + AP_DX - 76) * S, py = GY + (66 + AP3_OFF[1] - 102) * S;
    return { key, x: px + lerp(-26, 16, u), y: py - 16 * Math.sin(Math.PI * u), anchor: 'pelvis' };
  }
  return { key, x: PLANT_X, y: GY, anchor: 'contact' };
}
function drawHero(env: Env, h: Hero, img?: HTMLCanvasElement, dx = 0, dy = 0, alpha = 1) {
  drawNo10(env, h.key, h.x + dx, h.y + dy, S, { anchor: h.anchor, alpha }, img);
}
function heroPt(env: Env, key: No10Key, name: string): [number, number] {
  return no10Point(env, key, name, PLANT_X, GY, S, { anchor: 'contact' });
}
/** The ball's resting guide (LF1/LF2 'ball' anchor) = the root of the stroke. */
function ballGuide(env: Env): [number, number] {
  return heroPt(env, 'LF2', 'ball');
}

// ---------------------------------------------------------------- the camera

interface Cam {
  x: number;
  y: number;
  z: number;
  /** Far-layer scale (the stadium and the risen stroke during the crash; = z otherwise). */
  zl: number;
  /** World point the far layer is pinned to (the crash target). */
  ax: number;
  ay: number;
  /** The whip's screen offset on the main layer (the far layer travels FAR_WHIP of it). */
  wx: number;
  wy: number;
}
/**
 * Share of the whip's travel the far layer makes: all of it (a whip is a turn of the lens, which has no parallax), so
 * the risen stroke rides the whole move and sweeps through the frame instead of sliding off into a corner.
 */
const FAR_WHIP = 1.0;
/**
 * The whip's aim: the point WHIP_S up the risen stroke lands on WHIP_AIM on the last frame, so the stroke's body crosses
 * the frame centre (rising from the bottom-left, as shot 4 opens on it). Seen from his head the stroke bends away to the
 * right, so the move first swings right along it (inOutCubic, done by 85 %) and then tilts up (inCubic): the last
 * frames travel straight up into shot 4's upward blur.
 */
const WHIP_S = 400;
const WHIP_AIM: [number, number] = [280, 262];

/**
 * The head the crash locks onto: always the head that is drawn (LF4b's until the 1.58 swap, then T8a's), so the head
 * itself never moves on screen through the seam; the 23 art px between the two heads becomes a jump of the world
 * behind him inside the inExpo crash, hidden by the crash's radial blur (the art plan's "ease the target" left a
 * 120 px head jump at zoom 2.2, because the drawn head and the eased target part company).
 */
function crashHead(env: Env, t: number): [number, number] {
  return heroPt(env, t < T_T8A ? 'LF4b' : 'T8a', 'head');
}

/**
 * The run-in's low framing: boots, the rolling ball and the streaks at 1.4, the top edge at world y ~157, just under
 * his chin (the Approach frames show his profile looking at the ball, which would give the no-look away). The plant
 * whip-tilts up onto LF1 (0.22-0.30), so the plant itself reveals the head turned away.
 */
const Y_RUN = 286;
const Z_RUN = 1.4;
const T_TILT_END = 0.3;

/** The base (pre-crash) camera: x, y, zoom. */
function baseCam(t: number): [number, number, number] {
  // x: dollies with the run (pelvis + 40), decelerating into the plant; follows the ball's exit; settles for the monument.
  let x: number;
  if (t < T_PLANT) x = lerp(PLANT_X - 132 + 40, PLANT_X - 43 + 40, ease.outQuad(t / T_PLANT));
  else x = keys([[T_REL, PLANT_X - 3], [T_MON, PLANT_X + 44, 'outCubic'], [T_PUSH, PLANT_X + 96, 'outCubic'], [T_CRASH, PLANT_X + 100, 'linear']], t);
  const y = keys([[T_PLANT, Y_RUN], [T_TILT_END, 200, 'outCubic'], [T_REL, 200], [T_MON, 180, 'outCubic'], [T_PUSH, 150, 'outCubic']], t);
  const z = keys([[T_PLANT, Z_RUN], [T_TILT_END, 1.06, 'outCubic'], [T_HIT, 1.12, 'inQuad'], [T_MON, 1.12], [T_PUSH, 1.0, 'outCubic'], [T_CRASH, 1.02, 'linear']], t);
  return [x, y, z];
}

/** The whip's offset (screen px) at t, from the un-whipped head screen point (sx, sy) and the far layer's scale zl. */
function whipOffset(env: Env, t: number, sx: number, sy: number, hx: number, hy: number, zl: number): [number, number] {
  if (t < T_WHIP) return [0, 0];
  const u = clamp((t - T_WHIP) / (DUR - T_WHIP));
  const [gx, gy] = ballGuide(env);
  const q = pointAt(PATH, PATH_S, WHIP_S);
  const ax = sx + (gx + q.x - hx) * zl, ay = sy + (gy + q.y - hy) * zl;
  return [(WHIP_AIM[0] - ax) * ease.inOutCubic(clamp(u / 0.85)), (WHIP_AIM[1] - ay) * ease.inCubic(u)];
}

function camAt(env: Env, t: number): Cam {
  const [bx, by, bz] = baseCam(t);
  const [gx, gy] = ballGuide(env);
  if (t < T_CRASH) {
    // The +0.16 punch onto the ball (0.05 s in, 0.30 s out): the contact stays put on screen.
    const p = punch(t, T_HIT, 0.16, 0.05, 0.3);
    if (p <= 0) return { x: bx, y: by, z: bz, zl: bz, ax: bx, ay: by, wx: 0, wy: 0 };
    const sx = (gx - bx) * bz + VW / 2, sy = (gy - by) * bz + VH / 2;
    const z = bz + p;
    return { x: gx - (sx - VW / 2) / z, y: gy - (sy - VH / 2) / z, z, zl: z, ax: gx, ay: gy, wx: 0, wy: 0 };
  }
  // The crash punch-in: zoomAbout(head, 320, 160), 1.02 -> 3.0 (inExpo), 3.0 -> 3.1 to 1.78, then the whip-tilt up.
  const [hx, hy] = crashHead(env, t);
  const [b0x, b0y, b0z] = baseCam(T_CRASH);
  // The screen start of the move is always LF4b's head (so the drawn head's screen path is one smooth curve).
  const [lx, ly] = heroPt(env, 'LF4b', 'head');
  const s0x = (lx - b0x) * b0z + VW / 2, s0y = (ly - b0y) * b0z + VH / 2;
  const k = ease.inExpo(clamp((t - T_CRASH) / (T_CRASH_END - T_CRASH)));
  const z = t < T_CRASH_END ? lerp(1.02, 3.0, k) : keys([[T_CRASH_END, 3.0], [T_WHIP, 3.1, 'linear']], t);
  let sx = lerp(s0x, VW / 2, k), sy = lerp(s0y, 160, k);
  // The far layer (stadium, risen stroke) scales less: a push onto him, not a lens zoom of the whole world.
  const par = 0.55 * ease.inOutSine(clamp((t - T_CRASH) / (T_CRASH_END - T_CRASH)));
  const zl = 1 + (z - 1) * (1 - par);
  // The whip (1.78-1.90) aimed along the risen stroke (whipOffset): the world and the stroke slide together.
  const [wx, wy] = whipOffset(env, t, sx, sy, hx, hy, zl);
  sx += wx;
  sy += wy;
  const x = hx - (sx - VW / 2) / z, y = hy - (sy - VH / 2) / z;
  return { x, y, z, zl, ax: hx, ay: hy, wx, wy };
}

/** Put the camera on `c` (cam.set: rot 0; trauma shake comes from cam.update). */
function applyCam(env: Env, c: Cam) {
  zoomAbout(env.cam, c.x, c.y, VW / 2, VH / 2, c.z);
}
/** The far-layer transform: the main transform rescaled to zl about the pinned point (shake and shove included). */
function farLayer(env: Env, c: Cam) {
  if (Math.abs(c.zl - c.z) < 1e-4) {
    env.world();
    return;
  }
  const [u, v] = env.cam.toUV(c.ax, c.ay);
  const ax = u * VW - (1 - FAR_WHIP) * c.wx, ay = v * VH - (1 - FAR_WHIP) * c.wy, Sd = env.S;
  env.ctx.setTransform(Sd * c.zl, 0, 0, Sd * c.zl, Sd * (ax - c.ax * c.zl), Sd * (ay - c.ay * c.zl));
}
/** World -> screen px through the far layer (lamp heads, the stroke's screen points). */
function farToScreen(env: Env, c: Cam, x: number, y: number): [number, number] {
  const [u, v] = env.cam.toUV(c.ax, c.ay);
  return [u * VW - (1 - FAR_WHIP) * c.wx + (x - c.ax) * c.zl, v * VH - (1 - FAR_WHIP) * c.wy + (y - c.ay) * c.zl];
}
function toScreen(env: Env, x: number, y: number): [number, number] {
  const [u, v] = env.cam.toUV(x, y);
  return [u * VW, v * VH];
}

// ---------------------------------------------------------------- the stadium layer

/** The stand layer's drop (the monument: the stands loom and the lamp row fills the top band). */
const standDrop = (t: number) => 40 * ease.outCubic(clamp((t - T_MON) / 0.4));
/** drawFieldBackdrop's four towers plus three in-between heads this shot adds, so the lamp row fills the top band. */
const TOWERS = [120, 370, 620, 870, 1120, 1370, 1620];
const EXTRA_TOWERS = [370, 870, 1370];
/** World point of tower tx's lamp head as drawFieldBackdrop draws it at camera x camX, after the stand drop. */
const lampHead = (tx: number, camX: number, drop: number): [number, number] => [tx + camX * 0.5 - 300 + 20, -26 + drop];

/** The four defenders far behind, on the far turf, parallax 0.5 like the towers: [world x at cam 0, kit, tower?]. */
const LINE: readonly [number, 'd' | 'b' | 'tower'][] = [[452, 'd'], [500, 'tower'], [552, 'b'], [598, 'd']];
const LINE_Y = 250;
const LINE_K = 0.5;
/**
 * In ink they read as manga extras, inked with the world: a night fill with a rim lit from above, grey before the
 * stroke, a mint rim under it (the head-tip one by one is carried by the rim); only a trace of kit colour shows through.
 */
const SIL_DIM: PuppetSil = { fill: [8, 20, 16], rim: [70, 96, 86], rim2: [30, 48, 42], lx: 0.3, ly: -1 };
const SIL_JADE: PuppetSil = { fill: [6, 18, 14], rim: [191, 255, 224], rim2: [47, 224, 138], lx: 0.25, ly: -1 };
/** How much of the full-colour puppet shows over the silhouette (0 = pure ink). */
const LINE_LIT_DIM = 0.12;
const LINE_LIT_JADE = 0.25;

/** Still leaning after his look-off (2b's swivel), arms down: lookFar without its shading arm. */
const LEAN_FAR: Pose = P({ ...POSES.lookFar, armN: POSES.stand.armN, elbowN: POSES.stand.elbowN });

function drawLine(env: Env, camX: number, crane: number, lit: boolean) {
  const ctx = env.ctx;
  const sil = lit ? SIL_JADE : SIL_DIM;
  const l = lit ? LINE_LIT_JADE : LINE_LIT_DIM;
  LINE.forEach(([x0, kind], i) => {
    const x = x0 + camX * 0.5, y = LINE_Y - 40 * LINE_K;
    // Each one tips his head back a beat after the one before him (the stroke passes over them left to right).
    const up = crane >= 0.12 * i;
    const pose: Pose = up ? POSES.craneUp : LEAN_FAR;
    const name = `3-line-${i}-${up ? 'up' : 'far'}`;
    if (kind === 'tower') {
      // The Tower: the set's one big captain at 1.3x bulk (drawTowerPuppet's proportions), in silhouette.
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(TOWER_BULK, 1.06);
      PUPPETS.draw(ctx, name, RIVAL_KIT, pose, LINE_K, -1, 0, 0, 1, l, sil);
      ctx.restore();
    } else PUPPETS.draw(ctx, name, kind === 'b' ? RIVAL_KIT_B : RIVAL_KIT, pose, LINE_K, -1, x, y, 1, l, sil);
  });
}

/** An in-between floodlight tower (the backdrop draws only every second one): mast, head, lamp grid, glare. */
function extraTower(ctx: CanvasRenderingContext2D, env: Env, tx: number, camX: number, k: number) {
  const x = Math.round(tx + camX * 0.5 - 300);
  ctx.drawImage(env.art.stadium.tower, x, -40);
  if (k > 0) {
    ctx.globalAlpha = clamp(k);
    ctx.fillStyle = 'rgb(200,255,225)';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) ctx.fillRect(x + 5 + c * 7, -35 + r * 6, 5, 4);
    ctx.globalAlpha = 1;
  }
}

/** A lamp head over the ink: the 5 x 4 lamp grid lit white -> jade-white by k, a short horizontal glare, a jade halo. */
function lampOverInk(ctx: CanvasRenderingContext2D, lx: number, ly: number, k: number) {
  // The grid takes on jade (not just jade-white) as the stroke nears, so the catch reads against the white heads.
  const col = mix(mix(PAL.pearl, LAMP_JADE, k), PAL.jade, 0.4 * k);
  ctx.save();
  ctx.fillStyle = `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) ctx.fillRect(lx - 15 + c * 7, ly - 9 + r * 6, 5, 4);
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(col), lx, ly, 22, 0.42, 2.6, 0.5);
  if (k > 0) {
    drawGlow(ctx, glowOf(PAL.jade), lx, ly, 44, 0.6 * k, 1.6, 0.9);
    drawGlow(ctx, glowOf(PAL.emerald), lx, ly, 80, 0.5 * k, 1.4, 1);
  }
  ctx.restore();
}

/** The shortest distance from (x, y) to a polyline (world px). */
function distToPolyline(x: number, y: number, pts: readonly TrailPt[]): number {
  let best = Infinity;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy || 1e-9;
    const k = clamp(((x - a.x) * dx + (y - a.y) * dy) / l2);
    best = Math.min(best, Math.hypot(x - (a.x + dx * k), y - (a.y + dy * k)));
  }
  return best;
}

// ---------------------------------------------------------------- drawing helpers

/** A fixed hash in 0..1 (the impact burst's spikes: the same shape on every frame of the print). */
const hash01 = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/** A thick chevron (< or >) in jade on an ink outline, pointing along angle `ang`. */
function chevron(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, ang: number, a: number) {
  if (a <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.globalAlpha = clamp(a);
  ctx.lineJoin = 'miter';
  ctx.lineCap = 'butt';
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(-s * 0.55, -s);
    ctx.lineTo(s * 0.55, 0);
    ctx.lineTo(-s * 0.55, s);
  };
  ctx.strokeStyle = HEX.ink;
  ctx.lineWidth = s * 0.62;
  path();
  ctx.stroke();
  ctx.strokeStyle = HEX.jade;
  ctx.lineWidth = s * 0.36;
  path();
  ctx.stroke();
  ctx.strokeStyle = HEX.mint;
  ctx.lineWidth = Math.max(1, s * 0.1);
  path();
  ctx.stroke();
  ctx.restore();
}

/**
 * Ink focus lines with light tips (jade; pearl with stage B), converging on (cx, cy), starting rIn px out. Screen space;
 * flicker from rng. `tipA` scales the light tips (after the print they sit behind him, dimmer than the ball).
 */
function inkFocus(ctx: CanvasRenderingContext2D, rng: Rng, cx: number, cy: number, rIn: number, rOut: number, n: number, a: number, tip: string, tipA = 1) {
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
  // The light tips: the inner 45 % of each line, a thinner wedge in jade (pearl with stage B).
  ctx.globalAlpha = clamp(a * tipA);
  ctx.fillStyle = tip;
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

/**
 * A JADE_FLARE no wider than w px: a short horizontal jade streak (full strength), a small pearl core and a soft jade
 * halo (additive). The core stays low so the flare reads jade, not white, even over bright skin.
 */
function jadeFlare(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, a: number) {
  if (a <= 0 || w <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(JADE_FLARE), x, y, w / 10, a, 5, 0.22);
  drawGlow(ctx, glowOf(JADE_FLARE), x, y, w * 0.3, 0.45 * a);
  drawGlow(ctx, glowOf(PAL.pearl), x, y, w * 0.09, 0.4 * a);
  drawGlow(ctx, glowOf(JADE_FLARE), x, y, w * 0.12, 0.5 * a, 0.18, 2.2);
  ctx.restore();
}

/** Horizontal speed streaks of the run-in (screen space): ink bars and thin pearl threads rushing left. */
function runStreaks(ctx: CanvasRenderingContext2D, rng: Rng, a: number) {
  if (a <= 0) return;
  ctx.save();
  for (let i = 0; i < 40; i++) {
    const y = 10 + rng.next() * 340, x = rng.next() * VW - 80, l = 80 + rng.next() * 220;
    const lit = rng.next() < 0.45;
    ctx.globalAlpha = clamp(a * (lit ? 0.5 : 0.7) * (0.4 + 0.6 * rng.next()));
    ctx.fillStyle = lit ? (rng.next() < 0.5 ? HEX.mint : HEX.jade) : HEX.ink;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(l), lit ? 1 : 2 + (rng.next() < 0.3 ? 1 : 0));
  }
  ctx.restore();
}

/**
 * The whip's speed streaks (screen space): jade and mint bars along the camera's travel (dx, dy), long and thin, so
 * the last frames carry jade energy into shot 4's upward blur. Positions flicker per frame (rng).
 */
function whipStreaks(ctx: CanvasRenderingContext2D, rng: Rng, a: number, dx: number, dy: number) {
  if (a <= 0) return;
  const l0 = Math.hypot(dx, dy) || 1;
  const ux = dx / l0, uy = dy / l0;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for (let i = 0; i < 24; i++) {
    const x = rng.next() * VW, y = rng.next() * VH, l = 120 + rng.next() * 180;
    const mint = rng.next() < 0.4;
    ctx.globalAlpha = clamp(a * (0.55 + 0.45 * rng.next()));
    ctx.strokeStyle = mint ? HEX.mint : HEX.jade;
    ctx.lineWidth = mint ? 1.5 : 2.5 + rng.next() * 2;
    ctx.beginPath();
    ctx.moveTo(x - ux * l * 0.5, y - uy * l * 0.5);
    ctx.lineTo(x + ux * l * 0.5, y + uy * l * 0.5);
    ctx.stroke();
  }
  ctx.restore();
}

/** The "eyes here, ball there" inset (screen space): GlanceFace eyes looking away under a jade <, the caption. */
function drawInset(env: Env, t: number) {
  const ctx = env.ctx;
  // Up 0.26-0.50, then blown off the page by the contact: the halftone print (0.50-0.63) prints only the action and
  // the panel never comes back (the brief's 0.70 exit lands inside the release, where it only smeared under the blur).
  if (t < T_INSET || t >= T_HIT) return;
  const pin = ease.outBack(clamp((t - T_INSET) / 0.09));
  const pout = 0;
  const cx = 116 + lerp(-40, 0, pin) - 260 * pout, cy = 72 + lerp(-26, 0, pin) - 60 * pout;
  const deg = lerp(-11, -4, pin);
  const sc = lerp(1.35, 1, pin);
  const W = 180 * sc, H = 100 * sc;
  const poly = panelPoly(cx, cy, W, H, deg);
  const face = hasAnim('GlanceFace') ? anim('GlanceFace') : null;
  const fi = face ? findFrame(face, 'G2L', 'G2') : -1;
  mangaPanels(ctx, [{
    poly,
    border: 3,
    gutter: 3,
    fill: HEX.night,
    draw: (c) => {
      // Emerald speed field behind the face, then the face at 4x (the crop), then the jade < over his eyes.
      c.save();
      c.translate(cx, cy);
      c.rotate((deg * Math.PI) / 180);
      c.scale(sc, sc);
      const g = c.createLinearGradient(-90, 0, 90, 0);
      g.addColorStop(0, '#0B8F58');
      g.addColorStop(1, '#06140F');
      c.fillStyle = g;
      c.fillRect(-95, -55, 190, 110);
      c.globalAlpha = 0.5;
      c.fillStyle = HEX.ink;
      for (let k = 0; k < 9; k++) c.fillRect(-95, -50 + k * 12, 190, 2);
      c.globalAlpha = 1;
      if (face && fi >= 0) drawAnim(c, face, null, fi, 6, 2, 4, { pivot: [24, 13] });
      else drawNo10(env, 'G2', 6, 2, 4, {});
      // Sightline ticks from his eyes out to the left, ending in the jade <.
      c.fillStyle = HEX.jade;
      for (let k = 0; k < 3; k++) c.fillRect(-44 - k * 9, 4, 5, 2);
      chevron(c, -76, 5, 13, Math.PI, 1);
      c.restore();
    },
  }]);
  // The caption strip under the panel (paper, ink pixel letters).
  const a = clamp(pin * 3) * (1 - pout);
  if (a > 0) {
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(cx - 6, cy + H / 2 + 9);
    ctx.rotate((deg * Math.PI) / 180);
    ctx.fillStyle = HEX.ink;
    ctx.fillRect(-80, -8, 160, 16);
    ctx.fillStyle = HEX.paper;
    ctx.fillRect(-78, -6, 156, 12);
    pixelText(ctx, 'OUTSIDE OF THE BOOT', 0, -4, 8, HEX.ink, 'center', HEX.paper);
    ctx.restore();
  }
}

/** The release burst along the root of the stroke: ink speed lines parallel to the flight (screen space). */
function flightLines(ctx: CanvasRenderingContext2D, rng: Rng, x: number, y: number, a: number) {
  if (a <= 0) return;
  const dx = Math.cos(-1.08), dy = Math.sin(-1.08);
  ctx.save();
  for (let i = 0; i < 22; i++) {
    const off = (rng.next() - 0.5) * 260, along = rng.next() * 260 - 60, l = 50 + rng.next() * 140;
    const px = x - dy * off + dx * along, py = y + dx * off + dy * along;
    const lit = rng.next() < 0.4;
    ctx.globalAlpha = clamp(a * (lit ? 0.6 : 0.8));
    ctx.strokeStyle = lit ? HEX.mint : HEX.ink;
    ctx.lineWidth = lit ? 1 : 2;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + dx * l, py + dy * l);
    ctx.stroke();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the shot

export const shotLoft: Shot = {
  name: META.name,
  dur: META.dur,
  seed: META.seed,
  rate: RATE[3],
  cues: [
    { at: 0.02, fn: (e) => e.sfx.scuff(0.2) },
    { at: 0.12, fn: (e) => e.sfx.scuff(0.2) },
    { at: T_PLANT, fn: (e) => { e.sfx.kick(0.2); e.sfx.crack(0.15); e.sfx.duck(0.3, 0.3); } },
    { at: T_INSET, fn: (e) => { e.sfx.tick(0.5); e.sfx.shing(0.8); } },
    { at: 0.44, fn: (e) => e.sfx.whoosh(0.15, 300, 1800, 0.4) },
    {
      at: T_HIT,
      fn: (e) => {
        e.sfx.kick(1.2);
        e.sfx.boom(1.2);
        e.sfx.crack(0.8);
        e.sfx.twang(0.7);
        e.sfx.pluck(146.83, 2.5, 0.6);
      },
    },
    { at: T_REL, fn: (e) => { e.sfx.zip(0.5, 600, 4000); e.sfx.whoosh(0.9, 300, 3000, 0.5); } },
    { at: T_MON, fn: (e) => { e.sfx.bow(146.83, 1.6, 0.3, 220); e.sfx.crowd(2.0, 0.45); e.sfx.ooh(0.45); } },
    { at: T_WINK, fn: (e) => { e.sfx.shing(1.4); e.sfx.pluck(880); } },
    { at: T_WHIP, fn: (e) => e.sfx.whoosh(0.2, 800, 4000, 0.35) },
  ],
  prepare(env) {
    warmMeridian(env);
    // Warm the puppet caches of the far line and the jade rim tints, so the first play has no hitch.
    const ctx = env.ctx;
    ctx.save();
    ctx.globalAlpha = 0;
    for (const lit of [false, true]) {
      drawLine(env, 0, -1, lit);
      drawLine(env, 0, 1, lit);
    }
    ctx.restore();
    for (const k of ['LF4', 'LF4b', 'LF3', 'T8a', 'T8b', 'LF2'] as No10Key[]) {
      const f = no10(k);
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
    env.cam.shakeAmp = 10;
    spin = new BallSpin();
    resetSpin(spin);
    rings.clear();
    fired.plant = fired.hit = fired.rel = fired.wink = false;
    lastBallX = 0;
    PUPPETS.frame();
  },
  update(env, t, dt) {
    const { rng, cam } = env;
    const P = env.parts;
    const [gx, gy] = ballGuide(env);
    // The ball rolls a foot ahead of him into the guide (spin from the distance it rolled), then spins hard off the boot.
    if (t < T_HIT) {
      const bx = gx - 70 * Math.pow(1 - t / T_HIT, 1.6);
      if (lastBallX) spin.rotate(0, 0, 1, (bx - lastBallX) / (6 * S));
      lastBallX = bx;
    } else if (t >= T_REL) spin.rotate(1, 0.25, -0.35, dt * 38);
    else spin.rotate(1, 0.25, -0.35, dt * 6);

    if (!fired.plant && t >= T_PLANT) {
      fired.plant = true;
      // The plant: a little turf dust off the planted boot (the ground beat is still to come).
      for (let k = 0; k < 8; k++) {
        const a = rng.range(Math.PI * 1.05, Math.PI * 1.6), s = rng.range(40, 140);
        P.spawn({ kind: PK.Smoke, x: PLANT_X - 6, y: GY - 2, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.35, drag: 3, max: rng.range(0.35, 0.6), s0: 5, s1: 14, ramp: 'dust', r0: 0, r1: 1, a0: 0.45, a1: 0, add: false });
      }
    }
    if (!fired.hit && t >= T_HIT) {
      fired.hit = true;
      cam.shakeAmp = 18;
      cam.hit(0.9);
      // Stack A: three stitched rings (the flat ring on the turf at the plant is the ground beat), sparks frozen in the
      // hit-stop (rate 0.03) that burst on the release, light-stitches, ink flecks.
      rings.add({ x: PLANT_X - 4, y: GY + 1, t0: T_HIT, r0: 10, r1: 160, dur: 0.5, squash: 0.35, width: 3 });
      rings.add({ x: gx, y: gy, t0: T_HIT, r0: 8, r1: 220, dur: 0.42 });
      rings.add({ x: gx, y: gy, t0: T_HIT + 0.02, r0: 6, r1: 200, dur: 0.4, color: HEX.pearl });
      jadeSparks(env, gx, gy, 60, 1100, 1.2, -1.08);
      stitchBurst(env, gx, gy, 30, 700, 2.4, -1.08);
      inkFlecks(env, gx, gy, 30, 420);
    }
    if (!fired.rel && t >= T_REL) {
      fired.rel = true;
      cam.shove(5, -9);
      // 40 jade droplets flicked off the stroke's root as it bursts out of the boot.
      for (let k = 0; k < 40; k++) {
        const s = rng.range(0, 160);
        const q = pointAt(PATH, PATH_S, s);
        const side = rng.next() < 0.5 ? -1 : 1, sp = rng.range(120, 420);
        const nx = -q.ty * side, ny = q.tx * side;
        P.spawn({
          kind: PK.Glow, x: gx + q.x, y: gy + q.y, vx: nx * sp + q.tx * sp * 0.6, vy: ny * sp + q.ty * sp * 0.6 - 60, ay: 520, drag: 1.2,
          max: rng.range(0.45, 0.9), s0: rng.range(2.5, 5), s1: 1, ramp: 'jade', r0: 0.15, r1: 0.9, a0: 1, a1: 0, layer: 1,
        });
      }
      stitchBurst(env, gx + 20, gy - 30, 16, 520, 0.9, -1.08);
    }
    // Monument: jade motes rising round him (3 per frame) and droplets flicked off the risen stroke.
    if (t >= 0.72 && t < T_CRASH_END) {
      for (let k = 0; k < 3; k++)
        P.spawn({
          kind: PK.Glow, x: PLANT_X + rng.range(-150, 140), y: GY - rng.range(0, 200), vx: rng.range(-12, 22), vy: rng.range(-130, -60),
          max: rng.range(0.6, 1.1), s0: rng.range(1.5, 3.5), s1: 0.5, ramp: 'jade', r0: 0.2, r1: 0.85, a0: 0.9, a1: 0, layer: 0,
        });
      if (rng.next() < 0.5) {
        const q = pointAt(PATH, PATH_S, rng.range(80, 520));
        P.spawn({ kind: PK.Pixel, x: gx + q.x, y: gy + q.y, vx: rng.range(-40, 40), vy: rng.range(-20, 60), ay: 260, drag: 1, max: rng.range(0.4, 0.8), s0: 2, s1: 1, ramp: 'jade', r0: 0.1, r1: 0.8, a0: 1, a1: 0, layer: 0 });
      }
    }
    // The monument hums with the bowed note from 0.85 (~1.6 px of tremor at shakeAmp 18).
    if (t >= T_MON && t < T_CRASH) holdTrauma(cam, 0.3);
    if (!fired.wink && t >= T_WINK) {
      fired.wink = true;
      cam.hit(0.2);
    }
  },
  render(env, t) {
    const { ctx, fx } = env;
    const rng = env.frng(3);
    PUPPETS.frame();
    const c = camAt(env, t);
    applyCam(env, c);
    const [gx, gy] = ballGuide(env);
    const hero = heroAt(t);
    const drop = standDrop(t);
    const crash = c.zl !== c.z;

    // ---- the stroke (world, relative to the ball guide)
    const sBall = ballS(t);
    const sHead = Math.min(sBall, S_MAX);
    const rel = strokeRel(sHead);
    const stroke: TrailPt[] = rel.map((p) => ({ x: gx + p.x, y: gy + p.y }));
    const born = ease.outBack(clamp((t - T_REL) / 0.09));
    const ballOut = t >= T_REL ? pointAt(PATH, PATH_S, Math.min(sBall, PATH_L)) : null;
    const ballPos: [number, number] = t < T_HIT ? [gx - 70 * Math.pow(1 - t / T_HIT, 1.6), gy] : ballOut ? [gx + ballOut.x, gy + ballOut.y] : [gx, gy];

    // ---- 1. the stadium (far layer during the crash), the far line, Night Ink with the stroke band restored
    env.screen();
    ctx.fillStyle = HEX.night;
    ctx.fillRect(0, 0, VW, VH);
    farLayer(env, c);
    const camX = env.cam.x;
    const light = stroke.length > 1 ? 1 : 0;
    const tint = TOWERS.map((tx) => lampTintFor(lampHead(tx, camX, drop), stroke.length > 1 ? stroke : [], light));
    ctx.save();
    ctx.translate(0, drop);
    drawFieldBackdrop(ctx, env.art.stadium, camX, env.cam.y - drop, 40 + t, { lampTint: [0, 2, 4, 6].map((i) => tint[i]) });
    EXTRA_TOWERS.forEach((tx) => extraTower(ctx, env, tx, camX, tint[TOWERS.indexOf(tx)]));
    ctx.restore();
    if (drop > 0) {
      // The turf stays under his feet: only the stands slide; the pitch is redrawn below the dropped stand line.
      ctx.save();
      ctx.beginPath();
      ctx.rect(camX - 900, FIELD.horizon + drop, 1800, 900);
      ctx.clip();
      ctx.drawImage(env.art.stadium.pitch, 0, FIELD.horizon);
      ctx.fillStyle = '#287a35';
      if (camX - 900 < 0) ctx.fillRect(camX - 900, FIELD.horizon, 900 - camX, 900);
      ctx.restore();
    }
    nightInk(ctx, 0.8, stroke.length > 1 ? { pts: stroke, w: 90 * born, soft: 60 } : undefined);
    // The far line in ink: lookFar (still swivelled by the look-off), then craneUp as the stroke passes over them.
    drawLine(env, camX, t < 0.86 ? -1 : (t - 0.86) / 0.6, t >= 0.76);

    // ---- 2. the lamp heads kept alive over the ink (floodlights stay ON, passive); they catch the stroke's jade
    let best = -1, bestT = 0;
    TOWERS.forEach((tx, i) => {
      const [lx, ly] = lampHead(tx, camX, drop);
      if (Math.abs(lx - camX) > 700) return;
      lampOverInk(ctx, lx, ly, tint[i]);
      // The flare goes on the nearest head the stroke's body does not cover (a flare under the body is never seen).
      if (tint[i] > bestT && distToPolyline(lx, ly, stroke) > 64) {
        bestT = tint[i];
        best = i;
      }
    });
    if (best >= 0 && bestT > 0.05) {
      const [lx, ly] = lampHead(TOWERS[best], camX, drop);
      // At most 120 px on screen whatever the layer's scale.
      jadeFlare(ctx, lx, ly, (120 * bestT) / c.zl, 0.9 * bestT);
    }

    // ---- 3. the turf beat (main layer): his contact shadow, the stitched rings (the flat ring at the plant)
    env.world();
    ctx.save();
    ctx.fillStyle = 'rgba(2,8,6,0.55)';
    ctx.beginPath();
    const shx = hero.anchor === 'contact' ? hero.x - 14 : hero.x;
    const shw = hero.anchor === 'pelvis' ? 46 : 62;
    ctx.ellipse(shx, GY + 2, shw, shw * 0.16, 0, 0, TAU);
    ctx.fill();
    if (t < T_REL) {
      ctx.beginPath();
      ctx.ellipse(ballPos[0], GY + 1, 15, 3, 0, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
    rings.draw(ctx, t);
    if (stroke.length > 1 && !crash) {
      // The stroke's light falls on the turf round its root (light only: nothing opens in the turf).
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.emerald), gx + 10, GY, 120 * born, 0.45, 1.6, 0.3);
      drawGlow(ctx, glowOf(PAL.jade), gx + 6, GY, 50 * born, 0.35, 1.8, 0.25);
      ctx.restore();
    }

    // ---- 3b. after the print the focus lines sit BEHIND the stroke, No.10 and the ball (screen space, drawn in the
    // world pass): starting outside the ball's 70 px glow, their jade tips dimmed, so the hit-stop keeps him and the
    // squashed ball clear and the ball the brightest point.
    const [bsx, bsy] = toScreen(env, gx, gy);
    if (t >= T_PRINT_END && t < 0.8) {
      const fa = t < T_REL ? 0.85 : 0.75 * (1 - ease.inQuad(clamp((t - T_REL) / 0.12)));
      env.screen();
      inkFocus(ctx, rng, bsx, bsy, 140, 820, 90, fa, HEX.jade, 0.6);
      env.world();
    }

    // ---- 4. the Meridian (far layer during the crash): bursting out of the boot, then the jade rainbow
    if (stroke.length > 1) {
      farLayer(env, c);
      const wHead = lerp(52, 92, clamp(sHead / 620)) * born;
      const ballIn = sBall < S_MAX;
      // The string rings: a plucked standing wave as it bursts out of the boot (decaying), then the bowed note the arc
      // sings from 0.85 (a small sustained vibration, two nodes). Geometry only, never a brightness flicker.
      const ring = 9 * Math.exp(-Math.max(0, t - T_REL) / 0.3) + 2.2 * clamp((t - T_MON) / 0.2);
      meridianStroke(ctx, stroke, wHead, {
        tail: 44 * born, head: ballIn ? 13 * born : 0, t, stars: { spacing: 34 }, cross: { every: 68 },
        pluck: { amp: ring, phase: t * 56, nodes: t < T_MON ? 1 : 2 },
      });
      if (t >= T_MON) {
        // The arc sings (the bow at 0.85): pearl pulses run up the stroke from his boot, three in flight.
        const L = arcLengths(stroke);
        const Ls = L[L.length - 1];
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let k = 0; k < 3; k++) {
          const u = ((t - T_MON) * 0.9 + k / 3) % 1;
          const q = pointAt(stroke, L, u * Ls);
          const a = clamp((t - T_MON) / 0.15) * Math.sin(Math.PI * u);
          drawGlow(ctx, glowOf(PAL.mint), q.x, q.y, 46, 0.45 * a);
          drawGlow(ctx, glowOf(PAL.pearl), q.x, q.y, 16, 0.8 * a);
        }
        ctx.restore();
      }
      if (crash) {
        // The risen stroke glows behind his head in the close-up.
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const q = pointAt(PATH, PATH_S, 230);
        drawGlow(ctx, glowOf(PAL.emerald), gx + q.x, gy + q.y, 260, 0.35 * clamp((t - T_CRASH) / 0.14));
        ctx.restore();
      }
      env.world();
    }

    // ---- 5. the swing smear (LF1s) and the release smear behind LF3
    if (t >= T_SWING && t < T_HIT) {
      const pts: TrailPt[] = [];
      const [ox, oy] = heroPt(env, 'LF1s', 'outside');
      for (let i = 0; i <= 10; i++) {
        const u = i / 10;
        pts.push({ x: lerp(PLANT_X - 70, ox, u) + Math.sin(u * Math.PI) * -6, y: lerp(GY - 80, oy, u) + Math.sin(u * Math.PI) * 26 });
      }
      inkSmear(ctx, pts, 22, 0.35);
      // Ink alone vanishes on the night turf: an additive jade pass over the same sweep gives the swing its read.
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ribbon(ctx, pts, 0, 22, HEX.jade, 0.45);
      ribbon(ctx, pts, 0, 8, HEX.mint, 0.35);
      ctx.restore();
    }

    // ---- 6. No.10 (with the monument's jade rim light from above / the stroke side)
    const printA = t >= T_HIT && t < T_STAGE_B;
    const printB = t >= T_STAGE_B && t < T_PRINT_END;
    const f = no10(hero.key);
    if (printA) {
      // Stage A prints the contact as a manga page: a jagged mint burst behind his whole figure (centred on his torso,
      // its inner points well outside him, so head, torso and boot all print as one crisp ink silhouette on mint), its
      // glow's falloff printing as the halftone dot ring; the squashed ball cut free of the boot by a mint rim.
      const bx0 = gx - 40, by0 = gy - 80;
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = HEX.mint;
      ctx.beginPath();
      const N = 30;
      for (let i = 0; i < N * 2; i++) {
        const an = (i / (N * 2)) * TAU + 0.07;
        const r = i % 2 ? 160 + 50 * hash01(i * 7.1) : 320 + 220 * hash01(i * 3.7) * hash01(i * 1.3 + 5);
        const x = bx0 + Math.cos(an) * r, y = by0 + Math.sin(an) * r;
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.mint), bx0, by0, 230, 0.75);
      ctx.restore();
      if (f) drawHero(env, hero, f.a.tinted(f.i, PAL.ink));
      else drawHero(env, hero);
      // (the squashed ball is printed after the particles, step 8, so the frozen sparks never wash it out)
    } else if (printB) {
      // Stage B ("pearl negative") is stage A's trick reversed: he prints as ONE clean emerald silhouette on pearl, so
      // he is drawn as a solid pearl shape (the post maps light to emerald, the night ground to pearl).
      if (f) drawHero(env, hero, f.a.tinted(f.i, PAL.pearl));
      else drawHero(env, hero);
    }
    const rim = clamp((t - 0.7) / 0.15) * (t < T_WHIP ? 1 : 1 - (t - T_WHIP) / 0.12);
    if (f && rim > 0 && !printA && !printB) {
      // The rim copies sit a constant ~2-3 screen px out whatever the zoom (at the crash's 3.1 a world offset would
      // print as a misregistered duplicate, not a rim light).
      const img = f.a.tinted(f.i, PAL.jade);
      const kz = 1.1 / Math.max(1.1, c.z);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawHero(env, hero, img, 2.4 * kz, -3 * kz, 0.85 * rim);
      drawHero(env, hero, img, 1.2 * kz, -1.2 * kz, 0.5 * rim);
      ctx.restore();
    }
    if (!printA && !printB) drawHero(env, hero);

    // ---- 7. the ball: rolling, squashed on the boot (37 px, jade seams), then rocketing out along the stroke
    if (t < T_HIT) {
      drawBall(env, spin, ballPos[0], ballPos[1], 6, S, 0, 0.25, 'pearl');
    } else if (printA) {
      // (drawn into the silhouette above)
    } else if (printB) {
      // Stage B: the squashed ball as one solid pearl shape (prints emerald with him) with a thin ink ring; no glow
      // and no spin marks, which printed as a 100 px emerald disc with a broken C ring.
      ctx.save();
      ctx.translate(gx + 2, gy - 1);
      ctx.rotate(-1.08);
      ctx.beginPath();
      ctx.ellipse(0, 0, 14.4 * 0.7, 14.4 * 1.25, 0, 0, TAU);
      ctx.fillStyle = HEX.pearl;
      ctx.fill();
      ctx.strokeStyle = HEX.ink;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    } else if (t < T_REL) {
      const deep = ease.outCubic(clamp((t - T_HIT) / 0.04));
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.jade), gx, gy, 70, 0.5);
      drawGlow(ctx, glowOf(PAL.mint), gx, gy, 34, 0.6);
      ctx.restore();
      ctx.save();
      ctx.translate(gx + 2, gy - 1);
      ctx.rotate(-1.08);
      drawBall(env, spin, 0, 0, 12, 1.2, 0, 1.3, 'pearl', { sx: lerp(1, 0.7, deep), sy: lerp(1, 1.25, deep), dent: 0.35 * deep }, { seamGlow: 0.9 });
      ctx.restore();
      spinMarks(ctx, gx, gy, 15, t * 3, { color: HEX.jade, len: 1.2, width: 4, dir: -1 });
    } else if (ballOut && sBall < S_MAX) {
      const sp = clamp((t - T_REL) / 0.1);
      const sq = lerp(0.82, 1, sp);
      ctx.save();
      ctx.translate(ballPos[0], ballPos[1]);
      ctx.rotate(Math.atan2(ballOut.ty, ballOut.tx));
      drawBall(env, spin, 0, 0, 12, 1.2, 0, 1.2, 'pearl', { sx: 1 / sq, sy: sq }, { seamGlow: 0.8 });
      ctx.restore();
      spinMarks(ctx, ballPos[0], ballPos[1], 15, t * 22, { color: HEX.jade, len: 1.3, width: 4, dir: -1, alpha: 1 - sp * 0.4 });
    }

    // ---- 8. particles
    env.parts.draw(ctx, 0);
    env.parts.draw(ctx, 1);
    if (printA) {
      // Stage A's ball: an ink ellipse squashed along the boot normal, cut free of the boot by a mint rim 3 px out,
      // printed over the frozen sparks (on top of them, it reads "head away, boot under the ball").
      ctx.save();
      ctx.translate(gx + 2, gy - 1);
      ctx.rotate(-1.08);
      ctx.beginPath();
      ctx.ellipse(0, 0, 14.4 * 0.7 + 3, 14.4 * 1.25 + 3, 0, 0, TAU);
      ctx.strokeStyle = HEX.mint;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = HEX.ink;
      ctx.beginPath();
      ctx.ellipse(0, 0, 14.4 * 0.7, 14.4 * 1.25, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    // ---- 9. screen-space ink: run streaks, focus lines, flight lines, the chevrons, the inset, the wink
    env.screen();
    runStreaks(ctx, rng, 1 - clamp((t - 0.18) / 0.08));
    // The print's focus lines (on top, as part of the page): 70 of them, starting 300 px out so they frame the
    // silhouette instead of slicing through it. After the print they move behind him (step 3b).
    if (t >= T_HIT && t < T_PRINT_END) inkFocus(ctx, rng, bsx, bsy, 300, 820, 70, 1, printB ? HEX.pearl : HEX.jade);
    if (t >= T_REL && t < 0.9) flightLines(ctx, rng, bsx, bsy, 1 - clamp((t - T_REL) / 0.24));
    // "eyes here, ball there": in the main frame a jade chevron above the ball points DOWN at it (a dash trail falling
    // onto it), while the inset's < points away with his eyes.
    if (t >= T_INSET && t < T_HIT) {
      const [qx, qy] = toScreen(env, ballPos[0], ballPos[1]);
      const pop = ease.outBack(clamp((t - T_INSET - 0.04) / 0.08));
      const a = 1;
      const bob = 3 * Math.sin((t - T_INSET) * 26);
      ctx.save();
      ctx.globalAlpha = a * clamp(pop);
      for (let k = 0; k < 3; k++) {
        const dy = qy - 104 + k * 13 + bob;
        ctx.fillStyle = HEX.ink;
        ctx.fillRect(Math.round(qx - 3 - 1), Math.round(dy - 1), 5, 9);
        ctx.fillStyle = HEX.jade;
        ctx.fillRect(Math.round(qx - 3), Math.round(dy), 3, 7);
      }
      ctx.restore();
      chevron(ctx, qx - 1, qy - 44 + bob, 15 * pop, Math.PI / 2, a);
    }
    // The whip's travel this instant (the content's offset change, reversed): it swings right along the stroke, then
    // up. The streaks and the shared fx.streak run along it.
    let wdx = 0, wdy = -1;
    if (t >= T_WHIP) {
      const c0 = camAt(env, t - 0.006);
      const mx = -(c.wx - c0.wx), my = -(c.wy - c0.wy);
      if (Math.hypot(mx, my) > 1e-3) {
        wdx = mx;
        wdy = my;
      }
      whipStreaks(ctx, rng, 0.6 * clamp((t - T_WHIP) / (0.6 * (DUR - T_WHIP))), wdx, wdy);
    }
    drawInset(env, t);

    // The wink: a pearl sparkle and a 120 px JADE_FLARE on the open eye's OUTER corner (T8b art (86,23), 4 px right
    // of and 1 px above the 'eye' anchor (82,24), right on the face's edge): the open eye itself stays readable, and
    // the flare's horizontal streak runs out over the dark stands, where it reads jade instead of white on the skin.
    if (t >= T_WINK && t < T_WHIP + 0.06) {
      const [ewx, ewy] = heroPt(env, 'T8b', 'eye');
      const [ex, ey] = toScreen(env, ewx + 4 * S, ewy - 1 * S);
      const w = ease.outBack(clamp((t - T_WINK) / 0.07)) * (1 - clamp((t - 1.74) / 0.08));
      jadeFlare(ctx, ex, ey, 120 * w, w);
      sparkle(ctx, ex, ey, 14 * w, w, 0.3);
    }

    // ---- 10. post: grade, Stack A's halftone print (F1 0.50, F2 0.56), shocks, CA, radial, the pluck warp, the whip
    // Bloom 1.05 (1.2 through the contact); the close-up keeps his face from blowing out (threshold 0.72).
    // The breath (0.22-0.50) closes the vignette in on him; it opens again with the release.
    const breath = clamp((t - T_PLANT) / 0.12) * (1 - clamp((t - T_REL) / 0.2));
    // Stage B prints with no bloom: the bloom of his pearl shape would swell the emerald silhouette into a blob.
    // Stage A prints with half the bloom, so the squashed ball and his arms stay solid ink (a full bloom of the mint
    // field greys small dark shapes into the dot band).
    nightGrade(fx, { bloom: printB ? 0 : printA ? 0.6 : t >= T_HIT && t < 0.72 ? 1.2 : 1.05, thresh: t >= 1.52 ? 0.72 : 0.64, vignette: 0.6 + 0.16 * breath });
    // Stage A's dot band narrowed per the brief's rule (0.16 -> 0.10) so it holds at most 25 % of the frame.
    if (t >= T_HIT && t < T_STAGE_B) halftoneImpact(fx, 'A', 1, { band: TONE_BAND });
    else if (t >= T_STAGE_B && t < T_PRINT_END) halftoneImpact(fx, 'B');
    const [bu, bv] = [bsx / VW, bsy / VH];
    if (t >= T_HIT && t < 1.0) {
      const s1 = t - T_HIT;
      pushShock(fx, { x: bu, y: bv, r: s1 * 1.5, s: 0.06 * (1 - clamp(s1 / 0.45)) });
      if (t >= T_HIT + 0.05) pushShock(fx, { x: bu, y: bv, r: (t - T_HIT - 0.05) * 1.3, s: 0.035 * (1 - clamp((t - T_HIT - 0.05) / 0.4)) });
      if (t >= T_REL) pushShock(fx, { x: bu, y: bv, r: (t - T_REL) * 1.8, s: 0.025 * (1 - clamp((t - T_REL) / 0.3)) });
      // (stage B keeps its silhouette crisp: a strong radial / CA smear swells the pearl shape before the two-tone)
      fx.ca = printB ? 0.006 : t < T_PRINT_END ? 0.012 : 0.008 * (1 - clamp((t - T_REL) / 0.16));
      fx.radial = printB ? 0.04 : t < T_PRINT_END ? 0.1 : t < T_REL ? 0.025 : 0.05 * (1 - clamp((t - T_REL) / 0.1));
      fx.radialX = bu;
      fx.radialY = bv;
    }
    if (stroke.length > 4 && t < T_CRASH) {
      // The string is plucked as it bursts out of the boot: the picture bends along the rising stroke.
      const a = stroke[0], m = stroke[Math.floor(stroke.length / 2)], b = stroke[stroke.length - 1];
      const A = toScreen(env, a.x, a.y), Mm = toScreen(env, m.x, m.y), B = toScreen(env, b.x, b.y);
      setPluck(fx, null, [A, [2 * Mm[0] - (A[0] + B[0]) / 2, 2 * Mm[1] - (A[1] + B[1]) / 2], B], { amp: 0.02, n: 2, hz: 9, decay: 0.6, w: 0.08, tSince: t - T_REL, glow: 0.4 });
    }
    if (t >= T_WINK && t < T_WHIP && stroke.length > 4) {
      // The wink plucks it once more (a small one).
      const a = farToScreen(env, c, stroke[0].x, stroke[0].y), q = pointAt(PATH, PATH_S, 300), b = pointAt(PATH, PATH_S, 620);
      const M = farToScreen(env, c, gx + q.x, gy + q.y), B = farToScreen(env, c, gx + b.x, gy + b.y);
      setPluck(fx, null, [a, [2 * M[0] - (a[0] + B[0]) / 2, 2 * M[1] - (a[1] + B[1]) / 2], B], { amp: 0.008, n: 1, hz: 9, decay: 0.3, w: 0.1, tSince: t - T_WINK });
    }
    if (t >= 1.52 && t < 1.64) {
      // The crash punch-in's zoom blur, centred on his head (it hides the world's jump at the 1.58 seam).
      const [hu, hv] = env.cam.toUV(...crashHead(env, t));
      fx.radial = 0.09 * Math.sin(Math.PI * clamp((t - 1.52) / 0.12));
      fx.radialX = hu;
      fx.radialY = hv;
    }
    // The plant's tilt up onto LF1 (0.22-0.30) carries a light vertical streak.
    if (t >= T_PLANT && t < T_TILT_END) whip(fx, 0.04 * Math.sin(Math.PI * clamp((t - T_PLANT) / (T_TILT_END - T_PLANT))), 0, -1);
    if (t >= T_WHIP) whip(fx, 0.1 * ease.inQuad(clamp((t - T_WHIP) / (DUR - T_WHIP - 0.02))), wdx, wdy);
    assertMeridianFx(fx);
  },
};
