// SHOT 2 — THE LOAD (1.9 s). GALE HAMMER's charge-up, the opposite of Zenith's roaring aura: the air around
// the boot is sucked IN and the world holds its breath (SPEC.md §2).
//
// Side view at knee height, floodlit and high-key. No.10 (studio frames at x3: Run R1-R4, Approach AP2, Strike
// F5a / F5b / F6) runs in on one stride and a long bound while the camera trucks with him; the ball rolls its
// last metre onto F5a's ball guide at the plant (0.55). Then the inhale in slow motion (rate 0.12): dew, dust
// and clippings stream to a point just behind the cocked boot, the blades lean to it, three cyan isobars tighten
// round the leg, and the pressure lens pinches the stadium in two ratchet steps (0.85, 1.20: lens notch + dolly
// lurch + isobar snap + ear-pop on one frame, never a pulse). His eyes appear in a dew drop on the ball (1.12),
// the ankle locks (1.48), the pinch springs back as the leg fires (F6, smear arc, cyan focus lines), and an ice
// flash cuts one frame before contact.
//
// Clock: frames, camera, lens and cues run on the unwarped t (the brief's times); the simulation (particles,
// decals, defenders, ball tremble) runs on simT, the warped clock accumulated in update().

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { TAU, Rng, clamp, ease, lerp } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { focusLines } from '../../art/fx';
import { FIELD, drawFieldBackdrop } from '../../art/stadium';
import { P, POSES, RIVAL_KIT, RIVAL_KIT_B, drawPuppet, mixPose, poseAt, renderPuppet, type Pose } from '../../art/puppet';
import {
  BLINK, HEX, MUFFLE, PAL, SEQ, dewMirror, drawBall, drawNo10, drawStamp, galeGrade, isobars, lensAt,
  no10, no10At, no10Point, pressureStamp, smearArc, sparkleCyan, springBack, steps, type No10Key,
} from './common';

const DUR = 1.9;
/** World px per studio px (No.10 at integer x3). */
const D = 3;
/** World y of the soles (studio row 102's bottom edge). */
const GY = 300;
/** Ball art radius (the 12 px ball guide), drawn at D so it sits on the sprite's pixel grid. */
const BALL_R = 6;

// Times (shot-local, unwarped).
const PLANT = 0.55;
const INHALE0 = 0.65;
const RATCHET = [0.85, 1.2] as const;
const RELEASE = 1.55;
const MIRROR0 = 1.12, MIRROR_SHRINK = 1.42, MIRROR1 = 1.5;
const GLINT = 1.3;
const LOCK = 1.48;
const SWING = 1.58;
const ICE = 1.8;
/** Breath puffs on the run-up (R1, and the push into the bound); they are gone by the plant: then he holds it. */
const BREATH_T = [0.06, 0.3] as const;

/** Run-canvas pixel (u, v) -> world. The Strike canvas sits 56 px right of the Run canvas (Strike.json notes). */
const runPt = (u: number, v: number): [number, number] => [u * D, GY + (v - 103) * D];
const strikePt = (u: number, v: number): [number, number] => runPt(u + 56, v);
/** World points where the frames are pinned: the R1-R4 planted toe and the F5a-F7 planted (far) toe. */
const RUN_TOE = runPt(73.5, 103);
const PLANT_TOE = strikePt(76.5, 103);
/** AP2's pelvis path in Run-canvas px (Approach.json), 0.30-0.55: the bound, its centre of mass dipping. */
const AP2_PATH: readonly (readonly [number, number, number])[] = [[0.3, 87, 63], [0.42, 99, 62.5], [0.5, 107, 64.5], [0.55, 112, 66]];

// Camera.
const V_RUN = ((112 - 58) * D) / PLANT; // his average speed over the run-up (world px/s)
const CX0 = 245, CY0 = GY - 146;
const CX1 = 352, CY1 = GY - 58;
const ZOOM1 = 1.7;
/** Camera height above the turf (world px): knee height, lowering through the dolly. */
const HH0 = 54, HH1 = 36;
/** Backdrop (field-art) scale. */
const ZB0 = 2.0;
/** Field-art y of the tier-fascia ribbon board (it passes behind the boot in the final framing, so the pinch reads). */
const RIBBON_Y = 106;

// ---------------------------------------------------------------- module state (reset in init)
let spin = new BallSpin();
let prevBallX = 0;
let simT = 0;
let plantSim = -1;
let planted = false;
let inhaleAcc = 0;
let breaths = [false, false];
let ball: [number, number] = [0, 0];
let boot: [number, number] = [0, 0];
let boot6: [number, number] = [0, 0];
let target: [number, number] = [0, 0];

interface Sparkle { X: number; s: number; ph: number; f: number }
interface GBlade { X: number; s: number; h: number; ph: number; c: number }
let sparklesArr: Sparkle[] = [];
let bladesArr: GBlade[] = [];
let fgBlades: HTMLCanvasElement[] | null = null;

// ---------------------------------------------------------------- pure functions of t

function smooth01(x: number) {
  const u = clamp(x);
  return u * u * (3 - 2 * u);
}

