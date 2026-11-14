// SHOT 5 — ZENITH: at the top of the sky, the ball hangs in front of the full moon.
// Time slows; No.10 (a rim-lit silhouette against the moon) somersaults over it and
// volleys it straight down. Contact detonates: red impact frame, shock ring across the sky.

import type { Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { TAU, clamp, ease, lerp, keys } from '../../engine/math';
import { PK, drawGlow, glowOf, glowSprite } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { focusLines } from '../../art/fx';
import { HERO_KIT, P, POSES, drawPuppet, joints, poseAt, renderPuppet, type Pose } from '../../art/puppet';
import { Trail, drawBall, fireRibbon, meteorFlames, pulse, ring, sparks, warp } from './common';

const DUR = 2.6;
const HIT = 1.38;
const MOON_X = 352, MOON_Y = 142, MOON_S = 1.45;
const B0X = MOON_X - 18, B0Y = MOON_Y + 26;
const HK = 0.8, HD = 1.5;
const D = Math.PI / 180;
const SHOT_DIR = 34 * D; // ball leaves down-right
const STRIKE: Pose = P({ torso: -30 * D, head: 16 * D, thighN: 64 * D, kneeN: 0, footN: -8 * D, thighF: -36 * D, kneeF: 70 * D, footF: 10 * D, armN: -110 * D, elbowN: 10 * D, armF: 120 * D, elbowF: 20 * D, spin: TAU });
const FOLLOW: Pose = P({ ...STRIKE, thighN: 96 * D, torso: -36 * D, spin: TAU + 0.2 });

const track: [number, Pose][] = [
  [0, POSES.leap],
  [0.5, POSES.tuck],
  [0.62, { ...POSES.tuck, spin: 0.6 }],
  [1.1, { ...POSES.tuck, spin: TAU - 0.9 }],
  [1.26, { ...POSES.ohLoad, spin: TAU - 0.15 }],
  [HIT, STRIKE],
  [1.75, FOLLOW],
  [DUR, { ...FOLLOW, spin: TAU + 0.5 }],
];

let spin = new BallSpin();
let ball = { x: B0X, y: B0Y, vx: 0, vy: 0 };
let hit = false;
const trail = new Trail(30);
let hipAtHit: [number, number] = [0, 0];

function hipPos(t: number): [number, number] {
  // Rise from below-left, arc over the ball, settle so the boot meets the ball at HIT.
  const start: [number, number] = [150, 470];
  const apex: [number, number] = [hipAtHit[0] - 26, hipAtHit[1] - 60];
  if (t <= 0.95) {
    const u = ease.outCubic(clamp(t / 0.95));
    return [lerp(start[0], apex[0], u), lerp(start[1], apex[1], u)];
  }
  if (t <= HIT) {
    const u = ease.inOutQuad((t - 0.95) / (HIT - 0.95));
    return [lerp(apex[0], hipAtHit[0], u), lerp(apex[1], hipAtHit[1], u)];
  }
  const u = t - HIT;
  return [hipAtHit[0] - u * 30, hipAtHit[1] + u * u * 40];
}

export const shotZenith: Shot = {
  name: 'Zenith',
  dur: DUR,
  seed: 55,
  rate: (t) => warp(t, [[0.7, 0.55, 0.42], [HIT, 0.2, 0.03], [HIT + 0.2, 0.15, 0.35]]),
  cues: [
    { at: 0.05, fn: (e) => e.sfx.whoosh(0.7, 900, 200, 0.3) },
    { at: 0.68, fn: (e) => e.sfx.timeStop(1.3) },
    { at: HIT, fn: (e) => { e.sfx.boom(1.4, 0.7); e.sfx.kick(1.4); e.sfx.crack(1); } },
    { at: HIT + 0.3, fn: (e) => e.sfx.roar(1.1, 0.55) },
  ],
  init(env) {
    spin = new BallSpin();
    hit = false;
    trail.clear();
    ball = { x: B0X, y: B0Y, vx: 0, vy: 0 };
    const j = joints(STRIKE);
    // Place the hip so the boot (toe) meets the back-top of the ball.
    hipAtHit = [B0X - 8 - j.toeN[0] * HK * HD, B0Y - 6 - j.toeN[1] * HK * HD];
    env.cam.set(VW / 2, VH / 2, 1, 0);
  },
  update(env, t, dt) {
    const { rng, parts, cam } = env;
    const pre = !hit;
    if (pre) {
      spin.rotate(0.3, 1, 0.2, dt * 2.5);
      ball.y = B0Y + Math.sin(t * 2.2) * 2;
      // Corona: motes orbiting and being sucked in.
      const charge = clamp((t - 0.4) / 0.9);
      if (rng.next() < 0.4 + charge) {
        const a = rng.range(0, TAU), r = rng.range(40, 90);
        parts.spawn({
          kind: PK.Glow, x: ball.x + Math.cos(a) * r, y: ball.y + Math.sin(a) * r, vx: -Math.cos(a) * r * 1.8, vy: -Math.sin(a) * r * 1.8,
          max: 0.5, s0: 2, s1: 5, ramp: 'gold', r0: 0.4, r1: 0, a0: 0, a1: 1, layer: 1,
        });
      }
    }
    if (!hit && t >= HIT) {
      hit = true;
      cam.hit(1);
      ball.vx = Math.cos(SHOT_DIR) * 260;
      ball.vy = Math.sin(SHOT_DIR) * 260;
      ring(env, ball.x, ball.y, 8, 260, 0.7, 1, 'white');
      ring(env, ball.x, ball.y, 6, 180, 0.55, 1, 'gold');
      ring(env, ball.x, ball.y, 4, 120, 0.45, 0.35, 'aura', SHOT_DIR);
      sparks(env, ball.x, ball.y, 70, 900, TAU, 0, 'gold');
      for (let i = 0; i < 40; i++) {
        const a = rng.range(0, TAU), s = rng.range(100, 500);
        parts.spawn({
          kind: PK.Glow, x: ball.x, y: ball.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 3,
          max: rng.range(0.4, 0.9), s0: rng.range(10, 22), s1: 2, ramp: 'fire', r0: 0, r1: 1, a0: 1, a1: 0, layer: 1,
        });
      }
    }
    if (hit) {
      const sp = Math.hypot(ball.vx, ball.vy);
      const ns = Math.min(2600, sp + dt * 3400);
      ball.vx = Math.cos(SHOT_DIR) * ns;
      ball.vy = Math.sin(SHOT_DIR) * ns;
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      spin.rotate(-Math.sin(SHOT_DIR), Math.cos(SHOT_DIR), 0, dt * 50);
      trail.push(ball.x, ball.y);
      meteorFlames(env, ball.x, ball.y, 12, SHOT_DIR, 1, dt);
    }
    // Hero rim-light flicker motes.
    const [hx, hy] = hipPos(t);
    if (rng.next() < 0.6) {
      parts.spawn({
        kind: PK.Glow, x: hx + rng.range(-20, 20), y: hy + rng.range(-40, 30), vx: rng.range(-30, 30), vy: rng.range(20, 80),
        max: 0.5, s0: rng.range(4, 8), s1: 1, ramp: 'aura', r0: 0.2, r1: 1, a0: 0.6, a1: 0, layer: 0,
      });
    }
    // Camera: slow drift + punch-in at contact, then lean toward the meteor.
    const punch = pulse(t, HIT, 0.45);
    const after = ease.inOutQuad(clamp((t - HIT - 0.25) / (DUR - HIT - 0.25)));
    cam.set(
      VW / 2 + lerp(0, 110, after),
      VH / 2 + lerp(0, 120, after),
      lerp(1.02, 1.1, clamp(t / HIT)) + punch * 0.18 - after * 0.2,
      lerp(-0.02, 0.03, clamp(t / DUR)),
    );
    cam.shakeAmp = 22;
  },
  render(env, t) {
    const { ctx, fx, cam } = env;
    const st = env.art.stadium;
    const rng = env.frng();
    const stopped = t > 0.7 && t < HIT;
    const sinceHit = t - HIT;
    env.world();

    // Deep space sky.
    const g = ctx.createLinearGradient(0, -200, 0, VH + 200);
    g.addColorStop(0, '#010109');
    g.addColorStop(0.55, '#070b2c');
    g.addColorStop(1, '#141d52');
    ctx.fillStyle = g;
    ctx.fillRect(-300, -300, VW + 600, VH + 600);
    ctx.fillStyle = '#e6ebff';
    for (const s of st.stars) {
      const x = ((s.x * 0.41) % (VW + 200)) - 100, y = (((s.y + 1400) * 0.31) % (VH + 200)) - 100;
      ctx.globalAlpha = s.b * (0.7 + 0.3 * Math.sin(s.x + t * 2));
      ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
    ctx.globalAlpha = 1;

    // Moon + halo. Shock wave momentarily lights its rim red.
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf([110, 130, 230]), MOON_X, MOON_Y, 280, 0.3);
    drawGlow(ctx, glowOf([200, 210, 255]), MOON_X, MOON_Y, 150, 0.12);
    ctx.globalCompositeOperation = 'source-over';
    const mw = 160 * MOON_S;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(st.moon, MOON_X - mw / 2, MOON_Y - mw / 2, mw, mw);
    // Cool the moon down so the burning ball and the hero's rim light read against it.
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgb(150,160,205)';
    ctx.beginPath();
    ctx.arc(MOON_X, MOON_Y, mw / 2 + 1, 0, TAU);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    if (sinceHit > 0) {
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowSprite('aura', 0.3), MOON_X, MOON_Y, 220, clamp(1 - sinceHit * 1.5) * 0.8);
      ctx.globalCompositeOperation = 'source-over';
    }

    // Sea of clouds far below, pushed out by the blast.
    const blast = sinceHit > 0 ? ease.outCubic(clamp(sinceHit / 0.8)) : 0;
    ctx.globalAlpha = 0.85;
    for (let i = 0; i < 9; i++) {
      const img = st.cloud[i % 3];
      const cx = -100 + i * 100;
      const dx = (cx - VW / 2) * blast * 0.25;
      ctx.drawImage(img, cx - 140 + dx, 300 + (i % 2) * 14 + blast * 10, 280, 100);
    }
    ctx.globalAlpha = 1;
    const sea = ctx.createLinearGradient(0, 300, 0, VH + 100);
    sea.addColorStop(0, 'rgba(20,24,70,0)');
    sea.addColorStop(1, 'rgba(10,12,40,0.9)');
    ctx.fillStyle = sea;
    ctx.fillRect(-300, 300, VW + 600, 300);

    // Corona around the ball before contact: rotating fire ring + sun rays.
    const charge = clamp((t - 0.4) / 0.9);
    if (!hit || sinceHit < 0.05) {
      // Eclipse halo: darken the moon behind the ball so the corona colors read.
      const eg = ctx.createRadialGradient(ball.x, ball.y, 6, ball.x, ball.y, 90);
      eg.addColorStop(0, 'rgba(12,4,18,0.95)');
      eg.addColorStop(0.45, 'rgba(12,4,18,0.6)');
      eg.addColorStop(1, 'rgba(12,4,18,0)');
      ctx.fillStyle = eg;
      ctx.fillRect(ball.x - 90, ball.y - 90, 180, 180);
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowSprite('aura', 0.5), ball.x, ball.y, 40 + charge * 46, 0.3 + charge * 0.35);
      const n = 18;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU + t * 3;
        const r = 26 + charge * 10 + Math.sin(t * 20 + i) * 2;
        drawGlow(ctx, glowSprite('aura', 0.35 + 0.15 * Math.sin(i)), ball.x + Math.cos(a) * r, ball.y + Math.sin(a) * r * 0.9, 8 + charge * 4, charge * 0.75);
      }
      // rays
      ctx.strokeStyle = 'rgba(255,170,90,0.55)';
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = charge * 0.8;
      ctx.beginPath();
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU - t * 0.6;
        const r0 = 30, r1 = 60 + charge * 70 + (i % 2) * 30;
        ctx.moveTo(ball.x + Math.cos(a) * r0, ball.y + Math.sin(a) * r0);
        ctx.lineTo(ball.x + Math.cos(a) * r1, ball.y + Math.sin(a) * r1);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    env.parts.draw(ctx, 0);

    // Hero: silhouette against the moon, rim-lit from the moon side, with a crimson aura.
    const pose = poseAt(track, t);
    const [hx, hy] = hipPos(t);
    const lx = MOON_X - hx, ly = MOON_Y - hy;
    const ll = Math.hypot(lx, ly) || 1;
    const aura = renderPuppet(HERO_KIT, pose, { k: HK, silhouette: { fill: [255, 60, 40], rim: [255, 200, 120], rim2: [255, 120, 60], lx: 1, ly: -1 } });
    ctx.globalCompositeOperation = 'lighter';
    drawPuppet(ctx, aura, hx, hy, HD * 1.1, 0.35 + 0.15 * Math.sin(t * 30));
    ctx.globalCompositeOperation = 'source-over';
    const sil = renderPuppet(HERO_KIT, pose, {
      k: HK,
      silhouette: { fill: [14, 6, 22], rim: [255, 120, 70], rim2: [150, 36, 48], lx: -lx / ll, ly: -ly / ll },
    });
    drawPuppet(ctx, sil, hx, hy, HD);

    // Ball / meteor.
    if (hit) fireRibbon(ctx, trail.pts, 46);
    drawBall(env, spin, ball.x, ball.y, 7, 2, hit ? 1 : 0.3 + charge * 0.4, hit ? 1.4 : 0.2 + charge * 0.25);

    env.parts.draw(ctx, 1);

    // Contact focus lines.
    const imp = pulse(t, HIT, 0.3);
    if (imp > 0) focusLines(ctx, rng, ball.x, ball.y, 60, 800, 110, imp > 0.6 ? '#120008' : '#fff2dc', imp, 7);

    // Post.
    const [ux, uy] = cam.toUV(ball.x, ball.y);
    fx.bloom = 1.05;
    fx.bloomThresh = 0.72;
    fx.vignette = 0.65;
    fx.sat = stopped ? lerp(1, 0.55, clamp((t - 0.7) / 0.2)) : 1;
    fx.tint = stopped ? [210, 225, 255] : [255, 255, 255];
    fx.ca = 0.002 + imp * 0.012;
    if (sinceHit >= 0 && sinceHit < 0.07) {
      fx.impact = 1;
      fx.impA = [8, 2, 10];
      fx.impB = [255, 246, 230];
    } else if (sinceHit >= 0.07 && sinceHit < 0.16) {
      fx.impact = 1;
      fx.impA = [255, 54, 40];
      fx.impB = [14, 0, 8];
      fx.impThresh = 0.5;
    }
    if (sinceHit > 0) {
      fx.shocks.push({ x: ux, y: uy, r: sinceHit * 1.5, s: 0.07 * clamp(1 - sinceHit * 1.2) });
      fx.shocks.push({ x: ux, y: uy, r: sinceHit * 0.8, s: 0.04 * clamp(1 - sinceHit * 2) });
      fx.radial = 0.05 * clamp(1 - (sinceHit - 0.3) * 2) * (sinceHit > 0.2 ? 1 : 0);
      fx.radialX = ux;
      fx.radialY = uy;
    }
    fx.flash = Math.max(pulse(t, 0, 0.15) * 0.7, pulse(t, HIT + 0.16, 0.25) * 0.7, ease.inExpo(clamp((t - DUR + 0.12) / 0.12)) * 0.9);
    void keys;
  },
};
