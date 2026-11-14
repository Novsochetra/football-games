// SHOT 6 — CRESCENT ORBIT: bird's-eye view straight down on the penalty area.
// The crimson comet leaves No.10's bicycle kick and bends toward goal on a banana path.
// Two crescent blades orbit the ball like twin moons; their edges burn two curved scorch
// lines into the grass, so the ball's wake is a crescent carved into the pitch. Three white
// defenders lunge, jump and slide at it and are scythed away spinning as the blades pass.
// The camera banks with the curve, then rises to reveal the burnt crescent igniting while
// the ball reaches the six-yard box in front of the keeper.

import type { Shot, Env } from '../timeline';
import { TAU, Rng, clamp, ease, lerp } from '../../engine/math';
import { VW, VH } from '../../engine/camera';
import { PK, drawGlow, glowSprite } from '../../engine/particles';
import { BallSpin, PixelBuffer } from '../../engine/pixel';
import { speedStreaks } from '../../art/fx';
import { RIVAL_KIT, RIVAL_KIT_B, KEEPER_KIT, type Kit } from '../../art/puppet';
import { Trail, crescentArc, crescentPath, crimsonRibbon, drawBall, meteorFlames, pulse, warp } from './common';

const DUR = 2.0;

// ---------------------------------------------------------------- Pitch (top-down world px)
// Goal line at x = 0, pitch centre line of the goal at y = 0, goal to the RIGHT (+x).
// Scale: 14 world px per metre.
const BOX_D = 231, BOX_W = 282; // penalty area 16.5 m x 40.3 m
const SIX_D = 77, SIX_W = 128; // six-yard box 5.5 m x 18.3 m
const SPOT = 154, ARC_R = 128; // penalty spot 11 m, arc 9.15 m
const GW = 51, ND = 28, HB = 34; // goal half-width, net depth, crossbar height
const BOARD_X = 92; // ad boards behind the goal
const STAND_X = 110; // first row of the stand
const PX0 = -720, PY0 = -440, PW = 1000, PH = 880; // pre-rendered ground canvas
const PARA = 0.0012; // perspective: screen offset per world px of height per px from centre

// ---------------------------------------------------------------- Timing
const HITS = [0.5, 0.92, 1.36]; // blade strikes on the three defenders (real time)
const STOPS: [number, number, number][] = [
  [HITS[0], 0.06, 0.15],
  [HITS[1], 0.09, 0.1],
  [HITS[2], 0.06, 0.15],
];
const UNFURL = 0.05; // blades spring out of the ball
const REVEAL = 1.3; // camera starts rising for the reveal
const IGN = 1.46; // the burnt crescent ignites (tail -> head)
const IGN_LEN = 0.38;

/** Simulated time at real time t (hit-stops slow the simulation). */
function simAt(t: number) {
  let s = t;
  for (const [a, l, r] of STOPS) s -= clamp(t - a, 0, l) * (1 - r);
  return s;
}
const SIM_T = simAt(DUR) - 0.004;
/** Arc-length fraction of the ball at sim time s: the flight is weighted toward the end, and over
 *  the last ~0.4 s the comet whips off the end of its crescent and darts straight at the keeper
 *  (u runs past 1 onto the straight exit, at ~3x its mid-flight speed by the cut). */
const DART0 = 0.78, DART_U = 0.12;
const ballU = (s: number) => {
  const x = clamp(s / SIM_T);
  const d = Math.max(0, (x - DART0) / (1 - DART0));
  return x * (0.72 + 0.28 * x * x) + DART_U * Math.pow(d, 2.5);
};

// Entry: the comet arrives from shot 5 still blazing. It starts ENTRY_E world px behind the path
// start (at the lower-left edge of frame 0) and rockets in along its heading, braking into its orbit
// by ENTRY_T, while the camera's whip-pan from shot 5 carries on forward and settles (CAM_LAG).
// The turf keeps streaming the way shot 5's whip sent it, and the ball overtakes it.
const ENTRY_T = 0.4, ENTRY_E = 180;
const CAM_LAG_T = 0.32, CAM_LAG = 62;
const LEAD = 34;
const entryE = (t: number) => ENTRY_E * Math.pow(1 - clamp(t / ENTRY_T), 3);
const camLag = (t: number) => CAM_LAG * Math.pow(1 - clamp(t / CAM_LAG_T), 3);
/** The blades only start to burn once the comet has braked into its orbit (SCORCH_T), and the burn
 *  widens from a point there, so the crescent keeps its tapered tail tip. */
const SCORCH_E = 22;
const SCORCH_T = ENTRY_T * (1 - Math.cbrt(SCORCH_E / ENTRY_E));
const scorchTaper = (t: number) => ease.inOutQuad(clamp((t - SCORCH_T) / 0.2));

// ---------------------------------------------------------------- The banana path
// Integrated curvature: heading turns from -80 deg (out wide, away from goal centre) to
// +30 deg (curling back in toward the far post), curling harder as it goes.
const PATH_N = 240;
const PATH_L = 252;
const S0X = -258, S0Y = 72;
const H0 = (-80 * Math.PI) / 180, H1 = (30 * Math.PI) / 180;
const pathX = new Float64Array(PATH_N + 1);
const pathY = new Float64Array(PATH_N + 1);
const pathH = new Float64Array(PATH_N + 1);
(() => {
  let x = S0X, y = S0Y;
  pathX[0] = x;
  pathY[0] = y;
  pathH[0] = H0;
  for (let i = 0; i < PATH_N; i++) {
    const h = H0 + (H1 - H0) * Math.pow((i + 0.5) / PATH_N, 1.1);
    x += (Math.cos(h) * PATH_L) / PATH_N;
    y += (Math.sin(h) * PATH_L) / PATH_N;
    pathX[i + 1] = x;
    pathY[i + 1] = y;
    pathH[i + 1] = H0 + (H1 - H0) * Math.pow((i + 1) / PATH_N, 1.1);
  }
})();
function pathAt(u: number) {
  if (u > 1) {
    // Straight exit off the end of the banana, along its final heading (the dart at the keeper).
    const e = (u - 1) * PATH_L;
    return { x: pathX[PATH_N] + Math.cos(H1) * e, y: pathY[PATH_N] + Math.sin(H1) * e, h: H1, hx: Math.cos(H1), hy: Math.sin(H1) };
  }
  const f = clamp(u) * PATH_N;
  const i = Math.min(PATH_N - 1, Math.floor(f));
  const k = f - i;
  const h = lerp(pathH[i], pathH[i + 1], k);
  return { x: lerp(pathX[i], pathX[i + 1], k), y: lerp(pathY[i], pathY[i + 1], k), h, hx: Math.cos(h), hy: Math.sin(h) };
}
/** Orbit radius of the blades along the path: thin at both tips, widest mid-flight -> a crescent. */
const orbitR = (u: number) => 3 + 27 * Math.pow(Math.sin(Math.PI * clamp(u)), 0.9);
const BLADE_R = 13;
const BLADE_BITE = 0.52;
const BLADE_H = 8;
const BALL_H = 5;
const SKID_K = 0.15; // lunge fraction where the slider's boots hit the grass

// Blade phase keyed so a blade is exactly at each defender when he is struck.
const OMEGA = 13;
interface DefSpec {
  kit: Kit;
  hit: number;
  side: 1 | -1; // +1 inner side of the curve, -1 outer
  kind: 'lunge' | 'jump' | 'slide';
  back: number; // start distance from the hit point (away from the ball)
  along: number; // start offset along the ball heading
  lunge: number; // lunge duration (sim s)
}
const SPECS: DefSpec[] = [
  { kit: RIVAL_KIT, hit: HITS[0], side: 1, kind: 'lunge', back: 30, along: 18, lunge: 0.36 },
  { kit: RIVAL_KIT_B, hit: HITS[1], side: -1, kind: 'jump', back: 26, along: 30, lunge: 0.42 },
  { kit: RIVAL_KIT, hit: HITS[2], side: 1, kind: 'slide', back: 46, along: 26, lunge: 0.4 },
];
const HIT_GEO = SPECS.map((d) => {
  const s = simAt(d.hit);
  const u = ballU(s);
  const p = pathAt(u);
  const th = p.h + (d.side * Math.PI) / 2; // direction ball -> defender
  const r = orbitR(u) + 9;
  return { s, u, th, px: p.x + Math.cos(th) * r, py: p.y + Math.sin(th) * r };
});
const PHASE: [number, number][] = (() => {
  const out: [number, number][] = [[HIT_GEO[0].s, HIT_GEO[0].th]];
  for (let i = 1; i < HIT_GEO.length; i++) {
    const [ps, pp] = out[i - 1];
    const target = pp + OMEGA * (HIT_GEO[i].s - ps);
    const th = HIT_GEO[i].th;
    out.push([HIT_GEO[i].s, th + Math.PI * Math.round((target - th) / Math.PI)]);
  }
  return out;
})();
function phiAt(s: number) {
  if (s <= PHASE[0][0]) return PHASE[0][1] - OMEGA * (PHASE[0][0] - s);
  for (let i = 1; i < PHASE.length; i++) {
    if (s <= PHASE[i][0]) {
      const [a, pa] = PHASE[i - 1], [b, pb] = PHASE[i];
      return lerp(pa, pb, (s - a) / (b - a));
    }
  }
  const [l, pl] = PHASE[PHASE.length - 1];
  return pl + OMEGA * (s - l);
}

