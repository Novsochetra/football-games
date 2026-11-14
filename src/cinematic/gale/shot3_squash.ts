// SHOT 3 — SQUASH (1.6 s). The strike at two scales (SPEC.md §3): a macro insert of boot on ball, then the
// camera is blasted backward off the contact.
//
// 0.00-0.12 Macro insert at grass level (screen space, locked camera): StrikeMacro M1 arrives from off-screen
//           left at full speed with a stretched smear copy and a cobalt smear band; the cobalt ball (renderBall
//           r 23 at x2, the macro pixel grid) trembles with dew beads on its crown; floodlight bokeh and dark turf
//           behind, out-of-focus blades in front.
// 0.12      Contact (M2): hit-stop (rate 0.08 to 0.62), the cobalt/ice impact frame for 3 frames, the ball squashes
//           flat on the laces (sx 1 -> 0.58, sy 1 -> 1.25, dented face, bending seams) while the boot drives into it,
//           three ice ripples run across the panels, the dew crown bursts off and hangs glinting, the pressure lens
//           bulges on the contact, the grass under the ball fans flat, 2 px micro-shake. M2b (drawn variant) 0.37.
// 0.62      Release (M3): rate snaps to 1, the ball springs back past round, stretches along the flight line and is
//           out of frame right within 2 frames; vapour collar, shock ring, flash 0.5, turf and dew spray.
// 0.66-1.60 The recoil: under the release flash the macro is swapped for the world view, F7 tight on the boot at
//           zoom 2.4 (laces on the same screen point as the macro's), then the camera is blasted back to zoom 1.0
//           in 0.25 s with heavy shake: F8 follow-through, F8b, the hop landing F9 (dust ring + mini pressed ring),
//           F10 settle. A pale wedge of pressed grass points at goal, turf and dew rain down, wind streaks stream
//           right past him, and only a soft vapour trail is left, curling and dissolving over 0.8 s.
// Muffle 0 -> 1 over 0.70-1.05 (MUFFLE[3]); it stays closed across the straight cut into shot 4.
//
// Clock: frames, camera, lens and cues run on the unwarped t (the brief's times); the simulation (particles, the
// dew crown) runs on simT, the warped clock accumulated in update().

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { TAU, Rng, clamp, ease, lerp, noise1 } from '../../engine/math';
import { PK, drawGlow, glowOf, softSprite } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { FIELD, drawFieldBackdrop } from '../../art/stadium';
import { P, RIVAL_KIT, RIVAL_KIT_B, drawPuppet, renderPuppet, type Pose } from '../../art/puppet';
import { drawAnim, findAnim, findFrame, type StudioAnim } from '../../art/studioAnim';
import {
  BLINK, HEX, MUFFLE, PAL, SEQ, drawBall, drawNo10, drawStamp, galeGrade, galeImpact, isobars, no10, no10At,
  no10Point, pushShock, smearArc, sparkleCyan, springBack, type No10Key,
} from './common';

const DUR = 1.6;

// ---------------------------------------------------------------- times (shot-local, unwarped)
const HIT = 0.12;
const M2B_T = 0.37;
const SQ_END = 0.47;
const REL = 0.62;
const SWAP = 0.66;
const BLAST = 0.25;
const LAND = 1.15;
const HIT_RATE = 0.08;

// ---------------------------------------------------------------- the macro insert (screen space)
/** Screen px per macro px (the macro strip is drawn x4 of the side frames, so this is 8 px per studio px). */
const MD = 2;
/** Ball radius in macro px (renderBall r 23 drawn x2: 92 px across, on the macro boot's pixel grid). */
const MR = 23;
const BR = MR * MD;
/** M2's canvas origin on screen at contact (before the boot drives in): the shin runs off the top of the frame. */
const MO_X = 187, MO_Y = -3;
/** Laces of M1/M2/M2b (canvas px + 0.5) and of M3 (18 px on, 6 up), and the turf row (109). */
const LACES12: readonly [number, number] = [58.5, 86.5];
const LACES3: readonly [number, number] = [76.5, 80.5];
const LX = MO_X + LACES12[0] * MD, LY = MO_Y + LACES12[1] * MD;
const TURF_Y = MO_Y + 109 * MD;
/** The ball at rest (centre), sitting on the turf in front of the laces. */
const BALL0X = LX + BR, BALL0Y = TURF_Y + 1 - BR;
/** Horizon of the grass-level macro camera (a little above the ball's centre). */
const MHZ = 150;

// ---------------------------------------------------------------- the world view (same world as shot 2)
/** World px per studio px (No.10 at integer x3, as in shot 2). */
const D = 3;
/** World y of the soles (studio row 102's bottom edge). */
const GY = 300;
/** Strike-canvas pixel (u, v) -> world. The Strike canvas origin sits 56 studio px right of the Run canvas (shot 2). */
const sp = (u: number, v: number): [number, number] => [(u + 56) * D, GY + (v - 103) * D];
const PLANT_TOE = sp(76.5, 103);
const LAND_TOE = sp(97.5, 103);
const BALL_REST = sp(83.5, 96.5);
const F7_LACES = sp(85.5, 93.5);
/** Where the ball breaks away (the vapour collar and the trail's start). */
const EXIT: [number, number] = [BALL_REST[0] + 14, BALL_REST[1] - 3];
/** Camera at the swap (tight on the boot) and after the blast. */
const Z0 = 2.4;
const C1: [number, number] = [505, 146];
const HH0 = 24, HH1 = 54;
const CX_REF = 245; // shot 2's CX0: the stands' parallax reference, so the stadium lines up with shot 2
const ZB0 = 2.0;
const RIBBON_Y = 106;

// ---------------------------------------------------------------- module state (reset in init)
let spin = new BallSpin();
let simT = 0;
let hitSim = -1;
let hitDone = false, relDone = false, swapDone = false, landDone = false;
let windAcc = 0;
let C0: [number, number] = [0, 0];

interface Bead { x: number; y: number; vx: number; vy: number; r: number; tw: number; sit: boolean }
let beads: Bead[] = [];
interface MBlade { x: number; y: number; h: number; w: number; ph: number; c: string; dew: boolean }
let mBlades: MBlade[] = [];
interface Bokeh { x: number; y: number; r: number; a: number; cyan: boolean; ph: number }
let bokeh: Bokeh[] = [];
/** Dew on the near blades, far out of focus: soft discs across the bottom of the macro frame. */
let fgDew: Bokeh[] = [];
interface Sparkle { X: number; s: number; ph: number; f: number }
interface GBlade { X: number; s: number; h: number; ph: number; c: number }
let sparklesArr: Sparkle[] = [];
let bladesArr: GBlade[] = [];

// Static caches (built once; no per-frame canvas allocations).
let macroBg: HTMLCanvasElement | null = null;
let bokehSprites: [HTMLCanvasElement, HTMLCanvasElement] | null = null;
let fgBlades: HTMLCanvasElement[] | null = null;
let fgBladesLit: HTMLCanvasElement[] | null = null;

// ---------------------------------------------------------------- small pure helpers

function smooth01(x: number) {
  const u = clamp(x);
  return u * u * (3 - 2 * u);
}

/** Integer hash -> [0, 1). */
function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function rateAt(t: number) {
  return t >= HIT && t < REL ? HIT_RATE : 1;
}

// ---------------------------------------------------------------- the squash (pure function of t)

interface Squash { k: number; sx: number; sy: number; dent: number; face: number; cx: number; cy: number }

/**
 * The ball under the boot. The far side barely moves (the ball's own inertia) while the laces drive in: the contact
 * face is where the boot is. sx 1 -> 0.58 and sy 1 -> 1.25 over 0.12-0.47 (ease-out), the dent grows with it, and
 * the bottom stays on the turf (the centre lifts as it bulges up).
 */
function squashAt(t: number): Squash {
  const k = t < HIT ? 0 : ease.outCubic(clamp((t - HIT) / (SQ_END - HIT)));
  const creep = 2 * clamp((t - SQ_END) / (REL - SQ_END));
  const sx = lerp(1, 0.58, k), sy = lerp(1, 1.25, k), dent = 0.18 * k;
  const far = BALL0X + BR + 6 * k + creep;
  const face = far - BR * sx * (2 - dent);
  return { k, sx, sy, dent, face, cx: face + BR * sx * (1 - dent), cy: TURF_Y + 1 - BR * sy };
}

/** The ball after release (macro): springs back past round, then stretches along the flight line and leaves right. */
function releaseBall(t: number): { x: number; y: number; sx: number; sy: number } {
  const s = squashAt(REL);
  const tau = t - REL;
  const x = s.cx + 248000 * tau * tau + 900 * tau;
  const y = s.cy - 0.12 * (x - s.cx);
  if (tau < 0.02) return { x, y, sx: 1.14, sy: 0.9 };
  return { x, y, sx: 1.35, sy: 0.8 };
}

