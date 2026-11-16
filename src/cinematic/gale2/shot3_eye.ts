// GALE HAMMER v2 · shot 3 · "Eye of the storm" (2.0 s, seed 313): the monument. SPEC.md §6 shot 3.
//
// Story job: awe. He is bigger than the weather. GALE's answer to ZENITH's fire aura and CRESCENT's inverted stadium.
//   0.00-0.45  outside a stadium hurricane: a funnel of racing ice / cyan bands, storm cloud, cups, a corner flag and a
//              scarf orbiting counter-clockwise; No.10 stands half-hidden inside it. The camera pushes (inCubic) at
//              his chest under a hard tremor; the cloud ceiling turns over the west stand.
//   0.45-0.60  the punch-through: the near wall rushes at the lens (front bands at parallax 1.4 -> 3.4 and the wall's own
//              layers at the lens: navy ribbons with ice edges sweeping right -> left, his face in the gaps; a dark veil
//              under them; a light radial <= 0.06, CA 0.01; flagged fx.fullFrame: E3) and we are inside.
//   0.60-1.55  the calm eye: he stands at 255-290 px (StormStand ×2, SS1 / SS2 at 10 fps: hair and hem up in the
//              updraft), still as a statue. 30 dew beads hang motionless, glinting. The far wall races round behind
//              him; the near wall only tears past the frame's edges. A wind aura of horizontal arcs wraps him with the
//              cyclone. Three breaths at 0.85 / 1.15 / 1.32 (quickening, never on a beat): 2-frame lurches of the
//              camera (zoom +0.03, crane up 10 px), the cyclone tightens a notch, a new crop-circle ring is pressed
//              into the turf (r 110 / 170 / 240) with a dew spray and a turf shock, the lens pinch deepens (the stands
//              and the floodlight beams bend in toward him), the ball lifts 3 px.
//   1.55       SS3: his head snaps up to the lens and his eyes ignite (two cyan points, hard 300 px anamorphic streaks,
//              flare, bloom 0.9 -> 1.15 over threshold 0.7) at the current framing: no push, no crash.
//   1.62-1.85  the eye bursts: the wall he has been holding in place blows outward past the lens (back bands × 1 ->
//              2.6; two vapour collars and the near blast bands at parallax 2.5 cross the frame for ~9 frames, a soft
//              hole fitted to his body kept open: <= 45 % of the frame, never a counted full-frame event), the cups,
//              the flag and the scarf are flung past the camera from just outside his body, the dew sprays outward,
//              the crop circle blows out and fades, the pinch releases and the stadium springs back (a small
//              overshoot), the beams spring straight. Blow-back zoom 1.42 -> 1.15, cam.shove(0, -14), cam.hit(0.5).
//   1.85-2.00  the wind wipe (left -> right) into shot 4's side view.
//
// Space: the shot's world is a front low-angle composition (No.10's planted contact at (320, 318), studio ×2) under
// the runner's camera. The stadium is the shared up-pitch renderer (looking west, eye 0.65 m high, 4.7 m in front of
// him) whose focal length and principal point follow the camera, so the backdrop, the figure and every effect stay
// registered through the zoom, the crane, the shake and the shove. Every camera value, decal, band and prop is a pure
// function of the shot clock; particles spawn only in update() on env.rng, one-shot bursts behind flags.

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { TAU, clamp, ease, lerp } from '../../engine/math';
import { PK, drawGlow, glowOf, softSprite } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { FIELD, drawUpPitch, projectDecal, type DownPitchView } from '../../art/stadium';
import { drawAnim, findFrame, type StudioAnim } from '../../art/studioAnim';
import { drawNo10, no10 } from '../../art/no10';
import { lensFlare } from '../../art/fx';
import { drawBall, holdTrauma, keys, pushShock, type KeyRow } from '../kit';
import { HEX, MUFFLE, PAL, RATE, SHOTS, galeStorm, sparkleCyan, stormDarken, warmGale } from './common';
import { anamorphic, windWipe } from './air';
import { drawInhaleOpening } from './shot4_inhale';

const META = SHOTS[2];
const DUR = META.dur;

// ---------------------------------------------------------------- the composition (world px of this shot)

/** StormStand draw scale (studio ×2: 204 px tall at zoom 1, 265 px at 1.30, 290 px at 1.42). */
const SC = 2;
/** His planted contact (the frame's contact anchor lands here). */
const FX = 320, FY = 318;
/** Frame row / column -> world (the contact anchor is (64.5, 103) in frame space). */
const rowY = (r: number) => FY + (r - 103) * SC;
const colX = (c: number) => FX + (c - 64.5) * SC;
const CHEST_Y = rowY(46.5);

/** The up-pitch eye: 4.7 m in front of him (he stands at field x 850, 3 m behind the ball), 0.65 m high, looking west. */
const EYE = { x: 897, z: 266, h: 6.5, f: 560 } as const;
const HE_X = 850;
/** World y of the horizon (his feet sit EYE.h world px below it at his depth). */
const HZ_Y = FY - EYE.h * (EYE.f / (EYE.x - HE_X));
const GOAL_Z = (FIELD.goalFar + FIELD.goalNear) / 2;

/** The cyclone's spin (rev/s, counter-clockwise seen from above: its near side runs right -> left). */
const SPIN = 1.4;

// ---------------------------------------------------------------- timing (unwarped shot clock; rate is 1 throughout)

const T_PUNCH = 0.45, T_IN = 0.6, T_EYES = 1.55, T_BURST = 1.62, T_OUT = 1.85, T_WIPE = 1.85;
/** The three breaths: quickening (0.30 s, then 0.17 s), never on a beat. */
const LURCH = [0.85, 1.15, 1.32] as const;

const ZOOM: KeyRow[] = [
  [0, 0.85], [T_PUNCH, 1.2, 'inCubic'], [T_IN, 1.3, 'outCubic'],
  [LURCH[0], 1.33, 'step2'], [LURCH[1], 1.36, 'step2'], [LURCH[2], 1.39, 'step2'],
  [T_EYES, 1.42, 'linear'], [T_BURST, 1.42], [T_OUT, 1.15, 'outCubic'], [DUR, 1.13, 'linear'],
];
/**
 * Camera centre y: it starts 30 px under his chest (the whole figure, boots and the foreground ball in frame) and cranes
 * up 10 px on each breath, so at zoom 1.42 his boots still sit ~20 px above the bottom edge; the blow-back reframes.
 */
const CY: KeyRow[] = [
  [0, CHEST_Y + 30], [T_IN, CHEST_Y + 30, 'outCubic'],
  [LURCH[0], CHEST_Y + 20, 'step2'], [LURCH[1], CHEST_Y + 10, 'step2'], [LURCH[2], CHEST_Y, 'step2'],
  [T_BURST, CHEST_Y], [T_OUT, CHEST_Y + 14, 'outCubic'],
];
/** The lens pinch at his chest (lensR 0.6), released at the burst with a small spring overshoot. */
const PINCH: KeyRow[] = [
  [T_IN - 0.034, 0], [T_IN, -0.06, 'step2'], [LURCH[0], -0.12, 'step2'], [LURCH[1], -0.17, 'step2'], [LURCH[2], -0.22, 'step2'],
  [T_BURST, -0.22], [1.72, 0.05, 'outCubic'], [1.8, -0.015, 'inOutQuad'], [1.88, 0, 'inOutQuad'],
];
/** The crop circle: [radius, stamp time]. */
const RINGS = [[50, T_IN], [110, LURCH[0]], [170, LURCH[1]], [240, LURCH[2]]] as const;

const burstK = (t: number) => ease.outCubic(clamp((t - T_BURST) / (T_OUT - T_BURST)));
/** The held wall's fade at the burst, on a linear clock (its outer bands are still racing outward at 1.78). */
const wallFade = (t: number) => 1 - Math.pow(clamp((t - T_BURST) / 0.26), 2.2);
const pulseAt = (t: number, at: number, len: number) => (t < at || t > at + len ? 0 : 1 - (t - at) / len);

/** Frame-stable hash in [0, 1). */
const hash = (n: number) => {
  const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
};

// ---------------------------------------------------------------- No.10 (StormStand; never the puppet)

type SSKey = 'SS1' | 'SS2' | 'SS3' | 'SS3b';
/** SS1 / SS2 at 10 fps to 1.55; then SS3 / SS3b keep the hair and hem flapping while the cyclone bursts. */
const SEQ3: readonly (readonly [number, SSKey])[] = [
  ...Array.from({ length: 16 }, (_, i) => [+(i * 0.1).toFixed(2), i % 2 ? 'SS2' : 'SS1'] as const).filter(([at]) => at < T_EYES - 1e-6),
  [T_EYES, 'SS3'], [1.65, 'SS3b'], [1.75, 'SS3'], [1.85, 'SS3b'], [1.95, 'SS3'],
];
function keyAt(t: number): SSKey {
  let k: SSKey = SEQ3[0][1];
  for (const [at, key] of SEQ3) if (t >= at - 1e-6) k = key;
  return k;
}
/** The studio frame for a StormStand key (SS3b from the strip itself; StandFront stand-ins otherwise), or null. */
function heroFrame(key: SSKey): { a: StudioAnim; i: number } | null {
  const f = no10(key === 'SS3b' ? 'SS3' : key);
  if (!f) return null;
  if (key === 'SS3b' && f.ref === 0) {
    const i = findFrame(f.a, 'SS3b', 'SS3');
    return { a: f.a, i: i >= 0 ? i : f.i };
  }
  return { a: f.a, i: f.i };
}

/** Opaque extents per frame row (the wind aura samples his width there). */
const rowCache = new Map<HTMLCanvasElement, [number, number, number][]>();
function rowsOf(a: StudioAnim, i: number): [number, number, number][] {
  const fr = a.frames[i];
  let rows = rowCache.get(fr.img);
  if (!rows) {
    rows = [];
    for (let y = 0; y < a.h; y += 2) {
      let x0 = -1, x1 = -1;
      for (let x = 0; x < a.w; x++)
        if (fr.px[(y * a.w + x) * 4 + 3] > 40) {
          if (x0 < 0) x0 = x;
          x1 = x;
        }
      if (x0 >= 0) rows.push([y, x0, x1]);
    }
    rowCache.set(fr.img, rows);
  }
  return rows;
}

// ---------------------------------------------------------------- projection (world -> screen, with the camera)

interface Proj {
  z: number;
  cx: number;
  cy: number;
  /** Screen position of the camera centre (shake and shove included). */
  sx: number;
  sy: number;
}
function proj(env: Env): Proj {
  const c = env.cam;
  const [u, v] = c.toUV(c.x, c.y);
  return { z: c.zoom, cx: c.x, cy: c.y, sx: u * VW, sy: v * VH };
}
/** Screen x / y of a world point; `par` > 1 = nearer the lens than the subject plane (it scales about the centre). */
const PX = (p: Proj, x: number, par = 1) => p.sx + (x - p.cx) * p.z * par;
const PY = (p: Proj, y: number, par = 1) => p.sy + (y - p.cy) * p.z * par;

function setCam(env: Env, t: number) {
  env.cam.set(FX, keys(CY, t), keys(ZOOM, t), 0);
}

// ---------------------------------------------------------------- the stadium (looking west) and the bent beams

function stadiumView(p: Proj): DownPitchView {
  return { x: EYE.x, z: EYE.z, h: EYE.h, f: EYE.f * p.z, horizon: PY(p, HZ_Y), cx: PX(p, FX), dir: -1 };
}

const FLAG_PAL = [['#e8e8f0', '#2a3fa8'], ['#2a3fa8', '#ffd34a'], ['#ffd34a', '#e8e8f0']] as const;

/** Flags whipping on the west stand (left -> right: the far side of the cyclone's flow), drawn before the darken. */
function standFlags(ctx: CanvasRenderingContext2D, v: DownPitchView, t: number, gust: number) {
  const top = projectDecal(40, GOAL_Z, 150, v), base = projectDecal(40, GOAL_Z, 0, v);
  const s = Math.max(0.6, top.s);
  for (let i = 0; i < 26; i++) {
    const z = GOAL_Z - 820 + i * 66 + hash(i * 3.1) * 30;
    const q = projectDecal(40, z, 120 + hash(i * 7.7) * 40, v);
    if (q.x < -20 || q.x > VW + 20) continue;
    const len = Math.round((9 + hash(i) * 6) * s * 1.6);
    // Home colours only (white, royal blue, gold): never crimson in GALE.
    const pal = FLAG_PAL[i % 3];
    ctx.fillStyle = '#1c1830';
    ctx.fillRect(Math.round(q.x), Math.round(q.y - 2 * s), 1, Math.round(10 * s));
    for (let k = 0; k < len; k++) {
      const ph = t * (16 + gust * 10) - k * 0.55 + i;
      const yy = q.y + Math.sin(ph) * (1 + gust * 1.6) * (k / len) - 2 * s;
      ctx.fillStyle = pal[k % 5 < 3 ? 0 : 1];
      ctx.fillRect(Math.round(q.x + 1 + k), Math.round(yy), 1, Math.max(2, Math.round(3 * s)));
    }
  }
  void base;
}

function drawStadium(env: Env, t: number, p: Proj) {
  const ctx = env.ctx;
  env.screen();
  const v = stadiumView(p);
  drawUpPitch(ctx, env.art.stadium, v, t, { storm: 1, ambientFlashes: false });
  standFlags(ctx, v, t, 1);
  // The storm darken: the stands sink, then the floodlights wash a little of the crowd back (35-40 %). The burst's
  // pressure wave sinks them a notch further for 0.3 s (it darkens; it never flashes).
  stormDarken(ctx, 0.5 + (t >= T_BURST ? 0.1 * (1 - clamp((t - T_BURST) / 0.3)) : 0));
  const sL = projectDecal(40, GOAL_Z + 900, 0, v), sR = projectDecal(40, GOAL_Z - 900, 0, v), sT = projectDecal(40, GOAL_Z, 150, v);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.16;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(env.art.stadium.crowd, 0, 0, env.art.stadium.crowd.width, env.art.stadium.crowd.height, sL.x, sT.y, sR.x - sL.x, sL.y - sT.y);
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = 1;

  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}

