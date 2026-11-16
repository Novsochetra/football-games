// MERIDIAN THREAD v2 · shot 5 · "Apex" (1.4 s, seed 415, global 7.5-8.9). SPEC.md shot 5: the breath at the exact
// middle of the film. Height you can feel: we hang beside a 60 px ball, 26 m up, and look down past it at the whole box
// laid out like a map, the world frozen, the number climbing.
//
// View: DownPitchView through the shared pitch-only tilt (58 deg down, f 300, eye h 380), looking east. The eye sits
// 3.6-6.4 m to the near side of the brief's (z 312 -> 340 instead of 276) so the Meridian, which rises at the lens from
// No.10 behind us, leans in from the bottom-left instead of standing as a column over the line of four (the brief's
// own numbers put the stroke on top of the Tower and D3): the stroke, the ball and the readout hold the left of the
// frame, the box, the goal, the keeper, the X and the defenders lie below to the right. The ball is locked on screen by
// a lens shift (cx / principal point), so the eye's slow truck to the near side is bullet time: the frozen world slides
// under the ball with real parallax (the ball at 14 m, the turf at 34 m, frozen droplets in between, out-of-focus
// droplets right at the lens sliding fastest), and the goal emerges from behind the ball.
//
//   0.00-0.12  THE MINT CLEAR (F4 held: fx.fullFrame, no new event): shot 4's mint whiteout tears open from the ball's
//              core: a mint field with a hole r 0 -> 700 (outCubic), a jade band and a 6 px jade rim on an ink line
//              with a pearl running stitch round it; bloom eases in so the field reads mint, never white; one soft post
//              shock rings out of the ball into the frozen world.
//   0.12-1.22  THE HANG (rate 0.06): the 60 px ball (r15 at an integer 2x, crisp; 15 -> 17 with the push) with lit jade
//              seams turns at a crawl, a lantern whose emerald light spills over the stand and the box; the Meridian (an
//              ink-backed jade brush stroke, perspective-wide toward the lens, bristles, stars, cross-stitches, ticks, a
//              comet head round the ball) hums in a standing wave, plucked on each tick of his inner clock (shader pluck
//              warp N 3, 6 Hz + the canvas stroke) while a stitched ring leaves the ball on each tick; its aurora hem
//              hangs down from it toward the turf (projected rays, folds drifting at 0.2x); jade droplets flicked off it
//              and pearl motes shed by the ball hang frozen in the air. Below, in Night Ink 0.90 with a soft partial
//              restore of the ball's light pool: the line of four (D1, the Tower 1.3x crouched in his jump load with the
//              ball caught jade in his eyes, D3, D4) craning up, faces lit from above, short ink shadows thrown away from
//              the ball's ground point; No.7 frozen mid-stride on the near side (studio Run, boxed, never graded); the
//              keeper a step off his line looking up; the far stand and its upper tier filling the top of the frame,
//              crowd camera flashes blooming one at a time in extreme slow motion.
//   0.16-0.34  the plumb line drops: one pearl thread unspools from the ball down to the cross-stitch X (the plan:
//              the ball hangs over its destination); the X lands with a stitched ring on the turf and pulses
//              20 -> 28 px.
//   0.30-0.80  the readout: 26 M ticks up from 00 beside the ball (pearl 16 px in a jade bracket, a leader line to
//              the apex tick on the ball's shoulder).
//   1.22-1.40  TIME STIRS (rate 0.3): heads twitch one by one, No.7 takes a stride, the Tower sinks lower into his
//              load (a ring of ink dust at his boots, his jade eyes brightening), the ball's glint slides down to stare
//              at the line; the camera pushes in (f 318 -> 330, inQuad) and leans down at the ball; the ball's light,
//              the hum and a zoom blur on the ball swell; the hard cut lands on the swell (no flash).
//
// Camera roll 0 (shakeRoll 0.015), no dolly zoom (f moves alone; the eye's truck only slides the world), no pull-out.
// FlashBudget: nothing new (fx.fullFrame held 0.00-0.12 continues F4; no flash, no impact). Deterministic: init()
// resets the spin and rebuilds the motes from env.rng; motes and spin advance in update() on the warped dt; render()
// is a pure function of t and that state (twinkles are sines of t). Never the banned word: loft, pass, arc, line.

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { BallSpin } from '../../engine/pixel';
import { TAU, clamp, ease, lerp } from '../../engine/math';
import { drawGlow, glowOf } from '../../engine/particles';
import { sparkle, type TrailPt } from '../../art/fx';
import { P, POSES, RIVAL_KIT, RIVAL_KIT_C, RIVAL_KIT_D, KEEPER_KIT, joints, type Kit, type Pose } from '../../art/puppet';
import { drawDownPitch, projectDecal, type DownPitchView, type Projected } from '../../art/stadium';
import { drawNo7Boxed, no7, type No7Key } from '../../art/no7';
import { drawBall, holdTrauma, keys, pushShock, type PuppetSil } from '../kit';
import {
  HEX, LAYOUT, PAL, PUPPETS, RATE, SHOTS, TOWER_BULK, arcAt, assertMeridianFx, ballU, crossStitch, meridianStroke, nightGrade,
  nightInk, readout, resetSpin, setPluck, stitchRing, threadLine, warmMeridian,
} from './common';

const META = SHOTS[4];
const DUR = META.dur;

