// Skeletal pixel puppets. A pose is a set of joint angles; the puppet is rasterized
// from capsules into a PixelBuffer, so any pose (kick, leap, overhead volley, blown away)
// renders as clean pixel art in the same palette as the hand-drawn hero sprite.

import { PixelBuffer, pal3, pack, packRGB, OUTLINE, type Pal3 } from '../engine/pixel';
import { lerp, type RGB } from '../engine/math';

export interface Kit {
  skin: Pal3;
  hair: Pal3;
  shirt: Pal3;
  trim: number;
  shorts: Pal3;
  socks: Pal3;
  boots: Pal3;
  gloves?: Pal3;
  /** Hair style: spiky hero hair or short cut. */
  hairStyle: 'spiky' | 'short' | 'cap';
}

const H = (r: number, g: number, b: number): RGB => [r, g, b];

// Palette lifted directly from the No.10 sprite.
export const HERO_KIT: Kit = {
  skin: pal3(H(252, 185, 76), H(244, 147, 72), H(184, 80, 43)),
  hair: pal3(H(47, 44, 110), H(54, 34, 74), H(24, 4, 17)),
  shirt: pal3(H(240, 62, 50), H(223, 35, 33), H(133, 13, 25)),
  trim: pack(252, 185, 76),
  shorts: pal3(H(58, 82, 186), H(40, 60, 160), H(25, 28, 90)),
  socks: pal3(H(240, 62, 50), H(223, 35, 33), H(133, 13, 25)),
  boots: pal3(H(255, 255, 255), H(223, 218, 230), H(137, 128, 174)),
  hairStyle: 'spiky',
};

/** Teammate No.7 (winger who delivers the cross): home strip, short hair. */
export const WINGER_KIT: Kit = {
  ...HERO_KIT,
  skin: pal3(H(214, 150, 104), H(176, 110, 74), H(116, 66, 44)),
  hair: pal3(H(70, 52, 40), H(40, 28, 22), H(18, 10, 10)),
  hairStyle: 'short',
};

export const RIVAL_KIT: Kit = {
  skin: pal3(H(255, 214, 178), H(232, 172, 132), H(170, 110, 86)),
  hair: pal3(H(200, 150, 70), H(150, 98, 44), H(90, 54, 30)),
  shirt: pal3(H(255, 255, 255), H(214, 222, 236), H(130, 140, 170)),
  trim: pack(40, 190, 170),
  shorts: pal3(H(70, 78, 92), H(42, 46, 58), H(22, 22, 32)),
  socks: pal3(H(255, 255, 255), H(214, 222, 236), H(130, 140, 170)),
  boots: pal3(H(90, 230, 210), H(40, 190, 170), H(20, 110, 110)),
  hairStyle: 'short',
};

export const RIVAL_KIT_B: Kit = {
  ...RIVAL_KIT,
  skin: pal3(H(214, 150, 104), H(176, 110, 74), H(116, 66, 44)),
  hair: pal3(H(70, 60, 60), H(40, 32, 34), H(18, 12, 14)),
};

export const KEEPER_KIT: Kit = {
  skin: pal3(H(255, 214, 178), H(232, 172, 132), H(170, 110, 86)),
  hair: pal3(H(120, 120, 130), H(70, 70, 84), H(30, 30, 40)),
  shirt: pal3(H(196, 255, 90), H(140, 214, 50), H(60, 120, 40)),
  trim: pack(30, 30, 40),
  shorts: pal3(H(70, 70, 84), H(40, 40, 52), H(20, 20, 28)),
  socks: pal3(H(196, 255, 90), H(140, 214, 50), H(60, 120, 40)),
  boots: pal3(H(90, 90, 100), H(50, 50, 60), H(20, 20, 28)),
  gloves: pal3(H(255, 255, 255), H(255, 150, 50), H(190, 70, 30)),
  hairStyle: 'cap',
};

