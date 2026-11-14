// No.10's hand-drawn side-view JUMP: 10 frames of 128x128 (facing east), used by the
// ZENITH METEOR take-off, ascent and somersault in place of the skeletal puppet.
//
// Loaded once at boot (like heroSprite) and kept in a module singleton, so shots read it
// with heroJump() without widening the Env art type.
//
// Every frame has an anchor:
//  - ground frames F1-F4 sit on their planted toe ('contact'): the bottom edge of the
//    contact pixel lands on the ground point, so the foot never slides;
//  - airborne frames F5-F10 sit on the pelvis ('pelvis'): a shot moves that point along
//    its own trajectory. A somersault spins the body around its centre of mass (`com`,
//    passed as `pivot`), not the pelvis, so the tuck turns in place instead of orbiting the hip.
// Derived versions (solid tint for glows, rim-lit silhouette for back-lit shots) are
// built on demand from the frame pixels and cached.

import stripUrl from './hero_jump_side.png';
import meta from './hero_jump.json';
import type { RGB } from '../engine/math';

/** Frame indices (0-based) by name. */
export const JF = { load: 0, crouch: 1, push: 2, takeoff: 3, leap: 4, knee: 5, float: 6, pretuck: 7, tuck: 8, roll: 9 } as const;

export interface JumpFrame {
  name: string;
  /** Suggested hold. */
  ms: number;
  /** Pelvis pixel. */
  pelvis: [number, number];
  /** Planted toe pixel on the ground row, or null when airborne. */
  contact: [number, number] | null;
  /** Centre of mass of the opaque pixels, in frame coordinates (pixel centres, like the pelvis anchor). */
  com: [number, number];
  img: HTMLCanvasElement;
  /** RGBA pixels of the frame. */
  px: Uint8ClampedArray;
}

export interface Silhouette {
  fill: RGB;
  rim: RGB;
  rim2: RGB;
  /** Light direction in WORLD space (same convention as PixelBuffer.silhouette). */
  lx: number;
  ly: number;
  /** 0 = flat fill; otherwise this fraction of the original colours shows through the fill (back-lit but readable). */
  detail?: number;
}

export interface JumpDraw {
  /** Which point of the frame lands on (x, y). Default: contact for ground frames, pelvis otherwise. */
  anchor?: 'pelvis' | 'contact';
  /** Frame-space point (e.g. a lerp of the pelvis anchor and `com`) that lands on (x, y) and that rotation and
   *  mirror pivot on; overrides `anchor`. */
  pivot?: [number, number];
  /** Rotation in radians around the anchor (clockwise on screen). */
  rot?: number;
  /** Mirror to face west. */
  flip?: boolean;
  alpha?: number;
}

export interface HeroJump {
  w: number;
  h: number;
  frames: JumpFrame[];
  /** Solid-colour copy of frame i (glow / aura passes). */
  tinted(i: number, c: RGB): HTMLCanvasElement;
  /** Dark rim-lit silhouette of frame i, for a frame drawn with this rot/flip (the rim stays on the world-space light side). */
  silhouette(i: number, s: Silhouette, rot?: number, flip?: boolean): HTMLCanvasElement;
  /** Anchor point of frame i in frame pixels (pixel centre for the pelvis, sole edge for the contact). */
  anchorOf(i: number, a?: 'pelvis' | 'contact'): [number, number];
  /** Pelvis position relative to the contact anchor, in frame pixels (ground frames). */
  pelvisFromContact(i: number): [number, number];
}

let J: HeroJump | null = null;

/** The loaded jump frames (call after loadHeroJump has resolved at boot). */
export function heroJump(): HeroJump {
  if (!J) throw new Error('hero jump sprite not loaded');
  return J;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = src;
  });
}

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

/** Small insertion-ordered cache that drops its oldest entries. */
class Lru<V> {
  private m = new Map<string, V>();
  constructor(private max: number) {}
  get(k: string, make: () => V): V {
    let v = this.m.get(k);
    if (v !== undefined) {
      this.m.delete(k);
      this.m.set(k, v);
      return v;
    }
    v = make();
    this.m.set(k, v);
    if (this.m.size > this.max) this.m.delete(this.m.keys().next().value as string);
    return v;
  }
}

