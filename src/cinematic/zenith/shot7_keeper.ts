// SHOT 7 — THE KEEPER: close side view on the goal line. The keeper catches the meteor,
// but it keeps spinning in his gloves: sparks spray, his boots carve skid marks, the
// gloves glow and smoke... then his arms are blown open and he is driven into the net.

import type { Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { TAU, clamp, ease, lerp } from '../../engine/math';
import { PK, drawGlow, glowOf, glowSprite } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { arc, focusLines, speedStreaks } from '../../art/fx';
import { KEEPER_KIT, POSES, drawPuppet, joints, jointWorld, poseAt, renderPuppet, type Pose } from '../../art/puppet';
import { Trail, drawBall, fireRibbon, meteorFlames, pulse, ring, sparks, warp, dustBurst, grassChunks } from './common';

const DUR = 1.95;
const CATCH = 0.24;
const BREAK = 1.36;
const GROUND = 304;
const K = 1, D = 1.9;
const FACING = -1 as const;
const HIP0 = 392;

const track: [number, Pose][] = [
  [0, POSES.gkReady],
  [CATCH, POSES.gkCatch],
  [0.6, POSES.gkStrain],
  [BREAK, { ...POSES.gkStrain, torso: POSES.gkStrain.torso - 0.25 }],
  [BREAK + 0.12, POSES.gkBlown],
  [DUR, { ...POSES.gkBlown, spin: -1.2 }],
];

let spin = new BallSpin();
const trail = new Trail(18);
let keeper = { x: HIP0, y: 0, vx: 0, vy: 0 };
let ball = { x: -80, y: 0, vx: 0 };
let broke = false;
let catchPt: [number, number] = [0, 0];

const hipY0 = GROUND - 40 * K * D + 8;

function handsAt(t: number, hx: number, hy: number): [number, number] {
  const j = joints(poseAt(track, t));
  const a = jointWorld(j.handN, hx, hy, K, D, FACING);
  const b = jointWorld(j.handF, hx, hy, K, D, FACING);
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

export const shotKeeper: Shot = {
  name: 'Keeper',
  dur: DUR,
  seed: 77,
  rate: (t) => warp(t, [[CATCH, 0.1, 0.03], [BREAK, 0.08, 0.05]]),
  cues: [
    { at: CATCH, fn: (e) => { e.sfx.boom(1.0, 0.5); e.sfx.crack(1); } },
    { at: CATCH + 0.1, fn: (e) => e.sfx.strain(BREAK - CATCH - 0.05, 0.4) },
    { at: BREAK, fn: (e) => { e.sfx.boom(1.3, 0.6); e.sfx.crack(1); e.sfx.whoosh(0.5, 1500, 200, 0.5); } },
  ],
  init(env) {
    spin = new BallSpin();
    trail.clear();
    broke = false;
    keeper = { x: HIP0, y: hipY0, vx: 0, vy: 0 };
    catchPt = handsAt(CATCH, HIP0, hipY0);
    ball = { x: -80, y: catchPt[1], vx: 0 };
    env.cam.set(VW / 2, VH / 2, 1, 0);
  },
  update(env, t, dt) {
    const { rng, parts, cam } = env;
    if (t < CATCH) {
      const u = t / CATCH;
      ball.x = lerp(-80, catchPt[0] - 14, u);
      ball.y = catchPt[1];
      spin.rotate(0, 0, 1, dt * 40);
      trail.push(ball.x, ball.y);
      meteorFlames(env, ball.x, ball.y, 10, 0, 1, dt);
    } else if (t < BREAK) {
      // Driven back: slow at first, then accelerating.
      const s = (t - CATCH) / (BREAK - CATCH);
      keeper.x = HIP0 + ease.inCubic(s) * 90 + s * 20;
      keeper.y = hipY0;
      const [hx, hy] = handsAt(t, keeper.x, keeper.y);
      ball.x = hx - 12 + Math.sin(t * 90) * 1.5;
      ball.y = hy + Math.cos(t * 77) * 1.5;
      spin.rotate(0, 0, 1, dt * 70);
      trail.push(ball.x, ball.y);
      if (trail.pts.length > 6) trail.pts.shift();
      // Sparks spray back toward the shooter, smoke from the gloves.
      sparks(env, ball.x - 8, ball.y, 3, 700, 1.4, Math.PI, 'gold');
      if (rng.next() < 0.7) {
        parts.spawn({
          kind: PK.Smoke, x: ball.x + rng.range(-6, 10), y: ball.y + rng.range(-10, 6), vx: rng.range(-40, 10), vy: rng.range(-90, -30), drag: 1,
          max: rng.range(0.6, 1.1), s0: 6, s1: 22, ramp: 'smoke', r0: 0, r1: 1, a0: 0.5, a1: 0, add: false, layer: 1,
        });
      }
      meteorFlames(env, ball.x, ball.y, 9, 0, 0.6 + s * 0.4, dt);
      // Skid dust + grass at the boots.
      if (rng.next() < 0.6) {
        const j = joints(poseAt(track, t));
        for (const toe of [j.toeN, j.toeF]) {
          const [fx0] = jointWorld(toe, keeper.x, keeper.y, K, D, FACING);
          parts.spawn({
            kind: PK.Smoke, x: fx0, y: GROUND, vx: rng.range(-90, -20), vy: rng.range(-30, -5), drag: 2, max: 0.8, s0: 6, s1: 20,
            ramp: 'dust', r0: 0, r1: 1, a0: 0.5, a1: 0, add: false, layer: 1,
          });
        }
        if (rng.next() < 0.4) grassChunks(env, keeper.x + 20, GROUND, 2, 0.5);
      }
      cam.trauma = Math.max(cam.trauma, 0.35 + s * 0.45);
    } else {
      if (!broke) {
        broke = true;
        keeper.vx = 820;
        keeper.vy = -260;
        ball.vx = 1500;
        cam.hit(1);
        ring(env, ball.x, ball.y, 8, 200, 0.6, 1, 'white');
        ring(env, ball.x, ball.y, 6, 140, 0.5, 0.6, 'gold');
        sparks(env, ball.x, ball.y, 60, 900, TAU, 0, 'ember');
        dustBurst(env, keeper.x, GROUND, 16, 1.6);
      }
      keeper.vy += 900 * dt;
      keeper.x += keeper.vx * dt;
      keeper.y += keeper.vy * dt;
      ball.x += ball.vx * dt;
      spin.rotate(0, 0, 1, dt * 60);
      trail.push(ball.x, ball.y);
      meteorFlames(env, ball.x, ball.y, 10, 0, 1, dt);
    }
    // Camera pushes in on the gloves during the struggle.
    const push = ease.inOutQuad(clamp((t - CATCH) / (BREAK - CATCH)));
    const after = clamp((t - BREAK) / 0.5);
    cam.set(lerp(VW / 2, ball.x + 20, push * 0.55) + after * 60, lerp(VH / 2 + 10, ball.y + 10, push * 0.5), lerp(1, 1.4, push) - after * 0.25, lerp(0, 0.04, push));
    cam.shakeAmp = 14;
  },
  render(env, t) {
    const { ctx, fx, cam } = env;
    const st = env.art.stadium;
    const rng = env.frng();
    env.world();

    // Backdrop: stands bokeh.
    ctx.fillStyle = '#0c0718';
    ctx.fillRect(-300, -300, VW + 900, VH + 600);
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = 0.45;
    ctx.drawImage(st.crowd, 900, 0, 500, 110, -200, 20, 1300, 240);
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(12,6,22,0.5)';
    ctx.fillRect(-300, 0, VW + 900, 260);
    ctx.globalCompositeOperation = 'lighter';
    for (const [x, y] of [[100, -20], [700, -40]]) {
      drawGlow(ctx, glowOf([255, 240, 210]), x, y, 160, 0.3);
      drawGlow(ctx, glowOf([255, 255, 255]), x, y, 30, 0.8);
    }
    ctx.globalCompositeOperation = 'source-over';

    // Goal: post, crossbar and net mesh behind the keeper (right side).
    const postX = 452, barY = 66;
    const bulge = broke ? ease.outCubic(clamp((t - BREAK) / 0.4)) : 0;
    ctx.strokeStyle = 'rgba(220,226,255,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 26; i++) {
      const x = postX + 14 + i * 16;
      ctx.moveTo(x + bulge * 40 * Math.exp(-((x - 600) ** 2) / 8000), barY);
      ctx.lineTo(x + 30 + bulge * 60, GROUND + 6);
    }
    for (let j = 0; j < 14; j++) {
      const y = barY + j * 17;
      ctx.moveTo(postX + 10, y);
      ctx.lineTo(VW + 400, y + bulge * 20);
    }
    ctx.stroke();
    ctx.fillStyle = '#180411';
    ctx.fillRect(postX - 4, barY - 4, 12, GROUND - barY + 6);
    ctx.fillRect(postX - 4, barY - 4, 500, 12);
    ctx.fillStyle = '#f4f6ff';
    ctx.fillRect(postX - 2, barY - 2, 8, GROUND - barY + 2);
    ctx.fillRect(postX - 2, barY - 2, 500, 8);
    ctx.fillStyle = '#b8bcd8';
    ctx.fillRect(postX + 4, barY + 4, 2, GROUND - barY - 4);

    // Ground with goal line and skid marks.
    const gr = ctx.createLinearGradient(0, GROUND - 10, 0, VH + 100);
    gr.addColorStop(0, '#1f5a2a');
    gr.addColorStop(1, '#2c7a36');
    ctx.fillStyle = gr;
    ctx.fillRect(-300, GROUND, VW + 900, 300);
    ctx.fillStyle = 'rgba(240,245,255,0.8)';
    ctx.fillRect(postX - 10, GROUND, 24, 4);
    if (t > CATCH) {
      ctx.fillStyle = 'rgba(40,24,14,0.85)';
      const x1 = Math.min(keeper.x + 30, postX + 200);
      ctx.fillRect(HIP0 - 6, GROUND + 1, x1 - HIP0 + 6, 3);
      ctx.fillRect(HIP0 + 18, GROUND + 6, x1 - HIP0 - 10, 3);
    }

    env.parts.draw(ctx, 0);

    // Keeper.
    const pose = poseAt(track, t);
    const kr = renderPuppet(KEEPER_KIT, pose, { k: K, facing: FACING });
    drawPuppet(ctx, kr, keeper.x, keeper.y, D);
    // Glove heat.
    const heat = t > CATCH ? clamp((t - CATCH) / (BREAK - CATCH)) : 0;
    if (heat > 0 && !broke) {
      const [hx, hy] = handsAt(t, keeper.x, keeper.y);
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowSprite('fire', 0.3), hx, hy, 30 + heat * 30, 0.3 + heat * 0.6);
      ctx.globalCompositeOperation = 'source-over';
    }

    // Ball.
    fireRibbon(ctx, trail.pts, 30, 1, 6 * D);
    drawBall(env, spin, ball.x, ball.y, 6, D, 1, 1.3);
    // Spin arcs around the ball while it grinds in the gloves.
    if (t > CATCH && !broke) {
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 4; i++) {
        const a0 = t * 30 + i * 1.6;
        ctx.strokeStyle = `rgba(255,${200 - i * 30},120,0.8)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(ball.x, ball.y, 22 + i * 3, 16 + i * 2, 0.3, a0, a0 + 1.3);
        ctx.stroke();
      }
      if (rng.next() < 0.6) arc(ctx, rng, ball.x, ball.y, ball.x + rng.range(-50, 30), ball.y + rng.range(-40, 40), 5, 'rgba(255,240,180,0.9)', 1.2);
      ctx.globalCompositeOperation = 'source-over';
    }

    env.parts.draw(ctx, 1);

    // Impact accents.
    const imp = Math.max(pulse(t, CATCH, 0.22), pulse(t, BREAK, 0.25));
    if (imp > 0) focusLines(ctx, rng, ball.x, ball.y, 50, 700, 90, imp > 0.55 ? '#0a0008' : '#fff', imp, 6);
    if (broke) {
      ctx.globalCompositeOperation = 'lighter';
      speedStreaks(ctx, rng, cam.x - 330, cam.y - 190, 660, 380, 0, 26, '#ffe2c0', 0.4, 140);
      ctx.globalCompositeOperation = 'source-over';
    }

    const [ux, uy] = cam.toUV(ball.x, ball.y);
    fx.bloom = 1.0;
    fx.bloomThresh = 0.6;
    fx.vignette = 0.62;
    fx.ca = 0.002 + imp * 0.01 + heat * 0.003;
    const sc = t - CATCH, sb = t - BREAK;
    if (sc >= 0 && sc < 0.5) fx.shocks.push({ x: ux, y: uy, r: sc * 1.2, s: 0.04 * (1 - sc / 0.5) });
    if (sb >= 0 && sb < 0.6) fx.shocks.push({ x: ux, y: uy, r: sb * 1.5, s: 0.06 * (1 - sb / 0.6) });
    fx.impact = (sc >= 0 && sc < 0.06) || (sb >= 0 && sb < 0.06) ? 1 : 0;
    fx.flash = Math.max(pulse(t, 0, 0.15) * 0.8, pulse(t, BREAK + 0.05, 0.25) * 0.7, ease.inExpo(clamp((t - DUR + 0.1) / 0.1)) * 0.85);
    if (broke) {
      fx.radial = 0.06;
      fx.radialX = ux;
      fx.radialY = uy;
    }
  },
};
