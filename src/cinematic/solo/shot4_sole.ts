// SHOT 4 — SOLE LIFT (2.0 s = beats 7-11, global 4.2-6.2; bar 3's ONE is 0.40). SPEC.md §4: defender B, the ball's
// scene. Side view at shin height: No.10 (SoleLift Side, x3, 294 px tall) fills the frame; every pixel of footwork is
// a 3x3 block. Sole on, drag, scoop, flick, hop: B's slide tackle comes out of the dark under his boots while the
// ball's arc freezes into a strobe chain of violet balls. OLÉ! 2.
//
// Choreography (C = SoleLift-canvas px at x1, the art's own world: SoleLift.json "world" / "ballWorld" / originDx;
// world px = 3 C, his sole line is world y 340):
//   Dribble F1 on the cycle origin C -26, F2/F3 at -2; SoleLift F1-F6 on C 0 (left toe-tip C 70, pinned);
//   F7-F9 airborne on the hop path (pelvis = the json world points, joined by the same ballistic arc: x at the ball's
//   83.3 C/s, y under real gravity, peak 15 C = 45 px); F10/F11 at C +50 (left toe C 126); closing Dribble F2-F4 at
//   C +70 (right toe C 143, a 17 px stride ahead of the landing foot). The flick is sim 0 at 0.70: vy 526 px/s,
//   vx 250 px/s, g 1648 px/s^2 (x3), so the time-warp puts the apex on the hold and the catch exactly on 1.80.
//
// Beats (shot-local; touches, keys, lamps and the OLÉ on the 16th grid):
//   0.00  beat 7   Dribble touch (right laces); the pool irises open out of shot 3's black (3 frames).
//   0.20/0.30      SoleLift F1 (right foot rising), F2 (sole over the ball). 0.30: B's slide scrapes in the dark.
//   0.40  beat 8   SOLE ON (the ONE): the ball stops dead under the sole. Rimshot, beat flare, snap to the feet.
//   0.50 / 0.60    DRAG back half a ball / SCOOP onto the laces. Exposure of F5 (0.60).
//   0.70           FLICK: the ball leaves the laces (exposure of F6); its strobe chain starts (every 0.04 s of sim).
//   0.80  beat 9   HOP (exposure of F7): the hurdler's push-off, beat flare, 3-frame beat echo trailing left, snap up.
//                  B bursts out of the dark from the right, studs first along the turf.
//   0.95-1.55      the slow window (rate 0.25); 1.30-1.42 the money frame (rate 0.06): the ball at its apex, No.10 at
//                  the top of his hop, B's studs 9 px under his trailing boot, the strobe chain from laces to apex,
//                  the F5-F7 exposures on the hop path; 2 impact frames at 1.30, then a clean still; dim 0.88.
//   1.20  beat 10  the fermata (low tom).   1.30: SOLE LIFT tag.
//   1.72           LAND (F10).   1.80: CUSHION (F11), the ball glued to the instep again; B sprawls (S3) behind him.
//   1.85-1.95      Dribble F2-F4.   1.90: OLÉ! 2, pad 2.   1.95-2.00: whip pan right into shot 5.
//
// Staging: B's slide line is a stride behind No.10's (depth): he is always drawn behind No.10 and the ball, so the
// long body of a slide that passes under a hop never reads as a landing on him, and he is fast (about 5 m/s) so it
// passes under the whole hop. Exposures never interact with anyone (they only fade on the grid).
//
// Clock: positions are pure functions of t (and of the sim time sigma(t), the analytic integral of RATE[4]); the
// follow-spot lag, ball spin, exposures and particles advance in update() at the fixed step. init resets them.

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { Rng, clamp, ease, lerp, type RGB } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { anim, drawAnim, hasAnim, type StudioAnim } from '../../art/studioAnim';
import {
  Afterimages, DEF_SIL, FollowSpot, HEX, HUM, PAL, RATE, SEQ, TOMS, drawBall, drawSolo, echoAt, fourCount, marqueeTag,
  onFrames, onGrid, padsFor, soloAnchor, soloGrade, soloImpact, soloPic, stage, warmSolo,
  type SoloKey, type StagePool,
} from './common';

const DUR = 2.0;
/** No.10's integer sprite scale (SCALE[4]) and world px per C unit. */
const SC = 3;
/** His sole line (world y) and the vanishing horizon (shin height). */
const GY = 340;
const HZ = 268;
/** Frame-space y of the sole line: the bottom edge of row 102. */
const SOLE = 103;

// ---------------------------------------------------------------- beats (shot-local)

const T_TOUCH = onGrid(0, 'touch');
const T_SOLE = onGrid(0.4, 'SOLE ON');
const T_DRAG = onGrid(0.5, 'DRAG');
const T_SCOOP = onGrid(0.6, 'SCOOP');
const T_FLICK = onGrid(0.7, 'FLICK');
const T_HOP = onGrid(0.8, 'HOP');
const T_FERMATA = onGrid(1.2, 'fermata');
const T_MONEY = onGrid(1.3, 'money frame');
const T_LAND = 1.72;
const T_CATCH = onGrid(1.8, 'CUSHION');
const T_OLE = onGrid(1.9, 'OLE 2');
const T_WHIP = 1.95;
/** Beat flares (pool only, 2 frames each, never more than 2 in a second): SOLE ON, HOP, the catch. */
const FLARES = [T_SOLE, T_HOP, T_CATCH] as const;

// ---------------------------------------------------------------- sim time (the analytic integral of RATE[4])

const WINDOWS: readonly (readonly [number, number, number])[] = [[0.95, 1.3, 0.25], [1.3, 1.42, 0.06], [1.42, 1.55, 0.25]];
function sigma(t: number): number {
  let s = t;
  for (const [a, b, r] of WINDOWS) if (t > a) s -= (Math.min(t, b) - a) * (1 - r);
  return s;
}
/** Flick sim time (0 at the flick, 0.6272 at the catch). */
const flickS = (t: number) => sigma(t) - T_FLICK;

