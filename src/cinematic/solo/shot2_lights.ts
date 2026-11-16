// SHOT 2 — HOUSE LIGHTS (1.2 s = beats 0-2 of bar 1, global 1.4-2.6). SPEC.md §2: show the wall of four, then turn
// the stadium into a stage.
//
// A medium-wide side view at chest height. The ground is a true perspective plane: the vanishing horizon (y 170) is
// everyone's chest line and his sole line is y 300, so a figure at depth s (1 = his plane) stands at y 170 + 130 s,
// is drawn at s times his size and scrolls at s times his speed. Behind it the stands and two floodlight towers ride
// the field backdrop's parallax (crowd 0.25, towers 0.5 of a backdrop camera that moves at a third of ours). The
// wall reads left to right in one still: A jockeying in his plane (x 430, puppet x2), B deeper (x1.6), C and D
// deeper still (x1.3 between them), the keeper small on his line, the goal mouth at the right edge.
//
// No.10 (Dribble F1-F8 at x2, the brief's schedule) runs right. Every frame's canvas is pinned to the turf at its
// Dribble.json originDx, so the planted toe never slides; the camera tracks his pelvis through the middle of each
// hold, and the holds halve at 0.80, so he visibly accelerates into the wall. The ball rolls between the four touches
// (decelerating, re-pushed on every touch, always within a foot-length of the boot), spin locked to its roll.
//
// Beats (shot-local; all on the 16th grid):
//   0.00 the ONE  CHUNK: the outer floodlight banks die in one frame (glows fade over 3 frames), dim 0 -> 0.45. The
//                 picture dies on frame 1, the step its t = 0 cues sound on (frame 0 shows the stadium fully lit).
//   0.40          CHUNK: the inner banks and the ad boards die, dim 0.8. ~60 phone lights come on in the stands, the
//                 pitch lines and the goal frame fluoresce lilac, his white boots and the ball glow in the dark.
//   0.80          SPOT ON from the top-right: beam, floor pool, stage hole, beat flare. The wall turns to plum
//                 silhouettes with lilac rims; the four-count fades in, unlit.
//   1.00          beat-snap to No.10 and A (zoom 1.3) as A steps up into the edge of the pool: his near half is lit.
//   1.20          match cut on the next touch (shot 3 opens on FrontTouch).
// Touches 0.00 R, 0.40 L, 0.80 R, 1.00 L (quarter notes, then a pickup 8th). Footfalls (scuffs) 0.10, 0.50, 0.85, 1.05.
//
// Clock: rate 1 (no hit-stop in this shot). The picture is a pure function of t, except the operator-lag follow-spot,
// the ball spin and the footfall dust, which advance in update() at the fixed step (seek-exact). init resets them.

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { Rng, clamp, ease, lerp, type RGB } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import type { Kit, Pose } from '../../art/puppet';
import {
  FollowSpot, HUM, KEEPER_KIT, PAL, P, POSES, PuppetCache, RATE, RIVAL_KIT, RIVAL_KIT_B, RIVAL_KIT_C, RIVAL_KIT_D, SEQ,
  TOMS, beatCam, drawBall, drawSolo, fourCount, joints, onGrid, padsFor, soloGrade, soloPic, stage, warmSolo,
  type CamKey, type SoloKey, type StagePool,
} from './common';

const DUR = 1.2;
/** No.10's integer sprite scale (SCALE[2]). */
const SC = 2;
/** His sole line (world y) and the vanishing horizon (his chest height). */
const GY = 300;
const HZ = 170;
/** Frame-space y of the sole line: the bottom edge of row 102. */
const SOLE = 103;
/** Dribble.json originDx per F1..F8 (the canvas offset that keeps the planted toe still); the cycle advances 42. */
const ORIGIN_DX = [0, 24, 24, 24, 24, 42, 42, 42];
const CYCLE_DX = 42;

// Beats (shot-local).
const BANK_T = [onGrid(0, 'bank 1'), onGrid(0.4, 'bank 2')] as const;
const SPOT_T = onGrid(0.8, 'spot on');
const SNAP_T = onGrid(1.0, 'beat-snap');
/** Touches: R, L, R, L, and shot 3's FT1 (1.20) for the last roll. */
const TOUCH_T = [onGrid(0, 'touch R'), onGrid(0.4, 'touch L'), onGrid(0.8, 'touch R'), onGrid(1.0, 'touch L'), 1.2];
/** Seq indices of the touch frames (F1, F5, F1, F5); 16 = F1 of the next cycle (shot 3's touch, extrapolated). */
const TOUCH_IDX = [0, 4, 8, 12, 16];
/** Footfalls: F2 (right foot down) and F6 (left foot down). */
const FOOTFALL_T = [0.1, 0.5, 0.85, 1.05];
/** A lamp dies over this many frames (its glow fades, the stage dim follows). */
const DIE_F = 3;

// ---------------------------------------------------------------- module state (reset in init)

let spin = new BallSpin();
let prevBallX = 0;
const spot = new FollowSpot(0.06);
let spotOn = false;
let dustDone: boolean[] = [];
/** Layout derived from the studio frames (pelvis / ball anchors), computed in init. */
let L: Layout | null = null;

interface Layout {
  /** Canvas origin (world x) and pelvis x (world) of each scheduled frame. */
  OX: number[];
  PX: number[];
  /** Camera track samples: [time, pelvis x] at the middle of each hold. */
  M: [number, number][];
  /** Ball x at each touch. */
  TB: number[];
  /** Camera centre x at t = 0 (pelvis + 150: he stands at screen x 170). */
  c0: number;
  cam: CamKey[];
  /** Depth layout (world X of each figure at t = 0) and the pitch markings. */
  A0: number;
  B0: number;
  C0: number;
  D0: number;
  K0: number;
  XG: number;
  XBOX: number;
  X6: number;
}

// ---------------------------------------------------------------- No.10's schedule and stride

const seq = SEQ[2];
const keyAt = (i: number): SoloKey => seq[i][1];
/** Index of the frame showing at t. */
function idxAt(t: number): number {
  let k = 0;
  for (let i = 0; i < seq.length; i++) if (t >= seq[i][0] - 1e-6) k = i;
  return k;
}
/** Canvas origin (frame px) of seq index i, the cycle continuing past the end (16 = F1 of the next cycle). */
const originDx = (i: number) => CYCLE_DX * Math.floor(i / 8) + ORIGIN_DX[i % 8];

