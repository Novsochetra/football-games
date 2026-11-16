// SPOTLIGHT SOLO v2: every studio frame the special draws, by key, with the brief's fallbacks (SPEC.md §9.1-§9.5).
// No.10 is ALWAYS studio-drawn: a key resolves to the library frame itself, then the listed studio stand-ins, then the
// hand-drawn art (the Jump strip for side views, the No.10 sprite for front / back views, its face crop for faces),
// never a puppet. The rivals (RivalFront incl. the Tower's RF1T-RF4T, RivalSlide, KeeperBack) resolve the same way to
// `null` when missing, so the shot falls back to a puppet (the brief allows puppets for opponents only).
//
// Views: 'side' (Dribble, SoleLift, Settle, DragBack), 'front' (FrontTouch, StepOver, Elastico, Nutmeg, Break, Encore,
// HurdleFront), 'back' (SnapBack, StandBack), 'face' (SoloFace, GlanceFace 48x26), 'macro' (MacroBoots: boot and shin
// only, no numbers, may mirror). Front and back frames never mirror without a west strip (the "10" never reads "01").

import type { Env } from '../timeline';
import type { RGB } from '../../engine/math';
import { anim, boxFilter, findAnim, findFrame, hasAnim, type AnimDraw, type StudioAnim } from '../../art/studioAnim';
import { heroJump } from '../../art/heroJump';
import { drawFluoro, type LitPic } from '../../art/stage';

type StripView = 'side' | 'front' | 'back' | 'face';
export type SoloView = 'side' | 'front' | 'back' | 'face' | 'macro';
interface Ref {
  anim: string;
  view: StripView;
  frames: string[];
}
interface Def {
  view: SoloView;
  refs: Ref[];
  /** Jump-strip stand-in for side / macro frames (name, then index). */
  jump?: [string, number];
}

const LOAD: [string, number] = ['load', 0], CROUCH: [string, number] = ['crouch', 1], PUSH: [string, number] = ['push', 2];
const LEAP: [string, number] = ['leap', 4], KNEE: [string, number] = ['knee lift', 5], FLOAT: [string, number] = ['rise float', 6];

const R = (anim: string, view: StripView, ...frames: string[]): Ref => ({ anim, view, frames });
const side = (anim: string, frames: string[], jump: [string, number], ...more: Ref[]): Def => ({ view: 'side', refs: [R(anim, 'side', ...frames), ...more], jump });
const front = (anim: string, frames: string[], ...more: Ref[]): Def => ({ view: 'front', refs: [R(anim, 'front', ...frames), ...more] });
const back = (anim: string, frames: string[], ...more: Ref[]): Def => ({ view: 'back', refs: [R(anim, 'back', ...frames), ...more] });
const face = (anim: string, frames: string[], ...more: Ref[]): Def => ({ view: 'face', refs: [R(anim, 'face', ...frames), ...more] });
const macro = (frames: string[], jump: [string, number], ...more: Ref[]): Def => ({ view: 'macro', refs: [R('MacroBoots', 'side', ...frames), ...more], jump });

// Studio stand-ins that already exist.
const RUN = (k: number) => R('Run', 'side', `R${k}`);
const STRIKE = (...f: string[]) => R('Strike', 'side', ...f);
const STAND_A = R('Stand', 'front', 'a', 'Sa', 'STa');
const STAND_B = R('Stand', 'front', 'b', 'Sb', 'STb');
const BACK_A = R('Stand', 'back', 'a');
const BACK_B = R('Stand', 'back', 'b');

