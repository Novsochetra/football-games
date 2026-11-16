// GALE HAMMER v2 · shot 4 · "The inhale" (1.8 s, seed 314): the breath before the strike. SPEC.md §6 shot 4.
//
// Story job: dread. A coiled hammer, silence, and the whole storm sucked into one boot: GALE's freeze is a VACUUM.
//   0.00-0.42  the run-up, side view at knee height (No.10 ×2, 216 px): Run R1-R4 on one stance, the Approach AP2
//              bound; the camera trucks right at his speed. The stadium cyclone of shot 3 trails behind him as a
//              leaning funnel; his footfalls stamp air craters and blow dew.
//   0.42       the plant (F5a): crater, a dew crown and dust that are left HANGING when time stops; cam.hit.
//   0.48       HammerCock HC1, the hammer leg. The funnel is sucked into a pressure orb on the raised boot.
//   0.55-1.40  the vacuum (rate 0.06, muffle 0.95): the world freezes, and only the air moves. 80 white wind lines
//              rush into the boot at 900 px/s, vapour arms spiral in, five isobars ring the orb, 300 plucked blades,
//              dew beads, dust and two paper cups hang in the air on their way in, the stands' flags all point at
//              him. The camera is SUCKED in three 2-frame lurches (0.66 / 0.88 / 1.20, zoom 1.4 / 1.8 / 2.3), each with
//              an ear-pop, a lens notch (the stadium pinched toward the orb: -0.18 / -0.26 / -0.35), an isobar snap
//              and an imploding refraction ring. HC1 / HC2 tremble on the leg.
//   0.94-1.14  insert 4b (hard cut in and out): the keeper, 30 m away, KeeperFront KF2: his hair, a sweat drop and
//              the dew on his gloves stream LEFT toward No.10; the isobars bend left; he gulps. The smirk is gone.
//   1.22-1.38  the dew mirror: a drop beaded on the trembling ball swells to 36 px inside the ball's silhouette (a
//              literal 56 px drop on a 55 px ball cannot read as a drop); in its bright water, only his eyes and
//              brow, a dark reflection, look down at the ball.
//   1.40       the snap: the orb is crushed flat onto the laces (an ice bar for 0.06 s), the lens flips -0.35 -> +0.15,
//              a pressure ring bursts off the orb, the vortex arms and isobars are BLOWN OUTWARD past the frame, the
//              wind lines and every hanging blade and bead are blasted back OUT; the muffle snaps open on a crack.
//   1.44-1.80  the ice smash: HCs whips the leg down (F6 at 1.50), a cyan smear band traces the boot, focus lines
//              converge on it behind him; at 1.72 the camera crashes in on the laces and the boot whips out of frame
//              right, the sharpest thing in a streaked frame: smash cut on motion into shot 5's macro (no flash).
//
// Clocks: the camera, cues, the muffle, the funnel, the wind lines, the orb, the lens and every screen-space effect run
// on the unwarped shot clock t (the brief's times); the stadium, the dew twinkles and every particle run on the warped
// sim clock (frozen at rate 0.06 from 0.55 to 1.40). The sim clock is a pure table of RATE[4] (built at load), every
// decal and camera value a pure function of t; particles spawn only in update() on env.rng, one-shot bursts behind
// flags. Never the banned word anywhere.

import type { Env, Shot } from '../timeline';
import { STEP } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { TAU, Rng, clamp, ease, lerp } from '../../engine/math';
import { PK, drawGlow, glowOf, softSprite, type Particle } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { FIELD, drawFieldBackdrop } from '../../art/stadium';
import { drawNo10, no10, no10Point, type No10Key } from '../../art/no10';
import { focusLines, ribbon, type TrailPt } from '../../art/fx';
import { drawAnim, findAnim, findFrame, type StudioAnim } from '../../art/studioAnim';
import { drawBall, holdTrauma, keys, punch, pushShock, type KeyRow } from '../kit';
import {
  HEX, MUFFLE, PAL, RATE, SEQ, SHOTS, drawBlades, drawKeeperFront, galeStorm, keeperFront, makeBlades,
  no10At, sparkleCyan, stormDarken, vacuumGrade, warmGale, type Blade,
} from './common';
import { airCrater } from './air';

const META = SHOTS[3];
const DUR = META.dur;

// ---------------------------------------------------------------- the side world (knee height)

/** World px per studio px (No.10 at integer ×2: 196 px tall, 216-450 px on screen). */
const D = 2;
/** Ground row of the action line, and the horizon (eye height ~0.5 m: knee height). */
const GY = 300;
const HZ = 247;
/** World x of the R1-R4 planted toe (the plant toe of F5a / HC / F6 is x 0). */
const XR = -160;

/** Shot-local times (unwarped). */
const T = {
  plant: 0.42, cock: 0.48, vac: 0.55, in0: 0.94, in1: 1.14, mir0: 1.22, mir1: 1.38, snap: 1.4, whip: 1.44, f6: 1.5, exit: 1.72,
} as const;
const LURCH = [0.66, 0.88, 1.2] as const;
/** Two frames: the length of a 'vacuum' lurch. */
const SNAP2 = 2 / 60;
/** The vacuum blown outward at the snap (the vortex and isobars flung past the frame). */
const BLOW = 0.22;

/** Frame-stable hash in [0, 1) (the same formula as air.ts, so the wipe tail matches its streaks). */
const hash = (n: number) => {
  const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
};
const ICE = 'rgb(238,251,255)', CYAN = 'rgb(70,216,255)', NAVY = 'rgb(10,18,56)', COBALT = 'rgb(45,82,224)';

// ---------------------------------------------------------------- the sim clock (pure: the runner's steps of RATE[4])

const SIM = (() => {
  const n = Math.ceil(DUR / STEP) + 2;
  const a = new Float64Array(n);
  for (let k = 1; k < n; k++) a[k] = a[k - 1] + STEP * RATE[4](k * STEP);
  return a;
})();
/** Warped (simulation) seconds elapsed at shot-local t. */
function simAt(t: number): number {
  const f = clamp(t / STEP, 0, SIM.length - 1.001);
  const i = Math.floor(f);
  return lerp(SIM[i], SIM[i + 1], f - i);
}

// ---------------------------------------------------------------- anchors (measured in init from the studio frames)

type P2 = [number, number];
const A = {
  boot: [-86, 205] as P2, hcsBoot: [-76, 243] as P2, f6Boot: [-42, 271] as P2, ball: [14, 287] as P2,
  r1Pel: [-190, 225] as P2, r4Pel: [-150, 221] as P2, f5Pel: [-40, 227] as P2, mid: [-36, 246] as P2, snapC: [-53, 232] as P2,
};
let CAM_X: KeyRow[] = [];
let CAM_Y: KeyRow[] = [];

function measure(env: Env) {
  const p = (k: No10Key, n: string, x = 0): P2 => no10Point(env, k, n, x, GY, D);
  A.boot = p('HC1', 'boot');
  A.hcsBoot = p('HCs', 'boot');
  A.f6Boot = p('F6', 'boot');
  A.ball = p('F5a', 'ball');
  A.r1Pel = p('R1', 'pelvis', XR);
  A.r4Pel = p('R4', 'pelvis', XR);
  A.f5Pel = p('F5a', 'pelvis');
  A.mid = [(A.boot[0] + A.ball[0]) / 2, (A.boot[1] + A.ball[1]) / 2];
  A.snapC = [lerp(A.mid[0], A.boot[0], 0.35), lerp(A.mid[1], A.boot[1], 0.35)];
  // The truck: his hip + 60 px lead, constant speed from R1 to the plant; then the three vacuum lurches.
  const x0 = A.r1Pel[0] + 60, x1 = A.f5Pel[0] + 60;
  CAM_X = [[0, x0], [T.plant, x1, 'linear'], [LURCH[0], A.mid[0], 'vacuum'], [T.snap, A.mid[0]], [T.snap + SNAP2, A.snapC[0], 'step2'], [DUR, A.snapC[0] + 30, 'outQuad']];
  CAM_Y = [[0, GY - 80], [T.plant, GY - 80], [LURCH[0], A.mid[1] - 14, 'vacuum'], [LURCH[1], A.mid[1] - 24, 'vacuum'], [LURCH[2], A.mid[1], 'vacuum'], [T.snap, A.mid[1]], [T.snap + SNAP2, A.snapC[1], 'step2'], [DUR, A.snapC[1] + 10, 'outQuad']];
}

// ---------------------------------------------------------------- the camera (pure functions of t)

const ZOOM: KeyRow[] = [
  [0, 1.1], [T.plant, 1.1], [LURCH[0], 1.4, 'vacuum'], [LURCH[1], 1.8, 'vacuum'], [LURCH[2], 2.3, 'vacuum'], [T.snap, 2.3],
  [T.snap + SNAP2, 2.4, 'step2'], [DUR, 2.2, 'outQuad'],
];
/** The crash onto the laces at the cut: zoom multiplier about the crash point (the boot flies out right). */
const crashK = (t: number) => (t < T.exit ? 1 : 1 + 0.5 * ease.inCubic(clamp((t - T.exit) / (DUR - T.exit))));
/** ... while the camera whips back west, so the boot (and everything) streaks out of frame right. */
const crashPan = (t: number) => (t < T.exit ? 0 : 240 * ease.inCubic(clamp((t - T.exit) / (DUR - T.exit))));
/** The crash point: left of F6's boot, so the boot (and the ball beyond it) is flung out of frame right. */
const crashPt = (): P2 => [A.f6Boot[0] - 80, A.f6Boot[1] - 16];

function placeCam(env: Env, t: number) {
  const cam = env.cam;
  const z = keys(ZOOM, t) + punch(t, T.snap, 0.14, SNAP2, 0.24);
  cam.rot = 0;
  cam.zoom = z;
  cam.x = keys(CAM_X, t);
  cam.y = keys(CAM_Y, t);
  const k = crashK(t);
  if (k > 1) {
    // Hold the crash point on its screen spot while the lens rams in.
    const [cx, cy] = crashPt();
    const sx = (cx - cam.x) * z, sy = (cy - cam.y) * z;
    cam.zoom = z * k;
    cam.x = cx - sx / cam.zoom - crashPan(t);
    cam.y = cy - sy / cam.zoom;
  }
}

/** Screen position (logical px, shake and shove included) of a world point. */
function scr(env: Env, x: number, y: number): P2 {
  const [u, v] = env.cam.toUV(x, y);
  return [u * VW, v * VH];
}

// ---------------------------------------------------------------- No.10

interface HeroPose {
  key: No10Key;
  x: number;
  y: number;
  anchor?: string;
}
function heroAt(t: number): HeroPose {
  const key = no10At(SEQ[4], t);
  if (key === 'R1' || key === 'R2' || key === 'R3' || key === 'R4') return { key, x: XR, y: GY };
  if (key === 'AP2') {
    // The bound: the pelvis flies from R4's to F5a's on a shallow arc.
    const u = clamp((t - 0.24) / (T.plant - 0.24));
    return { key, x: lerp(A.r4Pel[0], A.f5Pel[0], u), y: lerp(A.r4Pel[1], A.f5Pel[1], u) - 12 * Math.sin(Math.PI * u), anchor: 'pelvis' };
  }
  return { key, x: 0, y: GY };
}
/** World x of his pelvis (the funnel trails from it). */
function pelvisX(t: number): number {
  if (t < 0.24) return lerp(A.r1Pel[0], A.r4Pel[0], t / 0.24);
  if (t < T.plant) return lerp(A.r4Pel[0], A.f5Pel[0], (t - 0.24) / (T.plant - 0.24));
  return A.f5Pel[0];
}
/** World point of the hero's current boot (the orb rides it). */
function bootAt(t: number): P2 {
  const key = no10At(SEQ[4], t);
  if (key === 'HCs') return A.hcsBoot;
  if (key === 'F6') return A.f6Boot;
  return A.boot;
}

