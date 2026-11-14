// No.7's studio frames (Pixel Studio project "No.7", MOTION_LIBRARY §4), by animation and library ID:
// 'Run.R1'..'Run.R8', 'Receive.R1'..'Receive.R6', 'Point.Q1'/'Point.Q2', 'Celebrate.C1'/'Celebrate.C2'.
//
// Export stems: No.7's strips share animation names with No.10's ('Run', 'Point', 'Celebrate'), so they are exported
// with a No.7 prefix. Any of these is found: `No7Run`, `No7_Run`, `no7_run`, `no7run`, `Run7`, `run7`, `winger_run`
// (and the same for Receive / Point / Celebrate). Frames are found by name ('R1', 'Q2', ...).
//
// Fallback while the art is late (never crashes): the WINGER_KIT puppet in a matching pose, rendered once per pose
// and scale and cached. No.7 is drawn on the same body scale as No.10 (98 px standing at x1, ground row 102).

import type { Env } from '../cinematic/timeline';
import { anim, hasAnim, drawAnim, drawAnimBoxed, findFrame, type AnimDraw, type StudioAnim } from './studioAnim';
import { POSES, P, WINGER_KIT, joints, renderPuppet, type Pose } from './puppet';

const D = Math.PI / 180;

interface Def7 {
  anim: 'Run' | 'Receive' | 'Point' | 'Celebrate';
  frames: string[];
  /** Puppet fallback pose (facing east). */
  pose: Pose;
}

const RECEIVE_TOUCH = P({ torso: 8 * D, head: 26 * D, thighN: 34 * D, kneeN: 30 * D, footN: 18 * D, thighF: -6 * D, kneeF: 22 * D, armN: -30 * D, elbowN: 30 * D, armF: 40 * D, elbowF: 30 * D });
const RECEIVE_PLANT = P({ torso: 4 * D, head: 20 * D, thighN: -40 * D, kneeN: 90 * D, footN: 10 * D, thighF: 10 * D, kneeF: 24 * D, armN: 30 * D, elbowN: 20 * D, armF: -60 * D, elbowF: 20 * D });
const POINT_REACH = P({ ...POSES.stand, armN: 92 * D, elbowN: 4 * D, head: -4 * D });

/** Every No.7 frame MERIDIAN THREAD schedules (MOTION_LIBRARY §4). */
export const NO7 = {
  'Run.R1': { anim: 'Run', frames: ['R1'], pose: POSES.run1 },
  'Run.R2': { anim: 'Run', frames: ['R2'], pose: POSES.run2 },
  'Run.R3': { anim: 'Run', frames: ['R3'], pose: POSES.run2 },
  'Run.R4': { anim: 'Run', frames: ['R4'], pose: POSES.run3 },
  'Run.R5': { anim: 'Run', frames: ['R5'], pose: POSES.run3 },
  'Run.R6': { anim: 'Run', frames: ['R6'], pose: POSES.run4 },
  'Run.R7': { anim: 'Run', frames: ['R7'], pose: POSES.run4 },
  'Run.R8': { anim: 'Run', frames: ['R8'], pose: POSES.run1 },
  // Receive in stride: reach, touch (inside of the right foot), push-off, plant, side-foot strike, follow-through.
  'Receive.R1': { anim: 'Receive', frames: ['R1'], pose: P({ ...POSES.run1, head: 20 * D, footN: 30 * D }) },
  'Receive.R2': { anim: 'Receive', frames: ['R2'], pose: RECEIVE_TOUCH },
  'Receive.R3': { anim: 'Receive', frames: ['R3'], pose: POSES.run3 },
  'Receive.R4': { anim: 'Receive', frames: ['R4'], pose: RECEIVE_PLANT },
  'Receive.R5': { anim: 'Receive', frames: ['R5'], pose: POSES.crossKick },
  'Receive.R6': { anim: 'Receive', frames: ['R6'], pose: P({ ...POSES.crossKick, thighN: 60 * D, kneeN: 20 * D, torso: -4 * D }) },
  // Diptych (front): Q1 = Point P2 mirrored, Q2 = P3a mirrored (points back across with a grin).
  'Point.Q1': { anim: 'Point', frames: ['Q1'], pose: P({ ...POSES.stand, armN: 50 * D, elbowN: 60 * D }) },
  'Point.Q2': { anim: 'Point', frames: ['Q2'], pose: POINT_REACH },
  // Result view.
  'Celebrate.C1': { anim: 'Celebrate', frames: ['C1'], pose: POSES.celebrate },
  'Celebrate.C2': { anim: 'Celebrate', frames: ['C2', 'C1'], pose: P({ ...POSES.celebrate, armN: 180 * D, head: -26 * D }) },
} satisfies Record<string, Def7>;