/** Darken a palette for limbs on the far side of the body. */
function far(p: Pal3): Pal3 {
  const d = (v: number) => {
    const r = v & 255, g = (v >>> 8) & 255, b = (v >>> 16) & 255;
    return pack(r * 0.72, g * 0.68, b * 0.8);
  };
  return [d(p[1]), d(p[2]), d(p[2])];
}

/**
 * Pose angles in radians. Facing right.
 *  - torso: lean of hip->neck from vertical (+ = forward).
 *  - thigh/upper arm: absolute angle from straight down (+ = swings forward).
 *  - knee/elbow: bend relative to the parent (+ = knee bends back / elbow bends forward).
 *  - foot: ankle angle relative to shin (0 = flat).
 */
export interface Pose {
  torso: number;
  head: number;
  thighN: number;
  kneeN: number;
  footN: number;
  thighF: number;
  kneeF: number;
  footF: number;
  armN: number;
  elbowN: number;
  armF: number;
  elbowF: number;
  /** Whole-body rotation around the hip (flips, tumbles). */
  spin: number;
}

export const P = (o: Partial<Pose>): Pose => ({
  torso: 0, head: 0, thighN: 0, kneeN: 0, footN: 0, thighF: 0, kneeF: 0, footF: 0,
  armN: 0, elbowN: 0, armF: 0, elbowF: 0, spin: 0, ...o,
});

export function mixPose(a: Pose, b: Pose, t: number): Pose {
  const o = {} as Pose;
  for (const k in a) (o as any)[k] = lerp((a as any)[k], (b as any)[k], t);
  return o;
}

/** Sample a pose track: [[time, pose], ...] with smoothstep blending. */
export function poseAt(track: [number, Pose][], t: number, e: (x: number) => number = (x) => x * x * (3 - 2 * x)): Pose {
  if (t <= track[0][0]) return track[0][1];
  for (let i = 1; i < track.length; i++) {
    if (t <= track[i][0]) {
      const [ta, pa] = track[i - 1], [tb, pb] = track[i];
      return mixPose(pa, pb, e((t - ta) / (tb - ta)));
    }
  }
  return track[track.length - 1][1];
}

