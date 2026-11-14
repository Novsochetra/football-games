// SHOT 6 — FOOTPRINTS OF AIR (2.6 s). PLACEHOLDER: a labelled card with a demo of this shot's engine pieces (the
// down-the-pitch ground with a crane, the stamps placed with projectDecal and breathing mist, No.10's back frames
// via drawNo10 at x2, the flash wave in the stands, GOAL!, the name card, the fade) and the brief's audio cues
// (the palm blow's G-B-D chord). Replace (SPEC.md §6).

import type { Shot } from '../timeline';
import { clamp, ease, lerp } from '../../engine/math';
import { slamTitle } from '../../art/fx';
import {
  AIR_TONES, BLINK, DOWN_PITCH_VIEW, SEQ, STAMPS, STRIKE, TITLE_STYLE, drawDownPitch, drawNo10, drawStamp, nameCard, no10At,
  placeholderShot, projectDecal,
} from './common';

export const shotFootprints: Shot = {
  ...placeholderShot(6, 'Footprints of air', 2.6, 306, {
    render(env, t) {
      const ctx = env.ctx;
      const c = ease.inOutQuad(clamp(t / 1.3));
      const v = { ...DOWN_PITCH_VIEW, x: STRIKE.x - 40 - 30 * c, z: STRIKE.z - 8, h: lerp(18, 48, c), f: lerp(560, 440, c), horizon: lerp(112, 140, c) };
      drawDownPitch(ctx, env.art.stadium, v, t, { bulge: 0.3, flashWave: t >= 0.5 && t < 0.8 ? (t - 0.5) / 0.3 : undefined });
      for (const s of STAMPS) {
        const p = projectDecal(s.x, s.z);
        drawStamp(ctx, p.x, p.y, (s.id === 3 ? 20 : 13) * p.s, 1, { squash: p.k, mist: t >= 1.5 && t < 2.2 ? 1 : 0.4, time: t });
      }
      drawNo10(env, no10At(SEQ[6], t), 320, 330, 2);
      if (t >= 0.75) slamTitle(ctx, 'GOAL!', 320, 120, 72, t - 0.75, { stagger: 0.07, ...TITLE_STYLE });
      if (t >= 1.7) nameCard(ctx, t - 1.7);
      if (t > 2.25) {
        env.fx.flash = ease.inQuad(clamp((t - 2.25) / 0.35));
        env.fx.flashColor = BLINK.fade;
      }
    },
  }),
  cues: [
    { at: 0.02, fn: (env) => env.sfx.kick(0.25) },
    { at: 0.3, fn: (env) => env.sfx.breath() },
    { at: 0.5, fn: (env) => env.sfx.boom(0.4, 0.9) },
    { at: 0.7, fn: (env) => env.sfx.breath() },
    { at: 0.75, fn: (env) => (env.sfx.stinger(), env.sfx.whistle(), env.sfx.crowd(3, 0.5)) },
    {
      at: 1.3,
      fn: (env) => {
        env.sfx.breath(0.6);
        for (const f of [AIR_TONES.G5, AIR_TONES.B5, AIR_TONES.D6]) env.sfx.airTone(f, 0.15);
      },
    },
    { at: 1.5, fn: (env) => env.sfx.whoosh(0.4, 600, 200, 0.15) },
  ],
};