/** Screen position of the laces of the macro frame shown at t (M1 flies in; M2/M2b ride the face; M3 carries on). */
function macroLaces(t: number): [number, number] {
  if (t < HIT) {
    const u = clamp(t / HIT);
    return [lerp(-80, LX, u), LY - 26 * (1 - u) * (1 - u)];
  }
  if (t < REL) return [squashAt(t).face, LY];
  const f = squashAt(REL).face + 20 * clamp((t - REL) / 0.04);
  return [f + (LACES3[0] - LACES12[0]) * MD, LY + (LACES3[1] - LACES12[1]) * MD];
}

/** Micro-shake of the macro layer: 2 px through the hit-stop (stepping at ~20 Hz), 6 px on the release. */
function macroShake(t: number): [number, number] {
  let amp = 0;
  if (t >= HIT && t < REL) amp = 2 * (1 - 0.5 * clamp((t - HIT) / 0.5));
  else if (t >= REL) amp = 6;
  if (amp <= 0) return [0, 0];
  const k = Math.floor(t * 20);
  return [Math.round((hash(k * 2 + 1) * 2 - 1) * amp), Math.round((hash(k * 2 + 7) * 2 - 1) * amp)];
}

// ---------------------------------------------------------------- the camera of the recoil (pure function of t)

interface CamState { x: number; y: number; z: number; hh: number }

function camAt(t: number): CamState {
  const u = clamp((t - SWAP) / BLAST);
  const z0 = lerp(Z0, 1, ease.outCubic(u));
  // Interpolate in 1/zoom so the boot slides smoothly out of the centre as the camera pulls straight back.
  const w = (1 / z0 - 1 / Z0) / (1 - 1 / Z0);
  // After the blast: a damped settle (the camera still rocking from the hit), then a slow drift after his hop.
  const st = t - (SWAP + BLAST);
  const settle = st > 0 ? -0.035 * Math.sin(st * 14) * Math.exp(-st * 6) : 0;
  const drift = smooth01((t - 0.95) / 0.6);
  const z = z0 + settle + 0.035 * drift;
  // The camera lifts a touch with his hop (follow-through and the airborne F8b), then settles as he lands.
  const hop = Math.sin(Math.PI * clamp((t - 0.7) / 0.55)) * clamp((t - SWAP) / 0.1);
  return {
    x: lerp(C0[0], C1[0], w) + 18 * drift,
    y: lerp(C0[1], C1[1], w) - 4 * drift - 9 * hop,
    z,
    hh: lerp(HH0, HH1, w),
  };
}

/** World -> screen (logical px), with the camera's current shake. */
function toScreen(env: Env, x: number, y: number): [number, number] {
  const [u, v] = env.cam.toUV(x, y);
  return [u * VW, v * VH];
}

// ---------------------------------------------------------------- static art caches

function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

/** The macro backdrop: blurred floodlit stands (high-key cobalt haze, the tier LED ribbon soft) and dark turf. */
function makeMacroBg(): HTMLCanvasElement {
  const c = makeCanvas(VW, VH);
  const g = c.getContext('2d')!;
  const r = new Rng(3033);
  const sky = g.createLinearGradient(0, 0, 0, MHZ);
  sky.addColorStop(0, '#0c1840');
  sky.addColorStop(0.5, '#1d3878');
  sky.addColorStop(1, '#5a7db8');
  g.fillStyle = sky;
  g.fillRect(0, 0, VW, MHZ + 2);
  // Each out-of-focus layer is drawn sharp on a scratch canvas, then blurred onto the backdrop in ONE filtered draw
  // (a filter per small draw is very slow on software renderers).
  const layer = makeCanvas(VW, VH);
  const lg = layer.getContext('2d')!;
  const blurOnto = (px: number) => {
    g.filter = `blur(${px}px)`;
    g.globalAlpha = 1;
    g.drawImage(layer, 0, 0);
    g.filter = 'none';
    lg.globalAlpha = 1;
    lg.clearRect(0, 0, VW, VH);
  };
  // The crowd, far out of focus: soft dots of shirt colours in tiers, and the tier fronts.
  const crowd = ['#c83a3a', '#e8e8f0', '#3a5ac8', '#e0b040', '#2a2a40', '#8a3a6a'];
  for (let i = 0; i < 520; i++) {
    const y = r.range(8, MHZ - 26);
    lg.globalAlpha = r.range(0.18, 0.42);
    lg.fillStyle = crowd[r.int(0, crowd.length - 1)];
    lg.fillRect(r.range(-10, VW + 10), y, r.range(4, 9), r.range(4, 8));
  }
  lg.globalAlpha = 0.4;
  lg.fillStyle = '#081030';
  for (let y = 30; y < MHZ - 20; y += 34) lg.fillRect(0, y, VW, 5);
  blurOnto(5);
  // The tier-fascia LED ribbon (shot 2's), melted into soft colour blocks.
  const led = ['#3fd0ff', '#ffffff', '#ffd34a', '#3fd0ff', '#ff3b3b'];
  for (let i = -1; i < 9; i++) {
    lg.globalAlpha = 0.75;
    lg.fillStyle = led[((i % 5) + 5) % 5];
    lg.fillRect(i * 84 + 20, 104, 74, 9);
  }
  blurOnto(6);
  // Floodlit haze toward the horizon (lifted, cool: high-key).
  g.globalAlpha = 1;
  const hz = g.createLinearGradient(0, MHZ - 50, 0, MHZ + 4);
  hz.addColorStop(0, 'rgba(120,160,220,0)');
  hz.addColorStop(1, 'rgba(150,186,230,0.38)');
  g.fillStyle = hz;
  g.fillRect(0, MHZ - 50, VW, 54);
  // Turf: hazy at the horizon, floodlit green at the ball's line, dark toward the lens.
  const tf = g.createLinearGradient(0, MHZ, 0, VH);
  tf.addColorStop(0, '#3b7a62');
  tf.addColorStop(0.3, '#2a7a3c');
  tf.addColorStop(0.5, '#226a32');
  tf.addColorStop(1, '#0f3a1e');
  g.fillStyle = tf;
  g.fillRect(0, MHZ, VW, VH - MHZ);
  // Far turf texture (soft, receding) and near turf (big, very soft).
  for (let i = 0; i < 700; i++) {
    const y = r.range(MHZ + 2, TURF_Y - 2);
    const d = (y - MHZ) / (TURF_Y - MHZ);
    lg.globalAlpha = r.range(0.15, 0.4);
    lg.fillStyle = r.next() < 0.5 ? '#1a5a2c' : '#4fae5a';
    lg.fillRect(r.range(0, VW), y, 1 + d, 2 + d * 6);
  }
  blurOnto(1.5);
  for (let i = 0; i < 160; i++) {
    const y = r.range(TURF_Y + 10, VH + 10);
    lg.globalAlpha = r.range(0.2, 0.45);
    lg.fillStyle = r.next() < 0.6 ? '#0c3018' : '#2e8a42';
    lg.fillRect(r.range(-10, VW + 10), y - 20, r.range(3, 7), r.range(20, 40));
  }
  blurOnto(4);
  g.globalAlpha = 1;
  // The floodlight pool on the turf around the ball (cool, soft).
  g.globalCompositeOperation = 'lighter';
  drawGlow(g, glowOf([90, 140, 170]), BALL0X - 30, TURF_Y, 260, 0.35, 1.6, 0.2);
  g.globalCompositeOperation = 'source-over';
  return c;
}

/** One out-of-focus floodlight disc: flat body, brighter rim, soft edge (cool white or cyan). */
function makeBokeh(c: [number, number, number]): HTMLCanvasElement {
  const cv = makeCanvas(64, 64);
  const g = cv.getContext('2d')!;
  const s = c.join(',');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 31);
  gr.addColorStop(0, `rgba(${s},0.45)`);
  gr.addColorStop(0.78, `rgba(${s},0.55)`);
  gr.addColorStop(0.9, `rgba(${s},0.85)`);
  gr.addColorStop(1, `rgba(${s},0)`);
  g.fillStyle = gr;
  g.beginPath();
  g.arc(32, 32, 31, 0, TAU);
  g.fill();
  return cv;
}

/** Out-of-focus foreground grass (3 variants): two or three leaning blades each, pre-blurred once. */
function makeFgBlades(lit = false): HTMLCanvasElement[] {
  const out: HTMLCanvasElement[] = [];
  const shapes = [
    [[30, 34, 8, 6], [70, 60, 22, 5], [112, 18, -8, 6]],
    [[40, 52, -26, 6], [96, 30, 30, 7]],
    [[26, 20, 36, 5], [64, 46, -6, 7], [120, 64, 26, 5]],
  ];
  for (let v = 0; v < 3; v++) {
    const c = makeCanvas(170, 160);
    const g = c.getContext('2d')!;
    g.filter = 'blur(4px)';
    for (const [bx, tipY, lean, w] of shapes[v]) {
      g.fillStyle = lit ? (tipY > 40 ? 'rgb(58,134,74)' : 'rgb(38,104,60)') : tipY > 40 ? 'rgb(14,38,30)' : 'rgb(8,24,22)';
      g.beginPath();
      g.moveTo(bx - w, 160);
      g.quadraticCurveTo(bx - w * 0.4 + lean * 0.35, (160 + tipY) / 2, bx + lean, tipY);
      g.quadraticCurveTo(bx + w * 0.5 + lean * 0.4, (160 + tipY) / 2 + 6, bx + w, 160);
      g.closePath();
      g.fill();
    }
    out.push(c);
  }
  return out;
}