/** Every No.10 frame SPOTLIGHT SOLO v2 schedules, by key (v1's library frames + the 17 new + DragBack for ENCORE). */
export const SOLO2 = {
  // ---- v2 new (§9.1)
  SF1: face('SoloFace', ['SF1'], R('Glance', 'face', 'G1')),
  SF2: face('SoloFace', ['SF2'], R('Glance', 'face', 'G2', 'G1')),
  SB0: back('SnapBack', ['SB0'], BACK_A),
  SB1: back('SnapBack', ['SB1'], BACK_A),
  SB2: back('SnapBack', ['SB2'], BACK_B),
  SB3: back('SnapBack', ['SB3'], BACK_B),
  EN1: front('Encore', ['EN1'], STAND_A),
  EN1b: front('Encore', ['EN1b', 'EN1'], STAND_B),
  EN2: front('Encore', ['EN2'], STAND_A),
  EN3: front('Encore', ['EN3'], STAND_A),
  EN3b: front('Encore', ['EN3b', 'EN3'], STAND_B),
  HF1: front('HurdleFront', ['HF1'], STAND_A),
  MB1: macro(['MB1'], LOAD, R('StrikeMacro', 'side', 'M1')),
  MB2: macro(['MB2'], PUSH, R('StrikeMacro', 'side', 'M2')),
  MB3: macro(['MB3'], LOAD, R('Dribble', 'side', 'F1')),
  MB4: macro(['MB4'], PUSH, R('Elastico', 'front', 'F2')),
  MB5: macro(['MB5'], PUSH, R('Elastico', 'front', 'F5')),
  MB6: macro(['MB6'], CROUCH, R('SoleLift', 'side', 'F3')),
  // ENCORE (§12, the owner's ending): the drag-back past the seated keeper and the tap into the net.
  DB1: side('DragBack', ['DB1'], LOAD, R('Settle', 'side', 'F2')),
  DB2: side('DragBack', ['DB2'], LOAD, R('Settle', 'side', 'F3')),
  DB3: side('DragBack', ['DB3'], PUSH, R('Dribble', 'side', 'F1')),
  DB4: side('DragBack', ['DB4'], PUSH, R('Dribble', 'side', 'F5')),
  DB4b: side('DragBack', ['DB4b', 'DB4'], LOAD, R('Settle', 'side', 'F3')),
  DB4c: side('DragBack', ['DB4c', 'DB4b'], LOAD, R('Settle', 'side', 'F3b', 'F3')),
  // ---- v1 library frames reused (§9.3)
  D1: side('Dribble', ['F1', 'D1'], PUSH, RUN(1)), D2: side('Dribble', ['F2', 'D2'], LOAD, RUN(2)),
  D3: side('Dribble', ['F3', 'D3'], LOAD, RUN(3)), D4: side('Dribble', ['F4', 'D4'], PUSH, RUN(4)),
  D5: side('Dribble', ['F5', 'D5'], PUSH, RUN(5)), D6: side('Dribble', ['F6', 'D6'], LOAD, RUN(6)),
  D7: side('Dribble', ['F7', 'D7'], LOAD, RUN(7)), D8: side('Dribble', ['F8', 'D8'], PUSH, RUN(8)),
  SL3: side('SoleLift', ['F3', 'SL3'], CROUCH, STRIKE('F5b', 'F5a')),
  SL4: side('SoleLift', ['F4', 'SL4'], CROUCH, STRIKE('F5b', 'F5a')),
  SL5: side('SoleLift', ['F5', 'SL5'], PUSH, STRIKE('F6')),
  SL6: side('SoleLift', ['F6', 'SL6'], PUSH, STRIKE('F7')),
  SL7: side('SoleLift', ['F7', 'SL7'], LEAP, R('Approach', 'side', 'AP2')),
  SL8: side('SoleLift', ['F8', 'SL8'], KNEE, STRIKE('F8')),
  SL8b: side('SoleLift', ['F8b', 'SL8b', 'F8'], FLOAT, STRIKE('F8b', 'F8')),
  SL8h: side('SoleLift', ['F8h', 'F8b', 'F8'], FLOAT, STRIKE('F8b', 'F8')),
  SL9: side('SoleLift', ['F9', 'SL9'], FLOAT, STRIKE('F8b', 'F8')),
  SL10: side('SoleLift', ['F10', 'SL10'], CROUCH, STRIKE('F9')),
  SL11: side('SoleLift', ['F11', 'SL11'], LOAD, STRIKE('F10')),
  ST2: side('Settle', ['F2', 'ST2'], LOAD, STRIKE('F10')),
  ST3: side('Settle', ['F3', 'ST3'], LOAD, STRIKE('F10')),
  ST3b: side('Settle', ['F3b', 'ST3b', 'F3'], LOAD, STRIKE('F10')),
  FT1: front('FrontTouch', ['FT1', 'F1'], STAND_A),
  SO2: front('StepOver', ['F2', 'SO2'], STAND_A), SO3: front('StepOver', ['F3', 'SO3'], STAND_B),
  SO4: front('StepOver', ['F4', 'SO4'], STAND_A), SO5: front('StepOver', ['F5', 'SO5'], STAND_B),
  SO6: front('StepOver', ['F6', 'SO6'], STAND_A), SO7: front('StepOver', ['F7', 'SO7'], STAND_B),
  EL2: front('Elastico', ['F2', 'EL2'], STAND_A), EL5: front('Elastico', ['F5', 'EL5'], STAND_A),
  NM2: front('Nutmeg', ['F2', 'NM2'], STAND_A), NM3: front('Nutmeg', ['F3', 'NM3'], STAND_B),
  NM4: front('Nutmeg', ['F4', 'NM4'], STAND_A),
  BR0: front('Break', ['BR0', 'BR1'], STAND_A),
  BR1: front('Break', ['BR1'], STAND_A), BR2: front('Break', ['BR2'], STAND_B), BR3: front('Break', ['BR3'], STAND_A),
  G1: face('Glance', ['G1']),
} satisfies Record<string, Def>;