export async function loadHeroJump(): Promise<HeroJump> {
  if (J) return J;
  const im = await loadImage(stripUrl);
  const fw = meta.frameW, fh = meta.frameH;
  const frames: JumpFrame[] = meta.frames.map((f, i) => {
    const img = canvas(fw, fh);
    const g = img.getContext('2d', { willReadFrequently: true })!;
    g.drawImage(im, i * fw, 0, fw, fh, 0, 0, fw, fh);
    const px = g.getImageData(0, 0, fw, fh).data;
    return {
      name: f.name,
      ms: f.ms,
      pelvis: [f.pelvis[0], f.pelvis[1]],
      contact: f.contact ? [f.contact[0], f.contact[1]] : null,
      com: centroid(px, fw, fh, f.pelvis),
      img,
      px,
    };
  });

  const tints = new Lru<HTMLCanvasElement>(48);
  const sils = new Lru<HTMLCanvasElement>(96);

  const anchorOf = (i: number, a?: 'pelvis' | 'contact'): [number, number] => {
    const f = frames[i];
    const use = a ?? (f.contact ? 'contact' : 'pelvis');
    if (use === 'contact' && f.contact) return [f.contact[0] + 0.5, f.contact[1] + 1];
    return [f.pelvis[0] + 0.5, f.pelvis[1] + 0.5];
  };

  J = {
    w: fw,
    h: fh,
    frames,
    anchorOf,
    pelvisFromContact(i) {
      const p = anchorOf(i, 'pelvis'), c = anchorOf(i, 'contact');
      return [p[0] - c[0], p[1] - c[1]];
    },
    tinted(i, c) {
      return tints.get(`${i}|${c.join(',')}`, () => {
        const cv = canvas(fw, fh);
        const g = cv.getContext('2d')!;
        g.drawImage(frames[i].img, 0, 0);
        g.globalCompositeOperation = 'source-in';
        g.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
        g.fillRect(0, 0, fw, fh);
        return cv;
      });
    },
    silhouette(i, s, rot = 0, flip = false) {
      // Bring the world-space light into frame space: undo the rotation, then the mirror.
      const cs = Math.cos(-rot), sn = Math.sin(-rot);
      let lx = s.lx * cs - s.ly * sn;
      const ly = s.lx * sn + s.ly * cs;
      if (flip) lx = -lx;
      const sx = Math.round(lx), sy = Math.round(ly);
      const sx2 = Math.round(lx * 2), sy2 = Math.round(ly * 2);
      const key = `${i}|${s.fill.join(',')}|${s.rim.join(',')}|${s.rim2.join(',')}|${s.detail ?? 0}|${sx},${sy},${sx2},${sy2}`;
      return sils.get(key, () => {
        const cv = canvas(fw, fh);
        silhouettePixels(frames[i].px, fw, fh, cv, s, sx, sy, sx2, sy2);
        return cv;
      });
    },
  };
  return J;
}

/** Alpha-weighted centre of the frame's pixels (pixel centres); falls back to the pelvis anchor on an empty frame. */
function centroid(px: Uint8ClampedArray, w: number, h: number, pelvis: number[]): [number, number] {
  let sx = 0, sy = 0, sa = 0;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const a = px[(y * w + x) * 4 + 3];
      if (!a) continue;
      sx += (x + 0.5) * a;
      sy += (y + 0.5) * a;
      sa += a;
    }
  return sa ? [sx / sa, sy / sa] : [pelvis[0] + 0.5, pelvis[1] + 0.5];
}

function silhouettePixels(src: Uint8ClampedArray, w: number, h: number, cv: HTMLCanvasElement, s: Silhouette, sx: number, sy: number, sx2: number, sy2: number) {
  const g = cv.getContext('2d')!;
  const out = g.createImageData(w, h);
  const d = out.data;
  const det = s.detail ?? 0;
  const op = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && src[(y * w + x) * 4 + 3] !== 0;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const k = (y * w + x) * 4;
      if (!src[k + 3]) continue;
      // Same rule as PixelBuffer.silhouette: the edge facing the light is the rim.
      if (!op(x + sx, y + sy) || !op(x + sx, y) || !op(x, y + sy)) {
        d[k] = s.rim[0], d[k + 1] = s.rim[1], d[k + 2] = s.rim[2];
      } else if (!op(x + sx2, y + sy2)) {
        d[k] = s.rim2[0], d[k + 1] = s.rim2[1], d[k + 2] = s.rim2[2];
      } else {
        d[k] = s.fill[0] + (src[k] - s.fill[0]) * det;
        d[k + 1] = s.fill[1] + (src[k + 1] - s.fill[1]) * det;
        d[k + 2] = s.fill[2] + (src[k + 2] - s.fill[2]) * det;
      }
      d[k + 3] = 255;
    }
  g.putImageData(out, 0, 0);
}

/**
 * Draw frame i (or a derived image of it: tinted / silhouette) so its anchor (or `pivot`) lands on world
 * (x, y) at `scale` world px per sprite px. Nearest-neighbour; rotation and mirror pivot on that point.
 */
export function drawJump(ctx: CanvasRenderingContext2D, img: HTMLCanvasElement | null, i: number, x: number, y: number, scale: number, o: JumpDraw = {}) {
  const jm = heroJump();
  const [ax, ay] = o.pivot ?? jm.anchorOf(i, o.anchor);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = o.alpha ?? 1;
  ctx.translate(x, y);
  if (o.rot) ctx.rotate(o.rot);
  ctx.scale(o.flip ? -scale : scale, scale);
  ctx.drawImage(img ?? jm.frames[i].img, -ax, -ay);
  ctx.restore();
}

/** Pick a frame from a timeline of [startTime, frame] keys (sorted by time). */
export function jumpFrameAt(seq: readonly (readonly [number, number])[], t: number): number {
  let f = seq[0][1];
  for (const [at, i] of seq) if (t >= at) f = i;
  return f;
}