// ---------------------------------------------------------------- the air: tracks (pure functions of t)

/** The orb's radius (world px): born from the funnel, then a notch bigger on every lurch (20.5 = 94 px at zoom 2.3). */
const ORB_R: KeyRow[] = [[T.cock, 2], [0.62, 14, 'outCubic'], [LURCH[0], 17, 'vacuum'], [LURCH[1], 19, 'vacuum'], [LURCH[2], 20.5, 'vacuum']];
/** The lens at the orb: a slow pull, then the three notches, the flip at the snap and its decay. */
const LENS: KeyRow[] = [
  [T.cock, 0], [0.62, -0.1, 'outQuad'], [LURCH[0], -0.18, 'vacuum'], [LURCH[1], -0.26, 'vacuum'], [LURCH[2], -0.35, 'vacuum'],
  [T.snap, -0.35], [T.snap + SNAP2, 0.15, 'step2'], [1.6, 0, 'outCubic'],
];
/** The isobars' squeeze: each lurch snaps them inward (and they creep in between). */
const SQUEEZE: KeyRow[] = [[T.cock, 1.3], [0.62, 1, 'outCubic'], [LURCH[0], 0.86, 'vacuum'], [LURCH[1], 0.74, 'vacuum'], [LURCH[2], 0.64, 'vacuum']];
/** The outermost isobar snaps in harder on every lurch. */
const OUTER: KeyRow[] = [[T.cock, 1], [LURCH[0], 0.9, 'vacuum'], [LURCH[1], 0.84, 'vacuum'], [LURCH[2], 0.78, 'vacuum']];
/** The vacuum's strength (wind lines, arms, isobars): fades in with the orb, gone at the snap. */
const vacK = (t: number) => (t < T.cock ? 0 : t < T.snap ? ease.outQuad(clamp((t - T.cock) / 0.12)) : 0);
/** Seconds since the latest lurch (Infinity before the first). */
function sinceLurch(t: number): number {
  let s = Infinity;
  for (const l of LURCH) if (t >= l - SNAP2) s = t - l;
  return s;
}
/** The crush: already flat on the first release frame (the ice bar reads at once), then settling. */
const crushAt = (t: number) => (t < T.snap ? 0 : ease.outQuad(clamp((t - T.snap + STEP) / 0.06)));

// ---------------------------------------------------------------- module state (reset in init)

const spin = new BallSpin();
let blades: Blade[] = [];
let fgBlades: Blade[] = [];
let fired = { r1: false, plant: false, dust: false, snap: false, ring: false, whip: false, f6: false };
let inhaled: Particle[] = [];
/** The plant's dust puffs (west of the heel, behind the cast) until the vacuum takes them at the cock. */
let plantDust: Particle[] = [];
let spawnAcc = 0;

// ---------------------------------------------------------------- the stadium

/** The stadium backdrop under its own scale (a lower-parallax zoom), its horizon on the world horizon. */
function drawStadium(env: Env, t: number) {
  const ctx = env.ctx;
  const cam = env.cam;
  const [, hy] = scr(env, cam.x, HZ - 2);
  const [ox] = shakeOff(env);
  const zb = 0.92 * Math.pow(cam.zoom / 1.1, 0.5);
  const camXb = 690 + cam.x * 0.12;
  const camYb = FIELD.horizon - hy / zb + 200;
  const bt = 6 + simAt(t) * 1.6;
  // Before the inhale the flags blow east with the storm; from the cock they all point at the orb (split at its x).
  const pull = clamp((t - T.cock) / 0.12);
  const [orbX] = scr(env, A.boot[0], A.boot[1]);
  const split = pull > 0 ? orbX : VW + 10;
  for (const side of [0, 1] as const) {
    // Before the pull there is one backdrop only (no east half to flip): never fill it twice.
    if (side === 1 && pull <= 0) continue;
    env.screen();
    ctx.save();
    if (pull > 0) {
      ctx.beginPath();
      if (side === 0) ctx.rect(-20, -20, split + 20, VH + 40);
      else ctx.rect(split, -20, VW - split + 20, VH + 40);
      ctx.clip();
    }
    ctx.translate(VW / 2 + ox, hy);
    ctx.scale(zb, zb);
    ctx.translate(-camXb, -FIELD.horizon);
    const dir: 1 | -1 = pull > 0 && side === 1 ? -1 : 1;
    drawFieldBackdrop(ctx, env.art.stadium, camXb, camYb, bt, { storm: 1, wind: lerp(0.55, 1.15, pull), windDir: dir });
    ctx.restore();
  }
}

/** The floodlight lamps re-lit after the storm darken (at the low zooms they peek over the top edge). */
function drawLamps(env: Env, t: number) {
  const ctx = env.ctx;
  const cam = env.cam;
  const [, hy] = scr(env, cam.x, HZ - 2);
  const [ox] = shakeOff(env);
  const zb = 0.92 * Math.pow(cam.zoom / 1.1, 0.5);
  const camXb = 690 + cam.x * 0.12;
  env.screen();
  // The floodlights wash the crowd back up to ~35 % (the storm darken took it to ~15 %): the stands must read, so the
  // lens visibly drags them toward the orb.
  ctx.save();
  ctx.translate(VW / 2 + ox, hy);
  ctx.scale(zb, zb);
  ctx.translate(-camXb, -FIELD.horizon);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.46;
  ctx.drawImage(env.art.stadium.crowd, Math.round(camXb * 0.25 - 220), FIELD.horizon - 110);
  ctx.restore();
  ctx.globalAlpha = 1;
  // Each floodlight is a navy mast under a 2 x 4 lamp bank (never a round disc: no moon in GALE), in a cold haze.
  for (const tx of [120, 620, 1120, 1620]) {
    const fxw = tx + camXb * 0.5 - 300 + 20;
    const x = VW / 2 + ox + (fxw - camXb) * zb, y = hy + (-26 - FIELD.horizon) * zb;
    if (x < -200 || x > VW + 200 || y < -160) continue;
    const fl = 0.93 + 0.07 * Math.sin(t * 29 + tx);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = HEX.navy;
    ctx.fillRect(x - 1.5 * zb, y + 8 * zb, 3 * zb, 60 * zb);
    ctx.fillRect(x - 15 * zb, y - 3 * zb, 30 * zb, 14 * zb);
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf([70, 110, 210]), x, y - 10, 260 * zb, 0.16 * fl, 1.3, 0.55);
    if (t >= T.plant) drawGlow(ctx, glowOf([150, 200, 255]), x, y, 110 * zb, 0.22 * fl);
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 4; c++) drawGlow(ctx, glowOf([235, 248, 255]), x + (c - 1.5) * 7 * zb, y + r * 6 * zb, 4 * zb, 0.8 * fl);
    drawGlow(ctx, glowOf([180, 225, 255]), x, y + 3 * zb, 8 * zb, 0.35 * fl, 16, 0.5);
  }
  ctx.globalCompositeOperation = 'source-over';
}

function shakeOff(env: Env): P2 {
  const [u, v] = env.cam.toUV(env.cam.x, env.cam.y);
  return [u * VW - VW / 2, v * VH - VH / 2];
}

// ---------------------------------------------------------------- the turf and its decals