export type SoloKey = keyof typeof SOLO2;

/** A resolved drawable: the image, its pixels and anchor lookup, whatever the source (also a stage LitPic). */
export interface Pic extends LitPic {
  /** Pre-mirrored copy with readable numbers (studio west strip), when there is one. */
  west: HTMLCanvasElement | null;
  grounded: boolean;
  anchor(name?: string): [number, number];
  /** 'studio' = the library frame itself, 'standin' = another studio frame, 'fallback' = hand-drawn art. */
  source: 'studio' | 'standin' | 'fallback';
}

/** Find a strip by exact export name first ('StandFront', 'SoleLift'), then by findAnim's stem rules. */
function strip(name: string, view: StripView): StudioAnim | null {
  const V = view[0].toUpperCase() + view.slice(1);
  for (const c of [name + V, name, `${name}_${view}`]) if (hasAnim(c)) return anim(c);
  return findAnim(name, view);
}

const picCache = new Map<string, Pic>();
const pixelsOf = (cv: HTMLCanvasElement) => cv.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, cv.width, cv.height).data;

function studioPic(id: string, a: StudioAnim, i: number, source: Pic['source'], view: SoloView): Pic {
  const f = a.frames[i];
  return {
    id,
    img: f.img,
    west: f.west,
    w: a.w,
    h: a.h,
    px: f.px,
    grounded: !!f.contact,
    source,
    anchor(name) {
      if (name === 'center') return [a.w / 2, a.h / 2];
      if (!name || name === 'contact' || name === 'pelvis' || name === 'com' || f.anchors[name]) return a.anchorOf(i, name);
      return approx(view, a.anchorOf(i, 'contact'), a.anchorOf(i, 'pelvis'), !!f.contact, name);
    },
  };
}

