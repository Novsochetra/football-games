// SPOTLIGHT SOLO v2 · shot 2 · "Lights out" (2.8 s, g 1.6-4.4, seed 512). SPEC.md §6 shot 2.
//
// Story job: make the threat huge (four giants and a whole stadium stomping), flip it with one gesture kids can copy
// (the SNAP), then show his presence through the defenders' fear. Three setups, cut on the beat:
//   2a 0.00-1.80  The wall. Low OTS behind No.10's right shoulder (Stand Back / SnapBack x3.4, back-lit, cropped at
//                 the thigh), the wall of four stomping in unison with the whole stadium (RivalFront RF1-RF3, D on the
//                 Tower's RF1T-RF3T, B / C by tone-for-tone kit swaps), back-lit by four blazing floodlight banks on the
//                 roof edge (lamp grids, cross stars, god rays through the haze, long shadows reaching at the lens).
//                 1.40 crash zoom 1.10 -> 1.90 onto his raised hand, black against the far-left bank's glare; 1.60 THE
//                 SNAP (SB3: spark, light rain from the fingers, refraction); 1.62 snap back out; 1.65 / 1.70 / 1.75 /
//                 1.80 the banks blow out one by one (cells pop, glass bursts, sparks, smoke, the dim steps 0.30 ->
//                 0.55 -> 0.75, the rims die, the wall sinks to plum silhouettes); cut on the fourth CHUNK.
//   2b 1.80-2.40  Eyes in the dark. Over the Tower's shoulder (drawUpPitch, dim 0.97 uncapped): his studio back as a
//                 plum silhouette with a 1 px lilac rim, the phone-light sea switching on in a wave, glass still
//                 glinting down from the dead roof, a boy-shaped hole in the stars; 2.00 DOOM: the ball ignites on the
//                 turf; 2.20 DOOM: two eyes open above it (Encore EN1 registered on the ball: the boots fluoresce, the
//                 ball under-lights his shins, a 30 % rim); 2.30 the smirk.
//   2c 2.40-2.80  The long shadow. Back to the OTS; 2.40 THE SLAM: the footlight behind the camera's left shoulder
//                 fires (beam impact A in its cone, E3); the wall lit hard white for the first time, forearms over
//                 their eyes (RF4 / RF4T), half a step back; his shadow (the snap silhouette, arm raised) shoots from
//                 his feet over the turf, up the wall and onto the crowd in 4 frames, blotting out the phone lights;
//                 2.44-2.68 the crane-rush rises over the wall after its head: a projected 3D move in which the shadow
//                 lies on three planes (the defenders' bodies and the turf, the goal net and boards, the far stand)
//                 that part with true parallax; his own silhouette whips out under the frame; 2.70 two eye-slits open
//                 in its head over the flinching wall.
//
// Determinism: every picture is a pure function of t (cameras, sprites, the shadow, banks, falling glass in 2b);
// particles spawn only in cues / update from env.rng; flicker from t or env.frng(). The cut frames clear the particles
// (cues at 1.80 and 2.40).

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { clamp, ease, lerp, type RGB } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import { anim, findFrame, hasAnim, type StudioAnim } from '../../art/studioAnim';
import {
  HEX, PAL, DIM_V2, HUM, RATE, SHOTS, PUPPETS, warmSolo2, warmSolo, soloLit, soloStage, soloImpact2, flatShockAt, onFrames, soloPunch,
  drawBall, drawDownPitch, drawUpPitch, drawPhoneLights, drawPitchLines, projectDecal, pitchBanks, spinAt, stage, eyeGlow, crossGlint,
  lightRain, rimLight, shadeSprite, underLight, sparkle, drawSoloFluoro, soloPic, soloPoint, soloTopLeft, rivalPic, uvSilhouette,
  type DownPitchView, type BankRect, type RivalKey, type SoloKey, type Pic, type StagePool,
} from './common';

const META = SHOTS[1];
const F = 1 / 60;

// ---------------------------------------------------------------- views and timing

/** 2a / 2c start: low over No.10's right shoulder, looking down the pitch at the wall (floodlit). */
const V2A: DownPitchView = { x: 812, z: 270, h: 9, f: 1000, horizon: 228, cx: 320 };
/** 2b: over the Tower's shoulder, looking back west at No.10 7 m away. */
const V2B: DownPitchView = { x: 930, z: 252, h: 13, f: 640, horizon: 170, cx: 320, dir: -1 };
/** 2c end of the crane-rush: risen over the wall, the flinching heads along the bottom, the shadow's bust on the crowd. */
const V2C: DownPitchView = { x: 845, z: 290, h: 24, f: 1100, horizon: 232, cx: 320 };

/** The four banks blow out on 32nds: far-left, far-right, near-left, near-right. */
const SURGE = [1.65, 1.7, 1.75, 1.8] as const;
const DIM_STEPS = [0.3, 0.55, 0.75, 0.92] as const;
const SNAP = 1.6;
const IGNITE = 2.0;
const EYES = 2.2;
const SMIRK = 2.3;
const SLAM = 2.4;
const RUSH0 = 2.44;
const RUSH1 = 2.68;
const SLITS = 2.7;

// ---------------------------------------------------------------- the wall (world positions placed so V2A frames them as §6 2a)

type Kit = 'A' | 'B' | 'C';
interface WallMan {
  id: 'A' | 'B' | 'C' | 'D';
  x: number;
  z: number;
  /** Studio sprite scale in V2A (RivalFront at 1.9, the Tower at 2.4). */
  sc: number;
  kit: Kit;
  tower: boolean;
}
/** Far to near (draw order). Under V2A: A x 300 / foot 300, C 545 / 302, B 470 / 306, D 395 / 318. */
const WALL: readonly WallMan[] = [
  { id: 'A', x: 937, z: 267.5, sc: 1.9, kit: 'A', tower: false },
  { id: 'C', x: 934, z: 297.4, sc: 1.9, kit: 'C', tower: false },
  { id: 'B', x: 927, z: 287.3, sc: 1.9, kit: 'B', tower: false },
  { id: 'D', x: 912, z: 277.5, sc: 2.4, kit: 'A', tower: true },
];
/** RivalFront registration (Stand Front): body centre x 64, soles on row 102. */
const REG: [number, number] = [64, 102];
const sA = (m: WallMan) => projectDecal(m.x, m.z, 0, V2A).s;

/** The wall's stance: RF2 on the cut frame, the stomp, the glare, the load, stomp 2, the glare; RF4 from the slam. */
function wallKey(t: number, tower: boolean): RivalKey {
  const k = t >= SLAM ? 'RF4' : t < F ? 'RF2' : t < 0.25 ? 'RF3' : t < 0.65 ? 'RF1' : t < 0.8 ? 'RF2' : t < 1.1 ? 'RF3' : 'RF1';
  return (tower ? `${k}T` : k) as RivalKey;
}
/** Stomp 2 lands them 0.6 m closer (the step happens in the load); the slam knocks them half a step back. */
function wallDX(t: number) {
  let dx = -6 * ease.inOutQuad(clamp((t - 0.65) / 0.15));
  if (t >= SLAM) dx += 3 * ease.outCubic(clamp((t - SLAM - 0.02) / 0.12));
  return dx;
}

