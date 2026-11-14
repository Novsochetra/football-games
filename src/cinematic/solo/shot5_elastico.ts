// SHOT 5 — ELASTICO (1.2 s), defender C. PLACEHOLDER: the spot behind the camera (footlights, no beam), FrontTouch /
// Elastico / Break west strip at x2 -> x3, the SNAP hit-stop, the impact frames and echo, the ELASTICO tag, the ghost
// wipe (exposures at x3-x6 on 16ths), and the brief's audio cues. Replace with the real shot (SPEC.md §5). Keep the
// export, name, dur and seed.

import type { Shot } from '../timeline';
import { clamp } from '../../engine/math';
import { placeholderShot, stageDemo } from './placeholder';
import { Afterimages, PAL, RATE, TOMS, drawSoloGhost, echoAt, marqueeTag, onFrames, onGrid, soloAt, soloImpact, SEQ } from './common';

const demo = stageDemo(5, {
  x: 320, y: 322, hole: [130, 160], pool: [110, 24], beamFrom: null, ball: true,
  dim: () => 0.8,
  cam: [[0, 0, 0, 1], [0.4, 0, -10, 1.15], [0.8, 0, 0, 1.0]],
  flares: [0.4],
  flip: (t) => t >= 0.55,
});
const wipe = new Afterimages();
const WIPE: [number, number, number][] = [[0.8, 3, 200], [0.9, 4, 330], [1.0, 5, 460], [1.1, 6, 590]];

export const shotElastico: Shot = {
  ...placeholderShot(5, 'Elastico', 1.2, 505, {
    ...demo,
    init(env) {
      demo.init!(env);
      wipe.clear();
    },
    render(env, t) {
      env.fx.radial = 0.2 * (1 - clamp(t / (3 / 60)));
      demo.render!(env, t);
      echoAt(env, t, 0.4, 3, 0.6, 0.012, { sx: 320, sy: 220, R: 0.35 });
      if (onFrames(t, 0.4, 2)) soloImpact(env.fx, 1);
      marqueeTag(env.ctx, 'ELASTICO', 24, 60, t - 0.45);
      // The ghost wipe: exposures of his current frame at x3, x4, x5, x6 sweeping left to right (pure function of t).
      env.screen();
      for (const [at, sc, x] of WIPE) {
        if (t < at) continue;
        const solid = sc === 6;
        drawSoloGhost(env, soloAt(SEQ[5], at), x, 360 + sc * 20, sc, { flip: true, alpha: solid ? 1 : 0.6, fill: solid ? PAL.uv : undefined });
      }
    },
  }),
  rate: RATE[5],
  cues: [
    { at: onGrid(0, 'FT1 touch'), fn: (env) => (env.sfx.kickDrum(0.6), env.sfx.tom(TOMS.D2)) },
    { at: 0.2, fn: (env) => env.sfx.hat() },
    { at: 0.3, fn: (env) => env.sfx.hat() },
    { at: onGrid(0.4, 'SNAP'), fn: (env) => (env.sfx.snare(1.0), env.sfx.crash(0.6), env.sfx.kick(0.3)) },
    { at: 0.75, fn: (env) => (env.sfx.boom(0.2), env.sfx.scuff()) },
    { at: onGrid(0.8, 'OLE 3'), fn: (env) => (env.sfx.ole(3), env.sfx.tom(TOMS.D3)) },
    { at: 0.9, fn: (env) => env.sfx.tom(TOMS.C3) },
    { at: 1.0, fn: (env) => (env.sfx.tom(TOMS.A2), env.sfx.whoosh(0.25)) },
    { at: 1.1, fn: (env) => env.sfx.tom(TOMS.F2) },
  ],
};