const STRIPE = 290;
function drawTurf(env: Env, t: number) {
  const ctx = env.ctx;
  const cam = env.cam;
  env.world();
  const z = cam.zoom;
  const halfW = VW / (2 * z) + 60, halfH = VH / (2 * z) + 60;
  const L = cam.x - halfW, R = cam.x + halfW, B = cam.y + halfH;
  if (B <= HZ) return;
  const g = ctx.createLinearGradient(0, HZ, 0, B);
  const kG = clamp((GY - HZ) / Math.max(1, B - HZ));
  g.addColorStop(0, '#173a33');
  g.addColorStop(kG * 0.5, '#1f5a37');
  g.addColorStop(kG, '#237036');
  g.addColorStop(1, '#1a5a2b');
  ctx.fillStyle = g;
  ctx.fillRect(L, HZ - 1, R - L, B - HZ + 1);
  // Mowing stripes converging on the vanishing point.
  const cx = cam.x;
  const sB = (B - HZ) / (GY - HZ);
  ctx.fillStyle = 'rgba(190,255,200,0.07)';
  ctx.beginPath();
  const k0 = Math.floor((cx - halfW / sB - 600) / STRIPE) - 1, k1 = Math.ceil((cx + halfW / sB + 600) / STRIPE) + 1;
  for (let k = k0 - (((k0 % 2) + 2) % 2); k <= k1; k += 2) {
    ctx.moveTo(cx, HZ);
    ctx.lineTo(cx + (k * STRIPE - cx) * sB, B);
    ctx.lineTo(cx + ((k + 1) * STRIPE - cx) * sB, B);
    ctx.closePath();
  }
  ctx.fill();
  // The far touchline just under the boards, and a cold sheen under it.
  ctx.fillStyle = 'rgba(16,40,44,0.6)';
  ctx.fillRect(L, HZ - 1, R - L, 4);
  ctx.fillStyle = 'rgba(225,240,255,0.55)';
  ctx.fillRect(L, HZ + 3, R - L, 1);
  ctx.globalCompositeOperation = 'lighter';
  const sh = ctx.createLinearGradient(0, HZ + 3, 0, HZ + 30);
  sh.addColorStop(0, 'rgba(110,160,230,0.16)');
  sh.addColorStop(1, 'rgba(110,160,230,0)');
  ctx.fillStyle = sh;
  ctx.fillRect(L, HZ + 3, R - L, 27);
  // Dew on the turf (frozen with the sim clock).
  const st = simAt(t);
  const n0 = Math.floor((L - 300) / 23), n1 = Math.ceil((R + 300) / 23);
  for (let k = n0; k <= n1; k++) {
    const s = 0.3 + hash(k * 1.7) * 1.8;
    const X = k * 23 + hash(k * 3.1) * 23;
    const x = cx + (X - cx) * s, y = HZ + (GY - HZ) * s;
    if (x < L || x > R || y > B) continue;
    const tw = Math.pow(Math.max(0, Math.sin(hash(k) * 40 + st * (3 + hash(k * 5) * 6))), 8);
    const sz = Math.max(1 / z, 1.1 * s);
    ctx.globalAlpha = 0.18 + 0.5 * tw;
    ctx.fillStyle = tw > 0.6 ? HEX.ice : '#8fd6ff';
    ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

/** The footprints of air: his last step before the shot, the R1 stance, the plant (pure: age from the sim clock). */
function drawCraters(env: Env, t: number) {
  const ctx = env.ctx;
  env.world();
  const st = simAt(t);
  const plantSim = simAt(T.plant);
  airCrater(ctx, XR - 172, GY, 22, 0.2, st + 0.28, 2, 0.75);
  airCrater(ctx, XR + 2, GY, 24, 0.2, st, 2, 0.9);
  if (t >= T.plant) {
    airCrater(ctx, 2, GY, 30, 0.22, st - plantSim, 3, 1);
    // From the cock the crater's rings are pulled toward the orb: an inner pressed ring sliding up-left.
    const k = vacK(t);
    if (k > 0) {
      ctx.globalAlpha = 0.5 * k;
      ctx.strokeStyle = HEX.pressed;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(-10 - 8 * k, GY, 52 + 6 * k, 11, 0, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
}

/** Grass round the plant: blades lean west with the run, then toward the orb (combed, never torn). */
function drawGroundBlades(env: Env, t: number) {
  const ctx = env.ctx;
  env.world();
  const k = clamp((t - T.cock) / 0.1);
  const [bx, by] = A.boot;
  const lean = (b: Blade) => {
    const west = -0.35 + 0.08 * Math.sin(b.ph + t * 9);
    const dx = bx - b.x, dy = by - b.y;
    const toward = clamp((Math.sign(dx) * 90) / Math.max(20, Math.hypot(dx, dy)), -1.2, 1.2);
    return lerp(west, toward, k);
  };
  drawBlades(ctx, blades, lean, '#2f7a3c', 0.9);
}

/**
 * Foreground grass (parallax 1.6): a dark turf bank along the bottom edge with clumps of three blades each, leaning
 * west with the run, then toward the orb; in the freeze the blades leaning at the orb catch a cyan tip.
 */
const FG_CLUMP: [number, number, string][] = [[-3, 3, '#0c2417'], [0, 2, '#143a24'], [3, 2, '#0c2417']];
function drawForeground(env: Env, t: number) {
  const ctx = env.ctx;
  const cam = env.cam;
  env.world();
  const s = 1.6;
  const y0 = HZ + (GY - HZ) * s;
  const k = clamp((t - T.cock) / 0.1);
  const [bx, by] = A.boot;
  const halfW = VW / (2 * cam.zoom) + 40;
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#0a1d14';
  ctx.fillRect(cam.x - halfW, y0 + 12, halfW * 2, 6);
  ctx.lineCap = 'round';
  const tips: P2[] = [];
  for (const [ox, w, col] of FG_CLUMP) {
    ctx.lineWidth = w;
    ctx.strokeStyle = col;
    ctx.beginPath();
    for (const b of fgBlades) {
      const x = cam.x + (b.x - cam.x) * s + ox;
      if (x < cam.x - halfW || x > cam.x + halfW) continue;
      const dx = bx - x, dy = by - y0;
      const ph = b.ph + ox * 0.7;
      const toward = clamp((Math.sign(dx) * 140) / Math.max(30, Math.hypot(dx, dy)), -1.1, 1.1);
      const l = lerp(-0.4 + 0.1 * Math.sin(ph + t * 7), toward + 0.12 * (ox / 3), k);
      const h = b.h * (ox === 0 ? 1 : 0.78);
      const tx = x + Math.sin(l) * h, ty = y0 + b.y - Math.cos(l) * h;
      ctx.moveTo(x, y0 + b.y);
      ctx.quadraticCurveTo(x + Math.sin(l) * h * 0.35, y0 + b.y - h * 0.55, tx, ty);
      if (ox === 0 && k > 0 && Math.abs(toward) > 0.25) tips.push([tx, ty]);
    }
    ctx.stroke();
  }
  // In the freeze, the blades bent at the orb catch its light: a 1 px cyan tip.
  const fr = vacK(t);
  if (fr > 0 && tips.length) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.85 * fr;
    ctx.fillStyle = CYAN;
    const px = 1 / cam.zoom;
    for (const [tx, ty] of tips) ctx.fillRect(tx - px, ty - px, 2 * px, 2 * px);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the funnel (the cyclone trailing him, then inhaled)

/**
 * The stadium cyclone of shot 3 as a funnel trailing behind him: 12 bands from his heels up and back (west), narrow
 * at the turf, wide at the top, orbiting counter-clockwise. From the cock it is sucked into the orb: each band flies
 * to the boot, shrinking and spinning faster (top bands first). `half` 'back' before him, 'front' after him.
 */
function drawFunnel(env: Env, t: number, half: 'back' | 'front') {
  if (t >= 0.64) return;
  const ctx = env.ctx;
  env.world();
  const baseX = pelvisX(Math.max(0, t)) - 26;
  const front = half === 'front';
  const NB = 14;
  // The funnel's soft body (back half only): a column of storm vapour leaning back along its axis.
  if (!front) {
    const puff = softSprite('vapor', 0.4), dark = softSprite('storm', 0.75);
    for (let j = 0; j < 12; j++) {
      const u = (j + 0.5) / 12;
      const c = ease.inCubic(clamp((t - T.cock - (1 - u) * 0.05) / 0.11));
      if (c >= 1) continue;
      const cx = lerp(baseX - 150 * u * u, A.boot[0], ease.inQuad(c)), cy = lerp(GY - 6 - u * 290, A.boot[1], ease.inQuad(c));
      const r = (16 + 90 * Math.pow(u, 1.2)) * (1 - c);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.3 * (1 - c);
      ctx.drawImage(dark, cx - r * 1.2, cy - r * 0.5, r * 2.4, r);
      ctx.globalAlpha = 0.14 * (1 - c);
      ctx.drawImage(puff, cx - r, cy - r * 0.35, r * 2, r * 0.7);
    }
  }
  for (let i = 0; i < NB; i++) {
    const u = (i + 1) / NB;
    const c = ease.inCubic(clamp((t - T.cock - (1 - u) * 0.05) / 0.11));
    if (c >= 1) continue;
    const by = GY - 6 - u * 290;
    const bx = baseX - 150 * u * u;
    const cx = lerp(bx, A.boot[0], ease.inQuad(c)), cy = lerp(by, A.boot[1], ease.inQuad(c));
    const rx = (14 + 112 * Math.pow(u, 1.25)) * (1 - c), ry = rx * 0.24;
    if (rx < 1) continue;
    const ph = -t * 1.4 * TAU * (1 + 5 * c) + i * 0.9;
    const span = 1.4 + hash(i * 5.1) * 1.6;
    const thick = (3 + Math.round(hash(i) * 4)) * (1 - 0.5 * c);
    const al = (0.5 + 0.45 * hash(i * 3.3)) * (1 - c * 0.5) * clamp(1.2 - t * 0.5);
    for (let seg = 0; seg < 2; seg++) {
      const s0 = ph + seg * Math.PI, s1 = s0 + span * 0.5;
      if (Math.sin((s0 + s1) / 2) > 0 !== front) continue;
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = al * 0.5;
      ctx.strokeStyle = NAVY;
      ctx.lineWidth = thick + 3;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, -0.12 * u, s0, s1);
      ctx.stroke();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = al;
      ctx.strokeStyle = i % 3 === 0 ? CYAN : ICE;
      ctx.lineWidth = thick;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, -0.12 * u, s0, s1);
      ctx.stroke();
    }
    // Debris riding the band: a dew bead and a blade.
    const dth = -t * 1.4 * TAU * (1 + 5 * c) + i * 2.3;
    if (Math.sin(dth) > 0 === front) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.9 * (1 - c);
      ctx.fillStyle = i % 2 ? HEX.ice : '#3f9a48';
      ctx.fillRect(Math.round(cx + Math.cos(dth) * rx), Math.round(cy + Math.sin(dth) * ry), i % 2 ? 2 : 3, i % 2 ? 2 : 1);
    }
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

// ---------------------------------------------------------------- the vacuum layers (screen space)

/**
 * The isobars round the orb: three bold wobbling contour rings (2 px cyan over a 5 px navy halo), snapping inward on
 * every lurch (the outermost hardest) and flaring for 3 frames when they snap. `grow` (>= 1) blows them outward at the
 * snap.
 */
function drawIsobars(env: Env, t: number, ox: number, oy: number, k: number, grow = 1) {
  if (k <= 0) return;
  const ctx = env.ctx;
  env.screen();
  const sq = keys(SQUEEZE, t) * (1 - 0.05 * clamp(t - 0.62));
  const since = sinceLurch(t);
  const flare = since < 0.06 ? 1 - since / 0.06 : 0;
  const base = [210, 330, 480];
  ctx.save();
  base.forEach((b, i) => {
    const outer = i === base.length - 1;
    const R = b * sq * (outer ? keys(OUTER, t) : 1) * grow;
    const a = k * (0.42 + 0.08 * i) * (outer ? 1 + 1.0 * flare : 1 + 0.5 * flare);
    const path = () => {
      ctx.beginPath();
      for (let j = 0; j <= 96; j++) {
        const th = (j / 96) * TAU;
        const r = R * (1 + 0.035 * Math.sin(4 * th + t * 3 + i * 1.3) + 0.015 * Math.sin(2 * th - t * 2 + i));
        const x = ox + Math.cos(th) * r, y = oy + Math.sin(th) * r * 0.82;
        j ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath();
    };
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = clamp(a * 0.9);
    ctx.strokeStyle = NAVY;
    ctx.lineWidth = 5;
    path();
    ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = clamp(a);
    ctx.strokeStyle = i % 2 ? CYAN : 'rgb(150,232,255)';
    ctx.lineWidth = outer && flare > 0 ? 3 : 2;
    path();
    ctx.stroke();
  });
  ctx.restore();
}

/**
 * The vortex: five streams of the storm spiralling into the orb (log spirals wrapping ~2.4 rad from the frame edge to
 * the orb, turning slowly), the frame's one giant energy shape: a 40 px navy shadow, a vapour body tapering 30 -> 18 ->
 * 9 px from the frame edge to the orb, and an ice core whose dashes race inward (the flow). `grow` (>= 1) blows the
 * whole vortex outward at the snap, its dashes reversed.
 */
function drawArms(env: Env, t: number, ox: number, oy: number, k: number, ro: number, grow = 1) {
  if (k <= 0) return;
  const ctx = env.ctx;
  env.screen();
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const r0 = 600 * grow, r1 = Math.max(10, ro * 1.25) * grow;
  for (let arm = 0; arm < 5; arm++) {
    const a0 = (arm / 5) * TAU + 0.4 + t * 1.1 + 0.3 * hash(arm * 3.3);
    const b = 0.95 + 0.25 * hash(arm * 1.9);
    const pts: P2[] = [];
    for (let j = 0; j <= 48; j++) {
      const u = j / 48;
      const r = r0 * Math.pow(r1 / r0, u);
      const th = a0 + b * Math.log(r0 / r);
      pts.push([ox + Math.cos(th) * r, oy + Math.sin(th) * r * 0.8]);
    }
    const path = (j0 = 0, j1 = pts.length - 1) => {
      ctx.beginPath();
      for (let j = j0; j <= j1; j++) (j > j0 ? ctx.lineTo(pts[j][0], pts[j][1]) : ctx.moveTo(pts[j][0], pts[j][1]));
    };
    ctx.setLineDash([]);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.42 * k;
    ctx.strokeStyle = NAVY;
    ctx.lineWidth = 40;
    path();
    ctx.stroke();
    // The vapour body, tapering into the orb (outer, middle and inner thirds; overlapping one point so it never gaps).
    ctx.strokeStyle = 'rgb(170,220,250)';
    ctx.lineCap = 'round';
    const THIRDS: [number, number, number, number][] = [[0, 16, 30, 0.45], [16, 32, 18, 0.5], [32, 48, 9, 0.6]];
    for (const [j0, j1, w, al] of THIRDS) {
      // Two passes, a wide faint one and a half-width core, so the edges are soft and the taper never steps.
      ctx.globalAlpha = al * 0.45 * k;
      ctx.lineWidth = w;
      path(j0, j1);
      ctx.stroke();
      ctx.globalAlpha = al * 0.6 * k;
      ctx.lineWidth = w * 0.5;
      path(j0, j1);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'lighter';
    // Where the arm is crushed into the orb the air glows hot (the inner third, brightening toward the orb).
    ctx.strokeStyle = ICE;
    for (const [j0, w, al] of [[34, 7, 0.35], [40, 5, 0.5], [44, 3, 0.7]] as const) {
      ctx.globalAlpha = al * k;
      ctx.lineWidth = w;
      path(j0, 48);
      ctx.stroke();
    }
    // The racing core: an irregular dash (torn air, never road markings), brightening third by third toward the orb.
    // Each third's dash offset carries the arc length before it, so the dashes flow on unbroken.
    const cum: number[] = [0];
    for (let j = 1; j < pts.length; j++) cum.push(cum[j - 1] + Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]));
    ctx.setLineDash([8 + 40 * hash(arm), 14 + 26 * hash(arm * 2), 3 + 10 * hash(arm * 3), 30 + 24 * hash(arm * 5)]);
    const off0 = (grow > 1 ? -1 : 1) * t * 520 + arm * 37;
    for (const [j0, j1, al] of [[0, 16, 0.45], [16, 32, 0.7], [32, 48, 1]] as const) {
      ctx.lineDashOffset = off0 + cum[j0];
      ctx.globalAlpha = 0.9 * al * k;
      ctx.strokeStyle = arm % 2 ? CYAN : ICE;
      ctx.lineWidth = 3;
      path(j0, j1);
      ctx.stroke();
      // A white-hot thread down the middle of each racing dash.
      ctx.globalAlpha = 0.85 * al * k;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }
  ctx.setLineDash([]);
  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

/**
 * The 80 wind lines: white streaks rushing into the orb at ~900 px/s (unwarped: the only fast thing in a frozen world),
 * curling a little round it as they near, each over a navy halo. `out` (0..1) reverses them into a blast after the snap.
 */
function drawWindLines(env: Env, t: number, ox: number, oy: number, k: number, out = 0, ro = 0) {
  if (k <= 0) return;
  const ctx = env.ctx;
  env.screen();
  ctx.save();
  ctx.lineCap = 'round';
  const span = 620;
  for (let i = 0; i < 80; i++) {
    const th0 = hash(i * 1.37) * TAU;
    const sp = 900 * (0.75 + 0.5 * hash(i * 2.1)) * (out > 0 ? 1.9 : 1);
    const f = (t * sp / span + hash(i * 4.4)) % 1;
    // Inhaling, the lines bunch up toward the orb (they crowd in as they near it).
    const d = out > 0 ? ro + 10 + f * span : ro * 0.8 + Math.pow(1 - f, 1.7) * span;
    const len = (36 + 90 * hash(i * 6.1)) * (0.35 + d / span);
    const curl = out > 0 ? 0 : 0.2;
    const pts: P2[] = [];
    for (let s = 0; s <= 4; s++) {
      const dd = d + (len * s) / 4;
      const th = th0 + curl * (1 - Math.min(1, dd / span)) * (1 - Math.min(1, dd / span));
      pts.push([ox + Math.cos(th) * dd, oy + Math.sin(th) * dd * 0.82]);
    }
    const fadeIn = out > 0 ? 1 - f : clamp((span - d) / 90);
    const al = k * fadeIn * clamp((d - ro * 0.8) / 30) * (0.45 + 0.5 * hash(i * 9.2));
    if (al <= 0.01) continue;
    const w = 2 + Math.round(hash(i * 3.3) * 2);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = al * 0.55;
    ctx.strokeStyle = NAVY;
    ctx.lineWidth = w + 3;
    ctx.beginPath();
    pts.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = Math.min(1, al * 1.2);
    ctx.strokeStyle = i % 5 === 0 ? CYAN : i % 3 === 0 ? '#ffffff' : ICE;
    ctx.lineWidth = w;
    ctx.beginPath();
    pts.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    // The bright head (the end nearest the orb while inhaling).
    const [hx, hy] = out > 0 ? pts[4] : pts[0];
    ctx.globalAlpha = Math.min(1, al * 1.4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(Math.round(hx) - 1, Math.round(hy) - 1, w + 1, w + 1);
  }
  // The corona: short, fast strokes diving into the orb's surface.
  if (out === 0 && ro > 4) {
    for (let i = 0; i < 40; i++) {
      const th = hash(i * 5.71) * TAU + t * 0.7;
      const f = (t * (3.5 + 2 * hash(i * 1.9)) + hash(i * 2.3)) % 1;
      const d = ro * (1.05 + 2.2 * (1 - f));
      const len = ro * (0.25 + 0.5 * hash(i * 3.7)) * (1 - f * 0.5);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = k * 0.75 * f;
      ctx.strokeStyle = i % 3 ? ICE : CYAN;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ox + Math.cos(th) * d, oy + Math.sin(th) * d);
      ctx.lineTo(ox + Math.cos(th + 0.12) * (d + len), oy + Math.sin(th + 0.12) * (d + len));
      ctx.stroke();
    }
  }
  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

/**
 * The pressure orb on the boot (screen space, radius R px): a navy halo, a cobalt shell stroke, a cyan glow, three
 * ice spiral arms of compressed air whirling inward, an ice core and three tilted isobar rings; `crush` flattens it
 * into a disc on the laces along `ang` (the swing direction); `bar` (0..1) lays the crushed air across the laces as a
 * 2 px ice bar (the 0.06 s the crush reads).
 */
function drawOrb(env: Env, t: number, x: number, y: number, R: number, crush: number, ang = 0, bar = 0) {
  if (R <= 0.5) return;
  const ctx = env.ctx;
  env.screen();
  const sx = 1 + 0.7 * crush, sy = 1 - 0.82 * crush;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang * crush);
  const pulse = 1 + 0.05 * Math.sin(t * TAU * 6.5);
  ctx.globalCompositeOperation = 'source-over';
  drawGlow(ctx, glowOf(PAL.navy), 0, 0, R * 2.6, 0.75, sx, sy);
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.cyan), 0, 0, R * 4.2 * pulse, 0.16, sx, sy);
  drawGlow(ctx, glowOf(PAL.cyan), 0, 0, R * 2.6 * pulse, 0.85, sx, sy);
  // The shell: a cobalt stroke (normal blend) and an ice rim on the lit side.
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 0.8;
  ctx.strokeStyle = COBALT;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, R * sx, R * sy, 0, 0, TAU);
  ctx.stroke();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = ICE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(0, 0, R * sx - 1, R * sy - 1, 0, Math.PI * 1.05, Math.PI * 1.7);
  ctx.stroke();
  // Compressed-air arms whirling into the core.
  ctx.save();
  ctx.scale(sx, sy);
  for (let a = 0; a < 3; a++) {
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = a === 1 ? CYAN : ICE;
    ctx.lineWidth = Math.max(1, R * 0.07);
    ctx.beginPath();
    for (let s = 0; s <= 14; s++) {
      const u = s / 14;
      const r = R * (0.92 - 0.75 * u);
      const th = t * 9 + (a * TAU) / 3 + u * 2.4;
      s ? ctx.lineTo(Math.cos(th) * r, Math.sin(th) * r) : ctx.moveTo(Math.cos(th) * r, Math.sin(th) * r);
    }
    ctx.stroke();
  }
  ctx.restore();
  drawGlow(ctx, glowOf(PAL.ice), 0, 0, R * 0.8, 0.85, sx, sy);
  drawGlow(ctx, glowOf([255, 255, 255]), 0, 0, R * 0.4, 0.9, sx, sy);
  // The accretion band: the inflowing storm wound into a hot ring round the core (tilted like the isobars).
  if (crush < 1) {
    ctx.globalAlpha = 0.9 * (1 - crush);
    ctx.strokeStyle = ICE;
    ctx.lineWidth = Math.max(2, R * 0.16);
    ctx.beginPath();
    ctx.ellipse(0, 0, R * 1.45 * sx, R * 0.5 * sy, -0.35, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1, R * 0.06);
    ctx.stroke();
  }
  if (bar > 0) {
    // The crush, readable: the compressed air laid flat across the laces as one ice bar over a navy line.
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.7 * bar;
    ctx.fillStyle = NAVY;
    ctx.fillRect(-R * 1.7, -2, R * 3.4, 4);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = bar;
    ctx.fillStyle = ICE;
    ctx.fillRect(-R * 1.6, -1, R * 3.2, 2);
    drawGlow(ctx, glowOf(PAL.ice), 0, 0, R * 1.8, 0.5 * bar, 1, 0.12);
  }
  // Three tilted isobar rings turning round it.
  for (let i = 0; i < 3; i++) {
    const tilt = t * 0.6 + (i * Math.PI) / 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, R * 1.22 * sx, (R * 1.22 * Math.abs(Math.cos(tilt)) * 0.9 + 1) * sy, i * 0.6, 0, TAU);
    // A navy understroke so each ring reads against the core's glare, then the ring itself.
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = NAVY;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = i === 1 ? ICE : CYAN;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

// ---------------------------------------------------------------- the cast

/** No.10 with a cyan rim from the orb side; in the freeze a navy veil keeps the orb the only hot thing. */
function drawHero(env: Env, t: number) {
  const ctx = env.ctx;
  const h = heroAt(t);
  const o = h.anchor ? { anchor: h.anchor } : {};
  env.world();
  // Contact shadow.
  const air = h.key === 'AP2' ? 1 : 0;
  const sxh = h.key.startsWith('R') ? XR - 16 : h.key === 'AP2' ? h.x - 6 : -30;
  ctx.fillStyle = 'rgba(4,8,22,0.55)';
  ctx.beginPath();
  ctx.ellipse(sxh, GY + 1, 46 - air * 10, 5, 0, 0, TAU);
  ctx.fill();
  const f = no10(h.key);
  const frz = t < T.vac ? clamp((t - T.cock) / 0.07) : t < T.snap ? 1 : 1 - clamp((t - T.snap) / 0.08);
  if (f) {
    // The rim stays ~2 screen px at every zoom (a fixed world offset doubled the outline at zoom 2.3-2.5).
    const ro = Math.max(1, Math.round(2.4 / env.cam.zoom));
    ctx.globalCompositeOperation = 'lighter';
    drawNo10(env, h.key, h.x - ro, h.y - ro, D, { ...o, alpha: 0.38 + 0.3 * frz }, f.a.tinted(f.i, [70, 216, 255]));
    ctx.globalCompositeOperation = 'source-over';
  }
  drawNo10(env, h.key, h.x, h.y, D, o);
  if (f && frz > 0) drawNo10(env, h.key, h.x, h.y, D, { ...o, alpha: 0.24 * frz }, f.a.tinted(f.i, PAL.navy));
}

function ballOffset(t: number): P2 {
  // The ball trembles 1 px toward the boot at 20 Hz through the vacuum.
  if (t < T.vac || t >= T.snap) return [0, 0];
  return [Math.sin(t * TAU * 20) > 0 ? -1 : 0, 0];
}
function drawTheBall(env: Env, t: number) {
  const ctx = env.ctx;
  env.world();
  const [dx, dy] = ballOffset(t);
  const [bx, by] = A.ball;
  ctx.fillStyle = 'rgba(4,8,22,0.6)';
  ctx.beginPath();
  ctx.ellipse(bx, GY + 1, 14, 3, 0, 0, TAU);
  ctx.fill();
  // The library's plain ball (the cobalt energy ball is shot 5's reveal, after the strike); in the vacuum only a faint
  // cyan rim on the side facing the boot.
  drawBall(env, spin, Math.round(bx + dx), Math.round(by + dy), 6, D);
  const vk = vacK(t);
  if (vk > 0) {
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.cyan), bx + dx - 6, by + dy, 16, 0.4 * vk);
    drawGlow(ctx, glowOf(PAL.ice), bx + dx, by + dy, 13, 0.18 * vk);
    ctx.globalCompositeOperation = 'source-over';
  }
}

/** Two paper cups plucked out of the stands, hanging mid-flight on their way into the orb (pure functions of t). */
function drawCups(env: Env, t: number) {
  if (t < T.cock || t >= T.snap + 0.2) return;
  const ctx = env.ctx;
  env.world();
  const cups = [
    { x: A.boot[0] + 250, y: A.boot[1] - 70, s: 1, ph: 0.4 },
    { x: A.boot[0] + 175, y: A.boot[1] + 40, s: -1, ph: 2.1 },
  ];
  for (const c of cups) {
    const st = simAt(t) - simAt(T.cock);
    let u = clamp(st / 0.22);
    let x = lerp(c.x, A.boot[0], ease.inQuad(u) * 0.5), y = lerp(c.y, A.boot[1], ease.inQuad(u) * 0.5) - 20 * Math.sin(u * 3);
    if (t >= T.snap) {
      // Blasted back out.
      const b = (t - T.snap) / 0.2;
      u = b;
      x += (x - A.boot[0]) * 1.8 * b;
      y += (y - A.boot[1]) * 1.8 * b;
    }
    const rot = c.ph + c.s * (st * 26 + (t >= T.snap ? (t - T.snap) * 30 : 0));
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.rotate(rot);
    ctx.fillStyle = HEX.navy;
    ctx.fillRect(-4, -5, 8, 11);
    ctx.fillStyle = '#d9e2f0';
    ctx.fillRect(-3, -4, 6, 9);
    ctx.fillStyle = '#9a2230';
    ctx.fillRect(-3, -1, 6, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-3, -4, 6, 1);
    ctx.restore();
  }
}

/** The ice-white smear band of the whip (HC1 boot -> HCs boot -> F6 boot), cyan body over a navy halo. */
function drawSmear(env: Env, t: number) {
  if (t < T.whip || t > 1.68) return;
  const ctx = env.ctx;
  env.world();
  const prog = ease.outQuad(clamp((t - T.whip) / 0.06));
  const fade = 1 - clamp((t - 1.56) / 0.12);
  const p0 = { x: A.boot[0] - 4, y: A.boot[1] - 4 }, p1 = { x: A.hcsBoot[0] - 6, y: A.hcsBoot[1] }, p2 = { x: A.f6Boot[0], y: A.f6Boot[1] };
  const cx = 2 * p1.x - (p0.x + p2.x) / 2, cy = 2 * p1.y - (p0.y + p2.y) / 2;
  const pts: TrailPt[] = [];
  for (let i = 0; i <= 20; i++) {
    const s = (i / 20) * prog, v = 1 - s;
    pts.push({ x: v * v * p0.x + 2 * v * s * cx + s * s * p2.x, y: v * v * p0.y + 2 * v * s * cy + s * s * p2.y });
  }
  // Swept air, not a blade: a soft vapour band over a navy shadow, combed by seven thin streak lines.
  ctx.globalCompositeOperation = 'source-over';
  ribbon(ctx, pts, 4, 36, NAVY, 0.3 * fade);
  ribbon(ctx, pts, 3, 26, 'rgb(170,220,250)', 0.2 * fade);
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for (let j = 0; j < 7; j++) {
    const off = (j / 6 - 0.5) * 2;
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
      const w = (i / (pts.length - 1)) * 12 * off;
      const x = pts[i].x - (dy / l) * w, y = pts[i].y + (dx / l) * w;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.globalAlpha = (0.35 + 0.4 * (1 - Math.abs(off))) * fade;
    ctx.strokeStyle = j % 3 === 1 ? CYAN : ICE;
    ctx.lineWidth = j === 3 ? 2 : 1;
    ctx.setLineDash([10 + 8 * hash(j), 4 + 5 * hash(j * 2)]);
    ctx.lineDashOffset = -t * 400;
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

// ---------------------------------------------------------------- the dew mirror (1.22-1.38)

/**
 * The Glance face strip (G4: pupils down-right on the ball, lids and brows lower), found by its own export stem
 * ('Glance.json'), then G1; null while it is not exported (drawNo10's hand-drawn face crop stands in).
 */
function glance(): { a: StudioAnim; i: number } | null {
  const a = findAnim('Glance', 'side') ?? findAnim('Glance', 'face');
  if (!a) return null;
  const i = findFrame(a, 'G4', 'G1');
  return i >= 0 ? { a, i } : null;
}

/**
 * A dew bead sunk into the top of the trembling ball, swelling to 36 px inside its silhouette: bright water (ice to
 * sky blue), and in it, only his eyes and brow band (Glance G4 at ×3, anchored on its eyes) as a dark multiplied
 * reflection, looking down at the ball. A light navy edge falloff, a 2 px ice rim on the lit arc, two speculars, the
 * orb reflected as a cyan dot, and (once it is big enough) the ball's own top panels refracted through its lower
 * third: a bead on the ball, never a head on top of it. Screen space; (x, y) the drop's centre, (bx, by, br) the ball's.
 */
function eyeDrop(env: Env, x: number, y: number, Rm: number, bx: number, by: number, br: number, glint: number) {
  if (Rm < 1) return;
  const ctx = env.ctx;
  env.screen();
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  // A thin contact shadow only: the white ball must stay white all round the bead.
  drawGlow(ctx, glowOf(PAL.navy), x, y, Rm * 1.25, 0.35);
  ctx.beginPath();
  ctx.arc(x, y, Rm, 0, TAU);
  ctx.save();
  ctx.clip();
  const base = ctx.createRadialGradient(x - Rm * 0.2, y - Rm * 0.25, 0, x, y, Rm);
  base.addColorStop(0, 'rgb(226,244,255)');
  base.addColorStop(1, 'rgb(96,150,210)');
  ctx.fillStyle = base;
  ctx.fillRect(x - Rm, y - Rm, Rm * 2, Rm * 2);
  // His eyes, x3 on the eye anchor (only the eye and brow band fit), multiplied into the water as a dark reflection.
  const fx = Math.round(x), fy = Math.round(y - Rm * 0.12);
  const g = glance();
  let eyeL: P2 = [fx - 16, fy];
  if (g) {
    const anc = g.a.frames[g.i].anchors;
    const pv = (anc.eye ?? [g.a.w / 2, g.a.h / 2]) as P2;
    const el = (anc.eyeL ?? pv) as P2;
    eyeL = [fx + (el[0] - pv[0]) * 3, fy + (el[1] - pv[1]) * 3];
    // A dark reflection in bright water: the face multiplied into the bead.
    ctx.globalCompositeOperation = 'multiply';
    drawAnim(ctx, g.a, null, g.i, fx, fy, 3, { pivot: pv, alpha: 0.95 });
    ctx.globalCompositeOperation = 'source-over';
  } else {
    ctx.globalCompositeOperation = 'multiply';
    drawNo10(env, 'G4', fx, fy, 3, { anchor: 'eye', alpha: 0.95 });
    ctx.globalCompositeOperation = 'source-over';
  }
  // The ball's top panels refracted through the drop's lower third (magnified a touch, half seen).
  if (Rm > 10) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x - Rm, y + Rm / 3, Rm * 2, Rm);
    ctx.clip();
    ctx.globalAlpha = 0.5;
    drawBall(env, spin, x + (bx - x) * 1.15, y + (by - y) * 1.15, 6, (br / 6) * 1.15);
    ctx.restore();
  }
  // Convex falloff to a navy edge.
  const edge = ctx.createRadialGradient(x, y, Rm * 0.35, x, y, Rm);
  edge.addColorStop(0, 'rgba(10,18,56,0)');
  edge.addColorStop(0.75, 'rgba(10,18,56,0.12)');
  edge.addColorStop(1, 'rgba(10,18,56,0.55)');
  ctx.globalAlpha = 1;
  ctx.fillStyle = edge;
  ctx.fillRect(x - Rm, y - Rm, Rm * 2, Rm * 2);
  ctx.restore();
  // The lit arc (toward the orb, up-left), two speculars and the orb's reflection.
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = ICE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, Rm - 1, Math.PI * 1.02, Math.PI * 1.62);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = HEX.ice;
  ctx.beginPath();
  ctx.ellipse(x - Rm * 0.42, y - Rm * 0.48, Math.max(1, Rm * 0.16), Math.max(0.8, Rm * 0.09), -0.65, 0, TAU);
  ctx.fill();
  ctx.fillRect(Math.round(x + Rm * 0.45), Math.round(y + Rm * 0.42), 2, 2);
  ctx.fillStyle = CYAN;
  ctx.fillRect(Math.round(x - Rm * 0.62) - 2, Math.round(y - Rm * 0.1) - 2, 4, 4);
  drawGlow(ctx, glowOf(PAL.cyan), x - Rm * 0.62, y - Rm * 0.1, 7, 0.6);
  ctx.restore();
  if (glint > 0) {
    // At the breath, the near eye glints.
    const [ex, ey] = eyeL;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.cyan), ex, ey, 10, 0.6 * glint);
    ctx.restore();
    sparkleCyan(ctx, ex, ey, 7 * glint, glint);
  }
}

