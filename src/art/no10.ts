// No.10's studio frames by motion-library ID (docs/skills/MOTION_LIBRARY.md), with graceful fallbacks while
// the art is still in production. Shots and the field ask for a frame by its library ID ('F5a', 'M2', 'B11',
// 'G4', 'C1', 'D3'...). If the strip (or the frame) is not in src/art/anim/ yet, the existing hand-drawn art
// stands in, so nothing crashes and No.10 is never a puppet:
//   - side frames -> the Jump strip (hero_jump_side.png) pose that reads closest;
//   - StrikeMacro -> Strike F6/F7 (the shot crops it on the boot), then the Jump strip;
//   - back frames -> the hand-drawn No.10 sprite, back-lit (a navy overlay);
//   - Glance G4 -> the face crop of the hand-drawn sprite (G1);
//   - Celebrate -> Strike F10, then the Jump strip.

import type { Env } from '../cinematic/timeline';
import { boxFilter, drawAnim, drawAnimBoxed, findAnim, findFrame, type AnimDraw, type StudioAnim } from './studioAnim';
import { heroJump } from './heroJump';
import type { HeroArt } from './heroSprite';

type StripView = 'side' | 'front' | 'back' | 'face';
interface Ref {
  anim: string;
  view: StripView;
  frames: string[];
}
interface Def {
  view: 'side' | 'back' | 'face';
  refs: Ref[];
  /** Jump-strip stand-in (frame name, then index if the name changed). */
  jump: [string, number];
}

const side = (anim: string, frames: string[], jump: [string, number], more: Ref[] = []): Def => ({
  view: 'side',
  refs: [{ anim, view: 'side', frames }, ...more],
  jump,
});
const back = (anim: string, frames: string[]): Def => ({ view: 'back', refs: [{ anim, view: 'back', frames }], jump: ['load', 0] });
const LOAD: [string, number] = ['load', 0], CROUCH: [string, number] = ['crouch', 1], PUSH: [string, number] = ['push', 2];
const TAKEOFF: [string, number] = ['take-off', 3], LEAP: [string, number] = ['leap', 4], KNEE: [string, number] = ['knee drive', 5];
const FLOAT: [string, number] = ['rise float', 6];
const F10: Ref = { anim: 'Strike', view: 'side', frames: ['F10'] };
const STAND_A = ['a', 'Sa', 'B10a', 'S1', 'Stand a'], STAND_B = ['b', 'Sb', 'B10b', 'S2', 'Stand b'];

