// SHOT 3 — THE FLICK: side view at grass level. No.10 loads, scoops under the ball,
// and launches it straight up. Contact = hit-stop + black/white impact frame +
// shockwave; then the camera whips upward chasing the rising ball. No.10 lands the
// follow-through into a crouch, his aura flares white-gold, and out of the flare the
// hand-drawn jump takes over: crouch (held), push, take-off, and he launches after the
// ball as the camera leaves the pitch.

import type { Shot, Env } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { clamp, ease, lerp, type RGB } from '../../engine/math';
import { PK, drawGlow, glowOf, glowSprite } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { focusLines, speedStreaks } from '../../art/fx';
import { HERO_KIT, POSES, joints, jointWorld, poseAt, renderPuppet, drawPuppet, mixPose, type Pose } from '../../art/puppet';
import { JF, drawJump, heroJump, jumpFrameAt, type Silhouette } from '../../art/heroJump';
import { Trail, drawBall, dustBurst, fireRibbon, grassChunks, pulse, ring, sparks, warp } from './common';

const DUR = 1.35;
const HIT = 0.5;
const GROUND = 300;
const K = 1; // puppet px per unit
const D = 2.0; // draw scale
const HIP_X = 250;
const HIP_Y = GROUND - 40 * K * D;
const BALL_R = 5;

// Hand-drawn jump after the follow-through. Ground frames are pinned on the planted toe,
// airborne frames ride the pelvis from the take-off frame's pelvis upward.
const JS = 2; // world px per sprite px (= the puppet's pixel size K * D)
const LAND = 0.76; // follow-through held while the ball leaves; then the kicking leg comes down into a crouch
const SWAP = 0.85; // puppet -> sprite (the puppet has finished landing by SWAP - 0.01), under an aura flare
const FLARE_IN = 0.03; // the puppet's white-gold silhouette ramps up over this before SWAP...
const FLARE_OUT = 0.07; // ...and the sprite's white-gold tint fades off over this after it
const LIFT = 1.05; // toes leave the turf (the crouch holds ~0.12 s first so it reads as anticipation)
const SOLE = GROUND + 4; // soles sit in the middle of the contact shadow
const CX = HIP_X - 4; // planted toe: keeps him just left of the ball's fire column
const heroSeq: [number, number][] = [
  [SWAP, JF.crouch], [0.97, JF.push], [1.01, JF.takeoff], [LIFT, JF.leap], [1.13, JF.knee], [1.23, JF.float], [1.33, JF.knee],
];
const AURA: Silhouette = { fill: [255, 80, 40], rim: [255, 220, 120], rim2: [255, 140, 60], lx: 1, ly: -1 };
const FLARE: RGB = [255, 236, 200];
const FLARE_SIL = { fill: FLARE, rim: [255, 255, 255] as RGB, rim2: [255, 220, 160] as RGB, lx: 1, ly: -1 };

/** Sprite frame and its pelvis in world space (after SWAP). */
function heroJumpAt(t: number): { fi: number; x: number; y: number; air: number } {
  const jm = heroJump();
  const fi = jumpFrameAt(heroSeq, t);
  if (t < LIFT) {
    const [dx, dy] = jm.pelvisFromContact(fi);
    return { fi, x: CX + dx * JS, y: SOLE + dy * JS, air: 0 };
  }
  // Launch: continue from the take-off pelvis, accelerating upward (the aura carries him).
  const [dx, dy] = jm.pelvisFromContact(JF.takeoff);
  const u = t - LIFT;
  const rise = 1100 * u + 1600 * u * u;
  return { fi, x: CX + dx * JS - 30 * u, y: SOLE + dy * JS - rise, air: rise };
}

const track: [number, Pose][] = [
  [0, POSES.stand],
  [0.36, POSES.flickLoad],
  [HIT, POSES.flickHit],
  [0.75, POSES.flickFollow],
  [LAND, POSES.flickFollow],
  [SWAP - 0.01, POSES.crouch],
  [DUR, POSES.crouch],
];

