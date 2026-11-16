// GALE HAMMER v2 · shot 7 · "Dead stop" (1.5 s, seed 317): the false defeat. SPEC.md §6 shot 7.
//
// Story job: the keeper is strong: he WINS, for a moment. Kids shout "nooo!", then "LOOK!", because they can see what
// he cannot: the thunder is coming. GALE's own keeper beat (§1.2): one double-fist punch, a dead ball, a grin, and a
// reversal from somewhere else. No grinding, no smoke, no burn, no near-miss, no lash.
//
// 7a · the punch (0.00-0.42), a side close-up at his chest height (camera south, looking north):
//   0.00  a match on action from shot 6's fists-at-the-lens: his double-fist punch is already thrust out and the ball
//         rockets the last ~66 px into it inside its battered vapour cone (contact 3 frames in, no second wind-up).
//   0.06  CONTACT: a hit-stop (rate 0.04 for 0.10 s): the ball squashed flat on his fists, the cone crumpling into a
//         vapour smoke ring blown out round him (edge-on) with vapour petals splayed along his fists, a contact glint,
//         a shock ring, 50 dew sparks sprayed back toward the shooter, ice focus lines; punch +0.10, cam.hit(0.7),
//         cam.shove(+12, 0). The hit is lit, not the frame: no full-frame flash, a navy pocket and an ice/cyan glow round
//         the contact (blacks hold), the radial smear on the 2 contact frames only so the held punch stays sharp.
//         Then the cone wraps round him as a vapour shroud (60 PK.Mist) streaming past his head and body, and his
//         boots plough back ~0.5 m (pressed skid streaks, never torn turf; dust and blades).
//   0.24  THE BALL STOPS DEAD 25 cm in front of his fists: panels still, a cold bright ball under a key light; the
//         cone fades out over the stop while 120 drops condense out of its bell (0.18-0.24); his fists open a little;
//         trauma 0, dead still; SILENCE (gap 3). A single drop falls off the ball and glints (0.32, the glass ring).
//         Push 1.20 -> 1.30.
// 7b · the grin (0.42-1.50), hard cut (no flash) to a two-shot at his head height: the dead ball hangs left-centre
//   (62 px), the keeper's bust on the right (KeeperFront ×2) grins at us; behind them the pitch recedes west to the
//   far stand: the pressed wake runs back to the horizon past the three air craters and the fallen wall.
//   From the first frame of the grin the THUNDER WALL is on screen as a towering band on the far-left horizon, behind
//   the fallen wall: three large-radius pushShock rings centred off-frame left (UV -2.0, 0.55) bend the stadium, an
//   ice edge line rides ring A (with only a short shimmer above the curtain), and behind it a storm curtain of dust
//   and dew (80 -> 250 px) whose foot comes from the horizon toward the lens: a torn crest lit by the floodlights,
//   an overhanging head breaking forward past the pressure line like a wave about to crash on the ball, a churning
//   face 10-30 px behind the line, dark at the foot. Ahead of it the turf peels pale, blades and dew fly, the stand
//   flags whip in sequence (windWave locked to the edge), and its foot rolls the fallen defenders over again as it
//   reaches their depth. The edge ACCELERATES into the cut (about 66 -> 260 px/s). He never notices.
//   0.70  KF3b: the first breath of the oncoming air lifts his hair; 0.95-1.15 KF3/KF3b flutter, the grin freezes and
//   the dew on the hanging ball shivers and blows off it to the right; 1.15 KF4: his eyes snap to the wall: terror
//   (1 px tremor).
//   0.95 push 1.00 -> 1.06 (trauma 0.05 -> 0.25), 1.30-1.50 push 1.06 -> 1.12 (trauma 0.45) and the frame edges ripple.
//   The hard cut lands on the frame the ice edge touches the ball (1.50).
//
// Everything drawn is a pure function of the shot clock (camera, poses, the wall, decals); particles spawn only in
// update() on env.rng behind one-shot flags (and one spawn counter). No counted full-frame event in this shot (§4.1: no
// flash at all, no impact, no iso, no fullFrame). Never the banned word (d-r-i-v-e): gale, strike, hammer, shot, push.

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { TAU, clamp, ease, lerp, type RGB } from '../../engine/math';
import { PK, drawGlow, glowOf, softSprite } from '../../engine/particles';
import { BallSpin, pal3 } from '../../engine/pixel';
import { FIELD, drawFieldBackdrop } from '../../art/stadium';
import { KEEPER_KIT, POSES, RIVAL_KIT, RIVAL_KIT_B, RIVAL_KIT_C, joints, jointWorld, type Kit, type Pose } from '../../art/puppet';
import { drawAnim, type StudioAnim } from '../../art/studioAnim';
import { drawBall, keys, punch, pushShock, type KeyRow, type PuppetSil } from '../kit';
import {
  HEX, MUFFLE, PAL, PUPPETS, RATE, SHOTS, STAMPS, dropletCurtain, galeStorm, keeperFront, stormDarken, vacuumGrade, warmGale,
  type KeeperFrontKey,
} from './common';
import { airCrater, ringEdgeX, vaporCone, type ThunderRing } from './air';

const META = SHOTS[6];
const DUR = META.dur;

/** Beats (shot-local t on the unwarped clock). */
const T = {
  hit: 0.06,
  stopEnd: 0.16,
  dead: 0.24,
  drop: 0.28,
  ring: 0.32,
  cut: 0.42,
  kf3b: 0.7,
  thunder: 0.8,
  alt: 0.95,
  kf4: 1.15,
  edge: 1.3,
} as const;

