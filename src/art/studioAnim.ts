// Studio animation library: every hand-drawn Pixel Studio animation of a character (No.10, No.7,
// rivals...) exported as a horizontal strip + anchor JSON in src/art/anim/, discovered at build
// time and loaded once at boot. Adding an animation = dropping `<name>.png` + `<name>.json`
// (and optionally `<name>_west.png`) into src/art/anim/; no code changes.
//
// JSON schema (same as hero_jump.json, extended):
//   { frameW, frameH, facing: "east" | "west", frames: [{ name, ms, pelvis: [x,y],
//     contact: [x,y] | null, anchors?: { ball?: [x,y], boot?: [x,y], head?: [x,y], ... } }] }
// `<name>_west.png` is the same strip pre-mirrored with the shirt numbers fixed so they still read
// correctly ("10", not "01"); drawing with `flip: true` uses it automatically when present.
//
// Anchors: ground frames sit on their planted toe ('contact'), airborne frames on the pelvis;
// any named anchor can be used, or an explicit `pivot` (e.g. the centre of mass for spins).

import type { RGB } from '../engine/math';

const JSONS = import.meta.glob('./anim/*.json', { eager: true, import: 'default' }) as Record<string, StudioMeta>;
const PNGS = import.meta.glob('./anim/*.png', { eager: true, import: 'default', query: '?url' }) as Record<string, string>;

export interface StudioMeta {
  frameW: number;
  frameH: number;
  facing?: 'east' | 'west';
  frames: { name: string; ms: number; pelvis: number[]; contact: number[] | null; anchors?: Record<string, number[]> }[];
}

export interface StudioFrame {
  name: string;
  ms: number;
  pelvis: [number, number];
  contact: [number, number] | null;
  anchors: Record<string, [number, number]>;
  /** Alpha-weighted centre of the opaque pixels (pixel centres). */
  com: [number, number];
  img: HTMLCanvasElement;
  /** Pre-mirrored copy with correct numbers, when a west strip exists. */
  west: HTMLCanvasElement | null;
  px: Uint8ClampedArray;
}

export interface Silhouette {
  fill: RGB;
  rim: RGB;
  rim2: RGB;
  /** Light direction in WORLD space (same convention as PixelBuffer.silhouette). */
  lx: number;
  ly: number;
  /** 0 = flat fill; otherwise this fraction of the original colours shows through. */
  detail?: number;
}

export interface AnimDraw {
  /** Which point lands on (x, y): 'contact' | 'pelvis' | 'com' | any named anchor. Default: contact if grounded, else pelvis. */
  anchor?: string;
  /** Frame-space point that lands on (x, y); rotation and mirror pivot on it. Overrides `anchor`. */
  pivot?: [number, number];
  /** Rotation in radians (clockwise on screen). */
  rot?: number;
  /** Face the other way (uses the west strip if present, so numbers stay readable). */
  flip?: boolean;
  alpha?: number;
}

export interface StudioAnim {
  name: string;
  w: number;
  h: number;
  frames: StudioFrame[];
  /** Frame index by frame name (first match). */
  index(frameName: string): number;
  anchorOf(i: number, a?: string): [number, number];
  /** Solid-colour copy of frame i (glow / aura passes; drawn mirrored with `flip`, numbers don't show in a tint). */
  tinted(i: number, c: RGB): HTMLCanvasElement;
  /** Dark rim-lit silhouette of frame i drawn with this rot/flip (rim stays on the world-space light side). */
  silhouette(i: number, s: Silhouette, rot?: number, flip?: boolean): HTMLCanvasElement;
}

const LIB = new Map<string, StudioAnim>();
let loaded = false;

/** A loaded studio animation by name (file stem in src/art/anim/). Throws if missing. */
export function anim(name: string): StudioAnim {
  const a = LIB.get(name);
  if (!a) throw new Error(`studio animation "${name}" not loaded (have: ${[...LIB.keys()].join(', ') || 'none'})`);
  return a;
}

/** True if the animation exists (lets shots fall back while art is still in production). */
export function hasAnim(name: string): boolean {
  return LIB.has(name);
}

const stem = (path: string) => path.slice(path.lastIndexOf('/') + 1).replace(/\.(json|png)$/, '');

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