// ---------------------------------------------------------------- insert 4b: the keeper, 30 m away

function drawInsert(env: Env, t: number) {
  const ctx = env.ctx;
  const u = clamp((t - T.in0) / (T.in1 - T.in0));
  env.screen();
  const [ox, oy] = env.cam.screenOffset;
  ctx.fillStyle = HEX.stormNavy;
  ctx.fillRect(0, 0, VW, VH);
  // A navy blur of the goal behind him: the crossbar, the far post, the net, floodlight bokeh.
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf([120, 150, 210]), 330 + ox * 0.3, 26, 36, 0.24, 11, 0.32);
  drawGlow(ctx, glowOf([120, 150, 210]), 96 + ox * 0.3, 190, 36, 0.2, 0.32, 7);
  for (let gx = 0; gx < 12; gx++)
    for (let gy = 0; gy < 6; gy++) {
      const x = 110 + gx * 46 + (gy % 2) * 23 - u * 6, y = 50 + gy * 44;
      drawGlow(ctx, glowOf([90, 120, 190]), x, y, 7, 0.08);
    }
  // The net behind him: soft diagonal mesh lines, bellying left with the pull.
  ctx.save();
  ctx.globalAlpha = 0.09;
  ctx.strokeStyle = 'rgb(150,180,230)';
  ctx.lineWidth = 2;
  for (let i = -6; i < 16; i++) {
    ctx.beginPath();
    ctx.moveTo(110 + i * 40, 40);
    ctx.quadraticCurveTo(110 + i * 40 + 70 - 30 * u, 200, 110 + i * 40 + 160, 360);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(110 + i * 40 + 160, 40);
    ctx.quadraticCurveTo(110 + i * 40 + 70 - 30 * u, 200, 110 + i * 40, 360);
    ctx.stroke();
  }
  ctx.restore();
  ctx.globalCompositeOperation = 'lighter';
  const bok: [number, number, number][] = [[60, 60, 34], [220, 40, 22], [600, 70, 40], [540, 20, 18], [30, 250, 26], [400, 30, 16]];
  for (const [x, y, r] of bok) drawGlow(ctx, glowOf([70, 120, 220]), x - u * 10, y, r, 0.22);
  ctx.globalCompositeOperation = 'source-over';
  // The pull: wind streaks racing LEFT across the frame toward No.10 (with navy halos).
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < 44; i++) {
    const y = 12 + hash(i * 2.7) * 336;
    const sp = 1300 + 900 * hash(i * 1.9);
    const len = 50 + 140 * hash(i * 4.1);
    const x = VW + 160 - ((t * sp + hash(i * 8.3) * 900) % (VW + 320));
    const bend = 10 * Math.sin(y * 0.02 + i);
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = NAVY;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + len / 2, y + bend, x + len, y);
    ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.5 + 0.4 * hash(i * 5.5);
    ctx.strokeStyle = i % 4 ? ICE : CYAN;
    ctx.lineWidth = 1 + (i % 3 === 0 ? 1 : 0);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + len / 2, y + bend, x + len, y);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
  // The bust: KF2 at ×2 under a slow push, trembling; the gulp at 1.00 drops him 3 px for two frames.
  const Z = lerp(1.3, 1.38, ease.outQuad(u));
  const gulp = t >= 1.0 && t < 1.07 ? (t < 1.035 ? 4 : 2) : 0;
  const tr = Math.sin(t * TAU * 23) > 0 ? 1 : 0;
  const cxs = 446 + ox - 10 * u + tr, cys = 262 + oy + gulp;
  const f = keeperFront('KF2');
  // Three isobar arcs round his head, dragged left (bulging toward No.10).
  const headY = cys - 55 * D * Z;
  ctx.save();
  for (let i = 0; i < 3; i++) {
    const r = 120 + i * 46 + 6 * Math.sin(t * 7 + i);
    const cx = cxs + 40 + i * 6, cy = headY + 6;
    const path = () => {
      ctx.beginPath();
      for (let j = 0; j <= 40; j++) {
        const th = Math.PI * 0.55 + (j / 40) * Math.PI * 0.9;
        const pullL = 1 + 0.22 * Math.pow(Math.max(0, -Math.cos(th)), 2) * (1 + 0.5 * u);
        const x = cx + Math.cos(th) * r * pullL, y = cy + Math.sin(th) * r * 0.9;
        j ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
    };
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = NAVY;
    ctx.lineWidth = 3;
    path();
    ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.55 - i * 0.1;
    ctx.strokeStyle = CYAN;
    ctx.lineWidth = 1;
    path();
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
  if (f) {
    const fr = f.a.frames[f.i];
    const pv = fr.anchors.chest ?? [f.a.w / 2, f.a.h / 2];
    // A cold rim on the side facing the pull (screen-left).
    ctx.globalCompositeOperation = 'lighter';
    drawAnim(ctx, f.a, f.a.tinted(f.i, [70, 216, 255]), f.i, cxs - 2 * Z, cys, D * Z, { pivot: pv, alpha: 0.6 });
    ctx.globalCompositeOperation = 'source-over';
    drawAnim(ctx, f.a, null, f.i, cxs, cys, D * Z, { pivot: pv });
    const at = (n: string): P2 => {
      const q = fr.anchors[n] ?? pv;
      return [cxs + (q[0] + 0.5 - pv[0]) * D * Z, cys + (q[1] + 0.5 - pv[1]) * D * Z];
    };
    // Dew streaming off his glove toward No.10, and a sweat drop torn off his temple.
    const [gx, gy] = at('glove');
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 16; i++) {
      const ff = (t * (2.2 + hash(i) * 1.5) + hash(i * 3.3)) % 1;
      const x = gx - 8 - ff * (120 + 90 * hash(i * 1.1)), y = gy - 10 + (hash(i * 2.2) - 0.5) * 30 - ff * 10;
      ctx.globalAlpha = 0.9 * (1 - ff);
      ctx.fillStyle = i % 3 ? ICE : CYAN;
      ctx.fillRect(Math.round(x), Math.round(y), 3, 2);
      ctx.fillRect(Math.round(x) + 3, Math.round(y), 4, 1);
    }
    ctx.globalCompositeOperation = 'source-over';
    const [hx, hy] = at('head');
    // The hair pulled left: ice streaks peeling off the left of his mop toward No.10.
    // Each strand over a navy 4 px halo (all halos first, so no halo dims a strand), then the ice strands added on top.
    const hair: [number, number, number, number, number][] = [];
    for (let i = 0; i < 34; i++) {
      const ff = (t * (4 + 2 * hash(i * 1.3)) + hash(i * 7.7)) % 1;
      const y = Math.round(hy - 34 * Z + hash(i * 3.9) * 40 * Z);
      const x = Math.round(hx - 18 * Z - ff * 120);
      hair.push([x, y, Math.round(14 + 40 * ff), 2 + (i % 3 === 0 ? 1 : 0), ff]);
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = NAVY;
    for (const [x, y, w, h, ff] of hair) {
      ctx.globalAlpha = 0.6 * (1 - ff);
      ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
    }
    ctx.globalCompositeOperation = 'lighter';
    hair.forEach(([x, y, w, h, ff], i) => {
      ctx.globalAlpha = 0.9 * (1 - ff);
      ctx.fillStyle = i % 3 ? ICE : CYAN;
      ctx.fillRect(x, y, w, h);
    });
    ctx.globalCompositeOperation = 'source-over';
    // A sweat drop torn off his temple: a teardrop whose tail streams back toward him (it flies left, to No.10).
    const su = clamp((t - 0.97) / 0.15);
    const dxs = hx - 48 * Z - su * 70, dys = hy + 6 + su * 8;
    const dr = 3 + su * 1.5;
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(dxs, dys, dr, 0.9, TAU - 0.9);
    ctx.lineTo(dxs + 9 + su * 8, dys);
    ctx.closePath();
    ctx.fillStyle = '#bfe9ff';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = HEX.navy;
    ctx.stroke();
    ctx.fillStyle = HEX.ice;
    ctx.fillRect(Math.round(dxs - dr * 0.5), Math.round(dys - dr * 0.5), 1, 1);
  } else drawKeeperFront(env, 'KF2', cxs, cys, 2);
  // Edge darkening on the right: he is alone at the far end of the pitch.
  const vg = ctx.createLinearGradient(VW - 120, 0, VW, 0);
  vg.addColorStop(0, 'rgba(6,11,36,0)');
  vg.addColorStop(1, 'rgba(6,11,36,0.55)');
  ctx.fillStyle = vg;
  ctx.fillRect(VW - 120, 0, 120, VH);
}

// ---------------------------------------------------------------- transitions

/** The tail of shot 3's wind wipe (its streaks, same hashes as windWipe at p = 1) leaving the frame right. */
function drawWipeTail(env: Env, t: number) {
  if (t >= 0.1) return;
  const ctx = env.ctx;
  env.screen();
  const u = t / 0.1;
  const lead = VW + 260 + 1500 * u * u;
  for (let i = 0; i < 60; i++) {
    const y = Math.round(hash(i * 3.7) * VH);
    const hgt = 2 + Math.floor(hash(i * 5.9) * 5);
    const len = 80 + hash(i * 1.3) * 220;
    const lag = hash(i * 8.1) * 160;
    const x0 = lead - lag - len;
    if (x0 > VW) continue;
    ctx.globalAlpha = 0.5 * (1 - u);
    ctx.fillStyle = NAVY;
    ctx.fillRect(Math.round(x0) - 2, y - 1, Math.round(len) + 4, hgt + 2);
    ctx.globalAlpha = 0.9 * (1 - u * 0.5);
    ctx.fillStyle = i % 4 ? ICE : '#ffffff';
    ctx.fillRect(Math.round(x0), y, Math.round(len), hgt);
  }
  ctx.globalAlpha = 1;
}

/**
 * Shot 4's first frame, for shot 3's wind-wipe reveal (call it inside drawReveal's clip, in place of the stand-in
 * plate): the stadium, turf and craters under the storm darken, the lamps, the trailing funnel and No.10 on R1, framed
 * exactly as shot 4's t = 0 (horizon at screen y ~210, the camera's run-up framing). `t` (<= 0, e.g. shot 3's t - 2.0)
 * only turns the funnel and the flags. Pure: no particles, no sound, and the camera is restored afterwards.
 */
export function drawInhaleOpening(env: Env, t: number) {
  const cam = env.cam;
  const keep = { x: cam.x, y: cam.y, zoom: cam.zoom, rot: cam.rot };
  const tt = Math.min(0, t);
  placeCam(env, 0);
  drawStadium(env, tt);
  drawTurf(env, tt);
  drawCraters(env, tt);
  stormDarken(env.ctx, 0.45);
  drawLamps(env, tt);
  drawFunnel(env, tt, 'back');
  drawTheBall(env, 0);
  drawHero(env, 0);
  drawFunnel(env, tt, 'front');
  cam.x = keep.x;
  cam.y = keep.y;
  cam.zoom = keep.zoom;
  cam.rot = keep.rot;
  env.screen();
}

// ---------------------------------------------------------------- particles (update only)

function spawnFootfall(env: Env, x: number, n: number) {
  const rng = env.rng;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + rng.range(-1.2, 0.5);
    const sp = rng.range(90, 260);
    env.parts.spawn({ kind: PK.Pixel, x: x + rng.range(-10, 10), y: GY - 2, vx: Math.cos(a) * sp - 60, vy: Math.sin(a) * sp, ay: 600, drag: 1.4, max: rng.range(0.4, 0.8), s0: rng.range(1.5, 2.5), s1: 1, ramp: 'dew', r0: 0, r1: 0.7, a0: 1, a1: 0.3, layer: 0 });
  }
  env.parts.spawn({ kind: PK.Mist, x: x - 10, y: GY - 6, vx: -90, vy: -20, drag: 2.5, max: 0.6, s0: 8, s1: 20, k: 0.4, ramp: 'vapor', r0: 0, r1: 1, a0: 0.4, a1: 0, layer: 0 });
}

