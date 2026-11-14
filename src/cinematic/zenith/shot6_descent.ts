// SHOT 6 — DESCENT. Two beats:
//  a) POV from the pitch looking up: the meteor drops out of a burning sky straight at us.
//  b) Wide field view: it skims in low over the grass, scorching a trail. Two defenders
//     leap to block it and are blasted aside.

import type { Shot, Env } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { TAU, clamp, ease, lerp } from '../../engine/math';
import { PK, drawGlow, glowOf, glowSprite } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { focusLines, speedStreaks } from '../../art/fx';
import { FIELD, drawFieldBackdrop, drawGoal, drawShadow } from '../../art/stadium';
import { POSES, RIVAL_KIT, RIVAL_KIT_B, KEEPER_KIT, drawPuppet, mixPose, renderPuppet, type Kit, type Pose } from '../../art/puppet';
import { Trail, drawBall, fireRibbon, meteorFlames, pulse, ring, sparks, dustBurst, grassChunks } from './common';

const POV = 0.8; // end of beat (a)
const FLY = 1.3; // flight time of beat (b)
const DUR = POV + FLY + 0.04;
const K = 0.42;

let spin = new BallSpin();
const trail = new Trail(26);
let scorch: { x: number; y: number }[] = [];

interface Def {
  kit: Kit;
  x: number;
  z: number;
  h: number;
  vx: number;
  vh: number;
  rot: number;
  vrot: number;
  hitAt: number;
  facing: 1 | -1;
  jumpAt: number;
}
/** Beat-(b) time at which the ball passes world x. */
const arrival = (x: number) => FLY * Math.pow(clamp((x - 700) / (FIELD.goalX - 8 - 700)), 1 / 1.35);
let defs: Def[] = [];

/** Ball 3D path for beat (b): u in 0..1 -> world x, depth z, height h. */
function path(u: number) {
  const x = lerp(700, FIELD.goalX - 8, u);
  const z = lerp(236, 258, u);
  const h = 620 * Math.pow(1 - u, 4) + 10 * (1 - u) + 14;
  return { x, z, h };
}
const uAt = (tb: number) => Math.pow(clamp(tb / FLY), 1.35);

export const shotDescent: Shot = {
  name: 'Descent',
  dur: DUR,
  seed: 66,
  cues: [
    { at: 0, fn: (e) => e.sfx.roar(0.85, 0.6) },
    { at: POV - 0.05, fn: (e) => e.sfx.whoosh(0.4, 3000, 300, 0.5) },
    { at: POV + 0.05, fn: (e) => { e.sfx.roar(1.4, 0.55); e.sfx.crowd(2.2, 0.25); } },
  ],
  init(env) {
    spin = new BallSpin();
    trail.clear();
    scorch = [];
    defs = [
      { kit: RIVAL_KIT, x: 958, z: 244, h: 0, vx: 0, vh: 0, rot: 0, vrot: 0, hitAt: -1, facing: -1, jumpAt: arrival(958) - 0.21 },
      { kit: RIVAL_KIT_B, x: 1046, z: 266, h: 0, vx: 0, vh: 0, rot: 0, vrot: 0, hitAt: -1, facing: -1, jumpAt: arrival(1046) - 0.12 },
    ];
    env.cam.set(VW / 2, VH / 2, 1, 0);
  },
  update(env, t, dt) {
    const { rng, parts, cam } = env;
    spin.rotate(1, 1, 0, dt * 45);
    if (t < POV) {
      // Beat (a): embers rush outward from the meteor toward the lens.
      const u = t / POV;
      const s = ease.inExpo(u);
      const mx = VW / 2 + 10, my = lerp(60, 150, s);
      const rr = lerp(10, 60, s);
      for (let i = 0; i < 2; i++) {
        const a = rng.range(0, TAU), sp = rng.range(200, 700) * (0.4 + u);
        parts.spawn({
          kind: PK.Streak, x: mx + Math.cos(a) * rr, y: my + Math.sin(a) * rr, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          max: rng.range(0.3, 0.6), s0: rng.range(1, 2.5), s1: 0.5, ramp: 'ember', r0: 0, r1: 1, k: 1.6, layer: 1,
        });
      }
      cam.set(VW / 2, VH / 2, 1 + s * 0.08, Math.sin(t * 3) * 0.02);
      cam.trauma = Math.max(cam.trauma, 0.2 + u * 0.6);
      cam.shakeAmp = 12;
      return;
    }
    // Beat (b)
    const tb = t - POV;
    const u = uAt(tb);
    const p = path(u);
    const bx = p.x, by = p.z - p.h;
    trail.push(bx, by);
    const dir = Math.atan2(path(Math.min(1, u + 0.02)).z - path(Math.min(1, u + 0.02)).h - by, path(Math.min(1, u + 0.02)).x - bx);
    meteorFlames(env, bx, by, 9, dir, 1, dt);
    // Scorch + grass fire once low.
    if (p.h < 70) {
      scorch.push({ x: bx, y: p.z });
      if (rng.next() < 0.8) {
        parts.spawn({
          kind: PK.Glow, x: bx + rng.range(-10, 10), y: p.z + rng.range(-2, 2), vx: rng.range(-20, 20), vy: rng.range(-60, -20),
          max: rng.range(0.3, 0.7), s0: rng.range(4, 8), s1: 1, ramp: 'fire', r0: 0.2, r1: 1, a0: 0.8, a1: 0, layer: 0,
        });
      }
      if (rng.next() < 0.3) grassChunks(env, bx, p.z, 2, 0.6);
    }
    // Defenders: jump to block, get blasted.
    for (const d of defs) {
      const jumpStart = d.jumpAt;
      if (d.hitAt < 0) {
        if (tb > jumpStart) {
          const jt = tb - jumpStart;
          d.h = Math.max(0, 260 * jt - 600 * jt * jt);
        }
        if (Math.abs(bx - d.x) < 16) {
          d.hitAt = tb;
          d.vx = (d === defs[0] ? -1 : 1) * rng.range(180, 260);
          d.vh = 320;
          d.vrot = (d === defs[0] ? -1 : 1) * 14;
          cam.hit(0.65);
          env.sfx.boom(0.8, 0.4);
          env.sfx.crack(0.8);
          ring(env, d.x, d.z - d.h - 16, 6, 90, 0.45, 0.6, 'gold');
          sparks(env, d.x, d.z - d.h - 16, 30, 600, TAU, 0, 'ember');
          dustBurst(env, d.x, d.z, 10, 1.2);
        }
      } else {
        d.x += d.vx * dt;
        d.vh -= 900 * dt;
        d.h = Math.max(0, d.h + d.vh * dt);
        d.rot += d.vrot * dt;
        if (d.h === 0) {
          d.vx *= 0.9;
          d.vrot *= 0.85;
        }
      }
    }
    cam.set(lerp(860, 1060, ease.inOutQuad(clamp(tb / FLY))), 196, lerp(1.32, 1.42, tb / (DUR - POV)), -0.02);
    cam.shakeAmp = 12;
    cam.trauma = Math.max(cam.trauma, 0.22);
  },
  render(env, t) {
    if (t < POV) renderPOV(env, t);
    else renderWide(env, t - POV);
  },
};

