// SHOT 3 · OUTSIDE OF THE BOOT (1.7 s): the strike, a technique kids can copy (SPEC.md §3). Precise, dry, cheeky.
//
// A side view at boot height from the near side. The stadium is an ink page (inkGrade 0.9: ink stands, paper-white
// floodlights, paper-grey turf with screentone, the defenders' line as small inked figures far off to the right, where
// the pass is going); No.10 (Approach / Trivela studio frames at integer x2, 196 px), the ball and the thread keep their
// colour. One-point perspective toward the right of the frame: the far layer (stands, defenders, the thread's far end)
// converges on a vanishing point that stays fixed on screen while the camera trucks, dollies and cranes.
//
// Beats (shot-local t, the runner's unwarped clock):
//   0.00  AP1, the last stride (head away: mop and ear). Opens out of shot 2's paper flash; the camera tracks right.
//   0.09  AP3, the bound (airborne, on the pelvis path).
//   0.18  T3 plant: the far foot lands wide of the ball and a little behind it; dustBurst(6), inked. Slow motion 0.35
//         while the camera dollies from full figure to the legs (zoom 1 -> 1.35, centred between boot and ball).
//   0.40  T4 wind-up (knee flick).  0.55 T5 swing: ink smear arc with speed lines along the boot's path.
//   0.62  HIT (T6), the technique freeze (hit-stop 0.03 for 0.20 s): 3 frames of pure ink and paper (doubled tone) with
//         ink focus lines on the boot, 1 frame where only the background flips to its negative, then the 0.9 ink again.
//         "Eyes here, ball there": a slanted inset drops in top-left (Glance G2, eyes away) while the main frame holds
//         the boot on the ball (10 % squash). Technique diagram: two jade spin marks (clockwise from above), a dotted
//         ink chalk arrow out from the ball bending right, and the note OUTSIDE OF THE BOOT.
//   0.82  release: the ball rolls off right and a little up-screen (into depth), spinning; the thread unspools from the
//         boot behind it and quivers like a plucked string.  0.84 T7 follow-through (leg out to his right).
//   0.95  the reveal: the camera crane-slides up the follow-through leg to his face (0.35 s, inOutCubic), rising from
//         boot height to eye height so the ground plane opens up: small and deep, the thread arcs away toward the inked
//         line of defenders. T8a (3/4 to camera, smirk); 1.15 T8b, the wink: glint + small jade flare on the open eye.
//   1.30  T9 recover (eyes follow the pass), T9b 1.50 (hair settled one beat late).
//   1.45  thread wipe: the needle sews one taut jade thread across the top edge (0.08 s), then the thread is pulled
//         straight down like a blind cord (0.17 s, inCubic), vibrating 1 px; shot 4's page is revealed above it.
//
// No.10 is never a puppet: Approach AP1/AP3 and Trivela T3-T9b studio frames at integer x2 (no10.ts falls back to studio
// stand-ins if a frame is missing). The defenders are cached puppets (no puppet render per frame).

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { Rng, clamp, ease, lerp } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { focusLines, lensFlare, pixelText, sparkle, type TrailPt } from '../../art/fx';
import { POSES, RIVAL_KIT, RIVAL_KIT_B, RIVAL_KIT_C, RIVAL_KIT_D } from '../../art/puppet';
import { anim, drawAnim, findFrame, hasAnim, type StudioAnim } from '../../art/studioAnim';
import {
  HEX, JADE_FLARE, PAGE, THREAD_NOTES as N, cachePuppet, drawBall, drawGrassFore, drawNo10, dustBurst, inkGrade,
  inkNegative, inkSmear, mangaPanels, meridianGrade, needlePoint, no10Point, panelPoly, paperFlash, pluckLine, prepareGrassFore,
  prepareInk, pulse, spinMarks, warp, type No10Key,
} from './common';

const DUR = 1.7;

// ---------------------------------------------------------------- timing (shot-local t)
const AP3_T = 0.09;
const PLANT = 0.18;
const WIND = 0.4;
const SWING = 0.55;
const HIT = 0.62;
const RELEASE = 0.82;
const FOLLOW = 0.84;
const REVEAL0 = 0.95, REVEAL1 = 1.3;
const WINK = 1.15;
const SETTLE = 1.5;
const WIPE0 = 1.45, WIPE_ACROSS = 0.08;
/** Hit-stops / slow motion: [start, length, rate]. */
const STOPS: [number, number, number][] = [[PLANT, WIND - PLANT, 0.35], [HIT, RELEASE - HIT, 0.03]];

type Key = No10Key | 'T9b';
const SEQ: readonly (readonly [number, Key])[] = [
  [0, 'AP1'], [AP3_T, 'AP3'], [PLANT, 'T3'], [WIND, 'T4'], [SWING, 'T5'], [HIT, 'T6'], [FOLLOW, 'T7'],
  [REVEAL0, 'T8a'], [WINK, 'T8b'], [REVEAL1, 'T9'], [SETTLE, 'T9b'],
];
const keyAt = (t: number): Key => SEQ.reduce<Key>((k, [s, f]) => (t >= s - 1e-6 ? f : k), SEQ[0][1]);

