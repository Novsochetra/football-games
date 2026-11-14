// SHOT 4 — INVERTED SKY: the signature beat of CRIMSON CRESCENT.
// At the top of his bicycle kick No.10 is upside down, and the camera hangs upside down with
// him: the stadium dangles from the top of the frame (the pitch overhead with its penalty box
// and an upside-down goal hanging from the grass, the crowd and ad boards upside down,
// floodlight towers hanging from the roof with their beams pouring down), the night sky and the
// crescent moon lie at the bottom. A crimson crescent shock rolls out of him and drains the
// world to indigo and silver: time stops (one silver/indigo "eclipse" frame). Dust, embers and
// camera flashes hang as points of light; one slow heartbeat; his kicking leg winds tighter while
// a crimson charge runs down it into the boot (it glints there); then everything snaps.
// The camera never stops: it opens still rolling out of shot 3's turn (same direction) and keeps
// turning and pushing in, decelerating into the snap (bullet time).

import type { Shot, Env } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { TAU, clamp, ease, lerp, type RGB } from '../../engine/math';
import { PK, drawGlow, glowOf, glowSprite } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { PIXEL_FONT, focusLines, lensFlare, ribbon, sparkle, type TrailPt } from '../../art/fx';
import { crescentArc, crescentPath, crimsonRibbon, drawBall, pulse, sparks } from './common';
import { S3, S45, STRIKE_ROT, at, bike, drawPlace, fi, keyAt, pivotOn, place, silOf, strikeBallOffset, type Place, type Pt } from './hero';
import { LIFTOFF_AIR, liftoffHero } from './shot3_liftoff';

const DUR = 1.9;
const SNAP = 1.75; // time restarts: everything rushes into the strike (shot 5)
const BEATS = [0.42]; // one slow heartbeat ("lub" at b, "dub" at b + DUB)
const DUB = 0.16;
const CHARGE0 = 0.95; // a crimson charge runs down the kicking leg into the boot...
const GLINT = 1.5; // ...and glints on it (the snap at SNAP releases it)
const NEG0 = 0.035, NEG1 = 0.075; // the time-stop negative ("eclipse") frames
const D = Math.PI / 180;

// No.10: the drawn Bicycle frames (west strip), shot 3's body 1.2x closer (S45 world px per sprite px),
// upside down at the top of the kick: rot = -spin = 1.75 about the pelvis, as shot 3 leaves him.
const HS = S45;
const ROT = 1.75;
const HIP_X = 292, HIP_Y = 176;
const BALL_R = 6;

// Reference framing: camera on (CAM_X, CAM_Y) rolled half a turn, so at zoom 1 the screen
// point (sx, sy) shows the world point (VW - sx, VH - sy). World "up" (the sky) is screen "down".
const CAM_X = 322, CAM_Y = 168;
const ROLL = -Math.PI;
// Roll: opens still turning out of shot 3's roll (rot keeps decreasing = the same direction), a
// fast part that settles in ~0.35 s plus a long drift (~27 deg through the freeze, so bullet time
// keeps turning) that decelerates into the snap and lands exactly on shot 5's opening roll
// (ROLL_END).
const ROLL0 = ROLL + 0.7, ROLL_END = ROLL - 0.07, ROLL_KICK = 0.15;
// End framing (at the cut into shot 5): camera centre and zoom are held to these exact values.
const CAM_XE = CAM_X - 8, CAM_YE = CAM_Y + 6;

// The stand, seen from below like the inside of a bowl: the roof line (sky side) sits at
// ROOF_Y in the middle and curves toward the sky at the sides. Below it (world) the crowd,
// the ad boards, then the pitch. Upside down on screen: the pitch hangs across the top.
// The crowd is drawn at an exact 2x (crisp 2-px fans).
const ROOF_Y = 188, ROOF_H = 12, CURVE = 0.0003;
const CROWD_SC = 2, CROWD_SRC0 = 62, CROWD_SRC_H = 36, CROWD_H = CROWD_SRC_H * CROWD_SC;
const BOARD_H = 9;
const roofY = (x: number) => ROOF_Y - CURVE * (x - 320) * (x - 320);
const boardY = (x: number) => roofY(x) + ROOF_H + CROWD_H;
const pitchY = (x: number) => boardY(x) + BOARD_H - 1;

// Pitch markings in a simple perspective toward the camera: u along the touchline, d = depth
// beyond the far touchline (toward the camera). Goal line at u = GL (the goal is +x: screen left).
const VPX = 320, PERSP = 0.0045, TOUCH = 7;
const GL = 520;
const pitchPt = (u: number, d: number): [number, number] => [VPX + (u - VPX) * (1 + d * PERSP), pitchY(u) + TOUCH + d];
const GOAL_D0 = 19, GOAL_D1 = 45, GOAL_H = 42, NET_D = 16;
const BOX = { u0: GL - 120, d0: 2, d1: 62 };
const SIX = { u0: GL - 40, d0: 9, d1: 55 };
const SPOT = { u: GL - 80, d: 32 };
const ADS = ['CRIMSON', 'No.10', 'CAM FC', 'SPECIAL', 'KICK OFF', 'MOON'];

