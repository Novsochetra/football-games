// SHOT 1 — COUNT-IN (1.4 s). PLACEHOLDER: the follow-spot pool as the window (No.10's eyes, the darts G2L / G2 at
// x5), the lampTitle count-in on four stick clicks with fx.echo, the iris to black, and the brief's audio cues.
// Replace with the real shot (SPEC.md §1). Keep the export, name, dur and seed.

import type { Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { clamp, ease, lerp } from '../../engine/math';
import { placeholderShot } from './placeholder';
import { HEX, SEQ, drawSolo, echoAt, lampTitle, pixelText, soloAt, soloGrade, sparkle, stage, soloPoint } from './common';

const CLICKS = [0.6, 0.8, 1.0, 1.2];

export const shotCountIn: Shot = {
  ...placeholderShot(1, 'Count-in', 1.4, 501, {
    render(env, t) {
      const ctx = env.ctx;
      env.screen();
      ctx.fillStyle = HEX.plum;
      ctx.fillRect(0, 0, VW, VH);
      if (t < 0.05) return;
      // The pool: snaps on at 70% (2-frame lamp ramp), opens to rx 250 / ry 72 (outBack), eases up and narrows at
      // 0.55, irises onto his eye 1.25-1.37, then black.
      const open = lerp(0.7, 1, ease.outBack(clamp((t - 0.05) / 0.15)));
      const up = ease.inOutQuad(clamp((t - 0.55) / 0.15));
      let rx = 250 * open * lerp(1, 220 / 250, up), ry = 72 * open;
      const cy = lerp(140, 118, up);
      const iris = clamp((t - 1.25) / 0.12);
      if (iris > 0) {
        rx = lerp(220, 6, ease.inQuad(iris));
        ry = lerp(72, 4, ease.inQuad(iris));
      }
      if (t >= 1.37) return;
      const ramp = clamp((t - 0.05) / (2 / 60));
      const cx = VW / 2;
      // Beam from the top-right into the pool.
      stage.beam(ctx, 560, -30, cx + 60, cy, 30, rx * 0.9, 0.12 * ramp, { t, seed: 11 });
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx + 12, ry + 12, 0, 0, Math.PI * 2);
      ctx.clip();
      const key = soloAt(SEQ[1], t);
      const push = lerp(1, 1.06, clamp(t / 1.25));
      ctx.translate(cx, cy);
      ctx.scale(push, push);
      drawSolo(env, key, 0, 0, 5, { anchor: 'center', alpha: ramp });
      ctx.restore();
      // Soft 12 px falloff into the plum stage (a filled soft pool, never an outline).
      stage.dim(ctx, 0.88, [{ x: cx, y: cy, rx, ry, soft: 12, gain: 1 }], { color: [22, 10, 38], uncapped: true });
      env.screen();
      if (t >= 0.45 && t < 0.6) {
        const a = 1 - (t - 0.45) / 0.15;
        for (const e of ['eyeL', 'eyeR']) {
          const [ex, ey] = soloPoint(env, key, e, cx, cy, 5 * push, { anchor: 'center' });
          sparkle(ctx, ex, ey, 14, a);
        }
      }
      if (t < 1.25) {
        const groups = lampTitle(ctx, ['SPOT', 'LIGHT ', 'SO', 'LO'], VW / 2, 262, 56, t, CLICKS, { flareAt: 1.2 });
        CLICKS.forEach((at, i) => echoAt(env, t, at, 3, 0.7, -0.01, { sx: groups[i].cx, sy: 240, R: 0.2 }));
        if (t >= 1.05) pixelText(ctx, 'SPECIAL DRIBBLE · No.10', VW / 2, 276, 10, HEX.lilac, 'center', HEX.plum);
      }
      soloGrade(env.fx, { bloom: 0.75, bloomThresh: 0.76, vignette: 0.65 });
    },
  }),
  cues: [
    { at: 0, fn: (env) => env.sfx.stinger() },
    { at: 0.05, fn: (env) => env.sfx.spotOn(1.0) },
    { at: 0.2, fn: (env) => env.sfx.hat() },
    { at: 0.3, fn: (env) => env.sfx.hat() },
    { at: 0.45, fn: (env) => env.sfx.shing(1.2) },
    ...CLICKS.map((at) => ({ at, fn: (env: Parameters<NonNullable<Shot['cues']>[number]['fn']>[0]) => (env.sfx.sticks(), env.sfx.spotOn(0.3)) })),
    { at: 1.0, fn: (env) => env.sfx.crashSwell(0.4) },
    { at: 1.25, fn: (env) => env.sfx.lightsOff(0.4) },
  ],
};
