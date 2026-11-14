// SHOT 5 — THE CRESCENT: the strike.
// Still hanging upside down from shot 4, No.10 whips his kicking leg over: the boot carves a
// huge crescent of crimson fire around his hip and meets the ball at its tip. Contact: hit-stop,
// a silver/indigo then crimson/black impact frame, and the frame itself is slashed along the
// crescent (the two halves slide apart). Color floods back out of the ball, the camera whip-rolls
// the stadium back upright (the world completes its full turn), and the ball fires off
// screen-right as a crimson comet ringed by crescent blades, a crescent shockwave in its wake.
// The great crescent hangs in the sky behind him and wanes into embers.

import type { Shot, Env } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { TAU, clamp, ease, lerp } from '../../engine/math';
import { PK, drawGlow, glowOf, glowSprite } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { PIXEL_FONT, focusLines, sparkle, speedStreaks, type TrailPt } from '../../art/fx';
import { HERO_KIT, P, POSES, drawPuppet, joints, jointWorld, mixPose, renderPuppet, type Pose } from '../../art/puppet';
import { HERO_FACING, Trail, crescentArc, crescentPath, crimsonRibbon, drawBall, meteorFlames, pulse, ring, sparks } from './common';

const DUR = 1.7;
const HIT = 0.45; // boot meets ball
const STOP = 0.18; // hit-stop
const WHIP0 = 0.6, WHIP1 = 0.92; // camera whip-rolls the world back upright
const REL = 0.92; // the ball is let go at full speed
const WIND_T = 0.08; // last wind-up before the swing
const D = Math.PI / 180;

// Hero puppet: same scale/placement as shot 4 (1.2 px/unit at 2x).
const K = 1.2, HD = 2, KD = K * HD;
const FACE = HERO_FACING;
const HIP_X = 292, HIP_Y = 173;
const BALL_R = 6;

// The crescent carved by the boot: centered on the hip, outer edge just past the toe.
const R_ARC = 98, THICK = 32;

// World layout: an exact copy of shot4_inverted.ts (the stand seen from below with its 2x crowd
// and lettered boards, the pitch overhead with its markings and the upside-down goal, the
// braced floodlight masts, the sky and the moon), so the stadium is identical across the cut.
// Keep these in sync with shot 4.
const ROOF_Y = 188, ROOF_H = 12, CURVE = 0.0003;
const CROWD_SC = 2, CROWD_SRC0 = 62, CROWD_SRC_H = 36, CROWD_H = CROWD_SRC_H * CROWD_SC;
const BOARD_H = 9;
const roofY = (x: number) => ROOF_Y - CURVE * (x - 320) * (x - 320);
const boardY = (x: number) => roofY(x) + ROOF_H + CROWD_H;
const pitchY = (x: number) => boardY(x) + BOARD_H - 1;
const VPX = 320, PERSP = 0.0045, TOUCH = 7;
const GL = 520;
const pitchPt = (u: number, d: number): [number, number] => [VPX + (u - VPX) * (1 + d * PERSP), pitchY(u) + TOUCH + d];
const GOAL_D0 = 19, GOAL_D1 = 45, GOAL_H = 42, NET_D = 16;
const BOX = { u0: GL - 120, d0: 2, d1: 62 };
const SIX = { u0: GL - 40, d0: 9, d1: 55 };
const SPOT = { u: GL - 80, d: 32 };
const ADS = ['CRIMSON', 'No.10', 'CAM FC', 'SPECIAL', 'KICK OFF', 'MOON'];
const MOON_X = 110, MOON_Y = 54, MOON_R = 40, MOON_BITE = Math.PI * 0.2;
const ZEN_X = 320, ZEN_Y = -520;
const TOWERS = [566, 74];
const MAST = 30;
// Clouds belong to the upright sky only: they fade in while the world turns upright.
const CLOUDS: [number, number, number][] = [[560, 14, 0], [400, -6, 1], [-40, 4, 2], [250, -28, 0]];

// Shot 4's last frame, matched exactly by the opening frame here: camera (314, 174) zoom 1.19,
// hero in shot 4's held COIL pose, the ball bob phase, the lock-on crescents' angle and radius.
const S4_CAM_X = 314, S4_CAM_Y = 174, S4_ZOOM = 1.19;
const S4_T = 1.9;
const OPEN_REC = 0.22; // the camera breathes out of shot 4's framing during the wind-up
const WHIP_OUT = 0.1; // last 0.1 s: whip-pan after the comet into shot 6
const WHIP_DIR = -0.3; // screen heading of the whip (shot 6 opens on the comet heading ~-0.4)
const GRADE_AMT = 0.7; // cold time-stop grade until color floods back out of the ball
const TURF_GREEN = 0.6; // keeps the overhead turf green under the grade (as shot 4 does)

// Poses. The kicking (near) leg starts in shot 4's held coil -> one last coil -> whipped
// straight through the ball. COCK only sets where the crescent starts (its geometry).
const COCK: Pose = POSES.bikeCock;
const COIL4: Pose = { ...POSES.bikeCock, thighN: -24 * D, kneeN: 128 * D, footN: 26 * D, thighF: 126 * D, armN: -108 * D, armF: -147 * D };
const WIND: Pose = { ...COIL4, thighN: -29 * D, kneeN: 133 * D, footN: 28 * D, thighF: 130 * D, armN: -112 * D, armF: -151 * D, spin: -1.72 };
const STRIKE: Pose = POSES.bikeStrike;
const FOLLOW: Pose = POSES.bikeFollow;
const FALL: Pose = P({ ...POSES.bikeFollow, torso: -16 * D, thighN: 100 * D, kneeN: 30 * D, thighF: 44 * D, kneeF: 80 * D, armN: -150 * D, armF: -176 * D, head: -6 * D, spin: -4.0 });

let spin = new BallSpin();
let simT = 0, simHit = 0;
let hit = false, released = false;
let A0 = 0, A1 = 0; // crescent angles (world, canvas convention)
let BX = 0, BY = 0;
let ball = { x: 0, y: 0, vx: 0, vy: 0 };
let relX = 0, relY = 0, relDir = 0;
let emitAcc = 0;
let flameAcc = 0; // sim time owed to the comet flames (they spawn per call, so throttle in slow-mo)
let flashes: { x: number; y: number; r: number; at: number; rot: number }[] = [];
const trail = new Trail(26);
const path: TrailPt[] = [];
const streakPts: TrailPt[] = [];

// ---------------------------------------------------------------- motion

function prePose(s: number): Pose {
  if (s < WIND_T) return mixPose(COIL4, WIND, ease.inOutQuad(s / WIND_T));
  const u = clamp((s - WIND_T) / (HIT - WIND_T));
  return mixPose(WIND, STRIKE, Math.pow(u, 1.4));
}

function postPose(u: number): Pose {
  if (u < 0.2) return mixPose(STRIKE, FOLLOW, ease.outCubic(u / 0.2));
  // Keeps tumbling over at a steady rate as he drops (linear: no settling into a headstand).
  return mixPose(FOLLOW, FALL, clamp((u - 0.2) / 0.7));
}

function heroPose(): Pose {
  return hit ? postPose(simT - simHit) : prePose(Math.min(simT, HIT));
}

function hipNow(): [number, number] {
  if (!hit) return [HIP_X, HIP_Y];
  const u = simT - simHit;
  return [HIP_X - 30 * u, HIP_Y + 6 * u + 120 * u * u];
}

/** World angle of the kicking toe around the hip. */
function toeAng(pose: Pose): number {
  const j = joints(pose).toeN;
  return Math.atan2(j[1], j[0] * FACE);
}

