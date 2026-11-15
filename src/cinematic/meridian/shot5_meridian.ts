// SHOT 5 · MERIDIAN (1.3 s): the whole pass in one frame, a meridian line drawn across the pitch (SPEC.md §5).
//
// The field's own 2.5D broadcast look (drawFieldBackdrop + the goal) under the ink page (inkGrade 0.85). The camera is a
// real crane: it opens at grass level beside the ball (a perspective view of the same field, rendered row by row so the
// pitch, the stands, the goal, the defenders and the thread all converge on one horizon) and rises to the high broadcast
// angle of the gameplay view, where the projection is exactly the field's own. No.10, No.7, the ball and the thread keep
// their colour.
//
// Beats (shot-local t, the runner's unwarped clock):
//   0.00  hard cut out of shot 4's paper flash (2-frame flash-out). Grass level: the ball has just slipped round D4's
//         heel and rolls right toward the cross-stitch X, the jade thread trailing back from it, D4 on his backside.
//   0.00-0.50  the crane: up from grass level to the broadcast angle while pulling back (a gentle lift-off so the low
//         view reads for a few frames, then outCubic-like), No.7 bursting in from the left foreground, revealing the whole
//         thread from No.10 (small at the strike, T9) out toward the far side where he looked and curling back to the
//         near side; three almond needle eyes faint on the turf at E1-E3; D1 sprawled, D2 and D3 tangled, D4 on his
//         backside and the untouched keeper, all still looking at the far side (from 0.52: ink dot trails and a "?" each).
//   0.27-0.62  a pulse of pearl light runs down the thread from No.10 to the ball (launched once he is in frame), like light down a wire; each eye it
//         passes flares and re-plucks its note (E5, F#5, A5), and the segment behind it quivers.
//   0.50-0.90  hold wide (a 2 % breathing push): the ball rolls onto the X at the exact instant No.7 arrives there.
//         Time eases into slow motion from 0.78 (0.12 by 0.95), so the meeting is held.
//   0.90-1.30  snap push-in toward No.7 (zoom x2.3, inQuad), ink focus lines, fx.radial up to 0.12 centred on him (0.3
//         smeared the cut frame past reading). Ball and No.7 still converging on the X: the cut comes one stride short of
//         it, the ball at his heels, so shot 6 opens on the same picture (ball rolling in behind his stride) and the one
//         touch is shot 6's at 0.35 (no contact, glint or reach here: that double-touched and jumped the ball back).
//
// Zoom note: the brief's zooms (1.6 -> 0.85 -> 1.5) are scaled so the hold matches the gameplay camera (1.45 here vs the
// field's 1.3) and the whole thread spans half the frame: crane 3.3 -> 1.45 (x2.3, grass level needs the tighter start),
// push-in x2.3 (a bigger No.7 at the cut, closer to shot 6's x2 framing).
// No.10 (Trivela T9, static) and No.7 (Run R1-R8 on his travel; Receive R1 only sets the run's end) are studio frames drawn from
// box-filtered caches built in prepare() at the on-screen scale (never fractional nearest-neighbour downscaling); the
// defenders and the keeper are puppets cached in prepare() at a few resolutions (zero puppet renders per frame).

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { Rng, clamp, ease, lerp } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { focusLines, type TrailPt } from '../../art/fx';
import { KEEPER_KIT, POSES, RIVAL_KIT, RIVAL_KIT_B, RIVAL_KIT_C, RIVAL_KIT_D, joints, type Kit, type Pose } from '../../art/puppet';
import type { StudioAnim } from '../../art/studioAnim';
import {
  FIELD, HEX, LAYOUT, PAL, PATH, THREAD_NOTES as N, cachePuppet, crossStitch, drawBall, drawFieldBackdrop, drawGoal,
  drawGrassFore, drawNo10Boxed, drawNo7Boxed, inkGrade, inkSfx, meridianGrade, needleEye, no10, no7, paperFlash,
  pluckLine, prepareGrassFore, prepareInk, pulse, spriteCover, type No7Key,
} from './common';

const DUR = 1.3;

// ---------------------------------------------------------------- timing (shot-local t)
const CRANE1 = 0.5;
/** The pulse leaves No.10's boot once he is in frame (he enters the left edge at ~0.27 as the crane rises). */
const PULSE0 = 0.27, PULSE1 = 0.62;
const HOLD0 = 0.5, PUSH0 = 0.9;
/** Slow motion into the meeting: rate 1 until SLOW_A, smoothly down to SLOW_R by SLOW_B, held to the cut. */
const SLOW_A = 0.78, SLOW_B = 0.95, SLOW_R = 0.12;
/** No.7 switches from the run to Receive R1 (the reach) this many sim seconds before the cut. 0: he runs to the cut (the
 * reach and the touch belong to shot 6, which opens with the ball behind him). */
const REACH_LEAD = 0;

const smooth = (x: number) => x * x * (3 - 2 * x);
function rateAt(t: number) {
  if (t <= SLOW_A) return 1;
  if (t >= SLOW_B) return SLOW_R;
  return lerp(1, SLOW_R, smooth((t - SLOW_A) / (SLOW_B - SLOW_A)));
}
/** Simulation time at t (the integral of rateAt). */
function sim(t: number) {
  if (t <= SLOW_A) return t;
  const L = SLOW_B - SLOW_A;
  if (t <= SLOW_B) {
    const x = (t - SLOW_A) / L;
    return SLOW_A + L * (x - (1 - SLOW_R) * (x * x * x - (x * x * x * x) / 2));
  }
  return SLOW_A + L * (1 - (1 - SLOW_R) * 0.5) + SLOW_R * (t - SLOW_B);
}
const S_END = sim(DUR);

// ---------------------------------------------------------------- the ball and No.7 (field x, z; sim time)
/** World px at the 0.5x studio scale: Receive R1's ball anchor sits 6.5 frame px above the ground row. */
const BALL_R = 3.4;
const K_WORLD = 0.5;
/** The ball enters just past D4's heel (E3) and is still CUT_SHORT world px short of the X at the cut (at No.7's heels,
 * matching shot 6's first frame), decelerating 1.3 -> 0.7. */
