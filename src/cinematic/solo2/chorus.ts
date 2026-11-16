// SPOTLIGHT SOLO v2: the Chorus (SPEC.md §1.2, §10.4 item 19): crisp additive ultraviolet copies of No.10's drawn frames
// (line, fan, throw, pulse, wipe) and the strobe chain of the ball. Look: an additive volt body at 0.55 over a uvDeep
// halo, a 1 px ivory rim on the beam side, a 2 px uv outer glow, 3-5 horizontal speed lines cut through; one canvas
// per (frame, scale, light side), built once. Caps: 8 hero copies and 12 ball exposures a frame (counted from frame());
// fades step on the 16th grid. NEVER a decoy: nobody touches, tackles or passes through a copy; nothing blinks out.
//
// Every method is a pure draw call of (birth time, now): no state but the per-frame counters, so shots seek exactly.

import type { Env } from '../timeline';
import { clamp, lerp } from '../../engine/math';
import { soloPic, soloTopLeft, soloView, type SoloKey } from './frames';
import { PAL } from './common';

/** Stepped strobe decay: a0 for the first `hold`, then 2/3, 1/3, 0 on the next three 16ths (0.1 s each). */
export function stepFade(age: number, a0 = 0.55, hold = 0) {
  if (age < 0) return 0;
  const u = age - hold;
  if (u < 0) return a0;
  return u < 0.1 ? a0 : u < 0.2 ? a0 * (2 / 3) : u < 0.3 ? a0 / 3 : 0;
}

const copyCache = new Map<string, HTMLCanvasElement>();
const haloCache = new Map<string, HTMLCanvasElement>();

/**
 * The Chorus copy canvas of `key` at integer-ish `scale` (screen px per sprite px), lit from the light side (lx, ly)
 * (image space; mirrored frames pass the mirrored side). Volt body, ivory 1 px rim on the lit edge, a 2 px uv glow
 * ring, 3-5 horizontal speed-line cuts (seeded per key). Cached.
 */
export function chorusCanvas(env: Env, key: SoloKey, scale: number, lx: number, ly: number): HTMLCanvasElement {
  const p = soloPic(env, key);
  const S = Math.max(1, Math.round(scale * 4) / 4);
  const sx = Math.sign(Math.round(lx)), sy = Math.sign(Math.round(ly));
  const ck = `${p.id}|${S}|${sx},${sy}`;
  let cv = copyCache.get(ck);
  if (cv) return cv;
  const W = Math.ceil(p.w * S) + 4, H = Math.ceil(p.h * S) + 4;
  const mask = new Uint8Array(W * H);
  for (let y = 0; y < H - 4; y++)
    for (let x = 0; x < W - 4; x++) {
      const u = Math.min(p.w - 1, Math.floor(x / S)), v = Math.min(p.h - 1, Math.floor(y / S));
      if (p.px[(v * p.w + u) * 4 + 3] > 40) mask[(y + 2) * W + (x + 2)] = 1;
    }
  // Speed-line cuts: 3-5 horizontal rows of 1-2 px, seeded by the key.
  let hsh = 0;
  for (const c of key) hsh = (hsh * 31 + c.charCodeAt(0)) >>> 0;
  const cuts: number[] = [];
  const nc = 3 + (hsh % 3);
  for (let i = 0; i < nc; i++) cuts.push(Math.floor(H * (0.25 + 0.5 * (((hsh >>> (i * 3)) % 97) / 97))));
  cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const g = cv.getContext('2d')!;
  const img = g.createImageData(W, H);
  const d = img.data;
  const at = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && mask[y * W + x] === 1;
  const put = (i: number, c: readonly number[], a: number) => {
    d[i * 4] = c[0];
    d[i * 4 + 1] = c[1];
    d[i * 4 + 2] = c[2];
    d[i * 4 + 3] = a;
  };
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (at(x, y)) {
        if (cuts.some((c) => y === c || (S >= 3 && y === c + 1))) continue;
        const rim = (sx !== 0 && !at(x + sx, y)) || (sy !== 0 && !at(x, y + sy));
        put(i, rim ? PAL.ivory : PAL.volt, 255);
      } else {
        let near = false;
        for (let dy = -2; dy <= 2 && !near; dy++) for (let dx = -2; dx <= 2 && !near; dx++) if (at(x + dx, y + dy)) near = true;
        if (near) put(i, PAL.uv, 150);
      }
    }
  g.putImageData(img, 0, 0);
  copyCache.set(ck, cv);
  // The uvDeep halo under the copy (normal blend): the mask dilated by 3 px, so the additive body never sits on a bright field.
  const halo = document.createElement('canvas');
  halo.width = W;
  halo.height = H;
  const hg = halo.getContext('2d')!;
  const hi = hg.createImageData(W, H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let near = false;
      for (let dy = -3; dy <= 3 && !near; dy++) for (let dx = -3; dx <= 3 && !near; dx++) if (at(x + dx, y + dy)) near = true;
      if (!near) continue;
      const i = (y * W + x) * 4;
      hi.data[i] = PAL.uvDeep[0];
      hi.data[i + 1] = PAL.uvDeep[1];
      hi.data[i + 2] = PAL.uvDeep[2];
      hi.data[i + 3] = 200;
    }
  hg.putImageData(hi, 0, 0);
  haloCache.set(ck, halo);
  return cv;
}

