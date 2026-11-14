// SHOT 1 — CUT-IN: the special-move declaration. A slanted panel slashes across the
// screen with No.10's eyes, an eye glint, and the move name slammed in letter by letter.

import type { Shot, Env } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { clamp, ease, lerp } from '../../engine/math';
import { focusLines, slamTitle, sparkle, speedStreaks, pixelText, lensFlare } from '../../art/fx';
import { PK } from '../../engine/particles';
import { SHOT_NAME, pulse } from './common';

const DUR = 1.75;

export const shotCutIn: Shot = {
  name: 'Cut-in',
  dur: DUR,
  seed: 11,
  cues: [
    { at: 0, fn: (e) => { e.sfx.stinger(); e.sfx.whoosh(0.35, 600, 4000, 0.4); } },
    { at: 0.5, fn: (e) => e.sfx.shing() },
    { at: 0.78, fn: (e) => e.sfx.boom(0.5, 0.4) },
    { at: 1.55, fn: (e) => e.sfx.whoosh(0.25, 800, 6000, 0.35) },
  ],
  init(env) {
    env.cam.set(VW / 2, VH / 2, 1, 0);
  },
  update(env, t, dt) {
    // Embers drifting across the panel.
    const rng = env.rng;
    for (let i = 0; i < 3; i++) {
      env.parts.spawn({
        kind: PK.Pixel, x: VW + 10, y: rng.range(60, 300), vx: rng.range(-700, -300), vy: rng.range(-30, 30),
        max: 1.2, s0: rng.range(1, 3), s1: 1, ramp: 'ember', r0: 0, r1: 1, a0: 1, a1: 0, layer: 1,
      });
    }
    env.cam.zoom = lerp(1, 1.05, t / DUR);
    env.cam.rot = lerp(-0.01, 0.012, t / DUR);
  },
  render(env, t) {
    const { ctx, fx } = env;
    const hero = env.art.hero;
    env.world();
    const rng = env.frng();

    // Backdrop: crimson burst with focus lines.
    const g = ctx.createRadialGradient(VW / 2, VH / 2, 10, VW / 2, VH / 2, 420);
    g.addColorStop(0, '#ff5a2a');
    g.addColorStop(0.35, '#a0101f');
    g.addColorStop(1, '#1a0309');
    ctx.fillStyle = g;
    ctx.fillRect(-40, -40, VW + 80, VH + 80);
    focusLines(ctx, rng, VW / 2, VH / 2, 120, 520, 70, '#ffe3b0', 0.35, 4);
    focusLines(ctx, rng, VW / 2, VH / 2, 200, 520, 40, '#1a0309', 0.5, 6);

    // Slanted panel.
    const slide = ease.outExpo(clamp(t / 0.22));
    const off = (1 - slide) * 760;
    const exit = ease.inExpo(clamp((t - 1.5) / 0.25));
    const offOut = -exit * 760;
    const ox = off + offOut;
    const top = (x: number) => lerp(118, 82, x / VW);
    const bot = (x: number) => lerp(266, 230, x / VW);
    const poly = (pad: number) => {
      ctx.beginPath();
      ctx.moveTo(-40 + ox, top(-40) - pad);
      ctx.lineTo(VW + 40 + ox, top(VW + 40) - pad);
      ctx.lineTo(VW + 40 + ox, bot(VW + 40) + pad);
      ctx.lineTo(-40 + ox, bot(-40) + pad);
      ctx.closePath();
    };
    ctx.fillStyle = '#180411';
    poly(9);
    ctx.fill();
    ctx.fillStyle = '#fcb94c';
    poly(6);
    ctx.fill();
    ctx.save();
    poly(0);
    ctx.clip();
    const bg = ctx.createLinearGradient(0, 80, 0, 270);
    bg.addColorStop(0, '#3a0712');
    bg.addColorStop(0.5, '#8d1a16');
    bg.addColorStop(1, '#2a050d');
    ctx.fillStyle = bg;
    ctx.fillRect(-60, 60, VW + 120, 240);
    speedStreaks(ctx, rng, -60 + ox, 70, VW + 120, 220, Math.PI, 40, '#ff9a5a', 0.35, 160);

    // Eyes close-up (face crop), drifting slowly.
    const f = hero.face;
    const sc = 12;
    const drift = lerp(14, -16, ease.outCubic(clamp(t / DUR)));
    const fx0 = VW / 2 - ((49.5 - f.x) * sc) + drift + ox * 0.6;
    const fy0 = 168 - (23.5 - f.y) * sc;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(hero.img, f.x, f.y, f.w, f.h, fx0, fy0, f.w * sc, f.h * sc);
    // Rim of red light on the face from below.
    ctx.globalCompositeOperation = 'lighter';
    const rimG = ctx.createLinearGradient(0, 180, 0, 270);
    rimG.addColorStop(0, 'rgba(255,60,30,0)');
    rimG.addColorStop(1, 'rgba(255,70,30,0.16)');
    ctx.fillStyle = rimG;
    ctx.fillRect(-60, 160, VW + 120, 120);
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();

    // Eye glints.
    const gl = pulse(t, 0.5, 0.55);
    if (gl > 0) {
      for (const [i, [ex, ey]] of hero.eyes.entries()) {
        const px = fx0 + (ex - f.x + 0.5) * sc;
        const py = fy0 + (ey - f.y + 0.5) * sc;
        sparkle(ctx, px, py, 30 + 50 * gl, gl, t * 2 + i);
        if (i === 1) lensFlare(ctx, px, py, 60, gl * 0.8, [255, 180, 120]);
      }
    }

    // Labels.
    const tagIn = ease.outBack(clamp((t - 0.3) / 0.2));
    if (tagIn > 0) {
      const tx = lerp(-200, 34, tagIn);
      ctx.save();
      ctx.translate(tx, 58);
      ctx.transform(1, 0, -0.25, 1, 0, 0);
      ctx.fillStyle = '#180411';
      ctx.fillRect(-6, -4, 196, 26);
      ctx.fillStyle = '#fcb94c';
      ctx.fillRect(-2, 0, 188, 18);
      ctx.restore();
      pixelText(ctx, 'SPECIAL SHOT  No.10', tx + 8, 59, 12, '#180411', 'left', 'rgba(0,0,0,0)');
    }

    // Title slam.
    const tt = t - 0.72;
    if (tt > 0) {
      const shake = pulse(t, 0.72 + 0.045 * SHOT_NAME.length, 0.3) * 4;
      slamTitle(ctx, SHOT_NAME, VW / 2 + 12 + (rng.next() - 0.5) * shake + ox * 0.2, 322, 66, tt, {
        stagger: 0.04, outer: '#180411', stroke: '#c0141e',
      });
    }

    env.parts.draw(ctx, 1);

    // Post: crisp, saturated, punchy flash on panel entry and exit.
    fx.ca = 0.003 + gl * 0.006;
    fx.bloom = 0.8;
    fx.bloomThresh = 0.78;
    fx.vignette = 0.6;
    fx.contrast = 1.08;
    fx.flash = Math.max(pulse(t, 0, 0.18) * 0.9, exit * 1.0, pulse(t, 0.72 + 0.045 * SHOT_NAME.length, 0.15) * 0.25);
    if (t < 0.05) fx.impact = 1;
  },
};

export type { Env };
