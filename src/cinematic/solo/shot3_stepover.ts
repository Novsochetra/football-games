// SHOT 3 — STEP-OVER (1.6 s), defender A. PLACEHOLDER: the front-view pool, FrontTouch / StepOver / Break at x2 -> x3,
// the chronophotograph of the step-over (F2-F4 exposures), fx.echo on THE SELL (+0.012) and THE CUT (-0.012), the
// ultraviolet/ivory impact frames, the beat-snap camera, the STEP-OVER tag, the spot iris, and the brief's audio
// cues. Replace with the real shot (SPEC.md §3). Keep the export, name, dur and seed.

import type { Shot } from '../timeline';
import { placeholderShot, stageDemo } from './placeholder';
import { RATE, TOMS, echoAt, marqueeTag, onFrames, onGrid, soloImpact } from './common';

const demo = stageDemo(3, {
  x: 320, y: 300, hole: [110, 150], pool: [90, 22], beamFrom: [320, -40], ball: true,
  dim: (t) => (t < 1.3 ? 0.8 : 0.8 + 0.08 * Math.min(1, (t - 1.3) / 0.15)),
  cam: [[0, 0, 0, 1], [0.4, 0, -10, 1.12], [0.8, -90, -10, 1.12], [1.2, -90, -10, 1.0]],
  flares: [0.4, 0.8],
  ghosts: [[0.14, 0.5], [0.27, 0.5], [0.4, 0.9]],
});

export const shotStepOver: Shot = {
  ...placeholderShot(3, 'Step-over', 1.6, 503, {
    ...demo,
    render(env, t) {
      demo.render!(env, t);
      echoAt(env, t, 0.4, 4, 0.8, 0.012, { sx: 320, sy: 200, R: 0.35 });
      echoAt(env, t, 0.8, 3, 0.6, -0.012, { sx: 320, sy: 200, R: 0.35 });
      if (onFrames(t, 0.4, 2)) soloImpact(env.fx, 1);
      marqueeTag(env.ctx, 'STEP-OVER', 24, 60, t - 0.45);
    },
  }),
  rate: RATE[3],
  cues: [
    { at: onGrid(0, 'FT1 touch'), fn: (env) => env.sfx.tom(TOMS.A2) },
    { at: 0.2, fn: (env) => env.sfx.hat() },
    { at: 0.3, fn: (env) => (env.sfx.hat(true), env.sfx.whoosh(0.15, 300, 2400, 0.3)) },
    { at: onGrid(0.4, 'THE SELL'), fn: (env) => (env.sfx.kickDrum(0.8), env.sfx.whoosh(0.2, 300, 1600, 0.5, 0.6)) },
    { at: onGrid(0.8, 'THE CUT'), fn: (env) => (env.sfx.snare(1.0), env.sfx.kick(0.4), env.sfx.whoosh(0.2, 300, 2400, 0.5, -0.6)) },
    { at: 0.85, fn: (env) => env.sfx.tom(TOMS.C3) },
    { at: 0.95, fn: (env) => env.sfx.tom(TOMS.A2) },
    { at: 1.05, fn: (env) => env.sfx.tom(TOMS.F2) },
    { at: 1.1, fn: (env) => (env.sfx.boom(0.2), env.sfx.scuff()) },
    { at: onGrid(1.2, 'OLE 1'), fn: (env) => env.sfx.ole(1) },
    { at: 1.45, fn: (env) => env.sfx.lightsOff(0.3) },
  ],
};