function unwrap(a: number, ref: number) {
  while (a < ref - 0.8) a += TAU;
  while (a > ref + TAU - 0.8) a -= TAU;
  return a;
}

/** How far the crescent has grown (0..1), following the boot. */
function arcProgress(): number {
  if (hit) return 1;
  return clamp((unwrap(toeAng(heroPose()), A0) - A0) / (A1 - A0));
}

/** The crescent swells outward after contact as it hangs in the sky. */
function arcR(t: number) {
  return R_ARC + 18 * ease.outCubic(clamp((t - HIT - 0.1) / 0.7));
}

/** How much of the crescent has burned away (from its tail). */
function burnAt(t: number) {
  return ease.inQuad(clamp((t - 1.0) / 0.66));
}

/** Ball direction after the strike: leaves along the crescent's tangent, then flattens toward goal. */
function ballDir(u: number) {
  return lerp(18 * D, 1 * D, ease.outQuad(clamp(u / 0.4)));
}

function camAt(t: number): [number, number, number, number] {
  const pre = ease.inOutQuad(clamp(t / HIT));
  let x = lerp(278, 268, pre), y = lerp(160, 150, pre);
  let z = lerp(0.98, 1.05, pre);
  // Rolls with his rotation as he whips over.
  let r = -Math.PI - 0.07 - 0.16 * pre;
  // Whip-roll: the world finishes its full turn and lands upright; pull out to see the shot.
  const w = ease.inOutCubic(clamp((t - WHIP0) / (WHIP1 - WHIP0)));
  x = lerp(x, 384, w);
  y = lerp(y, 164, w);
  z = lerp(z, 0.82, w);
  r = lerp(r, -TAU - 0.1, w);
  // Overshoot settles, then a slow drift after the comet.
  const settle = ease.outCubic(clamp((t - WHIP1) / 0.3));
  const aft = ease.inOutQuad(clamp((t - WHIP1) / (DUR - WHIP1)));
  r += 0.1 * settle + 0.03 * aft;
  x += 34 * aft;
  y += 10 * aft;
  z -= 0.04 * aft;
  z += pulse(t, HIT, 0.32) * 0.12 + pulse(t, REL, 0.3) * 0.05;
  // Open on shot 4's exact last framing (out of its crimson snap), then breathe out to this
  // shot's own framing during the wind-up, long before contact.
  const rec = 1 - ease.outCubic(clamp(t / OPEN_REC));
  x += (S4_CAM_X - 278) * rec;
  y += (S4_CAM_Y - 160) * rec;
  z += (S4_ZOOM - 0.98) * rec;
  // Whip-pan out after the comet (the cut into shot 6 is a motion cut, no flash).
  const wo = whipOut(t);
  x += 300 * wo;
  y -= 70 * wo;
  return [x, y, z, r];
}

function whipOut(t: number) {
  return ease.inQuad(clamp((t - (DUR - WHIP_OUT)) / WHIP_OUT));
}