const U0 = PATH.eyes[2] + 0.012;
const CUT_SHORT = 11;
const U_END = 1 - CUT_SHORT / PATH.length;
function uBall(t: number) {
  const x = clamp(sim(t) / S_END);
  return U0 + (U_END - U0) * x * (1.3 - 0.3 * x);
}

/** No.7's pelvis ground track (field x, z): a sprint bending inside onto the X (quadratic, by arc length). He is ahead
 * of the ball the whole shot (about (1084, 309) as it passes E3), so the pass rolls into his stride from behind him (as
 * shot 6 opens), never the other way round. The ball rolls on his far side (field z ~10-24 px farther), so from this
 * high angle it sits at his knee height on screen: his track starts TRACK_DX field px downfield, so the ball visibly
 * trails him (8-14 px behind) until the hold and then closes onto his heels (0.7 px at the cut) instead of riding on his
 * thigh the whole way as if he were already dribbling it. */
let R1_DX = 2; // Receive R1: ball anchor minus pelvis (world px), resolved from the frame in prepare()
/** One stride short of the X at the cut (he reaches it in shot 6). */
const runEnd = () => ({ x: LAYOUT.target.x - R1_DX - 8, z: LAYOUT.target.z });
const TRACK_DX = 18;
let trackPts: { x: number; z: number; s: number }[] = [];
/** Sample the run (a quadratic from the near side, bending inside onto the X) by arc length; rebuilt in prepare(). */
function buildTrack() {
  const e = runEnd();
  const a = { x: e.x - TRACK_DX, z: e.z + 11 }, c = { x: e.x - TRACK_DX / 2, z: e.z + 6 };
  const n = 24;
  trackPts = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, v = 1 - u;
    const x = v * v * a.x + 2 * v * u * c.x + u * u * e.x, z = v * v * a.z + 2 * v * u * c.z + u * u * e.z;
    const prev = trackPts[i - 1];
    trackPts.push({ x, z, s: prev ? prev.s + Math.hypot(x - prev.x, z - prev.z) : 0 });
  }
}
function no7Track(s: number): { x: number; z: number; d: number } {
  if (!trackPts.length) buildTrack();
  const pts = trackPts, n = pts.length - 1;
  const total = pts[n].s;
  const d = clamp(s / S_END) * total;
  let i = 1;
  while (i < n && pts[i].s < d) i++;
  const k = (d - pts[i - 1].s) / Math.max(1e-6, pts[i].s - pts[i - 1].s);
  return { x: lerp(pts[i - 1].x, pts[i].x, k), z: lerp(pts[i - 1].z, pts[i].z, k), d };
}

// ---------------------------------------------------------------- the crane (a perspective blended into the broadcast view)
// Field (x, z, height h) -> world2 (X, Y), then the camera (cx, cy, Z) -> screen. p = 1 is grass level: a pinhole camera
// PR world px behind the focus F (toward the near side) and PHC px above the turf, looking at the far stands; p = 0 is
// the field's own oblique broadcast projection (X = x, Y = z - h). Blending the two keeps every row straight.
const F = PATH.at(U0 + 0.03);
const PR = 80, PHC = 8;

interface View {
  cx: number;
  cy: number;
  Z: number;
  p: number;
}

const Z0 = 3.3, ZH = 1.45, ZE = ZH * 2.3;
const C0 = { x: F.x + 52, y: F.z - 12 };
const CH = { x: 1064, y: 252 };

function viewAt(t: number): View {
  if (t < HOLD0) {
    // A crane, not a cut: it lifts off gently (the grass-level view reads for a few frames), rises, and settles.
    const x = clamp(t / CRANE1);
    const k = 0.3 * ease.outCubic(x) + 0.7 * ease.inOutCubic(x);
    const p = 1 - k;
    return { cx: lerp(C0.x, CH.x, k), cy: lerp(C0.y, CH.y, k), Z: Z0 * Math.pow(ZH / Z0, k), p };
  }
  const h = ease.inOutQuad(clamp((t - HOLD0) / (PUSH0 - HOLD0)));
  const cx = CH.x + 4 * h, cy = CH.y + 1 * h, Z = ZH * (1 + 0.02 * h);
  if (t < PUSH0) return { cx, cy, Z, p: 0 };
  const q = clamp((t - PUSH0) / (DUR - PUSH0));
  const k = ease.inQuad(q);
  // Framed on him one stride short of the X, the ball at his heels, as shot 6 opens: the match cut on his stride.
  const e = { x: LAYOUT.target.x - 23, y: LAYOUT.target.z - 34 };
  return { cx: lerp(cx, e.x, k), cy: lerp(cy, e.y, k), Z: Z * Math.pow(ZE / Z, k), p: 0 };
}

const depth = (z: number) => Math.max(4, PR + F.z - z);
/** Horizontal (and height) scale of field depth z in world2. */
const mOf = (v: View, z: number) => lerp(1, PR / depth(z), v.p);
/** World2 Y of the turf at depth z. */
const yOf = (v: View, z: number) => lerp(z, F.z - PHC + (PHC * PR) / depth(z), v.p);
/** Field point -> world2. */
function w2(v: View, x: number, z: number, h = 0): [number, number] {
  const m = mOf(v, z);
  return [F.x + (x - F.x) * m, yOf(v, z) - h * m];
}
/** World2 -> logical screen. */
const toScr = (v: View, X: number, Y: number): [number, number] => [(X - v.cx) * v.Z + VW / 2, (Y - v.cy) * v.Z + VH / 2];
/** Field point -> logical screen, plus the on-screen scale of one world px there. */
function proj(v: View, x: number, z: number, h = 0): [number, number, number] {
  const [X, Y] = w2(v, x, z, h);
  const [sx, sy] = toScr(v, X, Y);
  return [sx, sy, mOf(v, z) * v.Z];
}
/** Screen foreshortening of the turf at depth z (screen px of Y per px of x), for marks lying on the ground. */
function groundSquash(v: View, z: number) {
  const dy = (yOf(v, z + 1) - yOf(v, z - 1)) / 2;
  return clamp(dy / mOf(v, z), 0.05, 1);
}