// ---------------------------------------------------------------- world layout (world px; No.10 at integer x2)
const D = 2;
const GY = 300;
const BALL_R = 6;
/** Approach/Run-canvas pixel (u, v) -> world (ground row 102 -> its bottom edge on GY). */
const runPt = (u: number, v: number): [number, number] => [u * D, GY + (v - 103) * D];
/** Trivela-canvas pixel -> world: the Trivela canvas sits 56 px right of the Approach/Run canvas (Trivela.json). */
const trivPt = (u: number, v: number): [number, number] => runPt(u + 56, v);
const AP1_TOE = runPt(73.5, 103);
/** T3-T8b share the planted (far) toe pixel; T9/T9b stand on the near toe. */
const PLANT_TOE = trivPt(76.5, 103);
const RECOVER_TOE = trivPt(94.5, 103);
/** AP3's pelvis path (Run-canvas px), 0.09-0.18: the bound (Approach.json AP2 path, compressed). */
const AP3_PATH: readonly (readonly [number, number, number])[] = [[AP3_T, 87, 63], [0.125, 99, 62.5], [0.155, 107, 64.5], [PLANT, 112, 66]];

// Perspective of the far layer: one vanishing point to the right, fixed on screen (the camera only translates).
const VP_S = 220; // screen px right of the frame centre
const HH0 = 26; // camera height (world px above the turf): boot height
const HH_FACE = 158; // eye height (the crane)

// Camera keys.
const TRACK_X0 = 198, TRACK_X1 = 268; // trucking with him 0 -> 0.18 (his pelvis speed)
const C_HIT = { x: 284, y: 256, z: 1.35 };
const C_FACE = { x: 345, y: 148, z: 1.85 };

// The pass's ground track (far layer): lateral advance in his plane and depth scale s (1 = his plane).
const TRACK_LAT = 148;
const TRACK_DEEP = 3.5;
const TRACK_POW = 1.4;
const TRACK_TAU = 0.55;
const TRACK_SPAN = DUR - RELEASE;

// The defenders' inked line, far off (depth s, lateral position in his plane at that depth, pose, kit, facing).
const DEFENDERS = [
  { s: 0.19, X: 495, kit: RIVAL_KIT, pose: 'jockey', facing: -1 }, // D1, the presser, stepped out in front
  { s: 0.13, X: 112, kit: RIVAL_KIT_B, pose: 'lookFar', facing: -1 }, // D2
  { s: 0.14, X: 686, kit: RIVAL_KIT_C, pose: 'stand', facing: -1 }, // D3
  { s: 0.16, X: 792, kit: RIVAL_KIT_D, pose: 'lookFar', facing: -1 }, // D4
] as const;

// Freeze inset ("eyes here, ball there"), screen space.
const INSET = panelPoly(126, 80, 216, 98, -5);
const FACE_SCALE = 4; // face crops at integer x4 only

// ---------------------------------------------------------------- module state (reset in init)
let spin = new BallSpin();
let prevBall = 0;
let planted = false, struck = false, released = false;
let anchorsOk = false;
let REST: [number, number] = [287, 287];
let BOOT6: [number, number] = [273, 287];
let BOOT4: [number, number] = [182, 255];
let BOOT5: [number, number] = [212, 281];

interface Cached {
  cv: HTMLCanvasElement;
  ox: number;
  oy: number;
  k: number;
}
let defCache: Cached[] = [];
let face: { a: StudioAnim; i: number } | null = null;

// ---------------------------------------------------------------- pure functions of t

function sim(t: number) {
  let s = t;
  for (const [a, l, r] of STOPS) s -= clamp(t - a, 0, l) * (1 - r);
  return s;
}

interface Cam {
  x: number;
  y: number;
  z: number;
  hh: number;
}

/** The camera at t (before shake): trucks with him, dollies onto the legs, holds the freeze, cranes up to the face. */
function camAt(t: number): Cam {
  const v = (TRACK_X1 - TRACK_X0) / PLANT;
  if (t < PLANT) return { x: TRACK_X0 + v * t, y: 180, z: 1, hh: HH0 };
  // The truck's momentum bleeds off over 0.08 s (no hard stop at the plant), then the dolly settles on C_HIT.
  const tau = Math.min(t - PLANT, 0.08);
  const drift = TRACK_X1 + v * (tau - (tau * tau) / (2 * 0.08));
  const k = ease.inOutCubic(clamp((t - PLANT) / (WIND - PLANT)));
  let x = lerp(drift, C_HIT.x, ease.inOutQuad(clamp((t - PLANT) / (WIND - PLANT))));
  let y = lerp(180, C_HIT.y, k);
  let z = lerp(1, C_HIT.z, k);
  // The hold breathes: a slow 3 % push through the wind-up and the freeze.
  z *= 1 + 0.03 * ease.inOutQuad(clamp((t - WIND) / (REVEAL0 - WIND)));
  // The release: a small follow toward the ball.
  x += 10 * ease.outCubic(clamp((t - RELEASE) / (REVEAL0 - RELEASE)));
  let hh = HH0;
  // The crane: diagonally up the follow-through leg to his face, rising from boot height to eye height.
  if (t >= REVEAL0) {
    const c = ease.inOutCubic(clamp((t - REVEAL0) / (REVEAL1 - REVEAL0)));
    x = lerp(x, C_FACE.x, c);
    y = lerp(y, C_FACE.y, c);
    z = lerp(z, C_FACE.z, c);
    hh = lerp(HH0, HH_FACE, c);
  }
  // After the wink his eyes follow the pass: the frame drifts with them.
  if (t >= REVEAL1) {
    const d = ease.outCubic(clamp((t - REVEAL1) / 0.4));
    x += 14 * d;
    z *= 1 + 0.02 * d;
  }
  return { x, y, z, hh };
}

const vpx = (c: Cam) => c.x + VP_S / c.z;
const horizon = (c: Cam) => GY - c.hh;
/** Far-layer ground point (lateral X at depth s, h world px above the turf, scaled with depth). */
function ground(c: Cam, X: number, s: number, h = 0): [number, number] {
  const vx = vpx(c), hz = horizon(c);
  return [vx + (X - vx) * s, hz + (GY - hz) * s - h * s];
}