/** Named anchors a stand-in does not carry (approximations so a missing anchor never throws). */
function approx(view: SoloView, contact: [number, number], pelvis: [number, number], grounded: boolean, name: string): [number, number] {
  if (view === 'front' || view === 'back') {
    if (name === 'ball') return [pelvis[0] - 5, contact[1] + 3];
    if (name === 'boot' || name === 'touch' || name === 'sole') return [pelvis[0] - 6, contact[1] - 2];
    if (name === 'head' || name === 'eye') return [pelvis[0], pelvis[1] - 44];
    if (name === 'eyeL') return [pelvis[0] - 4, pelvis[1] - 46];
    if (name === 'eyeR') return [pelvis[0] + 4, pelvis[1] - 46];
    if (name === 'hand') return [pelvis[0] + 22, pelvis[1] - 60];
    if (name === 'chest') return [pelvis[0], pelvis[1] - 22];
    return pelvis;
  }
  if (view === 'macro') {
    if (name === 'ball' || name === 'ballPt') return [pelvis[0] + 22, pelvis[1] + 14];
    return pelvis;
  }
  const foot: [number, number] = grounded ? contact : [pelvis[0] + 6, pelvis[1] + 34];
  if (name === 'ball') return [foot[0] + 12, foot[1] - 6];
  if (name === 'boot' || name === 'laces' || name === 'touch' || name === 'sole') return [foot[0] + 4, foot[1] - 5];
  if (name === 'head' || name === 'eye') return [pelvis[0] + 4, pelvis[1] - 46];
  return pelvis;
}

