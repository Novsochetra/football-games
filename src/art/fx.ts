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
  opts: {
    stagger?: number; fill?: string; stroke?: string; outer?: string; skew?: number; align?: 'center' | 'left'; glow?: string;
    /** Bottom colour of the fill gradient (default warm orange '#ffb43a'; GALE HAMMER uses an ice/cyan). */
    fill2?: string;
  } = {},
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
      g.addColorStop(1, opts.fill2 ?? '#ffb43a');
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

// ---------------------------------------------------------------- SPOTLIGHT SOLO (stage lettering and HUD)

/** The SPOTLIGHT SOLO palette as CSS colours (the same values as PAL in cinematic/solo/common.ts). */
const SOLO_CSS = { uv: '#7A4DFF', lilac: '#C9B6FF', ivory: '#F6F0DF', uvDeep: '#2A1660', plum: '#160A26' } as const;

export interface LampTitleOpts {
  /** Draw the small lamp and its narrow cone above each lit group (default true). */
  lamps?: boolean;
  /** One frame of +20% brightness on the whole title at this time (the fourth click). */
  flareAt?: number;
  /** Overall alpha (default 1). */
  alpha?: number;
}

/**
 * Stage lettering that lights group by group on a drummer's count (SPOTLIGHT SOLO title, "1 ON 1").
 * `groups` are laid out left to right as one line centred on x with its baseline on y (put the spaces in the
 * groups: ['SPOT', 'LIGHT ', 'SO', 'LO']); group i lights at onTimes[i] (t = the same clock, seconds).
 * - Unlit: a faint plum shape (uvDeep stroke at 30%).
 * - Lit: ivory fill, 2 px ultraviolet stroke, 3 px plum outer stroke, under a small lamp that snaps on above it and
 *   drops a narrow cone of light onto it; a violet echo copy slides 6 px left and fades over 0.2 s.
 * Returns each group's centre x and width (for fx.echo / sparkles). Screen space, no camera.
 */
export function lampTitle(
  ctx: CanvasRenderingContext2D, groups: readonly string[], x: number, y: number, size: number, t: number,
  onTimes: readonly number[], o: LampTitleOpts = {},
): { cx: number; w: number }[] {
  ctx.save();
  ctx.font = `${size}px ${TITLE_FONT}`;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.lineJoin = 'round';
  const widths = groups.map((g) => ctx.measureText(g).width);
  const total = widths.reduce((a, b) => a + b, 0);
  const out: { cx: number; w: number }[] = [];
  let gx = x - total / 2;
  const A = o.alpha ?? 1;
  const flare = o.flareAt !== undefined && t >= o.flareAt && t < o.flareAt + 1 / 60;
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    const w = widths[i];
    const vis = g.trimEnd();
    const vw = ctx.measureText(vis).width;
    out.push({ cx: gx + vw / 2, w: vw });
    const lt = t - (onTimes[i] ?? Infinity);
    if (!(lt >= 0)) {
      ctx.globalAlpha = 0.3 * A;
      ctx.strokeStyle = SOLO_CSS.uvDeep;
      ctx.lineWidth = 2;
      ctx.strokeText(vis, gx, y);
    } else {
      if (o.lamps ?? true) {
        // The lamp: a small housing above the group with an ivory face, and its narrow cone onto the letters.
        const lx = gx + vw / 2, ly = y - size * 1.12;
        ctx.globalAlpha = A;
        ctx.globalCompositeOperation = 'source-over';
        drawGlow(ctx, glowOf([42, 22, 96]), lx, ly + 2, 12, 0.8 * A);
        ctx.globalCompositeOperation = 'lighter';
        const cone = ctx.createLinearGradient(0, ly, 0, y);
        cone.addColorStop(0, 'rgba(246,240,223,0.22)');
        cone.addColorStop(1, 'rgba(246,240,223,0.03)');
        ctx.fillStyle = cone;
        ctx.globalAlpha = A;
        ctx.beginPath();
        ctx.moveTo(lx - 3, ly + 3);
        ctx.lineTo(lx + 3, ly + 3);
        ctx.lineTo(lx + vw * 0.55, y + 4);
        ctx.lineTo(lx - vw * 0.55, y + 4);
        ctx.closePath();
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = SOLO_CSS.plum;
        ctx.fillRect(Math.round(lx - 6), Math.round(ly - 4), 12, 6);
        ctx.fillStyle = lt < 2 / 60 ? '#ffffff' : SOLO_CSS.ivory;
        ctx.fillRect(Math.round(lx - 4), Math.round(ly), 8, 2);
      }
      // Violet echo copy sliding 6 px left as it fades (behind the letters).
      if (lt < 0.2) {
        ctx.globalAlpha = 0.6 * (1 - lt / 0.2) * A;
        ctx.fillStyle = SOLO_CSS.uv;
        ctx.fillText(vis, gx - 6 * (lt / 0.2), y);
      }
      ctx.globalAlpha = A;
      ctx.strokeStyle = SOLO_CSS.plum;
      ctx.lineWidth = 10;
      ctx.strokeText(vis, gx, y);
      ctx.strokeStyle = SOLO_CSS.uv;
      ctx.lineWidth = 4;
      ctx.strokeText(vis, gx, y);
      ctx.fillStyle = SOLO_CSS.ivory;
      ctx.fillText(vis, gx, y);
      if (lt < 1 / 60 || flare) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = (lt < 1 / 60 ? 0.35 : 0.2) * A;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(vis, gx, y);
        ctx.globalCompositeOperation = 'source-over';
      }
    }
    gx += w;
  }
  ctx.restore();
  return out;
}

