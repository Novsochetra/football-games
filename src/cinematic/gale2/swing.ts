// GALE HAMMER v2: the 2.5D swing-orbit of shot 6b (SPEC.md §10.4 item 28). Over 0.40 s the camera yaws round the
// ball from side-on (yaw 90°) to front three-quarter (25°) while the cone snaps into the vapour disc. The background is
// crushed to 15 %: floodlight bokeh on 4 depth bands sliding by parallax, the dark turf's stripe lines and the pressed
// wake rotating into perspective. Yaw only: never a roll. Everything is a pure function of the view.

import { TAU, clamp, lerp } from '../../engine/math';
import { drawGlow, glowOf } from '../../engine/particles';
import { VW, VH } from '../../engine/camera';
import { HEX } from './common';

export interface SwingView {
  /** Radians: PI/2 = side-on (the ride), 0 = facing the ball's nose. */
  yaw: number;
  /** Eye distance from the ball (m). */
  dist: number;
  /** Focal length (screen px per m at 1 m depth). */
  f: number;
  /** Screen position of the ball. */
  cx: number;
  cy: number;
}

export interface SwingPoint {
  x: number;
  y: number;
  /** Screen px per metre at that depth. */
  s: number;
  /** Depth from the eye (m). */
  d: number;
}

/**
 * Project an offset from the ball (metres: dx along the flight, dz across, dh up) into the swing view: the offset is
 * turned by yaw about the vertical axis, depth d = dist - (offset toward the eye), screen (cx + f·lateral/d, cy - f·dh/d).
 */
export function swingProject(v: SwingView, dx: number, dz: number, dh: number): SwingPoint {
  const c = Math.cos(v.yaw), s = Math.sin(v.yaw);
  // The eye sits at dist·(cos yaw, sin yaw) in (x, z) from the ball, looking at it: yaw 90° = south of the ball looking
  // north (the flight runs left -> right on screen), yaw 0 = ahead of the ball looking back at its nose.
  const lateral = dx * s - dz * c;
  const toward = dx * c + dz * s;
  const d = Math.max(0.2, v.dist - toward);
  const k = v.f / d;
  return { x: v.cx + lateral * k, y: v.cy - dh * k, s: k, d };
}

/** The disc's on-screen aspect at this yaw: cos(yaw) (0 = edge-on line, 1 = face-on circle). */
export const swingAspect = (v: SwingView) => Math.abs(Math.cos(v.yaw));

/**
 * The dark turf plane under the ball (the ball flies h m up): 9 stripe lines across the flight, the pressed wake along it
 * and the two craters behind, all in stormNavy-crushed colours (about 15 % brightness). `h` = ball height (m).
 */
export function drawSwingGround(ctx: CanvasRenderingContext2D, v: SwingView, t: number, h = 1.2, o: { wake?: boolean; craters?: number[] } = {}) {
  ctx.fillStyle = HEX.stormNavy;
  ctx.fillRect(0, 0, VW, VH);
  const ground = (dx: number, dz: number) => swingProject(v, dx, dz, -h);
  // Stripe lines (5 m bands across the flight).
  ctx.strokeStyle = 'rgba(40,70,60,0.55)';
  ctx.lineWidth = 1;
  for (let i = -4; i <= 4; i++) {
    const dx = i * 5 - ((t * 30) % 5);
    ctx.beginPath();
    for (let k = 0; k <= 12; k++) {
      const p = ground(dx, -30 + k * 5);
      if (p.d < 0.5) continue;
      k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
    }
    ctx.stroke();
  }
  // The pressed wake behind the ball (a pale band along -dx).
  if (o.wake !== false) {
    ctx.fillStyle = 'rgba(155,224,138,0.16)';
    ctx.beginPath();
    for (let k = 0; k <= 10; k++) {
      const p = ground(-k * 4, -0.6 - k * 0.08);
      k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
    }
    for (let k = 10; k >= 0; k--) {
      const p = ground(-k * 4, 0.6 + k * 0.08);
      ctx.lineTo(p.x, p.y);
    }
    ctx.fill();
  }
  // Craters (metres behind the ball): cyan glow rings flattened by perspective.
  for (const back of o.craters ?? []) {
    const c = ground(-back, 0), e = ground(-back + 1.5, 0), side = ground(-back, 1.5);
    const rx = Math.max(2, Math.hypot(side.x - c.x, side.y - c.y));
    const ry = Math.max(1, Math.abs(e.y - c.y));
    ctx.strokeStyle = 'rgba(70,216,255,0.35)';
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, rx, ry, 0, 0, TAU);
    ctx.stroke();
  }
}

/** 24 floodlight bokeh points on 4 depth bands, sliding by parallax as the yaw turns (additive, soft). */
export function swingBokeh(ctx: CanvasRenderingContext2D, v: SwingView, t: number, a = 1) {
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 24; i++) {
    const band = i % 4;
    const depth = 20 + band * 25;
    const ang = (i / 24) * TAU * 0.5 + band * 0.4;
    const p = swingProject(v, Math.cos(ang) * depth, Math.sin(ang) * depth, 8 + (i % 3) * 3);
    if (p.d < 1) continue;
    const r = clamp(60 / p.d, 1.5, 9);
    const tw = 0.75 + 0.25 * Math.sin(t * 3 + i);
    drawGlow(ctx, glowOf(i % 5 ? [255, 250, 230] : [170, 220, 250]), p.x, p.y, r * 2.4, 0.35 * a * tw);
  }
  ctx.globalCompositeOperation = prev;
}

/** Ease the swing from side-on (90°) to front three-quarter (25°) over u 0..1 (inOutCubic on the caller's clock). */
export function swingYaw(u: number) {
  const k = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  return lerp(Math.PI / 2, (25 * Math.PI) / 180, clamp(k));
}