// Tone-for-tone kit swaps for B and C (RivalFront.json kitSwaps; source A hexes).
const SWAP_SRC: Record<string, string> = { s: '#e8ac84', u: '#aa6e56', v: '#c89646', w: '#96622c', x: '#5a361e' };
const SWAPS: Record<Kit, Record<string, string>> = {
  A: {},
  B: { s: '#b06e4a', u: '#74422c', v: '#463c3c', w: '#282022', x: '#120c0e' },
  C: { s: '#8c5c40', u: '#5c3a28', v: '#342c30', w: '#1c161a', x: '#0c080a' },
};
const hexRGB = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const kitCache = new Map<string, HTMLCanvasElement>();
function kitImg(p: Pic, kit: Kit): HTMLCanvasElement {
  if (kit === 'A') return p.img;
  const k = `${p.id}|${kit}`;
  let cv = kitCache.get(k);
  if (cv) return cv;
  cv = document.createElement('canvas');
  cv.width = p.w;
  cv.height = p.h;
  const g = cv.getContext('2d')!;
  const out = g.createImageData(p.w, p.h);
  out.data.set(p.px);
  const map = Object.entries(SWAPS[kit]).map(([l, hx]) => [hexRGB(SWAP_SRC[l]), hexRGB(hx)] as const);
  const d = out.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    for (const [a, b] of map)
      if (d[i] === a[0] && d[i + 1] === a[1] && d[i + 2] === a[2]) {
        d[i] = b[0];
        d[i + 1] = b[1];
        d[i + 2] = b[2];
        break;
      }
  }
  g.putImageData(out, 0, 0);
  kitCache.set(k, cv);
  return cv;
}

/** A wall man's placement in view v at time t: feet (x, y) and sprite scale. */
function placeMan(m: WallMan, t: number, v: DownPitchView) {
  const p = projectDecal(m.x + wallDX(t), m.z, 0, v);
  return { x: p.x, y: p.y, sc: (m.sc * p.s) / sA(m) };
}

// ---------------------------------------------------------------- floodlight banks (2a composition space)

/** Far-left / far-right hang from the far stand's roof edge (screen-composed); near-left / near-right are the roof banks. */
let BANKS: BankRect[] | null = null;
function banks2a(): BankRect[] {
  if (!BANKS) {
    const nb = pitchBanks(V2A);
    BANKS = [{ x: 210, y: 3, w: 80, h: 28, cols: 5, rows: 4 }, { x: 398, y: 7, w: 64, h: 23, cols: 5, rows: 4 }, nb[2], nb[3]];
  }
  return BANKS;
}
const bankLive = (i: number, t: number) => t < SURGE[i];
const lightLevel = (t: number) => SURGE.reduce((a, at) => a + (t < at ? 0.25 : 0), 0);
const bankC = (b: BankRect): [number, number] => [b.x + b.w / 2, b.y + b.h / 2];

// ---------------------------------------------------------------- No.10 (studio only)

let STAND: StudioAnim | null = null;
let TOWER: StudioAnim | null = null;
/** No.10's back frame in 2a: Stand Back a/b (the breath) to 0.95, then SnapBack SB0 / SB1 / SB2 / SB3 (same registration). */
function backFrame(env: Env, t: number): HTMLCanvasElement {
  if (t < 0.95 && STAND) {
    const i = Math.max(0, findFrame(STAND, Math.floor(t / 0.4) % 2 ? 'b' : 'a'));
    return STAND.frames[i].img;
  }
  const key: SoloKey = t < 1.1 ? 'SB0' : t < 1.3 ? 'SB1' : t < SNAP ? 'SB2' : 'SB3';
  return soloPic(env, key).img;
}
/** No.10 in 2a: frame-space (62, 19) (the back of his head) on (HX, HY) at x3.4. */
const HX = 190, HY = 150, HSC = 3.4;
const HPIV: [number, number] = [62, 19];
const backPt = (px: number, py: number): [number, number] => [HX + (px - HPIV[0]) * HSC, HY + (py - HPIV[1]) * HSC];

// ---------------------------------------------------------------- the 2a camera (2D composition: push, crash, snap back)

const PUSH_P: [number, number] = [330, 190];
/** The crash zoom's framing point: between his raised hand and the far-left bank above it. */
const CRASH_Q: [number, number] = [262, 108];
function cam2a(t: number): { x: number; y: number; z: number } {
  const about = (z: number) => ({ x: PUSH_P[0] + (VW / 2 - PUSH_P[0]) / z, y: PUSH_P[1] + (VH / 2 - PUSH_P[1]) / z, z });
  const kick = soloPunch(t, 0, 0.04, 0.1) + soloPunch(t, 0.8, 0.04, 0.1);
  if (t < 1.4) return about(1 + 0.1 * ease.inCubic(t / 1.4) + kick);
  const c0 = about(1.1);
  if (t < 1.62) {
    const u = ease.inExpo(clamp((t - 1.4) / 0.15));
    const z = lerp(1.1, 1.9, u) + soloPunch(t, SNAP, 0.06, 0.1);
    return { x: lerp(c0.x, CRASH_Q[0], u), y: lerp(c0.y, CRASH_Q[1], u), z };
  }
  const u = ease.outExpo(clamp((t - 1.62) / 0.12));
  const c1 = about(1.05);
  return { x: lerp(CRASH_Q[0], c1.x, u), y: lerp(CRASH_Q[1], c1.y, u), z: lerp(1.9, 1.05, u) };
}
/** Composition point -> screen (no shake) under the current 2D camera. */
const toScreen = (env: Env, x: number, y: number): [number, number] => [(x - env.cam.x) * env.cam.zoom + VW / 2, (y - env.cam.y) * env.cam.zoom + VH / 2];

// ---------------------------------------------------------------- the long shadow (built in V2A screen space, laid on three planes)

/** The shadow canvases are V2A screen space shifted down by SHOFF (so the feet below the frame fit). */
const SHOFF = 60;
const SHW = VW + 200, SHH = 560;
interface Layer {
  cv: HTMLCanvasElement;
  g: CanvasRenderingContext2D;
}
const mkLayer = (): Layer => {
  const cv = document.createElement('canvas');
  cv.width = SHW;
  cv.height = SHH;
  return { cv, g: cv.getContext('2d')! };
};
let SHL: { all: Layer; mask: Layer; near: Layer; nearV: Layer; far: Layer; farV: Layer } | null = null;
/** SB3's silhouette (fill only), cropped to rows 3..103 / cols 34..99. */
let SIL: HTMLCanvasElement | null = null;
const SIL_X0 = 34, SIL_Y0 = 3, SIL_W = 66, SIL_H = 101;
/** The strip in V2A screen space: feet (below the frame) to the top of the hair on the far stand. */
const SH = { footX: 236, footY: 432, topX: 452, topY: 20, w0: 330, w1: 222 };
/** V2A rows of the far layer: above NET_Y on the far stand, NET_Y..GROUND_Y on the goal net and boards; below, the turf. */
const NET_Y = 196, GROUND_Y = 262;
const STAND_X = 1270, NET_X = 1185, WALL_X = 918;
const silV = (row: number) => (SIL_H - 1 - row) / (SIL_H - 1); // 0 at the feet, 1 at the crop top
const gv = (v: number) => Math.pow(v, 0.82);
const shY = (v: number) => lerp(SH.footY, SH.topY, gv(v));
const shX = (v: number) => lerp(SH.footX, SH.topX, gv(v));
const shK = (v: number) => lerp(SH.w0, SH.w1, gv(v)) / SIL_W;
/** The V2A screen point of the shadow of SB3 canvas point (fx, fy). */
function shPoint(fx: number, fy: number): [number, number] {
  const v = silV(fy - SIL_Y0);
  return [shX(v) + (fx - SIL_X0 - SIL_W / 2) * shK(v), shY(v)];
}

