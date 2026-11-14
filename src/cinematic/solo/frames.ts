// SPOTLIGHT SOLO: No.10's studio frames by motion-library ID, with fallbacks while the art is in production.
// Shots and the 'gauntlet' field ask for a frame by key ('D3', 'SL6', 'SO4', 'BR2', 'ST3', 'G2'...). The lookup
// tries the library frame itself, then listed studio stand-ins (frames already drawn in Pixel Studio), then the
// hand-drawn art (the Jump strip for side views, the No.10 sprite for front views, its face crop for Glance), so
// nothing crashes and No.10 is NEVER a puppet.
//
// Every key resolves to a `Pic` (image + pixels + anchors) so drawing, the box-filtered field caches and the
// ultraviolet afterimage silhouettes share one code path. All caches are built once per frame (and scale / light).

import type { Env } from '../timeline';
import type { RGB } from '../../engine/math';
import { anim, boxFilter, findAnim, findFrame, hasAnim, type AnimDraw, type StudioAnim } from '../../art/studioAnim';
import { heroJump } from '../../art/heroJump';

type StripView = 'side' | 'front' | 'back' | 'face';
export type SoloView = 'side' | 'front' | 'face';
interface Ref {
  anim: string;
  view: StripView;
  frames: string[];
}
interface Def {
  view: SoloView;
  refs: Ref[];
  /** Jump-strip stand-in for side frames (name, then index). */
  jump?: [string, number];
}

const LOAD: [string, number] = ['load', 0], CROUCH: [string, number] = ['crouch', 1], PUSH: [string, number] = ['push', 2];
const LEAP: [string, number] = ['leap', 4], KNEE: [string, number] = ['knee drive', 5], FLOAT: [string, number] = ['rise float', 6];

const R = (anim: string, view: StripView, ...frames: string[]): Ref => ({ anim, view, frames });
const side = (anim: string, frames: string[], jump: [string, number], ...more: Ref[]): Def => ({ view: 'side', refs: [R(anim, 'side', ...frames), ...more], jump });
const front = (anim: string, frames: string[], ...more: Ref[]): Def => ({ view: 'front', refs: [R(anim, 'front', ...frames), ...more] });
const face = (frames: string[]): Def => ({ view: 'face', refs: [R('Glance', 'face', ...frames)] });

// Studio stand-ins that already exist (Run, Strike, Approach, Stand Front, Land).
const RUN = (k: number) => R('Run', 'side', `R${k}`);
const STRIKE = (...f: string[]) => R('Strike', 'side', ...f);
const STAND_A = R('Stand', 'front', 'a', 'Sa', 'STa');
const STAND_B = R('Stand', 'front', 'b', 'Sb', 'STb');