// ---------------------------------------------------------------- the ball's flight and his hop (C units, x1)

/** Ball on the laces at the flick (SoleLift F6 `ball`), then a clean parabola at vx 250 px/s (x3). The brief's arc
 *  (vy 526, g 1648) is re-solved 6 px higher at the same flick, apex time and catch (vy 565, g 1772), so the ball
 *  hangs a clear 10 px above B's shirt in the money frame instead of grazing it; the catch still lands on 1.80. */
const B0X = 88, B0Y = 92.6, BVX = 250 / 3, BVY = 188.2476, BG = 590.6196;
const ballFlight = (s: number): [number, number] => [B0X + BVX * s, B0Y - BVY * s + 0.5 * BG * s * s];
/** His pelvis on the hop: through the json world points of F7 / F8 / F8b / F9 under real gravity (1648 px/s^2 at
 *  x3): it rises 45 px and carries on at the ball's 250 px/s, so the ball comes down in front of him. */
const PEL_A = 80.1933, PEL_B = -179.4, PEL_G = 1648 / 3;
const pelvisX = (s: number) => 76 + BVX * (s - 0.1);
const pelvisY = (s: number) => PEL_A + PEL_B * s + 0.5 * PEL_G * s * s;
/** The rolling ball before SOLE ON: pushed by the F1 laces at C 73, rolling on, stopped dead under the sole at 100. */
const rollX = (t: number) => {
  const u = clamp(t / T_SOLE);
  return 73 + 27 * (1.5 * u - 0.5 * u * u);
};
/** After the cushion: it drops off the instep and is pushed on (the Dribble F2-F4 `ball` anchors at C +70). */
const AFTER: readonly (readonly [number, number])[] = [[1.8, 140.3], [1.85, 151.9], [1.9, 157.9], [1.95, 162.9], [2.0, 167.4]];

// ---------------------------------------------------------------- No.10's schedule and placement

const seq = SEQ[4];
const AIR = new Set<SoloKey>(['SL7', 'SL8', 'SL8b', 'SL9']);
function idxAt(t: number): number {
  let k = 0;
  for (let i = 0; i < seq.length; i++) if (t >= seq[i][0] - 1e-6) k = i;
  return k;
}

interface Place {
  key: SoloKey;
  /** Canvas origin in C units (frame px 0 / row 0 land here); world = 3 C, frame row 103 on the sole line. */
  ox: number;
  oy: number;
  air: boolean;
}

/** Where his frame at t sits (pure f(t)). */
function heroAt(env: Env, t: number): Place {
  const i = idxAt(t);
  const key = seq[i][1];
  if (AIR.has(key)) {
    const s = flickS(t);
    const [ax, ay] = soloAnchor(env, key, 'pelvis');
    let py = pelvisY(s);
    // F9 reaches for the turf: never below it (its lowest pixel, row 104 of the frame, stays above the sole line).
    if (key === 'SL9') py = Math.min(py, 60.5);
    return { key, ox: pelvisX(s) - (ax - 0.5), oy: py - (ay - 0.5), air: true };
  }
  let ox = 0;
  if (i <= 2) ox = key === 'D1' ? -26 : -2;
  else if (key === 'SL10' || key === 'SL11') ox = 50;
  else if (key[0] === 'D') ox = 70;
  return { key, ox, oy: 0, air: false };
}
const worldX = (c: number) => SC * c;
const worldY = (row: number) => GY - SC * (SOLE - row);

/** His pelvis (world) at t. */
function pelvisW(env: Env, t: number): [number, number] {
  const p = heroAt(env, t);
  const [ax, ay] = soloAnchor(env, p.key, 'pelvis');
  return [worldX(p.ox + ax), worldY(p.oy + ay)];
}

/** The ball (C units, pixel-index space; row 96 = on the turf) at t. */
function ballAt(env: Env, t: number): [number, number] {
  if (t < T_SOLE - 1e-6) return [rollX(t), 96];
  if (t < T_FLICK - 1e-6) {
    // Under the sole, then dragged and scooped: glued to the drawn boot (stepped with the frames).
    const k = seq[idxAt(t)][1];
    const [bx, by] = soloAnchor(env, k, 'ball');
    return [bx - 0.5, by - 0.5];
  }
  if (t < T_CATCH - 1e-6) return ballFlight(flickS(t));
  // After the catch: it rolls off the instep onto the turf and on ahead of him (drops 5.3 rows by 1.85).
  let j = 0;
  while (j < AFTER.length - 2 && t >= AFTER[j + 1][0]) j++;
  const [ta, xa] = AFTER[j], [tb, xb] = AFTER[j + 1];
  const u = clamp((t - ta) / (tb - ta));
  const x = j === 0 ? lerp(xa, xb, ease.outQuad(u)) : lerp(xa, xb, u);
  const y = lerp(90.7, 96, clamp((t - T_CATCH) / 0.05) ** 2);
  return [x, y];
}
const ballWorld = (c: [number, number]): [number, number] => [worldX(c[0] + 0.5), GY - SC * (102 - c[1])];
/** Ball radius (world px): r 6 at x1. */
const BALL_R = 18;

// ---------------------------------------------------------------- defender B (the motion library's Rival Slide)

/** B's slide speed (C units per second of SIM time, about 5 m/s): fast enough to pass under the whole hop. */
const B_V = 300;
/** B's body centre (C) at the money frame (sim of 1.36): his studs (east px 93) 4 px ahead of the trailing boot's
 *  lowest pixel, so his boot top sits 3 rows (9 px) below it. */
const B_SIG_M = sigma(1.36);
const B_COM_M = 131.0;
/** Frame schedule (shot time): launch S1 (off the right edge), the slide alternating S2 / S2b on 8ths, S2b through
 *  the hold, and the sprawl S3 once his whole body is clear behind No.10 (spun slowly about his centre). */
