// SHOT 5 — PRESSURE FRONT (1.4 s). PLACEHOLDER: a labelled card with a demo of this shot's engine pieces (the
// net envelope netExhale driving drawGoal's bulge + corner dimple + the frame knock, the gkSwept keeper, the
// exhale mist and the droplet curtain) and the brief's audio cues. Replace (SPEC.md §5).

import type { Shot } from '../timeline';
import { FIELD, drawGoal } from '../../art/stadium';
import { KEEPER_KIT, POSES, drawPuppet, renderPuppet } from '../../art/puppet';
import { BLINK, dropletCurtain, exhaleMist, netExhale, placeholderShot } from './common';

// Draw the field goal at x2 around its mouth.
const OX = 320 - (FIELD.goalX + 10) * 2, OY = 200 - (FIELD.goalFar + 40) * 2;

export const shotFront: Shot = {
  ...placeholderShot(5, 'Pressure front', 1.4, 305, {
    update(env, t, dt) {
      const n = netExhale(t);
      if (n.mist > 0) exhaleMist(env, 330, 150, 380, 260, Math.round(n.mist * 2));
      if (t > 0.9 && t < 1.25) dropletCurtain(env, 240, 420, 120, Math.round(dt * 400));
    },
    render(env, t) {
      const ctx = env.ctx;
      const n = netExhale(t);
      ctx.save();
      ctx.translate(OX, OY);
      ctx.scale(2, 2);
      drawGoal(ctx, 'back', n.bulge, n.knock, n.dimple > 0 ? { u: 0.15, v: 0.1, amt: n.dimple } : undefined);
      ctx.restore();
      const pose = t < 0.1 ? POSES.gkReady : t < 0.3 ? POSES.gkSwept : { ...POSES.gkDive, spin: 1.45 + 0.2 };
      drawPuppet(ctx, renderPuppet(KEEPER_KIT, pose, { k: 1, facing: -1 }), 250, t < 0.9 ? 250 : 275, 2);
      env.parts.draw(ctx, 1);
      ctx.save();
      ctx.translate(OX, OY);
      ctx.scale(2, 2);
      drawGoal(ctx, 'front', 0, n.knock);
      ctx.restore();
      if (t >= 1.4 - 2 / 60) {
        env.fx.flash = 0.8;
        env.fx.flashColor = BLINK.navy;
      }
    },
  }),
  rate: (t) => (t >= 0.3 && t < 0.62 ? 0.15 : 1),
  cues: [
    { at: 0, fn: (env) => env.sfx.crowd(3, 0.5) },
    { at: 0.3, fn: (env) => env.sfx.whoosh(0.4, 400, 2500, 0.4) },
    { at: 0.62, fn: (env) => env.sfx.kick(0.15) },
    { at: 0.8, fn: (env) => (env.sfx.sonicBoom(0.8), env.sfx.boom(0.6, 0.2), env.sfx.kick(0.5)) },
    { at: 0.85, fn: (env) => env.sfx.crackle(0.6, 0.12) },
    { at: 0.9, fn: (env) => env.sfx.gust(1.4) },
  ],
};