/** Catmull-Rom through AP2_PATH (pelvis, Run-canvas px). */
function ap2Pelvis(t: number): [number, number] {
  const k = AP2_PATH;
  let i = 0;
  while (i < k.length - 2 && t > k[i + 1][0]) i++;
  const a = k[Math.max(0, i - 1)], b = k[i], c = k[i + 1], d = k[Math.min(k.length - 1, i + 2)];
  const u = clamp((t - b[0]) / (c[0] - b[0]));
  const cr = (p0: number, p1: number, p2: number, p3: number) =>
    0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
  return [cr(a[1], b[1], c[1], d[1]), cr(a[2], b[2], c[2], d[2])];
}

interface CamState { x: number; y: number; z: number; hh: number }

/** The camera: trucks with him until the plant (soft lock), dollies in along a low arc 0.65-1.55 with two ratchet
 *  lurches that stay, then a short push toward the ball as the leg fires. */
function camAt(t: number): CamState {
  let x: number;
  if (t < 0.47) x = CX0 + V_RUN * t;
  else {
    const u = Math.min(t - 0.47, 0.13);
    x = CX0 + V_RUN * 0.47 + V_RUN * (u - (u * u) / (2 * 0.13));
  }
  const d = ease.inOutCubic(clamp((t - INHALE0) / (RELEASE - INHALE0)));
  x = lerp(x, CX1, d);
  let y = lerp(CY0, CY1, d) + Math.sin(Math.PI * d) * 14;
  // The plant: the camera absorbs it, a 4 px dip that settles (no spring-back past level).
  if (t >= PLANT) y += 4 * Math.sin(Math.min(Math.PI, (t - PLANT) * 22)) * Math.exp(-(t - PLANT) * 8);
  let z = lerp(1, ZOOM1, d) * steps(t, [[0, 1], [RATCHET[0], 1.02], [RATCHET[1], 1.0404]]);
  const hh = lerp(HH0, HH1, d);
  // The leg fires: a short accelerating push toward the ball.
  const p = ease.inCubic(clamp((t - RELEASE) / (ICE + 0.08 - RELEASE)));
  if (p > 0) {
    const [bx, by] = strikePt(83.5, 96.5);
    x = lerp(x, bx, 0.14 * p);
    y = lerp(y, by, 0.1 * p);
    z *= 1 + 0.06 * p;
  }
  return { x, y, z, hh };
}

/** The ball: rolls its last metre (56 studio px) and stops on F5a's ball guide exactly at the plant. */
function ballAt(t: number, rest: [number, number]): [number, number] {
  const u = clamp(t / PLANT);
  const L = 56 * D;
  return [rest[0] - L * (1 - u) * (1 - u), rest[1]];
}

/** Simulation rate: 1 -> 0.12 over the plant, the inhale at 0.12, accelerating back to 1 over 1.55-1.65. */
function rateAt(t: number) {
  if (t < PLANT) return 1;
  if (t < INHALE0) return 1 - 0.88 * ((t - PLANT) / 0.1);
  if (t < RELEASE) return 0.12;
  if (t < 1.65) return 0.12 + 0.88 * Math.pow((t - RELEASE) / 0.1, 2);
  return 1;
}

/** The pinch: 0 -> -0.10 (ease-in) over 0.65-0.85, ratchet notches to -0.18 / -0.25, springs back at 1.55. */
function lensK(t: number) {
  if (t < INHALE0) return 0;
  if (t < RATCHET[0]) return -0.1 * ease.inQuad((t - INHALE0) / (RATCHET[0] - INHALE0));
  if (t < RELEASE) return steps(t, [[0, -0.1], [RATCHET[0], -0.18], [RATCHET[1], -0.25]]);
  return springBack(t, RELEASE, -0.25, 0.15);
}

/** 0..1 how hard the air is being drawn in (blades, isobars, grade). */
function inhaleAmt(t: number) {
  return smooth01((t - 0.58) / 0.14) * (1 - smooth01((t - RELEASE) / 0.06));
}

/** Integer hash -> [0, 1). */
function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/** Ball tremble toward the boot: +-1 studio px at 20 Hz while the air is drawn in (horizontal, so it never lifts off
 *  the turf; it leans a touch more toward the boot than away). */
function tremble(t: number): [number, number] {
  const a = inhaleAmt(t);
  if (a <= 0 || t >= SWING) return [0, 0];
  const k = Math.round((hash(Math.floor(t * 20)) * 2 - 0.8) * a);
  return [Math.sign(boot[0] - ball[0]) * clamp(k, -1, 1) * D * 0.6, 0];
}

// ---------------------------------------------------------------- drawing helpers

/** World -> screen (logical px), with the camera's current shake. */
function toScreen(env: Env, x: number, y: number): [number, number] {
  const [u, v] = env.cam.toUV(x, y);
  return [u * VW, v * VH];
}