/** Every No.10 frame the new specials schedule, by library ID. */
export const NO10 = {
  // Run (Side): GALE 2 run-up; field caches.
  R1: side('Run', ['R1'], PUSH), R2: side('Run', ['R2'], LOAD), R3: side('Run', ['R3'], PUSH), R4: side('Run', ['R4'], LOAD),
  R5: side('Run', ['R5'], PUSH), R6: side('Run', ['R6'], LOAD), R7: side('Run', ['R7'], PUSH), R8: side('Run', ['R8'], LOAD),
  // Approach AP2: the airborne bound (sits on the pelvis).
  AP2: side('Approach', ['AP2'], KNEE),
  // Strike (Side): GALE 2-3.
  F5a: side('Strike', ['F5a', 'F5'], CROUCH),
  F5b: side('Strike', ['F5b', 'F5a', 'F5'], CROUCH),
  F6: side('Strike', ['F6'], PUSH),
  F7: side('Strike', ['F7'], TAKEOFF),
  F8: side('Strike', ['F8'], KNEE),
  F8b: side('Strike', ['F8b', 'F8'], FLOAT),
  F9: side('Strike', ['F9'], CROUCH),
  F10: side('Strike', ['F10'], LOAD),
  // StrikeMacro (GALE 3 insert, anchor 'laces'); fallback Strike F6/F7 cropped on the boot.
  M1: side('StrikeMacro', ['M1'], PUSH, [{ anim: 'Strike', view: 'side', frames: ['F6'] }]),
  M2: side('StrikeMacro', ['M2'], TAKEOFF, [{ anim: 'Strike', view: 'side', frames: ['F7'] }]),
  M3: side('StrikeMacro', ['M3'], TAKEOFF, [{ anim: 'Strike', view: 'side', frames: ['F7'] }]),
  // Back view: StrikeBack + Stand Back (GALE 6).
  B9: back('StrikeBack', ['B9']),
  Sa: back('Stand', STAND_A),
  Sb: back('Stand', STAND_B),
  B11: back('StrikeBack', ['B11']),
  B12: back('StrikeBack', ['B12', 'B11']),
  // Face crops (48x26, the grid of hero_no10.png at (26, 8)).
  G1: { view: 'face', refs: [{ anim: 'Glance', view: 'face', frames: ['G1'] }], jump: LOAD } as Def,
  G4: { view: 'face', refs: [{ anim: 'Glance', view: 'face', frames: ['G4', 'G1'] }], jump: LOAD } as Def,
  // Results: Celebrate (fallback Strike F10).
  C1: side('Celebrate', ['C1'], LEAP, [F10]),
  C2: side('Celebrate', ['C2', 'C1'], LEAP, [F10]),
  // Dribble (Side, frames F1-F8 of the Dribble strip): field carry.
  D1: side('Dribble', ['F1', 'D1'], PUSH), D2: side('Dribble', ['F2', 'D2'], LOAD), D3: side('Dribble', ['F3', 'D3'], LOAD),
  D4: side('Dribble', ['F4', 'D4'], PUSH), D5: side('Dribble', ['F5', 'D5'], PUSH), D6: side('Dribble', ['F6', 'D6'], LOAD),
  D7: side('Dribble', ['F7', 'D7'], LOAD), D8: side('Dribble', ['F8', 'D8'], PUSH),
} satisfies Record<string, Def>;

export type No10Key = keyof typeof NO10;

export interface No10Frame {
  a: StudioAnim;
  i: number;
  /** Which ref matched: 0 = the library frame itself, > 0 = a listed studio stand-in (e.g. Strike F7 for M2). */
  ref: number;
}

/** The studio frame for `key` (the library frame or a listed studio stand-in), or null while none is exported. */
export function no10(key: No10Key): No10Frame | null {
  const d: Def = NO10[key];
  for (let r = 0; r < d.refs.length; r++) {
    const ref = d.refs[r];
    const a = findAnim(ref.anim, ref.view);
    if (!a) continue;
    const i = findFrame(a, ...ref.frames);
    if (i >= 0) return { a, i, ref: r };
  }
  return null;
}

/** True when the library frame itself (not a stand-in) is exported. */
export function no10Final(key: No10Key): boolean {
  return no10(key)?.ref === 0;
}

function jumpIndex(d: Def): number {
  const jm = heroJump();
  const i = jm.frames.findIndex((f) => f.name === d.jump[0]);
  return i >= 0 ? i : Math.min(d.jump[1], jm.frames.length - 1);
}

/** Face crop rectangle of the hand-drawn sprite (G1). */
const faceRect = (h: HeroArt) => h.face;

/**
 * Frame-space point of anchor `name` for the image drawNo10 draws for `key` (studio frame or stand-in):
 * 'contact' | 'pelvis' | 'com' | 'center' | any named anchor ('ball', 'boot', 'laces', 'eye', ...).
 * Stand-ins approximate named anchors (the ball a little ahead of the planted toe, the boot at the toe).
 */
