// MERIDIAN THREAD v2 · shot 7 · "Needle Fall" (1.2 s, seed 417, global 10.9-12.1). SPEC.md shot 7: speed and tension.
// The needle of light dives out of the sky at the X; the friend and the keeper race for it; the inner clock runs out.
//
// View: DownPitchView (the shared pitch-only tilt) falling with the ball, behind and above it, looking steeply down at
// the box (about 70 deg). The eye drops 40 m -> 8 m and f pushes 430 -> 660; how far behind the ball the eye rides is
// solved every frame so the ball hangs a set distance straight above the X on screen (the bomb-sight), and a lens shift
// pins the X on screen, so the whole box blooms outward from it as we fall: the far stand and the goal rise out of the
// top of the frame, the 6-yard box swells to the frame edges. Roll 0, no dolly zoom (the eye really falls; f only adds
// a push), no pull-out.
//
//   0.00-0.22  THE CARRIED-IN WHIP: shot 6's whip-tilt lands here still moving: the world keeps rushing up into place
//              (120 px, outCubic) on the shared streak (0.10 -> 0 along (0, 1) over 0.12 s, the ball sharp in its hole);
//              the ball enters at shot 6's slingshot speed (no restart from rest) at its screen point (344, 170).
//   0.00-0.25  THE NEEDLE FORMS: the Sky Eye's lids squeeze into a narrow vesica that swings upright at the top of the
//              frame: the needle's eye, the Meridian's thread still running through it and out of the frame. The stroke
//              tightens into a straight shaft (24 -> 12 px: ink under-stroke, emerald halo, jade body, mint inner, pearl
//              core, ink cross-stitches, a pearl thread wound round it drilling down, glints pouring into the point) from
//              the eye to the ball: a needle of light pointing straight down at the X.
//   0.00-1.20  THE BALL: 52 -> 72 px (r13 -> r18 at an integer 2x), stretched along its fall, jade seams, a pearl glint,
//              a running-stitch collar, spin marks, threads of light torn off its flanks, droplets and pearl motes
//              streaming up past it; beside it the altitude readout (shot 5's 26 M) counts down 24 M -> 02 M.
//   BELOW      the box rushes up out of the X (speed lines flowing out of it, air streaks rushing up past the lens, a
//              radial zoom blur 0.06 -> 0.11 aimed just under the ball so the ball stays sharp); the cross-stitch X grows
//              20 -> 90 px in its jade pool (Night Ink partly restored) inside a turning stitched reticle and pulses on
//              each of No.7's footfalls (0.20 / 0.40 / 0.58 / 0.72, quickening); the needle's ink shadow, a running
//              stitch of jade light along it, races across the turf from the X onto No.7's boots (0.30 -> 0.80).
//   RUNNERS    No.7 (studio Run, boxed 0.45x -> 0.85x with a jade rim from the needle above, never graded) sprints in
//              from the lower right on the near side; the keeper (KEEPER_KIT puppet inked with the world, running ->
//              set in gkReady at 0.78) charges off his line from the upper left.
//   0.70-1.10  THE INNER CLOCK: six ticks, accelerating (0.70 / 0.80 / 0.89 / 0.97 / 1.04 / 1.10); each one locks a
//              stitched ring down onto the X, quivers the needle (canvas + the pluck warp) and nudges the camera.
//   0.80       THE PUSH-OFF: No.7 plants (Header H1, integer 1x) as the shadow reaches him and the keeper commits: a flat
//              stitched ring and light-stitches burst from his boot, focus lines flash in, cam.hit 0.3.
//   0.95-1.20  H1b: he leaves the ground toward the ball; the X and the ball fill the lower half. 1.06-1.20 is the last
//              stretch (rate 0.6): the ink deepens, focus lines close in on the meeting point, the readout and the blur
//              fall away, 1.10 the near-silence; motion cut on his take-off into shot 8.
//
// Night Ink 0.85 (0.95 in the hush) once per frame with the pool round the X partly restored; No.7, the ball and the
// needle are never graded. FlashBudget: nothing (no flash, no impact, no fullFrame). Deterministic: init() resets the
// spin and the flags; particles and spin advance in update() on the warped dt (env.rng); render() is a pure function of t
// and that state (env.frng for flicker). Never the banned word: loft, pass, header, arc, line.

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { BallSpin } from '../../engine/pixel';
import { TAU, clamp, ease, lerp } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import { sparkle, spinMarks, type TrailPt } from '../../art/fx';
import { POSES, P, KEEPER_KIT, joints, type Kit, type Pose } from '../../art/puppet';
import { drawDownPitch, projectDecal, type DownPitchView, type Projected } from '../../art/stadium';
import { drawAnim, drawAnimBoxed } from '../../art/studioAnim';
import { no7, no7Anchor, type No7Key } from '../../art/no7';
import { drawBall, holdTrauma, keys, punch, type PuppetSil } from '../kit';
import {
  HEX, LAYOUT, M, PAL, PUPPETS, RATE, SHOTS, arcAt, assertMeridianFx, crossStitch, nightGrade, nightInk, readout,
  resetSpin, setPluck, skyEye, stitchBurst, stitchRing, threadLine, warmMeridian, whip,
} from './common';

const META = SHOTS[6];
const DUR = META.dur;

// ---------------------------------------------------------------- beats (shot-local s, the runner's unwarped clock)