function layout(env: Env): Layout {
  const T = seq.map(([t]) => t);
  const OX = seq.map((_, i) => SC * originDx(i));
  const PX = seq.map(([, k], i) => OX[i] + SC * soloPic(env, k).anchor('pelvis')[0]);
  const M: [number, number][] = T.map((t, i) => [t + ((T[i + 1] ?? DUR) - t) / 2, PX[i]]);
  const TB = TOUCH_IDX.map((i) => {
    const k: SoloKey = i < seq.length ? keyAt(i) : 'D1';
    return SC * originDx(i) + SC * soloPic(env, k).anchor('ball')[0];
  });
  const c0 = track(M, 0) + 150;
  // The wall at t = 0 (screen x at zoom 1 -> world X at its depth).
  const at = (sx: number, s: number) => c0 + (sx - VW / 2) / s;
  const A0 = at(430, DEPTH.A);
  // Beat-snap at 1.00: zoom 1.3, centred between No.10 and A.
  const mid = (track(M, DUR) + A_END_GAP - track(M, SNAP_T)) / 2;
  const cam: CamKey[] = [
    [0, 150, VH / 2, 1],
    [SNAP_T, mid, 206, 1.3],
  ];
  return {
    OX, PX, M, TB, c0, cam, A0,
    B0: at(502, DEPTH.B), C0: at(540, DEPTH.C), D0: at(574, DEPTH.D), K0: at(612, DEPTH.K),
    XG: at(636, GOAL.near), XBOX: c0 + 236, X6: c0 + 470,
  };
}

/** Piecewise-linear track through samples (extrapolated at both ends). */
function track(M: [number, number][], t: number): number {
  let i = 0;
  while (i < M.length - 2 && t >= M[i + 1][0]) i++;
  const [ta, xa] = M[i], [tb, xb] = M[i + 1];
  return xa + ((t - ta) * (xb - xa)) / (tb - ta);
}

/** Ball x: re-pushed on every touch, decelerating to 0.6x by the next (rolling friction), never stopping. */
function ballX(l: Layout, t: number): number {
  let k = 0;
  while (k < TOUCH_T.length - 2 && t >= TOUCH_T[k + 1]) k++;
  const u = clamp((t - TOUCH_T[k]) / (TOUCH_T[k + 1] - TOUCH_T[k]));
  return lerp(l.TB[k], l.TB[k + 1], (u - 0.2 * u * u) / 0.8);
}

// ---------------------------------------------------------------- the view (perspective toward the horizon)

/** Current camera (world centre x / y, zoom), set at the top of render. */
const view = { x: 0, y: VH / 2, z: 1 };
/** Ground point of world X at depth s, projected toward the vanishing point (view.x, HZ). */
const gp = (X: number, s: number): [number, number] => [view.x + (X - view.x) * s, HZ + (GY - HZ) * s];
/** World -> screen (logical px). */
const toScreen = (x: number, y: number): [number, number] => [(x - view.x) * view.z + VW / 2, (y - view.y) * view.z + VH / 2];

function camAt(l: Layout, t: number) {
  const c = beatCam(l.cam, t);
  view.x = track(l.M, t) + c.x;
  view.y = c.y;
  view.z = c.zoom;
}

// ---------------------------------------------------------------- the wall (puppets)

/** Depth of each figure (= its puppet scale / 2; puppets are drawn at 2 world px per puppet px like No.10). */
const DEPTH = { A: 1, B: 0.8, C: 0.62, D: 0.68, K: 0.44 } as const;
const GOAL = { near: 0.5, far: 0.38, h: 273 } as const;
const PD = 2;
const FACE = -1 as const;
/** Light for the dark-stage rims: the spill of the follow-spot rig, top-right (it also rims each figure's right
 *  edge against the one standing behind him, so the wall never merges into one dark mass). */
const RIM = { lx: 0.6, ly: -0.8 };

const DEG = Math.PI / 180;
const JOCKEY = POSES.jockey;
/** Mid-shuffle: feet drawn together, hips up a touch. */
const SHUFFLE = P({ ...JOCKEY, thighN: 16 * DEG, kneeN: 40 * DEG, thighF: -4 * DEG, kneeF: 36 * DEG, footF: 6 * DEG, armN: 30 * DEG, armF: -28 * DEG });
/** The step up into the light: front foot reaching, weight forward, arms out. */
const STEP_UP = P({ torso: 24 * DEG, head: -16 * DEG, thighN: 48 * DEG, kneeN: 30 * DEG, footN: -8 * DEG, thighF: -26 * DEG, kneeF: 34 * DEG, footF: 12 * DEG, armN: 46 * DEG, elbowN: 28 * DEG, armF: -44 * DEG, elbowF: 34 * DEG });
/** B covers the near lane: lower and wider than A. */
const JOCKEY_WIDE = P({ torso: 20 * DEG, head: -14 * DEG, thighN: 34 * DEG, kneeN: 62 * DEG, footN: -6 * DEG, thighF: -18 * DEG, kneeF: 46 * DEG, armN: 54 * DEG, elbowN: 24 * DEG, armF: -50 * DEG, elbowF: 28 * DEG });
const SHUFFLE_WIDE = P({ ...JOCKEY_WIDE, thighN: 20 * DEG, kneeN: 48 * DEG, thighF: -6 * DEG, kneeF: 42 * DEG, footF: 6 * DEG });
/** C holds the far side of the box edge: set, a little more upright. */
const READY = P({ torso: 10 * DEG, head: -8 * DEG, thighN: 16 * DEG, kneeN: 28 * DEG, thighF: -12 * DEG, kneeF: 26 * DEG, armN: 24 * DEG, elbowN: 40 * DEG, armF: -18 * DEG, elbowF: 44 * DEG });
/** D, the last man, organises the wall: the near arm points at No.10 (until the lights go). */
const POINT = P({ torso: 8 * DEG, head: -12 * DEG, thighN: 18 * DEG, kneeN: 30 * DEG, thighF: -12 * DEG, kneeF: 28 * DEG, armN: 104 * DEG, elbowN: 6 * DEG, armF: -26 * DEG, elbowF: 40 * DEG });
const POSE: Record<string, Pose> = {
  jockey: JOCKEY, shuffle: SHUFFLE, stepUp: STEP_UP, jockeyWide: JOCKEY_WIDE, shuffleWide: SHUFFLE_WIDE, ready: READY, point: POINT,
  gkReady: POSES.gkReady,
};
const pc = new PuppetCache();
const hipCache = new Map<string, number>();
/** Hip height above the turf (units) for a pose (the lowest joint touches the ground). */
function hipAbove(name: string): number {
  let h = hipCache.get(name);
  if (h === undefined) {
    const j = joints(POSE[name]);
    h = Math.max(j.toeN[1] + 3, j.toeF[1] + 3, j.ankleN[1] + 3, j.kneeN[1] + 5);
    hipCache.set(name, h);
  }
  return h;
}

interface Fig {
  name: string;
  kit: Kit;
  k: number;
  s: number;
  X: number;
  /** Lift (world px at his plane, for hops). */
  lift: number;
}