function renderPOV(env: Env, t: number) {
  const { ctx, fx, cam } = env;
  const st = env.art.stadium;
  const rng = env.frng();
  const u = t / POV;
  const s = ease.inExpo(u);
  env.world();
  // Burning sky.
  const g = ctx.createRadialGradient(VW / 2 + 10, lerp(60, 150, s), 10, VW / 2, 140, 520);
  g.addColorStop(0, '#ff8a48');
  g.addColorStop(0.2, '#b8202a');
  g.addColorStop(0.55, '#3e0820');
  g.addColorStop(1, '#0a020e');
  ctx.fillStyle = g;
  ctx.fillRect(-100, -100, VW + 200, VH + 200);
  focusLines(ctx, rng, VW / 2 + 10, lerp(60, 150, s), 60, 600, 50, '#ffd8a8', 0.12 + u * 0.22, 3);

  // Meteor approaching (grows), plume streaming back up.
  const mx = VW / 2 + 10, my = lerp(60, 150, s);
  const br = Math.max(3, Math.round(lerp(4, 22, s)));
  const R = br * 2;
  ctx.globalCompositeOperation = 'lighter';
  // Flame plume streaming up behind the ball (toward the vanishing point).
  for (let i = 0; i < 10; i++) {
    const k = i / 10;
    drawGlow(ctx, glowSprite('fire', 0.3 + k * 0.55), mx + Math.sin(t * 24 + i * 1.7) * (2 + R * 0.15), my - R * 0.8 - k * (60 + R * 1.2), R * (1.2 - k * 0.7), 0.4 - k * 0.3);
  }
  drawGlow(ctx, glowSprite('aura', 0.45), mx, my, R * 2.2, 0.35);
  ctx.globalCompositeOperation = 'source-over';
  drawBall(env, spin, mx, my, br, 2, 0.55, 0.25);

  env.parts.draw(ctx, 1);

  // Stadium rim seen from below (dark ring framing the sky) + floodlights.
  ctx.fillStyle = '#05030a';
  ctx.beginPath();
  ctx.rect(-200, -200, VW + 400, VH + 400);
  ctx.ellipse(VW / 2, 128, 330, 200, 0, 0, TAU, true);
  ctx.fill('evenodd');
  ctx.globalAlpha = 0.7;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(st.crowdNear, 0, 0, 800, 40, -100, 300, 840, 70);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'lighter';
  for (const [x, y] of [[-10, 230], [VW + 10, 230], [80, 330], [VW - 80, 330]]) {
    drawGlow(ctx, glowOf([255, 245, 220]), x, y, 90, 0.5);
    drawGlow(ctx, glowOf([255, 255, 255]), x, y, 18, 0.9);
  }
  ctx.globalCompositeOperation = 'source-over';

  fx.bloom = 1.0;
  fx.bloomThresh = 0.7;
  fx.vignette = 0.7;
  fx.ca = 0.002 + u * 0.008;
  const [ux, uy] = cam.toUV(mx, my);
  fx.radial = 0.015 + u * 0.035;
  fx.radialX = ux;
  fx.radialY = uy;
  fx.flash = Math.max(pulse(t, 0, 0.12) * 0.8, ease.inExpo(clamp((t - POV + 0.12) / 0.12)));
}