/** The needle has formed (the eye squeezed upright, the shaft tightened). */
const T_FORM = 0.25;
/** No.7's footfalls (the X pulses on each), quickening. */
const STEPS = [0.2, 0.4, 0.58, 0.72];
/** His inner clock: six accelerating ticks; each locks a stitched ring onto the X. */
const TICKS = [0.7, 0.8, 0.89, 0.97, 1.04, 1.1];
/** No.7's push-off (H1) as the keeper commits; the take-off (H1b). */
const T_PUSH = 0.8;
const T_LIFT = 0.95;
/** The last stretch (rate 0.6) before the cut. */
const T_STRETCH = 1.06;
/** The shadow races from the X onto No.7's boots. */
const T_SHADOW0 = 0.3;

/** The shot's warped clock (story time): the last stretch runs at 0.6 (pure function of t, for decorative motion). */
const tau = (t: number) => (t < T_STRETCH ? t : T_STRETCH + 0.6 * (t - T_STRETCH));

const TGT = LAYOUT.target;
/**
 * The ball's arc u (the brief's 0.79 -> 0.995 over the shot), entering at shot 6's slingshot speed (u' 0.104 / s at its
 * last frame) and accelerating (constant acceleration) instead of restarting from rest: no hitch at the whip-tilt cut.
 */
const ballU7 = (t: number) => {
  const c = clamp(t, 0, DUR);
  return 0.79 + 0.1037 * c + ((0.205 - 0.1037 * DUR) / (DUR * DUR)) * c * c;
};
/** 0..1, 1 at `at` decaying linearly over `len`. */
const pulseAt = (t: number, at: number, len: number) => (t < at ? 0 : clamp(1 - (t - at) / len));
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// ---------------------------------------------------------------- the falling view

/**
 * The eye drops 40 m -> 8 m (falling faster than the ball at first, so the box rushes up from the first frame) and
 * f pushes 430 -> 660. How far behind the ball the eye rides (6.8 m -> 1.4 m -> 2.7 m) is solved every frame so the ball
 * hangs a set distance above the X on screen (the bomb-sight: 70 px at the cut, 84 px in the dive, closing to 50 px as
 * it arrives); the tilt looks 4 deg above the X and a lens shift pins the X on screen, so the whole box blooms outward
 * from it. The eye rides 2.6 m -> 0.6 m to the far side of the ball, so the needle stands straight over the X and the
 * keeper's charge stays clear of it.
 */
const DEG = Math.PI / 180;
const eyeH = (t: number) => {
  const k = clamp(t / DUR);
  return 400 - 318 * (0.45 * k + 0.55 * k * k);
};
const eyeZ = (t: number) => lerp(270, 290, clamp(t / DUR));
const focalAt = (t: number) => keys([[0, 430], [0.6, 560, 'inOutSine'], [DUR, 660, 'inQuad']], t);
/** Where the X is pinned on screen (it settles out of shot 6's whip, then sinks as the ball arrives). */
const xTarget = (t: number): [number, number] => [
  keys([[0, 345], [0.35, 330, 'inOutSine'], [DUR, 326, 'inOutSine']], t),
  keys([[0, 240], [0.35, 244, 'inOutSine'], [0.8, 250, 'inOutSine'], [DUR, 262, 'inQuad']], t),
];
/** The ball's distance above the X on screen. */
const sepTarget = (t: number) => keys([[0, 70], [0.6, 84], [1.0, 80], [DUR, 50, 'inQuad']], t);
/** The carried-in whip: the world (not the ball) still rising into place, screen px. */
const worldLift = (t: number) => 120 * (1 - ease.outCubic(clamp(t / 0.22)));

interface Views {
  /** The ball-locked view (the ball, the needle). */
  v: DownPitchView;
  /** The world view (the pitch, the X, the figures): v plus the carried-in lift. */
  w: DownPitchView;
}
function buildView(t: number, back: number, ax: number): DownPitchView {
  const v: DownPitchView = { x: ax - back, z: eyeZ(t), h: eyeH(t), f: focalAt(t), tilt: 0, horizon: 180, cx: 320 };
  v.tilt = Math.atan2(v.h, TGT.x - v.x) - 4 * DEG;
  const X = projectDecal(TGT.x, TGT.z, 0, v);
  const [sx, sy] = xTarget(t);
  v.cx += sx - X.x;
  v.horizon += sy - X.y;
  return v;
}
function viewsAt(t: number): Views {
  const a = arcAt(ballU7(t));
  const want = sepTarget(t);
  // Riding further behind the ball shows it further above the X: bisect for the wanted separation.
  let lo = 2, hi = 200;
  for (let i = 0; i < 26; i++) {
    const m = (lo + hi) / 2;
    const v = buildView(t, m, a.x);
    const b = projectDecal(a.x, a.z, a.h, v), X = projectDecal(TGT.x, TGT.z, 0, v);
    if (Math.hypot(b.x - X.x, b.y - X.y) > want) hi = m;
    else lo = m;
  }
  const v = buildView(t, (lo + hi) / 2, a.x);
  return { v, w: { ...v, horizon: v.horizon + worldLift(t) } };
}

// ---------------------------------------------------------------- the runners