/** Ball x before the hit: rolling ahead of him, decelerating, it reaches T6's ball guide exactly at the hit. */
function ballPreX(t: number) {
  const VA = 420, VB = 34;
  const sHit = sim(HIT);
  const xb = REST[0] - VB * (sHit - PLANT);
  const s = sim(Math.min(t, HIT));
  if (s >= PLANT) return xb + VB * (s - PLANT);
  const aa = (VA - VB) / PLANT;
  const x0 = xb - (VA * PLANT - 0.5 * aa * PLANT * PLANT);
  return x0 + VA * s - 0.5 * aa * s * s;
}

/** Track parameter u (0 = struck, 1 = end of the shot), decelerating. */
function trackU(t: number) {
  const tau = Math.max(0, t - RELEASE);
  return (1 - Math.exp(-tau / TRACK_TAU)) / (1 - Math.exp(-TRACK_SPAN / TRACK_TAU));
}
/** The ground track at u: lateral X (his plane) and depth s. */
function track(u: number): [number, number] {
  // Fast off the boot in his plane (it snaps away after the hit-stop), then receding into depth.
  const X = REST[0] + TRACK_LAT * (1 - Math.pow(1 - u, 3));
  const s = 1 / (1 + TRACK_DEEP * Math.pow(u, TRACK_POW));
  return [X, s];
}
/** World position of the ball centre at track u under camera c, and its depth s. */
function ballOnTrack(c: Cam, u: number): [number, number, number] {
  const [X, s] = track(u);
  const [x, y] = ground(c, X, s, BALL_R * D);
  return [x, y, s];
}

/** AP3's pelvis on its path (Run-canvas px). */
function ap3Pelvis(t: number): [number, number] {
  const k = AP3_PATH;
  let i = 0;
  while (i < k.length - 2 && t > k[i + 1][0]) i++;
  const u = clamp((t - k[i][0]) / (k[i + 1][0] - k[i][0]));
  return [lerp(k[i][1], k[i + 1][1], u), lerp(k[i][2], k[i + 1][2], u)];
}

/** Where No.10's frame is pinned at t (world point + anchor). */
function heroAt(t: number): { key: Key; x: number; y: number; anchor?: string } {
  const key = keyAt(t);
  if (key === 'AP1') return { key, x: AP1_TOE[0], y: AP1_TOE[1] };
  if (key === 'AP3') {
    const [px, py] = ap3Pelvis(t);
    const [x, y] = runPt(px + 0.5, py + 0.5);
    return { key, x, y, anchor: 'pelvis' };
  }
  if (key === 'T9' || key === 'T9b') return { key, x: RECOVER_TOE[0], y: RECOVER_TOE[1] };
  return { key, x: PLANT_TOE[0], y: PLANT_TOE[1] };
}

/** The freeze's frame index (0.. from the hit), or -1 outside it. */
function freezeFrame(t: number) {
  if (t < HIT - 1e-6 || t >= RELEASE) return -1;
  return Math.floor((t - HIT) * 60 + 1e-6);
}

// ---------------------------------------------------------------- caches

/** Resolve the anchors this shot pins things to (studio frames, so they follow the art). */
function resolveAnchors(env: Env) {
  REST = no10Point(env, 'T6', 'ball', PLANT_TOE[0], PLANT_TOE[1], D);
  BOOT6 = no10Point(env, 'T6', 'boot', PLANT_TOE[0], PLANT_TOE[1], D);
  BOOT5 = no10Point(env, 'T5', 'boot', PLANT_TOE[0], PLANT_TOE[1], D);
  BOOT4 = no10Point(env, 'T4', 'boot', PLANT_TOE[0], PLANT_TOE[1], D);
  anchorsOk = true;
}

function buildDefenders() {
  defCache = DEFENDERS.map((d) => {
    const k = Math.round(((196 * d.s) / 95) * 20) / 20;
    const r = cachePuppet(d.kit, POSES[d.pose], k, d.facing);
    return { ...r, k };
  });
}

/** The look-away face (Glance G2: both irises to his left), from the SOLO/MERIDIAN GlanceFace strip or Glance. */
function resolveFace() {
  face = null;
  for (const name of ['GlanceFace', 'Glance']) {
    if (!hasAnim(name)) continue;
    const a = anim(name);
    const i = findFrame(a, 'G2');
    if (i >= 0 && a.frames[i].name === 'G2') {
      face = { a, i };
      return;
    }
  }
}

// ---------------------------------------------------------------- drawing helpers

/** Lamp head: a dark frame with a 4 x 5 grid of lamps on a pole (they ink to paper-white). */
function drawLamp(ctx: CanvasRenderingContext2D, x: number, y: number, k: number) {
  ctx.fillStyle = '#1b1830';
  ctx.fillRect(x - 1.5 * k, y + 14 * k, 3 * k, 90 * k);
  ctx.fillStyle = '#2b2746';
  ctx.fillRect(x - 18 * k, y - 14 * k, 36 * k, 28 * k);
  ctx.fillStyle = '#fffbe8';
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) ctx.fillRect(x + (-15 + c * 7) * k, y + (-11 + r * 6) * k, 5 * k, 4 * k);
}

/**
 * The environment (world transform applied): night sky, floodlights, the far stands, the turf in one-point perspective
 * toward the vanishing point, the defenders' line, tufts in his plane. `pure` = the freeze's pure ink-and-paper page.
 */
