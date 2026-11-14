// SHOT 4 · NEEDLE'S EYE (2.4 s): the ball scene as one manga page. PLACEHOLDER: a rough demo of the engine pieces this
// shot uses (MangaPage: three locked slanted panels, page-pans, frozen ink snapshots rebuilt on seek, the whole-page
// pull-back; inside each panel the ink page at 0.85, the pearl ball rolling across, the stitched thread from the panel
// edge, the needle eye, the panel freeze border, the hand-lettered SFX, the defender puppets pokeTackle / lungeL /
// lungeR / stretchBlock) with the brief's hit-stops and audio cues. Replace with the real shot (SPEC.md §4).

import type { Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { clamp, lerp } from '../../engine/math';
import { BallSpin } from '../../engine/pixel';
import { RIVAL_KIT, RIVAL_KIT_B, RIVAL_KIT_C, RIVAL_KIT_D, POSES } from '../../art/puppet';
import {
  DOWN_PITCH_VIEW, MangaPage, PAGE, THREAD_NOTES as N, cachePuppet, drawBall, drawDownPitch, drawGrassFore, inkGrade,
  inkSfx, needleEye, paperFlash, placeholderShot, spinMarks, threadLine, warp,
} from './common';

const page = new MangaPage();
const spin = new BallSpin();
type Pup = ReturnType<typeof cachePuppet>;
let pups: Pup[] = [];
/** Hit-stops: [start, length, rate] (eye 1 the poke, eye 2 the scissors, eye 3 the heel). */
const STOPS: [number, number, number][] = [[0.42, 0.16, 0.06], [1.05, 0.22, 0.05], [1.75, 0.15, 0.08]];
const EYE_X = [430, 320, 360];
const SFX = ['SHK!', 'KLAK!', 'SWSH'];

/** Simulation time at shot time t (the hit-stops slow it), so frozen panels are a pure function of time. */
function sim(t: number) {
  let s = t;
  for (const [a, l, r] of STOPS) s -= clamp(t - a, 0, l) * (1 - r);
  return s;
}

function ballIn(i: number, tp: number): { x: number; y: number; r: number } {
  const p = PAGE.panels[i];
  const s0 = sim(p.live[0]), s1 = sim(p.live[1]), se = sim(STOPS[i][0]);
  const s = sim(tp);
  // Linear in sim time through the eye at the stop.
  const u = s <= se ? lerp(0, 0.6, (s - s0) / (se - s0)) : lerp(0.6, 1, (s - se) / (s1 - se));
  if (i === 0) return { x: lerp(-20, 660, u * 0.94), y: 300, r: 10 };
  if (i === 1) return { x: 320, y: lerp(330, 210, u), r: Math.round(lerp(16, 11, u)) };
  return { x: lerp(170, 520, u), y: lerp(170, 320, u * u), r: Math.round(lerp(9, 11, u)) };
}

export const shotNeedle: Shot = {
  ...placeholderShot(4, "Needle's eye", 2.4, 404, {
    prepare(env) {
      page.prepare(env);
      pups = [
        cachePuppet(RIVAL_KIT, POSES.pokeTackle, 1.0, -1),
        cachePuppet(RIVAL_KIT_B, POSES.lungeL, 1.08, 1),
        cachePuppet(RIVAL_KIT_C, POSES.lungeR, 1.08, -1),
        cachePuppet(RIVAL_KIT_D, POSES.stretchBlock, 1.0, -1),
      ];
    },
    init() {
      page.invalidate();
      spin.m.set([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    },
    rate: (t) => warp(t, STOPS),
    update(_env, _t, dt) {
      spin.rotate(0.35, 1, 0.2, dt * 16);
    },
    render(env, t) {
      if (!pups.length) shotNeedle.prepare!(env);
      page.render(
        env,
        t,
        (env, i, tp, frozen) => {
          const ctx = env.ctx;
          env.screen();
          // Panel backgrounds (each a locked camera).
          if (i === 1) drawDownPitch(ctx, env.art.stadium, { ...DOWN_PITCH_VIEW, x: 1000, z: 252, cx: 320, horizon: 70, f: 420 }, tp);
          else {
            ctx.fillStyle = '#16122a';
            ctx.fillRect(0, 0, VW, VH);
            ctx.fillStyle = '#2f8a3c';
            ctx.fillRect(0, i === 0 ? 250 : 140, VW, VH);
            if (i === 0) drawGrassFore(ctx, 0, 0, { y: VH });
          }
          const stop = STOPS[i];
          const freeze = tp >= stop[0] && tp < stop[0] + stop[1];
          const P = pups[i === 2 ? 3 : i];
          const draw = (pp: Pup, x: number, y: number) => ctx.drawImage(pp.cv, Math.round(x - pp.ox), Math.round(y - pp.oy));
          if (i === 0) draw(P, 470, 262);
          if (i === 1) (draw(pups[1], 230, 250), draw(pups[2], 410, 250));
          if (i === 2) draw(P, 390, 238);
          inkGrade(ctx, frozen || freeze ? 1 : 0.85);
          // The ball, the thread from the panel's left edge, the needle eye.
          const b = ballIn(i, tp);
          const tail = i === 1 ? { x: 320, y: 372 } : { x: -6, y: b.y };
          threadLine(ctx, [tail, { x: lerp(tail.x, b.x, 0.5), y: lerp(tail.y, b.y, 0.5) - (i === 2 ? 30 : 4) }, { x: b.x - (i === 1 ? 0 : b.r), y: b.y + (i === 1 ? b.r : 0) }], 2, 1, { stitch: true });
          const eo = clamp((tp - stop[0]) / 0.05) * (frozen ? 0.5 : 1);
          if (eo > 0) needleEye(ctx, EYE_X[i], i === 1 ? 236 : i === 0 ? 300 : 250, 44, eo, i === 0 ? Math.PI / 2 : i === 1 ? 0 : -0.7, frozen ? 0.6 : 1, i === 1 ? 0.45 : 1);
          drawBall(env, spin, b.x, b.y, b.r, 1, 0, 0.8, 'pearl');
          spinMarks(ctx, b.x, b.y, b.r, tp * 12, { squash: i === 1 ? 1 : 0.5 });
          if (tp >= stop[0]) inkSfx(ctx, SFX[i], i === 1 ? 470 : 150, 90, 26, -0.12, { pop: clamp((tp - stop[0]) / 0.06) });
        },
        (i) => {
          const [a, l] = STOPS[i];
          return t >= a && t < a + l ? 5 + (t < a + 2 / 60 ? 2 : 0) : 3;
        },
      );
      if (t >= 2.4 - 1 / 60) paperFlash(env.fx, 1);
    },
  }),
  cues: [
    { at: 0, fn: (env) => env.sfx.whoosh(2.2, 200, 600, 0.18) },
    { at: 0.42, fn: (env) => (env.sfx.tick(), env.sfx.pluck(N.E5, 1.2, 0.45), env.sfx.crack(0.2), env.sfx.duck(0.5, 0.16)) },
    { at: 0.68, fn: (env) => env.sfx.whoosh(0.12, 2000, 5000, 0.15) },
    { at: 1.05, fn: (env) => (env.sfx.pluck(N.Fs5, 1.2, 0.5), env.sfx.duck(0.5, 0.22)) },
    { at: 1.28, fn: (env) => (env.sfx.kick(0.3), env.sfx.crack(0.4)) },
    { at: 1.4, fn: (env) => env.sfx.whoosh(0.12, 2000, 5000, 0.15) },
    { at: 1.75, fn: (env) => (env.sfx.pluck(N.A5, 1.2, 0.55), env.sfx.duck(0.5, 0.15)) },
    { at: 2.05, fn: (env) => env.sfx.crowd(1.0, 0.25) },
    { at: 2.12, fn: (env) => env.sfx.pluck(N.D5, 0.6, 0.2) },
  ],
};