export type No7Key = keyof typeof NO7;

const snake = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
const stems = (a: string) => [`No7${a}`, `No7_${a}`, `no7_${snake(a)}`, `no7${a.toLowerCase()}`, `${a}7`, `${a.toLowerCase()}7`, `winger_${snake(a)}`, `Winger${a}`];

/** The loaded No.7 strip for an animation (any of the accepted stems), or null while it is not exported. */
export function no7Anim(name: Def7['anim']): StudioAnim | null {
  for (const s of stems(name)) if (hasAnim(s)) return anim(s);
  return null;
}

/** The studio frame for `key`, or null (then the puppet stands in). */
export function no7(key: No7Key): { a: StudioAnim; i: number } | null {
  const d: Def7 = NO7[key];
  const a = no7Anim(d.anim);
  if (!a) return null;
  const i = findFrame(a, ...d.frames);
  return i >= 0 ? { a, i } : null;
}

/** True when No.7's studio frame for `key` is exported. */
export function no7Final(key: No7Key): boolean {
  return !!no7(key);
}

// ---------------------------------------------------------------- puppet fallback

/** Puppet px per unit at x1 (the studio body: 98 px standing). */
const K1 = 0.98;
interface PupImg {
  cv: HTMLCanvasElement;
  ox: number;
  oy: number;
  k: number;
}
const pupCache = new Map<string, PupImg>();

function puppetImg(key: No7Key, k: number, facing: 1 | -1): PupImg {
  const ck = `${key}|${k.toFixed(3)}|${facing}`;
  let p = pupCache.get(ck);
  if (!p) {
    const r = renderPuppet(WINGER_KIT, NO7[key].pose, { k, facing });
    const cv = document.createElement('canvas');
    cv.width = r.cv.width;
    cv.height = r.cv.height;
    cv.getContext('2d')!.drawImage(r.cv, 0, 0);
    p = { cv, ox: r.ox, oy: r.oy, k };
    pupCache.set(ck, p);
    if (pupCache.size > 160) pupCache.delete(pupCache.keys().next().value as string);
  }
  return p;
}

/** Puppet-space anchor (units from the hip, facing east) for the fallback. */
function pupAnchor(key: No7Key, name?: string): [number, number] {
  const j = joints(NO7[key].pose);
  const low = j.toeN[1] > j.toeF[1] ? j.toeN : j.toeF;
  const foot: [number, number] = [low[0], Math.max(low[1], 40)];
  switch (name ?? 'contact') {
    case 'pelvis':
    case 'com':
      return [0, 0];
    case 'ball':
      return [foot[0] + 12, foot[1] - 6];
    case 'boot':
    case 'touch':
      return j.toeN;
    case 'tip':
      return j.handN;
    case 'head':
    case 'eye':
      return j.head;
    default:
      return [foot[0], 40];
  }
}

/** Frame-space point of anchor `name` for `key` (the studio frame, or the puppet fallback at scale 1). */
export function no7Anchor(key: No7Key, name?: string): [number, number] {
  const f = no7(key);
  if (f) {
    const fr = f.a.frames[f.i];
    if (!name || name === 'contact' || name === 'pelvis' || name === 'com' || fr.anchors[name]) return f.a.anchorOf(f.i, name);
    const c = f.a.anchorOf(f.i, 'contact');
    if (name === 'ball') return [c[0] + 12, c[1] - 6];
    if (name === 'boot' || name === 'touch') return [c[0] + 4, c[1] - 5];
    return f.a.anchorOf(f.i, 'pelvis');
  }
  const [ux, uy] = pupAnchor(key, name);
  return [ux * K1, uy * K1];
}