/** The uvDeep halo canvas of a Chorus copy (built with it). */
function chorusHalo(env: Env, key: SoloKey, scale: number, lx: number, ly: number): HTMLCanvasElement {
  const p = soloPic(env, key);
  const S = Math.max(1, Math.round(scale * 4) / 4);
  const ck = `${p.id}|${S}|${Math.sign(Math.round(lx))},${Math.sign(Math.round(ly))}`;
  if (!haloCache.has(ck)) chorusCanvas(env, key, scale, lx, ly);
  return haloCache.get(ck)!;
}

export interface CopyOpts {
  flip?: boolean;
  anchor?: string;
  /** Peak alpha (default 0.55). */
  a?: number;
  /** Hold at the peak before the stepped fade (s, default 0). */
  hold?: number;
  /** Light side in image space (default top-right for side views, top otherwise). */
  lx?: number;
  ly?: number;
}

export class Chorus {
  /** Copies / exposures drawn since frame() (the caps). */
  heroes = 0;
  balls = 0;
  constructor(public maxHero = 8, public maxBall = 12) {}
  frame() {
    this.heroes = 0;
    this.balls = 0;
  }

  /** One copy of `key` placed like drawSolo (anchor on (x, y)), born t0, at shot time t (stepped fade). Additive. */
  drop(env: Env, key: SoloKey, x: number, y: number, scale: number, t0: number, t: number, o: CopyOpts = {}) {
    const a = t < t0 ? 0 : stepFade(t - t0, o.a ?? 0.55, o.hold ?? 0);
    if (a <= 0 || this.heroes >= this.maxHero) return;
    this.heroes++;
    this.blit(env, key, x, y, scale, a, o);
  }

  /** The halo under a copy (uvDeep, normal blend) and the copy itself (additive) at alpha a. */
  private blit(env: Env, key: SoloKey, x: number, y: number, scale: number, a: number, o: CopyOpts) {
    const view = soloView(key);
    let lx = o.lx ?? (view === 'side' || view === 'macro' ? 1 : 0);
    const ly = o.ly ?? -1;
    if (o.flip) lx = -lx;
    const cv = chorusCanvas(env, key, scale, lx, ly);
    const [tx, ty] = soloTopLeft(env, key, x, y, scale, { anchor: o.anchor, flip: false });
    const S = Math.max(1, Math.round(scale * 4) / 4);
    const pad = (2 * scale) / S;
    const ctx = env.ctx;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    // Mirror about the anchor's vertical line when flipped (copies may mirror: they carry no readable number).
    if (o.flip) {
      ctx.translate(x, 0);
      ctx.scale(-1, 1);
      ctx.translate(-x, 0);
    }
    const X = tx - pad, Y = ty - pad;
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = clamp(a * 0.6);
    ctx.drawImage(chorusHalo(env, key, scale, lx, ly), X, Y, (cv.width * scale) / S, (cv.height * scale) / S);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = clamp(a);
    ctx.drawImage(cv, X, Y, (cv.width * scale) / S, (cv.height * scale) / S);
    ctx.restore();
  }

  /** The Chorus line: copies at x + offsets (alternating sides, e.g. [14, -14, 28, -28, 42, -42]). */
  line(env: Env, key: SoloKey, x: number, y: number, scale: number, t0: number, t: number, offsets: readonly number[], o: CopyOpts = {}) {
    offsets.forEach((dx, i) => this.drop(env, key, x + dx, y, scale, t0, t, { ...o, a: (o.a ?? 0.55) * (1 - 0.12 * Math.floor(i / 2)) }));
  }

  /**
   * The fan stepping out on the drum: n copies at ±spread·k (k = 1..n/2), alpha a, that snap back `kick` px over
   * 0.1 s after t0 (the speaker cone on the kick); `collapseAt` pulls them into him over 2 frames.
   */
  fan(env: Env, key: SoloKey, x: number, y: number, scale: number, t0: number, t: number, n: number, spread: number, o: CopyOpts & { kick?: number; collapseAt?: number } = {}) {
    if (t < t0) return;
    const kick = o.kick ?? 6;
    const back = t - t0 < 0.1 ? 0 : kick;
    const col = o.collapseAt !== undefined ? clamp((t - o.collapseAt) / (2 / 60)) : 0;
    for (let i = 0; i < n; i++) {
      const side = i % 2 ? -1 : 1, k = Math.floor(i / 2) + 1;
      const dx = side * (spread * k - back) * (1 - col);
      this.drop(env, key, x + dx, y, scale, t0, t, { ...o, hold: o.hold ?? 0.3 });
    }
  }