function fallbackPic(env: Env, key: SoloKey, d: Def): Pic {
  const id = `fb2:${key}`;
  const hit = picCache.get(id);
  if (hit) return hit;
  let pic: Pic;
  const hero = env.art.hero;
  if (d.view === 'side' || d.view === 'macro') {
    const jm = heroJump();
    let i = jm.frames.findIndex((f) => f.name === d.jump![0]);
    if (i < 0) i = Math.min(d.jump![1], jm.frames.length - 1);
    const f = jm.frames[i];
    pic = {
      id: `jump:${i}`, img: f.img, west: null, w: jm.w, h: jm.h, px: f.px, grounded: !!f.contact, source: 'fallback',
      anchor(name) {
        if (name === 'center') return [jm.w / 2, jm.h / 2];
        if (name === 'com') return f.com;
        if (!name) return jm.anchorOf(i);
        if (name === 'contact' && f.contact) return jm.anchorOf(i, 'contact');
        if (name === 'pelvis' || name === 'contact') return jm.anchorOf(i, 'pelvis');
        return approx('side', f.contact ? jm.anchorOf(i, 'contact') : jm.anchorOf(i, 'pelvis'), jm.anchorOf(i, 'pelvis'), !!f.contact, name);
      },
    };
  } else if (d.view === 'front' || d.view === 'back') {
    const px = pixelsOf(hero.img);
    pic = {
      id: 'sprite', img: hero.img, west: null, w: hero.w, h: hero.h, px, grounded: true, source: 'fallback',
      anchor(name) {
        if (name === 'center' || name === 'com') return [hero.w / 2, hero.h / 2];
        if (!name || name === 'contact') return [hero.footX, hero.footY];
        if (name === 'pelvis') return [hero.footX, hero.footY - 40];
        if (name === 'eyeL' || name === 'eyeR') {
          const e = hero.eyes[name === 'eyeL' ? 0 : 1];
          return [e[0] + 0.5, e[1] + 0.5];
        }
        return approx('front', [hero.footX, hero.footY], [hero.footX, hero.footY - 40], true, name);
      },
    };
  } else {
    const r = hero.face;
    const cv = document.createElement('canvas');
    cv.width = r.w;
    cv.height = r.h;
    cv.getContext('2d')!.drawImage(hero.img, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
    pic = {
      id: 'face', img: cv, west: null, w: r.w, h: r.h, px: pixelsOf(cv), grounded: false, source: 'fallback',
      anchor(name) {
        if (name === 'eye' || name === 'eyeR' || name === 'pupilR') return [hero.eyes[1][0] - r.x + 0.5, hero.eyes[1][1] - r.y + 0.5];
        if (name === 'eyeL' || name === 'pupilL') return [hero.eyes[0][0] - r.x + 0.5, hero.eyes[0][1] - r.y + 0.5];
        return [r.w / 2, r.h / 2];
      },
    };
  }
  picCache.set(id, pic);
  return pic;
}

/** Resolve a key to the best available picture (library frame > studio stand-in > hand-drawn). Never null, never a puppet. */
export function soloPic(env: Env, key: SoloKey): Pic {
  const d: Def = SOLO2[key];
  for (let r = 0; r < d.refs.length; r++) {
    const ref = d.refs[r];
    const a = strip(ref.anim, ref.view);
    if (!a) continue;
    const i = findFrame(a, ...ref.frames);
    if (i < 0) continue;
    const id = `${a.name}:${i}`;
    const ck = `${id}|${r === 0 ? 's' : 't'}|${d.view}`;
    let p = picCache.get(ck);
    if (!p) picCache.set(ck, (p = studioPic(id, a, i, r === 0 ? 'studio' : 'standin', d.view)));
    return p;
  }
  return fallbackPic(env, key, d);
}

/** True when the library frame itself (not a stand-in) is exported. */
export function soloFinal(env: Env, key: SoloKey): boolean {
  return soloPic(env, key).source === 'studio';
}

/** The view of a key. */
export const soloView = (key: SoloKey): SoloView => (SOLO2[key] as Def).view;

/** Frame-space anchor of `key`. */
export function soloAnchor(env: Env, key: SoloKey, name?: string): [number, number] {
  return soloPic(env, key).anchor(name);
}

/** World position of anchor `name` when `key` is drawn by drawSolo(env, key, x, y, scale, o) (same arguments). */
export function soloPoint(env: Env, key: SoloKey, name: string, x: number, y: number, scale: number, o: AnimDraw = {}): [number, number] {
  const p = soloPic(env, key);
  const [ax, ay] = o.pivot ?? p.anchor(o.anchor ?? defaultAnchor(key));
  const [px, py] = p.anchor(name);
  let dx = (px - ax) * scale, dy = (py - ay) * scale;
  if (o.flip) dx = -dx;
  if (o.rot) {
    const c = Math.cos(o.rot), s = Math.sin(o.rot);
    [dx, dy] = [dx * c - dy * s, dx * s + dy * c];
  }
  return [x + dx, y + dy];
}

/** Top-left of the picture when drawn by drawSolo with these arguments (no rotation): for underLight / rimLight. */
export function soloTopLeft(env: Env, key: SoloKey, x: number, y: number, scale: number, o: AnimDraw = {}): [number, number] {
  const p = soloPic(env, key);
  const [ax, ay] = o.pivot ?? p.anchor(o.anchor ?? defaultAnchor(key));
  return o.flip ? [x - (p.w - ax) * scale, y - ay * scale] : [x - ax * scale, y - ay * scale];
}

const defaultAnchor = (key: SoloKey) => (soloView(key) === 'face' ? 'center' : undefined);

function mirrorOk(p: Pic, key: SoloKey) {
  const v = soloView(key);
  return !(v === 'front' || v === 'back') || !!p.west;
}

function blit(ctx: CanvasRenderingContext2D, p: Pic, img: HTMLCanvasElement, x: number, y: number, scale: number, o: AnimDraw, mirrored: boolean) {
  let [ax, ay] = o.pivot ?? p.anchor(o.anchor);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = o.alpha ?? 1;
  ctx.translate(x, y);
  if (o.rot) ctx.rotate(o.rot);
  if (o.flip && mirrored) {
    ax = p.w - ax;
    ctx.scale(scale, scale);
  } else ctx.scale(o.flip ? -scale : scale, scale);
  ctx.drawImage(img, -ax, -ay);
  ctx.restore();
}

/**
 * Draw No.10's frame `key` so its anchor (o.anchor; default contact on the ground / pelvis in the air / centre of a face
 * crop) or o.pivot lands on (x, y) at `scale` (nearest-neighbour). `flip` uses the studio west strip when there is one;
 * a front / back frame without one is never mirrored. `img` replaces the picture with a same-size derived image.
 */
export function drawSolo(env: Env, key: SoloKey, x: number, y: number, scale: number, o: AnimDraw = {}, img?: HTMLCanvasElement): Pic['source'] {
  const p = soloPic(env, key);
  let o2 = soloView(key) === 'face' && !o.anchor && !o.pivot ? { ...o, anchor: 'center' } : o;
  if (!img && o.flip && !mirrorOk(p, key)) o2 = { ...o2, flip: false };
  const west = !img && !!o.flip && !!p.west;
  blit(env.ctx, p, img ?? (west ? p.west! : p.img), x, y, scale, o2, west);
  return p.source;
}

const boxCache = new Map<string, HTMLCanvasElement>();
/** Small-scale No.10 (field 0.4x, result 0.5x, the crane's 0.25x): the box-filtered cache of `key`, anchor on (x, y). */
export function drawSoloBoxed(env: Env, key: SoloKey, x: number, y: number, scale: number, o: AnimDraw = {}) {
  const p = soloPic(env, key);
  if (o.flip && !mirrorOk(p, key)) o = { ...o, flip: false };
  const west = !!o.flip && !!p.west;
  const k = `${p.id}|${scale}|${west ? 'w' : 'e'}`;
  let cv = boxCache.get(k);
  if (!cv) boxCache.set(k, (cv = boxFilter(west ? pixelsOf(p.west!) : p.px, p.w, p.h, scale)));
  let [ax, ay] = o.pivot ?? p.anchor(o.anchor ?? defaultAnchor(key));
  if (west) ax = p.w - ax;
  const ctx = env.ctx;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = o.alpha ?? 1;
  ctx.translate(x, y);
  if (o.rot) ctx.rotate(o.rot);
  if (o.flip && !west) ctx.scale(-1, 1);
  ctx.drawImage(cv, -ax * scale, -ay * scale);
  ctx.restore();
}

/** His fluorescent whites (boots, sock trims, eye whites) lilac-white and additive, placed like drawSolo (after the dim). */
export function drawSoloFluoro(env: Env, key: SoloKey, x: number, y: number, scale: number, a = 1, o: AnimDraw = {}) {
  const p = soloPic(env, key);
  const flip = !!o.flip && mirrorOk(p, key);
  const [tx, ty] = soloTopLeft(env, key, x, y, scale, { ...o, flip });
  drawFluoro(env.ctx, p, tx, ty, scale, a, flip && !p.west);
}

// ---------------------------------------------------------------- uv silhouettes (the Chorus builds on these)

export const GHOST_FILL: RGB = [168, 128, 255];
export const GHOST_RIM: RGB = [246, 240, 223];

export interface GhostOpts extends AnimDraw {
  /** Direction toward the light in image space (default top-right (1, -1) for side views, top (0, -1) otherwise). */
  lx?: number;
  ly?: number;
  fill?: RGB;
  rim?: RGB;
}

const ghostCache = new Map<string, HTMLCanvasElement>();
/** The silhouette of a picture: every opaque pixel `fill`, a 1 px `rim` on the edge facing (lx, ly). Cached. */
export function uvSilhouette(p: Pic, lx: number, ly: number, fill: RGB = GHOST_FILL, rim: RGB = GHOST_RIM): HTMLCanvasElement {
  const sx = Math.sign(Math.round(lx)), sy = Math.sign(Math.round(ly));
  const k = `${p.id}|${sx},${sy}|${fill.join(',')}|${rim.join(',')}`;
  let cv = ghostCache.get(k);
  if (cv) return cv;
  const w = p.w, h = p.h, src = p.px;
  cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const g = cv.getContext('2d')!;
  const out = g.createImageData(w, h);
  const d = out.data;
  const op = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && src[(y * w + x) * 4 + 3] > 40;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (!op(x, y)) continue;
      const k4 = (y * w + x) * 4;
      const edge = (sx !== 0 && !op(x + sx, y)) || (sy !== 0 && !op(x, y + sy)) || (sx !== 0 && sy !== 0 && !op(x + sx, y + sy));
      const c = edge ? rim : fill;
      d[k4] = c[0];
      d[k4 + 1] = c[1];
      d[k4 + 2] = c[2];
      d[k4 + 3] = 255;
    }
  g.putImageData(out, 0, 0);
  ghostCache.set(k, cv);
  return cv;
}

