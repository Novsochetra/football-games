// SHOT 5 · MERIDIAN (1.3 s). PLACEHOLDER: a rough demo of the engine pieces this shot uses (the field's own broadcast
// view from LAYOUT / PATH under the ink page, the whole thread across the pitch, the faint needle eyes on the turf, the
// cross-stitch X, the pulse down the wire, No.10 T9 and No.7's run as 0.5x caches, the wrong-way defenders and keeper
// cached as puppets in prepare(), the ball and No.7 meeting on the X) with the brief's audio cues.
// Replace with the real shot (SPEC.md §5).

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { clamp, ease, lerp } from '../../engine/math';
import { drawGlow, glowOf } from '../../engine/particles';
import { KEEPER_KIT, POSES, RIVAL_KIT, RIVAL_KIT_B, RIVAL_KIT_C, RIVAL_KIT_D } from '../../art/puppet';
import { drawShadow } from '../../art/stadium';
import {
  HEX, LAYOUT, PAL, PATH, THREAD_NOTES as N, cachePuppet, crossStitch, drawFieldBackdrop, drawGoal, drawNo10Boxed, drawNo7Boxed,
  inkGrade, needleEye, placeholderShot, threadLine, warmNo10Boxed, warmNo7, type No7Key,
} from './common';

type Pup = ReturnType<typeof cachePuppet>;
let cast: { p: Pup; x: number; z: number; h: number }[] = [];
const RUN: No7Key[] = ['Run.R1', 'Run.R4', 'Run.R5', 'Run.R8'];
const ARRIVE = 0.9;

export const shotMeridian: Shot = {
  ...placeholderShot(5, 'Meridian', 1.3, 405, {
    prepare(env) {
      const K = 0.42;
      cast = [
        { p: cachePuppet(RIVAL_KIT, POSES.sprawl, K, -1), x: 952, z: 252, h: -8 },
        { p: cachePuppet(RIVAL_KIT_B, POSES.stumble, K, 1), x: 1030, z: 244, h: 0 },
        { p: cachePuppet(RIVAL_KIT_C, POSES.stumble, K, -1), x: 1040, z: 262, h: 0 },
        { p: cachePuppet(RIVAL_KIT_D, POSES.sitWrongWay, K, -1), x: 1062, z: 300, h: -9 },
        { p: cachePuppet(KEEPER_KIT, POSES.gkReady, K, -1), x: 1168, z: 252, h: 0 },
      ];
      warmNo10Boxed(env, ['T9'], 0.5);
      warmNo7(env, RUN, 0.5);
    },
    render(env, t) {
      if (!cast.length) shotMeridian.prepare!(env);
      const ctx = env.ctx;
      const zoom = t < 0.5 ? lerp(1.6, 0.85, ease.outCubic(t / 0.5)) : t < 0.9 ? 0.85 : lerp(0.85, 1.5, ease.inCubic(clamp((t - 0.9) / 0.4)));
      const cx = t < 0.9 ? lerp(1000, 1030, clamp(t / 0.5)) : lerp(1030, LAYOUT.target.x, ease.inCubic(clamp((t - 0.9) / 0.4)));
      const cy = t < 0.9 ? 250 : lerp(250, LAYOUT.target.z - 20, clamp((t - 0.9) / 0.4));
      env.cam.set(cx, cy, zoom, 0);
      env.world();
      drawFieldBackdrop(ctx, env.art.stadium, cx, cy, t);
      drawGoal(ctx, 'back');
      for (const c of cast) {
        drawShadow(ctx, c.x, c.z, 11, 0.35);
        ctx.drawImage(c.p.cv, Math.round(c.x - c.p.ox), Math.round(c.z - c.h - 40 * 0.42 - c.p.oy));
      }
      drawGoal(ctx, 'front');
      inkGrade(ctx, 0.85);
      // The whole thread, the eyes on the turf, the X.
      const uBall = lerp(PATH.eyes[2], 1, clamp(t / ARRIVE));
      const pts = PATH.points(0, uBall, 3).map((q) => ({ x: q.x, y: q.z }));
      threadLine(ctx, pts, 1.5, 1);
      PATH.eyes.forEach((u) => {
        const e = PATH.at(u);
        needleEye(ctx, e.x, e.z, 16, 0.8, Math.atan2(PATH.dir(u).z, PATH.dir(u).x), 0.5, 0.45);
      });
      crossStitch(ctx, LAYOUT.target.x, LAYOUT.target.z, 6 * (1 + 0.15 * Math.sin(t * 18)), 1, 0.5);
      // Pulse of pearl light down the wire (0.15 s on).
      const pu = clamp((t - 0.15) / 0.35);
      if (pu > 0 && pu < 1) {
        const q = PATH.at(pu * uBall);
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, glowOf(PAL.pearl), q.x, q.z, 8, 0.9);
        ctx.globalCompositeOperation = 'source-over';
      }
      drawNo10Boxed(env, 'T9', LAYOUT.strike.x - 8, LAYOUT.strike.z, 0.5);
      const ru = clamp(t / ARRIVE);
      const nx = lerp(1050, LAYOUT.target.x - 4, ru), nz = lerp(320, LAYOUT.target.z + 2, ru);
      drawShadow(ctx, nx, nz, 10, 0.35);
      drawNo7Boxed(env, RUN[Math.floor(t / 0.07) % 4], nx, nz, 0.5);
      const b = PATH.at(uBall);
      ctx.fillStyle = HEX.ink;
      ctx.fillRect(Math.round(b.x - 3), Math.round(b.z - 4), 6, 6);
      ctx.fillStyle = HEX.pearl;
      ctx.fillRect(Math.round(b.x - 2), Math.round(b.z - 3), 4, 4);
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.emerald), b.x, b.z - 1, 9, 0.7);
      ctx.globalCompositeOperation = 'source-over';
      if (t > 0.9) {
        const [u, v] = env.cam.toUV(nx, nz - 10);
        env.fx.radial = 0.3 * clamp((t - 0.9) / 0.2);
        env.fx.radialX = u;
        env.fx.radialY = v;
      }
      env.screen();
      void VW;
      void VH;
    },
  }),
  cues: [
    { at: 0, fn: (env) => env.sfx.whoosh(0.5, 900, 250, 0.35) },
    { at: 0.15, fn: (env) => env.sfx.zip(0.4) },
    { at: 0.3, fn: (env) => env.sfx.crowd(1.3, 0.35) },
    { at: 0.9, fn: (env) => env.sfx.whoosh(0.3, 300, 2600, 0.45) },
    // The three eye notes re-plucked softly in tremolo, like a lute holding a chord.
    ...Array.from({ length: 12 }, (_, k) => ({ at: 0.04 + k * 0.1, fn: (env: Env) => env.sfx.pluck([N.E5, N.Fs5, N.A5][k % 3], 0.45, 0.12) })),
  ],
};
