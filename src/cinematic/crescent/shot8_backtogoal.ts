// SHOT 8 — BACK TO GOAL: front view, the finishing pose of CRIMSON CRESCENT.
// No.10 drops out of his flip into the foreground and lands facing the camera, back to goal:
// squash and stretch, a crescent-shaped crack in the turf, a dust ring, the world settling
// upright. Behind him the crimson comet dives into the top corner: the net bulges and ripples,
// and a crescent of crimson light bursts out of the corner and wraps around him, back-lighting
// him into a dark figure with a crimson and silver rim. He never turns around.
// GOAL! slams in above him, confetti, crowd flashes, then the name card and a fade to dark.

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { Rng, TAU, clamp, ease, keys, lerp, ramp, type RGB } from '../../engine/math';
import { PK, RAMPS, drawGlow, glowOf, glowSprite, type RampName } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { focusLines, lensFlare, makeCracks, pixelText, sparkle, speedStreaks, TITLE_FONT } from '../../art/fx';
import { KEEPER_KIT, P, POSES, drawPuppet, mixPose, renderPuppet } from '../../art/puppet';
import { crescentArc, crescentPath, drawBall, dustBurst, grassChunks, meteorFlames, pulse, warp } from './common';
import { drawPlace, fi, land, place, stand, type Place } from './hero';
import type { StudioAnim } from '../../art/studioAnim';

const DUR = 3.2;
const LAND = 0.26; // boots hit the turf
const KEEP_T = 0.86; // keeper crashes onto the turf just after the ball rips into the net
const B_T0 = 0.4; // the comet enters the frame
const NET = 0.62; // the ball rips into the net
const GOAL_T = 1.0;
const EYE_T = 1.72;
const CARD_T = 2.0;
const FADE = 0.35;
/** Time after impact from which the net ball is drawn behind the goal line (the keeper over it):
 *  once the burst glow has died down and before it drops to the keeper's height. */
const BALL_BACK = 1.0;
const STOPS: [number, number, number][] = [
  [LAND, 0.06, 0.25],
  [NET, 0.09, 0.08],
];

/** Simulated (hit-stop warped) time for a local time t. */
function simTime(t: number) {
  let s = t;
  for (const [a, l, r] of STOPS) s -= (1 - r) * clamp(t - a, 0, l);
  return s;
}
const S_LAND = simTime(LAND);
const S_KEEP = simTime(KEEP_T);
const S_B0 = simTime(B_T0);
const S_NET = simTime(NET);

// Hero in the foreground: the drawn Land frames (front view, back to goal, facing the lens) then
// Stand Front a/b, at the shot's sprite scale (98 px tall, as the old sprite: same framing).
const SC = 2.4;
const FEET_X = 304, FEET_Y = 340;
const FALL_Y0 = 92; // feet at the cut: shins and boots hanging in from the top of frame
// L1 drop (falling, toes pointing down) -> L2 impact on LAND (through the land hit-stop) -> L3 absorb
// (the deepest squash) -> L4 rebound -> Stand Front a/b alternating every 0.3 s (panting). Library 3.6.
const LAND_KEYS: [number, string][] = [[0, 'L1'], [LAND, 'L2'], [0.33, 'L3'], [0.47, 'L4']];
const STAND_T = 0.62, PANT = 0.3;
/** Eye whites (frame px centres) of the Stand frames, for the glint. */
const EYES: Record<string, [number, number][]> = { a: [[59.5, 27.5], [71, 27.5]], b: [[59.5, 26.5], [71, 26.5]] };
/** Hair colours of the studio palette (dark, highlight, deepest, indigo): the crimson hair sheen. */
const HAIR_RGB = new Set(['54,34,74', '40,60,160', '25,28,90', '47,44,110']);

// Ground perspective: horizon at camera height; the hero stands 4.7 m from the lens.
const HZ = 199;
const gy = (d: number) => HZ + ((FEET_Y - HZ) * 4.7) / d;

// Goal (11 m behind him): posts, crossbar, goal line.
const GL = 163, GR = 477, GT = 136, GB = Math.round(gy(15.7));
// Net mesh (rest plane), projected toward the vanishing point when pushed back.
const COLS = 26, ROWS = 9;
const NX0 = GL + 4, NX1 = GR - 4, NY0 = GT + 4, NY1 = GB - 4;
const VPX = 320, VPY = HZ, F = 260;
// Where the ball strikes the net (top corner, over his left shoulder).
const IPX = 446, IPY = 156;
// Comet path into the corner (screen): off his kick, arcing over and away into the top corner
// on a crescent curve (it starts ball-sized for his distance and shrinks into the goal).
const BP0: [number, number] = [600, -60], BPC: [number, number] = [650, 104];
// His head (screen, standing): the sweeping crescent dims while its arc crosses it.
const HEAD_X = 304, HEAD_Y = 140;

// The crescent of light: it bursts out of the corner as a crescent wave, sweeps behind him
// (back-lighting him as it passes) and settles as a crescent halo framing his left side,
// leaving the net corner (the ball) in clear view.
const HCX = 300, HCY = 232, H_R = 182, H_MID = 3.22, H_SPAN = 2.0;

// Moon / lights.
const MOON_X = 92, MOON_Y = 40, MOON_R = 20;
const LAMPS: [number, number][] = [[34, 8], [606, 8]];

// Keeper: picked up where shot 7 leaves him, low across the goal mouth and already dropping
// (one glove still stretched at the corner, the other arm trailing), so the overlap reads as a
// new angle, not a rewind. He is still falling when the ball rips in, then crashes down and lies
// beaten, short of the bottom corner (the ball comes to rest there, clear of him).
const KEEP_X0 = 372, KEEP_Y0 = 196, KEEP_XN = 388, KEEP_YN = 208, KEEP_X1 = 392, KEEP_Y1 = 229;
const D = Math.PI / 180;
const KEEP_AIR0 = P({ ...POSES.gkDive, spin: 1.3, armN: 206 * D, armF: 84 * D, elbowF: 40 * D, kneeF: 56 * D });
const KEEP_AIR = P({ ...POSES.gkDive, spin: 1.42, armN: 200 * D, armF: 96 * D, elbowF: 36 * D, kneeF: 64 * D });
const KEEP_FALL = P({ ...POSES.gkDive, spin: 1.5, armN: 150 * D, armF: 120 * D, elbowF: 20 * D, kneeF: 70 * D });
const KEEP_LIE = P({ ...POSES.gkDive, spin: 1.62, armN: 150 * D, armF: -95 * D, elbowF: -25 * D, elbowN: 20 * D, thighN: 6 * D, kneeN: 30 * D, thighF: -6 * D, kneeF: 50 * D, head: 6 * D });

let spin = new BallSpin();
let landed = false, keeperDown = false, netHit = false, goalDone = false;
let z = new Float32Array(0);
let vz = new Float32Array(0);
let brokenH = new Uint8Array(0);
let brokenV = new Uint8Array(0);
let cracks: ReturnType<typeof makeCracks> = [];
// Derived art per hero frame (cached once, deterministic): pixel rims and the hair mask.
interface FrameArt {
  rimR2: HTMLCanvasElement;
  rimL1: HTMLCanvasElement;
  rimTop2: HTMLCanvasElement;
  hairRed: HTMLCanvasElement;
  /** The three rim masks pre-composited per back-light level (one draw instead of three per pass). */
  rimOver: HTMLCanvasElement[];
  rimAdd: HTMLCanvasElement[];
}
const RIM_STEPS = 20;
const frameArt = new Map<string, FrameArt>();
// The hero placement for this render (set before drawing hero layers).
let hp8: Place | null = null;
let hfy = FEET_Y;

const idx = (i: number, j: number) => j * (COLS + 1) + i;
const restX = (i: number) => lerp(NX0, NX1, i / COLS);
const restY = (j: number) => lerp(NY0, NY1, j / ROWS);
const proj = (x: number, y: number, zz: number): [number, number, number] => {
  const s = F / (F + Math.max(zz, -F * 0.4));
  return [VPX + (x - VPX) * s, VPY + (y - VPY) * s, s];
};

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

/** The hero frame on screen at time t: Land L1-L4, then Stand Front a/b panting. */
function heroFrame(t: number): { a: StudioAnim; i: number } {
  if (t < STAND_T) {
    const a = land();
    let n = LAND_KEYS[0][1];
    for (const [k, name] of LAND_KEYS) if (t >= k - 1e-6) n = name;
    return { a, i: fi(a, n) };
  }
  const a = stand();
  return { a, i: fi(a, Math.floor((t - STAND_T) / PANT + 1e-6) % 2 ? 'b' : 'a') };
}