/** Frame-stable hash in [0, 1). */
const hash = (n: number) => {
  const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
};
const rgba = (c: RGB, a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${clamp(a)})`;

/**
 * Simulation time (the integral of RATE[7]): real time before the hit, a 0.04 crawl through the hit-stop, the 0.3 -> 1
 * ramp, then real time. Every hit-stopped motion (the squash, the slide, the separation) is drawn from it.
 */
function simAt(t: number): number {
  if (t < T.hit) return t;
  if (t < T.stopEnd) return T.hit + 0.04 * (t - T.hit);
  const s0 = T.hit + 0.04 * (T.stopEnd - T.hit);
  if (t < T.dead) {
    const u = (t - T.stopEnd) / (T.dead - T.stopEnd);
    return s0 + (T.dead - T.stopEnd) * (0.3 * u + 0.35 * u * u);
  }
  return s0 + (T.dead - T.stopEnd) * 0.65 + (t - T.dead);
}
const SIM_HIT = simAt(T.hit), SIM_DEAD = simAt(T.dead);
/** 0..1 from the contact to the dead stop on the simulation clock. */
const impactU = (t: number) => clamp((simAt(t) - SIM_HIT) / (SIM_DEAD - SIM_HIT));

// ================================================================ 7a · the punch (world = base frame at zoom 1)

/** Puppet scale (a 1.9 m keeper is ~230 world px) and facing (west). */
const KA = 3;
const FACE = -1 as const;
const GROUND_A = 352;
/** The keeper's hip x before the slide; he ploughs back 0.6 m (~72 world px at this scale). */
const KX0 = 512;
const SLIDE = 70;

/**
 * 7a poses (each a cached PuppetCache entry): the punch, the recoil under the ball, fists opening. A match on action
 * across the hard cut: shot 6 ends with both fists thrust at the lens, so 7a opens on the extended fists (no wind-up).
 */
const P_PUNCH: Pose = POSES.gkPunch;
const P_RECOIL: Pose = { ...POSES.gkPunch, torso: POSES.gkPunch.torso - 0.14, head: POSES.gkPunch.head + 0.12, armN: 1.5, elbowN: 0.42, armF: 1.44, elbowF: 0.5, kneeN: 0.95, kneeF: 0.85 };
const P_OPEN: Pose = { ...POSES.gkPunch, torso: POSES.gkPunch.torso - 0.06, armN: 1.42, elbowN: 0.2, armF: 1.3, elbowF: 0.26 };
function poseA(t: number): [string, Pose] {
  if (t < T.hit) return ['k7-punch', P_PUNCH];
  if (t < T.dead) return ['k7-recoil', P_RECOIL];
  return ['k7-open', P_OPEN];
}
function footDrop(p: Pose) {
  const j = joints(p);
  return Math.max(j.toeN[1], j.toeF[1], j.ankleN[1]) + 2;
}
const keeperX = (t: number) => KX0 + (t < T.hit ? 0 : SLIDE * ease.outCubic(impactU(t)));
function hipA(t: number): [number, number] {
  const [, p] = poseA(t);
  return [keeperX(t), GROUND_A - footDrop(p) * KA];
}
/** The fists (the two hands' midpoint) at t. */
function fistsA(t: number): [number, number] {
  const [, p] = poseA(t);
  const [hx, hy] = hipA(t);
  const j = joints(p);
  const a = jointWorld(j.handN, hx, hy, KA, 1, FACE), b = jointWorld(j.handF, hx, hy, KA, 1, FACE);
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}
/** The hero ball (2x scale, ~56 world px across). */
const BR_A = 8, BD_A = 4, BRA = BR_A * BD_A;
/** The ball 25 cm in front of his fists after the stop (~30 world px gap). */
const GAP = 34;
/** Ball state at t: centre, squash (flattened on its +x face), glow, heat. */
function ballA(t: number) {
  const [fx0, fy0] = fistsA(Math.max(t, T.hit));
  if (t < T.hit) {
    const [cx, cy] = fistsA(T.hit);
    // ~66 px out on frame 0: shot 6 already had it on his fists, so contact lands 3 frames in.
    const x = cx - BRA - 2 - 1100 * (T.hit - t);
    return { x, y: cy + 3, sx: 1.08, sy: 0.94, dent: 0, glow: 0.85, heat: 0.85, vx: 1100 };
  }
  const u = impactU(t);
  // Squashed flat on the fists through the hit-stop, then springing round as it separates and stops.
  const sq = t < T.stopEnd ? 1 : 1 - ease.outCubic(clamp((t - T.stopEnd) / 0.06));
  const sx = 1 - 0.32 * sq, sy = 1 + 0.2 * sq;
  const gap = GAP * ease.outQuad(clamp((u - 0.15) / 0.85));
  const x = fx0 - BRA * sx - 2 - gap;
  const dead = t >= T.dead;
  // Dead, but still the brightest thing in the frame: a cold ice ball (glow/heat settle at 0.4, never murky).
  const glow = dead ? lerp(0.5, 0.4, clamp((t - T.dead) / 0.18)) : lerp(0.75, 0.5, u);
  const heat = dead ? lerp(0.5, 0.4, clamp((t - T.dead) / 0.18)) : lerp(1, 0.6, u);
  return { x, y: fy0 + 3, sx, sy, dent: 0.3 * sq, glow, heat, vx: 0 };
}

/** 7a camera: zoom 1.20 on his fists, punch +0.10 on contact, dead still from 0.24, push 1.20 -> 1.30 by 0.42. */
/** Film fix H2: tighter (1.35 -> 1.45) and framed low on his fists, so his head is cropped out of the top of frame. */
const ZOOM_A: KeyRow[] = [[0, 1.35], [T.dead, 1.35], [T.cut, 1.45, 'inOutQuad']];
function placeCamA(env: Env, t: number) {
  const cam = env.cam;
  const [fx0, fy0] = fistsA(T.hit);
  const follow = t < T.hit ? 0 : SLIDE * 0.45 * ease.outCubic(impactU(t));
  cam.x = fx0 - 28 + follow;
  // Framed low on his fists (film fix H2): the top of his head leaves the frame and the ball rides the upper third.
  cam.y = fy0 + 90;
  cam.zoom = keys(ZOOM_A, t) + punch(t, T.hit, 0.1, 0.02, 0.22);
  cam.rot = 0;
}

/**
 * The 7a keeper wears the KeeperFront bust's hair (black, spiky) so he is the same man across the hard cut into 7b.
 * PuppetCache keys on the hair colour, so the other shots' KEEPER_KIT puppets are untouched.
 */
const KEEPER_KIT7: Kit = { ...KEEPER_KIT, hair: pal3([70, 74, 92], [40, 42, 56], [18, 18, 26]), hairStyle: 'spiky' };

/** The keeper's storm lighting: navy fill, an ice rim on the side facing the ball (west). */
const KEEPER_SIL: PuppetSil = { fill: [12, 18, 44], rim: [238, 251, 255], rim2: [70, 216, 255], lx: -0.9, ly: -0.4 };

/** Screen offset of the shake + shove at the camera centre. */
function shakeOff(env: Env): [number, number] {
  const [u, v] = env.cam.toUV(env.cam.x, env.cam.y);
  return [u * VW - VW / 2, v * VH - VH / 2];
}

/** The stadium behind him (the north stands), seen at his chest height, telephoto, storm night. */
function drawStandsA(env: Env, t: number) {
  const ctx = env.ctx;
  const cam = env.cam;
  const [ox, oy] = shakeOff(env);
  const zb = 1.45 * Math.pow(cam.zoom / 1.2, 0.35);
  const camXb = 1150 + (cam.x - 420) * 0.15;
  // The horizon (the far touchline) sits at his chest height.
  const hy = VH / 2 + (GROUND_A - 128 - cam.y) * cam.zoom * 0.55 + oy;
  env.screen();
  ctx.save();
  ctx.translate(VW / 2 + ox * 0.6, hy);
  ctx.scale(zb, zb);
  ctx.translate(-camXb, -FIELD.horizon);
  const calm = t >= T.dead;
  drawFieldBackdrop(ctx, env.art.stadium, camXb, FIELD.horizon - 200, 9 + t * (calm ? 0.2 : 1), { storm: 1, wind: calm ? 0.05 : 0.6, windDir: 1 });
  ctx.restore();
  // Crush the stands toward navy; the lamps come back on top.
  stormDarken(ctx, 0.55);
  ctx.globalCompositeOperation = 'lighter';
  for (const [x, y, s] of [[96, 18, 1], [560, -6, 1.2]] as const) {
    const px = x + ox * 0.6, py = y + oy * 0.6 + (hy - 160) * 0.3;
    drawGlow(ctx, glowOf([70, 110, 210]), px, py, 220 * s, 0.18);
    drawGlow(ctx, glowOf([170, 215, 255]), px, py, 70 * s, 0.3);
    drawGlow(ctx, glowOf([238, 251, 255]), px, py, 16 * s, 0.85);
  }
  ctx.globalCompositeOperation = 'source-over';
  return hy;
}

/** The turf at his feet (world): dark, the six-yard line receding, pressed skid streaks behind his boots. */
function drawTurfA(env: Env, t: number, hy: number) {
  const ctx = env.ctx;
  const cam = env.cam;
  env.screen();
  // Ground plane from the horizon down (screen space so it fills under any zoom).
  const [ox] = shakeOff(env);
  const g = ctx.createLinearGradient(0, hy, 0, VH);
  g.addColorStop(0, '#0d2420');
  g.addColorStop(0.35, '#143a28');
  g.addColorStop(1, '#1d5a30');
  ctx.fillStyle = g;
  ctx.fillRect(0, hy, VW, VH - hy + 2);
  // Mowing stripes receding to the vanishing point (the camera looks north across the pitch).
  const vpx = VW / 2 + ox * 0.6;
  ctx.fillStyle = 'rgba(255,255,255,0.035)';
  for (let i = -6; i <= 6; i += 2) {
    const x0 = vpx + i * 260, x1 = vpx + (i + 1) * 260;
    ctx.beginPath();
    ctx.moveTo(vpx + i * 4, hy);
    ctx.lineTo(vpx + (i + 1) * 4, hy);
    ctx.lineTo(x1, VH);
    ctx.lineTo(x0, VH);
    ctx.closePath();
    ctx.fill();
  }
  // The six-yard line (3.3 m in front of him, toward the shooter) and the goal line (2.2 m behind him) recede north.
  env.world();
  const lineAt = (wx: number, a: number) => {
    // A line on the turf from the near edge of frame to the horizon, converging on the camera centre.
    const nearY = GROUND_A + 40, farY = GROUND_A - 34;
    const x0 = wx, x1 = cam.x + (wx - cam.x) * 0.2;
    ctx.fillStyle = `rgba(226,236,255,${a})`;
    ctx.beginPath();
    ctx.moveTo(x0 - 4, nearY);
    ctx.lineTo(x0 + 4, nearY);
    ctx.lineTo(x1 + 1, farY);
    ctx.lineTo(x1 - 1, farY);
    ctx.closePath();
    ctx.fill();
  };
  lineAt(KX0 - 230, 0.32);
  // The skid: two pressed streaks (combed pale, never torn) from where his boots stood to where they are now.
  if (t >= T.hit) {
    const d = keeperX(t) - KX0;
    if (d > 1) {
      const [, p] = poseA(t);
      const j = joints(p);
      for (const [toe, dy] of [[j.toeN, 2], [j.toeF, -3]] as const) {
        const tx = KX0 + toe[0] * KA * FACE;
        ctx.fillStyle = 'rgba(155,224,138,0.5)';
        ctx.fillRect(Math.round(tx - 8), GROUND_A + dy - 2, Math.round(d + 12), 5);
        ctx.fillStyle = 'rgba(214,248,200,0.45)';
        ctx.fillRect(Math.round(tx - 8), GROUND_A + dy - 2, Math.round(d + 12), 1);
        ctx.fillStyle = 'rgba(20,60,30,0.85)';
        ctx.fillRect(Math.round(tx - 4), GROUND_A + dy, Math.round(d + 4), 2);
      }
    }
  }
  // Contact shadow under him.
  const [hx] = hipA(t);
  ctx.fillStyle = 'rgba(4,8,22,0.55)';
  ctx.beginPath();
  ctx.ellipse(hx, GROUND_A + 1, 62, 7, 0, 0, TAU);
  ctx.fill();
}

/** The keeper (puppet, storm-lit with an ice rim on the ball side; the impact lights him up). */
function drawKeeperA(env: Env, t: number) {
  const ctx = env.ctx;
  env.world();
  const [name, p] = poseA(t);
  const [hx, hy] = hipA(t);
  // Film fix H2: a navy storm silhouette with the ice rim of KEEPER_SIL (the impact lights him a little, then he sinks
  // back into the dark): his face is first seen on the studio bust in 7b.
  const lit = t < T.hit ? 0.05 : t < T.dead ? lerp(0.35, 0.05, impactU(t)) : 0.05;
  PUPPETS.draw(ctx, name, KEEPER_KIT7, p, KA, FACE, hx, hy, 1, lit, KEEPER_SIL);
}

/** The ball's vapour cone: battered on arrival, buckling on the fists (its tail still rushing in), then gone. */
function drawConeA(env: Env, t: number) {
  const ctx = env.ctx;
  env.world();
  const b = ballA(t);
  if (t < T.hit) {
    vaporCone(ctx, b.x, b.y, 0, 132, 400, t, 0.95, { ballR: BRA });
    return;
  }
  if (t >= T.dead) return;
  // The cone buckles: its bell bunches up against the fists, fraying and thinning to nothing by the dead stop.
  const u = impactU(t);
  // Fades on real time to the dead stop, so the dew (spawned 0.18-0.24 from its bell) condenses out of it as it dies.
  const a = 0.75 * (1 - ease.inQuad(clamp((t - T.hit) / (T.dead - T.hit))));
  vaporCone(ctx, b.x - 6 * u, b.y, 0, lerp(132, 168, ease.outQuad(u)), lerp(400, 330, u), T.hit + (t - T.hit) * 0.3, a, { ballR: BRA * 1.15 });
}

/**
 * The crush: the cone's head slammed into his fists becomes an edge-on smoke ring (a vapour torus seen from the side)
 * that blows outward round him, plus short vapour spikes splaying up and down off the contact and curling back west.
 */
function drawCrushA(env: Env, t: number) {
  // Fix round 2: a readable ring that bursts outward on the hit and is gone by the dead stop (never a tall pillar of
  // puffs crossing the ball-glove gap while THE BALL STOPS DEAD); the PK.Mist shroud carries the wrap.
  if (t < T.hit || t > T.dead + 0.02) return;
  const ctx = env.ctx;
  env.world();
  const [fx0, fy0] = fistsA(t);
  const cx = fx0 - 8;
  const u = impactU(t);
  const r = lerp(40, 120, ease.outCubic(u)) + Math.max(0, t - T.stopEnd) * 260;
  const a = t < T.stopEnd ? 1 : 1 - clamp((t - T.stopEnd) / 0.1);
  // The edge-on torus: a vertical ellipse of puffs (navy halo, then vapour) with an ice stroke on its lit side.
  ctx.save();
  ctx.translate(cx, fy0);
  ctx.scale(0.45 + 0.2 * u, 1);
  ctx.globalAlpha = 0.5 * a;
  ctx.strokeStyle = HEX.navy;
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.stroke();
  const n = 40;
  for (let i = 0; i < n; i++) {
    const th = (i / n) * TAU + hash(i) * 0.15;
    if (hash(i * 13.1) > a + 0.25) continue;
    const s = r * (0.15 + 0.07 * hash(i * 7.3)) * (1 + u * 0.4);
    ctx.globalAlpha = clamp(a * 0.5);
    ctx.drawImage(softSprite('vapor', 0.05 + 0.2 * hash(i * 2.1)), Math.cos(th) * r - s, Math.sin(th) * r - s, s * 2, s * 2);
  }
  ctx.restore();
  ctx.globalCompositeOperation = 'source-over';
  // Vapour petals splayed up and down along his fists, bending back toward the shooter (soft puffs, no lines).
  const sp = t < T.stopEnd ? 0.3 + 0.7 * clamp((t - T.hit) / 0.1) : 1;
  for (let i = 0; i < 10; i++) {
    const side = i % 2 ? 1 : -1;
    const ang = side * (0.5 + hash(i * 3.9) * 0.9);
    const len = (50 + hash(i * 1.7) * 90) * sp * (0.6 + u * 0.7);
    for (let k = 1; k <= 7; k++) {
      const f = k / 7;
      const px = cx - len * f * f * (0.3 + 0.4 * hash(i * 5.5)) * (0.4 + u);
      const py = fy0 + Math.sin(ang) * len * f;
      const ps = (7 + 11 * f) * (1 + u * 0.5);
      ctx.globalAlpha = clamp(a * 0.3 * (1 - f * 0.6));
      ctx.drawImage(softSprite('vapor', 0.05 + 0.25 * f), px - ps, py - ps, ps * 2, ps * 2);
    }
  }
  ctx.globalAlpha = 1;
}

/** The hero ball in 7a (mirrored so its contact face is on the fists' side). */
function drawBallA(env: Env, t: number, spin: BallSpin) {
  const ctx = env.ctx;
  env.world();
  const b = ballA(t);
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.scale(-1, 1);
  drawBall(env, spin, 0, 0, BR_A, BD_A, b.heat, b.glow, 'cobalt', { sx: b.sx, sy: b.sy, dent: b.dent }, { storm: true });
  ctx.restore();
  // From the dead stop: a cold key light on its upper face, so the hanging ball stays the hot subject in the silence.
  if (t >= T.dead) {
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.ice), b.x - BRA * 0.4, b.y - BRA * 0.45, 30, 0.65 * clamp((t - T.dead) / 0.06));
    ctx.globalCompositeOperation = 'source-over';
  }
  // The single drop: it swells under the dead ball, falls, and glints as the glass ring sounds.
  if (t >= T.dead && t < T.cut) {
    const k = t - T.dead;
    const dy = t < T.drop ? 0 : 0.5 * 900 * (t - T.drop) ** 2;
    const y = b.y + BRA * b.sy + 1 + dy;
    ctx.fillStyle = HEX.ice;
    ctx.globalAlpha = clamp(k / 0.03);
    ctx.fillRect(Math.round(b.x) - 1, Math.round(y), 2, t < T.drop ? 2 : 3);
    ctx.globalAlpha = 1;
    if (t >= T.ring && t < T.ring + 0.08) {
      ctx.globalCompositeOperation = 'lighter';
      const g = 1 - (t - T.ring) / 0.08;
      drawGlow(ctx, glowOf(PAL.ice), b.x, y + 1, 9, 0.9 * g);
      ctx.fillStyle = rgba(PAL.ice, g);
      ctx.fillRect(Math.round(b.x) - 5, Math.round(y) + 1, 11, 1);
      ctx.fillRect(Math.round(b.x), Math.round(y) - 4, 1, 11);
      ctx.globalCompositeOperation = 'source-over';
    }
  }
}

/**
 * Light the hit, not the frame (no full-frame flash): a navy pocket round the contact, then a cyan bloom and an ice
 * core on it. Drawn over the keeper but UNDER the ball, so his gloves and face are lit by it while the squashed ball
 * stays a readable shape on top; the ice core is full on the 2 contact frames, then eases for the held punch.
 */
function drawImpactLightA(env: Env, t: number) {
  if (t < T.hit || t >= T.stopEnd + 0.04) return;
  const ctx = env.ctx;
  env.world();
  const [fx0, fy0] = fistsA(t);
  const k = t < T.stopEnd ? 1 : 1 - (t - T.stopEnd) / 0.04;
  const x = Math.round(fx0 - 10), y = Math.round(fy0);
  const core = t < T.hit + 0.034 ? 1 : 0.7;
  ctx.globalCompositeOperation = 'source-over';
  drawGlow(ctx, glowOf(PAL.navy), x, y, 380, 0.62 * k);
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.cyan), x, y, 300, 0.22 * k);
  drawGlow(ctx, glowOf(PAL.ice), x, y, 150, 0.55 * k * core);
  ctx.globalCompositeOperation = 'source-over';
}

/** The contact glint: a four-point ice star where ball meets gloves (the hit-stop frames only). */
function drawStarA(env: Env, t: number) {
  if (t < T.hit || t >= T.stopEnd + 0.04) return;
  const ctx = env.ctx;
  env.world();
  const [fx0, fy0] = fistsA(t);
  const k = t < T.stopEnd ? 1 : 1 - (t - T.stopEnd) / 0.04;
  const x = Math.round(fx0 - 10), y = Math.round(fy0);
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.cyan), x, y, 34, 0.35 * k);
  ctx.fillStyle = HEX.ice;
  ctx.globalAlpha = k;
  const L = 46, W = 2;
  ctx.fillRect(x - L, y - W / 2, L * 2, W);
  ctx.fillRect(x - W / 2, y - L * 1.3, W, L * 2.6);
  ctx.fillRect(x - 10, y - 2, 20, 4);
  ctx.fillRect(x - 2, y - 12, 4, 24);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

/** Ice focus lines round the contact (local, on the hit-stop frames only). */
function drawFocusA(env: Env, t: number) {
  if (t < T.hit || t >= T.stopEnd + 0.03) return;
  const ctx = env.ctx;
  env.world();
  const [fx0, fy0] = fistsA(t);
  const rng = env.frng(7);
  const a = t < T.stopEnd ? 0.6 : 0.6 * (1 - (t - T.stopEnd) / 0.03);
  ctx.globalAlpha = a * 0.7;
  ctx.fillStyle = HEX.navy;
  focusFan(ctx, rng, fx0 - 8, fy0, 110, 520, 44, 8);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = a;
  ctx.fillStyle = HEX.ice;
  focusFan(ctx, env.frng(9), fx0 - 8, fy0, 120, 520, 36, 3);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}
function focusFan(ctx: CanvasRenderingContext2D, rng: { next(): number }, cx: number, cy: number, r0: number, r1: number, n: number, w: number) {
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const a = rng.next() * TAU;
    // Keep them off the left half-plane's axis so the ball and its cone stay clean.
    const ww = (0.2 + rng.next() * 0.8) * w * 0.004;
    const rr0 = r0 * (0.8 + rng.next() * 0.7);
    ctx.moveTo(cx + Math.cos(a) * rr0, cy + Math.sin(a) * rr0);
    ctx.lineTo(cx + Math.cos(a - ww) * r1, cy + Math.sin(a - ww) * r1);
    ctx.lineTo(cx + Math.cos(a + ww) * r1, cy + Math.sin(a + ww) * r1);
    ctx.closePath();
  }
  ctx.fill();
}

function renderA(env: Env, t: number, spin: BallSpin) {
  const { ctx, fx, cam } = env;
  placeCamA(env, t);
  env.screen();
  ctx.fillStyle = HEX.stormNavy;
  ctx.fillRect(0, 0, VW, VH);
  const hy = drawStandsA(env, t);
  drawTurfA(env, t, hy);
  env.world();
  env.parts.draw(ctx, 0);
  drawConeA(env, t);
  drawKeeperA(env, t);
  drawCrushA(env, t);
  env.world();
  env.parts.draw(ctx, 1);
  drawImpactLightA(env, t);
  drawBallA(env, t, spin);
  drawStarA(env, t);
  drawFocusA(env, t);

  // Post: storm grade, then the vacuum grade from the dead stop.
  if (t < T.dead) galeStorm(fx);
  else vacuumGrade(fx, clamp((t - T.dead) / 0.06));
  const b = ballA(t);
  const [bu, bv] = cam.toUV(b.x, b.y);
  if (t < T.hit) {
    // The rocket arriving inside its pressure bubble.
    fx.lens = 0.14;
    fx.lensX = bu;
    fx.lensY = bv;
    fx.lensR = 0.16;
  } else if (t < T.dead + 0.1) {
    const [fx0, fy0] = fistsA(t);
    const [cu, cv] = cam.toUV(fx0 - 6, fy0);
    const s = t - T.hit;
    // The punch's shock ring: crawls through the hit-stop, then races out.
    const r = 0.05 + 0.3 * clamp(s / 0.1) + Math.max(0, t - T.stopEnd) * 1.9;
    pushShock(fx, { x: cu, y: cv, r, s: 0.045 * (1 - clamp((t - T.stopEnd) / 0.26)) });
    const k = 1 - clamp((t - T.stopEnd) / 0.12);
    fx.ca = 0.008 * k + 0.002;
    // Radial smear on the first 2 frames only: the frozen punch (gloves, face, ball) then holds sharp.
    fx.radial = 0.045 * k * (t < T.hit + 0.034 ? 1 : 0.25);
    fx.radialX = cu;
    fx.radialY = cv;
    // Air crushed between ball and gloves: a small pinch.
    fx.lens = -0.12 * k;
    fx.lensX = cu;
    fx.lensY = cv;
    fx.lensR = 0.14;
    // No full-frame flash: the hit is lit locally (drawStarA's navy pocket + ice/cyan glow), so the blacks hold.
    fx.flash = 0;
    fx.bloom = Math.max(fx.bloom, 1.0);
  }
  if (t >= T.dead) {
    fx.ca = 0.0015;
    fx.grain = 0.045;
    // The silence is dark, never murky: a lighter vignette and a touch more bloom (eased in with the vacuum grade)
    // so the hanging ball's cold whites read as the one hot subject.
    const g = clamp((t - T.dead) / 0.06);
    fx.vignette = lerp(fx.vignette, 0.45, g);
    fx.bloom = lerp(fx.bloom, 1.15, g);
    fx.bloomThresh = lerp(fx.bloomThresh, 0.58, g);
  }
}

// ================================================================ 7b · the grin (screen-space two-shot)

/** The two-shot's horizon (his eye line: the camera is at his head height). */
const HZB = 190;
/** The ground camera (field px, 10 = 1 m): a little south-east of him, looking west-north-west up the pitch. */
const EYE = { x: 1182, z: 282, h: 18 } as const;
const YAW = 0.6;
const FB = 400;
const CY = Math.cos(YAW), SY = Math.sin(YAW);
/** Project a field point (x, z, h) into the two-shot's base frame. */
function proj(x: number, z: number, h = 0): { x: number; y: number; s: number; d: number } {
  const rx = x - EYE.x, rz = z - EYE.z;
  const Z = Math.max(2, -rx * CY - rz * SY);
  const X = rx * SY - rz * CY;
  const s = FB / Z;
  return { x: VW / 2 + X * s, y: HZB + (EYE.h - h) * s, s, d: Z };
}

/** The dead ball (left-centre foreground, 62 px) and the keeper's bust (chest anchor; ×2). */
const BALL_B = { x: 286, y: 214, r: 10, D: 3 } as const;
const BUST_B = { x: 492, y: 296 } as const;

/** 7b camera: zoom about the space between ball and face. */
const ZOOM_B: KeyRow[] = [[T.cut, 1], [T.alt, 1], [T.edge, 1.06, 'inOutQuad'], [DUR, 1.12, 'inQuad']];
const FOCUS_B = { x: 380, y: 216 } as const;
function placeCamB(env: Env, t: number) {
  const cam = env.cam;
  cam.zoom = keys(ZOOM_B, t);
  cam.x = FOCUS_B.x - (FOCUS_B.x - VW / 2) / cam.zoom;
  cam.y = FOCUS_B.y - (FOCUS_B.y - VH / 2) / cam.zoom;
  cam.rot = 0;
}
/** Base-frame point -> screen at t (the 7b zoom, no shake). */
function toScreenB(t: number, x: number, y: number): [number, number] {
  const z = keys(ZOOM_B, t);
  return [FOCUS_B.x + (x - FOCUS_B.x) * z, FOCUS_B.y + (y - FOCUS_B.y) * z];
}
/** The ball's sink (6 px over 0.42-1.40) and its tremor once the wall is near. */
function ballB(t: number): [number, number] {
  const sink = 6 * ease.inOutQuad(clamp((t - T.cut) / 0.98));
  const tr = t >= T.kf4 ? (Math.floor(t * 60) % 2 ? 1 : -1) * clamp((t - T.kf4) / 0.2) : 0;
  return [BALL_B.x + tr, BALL_B.y + sink];
}

// ---------------------------------------------------------------- the thunder wall (ring A's leading edge, UV x)

const RING_CX = -2.0, RING_CY = 0.55;
const ringR = (e: number) => (e - RING_CX) * (VW / VH);
/** The leading edge's UV x at the end, solved so that the ice edge touches the ball's left side on the cut frame. */
const E_END = (() => {
  const [bx, by] = ballB(DUR);
  const [sx, sy] = toScreenB(DUR, bx, by);
  const rr = BALL_B.r * BALL_B.D * keys(ZOOM_B, DUR);
  // The edge x on the ball's row for a given e; bisect for edge = ball's left edge.
  const edgeAt = (e: number) => {
    const R = ringR(e) * VH, cx = RING_CX * VW, cy = RING_CY * VH, dy = sy - cy;
    return cx + Math.sqrt(Math.max(0, R * R - dy * dy));
  };
  let lo = 0.1, hi = 0.8;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if (edgeAt(m) < sx - rr + 1) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
})();
/** The wall's progress through 7b, 0 (the first grin frame) .. 1 (the cut). */
const wallK = (t: number) => clamp((t - T.cut) / (DUR - T.cut));
/**
 * Ring A's leading edge (UV x). Visible from the first grin frame (0.10, ~64 px in from the left) and ACCELERATING into
 * the cut (about 66 px/s at the start, about 260 px/s on the cut frame), so the hard cut into hammer 2 lands on peak
 * momentum. This replaces the brief's '(outQuad)' ease, which slowed the threat to under 1 px a frame and parked it on
 * the ball. E_END is still solved at DUR, so the ice edge still touches the ball on the cut frame.
 */
const wallE = (t: number) => {
  const u = wallK(t);
  return lerp(0.1, E_END, 0.4 * u + 0.6 * u * u);
};
/** The curtain's height (screen px): 80 -> 250 (it towers higher as it nears the lens). */
const wallH = (t: number) => lerp(80, 250, ease.inOutQuad(wallK(t)));
/**
 * The curtain's foot (base-frame y): it comes from the horizon toward the lens, from just under the far horizon (behind
 * the fallen wall) to past the bottom of the frame on the cut, so it rolls over the fallen on its way to the ball.
 */
const wallBaseB = (t: number) => lerp(HZB + 14, VH + 6, ease.inQuad(wallK(t)));
/**
 * Shock strength of ring A: 0.022 -> 0.07 (fix round 2; replaces the brief's 0.006 -> 0.03, which shifted the image by
 * under 1 px for most of 7b, so GALE's signature refraction was invisible). With shockWidth 0.09 the stand boards kink
 * visibly along the edge.
 */
const wallS = (t: number) => lerp(0.022, 0.07, ease.inQuad(wallK(t)));
/** The wall in screen space at t: its foot and top rows (shake included), height, and the base-frame foot. */
interface WallGeo {
  k: number;
  h: number;
  base: number;
  top: number;
  baseB: number;
}
function wallGeo(t: number, oy: number): WallGeo {
  const k = wallK(t), h = wallH(t), baseB = wallBaseB(t);
  const base = toScreenB(t, 0, baseB)[1] + oy;
  return { k, h, base, top: base - h, baseB };
}
function wallRings(t: number, ox = 0, oy = 0): ThunderRing[] {
  const e = wallE(t), s = wallS(t);
  return ([[0, 1], [-0.05, 0.6], [-0.1, 0.35]] as const).map(([de, k]) => ({ x: RING_CX + ox / VW, y: RING_CY + oy / VH, r: ringR(e + de), s: s * k }));
}

// ---------------------------------------------------------------- the touchline flag (the gust, before it hits the ball)

/**
 * A flag on the far touchline (field 570, 172: base frame ~(140, 203)), where the wall's edge crosses the pitch: the
 * one prop that shows the gust arriving before it reaches the ball. It stands in the clear turf between the fallen
 * (field 700 put it right behind fallen A's head, where it read as a pennant stuck in his back). Shot 3's yellow / navy
 * corner-flag colours, a little over life size (1.8 m) so it reads at this distance. Base-frame pole foot, height and
 * the pennant's size.
 */
const FLAG = (() => {
  const p = proj(570, 172);
  return { x: Math.round(p.x), y: Math.round(p.y), h: Math.round(18 * p.s), L: 9 * p.s, w: 6 * p.s };
})();
/** The moment ring A's edge crosses the flag's pole (bisect, like E_END): the pennant snaps flat and a whoosh cracks. */
const T_FLAG = (() => {
  const gap = (t: number) => {
    const [sx, sy] = toScreenB(t, FLAG.x, FLAG.y - FLAG.h / 2);
    return (ringEdgeX(wallRings(t)[0], sy) ?? -999) - sx;
  };
  let lo: number = T.cut, hi: number = DUR;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if (gap(m) < 0) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
})();
/**
 * The flag at t (base frame, under the 7b zoom and shake). Its pennant angle is a pure function of the edge's distance:
 * hanging limp until the edge is 65 px away (the edge opens 7b ~76 px from it, so it hangs still through the first
 * grin frames), then whipping east harder as it nears, then snapped flat east in 2 frames as the edge passes (T_FLAG
 * ~1.04, a beat before his eyes snap to the wall); the dust face swallows it a few frames later.
 */
function drawFlagB(env: Env, t: number, edgeAtB: (y: number) => number) {
  const ctx = env.ctx;
  const top = FLAG.y - FLAG.h;
  const d = FLAG.x - edgeAtB(FLAG.y - FLAG.h / 2);
  // Swallowed: fully drawn until the edge is ~14 px past the pole (the snapped pennant still clear of the dust lip),
  // then fading into the dust face.
  const vis = 1 - clamp((-d - 14) / 28);
  if (vis <= 0) return;
  const snap = clamp((t - T_FLAG) / (2 / 30));
  let ang: number;
  if (t < T_FLAG) {
    const w = clamp(1 - d / 65);
    ang = w <= 0 ? 0.2 + 0.04 * Math.sin(t * 3.1) : lerp(0.2, 1.2, ease.inQuad(w)) + Math.sin(t * 40) * 0.3 * Math.min(1, w * 2);
  } else {
    ang = lerp(1.2 + Math.sin(T_FLAG * 40) * 0.3, Math.PI / 2, snap) + Math.sin(t * 61) * 0.04 * snap;
  }
  const flat = t < T_FLAG ? clamp((ang - 0.2) / 1.4) : 1;
  const wHinge = FLAG.w * (1 - 0.3 * flat);
  const hx = FLAG.x + 1, hy = top + wHinge / 2;
  const tipx = hx + Math.sin(ang) * FLAG.L, tipy = hy + Math.cos(ang) * FLAG.L;
  ctx.save();
  ctx.globalAlpha = vis;
  // Pole: navy backing, yellow core (1 px).
  ctx.fillStyle = HEX.navy;
  ctx.fillRect(FLAG.x - 1, top - 1, 3, FLAG.h + 1);
  ctx.fillStyle = '#ffd34a';
  ctx.fillRect(FLAG.x, top, 1, FLAG.h);
  // Pennant: a navy halo, then the yellow cloth with a darker fold toward its free edge.
  const tri = () => {
    ctx.beginPath();
    ctx.moveTo(hx, top);
    ctx.lineTo(hx, top + wHinge);
    ctx.lineTo(tipx, tipy);
    ctx.closePath();
  };
  ctx.strokeStyle = HEX.navy;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  tri();
  ctx.stroke();
  ctx.fillStyle = '#ffd34a';
  tri();
  ctx.fill();
  ctx.fillStyle = '#24336e';
  ctx.beginPath();
  ctx.moveTo(lerp(hx, tipx, 0.55), lerp(top + wHinge, tipy, 0.55));
  ctx.lineTo(lerp(hx, tipx, 0.55), lerp(top, tipy, 0.55));
  ctx.lineTo(tipx, tipy);
  ctx.closePath();
  ctx.globalAlpha = vis * 0.55;
  ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------- 7b layers

/** The far stadium (the west stand and the north stand's end), storm night; flags whip as the wall front passes. */
function drawStadiumB(env: Env, t: number, edgeX: number) {
  const ctx = env.ctx;
  const zb = 0.92;
  const camXb = 760;
  // windWave front (backdrop x) locked to the wall's edge on screen.
  const frontWX = camXb + (edgeX - VW / 2) / zb;
  const ww = clamp((frontWX - (camXb - 400)) / 800);
  ctx.save();
  ctx.translate(VW / 2, HZB);
  ctx.scale(zb, zb);
  ctx.translate(-camXb, -FIELD.horizon);
  drawFieldBackdrop(ctx, env.art.stadium, camXb, FIELD.horizon - 220, 11 + t * 0.6, { storm: 1, wind: 0.15 + 0.5 * clamp((t - T.kf3b) / 0.6), windDir: 1, windWave: ww });
  ctx.restore();
}

/** The pitch receding west (projected): stripes, lines, the pressed wake, the three craters. */
function drawPitchB(env: Env, t: number) {
  const ctx = env.ctx;
  // Base turf below the horizon.
  const g = ctx.createLinearGradient(0, HZB, 0, VH + 40);
  g.addColorStop(0, '#0b211e');
  g.addColorStop(0.25, '#123826');
  g.addColorStop(1, '#1d5a30');
  ctx.fillStyle = g;
  ctx.fillRect(-60, HZB, VW + 120, VH - HZB + 80);
  // Mowing stripes: 5 m bands across the pitch (constant x), alternating.
  const Z0 = 150, Z1 = 360;
  for (let x = 0; x < EYE.x - 20; x += 50) {
    if ((x / 50) % 2) continue;
    const a = proj(x, Z0), b = proj(x + 50, Z0), c = proj(x + 50, Z1), d = proj(x, Z1);
    ctx.fillStyle = 'rgba(160,230,170,0.05)';
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y);
    ctx.lineTo(d.x, d.y);
    ctx.closePath();
    ctx.fill();
  }
  // Lines: the far touchline, the halfway line and centre circle, the penalty box and the six-yard line.
  ctx.strokeStyle = 'rgba(226,236,255,0.55)';
  ctx.lineWidth = 1;
  const seg = (x0: number, z0: number, x1: number, z1: number, n = 24) => {
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const p = proj(lerp(x0, x1, i / n), lerp(z0, z1, i / n));
      if (i) ctx.lineTo(p.x, p.y);
      else ctx.moveTo(p.x, p.y);
    }
    ctx.stroke();
  };
  seg(200, 172, EYE.x - 10, 172, 40);
  seg(700, 172, 700, 360, 20);
  seg(1015, 172, 1015, 360, 20);
  seg(1125, 205, 1125, 330, 12);
  seg(1125, 205, EYE.x - 8, 205, 6);
  ctx.beginPath();
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * TAU;
    const p = proj(700 + Math.cos(a) * 92, 262 + Math.sin(a) * 60);
    if (i) ctx.lineTo(p.x, p.y);
    else ctx.moveTo(p.x, p.y);
  }
  ctx.stroke();
  // The pressed wake: the ball's line from the strike to the keeper, combed pale with a dark groove.
  const pts: [number, number][] = [];
  for (let i = 0; i <= 40; i++) {
    const u = i / 40;
    pts.push([lerp(880, 1148, u), lerp(266, 228, u)]);
  }
  const band = (w: number, fill: string) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const p = proj(pts[i][0], pts[i][1] - w);
      if (i) ctx.lineTo(p.x, p.y);
      else ctx.moveTo(p.x, p.y);
    }
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = proj(pts[i][0], pts[i][1] + w);
      ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.fill();
  };
  band(13, 'rgba(155,224,138,0.2)');
  band(7, 'rgba(155,224,138,0.22)');
  band(2.2, 'rgba(20,60,30,0.9)');
  // Comb lines raking back along the V.
  ctx.fillStyle = 'rgba(214,248,200,0.35)';
  for (let i = 2; i < pts.length; i += 3) {
    for (const side of [-1, 1]) {
      const p = proj(pts[i][0], pts[i][1] + side * 9);
      const q = proj(pts[i][0] - 8, pts[i][1] + side * 12);
      ctx.fillRect(Math.round(Math.min(p.x, q.x)), Math.round(p.y), Math.max(1, Math.round(Math.abs(p.x - q.x))), 1);
    }
  }
  // The three air craters (no line joins them: the wake is the turf's own memory of the flight).
  for (const st of STAMPS) {
    const p = proj(st.x, st.z);
    const R = 13 * p.s;
    airCrater(ctx, p.x, p.y, R, clamp(EYE.h / p.d) * 1.15, 3 + st.id, 3, 0.7);
  }
}

/** The fallen wall, tiny on the turf; rolled over again as the thunder front passes them. */
const FALLEN: { kit: Kit; x: number; z: number; a: Pose; b: Pose; id: string }[] = [
  { kit: RIVAL_KIT, x: 1000, z: 236, a: POSES.sprawl, b: POSES.faceDown, id: 'a' },
  { kit: RIVAL_KIT_B, x: 1028, z: 268, a: POSES.faceDown, b: POSES.sprawl, id: 'b' },
  { kit: RIVAL_KIT_C, x: 972, z: 290, a: POSES.sitWrongWay, b: POSES.sprawl, id: 'c' },
];
const FALLEN_SIL: PuppetSil = { fill: [10, 14, 36], rim: [170, 220, 250], rim2: [70, 216, 255], lx: -0.8, ly: -0.6 };
/**
 * The fallen wall: drawn in front of the curtain while its foot is still further away than they lie (pass 'front'),
 * behind it once the foot has reached their depth (pass 'behind'): the front then rolls them over as its edge passes.
 */
function drawFallenB(env: Env, t: number, edgeAt: (y: number) => number, baseB: number, pass: 'behind' | 'front') {
  const ctx = env.ctx;
  void t;
  for (const f of FALLEN) {
    const p = proj(f.x, f.z, 3);
    const gy = proj(f.x, f.z).y;
    const inFront = baseB < gy;
    if ((pass === 'front') !== inFront) continue;
    const k = Math.max(0.3, Math.round(p.s * 0.2 * 20) / 20);
    const ex = edgeAt(p.y);
    const passed = ex > p.x - 10 && baseB >= gy;
    const pose = passed ? f.b : f.a;
    const name = `f7-${f.id}-${passed ? 'b' : 'a'}`;
    // The roll: a hop and a turn as the front reaches them (both its edge and its foot).
    const since = passed ? clamp(Math.min((ex - (p.x - 10)) / 60, (baseB - gy) / 14)) : 0;
    const hop = passed ? Math.sin(Math.min(Math.PI, since * Math.PI)) * 6 * p.s * 0.2 : 0;
    const rot = passed ? (1 - since) * 1.2 : 0;
    ctx.fillStyle = 'rgba(4,8,22,0.5)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 1, 9 * p.s * 0.2, 2, 0, 0, TAU);
    ctx.fill();
    PUPPETS.draw(ctx, name, f.kit, pose, k, -1, p.x + since * 6, p.y - hop - 8 * k, 1, 0.35, FALLEN_SIL, 1, rot);
  }
}

/** Screen x of ring A's leading edge on row y (screen px, shake included). */
function edgeFn(t: number, ox: number, oy: number) {
  const ring = wallRings(t, ox, oy)[0];
  return (y: number) => ringEdgeX(ring, y) ?? -999;
}

/**
 * The storm curtain behind the ice edge: a haboob of dust, dew and torn storm cloud rolling in from the far end. One
 * mass: a body, a crest of big rolling billows with smaller ones riding them, a front face of bulges churning upward
 * just behind the ice edge, and a low cauliflower texture inside. No billow carries its own shading (a pile of balls):
 * each layer is lit as one volume by drawing its lumps in the rim tones and covering them again with the body gradient,
 * offset away from the light, so a two-tone rim survives only on the lit silhouette (the crest lit from above by the
 * floodlights, the front lit from the east by the edge). Soft drifts, speed streaks, tumbling debris and dew glitter
 * move inside it.
 */
interface Lump {
  x: number;
  y: number;
  r: number;
}
/** Rim tones: ice, so the grade lands the lit crest near white (never a cobalt-family mass). */
const WALL_RIM: RGB = [242, 252, 255];
const WALL_RIM2: RGB = [150, 168, 190];
function drawCurtainB(env: Env, t: number, edgeAt: (y: number) => number, g: WallGeo, edgeA: number) {
  const ctx = env.ctx;
  const { k, h, base, top } = g;
  // The churn is tied to the edge's acceleration: it boils faster as the front speeds up.
  const roll = t * 0.8 + 2.2 * (0.4 * k + 0.6 * k * k);
  const sc = 0.5 + 0.7 * (h / 250);
  const exAt = (y: number) => edgeAt(clamp(y, top, base));
  const exTop = exAt(top + 16);
  // The dust face: never a flat slab. It churns 2-13 px behind the pressure line in rolling bulges, so the ice edge is
  // the lit lip of the dust itself (fix round 2: never a lone white pole standing in clear air ahead of a cloud).
  const faceAt = (y: number) =>
    exAt(y) - sc * (2 + 7 * (0.5 + 0.5 * Math.sin(y * 0.045 + roll * 2.3)) + 4 * (0.5 + 0.5 * Math.sin(y * 0.11 - roll * 3.1)));
  // The crest: a rolling head ~70 px behind the front, lower and lumpier further back.
  const topAt = (x: number) => {
    const back = exTop - x;
    const lean = back < 0 ? 0.7 : back < 70 ? lerp(0.78, 1, ease.outQuad(back / 70)) : back < 180 ? 1 : lerp(1, 0.78, clamp((back - 180) / 280));
    return base - h * lean;
  };
  ctx.save();
  // The curtain stands on its foot: nothing of it below the foot row (the turf nearer the lens is still untouched).
  ctx.beginPath();
  ctx.rect(-60, 0, VW + 120, base + 2);
  ctx.clip();
  // The storm ramp, dark at the foot: a pressure front of dust and torn cloud, not a cotton cloud. The scene values are
  // grade-compensated: the vacuum/storm grades tint by up to (0.67, 0.78, 1), which turned the brief's storm greys
  // (186,200,214 -> 104,118,140) into hue ~219 / sat ~0.42 on screen (the cobalt-family mass the review flagged). These
  // warm-neutral greys land on screen as the intended cold storm greys (sat ~0.2), near white at the lit crest.
  // Fix round 2: a storm mass lit only at its rim (the bright cumulus outshone the hanging ball): dark dust, an ice lip.
  const body = ctx.createLinearGradient(0, top - 30, 0, base);
  body.addColorStop(0, 'rgb(150,146,140)');
  body.addColorStop(0.45, 'rgb(66,66,74)');
  body.addColorStop(1, 'rgb(20,22,32)');
  const disc = (l: Lump, dx: number, dy: number) => {
    ctx.beginPath();
    ctx.arc(Math.round(l.x + dx), Math.round(l.y + dy), l.r, 0, TAU);
    ctx.fill();
  };
  /** Draw a layer of lumps lit from (lx, ly) (unit-ish): rim, inner rim, then the body cover offset away from it. */
  const litLayer = (lumps: Lump[], lx: number, ly: number, rim: RGB, rim2: RGB, a = 1, rimW = 1) => {
    const r1 = Math.max(1, 1.5 * sc * rimW), r2 = Math.max(2, 3.4 * sc * rimW);
    ctx.globalAlpha = a;
    ctx.fillStyle = rgba(rim, 1);
    for (const l of lumps) disc(l, 0, 0);
    ctx.fillStyle = rgba(rim2, 1);
    for (const l of lumps) disc(l, -lx * r1, -ly * r1);
    ctx.globalAlpha = 1;
    ctx.fillStyle = body;
    for (const l of lumps) disc(l, -lx * r2, -ly * r2);
  };
  // 1. Body.
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(-40, base + 6);
  for (let x = -40; x <= exTop - 20 * sc; x += 6) ctx.lineTo(x, topAt(x) + 16 * sc);
  for (let y = Math.round(top + 20 * sc); y <= base + 6; y += 3) ctx.lineTo(faceAt(y) - 8 * sc, y);
  ctx.closePath();
  ctx.fill();
  // 1b. The veil: thin dust filling the churn between the body and the pressure line, so the ice edge is the lit lip
  // of the dust itself, never a pole standing in clear air ahead of it (and never under the crest's overhang alone).
  const vy: number[] = [];
  for (let y = Math.round(top + 6 * sc); y <= base + 6; y += 3) vy.push(y);
  ctx.fillStyle = 'rgba(92,98,112,0.42)';
  ctx.beginPath();
  for (const y of vy) ctx.lineTo(faceAt(y) - 9 * sc, y);
  for (let i = vy.length - 1; i >= 0; i--) ctx.lineTo(exAt(vy[i]) - 1, vy[i]);
  ctx.closePath();
  ctx.fill();
  // 2. Inner texture: soft storm-smoke lumps drifting up and back (no outlines).
  for (let i = 0; i < 26; i++) {
    const x = lerp(-20, exTop - 40 * sc, hash(i * 7.7)) - ((t * 36 * (0.6 + hash(i))) % 46);
    const y = lerp(topAt(x) + 40 * sc, base + 6, hash(i * 3.1)) - ((t * 44 * (0.5 + hash(i * 2))) % 34);
    const r = (10 + hash(i * 2.3) * 16) * sc * 1.3;
    ctx.globalAlpha = 0.35;
    ctx.drawImage(softSprite('storm', 0.35 + 0.3 * hash(i)), x - r, y - r, r * 2, r * 2);
  }
  ctx.globalAlpha = 1;
  // 3. Soft drifts for volume.
  for (let i = 0; i < 12; i++) {
    const x = lerp(-30, exTop - 30, hash(i * 5.3)) - ((t * 40 * (0.5 + hash(i))) % 50);
    const y = lerp(topAt(x) + 24, base + 10, hash(i * 9.1));
    const s = 22 + hash(i * 2.9) * 40;
    ctx.globalAlpha = i % 2 ? 0.3 : 0.22;
    ctx.drawImage(softSprite('storm', i % 2 ? 0.75 : 0.5), x - s, y - s, s * 2, s * 2);
  }
  ctx.globalAlpha = 1;
  // 4. The crest, torn: billows of uneven size and spacing (some towering), smaller ones riding them (lit from above).
  const big: Lump[] = [], small: Lump[] = [];
  const nb = 14;
  for (let i = 0; i < nb; i++) {
    const u = (i / nb + roll * 0.07) % 1;
    const x = exTop - 24 * sc - (u + (hash(i * 2.7) - 0.5) * 0.05) * 470;
    const tower = hash(i * 1.9 + 0.3) < 0.36;
    const r = (tower ? 34 + hash(i * 5.7) * 30 : 10 + hash(i * 5.7) * 22) * sc;
    big.push({ x, y: topAt(x) + r * (tower ? 0.35 : 0.8) + (hash(i * 9.7) - 0.5) * 24 * sc, r });
  }
  for (let i = 0; i < 22; i++) {
    const u = (i / 22 + (hash(i * 1.3) - 0.5) * 0.05 + roll * 0.1) % 1;
    const x = exTop - 14 * sc - u * 470;
    const r = (5 + hash(i * 4.1) * 12) * sc;
    small.push({ x, y: topAt(x) + r * 0.2 - 2 * sc + Math.sin(i * 2.1 + roll * 3) * 2 + (hash(i * 6.3) - 0.5) * 14 * sc, r });
  }
  litLayer(big, 0.25, -1, WALL_RIM, WALL_RIM2, 1, 1.8);
  litLayer(small, 0.25, -1, WALL_RIM, WALL_RIM2, 0.9);
  // The floodlights catch the crest from above: ice on the billow tops (the wall's hot, near-white edge).
  ctx.globalCompositeOperation = 'lighter';
  for (const l of big) {
    if (l.x + l.r < -20 || l.x - l.r > VW + 20) continue;
    drawGlow(ctx, glowOf(PAL.ice), l.x + l.r * 0.15, l.y - l.r * 0.6, l.r * 0.5, 0.18);
  }
  ctx.globalCompositeOperation = 'source-over';
  // Its top torn by the wind: spindrift smoking up and back off the crest.
  for (let i = 0; i < 18; i++) {
    const x0 = exTop - 10 * sc - hash(i * 3.1) * 420;
    const ph = (t * (0.9 + hash(i) * 0.8) + hash(i * 7.3)) % 1;
    const x = x0 - ph * 70 * sc, y = topAt(x0) - 2 * sc - ph * 26 * sc;
    const sz = (6 + 16 * ph) * sc;
    ctx.globalAlpha = 0.4 * (1 - ph) * (0.5 + 0.5 * hash(i * 5.1));
    ctx.drawImage(softSprite('vapor', 0.35 + 0.4 * ph), x - sz, y - sz * 0.6, sz * 2, sz * 1.2);
  }
  ctx.globalAlpha = 1;
  // 5. The front: bulges churning up the face just behind the ice edge (lit from the east).
  const front: Lump[] = [];
  const nf = 12;
  for (let i = 0; i < nf; i++) {
    const u = (i / nf + roll * 0.36) % 1;
    const y = lerp(base + 20, top + 20 * sc, u);
    const r = (12 + hash(i * 3.3) * 16) * sc;
    const lag = hash(i * 6.1) * 10 * sc;
    front.push({ x: faceAt(y) - r + 4 * sc - lag, y, r });
  }
  litLayer(front, 1, -0.3, WALL_RIM, WALL_RIM2);
  // The front face catches the edge light: a horizontal glow over the mass, strongest at the front.
  const exMid = exAt(base - h * 0.5);
  const lit = ctx.createLinearGradient(exMid - 150, 0, exMid, 0);
  lit.addColorStop(0, 'rgba(220,236,255,0)');
  lit.addColorStop(1, 'rgba(226,240,255,0.24)');
  ctx.fillStyle = lit;
  ctx.beginPath();
  ctx.moveTo(exMid - 160, base + 6);
  ctx.lineTo(exMid - 160, topAt(exMid - 160) + 10 * sc);
  for (let y = Math.round(top + 16 * sc); y <= base + 6; y += 3) ctx.lineTo(faceAt(y), y);
  ctx.closePath();
  ctx.fill();
  // The dust skirt: the head of the flow hugging the turf, rolling out ahead of the face.
  for (let i = 0; i < 14; i++) {
    const u = (hash(i * 3.7) + t * (1.2 + hash(i) * 0.8)) % 1;
    const y = base - 4 - hash(i * 5.3) * 46 * sc;
    const x = faceAt(y) - 8 * sc + u * 34 * sc;
    const s = (10 + hash(i * 2.7) * 14) * sc * (1 - 0.5 * u);
    ctx.globalAlpha = 0.6 * (1 - u);
    ctx.drawImage(softSprite('storm', 0.02 + 0.12 * hash(i)), x - s, y - s * 0.7, s * 2, s * 1.4);
  }
  ctx.globalAlpha = 1;
  // 6. Debris tumbling in the front: dark blades and clods of dust caught in the churn.
  const fr2 = Math.floor(t * 30);
  ctx.fillStyle = 'rgb(20,26,48)';
  for (let i = 0; i < 30; i++) {
    const u = (hash(i * 4.9) + t * (0.8 + hash(i) * 0.8)) % 1;
    const y = lerp(base, top + 14, u);
    const x = exAt(y) - 10 - hash(i * 7.1) * 70;
    const L = 2 + Math.round(hash(i * 2.2) * 3);
    if ((i + fr2) % 2) ctx.fillRect(Math.round(x), Math.round(y), L, 1);
    else ctx.fillRect(Math.round(x), Math.round(y), 1, L);
  }
  // 7. Speed streaks inside (the air racing east), pale, irregular, faster as the front accelerates.
  ctx.fillStyle = 'rgba(236,246,255,0.42)';
  for (let i = 0; i < 26; i++) {
    const y = Math.round(lerp(top + 24, base - 4, hash(i * 2.9)));
    const ex = exAt(y);
    const len = 12 + hash(i * 8.3) * 44;
    const x = ex - 30 - ((t * (500 + 900 * k) * (0.6 + hash(i * 1.3))) % 320);
    ctx.fillRect(Math.round(x), y, Math.round(len), 1);
  }
  ctx.globalCompositeOperation = 'lighter';
  // 8. Dew glitter caught in the front.
  ctx.fillStyle = HEX.ice;
  const fr = Math.floor(t * 30);
  for (let i = 0; i < 54; i++) {
    if (hash(i * 3.3 + fr * 0.71) < 0.4) continue;
    const y = Math.round(lerp(top + 4, base, hash(i * 6.1)));
    const x = Math.round(exAt(y) - 3 - hash(i * 2.4 + 0.5) * 90);
    ctx.globalAlpha = 0.45 + 0.55 * hash(i + fr);
    ctx.fillRect(x, y, 1, 1);
  }
  // 9. The lit front: a cyan glow strip just behind the ice edge.
  for (let y = Math.round(top); y < base; y += 2) {
    const ex = exAt(y);
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = HEX.cyan;
    ctx.fillRect(Math.round(ex) - 10, y, 9, 2);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  // 10. The ice edge on ring A, then the overhanging head over it: the crest breaking forward past the pressure line
  // like a wave about to crash on the ball (a navy underside, lit from the upper east).
  edgeLine(ctx, edgeAt, top, base, edgeA);
  const lip: Lump[] = [];
  for (let j = 0; j < 6; j++) {
    const u = j / 5;
    const wob = Math.sin(roll * 5 + j * 1.7) * 1.5 * sc;
    lip.push({ x: exTop - 46 * sc + u * 70 * sc + wob, y: top + (6 + 30 * u * u) * sc, r: lerp(24, 9, u) * sc });
  }
  // The navy underside of the curl (the hollow under a breaking wave), then the lit head over it.
  ctx.fillStyle = rgba(PAL.navy, 0.55);
  for (const l of lip) disc(l, -2 * sc, 8 * sc);
  litLayer(lip, 1, -0.6, WALL_RIM, WALL_RIM2);
  const tip = lip[5];
  // Spray flung forward and down off the tip, and the edge light flaring on the curl.
  for (let i = 0; i < 9; i++) {
    const ph = (t * (1.6 + hash(i * 2.3)) + hash(i * 4.9)) % 1;
    const x = tip.x + tip.r * 0.6 + ph * (18 + 22 * hash(i)) * sc, y = tip.y + ph * (10 + 26 * hash(i * 1.7)) * sc;
    const sz = (4 + 9 * ph) * sc;
    ctx.globalAlpha = 0.45 * (1 - ph);
    ctx.drawImage(softSprite('vapor', 0.2 + 0.5 * ph), x - sz, y - sz, sz * 2, sz * 2);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
  // The foot: the densest dust rolling along the turf, spilling just past the foot line (no hard box bottom).
  const depth = clamp((base - HZB) / (VH - HZB));
  const fs = 5 + 12 * depth;
  for (let i = 0; i < 26; i++) {
    const x = lerp(-40, exAt(base - 2) - 4, hash(i * 6.7)) + ((t * 60 * (0.5 + hash(i * 2.1))) % 24);
    const sz = fs * (0.7 + 0.6 * hash(i * 3.9));
    ctx.globalAlpha = 0.55;
    ctx.drawImage(softSprite('storm', 0.45 + 0.35 * hash(i * 8.1)), x - sz, base - 2 - sz * 0.45, sz * 2, sz * 0.9);
  }
  ctx.globalAlpha = 1;
}

/**
 * The ice edge line on ring A: 2 px over a navy halo on the curtain's rows (top .. foot), and only a short shimmer
 * (36 px) above its top: never a scratch running up through the stands.
 */
function edgeLine(ctx: CanvasRenderingContext2D, edgeAt: (y: number) => number, top: number, base: number, a: number) {
  const kAt = (y: number) => (y >= top ? 1 : y >= top - 36 ? 0.35 * (1 - (top - y) / 36) : 0);
  const y0 = Math.max(0, Math.floor(top - 36)), y1 = Math.min(VH, Math.ceil(base));
  for (let y = y0; y < y1; y++) {
    const x = Math.round(edgeAt(y));
    if (x < -4 || x > VW + 4) continue;
    const k = kAt(y);
    if (k <= 0.01) continue;
    ctx.globalAlpha = 0.5 * a * k;
    ctx.fillStyle = HEX.navy;
    ctx.fillRect(x - 1, y, 4, 1);
  }
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = HEX.ice;
  for (let y = y0; y < y1; y++) {
    const x = Math.round(edgeAt(y));
    if (x < -4 || x > VW + 4) continue;
    const k = kAt(y);
    if (k <= 0.01) continue;
    // Beaded along y (steady in time, so never a flicker): 2 px only on the bright beads, so it never reads as a pole.
    const bead = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(y * 0.19 + Math.sin(y * 0.047) * 3));
    ctx.globalAlpha = 0.95 * a * k * bead;
    ctx.fillRect(x, y, y >= top && bead > 0.8 ? 2 : 1, 1);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

/** The floodlights over the far stands (cold glare, navy halos), and a low haze along the horizon. */
function drawLampsB(env: Env, t: number) {
  const ctx = env.ctx;
  void t;
  ctx.globalCompositeOperation = 'lighter';
  for (const [x, y, s] of [[300, 12, 1], [36, 28, 0.7], [610, 4, 1.1]] as const) {
    drawGlow(ctx, glowOf([70, 110, 210]), x, y, 200 * s, 0.16);
    drawGlow(ctx, glowOf([170, 215, 255]), x, y, 60 * s, 0.32);
    // Lit, but never as hot as the ball or the KF3 rim (the top-centre lamp sits straight above the ball).
    drawGlow(ctx, glowOf([238, 251, 255]), x, y, 24 * s, 0.6);
    drawGlow(ctx, glowOf([255, 255, 255]), x, y, 9 * s, 0.75);
  }
  ctx.globalCompositeOperation = 'source-over';
  const g = ctx.createLinearGradient(0, HZB - 30, 0, HZB + 26);
  g.addColorStop(0, 'rgba(58,70,104,0)');
  g.addColorStop(0.55, 'rgba(58,70,104,0.35)');
  g.addColorStop(1, 'rgba(58,70,104,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, HZB - 30, VW, 56);
}

/**
 * Ahead of the front, at its foot: the turf peeling pale in a line along the foot and just ahead of the face, dust
 * kicked low (never torn sod). Drawn before the curtain, so the curtain stands on the peel line.
 */
function drawPeelB(env: Env, t: number, edgeAt: (y: number) => number, base: number) {
  const ctx = env.ctx;
  const fr = Math.floor(t * 30);
  const depthAt = (y: number) => clamp((y - HZB) / (VH - HZB));
  // Just ahead of the face, near the foot: blades flipped pale.
  // Only on the foot rows (fix round 2: rows below the foot stacked into a sparkle drip under the near-vertical edge);
  // the blades spread along the turf instead.
  const y0 = Math.max(HZB + 2, Math.round(base - 6)), y1 = Math.min(VH, base + 3);
  for (let y = y0; y < y1; y += 2) {
    const ex = edgeAt(y);
    const depth = depthAt(y);
    const w = 4 + depth * 22;
    for (let k = 0; k < 3; k++) {
      const x = ex + 2 + hash(y * 0.37 + k * 5.1 + fr * 0.13) * w * 3;
      ctx.fillStyle = k ? 'rgba(155,224,138,0.55)' : 'rgba(214,248,200,0.7)';
      ctx.fillRect(Math.round(x), y, 1, depth > 0.5 ? 2 : 1);
    }
  }
  // The peel line along the foot: a pale band of flipped blades the curtain stands on (it reads the wall's depth).
  if (base > HZB && base < VH + 4) {
    const depth = depthAt(base);
    const ex = edgeAt(base);
    const bh = 1 + Math.round(depth * 4);
    for (let x = -4; x < ex + 6; x += 2) {
      const j = hash(x * 0.71 + fr * 0.29);
      ctx.fillStyle = j < 0.5 ? 'rgba(214,248,200,0.6)' : 'rgba(155,224,138,0.45)';
      ctx.fillRect(x, Math.round(base + 1 + j * bh), 2, 1);
    }
  }
  // Low dust rolling out ahead of the face along the foot.
  for (let i = 0; i < 12; i++) {
    const y = lerp(base - 24, base + 8, hash(i * 4.4));
    if (y < HZB) continue;
    const ex = edgeAt(y);
    const s = 8 + hash(i * 3.3) * 16 * (0.5 + (y - HZB) / 200);
    const x = ex + 4 + ((t * 120 + hash(i) * 30) % 30);
    ctx.globalAlpha = 0.35;
    ctx.drawImage(softSprite('storm', 0.2), x - s, y - s * 0.7, s * 2, s * 1.4);
  }
  ctx.globalAlpha = 1;
}

/** The KeeperFront bust (or the fallback): storm-lit, rim-lit on its left by the wall's ice light. */
function kfKeyAt(t: number): KeeperFrontKey {
  if (t >= T.kf4) return 'KF4';
  if (t >= T.alt) return Math.floor((t - T.alt) / 0.1) % 2 ? 'KF3b' : 'KF3';
  if (t >= T.kf3b) return 'KF3b';
  return 'KF3';
}
/** The floodlights behind him (above right) rim his hair and shoulders: a rim-only silhouette (black fill, added). */
const BUST_BACKRIM = { fill: [0, 0, 0] as RGB, rim: [238, 251, 255] as RGB, rim2: [70, 216, 255] as RGB, lx: 0.35, ly: -1, detail: 0 };
const BUST_SIL = (detail: number) => ({ fill: [12, 18, 44] as RGB, rim: [238, 251, 255] as RGB, rim2: [70, 216, 255] as RGB, lx: -1, ly: -0.35, detail });
function drawBustB(env: Env, t: number, light: number) {
  const ctx = env.ctx;
  const key = kfKeyAt(t);
  const tremor = t >= T.kf4 ? (Math.floor(t * 60) % 2 ? 1 : 0) : 0;
  const breathe = t < T.alt ? Math.round(Math.sin((t - T.cut) * 7) * 0.6) : 0;
  const x = BUST_B.x + tremor, y = BUST_B.y + breathe;
  const f = keeperFront(key);
  // A navy halo behind him so the lime shirt sits on the dark.
  drawGlow(ctx, glowOf(PAL.navy), x - 6, y - 90, 170, 0.6);
  if (!f) {
    PUPPETS.draw(ctx, `kf7-${key}`, KEEPER_KIT, POSES.gkReady, 2, -1, x, y + 60, 1.4);
    return;
  }
  const fr = f.a.frames[f.i];
  const pivot = fr.anchors.chest ?? [f.a.w / 2, f.a.h / 2];
  const a: StudioAnim = f.a;
  // Cold rim (cyan, offset left) from the oncoming wall, growing as it nears.
  ctx.globalCompositeOperation = 'lighter';
  drawAnim(ctx, a, a.tinted(f.i, PAL.cyan), f.i, x - 2, y, 2, { pivot, alpha: 0.25 + 0.45 * light });
  ctx.globalCompositeOperation = 'source-over';
  drawAnim(ctx, a, null, f.i, x, y, 2, { pivot });
  // Storm-dark him (the floodlights are behind him), with an ice rim on the wall side.
  drawAnim(ctx, a, a.silhouette(f.i, BUST_SIL(0.72)), f.i, x, y, 2, { pivot, alpha: 0.42 + 0.2 * light });
  // The floodlight back-rim on his hair and shoulders (the grin is dark, never murky: a hot edge to lock onto).
  ctx.globalCompositeOperation = 'lighter';
  drawAnim(ctx, a, a.silhouette(f.i, BUST_BACKRIM), f.i, x, y, 2, { pivot, alpha: 0.9 });
  ctx.globalCompositeOperation = 'source-over';
}

/** The dead ball: cold, panels still, a navy pocket, dew beads clinging (they shiver and drift right from 0.95). */
function drawBallB(env: Env, t: number, spin: BallSpin, light: number, edgeX: number) {
  const ctx = env.ctx;
  const [bx, by] = ballB(t);
  const R = BALL_B.r * BALL_B.D;
  // The cushion of air under it: a faint pressed shimmer.
  ctx.globalAlpha = 0.25;
  ctx.drawImage(softSprite('vapor', 0.6), bx - R * 1.2, by + R * 0.7, R * 2.4, R * 0.7);
  ctx.globalAlpha = 1;
  drawBall(env, spin, bx, by, BALL_B.r, BALL_B.D, 0.45, 0.55 + 0.3 * light, 'cobalt', undefined, { storm: true });
  // A cold key light on its upper left: dead, but still the frame's hot subject.
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.ice), bx - R * 0.45, by - R * 0.5, 28, 0.65);
  ctx.globalCompositeOperation = 'source-over';
  // The wall's ice light catching its left rim.
  if (light > 0) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = rgba(PAL.ice, 0.25 + 0.6 * light);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(bx, by, R - 1, Math.PI * 0.62, Math.PI * 1.38);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }
  // Dew beads on the ball's surface.
  const shiver = t >= T.alt ? clamp((t - T.alt) / 0.3) : 0;
  const fr = Math.floor(t * 60);
  ctx.fillStyle = HEX.ice;
  for (let i = 0; i < 14; i++) {
    const a = hash(i * 4.7) * TAU;
    const rr = R * (0.55 + 0.4 * hash(i * 2.3));
    const drift = shiver * (6 + hash(i) * 10) * clamp((t - T.alt - hash(i * 3) * 0.3) / 0.25);
    const jit = shiver > 0 ? (hash(i + fr * 0.37) - 0.5) * 2 * shiver : 0;
    const x = bx + Math.cos(a) * rr + drift + jit;
    const y = by + Math.sin(a) * rr * 0.9 + jit * 0.5;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
    if (drift > R * 0.5) {
      // Blown off the panel: a 4 px trail behind the bead.
      ctx.globalAlpha = 0.4;
      ctx.fillRect(Math.round(x) - 4, Math.round(y), 4, 1);
    }
  }
  ctx.globalAlpha = 1;
  void edgeX;
}

/** Wind streaks in the air ahead of the front (the first breath of the oncoming air, then a gale). */
function drawAirB(env: Env, t: number, edgeX: number) {
  const ctx = env.ctx;
  const k = clamp((t - T.kf3b + 0.1) / 0.5);
  if (k <= 0) return;
  ctx.fillStyle = 'rgba(214,240,255,1)';
  for (let i = 0; i < 30; i++) {
    const y = Math.round(lerp(40, VH - 10, hash(i * 3.17)));
    const sp = 700 + hash(i * 5.3) * 900;
    const span = VW + 200;
    const x = edgeX + ((t * sp + hash(i * 1.7) * span) % span);
    if (x > VW + 20) continue;
    ctx.globalAlpha = k * (0.12 + 0.2 * hash(i * 9.9)) * (1 + 1.2 * clamp((t - T.kf4) / 0.3));
    ctx.fillRect(Math.round(x), y, Math.round(10 + hash(i * 2.2) * 40), 1);
  }
  ctx.globalAlpha = 1;
}

function renderB(env: Env, t: number, spin: BallSpin) {
  const { ctx, fx } = env;
  placeCamB(env, t);
  const [ox, oy] = shakeOff(env);
  const edgeAt = edgeFn(t, ox, oy);
  const g = wallGeo(t, oy);
  const [sbx, sby] = toScreenB(t, ...ballB(t));
  const edgeBall = edgeAt(sby);
  // How close the wall is to the ball (0 far .. 1 touching): it sets the cold light on the ball and the bust.
  const near = clamp(1 - (sbx - edgeBall) / 260);
  const light = clamp(0.15 + near * 0.85);

  // ---- background (base frame under the 7b zoom + shake)
  env.screen();
  ctx.fillStyle = HEX.stormNavy;
  ctx.fillRect(0, 0, VW, VH);
  env.world();
  drawStadiumB(env, t, edgeAt(HZB - 40));
  drawPitchB(env, t);
  env.screen();
  stormDarken(ctx, 0.2);
  drawLampsB(env, t);
  // The fallen are in the base frame: the edge in the same frame (inverse of the 7b zoom and shake).
  const edgeAtB = (y: number) => {
    const z = env.cam.zoom;
    const sy = toScreenB(t, 0, y)[1] + oy;
    return FOCUS_B.x + (edgeAt(sy) - ox - FOCUS_B.x) / z;
  };
  env.world();
  drawFallenB(env, t, edgeAtB, g.baseB, 'behind');

  // ---- the thunder wall (screen space: it lives on the same circle as the post rings), from the horizon to the lens
  env.screen();
  drawPeelB(env, t, edgeAt, g.base);
  drawCurtainB(env, t, edgeAt, g, lerp(0.3, 0.9, clamp((t - T.cut) / 0.5)));
  const rings = wallRings(t, ox, oy);
  // The fallen still nearer than the wall's foot stand in front of it.
  env.world();
  drawFallenB(env, t, edgeAtB, g.baseB, 'front');
  drawFlagB(env, t, edgeAtB);
  env.screen();
  drawAirB(env, t, edgeAt(HZB));

  // ---- foreground: the dead ball and the grinning keeper
  env.world();
  drawBallB(env, t, spin, light, edgeBall);
  drawBustB(env, t, light);
  env.world();
  env.parts.draw(ctx, 1);

  // ---- post: the vacuum grade opening under the rising thunder; the wall's three rings; the frame-edge ripple.
  vacuumGrade(fx, 1 - clamp((t - T.thunder) / 0.4));
  fx.shockWidth = 0.09;
  for (const r of rings) pushShock(fx, { x: r.x, y: r.y, r: r.r, s: r.s });
  // The frame-edge ripple (fix round 2): it sweeps in from the corners (1.02 screen heights from centre) to the side
  // edges (0.89), so the air visibly bends the frame; the ball (~0.17) and his face (~0.5) stay untouched.
  if (t >= T.edge) {
    const u = (t - T.edge) / (DUR - T.edge);
    pushShock(fx, { x: 0.5 + ox / VW, y: 0.5 + oy / VH, r: lerp(1.0, 0.84, ease.inQuad(u)), s: 0.025 });
  }
  fx.ca = 0.0015 + 0.006 * clamp((t - T.kf4) / 0.35);
  // A lighter vignette than the vacuum grade's 0.72: the wall rises at the far left edge of the frame and its lit crest
  // must not be crushed there (the grin is dark, but never murky: the ball, the crest and the lamps stay hot).
  fx.vignette = lerp(0.35, 0.55, clamp((t - T.kf4) / (DUR - T.kf4)));
  // A little more bloom than the vacuum grade's 0.9: the cold whites (ball, lamps, rims, crest) bloom into true hot.
  fx.bloom = 1.15;
  fx.bloomThresh = 0.58;
  fx.grain = 0.045;
}

// ================================================================ the shot

let spin = new BallSpin();
const fired = { hit: false, dead: false, cut: false, kf3b: false, dew: 0 };
/** The dew curtain condensing out of the dying cone: 120 drops over 0.18-0.24. */
const DEW = { t0: 0.18, n: 120 } as const;

export const shotDeadStop: Shot = {
  name: META.name,
  dur: DUR,
  seed: META.seed,
  rate: RATE[7],
  muffle: MUFFLE[7],
  cues: [
    {
      at: T.hit,
      fn: (e) => {
        e.sfx.kick(1.1);
        e.sfx.boom(0.9);
        e.sfx.strain(0.5, 0.3);
        e.sfx.scrape(0.3, 0.2);
        e.cam.shakeAmp = 16;
        e.cam.shakeRoll = 0.015;
        e.cam.hit(0.7);
        e.cam.shove(12, 0);
      },
    },
    {
      at: T.dead,
      fn: (e) => {
        // Gap 3: total silence (the muffle closes to 0.9 on this step); a faint ringing in the ears on the dry bus.
        e.sfx.clearBus();
        e.sfx.whine(0.55, 0.025);
        e.cam.trauma = 0;
      },
    },
    { at: T.ring, fn: (e) => e.sfx.glassRing(0.05) },
    { at: T.thunder, fn: (e) => e.sfx.thunderFront(0.7) },
    // The flag snaps flat as the edge passes it: a short high crack of air.
    { at: T_FLAG, fn: (e) => e.sfx.whoosh(0.08, 1200, 3000, 0.2) },
    { at: T.kf4, fn: (e) => e.sfx.whoosh(0.3, 200, 1200) },
  ],
  prepare(env) {
    warmGale();
    for (const [name, p] of [['k7-punch', P_PUNCH], ['k7-recoil', P_RECOIL], ['k7-open', P_OPEN]] as const) {
      PUPPETS.get(name, KEEPER_KIT7, p, KA, FACE, KEEPER_SIL);
      PUPPETS.get(name, KEEPER_KIT7, p, KA, FACE);
    }
    for (const k of ['KF3', 'KF3b', 'KF4'] as KeeperFrontKey[]) {
      const f = keeperFront(k);
      if (f) {
        f.a.tinted(f.i, PAL.cyan);
        f.a.silhouette(f.i, BUST_SIL(0.72));
        f.a.silhouette(f.i, BUST_BACKRIM);
      }
    }
    void env;
  },
  init(env) {
    env.sfx.clearBus();
    env.cam.set(VW / 2, VH / 2, 1, 0);
    PUPPETS.frame();
    spin = new BallSpin();
    // A knuckle ball: a fixed, readable panel orientation (it never spins in this shot).
    spin.rotate(0.3, 1, 0.2, 0.9);
    fired.hit = fired.dead = fired.cut = fired.kf3b = false;
    fired.dew = 0;
  },
  update(env, t, dt) {
    const { rng, parts, cam } = env;
    void dt;
    if (t < T.cut) {
      placeCamA(env, t);
      if (t >= T.dead) cam.trauma = 0;
      if (!fired.hit && t >= T.hit) {
        fired.hit = true;
        const [fx0, fy0] = fistsA(T.hit);
        // 50 dew sparks sprayed back toward the shooter (frozen in the hit-stop, then flying).
        for (let i = 0; i < 50; i++) {
          const a = Math.PI + rng.range(-1.0, 1.0);
          const sp = rng.range(260, 900);
          parts.spawn({
            kind: rng.next() < 0.5 ? PK.Streak : PK.Pixel, x: fx0 - BRA * 0.5 + rng.range(-6, 6), y: fy0 + rng.range(-BRA, BRA),
            vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, ay: 520, drag: 0.8, max: rng.range(0.35, 0.8), s0: rng.range(1, 2.5), s1: 1,
            ramp: 'dew', r0: 0, r1: 0.7, a0: 1, a1: 0.3, k: 0.6, layer: 1,
          });
        }
        // The vapour shroud: the crumpled cone wraps round him (60 puffs streaming past his head, chest and legs).
        for (let i = 0; i < 60; i++) {
          // The cone's skin peeling round him: puffs fanned up and down along his fists, then streaming east past his
          // head, chest and hips (mostly behind him; a few wisps cross in front).
          const yy = rng.range(-1, 1);
          const front = rng.next() < 0.25;
          parts.spawn({
            kind: PK.Mist, x: fx0 + rng.range(-14, 6), y: fy0 + yy * 24, vx: rng.range(380, 760), vy: yy * rng.range(200, 560) - 30,
            drag: 2.2, max: rng.range(0.22, 0.4), s0: rng.range(5, 8), s1: rng.range(14, 24), k: 0.18, ramp: 'vapor', r0: 0.1, r1: 1,
            a0: rng.range(0.22, 0.4), a1: 0, layer: front ? 1 : 0,
          });
        }
        // Rings off the contact (ice and cobalt strokes).
        parts.spawn({ kind: PK.Ring, x: fx0 - 8, y: fy0, s0: 24, s1: 170, max: 0.085, ramp: 'dew', a0: 0.9, a1: 0, k: 1, layer: 1 });
        parts.spawn({ kind: PK.Ring, x: fx0 - 8, y: fy0, s0: 14, s1: 120, max: 0.075, ramp: 'cobalt', r0: 0.5, r1: 0.9, a0: 0.8, a1: 0, k: 1, add: false, layer: 1 });
      }
      // The skid: dust and dew kicked up at his boots while he ploughs back.
      if (t > T.stopEnd && t < T.dead + 0.02) {
        const [, p] = poseA(t);
        const j = joints(p);
        const [hx] = hipA(t);
        for (const toe of [j.toeN, j.toeF]) {
          if (rng.next() < 0.75) {
            parts.spawn({
              kind: PK.Smoke, x: hx + toe[0] * KA * FACE + rng.range(-6, 6), y: GROUND_A - 2, vx: rng.range(-140, -30), vy: rng.range(-60, -10), drag: 2,
              max: rng.range(0.4, 0.7), s0: 6, s1: 20, ramp: 'storm', r0: 0.1, r1: 0.6, a0: 0.45, a1: 0, add: false, layer: 1,
            });
            parts.spawn({
              kind: PK.Blade, x: hx + toe[0] * KA * FACE, y: GROUND_A - 2, vx: rng.range(-160, -40), vy: rng.range(-200, -80), ay: 700, drag: 1,
              vrot: rng.range(-14, 14), rot: rng.range(0, TAU), max: rng.range(0.4, 0.7), s0: 4, s1: 3, ramp: 'grass', r0: rng.next(), r1: rng.next(), a0: 1, a1: 1, add: false, layer: 1,
            });
          }
        }
        // More shroud streaming past him through the ramp.
        const [fx0, fy0] = fistsA(t);
        for (let i = 0; i < 2; i++)
          parts.spawn({
            kind: PK.Mist, x: fx0 + rng.range(0, 20), y: fy0 + rng.range(-30, 30), vx: rng.range(400, 800), vy: rng.range(-320, 320), drag: 2.2,
            max: rng.range(0.15, 0.3), s0: 6, s1: 18, k: 0.18, ramp: 'vapor', r0: 0.1, r1: 1, a0: 0.22, a1: 0, layer: 0,
          });
      }
      // The cone collapses into a curtain of falling dew: 120 drops condense out of its current bell over 0.18-0.24
      // (about 30 a frame) while it fades, so the curtain is the cone's own shape coming down.
      if (t >= DEW.t0 && fired.dew < DEW.n) {
        const want = Math.round(DEW.n * clamp((t - DEW.t0) / (T.dead - DEW.t0)));
        const b = ballA(t);
        const u0 = impactU(t);
        const cx = b.x - 6 * u0, bell = lerp(132, 168, ease.outQuad(u0)), len = lerp(400, 330, u0);
        const half = bell / 2, br = BRA * 1.15;
        for (; fired.dew < want; fired.dew++) {
          const u = rng.next();
          // The cone's half-width at u (vaporCone's profile): opens fast to the mouth, then narrows a little.
          const w = u < 0.22 ? lerp(br * 1.3, half, ease.outQuad(u / 0.22)) : lerp(half, half * 0.62, (u - 0.22) / 0.78);
          const x = cx - BRA * 0.6 - u * len;
          const y = b.y + rng.sign() * w * (0.3 + 0.7 * rng.next());
          const streak = rng.next() < 0.45;
          parts.spawn({
            kind: streak ? PK.Streak : PK.Pixel, x, y, vx: rng.range(-12, 12), vy: rng.range(20, 120), ay: 620, drag: 0.3,
            max: rng.range(0.4, 0.9), s0: streak ? 1 : rng.range(1, 2.2), s1: 1, k: 0.5, ramp: 'dew', r0: 0, r1: 0.6, a0: 0.95, a1: 0.35, layer: 1,
          });
        }
      }
      // THE DEAD STOP: the last of it drips off under the ball.
      if (!fired.dead && t >= T.dead) {
        fired.dead = true;
        const b = ballA(T.dead);
        dropletCurtain(env, b.x - 200, b.x - BRA, b.y - 20, 30, { ay: 520, spread: 6 });
      }
      return;
    }
    // ---- 7b
    if (!fired.cut) {
      fired.cut = true;
      // Hard cut: nothing from 7a carries over.
      parts.clear();
      cam.trauma = 0;
      cam.shakeAmp = 10;
      cam.shakeRoll = 0.01;
    }
    placeCamB(env, t);
    // The rumble builds: trauma 0.05 -> 0.25 from 0.95, 0.45 over the last 0.2 s.
    if (t >= T.alt) {
      const floor = t < T.edge ? lerp(0.05, 0.25, (t - T.alt) / (T.edge - T.alt)) : 0.45;
      if (cam.trauma < floor) cam.trauma = floor;
    }
    // Dew and blades flung ahead of the front: blades torn up at its foot, dew off its face.
    const [ox, oy] = shakeOff(env);
    const edgeAt = edgeFn(t, ox, oy);
    const g = wallGeo(t, oy);
    const z = cam.zoom;
    const n = t < T.alt ? 1 : t < T.kf4 ? 2 : 4;
    for (let i = 0; i < n; i++) {
      const foot = rng.next() < 0.6;
      const sy = foot ? rng.range(Math.max(HZB, g.base - 10), Math.max(HZB, g.base - 10) + 14) : rng.range(Math.max(0, g.top), Math.max(1, g.base));
      const sx = edgeAt(sy) + rng.range(0, 10);
      // Spawn in the base frame (particles draw under the 7b zoom).
      const bx = FOCUS_B.x + (sx - FOCUS_B.x) / z, by = FOCUS_B.y + (sy - FOCUS_B.y) / z;
      const blade = rng.next() < 0.5;
      parts.spawn({
        kind: blade ? PK.Blade : PK.Pixel, x: bx, y: by, vx: rng.range(260, 620), vy: rng.range(-220, -40), ay: 500, drag: 0.6,
        vrot: rng.range(-16, 16), rot: rng.range(0, TAU), max: rng.range(0.35, 0.7), s0: blade ? 4 : 1.5, s1: blade ? 3 : 1,
        ramp: blade ? 'grass' : 'dew', r0: blade ? 0 : 0, r1: blade ? 0.3 : 0.6, a0: 1, a1: 0.6, add: false, layer: 1,
      });
    }
    // The first breath of the oncoming air touches the hanging ball: its dew shivers off and drifts right.
    if (t >= T.alt && t < T.kf4) {
      for (let i = 0; i < 2; i++)
        parts.spawn({
          kind: PK.Pixel, x: BALL_B.x + 28, y: BALL_B.y + rng.range(-20, 20), vx: rng.range(120, 260), vy: rng.range(-30, 30), ay: 200,
          max: 0.4, s0: 2, s1: 1, ramp: 'dew', r0: 0, r1: 0.6, a0: 1, a1: 0.3, layer: 1,
        });
    }
  },
  render(env, t) {
    PUPPETS.frame();
    if (t < T.cut) renderA(env, t, spin);
    else renderB(env, t, spin);
  },
};