function drawEnvironment(env: Env, c: Cam, t: number, pure: boolean, defenders = true) {
  const ctx = env.ctx;
  const st = env.art.stadium;
  const hw = VW / (2 * c.z) + 60, hv = VH / (2 * c.z) + 60;
  const L = c.x - hw, R = c.x + hw, T = c.y - hv, B = c.y + hv;
  const hz = horizon(c);
  const vx = vpx(c);
  const KS = 0.9; // crowd art -> world
  const crowdTop = hz - 110 * KS;
  const sB = (B - hz) / Math.max(1, c.hh);

  if (pure) {
    // The freeze page: paper, one ink band for the stands, ink perspective lines on the paper turf.
    ctx.fillStyle = HEX.paper;
    ctx.fillRect(L, T, R - L, B - T);
    ctx.fillStyle = HEX.ink;
    ctx.fillRect(L, crowdTop + 8, R - L, hz - crowdTop - 8);
    ctx.fillRect(L, hz, R - L, 2);
    ctx.strokeStyle = HEX.ink;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    for (let X = -2400; X < 3400; X += 120) {
      const [bx, by] = ground(c, X, sB);
      ctx.moveTo(vx, hz);
      ctx.lineTo(bx, by);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  } else {
    // Sky (inks to near-black).
    const sky = ctx.createLinearGradient(0, T, 0, crowdTop);
    sky.addColorStop(0, '#07050f');
    sky.addColorStop(1, '#1d1436');
    ctx.fillStyle = sky;
    ctx.fillRect(L, T, R - L, crowdTop - T + 2);
    // Floodlights (paper-white once inked), parallax with the far layer.
    for (const lx of [-260, 300, 860, 1420]) {
      const [x] = ground(c, lx, 0.06);
      if (x < L - 80 || x > R + 80) continue;
      const y = crowdTop - 70;
      drawLamp(ctx, x, y, 1.15);
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf([255, 250, 225]), x, y, 70, 0.4);
      drawGlow(ctx, glowOf([255, 255, 255]), x, y, 24, 0.8);
      ctx.globalCompositeOperation = 'source-over';
    }
    // Roof edge and the far stands (crowd art with its LED boards on the horizon).
    ctx.fillStyle = '#07050f';
    ctx.fillRect(L, crowdTop - 10, R - L, 12);
    const [cx0] = ground(c, -900, 0.05);
    ctx.imageSmoothingEnabled = false;
    const cw = st.crowd.width * KS;
    let x0 = cx0;
    while (x0 > L) x0 -= cw;
    for (let x = x0; x < R; x += cw) ctx.drawImage(st.crowd, x, crowdTop, cw, 110 * KS);
    // The stands sink toward ink (the crowd keeps a faint speckle; the LED boards stay readable), deeper as the
    // camera rises to his face so the reveal reads against a quiet ground.
    ctx.fillStyle = `rgba(8,6,18,${(0.55 + 0.25 * clamp((c.hh - HH0) / (HH_FACE - HH0))).toFixed(3)})`;
    ctx.fillRect(L, crowdTop - 10, R - L, 98 * KS + 10);
    // Camera flashes twinkling in the stands (ink to paper specks).
    ctx.globalCompositeOperation = 'lighter';
    for (const f of st.flashes) {
      const ph = (t * 0.9 + f.t) % 3.2;
      if (ph > 0.12) continue;
      const x = x0 + (f.x % 1600) * KS, y = crowdTop + f.y * KS;
      if (x < L || x > R) continue;
      drawGlow(ctx, glowOf([255, 255, 255]), x, y, 5, 1 - ph / 0.12);
    }
    ctx.globalCompositeOperation = 'source-over';
    // Turf: pale floodlit grass (inks to paper-grey), a little darker toward the horizon.
    const g = ctx.createLinearGradient(0, hz, 0, Math.max(hz + 4, GY + 40));
    g.addColorStop(0, '#5f9468');
    g.addColorStop(1, '#8ac593');
    ctx.fillStyle = g;
    ctx.fillRect(L, hz, R - L, B - hz);
    // Mowing stripes converging on the vanishing point.
    ctx.fillStyle = 'rgba(30,70,40,0.22)';
    ctx.beginPath();
    for (let X = -2400; X < 3400; X += 240) {
      const [ax, ay] = ground(c, X, sB), [bx] = ground(c, X + 120, sB);
      ctx.moveTo(vx, hz);
      ctx.lineTo(ax, ay);
      ctx.lineTo(bx, ay);
      ctx.closePath();
    }
    ctx.fill();
    // Far touchline and a floodlit haze over the far turf.
    const [, ty] = ground(c, 0, 0.07);
    ctx.fillStyle = 'rgba(235,240,230,0.7)';
    ctx.fillRect(L, ty, R - L, Math.max(1, 1.3 / c.z));
    const hzg = ctx.createLinearGradient(0, hz, 0, hz + c.hh * 0.3 + 2);
    hzg.addColorStop(0, 'rgba(200,215,200,0.45)');
    hzg.addColorStop(1, 'rgba(200,215,200,0)');
    ctx.fillStyle = hzg;
    ctx.fillRect(L, hz, R - L, c.hh * 0.3 + 2);
  }

  // The defenders' line, small and deep (white kits ink to paper figures).
  DEFENDERS.forEach((d, i) => {
    const p = defCache[i];
    if (!p || !defenders) return;
    const [x, y] = ground(c, d.X, d.s);
    const sc = (196 * d.s) / (95 * p.k);
    const hipY = y - 40 * p.k * sc;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(p.cv, x - p.ox * sc, hipY - p.oy * sc, p.cv.width * sc, p.cv.height * sc);
  });

  // Tufts in his plane (ink).
  ctx.strokeStyle = pure ? HEX.ink : '#1f4a2a';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const r = new Rng(3031);
  for (let i = 0; i < 70; i++) {
    const X = r.range(-200, 1200), h = r.range(3, 8), lean = r.range(-0.4, 0.8), dy = r.range(0, 4);
    if (X < L || X > R) continue;
    for (let k = 0; k < 3; k++) {
      ctx.moveTo(X + k * 3, GY + 1 + dy);
      ctx.lineTo(X + k * 3 + lean * h + (k - 1) * 2, GY + 1 + dy - h * (k === 1 ? 1.3 : 1));
    }
  }
  ctx.stroke();
}

