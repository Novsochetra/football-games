// SHOT 3 — THE FLICK: side view at grass level. No.10 (hand-drawn for the whole shot) stands
// over the ball, loads, scoops under it and launches it straight up. Contact = hit-stop +
// black/white impact frame + shockwave; then the camera whips upward chasing the rising ball.
// His kicking leg follows through high, lands into the jump's load and crouch (held), and he
// pushes off and launches after the ball as the camera leaves the pitch.
//
// Frames: stand, K1 load, K2 scoop, K3 follow-through (heroKick), then the jump F1 load,
// F2 crouch, push, take-off, leap... (heroJump). Every ground frame stands on the same far
// boot, so his standing foot never slides.

import type { Shot, Env } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { clamp, ease, lerp } from '../../engine/math';
import { PK, drawGlow, glowOf, glowSprite } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { focusLines, speedStreaks } from '../../art/fx';
import { JF, drawStrip, heroJump, type HeroStrip, type Silhouette } from '../../art/heroJump';
import { KF, KICK_CONTACT_DX, heroKick, kickBallOf } from '../../art/heroKick';
import { Trail, drawBall, dustBurst, fireRibbon, grassChunks, pulse, ring, sparks, warp } from './common';

const DUR = 1.35;
const HIT = 0.5;
const GROUND = 300;
const D = 2.0; // ball draw scale
const BALL_R = 5;

// Ground frames are pinned on the standing boot (their contact anchor), airborne frames ride the
// pelvis from the take-off frame's pelvis upward.
const JS = 2; // world px per sprite px
const LOAD = 0.24; // stand -> K1 load (the opening flash has cleared)
const SCOOP = HIT - 0.03; // K2: the toe slides under the ball one frame before contact, held through the impact frames
const FOLLOW = HIT + 0.14; // K3: the leg flies up in front as the hit-stop ends and the ball starts to climb
const LAND = 0.76; // follow-through held while the ball leaves; then the kicking leg comes down (jump F1 load)...
const CROUCH = 0.85; // ...into the crouch
const LIFT = 1.05; // toes leave the turf (the crouch holds ~0.12 s first so it reads as anticipation)
const SOLE = GROUND + 4; // soles sit in the middle of the contact shadow
const CX = 246; // jump F1/F2 contact (near boot): keeps him just left of the ball's fire column
const KX = CX + KICK_CONTACT_DX * JS; // stand/K frames' contact (far boot): the same standing boot as F1/F2
type Strip = 'kick' | 'jump';
const heroSeq: [number, Strip, number][] = [
  [0, 'kick', KF.stand], [LOAD, 'kick', KF.k1], [SCOOP, 'kick', KF.k2], [FOLLOW, 'kick', KF.k3],
  [LAND, 'jump', JF.load], [CROUCH, 'jump', JF.crouch], [0.97, 'jump', JF.push], [1.01, 'jump', JF.takeoff],
  [LIFT, 'jump', JF.leap], [1.13, 'jump', JF.knee], [1.23, 'jump', JF.float], [1.33, 'jump', JF.knee],
];
const AURA: Silhouette = { fill: [255, 80, 40], rim: [255, 220, 120], rim2: [255, 140, 60], lx: 1, ly: -1 };

/** Frame (strip + index) and its pelvis in world space. */
function heroAt(t: number): { s: HeroStrip; fi: number; x: number; y: number; air: number } {
  let key = heroSeq[0];
  for (const k of heroSeq) if (t >= k[0]) key = k;
  const fi = key[2];
  const s = key[1] === 'kick' ? heroKick() : heroJump();
  if (t < LIFT) {
    const [dx, dy] = s.pelvisFromContact(fi);
    return { s, fi, x: (key[1] === 'kick' ? KX : CX) + dx * JS, y: SOLE + dy * JS, air: 0 };
  }
  // Launch: continue from the take-off pelvis, accelerating upward (the aura carries him).
  const [dx, dy] = heroJump().pelvisFromContact(JF.takeoff);
  const u = t - LIFT;
  const rise = 1100 * u + 1600 * u * u;
  return { s, fi, x: CX + dx * JS - 30 * u, y: SOLE + dy * JS - rise, air: rise };
}

/** The ball's resting centre: on the turf (its bottom on the soles' line) in front of the standing boot,
 *  with the K2 toe (its ball-contact pixel) tucked 1 sprite px under its back edge, so the scoop meets it. */
function ballRest(): [number, number] {
  const c = heroKick().anchorOf(KF.k2, 'contact');
  const [tx, ty] = kickBallOf(KF.k2)!;
  const r = (BALL_R * D) / JS, cy = c[1] - r; // sprite px
  const cx = tx + Math.sqrt(Math.max(0, r * r - (cy - ty) ** 2)) - 1;
  return [KX + (cx - c[0]) * JS, SOLE + (cy - c[1]) * JS];
}

let spin = new BallSpin();
let bx = 0, by = 0, bvx = 0, bvy = 0;
let launched = false;
const trail = new Trail(16);

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
    [bx, by] = ballRest();
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
    // Aura motes around the hero before contact (spawned around his neck: ~30 sprite px above the pelvis).
    if (t < HIT + 0.3 && rng.next() < 0.9) {
      const h = heroAt(t);
      const hx = h.x + 3 * JS, hy = h.y - 30 * JS;
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
    drawGlow(ctx, glowSprite('aura', 0.5), CX + 14, GROUND, 120, 0.45, 1.6, 0.3);
    ctx.globalCompositeOperation = 'source-over';
    // Shadow under his feet (shrinks and fades as he leaves the ground).
    const hero = heroAt(t);
    const sh = clamp(1 - hero.air / 240);
    if (sh > 0) {
      ctx.fillStyle = `rgba(0,0,0,${0.4 * sh})`;
      ctx.beginPath();
      ctx.ellipse(CX - 10, GROUND + 2, 46 * (0.4 + 0.6 * sh), 7 * (0.5 + 0.5 * sh), 0, 0, Math.PI * 2);
      ctx.fill();
    }

    env.parts.draw(ctx, 0);

    // Ball trail (behind ball).
    if (launched) fireRibbon(ctx, trail.pts, 26, 1, BALL_R * D);

    // Hero (the drawn No.10 throughout), with a crimson aura glow behind.
    const fl = 0.7 + 0.3 * Math.sin(t * 50);
    {
      const { s, fi, x, y } = hero;
      const aura = s.silhouette(fi, AURA);
      ctx.globalCompositeOperation = 'lighter';
      drawStrip(ctx, s, aura, fi, x - 2, y - 3, JS * 1.04, { anchor: 'pelvis', alpha: 0.35 * fl });
      drawStrip(ctx, s, aura, fi, x, y, JS * 1.015, { anchor: 'pelvis', alpha: 0.4 });
      ctx.globalCompositeOperation = 'source-over';
      drawStrip(ctx, s, null, fi, x, y, JS, { anchor: 'pelvis' });
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
