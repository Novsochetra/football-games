// SHOT 7 — FINGERTIPS: chase/side camera at keeper height under a dutch angle. The green
// keeper explodes off his line into a full-stretch dive at the crimson comet. Time all but
// stops (indigo/silver freeze, turf and sparks hanging in the air) while the camera pushes in
// on the sliver of night between his glove and the ball: one orbiting crescent blade scrapes
// his fingertips in a slow shower of silver sparks... the next one rips the glove clean off.
// Time snaps back to 1x: the ball blazes past on its crescent arc, the camera whips after it
// and rolls level, and the keeper keeps falling, bare-handed, under the crimson trail.

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { TAU, clamp, ease, lerp } from '../../engine/math';
import { PK, drawGlow, glowOf, glowSprite } from '../../engine/particles';
import { BallSpin, OUTLINE, PixelBuffer, pack, pal3, type Pal3 } from '../../engine/pixel';
import { focusLines, ribbon, sparkle, speedStreaks, type TrailPt } from '../../art/fx';
import { KEEPER_KIT, POSES, drawPuppet, joints, jointWorld, poseAt, renderPuppet, type Kit, type Pose } from '../../art/puppet';
import { crescentArc, crescentPath, crimsonRibbon, drawBall, meteorFlames, pulse, ring } from './common';

const DUR = 1.7;
const SLOW0 = 0.2; // slow motion starts to bite
const SLOW1 = 0.36; // fully frozen
const SLOW_RATE = 0.06;
const SCRAPE = 0.56; // blade A grazes the fingertips
const CLOSE = 0.78; // ball at its closest to the glove
const RIP = 1.0; // blade B rips the glove off
const HOLD = 0.05; // hit-stop on the rip
const SNAP = RIP + HOLD; // time snaps back to 1x
const GROUND = 330;
const K = 1, D = 2;
const FACING = -1 as const;
const BALL_R = 6;
const DEG = Math.PI / 180;
const GOAL_X = 680, BAR_Y = GROUND - 250, NET_D = 190;

// ---------------------------------------------------------------- time
function rateAt(t: number) {
  if (t < SLOW0) return 1;
  if (t < SLOW1) return lerp(1, SLOW_RATE, ease.outCubic((t - SLOW0) / (SLOW1 - SLOW0)));
  if (t < RIP) return SLOW_RATE;
  if (t < SNAP) return 0.012;
  return 1;
}
/** Simulation clock (integral of the rate): every keyframed motion runs on it, so it all slows together. */
const TAB_N = 1700;
const SIM = (() => {
  const a = new Float64Array(TAB_N + 1);
  for (let i = 1; i <= TAB_N; i++) {
    const t0 = ((i - 1) / TAB_N) * DUR, t1 = (i / TAB_N) * DUR;
    a[i] = a[i - 1] + rateAt((t0 + t1) / 2) * (t1 - t0);
  }
  return a;
})();
function simAt(t: number) {
  const f = clamp(t / DUR) * TAB_N;
  const i = Math.min(TAB_N - 1, Math.floor(f));
  return lerp(SIM[i], SIM[i + 1], f - i);
}
const S_SCRAPE = simAt(SCRAPE), S_CLOSE = simAt(CLOSE), S_RIP = simAt(RIP);

// ---------------------------------------------------------------- keeper
const KEEPER_BARE: Kit = { ...KEEPER_KIT, gloves: undefined };
const READY: Pose = POSES.gkReady;
const PUSH: Pose = {
  ...POSES.gkReady, torso: 30 * DEG, head: -24 * DEG, thighN: 8 * DEG, kneeN: 26 * DEG, footN: -30 * DEG,
  thighF: -36 * DEG, kneeF: 24 * DEG, footF: -24 * DEG, armN: 150 * DEG, elbowN: 22 * DEG, armF: 128 * DEG, elbowF: 30 * DEG, spin: 0.32,
};
const REACH: Pose = {
  ...POSES.gkDive, head: -6 * DEG, thighN: 22 * DEG, kneeN: 34 * DEG, thighF: -10 * DEG, kneeF: 56 * DEG,
  armN: 238 * DEG, elbowN: 0, armF: 150 * DEG, elbowF: 16 * DEG, spin: 1.3,
};
const DIVE: Pose = {
  ...POSES.gkDive, head: 4 * DEG, thighN: 12 * DEG, kneeN: 16 * DEG, thighF: -18 * DEG, kneeF: 38 * DEG,
  armN: 250 * DEG, elbowN: 0, armF: 150 * DEG, elbowF: 8 * DEG, spin: 1.5,
};
const FALL: Pose = {
  ...DIVE, head: 12 * DEG, thighN: 36 * DEG, kneeN: 54 * DEG, thighF: -2 * DEG, kneeF: 84 * DEG,
  armN: 252 * DEG, elbowN: 12 * DEG, armF: 118 * DEG, elbowF: 46 * DEG, spin: 1.85,
};
const TRACK: [number, Pose][] = [
  [0, READY], [0.05, PUSH], [0.16, REACH], [S_RIP, DIVE], [S_RIP + 0.05, DIVE], [S_RIP + 0.6, FALL],
];

const FT_LEN = 9 * K * D; // palm centre -> fingertips
interface Hand { x: number; y: number; dx: number; dy: number; ang: number; ftx: number; fty: number }
/** Hand (palm centre) in world space, forearm direction and fingertip point. */
function handOf(p: Pose, hx: number, hy: number, near: boolean): Hand {
  const j = joints(p);
  const [x, y] = jointWorld(near ? j.handN : j.handF, hx, hy, K, D, FACING);
  const a = near ? p.armN + p.elbowN : p.armF + p.elbowF;
  const sx = Math.sin(a), sy = Math.cos(a);
  const cs = Math.cos(p.spin), sn = Math.sin(p.spin);
  const dx = (sx * cs - sy * sn) * FACING, dy = sx * sn + sy * cs;
  return { x, y, dx, dy, ang: Math.atan2(dy, dx), ftx: x + dx * FT_LEN, fty: y + dy * FT_LEN };
}

// The near-miss point: his fingertips at full stretch.
const CX = 392, CY = 134;
const H_DIVE = handOf(DIVE, 0, 0, true);
const H1X = CX - H_DIVE.ftx, H1Y = CY - H_DIVE.fty;
const H0X = H1X + 52;
const H0Y = (() => {
  const j = joints(READY);
  return GROUND - (Math.max(j.toeN[1], j.toeF[1], j.ankleN[1]) + 2.5) * K * D;
})();