/** Out-of-focus foreground grass (3 variants): two or three leaning blades each, pre-blurred once. */
function makeFgBlades(): HTMLCanvasElement[] {
  const out: HTMLCanvasElement[] = [];
  const shapes = [
    [[30, 34, 8, 6], [70, 60, 22, 5], [112, 18, -8, 6]],
    [[40, 52, -26, 6], [96, 30, 30, 7]],
    [[26, 20, 36, 5], [64, 46, -6, 7], [120, 64, 26, 5]],
  ];
  for (let v = 0; v < 3; v++) {
    const c = document.createElement('canvas');
    c.width = 170;
    c.height = 160;
    const g = c.getContext('2d')!;
    g.filter = 'blur(4px)';
    for (const [bx, tipY, lean, w] of shapes[v]) {
      g.fillStyle = tipY > 40 ? 'rgb(14,38,30)' : 'rgb(8,24,22)';
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

/**
 * The inhale (SPEC: ~120 dust motes, clippings and dew beads streaming to a point just behind the cocked boot,
 * accelerating as they close in): n motes on a ring round the suction point (the lower half lifts off the turf),
 * each accelerating from rest into it and vanishing on arrival (constant acceleration: exact and seek-safe).
 * Life is in simulation seconds (0.06-0.11 under rate 0.12 = 0.5-0.9 s on screen).
 */
function suck(env: Env, n: number) {
  const rng = env.rng;
  const [tx, ty] = target;
  for (let i = 0; i < n; i++) {
    const th = rng.range(0, TAU);
    const r = rng.range(50, 210);
    const x = tx + Math.cos(th) * r, y = Math.min(GY + 4, ty + Math.sin(th) * r * 0.62);
    const T = rng.range(0.06, 0.11);
    const ax = (2 * (tx - x)) / (T * T), ay = (2 * (ty - y)) / (T * T);
    const pick = rng.next();
    if (pick < 0.42)
      env.parts.spawn({ kind: PK.Glow, x, y, ax, ay, max: T, s0: rng.range(2.6, 4.4), s1: 1.4, ramp: 'dew', r0: 0.1, r1: 0.5, a0: 0.95, a1: 0.08, layer: 1 });
    else if (pick < 0.62)
      env.parts.spawn({ kind: PK.Streak, x, y, ax, ay, max: T, s0: 1.3, s1: 0.7, ramp: 'dew', r0: 0.2, r1: 0.6, a0: 0.75, a1: 0.05, k: 0.14, layer: 1 });
    else if (pick < 0.82)
      env.parts.spawn({ kind: PK.Pixel, x, y, ax, ay, max: T, s0: 2, s1: 1.5, ramp: 'white', r0: 0.3, r1: 0.9, a0: 0.7, a1: 0.05, add: false, layer: 1 });
    else
      env.parts.spawn({ kind: PK.Pixel, x, y, ax, ay, max: T, s0: rng.range(2, 3.2), s1: 1.6, ramp: 'grass', r0: rng.range(0, 0.4), r1: 0.6, a0: 1, a1: 0.08, add: false, layer: 1 });
  }
}

/** The plant's puff (8, the brief's dustBurst count): pale dust and cold dew mist, low and soft, so it never hangs as
 *  a brown smudge between boot and ball through the slow motion. */
function plantPuff(env: Env, x: number) {
  const rng = env.rng;
  // A few turf flecks (flat pixels: an outlined debris square reads as dirt specks while it hangs in slow motion).
  for (let i = 0; i < 5; i++) {
    const a = rng.range(-Math.PI * 0.8, -Math.PI * 0.2);
    const sp = rng.range(80, 220);
    env.parts.spawn({
      kind: PK.Pixel, x: x + rng.range(-8, 8), y: GY - 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, ay: 900, drag: 0.6,
      max: rng.range(0.4, 0.7), s0: rng.range(2, 3), s1: 2, ramp: 'grass', r0: rng.range(0, 0.5), r1: 0.8, a0: 1, a1: 0.8, add: false, layer: 1,
    });
  }
  for (let i = 0; i < 8; i++) {
    const a = rng.range(Math.PI * 1.05, Math.PI * 1.95);
    const sp = rng.range(50, 170);
    env.parts.spawn({
      kind: PK.Smoke, x: x + rng.range(-10, 10), y: GY - 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.3, drag: 3,
      max: rng.range(0.45, 0.9), s0: rng.range(6, 10), s1: rng.range(16, 24), ramp: i % 2 ? 'dust' : 'white', r0: 0.2, r1: 1,
      a0: i % 2 ? 0.26 : 0.2, a1: 0, add: false, layer: 0,
    });
  }
}

/** The stands: the shared field backdrop under its own parallax camera, then a floodlit haze over the roof line. */
function drawBackdrop(env: Env, c: CamState, time: number) {
  const ctx = env.ctx;
  const st = env.art.stadium;
  const [hx, hy] = toScreen(env, env.cam.x, GY - c.hh);
  const zb = ZB0 * (1 + (c.z - 1) * 0.28);
  const camXb = 640 + (c.x - CX0) * 0.32;
  env.screen();
  ctx.save();
  ctx.translate(hx, hy);
  ctx.scale(zb, zb);
  ctx.translate(-camXb, -FIELD.horizon);
  drawFieldBackdrop(ctx, st, camXb, FIELD.horizon - hy / zb + VH / (2 * zb), time);
  // Floodlit haze above the roof (no night sky in GALE's frames): navy at the top, lit cobalt-white near the lamps.
  const top = FIELD.horizon - hy / zb - 10;
  const g = ctx.createLinearGradient(0, top, 0, 58);
  g.addColorStop(0, 'rgb(26,44,104)');
  g.addColorStop(0.6, 'rgb(70,106,178)');
  g.addColorStop(1, 'rgb(120,156,214)');
  ctx.fillStyle = g;
  ctx.fillRect(camXb - 420, top, 840, 58 - top);
  // The lamps re-lit over the haze (cool white).
  for (const tx of [120, 620, 1120, 1620]) {
    const x = tx + camXb * 0.5 - 300 + 20;
    if (x < camXb - 420 || x > camXb + 420) continue;
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf([150, 190, 255]), x, -24, 120, 0.45);
    drawGlow(ctx, glowOf([235, 248, 255]), x, -24, 46, 0.8);
    ctx.globalCompositeOperation = 'source-over';
  }
  // Depth haze over the stands: cool and lifted (high-key), so the crowd reads soft and far behind him.
  const hz = ctx.createLinearGradient(0, 58, 0, FIELD.horizon);
  hz.addColorStop(0, 'rgba(70,104,170,0.5)');
  hz.addColorStop(1, 'rgba(150,186,230,0.36)');
  ctx.fillStyle = hz;
  ctx.fillRect(camXb - 420, 58, 840, FIELD.horizon - 58);
  // Tier fronts and aisle stairs (they move with the crowd): a quiet regular grid behind him, so the pressure lens
  // visibly bends the stands round the boot.
  const rx = camXb * 0.25 - 220;
  ctx.fillStyle = 'rgba(8,12,34,0.55)';
  for (let y = 74; y < 160; y += 13) ctx.fillRect(camXb - 420, y, 840, 1.4);
  ctx.fillStyle = 'rgba(190,215,255,0.16)';
  for (let y = 74; y < 160; y += 13) ctx.fillRect(camXb - 420, y - 0.8, 840, 0.8);
  for (let i = Math.floor((camXb - 420 - rx) / 96) - 1, n = i + 11; i < n; i++) {
    ctx.fillStyle = 'rgba(150,170,210,0.32)';
    ctx.fillRect(rx + i * 96 + 40, 64, 3, 96);
  }
  // The tier-fascia LED ribbon (moves with the crowd): one long straight lit band, so the pressure lens visibly
  // bends the stadium behind the boot, notch by notch.
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

/** Ground point at depth s (1 = his plane, < 1 farther, > 1 nearer) for world x X: perspective toward the
 *  vanishing point (camera x, horizon). */
function groundAt(c: CamState, X: number, s: number): [number, number] {
  const hz = GY - c.hh;
  return [c.x + (X - c.x) * s, hz + (GY - hz) * s];
}

function drawGround(env: Env, c: CamState, time: number) {
  const ctx = env.ctx;
  const hz = GY - c.hh;
  const halfW = VW / (2 * c.z) + 60, halfH = VH / (2 * c.z) + 60;
  const L = c.x - halfW, R = c.x + halfW, B = c.y + halfH;
  // Base: hazy and cool at the horizon, floodlit green underfoot.
  const g = ctx.createLinearGradient(0, hz, 0, B);
  const kG = clamp((GY - hz) / (B - hz));
  g.addColorStop(0, '#3d7d5a');
  g.addColorStop(kG * 0.5, '#2f8a40');
  g.addColorStop(kG, '#2d8c3d');
  g.addColorStop(1, '#246f33');
  ctx.fillStyle = g;
  ctx.fillRect(L, hz - 1, R - L, B - hz + 1);
  // Mowing stripes converging on the vanishing point: they slide at full speed in his plane, slower toward the
  // horizon, faster near the lens.
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
  // The far touchline, a thin pale line just under the horizon.
  const [, ty] = groundAt(c, 0, 0.16);
  ctx.fillStyle = 'rgba(235,245,255,0.55)';
  ctx.fillRect(L, ty, R - L, Math.max(1, 1.2 / c.z));
  // Horizon haze band (distance).
  const hb = ctx.createLinearGradient(0, hz - 2, 0, hz + (GY - hz) * 0.45);
  hb.addColorStop(0, 'rgba(170,205,240,0.55)');
  hb.addColorStop(1, 'rgba(170,205,240,0)');
  ctx.fillStyle = hb;
  ctx.fillRect(L, hz - 2, R - L, (GY - hz) * 0.45 + 2);
  // Floodlight pool around him (cool white, soft).
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf([120, 170, 210]), PLANT_TOE[0] - 60, GY, 340, 0.2, 1.6, 0.22);
  // Dew sparkles on the turf (twinkling glints, perspective-placed).
  for (const p of sparklesArr) {
    const x = c.x + (p.X - c.x) * p.s, y = hz + (GY - hz) * p.s;
    if (x < L || x > R || y > B) continue;
    const tw = Math.pow(Math.max(0, Math.sin(p.ph + time * p.f)), 10);
    const sz = Math.max(1 / c.z, 1.1 * p.s);
    ctx.globalAlpha = 0.35 + 0.65 * tw;
    ctx.fillStyle = tw > 0.6 ? HEX.ice : 'rgb(150,220,255)';
    ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz);
    if (tw > 0.75 && p.s > 0.6) {
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      drawGlow(ctx, glowOf(PAL.navy), x, y, 7 * p.s, 0.3 * tw);
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.cyan), x, y, 5 * p.s, 0.35 * tw);
    }
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

/** A set, defensive screen stance for the defenders once they stop backpedalling. */
const SET_POSE: Pose = P({ torso: 0.17, head: -0.1, thighN: 0.3, kneeN: 0.52, thighF: -0.1, kneeF: 0.48, armN: 0.35, elbowN: 0.7, armF: -0.2, elbowF: 0.7 });
const BACKPEDAL: [number, Pose][] = [[0, POSES.run4], [0.25, POSES.run3], [0.5, POSES.run2], [0.75, POSES.run1], [1, POSES.run4]];

/** The two white defenders far behind, backpedalling into a screen near the box (puppets, k 0.7, dimmed). */
function drawDefenders(env: Env, c: CamState) {
  const ctx = env.ctx;
  const S = 0.24; // depth scale vs his plane
  const defs = [
    { kit: RIVAL_KIT, X0: 1180, ph: 0 },
    { kit: RIVAL_KIT_B, X0: 1430, ph: 0.45 },
  ];
  const settle = smooth01((simT - 0.4) / 0.3);
  for (const d of defs) {
    // Backpedal toward their goal (+x), easing into a set screen.
    const X = d.X0 + 260 * Math.min(simT, 0.4) + 40 * settle;
    const cyc = (((simT / 0.34 + d.ph) % 1) + 1) % 1;
    const back = poseAt(BACKPEDAL, cyc);
    const pose = mixPose({ ...back, torso: -0.05 }, SET_POSE, settle);
    const [x, y] = groundAt(c, X, S);
    const k = 0.7;
    const sc = (S * D * 98) / (95 * k); // the puppet is ~95 units tall: match his size at that depth
    const r = renderPuppet(d.kit, pose, { k, facing: -1 });
    drawPuppet(ctx, r, x, y - 40 * k * sc, sc, 0.7);
  }
}

/** Grass blades in perspective rows, leaning toward the suction point (1/distance) while the air is drawn in. */
function drawGrass(env: Env, c: CamState, t: number, front: boolean) {
  const ctx = env.ctx;
  const a = inhaleAmt(t);
  const rel = t >= RELEASE ? smooth01((t - RELEASE) / 0.12) : 0;
  const halfW = VW / (2 * c.z) + 40;
  const hz = GY - c.hh;
  ctx.lineWidth = 1.6;
  for (let pass = 0; pass < 2; pass++) {
    ctx.strokeStyle = pass === 0 ? '#2a6e36' : '#57b85e';
    ctx.beginPath();
    for (const b of bladesArr) {
      if (front !== b.s > 1) continue;
      if ((b.c > 0.5 ? 1 : 0) !== pass) continue;
      const x = c.x + (b.X - c.x) * b.s, y = hz + (GY - hz) * b.s;
      if (x < c.x - halfW || x > c.x + halfW) continue;
      const h = b.h * b.s;
      const dx = target[0] - x, dy = target[1] - (y - h);
      const dist = Math.max(10, Math.hypot(dx, dy));
      let lean = Math.sin(b.ph + t * 2.2) * 0.12;
      lean += clamp((Math.sign(dx) * 70) / dist, -1.15, 1.15) * a;
      lean += 0.7 * rel;
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + Math.sin(lean) * h * 0.4, y - h * 0.6, x + Math.sin(lean) * h, y - Math.cos(lean) * h);
    }
    ctx.stroke();
  }
}