// Library of poses -----------------------------------------------------------------
const D = Math.PI / 180;
export const POSES = {
  stand: P({ torso: 2 * D, thighN: 4 * D, thighF: -4 * D, kneeN: 4 * D, kneeF: 4 * D, armN: -8 * D, elbowN: 20 * D, armF: 10 * D, elbowF: 20 * D }),
  run1: P({ torso: 14 * D, thighN: 40 * D, kneeN: 70 * D, thighF: -30 * D, kneeF: 30 * D, footF: 10 * D, armN: -40 * D, elbowN: 80 * D, armF: 40 * D, elbowF: 70 * D, head: -6 * D }),
  run2: P({ torso: 12 * D, thighN: 5 * D, kneeN: 15 * D, thighF: 0, kneeF: 90 * D, armN: 0, elbowN: 70 * D, armF: 0, elbowF: 70 * D, head: -6 * D }),
  run3: P({ torso: 14 * D, thighN: -30 * D, kneeN: 30 * D, footN: 10 * D, thighF: 40 * D, kneeF: 70 * D, armN: 40 * D, elbowN: 70 * D, armF: -40 * D, elbowF: 80 * D, head: -6 * D }),
  run4: P({ torso: 12 * D, thighN: 0, kneeN: 90 * D, thighF: 5 * D, kneeF: 15 * D, armN: 0, elbowN: 70 * D, armF: 0, elbowF: 70 * D, head: -6 * D }),
  // Flick-up: plant & load, then a scooping lift with the near foot.
  flickLoad: P({ torso: -6 * D, head: 10 * D, thighN: -38 * D, kneeN: 70 * D, footN: 20 * D, thighF: 12 * D, kneeF: 30 * D, armN: 60 * D, elbowN: 30 * D, armF: -70 * D, elbowF: 20 * D }),
  flickHit: P({ torso: -10 * D, head: -14 * D, thighN: 28 * D, kneeN: 4 * D, footN: -15 * D, thighF: -6 * D, kneeF: 30 * D, armN: -60 * D, elbowN: 20 * D, armF: 80 * D, elbowF: 10 * D }),
  flickFollow: P({ torso: -26 * D, head: -34 * D, thighN: 118 * D, kneeN: 0, footN: -20 * D, thighF: 4 * D, kneeF: 18 * D, armN: -100 * D, elbowN: 10 * D, armF: 110 * D, elbowF: 10 * D }),
  // Super leap.
  crouch: P({ torso: 34 * D, head: -30 * D, thighN: 70 * D, kneeN: 120 * D, footN: -20 * D, thighF: 50 * D, kneeF: 110 * D, footF: -20 * D, armN: -50 * D, elbowN: 40 * D, armF: -60 * D, elbowF: 40 * D }),
  leap: P({ torso: -4 * D, head: -24 * D, thighN: 30 * D, kneeN: 80 * D, footN: 30 * D, thighF: -20 * D, kneeF: 30 * D, footF: 40 * D, armN: 160 * D, elbowN: 10 * D, armF: 140 * D, elbowF: 20 * D }),
  tuck: P({ torso: 30 * D, head: 20 * D, thighN: 120 * D, kneeN: 140 * D, footN: 20 * D, thighF: 100 * D, kneeF: 140 * D, armN: 60 * D, elbowN: 80 * D, armF: 50 * D, elbowF: 80 * D }),
  // Overhead volley: body horizontal, kicking leg whips over the top.
  ohLoad: P({ torso: -10 * D, head: -10 * D, thighN: -40 * D, kneeN: 80 * D, footN: 20 * D, thighF: 80 * D, kneeF: 20 * D, armN: 120 * D, elbowN: 20 * D, armF: -120 * D, elbowF: 20 * D }),
  ohStrike: P({ torso: -14 * D, head: 20 * D, thighN: 175 * D, kneeN: 0, footN: -25 * D, thighF: 40 * D, kneeF: 30 * D, armN: -90 * D, elbowN: 0, armF: 90 * D, elbowF: 10 * D }),
  // Keeper.
  gkReady: P({ torso: 22 * D, head: -14 * D, thighN: 30 * D, kneeN: 60 * D, footN: -10 * D, thighF: -10 * D, kneeF: 60 * D, armN: 60 * D, elbowN: 30 * D, armF: 50 * D, elbowF: 30 * D }),
  gkCatch: P({ torso: -6 * D, head: 6 * D, thighN: 40 * D, kneeN: 60 * D, thighF: -24 * D, kneeF: 20 * D, armN: 95 * D, elbowN: 10 * D, armF: 85 * D, elbowF: 14 * D }),
  gkStrain: P({ torso: -26 * D, head: 20 * D, thighN: 56 * D, kneeN: 70 * D, footN: -20 * D, thighF: -40 * D, kneeF: 10 * D, footF: 10 * D, armN: 92 * D, elbowN: 34 * D, armF: 88 * D, elbowF: 40 * D }),
  gkBlown: P({ torso: -60 * D, head: 50 * D, thighN: 60 * D, kneeN: 20 * D, thighF: 90 * D, kneeF: 40 * D, armN: 170 * D, elbowN: 10 * D, armF: -150 * D, elbowF: 30 * D }),
  // Defender block & blown away.
  blockJump: P({ torso: 6 * D, head: -10 * D, thighN: 30 * D, kneeN: 70 * D, footN: 20 * D, thighF: -10 * D, kneeF: 80 * D, armN: 150 * D, elbowN: 10 * D, armF: 130 * D, elbowF: 20 * D }),
  blown: P({ torso: -40 * D, head: 40 * D, thighN: 50 * D, kneeN: 30 * D, thighF: 100 * D, kneeF: 60 * D, armN: -150 * D, elbowN: 30 * D, armF: 160 * D, elbowF: 40 * D }),
  // Bicycle kick (CRIMSON CRESCENT). Authored facing right; the hero faces AWAY from goal
  // (facing -1 on the field), so negative spin tips him backward over his own head.
  bikePlant: P({ torso: -14 * D, head: -34 * D, thighN: 10 * D, kneeN: 40 * D, thighF: -10 * D, kneeF: 30 * D, armN: 40 * D, elbowN: 30 * D, armF: -40 * D, elbowF: 30 * D }),
  bikeRise: P({ torso: -24 * D, head: -36 * D, thighN: -24 * D, kneeN: 60 * D, footN: 10 * D, thighF: 96 * D, kneeF: 16 * D, footF: -10 * D, armN: 70 * D, elbowN: 20 * D, armF: -70 * D, elbowF: 30 * D, spin: -0.35 }),
  bikeScissor: P({ torso: -10 * D, head: -22 * D, thighN: 20 * D, kneeN: 70 * D, footN: 10 * D, thighF: 150 * D, kneeF: 6 * D, footF: -10 * D, armN: 100 * D, elbowN: 10 * D, armF: -100 * D, elbowF: 20 * D, spin: -1.15 }),
  bikeCock: P({ torso: -6 * D, head: -20 * D, thighN: -10 * D, kneeN: 110 * D, footN: 20 * D, thighF: 120 * D, kneeF: 10 * D, armN: -100 * D, elbowN: 20 * D, armF: -140 * D, elbowF: 20 * D, spin: -1.75 }),
  bikeStrike: P({ torso: -6 * D, head: -22 * D, thighN: 86 * D, kneeN: 0, footN: -16 * D, thighF: -12 * D, kneeF: 50 * D, armN: -120 * D, elbowN: 10 * D, armF: -150 * D, elbowF: 20 * D, spin: -2.0 }),
  bikeFollow: P({ torso: -10 * D, head: -14 * D, thighN: 120 * D, kneeN: 10 * D, footN: -20 * D, thighF: 10 * D, kneeF: 60 * D, armN: -130 * D, elbowN: 20 * D, armF: -160 * D, elbowF: 20 * D, spin: -2.5 }),
  // Landing after the bicycle kick: hands then a crouch.
  landHands: P({ torso: 50 * D, head: -40 * D, thighN: 60 * D, kneeN: 110 * D, footN: -10 * D, thighF: 40 * D, kneeF: 100 * D, armN: 40 * D, elbowN: 10 * D, armF: 20 * D, elbowF: 10 * D }),
  landCrouch: P({ torso: 30 * D, head: -20 * D, thighN: 80 * D, kneeN: 130 * D, footN: -20 * D, thighF: 30 * D, kneeF: 120 * D, footF: -10 * D, armN: 30 * D, elbowN: 40 * D, armF: -20 * D, elbowF: 40 * D }),
  // Keeper full-stretch dive (horizontal, arms ahead).
  gkDive: P({ torso: 0, head: -10 * D, thighN: 16 * D, kneeN: 20 * D, thighF: -16 * D, kneeF: 40 * D, armN: 176 * D, elbowN: 0, armF: 166 * D, elbowF: 4 * D, spin: 1.45 }),
  // Crosser: planting and whipping the ball in.
  crossKick: P({ torso: -12 * D, head: -6 * D, thighN: 80 * D, kneeN: 10 * D, footN: -10 * D, thighF: -6 * D, kneeF: 24 * D, armN: -70 * D, elbowN: 20 * D, armF: 90 * D, elbowF: 10 * D }),
  celebrate: P({ torso: -6 * D, head: -20 * D, thighN: 20 * D, kneeN: 60 * D, thighF: -10 * D, kneeF: 30 * D, armN: 175 * D, elbowN: 0, armF: 30 * D, elbowF: 100 * D }),
};