function hipAt(s: number): [number, number] {
  if (s <= S_RIP) {
    const dip = s < 0.05 ? Math.sin(clamp(s / 0.05) * Math.PI) * 6 : 0;
    const u = clamp((s - 0.025) / (S_RIP - 0.025));
    return [lerp(H0X, H1X, ease.outQuad(u)), lerp(H0Y, H1Y, ease.outCubic(u)) + dip];
  }
  const d = s - S_RIP;
  return [H1X - 70 * d, H1Y - 50 * d + 170 * d * d];
}

// ---------------------------------------------------------------- ball on its crescent arc
const GAP = 25; // ball centre to fingertips at the closest point
const PR = 1000; // arc radius (the path bows over his hand)
const V1 = 1250, V2 = 1550; // px per sim-second, before / after the rip
const TOP_X = CX + 2, TOP_Y = CY - GAP;
function arcLen(s: number) {
  return s <= S_RIP ? V1 * (s - S_CLOSE) : V1 * (S_RIP - S_CLOSE) + V2 * (s - S_RIP);
}
function arcPt(l: number): [number, number] {
  const th = l / PR;
  return [TOP_X + PR * Math.sin(th), TOP_Y + PR * (1 - Math.cos(th))];
}
function ballAt(s: number) {
  const l = arcLen(s);
  const [x, y] = arcPt(l);
  return { x, y, dir: l / PR };
}

// Crescent blades orbiting the ball (clockwise). Phase/speed solved so blade A crosses the
// fingertips at SCRAPE and blade B (opposite) exactly at RIP.
const ORB = 21, BLADE_R = 10, BLADE_BITE = 0.52;
function gloveDir(t: number) {
  const s = simAt(t);
  const [hx, hy] = hipAt(s);
  const h = handOf(poseAt(TRACK, s), hx, hy, true);
  const b = ballAt(s);
  return Math.atan2(h.fty - b.y, h.ftx - b.x);
}
const [PHI0, OMEGA] = (() => {
  const g1 = gloveDir(SCRAPE), g2 = gloveDir(RIP);
  let d = g2 - Math.PI - g1;
  d = ((d % TAU) + TAU) % TAU;
  let om = d / (S_RIP - S_SCRAPE);
  if (om < 90) om += TAU / (S_RIP - S_SCRAPE);
  return [g1 - om * S_SCRAPE, om];
})();

// Torn glove: during the hit-stop it is already peeling off his fingers; then it is flung up and
// back over his head (off the arm axis, away from the ball's path), tumbling. A glove is light:
// a hard pop, heavy drag, then it flutters down (closed form).
const GL0 = (() => {
  const h = handOf(DIVE, H1X, H1Y, true);
  const a = h.ang - 1.1;
  const v = 950;
  return { x: h.x, y: h.y, ang: h.ang, dir: a, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120 };
})();
const GK = 5, GG = 800, GL_SLIDE = 10;
const S_SNAP = simAt(SNAP);
function gloveAt(s: number) {
  const tau = Math.max(0, s - S_RIP);
  const e = 1 - Math.exp(-GK * tau);
  const sl = GL_SLIDE * ease.outCubic(clamp(tau / (S_SNAP - S_RIP)));
  return {
    x: GL0.x + Math.cos(GL0.dir) * sl + (GL0.vx / GK) * e,
    y: GL0.y + Math.sin(GL0.dir) * sl + (GG / GK) * tau + ((GL0.vy - GG / GK) / GK) * e,
    ang: GL0.ang + 0.25 * (sl / GL_SLIDE) + 30 * tau - 8 * tau * tau,
  };
}

// ---------------------------------------------------------------- camera
const CAM0 = { x: 452, y: 206 };
const PUSH_C = { x: CX + 4, y: CY + 8, z: 1.7, r: 0.18 };
const CREEP_C = { x: CX + 2, y: CY + 4, z: 1.85, r: 0.22 };
const END_C = { x: 496, y: 200, z: 1.14, r: -0.03 };
function camAt(t: number) {
  const a = clamp(t / 0.2);
  const x0 = CAM0.x - 8 * a, y0 = CAM0.y, z0 = 1 + 0.05 * a, r0 = 0.1;
  const u = ease.inOutCubic(clamp((t - 0.2) / 0.42));
  const v = ease.inOutQuad(clamp((t - 0.62) / 0.4));
  let x = lerp(lerp(x0, PUSH_C.x, u), CREEP_C.x, v), y = lerp(lerp(y0, PUSH_C.y, u), CREEP_C.y, v);
  let z = lerp(lerp(z0, PUSH_C.z, u), CREEP_C.z, v);
  let r = lerp(lerp(r0, PUSH_C.r, u), CREEP_C.r, v);
  if (t > SNAP) {
    const w = ease.outCubic(clamp((t - SNAP) / 0.42));
    x = lerp(x, END_C.x, w) + Math.max(0, t - SNAP - 0.2) * 16;
    y = lerp(y, END_C.y, w);
    z = lerp(z, END_C.z, w) - Math.max(0, t - SNAP - 0.2) * 0.06;
    r = lerp(r, END_C.r, w);
  }
  return { x, y, z, r };
}
/** Whip speed 0..1 (drives streaks, radial blur, smear). */
const whipAt = (t: number) => (t < SNAP ? 0 : Math.pow(clamp(1 - (t - SNAP) / 0.4), 2));
function freezeAt(t: number) {
  if (t < SLOW0) return 0;
  if (t < SNAP) return ease.outCubic(clamp((t - SLOW0) / 0.22));
  return clamp(1 - (t - SNAP) / 0.1);
}

// ---------------------------------------------------------------- module state
let spin = new BallSpin();
let launched = false, dropped = false, frozen = false, scraped = false, ripped = false;
let contact = 0;
let prevBX = 0, prevBY = 0, hasPrev = false;
const trailPts: TrailPt[] = Array.from({ length: 26 }, () => ({ x: 0, y: 0 }));
const glovePts: TrailPt[] = Array.from({ length: 8 }, () => ({ x: 0, y: 0 }));

// Hand sprites (pixel-rasterized each frame at any angle, same pixel grid as the puppet).
const HB = 30;
let bufA: PixelBuffer | null = null, bufB: PixelBuffer | null = null, bufC: PixelBuffer | null = null;
const GLOVE_PAL: Pal3 = pal3([246, 247, 255], [204, 208, 228], [128, 132, 172]);
const GLOVE_FAR: Pal3 = pal3([190, 194, 214], [150, 152, 180], [96, 96, 132]);
const CUFF_PAL: Pal3 = pal3([255, 172, 76], [240, 120, 44], [168, 58, 26]);
const CUFF_FAR: Pal3 = pal3([196, 120, 60], [168, 84, 36], [110, 40, 22]);
const HOT = pack(255, 64, 112);
const HOT2 = pack(255, 214, 228);

