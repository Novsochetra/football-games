// SHOT 1 — COUNT-IN (1.4 s): the SPOTLIGHT SOLO declaration (SPEC.md §1 "Count-in").
//
// Total black. At 0.05 a follow-spot CLUNKs on from the top-right (the rig on the main-stand roof) and its soft oval
// pool is the cut-in window: No.10's eyes at integer x5 (the studio Glance face frames laid on the hand-drawn sprite's
// own pixel grid), lit warm by the beam with a faint violet bounce from the dark, in a slow push. The feint is in his eyes
// first: the pupils dart screen-left (G2L, 0.20) and screen-right (G2, 0.30), each dart leaving a 2-frame violet
// exposure of the pupils where they were (the afterimage idea in miniature). Glint at 0.45 with a beat flare of the
// pool. At 0.55 the pool rises and narrows to make room for the title; the drummer counts in on four stick clicks
// (0.60 / 0.80 / 1.00 / 1.20, 8ths leading into the grid's beat 0 at global 1.40): each click lights one word group
// under its own lamp (lampTitle, 3 frames of beat echo) and one of four small lamp pads (the four defenders to come).
// 1.05 the tag; 1.20 the whole title flares. 1.25 every lamp CHUNKs off except the eye pool, which irises down onto
// his right eye (screen-left) by 1.35; two frames of black; a hard cut onto the downbeat of shot 2.
// No impact frame, no full-frame flash, nothing strobes; sat 1, roll 0, the mix is never filtered.

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { TAU, clamp, ease, lerp, type RGB } from '../../engine/math';
import { drawGlow, glowOf } from '../../engine/particles';
import {
  FADE, HEX, HUM, PAL, SEQ, echoAt, fourCount, lampTitle, lensFlare, onGrid, pixelText, pulse, soloAt, soloGrade, soloPic,
  stage, warmSolo, type SoloKey,
} from './common';

const DUR = 1.4;

// ---------------------------------------------------------------- beats (shot-local seconds)
const T_ON = 0.05; // CLUNK: the follow-spot slams on (2-frame lamp ramp at 70 % size)
const OPEN = 0.15; // 70 % -> 100 % (outBack)
const T_G2L = 0.2; // pupils dart screen-left (his right)
const T_G2 = 0.3; // ... and screen-right (his left)
const T_GLINT = 0.45;
const T_RISE = 0.55; // the pool eases up and narrows for the title
const RISE = 0.12;
/** The count-in: four stick clicks on 8ths (the grid's beat 0 is global 1.40, the first frame of shot 2). */
const CLICKS = [0.6, 0.8, 1.0, 1.2].map((c, i) => onGrid(c, `count-in ${i + 1}`));
const T_TAG = 1.05;
const T_OFF = 1.25; // every lamp CHUNKs off except the eye pool
const T_SHUT = 1.35; // the iris has closed on his eye (rx 6); 1.367 and 1.383 are black; hard cut at 1.40

// ---------------------------------------------------------------- layout (screen px, logical 640x360)
const P0 = { x: VW / 2, y: 140, rx: 250, ry: 72 }; // the pool as it opens
const P1 = { y: 118, rx: 220 }; // after 0.55
const SOFT = 12; // the pool's soft falloff into the plum stage (never an outline)
const LAMP: [number, number] = [606, -24]; // the follow-spot's lens, just above the top-right of frame
const TITLE: readonly string[] = ['SPOT', 'LIGHT ', 'SO', 'LO'];
const TITLE_Y = 262; // baseline (TITLE_FONT 56 px)
const PADS_DY = 263; // fourCount's pill (y 11-33) moved under the title: y 274-296
const PADS_DX = -275; // ... and centred on x 320
const TAG_Y = 302;
const TAG = 'SPECIAL DRIBBLE · No.10';

// ---------------------------------------------------------------- the face (x5, nearest-neighbour)
const SC = 5;
/**
 * Sprite region drawn around the 48x26 face crop: the hair tips above it and the collar below it fall into the pool's
 * soft edge instead of ending on a crop line.
 */
const REG = { x: 10, y: 0, w: 80, h: 48 };
/** Pivot of the slow push (crop px): between the eyes, just above the eye line. Placed on the pool centre. */
const PIV_CROP: [number, number] = [23.5, 13.5];

