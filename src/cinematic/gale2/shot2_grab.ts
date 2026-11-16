// GALE HAMMER v2 · shot 2 · "Grab the wind" (1.6 s, seed 312): the declaration and the title. SPEC.md §6 shot 2.
//
// Full-frame chest-up in the stormNavy void: No.10 (WindHand busts at x3) thrusts his open palm at the lens and the
// wind pours OUT past us (the camera is punched in by the thrust, then blown back). His fingers curl, the wind slows,
// bends and REVERSES, spiralling into his palm; the camera is sucked toward it in two vacuum lurches. 0.50 the clench:
// every streak is sucked into the fist in 3 frames, a cyan orb ignites between his fingers, the isobars snap in,
// the clench flash (E1) and the vacuum push onto a fist the size of the screen with the orb in it. GALE HAMMER is
// sucked in letter by letter on spiral paths and lands as a near-flat crown across his hair (squash, spring, isobar
// stamp, air-tone motif). 0.75 he yanks the fist to his chest (speed lines) and drags the camera 32 % back with it;
// the fist trembles (WH4 / WH4b) and drinks the storm (pressure rings contracting into it), cyan wisps leak between
// his knuckles, the orb uplights his face. 1.00 the eye glint and a 600 px anamorphic streak. 1.38 a crack of light
// between the knuckles. 1.45 the RING-POP (E2): a thick pressure wave bursts out of the fist and is still crossing the
// frame at the cut, the title shatters outward, the camera is blown back; hard cut 1.60.
//
// Layers (back to front): void + vortex core, the isobar spiral (two contour arms whose turn is the air's flow),
// out / in wind streaks, implosion lines, dew motes, build streaks, pressure rings, cyan backlight, the bust, its
// cyan rim (right) and ice rim (left), the orb's under-light on his body, the orb, knuckle wisps, particles, front
// streaks, yank lines, the crown, eye glint, ring-pop and shards, the tag. Every additive glow sits over the navy void or a navy halo; cobalt is
// only stroke and ring. Deterministic: module state is reset in init(), env.rng only in update(), env.frng() in
// render(), one-shot spawns behind flags; every drawn shape is a pure function of the shot clock.

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { TAU, clamp, ease, lerp, type RGB } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import { AIR_TONES } from '../../engine/audio';
import { PIXEL_FONT, TITLE_FONT, focusLines, lensFlare, sparkle } from '../../art/fx';
import { drawNo10, no10, no10Point, type No10Key } from '../../art/no10';
import type { StudioAnim } from '../../art/studioAnim';
import { holdTrauma, keys, punch, pushShock, ring, zoomAbout, type KeyRow } from '../kit';
import { BLINK, HEX, MUFFLE, PAL, RATE, SEQ, SHOTS, SHOT_NAME, galeStorm, no10At, warmGale } from './common';
import { anamorphic, implosionLines } from './air';

const META = SHOTS[1];
const DUR = META.dur;

// ---------------------------------------------------------------- beats (shot-local t, unwarped; rate is 1)

const T_CURL = 0.28; // WH2: fingers curl, the wind reverses
const T_CLENCH = 0.5; // WH3: the clench (E1)
const T_TITLE = 0.52; // first letter leaves the frame edge
const T_YANK = 0.75; // WH4: the fist yanked to the chest
const T_TAG = 0.9;
const T_GLINT = 1.0;
const T_CRACK = 1.38;
const T_POP = 1.45; // the ring-pop (E2)
const T_GULPS = [1.14, 1.32] as const; // the hold's vacuum gulps (E_TRACK rows; each lurch fills the 2 frames before)

// ---------------------------------------------------------------- layout (world = the bust drawn at x3)

/** Studio draw scale of the WindHand bust (a bust at 2x figure scale: x3 = a 6x figure close-up). */
const SC = 3;
/** World position of the bust's chest (sternum) anchor. */
const CHEST: [number, number] = [320, 270];
const FRAME = 1 / 60;

/**
 * The camera. E = effective screen px per studio px (cam.zoom = E / 3); the tracked point (the palm / fist) is held
 * on a screen point (FSX, FSY). The camera breathes with the air: punched in by the palm thrust (0.00-0.07), blown
 * back by the outward wind (to 0.28), sucked toward the hand in two 2-frame vacuum lurches (0.44 +8 %, the clench 0.50
 * +17 %) plus a punch (the fist fills the frame), dragged 32 % back by the yank of the fist to the chest (0.75-0.88),
 * two more vacuum gulps under the tremor as the fist drinks the storm (1.14 +4 %, 1.32 +5 %), and blown back by the
 * ring-pop (1.45-1.60, 'blowBack', still moving at the cut).
 */
const E_TRACK: readonly KeyRow[] = [
  [0, 3.3],
  [0.07, 3.86, 'outExpo'],
  [0.28, 3.68, 'outQuad'],
  [0.4, 3.74, 'linear'],
  [0.44, 4.05, 'vacuum'],
  [0.5, 4.75, 'vacuum'],
  [0.75, 4.85, 'linear'],
  [0.88, 3.3, 'outCubic'],
  // The hold: the fist drinks the storm in two vacuum gulps (GALE's suction grammar), then holds into the pop.
  [1.12, 3.36, 'linear'],
  [1.14, 3.5, 'vacuum'],
  [1.3, 3.54, 'linear'],
  [1.32, 3.7, 'vacuum'],
  [1.42, 3.74, 'linear'],
  [1.45, 3.74, 'linear'],
  // The ring-pop blows the camera back (GALE's own preset: still moving at the cut).
  [1.6, 2.45, 'blowBack'],
];
/** cam.zoom at t (pure: the same track frameCam applies). */
const zoomAt = (t: number) => (keys(E_TRACK, t) + punch(t, T_CLENCH, 0.24, 0.02, 0.26)) / SC;
const FSX: readonly KeyRow[] = [[0, 290], [0.28, 292, 'linear'], [0.5, 300, 'vacuum'], [0.75, 300, 'linear'], [0.88, 312, 'outCubic'], [1.6, 312, 'linear']];
const FSY: readonly KeyRow[] = [
  [0, 262], [0.28, 266, 'linear'], [0.5, 285, 'vacuum'], [0.75, 285, 'linear'], [0.88, 280, 'outCubic'], [1.42, 284, 'inOutQuad'], [1.6, 272, 'outCubic'],
];

// ---------------------------------------------------------------- module state (reset in init)

let P_PALM: [number, number] = [278, 264];
let P_FIST3: [number, number] = [278, 264];
let P_FIST4: [number, number] = [302, 285];
let clenched = false;
let popped = false;
let yanked = false;
let thrust = false;
let landed: boolean[] = [];

/** Frame-stable hash in [0, 1). */
const hash = (n: number) => {
  const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
};
const L2 = (a: [number, number], b: [number, number], u: number): [number, number] => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];

/** World point of anchor `name` of WindHand frame `key` (the bust drawn with its chest on CHEST at SC). */
function anchorW(env: Env, key: No10Key, name: string): [number, number] {
  return no10Point(env, key, name, CHEST[0], CHEST[1], SC, { anchor: 'chest' });
}

function measure(env: Env) {
  P_PALM = anchorW(env, 'WH1', 'palm');
  P_FIST3 = anchorW(env, 'WH3', 'fist');
  P_FIST4 = anchorW(env, 'WH4', 'fist');
}

/** 0 → 1 as the fist is yanked from arm's length to the chest (0.75-0.88, outCubic). */
const yankK = (t: number) => ease.outCubic(clamp((t - T_YANK) / 0.13));
/** The point the camera tracks: the palm, then the fist (it follows the yank). */
function trackW(t: number): [number, number] {
  return t < T_CLENCH ? L2(P_PALM, P_FIST3, clamp((t - 0.3) / 0.2)) : L2(P_FIST3, P_FIST4, yankK(t));
}
/** The fist the title crown, the orb and the ring-pop centre on. */
const fistW = (t: number): [number, number] => L2(P_FIST3, P_FIST4, yankK(t));

function frameCam(env: Env, t: number) {
  const [wx, wy] = trackW(t);
  zoomAbout(env.cam, wx, wy, keys(FSX, t), keys(FSY, t), zoomAt(t));
}

/** World -> screen (with the camera's shake, shove and buffet). */
function toScreen(env: Env, w: [number, number]): [number, number] {
  const [u, v] = env.cam.toUV(w[0], w[1]);
  return [u * VW, v * VH];
}