function clearLayer(l: Layer) {
  l.g.setTransform(1, 0, 0, 1, 0, 0);
  l.g.globalCompositeOperation = 'source-over';
  l.g.globalAlpha = 1;
  l.g.clearRect(0, 0, SHW, SHH);
  l.g.imageSmoothingEnabled = false;
}
function tintInto(dst: Layer, src: HTMLCanvasElement, color: string) {
  clearLayer(dst);
  dst.g.drawImage(src, 0, 0);
  dst.g.globalCompositeOperation = 'source-in';
  dst.g.fillStyle = color;
  dst.g.fillRect(0, 0, SHW, SHH);
  dst.g.globalCompositeOperation = 'source-over';
}

/**
 * Build the shadow for this frame: the strip (reach 0..1 from the feet up), then split it by the defenders' bodies
 * (V2A placement at time t) into the near layer (on their bodies and on the turf below GROUND_Y) and the far layer
 * (the net, boards and stand behind them), each with a volt copy for its edge.
 */
let shadowKey = '';
function buildShadow(t: number, reach: number) {
  if (!SHL || !SIL) return;
  // Memo: the layers only change while the shadow grows and the wall steps back (a pure function of these two).
  const key = `${reach.toFixed(4)}|${wallDX(t).toFixed(4)}`;
  if (key === shadowKey) return;
  shadowKey = key;
  const { all, mask, near, nearV, far, farV } = SHL;
  clearLayer(all);
  const g = all.g;
  for (let r = 0; r < SIL_H; r++) {
    const v0 = silV(r + 1 > SIL_H - 1 ? SIL_H - 1 : r + 1), v1 = silV(r);
    const lo = Math.min(v0, v1), hi = Math.max(v0, v1);
    if (lo > reach) continue;
    const top = Math.min(hi, reach);
    const ya = shY(lo), yb = shY(top);
    const mid = (lo + top) / 2;
    const k = shK(mid);
    const frac = hi > lo ? (top - lo) / (hi - lo) : 1;
    g.drawImage(SIL, 0, r + (1 - frac), SIL_W, Math.max(0.01, frac), shX(mid) - (SIL_W / 2) * k, Math.min(ya, yb) + SHOFF - 0.6, SIL_W * k, Math.abs(yb - ya) + 1.2);
  }
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = HEX.plum;
  g.fillRect(0, 0, SHW, SHH);
  // The mask: the defenders' bodies in V2A plus everything below GROUND_Y.
  clearLayer(mask);
  mask.g.fillStyle = '#000';
  mask.g.fillRect(0, GROUND_Y + SHOFF, SHW, SHH);
  for (const m of WALL) {
    const p = rivalPic(wallKey(t, m.tower));
    if (!p) continue;
    const pl = placeMan(m, t, V2A);
    const sil = uvSilhouette(p, 0, 0, PAL.plum, PAL.plum);
    mask.g.save();
    mask.g.translate(pl.x, pl.y + SHOFF);
    mask.g.scale(pl.sc, pl.sc);
    mask.g.drawImage(sil, -REG[0], -REG[1]);
    mask.g.restore();
  }
  clearLayer(near);
  near.g.drawImage(all.cv, 0, 0);
  near.g.globalCompositeOperation = 'destination-in';
  near.g.drawImage(mask.cv, 0, 0);
  // The far layer is the whole strip: behind a defender the net is in his own shadow anyway (and he hides it in V2A).
  clearLayer(far);
  far.g.drawImage(all.cv, 0, 0);
  tintInto(nearV, near.cv, HEX.volt);
  tintInto(farV, far.cv, HEX.volt);
}

/** The affine that carries V2A screen points on the plane x = X to view v: [k, ox, oy] (sx' = ox + k·sx, sy' = oy + k·sy). */
function planeMap(X: number, v: DownPitchView): [number, number, number] {
  const a = V2A;
  const s0 = a.f / (X - a.x), s1 = v.f / Math.max(2, X - v.x);
  const k = s1 / s0;
  const ox = v.cx + (a.z - v.z) * s1 - a.cx * k;
  const oy = v.horizon + (v.h - a.h) * s1 - a.horizon * k;
  return [k, ox, oy];
}
const mapPt = (m: [number, number, number], x: number, y: number): [number, number] => [m[1] + m[0] * x, m[2] + m[0] * y];

/** Lay a shadow layer's V2A rows [y0, y1) with plane map m: the volt edge (additive), then the plum body (multiply). */
function layShadow(ctx: CanvasRenderingContext2D, l: Layer, lv: Layer, m: [number, number, number], y0: number, y1: number, a: number) {
  ctx.save();
  ctx.transform(m[0], 0, 0, m[0], m[1], m[2]);
  ctx.beginPath();
  ctx.rect(-200, y0, VW + 400, y1 - y0);
  ctx.clip();
  ctx.imageSmoothingEnabled = false;
  const e = 2 / Math.max(0.5, m[0]);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.55 * a;
  ctx.drawImage(lv.cv, -e, -SHOFF);
  ctx.drawImage(lv.cv, e, -SHOFF);
  ctx.drawImage(lv.cv, 0, -SHOFF - e);
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.92 * a;
  ctx.drawImage(l.cv, 0, -SHOFF);
  ctx.restore();
}

// ---------------------------------------------------------------- 2b's Tower (his studio back view as a silhouette)

let TOWER_SIL: HTMLCanvasElement | null = null;
let TOWER_LIT: HTMLCanvasElement | null = null;
function animPic(a: StudioAnim, i: number, id: string): Pic {
  const f = a.frames[i];
  return { id, img: f.img, west: null, w: a.w, h: a.h, px: f.px, grounded: true, source: 'studio', anchor: (n?: string) => a.anchorOf(i, n) };
}

// ---------------------------------------------------------------- small drawing helpers