// ---------------------------------------------------------------- beats (shot-local s, the runner's unwarped clock)

/** The mint clear (shot 4's whiteout torn open from the ball's core). */
const T_CLEAR = 0.12;
/** The hang (rate 0.06) starts here and the camera starts its drift. */
const T_HANG = 0.12;
/** The plumb line unspools from the ball to the X. */
const T_DROP0 = 0.16;
const T_DROP1 = 0.34;
/** The readout 00 -> 26 M. */
const T_READ0 = 0.3;
const T_READ1 = 0.8;
/** His inner clock: each tick plucks the humming stroke. */
const TICKS = [0.3, 0.66, 1.02];
/** Time stirs (rate 0.06 -> 0.3), the push and the swell. */
const T_STIR = 1.22;

// ---------------------------------------------------------------- the view (DownPitchView, pitch-only tilt)

const TILT = 1.012;
/** Where the ball hangs on screen at the start of the hang and at the stir (the lens shift holds it there). */
const BALL_A: [number, number] = [308, 150];
const BALL_B: [number, number] = [302, 146];
/** The eye's truck to the near side over the hang (field z): the world slides under the ball. */
const EYE_Z0 = 312;
const EYE_Z1 = 340;

/** 0 -> 1 over the hang (inOutSine): the drift. */
const driftK = (t: number) => keys([[T_HANG, 0], [T_STIR, 1, 'inOutSine']], t);
/** 0 -> 1 over the stir (inQuad): the push into the cut. */
const stirK = (t: number) => keys([[T_STIR, 0], [DUR, 1, 'inQuad']], t);
const focal = (t: number) => keys([[T_HANG, 300], [T_STIR, 318, 'inOutSine'], [DUR, 330, 'inQuad']], t);

function view(t: number): DownPitchView {
  const d = driftK(t), s = stirK(t);
  const v: DownPitchView = { x: 990, z: lerp(EYE_Z0, EYE_Z1, d), h: 380 - 6 * s, tilt: TILT, f: focal(t), horizon: 180, cx: 320 };
  const a = arcAt(ballU(5, t));
  const b = projectDecal(a.x, a.z, a.h, v);
  const tx = lerp(BALL_A[0], BALL_B[0], d), ty = lerp(BALL_A[1], BALL_B[1], d) + 4 * s;
  v.cx += tx - b.x;
  v.horizon += ty - b.y;
  return v;
}
/** Project a field point; also returns the un-clamped view depth (to clip points behind the lens). */
function proj(v: DownPitchView, x: number, z: number, h: number): Projected & { zr: number } {
  const q = projectDecal(x, z, h, v);
  const t = v.tilt ?? 0;
  const zr = (x - v.x) * Math.cos(t) - (h - v.h) * Math.sin(t);
  return { ...q, zr };
}

// ---------------------------------------------------------------- the frozen air (motes in field space)

interface Mote {
  x: number;
  z: number;
  h: number;
  vx: number;
  vz: number;
  vh: number;
  /** Radius (field px). */
  r: number;
  /** 0 = a jade droplet flicked off the stroke, 1 = a pearl mote shed by the ball. */
  kind: 0 | 1;
  ph: number;
}
let motes: Mote[] = [];
let bokeh: { x: number; z: number; h: number; r: number; ph: number }[] = [];
let spin = new BallSpin();

function buildMotes(env: Env) {
  const rng = env.rng;
  motes = [];
  // Jade droplets flicked off the stroke behind the ball, some already falling toward the turf.
  for (let i = 0; i < 34; i++) {
    const u = rng.range(0.56, 0.712);
    const a = arcAt(u);
    const fall = rng.next() < 0.35 ? rng.range(20, 90) : rng.range(0, 14);
    motes.push({
      x: a.x + rng.range(-6, 6), z: a.z + rng.range(-16, 16), h: a.h - fall,
      vx: rng.range(-20, 30), vz: rng.range(-30, 30), vh: -rng.range(30, 110),
      r: rng.range(0.9, 1.8), kind: 0, ph: rng.range(0, TAU),
    });
  }
  // Droplets frozen right at the lens (out of focus): placed in camera space on the hang's first view, converted to field
  // space, so the eye's drift slides them fast across the frame (the nearest things move most).
  bokeh = [];
  const v0 = view(T_HANG);
  const tl = v0.tilt ?? 0, c = Math.cos(tl), sn = Math.sin(tl);
  const spots: [number, number, number, number][] = [
    // screen x, screen y, depth, radius (field px)
    [70, 300, 46, 4.2], [585, 70, 58, 3.4], [118, 92, 70, 2.6], [560, 318, 52, 3.8], [228, 336, 80, 2.2], [452, 40, 88, 2.0],
  ];
  for (const [sx, sy, zr, r] of spots) {
    const X = ((sx - v0.cx) * zr) / v0.f, Yc = (-(sy - v0.horizon) * zr) / v0.f;
    const Z = zr * c + Yc * sn, Y = -zr * sn + Yc * c;
    bokeh.push({ x: v0.x + Z, z: v0.z + X, h: v0.h + Y, r, ph: rng.range(0, TAU) });
  }
  // Pearl motes shed by the ball, hanging in its wake (the ride shed 40 / s).
  for (let i = 0; i < 26; i++) {
    const u = rng.range(0.675, 0.719);
    const a = arcAt(u);
    motes.push({
      x: a.x + rng.range(-3, 3), z: a.z + rng.range(-5, 5), h: a.h + rng.range(-5, 5),
      vx: rng.range(-15, 15), vz: rng.range(-15, 15), vh: rng.range(-20, 10),
      r: rng.range(0.5, 1.1), kind: 1, ph: rng.range(0, TAU),
    });
  }
}