/** Pixel rim: frame edge pixels on the side where (x - dx, y - dy) is empty, tinted. */
function rimMask(a: StudioAnim, i: number, c: RGB, dx: number, dy: number) {
  const cv = canvas(a.w, a.h);
  const g = cv.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  g.drawImage(a.tinted(i, c), 0, 0);
  g.globalCompositeOperation = 'destination-out';
  g.drawImage(a.frames[i].img, dx, dy);
  return cv;
}

/** The frame's hair (navy mop above the brow line) as a crimson mask, for the hair sheen. */
function hairMask(a: StudioAnim, i: number) {
  const f = a.frames[i];
  const lim = (f.anchors.head ? f.anchors.head[1] : 16) + 10;
  const cv = canvas(a.w, a.h);
  const g = cv.getContext('2d')!;
  const im = g.createImageData(a.w, a.h);
  for (let y = 0; y < Math.min(a.h, lim); y++)
    for (let x = 0; x < a.w; x++) {
      const k = (y * a.w + x) * 4;
      if (!f.px[k + 3] || !HAIR_RGB.has(`${f.px[k]},${f.px[k + 1]},${f.px[k + 2]}`)) continue;
      im.data[k] = 235;
      im.data[k + 1] = 40;
      im.data[k + 2] = 80;
      im.data[k + 3] = 255;
    }
  g.putImageData(im, 0, 0);
  return cv;
}

function artOf(a: StudioAnim, i: number): FrameArt {
  const key = `${a.name}|${i}`;
  let fa = frameArt.get(key);
  if (!fa) {
    fa = {
      rimR2: rimMask(a, i, [255, 70, 110], -2, 0),
      rimL1: rimMask(a, i, [255, 60, 100], 2, 0),
      rimTop2: rimMask(a, i, [236, 238, 255], 0, 2),
      hairRed: hairMask(a, i),
      rimOver: [],
      rimAdd: [],
    };
    frameArt.set(key, fa);
  }
  return fa;
}

/**
 * Rim set for back-light level bl: the silver top rim and the crimson side rims composited once
 * into one frame-sized canvas (source-over set, or the additive set), cached per frame and level.
 * Equivalent to drawing the three masks one after another with the same alphas.
 */
function rimSet(a: StudioAnim, i: number, bl: number, add: boolean): HTMLCanvasElement {
  const fa = artOf(a, i);
  const k = Math.round(clamp(bl) * RIM_STEPS);
  const cache = add ? fa.rimAdd : fa.rimOver;
  let cv = cache[k];
  if (!cv) {
    const b = k / RIM_STEPS;
    cv = canvas(a.w, a.h);
    const g = cv.getContext('2d')!;
    g.imageSmoothingEnabled = false;
    const layers: [HTMLCanvasElement, number][] = add
      ? [[fa.rimR2, 0.65 * b], [fa.rimL1, 0.45 * b], [fa.rimTop2, 0.18 + 0.12 * b]]
      : [[fa.rimTop2, 0.55 + 0.35 * b], [fa.rimR2, 0.2 + 0.8 * b], [fa.rimL1, 0.15 + 0.75 * b]];
    if (add) g.globalCompositeOperation = 'lighter';
    for (const [img, al] of layers) {
      if (al <= 0) continue;
      g.globalAlpha = clamp(al);
      g.drawImage(img, 0, 0);
    }
    cache[k] = cv;
  }
  return cv;
}

const CRATER_R = 122; // crater outer radius (unsquashed); its rim is squashed by CRATER_K
const CRATER_K = 0.27;

/**
 * Re-root the generic radial cracks on the crater's outer rim: each crack leaves the rim at the
 * angle it points along (folded into the back half, pi..2pi, so none run off the bottom of
 * the frame) and grows outward from there; branches follow their parent crack.
 * Points become offsets from (FEET_X, FEET_Y - 3).
 */
function anchorCracks(raw: ReturnType<typeof makeCracks>): ReturnType<typeof makeCracks> {
  const out: ReturnType<typeof makeCracks> = [];
  let ox = 0, oy = 0, flip = 1;
  for (const c of raw) {
    const isMain = c.pts[0][0] === 0 && c.pts[0][1] === 0;
    if (isMain) {
      const end = c.pts[c.pts.length - 1];
      let a = Math.atan2(end[1] / 0.22, end[0]);
      flip = Math.sin(a) > 0 ? -1 : 1;
      if (flip < 0) a = -a;
      // Keep clear of the horns' tips (they curl toward the lens at the sides).
      a = clamp(a < 0 ? a + TAU : a, Math.PI * 1.04, Math.PI * 1.96);
      ox = Math.cos(a) * (CRATER_R - 4);
      oy = Math.sin(a) * (CRATER_R - 4) * CRATER_K;
    }
    out.push({ at: c.at, pts: c.pts.map(([x, y]) => [ox + x * 0.6, oy + y * 0.6 * flip] as [number, number]) });
  }
  return out;
}

// ---------------------------------------------------------------- timing curves

function feetY(s: number) {
  // Already falling at speed on the cut (hard cut from shot 7), accelerating into the landing.
  if (s < S_LAND) {
    const k = clamp(s / S_LAND);
    return lerp(FALL_Y0, FEET_Y, 0.3 * k + 0.7 * k * k);
  }
  return FEET_Y;
}

/** Ball along the comet path (u 0..1) in screen space + its apparent radius. */
function cometAt(u: number): [number, number, number] {
  const q = 1 - Math.pow(1 - u, 1.5);
  const a = (1 - q) * (1 - q), b = 2 * (1 - q) * q, c = q * q;
  return [a * BP0[0] + b * BPC[0] + c * IPX, a * BP0[1] + b * BPC[1] + c * IPY, lerp(11, 4.6, q)];
}

/** Ball inside the net after impact (rest-plane x, y and push depth z). */
function ballNet(bt: number): [number, number, number] {
  let zz: number;
  if (bt < 0.2) zz = 92 * ease.outCubic(bt / 0.2);
  else if (bt < 0.7) zz = lerp(92, 70, ease.inOutQuad((bt - 0.2) / 0.5));
  else zz = lerp(70, 18, ease.inQuad(clamp((bt - 0.7) / 0.6)));
  // It drops out of the top corner and the net bag funnels it into the bottom corner by the right
  // post, clear of the beaten keeper.
  const drop = Math.max(0, bt - 0.62);
  const y = Math.min(NY1 - 8, IPY + 170 * drop * drop + 10 * drop);
  const x = IPX + 26 * ease.outQuad(clamp(drop / 0.8));
  return [x, y, zz];
}

/** Back-light strength from the burst. */
function backlight(bt: number) {
  if (bt <= 0) return 0;
  if (bt < 0.04) return bt / 0.04;
  return lerp(0.42, 1, Math.exp(-(bt - 0.04) * 2.6));
}

/** Crescent geometry at time bt after impact: a wave out of the corner settling into the halo. */
function haloGeo(bt: number) {
  const k = ease.outCubic(clamp(bt / 0.42));
  const cx = lerp(IPX, HCX, k), cy = lerp(IPY, HCY, k);
  const r = lerp(70, H_R, ease.outExpo(clamp(bt / 0.4))) + 3 * Math.sin(Math.max(0, bt - 0.5) * 2.2);
  const mid = lerp(Math.PI, H_MID, k) + Math.max(0, bt - 0.6) * 0.012;
  const span = lerp(2.6, H_SPAN, k);
  // A crescent from the first frame (never a solid disc).
  const th = Math.min(lerp(48, 26, clamp(bt / 0.6)) * (1 + 0.06 * Math.sin(bt * 7)), r * 0.45);
  return { cx, cy, r, a0: mid - span / 2, a1: mid + span / 2, th };
}

/** Crescent opacity: fades in out of the flare, settles to a steady glow. While the sweeping arc
 *  crosses his head (drawn behind him, only a horn would poke out of his hair) it dims way down
 *  and the shock crescents carry the motion. */
function haloAlpha(bt: number) {
  if (bt <= 0) return 0;
  let a = clamp(bt / 0.05) * lerp(0.56, 1, Math.exp(-bt * 2.4));
  if (bt < 0.42) {
    const g = haloGeo(bt);
    const gap = Math.abs(Math.hypot(g.cx - HEAD_X, g.cy - HEAD_Y) - g.r);
    const c = clamp((gap - 40) / 60);
    a *= lerp(0.06, 1, c * c * (3 - 2 * c));
  }
  return a;
}

// ---------------------------------------------------------------- local particle helpers