/** Thin tapered silver crescent (a shock front), additive. */
function silverArc(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, a0: number, a1: number, thick: number, alpha: number) {
  if (alpha <= 0) return;
  const N = 40;
  ctx.globalCompositeOperation = 'lighter';
  for (const [wMul, color, a] of [[1, 'rgb(150,40,90)', 0.5], [0.55, 'rgb(236,240,255)', 0.9]] as const) {
    ctx.globalAlpha = clamp(alpha * a);
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const ang = lerp(a0, a1, i / N);
      ctx[i ? 'lineTo' : 'moveTo'](cx + Math.cos(ang) * r, cy + Math.sin(ang) * r);
    }
    for (let i = N; i >= 0; i--) {
      const ang = lerp(a0, a1, i / N);
      const w = thick * wMul * Math.pow(Math.sin(Math.PI * (i / N)), 0.8);
      ctx.lineTo(cx + Math.cos(ang) * (r - w), cy + Math.sin(ang) * (r - w));
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

/**
 * One ribbon layer whose width grows from the tail, then tapers over the last ~15% toward
 * `head` and closes with a round cap, so the comet head is round instead of a flat box.
 */
function roundRibbon(ctx: CanvasRenderingContext2D, pts: TrailPt[], w: number, head: number, color: string, alpha: number) {
  const n = pts.length;
  if (n < 2 || alpha <= 0) return;
  const L: [number, number][] = [], R: [number, number][] = [];
  let hx = 1, hy = 0;
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b.x - a.x, dy = b.y - a.y;
    const l = Math.hypot(dx, dy) || 1;
    dx /= l;
    dy /= l;
    if (i === n - 1) [hx, hy] = [dx, dy];
    const u = i / (n - 1);
    const hw = 0.5 * (u < 0.85 ? w * (u / 0.85) : lerp(w, Math.min(w, head), ease.inOutQuad((u - 0.85) / 0.15)));
    L.push([pts[i].x - dy * hw, pts[i].y + dx * hw]);
    R.push([pts[i].x + dy * hw, pts[i].y - dx * hw]);
  }
  const last = pts[n - 1];
  const cap = 0.5 * Math.min(w, head);
  const th = Math.atan2(hy, hx);
  ctx.globalAlpha = clamp(alpha);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(L[0][0], L[0][1]);
  for (let i = 1; i < n; i++) ctx.lineTo(L[i][0], L[i][1]);
  ctx.arc(last.x, last.y, cap, th + Math.PI / 2, th - Math.PI / 2, true);
  for (let i = n - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

/** The comet's own ribbon (crimsonRibbon's layers, with a round head about the ball's size). */
function cometRibbon(ctx: CanvasRenderingContext2D, pts: TrailPt[], w: number, head: number) {
  if (pts.length < 2) return;
  ctx.globalCompositeOperation = 'lighter';
  roundRibbon(ctx, pts, w * 2.4, head * 1.6, 'rgb(120,6,40)', 0.4);
  roundRibbon(ctx, pts, w * 1.5, head * 1.2, 'rgb(230,30,70)', 0.55);
  roundRibbon(ctx, pts, w * 0.8, head * 0.8, 'rgb(255,120,150)', 0.7);
  roundRibbon(ctx, pts, w * 0.3, head * 0.4, 'rgb(245,245,255)', 0.95);
  ctx.globalCompositeOperation = 'source-over';
}

function screenOf(env: Env, x: number, y: number): [number, number] {
  const [u, v] = env.cam.toUV(x, y);
  return [u * VW, v * VH];
}

// ---------------------------------------------------------------- world (as in shot 4)

function beam(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, spread: number, len: number, a: number) {
  const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
  const g = ctx.createLinearGradient(x, y, ex, ey);
  g.addColorStop(0, `rgba(236,238,255,${a})`);
  g.addColorStop(0.55, `rgba(200,206,255,${a * 0.35})`);
  g.addColorStop(1, 'rgba(200,206,255,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(ang - spread) * len, y + Math.sin(ang - spread) * len);
  ctx.lineTo(x + Math.cos(ang + spread) * len, y + Math.sin(ang + spread) * len);
  ctx.closePath();
  ctx.fill();
}

function towerLamp(x: number) {
  const bx = x, by = roofY(x) + 6;
  const ang = Math.atan2(ZEN_X - bx, -(ZEN_Y - by));
  const L = MAST + 15;
  return { bx, by, ang, lx: bx + Math.sin(ang) * L, ly: by - Math.cos(ang) * L };
}

/** Floodlight tower in its local frame (as in shot 4: 6-px braced lattice mast, lamp head). */
function drawTower(ctx: CanvasRenderingContext2D) {
  const top = -MAST - 2, len = MAST + 8;
  ctx.fillStyle = '#1d1a3a';
  ctx.fillRect(-3, top, 6, len);
  ctx.fillStyle = '#8a84c8';
  ctx.fillRect(2, top, 1, len);
  ctx.fillRect(-3, top, 1, len);
  ctx.strokeStyle = '#4a4590';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let y = 4; y > top + 2; y -= 6) {
    ctx.moveTo(-2, y);
    ctx.lineTo(2, y - 3);
    ctx.lineTo(-2, y - 6);
  }
  ctx.stroke();
  const hy = -MAST - 30;
  ctx.fillStyle = '#17142c';
  ctx.fillRect(-25, hy - 1, 50, 32);
  ctx.fillStyle = '#3a3566';
  ctx.fillRect(-24, hy, 48, 30);
  ctx.fillStyle = '#8a84c8';
  ctx.fillRect(-24, hy + 28, 48, 2);
  ctx.fillStyle = '#4a4590';
  ctx.fillRect(-6, hy + 30, 12, 3);
  ctx.fillStyle = '#fffbea';
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) ctx.fillRect(-21 + c * 7, hy + 3 + r * 6, 5, 4);
}

function pitchPath(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(-520, 1000);
  for (let x = -520; x <= 1160; x += 20) ctx.lineTo(x, pitchY(x));
  ctx.lineTo(1160, 1000);
  ctx.closePath();
}

function linePts(ctx: CanvasRenderingContext2D, pts: [number, number][]) {
  pts.forEach(([x, y], i) => ctx[i ? 'lineTo' : 'moveTo'](x, y));
}

/**
 * Pitch beyond the ad boards (as in shot 4): turf and mowing stripes, then, once the whip-roll
 * starts, the night darkening (`dark` 0..1) so it reads as ground rushing past, not a green
 * wall; then the markings on top (touchline, goal line, boxes, spot, the D).
 */
function drawPitch(ctx: CanvasRenderingContext2D, dark: number) {
  ctx.fillStyle = '#2b6e37';
  pitchPath(ctx);
  ctx.fill();
  ctx.save();
  pitchPath(ctx);
  ctx.clip();
  ctx.fillStyle = `rgba(170,230,160,${0.35 * (1 - 0.5 * dark)})`;
  for (let i = -10; i < 14; i++) {
    if (i & 1) continue;
    const u0 = i * 52, u1 = u0 + 52;
    ctx.beginPath();
    linePts(ctx, [pitchPt(u0, -TOUCH - 4), pitchPt(u1, -TOUCH - 4), pitchPt(u1, 260), pitchPt(u0, 260)]);
    ctx.closePath();
    ctx.fill();
  }
  if (dark > 0) {
    ctx.fillStyle = `rgba(4,2,14,${0.5 * dark})`;
    ctx.fillRect(-600, pitchY(320) - 200, 1900, 1400);
    const py = pitchY(320);
    const pg = ctx.createLinearGradient(0, py, 0, py + 200);
    pg.addColorStop(0, 'rgba(4,2,14,0)');
    pg.addColorStop(1, `rgba(4,2,14,${0.75 * dark})`);
    ctx.fillStyle = pg;
    ctx.fillRect(-600, pitchY(320) - 200, 1900, 1400);
  }
  ctx.restore();

  ctx.strokeStyle = 'rgba(240,244,255,0.95)';
  ctx.lineJoin = 'miter';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = -520; x <= 1160; x += 20) ctx[x === -520 ? 'moveTo' : 'lineTo'](x, pitchY(x) + TOUCH);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  linePts(ctx, [pitchPt(GL, 0), pitchPt(GL, 220)]);
  linePts(ctx, [pitchPt(GL, BOX.d0), pitchPt(BOX.u0, BOX.d0), pitchPt(BOX.u0, BOX.d1), pitchPt(GL, BOX.d1)]);
  linePts(ctx, [pitchPt(GL, SIX.d0), pitchPt(SIX.u0, SIX.d0), pitchPt(SIX.u0, SIX.d1), pitchPt(GL, SIX.d1)]);
  ctx.stroke();
  ctx.beginPath();
  const ru = 58, rd = 22, lim = Math.acos((SPOT.u - BOX.u0) / ru);
  for (let i = 0; i <= 16; i++) {
    const a = Math.PI - lim + (2 * lim * i) / 16;
    const [x, y] = pitchPt(SPOT.u + Math.cos(a) * ru, SPOT.d + Math.sin(a) * rd);
    ctx[i ? 'lineTo' : 'moveTo'](x, y);
  }
  ctx.stroke();
  const [sx, sy] = pitchPt(SPOT.u, SPOT.d);
  ctx.fillStyle = 'rgba(240,244,255,0.95)';
  ctx.fillRect(Math.round(sx) - 2, Math.round(sy) - 1, 4, 3);
}

/** Crowd (exact 2x, 10-px slices on the bowl curve), lettered ad boards, roof edge, trusses. */
function drawStand(env: Env) {
  const { ctx } = env;
  const st = env.art.stadium;
  const step = 5 * CROWD_SC;
  ctx.imageSmoothingEnabled = false;
  for (let i = 0; i * step < 1640; i++) {
    const x = -500 + i * step;
    const y = Math.round(roofY(x + step / 2) + ROOF_H);
    ctx.drawImage(st.crowd, 40 + i * 5, CROWD_SRC0, 5, CROWD_SRC_H, x, y, step, CROWD_H);
  }
  const PW = 74;
  ctx.save();
  ctx.font = `8px ${PIXEL_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let k = 0; k * PW < 1640; k++) {
    const x0 = -500 + k * PW, xm = x0 + PW / 2;
    const y0 = boardY(xm);
    const slope = -2 * CURVE * (xm - 320);
    ctx.save();
    ctx.translate(xm, y0 + BOARD_H / 2);
    ctx.rotate(Math.atan(slope));
    const hue = k % 3;
    ctx.fillStyle = '#05040b';
    ctx.fillRect(-PW / 2, -BOARD_H / 2 - 1, PW, BOARD_H + 2);
    ctx.fillStyle = hue === 0 ? '#b8142e' : hue === 1 ? '#e8ecff' : '#24206a';
    ctx.fillRect(-PW / 2 + 1, -BOARD_H / 2, PW - 2, BOARD_H);
    ctx.fillStyle = hue === 1 ? '#b8142e' : '#ffffff';
    ctx.fillText(ADS[k % ADS.length], 0, 0.5);
    ctx.restore();
  }
  ctx.restore();
  ctx.fillStyle = '#06040e';
  ctx.beginPath();
  for (let x = -520; x <= 1160; x += 16) ctx[x === -520 ? 'moveTo' : 'lineTo'](x, roofY(x) - 1);
  for (let x = 1160; x >= -520; x -= 16) ctx.lineTo(x, roofY(x) + ROOF_H + 1);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(150,140,220,0.55)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = -520; x <= 1160; x += 16) ctx[x === -520 ? 'moveTo' : 'lineTo'](x, roofY(x) - 1);
  ctx.stroke();
  ctx.fillStyle = '#06040e';
  for (let x = -500; x < 1160; x += 46) ctx.fillRect(Math.round(x), Math.round(roofY(x) - 6), 2, 6);
  ctx.globalCompositeOperation = 'lighter';
  for (let x = -160; x <= 800; x += 160) drawGlow(ctx, glowOf([120, 90, 200]), x, roofY(x) - 6, 120, 0.13, 1.4, 0.5);
  ctx.globalCompositeOperation = 'source-over';
}

/** The goal standing on the overhead turf (as in shot 4): on screen it hangs from the pitch. */
function drawGoalInv(ctx: CanvasRenderingContext2D) {
  const P = (u: number, d: number, h: number): [number, number] => {
    const [x, y] = pitchPt(u, d);
    return [x, y - h];
  };
  const H = GOAL_H, HB = GOAL_H * 0.62;
  ctx.strokeStyle = 'rgba(230,235,255,0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= 6; i++) {
    const v = i / 6;
    for (const d of [GOAL_D0, GOAL_D1]) linePts(ctx, [P(GL, d, H * v), P(GL + NET_D, d, HB * v)]);
    linePts(ctx, [P(GL + NET_D, GOAL_D0, HB * v), P(GL + NET_D, GOAL_D1, HB * v)]);
  }
  for (let i = 0; i <= 8; i++) {
    const d = lerp(GOAL_D0, GOAL_D1, i / 8);
    linePts(ctx, [P(GL, d, H), P(GL + NET_D, d, HB), P(GL + NET_D, d, 0)]);
  }
  for (let i = 1; i < 4; i++) {
    const u = GL + (NET_D * i) / 4;
    for (const d of [GOAL_D0, GOAL_D1]) linePts(ctx, [P(u, d, 0), P(u, d, lerp(H, HB, i / 4))]);
  }
  ctx.stroke();
  const post = (d: number) => {
    const [x, y] = P(GL, d, 0);
    const xr = Math.round(x);
    ctx.fillStyle = '#120c26';
    ctx.fillRect(xr - 2, Math.round(y - H) - 1, 5, H + 2);
    ctx.fillStyle = '#f4f6ff';
    ctx.fillRect(xr - 1, Math.round(y - H), 3, H);
  };
  post(GOAL_D0);
  ctx.strokeStyle = '#120c26';
  ctx.lineWidth = 5;
  ctx.beginPath();
  linePts(ctx, [P(GL, GOAL_D0, H), P(GL, GOAL_D1, H)]);
  ctx.stroke();
  ctx.strokeStyle = '#f4f6ff';
  ctx.lineWidth = 3;
  ctx.stroke();
  post(GOAL_D1);
}

/**
 * The stand sinks lower in frame during the whip-roll (a hidden tilt-up of the camera), so once
 * upright he is clearly high in the night sky above the crowd, not standing on the pitch.
 * (126 = the old 108 plus the 18 px the roof moved up when the layout was synced with shot 4,
 * so the upright composition is unchanged.)
 */
function standDY(t: number) {
  return 126 * ease.inOutCubic(clamp((t - WHIP0 - 0.04) / (WHIP1 - WHIP0 - 0.04)));
}

/** Night darkening of the pitch: none while inverted (it matches shot 4), in from the whip. */
function pitchDark(t: number) {
  return ease.outQuad(clamp((t - WHIP0) / 0.1));
}

function drawWorld(env: Env, t: number) {
  const { ctx } = env;
  const st = env.art.stadium;
  const dy = standDY(t);

  const g = ctx.createLinearGradient(0, -200 + dy, 0, 260 + dy);
  g.addColorStop(0, '#020109');
  g.addColorStop(0.45, '#0a0826');
  g.addColorStop(0.78, '#1b1446');
  g.addColorStop(1, '#30215e');
  ctx.fillStyle = g;
  ctx.fillRect(-600, -700, VW + 1300, VH + 1400);

  // Stars: frozen like shot 4 at first, twinkling again as time runs.
  ctx.fillStyle = '#dfe4ff';
  const tw = 0.15 * clamp(t / 0.4);
  for (const s of st.stars) {
    const x = s.x * 0.55 - 230, y = ((s.y + 1400) / 1520) * 360 - 170;
    if (y > roofY(x) + dy - 10) continue;
    ctx.globalAlpha = s.b * (0.85 + tw * Math.sin(t * 9 + s.x));
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
  }
  ctx.globalAlpha = 1;

  // Crescent moon.
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf([110, 120, 230]), MOON_X, MOON_Y, 200, 0.22);
  drawGlow(ctx, glowOf([210, 214, 255]), MOON_X, MOON_Y, 80, 0.16);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(46,44,104,0.6)';
  ctx.beginPath();
  ctx.arc(MOON_X, MOON_Y, MOON_R, 0, TAU);
  ctx.fill();
  ctx.save();
  crescentPath(ctx, MOON_X, MOON_Y, MOON_R, 0.62, MOON_BITE);
  ctx.clip();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(st.moon, MOON_X - MOON_R - 1, MOON_Y - MOON_R - 1, MOON_R * 2 + 2, MOON_R * 2 + 2);
  ctx.restore();

  // Clouds only in the upright sky (shot 4's inverted sky has none).
  const ca = 0.7 * ease.inOutCubic(clamp((t - WHIP0) / (WHIP1 - WHIP0)));
  if (ca > 0.01) {
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = ca;
    for (const [x, y, v] of CLOUDS) ctx.drawImage(st.cloud[v], x - 112 + t * 6, y - 40, 224, 80);
    ctx.globalAlpha = 1;
  }

  ctx.save();
  ctx.translate(0, Math.round(dy));
  for (const x of TOWERS) {
    const tw = towerLamp(x);
    ctx.save();
    ctx.translate(Math.round(tw.bx), Math.round(tw.by));
    ctx.rotate(tw.ang);
    drawTower(ctx);
    ctx.restore();
  }
  ctx.globalCompositeOperation = 'lighter';
  for (const x of TOWERS) {
    const tw = towerLamp(x);
    const tx = x > 320 ? 284 : 356;
    const ang = Math.atan2(-10 - tw.ly, tx - tw.lx);
    beam(ctx, tw.lx, tw.ly, ang, 0.2, 560, 0.15);
    beam(ctx, tw.lx, tw.ly, ang + (x > 320 ? 0.03 : -0.03), 0.07, 480, 0.13);
    drawGlow(ctx, glowOf([255, 246, 220]), tw.lx, tw.ly, 86, 0.42);
    drawGlow(ctx, glowOf([255, 255, 255]), tw.lx, tw.ly, 28, 0.8);
  }
  ctx.globalCompositeOperation = 'source-over';

  drawPitch(ctx, pitchDark(t));
  drawStand(env);
  ctx.restore();
}

/**
 * After the cold grade, inside its clip: keep the overhead turf green the way shot 4 does.
 * The goal is drawn after the grade (ungraded, as in shot 4).
 */
function regreenTurf(env: Env, t: number, green: number) {
  if (green <= 0) return;
  const { ctx } = env;
  env.world();
  ctx.save();
  ctx.translate(0, Math.round(standDY(t)));
  ctx.globalCompositeOperation = 'color';
  ctx.globalAlpha = 0.55 * green;
  ctx.fillStyle = 'rgb(70,160,110)';
  pitchPath(ctx);
  ctx.fill();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.3 * green;
  ctx.fillStyle = 'rgb(50,110,80)';
  pitchPath(ctx);
  ctx.fill();
  ctx.restore();
}

function drawGoal(env: Env, t: number) {
  const { ctx } = env;
  // The overhead goal belongs to the inverted view: fade it out during the whip so its corner
  // never pokes up at the bottom edge once the world is upright.
  const ga = 1 - clamp((t - WHIP0) / 0.25);
  if (ga <= 0) return;
  env.world();
  ctx.save();
  ctx.globalAlpha *= ga;
  ctx.translate(0, Math.round(standDY(t)));
  drawGoalInv(ctx);
  ctx.restore();
}

/**
 * Cold time-stop grade left over from shot 4, everywhere except inside a circle of radius R
 * around (cx, cy) (screen space): after contact, color floods back out of the ball.
 */
function grade(env: Env, cx: number, cy: number, R: number, amt: number, inClip?: () => void) {
  if (amt <= 0 || R > 760) return;
  const ctx = env.ctx;
  env.screen();
  ctx.save();
  if (R > 0) {
    ctx.beginPath();
    ctx.rect(-20, -20, VW + 40, VH + 40);
    ctx.arc(cx, cy, R, 0, TAU, true);
    ctx.clip('evenodd');
  }
  ctx.globalCompositeOperation = 'saturation';
  ctx.globalAlpha = 0.85 * amt;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, VW, VH);
  ctx.globalCompositeOperation = 'color';
  ctx.globalAlpha = 0.5 * amt;
  ctx.fillStyle = 'rgb(96,100,200)';
  ctx.fillRect(0, 0, VW, VH);
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.6 * amt;
  ctx.fillStyle = 'rgb(176,178,226)';
  ctx.fillRect(0, 0, VW, VH);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  if (inClip) inClip();
  ctx.restore();
  env.screen();
}

// ---------------------------------------------------------------- shot

export const shotCrescent: Shot = {
  name: 'The crescent',
  dur: DUR,
  seed: 105,
  rate: (t) => (t < HIT ? 1 : t < HIT + STOP ? 0.03 : t < REL ? 0.22 : 1),
  cues: [
    { at: 0.02, fn: (e) => e.sfx.whoosh(0.42, 380, 2800, 0.45) },
    { at: HIT, fn: (e) => { e.sfx.boom(1.3, 0.7); e.sfx.kick(1.3); e.sfx.crack(1); } },
    { at: WHIP0, fn: (e) => e.sfx.whoosh(0.34, 2600, 180, 0.55) },
    { at: REL, fn: (e) => { e.sfx.boom(0.6, 0.5); e.sfx.whoosh(0.5, 1600, 120, 0.45); } },
    // The comet's roar ends at the cut: shot 6 picks it up with its own roar (one roar, not two).
    { at: REL + 0.1, fn: (e) => e.sfx.roar(0.68, 0.55) },
    // Whip-pan out after the comet; shot 6's falling whoosh at 0 completes the swish.
    { at: DUR - WHIP_OUT, fn: (e) => e.sfx.whoosh(0.16, 700, 5000, 0.45) },
  ],
  init(env) {
    const { rng } = env;
    spin = new BallSpin();
    spin.rotate(0.4, 1, 0.2, 1.1);
    simT = 0;
    simHit = 0;
    hit = false;
    released = false;
    emitAcc = 0;
    flameAcc = 0;
    trail.clear();
    path.length = 0;
    streakPts.length = 0;

    // Ball waits exactly where the striking toe will meet it (same rule as shot 4).
    const ts = joints(STRIKE).toeN;
    const tl = Math.hypot(ts[0], ts[1]);
    [BX, BY] = jointWorld([ts[0] + (ts[0] / tl) * 5, ts[1] + (ts[1] / tl) * 5], HIP_X, HIP_Y, K, HD, FACE);
    ball = { x: BX, y: BY, vx: 0, vy: 0 };
    relX = BX;
    relY = BY;
    relDir = 0;

    A0 = toeAng(COCK);
    A1 = unwrap(toeAng(STRIKE), A0);

    // Camera flashes that pop all over the stand once time restarts.
    flashes = [];
    for (let i = 0; i < 90; i++) {
      const x = rng.range(-140, 860);
      const y = roofY(x) + ROOF_H + rng.range(0.06, 0.6) * CROWD_H;
      // most of them go off once the ball is gone and the stadium erupts
      const at = i < 20 ? rng.range(HIT + 0.05, REL) : rng.range(REL + 0.05, DUR);
      flashes.push({ x, y, r: rng.range(3.5, 7), at, rot: rng.range(0, 1) });
    }
    const [cx, cy, cz, cr] = camAt(0);
    env.cam.set(cx, cy, cz, cr);
  },
  update(env, t, dt) {
    const { rng, parts, cam } = env;
    simT += dt;
    spin.rotate(0.3, 1, 0.25, dt * (hit ? 40 : 8));
    const pose = heroPose();
    const [hx, hy] = hipNow();

    // Swing: the boot sheds embers and silver sparks off the crescent's leading tip.
    if (!hit) {
      const j = joints(pose);
      const [tx, ty] = jointWorld(j.toeN, hx, hy, K, HD, FACE);
      const a = Math.atan2(ty - hy, tx - hx);
      const sw = clamp((simT - WIND_T) / (HIT - WIND_T));
      const n = Math.round(2 + sw * 6);
      for (let i = 0; i < n; i++) {
        const back = a - Math.PI / 2 + rng.range(-0.4, 0.4); // trailing the swing (angle increases)
        const s = rng.range(30, 160) * (0.4 + sw);
        parts.spawn({
          kind: PK.Glow, x: tx + rng.range(-6, 6), y: ty + rng.range(-6, 6), vx: Math.cos(back) * s, vy: Math.sin(back) * s, drag: 3,
          max: rng.range(0.25, 0.55), s0: rng.range(3, 6), s1: 0.5, ramp: 'crimson', r0: 0.1, r1: 0.9, a0: 0.9, a1: 0, layer: 1,
        });
      }
      if (rng.next() < 0.3 + sw) {
        const out = a + rng.range(-0.3, 0.3);
        parts.spawn({
          kind: PK.Streak, x: tx, y: ty, vx: Math.cos(out) * rng.range(150, 400), vy: Math.sin(out) * rng.range(150, 400), drag: 3,
          max: rng.range(0.15, 0.35), s0: rng.range(1, 2), s1: 0.4, ramp: 'silver', r0: 0, r1: 1, k: 1.2, layer: 1,
        });
      }
    }

    // CONTACT.
    if (!hit && t >= HIT) {
      hit = true;
      simHit = simT;
      cam.hit(1);
      const dir = ballDir(0);
      ball.vx = Math.cos(dir) * 700;
      ball.vy = Math.sin(dir) * 700;
      ring(env, BX, BY, 8, 300, 0.55, 1, 'silver');
      ring(env, BX, BY, 6, 190, 0.5, 1, 'crimson');
      ring(env, BX, BY, 4, 130, 0.45, 0.35, 'silver', dir + Math.PI / 2);
      sparks(env, BX, BY, 60, 900, TAU, 0, 'silver');
      sparks(env, BX, BY, 30, 700, 1.6, dir, 'crimson');
      for (let i = 0; i < 36; i++) {
        const a = rng.range(0, TAU), s = rng.range(100, 480);
        parts.spawn({
          kind: PK.Glow, x: BX, y: BY, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 3,
          max: rng.range(0.4, 0.9), s0: rng.range(8, 18), s1: 2, ramp: 'crimson', r0: 0.35, r1: 1, a0: 0.8, a1: 0, layer: 1,
        });
      }
      // The crescent flares: embers burst off its whole length.
      for (let i = 0; i < 70; i++) {
        const a = lerp(A0, A1, rng.next()), r = R_ARC - rng.range(0, THICK * 0.8);
        const s = rng.range(40, 200);
        parts.spawn({
          kind: PK.Glow, x: HIP_X + Math.cos(a) * r, y: HIP_Y + Math.sin(a) * r, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 2.5,
          max: rng.range(0.5, 1.1), s0: rng.range(3, 6), s1: 0.5, ramp: 'crimson', r0: 0.05, r1: 0.9, a0: 1, a1: 0, layer: 1,
        });
      }
    }

    // RELEASE: time comes back to full speed, the ball tears away.
    if (hit && !released && t >= REL) {
      released = true;
      cam.hit(0.55);
      relX = ball.x;
      relY = ball.y;
      relDir = Math.atan2(ball.vy, ball.vx);
      ring(env, ball.x, ball.y, 6, 230, 0.5, 0.36, 'silver', relDir + Math.PI / 2);
      ring(env, ball.x, ball.y, 4, 150, 0.45, 0.36, 'crimson', relDir + Math.PI / 2);
      sparks(env, ball.x, ball.y, 40, 800, 1.2, relDir + Math.PI, 'silver');
    }

    if (hit) {
      const u = simT - simHit;
      const dir = ballDir(u);
      const sp = Math.hypot(ball.vx, ball.vy);
      const ns = released ? Math.min(2400, Math.max(sp, 760) + dt * 2600) : Math.min(900, sp + dt * 1200);
      ball.vx = Math.cos(dir) * ns;
      ball.vy = Math.sin(dir) * ns;
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      trail.push(ball.x, ball.y);
      const last = path[path.length - 1];
      if (!last || Math.hypot(ball.x - last.x, ball.y - last.y) > 10) {
        path.push({ x: ball.x, y: ball.y });
        if (path.length > 90) path.shift();
      }
      // meteorFlames spawns at least one flame per call; in the hit-stop that piles dozens of
      // frozen flames on the ball and blows it out to white, so feed it sim time in 1/60 s steps.
      flameAcc += dt;
      if (flameAcc >= 1 / 60) {
        if (ball.x < cam.x + 480) meteorFlames(env, ball.x, ball.y, 11, dir, released ? 0.9 : 0.4, flameAcc, 'crimson');
        flameAcc = 0;
      }

      // The crescent wanes: embers peel off it, most at the burning tail.
      const burn = burnAt(t);
      const RA = arcR(t);
      emitAcc += dt * (released ? 220 : 70);
      while (emitAcc >= 1) {
        emitAcc -= 1;
        const edge = rng.next() < 0.6 && burn > 0;
        const a = edge ? lerp(A0, A1, burn) + rng.range(-0.04, 0.2) : lerp(lerp(A0, A1, burn), A1, rng.next());
        const r = RA - rng.range(2, THICK * 0.8);
        const out = a + rng.range(-0.6, 0.6);
        const sp = edge ? rng.range(30, 110) : rng.range(10, 50);
        const px = rng.next() < 0.35;
        parts.spawn({
          kind: px ? PK.Pixel : PK.Glow, x: HIP_X + Math.cos(a) * r, y: HIP_Y + Math.sin(a) * r,
          vx: Math.cos(out) * sp, vy: Math.sin(out) * sp - 40, drag: 1.2,
          max: rng.range(0.5, 1.0), s0: px ? 2 : rng.range(3, 6.5), s1: px ? 1 : 0.5, ramp: px && rng.next() < 0.4 ? 'silver' : 'crimson',
          r0: px ? 0.1 : 0.05, r1: 0.9, a0: 1, a1: 0, layer: 1,
        });
      }
    }

    // His aura keeps shedding embers.
    if (rng.next() < 0.7) {
      const j = joints(pose);
      const p = rng.pick([j.neck, j.head, j.kneeN, j.toeN, j.toeF, j.hip]);
      const [x, y] = jointWorld(p, hx, hy, K, HD, FACE);
      parts.spawn({
        kind: PK.Glow, x: x + rng.range(-8, 8), y: y + rng.range(-8, 8), vx: rng.range(-30, 30), vy: rng.range(-60, 0),
        max: rng.range(0.4, 0.8), s0: rng.range(2, 4), s1: 0.5, ramp: 'crimson', r0: 0.2, r1: 0.9, a0: 0.8, a1: 0, layer: 1,
      });
    }

    const [cx, cy, cz, cr] = camAt(t);
    cam.set(cx, cy, cz, cr);
    cam.shakeAmp = 16;
  },
  render(env, t) {
    const { ctx, fx, cam } = env;
    const rng = env.frng();
    const sinceHit = t - HIT;
    const sinceRel = t - REL;
    const pose = heroPose();
    const [hx, hy] = hipNow();
    const j = joints(pose);
    const prog = arcProgress();
    const burn = burnAt(t);
    const RA = arcR(t);
    const whipU = clamp((t - WHIP0) / (WHIP1 - WHIP0));
    const whipV = Math.sin(Math.PI * whipU); // roll speed envelope

    env.world();
    drawWorld(env, t);

    // Camera flashes pop across the stand once time restarts.
    const sdy = standDY(t);
    ctx.globalCompositeOperation = 'lighter';
    for (const f of flashes) {
      const ph = (t - f.at) / 0.11;
      if (ph < 0 || ph > 1) continue;
      drawGlow(ctx, glowOf([235, 238, 255]), f.x, f.y + sdy, f.r * 3, 0.6 * (1 - ph));
    }
    ctx.globalCompositeOperation = 'source-over';
    for (const f of flashes) {
      const ph = (t - f.at) / 0.11;
      if (ph < 0 || ph > 1) continue;
      sparkle(ctx, f.x, f.y + sdy, f.r * (1.6 - ph), 1 - ph, f.rot);
    }

    env.parts.draw(ctx, 0);

    // Cold grade until contact; then color floods back out of the ball.
    const [bsx, bsy] = screenOf(env, BX, BY);
    const flood = sinceHit > 0.06 ? lerp(0, 820, ease.outCubic(clamp((sinceHit - 0.06) / 0.34))) : 0;
    grade(env, bsx, bsy, flood, GRADE_AMT, () => regreenTurf(env, t, TURF_GREEN * (1 - pitchDark(t))));
    drawGoal(env, t);

    // Impact frames: knock the busy upside-down stand down to a flat field so the two-tone
    // posterize reads as clean graphic shapes (hero, crescent, ball, moon echo).
    const impWin = sinceHit >= 0 && sinceHit < 0.1;
    if (impWin) {
      env.screen();
      ctx.fillStyle = 'rgba(4,2,14,0.9)';
      ctx.fillRect(0, 0, VW, VH);
      env.world();
      crescentPath(ctx, MOON_X, MOON_Y, MOON_R, 0.62, MOON_BITE);
      ctx.fillStyle = '#fff';
      ctx.fill();
    }

    env.world();
    // Dark halo behind him and the crescent so the fire reads against the crowd.
    if (!impWin) for (const [cx, cy, R, a] of [[HIP_X, HIP_Y, 190, 0.55], [hx, hy, 150, Math.min(0.5, Math.hypot(hx - HIP_X, hy - HIP_Y) / 80)]]) {
      if (a <= 0.01) continue;
      const hg = ctx.createRadialGradient(cx, cy, 30, cx, cy, R);
      hg.addColorStop(0, `rgba(6,3,20,${a})`);
      hg.addColorStop(0.6, `rgba(6,3,20,${a * 0.55})`);
      hg.addColorStop(1, 'rgba(6,3,20,0)');
      ctx.fillStyle = hg;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    }

    // THE CRESCENT: carved by the boot, then waning from its tail.
    {
      const a0 = lerp(A0, A1, burn);
      const th = THICK * (1 - 0.5 * burn) * (1 + 0.12 * pulse(t, HIT, 0.25));
      const al = 1 - ease.inQuad(clamp((t - 1.56) / 0.12));
      if (prog > 0.002 && al > 0) {
        // soft crimson glow volume under the blade (left out of the flat impact frames)
        ctx.globalCompositeOperation = 'lighter';
        const n = impWin ? -1 : 9;
        for (let i = 0; i <= n; i++) {
          const a = lerp(a0, lerp(A0, A1, prog), i / n);
          const w = Math.sin(Math.PI * (i / n));
          drawGlow(ctx, glowOf([200, 16, 56]), HIP_X + Math.cos(a) * (RA - 12), HIP_Y + Math.sin(a) * (RA - 12), 44, 0.22 * w * al);
        }
        ctx.globalCompositeOperation = 'source-over';
        crescentArc(ctx, HIP_X, HIP_Y, RA, a0, A1, th, burn > 0 ? 1 : prog, al);
        // contact flare: the whole blade flashes white-hot
        const fl = pulse(t, HIT, 0.3) * 0.6;
        if (fl > 0) {
          ctx.globalCompositeOperation = 'lighter';
          crescentArc(ctx, HIP_X, HIP_Y, RA - 4, a0, A1, th * 0.5, 1, fl * 0.8);
          ctx.globalCompositeOperation = 'source-over';
        }
      }
      // The last sliver of the crescent burns out in a silver glint.
      const gq = (t - 1.5) / 0.2;
      if (gq > 0 && gq < 1) {
        const ga = A1 - 0.12, gr = RA - THICK * 0.3;
        const gx = HIP_X + Math.cos(ga) * gr, gy = HIP_Y + Math.sin(ga) * gr;
        const ge = Math.sin(Math.PI * gq);
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, glowOf([255, 70, 120]), gx, gy, 40, 0.45 * ge);
        ctx.globalCompositeOperation = 'source-over';
        sparkle(ctx, gx, gy, 26 * ge, ge, 0.4 + gq * 0.8);
        sparkle(ctx, gx, gy, 12 * ge, ge * 0.8, 1.2 - gq);
      }
      // Swing lines: thin silver arcs trailing the boot inside and outside the blade.
      if (!hit && prog > 0.05) {
        const lead = lerp(A0, A1, prog);
        ctx.strokeStyle = '#e8ecff';
        for (let i = 0; i < 7; i++) {
          const r = R_ARC + (i - 3) * 9 + (i > 3 ? 12 : -16);
          const len = (0.4 + 0.25 * ((i * 37) % 5) / 5) * prog * 2.2;
          ctx.globalAlpha = 0.35 + 0.1 * (i % 3);
          ctx.lineWidth = i % 2 ? 1 : 1.5;
          const s0 = Math.max(A0, lead - len), s1 = lead - 0.06;
          if (s1 - s0 < 0.04) continue;
          ctx.beginPath();
          ctx.arc(HIP_X, HIP_Y, r, s0, s1);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
    }

    // Shot 4's snap focus lines (behind him) carry over the cut and die out.
    const carry = 1 - clamp(t / 0.12);
    if (carry > 0) {
      env.screen();
      focusLines(ctx, rng, bsx, bsy, 150, 760, 90, '#eef0ff', 0.4 * carry, 5);
      env.world();
    }

    // Hero: crimson aura volume, body, silver/crimson rim. In the impact frames he is one solid
    // white shape (silver on indigo, then black on crimson).
    if (impWin) {
      // A thin night-colored gap cuts him out of the crescent behind, so blade and body stay
      // two separate shapes after the posterize.
      const gap = renderPuppet(HERO_KIT, pose, { k: K, facing: FACE, silhouette: { fill: [4, 2, 14], rim: [4, 2, 14], rim2: [4, 2, 14], lx: 0, ly: -1 } });
      for (let i = 0; i < 8; i++) drawPuppet(ctx, gap, hx + Math.cos((i / 8) * TAU) * 3, hy + Math.sin((i / 8) * TAU) * 3, HD);
      const sil = renderPuppet(HERO_KIT, pose, { k: K, facing: FACE, silhouette: { fill: [255, 255, 255], rim: [255, 255, 255], rim2: [255, 255, 255], lx: 0, ly: -1 } });
      drawPuppet(ctx, sil, hx, hy, HD);
    } else {
      const auraA = 0.5 + 0.06 * Math.sin(t * 30) + pulse(t, HIT, 0.4) * 0.4;
      const aura = renderPuppet(HERO_KIT, pose, { k: K, facing: FACE, silhouette: { fill: [235, 26, 66], rim: [255, 180, 205], rim2: [255, 70, 110], lx: 0, ly: -1 } });
      ctx.globalCompositeOperation = 'lighter';
      drawPuppet(ctx, aura, hx, hy, HD * 1.13, auraA * 0.55);
      drawPuppet(ctx, aura, hx, hy, HD * 1.05, auraA);
      ctx.globalCompositeOperation = 'source-over';
      const body = renderPuppet(HERO_KIT, pose, { k: K, facing: FACE });
      drawPuppet(ctx, body, hx, hy, HD);
      const rim = renderPuppet(HERO_KIT, pose, { k: K, facing: FACE, silhouette: { fill: [0, 0, 0], rim: [210, 216, 255], rim2: [170, 20, 60], lx: -0.7, ly: -0.8 } });
      ctx.globalCompositeOperation = 'lighter';
      drawPuppet(ctx, rim, hx, hy, HD, 0.9);
      ctx.globalCompositeOperation = 'source-over';
    }

    // Boot flare riding the crescent's leading tip.
    if (!hit && prog > 0.02) {
      const [tx, ty] = jointWorld(j.toeN, hx, hy, K, HD, FACE);
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowSprite('crimson', 0.3), tx, ty, 26 + prog * 14, 0.5 + prog * 0.3);
      drawGlow(ctx, glowOf([255, 236, 244]), tx, ty, 9, 0.7);
      ctx.globalCompositeOperation = 'source-over';
    }

    // Crescent shockwave left behind as the comet tears away.
    if (sinceRel > 0 && sinceRel < 0.42) {
      const q = sinceRel / 0.42;
      const r = lerp(16, 230, ease.outCubic(q));
      silverArc(ctx, relX, relY, r, relDir - 1.05, relDir + 1.05, lerp(14, 3, q), 1 - q);
      const rb = lerp(12, 130, ease.outCubic(q));
      silverArc(ctx, relX, relY, rb, relDir + Math.PI - 0.8, relDir + Math.PI + 0.8, lerp(10, 2, q), (1 - q) * 0.8);
    }

    // Comet: long contrail, ribbon, the ball, two crescent blades orbiting it.
    if (hit) {
      if (path.length > 1) {
        streakPts.length = 0;
        for (const p of path) streakPts.push(p);
        streakPts.push({ x: ball.x, y: ball.y });
        // The contrail thins after the comet exits but stays alive so the whip-out chases it.
        crimsonRibbon(ctx, streakPts, 18, 0.6 * (1 - 0.6 * clamp((t - 1.3) / 0.3)) + 0.2 * whipOut(t));
      }
      cometRibbon(ctx, trail.pts, released ? 22 : 16, BALL_R * 2 * 2);
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowSprite('crimson', 0.3), ball.x, ball.y, 48, 0.55);
      ctx.globalCompositeOperation = 'source-over';
    }
    // Before contact the ball keeps shot 4's bob phase and its snap glow, settling in 0.2 s.
    const bx = hit ? ball.x : BX, by = hit ? ball.y : BY + Math.sin((t + S4_T) * 2.1) * 1.2;
    const k4 = ease.outQuad(clamp(t / 0.2));
    // Keep the crimson patches readable: hot but not blown out to a white blob.
    const heat = hit ? (released ? 0.9 : 0.7) : lerp(0.5, 0.15 + prog * 0.3, k4);
    drawBall(env, spin, bx, by, BALL_R, 2, heat, hit ? (released ? 1.0 : 0.6) : lerp(1.05, 0.5 + prog * 0.4, k4), 'crimson');
    {
      // Before contact: shot 4's lock-on crescents (same angle and radius as its last frame)
      // tighten onto the ball; after: they become blades.
      const la = hit ? t * 26 : S4_T * 1.4 + t * 3;
      const rr = hit ? 24 : lerp(16, 12, prog);
      const th = hit ? 8 : 5;
      const a = hit ? (released ? 1 : 0.8) : 0.8;
      const span = hit ? 0.34 : 0.36;
      if (!hit || sinceHit > 0.12) {
        for (let k = 0; k < 2; k++) {
          const a0 = la + k * Math.PI;
          crescentArc(ctx, bx, by, rr, a0, a0 + TAU * span, th, 1, a);
        }
      }
    }

    if (!impWin) env.parts.draw(ctx, 1);
    // During the hit-stop the frozen contact burst sits right on the ball; put the ball itself
    // back on top so its crimson patches read in the middle of the starburst.
    if (hit && !released && !impWin) drawBall(env, spin, bx, by, BALL_R, 2, heat, 0, 'crimson');

    // ---- screen space
    env.screen();
    const imp = pulse(t, HIT, 0.32);
    if (imp > 0) {
      focusLines(ctx, rng, bsx, bsy, 80, 820, impWin ? 90 : 60, '#eef0ff', impWin ? 0.9 : imp * 0.7, 4);
    }
    // Whip-roll streaks: concentric arcs swept around the frame.
    if (whipV > 0.02) {
      ctx.lineCap = 'round';
      for (let i = 0; i < 46; i++) {
        const r = 50 + rng.next() * 420;
        const a = rng.next() * TAU;
        const len = (0.25 + rng.next() * 0.5) * whipV;
        ctx.globalAlpha = (0.18 + rng.next() * 0.35) * whipV;
        ctx.strokeStyle = i % 4 === 0 ? '#ff4d7a' : '#e6eaff';
        ctx.lineWidth = rng.next() < 0.25 ? 2 : 1;
        ctx.beginPath();
        ctx.arc(VW / 2, VH / 2, r, a, a + len);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    // Whip-pan out: speed streaks along the whip heading.
    const wo = whipOut(t);
    if (wo > 0) {
      ctx.globalCompositeOperation = 'lighter';
      speedStreaks(ctx, rng, -60, -40, VW + 120, VH + 80, WHIP_DIR, 34, '#e8ecff', 0.55 * wo, 180);
      speedStreaks(ctx, rng, -60, -40, VW + 120, VH + 80, WHIP_DIR, 12, '#ff4d7a', 0.5 * wo, 150);
      ctx.globalCompositeOperation = 'source-over';
    }

    // ---- post
    const [hu, hv] = cam.toUV(HIP_X, HIP_Y);
    const [bu, bv] = cam.toUV(BX, BY);
    fx.bloom = impWin ? 0.35 : 1.0;
    fx.bloomThresh = 0.7;
    fx.contrast = 1.07;
    fx.vignette = 0.62 + imp * 0.25;
    fx.sat = sinceHit < 0 ? 0.92 : 1.06;
    const carryP = 1 - clamp(t / 0.1); // shot 4's snap blur/CA, carried over the cut
    fx.ca = 0.0016 + imp * 0.012 + whipV * 0.008 + carryP * 0.01 + wo * 0.008;

    // Impact frames: silver/indigo cut-out, then crimson/black negative.
    if (sinceHit >= 0 && sinceHit < 0.045) {
      fx.impact = 1;
      fx.impA = [14, 8, 46];
      fx.impB = [236, 240, 255];
      fx.impThresh = 0.45;
    } else if (sinceHit >= 0.045 && sinceHit < 0.1) {
      fx.impact = 1;
      fx.impA = [220, 22, 62];
      fx.impB = [10, 2, 12];
      fx.impThresh = 0.46;
    }

    // Slash split along the crescent.
    if (sinceHit > 0.03 && sinceHit < 0.5) {
      const q = (sinceHit - 0.03) / 0.47;
      const amt = Math.sin(Math.PI * Math.pow(q, 0.6));
      const rot = cam.rot;
      let s0 = A0 + rot - 0.08, s1 = A1 + rot + 0.12;
      s0 = ((s0 % TAU) + TAU) % TAU;
      s1 = s0 + (A1 - A0 + 0.2);
      const mid = (s0 + s1) / 2;
      fx.cut = 0.024 * amt;
      fx.cutX = hu;
      fx.cutY = hv;
      fx.cutR = ((RA - THICK * 0.3) * cam.zoom) / VH;
      fx.cutA0 = s0 > Math.PI ? s0 - TAU : s0;
      fx.cutA1 = fx.cutA0 + (s1 - s0);
      fx.cutDirX = -Math.sin(mid);
      fx.cutDirY = Math.cos(mid);
      fx.cutGlow = clamp(amt * 1.2);
      fx.cutWidth = 0.005;
      fx.cutColor = [240, 236, 255];
    }

    if (sinceHit > 0) {
      fx.shocks.push({ x: bu, y: bv, r: sinceHit * 1.3, s: 0.06 * clamp(1 - sinceHit * 1.6) });
    }
    if (sinceRel > 0) {
      const [ru, rv] = cam.toUV(relX, relY);
      fx.shocks.push({ x: ru, y: rv, r: sinceRel * 1.6, s: 0.045 * clamp(1 - sinceRel * 2) });
    }
    fx.radial = Math.max(whipV * 0.06, pulse(t, REL, 0.15) * 0.03);
    fx.radialX = 0.5;
    fx.radialY = 0.5;
    if (sinceRel > 0 && sinceRel < 0.25) {
      const [cu, cv] = cam.toUV(ball.x, ball.y);
      fx.radialX = clamp(cu);
      fx.radialY = clamp(cv);
    }
    if (carryP > 0) {
      fx.radial = 0.025 * carryP;
      fx.radialX = bu;
      fx.radialY = bv;
    }
    // Whip-out: a zoom-blur centre 3 UV off-screen along the heading is a near-linear motion
    // smear of about 3 * radial UV, whatever the zoom.
    if (wo > 0) {
      const [a0u, a0v] = cam.toUV(cam.x, cam.y);
      const [a1u, a1v] = cam.toUV(cam.x + Math.cos(WHIP_DIR) * 100, cam.y + Math.sin(WHIP_DIR) * 100);
      const kk = 3 / Math.hypot(a1u - a0u, a1v - a0v);
      fx.radial = Math.max(fx.radial, 0.02 * wo);
      fx.radialX = a0u + (a1u - a0u) * kk;
      fx.radialY = a0v + (a1v - a0v) * kk;
    }

    // Open: resolve out of shot 4's crimson snap (no white haze). Close: no flash at all, the
    // whip-pan carries the cut into shot 6.
    const crimsonIn = Math.pow(1 - clamp(t / 0.05), 1.5) * 0.85;
    fx.flash = Math.max(crimsonIn, pulse(t, HIT + 0.1, 0.1) * 0.2, pulse(t, REL, 0.08) * 0.18);
    fx.flashColor = crimsonIn > 0 ? [222, 26, 66] : [255, 232, 240];
  },
};
