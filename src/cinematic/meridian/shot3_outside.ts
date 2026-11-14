// SHOT 3 · OUTSIDE OF THE BOOT (1.7 s). PLACEHOLDER: a rough demo of the engine pieces this shot uses (an inked side
// view, No.10's Approach/Trivela frames at x2 in colour, the ink smear, the 3-frame ink freeze with doubled screentone
// and its 1-frame negative, the "eyes here, ball there" inset, spin marks, the thread unspooling, the wink glint and
// the thread wipe) with the brief's time rate and audio cues. Replace with the real shot (SPEC.md §3).

import type { Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { clamp, ease, lerp } from '../../engine/math';
import { BallSpin } from '../../engine/pixel';
import { focusLines, lensFlare, pixelText, sparkle } from '../../art/fx';
import {
  HEX, JADE_FLARE, THREAD_NOTES as N, drawBall, drawNo10, dustBurst, inkGrade, inkNegative, inkSmear, mangaPanels,
  no10Point, panelPoly, placeholderShot, spinMarks, threadLine, warp, type No10Key,
} from './common';

const spin = new BallSpin();
const SEQ: [number, No10Key][] = [[0, 'AP1'], [0.09, 'AP3'], [0.18, 'T3'], [0.4, 'T4'], [0.55, 'T5'], [0.62, 'T6'], [0.84, 'T7'], [0.95, 'T8a'], [1.15, 'T8b'], [1.3, 'T9']];
const at = (t: number) => SEQ.reduce((k, [s, f]) => (t >= s ? f : k), SEQ[0][1]);
const X = 300, Y = 312;
const INSET = panelPoly(150, 104, 200, 96, -5);

export const shotOutside: Shot = {
  ...placeholderShot(3, 'Outside of the boot', 1.7, 403, {
    rate: (t) => warp(t, [[0.18, 0.22, 0.35], [0.62, 0.2, 0.03]]),
    init: () => spin.m.set([1, 0, 0, 0, 1, 0, 0, 0, 1]),
    update(env, t, dt) {
      if (t > 0.82) spin.rotate(0.2, 1, 0, dt * 18);
      if (Math.abs(t - 0.18) < 1 / 120) dustBurst(env, X - 10, Y, 6, 0.6);
    },
    render(env, t) {
      const ctx = env.ctx;
      const key = at(t);
      const zoom = t < 0.18 ? 1 : t < 0.4 ? lerp(1, 1.35, ease.inOutCubic((t - 0.18) / 0.22)) : t < 0.95 ? 1.35 : lerp(1.35, 1.1, ease.inOutCubic(clamp((t - 0.95) / 0.35)));
      ctx.save();
      ctx.translate(VW / 2, VH / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-X - 30, -Y + 60);
      // Environment: stands, floodlight glow, turf.
      ctx.fillStyle = '#141024';
      ctx.fillRect(-400, -200, 1400, 330);
      ctx.drawImage(env.art.stadium.crowd, 0, 0, 640, 110, -300, 20, 1280, 110);
      for (let i = 0; i < 12; i++) {
        ctx.fillStyle = i % 2 ? '#2f8a3c' : '#287a35';
        ctx.fillRect(-400 + i * 120, 130, 120, 400);
      }
      // The ink page; the freeze doubles the dots (3 frames) then flips the background once (1 frame).
      const f = Math.floor((t - 0.62) * 60 + 1e-6);
      if (t >= 0.62 && f < 3) inkGrade(ctx, 1, undefined, { tone: 2 });
      else inkGrade(ctx, 0.9);
      if (t >= 0.62 && f === 3) inkNegative(ctx);
      if (t >= 0.62 && t < 0.82) focusLines(ctx, env.frng(5), X + 30, Y - 10, 60, 600, 46, HEX.ink, 0.35);
      // Swing smear (T5 -> T6).
      if (t >= 0.55 && t < 0.66) {
        const b = no10Point(env, 'T6', 'boot', X, Y, 2);
        inkSmear(ctx, [{ x: b[0] - 70, y: b[1] - 60 }, { x: b[0] - 40, y: b[1] - 20 }, { x: b[0] - 12, y: b[1] - 4 }, { x: b[0], y: b[1] }], 16, 0.35);
      }
      // No.10 (colour), ball on the boot during the freeze, then released with the thread unspooling behind it.
      drawNo10(env, key, X, Y, 2);
      const boot = no10Point(env, 'T6', 'boot', X, Y, 2);
      const ball0 = no10Point(env, key === 'AP1' || key === 'AP3' ? key : 'T6', 'ball', X, Y, 2);
      let bx = ball0[0], by = ball0[1];
      if (t >= 0.82) {
        const u = (t - 0.82) * 520;
        bx = ball0[0] + u;
        by = ball0[1] - u * 0.12;
        threadLine(ctx, [{ x: boot[0], y: boot[1] }, { x: lerp(boot[0], bx, 0.5), y: lerp(boot[1], by, 0.5) - 3 }, { x: bx - 10, y: by }], 2, 1);
      }
      drawBall(env, spin, bx, by, 6, 2, 0, t >= 0.62 ? 0.8 : 0, 'pearl', t >= 0.62 && t < 0.82 ? { sx: 0.9, sy: 1.04, dent: 0.1 } : undefined);
      if (t >= 0.62) spinMarks(ctx, bx, by, 12, t * 9, { squash: 0.45 });
      if (t >= 0.62 && t < 0.82) pixelText(ctx, 'OUTSIDE OF THE BOOT', boot[0] - 40, boot[1] + 14, 8, HEX.ink, 'left', HEX.paper);
      if (t >= 1.15 && t < 1.45) {
        const [ex, ey] = no10Point(env, key, 'eye', X, Y, 2);
        const k = clamp(1 - (t - 1.15) / 0.3);
        sparkle(ctx, ex, ey, 10, k);
        lensFlare(ctx, ex, ey, 30, 0.45 * k, JADE_FLARE);
      }
      ctx.restore();
      // "Eyes here, ball there": the inset during the freeze.
      if (t >= 0.62 && t < 0.82) {
        const drop = ease.outBack(clamp((t - 0.62) / 0.03));
        mangaPanels(ctx, [{ poly: INSET, dy: lerp(-140, 0, drop), draw: () => drawNo10(env, 'G2', 150, 104, 4, { anchor: 'center' }) }], t);
      }
      // Thread wipe: one taut thread across the top, then pulled straight down like a blind cord (shot 4 above it).
      if (t >= 1.45) {
        const across = clamp((t - 1.45) / 0.08);
        const y = t < 1.53 ? 6 : lerp(6, VH + 6, ease.inCubic(clamp((t - 1.53) / 0.17)));
        ctx.fillStyle = HEX.paper;
        ctx.fillRect(0, 0, VW, y);
        const v = (Math.floor(t * 60) % 2 ? 1 : -1) * 1;
        threadLine(ctx, [{ x: -4, y: y + v }, { x: VW * across, y: y - v }], 2, 1);
      }
    },
  }),
  cues: [
    { at: 0.18, fn: (env) => (env.sfx.kick(0.2), env.sfx.crack(0.15)) },
    { at: 0.55, fn: (env) => env.sfx.whoosh(0.18, 300, 1800, 0.4) },
    { at: 0.62, fn: (env) => (env.sfx.kick(0.9), env.sfx.pluck(N.D3, 1.6), env.sfx.duck(0.6, 0.25)) },
    { at: 0.82, fn: (env) => (env.sfx.zip(0.6), env.sfx.whoosh(0.4)) },
    { at: 1.15, fn: (env) => env.sfx.shing(0.9) },
    { at: 1.45, fn: (env) => env.sfx.zip(0.2) },
  ],
};