/** Shuffle steps [start, dx]: a 4-frame hop back (or forward) between planted jockey stances. */
function shuffleX(steps: readonly (readonly [number, number])[], t: number): { dx: number; lift: number; moving: boolean } {
  let dx = 0, lift = 0, moving = false;
  for (const [t0, d] of steps) {
    const u = (t - t0) / (4 / 60);
    if (u >= 1) dx += d;
    else if (u >= 0) {
      dx += d * ease.inOutQuad(u);
      lift = 3 * Math.sin(Math.PI * u);
      moving = true;
    }
  }
  return { dx, lift, moving };
}
const A_SHUFFLE = [[0.1, 14], [0.3, 14], [0.5, 14], [0.7, 14]] as const;
const B_SHUFFLE = [[0.2, 9], [0.4, 9], [0.6, 9]] as const;
/** A's step up into the light on the 1.00 beat-snap (an 8th long). */
const A_STEP = { t0: SNAP_T, dur: 0.1 };
/** How far in front of No.10's pelvis A ends up (world px): at the edge of the pool, a clear stride from the ball. */
const A_END_GAP = 128;

function figures(l: Layout, t: number): Fig[] {
  // A: four shuffles back while No.10 closes, set, then the step FORWARD up into the edge of the pool.
  const a = shuffleX(A_SHUFFLE, t);
  let AX = l.A0 + a.dx, Aname = a.moving ? 'shuffle' : 'jockey';
  const su = (t - A_STEP.t0) / A_STEP.dur;
  if (su >= 0) {
    const end = track(l.M, DUR) + A_END_GAP;
    AX = lerp(AX, end, ease.outCubic(clamp(su)));
    Aname = su < 1.0 ? 'stepUp' : 'jockey';
  }
  const b = shuffleX(B_SHUFFLE, t);
  // C and D hold the line, weight shifting on the 8ths (on their toes); D points until the lights go.
  const bob = (ph: number) => (Math.floor(t / 0.2 + ph) % 2 ? 2 : 0);
  return [
    { name: 'gkReady', kit: KEEPER_KIT, k: DEPTH.K, s: DEPTH.K, X: l.K0, lift: bob(0) },
    { name: 'ready', kit: RIVAL_KIT_C, k: DEPTH.C, s: DEPTH.C, X: l.C0, lift: bob(1) },
    { name: t < BANK_T[1] ? 'point' : 'jockey', kit: RIVAL_KIT_D, k: DEPTH.D, s: DEPTH.D, X: l.D0, lift: bob(0) },
    { name: b.moving ? 'shuffleWide' : 'jockeyWide', kit: RIVAL_KIT_B, k: DEPTH.B, s: DEPTH.B, X: l.B0 + b.dx, lift: b.lift },
    { name: Aname, kit: RIVAL_KIT, k: DEPTH.A, s: DEPTH.A, X: AX, lift: a.lift },
  ];
}

/** Hip of a figure (world). */
function hipOf(f: Fig): [number, number] {
  const [x, y] = gp(f.X, f.s);
  return [x, y - f.lift * f.s - hipAbove(f.name) * f.k * PD];
}

function drawFig(ctx: CanvasRenderingContext2D, f: Fig, lit: number, alpha = 1) {
  const [x, y] = hipOf(f);
  pc.draw(ctx, f.name, f.kit, POSE[f.name], f.k, FACE, x, y, PD, lit, RIM, alpha);
}

// ---------------------------------------------------------------- No.10's derived pictures (built once per frame)

const IVORY = PAL.ivory, LILAC = PAL.lilac;
const derived = new Map<string, { rim: HTMLCanvasElement; boots: HTMLCanvasElement; halo: HTMLCanvasElement; deep: HTMLCanvasElement }>();
const near = (p: Uint8ClampedArray, i: number, hex: number) =>
  Math.abs(p[i] - (hex >> 16)) < 8 && Math.abs(p[i + 1] - ((hex >> 8) & 255)) < 8 && Math.abs(p[i + 2] - (hex & 255)) < 8;
/**
 * Per Dribble frame: a lilac rim on his top-right edges (the dark-stage look before the spot finds him), and his white
 * boots as fluorescent pixels (boot white -> ivory, boot shade -> lilac) with two tinted copies for their halo.
 */
function derive(env: Env, key: SoloKey) {
  const p = soloPic(env, key);
  let d = derived.get(p.id);
  if (d) return d;
  const { w, h, px } = p;
  const mk = () => {
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    const g = cv.getContext('2d')!;
    return [cv, g, g.createImageData(w, h)] as const;
  };
  const op = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && px[(y * w + x) * 4 + 3] > 40;
  const [rim, rg, ri] = mk();
  const [boots, bg, bi] = mk();
  const [halo, hg, hi] = mk();
  const [deep, dg, di] = mk();
  const put = (img: ImageData, i: number, c: RGB) => {
    img.data[i] = c[0];
    img.data[i + 1] = c[1];
    img.data[i + 2] = c[2];
    img.data[i + 3] = 255;
  };
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (!op(x, y)) continue;
      const i = (y * w + x) * 4;
      if (!op(x + 1, y) || !op(x, y - 1) || !op(x + 1, y - 1)) put(ri, i, LILAC);
      if (y < 86) continue;
      const white = near(px, i, 0xdfdae6), shade = near(px, i, 0x8980ae);
      if (!white && !shade) continue;
      put(bi, i, white ? IVORY : LILAC);
      put(hi, i, PAL.uv);
      put(di, i, PAL.uvDeep);
    }
  rg.putImageData(ri, 0, 0);
  bg.putImageData(bi, 0, 0);
  hg.putImageData(hi, 0, 0);
  dg.putImageData(di, 0, 0);
  derived.set(p.id, (d = { rim, boots, halo, deep }));
  return d;
}

/** His boots glowing: a uvDeep halo, a violet halo, then the fluorescent pixels (always violet over uvDeep). */
function drawBoots(env: Env, key: SoloKey, x: number, a: number, add: boolean) {
  if (a <= 0) return;
  const ctx = env.ctx;
  const d = derive(env, key);
  const o = { pivot: [0, SOLE] as [number, number] };
  ctx.save();
  for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 1]]) drawSolo(env, key, x + dx * 1.5, GY + dy * 1.5, SC, { ...o, alpha: 0.32 * a }, d.deep);
  ctx.globalCompositeOperation = 'lighter';
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1]]) drawSolo(env, key, x + dx * 1.5, GY + dy * 1.5, SC, { ...o, alpha: 0.2 * a }, d.halo);
  ctx.globalCompositeOperation = add ? 'lighter' : 'source-over';
  drawSolo(env, key, x, GY, SC, { ...o, alpha: (add ? 0.5 : 0.92) * a }, d.boots);
  ctx.restore();
}

// ---------------------------------------------------------------- the stadium behind (backdrop parallax)

/** Backdrop camera: moves at a third of ours, so the crowd (field parallax 0.25) scrolls at 0.25 of his plane and
 *  the towers (0.5) at 0.17: the towers stand behind the stands. 1 backdrop px = 1 world px at his plane. */