// Skeleton dimensions (units; standing hero ~100u tall).
const TORSO = 28, THIGH = 19, SHIN = 18, FOOT = 8, UARM = 13, LARM = 12, HEAD_R = 12;

export interface Joints {
  hip: [number, number];
  neck: [number, number];
  head: [number, number];
  kneeN: [number, number];
  ankleN: [number, number];
  toeN: [number, number];
  toeF: [number, number];
  handN: [number, number];
  handF: [number, number];
}

/** Joint positions in puppet units relative to the hip (facing right, spin applied). */
export function joints(pose: Pose): Joints {
  const dir = (a: number): [number, number] => [Math.sin(a), Math.cos(a)];
  const up = (a: number): [number, number] => [Math.sin(a), -Math.cos(a)];
  const td = up(pose.torso);
  const neck: [number, number] = [td[0] * TORSO, td[1] * TORSO];
  const sh: [number, number] = [neck[0] - td[0] * 4, neck[1] - td[1] * 4];
  const hd = up(pose.torso + pose.head);
  const head: [number, number] = [neck[0] + hd[0] * (HEAD_R - 1), neck[1] + hd[1] * (HEAD_R - 1)];
  const leg = (thigh: number, knee: number, foot: number, off: number) => {
    const d1 = dir(thigh);
    const kn: [number, number] = [off + d1[0] * THIGH, 3 + d1[1] * THIGH];
    const d2 = dir(thigh - knee);
    const an: [number, number] = [kn[0] + d2[0] * SHIN, kn[1] + d2[1] * SHIN];
    const d3 = dir(thigh - knee + Math.PI / 2 - foot);
    const toe: [number, number] = [an[0] + d3[0] * FOOT, an[1] + d3[1] * FOOT];
    return { kn, an, toe };
  };
  const arm = (a: number, e: number) => {
    const d1 = dir(a);
    const el: [number, number] = [sh[0] + d1[0] * UARM, sh[1] + d1[1] * UARM];
    const d2 = dir(a + e);
    return [el[0] + d2[0] * LARM, el[1] + d2[1] * LARM] as [number, number];
  };
  const ln = leg(pose.thighN, pose.kneeN, pose.footN, 2);
  const lf = leg(pose.thighF, pose.kneeF, pose.footF, -2);
  const cs = Math.cos(pose.spin), sn = Math.sin(pose.spin);
  const R = (p: [number, number]): [number, number] => [p[0] * cs - p[1] * sn, p[0] * sn + p[1] * cs];
  return {
    hip: [0, 0],
    neck: R(neck),
    head: R(head),
    kneeN: R(ln.kn),
    ankleN: R(ln.an),
    toeN: R(ln.toe),
    toeF: R(lf.toe),
    handN: R(arm(pose.armN, pose.elbowN)),
    handF: R(arm(pose.armF, pose.elbowF)),
  };
}