/** No.7's field path: the sprint to the push-off point, planted for H1, then the dive's first metre (H1b). */
function no7At(t: number): { x: number; z: number; h: number } {
  // He curves in from the near touchline side, attacking the X from below and to its right (it stays in view).
  if (t < T_PUSH) {
    const k = t / T_PUSH;
    return { x: lerp(1060, 1100, k), z: lerp(348, 312, ease.outSine(k)), h: 0 };
  }
  if (t < T_LIFT) return { x: 1100, z: 312, h: 0 };
  const k = clamp((t - T_LIFT) / (DUR - T_LIFT));
  return { x: lerp(1100, 1113, k), z: lerp(312, 302, k), h: 12 * ease.outQuad(k) };
}
/** The run cycle, timed so a contact frame (R1 / R5) lands on each footfall; then H1 at the push-off, H1b at the lift. */
function no7Key(t: number): No7Key {
  if (t >= T_LIFT) return 'Header.H1b';
  if (t >= T_PUSH) return 'Header.H1';
  const marks = [-0.2, ...STEPS, T_PUSH];
  let j = 0;
  while (j < marks.length - 2 && t >= marks[j + 1]) j++;
  const s0 = marks[j], s1 = marks[j + 1];
  const f = Math.min(3, Math.floor((4 * (t - s0)) / (s1 - s0)));
  const base = j % 2 === 0 ? 5 : 1;
  return `Run.R${base + f}` as No7Key;
}
/** No.7's art scale: boxed 0.45 -> 0.85 (cheated up from his true size so he reads), then an integer 1x from the push-off. */
function no7Scale(t: number): number {
  if (t >= T_PUSH) return 1;
  return Math.min(0.85, Math.round(keys([[0, 0.45], [T_PUSH, 0.85, 'inQuad']], t) * 20) / 20);
}
const NO7_SCALES = [0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85];
const NO7_KEYS: No7Key[] = ['Run.R1', 'Run.R2', 'Run.R3', 'Run.R4', 'Run.R5', 'Run.R6', 'Run.R7', 'Run.R8', 'Header.H1', 'Header.H1b'];

/** The keeper charging off his line toward the near post (field), running until he sets (gkReady) at the push-off. */
function keeperAt(t: number) {
  const k = ease.outSine(clamp(t / DUR));
  return { x: lerp(1174, 1148, k), z: lerp(248, 266, k) };
}
const GK_RUN: Pose[] = [POSES.run1, POSES.run2, POSES.run3, POSES.run4].map((p) => P({ ...p, torso: 24 * DEG, armN: -50 * DEG, armF: 50 * DEG }));
const GK_SET = P({ ...POSES.gkReady, torso: 30 * DEG, head: -30 * DEG, armN: 70 * DEG, armF: 64 * DEG });
function keeperPose(t: number): [string, Pose] {
  if (t >= 0.78) return ['gkSet', GK_SET];
  const i = Math.floor(t / 0.075) % 4;
  return [`gkRun${i}`, GK_RUN[i]];
}
/** Ink silhouettes rim-lit jade from the needle above. */
const SIL: PuppetSil = { fill: [8, 20, 16], rim: PAL.jade, rim2: PAL.emerald, lx: -0.25, ly: -0.97 };

function footDepth(p: Pose) {
  const j = joints(p);
  return Math.max(j.toeN[1], j.toeF[1], j.ankleN[1]) + 2;
}
/** A puppet silhouette standing with its feet on the projected point q (k = puppet px per unit, quantized). */
function drawFigure(ctx: CanvasRenderingContext2D, name: string, kit: Kit, pose: Pose, k: number, facing: 1 | -1, q: { x: number; y: number }, alpha = 1) {
  const kq = Math.max(0.15, Math.round(k * 20) / 20);
  const D = k / kq;
  const foot = footDepth(pose) * kq * D;
  PUPPETS.draw(ctx, `m7-${name}`, kit, pose, kq, facing, Math.round(q.x), Math.round(q.y - foot), D, 1, SIL, alpha);
}

// ---------------------------------------------------------------- No.7's jade rim (tinted copies, built in prepare)

const rimCache = new Map<string, HTMLCanvasElement>();
function rimOf(key: No7Key, scale: number): HTMLCanvasElement | null {
  const ck = `${key}|${scale}`;
  const hit = rimCache.get(ck);
  if (hit) return hit;
  const f = no7(key);
  if (!f) return null;
  const src = scale < 1 ? f.a.boxed(f.i, scale) : f.a.frames[f.i].img;
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  const g = c.getContext('2d')!;
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = HEX.jade;
  g.fillRect(0, 0, c.width, c.height);
  rimCache.set(ck, c);
  return c;
}
/** Draw No.7 (studio frames only: boxed below 1x, an integer 1x above) with his contact anchor on (x, y). */
function drawNo7At(env: Env, key: No7Key, x: number, y: number, scale: number) {
  const f = no7(key);
  if (!f) return;
  const ctx = env.ctx;
  const [ax, ay] = no7Anchor(key, 'contact');
  // The jade rim from the needle above: a tinted copy one pixel up-left, under the sprite.
  const rim = rimOf(key, scale);
  if (rim) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = 0.9;
    const ox = Math.round(x - ax * scale), oy = Math.round(y - ay * scale);
    ctx.drawImage(rim, ox - 1, oy - 1);
    ctx.drawImage(rim, ox, oy - 1);
    ctx.restore();
  }
  if (scale < 1) drawAnimBoxed(ctx, f.a, f.i, Math.round(x), Math.round(y), scale, { pivot: [ax, ay] });
  else drawAnim(ctx, f.a, null, f.i, Math.round(x), Math.round(y), 1, { pivot: [ax, ay] });
}

// ---------------------------------------------------------------- state (reset in init; advanced in update)

let spin = new BallSpin();
let fired = { push: false };

// ---------------------------------------------------------------- geometry shared by update and render