// ---------------------------------------------------------------- the figures far below (puppets, ~18 px)

const DEG = Math.PI / 180;
/** The fear pose with a twitch variant (head further back, arms drifting). */
const CRANE_A = POSES.craneUp;
const CRANE_B = P({ ...POSES.craneUp, head: -66 * DEG, armN: -16 * DEG, elbowN: 14 * DEG, armF: 16 * DEG, elbowF: 18 * DEG });
/** The Tower's jump load (crouched, arms back, eyes locked up on the ball) and the deeper load he sinks into. */
const LOAD_A = P({ torso: 26 * DEG, head: -44 * DEG, thighN: 62 * DEG, kneeN: 104 * DEG, footN: -14 * DEG, thighF: 46 * DEG, kneeF: 96 * DEG, footF: -14 * DEG, armN: -58 * DEG, elbowN: 24 * DEG, armF: -66 * DEG, elbowF: 22 * DEG });
const LOAD_B = P({ torso: 34 * DEG, head: -52 * DEG, thighN: 80 * DEG, kneeN: 132 * DEG, footN: -22 * DEG, thighF: 64 * DEG, kneeF: 124 * DEG, footF: -22 * DEG, armN: -84 * DEG, elbowN: 18 * DEG, armF: -92 * DEG, elbowF: 16 * DEG });
const LOAD_M = P(Object.fromEntries(Object.keys(LOAD_A).map((k) => [k, lerp((LOAD_A as never)[k], (LOAD_B as never)[k], 0.5)])) as Partial<Pose>);
/** The keeper a step off his line, crouched, looking up. */
const KEEP_A = P({ ...POSES.gkReady, head: -46 * DEG, torso: 12 * DEG });
const KEEP_B = P({ ...POSES.gkReady, head: -54 * DEG, torso: 16 * DEG, armN: 70 * DEG, armF: 62 * DEG });

/** Puppet px per unit (about 18 px standing at the shot's start). */
const PK_K = 0.26;
/** The look-down squash (feet anchored): figures seen from high above read shorter. */
const SQ = 0.82;
/** Ink silhouette with a jade rim lit from the ball above (the colour returns inside the restored pool). */
// The ball hangs above and to the upper left of the line in every frame of the hang, so one constant light direction
// serves them all (a constant key, so the PuppetCache renders each pose once, in prepare(), never per frame).
const SIL: PuppetSil = { fill: [8, 22, 17], rim: PAL.jade, rim2: PAL.emerald, lx: -0.42, ly: -0.91 };

interface Fig {
  name: string;
  kit: Kit;
  x: number;
  z: number;
  /** Pose by time (twitches at the stir). */
  pose: (t: number) => [string, Pose];
  tower?: boolean;
}
const FIGS: Fig[] = [
  { name: 'gk', kit: KEEPER_KIT, x: 1160, z: 266, pose: (t) => (t >= 1.27 ? ['keepB', KEEP_B] : ['keepA', KEEP_A]) },
  { name: 'd1', kit: RIVAL_KIT, x: LAYOUT.d1.x, z: LAYOUT.d1.z, pose: (t) => (t >= 1.29 ? ['craneB', CRANE_B] : ['craneA', CRANE_A]) },
  {
    name: 'tower', kit: RIVAL_KIT, x: LAYOUT.tower.x, z: LAYOUT.tower.z, tower: true,
    pose: (t) => (t >= 1.33 ? ['loadB', LOAD_B] : t >= 1.25 ? ['loadM', LOAD_M] : ['loadA', LOAD_A]),
  },
  { name: 'd3', kit: RIVAL_KIT_C, x: LAYOUT.d3.x, z: LAYOUT.d3.z, pose: (t) => (t >= 1.24 ? ['craneB', CRANE_B] : ['craneA', CRANE_A]) },
  { name: 'd4', kit: RIVAL_KIT_D, x: LAYOUT.d4.x, z: LAYOUT.d4.z, pose: (t) => (t >= 1.31 ? ['craneB', CRANE_B] : ['craneA', CRANE_A]) },
];
/** No.7 frozen mid-stride on the near side (he takes one stride as time stirs). */
const NO7_AT = { x: 1062, z: 342 };
const no7Key = (t: number): No7Key => (t >= 1.3 ? 'Run.R4' : 'Run.R3');
const NO7_SCALE = 0.2;

/** Feet depth below the hip (units) for a pose. */
function footDepth(p: Pose) {
  const j = joints(p);
  return Math.max(j.toeN[1], j.toeF[1], j.ankleN[1]) + 2;
}