export function no10Anchor(env: Env, key: No10Key, name?: string): [number, number] {
  const d: Def = NO10[key];
  const f = no10(key);
  if (f) {
    const fr = f.a.frames[f.i];
    if (name === 'center') return [f.a.w / 2, f.a.h / 2];
    if (!name) return d.view === 'face' ? [f.a.w / 2, f.a.h / 2] : f.a.anchorOf(f.i);
    if (name === 'contact' || name === 'pelvis' || name === 'com' || fr.anchors[name]) return f.a.anchorOf(f.i, name);
    // Missing named anchor on a stand-in strip frame: same approximations as the Jump stand-in.
    return approx(f.a.anchorOf(f.i, 'contact'), f.a.anchorOf(f.i, 'pelvis'), !!fr.contact, name);
  }
  const hero = env.art.hero;
  if (d.view === 'face') {
    const r = faceRect(hero);
    if (name === 'eye' || name === 'eyeR') return [hero.eyes[1][0] - r.x + 0.5, hero.eyes[1][1] - r.y + 0.5];
    if (name === 'eyeL') return [hero.eyes[0][0] - r.x + 0.5, hero.eyes[0][1] - r.y + 0.5];
    return [r.w / 2, r.h / 2];
  }
  if (d.view === 'back') {
    if (name === 'center' || name === 'com') return [hero.w / 2, hero.h / 2];
    if (name === 'pelvis') return [hero.footX, hero.footY - 40];
    if (name === 'head') return [hero.footX, 18];
    return [hero.footX, hero.footY];
  }
  const jm = heroJump();
  const i = jumpIndex(d);
  const grounded = !!jm.frames[i].contact;
  if (!name) return jm.anchorOf(i);
  if (name === 'center') return [jm.w / 2, jm.h / 2];
  if (name === 'com') return jm.frames[i].com;
  if (name === 'contact' && grounded) return jm.anchorOf(i, 'contact');
  if (name === 'pelvis' || name === 'contact') return jm.anchorOf(i, 'pelvis');
  return approx(grounded ? jm.anchorOf(i, 'contact') : jm.anchorOf(i, 'pelvis'), jm.anchorOf(i, 'pelvis'), grounded, name);
}

function approx(contact: [number, number], pelvis: [number, number], grounded: boolean, name: string): [number, number] {
  const foot: [number, number] = grounded ? contact : [pelvis[0] + 6, pelvis[1] + 34];
  if (name === 'ball') return [foot[0] + 12, foot[1] - 6];
  if (name === 'boot' || name === 'laces' || name === 'touch') return [foot[0] + 4, foot[1] - 5];
  if (name === 'head' || name === 'eye') return [pelvis[0] + 4, pelvis[1] - 46];
  return pelvis;
}

/** The anchor drawNo10 places on (x, y) unless o.pivot is given. */
function drawAnchor(env: Env, key: No10Key, o: AnimDraw): [number, number] {
  return o.pivot ?? no10Anchor(env, key, o.anchor);
}

/**
 * World position of anchor `name` of `key` when drawn by drawNo10(env, key, x, y, scale, o) (same arguments):
 * use it to put the ball on the 'ball' / 'boot' / 'laces' guide, a sparkle on the 'eye', a dust ring on the 'contact'.
 */
export function no10Point(env: Env, key: No10Key, name: string, x: number, y: number, scale: number, o: AnimDraw = {}): [number, number] {
  const [ax, ay] = drawAnchor(env, key, o);
  const [px, py] = no10Anchor(env, key, name);
  let dx = (px - ax) * scale, dy = (py - ay) * scale;
  if (o.flip) dx = -dx;
  if (o.rot) {
    const c = Math.cos(o.rot), s = Math.sin(o.rot);
    [dx, dy] = [dx * c - dy * s, dx * s + dy * c];
  }
  return [x + dx, y + dy];
}

/**
 * Draw No.10's frame `key` so its anchor (o.anchor, default contact on the ground / pelvis in the air / centre of a
 * face crop) or o.pivot lands on world (x, y) at `scale` world px per art px (integer scales: nearest-neighbour).
 * `img` (optional) replaces the frame with a derived image of the same size (e.g. a.tinted(i, c)) when the frame is
 * a studio frame. Returns 'studio' when the library frame itself was drawn, 'standin' for a studio stand-in,
 * 'fallback' for the hand-drawn stand-in art.
 */