// Camera framing for the reveal (whole crescent, keeper and goal in frame).
const REV_X = -138, REV_Y = -6, REV_Z = 1.28, REV_ROT = -0.07;

// ---------------------------------------------------------------- State
interface Def {
  spec: DefSpec;
  x: number;
  y: number;
  h: number;
  vx: number;
  vy: number;
  vh: number;
  ang: number;
  vang: number;
  knocked: boolean;
  kt: number;
  landed: boolean;
  // ball geometry at the strike (for the slash)
  hbx: number;
  hby: number;
  hr: number;
  hth: number;
}
interface EdgePt {
  x: number;
  y: number;
  s: number;
  u: number;
}

let spin = new BallSpin();
const trail = new Trail(22);
let sim = 0;
let bx = S0X, by = S0Y, bang = H0, br = 0, phi = 0;
let outer: EdgePt[] = [];
let inner: EdgePt[] = [];
let defs: Def[] = [];
let kx = -12, ky = 0, kang = Math.PI;
let ignAcc = 0;
let emberAcc = 0;
let slideAcc = 0;
let streakAcc = 0;

// Figure pixel buffers (allocated once, reused every frame).
const FB = 32;
const FD = 2;
let bufs: PixelBuffer[] = [];
let pitchCv: HTMLCanvasElement | null = null;
const FLASHES: { x: number; y: number; t: number }[] = (() => {
  const r = new Rng(6061);
  const out = [];
  for (let i = 0; i < 46; i++) out.push({ x: r.range(STAND_X + 6, PX0 + PW - 6), y: r.range(PY0 + 10, PY0 + PH - 10), t: r.range(0, 4) });
  return out;
})();

const unfurl = (t: number) => clamp((t - UNFURL) / 0.22);
/** Radius the blades are drawn at: never collapses onto the ball (the scorch rims still taper with `br`). */
const bladeOrbit = (t: number) => Math.max(br, 15 * ease.outBack(unfurl(t)));

