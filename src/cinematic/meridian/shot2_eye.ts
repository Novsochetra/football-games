// SHOT 2 · PLAYMAKER'S EYE (1.8 s). PLACEHOLDER: a rough demo of the engine pieces this shot uses (drawDownPitch from
// LAYOUT, the four front-view defenders, the ink page ramping in, No.10's Back frames at x3 in colour, the sightlines,
// the faint needle eyes, the running-stitch route and the cross-stitch X) with the brief's time rate and audio cues.
// Replace with the real shot (SPEC.md §2).

import type { Shot } from '../timeline';
import { VW } from '../../engine/camera';
import { clamp, ease, keys, lerp } from '../../engine/math';
import { RIVAL_KIT, RIVAL_KIT_B, RIVAL_KIT_C, RIVAL_KIT_D } from '../../art/puppet';
import { focusLines } from '../../art/fx';
import {
  HEX, LAYOUT, PATH, THREAD_NOTES as N, crossStitch, drawDownPitch, drawFrontFigure, drawNo10, inkGrade, needleEye,
  no10Point, placeholderShot, projectDecal, threadLine, type DownPitchView, type No10Key,
} from './common';

const VIEW: DownPitchView = { x: 840, z: 270, h: 18, f: 520, horizon: 118, cx: 390 };
const DEF = [
  { at: LAYOUT.d1Out, kit: RIVAL_KIT },
  { at: LAYOUT.d2, kit: RIVAL_KIT_B },
  { at: LAYOUT.d3, kit: RIVAL_KIT_C },
  { at: LAYOUT.d4, kit: RIVAL_KIT_D },
];
const CARRY: No10Key[] = ['B1', 'B2', 'B3', 'B4'];

function frameAt(t: number): No10Key {
  if (t < 0.35) return CARRY[Math.floor(t * 12) % 4];
  if (t < 0.5) return 'S1';
  if (t < 1.25) return Math.floor((t - 0.5) / 0.25) % 2 ? 'S2b' : 'S2a';
  return 'S3';
}

export const shotEye: Shot = {
  ...placeholderShot(2, "Playmaker's eye", 1.8, 402, {
    rate: (t) => (t < 0.35 ? 1 : t < 0.5 ? lerp(1, 0.12, ease.inOutQuad((t - 0.35) / 0.15)) : t < 1.62 ? 0.12 : t < 1.75 ? lerp(0.12, 1, (t - 1.62) / 0.13) : 1),
    render(env, t) {
      const ctx = env.ctx;
      env.screen();
      const zoom = t < 1.55 ? lerp(1, 1.08, clamp((t - 0.35) / 1.2)) : lerp(1.08, 1.25, ease.inCubic(clamp((t - 1.55) / 0.25)));
      ctx.save();
      ctx.translate(VW / 2, 180);
      ctx.scale(zoom, zoom);
      ctx.translate(-VW / 2, -180);
      drawDownPitch(ctx, env.art.stadium, VIEW, t);
      const swivel = ease.inOutCubic(clamp((t - 0.95) / 0.3));
      DEF.forEach((d, i) => {
        const p = projectDecal(d.at.x, d.at.z);
        drawFrontFigure(ctx, d.kit, p.x, p.y, clamp(p.s * 2.4, 0.78, 1), -0.18 * swivel, -swivel, Math.floor(t * 6 + i) % 2);
      });
      // The read: the page drains to ink (No.10, No.7 and the ball are drawn after the grade).
      inkGrade(ctx, 0.9 * clamp((t - 0.38) / 0.25));
      // Sightlines, one per tick, from his head to each defender.
      const head = no10Point(env, frameAt(t), 'head', 170, 414, 3);
      DEF.forEach((d, i) => {
        const at = [0.55, 0.7, 0.85, 1.0][i];
        if (t < at || t > 1.3) return;
        const p = projectDecal(d.at.x, d.at.z, 16);
        ctx.save();
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = HEX.jade;
        ctx.globalAlpha = 0.85 * clamp((t - at) / 0.06);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(head[0], head[1]);
        ctx.lineTo(lerp(head[0], p.x, clamp((t - at) / 0.08)), lerp(head[1], p.y, clamp((t - at) / 0.08)));
        ctx.stroke();
        ctx.restore();
      });
      // Needle eyes open faintly in turn; the route stitches itself; the X pulses.
      PATH.eyes.forEach((u, i) => {
        const e = PATH.at(u);
        const p = projectDecal(e.x, e.z);
        needleEye(ctx, p.x, p.y, 12 * p.s, clamp((t - 0.85 - i * 0.12) / 0.15), 0, 0.55, Math.max(0.3, p.k * 3));
      });
      const route = clamp((t - 1.25) / 0.3);
      if (route > 0) {
        const pts = PATH.points(0, route, 3).map((q) => projectDecal(q.x, q.z)).map((q) => ({ x: q.x, y: q.y }));
        threadLine(ctx, pts, 2, 1, { stitch: { dash: 8, dip: 4 } });
      }
      if (t > 1.35) {
        const p = projectDecal(LAYOUT.target.x, LAYOUT.target.z);
        crossStitch(ctx, p.x, p.y, 7 * (1 + 0.15 * Math.sin(t * 20)), 1, 0.5);
      }
      if (t > 0.38 && t < 0.95) focusLines(ctx, env.frng(3), head[0], head[1], 60, 420, 40, HEX.ink, 0.3 * clamp((t - 0.38) / 0.2));
      // No.10 in full colour, Back view at x3, cropped at the knees (head top ~y 120).
      drawNo10(env, frameAt(t), 170, 414 + Math.round(Math.abs(Math.sin(t * 18)) * 2), 3);
      ctx.restore();
      env.fx.vignette = lerp(0.45, 0.6, clamp((t - 0.38) / 0.25));
      if (t < 0.05) env.fx.flash = 1 - t / 0.05;
      env.fx.flashColor = [239, 231, 214];
      if (t > 1.55) {
        const p = projectDecal(LAYOUT.target.x, LAYOUT.target.z);
        env.fx.radial = 0.25 * clamp((t - 1.55) / 0.2);
        env.fx.radialX = p.x / VW;
        env.fx.radialY = p.y / 360;
      }
      if (t > 1.767) {
        env.fx.flash = 0.8;
        env.fx.flashColor = [239, 231, 214];
      }
      void keys;
    },
  }),
  cues: [
    { at: 0, fn: (env) => env.sfx.crowd(1.8, 0.2) },
    { at: 0.05, fn: (env) => env.sfx.kick(0.15) },
    { at: 0.38, fn: (env) => env.sfx.duck(0.35, 1.3) },
    { at: 0.55, fn: (env) => env.sfx.tick() },
    { at: 0.7, fn: (env) => env.sfx.tick() },
    { at: 0.85, fn: (env) => env.sfx.tick() },
    { at: 1.0, fn: (env) => (env.sfx.tick(), env.sfx.shing(1.1)) },
    { at: 1.35, fn: (env) => env.sfx.pluck(N.D5, 0.5) },
    { at: 1.55, fn: (env) => env.sfx.whoosh(0.25, 400, 3000, 0.45) },
  ],
};