function drawFigure(ctx: CanvasRenderingContext2D, f: Fig, t: number, q: Projected, D: number, g: { x: number; y: number }) {
  const [pname, pose] = f.pose(t);
  const facing: 1 | -1 = q.x < g.x - 4 ? 1 : -1;
  const foot = footDepth(pose) * PK_K * D;
  ctx.save();
  ctx.translate(Math.round(q.x), Math.round(q.y));
  ctx.scale(f.tower ? TOWER_BULK : 1, SQ * (f.tower ? 1.06 : 1));
  PUPPETS.draw(ctx, `m5-${f.name}-${pname}`, f.kit, pose, PK_K, facing, 0, -foot, D, 0.8, SIL);
  if (f.tower) {
    // The captain's armband (ink-teal) on the far upper arm, and the jade of the ball caught in his eyes.
    const j = joints(pose);
    const kd = PK_K * D;
    const bx = (j.neck[0] + (j.handF[0] - j.neck[0]) * 0.35) * facing * kd, byy = (j.neck[1] + (j.handF[1] - j.neck[1]) * 0.35) * kd - foot;
    ctx.fillStyle = '#146e6e';
    ctx.fillRect(Math.round(bx - 1), Math.round(byy), 2, 1);
  }
  ctx.restore();
}

/** Short ink shadow thrown away from the ball's ground point g. */
function inkShadow(ctx: CanvasRenderingContext2D, x: number, y: number, g: { x: number; y: number }, len: number, a: number) {
  let dx = x - g.x, dy = y - g.y;
  const l = Math.hypot(dx, dy);
  if (l < 1) {
    dx = 0;
    dy = 1;
  } else {
    dx /= l;
    dy /= l;
  }
  ctx.save();
  ctx.translate(x + dx * len * 0.55, y + dy * len * 0.4);
  ctx.rotate(Math.atan2(dy * 0.7, dx));
  ctx.globalAlpha = a;
  ctx.fillStyle = HEX.ink;
  ctx.beginPath();
  ctx.ellipse(0, 0, len * 0.6, len * 0.24, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------- the stadium above the frame: the far stand's upper tier

function upperTier(ctx: CanvasRenderingContext2D, crowd: HTMLCanvasElement, v: DownPitchView) {
  const gz = 257;
  const lo = projectDecal(1272, gz, 150, v), hi = projectDecal(1350, gz, 290, v);
  const L = projectDecal(1272, gz - 900, 150, v), R = projectDecal(1272, gz + 900, 150, v);
  if (hi.y > lo.y) return;
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  // Two copies of the crowd strip, the upper one flipped, so the rows read as a raked tier rising to the frame top.
  const mid = lerp(lo.y, hi.y, 0.5);
  ctx.globalAlpha = 0.9;
  ctx.drawImage(crowd, 0, 0, crowd.width, crowd.height, L.x - 40, mid, R.x - L.x + 80, lo.y - mid);
  ctx.translate(0, mid);
  ctx.scale(-1, 1);
  ctx.drawImage(crowd, 0, 0, crowd.width, crowd.height, -(R.x + 80), hi.y - mid, R.x - L.x + 160, mid - hi.y);
  ctx.restore();
  // Aisles and tier lips: dark bands across the rake.
  ctx.fillStyle = 'rgba(5,9,8,0.75)';
  for (const k of [0.18, 0.47, 0.74]) ctx.fillRect(-20, Math.round(lerp(lo.y, hi.y, k)), VW + 40, 2);
  for (let i = -6; i <= 6; i++) {
    const a = projectDecal(1272, gz + i * 150, 150, v), b = projectDecal(1350, gz + i * 150, 290, v);
    ctx.strokeStyle = 'rgba(5,9,8,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}

/** Crowd camera flashes in extreme slow motion: one at a time, each blooming and fading over 1.2 s (points <= 6 px). */
const FLASHES: [number, number, number][] = [
  // [start t, field z, height (field px)]
  [0.04, 120, 120], [0.32, 470, 196], [0.6, 300, 60], [0.88, 40, 214], [1.16, 380, 150],
];
function flashPos(v: DownPitchView, z: number, h: number) {
  const x = h <= 150 ? 1270 : lerp(1272, 1350, (h - 150) / 140);
  return projectDecal(x, z, h, v);
}

// ---------------------------------------------------------------- the hem seen from above

let hemRayCv: HTMLCanvasElement | null = null;
function hemRay(): HTMLCanvasElement {
  if (hemRayCv) return hemRayCv;
  const c = document.createElement('canvas');
  c.width = 1;
  c.height = 64;
  const g = c.getContext('2d')!;
  const gr = g.createLinearGradient(0, 0, 0, 64);
  gr.addColorStop(0, 'rgb(251,246,234)');
  gr.addColorStop(0.18, 'rgb(47,224,138)');
  gr.addColorStop(0.6, 'rgb(11,143,88)');
  gr.addColorStop(1, 'rgba(11,143,88,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 1, 64);
  return (hemRayCv = c);
}
/**
 * The aurora hem hanging from the stroke, seen from above: up to 72 rays dropped straight down (field h) from stroke
 * points, projected, so they fan toward the nadir below the frame; two slow sine folds (phase drifting at 0.2x), alpha
 * capped at 0.35, additive over a faint ink under-layer.
 */
function hangingHem(ctx: CanvasRenderingContext2D, v: DownPitchView, u0: number, u1: number, phase: number, a: number) {
  if (a <= 0) return;
  const n = 72, ray = hemRay();
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  for (const pass of [0, 1]) {
    ctx.globalCompositeOperation = pass ? 'lighter' : 'source-over';
    for (let i = 0; i < n; i++) {
      const u = lerp(u0, u1, (i + 0.5) / n);
      const p = arcAt(u);
      const f = 0.5 + 0.5 * Math.sin(i * 0.31 + phase) * Math.sin(i * 0.083 - phase * 0.7);
      const len = lerp(36, 120, f);
      const top = proj(v, p.x, p.z, p.h - 4), bot = proj(v, p.x, p.z, p.h - len);
      if (top.zr < 20) continue;
      const dx = bot.x - top.x, dy = bot.y - top.y, L = Math.hypot(dx, dy);
      if (L < 2) continue;
      ctx.save();
      ctx.translate(top.x, top.y);
      ctx.rotate(Math.atan2(dy, dx) - Math.PI / 2);
      const w = Math.max(1.5, 1.6 * top.s);
      if (pass === 0) {
        ctx.globalAlpha = 0.12 * a;
        ctx.fillStyle = HEX.ink;
        ctx.fillRect(-w, 0, w * 2, L * 0.8);
      } else {
        ctx.globalAlpha = Math.min(0.35, 0.3 * a * (0.55 + 0.45 * f));
        ctx.drawImage(ray, -w / 2, 0, w, L);
      }
      ctx.restore();
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the mint clear

function mintClear(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  const u = ease.outCubic(clamp(t / T_CLEAR));
  const r = Math.max(0.1, lerp(0, 700, u));
  ctx.save();
  ctx.fillStyle = HEX.mint;
  ctx.beginPath();
  ctx.rect(-20, -20, VW + 40, VH + 40);
  ctx.arc(x, y, r, 0, TAU, true);
  ctx.fill('evenodd');
  // The first frame is still pure mint (shot 4's whiteout): the rim only draws once the hole has torn open.
  if (r < 12) {
    ctx.restore();
    return;
  }
  // The rim: a soft jade band just outside the hole on the mint, an ink line, a 6 px jade rim, a pearl running stitch.
  const g = ctx.createRadialGradient(x, y, r, x, y, r + 40);
  g.addColorStop(0, 'rgba(47,224,138,0.9)');
  g.addColorStop(1, 'rgba(191,255,224,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r + 40, 0, TAU);
  ctx.arc(x, y, r, 0, TAU, true);
  ctx.fill('evenodd');
  ctx.lineWidth = 10;
  ctx.strokeStyle = HEX.ink;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.stroke();
  ctx.lineWidth = 6;
  ctx.strokeStyle = HEX.jade;
  ctx.stroke();
  ctx.setLineDash([10, 7]);
  ctx.lineDashOffset = -t * 900;
  ctx.lineWidth = 2;
  ctx.strokeStyle = HEX.pearl;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

// ---------------------------------------------------------------- the shot

/** Seconds since the last pluck of the humming stroke (the hang's start, each tick, the stir), and its strength. */
function lastPluck(t: number): [number, number] {
  const marks: [number, number][] = [[T_HANG, 0.8], ...TICKS.map((k) => [k, 1] as [number, number]), [T_STIR, 1.6]];
  let at = -1, k = 0;
  for (const [m, s] of marks) if (t >= m) [at, k] = [m, s];
  return at < 0 ? [-1, 0] : [t - at, k];
}

export const shotApex: Shot = {
  name: META.name,
  dur: META.dur,
  seed: META.seed,
  rate: RATE[5],
  cues: [
    { at: 0, fn: (e) => e.sfx.duck(0.15, 1.3) },
    { at: 0.12, fn: (e) => e.sfx.bow(1174.66, 1.3, 0.16, undefined, 6) },
    { at: T_DROP0, fn: (e) => e.sfx.zip(0.16, 2400, 700, 0.12) },
    { at: 0.3, fn: (e) => e.sfx.tick(0.5) },
    { at: 0.45, fn: (e) => e.sfx.blip(1318.5) },
    { at: 0.66, fn: (e) => e.sfx.tick(0.5) },
    { at: 0.7, fn: (e) => e.sfx.blip(1318.5) },
    { at: 1.02, fn: (e) => e.sfx.tick(0.5) },
    { at: 1.2, fn: (e) => e.sfx.whoosh(0.2, 200, 1200, 0.3) },
  ],
  prepare(env) {
    warmMeridian(env);
    // Warm the puppet caches (every pose, both facings) and No.7's boxed frames, so the cut has no hitch.
    const ctx = env.ctx;
    ctx.save();
    ctx.globalAlpha = 0;
    const g = { x: 0, y: 0 };
    for (const f of FIGS)
      for (const t of [0, 1.25, 1.3, 1.35])
        for (const x of [-20, 20]) drawFigure(ctx, f, t, { x, y: 0, s: 1, k: 1, d: 1 }, 1, g);
    ctx.restore();
    for (const k of ['Run.R3', 'Run.R4'] as No7Key[]) {
      const f = no7(k);
      if (f) f.a.boxed(f.i, NO7_SCALE);
    }
    hemRay();
  },
  init(env) {
    env.sfx.clearBus();
    env.cam.set(VW / 2, VH / 2, 1, 0);
    env.cam.shakeRoll = 0.015;
    env.cam.shakeAmp = 4;
    spin = new BallSpin();
    resetSpin(spin);
    // The ball arrives turning: start it a little way round so the first frame shows a seam, not a pole.
    spin.rotate(1, 0.3, 0.1, 0.9);
    buildMotes(env);
    PUPPETS.frame();
  },
  update(env, t, dt) {
    // Backspin plus a little sidespin, slowed to a crawl by the rate (6 rev/s x 0.06).
    spin.rotate(1, 0.22, 0.12, -dt * 6 * TAU);
    for (const m of motes) {
      m.x += m.vx * dt;
      m.z += m.vz * dt;
      m.h += m.vh * dt;
      if (m.kind === 0) m.vh -= 98 * dt;
    }
    if (t >= T_HANG) holdTrauma(env.cam, 0.1);
  },
  render(env, t) {
    const { ctx, fx } = env;
    const st = env.art.stadium;
    PUPPETS.frame();
    env.world();
    ctx.fillStyle = HEX.night;
    ctx.fillRect(-40, -40, VW + 80, VH + 80);
    const v = view(t);
    const fk = v.f / 300;
    // ---- the world far below (graded) ----
    upperTier(ctx, st.crowd, v);
    drawDownPitch(ctx, st, v, 50, { ambientFlashes: false });
    const u = ballU(5, t);
    const A = arcAt(u);
    const ball = proj(v, A.x, A.z, A.h);
    const G = projectDecal(A.x, A.z, 0, v);
    const X = projectDecal(LAYOUT.target.x, LAYOUT.target.z, 0, v);
    // Figures: shadows first, then the puppets (back to front by depth).
    const figs = FIGS.map((f) => ({ f, q: projectDecal(f.x, f.z, 0, v) })).sort((a, b) => a.q.y - b.q.y);
    const n7 = projectDecal(NO7_AT.x, NO7_AT.z, 0, v);
    for (const { q } of figs) inkShadow(ctx, q.x, q.y, G, 10 * fk, 0.35);
    inkShadow(ctx, n7.x, n7.y, G, 10 * fk, 0.35);
    for (const { f, q } of figs) drawFigure(ctx, f, t, q, fk * (q.s / 0.86), G);
    // A ring of ink dust at the Tower's boots as he sinks into his load.
    const tw = figs.find((o) => o.f.tower)!.q;
    if (t >= 1.25) stitchRing(ctx, tw.x, tw.y, lerp(6, 22, ease.outCubic(clamp((t - 1.25) / 0.15))), 0.7 * (1 - clamp((t - 1.3) / 0.1)), { squash: 0.4, color: '#3a4a44', width: 1, dash: 3, gap: 3 });
    // ---- Night Ink 0.90; the ball's light pool partly restored round its ground point (a soft 260 x 112 ellipse) ----
    nightInk(ctx, 0.9, (m) => {
      // A soft partial restore (at most 65 %): the ball's light, not a spot.
      m.save();
      m.translate(G.x, G.y - 6);
      m.scale(130 * fk, 56 * fk);
      const g = m.createRadialGradient(0, 0, 0, 0, 0, 1);
      g.addColorStop(0, 'rgba(0,0,0,0.65)');
      g.addColorStop(0.45, 'rgba(0,0,0,0.45)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      m.fillStyle = g;
      m.beginPath();
      m.arc(0, 0, 1, 0, TAU);
      m.fill();
      m.restore();
    });
    // The light that falls: a soft jade pool on the turf under the ball, and a glow round the X.
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.emerald), G.x, G.y - 6, 150 * fk, 0.15, 1, 0.45);
    drawGlow(ctx, glowOf(PAL.jade), G.x, G.y - 6, 70 * fk, 0.08, 1, 0.45);
    // The ball is a lantern hung in the night: its emerald light spills over the stand and the box round it.
    drawGlow(ctx, glowOf(PAL.emerald), ball.x, ball.y, 190 * fk, 0.1 + 0.08 * stirK(t));
    ctx.globalCompositeOperation = 'source-over';
    // Faces turned up into the ball's light (the fear); the Tower's eyes catch it jade.
    for (const { f, q } of figs) {
      if (f.name === 'gk') continue;
      const [, pose] = f.pose(t);
      const j = joints(pose);
      const D = fk * (q.s / 0.86);
      const facing = q.x < G.x - 4 ? 1 : -1;
      const hx = q.x + j.head[0] * PK_K * D * facing * (f.tower ? TOWER_BULK : 1);
      const hy = q.y + (j.head[1] - footDepth(pose)) * PK_K * D * SQ * (f.tower ? 1.06 : 1);
      // The face turned up into the ball's light: a 2 x 2 lit patch (under-lit jade from above), the open mouth an ink
      // pixel; the Tower's two eyes catch the ball as jade points (he alone is not afraid).
      const fxp = Math.round(hx + facing * 2), fyp = Math.round(hy - 2);
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = f.tower ? '#1c3a30' : '#bfe8d0';
      ctx.fillRect(fxp - 1, fyp - 1, 2, 2);
      ctx.globalAlpha = 1;
      if (f.tower) {
        ctx.fillStyle = HEX.jade;
        ctx.fillRect(fxp - 1, fyp - 1, 1, 1);
        ctx.fillRect(fxp + 1, fyp - 1, 1, 1);
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, glowOf(PAL.jade), fxp, fyp - 1, 4, 0.5 + 0.4 * clamp((t - 1.22) / 0.15));
        ctx.globalCompositeOperation = 'source-over';
      } else {
        ctx.fillStyle = HEX.ink;
        ctx.fillRect(fxp, fyp, 1, 1);
      }
    }
    // ---- the X (the plan) and the plumb line ----
    const dropK = ease.outCubic(clamp((t - T_DROP0) / (T_DROP1 - T_DROP0)));
    const landed = t >= T_DROP1;
    const pulse = landed ? 0.5 + 0.5 * Math.sin((t - T_DROP1) * 7.5 - Math.PI / 2) : 0;
    const xSize = landed ? lerp(10, 14, pulse) : 10;
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.jade), X.x, X.y, (26 + 10 * pulse) * fk, landed ? 0.35 + 0.2 * pulse : 0.18, 1, X.k);
    ctx.globalCompositeOperation = 'source-over';
    crossStitch(ctx, X.x, X.y, xSize * fk, 1, X.k);
    if (landed) {
      const lu = clamp((t - T_DROP1) / 0.45);
      if (lu < 1) stitchRing(ctx, X.x, X.y, lerp(8, 46, ease.outCubic(lu)) * fk, 1 - lu, { squash: X.k * 0.9, width: 2 });
    }
    // ---- crowd camera flashes, one at a time ----
    ctx.globalCompositeOperation = 'lighter';
    for (const [t0, z, h] of FLASHES) {
      const a = t - t0;
      if (a < 0 || a > 1.2) continue;
      const e = a < 0.12 ? a / 0.12 : Math.pow(1 - (a - 0.12) / 1.08, 2);
      const p = flashPos(v, z, h);
      drawGlow(ctx, glowOf([255, 252, 240]), p.x, p.y, 6, 0.9 * e);
      drawGlow(ctx, glowOf([255, 255, 255]), p.x, p.y, 2, e);
    }
    ctx.globalCompositeOperation = 'source-over';
    // ---- No.7 frozen mid-stride (studio Run, boxed; never graded) ----
    drawNo7Boxed(env, no7Key(t), Math.round(n7.x), Math.round(n7.y), NO7_SCALE);
    // ---- the Meridian: the hem, the stroke rising at the lens from the bottom-left to the ball ----
    const [ts, pk] = lastPluck(t);
    const hum = ts >= 0 ? Math.exp(-ts / 0.5) * pk : 0;
    // The ball: r15 at an integer 2x (60 px, crisp pixels), its pixel radius growing with the push (15 -> 17).
    const br = Math.round(15 * fk);
    const R = br * 2; // the ball's radius on screen
    hangingHem(ctx, v, 0.5, u - 0.006, 0.6 + t * 0.6 * 0.2 * 5, 0.7);
    const raw: (TrailPt & { s: number })[] = [];
    for (let i = 0; i <= 44; i++) {
      const uu = lerp(0.42, u, i / 44);
      const p = arcAt(uu);
      const q = proj(v, p.x, p.z, p.h);
      if (q.zr < 20) continue;
      raw.push({ x: q.x, y: q.y, s: q.s });
    }
    let first = 0;
    while (first < raw.length - 2 && raw[first + 1].y > VH + 50) first++;
    const pts = raw.slice(first);
    const W = 28 * fk;
    const tail = W * (pts[0].s / ball.s);
    const stroke = meridianStroke(ctx, pts, W, {
      head: R * 1.05, tail, t, alpha: 0.9, stars: { spacing: 30 }, ticks: { every: 24 }, cross: { every: 64 },
      pluck: { amp: 3.2 * hum, phase: TAU * 6 * Math.max(0, ts), nodes: 2 },
    });
    // The plumb line: one pearl thread unspooling from the ball to the X, swaying 1 px with the hum.
    if (dropK > 0) {
      const bx = ball.x, by = ball.y + R * 0.9;
      const ex = lerp(bx, X.x, dropK), ey = lerp(by, X.y, dropK);
      const sway = Math.sin(t * TAU * 6) * (0.6 + hum);
      const mid = { x: lerp(bx, ex, 0.5) + sway, y: lerp(by, ey, 0.5) };
      threadLine(ctx, [{ x: bx, y: by }, mid, { x: ex, y: ey }], 2, 1, { halo: 1.6 });
      if (dropK < 1) {
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, glowOf(PAL.pearl), ex, ey, 7, 0.9);
        ctx.globalCompositeOperation = 'source-over';
      }
    }
    // ---- the frozen air: motes behind the ball, the ball, motes in front ----
    const moteP = motes.map((m) => ({ m, q: proj(v, m.x, m.z, m.h), q2: proj(v, m.x - m.vx * 0.02, m.z - m.vz * 0.02, m.h - m.vh * 0.02) }));
    const drawMotes = (front: boolean) => {
      for (const { m, q, q2 } of moteP) {
        if (q.zr < 20 || (q.zr < ball.zr - 4) !== front) continue;
        if (q.x < -20 || q.x > VW + 20 || q.y < -20 || q.y > VH + 20) continue;
        const tw = 0.75 + 0.25 * Math.sin(t * 7 + m.ph);
        const rr = Math.max(1, m.r * q.s);
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, glowOf(m.kind ? PAL.pearl : PAL.jade), q.x, q.y, rr * 3.2, 0.42 * tw);
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = m.kind ? HEX.pearl : HEX.mint;
        ctx.globalAlpha = tw;
        ctx.lineWidth = Math.max(1, rr * 0.8);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(q.x, q.y);
        ctx.lineTo(q2.x, q2.y);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    };
    drawMotes(false);
    // His inner clock: each tick sends one stitched ring out of the ball (a watch tick made visible, never a flash).
    for (const k of TICKS) {
      const a = (t - k) / 0.4;
      if (a < 0 || a >= 1) continue;
      stitchRing(ctx, ball.x, ball.y, R + 4 + 46 * ease.outCubic(a), 0.75 * (1 - a), { width: 2, phase: -a * 30 });
    }
    // The ball: 60 px (r15 at 2x, growing with the push), seams lit jade, its glint sliding down to stare at the line.
    drawBall(env, spin, Math.round(ball.x), Math.round(ball.y), br, 2, 0, 1.25 + 0.6 * stirK(t), 'pearl', undefined, { seamGlow: 1 });
    const look = clamp((t - 1.24) / 0.12);
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.pearl), ball.x - R * 0.32 + look * R * 0.3, ball.y - R * 0.38 + look * R * 0.62, R * 0.28, 0.75);
    ctx.globalCompositeOperation = 'source-over';
    if (look > 0) sparkle(ctx, ball.x - R * 0.02, ball.y + R * 0.24, 4 + 6 * look, 0.9 * look, Math.PI / 4);
    drawMotes(true);
    // Droplets frozen right at the lens: soft out-of-focus jade discs that slide fast as the eye drifts (bullet time).
    ctx.globalCompositeOperation = 'lighter';
    for (const b of bokeh) {
      const q = proj(v, b.x, b.z, b.h);
      if (q.zr < 12) continue;
      const rr = Math.min(34, b.r * q.s);
      if (q.x < -rr || q.x > VW + rr || q.y < -rr || q.y > VH + rr) continue;
      const tw = 0.85 + 0.15 * Math.sin(t * 3 + b.ph);
      drawGlow(ctx, glowOf(PAL.emerald), q.x, q.y, rr * 1.15, 0.3 * tw);
      drawGlow(ctx, glowOf(PAL.jade), q.x, q.y, rr * 0.7, 0.22 * tw);
    }
    ctx.globalCompositeOperation = 'source-over';
    // ---- the readout 00 -> 26 M, its leader to the apex tick on the stroke ----
    const rk = clamp((t - T_READ0) / (T_READ1 - T_READ0));
    if (t >= T_READ0) {
      const m = Math.round(26 * ease.outCubic(rk));
      const rx = Math.round(ball.x - R - 92), ry = Math.round(ball.y - R - 20);
      const ra = clamp((t - T_READ0) / 0.06);
      // The leader: from the bracket's right side to the apex tick on the ball's shoulder (ink under, jade over).
      const lx0 = rx + 64, ly0 = ry + 9, lx1 = ball.x - R * 0.72, ly1 = ball.y - R * 0.72;
      ctx.globalAlpha = ra;
      ctx.lineCap = 'butt';
      for (const [w, c] of [[3, HEX.ink], [1, HEX.jade]] as const) {
        ctx.strokeStyle = c;
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.moveTo(lx0, ly0);
        ctx.lineTo(lx0 + 8, ly0);
        ctx.lineTo(lx1, ly1);
        ctx.stroke();
      }
      ctx.fillStyle = HEX.pearl;
      ctx.fillRect(Math.round(lx1 - 1), Math.round(ly1 - 1), 2, 2);
      ctx.globalAlpha = 1;
      readout(ctx, rx, ry, `${String(m).padStart(2, '0')} M`, ra);
      if (m === 26 && t < T_READ1 + 0.3) sparkle(ctx, rx + 60, ry - 2, lerp(9, 0, clamp((t - T_READ1) / 0.3)), 1, Math.PI / 4);
    }
    // ---- the mint clear (0.00-0.12): shot 4's whiteout tears open from the ball ----
    if (t < T_CLEAR) {
      mintClear(ctx, ball.x, ball.y, t);
      fx.fullFrame = true;
    }
    // ---- post ----
    // Bloom eases in as the mint clears, so the torn-open mint field reads mint, never blown white.
    nightGrade(fx, { bloom: lerp(0.45, 1.15, ease.inQuad(clamp(t / T_CLEAR))), thresh: lerp(0.8, 0.62, clamp(t / T_CLEAR)), vignette: 0.65 });
    const clearK = clamp(t / 0.3);
    fx.ca = 0.0015 + 0.001 * (1 - clearK) + 0.0045 * stirK(t);
    if (t < 0.4) pushShock(fx, { x: ball.x / VW, y: ball.y / VH, r: lerp(0.04, 1.2, ease.outCubic(t / 0.4)), s: 0.018 * (1 - t / 0.4) });
    const sk = stirK(t);
    if (sk > 0) {
      fx.radial = 0.065 * sk * sk;
      fx.radialX = ball.x / VW;
      fx.radialY = ball.y / VH;
    }
    if (ts >= 0 && stroke.length > 2) {
      const a = stroke[0], b = stroke[stroke.length - 1], mm = stroke[Math.floor(stroke.length / 2)];
      const c = [2 * mm.x - (a.x + b.x) / 2, 2 * mm.y - (a.y + b.y) / 2] as const;
      setPluck(fx, null, [[a.x, a.y], c, [b.x, b.y]], { amp: 0.004 * pk, n: 3, hz: 6, decay: 0.5, w: 0.04, tSince: ts, glow: 0.15 });
    }
    assertMeridianFx(fx);
  },
};