/** Load every strip in src/art/anim/ (call once at boot). */
export async function loadStudioAnims(): Promise<void> {
  if (loaded) return;
  loaded = true;
  const pngByStem = new Map(Object.entries(PNGS).map(([p, url]) => [stem(p), url]));
  await Promise.all(
    Object.entries(JSONS).map(async ([path, meta]) => {
      const name = stem(path);
      const url = pngByStem.get(name);
      if (!url) throw new Error(`studio animation "${name}": missing ${name}.png`);
      const westUrl = pngByStem.get(name + '_west');
      const [im, westIm] = await Promise.all([loadImage(url), westUrl ? loadImage(westUrl) : Promise.resolve(null)]);
      LIB.set(name, build(name, meta, im, westIm));
    }),
  );
}

function build(name: string, meta: StudioMeta, im: HTMLImageElement, westIm: HTMLImageElement | null): StudioAnim {
  const fw = meta.frameW, fh = meta.frameH;
  const n = meta.frames.length;
  const frames: StudioFrame[] = meta.frames.map((f, i) => {
    const img = canvas(fw, fh);
    const g = img.getContext('2d', { willReadFrequently: true })!;
    g.drawImage(im, i * fw, 0, fw, fh, 0, 0, fw, fh);
    const px = g.getImageData(0, 0, fw, fh).data;
    let west: HTMLCanvasElement | null = null;
    if (westIm) {
      // The west strip is the whole strip mirrored, so frame i sits at slot n-1-i.
      west = canvas(fw, fh);
      west.getContext('2d')!.drawImage(westIm, (n - 1 - i) * fw, 0, fw, fh, 0, 0, fw, fh);
    }
    const anchors: Record<string, [number, number]> = {};
    for (const [k, v] of Object.entries(f.anchors ?? {})) anchors[k] = [v[0], v[1]];
    return {
      name: f.name,
      ms: f.ms,
      pelvis: [f.pelvis[0], f.pelvis[1]],
      contact: f.contact ? [f.contact[0], f.contact[1]] : null,
      anchors,
      com: centroid(px, fw, fh, f.pelvis),
      img,
      west,
      px,
    };
  });
  const tints = new Lru<HTMLCanvasElement>(64);
  const sils = new Lru<HTMLCanvasElement>(128);
  const anchorOf = (i: number, a?: string): [number, number] => {
    const f = frames[i];
    const use = a ?? (f.contact ? 'contact' : 'pelvis');
    if (use === 'contact' && f.contact) return [f.contact[0] + 0.5, f.contact[1] + 1];
    if (use === 'com') return f.com;
    if (use !== 'pelvis' && f.anchors[use]) return [f.anchors[use][0] + 0.5, f.anchors[use][1] + 0.5];
    return [f.pelvis[0] + 0.5, f.pelvis[1] + 0.5];
  };
  return {
    name,
    w: fw,
    h: fh,
    frames,
    anchorOf,
    index(frameName) {
      const i = frames.findIndex((f) => f.name === frameName);
      if (i < 0) throw new Error(`studio animation "${name}" has no frame "${frameName}"`);
      return i;
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
}

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
 * Draw frame i of `a` (or a derived image: tinted / silhouette) so its anchor (or `pivot`) lands on world
 * (x, y) at `scale` world px per sprite px. Nearest-neighbour. With `flip` and a west strip, the west frame is
 * drawn (pivot mirrored) so shirt numbers read correctly; without one, the east frame is mirrored.
 */
export function drawAnim(ctx: CanvasRenderingContext2D, a: StudioAnim, img: HTMLCanvasElement | null, i: number, x: number, y: number, scale: number, o: AnimDraw = {}) {
  const f = a.frames[i];
  let [ax, ay] = o.pivot ?? a.anchorOf(i, o.anchor);
  const useWest = !!o.flip && !!f.west && !img;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = o.alpha ?? 1;
  ctx.translate(x, y);
  if (o.rot) ctx.rotate(o.rot);
  if (useWest) {
    ax = a.w - ax;
    ctx.scale(scale, scale);
    ctx.drawImage(f.west!, -ax, -ay);
  } else {
    ctx.scale(o.flip ? -scale : scale, scale);
    ctx.drawImage(img ?? f.img, -ax, -ay);
  }
  ctx.restore();
}

/** Pick a frame from a timeline of [startTime, frame] keys (sorted by time). */
export function frameAt(seq: readonly (readonly [number, number])[], t: number): number {
  let f = seq[0][1];
  for (const [at, i] of seq) if (t >= at) f = i;
  return f;
}
