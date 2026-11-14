// SHOT 4 — SOLE LIFT (2.0 s), defender B (the ball's scene). PLACEHOLDER: SoleLift at x3 on the pool, his exposures of
// F5-F7 on the hop path, the slow window (rate 0.25, the money-frame hold 0.06 at 1.30-1.42), the impact frames at
// 1.30, the SOLE LIFT tag, the whip pan out, and the brief's audio cues. Replace with the real shot (SPEC.md §4).
// Keep the export, name, dur and seed.

import type { Shot } from '../timeline';
import { clamp } from '../../engine/math';
import { placeholderShot, stageDemo } from './placeholder';
import { RATE, TOMS, marqueeTag, onFrames, onGrid, soloImpact } from './common';

const demo = stageDemo(4, {
  x: 300, y: 340, hole: [200, 230], pool: [150, 18], beamFrom: [600, -40], ball: true,
  dim: (t) => (t >= 1.3 && t < 1.42 ? 0.88 : 0.8),
  cam: [[0, 0, 0, 1], [0.4, 0, 0, 1.1], [0.8, 0, -40, 1.2], [1.72, 0, 0, 1.0]],
  flares: [0.4],
  ghosts: [[0.6, 0.7], [0.7, 0.7], [0.8, 0.7]],
});

export const shotSoleLift: Shot = {
  ...placeholderShot(4, 'Sole lift', 2.0, 504, {
    ...demo,
    render(env, t) {
      demo.render!(env, t);
      if (onFrames(t, 1.3, 2)) soloImpact(env.fx, 1);
      if (t >= 1.95) {
        env.fx.radial = 0.25 * clamp((t - 1.95) / (3 / 60));
        env.fx.radialX = 0.5;
        env.fx.radialY = 0.5;
      }
      marqueeTag(env.ctx, 'SOLE LIFT', 24, 60, t - 1.3);
    },
  }),
  rate: RATE[4],
  cues: [
    { at: onGrid(0, 'touch'), fn: (env) => env.sfx.tom(TOMS.F2) },
    { at: 0.3, fn: (env) => env.sfx.scrape(0.9) },
    { at: onGrid(0.4, 'SOLE ON'), fn: (env) => (env.sfx.rim(), env.sfx.kick(0.15)) },
    { at: onGrid(0.5, 'DRAG'), fn: (env) => env.sfx.snare(0.3) },
    { at: onGrid(0.6, 'SCOOP'), fn: (env) => env.sfx.hat() },
    { at: onGrid(0.7, 'FLICK'), fn: (env) => (env.sfx.tom(TOMS.C3), env.sfx.kick(0.2)) },
    { at: onGrid(0.8, 'HOP'), fn: (env) => (env.sfx.kickDrum(0.8), env.sfx.whoosh(0.25, 300, 1800)) },
    { at: 1.0, fn: (env) => env.sfx.crashSwell(0.8) },
    { at: onGrid(1.2, 'fermata'), fn: (env) => env.sfx.tom(TOMS.D2, 0.6) },
    { at: 1.3, fn: (env) => env.sfx.shing(1.4) },
    { at: 1.72, fn: (env) => env.sfx.scuff() },
    { at: onGrid(1.8, 'CUSHION'), fn: (env) => env.sfx.tom(TOMS.A2) },
    { at: onGrid(1.9, 'OLE 2'), fn: (env) => env.sfx.ole(2) },
    { at: 1.95, fn: (env) => env.sfx.whoosh(0.2) },
  ],
};