// ---------------------------------------------------------------- the wind's clock

/**
 * The air's flow coordinate (loops travelled inward): the isobars pour OUT while the palm pushes the wind at us,
 * slow and stop as the fingers curl, pour IN accelerating to the clench, snap in at the clench, keep tightening while
 * the fist holds the storm, and blow OUT at the ring-pop. Integrated once at load (pure function of t).
 */
const FLOW_DT = 1 / 240;
const FLOW: number[] = (() => {
  const v = (t: number) => {
    if (t < 0.2) return -1.7;
    if (t < 0.3) return lerp(-1.7, 0, (t - 0.2) / 0.1);
    if (t < T_CLENCH) return 4.2 * ease.inQuad((t - 0.3) / 0.2);
    if (t < 0.62) return lerp(4.2, 2.0, ease.outQuad((t - T_CLENCH) / 0.12));
    // The inflow keeps pouring while the letters are sucked in, settles for the hold, then builds into the pop.
    if (t < T_POP) return 2.0 - 1.3 * clamp((t - 0.75) / 0.15) + 0.6 * clamp((t - 1.05) / 0.35);
    return -10;
  };
  const out = [0];
  for (let i = 1; i * FLOW_DT <= DUR + 0.05; i++) out.push(out[i - 1] + v((i - 0.5) * FLOW_DT) * FLOW_DT);
  return out;
})();
function flowAt(t: number) {
  const x = clamp(t / FLOW_DT, 0, FLOW.length - 1.001);
  const i = Math.floor(x);
  const snap = 0.6 * clamp((t - (T_CLENCH - 2 * FRAME)) / (2 * FRAME));
  // The isobars snap a quarter loop inward with each of the hold's two vacuum gulps.
  let gulp = 0;
  for (const g of T_GULPS) gulp += 0.25 * clamp((t - (g - 2 * FRAME)) / (2 * FRAME));
  return lerp(FLOW[i], FLOW[i + 1], x - i) + snap + gulp;
}

/** How hard the hand is sucking (0..1): rises from the curl to the clench, held while the fist holds the storm. */
const suck = (t: number) => (t < T_CURL ? 0 : t < T_CLENCH ? ease.inQuad((t - T_CURL) / (T_CLENCH - T_CURL)) : t < T_POP ? lerp(1, 0.7, clamp((t - T_CLENCH) / 0.3)) : 0);

// ---------------------------------------------------------------- background: the void and the isobar spiral

function drawVoid(ctx: CanvasRenderingContext2D, cx: number, cy: number, k: number, t: number) {
  ctx.fillStyle = HEX.stormNavy;
  ctx.fillRect(-20, -20, VW + 40, VH + 40);
  // The eye of the vortex: a cold navy-cyan core round the hand, brighter as the hand sucks.
  const b = 0.45 + 0.55 * suck(t);
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 360 * k);
  g.addColorStop(0, `rgba(36,92,168,${0.55 * b})`);
  g.addColorStop(0.3, `rgba(18,44,104,${0.5 * b})`);
  g.addColorStop(0.7, `rgba(10,20,60,${0.35 * b})`);
  g.addColorStop(1, 'rgba(6,11,36,0)');
  ctx.fillStyle = g;
  ctx.fillRect(-20, -20, VW + 40, VH + 40);
}

const ARMS = 2;
const TURNS = 4.6;
const R_CORE = 12;
const SPIRAL_B = Math.log(720 / R_CORE) / (TURNS * TAU);
/**
 * The giant isobar spiral round the hand: two interleaved logarithmic contour arms (2-3 px cyan, ice near the core,
 * alpha <= 0.7) over navy halos with a faint cyan bloom band, wobbling sin(5θ + 3t). Turning the arms is the air's
 * flow (flowAt): one loop spacing per half turn, counter-clockwise on screen while the hand sucks (the contours
 * tighten), clockwise while the palm pushes the wind out and at the ring-pop. A pure function of t.
 */
function drawLoops(ctx: CanvasRenderingContext2D, cx: number, cy: number, k: number, t: number, a: number) {
  const F = flowAt(t);
  const N = 240, CH = 12;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let arm = 0; arm < ARMS; arm++) {
    const rot = -F * (TAU / ARMS) + arm * (TAU / ARMS) + 0.4;
    const pt = (q: number): [number, number] => {
      const th = (q / N) * TURNS * TAU;
      const psi = rot - th;
      const r = R_CORE * k * Math.exp(SPIRAL_B * th) * (1 + 0.045 * Math.sin(5 * psi + 3 * t + arm * 1.7));
      return [cx + Math.cos(psi) * r, cy + Math.sin(psi) * r * 0.94];
    };
    for (let c0 = 0; c0 < N; c0 += CH) {
      const sm = (c0 + CH / 2) / N;
      const fade = clamp(sm / 0.07) * clamp((1 - sm) / 0.3);
      if (fade <= 0.01) continue;
      const w = sm < 0.45 ? 3 : 2;
      const line = () => {
        ctx.beginPath();
        for (let q = c0; q <= Math.min(N, c0 + CH); q++) {
          const [x, y] = pt(q);
          q === c0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
      };
      line();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.5 * fade * a;
      ctx.strokeStyle = HEX.navy;
      ctx.lineWidth = w + 5;
      ctx.stroke();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = (sm < 0.45 ? 0.14 : 0.07) * fade * a;
      ctx.strokeStyle = HEX.cyan;
      ctx.lineWidth = w + 10;
      ctx.stroke();
      ctx.globalAlpha = 0.7 * fade * a;
      ctx.strokeStyle = sm < 0.3 ? HEX.ice : HEX.cyan;
      ctx.lineWidth = w;
      ctx.stroke();
    }
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
}

// ---------------------------------------------------------------- the wind streaks

const N_OUT = 80;
/** Out-streak i at time t, polar round the palm: [r, θ] (screen px at k = 1). Pours out, slows, curls, stops. */
function outPos(i: number, t: number): [number, number] {
  const th = hash(i * 1.71) * TAU, r0 = 18 + hash(i * 3.3) * 210, s = 6 + hash(i * 5.7) * 3.5;
  const P = t < 0.2 ? t : t < 0.3 ? 0.2 + (t - 0.2) - (t - 0.2) ** 2 / 0.2 : 0.25;
  const curl = -1.1 * ease.inOutQuad(clamp((t - 0.19) / 0.15)) * (0.6 + 0.4 * hash(i * 9.1));
  return [r0 * Math.exp(s * P), th + curl];
}
/** In-streak i: from the frame edge, spiralling counter-clockwise into the hand, all gone 3 frames after the clench. */
function inPos(i: number, t: number): [number, number] | null {
  const s0 = 0.26 + hash(i * 2.9) * 0.1;
  if (t < s0) return null;
  // The reversal: each in-streak starts where its out-streak stopped (capped on screen, so the turn reads at once).
  const [r1, th] = outPos(i, 0.3);
  const R0 = Math.min(r1, 170 + hash(i * 4.1) * 260);
  const h = t <= T_CLENCH ? 0.62 * ease.inQuad((t - s0) / (T_CLENCH - s0)) : 0.62 + 0.38 * Math.pow(clamp((t - T_CLENCH) / (3 * FRAME)), 1.2);
  return [R0 * (1 - h), th - 2.4 * h];
}

function streakLine(ctx: CanvasRenderingContext2D, pts: [number, number][], w: number, a: number, col: string) {
  if (a <= 0.01 || pts.length < 2) return;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const line = () => {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let q = 1; q < pts.length; q++) ctx.lineTo(pts[q][0], pts[q][1]);
  };
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 0.45 * a;
  ctx.strokeStyle = HEX.navy;
  ctx.lineWidth = w + 3;
  line();
  ctx.stroke();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = a;
  ctx.strokeStyle = col;
  ctx.lineWidth = w;
  line();
  ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
}