function blit(ctx: CanvasRenderingContext2D, img: CanvasImageSource, piv: readonly [number, number], x: number, y: number, sc: number, a = 1) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = a;
  ctx.translate(x, y);
  ctx.scale(sc, sc);
  ctx.drawImage(img, -piv[0], -piv[1]);
  ctx.restore();
}
const tl = (piv: readonly [number, number], x: number, y: number, sc: number): [number, number] => [x - piv[0] * sc, y - piv[1] * sc];
const h01 = (i: number, s: number) => {
  const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/** A floodlight bank's housing and blazing cells (a few cells flare on the 30 Hz flicker). */
function bankCells(ctx: CanvasRenderingContext2D, b: BankRect, t: number) {
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#0b0918';
  ctx.fillRect(b.x - 2, b.y - 2, b.w + 4, b.h + 4);
  const cw = b.w / b.cols, ch = b.h / b.rows, ft = Math.floor(t * 30);
  for (let r = 0; r < b.rows; r++)
    for (let c = 0; c < b.cols; c++) {
      ctx.fillStyle = (r * 3 + c + ft) % 7 === 0 ? '#FFFFFF' : '#FFF6DC';
      ctx.fillRect(b.x + c * cw + cw * 0.14, b.y + r * ch + ch * 0.14, cw * 0.72, ch * 0.66);
    }
  ctx.restore();
}
/** A dead bank: dark cells. */
function bankDead(ctx: CanvasRenderingContext2D, b: BankRect) {
  ctx.save();
  ctx.fillStyle = '#0b0918';
  ctx.fillRect(b.x - 2, b.y - 2, b.w + 4, b.h + 4);
  const cw = b.w / b.cols, ch = b.h / b.rows;
  ctx.fillStyle = '#231c36';
  for (let r = 0; r < b.rows; r++) for (let c = 0; c < b.cols; c++) ctx.fillRect(b.x + c * cw + cw * 0.14, b.y + r * ch + ch * 0.14, cw * 0.72, ch * 0.66);
  ctx.restore();
}
/** A live bank's glare behind the wall (drawn before the players so they cut black shapes out of it). */
function bankGlare(ctx: CanvasRenderingContext2D, b: BankRect, i: number, t: number) {
  const [cx, cy] = bankC(b);
  const near = i >= 2;
  const fl = 0.94 + 0.06 * Math.sin(t * 31 + i * 2.1);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf([226, 214, 255]), cx, cy + 10, b.w * (near ? 1.7 : 2.1), 0.3 * fl, 1.2, 1.1);
  drawGlow(ctx, glowOf([255, 248, 230]), cx, cy, b.w * (near ? 0.8 : 0.95), 0.6 * fl, 1.3, 0.8);
  drawGlow(ctx, glowOf([255, 255, 255]), cx, cy, b.w * 0.42, 0.8 * fl);
  ctx.restore();
  const tilt = (cx - 330) / 900;
  stage.godRays(ctx, cx, cy, 9, 170, 400, near ? 60 : 42, 0.22 * fl, Math.PI / 2 - tilt, 11 + i * 7, 1.15, t * 2);
}

/** A defender's long floodlight shadows reaching at the lens (two banks behind him: two shadows fanning). */
function wallShadows(ctx: CanvasRenderingContext2D, sil: HTMLCanvasElement, x: number, foot: number, sc: number, k: number) {
  if (k <= 0) return;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalCompositeOperation = 'multiply';
  for (const [skew, len, a] of [[-0.55, 0.62, 0.55], [0.42, 0.56, 0.45]] as const) {
    ctx.save();
    ctx.globalAlpha = a * k;
    ctx.translate(x, foot);
    ctx.transform(1, 0, skew, 1, 0, 0);
    ctx.scale(sc, -sc * len);
    ctx.drawImage(sil, -REG[0], -REG[1]);
    ctx.restore();
  }
  ctx.restore();
}

