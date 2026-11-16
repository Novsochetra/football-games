// SPOTLIGHT SOLO v2: torn turf (SPEC.md §10.5 items 22-25): light gashes (claw rips with UV shafts pouring up out of the
// wound; B's dark furrow; the bare sod-carpet strip; C's spiral; the nutmeg line; the twin brake rips; the crack star on
// the spot), the fuse, turfRip (sods, crumbs, blades, divots at the lens) and the sod carpet peeling and rolling up.
// Gashes are pure functions of the global time (from ./world); turfRip spawns particles (call it from cues / update).

import type { Env } from '../timeline';
import { clamp, lerp, type RGB } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import { PAL, GRID0 } from './common';
import type { Gash } from './world';
import type { Project } from './print';

const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${clamp(a)})`;
const h01 = (i: number, s: number) => {
  const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

export interface GashOpts {
  /** Age-dimming override (default: shafts 1.0 -> 0.45 over 4 s of age). */
  dim?: number;
  /** Fuse eruption 0..1 (worldAt's erupt): shafts blaze to 140 px, the core flares. */
  erupt?: number;
  /** Shaft height in screen px (default 60-140 x clamp(s / 3, 0.25, 1)). */
  shaftPx?: number;
  /** Overall alpha (the crane's far route dims). */
  a?: number;
  /** Skip the shafts (a clean money frame). */
  noShafts?: boolean;
}

/**
 * Draw one gash (see ./world GASHES) through `project` at global time gt: the claw rips (ragged torn-grass lips,
 * soil walls, a dark floor and a volt core line), standing sods at the ends, and 3-6 UV shafts (additive volt over a
 * uvDeep base, flickering ±15 % on the 8ths, dimming with age). Kinds: claw, furrow (dark, no light), carpet (the bare
 * strip leaking UV), spiral, line, brake (twin), star. Works in side, front and back pitch views and the crane: every
 * point goes through the projector.
 */
export function lightGash(ctx: CanvasRenderingContext2D, gs: Gash, project: Project, gt: number, o: GashOpts = {}) {
  const age = gt - gs.born;
  if (age < 0) return;
  const open = clamp(age / Math.max(0.05, gs.grow ?? 0.05));
  const A = o.a ?? 1;
  const erupt = clamp(o.erupt ?? 0);
  const dim = o.dim ?? lerp(1, 0.45, clamp(age / 4));
  const beat8 = Math.floor((gt - GRID0) / 0.2 + 1e-6);
  const flick = 1 + 0.15 * (beat8 % 2 ? 1 : -1) * (h01(beat8, gs.x) > 0.5 ? 1 : 0.5);
  const cx = Math.cos(gs.dir), cz = Math.sin(gs.dir);
  const px = -cz, pz = cx;
  const dark = gs.kind === 'furrow';
  ctx.save();
  const rips: { x0: number; z0: number; len: number; w: number }[] = [];
  if (gs.kind === 'claw' || gs.kind === 'line' || gs.kind === 'brake' || gs.kind === 'furrow') {
    const n = gs.kind === 'brake' ? 2 : gs.claws;
    const sp = gs.kind === 'brake' ? 2.4 : gs.kind === 'furrow' ? 1.4 : 1.6;
    for (let i = 0; i < n; i++) {
      const off = (i - (n - 1) / 2) * sp;
      const fan = gs.kind === 'claw' ? (i - (n - 1) / 2) * 0.12 : 0;
      const l = gs.len * open * (0.85 + 0.15 * h01(i, gs.x + gs.z));
      rips.push({ x0: gs.x + px * off, z0: gs.z + pz * off, len: l, w: gs.kind === 'furrow' ? 1.6 : gs.kind === 'line' ? 0.5 : 0.8 });
      void fan;
    }
  }
  const P = (x: number, z: number, h = 0) => project(x, z, h);
  // Rips: a ragged quad from start to end, three tones from the outside in.
  for (const r of rips) {
    const ex = r.x0 + cx * r.len, ez = r.z0 + cz * r.len;
    const quad = (w: number, c: string) => {
      const n = 6;
      ctx.fillStyle = c;
      ctx.beginPath();
      for (let k = 0; k <= n; k++) {
        const u = k / n;
        const jag = (h01(k, r.x0) - 0.5) * 0.5;
        const ww = w * (1 - Math.abs(u - 0.5) * 0.9) + jag * w * 0.3;
        const p = P(lerp(r.x0, ex, u) + px * ww, lerp(r.z0, ez, u) + pz * ww);
        k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
      }
      for (let k = n; k >= 0; k--) {
        const u = k / n;
        const jag = (h01(k + 9, r.x0) - 0.5) * 0.5;
        const ww = w * (1 - Math.abs(u - 0.5) * 0.9) + jag * w * 0.3;
        const p = P(lerp(r.x0, ex, u) - px * ww, lerp(r.z0, ez, u) - pz * ww);
        ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.fill();
    };
    ctx.globalAlpha = A;
    ctx.globalCompositeOperation = 'source-over';
    quad(r.w * 1.6, rgba(PAL.torn, 1));
    quad(r.w * 1.1, rgba(PAL.soil, 1));
    quad(r.w * 0.6, rgba(PAL.soilDeep, 1));
    if (!dark) {
      // The volt core line (additive), flaring with the fuse.
      const a = P(r.x0, r.z0), b = P(ex, ez);
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = rgba(PAL.volt, (0.75 + 0.25 * erupt) * A * dim * flick);
      ctx.lineWidth = Math.max(1, 0.35 * Math.min(a.s, b.s));
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.strokeStyle = rgba(PAL.spot, 0.5 * A * dim * (0.6 + erupt));
      ctx.lineWidth = Math.max(1, 0.15 * Math.min(a.s, b.s));
      ctx.stroke();
    }
    // Standing sods at the ends.
    ctx.globalCompositeOperation = 'source-over';
    for (const [x, z] of [[ex + cx * 0.6, ez + cz * 0.6], [r.x0 - cx * 0.4, r.z0 - cz * 0.4]] as const) {
      const p = P(x, z);
      const w = Math.max(1, 0.9 * p.s), hh = Math.max(1, 0.5 * p.s);
      ctx.fillStyle = HEXS.soil;
      ctx.fillRect(p.x - w / 2, p.y - hh, w, hh);
      ctx.fillStyle = HEXS.torn;
      ctx.fillRect(p.x - w / 2, p.y - hh - Math.max(1, hh * 0.35), w, Math.max(1, hh * 0.35));
    }
  }
  if (gs.kind === 'spiral') {
    // C's pivot: a swirl of torn blades round a dark divot.
    const c = P(gs.x, gs.z);
    const R = gs.len * 0.5 * open;
    ctx.globalAlpha = A;
    ctx.fillStyle = HEXS.soilDeep;
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, Math.max(1, R * c.s * 0.6), Math.max(1, R * c.s * 0.6 * Math.max(0.15, c.k ?? 0.4)), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = HEXS.torn;
    ctx.lineWidth = Math.max(1, 0.3 * c.s);
    for (let i = 0; i < 10; i++) {
      const a0 = (i / 10) * Math.PI * 2;
      const p0 = P(gs.x + Math.cos(a0) * R * 0.6, gs.z + Math.sin(a0) * R * 0.6), p1 = P(gs.x + Math.cos(a0 + 0.9) * R, gs.z + Math.sin(a0 + 0.9) * R);
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.volt), c.x, c.y, Math.max(3, R * c.s * 0.5), 0.6 * A * dim * flick);
  }
  if (gs.kind === 'star') {
    // The crack star in the spot mark: four short rips, light in each.
    const c = P(gs.x, gs.z);
    ctx.globalAlpha = A;
    for (let i = 0; i < 4; i++) {
      const a0 = Math.PI / 4 + (i * Math.PI) / 2;
      const e = P(gs.x + Math.cos(a0) * gs.len * open, gs.z + Math.sin(a0) * gs.len * open);
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = HEXS.soilDeep;
      ctx.lineWidth = Math.max(1, 0.6 * c.s);
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(e.x, e.y);
      ctx.stroke();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = rgba(PAL.lilac, 0.8 * A * dim);
      ctx.lineWidth = Math.max(1, 0.2 * c.s);
      ctx.stroke();
    }
  }
  if (gs.kind === 'carpet') {
    // The bare strip under the peeled sod carpet: soil with an ultraviolet leak along it.
    const len = gs.len * open;
    const a = P(gs.x, gs.z - 1.5), b = P(gs.x + len, gs.z - 1.5), c2 = P(gs.x + len, gs.z + 1.5), d = P(gs.x, gs.z + 1.5);
    ctx.globalAlpha = A;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = HEXS.soilDeep;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c2.x, c2.y);
    ctx.lineTo(d.x, d.y);
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    const m = P(gs.x + len / 2, gs.z);
    drawGlow(ctx, glowOf(PAL.uv), m.x, m.y, Math.max(6, len * m.s * 0.6), 0.45 * A * dim * flick, 1, 0.35);
  }
  // UV shafts pouring up out of the wound (additive volt over a uvDeep base); none in a dark furrow.
  if (!dark && !o.noShafts && gs.shafts > 0) {
    for (let i = 0; i < gs.shafts; i++) {
      const u = (i + 0.5) / gs.shafts;
      const off = (h01(i, gs.z) - 0.5) * gs.claws * 1.2;
      const base = P(gs.x + cx * gs.len * open * u + px * off, gs.z + cz * gs.len * open * u + pz * off);
      const sc = clamp(base.s / 3, 0.25, 1);
      const H = (o.shaftPx ?? lerp(60, 140, h01(i, gs.x)) * sc) * (1 + erupt * 1.2) * open;
      const w = Math.max(1.5, lerp(3, 7, h01(i, gs.x + 1)) * sc * (1 + erupt));
      const k = A * dim * flick * (0.55 + 0.45 * h01(i, gs.x + 2)) * (1 + erupt);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = clamp(0.35 * A);
      ctx.fillStyle = HEXS.uvDeep;
      ctx.fillRect(base.x - w, base.y - H, w * 2, H);
      ctx.globalCompositeOperation = 'lighter';
      const gr = ctx.createLinearGradient(0, base.y, 0, base.y - H);
      gr.addColorStop(0, rgba(PAL.spot, 0.55 * k));
      gr.addColorStop(0.25, rgba(PAL.volt, 0.5 * k));
      gr.addColorStop(1, rgba(PAL.volt, 0));
      ctx.globalAlpha = 1;
      ctx.fillStyle = gr;
      ctx.fillRect(base.x - w / 2, base.y - H, w, H);
    }
  }
  ctx.restore();
}

const HEXS = { soil: '#4A3424', soilDeep: '#22160F', torn: '#3C8A3A', uvDeep: '#2A1660' } as const;

/**
 * turfRip: turf torn by studs (particles, screen or world space as the caller draws env.parts). PK.Sod slabs (6-10 px,
 * torn top / soil underside, tumbling, bouncing once on `ground`), soil crumbs (PK.Pixel 'sod'), grass blades (PK.Blade);
 * with lens, 1-2 divots (40 px) tumble past the camera. dir = the spray's mean direction (rad, screen; -pi/2 = up).
 * Counts scale with power (1.5 = 24 sods, 60 crumbs, 80 blades).
 */
export function turfRip(env: Env, x: number, y: number, dir: number, power: number, o: { lens?: boolean; ground?: number; spread?: number } = {}) {
  const { rng, parts } = env;
  const k = power / 1.5;
  const ground = o.ground ?? y + 4;
  const spr = o.spread ?? 1.4;
  for (let i = 0; i < Math.round(24 * k); i++) {
    const a = dir + rng.range(-spr / 2, spr / 2), sp = rng.range(150, 420) * Math.min(1.6, 0.6 + power * 0.4);
    parts.spawn({
      kind: PK.Sod, x: x + rng.range(-6, 6), y: y + rng.range(-3, 3), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, ay: 1100, drag: 0.4,
      vrot: rng.range(-14, 14), rot: rng.range(0, 6.28), max: rng.range(0.9, 1.6), s0: rng.range(6, 10), s1: rng.range(5, 8),
      a0: 1, a1: 0.9, k: ground + rng.range(-2, 6), layer: 1,
    });
  }
  for (let i = 0; i < Math.round(60 * k); i++) {
    const a = dir + rng.range(-spr * 0.6, spr * 0.6), sp = rng.range(80, 360);
    parts.spawn({
      kind: PK.Pixel, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, ay: 900, drag: 1, max: rng.range(0.4, 0.9), s0: rng.range(1, 2.5), s1: 1,
      ramp: 'sod', r0: rng.range(0.4, 0.8), r1: 1, a0: 1, a1: 0.6, add: false, layer: 1,
    });
  }
  for (let i = 0; i < Math.round(80 * k); i++) {
    const a = dir + rng.range(-spr * 0.7, spr * 0.7), sp = rng.range(100, 380);
    parts.spawn({
      kind: PK.Blade, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, ay: 700, drag: 1.2, vrot: rng.range(-20, 20), rot: rng.range(0, 6.28),
      max: rng.range(0.5, 1.1), s0: rng.range(3, 5), s1: 3, ramp: 'grass', r0: 0, r1: 1, a0: 1, a1: 0.5, add: false, layer: 1,
    });
  }
  if (o.lens) {
    const n = 1 + (rng.next() < 0.5 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      // A 40 px divot flying past the lens: big, fast, tumbling toward the viewer (off the bottom / side of frame).
      const a = dir + rng.range(-0.3, 0.3), sp = rng.range(600, 900);
      parts.spawn({
        kind: PK.Sod, x: x + rng.range(-20, 20), y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp + 200, ay: 1400, drag: 0.2,
        vrot: rng.range(-10, 10), max: 0.5, s0: 30, s1: 48, a0: 1, a1: 1, layer: 1,
      });
    }
  }
}

/** A path for the sod carpet in screen px: the strip from (x0, y0) to (x1, y1), w px wide. */
export interface CarpetPath {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  w: number;
}

/**
 * The sod carpet (B's slide peels a 3 m strip): `roll` 0..1 of the strip has peeled; behind the peel front the bare
 * soil leaks ultraviolet light; at the front the roll (soil side up, radius 6 -> 12 px as it grows); beyond, the turf.
 * t = clock for the leak's flicker. Screen space (or world px in the caller's transform).
 */
export function sodCarpet(ctx: CanvasRenderingContext2D, path: CarpetPath, roll: number, t: number) {
  const u = clamp(roll);
  if (u <= 0) return;
  const fx = lerp(path.x0, path.x1, u), fy = lerp(path.y0, path.y1, u);
  const dx = path.x1 - path.x0, dy = path.y1 - path.y0;
  const L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L, hw = path.w / 2;
  ctx.save();
  // The bare strip: soil deep, with a UV leak along it.
  ctx.fillStyle = HEXS.soilDeep;
  ctx.beginPath();
  ctx.moveTo(path.x0 + nx * hw, path.y0 + ny * hw);
  ctx.lineTo(fx + nx * hw, fy + ny * hw);
  ctx.lineTo(fx - nx * hw, fy - ny * hw);
  ctx.lineTo(path.x0 - nx * hw, path.y0 - ny * hw);
  ctx.closePath();
  ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  const fl = 0.85 + 0.15 * Math.sin(t * 31);
  for (let i = 0; i < 5; i++) {
    const v = (i + 0.5) / 5;
    drawGlow(ctx, glowOf(PAL.uv), lerp(path.x0, fx, v), lerp(path.y0, fy, v), hw * 2.2, 0.35 * fl);
  }
  ctx.strokeStyle = rgba(PAL.volt, 0.7 * fl);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(path.x0, path.y0);
  ctx.lineTo(fx, fy);
  ctx.stroke();
  // The roll at the peel front: a soil-side-up cylinder, growing 6 -> 12 px.
  ctx.globalCompositeOperation = 'source-over';
  const R = lerp(6, 12, u);
  ctx.fillStyle = HEXS.soil;
  ctx.beginPath();
  ctx.ellipse(fx, fy - R * 0.6, R, R * 0.8, Math.atan2(dy, dx), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = HEXS.torn;
  ctx.beginPath();
  ctx.ellipse(fx, fy - R * 0.6, R * 0.55, R * 0.45, Math.atan2(dy, dx), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = HEXS.soilDeep;
  ctx.beginPath();
  ctx.ellipse(fx, fy - R * 0.6, R * 0.25, R * 0.2, Math.atan2(dy, dx), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * The fuse's particles (9c): when segment `i` erupts (call from a cue at its time), a burst of sods and UV streaks up to
 * 140 px round (x, y), growing with i as they race toward the camera.
 */
export function fuseBurst(env: Env, x: number, y: number, i: number) {
  turfRip(env, x, y, -Math.PI / 2, 0.25 + 0.04 * i, { spread: 1.8 });
  const { rng, parts } = env;
  for (let k = 0; k < 8 + i * 2; k++) {
    const a = -Math.PI / 2 + rng.range(-0.5, 0.5), sp = rng.range(200, 500);
    parts.spawn({
      kind: PK.Streak, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 3, max: rng.range(0.2, 0.45), s0: 1.5, s1: 0.4,
      ramp: 'uv', r0: 0, r1: 0.8, k: 1.4, layer: 1,
    });
  }
}
