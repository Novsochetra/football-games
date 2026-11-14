// SHOT 8 — THE NET: reverse angle from behind the goal. The keeper slams into the
// mesh, then the meteor drives the net toward the lens until strands snap. GOAL!

import type { Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { TAU, clamp, ease, lerp } from '../../engine/math';
import { PK, drawGlow, glowOf, glowSprite } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { focusLines, slamTitle, pixelText } from '../../art/fx';
import { KEEPER_KIT, P, drawPuppet, renderPuppet } from '../../art/puppet';
import { drawBall, pulse, ring, sparks } from './common';

const DUR = 3.3;
const ARRIVE = 0.3; // ball reaches the net
const KEEPER_HIT = 0.16;
const GOAL_T = 0.95;
const COLS = 30, ROWS = 20;
const X0 = 48, X1 = 592, Y0 = 44, Y1 = 330;
const CX = 320, CY = 190, F = 380;

let z = new Float32Array(0);
let vz = new Float32Array(0);
let brokenH = new Uint8Array(0);
let brokenV = new Uint8Array(0);
let spin = new BallSpin();
let ball = { x: 330, y: 200, z: -700 };
let postShake = 0;
let arrived = false;
let keeperIn = false;

const idx = (i: number, j: number) => j * (COLS + 1) + i;
const restX = (i: number) => lerp(X0, X1, i / COLS);
const restY = (j: number) => lerp(Y0, Y1, j / ROWS);
const proj = (x: number, y: number, zz: number): [number, number, number] => {
  const s = F / (F - Math.min(zz, F * 0.82));
  return [CX + (x - CX) * s, CY + (y - CY) * s, s];
};

function ballZ(t: number) {
  if (t < ARRIVE) return lerp(-700, 0, ease.inQuad(t / ARRIVE));
  if (t < 0.78) return 205 * ease.outCubic((t - ARRIVE) / (0.78 - ARRIVE));
  if (t < 1.3) return lerp(205, 120, ease.inOutQuad((t - 0.78) / 0.52));
  return lerp(120, 30, ease.inQuad(clamp((t - 1.3) / 0.6)));
}
function ballY(t: number) {
  if (t < 1.25) return 196;
  return Math.min(300, 196 + 260 * (t - 1.25) * (t - 1.25) + 40 * (t - 1.25));
}

function pushNet(px: number, py: number, pz: number, sigma: number) {
  for (let j = 1; j < ROWS; j++)
    for (let i = 1; i < COLS; i++) {
      const dx = restX(i) - px, dy = restY(j) - py;
      const target = pz * Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
      const k = idx(i, j);
      if (target > z[k]) {
        z[k] = target;
        vz[k] = Math.max(vz[k], 0);
      }
    }
}

export const shotNet: Shot = {
  name: 'Net / Goal',
  dur: DUR,
  seed: 88,
  rate: (t) => (t > ARRIVE && t < ARRIVE + 0.08 ? 0.15 : 1),
  cues: [
    { at: 0, fn: (e) => e.sfx.roar(0.4, 0.4) },
    { at: KEEPER_HIT, fn: (e) => e.sfx.kick(0.8) },
    { at: ARRIVE, fn: (e) => { e.sfx.boom(1.2, 0.6); e.sfx.strain(0.6, 0.35); } },
    { at: 0.66, fn: (e) => { e.sfx.crack(0.9); e.sfx.crack(0.6); } },
    { at: GOAL_T, fn: (e) => { e.sfx.crowd(3.2, 0.6); e.sfx.boom(0.8, 0.7); e.sfx.stinger(); } },
    { at: GOAL_T + 0.15, fn: (e) => e.sfx.whistle() },
  ],
  init(env) {
    const n = (COLS + 1) * (ROWS + 1);
    z = new Float32Array(n);
    vz = new Float32Array(n);
    brokenH = new Uint8Array(n);
    brokenV = new Uint8Array(n);
    spin = new BallSpin();
    postShake = 0;
    arrived = false;
    keeperIn = false;
    ball = { x: 332, y: 196, z: -700 };
    env.cam.set(VW / 2, VH / 2, 1, 0);
  },
  update(env, t, dt) {
    const { rng, parts, cam } = env;
    ball.z = ballZ(t);
    ball.y = ballY(t);
    spin.rotate(0, 1, 0.2, dt * (t < 1.3 ? 60 : 20));

    // Net dynamics (z-only spring mesh, pinned at the frame).
    const sub = 3, h = dt / sub;
    for (let s = 0; s < sub; s++) {
      for (let j = 1; j < ROWS; j++)
        for (let i = 1; i < COLS; i++) {
          const k = idx(i, j);
          let sum = 0, cnt = 0;
          if (!brokenH[idx(i - 1, j)]) { sum += z[idx(i - 1, j)]; cnt++; }
          if (!brokenH[k]) { sum += z[idx(i + 1, j)]; cnt++; }
          if (!brokenV[idx(i, j - 1)]) { sum += z[idx(i, j - 1)]; cnt++; }
          if (!brokenV[k]) { sum += z[idx(i, j + 1)]; cnt++; }
          const avg = cnt ? sum / cnt : 0;
          const a = (avg - z[k]) * 1400 - vz[k] * 5 - z[k] * 6;
          vz[k] += a * h;
        }
      for (let k = 0; k < z.length; k++) z[k] += vz[k] * h;
    }
    // Keeper smashes in first (left side), then the ball (center).
    if (t > KEEPER_HIT) pushNet(222, 236, 90 * clamp((t - KEEPER_HIT) / 0.15) * clamp(1 - (t - 0.9) / 1.5), 46);
    if (ball.z > 0) pushNet(ball.x, ball.y, ball.z, 34);

    // Snap strands around the ball at peak stretch.
    if (t > 0.62 && t < 0.8) {
      for (let n = 0; n < 3; n++) {
        const i = Math.round((ball.x - X0) / ((X1 - X0) / COLS) + rng.range(-2, 2));
        const j = Math.round((ball.y - Y0) / ((Y1 - Y0) / ROWS) + rng.range(-2, 2));
        if (i < 1 || j < 1 || i >= COLS || j >= ROWS) continue;
        const k = idx(i, j);
        if (rng.next() < 0.5) brokenH[k] = 1;
        else brokenV[k] = 1;
        const [sx, sy] = proj(restX(i), restY(j), z[k]);
        sparks(env, sx, sy, 4, 300, TAU, 0, 'white');
      }
    }

    if (t >= ARRIVE && !arrived) {
      arrived = true;
      cam.hit(0.9);
      postShake = 1;
      const [sx, sy] = proj(ball.x, ball.y, 0);
      ring(env, sx, sy, 10, 260, 0.6, 1, 'white');
      ring(env, sx, sy, 8, 180, 0.5, 1, 'gold');
      sparks(env, sx, sy, 60, 900, TAU, 0, 'ember');
    }
    if (t >= KEEPER_HIT && !keeperIn) {
      keeperIn = true;
      cam.hit(0.4);
      postShake = Math.max(postShake, 0.5);
    }
    postShake = Math.max(0, postShake - dt * 0.9);

    // Fire & smoke from the ball while it grinds into the net.
    if (t > ARRIVE) {
      const [sx, sy, s] = proj(ball.x, ball.y, ball.z);
      const heat = clamp(1 - (t - 1.0) / 1.2);
      if (rng.next() < 0.9 * heat + 0.2) {
        parts.spawn({
          kind: PK.Smoke, x: sx + rng.range(-10, 10) * s, y: sy - 12 * s + rng.range(-6, 4) * s, vx: rng.range(-50, 50), vy: rng.range(-130, -60),
          max: rng.range(0.7, 1.4), s0: 8 * s, s1: 34 * s, ramp: 'smoke', r0: 0, r1: 1, a0: 0.45, a1: 0, add: false, layer: 0,
        });
      }
      if (rng.next() < heat) {
        parts.spawn({
          kind: PK.Glow, x: sx + rng.range(-8, 8) * s, y: sy + rng.range(-8, 8) * s, vx: rng.range(-60, 60), vy: rng.range(-140, -40),
          max: rng.range(0.25, 0.5), s0: rng.range(8, 16) * s, s1: 2, ramp: 'fire', r0: 0.1, r1: 1, a0: 0.9, a1: 0, layer: 1,
        });
      }
    }

    // GOAL: confetti + crowd flashes.
    if (t > GOAL_T) {
      for (let n = 0; n < 4; n++) {
        const left = rng.next() < 0.5;
        parts.spawn({
          kind: PK.Confetti, x: left ? -10 : VW + 10, y: rng.range(-20, 80), vx: (left ? 1 : -1) * rng.range(120, 360), vy: rng.range(-120, 60),
          ay: 160, drag: 1.2, vrot: rng.range(-8, 8), max: rng.range(2, 3.2), s0: rng.range(4, 7), s1: 4, a0: 1, a1: 1, add: false,
          color: rng.pick(['#ff3b3b', '#ffd34a', '#3f6fff', '#ffffff', '#ff8a3a']), k: rng.next(), layer: 1,
        });
      }
    }

    const pushIn = ease.outCubic(clamp((t - ARRIVE) / 0.5)) * (1 - ease.inOutQuad(clamp((t - GOAL_T) / 0.5)));
    cam.set(VW / 2 + pushIn * 6, VH / 2 + pushIn * 6, 1 + pushIn * 0.1, Math.sin(t * 1.3) * 0.01);
    cam.shakeAmp = 16;
  },
  render(env, t) {
    const { ctx, fx, cam } = env;
    const st = env.art.stadium;
    const rng = env.frng();
    env.world();

    // Far end of the stadium, seen through the goal.
    const sky = ctx.createLinearGradient(0, -60, 0, 130);
    sky.addColorStop(0, '#05030d');
    sky.addColorStop(1, '#22123a');
    ctx.fillStyle = sky;
    ctx.fillRect(-100, -100, VW + 200, 240);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(st.crowd, 200, 0, 700, 110, -60, 40, 760, 120);
    // Pitch stripes receding.
    for (let b = 0; b < 12; b++) {
      const y0 = 158 + b * b * 1.6 + b * 4, y1 = 158 + (b + 1) * (b + 1) * 1.6 + (b + 1) * 4;
      ctx.fillStyle = b & 1 ? '#25732f' : '#2b8236';
      ctx.fillRect(-100, y0, VW + 200, y1 - y0 + 1);
    }
    ctx.fillStyle = 'rgba(240,245,255,0.8)';
    ctx.fillRect(-100, 300, VW + 200, 3); // goal line
    ctx.globalCompositeOperation = 'lighter';
    for (const x of [30, 610]) {
      drawGlow(ctx, glowOf([255, 245, 220]), x, 10, 120, 0.4);
      drawGlow(ctx, glowOf([255, 255, 255]), x, 10, 22, 0.9);
    }
    // Camera flashes after the goal.
    if (t > GOAL_T) {
      for (const f of st.flashes) {
        const ph = (t * 3 + f.t) % 1.2;
        if (ph > 0.08) continue;
        drawGlow(ctx, glowSprite('white', 0), ((f.x * 0.45) % 760) - 60, 40 + f.y * 1.1, 7, 1 - ph / 0.08);
      }
    }
    ctx.globalCompositeOperation = 'source-over';

    // Goal mouth frame (further away), shaking after impact.
    const sh = Math.sin(t * 70) * postShake * 4;
    ctx.fillStyle = '#180411';
    ctx.fillRect(128 + sh, 86, 14, 216);
    ctx.fillRect(498 - sh, 86, 14, 216);
    ctx.fillRect(128 + sh, 82, 384, 14);
    ctx.fillStyle = '#f4f6ff';
    ctx.fillRect(130 + sh, 88, 10, 214);
    ctx.fillRect(500 - sh, 88, 10, 214);
    ctx.fillRect(130 + sh, 84, 380, 10);
    // Side-net hints.
    ctx.strokeStyle = 'rgba(220,226,255,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let k = 0; k <= 6; k++) {
      ctx.moveTo(140 - k * 13, 94 - k * 7);
      ctx.lineTo(140 - k * 13, 302 + k * 4);
      ctx.moveTo(500 + k * 13, 94 - k * 7);
      ctx.lineTo(500 + k * 13, 302 + k * 4);
    }
    ctx.stroke();

    // Keeper sprawled into the net (seen through it), lit red by the ball.
    if (t > KEEPER_HIT - 0.12) {
      const kz = lerp(-300, 90, clamp((t - KEEPER_HIT + 0.12) / 0.12)) - Math.max(0, t - 0.9) * 40;
      const [kx, ky, ks] = proj(222, 236 + Math.max(0, t - 0.6) * 30, Math.min(kz, 80));
      const spread = P({ torso: -0.1, head: 0.35, thighN: 0.55, kneeN: 0.35, thighF: -0.5, kneeF: 0.3, armN: 2.5, elbowN: 0.15, armF: -2.5, elbowF: 0.2, spin: -0.35 });
      const kr = renderPuppet(KEEPER_KIT, spread, {
        k: 1, facing: 1, silhouette: { fill: [20, 12, 26], rim: [255, 120, 70], rim2: [140, 50, 50], lx: 1, ly: 0 },
      });
      drawPuppet(ctx, kr, kx, ky, 1.0 * ks);
    }

    // Ball behind the net plane when z < 0 (approaching).
    const [bsx, bsy, bs] = proj(ball.x, ball.y, ball.z);
    const bR = 14 * bs;
    const heat = clamp(1 - (t - 1.0) / 1.2);
    const drawTheBall = () => {
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowSprite('fire', 0.35), bsx, bsy, bR * 2.6, 0.45 * heat);
      ctx.globalCompositeOperation = 'source-over';
      drawBall(env, spin, bsx, bsy, Math.max(3, Math.round(7 * Math.min(bs, 2.6))), 2, heat, 1.2 * heat);
    };
    if (ball.z <= 0) drawTheBall();

    // Net mesh.
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = 'rgba(232,236,255,0.82)';
    ctx.beginPath();
    for (let j = 0; j <= ROWS; j++)
      for (let i = 0; i <= COLS; i++) {
        const k = idx(i, j);
        const [x, y] = proj(restX(i), restY(j), z[k]);
        if (i < COLS && !brokenH[k]) {
          const [x2, y2] = proj(restX(i + 1), restY(j), z[idx(i + 1, j)]);
          ctx.moveTo(x, y);
          ctx.lineTo(x2, y2);
        }
        if (j < ROWS && !brokenV[k]) {
          const [x2, y2] = proj(restX(i), restY(j + 1), z[idx(i, j + 1)]);
          ctx.moveTo(x, y);
          ctx.lineTo(x2, y2);
        }
      }
    ctx.stroke();
    // Ember glow on the strands near the ball.
    if (ball.z > 0 && heat > 0) {
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowSprite('aura', 0.5), bsx, bsy, bR * 2.2, 0.3 * heat);
      ctx.globalCompositeOperation = 'source-over';
    }
    // Back stanchions.
    ctx.fillStyle = '#2a2640';
    ctx.fillRect(X0 - 8, Y0 - 8, 10, Y1 - Y0 + 40);
    ctx.fillRect(X1 - 2, Y0 - 8, 10, Y1 - Y0 + 40);
    ctx.fillRect(X0 - 8, Y0 - 8, X1 - X0 + 16, 8);

    env.parts.draw(ctx, 0);
    if (ball.z > 0) drawTheBall();
    env.parts.draw(ctx, 1);

    // Impact focus lines.
    const imp = pulse(t, ARRIVE, 0.25);
    if (imp > 0) focusLines(ctx, rng, bsx, bsy, 60, 700, 90, imp > 0.6 ? '#0a0008' : '#fff', imp, 6);

    // GOAL!!
    env.screen();
    const gt = t - GOAL_T;
    if (gt > 0) {
      const bounce = 1 + pulse(gt, 0.35, 0.3) * 0.04;
      ctx.save();
      ctx.translate(VW / 2, 176);
      ctx.scale(bounce, bounce);
      slamTitle(ctx, 'GOAL!', 0, 0, 132, gt, { stagger: 0.07, outer: '#180411', stroke: '#c0141e' });
      ctx.restore();
      const card = ease.outCubic(clamp((gt - 0.75) / 0.35));
      if (card > 0) {
        const y = lerp(VH + 40, 286, card);
        ctx.fillStyle = 'rgba(10,6,20,0.88)';
        ctx.fillRect(0, y - 6, VW, 62);
        ctx.fillStyle = '#c8202a';
        ctx.fillRect(0, y - 6, VW, 3);
        ctx.fillStyle = '#fcb94c';
        ctx.fillRect(0, y + 53, VW, 3);
        slamTitle(ctx, 'ZENITH METEOR', 40, y + 47, 30, gt - 0.75, { stagger: 0.02, outer: '#180411', stroke: '#c0141e', align: 'left' });
        pixelText(ctx, 'No.10  ·  SPECIAL SHOT', 40, y + 1, 10, '#fcb94c');
        pixelText(ctx, 'CAM 1 - 0 RIV', VW - 40, y + 20, 14, '#ffffff', 'right');
      }
    }

    // Post.
    const [ux, uy] = cam.toUV(bsx, bsy);
    fx.bloom = 1.0;
    fx.bloomThresh = 0.62;
    fx.vignette = 0.55;
    fx.ca = 0.002 + imp * 0.01;
    const sa = t - ARRIVE;
    if (sa > 0 && sa < 0.7) fx.shocks.push({ x: ux, y: uy, r: sa * 1.3, s: 0.06 * (1 - sa / 0.7) });
    const sg = t - GOAL_T;
    if (sg > 0 && sg < 0.6) fx.shocks.push({ x: 0.5, y: 0.48, r: sg * 1.6, s: 0.035 * (1 - sg / 0.6) });
    fx.impact = sa >= 0 && sa < 0.07 ? 1 : 0;
    fx.flash = Math.max(pulse(t, 0, 0.15) * 0.8, pulse(t, GOAL_T, 0.3) * 0.75, ease.inQuad(clamp((t - DUR + 0.35) / 0.35)) * 1.0);
    fx.flashColor = t > DUR - 0.35 ? [8, 4, 14] : [255, 255, 255];
  },
};
