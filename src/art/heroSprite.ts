// The hand-drawn No.10 sprite (100x100 native pixels) plus derived assets:
// tinted silhouettes for aura glow, an edge list for flames hugging the body,
// a hair mask for the power-up glow, and the eye positions for glints.

import heroUrl from './hero_no10.png';
import type { RGB } from '../engine/math';

export interface EdgePt {
  x: number;
  y: number;
  nx: number;
  ny: number;
}

export interface HeroArt {
  img: HTMLCanvasElement;
  w: number;
  h: number;
  /** Feet anchor in native px. */
  footX: number;
  footY: number;
  edges: EdgePt[];
  hair: HTMLCanvasElement;
  eyes: [number, number][];
  face: { x: number; y: number; w: number; h: number };
  tinted(c: RGB): HTMLCanvasElement;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = src;
  });
}

const HAIR_COLORS = new Set(['24,4,17', '54,34,74', '47,44,110', '55,14,34', '0,0,0']);

export async function loadHero(): Promise<HeroArt> {
  const im = await loadImage(heroUrl);
  const w = im.width, h = im.height;
  const img = document.createElement('canvas');
  img.width = w;
  img.height = h;
  const g = img.getContext('2d')!;
  g.drawImage(im, 0, 0);
  const data = g.getImageData(0, 0, w, h).data;
  const A = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : data[(y * w + x) * 4 + 3]);

  const edges: EdgePt[] = [];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (!A(x, y)) continue;
      const nx = (A(x - 1, y) ? 0 : -1) + (A(x + 1, y) ? 0 : 1);
      const ny = (A(x, y - 1) ? 0 : -1) + (A(x, y + 1) ? 0 : 1);
      if (nx || ny) {
        const l = Math.hypot(nx, ny);
        edges.push({ x: x + 0.5, y: y + 0.5, nx: nx / l, ny: ny / l });
      }
    }

  // Hair = dark/purple pixels in the top part of the sprite.
  const hair = document.createElement('canvas');
  hair.width = w;
  hair.height = h;
  const hg = hair.getContext('2d')!;
  const hd = hg.createImageData(w, h);
  for (let y = 0; y < 21; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (!data[i + 3]) continue;
      const key = `${data[i]},${data[i + 1]},${data[i + 2]}`;
      if (HAIR_COLORS.has(key) && (y < 17 || x < 40 || x > 62)) {
        hd.data[i] = 255;
        hd.data[i + 1] = 176;
        hd.data[i + 2] = 64;
        hd.data[i + 3] = 255;
      }
    }
  hg.putImageData(hd, 0, 0);

  const tintCache = new Map<string, HTMLCanvasElement>();
  const tinted = (c: RGB) => {
    const k = c.join(',');
    let cv = tintCache.get(k);
    if (!cv) {
      cv = document.createElement('canvas');
      cv.width = w;
      cv.height = h;
      const tg = cv.getContext('2d')!;
      tg.drawImage(img, 0, 0);
      tg.globalCompositeOperation = 'source-in';
      tg.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
      tg.fillRect(0, 0, w, h);
      tintCache.set(k, cv);
    }
    return cv;
  };

  return {
    img,
    w,
    h,
    footX: 48.5,
    footY: 99,
    edges,
    hair,
    eyes: [
      [45, 23],
      [53, 23],
    ],
    face: { x: 26, y: 8, w: 48, h: 26 },
    tinted,
  };
}
