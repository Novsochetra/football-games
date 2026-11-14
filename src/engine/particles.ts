// Pooled particle system with color ramps and cached glow sprites.

import { clamp, lerp, ramp, type RGB } from './math';

export type RampName = 'fire' | 'gold' | 'aura' | 'cyan' | 'smoke' | 'dust' | 'grass' | 'white' | 'ember' | 'night' | 'crimson' | 'silver';

export const RAMPS: Record<RampName, RGB[]> = {
  fire: [[255, 255, 238], [255, 228, 120], [255, 152, 44], [232, 62, 26], [125, 16, 26], [36, 10, 20]],
  gold: [[255, 255, 245], [255, 236, 150], [255, 186, 64], [206, 96, 24]],
  aura: [[255, 246, 226], [255, 196, 96], [255, 92, 52], [196, 18, 40], [70, 6, 28]],
  cyan: [[255, 255, 255], [190, 244, 255], [90, 190, 255], [50, 70, 210]],
  smoke: [[96, 72, 82], [62, 46, 60], [34, 26, 38]],
  dust: [[196, 176, 140], [150, 132, 104], [92, 82, 70]],
  grass: [[120, 200, 90], [70, 150, 60], [40, 100, 44]],
  white: [[255, 255, 255], [235, 235, 245], [200, 200, 220]],
  ember: [[255, 250, 210], [255, 200, 90], [255, 110, 40], [200, 30, 30]],
  night: [[200, 220, 255], [120, 150, 230], [60, 70, 150]],
  crimson: [[255, 245, 250], [255, 150, 180], [235, 40, 80], [150, 10, 50], [50, 4, 30]],
  silver: [[255, 255, 255], [225, 232, 255], [160, 172, 235], [90, 92, 170]],
};

const STEPS = 24;
const colorCache = new Map<RampName, string[]>();
const glowCache = new Map<RampName, HTMLCanvasElement[]>();
const softCache = new Map<RampName, HTMLCanvasElement[]>();

export function rampColor(name: RampName, t: number, a = 1): string {
  let arr = colorCache.get(name);
  if (!arr) {
    arr = [];
    for (let i = 0; i < STEPS; i++) {
      const c = ramp(RAMPS[name], i / (STEPS - 1));
      arr.push(`rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`);
    }
    colorCache.set(name, arr);
  }
  void a;
  return arr[Math.round(clamp(t) * (STEPS - 1))];
}

function makeRadial(c: RGB, hard: boolean): HTMLCanvasElement {
  const size = 64;
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const g = cv.getContext('2d')!;
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  const s = `${c[0] | 0},${c[1] | 0},${c[2] | 0}`;
  if (hard) {
    gr.addColorStop(0, `rgba(${s},1)`);
    gr.addColorStop(0.55, `rgba(${s},0.85)`);
    gr.addColorStop(1, `rgba(${s},0)`);
  } else {
    gr.addColorStop(0, `rgba(${s},1)`);
    gr.addColorStop(0.18, `rgba(${s},0.75)`);
    gr.addColorStop(0.45, `rgba(${s},0.25)`);
    gr.addColorStop(1, `rgba(${s},0)`);
  }
  g.fillStyle = gr;
  g.fillRect(0, 0, size, size);
  return cv;
}

/** Soft additive glow sprite for a ramp position. */
export function glowSprite(name: RampName, t: number): HTMLCanvasElement {
  let arr = glowCache.get(name);
  if (!arr) {
    arr = [];
    for (let i = 0; i < STEPS; i++) arr.push(makeRadial(ramp(RAMPS[name], i / (STEPS - 1)), false));
    glowCache.set(name, arr);
  }
  return arr[Math.round(clamp(t) * (STEPS - 1))];
}

/** Puffy sprite (fuller core) for smoke/dust clouds. */
export function softSprite(name: RampName, t: number): HTMLCanvasElement {
  let arr = softCache.get(name);
  if (!arr) {
    arr = [];
    for (let i = 0; i < STEPS; i++) arr.push(makeRadial(ramp(RAMPS[name], i / (STEPS - 1)), true));
    softCache.set(name, arr);
  }
  return arr[Math.round(clamp(t) * (STEPS - 1))];
}

const customGlow = new Map<string, HTMLCanvasElement>();
export function glowOf(c: RGB): HTMLCanvasElement {
  const k = c.join(',');
  let cv = customGlow.get(k);
  if (!cv) customGlow.set(k, (cv = makeRadial(c, false)));
  return cv;
}

