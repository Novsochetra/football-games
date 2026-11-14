// Small shared figures and foregrounds (added for MERIDIAN THREAD, usable by any skill):
//   - drawFrontFigure: a small front-view player (36-46 px tall) with a 2-frame shuffle, a body lean and a head turn,
//     rasterised as pixel art in the kit's palette and cached (no per-frame canvas allocation);
//   - drawGrassFore: a pre-rendered, tileable strip of dark grass-blade silhouettes along the bottom of the frame,
//     static or smeared (motion).
// Nothing here is drawn unless a shot calls it.

import { PixelBuffer, pack } from '../engine/pixel';
import { Rng, clamp } from '../engine/math';
import { VW, VH } from '../engine/camera';
import type { Kit } from './puppet';

// ---------------------------------------------------------------- Front-view figure

const figCache = new WeakMap<Kit, Map<string, { cv: HTMLCanvasElement; ox: number; oy: number }>>();
let figCount = 0;

/**
 * A small front-view player (defenders seen from No.10's side: the over-the-shoulder read), feet centred on (x, y),
 * 46 px tall at scale 1 (use 0.78-1 for 36-46 px by depth). Drawn 1:1 in the current transform (crisp pixels).
 *   lean      body lean in radians round the hips (negative = toward screen-left; the far side in a back view);
 *   headTurn  -1..1, head and shoulders swivel (negative = looking screen-left), the face slides that way;
 *   frame     0 / 1: the 2-frame shuffle (one heel lifts, then the other).
 * Cached per kit, scale (0.02 steps), lean (0.05 rad), head turn (0.1) and frame: warm the poses a shot uses in prepare().
 */
export function drawFrontFigure(
  ctx: CanvasRenderingContext2D, kit: Kit, x: number, y: number, scale: number, lean = 0, headTurn = 0, frame = 0, alpha = 1,
) {
  const f = frontFigure(kit, scale, lean, headTurn, frame);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = clamp(alpha);
  ctx.drawImage(f.cv, Math.round(x - f.ox), Math.round(y - f.oy));
  ctx.restore();
}

/** The cached raster behind drawFrontFigure (canvas + the feet point inside it). */
export function frontFigure(kit: Kit, scale: number, lean = 0, headTurn = 0, frame = 0) {
  const sc = Math.max(0.3, Math.round(scale * 50) / 50);
  const ln = Math.round(lean * 20) / 20;
  const tn = Math.round(clamp(headTurn, -1, 1) * 10) / 10;
  const fr = frame & 1;
  const key = `${sc}|${ln}|${tn}|${fr}`;
  let m = figCache.get(kit);
  if (!m) figCache.set(kit, (m = new Map()));
  let hit = m.get(key);
  if (!hit) {
    hit = rasterFront(kit, sc, ln, tn, fr);
    m.set(key, hit);
    if (++figCount > 512) {
      // Bounded: drop this kit's oldest entries.
      for (const k of [...m.keys()].slice(0, 64)) m.delete(k);
      figCount -= 64;
    }
  }
  return hit;
}

function rasterFront(kit: Kit, s: number, lean: number, turn: number, frame: number) {
  const W = Math.ceil(44 * s) + 6, Hh = Math.ceil(54 * s) + 6;
  const buf = new PixelBuffer(W, Hh);
  buf.lx = -0.45;
  buf.ly = -0.9;
  const ox = W / 2, oy = Hh - 3;
  const hipY = -21;
  const cl = Math.cos(lean), sl = Math.sin(lean);
  // Units -> pixels; points above the hips rotate round the hip centre by `lean`.
  const P = (ux: number, uy: number, upper = false): [number, number] => {
    if (upper) {
      const dy = uy - hipY;
      const rx = ux * cl - dy * sl, ry = ux * sl + dy * cl;
      return [ox + rx * s, oy + (hipY + ry) * s];
    }
    return [ox + ux * s, oy + uy * s];
  };
  const r = (u: number) => Math.max(0.7, u * s);
  const cap = (a: [number, number], b: [number, number], rad: number, c: number | [number, number, number]) => buf.capsule(a[0], a[1], b[0], b[1], r(rad), c);
  const lift = (side: number) => (frame === (side < 0 ? 0 : 1) ? 1.6 : 0);
  // Legs (socks + boots), knees soft.
  for (const side of [-1, 1]) {
    const up = lift(side);
    const hip = P(side * 3.6, hipY + 1), knee = P(side * 4.4, -11 - up * 0.6), ankle = P(side * 4.6, -2.6 - up);
    cap(hip, knee, 2.6, kit.skin);
    cap(P(side * 4.4, -9 - up * 0.6), ankle, 2.4, kit.socks);
    cap(P(side * 4.2, -1.2 - up), P(side * 5.6, -1 - up), 2.1, kit.boots);
  }
  // Shorts.
  const sh = (side: number) => P(side * 6.4, hipY - 2, true);
  buf.poly([...P(-6.4, hipY - 3.5, true), ...P(6.4, hipY - 3.5, true), ...P(7, hipY + 4, true), ...P(1, hipY + 4.5, true), ...P(-1, hipY + 4.5, true), ...P(-7, hipY + 4, true)], kit.shorts[1]);
  void sh;
  // Shoulders narrow a little as he turns.
  const shW = 7.2 - Math.abs(turn) * 1.2;
  const shY = -36;
  // Arms (behind the torso edge), hands by the hips, spread a little.
  for (const side of [-1, 1]) {
    const sx = side * shW + turn * 0.6;
    const elbow = P(side * (shW + 2.2) + turn * 0.4, shY + 7, true), hand = P(side * (shW + 2.6), shY + 13.5, true);
    cap(P(sx, shY + 1, true), elbow, 2.2, kit.skin);
    cap(elbow, hand, 1.9, kit.skin);
    cap(P(sx, shY + 1, true), P(side * (shW + 1.4), shY + 4, true), 2.6, kit.shirt);
  }
  // Torso (shirt), collar trim.
  buf.poly([...P(-shW, shY, true), ...P(shW, shY, true), ...P(6.2, hipY - 2, true), ...P(-6.2, hipY - 2, true)], kit.shirt[1]);
  cap(P(-shW + 1.5, shY + 1.5, true), P(-5, hipY - 3, true), 1.6, kit.shirt[2]);
  {
    const c = P(turn * 1.2, shY + 0.2, true);
    buf.circle(c[0], c[1], r(1.7), kit.trim);
  }
  // Head: hair mass behind, face toward the turn.
  const hc = P(turn * 0.6, -41.5, true);
  const face = P(turn * 1.8, -40.8, true);
  buf.circle(hc[0], hc[1] - 1.2 * s, r(5.6), kit.hair);
  buf.circle(face[0], face[1], r(4.4), kit.skin);
  // Fringe over the brow.
  const fr0 = P(turn * 1.8 - 4, -44.6, true), fr1 = P(turn * 1.8 + 4, -44.6, true);
  buf.capsule(fr0[0], fr0[1], fr1[0], fr1[1], r(1.4), kit.hair[1]);
  // Eyes (the far one hides as he turns).
  const eyeC = pack(24, 4, 17);
  for (const side of [-1, 1]) {
    if (turn * side < -0.65) continue;
    const e = P(turn * 3 + side * 1.9 * (1 - Math.abs(turn) * 0.35), -41, true);
    buf.set(e[0], e[1], eyeC);
    if (s >= 0.95) buf.set(e[0], e[1] + 1, eyeC);
  }
  buf.outline();
  // Own canvas (PixelBuffer canvases are reused per buffer; this one is ours).
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = Hh;
  cv.getContext('2d')!.drawImage(buf.flush(), 0, 0);
  return { cv, ox, oy };
}

