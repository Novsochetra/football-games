// SHOT 4 — AIR STEPS (2.6 s), the ball's scene. PLACEHOLDER: a labelled card with a demo of this shot's engine
// pieces (the cobalt ball on airStepHeight, vaporRibbon, machCone, air slivers, stamps + bursts + shocks, the
// jumpBlock / flinch / blown puppets, the late boom's refraction band, the Mach wake, the recoil spring, the
// muffle snapping open at 0.92) and the brief's audio cues. Replace (SPEC.md §4).

import type { Shot } from '../timeline';
import { clamp } from '../../engine/math';
import { BallSpin } from '../../engine/pixel';
import { POSES, RIVAL_KIT, RIVAL_KIT_B, drawPuppet, renderPuppet } from '../../art/puppet';
import {
  BLINK, STAMPS, Trail, airSliver, airStepHeight, drawBall, drawStamps, machCone, machWake, placeholderShot, pressureStamp,
  recoilSpring, refractionBand, stampDecals, stampShock, vaporRibbon, warp, type StampDecal,
} from './common';

const GY = 300, PXM = 40; // ground line, px per metre (demo scale)
const bx = (t: number) => 60 + 210 * t;
const by = (t: number) => GY - airStepHeight(t) * PXM - 12;
const spin = new BallSpin();
const trail = new Trail(18);
let decals: StampDecal[] = [];
let burst = [false, false, false];

export const shotAirSteps: Shot = {
  ...placeholderShot(4, 'Air steps', 2.6, 304, {
    init() {
      trail.clear();
      burst = [false, false, false];
      decals = stampDecals((s) => ({ x: bx(s.t4), y: GY, at: s.t4, r: s.r4 }));
    },
    update(env, t) {
      trail.push(bx(t), by(t));
      STAMPS.forEach((s, i) => {
        if (!burst[i] && t >= s.t4) {
          burst[i] = true;
          pressureStamp(env, bx(s.t4), GY, s.r4);
          env.cam.hit(0.3);
        }
      });
    },
    render(env, t) {
      const ctx = env.ctx;
      ctx.translate(-recoilSpring(t, 0.92, 30), 0);
      ctx.fillStyle = '#287a35';
      ctx.fillRect(-40, GY, 720, 60);
      drawStamps(ctx, decals, t);
      machWake(ctx, bx(0.92), GY, t - 0.92, { len: 150 });
      const d1 = t < 0.62 ? POSES.stand : t < 0.92 ? POSES.jumpBlock : POSES.blown;
      const lift = t >= 0.62 && t < 0.92 ? 30 : t >= 0.92 ? 30 + 40 * clamp((t - 0.92) / 0.5) : 0;
      drawPuppet(ctx, renderPuppet(RIVAL_KIT, { ...d1, spin: t >= 0.92 ? -2.4 * clamp((t - 0.92) / 0.5) : 0 }, { k: 0.9, facing: -1 }), bx(0.72) + 10, GY - 40 * 0.9 - lift, 1);
      drawPuppet(ctx, renderPuppet(RIVAL_KIT_B, t < 1.1 ? POSES.stand : POSES.flinch, { k: 0.9, facing: -1 }), bx(1.28) + 14, GY - 36, 1);
      env.parts.draw(ctx, 0);
      const x = bx(t), y = by(t);
      vaporRibbon(ctx, trail.pts, 10, t, 1, 12);
      machCone(ctx, x, y, -0.05, 120);
      for (const s of STAMPS) if (t >= s.t4 - 0.04 && t < s.t4 + 0.04) airSliver(ctx, bx(s.t4), y + 12, GY, 30);
      drawBall(env, spin, x, y, 6, 2, 0.4, 0.8, 'cobalt');
      env.parts.draw(ctx, 1);
      for (const s of STAMPS) stampShock(env, bx(s.t4), GY, t - s.t4);
      refractionBand(env.fx, (t - 0.92) / 0.2, 0.04);
      refractionBand(env.fx, (t - 1.55) / 0.2, 0.025, -1);
      env.fx.ca = t >= 0.92 && t < 1.1 ? 0.006 : 0.002;
      if (t >= 2.6 - 2 / 60) {
        env.fx.flash = 0.7;
        env.fx.flashColor = BLINK.cyan;
      }
    },
  }),
  rate: (t) => warp(t, [[0.72, 0.1, 0.12]]),
  cues: [
    { at: 0.35, fn: (env) => (env.sfx.boom(0.5, 0), env.sfx.crackle(0.3, 0.05)) },
    { at: 0.62, fn: (env) => env.sfx.kick(0.1) },
    { at: 0.72, fn: (env) => env.sfx.boom(0.5, 0) },
    { at: 0.92, fn: (env) => (env.sfx.sonicBoom(1.0, -0.3), env.sfx.crowd(2.5, 0.45), env.cam.hit(0.6)) },
    { at: 1.55, fn: (env) => env.sfx.sonicBoom(0.6, 0.3) },
    { at: 1.85, fn: (env) => (env.sfx.boom(0.9), env.sfx.crack(0.8)) },
    { at: 2.3, fn: (env) => env.sfx.whoosh(0.35, 500, 6000, 0.5) },
  ],
};