/** Draw an additive glow blob (caller sets composite op if needed). */
export function drawGlow(ctx: CanvasRenderingContext2D, img: HTMLCanvasElement, x: number, y: number, r: number, a = 1, sx = 1, sy = 1) {
  if (r <= 0 || a <= 0) return;
  ctx.globalAlpha = clamp(a);
  ctx.drawImage(img, x - r * sx, y - r * sy, r * 2 * sx, r * 2 * sy);
  ctx.globalAlpha = 1;
}

export const enum PK {
  Glow,
  Pixel,
  Streak,
  Smoke,
  Debris,
  Ring,
  Confetti,
}

export interface Particle {
  kind: PK;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  drag: number;
  life: number;
  max: number;
  s0: number;
  s1: number;
  a0: number;
  a1: number;
  ramp: RampName;
  /** Ramp offset: color = ramp(r0 + age*(r1-r0)). */
  r0: number;
  r1: number;
  rot: number;
  vrot: number;
  add: boolean;
  layer: number;
  /** Streak length factor / ring squash / confetti hue. */
  k: number;
  color?: string;
}

const DEFAULT: Particle = {
  kind: PK.Glow, x: 0, y: 0, vx: 0, vy: 0, ax: 0, ay: 0, drag: 0, life: 0, max: 1,
  s0: 4, s1: 0, a0: 1, a1: 0, ramp: 'fire', r0: 0, r1: 1, rot: 0, vrot: 0, add: true, layer: 1, k: 1, color: undefined,
};

export class Particles {
  list: Particle[] = [];
  private pool: Particle[] = [];

  clear() {
    for (const p of this.list) this.pool.push(p);
    this.list.length = 0;
  }

  spawn(o: Partial<Particle>): Particle {
    const p = this.pool.pop() || ({} as Particle);
    Object.assign(p, DEFAULT, o);
    p.life = 0;
    this.list.push(p);
    return p;
  }

  update(dt: number) {
    const L = this.list;
    let j = 0;
    for (let i = 0; i < L.length; i++) {
      const p = L[i];
      p.life += dt;
      if (p.life >= p.max) {
        this.pool.push(p);
        continue;
      }
      p.vx += p.ax * dt;
      p.vy += p.ay * dt;
      if (p.drag) {
        const d = Math.exp(-p.drag * dt);
        p.vx *= d;
        p.vy *= d;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vrot * dt;
      L[j++] = p;
    }
    L.length = j;
  }

  draw(ctx: CanvasRenderingContext2D, layer = 1) {
    for (const p of this.list) {
      if (p.layer !== layer) continue;
      const t = p.life / p.max;
      const s = lerp(p.s0, p.s1, t);
      const a = lerp(p.a0, p.a1, t);
      if (a <= 0.003 || s <= 0) continue;
      const rt = lerp(p.r0, p.r1, t);
      ctx.globalCompositeOperation = p.add ? 'lighter' : 'source-over';
      switch (p.kind) {
        case PK.Glow:
          drawGlow(ctx, glowSprite(p.ramp, rt), p.x, p.y, s, a);
          break;
        case PK.Smoke:
          drawGlow(ctx, softSprite(p.ramp, rt), p.x, p.y, s, a);
          break;
        case PK.Pixel: {
          ctx.globalAlpha = clamp(a);
          ctx.fillStyle = p.color || rampColor(p.ramp, rt);
          const q = Math.max(1, Math.round(s));
          ctx.fillRect(Math.round(p.x - q / 2), Math.round(p.y - q / 2), q, q);
          break;
        }
        case PK.Streak: {
          ctx.globalAlpha = clamp(a);
          ctx.strokeStyle = p.color || rampColor(p.ramp, rt);
          ctx.lineWidth = s;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 0.03 * p.k, p.y - p.vy * 0.03 * p.k);
          ctx.stroke();
          break;
        }
        case PK.Debris: {
          ctx.globalAlpha = clamp(a);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          const q = Math.max(1, s);
          ctx.fillStyle = '#180411';
          ctx.fillRect(-q / 2 - 1, -q / 2 - 1, q + 2, q + 2);
          ctx.fillStyle = p.color || rampColor(p.ramp, rt);
          ctx.fillRect(-q / 2, -q / 2, q, q);
          ctx.restore();
          break;
        }
        case PK.Ring: {
          ctx.globalAlpha = clamp(a);
          ctx.strokeStyle = p.color || rampColor(p.ramp, rt);
          ctx.lineWidth = Math.max(0.5, (1 - t) * p.s0 * 0.12 + 0.5);
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, s, s * p.k, p.rot, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }
        case PK.Confetti: {
          ctx.globalAlpha = clamp(a);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.scale(1, Math.cos(p.life * 9 + p.k * 6));
          ctx.fillStyle = p.color || '#fff';
          ctx.fillRect(-s / 2, -s / 4, s, s / 2);
          ctx.restore();
          break;
        }
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
}
