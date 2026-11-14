// SHOT 2 — POWER-UP: low-angle hero shot. A crimson-gold aura of flames hugs his
// silhouette, the pitch cracks under his boots, debris floats upward, the ball crackles
// with energy, and his eyes flash before the camera slams in.

import type { Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { clamp, ease, keys, lerp, Rng } from '../../engine/math';
import { PK, drawGlow, glowOf, glowSprite } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { arc, drawCracks, lensFlare, makeCracks, sparkle, speedStreaks } from '../../art/fx';
import { drawBall, drawHero, pulse } from './common';

const DUR = 2.35;
const SC = 2.55; // hero draw scale
const FEET_X = VW / 2 - 10;
const FEET_Y = 338;
const BALL_X = FEET_X + 62;
const BALL_Y = FEET_Y - 12;

let cracks: ReturnType<typeof makeCracks> = [];
let spin = new BallSpin();
const EYE_T = 1.78;

export const shotCharge: Shot = {
  name: 'Power-up',
  dur: DUR,
  seed: 22,
  cues: [
    { at: 0, fn: (e) => { e.sfx.rumble(2.2, 0.55); e.sfx.crackle(2.2, 0.22); } },
    { at: 0.9, fn: (e) => e.sfx.whoosh(1.0, 200, 1200, 0.25) },
    { at: EYE_T, fn: (e) => e.sfx.shing() },
    { at: 2.02, fn: (e) => e.sfx.whoosh(0.3, 500, 5000, 0.5) },
  ],
  init(env) {
    cracks = makeCracks(new Rng(5), 11, 230, 0.22);
    spin = new BallSpin();
    env.cam.set(VW / 2, VH / 2 + 10, 1.04, -0.03);
  },
  update(env, t, dt) {
    const { rng, parts } = env;
    const hero = env.art.hero;
    const power = clamp(t / 1.6);
    spin.rotate(0.2, 1, 0.1, dt * (6 + power * 18));

    // Flames hugging the silhouette.
    const n = Math.round((10 + power * 26) * dt * 60);
    for (let i = 0; i < n; i++) {
      const e = hero.edges[(rng.next() * hero.edges.length) | 0];
      if (e.ny > 0.6 && rng.next() < 0.7) continue;
      const x = FEET_X + (e.x - hero.footX) * SC;
      const y = FEET_Y + (e.y - hero.footY) * SC;
      const front = rng.next() < 0.14;
      parts.spawn({
        kind: PK.Glow, x: x + e.nx * 3, y: y + e.ny * 3,
        vx: e.nx * rng.range(10, 40) + rng.range(-10, 10), vy: rng.range(-170, -60) * (0.6 + power),
        drag: 1.2, max: rng.range(0.35, 0.8), s0: rng.range(5, 11) * (0.7 + power * 0.6), s1: 1,
        ramp: 'aura', r0: rng.range(0, 0.25), r1: 1, a0: front ? 0.4 : 0.9, a1: 0, layer: front ? 1 : 0,
      });
    }
    // Rising embers + floating debris.
    if (rng.next() < 0.6 + power) {
      parts.spawn({
        kind: PK.Pixel, x: rng.range(80, 560), y: rng.range(250, 370), vx: rng.range(-10, 10), vy: rng.range(-140, -40),
        max: rng.range(0.8, 1.6), s0: rng.range(1, 3), s1: 1, ramp: 'ember', r0: 0.1, r1: 1, a0: 1, a1: 0, layer: 1,
      });
    }
    if (t > 0.35 && rng.next() < 0.25 + power * 0.4) {
      parts.spawn({
        kind: PK.Debris, x: FEET_X + rng.range(-180, 180), y: FEET_Y + rng.range(-6, 16), vx: rng.range(-8, 8),
        vy: rng.range(-90, -30), vrot: rng.range(-3, 3), max: rng.range(1, 1.8), s0: rng.range(2, 5), s1: 2,
        ramp: 'dust', r0: rng.next() * 0.6, r1: 1, a0: 1, a1: 0.6, add: false, layer: 0,
      });
    }
    // Dust ring pushed outward from the feet.
    if (rng.next() < 0.5) {
      const dir = rng.sign();
      parts.spawn({
        kind: PK.Smoke, x: FEET_X + dir * rng.range(20, 60), y: FEET_Y + rng.range(-2, 8), vx: dir * rng.range(80, 200),
        vy: rng.range(-12, 0), drag: 1.5, max: rng.range(0.6, 1.2), s0: 8, s1: 26, ramp: 'dust', r0: 0, r1: 1, a0: 0.35, a1: 0, add: false, layer: 1,
      });
    }
    // Energy motes spiraling into the ball.
    if (t > 0.6 && rng.next() < 0.8) {
      const a = rng.range(0, Math.PI * 2), r = rng.range(40, 70);
      parts.spawn({
        kind: PK.Glow, x: BALL_X + Math.cos(a) * r, y: BALL_Y + Math.sin(a) * r * 0.6,
        vx: -Math.cos(a) * r * 2.4, vy: -Math.sin(a) * r * 1.4, max: 0.42, s0: 3, s1: 1, ramp: 'gold', r0: 0, r1: 0.6, a0: 0, a1: 1, layer: 1,
      });
    }

    // Camera: slow push + building tremor, then the slam toward the eyes.
    const cam = env.cam;
    const push = ease.inOutCubic(clamp(t / 1.9));
    let zoom = lerp(1.04, 1.16, push);
    let cy = lerp(VH / 2 + 10, VH / 2 - 4, push);
    let cx = VW / 2;
    const slam = ease.inExpo(clamp((t - 2.0) / 0.35));
    const eyeY = FEET_Y + (23 - env.art.hero.footY) * SC;
    zoom = lerp(zoom, 3.4, slam);
    cy = lerp(cy, eyeY, slam);
    cx = lerp(cx, FEET_X + (49 - env.art.hero.footX) * SC, slam);
    cam.set(cx, cy, zoom, lerp(-0.03, 0.025, push) * (1 - slam));
    cam.shakeAmp = 6;
    cam.trauma = Math.max(cam.trauma, 0.25 + power * 0.35);
  },
  render(env, t) {
    const { ctx, fx } = env;
    const hero = env.art.hero;
    const st = env.art.stadium;
    const power = clamp(t / 1.6);
    const rng = env.frng();
    env.world();

    // Sky + stands from a low angle.
    const sky = ctx.createLinearGradient(0, -60, 0, 230);
    sky.addColorStop(0, '#04020a');
    sky.addColorStop(0.7, '#1a0a24');
    sky.addColorStop(1, '#3a0f22');
    ctx.fillStyle = sky;
    ctx.fillRect(-200, -200, VW + 400, 440);
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = 0.55;
    ctx.drawImage(st.crowdNear, -120, 128, 880, 92);
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(10,4,18,0.45)';
    ctx.fillRect(-200, 120, VW + 400, 104);
    // Floodlights high left/right.
    ctx.globalCompositeOperation = 'lighter';
    for (const x of [40, VW - 40]) {
      drawGlow(ctx, glowOf([255, 240, 210]), x, 10, 120, 0.35);
      drawGlow(ctx, glowOf([255, 255, 255]), x, 10, 30, 0.9);
    }
    // Red heat glow behind the hero, growing.
    drawGlow(ctx, glowSprite('aura', 0.5), FEET_X, FEET_Y - 120, 260 + power * 80, 0.35 + power * 0.45, 1, 1.2);
    // Pillar of light.
    const pw = 40 + power * 70;
    const pg = ctx.createLinearGradient(FEET_X - pw, 0, FEET_X + pw, 0);
    pg.addColorStop(0, 'rgba(255,80,40,0)');
    pg.addColorStop(0.5, `rgba(255,190,90,${0.18 + power * 0.25})`);
    pg.addColorStop(1, 'rgba(255,80,40,0)');
    ctx.fillStyle = pg;
    ctx.fillRect(FEET_X - pw, -200, pw * 2, FEET_Y + 200);
    ctx.globalCompositeOperation = 'source-over';

    // Pitch: perspective stripes toward a vanishing point.
    const hz = 222;
    for (let i = -12; i <= 12; i++) {
      const x0 = VW / 2 + i * 34, x1 = VW / 2 + (i + 1) * 34;
      ctx.fillStyle = i & 1 ? '#1d5a2a' : '#22662f';
      ctx.beginPath();
      ctx.moveTo(x0, hz);
      ctx.lineTo(x1, hz);
      ctx.lineTo(VW / 2 + (i + 1) * 260, VH + 160);
      ctx.lineTo(VW / 2 + i * 260, VH + 160);
      ctx.closePath();
      ctx.fill();
    }
    const fog = ctx.createLinearGradient(0, hz, 0, VH + 40);
    fog.addColorStop(0, 'rgba(40,10,30,0.75)');
    fog.addColorStop(0.4, 'rgba(40,10,30,0.15)');
    fog.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = fog;
    ctx.fillRect(-200, hz, VW + 400, VH);
    // Ground glow pool + cracks.
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowSprite('fire', 0.45), FEET_X, FEET_Y + 4, 150 + power * 60, 0.35 + power * 0.4, 1.4, 0.35);
    ctx.globalCompositeOperation = 'source-over';
    drawCracks(ctx, cracks, FEET_X, FEET_Y + 2, keys([[0.2, 0], [1.5, 1]], t), power);

    // Back particles (flames behind the body).
    env.parts.draw(ctx, 0);

    // Aura silhouettes: gold inner, crimson outer, flickering.
    ctx.globalCompositeOperation = 'lighter';
    const fl = 0.75 + 0.25 * Math.sin(t * 40) * Math.sin(t * 23);
    for (const [c, s, a] of [
      [[255, 40, 30], 1.09, 0.28],
      [[255, 120, 40], 1.05, 0.38],
      [[255, 220, 120], 1.02, 0.45],
    ] as const) {
      const sc = SC * (s + (fl - 0.75) * 0.03);
      drawHero(env, FEET_X, FEET_Y + 2, sc, hero.tinted(c as unknown as [number, number, number]), a * (0.4 + power * 0.8) * fl);
    }
    ctx.globalCompositeOperation = 'source-over';

    // The hero.
    drawHero(env, FEET_X, FEET_Y, SC);
    // Rim light: additive tinted copy offset upward on the edges.
    ctx.globalCompositeOperation = 'lighter';
    drawHero(env, FEET_X, FEET_Y, SC, hero.tinted([110, 30, 10]), 0.1 + power * 0.14);
    // Hair ignites.
    const hairGlow = clamp((t - 0.9) / 0.8);
    if (hairGlow > 0) {
      ctx.imageSmoothingEnabled = false;
      ctx.save();
      ctx.globalAlpha = hairGlow * (0.22 + 0.12 * Math.sin(t * 30));
      ctx.drawImage(hero.hair, FEET_X - hero.footX * SC, FEET_Y - hero.footY * SC, hero.w * SC, hero.h * SC);
      ctx.restore();
    }
    ctx.globalCompositeOperation = 'source-over';

    // Ball with crackling arcs.
    drawBall(env, spin, BALL_X, BALL_Y, 5, SC, power * 0.45, 0.25 + power * 0.6);
    if (t > 0.5) {
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 3; i++) {
        if (rng.next() < 0.5) continue;
        const a = rng.range(0, Math.PI * 2);
        arc(ctx, rng, BALL_X, BALL_Y, BALL_X + Math.cos(a) * 38, BALL_Y + Math.sin(a) * 26, 6, 'rgba(255,230,140,0.9)', 1.2);
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    env.parts.draw(ctx, 1);

    // Upward wind streaks.
    ctx.globalCompositeOperation = 'lighter';
    speedStreaks(ctx, rng, 0, 0, VW, VH, -Math.PI / 2, 10, '#ffb070', 0.08 + power * 0.12, 40);
    ctx.globalCompositeOperation = 'source-over';

    // Eye flash.
    const ef = pulse(t, EYE_T, 0.5);
    if (ef > 0) {
      for (const [i, [ex, ey]] of hero.eyes.entries()) {
        const px = FEET_X + (ex + 0.5 - hero.footX) * SC;
        const py = FEET_Y + (ey + 0.5 - hero.footY) * SC;
        sparkle(ctx, px, py, 16 + 30 * ef, ef, i + t * 3);
      }
      const mx = FEET_X + (49 - hero.footX) * SC, my = FEET_Y + (23.5 - hero.footY) * SC;
      lensFlare(ctx, mx, my, 70, ef * 0.9, [255, 170, 110]);
    }

    // Post.
    const slam = clamp((t - 2.0) / 0.35);
    fx.bloom = 0.9 + power * 0.2;
    fx.bloomThresh = 0.64;
    fx.vignette = 0.7;
    fx.ca = 0.0015 + power * 0.002 + slam * 0.01;
    fx.radial = slam * 0.12;
    const [ux, uy] = env.cam.toUV(FEET_X, FEET_Y - 200);
    fx.radialX = ux;
    fx.radialY = uy;
    fx.flash = Math.max(pulse(t, 0, 0.25) * 0.85, ef * 0.25, ease.inExpo(slam) * 1.0);
    fx.contrast = 1.08;
    fx.tint = [255, 236, 226];
  },
};
