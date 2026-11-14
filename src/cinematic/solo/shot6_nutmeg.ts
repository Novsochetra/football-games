// SHOT 6 — NUTMEG (1.2 s), defender D. PLACEHOLDER: the reverse angle on the pool, FrontTouch / Nutmeg / Break at
// x1 -> x2, the violet open (fx.flash), the money-frame slow window (rate 0.2, clean: no echo, no impact), the NUTMEG
// tag, OLÉ! 4 with all pads flaring, and the brief's audio cues. Replace with the real shot (SPEC.md §6). Keep the
// export, name, dur and seed.

import type { Shot } from '../timeline';
import { clamp } from '../../engine/math';
import { placeholderShot, stageDemo } from './placeholder';
import { RATE, TOMS, fourCount, marqueeTag, onGrid, padsFor } from './common';

const demo = stageDemo(6, {
  x: 320, y: 290, hole: [140, 150], pool: [140, 26], beamFrom: [320, -40], ball: true,
  dim: () => 0.8,
  cam: [[0, 0, 0, 1], [0.8, 0, 0, 1.0]],
  flares: [0.4],
});

export const shotNutmeg: Shot = {
  ...placeholderShot(6, 'Nutmeg', 1.2, 506, {
    ...demo,
    render(env, t) {
      demo.render!(env, t);
      if (t < 3 / 60) {
        env.fx.flash = 0.6 * (1 - clamp(t / (3 / 60)));
        env.fx.flashColor = [122, 77, 255];
      }
      marqueeTag(env.ctx, 'NUTMEG', 24, 60, t - 0.45);
      fourCount(env.ctx, padsFor(6), t, { flareAt: 0.8 });
    },
  }),
  rate: RATE[6],
  cues: [
    { at: onGrid(0, 'FT1 touch'), fn: (env) => env.sfx.tom(TOMS.F2) },
    { at: 0.1, fn: (env) => env.sfx.snare(0.3) },
    { at: 0.2, fn: (env) => env.sfx.snare(0.5) },
    { at: 0.3, fn: (env) => env.sfx.snare(0.7) },
    { at: onGrid(0.4, 'THE POKE'), fn: (env) => (env.sfx.kickDrum(0.9), env.sfx.crash(0.7), env.sfx.kick(0.25)) },
    { at: 0.65, fn: (env) => env.sfx.ooh(0.4) },
    { at: onGrid(0.8, 'OLE 4'), fn: (env) => (env.sfx.ole(4), env.sfx.crowd(1.5, 0.4), env.sfx.tom(TOMS.D3)) },
    { at: 0.9, fn: (env) => (env.sfx.tom(TOMS.D3), env.sfx.boom(0.2)) },
    { at: 1.0, fn: (env) => env.sfx.tom(TOMS.C3) },
    { at: 1.1, fn: (env) => env.sfx.tom(TOMS.A2) },
  ],
};