export interface LampTitle2Opts {
  /** Width of each group's drop beam at the top of frame (px, default 40). */
  beamW?: number;
  /** Screen y the beams fall from (default -10). */
  beamTop?: number;
  /** The volt Chorus copy's x offset (px, default -10: 10 px to the left). */
  copyDX?: number;
  /** Stroke widths in px: the ultraviolet stroke (default 3) and the plum outer stroke (default 4). */
  stroke?: number;
  outer?: number;
  /** Overall alpha (default 1). */
  alpha?: number;
  /** The beam's held strength after the slam (0..1 of its peak, default 0.22; 0 = it dies after 0.35 s). */
  hold?: number;
  /** Puff of motes on each landing (default true). */
  motes?: boolean;
}

/**
 * SPOTLIGHT SOLO v2 stage lettering: each group is STAMPED by its own narrow drop beam (falling from beamTop in 2
 * frames, 40 px wide at the top, the word's width at the bottom; plum underlay, ivory body, white-hot core) on its
 * time in `onTimes`. The word lands with a vertical squash 60 -> 110 -> 100 % about its baseline (2 frames, then 4), a
 * 1-frame white flash, a puff of lilac motes, and a crisp volt Chorus copy `copyDX` px aside that steps down
 * 0.6 -> 0.4 -> 0.2 -> 0 on the next three 16ths. Ivory fill, `stroke` px ultraviolet stroke, `outer` px plum outer
 * stroke. Used for the title (72 px) and 1 ON 1 / GOAL (130 px). Screen space; a pure function of t. Groups are laid
 * out left to right as one line centred on x (put the spaces in the groups). Returns each group's centre and width.
 */