/**
 * The floodlights (the up-pitch towers' lamps) glowing through the far wall, and their volumetric beams piercing it,
 * bent toward him by the pressure lens (they spring straight when it releases).
 */
function drawLights(env: Env, t: number, p: Proj, bend: number, through: number, beamK = 1) {
  const ctx = env.ctx;
  env.screen();
  const v = stadiumView(p);
  ctx.globalCompositeOperation = 'lighter';
  const chestX = PX(p, FX), chestY = PY(p, CHEST_Y);
  for (const side of [-1, 1]) {
    // The two towers nearest the eye, pinned inside the frame's top corners so they read at every zoom.
    const L0 = projectDecal(-20, GOAL_Z + side * 330, 250, v);
    const L = { x: clamp(L0.x, 30, VW - 30), y: Math.max(22, L0.y) };
    const fl = 0.92 + 0.08 * Math.sin(t * 29 + side);
    const zb = Math.min(1.6, p.z);
    drawGlow(ctx, glowOf([70, 110, 210]), L.x, L.y - 6, 220 * zb, 0.22 * fl, 1.3, 0.55);
    drawGlow(ctx, glowOf([150, 200, 255]), L.x, L.y, 70 * zb, 0.3 * fl * through);
    // A navy housing under a 2 x 4 lamp bank (never a round disc: no moon in GALE), as in shot 4.
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = HEX.navy;
    ctx.fillRect(Math.round(L.x - 17 * zb), Math.round(L.y - 6 * zb), Math.round(34 * zb), Math.round(15 * zb));
    ctx.fillRect(Math.round(L.x - 1.5 * zb), Math.round(L.y + 9 * zb), Math.max(2, Math.round(3 * zb)), Math.round(80 * zb));
    ctx.globalCompositeOperation = 'lighter';
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 4; c++) drawGlow(ctx, glowOf([235, 248, 255]), L.x + (c - 1.5) * 8 * zb, L.y + (r - 0.5) * 6 * zb, 4.5 * zb, 0.95 * fl * through);
    drawGlow(ctx, glowOf([180, 225, 255]), L.x, L.y, 9 * zb, 0.45 * fl * through, 16, 0.45);
    // Beam: lamp -> the turf beside him, a quadratic whose control point is pulled hard toward his chest by the lens.
    const sideScr = Math.sign(L.x - chestX) || side;
    const gx = PX(p, FX + sideScr * 175), gy = PY(p, FY + 14);
    const mx = (L.x + gx) / 2, my = (L.y + gy) / 2;
    const k = 0.65 * bend;
    const qx = lerp(mx, chestX, k), qy = lerp(my, chestY, k * 0.6);
    // Inside the eye the beams are softer (the lens never drags the floodlights into a white smear across the wall).
    const inside = clamp((t - T_PUNCH) / (T_IN - T_PUNCH));
    beam(ctx, L.x, L.y, qx, qy, gx, gy, 12 * p.z, 130 * p.z, lerp(0.2, 0.12, inside) * fl * beamK);
    beam(ctx, L.x, L.y, qx, qy, gx, gy, 4 * p.z, 48 * p.z, lerp(0.3, 0.18, inside) * fl * beamK);
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}

/** One volumetric cone along a quadratic (additive; width w0 at the lamp to w1 at the turf), fading toward the turf. */
function beam(ctx: CanvasRenderingContext2D, x0: number, y0: number, qx: number, qy: number, x1: number, y1: number, w0: number, w1: number, a: number) {
  const N = 14;
  const L: number[] = [], R: number[] = [];
  for (let i = 0; i <= N; i++) {
    const s = i / N, m = 1 - s;
    const bx = m * m * x0 + 2 * m * s * qx + s * s * x1, by = m * m * y0 + 2 * m * s * qy + s * s * y1;
    const dx = 2 * m * (qx - x0) + 2 * s * (x1 - qx), dy = 2 * m * (qy - y0) + 2 * s * (y1 - qy);
    const l = Math.hypot(dx, dy) || 1;
    const w = lerp(w0, w1, s) / 2;
    L.push(bx - (dy / l) * w, by + (dx / l) * w);
    R.push(bx + (dy / l) * w, by - (dx / l) * w);
  }
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, `rgba(200,230,255,${a * 1.3})`);
  g.addColorStop(0.3, `rgba(160,208,255,${a})`);
  g.addColorStop(0.62, `rgba(120,180,255,${a * 0.35})`);
  g.addColorStop(0.85, 'rgba(120,180,255,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(L[0], L[1]);
  for (let i = 2; i < L.length; i += 2) ctx.lineTo(L[i], L[i + 1]);
  for (let i = R.length - 2; i >= 0; i -= 2) ctx.lineTo(R[i], R[i + 1]);
  ctx.closePath();
  ctx.fill();
}

// ---------------------------------------------------------------- the cloud ceiling, turning with the storm

interface LidPuff { r: number; ph: number; om: number; s: number; tone: number; a: number }
const LID: LidPuff[] = Array.from({ length: 64 }, (_, i) => {
  const r = 120 + 520 * Math.pow(hash(i * 1.91), 0.8);
  return { r, ph: hash(i * 4.37) * TAU, om: (TAU * 0.5 * 160) / (r + 60), s: 55 + 90 * hash(i * 2.53), tone: 0.6 + 0.3 * hash(i * 6.1), a: 0.45 + 0.35 * hash(i * 8.3) };
});
const LID_Y = 40, LID_SQ = 0.16;