export function drawNo10(env: Env, key: No10Key, x: number, y: number, scale: number, o: AnimDraw = {}, img?: HTMLCanvasElement): 'studio' | 'standin' | 'fallback' {
  const ctx = env.ctx;
  const d: Def = NO10[key];
  const f = no10(key);
  if (f) {
    drawAnim(ctx, f.a, img ?? null, f.i, x, y, scale, { ...o, pivot: drawAnchor(env, key, o) });
    return f.ref === 0 ? 'studio' : 'standin';
  }
  const [ax, ay] = drawAnchor(env, key, o);
  const hero = env.art.hero;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = o.alpha ?? 1;
  ctx.translate(x, y);
  if (o.rot) ctx.rotate(o.rot);
  ctx.scale(o.flip ? -scale : scale, scale);
  if (d.view === 'face') {
    const r = faceRect(hero);
    ctx.drawImage(hero.img, r.x, r.y, r.w, r.h, -ax, -ay, r.w, r.h);
  } else if (d.view === 'back') {
    // Back-lit stand-in: the hand-drawn sprite under a navy veil (reads as a figure seen from behind at night).
    ctx.drawImage(hero.img, -ax, -ay);
    ctx.globalAlpha = (o.alpha ?? 1) * 0.62;
    ctx.drawImage(hero.tinted([10, 18, 56]), -ax, -ay);
  } else {
    const jm = heroJump();
    ctx.drawImage(jm.frames[jumpIndex(d)].img, -ax, -ay);
  }
  ctx.restore();
  return 'fallback';
}

const fallbackBoxes = new Map<string, HTMLCanvasElement>();

/**
 * Field-scale No.10: the box-filtered cache of frame `key` at `scale` (0.4x field, 0.5x result), anchor on (x, y),
 * 1 world px per cache px. Falls back like drawNo10 (Jump strip / back-lit sprite), box-filtered the same way.
 */
export function drawNo10Boxed(env: Env, key: No10Key, x: number, y: number, scale: number, o: AnimDraw = {}): 'studio' | 'standin' | 'fallback' {
  const ctx = env.ctx;
  const d: Def = NO10[key];
  const f = no10(key);
  const [ax, ay] = drawAnchor(env, key, o);
  if (f) {
    drawAnimBoxed(ctx, f.a, f.i, x, y, scale, { ...o, pivot: [ax, ay] });
    return f.ref === 0 ? 'studio' : 'standin';
  }
  let src: { px: Uint8ClampedArray; w: number; h: number; k: string };
  if (d.view === 'side') {
    const jm = heroJump();
    const i = jumpIndex(d);
    src = { px: jm.frames[i].px, w: jm.w, h: jm.h, k: `j${i}` };
  } else {
    const hero = env.art.hero;
    const px = hero.img.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, hero.w, hero.h).data;
    src = { px, w: hero.w, h: hero.h, k: 'hero' };
  }
  const k = `${src.k}|${scale}`;
  let cv = fallbackBoxes.get(k);
  if (!cv) fallbackBoxes.set(k, (cv = boxFilter(src.px, src.w, src.h, scale)));
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = o.alpha ?? 1;
  ctx.translate(x, y);
  if (o.rot) ctx.rotate(o.rot);
  if (o.flip) ctx.scale(-1, 1);
  ctx.drawImage(cv, -ax * scale, -ay * scale);
  ctx.restore();
  return 'fallback';
}

/** Warm the box-filtered caches (call from a prepare()): no hitch on the first frame that shows them. */
export function warmNo10Boxed(env: Env, keys: No10Key[], scale: number) {
  const ctx = env.ctx;
  ctx.save();
  ctx.globalAlpha = 0;
  for (const k of keys) drawNo10Boxed(env, k, -9999, -9999, scale);
  ctx.restore();
}