/** Draw the silhouette of `key` (placement as drawSolo; alpha from o.alpha). */
export function drawSoloGhost(env: Env, key: SoloKey, x: number, y: number, scale: number, o: GhostOpts = {}) {
  const p = soloPic(env, key);
  const view = soloView(key);
  let lx = o.lx ?? (view === 'side' || view === 'macro' ? 1 : 0), ly = o.ly ?? -1;
  if (o.flip) lx = -lx;
  const sil = uvSilhouette(p, lx, ly, o.fill, o.rim);
  const o2 = view === 'face' && !o.anchor && !o.pivot ? { ...o, anchor: 'center' } : o;
  blit(env.ctx, p, sil, x, y, scale, o2, false);
}

/** Warm the caches a shot or the field will use (prepare()): pictures, boxed copies, silhouettes, fluoro masks. */
export function warmSolo(env: Env, keys: readonly SoloKey[], o: { boxed?: number[]; ghosts?: boolean; fluoro?: boolean } = {}) {
  const ctx = env.ctx;
  ctx.save();
  ctx.globalAlpha = 0;
  for (const k of keys) {
    const p = soloPic(env, k);
    for (const s of o.boxed ?? []) drawSoloBoxed(env, k, -9999, -9999, s);
    if (o.ghosts) uvSilhouette(p, soloView(k) === 'side' || soloView(k) === 'macro' ? 1 : 0, -1);
    if (o.fluoro) drawSoloFluoro(env, k, -9999, -9999, 1, 0);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the rivals and the keeper (studio frames or null)

/** Rival / keeper studio frames (Rivals project): RivalFront (A-C on RIVAL_KIT, D on the Tower's body), RivalSlide, KeeperBack. */
export const RIVAL_FRAMES = {
  RF1: ['RivalFront', 'front', 'RF1'], RF2: ['RivalFront', 'front', 'RF2'], RF3: ['RivalFront', 'front', 'RF3'], RF4: ['RivalFront', 'front', 'RF4'],
  RF1T: ['RivalFront', 'front', 'RF1T'], RF2T: ['RivalFront', 'front', 'RF2T'], RF3T: ['RivalFront', 'front', 'RF3T'], RF4T: ['RivalFront', 'front', 'RF4T'],
  S0: ['RivalSlide', 'side', 'S0'], S1: ['RivalSlide', 'side', 'S1'], S2: ['RivalSlide', 'side', 'S2'], S2b: ['RivalSlide', 'side', 'S2b'],
  S2c: ['RivalSlide', 'side', 'S2c'], S3: ['RivalSlide', 'side', 'S3'], S4: ['RivalSlide', 'side', 'S4'],
  K1: ['KeeperBack', 'back', 'K1'], K2: ['KeeperBack', 'back', 'K2'],
} as const satisfies Record<string, readonly [string, StripView, string]>;
export type RivalKey = keyof typeof RIVAL_FRAMES;

const rivalCache = new Map<string, Pic | null>();
/** A rival / keeper studio frame, or null while it is not exported (then draw the brief's puppet fallback). */
export function rivalPic(key: RivalKey): Pic | null {
  if (rivalCache.has(key)) return rivalCache.get(key)!;
  const [name, view, frame] = RIVAL_FRAMES[key];
  const a = strip(name, view);
  const i = a ? findFrame(a, frame) : -1;
  // findFrame matches by the last word too: make sure 'RF1' does not pick 'RF1T' and S4 does not pick another frame.
  const p = a && i >= 0 && a.frames[i].name === frame ? studioPic(`${a.name}:${i}`, a, i, 'studio', view === 'back' ? 'back' : view) : null;
  rivalCache.set(key, p);
  return p;
}

/** Draw a rival frame (anchor on (x, y), nearest); false when it is missing (draw the puppet fallback instead). */
export function drawRival(env: Env, key: RivalKey, x: number, y: number, scale: number, o: AnimDraw = {}, img?: HTMLCanvasElement): boolean {
  const p = rivalPic(key);
  if (!p) return false;
  const west = !img && !!o.flip && !!p.west;
  blit(env.ctx, p, img ?? (west ? p.west! : p.img), x, y, scale, o, west);
  return true;
}