/** Every No.10 frame SPOTLIGHT SOLO schedules (43 library frames), by key. */
export const SOLO = {
  // Dribble (Side, F1-F8): shots 2, 4, 7, the field carry. Stand-in: the Run cycle, phase for phase.
  D1: side('Dribble', ['F1', 'D1'], PUSH, RUN(1)), D2: side('Dribble', ['F2', 'D2'], LOAD, RUN(2)),
  D3: side('Dribble', ['F3', 'D3'], LOAD, RUN(3)), D4: side('Dribble', ['F4', 'D4'], PUSH, RUN(4)),
  D5: side('Dribble', ['F5', 'D5'], PUSH, RUN(5)), D6: side('Dribble', ['F6', 'D6'], LOAD, RUN(6)),
  D7: side('Dribble', ['F7', 'D7'], LOAD, RUN(7)), D8: side('Dribble', ['F8', 'D8'], PUSH, RUN(8)),
  // SoleLift (Side, drawn for x3): shot 4.
  SL1: side('SoleLift', ['F1', 'SL1'], LOAD, RUN(3)),
  SL2: side('SoleLift', ['F2', 'SL2'], CROUCH, STRIKE('F5a')),
  SL3: side('SoleLift', ['F3', 'SL3'], CROUCH, STRIKE('F5b', 'F5a')),
  SL4: side('SoleLift', ['F4', 'SL4'], CROUCH, STRIKE('F5b', 'F5a')),
  SL5: side('SoleLift', ['F5', 'SL5'], PUSH, STRIKE('F6')),
  SL6: side('SoleLift', ['F6', 'SL6'], PUSH, STRIKE('F7')),
  SL7: side('SoleLift', ['F7', 'SL7'], LEAP, R('Approach', 'side', 'AP2')),
  SL8: side('SoleLift', ['F8', 'SL8'], KNEE, STRIKE('F8')),
  SL8b: side('SoleLift', ['F8b', 'SL8b', 'F8'], FLOAT, STRIKE('F8b', 'F8')),
  SL9: side('SoleLift', ['F9', 'SL9'], FLOAT, STRIKE('F8b', 'F8')),
  SL10: side('SoleLift', ['F10', 'SL10'], CROUCH, STRIKE('F9')),
  SL11: side('SoleLift', ['F11', 'SL11'], LOAD, STRIKE('F10')),
  // Settle (Side): shot 7 and the result view (F3, 0.5x cache).
  ST1: side('Settle', ['F1', 'ST1'], CROUCH, STRIKE('F9')),
  ST2: side('Settle', ['F2', 'ST2'], LOAD, STRIKE('F10')),
  ST3: side('Settle', ['F3', 'ST3'], LOAD, STRIKE('F10')),
  ST3b: side('Settle', ['F3b', 'ST3b', 'F3'], LOAD, STRIKE('F10')),
  // Front views (toward the camera): shots 3, 5, 6. Stand-in: the Stand Front breathing pair.
  FT1: front('FrontTouch', ['FT1', 'F1'], STAND_A),
  SO2: front('StepOver', ['F2', 'SO2'], STAND_A), SO3: front('StepOver', ['F3', 'SO3'], STAND_B),
  SO4: front('StepOver', ['F4', 'SO4'], STAND_A), SO5: front('StepOver', ['F5', 'SO5'], STAND_B),
  SO6: front('StepOver', ['F6', 'SO6'], STAND_A), SO7: front('StepOver', ['F7', 'SO7'], STAND_B),
  EL2: front('Elastico', ['F2', 'EL2'], STAND_A), EL3: front('Elastico', ['F3', 'EL3'], STAND_B),
  EL4: front('Elastico', ['F4', 'EL4'], STAND_B), EL5: front('Elastico', ['F5', 'EL5'], STAND_A),
  NM2: front('Nutmeg', ['F2', 'NM2'], STAND_A), NM3: front('Nutmeg', ['F3', 'NM3'], STAND_B),
  NM4: front('Nutmeg', ['F4', 'NM4'], STAND_A),
  // Break (3/4 front, accelerating to his right / screen-left; flip -> the west strip for the elastico burst).
  BR1: front('Break', ['BR1'], STAND_A), BR2: front('Break', ['BR2'], STAND_B), BR3: front('Break', ['BR3'], STAND_A),
  // Face crops (48x26 on the grid of hero_no10.png at (26, 8)): shot 1 darts, shot 7 bookend.
  G1: face(['G1']),
  G2: face(['G2', 'G4', 'G1']),
  G2L: face(['G2L', 'G1']),
} satisfies Record<string, Def>;

export type SoloKey = keyof typeof SOLO;