// ---------------------------------------------------------------- Grass foreground

let grassStrip: HTMLCanvasElement | null = null;
const GRASS_W = VW, GRASS_H = 44;

/** Build the grass-blade strip once (call from prepare(); drawGrassFore builds it lazily otherwise). */
export function prepareGrassFore() {
  if (grassStrip) return grassStrip;
  const buf = new PixelBuffer(GRASS_W, GRASS_H);
  const rng = new Rng(4242);
  const dark = pack(10, 22, 14), mid = pack(18, 40, 24), tip = pack(30, 62, 36);
  const blade = (bx: number, h: number, w: number, bend: number, c: number) => {
    for (const off of [-GRASS_W, 0, GRASS_W]) {
      const x0 = bx + off;
      if (x0 < -40 || x0 > GRASS_W + 40) continue;
      buf.poly([x0 - w, GRASS_H, x0 + w, GRASS_H, x0 + bend + 0.6, GRASS_H - h, x0 + bend - 0.6, GRASS_H - h], c);
    }
  };
  // Back row (lighter, shorter), then front row (darker, taller).
  for (let i = 0; i < 150; i++) blade(rng.range(0, GRASS_W), rng.range(8, 22), rng.range(1, 2.2), rng.range(-5, 5), mid);
  for (let i = 0; i < 70; i++) {
    const bx = rng.range(0, GRASS_W), h = rng.range(16, 40), bend = rng.range(-9, 9);
    blade(bx, h, rng.range(1.4, 3), bend, dark);
    if (rng.next() < 0.4) blade(bx + bend * 0.2, h * 0.5, 0.6, bend * 0.6, tip);
  }
  for (let x = 0; x < GRASS_W; x++) for (let y = GRASS_H - 5; y < GRASS_H; y++) buf.set(x, y, dark);
  const cv = document.createElement('canvas');
  cv.width = GRASS_W;
  cv.height = GRASS_H;
  cv.getContext('2d')!.drawImage(buf.flush(), 0, 0);
  grassStrip = cv;
  return cv;
}

/**
 * Dark grass-blade silhouettes along the bottom edge of the frame (screen space; call env.screen() first): the strip
 * tiles horizontally, scrolled by scrollX (logical px). smear > 0 (px) draws it as a horizontal motion smear (shot 6's
 * rail); 0 = static and crisp (shot 4's locked panel 1). o.y = bottom edge (default VH), o.scale = integer height scale.
 */
export function drawGrassFore(
  ctx: CanvasRenderingContext2D, scrollX: number, smear = 0, o: { y?: number; scale?: number; alpha?: number; x0?: number; w?: number } = {},
) {
  const cv = prepareGrassFore();
  const sc = Math.max(1, Math.round(o.scale ?? 1));
  const bottom = o.y ?? VH;
  const x0 = o.x0 ?? 0, w = o.w ?? VW;
  const tw = GRASS_W * sc, th = GRASS_H * sc;
  const a = clamp(o.alpha ?? 1);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  const pass = (dx: number, al: number) => {
    ctx.globalAlpha = al;
    const start = x0 - ((((scrollX + dx) * 1) % tw) + tw) % tw;
    for (let x = start; x < x0 + w; x += tw) ctx.drawImage(cv, Math.round(x), Math.round(bottom - th), tw, th);
  };
  if (smear > 0.5) {
    const n = Math.min(6, Math.ceil(smear / 4) + 1);
    for (let i = n - 1; i >= 1; i--) pass(-(smear * i) / (n - 1), a * 0.22);
  }
  pass(0, a);
  ctx.restore();
}
