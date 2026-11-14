// SHOT 7 — ON THE MARK (2.4 s). PLACEHOLDER: Dribble into Settle at x2, the trail exposures coming home, the SOLE STOP
// on the final hit, the keeper's second pool, the floodlights slamming back on in three 16ths (dim 0.85 -> 0 ), the
// "1 ON 1" lampTitle, the name card text, the fade to [8,4,14], and the brief's audio cues. Replace with the real
// shot (SPEC.md §7). Keep the export, name, dur and seed.

import type { Shot } from '../timeline';
import { VW } from '../../engine/camera';
import { clamp } from '../../engine/math';
import { placeholderShot, stageDemo } from './placeholder';
import { FADE, HEX, RATE, TOMS, lampTitle, onGrid, pixelText, stage } from './common';

const LIGHTS = [1.6, 1.7, 1.8];
const demo = stageDemo(7, {
  x: 210, y: 320, hole: [100, 140], pool: [80, 14], beamFrom: [560, -30], ball: true,
  dim: (t) => (t < 0.8 ? 0.8 : t < 1.6 ? 0.85 : t < 1.7 ? 0.45 : t < 1.8 ? 0.15 : 0),
  cam: [[0, 0, 0, 1], [0.8, 0, -8, 1.08]],
  flares: [0.8],
  ghosts: [[0, 0.8], [0.2, 0.6], [0.4, 0.4]],
});

export const shotOnTheMark: Shot = {
  ...placeholderShot(7, 'On the mark', 2.4, 507, {
    ...demo,
    render(env, t) {
      demo.render!(env, t);
      const ctx = env.ctx;
      if (t >= 1.0 && t < 1.6) {
        // The keeper's own spot from the top-left: a second pool.
        stage.beam(ctx, 60, -30, 470, 250, 26, 120, 0.14, { t, seed: 7 });
        stage.floorPool(ctx, 470, 250, 60, 10, 0.3);
      }
      if (t >= 1.6) lampTitle(ctx, ['1 ', 'ON ', '1'], VW / 2, 70, 48, t, LIGHTS);
      if (t >= 1.7) {
        const a = clamp((t - 1.7) / 0.2);
        ctx.globalAlpha = a;
        pixelText(ctx, 'SPOTLIGHT SOLO', 30, 250, 16, HEX.ivory, 'left', HEX.plum);
        pixelText(ctx, 'No.10 · SPECIAL DRIBBLE', 30, 272, 10, HEX.lilac, 'left', HEX.plum);
        pixelText(ctx, '4 DEFENDERS BEATEN', VW - 30, 258, 12, HEX.ivory, 'right', HEX.plum);
        ctx.globalAlpha = 1;
      }
      if (t >= 2.05) {
        env.fx.flash = clamp((t - 2.05) / 0.35);
        env.fx.flashColor = FADE;
      }
    },
  }),
  rate: RATE[7],
  cues: [
    { at: onGrid(0, 'touch'), fn: (env) => env.sfx.tom(TOMS.D3) },
    { at: onGrid(0.4, 'touch'), fn: (env) => env.sfx.tom(TOMS.C3) },
    { at: 0.6, fn: (env) => env.sfx.snare(0.4) },
    { at: 0.7, fn: (env) => env.sfx.snare(0.55) },
    { at: onGrid(0.8, 'SOLE STOP'), fn: (env) => (env.sfx.kickDrum(1.0), env.sfx.crash(1.0), env.sfx.boom(0.5)) },
    { at: 0.86, fn: (env) => (env.sfx.choke(), env.sfx.duck(0.95, 0.8)) },
    { at: onGrid(1.0, 'keeper spot'), fn: (env) => env.sfx.spotOn(0.8) },
    { at: 1.4, fn: (env) => env.sfx.shing(1.1) },
    { at: onGrid(1.6, 'lights 1'), fn: (env) => (env.sfx.lightsOn(1.0), env.sfx.kickDrum(0.8), env.sfx.crash(1.0), env.sfx.crowd(3, 0.5)) },
    { at: onGrid(1.7, 'lights 2'), fn: (env) => env.sfx.lightsOn(0.8) },
    { at: onGrid(1.8, 'lights 3'), fn: (env) => (env.sfx.lightsOn(0.7), env.sfx.boom(0.4), env.sfx.shing(1.0)) },
  ],
};