/** World position of anchor `name` of `key` when drawn by drawNo7(env, key, x, y, scale, o). */
export function no7Point(env: Env, key: No7Key, name: string, x: number, y: number, scale: number, o: AnimDraw = {}): [number, number] {
  void env;
  const [ax, ay] = o.pivot ?? no7Anchor(key, o.anchor);
  const [px, py] = no7Anchor(key, name);
  let dx = (px - ax) * scale, dy = (py - ay) * scale;
  if (o.flip) dx = -dx;
  if (o.rot) {
    const c = Math.cos(o.rot), s = Math.sin(o.rot);
    [dx, dy] = [dx * c - dy * s, dx * s + dy * c];
  }
  return [x + dx, y + dy];
}

/**
 * Draw No.7's frame `key` so its anchor (o.anchor, default contact on the ground / pelvis in the air) or o.pivot lands
 * on world (x, y), at `scale` world px per art px (integer scales: nearest-neighbour). `flip` faces west (the west strip
 * when exported, so the "7" reads). Returns 'studio', or 'puppet' while No.7's strip is not exported.
 */
export function drawNo7(env: Env, key: No7Key, x: number, y: number, scale: number, o: AnimDraw = {}): 'studio' | 'puppet' {
  const f = no7(key);
  if (f) {
    drawAnim(env.ctx, f.a, null, f.i, x, y, scale, { ...o, pivot: o.pivot ?? no7Anchor(key, o.anchor) });
    return 'studio';
  }
  const p = puppetImg(key, K1, o.flip ? -1 : 1);
  const [ax, ay] = o.pivot ?? no7Anchor(key, o.anchor);
  drawPup(env.ctx, p, ax, ay, x, y, scale, o);
  return 'puppet';
}

/**
 * Wide-shot / field No.7: the box-filtered cache of `key` at `scale` (0.4x, 0.5x), anchor on (x, y), 1 world px per
 * cache px (the puppet is rasterised directly at that scale). Warm with warmNo7() in prepare().
 */
export function drawNo7Boxed(env: Env, key: No7Key, x: number, y: number, scale: number, o: AnimDraw = {}): 'studio' | 'puppet' {
  const f = no7(key);
  if (f) {
    drawAnimBoxed(env.ctx, f.a, f.i, x, y, scale, { ...o, pivot: o.pivot ?? no7Anchor(key, o.anchor) });
    return 'studio';
  }
  const p = puppetImg(key, K1 * scale, o.flip ? -1 : 1);
  const [ax, ay] = o.pivot ?? no7Anchor(key, o.anchor);
  drawPup(env.ctx, p, ax * scale, ay * scale, x, y, 1, o, true);
  return 'puppet';
}

/** Place a cached puppet so frame-space anchor (ax, ay) (at x1 / at the cache scale) lands on (x, y). */
function drawPup(ctx: CanvasRenderingContext2D, p: PupImg, ax: number, ay: number, x: number, y: number, scale: number, o: AnimDraw, boxed = false) {
  // The puppet canvas is rendered at k px per unit with the hip at (ox, oy) and already mirrored for flip;
  // frame-space anchors are hip-relative at K1 (x1) or K1 * scale (boxed).
  const kk = boxed ? 1 : K1 / p.k;
  const fx = o.flip ? -1 : 1;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = o.alpha ?? 1;
  ctx.translate(x, y);
  if (o.rot) ctx.rotate(o.rot);
  ctx.scale(scale * kk, scale * kk);
  ctx.drawImage(p.cv, -p.ox - (ax * fx) / kk, -p.oy - ay / kk);
  ctx.restore();
}

/** Warm No.7's caches (call from a prepare()): boxed at `scale` when boxed, else the x1 frames / puppets. */
export function warmNo7(env: Env, keys: No7Key[], scale: number, boxed = true) {
  const ctx = env.ctx;
  ctx.save();
  ctx.globalAlpha = 0;
  for (const k of keys) (boxed ? drawNo7Boxed : drawNo7)(env, k, -9999, -9999, scale);
  ctx.restore();
}
