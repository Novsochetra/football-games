// SHOT 3 — THE FLICK: side view at grass level. No.10 loads, scoops under the ball,
// and launches it straight up. Contact = hit-stop + black/white impact frame +
// shockwave; then the camera whips upward chasing the rising ball.

import type { Shot, Env } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { clamp, ease, lerp } from '../../engine/math';
import { PK, drawGlow, glowOf, glowSprite } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { focusLines, speedStreaks } from '../../art/fx';
import { HERO_KIT, POSES, joints, jointWorld, poseAt, renderPuppet, drawPuppet, mixPose, type Pose } from '../../art/puppet';
import { Trail, drawBall, dustBurst, fireRibbon, grassChunks, pulse, ring, sparks, warp } from './common';

const DUR = 1.35;
const HIT = 0.5;
const GROUND = 300;
const K = 1; // puppet px per unit
const D = 2.0; // draw scale
const HIP_X = 250;
const HIP_Y = GROUND - 40 * K * D;
const BALL_R = 5;

const track: [number, Pose][] = [
  [0, POSES.stand],
  [0.36, POSES.flickLoad],
  [HIT, POSES.flickHit],
  [0.75, POSES.flickFollow],
  [DUR, POSES.flickFollow],
];

let spin = new BallSpin();
let bx = 0, by = 0, bvx = 0, bvy = 0;
let launched = false;
const trail = new Trail(16);

function poseNow(t: number) {
  // Hip dips during load, rises on follow-through.
  return poseAt(track, t);
}

function toeWorld(t: number): [number, number] {
  const j = joints(poseNow(t));
  return jointWorld(j.toeN, HIP_X, HIP_Y + hipDip(t), K, D);
}

function hipDip(t: number) {
  return t < HIT ? lerp(0, 8, ease.inOutQuad(clamp(t / 0.36))) : lerp(8, -4, ease.outCubic(clamp((t - HIT) / 0.3)));
}