/** Rasterize an open glove (or bare hand) pointing along `ang`; palm centre at the buffer centre. */
function handSprite(buf: PixelBuffer, ang: number, kind: 'glove' | 'far' | 'bare', nick: number): HTMLCanvasElement {
  buf.clear();
  buf.lx = 0.35;
  buf.ly = -0.9;
  const c = HB / 2;
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const P = (x: number, y: number): [number, number] => [c + x * ca - y * sa, c + x * sa + y * ca];
  const cap = (ax: number, ay: number, bx: number, by: number, r: number, p: Pal3 | number) => {
    const a = P(ax, ay), b = P(bx, by);
    buf.capsule(a[0], a[1], b[0], b[1], r, p);
  };
  if (kind === 'bare') {
    const sk = KEEPER_KIT.skin;
    cap(-5.5, 0, -2.5, 0, 2.6, sk);
    cap(-2.4, 0, 0.6, 0, 3.3, sk);
    const L = [4.4, 5.2, 4.9, 3.8];
    for (let i = 0; i < 4; i++) cap(1.2, -2.3 + 1.55 * i, 1.2 + L[i], -4.1 + 2.7 * i, 0.85, sk);
    cap(-1, -2.6, 1.8, -5.6, 0.95, sk);
    // Scorched fingertips.
    for (let i = 0; i < 4; i++) {
      const p = P(1.2 + L[i] - 0.4, -4.1 + 2.7 * i);
      buf.set(p[0], p[1], HOT);
    }
  } else {
    const pal = kind === 'far' ? GLOVE_FAR : GLOVE_PAL;
    cap(-7, 0, -4.4, 0, 3.9, kind === 'far' ? CUFF_FAR : CUFF_PAL);
    cap(-3.6, 0, 1, 0, 4.3, pal);
    const L = [6, 7, 6.6, 5.4];
    for (let i = 0; i < 4; i++) cap(1.4, -2.85 + 1.9 * i, 1.4 + L[i], -5 + 3.3 * i, 1.0, pal);
    cap(-1.2, -3.4, 1.8, -7.6, 1.15, pal);
    // Finger gaps.
    for (let i = 0; i < 3; i++) {
      const m0 = -2.85 + 1.9 * (i + 0.5), m1 = -5 + 3.3 * (i + 0.5);
      const l = Math.min(L[i], L[i + 1]) + 1;
      cap(3.6, lerp(m0, m1, 0.25), 1.4 + l, m1, 0.45, OUTLINE);
    }
    if (nick > 0) {
      // A nick burned across the fingertips by the first pass (glowing while the blade bites).
      cap(5.2, -5.4, 6.4, 4.2, 0.5, OUTLINE);
      if (nick > 0.5) cap(5.9, -5.2, 7.1, 4.4, 0.5, nick > 0.8 ? HOT2 : HOT);
    }
  }
  buf.outline();
  return buf.flush();
}
function drawSprite(ctx: CanvasRenderingContext2D, cv: HTMLCanvasElement, x: number, y: number) {
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(cv, Math.round(x - (HB / 2) * D), Math.round(y - (HB / 2) * D), HB * D, HB * D);
}

// ---------------------------------------------------------------- backdrop
/** Parallax layer: horizontal truck at factor `fx`, vertical follows the tilt, partial zoom `fz`. */
function layer(env: Env, fx: number, fz: number) {
  const { ctx, cam } = env;
  env.world();
  const bz = 1 + (cam.zoom - 1) * fz;
  const bx = CAM0.x + (cam.x - CAM0.x) * fx;
  ctx.translate(cam.x, cam.y);
  ctx.scale(bz / cam.zoom, bz / cam.zoom);
  ctx.translate(-bx, -cam.y);
}

const MOON_X = 590, MOON_Y = 54, MOON_R = 15;

function drawSky(env: Env, t: number, s: number) {
  const { ctx } = env;
  const st = env.art.stadium;
  layer(env, 0.08, 0.25);
  const sky = ctx.createLinearGradient(0, -200, 0, 200);
  sky.addColorStop(0, '#020108');
  sky.addColorStop(0.5, '#0a0722');
  sky.addColorStop(0.85, '#1a1044');
  sky.addColorStop(1, '#28184e');
  ctx.fillStyle = sky;
  ctx.fillRect(-900, -900, 2600, 1500);
  // Stars (frozen with the clock).
  ctx.fillStyle = '#dfe4ff';
  for (const p of st.stars) {
    const x = (p.x % 1300) - 200;
    const y = ((p.y + 1400) % 320) - 190;
    if (y > 135) continue;
    ctx.globalAlpha = p.b * (0.55 + 0.45 * Math.sin(s * 9 + p.x));
    ctx.fillRect(Math.round(x), Math.round(y), 1, p.b > 0.85 ? 2 : 1);
  }
  ctx.globalAlpha = 1;
  // Crescent moon: halo, earthshine disk, crisp lit crescent (same phase as the other shots).
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf([120, 130, 230]), MOON_X, MOON_Y, MOON_R * 5, 0.28);
  drawGlow(ctx, glowOf([220, 228, 255]), MOON_X, MOON_Y, MOON_R * 2.2, 0.22);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(40,40,90,0.55)';
  ctx.beginPath();
  ctx.arc(MOON_X, MOON_Y, MOON_R, 0, TAU);
  ctx.fill();
  ctx.save();
  crescentPath(ctx, MOON_X, MOON_Y, MOON_R, 0.62, -0.75);
  ctx.clip();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(st.moon, MOON_X - MOON_R, MOON_Y - MOON_R, MOON_R * 2, MOON_R * 2);
  ctx.restore();
  // Cloud wisps.
  ctx.globalAlpha = 0.22;
  ctx.drawImage(st.cloud[0], MOON_X - 170 + s * 10, MOON_Y + 10, 220, 60);
  ctx.drawImage(st.cloud[2], 120 + s * 6, 6, 200, 54);
  ctx.globalAlpha = 1;
  // Floodlight towers with soft beams.
  for (const [x, flip] of [[176, 1], [748, -1]] as const) {
    ctx.save();
    ctx.translate(x, -12);
    ctx.scale(flip * 1.3, 1.3);
    ctx.drawImage(st.tower, -20, 0);
    ctx.restore();
  }
  ctx.globalCompositeOperation = 'lighter';
  for (const [x, dir] of [[176, 1], [748, -1]] as const) {
    for (const [ex, w] of [[160, 40], [280, 70]] as const) {
      const bx = x + dir * ex;
      const g = ctx.createLinearGradient(x, 0, bx, 240);
      g.addColorStop(0, 'rgba(200,210,255,0.09)');
      g.addColorStop(1, 'rgba(200,210,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x - 8, 8);
      ctx.lineTo(x + 8, 8);
      ctx.lineTo(bx + w, 240);
      ctx.lineTo(bx - w, 240);
      ctx.closePath();
      ctx.fill();
    }
    drawGlow(ctx, glowOf([190, 200, 255]), x, 6, 110, 0.32);
    drawGlow(ctx, glowOf([255, 255, 255]), x, 6, 26, 0.9);
  }
  ctx.globalCompositeOperation = 'source-over';
}