/** Convert a joint (units) to world, given hip world pos, px-per-unit k, draw scale D, facing. */
export function jointWorld(j: [number, number], hipX: number, hipY: number, k: number, D: number, facing = 1): [number, number] {
  return [hipX + j[0] * k * D * facing, hipY + j[1] * k * D];
}

/** Draw a rendered puppet so its hip lands at (x,y). D = world px per puppet px. */
export function drawPuppet(ctx: CanvasRenderingContext2D, r: { cv: HTMLCanvasElement; ox: number; oy: number }, x: number, y: number, D: number, alpha = 1) {
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = alpha;
  ctx.drawImage(r.cv, x - r.ox * D, y - r.oy * D, r.cv.width * D, r.cv.height * D);
  ctx.globalAlpha = 1;
}

interface Opts {
  /** Pixels per unit. */
  k: number;
  /** -1 to face left. */
  facing?: 1 | -1;
  silhouette?: { fill: RGB; rim: RGB; rim2: RGB; lx: number; ly: number };
  /** Bigger hands for keepers. */
  heatTint?: { c: RGB; a: number };
}

const cache = new Map<string, PixelBuffer>();

/**
 * Render a puppet. Returns the canvas and the pixel offset of the hip inside it,
 * so callers can place the hip at a world position.
 */
