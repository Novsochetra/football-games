// GALE HAMMER v2: the canvas FX of air (SPEC.md §10.3, items 10-27): the vapour cone and disc, the barrier torus, the
// stadium cyclone, the wind aura, the pressure orb, the pressed wake, air craters, the isobar spiral and implosion
// lines, the vortex tunnel, the palm tornado, the wind wipe, the anamorphic eye streak, the pressure-bubble rim,
// GOAL! on the wind wave and the thunder wall. First production versions from the engine foundation: every function
// is a pure function of its arguments (and of t), so shots seek exactly; shots may refine them (and add the sprite
// caches of §10.3 in prepare()). Additive layers are ice or cyan only, each over a navy halo; cobalt only as a
// normal-blend halo, stroke or ring.

import type { Env } from '../timeline';
import type { FxState } from '../../engine/post';
import { VW, VH } from '../../engine/camera';
import { TAU, clamp, ease, lerp } from '../../engine/math';
import { PK, drawGlow, glowOf, softSprite } from '../../engine/particles';
import type { StudioAnim } from '../../art/studioAnim';
import { TITLE_FONT } from '../../art/fx';
import { pushShock } from '../kit';
import { HEX } from './common';

/** Frame-stable hash in [0, 1). */
const hash = (n: number) => {
  const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
};
const ICE = 'rgb(238,251,255)', CYAN = 'rgb(70,216,255)', NAVY = 'rgb(10,18,56)', COBALT = 'rgb(45,82,224)';
const glowIce = () => glowOf([238, 251, 255]);
const glowCyan = () => glowOf([70, 216, 255]);
const glowNavy = () => glowOf([10, 18, 56]);

function withComp(ctx: CanvasRenderingContext2D, op: GlobalCompositeOperation, f: () => void) {
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = op;
  f();
  ctx.globalCompositeOperation = prev;
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- 10. the vapour cone

export interface VaporConeOpts {
  /** Foreshortening of the cone's length (1 = side-on; the swing-orbit passes cos(yaw)). */
  aspect?: number;
  /** Draw the navy pocket round the ball so its ice core stays the hottest point (default true). */
  pocket?: boolean;
  /** The ball's on-screen radius (sizes the pocket; default bell × 0.2). */
  ballR?: number;
}

/**
 * The vapour cone: a three-layer bell shroud behind the ball at (x, y) travelling along `dir` (radians): an outer soft
 * white (normal blend) over a navy halo, an inner cyan additive shell, an ice core streak; noisy pixel-snapped edges;
 * 4 Mach diamonds pulsing at 12 Hz; 2 wingtip corkscrews peeling off its edges. `bell` = height at the mouth (px),
 * `len` = length behind the ball (px).
 */
export function vaporCone(ctx: CanvasRenderingContext2D, x: number, y: number, dir: number, bell: number, len: number, t: number, a = 1, o: VaporConeOpts = {}) {
  if (a <= 0 || len <= 0) return;
  const L = len * (o.aspect ?? 1);
  const half = bell / 2;
  const br = o.ballR ?? bell * 0.2;
  const ph = Math.floor(t * 30);
  const N = 18;
  // Half-width along the cone (u 0 = at the ball, 1 = the tail): opens fast to the mouth, then frays.
  const w = (u: number, jit: number) => {
    const open = u < 0.22 ? lerp(br * 1.3, half, ease.outQuad(u / 0.22)) : lerp(half, half * 0.62, (u - 0.22) / 0.78);
    return open * (1 + jit * (0.06 + 0.1 * u));
  };
  const shape = (k: number, salt: number) => {
    const top: [number, number][] = [], bot: [number, number][] = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      top.push([-u * L, -w(u, hash(ph * 31 + i + salt) * 2 - 1) * k]);
      bot.push([-u * L, w(u, hash(ph * 17 + i + salt + 50) * 2 - 1) * k]);
    }
    ctx.beginPath();
    ctx.moveTo(Math.round(top[0][0]), Math.round(top[0][1]));
    for (const p of top) ctx.lineTo(Math.round(p[0]), Math.round(p[1]));
    for (let i = bot.length - 1; i >= 0; i--) ctx.lineTo(Math.round(bot[i][0]), Math.round(bot[i][1]));
    ctx.closePath();
  };
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(dir);
  // Navy halo, then the outer soft white (normal blend).
  ctx.globalAlpha = 0.35 * a;
  ctx.fillStyle = NAVY;
  shape(1.12, 0);
  ctx.fill();
  ctx.globalAlpha = 0.45 * a;
  ctx.fillStyle = 'rgb(226,246,255)';
  shape(1, 1);
  ctx.fill();
  // Inner cyan additive shell and the ice core streak.
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.3 * a;
  ctx.fillStyle = CYAN;
  shape(0.62, 2);
  ctx.fill();
  ctx.globalAlpha = 0.8 * a;
  ctx.fillStyle = ICE;
  ctx.fillRect(Math.round(-L * 0.9), -1, Math.round(L * 0.9), 2);
  // Mach diamonds (12 Hz pulse).
  const pulse = 0.6 + 0.4 * Math.sin(t * TAU * 12);
  for (let i = 0; i < 4; i++) {
    const cx = -L * (0.16 + i * 0.17), s = (br * 0.55) * (1 - i * 0.15) * pulse;
    ctx.globalAlpha = 0.55 * a * (1 - i * 0.18);
    ctx.beginPath();
    ctx.moveTo(cx - s * 1.6, 0);
    ctx.lineTo(cx, -s);
    ctx.lineTo(cx + s * 1.6, 0);
    ctx.lineTo(cx, s);
    ctx.closePath();
    ctx.fill();
  }
  // Wingtip corkscrews off the top and bottom edges (white, normal blend).
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgb(255,255,255)';
  for (const side of [-1, 1]) {
    for (let i = 0; i < 26; i++) {
      const u = 0.25 + (i / 26) * 0.75;
      const yy = side * w(u, 0) + Math.sin(u * 18 - t * 30 + side) * 4 * u;
      ctx.globalAlpha = 0.6 * a * (1 - u * 0.7);
      ctx.fillRect(Math.round(-u * L), Math.round(yy), 2, 2);
    }
  }
  ctx.restore();
  ctx.globalAlpha = 1;
  if (o.pocket !== false) {
    ctx.globalCompositeOperation = 'source-over';
    drawGlow(ctx, glowNavy(), x, y, br * 2.4, 0.55 * a);
  }
}

