// SHOT 4 — ASCENT: the camera rides the ball up out of the stadium, past the floodlights,
// punches through the cloud layer, and decelerates into a starfield as the moon rises.
// No.10 rockets up from below, chasing it (hand-drawn jump frames: leap, then the
// knee-lift / rise-float pair looping to the end of the shot; he gathers into the tuck
// only in shot 5, so the action never rewinds across the cut).

import type { Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { clamp, ease, lerp, mixRGB, rgb, type RGB } from '../../engine/math';
import { PK, drawGlow, glowOf, glowSprite } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { speedStreaks, ribbon } from '../../art/fx';
import { JF, drawJump, heroJump, jumpFrameAt } from '../../art/heroJump';
import { Trail, drawBall, fireRibbon, meteorFlames } from './common';

const DUR = 1.8;
const START_Y = 330;
const RISE = 2950;
const CLOUD_Y = -1300;
const MOON_Y = -2860;
const JS = 2; // hero sprite: world px per sprite px (the shot's pixel size: ball, clouds)

let spin = new BallSpin();
let punched = -1;
const trail = new Trail(40);
const heroTrail = new Trail(14);
let clouds: { x: number; y: number; v: number; s: number; layer: number }[] = [];

// The hero rides left of the ball's fire column so his face never sits in its glare.
const heroX = (t: number) => VW / 2 - 78 + Math.sin(t * 3) * 6;
const ballY = (t: number) => START_Y - RISE * ease.outQuad(clamp(t / DUR));
const ballV = (t: number) => (RISE * 2 * (1 - clamp(t / DUR))) / DUR;
const heroLag = (t: number) => lerp(760, 150, ease.outCubic(clamp((t - 0.25) / (DUR - 0.25))));
// Jump frames by local time: leap, then the F6/F7 loop while rising, all the way to the cut
// (shot 5 picks the loop up and does the tuck).
const heroSeq: [number, number][] = [[0, JF.leap]];
for (let k = 0, at = 0.84; at < DUR; k++, at += 0.1) heroSeq.push([at, k % 2 ? JF.float : JF.knee]);

export const shotAscent: Shot = {
  name: 'Ascent',
  dur: DUR,
  seed: 44,
  cues: [
    { at: 0, fn: (e) => e.sfx.whoosh(1.5, 250, 3800, 0.55) },
    { at: 0.35, fn: (e) => e.sfx.whoosh(0.9, 150, 1600, 0.35) },
  ],
  init(env) {
    spin = new BallSpin();
    punched = -1;
    trail.clear();
    heroTrail.clear();
    const rng = env.rng;
    clouds = [];
    for (let i = 0; i < 22; i++) {
      const layer = i % 3;
      clouds.push({ x: rng.range(-240, VW + 240), y: CLOUD_Y + rng.range(-50, 50) + (layer - 1) * 50, v: rng.int(0, 2), s: rng.range(1.6, 2.4), layer });
    }
    env.cam.set(VW / 2, START_Y - 60, 1, 0);
  },
  update(env, t, dt) {
    const { rng, parts, cam } = env;
    const by = ballY(t);
    const bx = VW / 2 + Math.sin(t * 2) * 6;
    spin.rotate(1, 0.2, 0, dt * lerp(40, 8, t / DUR));
    trail.push(bx, by);
    // Trim trail by length so it never exceeds ~320px.
    let len = 0;
    for (let i = trail.pts.length - 1; i > 0; i--) {
      len += Math.abs(trail.pts[i].y - trail.pts[i - 1].y);
      if (len > 320) {
        trail.pts.splice(0, i);
        break;
      }
    }
    const sp = clamp(ballV(t) / 3000);
    meteorFlames(env, bx, by, 8, -Math.PI / 2, 0.4 + sp * 0.6, dt);

    // Cloud punch.
    if (punched < 0 && by < CLOUD_Y) {
      punched = t;
      env.sfx.boom(0.7, 0.6);
      env.sfx.whoosh(0.5, 900, 200, 0.5);
      cam.hit(0.55);
      for (let i = 0; i < 70; i++) {
        const a = rng.range(0, Math.PI * 2);
        const s = rng.range(150, 600);
        parts.spawn({
          kind: PK.Smoke, x: bx, y: by + rng.range(-20, 20), vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.35, drag: 2.4,
          max: rng.range(0.7, 1.4), s0: rng.range(14, 24), s1: rng.range(40, 70), ramp: 'night', r0: 0, r1: 0.8, a0: 0.75, a1: 0, add: false, layer: 1,
        });
      }
      parts.spawn({ kind: PK.Ring, x: bx, y: by, s0: 10, s1: 360, max: 0.6, k: 0.25, ramp: 'white', r0: 0, r1: 1, a0: 0.9, a1: 0 });
    }

    // Hero rising with an aura trail.
    const hy = by + heroLag(t);
    const hx = heroX(t);
    heroTrail.push(hx, hy);
    if (rng.next() < 0.9) {
      parts.spawn({
        kind: PK.Glow, x: hx + rng.range(-14, 14), y: hy + rng.range(-30, 40), vx: rng.range(-20, 20), vy: rng.range(60, 200),
        max: rng.range(0.3, 0.6), s0: rng.range(6, 12), s1: 1, ramp: 'aura', r0: 0.1, r1: 1, a0: 0.8, a1: 0, layer: 0,
      });
    }

    cam.set(VW / 2, by + lerp(-30, 40, ease.outCubic(clamp(t / 0.4))), lerp(1.08, 1, clamp(t / DUR)), Math.sin(t * 1.4) * 0.02);
    cam.shakeAmp = 10;
    cam.trauma = Math.max(cam.trauma, 0.3 * sp);
  },
  render(env, t) {
    const { ctx, fx, cam } = env;
    const st = env.art.stadium;
    const rng = env.frng();
    const by = ballY(t);
    const bx = VW / 2 + Math.sin(t * 2) * 6;
    const alt = clamp((START_Y - cam.y) / RISE);
    const sp = clamp(ballV(t) / 3000);

    // Sky by altitude (screen space).
    env.screen();
    const stops: [RGB, RGB][] = [
      [[18, 10, 36], [64, 18, 46]],
      [[8, 12, 44], [28, 36, 86]],
      [[2, 2, 10], [10, 12, 38]],
    ];
    const pick = (i: 0 | 1) => (alt < 0.5 ? mixRGB(stops[0][i], stops[1][i], alt * 2) : mixRGB(stops[1][i], stops[2][i], (alt - 0.5) * 2));
    const g = ctx.createLinearGradient(0, 0, 0, VH);
    g.addColorStop(0, rgb(pick(0)));
    g.addColorStop(1, rgb(pick(1)));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VW, VH);
    // Stars fade in at altitude.
    const sa = clamp((alt - 0.45) * 2.5);
    if (sa > 0) {
      ctx.fillStyle = '#dfe6ff';
      for (const s of st.stars) {
        const x = (s.x * 0.37) % VW;
        const y = (((s.y + 1400) * 0.25 - cam.y * 0.08) % VH + VH) % VH;
        ctx.globalAlpha = sa * s.b;
        ctx.fillRect(Math.round(x), Math.round(y), 1, s.b > 0.8 ? 2 : 1);
      }
      ctx.globalAlpha = 1;
    }

    env.world();
    // Moon rising into view at the end.
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf([150, 170, 255]), VW / 2 + 20, MOON_Y, 520, 0.35 * sa);
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(st.moon, VW / 2 + 20 - 160, MOON_Y - 160, 320, 320);

    // Stadium: floodlight towers + roof edges near the ground.
    if (cam.y > -900) {
      for (const [x, flip] of [[20, 1], [VW - 20, -1]] as const) {
        ctx.save();
        ctx.translate(x, 0);
        ctx.scale(flip * 3, 3);
        ctx.drawImage(st.tower, -20, -130);
        ctx.restore();
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, glowOf([255, 245, 220]), x, -340, 200, 0.5);
        drawGlow(ctx, glowOf([255, 255, 255]), x, -340, 50, 1);
        ctx.globalCompositeOperation = 'source-over';
      }
      // Stands wrapping around the bottom of frame.
      ctx.globalAlpha = 0.8;
      ctx.drawImage(st.crowdNear, 0, 0, 400, 90, -260, 150, 420, 200);
      ctx.drawImage(st.crowdNear, 400, 0, 400, 90, VW - 160, 150, 420, 200);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#07040e';
      ctx.beginPath();
      ctx.moveTo(-300, 140);
      ctx.lineTo(150, 230);
      ctx.lineTo(150, 700);
      ctx.lineTo(-300, 700);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(VW + 300, 140);
      ctx.lineTo(VW - 150, 230);
      ctx.lineTo(VW - 150, 700);
      ctx.lineTo(VW + 300, 700);
      ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowSprite('aura', 0.5), VW / 2, START_Y + 60, 300, 0.5, 1.6, 0.6);
      ctx.globalCompositeOperation = 'source-over';
    }

    // Clouds (back layers).
    const drawClouds = (front: boolean) => {
      ctx.imageSmoothingEnabled = false;
      for (const c of clouds) {
        if ((c.layer === 2) !== front) continue;
        let x = c.x;
        if (punched >= 0) {
          const dx = c.x - bx;
          const push = Math.sign(dx || 1) * clamp(1 - Math.abs(dx) / 260) * ease.outCubic(clamp((t - punched) / 0.5)) * 140;
          x += push;
        }
        const img = st.cloud[c.v];
        const w = img.width * c.s, h = img.height * c.s;
        ctx.globalAlpha = c.layer === 0 ? 0.45 : c.layer === 1 ? 0.7 : 0.85;
        ctx.drawImage(img, x - w / 2, c.y - h / 2, w, h);
      }
      ctx.globalAlpha = 1;
    };
    drawClouds(false);

    env.parts.draw(ctx, 0);

    // Hero aura trail + hero.
    ctx.globalCompositeOperation = 'lighter';
    ribbon(ctx, heroTrail.pts, 0, 36, 'rgb(200,30,40)', 0.35);
    ribbon(ctx, heroTrail.pts, 0, 16, 'rgb(255,160,80)', 0.4);
    ctx.globalCompositeOperation = 'source-over';
    const hy = by + heroLag(t);
    const hx = heroX(t);
    const fi = jumpFrameAt(heroSeq, t);
    const aura = heroJump().silhouette(fi, { fill: [255, 90, 40], rim: [255, 220, 140], rim2: [255, 140, 60], lx: 1, ly: -1 });
    ctx.globalCompositeOperation = 'lighter';
    drawJump(ctx, aura, fi, hx, hy, JS * 1.08, { anchor: 'pelvis', alpha: 0.5 });
    ctx.globalCompositeOperation = 'source-over';
    drawJump(ctx, null, fi, hx, hy, JS, { anchor: 'pelvis' });

    // Ball + fire trail.
    fireRibbon(ctx, trail.pts, 30, 1, 6 * 2);
    drawBall(env, spin, bx, by, 6, 2, lerp(0.55, 1, alt), 1.1);

    drawClouds(true);
    env.parts.draw(ctx, 1);

    // Speed lines (world rushing down).
    ctx.globalCompositeOperation = 'lighter';
    speedStreaks(ctx, rng, cam.x - 330, cam.y - 190, 660, 380, Math.PI / 2, Math.round(10 + sp * 40), '#ffe7c8', 0.4 * sp, 120);
    ctx.globalCompositeOperation = 'source-over';

    const [ux, uy] = cam.toUV(bx, by);
    fx.radial = 0.07 * sp * clamp(t / 0.25);
    fx.radialX = ux;
    fx.radialY = uy;
    fx.ca = 0.0015 + sp * 0.004;
    fx.bloom = 1.0;
    fx.bloomThresh = 0.6;
    fx.vignette = 0.55;
    fx.flash = punched >= 0 ? clamp(1 - (t - punched) / 0.18) * 0.3 : 0;
    if (punched >= 0) {
      const s = t - punched;
      fx.shocks.push({ x: ux, y: uy, r: s * 1.3, s: 0.04 * clamp(1 - s * 1.6) });
    }
    if (t < 0.12) fx.flash = Math.max(fx.flash, (1 - t / 0.12) * 0.6);
  },
};