/** The floodlit haze in front of the stand (a veil that the back-lit wall cuts into). */
function haze(ctx: CanvasRenderingContext2D, k: number) {
  if (k <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(0, 0, 0, 280);
  g.addColorStop(0, `rgba(246,238,232,${0.15 * k})`);
  g.addColorStop(0.5, `rgba(200,186,255,${0.08 * k})`);
  g.addColorStop(1, 'rgba(160,140,240,0)');
  ctx.fillStyle = g;
  ctx.fillRect(-140, -80, VW + 280, 360);
  ctx.restore();
}

/** The dark roof edge of the far stand that the far banks hang from (back-lit fascia, truss struts). */
function roofEdge(ctx: CanvasRenderingContext2D, k: number) {
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#0a0714';
  ctx.beginPath();
  ctx.moveTo(-140, -80);
  ctx.lineTo(VW + 140, -80);
  ctx.lineTo(VW + 140, 30);
  ctx.quadraticCurveTo(VW / 2, 8, -140, 30);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#17112a';
  for (let x = -120; x < VW + 140; x += 46) ctx.fillRect(x, -60, 3, 76 - Math.abs(x - VW / 2) * 0.02);
  if (k > 0) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(226,220,255,${0.5 * k})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-140, 30.5);
    ctx.quadraticCurveTo(VW / 2, 8.5, VW + 140, 30.5);
    ctx.stroke();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- particles (spawned in cues / update; composition space)

function stompDust(env: Env, t: number, power: number) {
  const { rng, parts } = env;
  for (const m of WALL) {
    const p = placeMan(m, t, V2A);
    for (let i = 0; i < 24; i++) {
      const a = rng.range(Math.PI * 0.06, Math.PI * 0.94);
      const s = rng.range(60, 230) * power;
      parts.spawn({
        kind: PK.Smoke, x: p.x + (rng.range(-36, 36) * p.sc) / 1.9, y: p.y - rng.range(0, 6), vx: Math.cos(a) * s * 1.35, vy: Math.sin(a) * s * 0.45,
        drag: 2.2, max: rng.range(0.6, 1.3), s0: rng.range(6, 12) * power, s1: rng.range(26, 46) * power, ramp: 'dust', r0: 0, r1: 1,
        a0: 0.48, a1: 0, add: false, layer: 0,
      });
    }
    // Back-lit dust glows at its rim (a few additive puffs).
    for (let i = 0; i < 5; i++)
      parts.spawn({
        kind: PK.Glow, x: p.x + rng.range(-30, 30), y: p.y - rng.range(4, 18), vx: rng.range(-70, 70), vy: rng.range(10, 60), drag: 2,
        max: rng.range(0.4, 0.8), s0: rng.range(10, 18), s1: 36, ramp: 'mote', r0: 0, r1: 0.6, a0: 0.2, a1: 0, layer: 0,
      });
    for (let i = 0; i < 4; i++)
      parts.spawn({
        kind: PK.Debris, x: p.x + rng.range(-24, 24), y: p.y, vx: rng.range(-140, 140), vy: rng.range(-240, -90) * power, ay: 900, drag: 0.6,
        vrot: rng.range(-12, 12), max: rng.range(0.4, 0.7), s0: rng.range(1.5, 2.5), s1: 1.5, ramp: 'grass', r0: rng.next(), r1: rng.next(),
        a0: 1, a1: 1, add: false, layer: 1,
      });
  }
}

/** A bank blowing (on top of stage.surgeBurst): an explosive glass and spark burst so it reads inside 0.05 s. */
function bankBurst(env: Env, b: BankRect) {
  const { rng, parts } = env;
  stage.surgeBurst(env, b, 1.2);
  const [cx, cy] = bankC(b);
  for (let i = 0; i < 50; i++) {
    const a = rng.range(-0.25, Math.PI + 0.25), s = rng.range(160, 560);
    parts.spawn({
      kind: PK.Glass, x: cx + rng.range(-b.w / 2, b.w / 2), y: cy + rng.range(-b.h / 2, b.h / 2), vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.9 - 60,
      ay: 700, drag: 0.9, max: rng.range(0.5, 1.1), s0: rng.range(1.2, 2.8), s1: 1, ramp: 'glass', r0: 0, r1: 1, a0: 1, a1: 0.3, k: 0.45, layer: 1,
    });
  }
  for (let i = 0; i < 28; i++) {
    const a = rng.range(0, Math.PI * 2), s = rng.range(260, 760);
    parts.spawn({
      kind: PK.Streak, x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, ay: 500, drag: 3.5, max: rng.range(0.12, 0.3),
      s0: rng.range(1, 2), s1: 0.4, ramp: 'glass', r0: 0, r1: 1, k: 1.6, layer: 1,
    });
  }
}

// ---------------------------------------------------------------- 2a

function render2a(env: Env, t: number) {
  const { ctx, fx } = env;
  const c = cam2a(t);
  env.cam.x = c.x;
  env.cam.y = c.y;
  env.cam.zoom = c.z;
  env.cam.rot = 0;
  env.world();
  const L = lightLevel(t);
  const banks = banks2a();
  const towers = SURGE.map((at) => stage.surgeLevel(at, t, 'out'));
  // The crowd stomps with the wall: the stand jolts 2 px on each stomp.
  const jolt = (t >= F && t < 4 * F) || (t >= 0.8 && t < 0.8 + 3 * F) ? 2 : 0;
  ctx.save();
  ctx.translate(0, jolt);
  drawDownPitch(ctx, env.art.stadium, V2A, t, { towers });
  ctx.restore();
  haze(ctx, L);
  roofEdge(ctx, L);
  // The banks: cells, glare and god rays behind the players (they cut black shapes out of the light).
  banks.forEach((b, i) => {
    if (bankLive(i, t)) {
      if (i < 2) bankCells(ctx, b, t);
      bankGlare(ctx, b, i, t);
    } else if (i < 2 && t >= SURGE[i] + 0.12) bankDead(ctx, b);
  });
  // The crash zoom: the far-left bank's glare floods the lens behind his raised hand (he becomes a black cut-out).
  const flood = t >= 1.4 && t < SURGE[0] ? ease.inQuad(clamp((t - 1.4) / 0.15)) : 0;
  if (flood > 0) {
    const [bx, by] = bankC(banks[0]);
    const [hx, hy] = backPt(82, 10);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf([168, 128, 255]), lerp(bx, hx, 0.75), lerp(by, hy, 0.75), 110, 0.5 * flood, 1.25, 1);
    drawGlow(ctx, glowOf([226, 214, 255]), lerp(bx, hx, 0.8), lerp(by, hy, 0.8), 62, 0.55 * flood, 1.2, 1);
    drawGlow(ctx, glowOf([255, 250, 236]), lerp(bx, hx, 0.85), lerp(by, hy, 0.85), 30, 0.5 * flood, 1.2, 1);
    ctx.restore();
  }
  // The wall, back-lit: long shadows at the lens, dark fronts, hot rims.
  for (const m of WALL) {
    const key = wallKey(t, m.tower);
    const p = rivalPic(key);
    if (!p) continue;
    const pl = placeMan(m, t, V2A);
    const breath = key === 'RF1' || key === 'RF1T' ? (Math.floor(t / 0.2) % 2 ? -1 : 0) : 0;
    const x = pl.x, y = pl.y + breath, sc = pl.sc;
    wallShadows(ctx, uvSilhouette(p, 0, 0, PAL.plum, PAL.plum), x, pl.y, sc, L);
    blit(ctx, kitImg(p, m.kit), REG, x, y, sc);
    const [lx, ly] = tl(REG, x, y, sc);
    shadeSprite(ctx, p.img, lx, ly, sc, lerp(0.2, 0.52, L), [150, 128, 230]);
    rimLight(ctx, p.img, lx, ly, sc, [0, -1], 2, PAL.spot, 0.85 * L);
    rimLight(ctx, p.img, lx, ly, sc, [-1, -0.35], 1, PAL.ivory, 0.6 * clamp(L * 2 - 0.5));
    rimLight(ctx, p.img, lx, ly, sc, [1, -0.35], 1, PAL.lilac, 0.6 * clamp(L * 4 - 3));
  }
  // No.10, back-lit, cropped at the thigh: dark back, ivory rim from the lamps ahead (their shadows lurch over him on stomp 2).
  const lurch = t >= 0.8 && t < 1.0 ? lerp(0.7, 1, ease.inQuad((t - 0.8) / 0.2)) : 1;
  const img = backFrame(env, t);
  blit(ctx, img, HPIV, HX, HY, HSC);
  const [nx, ny] = tl(HPIV, HX, HY, HSC);
  shadeSprite(ctx, img, nx, ny, HSC, lerp(0.22, 0.42, L) * lurch * (1 - 0.6 * flood), [140, 120, 220]);
  rimLight(ctx, img, nx, ny, HSC, [0.15, -1], 2, PAL.ivory, 0.85 * L * lurch + 0.3 * flood);
  rimLight(ctx, img, nx, ny, HSC, [1, -0.2], 1, PAL.lilac, 0.6 * L * lurch);
  // Dust and grass from the stomps (layer 0), back-lit.
  env.parts.draw(ctx, 0);
  // The blackout: the dim steps as the banks die (screen space; the banks still burning keep their pools).
  const di = SURGE.findIndex((at) => t < at);
  const dimLv = di < 0 ? DIM_STEPS[3] : di === 0 ? 0 : DIM_STEPS[di - 1];
  if (dimLv > 0) {
    const pools: StagePool[] = [];
    banks.forEach((b, i) => {
      if (!bankLive(i, t)) return;
      const [sx, sy] = toScreen(env, ...bankC(b));
      pools.push({ x: sx, y: sy, rx: b.w * 0.9 * c.z, ry: b.w * 0.6 * c.z, soft: 60, gain: 0.85 });
    });
    stage.dim(ctx, dimLv, pools, { max: DIM_V2 });
    env.world();
  }
  // Lens stars of the live banks, the pops of the dying ones.
  banks.forEach((b, i) => {
    const [cx, cy] = bankC(b);
    if (bankLive(i, t)) crossGlint(ctx, cx + (i === 2 ? 28 : i === 3 ? -28 : 0), cy + (i >= 2 ? 6 : 0), (i >= 2 ? 60 : 48) * (0.92 + 0.08 * Math.sin(t * 23 + cx)), 0.85);
    stage.surge(ctx, b, SURGE[i], t, 'out', { seed: 31 + i * 17 });
    if (onFrames(t, SURGE[i], 1)) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf([255, 255, 255]), cx, cy, 90, 0.95);
      ctx.restore();
      sparkle(ctx, cx, cy, 40, 1);
    }
  });
  // THE SNAP: a spark at the fingertips, light rain from the hand.
  if (t >= SNAP - 1e-6 && t < SNAP + 0.18) {
    const [gx, gy] = backPt(80, 8);
    const u = (t - SNAP) / 0.18;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf([226, 220, 255]), gx, gy, 24, 0.9 * (1 - u));
    ctx.restore();
    sparkle(ctx, gx, gy, 12 * (1 - u * 0.5), 1 - u);
    crossGlint(ctx, gx, gy, 26 * (1 - u), 1 - u);
    lightRain(ctx, gx, 34, 8, SNAP, t, { y0: gy - 4, y1: gy + 6, len0: 20, len1: 40, v0: 500, v1: 160, life: 0.22, seed: 5 });
  }
  env.parts.draw(ctx, 1);
  // Grade and post.
  if (t < SNAP) soloLit(fx);
  else soloStage(fx, { ca: t < SNAP + 0.1 ? 0.006 : 0.002 });
  if (t < F) fx.fullFrame = true; // E2: the cut from black to the blazing stadium.
  const fu = env.cam.toUV(415, 312);
  flatShockAt(fx, fu[0], fu[1], 0, t, 0.02, 0.3);
  flatShockAt(fx, fu[0], fu[1] + 0.02, 0.8, t, 0.025, 0.3);
  const hu = env.cam.toUV(...backPt(80, 8));
  flatShockAt(fx, hu[0], hu[1], SNAP, t, 0.015, 1, 0.3);
}