function drawStands(env: Env, t: number, s: number, whip: number) {
  const { ctx, cam } = env;
  const st = env.art.stadium;
  layer(env, 0.35, 0.5);
  // Roof edge.
  ctx.fillStyle = '#06040e';
  ctx.fillRect(-700, 136, 2200, 18);
  ctx.fillStyle = 'rgba(150,160,230,0.35)';
  ctx.fillRect(-700, 153, 2200, 1);
  // Crowd: crisp in the wide, melting into bokeh as the lens pushes in.
  const dof = clamp((cam.zoom - 1.15) / 0.7);
  const draw = (a: number, ox: number) => {
    if (a <= 0.01) return;
    ctx.globalAlpha = a;
    ctx.drawImage(st.crowd, 0, 0, 1600, 96, -420 + ox, 154, 1920, 108);
  };
  ctx.imageSmoothingEnabled = false;
  draw(1 - dof, 0);
  ctx.imageSmoothingEnabled = true;
  draw(dof, 0);
  if (whip > 0.05) for (let k = 1; k <= 3; k++) draw(0.22 * whip, -k * 14 * whip);
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = 1;
  const wash = ctx.createLinearGradient(0, 150, 0, 264);
  wash.addColorStop(0, 'rgba(6,4,20,0.72)');
  wash.addColorStop(1, 'rgba(16,10,40,0.42)');
  ctx.fillStyle = wash;
  ctx.fillRect(-700, 150, 2200, 114);
  // Camera flashes (they freeze into points of light with the clock).
  ctx.globalCompositeOperation = 'lighter';
  const storm = clamp((t - 1.25) / 0.2);
  const win = 0.14 + storm * 0.5;
  for (const f of st.flashes) {
    const ph = (s * (0.9 + storm * 2.5) + f.t) % 3.2;
    if (ph > win) continue;
    const x = -420 + f.x * 1.2;
    drawGlow(ctx, glowSprite('white', 0), x, 154 + f.y * 1.12, 6 + storm * 2, 1 - ph / win);
  }
  ctx.globalCompositeOperation = 'source-over';
  // LED boards: crimson / silver / indigo panels.
  ctx.fillStyle = '#05040b';
  ctx.fillRect(-700, 262, 2200, 15);
  const cols = ['#d81a44', '#e8ecff', '#3a2a8a', '#d81a44', '#ffc35a'];
  for (let i = 0; i < 30; i++) {
    const x = -700 + i * 76 + ((s * 40) % 76);
    ctx.fillStyle = cols[i % cols.length];
    ctx.fillRect(Math.round(x), 265, 60, 8);
    ctx.fillStyle = '#05040b';
    for (let k = 0; k < 6; k++) ctx.fillRect(Math.round(x) + 5 + k * 9, 267, 4, 4);
  }
  // Far pitch.
  const pg = ctx.createLinearGradient(0, 277, 0, 380);
  pg.addColorStop(0, '#12301b');
  pg.addColorStop(1, '#1b4826');
  ctx.fillStyle = pg;
  ctx.fillRect(-700, 277, 2200, 500);
  ctx.fillStyle = 'rgba(230,236,255,0.4)';
  ctx.fillRect(-700, 283, 2200, 1);
}

function drawGround(env: Env, s: number) {
  const { ctx } = env;
  env.world();
  const g = ctx.createLinearGradient(0, GROUND, 0, GROUND + 80);
  g.addColorStop(0, '#1e5a2a');
  g.addColorStop(1, '#13381c');
  ctx.fillStyle = g;
  ctx.fillRect(-300, GROUND, 1500, 400);
  // Mowing stripes receding.
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  for (let i = -6; i < 14; i++) {
    const x = i * 90;
    ctx.beginPath();
    ctx.moveTo(x, GROUND);
    ctx.lineTo(x + 45, GROUND);
    ctx.lineTo(x + 45 - 120, GROUND + 200);
    ctx.lineTo(x - 120, GROUND + 200);
    ctx.closePath();
    ctx.fill();
  }
  // Grass fringe along the horizon line.
  ctx.fillStyle = '#2c7a38';
  for (let x = -300; x < 1200; x += 3) {
    const h = 1 + (((x * 7919) >>> 3) % 3);
    ctx.fillRect(x, GROUND - h + 1, 2, h);
  }
  // Goal line running toward the camera.
  ctx.fillStyle = 'rgba(240,244,255,0.85)';
  ctx.beginPath();
  ctx.moveTo(GOAL_X - 3, GROUND);
  ctx.lineTo(GOAL_X + 4, GROUND);
  ctx.lineTo(GOAL_X - 26, GROUND + 120);
  ctx.lineTo(GOAL_X - 44, GROUND + 120);
  ctx.closePath();
  ctx.fill();
  // Keeper's shadow.
  const [hx, hy] = hipAt(s);
  const lift = clamp((GROUND - 80 - hy) / 140);
  ctx.fillStyle = `rgba(4,8,16,${0.42 - lift * 0.25})`;
  ctx.beginPath();
  ctx.ellipse(hx - 10, GROUND + 3, 46 + lift * 30, 7, 0, 0, TAU);
  ctx.fill();
}

/** Near post, top frame and side netting (in front of anything inside the goal). */
function drawGoal(env: Env, t: number) {
  const { ctx } = env;
  env.world();
  const bx = GOAL_X + NET_D, by = BAR_Y + 26;
  // Side netting mesh (diamonds).
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(GOAL_X, BAR_Y);
  ctx.lineTo(bx, by);
  ctx.lineTo(bx + 30, GROUND);
  ctx.lineTo(GOAL_X, GROUND);
  ctx.closePath();
  ctx.fillStyle = 'rgba(8,6,20,0.35)';
  ctx.fill();
  ctx.clip();
  ctx.strokeStyle = 'rgba(214,220,255,0.34)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = -16; i < 30; i++) {
    const x = GOAL_X + i * 14;
    ctx.moveTo(x, BAR_Y - 10);
    ctx.lineTo(x + 260, GROUND + 10);
    ctx.moveTo(x + 260, BAR_Y - 10);
    ctx.lineTo(x, GROUND + 10);
  }
  ctx.stroke();
  ctx.restore();
  // Top frame + back stanchion.
  ctx.strokeStyle = '#180411';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(GOAL_X, BAR_Y);
  ctx.lineTo(bx, by);
  ctx.lineTo(bx + 30, GROUND);
  ctx.stroke();
  ctx.strokeStyle = '#c9cde8';
  ctx.lineWidth = 3;
  ctx.stroke();
  // Near post.
  ctx.fillStyle = '#180411';
  ctx.fillRect(GOAL_X - 6, BAR_Y - 6, 12, GROUND - BAR_Y + 6);
  ctx.fillStyle = '#f4f6ff';
  ctx.fillRect(GOAL_X - 4, BAR_Y - 4, 8, GROUND - BAR_Y + 4);
  ctx.fillStyle = '#b8bcd8';
  ctx.fillRect(GOAL_X + 2, BAR_Y, 2, GROUND - BAR_Y);
  ctx.fillStyle = '#ffd0dc';
  ctx.fillRect(GOAL_X - 4, BAR_Y - 4, 2, GROUND - BAR_Y + 4);
}