/** Module caches (pure derived data; rebuilt if the device scale changes). */
const faceCache = new Map<string, HTMLCanvasElement>();
let faceK = 0;
const expoCache = new Map<string, [number, number][]>();
let curtainCv: HTMLCanvasElement | null = null;

const css = (c: RGB, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const mix = (a: RGB, b: RGB, k: number): RGB => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

/** Pivot in REG px. */
function pivot(env: Env): [number, number] {
  const f = env.art.hero.face;
  return [f.x - REG.x + PIV_CROP[0], f.y - REG.y + PIV_CROP[1]];
}

/**
 * No.10's face for `key` at x5 (times k device px per logical px, k = ceil(S)): the hand-drawn sprite region with the
 * studio Glance frame laid on its own pixel grid (G1 is pixel-identical to the sprite; G2L / G2 move only the
 * irises), lit warm from the beam (top-right) with a faint violet bounce from the dark side. Built once per key, then
 * drawn with a smooth slow push (no nearest-neighbour crawl).
 */
function faceCanvas(env: Env, key: SoloKey): HTMLCanvasElement {
  const k = Math.max(1, Math.ceil(env.S - 1e-3));
  if (k !== faceK) {
    faceCache.clear();
    faceK = k;
  }
  let cv = faceCache.get(key);
  if (cv) return cv;
  const hero = env.art.hero;
  const crop = hero.face;
  const pic = soloPic(env, key);
  // 1. Composite at sprite resolution.
  const base = document.createElement('canvas');
  base.width = REG.w;
  base.height = REG.h;
  const bg = base.getContext('2d')!;
  bg.imageSmoothingEnabled = false;
  bg.drawImage(hero.img, REG.x, REG.y, REG.w, REG.h, 0, 0, REG.w, REG.h);
  bg.drawImage(pic.img, 0, 0, pic.w, pic.h, crop.x - REG.x, crop.y - REG.y, crop.w, crop.h);
  // 2. Upscale (nearest-neighbour), then light it on the sprite's own pixels: a warm ivory key added from the beam
  // side (top-right) and a faint violet bounce from the dark stage (bottom-left).
  const u = SC * k;
  cv = document.createElement('canvas');
  cv.width = REG.w * u;
  cv.height = REG.h * u;
  const g = cv.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  g.drawImage(base, 0, 0, cv.width, cv.height);
  const ov = document.createElement('canvas');
  ov.width = cv.width;
  ov.height = cv.height;
  const og = ov.getContext('2d')!;
  og.drawImage(cv, 0, 0);
  og.globalCompositeOperation = 'source-in';
  const kl = og.createLinearGradient(cv.width * 0.92, 0, cv.width * 0.3, cv.height * 0.85);
  kl.addColorStop(0, 'rgba(246,240,223,0.26)');
  kl.addColorStop(0.5, 'rgba(246,240,223,0.1)');
  kl.addColorStop(1, 'rgba(246,240,223,0)');
  og.fillStyle = kl;
  og.fillRect(0, 0, ov.width, ov.height);
  g.globalCompositeOperation = 'lighter';
  g.drawImage(ov, 0, 0);
  g.globalCompositeOperation = 'source-atop';
  const bl = g.createLinearGradient(cv.width * 0.75, cv.height * 0.1, cv.width * 0.15, cv.height);
  bl.addColorStop(0, 'rgba(122,77,255,0)');
  bl.addColorStop(0.6, 'rgba(122,77,255,0)');
  bl.addColorStop(1, 'rgba(122,77,255,0.18)');
  g.fillStyle = bl;
  g.fillRect(0, 0, cv.width, cv.height);
  g.globalCompositeOperation = 'source-over';
  faceCache.set(key, cv);
  return cv;
}

/** Screen point of crop pixel coords (cx, cy) when the face pivot sits on (fx, fy) at push `push`. */
function facePt(env: Env, cx: number, cy: number, fx: number, fy: number, push: number): [number, number] {
  const f = env.art.hero.face;
  const [px, py] = pivot(env);
  const s = SC * push;
  return [fx + (f.x - REG.x + cx - px) * s, fy + (f.y - REG.y + cy - py) * s];
}

/** Iris centre (continuous crop coords) of `key`: the studio anchors give the 2x2 block's first pixel centre. */
function irisOf(env: Env, key: SoloKey, which: 'eyeL' | 'eyeR'): [number, number] {
  const [x, y] = soloPic(env, key).anchor(which);
  return [x + 0.5, y + 0.5];
}

/** Crop pixels where the pupils WERE in `from` and the eye white shows in `to`: the dart's violet exposure. */
function uncovered(env: Env, from: SoloKey, to: SoloKey): [number, number][] {
  const k = `${from}>${to}`;
  let out = expoCache.get(k);
  if (out) return out;
  out = [];
  const a = soloPic(env, from), b = soloPic(env, to);
  if (a.w === b.w && a.h === b.h && a.px !== b.px) {
    for (let y = 0; y < a.h; y++)
      for (let x = 0; x < a.w; x++) {
        const i = (y * a.w + x) * 4;
        const dark = a.px[i + 3] > 200 && a.px[i] < 60 && a.px[i + 1] < 40;
        const white = b.px[i + 3] > 200 && b.px[i] > 235 && b.px[i + 1] > 235 && b.px[i + 2] > 235;
        if (dark && white) out.push([x, y]);
      }
  }
  expoCache.set(k, out);
  return out;
}

// ---------------------------------------------------------------- the pool (a pure function of t)

interface Pool {
  /** Hole / light ellipse (screen px). */
  x: number;
  y: number;
  rx: number;
  ry: number;
  soft: number;
  /** Lamp ramp 0..1 (the 2-frame strike). */
  ramp: number;
  /** Where the face pivot sits, and the push. */
  fx: number;
  fy: number;
  push: number;
  /** Ambient spill of the spot on the stage (plum vs black outside the pool). */
  spill: number;
  /** Beam strength factor (the iris passes less light). */
  beam: number;
  /** Beat-flare gain (1 or 1.25). */
  gain: number;
}

function poolAt(env: Env, t: number): Pool | null {
  if (t < T_ON - 1e-6 || t >= T_SHUT + 1 / 60 - 1e-6) return null;
  const ramp = clamp((t - T_ON + 1 / 60) / (2 / 60));
  const open = lerp(0.7, 1, ease.outBack(clamp((t - T_ON) / OPEN)));
  const up = ease.inOutCubic(clamp((t - T_RISE) / RISE));
  const fl = stage.flare(t, T_GLINT);
  const fx = P0.x, fy = lerp(P0.y, P1.y, up);
  const push = lerp(1, 1.06, clamp((t - T_ON) / (DUR - T_ON)));
  let rx = P0.rx * open * lerp(1, P1.rx / P0.rx, up) * fl.size;
  let ry = P0.ry * open * fl.size;
  let x = fx, y = fy, soft = SOFT, spill = ramp, beam = ramp;
  const iris = clamp((t - T_OFF) / (T_SHUT - T_OFF));
  if (iris > 0) {
    // The operator irises down onto his RIGHT eye (screen-left in a front view): fast at first, then it lingers.
    const e = ease.outQuad(iris);
    const [ix, iy] = irisOf(env, 'G2', 'eyeL');
    const [ex, ey] = facePt(env, ix - 1, iy + 0.3, fx, fy, push); // the centre of the eye (white + iris)
    const m = ease.outCubic(clamp(iris * 1.5));
    x = lerp(fx, ex, m);
    y = lerp(fy, ey, m);
    rx = lerp(rx, 6, e);
    ry = lerp(ry, 5, e);
    soft = lerp(SOFT, 2.5, e);
    spill = ramp * (1 - e) * (1 - e);
    beam = ramp * lerp(1, 0.35, e);
  }
  return { x, y, rx, ry, soft, ramp, fx, fy, push, spill, beam, gain: fl.gain };
}

// ---------------------------------------------------------------- drawing helpers

/** The pool's light on the backdrop: an ivory core toward the beam, lilac, then ultraviolet at the rim. */
function poolLight(ctx: CanvasRenderingContext2D, p: Pool) {
  const R = p.rx + p.soft;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(1, p.ry / p.rx);
  const gr = ctx.createRadialGradient(p.rx * 0.06, -p.rx * 0.12, 0, 0, 0, R);
  gr.addColorStop(0, 'rgb(220,208,222)');
  gr.addColorStop(0.24, 'rgb(196,178,226)');
  gr.addColorStop(0.5, 'rgb(140,108,214)');
  gr.addColorStop(0.78, 'rgb(84,52,168)');
  gr.addColorStop(1, 'rgb(42,22,96)');
  ctx.fillStyle = gr;
  ctx.fillRect(-R, -R, R * 2, R * 2);
  ctx.restore();
}

/**
 * The plum stage around the pool (normal blend, drawn over everything inside the frame): the outside colour (plum
 * where the spot spills, black once the iris closes), a faint uvDeep haze hugging the pool, and the soft hole. The
 * hole is stepped ellipses (destination-out) so the falloff is a uniform `soft` px all round. One reused canvas.
 */
function curtain(ctx: CanvasRenderingContext2D, p: Pool) {
  if (!curtainCv) {
    curtainCv = document.createElement('canvas');
    curtainCv.width = VW;
    curtainCv.height = VH;
  }
  const g = curtainCv.getContext('2d')!;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';
  g.clearRect(0, 0, VW, VH);
  g.fillStyle = css(mix(FADE, PAL.plum, p.spill));
  g.fillRect(0, 0, VW, VH);
  // uvDeep haze around the pool.
  if (p.spill > 0) {
    const H = p.rx + 110;
    g.save();
    g.translate(p.x, p.y);
    g.scale(1, (p.ry + 70) / H);
    const hz = g.createRadialGradient(0, 0, p.rx * 0.8, 0, 0, H);
    hz.addColorStop(0, css(PAL.uvDeep, 0.85 * p.spill));
    hz.addColorStop(0.45, css(PAL.uvDeep, 0.4 * p.spill));
    hz.addColorStop(1, css(PAL.uvDeep, 0));
    g.fillStyle = hz;
    g.fillRect(-H, -H, H * 2, H * 2);
    g.restore();
  }
  // The soft hole: rings from rx + soft in to rx, each removing a little more (smoothstep profile).
  g.globalCompositeOperation = 'destination-out';
  g.fillStyle = '#000';
  const N = Math.max(2, Math.round(p.soft * 1.5));
  let prev = 1;
  for (let j = 1; j <= N; j++) {
    const f = j / N;
    const target = 1 - p.ramp * f * f * (3 - 2 * f);
    const a = prev > 1e-6 ? 1 - target / prev : 1;
    prev = target;
    const grow = p.soft * (1 - f);
    g.globalAlpha = clamp(a);
    g.beginPath();
    g.ellipse(p.x, p.y, p.rx + grow, p.ry + grow, 0, 0, TAU);
    g.fill();
  }
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(curtainCv, 0, 0, VW, VH);
  ctx.restore();
}

/** A four-point eye glint in ivory with a lilac glow over a uvDeep halo (no cyan anywhere). */
function glint(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: number, rot: number) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  drawGlow(ctx, glowOf(PAL.uvDeep), x, y, r * 0.7, 0.3 * a);
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.lilac), x, y, r * 0.5, 0.55 * a);
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = clamp(a);
  ctx.fillStyle = HEX.ivory;
  for (let i = 0; i < 4; i++) {
    const len = i % 2 ? r * 0.62 : r;
    ctx.rotate(Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, -len);
    ctx.lineTo(r * 0.1, 0);
    ctx.lineTo(0, len * 0.08);
    ctx.lineTo(-r * 0.1, 0);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = clamp(a);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-1.5, -1.5, 3, 3);
  ctx.restore();
}