export function renderPuppet(kit: Kit, pose: Pose, o: Opts): { cv: HTMLCanvasElement; ox: number; oy: number } {
  const k = o.k;
  const facing = o.facing ?? 1;
  const size = Math.ceil(140 * k) + 6;
  const key = `${size}`;
  let buf = cache.get(key + kit.hairStyle + (o.silhouette ? 's' : ''));
  if (!buf) {
    buf = new PixelBuffer(size, size);
    cache.set(key + kit.hairStyle + (o.silhouette ? 's' : ''), buf);
  }
  buf.clear();
  const ox = size / 2, oy = size / 2;
  buf.lx = -0.35 * facing;
  buf.ly = -0.9;

  // Local -> pixel transform with whole-body spin and facing mirror.
  const cs = Math.cos(pose.spin), sn = Math.sin(pose.spin);
  const T = (x: number, y: number): [number, number] => {
    const rx = x * cs - y * sn, ry = x * sn + y * cs;
    return [ox + rx * k * facing, oy + ry * k];
  };
  // Angle helpers: limbs hang down (0,1); positive angle swings forward (+x).
  const dir = (a: number): [number, number] => [Math.sin(a), Math.cos(a)];
  const up = (a: number): [number, number] => [Math.sin(a), -Math.cos(a)];

  const hip: [number, number] = [0, 0];
  const td = up(pose.torso);
  const neck: [number, number] = [td[0] * TORSO, td[1] * TORSO];
  const shoulder: [number, number] = [neck[0] - td[0] * 4, neck[1] - td[1] * 4];
  const headA = pose.torso + pose.head;
  const hd = up(headA);
  const headC: [number, number] = [neck[0] + hd[0] * (HEAD_R - 1), neck[1] + hd[1] * (HEAD_R - 1)];

  const leg = (thigh: number, knee: number, foot: number, hipOff: number) => {
    const h0: [number, number] = [hip[0] + hipOff, hip[1] + 3];
    const d1 = dir(thigh);
    const kn: [number, number] = [h0[0] + d1[0] * THIGH, h0[1] + d1[1] * THIGH];
    const d2 = dir(thigh - knee);
    const an: [number, number] = [kn[0] + d2[0] * SHIN, kn[1] + d2[1] * SHIN];
    // foot points forward, perpendicular to shin
    const fa = thigh - knee + Math.PI / 2 - foot;
    const d3 = dir(fa);
    const toe: [number, number] = [an[0] + d3[0] * FOOT, an[1] + d3[1] * FOOT];
    return { h0, kn, an, toe };
  };
  const arm = (a: number, elbow: number) => {
    const d1 = dir(a);
    const el: [number, number] = [shoulder[0] + d1[0] * UARM, shoulder[1] + d1[1] * UARM];
    const d2 = dir(a + elbow);
    const ha: [number, number] = [el[0] + d2[0] * LARM, el[1] + d2[1] * LARM];
    return { el, ha };
  };

  const r = (u: number) => Math.max(0.8, u * k);
  const cap = (a: [number, number], b: [number, number], rad: number, p: Pal3 | number) => {
    const [ax, ay] = T(a[0], a[1]);
    const [bx, by] = T(b[0], b[1]);
    buf!.capsule(ax, ay, bx, by, r(rad), p);
  };
  const at = (a: [number, number], b: [number, number], t: number): [number, number] => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

  const drawLeg = (L: ReturnType<typeof leg>, farSide: boolean) => {
    const sk = farSide ? far(kit.skin) : kit.skin;
    const so = farSide ? far(kit.socks) : kit.socks;
    const bo = farSide ? far(kit.boots) : kit.boots;
    const sh = farSide ? far(kit.shorts) : kit.shorts;
    const knee70 = at(L.kn, L.an, 0.35);
    // outlines
    cap(L.h0, L.kn, 5.4 + 1 / k, OUTLINE);
    cap(L.kn, L.an, 4.4 + 1 / k, OUTLINE);
    cap(L.an, L.toe, 3.8 + 1 / k, OUTLINE);
    // fills
    cap(L.h0, L.kn, 5.4, sk);
    cap(L.h0, at(L.h0, L.kn, 0.42), 6.2, sh);
    cap(L.kn, knee70, 4.4, sk);
    cap(knee70, L.an, 4.4, so);
    cap(L.an, L.toe, 3.8, bo);
  };
  const drawArm = (A: ReturnType<typeof arm>, farSide: boolean) => {
    const sk = farSide ? far(kit.skin) : kit.skin;
    const st = farSide ? far(kit.shirt) : kit.shirt;
    const gl = kit.gloves ? (farSide ? far(kit.gloves) : kit.gloves) : null;
    const handR = gl ? 4.6 : 3.4;
    cap(shoulder, A.el, 3.6 + 1 / k, OUTLINE);
    cap(A.el, A.ha, 3.2 + 1 / k, OUTLINE);
    cap(A.ha, A.ha, handR + 1 / k, OUTLINE);
    cap(shoulder, A.el, 3.6, sk);
    cap(shoulder, at(shoulder, A.el, 0.5), 5, st);
    cap(A.el, A.ha, 3.2, gl && k > 0 ? sk : sk);
    cap(A.ha, A.ha, handR, gl || sk);
  };

  const legN = leg(pose.thighN, pose.kneeN, pose.footN, 2);
  const legF = leg(pose.thighF, pose.kneeF, pose.footF, -2);
  const armN = arm(pose.armN, pose.elbowN);
  const armF = arm(pose.armF, pose.elbowF);

  // Back to front: far arm, far leg, torso, head, near leg, near arm.
  drawArm(armF, true);
  drawLeg(legF, true);

  // Torso
  const chest = at(hip, neck, 0.62);
  const waistA: [number, number] = [hip[0], hip[1] + 2];
  const waistB: [number, number] = [hip[0] + td[0] * 3, hip[1] + td[1] * 3 + 2];
  cap(hip, neck, 9.2 + 1 / k, OUTLINE);
  cap(waistA, waistB, 9.6 + 1 / k, OUTLINE);
  cap(hip, neck, 9.2, kit.shirt);
  cap(chest, neck, 8.4, kit.shirt);
  cap(waistA, waistB, 9.6, kit.shorts);
  // collar trim
  {
    const [cx, cy] = T(neck[0] + td[0] * 1, neck[1] + td[1] * 1);
    buf.circle(cx, cy, r(3.4), kit.trim);
  }
  // neck
  cap(neck, at(neck, headC, 0.4), 3.4, kit.skin);

  // Head: skull + jaw, hair, ear, face. Offsets are head-local (x = facing direction).
  const fa = headA + pose.spin;
  const ca = Math.cos(fa), sa = Math.sin(fa);
  const [hx, hy] = T(headC[0], headC[1]);
  const Hd = (x: number, y: number): [number, number] => [hx + (x * ca - y * sa) * k * facing, hy + (x * sa + y * ca) * k];
  const dot = (p: [number, number], rad: number, c: Pal3 | number) => buf!.circle(p[0], p[1], rad, c);
  const line = (a: [number, number], b: [number, number], rad: number, c: number) => buf!.capsule(a[0], a[1], b[0], b[1], rad, c);
  dot(Hd(0, 0), r(HEAD_R) + 1, OUTLINE);
  dot(Hd(4.5, 5), r(7.5) + 1, OUTLINE);
  dot(Hd(0, 0), r(HEAD_R), kit.skin);
  dot(Hd(4.5, 5), r(7.5), kit.skin);
  dot(Hd(11.6, 0.8), r(1.4), kit.skin);
  drawHair(buf, kit, hx, hy, fa, k, facing);
  // ear
  if (k > 0.6) {
    dot(Hd(-1.6, 1.6), r(2.4), kit.skin[2]);
    dot(Hd(-1.2, 1.4), r(1.3), kit.skin[1]);
  }
  // eye (determined, anime-style), brow, mouth
  const thin = Math.max(0.55, 0.75 * k);
  if (k > 0.6) {
    const e0 = Hd(6.6, -2.4), e1 = Hd(6.6, 1.4);
    line(e0, e1, Math.max(0.9, 1.1 * k), OUTLINE);
    const hl = Hd(7.4, -1.6);
    buf.set(hl[0], hl[1], pack(255, 255, 255));
    line(Hd(3.2, -6.4), Hd(10.6, -4.2), Math.max(0.7, 1.0 * k), OUTLINE);
    line(Hd(8.6, 6.2), Hd(10.6, 5.6), thin, kit.skin[2]);
  } else {
    const e = Hd(6.8, -0.6);
    buf.set(e[0], e[1], OUTLINE);
    buf.set(e[0], e[1] - 1, OUTLINE);
  }

  drawLeg(legN, false);
  drawArm(armN, false);

  buf.outline();
  if (o.silhouette) {
    const s = o.silhouette;
    buf.silhouette(packRGB(s.fill), packRGB(s.rim), packRGB(s.rim2), s.lx, s.ly);
  } else if (o.heatTint) {
    buf.tint(o.heatTint.c, o.heatTint.a);
  }
  return { cv: buf.flush(), ox, oy };
}