/** The wind streaks round the hand at screen (cx, cy). front: the near quarter (thicker, drawn over him). */
function drawStreaks(ctx: CanvasRenderingContext2D, cx: number, cy: number, k: number, t: number, front: boolean) {
  const P = (r: number, th: number): [number, number] => [cx + Math.cos(th) * r * k, cy + Math.sin(th) * r * k];
  if (t < 0.38) {
    const fade = 1 - clamp((t - 0.27) / 0.1);
    for (let i = 0; i < N_OUT; i++) {
      if ((i % 4 === 0) !== front) continue;
      const pts: [number, number][] = [];
      for (const d of [0, 0.014, 0.028, 0.042]) {
        const [r, th] = outPos(i, Math.max(0, t - d));
        pts.push(P(r, th));
      }
      const r = outPos(i, t)[0];
      if (r * k > 900 || (front && r * k < 120)) continue;
      const w = (front ? 3 : 1.5) + 3.5 * clamp((r * k) / 420);
      streakLine(ctx, pts, w, fade * clamp(r / 40) * (front ? 1 : 0.85), i % 3 ? HEX.ice : HEX.cyan);
    }
  }
  // The ring-pop blasts the held wind back out past the lens (the out-streaks again, faster, until the cut).
  if (t >= T_POP) {
    const tb = (t - T_POP) * 1.3 + 0.03;
    for (let i = 0; i < N_OUT; i++) {
      if ((i % 3 === 0) !== front) continue;
      const pts: [number, number][] = [];
      for (const d of [0, 0.01, 0.02, 0.03]) {
        const [r, th] = outPos(i + 17, Math.max(0, tb - d));
        pts.push(P(r * 1.6, th));
      }
      const r = outPos(i + 17, tb)[0] * 1.6;
      if (r * k > 900) continue;
      streakLine(ctx, pts, (front ? 3 : 1.5) + 3.5 * clamp((r * k) / 420), clamp((t - T_POP) / 0.03), i % 3 ? HEX.ice : HEX.cyan);
    }
  }
  if (t >= 0.26 && t < T_CLENCH + 4 * FRAME) {
    for (let i = 0; i < N_OUT; i++) {
      if ((i % 5 === 0) !== front) continue;
      const pts: [number, number][] = [];
      const dd = t < T_CLENCH ? 0.02 : 0.006;
      for (const d of [0, dd, 2 * dd, 3 * dd]) {
        const p = inPos(i, t - d);
        if (p) pts.push(P(p[0], p[1]));
      }
      const p = inPos(i, t);
      if (!p || pts.length < 2) continue;
      const a = clamp((t - 0.26 - hash(i * 2.9) * 0.1) / 0.05) * clamp((p[0] - 6) / 30) * (t < T_CLENCH ? 1 : 0.7);
      streakLine(ctx, pts, (front ? 3 : 1.5) + 2.5 * clamp((p[0] * k) / 360), a, i % 3 ? HEX.ice : HEX.cyan);
    }
  }
}

/**
 * 0.55-1.45: the fist keeps drawing the storm in: thin streaks spiralling into it (with the letters from 0.55, so the
 * money-shot frames never sit on still navy), faster, thicker and denser from 1.00 into the pop.
 */
function drawBuild(ctx: CanvasRenderingContext2D, cx: number, cy: number, k: number, t: number) {
  if (t < 0.55 || t >= T_POP) return;
  const build = clamp((t - 1.0) / 0.45);
  for (let i = 0; i < 36; i++) {
    const per = 0.34 - 0.14 * build;
    const ph = (t / per + hash(i * 6.6)) % 1;
    const R0 = 260 + hash(i * 1.9) * 280, th0 = hash(i * 3.7) * TAU;
    const pos = (p: number): [number, number] => {
      const h = ease.inQuad(clamp(p));
      const r = R0 * (1 - h) + 10;
      const th = th0 - 2.2 * h;
      return [cx + Math.cos(th) * r * k, cy + Math.sin(th) * r * k];
    };
    const pts = [pos(ph), pos(ph - 0.08), pos(ph - 0.16), pos(ph - 0.24)];
    const a = Math.sin(Math.PI * ph) * (0.65 + 0.25 * build) * clamp((t - 0.55) / 0.08);
    streakLine(ctx, pts, 2.5 + 2 * build, a, i % 3 ? HEX.ice : HEX.cyan);
  }
}

/** 0.80-1.45 the fist drinks the storm: three pressure rings contract into it, quickening into the pop (local, low contrast). */
function drawDrink(ctx: CanvasRenderingContext2D, cx: number, cy: number, k: number, t: number) {
  if (t < 0.8 || t >= T_POP) return;
  const b = clamp((t - 0.8) / 0.1) * (0.8 + 0.2 * clamp((t - 1.0) / 0.45));
  // The period shortens 0.32 -> 0.16 s over 0.80-1.45; the phase is its integral (cycles = ln(0.32 / period) / slope),
  // so each ring really takes `period` to fall in (never faster than 6.25 Hz).
  const slope = (0.32 - 0.16) / 0.65;
  const per = lerp(0.32, 0.16, clamp((t - 0.8) / 0.65));
  const cyc = Math.log(0.32 / per) / slope;
  ctx.lineCap = 'round';
  for (let q = 0; q < 3; q++) {
    const ph = ((cyc + q / 3) % 1 + 1) % 1;
    const r = lerp(340, 36, ease.inQuad(ph)) * k;
    const a = b * Math.sin(Math.PI * ph);
    const ring = () => { ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 0.94, 0, 0, TAU); };
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.4 * a; ctx.strokeStyle = HEX.navy; ctx.lineWidth = 16; ring(); ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.32 * a; ctx.strokeStyle = HEX.cyan; ctx.lineWidth = 10 + 16 * ph; ring(); ctx.stroke();
    ctx.globalAlpha = 0.85 * a; ctx.strokeStyle = HEX.ice; ctx.lineWidth = 2.5; ring(); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.lineCap = 'butt';
}

/** Dew motes drifting in with the air (1-2 px ice glints), a pure function of the flow. */
function drawMotes(ctx: CanvasRenderingContext2D, cx: number, cy: number, k: number, t: number) {
  const F = flowAt(t);
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 44; i++) {
    let u = (hash(i * 7.7) - F * 0.09) % 1;
    if (u < 0) u += 1;
    const r = (30 + u * 560) * k, th = hash(i * 3.1) * TAU - F * 0.35 - 0.5 * t;
    const a = clamp(u / 0.1) * clamp((1 - u) / 0.2) * (0.5 + 0.5 * Math.sin(t * 9 + i));
    if (a <= 0.05) continue;
    ctx.globalAlpha = a;
    ctx.fillStyle = i % 5 ? HEX.ice : HEX.cyan;
    const q = i % 3 ? 1 : 2;
    ctx.fillRect(Math.round(cx + Math.cos(th) * r), Math.round(cy + Math.sin(th) * r), q, q);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

// ---------------------------------------------------------------- the bust's light (rim + the orb's under-light)

const rimCache = new Map<string, HTMLCanvasElement>();
/** Edge pixels of frame i facing `dir` (+1 = screen right), solid colour c (1 px full, 2nd px half). Cached. */
function rimOf(a: StudioAnim, i: number, dir: 1 | -1, c: RGB): HTMLCanvasElement {
  const key = `${a.name}|${i}|${dir}|${c.join(',')}`;
  let cv = rimCache.get(key);
  if (cv) return cv;
  const f = a.frames[i], w = a.w, h = a.h;
  cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const g = cv.getContext('2d')!;
  const im = g.createImageData(w, h);
  const op = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && f.px[(y * w + x) * 4 + 3] > 0;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (!op(x, y)) continue;
      const al = !op(x + dir, y) ? 255 : !op(x + dir, y - 1) ? 170 : !op(x + 2 * dir, y) ? 120 : 0;
      if (!al) continue;
      const o = (y * w + x) * 4;
      im.data[o] = c[0];
      im.data[o + 1] = c[1];
      im.data[o + 2] = c[2];
      im.data[o + 3] = al;
    }
  g.putImageData(im, 0, 0);
  rimCache.set(key, cv);
  return cv;
}

const gapCache = new Map<string, HTMLCanvasElement>();
/**
 * The light between his fingers: the dark interior lines of the fist (finger gaps, the knuckle row, the thumb line)
 * within an ellipse round art point (cx, cy), recoloured ice at the centre -> cyan at the rim, alpha falling off.
 * Interior only (all four neighbours opaque), so the silhouette's own outline never glows. Cached per frame.
 */
