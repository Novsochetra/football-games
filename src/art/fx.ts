// Drawing helpers for anime-style effects: focus lines, ribbons, cracks, arcs,
// lens flares, letterbox, and the slammed title lettering.

import { Rng, TAU, clamp, lerp, ease } from '../engine/math';
import { VW, VH } from '../engine/camera';
import { drawGlow, glowOf } from '../engine/particles';

/** Anime focus lines converging on (cx,cy). Re-randomized each call via rng for flicker. */
export function focusLines(
  ctx: CanvasRenderingContext2D, rng: Rng, cx: number, cy: number,
  rIn: number, rOut: number, count: number, color: string, alpha: number, thick = 3,
) {
  if (alpha <= 0) return;
  ctx.globalAlpha = clamp(alpha);
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < count; i++) {
    const a = rng.next() * TAU;
    const w = (rng.next() * 0.8 + 0.2) * thick * 0.004;
    const r0 = rIn * (0.8 + rng.next() * 0.6);
    ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    ctx.lineTo(cx + Math.cos(a - w) * rOut, cy + Math.sin(a - w) * rOut);
    ctx.lineTo(cx + Math.cos(a + w) * rOut, cy + Math.sin(a + w) * rOut);
    ctx.closePath();
  }
  ctx.fill();
  ctx.globalAlpha = 1;
}

