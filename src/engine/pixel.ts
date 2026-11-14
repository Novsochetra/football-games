// Software pixel rasterizer. Characters are built from capsules/circles/polygons,
// cel-shaded and outlined at a fixed pixel grid, so any pose renders as crisp pixel art.

import { clamp, type RGB } from './math';

export const pack = (r: number, g: number, b: number, a = 255) =>
  ((a & 255) << 24) | ((b & 255) << 16) | ((g & 255) << 8) | (r & 255);
export const packRGB = (c: RGB, a = 255) => pack(c[0] | 0, c[1] | 0, c[2] | 0, a);
export const unpack = (v: number): RGB => [v & 255, (v >>> 8) & 255, (v >>> 16) & 255];
export const alphaOf = (v: number) => (v >>> 24) & 255;

/** hi / mid / shadow */
export type Pal3 = [number, number, number];
export const pal3 = (hi: RGB, mid: RGB, lo: RGB): Pal3 => [packRGB(hi), packRGB(mid), packRGB(lo)];

export const OUTLINE = pack(24, 4, 17);

export class PixelBuffer {
  w: number;
  h: number;
  data: Uint32Array;
  canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private img: ImageData;
  /** Reused copy of `data` for outline/silhouette, so a render does not allocate a new buffer each time. */
  private scratch?: Uint32Array;
  /** Direction toward the light (unit-ish), screen space. */
  lx = -0.55;
  ly = -0.83;

  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.canvas = document.createElement('canvas');
    this.canvas.width = w;
    this.canvas.height = h;
    this.ctx = this.canvas.getContext('2d')!;
    this.img = this.ctx.createImageData(w, h);
    this.data = new Uint32Array(this.img.data.buffer);
  }

  clear() {
    this.data.fill(0);
  }

  set(x: number, y: number, c: number) {
    x |= 0;
    y |= 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.data[y * this.w + x] = c;
  }

  get(x: number, y: number) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0;
    return this.data[y * this.w + x];
  }

  private shadePick(p: Pal3, d: number) {
    return d > 0.42 ? p[0] : d < -0.3 ? p[2] : p[1];
  }

  /** Filled capsule (segment a-b, radius r) with cel shading. pal may be a flat color. */
  capsule(ax: number, ay: number, bx: number, by: number, r: number, pal: Pal3 | number) {
    const x0 = Math.max(0, Math.floor(Math.min(ax, bx) - r - 1));
    const x1 = Math.min(this.w - 1, Math.ceil(Math.max(ax, bx) + r + 1));
    const y0 = Math.max(0, Math.floor(Math.min(ay, by) - r - 1));
    const y1 = Math.min(this.h - 1, Math.ceil(Math.max(ay, by) + r + 1));
    const dx = bx - ax, dy = by - ay;
    const L2 = dx * dx + dy * dy || 1e-6;
    const r2 = r * r;
    const flat = typeof pal === 'number';
    for (let y = y0; y <= y1; y++) {
      const py = y + 0.5;
      for (let x = x0; x <= x1; x++) {
        const px = x + 0.5;
        let t = ((px - ax) * dx + (py - ay) * dy) / L2;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const nx = px - (ax + dx * t), ny = py - (ay + dy * t);
        const d2 = nx * nx + ny * ny;
        if (d2 <= r2) {
          let c: number;
          if (flat) c = pal as number;
          else {
            const d = (nx * this.lx + ny * this.ly) / (r || 1);
            c = this.shadePick(pal as Pal3, d);
          }
          this.data[y * this.w + x] = c;
        }
      }
    }
  }

  circle(cx: number, cy: number, r: number, pal: Pal3 | number) {
    this.capsule(cx, cy, cx, cy, r, pal);
  }

  /** Scanline polygon fill. pts = [x0,y0,x1,y1,...]. shade(x,y) may return a color. */
  poly(pts: number[], color: number | ((x: number, y: number) => number)) {
    const n = pts.length / 2;
    let minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < n; i++) {
      minY = Math.min(minY, pts[i * 2 + 1]);
      maxY = Math.max(maxY, pts[i * 2 + 1]);
    }
    const y0 = Math.max(0, Math.floor(minY)), y1 = Math.min(this.h - 1, Math.ceil(maxY));
    const xs: number[] = [];
    for (let y = y0; y <= y1; y++) {
      const py = y + 0.5;
      xs.length = 0;
      for (let i = 0; i < n; i++) {
        const ax = pts[i * 2], ay = pts[i * 2 + 1];
        const j = (i + 1) % n;
        const bx = pts[j * 2], by = pts[j * 2 + 1];
        if ((ay <= py && by > py) || (by <= py && ay > py)) xs.push(ax + ((py - ay) / (by - ay)) * (bx - ax));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        const xa = Math.max(0, Math.round(xs[k])), xb = Math.min(this.w - 1, Math.round(xs[k + 1]) - 1);
        for (let x = xa; x <= xb; x++) {
          this.data[y * this.w + x] = typeof color === 'number' ? color : color(x, y);
        }
      }
    }
  }

  /** 1px outline around every opaque region (transparent pixels touching opaque ones). */
  outline(color = OUTLINE) {
    const { w, h, data } = this;
    const src = (this.scratch ??= new Uint32Array(data.length));
    src.set(data);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (src[i] >>> 24) continue;
        if (
          (x > 0 && src[i - 1] >>> 24) ||
          (x < w - 1 && src[i + 1] >>> 24) ||
          (y > 0 && src[i - w] >>> 24) ||
          (y < h - 1 && src[i + w] >>> 24)
        )
          data[i] = color;
      }
    }
  }

  /** Turn the figure into a dark silhouette with a rim light on the side facing (lx,ly). */
  silhouette(fill: number, rim: number, rim2: number, lx: number, ly: number) {
    const { w, h, data } = this;
    const src = (this.scratch ??= new Uint32Array(data.length));
    src.set(data);
    const sx = Math.round(lx), sy = Math.round(ly);
    const sx2 = Math.round(lx * 2), sy2 = Math.round(ly * 2);
    const op = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && src[y * w + x] >>> 24 !== 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (!(src[i] >>> 24)) continue;
        if (!op(x + sx, y + sy) || !op(x + sx, y) || !op(x, y + sy)) data[i] = rim;
        else if (!op(x + sx2, y + sy2)) data[i] = rim2;
        else data[i] = fill;
      }
    }
  }

  /** Multiply-free tint toward a color (for hit flashes / heat). */
  tint(c: RGB, amt: number) {
    const { data } = this;
    const a = clamp(amt);
    for (let i = 0; i < data.length; i++) {
      const v = data[i];
      if (!(v >>> 24)) continue;
      const r = v & 255, g = (v >>> 8) & 255, b = (v >>> 16) & 255;
      data[i] = pack(r + (c[0] - r) * a, g + (c[1] - g) * a, b + (c[2] - b) * a, v >>> 24);
    }
  }

  flush(): HTMLCanvasElement {
    this.ctx.putImageData(this.img, 0, 0);
    return this.canvas;
  }
}