function gapOf(a: StudioAnim, i: number, cx: number, cy: number): HTMLCanvasElement {
  const key = `${a.name}|${i}|${cx},${cy}`;
  let cv = gapCache.get(key);
  if (cv) return cv;
  const f = a.frames[i], w = a.w, h = a.h;
  cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const g = cv.getContext('2d')!;
  const im = g.createImageData(w, h);
  const A = (x: number, y: number) => (x >= 0 && y >= 0 && x < w && y < h ? f.px[(y * w + x) * 4 + 3] : 0);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      if (!f.px[o + 3]) continue;
      const d = Math.hypot((x - cx) / 17, (y - cy) / 11);
      if (d > 1) continue;
      const L = f.px[o] * 0.3 + f.px[o + 1] * 0.59 + f.px[o + 2] * 0.11;
      if (L > 70 || !A(x + 1, y) || !A(x - 1, y) || !A(x, y + 1) || !A(x, y - 1)) continue;
      const c = d < 0.2 ? PAL.ice : PAL.cyan;
      im.data[o] = c[0];
      im.data[o + 1] = c[1];
      im.data[o + 2] = c[2];
      im.data[o + 3] = Math.round(255 * (1 - 0.65 * d * d));
    }
  g.putImageData(im, 0, 0);
  gapCache.set(key, cv);
  return cv;
}

let litCv: HTMLCanvasElement | null = null;
/** Frame i tinted c, masked by a radial falloff round art point (lx, ly) of radius r (the orb lighting his body). */
function litOf(a: StudioAnim, i: number, lx: number, ly: number, r: number, c: RGB): HTMLCanvasElement {
  if (!litCv) {
    litCv = document.createElement('canvas');
    litCv.width = a.w;
    litCv.height = a.h;
  }
  const g = litCv.getContext('2d')!;
  g.globalCompositeOperation = 'source-over';
  g.clearRect(0, 0, litCv.width, litCv.height);
  g.drawImage(a.tinted(i, c), 0, 0);
  g.globalCompositeOperation = 'destination-in';
  const gr = g.createRadialGradient(lx, ly, 0, lx, ly, r);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.45, 'rgba(255,255,255,0.45)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, litCv.width, litCv.height);
  g.globalCompositeOperation = 'source-over';
  return litCv;
}

/** The bust with its light: back glow, the figure, the cyan rim (right) and ice rim (left), the orb's under-light. */
function drawBust(env: Env, key: No10Key, t: number) {
  const ctx = env.ctx;
  const f = no10(key);
  const head = f ? anchorW(env, key, 'head') : [CHEST[0], CHEST[1] - 150];
  // Cold backlight behind the head and shoulders (additive, over the navy void).
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.cyan), head[0] + 10, head[1] + 30, 190, 0.16 + 0.1 * suck(t));
  ctx.globalCompositeOperation = 'source-over';
  drawNo10(env, key, CHEST[0], CHEST[1], SC, { anchor: 'chest' });
  if (!f) return;
  const pivot = f.a.anchorOf(f.i, 'chest');
  ctx.globalCompositeOperation = 'lighter';
  overlay(ctx, rimOf(f.a, f.i, 1, PAL.cyan), pivot, 0.55);
  overlay(ctx, rimOf(f.a, f.i, -1, PAL.ice), pivot, 0.18 + 0.12 * suck(t));
  // The orb lights him from the fist (after the clench): cyan on the knuckles, the forearm, the chin.
  if (t >= T_CLENCH) {
    const fa = f.a.frames[f.i].anchors.fist ?? f.a.frames[f.i].anchors.palm;
    if (fa) {
      const flick = 0.85 + 0.15 * env.frng(3).next();
      const pulseK = t < T_CLENCH + 0.12 ? 1.6 - 0.6 * ((t - T_CLENCH) / 0.12) : 1;
      const pop = t >= T_POP ? (t < T_POP + 2 * FRAME ? 1.4 : Math.max(0.35, 1 - (t - T_POP - 2 * FRAME) / 0.06)) : 1;
      const lit = litOf(f.a, f.i, fa[0] + 0.5, fa[1] + 0.5, 40, PAL.cyan);
      // The under-light spreads over his knuckles only once the ignition has settled (0.54-0.64): stacked on the
      // igniting orb, additive cyan over his skin bleaches the fist white, so the clench frames stay skin + dark outlines.
      const litIn = ease.inOutQuad(clamp((t - T_CLENCH - 0.04) / 0.1));
      overlay(ctx, lit, pivot, Math.min(1, 0.26 * litIn * flick * pop));
      // Light leaking between his fingers (the orb is inside the fist).
      const crack = t >= T_CRACK && t < T_POP ? (t - T_CRACK) / (T_POP - T_CRACK) : 0;
      const gaps = gapOf(f.a, f.i, fa[0], fa[1]);
      overlay(ctx, gaps, pivot, Math.min(1, (0.5 + 0.4 * crack) * flick * Math.min(1.2, pulseK) * Math.min(1, pop)));
      if (crack > 0 || pop > 1) overlay(ctx, gaps, pivot, Math.min(1, crack + (pop - 1)));
    }
  }
  ctx.globalCompositeOperation = 'source-over';
}
/** Draw a derived 128 x 128 image of the bust (rim, light) exactly over it: its pivot on CHEST at SC. */
function overlay(ctx: CanvasRenderingContext2D, img: HTMLCanvasElement, pivot: [number, number], alpha: number) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = clamp(alpha);
  ctx.translate(CHEST[0], CHEST[1]);
  ctx.scale(SC, SC);
  ctx.drawImage(img, -pivot[0], -pivot[1]);
  ctx.restore();
}

// ---------------------------------------------------------------- the orb in the fist, the wisps, the crack