export const shotFlick: Shot = {
  name: 'Flick-up',
  dur: DUR,
  seed: 33,
  cues: [
    { at: 0.05, fn: (e) => e.sfx.whoosh(0.35, 200, 900, 0.25) },
    { at: HIT, fn: (e) => { e.sfx.kick(1.2); e.sfx.boom(0.9, 0.5); } },
    { at: HIT + 0.16, fn: (e) => e.sfx.whoosh(0.8, 400, 5000, 0.6) },
  ],
  rate: (t) => warp(t, [[HIT, 0.14, 0.04], [HIT + 0.14, 0.12, 0.4]]),
  init(env) {
    spin = new BallSpin();
    launched = false;
    trail.clear();
    const [tx] = toeWorld(HIT);
    bx = tx + BALL_R * D * 0.4;
    by = GROUND - BALL_R * D;
    bvx = bvy = 0;
    env.cam.set(VW / 2 + 20, VH / 2 + 20, 1, 0);
  },
  update(env, t, dt) {
    const { rng, parts, cam } = env;
    if (!launched && t >= HIT) {
      launched = true;
      bvx = 60;
      bvy = -1500;
      cam.hit(0.75);
      ring(env, bx, by, 6, 120, 0.45, 0.3, 'white');
      ring(env, bx, by, 4, 70, 0.35, 0.3, 'gold');
      sparks(env, bx, by, 40, 700, Math.PI * 1.2, -Math.PI / 2, 'gold');
      grassChunks(env, bx - 6, GROUND, 26, 1.1);
      dustBurst(env, bx, GROUND, 18, 1.4);
    }
    if (launched) {
      bvy += 200 * dt;
      bx += bvx * dt;
      by += bvy * dt;
      spin.rotate(1, 0, 0, dt * 40);
      trail.push(bx, by);
      // flame shedding
      for (let i = 0; i < 4; i++) {
        parts.spawn({
          kind: PK.Glow, x: bx + rng.range(-5, 5), y: by + rng.range(-5, 5), vx: rng.range(-30, 30), vy: rng.range(40, 160),
          max: rng.range(0.25, 0.5), s0: rng.range(8, 14), s1: 2, ramp: 'fire', r0: 0.05, r1: 1, a0: 0.9, a1: 0, layer: 0,
        });
      }
    } else {
      spin.rotate(0, 1, 0, dt * 3);
    }
    // Aura motes around the hero before contact.
    if (t < HIT + 0.3 && rng.next() < 0.9) {
      const j = joints(poseNow(t));
      const [hx, hy] = jointWorld(j.neck, HIP_X, HIP_Y, K, D);
      parts.spawn({
        kind: PK.Glow, x: hx + rng.range(-40, 40), y: hy + rng.range(-20, 90), vx: rng.range(-20, 20), vy: rng.range(-120, -40),
        max: rng.range(0.3, 0.6), s0: rng.range(4, 9), s1: 1, ramp: 'aura', r0: 0.1, r1: 1, a0: 0.8, a1: 0, layer: 0,
      });
    }
    // Camera: hold, then whip-tilt upward chasing the ball.
    const up = ease.inCubic(clamp((t - HIT - 0.12) / (DUR - HIT - 0.12)));
    cam.set(VW / 2 + 20 + up * 30, lerp(VH / 2 + 20, -640, up), lerp(1, 1.1, up), lerp(0, -0.06, up));
    cam.shakeAmp = 18;
  },
  render(env, t) {
    const { ctx, fx, cam } = env;
    const st = env.art.stadium;
    const rng = env.frng();
    env.world();

    // Backdrop: blurred stands with floodlights, deep night above.
    const sky = ctx.createLinearGradient(0, -900, 0, 220);
    sky.addColorStop(0, '#020108');
    sky.addColorStop(0.6, '#0e0820');
    sky.addColorStop(1, '#2a1030');
    ctx.fillStyle = sky;
    ctx.fillRect(-300, -1200, VW + 600, 1440);
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = 0.5;
    ctx.drawImage(st.crowd, 300, 0, 400, 110, -160, 70, 960, 170);
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(14,6,24,0.55)';
    ctx.fillRect(-300, 60, VW + 600, 190);
    ctx.globalCompositeOperation = 'lighter';
    for (const [x, y] of [[60, -40], [560, -60], [300, -300]]) {
      drawGlow(ctx, glowOf([255, 240, 210]), x, y, 140, 0.3);
      drawGlow(ctx, glowOf([255, 255, 255]), x, y, 26, 0.8);
    }
    ctx.globalCompositeOperation = 'source-over';
    // Pitch strip.
    const gr = ctx.createLinearGradient(0, 236, 0, VH + 60);
    gr.addColorStop(0, '#163f22');
    gr.addColorStop(0.3, '#2a7a36');
    gr.addColorStop(1, '#1a5226');
    ctx.fillStyle = gr;
    ctx.fillRect(-300, 236, VW + 600, 300);
    for (let x = -300; x < VW + 300; x += 90) {
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.beginPath();
      ctx.moveTo(x, 236);
      ctx.lineTo(x + 45, 236);
      ctx.lineTo(x + 45 + 60, VH + 80);
      ctx.lineTo(x + 60, VH + 80);
      ctx.fill();
    }
    // Ground glow under the hero.
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowSprite('aura', 0.5), HIP_X + 10, GROUND, 120, 0.45, 1.6, 0.3);
    ctx.globalCompositeOperation = 'source-over';
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(HIP_X + 6, GROUND + 2, 46, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    env.parts.draw(ctx, 0);

    // Ball trail (behind ball).
    if (launched) fireRibbon(ctx, trail.pts, 26);

    // Hero puppet, with a crimson aura glow behind.
    const pose = poseNow(t);
    const hipY = HIP_Y + hipDip(t);
    const aura = renderPuppet(HERO_KIT, pose, { k: K, silhouette: { fill: [255, 80, 40], rim: [255, 220, 120], rim2: [255, 140, 60], lx: 1, ly: -1 } });
    ctx.globalCompositeOperation = 'lighter';
    const fl = 0.7 + 0.3 * Math.sin(t * 50);
    drawPuppet(ctx, aura, HIP_X - 2, hipY - 3, D * 1.04, 0.35 * fl);
    drawPuppet(ctx, aura, HIP_X, hipY, D * 1.015, 0.4);
    ctx.globalCompositeOperation = 'source-over';
    const body = renderPuppet(HERO_KIT, pose, { k: K });
    drawPuppet(ctx, body, HIP_X, hipY, D);

    // Ball
    const heat = launched ? clamp((t - HIT) * 3) : 0.2;
    drawBall(env, spin, bx, by, BALL_R, D, heat, launched ? 1 : 0.4);

    env.parts.draw(ctx, 1);

    // Impact frame: radial focus lines around the contact point.
    const imp = pulse(t, HIT, 0.2);
    if (imp > 0) {
      focusLines(ctx, rng, bx, by, 50, 700, 90, imp > 0.5 ? '#000' : '#fff', imp, 6);
    }
    if (launched) {
      const sp = clamp(-bvy / 1500);
      ctx.globalCompositeOperation = 'lighter';
      speedStreaks(ctx, rng, cam.x - 340, cam.y - 200, 680, 400, Math.PI / 2, 20, '#ffe0b0', 0.25 * sp * (t > HIT + 0.2 ? 1 : 0), 140);
      ctx.globalCompositeOperation = 'source-over';
    }

    // Post
    const [ux, uy] = cam.toUV(bx, by);
    if (t >= HIT) {
      const s = t - HIT;
      fx.shocks.push({ x: ux, y: uy, r: s * 1.6, s: 0.05 * clamp(1 - s * 2) });
    }
    fx.impact = t >= HIT && t < HIT + 0.07 ? 1 : t >= HIT + 0.07 && t < HIT + 0.12 ? 0.6 : 0;
    fx.impA = [8, 4, 10];
    fx.impB = [255, 248, 236];
    fx.flash = Math.max(pulse(t, 0, 0.2) * 0.9, pulse(t, HIT + 0.12, 0.15) * 0.5);
    fx.radial = launched ? 0.06 * clamp((t - HIT - 0.12) * 4) : 0;
    fx.radialX = ux;
    fx.radialY = uy;
    fx.ca = 0.002 + imp * 0.01;
    fx.bloom = 1.0;
    fx.vignette = 0.6;
  },
};

export type { Env };
void mixPose;