const B_SEQ: readonly (readonly [number, string])[] = [[0.3, 'S1'], [0.5, 'S2'], [0.7, 'S2b'], [0.9, 'S2'], [1.1, 'S2b'], [1.8, 'S3']];
const T_SPRAWL = 1.8;
/** Defender B's kit (RIVAL_KIT_B): skin and hair swapped from the strip's RIVAL_KIT (RivalSlide.json kitB). */
const KIT_B: Record<string, string> = {
  e8ac84: 'd69668', aa6e56: 'b06e4a', c89646: '463c3c', '96622c': '282022', '5a361e': '120c0e',
};
/** Light on B in the dark: the spot rig, top-right. */
const B_LIGHT = { lx: 1, ly: -1 };
/** B's light: he slides out of the dark into the pool for his moment (the outside-pool mask), then, once his studs
 *  have passed under, on behind No.10 into his shadow and out of the light again (sim 1.05 -> 1.065, 1.44-1.50 s):
 *  the stride of depth between them reads as light, so No.10 never seems to land on him. */
const bLit = (t: number) => 1 - clamp((sigma(t) - 1.05) / 0.015);

interface BState {
  i: number;
  name: string;
  /** Body centre (C) and its frame-space point. */
  com: number;
  cx: number;
  cy: number;
  rot: number;
}
let RS: StudioAnim | null = null;
const bColour: HTMLCanvasElement[] = [];
const bSil: HTMLCanvasElement[] = [];
/** Opaque x-range of each Rival Slide frame (east frame px). */
const bExtent: [number, number][] = [];

function bAt(t: number): BState | null {
  if (!RS || t < B_SEQ[0][0] - 1e-6) return null;
  let name = B_SEQ[0][1];
  for (const [at, n] of B_SEQ) if (t >= at - 1e-6) name = n;
  const i = RS.frames.findIndex((f) => f.name === name);
  if (i < 0) return null;
  const f = RS.frames[i];
  const c = f.anchors.bodyCom ?? f.com;
  const com = B_COM_M + B_V * (B_SIG_M - sigma(t));
  const rot = t >= T_SPRAWL ? -0.55 * (t - T_SPRAWL) : 0;
  return { i, name, com, cx: c[0] + 0.5, cy: c[1] + 0.5, rot };
}

/** Draw B (flipped: he slides west) with `img` (his colours or his dark-stage silhouette). */
function drawB(ctx: CanvasRenderingContext2D, b: BState, img: HTMLCanvasElement, alpha = 1) {
  drawAnim(ctx, RS!, img, b.i, worldX(b.com), worldY(b.cy), SC, { flip: true, pivot: [b.cx, b.cy], rot: b.rot, alpha });
}
/** World x of his leading studs (west end) and of his trailing end (east). */
function bSpan(b: BState): [number, number] {
  const [x0, x1] = bExtent[b.i] ?? [8, 100];
  return [worldX(b.com - (x1 + 1 - b.cx)), worldX(b.com + (b.cx - x0))];
}

function buildB() {
  if (!hasAnim('RivalSlide')) return;
  RS = anim('RivalSlide');
  if (bColour.length) return;
  RS.frames.forEach((f, i) => {
    const cv = document.createElement('canvas');
    cv.width = RS!.w;
    cv.height = RS!.h;
    const g = cv.getContext('2d')!;
    const img = g.createImageData(cv.width, cv.height);
    const d = img.data;
    let x0 = RS!.w, x1 = 0;
    for (let k = 0; k < d.length; k += 4) {
      d[k + 3] = f.px[k + 3];
      if (!f.px[k + 3]) continue;
      const x = (k / 4) % RS!.w;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      const src = (f.px[k] << 16) | (f.px[k + 1] << 8) | f.px[k + 2];
      const to = KIT_B[src.toString(16).padStart(6, '0')];
      const v = to ? parseInt(to, 16) : src;
      d[k] = v >> 16;
      d[k + 1] = (v >> 8) & 255;
      d[k + 2] = v & 255;
    }
    g.putImageData(img, 0, 0);
    bColour[i] = cv;
    bExtent[i] = [x0, x1];
    bSil[i] = RS!.silhouette(i, { fill: DEF_SIL.fill, rim: DEF_SIL.rim, rim2: DEF_SIL.rim2, lx: B_LIGHT.lx, ly: B_LIGHT.ly }, 0, true);
  });
}

/** Turf thrown up by the slide (normal blend, drawn under the stage dim: lit in the pool, dark outside it). */
function turfSpray(env: Env, x: number, y: number, power: number) {
  const rng = env.rng;
  const a = rng.range(-Math.PI * 0.9, -Math.PI * 0.2);
  const s = rng.range(120, 380) * power;
  env.parts.spawn({
    kind: PK.Debris, x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, ay: 900, drag: 0.6, vrot: rng.range(-12, 12),
    max: rng.range(0.5, 1), s0: rng.range(2, 4), s1: 1.5, ramp: 'grass', r0: rng.next(), r1: rng.next(), a0: 1, a1: 1,
    add: false, layer: 0,
  });
}

// ---------------------------------------------------------------- No.10's fluorescent boots (blacklight)

const derived = new Map<string, { boots: HTMLCanvasElement; halo: HTMLCanvasElement; deep: HTMLCanvasElement }>();
/** 2 = boot white, 1 = boot shade, 0 = anything else. */
function bootKind(p: Uint8ClampedArray, i: number): number {
  if (p[i + 3] <= 40) return 0;
  const near = (h: number) => Math.abs(p[i] - (h >> 16)) < 8 && Math.abs(p[i + 1] - ((h >> 8) & 255)) < 8 && Math.abs(p[i + 2] - (h & 255)) < 8;
  return near(0xdfdae6) ? 2 : near(0x8980ae) ? 1 : 0;
}
/** His white boots as light: boot white -> ivory, boot shade -> lilac (+ violet / uvDeep halo copies). The boots are
 *  the white / shade islands below his hips (the eye whites and the shorts stripes are left alone). */