const BX_K = 1 / 3;
/** Field backdrop y of the horizon (the crowd canvas sits on it). */
const BH = 172;
const CROWD_X0 = -520;
/** Floodlight towers: screen x at t = 0 (zoom 1). Each lamp head carries two banks. */
const TOWER_SX = [104, 470];
/** Bank order: 0 = left tower's left (outer), 1 = left tower's right (inner), 2 = right tower's left (inner),
 *  3 = right tower's right (outer). Outer banks die on the ONE, inner at 0.40. The runner renders a shot's t = 0
 *  frame before its t = 0 cues fire (they play on the step to 1/60), so the outer banks die on that step: frame 0
 *  shows the whole stadium lit for one frame, and the first CHUNK's picture and sound land together on frame 1. */
const OUTER_DIE = BANK_T[0] + 1 / 60;
const BANK_DIE = [OUTER_DIE, BANK_T[1], BANK_T[1], OUTER_DIE];
const LAMP_ON = '#fffbe8', LAMP_HOT = '#ffffff', LAMP_DEAD = '#0d0816', LAMP_GLASS = '#3a2f55';

/** 0 before `at`, then (n + 1) / frames on the n-th frame from it: the change already shows on the beat's own frame. */
const stepIn = (t: number, at: number, frames: number) => (t < at - 1e-6 ? 0 : clamp((Math.round((t - at) * 60) + 1) / frames));
/** Glow level of bank b at t: 1 while lit, then 2/3, 1/3, 0 from its CHUNK (the lamp grid itself dies at once). */
const bankGlow = (b: number, t: number) => 1 - stepIn(t, BANK_DIE[b], DIE_F);
const bankOn = (b: number, t: number) => t < BANK_DIE[b] - 1e-6;

/** Stage dim outside the pool: 0 -> 0.45 at the first CHUNK, -> 0.8 at the second (each over DIE_F frames). */
const dimLevel = (t: number) => 0.45 * stepIn(t, OUTER_DIE, DIE_F) + 0.35 * stepIn(t, BANK_T[1], DIE_F);

const phones: { u: number; v: number; on: number; big: boolean; lilac: boolean; f: number; ph: number }[] = [];
function buildPhones() {
  if (phones.length) return;
  const r = new Rng(5021);
  for (let i = 0; i < 150; i++)
    phones.push({
      u: CROWD_X0 + r.range(0, 1600),
      v: r.range(BH - 104, BH - 16),
      on: BANK_T[1] + 0.02 + r.range(0, 0.24) * Math.sqrt(r.next()),
      big: r.next() < 0.22,
      lilac: r.next() < 0.34,
      f: r.range(0.8, 2.1),
      ph: r.range(0, 6.3),
    });
}

/** Enter the backdrop transform (inside the world transform). Returns the backdrop camera x. */
function backdrop(ctx: CanvasRenderingContext2D): number {
  const bx = view.x * BX_K;
  ctx.translate(view.x - bx, HZ - BH);
  return bx;
}
const towerU = (l: Layout, i: number, bx: number) => l.c0 * BX_K + (TOWER_SX[i] - VW / 2) + (bx - l.c0 * BX_K) * 0.5;

/** The structure of the stadium: sky band, towers (every lamp drawn dead), crowd, roof, and the ad boards (lit until
 *  the inner banks die at 0.40, then dead). Drawn under the dim, behind the wall. */