// ---------------------------------------------------------------- the cast (inked: defenders and the keeper)
interface CastDef {
  kit: Kit;
  pose: keyof typeof POSES;
  x: number;
  z: number;
  facing: 1 | -1;
  /** Where his gaze goes (screen direction, radians) and the "?" offset: they all still look at the far side. */
  gaze: number;
  q: number;
}
const CAST: CastDef[] = [
  { kit: RIVAL_KIT, pose: 'sprawl', x: 952, z: 256, facing: -1, gaze: -2.05, q: 0.52 }, // D1, the poke: on his hip
  { kit: RIVAL_KIT_B, pose: 'stumble', x: 1023, z: 244, facing: 1, gaze: -1.85, q: 0.56 }, // D2, tangled
  { kit: RIVAL_KIT_C, pose: 'stumble', x: 1041, z: 259, facing: -1, gaze: -2.2, q: 0.6 }, // D3, tangled
  { kit: RIVAL_KIT_D, pose: 'sitWrongWay', x: 1073, z: 275, facing: -1, gaze: -2.0, q: 0.64 }, // D4, on his backside
  { kit: KEEPER_KIT, pose: 'gkReady', x: 1168, z: 256, facing: -1, gaze: -1.7, q: 0.68 }, // the keeper, untouched
];
/** Puppet cache resolutions (puppet k == on-screen scale of a 0.5x body). */
const PUP_LEVELS = [0.725, 0.92, 1.12, 1.38, 1.7];
interface PupImg {
  cv: HTMLCanvasElement;
  ox: number;
  /** Ground row (the pose's lowest point) and the top of his head, in cache px. */
  gy: number;
  hx: number;
  hy: number;
  k: number;
}
let pups: PupImg[][] = [];

/**
 * The pose's lowest and highest points (puppet units from the hip), from its joints: no pixel readback (reading a
 * canvas back costs far more than rendering the puppet). Calibrated against the rasters: boots and the 1 px outline
 * add about 3.5 units below and 4 above.
 */
function pupExtent(pose: Pose) {
  const j = joints(pose);
  const pts: [[number, number], number][] = [
    [j.toeN, 2.5], [j.toeF, 2.5], [j.ankleN, 3], [j.kneeN, 4], [j.hip, 7], [j.neck, 6], [j.head, 12], [j.handN, 2.5], [j.handF, 2.5],
  ];
  let ground = -1e9, top = 1e9;
  for (const [[, y], r] of pts) {
    ground = Math.max(ground, y + r);
    top = Math.min(top, y - r);
  }
  return { ground: ground + 2.5, top: top - 3, head: j.head };
}

function buildPup(kit: Kit, pose: Pose, k: number, facing: 1 | -1): PupImg {
  const r = cachePuppet(kit, pose, k, facing);
  const ext = pupExtent(pose);
  return {
    cv: r.cv, ox: r.ox, gy: Math.round(r.oy + ext.ground * k + 1), hx: r.ox + ext.head[0] * k * facing, hy: r.oy + (ext.head[1] - 12) * k, k,
  };
}

// ---------------------------------------------------------------- studio frames at the on-screen scale
interface Frame {
  a: StudioAnim;
  i: number;
  /** Pivot (frame px): the pelvis column on the ground row. */
  piv: [number, number];
}
let hero: Frame | null = null;
let run: (Frame | null)[] = [];
let reach: Frame | null = null;
const RUN_KEYS: No7Key[] = ['Run.R1', 'Run.R2', 'Run.R3', 'Run.R4', 'Run.R5', 'Run.R6', 'Run.R7', 'Run.R8'];
/** Pelvis advance per run frame (world px at 0.5x): the cycle steps on No.7's travel so his feet keep their grip. */
const STRIDE_FRAME = 3.6;
/** Box-filtered cache levels: 0.725 is the wide hold exactly (0.5x at zoom 1.45), 0.85 the moves; 0.92 and up draws
 * the frame itself. Within 3 % of a level the cache is drawn 1:1 (the hold's 2 % breathing never resamples a sprite). */
const BOX_LEVELS = [0.725, 0.85];
const snap = (r: number) => (Math.abs(r - 1) < 0.03 ? 1 : r);
const boxes = new Map<string, HTMLCanvasElement>();
const quant = (e: number) => (e < 0.79 ? 0.725 : 0.85);

function boxedAt(f: Frame, q: number) {
  const key = `${f.a.name}|${f.i}|${q}`;
  let c = boxes.get(key);
  if (!c) boxes.set(key, (c = f.a.boxed(f.i, q)));
  return c;
}

/** Integer nearest-neighbour copies (x2..x4) of a frame, built in prepare(): above 0.92 a sprite is drawn from the
 * nearest integer copy and only the small leftover factor is smoothed, so every art pixel keeps one width. */
const NN_LEVELS = [2, 3, 4];
const nn = new Map<string, HTMLCanvasElement>();
function nnAt(f: Frame, n: number) {
  const key = `${f.a.name}|${f.i}|${n}`;
  let c = nn.get(key);
  if (!c) {
    const img = f.a.frames[f.i].img;
    c = document.createElement('canvas');
    c.width = img.width * n;
    c.height = img.height * n;
    const g = c.getContext('2d')!;
    g.imageSmoothingEnabled = false;
    g.drawImage(img, 0, 0, c.width, c.height);
    nn.set(key, c);
  }
  return c;
}

const groundPivot = (a: StudioAnim, i: number): [number, number] => [a.frames[i].pelvis[0] + 0.5, 103];

/**
 * Draw a studio frame with its pivot on logical screen (sx, sy) at on-screen scale e (screen transform applied).
 * `still`: the camera holds (the wide hold), so a leftover within 3 % of 1 is drawn 1:1 and crisp. While the camera
 * moves (crane, push-in) the leftover is always smoothed, so the sprite never ticks between crisp and soft frames.
 */