export function lampTitle2(
  ctx: CanvasRenderingContext2D, groups: readonly string[], x: number, y: number, size: number, t: number,
  onTimes: readonly number[], o: LampTitle2Opts = {},
): { cx: number; w: number }[] {
  const F = 1 / 60;
  ctx.save();
  ctx.font = `${size}px ${TITLE_FONT}`;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.lineJoin = 'round';
  const widths = groups.map((g) => ctx.measureText(g).width);
  const total = widths.reduce((a, b) => a + b, 0);
  const out: { cx: number; w: number }[] = [];
  const A = o.alpha ?? 1;
  const bw = o.beamW ?? 40, top = o.beamTop ?? -10, dxc = o.copyDX ?? -10;
  const sw = o.stroke ?? 3, ow = o.outer ?? 4, hold = o.hold ?? 0.22;
  let gx = x - total / 2;
  for (let i = 0; i < groups.length; i++) {
    const vis = groups[i].trimEnd();
    const vw = ctx.measureText(vis).width;
    const cx = gx + vw / 2;
    out.push({ cx, w: vw });
    const lt = t - (onTimes[i] ?? Infinity);
    if (lt >= 0) {
      // The drop beam: its foot falls from the top of frame onto the baseline in 2 frames, blazes for 3 frames, then
      // holds faintly. Plum underlay (normal), ivory body and a white-hot core (additive).
      const drop = clamp(lt / (2 * F));
      const yb = lerp(top, y + 6, ease.outQuad(drop));
      const k = lt < 5 * F ? 1 : lerp(1, hold, clamp((lt - 5 * F) / 0.3));
      if (k > 0.003) {
        const w1 = Math.max(bw, vw * 1.1);
        const quad = (s: number) => {
          ctx.beginPath();
          ctx.moveTo(cx - (bw / 2) * s, top);
          ctx.lineTo(cx + (bw / 2) * s, top);
          ctx.lineTo(cx + (lerp(bw, w1, drop) / 2) * s, yb);
          ctx.lineTo(cx - (lerp(bw, w1, drop) / 2) * s, yb);
          ctx.closePath();
        };
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.25 * k * A;
        ctx.fillStyle = SOLO_CSS.plum;
        quad(1.15);
        ctx.fill();
        ctx.globalCompositeOperation = 'lighter';
        const gr = ctx.createLinearGradient(0, top, 0, yb);
        gr.addColorStop(0, 'rgba(255,250,236,0.30)');
        gr.addColorStop(1, 'rgba(246,240,223,0.16)');
        ctx.globalAlpha = k * A;
        ctx.fillStyle = gr;
        quad(1);
        ctx.fill();
        ctx.globalAlpha = 0.35 * k * A;
        ctx.fillStyle = '#FFFAEC';
        quad(0.3);
        ctx.fill();
        // Volt edges.
        ctx.globalAlpha = 0.5 * k * A;
        ctx.strokeStyle = '#A880FF';
        ctx.lineWidth = 1;
        quad(1);
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      }
      // The Chorus copy (behind the letters): volt, stepping down on the 16ths.
      const ca = lt < 0.1 ? 0.6 : lt < 0.2 ? 0.4 : lt < 0.3 ? 0.2 : 0;
      if (ca > 0) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = ca * A;
        ctx.fillStyle = '#A880FF';
        ctx.fillText(vis, gx + dxc, y);
        ctx.globalCompositeOperation = 'source-over';
      }
      // The squash about the baseline: 60 % on the hit, 110 % 2 frames later, 100 % from 6 frames.
      const sy = lt < 2 * F ? lerp(0.6, 1.1, lt / (2 * F)) : lt < 6 * F ? lerp(1.1, 1, (lt - 2 * F) / (4 * F)) : 1;
      const sx = 1 / Math.sqrt(sy);
      ctx.save();
      ctx.translate(cx, y);
      ctx.scale(sx, sy);
      ctx.translate(-cx, -y);
      ctx.globalAlpha = A;
      ctx.strokeStyle = SOLO_CSS.plum;
      ctx.lineWidth = 2 * (sw + ow);
      ctx.strokeText(vis, gx, y);
      ctx.strokeStyle = SOLO_CSS.uv;
      ctx.lineWidth = 2 * sw;
      ctx.strokeText(vis, gx, y);
      ctx.fillStyle = SOLO_CSS.ivory;
      ctx.fillText(vis, gx, y);
      if (lt < F) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.4 * A;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(vis, gx, y);
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.restore();
      // Motes puffing out of the landing (seeded per group; a pure function of lt).
      if ((o.motes ?? true) && lt < 0.45) {
        ctx.globalCompositeOperation = 'lighter';
        for (let m = 0; m < 12; m++) {
          const h1 = Math.sin((i + 1) * 91.7 + m * 37.1) * 43758.5453;
          const r1 = h1 - Math.floor(h1);
          const h2 = Math.sin((i + 1) * 13.3 + m * 71.9) * 24634.6345;
          const r2 = h2 - Math.floor(h2);
          const ang = Math.PI + r1 * Math.PI;
          const sp = 40 + 120 * r2;
          const px = cx + (r1 - 0.5) * vw + Math.cos(ang) * sp * lt;
          const py = y - 2 + Math.sin(ang) * sp * lt * 0.6 - 20 * lt;
          ctx.globalAlpha = clamp(0.9 * (1 - lt / 0.45)) * A;
          ctx.fillStyle = m % 3 === 0 ? SOLO_CSS.ivory : SOLO_CSS.lilac;
          ctx.fillRect(Math.round(px), Math.round(py), m % 4 === 0 ? 2 : 1, m % 4 === 0 ? 2 : 1);
        }
        ctx.globalCompositeOperation = 'source-over';
      }
    }
    gx += widths[i];
  }
  ctx.restore();
  return out;
}

/** Marquee tag timing (seconds): slide in 3 frames, hold 0.6 s, fade out 4 frames. */
export const MARQUEE = { slideIn: 3 / 60, hold: 0.6, fadeOut: 4 / 60 } as const;

/**
 * SPOTLIGHT SOLO skill tag ("STEP-OVER", "SOLE LIFT", ...): ivory pixel-font text in a plum pill with a 1 px lilac
 * border and six tiny lamp dots along its top edge that chase on 16ths. (x, y) = the pill's top-left at rest;
 * t = seconds since the tag's beat (it slides in 12 px from the left, holds 0.6 s, fades out). Screen space.
 */
export function marqueeTag(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, t: number) {
  const end = MARQUEE.slideIn + MARQUEE.hold + MARQUEE.fadeOut;
  if (t < 0 || t >= end) return;
  const k = ease.outCubic(clamp(t / MARQUEE.slideIn));
  const a = t > MARQUEE.slideIn + MARQUEE.hold ? clamp((end - t) / MARQUEE.fadeOut) : clamp(t / MARQUEE.slideIn + 0.34);
  ctx.save();
  ctx.font = `12px ${PIXEL_FONT}`;
  const tw = Math.ceil(ctx.measureText(text).width);
  const w = tw + 20, h = 22;
  const px = Math.round(x - 12 * (1 - k)), py = Math.round(y);
  ctx.globalAlpha = a;
  ctx.fillStyle = SOLO_CSS.plum;
  ctx.fillRect(px, py, w, h);
  ctx.strokeStyle = SOLO_CSS.lilac;
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, w - 1, h - 1);
  // Six lamp dots chasing on 16ths along the top edge.
  const lit = Math.floor(t / 0.1 + 1e-6) % 6;
  for (let i = 0; i < 6; i++) {
    const dx = Math.round(px + 6 + (i * (w - 14)) / 5);
    ctx.fillStyle = i === lit ? SOLO_CSS.ivory : SOLO_CSS.uvDeep;
    ctx.fillRect(dx, py - 1, 2, 2);
  }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = SOLO_CSS.uvDeep;
  ctx.fillText(text, px + 11, py + 6);
  ctx.fillStyle = SOLO_CSS.ivory;
  ctx.fillText(text, px + 10, py + 5);
  ctx.restore();
}