function buildCaches() {
  if (!macroBg) macroBg = makeMacroBg();
  if (!bokehSprites) bokehSprites = [makeBokeh([215, 235, 255]), makeBokeh([120, 215, 255])];
  if (!fgBlades) fgBlades = makeFgBlades();
  if (!fgBladesLit) fgBladesLit = makeFgBlades(true);
}

// ---------------------------------------------------------------- the macro frames (StrikeMacro, with fallbacks)

type MacroName = 'M1' | 'M2' | 'M2b' | 'M3';

function macroAnim(): StudioAnim | null {
  return findAnim('StrikeMacro', 'side');
}

/**
 * Draw macro frame `name` with its laces on screen (lx, ly). The StrikeMacro strip is drawn at x2 on its 'laces'
 * anchor; M2b falls back to M2. If the strip is missing, the brief's fallback: Strike F6/F7 cropped on the boot at
 * an integer scale (via drawNo10's StrikeMacro stand-ins), its laces on the same point.
 */
function drawMacro(env: Env, name: MacroName, lx: number, ly: number, o: { alpha?: number; stretch?: number } = {}) {
  const ctx = env.ctx;
  const a = macroAnim();
  const i = a ? findFrame(a, name, ...(name === 'M2b' ? ['M2'] : [])) : -1;
  ctx.save();
  ctx.translate(lx, ly);
  if (o.stretch && o.stretch !== 1) ctx.scale(o.stretch, 1);
  if (a && i >= 0) {
    drawAnim(ctx, a, null, i, 0, 0, MD, { anchor: 'laces', alpha: o.alpha ?? 1 });
  } else {
    const key: No10Key = name === 'M1' ? 'M1' : name === 'M3' ? 'M3' : 'M2';
    drawNo10(env, key, 0, 0, 4 * MD, { anchor: 'laces', alpha: o.alpha ?? 1 });
  }
  ctx.restore();
}

// ---------------------------------------------------------------- macro drawing

/** A grass blade as a tapered, slightly curved quad leaning by `lean` radians. */
function bladePath(ctx: CanvasRenderingContext2D, b: MBlade, lean: number) {
  const tx = b.x + Math.sin(lean) * b.h, ty = b.y - Math.cos(lean) * b.h;
  const mx = b.x + Math.sin(lean * 0.55) * b.h * 0.55, my = b.y - Math.cos(lean * 0.55) * b.h * 0.55;
  ctx.moveTo(b.x - b.w / 2, b.y);
  ctx.quadraticCurveTo(mx - b.w * 0.3, my, tx, ty);
  ctx.quadraticCurveTo(mx + b.w * 0.3, my, b.x + b.w / 2, b.y);
  ctx.closePath();
}

/** Lean of a macro blade at t: idle sway, flicked right by the passing boot, fanned flat by the contact, then blown
 *  toward goal by the release. */
function mBladeLean(b: MBlade, t: number): number {
  let l = 0.07 * Math.sin(b.ph + t * 2.6);
  // The boot sweeps just over the turf: the blades it has passed flick toward its travel.
  const toe = macroLaces(Math.min(t, HIT))[0] - 16;
  const behind = toe - b.x;
  if (behind > 0) l += 0.55 * clamp(behind / 30) * Math.exp(-behind / 260) * (t < HIT ? 1 : Math.exp(-(t - HIT) * 3));
  // Contact: the blades under the ball fan flat, away from it.
  const s = squashAt(Math.min(t, REL));
  if (t >= HIT) {
    const dx = b.x - s.cx;
    const fan = s.k * 1.15 * Math.exp(-Math.abs(dx) / 85);
    l += Math.sign(dx || 1) * fan;
  }
  // Release: the ball's wake lays them toward goal.
  if (t >= REL) {
    const dx = b.x - s.face;
    l += 1.1 * smooth01((t - REL) / 0.025) * Math.exp(-Math.abs(dx) / 220);
  }
  return clamp(l, -1.45, 1.45);
}

function drawMacroBlades(env: Env, t: number, front: boolean) {
  const ctx = env.ctx;
  const groups: Record<string, MBlade[]> = {};
  for (const b of mBlades) {
    if ((b.y > TURF_Y + 2) !== front) continue;
    (groups[b.c] ??= []).push(b);
  }
  ctx.save();
  for (const c of Object.keys(groups)) {
    ctx.fillStyle = c;
    ctx.beginPath();
    for (const b of groups[c]) bladePath(ctx, b, mBladeLean(b, t));
    ctx.fill();
  }
  // Dew on some tips (cold night), twinkling.
  for (const b of mBlades) {
    if (!b.dew || (b.y > TURF_Y + 2) !== front) continue;
    const l = mBladeLean(b, t);
    const x = b.x + Math.sin(l) * b.h, y = b.y - Math.cos(l) * b.h;
    const tw = Math.pow(Math.max(0, Math.sin(b.ph * 3 + t * 5)), 8);
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = HEX.navy;
    ctx.fillRect(Math.round(x) - 2, Math.round(y) - 2, 4, 4);
    ctx.globalAlpha = 0.8 + 0.2 * tw;
    ctx.fillStyle = tw > 0.5 ? HEX.ice : '#9fe6ff';
    ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2);
  }
  ctx.restore();
}