/** Time-freeze grade: everything drawn so far drains to moonlit indigo/silver, softer near the gap. */
function freezeGrade(env: Env, amt: number, cx: number, cy: number) {
  if (amt <= 0) return;
  const ctx = env.ctx;
  env.screen();
  ctx.save();
  const g = ctx.createRadialGradient(cx, cy, 20, cx, cy, 380);
  g.addColorStop(0, 'rgba(128,128,128,0.45)');
  g.addColorStop(1, 'rgba(128,128,128,1)');
  ctx.globalCompositeOperation = 'saturation';
  ctx.globalAlpha = 0.9 * amt;
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VW, VH);
  ctx.globalCompositeOperation = 'color';
  ctx.globalAlpha = 0.45 * amt;
  ctx.fillStyle = 'rgb(104,112,206)';
  ctx.fillRect(0, 0, VW, VH);
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.5 * amt;
  ctx.fillStyle = 'rgb(170,174,224)';
  ctx.fillRect(0, 0, VW, VH);
  ctx.restore();
}

// ---------------------------------------------------------------- blades
function bladeShape(ctx: CanvasRenderingContext2D, x: number, y: number, R: number, rot: number, edge: number) {
  const e = edge * R;
  crescentPath(ctx, x + Math.cos(rot) * e, y + Math.sin(rot) * e, R, BLADE_BITE - edge, rot);
}
function drawBlades(ctx: CanvasRenderingContext2D, bx: number, by: number, phi: number, wFrame: number, a: number) {
  const TILT = -0.4;
  // Orbit smear: one fading arc behind each blade, longer the faster it spins.
  const smear = clamp(wFrame * 1.6, 0.25, TAU * 0.45);
  ctx.lineCap = 'round';
  for (let k = 0; k < 2; k++) {
    const a0 = phi + k * Math.PI;
    for (let j = 0; j < 8; j++) {
      const s0 = a0 - (smear * (j + 1)) / 8, s1 = a0 - (smear * j) / 8;
      const q = 1 - j / 8;
      ctx.strokeStyle = `rgba(${(200 + 55 * q) | 0},${(40 + 190 * q * q) | 0},${(80 + 170 * q * q) | 0},${0.65 * q * a})`;
      ctx.lineWidth = 1 + 2.6 * q;
      ctx.beginPath();
      ctx.arc(bx, by, ORB + BLADE_R * 0.55, s0, s1);
      ctx.stroke();
    }
  }
  for (let k = 0; k < 2; k++) {
    const ang = phi + k * Math.PI;
    for (let j = 3; j >= 1; j--) {
      const ga = ang - (j * smear) / 4;
      ctx.globalAlpha = 0.38 * (1 - j / 4) * a;
      ctx.fillStyle = 'rgb(150,8,40)';
      bladeShape(ctx, bx + Math.cos(ga) * ORB, by + Math.sin(ga) * ORB, BLADE_R, ga + Math.PI + TILT, 0);
      ctx.fill();
    }
    ctx.globalAlpha = a;
    const x = bx + Math.cos(ang) * ORB, y = by + Math.sin(ang) * ORB;
    const rot = ang + Math.PI + TILT;
    ctx.fillStyle = 'rgba(16,0,14,0.8)';
    crescentPath(ctx, x - Math.cos(rot) * 1.5, y - Math.sin(rot) * 1.5, BLADE_R + 1.5, BLADE_BITE + 0.12, rot);
    ctx.fill();
    ctx.fillStyle = '#f4f6ff';
    bladeShape(ctx, x, y, BLADE_R, rot, 0);
    ctx.fill();
    ctx.fillStyle = 'rgb(206,16,50)';
    bladeShape(ctx, x, y, BLADE_R, rot, 0.16);
    ctx.fill();
    ctx.fillStyle = 'rgb(255,92,128)';
    bladeShape(ctx, x, y, BLADE_R * 0.92, rot, 0.33);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowSprite('crimson', 0.55), x - Math.cos(rot) * BLADE_R * 0.5, y - Math.sin(rot) * BLADE_R * 0.5, BLADE_R * 1.8, 0.3 * a);
    ctx.globalCompositeOperation = 'source-over';
  }
}