// ---------------------------------------------------------------- 2b

const BALL_B: [number, number] = [250, 286];
const TOWER_HEAD: [number, number] = [566, 176];
const TOWER_SC = 3.8;

/** Glass still glinting down out of the dead roof (pure function of t: seeded positions, gravity). */
function fallingGlass(ctx: CanvasRenderingContext2D, t: number, a: number) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 16; i++) {
    const t0 = 1.62 + 0.5 * h01(i, 3);
    const lt = t - t0;
    if (lt < 0) continue;
    const x = 40 + 560 * h01(i, 4) + 30 * lt * (h01(i, 5) - 0.5);
    const y = -10 + 60 * h01(i, 6) + 90 * lt + 160 * lt * lt;
    if (y > 250) continue;
    const tw = 0.5 + 0.5 * Math.sin(t * 40 + i * 1.7);
    ctx.globalAlpha = a * (0.35 + 0.65 * tw) * clamp(1 - y / 260);
    ctx.fillStyle = i % 3 ? '#E2DCFF' : '#FFFFFF';
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
    if (tw > 0.85) {
      ctx.fillRect(Math.round(x) - 1, Math.round(y), 3, 1);
      ctx.fillRect(Math.round(x), Math.round(y) - 1, 1, 3);
    }
  }
  ctx.restore();
}

function render2b(env: Env, t: number) {
  const { ctx, fx } = env;
  // A nervous handheld creep: 1.00 -> 1.05 about the eyes, a slow 2-3 px drift.
  const z = lerp(1, 1.05, clamp((t - 1.8) / 0.6));
  const dx = 2.4 * Math.sin(t * 5.1 + 0.6) + 1.2 * Math.sin(t * 11.3), dy = 1.6 * Math.sin(t * 6.7 + 1.9);
  const P: [number, number] = [276, 220];
  env.cam.x = P[0] + (VW / 2 - P[0]) / z + dx;
  env.cam.y = P[1] + (VH / 2 - P[1]) / z + dy;
  env.cam.zoom = z;
  env.cam.rot = 0;
  env.world();
  drawUpPitch(ctx, env.art.stadium, V2B, t, { towers: [0, 0, 0, 0], ambientFlashes: false });
  stage.dim(ctx, 0.97, [], { uncapped: true });
  env.world();
  const ig = t >= IGNITE ? ease.outCubic(clamp((t - IGNITE) / 0.12)) : 0;
  // The fluorescent pitch lines catch the ultraviolet once the ball burns.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawPitchLines(ctx, V2B, 0.05 + 0.14 * ig, 'rgba(201,182,255,0.85)');
  ctx.restore();
  // The phone-light sea switches on in a wave: the stands become a starfield; glass still falls from the roof.
  drawPhoneLights(ctx, env.art.stadium, 0, t, 0.95, { n: 300, wave: [1.85, 0.15], view: V2B });
  fallingGlass(ctx, t, 0.8);
  // No.10: a boy-shaped hole in the stars (EN1 registered on the ball), the ball's light on his shins, his boots
  // fluorescing, a 30 % lilac rim, then the eyes.
  const sc = 1.6;
  const o = { anchor: 'ball' as const };
  const [ex0, ey0] = soloTopLeft(env, 'EN1', BALL_B[0], BALL_B[1], sc, o);
  const en1 = soloPic(env, 'EN1');
  blit(ctx, uvSilhouette(en1, 0, 0, [9, 4, 18], [9, 4, 18]), [0, 0], ex0, ey0, sc);
  const eo = t >= EYES ? clamp((t - EYES) / (3 * F)) : 0;
  if (ig > 0) {
    underLight(ctx, en1.img, ex0, ey0, sc, BALL_B[0], BALL_B[1], 80, PAL.lilac, 0.6 * ig);
    drawSoloFluoro(env, 'EN1', BALL_B[0], BALL_B[1], sc, lerp(0.35, 0.85, eo) * ig, o);
  }
  if (eo > 0) rimLight(ctx, en1.img, ex0, ey0, sc, [0, -1], 1, PAL.lilac, 0.3 * eo);
  // The ball ignites: an over-bright first frame, a splash on the turf, the blaze and its pool.
  if (t >= IGNITE) {
    const lt = t - IGNITE;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(BALL_B[0], BALL_B[1] + 12);
    ctx.scale(1, 0.22);
    drawGlow(ctx, glowOf([168, 128, 255]), 0, 0, 130, 0.5 * ig);
    drawGlow(ctx, glowOf([246, 240, 223]), 0, 0, 48, 0.45 * ig);
    ctx.restore();
    stage.splash(ctx, BALL_B[0], BALL_B[1] + 10, 10, 120, 0.25, IGNITE, t, 0.9);
    const blaze = lt < F ? 1.4 : ig;
    drawBall(env, spinAt(0.35 + lt * 1.2, 0.2, 1, 0.1), BALL_B[0], BALL_B[1], 6, 2.4, 0, 1, 'blacklight', undefined, { blaze, blazeR: 45 });
    if (lt < 0.08) crossGlint(ctx, BALL_B[0], BALL_B[1], 44 * (1 - lt / 0.08), 1);
  }
  // The Tower, past whose shoulder we look: a plum silhouette with a 1 px lilac rim from the phone lights; his head jerks
  // back when the ball ignites and again at the eyes.
  if (TOWER_SIL && TOWER_LIT) {
    const jerk = t >= IGNITE ? ease.outQuad(clamp((t - IGNITE) / (2 * F))) * (1 - ease.inOutSine(clamp((t - IGNITE - 0.05) / 0.3))) : 0;
    const k2 = t >= EYES ? ease.outCubic(clamp((t - EYES) / 0.1)) : 0;
    const x = Math.round(TOWER_HEAD[0] + 4 * jerk + 3 * k2), y = Math.round(TOWER_HEAD[1] - 3 * jerk + 2 * k2);
    blit(ctx, TOWER_LIT, [64, 16], x - 1, y - 1, TOWER_SC, 0.75 + 0.25 * ig);
    blit(ctx, TOWER_SIL, [64, 16], x, y, TOWER_SC);
  }
  // The eyes (registered on EN1's eye anchors), then the smirk.
  if (eo > 0) {
    const [lx, ly] = soloPoint(env, 'EN1', 'eyeL', BALL_B[0], BALL_B[1], sc, o);
    const [rx, ry] = soloPoint(env, 'EN1', 'eyeR', BALL_B[0], BALL_B[1], sc, o);
    const nar = t >= SMIRK ? ease.outQuad(clamp((t - SMIRK) / (3 * F))) : 0;
    eyeGlow(ctx, (lx + rx) / 2 + 0.5, (ly + ry) / 2 + 0.5, { gap: rx - lx, open: eo, narrow: nar, cross: 40 * (1 - 0.25 * nar), a: 1 });
  }
  env.parts.draw(ctx, 0);
  env.parts.draw(ctx, 1);
  soloStage(fx, { vignette: 0.75 });
}

// ---------------------------------------------------------------- 2c