function drawHair(buf: PixelBuffer, kit: Kit, hx: number, hy: number, ang: number, k: number, facing: number) {
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const tr = (x: number, y: number): [number, number] => [hx + (x * ca - y * sa) * k * facing, hy + (x * sa + y * ca) * k];
  let pts: number[];
  if (kit.hairStyle === 'spiky') {
    // Wild spikes swept up and back, echoing the sprite's silhouette.
    const raw = [
      [13, -4], [17, -1], [11, -8], [15, -12], [7, -12], [6, -21], [0, -15], [-5, -27], [-7, -15],
      [-18, -24], [-13, -11], [-27, -14], [-16, -5], [-26, 0], [-15, 2], [-20, 9], [-10, 7], [-7, 2],
      [-4, -3], [3, -6], [9, -6],
    ];
    pts = raw.flatMap(([x, y]) => tr(x, y));
  } else if (kit.hairStyle === 'cap') {
    const raw = [[12, -2], [16, -4], [10, -8], [6, -12], [-4, -13], [-11, -8], [-13, 0], [-8, 2], [-4, -4], [6, -5]];
    pts = raw.flatMap(([x, y]) => tr(x, y));
  } else {
    const raw = [[11, -4], [9, -11], [2, -14], [-6, -13], [-12, -7], [-13, 2], [-9, 6], [-7, 0], [-2, -5], [6, -7]];
    pts = raw.flatMap(([x, y]) => tr(x, y));
  }
  // outline pass: draw slightly inflated polygon
  const cx = hx, cy = hy;
  const infl: number[] = [];
  for (let i = 0; i < pts.length; i += 2) {
    const dx = pts[i] - cx, dy = pts[i + 1] - cy;
    const l = Math.hypot(dx, dy) || 1;
    infl.push(pts[i] + (dx / l) * 1.2, pts[i + 1] + (dy / l) * 1.2);
  }
  buf.poly(infl, OUTLINE);
  const [hi, mid, lo] = kit.hair;
  buf.poly(pts, (x, y) => {
    const dx = x - cx, dy = y - cy;
    const d = (dx * -0.4 * facing + dy * -0.9) / (HEAD_R * k);
    // streaks for texture
    const streak = ((x * 3 + y * 5) & 7) === 0;
    return d > 0.7 ? hi : d > 0.1 ? (streak ? hi : mid) : streak ? mid : lo;
  });
}