function sparksL(env: Env, x: number, y: number, n: number, speed: number, cone: number, dir: number, ramp: RampName, layer: number, grav = 200) {
  const rng = env.rng;
  for (let i = 0; i < n; i++) {
    const a = dir + rng.range(-cone / 2, cone / 2);
    const sp = speed * rng.range(0.3, 1);
    env.parts.spawn({
      kind: PK.Streak, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 3.5, ay: grav,
      max: rng.range(0.25, 0.7), s0: rng.range(1, 2.4), s1: 0.4, ramp, r0: 0, r1: 1, k: 1.2, layer,
    });
  }
}

function ringL(env: Env, x: number, y: number, r0: number, r1: number, dur: number, squashK: number, ramp: RampName, layer: number) {
  env.parts.spawn({ kind: PK.Ring, x, y, s0: r0, s1: r1, max: dur, k: squashK, ramp, r0: 0, r1: 0.9, a0: 1, a1: 0, layer });
}

// ---------------------------------------------------------------- drawing helpers

/** Draw the hero frame of this render (or a tinted copy / mask of it), offset (ox, oy) in world px. */
function drawHeroQ(env: Env, img: HTMLCanvasElement | null, ox: number, oy: number, alpha = 1) {
  if (alpha <= 0 || !hp8) return;
  drawPlace(env.ctx, hp8, img, clamp(alpha), 1, ox, oy);
}

/**
 * Place a Land / Stand frame: the planted frames stand on their contact (the centre between the boots,
 * soles on row 102) at the feet; L1 (falling, toes pointing down) hangs from its lowest toe row.
 */
function placeHero(a: StudioAnim, i: number, feetY: number): Place {
  const f = a.frames[i];
  if (f.contact) return place(a, i, FEET_X, feetY, SC, 0, false, true);
  const bottom = (f.anchors.toeL ? f.anchors.toeL[1] : 103) + 1; // bottom of the pointed toes
  return { a, i, x: FEET_X, y: feetY, s: SC, rot: 0, flip: false, piv: [f.pelvis[0] + 0.5, bottom] };
}

/**
 * A huge additive glow (same falloff as the cached glow sprites) as one radial-gradient fill,
 * clipped to the area around the screen instead of a sprite several times the screen's size.
 */
function bigGlow(ctx: CanvasRenderingContext2D, c: RGB, x: number, y: number, r: number, a: number) {
  if (r <= 0 || a <= 0) return;
  const x0 = Math.max(x - r, -90), y0 = Math.max(y - r, -90);
  const x1 = Math.min(x + r, VW + 90), y1 = Math.min(y + r, VH + 90);
  if (x1 <= x0 || y1 <= y0) return;
  const k = clamp(a);
  const rgb = `${c[0] | 0},${c[1] | 0},${c[2] | 0}`;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${k})`);
  g.addColorStop(0.18, `rgba(${rgb},${0.75 * k})`);
  g.addColorStop(0.45, `rgba(${rgb},${0.25 * k})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
}
const crimsonAt = (t: number) => ramp(RAMPS.crimson, Math.round(clamp(t) * 23) / 23);

/** Ribbon with per-point widths (perspective comet trail: wide near the lens). */
function taperRibbon(ctx: CanvasRenderingContext2D, pts: [number, number][], ws: number[], color: string, alpha: number) {
  const n = pts.length;
  if (n < 2 || alpha <= 0) return;
  ctx.globalAlpha = clamp(alpha);
  ctx.fillStyle = color;
  ctx.beginPath();
  const L: [number, number][] = [], R: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    dx /= l;
    dy /= l;
    const w = ws[i] * 0.5;
    L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]);
    R.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
  }
  ctx.moveTo(L[0][0], L[0][1]);
  for (let i = 1; i < n; i++) ctx.lineTo(L[i][0], L[i][1]);
  for (let i = n - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

/** Chrome title letters slammed in one by one (dark outer, crimson stroke, silver-white chrome fill). */
function chromeSlam(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, t: number, stagger: number, align: 'center' | 'left' = 'center') {
  if (t <= 0) return;
  ctx.save();
  ctx.font = `${size}px ${TITLE_FONT}`;
  ctx.textBaseline = 'alphabetic';
  const widths = [...text].map((c) => ctx.measureText(c).width + size * 0.02);
  const total = widths.reduce((a, b) => a + b, 0);
  let cx = align === 'left' ? x : x - total / 2;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const lt = t - i * stagger;
    const w = widths[i];
    if (lt > 0 && c !== ' ') {
      const p = clamp(lt / 0.16);
      const s = lerp(2.6, 1, ease.outCubic(p));
      ctx.save();
      ctx.translate(cx + w / 2, y);
      ctx.transform(1, 0, -0.2, 1, 0, 0);
      ctx.scale(s, s);
      ctx.globalAlpha = clamp(lt / 0.06);
      ctx.lineJoin = 'round';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#0a0618';
      ctx.lineWidth = size * 0.27;
      ctx.strokeText(c, 0, 0);
      ctx.strokeStyle = '#d4163f';
      ctx.lineWidth = size * 0.13;
      ctx.strokeText(c, 0, 0);
      const g = ctx.createLinearGradient(0, -size * 0.78, 0, 0);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.46, '#eef0ff');
      g.addColorStop(0.5, '#a7acdc');
      g.addColorStop(0.78, '#d3d6f4');
      g.addColorStop(1, '#ffe4ec');
      ctx.fillStyle = g;
      ctx.fillText(c, 0, 0);
      if (p < 1) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = (1 - p) * 0.8;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(c, 0, 0);
      }
      ctx.restore();
    }
    cx += w;
  }
  ctx.restore();
}

/** Soft light volume + crisp crescent band. */
function haloCrescent(ctx: CanvasRenderingContext2D, g: ReturnType<typeof haloGeo>, alpha: number) {
  if (alpha <= 0) return;
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i <= 12; i++) {
    const u = i / 12;
    const a = lerp(g.a0, g.a1, u);
    const w = Math.sin(Math.PI * u);
    const rr = g.r - g.th * 0.5 * w;
    drawGlow(ctx, glowSprite('crimson', 0.5), g.cx + Math.cos(a) * rr, g.cy + Math.sin(a) * rr, g.th * 2.4 * w + 10, alpha * 0.32 * w);
  }
  ctx.globalCompositeOperation = 'source-over';
  crescentArc(ctx, g.cx, g.cy, g.r, g.a0, g.a1, g.th, 1, alpha);
}