/** The crane-rush (2.44-2.68): a hard acceleration and a braking landing on the end framing. */
const inOutQuart = (u: number) => (u < 0.5 ? 8 * u * u * u * u : 1 - Math.pow(-2 * u + 2, 4) / 2);
const rushU = (t: number) => inOutQuart(clamp((t - RUSH0) / (RUSH1 - RUSH0)));
function view2c(t: number): DownPitchView {
  const u = rushU(t);
  return {
    x: lerp(V2A.x, V2C.x, u), z: lerp(V2A.z, V2C.z, u), h: lerp(V2A.h, V2C.h, u), f: lerp(V2A.f, V2C.f, u),
    horizon: lerp(V2A.horizon, V2C.horizon, u), cx: 320,
  };
}

function render2c(env: Env, t: number) {
  const { ctx, fx } = env;
  const v = view2c(t);
  const mStand = planeMap(STAND_X, v), mNet = planeMap(NET_X, v), mWall = planeMap(WALL_X, v);
  const imp = onFrames(t, SLAM, 2);
  const z = 1.05 + 0.02 * ease.outCubic(clamp((t - SLITS) / 0.1));
  const headA = shPoint(64, 22);
  const head = mapPt(mStand, headA[0], headA[1]);
  env.cam.zoom = z;
  env.cam.rot = 0;
  env.cam.x = VW / 2 + (t >= SLITS ? (head[0] - VW / 2) * (1 - 1 / z) * ease.outCubic(clamp((t - SLITS) / 0.1)) : 0);
  env.cam.y = VH / 2;
  env.world();
  drawDownPitch(ctx, env.art.stadium, v, t, { towers: [0, 0, 0, 0], ambientFlashes: false });
  // The footlight lights the wall hard and the far stand round the shadow; everything else is the blackout.
  const wallC = mapPt(mWall, 430, 228);
  const standC = mapPt(mStand, headA[0] - 10, headA[1] + 60);
  const [wx, wy] = toScreen(env, ...wallC), [sx, sy] = toScreen(env, ...standC);
  stage.dim(ctx, 0.92, [
    { x: wx, y: wy, rx: 300 * mWall[0] * z, ry: 130 * mWall[0] * z, gain: imp ? 0.35 : 0.85 * (1 - 0.8 * rushU(t)), soft: 90 },
    { x: sx, y: sy, rx: 230 * mStand[0] * z, ry: 160 * mStand[0] * z, gain: imp ? 0 : 0.34, soft: 120 },
  ], { max: DIM_V2 });
  env.world();
  drawPhoneLights(ctx, env.art.stadium, 0, t, 0.9, { n: 300, view: v });
  // The light thrown on the crowd round the shadow (the shadow is a hole cut out of it).
  if (!imp) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf([122, 77, 255]), standC[0], standC[1], 300 * mStand[0], 0.34, 1.25, 1);
    drawGlow(ctx, glowOf([201, 182, 255]), standC[0], standC[1] - 10 * mStand[0], 210 * mStand[0], 0.36, 1.25, 1);
    drawGlow(ctx, glowOf([255, 248, 236]), standC[0], standC[1] - 30 * mStand[0], 120 * mStand[0], 0.26, 1.3, 1);
    ctx.restore();
  }
  // The beam from the lamp at the bottom-left onto the wall (weak on the impact frames so the subjects read).
  stage.pillar(ctx, {
    x0: -90, y0: 470, x1: wallC[0], y1: wallC[1] + 20, w0: 70, w1: 560 * mWall[0], a: imp ? 0.25 : 1 - 0.55 * rushU(t), t, slamAt: SLAM, motes: 80, seed: 9,
    core: 0.3, edge: 7,
  });
  if (!imp) stage.splash(ctx, wallC[0], wallC[1] + 82 * mWall[0], 40, 300 * mWall[0], 0.25, SLAM + 2 * F, t, 0.8);
  // The shadow, built in V2A and split by the defenders' bodies; the far layer (net, boards, stand) lies behind them.
  buildShadow(t, clamp((t - SLAM + F) / (4 * F)));
  if (SHL) {
    layShadow(ctx, SHL.far, SHL.farV, mStand, -200, NET_Y, 1);
    layShadow(ctx, SHL.far, SHL.farV, mNet, NET_Y, GROUND_Y + 1, 1);
  }
  // The wall, lit hard white from the front for the first time: forearms over their eyes, half a step back, trembling.
  const hot = imp ? 0 : clamp(1 - (t - SLAM - 2 * F) / 0.14);
  for (const m of WALL) {
    const p = rivalPic(wallKey(t, m.tower));
    if (!p) continue;
    const pl = placeMan(m, t, v);
    const sc = pl.sc;
    const x = pl.x + Math.sin(t * 61 + m.x) * 0.8, y = pl.y;
    if (y - 104 * sc > VH + 60) continue;
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.7;
    ctx.translate(x + 10 * sc, y - 2 * sc);
    ctx.scale(1, 0.16);
    drawGlow(ctx, glowOf([22, 10, 38]), 0, 0, 34 * sc, 1);
    ctx.restore();
    blit(ctx, kitImg(p, m.kit), REG, x, y, sc);
    const [lx, ly] = tl(REG, x, y, sc);
    rimLight(ctx, p.img, lx, ly, sc, [-0.8, 0.6], Math.max(1, Math.round(sc * 0.8)), PAL.spot, 0.9);
    if (hot > 0) blit(ctx, uvSilhouette(p, 0, 0, PAL.spot, PAL.spot), REG, x, y, sc, 0.3 * hot);
  }
  // On the defenders the shadow is laid over lit bodies: lighter, so they still read under it.
  if (SHL) layShadow(ctx, SHL.near, SHL.nearV, mWall, -200, SHH, 0.74);
  // No.10 himself: a black silhouette with a white-hot rim, whipping out under the frame as the camera rushes.
  const drop = ease.inCubic(clamp((t - SLAM - 0.04) / 0.08));
  if (drop < 1) {
    const p3 = soloPic(env, 'SB3');
    const hx = HX - 40 * drop, hy = HY + 360 * drop, sc = HSC * (1 + 0.35 * drop);
    blit(ctx, uvSilhouette(p3, 0, 0, [10, 5, 20], [10, 5, 20]), HPIV, hx, hy, sc);
    const [lx, ly] = tl(HPIV, hx, hy, sc);
    rimLight(ctx, p3.img, lx, ly, sc, [-0.85, 0.5], 2, PAL.spot, 1);
    rimLight(ctx, p3.img, lx, ly, sc, [-0.3, -1], 1, PAL.lilac, 0.6);
  }
  // The eye-slits open in the shadow's head on the far stand; a 1-frame sparkle.
  if (t >= SLITS) {
    const eL = mapPt(mStand, ...shPoint(58, 25));
    const eR = mapPt(mStand, ...shPoint(67, 25));
    const el = t - SLITS;
    eyeGlow(ctx, (eL[0] + eR[0]) / 2, (eL[1] + eR[1]) / 2, { gap: eR[0] - eL[0], narrow: 1, open: clamp(el / (3 * F)), cross: 30, halo: 22, px: 1.5, a: 1 });
    if (onFrames(t, 2.72, 1)) {
      sparkle(ctx, eL[0], eL[1], 12, 1);
      sparkle(ctx, eR[0], eR[1], 12, 1);
    }
  }
  env.parts.draw(ctx, 0);
  env.parts.draw(ctx, 1);
  // Grade, the beam impact (E3), the flat shock at the shadow's head, the rush's radial blur (it follows the speed).
  soloStage(fx, { ca: lerp(0.01, 0.002, clamp((t - SLAM) / 0.3)), bloom: lerp(1.15, 1.0, clamp((t - SLAM) / 0.4)) });
  if (imp) soloImpact2(fx, 'A', { x: 0, y: 1, dx: 0.8, dy: -0.6, half: 0.45 });
  const hu = env.cam.toUV(head[0], head[1]);
  flatShockAt(fx, hu[0], hu[1], SLAM + 2 * F, t, 0.04, 0.3);
  if (t >= RUSH0 && t < RUSH1) {
    const sp = (rushU(t + F) - rushU(t - F)) / (2 * F) / (2 / (RUSH1 - RUSH0));
    fx.radial = 0.12 * clamp(sp);
    fx.radialX = hu[0];
    fx.radialY = hu[1];
  }
}