/** The out-of-focus foreground blades along the bottom edge (screen space); they sink away as the camera rises. */
function drawForeground(env: Env, c: Cam) {
  const sink = (c.hh - HH0) * c.z * 1.4;
  if (sink > 60) return;
  drawGrassFore(env.ctx, c.x * c.z * 1.3, 0, { y: VH + sink });
}

interface WPt {
  x: number;
  y: number;
  w: number;
}

/** A tapered thread (ink under-stroke, emerald halo, jade body, pearl core), widths per point (depth). */
function taperThread(ctx: CanvasRenderingContext2D, pts: readonly WPt[], alpha = 1) {
  if (pts.length < 2 || alpha <= 0) return;
  // Runs of segments that share a (rounded) width, each stroked as one path.
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

/** The thread from the boot's strike point along the ball's track to the ball's trailing edge (world). */
function threadPoints(c: Cam, t: number): WPt[] {
  const ub = trackU(t);
  if (ub <= 0) return [];
  const pts: WPt[] = [{ x: BOOT6[0], y: BOOT6[1], w: 3 }];
  const n = 48;
  for (let i = 0; i <= n; i++) {
    const [x, y, s] = ballOnTrack(c, (ub * i) / n);
    pts.push({ x, y, w: Math.max(1, 3 * s) });
  }
  // End at the ball's trailing edge.
  const b = pts[pts.length - 1], a = pts[Math.max(0, pts.length - 4)];
  const [, , s] = ballOnTrack(c, ub);
  const r = BALL_R * D * s;
  const dl = Math.hypot(b.x - a.x, b.y - a.y);
  if (dl > 1e-3) pts[pts.length - 1] = { x: b.x - ((b.x - a.x) / dl) * r * 0.8, y: b.y - ((b.y - a.y) / dl) * r * 0.8, w: b.w };
  // The pluck: the freshly unspooled thread quivers (a standing wave between boot and ball), decaying.
  const amp = 2.4 * Math.exp(-(t - RELEASE) / 0.16);
  if (amp > 0.05) {
    const pl = pluckLine(pts, { amp, phase: (t - RELEASE) * 75, nodes: 1 });
    return pl.map((p, i) => ({ x: p.x, y: p.y, w: pts[i].w }));
  }
  return pts;
}

/** The chalk diagram's arrow path (screen space), from the ball out to the right, bending right (toward the camera). */
function arrowPath(bx: number, by: number): TrailPt[] {
  const p0 = [bx + 22, by - 6], p1 = [bx + 120, by - 64], p2 = [bx + 205, by - 52], p3 = [bx + 236, by + 6];
  const out: TrailPt[] = [];
  for (let i = 0; i <= 40; i++) {
    const u = i / 40, a = 1 - u;
    out.push({
      x: a * a * a * p0[0] + 3 * a * a * u * p1[0] + 3 * a * u * u * p2[0] + u * u * u * p3[0],
      y: a * a * a * p0[1] + 3 * a * a * u * p1[1] + 3 * a * u * u * p2[1] + u * u * u * p3[1],
    });
  }
  return out;
}

/** The dotted ink chalk arrow (paper-backed dots so it reads on the ink stands), drawn on by `k` 0..1. */
function drawChalkArrow(ctx: CanvasRenderingContext2D, pts: TrailPt[], k: number, alpha: number) {
  if (k <= 0 || alpha <= 0) return;
  const s = [0];
  for (let i = 1; i < pts.length; i++) s.push(s[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  const L = s[s.length - 1] * k;
  const at = (d: number): [number, number, number] => {
    let i = 1;
    while (i < pts.length - 1 && s[i] < d) i++;
    const u = clamp((d - s[i - 1]) / Math.max(1e-6, s[i] - s[i - 1]));
    return [lerp(pts[i - 1].x, pts[i].x, u), lerp(pts[i - 1].y, pts[i].y, u), Math.atan2(pts[i].y - pts[i - 1].y, pts[i].x - pts[i - 1].x)];
  };
  ctx.save();
  ctx.globalAlpha = clamp(alpha);
  for (const [col, sz] of [[HEX.paper, 5], [HEX.ink, 3]] as const) {
    ctx.fillStyle = col;
    for (let d = 0; d < L - 6; d += 8) {
      const [x, y] = at(d);
      ctx.fillRect(Math.round(x - sz / 2), Math.round(y - sz / 2), sz, sz);
    }
  }
  // Arrowhead (once the line has arrived).
  if (k > 0.92) {
    const [x, y, a] = at(L);
    const head = (pad: number, col: string) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * (4 + pad), y + Math.sin(a) * (4 + pad));
      ctx.lineTo(x + Math.cos(a + 2.5) * (12 + pad), y + Math.sin(a + 2.5) * (12 + pad));
      ctx.lineTo(x + Math.cos(a - 2.5) * (12 + pad), y + Math.sin(a - 2.5) * (12 + pad));
      ctx.closePath();
      ctx.fill();
    };
    head(2.5, HEX.paper);
    head(0, HEX.ink);
  }
  ctx.restore();
}

/** The note beside the boot: a paper caption box (ink border, jade underline) with a leader to the outside of the boot. */
function drawNote(ctx: CanvasRenderingContext2D, bx: number, by: number, a: number) {
  if (a <= 0) return;
  const w = 168, h = 18;
  const x = Math.round(bx - w - 34), y = Math.round(by + 34);
  ctx.save();
  ctx.globalAlpha = clamp(a);
  ctx.strokeStyle = HEX.ink;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + w, y + 4);
  ctx.lineTo(bx - 6, by + 6);
  ctx.stroke();
  ctx.fillStyle = HEX.ink;
  ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
  ctx.fillRect(x + 2, y + 2, w, h);
  ctx.fillStyle = HEX.paper;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = HEX.jade;
  ctx.fillRect(x, y + h - 2, w, 2);
  pixelText(ctx, 'OUTSIDE OF THE BOOT', x + w / 2, y + 3, 10, HEX.ink, 'center', HEX.paper);
  ctx.restore();
}