interface Frame {
  vs: Views;
  /** Ball centre on screen (ball-locked view). */
  bx: number;
  by: number;
  /** Ball radius on screen (r at an integer 2x). */
  br: number;
  R: number;
  /** The X on screen (world view) and its half-size, ground squash. */
  X: Projected;
  xs: number;
  /** Unit vector from the ball up along the needle (toward its eye). */
  ux: number;
  uy: number;
  /** The needle's eye (centre) and its lower tip on screen. */
  ex: number;
  ey: number;
  eyeLen: number;
}
function frameAt(t: number): Frame {
  const vs = viewsAt(t);
  const a = arcAt(ballU7(t));
  const b = projectDecal(a.x, a.z, a.h, vs.v);
  const X = projectDecal(TGT.x, TGT.z, 0, vs.w);
  const br = Math.round(keys([[0, 13], [DUR, 18.4, 'inQuad']], t));
  // The needle points through the ball at the X (the X of the ball-locked view, so the lift never swings it).
  const Xv = projectDecal(TGT.x, TGT.z, 0, vs.v);
  let ux = b.x - Xv.x, uy = b.y - Xv.y;
  const l = Math.hypot(ux, uy) || 1;
  ux /= l;
  uy /= l;
  // The needle's eye sits high at the tail: near the top of the frame, rising out of it as the ball arrives.
  const eyeY = keys([[0, 26], [0.8, 20], [DUR, -44, 'inQuad']], t);
  const L = Math.max(70, (b.y - eyeY) / Math.max(0.3, -uy));
  const eyeLen = keys([[0, 200], [T_FORM, 64, 'outCubic'], [DUR, 72]], t);
  return {
    vs, bx: b.x, by: b.y, br, R: br * 2, X, xs: Math.max(10, 7.6 * X.s), ux, uy,
    ex: b.x + ux * L, ey: b.y + uy * L, eyeLen,
  };
}

// ---------------------------------------------------------------- drawing helpers

/**
 * Speed lines flowing out of the X (the box rushing up at us): pale mint dashes on ink under-strokes, longer and faster
 * toward the frame edges. A pure function of the story clock.
 */
function outflow(ctx: CanvasRenderingContext2D, cx: number, cy: number, tt: number, amt: number, sq: number) {
  if (amt <= 0) return;
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < 54; i++) {
    const ang = hash(i * 3.1) * TAU;
    const sp = 0.8 + hash(i * 7.7) * 1.2;
    const u = (tt * sp * (0.7 + 1.1 * amt) + hash(i * 1.3)) % 1;
    const r = 60 + Math.pow(u, 1.6) * 480;
    const len = 8 + r * 0.32 * amt;
    const c = Math.cos(ang), s = Math.sin(ang) * sq;
    const x0 = cx + c * r, y0 = cy + s * r, x1 = cx + c * (r + len), y1 = cy + s * (r + len);
    const a = amt * Math.min(1, u * 4) * (1 - Math.pow(u, 5));
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = clamp(a * 0.6);
    ctx.strokeStyle = HEX.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = clamp(a * (i % 4 ? 0.42 : 0.7));
    ctx.strokeStyle = i % 4 ? HEX.jade : HEX.mint;
    ctx.lineWidth = i % 5 ? 1 : 2;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }
  ctx.restore();
}

