// GALE HAMMER v2: the goal rig (SPEC.md §10.5 item 29). The thunder shoves the whole goal 2.8 m (GOAL_SLIDE 28 world
// px) behind its painted line: it skids, the crossbar bows into a U and springs back, the six net pegs pop, the post
// feet plough two furrows (the only torn turf in GALE), frost races along the frame. It stays standing; the net never
// tears. The painted goal line stays at FIELD.goalX and is drawn by the backdrop, never by the rig. Every value is a
// pure function of the shot clock, so the shot seeks exactly. Side view only (the view drawGoal draws).

import { clamp, ease, lerp } from '../../engine/math';
import { FIELD, drawGoal } from '../../art/stadium';
import { GOAL_SLIDE } from './common';

export interface GoalRig {
  /** Frame offset +x (world px), 0 -> GOAL_SLIDE. */
  slide: number;
  /** Net dome (drawGoal's bulge, capped at 1.0). */
  dome: number;
  /** Crossbar bow back into a U (world px at mid-bar, + = back). */
  bend: number;
  /** Six pegs: 0 = in the turf, 1 = popped out and lying on its side. */
  pegs: number[];
  /** Furrow progress 0..1 (follows the slide). */
  furrow: number;
  /** Frost along the frame from the impact corner, 0..1 (fades after 1.2 s). */
  frost: number;
}

export interface GoalRigOpts {
  /** Shot-local time the ball hits the net (default 0.40, shot 8). */
  hit?: number;
}

/** The rig at shot-local t (shot 8's clock; t = Infinity for the aftermath: the field result view and shot 9b). */
export function goalRigAt(t: number, o: GoalRigOpts = {}): GoalRig {
  const hit = o.hit ?? 0.4;
  if (!isFinite(t)) return { slide: GOAL_SLIDE, dome: 0.6, bend: 0, pegs: [1, 1, 1, 1, 1, 1], furrow: 1, frost: 0 };
  const u = t - hit;
  const slide = GOAL_SLIDE * ease.outCubic(clamp((u - 0.08) / 0.47));
  const dome = u < 0 ? 0 : u < 0.08 ? ease.outQuad(u / 0.08) : lerp(1, 0.6, ease.inOutQuad(clamp((u - 0.08) / 0.72)));
  // A damped 4 Hz spring: rising from hit + 0.08 to its 14 px peak at hit + 0.16 (0.56), settled by hit + 0.75 (1.15).
  const bu = u - 0.16;
  const bend = u < 0.08 ? 0 : bu < 0 ? 14 * ease.outQuad((u - 0.08) / 0.08) : u > 0.75 ? 0 : 14 * Math.cos(Math.PI * 2 * 4 * bu) * Math.exp(-bu * 6);
  const pegs = [0, 1, 2, 3, 4, 5].map((i) => ease.outCubic(clamp((u - 0.05 - i * 0.05) / 0.1)));
  const frost = clamp((u - 0.08) / 0.22) * (1 - clamp((u - 0.8) / 0.4));
  return { slide, dome: Math.min(1, dome), bend, pegs, furrow: clamp(slide / GOAL_SLIDE), frost };
}

const OB = 0.35;
const postX = (z: number) => FIELD.goalX + (z - FIELD.horizon) * OB;

/**
 * Draw the rig in the side world view (camera transform applied): part 'turf' (furrows, peg holes and fallen pegs;
 * draw it right after the backdrop), 'back' (net and far post / crossbar, before the figures) or 'front' (the near
 * post, after them). Wraps the shipped side-view drawGoal with the frame offset, then overdraws the bent crossbar
 * and the frost.
 */
