// SHOT 2 — THE LOAD (1.9 s). PLACEHOLDER: a labelled card with a demo of this shot's engine pieces (No.10's
// frame schedule via drawNo10, the inhale field, blades leaning to the boot, isobars, the ratchet pinch lens,
// the dew mirror, the smear arc, the muffle at 0.35) and the brief's audio cues. Replace (SPEC.md §2).

import type { Shot } from '../timeline';
import { clamp, ease } from '../../engine/math';
import {
  BLINK, SEQ, dewMirror, drawBlades, drawNo10, inhaleField, isobars, leanToward, lensAt, makeBlades, no10At, no10Point,
  placeholderShot, smearArc, springBack, steps, type Blade,
} from './common';

let blades: Blade[] = [];
const GX = 300, GY = 300, D = 2;

export const shotLoad: Shot = {
  ...placeholderShot(2, 'The load', 1.9, 302, {
    init(env) {
      blades = makeBlades(env.rng, 120, 520, GY, 90);
    },
    update(env, t, dt) {
      if (t > 0.65 && t < 1.55) {
        const [bx, by] = no10Point(env, 'F5a', 'boot', GX, GY, D);
        inhaleField(env, bx - 10, by, Math.round(dt * 600 + 0.4), { life: [0.06, 0.11] });
      }
    },
    render(env, t) {
      const ctx = env.ctx;
      ctx.fillStyle = '#245f2d';
      ctx.fillRect(0, GY, 640, 60);
      const key = no10At(SEQ[2], t);
      const run = t < 0.55 ? (0.55 - t) * 220 : 0;
      drawNo10(env, key, GX - run, GY, D);
      const [bx, by] = no10Point(env, 'F5a', 'boot', GX, GY, D);
      drawBlades(ctx, blades, t > 0.65 && t < 1.55 ? leanToward(bx - 10, by, 40) : () => 0);
      env.parts.draw(ctx, 1);
      if (t > 0.65 && t < 1.6) {
        const tight = 1 - 0.3 * clamp((t - 0.65) / 0.9);
        isobars(ctx, bx, by - 20, [40, 58, 76].map((r) => r * tight), { squash: 0.8, t, alpha: 0.35 });
      }
      if (t >= 1.12 && t < 1.5) dewMirror(env, bx + 30, by - 70, 32 * clamp((t - 1.12) / (4 / 60)), { glint: t > 1.3 ? 1 : 0 });
      if (t >= 1.58) smearArc(ctx, { x: bx - 20, y: by - 30 }, { x: bx, y: by - 10 }, { x: bx + 30, y: by }, 16, 1, clamp((t - 1.58) / 0.12));
      const pinch =
        t < 0.65 ? 0 : t < 0.85 ? -0.1 * ease.inQuad((t - 0.65) / 0.2) : t < 1.55 ? steps(t, [[0, -0.1], [0.85, -0.18], [1.2, -0.25]]) : springBack(t, 1.55, -0.25, 0.15);
      if (pinch) lensAt(env, bx, by, pinch, 0.22);
      env.fx.flash = t >= 1.8 ? clamp((t - 1.8) / 0.08) : t < 0.08 ? 0.6 * (1 - t / 0.08) : 0;
      env.fx.flashColor = t >= 1.8 ? BLINK.ice : BLINK.flashIn;
    },
  }),
  cues: [
    { at: 0, fn: (env) => (env.sfx.crowd(1.9, 0.15), env.sfx.kick(0.15)) },
    { at: 0.15, fn: (env) => env.sfx.kick(0.15) },
    { at: 0.3, fn: (env) => env.sfx.kick(0.15) },
    { at: 0.55, fn: (env) => (env.sfx.kick(0.45), env.sfx.boom(0.25), env.cam.hit(0.25)) },
    { at: 0.6, fn: (env) => env.sfx.inhale(0.9) },
    { at: 0.85, fn: (env) => env.sfx.earPop(0.6) },
    { at: 1.2, fn: (env) => env.sfx.earPop(0.8) },
    { at: 1.48, fn: (env) => env.sfx.shing(1.4) },
    { at: 1.58, fn: (env) => env.sfx.whoosh(0.3, 300, 3000, 0.5) },
  ],
  rate: (t) => (t < 0.55 ? 1 : t < 0.65 ? 1 - 0.88 * ((t - 0.55) / 0.1) : t < 1.55 ? 0.12 : t < 1.65 ? 0.12 + 0.88 * Math.pow((t - 1.55) / 0.1, 2) : 1),
};