function drawStudio(ctx: CanvasRenderingContext2D, f: Frame, sx: number, sy: number, e: number, still: boolean) {
  const fit = (r: number) => (still ? snap(r) : r);
  ctx.save();
  ctx.translate(sx, sy);
  if (e >= 0.92) {
    // The nearest integer copy, then only the small leftover factor (smoothed: at most a 1 px soft seam, no crawl).
    const n = Math.min(4, Math.max(1, Math.round(e)));
    const r = fit(e / n);
    ctx.imageSmoothingEnabled = r !== 1;
    ctx.imageSmoothingQuality = 'high';
    ctx.scale(r, r);
    ctx.drawImage(n === 1 ? f.a.frames[f.i].img : nnAt(f, n), -f.piv[0] * n, -f.piv[1] * n);
  } else {
    const q = quant(e);
    const r = fit(e / q);
    ctx.imageSmoothingEnabled = r !== 1;
    ctx.imageSmoothingQuality = 'high';
    ctx.scale(r, r);
    ctx.drawImage(boxedAt(f, q), -f.piv[0] * q, -f.piv[1] * q);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the pulse down the wire (pure functions of t)
const pulseK = (t: number) => {
  const x = clamp((t - PULSE0) / (PULSE1 - PULSE0));
  return 0.55 * x + 0.45 * smooth(x);
};
/** Path u of the pulse at t (from No.10's boot to the ball). */
const pulseU = (t: number) => pulseK(t) * uBall(t);
/** When the pulse passes each needle eye (computed once). */
const EYE_PASS: number[] = PATH.eyes.map((u) => {
  for (let t = PULSE0; t <= PULSE1; t += 1 / 600) if (pulseU(t) >= u) return Math.round(t * 600) / 600;
  return PULSE1;
});

// ---------------------------------------------------------------- module state (reset in init)
let spin = new BallSpin();
let lastSteps = -1;
let ready = false;

function prepareCaches(env: Env) {
  prepareInk(env.ctx);
  prepareGrassFore();
  pups = CAST.map((c) => PUP_LEVELS.map((k) => buildPup(c.kit, POSES[c.pose], k, c.facing)));
  const h = no10('T9');
  hero = h ? { a: h.a, i: h.i, piv: groundPivot(h.a, h.i) } : null;
  run = RUN_KEYS.map((k) => {
    const f = no7(k);
    return f ? { a: f.a, i: f.i, piv: groundPivot(f.a, f.i) } : null;
  });
  const r = no7('Receive.R1');
  reach = r ? { a: r.a, i: r.i, piv: groundPivot(r.a, r.i) } : null;
  if (reach) {
    const fr = reach.a.frames[reach.i];
    const ball = fr.anchors.ball ?? [fr.pelvis[0] + 4, 96];
    R1_DX = (ball[0] - fr.pelvis[0]) * K_WORLD;
  }
  buildTrack();
  for (const f of [hero, reach, ...run]) {
    if (!f) continue;
    for (const q of BOX_LEVELS) boxedAt(f, q);
    for (const n of NN_LEVELS) nnAt(f, n);
  }
  ready = true;
}

// ---------------------------------------------------------------- drawing: the environment (inked)

/** The stands and the pitch. p = 0: the field's own drawFieldBackdrop. p > 0: stands scaled onto the far touchline's
 * depth, the pitch drawn one device row at a time (each row of the pitch canvas at its own depth and width). */
function drawEnvironment(env: Env, v: View, t: number) {
  const ctx = env.ctx;
  const st = env.art.stadium;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#05030d';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
  env.cam.set(v.cx, v.cy, v.Z, 0);
  env.world();
  const time = 40 + t;
  if (v.p < 1e-4) {
    drawFieldBackdrop(ctx, st, v.cx, v.cy, time);
    return;
  }
  // Stands: everything above the far touchline, scaled about the focus onto its depth.
  const m0 = mOf(v, FIELD.horizon), y0 = yOf(v, FIELD.horizon);
  ctx.save();
  ctx.beginPath();
  ctx.rect(v.cx - 4000, v.cy - 4000, 8000, y0 - (v.cy - 4000));
  ctx.clip();
  ctx.translate(F.x, y0);
  ctx.scale(m0, m0);
  ctx.translate(-F.x, -FIELD.horizon);
  drawFieldBackdrop(ctx, st, F.x + (v.cx - F.x) / m0, FIELD.horizon + (v.cy - y0) / m0, time);
  ctx.restore();
  // Pitch rows.
  const W = ctx.canvas.width, H = ctx.canvas.height, S = W / VW;
  const pitch = st.pitch;
  const zMax = F.z + PR - 4;
  const yTop = (y0 - v.cy) * v.Z + VH / 2;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#287a35';
  for (let yd = Math.max(0, Math.floor(yTop * S)); yd < H; yd++) {
    const Yw = ((yd + 0.5) / S - VH / 2) / v.Z + v.cy;
    let lo = FIELD.horizon, hi = zMax;
    if (Yw >= yOf(v, hi)) lo = hi;
    else
      for (let k = 0; k < 22; k++) {
        const mid = (lo + hi) / 2;
        if (yOf(v, mid) < Yw) lo = mid;
        else hi = mid;
      }
    const z = lo;
    const row = clamp(Math.floor(z - FIELD.horizon), 0, pitch.height - 1);
    const m = mOf(v, z);
    const xL = F.x + ((-VW / 2) / v.Z + v.cx - F.x) / m, xR = F.x + ((VW / 2) / v.Z + v.cx - F.x) / m;
    const a = Math.max(0, xL), b = Math.min(pitch.width, xR);
    const span = xR - xL;
    if (a > xL) ctx.fillRect(0, yd, ((a - xL) / span) * W, 1);
    if (b < xR) ctx.fillRect(((b - xL) / span) * W, yd, W, 1);
    if (b > a) ctx.drawImage(pitch, a, row, b - a, 1, ((a - xL) / span) * W, yd, ((b - a) / span) * W, 1);
  }
  ctx.restore();
  env.world();
}

/** The goal (drawGoal's geometry through the crane's projection; drawGoal itself once the view is the broadcast one). */
function drawGoalProj(env: Env, v: View, part: 'back' | 'front') {
  const ctx = env.ctx;
  env.world();
  if (v.p < 1e-4) {
    drawGoal(ctx, part);
    return;
  }
  const gx = FIELD.goalX, far = FIELD.goalFar, near = FIELD.goalNear, H = FIELD.goalH, D = FIELD.goalDepth, ob = 0.35;
  const fx = gx + (far - FIELD.horizon) * ob, nx = gx + (near - FIELD.horizon) * ob;
  const P = (u: number, vv: number) => w2(v, lerp(fx, nx, u) + D, lerp(far, near, u), H * (1 - vv) * 0.92);
  ctx.save();
  if (part === 'back') {
    ctx.strokeStyle = 'rgba(230,235,255,0.55)';
    ctx.lineWidth = 1;
    const cols = 10, rows = 7;
    for (let i = 0; i <= cols; i++) {
      ctx.beginPath();
      for (let j = 0; j <= rows; j++) {
        const [x, y] = P(i / cols, j / rows);
        j ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
    for (let j = 0; j <= rows; j++) {
      ctx.beginPath();
      for (let i = 0; i <= cols; i++) {
        const [x, y] = P(i / cols, j / rows);
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
    for (let i = 0; i <= cols; i++) {
      const u = i / cols;
      const [ax, ay] = w2(v, lerp(fx, nx, u), lerp(far, near, u), H);
      const [bx, by] = P(u, 0);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }
    const [px, py] = w2(v, fx, far), [, pt] = w2(v, fx, far, H);
    const mf = mOf(v, far), mn = mOf(v, near);
    ctx.fillStyle = '#f4f6ff';
    ctx.fillRect(px - 2 * mf, pt, 4 * mf, py - pt);
    const [qx, qt] = w2(v, nx, near, H);
    ctx.strokeStyle = '#f4f6ff';
    ctx.lineWidth = 2 * (mf + mn);
    ctx.beginPath();
    ctx.moveTo(px, pt);
    ctx.lineTo(qx, qt);
    ctx.stroke();
  } else {
    const [x, y] = w2(v, nx, near), [, top] = w2(v, nx, near, H);
    const m = mOf(v, near);
    ctx.fillStyle = '#180411';
    ctx.fillRect(x - 3 * m, top - m, 6 * m, y - top + m);
    ctx.fillStyle = '#f4f6ff';
    ctx.fillRect(x - 2 * m, top, 4 * m, y - top);
    ctx.fillStyle = '#b8bcd8';
    ctx.fillRect(x + m, top, m, y - top);
  }
  ctx.restore();
}

/** A soft ink contact shadow on the turf (screen space). */
function shadow(ctx: CanvasRenderingContext2D, v: View, x: number, z: number, w: number, a: number) {
  const [sx, sy, e] = proj(v, x, z);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = 'rgb(5,8,20)';
  ctx.beginPath();
  ctx.ellipse(sx, sy, w * e, Math.max(0.8, w * e * 0.28 * groundSquash(v, z)), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** The inked cast: defenders and keeper at their depth, from the nearest cache resolution. Returns head points. */
function drawCast(env: Env, v: View) {
  const ctx = env.ctx;
  env.screen();
  const heads: [number, number, number][] = [];
  const order = CAST.map((c, i) => i).sort((a, b) => CAST[a].z - CAST[b].z);
  for (const i of order) {
    const c = CAST[i];
    shadow(ctx, v, c.x, c.z, c.pose === 'sprawl' ? 15 : 11, 0.35);
    const [sx, sy, s] = proj(v, c.x, c.z);
    const e = s * K_WORLD;
    let best = pups[i][0];
    for (const p of pups[i]) if (Math.abs(Math.log(p.k / e)) < Math.abs(Math.log(best.k / e))) best = p;
    const k = snap(e / best.k);
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(Math.round(sx), Math.round(sy));
    ctx.scale(k, k);
    ctx.drawImage(best.cv, -best.ox, -best.gy);
    ctx.restore();
    heads.push([Math.round(sx) + (best.hx - best.ox) * k, Math.round(sy) + (best.hy - best.gy) * k, e]);
  }
  return order.map((_, j) => heads[order.indexOf(j)]);
}

// ---------------------------------------------------------------- drawing: the colour layer

interface WPt {
  x: number;
  y: number;
  w: number;
}

/** A tapered thread (ink under-stroke, emerald halo, jade body, pearl core), widths per point. */
function taperThread(ctx: CanvasRenderingContext2D, pts: readonly WPt[], alpha = 1) {
  if (pts.length < 2 || alpha <= 0) return;
  const runs: { w: number; p: TrailPt[] }[] = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    const w = Math.max(1, Math.round(((pts[i].w + pts[i + 1].w) / 2) * 2) / 2);
    const last = runs[runs.length - 1];
    if (last && last.w === w) last.p.push(pts[i + 1]);
    else runs.push({ w, p: [pts[i], pts[i + 1]] });
  }
  const stroke = (w: number, col: string, run: TrailPt[]) => {
    ctx.lineWidth = w;
    ctx.strokeStyle = col;
    ctx.beginPath();
    ctx.moveTo(run[0].x, run[0].y);
    for (let i = 1; i < run.length; i++) ctx.lineTo(run[i].x, run[i].y);
    ctx.stroke();
  };
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = clamp(alpha);
  for (const r of runs) stroke(r.w + 2, HEX.ink, r.p);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = clamp(alpha * 0.22);
  for (const r of runs) stroke(r.w * 3 + 2, HEX.emerald, r.p);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = clamp(alpha);
  for (const r of runs) stroke(r.w, HEX.jade, r.p);
  for (const r of runs) if (r.w >= 2) stroke(Math.max(0.8, r.w * 0.4), HEX.pearl, r.p);
  ctx.restore();
}

/** The thread from No.10's boot along the path to the ball's trailing edge (screen points, with path u per point). */
function threadPoints(v: View, t: number): { pts: WPt[]; us: number[] } {
  const ub = uBall(t);
  const n = Math.max(8, Math.ceil(ub * 90));
  const pts: WPt[] = [];
  const us: number[] = [];
  for (let i = 0; i <= n; i++) {
    const u = (ub * i) / n;
    const q = PATH.at(u);
    const [sx, sy, s] = proj(v, q.x, q.z, BALL_R * 0.8);
    pts.push({ x: sx, y: sy, w: clamp(1.45 * s, 2, 5) });
    us.push(u);
  }
  // End at the ball's trailing edge.
  const b = pts[n], a = pts[Math.max(0, n - 3)];
  const r = BALL_R * proj(v, PATH.at(ub).x, PATH.at(ub).z)[2] * 0.85;
  const dl = Math.hypot(b.x - a.x, b.y - a.y);
  if (dl > 1e-3) pts[n] = { x: b.x - ((b.x - a.x) / dl) * r, y: b.y - ((b.y - a.y) / dl) * r, w: b.w };
  return { pts, us };
}

/** The pearl light segment behind the pulse head (u0..u1 along the thread), brightest at the head. */
function drawPulse(ctx: CanvasRenderingContext2D, pts: readonly WPt[], us: readonly number[], uHead: number, a: number) {
  if (a <= 0) return;
  const tail = 0.24;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.globalCompositeOperation = 'lighter';
  let head: WPt | null = null;
  for (let i = 1; i < pts.length; i++) {
    const u = us[i];
    if (u > uHead) {
      const k = clamp((uHead - us[i - 1]) / Math.max(1e-6, u - us[i - 1]));
      head = { x: lerp(pts[i - 1].x, pts[i].x, k), y: lerp(pts[i - 1].y, pts[i].y, k), w: pts[i].w };
      break;
    }
    const f = 1 - (uHead - u) / tail;
    if (f <= 0) continue;
    // The lit wire: an emerald bloom round it and a pearl core, fading back along the tail.
    ctx.globalAlpha = clamp(a * 0.4 * f);
    ctx.strokeStyle = HEX.emerald;
    ctx.lineWidth = pts[i].w * 3 + 4;
    ctx.beginPath();
    ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
    ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
    ctx.globalAlpha = clamp(a * f * f);
    ctx.strokeStyle = HEX.pearl;
    ctx.lineWidth = pts[i].w + 1.5;
    ctx.stroke();
  }
  if (!head) head = pts[pts.length - 1];
  ctx.globalAlpha = 1;
  drawGlow(ctx, glowOf(PAL.emerald), head.x, head.y, 24, 0.85 * a);
  drawGlow(ctx, glowOf(PAL.pearl), head.x, head.y, 11, a);
  ctx.globalCompositeOperation = 'source-over';
  glint(ctx, head.x, head.y, 9, a * 0.9, uHead * 9);
  ctx.globalAlpha = clamp(a);
  ctx.fillStyle = HEX.ink;
  ctx.fillRect(Math.round(head.x - 2.5), Math.round(head.y - 2.5), 5, 5);
  ctx.fillStyle = HEX.pearl;
  ctx.fillRect(Math.round(head.x - 1.5), Math.round(head.y - 1.5), 3, 3);
  ctx.restore();
}

/** A four-point pearl glint with a jade-and-pearl core (fx.sparkle's core is ice-blue: this move stays pearl and jade). */
function glint(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: number, rot = 0) {
  if (a <= 0 || r <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = clamp(a);
  ctx.fillStyle = HEX.pearl;
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.12, 0);
    ctx.lineTo(-r * 0.12, 0);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  drawGlow(ctx, glowOf(PAL.jade), 0, 0, r * 0.7, a * 0.6);
  drawGlow(ctx, glowOf(PAL.pearl), 0, 0, r * 0.4, a);
  ctx.restore();
}

/** Ink sightlines from each defender's head toward the far side, and a hand-lettered "?" (they bought the look). */
function drawGag(ctx: CanvasRenderingContext2D, heads: [number, number, number][], t: number) {
  heads.forEach(([hx, hy, e], i) => {
    const c = CAST[i];
    const k = ease.outCubic(clamp((t - c.q) / 0.14));
    if (k <= 0) return;
    // A trail of three ink dots from his head toward the far side, ending in the "?": he is still looking over there.
    const len = 34 * e, ca = Math.cos(c.gaze), sa = Math.sin(c.gaze);
    const x0 = hx + ca * 5 * e, y0 = hy + sa * 5 * e + 3 * e;
    ctx.save();
    ctx.globalAlpha = 0.95 * clamp(k * 2);
    for (let d = 0; d < 3; d++) {
      const f = (d + 1) / 4;
      if (k < f) break;
      const r = Math.max(1, Math.round((1 + d * 0.6) * e * 1.6));
      const x = Math.round(x0 + ca * len * f), y = Math.round(y0 + sa * len * f);
      ctx.fillStyle = HEX.paper;
      ctx.fillRect(x - r - 1, y - r - 1, 2 * r + 2, 2 * r + 2);
      ctx.fillStyle = HEX.ink;
      ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
    ctx.restore();
    const q = clamp((k - 0.6) / 0.4);
    inkSfx(ctx, '?', x0 + ca * (len + 8 * e), y0 + sa * (len + 8 * e), Math.round(clamp(26 * e, 15, 26)), -0.2 + 0.1 * i, { pop: q, alpha: 0.95 });
  });
}

// ---------------------------------------------------------------- the shot

export const shotMeridian: Shot = {
  name: 'Meridian',
  dur: DUR,
  seed: 405,
  rate: rateAt,
  cues: [
    { at: 0, fn: (env) => env.sfx.whoosh(0.5, 900, 250, 0.35) },
    { at: PULSE0, fn: (env) => env.sfx.zip(0.4) },
    { at: 0.3, fn: (env) => env.sfx.crowd(1.3, 0.35) },
    { at: PUSH0, fn: (env) => env.sfx.whoosh(0.3, 300, 2600, 0.45) },
    // The pulse re-plucks each eye's note as it passes (E5, F#5, A5).
    ...EYE_PASS.map((at, i) => ({ at, fn: (env: Env) => env.sfx.pluck([N.E5, N.Fs5, N.A5][i], 0.9, 0.2, (i - 1) * 0.25) })),
    // The three eye notes re-plucked softly in tremolo, like a lute holding a chord (tightening into the push-in).
    ...(() => {
      const out: { at: number; fn: (env: Env) => void }[] = [];
      let k = 0;
      for (let at = 0.04; at < DUR - 0.03; k++) {
        const near = EYE_PASS.some((p) => Math.abs(p - at) < 0.035);
        const note = [N.E5, N.Fs5, N.A5][k % 3];
        const g = 0.12;
        if (!near) out.push({ at, fn: (env: Env) => env.sfx.pluck(note, 0.45, g, ((k % 3) - 1) * 0.2) });
        at += at < PUSH0 ? 0.085 : lerp(0.07, 0.045, (at - PUSH0) / (DUR - PUSH0));
      }
      return out;
    })(),
  ],
  prepare(env) {
    prepareCaches(env);
  },
  init(env) {
    env.sfx.clearBus();
    if (!ready) prepareCaches(env);
    spin = new BallSpin();
    lastSteps = -1;
    const v = viewAt(0);
    env.cam.set(v.cx, v.cy, v.Z, 0);
    env.cam.shakeAmp = 0;
    env.cam.shakeRoll = 0; // no camera roll in this move
  },
  update(env, t, dt) {
    const { rng, parts } = env;
    // The ball rolls (forward roll on its travel) with the trivela's sidespin still on it.
    spin.rotate(0, 0, 1, (60 * dt) / BALL_R * 0.9);
    spin.rotate(0, 1, 0, -6 * dt);
    const v = viewAt(t);
    if (v.p > 0.02) return;
    // Jade motes shed by the ball, and ink dust at No.7's footfalls (world = world2 once the view is broadcast).
    const b = PATH.at(uBall(t));
    if (rng.next() < 0.5 * dt * 60) {
      parts.spawn({
        kind: PK.Pixel, x: b.x - rng.range(3, 7), y: b.z - BALL_R + rng.range(-2, 2), vx: rng.range(-30, -8), vy: rng.range(-12, 4), drag: 6,
        max: rng.range(0.12, 0.22), s0: rng.range(1, 1.6), s1: 0.5, ramp: 'jade', r0: 0.1, r1: 0.7, add: true, layer: 1,
      });
    }
    const steps = Math.floor(no7Track(sim(t)).d / STRIDE_FRAME);
    if (lastSteps >= 0 && steps !== lastSteps && steps % 4 === 0 && sim(t) < S_END - REACH_LEAD) {
      const p = no7Track(sim(t));
      for (let i = 0; i < 3; i++) {
        parts.spawn({
          kind: PK.Smoke, x: p.x - rng.range(2, 6), y: p.z, vx: rng.range(-40, -10), vy: rng.range(-10, -2), drag: 3,
          max: rng.range(0.25, 0.4), s0: rng.range(1.5, 2.5), s1: rng.range(4, 6), ramp: 'ink', r0: 0.15, r1: 0.6, a0: 0.4, a1: 0, add: false, layer: 1,
        });
      }
    }
    lastSteps = steps;
  },
  render(env, t) {
    const { ctx, fx } = env;
    const v = viewAt(t);
    const s = sim(t);
    const still = t >= HOLD0 && t < PUSH0;

    // ---- environment: stands, pitch, goal, the inked cast (drawn before the ink page)
    drawEnvironment(env, v, t);
    // Floodlit turf, lifted toward the page's paper so the ink page reads as a manga page, not as night.
    {
      const [, hy] = toScr(v, 0, yOf(v, FIELD.horizon));
      env.screen();
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = 'rgba(239,231,214,0.16)';
      ctx.fillRect(0, hy, VW, VH - hy);
      ctx.restore();
    }
    drawGoalProj(env, v, 'back');
    env.screen();
    // Contact shadows of the players in colour (they ink with the turf).
    const tr = no7Track(s);
    shadow(ctx, v, tr.x + 1, tr.z, 9, 0.35);
    shadow(ctx, v, LAYOUT.strike.x + 2, LAYOUT.strike.z, 9, 0.35);
    const ub = uBall(t);
    const bq = PATH.at(ub);
    shadow(ctx, v, bq.x + 1, bq.z + 0.5, BALL_R * 1.1, 0.4);
    const heads = drawCast(env, v);
    drawGoalProj(env, v, 'front');
    // Out-of-focus blades along the bottom at grass level; they sink away as the camera rises.
    env.screen();
    if (v.p > 0.05) drawGrassFore(ctx, v.cx * v.Z, 0, { y: VH + (1 - v.p) * 90, alpha: clamp(v.p * 1.6) });
    // The ink page.
    inkGrade(ctx, 0.85);

    // ---- overlays on the page: the gag (ink sightlines and "?")
    env.screen();
    drawGag(ctx, heads, t);

    // ---- colour layer: eyes on the turf, the X, the thread and its pulse, No.10, No.7, the ball
    PATH.eyes.forEach((u, i) => {
      const e = PATH.at(u);
      const d = PATH.dir(u);
      const [sx, sy, sc] = proj(v, e.x, e.z);
      const flare = pulse(t, EYE_PASS[i], 0.32);
      const len = 18 * sc;
      // Narrow, tall and filled so the almond's points read at 1x (a flat outline ellipse would read as a ring).
      const sq = Math.max(0.75, groundSquash(v, e.z));
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.emerald), sx, sy, len * (0.4 + 0.4 * flare), 0.3 + 0.5 * flare);
      ctx.restore();
      needleEye(ctx, sx, sy, len * (1 + 0.15 * flare), 0.45 + 0.35 * flare, Math.atan2(d.z * groundSquash(v, e.z), d.x), 0.85 + 0.15 * flare, sq, { fill: 0.55 });
      if (flare > 0) glint(ctx, sx, sy - 1, 4 + 9 * flare, flare * 0.9, 0.3);
    });
    {
      const [sx, sy, sc] = proj(v, LAYOUT.target.x, LAYOUT.target.z);
      const beat = 0.5 + 0.5 * Math.cos(t * Math.PI * 2 * 3.2);
      const arrive = clamp((t - 0.82) / 0.3);
      const size = 6.5 * sc * (1 + 0.14 * beat + 0.25 * arrive);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.emerald), sx, sy, size * 2.4, 0.3 + 0.2 * beat + 0.3 * arrive);
      ctx.restore();
      crossStitch(ctx, sx, sy, size, 1, 0.5 * groundSquash(v, LAYOUT.target.z) + 0.08);
    }
    const th = threadPoints(v, t);
    const eyesAt = PATH.eyes.map((u) => u / ub);
    // The thread holds the chord: a faint standing wave between the eyes, plucked harder where the pulse just passed.
    const amp = 0.45 + 1.6 * Math.max(...EYE_PASS.map((p) => pulse(t, p, 0.28)));
    const plucked = pluckLine(th.pts, { amp, phase: t * 70, nodes: eyesAt });
    taperThread(ctx, plucked.map((q, i) => ({ x: q.x, y: q.y, w: th.pts[i].w })));
    if (t >= PULSE0 && t < PULSE1 + 0.12) {
      const a = t < PULSE1 ? 1 : clamp(1 - (t - PULSE1) / 0.12);
      drawPulse(ctx, plucked.map((q, i) => ({ x: q.x, y: q.y, w: th.pts[i].w })), th.us, Math.min(pulseU(t), ub), a);
    }

    // No.10, small at the strike, holding T9 (static): the thread starts at his boot.
    {
      const [sx, sy, sc] = proj(v, LAYOUT.strike.x + 4, LAYOUT.strike.z + 1);
      const e = sc * K_WORLD;
      if (hero) drawStudio(ctx, hero, sx, sy, e, still);
      else {
        env.world();
        drawNo10Boxed(env, 'T9', LAYOUT.strike.x + 4, LAYOUT.strike.z + 1, K_WORLD);
        env.screen();
      }
      const [bx, by] = proj(v, LAYOUT.strike.x, LAYOUT.strike.z, BALL_R * 0.8);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.jade), bx, by, 6 * sc * 0.6 + 4, 0.5 + 0.5 * pulse(t, PULSE0, 0.25));
      ctx.restore();
    }

    // The ball: the brightest point (pearl halo, emerald glow, ink outline), at each scale its own crisp raster. It
    // rolls on the far side of No.7 (field z ~285-295 against his ~300-309), so it is drawn before him while it is
    // behind him: it trails into his stride, it is not on his thigh as if he were already dribbling it.
    const [bsx, bsy, bsc] = proj(v, bq.x, bq.z, BALL_R);
    const br = Math.max(2, Math.round(BALL_R * bsc));
    const ballBehind = bq.z < tr.z - 2;
    if (ballBehind) drawBall(env, spin, bsx, bsy, br, 1, 0, 0.85, 'pearl');

    // No.7 sprinting onto the X: the run cycle steps on his travel, then the reach (Receive R1).
    {
      const reaching = s >= S_END - REACH_LEAD;
      const [sx, sy, sc] = proj(v, tr.x, tr.z);
      const e = sc * K_WORLD;
      // Ink speed lines off his back (longer in the slow motion).
      if (!reaching) {
        const r = new Rng(5051);
        ctx.save();
        ctx.strokeStyle = HEX.ink;
        ctx.lineCap = 'round';
        const sl = 1 + 1.4 * clamp((t - SLOW_A) / 0.2);
        for (let i = 0; i < 3; i++) {
          const yy = sy - r.range(30, 76) * e, x0 = sx - r.range(26, 40) * e;
          ctx.globalAlpha = 0.42;
          ctx.lineWidth = r.next() < 0.5 ? 2 : 1;
          ctx.beginPath();
          ctx.moveTo(x0, yy);
          ctx.lineTo(x0 - r.range(10, 22) * e * 2 * sl, yy + 1);
          ctx.stroke();
        }
        ctx.restore();
      }
      const f = reaching ? reach : run[Math.floor(tr.d / STRIDE_FRAME) % 8];
      if (f) drawStudio(ctx, f, sx, sy, e, still);
      else {
        env.world();
        drawNo7Boxed(env, reaching ? 'Receive.R1' : RUN_KEYS[Math.floor(tr.d / STRIDE_FRAME) % 8], tr.x, tr.z, K_WORLD);
        env.screen();
      }
      // Behind him, only its additive pearl light comes back over him, in proportion to how much of it his legs hide:
      // it stays the brightest point and is never lost.
      if (ballBehind) {
        const cover = f ? spriteCover(f.a, f.i, f.piv[0] + (bsx - sx) / e, f.piv[1] + (bsy - sy) / e, br / e) : 0.5;
        if (cover > 0) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          drawGlow(ctx, glowOf([251, 246, 234]), bsx, bsy, br * 2.2, 0.5 * 0.85 * cover);
          drawGlow(ctx, glowOf([251, 246, 234]), bsx, bsy, br * 1.1, 0.35 * 0.85 * cover);
          ctx.restore();
        }
      }
    }
    if (!ballBehind) drawBall(env, spin, bsx, bsy, br, 1, 0, 0.85, 'pearl');
    env.world();
    env.parts.draw(ctx, 1);

    // ---- the push-in: ink focus lines on him, radial blur
    env.screen();
    const pushK = clamp((t - PUSH0) / (DUR - PUSH0));
    const [mx, my] = proj(v, tr.x + 2, tr.z, 12);
    if (pushK > 0) {
      const r = env.frng(5);
      focusLines(ctx, r, mx, my, lerp(260, 120, pushK), 760, 60, HEX.ink, 0.32 * ease.inQuad(pushK), 3);
    }

    // ---- post
    meridianGrade(fx, true);
    fx.vignette = 0.32 + 0.12 * pushK;
    if (pushK > 0) {
      fx.radial = 0.12 * ease.inCubic(pushK);
      fx.radialX = mx / VW;
      fx.radialY = my / VH;
      fx.ca = 0.003 * pushK;
    }
    // Opens out of shot 4's one-frame paper flash (2-frame flash-out).
    paperFlash(fx, 0.5 * (1 - clamp(t / (2 / 60))));
  },
};
