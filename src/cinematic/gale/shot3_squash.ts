// SHOT 3 — SQUASH (1.6 s). PLACEHOLDER: a labelled card with a demo of this shot's engine pieces (the squashed
// cobalt ball with its dented contact face, the bulge lens, the cobalt/ice impact frame, the macro frames via
// drawNo10, the muffle closing 0.70-1.05) and the brief's audio cues. Replace (SPEC.md §3).

import type { Shot } from '../timeline';
import { clamp, ease, lerp } from '../../engine/math';
import { BallSpin } from '../../engine/pixel';
import { SEQ, drawBall, drawNo10, galeImpact, lensAt, no10At, placeholderShot, warp } from './common';

const spin = new BallSpin();

export const shotSquash: Shot = {
  ...placeholderShot(3, 'Squash', 1.6, 303, {
    render(env, t) {
      const ctx = env.ctx;
      ctx.fillStyle = '#1d4a26';
      ctx.fillRect(0, 290, 640, 70);
      const key = no10At(SEQ[3], t);
      drawNo10(env, key, 200, 300, 2);
      const sq = t < 0.12 ? 0 : t < 0.62 ? ease.outCubic(clamp((t - 0.12) / 0.35)) : 0;
      const st = t >= 0.62 ? clamp(1 - (t - 0.62) / 0.1) : 0;
      const bx = t < 0.62 ? 360 : lerp(360, 700, clamp((t - 0.62) / 0.04));
      drawBall(env, spin, bx, 240, 23, 2, 0.4, 0.8, 'cobalt', {
        sx: lerp(1, 0.58, sq) * lerp(1, 1.35, st), sy: lerp(1, 1.25, sq) * lerp(1, 0.8, st), dent: 0.18 * sq,
      });
      if (t >= 0.12 && t < 0.62) lensAt(env, 330, 240, 0.2 * ease.outQuad(clamp((t - 0.12) / 0.1)), 0.18);
      if (t >= 0.12 && t < 0.12 + 3 / 60) galeImpact(env.fx, 1);
      if (t >= 0.62 && t < 0.7) {
        env.fx.flash = 0.5 * (1 - (t - 0.62) / 0.08);
        env.fx.flashColor = [238, 251, 255];
      }
    },
  }),
  rate: (t) => warp(t, [[0.12, 0.5, 0.08]]),
  cues: [
    { at: 0.12, fn: (env) => (env.sfx.kick(1.4), env.sfx.squash(0.5)) },
    { at: 0.62, fn: (env) => (env.sfx.crack(1.2), env.sfx.boom(1.0), env.cam.hit(0.8)) },
    { at: 0.66, fn: (env) => env.sfx.whine(1.9, 0.12) },
    { at: 1.15, fn: (env) => env.sfx.breath() },
  ],
};