const MOON_X = 110, MOON_Y = 54, MOON_R = 40, MOON_BITE = Math.PI * 0.2;
const ZEN_X = 320, ZEN_Y = -520; // the sky's zenith: the floodlight masts lean toward it
const TOWERS = [566, 74]; // world x (screen left, screen right)
const MAST = 30; // visible mast length below the roof (world px)

// Frames: shot 3 cuts on BK7 (cock); in the frozen time the hair and hem drift (BK7b), then the
// kicking leg winds into the coil and trembles there, BK8 <-> BK8b, ending on BK8 for the snap
// (library 3.4: no drawing held longer than 0.3 s).
const KEYS: [number, string][] = [[0, 'BK7'], [0.3, 'BK7b'], [0.6, 'BK8'], [0.9, 'BK8b'], [1.2, 'BK8'], [1.5, 'BK8b'], [1.75, 'BK8']];
function heroAt(t: number): Place {
  const b = bike();
  const [hx, hy] = hipPos(t);
  return place(b, fi(b, keyAt(KEYS, t)), hx, hy, HS, ROT, true);
}
// Effect passes (silhouette / tint copies of the drawn frame).
const AURA = { fill: [235, 26, 66] as RGB, rim: [255, 180, 205] as RGB, rim2: [255, 70, 110] as RGB, lx: 0, ly: -1 };
const RIM = { fill: [0, 0, 0] as RGB, rim: [200, 206, 255] as RGB, rim2: [150, 16, 50] as RGB, lx: -0.7, ly: -0.8 };

let spin = new BallSpin();
let snapped = false;
let glinted = false;
let emitAcc = 0;
let chargeAcc = 0;
let lastT = 0;
let BX = 0, BY = 0;
let ribbonL: Pt[] = [];
let flashes: { x: number; y: number; r: number; at: number; rot: number }[] = [];
const ribbonPts: TrailPt[] = [];

const freezeAmt = (t: number) => clamp((t - 0.03) / 0.08) * (1 - 0.6 * clamp((t - SNAP) / 0.15));
// The shock is already bursting out of his chest on the first frame of the shot.
const waveP = (t: number) => clamp((t + 0.01) / 0.43);
const waveR = (t: number) => lerp(10, 560, ease.outCubic(waveP(t)));
/** Charge running down the kicking leg (0 -> 1 from CHARGE0 to GLINT, then held). */
const chargeAmt = (t: number) => clamp((t - CHARGE0) / (GLINT - CHARGE0));
/** Roll-speed arcs carried over from shot 3, fading out over the first frames. */
const rollArcA = (t: number) => 1 - clamp(t / 0.22);

/** Camera roll: still turning at the cut, decelerating into the snap (bullet time). */
function camRoll(t: number) {
  const settle = ease.outCubic(clamp(t / 0.35));
  const u = clamp(t / SNAP);
  const drift = 0.65 * u + 0.35 * Math.sin((Math.PI / 2) * u);
  return ROLL_END + ROLL_KICK * (1 - settle) + (ROLL0 - ROLL_END - ROLL_KICK) * (1 - drift);
}

/** Slow push-in through the freeze (mostly linear so it keeps moving), 0 -> 1 at SNAP. */
function camPush(t: number) {
  const u = clamp(t / SNAP);
  return 0.5 * u + 0.5 * ease.inOutQuad(u);
}

/** Thin tapered arc (roll speed line; the same shape as shot 3's). */
function taperArc(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, a0: number, a1: number, w: number) {
  const N = 18;
  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const u = i / N, ang = lerp(a0, a1, u), rr = r + w * 0.5 * Math.sin(Math.PI * u);
    ctx[i ? 'lineTo' : 'moveTo'](cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr);
  }
  for (let i = N; i >= 0; i--) {
    const u = i / N, ang = lerp(a0, a1, u), rr = r - w * 0.5 * Math.sin(Math.PI * u);
    ctx.lineTo(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr);
  }
  ctx.closePath();
  ctx.fill();
}

function beatEnv(t: number) {
  let b = 0;
  for (const at of BEATS) b = Math.max(b, pulse(t, at, 0.34), 0.65 * pulse(t, at + DUB, 0.3));
  return b;
}

function hipPos(t: number): [number, number] {
  return [HIP_X, HIP_Y - 3 * Math.sin(t * 0.9)];
}

function screenOf(env: Env, x: number, y: number): [number, number] {
  const [u, v] = env.cam.toUV(x, y);
  return [u * VW, v * VH];
}

/** Floodlight beam: a soft cone from (x, y) along `ang`. */
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

function towerLamp(x: number): { bx: number; by: number; ang: number; lx: number; ly: number } {
  const bx = x, by = roofY(x) + 6;
  const ang = Math.atan2(ZEN_X - bx, -(ZEN_Y - by));
  const L = MAST + 15;
  return { bx, by, ang, lx: bx + Math.sin(ang) * L, ly: by - Math.cos(ang) * L };
}