/** Parallel speed streaks moving along angle `ang`. */
export function speedStreaks(
  ctx: CanvasRenderingContext2D, rng: Rng, x0: number, y0: number, w: number, h: number,
  ang: number, count: number, color: string, alpha: number, len = 80,
) {
  if (alpha <= 0) return;
  const dx = Math.cos(ang), dy = Math.sin(ang);
  ctx.strokeStyle = color;
  for (let i = 0; i < count; i++) {
    const x = x0 + rng.next() * w, y = y0 + rng.next() * h;
    const l = len * (0.4 + rng.next());
    ctx.globalAlpha = clamp(alpha * (0.3 + rng.next() * 0.7));
    ctx.lineWidth = rng.next() < 0.2 ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx * l, y + dy * l);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export interface TrailPt {
  x: number;
  y: number;
}

/** Tapered ribbon along a polyline (head = last point). Draw with 'lighter' for energy trails. */
export function ribbon(ctx: CanvasRenderingContext2D, pts: TrailPt[], w0: number, w1: number, color: string, alpha: number) {
  const n = pts.length;
  if (n < 2 || alpha <= 0) return;
  const L: [number, number][] = [], R: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b.x - a.x, dy = b.y - a.y;
    const l = Math.hypot(dx, dy) || 1;
    dx /= l;
    dy /= l;
    const t = i / (n - 1);
    const w = lerp(w0, w1, t) * 0.5;
    L.push([pts[i].x - dy * w, pts[i].y + dx * w]);
    R.push([pts[i].x + dy * w, pts[i].y - dx * w]);
  }
  ctx.globalAlpha = clamp(alpha);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(L[0][0], L[0][1]);
  for (let i = 1; i < n; i++) ctx.lineTo(L[i][0], L[i][1]);
  for (let i = n - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

/** Jagged crack polylines radiating from a point (generated once, grown over time). */
export function makeCracks(rng: Rng, n: number, len: number, squash = 0.35) {
  const out: { pts: [number, number][]; at: number }[] = [];
  for (let i = 0; i < n; i++) {
    const base = (i / n) * TAU + rng.range(-0.3, 0.3);
    const pts: [number, number][] = [[0, 0]];
    let a = base, x = 0, y = 0;
    const L = len * rng.range(0.5, 1.1);
    const steps = 9;
    for (let s = 0; s < steps; s++) {
      a += rng.range(-0.6, 0.6);
      const step = L / steps;
      x += Math.cos(a) * step;
      y += Math.sin(a) * step * squash;
      pts.push([x, y]);
    }
    out.push({ pts, at: rng.range(0, 0.35) });
    // branch
    if (rng.next() < 0.6) {
      const k = rng.int(3, 6);
      const bp: [number, number][] = [pts[k]];
      let bx = pts[k][0], by = pts[k][1], ba = base + rng.sign() * 0.9;
      for (let s = 0; s < 4; s++) {
        ba += rng.range(-0.5, 0.5);
        bx += Math.cos(ba) * L / 12;
        by += Math.sin(ba) * (L / 12) * squash;
        bp.push([bx, by]);
      }
      out.push({ pts: bp, at: 0.3 + rng.range(0, 0.3) });
    }
  }
  return out;
}

export function drawCracks(
  ctx: CanvasRenderingContext2D, cracks: ReturnType<typeof makeCracks>, x: number, y: number,
  grow: number, glow: number,
) {
  for (const c of cracks) {
    const g = clamp((grow - c.at) / (1 - c.at));
    if (g <= 0) continue;
    const n = Math.max(2, Math.ceil(c.pts.length * g));
    const path = () => {
      ctx.beginPath();
      ctx.moveTo(x + c.pts[0][0], y + c.pts[0][1]);
      for (let i = 1; i < n; i++) ctx.lineTo(x + c.pts[i][0], y + c.pts[i][1]);
    };
    ctx.lineJoin = 'miter';
    ctx.strokeStyle = '#120608';
    ctx.lineWidth = 3;
    path();
    ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(255,${(120 + 100 * glow) | 0},60,${0.5 + 0.5 * glow})`;
    ctx.lineWidth = 1.2;
    path();
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }
}

/** Crackling energy arc between two points. */
export function arc(ctx: CanvasRenderingContext2D, rng: Rng, x0: number, y0: number, x1: number, y1: number, jag: number, color: string, w = 1.5) {
  const n = 8;
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  const dx = x1 - x0, dy = y1 - y0;
  const l = Math.hypot(dx, dy) || 1;
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const o = rng.range(-jag, jag);
    ctx.lineTo(x0 + dx * t + (-dy / l) * o, y0 + dy * t + (dx / l) * o);
  }
  ctx.lineTo(x1, y1);
  ctx.stroke();
}

/** Anamorphic lens flare: horizontal streak + core + ghosts toward screen center. */
export function lensFlare(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, a: number, tint: [number, number, number] = [150, 220, 255]) {
  if (a <= 0) return;
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(tint), x, y, size, a * 0.9, 9, 0.12);
  drawGlow(ctx, glowOf([255, 255, 255]), x, y, size * 0.35, a, 6, 0.08);
  drawGlow(ctx, glowOf([255, 250, 235]), x, y, size * 0.45, a);
  drawGlow(ctx, glowOf(tint), x, y, size * 0.3, a * 0.6, 0.15, 3);
  const cx = VW / 2, cy = VH / 2;
  for (const [k, r, al] of [[0.5, 0.2, 0.25], [1.3, 0.12, 0.3], [1.7, 0.35, 0.12]] as const) {
    drawGlow(ctx, glowOf(tint), lerp(x, cx, k), lerp(y, cy, k), size * r, a * al);
  }
  ctx.globalCompositeOperation = 'source-over';
}

/** Four-point sparkle (eye glint). */
export function sparkle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: number, rot = 0) {
  if (a <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = clamp(a);
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.12, 0);
    ctx.lineTo(-r * 0.12, 0);
    ctx.closePath();
    ctx.fill();
  }
  drawGlow(ctx, glowOf([200, 240, 255]), 0, 0, r * 0.5, a);
  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

/** Cinematic letterbox bars (amount 0..1). Drawn in screen space. */
export function letterbox(ctx: CanvasRenderingContext2D, amount: number, h = 34) {
  if (amount <= 0) return;
  const b = Math.round(h * amount);
  ctx.fillStyle = '#000';
  ctx.fillRect(-10, -10, VW + 20, b + 10);
  ctx.fillRect(-10, VH - b, VW + 20, b + 10);
}

export const TITLE_FONT = '"Anton", "Impact", "Arial Narrow Bold", sans-serif';
export const PIXEL_FONT = '"Silkscreen", "Press Start 2P", monospace';

/**
 * Slammed anime title. Each letter drops in from large scale with a stagger.
 * t = seconds since title start.
 */
export function slamTitle(
  ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, t: number,
  opts: { stagger?: number; fill?: string; stroke?: string; outer?: string; skew?: number; align?: 'center' | 'left'; glow?: string } = {},
) {
  const stagger = opts.stagger ?? 0.045;
  const skew = opts.skew ?? -0.22;
  ctx.save();
  ctx.font = `${size}px ${TITLE_FONT}`;
  ctx.textBaseline = 'alphabetic';
  const widths = [...text].map((c) => ctx.measureText(c).width + size * 0.02);
  const total = widths.reduce((a, b) => a + b, 0);
  let cx = opts.align === 'left' ? x : x - total / 2;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const lt = t - i * stagger;
    const w = widths[i];
    if (lt > 0 && c !== ' ') {
      const p = clamp(lt / 0.16);
      const s = lerp(2.6, 1, ease.outCubic(p));
      const a = clamp(lt / 0.06);
      ctx.save();
      ctx.translate(cx + w / 2, y);
      ctx.transform(1, 0, skew, 1, 0, 0);
      ctx.scale(s, s);
      ctx.globalAlpha = a;
      ctx.lineJoin = 'round';
      ctx.textAlign = 'center';
      if (opts.outer) {
        ctx.strokeStyle = opts.outer;
        ctx.lineWidth = size * 0.26;
        ctx.strokeText(c, 0, 0);
      }
      ctx.strokeStyle = opts.stroke ?? '#b3121f';
      ctx.lineWidth = size * 0.13;
      ctx.strokeText(c, 0, 0);
      const g = ctx.createLinearGradient(0, -size * 0.8, 0, 0);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.55, opts.fill ?? '#fff3c4');
      g.addColorStop(1, '#ffb43a');
      ctx.fillStyle = g;
      ctx.fillText(c, 0, 0);
      // impact flash on landing
      if (p < 1) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = (1 - p) * 0.8;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(c, 0, 0);
      }
      ctx.restore();
    }
    cx += w;
  }
  ctx.restore();
}

export function pixelText(
  ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color: string,
  align: CanvasTextAlign = 'left', shadow = '#180411',
) {
  ctx.save();
  ctx.font = `${size}px ${PIXEL_FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.fillStyle = shadow;
  ctx.fillText(text, x + 1, y + 1);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

// ---------------------------------------------------------------- Crescent (CRIMSON CRESCENT)

/**
 * Tapered crescent slash along a circular arc from angle a0 to a1 (radians, canvas convention).
 * Thick in the middle, pointed at both ends; the outer edge rides the circle, the body bulges
 * inward like a moon crescent. progress 0..1 grows it from a0 toward a1 (the leading tip stays sharp).
 */
export function crescentArc(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, a0: number, a1: number,
  thick: number, progress = 1, alpha = 1,
) {
  const p = clamp(progress);
  if (p <= 0.001 || alpha <= 0) return;
  const N = 56;
  const layer = (wMul: number, color: string, a: number, inset: number) => {
    ctx.globalAlpha = clamp(a * alpha);
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const u = (i / N) * p;
      const ang = a0 + (a1 - a0) * u;
      const rr = r + inset;
      ctx[i ? 'lineTo' : 'moveTo'](cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr);
    }
    for (let i = N; i >= 0; i--) {
      const u = (i / N) * p;
      const ang = a0 + (a1 - a0) * u;
      const w = thick * wMul * Math.pow(Math.sin(Math.PI * (u / p)), 0.75);
      const rr = r + inset - w;
      ctx.lineTo(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr);
    }
    ctx.closePath();
    ctx.fill();
  };
  // Body in normal blending so it stays crimson over blue night skies; hot core additive.
  ctx.globalCompositeOperation = 'source-over';
  layer(1.9, 'rgb(120,4,24)', 0.45, thick * 0.45);
  layer(1.3, 'rgb(214,18,40)', 0.85, thick * 0.18);
  ctx.globalCompositeOperation = 'lighter';
  layer(0.85, 'rgb(255,70,60)', 0.6, 0);
  layer(0.38, 'rgb(250,248,255)', 0.95, -thick * 0.06);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

/**
 * Moon-crescent shape path (circle of radius r minus the same circle offset by `bite`*r
 * toward angle `rot`). Call ctx.fill()/clip() after. bite 0..2 (0.3 = fat, 1.2 = thin).
 */
export function crescentPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, bite: number, rot: number) {
  const d = Math.max(0.01, Math.min(1.98, bite)) * r;
  const phi = Math.acos(d / (2 * r));
  const N = 48;
  ctx.beginPath();
  // Outer arc: the side away from the bite.
  for (let i = 0; i <= N; i++) {
    const a = rot + phi + ((Math.PI * 2 - 2 * phi) * i) / N;
    ctx[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  // Inner arc: the biting circle's edge, back to the start.
  const bx = cx + Math.cos(rot) * d, by = cy + Math.sin(rot) * d;
  // Seen from the biting circle's center, the intersections sit at rot+PI±phi; the arc
  // inside the outer circle is the one facing back toward (cx,cy).
  const start = rot + Math.PI + phi;
  for (let i = 0; i <= N; i++) {
    const a = start - (2 * phi * i) / N;
    ctx.lineTo(bx + Math.cos(a) * r, by + Math.sin(a) * r);
  }
  ctx.closePath();
}