/** No.10's frame and where it is pinned at time t. */
function heroAt(t: number): { key: No10Key; x: number; y: number; anchor?: string } {
  const key = no10At(SEQ[2], t);
  if (key === 'R1' || key === 'R2' || key === 'R3' || key === 'R4') return { key, x: RUN_TOE[0], y: RUN_TOE[1] };
  if (key === 'AP2') {
    const [px, py] = ap2Pelvis(t);
    const [x, y] = runPt(px + 0.5, py + 0.5);
    return { key, x, y, anchor: 'pelvis' };
  }
  return { key, x: PLANT_TOE[0], y: PLANT_TOE[1] };
}

function drawHero(env: Env, t: number) {
  const ctx = env.ctx;
  const h = heroAt(t);
  const o = h.anchor ? { anchor: h.anchor } : {};
  const f = no10(h.key);
  // Contact shadow (navy, soft), tied to the ground under his body.
  const air = h.key === 'AP2' ? 1 : 0;
  const sx = h.key.startsWith('R') ? h.x - 30 : h.key === 'AP2' ? h.x : PLANT_TOE[0] - 60;
  ctx.save();
  ctx.globalAlpha = 0.34 - air * 0.12;
  ctx.fillStyle = HEX.navy;
  ctx.beginPath();
  ctx.ellipse(sx, GY + 1, 78 - air * 16, 7, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
  // Cool floodlight rim: an ice-tinted copy peeking 1 studio px up-left of the sprite.
  if (f) {
    const rim = f.a.tinted(f.i, [170, 228, 255]);
    drawNo10(env, h.key, h.x - D, h.y - D, D, { ...o, alpha: 0.45 }, rim);
  }
  drawNo10(env, h.key, h.x, h.y, D, o);
}

/** The bead on top of the ball (world): a small dew drop, navy-edged, ice highlight. */
function drawBead(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: number) {
  if (a <= 0 || r <= 0.3) return;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(10,18,56,0.7)';
  ctx.beginPath();
  ctx.ellipse(x, y, r + 0.9, r * 0.92 + 0.9, 0, 0, TAU);
  ctx.fill();
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, 0, x, y, r);
  g.addColorStop(0, 'rgb(230,250,255)');
  g.addColorStop(0.6, 'rgb(120,200,245)');
  g.addColorStop(1, 'rgb(40,90,170)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.92, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = HEX.ice;
  ctx.fillRect(x - r * 0.5, y - r * 0.6, Math.max(1, r * 0.4), Math.max(1, r * 0.35));
  ctx.restore();
}

// ---------------------------------------------------------------- the shot

export const shotLoad: Shot = {
  name: 'The load',
  dur: DUR,
  seed: 302,
  muffle: MUFFLE[2],
  rate: rateAt,
  cues: [
    { at: 0, fn: (env) => (env.sfx.crowd(1.9, 0.15), env.sfx.kick(0.15)) },
    // Footfalls on the drawn contacts: R1 lands at 0.00, the bound pushes off at the end of R4 (0.28).
    { at: 0.28, fn: (env) => env.sfx.kick(0.13) },
    { at: PLANT, fn: (env) => (env.sfx.kick(0.45), env.sfx.boom(0.25)) },
    { at: 0.6, fn: (env) => env.sfx.inhale(0.9) },
    { at: RATCHET[0], fn: (env) => env.sfx.earPop(0.6) },
    { at: RATCHET[1], fn: (env) => env.sfx.earPop(0.8) },
    { at: LOCK, fn: (env) => env.sfx.shing(1.4) },
    { at: SWING, fn: (env) => env.sfx.whoosh(0.3, 300, 3000, 0.5) },
  ],
  prepare() {
    if (!fgBlades) fgBlades = makeFgBlades();
    for (const k of ['R1', 'R2', 'R3', 'R4', 'AP2', 'F5a', 'F5b', 'F6'] as const) {
      const f = no10(k);
      if (f) f.a.tinted(f.i, [170, 228, 255]);
    }
  },
  init(env) {
    env.sfx.clearBus();
    spin = new BallSpin();
    spin.rotate(0.3, 1, 0.2, 0.7);
    simT = 0;
    plantSim = -1;
    planted = false;
    inhaleAcc = 0;
    breaths = [false, false];
    if (!fgBlades) fgBlades = makeFgBlades();
    ball = no10Point(env, 'F5a', 'ball', PLANT_TOE[0], PLANT_TOE[1], D);
    boot = no10Point(env, 'F5a', 'boot', PLANT_TOE[0], PLANT_TOE[1], D);
    boot6 = no10Point(env, 'F6', 'boot', PLANT_TOE[0], PLANT_TOE[1], D);
    target = [boot[0] - 3 * D, boot[1] + D];
    prevBallX = ballAt(0, ball)[0];
    // Static set dressing from its own seed (independent of the simulation RNG).
    const r = new Rng(3021);
    sparklesArr = [];
    for (let i = 0; i < 170; i++) sparklesArr.push({ X: r.range(-500, 1300), s: r.range(0.2, 2.1), ph: r.range(0, TAU), f: r.range(1.5, 4) });
    bladesArr = [];
    for (let i = 0; i < 300; i++) bladesArr.push({ X: r.range(-200, 1000), s: r.range(0.55, 1.9), h: r.range(5, 12), ph: r.range(0, TAU), c: r.next() });
    const c = camAt(0);
    env.cam.set(c.x, c.y, c.z, 0);
    env.cam.shakeRoll = 0; // GALE keeps every horizon level
    env.cam.shakeAmp = 10;
  },
  update(env, t, dt) {
    simT += dt;
    // Rolling ball (before the plant): spin from the distance covered.
    const [bx] = ballAt(t, ball);
    const dist = bx - prevBallX;
    if (dist) spin.rotate(0, 0, 1, dist / (BALL_R * D));
    prevBallX = bx;
    // The plant: a mini stamp of flattened grass under the plant foot, a dust puff, a camera knock.
    if (!planted && t >= PLANT) {
      planted = true;
      plantSim = simT;
      pressureStamp(env, PLANT_TOE[0] - 6, GY, 30, { dew: 14, chunks: 0, squash: 0.25 });
      plantPuff(env, PLANT_TOE[0] - 6);
      env.cam.hit(0.25);
    }
    // Cold night: two breath puffs on the run-up (he exhales on the stride), then he holds his breath with the world.
    BREATH_T.forEach((bt, i) => {
      if (breaths[i] || t < bt) return;
      breaths[i] = true;
      const h = heroAt(t);
      const [ex, ey] = no10Point(env, h.key, 'eye', h.x, h.y, D, h.anchor ? { anchor: h.anchor } : {});
      const rng = env.rng;
      for (let k = 0; k < 4; k++)
        env.parts.spawn({
          kind: PK.Smoke, x: ex + 4 * D + rng.range(-2, 2), y: ey + 5 * D + rng.range(-2, 2), vx: rng.range(10, 60), vy: rng.range(-18, 4), drag: 2.2,
          max: rng.range(0.26, 0.36), s0: rng.range(4, 7), s1: rng.range(14, 22), ramp: 'white', r0: 0, r1: 0.6, a0: 0.32, a1: 0, add: false, layer: 1,
        });
    });
    // The inhale field: ~120 motes streaming to the point behind the cocked boot (life in sim seconds).
    if (t >= 0.6 && t < RELEASE) {
      inhaleAcc += dt * 1400 * smooth01((t - 0.6) / 0.08);
      const n = Math.floor(inhaleAcc);
      inhaleAcc -= n;
      if (n > 0) suck(env, n);
    }
    // Wisps of cold air drawn in along the turf toward the boot (soft, slow, never a line).
    if (t >= 0.7 && t < RELEASE && env.rng.next() < dt * 60) {
      const rng = env.rng;
      const side = rng.sign();
      const x = target[0] + side * rng.range(120, 200), y = GY - rng.range(4, 50);
      const T = rng.range(0.1, 0.14);
      env.parts.spawn({
        kind: PK.Smoke, x, y, ax: (2 * (target[0] - x)) / (T * T), ay: (2 * (target[1] - y)) / (T * T), max: T,
        s0: rng.range(14, 22), s1: 4, ramp: 'white', r0: 0.2, r1: 0.6, a0: 0.1, a1: 0.18, add: false, layer: 0,
      });
    }
    const c = camAt(t);
    env.cam.set(c.x, c.y, c.z, 0);
  },
  render(env, t) {
    const { ctx, fx } = env;
    const c = camAt(t);
    const time = simT;
    const inh = inhaleAmt(t);

    // ---- stands (own parallax camera), then the world.
    drawBackdrop(env, c, time);
    env.world();
    drawGround(env, c, time);
    drawDefenders(env, c);
    // Plant stamp decal (sim clock, sped up: it blooms fast, then holds through the slow motion).
    if (plantSim >= 0) drawStamp(ctx, PLANT_TOE[0] - 6, GY + 1, 30, (simT - plantSim) * 4, { squash: 0.25, grow: 0.3, alpha: 0.85 });
    drawGrass(env, c, t, false);
    env.parts.draw(ctx, 0);

    // ---- the hero, then the isobars round the cocked leg.
    drawHero(env, t);
    const iso = smooth01((t - INHALE0) / 0.12) * (1 - smooth01((t - RELEASE) / 0.08));
    if (iso > 0) {
      const isoC = strikePt(40, 70);
      const tight = 1 - 0.3 * clamp((t - INHALE0) / (RELEASE - INHALE0));
      const outer = steps(t, [[0, 1], [RATCHET[0], 0.86], [RATCHET[1], 0.76]]);
      const snapGlow = Math.max(0, ...RATCHET.map((r) => (t >= r ? 1 - clamp((t - r) / 0.16) : 0)));
      isobars(ctx, isoC[0], isoC[1], [13 * D * tight, 18.5 * D * tight], { squash: 0.72, t, alpha: 0.42 * iso, wobble: 0.022, lobes: 4 });
      isobars(ctx, isoC[0], isoC[1], [26 * D * Math.min(tight, outer)], { squash: 0.72, t: t + 0.7, alpha: (0.45 + 0.5 * snapGlow) * iso, wobble: 0.022, lobes: 4 });
    }

    // The suction point: a small compressed-air core behind the heel (navy halo, cyan body, ice core) that steps up
    // with each ratchet and shimmers at 20 Hz while the air pours in; it is released into the smear at 1.55.
    const coreA = inh * (t < RELEASE ? 1 : 0);
    if (coreA > 0) {
      const lvl = steps(t, [[0, 0.55], [RATCHET[0], 0.78], [RATCHET[1], 1]]);
      const sh = 0.85 + 0.15 * hash(Math.floor(t * 20) + 7);
      ctx.save();
      drawGlow(ctx, glowOf(PAL.navy), target[0], target[1], 26 * lvl, 0.45 * coreA);
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.cyan), target[0], target[1], 20 * lvl * sh, 0.5 * coreA);
      drawGlow(ctx, glowOf(PAL.ice), target[0], target[1], 7 * lvl, 0.8 * coreA * sh);
      ctx.restore();
    }

    // ---- the ball (rolling, then trembling toward the boot), its shadow and the dew bead.
    const [bx0, by0] = ballAt(t, ball);
    const [tx, ty] = tremble(t);
    const bx = bx0 + tx, by = by0 + ty;
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = HEX.navy;
    ctx.beginPath();
    ctx.ellipse(bx0, GY + 1, BALL_R * D * 0.95, 4, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
    const charge = clamp((t - INHALE0) / (RELEASE - INHALE0));
    drawBall(env, spin, bx, by, BALL_R, D, 0.08 + 0.12 * charge, 0.15 + 0.25 * inh, 'cobalt');
    const beadTop = by - BALL_R * D + 1.5;
    const mirrorOn = t >= MIRROR0 && t < MIRROR1;
    if (!mirrorOn) {
      const q = t >= MIRROR1 ? Math.exp(-(t - MIRROR1) * 9) * Math.sin((t - MIRROR1) * 70) : 0;
      const br = 4.2 * (1 + 0.28 * q);
      drawBead(ctx, bx - 2, beadTop - br * 0.7, br, smooth01((t - 0.5) / 0.15));
    }

    drawGrass(env, c, t, true);
    env.parts.draw(ctx, 1);

    // ---- the ankle lock: a 4-point cyan sparkle on the laces (drawn in screen space below) + an ice tick across the
    // ankle, where the sock meets the boot.
    const lk = t >= LOCK && t < SWING ? 1 - clamp((t - LOCK) / 0.16) : 0;

    // ---- the release: the smear arc along the heel's path (F5 boot -> F6 boot -> the ball's back).
    if (t >= SWING) {
      const p2: [number, number] = [ball[0] - BALL_R * D, ball[1] + 1];
      const prog = lerp(0.5, 0.97, ease.outCubic(clamp((t - SWING) / (ICE - SWING))));
      const fade = 1 - 0.4 * clamp((t - ICE) / 0.1);
      smearArc(ctx, { x: boot[0], y: boot[1] }, { x: boot6[0], y: boot6[1] }, { x: p2[0], y: p2[1] }, 21, fade, prog);
    }

    // ---- screen space: the dew mirror, focus lines, foreground blades.
    env.screen();
    if (mirrorOn) {
      const [sbx, sby] = toScreen(env, bx - 2, beadTop - 3);
      const ballRs = BALL_R * D * env.cam.zoom;
      const hoverX = sbx + 6, hoverY = sby - ballRs * 0.15 - 34;
      const k = t < MIRROR_SHRINK
        ? ease.outBack(clamp((t - MIRROR0) / (4 / 60)))
        : 1 - ease.inCubic(clamp((t - MIRROR_SHRINK) / (MIRROR1 - MIRROR_SHRINK)));
      const R = lerp(4.2 * env.cam.zoom, 32, k);
      const gl = t >= GLINT ? Math.exp(-(t - GLINT) * 6) * clamp((t - GLINT) / 0.03) : 0;
      dewMirror(env, lerp(sbx, hoverX, clamp(k)), lerp(sby, hoverY, clamp(k)), R, { key: 'G4', scale: 2, glint: gl });
    }
    if (lk > 0) {
      const [lx, ly] = toScreen(env, boot[0], boot[1]);
      drawGlow(ctx, glowOf(PAL.navy), lx, ly, 22, 0.45 * lk);
      sparkleCyan(ctx, lx, ly, 26 * (0.55 + 0.45 * lk), lk, 0.3);
      const [ax0, ay0] = toScreen(env, ...strikePt(39.5, 70.5));
      const [ax1, ay1] = toScreen(env, ...strikePt(44.5, 65.5));
      ctx.save();
      ctx.lineCap = 'round';
      ctx.globalAlpha = 0.7 * lk;
      ctx.strokeStyle = HEX.navy;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ax0, ay0);
      ctx.lineTo(ax1, ay1);
      ctx.stroke();
      ctx.globalAlpha = lk;
      ctx.strokeStyle = HEX.ice;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }
    if (t >= SWING) {
      const [sbx, sby] = toScreen(env, ball[0], ball[1]);
      const fl = ease.inQuad(clamp((t - SWING) / 0.18));
      ctx.save();
      focusLines(ctx, env.frng(23), sbx, sby, 80, 760, 64, HEX.navy, 0.35 * fl, 7);
      ctx.globalCompositeOperation = 'lighter';
      focusLines(ctx, env.frng(23), sbx, sby, 80, 760, 64, HEX.cyan, 0.5 * fl, 4);
      ctx.restore();
    }
    // Out-of-focus blades right at the lens (parallax 1.6), dark soft strips across the bottom edge; they grow and
    // slide outward as the camera dollies in.
    if (fgBlades) {
      const span = VW + 340;
      const zk = Math.pow(env.cam.zoom, 1.3);
      const items = [[40, 0, 1.0], [330, 1, 0.85], [600, 2, 1.1]] as const;
      ctx.globalAlpha = 0.9;
      for (const [x0, v, s] of items) {
        let x = x0 - (env.cam.x - CX0) * 1.6;
        x = ((((x + 170) % span) + span) % span) - 170;
        const cx = VW / 2 + (x - VW / 2) * (1 + (zk - 1) * 0.9);
        const im = fgBlades[v];
        const w = im.width * s * zk, h = im.height * s * zk;
        ctx.drawImage(im, cx - w / 2, VH - h * 0.55, w, h);
      }
      ctx.globalAlpha = 1;
    }

    // ---- post.
    galeGrade(fx, 1, [228, 242, 255], lerp(1.06, 1.12, inh));
    fx.vignette = lerp(0.35, 0.5, inh);
    fx.bloom = 0.9;
    fx.bloomThresh = 0.66;
    fx.ca = 0.0012 + 0.0016 * inh;
    const k = lensK(t);
    if (k) lensAt(env, boot[0], boot[1], k, 0.22);
    if (t < 0.08) {
      fx.flash = 0.6 * (1 - t / 0.08);
      fx.flashColor = BLINK.flashIn;
    } else if (t >= ICE) {
      fx.flash = clamp((t - ICE) / 0.07);
      fx.flashColor = BLINK.ice;
    }
  },
};