/** The plant: a dew crown of 16 and 10 dust puffs that are left hanging when the vacuum stops time. */
function spawnPlant(env: Env) {
  const rng = env.rng;
  for (let i = 0; i < 16; i++) {
    const a = -Math.PI / 2 + ((i / 15) - 0.5) * 2.3 + rng.range(-0.08, 0.08);
    const sp = rng.range(260, 420);
    env.parts.spawn({ kind: PK.Glow, x: 4 + rng.range(-6, 6), y: GY - 3, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, ay: 500, drag: 1.2, max: rng.range(0.9, 1.4), s0: rng.range(3.5, 5), s1: 1.6, ramp: 'dew', r0: 0, r1: 0.3, a0: 1, a1: 0.95, layer: 1 });
  }
  for (let i = 0; i < 10; i++) {
    // Puffed west off the heel, behind the cast (layer 0), so the plant boot and the ball stay clear.
    const a = rng.range(Math.PI * 1.02, Math.PI * 1.4);
    const s = rng.range(60, 200);
    plantDust.push(env.parts.spawn({ kind: PK.Smoke, x: rng.range(-40, -10), y: GY - 2, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.35, drag: 3, max: rng.range(0.7, 1.2), s0: rng.range(5, 8), s1: rng.range(9, 13), ramp: 'storm', r0: 0.3, r1: 1, a0: 0.45, a1: 0, add: false, layer: 0 }));
  }
}