/** The cloud lid seen from below: dark storm puffs on ellipses round the eye's axis (the near side turns right -> left). */
function drawLid(ctx: CanvasRenderingContext2D, p: Proj, t: number, a: number) {
  if (a <= 0) return;
  const horizon = PY(p, HZ_Y);
  for (const q of LID) {
    const th = q.ph + q.om * t;
    const x = PX(p, FX + Math.cos(th) * q.r), y = PY(p, LID_Y - Math.sin(th) * q.r * LID_SQ);
    const s = q.s * p.z;
    if (y - s > horizon - 60 * p.z || x < -s || x > VW + s || y < -s) continue;
    ctx.globalAlpha = q.a * a;
    ctx.drawImage(softSprite('storm', q.tone), x - s, y - s * 0.6, s * 2, s * 1.2);
  }
  // The floodlights catch the underside of the lid (cool, faint, additive).
  ctx.globalCompositeOperation = 'lighter';
  for (const q of LID) {
    if (q.a < 0.65) continue;
    const th = q.ph + q.om * t;
    const x = PX(p, FX + Math.cos(th) * q.r), y = PY(p, LID_Y - Math.sin(th) * q.r * LID_SQ + 18);
    ctx.globalAlpha = 0.07 * a;
    ctx.drawImage(softSprite('storm', 0.15), x - q.s * p.z * 0.7, y - q.s * p.z * 0.2, q.s * p.z * 1.4, q.s * p.z * 0.4);
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- 3D: the cyclone, the crop circle, the aura, the dew

/**
 * The shot's 3D frame (composition px): his axis stands D0 ahead of the lens (the stadium view's focal length, so the
 * turf, the stands and every ring here share one perspective), the lens H_EYE above the turf. X = right, h = height
 * above the turf, dz = depth behind his axis (< 0 = nearer the lens). Returns screen x, y and screen px per unit.
 */
const D0 = EYE.f;
const H_EYE = FY - HZ_Y;
const ZNEAR = 60;
const P3 = new Float32Array(3);
function p3(p: Proj, X: number, h: number, dz: number): boolean {
  const Z = D0 + dz;
  if (Z < ZNEAR) return false;
  const s = D0 / Z;
  P3[0] = PX(p, FX + X * s);
  P3[1] = PY(p, HZ_Y + (H_EYE - h) * s);
  P3[2] = s * p.z;
  return true;
}

/** The wall: a cylinder of racing vapour round his axis, radius R at the turf, flaring 28 % to its top (WALL_H). */
const WALL_H = 760, FLARE = 0.28;
/** Outside: the wall hugs him (R 250, the lens outside it); the punch-through blows it past the lens (R 690: we are
 *  inside); each breath tightens it a notch; the burst blows it outward (× 2.8) and it fades. */
const RW: KeyRow[] = [
  [0, 250], [T_PUNCH, 266, 'linear'], [T_IN, 690, 'inCubic'],
  [LURCH[0], 664, 'step2'], [LURCH[1], 638, 'step2'], [LURCH[2], 612, 'step2'],
];
function wallR(t: number) {
  return keys(RW, Math.min(t, T_BURST)) * (1 + 1.8 * burstK(t));
}
/**
 * Film fix M1: the far half of the wall (everything drawn behind him: the vapour body, the cloud puffs, the bands and the
 * debris riding them). Inside the eye it stands much closer behind him (R 480, then 455 / 430 / 405 at the three
 * breaths) than the near half (which stays out past the lens), so the back wall spans the frame behind him as a turning
 * cylinder of racing bands: a stadium hurricane, not fog. The burst blows it outward with the rest.
 */
const RW_BACK: KeyRow[] = [
  [0, 250], [T_PUNCH, 266, 'linear'], [T_IN, 480, 'inCubic'],
  [LURCH[0], 455, 'step2'], [LURCH[1], 430, 'step2'], [LURCH[2], 405, 'step2'],
];
function backR(t: number) {
  return keys(RW_BACK, Math.min(t, T_BURST)) * (1 + 1.8 * burstK(t));
}
/**
 * The burst's blast ring (the held eye wall let go): from just outside his body out past the lens and on over the
 * stands. It leaves at 2400 px/s and slows (-2400 px/s²), so its near arcs take ~9 frames to cross the frame while the
 * far arcs keep racing away behind him.
 */
function blastR(t: number) {
  const s = clamp(t - T_BURST, 0, 0.9);
  return 170 + 2400 * s - 1200 * s * s;
}

interface Band { h: number; w: number; om: number; span: number; ph: number; a: number; c: number; wob: number }
const mkBands = (n: number, salt: number, hMax: number, wMin: number, wMax: number): Band[] =>
  Array.from({ length: n }, (_, i) => {
    const k = i + salt;
    const hc = hash(k * 4.41);
    return {
      h: hMax * Math.pow(hash(k * 1.37 + 0.1), 1.25),
      w: wMin + (wMax - wMin) * Math.pow(hash(k * 5.31), 2),
      om: TAU * SPIN * (0.8 + 0.4 * hash(k * 2.71)),
      span: 0.5 + 1.2 * hash(k * 3.97),
      ph: hash(k * 9.73) * TAU,
      a: 0.4 + 0.55 * hash(k * 7.13),
      c: hc < 0.3 ? 1 : hc < 0.42 ? 2 : 0,
      wob: hash(k * 6.61) * TAU,
    };
  });
const BANDS = mkBands(76, 0, WALL_H, 4, 22);
const BLAST = mkBands(22, 300, 430, 6, 16);
/** Six bands low on the wall (h 40-180) that cross in front of him outside: he stands half-hidden inside it. */
const NEAR_BANDS: Band[] = mkBands(6, 700, 1, 8, 16).map((b, i) => ({ ...b, h: 40 + (140 * (i + hash(i * 2.3) * 0.6)) / 6, a: 0.7, span: 1.1 + 0.6 * hash(i * 4.9) }));
/**
 * The punch-through's wall layers: the near face of the wall rushing at the lens (0.45-0.60). Seven layers stacked round
 * the lens height (so, as the face closes in, they fan out across the frame, the ones above the lens flying up, the ones
 * below flying down), each a short arc whose head crosses in front of the lens at its own moment (0.47-0.60), so dark
 * ribbons with ice edges keep sweeping right -> left with gaps between them where he shows.
 */
const PUNCH_H = [52, 63, 71, 84, 93, 105, 121] as const;
const PUNCH_BANDS: Band[] = PUNCH_H.map((h, i) => {
  const om = TAU * 0.42 * (0.85 + 0.3 * hash(i * 3.7 + 0.2));
  const tc = 0.47 + 0.13 * ((i * 0.618 + 0.11) % 1);
  return { h, w: 2.6 + 1.4 * hash(i * 5.9), om, span: 0.32 + 0.22 * hash(i * 2.3), ph: Math.PI / 2 + 0.05 - om * tc, a: 0.8 + 0.2 * hash(i * 1.7), c: i % 3 === 1 ? 1 : 0, wob: hash(i * 6.1) * TAU };
});
/** The punch layers' ring: their near face closes from 240 px in front of the lens to 75 px over the punch-through. */
function punchR(t: number) {
  const zn = lerp(240, 75, ease.inQuad(clamp((t - T_PUNCH) / (T_IN - T_PUNCH))));
  return (D0 - zn) / (1 + (FLARE * H_EYE) / WALL_H);
}

// ---- the wall's vapour body: a ray-cast cylinder surface on low-res buffers, upscaled soft

/** One shading buffer: the far face at 128 × 72; the near (veil) face, only seen outside and through the punch-through,
 *  at 96 × 54. Per-column ray slopes are cached per frame (they only depend on the camera). */
interface WallBuf {
  w: number;
  h: number;
  cv: HTMLCanvasElement | null;
  g: CanvasRenderingContext2D | null;
  img: ImageData | null;
  kCol: Float32Array;
  aCol: Float32Array;
}
const mkBuf = (w: number, h: number): WallBuf => ({ w, h, cv: null, g: null, img: null, kCol: new Float32Array(w), aCol: new Float32Array(w) });
const WB_FAR = mkBuf(128, 72), WB_NEAR = mkBuf(96, 54);
function bufReady(b: WallBuf): WallBuf {
  if (!b.cv) {
    b.cv = document.createElement('canvas');
    b.cv.width = b.w;
    b.cv.height = b.h;
    b.g = b.cv.getContext('2d')!;
    b.img = b.g.createImageData(b.w, b.h);
  }
  return b;
}
/** Value noise on a fixed lattice table (no trig per texel: the surface shades ~14k texels a frame at most). */
const NZ = new Float32Array(512).map((_, i) => hash(i * 1.618 + 0.37) * 2 - 1);
function vnoise(x: number, seed: number) {
  x += seed * 37.7;
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  const a = NZ[i & 511], b = NZ[(i + 1) & 511];
  return a + (b - a) * u;
}
/** A sine table (4096 steps a turn) and a polynomial atan2 (|error| < 1e-5 rad): the shader's per-texel trig. */
const SIN_N = 4096, SIN_K = SIN_N / TAU;
const SIN_T = new Float32Array(SIN_N).map((_, i) => Math.sin(i / SIN_K));
function fsin(x: number) {
  let i = (x * SIN_K) % SIN_N;
  if (i < 0) i += SIN_N;
  return SIN_T[i | 0];
}
function fatan2(y: number, x: number) {
  const ax = x < 0 ? -x : x, ay = y < 0 ? -y : y;
  const mx = ax > ay ? ax : ay;
  if (mx === 0) return 0;
  const a = (ax > ay ? ay : ax) / mx, s = a * a;
  let r = ((-0.0464964749 * s + 0.15931422) * s - 0.327622764) * s * a + a;
  if (ay > ax) r = 1.57079637 - r;
  if (x < 0) r = 3.14159274 - r;
  return y < 0 ? -r : r;
}
/** The vapour's own (slower) drift round the eye, rad/s: the streaks race over it at the full spin. */
const SURF_SPIN = TAU * 0.42;

/**
 * The wall's body: every texel's ray from the lens is intersected with the (slightly flared) cylinder (`near` = the
 * entry point, only when the lens is outside it; else the far side), and the hit is shaded by a vapour texture of
 * strata bent round the eye and drifting with it: dark storm grey to lit vapour, a cool cyan bounce where the inner
 * face looks at him (the lit vapour damped right behind him, so his rim and aura stay the hottest things round him),
 * fading into fog at the turf and into the cloud lid at the top. The near face is denser over his body (he stands
 * half-hidden inside it); on the punch-through (`veil`) it turns to dark navy vapour cut by bright ice strata.
 * Pure function of (t, R, camera).
 */
function drawSurface(ctx: CanvasRenderingContext2D, p: Proj, t: number, R: number, near: boolean, alpha: number, veil = 0) {
  if (alpha <= 0) return;
  const b = bufReady(near ? WB_NEAR : WB_FAR);
  const d = b.img!.data;
  const W = b.w, H = b.h, kCol = b.kCol, aCol = b.aCol;
  const ph0 = SURF_SPIN * t;
  const kx = VW / W, ky = VH / H;
  let pulseA = 0, pulseH = 0;
  for (const a of LURCH) {
    const age = t - a;
    if (age >= 0 && age < 0.36) {
      pulseA = 0.55 * (1 - age / 0.36);
      pulseH = age * 2300;
    }
  }
  for (let i = 0; i < W; i++) {
    const k = (p.cx + ((i + 0.5) * kx - p.sx) / p.z - FX) / D0;
    kCol[i] = k;
    aCol[i] = k * k + 1;
  }
  const D2 = D0 * D0, zMin = ZNEAR * 0.4, vk = 0.7 * veil;
  const litCap = lerp(1, 0.45, clamp((t - T_PUNCH) / (T_IN - T_PUNCH)));
  let any = false;
  for (let j = 0; j < H; j++) {
    const sy = (p.cy + ((j + 0.5) * ky - p.sy) / p.z - HZ_Y) / D0;
    for (let i = 0; i < W; i++) {
      const o = (j * W + i) * 4;
      const k = kCol[i], A = aCol[i];
      let Z = -1, h = 0, r = R;
      for (let it = 0; it < 2; it++) {
        const disc = D2 - A * (D2 - r * r);
        if (disc < 0) {
          Z = -1;
          break;
        }
        const sq = Math.sqrt(disc);
        Z = near ? (D0 - sq) / A : (D0 + sq) / A;
        h = H_EYE - sy * Z;
        r = R * (1 + (FLARE * (h < 0 ? 0 : h > WALL_H ? WALL_H : h)) / WALL_H);
      }
      if (Z < zMin || h < -20 || h > WALL_H) {
        d[o + 3] = 0;
        continue;
      }
      const X = k * Z, dz = Z - D0;
      const ph = fatan2(-dz, X) - ph0;
      // Grazing density: where the lens looks along the wall (its silhouette edges) the vapour stacks up.
      const cosI = Math.abs((X * X + dz * Z) / (r * Math.sqrt(X * X + Z * Z)));
      const graze = 0.75 + 0.25 / (cosI > 0.3 ? cosI : 0.3);
      // Strata bent round the eye, broken along the flow, and cloud columns (towers) that march round with it: their
      // spacing squeezes toward the frame's edges, so the wall reads as a turning cylinder.
      const s1 = vnoise(h * 0.026 + fsin(ph * 2 + h * 0.004) * 1.4, 3);
      const s2 = vnoise(ph * 3.4 + h * 0.05, 11);
      const c0 = 0.5 + 0.5 * fsin(ph * 9 + vnoise(h * 0.012 + ph, 5) * 2.2);
      let v = 0.3 + 0.6 * s1 + 0.3 * s2 + 0.35 * c0 * c0 * c0;
      v = v < 0 ? 0 : v > 1 ? 1 : v;
      // Each breath sends a tightening ring up the wall (a lit band racing from the turf to the lid).
      if (pulseA > 0) {
        const q = (h - pulseH) / 46;
        v += pulseA * Math.exp(-q * q);
        if (v > 1) v = 1;
      }
      // Fog at the turf, into the lid at the top.
      const e0 = (h + 20) / 90, e1 = (WALL_H - h) / 220;
      const edge = (e0 > 1 ? 1 : e0) * (e1 > 1 ? 1 : e1 < 0 ? 0 : e1);
      let a = (0.3 + 0.62 * v) * edge * graze;
      let lit = v * v * v;
      let cr: number, cg: number, cb: number;
      if (near) {
        // Denser over his body (h < 200), thinner above; the veil mixes toward dark navy vapour with bright strata.
        const hk = (h - 170) / 60;
        const nk = 0.8 - 0.25 * (hk < 0 ? 0 : hk > 1 ? 1 : hk);
        a = lerp(a * nk, a > 0.82 ? a : 0.82, veil);
        const br = 10 + 165 * lit, bg = 14 + 185 * lit, bb = 34 + 205 * lit;
        const l2 = lit * lit * veil;
        // The veil is a dark under-layer: its ice strata stay faint (the crisp canvas bands carry the punch).
        cr = br + (16 - br) * vk + 55 * l2;
        cg = bg + (22 - bg) * vk + 65 * l2;
        cb = bb + (52 - bb) * vk + 80 * l2;
      } else {
        // Cool cyan bounce where the inner face looks back at him; the lit vapour right behind him damped by half.
        const ax = 1 - Math.abs(X) / 240, ah = 1 - Math.abs(h - 150) / 240;
        const bounce = (ax > 0 ? ax : 0) * (ah > 0 ? ah : 0) * 0.6;
        const dx = 1 - Math.abs(X) / 300, dh = 1 - Math.abs(h - 130) / 200;
        lit *= 1 - 0.5 * (dx > 0 ? dx : 0) * (dh > 0 ? dh : 0);
        // Inside the eye the far wall never burns white where the beams cross it: he stays the one hot subject (capped
        // at 0.45 from T_IN, eased in over the punch-through so the cut inside never jumps in brightness).
        if (lit > litCap) lit = litCap;
        cr = 10 + 165 * lit + 16 * bounce;
        cg = 14 + 185 * lit + 64 * bounce;
        cb = 34 + 205 * lit + 110 * bounce;
      }
      d[o] = cr;
      d[o + 1] = cg;
      d[o + 2] = cb;
      d[o + 3] = 255 * (a > 1 ? 1 : a);
      any = true;
    }
  }
  if (!any) return;
  b.g!.putImageData(b.img!, 0, 0);
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.globalAlpha = clamp(alpha);
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(b.cv!, 0, 0, VW, VH);
  ctx.restore();
  ctx.imageSmoothingEnabled = false;
}

interface Puff { h: number; om: number; ph: number; s: number; tone: number; a: number }
const PUFFS: Puff[] = Array.from({ length: 70 }, (_, i) => ({
  h: WALL_H * Math.pow(hash(i * 2.19 + 0.3), 1.2),
  om: TAU * SPIN * (0.7 + 0.25 * hash(i * 3.3)),
  ph: hash(i * 5.77) * TAU,
  s: 40 + 70 * hash(i * 1.71),
  tone: 0.55 + 0.35 * hash(i * 8.9),
  a: 0.45 + 0.55 * hash(i * 4.1),
}));

interface WallOpts {
  R: number;
  alpha: number;
  /** Vapour body (the dark ribbons and puffs) strength. */
  body: number;
  /** Screen-space alpha mask (keeps the centre open on him). */
  mask?: (x: number, y: number) => number;
  /** Puff sprite ramp ('storm' = the wall's cloud; 'vapor' = the blast's condensation). */
  puff?: 'storm' | 'vapor';
  /** Stroke width multiplier (the near bands rushing at the lens on the punch-through: parallax 2.5). */
  wMul?: number;
  /** Ribbon width per band width and screen scale (default 3), and its screen cap (default by wMul). */
  bodyK?: number;
  bodyMax?: number;
  /** Ice edges: the hot streak rides the ribbon's upper edge and a cyan line its lower edge (the punch's wall layers). */
  edge?: boolean;
  /** Ribbon colour ('r,g,b'; default by `puff`): the punch-through's ribbons are storm navy, so they read dark. */
  bodyRgb?: string;
  /** A 1 px ice line along each vapour ribbon's upper edge at this alpha (the back wall inside the eye: film fix M1). */
  iceEdge?: number;
}

const SEG = 8;
const sx = new Float32Array(SEG + 1), sy = new Float32Array(SEG + 1), ss = new Float32Array(SEG + 1), sm = new Float32Array(SEG + 1);
const sok = new Uint8Array(SEG + 1);

/** Project band b's points (tail -> head) at time t; returns whether any segment lies in the requested half. */
function bandPts(p: Proj, b: Band, t: number, R: number, front: boolean, mask?: (x: number, y: number) => number): boolean {
  const th1 = b.ph + b.om * t;
  const r = R * (1 + (FLARE * b.h) / WALL_H);
  let any = false;
  for (let j = 0; j <= SEG; j++) {
    const th = th1 - b.span * (1 - j / SEG);
    const sn = Math.sin(th);
    const ok = p3(p, Math.cos(th) * r, b.h + Math.sin(th * 2 + b.wob) * 6, -sn * r) && P3[2] < 14 * p.z;
    sok[j] = ok && (sn > 0) === front ? 1 : 0;
    if (!ok) continue;
    sx[j] = P3[0];
    sy[j] = P3[1];
    ss[j] = P3[2];
    sm[j] = mask ? mask(P3[0], P3[1]) : 1;
    if (sok[j]) any = true;
  }
  return any;
}
const segOn = (j: number) => sok[j] && sok[j - 1] && !((sx[j] < -120 && sx[j - 1] < -120) || (sx[j] > VW + 120 && sx[j - 1] > VW + 120));

/** Where the foreground ball sits on screen this frame (the streak heads keep off it). */
const ballScr = { x: -1e4, y: -1e4, r: 0 };
/** Screen caps on one stroke (a band right at the lens would otherwise paint the whole frame one flat tone). */
const STREAK_MAX = 40, BODY_MAX = 150;
/** On the punch-through (and the burst's near bands: wMul > 1) the near streaks stay ice edges on wide dark ribbons. */
const STREAK_MAX_PUNCH = 24, BODY_MAX_PUNCH = 220;

/**
 * Fill a tapered ribbon along band points ja..jb (sx / sy, shifted `dy(j)` px down): one polygon, so there are no joints
 * and no caps (never stacked tubes or blocky slab ends), its alpha ramped along the chord through per-point stops.
 */
function ribbon(ctx: CanvasRenderingContext2D, ja: number, jb: number, rgb: string, wOf: (j: number) => number, aOf: (j: number) => number, dy: (j: number) => number = () => 0, X: Float32Array = sx, Y: Float32Array = sy) {
  if (jb <= ja) return;
  const sx = X, sy = Y;
  const x0 = sx[ja], y0 = sy[ja] + dy(ja), x1 = sx[jb], y1 = sy[jb] + dy(jb);
  const cx = x1 - x0, cy = y1 - y0, cl2 = cx * cx + cy * cy || 1;
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (let j = ja; j <= jb; j++) g.addColorStop(clamp(((sx[j] - x0) * cx + (sy[j] + dy(j) - y0) * cy) / cl2), `rgba(${rgb},${clamp(aOf(j)).toFixed(3)})`);
  ctx.fillStyle = g;
  ctx.beginPath();
  for (let side = 1; side >= -1; side -= 2) {
    for (let q = 0; q <= jb - ja; q++) {
      const j = side > 0 ? ja + q : jb - q;
      const a = Math.max(ja, j - 1), b = Math.min(jb, j + 1);
      const tx = sx[b] - sx[a], ty = sy[b] + dy(b) - sy[a] - dy(a), l = Math.hypot(tx, ty) || 1;
      const w = (wOf(j) / 2) * side;
      const x = sx[j] - (ty / l) * w, y = sy[j] + dy(j) + (tx / l) * w;
      if (q === 0 && side > 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.fill();
}
/** The contiguous drawable runs of the current band (segments on screen and out of the mask's hole), as [ja, jb]. */
function bandRuns(): [number, number][] {
  const runs: [number, number][] = [];
  let ja = -1;
  for (let j = 1; j <= SEG; j++) {
    const on = segOn(j) && Math.min(sm[j], sm[j - 1]) > 0.02;
    if (on && ja < 0) ja = j - 1;
    if (!on && ja >= 0) {
      runs.push([ja, j - 1]);
      ja = -1;
    }
  }
  if (ja >= 0) runs.push([ja, SEG]);
  return runs;
}
const BAND_TRI = ['238,251,255', '70,216,255', '170,220,250'];
const BODY_TRI_STORM = '40,52,88', BODY_TRI_VAPOR = '150,190,230', CYAN_TRI = '70,216,255', BODY_TRI_NAVY = '6,11,36';

/**
 * One half of a ring of bands: dark vapour ribbons first (normal blend: leaf-shaped, thin at both ends), then the racing
 * streaks (additive: tapered from a hair-thin tail to the head, fading in along their length). Each one a single
 * polygon; a small hot head on each streak.
 */
function drawBands(ctx: CanvasRenderingContext2D, p: Proj, t: number, set: readonly Band[], front: boolean, o: WallOpts) {
  if (o.alpha <= 0) return;
  const wm = o.wMul ?? 1;
  const bodyMax = o.bodyMax ?? (wm > 1 ? BODY_MAX_PUNCH : BODY_MAX);
  const cap = wm > 1 ? STREAK_MAX_PUNCH : STREAK_MAX;
  const bodyW = (b: Band, j: number) => Math.min(bodyMax, b.w * (o.bodyK ?? 3) * ss[j] * wm);
  const leaf = (j: number) => Math.sin((Math.PI * (j + 0.6)) / (SEG + 1.2));
  if (o.body > 0) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    const tri = o.bodyRgb ?? (o.puff === 'vapor' ? BODY_TRI_VAPOR : BODY_TRI_STORM);
    for (const b of set) {
      if (!bandPts(p, b, t, o.R, front, o.mask)) continue;
      const a = 0.32 * b.a * o.alpha * o.body;
      for (const [ja, jb] of bandRuns()) {
        ribbon(ctx, ja, jb, tri, (j) => bodyW(b, j) * (0.35 + 0.65 * leaf(j)), (j) => a * sm[j] * (0.55 + 0.45 * leaf(j)));
      }
    }
    if (o.iceEdge) {
      // The ribbons' crisp upper edges (additive ice, 1 px): the bands read as solid turning strata, not haze.
      ctx.globalCompositeOperation = 'lighter';
      for (const b of set) {
        if (!bandPts(p, b, t, o.R, front, o.mask)) continue;
        const a = o.iceEdge * b.a * o.alpha;
        for (const [ja, jb] of bandRuns())
          ribbon(ctx, ja, jb, '238,251,255', () => 1, (j) => a * sm[j] * leaf(j), (j) => -0.5 * bodyW(b, j) * (0.35 + 0.65 * leaf(j)));
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  }
  ctx.globalCompositeOperation = 'lighter';
  for (const b of set) {
    if (!bandPts(p, b, t, o.R, front, o.mask)) continue;
    // A small hot head on each streak (an ellipse along its tangent, never a block), kept off the foreground ball.
    if (sok[SEG] && sx[SEG] > -20 && sx[SEG] < VW + 20 && sy[SEG] > -20 && sy[SEG] < VH + 20) {
      const hs = Math.min(5, Math.max(2, b.w * ss[SEG] * 0.6)) * sm[SEG];
      const bx = sx[SEG] - ballScr.x, by = sy[SEG] - ballScr.y, br = ballScr.r + hs * 2;
      const hy = o.edge ? -0.45 * bodyW(b, SEG) : 0;
      if (hs > 0.4 && bx * bx + by * by > br * br) {
        drawGlow(ctx, glowOf(b.c === 1 ? PAL.cyan : PAL.ice), sx[SEG], sy[SEG] + hy, hs * 2.2, 0.55 * b.a * o.alpha * sm[SEG], 1.8, 0.8);
        const ang = sok[SEG - 1] ? Math.atan2(sy[SEG] - sy[SEG - 1], sx[SEG] - sx[SEG - 1]) : 0;
        ctx.globalAlpha = clamp(b.a * o.alpha * sm[SEG]);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(sx[SEG], sy[SEG] + hy, hs * 1.1, hs * 0.4, ang, 0, TAU);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    const sw = (j: number) => Math.min(cap, Math.max(1, b.w * ss[j] * (0.15 + 0.85 * (j / SEG)) * 0.5 * wm));
    const sa = (j: number) => b.a * o.alpha * (j / SEG) * sm[j];
    for (const [ja, jb] of bandRuns()) {
      if (o.edge) {
        // The ice edge rides the ribbon's upper edge, a thinner cyan line its lower edge.
        ribbon(ctx, ja, jb, BAND_TRI[b.c], (j) => Math.max(2, sw(j) * 0.5), sa, (j) => -0.45 * bodyW(b, j));
        ribbon(ctx, ja, jb, CYAN_TRI, (j) => Math.max(1, sw(j) * 0.25), (j) => 0.55 * sa(j), (j) => 0.45 * bodyW(b, j));
      } else ribbon(ctx, ja, jb, BAND_TRI[b.c], sw, sa);
    }
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}

/** The wall's cloud mass orbiting with the bands (normal blend). */
function drawPuffs(ctx: CanvasRenderingContext2D, p: Proj, t: number, front: boolean, o: WallOpts) {
  const a = o.alpha * o.body;
  if (a <= 0) return;
  for (const q of PUFFS) {
    const th = q.ph + q.om * t;
    const sn = Math.sin(th);
    if (sn > 0 !== front) continue;
    const r = o.R * (1 + (FLARE * q.h) / WALL_H);
    if (!p3(p, Math.cos(th) * r, q.h, -sn * r) || P3[2] > 10 * p.z) continue;
    const x = P3[0], y = P3[1], s = q.s * P3[2];
    if (x < -s * 1.4 || x > VW + s * 1.4 || y < -s || y > VH + s) continue;
    const m = o.mask ? o.mask(x, y) : 1;
    if (m <= 0.02) continue;
    ctx.globalAlpha = clamp(q.a * a * m);
    ctx.drawImage(softSprite(o.puff ?? 'storm', o.puff === 'vapor' ? 0.3 + q.tone * 0.4 : q.tone), x - s * 1.4, y - s * 0.5, s * 2.8, s);
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- debris riding the wall

type PropKind = 'cup' | 'flag' | 'scarf';
interface Prop { k: PropKind; h: number; ph: number; om: number }
const PROPS: Prop[] = [
  { k: 'cup', h: 150, ph: 0.4, om: 1.15 },
  { k: 'cup', h: 300, ph: 2.6, om: 1.3 },
  { k: 'cup', h: 70, ph: 4.4, om: 1.05 },
  { k: 'flag', h: 220, ph: 1.4, om: 1.2 },
  { k: 'scarf', h: 380, ph: 3.6, om: 1.1 },
];
/** Two more on an inner orbit (R × 0.5), drawn only behind him (dz > 0): a cup and the scarf passing at 25-35 px. */
const INNER: Prop[] = [
  { k: 'cup', h: 128, ph: 2.2, om: 0.85 },
  { k: 'scarf', h: 168, ph: 5.3, om: 0.8 },
];
/** Comp px per prop art px. */
const PROP_K = 6;
/** A prop's largest on-screen extent (px): at the lens it stays a readable object, never a blurred box. */
const PROP_MAX = 36;
/** Each prop's largest dimension in art px. */
const PROP_EXT: Record<PropKind, number> = { cup: 9, flag: 16, scarf: 27 };
/** Small bits (grass, turf crumbs, dew) riding the bands. */
const BITS = Array.from({ length: 40 }, (_, i) => ({ h: WALL_H * 0.7 * Math.pow(hash(i * 3.9), 1.6), ph: hash(i * 7.3) * TAU, om: TAU * SPIN * (0.9 + 0.3 * hash(i)), k: i % 3 }));
/** The scarf's stripes (home colours: never crimson in GALE). */
const SCARF = ['#ffd34a', HEX.ice, '#2a3fa8'] as const;

/** One prop at screen (x, y), `s` screen px per art px (capped at `maxPx` on screen), rotated `rot`. */
function drawProp(ctx: CanvasRenderingContext2D, k: PropKind, x: number, y: number, s: number, rot: number, t: number, a: number, maxPx = PROP_MAX) {
  if (a <= 0) return;
  s = Math.min(s, maxPx / PROP_EXT[k]);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(s, s);
  ctx.globalAlpha = clamp(a);
  if (k === 'cup') {
    // A paper cup: a tapered body (wide mouth up), shaded on one side, a cobalt band, an elliptical rim and mouth.
    const body = (x0: number, x1: number, y0: number, y1: number, c: string) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(-x0, y0);
      ctx.lineTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.lineTo(-x1, y1);
      ctx.closePath();
      ctx.fill();
    };
    body(3.7, 2.7, -3.4, 4.5, HEX.navy);
    body(3.1, 2.15, -3.2, 3.9, '#e8ecf4');
    ctx.fillStyle = '#98a4be';
    ctx.beginPath();
    ctx.moveTo(1.5, -3.2);
    ctx.lineTo(3.1, -3.2);
    ctx.lineTo(2.15, 3.9);
    ctx.lineTo(1.05, 3.9);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = HEX.cobalt;
    ctx.beginPath();
    ctx.moveTo(-2.85, -0.5);
    ctx.lineTo(2.85, -0.5);
    ctx.lineTo(2.6, 1.2);
    ctx.lineTo(-2.6, 1.2);
    ctx.closePath();
    ctx.fill();
    for (const [rx, ry, c] of [[3.8, 1.25, HEX.navy], [3.2, 0.85, HEX.ice], [2.5, 0.5, '#33405f']] as const) {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.ellipse(0, -3.3, rx, ry, 0, 0, TAU);
      ctx.fill();
    }
  } else if (k === 'flag') {
    // The corner flag: pole and a yellow / navy check, flapping.
    ctx.fillStyle = HEX.navy;
    ctx.fillRect(-1, -8, 3, 16);
    ctx.fillRect(0.5, -8, 7.5, 6);
    ctx.fillStyle = '#ffd34a';
    ctx.fillRect(0, -7, 1, 14);
    for (let c = 0; c < 6; c++) {
      const dy = Math.sin(t * 26 + c * 0.9) * 0.8 * (c / 5);
      for (let r = 0; r < 4; r++) {
        ctx.fillStyle = (c + r) % 2 ? '#24336e' : '#ffd34a';
        ctx.fillRect(1 + c, -7 + r + dy, 1, 1);
      }
    }
  } else {
    for (let sgm = 0; sgm < 13; sgm++) {
      const yy = Math.sin(t * 19 - sgm * 0.75) * 1.6 * (sgm / 12);
      ctx.fillStyle = HEX.navy;
      ctx.fillRect(-sgm * 2 - 0.5, yy - 0.5, 3, 3);
      ctx.fillStyle = SCARF[sgm % 3];
      ctx.fillRect(-sgm * 2, yy, 2, 2);
    }
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

/** Where prop q rides at time t (screen x, y, scale, front?), or null when it is behind the lens or off screen. */
function propAt(p: Proj, q: Prop, t: number, R: number): [number, number, number, boolean, number] | null {
  const th = q.ph + q.om * TAU * t;
  const sn = Math.sin(th);
  const r = R * (1 + (FLARE * q.h) / WALL_H);
  if (!p3(p, Math.cos(th) * r, q.h, -sn * r) || P3[2] > 8 * p.z) return null;
  return [P3[0], P3[1], P3[2], sn > 0, th];
}

/** The props and bits of one half, orbiting on the wall (the inner orbit only in the far half: behind him). */
function drawRiders(ctx: CanvasRenderingContext2D, p: Proj, t: number, front: boolean, o: WallOpts) {
  if (o.alpha <= 0) return;
  for (const q of BITS) {
    const th = q.ph + q.om * t;
    const sn = Math.sin(th);
    if (sn > 0 !== front) continue;
    const r = o.R * (1 + (FLARE * q.h) / WALL_H);
    if (!p3(p, Math.cos(th) * r, q.h, -sn * r) || P3[2] > 8 * p.z) continue;
    const x = P3[0], y = P3[1];
    if (x < -10 || x > VW + 10 || y < -10 || y > VH + 10) continue;
    const s = Math.max(1, Math.round(P3[2] * 3));
    ctx.globalAlpha = clamp(o.alpha);
    ctx.fillStyle = q.k === 0 ? '#3f9a48' : q.k === 1 ? '#5a4030' : HEX.ice;
    ctx.fillRect(Math.round(x), Math.round(y), s * (q.k === 0 ? 3 : 1), s);
  }
  ctx.globalAlpha = 1;
  const ride = (q: Prop, R: number) => {
    const at = propAt(p, q, t, R);
    if (!at || at[3] !== front) return;
    const [x, y, s, , th] = at;
    if (x < -40 || x > VW + 40 || y < -40 || y > VH + 40) return;
    const dir = Math.atan2(Math.cos(th) * 0.2, -Math.sin(th));
    const rot = q.k === 'cup' ? t * 11 + q.ph : dir + (q.k === 'flag' ? Math.sin(t * 7 + q.ph) * 0.6 : 0);
    drawProp(ctx, q.k, x, y, PROP_K * s, rot, t, o.alpha);
  };
  // From the burst on, the cups, the flag and the scarf are the flung ones (drawFlung): never two copies.
  if (t < T_BURST) for (const q of PROPS) ride(q, o.R);
  if (!front) for (const q of INNER) ride(q, o.R * 0.5);
}

/**
 * Where each flung prop leaves from (rad round his chest): diagonals and sides only, clear of his hair, his arms and his
 * legs (his silhouette is at most ~85 px wide either side of his axis at zoom 1.42).
 */
const FLING_A = [-2.35, -0.8, 0.1, 0.85, 2.9] as const;

/**
 * The props flung past the lens at the burst. Each one leaves from where it rode at 1.62 when that is on screen, out of
 * the open hole and near him (<= 200 px); otherwise from a ring 110-140 px round his chest, just outside his body. They
 * launch one after another (30 ms apart), race outward over 0.24 s growing toward the lens (to 90 px), so each one
 * reads for 5+ frames; their ice trails are cut short where they would cross him.
 */
function drawFlung(ctx: CanvasRenderingContext2D, p: Proj, t: number) {
  if (t < T_BURST || t > T_BURST + 0.42) return;
  const R = keys(RW, T_BURST), RB = keys(RW_BACK, T_BURST);
  const cx = PX(p, FX), cy = PY(p, CHEST_Y);
  const mask = openMask(p, 0);
  // His box on screen (head to boots).
  const hx = 70 * p.z, hy0 = PY(p, rowY(6)), hy1 = PY(p, FY);
  const inBox = (x: number, y: number) => Math.abs(x - cx) < hx && y > hy0 && y < hy1;
  PROPS.forEach((q, n) => {
    const u = clamp((t - T_BURST - n * 0.03) / 0.24);
    if (t < T_BURST + n * 0.03 - 1e-6 || u >= 1) return;
    // It rode the near half at R, the far half at RB (film fix M1).
    let at = propAt(p, q, T_BURST, R);
    if (at && !at[3]) at = propAt(p, q, T_BURST, RB);
    const a0 = FLING_A[n % FLING_A.length];
    const rk = 0.85 + 0.23 * hash(n * 4.1 + 0.7);
    const near = at && at[0] > -20 && at[0] < VW + 20 && at[1] > -20 && at[1] < VH + 20 && mask(at[0], at[1]) >= 0.6 && Math.hypot(at[0] - cx, at[1] - cy) <= 200;
    if (!at || !near) at = [cx + Math.cos(a0) * 130 * rk, cy + Math.sin(a0) * 120 * rk, 0.9 * p.z, false, 0];
    const x0 = at[0], y0 = at[1], s0 = at[2];
    const dx = x0 - cx, dy = y0 - cy, l = Math.hypot(dx, dy) || 1;
    const go = 900 * Math.pow(u, 1.5);
    const x = x0 + (dx / l) * go, y = y0 + (dy / l) * go * 0.8;
    // Grows toward the lens (it pops in over 2 frames, never a static object waiting beside him).
    const s = PROP_K * s0 * (0.55 + 0.45 * Math.min(1, u / 0.12) + 6 * Math.pow(u, 1.6));
    // The ice trail back toward him, shortened until it no longer crosses his body.
    let tl = 60 + 200 * u;
    for (let tries = 0; tries < 4 && tl > 8; tries++) {
      let hit = false;
      for (let k = 0; k <= 8 && !hit; k++) hit = inBox(x - ((dx / l) * tl * k) / 8, y - ((dy / l) * tl * 0.8 * k) / 8);
      if (!hit) break;
      tl *= 0.5;
      if (tries === 3) tl = 0;
    }
    if (tl > 8) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = HEX.ice;
      ctx.globalAlpha = 0.45 * (1 - u);
      ctx.lineWidth = Math.max(1, Math.min(12, s * 1.2));
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - (dx / l) * tl, y - (dy / l) * tl * 0.8);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    drawProp(ctx, q.k, x, y, s, t * 16 + n * 1.3, t, 1, PROP_MAX * 2.5);
  });
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- the burst: the eye wall let go

/** Seconds since the burst (0 before it). */
const sinceBurst = (t: number) => Math.max(0, t - T_BURST);
/** How long the blast's layers live (to the end of the shot, under the wipe). */
const BLAST_LIFE = 0.38;

const BLAST_PUFFS = Array.from({ length: 44 }, (_, i) => ({
  th: hash(i * 3.17 + 0.5) * TAU, h: 10 + 330 * Math.pow(hash(i * 6.03), 1.3), s: 50 + 70 * hash(i * 2.41), tone: 0.5 + 0.35 * hash(i * 8.77),
}));

/** The storm vapour thrown out by the blast ring (dark puffs riding it, normal blend), one half. */
function drawBlastVapour(ctx: CanvasRenderingContext2D, p: Proj, t: number, front: boolean, mask: (x: number, y: number) => number) {
  if (t < T_BURST) return;
  const u = clamp(sinceBurst(t) / BLAST_LIFE);
  const a = 0.16 * Math.pow(1 - u, 1.3);
  if (a <= 0) return;
  const R = blastR(t);
  for (const q of BLAST_PUFFS) {
    const th = q.th + t * 2;
    const sn = Math.sin(th);
    if (sn > 0 !== front) continue;
    if (!p3(p, Math.cos(th) * R, q.h * (1 + u), -sn * R) || P3[2] > 9 * p.z) continue;
    const x = P3[0], y = P3[1], sz = q.s * P3[2] * (1 + u);
    if (x < -sz * 1.5 || x > VW + sz * 1.5 || y < -sz || y > VH + sz) continue;
    const m = mask(x, y);
    if (m <= 0.02) continue;
    ctx.globalAlpha = clamp(a * m);
    ctx.drawImage(softSprite('storm', q.tone), x - sz * 1.5, y - sz * 0.55, sz * 3, sz * 1.1);
  }
  ctx.globalAlpha = 1;
}

/**
 * Two thick rings of storm vapour ride the blast (at the turf and over his head): seen from the low lens, their near
 * halves sweep down and up past it over ~10 frames, the wall literally flying out past us. Navy bodies with a storm
 * core and an ice line only on the leading (outer) edge, the centre kept open on him.
 */
const COLLARS = [{ h: 46, w: 48 }, { h: 116, w: 64 }] as const;
/**
 * A collar's widest stroke (screen px): wide enough to read as the wall flying past, never a flat full-frame wash (the
 * dev coverage check, any channel > 12/255, measured 57 % of the frame at 1.717 with a 64 px cap; 38, the far halves
 * at 0.6, 56 px blast ribbons and a fainter ground front keep the burst under 45 %).
 */
const COLLAR_W_MAX = 38;
const CN = 48;
const cX = new Float32Array(CN + 1), cY = new Float32Array(CN + 1), cS = new Float32Array(CN + 1), cM = new Float32Array(CN + 1);
const cOk = new Uint8Array(CN + 1);
/** Segments per stroked chunk: one path each, so a collar's alpha never stacks where its segments overlap. */
const CHUNK = 4;
/** The collars' body layer (device px, reused): drawn whole, then the soft hole round him is cut out of it at once. */
let burstCv: HTMLCanvasElement | null = null;
let burstG: CanvasRenderingContext2D | null = null;
function burstLayer(ctx: CanvasRenderingContext2D): CanvasRenderingContext2D {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  if (!burstCv || burstCv.width !== W || burstCv.height !== H) {
    burstCv = document.createElement('canvas');
    burstCv.width = W;
    burstCv.height = H;
    burstG = burstCv.getContext('2d')!;
  }
  const g = burstG!;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-over';
  g.globalAlpha = 1;
  g.clearRect(0, 0, W, H);
  g.setTransform(ctx.getTransform());
  return g;
}

const COLLAR_TRI = ['10,18,56', '90,140,200'] as const;
/**
 * The two collars of one half. Their navy bodies and storm cores are tapered ring polygons (no chunk caps stacking into
 * dark discs) on the burst layer, the soft hole round him cut out of that layer (openMask's ellipse, `bk` growth), then
 * laid over the frame at the blast's fade; the ice leading edges go on top as thin masked lines (additive).
 */
function drawCollars(ctx: CanvasRenderingContext2D, p: Proj, t: number, front: boolean, bk: number) {
  if (t < T_BURST) return;
  const u = clamp(sinceBurst(t) / BLAST_LIFE);
  if (u >= 1) return;
  const a = 1 - Math.pow(u, 1.5);
  const R = blastR(t) * 0.92;
  const mask = openMask(p, bk);
  const ring = (Rr: number, h: number) => {
    let any = false;
    for (let i = 0; i <= CN; i++) {
      const th = (i / CN) * TAU + t * 3;
      const sn = Math.sin(th);
      const ok = p3(p, Math.cos(th) * Rr, h, -sn * Rr) && P3[2] < 10 * p.z && (sn > 0) === front;
      cX[i] = P3[0];
      cY[i] = P3[1];
      cS[i] = P3[2] * (0.8 + 0.4 * Math.sin(th * 5 + t * 20));
      cOk[i] = ok && !((P3[0] < -200 || P3[0] > VW + 200) && (P3[1] < -200 || P3[1] > VH + 200)) ? 1 : 0;
      cM[i] = ok ? mask(P3[0], P3[1]) : 0;
      if (cOk[i]) any = true;
    }
    return any;
  };
  // 1. Bodies on the burst layer (the far halves, behind him, a little narrower).
  const g = burstLayer(ctx);
  const fk = front ? 1 : 0.6;
  let drew = false;
  for (const c of COLLARS) {
    if (!ring(R, c.h)) continue;
    for (const pass of [0, 1] as const) {
      const wk = pass === 0 ? 1.2 : 0.7, al = pass === 0 ? 0.85 : 0.65;
      let ja = -1;
      for (let i = 0; i <= CN + 1; i++) {
        const on = i <= CN && cOk[i] === 1;
        if (on && ja < 0) ja = i;
        if (!on && ja >= 0) {
          ribbon(g, ja, i - 1, COLLAR_TRI[pass], (k) => wk * fk * Math.min(COLLAR_W_MAX, c.w * cS[k]), () => al, undefined, cX, cY);
          drew = true;
          ja = -1;
        }
      }
    }
  }
  if (drew) {
    // The soft hole: fully open inside MASK_D0, full alpha past MASK_D0 + MASK_W (as openMask).
    const gr = 1 + MASK_GROW * bk, rOut = MASK_D0 + MASK_W;
    g.save();
    g.translate(PX(p, FX), PY(p, MASK_Y));
    g.scale(MASK_AX * gr, MASK_AY * gr);
    const rg = g.createRadialGradient(0, 0, 0, 0, 0, rOut);
    rg.addColorStop(0, 'rgba(0,0,0,1)');
    rg.addColorStop(MASK_D0 / rOut, 'rgba(0,0,0,1)');
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalCompositeOperation = 'destination-out';
    g.fillStyle = rg;
    g.beginPath();
    g.arc(0, 0, rOut, 0, TAU);
    g.fill();
    g.restore();
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = a;
    ctx.drawImage(burstCv!, 0, 0);
    ctx.restore();
  }
  // 2. The ice leading edges (a thin ring just outside each body), additive, masked per chunk.
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = HEX.ice;
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'round';
  for (const c of COLLARS) {
    if (!ring(R + c.w * 0.45, c.h)) continue;
    for (let i0 = 0; i0 < CN; i0 += CHUNK) {
      let n = 0, sw = 0, mm = 0, pen = false;
      ctx.beginPath();
      for (let i = i0 + 1; i <= Math.min(CN, i0 + CHUNK); i++) {
        const m = Math.min(cM[i], cM[i - 1]);
        if (!cOk[i] || !cOk[i - 1] || m <= 0.02) {
          pen = false;
          continue;
        }
        if (!pen) ctx.moveTo(cX[i - 1], cY[i - 1]);
        ctx.lineTo(cX[i], cY[i]);
        pen = true;
        n++;
        sw += cS[i];
        mm += m;
      }
      if (!n) continue;
      const w = Math.min(COLLAR_W_MAX, c.w * (sw / n));
      ctx.globalAlpha = clamp(a * (mm / n));
      ctx.lineWidth = Math.max(3, Math.min(14, w * 0.12));
      ctx.stroke();
    }
  }
  ctx.lineJoin = 'miter';
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}

/** The blast front racing out over the turf: grass ironed pale behind an ice line (additive), fading as it goes. */
function drawBlastFront(ctx: CanvasRenderingContext2D, p: Proj, t: number) {
  if (t < T_BURST) return;
  const u = clamp(sinceBurst(t) / 0.3);
  if (u >= 1) return;
  const R = blastR(t) * 0.9;
  if (!groundRing(p, R)) return;
  ctx.globalAlpha = 0.22 * (1 - u);
  ctx.strokeStyle = HEX.pressed;
  ctx.lineWidth = Math.max(3, 10 * p.z);
  strokeRing(ctx);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.9 * (1 - u);
  ctx.strokeStyle = HEX.ice;
  ctx.lineWidth = Math.max(2, 3.5 * p.z);
  strokeRing(ctx);
  ctx.globalAlpha = 0.6 * (1 - u);
  ctx.strokeStyle = HEX.cyan;
  ctx.lineWidth = Math.max(1, 8 * p.z);
  groundRing(p, R * 0.96);
  strokeRing(ctx);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- the crop circle (isobars pressed into the turf)

const RING_N = 64;
const rx = new Float32Array(RING_N + 1), ry = new Float32Array(RING_N + 1), rok = new Uint8Array(RING_N + 1);
/** Trace a ground ring of radius r round his feet into rx/ry (screen); returns false if nothing is visible. */
function groundRing(p: Proj, r: number): boolean {
  let any = false;
  for (let i = 0; i <= RING_N; i++) {
    const th = (i / RING_N) * TAU;
    rok[i] = p3(p, Math.cos(th) * r, 0, -Math.sin(th) * r) ? 1 : 0;
    rx[i] = P3[0];
    ry[i] = P3[1];
    if (rok[i]) any = true;
  }
  return any;
}
function strokeRing(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  let pen = false;
  for (let i = 0; i <= RING_N; i++) {
    if (!rok[i]) {
      pen = false;
      continue;
    }
    if (pen) ctx.lineTo(rx[i], ry[i]);
    else ctx.moveTo(rx[i], ry[i]);
    pen = true;
  }
  ctx.stroke();
}

function drawCropCircle(ctx: CanvasRenderingContext2D, p: Proj, t: number) {
  const bk = burstK(t);
  const fade = 1 - clamp((t - T_BURST) / (T_OUT - T_BURST));
  if (fade <= 0 || t < T_IN - 1e-6) return;
  for (const [R, t0] of RINGS) {
    const age = t - t0;
    if (age < -1e-6) continue;
    const bloom = 0.55 + 0.45 * ease.outCubic(clamp(age / 0.14));
    const r = R * bloom * (1 + 0.6 * bk);
    if (!groundRing(p, r)) continue;
    const lw = Math.max(3, (8 + R * 0.04) * p.z);
    // The pressed band (pale combed grass), the groove outside it, the cobalt contour inside.
    ctx.globalAlpha = 0.5 * fade;
    ctx.strokeStyle = HEX.pressed;
    ctx.lineWidth = lw;
    strokeRing(ctx);
    ctx.globalAlpha = 0.85 * fade;
    ctx.strokeStyle = HEX.cobalt;
    ctx.lineWidth = Math.max(1, 1.2 * p.z);
    groundRing(p, r * 0.92);
    strokeRing(ctx);
    ctx.globalAlpha = 0.6 * fade;
    ctx.strokeStyle = HEX.pressedCore;
    ctx.lineWidth = Math.max(1, lw * 0.5);
    groundRing(p, r * 1.07);
    strokeRing(ctx);
    // Combed ticks raked with the spin, on the pressed band.
    groundRing(p, r);
    ctx.fillStyle = '#d6f8c8';
    for (let i = 0; i < RING_N; i += 2) {
      if (!rok[i]) continue;
      ctx.globalAlpha = 0.35 * fade;
      ctx.fillRect(Math.round(rx[i]), Math.round(ry[i]), Math.max(2, Math.round(3 * p.z)), 1);
    }
    // The cyan glow line (hot at the stamp, cooling), and the isobar snap: an ice ring flicking outward.
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = clamp((0.65 + 0.35 * Math.exp(-age * 5)) * fade);
    ctx.strokeStyle = HEX.cyan;
    ctx.lineWidth = Math.max(1.5, 2.4 * p.z);
    strokeRing(ctx);
    const snap = pulseAt(t, t0, 0.18);
    if (snap > 0) {
      ctx.globalAlpha = snap;
      ctx.strokeStyle = HEX.ice;
      ctx.lineWidth = Math.max(1, 3 * p.z * snap);
      groundRing(p, r * (1 + 0.3 * (1 - snap)));
      strokeRing(ctx);
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- the calm eye: dew beads hanging still

const BEADS = Array.from({ length: 44 }, (_, k) => {
  const a = hash(k * 3.31) * TAU;
  return { a, r: 60 + 110 * hash(k * 5.71), h: 20 + 190 * hash(k * 9.13), big: hash(k * 8.1) > 0.62, g: hash(k * 2.23) };
})
  .filter((b) => !(Math.abs(Math.cos(b.a) * b.r) < 34 && Math.sin(b.a) > 0 && b.h > 140))
  .slice(0, 30);

function beadAt(p: Proj, b: (typeof BEADS)[number], t: number): boolean {
  const out = Math.max(0, blastR(t) - 70) * (t >= T_BURST ? 1 : 0);
  const r = b.r + out;
  return p3(p, Math.cos(b.a) * r, b.h + Math.sin(t * 3 + b.g * 9) * 0.5, -Math.sin(b.a) * r) && P3[2] < 6 * p.z;
}

function drawBeads(ctx: CanvasRenderingContext2D, p: Proj, t: number) {
  if (t < T_PUNCH + 0.1) return;
  const vis = clamp((t - (T_PUNCH + 0.1)) / 0.08) * (1 - clamp((t - T_BURST - 0.14) / 0.1));
  if (vis <= 0) return;
  for (const b of BEADS) {
    if (!beadAt(p, b, t)) continue;
    const x = P3[0], y = P3[1], sc = P3[2];
    const s = Math.max(3, Math.round((b.big ? 3.2 : 2.4) * sc));
    if (t >= T_BURST && beadAt(p, b, t - 0.025)) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.6 * vis;
      ctx.strokeStyle = HEX.ice;
      ctx.lineWidth = Math.max(1, s * 0.7);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(P3[0], P3[1]);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.5 * vis;
    ctx.fillStyle = HEX.navy;
    ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, s + 2, s + 2);
    ctx.globalAlpha = vis;
    ctx.fillStyle = HEX.ice;
    ctx.fillRect(Math.round(x), Math.round(y), s, s);
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.cyan), x + s / 2, y + s / 2, 5 * sc, 0.3 * vis);
    // Glints travel round the beads (each one catches the floodlight in turn).
    const gl = (t * 1.6 + b.g) % 1;
    if (gl < 0.14) sparkleCyan(ctx, x + s / 2, y + s / 2, (b.big ? 10 : 7) * sc * (1 - gl / 0.14), vis, b.g * 3);
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- the wind aura (horizontal arcs wrapping him)

/** The streamer's taper buckets (segments 1-2, 3-5, 6-7 of 7): one batched path per bucket and pass. */
const AURA_SEGS = 7;
const AURA_B = [[1, 2], [3, 5], [6, 7]] as const;
/**
 * Per bucket: the halo, the cyan bloom, one per core colour (ice, cyan), and the over-body path (front segments whose
 * midpoint lies inside his row silhouette: cyan only, faint, so no hard line ever scratches across the '10').
 */
const auraPaths = (): Path2D[][] => AURA_B.map(() => [new Path2D(), new Path2D(), new Path2D(), new Path2D(), new Path2D()]);

/**
 * 30 streamers per frame, each a horizontal arc (40-60° of a ring round his axis at the height of the frame row it
 * samples, rows spread evenly head to boots; radius = his half-width there + 12-18 px) seen through the shot's lens, so
 * it wraps him the way the cyclone does (the near half over him above the lens, under him below it); travelling with
 * the cyclone, rising at most 10 px/s, fading toward its tail. Passes, each one batched path per taper bucket: a wide
 * navy halo, a strong cyan bloom and the hot ice / cyan core, so the aura is a band of energy round him; where an arc
 * crosses in front of his body it turns to a faint cyan wrap and its hot core shows only where it wraps past his
 * sides. Never peeling off his edge, never a copy of him.
 */
function drawAura(ctx: CanvasRenderingContext2D, p: Proj, t: number, a: StudioAnim, i: number, front: boolean, k: number) {
  if (k <= 0) return;
  const rows = rowsOf(a, i);
  if (!rows.length) return;
  const paths = auraPaths();
  for (let n = 0; n < 30; n++) {
    const [row, x0, x1] = rows[Math.floor(((n + 0.5) / 30) * rows.length)];
    // Streamers at face height wrap behind his head only: never a line across his eyes.
    if (front && row >= 16 && row <= 40) continue;
    const rise = ((t * 10 + hash(n) * 20) % 20) - 10;
    const cxo = colX((x0 + x1 + 1) / 2) - FX, h = FY - rowY(row + 0.5) + rise;
    // Film fix M1: the rings stand 14-38 px off his body, so each arc's hot run past his side is a long sweep, not a fleck.
    const rr = ((x1 - x0 + 1) / 2) * SC + 14 + hash(n * 3.1) * 24;
    const len = ((40 + hash(n * 5.3) * 20) * Math.PI) / 180;
    const head = hash(n * 2.9) * TAU + t * SPIN * TAU * (0.9 + 0.2 * hash(n * 1.3));
    const core = n % 3 ? 2 : 3;
    // His row silhouette on screen (the over-body test for front segments).
    const bx0 = PX(p, colX(x0)), bx1 = PX(p, colX(x1 + 1));
    // Low-angle rings round the hips read flat: give each one at least a 0.22 ellipse (the brief's ry).
    const tiltK = Math.max(0, 0.22 * rr - Math.abs((H_EYE - h) * rr) / D0);
    let px = 0, py = 0, pv = false;
    for (let s = 0; s <= AURA_SEGS; s++) {
      const th = head - len * (1 - s / AURA_SEGS);
      const sn = Math.sin(th);
      if (!p3(p, cxo + Math.cos(th) * rr, h, -sn * rr)) {
        pv = false;
        continue;
      }
      const x = P3[0], y = P3[1] - sn * tiltK * p.z * Math.sign(h - H_EYE || 1);
      if (s > 0 && pv && (sn > 0) === front) {
        const b = s <= 2 ? 0 : s <= 5 ? 1 : 2;
        const mx = (px + x) / 2;
        const over = front && mx >= bx0 && mx <= bx1;
        for (const pi of over ? [4] : [0, 1, core]) {
          paths[b][pi].moveTo(px, py);
          paths[b][pi].lineTo(x, y);
        }
      }
      px = x;
      py = y;
      pv = true;
    }
  }
  AURA_B.forEach(([s0, s1], b) => {
    const q = (s0 + s1) / 2 / AURA_SEGS;
    const P = paths[b];
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineCap = 'round';
    ctx.globalAlpha = clamp(0.5 * k);
    ctx.strokeStyle = HEX.navy;
    ctx.lineWidth = (5 * q + 4) * p.z;
    ctx.stroke(P[0]);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = clamp(0.32 * k);
    ctx.strokeStyle = HEX.cyan;
    ctx.lineWidth = Math.max(1, 14 * q * p.z);
    ctx.stroke(P[1]);
    ctx.lineCap = 'butt';
    const cw = (2.5 + 3.5 * q) * p.z;
    ctx.globalAlpha = clamp(1.2 * k * (0.4 + q));
    ctx.lineWidth = cw;
    ctx.strokeStyle = HEX.ice;
    ctx.stroke(P[2]);
    ctx.strokeStyle = HEX.cyan;
    ctx.stroke(P[3]);
    // In front of his body: a faint cyan wrap only.
    ctx.lineCap = 'round';
    ctx.globalAlpha = clamp(0.3 * k);
    ctx.strokeStyle = HEX.cyan;
    ctx.stroke(P[4]);
  });
  ctx.lineCap = 'butt';
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- the hero

const RIM: [number, number, number] = [70, 216, 255];

function drawHero(env: Env, p: Proj, t: number, auraK: number) {
  const ctx = env.ctx;
  const key = keyAt(t);
  const f = heroFrame(key);
  // A navy pocket and a cool backglow separate him from the far wall.
  env.screen();
  const hx = PX(p, FX), hy = PY(p, CHEST_Y + 10);
  drawGlow(ctx, glowOf(PAL.navy), hx, hy, 190 * p.z, 0.7, 0.75, 1.15);
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf([70, 150, 255]), hx, hy - 20 * p.z, 120 * p.z, 0.16 + 0.1 * auraK, 0.8, 1.2);
  ctx.globalCompositeOperation = 'source-over';
  if (!f) {
    env.world();
    drawNo10(env, key === 'SS3b' ? 'SS3' : key, FX, FY, SC);
    return null;
  }
  env.screen();
  drawAura(ctx, p, t, f.a, f.i, false, auraK);
  env.world();
  // Cyan rim from behind: the tinted frame 1 studio px left, right and up (0.6), and a second ring 2 studio px out
  // (0.35), under him (additive): a 4 px cyan edge, so he is the hottest, most saturated shape in the eye.
  const tint = f.a.tinted(f.i, RIM);
  ctx.globalCompositeOperation = 'lighter';
  for (const [dx, dy] of [[-2 * SC, 0], [2 * SC, 0], [0, -2 * SC]] as const) drawAnim(ctx, f.a, tint, f.i, FX + dx, FY + dy, SC, { alpha: 0.35 });
  for (const [dx, dy] of [[-SC, 0], [SC, 0], [0, -SC]] as const) drawAnim(ctx, f.a, tint, f.i, FX + dx, FY + dy, SC, { alpha: 0.6 });
  ctx.globalCompositeOperation = 'source-over';
  drawAnim(ctx, f.a, null, f.i, FX, FY, SC);
  env.screen();
  drawAura(ctx, p, t, f.a, f.i, true, auraK);
  return f;
}

/** His eyes (world), from the frame's anchors. */
function eyesOf(f: { a: StudioAnim; i: number } | null): [[number, number], [number, number]] {
  const an = f?.a.frames[f.i].anchors;
  const l = an?.eyeL ?? [60, 28], r = an?.eyeR ?? [68, 28];
  return [
    [colX(l[0] + 0.5), rowY(l[1] + 0.5)],
    [colX(r[0] + 0.5), rowY(r[1] + 0.5)],
  ];
}

// ---------------------------------------------------------------- the ball (foreground, 3 m in front of him)

const BALL = { x: 482, y: 296, r: 7, D: 3 } as const;
let spin = new BallSpin();

function ballPos(t: number): [number, number, number] {
  // Trembling ±1 px toward him at 20 Hz; a 3 px lift on each breath, settling; rocked toward the lens at the burst.
  const tr = Math.sin(t * TAU * 20) * (t >= T_IN ? 1 : 0.6);
  let lift = 0;
  for (const a of LURCH) if (t >= a && t < a + 0.2) lift += 3 * Math.sin((Math.PI * (t - a)) / 0.2) * (1 - (t - a) / 0.2 * 0.3);
  const rock = t >= T_BURST ? 4 * Math.exp(-(t - T_BURST) * 9) * Math.cos((t - T_BURST) * 26) : 0;
  return [BALL.x - tr * 0.8, BALL.y - tr * 0.4 - lift + rock, 1 + Math.max(0, rock) * 0.02];
}

function drawTheBall(env: Env, p: Proj, t: number) {
  const ctx = env.ctx;
  const [x, y, k] = ballPos(t);
  const R = BALL.r * BALL.D * k;
  env.world();
  // Contact shadow on the turf, the ball, then its cyan rim from the cyclone light behind it and two dew beads.
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = HEX.navy;
  ctx.beginPath();
  ctx.ellipse(x - 2, BALL.y + R * 0.92, R * 1.1, R * 0.26, 0, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;
  drawBall(env, spin, x, y, BALL.r, BALL.D * k, 0, 0);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = HEX.cyan;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, R - 0.5, Math.PI * 0.95, Math.PI * 1.6);
  ctx.stroke();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = HEX.ice;
  ctx.fillRect(Math.round(x - R * 0.45), Math.round(y - R * 0.5), 2, 2);
  ctx.fillRect(Math.round(x + R * 0.2), Math.round(y - R * 0.15), 1, 1);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- the eyes ignite

function drawEyes(ctx: CanvasRenderingContext2D, p: Proj, t: number, f: { a: StudioAnim; i: number } | null) {
  if (t < T_EYES) return;
  const u = t - T_EYES;
  const ign = u < 0.035 ? ease.outQuad(u / 0.035) : 1;
  const hold = (0.78 + 0.22 * Math.exp(-u * 6)) * (0.94 + 0.06 * Math.sin(t * 47));
  const a = ign * hold;
  // Under the burst pulse only the ice cores and the flare dim (the cyan stays): his face never melts into a white blob.
  const hot = 1 - 0.3 * pulseAt(t, T_BURST, 0.2);
  const eyes = eyesOf(f);
  // Navy halo first (normal blend), so the cyan reads hot against his dark hair and the storm.
  for (const [wx, wy] of eyes) drawGlow(ctx, glowOf(PAL.navy), PX(p, wx), PY(p, wy), 22 * p.z, 0.45 * a);
  ctx.globalCompositeOperation = 'lighter';
  let mx = 0, my = 0;
  eyes.forEach(([wx, wy], n) => {
    const x = PX(p, wx), y = PY(p, wy);
    mx += x / 2;
    my += y / 2;
    // Two tight cyan points with skin between them (never one white disc over his face).
    drawGlow(ctx, glowOf(PAL.cyan), x, y, 4 * p.z, 0.9 * a);
    drawGlow(ctx, glowOf(PAL.ice), x, y, 0.8 * p.z, 0.9 * a * hot);
    // The lit pupil itself: a crisp cyan pixel cross with an ice core, so each eye stays its own point across the
    // horizontal streak (two crosses with skin between them, never one bar).
    const ex = Math.round(x), ey = Math.round(y);
    ctx.globalAlpha = clamp(a);
    ctx.fillStyle = HEX.cyan;
    ctx.fillRect(ex - 3, ey - 2, 6, 4);
    ctx.fillRect(ex - 1, ey - 6, 2, 12);
    ctx.globalAlpha = clamp(a * hot);
    ctx.fillStyle = HEX.ice;
    ctx.fillRect(ex - 1, ey - 2, 2, 4);
    // GALE's 4-point cyan glint, small and only on the ignite.
    if (u < 0.15) sparkleCyan(ctx, x, y, (8 + 10 * (1 - u / 0.15)) * a, 0.5 * (1 - u / 0.15), n * 0.4 + t * 2);
  });
  // The 300 px anamorphic streak through both eyes as hard lines (a 2 px ice core between two 1 px cyan lines, 340 px),
  // over the soft 300 px pass and a faint 560 px one, and a flare.
  ctx.globalAlpha = 0.85 * a;
  ctx.fillStyle = HEX.ice;
  ctx.fillRect(mx - 150, Math.round(my) - 1, 300, 2);
  ctx.globalAlpha = 0.5 * a;
  ctx.fillStyle = HEX.cyan;
  ctx.fillRect(mx - 170, Math.round(my) - 3, 340, 1);
  ctx.fillRect(mx - 170, Math.round(my) + 2, 340, 1);
  anamorphic(ctx, mx, my, 300 * a, 0.95 * a);
  anamorphic(ctx, mx, my, 560 * a, 0.15 * a);
  lensFlare(ctx, mx, my, 12 * p.z, 0.3 * a * hot, [120, 220, 255]);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- the burst's outward speed lines

/**
 * The wind blown outward: a stream of speed lines racing out from his open centre to the frame's edges, launched over
 * 1.62-1.84 (each lives 0.12 s), so the burst is still pouring past the lens when the wipe takes over. Navy under ice.
 */
/** The speed lines' launch ellipse (screen px round MASK_Y): just outside his silhouette at zoom 1.42. */
const LINE_AX = 135, LINE_AY = 185;
function burstLines(ctx: CanvasRenderingContext2D, p: Proj, t: number) {
  const age = t - T_BURST;
  if (age < 0 || age > 0.4) return;
  const cx = PX(p, FX), cy = PY(p, MASK_Y);
  ctx.lineCap = 'round';
  for (let i = 0; i < 90; i++) {
    const t0 = i < 24 ? 0 : 0.24 * hash(i * 5.3);
    const u = (age - t0) / 0.16;
    if (u < 0 || u > 1) continue;
    const a = hash(i * 2.7) * TAU;
    const ca = Math.cos(a), sa = Math.sin(a);
    // From just outside his body (never across him) out past the frame's edge.
    const r0 = 0.9 + 0.25 * hash(i * 9.1) + 1.4 * u;
    const len = (0.35 + 0.4 * hash(i * 4.4)) * (0.6 + 0.4 * u);
    const x0 = cx + ca * r0 * LINE_AX, y0 = cy + sa * r0 * LINE_AY;
    const x1 = cx + ca * (r0 + len) * LINE_AX, y1 = cy + sa * (r0 + len) * LINE_AY;
    const al = (1 - u * u) * (0.45 + 0.4 * hash(i * 6.2));
    const lw = 1 + 2.2 * hash(i * 1.9);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.5 * al;
    ctx.strokeStyle = HEX.navy;
    ctx.lineWidth = lw + 3;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.75 * al;
    ctx.strokeStyle = i % 4 ? HEX.ice : HEX.cyan;
    ctx.lineWidth = lw;
    ctx.stroke();
  }
  ctx.lineCap = 'butt';
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- the wipe into shot 4

/**
 * Behind the wipe's trailing edge: shot 4's own first frame (its exported opening plate: the storm stadium at its
 * backdrop scale, the turf and craters under the storm darken, its lamps, the trailing funnel and No.10 on R1 at its
 * t = 0 framing), so nothing pops when the cut lands. Its clock runs up to 0 at the cut (only the funnel and the flags
 * turn).
 */
function drawReveal(env: Env, t: number, edge: number) {
  if (edge <= 0) return;
  const ctx = env.ctx;
  env.screen();
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, Math.min(VW, edge), VH);
  ctx.clip();
  ctx.fillStyle = HEX.stormNavy;
  ctx.fillRect(0, 0, VW, VH);
  drawInhaleOpening(env, t - DUR);
  ctx.restore();
  env.screen();
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.cyan), edge, VH / 2, 26, 0.35, 0.4, 8);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- particles (update only, env.rng)

let fired = { punch: false, lurch: [false, false, false], burst: false };

/** World (composition) position of a 3D point: particles live in world coordinates. */
function w3(X: number, h: number, dz: number): [number, number, number] {
  const sc = D0 / Math.max(ZNEAR, D0 + dz);
  return [FX + X * sc, HZ_Y + (H_EYE - h) * sc, sc];
}

/** Grass, crumbs and dew ripped off the wall's base, thrown along its flow (only where the base is in front of us). */
function spawnWallDebris(env: Env, t: number, n: number) {
  const rng = env.rng;
  const R = wallR(t);
  for (let i = 0; i < n; i++) {
    const th = rng.range(0, TAU), sn = Math.sin(th);
    if (D0 - sn * R < 160) continue;
    const h = rng.range(0, 140);
    const [x, y, sc] = w3(Math.cos(th) * R, h, -sn * R);
    const sp = rng.range(500, 1100) * sc;
    const blade = rng.next() < 0.55;
    env.parts.spawn({
      kind: blade ? PK.Blade : PK.Pixel, x, y, vx: -sn * sp, vy: -rng.range(40, 160), ay: 120, drag: 0.6, max: rng.range(0.3, 0.6),
      s0: (blade ? rng.range(3, 5) : rng.range(1.5, 3)) * Math.min(2.5, sc), s1: blade ? 3 : 1, rot: rng.range(0, TAU), vrot: rng.range(-18, 18),
      ramp: blade ? 'grass' : 'dew', r0: blade ? rng.next() : 0, r1: blade ? rng.next() : 1, a0: 1, a1: blade ? 1 : 0, add: !blade, layer: sn > 0 ? 1 : 0,
    });
  }
}

/** A breath: the new ring's dew spray (20) and a few blades. */
function spawnRingSpray(env: Env, R: number) {
  const rng = env.rng;
  for (let i = 0; i < 20; i++) {
    const th = rng.range(0, TAU), sn = Math.sin(th);
    const [x, y, sc] = w3(Math.cos(th) * R, 0, -sn * R);
    env.parts.spawn({
      kind: PK.Pixel, x, y, vx: Math.cos(th) * rng.range(30, 110) * sc, vy: -rng.range(120, 300) * sc, ay: 700 * sc, drag: 0.8, max: rng.range(0.4, 0.7),
      s0: rng.range(1.5, 3) * Math.min(2, sc), s1: 1, ramp: 'dew', r0: 0, r1: 1, a0: 1, a1: 0.2, layer: sn > 0 ? 1 : 0,
    });
  }
  for (let i = 0; i < 6; i++) {
    const th = rng.range(0.15, Math.PI - 0.15);
    const [x, y, sc] = w3(Math.cos(th) * R, 0, -Math.sin(th) * R);
    env.parts.spawn({
      kind: PK.Blade, x, y, vx: Math.cos(th) * rng.range(20, 80), vy: -rng.range(90, 200) * sc, ay: 600, drag: 1, max: rng.range(0.4, 0.6),
      s0: rng.range(3, 5) * Math.min(2, sc), s1: 3, rot: rng.range(0, TAU), vrot: rng.range(-16, 16), ramp: 'grass', r0: rng.next(), r1: rng.next(),
      a0: 1, a1: 1, add: false, layer: 1,
    });
  }
}

/** The burst: dew sprayed outward from him, blades off the crop circle, vapour puffs thrown past the lens. */
function spawnBurst(env: Env) {
  const rng = env.rng;
  // The dew hanging round him sprays outward (from outside his silhouette: nothing streaks across his face).
  for (let i = 0; i < 50; i++) {
    const a = rng.range(0, TAU), sp = rng.range(320, 760), r = rng.range(1, 1.6);
    env.parts.spawn({
      kind: PK.Streak, x: FX + Math.cos(a) * 85 * r, y: CHEST_Y + 30 + Math.sin(a) * 150 * r, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.8,
      drag: 1.4, max: rng.range(0.25, 0.45), s0: rng.range(1.5, 2.5), s1: 1, k: 0.06, ramp: 'dew', r0: 0, r1: 1, a0: 1, a1: 0, layer: 1,
    });
  }
  for (let i = 0; i < 26; i++) {
    const th = rng.range(0, TAU), r = rng.range(40, 230);
    const [x, y, sc] = w3(Math.cos(th) * r, 0, -Math.sin(th) * r);
    env.parts.spawn({
      kind: PK.Blade, x, y, vx: Math.cos(th) * rng.range(200, 480) * sc, vy: -rng.range(120, 320) * sc, ay: 500, drag: 1.1, max: rng.range(0.35, 0.6),
      s0: rng.range(3, 6) * Math.min(2, sc), s1: 4, rot: rng.range(0, TAU), vrot: rng.range(-24, 24), ramp: 'grass', r0: rng.next(), r1: rng.next(),
      a0: 1, a1: 1, add: false, layer: 1,
    });
  }
  // Storm vapour torn off the eye wall's inner face (dark, normal blend: the burst never turns the frame milky).
  for (let i = 0; i < 14; i++) {
    const a = rng.range(0, TAU), sp = rng.range(260, 520);
    env.parts.spawn({
      kind: PK.Mist, x: FX + Math.cos(a) * 110, y: CHEST_Y + 30 + Math.sin(a) * 120, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.7, drag: 2,
      max: rng.range(0.3, 0.5), s0: 14, s1: 46, k: 0.5, ramp: 'storm', r0: 0.4, r1: 0.9, a0: 0.4, a1: 0, add: false, layer: 1,
    });
  }
}

/**
 * The burst never covers him: an open ellipse fitted to his body on screen (fully open inside 0.85, full alpha past
 * 1.15), growing only 12 % as the burst opens, so the blast's near layers read across most of the frame round him
 * (≤ 45 % coverage per frame: not a full-frame event).
 */
const MASK_Y = CHEST_Y + 20, MASK_AX = 120, MASK_AY = 175, MASK_D0 = 0.85, MASK_W = 0.3, MASK_GROW = 0.12;
function openMask(p: Proj, bk: number) {
  const g = 1 + MASK_GROW * bk;
  const cx = PX(p, FX), cy = PY(p, MASK_Y), ax = MASK_AX * g, ay = MASK_AY * g;
  return (x: number, y: number) => clamp((Math.hypot((x - cx) / ax, (y - cy) / ay) - MASK_D0) / MASK_W);
}

/**
 * Dev capture hook for the burst's coverage check: with `window.__g3burstOff = true` the frame renders without the
 * burst's canvas layers (blast front, vapour, collars, blast bands, flung props, speed lines); the capture diffs the
 * two renders and keeps the burst at or under 45 % of any frame. A comma list ('front,vapour,collars,bands,flung,lines')
 * turns off only those layers. Never set in play.
 */
function burstOff(layer = ''): boolean {
  const f = (globalThis as { __g3burstOff?: boolean | string }).__g3burstOff;
  return f === true || (typeof f === 'string' && layer !== '' && f.split(',').includes(layer));
}

// ---------------------------------------------------------------- the shot

export const shotEye: Shot = {
  name: META.name,
  dur: DUR,
  seed: META.seed,
  rate: RATE[3],
  muffle: MUFFLE[3],
  cues: [
    { at: 0, fn: (e) => { e.sfx.howl(2.0, 0.5, 1.2); e.sfx.rumble(2.0, 0.4); e.sfx.duck(0.4, 2.0); e.cam.trauma = 0.35; e.cam.shakeAmp = 10; } },
    { at: T_PUNCH, fn: (e) => { e.sfx.whoosh(0.4, 300, 3000); e.sfx.boom(0.3, 0.6); e.cam.hit(0.4); } },
    { at: T_IN, fn: (e) => (e.cam.shakeAmp = 6) },
    ...LURCH.map((at) => ({ at, fn: (e: Env) => { e.sfx.kick(0.35); e.sfx.boom(0.25); e.cam.hit(0.1); e.cam.shove(0, 3); } })),
    { at: T_EYES, fn: (e) => { e.sfx.shing(1.2); e.sfx.breath(0.3); e.cam.hit(0.15); } },
    {
      at: T_BURST,
      fn: (e) => {
        e.sfx.choke('tail');
        e.sfx.crack(1.0);
        e.sfx.boom(0.7);
        e.sfx.whoosh(0.35, 3000, 250, 0.6);
        e.sfx.gust(0.5, 0.4);
        e.cam.shakeAmp = 12;
        e.cam.shove(0, -14);
        e.cam.hit(0.5);
      },
    },
    { at: T_WIPE, fn: (e) => e.sfx.whoosh(0.15, 800, 5000, 0.4) },
  ],
  prepare(env) {
    warmGale();
    for (const k of ['SS1', 'SS2', 'SS3', 'SS3b'] as const) {
      const f = heroFrame(k);
      if (f) {
        f.a.tinted(f.i, RIM);
        rowsOf(f.a, f.i);
      }
    }
    for (let i = 0; i < 24; i++) softSprite('storm', i / 23);
    void env;
  },
  init(env) {
    env.sfx.clearBus();
    env.cam.reset();
    env.cam.shakeRoll = 0;
    env.cam.shakeAmp = 10;
    setCam(env, 0);
    spin = new BallSpin();
    spin.rotate(0.3, 1, 0.2, 0.9);
    fired = { punch: false, lurch: [false, false, false], burst: false };
  },
  update(env, t) {
    setCam(env, t);
    const cam = env.cam;
    if (t < T_PUNCH) holdTrauma(cam, 0.35);
    else if (t >= T_IN && t < T_EYES) holdTrauma(cam, 0.2 + 0.25 * ((t - T_IN) / (T_EYES - T_IN)));
    else if (t >= T_BURST && t < 1.78) holdTrauma(cam, 0.6);
    // The wall throws its debris (outside and through the punch-through), the eye breathes, then bursts.
    if (t < T_IN) spawnWallDebris(env, t, t < T_PUNCH ? 3 : 5);
    else if (t < T_BURST && env.rng.next() < 0.5) {
      // The updraft inside the eye: slow motes and a blade rising round his boots.
      const rng = env.rng;
      const th = rng.range(0, TAU), r = rng.range(30, 160);
      const [x, y] = w3(Math.cos(th) * r, 0, -Math.sin(th) * r);
      env.parts.spawn({
        kind: rng.next() < 0.3 ? PK.Blade : PK.Pixel, x, y, vx: -Math.sin(th) * 30, vy: -rng.range(30, 80),
        drag: 0.2, max: rng.range(0.8, 1.4), s0: rng.range(1, 3), s1: 1, rot: rng.range(0, TAU), vrot: rng.range(-4, 4), ramp: rng.next() < 0.5 ? 'dew' : 'grass',
        r0: 0.2, r1: 0.8, a0: 0.8, a1: 0, add: false, layer: Math.sin(th) > 0 ? 1 : 0,
      });
    }
    if (!fired.punch && t >= T_PUNCH) {
      fired.punch = true;
      spawnWallDebris(env, t, 30);
    }
    LURCH.forEach((a, n) => {
      if (!fired.lurch[n] && t >= a) {
        fired.lurch[n] = true;
        spawnRingSpray(env, RINGS[n + 1][0]);
      }
    });
    if (!fired.burst && t >= T_BURST) {
      fired.burst = true;
      spawnBurst(env);
    }
  },
  render(env, t) {
    const { ctx, fx } = env;
    setCam(env, t);
    const p = proj(env);
    const bk = burstK(t);
    const pinch = keys(PINCH, t);
    const bend = clamp(-pinch / 0.22, -0.4, 1);
    if (import.meta.env.DEV && t <= T_BURST)
      console.assert(VH / 2 + (FY - p.cy) * p.z <= VH - 18, `gale2 shot3 @${t.toFixed(3)}: his boots fall below the frame`);
    {
      const [bx, by, bkk] = ballPos(t);
      ballScr.x = PX(p, bx);
      ballScr.y = PY(p, by);
      ballScr.r = BALL.r * BALL.D * bkk * p.z;
    }

    // 1. The stadium (west stand, storm lid, floodlights) and the turning cloud ceiling.
    drawStadium(env, t, p);
    env.screen();
    drawLid(ctx, p, t, 1);

    // 2. The crop circle pressed into the turf, and the blast front racing out over it at the burst.
    drawCropCircle(ctx, p, t);
    if (!burstOff() && !burstOff('front')) drawBlastFront(ctx, p, t);

    // 3. The far half of the cyclone (outside: seen through its near half), and the blast ring's far half at the burst.
    const R = wallR(t), RB = backR(t);
    const wallA = (t < T_IN ? 0.9 : 1) * wallFade(t);
    const wall: WallOpts = { R, alpha: wallA, body: t < T_IN ? 0.5 : 0.35 };
    // Film fix M1: the far half stands close behind him inside the eye, its ribbons edged in ice.
    const backWall: WallOpts = { ...wall, R: RB, iceEdge: t >= T_IN ? 0.5 : 0 };
    // The wall's soft body thins fast as it blows outward; its racing bands keep going (wallA, a linear clock).
    drawSurface(ctx, p, t, RB, false, wallA * (1 - bk) * (1 - bk));
    drawPuffs(ctx, p, t, false, backWall);
    drawBands(ctx, p, t, BANDS, false, backWall);
    drawRiders(ctx, p, t, false, backWall);
    // The beams dip while the eyes ignite (the eyes are the only hot thing then), and return after the burst.
    const beamK = t < T_EYES - 0.05 ? 1 : t < T_BURST ? 0.45 : 0.5 + 0.5 * clamp((t - T_BURST - 0.12) / 0.25);
    drawLights(env, t, p, bend, t < T_IN ? 0.75 : 0.9, beamK);
    const bu = clamp(sinceBurst(t) / BLAST_LIFE);
    const blast: WallOpts = { R: blastR(t), alpha: t >= T_BURST ? 0.8 * (1 - Math.pow(bu, 1.6)) : 0, body: 0.6, puff: 'storm', mask: openMask(p, bk) };
    // The blast's far halves erupt from behind him (unmasked: they never cover him); its near halves keep his centre open.
    const open1 = () => 1;
    const burstOn = !burstOff();
    const on = (layer: string) => burstOn && !burstOff(layer);
    if (on('vapour')) drawBlastVapour(ctx, p, t, false, open1);
    // The far collar is masked too (round his legs it would read as a pale plate between his shins).
    if (on('collars')) drawCollars(ctx, p, t, false, 0);
    if (on('bands')) drawBands(ctx, p, t, BLAST, false, { ...blast, mask: undefined });

    // 4. Behind him: particles, the far half of his aura, the rim and the figure, the near half of the aura.
    env.world();
    env.parts.draw(ctx, 0);
    const auraK = t < T_IN ? 0.7 : t < T_EYES ? 0.85 : 1;
    const f = drawHero(env, p, t, auraK * (1 - 0.5 * bk));

    // 5. The calm eye: hanging dew, then the near particles and the ball.
    env.screen();
    drawBeads(ctx, p, t);
    env.world();
    env.parts.draw(ctx, 1);
    drawTheBall(env, p, t);

    // 6. The near half of the cyclone: a wall over him outside; on the punch-through it is blown past the lens (we are
    //    inside: from then on it is behind us); at the burst the blast ring's near half flies out past the lens with the
    //    centre kept open on him, and the props are flung past the camera.
    env.screen();
    const veil = t < T_PUNCH ? 0 : t < T_IN ? Math.sin(Math.PI * clamp((t - T_PUNCH) / (T_IN - T_PUNCH))) : 0;
    // The near veil is only a dark under-layer on the punch-through; the crisp canvas bands carry it.
    if (t < T_IN + 0.05) drawSurface(ctx, p, t, R, true, wallA * (1 - 0.45 * veil), veil);
    // On the punch-through the near bands rush at the lens (parallax 1.4 -> 3.4, inCubic): wide dark ribbons with ice
    // edges sweeping right -> left, his face readable in the gaps.
    const punching = t >= T_PUNCH && t < T_IN;
    const nearWall: WallOpts = punching
      ? { ...wall, wMul: lerp(1.4, 3.4, ease.inCubic((t - T_PUNCH) / (T_IN - T_PUNCH))), body: 2.4, bodyRgb: BODY_TRI_NAVY, bodyMax: 80 }
      : wall;
    // At the lens the wall's soft cloud puffs would blow up into one flat haze over him: thinned while we punch through.
    drawPuffs(ctx, p, t, true, punching ? { ...wall, alpha: wall.alpha * (1 - 0.75 * clamp((t - T_PUNCH) / 0.05)) } : wall);
    drawBands(ctx, p, t, BANDS, true, nearWall);
    drawBands(ctx, p, t, NEAR_BANDS, true, nearWall);
    if (t >= T_PUNCH && t < T_IN) {
      // The wall's own layers at the lens: dark ribbons with ice edges, fading in over the first 2 frames.
      const pk = clamp((t - T_PUNCH) / 0.034);
      drawBands(ctx, p, t, PUNCH_BANDS, true, { R: punchR(t), alpha: pk, body: 2.4, wMul: nearWall.wMul, bodyK: 1.5, bodyMax: 48, edge: true, bodyRgb: BODY_TRI_NAVY });
    }
    drawRiders(ctx, p, t, true, wall);
    if (on('vapour')) drawBlastVapour(ctx, p, t, true, blast.mask!);
    if (on('collars')) drawCollars(ctx, p, t, true, bk);
    // The near blast bands fly past the lens at parallax 2.5 (drawn 2.5 × wider), hotter than the far ones.
    // Their vapour ribbons stay narrow (56 px): the burst keeps to <= 45 % of the frame.
    if (on('bands')) drawBands(ctx, p, t, BLAST, true, { ...blast, alpha: t >= T_BURST ? 0.95 * (1 - Math.pow(bu, 1.6)) : 0, wMul: 2.5, bodyMax: 56 });
    if (on('flung')) drawFlung(ctx, p, t);

    // 8. The eyes ignite; the burst's speed lines.
    drawEyes(ctx, p, t, f);
    if (on('lines')) burstLines(ctx, p, t);

    // 9. Ground fog along the bottom edge, then the wipe.
    const fog = ctx.createLinearGradient(0, VH - 70, 0, VH);
    fog.addColorStop(0, 'rgba(6,11,36,0)');
    fog.addColorStop(1, 'rgba(6,11,36,0.5)');
    ctx.fillStyle = fog;
    ctx.fillRect(0, VH - 70, VW, 70);
    if (t >= T_WIPE) {
      const pw = 0.25 + 0.75 * ((t - T_WIPE) / (DUR - T_WIPE));
      const lead = lerp(-260, VW + 260, ease.inOutQuad(clamp(pw)));
      // The plate covers the whole frame by the last frames (so nothing of this shot pops on the cut); the wipe's
      // streaks stay on top.
      drawReveal(env, t, Math.max(lead - 380, VW * ease.inQuad(clamp((t - 1.92) / 0.055))));
      env.screen();
      windWipe(ctx, pw, 1);
    }

    // 10. Post: the storm grade, the pinch, shocks, the punch-through (E3), the eyes' bloom, the burst.
    galeStorm(fx);
    if (pinch !== 0) {
      const [u, v] = env.cam.toUV(FX, CHEST_Y);
      fx.lens = pinch;
      fx.lensX = u;
      fx.lensY = v;
      fx.lensR = 0.6;
    }
    const [fu, fv] = env.cam.toUV(FX, FY);
    for (const a of LURCH) {
      const age = t - a;
      if (age >= 0 && age < 0.35) pushShock(fx, { x: fu, y: fv, r: 0.45 * ease.outCubic(age / 0.35), s: 0.02 * (1 - age / 0.35) });
    }
    const [cu, cv] = env.cam.toUV(FX, CHEST_Y);
    if (t >= T_PUNCH && t < T_PUNCH + 0.3) {
      const k = (t - T_PUNCH) / 0.3;
      pushShock(fx, { x: cu, y: cv, r: 1.2 * ease.outCubic(k), s: 0.025 * (1 - k) });
    }
    if (t >= T_PUNCH && t < T_IN) {
      // E3: a light radial (0.06 at most, ZENITH / CRESCENT stay <= 0.12) so the bands rushing past stay crisp.
      fx.fullFrame = true;
      fx.radial = keys([[T_PUNCH, 0.02], [0.5, 0.06, 'outQuad'], [0.56, 0.06], [T_IN, 0, 'inQuad']], t);
      fx.radialX = cu;
      fx.radialY = cv;
      fx.ca = 0.01;
    }
    if (t >= T_EYES - 0.05) {
      fx.bloom = keys([[T_EYES - 0.05, 1.0], [T_EYES, 0.9], [T_EYES + 0.04, 1.15, 'outQuad'], [T_BURST, 1.1, 'linear'], [T_BURST + 0.02, 1.08, 'linear'], [1.7, 1.04, 'outQuad'], [DUR, 1.0]], t);
      // The bloom catches only the hottest eye pixels (threshold 0.7: the two points stay two points); back to the
      // storm threshold when the burst lands.
      fx.bloomThresh = t >= T_EYES && t < T_BURST ? 0.7 : 0.66;
    }
    if (t >= T_BURST) {
      const age = t - T_BURST;
      if (age < 0.4) pushShock(fx, { x: cu, y: cv, r: 1.5 * ease.outCubic(age / 0.4), s: 0.045 * (1 - age / 0.4) });
      // A short, light radial kick (0.05 for 0.12 s): the burst's bands stay crisp, never a grey zoom-blur.
      const k = 1 - clamp(age / 0.12);
      if (k > 0) {
        fx.radial = 0.05 * k;
        fx.radialX = cu;
        fx.radialY = cv;
      }
      fx.ca = Math.max(fx.ca, 0.008 * (1 - clamp(age / (T_OUT - T_BURST))));
      // The pressure wave squeezes the lens edges dark for a moment (the burst darkens; it never flashes).
      fx.vignette = Math.max(fx.vignette, 0.6 + 0.26 * (1 - clamp(age / 0.32)));
    }
  },
};