export interface FourCountOpts {
  /** Overall alpha (the pads fade in when the spot lands). */
  alpha?: number;
  /** One frame where every lit pad flares ivory (OLÉ! 4). */
  flareAt?: number;
  // ---- SPOTLIGHT SOLO v2 (all optional; omitted = the shipped HUD)
  /** Top-left of the first pad (default 566, 16) and the pad size (default 12; v2's cut-in pads are 16). */
  x?: number;
  y?: number;
  pad?: number;
  /** Every pad, lit or not, flares white for 2 frames from each of these times (the crowd's stomp at the curtain drop). */
  flareAllAt?: number | readonly number[];
}

/**
 * The four-count HUD (SPOTLIGHT SOLO shots 2-6): four 12x12 lamp pads numbered 1-4 at top-right (x 566-622, y 16)
 * on a plum pill. Pad i is unlit (uvDeep, lilac 1 px border, numeral at 40%) until litAt[i]; on that frame it flares
 * ivory, then stays lit (ivory core, plum numeral, a violet glow over a uvDeep halo). Screen space.
 */
export function fourCount(ctx: CanvasRenderingContext2D, litAt: readonly number[], t: number, o: FourCountOpts = {}) {
  const A = o.alpha ?? 1;
  if (A <= 0) return;
  // Geometry (the defaults reproduce the shipped HUD exactly: pads 12 px at (566, 16), 15 px apart, pill 69 x 22).
  const P = o.pad ?? 12, q = P / 12, gap = P + 3;
  const x0 = o.x ?? 566, y0 = o.y ?? 16;
  const fa = o.flareAllAt === undefined ? [] : typeof o.flareAllAt === 'number' ? [o.flareAllAt] : o.flareAllAt;
  const flareAll = fa.some((a) => t >= a - 1e-6 && t < a + 2 / 60 - 1e-6);
  ctx.save();
  ctx.globalAlpha = 0.88 * A;
  ctx.fillStyle = SOLO_CSS.plum;
  ctx.fillRect(x0 - 6, y0 - 5, 3 * gap + P + 12, P + 10);
  ctx.globalAlpha = A;
  ctx.strokeStyle = SOLO_CSS.uvDeep;
  ctx.lineWidth = 1;
  ctx.strokeRect(x0 - 5.5, y0 - 4.5, 3 * gap + P + 11, P + 9);
  ctx.font = `${P === 12 ? 8 : Math.round(8 * q)}px ${PIXEL_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const all = o.flareAt !== undefined && t >= o.flareAt && t < o.flareAt + 1 / 60;
  for (let i = 0; i < 4; i++) {
    const x = x0 + i * gap, y = y0;
    const lt = t - (litAt[i] ?? Infinity);
    const lit = lt >= 0 || flareAll;
    if (!lit) {
      ctx.globalAlpha = A;
      ctx.fillStyle = SOLO_CSS.uvDeep;
      ctx.fillRect(x, y, P, P);
      ctx.strokeStyle = SOLO_CSS.lilac;
      ctx.strokeRect(x + 0.5, y + 0.5, P - 1, P - 1);
      ctx.globalAlpha = 0.4 * A;
      ctx.fillStyle = SOLO_CSS.lilac;
      ctx.fillText(String(i + 1), x + P / 2, y + 2 * q);
      continue;
    }
    const flare = lt < 1 / 60 || all || flareAll;
    ctx.globalAlpha = A;
    ctx.globalCompositeOperation = 'source-over';
    drawGlow(ctx, glowOf([42, 22, 96]), x + P / 2, y + P / 2, 13 * q * (flareAll ? 1.6 : 1), 0.9 * A);
    drawGlow(ctx, glowOf([122, 77, 255]), x + P / 2, y + P / 2, 10 * q * (flareAll ? 1.6 : 1), 0.6 * A);
    ctx.globalAlpha = A;
    ctx.fillStyle = flare ? '#ffffff' : SOLO_CSS.ivory;
    ctx.fillRect(x, y, P, P);
    if (!flare) {
      ctx.strokeStyle = SOLO_CSS.lilac;
      ctx.strokeRect(x + 0.5, y + 0.5, P - 1, P - 1);
      ctx.fillStyle = SOLO_CSS.plum;
      ctx.fillText(String(i + 1), x + P / 2, y + 2 * q);
    }
  }
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

// ---------------------------------------------------------------- Ink page (MERIDIAN THREAD)
//
// The manga-ink grade is done on the Canvas2D frame, never in the post shader: draw the environment, call
// inkGrade(), then draw what keeps its colour (thread, ball, No.10, No.7, particles). Nothing here is used by
// the other specials, and nothing is drawn unless a shot calls it.

type InkRGB = [number, number, number];

/** The ink-page colours (MERIDIAN THREAD's PAL.ink / PAL.paper / PAL.tone). */
export const INK_PAGE = {
  ink: [13, 13, 20] as InkRGB,
  paper: [239, 231, 214] as InkRGB,
  tone: [119, 113, 107] as InkRGB,
};
const css = (c: InkRGB) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
const INK_CSS = css(INK_PAGE.ink), PAPER_CSS = css(INK_PAGE.paper);

interface InkBuffers {
  w: number;
  h: number;
  scratch: HTMLCanvasElement;
  sctx: CanvasRenderingContext2D;
  mask: HTMLCanvasElement;
  mctx: CanvasRenderingContext2D;
}
let inkBufs: InkBuffers | null = null;
const tonePats = new WeakMap<CanvasRenderingContext2D, CanvasPattern>();
let toneTile: HTMLCanvasElement | null = null;

function inkBuffers(w: number, h: number): InkBuffers {
  if (inkBufs && inkBufs.w === w && inkBufs.h === h) return inkBufs;
  const mk = () => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return [c, c.getContext('2d')!] as const;
  };
  const [scratch, sctx] = mk();
  const [mask, mctx] = mk();
  inkBufs = { w, h, scratch, sctx, mask, mctx };
  return inkBufs;
}

/** The grade's screentone: a 4x4 logical-px tile on a 45° lattice (2x2 tone dot + 1 px dots), white elsewhere. */
function tonePattern(c: CanvasRenderingContext2D): CanvasPattern {
  let p = tonePats.get(c);
  if (p) return p;
  if (!toneTile) {
    toneTile = document.createElement('canvas');
    toneTile.width = toneTile.height = 4;
    const g = toneTile.getContext('2d')!;
    g.fillStyle = '#fff';
    g.fillRect(0, 0, 4, 4);
    g.fillStyle = css(INK_PAGE.tone);
    g.fillRect(0, 0, 2, 2);
    g.fillRect(2, 2, 1, 1);
  }
  p = c.createPattern(toneTile, 'repeat')!;
  tonePats.set(c, p);
  return p;
}

function gradeOnto(c: CanvasRenderingContext2D, a: number, tone: number) {
  const W = c.canvas.width, H = c.canvas.height, S = W / VW;
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  // 1. Saturation with a grey: the environment turns monochrome (luminance kept).
  c.globalAlpha = a;
  c.globalCompositeOperation = 'saturation';
  c.fillStyle = 'rgb(128,128,128)';
  c.fillRect(0, 0, W, H);
  // 2. Multiply by paper: the whites go warm paper.
  c.globalCompositeOperation = 'multiply';
  c.fillStyle = PAPER_CSS;
  c.fillRect(0, 0, W, H);
  // 3. Multiply the screentone dots in (logical-px lattice, nearest-neighbour).
  const ta = Math.min(1, 0.22 * a * tone);
  if (ta > 0) {
    c.globalAlpha = ta;
    c.setTransform(S, 0, 0, S, 0, 0);
    c.imageSmoothingEnabled = false;
    c.fillStyle = tonePattern(c);
    c.fillRect(0, 0, VW, VH);
  }
  c.restore();
}

/**
 * MERIDIAN THREAD v2 (nightInk): the ink page's shared full-canvas scratch and mask buffers (the same canvases inkGrade
 * uses; reallocated only when the canvas is resized), so v2's Night Ink grade adds no new full-frame canvases.
 */
export function inkScratch(w: number, h: number): { scratch: HTMLCanvasElement; sctx: CanvasRenderingContext2D; mask: HTMLCanvasElement; mctx: CanvasRenderingContext2D } {
  return inkBuffers(w, h);
}

/** MERIDIAN THREAD v2: the ink page's cached screentone pattern for `c` (4 x 4 logical px tile: tone dots on white). */
export function inkTone(c: CanvasRenderingContext2D): CanvasPattern {
  return tonePattern(c);
}

/** Allocate the ink page's scratch, mask and tone pattern for the current canvas size (call from a shot's prepare()). */
export function prepareInk(ctx: CanvasRenderingContext2D) {
  inkBuffers(ctx.canvas.width, ctx.canvas.height);
  tonePattern(ctx);
  tonePattern(inkBufs!.sctx);
}

export interface InkRestore {
  /** The thread polyline, in the CURRENT transform's coordinates (world or screen). */
  pts: readonly TrailPt[];
  /** Width of the fully restored (colour) band. */
  w: number;
  /** Width of the soft edge on each side (two wider, fainter strokes). Default w * 0.35 + 4. */
  soft?: number;
}

/**
 * The ink page (MERIDIAN THREAD's signature look). Drains everything drawn so far to manga ink and warm paper with
 * screentone dots, at `amount` 0..1 (skipped entirely at 0). Respects the current clip (grade one manga panel).
 *   1. a 'saturation' fill of mid-grey at `amount` (monochrome);
 *   2. a 'multiply' fill of paper at `amount` (warm whites);
 *   3. a 'multiply' of the cached screentone at 0.22 x amount x o.tone (o.tone 2 = the ink freeze's doubled dots).
 * restore: the colour washing back ALONG the thread: the graded frame is built on a scratch canvas, the thread band
 * (pts, w, soft edge) is cut out of it, and it is drawn back, so the band keeps the original colour. Use it in one shot
 * only (shot 6): it copies the frame. Draw it once per frame, after the environment and before the thread, ball and
 * players. Allocate with prepareInk() in prepare(); the buffers only reallocate when the canvas is resized.
 */
export function inkGrade(ctx: CanvasRenderingContext2D, amount: number, restore?: InkRestore, o: { tone?: number } = {}) {
  const a = clamp(amount);
  if (a <= 0) return;
  const tone = o.tone ?? 1;
  if (!restore || restore.pts.length < 2 || restore.w <= 0) {
    gradeOnto(ctx, a, tone);
    return;
  }
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const m = ctx.getTransform();
  // Early out: once one segment's band (a convex capsule) holds all four canvas corners, the whole frame is back in
  // colour and there is nothing left to grade (the end of the wash costs nothing).
  {
    const k = Math.min(Math.hypot(m.a, m.b), Math.hypot(m.c, m.d));
    const half = (restore.w / 2) * k;
    const P = restore.pts.map((p) => [m.a * p.x + m.c * p.y + m.e, m.b * p.x + m.d * p.y + m.f]);
    const corners = [[0, 0], [W, 0], [0, H], [W, H]];
    for (let i = 0; i + 1 < P.length; i++) {
      const [ax, ay] = P[i], [bx, by] = P[i + 1];
      const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1e-9;
      const inside = corners.every(([cx, cy]) => {
        const u = clamp(((cx - ax) * dx + (cy - ay) * dy) / L2);
        return Math.hypot(cx - (ax + dx * u), cy - (ay + dy * u)) <= half;
      });
      if (inside) return;
    }
  }
  const b = inkBuffers(W, H);
  // Scratch = the frame, graded.
  const s = b.sctx;
  s.save();
  s.setTransform(1, 0, 0, 1, 0, 0);
  s.globalAlpha = 1;
  s.globalCompositeOperation = 'copy';
  s.drawImage(ctx.canvas, 0, 0);
  s.restore();
  gradeOnto(s, a, tone);
  // Mask = the thread band with a soft edge.
  const mc = b.mctx;
  mc.save();
  mc.setTransform(1, 0, 0, 1, 0, 0);
  mc.globalCompositeOperation = 'source-over';
  mc.clearRect(0, 0, W, H);
  mc.setTransform(m);
  mc.lineCap = 'round';
  mc.lineJoin = 'round';
  mc.strokeStyle = '#000';
  const soft = restore.soft ?? restore.w * 0.35 + 4;
  const path = () => {
    mc.beginPath();
    mc.moveTo(restore.pts[0].x, restore.pts[0].y);
    for (let i = 1; i < restore.pts.length; i++) mc.lineTo(restore.pts[i].x, restore.pts[i].y);
  };
  for (const [w, al] of [[restore.w + soft * 2, 0.3], [restore.w + soft, 0.6], [restore.w, 1]] as const) {
    mc.globalAlpha = al;
    mc.lineWidth = w;
    path();
    mc.stroke();
  }
  mc.restore();
  // Cut the band out of the graded copy and lay it back over the frame.
  s.save();
  s.setTransform(1, 0, 0, 1, 0, 0);
  s.globalCompositeOperation = 'destination-out';
  s.drawImage(b.mask, 0, 0);
  s.restore();
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(b.scratch, 0, 0);
  ctx.restore();
}

/**
 * The ink freeze's one-frame negative: a 'difference' fill of paper over what is drawn so far (paper lines on ink).
 * Call it after inkGrade(ctx, 1, undefined, { tone: 2 }) and before the players, on ONE frame (photosensitivity).
 */
export function inkNegative(ctx: CanvasRenderingContext2D, amount = 1) {
  const a = clamp(amount);
  if (a <= 0) return;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = a;
  ctx.globalCompositeOperation = 'difference';
  ctx.fillStyle = PAPER_CSS;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
}

const toneCache = new Map<string, HTMLCanvasElement>();

/**
 * Cached halftone dots (a 45° lattice, `dot` px apart, pixel-crisp) filling `rect` (x, y, w, h in the current
 * transform), drawn normal-blend in o.color (default ink) at `alpha`. o.corners 0..1: the dots only grow toward the
 * four corners (0 = uniform dots; 0.6 = the cut-in's darkened corners). The pattern is rasterised once per size.
 */
export function screentone(
  ctx: CanvasRenderingContext2D, rect: readonly [number, number, number, number], dot = 4, alpha = 0.5,
  o: { color?: InkRGB; corners?: number } = {},
) {
  if (alpha <= 0) return;
  const [x, y, w, h] = rect;
  const W = Math.max(1, Math.round(w)), H = Math.max(1, Math.round(h));
  const col = o.color ?? INK_PAGE.ink;
  const corners = clamp(o.corners ?? 0);
  const key = `${W}x${H}|${dot}|${corners}|${col.join(',')}`;
  let cv = toneCache.get(key);
  if (!cv) {
    cv = document.createElement('canvas');
    cv.width = W;
    cv.height = H;
    const g = cv.getContext('2d')!;
    const img = g.createImageData(W, H);
    const d = img.data;
    const half = dot / 2;
    for (let py = 0; py < H; py++)
      for (let px = 0; px < W; px++) {
        let k = 0.3;
        if (corners > 0) {
          const dx = (px + 0.5 - W / 2) / (W / 2), dy = (py + 0.5 - H / 2) / (H / 2);
          const dist = Math.hypot(dx, dy) / Math.SQRT2;
          k = 0.62 * clamp((dist - (1 - corners)) / corners);
        }
        const r = dot * k;
        if (r <= 0.05) continue;
        // Nearest lattice centre (rows half a dot apart, alternate rows shifted by half a dot).
        const j0 = Math.round((py + 0.5) / half);
        let best = 1e9;
        for (let j = j0 - 1; j <= j0 + 1; j++) {
          const cy = j * half;
          const sh = (j & 1) * half;
          const i = Math.round((px + 0.5 - sh) / dot);
          const cx = i * dot + sh;
          best = Math.min(best, Math.hypot(px + 0.5 - cx, py + 0.5 - cy));
        }
        if (best <= Math.max(0.5, r)) {
          const q = (py * W + px) * 4;
          d[q] = col[0];
          d[q + 1] = col[1];
          d[q + 2] = col[2];
          d[q + 3] = 255;
        }
      }
    g.putImageData(img, 0, 0);
    toneCache.set(key, cv);
    if (toneCache.size > 32) toneCache.delete(toneCache.keys().next().value as string);
  }
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = clamp(alpha);
  ctx.drawImage(cv, x, y, w, h);
  ctx.restore();
}

/** A manga panel: a polygon (current transform), its content, its ink border and its paper gutter. */
export interface MangaPanel {
  poly: readonly (readonly [number, number])[];
  /** Draws the content, already clipped to the panel (and offset by dx/dy). */
  draw?: (ctx: CanvasRenderingContext2D, i: number, t: number) => void;
  /** Ink border width (default 3; the freeze thickens it to 5). */
  border?: number;
  /** Paper margin painted round the border (default 3, so two abutting panels show a 6 px paper gutter). */
  gutter?: number;
  /** Panel background (default paper). */
  fill?: string;
  /** Offset (slam-in, pull-off, the 1 px shake). */
  dx?: number;
  dy?: number;
  alpha?: number;
}

/** A w x h rectangle centred on (cx, cy), rotated `deg` degrees (the slanted manga panel), as a polygon. */
export function panelPoly(cx: number, cy: number, w: number, h: number, deg = 0): [number, number][] {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return ([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]] as const).map(
    ([x, y]) => [cx + x * c - y * s, cy + x * s + y * c] as [number, number],
  );
}

function polyPath(ctx: CanvasRenderingContext2D, poly: readonly (readonly [number, number])[]) {
  ctx.beginPath();
  poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
}

/**
 * Slanted manga panels with ink borders and paper gutters (the cut-in, the insets, the diptych). In order: each
 * panel paints its paper gutter and background, its clipped content (draw), then its ink border, so a later panel's
 * gutter cuts a clean paper gap into an earlier one.
 */
export function mangaPanels(ctx: CanvasRenderingContext2D, panels: readonly MangaPanel[], t = 0) {
  panels.forEach((p, i) => {
    if (p.poly.length < 3 || (p.alpha ?? 1) <= 0) return;
    const border = p.border ?? 3, gutter = p.gutter ?? 3;
    ctx.save();
    ctx.globalAlpha = clamp(p.alpha ?? 1);
    ctx.translate(p.dx ?? 0, p.dy ?? 0);
    ctx.lineJoin = 'miter';
    polyPath(ctx, p.poly);
    if (gutter > 0) {
      ctx.strokeStyle = PAPER_CSS;
      ctx.lineWidth = border + gutter * 2;
      ctx.stroke();
    }
    ctx.fillStyle = p.fill ?? PAPER_CSS;
    ctx.fill();
    if (p.draw) {
      ctx.save();
      ctx.clip();
      p.draw(ctx, i, t);
      ctx.restore();
    }
    polyPath(ctx, p.poly);
    ctx.strokeStyle = INK_CSS;
    ctx.lineWidth = border;
    ctx.stroke();
    ctx.restore();
  });
}

/**
 * The panel freeze border (each needle eye): an ink border over `poly` that thickens 3 -> 5 px with `amount` 0..1,
 * plus `kick` px (the 2 px kick on the first frames of the freeze).
 */
export function panelFreeze(ctx: CanvasRenderingContext2D, poly: readonly (readonly [number, number])[], amount: number, kick = 0) {
  const a = clamp(amount);
  if (a <= 0 && kick <= 0) return;
  ctx.save();
  ctx.lineJoin = 'miter';
  polyPath(ctx, poly);
  ctx.strokeStyle = INK_CSS;
  ctx.lineWidth = 3 + 2 * a + kick;
  ctx.stroke();
  ctx.restore();
}

/**
 * A hand-lettered ink SFX ("SHK!", "KLAK!", "SWSH"): ink fill, paper outer stroke, each letter jittered a little
 * (deterministic). o.pop 0..1 scales it in (1.6 -> 1, outBack). Keep size <= 28 px and away from the ball.
 */
export function inkSfx(
  ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, rot = 0,
  o: { alpha?: number; pop?: number; fill?: string; outer?: string } = {},
) {
  const pop = clamp(o.pop ?? 1);
  const a = clamp((o.alpha ?? 1) * clamp(pop * 3));
  if (a <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const s = lerp(1.6, 1, ease.outBack(pop));
  ctx.scale(s, s);
  ctx.globalAlpha = a;
  ctx.font = `${size}px ${TITLE_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width * 0.92);
  const total = widths.reduce((p, q) => p + q, 0);
  let cx = -total / 2;
  const pass = (stroke: boolean) => {
    cx = -total / 2;
    chars.forEach((c, i) => {
      const jr = Math.sin(i * 12.9898 + text.length * 3.1) * 0.12;
      const jy = Math.sin(i * 78.233 + 1.7) * size * 0.06;
      ctx.save();
      ctx.translate(cx + widths[i] / 2, jy);
      ctx.rotate(jr);
      ctx.transform(1, 0, -0.14, 1, 0, 0);
      if (stroke) {
        ctx.strokeStyle = o.outer ?? PAPER_CSS;
        ctx.lineWidth = Math.max(3, size * 0.22);
        ctx.strokeText(c, 0, 0);
      } else {
        ctx.fillStyle = o.fill ?? INK_CSS;
        ctx.fillText(c, 0, 0);
      }
      ctx.restore();
      cx += widths[i];
    });
  };
  pass(true);
  pass(false);
  ctx.restore();
}

