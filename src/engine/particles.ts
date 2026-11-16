// Pooled particle system with color ramps and cached glow sprites.

import { clamp, lerp, ramp, type RGB } from './math';

export type RampName =
  | 'uv' | 'mote'
  | 'sod' | 'glass'
  | 'fire' | 'gold' | 'aura' | 'cyan' | 'smoke' | 'dust' | 'grass' | 'white' | 'ember' | 'night' | 'crimson' | 'silver'
  | 'cobalt' | 'dew'
  | 'jade' | 'ink'
  | 'vapor' | 'storm';

export const RAMPS: Record<RampName, RGB[]> = {
  // SPOTLIGHT SOLO: white > ivory > lilac > ultraviolet > uvDeep (the beat flares, the command-window motes).
  uv: [[255, 255, 255], [246, 240, 223], [201, 182, 255], [122, 77, 255], [42, 22, 96]],
  // SPOTLIGHT SOLO: dust drifting in the follow-spot beam (spawn with add: false, normal blend).
  mote: [[246, 240, 223], [201, 182, 255], [90, 70, 140]],
  // SPOTLIGHT SOLO v2: torn turf (grass top -> torn green -> soil -> soil deep): sods, crumbs (spawn with add: false).
  sod: [[120, 200, 90], [60, 138, 58], [74, 52, 36], [34, 22, 16]],
  // SPOTLIGHT SOLO v2: floodlight glass and shattered prints (white -> lilac-white -> volt -> deep violet).
  glass: [[255, 255, 255], [226, 220, 255], [160, 140, 240], [90, 70, 160]],
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
  // GALE HAMMER: ice > electric cyan > cobalt > navy (energy, rings, auras).
  cobalt: [[238, 251, 255], [70, 216, 255], [45, 82, 224], [10, 18, 56]],
  // GALE HAMMER: dew beads and glints.
  dew: [[255, 255, 255], [214, 248, 255], [140, 220, 255], [70, 150, 210]],
  // MERIDIAN THREAD: pearl > mint > jade > emerald > deep green (thread sparks, aura, glints).
  jade: [[255, 252, 240], [190, 255, 215], [47, 224, 138], [11, 143, 88], [13, 40, 28]],
  // MERIDIAN THREAD: paper > tone > graphite > ink (ink flecks, normal blend: add: false).
  ink: [[239, 231, 214], [160, 152, 140], [60, 58, 62], [13, 13, 20]],
  // GALE HAMMER v2: condensation (cone, disc, torus, shards, mist).
  vapor: [[255, 255, 255], [226, 246, 255], [170, 220, 250], [90, 140, 200]],
  // GALE HAMMER v2: cloud lid, dust curtain, ground fog (spawn with add: false, normal blend).
  storm: [[200, 214, 240], [120, 136, 170], [58, 70, 104], [20, 26, 48]],
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
  /** Shared (v2 set): a spinning grass blade, 3-5 px long (s = length), turned by rot / vrot; ramp 'grass' by default. */
  Blade,
  /** GALE HAMMER v2: a vapour puff stretched along its velocity (k = stretch per 100 px/s), normal blend by default. */
  Mist,
  /**
   * MERIDIAN THREAD v2: a light-stitch, a 3-6 px dash (s = length) oriented along its velocity with a 2 px cross at its
   * head (the cross in the ramp's first, pearl colour); ramp 'jade' by default.
   */
  Stitch,
  /**
   * SPOTLIGHT SOLO v2: a torn sod slab (s = size 6-10 px): a `torn` grass top over a `soil` underside, tumbling with
   * rot / vrot (normal blend). k = the ground y it bounces on once (k <= 1 = no bounce); it lands flat and slides to rest.
   */
  Sod,
  /**
   * SPOTLIGHT SOLO v2: a falling glass glint (s = 1-3 px, ramp 'glass'), with gravity from ay, that sparkles (a 1-frame
   * 4-point star of size 2 s) on a fraction of frames (k = sparkle chance per frame, 0..1, default 0.25). Additive by default.
   */
  Glass,
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
  /** How strongly Particles.wind pushes this particle (0..1, default 0: unaffected). */
  wind: number;
}

const DEFAULT: Particle = {
  kind: PK.Glow, x: 0, y: 0, vx: 0, vy: 0, ax: 0, ay: 0, drag: 0, life: 0, max: 1,
  s0: 4, s1: 0, a0: 1, a1: 0, ramp: 'fire', r0: 0, r1: 1, rot: 0, vrot: 0, add: true, layer: 1, k: 1, color: undefined,
  wind: 0,
};

export class Particles {
  /**
   * The single engine particle cap (every special): at CAP live particles a new spawn recycles the oldest one.
   * No shipped special comes near it (peaks: ZENITH 1152, CRESCENT 1072); each v2 brief keeps its own lower budget.
   */
  static readonly CAP = 1500;
  list: Particle[] = [];
  private pool: Particle[] = [];
  /**
   * Shared wind (v2 set), px/s² added to the acceleration of every particle spawned with `wind` > 0 (scaled by it).
   * Reset to [0, 0] by clear() (every shot entry).
   */
  wind: [number, number] = [0, 0];

  clear() {
    for (const p of this.list) this.pool.push(p);
    this.list.length = 0;
    this.wind = [0, 0];
  }