/** The ball inside the net: crimson heat glow, a dark halo while the burst is white-hot, the ball. */
function drawNetBall(env: Env, bt: number) {
  const ctx = env.ctx;
  const [bx, by, bz] = ballNet(bt);
  const [sx, sy, sc] = proj(bx, by, bz);
  const heat = clamp(1 - (bt - 0.5) / 1.2);
  const D2 = 1.2 * sc + 0.2;
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowSprite('crimson', 0.4), sx, sy, 40 * sc, 0.4 * heat);
  ctx.globalCompositeOperation = 'source-over';
  const dk = 0.55 * clamp(1 - bt / 0.6);
  if (dk > 0) {
    ctx.fillStyle = `rgba(24,4,18,${dk})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 4 * D2 * 1.5, 0, TAU);
    ctx.fill();
  }
  drawBall(env, spin, sx, sy, 4, D2, heat * 0.5, heat * 0.5, 'crimson');
}

export const shotBackToGoal: Shot = {
  name: 'Back to goal',
  dur: DUR,
  seed: 108,
  rate: (t) => warp(t, STOPS),
  cues: [
    { at: 0, fn: (e) => e.sfx.whoosh(0.3, 1800, 300, 0.4) },
    { at: LAND, fn: (e) => { e.sfx.kick(0.9); e.sfx.boom(0.55, 0.4); } },
    { at: B_T0, fn: (e) => e.sfx.whoosh(0.24, 700, 4200, 0.4) },
    { at: NET, fn: (e) => { e.sfx.boom(1.3, 0.6); e.sfx.crack(0.9); e.sfx.strain(0.5, 0.3); } },
    { at: KEEP_T, fn: (e) => e.sfx.kick(0.3) }, // keeper thuds down
    { at: NET + 0.12, fn: (e) => e.sfx.crackle(1.4, 0.18) },
    { at: GOAL_T, fn: (e) => { e.sfx.crowd(2.2, 0.6); e.sfx.stinger(); } },
    // A second crowd layer swells in under the name card (the field result picks the cheer up).
    { at: GOAL_T + 0.35, fn: (e) => e.sfx.crowd(1.85, 0.4) },
    { at: GOAL_T + 0.16, fn: (e) => e.sfx.whistle() },
    { at: GOAL_T + 0.42, fn: (e) => e.sfx.whoosh(0.22, 1600, 6000, 0.22) },
    { at: EYE_T, fn: (e) => e.sfx.shing(1.1) },
    { at: CARD_T, fn: (e) => e.sfx.whoosh(0.3, 400, 2400, 0.3) },
  ],
  prepare() {
    // Pixel rims and hair masks of every hero frame (built once, so the cut into the shot never hitches).
    for (const a of [land(), stand()]) for (let i = 0; i < a.frames.length; i++) artOf(a, i);
  },
  init(env) {
    spin = new BallSpin();
    spin.rotate(1, 0.3, 0.2, 0.7);
    landed = keeperDown = netHit = goalDone = false;
    const n = (COLS + 1) * (ROWS + 1);
    z = new Float32Array(n);
    vz = new Float32Array(n);
    brokenH = new Uint8Array(n);
    brokenV = new Uint8Array(n);
    cracks = anchorCracks(makeCracks(new Rng(808), 9, 150, 0.22));
    hp8 = null;
    hfy = FEET_Y;
    for (const a of [land(), stand()]) for (let i = 0; i < a.frames.length; i++) artOf(a, i); // (cached by prepare)
    env.cam.set(VW / 2, VH / 2, 1.06, 0.085);
  },
  update(env, t, dt) {
    const { rng, parts, cam } = env;
    const s = simTime(t);
    const bt = s - S_NET;
    spin.rotate(0.3, 1, 0.2, dt * (bt < 0 ? 40 : bt < 0.6 ? 30 : 9));

    // ---- Landing.
    if (!landed && t >= LAND) {
      landed = true;
      cam.hit(0.55);
      ringL(env, FEET_X, FEET_Y, 16, 210, 0.55, 0.2, 'silver', 1);
      ringL(env, FEET_X, FEET_Y, 10, 140, 0.45, 0.2, 'crimson', 1);
      ringL(env, FEET_X, FEET_Y, 20, 180, 0.6, 0.22, 'dust', 1);
      dustBurst(env, FEET_X, FEET_Y + 2, 14, 1.4);
      // Dust ring pushed out flat along the turf (half behind his legs, half in front).
      for (let i = 0; i < 26; i++) {
        const dir = i % 2 ? 1 : -1;
        const sp = rng.range(160, 340);
        parts.spawn({
          kind: PK.Smoke, x: FEET_X + dir * rng.range(16, 50), y: FEET_Y + rng.range(-6, 6), vx: dir * sp, vy: rng.range(-20, 4), drag: 3.2,
          max: rng.range(0.5, 0.9), s0: rng.range(7, 11), s1: rng.range(30, 44), ramp: 'dust', r0: 0, r1: 1, a0: 0.7, a1: 0, add: false,
          layer: i % 3 === 0 ? 0 : 1,
        });
      }
      grassChunks(env, FEET_X, FEET_Y, 16, 0.9);
      sparksL(env, FEET_X - 40, FEET_Y - 2, 14, 420, 1.2, -Math.PI * 0.75, 'crimson', 1, 500);
      sparksL(env, FEET_X + 40, FEET_Y - 2, 14, 420, 1.2, -Math.PI * 0.25, 'crimson', 1, 500);
      sparksL(env, FEET_X, FEET_Y - 4, 10, 300, Math.PI, -Math.PI / 2, 'silver', 1, 400);
    }
    // Crack glow embers rising off the crescent crater for a moment.
    if (landed && s - S_LAND < 0.6 && rng.next() < 0.7) {
      const a = rng.range(Math.PI * 1.05, Math.PI * 1.95);
      parts.spawn({
        kind: PK.Pixel, x: FEET_X + Math.cos(a) * 92, y: FEET_Y - 4 + Math.sin(a) * 22, vx: rng.range(-20, 20), vy: rng.range(-90, -30),
        max: rng.range(0.4, 0.8), s0: rng.range(1.5, 3), s1: 1, ramp: 'crimson', r0: 0.1, r1: 1, a0: 1, a1: 0, layer: 0,
      });
    }

    // ---- Keeper thuds into the turf behind him.
    if (!keeperDown && t >= KEEP_T) {
      keeperDown = true;
      for (let i = 0; i < 9; i++) {
        parts.spawn({
          kind: PK.Smoke, x: KEEP_X1 + rng.range(-30, 30), y: KEEP_Y1 + 6, vx: rng.range(-50, 50), vy: rng.range(-24, -6), drag: 2.5,
          max: rng.range(0.5, 0.9), s0: rng.range(3, 5), s1: rng.range(8, 13), ramp: 'dust', r0: 0.3, r1: 1, a0: 0.35, a1: 0, add: false, layer: 0,
        });
      }
    }

    // ---- The comet dives into the corner.
    if (s >= S_B0 && s < S_NET) {
      const u1 = (s - S_B0) / (S_NET - S_B0);
      const u0 = Math.max(0, (s - dt - S_B0) / (S_NET - S_B0));
      // Spawn along the whole segment travelled this step (no beads on a fast comet).
      for (let k = 1; k <= 3; k++) {
        const u = lerp(u0, u1, k / 3);
        const [bx, by, br] = cometAt(u);
        const [bx2, by2] = cometAt(Math.max(0, u - 0.05));
        const dir = Math.atan2(by - by2, bx - bx2);
        // Flames trail just behind the head so the ball itself stays readable inside them.
        meteorFlames(env, bx - Math.cos(dir) * br, by - Math.sin(dir) * br, br * 0.8, dir, 0.22, dt, 'crimson');
      }
    }

    // ---- Net: z-only spring mesh pinned at the frame.
    const sub = 3, h = dt / sub;
    for (let k = 0; k < sub; k++) {
      for (let j = 1; j < ROWS; j++)
        for (let i = 1; i < COLS; i++) {
          const q = idx(i, j);
          let sum = 0, cnt = 0;
          if (!brokenH[idx(i - 1, j)]) { sum += z[idx(i - 1, j)]; cnt++; }
          if (!brokenH[q]) { sum += z[idx(i + 1, j)]; cnt++; }
          if (!brokenV[idx(i, j - 1)]) { sum += z[idx(i, j - 1)]; cnt++; }
          if (!brokenV[q]) { sum += z[idx(i, j + 1)]; cnt++; }
          const avg = cnt ? sum / cnt : 0;
          vz[q] += ((avg - z[q]) * 1500 - vz[q] * 5 - z[q] * 7) * h;
        }
      for (let q = 0; q < z.length; q++) z[q] += vz[q] * h;
    }
    if (bt > 0) {
      const [bx, by, bz] = ballNet(bt);
      const sig = 26;
      for (let j = 1; j < ROWS; j++)
        for (let i = 1; i < COLS; i++) {
          const dx = restX(i) - bx, dy = restY(j) - by;
          const target = bz * Math.exp(-(dx * dx + dy * dy) / (2 * sig * sig));
          const q = idx(i, j);
          if (target > z[q]) {
            z[q] = target;
            vz[q] = Math.max(vz[q], 0);
          }
        }
    }

    // ---- Impact.
    if (!netHit && t >= NET) {
      netHit = true;
      cam.hit(0.8);
      ringL(env, IPX, IPY, 10, 230, 0.6, 1, 'silver', 0);
      ringL(env, IPX, IPY, 8, 160, 0.5, 1, 'crimson', 0);
      sparksL(env, IPX, IPY, 56, 820, TAU, 0, 'crimson', 0);
      sparksL(env, IPX, IPY, 26, 620, TAU, 0, 'silver', 0);
      for (let i = 0; i < 26; i++) {
        const a = rng.range(0, TAU), sp = rng.range(60, 260);
        parts.spawn({
          kind: PK.Glow, x: IPX, y: IPY, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 3,
          max: rng.range(0.3, 0.6), s0: rng.range(8, 16), s1: 2, ramp: 'crimson', r0: 0.1, r1: 1, a0: 0.55, a1: 0, layer: 0,
        });
      }
    }
    // Strands snap around the ball at peak stretch.
    if (bt > 0.04 && bt < 0.2) {
      const [bx, by] = ballNet(bt);
      for (let k = 0; k < 2; k++) {
        const i = Math.round(((bx - NX0) / (NX1 - NX0)) * COLS + rng.range(-2, 2));
        const j = Math.round(((by - NY0) / (NY1 - NY0)) * ROWS + rng.range(-1.5, 1.5));
        if (i < 1 || j < 1 || i >= COLS || j >= ROWS) continue;
        const q = idx(i, j);
        if (rng.next() < 0.5) brokenH[q] = 1;
        else brokenV[q] = 1;
        const [sx, sy] = proj(restX(i), restY(j), z[q]);
        sparksL(env, sx, sy, 3, 260, TAU, 0, 'silver', 0);
      }
    }
    // Fire and smoke from the ball grinding in the net.
    if (bt > 0) {
      const [bx, by, bz] = ballNet(bt);
      const [sx, sy] = proj(bx, by, bz);
      const heat = clamp(1 - (bt - 0.4) / 1.2);
      if (rng.next() < 0.7 * heat + 0.15) {
        parts.spawn({
          kind: PK.Smoke, x: sx + rng.range(-6, 6), y: sy - 6 + rng.range(-4, 3), vx: rng.range(-30, 30), vy: rng.range(-70, -30),
          max: rng.range(0.7, 1.3), s0: 5, s1: 20, ramp: 'smoke', r0: 0, r1: 1, a0: 0.4, a1: 0, add: false, layer: 0,
        });
      }
      if (rng.next() < heat) {
        parts.spawn({
          kind: PK.Glow, x: sx + rng.range(-4, 4), y: sy + rng.range(-4, 4), vx: rng.range(-40, 40), vy: rng.range(-110, -30),
          max: rng.range(0.25, 0.5), s0: rng.range(5, 9), s1: 1, ramp: 'crimson', r0: 0.1, r1: 1, a0: 0.9, a1: 0, layer: 0,
        });
      }
      // Embers peeling off the crescents of light (the burst dissolving, then the halo smouldering).
      const g = haloGeo(bt);
      const nE = bt < 0.6 ? 4 : 2;
      for (let k = 0; k < nE; k++) {
        if (bt > 0.6 && rng.next() > 0.7) continue;
        const u = rng.range(0.08, 0.92);
        const a = lerp(g.a0, g.a1, u);
        const rr = g.r - g.th * 0.4 * Math.sin(Math.PI * u);
        const out = rng.range(20, 70);
        parts.spawn({
          kind: rng.next() < 0.5 ? PK.Pixel : PK.Glow, x: g.cx + Math.cos(a) * rr, y: g.cy + Math.sin(a) * rr,
          vx: Math.cos(a) * out, vy: Math.sin(a) * out - rng.range(10, 50), drag: 1.2,
          max: rng.range(0.6, 1.2), s0: rng.range(1.5, 3.5), s1: 0.5, ramp: rng.next() < 0.25 ? 'silver' : 'crimson', r0: 0.1, r1: 1,
          a0: 0.9, a1: 0, layer: 0,
        });
      }
    }

    // ---- GOAL: confetti.
    if (t > GOAL_T) {
      if (!goalDone) {
        goalDone = true;
        cam.hit(0.3);
      }
      const gt = t - GOAL_T;
      const colors = ['#de1a42', '#ff7a98', '#f2f5ff', '#f2f5ff', '#7d86e8', '#fcb94c'];
      const nC = gt < 0.5 ? 4 : 2;
      for (let k = 0; k < nC; k++) {
        if (gt < 0.5 && k < 2) {
          const left = k === 0;
          parts.spawn({
            kind: PK.Confetti, x: left ? -10 : VW + 10, y: rng.range(30, 150), vx: (left ? 1 : -1) * rng.range(140, 380), vy: rng.range(-160, -20),
            ay: 150, drag: 1.3, vrot: rng.range(-8, 8), max: rng.range(2.2, 3.2), s0: rng.range(4, 6.5), s1: 4, a0: 1, a1: 1, add: false,
            color: rng.pick(colors), k: rng.next(), layer: 1,
          });
        } else {
          parts.spawn({
            kind: PK.Confetti, x: rng.range(-10, VW + 10), y: -12, vx: rng.range(-40, 40), vy: rng.range(30, 110),
            ay: 50, drag: 0.9, vrot: rng.range(-8, 8), max: rng.range(2.6, 3.6), s0: rng.range(3.5, 6), s1: 4, a0: 1, a1: 1, add: false,
            color: rng.pick(colors), k: rng.next(), layer: rng.next() < 0.7 ? 1 : 0,
          });
        }
      }
    }

    // Silver motes drifting in the floodlights.
    if (rng.next() < 0.3) {
      parts.spawn({
        kind: PK.Pixel, x: rng.range(0, VW), y: rng.range(60, 330), vx: rng.range(-8, 8), vy: rng.range(-24, -6),
        max: rng.range(1, 1.8), s0: rng.range(1, 2), s1: 1, ramp: rng.next() < 0.4 ? 'crimson' : 'silver', r0: 0.2, r1: 1, a0: 0.7, a1: 0,
        layer: rng.next() < 0.5 ? 0 : 1,
      });
    }

    // ---- Camera: the world settles upright as he lands, bump, impact punch, slow push after GOAL.
    const fallK = clamp(s / S_LAND);
    const roll = 0.085 * (1 - ease.inCubic(fallK));
    const zoomIn = lerp(1.06, 1, ease.inQuad(fallK));
    const bump = pulse(s, S_LAND, 0.24);
    const punch = pulse(s, S_NET, 0.5);
    const push = ease.inOutQuad(clamp((t - GOAL_T) / (DUR - GOAL_T)));
    // Snap-zoom onto his eyes for the glint (the cool beat), easing back out as the card arrives.
    const eyeZ = ease.outCubic(clamp((t - (EYE_T - 0.1)) / 0.12)) * (1 - ease.inOutCubic(clamp((t - (CARD_T + 0.05)) / 0.5)));
    cam.set(
      lerp(lerp(VW / 2, 312, push), HEAD_X, 0.85 * eyeZ),
      lerp(lerp(VH / 2, 170, push) + 7 * bump * bump, HEAD_Y + 12, 0.85 * eyeZ),
      zoomIn + 0.05 * punch * punch + 0.065 * push + 0.3 * eyeZ,
      roll - 0.03 * eyeZ,
    );
    cam.shakeAmp = 12;
    cam.shakeRoll = 0.02;
  },
  render(env, t) {
    const { ctx, fx, cam } = env;
    const st = env.art.stadium;
    const rng = env.frng();
    const s = simTime(t);
    const bt = s - S_NET;
    const BL = backlight(bt);
    // The two-tone impact frames (crimson on silver-white) right as the ball rips in.
    const impF = t >= NET && t < NET + 0.05;
    const gt = t - GOAL_T;
    env.world();
    ctx.imageSmoothingEnabled = false;

    // ================= Background: sky, moon, lights, stands =================
    const sky = ctx.createLinearGradient(0, -80, 0, 90);
    sky.addColorStop(0, '#020109');
    sky.addColorStop(0.6, '#0b0926');
    sky.addColorStop(1, '#1b1446');
    ctx.fillStyle = sky;
    ctx.fillRect(-200, -200, VW + 400, 300);
    ctx.fillStyle = '#dfe4ff';
    for (const sr of st.stars) {
      const x = ((sr.x * 0.37) % 780) - 70;
      const y = ((sr.y + 1400) / 1520) * 110 - 40;
      if (y > 64) continue;
      ctx.globalAlpha = sr.b * (0.55 + 0.45 * Math.sin(t * 4 + sr.x));
      ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
    ctx.globalAlpha = 1;
    // Crescent moon.
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf([110, 120, 230]), MOON_X, MOON_Y, MOON_R * 6, 0.24);
    drawGlow(ctx, glowOf([210, 214, 255]), MOON_X, MOON_Y, MOON_R * 2.4, 0.18);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(46,44,104,0.6)';
    ctx.beginPath();
    ctx.arc(MOON_X, MOON_Y, MOON_R, 0, TAU);
    ctx.fill();
    ctx.save();
    crescentPath(ctx, MOON_X, MOON_Y, MOON_R, 0.62, Math.PI * 0.2);
    ctx.clip();
    ctx.drawImage(st.moon, MOON_X - MOON_R - 1, MOON_Y - MOON_R - 1, MOON_R * 2 + 2, MOON_R * 2 + 2);
    ctx.restore();
    ctx.globalAlpha = 0.35;
    ctx.drawImage(st.cloud[1], MOON_X - 70 + t * 8, MOON_Y - 8, 180, 50);
    ctx.globalAlpha = 1;
    // Floodlight towers (lamp heads in the top corners).
    for (const [lx, ly] of LAMPS) ctx.drawImage(st.tower, lx - 20, ly - 16, 40, 220);
    // Roof.
    ctx.fillStyle = '#05030c';
    ctx.fillRect(-200, 60, VW + 400, 14);
    ctx.fillStyle = 'rgba(170,180,240,0.35)';
    ctx.fillRect(-200, 73, VW + 400, 1);
    for (let x = -190; x < VW + 200; x += 26) {
      ctx.fillStyle = '#e8ecff';
      ctx.fillRect(x, 69, 3, 2);
    }
    // Crowd behind the goal (bouncing in strips after the goal).
    const jump = gt > 0.1;
    for (let k = 0; k < 8; k++) {
      const sw = 100;
      const dy = jump ? Math.round(Math.max(0, Math.sin(t * 17 + k * 1.9)) * 2) : 0;
      ctx.drawImage(st.crowdNear, k * sw * 0.625 + 60, 0, sw * 0.625, 90, -40 + k * sw - 0.5, 74 - dy, sw + 1, 144);
    }
    const wash = ctx.createLinearGradient(0, 74, 0, 218);
    wash.addColorStop(0, 'rgba(5,3,16,0.86)');
    wash.addColorStop(1, 'rgba(12,8,34,0.64)');
    ctx.fillStyle = wash;
    ctx.fillRect(-200, 74, VW + 400, 144);
    // LED boards.
    ctx.fillStyle = '#05040b';
    // From 214: covers the bottom edge of the bouncing crowd strips (no unpainted seam row).
    ctx.fillRect(-200, 214, VW + 400, 20);
    for (let x = -192; x < VW + 200; x += 56) {
      const k = Math.round(x / 56);
      const chase = gt > 0 && Math.floor(t * 10 + k) % 3 === 0;
      ctx.fillStyle = chase ? 'rgba(255,90,130,0.95)' : k & 1 ? 'rgba(222,26,66,0.7)' : 'rgba(200,210,255,0.5)';
      ctx.fillRect(x + 4, 221, 44, 7);
    }
    // Lamps + crowd flashes.
    ctx.globalCompositeOperation = 'lighter';
    for (const [lx, ly] of LAMPS) {
      drawGlow(ctx, glowOf([200, 210, 255]), lx, ly, 120, 0.32);
      drawGlow(ctx, glowOf([255, 255, 255]), lx, ly, 34, 0.95);
    }
    const flashRate = gt > 0 ? 3.2 : 1.2;
    for (const f of st.flashes) {
      const ph = (t * flashRate + f.t) % 1.6;
      if (ph > 0.09) continue;
      drawGlow(ctx, glowOf([235, 240, 255]), (f.x / 1600) * 760 - 60, 84 + f.y * 1.3, gt > 0 ? 7 : 5, 1 - ph / 0.09);
    }
    // The burst floods the stadium crimson.
    if (bt > 0) {
      const fl = 0.25 + 0.75 * Math.exp(-bt * 2.8);
      bigGlow(ctx, crimsonAt(0.55), IPX, IPY, 430, 0.6 * fl);
    }
    ctx.globalCompositeOperation = 'source-over';

    // ================= Pitch =================
    const grass = ctx.createLinearGradient(0, 234, 0, VH + 40);
    grass.addColorStop(0, '#0b2014');
    grass.addColorStop(1, '#1a4d28');
    ctx.fillStyle = grass;
    ctx.fillRect(-200, 233, VW + 400, 201);
    for (let d = 3; d < 20; d += 3) {
      const y0 = gy(d + 1.5), y1 = gy(d);
      ctx.fillStyle = 'rgba(40,110,56,0.22)';
      ctx.fillRect(-200, y0, VW + 400, y1 - y0);
    }
    // Floodlit pool where he stands.
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf([70, 90, 150]), FEET_X, FEET_Y - 4, 240, 0.25, 1.2, 0.3);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(220,228,255,0.62)';
    ctx.fillRect(-200, GB, VW + 400, 2);
    ctx.fillStyle = 'rgba(220,228,255,0.5)';
    ctx.fillRect(-200, Math.round(gy(10.2)), VW + 400, 3);

    // ================= Goal: net, keeper, ball, frame =================
    // Net mesh.
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(214,220,255,0.5)';
    ctx.beginPath();
    for (let j = 0; j <= ROWS; j++)
      for (let i = 0; i <= COLS; i++) {
        const q = idx(i, j);
        const [x, y] = proj(restX(i), restY(j), z[q]);
        if (i < COLS && !brokenH[q]) {
          const [x2, y2] = proj(restX(i + 1), restY(j), z[idx(i + 1, j)]);
          ctx.moveTo(x, y);
          ctx.lineTo(x2, y2);
        }
        if (j < ROWS && !brokenV[q]) {
          const [x2, y2] = proj(restX(i), restY(j + 1), z[idx(i, j + 1)]);
          ctx.moveTo(x, y);
          ctx.lineTo(x2, y2);
        }
      }
    ctx.stroke();
    // Side-net hints from the posts to the back frame.
    ctx.strokeStyle = 'rgba(200,206,250,0.22)';
    ctx.beginPath();
    for (let k = 1; k <= 4; k++) {
      const y = lerp(GT, GB, k / 5);
      ctx.moveTo(GL, y);
      ctx.lineTo(NX0, y);
      ctx.moveTo(GR, y);
      ctx.lineTo(NX1, y);
    }
    ctx.stroke();
    // Once the burst has died down the ball is just a ball in the back of the net: behind the goal
    // line, so the beaten keeper (on the line) is drawn over it.
    if (bt > BALL_BACK) drawNetBall(env, bt);

    // Keeper (his real kit sunk into the night, rim-lit by the floods, then by the burst).
    {
      const after = s - S_KEEP;
      let kx: number, ky: number, pose;
      if (after > 0) {
        // Down: a small bounce, then he settles into the beaten sprawl.
        kx = KEEP_X1;
        ky = KEEP_Y1 - 4 * Math.exp(-after * 10) * Math.abs(Math.sin(after * 18));
        pose = mixPose(KEEP_FALL, KEEP_LIE, ease.outCubic(clamp(after / 0.25)));
      } else if (s < S_NET) {
        // Still flying at the corner, already dropping (moving from frame 0: no rewind at the cut).
        const u = clamp(s / S_NET);
        kx = lerp(KEEP_X0, KEEP_XN, u);
        ky = lerp(KEEP_Y0, KEEP_YN, 0.45 * u + 0.55 * u * u);
        pose = mixPose(KEEP_AIR0, KEEP_AIR, u);
      } else {
        // Beaten: hangs through the hit-stop, then drops.
        const u = clamp((s - S_NET) / (S_KEEP - S_NET));
        kx = lerp(KEEP_XN, KEEP_X1, u);
        ky = lerp(KEEP_YN, KEEP_Y1, ease.inQuad(u));
        pose = mixPose(KEEP_AIR, KEEP_FALL, ease.inQuad(u));
      }
      const night: RGB = [lerp(22, 92, BL) | 0, lerp(20, 14, BL) | 0, lerp(56, 46, BL) | 0];
      const kr = renderPuppet(KEEPER_KIT, pose, { k: 0.9, facing: 1, heatTint: { c: night, a: 0.42 } });
      drawPuppet(ctx, kr, kx, ky, 1);
      // Rim: only the light-facing edge pixels (black fill adds nothing when added).
      const rimC: RGB = bt > 0 ? [255, 80, 120] : [150, 200, 110];
      const ks = renderPuppet(KEEPER_KIT, pose, {
        k: 0.9, facing: 1, silhouette: { fill: [0, 0, 0], rim: rimC, rim2: bt > 0 ? [110, 24, 50] : [40, 60, 36], lx: 1, ly: -1 },
      });
      ctx.globalCompositeOperation = 'lighter';
      drawPuppet(ctx, ks, kx, ky, 1, 0.55 + 0.45 * BL);
      ctx.globalCompositeOperation = 'source-over';
    }

    // Goal frame (in front of the net).
    ctx.fillStyle = '#0a0716';
    ctx.fillRect(GL - 4, GT - 4, GR - GL + 8, 9);
    ctx.fillRect(GL - 4, GT - 4, 9, GB - GT + 5);
    ctx.fillRect(GR - 5, GT - 4, 9, GB - GT + 5);
    ctx.fillStyle = '#8d93bd';
    ctx.fillRect(GL - 3, GT - 3, GR - GL + 6, 6);
    ctx.fillRect(GL - 3, GT - 3, 6, GB - GT + 3);
    ctx.fillRect(GR - 3, GT - 3, 6, GB - GT + 3);
    ctx.fillStyle = 'rgba(232,236,255,0.92)';
    ctx.fillRect(GL - 3, GT - 3, GR - GL + 6, 1);
    ctx.fillRect(GL - 3, GT - 3, 1, GB - GT + 3);
    ctx.fillRect(GR + 2, GT - 3, 1, GB - GT + 3);
    if (bt > 0) {
      // Crimson light catching the frame near the corner.
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(255,60,100,${0.6 * BL})`;
      ctx.fillRect(GL + 120, GT - 3, GR - GL - 114, 2);
      ctx.fillRect(GR - 3, GT - 3, 2, GB - GT + 3);
      ctx.globalCompositeOperation = 'source-over';
    }
    // Background haze: the goal sits far behind him (darker, softer).
    const haze = ctx.createLinearGradient(0, 100, 0, 260);
    haze.addColorStop(0, 'rgba(14,10,40,0.12)');
    haze.addColorStop(1, 'rgba(14,10,40,0.4)');
    ctx.fillStyle = haze;
    ctx.fillRect(-200, 100, VW + 400, 160);

    // ================= The comet =================
    if (s >= S_B0 - 0.01 && bt < 0.32) {
      const u = clamp((s - S_B0) / (S_NET - S_B0));
      const tailU = bt > 0 ? clamp((bt / 0.32) * 1.0) : 0;
      const fade = bt > 0 ? 1 - clamp(bt / 0.32) : 1;
      const n = 18;
      const pts: [number, number][] = [];
      const ws: number[] = [];
      const u0 = Math.max(0, u - 0.6);
      const uStart = lerp(u0, u, tailU);
      for (let i = 0; i < n; i++) {
        const k = i / (n - 1);
        const uu = lerp(uStart, u, k);
        const [x, y, r] = cometAt(uu);
        pts.push([x, y]);
        ws.push(r * 1.6 * Math.min(1, k * 2.2));
      }
      if (u > 0.001) {
        taperRibbon(ctx, pts, ws.map((w) => w * 2.2), 'rgb(90,4,30)', 0.5 * fade);
        taperRibbon(ctx, pts, ws.map((w) => w * 1.45), 'rgb(214,18,52)', 0.85 * fade);
        ctx.globalCompositeOperation = 'lighter';
        taperRibbon(ctx, pts, ws.map((w) => w * 0.75), 'rgb(255,70,100)', 0.4 * fade);
        // White-hot core, tapering to nothing at the head so the ball reads inside it.
        taperRibbon(ctx, pts, ws.map((w, i) => w * 0.2 * (1 - clamp((i / (n - 1) - 0.8) / 0.2))), 'rgb(245,245,255)', 0.85 * fade);
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    // ================= Burst behind him =================
    if (bt > 0) {
      ctx.globalCompositeOperation = 'lighter';
      if (bt < 0.9) {
        const ra = 1 - bt / 0.9;
        focusLines(ctx, rng, IPX, IPY, 26, 760, 40, '#ff3a6a', 0.32 * ra, 7);
        focusLines(ctx, rng, IPX, IPY, 20, 600, 22, '#e8ecff', 0.22 * ra, 3);
      }
      const k = clamp(bt / 0.3);
      drawGlow(ctx, glowOf([255, 225, 238]), IPX, IPY, 30 * (1 - k) + 12, 0.38 * (1 - 0.7 * k));
      // Impact frame: a big splash behind him so the two-tone frame shows him as a silhouette.
      if (impF) {
        bigGlow(ctx, crimsonAt(0.3), IPX - 50, IPY + 40, 520, 1);
        bigGlow(ctx, [255, 200, 220], IPX - 30, IPY + 20, 260, 0.9);
        // ...and a pale wash around him, so the crimson silhouette is ringed by silver-white.
        bigGlow(ctx, [235, 238, 255], FEET_X - 10, 215, 320, 0.9);
      }
      drawGlow(ctx, glowOf([235, 238, 255]), FEET_X, 170, 150, 0.32 * BL);
      ctx.globalCompositeOperation = 'source-over';
      // ...cut by dark rays out of the corner, so the splash reads as an explosion.
      if (impF) focusLines(ctx, rng, IPX, IPY, 60, 820, 46, '#0a0008', 1, 8);
      // Shock crescents racing outward.
      for (const e of [0, 0.09]) {
        const q = (bt - e) / 0.5;
        if (q <= 0 || q >= 1) continue;
        crescentArc(ctx, IPX, IPY, 150 + 380 * ease.outCubic(q), Math.PI - 1.05, Math.PI + 1.05, 16 * (1 - q), 1, 0.75 * (1 - q) * (1 - q));
      }
      // The crescent of light itself: bursts out of the corner, sweeps around him, dissolves...
      const breathe = bt > 0.6 ? 0.88 + 0.12 * Math.sin(t * 4.2) : 1;
      haloCrescent(ctx, haloGeo(bt), haloAlpha(bt) * breathe);
    }

    // ================= Ground: shadow + crescent crack =================
    const fallK = clamp(s / S_LAND);
    ctx.fillStyle = `rgba(4,4,14,${0.25 + 0.3 * fallK})`;
    ctx.beginPath();
    ctx.ellipse(FEET_X, FEET_Y + 2, 46 + 30 * fallK, (46 + 30 * fallK) * 0.18, 0, 0, TAU);
    ctx.fill();
    if (s >= S_LAND) {
      const ct = s - S_LAND;
      const grow = ease.outCubic(clamp(ct / 0.14));
      const heat = Math.exp(-ct * 1.6);
      const R = CRATER_R * grow;
      ctx.save();
      ctx.translate(FEET_X, FEET_Y - 3);
      ctx.scale(1, CRATER_K);
      // Dark broken turf shaped as a crescent cupping his heels, horns reaching toward the lens.
      crescentPath(ctx, 0, 0, R, 0.62, Math.PI / 2);
      ctx.fillStyle = '#0a0310';
      ctx.fill();
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#150510';
      ctx.lineWidth = 7;
      ctx.stroke();
      ctx.restore();
      // Molten crescent seam along the outer rim (perspective-squashed crescent slash).
      ctx.save();
      ctx.translate(FEET_X, FEET_Y - 3);
      ctx.scale(1, 0.27);
      crescentArc(ctx, 0, 0, R + 2, Math.PI * 0.94, Math.PI * 2.06, 42, 1, 0.3 + 0.7 * heat);
      ctx.restore();
      // Jagged cracks radiating out of the crater's rim (they leave it as the rim reaches them).
      const cg = clamp((ct - 0.09) / 0.3);
      for (const c of cracks) {
        const g2 = clamp((cg - c.at) / (1 - c.at));
        if (g2 <= 0) continue;
        const nP = Math.max(2, Math.ceil(c.pts.length * g2));
        const path = () => {
          ctx.beginPath();
          ctx.moveTo(FEET_X + c.pts[0][0], FEET_Y - 3 + c.pts[0][1]);
          for (let i = 1; i < nP; i++) ctx.lineTo(FEET_X + c.pts[i][0], FEET_Y - 3 + c.pts[i][1]);
        };
        ctx.strokeStyle = '#120608';
        ctx.lineWidth = 3;
        path();
        ctx.stroke();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = `rgba(255,70,110,${0.35 + 0.6 * heat})`;
        ctx.lineWidth = 1.2;
        path();
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowSprite('crimson', 0.5), FEET_X, FEET_Y - 4, 130, 0.45 * heat, 1.2, 0.3);
      ctx.globalCompositeOperation = 'source-over';
    }

    env.parts.draw(ctx, 0);

    // Ball in the net while the burst is hot (still high in the corner, above the keeper): over the
    // burst light and its sparks, on a dark halo, so it stays a ball even inside the impact.
    if (bt > 0 && bt <= BALL_BACK) drawNetBall(env, bt);
    // The comet's ball: on top of its own flames, over a dark halo so its pattern survives the bloom.
    if (s >= S_B0 - 0.01 && bt <= 0) {
      const u = clamp((s - S_B0) / (S_NET - S_B0));
      if (u > 0) {
        const [bx, by, br] = cometAt(u);
        const rr = clamp(Math.round(br / 1.6), 3, 7);
        ctx.fillStyle = 'rgba(24,4,18,0.55)';
        ctx.beginPath();
        ctx.arc(bx, by, br * 1.25, 0, TAU);
        ctx.fill();
        drawBall(env, spin, bx, by, rr, br / rr, 0.4, 0.45, 'crimson');
      }
    }

    // ================= The hero =================
    // The drawn landing: L1 dropping in, L2 on the turf, L3 absorbing, L4 rebounding, then Stand Front
    // a/b panting (the squash and stretch and the breathing are in the drawings, not in code).
    hfy = feetY(s);
    const { a: ha, i: hi } = heroFrame(t);
    hp8 = placeHero(ha, hi, hfy);
    const red = ha.tinted(hi, [222, 26, 66]);
    const deep = ha.tinted(hi, [120, 6, 36]);
    const sil = ha.tinted(hi, [226, 230, 255]);
    if (impF) {
      // Impact frame: a solid black No.10 against the crimson splash (no aura, rims or back-light).
      drawHeroQ(env, null, 0, 0);
      drawHeroQ(env, ha.tinted(hi, [0, 0, 0]), 0, 0);
    } else {
      // Afterimages while he drops in.
      if (s < S_LAND) {
        ctx.globalCompositeOperation = 'lighter';
        for (let k = 1; k <= 3; k++) {
          const fy = feetY(Math.max(0, s - k * 0.028));
          drawHeroQ(env, red, 0, fy - hfy - k * 10, 0.36 - k * 0.09);
        }
        ctx.globalCompositeOperation = 'source-over';
      }
      // Aura outline (offset copies behind him): a thin crimson edge, flaring with the back-light.
      const fl = 0.82 + 0.18 * Math.sin(t * 37) * Math.sin(t * 21);
      const aura = Math.max(0.35, BL);
      // Offsets kept small and on whole pixels: a rim, not a double exposure (the extra back-light
      // rides on the additive rim passes below).
      const r1 = 3 + 2 * BL, r2 = 2 + 1.5 * BL;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        drawHeroQ(env, deep, Math.round(Math.cos(a) * r1), Math.round(Math.sin(a) * r1 * 0.9 - 1), 0.28 * aura * fl);
      }
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + 0.5;
        drawHeroQ(env, red, Math.round(Math.cos(a) * r2), Math.round(Math.sin(a) * r2), 0.5 * aura * fl);
      }
      if (BL > 0) {
        ctx.globalCompositeOperation = 'lighter';
        const o1 = Math.round(2 + BL);
        drawHeroQ(env, red, o1, -o1, 0.55 * BL);
        drawHeroQ(env, red, -o1, -1, 0.5 * BL);
        drawHeroQ(env, sil, 1, -2, 0.35 * BL);
        ctx.globalCompositeOperation = 'source-over';
      }
      // Sprite.
      drawHeroQ(env, null, 0, 0);
      // Back-lit: his front falls into shadow.
      ctx.globalCompositeOperation = 'multiply';
      drawHeroQ(env, ha.tinted(hi, [46, 36, 92]), 0, 0, 0.16 + 0.62 * BL);
      ctx.globalCompositeOperation = 'source-over';
      // Pixel rims: silver along the top (floods), crimson on the burst side.
      drawHeroQ(env, rimSet(ha, hi, BL, false), 0, 0);
      ctx.globalCompositeOperation = 'lighter';
      drawHeroQ(env, rimSet(ha, hi, BL, true), 0, 0);
      drawHeroQ(env, artOf(ha, hi).hairRed, 0, 0, 0.08 + 0.1 * BL + 0.04 * Math.sin(t * 9));
      ctx.globalCompositeOperation = 'source-over';
    }

    env.parts.draw(ctx, 1);

    // Falling speed lines.
    if (s < S_LAND + 0.05) {
      const a = 1 - clamp((s - S_LAND) / 0.05);
      ctx.globalCompositeOperation = 'lighter';
      speedStreaks(ctx, rng, -40, -40, VW + 80, VH + 40, -Math.PI / 2, 22, '#dfe4ff', 0.35 * a, 140);
      ctx.globalCompositeOperation = 'source-over';
    }

    // Eye glint: the cool look, no turn.
    const ef = pulse(t, EYE_T, 0.45);
    if (ef > 0) {
      // On the Stand frames (eye whites per frame; they follow STb's 1 px breath).
      const eyes = EYES[ha.frames[hi].name] ?? EYES.a;
      const wp = (ex: number, ey: number) => [FEET_X + (ex - hp8!.piv[0]) * SC, hfy + (ey - hp8!.piv[1]) * SC] as const;
      for (const [i, [ex, ey]] of eyes.entries()) {
        const [px, py] = wp(ex, ey);
        sparkle(ctx, px, py, 5 + 9 * ef, ef, i * 0.4 + t * 2);
      }
      const [mx, my] = wp((eyes[0][0] + eyes[1][0]) / 2, (eyes[0][1] + eyes[1][1]) / 2);
      lensFlare(ctx, mx, my, 30, ef * 0.35, [200, 210, 255]);
    }

    // ================= Titles (screen space) =================
    env.screen();
    if (gt > 0) {
      const bounce = 1 + pulse(gt, 0.38, 0.3) * 0.04;
      ctx.save();
      ctx.translate(VW / 2, 94);
      ctx.scale(bounce, bounce);
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowSprite('crimson', 0.5), 0, -36, 190, 0.3 * clamp(gt / 0.3), 1.2, 0.5);
      ctx.globalCompositeOperation = 'source-over';
      chromeSlam(ctx, 'GOAL!', 0, 0, 88, gt, 0.07);
      ctx.restore();
      // A silver crescent glint slices across the title once it has landed.
      const gs = (gt - 0.42) / 0.2;
      if (gs > 0 && gs < 2.2) {
        const grow = ease.outCubic(clamp(gs));
        const fade = 1 - clamp((gs - 1) / 1.2);
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, VW, 112);
        ctx.clip();
        crescentArc(ctx, VW / 2, 290, 238, -Math.PI / 2 - 0.62, -Math.PI / 2 + 0.62, 9, grow, 0.9 * fade);
        ctx.restore();
      }
    }
    const ct = t - CARD_T;
    const card = ease.outCubic(clamp(ct / 0.35));
    if (card > 0) {
      const y = lerp(VH + 40, 286, card);
      ctx.fillStyle = 'rgba(10,6,20,0.88)';
      // Down to the bottom edge: nothing of him peeks out under the card.
      ctx.fillRect(0, y - 6, VW, VH - (y - 6) + 2);
      ctx.fillStyle = '#de1a42';
      ctx.fillRect(0, y - 6, VW, 3);
      ctx.fillStyle = '#c9cff5';
      ctx.fillRect(0, y + 53, VW, 3);
      // Crescent emblem.
      ctx.save();
      crescentPath(ctx, 24, y + 33, 11, 0.62, Math.PI * 0.2);
      ctx.fillStyle = '#de1a42';
      ctx.fill();
      ctx.strokeStyle = '#f2f5ff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
      chromeSlam(ctx, 'CRIMSON CRESCENT', 42, y + 47, 30, ct, 0.02, 'left');
      pixelText(ctx, 'No.10  ·  SPECIAL SHOT', 42, y + 1, 10, '#ff7a98');
      pixelText(ctx, 'CAM 1 - 0 RIV', VW - 40, y + 20, 14, '#ffffff', 'right');
    }

    // ================= Post =================
    const [ux, uy] = cam.toUV(IPX, IPY);
    const [fux, fuy] = cam.toUV(FEET_X, FEET_Y);
    const imp = pulse(t, NET, 0.3);
    fx.bloom = 0.95 + 0.2 * BL;
    fx.bloomThresh = 0.62;
    fx.vignette = 0.62;
    fx.contrast = 1.08;
    fx.ca = impF ? 0 : 0.0015 + imp * 0.008;
    const warm = clamp(BL);
    fx.tint = [lerp(226, 255, warm * 0.8) | 0, lerp(230, 230, warm) | 0, lerp(255, 244, warm) | 0];
    const sl = t - LAND;
    if (sl > 0 && sl < 0.5) fx.shocks.push({ x: fux, y: fuy - 0.02, r: sl * 0.9, s: 0.025 * (1 - sl / 0.5) });
    const sa = t - NET;
    // Full punch at the corner, weaker by the time the ring refracts him (no double image).
    if (sa > 0 && sa < 0.7) fx.shocks.push({ x: ux, y: uy, r: sa * 1.4, s: 0.055 * (1 - sa / 0.7) ** 2 });
    if (gt > 0 && gt < 0.6) fx.shocks.push({ x: 0.5, y: 0.24, r: gt * 1.5, s: 0.03 * (1 - gt / 0.6) });
    fx.radial = impF ? 0 : imp * imp * 0.06;
    fx.radialX = ux;
    fx.radialY = uy;
    if (impF) {
      fx.impact = 1;
      // The finale's own two tones: a crimson No.10 and crimson rays on a silver-white explosion.
      fx.impA = [222, 26, 66];
      fx.impB = [242, 245, 255];
      fx.impThresh = 0.5;
    }
    // Hard cut on impact from shot 7: frame 0 is clean, the landing is the punch.
    const fIn = pulse(t, LAND, 0.08) * 0.22;
    const fNet = pulse(t, NET + 0.05, 0.12) * 0.3;
    // A short pop: the chrome letters' own glow carries the slam (no milky wash).
    const fGoal = pulse(t, GOAL_T + 0.04, 0.08) * 0.22; // keyed to the first letter landing
    const fOut = ease.inQuad(clamp((t - DUR + FADE) / FADE));
    fx.flash = Math.max(fIn, fNet, fGoal, fOut);
    if (fOut > 0) fx.flashColor = [8, 4, 14];
    else if (fNet > fGoal && fNet > fIn) fx.flashColor = [255, 70, 110];
    else if (fIn > 0) fx.flashColor = [255, 226, 236];
    else fx.flashColor = [255, 214, 228]; // rose GOAL pop, not a milky wash
  },
};