function renderWide(env: Env, tb: number) {
  const { ctx, fx, cam } = env;
  const st = env.art.stadium;
  const rng = env.frng();
  const u = uAt(tb);
  const p = path(u);
  const bx = p.x, by = p.z - p.h;
  env.world();
  drawFieldBackdrop(ctx, st, cam.x, cam.y, 40 + tb);

  // Red glow of the meteor over the pitch.
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowSprite('fire', 0.4), bx, p.z, 120 + (1 - clamp(p.h / 300)) * 120, 0.25 + (1 - clamp(p.h / 400)) * 0.5, 1.5, 0.4);
  ctx.globalCompositeOperation = 'source-over';
  // Scorch trail.
  ctx.strokeStyle = 'rgba(20,8,6,0.75)';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  scorch.forEach((s, i) => (i ? ctx.lineTo(s.x, s.y) : ctx.moveTo(s.x, s.y)));
  ctx.stroke();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = 'rgba(255,120,40,0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
  // Ball shadow tightening as it nears the ground.
  drawShadow(ctx, bx, p.z, lerp(4, 14, clamp(1 - p.h / 300)), lerp(0.1, 0.5, clamp(1 - p.h / 300)));

  drawGoal(ctx, 'back', 0);
  // Keeper waiting on his line.
  drawShadow(ctx, 1168, 258, 11, 0.35);
  drawPuppet(ctx, renderPuppet(KEEPER_KIT, POSES.gkReady, { k: K, facing: -1 }), 1168, 258 - 40 * K, 1);

  env.parts.draw(ctx, 0);

  // Defenders.
  for (const d of defs) {
    drawShadow(ctx, d.x, d.z, 11, 0.35);
    let pose: Pose = POSES.stand;
    if (d.hitAt >= 0) pose = { ...POSES.blown, spin: d.rot };
    else if (d.h > 0) pose = mixPose(POSES.crouch, POSES.blockJump, clamp(d.h / 30));
    else if (tb > d.jumpAt - 0.15) pose = mixPose(POSES.stand, POSES.crouch, clamp((tb - d.jumpAt + 0.15) / 0.12));
    const r = renderPuppet(d.kit, pose, { k: K, facing: d.facing });
    drawPuppet(ctx, r, d.x, d.z - d.h - 40 * K, 1);
  }

  // Meteor.
  fireRibbon(ctx, trail.pts, 26);
  drawBall(env, spin, bx, by, 5, 1, 1, 1.3);
  drawGoal(ctx, 'front');
  env.parts.draw(ctx, 1);

  ctx.globalCompositeOperation = 'lighter';
  speedStreaks(ctx, rng, cam.x - 280, cam.y - 160, 560, 320, 0.28, 18, '#ffd7a8', 0.25, 90);
  ctx.globalCompositeOperation = 'source-over';

  const [ux, uy] = cam.toUV(bx, by);
  fx.bloom = 1.0;
  fx.bloomThresh = 0.6;
  fx.vignette = 0.55;
  fx.ca = 0.002;
  fx.radial = 0.012;
  fx.radialX = ux;
  fx.radialY = uy;
  fx.tint = [255, 230, 215];
  for (const d of defs) {
    if (d.hitAt < 0) continue;
    const s = tb - d.hitAt;
    const [dx, dy] = cam.toUV(d.x, d.z - 30);
    if (s < 0.6) fx.shocks.push({ x: dx, y: dy, r: s * 1.1, s: 0.04 * (1 - s / 0.6) });
    if (s < 0.05) fx.impact = 0.85;
  }
  fx.flash = Math.max(pulse(tb, 0, 0.2) * 0.9, ease.inExpo(clamp((tb - (DUR - POV) + 0.1) / 0.1)) * 0.8);
}
