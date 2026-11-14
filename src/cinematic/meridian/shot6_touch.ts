// SHOT 6 · FIRST TOUCH (2.4 s). PLACEHOLDER: a rough demo of the engine pieces this shot uses (a side rail at No.7's
// hip height with the smeared grass foreground, the ink page with the colour washing back ALONG the thread from the
// touch (inkGrade restore), No.7 from his studio frames at x2 (puppet stand-in until exported), the plucked thread,
// GOAL! in pearl / jade / ink, the fingertip diptych with No.10 Point and No.7 Point, the name card, the fade to
// [8,4,14]) with the brief's hit-stop and audio cues. Replace with the real shot (SPEC.md §6).

import type { Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { clamp, ease, lerp } from '../../engine/math';
import { BallSpin } from '../../engine/pixel';
import { slamTitle } from '../../art/fx';
import {
  FADE_RGB, HEX, THREAD_NOTES as N, TITLE_STYLE, drawBall, drawGrassFore, drawNo10, drawNo7, inkGrade, mangaPanels,
  nameCard, no10Point, no7Point, panelPoly, placeholderShot, threadLine, warp, type No10Key, type No7Key,
} from './common';

const spin = new BallSpin();
const NO7SEQ: [number, No7Key][] = [
  [0, 'Run.R1'], [0.07, 'Run.R2'], [0.14, 'Run.R3'], [0.21, 'Run.R4'], [0.25, 'Receive.R1'], [0.35, 'Receive.R2'],
  [0.47, 'Receive.R3'], [0.62, 'Receive.R4'], [0.8, 'Receive.R5'], [0.88, 'Receive.R6'],
];
const P10: [number, No10Key][] = [[1.4, 'P1'], [1.5, 'P2'], [1.6, 'P3a'], [1.95, 'P3b']];
const Q7: [number, No7Key][] = [[1.4, 'Point.Q1'], [1.55, 'Point.Q2']];
const pick = <K,>(seq: [number, K][], t: number) => seq.reduce((k, [s, f]) => (t >= s ? f : k), seq[0][1]);
const LEFT = panelPoly(176, 170, 300, 196, -3);
const RIGHT = panelPoly(464, 170, 300, 196, 3);
const TOUCH = 0.35;

export const shotTouch: Shot = {
  ...placeholderShot(6, 'First touch', 2.4, 406, {
    rate: (t) => warp(t, [[TOUCH, 0.12, 0.08]]),
    init: () => spin.m.set([1, 0, 0, 0, 1, 0, 0, 0, 1]),
    update(_env, _t, dt) {
      spin.rotate(0, 0, 1, dt * 14);
    },
    render(env, t) {
      const ctx = env.ctx;
      env.screen();
      const scroll = t * 260;
      ctx.fillStyle = '#141024';
      ctx.fillRect(0, 0, VW, 170);
      ctx.drawImage(env.art.stadium.crowd, (scroll * 0.3) % 900, 0, 640, 110, 0, 40, VW, 130);
      for (let i = -1; i < 8; i++) {
        ctx.fillStyle = (i + Math.floor(scroll / 120)) % 2 ? '#2f8a3c' : '#287a35';
        ctx.fillRect(i * 120 - (scroll % 120), 170, 120, VH);
      }
      drawGrassFore(ctx, scroll * 1.6, 18, { y: VH });
      // No.7 at x2 on the rail, the ball rolling into his stride, the thread back off-screen left.
      const key = pick(NO7SEQ, t);
      const X = 330, Y = 318;
      const bAt = no7Point(env, 'Receive.R2', 'ball', X, Y, 2);
      const bx = t < TOUCH ? lerp(-30, bAt[0], clamp(t / TOUCH)) : bAt[0] + (t - TOUCH) * 160;
      const by = bAt[1];
      const thread = [{ x: -20, y: by - 30 }, { x: bx * 0.5, y: by - 8 }, { x: bx - 12, y: by }];
      // The ink page; after the touch the colour washes back along the thread (0.35 s, soft edge).
      const wash = clamp((t - TOUCH) / 0.35);
      inkGrade(ctx, 0.85, wash > 0 ? { pts: thread, w: ease.inCubic(wash) * 900 + 10 * wash } : undefined);
      if (t < 0.75) {
        const pl = t >= TOUCH ? { amp: 5 * clamp(1 - (t - TOUCH) / 0.4), phase: (t - TOUCH) * 80, nodes: [0.3, 0.55, 0.8] } : undefined;
        threadLine(ctx, t < 0.55 ? thread : thread.slice(1), 2, clamp((0.75 - t) / 0.2), { pluck: pl, stitch: t >= 0.55 });
      }
      drawNo7(env, key, X, Y, 2);
      drawBall(env, spin, bx, by, 6, 2, 0, t < 0.8 ? 0.6 : 0, t < 0.8 ? 'pearl' : 'fire');
      // GOAL! then the diptych, then the card.
      if (t >= 1.25) {
        const shrink = ease.inOutCubic(clamp((t - 1.4) / 0.2));
        ctx.save();
        ctx.translate(VW / 2, lerp(150, 46, shrink));
        ctx.scale(lerp(1, 0.5, shrink), lerp(1, 0.5, shrink));
        slamTitle(ctx, 'GOAL!', 0, 0, 72, t - 1.25, TITLE_STYLE);
        ctx.restore();
      }
      if (t >= 1.4) {
        const slide = ease.outBack(clamp((t - 1.4) / 0.14));
        const k10 = pick(P10, t), k7 = pick(Q7, t);
        const tipA = no10Point(env, k10, 'tip', 176, 340, 2);
        const tipB = no7Point(env, k7, 'tip', 464, 340, 2, { flip: true });
        mangaPanels(ctx, [
          { poly: LEFT, dx: lerp(-360, 0, slide), fill: '#e6dccb', draw: () => drawNo10(env, k10, 176, 340, 2) },
          { poly: RIGHT, dx: lerp(360, 0, slide), fill: '#e6dccb', draw: () => drawNo7(env, k7, 464, 340, 2, { flip: true }) },
        ], t);
        if (slide >= 1) threadLine(ctx, [{ x: tipA[0], y: tipA[1] }, { x: tipB[0], y: tipB[1] }], 2, 1);
      }
      if (t >= 1.8) nameCard(ctx, t - 1.8);
      if (t > 2.05) {
        env.fx.flash = ease.inQuad(clamp((t - 2.05) / 0.35));
        env.fx.flashColor = FADE_RGB;
      }
      void HEX;
    },
  }),
  cues: [
    { at: 0.35, fn: (env) => (env.sfx.kick(0.4), env.sfx.pluck(N.D6, 1.4, 0.6), env.sfx.boom(0.4)) },
    { at: 0.4, fn: (env) => (env.sfx.whoosh(0.5, 200, 1500, 0.5), env.sfx.crowd(2.6, 0.5)) },
    { at: 0.55, fn: (env) => env.sfx.zip(0.25, 3000, 800) },
    { at: 0.8, fn: (env) => env.sfx.kick(0.7) },
    { at: 1.12, fn: (env) => (env.sfx.strain(0.4, 0.2), env.sfx.crack(0.3)) },
    { at: 1.25, fn: (env) => env.sfx.whistle() },
    { at: 1.42, fn: (env) => env.sfx.strum([N.D4, N.A4, N.E5, N.Fs5, N.A5, N.D6], 0.025) },
    { at: 1.8, fn: (env) => env.sfx.blip(880) },
  ],
};