/**
 * Two curved manga motion marks round a spinning ball at (x, y) of radius r: tapered arcs (thick head, thin tail)
 * at r x 1.45, half a turn apart, starting at angle `phase`, trailing against the spin. dir 1 = clockwise on screen.
 * o.squash < 1 flattens them onto the ground plane; o.ink (default true) gives them the ink under-stroke.
 */
export function spinMarks(
  ctx: CanvasRenderingContext2D, x: number, y: number, r: number, phase: number,
  o: { color?: string; ink?: boolean; alpha?: number; squash?: number; len?: number; dir?: 1 | -1; width?: number } = {},
) {
  const a = clamp(o.alpha ?? 1);
  if (a <= 0 || r <= 0) return;
  const R = r * 1.45, len = o.len ?? 1.1, dir = o.dir ?? 1, sq = o.squash ?? 1;
  const w = o.width ?? Math.max(1.5, r * 0.3);
  const N = 14;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.lineJoin = 'round';
  for (const k of [0, 1]) {
    const head = phase + k * Math.PI;
    const L: [number, number][] = [], Rr: [number, number][] = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const ang = head - dir * len * u;
      const hw = (w / 2) * Math.pow(1 - u, 0.8);
      const c = Math.cos(ang), s = Math.sin(ang);
      L.push([x + c * (R + hw), y + s * (R + hw) * sq]);
      Rr.push([x + c * (R - hw), y + s * (R - hw) * sq]);
    }
    ctx.beginPath();
    L.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    for (let i = Rr.length - 1; i >= 0; i--) ctx.lineTo(Rr[i][0], Rr[i][1]);
    ctx.closePath();
    if (o.ink !== false) {
      ctx.strokeStyle = INK_CSS;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.fillStyle = o.color ?? 'rgb(47,224,138)';
    ctx.fill();
  }
  ctx.restore();
}

