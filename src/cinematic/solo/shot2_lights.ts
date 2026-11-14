// SHOT 2 — HOUSE LIGHTS (1.2 s). PLACEHOLDER: the field stadium with its floodlight banks dying on the beat
// (drawFieldBackdrop towers), the stage dim 0 -> 0.45 -> 0.8, phone lights and fluorescent lines after the dim,
// the follow-spot slamming on at 0.80 (beam, floor pool, stage hole, beat flare), Dribble F1-F8 at x2, and the
// brief's audio cues. Replace with the real shot (SPEC.md §2). Keep the export, name, dur and seed.

import type { Shot } from '../timeline';
import { VW } from '../../engine/camera';
import { clamp } from '../../engine/math';
import { placeholderShot } from './placeholder';
import {
  SEQ, TOMS, drawFieldBackdrop, drawPhoneLights, drawSolo, soloAt, soloGrade, stage, onGrid,
} from './common';

const CAM = { x: 900, y: 214, zoom: 1.3 };

export const shotLights: Shot = {
  ...placeholderShot(2, 'House lights', 1.2, 502, {
    render(env, t) {
      const ctx = env.ctx;
      const st = env.art.stadium;
      env.cam.set(CAM.x, CAM.y, CAM.zoom, 0);
      env.world();
      // Banks: far-left and far-right die at 0.00 (glow fades over 3 frames), the rest at 0.40.
      const fade = (at: number) => (t < at ? 1 : clamp(1 - (t - at) / (3 / 60)));
      drawFieldBackdrop(ctx, st, CAM.x, CAM.y, t, { towers: [fade(0), fade(0.4), fade(0.4), fade(0)] });
      const dim = t < 0.4 ? 0.45 : 0.8;
      const spot = t >= 0.8;
      const fl = stage.flare(t, 0.8);
      env.screen();
      stage.dim(ctx, dim, spot ? [{ x: 170, y: 170, rx: 90 * fl.size, ry: 130 * fl.size, soft: 40 }] : []);
      env.world();
      if (t >= 0.4) {
        stage.fluoroLines(ctx, 0.3);
        drawPhoneLights(ctx, st, CAM.x, t, clamp((t - 0.4) / 0.15));
      }
      env.screen();
      if (spot) {
        stage.beam(ctx, 560, -30, 170, 300, 30, 150, 0.18, { t, seed: 2 });
        stage.floorPool(ctx, 170, 300, 70 * fl.size, 12 * fl.size, 0.35 * fl.gain);
      }
      drawSolo(env, soloAt(SEQ[2], t), 170, 300, 2);
      soloGrade(env.fx);
      void VW;
    },
  }),
  cues: [
    { at: onGrid(0, 'bank 1'), fn: (env) => (env.sfx.lightsOff(1.0), env.sfx.tom(TOMS.D2), env.sfx.crowd(1.2, 0.18)) },
    { at: 0.2, fn: (env) => env.sfx.scuff(0.1) },
    { at: onGrid(0.4, 'bank 2'), fn: (env) => (env.sfx.lightsOff(0.9), env.sfx.tom(TOMS.D2), env.sfx.duck(0.5, 0.6)) },
    { at: 0.55, fn: (env) => env.sfx.ooh(0.3) },
    { at: 0.6, fn: (env) => env.sfx.scuff(0.1) },
    { at: onGrid(0.8, 'spot on'), fn: (env) => (env.sfx.spotOn(1.0), env.sfx.tom(TOMS.F2)) },
    { at: 0.9, fn: (env) => env.sfx.scuff(0.1) },
    { at: onGrid(1.0, 'touch'), fn: (env) => (env.sfx.tom(TOMS.A2), env.sfx.hat()) },
    { at: 1.1, fn: (env) => env.sfx.scuff(0.1) },
  ],
};
