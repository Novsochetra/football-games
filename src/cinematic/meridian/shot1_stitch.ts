// SHOT 1 · STITCH-IN (1.3 s). PLACEHOLDER: a rough demo of the engine pieces this shot uses (paper + ink speed
// lines, corner screentone, two slanted manga panels with the G1 -> G2 face crop and the T6 boot crop at x4, the
// stitched title with the pearl needle, the taut pluck, the panels pulled off the page, the paper flash) and the
// brief's audio cues. Replace with the real shot (SPEC.md §1).

import type { Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { clamp, ease, lerp } from '../../engine/math';
import { BallSpin } from '../../engine/pixel';
import { lensFlare, pixelText, sparkle, speedStreaks } from '../../art/fx';
import {
  HEX, JADE_FLARE, THREAD_NOTES as N, drawBall, drawNo10, mangaPanels, needlePoint, no10Point, panelPoly, paperFlash,
  placeholderShot, screentone, spinMarks, stitchTitle,
} from './common';

const spin = new BallSpin();
const TOP = panelPoly(300, 118, 540, 200, -6);
const BOT = panelPoly(372, 268, 430, 118, 4);

export const shotStitch: Shot = {
  ...placeholderShot(1, 'Stitch-in', 1.3, 401, {
    render(env, t) {
      const ctx = env.ctx;
      const push = 1 + 0.03 * (t / 1.3);
      ctx.save();
      ctx.translate(VW / 2, VH / 2);
      ctx.scale(push, push);
      ctx.translate(-VW / 2, -VH / 2);
      speedStreaks(ctx, env.frng(11), -60, -60, VW + 120, VH + 120, (-18 * Math.PI) / 180, 70, HEX.ink, 0.35, 140);
      screentone(ctx, [0, 0, VW, VH], 6, 0.55, { corners: 0.6 });
      const slam = ease.outBack(clamp(t / 0.18));
      const pullTop = ease.inCubic(clamp((t - 1.12) / 0.12));
      const pullBot = ease.inCubic(clamp((t - 1.12 - 2 / 60) / 0.12));
      const shake = t >= 0.3 && t < 0.37 ? (Math.floor(t * 60) % 2 ? 1 : -1) : 0;
      const face = t < 0.3 ? 'G1' : 'G2';
      mangaPanels(ctx, [
        {
          poly: TOP,
          dx: lerp(-720, 0, slam) + pullTop * 820 + shake,
          draw: (c) => {
            c.fillStyle = '#2a1830';
            c.fillRect(0, 0, VW, VH);
            drawNo10(env, face, 300, 112, 4, { anchor: 'center' });
            if (t >= 0.3) {
              const [ex, ey] = no10Point(env, face, 'eye', 300, 112, 4, { anchor: 'center' });
              const k = clamp(1 - (t - 0.3) / 0.35);
              sparkle(c, ex, ey, 9, k);
              lensFlare(c, ex, ey, 30, 0.5 * k, JADE_FLARE);
            }
          },
        },
        {
          poly: BOT,
          dx: lerp(720, 0, slam) + pullBot * 820 + shake,
          draw: (c) => {
            c.fillStyle = '#26402c';
            c.fillRect(0, 0, VW, VH);
            const bx = 400, by = 300;
            drawNo10(env, 'T6', bx, by, 4, { anchor: 'boot' });
            const [x, y] = no10Point(env, 'T6', 'ball', bx, by, 4, { anchor: 'boot' });
            drawBall(env, spin, x, y, 6, 4, 0, 0, 'pearl');
            spinMarks(c, x, y, 24, t * 6, { color: HEX.ink, ink: false, alpha: 0.9 });
          },
        },
      ], t);
      // The stitch: the needle runs one line across both panels at y 205; the title pops in as it passes.
      const st = t - 0.42;
      if (st >= 0) {
        const yank = t >= 0.98 ? 1 : 0;
        const pl = t >= 0.98 ? { amp: 4 * clamp(1 - (t - 0.98) / 0.25), phase: (t - 0.98) * 70, nodes: 2 } : undefined;
        const off = Math.max(pullTop, pullBot) * 820;
        const r = stitchTitle(ctx, 'MERIDIAN THREAD', VW / 2 + off, 205, 44, st, { dur: 0.53, x0: 20 + off, x1: VW - 20 + off, yank, pluck: pl });
        pixelText(ctx, 'SPECIAL PASS · No.10 > No.7 · NO-LOOK TRIVELA', VW / 2 + off, 224, 10, HEX.ink, 'center', HEX.paper);
        const nx = t < 1.12 ? r.needleX : lerp(r.x1, VW + 60, ease.inCubic(clamp((t - 1.12) / 0.12)));
        if (t < 1.24) needlePoint(ctx, nx, r.needleY, 0);
      }
      ctx.restore();
      paperFlash(env.fx, 0.6 * clamp((t - 1.22) / 0.04) * clamp((1.3 - t) / 0.03 + 0.5));
      env.fx.vignette = 0.25;
    },
  }),
  cues: [
    { at: 0, fn: (env) => (env.sfx.strum([N.D4, N.A4, N.E5], 0.06, 1.4, 0.4), env.sfx.boom(0.35)) },
    { at: 0.3, fn: (env) => (env.sfx.tick(), env.sfx.shing(1.3)) },
    { at: 0.42, fn: (env) => env.sfx.zip(0.5, 600, 4000) },
    { at: 0.98, fn: (env) => (env.sfx.pluck(N.D6, 0.3), env.sfx.crack(0.25)) },
    { at: 1.12, fn: (env) => env.sfx.whoosh(0.18, 2000, 7000, 0.3) },
  ],
};