// ---------------------------------------------------------------- 11. the vapour disc and its shards

/**
 * The condensation disc (the sound barrier): a turbulent white fringe, a cyan rim glow and 3 cobalt contour rings inside,
 * seen at `aspect` (cos yaw: 0 = edge-on line, 1 = face-on circle), radius r (px); a navy pocket at the centre for the ball.
 */
export function vaporDisc(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, aspect: number, t: number, a = 1) {
  if (a <= 0 || r <= 0) return;
  const ax = Math.max(0.02, aspect);
  const ph = Math.floor(t * 30);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(ax, 1);
  // Navy halo and a soft white body.
  ctx.globalAlpha = 0.4 * a;
  ctx.fillStyle = NAVY;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.08, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 0.3 * a;
  ctx.fillStyle = 'rgb(226,246,255)';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();
  // Turbulent fringe: puffs round the rim.
  for (let i = 0; i < 40; i++) {
    const th = (i / 40) * TAU + hash(i) * 0.1;
    const rr = r * (0.94 + 0.1 * hash(ph * 7 + i));
    const s = r * (0.07 + 0.06 * hash(i * 3 + ph));
    ctx.globalAlpha = 0.55 * a;
    ctx.drawImage(softSprite('vapor', 0.1), Math.cos(th) * rr - s, Math.sin(th) * rr - s, s * 2, s * 2);
  }
  // Cobalt contour rings (normal blend strokes).
  ctx.strokeStyle = COBALT;
  ctx.lineWidth = 1.5 / ax;
  for (const k of [0.32, 0.55, 0.76]) {
    ctx.globalAlpha = 0.7 * a;
    ctx.beginPath();
    ctx.arc(0, 0, r * k * (1 + 0.02 * Math.sin(t * 9 + k * 10)), 0, TAU);
    ctx.stroke();
  }
  // Cyan rim glow (additive).
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = CYAN;
  ctx.lineWidth = 3 / ax;
  ctx.globalAlpha = 0.55 * a;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.97, 0, TAU);
  ctx.stroke();
  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  drawGlow(ctx, glowNavy(), x, y, r * 0.3, 0.6 * a, ax, 1);
}

/** The disc blowing apart: n vapour shards (PK.Mist, 'vapor') streaming outward from its rim. Call once, in update. */
export function vaporShards(env: Env, x: number, y: number, r: number, n = 100, aspect = 1) {
  const rng = env.rng;
  for (let i = 0; i < n; i++) {
    const th = rng.range(0, TAU);
    const sp = rng.range(200, 700);
    env.parts.spawn({
      kind: PK.Mist, x: x + Math.cos(th) * r * aspect, y: y + Math.sin(th) * r, vx: Math.cos(th) * sp * Math.max(0.3, aspect), vy: Math.sin(th) * sp,
      drag: 2.2, max: rng.range(0.4, 0.9), s0: rng.range(6, 14), s1: rng.range(14, 26), k: 0.6, ramp: 'vapor', r0: 0, r1: 1, a0: 0.75, a1: 0,
    });
  }
}

// ---------------------------------------------------------------- 12. the barrier torus