/** The inset's content: ink, paper speed lines toward his look, the face crop (G2: eyes away) at x4, eye-dart lines. */
function drawInsetFace(env: Env, ctx: CanvasRenderingContext2D, t: number) {
  ctx.fillStyle = HEX.ink;
  ctx.fillRect(0, 0, 320, 200);
  const r = new Rng(3051);
  ctx.strokeStyle = HEX.paper;
  for (let i = 0; i < 18; i++) {
    const y = r.range(30, 140), x = r.range(20, 300) + (t - HIT) * 300 * r.range(0.6, 1.2);
    const len = r.range(30, 90);
    ctx.globalAlpha = r.range(0.15, 0.4);
    ctx.lineWidth = r.next() < 0.3 ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo((x % 320) - len, y);
    ctx.lineTo(x % 320, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // The eyes land on (cx, cy), on the crop's pixel grid.
  const cx = 116, cy = 82;
  if (face) {
    const [ex, ey] = face.a.anchorOf(face.i, 'eye');
    drawAnim(ctx, face.a, null, face.i, Math.round(cx - ex * FACE_SCALE) + ex * FACE_SCALE, Math.round(cy - ey * FACE_SCALE) + ey * FACE_SCALE, FACE_SCALE, { pivot: [ex, ey] });
  } else drawNo10(env, 'G2', cx, cy, FACE_SCALE, { anchor: 'eye' });
  // Eye-dart lines to his left (screen-right): he is looking far away, not at the ball.
  const k = ease.outCubic(clamp((t - HIT - 2 / 60) / 0.08));
  ctx.save();
  ctx.strokeStyle = HEX.paper;
  ctx.lineCap = 'round';
  for (const [dy, len, w] of [[-12, 26, 2], [0, 38, 3], [12, 24, 2]] as const) {
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(cx + 98, cy + dy * 0.8 - 2);
    ctx.lineTo(cx + 98 + len * k, cy + dy * 1.3 - 2 - len * k * 0.3);
    ctx.stroke();
  }
  ctx.restore();
}

/** Shot 4's opening page under the wipe: panel 1's interior, an inked low side view (drawn before the grade). */
function drawPagePreviewEnv(env: Env, t: number) {
  const ctx = env.ctx;
  const P = PAGE.panels[0].poly;
  ctx.save();
  ctx.beginPath();
  P.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.clip();
  // Panel camera: a low locked side view at ball height (logical px = panel px at t = 0 of shot 4).
  const pc: Cam = { x: 320, y: 180, z: 1, hh: 18 };
  ctx.save();
  ctx.translate(0, -70);
  drawEnvironment(env, pc, t, false, false);
  ctx.restore();
  drawGrassFore(ctx, 0, 0, { y: VH });
  ctx.restore();
}

/** Shot 4's page paper, gutters and panel borders (MangaPage's look at t = 0), over everything above the wipe. */
function pagePreviewPaper(ctx: CanvasRenderingContext2D) {
  const P = PAGE.panels[0].poly;
  ctx.save();
  ctx.beginPath();
  ctx.rect(-10, -10, VW + 20, VH + 20);
  P.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fillStyle = HEX.paper;
  ctx.fill('evenodd');
  ctx.lineJoin = 'miter';
  for (const pass of [0, 1])
    for (const p of PAGE.panels) {
      ctx.beginPath();
      p.poly.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.strokeStyle = pass === 0 ? HEX.paper : HEX.ink;
      ctx.lineWidth = pass === 0 ? 9 : 3;
      ctx.stroke();
    }
  ctx.restore();
}

// ---------------------------------------------------------------- the shot

export const shotOutside: Shot = {
  name: 'Outside of the boot',
  dur: DUR,
  seed: 403,
  rate: (t) => warp(t, STOPS),
  cues: [
    // A low stadium bed so the hit has ambience to dip (gain only, via the shared crowd bus).
    { at: 0, fn: (env) => env.sfx.crowd(1.7, 0.16) },
    { at: PLANT, fn: (env) => (env.sfx.kick(0.2), env.sfx.crack(0.15)) },
    { at: SWING, fn: (env) => env.sfx.whoosh(0.18, 300, 1800, 0.4) },
    // HIT: a dry kick + the long low D3 (the motif's root) + the ambience dips for the hit-stop.
    { at: HIT, fn: (env) => (env.sfx.kick(0.9), env.sfx.pluck(N.D3, 1.6), env.sfx.duck(0.6, 0.25)) },
    { at: RELEASE, fn: (env) => (env.sfx.zip(0.6), env.sfx.whoosh(0.4)) },
    { at: WINK, fn: (env) => env.sfx.shing(0.9) },
    { at: WIPE0, fn: (env) => env.sfx.zip(0.2) },
  ],
  prepare(env) {
    prepareInk(env.ctx);
    prepareGrassFore();
    buildDefenders();
    resolveFace();
    resolveAnchors(env);
  },
  init(env) {
    env.sfx.clearBus();
    spin = new BallSpin();
    planted = struck = released = false;
    if (!anchorsOk) resolveAnchors(env);
    if (!defCache.length) buildDefenders();
    if (!face) resolveFace();
    prevBall = ballPreX(0);
    const c = camAt(0);
    env.cam.set(c.x, c.y, c.z, 0);
    env.cam.shakeAmp = 6;
    env.cam.shakeRoll = 0; // no camera roll in this move
  },
  update(env, t, dt) {
    const { rng, parts, cam } = env;
    const c = camAt(t);
    cam.set(c.x, c.y, c.z, 0);
    // The ball: rolling forward (texture turns with distance) until the strike; sidespin + roll after it.
    if (t < RELEASE) {
      const x = ballPreX(t);
      spin.rotate(0, 0, 1, (x - prevBall) / (BALL_R * D));
      prevBall = x;
    } else {
      spin.rotate(0, 1, 0, -14 * dt);
      spin.rotate(0, 0, 1, 9 * dt);
    }
    if (!planted && t >= PLANT) {
      planted = true;
      // dustBurst(6) at the plant, as manga dust: paper puffs greying out (the ink ramp), over the inked turf.
      const n0 = parts.list.length;
      dustBurst(env, PLANT_TOE[0] - 8, GY - 2, 6, 0.55, 0.8);
      for (let i = n0; i < parts.list.length; i++) {
        const p = parts.list[i];
        p.ramp = 'ink';
        p.r0 = 0.12;
        p.r1 = 0.55;
        p.a0 = 0.42;
        p.max *= 0.55;
      }
      cam.hit(0.12);
    }
    if (!struck && t >= HIT) {
      struck = true;
      cam.hit(0.18);
      // A few ink flecks and jade motes off the contact (no burst, no ring): they fade within ~20 px.
      for (let i = 0; i < 10; i++) {
        const ink = i % 2 === 0;
        const a = rng.range(-2.6, -0.4);
        const sp = rng.range(40, 120);
        parts.spawn({
          kind: PK.Pixel, x: BOOT6[0] + 4, y: BOOT6[1] + rng.range(-6, 6), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 6,
          max: rng.range(0.16, 0.3), s0: rng.range(1.5, 2.6), s1: 1, ramp: ink ? 'ink' : 'jade', r0: ink ? 0.7 : 0.15, r1: ink ? 1 : 0.7,
          add: !ink, layer: 1,
        });
      }
    }
    if (!released && t >= RELEASE) {
      released = true;
      // Turf flecks flicked off the spin (inked).
      for (let i = 0; i < 4; i++) {
        const a = rng.range(-2.4, -1.2);
        const sp = rng.range(60, 160);
        parts.spawn({
          kind: PK.Pixel, x: REST[0] + rng.range(-4, 4), y: GY - 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, ay: 600, drag: 1,
          max: rng.range(0.3, 0.5), s0: rng.range(1.5, 2.5), s1: 1.5, ramp: 'grass', r0: rng.next(), r1: 0.8, a0: 1, a1: 0.6, add: false, layer: 0,
        });
      }
    }
    // Jade motes shed by the ball while it is near (fade within ~20 px).
    if (t >= RELEASE && t < RELEASE + 0.18) {
      const [bx, by, s] = ballOnTrack(c, trackU(t));
      parts.spawn({
        kind: PK.Pixel, x: bx - rng.range(4, 12) * s, y: by + rng.range(-4, 4) * s, vx: rng.range(-50, -10), vy: rng.range(-20, 10), drag: 7,
        max: rng.range(0.1, 0.2), s0: rng.range(1.2, 2.2) * Math.max(0.5, s), s1: 0.6, ramp: 'jade', r0: 0.1, r1: 0.7, add: true, layer: 1,
      });
    }
  },
  render(env, t) {
    const { ctx, fx } = env;
    const c = camAt(t);
    const ff = freezeFrame(t);
    const pure = ff >= 0 && ff < 4;
    const wipeY = t < WIPE0 ? -1 : t < WIPE0 + WIPE_ACROSS ? 5 : lerp(5, VH + 8, ease.inCubic(clamp((t - WIPE0 - WIPE_ACROSS) / (DUR - WIPE0 - WIPE_ACROSS))));
    const toScreen = (x: number, y: number): [number, number] => {
      const [u, v] = env.cam.toUV(x, y);
      return [u * VW, v * VH];
    };

    // ---- environment (inked)
    env.world();
    drawEnvironment(env, c, t, pure);
    env.parts.draw(ctx, 0);
    env.screen();
    if (!pure) drawForeground(env, c);
    // Shot 4's page under the wipe (its panel 1 environment, graded with this frame).
    if (wipeY > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, VW, wipeY);
      ctx.clip();
      drawPagePreviewEnv(env, t);
      ctx.restore();
    }
    // The ink page: 0.9; the freeze: pure ink and paper with doubled tone for 3 frames, the negative on the 4th.
    inkGrade(ctx, pure ? 1 : 0.9, undefined, pure ? { tone: 2 } : {});
    const [bsx, bsy] = toScreen(BOOT6[0], BOOT6[1]);
    // Ink focus lines on the boot through the freeze (a fixed pattern: a freeze never flickers).
    if (ff >= 0) focusLines(ctx, new Rng(3061), bsx + 6, bsy, 70 * c.z, 760, 54, HEX.ink, pure ? 0.55 : 0.32, 3);
    if (ff === 3) inkNegative(ctx);

    // ---- colour layer: thread, No.10, ball, marks
    env.world();
    const h = heroAt(t);
    // Contact shadow (ink, soft).
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = HEX.ink;
    ctx.beginPath();
    const shx = h.key === 'AP3' ? h.x : h.key === 'AP1' ? h.x + 8 : h.x - 14;
    ctx.ellipse(shx, GY + 1, h.key === 'AP3' ? 44 : 58, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // The swing's ink smear (T4 -> T5 -> T6 boot), held through the freeze and gone by the follow-through.
    if (t >= SWING && t < FOLLOW + 0.04) {
      const to = t < HIT ? BOOT5 : BOOT6;
      const path: TrailPt[] = [];
      const via: [number, number] = [lerp(BOOT4[0], to[0], 0.5) + 6, lerp(BOOT4[1], to[1], 0.5) + 16];
      for (let i = 0; i <= 18; i++) {
        const u = i / 18, a = 1 - u;
        path.push({ x: a * a * BOOT4[0] + 2 * a * u * via[0] + u * u * to[0], y: a * a * BOOT4[1] + 2 * a * u * via[1] + u * u * to[1] });
      }
      const fade = t < RELEASE ? 1 : clamp(1 - (t - RELEASE) / 0.06);
      inkSmear(ctx, path, 22, 0.35 * fade, { lines: 3 });
    }
    // The thread (behind him and the ball).
    if (t >= RELEASE) taperThread(ctx, threadPoints(c, t));
    // No.10.
    if (h.key === 'T9b') {
      const a = hasAnim('Trivela') ? anim('Trivela') : null;
      const i = a ? findFrame(a, 'T9b') : -1;
      if (a && i >= 0 && a.frames[i].name === 'T9b') drawAnim(ctx, a, null, i, h.x, h.y, D);
      else drawNo10(env, 'T9', h.x, h.y, D);
    } else drawNo10(env, h.key, h.x, h.y, D, h.anchor ? { anchor: h.anchor } : {});
    // The ball: rolling ahead, on the boot through the freeze (over the sprite: nearer the camera), then away.
    if (t < RELEASE) {
      const bx = t < HIT ? ballPreX(t) : REST[0];
      const sq = t >= HIT ? { sx: 0.9, sy: 1.04, dent: 0.1 } : undefined;
      drawBall(env, spin, bx, REST[1], BALL_R, D, 0, t >= HIT ? 0.7 : 0, 'pearl', sq);
      // Technique diagram: two jade spin marks (clockwise from above: the near face slides left).
      if (t >= HIT) spinMarks(ctx, bx, REST[1], BALL_R * D + 2, -0.5 + (t - HIT) * 2, { squash: 0.5, dir: 1, len: 1.35, width: 6 });
    } else {
      const [bx, by, s] = ballOnTrack(c, trackU(t));
      const big = s >= 0.5;
      const r = big ? Math.max(2, Math.round(BALL_R * s)) : Math.max(2, Math.round(BALL_R * D * s));
      drawBall(env, spin, bx, by, r, big ? D : 1, 0, 0.8 * clamp(s * 1.4), 'pearl');
      spinMarks(ctx, bx, by, r * (big ? D : 1), t * 14, { squash: 0.42, dir: 1, len: 1.1, width: Math.max(1.5, 4 * s), alpha: clamp((s - 0.2) * 2) });
    }
    env.parts.draw(ctx, 1);

    // ---- screen-space overlays
    env.screen();
    // The chalk diagram and the note, for the freeze.
    if (ff >= 0) {
      const [ballSx, ballSy] = toScreen(REST[0], REST[1]);
      const k = ease.outCubic(clamp((t - HIT - 2 / 60) / 0.1));
      const out = clamp((RELEASE - t) / 0.03);
      drawChalkArrow(ctx, arrowPath(ballSx, ballSy), k, out);
      drawNote(ctx, bsx, bsy, clamp((t - HIT - 3 / 60) / 0.04) * out);
    }
    // "Eyes here, ball there": the inset drops in for the freeze, then is pulled back up.
    if (t >= HIT && t < RELEASE + 0.05) {
      const drop = lerp(-150, 0, ease.outBack(clamp((t - HIT) / (4 / 60))));
      const lift = -170 * ease.inQuad(clamp((t - RELEASE + 1 / 60) / 0.06));
      mangaPanels(ctx, [{ poly: INSET, dy: drop + lift, draw: (cx) => drawInsetFace(env, cx, t) }], t);
    }
    // The wink: a glint on the open eye and a small jade flare (T8b).
    if (t >= WINK && t < REVEAL1) {
      const [ex, ey] = no10Point(env, 'T8b', 'eye', PLANT_TOE[0], PLANT_TOE[1], D);
      const [sx, sy] = toScreen(ex, ey);
      const g = pulse(t, WINK, 0.32);
      sparkle(ctx, sx + 2, sy - 2, 8 + 12 * g, ease.outCubic(g) + 0.25, 0.3);
      lensFlare(ctx, sx + 2, sy - 2, 34, 0.5 * g, JADE_FLARE);
    }
    // ---- the thread wipe: the needle sews a taut thread across the top edge, then pulls it down like a blind cord.
    if (wipeY > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, VW, wipeY);
      ctx.clip();
      pagePreviewPaper(ctx);
      ctx.restore();
      const across = clamp((t - WIPE0) / WIPE_ACROSS);
      const nx = lerp(-12, VW + 30, ease.inOutQuad(across));
      const v = Math.floor(t * 60) % 2 ? 1 : -1;
      const y = Math.round(wipeY) + 0.5 * v;
      const x1 = Math.min(VW + 4, nx - 6);
      if (x1 > -4) taperThread(ctx, [{ x: -4, y, w: 2.5 }, { x: x1, y, w: 2.5 }]);
      if (across < 1) needlePoint(ctx, nx, y, 0, 1, 26);
    }

    // ---- post
    meridianGrade(fx, true);
    fx.vignette = 0.32;
    fx.ca = 0.003 * pulse(t, HIT, 0.1);
    // Opens out of shot 2's paper flash (3-frame flash-out).
    paperFlash(fx, 0.6 * (1 - clamp(t / (3 / 60))));
  },
};