// ---------------------------------------------------------------- shot
export const shotFingertips: Shot = {
  name: 'Fingertips',
  dur: DUR,
  seed: 107,
  rate: rateAt,
  cues: [
    { at: 0.02, fn: (e) => e.sfx.whoosh(0.32, 500, 1900, 0.35) },
    { at: SLOW0 + 0.03, fn: (e) => e.sfx.timeStop(RIP - SLOW0) },
    { at: SCRAPE, fn: (e) => e.sfx.shing(0.7) },
    { at: SCRAPE + 0.03, fn: (e) => e.sfx.strain(RIP - SCRAPE - 0.03, 0.2) },
    { at: RIP, fn: (e) => { e.sfx.crack(1.2); e.sfx.boom(0.9, 0.5); } },
    { at: SNAP, fn: (e) => e.sfx.whoosh(0.45, 2400, 160, 0.55) },
    { at: SNAP + 0.08, fn: (e) => e.sfx.roar(1.0, 0.5) },
  ],
  init(env) {
    spin = new BallSpin();
    launched = dropped = frozen = scraped = ripped = false;
    contact = 0;
    hasPrev = false;
    const c = camAt(0);
    env.cam.set(c.x, c.y, c.z, c.r);
    env.cam.shakeAmp = 10;
    // Moonlit motes hanging around the gap (they freeze with time).
    const rng = env.rng;
    for (let i = 0; i < 46; i++) {
      env.parts.spawn({
        kind: PK.Pixel, x: rng.range(200, 640), y: rng.range(20, 300), vx: rng.range(-30, 30), vy: rng.range(-24, 14),
        max: rng.range(2.5, 4), s0: rng.range(1, 2.2), s1: 1, ramp: 'silver', r0: 0.1, r1: 0.5, a0: rng.range(0.3, 0.7), a1: 0.2, layer: 0,
      });
    }
  },
  update(env, t, dt) {
    const { rng, parts, cam } = env;
    const s = simAt(t);
    const c = camAt(t);
    cam.set(c.x, c.y, c.z, c.r);
    cam.shakeAmp = 10;
    spin.rotate(0, 0, 1, dt * 45);
    const pose = poseAt(TRACK, s);
    const [hx, hy] = hipAt(s);
    const hn = handOf(pose, hx, hy, true);
    const b = ballAt(s);

    // Take-off: his plant foot tears up the turf (it hangs in the air once time stops).
    if (!launched && s > 0.03) {
      launched = true;
      for (let i = 0; i < 16; i++) {
        const a = rng.range(-Math.PI * 0.9, -Math.PI * 0.25);
        const v = rng.range(140, 420);
        parts.spawn({
          kind: PK.Debris, x: H0X + rng.range(-20, 30), y: GROUND, vx: Math.cos(a) * v, vy: Math.sin(a) * v, ay: 900, drag: 0.6,
          vrot: rng.range(-12, 12), max: rng.range(0.7, 1.1), s0: rng.range(1.5, 3.5), s1: 1.5, ramp: 'grass', r0: rng.next(), r1: rng.next(),
          a0: 1, a1: 1, add: false, layer: 0,
        });
      }
      for (let i = 0; i < 10; i++) {
        const a = rng.range(Math.PI * 1.05, Math.PI * 1.95);
        const v = rng.range(40, 200);
        parts.spawn({
          kind: PK.Smoke, x: H0X + rng.range(-16, 30), y: GROUND - 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.4, drag: 3,
          max: rng.range(0.6, 1.1), s0: rng.range(6, 12), s1: rng.range(18, 30), ramp: 'dust', r0: 0, r1: 1, a0: 0.5, a1: 0, add: false, layer: 0,
        });
      }
      ring(env, H0X + 4, GROUND, 8, 80, 0.5, 0.22, 'white');
    }

    if (!dropped && s > 0.1) {
      dropped = true;
      const j = joints(pose);
      const [qx, qy] = jointWorld(j.head, hx, hy, K, D, FACING);
      for (let i = 0; i < 12; i++) {
        const a = rng.range(-Math.PI * 0.95, -Math.PI * 0.35);
        const v = rng.range(60, 260);
        parts.spawn({
          kind: PK.Pixel, x: qx + rng.range(-14, 14), y: qy + rng.range(-12, 8), vx: Math.cos(a) * v + 80, vy: Math.sin(a) * v, ay: 300,
          max: rng.range(1.2, 1.8), s0: rng.range(1, 1.8), s1: 1, ramp: 'silver', r0: 0, r1: 0.5, a0: 0.9, a1: 0.4,
        });
      }
    }

    // Time freezes: the hot vapour already in the air cools off instead of hanging there.
    if (!frozen && t >= SLOW0 + 0.06) {
      frozen = true;
      for (const p of parts.list) if (p.kind === PK.Glow && p.ramp === 'crimson') p.max = Math.min(p.max, p.life + 0.03);
    }

    // Comet flames (sub-stepped between frames while the ball is fast, so the corona is a
    // continuous tail instead of a chain of beads).
    const rt = rateAt(t);
    if (b.x < GOAL_X + NET_D && rng.next() < (rt > 0.25 ? 1 : rt * 1.2)) {
      const R = t > SNAP ? 10 : 7, I = t > SNAP ? 1 : 0.6;
      const m = hasPrev ? Math.max(1, Math.min(3, Math.ceil(Math.hypot(b.x - prevBX, b.y - prevBY) / 7))) : 1;
      for (let k = 1; k <= m; k++) meteorFlames(env, lerp(prevBX, b.x, k / m), lerp(prevBY, b.y, k / m), R, b.dir, I, dt / m, 'crimson');
    }
    prevBX = b.x;
    prevBY = b.y;
    hasPrev = true;

    // Blade meets glove: slow silver sparks peel off the fingertips.
    contact = Math.max(0, contact - (dt / rateAt(t)) * 5);
    if (t > SLOW0 && t < RIP) {
      const phi = PHI0 + OMEGA * s;
      for (let k = 0; k < 2; k++) {
        const a = phi + k * Math.PI;
        const ex = b.x + Math.cos(a) * (ORB + BLADE_R * 0.6), ey = b.y + Math.sin(a) * (ORB + BLADE_R * 0.6);
        const d = Math.hypot(ex - hn.ftx, ey - hn.fty);
        if (d < 15) {
          contact = 1;
          const tang = a + Math.PI / 2;
          const n = rng.next() < 0.35 ? 1 : 0;
          for (let i = 0; i < n; i++) {
            const da = tang + rng.range(-0.8, 0.8);
            const v = rng.range(250, 900);
            parts.spawn({
              kind: PK.Streak, x: hn.ftx + rng.range(-3, 3), y: hn.fty + rng.range(-3, 3), vx: Math.cos(da) * v, vy: Math.sin(da) * v,
              drag: 2.5, ay: 300, max: rng.range(0.4, 0.9), s0: rng.range(0.8, 1.5), s1: 0.3, ramp: 'silver', r0: 0.1, r1: 1, k: 0.7,
            });
          }
          if (rng.next() < 0.3) {
            parts.spawn({
              kind: PK.Pixel, x: hn.ftx, y: hn.fty, vx: rng.range(-200, 200), vy: rng.range(-260, 80), drag: 2, ay: 200,
              max: rng.range(0.5, 1), s0: 2, s1: 1, ramp: 'silver', r0: 0, r1: 0.8, a0: 1, a1: 0,
            });
          }
        }
      }
    }
    if (!scraped && t >= SCRAPE) {
      scraped = true;
      cam.hit(0.22);
    }

    // The rip.
    if (!ripped && t >= RIP) {
      ripped = true;
      const fa = GL0.dir;
      // (sprayed up and away from the glove's flight, so the gap between glove and hand stays clean)
      for (let i = 0; i < 32; i++) {
        const a = fa + 0.55 + rng.range(-1, 1) + (i % 3 === 0 ? Math.PI * 0.5 : 0);
        const v = rng.range(300, 1100);
        parts.spawn({
          kind: PK.Streak, x: hn.ftx, y: hn.fty, vx: Math.cos(a) * v, vy: Math.sin(a) * v, drag: 3.2, ay: 260,
          max: rng.range(0.25, 0.55), s0: rng.range(0.8, 1.8), s1: 0.4, ramp: i % 2 === 0 ? 'crimson' : 'silver', r0: 0, r1: 1, k: 1.1,
        });
      }
      for (let i = 0; i < 16; i++) {
        const a = fa + rng.range(-1, 1);
        const v = rng.range(80, 380);
        parts.spawn({
          kind: PK.Debris, x: hn.ftx, y: hn.fty, vx: Math.cos(a) * v, vy: Math.sin(a) * v, ay: 500, drag: 1.4, vrot: rng.range(-16, 16),
          max: rng.range(0.5, 0.9), s0: rng.range(1.2, 2.4), s1: 1, ramp: 'white', r0: 0, r1: 1, a0: 1, a1: 1, add: false,
          color: i % 3 === 0 ? '#f07a2c' : '#f4f6ff',
        });
      }
      for (let i = 0; i < 10; i++) {
        const a = rng.range(0, TAU);
        const v = rng.range(40, 220);
        parts.spawn({
          kind: PK.Glow, x: hn.ftx, y: hn.fty, vx: Math.cos(a) * v, vy: Math.sin(a) * v, drag: 2.5,
          max: rng.range(0.3, 0.5), s0: rng.range(5, 9), s1: 1, ramp: 'crimson', r0: 0.25, r1: 1, a0: 0.6, a1: 0,
        });
      }
      ring(env, hn.ftx, hn.fty, 4, 70, 0.15, 1, 'silver');
      ring(env, hn.ftx, hn.fty, 4, 46, 0.18, 1, 'crimson');
      cam.hit(0.85);
    }

    // Afterwards: smoke curling off his scorched bare fingertips.
    if (ripped && t > SNAP && rng.next() < 0.45) {
      parts.spawn({
        kind: PK.Smoke, x: hn.ftx + rng.range(-3, 3), y: hn.fty + rng.range(-3, 3), vx: rng.range(-30, 20), vy: rng.range(-70, -30), drag: 1.2,
        max: rng.range(0.4, 0.7), s0: 3, s1: 12, ramp: 'smoke', r0: 0, r1: 1, a0: 0.45, a1: 0, add: false,
      });
    }
  },
  render(env, t) {
    const { ctx, fx, cam } = env;
    const rng = env.frng();
    const s = simAt(t);
    const frz = freezeAt(t);
    const whip = whipAt(t);
    const pose = poseAt(TRACK, s);
    const [hx, hy] = hipAt(s);
    const hn = handOf(pose, hx, hy, true);
    const b = ballAt(s);
    const torn = t >= RIP;

    // ---- backdrop
    drawSky(env, t, s);
    drawStands(env, t, s, whip);
    drawGround(env, s);
    env.world();
    env.parts.draw(ctx, 0);

    // ---- time freeze grade on the world behind him
    const [fu, fv] = cam.toUV(hn.ftx, hn.fty);
    freezeGrade(env, frz, fu * VW, fv * VH);
    // The rip (no two-tone frame here, so the goal's impact frame in shot 8 stays the big one):
    // the world behind him drops toward night and dark focus lines converge on the bite, all
    // BEHIND the keeper, ball and blades so the subject stays in full color and unbroken.
    const ripI = pulse(t, RIP, 0.17);
    if (ripI > 0) {
      env.screen();
      const dk = t < SNAP ? 1 : clamp(1 - (t - SNAP) / 0.1);
      if (dk > 0) {
        ctx.fillStyle = `rgba(4,2,14,${0.6 * dk})`;
        ctx.fillRect(0, 0, VW, VH);
      }
      // During the hit-stop: a silver/crimson burst radiating from the bite (a full-color
      // impact panel, not a posterize); afterwards only the dark lines linger.
      if (t < SNAP) {
        focusLines(ctx, rng, fu * VW, fv * VH, 50, 760, 56, '#e6eaff', 0.6, 4);
        focusLines(ctx, rng, fu * VW, fv * VH, 70, 760, 18, '#ff3a6a', 0.55, 5);
      }
      focusLines(ctx, rng, fu * VW, fv * VH, 60, 760, 64, '#0a0414', ripI > 0.8 ? 0.85 : ripI * 0.5, 5);
    }
    env.world();

    // ---- keeper (cooled by the freeze, but still green)
    const kr = renderPuppet(torn ? KEEPER_BARE : KEEPER_KIT, pose, {
      k: K, facing: FACING, heatTint: frz > 0.02 ? { c: [92, 100, 186], a: 0.28 * frz } : undefined,
    });
    drawPuppet(ctx, kr, hx, hy, D);
    if (!torn) {
      if (!bufA) bufA = new PixelBuffer(HB, HB);
      drawSprite(ctx, handSprite(bufA, hn.ang, 'glove', t >= SCRAPE ? 0.2 + 0.8 * contact : 0), hn.x, hn.y);
    } else {
      if (!bufB) bufB = new PixelBuffer(HB, HB);
      if (!bufC) bufC = new PixelBuffer(HB, HB);
      const hf = handOf(pose, hx, hy, false);
      drawSprite(ctx, handSprite(bufB, hf.ang, 'far', 0), hf.x, hf.y);
      // (the near arm is drawn last by the puppet, so its hand overlays the far glove correctly)
      drawSprite(ctx, handSprite(bufC, hn.ang, 'bare', 0), hn.x, hn.y);
    }

    // Crimson light spilling onto the glove from the ball.
    if (!torn) {
      ctx.globalCompositeOperation = 'lighter';
      const near = clamp(1 - (Math.hypot(b.x - hn.ftx, b.y - hn.fty) - 20) / 120);
      drawGlow(ctx, glowSprite('crimson', 0.6), hn.ftx, hn.fty, 12 + contact * 6, near * 0.14 + contact * 0.14);
      ctx.globalCompositeOperation = 'source-over';
    } else if (t < RIP + 0.5) {
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowSprite('crimson', 0.3), hn.ftx, hn.fty, 12, 0.3 * (1 - (t - RIP) / 0.5));
      ctx.globalCompositeOperation = 'source-over';
    }

    // ---- the comet
    const released = t >= SNAP;
    const L = arcLen(s);
    const tailLen = released ? lerp(230, 560, ease.outCubic(clamp((t - SNAP) / 0.3))) : 230;
    const n = trailPts.length;
    for (let i = 0; i < n; i++) {
      const [x, y] = arcPt(L - tailLen * (1 - i / (n - 1)));
      trailPts[i].x = x;
      trailPts[i].y = y;
    }
    const fade = 1 - 0.85 * clamp((t - 1.4) / 0.3);
    // After the rip: the crescent the ball carved over his hand, left hanging in the air.
    if (released) {
      const ca = (arcLen(S_RIP) - 70) / PR - Math.PI / 2, cb = L / PR - Math.PI / 2;
      crescentArc(ctx, TOP_X, TOP_Y + PR, PR, ca, Math.min(cb, ca + 0.62), 13, 1, 0.75 * fade);
    }
    const tw = released ? 17 : 10;
    ribbon(ctx, trailPts, 0, tw * 2, 'rgb(96,4,34)', 0.5 * fade);
    ribbon(ctx, trailPts, 0, tw * 1.2, 'rgb(206,20,62)', 0.85 * fade);
    crimsonRibbon(ctx, trailPts, tw * 0.6, 0.6 * fade);
    // Dark halo so the glow never washes the ball out.
    drawGlow(ctx, glowOf([12, 2, 18]), b.x, b.y, 30, 0.55);
    drawBall(env, spin, b.x, b.y, BALL_R, D, released ? 1 : 0.65, released ? 1.1 : lerp(0.5, 0.35, clamp((frz - 0.3) / 0.2)), 'crimson');
    const phi = PHI0 + OMEGA * s;
    drawBlades(ctx, b.x, b.y, phi, (OMEGA * rateAt(t)) / 60, 1);
    env.parts.draw(ctx, 1);

    // Glint on the fingertips at each blade pass.
    const glint = pulse(t, SCRAPE, 0.22);
    if (glint > 0 && !torn) sparkle(ctx, hn.ftx, hn.fty, 6 + glint * 12, glint * 0.9, 0.3);

    // Goal frame in front of anything that enters it.
    drawGoal(env, t);

    // ---- screen space accents
    env.screen();
    const [bu, bv] = cam.toUV(b.x, b.y);
    const ws = clamp((t - SNAP - 0.05) / 0.05) * whip;
    if (ws > 0.02) {
      ctx.save();
      ctx.translate(VW / 2, VH / 2);
      ctx.rotate(cam.rot);
      ctx.globalCompositeOperation = 'lighter';
      speedStreaks(ctx, rng, -VW, -VH * 0.7, VW * 2, VH * 1.4, Math.PI, 26, '#dfe4ff', 0.22 * ws, 180);
      speedStreaks(ctx, rng, -VW, -VH * 0.7, VW * 2, VH * 1.4, Math.PI, 8, '#ff4d7a', 0.25 * ws, 120);
      ctx.restore();
    }


    // ---- world again: the rip on top of everything
    env.world();
    // ---- the rip: a silver crescent slash where blade B bit, and the glove spinning away
    const bR = ballAt(S_RIP);
    const phiB = PHI0 + OMEGA * S_RIP + Math.PI;
    const SL0 = phiB - 1.7, SL1 = phiB + 0.2;
    if (t >= RIP && t < RIP + 0.3) {
      const q = (t - RIP) / 0.3;
      crescentArc(ctx, bR.x, bR.y, ORB + 14 + q * 8, SL0, SL1, 9 * (1 - q * 0.6), 1, (1 - q) * (1 - q));
    }
    if (torn) {
      if (!bufA) bufA = new PixelBuffer(HB, HB);
      const g = gloveAt(s);
      // Silver smear behind the tumbling glove.
      for (let i = 0; i < glovePts.length; i++) {
        const p = gloveAt(s - (glovePts.length - 1 - i) * 0.012);
        glovePts[i].x = p.x;
        glovePts[i].y = p.y;
      }
      ctx.globalCompositeOperation = 'lighter';
      ribbon(ctx, glovePts, 0, 9, 'rgb(200,210,255)', 0.25 * clamp(1 - (t - SNAP) / 0.5));
      ctx.globalCompositeOperation = 'source-over';
      drawGlow(ctx, glowOf([10, 4, 20]), g.x, g.y, 26, 0.6);
      drawSprite(ctx, handSprite(bufA, g.ang, 'glove', 0.3), g.x, g.y);
      const gg = pulse(t, SNAP + 0.04, 0.4);
      if (gg > 0) sparkle(ctx, g.x + Math.cos(g.ang) * 10, g.y + Math.sin(g.ang) * 10, 8 + 10 * gg, gg, g.ang);
    }

    // ---- post
    fx.bloom = 1.0;
    fx.bloomThresh = lerp(0.62, 0.74, frz);
    fx.vignette = 0.55 + frz * 0.2;
    fx.contrast = 1.06 + frz * 0.05;
    fx.sat = lerp(1.02, 0.9, frz);
    fx.tint = [lerp(255, 228, frz), lerp(255, 232, frz), 255];
    fx.ca = Math.min(0.008, 0.0015 + frz * 0.0025 + ripI * 0.01 + whip * 0.006);
    if (t > 0.24 && t < 0.8) {
      const q = (t - 0.24) / 0.56;
      fx.shocks.push({ x: fu, y: fv, r: q * 0.9, s: 0.03 * (1 - q) });
    }
    if (t >= RIP && t < RIP + 0.45) {
      const q = (t - RIP) / 0.45;
      // (starts outside the glove so the refraction never pinches the hand mid-rip)
      fx.shocks.push({ x: fu, y: fv, r: 0.24 + q * 0.55, s: 0.055 * (1 - q) });
    }
    // Slash split along the blade's bite.
    if (t > RIP + 0.01 && t < RIP + 0.32) {
      const q = (t - RIP - 0.01) / 0.31;
      const amt = Math.sin(Math.PI * Math.pow(q, 0.6));
      const [ru, rv] = cam.toUV(bR.x, bR.y);
      let s0 = SL0 + cam.rot;
      s0 = ((s0 % TAU) + TAU) % TAU;
      if (s0 > Math.PI) s0 -= TAU;
      const mid = s0 + (SL1 - SL0) / 2;
      fx.cut = 0.012 * amt;
      fx.cutX = ru;
      fx.cutY = rv;
      fx.cutR = ((ORB + 14) * cam.zoom) / VH;
      fx.cutA0 = s0;
      fx.cutA1 = s0 + (SL1 - SL0);
      fx.cutDirX = -Math.sin(mid);
      fx.cutDirY = Math.cos(mid);
      fx.cutGlow = clamp(amt * 1.1);
      fx.cutWidth = 0.004;
      fx.cutColor = [240, 236, 255];
    }
    // (held off for a few frames so the torn glove reads crisply before the whip smears it)
    fx.radial = whip * 0.03 * clamp((t - SNAP - 0.03) / 0.05);
    fx.radialX = clamp(bu);
    fx.radialY = clamp(bv);
    // Cut 6->7 is a black blink (near-black for two frames, then the keeper fades up fast);
    // the shot ends clean so the cut to shot 8's landing is a hard cut.
    const dip = 0.92 * (t < 0.025 ? 1 : Math.pow(1 - clamp((t - 0.025) / 0.045), 2));
    const snapF = pulse(t, SNAP, 0.06) * 0.1;
    fx.flash = Math.max(dip, snapF);
    fx.flashColor = dip > snapF ? [6, 2, 14] : [255, 232, 240];
  },
};