// ---------------------------------------------------------------- the shot

export const shotLightsOut: Shot = {
  name: META.name,
  dur: META.dur,
  seed: META.seed,
  rate: RATE[2],
  cues: [
    { at: 0.0, fn: (e) => { e.sfx.stomp(1.0); e.sfx.crowdStomp(1); e.sfx.crowd(2.0, 0.45); e.cam.shakeAmp = 14; e.cam.hit(0.4); e.cam.shove(0, 4); stompDust(e, 0, 1); } },
    { at: 0.8, fn: (e) => { e.sfx.stomp(1.15); e.sfx.crowdStomp(1); e.cam.hit(0.55); e.cam.shove(0, 5); stompDust(e, 0.8, 1.35); } },
    { at: 0.95, fn: (e) => { e.sfx.duck(0.7, 0.6); e.sfx.whoosh(0.2, 300, 900); } },
    { at: 1.4, fn: (e) => e.sfx.whoosh(0.15, 300, 1800) },
    { at: SNAP, fn: (e) => { e.sfx.snap(1.0); e.cam.hit(0.3); } },
    ...SURGE.map((at, i) => ({
      at,
      fn: (e: Env) => {
        e.sfx.surge([0.9, 1.0, 1.1, 1.3][i], [-0.5, 0.5, -0.85, 0.85][i]);
        e.sfx.boom([0.4, 0.45, 0.5, 0.6][i]);
        e.cam.hit(0.15);
        if (i < 3) bankBurst(e, banks2a()[i]);
      },
    })),
    { at: 1.68, fn: (e) => e.sfx.gasp(0.7) },
    { at: 1.8, fn: (e) => { e.parts.clear(); e.sfx.duck(0.95, 0.6); e.sfx.rumble(0.6, 0.06); } },
    { at: IGNITE, fn: (e) => { e.sfx.warDrum(1.0); e.sfx.boom(0.5); e.cam.hit(0.2); } },
    {
      at: EYES,
      fn: (e) => {
        e.sfx.warDrum(1.05);
        e.sfx.boom(0.6);
        e.sfx.shing(0.8);
        e.sfx.crashSwell(0.2);
        e.cam.hit(0.2);
        // The Tower's breath puffs (lilac in the phone light) at his mouth.
        for (let i = 0; i < 6; i++)
          e.parts.spawn({
            kind: PK.Smoke, x: TOWER_HEAD[0] - 46 + e.rng.range(-4, 4), y: TOWER_HEAD[1] + 30 + e.rng.range(-3, 3), vx: e.rng.range(-40, -14),
            vy: e.rng.range(-14, 4), drag: 1.6, max: e.rng.range(0.45, 0.7), s0: e.rng.range(4, 6), s1: e.rng.range(14, 22), ramp: 'mote',
            r0: 0.45, r1: 1, a0: 0.16, a1: 0, add: false, layer: 1,
          });
      },
    },
    { at: SLAM, fn: (e) => { e.parts.clear(); e.sfx.lampSlam(1.4); e.sfx.crash(0.8); e.cam.shakeAmp = 18; e.cam.hit(0.8); } },
    { at: 2.42, fn: (e) => e.sfx.whoosh(0.28, 200, 1800) },
    { at: SLITS, fn: (e) => { e.sfx.shing(0.9); e.sfx.gasp(0.4); } },
  ],
  prepare(env) {
    warmSolo2();
    warmSolo(env, ['SB0', 'SB1', 'SB2', 'SB3', 'EN1'], { fluoro: true });
    STAND = hasAnim('StandBack') ? anim('StandBack') : null;
    TOWER = hasAnim('TowerIdle') ? anim('TowerIdle') : null;
    // Kit swaps and silhouettes of the wall's frames.
    for (const k of ['RF1', 'RF2', 'RF3', 'RF4', 'RF1T', 'RF2T', 'RF3T', 'RF4T'] as RivalKey[]) {
      const p = rivalPic(k);
      if (!p) continue;
      kitImg(p, 'B');
      kitImg(p, 'C');
      uvSilhouette(p, 0, 0, PAL.plum, PAL.plum);
      uvSilhouette(p, 0, 0, PAL.spot, PAL.spot);
    }
    // The shadow layers and SB3's cropped silhouette.
    if (!SHL) SHL = { all: mkLayer(), mask: mkLayer(), near: mkLayer(), nearV: mkLayer(), far: mkLayer(), farV: mkLayer() };
    const sb3 = soloPic(env, 'SB3');
    const full = uvSilhouette(sb3, 0, 0, PAL.plum, PAL.plum);
    SIL = document.createElement('canvas');
    SIL.width = SIL_W;
    SIL.height = SIL_H;
    SIL.getContext('2d')!.drawImage(full, SIL_X0, SIL_Y0, SIL_W, SIL_H, 0, 0, SIL_W, SIL_H);
    uvSilhouette(sb3, 0, 0, [10, 5, 20], [10, 5, 20]);
    uvSilhouette(soloPic(env, 'EN1'), 0, 0, [9, 4, 18], [9, 4, 18]);
    // The Tower's back for 2b: a plum silhouette over a lilac copy offset 1 px (the rim on the top-left edges).
    if (TOWER) {
      const i = findFrame(TOWER, 'Back');
      if (i >= 0) {
        const tp = animPic(TOWER, i, `TowerIdle:${i}`);
        TOWER_SIL = uvSilhouette(tp, 0, 0, [26, 15, 46], [26, 15, 46]);
        TOWER_LIT = uvSilhouette(tp, 0, 0, PAL.lilac, PAL.lilac);
      }
    }
    banks2a();
  },
  init(env) {
    shadowKey = '';
    env.sfx.clearBus();
    env.cam.set(VW / 2, VH / 2, 1, 0);
    env.cam.shakeRoll = 0.015;
    env.cam.shakeAmp = 14;
    PUPPETS.frame();
  },
  update(env, t) {
    env.sfx.hum(HUM[2](t), 0.025);
    if (t < 1.8) SURGE.slice(0, 3).forEach((at, i) => stage.surgeSparks(env, banks2a()[i], at, t));
    if (t >= 1.8 && t < SLAM && env.cam.trauma < 0.08) env.cam.trauma = 0.08;
    if (t >= SLITS && env.cam.trauma < 0.3) env.cam.trauma = 0.3;
  },
  render(env, t) {
    const ctx = env.ctx;
    env.screen();
    ctx.fillStyle = HEX.void;
    ctx.fillRect(0, 0, VW, VH);
    PUPPETS.frame();
    if (t < 1.8) render2a(env, t);
    else if (t < SLAM) render2b(env, t);
    else render2c(env, t);
    env.screen();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  },
};