export const shotOrbit: Shot = {
  name: 'Crescent orbit',
  dur: DUR,
  seed: 106,
  rate: (t) => warp(t, STOPS),
  cues: [
    { at: 0, fn: (e) => { e.sfx.whoosh(0.8, 2600, 420, 0.45); e.sfx.roar(1.9, 0.4); e.sfx.crackle(1.9, 0.16); } },
    { at: UNFURL + 0.02, fn: (e) => e.sfx.shing(1.25) },
    ...HITS.map((h, i) => ({
      at: h,
      fn: (e: Env) => {
        e.sfx.crack(0.7 + i * 0.12);
        e.sfx.boom(0.45 + i * 0.15, 0.35);
        e.sfx.whoosh(0.22, 2400, 700, 0.28);
      },
    })),
    // The third (biggest) hit lands alone at 1.36; the reveal swell and the ignition rumble follow it.
    { at: REVEAL + 0.22, fn: (e) => { e.sfx.whoosh(0.5, 240, 1500, 0.3); e.sfx.crowd(1.0, 0.3); } },
    { at: IGN + 0.08, fn: (e) => e.sfx.rumble(0.55, 0.4) },
  ],
  init(env) {
    spin = new BallSpin();
    trail.clear();
    sim = 0;
    const p0 = pathAt(0);
    bx = p0.x - p0.hx * ENTRY_E;
    by = p0.y - p0.hy * ENTRY_E;
    bang = p0.h;
    br = 0;
    phi = phiAt(0);
    // The comet is already in flight at full speed: pre-fill its long wake back toward No.10 (off-screen).
    for (let i = 21; i >= 1; i--) trail.push(bx - p0.hx * i * 22, by - p0.hy * i * 22);
    trail.push(bx, by);
    outer = [];
    inner = [];
    defs = SPECS.map((spec, i) => {
      const g = HIT_GEO[i];
      const p = pathAt(g.u);
      const x = g.px + Math.cos(g.th) * spec.back - p.hx * spec.along;
      const y = g.py + Math.sin(g.th) * spec.back - p.hy * spec.along;
      return {
        spec, x, y, h: 0, vx: 0, vy: 0, vh: 0, ang: g.th + Math.PI, vang: 0,
        knocked: false, kt: -1, landed: false, hbx: 0, hby: 0, hr: 0, hth: 0,
      };
    });
    kx = -12;
    ky = 2;
    kang = Math.PI;
    ignAcc = 0;
    emberAcc = 0;
    slideAcc = 0;
    streakAcc = 0;
    // Same framing update() computes for t = 0 (the whip-pan still lagging), so frame 0 -> 1 does not jump.
    env.cam.set(p0.x + p0.hx * (LEAD - CAM_LAG), p0.y + p0.hy * (LEAD - CAM_LAG), 1.95, 1.0);
    env.cam.hit(0.3);
  },
  update(env, t, dt) {
    const { rng, parts, cam } = env;
    sim += dt;
    const u = ballU(sim);
    const p = pathAt(u);
    const eE = entryE(t);
    const pbx = bx, pby = by;
    bx = p.x - Math.cos(H0) * eE;
    by = p.y - Math.sin(H0) * eE;
    bang = p.h;
    br = orbitR(u) * ease.outBack(unfurl(t));
    phi = phiAt(sim);
    trail.push(bx, by);
    spin.rotate(-p.hy, p.hx, 0.8, dt * 34);

    // Comet flames (crimson) streaming back from the ball (fuller while it rockets in). Spread
    // along this frame's travel, so a fast comet leaves a continuous plume, not beads.
    const steps = Math.max(1, Math.ceil(Math.hypot(bx - pbx, by - pby) / 6));
    for (let k = 1; k <= steps; k++) {
      meteorFlames(env, lerp(pbx, bx, k / steps), lerp(pby, by, k / steps), 5, bang, 0.3 + 0.4 * (eE / ENTRY_E), dt / steps, 'crimson');
    }

    // Scorch edges: the blade orbit's outer and inner rims burn into the grass.
    if (t > UNFURL && t >= SCORCH_T) {
      const nx = -p.hy, ny = p.hx; // right-hand normal = inner side of the curve
      const sr = br * scorchTaper(t);
      const last = outer[outer.length - 1];
      if (!last || Math.hypot(bx - last.x - nx * -sr, by - last.y - ny * -sr) > 2.2) {
        outer.push({ x: bx - nx * sr, y: by - ny * sr, s: sim, u });
        inner.push({ x: bx + nx * sr, y: by + ny * sr, s: sim, u });
      }
      // Embers and thin smoke from the freshly burnt rims.
      emberAcc += dt * 60;
      while (emberAcc >= 1) {
        emberAcc -= 1;
        const sd = rng.next() < 0.5 ? -1 : 1;
        const ex = bx + nx * sr * sd - p.hx * rng.range(4, 26), ey = by + ny * sr * sd - p.hy * rng.range(4, 26);
        parts.spawn({
          kind: PK.Pixel, x: ex, y: ey, vx: rng.range(-20, 20) - p.hx * 30, vy: rng.range(-20, 20) - p.hy * 30, drag: 2,
          max: rng.range(0.3, 0.7), s0: 2, s1: 1, ramp: 'crimson', r0: rng.range(0.3, 0.45), r1: 0.9, a0: 1, a1: 0, layer: 0,
        });
        if (rng.next() < 0.35) {
          parts.spawn({
            kind: PK.Smoke, x: ex, y: ey, vx: rng.range(6, 22), vy: rng.range(-22, -6), drag: 1,
            max: rng.range(0.6, 1.1), s0: rng.range(3, 5), s1: rng.range(9, 14), ramp: 'smoke', r0: 0, r1: 1, a0: 0.28, a1: 0, add: false, layer: 0,
          });
        }
      }
    }

    // Ignition: a wave of crimson fire runs along the burnt crescent from tail to head.
    if (t > IGN && outer.length > 3) {
      const w = clamp((t - IGN) / IGN_LEN);
      // Behind the wave front while it runs; once it has finished, all along the crescent.
      ignAcc += dt * (w < 1 ? 70 : 40);
      while (ignAcc >= 1) {
        ignAcc -= 1;
        const n = Math.min(outer.length, inner.length);
        const i = w < 1 ? Math.min(n - 1, Math.floor(clamp(w + rng.range(-0.12, 0.02)) * (n - 1))) : rng.int(0, n - 1);
        // Mostly on the molten inner (leading) rim, some across the burnt band.
        const q = rng.next() < 0.75 ? rng.range(0.85, 1) : rng.range(0.15, 0.85);
        const ex = lerp(outer[i].x, inner[i].x, q), ey = lerp(outer[i].y, inner[i].y, q);
        parts.spawn({
          kind: PK.Glow, x: ex + rng.range(-2, 2), y: ey + rng.range(-2, 2), vx: rng.range(-14, 14) + 12, vy: rng.range(-14, 14) - 18,
          max: rng.range(0.25, 0.55), s0: rng.range(4, 8), s1: 1, ramp: 'crimson', r0: rng.range(0.5, 0.65), r1: 1, a0: 0.55, a1: 0, layer: 0,
        });
        // Wisps of dark smoke drifting off the burning turf (break up the flat fill).
        if (rng.next() < 0.3) {
          parts.spawn({
            kind: PK.Smoke, x: ex, y: ey, vx: rng.range(4, 20), vy: rng.range(-26, -8), drag: 1,
            max: rng.range(0.5, 0.9), s0: rng.range(3, 5), s1: rng.range(12, 18), ramp: 'smoke', r0: 0, r1: 1, a0: 0.26, a1: 0, add: false, layer: 0,
          });
        }
      }
    }

    // Defenders.
    for (const d of defs) {
      const g = HIT_GEO[defs.indexOf(d)];
      if (!d.knocked) {
        const k = clamp((sim - (g.s - d.spec.lunge)) / d.spec.lunge);
        const e = d.spec.kind === 'slide' ? ease.outQuad(k) : ease.inOutQuad(k);
        const p0x = g.px + Math.cos(g.th) * d.spec.back - pathAt(g.u).hx * d.spec.along;
        const p0y = g.py + Math.sin(g.th) * d.spec.back - pathAt(g.u).hy * d.spec.along;
        d.x = lerp(p0x, g.px, e);
        d.y = lerp(p0y, g.py, e);
        if (d.spec.kind === 'jump') d.h = 24 * Math.sin(Math.PI * 0.62 * clamp((sim - (g.s - 0.34)) / 0.34));
        const want = Math.atan2(by - d.y, bx - d.x);
        d.ang = want;
        if (d.spec.kind === 'slide' && k > SKID_K && k < 1) {
          // Turf spray kicked up by the sliding boots (two puffs a frame).
          slideAcc += dt * 120;
          while (slideAcc >= 1) {
            slideAcc -= 1;
            parts.spawn({
              kind: PK.Smoke, x: d.x + rng.range(-4, 4), y: d.y + rng.range(-4, 4), vx: rng.range(-20, 20), vy: rng.range(-20, 20), drag: 2,
              max: rng.range(0.4, 0.8), s0: 4, s1: rng.range(16, 24), ramp: 'dust', r0: 0, r1: 1, a0: 0.55, a1: 0, add: false, layer: 0,
            });
          }
        }
        if (t >= d.spec.hit) {
          d.knocked = true;
          d.kt = t;
          d.hbx = bx;
          d.hby = by;
          d.hr = br;
          d.hth = Math.atan2(d.y - by, d.x - bx);
          const th = d.hth, tg = th + Math.PI / 2; // clockwise orbit tangent
          // The first defender is swept mostly along the blade's arc (away from the slider waiting
          // to his right) and not as far, so the two never clump or land on top of each other.
          const first = d === defs[0];
          const sp = first ? rng.range(5, 15) : rng.range(150, 185);
          const tv = first ? 110 : 95;
          const hv = first ? 0 : 40;
          d.vx = Math.cos(th) * sp + Math.cos(tg) * tv + p.hx * hv;
          d.vy = Math.sin(th) * sp + Math.sin(tg) * tv + p.hy * hv;
          d.vh = 230 + d.h * 2;
          d.vang = 17;
          cam.hit(d === defs[1] ? 0.6 : 0.42);
          const cx = bx + Math.cos(th) * (br + 4), cy = by + Math.sin(th) * (br + 4);
          // One faint crimson ring; the silver one is a crescent shock (drawn with the strike slash).
          parts.spawn({ kind: PK.Ring, x: d.x, y: d.y, s0: 8, s1: 74, max: 0.5, k: 1, ramp: 'crimson', r0: 0.4, r1: 1, a0: 0.5, a1: 0, rot: 0 });
          if (d === defs[1]) {
            // Mid-air: crimson sparks over the white-flashed jumper keep him readable (silver on white would blur into one mass).
            topSparks(env, cx, cy, 22, 560, tg, 1.3, 'crimson', 0.4);
            topSparks(env, cx, cy, 10, 420, tg + 0.6, 0.8, 'silver');
          } else {
            topSparks(env, cx, cy, 26, 520, tg, 1.6, 'silver');
            topSparks(env, cx, cy, 14, 380, th, 1.4, 'crimson');
          }
          for (let i = 0; i < 9; i++) {
            const a = rng.range(0, TAU), s = rng.range(40, 140);
            parts.spawn({
              kind: PK.Smoke, x: d.x, y: d.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 4,
              max: rng.range(0.5, 0.9), s0: rng.range(5, 8), s1: rng.range(14, 22), ramp: 'dust', r0: 0, r1: 1, a0: 0.5, a1: 0, add: false, layer: 0,
            });
          }
          // Turf clods and two shirt shreds (solid pixels, no outline, fading out: no popping specks).
          for (let i = 0; i < 12; i++) {
            const a = th + rng.range(-1.1, 1.1), s = rng.range(90, 300);
            const shred = i < 2;
            parts.spawn({
              kind: PK.Pixel, x: d.x, y: d.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 4,
              max: rng.range(0.4, 0.8), s0: rng.range(2, 3.4), s1: rng.range(1.6, 2.6),
              ramp: shred ? 'white' : i < 8 ? 'grass' : 'dust', r0: shred ? 0 : rng.range(0, 0.4), r1: shred ? 0.6 : rng.range(0.5, 1),
              a0: 1, a1: 0, add: false, layer: 1,
            });
          }
        }
      } else {
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.vh -= 1050 * dt;
        d.h += d.vh * dt;
        if (d.h <= 0) {
          d.h = 0;
          if (!d.landed && d.vh < 0) {
            d.landed = true;
            d.vh = -d.vh * 0.22;
            for (let i = 0; i < 6; i++) {
              const a = rng.range(0, TAU), s = rng.range(30, 90);
              parts.spawn({
                kind: PK.Smoke, x: d.x, y: d.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 3,
                max: rng.range(0.4, 0.8), s0: 5, s1: rng.range(12, 18), ramp: 'dust', r0: 0, r1: 1, a0: 0.4, a1: 0, add: false, layer: 0,
              });
            }
          } else d.vh = Math.max(0, d.vh);
          const f = Math.exp(-4.5 * dt);
          d.vx *= f;
          d.vy *= f;
          d.vang *= Math.exp(-3.5 * dt);
        }
        d.ang += d.vang * dt;
      }
    }

    // Keeper: shuffles across his line toward the ball's side, then coils for the dive.
    ky = lerp(2, -10, ease.inOutQuad(clamp(sim / 1.6)));
    kx = -12 + 3 * ease.inQuad(clamp((t - 1.6) / 0.4));
    const toBall = Math.atan2(by - ky, bx - kx);
    kang = lerp(Math.PI, toBall < 0 ? toBall + TAU : toBall, 0.55 + 0.45 * ease.inQuad(clamp((t - 1.55) / 0.45)));

    // Final sprint: silver streaks peel off the comet so it blazes into the six-yard box.
    if (t > 1.5) {
      streakAcc += dt * 120;
      while (streakAcc >= 1) {
        streakAcc -= 1;
        const a = bang + Math.PI + rng.range(-0.25, 0.25);
        const s = rng.range(160, 320);
        parts.spawn({
          kind: PK.Streak, x: bx - Math.cos(bang) * 9 + rng.range(-3, 3), y: by - Math.sin(bang) * 9 + rng.range(-3, 3), vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 5,
          max: rng.range(0.14, 0.28), s0: rng.range(1, 1.8), s1: 0.4, ramp: 'silver', r0: 0, r1: 1, k: 1.6, layer: 1,
        });
      }
    }

    // Camera: follow with a lead, banking with the curve (opens rolled hard so the comet
    // still flies up-right on screen as it did leaving shot 5), then rise for the reveal.
    // It tracks the comet's path (not its entry offset), so the ball shoots in from the lower-left
    // edge while the whip-pan settles forward.
    const rv = ease.inOutCubic(clamp((t - REVEAL) / 0.62));
    // Through the follow the comet slowly outruns the camera (drifts from left of centre to centre).
    const lead = LEAD - camLag(t) - 28 * ease.inOutQuad(clamp((t - 0.35) / 1.0));
    const fx = p.x + p.hx * lead, fy = p.y + p.hy * lead;
    const zoom = lerp(lerp(1.95, 1.8, ease.inOutQuad(clamp(t / REVEAL))), REV_Z * (1 + 0.05 * clamp((t - REVEAL - 0.4) / 0.3)), rv);
    const bank = lerp(1.0, -0.34 * bang, ease.inOutQuad(clamp(t / 0.9))) + Math.sin(t * 1.7) * 0.012;
    cam.set(lerp(fx, REV_X, rv), lerp(fy, REV_Y, rv), zoom, lerp(bank, REV_ROT, rv));
    cam.shakeAmp = 9;
    cam.trauma = Math.max(cam.trauma, 0.12);
  },
  render(env, t) {
    const { ctx, fx, cam } = env;
    const rng = env.frng();
    warmCaches(ctx);
    const rv = ease.inOutCubic(clamp((t - REVEAL) / 0.62));
    env.world();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(pitch(), PX0, PY0);

    // Stand: crowd camera flashes.
    ctx.globalCompositeOperation = 'lighter';
    for (const f of FLASHES) {
      const ph = (t * 0.9 + f.t) % 1.7;
      if (ph > 0.1) continue;
      drawGlow(ctx, glowSprite('white', 0), f.x, f.y, 7, 1 - ph / 0.1);
    }
    ctx.globalCompositeOperation = 'source-over';

    // Crimson light the comet throws on the grass (normal blend keeps it crimson on green).
    const gl = ctx.createRadialGradient(bx, by, 4, bx, by, 64);
    gl.addColorStop(0, 'rgba(40,0,22,0.55)');
    gl.addColorStop(0.45, 'rgba(110,6,44,0.3)');
    gl.addColorStop(1, 'rgba(110,6,44,0)');
    ctx.fillStyle = gl;
    ctx.fillRect(bx - 64, by - 64, 128, 128);

    drawSkids(ctx);
    drawScorch(env, t, rng);

    // Ground shadows (four floodlights -> four faint shadows each).
    for (const d of defs) figShadow(ctx, d.x, d.y, d.h, 1);
    figShadow(ctx, kx, ky, 0, 1);
    figShadow(ctx, bx, by, BALL_H, 0.55);
    const unf = unfurl(t);
    if (unf > 0) {
      const ro = bladeOrbit(t);
      ctx.fillStyle = 'rgb(4,6,18)';
      for (let k = 0; k < 2; k++) {
        const a = phi + k * Math.PI;
        ctx.globalAlpha = 0.3;
        bladeShape(ctx, bx + Math.cos(a) * ro + 5, by + Math.sin(a) * ro + 6, BLADE_R * ease.outBack(unf), a + Math.PI + 0.35, 0);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    env.parts.draw(ctx, 0);

    drawBoards(env, t);

    // Players (top-down pixel figures). Airborne defenders fly above the blade plane, so they
    // are drawn after the comet (the jumper stays readable while the blade scythes under him).
    const AIR_H = 12;
    const drawDef = (i: number) => {
      const d = defs[i];
      const kind = d.spec.kind;
      let pose: TP;
      if (d.knocked) pose = { ...TP0, splay: 1, spread: 1, lean: -0.4 };
      else {
        const k = clamp((sim - (HIT_GEO[i].s - d.spec.lunge)) / d.spec.lunge);
        if (kind === 'lunge') pose = { ...TP0, stride: 0.2 + 0.8 * k, reach: k, lean: k };
        else if (kind === 'jump') pose = { ...TP0, stride: 0.3 * (1 - k), spread: 0.4 + 0.6 * k, reach: 0.5 * k, lean: 0.4 * k };
        else pose = { ...TP0, slide: ease.outQuad(clamp(k * 1.6)), spread: 0.5 * k, lean: -0.6 * k };
      }
      const flashA = d.knocked ? clamp(1 - (t - d.kt) / 0.09) : 0;
      drawFigure(env, bufs[i], d.spec.kit, d.x, d.y, d.h, d.ang, pose, flashA);
      // Spin lines around a defender who was scythed away.
      if (d.knocked && d.vang >= 4) {
        const [lx, ly] = lift(d.x, d.y, 16 + d.h, cam.x, cam.y);
        const sa = clamp((d.vang - 4) / 10);
        ctx.lineCap = 'round';
        ctx.strokeStyle = `rgba(236,240,255,${0.55 * sa})`;
        ctx.lineWidth = 1.5;
        for (let j = 0; j < 2; j++) {
          const a0 = d.ang + j * Math.PI;
          ctx.beginPath();
          ctx.arc(lx, ly, 19, a0 - 1.3, a0 - 0.15);
          ctx.stroke();
        }
      }
    };
    for (let i = 0; i < defs.length; i++) if (defs[i].h <= AIR_H) drawDef(i);
    {
      const coil = ease.inQuad(clamp((t - 1.6) / 0.4));
      drawFigure(env, bufs[3], KEEPER_KIT, kx, ky, 0, kang, { ...TP0, wide: 1 - coil * 0.4, spread: 0.85 - coil * 0.4, reach: 0.25 + coil * 0.75, lean: 0.3 + coil * 0.7, stride: coil * 0.5 }, 0);
    }

    // Strike slashes: a silver-crimson crescent sweep where the blade bit.
    for (const d of defs) {
      if (!d.knocked) continue;
      const s = t - d.kt;
      if (s > 0.32) continue;
      const a = 1 - clamp((s - 0.09) / 0.23);
      crescentArc(ctx, d.hbx, d.hby, d.hr + BLADE_R + 6, d.hth - 1.5, d.hth + 0.3, 10, clamp(s / 0.035), a);
      // Crescent shock expanding from the strike (the film's shape language, not a full hit ring).
      const q = clamp(s / 0.3);
      if (q < 1) crescentArc(ctx, d.hbx, d.hby, 10 + 90 * q, d.hth - 1.2, d.hth + 1.2, 6 * (1 - q), 1, 0.6 * (1 - q));
    }

    // The comet: crimson ribbon, orbit smear, blades, ball.
    // The ribbon's white core stops short of the head, and a dark halo sits under the ball, so the
    // spinning crimson-panel ball reads under the blades instead of a white blob.
    crimsonRibbon(ctx, ribbonPts(6), 9, 0.85);
    const [lbx, lby] = lift(bx, by, BALL_H, cam.x, cam.y);
    ctx.fillStyle = 'rgba(24,4,18,0.5)';
    ctx.beginPath();
    ctx.arc(lbx, lby, 11, 0, TAU);
    ctx.fill();
    drawBlades(env, t);
    drawBall(env, spin, lbx, lby, 4, 2, 0.55, 0.35, 'crimson');
    for (let i = 0; i < defs.length; i++) if (defs[i].h > AIR_H) drawDef(i);

    drawGoalTop(ctx, cam.x, cam.y);
    env.parts.draw(ctx, 1);

    // Silver speed lines along the flight (kept through the reveal so the comet still blazes).
    // Hotter while the comet rockets in and through the follow; eased off for the reveal, then
    // back up as it darts at the keeper.
    const sk = 0.28 + 0.22 * (entryE(t) / ENTRY_E);
    speedStreaks(ctx, rng, cam.x - 320, cam.y - 220, 640, 440, bang, 16, '#e8ecff', lerp(sk, 0.2, rv) + 0.08 * clamp((t - 1.6) / 0.3), 70);

    // Whip in (5 -> 6 is a motion cut, no flash): shot 5's whip streaks carry on along the comet's
    // screen heading and die out in 0.1 s.
    const wk = Math.pow(1 - clamp(t / 0.1), 2);
    if (wk > 0) {
      env.screen();
      const sh = bang + cam.rot;
      ctx.globalCompositeOperation = 'lighter';
      speedStreaks(ctx, rng, -60, -40, VW + 120, VH + 80, sh, 34, '#e8ecff', 0.55 * wk, 180);
      speedStreaks(ctx, rng, -60, -40, VW + 120, VH + 80, sh, 12, '#ff4d7a', 0.5 * wk, 150);
      ctx.globalCompositeOperation = 'source-over';
      env.world();
    }

    // ------------------------------------------------ Post
    const [ux, uy] = cam.toUV(bx, by);
    fx.bloom = 0.92;
    fx.bloomThresh = 0.72;
    fx.ca = 0.0018 + 0.012 * wk;
    fx.radial = 0.006 + 0.006 * (1 - rv);
    fx.radialX = ux;
    fx.radialY = uy;
    // Directional smear along the comet heading: a zoom-blur centre 3 UV off-screen gives a
    // near-linear smear of ~3 * radial UV (as shot 5's whip out). It takes over from the gentle
    // ball-centred zoom blur only while it is the stronger of the two (~0.07 s).
    const rd = 0.015 * wk;
    if (rd * 3 > fx.radial * 0.4) {
      const [a0u, a0v] = cam.toUV(bx, by);
      const [a1u, a1v] = cam.toUV(bx + Math.cos(bang) * 100, by + Math.sin(bang) * 100);
      const kk = 3 / Math.hypot(a1u - a0u, a1v - a0v);
      fx.radial = rd;
      fx.radialX = a0u + (a1u - a0u) * kk;
      fx.radialY = a0v + (a1v - a0v) * kk;
    }
    // Night grade between shots 5 and 7 (the floodlit box is lit in pitch(), the run-off falls to night).
    fx.vignette = 0.78;
    fx.tint = [188, 200, 255];
    fx.sat = 0.82;
    fx.contrast = 1.12;
    let hitF = 0;
    for (const d of defs) {
      if (!d.knocked) continue;
      const s = t - d.kt;
      const [dx, dy] = cam.toUV(d.x, d.y);
      if (s < 0.5) fx.shocks.push({ x: dx, y: dy, r: 0.02 + s * 0.9, s: 0.03 * (1 - s / 0.5) });
      // The big one (the jumper, scythed mid-air) punches with a stronger flash and a radial kick.
      const big = d === defs[1];
      hitF = Math.max(hitF, pulse(t, d.kt, 0.07) * (big ? 0.16 : 0.1));
      if (big && s < 0.12) {
        fx.radial = Math.max(fx.radial, 0.03 * (1 - s / 0.12));
        fx.radialX = dx;
        fx.radialY = dy;
      }
    }
    // No open or close flash: 5 -> 6 is a whip cut, and shot 7 opens on its own black blink, so
    // this shot ends clean on the comet entering the six-yard box with the keeper set.
    fx.flash = hitF;
    fx.flashColor = [255, 150, 180]; // crimson strike, not a milky lift over the night turf
  },
};

// ---------------------------------------------------------------- Helpers

/** The comet's wake for the ribbon, its head stopped `gap` world px short of the ball (by distance,
 *  not by point count: at the entry's speed two trail points are ~45 px). */
function ribbonPts(gap: number): { x: number; y: number }[] {
  const pts = trail.pts;
  const n = pts.length;
  if (n < 2) return [];
  const hx = pts[n - 1].x, hy = pts[n - 1].y;
  let i = n - 1;
  while (i > 0 && Math.hypot(pts[i - 1].x - hx, pts[i - 1].y - hy) < gap) i--;
  if (i === 0) return [];
  const a = pts[i - 1], b = pts[i];
  const da = Math.hypot(a.x - hx, a.y - hy), db = Math.hypot(b.x - hx, b.y - hy);
  const k = clamp((da - gap) / Math.max(1e-6, da - db));
  return [...pts.slice(0, i), { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) }];
}

/** Perspective lift for an object `h` px above the grass, seen from a camera high over (cx,cy). */
function lift(x: number, y: number, h: number, cx: number, cy: number): [number, number] {
  return [x + (x - cx) * h * PARA, y + (y - cy) * h * PARA];
}

/** Top-down sparks (no gravity). */
function topSparks(env: Env, x: number, y: number, n: number, speed: number, dir: number, cone: number, rampName: 'silver' | 'crimson', r0 = 0) {
  const rng = env.rng;
  for (let i = 0; i < n; i++) {
    const a = dir + rng.range(-cone / 2, cone / 2);
    const s = speed * rng.range(0.3, 1);
    env.parts.spawn({
      kind: PK.Streak, x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 4,
      max: rng.range(0.2, 0.5), s0: rng.range(1, 2.2), s1: 0.4, ramp: rampName, r0, r1: 1, k: 1.3, layer: 1,
    });
  }
}

/** Four faint floodlight shadows + a contact shadow. */
function figShadow(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, size: number) {
  const a = clamp(1 - h / 90);
  ctx.fillStyle = 'rgb(4,6,18)';
  for (let k = 0; k < 4; k++) {
    const dir = Math.PI / 4 + (k * Math.PI) / 2;
    const len = (12 + h * 0.3) * size;
    ctx.globalAlpha = 0.13 * a;
    ctx.beginPath();
    ctx.ellipse(x + Math.cos(dir) * len * 0.6, y + Math.sin(dir) * len * 0.6, len * 0.62, 4.2 * size, dir, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 0.3 * a;
  ctx.beginPath();
  ctx.ellipse(x, y, 9 * size, 8 * size, 0, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;
}

// Top-down figure pose: all 0..1.
interface TP {
  stride: number;
  reach: number;
  spread: number;
  slide: number;
  lean: number;
  splay: number;
  wide: number;
}
const TP0: TP = { stride: 0, reach: 0, spread: 0, slide: 0, lean: 0, splay: 0, wide: 0 };

/** Rasterize a player seen from straight above (facing `ang`) into a pixel buffer. */
function rasterTop(buf: PixelBuffer, kit: Kit, ang: number, p: TP, flash: number): HTMLCanvasElement {
  buf.clear();
  const C = FB / 2;
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const X = (f: number, r: number) => C + f * ca - r * sa;
  const Y = (f: number, r: number) => C + f * sa + r * ca;
  const cap = (f0: number, r0: number, f1: number, r1: number, rad: number, pal: [number, number, number] | number) =>
    buf.capsule(X(f0, r0), Y(f0, r0), X(f1, r1), Y(f1, r1), rad, pal);
  const lean = p.lean * 1.5;
  // Legs (mostly hidden under the shoulders; feet show in a stride, a slide or a sprawl).
  for (const sd of [-1, 1]) {
    let ff = sd * p.stride * 3.6 - 0.3 - p.splay * 2.2;
    let fr = sd * (1.8 + p.wide * 2.4 + p.splay * 3.4);
    if (p.slide > 0) {
      ff = lerp(ff, sd > 0 ? 9 : -3.2, p.slide);
      fr = lerp(fr, sd > 0 ? 1.4 : -3.4, p.slide);
    }
    const hf = -0.6, hr = sd * 1.3;
    cap(hf, hr, ff, fr, 1.2, kit.socks);
    cap(hf, hr, lerp(hf, ff, 0.42), lerp(hr, fr, 0.42), 1.55, kit.shorts);
    const dl = Math.hypot(ff - hf, fr - hr) || 1;
    cap(ff, fr, ff + ((ff - hf) / dl) * 1.2, fr + ((fr - hr) / dl) * 1.2, 1.15, kit.boots);
  }
  // Arms.
  for (const sd of [-1, 1]) {
    const sf = lean * 0.6, sr = sd * 3.5;
    const hf = lerp(lerp(1.0, 5.4, p.reach), 1.2 + p.reach * 2, p.spread) + lean * 0.8;
    const hr = sd * lerp(lerp(4.3, 3.9, p.reach), 8.0, p.spread);
    cap(sf, sr, hf, hr, 1.0, kit.skin);
    cap(sf, sr, lerp(sf, hf, 0.38), lerp(sr, hr, 0.38), 1.3, kit.shirt);
    if (kit.gloves) buf.circle(X(hf, hr), Y(hf, hr), 1.5, kit.gloves);
  }
  // Shoulders.
  cap(lean * 0.6, -2.8, lean * 0.6, 2.8, 2.5, kit.shirt);
  // Head: face peeks out in front of the hair as a skin crescent; ears at the sides.
  const hx = lean + 0.45;
  buf.circle(X(hx + 1.0, 0), Y(hx + 1.0, 0), 1.95, kit.skin);
  buf.circle(X(hx, -2.3), Y(hx, -2.3), 0.75, kit.skin[1]);
  buf.circle(X(hx, 2.3), Y(hx, 2.3), 0.75, kit.skin[1]);
  buf.circle(X(hx - 0.15, 0), Y(hx - 0.15, 0), 2.35, kit.hair);
  if (kit.hairStyle === 'cap') cap(hx + 1.7, -1.4, hx + 1.7, 1.4, 0.75, kit.hair[2]);
  // Hit flash before the outline, so the dark outline keeps the silhouette readable.
  if (flash > 0) buf.tint([255, 225, 235], flash * 0.8);
  buf.outline();
  return buf.flush();
}

function drawFigure(env: Env, buf: PixelBuffer, kit: Kit, x: number, y: number, h: number, ang: number, p: TP, flash: number) {
  const ctx = env.ctx;
  const cv = rasterTop(buf, kit, ang, p, flash);
  const [lx, ly] = lift(x, y, 16 + h, env.cam.x, env.cam.y);
  const sc = FD * (1 + h * 0.004);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(cv, lx - (FB / 2) * sc, ly - (FB / 2) * sc, FB * sc, FB * sc);
}

/** Skid mark the slide tackle leaves in the turf (from where his boots hit the grass). */
function drawSkids(ctx: CanvasRenderingContext2D) {
  for (let i = 0; i < defs.length; i++) {
    const d = defs[i];
    if (d.spec.kind !== 'slide') continue;
    const g = HIT_GEO[i];
    const k = clamp((sim - (g.s - d.spec.lunge)) / d.spec.lunge);
    if (k <= SKID_K) continue;
    const p = pathAt(g.u);
    const p0x = g.px + Math.cos(g.th) * d.spec.back - p.hx * d.spec.along;
    const p0y = g.py + Math.sin(g.th) * d.spec.back - p.hy * d.spec.along;
    const e0 = ease.outQuad(SKID_K);
    const sx = lerp(p0x, g.px, e0), sy = lerp(p0y, g.py, e0);
    // Once he is scythed away the groove stays where the blade met him.
    const ex = d.knocked ? g.px : d.x, ey = d.knocked ? g.py : d.y;
    const nl = Math.hypot(ex - sx, ey - sy);
    if (nl < 1) continue;
    const nx = -(ey - sy) / nl, ny = (ex - sx) / nl;
    // Tapered strip from the first touch (narrow) to where he is now (wide).
    const strip = (w0: number, w1: number, o = 0) => {
      ctx.beginPath();
      ctx.moveTo(sx + nx * (o + w0), sy + ny * (o + w0));
      ctx.lineTo(ex + nx * (o + w1), ey + ny * (o + w1));
      ctx.lineTo(ex + nx * (o - w1), ey + ny * (o - w1));
      ctx.lineTo(sx + nx * (o - w0), sy + ny * (o - w0));
      ctx.closePath();
      ctx.fill();
    };
    // Scraped, dusty turf with the gouged groove down its middle and torn lips either side.
    ctx.fillStyle = 'rgba(120,108,70,0.3)';
    strip(2, 5);
    ctx.fillStyle = 'rgba(40,52,24,0.55)';
    strip(0.8, 2.4);
    ctx.fillStyle = 'rgba(130,160,86,0.4)';
    for (const sd of [-1, 1]) strip(0.4, 0.6, sd * lerp(2.6, 5.4, 0.5));
  }
}

/** Heat of scorch point i (0 cold char .. 1 molten): fresh behind the blades, re-lit by the ignition wave, then smouldering. */
function heatAt(E: EdgePt[], i: number, n: number, w: number) {
  const fresh = clamp(1 - (sim - E[i].s) / 0.55);
  const f = i / Math.max(1, n - 1);
  const lit = w > f ? 0.3 + 0.55 * clamp(1 - (w - f) / 0.3) : 0;
  return Math.max(fresh * fresh, lit);
}

/** Burnt crescent: seared grass (multiply, the mowing stripes show through), char at the cut rims,
 *  a molten crimson inner (leading) rim cooling to dark ember behind, the ignition wave re-lighting it. */
function drawScorch(env: Env, t: number, frng: Rng) {
  const ctx = env.ctx;
  const n = Math.min(outer.length, inner.length);
  if (n < 2) return;
  const w = clamp((t - IGN) / IGN_LEN);
  // 0) Singed fringe: the grass just outside the cut yellows toward the char (hue shift only, value
  //    kept), in three soft steps so it fades into the turf instead of reading as an outline.
  ctx.globalCompositeOperation = 'hue';
  ctx.fillStyle = 'rgb(176,124,46)';
  for (const [q, a] of [[0.2, 0.2], [0.12, 0.25], [0.06, 0.3]] as const) {
    bandPath(ctx, 0, n, -q, 1 + q);
    ctx.globalAlpha = a;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // 1) Charred turf: strip the green out first (saturation -> grey), then multiply a dark brown
  //    so the band lands on charcoal-brown (stripes and speckle still read through as value).
  //    Darker char hugs both rims where the blades cut, then burnt tufts and grey ash on top.
  ctx.globalCompositeOperation = 'saturation';
  bandPath(ctx, 0, n);
  ctx.fillStyle = 'rgb(128,128,128)';
  ctx.fill();
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = 'rgb(210,166,80)';
  ctx.fill();
  ctx.fillStyle = 'rgb(116,90,50)';
  bandPath(ctx, 0, n, 0, 0.24);
  ctx.fill();
  bandPath(ctx, 0, n, 0.76, 1);
  ctx.fill();
  bandPath(ctx, 0, n);
  ctx.fillStyle = charPattern(ctx);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = ashPattern(ctx);
  ctx.globalAlpha = 0.75;
  ctx.fill();
  ctx.globalAlpha = 1;

  // 2) Heat glow inside the band: only the fresh head and the ignition front glow.
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 1; i < n; i++) {
    const c = Math.max(heatAt(inner, i, n, w), heatAt(outer, i, n, w) * 0.6);
    if (c < 0.06) continue;
    ctx.beginPath();
    ctx.moveTo(outer[i - 1].x, outer[i - 1].y);
    ctx.lineTo(outer[i].x, outer[i].y);
    ctx.lineTo(lerp(outer[i].x, inner[i].x, 1.02), lerp(outer[i].y, inner[i].y, 1.02));
    ctx.lineTo(lerp(outer[i - 1].x, inner[i - 1].x, 1.02), lerp(outer[i - 1].y, inner[i - 1].y, 1.02));
    ctx.closePath();
    ctx.fillStyle = `rgba(170,14,46,${0.55 * c * c})`;
    ctx.fill();
  }
  // Glowing fissures in the burnt turf, only where it is still hot (texture fixed to the ground).
  // Normal blending keeps them crimson: additive red on green turf goes salmon pink.
  ctx.globalCompositeOperation = 'source-over';
  let kHot = n - 1;
  while (kHot > 0 && heatAt(inner, kHot, n, w) > 0.12) kHot--;
  const kF = Math.min(n - 1, Math.floor(w * (n - 1))); // ignition front
  const flick = 0.85 + 0.15 * frng.next();
  ctx.fillStyle = emberPattern(ctx);
  if (w > 0 && kF >= 1) {
    // Burning behind the front (fierce while the wave runs, settling to a smoulder).
    bandPath(ctx, 0, kF + 1);
    ctx.globalAlpha = lerp(0.95, 0.48, w * w) * flick;
    ctx.fill();
  }
  if (w < 1 && n - Math.max(kHot, kF) >= 2) {
    // Ahead of the front: only the fresh head behind the blades still glows.
    bandPath(ctx, Math.max(kHot, kF), n);
    ctx.globalAlpha = 0.6 * flick;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'lighter';
  // The ignition front: a ragged wall of crimson fire across the full band, racing tail -> head.
  if (w > 0 && w < 1) {
    const ox = outer[kF].x, oy = outer[kF].y, ix = inner[kF].x, iy = inner[kF].y;
    const bw = Math.hypot(ix - ox, iy - oy);
    const m = Math.max(2, Math.ceil(bw / 4));
    const k2 = Math.max(0, kF - 3);
    const tx = outer[kF].x - outer[k2].x, ty = outer[kF].y - outer[k2].y;
    const tl = Math.hypot(tx, ty) || 1;
    for (let j = 0; j <= m; j++) {
      const q = j / m;
      const jit = frng.range(-3, 2);
      const fx0 = lerp(ox, ix, q) + (tx / tl) * jit, fy0 = lerp(oy, iy, q) + (ty / tl) * jit;
      drawGlow(ctx, glowSprite('crimson', 0.4), fx0, fy0, 7 + 3 * frng.next(), 0.6);
      drawGlow(ctx, glowSprite('crimson', 0.2), fx0, fy0, 3 + 2 * frng.next(), 0.55);
    }
    // Hot-rose core of the front, and its afterglow trailing a few points behind.
    ctx.lineCap = 'round';
    for (const [back, wid, col] of [[0, 2, 'rgba(255,150,176,0.75)'], [2, 4, 'rgba(222,26,66,0.4)'], [5, 6, 'rgba(160,12,40,0.25)']] as const) {
      const kb = Math.max(0, kF - back);
      ctx.strokeStyle = col;
      ctx.lineWidth = wid;
      ctx.beginPath();
      ctx.moveTo(outer[kb].x, outer[kb].y);
      ctx.lineTo(inner[kb].x, inner[kb].y);
      ctx.stroke();
    }
    for (const q of [0.06, 0.94]) {
      const fx0 = lerp(ox, ix, q), fy0 = lerp(oy, iy, q);
      drawGlow(ctx, glowSprite('crimson', 0.5), fx0, fy0, 11 + 3 * frng.next(), 0.55);
    }
  }
  // Flame licks along both rims where the turf is burning (re-rolled every frame).
  for (let i = 0; i < n; i += 2) {
    const c = heatAt(inner, i, n, w);
    if (c < 0.25 || (w <= 0 && i < n - 8)) continue;
    for (const q of [frng.range(0.82, 1), frng.range(0, 0.18)]) {
      const lx = lerp(outer[i].x, inner[i].x, q), ly = lerp(outer[i].y, inner[i].y, q);
      drawGlow(ctx, glowSprite('crimson', 0.42 + 0.2 * frng.next()), lx, ly, 3 + 5 * c * frng.next(), (0.25 + 0.45 * c) * (0.6 + 0.4 * frng.next()));
    }
  }
  ctx.globalCompositeOperation = 'source-over';

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // 3) Outer rim: a thin dark cut groove (no sticker outline) and, once lit, a silver gleam.
  ctx.strokeStyle = 'rgba(20,6,12,0.75)';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(outer[0].x, outer[0].y);
  for (let i = 1; i < n; i++) ctx.lineTo(outer[i].x, outer[i].y);
  ctx.stroke();
  // 4) Inner (leading) rim: molten crimson where hot, cooling to dark ember behind.
  ctx.strokeStyle = 'rgba(30,4,14,0.8)';
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.moveTo(inner[0].x, inner[0].y);
  for (let i = 1; i < n; i++) ctx.lineTo(inner[i].x, inner[i].y);
  ctx.stroke();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 1; i < n; i++) {
    const c = heatAt(inner, i, n, w);
    // ember (110,12,34) -> crimson (222,26,66) -> hot rose (255,150,170)
    const h2 = c < 0.5 ? 0 : ((c - 0.5) / 0.5) ** 2;
    const r = c < 0.5 ? lerp(110, 222, c / 0.5) : lerp(222, 255, (c - 0.5) / 0.5);
    const g = c < 0.5 ? lerp(12, 26, c / 0.5) : lerp(26, 150, h2);
    const b = c < 0.5 ? lerp(34, 66, c / 0.5) : lerp(66, 170, h2);
    ctx.strokeStyle = `rgba(${r | 0},${g | 0},${b | 0},${0.45 + 0.55 * c})`;
    ctx.lineWidth = 1.8 + 1.2 * c;
    ctx.beginPath();
    ctx.moveTo(inner[i - 1].x, inner[i - 1].y);
    ctx.lineTo(inner[i].x, inner[i].y);
    ctx.stroke();
    if (c > 0.25) {
      ctx.strokeStyle = `rgba(222,26,66,${0.16 * c})`;
      ctx.lineWidth = 7;
      ctx.stroke();
    }
  }
  if (w > 0) {
    ctx.strokeStyle = 'rgba(236,240,255,0.45)';
    ctx.lineWidth = 1.1;
    const kIgn = Math.min(n, Math.max(2, Math.ceil(w * (n - 1)) + 1));
    ctx.beginPath();
    ctx.moveTo(outer[0].x, outer[0].y);
    for (let i = 1; i < kIgn; i++) ctx.lineTo(outer[i].x, outer[i].y);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
}

// ---------------------------------------------------------------- Cached textures (built once)
let charCv: HTMLCanvasElement | null = null;
let charPat: CanvasPattern | null = null;
let charCtx: CanvasRenderingContext2D | null = null;
/** Tileable char texture: dark burnt-grass flecks only (multiplied onto the turf). */
function charTile(): HTMLCanvasElement {
  if (charCv) return charCv;
  const S = 64;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const g = cv.getContext('2d')!;
  const r = new Rng(6063);
  for (let i = 0; i < 150; i++) {
    g.fillStyle = r.next() < 0.6 ? 'rgb(40,24,26)' : 'rgb(90,60,52)';
    g.fillRect(r.int(0, S - 1), r.int(0, S - 1), r.int(1, 2), r.int(1, 3));
  }
  charCv = cv;
  return cv;
}
function charPattern(ctx: CanvasRenderingContext2D): CanvasPattern | string {
  if (charPat && charCtx === ctx) return charPat;
  charCtx = ctx;
  charPat = ctx.createPattern(charTile(), 'repeat');
  return charPat || 'rgba(0,0,0,0)';
}

let ashCv: HTMLCanvasElement | null = null;
let ashPat: CanvasPattern | null = null;
let ashCtx: CanvasRenderingContext2D | null = null;
/** Tileable grey ash flecks (drawn normally, lighter than the char). */
function ashTile(): HTMLCanvasElement {
  if (ashCv) return ashCv;
  const S = 64;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const g = cv.getContext('2d')!;
  const r = new Rng(6064);
  for (let i = 0; i < 34; i++) {
    const v = r.next();
    g.fillStyle = v < 0.5 ? 'rgb(120,112,104)' : v < 0.8 ? 'rgb(92,84,80)' : 'rgb(150,142,134)';
    g.fillRect(r.int(0, S - 1), r.int(0, S - 1), r.int(1, 2), r.int(1, 2));
  }
  ashCv = cv;
  return cv;
}
function ashPattern(ctx: CanvasRenderingContext2D): CanvasPattern | string {
  if (ashPat && ashCtx === ctx) return ashPat;
  ashCtx = ctx;
  ashPat = ctx.createPattern(ashTile(), 'repeat');
  return ashPat || 'rgba(0,0,0,0)';
}

let emberCv: HTMLCanvasElement | null = null;
let emberPat: CanvasPattern | null = null;
let emberCtx: CanvasRenderingContext2D | null = null;
/** Tileable pixel texture of burnt turf: char flecks, glowing crimson fissures, hot specks (drawn additive). */
function emberTile(): HTMLCanvasElement {
  if (emberCv) return emberCv;
  const S = 96;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const g = cv.getContext('2d')!;
  const r = new Rng(6062);
  const W = (v: number) => ((Math.round(v) % S) + S) % S;
  // Char flecks.
  for (let i = 0; i < 240; i++) {
    g.fillStyle = r.next() < 0.6 ? 'rgba(12,4,6,0.7)' : 'rgba(50,24,18,0.6)';
    const s = r.int(1, 3);
    g.fillRect(W(r.range(0, S)), W(r.range(0, S)), s, r.int(1, 2));
  }
  // Glowing fissures: short wandering cracks (wrapped so the tile repeats seamlessly).
  for (let k = 0; k < 20; k++) {
    let x = r.range(0, S), y = r.range(0, S), a = r.range(0, TAU);
    const len = r.int(6, 16);
    for (let j = 0; j < len; j++) {
      a += r.range(-0.8, 0.8);
      x += Math.cos(a) * 1.5;
      y += Math.sin(a) * 1.5;
      g.fillStyle = j > 1 && j < len - 2 && r.next() < 0.25 ? 'rgb(255,176,200)' : 'rgb(236,44,86)';
      g.fillRect(W(x), W(y), 1, 1);
    }
  }
  // Hot specks.
  for (let i = 0; i < 40; i++) {
    g.fillStyle = r.next() < 0.5 ? 'rgb(255,110,140)' : 'rgb(196,20,60)';
    g.fillRect(W(r.range(0, S)), W(r.range(0, S)), 1, 1);
  }
  emberCv = cv;
  return cv;
}
function emberPattern(ctx: CanvasRenderingContext2D): CanvasPattern | string {
  if (emberPat && emberCtx === ctx) return emberPat;
  emberCtx = ctx;
  emberPat = ctx.createPattern(emberTile(), 'repeat');
  return emberPat || 'rgba(0,0,0,0)';
}

/** Path of the band between the rims from point k0 to k1 (q0..q1 = across the band, 0 outer, 1 inner). */
function bandPath(ctx: CanvasRenderingContext2D, k0: number, k1: number, q0 = 0, q1 = 1) {
  ctx.beginPath();
  for (let i = k0; i < k1; i++) {
    const x = lerp(outer[i].x, inner[i].x, q0), y = lerp(outer[i].y, inner[i].y, q0);
    i === k0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  for (let i = k1 - 1; i >= k0; i--) ctx.lineTo(lerp(outer[i].x, inner[i].x, q1), lerp(outer[i].y, inner[i].y, q1));
  ctx.closePath();
}

/** The two orbiting crescent blades (silver cutting edge, crimson body) with their spin smear. */
function bladeShape(ctx: CanvasRenderingContext2D, x: number, y: number, R: number, rot: number, edge: number) {
  // Body = the crescent, its convex back edge pulled in by `edge`*R toward the bite.
  const e = edge * R;
  crescentPath(ctx, x + Math.cos(rot) * e, y + Math.sin(rot) * e, R, BLADE_BITE - edge, rot);
}
function drawBlades(env: Env, t: number) {
  const ctx = env.ctx;
  const unf = unfurl(t);
  if (unf <= 0) return;
  const R = BLADE_R * ease.outBack(unf);
  const ro = bladeOrbit(t);
  const [cx, cy] = lift(bx, by, BLADE_H, env.cam.x, env.cam.y);
  const TILT = 0.35;
  // Orbit smear: a fading crimson-silver arc behind each blade, on the blade's outer radius.
  ctx.lineCap = 'round';
  for (let k = 0; k < 2; k++) {
    const a0 = phi + k * Math.PI;
    for (let j = 0; j < 8; j++) {
      const s0 = a0 - 0.18 * (j + 1), s1 = a0 - 0.18 * j;
      const q = 1 - j / 8;
      ctx.strokeStyle = `rgba(${(200 + 55 * q) | 0},${(40 + 190 * q * q) | 0},${(80 + 170 * q * q) | 0},${0.6 * q * unf})`;
      ctx.lineWidth = 1 + 2.4 * q;
      ctx.beginPath();
      ctx.arc(cx, cy, ro + R * 0.55, s0, s1);
      ctx.stroke();
    }
  }
  for (let k = 0; k < 2; k++) {
    const a = phi + k * Math.PI;
    // Ghost copies (spin blur).
    for (let j = 3; j >= 1; j--) {
      const ga = a - j * 0.26;
      ctx.globalAlpha = 0.4 * (1 - j / 4) * unf;
      ctx.fillStyle = 'rgb(120,6,32)';
      bladeShape(ctx, cx + Math.cos(ga) * ro, cy + Math.sin(ga) * ro, R, ga + Math.PI + TILT, 0);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    const x = cx + Math.cos(a) * ro, y = cy + Math.sin(a) * ro;
    const rot = a + Math.PI + TILT;
    // Dark rim for contrast on the grass, silver cutting edge, crimson body, hot core.
    ctx.fillStyle = 'rgba(16,0,14,0.7)';
    crescentPath(ctx, x - Math.cos(rot) * 1.5, y - Math.sin(rot) * 1.5, R + 1.5, BLADE_BITE + 0.12, rot);
    ctx.fill();
    ctx.fillStyle = '#f4f6ff';
    bladeShape(ctx, x, y, R, rot, 0);
    ctx.fill();
    ctx.fillStyle = 'rgb(206,16,50)';
    bladeShape(ctx, x, y, R, rot, 0.16);
    ctx.fill();
    ctx.fillStyle = 'rgb(240,46,84)';
    bladeShape(ctx, x, y, R * 0.86, rot, 0.46);
    ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowSprite('crimson', 0.55), x - Math.cos(rot) * R * 0.5, y - Math.sin(rot) * R * 0.5, R * 1.8, 0.18 * unf);
    ctx.globalCompositeOperation = 'source-over';
  }
}

/** Ad boards behind the goal (with perspective height so their face shows). */
function drawBoards(env: Env, t: number) {
  const ctx = env.ctx;
  const { x: cx, y: cy } = env.cam;
  const H = 12;
  const quad = (y0: number, y1: number, h0: number, h1: number) => {
    const a = lift(BOARD_X, y0, h0, cx, cy), b = lift(BOARD_X, y1, h0, cx, cy);
    const c = lift(BOARD_X, y1, h1, cx, cy), d = lift(BOARD_X, y0, h1, cx, cy);
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.lineTo(c[0], c[1]);
    ctx.lineTo(d[0], d[1]);
    ctx.closePath();
    ctx.fill();
  };
  ctx.fillStyle = '#0a0816';
  quad(PY0, PY0 + PH, 0, H);
  const cols = ['#d81a44', '#eef0ff', '#3a2a8a', '#d81a44', '#ffc35a'];
  for (let i = 0; i < 22; i++) {
    const y0 = PY0 + i * 40 + ((t * 30) % 40);
    ctx.fillStyle = cols[i % cols.length];
    quad(y0 + 3, y0 + 33, 3, H - 3);
  }
}

/** Goal frame and net from above, with height (posts lean away from the camera centre). */
function drawGoalTop(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const L = (x: number, y: number, h: number) => lift(x, y, h, cx, cy);
  const RX = ND * 0.62;
  // Net profile: roof from the crossbar back, then the back panel down to the grass.
  const prof = (v: number): [number, number] => (v < 0.5 ? [lerp(0, RX, v / 0.5), HB] : [lerp(RX, ND, (v - 0.5) / 0.5), lerp(HB, 0, (v - 0.5) / 0.5)]);
  ctx.strokeStyle = 'rgba(226,232,255,0.42)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let j = 0; j <= 12; j++) {
    const y = lerp(-GW, GW, j / 12);
    for (let i = 0; i <= 8; i++) {
      const [x, h] = prof(i / 8);
      const q = L(x, y, h);
      i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]);
    }
  }
  for (let i = 1; i <= 8; i++) {
    const [x, h] = prof(i / 8);
    const a = L(x, -GW, h), b = L(x, GW, h);
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
  }
  // Side nets: vertical strands at each post side.
  for (const sy of [-GW, GW]) {
    for (let i = 1; i <= 5; i++) {
      const [x, h] = prof((i / 5) * 0.999);
      const a = L(x, sy, 0), b = L(x, sy, h);
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
    }
  }
  ctx.stroke();
  // Posts and crossbar (dark outline, white bar).
  const pA0 = L(0, -GW, 0), pA1 = L(0, -GW, HB), pB0 = L(0, GW, 0), pB1 = L(0, GW, HB);
  ctx.lineCap = 'square';
  for (const [w, c] of [[6, '#140816'], [3.4, '#f4f6ff']] as const) {
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(pA0[0], pA0[1]);
    ctx.lineTo(pA1[0], pA1[1]);
    ctx.lineTo(pB1[0], pB1[1]);
    ctx.lineTo(pB0[0], pB0[1]);
    ctx.stroke();
  }
  ctx.lineCap = 'butt';
}

/** Pre-rendered pitch seen from above: mowing checker, markings, run-off, stand. Built once. */
function pitch(): HTMLCanvasElement {
  if (pitchCv) return pitchCv;
  const cv = document.createElement('canvas');
  cv.width = PW;
  cv.height = PH;
  const g = cv.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  const rng = new Rng(6060);
  const X = (x: number) => x - PX0, Y = (y: number) => y - PY0;
  // Mowing: strong stripes parallel to the goal line + subtle cross-cut.
  const SW = 56;
  for (let x = PX0; x < BOARD_X; x += SW) {
    const ix = Math.floor((x - PX0) / SW);
    for (let y = PY0; y < PY0 + PH; y += SW) {
      const iy = Math.floor((y - PY0) / SW);
      const base = ix % 2 ? [34, 112, 52] : [42, 130, 60];
      const k = iy % 2 ? 0.94 : 1;
      g.fillStyle = `rgb(${(base[0] * k) | 0},${(base[1] * k) | 0},${(base[2] * k) | 0})`;
      g.fillRect(X(x), Y(y), Math.min(SW, BOARD_X - x), SW);
    }
  }
  // Grass speckle + tiny tufts.
  for (let i = 0; i < 16000; i++) {
    const x = rng.int(0, X(BOARD_X) - 1), y = rng.int(0, PH - 1);
    g.fillStyle = rng.next() < 0.55 ? 'rgba(14,52,26,0.45)' : 'rgba(130,210,110,0.22)';
    g.fillRect(x, y, 1, rng.next() < 0.3 ? 2 : 1);
  }
  // Run-off behind the goal line: a little darker.
  g.fillStyle = 'rgba(6,10,30,0.18)';
  g.fillRect(X(0), 0, BOARD_X, PH);
  // Markings.
  g.fillStyle = 'rgba(238,242,255,0.9)';
  g.fillRect(X(-1), 0, 2, PH); // goal line
  g.fillRect(X(-BOX_D - 1), Y(-BOX_W), 2, BOX_W * 2);
  g.fillRect(X(-BOX_D - 1), Y(-BOX_W - 1), BOX_D, 2);
  g.fillRect(X(-BOX_D - 1), Y(BOX_W - 1), BOX_D, 2);
  g.fillRect(X(-SIX_D - 1), Y(-SIX_W), 2, SIX_W * 2);
  g.fillRect(X(-SIX_D - 1), Y(-SIX_W - 1), SIX_D, 2);
  g.fillRect(X(-SIX_D - 1), Y(SIX_W - 1), SIX_D, 2);
  g.fillRect(X(-SPOT - 2), Y(-1), 4, 2);
  g.fillRect(X(-SPOT - 1), Y(-2), 2, 4);
  const cmin = (-BOX_D + SPOT) / ARC_R;
  for (let i = 0; i <= 900; i++) {
    const a = Math.PI / 2 + (Math.PI * i) / 900;
    const c = Math.cos(a);
    if (c > cmin - 0.004) continue;
    g.fillRect(Math.round(X(-SPOT + c * ARC_R) - 1), Math.round(Y(Math.sin(a) * ARC_R) - 1), 2, 2);
  }
  // Goal footprint: worn goalmouth.
  g.fillStyle = 'rgba(70,60,40,0.22)';
  g.fillRect(X(-16), Y(-GW + 6), 14, GW * 2 - 12);
  // Board base and concrete walkway.
  g.fillStyle = '#07060e';
  g.fillRect(X(BOARD_X), 0, STAND_X - BOARD_X, PH);
  g.fillStyle = '#1b1828';
  g.fillRect(X(BOARD_X + 8), 0, STAND_X - BOARD_X - 8, PH);
  // Stand seen from above: rows of fans (heads + shoulders), home crimson.
  g.fillStyle = '#0d0a19';
  g.fillRect(X(STAND_X), 0, PX0 + PW - STAND_X, PH);
  for (let row = 0; STAND_X + 3 + row * 7 < PX0 + PW; row++) {
    const x = STAND_X + 3 + row * 7;
    const shade = lerp(0.55, 1, Math.min(1, row / 10));
    g.fillStyle = '#16122a';
    g.fillRect(X(x + 5), 0, 1, PH);
    for (let y = PY0 + (row % 2) * 2; y < PY0 + PH; y += 5 + (rng.next() < 0.2 ? 1 : 0)) {
      if (rng.next() < 0.1) continue;
      const r = rng.next();
      const c = r < 0.6 ? [204, 28, 56] : r < 0.74 ? [44, 60, 160] : r < 0.88 ? [226, 228, 240] : [246, 186, 72];
      g.fillStyle = `rgb(${(c[0] * shade) | 0},${(c[1] * shade) | 0},${(c[2] * shade) | 0})`;
      g.fillRect(X(x), Y(y), 3, 4);
      const hc = rng.pick([[60, 40, 30], [30, 22, 26], [120, 80, 50], [210, 160, 110]]);
      g.fillStyle = `rgb(${(hc[0] * shade) | 0},${(hc[1] * shade) | 0},${(hc[2] * shade) | 0})`;
      g.fillRect(X(x + 1), Y(y + 1), 2, 2);
    }
  }
  // Banners draped over the front of the stand.
  for (let i = 0; i < 6; i++) {
    const y = rng.range(PY0 + 40, PY0 + PH - 80);
    g.fillStyle = '#c81e3c';
    g.fillRect(X(STAND_X), Y(y), 9, 44);
    g.fillStyle = '#eef0ff';
    g.fillRect(X(STAND_X + 3), Y(y + 4), 3, 36);
  }
  // Floodlights: the penalty box is the brightest pool, the run-off and the far turf fall into night.
  g.globalCompositeOperation = 'multiply';
  const fl = g.createRadialGradient(X(-BOX_D * 0.5), Y(0), 60, X(-BOX_D * 0.5), Y(0), 470);
  fl.addColorStop(0, 'rgb(238,240,252)');
  fl.addColorStop(0.3, 'rgb(206,212,238)');
  fl.addColorStop(0.65, 'rgb(150,158,198)');
  fl.addColorStop(1, 'rgb(110,120,166)');
  g.fillStyle = fl;
  g.fillRect(0, 0, PW, PH);
  g.globalCompositeOperation = 'source-over';
  pitchCv = cv;
  return cv;
}

/**
 * Build every cache this shot uses (pitch canvas, texture tiles and their patterns, figure buffers)
 * in one go on the shot's first frame, so nothing is built later in the shot (the burnt-turf tiles
 * used to be built on the ignition frame). Deliberately not done earlier (module load, a deferred
 * timer or special select): measured on a first play in Chrome, every early warm-up slowed other
 * shots' frames (canvas creation order), while this first-frame build adds nothing measurable at the cut.
 */
function warmCaches(ctx: CanvasRenderingContext2D) {
  if (!bufs.length) for (let i = 0; i < 4; i++) bufs.push(new PixelBuffer(FB, FB));
  pitch();
  emberPattern(ctx);
  charPattern(ctx);
  ashPattern(ctx);
}