export function drawGoalRig(ctx: CanvasRenderingContext2D, part: 'turf' | 'back' | 'front', rig: GoalRig, t = 0) {
  const far = FIELD.goalFar, near = FIELD.goalNear, H = FIELD.goalH;
  const fx = postX(far), nx = postX(near);
  if (part === 'turf') {
    // Furrows: from the painted line to each post foot (soil core between torn grass lips, a clod at the end).
    for (const [px, z] of [[fx, far], [nx, near]] as const) {
      const len = rig.slide;
      if (len < 0.5) continue;
      ctx.fillStyle = '#163a1c';
      ctx.fillRect(Math.round(px - 1), Math.round(z - 2), Math.round(len + 3), 5);
      ctx.fillStyle = '#4a3424';
      ctx.fillRect(Math.round(px), Math.round(z - 1), Math.round(len), 3);
      ctx.fillStyle = '#6b4c34';
      ctx.fillRect(Math.round(px), Math.round(z - 1), Math.round(len), 1);
      ctx.fillStyle = '#3f9a48';
      for (let x = 0; x < len; x += 3) ctx.fillRect(Math.round(px + x), Math.round(z - 3 + ((x * 7) % 2)), 2, 1);
      ctx.fillStyle = '#5a3c26';
      ctx.fillRect(Math.round(px + len + 1), Math.round(z - 2), 3, 3);
    }
    // Pegs along the back of the net's base: a hole where each was, the peg on its side once popped.
    for (let i = 0; i < 6; i++) {
      const u = i / 5;
      const z = lerp(far, near, u);
      const bx = postX(z) + FIELD.goalDepth;
      const p = rig.pegs[i];
      ctx.fillStyle = '#1a2a16';
      ctx.fillRect(Math.round(bx - 1), Math.round(z), 3, 2);
      if (p <= 0) continue;
      const px = bx + rig.slide * 0.8 + 4 * p, py = z + 2 * p;
      ctx.fillStyle = '#c8ccd8';
      ctx.fillRect(Math.round(px), Math.round(py - (1 - p) * 4), p > 0.7 ? 4 : 1, p > 0.7 ? 1 : 4);
    }
    return;
  }
  ctx.save();
  ctx.translate(Math.round(rig.slide), 0);
  drawGoal(ctx, part, rig.dome);
  if (part === 'back' && Math.abs(rig.bend) > 0.3) {
    // The crossbar bowed back into a U: a bent bar over the straight one (navy edge, white bar).
    const n = 12;
    const pt = (i: number): [number, number] => {
      const u = i / n;
      return [lerp(fx, nx, u) + Math.sin(Math.PI * u) * rig.bend, lerp(far, near, u) - H];
    };
    ctx.strokeStyle = '#0A1238';
    ctx.lineWidth = 6;
    ctx.beginPath();
    for (let i = 0; i <= n; i++) (i ? ctx.lineTo : ctx.moveTo).apply(ctx, pt(i));
    ctx.stroke();
    ctx.strokeStyle = '#f4f6ff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i <= n; i++) (i ? ctx.lineTo : ctx.moveTo).apply(ctx, pt(i));
    ctx.stroke();
  }
  if (rig.frost > 0) {
    // Frost racing along the frame from the far top corner (ice pixels, additive).
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(238,251,255,0.8)';
    const run = rig.frost;
    if (part === 'back') {
      for (let i = 0; i < 24 * run; i++) {
        const u = i / 24;
        ctx.fillRect(Math.round(lerp(fx, nx, u) + Math.sin(Math.PI * u) * rig.bend), Math.round(lerp(far, near, u) - H - 2 + ((i * 5) % 3)), 1, 1);
      }
      for (let y = 0; y < H * run; y += 3) ctx.fillRect(Math.round(fx + 2), Math.round(far - H + y), 1, 1);
    } else for (let y = 0; y < H * run; y += 3) ctx.fillRect(Math.round(nx + 2), Math.round(near - H + y), 1, 1);
    ctx.globalCompositeOperation = 'source-over';
  }
  void t;
  ctx.restore();
}

/** World x of the near post foot at slide s (the proof push frames it against the painted line at FIELD.goalX). */
export function nearPostFoot(rig: GoalRig): [number, number] {
  return [postX(FIELD.goalNear) + rig.slide, FIELD.goalNear];
}