/** Air rushing up past the lens as we fall (long faint streaks near the frame edges). */
function airRush(ctx: CanvasRenderingContext2D, tt: number, amt: number) {
  if (amt <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for (let i = 0; i < 22; i++) {
    const side = i % 2 ? 1 : -1;
    const x = VW / 2 + side * (130 + hash(i * 5.3) * 200);
    const sp = 2.2 + hash(i * 2.9) * 2.4;
    const y = VH + 140 - ((tt * sp + hash(i * 9.1)) % 1) * (VH + 320);
    const len = 50 + hash(i * 4.4) * 110;
    ctx.globalAlpha = clamp(amt * (0.2 + 0.3 * hash(i * 6.6)));
    ctx.strokeStyle = i % 4 ? HEX.mint : HEX.pearl;
    ctx.lineWidth = 1 + (hash(i * 8.8) < 0.3 ? 1 : 0);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + side * len * 0.08, y + len);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * The needle of light: a straight shaft from the eye's lower tip (p0, thin) to the ball (p1, w), crisp as a drawn line:
 * an ink under-stroke, an emerald halo, the jade body, a mint inner and a pearl core, ink cross-stitches across it and
 * pearl glints pouring down it into the point. `quiver` bends it in one standing half-wave (a tick of the inner clock).
 */
function needleShaft(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, w: number, tt: number, quiver: number) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
  const ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
  const N = 16;
  const at = (k: number, side: number, half: number): [number, number] => {
    const q = quiver * Math.sin(Math.PI * k);
    return [x0 + dx * k + nx * (q + side * half), y0 + dy * k + ny * (q + side * half)];
  };
  const band = (w0: number, w1: number) => {
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const k = i / N;
      const [x, y] = at(k, 1, lerp(w0, w1, k) / 2);
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    }
    for (let i = N; i >= 0; i--) {
      const k = i / N;
      const [x, y] = at(k, -1, lerp(w0, w1, k) / 2);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
  };
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.fillStyle = HEX.ink;
  band(5, w + 6);
  ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = HEX.emerald;
  band(8, w * 2.6);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.fillStyle = HEX.jade;
  band(2, w);
  ctx.fill();
  ctx.fillStyle = HEX.mint;
  band(1, w * 0.5);
  ctx.fill();
  ctx.fillStyle = HEX.pearl;
  band(1, Math.max(2, w * 0.18));
  ctx.fill();
  // Ink cross-stitches across the body.
  ctx.strokeStyle = HEX.ink;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.85;
  for (let d = 30; d < L - 26; d += 44) {
    const k = d / L;
    const hw = lerp(2, w, k) * 0.32;
    const [cx, cy] = at(k, 0, 0);
    ctx.beginPath();
    ctx.moveTo(cx - (ux + nx) * hw, cy - (uy + ny) * hw);
    ctx.lineTo(cx + (ux + nx) * hw, cy + (uy + ny) * hw);
    ctx.moveTo(cx - (ux - nx) * hw, cy - (uy - ny) * hw);
    ctx.lineTo(cx + (ux - nx) * hw, cy + (uy - ny) * hw);
    ctx.stroke();
  }
  // Pearl glints pouring down into the point.
  ctx.globalCompositeOperation = 'lighter';
  for (let g = 0; g < 3; g++) {
    const k = (tt * 2.6 + g / 3) % 1;
    const [gx, gy] = at(k, 0, 0);
    drawGlow(ctx, glowOf(PAL.pearl), gx, gy, 3 + w * 0.35 * k, 0.85);
  }
  ctx.restore();
}

/** The needle's thread: the Meridian running back up through the eye and out of the frame (toward No.10). */
function threadThroughEye(ctx: CanvasRenderingContext2D, ex: number, ey: number, ux: number, uy: number, half: number, tt: number, a: number) {
  if (a <= 0) return;
  const pts: TrailPt[] = [];
  // Through the eye (from its lower end), out of its upper tip and streaming back up and to the left, out of the frame:
  // the rest of the Meridian, still running back to No.10.
  const sx = ex - ux * half * 0.3, sy = ey - uy * half * 0.3;
  for (let i = 0; i <= 22; i++) {
    const k = i / 22;
    const d = k * 240;
    const wav = Math.sin(k * 7 - tt * 11) * 5 * Math.min(1, k * 3);
    const bx = sx + ux * d - k * k * 150;
    const by = sy + uy * d * 0.55 + k * k * 30;
    pts.push({ x: bx + uy * wav, y: by - ux * wav });
  }
  threadLine(ctx, pts, 3, a, { halo: 1.6 });
}

/**
 * A pearl thread wound round the needle (a running helix, drilling down toward the point): the front turns drawn
 * bright over the shaft, the back turns faint. w = the shaft width at the ball.
 */
function needleHelix(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, w: number, tt: number, a: number) {
  if (a <= 0) return;
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L;
  const turns = Math.max(2, L / 46);
  const N = Math.ceil(turns * 18);
  ctx.save();
  ctx.lineCap = 'round';
  for (const front of [false, true]) {
    ctx.strokeStyle = front ? HEX.pearl : HEX.mint;
    ctx.lineWidth = front ? 1.6 : 1;
    ctx.globalAlpha = a * (front ? 0.95 : 0.3);
    ctx.beginPath();
    let pen = false;
    for (let i = 0; i <= N; i++) {
      const k = i / N;
      const ph = TAU * (turns * k - tt * 3.2);
      const isFront = Math.cos(ph) > 0;
      const r = (lerp(2.5, w, k) / 2 + 2) * Math.sin(ph);
      const x = x0 + dx * k + nx * r, y = y0 + dy * k + ny * r;
      if (isFront !== front) {
        pen = false;
        continue;
      }
      if (pen) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
      pen = true;
    }
    ctx.stroke();
  }
  ctx.restore();
}

/** Threads of light torn off the ball's flanks, streaming up behind it (its wake as it falls). */
function ballWake(ctx: CanvasRenderingContext2D, bx: number, by: number, R: number, ux: number, uy: number, tt: number, a: number) {
  if (a <= 0) return;
  const nx = -uy, ny = ux;
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const side = i % 2 ? 1 : -1;
    const spread = 0.62 + 0.38 * hash(i * 2.3);
    const phase = (tt * (3 + hash(i * 4.1) * 2) + hash(i * 6.7)) % 1;
    // Each thread is shed at the ball's flank and streams straight up behind it (we fall with the ball, it stays).
    const off = phase * 60;
    const len = (22 + 30 * hash(i * 9.3)) * (1 - 0.5 * phase);
    const sx = bx + nx * side * R * spread + ux * (R * 0.1 + off), sy = by + ny * side * R * spread + uy * (R * 0.1 + off);
    const ex = sx + ux * len + nx * side * len * 0.06, ey = sy + uy * len + ny * side * len * 0.06;
    const al = a * 0.65 * Math.min(1, phase * 6) * (1 - phase);
    ctx.globalAlpha = al * 0.7;
    ctx.strokeStyle = HEX.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = al;
    ctx.strokeStyle = i % 3 ? HEX.jade : HEX.mint;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
}

/** Manga focus lines from the frame edges converging on (cx, cy) (mint on the ink night; a frame-stable flicker). */
function edgeFocus(ctx: CanvasRenderingContext2D, env: Env, cx: number, cy: number, a: number) {
  if (a <= 0) return;
  const rng = env.frng(7);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = HEX.mint;
  for (let i = 0; i < 70; i++) {
    const ang = rng.next() * TAU;
    const r0 = 190 + rng.next() * 90, r1 = 520;
    const wd = (0.25 + rng.next()) * 0.008;
    ctx.globalAlpha = a * (0.25 + 0.5 * rng.next());
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0 * 0.8);
    ctx.lineTo(cx + Math.cos(ang - wd) * r1, cy + Math.sin(ang - wd) * r1 * 0.8);
    ctx.lineTo(cx + Math.cos(ang + wd) * r1, cy + Math.sin(ang + wd) * r1 * 0.8);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the shot

export const shotNeedleFall: Shot = {
  name: META.name,
  dur: META.dur,
  seed: META.seed,
  rate: RATE[7],
  cues: [
    { at: 0, fn: (e) => { e.sfx.whoosh(1.1, 3000, 400, 0.5); e.sfx.bow(587.33, 1.08, 0.25, 293.66); } },
    { at: 0.1, fn: (e) => e.sfx.crowd(1.2, 0.6) },
    ...STEPS.map((at) => ({ at, fn: (e: Env) => e.sfx.scuff(0.2) })),
    { at: T_PUSH, fn: (e) => e.sfx.scuff(0.32) },
    ...TICKS.map((at) => ({ at, fn: (e: Env) => e.sfx.tick() })),
    { at: 1.1, fn: (e) => { e.sfx.choke('bow'); e.sfx.duck(0.25, 0.3); } },
  ],
  prepare(env) {
    warmMeridian(env);
    // No.7's boxed caches and rims at every scale the shot uses, the 1x rims, and every keeper pose: no hitch at the cut.
    for (const k of NO7_KEYS) {
      const f = no7(k);
      if (!f) continue;
      for (const s of NO7_SCALES) {
        f.a.boxed(f.i, s);
        rimOf(k, s);
      }
      rimOf(k, 1);
    }
    const ctx = env.ctx;
    ctx.save();
    ctx.globalAlpha = 0;
    for (let k = 0.3; k <= 1.2; k += 0.05) {
      for (let i = 0; i < 4; i++) drawFigure(ctx, `gkRun${i}`, KEEPER_KIT, GK_RUN[i], k, 1, { x: -500, y: -500 });
      drawFigure(ctx, 'gkSet', KEEPER_KIT, GK_SET, k, 1, { x: -500, y: -500 });
    }
    ctx.restore();
  },
  init(env) {
    env.sfx.clearBus();
    env.cam.set(VW / 2, VH / 2, 1, 0);
    env.cam.shakeRoll = 0.015;
    env.cam.shakeAmp = 7;
    env.cam.trauma = 0.25;
    spin = new BallSpin();
    resetSpin(spin);
    // The ball arrives turning (it whipped out of the apex): start it part-way round so a seam faces us.
    spin.rotate(1, 0.25, 0.1, 1.3);
    fired = { push: false };
    PUPPETS.frame();
  },
  update(env, t, dt) {
    const { rng, parts, cam } = env;
    // Topspin (falling forward, clockwise seen from above): fast, slowed by the rate in the last stretch.
    spin.rotate(1, 0.18, -0.12, dt * 7 * TAU);
    holdTrauma(cam, lerp(0.12, 0.3, clamp(t / DUR)) + 0.12 * clamp((t - T_STRETCH) / 0.1));
    cam.shakeAmp = lerp(5, 9, clamp(t / DUR));
    const F = frameAt(t);
    const live = dt > 0 ? 1 : 0;
    // Jade droplets sheared off the shaft and left hanging in the air as we fall past them (they stream up the frame).
    if (live && rng.next() < 0.75) {
      const k = rng.range(0.2, 0.9);
      const x = lerp(F.bx, F.ex, k), y = lerp(F.by, F.ey, k);
      const side = rng.next() < 0.5 ? -1 : 1;
      const sp = rng.range(90, 220);
      parts.spawn({
        kind: PK.Streak, x: x - F.uy * side * 6, y: y + F.ux * side * 6,
        vx: -F.uy * side * sp, vy: F.ux * side * sp - rng.range(380, 720), drag: 1.4,
        max: rng.range(0.22, 0.4), s0: rng.range(1, 1.8), s1: 0.4, ramp: 'jade', r0: 0, r1: 0.9, k: 1.2, layer: 1,
      });
    }
    // Pearl motes shed by the ball (its wake runs up the frame).
    if (live && rng.next() < 0.6) {
      const a = rng.range(0, TAU);
      parts.spawn({
        kind: PK.Glow, x: F.bx + Math.cos(a) * F.R * 0.9, y: F.by + Math.sin(a) * F.R * 0.9,
        vx: Math.cos(a) * rng.range(40, 110), vy: -rng.range(420, 760), drag: 1.5,
        max: rng.range(0.2, 0.35), s0: rng.range(1.5, 2.5), s1: 0.4, ramp: 'jade', r0: 0, r1: 0.8, a0: 0.9, a1: 0, layer: 1,
      });
    }
    // The push-off: the shadow reaches him, light-stitches burst at his boot, the keeper commits.
    if (!fired.push && t >= T_PUSH) {
      fired.push = true;
      const p = no7At(T_PUSH);
      const q = projectDecal(p.x, p.z, 0, F.vs.w);
      stitchBurst(env, q.x, q.y, 18, 220, Math.PI * 1.2, -Math.PI / 2);
      cam.hit(0.3);
    }
  },
  render(env, t) {
    const { ctx, fx, cam } = env;
    const st = env.art.stadium;
    PUPPETS.frame();
    const tt = tau(t);
    // Camera: the shake rides on top; tiny zoom nudges on each tick of the inner clock and on the push-off.
    let z = 1;
    for (const k of TICKS) z += punch(t, k, 0.014, 0.03, 0.14);
    z += punch(t, T_PUSH, 0.03, 0.04, 0.25);
    cam.set(VW / 2, VH / 2, z, 0);
    env.world();
    ctx.fillStyle = HEX.night;
    ctx.fillRect(-60, -60, VW + 120, VH + 120);

    const F = frameAt(t);
    const { w } = F.vs;
    const X = F.X;
    const fall = clamp(t / DUR);
    /** The hush before the header: the ink deepens over the last stretch (1.06 -> 1.20). */
    const hush = ease.inQuad(clamp((t - T_STRETCH) / (DUR - T_STRETCH)));
    const xsq = Math.max(0.55, X.k);

    // ---- the world far below (inked; the jade pool round the X keeps some colour) ----
    drawDownPitch(ctx, st, w, 60 + t, { ambientFlashes: true });
    // The keeper charging off his line: inked with the world (a manga extra), so he reads as a grey shape in the night.
    const kp = keeperAt(t);
    const kq = projectDecal(kp.x, kp.z, 0, w);
    const [kname, kpose] = keeperPose(t);
    drawFigure(ctx, kname, KEEPER_KIT, kpose, Math.min(1.15, 0.34 * kq.s), 1, kq);
    nightInk(ctx, 0.85 + 0.1 * hush, (m) => {
      m.save();
      m.translate(X.x, X.y);
      m.scale(F.xs * 3.4, F.xs * 3.4 * xsq);
      const g = m.createRadialGradient(0, 0, 0, 0, 0, 1);
      g.addColorStop(0, 'rgba(0,0,0,0.38)');
      g.addColorStop(0.45, 'rgba(0,0,0,0.22)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      m.fillStyle = g;
      m.beginPath();
      m.arc(0, 0, 1, 0, TAU);
      m.fill();
      m.restore();
    });
    // The jade light falling on the turf round the X.
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.emerald), X.x, X.y, Math.min(170, F.xs * 4), 0.16 + 0.04 * fall, 1, xsq);
    drawGlow(ctx, glowOf(PAL.jade), X.x, X.y, F.xs * 1.5, 0.12, 1, xsq);
    ctx.globalCompositeOperation = 'source-over';


    // ---- the needle's shadow racing across the turf from the X onto No.7's boots ----
    const n7p = no7At(t);
    const n7g = projectDecal(n7p.x, n7p.z, 0, w);
    const sh = ease.outCubic(clamp((t - T_SHADOW0) / (T_PUSH - T_SHADOW0)));
    if (sh > 0) {
      const tx = lerp(X.x, n7g.x, sh), ty = lerp(X.y, n7g.y, sh);
      const half = Math.max(2.5, F.xs * 0.16);
      ctx.save();
      ctx.lineCap = 'round';
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = HEX.ink;
      ctx.lineWidth = half * 2.4;
      ctx.beginPath();
      ctx.moveTo(X.x, X.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      // A running stitch of jade light along it: the line laid on the turf for him.
      ctx.globalAlpha = 0.9;
      ctx.lineCap = 'butt';
      ctx.setLineDash([Math.max(4, half * 1.6), Math.max(3, half * 1.1)]);
      ctx.lineDashOffset = -tt * 90;
      ctx.strokeStyle = HEX.jade;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(X.x, X.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      if (sh < 1) {
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, glowOf(PAL.mint), tx, ty, 7, 0.8);
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    // ---- the cross-stitch X: a bomb-sight, pulsing on each footfall, rings locking onto it on each tick ----
    let stepK = 0;
    for (const s of STEPS) if (t >= s) stepK = Math.max(stepK, 1 - (t - s) / 0.14);
    stepK = clamp(stepK);
    stitchRing(ctx, X.x, X.y, F.xs * 2.4, 0.5 + 0.25 * fall, { squash: xsq, width: 1, dash: 6, gap: 6, phase: -tt * 60, ink: true });
    for (const k of TICKS) {
      const a = t - k;
      if (a < 0 || a > 0.32) continue;
      const lock = ease.inCubic(clamp(a / 0.1));
      const r = lerp(F.xs * 3.6, F.xs * 1.3, lock);
      const al = a < 0.1 ? 0.35 + 0.65 * lock : 1 - (a - 0.1) / 0.22;
      stitchRing(ctx, X.x, X.y, r, al, { squash: xsq, width: 2, color: a < 0.12 ? HEX.jade : HEX.pearl, phase: -a * 80 });
    }
    crossStitch(ctx, X.x, X.y, F.xs * (1 + 0.2 * stepK), 1, xsq);
    if (stepK > 0) {
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.jade), X.x, X.y, F.xs * 1.5, 0.4 * stepK, 1, xsq);
      ctx.globalCompositeOperation = 'source-over';
    }

    // ---- the box rushing up: speed lines flowing out of the X ----
    outflow(ctx, X.x, X.y, tt, lerp(0.45, 1, ease.inQuad(fall)) * (1 - 0.5 * hush), xsq);

    // ---- No.7 (studio frames, never graded) ----
    const s7 = no7Scale(t);
    const n7 = projectDecal(n7p.x, n7p.z, n7p.h, w);
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = HEX.ink;
    ctx.beginPath();
    ctx.ellipse(n7g.x - 4 * s7, n7g.y, 16 * s7, 5 * s7, 0, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
    // The push-off: a flat stitched ring bursts from his planted boot as the line reaches him.
    const pr = clamp((t - T_PUSH) / 0.3);
    if (t >= T_PUSH && pr < 1) {
      const po = no7At(T_PUSH);
      const pp = projectDecal(po.x, po.z, 0, w);
      stitchRing(ctx, pp.x, pp.y, lerp(6, 46, ease.outCubic(pr)) * Math.max(1, pp.s / 2), 1 - pr, { squash: 0.42, width: 2, phase: -pr * 50 });
    }
    drawNo7At(env, no7Key(t), n7.x, n7.y, s7);

    // ---- the needle: the thread through the eye, the shaft, the eye, the ball ----
    const form = ease.outCubic(clamp(t / T_FORM));
    const axisAng = Math.atan2(F.uy, F.ux);
    const half = F.eyeLen / 2;
    threadThroughEye(ctx, F.ex, F.ey, F.ux, F.uy, half, tt, 0.4 + 0.6 * form);
    // The needle quivers on each tick of the inner clock (canvas) as the pluck warp bends the picture along it.
    let lastTick = -1;
    for (const k of TICKS) if (t >= k) lastTick = k;
    const ts = lastTick >= 0 ? t - lastTick : -1;
    const quiver = ts >= 0 ? 3 * Math.cos(TAU * 9 * ts) * Math.exp(-ts / 0.18) : 0;
    // The shaft leaves the eye's lower tip (from its middle while the almond still lies across the needle, at the cut).
    const tipK = half * 0.85 * form;
    const s0x = F.ex - F.ux * tipK, s0y = F.ey - F.uy * tipK;
    const Wn = lerp(30, 12, form) + 3 * fall;
    needleShaft(ctx, s0x, s0y, F.bx, F.by, Wn, tt, quiver);
    needleHelix(ctx, s0x, s0y, F.bx, F.by, Wn, tt, form);
    // The needle's eye: the Sky Eye's lids squeezed into an upright vesica, swinging into line with the shaft (the
    // almond is symmetric under a half turn, so it swings the short way round).
    let target = axisAng;
    while (target > Math.PI / 2) target -= Math.PI;
    while (target <= -Math.PI / 2) target += Math.PI;
    const rot = lerp(0, target, ease.outBack(clamp(t / T_FORM)));
    const sq = lerp(0.06, 1, form);
    skyEye(ctx, F.ex, F.ey, F.eyeLen / lerp(1, 0.3, sq), 96, -sq, 1, tt, rot);
    ctx.globalCompositeOperation = 'lighter';
    const ga = ((tt * 2.2) % 1) * TAU;
    drawGlow(ctx, glowOf(PAL.pearl), F.ex + Math.cos(rot) * Math.cos(ga) * half, F.ey + Math.sin(rot) * Math.cos(ga) * half, 5, 0.6);
    ctx.globalCompositeOperation = 'source-over';
    // Threads of light torn off the ball's flanks (its wake), a ring of jade where the needle meets it (its collar),
    // spin marks and the ball itself.
    ballWake(ctx, F.bx, F.by, F.R, F.ux, F.uy, tt, 0.4 + 0.6 * form);
    stitchRing(ctx, F.bx, F.by, F.R * 1.12, 0.8, { width: 2, dash: 7, gap: 4, phase: -tt * 140 });
    spinMarks(ctx, F.bx, F.by, F.R * 0.86, tt * 18, { alpha: 0.85, width: 3, len: 0.9, dir: 1 });
    // The ball: 52 -> 72 px, stretched along its fall, jade seams, a white-hot pearl core.
    drawBall(env, spin, Math.round(F.bx), Math.round(F.by), F.br, 2, 0.3, 0.6, 'pearl', { sx: 0.9, sy: 1.12 }, { seamGlow: 0.65 });
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.pearl), F.bx - F.R * 0.3, F.by - F.R * 0.35, F.R * 0.28, 0.55);
    ctx.globalCompositeOperation = 'source-over';
    if (t < 0.5) sparkle(ctx, F.bx - F.R * 0.35, F.by - F.R * 0.4, lerp(14, 4, t / 0.5), 0.9, Math.PI / 4);

    // ---- the altitude readout: the 26 M of the apex counting down beside the ball (the inner clock running out) ----
    const metres = Math.max(1, Math.round(arcAt(ballU7(t)).h / M));
    const ra = clamp((t - 0.12) / 0.08);
    if (ra > 0) {
      const jolt = ts >= 0 && ts < 0.05 ? 1 : 0;
      const rx = Math.round(F.bx + F.R + 20), ry = Math.round(F.by - F.R - 18 - jolt);
      readout(ctx, rx, ry, `${String(metres).padStart(2, '0')} M`, ra * (1 - clamp((t - 1.0) / 0.1)), { leader: [F.bx + F.R * 0.7, F.by - F.R * 0.7] });
    }

    // ---- the hush: focus lines close in on the meeting point as the clock runs out ----
    edgeFocus(ctx, env, lerp(F.bx, X.x, 0.5), lerp(F.by, X.y, 0.5), 0.55 * hush + 0.3 * pulseAt(t, T_PUSH, 0.25));

    // ---- particles: droplets, motes, light-stitches (screen space) ----
    env.parts.draw(ctx, 1);
    // ---- air rushing up past the lens ----
    airRush(ctx, tt, lerp(0.55, 1, fall) * (1 - 0.6 * hush));

    // ---- post ----
    nightGrade(fx, { bloom: 1.1, thresh: 0.64, ca: 0.006 + 0.002 * clamp((t - 0.9) / 0.2) - 0.002 * hush, vignette: 0.6 + 0.15 * hush });
    // The zoom blur centres just under the ball on the needle's aim, so the ball stays sharp while the world streams out.
    const [ru, rv] = cam.toUV(lerp(F.bx, X.x, 0.3), lerp(F.by, X.y, 0.3));
    fx.radial = lerp(0.06, 0.11, ease.inQuad(fall)) - 0.04 * hush;
    fx.radialX = ru;
    fx.radialY = rv;
    if (t < 0.12) {
      const [hu, hv] = cam.toUV(F.bx, F.by);
      whip(fx, 0.1 * (1 - ease.outQuad(t / 0.12)), 0, 1, { x: hu * VW, y: hv * VH, r: 0.08 });
    }
    if (ts >= 0) {
      const mid: [number, number] = [lerp(s0x, F.bx, 0.5), lerp(s0y, F.by, 0.5)];
      setPluck(fx, null, [[s0x, s0y], mid, [F.bx, F.by]], { amp: 0.006, tSince: ts, n: 1, hz: 9, decay: 0.25, w: 0.04, glow: 0.15 });
    }
    assertMeridianFx(fx);
  },
};