/** Floodlight tower in its local frame (base at 0,0 inside the roof; "up" toward the zenith). */
function drawTower(ctx: CanvasRenderingContext2D) {
  const top = -MAST - 2, len = MAST + 8;
  // lattice mast: 6 px wide, dark body, lit edge on the moon side, cross-braces
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
  // lamp head: frame + 4x6 lamps, with a lit lower lip
  const hy = -MAST - 30;
  ctx.fillStyle = '#17142c';
  ctx.fillRect(-25, hy - 1, 50, 32);
  ctx.fillStyle = '#3a3566';
  ctx.fillRect(-24, hy, 48, 30);
  ctx.fillStyle = '#8a84c8';
  ctx.fillRect(-24, hy + 28, 48, 2);
  ctx.fillStyle = '#4a4590';
  ctx.fillRect(-6, hy + 30, 12, 3); // bracket onto the mast
  ctx.fillStyle = '#fffbea';
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) ctx.fillRect(-21 + c * 7, hy + 3 + r * 6, 5, 4);
}

/** Night sky, stars and the crescent moon (camera transform applied). The sky is kept clean
 * (no clouds) so the moon owns the bottom of the frame. (ox, oy) shifts the whole sky layer
 * (parallax: it follows the camera's push partway, so it slides against the stand). */
function drawSky(env: Env, ox = 0, oy = 0) {
  const { ctx } = env;
  const st = env.art.stadium;
  ctx.save();
  ctx.translate(ox, oy);
  // Deepest at the zenith (screen bottom), hazy violet near the stand roof.
  const g = ctx.createLinearGradient(0, -200, 0, 260);
  g.addColorStop(0, '#020109');
  g.addColorStop(0.45, '#0a0826');
  g.addColorStop(0.78, '#1b1446');
  g.addColorStop(1, '#30215e');
  ctx.fillStyle = g;
  ctx.fillRect(-500, -600, VW + 1000, VH + 1200);

  // Stars: frozen, no twinkle.
  ctx.fillStyle = '#dfe4ff';
  for (const s of st.stars) {
    const x = s.x * 0.55 - 230, y = ((s.y + 1400) / 1520) * 360 - 170;
    if (y > roofY(x) - 10) continue;
    ctx.globalAlpha = s.b * 0.85;
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
  }
  ctx.globalAlpha = 1;

  // Crescent moon (cut from the full-moon art), with a faint earthshine disk and halo.
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
  ctx.restore();
}

/** Floodlight towers hang from the stand roof; beams pour down (on screen) toward No.10. */
function drawFloodlights(env: Env) {
  const { ctx } = env;
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
}

function linePts(ctx: CanvasRenderingContext2D, pts: [number, number][]) {
  pts.forEach(([x, y], i) => ctx[i ? 'lineTo' : 'moveTo'](x, y));
}