function derive(env: Env, key: SoloKey) {
  const p = soloPic(env, key);
  let d = derived.get(p.id);
  if (d) return d;
  const { w, h, px } = p;
  const pel = p.anchor('pelvis')[1];
  const kind = new Uint8Array(w * h);
  for (let k = 0; k < w * h; k++) kind[k] = bootKind(px, k * 4);
  const keep = new Uint8Array(w * h);
  const seen = new Uint8Array(w * h);
  const stack: number[] = [];
  for (let k0 = 0; k0 < w * h; k0++) {
    if (!kind[k0] || seen[k0]) continue;
    const comp: number[] = [];
    stack.push(k0);
    seen[k0] = 1;
    while (stack.length) {
      const k = stack.pop()!;
      comp.push(k);
      const x = k % w, y = (k / w) | 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx, yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
          const kk = yy * w + xx;
          if (kind[kk] && !seen[kk]) {
            seen[kk] = 1;
            stack.push(kk);
          }
        }
    }
    const cy = comp.reduce((a, k) => a + ((k / w) | 0), 0) / comp.length;
    if (comp.length >= 6 && cy > pel + 9) for (const k of comp) keep[k] = 1;
  }
  const mk = () => {
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    const g = cv.getContext('2d')!;
    return [cv, g, g.createImageData(w, h)] as const;
  };
  const [boots, bg, bi] = mk();
  const [halo, hg, hi] = mk();
  const [deep, dg, di] = mk();
  const put = (img: ImageData, i: number, c: RGB) => {
    img.data[i] = c[0];
    img.data[i + 1] = c[1];
    img.data[i + 2] = c[2];
    img.data[i + 3] = 255;
  };
  for (let k = 0; k < w * h; k++) {
    if (!keep[k]) continue;
    put(bi, k * 4, kind[k] === 2 ? PAL.ivory : PAL.lilac);
    put(hi, k * 4, PAL.uv);
    put(di, k * 4, PAL.uvDeep);
  }
  bg.putImageData(bi, 0, 0);
  hg.putImageData(hi, 0, 0);
  dg.putImageData(di, 0, 0);
  derived.set(p.id, (d = { boots, halo, deep }));
  return d;
}

/** His boots glowing under the blacklight: a uvDeep halo, a violet halo, then the fluorescent pixels. */
function drawBoots(env: Env, key: SoloKey, x: number, y: number, a: number) {
  if (a <= 0) return;
  const ctx = env.ctx;
  const d = derive(env, key);
  const o = { pivot: [0, SOLE] as [number, number] };
  ctx.save();
  for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 1.5]]) drawSolo(env, key, x + dx * 2, y + dy * 2, SC, { ...o, alpha: 0.3 * a }, d.deep);
  ctx.globalCompositeOperation = 'lighter';
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1]]) drawSolo(env, key, x + dx * 2, y + dy * 2, SC, { ...o, alpha: 0.18 * a }, d.halo);
  drawSolo(env, key, x, y, SC, { ...o, alpha: 0.42 * a }, d.boots);
  ctx.restore();
}

// ---------------------------------------------------------------- the camera (beat-snap framings, tracking the hop)

interface View {
  x: number;
  y: number;
  z: number;
}
const view: View = { x: 0, y: VH / 2, z: 1 };
/** The camera through the hop: locked to his pelvis (it rides the ballistic x, never the stepped frames). */
const trackC = (t: number) => {
  const s = flickS(t);
  return pelvisX(s) + (s > 0.5472 ? 50 * (s - 0.5472) ** 2 : 0);
};
/** Beat-snap framings [time, view(t)]: full body / the sole and ball / up with the hop (tracking) / back out. */
const FRAMES: readonly (readonly [number, (t: number) => View])[] = [
  [0, () => ({ x: worldX(100), y: VH / 2, z: 1 })],
  [T_SOLE, () => ({ x: worldX(100), y: GY - 162 / 1.1, z: 1.1 })],
  [T_HOP, (t) => ({ x: worldX(trackC(t) + 24), y: GY - 168 / 1.2, z: 1.2 })],
  [T_LAND, (t) => ({ x: worldX(trackC(t) + 30), y: VH / 2, z: 1 })],
];
/** The beat-snap: 2 frames easeOutCubic to 103%, then settle over 4 frames (common.beatCam's curve). */
const snapF = (u: number) => (u < 2 / 60 ? 1.03 * ease.outCubic(clamp(u / (2 / 60))) : lerp(1.03, 1, ease.outQuad(clamp((u - 2 / 60) / (4 / 60)))));
/** The whip pan (world px added to x on its 3 frames, accelerating), into shot 5. */
const WHIP = [36, 130, 320];
const whipK = (t: number) => (t < T_WHIP - 1e-6 ? -1 : Math.min(2, Math.floor((t - T_WHIP) * 60 + 1e-6)));

function camAt(t: number) {
  let k = 0;
  for (let i = 0; i < FRAMES.length; i++) if (t >= FRAMES[i][0] - 1e-6) k = i;
  const cur = FRAMES[k][1](t);
  const u = t - FRAMES[k][0];
  if (k > 0 && u < 6 / 60) {
    const prev = FRAMES[k - 1][1](t);
    const f = snapF(u);
    view.x = lerp(prev.x, cur.x, f);
    view.y = lerp(prev.y, cur.y, f);
    view.z = lerp(prev.z, cur.z, f);
  } else {
    view.x = cur.x;
    view.y = cur.y;
    view.z = cur.z;
  }
  const w = whipK(t);
  if (w >= 0) view.x += WHIP[w];
}
const toScreen = (x: number, y: number): [number, number] => [(x - view.x) * view.z + VW / 2, (y - view.y) * view.z + VH / 2];

// ---------------------------------------------------------------- the dark stadium behind (shin-height view)