let spin = new BallSpin();
let bx = 0, by = 0, bvx = 0, bvy = 0;
let launched = false;
let swapped = false;
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
  const land = lerp(0, 34, ease.inOutQuad(clamp((t - LAND) / (SWAP - 0.01 - LAND))));
  return (t < HIT ? lerp(0, 8, ease.inOutQuad(clamp(t / 0.36))) : lerp(8, -4, ease.outCubic(clamp((t - HIT) / 0.3)))) + land;
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
    swapped = false;
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
    // Puppet -> sprite hand-off: an aura ring bursts off the body with the flare.
    if (!swapped && t >= SWAP) {
      swapped = true;
      ring(env, CX, GROUND - 60, 6, 120, 0.3, 0.3, 'aura');
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
    // Shadow (shrinks and fades as he leaves the ground).
    const jump = t >= SWAP ? heroJumpAt(t) : null;
    const sh = jump ? clamp(1 - jump.air / 240) : 1;
    if (sh > 0) {
      ctx.fillStyle = `rgba(0,0,0,${0.4 * sh})`;
      ctx.beginPath();
      // Slides under the sprite's planted foot just after the hand-off (hidden by the flare).
      const shx = lerp(HIP_X + 6, CX - 10, clamp((t - SWAP) / 0.08));
      ctx.ellipse(shx, GROUND + 2, 46 * (0.4 + 0.6 * sh), 7 * (0.5 + 0.5 * sh), 0, 0, Math.PI * 2);
      ctx.fill();
    }

    env.parts.draw(ctx, 0);

    // Ball trail (behind ball).
    if (launched) fireRibbon(ctx, trail.pts, 26, 1, BALL_R * D);

    // Hero (puppet for the flick, then the jump sprite), with a crimson aura glow behind.
    const fl = 0.7 + 0.3 * Math.sin(t * 50);
    if (!jump) {
      const pose = poseNow(t);
      const hipY = HIP_Y + hipDip(t);
      const aura = renderPuppet(HERO_KIT, pose, { k: K, silhouette: AURA });
      ctx.globalCompositeOperation = 'lighter';
      drawPuppet(ctx, aura, HIP_X - 2, hipY - 3, D * 1.04, 0.35 * fl);
      drawPuppet(ctx, aura, HIP_X, hipY, D * 1.015, 0.4);
      ctx.globalCompositeOperation = 'source-over';
      const body = renderPuppet(HERO_KIT, pose, { k: K });
      drawPuppet(ctx, body, HIP_X, hipY, D);
      // Flare in: the body burns white-gold just before the hand-off.
      const fin = clamp((t - (SWAP - FLARE_IN)) / FLARE_IN);
      if (fin > 0) drawPuppet(ctx, renderPuppet(HERO_KIT, pose, { k: K, silhouette: FLARE_SIL }), HIP_X, hipY, D, fin);
    } else {
      const { fi, x, y } = jump;
      const jm = heroJump();
      const aura = jm.silhouette(fi, AURA);
      ctx.globalCompositeOperation = 'lighter';
      drawJump(ctx, aura, fi, x - 2, y - 3, JS * 1.04, { anchor: 'pelvis', alpha: 0.35 * fl });
      drawJump(ctx, aura, fi, x, y, JS * 1.015, { anchor: 'pelvis', alpha: 0.4 });
      ctx.globalCompositeOperation = 'source-over';
      drawJump(ctx, null, fi, x, y, JS, { anchor: 'pelvis' });
      // Flare out: the sprite steps out of the white-gold burn.
      const fout = pulse(t, SWAP, FLARE_OUT);
      if (fout > 0) drawJump(ctx, jm.tinted(fi, FLARE), fi, x, y, JS, { anchor: 'pelvis', alpha: fout });
    }

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
    fx.flash = Math.max(pulse(t, 0, 0.2) * 0.9, pulse(t, HIT + 0.12, 0.15) * 0.5, 0.25 * pulse(t, SWAP, 0.08));
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