function drawOrb(env: Env, t: number) {
  if (t < T_CLENCH) return;
  const ctx = env.ctx;
  const [x, y] = fistW(t);
  const z = env.cam.zoom;
  const fr = env.frng(5);
  const ign = t < T_CLENCH + 0.1 ? 1 + 0.6 * (1 - (t - T_CLENCH) / 0.1) : 1;
  const hold = 1 + 0.08 * Math.sin(t * 38) + 0.06 * (fr.next() - 0.5);
  const crack = t >= T_CRACK && t < T_POP ? (t - T_CRACK) / (T_POP - T_CRACK) : 0;
  // At the ring-pop the stored light leaves the fist with the ring: a 2-frame burst, then the orb is spent.
  const pop = t >= T_POP ? (t < T_POP + 2 * FRAME ? 1 : 0) : 0;
  // A burnt core stays in the fist until the cut (the orb never fully dies before the hard cut).
  const spent = t >= T_POP ? 0.6 * clamp((t - T_POP - 2 * FRAME) / 0.06) : 0;
  const R = ((t < T_YANK ? 30 : 27) / z) * ign * hold * (1 + 0.25 * crack + 0.6 * pop) * (1 - 0.6 * spent); // 40 px across on screen
  ctx.globalCompositeOperation = 'source-over';
  // A navy pocket first, so the orb reads as a cyan light between dark knuckles (never a white slab).
  drawGlow(ctx, glowOf(PAL.navy), x, y, R * 2.8, 0.5 * (1 - spent));
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.cyan), x, y, R * 2.2, 0.42 * Math.min(1.6, ign) * (1 - spent));
  drawGlow(ctx, glowOf(PAL.cyan), x, y, R * 1.1, 0.14 * Math.min(1.6, ign) * (1 - spent));
  drawGlow(ctx, glowOf(PAL.ice), x, y, R * 0.3, (0.1 + 0.35 * crack + 0.3 * pop) * (1 - spent));
  // Two tilted isobar rings wrapping the orb, turning.
  ctx.lineWidth = 1.2 / z;
  for (let q = 0; q < 2; q++) {
    const tilt = t * 2.4 + q * 1.7;
    ctx.globalAlpha = 0.65 * (1 - Math.max(pop, spent));
    ctx.strokeStyle = q ? HEX.ice : HEX.cyan;
    ctx.beginPath();
    ctx.ellipse(x, y, R * 1.9, R * 1.9 * (0.25 + 0.2 * Math.abs(Math.cos(tilt))), q * 0.9 - 0.4, 0, TAU);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

/**
 * Eight thin cyan wisps leaking out between his knuckles (from 0.87): filaments of wind that escape the knuckle row
 * and are swept counter-clockwise round the fist (the storm he is holding), growing as they leak, then fading.
 */
function drawWisps(env: Env, t: number) {
  if (t < 0.84 || t >= T_POP) return;
  const ctx = env.ctx;
  const [x, y] = fistW(t);
  const z = env.cam.zoom;
  const a = clamp((t - 0.84) / 0.1);
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const life = (t * (1.8 + hash(i * 1.3) * 1.1) + hash(i * 8.8)) % 1;
    const th0 = -Math.PI / 2 + (i - 3.5) * 0.3 - 1.5 * life;
    const span = 0.5 + 0.5 * hash(i * 2.2);
    ctx.globalAlpha = a * 0.8 * Math.sin(Math.PI * life);
    ctx.strokeStyle = i % 3 ? HEX.cyan : HEX.ice;
    ctx.lineWidth = 1.4 / z;
    ctx.beginPath();
    for (let s = 0; s <= 8; s++) {
      const u = s / 8;
      const th = th0 + span * u;
      const rr = (20 + 12 * hash(i * 4.3) + 16 * life) * (1 + 0.15 * u) + Math.sin(u * 6 + t * 14 + i) * 1.5;
      const px = x + Math.cos(th) * rr * 1.25, py = y - 6 + Math.sin(th) * rr * 0.75;
      s ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
  }
  ctx.lineCap = 'butt';
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

/** 1.38: a crack of ice light across the knuckles (3 px), widening into the pop. */
function drawCrack(env: Env, t: number) {
  if (t < T_CRACK || t >= T_POP + 2 * FRAME) return;
  const ctx = env.ctx;
  const [x, y] = fistW(t);
  const z = env.cam.zoom;
  const u = clamp((t - T_CRACK) / (T_POP - T_CRACK));
  const fr = env.frng(9);
  const half = 30 + 10 * u;
  const pts: [number, number][] = [];
  for (let s = 0; s <= 6; s++) pts.push([x - half + (s / 6) * half * 2, y + 1.5 + (s % 2 ? -1 : 1) * (1 + 1.5 * fr.next())]);
  const path = () => {
    ctx.beginPath();
    pts.forEach(([px, py], q) => (q ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  };
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // A navy under-stroke so the ice line reads over the orb's own glow.
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = HEX.navy;
  ctx.globalAlpha = 0.7;
  ctx.lineWidth = (6 + 2 * u) / z;
  path();
  ctx.stroke();
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.cyan), x, y + 1.5, half * 1.3, 0.25 * (0.5 + u), 1, 0.3);
  ctx.strokeStyle = HEX.ice;
  ctx.globalAlpha = 0.95;
  ctx.lineWidth = (3 + 2 * u) / z;
  path();
  ctx.stroke();
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

// ---------------------------------------------------------------- the title crown

const LETTERS = [...SHOT_NAME];
/** Title glyph size (world px at zoom 1.15; letterPose's g scales it to about 71 px on screen at any zoom). */
const TITLE_W = 62;
const FLIGHT = 0.06;
const startOf = (i: number) => T_TITLE + i * 0.035;
const arriveOf = (i: number) => startOf(i) + FLIGHT;
/**
 * The crown is a near-flat band defined in SCREEN px above the fist (an arc of radius BAND_R whose top sits 218 px
 * above it, letters ±13°), divided by the camera zoom, so it reads straight across his hair at a constant size and
 * stays on screen through the clench push and the yank.
 */
const BAND_R = 1118, BAND_C = 900, BAND_STEP = 0.0456;
const bandOf = (i: number): [number, number] => {
  const a = (i - 5) * BAND_STEP;
  return [BAND_R * Math.sin(a), BAND_C - BAND_R * Math.cos(a)];
};

/** Letter i's pose: world position, rotation, scale (sx along the arc, sy across), white heat, alpha; null if hidden. */
function letterPose(i: number, t: number): { x: number; y: number; rot: number; sx: number; sy: number; heat: number; g: number } | null {
  const ts = startOf(i);
  if (t < ts) return null;
  const [ax, ay] = fistW(t);
  const Z = zoomAt(t);
  const [lx, ly] = bandOf(i);
  const rho = Math.hypot(lx, ly), phi = Math.atan2(ly, lx), rotL = (i - 5) * BAND_STEP;
  let r: number, th: number, rot: number, sx = 1, sy = 1, heat = 0;
  const u = (t - ts) / FLIGHT;
  if (u < 1) {
    // Sucked in from off-frame on a counter-clockwise spiral, accelerating into the arc.
    const e = ease.inQuad(u);
    r = lerp(760, rho, e);
    th = phi + (0.9 + 0.7 * hash(i * 3.7)) * Math.pow(1 - u, 1.4);
    rot = lerp(th + Math.PI / 2, rotL, e);
    sx = 1 + 0.6 * e;
    sy = 1 - 0.2 * e;
    heat = 0.6;
  } else {
    const lt = t - arriveOf(i);
    // Arrives squashed to 60 %, springs to 110 %, settles at 100 % (0.08 s).
    sy = keys([[0, 0.6], [0.035, 1.1, 'outQuad'], [0.08, 1, 'inOutQuad']], lt);
    sx = 1 + (1 - sy) * 0.7;
    heat = 1 - clamp(lt / 0.1);
    // 1.05-1.40: the isobars tighten and the letters ride them (a wobble; the crown sucked 5 % closer).
    const tight = ease.inOutQuad(clamp((t - 1.05) / 0.35));
    const wob = clamp((t - 1.0) / 0.1) * (t < T_POP ? 1 : 0);
    r = rho * (1 - 0.05 * tight) + Math.sin(t * 15 + i * 1.9) * 3 * wob + (lt < 0.035 ? -12 * (1 - lt / 0.035) : 0);
    th = phi + Math.sin(t * 10 + i * 2.3) * 0.006 * wob;
    rot = rotL + Math.sin(t * 10 + i * 2.3) * 0.03 * wob;
  }
  return { x: ax + (Math.cos(th) * r) / Z, y: ay + (Math.sin(th) * r) / Z, rot, sx, sy, heat, g: 1.15 / Z };
}

function glyph(ctx: CanvasRenderingContext2D, c: string, z: number, heat: number) {
  ctx.font = `${TITLE_W}px ${TITLE_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = HEX.navy;
  ctx.lineWidth = 10 / z;
  ctx.strokeText(c, 0, 0);
  ctx.strokeStyle = HEX.cobalt;
  ctx.lineWidth = 6 / z;
  ctx.strokeText(c, 0, 0);
  const g = ctx.createLinearGradient(0, -TITLE_W * 0.42, 0, TITLE_W * 0.42);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.55, HEX.ice);
  g.addColorStop(1, '#a8e9ff');
  ctx.fillStyle = g;
  ctx.fillText(c, 0, 0);
  if (heat > 0) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = clamp(heat) * 0.85;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(c, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
}

function drawTitle(env: Env, t: number) {
  const ctx = env.ctx;
  const z = env.cam.zoom;
  if (t < T_TITLE) return;
  // The isobar the crown rides: a thin contour under the letters once they have landed (0.87 on).
  const [ax, ay] = fistW(t);
  const ride = clamp((t - 0.85) / 0.15) * (t < T_POP ? 1 : 0);
  if (ride > 0) {
    const tight = ease.inOutQuad(clamp((t - 1.05) / 0.35));
    const Z = zoomAt(t);
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = HEX.cyan;
    ctx.lineWidth = 1.5 / z;
    ctx.globalAlpha = 0.55 * ride;
    ctx.beginPath();
    for (let s = 0; s <= 60; s++) {
      const a = lerp(-6.4, 6.4, s / 60) * BAND_STEP;
      const dx = (BAND_R + 44) * Math.sin(a), dy = (BAND_C - (BAND_R + 44) * Math.cos(a)) * (1 - 0.05 * tight) + Math.sin(a * 60 + t * 3) * 3;
      const px = ax + dx / Z, py = ay + dy / Z;
      s ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
  if (t >= T_POP) return drawShards(env, t);
  LETTERS.forEach((c, i) => {
    if (c === ' ') return;
    const p = letterPose(i, t);
    if (!p) return;
    const flying = t < arriveOf(i);
    // A wind trail behind a letter in flight (along its own spiral path).
    if (flying) {
      const pts: [number, number][] = [];
      for (const d of [0, 0.01, 0.02, 0.03, 0.045, 0.06]) {
        const q = letterPose(i, Math.max(startOf(i), t - d));
        if (q) pts.push([q.x, q.y]);
      }
      streakLine(ctx, pts, 9 / z, 0.55, HEX.cyan);
      streakLine(ctx, pts.slice(0, 4), 3 / z, 0.95, HEX.ice);
    }
    // The landing stamp: an isobar ring (two contour lines) puffing out round the letter, and a cyan spark.
    const lt = t - arriveOf(i);
    if (lt >= 0 && lt < 0.24) {
      const u = lt / 0.24;
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineWidth = 1.2 / z;
      for (const [k, col] of [[1, HEX.ice], [1.28, HEX.cyan]] as const) {
        ctx.globalAlpha = 0.8 * (1 - u);
        ctx.strokeStyle = col;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, (16 + 34 * ease.outCubic(u)) * k * p.g, (20 + 30 * ease.outCubic(u)) * k * p.g, p.rot, 0, TAU);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      if (lt < 0.12) sparkle(ctx, p.x + Math.cos(p.rot - Math.PI / 2) * 30 * p.g, p.y + Math.sin(p.rot - Math.PI / 2) * 30 * p.g, (14 / z) * (1 - lt / 0.12) + 3, 1 - lt / 0.12, t * 6 + i);
    }
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(p.sx * p.g, p.sy * p.g);
    glyph(ctx, c, z * p.g, p.heat);
    ctx.restore();
  });
}

/** 1.45: the title shatters outward with the ring-pop (three wedge shards per letter, spinning, fading). */
function drawShards(env: Env, t: number) {
  const ctx = env.ctx;
  const z = env.cam.zoom;
  const u = t - T_POP;
  // Still in flight at the cut (half faded), so the exit lands on the blast, not a lull.
  const a = 1 - 0.5 * clamp(u / 0.15);
  if (a <= 0) return;
  const [fx0, fy0] = fistW(T_POP);
  LETTERS.forEach((c, i) => {
    if (c === ' ') return;
    const p = letterPose(i, T_POP - FRAME);
    if (!p) return;
    const dx = p.x - fx0, dy = p.y - fy0, dl = Math.hypot(dx, dy) || 1;
    const c0 = hash(i * 5.3) * TAU;
    for (let s = 0; s < 3; s++) {
      const a0 = c0 + (s * TAU) / 3, a1 = a0 + TAU / 3;
      const mid = (a0 + a1) / 2;
      const sp = 520 + hash(i * 7 + s) * 520;
      const d = sp * u + 900 * u * u;
      const ox = (dx / dl) * d + Math.cos(mid + p.rot) * d * 0.25;
      const oy = (dy / dl) * d + Math.sin(mid + p.rot) * d * 0.25;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(p.x + ox, p.y + oy);
      ctx.rotate(p.rot + (hash(i * 3 + s) - 0.5) * 16 * u);
      ctx.scale(p.g, p.g);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, TITLE_W, a0, a1);
      ctx.closePath();
      ctx.clip();
      glyph(ctx, c, z * p.g, u < 2 * FRAME ? 1 : 0.3);
      ctx.restore();
    }
  });
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- eye glint, ring-pop, tag (screen space)

function drawGlint(env: Env, t: number, key: No10Key) {
  if (t < T_GLINT || t >= T_POP + 0.05) return;
  const ctx = env.ctx;
  const g = clamp(1 - (t - T_GLINT) / 0.38);
  const pre = clamp((t - T_GLINT) / (2 * FRAME));
  const k = Math.min(pre, Math.pow(g, 0.8));
  const eL = toScreen(env, anchorW(env, key, 'eyeL'));
  const eR = toScreen(env, anchorW(env, key, 'eyeR'));
  const mx = (eL[0] + eR[0]) / 2, my = (eL[1] + eR[1]) / 2;
  // The lit irises stay faintly cyan after the glint while the fist holds the storm.
  ctx.globalCompositeOperation = 'lighter';
  for (const [x, y] of [eL, eR]) drawGlow(ctx, glowOf(PAL.cyan), x, y, 9, 0.35 + 0.5 * k);
  ctx.globalCompositeOperation = 'source-over';
  if (k <= 0.01) return;
  anamorphic(ctx, mx, my, 600 * (0.6 + 0.4 * k), k);
  sparkle(ctx, eL[0], eL[1], 40 * k + 4, k, t * 3);
  sparkle(ctx, eR[0], eR[1], 48 * k + 4, k, -t * 3 + 0.4);
  lensFlare(ctx, eR[0], eR[1], 60, 0.8 * k, [120, 220, 255]);
}

function drawRingPop(env: Env, t: number) {
  if (t < T_POP) return;
  const ctx = env.ctx;
  const u = clamp((t - T_POP) / 0.15);
  const [cx, cy] = toScreen(env, fistW(T_POP));
  const R = lerp(14, 640, ease.outCubic(u));
  const th = lerp(1, 1.8, u);
  // The hit is carried locally: a navy pocket round the fist, then a white burst in it (not a grey veil over the frame).
  // (A deep pocket and a CYAN burst: additive ice over the red jersey read as a salmon disc, off-palette and too close
  // to CRIMSON CRESCENT's crimson; this core reads as cold air.)
  ctx.globalCompositeOperation = 'source-over';
  drawGlow(ctx, glowOf(PAL.navy), cx, cy, 340, 0.6);
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.cyan), cx, cy, 200, 0.6 * (1 - clamp((t - T_POP) / 0.08)));
  // Inside the ring: the released light (cool, never blown out), with outward implosion lines (now blasting out).
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.cyan), cx, cy, R * 0.8, 0.08 * (1 - u));
  implosionLines(ctx, cx, cy, 90, t, false, 1 - u * 0.6, R);
  ctx.globalCompositeOperation = 'source-over';
  // A train of three pressure waves, still bursting out round him at the cut (about 255 / 225 / 170 px on the last frame).
  for (const [lag, wk] of [[0, 1], [0.04, 0.6], [0.08, 0.4]] as const) {
    if (t - T_POP < lag) continue;
    const ul = clamp((t - T_POP - lag) / (DUR - T_POP));
    const r = lerp(40, 260, ease.outQuad(ul));
    const bw = lerp(10, 30, ul) * wk;
    // A ring of condensed air: navy halo outside, a soft white vapour band, a cyan inner glow, a crisp ice edge.
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.55 * wk;
    ctx.strokeStyle = HEX.navy;
    ctx.lineWidth = bw * 0.9;
    ctx.beginPath();
    ctx.arc(cx, cy, r + bw * 0.55, 0, TAU);
    ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    for (let q = 0; q < 4; q++) {
      ctx.globalAlpha = 0.3 * wk * (1 - 0.15 * q);
      ctx.strokeStyle = q < 2 ? '#e2f6ff' : HEX.cyan;
      ctx.lineWidth = bw * (1 - q * 0.22);
      ctx.beginPath();
      ctx.arc(cx, cy, r - q * bw * 0.12, 0, TAU);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.95 * wk;
    ctx.strokeStyle = HEX.ice;
    ctx.lineWidth = 2.5 * wk + 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r + bw * 0.3, 0, TAU);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.8 * wk;
    ctx.strokeStyle = HEX.cobalt;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r - bw * 0.5, 0, TAU);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  void R;
}

/**
 * 0.75: the yank. For 3 frames, six ice / cyan speed lines (2-4 px over a navy halo) run along the path the fist
 * travelled, from behind arm's length (WH3) to the fist at his chest (WH4), fanned ±20 px across it, fading 0.8 -> 0.
 */
function drawYankLines(env: Env, t: number) {
  if (t < T_YANK || t >= T_YANK + 3 * FRAME) return;
  const ctx = env.ctx;
  const a = 0.8 * (1 - (t - T_YANK) / (3 * FRAME));
  const [x0, y0] = toScreen(env, P_FIST3);
  const [x1, y1] = toScreen(env, P_FIST4);
  const dl = Math.hypot(x1 - x0, y1 - y0) || 1;
  const dx = (x1 - x0) / dl, dy = (y1 - y0) / dl;
  const nx = -dy, ny = dx;
  ctx.lineCap = 'round';
  for (let q = 0; q < 6; q++) {
    const off = lerp(-20, 20, q / 5);
    const back = 40 + 50 * hash(q * 3.3 + 1);
    const head = 14 * hash(q * 7.1 + 2);
    const ax = x0 - dx * back + nx * off, ay = y0 - dy * back + ny * off;
    const bx = x1 - dx * head + nx * off * 0.6, by = y1 - dy * head + ny * off * 0.6;
    const w = 2 + 2 * hash(q * 5.9 + 3);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.5 * a;
    ctx.strokeStyle = HEX.navy;
    ctx.lineWidth = w + 3;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = a;
    ctx.strokeStyle = q % 2 ? HEX.ice : HEX.cyan;
    ctx.lineWidth = w;
    ctx.stroke();
  }
  ctx.lineCap = 'butt';
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

function drawTag(ctx: CanvasRenderingContext2D, t: number) {
  if (t < T_TAG || t >= T_POP) return;
  const u = ease.outCubic(clamp((t - T_TAG) / 0.12));
  const x = lerp(-220, 18, u), y = 330;
  ctx.save();
  ctx.translate(x, y);
  ctx.transform(1, 0, -0.25, 1, 0, 0);
  ctx.fillStyle = 'rgba(6,11,36,0.85)';
  ctx.fillRect(-6, -3, 206, 17);
  ctx.fillStyle = HEX.cobalt;
  ctx.fillRect(-6, -3, 4, 17);
  ctx.fillStyle = HEX.cyan;
  ctx.fillRect(-2, 13, 202, 1);
  ctx.restore();
  ctx.save();
  ctx.font = `9px ${PIXEL_FONT}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = HEX.navy;
  ctx.fillText('SPECIAL SHOT · No.10 · 30 M', x + 6, y + 1);
  ctx.fillStyle = HEX.cyan;
  ctx.fillText('SPECIAL SHOT · No.10 · 30 M', x + 5, y);
  ctx.restore();
}

// ---------------------------------------------------------------- the cut in

/**
 * Shot 2's opening background (the void and the isobar spiral exactly as frame 0 draws them, centred on the palm's
 * screen point), for shot 1's reveal to draw inside its clip so the pattern does not jump at the cut.
 */
export function drawGrabVoid(ctx: CanvasRenderingContext2D) {
  const k = Math.pow(3.3 / 3.7, 0.45);
  drawVoid(ctx, 290, 262, k, 0);
  drawLoops(ctx, 290, 262, k, 0, 1);
}

// ---------------------------------------------------------------- the shot

export const shotGrab: Shot = {
  name: META.name,
  dur: DUR,
  seed: META.seed,
  rate: RATE[2],
  muffle: MUFFLE[2],
  cues: [
    {
      at: 0,
      fn: (e) => {
        e.sfx.stinger();
        e.sfx.howl(0.5, 0.35);
        e.sfx.whoosh(0.28, 2600, 500, 0.32);
        e.cam.shakeAmp = 10;
        e.cam.hit(0.25);
        e.cam.shove(4, 5);
        e.cam.buffet(2.4, 11);
      },
    },
    // The inhale swells while the wind reverses; its hard cut lands on the clench.
    { at: 0.25, fn: (e) => e.sfx.inhale(0.25) },
    { at: T_CURL, fn: (e) => { e.sfx.whoosh(0.22, 3200, 420, 0.28); e.cam.buffet(0); } },
    {
      at: T_CLENCH,
      fn: (e) => {
        e.sfx.choke('tail');
        e.sfx.kick(0.6);
        e.sfx.boom(0.5);
        e.cam.shakeAmp = 10;
        e.cam.hit(0.5);
      },
    },
    { at: 0.55, fn: (e) => e.sfx.airTone(AIR_TONES.G5, 0.3) },
    { at: 0.64, fn: (e) => e.sfx.airTone(AIR_TONES.B5, 0.3) },
    { at: 0.73, fn: (e) => e.sfx.airTone(AIR_TONES.D6, 0.3) },
    { at: T_YANK, fn: (e) => { e.sfx.kick(0.3); e.sfx.whoosh(0.16, 900, 220, 0.22); e.cam.shove(-4, 8); } },
    // The hold: a building rumble and GALE's rising howl as the riser, choked dead into the crack at the pop.
    { at: 0.8, fn: (e) => { e.cam.shakeAmp = 9; e.sfx.rumble(0.65, 0.2); e.sfx.howl(0.62, 0.28, 1.8); } },
    { at: T_GLINT, fn: (e) => e.sfx.shing(1.2) },
    // The two gulps: a felt thump and a short suck as the camera lurches in.
    ...T_GULPS.map((g) => ({ at: g - 2 * FRAME, fn: (e: Env) => { e.sfx.kick(0.3); e.sfx.whoosh(0.09, 2600, 500, 0.18); e.cam.hit(0.15); } })),
    {
      at: T_POP,
      fn: (e) => {
        e.sfx.choke('tail');
        e.sfx.crack(0.9);
        e.sfx.boom(0.6);
        // The held air blasting out (the ear-pop stays the inhale's, §11.13).
        e.sfx.whoosh(0.15, 500, 4200, 0.4);
        e.cam.shakeAmp = 12;
        e.cam.hit(0.6);
        e.cam.shove(0, -12);
      },
    },
  ],

  prepare(env) {
    warmGale();
    measure(env);
    // Build the rim masks for every frame the shot shows (no allocation on the first play).
    for (const k of ['WH1', 'WH2', 'WH3', 'WH4', 'WH4b'] as No10Key[]) {
      const f = no10(k);
      if (!f) continue;
      rimOf(f.a, f.i, 1, PAL.cyan);
      rimOf(f.a, f.i, -1, PAL.ice);
      f.a.tinted(f.i, PAL.cyan);
      const fa = f.a.frames[f.i].anchors.fist ?? f.a.frames[f.i].anchors.palm;
      if (fa) gapOf(f.a, f.i, fa[0], fa[1]);
    }
  },

  init(env) {
    env.sfx.clearBus();
    env.cam.set(VW / 2, VH / 2, 1, 0);
    measure(env);
    clenched = false;
    popped = false;
    yanked = false;
    thrust = false;
    landed = LETTERS.map(() => false);
    frameCam(env, 0);
  },

  update(env, t) {
    const rng = env.rng;
    frameCam(env, t);
    if (t < 2 * FRAME && !thrust) {
      thrust = true;
      ring(env, P_PALM[0], P_PALM[1], 90, 520, 0.22, 1, 'cobalt');
    }
    // 0.00-0.25: vapour puffs blown out past him toward us (growing as they near the lens).
    if (t < 0.22) {
      for (let q = 0; q < 2; q++) {
        const a = rng.range(0, TAU), s = rng.range(260, 620);
        env.parts.spawn({
          kind: PK.Mist, x: P_PALM[0] + Math.cos(a) * 75, y: P_PALM[1] + Math.sin(a) * 75, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
          max: rng.range(0.25, 0.4), s0: rng.range(4, 8), s1: rng.range(26, 46), ramp: 'vapor', r0: 0.1, r1: 0.7, a0: 0.32, a1: 0, k: 0.25,
        });
      }
    }
    // 0.28-0.50: the air is sucked into the hand (ice motes and dew, spiralling in).
    if (t >= T_CURL && t < T_CLENCH) {
      const n = 2 + Math.floor(4 * suck(t));
      const [hx, hy] = trackW(t);
      for (let q = 0; q < n; q++) {
        const a = rng.range(0, TAU), r = rng.range(170, 300);
        const s = rng.range(500, 900);
        env.parts.spawn({
          kind: PK.Streak, x: hx + Math.cos(a) * r, y: hy + Math.sin(a) * r,
          vx: -Math.cos(a) * s + Math.sin(a) * s * 0.5, vy: -Math.sin(a) * s - Math.cos(a) * s * 0.5,
          max: (r / s) * 0.85, s0: rng.range(1, 2), s1: 0.6, ramp: 'dew', r0: 0, r1: 0.6, a0: 0.9, a1: 0.4, k: 0.8,
        });
      }
    }
    if (!clenched && t >= T_CLENCH) {
      clenched = true;
      const [x, y] = P_FIST3;
      ring(env, x, y, 12, 150, 0.32, 1, 'cobalt');
      ring(env, x, y, 6, 90, 0.22, 1, 'dew');
      for (let q = 0; q < 26; q++) {
        const a = rng.range(0, TAU), r = rng.range(60, 140), s = rng.range(700, 1100);
        env.parts.spawn({
          kind: PK.Streak, x: x + Math.cos(a) * r, y: y + Math.sin(a) * r, vx: -Math.cos(a) * s, vy: -Math.sin(a) * s,
          max: (r / s) * 0.9, s0: rng.range(1.2, 2.4), s1: 0.5, ramp: 'cobalt', r0: 0, r1: 0.4, a0: 1, a1: 0.6, k: 1,
        });
      }
    }
    // Each letter's landing throws a few cyan sparks off the arc.
    LETTERS.forEach((c, i) => {
      if (c === ' ' || landed[i] || t < arriveOf(i)) return;
      landed[i] = true;
      const p = letterPose(i, arriveOf(i));
      if (!p) return;
      const out = p.rot - Math.PI / 2;
      for (let q = 0; q < 6; q++) {
        const a = out + rng.range(-1, 1), s = rng.range(160, 380);
        env.parts.spawn({
          kind: PK.Streak, x: p.x, y: p.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 4,
          max: rng.range(0.15, 0.3), s0: rng.range(1, 1.8), s1: 0.4, ramp: 'cobalt', r0: 0, r1: 0.5, k: 1,
        });
      }
    });
    if (!yanked && t >= T_YANK) {
      yanked = true;
      const [x, y] = P_FIST4;
      for (let q = 0; q < 10; q++) {
        const a = rng.range(-Math.PI, 0), s = rng.range(80, 200);
        env.parts.spawn({
          kind: PK.Mist, x: x + rng.range(-30, 30), y: y - 10, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 3,
          max: rng.range(0.3, 0.5), s0: 6, s1: 22, ramp: 'vapor', r0: 0.2, r1: 0.8, a0: 0.25, a1: 0, k: 0.2,
        });
      }
    }
    if (!popped && t >= T_POP) {
      popped = true;
      const [x, y] = P_FIST4;
      ring(env, x, y, 20, 320, 0.3, 1, 'cobalt');
      for (let q = 0; q < 46; q++) {
        const a = rng.range(0, TAU), s = rng.range(500, 1300);
        env.parts.spawn({
          kind: PK.Streak, x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 3,
          max: rng.range(0.15, 0.3), s0: rng.range(1.4, 2.8), s1: 0.6, ramp: q % 3 ? 'cobalt' : 'dew', r0: 0, r1: 0.5, k: 1.2,
        });
      }
      for (let q = 0; q < 14; q++) {
        const a = rng.range(0, TAU), s = rng.range(700, 1200);
        env.parts.spawn({
          kind: PK.Mist, x: x + Math.cos(a) * 40, y: y + Math.sin(a) * 40, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 1.5,
          max: rng.range(0.15, 0.25), s0: 8, s1: 30, ramp: 'vapor', r0: 0.1, r1: 0.7, a0: 0.28, a1: 0, k: 0.35,
        });
      }
    }
    // The tremor: the fist holds the storm.
    if (t >= 0.8 && t < T_POP) holdTrauma(env.cam, 0.45 + 0.25 * clamp((t - 1.0) / 0.45));
  },

  render(env, t) {
    const { ctx, fx, cam } = env;
    frameCam(env, t);
    const key = no10At(SEQ[2], t);
    const z = cam.zoom;
    // The vortex lives in screen space round the hand, with a mild parallax (the void is far behind him).
    const [hx, hy] = toScreen(env, t < T_CLENCH ? trackW(t) : fistW(t));
    const k = Math.pow((z * SC) / 3.7, 0.45);

    env.screen();
    drawVoid(ctx, hx, hy, k, t);
    drawLoops(ctx, hx, hy, k, t, 1);
    drawStreaks(ctx, hx, hy, k, t, false);
    // Implosion lines: from the curl, strongest into the clench, then a held draw while the fist holds the storm.
    if (t >= T_CURL && t < T_POP) {
      const a = t < T_CLENCH ? clamp((t - T_CURL) / 0.12) : lerp(1, 0.6, clamp((t - T_CLENCH) / 0.4)) + 0.45 * clamp((t - 1.0) / 0.45);
      ctx.save();
      implosionLines(ctx, hx, hy, 160, t, true, a, 470 * k);
      ctx.restore();
    }
    drawMotes(ctx, hx, hy, k, t);
    drawBuild(ctx, hx, hy, k, t);
    drawDrink(ctx, hx, hy, k, t);

    // The palm thrust: ice focus lines burst outward from the palm for 4 frames (the wind leaving at the lens).
    if (t < 4 * FRAME) {
      ctx.globalCompositeOperation = 'lighter';
      focusLines(ctx, env.frng(13), hx, hy, 150, 560, 70, HEX.ice, 0.38 * (1 - t / (4 * FRAME)) + 0.12, 3);
      ctx.globalCompositeOperation = 'source-over';
    }
    // The clench: ice focus lines converge on the fist for 4 frames.
    if (t >= T_CLENCH && t < T_CLENCH + 4 * FRAME) {
      ctx.globalCompositeOperation = 'lighter';
      focusLines(ctx, env.frng(11), hx, hy, 70, 520, 90, HEX.ice, 0.5, 4);
      focusLines(ctx, env.frng(12), hx, hy, 110, 520, 50, HEX.cyan, 0.45, 3);
      ctx.globalCompositeOperation = 'source-over';
    }

    // The bust and its light, the orb, the wisps, the crack (world space: they ride the camera and its shake).
    env.world();
    drawBust(env, key, t);
    drawOrb(env, t);
    drawWisps(env, t);
    drawCrack(env, t);
    env.parts.draw(ctx, 1);

    // Near streaks pour past the lens in front of him; the yank's speed lines; the title crown and its shards.
    env.screen();
    drawStreaks(ctx, hx, hy, k, t, true);
    drawYankLines(env, t);
    env.world();
    drawTitle(env, t);

    env.screen();
    drawGlint(env, t, key);
    drawRingPop(env, t);
    drawTag(ctx, t);

    // ---------------------------------------------------------------- post
    galeStorm(fx);
    fx.sat = 0.98;
    fx.vignette = 0.62;
    const [u, v] = [hx / VW, hy / VH];
    // The palm thrust: the wind pours out of the frame (a short outward zoom blur on the palm).
    if (t < 0.12) {
      fx.radial = 0.035 * (1 - t / 0.12);
      fx.radialX = u;
      fx.radialY = v;
    }
    // E1: the clench. Cyan flash 0.45 for 2 frames, a shock ring, a pressure pinch toward the fist, CA, radial.
    if (t >= T_CLENCH && t < T_CLENCH + 2 * FRAME) {
      // One counted rising edge (0.45) for one frame, no tail: the orb carries the hit, not a milky veil.
      fx.flash = t < T_CLENCH + 0.5 * FRAME ? 0.45 : 0;
      fx.flashColor = BLINK.clench;
      fx.bloom = 1.1;
    }
    if (t >= T_CLENCH && t < T_CLENCH + 0.35) {
      const q = (t - T_CLENCH) / 0.35;
      pushShock(fx, { x: u, y: v, r: 0.35 * ease.outCubic(q), s: 0.04 * (1 - q) });
    }
    if (t >= T_CLENCH && t < T_CLENCH + 0.16) {
      const q = (t - T_CLENCH) / 0.16;
      fx.lens = -0.14 * (1 - ease.outCubic(q));
      fx.lensR = 0.5;
      fx.lensX = u;
      fx.lensY = v;
      fx.radial = 0.018 * (1 - q) * (1 - q);
      fx.radialX = u;
      fx.radialY = v;
      fx.ca = 0.0012 + 0.005 * (1 - q);
    }
    // The eye glint: bloom 0.9 -> 1.3 -> 1.0 over 0.25 s.
    if (t >= T_GLINT && t < T_GLINT + 0.25) {
      const q = (t - T_GLINT) / 0.25;
      fx.bloom = q < 0.3 ? lerp(0.9, 1.3, q / 0.3) : lerp(1.3, 1.0, (q - 0.3) / 0.7);
      fx.ca = Math.max(fx.ca, 0.0012 + 0.004 * (1 - q));
    }
    // E2: the ring-pop. Flash 0.6 decaying steadily (never dips and rises), a shock ring r 0 -> 1.2, CA, radial.
    if (t >= T_POP) {
      const q = clamp((t - T_POP) / 0.15);
      // One counted frame at 0.6, then a 0.12 tail under the threshold: the burst at the fist carries the hit.
      fx.flash = t < T_POP + FRAME ? 0.6 : lerp(0.12, 0, clamp((t - T_POP - FRAME) / 0.04));
      fx.flashColor = BLINK.popFlash;
      pushShock(fx, { x: u, y: v, r: 1.2 * ease.outCubic(q), s: 0.05 * (1 - 0.5 * q) });
      fx.ca = 0.0012 + 0.01 * (1 - q);
      fx.bloom = 1.15;
      if (t < T_POP + 0.1) fx.vignette = 0.8;
      // Still being blasted outward when shot 3 cuts in.
      fx.radial = 0.05 * (1 - 0.5 * q);
      fx.radialX = u;
      fx.radialY = v;
    }
  },
};