/** Ground plane: depth s (1 = his line) stands at y HZ + (GY - HZ) s and scrolls at s times the camera. */
const gp = (X: number, s: number): [number, number] => [view.x + (X - view.x) * s, HZ + (GY - HZ) * s];
/** The far stand rides the camera at 18% (far away, and big at this lens: the crowd strip at x2). */
const PAR = 0.18;
const STAND_K = 2;
const CROWD_U0 = -1400;

const phones: { u: number; v: number; big: boolean; lilac: boolean; f: number; ph: number }[] = [];
const specks: { X: number; s: number; q: number; dark: boolean }[] = [];
const tufts: { X: number; h: number; c: number }[] = [];
function buildScene() {
  if (phones.length) return;
  const r = new Rng(5041);
  for (let i = 0; i < 170; i++)
    phones.push({
      u: CROWD_U0 + r.range(0, 3200),
      v: HZ - 18 - r.range(0, 196) * Math.sqrt(r.next()),
      big: r.next() < 0.28,
      lilac: r.next() < 0.34,
      f: r.range(0.8, 2.1),
      ph: r.range(0, 6.3),
    });
  for (let i = 0; i < 520; i++) {
    const y = r.range(HZ + 3, VH + 70);
    const s = (y - HZ) / (GY - HZ);
    specks.push({ X: r.range(0, 900), s, q: s > 1.02 ? 3 : s > 0.6 ? 2 : 1, dark: r.next() < 0.55 });
  }
  for (let i = 0; i < 90; i++) tufts.push({ X: r.range(-300, 1500), h: r.next() < 0.5 ? 3 : 6, c: r.next() < 0.5 ? 0 : 1 });
}
const SPECK_W = 900;

/** Backdrop transform (inside the world transform): returns the backdrop's camera u. */
function backdrop(ctx: CanvasRenderingContext2D): number {
  ctx.translate(view.x * (1 - PAR), 0);
  return view.x * PAR;
}