// ---------------------------------------------------------------- Ball

const PHI = (1 + Math.sqrt(5)) / 2;
const ICO: number[][] = [];
for (const [a, b] of [[1, PHI], [-1, PHI], [1, -PHI], [-1, -PHI]]) {
  ICO.push([0, a, b], [a, b, 0], [b, 0, a]);
}
for (const v of ICO) {
  const l = Math.hypot(v[0], v[1], v[2]);
  v[0] /= l;
  v[1] /= l;
  v[2] /= l;
}

/** 3x3 rotation matrix (row-major) that tracks a spinning ball. */
export class BallSpin {
  m = new Float64Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  /** Rotate by angle around axis (screen space). */
  rotate(ax: number, ay: number, az: number, ang: number) {
    const l = Math.hypot(ax, ay, az) || 1;
    ax /= l;
    ay /= l;
    az /= l;
    const c = Math.cos(ang), s = Math.sin(ang), t = 1 - c;
    const r = [
      t * ax * ax + c, t * ax * ay - s * az, t * ax * az + s * ay,
      t * ax * ay + s * az, t * ay * ay + c, t * ay * az - s * ax,
      t * ax * az - s * ay, t * ay * az + s * ax, t * az * az + c,
    ];
    const m = this.m;
    const o = new Float64Array(9);
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) o[i * 3 + j] = r[i * 3] * m[j] + r[i * 3 + 1] * m[3 + j] + r[i * 3 + 2] * m[6 + j];
    this.m = o;
  }
}

const ballBufs = new Map<number, PixelBuffer>();

/** 'fire' = white-hot/orange (ZENITH METEOR); 'crimson' = silver core with crimson seams (CRIMSON CRESCENT). */
export type BallPalette = 'fire' | 'crimson';

/**
 * Rasterize a soccer ball of pixel radius `r` into a cached buffer canvas.
 * heat 0..1 blends it into a white-hot core with glowing seams.
 */
export function renderBall(r: number, spin: BallSpin, heat = 0, outline = true, palette: BallPalette = 'fire'): HTMLCanvasElement {
  r = Math.max(2, Math.round(r));
  const size = r * 2 + 4;
  let buf = ballBufs.get(size);
  if (!buf) ballBufs.set(size, (buf = new PixelBuffer(size, size)));
  buf.clear();
  const m = spin.m;
  const c0 = size / 2;
  const L = [-0.5, -0.62, 0.6];
  const ll = Math.hypot(L[0], L[1], L[2]);
  const h = clamp(heat);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x + 0.5 - c0) / r, ny = (y + 0.5 - c0) / r;
      const d2 = nx * nx + ny * ny;
      if (d2 > 1) continue;
      const nz = Math.sqrt(1 - d2);
      // ball-local normal = M^T * n
      const lx = m[0] * nx + m[3] * ny + m[6] * nz;
      const ly = m[1] * nx + m[4] * ny + m[7] * nz;
      const lz = m[2] * nx + m[5] * ny + m[8] * nz;
      let best = -1;
      for (const v of ICO) {
        const d = v[0] * lx + v[1] * ly + v[2] * lz;
        if (d > best) best = d;
      }
      const lam = (nx * L[0] + ny * L[1] + nz * L[2]) / ll;
      const patch = best > 0.925;
      let col: RGB;
      if (patch) col = lam > 0.45 ? [74, 66, 104] : [30, 24, 44];
      else col = lam > 0.55 ? [255, 255, 255] : lam > 0.05 ? [222, 218, 234] : [146, 138, 178];
      if (h > 0) {
        const hot: RGB =
          palette === 'crimson'
            ? patch
              ? [230, 30 + 40 * lam, 80]
              : lam > 0.4 ? [250, 248, 255] : lam > -0.1 ? [255, 170, 196] : [214, 50, 96]
            : patch
              ? [255, 120 + 60 * lam, 40]
              : lam > 0.4 ? [255, 252, 226] : lam > -0.1 ? [255, 214, 120] : [255, 140, 52];
        col = [col[0] + (hot[0] - col[0]) * h, col[1] + (hot[1] - col[1]) * h, col[2] + (hot[2] - col[2]) * h];
      }
      buf.data[y * size + x] = packRGB(col);
    }
  }
  if (outline) buf.outline(h > 0.5 ? (palette === 'crimson' ? pack(110, 10, 50) : pack(150, 30, 20)) : OUTLINE);
  return buf.flush();
}