/** The barrier ring: a white smoke torus of radius r, expanding (the caller animates r) and breaking up as `a` falls. */
export function vaporTorus(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, t: number, a = 1, squash = 0.85) {
  if (a <= 0 || r <= 0) return;
  const n = Math.max(16, Math.round(r / 3));
  for (let i = 0; i < n; i++) {
    const th = (i / n) * TAU + t * 0.6;
    const gap = hash(i * 13.1);
    if (gap > a + 0.15) continue; // the ring breaks up
    const s = r * (0.1 + 0.05 * hash(i * 7.3)) * (1 + (1 - a) * 0.6);
    const px = x + Math.cos(th) * r, py = y + Math.sin(th) * r * squash;
    ctx.globalAlpha = clamp(a * 0.4);
    ctx.drawImage(softSprite('storm', 0.9), px - s * 1.2, py - s * 1.2, s * 2.4, s * 2.4);
    ctx.globalAlpha = clamp(a * 0.7);
    ctx.drawImage(softSprite('vapor', 0.05), px - s, py - s, s * 2, s * 2);
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- 13. the stadium cyclone

export interface CycloneOpts {
  /** Ride paper cups, a corner flag and a scarf on the bands. */
  debris?: boolean;
  /** 0..1: stretch the cyclone into the trailing run-up funnel (shot 4); the top leans back by funnel × h. */
  funnel?: number;
  /** 0..1: the eye bursts: bands fly outward (radius × 1 -> 2.6), front arcs at parallax 2.5, fading. */
  burst?: number;
  /** Turns per second (default 1.4, counter-clockwise). */
  spin?: number;
}

/**
 * The cyclone wall: 14 bands (3-8 px, ice and cyan, alpha 0.4-0.9) orbiting a footprint ellipse (rx, ry) at (cx, cy)
 * up to height h; `half` 'back' draws the far halves (before the figure), 'front' the near halves (after it).
 */
export function cycloneWall(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, h: number, t: number, half: 'back' | 'front', o: CycloneOpts = {}) {
  const spin = o.spin ?? 1.4, burst = clamp(o.burst ?? 0), funnel = o.funnel ?? 0;
  const front = half === 'front';
  const grow = 1 + 1.6 * ease.outCubic(burst) * (front ? 2.5 : 1);
  const fade = 1 - ease.inQuad(burst);
  for (let i = 0; i < 14; i++) {
    const u = (i + 0.5) / 14;
    const yb = cy - h * u;
    const k = (0.85 + 0.35 * u) * grow;
    const ex = cx - funnel * h * u * 0.8;
    const thick = 3 + Math.round(hash(i) * 5);
    const alpha = (0.4 + 0.5 * hash(i * 3.3)) * fade;
    // Counter-clockwise seen from above: the near (front) half moves right -> left on screen.
    const phase = -t * spin * TAU + i * 0.9;
    const span = 1.2 + hash(i * 5.1) * 1.6;
    const a0 = phase % TAU;
    ctx.strokeStyle = i % 3 === 0 ? CYAN : ICE;
    for (let seg = 0; seg < 2; seg++) {
      const s0 = a0 + seg * Math.PI, s1 = s0 + span * 0.5;
      // Keep the part of the arc in the requested half (front = sin > 0, the lower half on screen).
      const mid = (s0 + s1) / 2;
      const isFront = Math.sin(mid) > 0;
      if (isFront !== front) continue;
      ctx.lineWidth = thick + 3;
      ctx.globalAlpha = alpha * 0.45;
      ctx.strokeStyle = NAVY;
      ctx.beginPath();
      ctx.ellipse(ex, yb, rx * k, ry * k, 0, s0, s1);
      ctx.stroke();
      withComp(ctx, 'lighter', () => {
        ctx.lineWidth = thick;
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = i % 3 === 0 ? CYAN : ICE;
        ctx.beginPath();
        ctx.ellipse(ex, yb, rx * k, ry * k, 0, s0, s1);
        ctx.stroke();
      });
    }
  }
  if (o.debris) {
    const kinds = ['cup', 'cup', 'cup', 'flag', 'scarf', 'grass', 'grass', 'dew', 'dew', 'dew'];
    kinds.forEach((kind, j) => {
      const u = 0.15 + hash(j * 9.7) * 0.8;
      const th = -t * spin * TAU * (0.9 + hash(j) * 0.2) + j * 1.7;
      if ((Math.sin(th) > 0) !== front) return;
      const k = (0.85 + 0.35 * u) * grow;
      const px = cx - funnel * h * u * 0.8 + Math.cos(th) * rx * k, py = cy - h * u + Math.sin(th) * ry * k;
      ctx.globalAlpha = fade;
      if (kind === 'cup') {
        ctx.fillStyle = '#e8ecf4';
        ctx.fillRect(Math.round(px), Math.round(py), 4, 5);
        ctx.fillStyle = '#c81e2a';
        ctx.fillRect(Math.round(px), Math.round(py + 2), 4, 1);
      } else if (kind === 'flag') {
        ctx.fillStyle = '#ffd34a';
        ctx.fillRect(Math.round(px), Math.round(py - 8), 1, 10);
        ctx.fillStyle = '#ff3b3b';
        ctx.fillRect(Math.round(px + 1), Math.round(py - 8), 5, 3);
      } else if (kind === 'scarf') {
        ctx.fillStyle = '#c81e2a';
        for (let s = 0; s < 8; s++) ctx.fillRect(Math.round(px + s * 2), Math.round(py + Math.sin(t * 20 + s) * 2), 2, 2);
      } else if (kind === 'grass') {
        ctx.fillStyle = '#3f9a48';
        ctx.fillRect(Math.round(px), Math.round(py), 3, 1);
      } else {
        ctx.fillStyle = ICE;
        ctx.fillRect(Math.round(px), Math.round(py), 1, 1);
      }
    });
    ctx.globalAlpha = 1;
  }
}

// ---------------------------------------------------------------- 14. the wind aura

const rowCache = new WeakMap<StudioAnim, Map<number, [number, number][]>>();
/** Per-row opaque extents [x0, x1] of frame i (art px; empty rows [-1, -1]). */
function rowsOf(a: StudioAnim, i: number): [number, number][] {
  let m = rowCache.get(a);
  if (!m) rowCache.set(a, (m = new Map()));
  let rows = m.get(i);
  if (!rows) {
    rows = [];
    const px = a.frames[i].px;
    for (let y = 0; y < a.h; y++) {
      let x0 = -1, x1 = -1;
      for (let x = 0; x < a.w; x++)
        if (px[(y * a.w + x) * 4 + 3] > 40) {
          if (x0 < 0) x0 = x;
          x1 = x;
        }
      rows.push([x0, x1]);
    }
    m.set(i, rows);
  }
  return rows;
}

export interface WindAuraOpts {
  /** Sweep the streamers off him along +x by this many px (shot 5: 600 px/s for 0.3 s). */
  advect?: number;
  /** Revolutions per second, counter-clockwise with the cyclone (default 1.4). */
  spin?: number;
  /** Which halves to draw (default both): 'back' before the figure, 'front' after it. */
  half?: 'back' | 'front' | 'both';
  /** The frame's top-left in world/screen space is (x - pivot.x·scale, y - pivot.y·scale); default pivot = contact. */
  pivot?: [number, number];
  /** Up to 30 streamers. */
  n?: number;
  alpha?: number;
}

/**
 * The wind aura: up to 30 streamers per frame, each a horizontal arc (20-60° of an ellipse centred on his axis at the
 * height of the row it was sampled from; rx = his half-width there + 6-18 px, ry = 0.22 rx) travelling tangentially
 * with the cyclone, rising at most 10 px/s, fading along the arc; ice and cyan over a navy halo. They never peel
 * upward off the silhouette edge, and there are no copies of the silhouette.
 */
export function windAura(env: Env, a: StudioAnim, frame: number, x: number, y: number, scale: number, t: number, o: WindAuraOpts = {}) {
  const ctx = env.ctx;
  const rows = rowsOf(a, frame);
  const pv = o.pivot ?? a.anchorOf(frame, 'contact');
  const ox = x - pv[0] * scale, oy = y - pv[1] * scale;
  const spin = o.spin ?? 1.4, n = Math.min(30, o.n ?? 30), half = o.half ?? 'both';
  const filled = rows.map((r, i) => [r, i] as const).filter(([r]) => r[0] >= 0);
  if (!filled.length) return;
  for (let k = 0; k < n; k++) {
    const [[x0, x1], row] = filled[Math.floor(hash(k * 7.7) * filled.length)];
    const cxr = ox + ((x0 + x1 + 1) / 2) * scale + (o.advect ?? 0);
    const rise = ((t * 10 + hash(k) * 20) % 20) - 10;
    const cyr = oy + row * scale - rise;
    const rx = ((x1 - x0 + 1) / 2) * scale + 6 + hash(k * 3.1) * 12;
    const ry = 0.22 * rx;
    const len = ((20 + hash(k * 5.3) * 40) * Math.PI) / 180;
    const start = hash(k * 2.9) * TAU - t * spin * TAU;
    const segs = 6;
    for (let s = 0; s < segs; s++) {
      const th = start + (s / segs) * len;
      const front = Math.sin(th) > 0;
      if (half !== 'both' && (half === 'front') !== front) continue;
      const px = cxr + Math.cos(th) * rx, py = cyr + Math.sin(th) * ry;
      const al = (o.alpha ?? 1) * (1 - s / segs) * 0.85;
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = al * 0.5;
      ctx.fillStyle = NAVY;
      ctx.fillRect(Math.round(px) - 1, Math.round(py) - 1, 4, 3);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = al;
      ctx.fillStyle = k % 3 ? ICE : CYAN;
      ctx.fillRect(Math.round(px), Math.round(py), 2, 1);
    }
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

// ---------------------------------------------------------------- 15. the pressure orb

/** The compressed-air sphere on the boot: a cyan core, 3 tilted isobar rings turning 0.6 rad/s; `crush` flattens it to a disc. */
export function pressureOrb(ctx: CanvasRenderingContext2D, x: number, y: number, R: number, t: number, crush = 0, a = 1) {
  if (a <= 0 || R <= 0) return;
  const sy = 1 - 0.85 * clamp(crush), sx = 1 + 0.4 * clamp(crush);
  ctx.globalCompositeOperation = 'source-over';
  drawGlow(ctx, glowNavy(), x, y, R * 2.2, 0.7 * a, sx, sy);
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowCyan(), x, y, R * 1.6, 0.75 * a, sx, sy);
  drawGlow(ctx, glowIce(), x, y, R * 0.7, 0.9 * a, sx, sy);
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const tilt = t * 0.6 + (i * Math.PI) / 3;
    ctx.globalAlpha = 0.85 * a;
    ctx.strokeStyle = i === 1 ? ICE : CYAN;
    ctx.beginPath();
    ctx.ellipse(x, y, R * sx, R * Math.abs(Math.cos(tilt)) * 0.9 * sy + 1, i * 0.6, 0, TAU);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

// ---------------------------------------------------------------- 16. the pressed wake and the bow wave

export interface WakePt {
  x: number;
  y: number;
  /** Half-width of the wake here (px, on the ground). */
  w: number;
}

/**
 * The pressed wake along `path` (from the boot toward the goal): grass combed pale in a V, the dark pressed groove at its
 * centre, dew-mist walls on its edges. o.reveal (0..1) unzips it along the path; o.mist scales the walls.
 */
export function pressedWake(ctx: CanvasRenderingContext2D, path: readonly WakePt[], t: number, o: { reveal?: number; mist?: number; alpha?: number } = {}) {
  if (path.length < 2) return;
  const n = Math.max(2, Math.ceil(path.length * clamp(o.reveal ?? 1)));
  const a = o.alpha ?? 1;
  const poly = (k: number) => {
    ctx.beginPath();
    for (let i = 0; i < n; i++) ctx.lineTo(path[i].x, path[i].y - path[i].w * k * 0.3);
    for (let i = n - 1; i >= 0; i--) ctx.lineTo(path[i].x, path[i].y + path[i].w * k * 0.3);
    ctx.closePath();
  };
  ctx.globalAlpha = 0.55 * a;
  ctx.fillStyle = HEX.pressed;
  poly(1);
  ctx.fill();
  ctx.globalAlpha = 0.8 * a;
  ctx.fillStyle = HEX.pressedCore;
  poly(0.25);
  ctx.fill();
  // Comb lines (pale, raking back along the V).
  ctx.fillStyle = 'rgba(214,248,200,0.5)';
  for (let i = 1; i < n; i += 2) {
    const p = path[i];
    for (const side of [-1, 1]) ctx.fillRect(Math.round(p.x), Math.round(p.y + side * p.w * 0.18), 3, 1);
  }
  const mist = o.mist ?? 1;
  if (mist > 0)
    for (let i = 0; i < n; i += 2) {
      const p = path[i];
      for (const side of [-1, 1]) {
        const s = 6 + p.w * 0.4;
        ctx.globalAlpha = 0.25 * mist * a * (0.6 + 0.4 * Math.sin(t * 6 + i));
        ctx.drawImage(softSprite('vapor', 0.2), p.x - s, p.y + side * p.w * 0.3 - s * 1.4, s * 2, s * 2);
      }
    }
  ctx.globalAlpha = 1;
}

/** The bow wave: walls of dew, vapour and plucked blades thrown up at (x, y), travelling along `dir` (radians). Call in update. */
export function bowWave(env: Env, x: number, y: number, dir: number, power = 1) {
  const rng = env.rng;
  const n = Math.round(8 * power);
  for (let i = 0; i < n; i++) {
    const side = rng.sign();
    const a = dir + side * rng.range(1.2, 1.6) - Math.PI * 0.08;
    const sp = rng.range(120, 320) * power;
    env.parts.spawn({ kind: PK.Pixel, x, y, vx: Math.cos(a) * sp, vy: -rng.range(150, 320) * power, ay: 700, drag: 1.2, max: rng.range(0.5, 0.9), s0: rng.range(1, 2.5), s1: 1, ramp: 'dew', r0: 0, r1: 0.8, a0: 1, a1: 0.4 });
    env.parts.spawn({ kind: PK.Blade, x, y, vx: Math.cos(a) * sp * 0.6, vy: -rng.range(100, 260) * power, ay: 600, drag: 1.5, vrot: rng.range(-14, 14), rot: rng.range(0, TAU), max: rng.range(0.6, 1.1), s0: rng.range(3, 5), s1: 3, ramp: 'grass', r0: rng.next(), r1: rng.next(), a0: 1, a1: 1, add: false });
  }
  env.parts.spawn({ kind: PK.Mist, x, y: y - 6, vx: Math.cos(dir) * 120, vy: -40, drag: 2, max: 0.7, s0: 8, s1: 22, k: 0.4, ramp: 'vapor', r0: 0, r1: 1, a0: 0.5, a1: 0 });
}

// ---------------------------------------------------------------- 17. air craters

/**
 * An air crater pressed into the turf at (x, y): radius R (up to 400 px), ground squash k (ry = R·k), `age` = seconds
 * since it was stamped (it blooms over 0.25 s and its glow line cools). Rings: a pressed band, a cyan glow line, a
 * cobalt core ring (normal blend). Generalises v1's drawStamp / pressureStamp.
 */
export function airCrater(ctx: CanvasRenderingContext2D, x: number, y: number, R: number, k: number, age: number, rings = 3, a = 1) {
  if (age < 0 || a <= 0) return;
  const bloom = 0.6 + 0.4 * ease.outCubic(clamp(age / 0.25));
  const r = R * bloom, ry = r * k;
  ctx.globalAlpha = 0.5 * a;
  ctx.fillStyle = HEX.pressedCore;
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.9, ry * 0.9, 0, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 0.6 * a;
  ctx.strokeStyle = HEX.pressed;
  ctx.lineWidth = Math.max(2, R * 0.08);
  ctx.beginPath();
  ctx.ellipse(x, y, r, ry, 0, 0, TAU);
  ctx.stroke();
  if (rings >= 3) {
    ctx.globalAlpha = 0.85 * a;
    ctx.strokeStyle = COBALT;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.4, ry * 0.4, 0, 0, TAU);
    ctx.stroke();
  }
  if (rings >= 2) {
    const glow = clamp(1 - age / 1.5) * 0.7 + 0.25;
    withComp(ctx, 'lighter', () => {
      ctx.globalAlpha = glow * a;
      ctx.strokeStyle = CYAN;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(x, y, r * 0.72, ry * 0.72, 0, 0, TAU);
      ctx.stroke();
    });
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- 18. the isobar spiral and implosion lines

export interface SpiralOpts {
  loops?: number;
  /** Outer radius at t = 0 (px). */
  r0?: number;
  /** Radius multiplier per second (0.6 = tightening). */
  tighten?: number;
  /** Extra radius scale (the snaps: 0.8 in 2 frames). */
  scale?: number;
  /** Turning rate (rad/s). */
  turn?: number;
  alpha?: number;
}

/** The giant isobar spiral (shot 2): cyan contour loops, 2-3 px, alpha 0.7, wobbling sin(5θ + 3t), tightening and turning. */
export function isobarSpiral(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, o: SpiralOpts = {}) {
  const loops = o.loops ?? 8, r0 = o.r0 ?? 420, sc = (o.scale ?? 1) * Math.pow(o.tighten ?? 0.6, t), turn = (o.turn ?? 0.8) * t;
  ctx.strokeStyle = CYAN;
  for (let i = 0; i < loops; i++) {
    const R = r0 * ((i + 1) / loops) * sc;
    ctx.globalAlpha = (o.alpha ?? 0.7) * (0.55 + 0.45 * (i / loops));
    ctx.lineWidth = i % 2 ? 2 : 3;
    ctx.beginPath();
    for (let s = 0; s <= 72; s++) {
      const th = (s / 72) * TAU;
      const r = R * (1 + 0.05 * Math.sin(5 * th + 3 * t + i)) * (1 + 0.06 * (th / TAU));
      const px = cx + Math.cos(th + turn + i * 0.3) * r, py = cy + Math.sin(th + turn + i * 0.3) * r;
      s ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/** n implosion lines streaming toward (cx, cy) (or away when !inward): ice / cyan, additive. */
export function implosionLines(ctx: CanvasRenderingContext2D, cx: number, cy: number, n: number, t: number, inward = true, a = 1, rMax = 420) {
  withComp(ctx, 'lighter', () => {
    for (let i = 0; i < n; i++) {
      const th = hash(i * 1.37) * TAU;
      const speed = 1.4 + hash(i * 2.1) * 1.2;
      let f = (t * speed + hash(i * 4.4)) % 1;
      if (inward) f = 1 - f;
      const d = 18 + f * rMax, len = 14 + hash(i * 6.1) * 50 * (0.4 + f);
      ctx.globalAlpha = a * (0.25 + 0.6 * f) * (inward ? 1 : 1 - f);
      ctx.strokeStyle = i % 4 ? ICE : CYAN;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(th) * d, cy + Math.sin(th) * d);
      ctx.lineTo(cx + Math.cos(th) * (d + len), cy + Math.sin(th) * (d + len));
      ctx.stroke();
    }
  });
}

// ---------------------------------------------------------------- 19. the vortex tunnel (chase POV)

/** 10 elliptical vapour rings peeling off the cone and expanding past the frame edges (0.2 -> 1.4 of the frame), turning. */
export function vortexTunnel(ctx: CanvasRenderingContext2D, t: number, speed: number, cx = VW / 2, cy = VH * 0.66, a = 1) {
  for (let i = 0; i < 10; i++) {
    const f = (t * speed + i / 10) % 1;
    const s = 0.2 * Math.pow(7, f);
    const rx = VW * 0.5 * s, ry = VH * 0.42 * s;
    const al = a * Math.min(1, f * 4) * (1 - f) * 0.9;
    const rot = t * 0.6 + i * 0.8;
    ctx.globalAlpha = al * 0.5;
    ctx.strokeStyle = NAVY;
    ctx.lineWidth = 2 + 6 * f;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, rot * 0.1, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = al;
    ctx.strokeStyle = 'rgb(226,246,255)';
    ctx.lineWidth = 1 + 3 * f;
    ctx.setLineDash([24 + 40 * f, 10 + 30 * f]);
    ctx.lineDashOffset = -rot * 40;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, rot * 0.1, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- 20. the palm tornado

/** The mini tornado on his palm: base at (x, y), h px tall, ice and cyan streaks round a funnel, 6 orbiting dew beads. */
export function miniTornado(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, t: number, a = 1) {
  if (a <= 0 || h <= 0) return;
  withComp(ctx, 'lighter', () => {
    for (let i = 0; i < 22; i++) {
      const u = i / 22;
      const r = 3 + u * u * h * 0.45;
      const th = t * 14 + i * 0.9;
      const yy = y - u * h;
      ctx.globalAlpha = a * (0.4 + 0.5 * (1 - u));
      ctx.strokeStyle = i % 3 ? ICE : CYAN;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(x + Math.sin(t * 3 + u * 4) * u * 4, yy, r, r * 0.25, 0, th, th + 2.2);
      ctx.stroke();
    }
    for (let b = 0; b < 6; b++) {
      const th = t * 9 + (b * TAU) / 6, u = 0.3 + 0.1 * (b % 3);
      const r = 3 + u * u * h * 0.45 + 4;
      ctx.globalAlpha = a;
      ctx.fillStyle = ICE;
      ctx.fillRect(Math.round(x + Math.cos(th) * r), Math.round(y - u * h + Math.sin(th) * r * 0.25), 2, 2);
    }
  });
}

// ---------------------------------------------------------------- 21. the wind wipe (GALE's transition)

/**
 * The wind wipe at progress p (0..1): 60 irregularly spaced ice / white streaks, 2-6 px tall, with navy halos, sweeping
 * across (dir +1 = left -> right). Covers at most 50 % of any frame, so it is not a counted full-frame event.
 * Screen space; returns the trailing edge's x (reveal the next shot behind it).
 */
export function windWipe(ctx: CanvasRenderingContext2D, p: number, dir: 1 | -1 = 1): number {
  const lead = lerp(-260, VW + 260, ease.inOutQuad(clamp(p)));
  for (let i = 0; i < 60; i++) {
    const y = Math.round(hash(i * 3.7) * VH);
    const hgt = 2 + Math.floor(hash(i * 5.9) * 5);
    const len = 80 + hash(i * 1.3) * 220;
    const lag = hash(i * 8.1) * 160;
    let x1 = lead - lag;
    let x0 = x1 - len;
    if (dir < 0) [x0, x1] = [VW - x1, VW - x0];
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = NAVY;
    ctx.fillRect(Math.round(x0) - 2, y - 1, Math.round(len) + 4, hgt + 2);
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = i % 4 ? ICE : '#ffffff';
    ctx.fillRect(Math.round(x0), y, Math.round(len), hgt);
  }
  ctx.globalAlpha = 1;
  return dir > 0 ? lead - 380 : VW - (lead - 380);
}

// ---------------------------------------------------------------- 22. the anamorphic eye streak

/** A horizontal cyan anamorphic streak through (x, y): a 2 px ice core and a 10 px soft cyan body, w px long. Additive. */
export function anamorphic(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, a = 1) {
  if (a <= 0 || w <= 0) return;
  withComp(ctx, 'lighter', () => {
    drawGlow(ctx, glowCyan(), x, y, 10, 0.55 * a, w / 20, 1);
    drawGlow(ctx, glowIce(), x, y, 3, 0.9 * a, w / 8, 0.6);
    ctx.globalAlpha = 0.9 * a;
    ctx.fillStyle = ICE;
    ctx.fillRect(Math.round(x - w * 0.18), Math.round(y) - 1, Math.round(w * 0.36), 2);
  });
}

// ---------------------------------------------------------------- 23. the pressure bubble's glass rim

/** The pressure bubble's rim: a chromatic fringe (cyan / ice / cobalt offsets) and an ice specular arc (canvas; the lens is post). */
export function bubbleRim(ctx: CanvasRenderingContext2D, x: number, y: number, R: number, t: number, a = 1) {
  if (a <= 0 || R <= 0) return;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5 * a;
  ctx.strokeStyle = COBALT;
  ctx.beginPath();
  ctx.arc(x + 1, y + 1, R, 0, TAU);
  ctx.stroke();
  withComp(ctx, 'lighter', () => {
    ctx.globalAlpha = 0.5 * a;
    ctx.strokeStyle = CYAN;
    ctx.beginPath();
    ctx.arc(x - 1, y, R, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 0.85 * a;
    ctx.strokeStyle = ICE;
    ctx.lineWidth = 2;
    const s = -2.3 + Math.sin(t * 2) * 0.05;
    ctx.beginPath();
    ctx.arc(x, y, R * 0.86, s, s + 0.9);
    ctx.stroke();
  });
}

// ---------------------------------------------------------------- 25. GOAL! on the wind wave

export interface GustTitleOpts {
  /** Gap between glyph arrivals (default 0.05 s). */
  stagger?: number;
  /** Where the glyphs come from (screen x; default -size). */
  fromX?: number;
  /** Flight time into place (default 0.18 s). */
  dur?: number;
  fill?: string;
  stroke?: string;
  outer?: string;
}

/**
 * GALE's GOAL!: glyphs carried in from screen-left on the wind-wave front, 0.05 s apart, outCubic into place over 0.18 s,
 * sheared up to 0.5 and fluttering like the flags (shear and y on a damped 7 Hz sine); on arrival each snaps upright in
 * 2 frames (110 % -> 100 %) and stamps an isobar echo (two 1 px ice contour lines tracing the letter, +12 px over
 * 0.2 s). Ice fill, cobalt stroke, navy outer stroke. (x, y) = the word's centre baseline; t0 = when the first glyph
 * starts. Screen space.
 */
export function gustTitle(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, t: number, t0: number, o: GustTitleOpts = {}) {
  const st = o.stagger ?? 0.05;
  const D = o.dur ?? 0.18;
  ctx.save();
  ctx.font = `${size}px ${TITLE_FONT}`;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'center';
  const ws = [...text].map((c) => ctx.measureText(c).width + size * 0.03);
  const total = ws.reduce((p, q) => p + q, 0);
  let cx = x - total / 2;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const gx = cx + ws[i] / 2;
    cx += ws[i];
    const lt = t - t0 - i * st;
    if (lt <= 0 || c === ' ') continue;
    const u = clamp(lt / D);
    const px = lerp(o.fromX ?? -size, gx, ease.outCubic(u));
    const flut = u < 1 ? Math.sin(lt * TAU * 7) * (1 - u) : 0;
    const snap = u < 1 ? 0 : clamp((lt - D) / (2 / 60));
    const shear = u < 1 ? 0.5 * (1 - u * 0.4) + 0.15 * flut : 0.3 * (1 - snap);
    const sc = u < 1 ? 1 : lerp(1.1, 1, snap);
    const py = y + flut * size * 0.12;
    ctx.save();
    ctx.translate(px, py);
    ctx.transform(1, 0, -shear, 1, 0, 0);
    ctx.scale(sc, sc);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = o.outer ?? HEX.navy;
    ctx.lineWidth = size * 0.1;
    ctx.strokeText(c, 0, 0);
    ctx.strokeStyle = o.stroke ?? HEX.cobalt;
    ctx.lineWidth = 4;
    ctx.strokeText(c, 0, 0);
    ctx.fillStyle = o.fill ?? HEX.ice;
    ctx.fillText(c, 0, 0);
    ctx.restore();
    // The isobar echo: two contour lines tracing the letter, expanding 12 px over 0.2 s.
    const e = lt - D;
    if (e > 0 && e < 0.2) {
      const k = e / 0.2;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = HEX.ice;
      ctx.lineWidth = 1;
      for (const off of [0, 5]) {
        const g = 1 + ((12 * k + off) * 2) / size;
        ctx.globalAlpha = (1 - k) * 0.8;
        ctx.save();
        ctx.translate(gx, y - size * 0.35);
        ctx.scale(g, g);
        ctx.strokeText(c, 0, size * 0.35);
        ctx.restore();
      }
      ctx.restore();
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- 27. the thunder wall

/** One refraction ring (UV centre, y down; radius in screen heights as the shock shader measures it). */
export interface ThunderRing {
  x: number;
  y: number;
  r: number;
  s: number;
}

export type ThunderOpts =
  /** 7b: the wall racing in from the left. e = the leading edge's UV x; s = strength of ring A. */
  | { kind: 'side'; e: number; s: number; alpha?: number; curtain?: number }
  /** 8a: the reverse angle: one ring centred on the frame, imploding (r 1.30 -> 0.55). */
  | { kind: 'reverse'; r: number; s: number; alpha?: number };

/**
 * The thunder wall (no shader of its own): pushes 1-3 large-radius shock rings through pushShock (the existing 4 slots)
 * and draws the canvas iceEdge (and, for the side view, the dust/dew curtain behind it). Screen space. Returns the
 * rings it pushed (ring A first).
 */
export function thunderWall(fx: FxState, ctx: CanvasRenderingContext2D, t: number, o: ThunderOpts): ThunderRing[] {
  const rings: ThunderRing[] = [];
  if (o.kind === 'side') {
    const cy = 0.55, cx = -2.0;
    for (const [de, k] of [[0, 1], [-0.05, 0.6], [-0.1, 0.35]] as const) rings.push({ x: cx, y: cy, r: (o.e + de - cx) * (VW / VH), s: o.s * k });
  } else rings.push({ x: 0.5, y: 0.5, r: o.r, s: o.s });
  fx.shockWidth = 0.05;
  for (const r of rings) pushShock(fx, { x: r.x, y: r.y, r: r.r, s: r.s });
  if (o.kind === 'side' && (o.curtain ?? 0) > 0) dustCurtain(ctx, rings[0], o.curtain!, t, o.alpha ?? 1);
  iceEdge(ctx, rings[0], o.alpha ?? 1, o.kind === 'reverse');
  return rings;
}

/** Screen x of a ring's leading (right) edge on row y (px), or null where the circle does not reach that row. */
export function ringEdgeX(ring: ThunderRing, y: number): number | null {
  const cx = ring.x * VW, cy = ring.y * VH, R = ring.r * VH;
  const dy = y - cy;
  if (Math.abs(dy) > R) return null;
  return cx + Math.sqrt(R * R - dy * dy);
}

/** The thunder wall's 1-2 px ice edge line on the ring's circle (additive over a 3 px navy halo, steady). */
export function iceEdge(ctx: CanvasRenderingContext2D, ring: ThunderRing, a = 1, full = false) {
  if (full) {
    // Reverse angle: the whole circle.
    const cx = ring.x * VW, cy = ring.y * VH, R = ring.r * VH;
    ctx.globalAlpha = 0.5 * a;
    ctx.strokeStyle = NAVY;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.stroke();
    withComp(ctx, 'lighter', () => {
      ctx.globalAlpha = 0.9 * a;
      ctx.strokeStyle = ICE;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.stroke();
    });
    return;
  }
  for (let y = 0; y < VH; y += 1) {
    const x = ringEdgeX(ring, y);
    if (x === null || x < -4 || x > VW + 4) continue;
    ctx.globalAlpha = 0.5 * a;
    ctx.fillStyle = NAVY;
    ctx.fillRect(Math.round(x) - 2, y, 4, 1);
  }
  withComp(ctx, 'lighter', () => {
    ctx.fillStyle = ICE;
    for (let y = 0; y < VH; y += 1) {
      const x = ringEdgeX(ring, y);
      if (x === null || x < -4 || x > VW + 4) continue;
      ctx.globalAlpha = 0.9 * a;
      ctx.fillRect(Math.round(x), y, y % 7 === 0 ? 1 : 2, 1);
    }
  });
}

/**
 * The dust/dew curtain behind the thunder wall's edge: 'storm' smoke (normal blend) and vapour puffs locked to the ice line,
 * h px tall from the bottom of the frame (40 -> 240), its top torn by noise. Deterministic (no particles).
 */
export function dustCurtain(ctx: CanvasRenderingContext2D, ring: ThunderRing, h: number, t: number, a = 1) {
  const ph = Math.floor(t * 20);
  for (let i = 0; i < 40; i++) {
    const y = VH - hash(i * 2.3) * h;
    const x = ringEdgeX(ring, y);
    if (x === null) continue;
    const back = hash(i * 5.7) * 60 + 6;
    const s = 10 + hash(i * 3.1 + ph * 0.01) * 22;
    const torn = y < VH - h * 0.8 ? 0.5 : 1;
    ctx.globalAlpha = clamp(a * 0.55 * torn);
    ctx.drawImage(softSprite('storm', 0.3 + hash(i) * 0.4), x - back - s, y - s, s * 2, s * 2);
    ctx.globalAlpha = clamp(a * 0.35 * torn);
    ctx.drawImage(softSprite('vapor', 0.15), x - back * 0.5 - s * 0.6, y - s * 0.6, s * 1.2, s * 1.2);
  }
  ctx.globalAlpha = 1;
}