/** A dew bead: navy rim, pale cyan body, ice highlight; stretched along its velocity when it flies. */
function drawBead(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, vx: number, vy: number, a = 1) {
  if (a <= 0) return;
  const v = Math.hypot(vx, vy);
  const st = 1 + clamp(v / 900, 0, 1.2);
  const ang = v > 1 ? Math.atan2(vy, vx) : 0;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.globalAlpha = 0.65 * a;
  ctx.fillStyle = HEX.navy;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * st + 1, r + 1, 0, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = a;
  ctx.fillStyle = '#9fdcf5';
  ctx.beginPath();
  ctx.ellipse(0, 0, r * st, r, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
  ctx.globalAlpha = a;
  ctx.fillStyle = HEX.ice;
  const q = Math.max(1, Math.round(r * 0.7));
  ctx.fillRect(Math.round(x - r * 0.5), Math.round(y - r * 0.55), q, q);
  ctx.globalAlpha = 1;
}

/** The three ice ripples running across the panels from the contact face (clipped to the squashed ball). */
function drawRipples(ctx: CanvasRenderingContext2D, s: Squash, t: number) {
  if (t < HIT || t >= REL) return;
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(s.cx, s.cy, BR * s.sx, BR * s.sy, 0, 0, TAU);
  ctx.clip();
  for (let i = 0; i < 3; i++) {
    const t0 = HIT + 0.02 + i * 0.09;
    const rho = (t - t0) * 230;
    if (rho <= 2) continue;
    const span = BR * 2 * 1.05;
    if (rho > span) continue;
    const a = (1 - rho / span) * clamp(rho / 8);
    const rx = rho * s.sx * 1.1, ry = rho * s.sy;
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.7 * a;
    ctx.strokeStyle = HEX.navy;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(s.face + 1.5, s.cy, rx, ry, 0, -1.35, 1.35);
    ctx.stroke();
    ctx.globalAlpha = a;
    ctx.strokeStyle = HEX.cyan;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(s.face - 0.5, s.cy, rx, ry, 0, -1.35, 1.35);
    ctx.stroke();
    ctx.strokeStyle = HEX.ice;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(s.face - 1.5, s.cy, rx, ry, 0, -1.25, 1.25);
    ctx.stroke();
  }
  ctx.restore();
}

/** Bead position at t: riding the ball before contact, then the crown (ballistic on the simulation clock). */
function beadAt(b: Bead, t: number, ballX: number, ballY: number): { x: number; y: number; vx: number; vy: number } {
  if (t < HIT || hitSim < 0) return { x: ballX + b.x, y: ballY + b.y, vx: 0, vy: 0 };
  const tau = simT - hitSim;
  const g = 900;
  return { x: BALL0X + b.x + b.vx * tau, y: BALL0Y + b.y + b.vy * tau + 0.5 * g * tau * tau, vx: b.vx, vy: b.vy + g * tau };
}

function renderMacro(env: Env, t: number) {
  const { ctx, fx } = env;
  env.screen();
  const [shx, shy] = macroShake(t);
  ctx.save();
  ctx.translate(shx, shy);
  if (macroBg) ctx.drawImage(macroBg, -8, -8, VW + 16, VH + 16);

  // Floodlight bokeh: soft discs, additive over the navy haze (they breathe a touch).
  if (bokehSprites) {
    ctx.globalCompositeOperation = 'lighter';
    for (const b of bokeh) {
      const br = 1 + 0.04 * Math.sin(b.ph + t * 3);
      drawGlow(ctx, bokehSprites[b.cyan ? 1 : 0], b.x, b.y, b.r * br, b.a);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  drawMacroBlades(env, t, false);
  env.parts.draw(ctx, 2);

  // The ball's state.
  const s = squashAt(Math.min(t, REL));
  let bx = s.cx, by = s.cy, sx = s.sx, sy = s.sy, dent = s.dent;
  if (t < HIT) {
    // Tremble toward the boot (1 macro px at ~20 Hz), carried over from the load.
    const k = Math.round(hash(Math.floor(t * 20) + 3) * 2 - 0.8);
    bx -= clamp(k, -1, 1) * MD;
  } else if (t >= REL) {
    const rb = releaseBall(t);
    bx = rb.x;
    by = rb.y;
    sx = rb.sx;
    sy = rb.sy;
    dent = 0;
  }
  const ballOn = bx - BR * sx < VW + 4;

  // Contact shadow on the turf under the ball.
  if (t < REL + 0.02) {
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = HEX.navy;
    ctx.beginPath();
    ctx.ellipse(t < REL ? bx : s.cx, TURF_Y + 2, BR * sx * 0.95, 6, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // The ball's glow goes BEHIND the boot (navy halo in normal blend, cobalt halo and ice core additive), so the white
  // boot never blows out; the ball itself is drawn after the boot with no glow of its own.
  const glow = t < HIT ? 0.22 : t < REL ? lerp(0.5, 0.85, s.k) : 0.9;
  if (ballOn) {
    drawGlow(ctx, glowOf(PAL.navy), bx, by, BR * 3.4, glow * 0.6);
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.cobalt), bx, by, BR * 4.2, glow * 0.45);
    drawGlow(ctx, glowOf(PAL.ice), bx, by, BR * 1.7, glow * 0.45);
    ctx.globalCompositeOperation = 'source-over';
  }

  // ---- the boot.
  const [lx, ly] = macroLaces(t);
  if (t < HIT) {
    const u = clamp(t / HIT);
    // Smear band along the boot's path (cobalt, ice leading edge over a navy halo), then a stretched copy behind.
    if (u > 0.05) {
      const p2 = { x: lx - 6, y: ly + 6 };
      const p0 = { x: lx - 330, y: LY - 70 };
      const p1 = { x: lx - 150, y: ly - 10 };
      smearArc(ctx, p0, p1, p2, 54, 0.85 * clamp(u * 3), 1);
    }
    // The 2-frame smear: a stretched copy at 0.5 alpha behind the boot on the last two frames before contact.
    if (t >= HIT - 2 / 60) drawMacro(env, 'M1', lx + 41 * MD * (1 - 1.8), ly, { alpha: 0.5, stretch: 1.8 });
    drawMacro(env, 'M1', lx, ly);
  } else if (t < REL) {
    drawMacro(env, t < M2B_T ? 'M2' : 'M2b', lx, ly);
  } else {
    // M3 through, with a short cobalt smear of the toe lifting.
    smearArc(ctx, { x: lx - 90, y: ly + 30 }, { x: lx - 40, y: ly + 22 }, { x: lx + 8, y: ly + 2 }, 34, 0.6, 1);
    drawMacro(env, 'M3', lx, ly);
  }

  // ---- the ball (cobalt; heat and glow rise with the contact).
  if (ballOn) {
    if (t >= REL) {
      // The vapour blast between the boot and the departing ball: soft puffs (macro scale), fresh and cyan.
      const x0 = s.face + 4, y0 = s.cy + 4, x1 = bx - BR * sx * 0.5;
      const L = Math.max(1, x1 - x0);
      puffBand(ctx, Math.ceil(L / 14), 14, (d) => [x0 + d, lerp(y0, by, d / L)], 2.6, t - REL, 0.95, 1, 10);
    }
    const heat = t < HIT ? 0.18 : t < REL ? lerp(0.25, 0.42, s.k) : 0.45;
    drawBall(env, spin, bx, by, MR, MD, heat, 0, 'cobalt', { sx, sy, dent });
    drawRipples(ctx, s, t);
  }

  // ---- the dew: beads on the crown before contact; the crown hanging glinting through the hit-stop.
  for (const b of beads) {
    if (t < HIT && !b.sit) continue;
    const p = beadAt(b, t, bx, by);
    if (p.x < -10 || p.x > VW + 10 || p.y > VH + 10) continue;
    const vk = t < HIT ? 0 : t < REL ? 0.25 : 1;
    drawBead(ctx, p.x, p.y, b.r, p.vx * vk, p.vy * vk);
  }
  // Glints (additive cyan over navy): a few beads catch the floodlights in turn.
  ctx.save();
  for (let i = 0; i < beads.length; i++) {
    const b = beads[i];
    if (t < HIT && !b.sit) continue;
    const tw = Math.pow(Math.max(0, Math.sin(b.tw + t * (t >= HIT && t < REL ? 9 : 14))), 6);
    if (tw < 0.25) continue;
    const p = beadAt(b, t, bx, by);
    ctx.globalCompositeOperation = 'source-over';
    drawGlow(ctx, glowOf(PAL.navy), p.x, p.y, 9, 0.35 * tw);
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.cyan), p.x, p.y, 7, 0.5 * tw);
    sparkleCyan(ctx, p.x, p.y, 4 + 7 * tw * (b.r / 3), tw, 0.25 + i);
  }
  ctx.restore();

  // Pressure building in the hit-stop: two faint isobars round the contact, slowly swelling.
  if (t >= HIT && t < REL) {
    const a = smooth01((t - HIT) / 0.1) * (1 - smooth01((t - REL + 0.08) / 0.08));
    const g = (t - HIT) / (REL - HIT);
    isobars(ctx, s.face, s.cy, [70 + 28 * g, 104 + 36 * g], { squash: 0.85, t, alpha: 0.32 * a, wobble: 0.03, lobes: 5 });
  }

  drawMacroBlades(env, t, true);
  env.parts.draw(ctx, 3);
  ctx.restore();

  // Dew on the grass right at the lens: big soft discs, far out of focus.
  if (bokehSprites) {
    ctx.globalCompositeOperation = 'lighter';
    for (const b of fgDew) drawGlow(ctx, bokehSprites[b.cyan ? 1 : 0], b.x + 6 * Math.sin(b.ph + t), b.y, b.r, b.a * (0.85 + 0.15 * Math.sin(b.ph * 2 + t * 4)));
    ctx.globalCompositeOperation = 'source-over';
  }
  // Out-of-focus blades right at the lens (screen bottom corners).
  // Tall dark blades at the frame edges (against the haze and the far turf), lit ones low in the middle.
  if (fgBlades && fgBladesLit) {
    ctx.globalAlpha = 0.85;
    ctx.drawImage(fgBlades[0], -120, VH - 290, 320, 300);
    ctx.drawImage(fgBlades[2], 500, VH - 260, 270, 254);
    ctx.globalAlpha = 0.95;
    ctx.drawImage(fgBladesLit[1], 190, VH - 70, 150, 141);
    ctx.globalAlpha = 1;
  }

  // ---- post.
  galeGrade(fx, 1, [228, 242, 255], 1.08);
  fx.vignette = 0.55;
  // Bloom only on the ice glows and dew (the white boot keeps its lavender shading).
  fx.bloom = 0.9;
  fx.bloomThresh = 0.8;
  fx.ca = 0.0015 + (t >= HIT ? 0.006 * Math.exp(-(t - HIT) * 6) : 0);
  const rel = squashAt(REL);
  if (t >= HIT && t < REL) {
    fx.lens = 0.2 * ease.outQuad(clamp((t - HIT) / 0.1));
    fx.lensX = (s.face + shx) / VW;
    fx.lensY = (s.cy + shy) / VH;
    fx.lensR = 0.18;
  } else if (t >= REL) {
    fx.lens = springBack(t, REL, 0.2, 0.14);
    fx.lensX = rel.face / VW;
    fx.lensY = rel.cy / VH;
    fx.lensR = 0.18;
  }
  if (t >= HIT && t < HIT + 3 / 60) galeImpact(fx, 1);
}

// ---------------------------------------------------------------- the world view (ported from shot 2's look)

/** The stands: the shared field backdrop under its own parallax camera, then a floodlit haze over the roof line. */
function drawBackdrop(env: Env, c: CamState, time: number) {
  const ctx = env.ctx;
  const st = env.art.stadium;
  const [hx, hy] = toScreen(env, env.cam.x, GY - c.hh);
  const zb = ZB0 * (1 + (c.z - 1) * 0.28);
  const camXb = 640 + (c.x - CX_REF) * 0.32;
  env.screen();
  ctx.save();
  ctx.translate(hx, hy);
  ctx.scale(zb, zb);
  ctx.translate(-camXb, -FIELD.horizon);
  drawFieldBackdrop(ctx, st, camXb, FIELD.horizon - hy / zb + VH / (2 * zb), time);
  // Floodlit haze above the roof (no night sky in GALE's frames).
  const top = FIELD.horizon - hy / zb - 10;
  const g = ctx.createLinearGradient(0, top, 0, 58);
  g.addColorStop(0, 'rgb(26,44,104)');
  g.addColorStop(0.6, 'rgb(70,106,178)');
  g.addColorStop(1, 'rgb(120,156,214)');
  ctx.fillStyle = g;
  ctx.fillRect(camXb - 420, top, 840, 58 - top);
  for (const tx of [120, 620, 1120, 1620]) {
    const x = tx + camXb * 0.5 - 300 + 20;
    if (x < camXb - 420 || x > camXb + 420) continue;
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf([150, 190, 255]), x, -24, 120, 0.45);
    drawGlow(ctx, glowOf([235, 248, 255]), x, -24, 46, 0.8);
    ctx.globalCompositeOperation = 'source-over';
  }
  const hz = ctx.createLinearGradient(0, 58, 0, FIELD.horizon);
  hz.addColorStop(0, 'rgba(70,104,170,0.5)');
  hz.addColorStop(1, 'rgba(150,186,230,0.36)');
  ctx.fillStyle = hz;
  ctx.fillRect(camXb - 420, 58, 840, FIELD.horizon - 58);
  const rx = camXb * 0.25 - 220;
  ctx.fillStyle = 'rgba(8,12,34,0.55)';
  for (let y = 74; y < 160; y += 13) ctx.fillRect(camXb - 420, y, 840, 1.4);
  ctx.fillStyle = 'rgba(190,215,255,0.16)';
  for (let y = 74; y < 160; y += 13) ctx.fillRect(camXb - 420, y - 0.8, 840, 0.8);
  for (let i = Math.floor((camXb - 420 - rx) / 96) - 1, n = i + 11; i < n; i++) {
    ctx.fillStyle = 'rgba(150,170,210,0.32)';
    ctx.fillRect(rx + i * 96 + 40, 64, 3, 96);
  }
  ctx.fillStyle = '#070912';
  ctx.fillRect(camXb - 420, RIBBON_Y - 3, 840, 6);
  const cols = ['#3fd0ff', '#ffffff', '#ffd34a', '#3fd0ff', '#ff3b3b'];
  for (let i = Math.floor((camXb - 420 - rx) / 64) - 1, n = i + 16; i < n; i++) {
    ctx.fillStyle = cols[((i % 5) + 5) % 5];
    ctx.globalAlpha = 0.85;
    ctx.fillRect(rx + i * 64 + 3, RIBBON_Y - 2, 58, 4);
    ctx.fillStyle = '#070912';
    for (let k = 0; k < 5; k++) ctx.fillRect(rx + i * 64 + 8 + k * 10, RIBBON_Y - 1, 4, 2);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

/** Ground point at depth s (1 = his plane, < 1 farther, > 1 nearer) for world x X. */
function groundAt(c: CamState, X: number, s: number): [number, number] {
  const hz = GY - c.hh;
  return [c.x + (X - c.x) * s, hz + (GY - hz) * s];
}

function drawGround(env: Env, c: CamState, time: number) {
  const ctx = env.ctx;
  const hz = GY - c.hh;
  const halfW = VW / (2 * c.z) + 60, halfH = VH / (2 * c.z) + 60;
  const L = c.x - halfW, R = c.x + halfW, B = c.y + halfH;
  const g = ctx.createLinearGradient(0, hz, 0, B);
  const kG = clamp((GY - hz) / (B - hz));
  g.addColorStop(0, '#3d7d5a');
  g.addColorStop(kG * 0.5, '#2f8a40');
  g.addColorStop(kG, '#2d8c3d');
  g.addColorStop(1, '#246f33');
  ctx.fillStyle = g;
  ctx.fillRect(L, hz - 1, R - L, B - hz + 1);
  const SW = 150;
  const sB = (B - hz) / (GY - hz);
  ctx.fillStyle = 'rgba(190,255,190,0.07)';
  ctx.beginPath();
  const kMin = Math.floor((c.x - (halfW + 400) / sB) / SW) - 1;
  const kMax = Math.ceil((c.x + (halfW + 400) / sB) / SW) + 1;
  for (let k = kMin - (kMin & 1); k <= kMax; k += 2) {
    const x0 = c.x + (k * SW - c.x) * sB, x1 = c.x + ((k + 1) * SW - c.x) * sB;
    ctx.moveTo(c.x, hz);
    ctx.lineTo(x0, B);
    ctx.lineTo(x1, B);
    ctx.closePath();
  }
  ctx.fill();
  const [, ty] = groundAt(c, 0, 0.16);
  ctx.fillStyle = 'rgba(235,245,255,0.55)';
  ctx.fillRect(L, ty, R - L, Math.max(1, 1.2 / c.z));
  const hb = ctx.createLinearGradient(0, hz - 2, 0, hz + (GY - hz) * 0.45);
  hb.addColorStop(0, 'rgba(170,205,240,0.55)');
  hb.addColorStop(1, 'rgba(170,205,240,0)');
  ctx.fillStyle = hb;
  ctx.fillRect(L, hz - 2, R - L, (GY - hz) * 0.45 + 2);
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf([120, 170, 210]), PLANT_TOE[0] - 20, GY, 340, 0.2, 1.6, 0.22);
  for (const p of sparklesArr) {
    const x = c.x + (p.X - c.x) * p.s, y = hz + (GY - hz) * p.s;
    if (x < L || x > R || y > B) continue;
    const tw = Math.pow(Math.max(0, Math.sin(p.ph + time * p.f)), 10);
    const sz = Math.max(1 / c.z, 1.1 * p.s);
    ctx.globalAlpha = 0.35 + 0.65 * tw;
    ctx.fillStyle = tw > 0.6 ? HEX.ice : 'rgb(150,220,255)';
    ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

/** A set, defensive screen stance (as the defenders end shot 2), far behind near the box. */
const SET_POSE: Pose = P({ torso: 0.17, head: -0.1, thighN: 0.3, kneeN: 0.52, thighF: -0.1, kneeF: 0.48, armN: 0.35, elbowN: 0.7, armF: -0.2, elbowF: 0.7 });

function drawDefenders(env: Env, c: CamState, t: number) {
  const ctx = env.ctx;
  const S = 0.24;
  const defs = [
    { kit: RIVAL_KIT, X: 1324, ph: 0 },
    { kit: RIVAL_KIT_B, X: 1574, ph: 1.7 },
  ];
  for (const d of defs) {
    // On their toes: a small side-shuffle sway (they have not seen it coming yet).
    const sw = Math.sin(t * 7 + d.ph);
    const pose = { ...SET_POSE, armN: SET_POSE.armN + 0.08 * sw, armF: SET_POSE.armF - 0.08 * sw, kneeN: SET_POSE.kneeN + 0.05 * sw };
    const [x, y] = groundAt(c, d.X + 6 * sw, S);
    const k = 0.7;
    const sc = (S * D * 98) / (95 * k);
    const r = renderPuppet(d.kit, pose, { k, facing: -1 });
    drawPuppet(ctx, r, x, y - 40 * k * sc, sc, 0.7);
  }
}

/** Grass blades in perspective rows: blown toward goal in the ball's wake, flattened inside the pressed wedge. */
function drawGrass(env: Env, c: CamState, t: number, front: boolean) {
  const ctx = env.ctx;
  const halfW = VW / (2 * c.z) + 40;
  const hz = GY - c.hh;
  const wake = Math.exp(-Math.max(0, t - SWAP) * 2.2);
  ctx.lineWidth = 1.6 / Math.max(1, c.z / 1.2);
  for (let pass = 0; pass < 2; pass++) {
    ctx.strokeStyle = pass === 0 ? '#2a6e36' : '#57b85e';
    ctx.beginPath();
    for (const b of bladesArr) {
      if (front !== b.s > 1) continue;
      if ((b.c > 0.5 ? 1 : 0) !== pass) continue;
      const x = c.x + (b.X - c.x) * b.s, y = hz + (GY - hz) * b.s;
      if (x < c.x - halfW || x > c.x + halfW) continue;
      let h = b.h * b.s;
      let lean = Math.sin(b.ph + t * 2.2) * 0.12;
      lean += (0.35 + 0.75 * wake) * clamp((x - PLANT_TOE[0] + 60) / 80);
      // Inside the pressed wedge the blades lie flat toward goal.
      const dx = x - EXIT[0] + 10;
      if (dx > 0 && Math.abs(y - GY) < 4 + dx * 0.04 && b.s > 0.8 && b.s < 1.25) {
        lean = 1.35;
        h *= 0.7;
      }
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + Math.sin(lean) * h * 0.4, y - h * 0.6, x + Math.sin(lean) * h, y - Math.cos(lean) * h);
    }
    ctx.stroke();
  }
}

/** The pale wedge of pressed grass in front of him, pointing at goal (the ball's wake on the turf). */
function drawWedge(ctx: CanvasRenderingContext2D, t: number) {
  if (t < REL) return;
  const L = 1150 * ease.outCubic(clamp((t - REL) / 0.22));
  if (L < 2) return;
  const ax = EXIT[0] - 22, ay = GY + 1;
  const open = 0.2, k = 0.24;
  const a = 1 - 0.3 * smooth01((t - 1.1) / 0.5);
  ctx.save();
  // The pressed hollow where the ball was struck.
  ctx.globalAlpha = 0.42 * a;
  ctx.fillStyle = HEX.pressedCore;
  ctx.beginPath();
  ctx.ellipse(ax + 20, ay, 26, 5, 0, 0, TAU);
  ctx.fill();
  // The wedge: pale flattened grass, fading toward its far end.
  const gr = ctx.createLinearGradient(ax, 0, ax + L, 0);
  gr.addColorStop(0, `rgba(165,232,146,${0.8 * a})`);
  gr.addColorStop(0.5, `rgba(155,224,138,${0.52 * a})`);
  gr.addColorStop(1, 'rgba(155,224,138,0)');
  ctx.globalAlpha = 1;
  ctx.fillStyle = gr;
  const hw = L * Math.tan(open) * k;
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(ax + L, ay - hw);
  ctx.lineTo(ax + L, ay + hw);
  ctx.closePath();
  ctx.fill();
  // Combed sheen: short broken dashes along the grain (never one long line).
  ctx.fillStyle = '#d6f6c4';
  for (let i = 0; i < 26; i++) {
    const f = hash(i + 11), g = hash(i + 41) * 2 - 1;
    const x = ax + 30 + f * (L - 40);
    if (x > ax + L) continue;
    const y = ay + g * (x - ax) * Math.tan(open) * k * 0.8;
    ctx.globalAlpha = 0.55 * a * (1 - f * 0.6);
    ctx.fillRect(x, y - 0.5, 10 + 16 * hash(i + 71), 1.2);
  }
  // Blades flicked out along both edges.
  ctx.strokeStyle = '#c8f0b0';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.6 * a;
  ctx.beginPath();
  for (let i = 0; i < 30; i++) {
    const x = ax + 20 + (i / 30) * (L - 20);
    const e = (x - ax) * Math.tan(open) * k;
    for (const sg of [-1, 1]) {
      ctx.moveTo(x, ay + sg * e);
      ctx.lineTo(x + 3, ay + sg * (e + 2) - 2);
    }
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * The vapour trail left behind: built from soft overlapping puffs (never a crisp line), 10-16 px wide at zoom 1,
 * pointing at the goal along the ball's line. As it ages the puffs swell, drift apart and curl into small eddies,
 * holes open in it, and it is gone by 0.8 s. A brief cyan glow in its first instants (fresh, crushed air).
 */
function drawTrail(ctx: CanvasRenderingContext2D, t: number) {
  const age = t - REL;
  puffBand(ctx, 70, 8, (d) => [EXIT[0] + d, flightY(d)], 1, age, 1 - smooth01(age / 0.8), 1 - smooth01((age - 0.05) / 0.25), 44);
}

/**
 * A soft band of vapour puffs along a path (never a crisp line): n puffs every `step` px, base radius ~6 x `scale`.
 * As it ages the puffs swell, drift apart and curl into small eddies, and holes open in it. Navy halo (normal),
 * white mist (normal), cyan glow (additive), and an ice core while `fresh`. `lead` fades the first px of the band in.
 */
function puffBand(
  ctx: CanvasRenderingContext2D, n: number, step: number, path: (d: number) => [number, number], scale: number,
  age: number, a: number, fresh: number, lead: number,
) {
  if (a <= 0) return;
  const white = softSprite('white', 0.15);
  ctx.save();
  for (let i = 0; i < n; i++) {
    const d = i * step + step * 0.75;
    // Holes open as it dissolves (each puff has its own moment to go).
    const gone = 0.25 + 0.75 * hash(i * 3 + 1);
    const pa = a * (1 - smooth01((age / 0.8 - gone * 0.8) / 0.2)) * smooth01((d - 4) / lead);
    if (pa <= 0.01) continue;
    const n1 = noise1(i * 0.37 + 3.1, 21);
    // Eddies: each puff circles a little, wider with age; the band also waves as a whole.
    const sw = age * (8 + 10 * hash(i + 5)) * scale;
    const ph = i * 1.9 + age * (5 + 3 * hash(i + 9));
    const wave = (2 + age * 16) * noise1(i * 0.21 - age * 1.3, 22) * scale;
    const [px, py] = path(d);
    const x = px + Math.cos(ph) * sw * 0.7;
    const y = py + wave + Math.sin(ph) * sw * 0.45;
    const r = (4.2 + 1.6 * (1 + n1) + age * 7) * scale;
    ctx.globalCompositeOperation = 'source-over';
    drawGlow(ctx, glowOf(PAL.navy), x, y, r * 1.5, 0.1 * pa);
    drawGlow(ctx, white, x, y, r, 0.4 * pa * (0.7 + 0.3 * n1));
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.cyan), x, y, r * 1.1, (0.12 + 0.2 * fresh) * pa);
    if (fresh > 0 && i % 2 === 0) drawGlow(ctx, glowOf(PAL.ice), x, y, r * 0.55, 0.3 * fresh * pa);
  }
  ctx.restore();
}

/** The ball's line through the frame (world): from the break-away point, rising gently toward 0.4 m, then level. */
function flightY(d: number) {
  return EXIT[1] - 47 * Math.sin((Math.min(1, d / 360) * Math.PI) / 2);
}

/** No.10's world frame at t: where it is pinned (with a whole-studio-px drift on the airborne drawings). */
function heroAt(t: number): { key: No10Key; x: number; y: number; anchor?: string; air: number } {
  const key = no10At(SEQ[3], t);
  const snap = (v: number) => Math.round(v) * D;
  if (key === 'F8') {
    const u = clamp((t - 0.7) / 0.22);
    const [x, y] = sp(71.5, 59.5);
    return { key, x: x + snap(lerp(0, 2, u)), y: y + snap(lerp(0, -1, ease.outQuad(u))), anchor: 'pelvis', air: 1 };
  }
  if (key === 'F8b') {
    const u = clamp((t - 0.92) / 0.23);
    const [x, y] = sp(78.5, 62.5);
    return { key, x: x + snap(lerp(0, 2, u)), y: y + snap(lerp(0, 2, ease.inQuad(u))), anchor: 'pelvis', air: 1 };
  }
  if (key === 'F9' || key === 'F10') return { key, x: LAND_TOE[0], y: LAND_TOE[1], air: 0 };
  return { key, x: PLANT_TOE[0], y: PLANT_TOE[1], air: 0 };
}

function drawHero(env: Env, t: number) {
  const ctx = env.ctx;
  const h = heroAt(t);
  const o = h.anchor ? { anchor: h.anchor } : {};
  const f = no10(h.key);
  // Contact shadow (navy, soft), on the ground under his body.
  const sx = h.air ? h.x + 4 : h.key === 'F7' ? PLANT_TOE[0] - 18 : LAND_TOE[0] - 30;
  ctx.save();
  ctx.globalAlpha = 0.34 - h.air * 0.12;
  ctx.fillStyle = HEX.navy;
  ctx.beginPath();
  ctx.ellipse(sx, GY + 1, 74 - h.air * 18, 7, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
  // The hop lands: 2 frames of squash (y-scale 0.96 on the landing toe), so the weight reads before F9 holds.
  const squash = h.key === 'F9' && t < LAND + 2 / 60;
  ctx.save();
  if (squash) {
    ctx.translate(h.x, GY);
    ctx.scale(1, 0.96);
    ctx.translate(-h.x, -GY);
  }
  // Cool floodlight rim: an ice-tinted copy peeking 1 studio px up-left.
  if (f) {
    const rim = f.a.tinted(f.i, [170, 228, 255]);
    drawNo10(env, h.key, h.x - D, h.y - D, D, { ...o, alpha: 0.45 }, rim);
  }
  drawNo10(env, h.key, h.x, h.y, D, o);
  ctx.restore();
}

function renderWorld(env: Env, t: number) {
  const { ctx, fx } = env;
  const c = camAt(t);
  const time = simT;
  drawBackdrop(env, c, time);
  env.world();
  drawGround(env, c, time);
  drawDefenders(env, c, t);
  // The plant stamp from the load (shot 2), still pressed into the turf under his far foot.
  drawStamp(ctx, PLANT_TOE[0] - 6, GY + 1, 30, 2, { squash: 0.25, alpha: 0.7 });
  drawWedge(ctx, t);
  // The landing's mini pressed ring under the kicking foot.
  if (t >= LAND) drawStamp(ctx, LAND_TOE[0] - 8, GY + 1, 26, (t - LAND) * 1.6, { squash: 0.25, grow: 0.3, alpha: 0.75 });
  drawGrass(env, c, t, false);
  env.parts.draw(ctx, 0);

  drawHero(env, t);
  drawTrail(ctx, t);
  drawGrass(env, c, t, true);
  env.parts.draw(ctx, 1);

  // Out-of-focus blades right at the lens (parallax 1.6): they shrink and slide out as the camera pulls back.
  env.screen();
  if (fgBlades) {
    const span = VW + 340;
    const zk = Math.pow(env.cam.zoom, 1.3);
    const items = [[40, 0, 1.0], [330, 1, 0.85], [600, 2, 1.1]] as const;
    ctx.globalAlpha = 0.9 * smooth01((t - SWAP - 0.06) / 0.15);
    for (const [x0, v, s] of items) {
      let x = x0 - (env.cam.x - CX_REF) * 1.6;
      x = ((((x + 170) % span) + span) % span) - 170;
      const cx = VW / 2 + (x - VW / 2) * (1 + (zk - 1) * 0.9);
      const im = fgBlades[v];
      const w = im.width * s * zk, h = im.height * s * zk;
      ctx.drawImage(im, cx - w / 2, VH - h * 0.55, w, h);
    }
    ctx.globalAlpha = 1;
  }

  // ---- post.
  galeGrade(fx, 1, [220, 238, 255], 1.08);
  fx.vignette = 0.42;
  fx.bloom = 0.9;
  fx.bloomThresh = 0.66;
  fx.ca = 0.0012 + 0.003 * Math.exp(-(t - SWAP) * 5);
  const rel = squashAt(REL);
  const k = springBack(t, REL, 0.2, 0.14);
  if (k) {
    fx.lens = k;
    fx.lensX = rel.face / VW;
    fx.lensY = rel.cy / VH;
    fx.lensR = 0.18;
  }
}

// ---------------------------------------------------------------- particles (update only, env.rng)

function spawnContact(env: Env) {
  const rng = env.rng;
  const s = squashAt(HIT + 0.001);
  // A breath of crushed air off the contact face (soft white mist, normal blend): it hangs in the hit-stop.
  for (let i = 0; i < 8; i++) {
    const a = rng.range(-2.4, -0.7);
    env.parts.spawn({
      kind: PK.Smoke, x: s.face + rng.range(-6, 6), y: LY + rng.range(-30, 30), vx: Math.cos(a) * rng.range(60, 160), vy: Math.sin(a) * rng.range(60, 160),
      drag: 1.5, max: rng.range(0.5, 0.8), s0: rng.range(8, 14), s1: rng.range(24, 36), ramp: 'white', r0: 0.1, r1: 0.5, a0: 0.28, a1: 0, add: false, layer: 3,
    });
  }
  // Turf flecks lifting off under the ball.
  for (let i = 0; i < 8; i++) {
    const a = rng.range(-Math.PI * 0.85, -Math.PI * 0.15);
    const v = rng.range(150, 420);
    env.parts.spawn({
      kind: PK.Pixel, x: s.cx + rng.range(-40, 40), y: TURF_Y - 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v, ay: 900, drag: 0.6,
      max: rng.range(0.6, 1), s0: rng.range(3, 5), s1: 3, ramp: 'grass', r0: rng.range(0, 0.5), r1: 0.8, a0: 1, a1: 0.9, add: false, layer: 3,
    });
  }
}

function spawnRelease(env: Env) {
  const rng = env.rng;
  const s = squashAt(REL);
  const ex = s.cx + 30, ey = s.cy;
  // The vapour collar: a short cone of white mist opening back from where the ball breaks away.
  for (let i = 0; i < 26; i++) {
    const d = rng.range(0, 70);
    const sg = rng.sign();
    const off = d * Math.tan(0.6) * rng.range(0.3, 1);
    env.parts.spawn({
      kind: PK.Smoke, x: ex - d, y: ey + sg * off, vx: -rng.range(20, 120), vy: sg * rng.range(60, 200), drag: 2,
      max: rng.range(0.35, 0.6), s0: rng.range(10, 18), s1: rng.range(30, 50), ramp: 'white', r0: 0, r1: 0.5, a0: 0.5, a1: 0, add: false, layer: 3,
    });
  }
  // Turf spray and dew off the contact.
  for (let i = 0; i < 14; i++) {
    const a = rng.range(-Math.PI * 0.75, -Math.PI * 0.1);
    const v = rng.range(300, 900);
    env.parts.spawn({
      kind: PK.Debris, x: s.face + rng.range(0, 60), y: TURF_Y - 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v, ay: 1400, drag: 0.5, vrot: rng.range(-14, 14),
      max: rng.range(0.4, 0.7), s0: rng.range(4, 8), s1: 4, ramp: 'grass', r0: rng.next(), r1: rng.next(), a0: 1, a1: 1, add: false, layer: 3,
    });
  }
  for (let i = 0; i < 20; i++) {
    const a = rng.range(-Math.PI * 0.9, -Math.PI * 0.05);
    const v = rng.range(300, 1000);
    env.parts.spawn({
      kind: PK.Glow, x: s.face + rng.range(-10, 70), y: TURF_Y - rng.range(2, 20), vx: Math.cos(a) * v, vy: Math.sin(a) * v, ay: 1200, drag: 0.8,
      max: rng.range(0.4, 0.7), s0: rng.range(3, 6), s1: 1.5, ramp: 'dew', r0: 0, r1: 0.6, a0: 1, a1: 0.2, layer: 3,
    });
  }
}

function spawnWorld(env: Env) {
  const rng = env.rng;
  const [bx, by] = BALL_REST;
  // The vapour collar where the ball broke away, opening back toward him.
  for (let i = 0; i < 18; i++) {
    const d = rng.range(0, 44);
    const sg = rng.sign();
    env.parts.spawn({
      kind: PK.Smoke, x: EXIT[0] + 18 - d * 0.8, y: EXIT[1] + sg * d * rng.range(0.15, 0.5), vx: rng.range(30, 110), vy: sg * rng.range(20, 60), drag: 1.8,
      max: rng.range(0.45, 0.8), s0: rng.range(6, 10), s1: rng.range(16, 26), ramp: 'white', r0: 0, r1: 0.5, a0: 0.36, a1: 0, add: false, layer: 1,
    });
  }
  // Eddies along the trail (soft puffs that curl off it and dissolve).
  for (let i = 0; i < 12; i++) {
    const d = rng.range(30, 520);
    env.parts.spawn({
      kind: PK.Smoke, x: EXIT[0] + d, y: flightY(d) + rng.range(-6, 6), vx: rng.range(-20, 40), vy: rng.range(-30, 20), drag: 1.2,
      max: rng.range(0.6, 0.95), s0: rng.range(4, 7), s1: rng.range(14, 24), ramp: 'white', r0: 0.1, r1: 0.6, a0: 0.26, a1: 0, add: false, layer: 0,
    });
  }
  // Turf thrown up by the strike, raining back down.
  for (let i = 0; i < 18; i++) {
    const a = rng.range(-Math.PI * 0.62, -Math.PI * 0.2);
    const v = rng.range(260, 640);
    env.parts.spawn({
      kind: PK.Debris, x: bx + rng.range(-6, 24), y: GY - 2 - rng.range(0, 30), vx: Math.cos(a) * v + 140, vy: Math.sin(a) * v, ay: 1500, drag: 0.6, vrot: rng.range(-12, 12),
      max: rng.range(0.7, 1.1), s0: rng.range(2.2, 4.2), s1: 2, ramp: 'grass', r0: rng.next(), r1: rng.next(), a0: 1, a1: 1, add: false, layer: 1,
    });
  }
  // Dew thrown up with it, glinting as it rains down.
  for (let i = 0; i < 40; i++) {
    const a = rng.range(-Math.PI * 0.7, -Math.PI * 0.15);
    const v = rng.range(200, 700);
    env.parts.spawn({
      kind: PK.Glow, x: bx + rng.range(4, 40), y: by + rng.range(-20, 10), vx: Math.cos(a) * v + 170, vy: Math.sin(a) * v, ay: 1250, drag: 0.7,
      max: rng.range(0.7, 1.15), s0: rng.range(1.6, 3), s1: 1, ramp: 'dew', r0: 0, r1: 0.6, a0: 1, a1: 0.25, layer: 1,
    });
  }
}

function spawnLanding(env: Env) {
  const rng = env.rng;
  const [x] = LAND_TOE;
  env.parts.spawn({ kind: PK.Ring, x: x - 8, y: GY, s0: 8, s1: 46, max: 0.35, k: 0.25, ramp: 'white', r0: 0.2, r1: 1, a0: 0.55, a1: 0, add: false, layer: 0 });
  for (let i = 0; i < 6; i++) {
    const a = rng.range(Math.PI * 1.05, Math.PI * 1.95);
    const v = rng.range(40, 140);
    env.parts.spawn({
      kind: PK.Smoke, x: x - 8 + rng.range(-10, 10), y: GY - 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.3, drag: 3,
      max: rng.range(0.4, 0.8), s0: rng.range(5, 8), s1: rng.range(14, 20), ramp: i % 2 ? 'dust' : 'white', r0: 0.2, r1: 1, a0: i % 2 ? 0.22 : 0.2, a1: 0, add: false, layer: 0,
    });
  }
  for (let i = 0; i < 8; i++) {
    const a = rng.range(-Math.PI * 0.85, -Math.PI * 0.15);
    const v = rng.range(80, 220);
    env.parts.spawn({
      kind: PK.Glow, x: x - 8 + rng.range(-8, 8), y: GY - 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v, ay: 900, drag: 0.8,
      max: rng.range(0.35, 0.6), s0: rng.range(1.5, 2.4), s1: 0.8, ramp: 'dew', r0: 0, r1: 0.6, a0: 0.9, a1: 0, layer: 1,
    });
  }
  // He breathes out as he lands (cold night): a little mist that the wind carries toward goal.
  const [ex, ey] = no10Point(env, 'F9', 'eye', LAND_TOE[0], LAND_TOE[1], D);
  for (let k = 0; k < 4; k++)
    env.parts.spawn({
      kind: PK.Smoke, x: ex + 4 * D + rng.range(-2, 2), y: ey + 5 * D + rng.range(-2, 2), vx: rng.range(30, 80), vy: rng.range(-16, 4), drag: 2,
      max: rng.range(0.3, 0.42), s0: rng.range(4, 7), s1: rng.range(14, 20), ramp: 'white', r0: 0, r1: 0.6, a0: 0.3, a1: 0, add: false, layer: 1,
    });
}

/** Wind in the ball's wake: thin streaks streaming toward goal past him, thinning out. */
function spawnWind(env: Env, t: number, dt: number) {
  const rate = 70 * (1 - smooth01((t - SWAP) / 0.6));
  windAcc += rate * dt;
  const rng = env.rng;
  const c = camAt(t);
  while (windAcc >= 1) {
    windAcc -= 1;
    const y = GY - 8 - Math.pow(rng.next(), 1.6) * 270;
    env.parts.spawn({
      kind: PK.Streak, x: c.x - VW / (2 * c.z) - rng.range(0, 120), y, vx: rng.range(1100, 1700), vy: rng.range(-30, 30),
      max: rng.range(0.35, 0.55), s0: rng.range(1, 2), s1: 0.6, ramp: 'white', r0: 0, r1: 0.6, a0: 0.6, a1: 0, k: 1.8, add: false, layer: 1,
    });
  }
}

// ---------------------------------------------------------------- the shot

export const shotSquash: Shot = {
  name: 'Squash',
  dur: DUR,
  seed: 303,
  muffle: MUFFLE[3],
  rate: rateAt,
  cues: [
    // The boot arriving (a short high swish), the contact, the release before the mute closes, the thin whine of the
    // mute (dry bus), and his breath as he lands (dry bus) with a muffled footfall.
    { at: 0, fn: (env) => env.sfx.whoosh(0.14, 900, 3200, 0.2) },
    { at: HIT, fn: (env) => (env.sfx.kick(1.4), env.sfx.squash(0.5)) },
    { at: REL, fn: (env) => (env.sfx.crack(1.2), env.sfx.boom(1.0)) },
    { at: SWAP, fn: (env) => env.sfx.whine(1.9, 0.12) },
    { at: LAND, fn: (env) => (env.sfx.breath(), env.sfx.kick(0.16)) },
  ],
  prepare() {
    buildCaches();
    for (const k of ['F7', 'F8', 'F8b', 'F9', 'F10'] as const) {
      const f = no10(k);
      if (f) f.a.tinted(f.i, [170, 228, 255]);
    }
  },
  init(env) {
    env.sfx.clearBus();
    buildCaches();
    spin = new BallSpin();
    spin.rotate(0.3, 1, 0.2, 0.7);
    spin.rotate(0, 0, 1, 0.4);
    simT = 0;
    hitSim = -1;
    hitDone = relDone = swapDone = landDone = false;
    windAcc = 0;
    // The world camera at the swap: F7's laces on the screen point where the macro M3's laces are.
    const [mlx, mly] = macroLaces(SWAP);
    C0 = [F7_LACES[0] - (mlx - VW / 2) / Z0, F7_LACES[1] - (mly - VH / 2) / Z0];

    // Static set dressing from its own seeds (independent of the simulation RNG).
    const r = new Rng(3031);
    beads = [];
    // Beads sitting on the ball's crown before contact (they ride the trembling ball), then the crown.
    for (let i = 0; i < 10; i++) {
      const th = r.range(-2.55, -0.55), rho = r.range(0.6, 0.95) * BR;
      const x = Math.cos(th) * rho, y = Math.sin(th) * rho;
      const dir = th - 0.175 * Math.sign(Math.cos(th));
      const v = r.range(900, 1800);
      beads.push({ x, y, vx: Math.cos(dir) * v, vy: Math.sin(dir) * v - 300, r: r.range(3.4, 5), tw: r.range(0, TAU), sit: true });
    }
    for (let i = 0; i < 14; i++) {
      const th = r.range(-2.95, -0.2);
      const x = Math.cos(th) * BR * 0.98, y = Math.sin(th) * BR * 0.98;
      const v = r.range(800, 2100);
      beads.push({ x, y, vx: Math.cos(th) * v, vy: Math.sin(th) * v - 260, r: r.range(2.4, 4.2), tw: r.range(0, TAU), sit: false });
    }
    const rb = new Rng(3032);
    bokeh = [];
    for (let i = 0; i < 17; i++) {
      const low = i >= 13;
      bokeh.push({
        x: rb.range(-30, VW + 30), y: low ? rb.range(MHZ - 30, MHZ - 6) : rb.range(-10, 110), r: low ? rb.range(8, 14) : rb.range(14, 40),
        a: rb.range(0.16, 0.36), cyan: rb.next() < 0.3, ph: rb.range(0, TAU),
      });
    }
    fgDew = [];
    for (let i = 0; i < 9; i++)
      fgDew.push({ x: rb.range(10, VW - 10), y: rb.range(262, 350), r: rb.range(9, 22), a: rb.range(0.1, 0.24), cyan: rb.next() < 0.5, ph: rb.range(0, TAU) });
    const rm = new Rng(3034);
    mBlades = [];
    const greens = ['#1d5a2c', '#2f7d3a', '#3f9a48', '#57b85e'];
    for (let i = 0; i < 120; i++) {
      const front = i >= 80;
      const y = front ? rm.range(TURF_Y + 4, TURF_Y + 26) : rm.range(TURF_Y - 8, TURF_Y + 2);
      const x = rm.range(-20, VW + 20);
      // Short in front of the ball so it never hides the contact.
      const nearBall = Math.abs(x - BALL0X) < 70;
      const h = front ? rm.range(8, nearBall ? 16 : 30) : rm.range(10, 30);
      mBlades.push({ x, y, h, w: rm.range(2, 4), ph: rm.range(0, TAU), c: greens[rm.int(front ? 0 : 1, 3)], dew: rm.next() < 0.18 });
    }
    const rw = new Rng(3021);
    sparklesArr = [];
    for (let i = 0; i < 170; i++) sparklesArr.push({ X: rw.range(-500, 1300), s: rw.range(0.2, 2.1), ph: rw.range(0, TAU), f: rw.range(1.5, 4) });
    bladesArr = [];
    for (let i = 0; i < 300; i++) bladesArr.push({ X: rw.range(-200, 1000), s: rw.range(0.55, 1.9), h: rw.range(5, 12), ph: rw.range(0, TAU), c: rw.next() });

    env.cam.set(VW / 2, VH / 2, 1, 0);
    env.cam.shakeRoll = 0; // GALE keeps every horizon level
    env.cam.shakeAmp = 10;
  },
  update(env, t, dt) {
    simT += dt;
    if (!hitDone && t >= HIT) {
      hitDone = true;
      hitSim = simT;
      spawnContact(env);
    }
    if (!relDone && t >= REL) {
      relDone = true;
      spawnRelease(env);
      env.cam.hit(0.8);
    }
    if (!swapDone && t >= SWAP) {
      swapDone = true;
      // The macro layer's particles live in its own screen space: drop them with it.
      env.parts.clear();
      spawnWorld(env);
      env.cam.hit(0.9);
    }
    if (!landDone && t >= LAND) {
      landDone = true;
      spawnLanding(env);
      env.cam.hit(0.12);
    }
    if (t >= SWAP && t < 1.3) spawnWind(env, t, dt);
    if (t >= SWAP) {
      const c = camAt(t);
      env.cam.set(c.x, c.y, c.z, 0);
    } else env.cam.set(VW / 2, VH / 2, 1, 0);
  },
  render(env, t) {
    const { fx } = env;
    if (t < SWAP) renderMacro(env, t);
    else renderWorld(env, t);

    // Release shock ring at the exit point (screen UV; it keeps expanding across the hidden swap).
    if (t >= REL && t < REL + 0.3) {
      const s = squashAt(REL);
      const k = (t - REL) / 0.3;
      pushShock(fx, { x: (s.cx + 30) / VW, y: s.cy / VH, r: 0.4 * ease.outCubic(k), s: 0.03 * (1 - k) });
    }
    // Flashes: the tail of shot 2's ice flash (no new flash), and the release flash that hides the swap.
    if (t < 0.05) {
      fx.flash = 0.6 * (1 - t / 0.05);
      fx.flashColor = BLINK.ice;
    } else if (t >= REL && t < REL + 0.12) {
      fx.flash = 0.5 * (1 - (t - REL) / 0.12);
      fx.flashColor = BLINK.ice;
    }
  },
};