/**
 * The boot's swing arc: a translucent ink smear (normal blend, a ribbon tapering from the tail to `w` at the head =
 * the last point) with three thin ink speed lines along it. alpha 0.35 in the brief.
 */
export function inkSmear(ctx: CanvasRenderingContext2D, pts: readonly TrailPt[], w: number, alpha: number, o: { lines?: number; color?: string } = {}) {
  const n = pts.length;
  if (n < 2 || alpha <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ribbon(ctx, pts as TrailPt[], 0, w, o.color ?? INK_CSS, alpha);
  const lines = o.lines ?? 3;
  ctx.strokeStyle = o.color ?? INK_CSS;
  ctx.lineWidth = 1;
  ctx.lineCap = 'round';
  for (let k = 0; k < lines; k++) {
    const off = lines === 1 ? 0 : (k / (lines - 1) - 0.5) * 2 * 0.62;
    const i0 = Math.floor(n * (0.25 + 0.15 * k / Math.max(1, lines)));
    ctx.globalAlpha = clamp(alpha * 1.8);
    ctx.beginPath();
    for (let i = i0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      let dx = b.x - a.x, dy = b.y - a.y;
      const l = Math.hypot(dx, dy) || 1;
      dx /= l;
      dy /= l;
      const ww = (w / 2) * (i / (n - 1)) * off;
      const px = pts[i].x - dy * ww, py = pts[i].y + dx * ww;
      i === i0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}