/** Pitch overhead (beyond the ad boards): turf, mowing stripes, touchline, goal line, box, arc. */
function drawPitch(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#2b6e37';
  pitchPath(ctx);
  ctx.fill();
  ctx.save();
  pitchPath(ctx);
  ctx.clip();
  ctx.fillStyle = 'rgba(170,230,160,0.35)';
  for (let i = -10; i < 14; i++) {
    if (i & 1) continue;
    const u0 = i * 52, u1 = u0 + 52;
    ctx.beginPath();
    linePts(ctx, [pitchPt(u0, -TOUCH - 4), pitchPt(u1, -TOUCH - 4), pitchPt(u1, 260), pitchPt(u0, 260)]);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  ctx.strokeStyle = 'rgba(240,244,255,0.95)';
  ctx.lineJoin = 'miter';
  // touchline
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = -520; x <= 1160; x += 20) ctx[x === -520 ? 'moveTo' : 'lineTo'](x, pitchY(x) + TOUCH);
  ctx.stroke();
  // goal line, penalty box, six-yard box, spot and the D (3 px)
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

function pitchPath(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(-520, 1000);
  for (let x = -520; x <= 1160; x += 20) ctx.lineTo(x, pitchY(x));
  ctx.lineTo(1160, 1000);
  ctx.closePath();
}

/** Crowd, ad boards (their lettering upside down), roof edge and trusses. */
function drawStand(env: Env) {
  const { ctx } = env;
  const st = env.art.stadium;
  // Crowd in 10-px slices (exact 2x) that follow the bowl curve.
  const step = 5 * CROWD_SC;
  ctx.imageSmoothingEnabled = false;
  for (let i = 0; i * step < 1640; i++) {
    const x = -500 + i * step;
    const y = Math.round(roofY(x + step / 2) + ROOF_H);
    ctx.drawImage(st.crowd, 40 + i * 5, CROWD_SRC0, 5, CROWD_SRC_H, x, y, step, CROWD_H);
  }
  // Ad boards: lit panels with lettering, following the curve.
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
  // Roof edge (the lower rim of the stand on screen) with a cold highlight on the sky side.
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
  // roof trusses: short spars poking toward the sky
  ctx.fillStyle = '#06040e';
  for (let x = -500; x < 1160; x += 46) {
    const y = roofY(x);
    ctx.fillRect(Math.round(x), Math.round(y - 6), 2, 6);
  }
  // Haze of stadium light spilling over the roof.
  ctx.globalCompositeOperation = 'lighter';
  for (let x = -160; x <= 800; x += 160) drawGlow(ctx, glowOf([120, 90, 200]), x, roofY(x) - 6, 120, 0.13, 1.4, 0.5);
  ctx.globalCompositeOperation = 'source-over';
}

/**
 * The goal on the overhead turf. It stands on the grass (posts rise toward the sky = world -y),
 * so on screen it hangs DOWN from the pitch over the ad boards: the strongest "the ground is
 * above you" cue, and it sits on the goal side (screen left).
 */
function drawGoalInv(ctx: CanvasRenderingContext2D) {
  const P = (u: number, d: number, h: number): [number, number] => {
    const [x, y] = pitchPt(u, d);
    return [x, y - h];
  };
  const H = GOAL_H, HB = GOAL_H * 0.62;
  // net: side panels, roof and back, 1-px hatch
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
  // frame: dark keyline, then white posts (3 px) and crossbar
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

const GRADE_A = 0.8; // strength of the single 'color' pass of the time-stop grade

/**
 * Time-stop grade inside the expanding wave: drain to indigo/silver. Screen space.
 * Two full-screen passes only (phones): one 'color' pass replaces hue and saturation in one go
 * (no separate 'saturation' pass), then a cold multiply.
 */
function grade(env: Env, cx: number, cy: number, R: number, amt: number) {
  if (amt < 0.02 || R <= 0) return;
  const ctx = env.ctx;
  env.screen();
  ctx.save();
  if (R < 760) {
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.clip();
  }
  ctx.globalCompositeOperation = 'color';
  ctx.globalAlpha = GRADE_A * amt;
  ctx.fillStyle = 'rgb(104,108,190)';
  ctx.fillRect(0, 0, VW, VH);
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.7 * amt;
  ctx.fillStyle = 'rgb(176,178,226)';
  ctx.fillRect(0, 0, VW, VH);
  ctx.restore();
}

/** Filled tapered crescent (the shape of crescentArc's body) in the current fillStyle. */
function crescentFill(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, a0: number, a1: number, thick: number) {
  const N = 56;
  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const ang = a0 + ((a1 - a0) * i) / N;
    ctx[i ? 'lineTo' : 'moveTo'](cx + Math.cos(ang) * r, cy + Math.sin(ang) * r);
  }
  for (let i = N; i >= 0; i--) {
    const u = i / N;
    const ang = a0 + (a1 - a0) * u;
    const rr = r - thick * Math.pow(Math.sin(Math.PI * u), 0.75);
    ctx.lineTo(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr);
  }
  ctx.closePath();
  ctx.fill();
}

function buildRibbon(hp: Place) {
  ribbonPts.length = 0;
  for (let i = 0; i < ribbonL.length - 1; i++) ribbonPts.push({ x: hp.x + ribbonL[i][0], y: hp.y + ribbonL[i][1] });
  const [x, y] = at(hp, 'toeF');
  ribbonPts.push({ x, y });
}

export const shotInverted: Shot = {
  name: 'Inverted sky',
  dur: DUR,
  seed: 104,
  rate: (t) => (t < 0.16 ? lerp(0.55, 0.08, ease.outCubic(t / 0.16)) : t < SNAP ? 0.08 : 1.2),
  cues: [
    { at: 0, fn: (e) => { e.sfx.timeStop(1.75); e.sfx.whoosh(0.45, 2600, 180, 0.3); } },
    { at: BEATS[0], fn: (e) => e.sfx.boom(0.38, 0.35) },
    { at: BEATS[0] + DUB, fn: (e) => e.sfx.boom(0.24, 0.35) },
    { at: CHARGE0, fn: (e) => e.sfx.strain(0.55, 0.3) },
    { at: GLINT, fn: (e) => e.sfx.shing(0.8) },
    { at: SNAP - 0.05, fn: (e) => e.sfx.whoosh(0.22, 300, 5200, 0.5) },
  ],
  init(env) {
    const { rng, parts } = env;
    spin = new BallSpin();
    spin.rotate(0.4, 1, 0.2, 1.1);
    snapped = false;
    glinted = false;
    emitAcc = 0;
    chargeAcc = 0;
    lastT = 0;
    ribbonPts.length = 0;

    // The ball waits exactly where the strike will meet it (shot 5): on the BK10 instep.
    const bo = strikeBallOffset(HS, STRIKE_ROT, BALL_R * 2);
    BX = HIP_X + bo[0];
    BY = HIP_Y + bo[1];

    // The far boot's path through shot 3 (rise -> swing -> scissor -> cock), relative to his hip at
    // this shot's scale: frozen as a crimson ribbon.
    ribbonL = [];
    for (let i = 0; i <= 22; i++) {
      const lp = liftoffHero(lerp(LIFTOFF_AIR, 1.4 - 1e-4, i / 22));
      const [tx, ty] = at(lp, 'toeF');
      const [px, py] = at(lp, 'pelvis');
      ribbonL.push([((tx - px) * HS) / S3, ((ty - py) * HS) / S3]);
    }

    // Camera flashes in the crowd that will freeze mid-pop.
    flashes = [];
    for (let i = 0; i < 20; i++) {
      const x = rng.range(-120, 760);
      const y = roofY(x) + ROOF_H + rng.range(0.1, 0.9) * CROWD_H;
      flashes.push({ x, y, r: rng.range(3.5, 7), at: rng.range(0.04, 0.3), rot: rng.range(0, 1) });
    }

    // Dust motes hanging in the air (silver points), a few out-of-focus specks near camera.
    for (let i = 0; i < 260; i++) {
      const x = rng.range(-80, 720), y = rng.range(-60, 330);
      const a = rng.range(0, TAU), s = rng.range(4, 26);
      parts.spawn({
        kind: PK.Pixel, x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, max: 40,
        s0: rng.next() < 0.2 ? 2 : 1, s1: 1, ramp: 'silver', r0: rng.range(0, 0.5), r1: 0.5, a0: rng.range(0.35, 0.95), a1: 0.3, layer: 0,
      });
    }
    for (let i = 0; i < 26; i++) {
      const x = rng.range(-40, 680), y = rng.range(-20, 300);
      parts.spawn({
        kind: PK.Glow, x, y, vx: rng.range(-10, 10), vy: rng.range(-10, 10), max: 40,
        s0: rng.range(3, 7), s1: 3, ramp: 'silver', r0: 0.3, r1: 0.6, a0: rng.range(0.12, 0.3), a1: 0.1, layer: 0,
      });
    }
    // Crimson embers shed by his aura, hanging around him.
    for (let i = 0; i < 70; i++) {
      const a = rng.range(0, TAU), r = rng.range(30, 130);
      parts.spawn({
        kind: PK.Glow, x: HIP_X + Math.cos(a) * r * 1.2, y: HIP_Y + Math.sin(a) * r, vx: Math.cos(a) * rng.range(10, 40), vy: Math.sin(a) * rng.range(10, 40) - 20,
        max: 40, s0: rng.range(2, 4.5), s1: 1.5, ramp: 'crimson', r0: rng.range(0.15, 0.45), r1: 0.7, a0: rng.range(0.6, 1), a1: 0.4, layer: 1,
      });
    }
    // Turf flung up by the launch, still following him up.
    for (let i = 0; i < 14; i++) {
      parts.spawn({
        kind: PK.Debris, x: HIP_X + rng.range(-70, 60), y: HIP_Y + rng.range(30, 110), vx: rng.range(-40, 40), vy: rng.range(-60, 10), ay: 60,
        vrot: rng.range(-3, 3), rot: rng.range(0, TAU), max: 40, s0: rng.range(1.5, 3), s1: 2, ramp: 'grass', r0: rng.next(), r1: rng.next(), a0: 1, a1: 1, add: false, layer: 0,
      });
    }
    env.cam.set(CAM_XE + 14, CAM_YE - 10, 1.06, ROLL0);
  },
  update(env, t, dt) {
    const { rng, parts, cam } = env;
    spin.rotate(0.3, 1, 0.25, dt * 8);

    // Aura keeps shedding embers in (stopped) time.
    const hp = heroAt(t);
    if (!snapped) {
      emitAcc += dt * 160;
      const pts = ['neck', 'head', 'kneeN', 'toeN', 'toeF', 'handN', 'handF', 'pelvis'] as const;
      while (emitAcc >= 1) {
        emitAcc -= 1;
        const [x, y] = at(hp, rng.pick(pts));
        const a = rng.range(0, TAU);
        parts.spawn({
          kind: PK.Glow, x: x + rng.range(-8, 8), y: y + rng.range(-8, 8), vx: Math.cos(a) * 30, vy: Math.sin(a) * 30 - 40,
          max: rng.range(2, 4), s0: rng.range(2, 4), s1: 0.5, ramp: 'crimson', r0: 0.2, r1: 0.9, a0: 0.9, a1: 0, layer: 1,
        });
      }
    }

    // The charge running down the kicking leg sheds sparks that hang where it passed (time is
    // stopped), then a frozen spark crown bursts around the boot when it arrives.
    const rdt = t - lastT;
    lastT = t;
    const ch = chargeAmt(t);
    if (!snapped && ch > 0 && ch < 1) {
      const chain = (['pelvis', 'kneeN', 'ankleN', 'toeN'] as const).map((n) => at(hp, n));
      const u = clamp(ease.inQuad(ch) * 3, 0, 3);
      const k = Math.min(2, Math.floor(u)), f = u - k;
      const [px, py] = [lerp(chain[k][0], chain[k + 1][0], f), lerp(chain[k][1], chain[k + 1][1], f)];
      chargeAcc += rdt * 110;
      while (chargeAcc >= 1) {
        chargeAcc -= 1;
        const a = rng.range(0, TAU), sp = rng.range(20, 90);
        parts.spawn({
          kind: PK.Pixel, x: px + rng.range(-5, 5), y: py + rng.range(-5, 5), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, max: 40,
          s0: rng.next() < 0.3 ? 2 : 1, s1: 1, ramp: 'crimson', r0: rng.range(0, 0.35), r1: 0.6, a0: rng.range(0.7, 1), a1: 0.4, layer: 1,
        });
      }
    }
    if (!glinted && t >= GLINT) {
      glinted = true;
      const [tx, ty] = at(hp, 'toeN');
      sparks(env, tx, ty, 16, 260, TAU, 0, 'crimson');
    }

    // SNAP: time restarts, everything hanging in the air rushes into the ball.
    if (!snapped && t >= SNAP) {
      snapped = true;
      cam.hit(0.3);
      for (const p of parts.list) {
        if (p.kind !== PK.Pixel && p.kind !== PK.Glow) continue;
        const dx = BX - p.x, dy = BY - p.y;
        const l = Math.hypot(dx, dy) || 1;
        const sp = rng.range(700, 1300) * clamp(l / 220, 0.5, 1.5);
        p.kind = PK.Streak;
        p.vx = (dx / l) * sp;
        p.vy = (dy / l) * sp;
        p.ax = p.ay = 0;
        p.drag = 0;
        p.k = 1.6;
        p.s0 = p.s1 = rng.range(1, 2);
        p.max = p.life + Math.min(0.5, l / sp);
        p.a0 = Math.max(p.a0, 0.6);
        p.a1 = 0.2;
      }
    }

    // Camera: hangs upside down and never stops (bullet time): the roll carries on out of
    // shot 3's turn and decelerates into the snap, a steady push-in toward the ball, a breath on
    // the heartbeat, and a punch when time restarts. The push-in starts from a wider settle
    // (0.91) so it reads through the freeze; it ends exactly on shot 5's opening framing (1.19).
    const settle = ease.outCubic(clamp(t / 0.35));
    const push = camPush(t);
    const snapP = ease.outCubic(clamp((t - SNAP) / 0.15));
    cam.set(
      CAM_XE + 14 * (1 - push),
      CAM_YE - 10 * (1 - push),
      lerp(1.06, 0.91, settle) + push * 0.19 + beatEnv(t) * 0.035 + snapP * 0.09,
      camRoll(t),
    );
    cam.shakeAmp = 10;
  },
  render(env, t) {
    const { ctx, fx } = env;
    const rng = env.frng();
    const beat = beatEnv(t);
    const fz = freezeAmt(t);
    const hp = heroAt(t);
    const b = hp.a, fr = hp.i;
    const [hx, hy] = at(hp, 'pelvis');
    const [nkx, nky] = at(hp, 'neck');
    const [cxw, cyw] = [lerp(hx, nkx, 0.45), lerp(hy, nky, 0.45)]; // chest
    const [cx, cy] = screenOf(env, cxw, cyw);
    const [hu, hv] = env.cam.toUV(cxw, cyw);
    const snapT = t - SNAP;
    const snapP = clamp(snapT / 0.15);
    const wp = waveP(t);
    const R = waveR(t);
    const bob = Math.sin(t * 2.1) * 1.2;
    buildRibbon(hp);

    // ---- Time-stop "eclipse": one clean silver/indigo negative. Everything bright here turns
    // indigo, the black ground turns flat silver: No.10, his frozen boot path, the ball, the
    // moon and the crescent shock as one graphic cut-out.
    if (t >= NEG0 && t < NEG1) {
      env.screen();
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, VW, VH);
      env.world();
      ctx.fillStyle = '#fff';
      crescentPath(ctx, MOON_X, MOON_Y, MOON_R, 0.62, MOON_BITE);
      ctx.fill();
      ribbon(ctx, ribbonPts, 0, 9, '#fff', 1);
      drawPlace(ctx, hp, b.tinted(fr, [255, 255, 255]));
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(BX, BY + bob, BALL_R * 2 + 1, 0, TAU);
      ctx.fill();
      // the ring is held clear of his limbs and the ball so the cut-out stays one clean shape
      env.screen();
      const a0 = -0.9 + wp * 1.6;
      const rn = Math.max(R, 160) + 12;
      ctx.fillStyle = '#fff';
      crescentFill(ctx, cx, cy, rn, a0, a0 + TAU * 0.88, lerp(36, 14, wp) * 1.1);
      fx.impact = 1;
      fx.impA = [232, 236, 255];
      fx.impB = [18, 10, 50];
      fx.impThresh = 0.5;
      fx.bloom = 0.25;
      fx.vignette = 0.55;
      fx.ca = 0.001;
      fx.contrast = 1;
      fx.shocks.push({ x: hu, y: hv, r: rn / VH, s: 0.02 });
      return;
    }

    env.world();
    // The sky layer rides along with ~45% of the camera's push (far layer = parallax).
    const skyK = 0.45 * camPush(t);
    drawSky(env, -14 * skyK, 10 * skyK);
    drawFloodlights(env);
    drawPitch(ctx);
    drawStand(env);
    env.parts.draw(ctx, 0);

    // Time stops inside the crescent wave: indigo/silver grade.
    grade(env, cx, cy, R, fz);

    env.world();
    // Keep the turf overhead green and lit so it reads as grass hanging over his head.
    ctx.globalCompositeOperation = 'color';
    ctx.globalAlpha = 0.55 * fz;
    ctx.fillStyle = 'rgb(70,160,110)';
    pitchPath(ctx);
    ctx.fill();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.3 * fz;
    ctx.fillStyle = 'rgb(50,110,80)';
    pitchPath(ctx);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    drawGoalInv(ctx);
    // Frozen camera flashes in the upside-down crowd.
    for (const f of flashes) {
      const on = clamp((t - f.at) / 0.05) * (1 - clamp(snapT / 0.08));
      if (on <= 0) continue;
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf([220, 226, 255]), f.x, f.y, f.r * 2.6, 0.45 * on);
      ctx.globalCompositeOperation = 'source-over';
      sparkle(ctx, f.x, f.y, f.r * (t - f.at < 0.08 ? 1.6 : 1), on, f.rot);
    }

    // Frozen crimson ribbon: the path the far boot carved on the way up (a crescent).
    crimsonRibbon(ctx, ribbonPts, 20, (0.75 + 0.1 * Math.sin(t * 7)) * (1 - snapP));

    // Snap: silver focus lines slam onto the ball, behind No.10 so he stays crisp.
    const [bsx, bsy] = screenOf(env, BX, BY);
    if (snapT > 0) {
      env.screen();
      focusLines(ctx, rng, bsx, bsy, 150, 760, 90, '#eef0ff', 0.4 * clamp(snapT / 0.05), 5);
      env.world();
    }

    // Hero: dark halo to lift him off the crowd, soft crimson aura volume, crimson aura
    // silhouette (kept in color), cool frozen body, silver moon-side rim.
    {
      const hg = ctx.createRadialGradient(cxw, cyw, 20, cxw, cyw, 170);
      hg.addColorStop(0, 'rgba(6,3,20,0.5)');
      hg.addColorStop(0.6, 'rgba(6,3,20,0.25)');
      hg.addColorStop(1, 'rgba(6,3,20,0)');
      ctx.fillStyle = hg;
      ctx.fillRect(cxw - 170, cyw - 170, 340, 340);
      ctx.globalCompositeOperation = 'lighter';
      const glowA = 0.2 + beat * 0.16;
      for (const p of ['neck', 'head', 'kneeN', 'ankleN', 'toeF', 'pelvis', 'handN']) {
        const [x, y] = at(hp, p);
        drawGlow(ctx, glowOf([210, 20, 64]), x, y, 46, glowA);
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    const auraA = 0.44 + 0.05 * Math.sin(t * 6) + beat * 0.35;
    const aura = silOf(hp, AURA);
    ctx.globalCompositeOperation = 'lighter';
    drawPlace(ctx, hp, aura, auraA * 0.6, 1.14 + beat * 0.04);
    drawPlace(ctx, hp, aura, auraA, 1.05);
    ctx.globalCompositeOperation = 'source-over';
    drawPlace(ctx, hp);
    // Frozen grade on the body: hue/saturation from a cold silhouette, his own shading kept,
    // then a light multiply so skin sits a value step below the white rim (kit and face separate).
    if (fz > 0) {
      const cold = b.tinted(fr, [112, 116, 176]);
      ctx.globalCompositeOperation = 'color';
      drawPlace(ctx, hp, cold, 0.8 * fz);
      ctx.globalCompositeOperation = 'multiply';
      drawPlace(ctx, hp, cold, 0.35 * fz);
      ctx.globalCompositeOperation = 'source-over';
    }
    const rim = silOf(hp, RIM);
    ctx.globalCompositeOperation = 'lighter';
    drawPlace(ctx, hp, rim, 0.6);
    ctx.globalCompositeOperation = 'source-over';

    // The charge: a crimson current runs down the kicking leg (hip -> knee -> ankle -> toe) and
    // pools in the boot. The snap releases it into the strike.
    const ch = chargeAmt(t);
    const [tox, toy] = at(hp, 'toeN');
    if (ch > 0) {
      const chain = (['pelvis', 'kneeN', 'ankleN', 'toeN'] as const).map((n) => at(hp, n));
      const along = (u: number): [number, number] => {
        const k = Math.min(2, Math.floor(clamp(u, 0, 3)));
        const f = clamp(u - k);
        return [lerp(chain[k][0], chain[k + 1][0], f), lerp(chain[k][1], chain[k + 1][1], f)];
      };
      const u = ease.inQuad(ch) * 3;
      const rel = 1 - clamp(snapT / 0.1);
      // the boot darkens toward a burnt maroon (multiply in soft steps around the toe, with the dark
      // `rim` silhouette) so the crimson glow on top keeps the boot's shape instead of blowing out to white.
      ctx.globalCompositeOperation = 'multiply';
      for (const r of [30, 22, 14]) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(tox, toy, r, 0, TAU);
        ctx.clip();
        drawPlace(ctx, hp, rim, 0.24 * ch * (0.5 + 0.5 * rel));
        ctx.restore();
      }
      ctx.globalCompositeOperation = 'lighter';
      // the leg heats up behind the current
      for (let k = 1; k < 3; k++) drawGlow(ctx, glowOf([210, 20, 64]), chain[k][0], chain[k][1], 40, 0.3 * ch * rel);
      // the current: a hot head with a short fading tail
      if (ch < 1) {
        for (let k = 5; k >= 0; k--) {
          const [px, py] = along(u - k * 0.12);
          drawGlow(ctx, glowSprite('crimson', 0.4), px, py, (14 + 10 * ch) * (1 - k * 0.1), 0.7 * (1 - k / 6));
        }
        const [px, py] = along(u);
        drawGlow(ctx, glowOf([255, 236, 244]), px, py, 6 + 4 * ch, 0.8);
      }
      // the pool in the boot (crimson, with a small hot core: the boot keeps its shape)
      const throb = 0.9 + 0.1 * Math.sin(t * 38);
      drawGlow(ctx, glowOf([210, 18, 60]), tox, toy, 12 + 18 * ch, 0.5 * ch * throb * (0.6 + 0.4 * rel));
      drawGlow(ctx, glowSprite('crimson', 0.45), tox, toy, 3 + 3 * ch, 0.35 * ch * rel);
      ctx.globalCompositeOperation = 'source-over';
    }

    // The ball, hanging just past his raised foot; two lock-on crescents circle it.
    drawBall(env, spin, BX, BY + bob, BALL_R, 2, 0.1 + snapP * 0.4, 0.45 + beat * 0.25 + snapP * 0.6, 'crimson');
    const la = t * 1.4;
    for (let k = 0; k < 2; k++) {
      const a0 = la + k * Math.PI;
      crescentArc(ctx, BX, BY + bob, 22 - snapP * 6, a0, a0 + TAU * 0.36, 5, 1, 0.8 * clamp(t / 0.25));
    }

    env.parts.draw(ctx, 1);

    // Screen-space effects.
    env.screen();
    // The time-stop wave: a giant crimson crescent rolling out of him.
    if (wp > 0 && wp < 1) {
      const a0 = -0.9 + wp * 1.6;
      crescentArc(ctx, cx, cy, R, a0, a0 + TAU * 0.88, lerp(36, 14, wp), 1, 1 - ease.inQuad(wp));
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(226,232,255,${0.5 * (1 - wp)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, R + 2, 0, TAU);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    }
    // Heartbeats: a thin crescent pulse out of his chest.
    for (const b of BEATS) {
      const q = (t - b) / 0.5;
      if (q <= 0 || q >= 1) continue;
      const a0 = b * 3 + q * 0.8;
      crescentArc(ctx, cx, cy, 120 + ease.outCubic(q) * 260, a0, a0 + TAU * 0.58, 12 * (1 - q), 1, 0.55 * (1 - q) * (1 - q));
    }
    // Boot glint: the charge arrives in the boot (not another eye glint: shots 1, 2 and 8 own those).
    const gl = t < GLINT ? clamp(1 - (GLINT - t) / 0.06) : clamp(1 - (t - GLINT) / 0.3);
    if (gl > 0) {
      const [ex, ey] = screenOf(env, tox, toy);
      lensFlare(ctx, ex, ey, 30, gl * 0.3, [255, 120, 150]);
      sparkle(ctx, ex, ey, 32 * gl, gl, 0.3 + t * 1.5);
      sparkle(ctx, ex, ey, 13 * gl, gl * 0.8, 1.1 - t);
    }

    // Roll-speed arcs carried over from shot 3 (the same motion language across the cut).
    const rollA = rollArcA(t);
    if (rollA > 0) {
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 18; i++) {
        const r = rng.range(170, 440);
        const a0 = rng.range(0, TAU);
        const len = rng.range(0.25, 0.6);
        ctx.fillStyle = i < 5 ? 'rgb(222,26,66)' : 'rgb(225,232,255)';
        ctx.globalAlpha = rollA * rng.range(0.25, 0.55);
        taperArc(ctx, VW / 2, VH / 2, r, a0, a0 + len, rng.range(2, 4.5));
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    // Post.
    fx.bloom = 0.95;
    fx.bloomThresh = 0.7 + 0.1 * fz;
    fx.contrast = 1.08;
    fx.vignette = 0.72 + beat * 0.3;
    fx.ca = 0.0016 + (wp > 0 && wp < 1 ? 0.006 * (1 - wp) : 0) + snapP * 0.01;
    if (wp > 0 && wp < 1) fx.shocks.push({ x: hu, y: hv, r: R / VH, s: 0.03 * (1 - wp) });
    for (const b of BEATS) {
      const q = (t - b) / 0.5;
      if (q > 0 && q < 1) fx.shocks.push({ x: hu, y: hv, r: (120 + ease.outCubic(q) * 260) / VH, s: 0.014 * (1 - q) });
    }
    if (snapT > 0) {
      const [bu, bv] = env.cam.toUV(BX, BY);
      fx.radial = 0.025 * snapP;
      fx.radialX = bu;
      fx.radialY = bv;
    }
    // No flash in: the shot opens clean on the rolling image (roll match out of shot 3), the
    // eclipse negative is the switch. A short silver after-glow out of the negative, a silver pop
    // on the snap, then the crimson snap into shot 5 on the last three frames (0.10/0.47/0.81).
    const afterF = pulse(t, NEG1, 0.07) * 0.2;
    const snapF = pulse(t, SNAP, 0.06) * 0.3;
    const crimsonOut = clamp((t - (DUR - 0.055)) / 0.04) * 0.85;
    fx.flash = Math.max(afterF, snapF, crimsonOut);
    fx.flashColor = crimsonOut > snapF ? [222, 26, 66] : [236, 240, 255];
  },
};