/** A resolved drawable: the image, its pixels and anchor lookup, whatever the source. */
export interface Pic {
  id: string;
  img: HTMLCanvasElement;
  /** Pre-mirrored copy with readable numbers (studio west strip), when there is one. */
  west: HTMLCanvasElement | null;
  w: number;
  h: number;
  px: Uint8ClampedArray;
  grounded: boolean;
  /** Frame-space anchor: 'contact' | 'pelvis' | 'com' | 'center' | 'ball' | 'boot' | 'touch' | 'head' | 'eye' | ... */
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

/** Named anchors a stand-in does not carry (the ball a foot ahead of the planted toe, the boot at the toe...). */
function approx(view: SoloView, contact: [number, number], pelvis: [number, number], grounded: boolean, name: string): [number, number] {
  if (view === 'front') {
    if (name === 'ball') return [pelvis[0] - 5, contact[1] + 3];
    if (name === 'boot' || name === 'touch') return [pelvis[0] - 6, contact[1] - 2];
    if (name === 'head' || name === 'eye') return [pelvis[0], pelvis[1] - 44];
    return pelvis;
  }
  const foot: [number, number] = grounded ? contact : [pelvis[0] + 6, pelvis[1] + 34];
  if (name === 'ball') return [foot[0] + 12, foot[1] - 6];
  if (name === 'boot' || name === 'laces' || name === 'touch') return [foot[0] + 4, foot[1] - 5];
  if (name === 'head' || name === 'eye') return [pelvis[0] + 4, pelvis[1] - 46];
  return pelvis;
}

function fallbackPic(env: Env, key: SoloKey, d: Def): Pic {
  const id = `fb:${key}`;
  const hit = picCache.get(id);
  if (hit) return hit;
  let pic: Pic;
  const hero = env.art.hero;
  if (d.view === 'side') {
    const jm = heroJump();
    let i = jm.frames.findIndex((f) => f.name === d.jump![0]);
    if (i < 0) i = Math.min(d.jump![1], jm.frames.length - 1);
    const f = jm.frames[i];
    pic = {
      id: `jump:${i}`,
      img: f.img,
      west: null,
      w: jm.w,
      h: jm.h,
      px: f.px,
      grounded: !!f.contact,
      source: 'fallback',
      anchor(name) {
        if (name === 'center') return [jm.w / 2, jm.h / 2];
        if (name === 'com') return f.com;
        if (!name) return jm.anchorOf(i);
        if (name === 'contact' && f.contact) return jm.anchorOf(i, 'contact');
        if (name === 'pelvis' || name === 'contact') return jm.anchorOf(i, 'pelvis');
        return approx('side', f.contact ? jm.anchorOf(i, 'contact') : jm.anchorOf(i, 'pelvis'), jm.anchorOf(i, 'pelvis'), !!f.contact, name);
      },
    };
  } else if (d.view === 'front') {
    const px = pixelsOf(hero.img);
    pic = {
      id: 'sprite',
      img: hero.img,
      west: null,
      w: hero.w,
      h: hero.h,
      px,
      grounded: true,
      source: 'fallback',
      anchor(name) {
        if (name === 'center' || name === 'com') return [hero.w / 2, hero.h / 2];
        if (!name || name === 'contact') return [hero.footX, hero.footY];
        if (name === 'pelvis') return [hero.footX, hero.footY - 40];
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
      id: 'face',
      img: cv,
      west: null,
      w: r.w,
      h: r.h,
      px: pixelsOf(cv),
      grounded: false,
      source: 'fallback',
      anchor(name) {
        if (name === 'eye' || name === 'eyeR') return [hero.eyes[1][0] - r.x + 0.5, hero.eyes[1][1] - r.y + 0.5];
        if (name === 'eyeL') return [hero.eyes[0][0] - r.x + 0.5, hero.eyes[0][1] - r.y + 0.5];
        return [r.w / 2, r.h / 2];
      },
    };
  }
  picCache.set(id, pic);
  return pic;
}

/** Resolve a key to the best available picture (library frame > studio stand-in > hand-drawn). Never null. */
export function soloPic(env: Env, key: SoloKey): Pic {
  const d: Def = SOLO[key];
  for (let r = 0; r < d.refs.length; r++) {
    const ref = d.refs[r];
    const a = strip(ref.anim, ref.view);
    if (!a) continue;
    const i = findFrame(a, ...ref.frames);
    if (i < 0) continue;
    // The same studio frame can be the library frame for one key and a stand-in for another: cache both roles.
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

/** The view of a key ('side' | 'front' | 'face'). */
export const soloView = (key: SoloKey): SoloView => (SOLO[key] as Def).view;

/** Frame-space anchor of `key` ('contact' | 'pelvis' | 'com' | 'center' | 'ball' | 'boot' | 'touch' | 'eye'...). */
export function soloAnchor(env: Env, key: SoloKey, name?: string): [number, number] {
  return soloPic(env, key).anchor(name);
}

/** World position of anchor `name` when `key` is drawn by drawSolo(env, key, x, y, scale, o) (same arguments). */
export function soloPoint(env: Env, key: SoloKey, name: string, x: number, y: number, scale: number, o: AnimDraw = {}): [number, number] {
  const p = soloPic(env, key);
  const [ax, ay] = o.pivot ?? p.anchor(o.anchor);
  const [px, py] = p.anchor(name);
  let dx = (px - ax) * scale, dy = (py - ay) * scale;
  if (o.flip) dx = -dx;
  if (o.rot) {
    const c = Math.cos(o.rot), s = Math.sin(o.rot);
    [dx, dy] = [dx * c - dy * s, dx * s + dy * c];
  }
  return [x + dx, y + dy];
}

function blit(ctx: CanvasRenderingContext2D, p: Pic, img: HTMLCanvasElement, x: number, y: number, scale: number, o: AnimDraw, mirrored: boolean) {
  let [ax, ay] = o.pivot ?? p.anchor(o.anchor);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = o.alpha ?? 1;
  ctx.translate(x, y);
  if (o.rot) ctx.rotate(o.rot);
  if (o.flip && mirrored) {
    // A pre-mirrored image: mirror the pivot instead of the drawing.
    ax = p.w - ax;
    ctx.scale(scale, scale);
  } else ctx.scale(o.flip ? -scale : scale, scale);
  ctx.drawImage(img, -ax, -ay);
  ctx.restore();
}

/**
 * Mirroring: `flip` uses the studio west strip when there is one (the shirt "10" stays readable). A FRONT frame without
 * a west strip (a stand-in) is never mirrored, so the chest never reads "01"; side frames and exposures may mirror.
 *
 * Draw No.10's frame `key` so its anchor (o.anchor; default contact on the ground / pelvis in the air / centre of
 * a face crop) or o.pivot lands on (x, y) at an integer `scale` (nearest-neighbour). `flip` uses the studio west
 * strip when there is one (numbers stay readable). `img` replaces the picture with a same-size derived image.
 * Returns where the picture came from ('studio' | 'standin' | 'fallback').
 */
export function drawSolo(env: Env, key: SoloKey, x: number, y: number, scale: number, o: AnimDraw = {}, img?: HTMLCanvasElement): Pic['source'] {
  const p = soloPic(env, key);
  let o2 = soloView(key) === 'face' && !o.anchor && !o.pivot ? { ...o, anchor: 'center' } : o;
  if (!img && o.flip && !p.west && soloView(key) === 'front') o2 = { ...o2, flip: false }; // never "01": no west strip, no mirror
  const west = !img && !!o.flip && !!p.west;
  blit(env.ctx, p, img ?? (west ? p.west! : p.img), x, y, scale, o2, west);
  return p.source;
}

const boxCache = new Map<string, HTMLCanvasElement>();
/**
 * Field-scale No.10 (0.4x field, 0.5x result): the box-filtered cache of `key`, anchor on (x, y), 1 world px per
 * cache px. Built on first use; warm it in prepare() with warmSolo.
 */
export function drawSoloBoxed(env: Env, key: SoloKey, x: number, y: number, scale: number, o: AnimDraw = {}) {
  const p = soloPic(env, key);
  if (o.flip && !p.west && soloView(key) === 'front') o = { ...o, flip: false }; // never "01": no west strip, no mirror
  const west = !!o.flip && !!p.west;
  const k = `${p.id}|${scale}|${west ? 'w' : 'e'}`;
  let cv = boxCache.get(k);
  if (!cv) boxCache.set(k, (cv = boxFilter(west ? pixelsOf(p.west!) : p.px, p.w, p.h, scale)));
  let [ax, ay] = o.pivot ?? p.anchor(o.anchor);
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

// ---------------------------------------------------------------- afterimages (ultraviolet exposures)

/** Exposure colours: ultraviolet body, 1 px lilac rim on the side facing the beam. */
export const GHOST_FILL: RGB = [122, 77, 255];
export const GHOST_RIM: RGB = [201, 182, 255];

export interface GhostOpts extends AnimDraw {
  /** Direction toward the light in screen space (default top-right (1, -1) for side views, top (0, -1) otherwise). */
  lx?: number;
  ly?: number;
  /** Solid fill override (the shot 5 ghost wipe's final solid silhouette). */
  fill?: RGB;
  rim?: RGB;
}

const ghostCache = new Map<string, HTMLCanvasElement>();
/**
 * The ultraviolet silhouette of a picture: every opaque pixel `fill`, a 1 px `rim` on the edge facing (lx, ly)
 * (image space). Built once per picture and light, then reused (never allocated per frame).
 */
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

/** Draw the ultraviolet exposure of `key` (same placement rules as drawSolo; alpha from o.alpha). */
export function drawSoloGhost(env: Env, key: SoloKey, x: number, y: number, scale: number, o: GhostOpts = {}) {
  const p = soloPic(env, key);
  const view = soloView(key);
  let lx = o.lx ?? (view === 'side' ? 1 : 0), ly = o.ly ?? -1;
  if (o.flip) lx = -lx; // the image is mirrored when drawn: light it from the mirrored side in image space
  const sil = uvSilhouette(p, lx, ly, o.fill, o.rim);
  const o2 = view === 'face' && !o.anchor && !o.pivot ? { ...o, anchor: 'center' } : o;
  blit(env.ctx, p, sil, x, y, scale, o2, false);
}

/** Warm the caches a shot or the field will use (call from prepare()): pictures, boxed copies, ghosts. */
export function warmSolo(env: Env, keys: readonly SoloKey[], o: { boxed?: number[]; ghosts?: boolean } = {}) {
  const ctx = env.ctx;
  ctx.save();
  ctx.globalAlpha = 0;
  for (const k of keys) {
    const p = soloPic(env, k);
    for (const s of o.boxed ?? []) drawSoloBoxed(env, k, -9999, -9999, s);
    if (o.ghosts) uvSilhouette(p, soloView(k) === 'side' ? 1 : 0, -1);
  }
  ctx.restore();
}