  /** The sell throw: copies thrown to one side at offsets with their own alphas (e.g. 20/40/60 px at 0.55/0.4/0.25). */
  throw(env: Env, key: SoloKey, x: number, y: number, scale: number, t0: number, t: number, offsets: readonly number[], alphas: readonly number[], o: CopyOpts = {}) {
    offsets.forEach((dx, i) => this.drop(env, key, x + dx, y, scale, t0, t, { ...o, a: alphas[i] ?? 0.3 }));
  }

  /** The beat pulse: one copy scaling 1 -> maxScale over 0.3 s from t0, fading as it grows (the curtain drop). */
  pulse(env: Env, key: SoloKey, x: number, y: number, scale: number, t0: number, t: number, maxScale = 2.4, o: CopyOpts = {}) {
    const u = (t - t0) / 0.3;
    if (u < 0 || u >= 1 || this.heroes >= this.maxHero) return;
    this.heroes++;
    this.blit(env, key, x, y, scale * lerp(1, maxScale, u), (o.a ?? 0.7) * (1 - u), o);
  }

  /**
   * The chorus wipe: copies of `keys` (cycled) at `scales`, dropped on the 32nds from t0 and sweeping across in `dir`
   * (+1 left -> right) with speed lines; each covers at most ~50 % of the frame. (x0, y) = the first copy's anchor.
   */
  wipe(env: Env, keys: readonly SoloKey[], x0: number, y: number, t0: number, t: number, scales: readonly number[], dir: 1 | -1 = 1, o: CopyOpts = {}) {
    scales.forEach((s, i) => {
      const at = t0 + i * 0.05;
      const x = x0 + dir * i * 140;
      this.drop(env, keys[i % keys.length], x, y, s, at, t, { ...o, a: o.a ?? 0.6, flip: o.flip });
    });
  }

  /**
   * The strobe chain of the ball: a crisp exposure (volt fill, ivory rim, uv glow) at each point born at its own time,
   * alive with the stepped fade. points: [{ x, y, t0, r }] (r = screen radius).
   */
  strobeChain(env: Env, points: readonly { x: number; y: number; t0: number; r: number }[], t: number, o: { a?: number; hold?: number } = {}) {
    const ctx = env.ctx;
    ctx.save();
    for (const p of points) {
      const a = t < p.t0 ? 0 : stepFade(t - p.t0, o.a ?? 0.6, o.hold ?? 0.2);
      if (a <= 0 || this.balls >= this.maxBall) continue;
      this.balls++;
      const cv = ballExposure(p.r);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = clamp(a * 0.55);
      ctx.drawImage(cv.halo, p.x - cv.halo.width / 2, p.y - cv.halo.height / 2);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = clamp(a);
      ctx.drawImage(cv.disc, p.x - cv.disc.width / 2, p.y - cv.disc.height / 2);
    }
    ctx.restore();
  }
}

const expCache = new Map<number, { disc: HTMLCanvasElement; halo: HTMLCanvasElement }>();
/** A ball exposure of screen radius r: a volt disc with an ivory rim on its upper-right and a 2 px uv glow; plus its uvDeep halo. */
export function ballExposure(r: number) {
  const R = Math.max(2, Math.round(r));
  let e = expCache.get(R);
  if (e) return e;
  const size = R * 2 + 6;
  const disc = document.createElement('canvas');
  disc.width = disc.height = size;
  const g = disc.getContext('2d')!;
  const img = g.createImageData(size, size);
  const c0 = size / 2;
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - c0, dy = y + 0.5 - c0, d = Math.hypot(dx, dy);
      const k = (y * size + x) * 4;
      let c: readonly number[] | null = null, a = 255;
      if (d <= R - 1 && d > R - 2.2 && dx - dy > 0) c = PAL.ivory;
      else if (d <= R) c = PAL.volt;
      else if (d <= R + 2) {
        c = PAL.uv;
        a = 140;
      }
      if (!c) continue;
      img.data[k] = c[0];
      img.data[k + 1] = c[1];
      img.data[k + 2] = c[2];
      img.data[k + 3] = a;
    }
  g.putImageData(img, 0, 0);
  const halo = document.createElement('canvas');
  halo.width = halo.height = size + 12;
  const hg = halo.getContext('2d')!;
  const gr = hg.createRadialGradient(halo.width / 2, halo.height / 2, 0, halo.width / 2, halo.height / 2, halo.width / 2);
  gr.addColorStop(0, 'rgba(42,22,96,0.9)');
  gr.addColorStop(1, 'rgba(42,22,96,0)');
  hg.fillStyle = gr;
  hg.fillRect(0, 0, halo.width, halo.height);
  expCache.set(R, (e = { disc, halo }));
  return e;
}

/** Warm the Chorus canvases a shot uses (prepare()). */
export function warmChorus(env: Env, keys: readonly SoloKey[], scales: readonly number[]) {
  for (const k of keys) for (const s of scales) chorusCanvas(env, k, s, soloView(k) === 'side' || soloView(k) === 'macro' ? 1 : 0, -1);
}