/**
 * The inhale field (300 in all, spawned 0.44-0.64): plucked blades, dew beads, dust and vapour wisps on a wide ring
 * round the orb, accelerating toward it from rest. Their life is long in SIM seconds, so in the vacuum they hang
 * a few percent of the way in; the snap re-aims them all outward (see blastOut).
 */
function spawnInhale(env: Env, n: number) {
  const rng = env.rng;
  const [tx, ty] = A.boot;
  for (let i = 0; i < n; i++) {
    const th = rng.range(0, TAU);
    const r = rng.range(40, 330);
    const x = tx + Math.cos(th) * r;
    let y = ty + Math.sin(th) * r * 0.7;
    if (y > GY - 6) y = ty - (y - ty) * 0.8;
    const T0 = rng.range(0.17, 0.32);
    const ax = (2 * (tx - x)) / (T0 * T0), ay = (2 * (ty - y)) / (T0 * T0);
    const pick = rng.next();
    let p: Particle;
    if (pick < 0.15)
      p = env.parts.spawn({ kind: PK.Blade, x, y, ax, ay, max: T0, s0: rng.range(3, 6), s1: 4, ramp: 'grass', r0: rng.next(), r1: rng.next(), a0: 1, a1: 1, add: false, rot: rng.range(0, TAU), vrot: rng.range(-30, 30), layer: 1 });
    else if (pick < 0.7)
      p = env.parts.spawn({ kind: PK.Glow, x, y, ax, ay, max: T0, s0: rng.range(1.4, 2.6), s1: 1.2, ramp: 'dew', r0: 0.05, r1: 0.4, a0: 0.95, a1: 0.8, layer: 1 });
    else if (pick < 0.95)
      p = env.parts.spawn({ kind: PK.Pixel, x, y, ax, ay, max: T0, s0: 1, s1: 1, ramp: 'dust', r0: 0, r1: 0.4, a0: 0.8, a1: 0.6, add: false, layer: 1 });
    else
      p = env.parts.spawn({ kind: PK.Mist, x, y, ax, ay, max: T0, s0: rng.range(5, 9), s1: 4, k: 0.25, ramp: 'vapor', r0: 0.1, r1: 0.6, a0: 0.22, a1: 0.12, layer: 1 });
    inhaled.push(p);
  }
}