function drawStands(env: Env) {
  const ctx = env.ctx;
  const st = env.art.stadium;
  const halfW = VW / (2 * view.z) + 30;
  ctx.save();
  const bu = backdrop(ctx);
  const L0 = bu - halfW, W0 = halfW * 2;
  const top = view.y - VH / (2 * view.z) - 20;
  // Night above the roof (no moon, no sky shot), then the roof edge.
  ctx.fillStyle = '#06030c';
  ctx.fillRect(L0, top, W0, HZ - top);
  const yC = HZ - 12 - st.crowd.height * STAND_K;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(st.crowd, CROWD_U0, yC, st.crowd.width * STAND_K, st.crowd.height * STAND_K);
  ctx.fillStyle = '#05030a';
  ctx.fillRect(L0, yC - 26, W0, 26);
  // Dead ad boards along the foot of the stand (the house lights are down), over the strip's own board row.
  ctx.fillStyle = '#05040b';
  ctx.fillRect(L0, HZ - 36, W0, 36);
  ctx.fillStyle = '#120a1e';
  for (let i = Math.floor((L0 - CROWD_U0) / 150); i < Math.ceil((L0 + W0 - CROWD_U0) / 150); i++) ctx.fillRect(CROWD_U0 + i * 150 + 8, HZ - 12, 120, 9);
  // The stands sink further than the pitch (darkness made of light: one more multiply of the stage's dim colour).
  const [r, g, b] = stage.dimColor(0.84);
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`;
  ctx.fillRect(L0, top, W0, HZ - top);
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}

/** Phone lights in the dark stands (light sources: after the dim), steady with a slow ±30% twinkle. */
function drawPhones(env: Env, t: number) {
  const ctx = env.ctx;
  const halfW = VW / (2 * view.z) + 10;
  ctx.save();
  const bu = backdrop(ctx);
  for (const p of phones) {
    if (p.u < bu - halfW || p.u > bu + halfW) continue;
    const k = 1 + 0.3 * Math.sin(t * p.f * 2.4 + p.ph);
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(p.lilac ? PAL.lilac : PAL.ivory), p.u + 1, p.v + 1, p.big ? 7 : 5, 0.3 * k);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = clamp(0.85 * k);
    ctx.fillStyle = p.lilac ? HEX.lilac : HEX.ivory;
    const q = p.big ? 3 : 2;
    ctx.fillRect(p.u, p.v, q, q);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

/** The penalty-box corner ahead of him (the constant-X front line receding, the side line at depth 0.3). */
const XBOX = 760;
function pitchLines(ctx: CanvasRenderingContext2D) {
  const [x0, y0] = gp(XBOX, 1.6), [x1, y1] = gp(XBOX, 0.3);
  const a = 3.6 * 1.6 / 2, b = 3.6 * 0.3 / 2;
  ctx.beginPath();
  ctx.moveTo(x0 - a, y0);
  ctx.lineTo(x0 + a, y0);
  ctx.lineTo(x1 + b, y1);
  ctx.lineTo(x1 - b, y1);
  ctx.closePath();
  ctx.fill();
  const [xb] = gp(XBOX + 1400, 0.3);
  ctx.fillRect(x1, y1 - 0.6, xb - x1, 1.2);
}

function drawPitch(env: Env) {
  const ctx = env.ctx;
  const halfW = VW / (2 * view.z) + 40;
  const left = view.x - halfW, right = view.x + halfW;
  const bottom = view.y + VH / (2 * view.z) + 20;
  const g = ctx.createLinearGradient(0, HZ, 0, bottom);
  g.addColorStop(0, '#143a20');
  g.addColorStop(0.3, '#1f5a2b');
  g.addColorStop(0.75, '#2a7a36');
  g.addColorStop(1, '#2c8238');
  ctx.fillStyle = g;
  ctx.fillRect(left, HZ - 1, right - left, bottom - HZ + 1);
  // Mowing stripes (bands of constant X) converging on the vanishing point.
  const SW = 260;
  const sB = (bottom - HZ) / (GY - HZ);
  ctx.fillStyle = 'rgba(150,230,140,0.07)';
  ctx.beginPath();
  const k0 = Math.floor((view.x - halfW / sB - 600) / SW), k1 = Math.ceil((view.x + halfW / sB + 600) / SW);
  for (let k = k0 - (((k0 % 2) + 2) % 2); k <= k1; k += 2) {
    const [xa] = gp(k * SW, sB), [xb] = gp((k + 1) * SW, sB);
    ctx.moveTo(view.x, HZ);
    ctx.lineTo(xa, bottom);
    ctx.lineTo(xb, bottom);
    ctx.closePath();
  }
  ctx.fill();
  const hz = ctx.createLinearGradient(0, HZ, 0, HZ + 26);
  hz.addColorStop(0, 'rgba(14,10,26,0.6)');
  hz.addColorStop(1, 'rgba(14,10,26,0)');
  ctx.fillStyle = hz;
  ctx.fillRect(left, HZ - 1, right - left, 27);
  // Turf speckle: it scrolls at each depth's speed, so the ground visibly runs under him.
  for (const p of specks) {
    const off = ((((p.X - view.x * p.s) % SPECK_W) + SPECK_W) % SPECK_W) - SPECK_W / 2;
    const x = view.x + off, y = HZ + (GY - HZ) * p.s;
    if (x < left || x > right || y > bottom) continue;
    ctx.fillStyle = p.dark ? 'rgba(14,48,22,0.6)' : 'rgba(120,196,100,0.24)';
    ctx.fillRect(x, y, p.q, Math.max(1, p.q - 1));
  }
  // Grass tufts on his line, fixed to the turf (the planted foot never slides against them).
  for (const u of tufts) {
    if (u.X < left || u.X > right) continue;
    ctx.fillStyle = u.c ? 'rgba(120,200,96,0.5)' : 'rgba(16,56,26,0.7)';
    ctx.fillRect(u.X, GY - u.h, 3, u.h);
  }
  ctx.fillStyle = 'rgba(236,242,250,0.8)';
  pitchLines(ctx);
}

// ---------------------------------------------------------------- the stage light

const spot = new FollowSpot(0.06);
/** The pool's aim: ahead of his pelvis toward the ball, at mid-body. */
const AIM_X = 34, AIM_Y = 150;
/** The pool irises open out of shot 3's black over 3 frames. */
const irisOpen = (t: number) => lerp(0.5, 1, ease.outBack(clamp(t / (3 / 60))));
/** Stage dim outside the pool: 0.8, 0.88 from the money frame to the end of the slow window. */
const dimLevel = (t: number) => (t >= T_MONEY - 1e-6 && t < 1.55 ? 0.88 : 0.8);

let maskCv: HTMLCanvasElement | null = null;
/** Draw `fn` into a reused full-frame layer, punch the pool out of it, and lay it on the frame (B's dark-stage
 *  silhouette only outside the light, so the part of him inside the pool shows his real colours). */
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

// ---------------------------------------------------------------- module state (reset in init)

const ghosts = new Afterimages(6, 9);
let spin = new BallSpin();
let prevBall: [number, number] = [0, 0];
/** Hero exposures [time, life 0.7 s]: F5 / F6 / F7 on the hop path; they decay on the grid as the hold arrives (F5 is
 *  gone at 1.30, F6 and F7 are faint prints at the money frame), so the strobe chain owns the still. */
const HERO_GHOSTS: readonly (readonly [number, number])[] = [[T_SCOOP, 0.7], [T_FLICK, 0.7], [T_HOP, 0.7]];
let heroGhostNext = 0;
/** The strobe chain: a ball exposure every 0.06 s of sim time from the laces (sim 0) to the apex (sim 0.30): at r 18
 *  that keeps six separate balls that bunch toward the apex like a real strobe photograph. It holds through the
 *  money frame and decays from the laces end, three at a time (dead at 1.70 / 1.80), before the catch settles. */
const CHAIN_DT = 0.06, CHAIN_N = 6;
let chainNext = 0;
const FX_T = { dust0: 0.2, takeoff: T_HOP, land: T_LAND, plant: 1.85 } as const;
type FxKey = keyof typeof FX_T;
let fxDone: Record<FxKey, boolean> = { dust0: false, takeoff: false, land: false, plant: false };
let sprayAcc = 0;

function puff(env: Env, x: number, n: number, a: number, spread = 1) {
  for (let k = 0; k < n; k++) {
    const side = k % 2 ? 1 : -1;
    env.parts.spawn({
      kind: PK.Smoke, x: x + env.rng.range(-8, 8), y: GY - 3, vx: side * env.rng.range(30, 90) * spread, vy: -env.rng.range(10, 40),
      drag: 3, max: env.rng.range(0.35, 0.6), s0: 5, s1: env.rng.range(12, 20), ramp: 'dust',
      r0: 0.2, r1: 1, a0: a, a1: 0, add: false, layer: 0,
    });
  }
}

// ---------------------------------------------------------------- the shot

export const shotSoleLift: Shot = {
  name: 'Sole lift',
  dur: DUR,
  seed: 504,
  rate: RATE[4],
  prepare(env) {
    const keys = [...new Set(seq.map(([, k]) => k))];
    warmSolo(env, keys, { ghosts: true });
    for (const k of keys) derive(env, k);
    buildB();
    buildScene();
    for (const c of [PAL.ivory, PAL.lilac, PAL.uv, PAL.uvDeep, PAL.plum] as RGB[]) glowOf(c);
    if (!maskCv) maskCv = document.createElement('canvas');
    maskCv.width = env.ctx.canvas.width;
    maskCv.height = env.ctx.canvas.height;
  },
  init(env) {
    env.sfx.clearBus();
    buildB();
    buildScene();
    ghosts.clear();
    heroGhostNext = 0;
    chainNext = 0;
    fxDone = { dust0: false, takeoff: false, land: false, plant: false };
    sprayAcc = 0;
    spin = new BallSpin();
    spin.rotate(0.3, 1, 0.2, 0.9);
    prevBall = ballAt(env, 0);
    const [px] = pelvisW(env, 0);
    spot.snap(px + AIM_X, GY - AIM_Y);
    camAt(0);
    env.cam.set(view.x, view.y, view.z, 0);
  },
  update(env, t, dt) {
    env.sfx.hum(HUM[4](t));
    camAt(t); // the camera is a pure f(t): update reads it too (the spray window), so seek == play
    // ---- exposures of F5 / F6 / F7 where he stood and rose (dropped on their beats), placed like the frame itself.
    while (heroGhostNext < HERO_GHOSTS.length && t >= HERO_GHOSTS[heroGhostNext][0] - 1e-6) {
      const [at, life] = HERO_GHOSTS[heroGhostNext++];
      const pl = heroAt(env, at);
      ghosts.dropHero(pl.key, worldX(pl.ox), worldY(SOLE + pl.oy), SC, t, life, { pivot: [0, SOLE] });
    }
    // ---- the strobe chain of the ball: every CHAIN_DT of sim time from the flick, up to the apex.
    while (chainNext < CHAIN_N && t >= T_FLICK - 1e-6 && flickS(t) >= chainNext * CHAIN_DT - 1e-6) {
      const [wx, wy] = ballWorld(ballFlight(chainNext * CHAIN_DT));
      const death = 1.7 + 0.1 * Math.floor(chainNext / 3);
      ghosts.dropBall(wx, wy, BALL_R, t, death - t);
      chainNext++;
    }
    // ---- ball spin: locked to its roll on the turf; backspin off the scoop in the air.
    const b = ballAt(env, t);
    const dx = (b[0] - prevBall[0]) * SC;
    if (t > T_FLICK && t < T_CATCH) spin.rotate(0, 0, 1, -7 * dt);
    else if (dx !== 0) spin.rotate(0, 0, 1, dx / BALL_R);
    prevBall = b;
    // ---- the operator follows his pelvis (with the hit-stops: the warped step) with a human lag.
    const [px] = pelvisW(env, t);
    spot.update(px + AIM_X, GY - AIM_Y, dt);
    // ---- turf dust: the left foot plants (0.20), the hurdler's push-off (0.80), the landing (1.72), the next step.
    const due = (k: FxKey) => {
      if (fxDone[k] || t < FX_T[k] - 1e-6) return false;
      fxDone[k] = true;
      return true;
    };
    if (due('dust0')) puff(env, worldX(70), 3, 0.22);
    if (due('takeoff')) puff(env, worldX(68), 6, 0.32, 1.3);
    if (due('land')) puff(env, worldX(126), 6, 0.3, 1.2);
    if (due('plant')) puff(env, worldX(143), 3, 0.2);
    // ---- B's slide ploughs the turf: grass and dust thrown up from his studs and hip while he is near the frame.
    const bb = bAt(t);
    if (bb && bb.name !== 'S1' && t < T_SPRAWL + 0.1) {
      const [x0] = bSpan(bb);
      if (x0 < view.x + 420 && x0 > view.x - 520) {
        sprayAcc += dt * 60 * 1.2;
        while (sprayAcc >= 1) {
          sprayAcc -= 1;
          turfSpray(env, x0 + env.rng.range(0, 30), GY - 4, 0.75);
          if (env.rng.next() < 0.45)
            env.parts.spawn({
              kind: PK.Smoke, x: x0 + env.rng.range(10, 60), y: GY - 4, vx: env.rng.range(-40, 60), vy: -env.rng.range(10, 50),
              drag: 2.5, max: env.rng.range(0.4, 0.7), s0: 6, s1: env.rng.range(16, 26), ramp: 'dust',
              r0: 0.2, r1: 1, a0: 0.3, a1: 0, add: false, layer: 0,
            });
        }
      }
    }
  },
  render(env, t) {
    const ctx = env.ctx;
    camAt(t);
    env.cam.set(view.x, view.y, view.z, 0);
    const fl = stage.flare(t, FLARES);
    const open = irisOpen(t) * fl.size;
    const pl = heroAt(env, t);
    const hx = worldX(pl.ox), hy = worldY(SOLE + pl.oy);
    const heroO = { pivot: [0, SOLE] as [number, number] };
    const [bX, bY] = ballWorld(ballAt(env, t));
    const bH = GY - BALL_R - bY;
    const [pX] = pelvisW(env, t);
    // His lowest boot's height above the turf (his shadow shrinks as he rises).
    const lift = pl.air ? Math.max(0, SC * (SOLE - (pl.oy + soloAnchor(env, pl.key, 'lowBoot')[1] + 0.5))) : 0;
    const b = bAt(t);
    const [sx, sy] = toScreen(spot.x, spot.y);
    const pool: StagePool = { x: sx, y: sy, rx: 200 * view.z * open, ry: 230 * view.z * open, soft: 40 * view.z, gain: 1 };

    // ---- the world under the dim
    env.world();
    drawStands(env);
    drawPitch(env);
    if (b) {
      const [x0, x1] = bSpan(b);
      // B's torn turf: divots fixed on the turf along his slide, behind his studs, fading over 420 px behind him
      // (a short streak; no glow).
      const from = x0 + 30, to = Math.min(x1 + 300, worldX(B_COM_M + B_V * (B_SIG_M - 0.5)));
      for (let x = Math.floor(from / 9) * 9; x < to; x += 9) {
        const k = Math.abs(Math.sin(x * 12.9898) * 43758.5453) % 1;
        const fade = clamp(1 - (x - from) / 420);
        if (fade <= 0) continue;
        ctx.fillStyle = `rgba(74,50,30,${0.7 * fade})`;
        ctx.fillRect(x, GY - 1 - k * 3, 5 + k * 9, 2 + k * 3);
        ctx.fillStyle = `rgba(12,34,16,${0.6 * fade})`;
        ctx.fillRect(x + 3, GY + 2, 4 + k * 6, 2);
        if (k > 0.6) ctx.fillRect(x - 2, GY - 4 - k * 4, 3, 3);
      }
      // His contact shadow along the slide.
      ctx.fillStyle = 'rgba(8,4,16,0.4)';
      ctx.beginPath();
      ctx.ellipse((x0 + x1) / 2, GY - 1, (x1 - x0) / 2, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // His shadow (short, straight under him: the light is above) and the ball's (shrinking as it rises).
    const shK = clamp(1 - lift / 160);
    ctx.fillStyle = `rgba(10,4,20,${0.5 * shK})`;
    ctx.beginPath();
    ctx.ellipse(pX + 6, GY - 1, 52 * (0.55 + 0.45 * shK), 7 * (0.6 + 0.4 * shK), 0, 0, Math.PI * 2);
    ctx.fill();
    const bk = clamp(1 - bH / 170);
    ctx.fillStyle = `rgba(22,10,38,${0.55 * bk + 0.12})`;
    ctx.beginPath();
    ctx.ellipse(bX, GY - 1, 17 * (0.45 + 0.55 * bk), 4 * (0.5 + 0.5 * bk), 0, 0, Math.PI * 2);
    ctx.fill();
    env.parts.draw(ctx, 0);

    // ---- the stage dim (one soft hole on him)
    env.screen();
    stage.dim(ctx, dimLevel(t), [pool]);

    // ---- light sources and fluorescent accents
    env.world();
    drawPhones(env, t);
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = HEX.lilac;
    pitchLines(ctx);
    ctx.restore();

    // ---- the follow-spot: beam and floor pool
    env.screen();
    const [fx, fy] = toScreen(spot.x, GY);
    stage.beam(ctx, 600, -40, fx, fy, 30, 300 * view.z * open, 0.17 * fl.gain, { t, seed: 4, motes: 26 });
    env.world();
    stage.floorPool(ctx, spot.x, GY - 1, 150 * open, 18 * open, 0.34 * fl.gain);

    // ---- exposures (light printed on the stage), then B over them (behind No.10: a stride further from the camera;
    // his real colours inside the pool, the dark-stage silhouette outside it and once he slides into No.10's
    // shadow), then No.10 in full colour, his blacklit boots, the ball
    ghosts.draw(env, t);
    if (b) {
      drawB(ctx, b, bColour[b.i]);
      outsidePool(env, pool, (g) => drawB(g, b, bSil[b.i]));
      const dark = 1 - bLit(t);
      if (dark > 0) drawB(ctx, b, bSil[b.i], dark);
    }
    drawSolo(env, pl.key, hx, hy, SC, heroO);
    drawBoots(env, pl.key, hx, hy, 0.9);
    let hit = 0;
    for (const tt of [T_TOUCH, T_SOLE, T_FLICK, T_CATCH]) if (t >= tt - 1e-6 && t < tt + 0.2) hit = Math.max(hit, 1 - (t - tt) / 0.2);
    drawBall(env, spin, bX, bY, BALL_R, 1, 0, (0.85 + 0.3 * hit * hit) * (fl.gain > 1 ? 1.12 : 1), 'blacklight');
    env.parts.draw(ctx, 1);

    // ---- the whip pan: a horizontal smear of the frame as the camera throws right
    const w = whipK(t);
    if (w >= 0) {
      const cv = ctx.canvas;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const len = [8, 24, 46][w] * env.S;
      for (let k = 1; k <= 4; k++) {
        ctx.globalAlpha = [0.2, 0.3, 0.34][w] - k * 0.05;
        ctx.drawImage(cv, (k * len) / 4, 0);
      }
      ctx.restore();
      env.fx.radial = [0.06, 0.15, 0.25][w];
      env.fx.radialX = 0.5;
      env.fx.radialY = 0.55;
    }

    // ---- HUD
    env.screen();
    fourCount(ctx, padsFor(4), t);
    marqueeTag(ctx, 'SOLE LIFT', 24, 60, t - T_MONEY);

    // ---- grade, impact, beat echo
    soloGrade(env.fx);
    if (onFrames(t, T_MONEY, 2)) soloImpact(env.fx, 1);
    const [ex, ey] = toScreen(pX, GY - 150);
    echoAt(env, t, T_HOP, 3, 0.55, -0.012, { dy: 0.006, sx: ex, sy: ey, R: 0.4 });
  },
  cues: [
    { at: T_TOUCH, fn: (env) => env.sfx.tom(TOMS.F2) },
    { at: 0.2, fn: (env) => env.sfx.scuff(0.1) },
    // B launches his slide in the dark, off the right edge: we hear it before we see it.
    { at: 0.3, fn: (env) => env.sfx.scrape(0.9) },
    { at: T_SOLE, fn: (env) => (env.sfx.rim(), env.sfx.kick(0.15)) },
    { at: T_DRAG, fn: (env) => env.sfx.snare(0.3) },
    { at: T_SCOOP, fn: (env) => env.sfx.hat() },
    { at: T_FLICK, fn: (env) => (env.sfx.tom(TOMS.C3), env.sfx.kick(0.2)) },
    { at: T_HOP, fn: (env) => (env.sfx.kickDrum(0.8), env.sfx.whoosh(0.25, 300, 1800)) },
    { at: 1.0, fn: (env) => env.sfx.crashSwell(0.8) },
    { at: T_FERMATA, fn: (env) => env.sfx.tom(TOMS.D2, 0.6) },
    { at: T_MONEY, fn: (env) => env.sfx.shing(1.4) },
    { at: T_LAND, fn: (env) => env.sfx.scuff() },
    { at: T_CATCH, fn: (env) => env.sfx.tom(TOMS.A2) },
    { at: 1.85, fn: (env) => env.sfx.scuff(0.1) },
    { at: T_OLE, fn: (env) => env.sfx.ole(2) },
    { at: T_WHIP, fn: (env) => env.sfx.whoosh(0.2) },
  ],
};
