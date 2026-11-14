// SHOT 1 — CUT-IN (1.2 s). PLACEHOLDER: a labelled card with a small demo of the engine pieces this shot
// uses (isobars, the face crop at x4, the G-B-D air-tone motif) and the brief's audio cues.
// Replace with the real shot (SPEC.md §1).

import type { Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { clamp, ease } from '../../engine/math';
import { AIR_TONES, HEX, drawNo10, isobars, placeholderShot } from './common';

export const shotCutIn: Shot = {
  ...placeholderShot(1, 'Cut-in', 1.2, 301, {
    render(env, t) {
      const ctx = env.ctx;
      const contract = Math.pow(0.6, t * 1.4);
      isobars(ctx, VW / 2, VH / 2 + 20, [70, 110, 150, 190, 230, 270, 310].map((r) => r * contract), { squash: 0.6, t, alpha: 0.35 });
      const open = ease.outBack(clamp(t / 0.22));
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(VW / 2, VH / 2 + 30, Math.max(2, 210 * open), 70, 0, 0, Math.PI * 2);
      ctx.fillStyle = HEX.navy;
      ctx.fill();
      ctx.clip();
      drawNo10(env, 'G1', VW / 2, VH / 2 + 30, 4, { anchor: 'center' });
      ctx.restore();
    },
  }),
  cues: [
    { at: 0, fn: (env) => env.sfx.stinger() },
    { at: 0.02, fn: (env) => env.sfx.inhale(0.4) },
    { at: 0.38, fn: (env) => env.sfx.shing(1.1) },
    { at: 0.5, fn: (env) => (env.sfx.kick(0.35), env.sfx.whoosh(0.3, 800, 2400, 0.25)) },
    { at: 0.52, fn: (env) => env.sfx.airTone(AIR_TONES.G5, 0.3) },
    { at: 0.64, fn: (env) => env.sfx.airTone(AIR_TONES.B5, 0.3) },
    { at: 0.76, fn: (env) => env.sfx.airTone(AIR_TONES.D6, 0.3) },
    { at: 1.12, fn: (env) => (env.sfx.crack(0.8), env.sfx.boom(0.4)) },
  ],
};