/** The snap: every hanging blade, bead and wisp of the inhale is blasted back outward from the orb. */
function blastOut(env: Env) {
  const rng = env.rng;
  const [tx, ty] = A.boot;
  for (const p of inhaled) {
    if (p.life >= p.max) continue;
    const dx = p.x - tx, dy = p.y - ty;
    const d = Math.max(8, Math.hypot(dx, dy));
    const sp = rng.range(500, 1100) * (0.6 + 120 / d);
    p.ax = 0;
    p.ay = p.kind === PK.Glow || p.kind === PK.Blade ? 260 : 0;
    p.vx = (dx / d) * sp;
    p.vy = (dy / d) * sp;
    p.drag = 2.4;
    p.life = 0;
    p.max = rng.range(0.35, 0.6);
    p.a1 = 0;
  }
  inhaled = [];
}

/** Two frames after the snap: a ring of ice sparks and dew bursts off the crushed orb. */
function sparkRing(env: Env) {
  const rng = env.rng;
  const [tx, ty] = A.boot;
  for (let i = 0; i < 46; i++) {
    const a = rng.range(0, TAU);
    const sp = rng.range(300, 900);
    env.parts.spawn({ kind: PK.Streak, x: tx, y: ty, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.8, drag: 4, max: rng.range(0.2, 0.45), s0: rng.range(1, 2), s1: 0.5, ramp: i % 3 ? 'dew' : 'cobalt', r0: 0, r1: 0.8, k: 1.3, layer: 1 });
  }
}

/** Ice sparks and dew flung off the boot's arc as the leg whips down. */
function spawnWhip(env: Env, x: number, y: number, n: number) {
  const rng = env.rng;
  for (let i = 0; i < n; i++) {
    const a = rng.range(-0.3, 1.4);
    const sp = rng.range(250, 700);
    env.parts.spawn({ kind: PK.Streak, x: x + rng.range(-6, 6), y: y + rng.range(-6, 6), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 3, ay: 300, max: rng.range(0.15, 0.35), s0: rng.range(1, 2.2), s1: 0.5, ramp: 'dew', r0: 0, r1: 0.9, k: 1.4, layer: 1 });
  }
}

// ---------------------------------------------------------------- the shot