/** Small deterministic hash -> [0, 1). */
const h01 = (i: number, s: number) => {
  const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/**
 * Dust in the light: a few motes drifting slowly down and to the left (away from the beam) through the pool, in front
 * of his face. Pure f(t), clipped to the pool, faded toward its edge so nothing pops; normal blend ('mote' colours).
 */
function poolMotes(ctx: CanvasRenderingContext2D, p: Pool, t: number) {
  const k = p.ramp * clamp(p.rx / 120);
  if (k <= 0) return;
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, TAU);
  ctx.clip();
  for (let i = 0; i < 14; i++) {
    const v = (h01(i, 21) + t * (0.08 + 0.08 * h01(i, 22))) % 1;
    const x = p.x + (h01(i, 23) * 2 - 1) * p.rx * 0.92 - t * (8 + 10 * h01(i, 24));
    const y = p.y + (v * 2 - 1) * p.ry;
    const d = ((x - p.x) / p.rx) ** 2 + ((y - p.y) / p.ry) ** 2;
    const a = k * (0.22 + 0.3 * h01(i, 25)) * clamp((1 - d) * 3) * (0.8 + 0.2 * Math.sin(t * 9 + i * 2.1));
    if (a <= 0.01) continue;
    ctx.globalAlpha = a;
    ctx.fillStyle = h01(i, 26) < 0.6 ? HEX.ivory : HEX.lilac;
    const q = h01(i, 27) < 0.25 ? 2 : 1;
    ctx.fillRect(Math.round(x), Math.round(y), q, q);
  }
  ctx.restore();
}