  spawn(o: Partial<Particle>): Particle {
    if (this.list.length >= Particles.CAP) this.pool.push(this.list.shift()!);
    const p = this.pool.pop() || ({} as Particle);
    Object.assign(p, DEFAULT, o);
    if (p.kind === PK.Mist && o.add === undefined) p.add = false;
    if (p.kind === PK.Sod && o.add === undefined) p.add = false;
    if (p.kind === PK.Glass && o.k === undefined) p.k = 0.25;
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
      if (p.wind) {
        p.vx += (p.ax + this.wind[0] * p.wind) * dt;
        p.vy += (p.ay + this.wind[1] * p.wind) * dt;
      } else {
        p.vx += p.ax * dt;
        p.vy += p.ay * dt;
      }
      if (p.drag) {
        const d = Math.exp(-p.drag * dt);
        p.vx *= d;
        p.vy *= d;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vrot * dt;
      if (p.kind === PK.Sod && p.k > 1 && p.y > p.k && p.vy > 0) {
        // SPOTLIGHT SOLO v2: a sod bounces once on its ground line, then lands flat and slides to rest.
        p.y = p.k;
        if (p.vy > 120) {
          p.vy *= -0.32;
          p.vx *= 0.6;
          p.vrot *= 0.5;
        } else {
          p.vy = 0;
          p.ay = 0;
          p.vx *= 0.5;
          p.vrot = 0;
          p.rot = Math.round(p.rot / Math.PI) * Math.PI;
          p.k = -1;
        }
      }
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
        case PK.Sod: {
          // A slab: soil underside (darker, 1 px lower) then the torn grass top, rotated; it flattens as it settles.
          ctx.globalAlpha = clamp(a);
          ctx.save();
          ctx.translate(Math.round(p.x), Math.round(p.y));
          ctx.rotate(p.rot);
          const w = Math.max(2, s), hh = Math.max(1, Math.round(s * 0.45));
          ctx.fillStyle = '#22160F';
          ctx.fillRect(-w / 2 - 0.5, -hh / 2 - 0.5, w + 1, hh + 2);
          ctx.fillStyle = '#4A3424';
          ctx.fillRect(-w / 2, 0, w, hh / 2 + 1);
          ctx.fillStyle = p.color || '#3C8A3A';
          ctx.fillRect(-w / 2, -hh / 2, w, Math.max(1, hh / 2 + 0.5));
          ctx.fillStyle = '#78C85A';
          ctx.fillRect(-w / 2, -hh / 2, Math.max(1, w * 0.6), 1);
          ctx.restore();
          break;
        }
        case PK.Glass: {
          ctx.globalAlpha = clamp(a);
          const c = p.color || rampColor(p.ramp === 'fire' ? 'glass' : p.ramp, rt);
          ctx.fillStyle = c;
          const q = Math.max(1, Math.round(s));
          const gx = Math.round(p.x), gy = Math.round(p.y);
          ctx.fillRect(gx, gy, q, q);
          // Sparkle on a pseudo-random subset of frames (a pure function of the particle's age, so seek is exact).
          const ph = Math.floor(p.life * 60 + p.k * 97.3);
          if (((ph * 2654435761) >>> 0) % 1000 < p.k * 1000) {
            const L = q * 2 + 1;
            ctx.fillRect(gx - L, gy, L * 2 + q, 1);
            ctx.fillRect(gx, gy - L, 1, L * 2 + q);
          }
          break;
        }
        case PK.Blade: {
          // A 1 px blade of length s along rot, pixel-snapped at its root, with a darker tip pixel.
          ctx.globalAlpha = clamp(a);
          const c = p.color || rampColor(p.ramp === 'fire' ? 'grass' : p.ramp, rt);
          const L = Math.max(2, s), dx = Math.cos(p.rot), dy = Math.sin(p.rot);
          ctx.fillStyle = c;
          const n = Math.ceil(L);
          for (let i = 0; i < n; i++) ctx.fillRect(Math.round(p.x + dx * (i - L / 2)), Math.round(p.y + dy * (i - L / 2)), 1, 1);
          ctx.fillStyle = 'rgba(20,48,26,0.8)';
          ctx.fillRect(Math.round(p.x + dx * (L / 2)), Math.round(p.y + dy * (L / 2)), 1, 1);
          break;
        }
        case PK.Stitch: {
          // A dash trailing back from the head along -v, pixel-snapped, with a 2 px cross (+) at the head.
          ctx.globalAlpha = clamp(a);
          const rn: RampName = p.ramp === 'fire' ? 'jade' : p.ramp;
          const sp = Math.hypot(p.vx, p.vy);
          const dx = sp > 1e-3 ? p.vx / sp : Math.cos(p.rot), dy = sp > 1e-3 ? p.vy / sp : Math.sin(p.rot);
          const L = Math.max(3, Math.min(6, s));
          ctx.fillStyle = p.color || rampColor(rn, rt);
          for (let i = 1; i <= Math.ceil(L); i++) ctx.fillRect(Math.round(p.x - dx * i), Math.round(p.y - dy * i), 1, 1);
          const hx = Math.round(p.x), hy = Math.round(p.y);
          ctx.fillStyle = rampColor(rn, 0);
          ctx.fillRect(hx - 1, hy, 3, 1);
          ctx.fillRect(hx, hy - 1, 1, 3);
          break;
        }
        case PK.Mist: {
          // Soft puff stretched along the velocity.
          const sp = Math.hypot(p.vx, p.vy);
          const st = 1 + (sp / 100) * p.k;
          ctx.save();
          ctx.translate(p.x, p.y);
          if (sp > 1) ctx.rotate(Math.atan2(p.vy, p.vx));
          ctx.globalAlpha = clamp(a);
          const img = softSprite(p.ramp === 'fire' ? 'vapor' : p.ramp, rt);
          ctx.drawImage(img, -s * st, -s, s * 2 * st, s * 2);
          ctx.restore();
          break;
        }
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
}