export const shotInhale: Shot = {
  name: META.name,
  dur: DUR,
  seed: META.seed,
  rate: RATE[4],
  muffle: MUFFLE[4],
  cues: [
    { at: 0, fn: (e) => { e.sfx.howl(0.5, 0.4); e.sfx.scuff(0.2, -0.2); } },
    ...[0.06, 0.12, 0.18].map((at) => ({ at, fn: (e: Env) => e.sfx.scuff(0.16) })),
    { at: 0.24, fn: (e) => e.sfx.whoosh(0.22, 500, 1700, 0.22) },
    { at: T.plant, fn: (e) => { e.sfx.kick(0.5); e.sfx.scuff(0.3); e.cam.hit(0.35); } },
    { at: T.cock, fn: (e) => e.sfx.inhale(0.5) },
    { at: T.vac, fn: (e) => e.sfx.vacuum(0.85) },
    { at: LURCH[0], fn: (e) => { e.sfx.earPop(0.7); e.cam.hit(0.14); } },
    { at: LURCH[1], fn: (e) => { e.sfx.earPop(0.85); e.cam.hit(0.16); } },
    { at: T.in0, fn: (e) => e.sfx.blip(520, 0.3) },
    { at: 1.0, fn: (e) => e.sfx.blip(360, 0.32) },
    { at: LURCH[2], fn: (e) => { e.sfx.earPop(1.0); e.cam.hit(0.2); } },
    { at: 1.3, fn: (e) => e.sfx.breath(0.3) },
    {
      // The vacuum blows open: a real blast (still well under shot 5's hammer, boom 1.3).
      at: T.snap,
      fn: (e) => {
        e.sfx.whoosh(0.35, 200, 4000, 0.6);
        e.sfx.crack(0.7);
        e.sfx.boom(0.55);
        e.sfx.kick(0.4);
        e.cam.hit(0.5);
        e.cam.shove(9, 5);
      },
    },
    { at: T.whip, fn: (e) => e.sfx.whoosh(0.3, 300, 2600, 0.7) },
    // On the visible whip (the brief's 1.74: the inCubic crash is still slow for its first frame).
    { at: 1.74, fn: (e) => e.sfx.whoosh(0.1, 1000, 6000, 0.5) },
  ],
  prepare(env) {
    warmGale();
    // Warm the rim and veil tints of every frame the shot shows, and the keeper's rim.
    for (const k of ['R1', 'R2', 'R3', 'R4', 'AP2', 'F5a', 'HC1', 'HC2', 'HCs', 'F6'] as No10Key[]) {
      const f = no10(k);
      if (f) {
        f.a.tinted(f.i, [70, 216, 255]);
        f.a.tinted(f.i, PAL.navy);
      }
    }
    const kf = keeperFront('KF2');
    if (kf) kf.a.tinted(kf.i, [70, 216, 255]);
    measure(env);
  },
  init(env) {
    env.sfx.clearBus();
    env.cam.set(VW / 2, VH / 2, 1, 0);
    env.cam.shakeRoll = 0.012;
    env.cam.shakeAmp = 8;
    spin.m = new Float64Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    spin.rotate(0, 0, 1, 0.6);
    measure(env);
    const deco = new Rng(3141);
    blades = makeBlades(deco, -260, 120, GY, 150, 4, 10);
    fgBlades = makeBlades(deco, -900, 700, 0, 380, 14, 34).map((b) => ({ ...b, y: deco.range(0, 18) }));
    fired = { r1: false, plant: false, dust: false, snap: false, ring: false, whip: false, f6: false };
    inhaled = [];
    plantDust = [];
    spawnAcc = 0;
    placeCam(env, 0);
  },
  update(env, t, dt) {
    placeCam(env, t);
    const cam = env.cam;
    if (!fired.r1) {
      fired.r1 = true;
      spawnFootfall(env, XR, 8);
    }
    if (!fired.plant && t >= T.plant) {
      fired.plant = true;
      spawnPlant(env);
      spawnFootfall(env, 0, 6);
    }
    // The vacuum takes the plant's dust too: it hangs on its way into the orb and is blasted out at the snap.
    if (!fired.dust && t >= T.cock) {
      fired.dust = true;
      const [tx, ty] = A.boot;
      const T0 = 0.22;
      for (const p of plantDust) {
        p.vx = 0;
        p.vy = 0;
        p.drag = 0;
        p.ax = (2 * (tx - p.x)) / (T0 * T0);
        p.ay = (2 * (ty - p.y)) / (T0 * T0);
        p.life = 0;
        p.max = T0;
        inhaled.push(p);
      }
      plantDust = [];
    }
    // The inhale field: 300 motes over 0.44-0.64 (paced on the unwarped clock, so the count never depends on the rate).
    if (t >= 0.44 && t < 0.64) {
      spawnAcc += (300 / 0.2) * STEP;
      const n = Math.floor(spawnAcc);
      spawnAcc -= n;
      if (n > 0) spawnInhale(env, n);
    }
    if (!fired.snap && t >= T.snap) {
      fired.snap = true;
      blastOut(env);
    }
    if (!fired.ring && t >= T.snap + 0.03) {
      fired.ring = true;
      sparkRing(env);
    }
    if (!fired.whip && t >= T.whip) {
      fired.whip = true;
      spawnWhip(env, A.hcsBoot[0], A.hcsBoot[1], 18);
    }
    if (!fired.f6 && t >= T.f6) {
      fired.f6 = true;
      spawnWhip(env, A.f6Boot[0], A.f6Boot[1], 24);
    }
    // The tremor: it builds with every lurch (the pressure), then the smash shakes hard.
    if (t >= T.vac && t < T.snap) {
      const lv = LURCH.filter((l) => t >= l).length;
      holdTrauma(cam, 0.1 + 0.06 * lv);
      cam.shakeAmp = 6;
    }
    if (t >= T.snap) {
      cam.shakeAmp = 12;
      if (t >= 1.48) holdTrauma(cam, 0.5);
    }
    void dt;
  },
  render(env, t) {
    const { ctx, fx } = env;
    placeCam(env, t);
    if (t >= T.in0 && t < T.in1) {
      drawInsert(env, t);
      vacuumGrade(fx, 1);
      fx.ca = 0.004;
      fx.vignette = 0.78;
      fx.bloomThresh = 0.8;
      fx.bloom = 0.8;
      return;
    }
    const cam = env.cam;
    env.screen();
    ctx.fillStyle = HEX.stormNavy;
    ctx.fillRect(0, 0, VW, VH);

    // 1. The world, darkened under the storm (lifted a notch once the orb lights it).
    drawStadium(env, t);
    drawTurf(env, t);
    drawCraters(env, t);
    stormDarken(ctx, t < T.cock ? 0.45 : 0.32);
    drawLamps(env, t);
    drawGroundBlades(env, t);

    // 2. The vacuum behind him: the vortex arms and the isobars round the orb; at the snap they are BLOWN OUTWARD.
    const k = vacK(t);
    const boot = bootAt(t);
    const [ox, oy] = scr(env, boot[0], boot[1]);
    const R = keys(ORB_R, t) * cam.zoom;
    if (k > 0) {
      // The orb's cold light pooled on the turf under it.
      env.world();
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.cyan), boot[0] + 20, GY - 2, 230, 0.34 * k, 1, 0.16);
      drawGlow(ctx, glowOf(PAL.ice), boot[0] + 20, GY - 2, 60, 0.12 * k, 1, 0.16);
      ctx.globalCompositeOperation = 'source-over';
    }
    drawArms(env, t, ox, oy, k, R);
    drawIsobars(env, t, ox, oy, k);
    const blow = t >= T.snap && t < T.snap + BLOW ? ease.outCubic((t - T.snap) / BLOW) : -1;
    const [sx0, sy0] = scr(env, A.boot[0], A.boot[1]);
    if (blow >= 0) {
      const grow = 1 + 2.4 * blow;
      drawArms(env, t, sx0, sy0, 1 - blow, R, grow);
      drawIsobars(env, t, sx0, sy0, 1 - blow, grow);
    }
    drawFunnel(env, t, 'back');
    env.world();
    env.parts.draw(ctx, 0);

    // 2b. The ice smash behind him: navy and cyan focus lines converging on the boot, speed streaks along the swing.
    if (t >= T.whip) {
      const u = clamp((t - T.whip) / 0.36);
      const [fx6, fy6] = scr(env, A.f6Boot[0], A.f6Boot[1]);
      env.screen();
      ctx.globalCompositeOperation = 'source-over';
      focusLines(ctx, env.frng(41), fx6, fy6, 70, 800, 60, HEX.navy, 0.45, 8);
      ctx.globalCompositeOperation = 'lighter';
      focusLines(ctx, env.frng(42), fx6, fy6, 80, 800, 60, HEX.cyan, 0.42 * (1 - 0.3 * u), 5);
      const da = Math.atan2(A.f6Boot[1] - A.hcsBoot[1], A.f6Boot[0] - A.hcsBoot[0]);
      const cx = Math.cos(da), cy = Math.sin(da);
      for (let i = 0; i < 26; i++) {
        const off = (hash(i * 3.9) - 0.5) * 760;
        const f = (t * 3.2 + hash(i * 7.1)) % 1;
        const along = -500 + f * 1000;
        const x = VW / 2 + cx * along - cy * off, y = VH / 2 + cy * along + cx * off;
        const len = 60 + 120 * hash(i);
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = i % 3 ? ICE : CYAN;
        ctx.lineWidth = 1 + (i % 2);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - cx * len, y - cy * len);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    // 3. The cast: the ball, No.10, the orb on his boot, the funnel's near half.
    drawTheBall(env, t);
    drawHero(env, t);
    if (k > 0) {
      // Light spill from the orb over his leg and back.
      env.screen();
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.cyan), ox, oy, R * 5, 0.2 * k);
      ctx.globalCompositeOperation = 'source-over';
    }
    drawSmear(env, t);
    if (t >= T.snap && t < T.snap + STEP) {
      // The burst itself, local to the orb on the first release frame (not a full-frame flash); drawn under the orb
      // so the crushed ice bar on its navy line already reads on top of it.
      env.screen();
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.ice), sx0, sy0, R * 6, 0.8);
      drawGlow(ctx, glowOf(PAL.cyan), sx0, sy0, R * 10, 0.35);
      ctx.globalCompositeOperation = 'source-over';
    }
    if (t >= T.cock) {
      const crush = crushAt(t);
      const ang = t >= T.whip ? Math.atan2(A.f6Boot[1] - A.boot[1], A.f6Boot[0] - A.boot[0]) + Math.PI / 2 : 0.6;
      const fadeOut = t < T.whip ? 1 : 1 - 0.55 * clamp((t - T.whip) / 0.3);
      const bar = t >= T.snap && t < T.snap + 0.06 ? 1 : 0;
      drawOrb(env, t, ox, oy, R * fadeOut, crush, ang, bar);
    }
    // The pressure ring: the vacuum bursting off the crushed orb (0.18 s).
    if (t >= T.snap && t < T.snap + 0.18) {
      // Already bursting outward on the first release frame (never a ring sitting on the orb's outline).
      const p = (t - T.snap + STEP) / (0.18 + STEP);
      const rr = lerp(R, 460, ease.outCubic(p));
      env.screen();
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1 - p;
      ctx.strokeStyle = NAVY;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.ellipse(sx0, sy0, rr, rr * 0.86, 0, 0, TAU);
      ctx.stroke();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = ICE;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }
    drawFunnel(env, t, 'front');
    env.world();
    env.parts.draw(ctx, 1);
    drawCups(env, t);

    // 4. The air in front: the wind lines rushing in (blasting out after the snap).
    drawWindLines(env, t, ox, oy, k, 0, R);
    if (t >= T.snap && t < T.snap + 0.24) drawWindLines(env, t - T.snap, sx0, sy0, 1 - (t - T.snap) / 0.24, 1, R);

    // 5. The dew mirror: a bead on the trembling ball, swelling into a drop with his eyes in it.
    const ballR = 6 * D * cam.zoom;
    if (t >= T.mir0 - 0.02 && t < T.mir1 + 0.02) {
      const sw = ease.outBack(clamp((t - T.mir0) / 0.06));
      const shrink = 1 - ease.inQuad(clamp((t - (T.mir1 - 0.04)) / 0.06));
      const Rm = Math.max(0, lerp(3, 18, sw) * shrink);
      const [dx] = ballOffset(t);
      const [bx, by] = scr(env, A.ball[0] + dx, A.ball[1]);
      // The bead swells down from the crown: its top stays on the ball's crown, white ball all round it.
      eyeDrop(env, Math.round(bx - 3), Math.round(by - ballR * lerp(0.7, 0.36, clamp(sw))), Rm, bx, by, ballR, t >= 1.3 ? 1 - clamp((t - 1.3) / 0.08) : 0);
    } else if (t >= T.vac && t < T.mir0) {
      // The bead before it swells, sitting on the ball's upper face.
      const [dx] = ballOffset(t);
      const [bx, by] = scr(env, A.ball[0] + dx, A.ball[1]);
      env.screen();
      const r = 1.6 * cam.zoom;
      const ex = bx - 2, ey = by - ballR * 0.7;
      ctx.fillStyle = 'rgba(10,18,56,0.8)';
      ctx.beginPath();
      ctx.arc(ex, ey, r + 1, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#bfe9ff';
      ctx.beginPath();
      ctx.arc(ex, ey, r, 0, TAU);
      ctx.fill();
      sparkleCyan(ctx, ex - r * 0.3, ey - r * 0.4, 3 + r, 0.7);
    }

    // 6. The ice smash on top: only the ice focus lines, kept off his body (even-odd clip round him).
    if (t >= T.whip) {
      const u = clamp((t - T.whip) / 0.36);
      const [fx6, fy6] = scr(env, A.f6Boot[0], A.f6Boot[1]);
      const [hx, hy] = scr(env, A.f5Pel[0], A.f5Pel[1] - 30);
      env.screen();
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, VW, VH);
      ctx.ellipse(hx, hy, 70 * cam.zoom, 120 * cam.zoom, 0, 0, TAU);
      ctx.clip('evenodd');
      ctx.globalCompositeOperation = 'lighter';
      focusLines(ctx, env.frng(43), fx6, fy6, 45, 800, 40, HEX.ice, 0.5 * (1 - 0.3 * u), 3);
      ctx.restore();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    // The whip out: long horizontal ice streaks tearing right as the camera whips west.
    if (t >= T.exit) {
      const p = clamp((t - T.exit) / (DUR - T.exit));
      env.screen();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 34; i++) {
        const y = 8 + hash(i * 4.3) * 344;
        const len = (120 + 260 * hash(i * 2.2)) * (0.4 + p);
        const x = -300 + ((t - T.exit) * (5200 + 2600 * hash(i * 1.6)) + hash(i * 9.4) * 700);
        ctx.globalAlpha = (0.25 + 0.35 * hash(i * 5.2)) * (0.3 + 0.7 * p);
        ctx.fillStyle = i % 3 ? ICE : CYAN;
        ctx.fillRect(Math.round(x), Math.round(y), Math.round(len), 1 + (i % 4 === 0 ? 1 : 0));
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    // 7. The foreground fringe, ground fog, the incoming wipe's tail.
    drawForeground(env, t);
    env.screen();
    const fog = ctx.createLinearGradient(0, 280, 0, VH);
    fog.addColorStop(0, 'rgba(6,11,36,0)');
    fog.addColorStop(1, 'rgba(6,11,36,0.35)');
    ctx.fillStyle = fog;
    ctx.fillRect(0, 280, VW, VH - 280);
    drawWipeTail(env, t);

    // The truck: horizontal speed lines racing left behind him, and a light motion smear (he stays sharp).
    if (t < T.plant) {
      env.screen();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 26; i++) {
        const y = 20 + hash(i * 2.9) * 320;
        const len = 40 + 110 * hash(i * 1.7);
        const x = VW + 100 - ((t * (900 + 700 * hash(i * 3.1)) + hash(i * 6.6) * 900) % (VW + 300));
        ctx.globalAlpha = 0.14 + 0.12 * hash(i * 9.1);
        ctx.fillStyle = i % 4 ? ICE : CYAN;
        ctx.fillRect(Math.round(x), Math.round(y), Math.round(len), 1);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    // 8. Post: the storm grade (vacuum grade in the freeze), the lens at the orb, implosion rings, the snap and smash.
    galeStorm(fx);
    if (t >= T.vac && t < T.snap + 0.1) vacuumGrade(fx, clamp((t - T.vac) / 0.1) * (t < T.snap ? 1 : 1 - (t - T.snap) / 0.1));
    // Never let the frame edge crush his body into the dark (the ear-pops add their beat on top).
    fx.vignette = Math.min(fx.vignette, 0.6);
    // The orb is the frame's power source: it blooms hard through the vacuum.
    const vb = vacK(t);
    if (vb > 0) fx.bloom = Math.max(fx.bloom, lerp(fx.bloom, 1.15, vb));
    const [u, v] = cam.toUV(boot[0], boot[1]);
    const lens = keys(LENS, t);
    if (t >= T.cock && lens !== 0) {
      fx.lens = lens;
      fx.lensX = u;
      fx.lensY = v;
      fx.lensR = 0.35;
    }
    // Each lurch fires an imploding refraction ring onto the orb (the air sucked in a notch).
    const since = sinceLurch(t);
    if (since >= 0 && since < 0.16) {
      const p = since / 0.16;
      // The ear-pop darkens the frame's edges for a beat and splits the colour a hair.
      fx.vignette += 0.1 * (1 - p);
      fx.ca = Math.max(fx.ca, 0.006 * (1 - p));
      pushShock(fx, { x: u, y: v, r: lerp(0.62, 0.03, ease.outQuad(p)), s: -0.035 * (1 - p) });
    }
    if (t >= T.cock && t < T.cock + 0.14) {
      const p = (t - T.cock) / 0.14;
      pushShock(fx, { x: u, y: v, r: lerp(0.4, 0.02, ease.outQuad(p)), s: -0.025 * (1 - p) });
    }
    // The plant's turf shock (unwarped: it rolls out before the freeze).
    if (t >= T.plant && t < T.plant + 0.3) {
      const [pu, pv] = cam.toUV(0, GY);
      const p = (t - T.plant) / 0.3;
      pushShock(fx, { x: pu, y: pv, r: 0.04 + 0.4 * ease.outQuad(p), s: 0.02 * (1 - p) });
    }
    if (t >= T.snap) {
      // The blast off the orb (centred where the orb was crushed); a 2-frame zoom punch, then the frame stays crisp.
      const [su, sv] = cam.toUV(A.boot[0], A.boot[1]);
      const p = clamp((t - T.snap) / 0.35);
      if (p < 1) pushShock(fx, { x: su, y: sv, r: 0.9 * ease.outQuad(p), s: 0.08 * (1 - p) });
      fx.radialX = su;
      fx.radialY = sv;
      // One frame of a light zoom kick only: the hit is carried by the local burst at the orb, not by blur.
      fx.radial = t < T.snap + STEP ? 0.015 : 0;
      if (t < T.snap + 0.05) {
        fx.flash = 0.18 * (1 - (t - T.snap) / 0.05);
        fx.flashColor = [200, 240, 255];
      }
    }
    if (t >= T.whip) {
      fx.ca = 0.012;
      fx.bloom = 1.15;
    }
    if (t < T.plant) {
      const [hu, hv] = cam.toUV(pelvisX(t), GY - 80);
      fx.streak = 0.022;
      fx.streakDX = 1;
      fx.streakDY = 0;
      fx.streakHoleX = hu;
      fx.streakHoleY = hv;
      fx.streakHoleR = 0.36;
    }
    if (t >= T.exit) {
      // The crash out: everything streaks and zooms, except the boot, which stays the sharpest thing as it whips out
      // right (the radial is centred on it and the streak has a hole round it).
      const p = clamp((t - T.exit) / (DUR - T.exit));
      const [bu, bv] = cam.toUV(A.f6Boot[0], A.f6Boot[1]);
      fx.radialX = bu;
      fx.radialY = bv;
      fx.radial = 0.025 * p;
      fx.streak = 0.1 * p * p;
      fx.streakDX = 1;
      fx.streakDY = 0.12;
      fx.streakHoleX = bu;
      fx.streakHoleY = bv;
      fx.streakHoleR = 0.16;
    }
  },
};