function drawStands(env: Env, l: Layout, veil: number, t: number) {
  const ctx = env.ctx;
  const st = env.art.stadium;
  ctx.save();
  const bx = backdrop(ctx);
  const L0 = bx - 520, W0 = 1040;
  // Night above the roof (no moon, no sky shot): plum, a touch lighter at the roof line.
  const g = ctx.createLinearGradient(0, BH - 260, 0, BH - 120);
  g.addColorStop(0, '#05030a');
  g.addColorStop(1, '#170c28');
  ctx.fillStyle = g;
  ctx.fillRect(L0, BH - 520, W0, 400);
  // Floodlight towers behind the stand (lattice mast + a lamp head of two banks).
  for (let i = 0; i < 2; i++) {
    const c = Math.round(towerU(l, i, bx));
    ctx.fillStyle = '#1b1830';
    ctx.fillRect(c - 4, BH - 140, 3, 40);
    ctx.fillRect(c + 2, BH - 140, 3, 40);
    ctx.fillStyle = '#26223f';
    for (let y = BH - 138; y < BH - 100; y += 8) {
      ctx.fillRect(c - 3, y, 7, 1);
      ctx.fillRect(c - 2 + ((y / 8) & 1) * 3, y + 3, 2, 2);
    }
    ctx.fillStyle = '#2b2746';
    ctx.fillRect(c - 31, BH - 166, 62, 28);
    ctx.fillStyle = '#1b1830';
    ctx.fillRect(c - 1, BH - 164, 2, 24);
    ctx.fillRect(c - 31, BH - 139, 62, 2);
    // Every lamp drawn dead (dark glass with a glint); the live ones are lit over it after the dim.
    for (let b = 0; b < 2; b++)
      for (let r = 0; r < 4; r++)
        for (let q = 0; q < 4; q++) {
          const x = c - 28 + b * 30 + q * 7, y = BH - 163 + r * 6;
          ctx.fillStyle = LAMP_DEAD;
          ctx.fillRect(x, y, 5, 4);
          ctx.fillStyle = LAMP_GLASS;
          ctx.fillRect(x, y, 2, 1);
        }
  }
  // The stand: the shared crowd canvas, the roof edge over it, and the ad-board strip (dead: lit after the dim).
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(st.crowd, CROWD_X0 + bx * 0.25, BH - 110);
  ctx.fillStyle = '#07050f';
  ctx.fillRect(L0, BH - 122, W0, 14);
  ctx.fillStyle = '#05040b';
  ctx.fillRect(L0, BH - 12, W0, 12);
  const bu = CROWD_X0 + bx * 0.25;
  const boardsLit = t < BANK_T[1] - 1e-6;
  const cols = ['#c81e2a', '#f6f0df', '#7a4dff', '#f6f0df'];
  for (let i = Math.floor((L0 - bu) / 80); i < Math.ceil((L0 + W0 - bu) / 80); i++) {
    const x = bu + i * 80 + 4;
    ctx.fillStyle = boardsLit ? cols[((i % 4) + 4) % 4] : '#120a1e';
    ctx.fillRect(x, BH - 9, 60, 6);
    if (!boardsLit) continue;
    ctx.fillStyle = '#05040b';
    for (let q = 0; q < 6; q++) ctx.fillRect(x + 4 + q * 9, BH - 8, 4, 4);
  }
  // With the house lights gone the stands sink further than the pitch (one more multiply of the stage's dim
  // colour: darkness made of light, never ink or a colour drain), so the phone lights pop.
  if (veil > 0) {
    const [r, g2, b] = stage.dimColor(veil);
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = `rgb(${r | 0},${g2 | 0},${b | 0})`;
    ctx.fillRect(L0, BH - 520, W0, 520);
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
}

/** The lit lamps and their glows: light sources, drawn after the dim. */
function drawLamps(env: Env, l: Layout, t: number) {
  const ctx = env.ctx;
  ctx.save();
  const bx = backdrop(ctx);
  for (let i = 0; i < 2; i++) {
    const c = Math.round(towerU(l, i, bx));
    for (let side = 0; side < 2; side++) {
      const b = i * 2 + side;
      const gl = bankGlow(b, t);
      if (gl <= 0) continue;
      const x0 = c - 28 + side * 30;
      if (bankOn(b, t)) {
        ctx.globalCompositeOperation = 'source-over';
        for (let r = 0; r < 4; r++)
          for (let q = 0; q < 4; q++) {
            ctx.fillStyle = LAMP_ON;
            ctx.fillRect(x0 + q * 7, BH - 163 + r * 6, 5, 4);
            ctx.fillStyle = LAMP_HOT;
            ctx.fillRect(x0 + q * 7 + 1, BH - 162 + r * 6, 3, 2);
          }
      }
      // The glow: a warm-white floodlight halo (it dies with the bank over DIE_F frames).
      ctx.globalCompositeOperation = 'lighter';
      const gx = x0 + 12.5, gy = BH - 152;
      drawGlow(ctx, glowOf([255, 248, 226]), gx, gy, 64, 0.42 * gl);
      drawGlow(ctx, glowOf([255, 255, 255]), gx, gy, 22, 0.8 * gl);
      // Its haze cone down onto the pitch (very faint: it only says "these lamps light the field").
      const cone = ctx.createLinearGradient(0, gy, 0, gy + 320);
      cone.addColorStop(0, `rgba(255,248,226,${0.05 * gl})`);
      cone.addColorStop(1, 'rgba(255,248,226,0)');
      ctx.fillStyle = cone;
      ctx.beginPath();
      ctx.moveTo(gx - 12, gy);
      ctx.lineTo(gx + 12, gy);
      ctx.lineTo(gx + 150 + side * 60 - 30, gy + 320);
      ctx.lineTo(gx - 150 + side * 60 - 30, gy + 320);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();
}

/** ~60 steady phone lights across the visible stand: each pops on between 0.42 and 0.66 and twinkles slowly (±30%). */
function drawPhones(ctx: CanvasRenderingContext2D, t: number) {
  ctx.save();
  const bx = backdrop(ctx);
  const shift = bx * 0.25;
  const L0 = bx - 360 / view.z, R0 = bx + 360 / view.z;
  for (const p of phones) {
    const x = p.u + shift;
    if (x < L0 || x > R0) continue;
    const on = clamp((t - p.on) / (2 / 60));
    if (on <= 0) continue;
    const k = on * (1 + 0.3 * Math.sin(t * p.f * 2.4 + p.ph));
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(p.lilac ? LILAC : IVORY), x + 0.5, p.v + 0.5, p.big ? 4.5 : 3.2, 0.32 * k);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = clamp(0.85 * k);
    ctx.fillStyle = p.lilac ? '#C9B6FF' : '#F6F0DF';
    ctx.fillRect(x, p.v, p.big ? 2 : 1, p.big ? 2 : 1);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ---------------------------------------------------------------- the pitch (perspective plane)

/** Seeded turf speckles (depth s; an x offset that tiles with the scroll at its depth's speed). */
const specks: { X: number; s: number; q: number; dark: boolean }[] = [];
function buildSpecks() {
  if (specks.length) return;
  const r = new Rng(502);
  for (let i = 0; i < 700; i++) {
    const y = r.range(HZ + 6, VH + 40);
    const s = (y - HZ) / (GY - HZ);
    specks.push({ X: r.range(0, 800), s, q: s > 1.05 && r.next() < 0.4 ? 3 : s > 0.55 ? 2 : 1, dark: r.next() < 0.55 });
  }
}
const SPECK_W = 800;
/** The far touchline's depth. */
const S_FAR = 0.07;

/** A line on the turf at constant X from depth s0 to s1 (a tapered quad: thinner far away). */
function lineX(ctx: CanvasRenderingContext2D, X: number, s0: number, s1: number, w = 2.4) {
  const [x0, y0] = gp(X, s0), [x1, y1] = gp(X, s1);
  const a = Math.max(0.6, w * s0) / 2, b = Math.max(0.6, w * s1) / 2;
  ctx.beginPath();
  ctx.moveTo(x0 - a, y0);
  ctx.lineTo(x0 + a, y0);
  ctx.lineTo(x1 + b, y1);
  ctx.lineTo(x1 - b, y1);
  ctx.closePath();
  ctx.fill();
}
/** A line on the turf at constant depth s from X0 to X1 (horizontal on screen; foreshortened thickness). */
function lineS(ctx: CanvasRenderingContext2D, s: number, X0: number, X1: number) {
  const [x0, y] = gp(X0, s), [x1] = gp(X1, s);
  const th = Math.max(0.7, 1.9 * s * s);
  ctx.fillRect(Math.min(x0, x1), y - th / 2, Math.abs(x1 - x0), th);
}

/** The pitch markings in view: the far touchline, the penalty box, the six-yard box, the spot and the goal line. */
function pitchLines(ctx: CanvasRenderingContext2D, l: Layout) {
  const nearS = 1.6;
  // The far touchline, half as bright (distance haze).
  const a0 = ctx.globalAlpha;
  ctx.globalAlpha = a0 * 0.5;
  lineS(ctx, S_FAR, view.x - 700 / S_FAR, view.x + 700 / S_FAR);
  ctx.globalAlpha = a0;
  lineX(ctx, l.XG, S_FAR, nearS);
  lineX(ctx, l.XBOX, 0.2, nearS);
  lineS(ctx, 0.2, l.XBOX, l.XG);
  lineX(ctx, l.X6, 0.33, 0.62);
  lineS(ctx, 0.33, l.X6, l.XG);
  lineS(ctx, 0.62, l.X6, l.XG);
  const [px, py] = gp(lerp(l.XBOX, l.X6, 0.55), 0.47);
  ctx.fillRect(px - 1.5, py - 0.6, 3, 1.4);
}

function drawPitch(env: Env, l: Layout) {
  const ctx = env.ctx;
  const halfW = VW / (2 * view.z) + 40;
  const left = view.x - halfW, right = view.x + halfW;
  const bottom = view.y + VH / (2 * view.z) + 20;
  const g = ctx.createLinearGradient(0, HZ, 0, bottom);
  g.addColorStop(0, '#163f22');
  g.addColorStop(0.18, '#205a2b');
  g.addColorStop(0.6, '#2a7a36');
  g.addColorStop(1, '#2c8238');
  ctx.fillStyle = g;
  ctx.fillRect(left, HZ - 1, right - left, bottom - HZ + 1);
  // Mowing stripes (bands of constant X) converging on the vanishing point.
  const SW = 230;
  const sB = (bottom - HZ) / (GY - HZ);
  ctx.fillStyle = 'rgba(150,230,140,0.07)';
  ctx.beginPath();
  const k0 = Math.floor((view.x - halfW / sB - 400) / SW), k1 = Math.ceil((view.x + halfW / sB + 400) / SW);
  for (let k = k0 - (((k0 % 2) + 2) % 2); k <= k1; k += 2) {
    const [xa] = gp(k * SW, sB), [xb] = gp((k + 1) * SW, sB);
    ctx.moveTo(view.x, HZ);
    ctx.lineTo(xa, bottom);
    ctx.lineTo(xb, bottom);
    ctx.closePath();
  }
  ctx.fill();
  // Far haze: the far side of the pitch recedes into the stand's shadow.
  const hz = ctx.createLinearGradient(0, HZ, 0, HZ + 40);
  hz.addColorStop(0, 'rgba(14,10,26,0.55)');
  hz.addColorStop(1, 'rgba(14,10,26,0)');
  ctx.fillStyle = hz;
  ctx.fillRect(left, HZ - 1, right - left, 41);
  // Turf speckle: it scrolls at each depth's speed, so the ground visibly runs under him.
  for (const p of specks) {
    const off = ((((p.X - view.x * p.s) % SPECK_W) + SPECK_W) % SPECK_W) - SPECK_W / 2;
    const x = view.x + off, y = HZ + (GY - HZ) * p.s;
    if (x < left || x > right || y > bottom) continue;
    ctx.fillStyle = p.dark ? 'rgba(16,52,24,0.55)' : 'rgba(120,196,100,0.22)';
    ctx.fillRect(x, y, p.q, Math.max(1, p.q - 1));
  }
  ctx.fillStyle = 'rgba(236,242,250,0.78)';
  pitchLines(ctx, l);
}

/** The goal: back net and far post (behind the keeper), then the near post and crossbar (in front of him). */
function drawGoalBack(ctx: CanvasRenderingContext2D, l: Layout, fluoro = 0) {
  const [fx, fy] = gp(l.XG, GOAL.far), [nx, ny] = gp(l.XG, GOAL.near);
  const [bfx, bfy] = gp(l.XG + 110, GOAL.far), [bnx, bny] = gp(l.XG + 110, GOAL.near);
  const hF = GOAL.h * GOAL.far, hN = GOAL.h * GOAL.near;
  ctx.save();
  ctx.globalAlpha = fluoro ? 0.22 * fluoro : 0.3;
  ctx.strokeStyle = fluoro ? '#C9B6FF' : '#d8dde8';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  // The net roof and back panel (lower at the back) as a coarse mesh.
  for (let i = 0; i <= 8; i++) {
    const u = i / 8;
    const x0 = lerp(fx, nx, u), y0 = lerp(fy - hF, ny - hN, u);
    const x1 = lerp(bfx, bnx, u), y1 = lerp(bfy - hF * 0.7, bny - hN * 0.7, u);
    const yb = lerp(bfy, bny, u);
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x1, yb);
  }
  for (let j = 1; j <= 5; j++) {
    const v = j / 6;
    ctx.moveTo(bfx, lerp(bfy - hF * 0.7, bfy, v));
    ctx.lineTo(bnx, lerp(bny - hN * 0.7, bny, v));
  }
  ctx.stroke();
  ctx.restore();
  post(ctx, fx, fy, hF, GOAL.far, fluoro);
}
function drawGoalFront(ctx: CanvasRenderingContext2D, l: Layout, fluoro = 0) {
  const [fx, fy] = gp(l.XG, GOAL.far), [nx, ny] = gp(l.XG, GOAL.near);
  const hF = GOAL.h * GOAL.far, hN = GOAL.h * GOAL.near;
  ctx.save();
  ctx.fillStyle = fluoro ? '#C9B6FF' : '#eef0f6';
  ctx.globalAlpha = fluoro ? 0.45 * fluoro : 1;
  const w0 = 12 * GOAL.far, w1 = 12 * GOAL.near;
  ctx.beginPath();
  ctx.moveTo(fx, fy - hF);
  ctx.lineTo(nx, ny - hN);
  ctx.lineTo(nx, ny - hN + w1);
  ctx.lineTo(fx, fy - hF + w0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  post(ctx, nx, ny, hN, GOAL.near, fluoro);
}
function post(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, s: number, fluoro: number) {
  const w = 13 * s;
  ctx.save();
  if (fluoro) {
    ctx.globalAlpha = 0.45 * fluoro;
    ctx.fillStyle = '#C9B6FF';
    ctx.fillRect(x - w / 2, y - h, w, h);
  } else {
    ctx.fillStyle = '#eef0f6';
    ctx.fillRect(x - w / 2, y - h, w, h);
    ctx.fillStyle = 'rgba(120,128,160,0.55)';
    ctx.fillRect(x + w / 6, y - h, w / 3, h);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the stage light

/** The spot's lamp: 60% on its first frame, then full (a 2-frame lamp ramp). */
const spotK = (t: number) => (t < SPOT_T - 1e-6 ? 0 : t < SPOT_T + 1 / 60 - 1e-6 ? 0.6 : 1);
/** The iris opening as the lamp strikes: 0.82 -> 1 over 4 frames with a small overshoot. */
const spotOpen = (t: number) => lerp(0.82, 1, ease.outBack(clamp((t - SPOT_T) / (4 / 60))));
/** The pool's aim: a little ahead of his pelvis, so his boots and the ball sit inside it. */
const AIM = 18;

function holeAt(t: number): StagePool | null {
  if (t < SPOT_T - 1e-6) return null;
  const open = spotOpen(t) * stage.flare(t, SPOT_T).size;
  const [x, y] = toScreen(spot.x, GY - 98);
  return { x, y, rx: 90 * view.z * open, ry: 130 * view.z * open, soft: 40 * view.z, gain: 1 };
}

let maskCv: HTMLCanvasElement | null = null;
/** Draw `fn` (current transform) into a reused full-frame layer, punch the pool out of it, and lay it on the frame:
 *  A's dark-stage silhouette only outside the light, so the half of him nearest No.10 shows his real colours. */
function outsidePool(env: Env, pool: StagePool, fn: (g: CanvasRenderingContext2D) => void) {
  const main = env.ctx;
  const W = main.canvas.width, H = main.canvas.height;
  if (!maskCv) maskCv = document.createElement('canvas');
  if (maskCv.width !== W || maskCv.height !== H) {
    maskCv.width = W;
    maskCv.height = H;
  }
  const g = maskCv.getContext('2d')!;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-over';
  g.globalAlpha = 1;
  g.clearRect(0, 0, W, H);
  g.setTransform(main.getTransform());
  g.imageSmoothingEnabled = false;
  fn(g);
  g.setTransform(env.S, 0, 0, env.S, 0, 0);
  g.globalCompositeOperation = 'destination-out';
  g.globalAlpha = 1;
  const soft = pool.soft ?? 40, R = pool.rx + soft;
  g.translate(pool.x, pool.y);
  g.scale(1, pool.ry / pool.rx);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, R);
  gr.addColorStop(0, 'rgba(0,0,0,1)');
  gr.addColorStop(clamp(pool.rx / R), 'rgba(0,0,0,1)');
  gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr;
  g.fillRect(-R, -R, R * 2, R * 2);
  g.globalCompositeOperation = 'source-over';
  main.save();
  main.setTransform(1, 0, 0, 1, 0, 0);
  main.globalAlpha = 1;
  main.globalCompositeOperation = 'source-over';
  main.drawImage(maskCv, 0, 0);
  main.restore();
}

/** Draw `fn` (current transform) into the reused full-frame layer and lay it on the frame. `fn` paints far to near
 *  and calls `cut(figs)` after the layers each figure stands in front of: the figure's opaque cached sprite is
 *  punched out of everything painted so far (destination-out), so a line or post never crosses a body. */
function behindWall(env: Env, fn: (g: CanvasRenderingContext2D, cut: (figs: Fig[]) => void) => void) {
  const main = env.ctx;
  const W = main.canvas.width, H = main.canvas.height;
  if (!maskCv) maskCv = document.createElement('canvas');
  if (maskCv.width !== W || maskCv.height !== H) {
    maskCv.width = W;
    maskCv.height = H;
  }
  const g = maskCv.getContext('2d')!;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-over';
  g.globalAlpha = 1;
  g.clearRect(0, 0, W, H);
  g.setTransform(main.getTransform());
  g.imageSmoothingEnabled = false;
  fn(g, (figs) => {
    g.globalCompositeOperation = 'destination-out';
    g.globalAlpha = 1;
    for (const f of figs) drawFig(g, f, 1);
    g.globalCompositeOperation = 'source-over';
  });
  g.globalCompositeOperation = 'source-over';
  g.globalAlpha = 1;
  main.save();
  main.setTransform(1, 0, 0, 1, 0, 0);
  main.globalAlpha = 1;
  main.globalCompositeOperation = 'source-over';
  main.drawImage(maskCv, 0, 0);
  main.restore();
}

/** Punch No.10's frame (placed like drawSolo(env, key, x, GY, SC, { pivot: [0, SOLE] })) out of a layer. */
function cutSolo(g: CanvasRenderingContext2D, p: { img: HTMLCanvasElement }, x: number) {
  g.save();
  g.globalCompositeOperation = 'destination-out';
  g.globalAlpha = 1;
  g.imageSmoothingEnabled = false;
  g.translate(x, GY);
  g.scale(SC, SC);
  g.drawImage(p.img, 0, -SOLE);
  g.restore();
}

// ---------------------------------------------------------------- the shot

export const shotLights: Shot = {
  name: 'House lights',
  dur: DUR,
  seed: 502,
  rate: RATE[2],
  prepare(env) {
    const keys = [...new Set(seq.map(([, k]) => k))];
    warmSolo(env, keys);
    for (const k of keys) derive(env, k);
    buildPhones();
    buildSpecks();
    // Glow sprites and the reused full-frame layer (the dark accents behind the wall, A's half-lit silhouette): no
    // allocation at the CHUNK or the spot strike.
    for (const c of [[255, 248, 226], [255, 255, 255], IVORY, LILAC, PAL.uv, PAL.uvDeep] as RGB[]) glowOf(c);
    if (!maskCv) maskCv = document.createElement('canvas');
    maskCv.width = env.ctx.canvas.width;
    maskCv.height = env.ctx.canvas.height;
    for (const [kit, k, names] of [
      [RIVAL_KIT, DEPTH.A, ['jockey', 'shuffle', 'stepUp']],
      [RIVAL_KIT_B, DEPTH.B, ['jockeyWide', 'shuffleWide']],
      [RIVAL_KIT_C, DEPTH.C, ['ready']],
      [RIVAL_KIT_D, DEPTH.D, ['point', 'jockey']],
      [KEEPER_KIT, DEPTH.K, ['gkReady']],
    ] as const)
      for (const n of names) {
        pc.get(n, kit, POSE[n], k, FACE);
        pc.get(n, kit, POSE[n], k, FACE, RIM);
      }
  },
  init(env) {
    env.sfx.clearBus();
    buildPhones();
    buildSpecks();
    L = layout(env);
    spin = new BallSpin();
    spin.rotate(0.3, 1, 0.2, 0.7);
    prevBallX = ballX(L, 0);
    spot.snap(L.PX[0] + AIM, GY - 98);
    spotOn = false;
    dustDone = FOOTFALL_T.map(() => false);
    camAt(L, 0);
    env.cam.set(view.x, view.y, view.z, 0);
  },
  update(env, t, dt) {
    env.sfx.hum(HUM[2](t));
    const l = L!;
    // Ball spin locked to its roll (r 12 at x2).
    const bx = ballX(l, t);
    if (bx !== prevBallX) spin.rotate(0, 0, 1, (bx - prevBallX) / 12);
    prevBallX = bx;
    // The operator follows his pelvis (stepped with the frames) with a human lag; the lamp strikes right on him.
    const target = l.PX[idxAt(t)] + AIM;
    if (!spotOn && t >= SPOT_T - 1e-6) {
      spotOn = true;
      spot.snap(target, GY - 98);
    } else spot.update(target, GY - 98, dt);
    // A puff of turf dust kicked back at each footfall (fainter in the dark).
    FOOTFALL_T.forEach((ft, i) => {
      if (dustDone[i] || t < ft - 1e-6) return;
      dustDone[i] = true;
      const fi = idxAt(ft);
      const toe = l.OX[fi] + SC * soloPic(env, keyAt(fi)).anchor('contact')[0];
      for (let n = 0; n < 4; n++) {
        const side = n % 2 ? 1 : -1;
        env.parts.spawn({
          kind: PK.Smoke, x: toe + env.rng.range(-6, 4), y: GY - 2, vx: side * env.rng.range(20, 60), vy: -env.rng.range(6, 22),
          drag: 3, max: env.rng.range(0.3, 0.5), s0: 3, s1: env.rng.range(7, 11), ramp: 'dust',
          r0: 0.2, r1: 1, a0: ft >= SPOT_T ? 0.3 : 0.16, a1: 0, add: false, layer: 1,
        });
      }
    });
  },
  render(env, t) {
    const ctx = env.ctx;
    const l = L!;
    camAt(l, t);
    env.cam.set(view.x, view.y, view.z, 0);
    const lit = t >= SPOT_T - 1e-6;
    const pool = holeAt(t);
    const fl = stage.flare(t, SPOT_T);
    const sk = spotK(t);
    const open = lit ? spotOpen(t) * fl.size : 1;
    const dark = stepIn(t, BANK_T[1], DIE_F);
    const figs = figures(l, t);
    const fi = idxAt(t), key = keyAt(fi), hx = l.OX[fi];
    const heroO = { pivot: [0, SOLE] as [number, number] };
    const bX = ballX(l, t), bY = GY - 12;
    // Every touch is a drum hit: the ball's own glow kicks and decays over an 8th (local, tiny).
    let hit = 0;
    for (const tt of TOUCH_T) if (t >= tt - 1e-6 && t < tt + 0.2) hit = Math.max(hit, 1 - (t - tt) / 0.2);
    hit *= hit;

    // ---- the world (everything here is under the stage dim)
    env.world();
    drawStands(env, l, 0.6 * dark, t);
    drawPitch(env, l);
    drawGoalBack(ctx, l);
    // The wall, far to near (the keeper behind the near post), each with a soft contact shadow.
    const order = [figs[0], 'post', figs[1], figs[2], figs[3], figs[4]] as const;
    for (const f of order) {
      if (f === 'post') {
        drawGoalFront(ctx, l);
        continue;
      }
      const [x, y] = gp(f.X, f.s);
      ctx.fillStyle = 'rgba(6,4,14,0.4)';
      ctx.beginPath();
      ctx.ellipse(x - 4 * f.s, y, 26 * f.s, 5 * f.s, 0, 0, Math.PI * 2);
      ctx.fill();
      drawFig(ctx, f, 1);
    }
    // His contact shadow and the ball's (short, straight under them).
    ctx.fillStyle = 'rgba(8,4,16,0.45)';
    ctx.beginPath();
    ctx.ellipse(l.PX[fi] + 6, GY - 0.5, 34, 5, 0, 0, Math.PI * 2);
    ctx.ellipse(bX, GY - 0.5, 11, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    if (!lit) {
      // Before the spot finds him he is part of the dimming world.
      drawSolo(env, key, hx, GY, SC, heroO);
      if (dark <= 0) drawBall(env, spin, bX, bY, 12, 1, 0, 0, 'blacklight');
    }

    // ---- the stage dim (one soft hole once the spot is on)
    env.screen();
    stage.dim(ctx, lit ? 0.8 : dimLevel(t), pool ? [pool] : []);

    // ---- light sources and fluorescent accents
    env.world();
    drawLamps(env, l, t);
    if (dark > 0) {
      // Light sources and fluorescent lines keep the world's depth: one layer, painted far to near with each figure
      // cut out of what lies behind him (the keeper stands between the back net and the near post, the four
      // outfield defenders in front of the goal, No.10 in front of the stands and the far touchline until the spot
      // lifts him out of the world), so no line, post or phone light ever crosses a body.
      behindWall(env, (g, cut) => {
        drawPhones(g, t);
        g.save();
        g.globalAlpha = 0.3 * dark;
        g.fillStyle = '#C9B6FF';
        pitchLines(g, l);
        g.restore();
        drawGoalBack(g, l, dark);
        cut([figs[0]]);
        drawGoalFront(g, l, dark);
        cut(figs.slice(1));
        if (!lit) cutSolo(g, soloPic(env, key), hx);
      });
    }
    // The wall sinks into the dark: half-way to plum silhouettes with lilac rims as the house lights go (3 frames),
    // all the way when the spot strikes (4 frames). After the spot, A only outside the pool (his near half is lit).
    const sil = 0.45 * dark + 0.41 * stepIn(t, SPOT_T, 4);
    if (sil > 0) {
      for (const f of figs.slice(0, 4)) drawFig(ctx, f, 0, sil);
      const A = figs[4];
      if (pool) outsidePool(env, pool, (g) => drawFig(g, A, 0, sil));
      else drawFig(ctx, A, 0, sil);
    }
    // No.10 in the dark (0.40-0.80): a faint lilac rim, his white boots and the ball fluorescing.
    if (!lit && dark > 0) {
      const d = derive(env, key);
      drawSolo(env, key, hx, GY, SC, { ...heroO, alpha: 0.7 * dark }, d.rim);
      drawBoots(env, key, hx, dark, false);
      drawBall(env, spin, bX, bY, 12, 1, 0, (0.5 + 0.3 * hit) * dark, 'blacklight');
    }
    // ---- the follow-spot: beam, floor pool, then him and the ball in full colour
    if (lit) {
      const [px, py] = toScreen(spot.x, GY);
      env.screen();
      stage.beam(ctx, 560, -30, px, py, 26, 150 * view.z * open, 0.18 * sk * fl.gain, { t, seed: 2, motes: 26 });
      env.world();
      stage.floorPool(ctx, spot.x, GY - 1, 70 * open, 12 * open, 0.35 * sk * fl.gain);
      drawSolo(env, key, hx, GY, SC, heroO);
      drawBoots(env, key, hx, 0.85 * sk, true);
      drawBall(env, spin, bX, bY, 12, 1, 0, (0.85 + 0.3 * hit) * sk * (fl.gain > 1 ? 1.15 : 1), 'blacklight');
    }
    env.parts.draw(ctx, 1);

    // ---- HUD: the four-count pads fade in with the spot, unlit.
    env.screen();
    if (lit) fourCount(ctx, padsFor(2), t, { alpha: stepIn(t, SPOT_T, 12) });
    soloGrade(env.fx);
  },
  cues: [
    // 0.00 the ONE: the outer banks CHUNK off on a low tom (right-foot touch); the crowd murmurs.
    { at: BANK_T[0], fn: (env) => (env.sfx.lightsOff(1.0), env.sfx.tom(TOMS.D2), env.sfx.crowd(1.2, 0.18)) },
    { at: FOOTFALL_T[0], fn: (env) => env.sfx.scuff(0.1) },
    // 0.40: the inner banks CHUNK off (left-foot touch); the crowd hushes.
    { at: BANK_T[1], fn: (env) => (env.sfx.lightsOff(0.9), env.sfx.tom(TOMS.D2), env.sfx.duck(0.5, 0.6)) },
    { at: FOOTFALL_T[1], fn: (env) => env.sfx.scuff(0.1) },
    // 0.55: an awed "ooooh" as the phone lights come on. ooh() goes through the crowd bus, which the 0.40 duck holds
    // at 0.5 until 1.00, so 0.6 here is the brief's ooh(0.3) net level: the hush, then the ooh rising out of it.
    { at: 0.55, fn: (env) => env.sfx.ooh(0.6) },
    // 0.80: SPOT ON (right-foot touch); the lamp hum starts (HUM[2] state, fed from update).
    { at: SPOT_T, fn: (env) => (env.sfx.spotOn(1.0), env.sfx.tom(TOMS.F2)) },
    { at: FOOTFALL_T[2], fn: (env) => env.sfx.scuff(0.12) },
    // 1.00: the pickup 8th (left foot) on the beat-snap.
    { at: TOUCH_T[3], fn: (env) => (env.sfx.tom(TOMS.A2), env.sfx.hat()) },
    { at: FOOTFALL_T[3], fn: (env) => env.sfx.scuff(0.12) },
  ],
};