/** The lamps' filament decay after the CHUNK (1, then 0.42, 0.12, 0 on the next frames). */
function lampsOn(t: number): number {
  if (t < T_OFF - 1e-6) return 1;
  const f = Math.floor((t - T_OFF) * 60 + 1e-6);
  return f <= 0 ? 0.42 : f === 1 ? 0.12 : 0;
}

// ---------------------------------------------------------------- the shot

export const shotCountIn: Shot = {
  name: 'Count-in',
  dur: DUR,
  seed: 501,
  cues: [
    { at: 0, fn: (env) => env.sfx.stinger() },
    { at: T_ON, fn: (env) => env.sfx.spotOn(1.0) },
    { at: T_G2L, fn: (env) => env.sfx.hat() },
    { at: T_G2, fn: (env) => env.sfx.hat() },
    { at: T_GLINT, fn: (env) => env.sfx.shing(1.2) },
    ...CLICKS.map((at) => ({
      at,
      fn: (env: Env) => {
        env.sfx.sticks();
        env.sfx.spotOn(0.3);
      },
    })),
    { at: 1.0, fn: (env) => env.sfx.crashSwell(0.4) },
    { at: T_OFF, fn: (env) => env.sfx.lightsOff(0.4) },
  ],
  prepare(env) {
    const keys: SoloKey[] = ['G1', 'G2L', 'G2'];
    warmSolo(env, keys);
    for (const k of keys) faceCanvas(env, k);
    uncovered(env, 'G1', 'G2L');
    uncovered(env, 'G2L', 'G2');
  },
  init(env) {
    env.sfx.clearBus();
    env.cam.set(VW / 2, VH / 2, 1, 0);
  },
  update(env, t) {
    // The lamp hum is a seek-exact state: on while the spot is on (0.05-1.25).
    env.sfx.hum(HUM[1](t));
  },
  render(env, t) {
    const ctx = env.ctx;
    env.screen();
    soloGrade(env.fx, { bloom: 0.75, bloomThresh: 0.76, vignette: 0.65 });
    ctx.fillStyle = css(FADE);
    ctx.fillRect(-8, -8, VW + 16, VH + 16);
    const p = poolAt(env, t);
    if (!p) return; // total black: before the CLUNK, and the two frames before the cut

    const key = soloAt(SEQ[1], t);

    // ---- inside the pool: the light, his face, the dart exposures
    poolLight(ctx, p);
    const face = faceCanvas(env, key);
    const [pvx, pvy] = pivot(env);
    const s = SC * p.push;
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(face, p.fx - pvx * s, p.fy - pvy * s, REG.w * s, REG.h * s);
    ctx.restore();
    // Each dart leaves a 2-frame violet exposure of the pupils where they were.
    for (const [at, from, to] of [[T_G2L, 'G1', 'G2L'], [T_G2, 'G2L', 'G2']] as const) {
      const f = Math.floor((t - at) * 60 + 1e-6);
      if (t < at - 1e-6 || f > 1) continue;
      ctx.globalAlpha = f === 0 ? 0.78 : 0.42;
      for (const [cx, cy] of uncovered(env, from, to)) {
        const [x0, y0] = facePt(env, cx, cy, p.fx, p.fy, p.push);
        ctx.fillStyle = HEX.uv;
        ctx.fillRect(x0, y0, s, s);
        ctx.fillStyle = HEX.lilac;
        ctx.fillRect(x0, y0, s, 1);
      }
      ctx.globalAlpha = 1;
    }
    // Beat flare (0.45, 2 frames): the pool brightens (its growth is in poolAt). Local to the pool.
    if (p.gain > 1) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.translate(p.x, p.y);
      ctx.scale(1, p.ry / p.rx);
      const fg = ctx.createRadialGradient(0, 0, 0, 0, 0, p.rx);
      fg.addColorStop(0, 'rgba(246,240,223,0.14)');
      fg.addColorStop(0.7, 'rgba(201,182,255,0.08)');
      fg.addColorStop(1, 'rgba(201,182,255,0)');
      ctx.fillStyle = fg;
      ctx.fillRect(-p.rx, -p.rx, p.rx * 2, p.rx * 2);
      ctx.restore();
    }

    // ---- the dark stage around it (plum, uvDeep haze, the 12 px soft edge), then dust in the light
    curtain(ctx, p);
    poolMotes(ctx, p, t);

    // ---- the follow-spot: its lens glare at the top-right and the tapered beam landing on the pool
    {
      const [lx, ly] = LAMP;
      const dx = p.x - lx, dy = p.y - ly;
      const L = Math.hypot(dx, dy) || 1;
      const nx = -dy / L, ny = dx / L;
      // Widest shaft whose foot still lands inside the pool (its corners sit on the pool's edge).
      const w1 = (0.96 * 2) / Math.sqrt((nx * nx) / (p.rx * p.rx) + (ny * ny) / (p.ry * p.ry));
      ctx.save();
      ctx.beginPath();
      ctx.rect(-20, -60, VW + 40, VH + 80);
      ctx.ellipse(p.x, p.y, p.rx * 0.97, p.ry * 0.97, 0, 0, TAU);
      ctx.clip('evenodd');
      stage.beam(ctx, lx, ly, p.x, p.y, 30, w1, 0.18 * p.beam, { t, motes: 28, seed: 7 });
      ctx.restore();
      ctx.save();
      drawGlow(ctx, glowOf(PAL.uvDeep), lx, ly, 92, 0.8 * p.ramp);
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.lilac), lx, ly, 56, 0.34 * p.beam);
      drawGlow(ctx, glowOf(PAL.ivory), lx, ly, 30, 0.85 * p.beam);
      ctx.restore();
    }

    // ---- 0.45 glint: both eyes, a lilac anamorphic flare
    const gl = pulse(t, T_GLINT, 0.22);
    if (gl > 0 && t < T_OFF) {
      const ge = gl * gl;
      (['eyeL', 'eyeR'] as const).forEach((w, i) => {
        const [ix, iy] = irisOf(env, key, w);
        const [ex, ey] = facePt(env, ix, iy, p.fx, p.fy, p.push);
        glint(ctx, ex + 3, ey - 3, 6 + 15 * gl, ge, 0.3 + i * 0.5 + t * 1.6);
        if (i === 1) lensFlare(ctx, ex, ey, 40, ge * 0.38, PAL.lilac);
      });
    }

    // ---- the count-in: the title lights word by word under its lamps, the four pads, the tag
    const on = lampsOn(t);
    if (on > 0) {
      const A = clamp((t - 0.48) / 0.12) * on;
      const groups = lampTitle(ctx, TITLE, VW / 2, TITLE_Y, 56, t, CLICKS, { flareAt: CLICKS[3], alpha: A });
      ctx.save();
      ctx.translate(PADS_DX, PADS_DY);
      fourCount(ctx, CLICKS, t, { alpha: A });
      ctx.restore();
      const tt = t - T_TAG;
      if (tt >= 0) {
        const k = ease.outCubic(clamp(tt / (3 / 60)));
        ctx.save();
        ctx.globalAlpha = clamp(tt / (3 / 60) + 0.34) * on;
        pixelText(ctx, TAG, Math.round(VW / 2 - 12 * (1 - k)), TAG_Y, 10, HEX.lilac, 'center', HEX.plum);
        ctx.restore();
      }
      // fx.echo for 3 frames on each click, centred on the group that lights (it throws its light to the left).
      CLICKS.forEach((at, i) => echoAt(env, t, at, 3, 0.7, -0.01, { sx: groups[i].cx, sy: TITLE_Y - 20, R: 0.2 }));
    }
  },
};
