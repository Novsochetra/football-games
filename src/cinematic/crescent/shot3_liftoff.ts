// SHOT 3 — LIFT-OFF: side view at grass level under the indigo night. No.10 (back to goal,
// facing left) sinks onto his plant foot; the stamp cracks the turf into a glowing crimson
// crescent crater. He springs up, the far boot swinging over his head on a crimson ribbon,
// and the camera rolls with his rotation while it pushes in: by the cut the whole stadium
// is tilted ~70° and the high cross is dropping toward his raised foot.

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { TAU, clamp, ease, lerp, type RGB, type Rng } from '../../engine/math';
import { PK, drawGlow, glowOf, glowSprite } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { focusLines, makeCracks, ribbon, speedStreaks, sparkle } from '../../art/fx';
import { Trail, crescentPath, crimsonRibbon, drawBall, grassChunks, pulse, ring, sparks, warp } from './common';
import { S3, STRIKE_ROT, at, bike, drawPlace, fi, keyAt, pivotOn, place, silOf, strikeBallOffset, type Place, type Pt } from './hero';

const DUR = 1.4;
const PLANT = 0.35; // the plant foot stamps: crescent crater + launch
const HS_LEN = 0.06; // hit-stop on the stamp
const HS_RATE = 0.12;
const GROUND = 300;
const D = 2; // draw scale of the ball (and of the hero's pixels: S3)
const HIP_X0 = 298;
const SPIN_END = 1.75; // his whole-body spin at the cut (BK7 cock, as shot 4 holds it)
const FOLLOW = 0.7; // how much of his rotation the camera rolls with (0.7 * 1.75 = ~70°)
// Opening camera (world == every parallax layer at this camera position): low, lots of sky.
const C0X = 325, C0Y = 148, Z0 = 0.9;
const Z_END = 1.42;
// Crescent moon (sky layer) — same phase/orientation as shot 2.
const MOON_X = 150, MOON_Y = 40, MOON_R = 19;

/** Animation clock: real time with the stamp's hit-stop folded in (everything freezes together). */
function anim(t: number) {
  if (t < PLANT) return t;
  if (t < PLANT + HS_LEN) return PLANT + (t - PLANT) * HS_RATE;
  return t - HS_LEN * (1 - HS_RATE);
}
/** Shot time for an animation-clock time (inverse of anim). */
function tOf(a: number) {
  if (a < PLANT) return a;
  if (a < PLANT + HS_LEN * HS_RATE) return PLANT + (a - PLANT) / HS_RATE;
  return a + HS_LEN * (1 - HS_RATE);
}
const A_END = anim(DUR);

// ---- No.10: the drawn Bicycle frames (studio "Sochetra"), west strip (he faces -x, back to goal).
// Frame windows in shot time (library 3.4, round 2): the gather, the stamp ON the plant (held through the
// hit-stop), the spring onto the toe, then airborne rise -> swing -> scissor -> cock.
const T_AIR = 0.54; // BK4: off the turf
const KEYS: [number, string][] = [[0, 'BK1'], [PLANT, 'BK2'], [0.44, 'BK3'], [T_AIR, 'BK4'], [0.72, 'BK5'], [0.92, 'BK6'], [1.18, 'BK7']];
// Planted contact pixels (world x of the contact pixel's bottom centre, on the turf line). BK1 stands on
// the far toe with the plant knee thrust up in front; the plant boot stamps straight down a step ahead
// (BK2, flat: the crater is cut under it) and rolls onto its toe tip without the toe moving (BK3: the
// toe pixel x 76 is the same world point in BK2 and BK3). Ground frames pivot their spin on the contact.
const C1X = 296, C2X = 285, C3X = C2X - 4 * S3;
// Top of the jump: the hip where shot 4's roll-match picks him up (unchanged framing).
const APEX: Pt = [322, 84.4];
const A_AIR = anim(T_AIR);
const A_APEX = PLANT + 0.92;

/** Whole-body rotation (clockwise on screen): smooth, still turning at the cut. rot = -spin. */
function spinCW(a: number) {
  const u = clamp((a - PLANT + 0.02) / (A_END - PLANT + 0.02));
  return SPIN_END * u * (0.3 + 1.4 * u - 0.7 * u * u);
}

let takeoff: Pt | null = null;
/** BK3's pelvis at the instant he leaves the turf (start of the flight). */
function takeoffHip(): Pt {
  if (!takeoff) takeoff = at(heroAt(T_AIR - 1e-4), 'pelvis');
  return takeoff;
}

/** Flight path of the pelvis: from the spring (BK3) up to the apex, drifting back toward goal (+x). */
function flightHip(a: number): Pt {
  const p3 = takeoffHip();
  const oldX = (q: number) => HIP_X0 + 24 * ease.inOutQuad(clamp((q - PLANT) / 1.0));
  const ux = clamp((a - A_AIR) / (A_END - A_AIR));
  const uy = clamp((a - A_AIR) / (A_APEX - A_AIR));
  return [oldX(a) + (p3[0] - oldX(A_AIR)) * (1 - ux) * (1 - ux), lerp(p3[1], APEX[1], ease.outCubic(uy))];
}

/** No.10 at shot time t: ground frames stand on their contact pixel, airborne ones ride the pelvis. */
function heroAt(t: number): Place {
  const b = bike();
  const name = keyAt(KEYS, t);
  const i = fi(b, name);
  const a = anim(t);
  const rot = spinCW(a);
  if (t < T_AIR) return place(b, i, name === 'BK1' ? C1X : name === 'BK2' ? C2X : C3X, GROUND, S3, rot, true, true);
  const [x, y] = flightHip(a);
  return place(b, i, x, y, S3, rot, true);
}

/** No.10's placement at shot-3 time t (shot 4 freezes the far boot's path from it). */
export const liftoffHero = (t: number) => heroAt(t);
/** Shot-3 time where he leaves the turf (BK4). */
export const LIFTOFF_AIR = T_AIR;

/** Pelvis (world) at animation time a: the camera frames it and the climb speed is taken from it. */
function hipAt(a: number): Pt {
  return at(heroAt(tOf(a)), 'pelvis');
}

// Effect passes of the drawn frames (silhouette copies, rim on the world-space light side).
const GHOST = { fill: [150, 10, 50] as RGB, rim: [255, 120, 150] as RGB, rim2: [222, 26, 66] as RGB, lx: 0, ly: 1 };
const AURA = { fill: [200, 20, 60] as RGB, rim: [245, 245, 255] as RGB, rim2: [255, 130, 160] as RGB, lx: 0.6, ly: -1 };

// The cross: high from the right wing, already in the top-right corner on the smash cut,
// dropping in and then hanging as time slows. It settles exactly where shot 4 holds it relative
// to his hip (the apex hip + the BK10 strike ball offset at this shot's scale and ball size: shot 4
// is the same body 1.2x closer), so ball, hero and stadium turn together across the roll-match cut.
const BX0 = 640, BY0 = -12;
const BALL_R = 5;
let ballEnd: Pt | null = null;
function ballEndPt(): Pt {
  if (!ballEnd) {
    const o = strikeBallOffset(S3, STRIKE_ROT, BALL_R * D);
    ballEnd = [APEX[0] + o[0], APEX[1] + o[1]];
  }
  return ballEnd;
}
const BALL_IN = 0.19; // floodlight glint on the cross as it starts to drop
// Smash-cut open: the camera lands punched-in and kicks back out.
const KICK = 0.08, KICK_T = 0.14;
const PAN0 = 26, PAN_T = 0.24; // ...while already panning off the cross onto him
function ballAt(a: number): [number, number] {
  const u = clamp(a / A_END);
  const [BX1, BY1] = ballEndPt();
  return [lerp(BX0, BX1, 1 - Math.pow(1 - u, 1.3)), BY1 - (BY1 - BY0) * Math.exp(-a * 5)];
}

function camAt(a: number) {
  const [hx, hy] = hipAt(a);
  const [bx, by] = ballAt(a);
  // Frame his whole body (hip sits above its centre) and lean toward the incoming ball.
  const tx = lerp(hx + 14, bx, 0.26), ty = lerp(hy + 18, by, 0.26);
  const pre = ease.inOutQuad(clamp(a / PLANT));
  const follow = ease.inOutQuad(clamp((a - 0.3) / 0.5));
  const zoom = Z0 + 0.08 * pre + (Z_END - Z0 - 0.08) * ease.inOutQuad(clamp((a - 0.36) / (A_END - 0.36)));
  const rot = -FOLLOW * spinCW(a);
  const k = 1 - ease.outCubic(clamp(a / KICK_T));
  const drift = PAN0 * (1 - ease.outCubic(clamp(a / PAN_T)));
  return { x: lerp(C0X + drift, tx, follow), y: lerp(C0Y + 34 * pre, ty, follow), zoom: zoom * (1 + KICK * k), rot };
}

/** Roll speed (rad/s) for speed arcs and blur. */
function rollSpeed(a: number) {
  return Math.abs(camAt(a + 0.01).rot - camAt(a - 0.01).rot) / 0.02;
}

/** Hip climb speed (px/s). */
function riseSpeed(a: number) {
  return Math.max(0, hipAt(a - 0.01)[1] - hipAt(a + 0.01)[1]) / 0.02;
}

let spin = new BallSpin();
let planted = false;
let craterX = 0;
let cracks: ReturnType<typeof makeCracks> = [];
let turf: { x: number; y: number; s: number; c: number }[] = [];
const ballTrail = new Trail(14);
const farTrail = new Trail(28);
const launchTrail = new Trail(16);

/**
 * Parallax layer: content authored in world coordinates as seen from the opening camera.
 * f = parallax factor (0 = infinitely far, 1 = world); far layers barely zoom (dolly push-in),
 * but every layer rolls with the camera.
 */
function layer(env: Env, f: number) {
  const { ctx, cam } = env;
  env.world();
  const k = (1 + (cam.zoom - 1) * f) / cam.zoom;
  ctx.translate(cam.x, cam.y);
  ctx.scale(k, k);
  ctx.translate(-C0X - (cam.x - C0X) * f, -C0Y - (cam.y - C0Y) * f);
}

/** Thin tapered arc (speed line for the roll). */
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

function drawSky(env: Env, t: number) {
  const { ctx } = env;
  const st = env.art.stadium;
  const sky = ctx.createLinearGradient(0, -520, 0, 130);
  sky.addColorStop(0, '#020108');
  sky.addColorStop(0.55, '#0a0722');
  sky.addColorStop(0.86, '#171040');
  sky.addColorStop(1, '#2a1650');
  ctx.fillStyle = sky;
  ctx.fillRect(-1400, -1600, 3400, 3400);
  // Stars.
  ctx.fillStyle = '#dfe4ff';
  for (const s of st.stars) {
    const x = (s.x % 1500) - 420;
    const y = (s.y + 1400) * 0.55 - 680;
    if (y > 100) continue;
    ctx.globalAlpha = s.b * (0.55 + 0.45 * Math.sin(t * 4 + s.x));
    ctx.fillRect(Math.round(x), Math.round(y), 1, s.b > 0.85 ? 2 : 1);
  }
  ctx.globalAlpha = 1;
  // Crescent moon: halo, faint earthshine disk, crisp lit crescent.
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf([120, 130, 230]), MOON_X, MOON_Y, MOON_R * 5, 0.3);
  drawGlow(ctx, glowOf([220, 228, 255]), MOON_X, MOON_Y, MOON_R * 2.2, 0.24);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(40,40,90,0.55)';
  ctx.beginPath();
  ctx.arc(MOON_X, MOON_Y, MOON_R, 0, TAU);
  ctx.fill();
  ctx.save();
  crescentPath(ctx, MOON_X, MOON_Y, MOON_R, 0.62, -0.75);
  ctx.clip();
  ctx.drawImage(st.moon, MOON_X - MOON_R, MOON_Y - MOON_R, MOON_R * 2, MOON_R * 2);
  ctx.restore();
  // Thin cloud bands.
  ctx.globalAlpha = 0.24;
  ctx.drawImage(st.cloud[1], MOON_X - 130 + t * 12, MOON_Y + 4, 230, 62);
  ctx.drawImage(st.cloud[2], 420 + t * 8, -40, 200, 54);
  ctx.globalAlpha = 1;
}

function drawLights(env: Env, t: number) {
  const { ctx } = env;
  const st = env.art.stadium;
  for (const [x, flip] of [[34, 1], [700, -1]] as const) {
    ctx.save();
    ctx.translate(x, -24);
    ctx.scale(flip * 1.5, 1.5);
    ctx.drawImage(st.tower, -20, 0);
    ctx.restore();
  }
  ctx.globalCompositeOperation = 'lighter';
  for (const [x, dir] of [[34, 1], [700, -1]] as const) {
    // Soft beams angled down onto the box.
    for (const [ex, w] of [[180, 50], [300, 80]] as const) {
      const bx = x + dir * ex;
      const g = ctx.createLinearGradient(x, 0, bx, 260);
      g.addColorStop(0, 'rgba(200,210,255,0.08)');
      g.addColorStop(1, 'rgba(200,210,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x - 8, 0);
      ctx.lineTo(x + 8, 0);
      ctx.lineTo(bx + w, 260);
      ctx.lineTo(bx - w, 260);
      ctx.closePath();
      ctx.fill();
    }
    const fl = 0.92 + 0.08 * Math.sin(t * 31 + x);
    drawGlow(ctx, glowOf([190, 200, 255]), x, -2, 120, 0.3 * fl);
    drawGlow(ctx, glowOf([255, 255, 255]), x, -2, 30, 0.9);
  }
  ctx.globalCompositeOperation = 'source-over';
}

function drawStands(env: Env, t: number) {
  const { ctx } = env;
  const st = env.art.stadium;
  ctx.imageSmoothingEnabled = false;
  // Crowd bowl under a dark wash.
  ctx.globalAlpha = 0.9;
  ctx.drawImage(st.crowd, 0, 0, 1600, 100, -700, 124, 1600, 100);
  ctx.drawImage(st.crowd, 0, 0, 1000, 100, 900, 124, 1000, 100);
  ctx.globalAlpha = 1;
  const wash = ctx.createLinearGradient(0, 120, 0, 226);
  wash.addColorStop(0, 'rgba(6,4,20,0.78)');
  wash.addColorStop(1, 'rgba(14,10,40,0.45)');
  ctx.fillStyle = wash;
  ctx.fillRect(-1400, 120, 3400, 106);
  // Roof edge with a silver underside line + lamps.
  ctx.fillStyle = '#05030c';
  ctx.fillRect(-1400, 104, 3400, 20);
  ctx.fillStyle = 'rgba(170,180,240,0.35)';
  ctx.fillRect(-1400, 123, 3400, 1);
  ctx.fillStyle = '#e8ecff';
  for (let x = -1380; x < 2000; x += 26) ctx.fillRect(x, 119, 3, 2);
  // Camera flashes in the crowd.
  ctx.globalCompositeOperation = 'lighter';
  for (const f of st.flashes) {
    const ph = (t * 1.5 + f.t) % 1.7;
    if (ph > 0.1) continue;
    drawGlow(ctx, glowOf([235, 240, 255]), f.x - 500, 128 + f.y * 0.95, 5, 1 - ph / 0.1);
  }
  ctx.globalCompositeOperation = 'source-over';
  // LED boards: crimson / silver panels.
  ctx.fillStyle = '#05040b';
  ctx.fillRect(-1400, 222, 3400, 13);
  for (let x = -1380; x < 2000; x += 64) {
    ctx.fillStyle = (x / 64) & 1 ? 'rgba(222,26,66,0.8)' : 'rgba(200,210,255,0.55)';
    ctx.fillRect(x + 4, 226, 50, 5);
  }
  // Far pitch band (stretches far down so the rolled frame never runs out of grass).
  const g = ctx.createLinearGradient(0, 235, 0, 330);
  g.addColorStop(0, '#0b2216');
  g.addColorStop(1, '#16452a');
  ctx.fillStyle = g;
  ctx.fillRect(-1400, 235, 3400, 1800);
  ctx.fillStyle = 'rgba(40,110,60,0.22)';
  for (let x = -1400; x < 2000; x += 120) {
    ctx.beginPath();
    ctx.moveTo(x, 235);
    ctx.lineTo(x + 60, 235);
    ctx.lineTo(x + 60 + 220, 600);
    ctx.lineTo(x + 220, 600);
    ctx.closePath();
    ctx.fill();
  }
  // Far box line.
  ctx.fillStyle = 'rgba(220,228,255,0.35)';
  ctx.fillRect(-1400, 252, 3400, 1);
}

function drawNearPitch(env: Env) {
  const { ctx } = env;
  const top = 246;
  const g = ctx.createLinearGradient(0, top, 0, top + 30);
  g.addColorStop(0, 'rgba(22,64,38,0)');
  g.addColorStop(1, 'rgba(24,72,40,1)');
  ctx.fillStyle = g;
  ctx.fillRect(-1200, top, 3000, 30);
  ctx.fillStyle = '#184828';
  ctx.fillRect(-1200, top + 30, 3000, 2000);
  // Mowing stripes.
  ctx.fillStyle = 'rgba(70,150,80,0.14)';
  for (let x = -1200; x < 1800; x += 110) {
    ctx.beginPath();
    ctx.moveTo(x, top + 16);
    ctx.lineTo(x + 55, top + 16);
    ctx.lineTo(x + 55 + 300, 900);
    ctx.lineTo(x + 300, 900);
    ctx.closePath();
    ctx.fill();
  }
  // Static grass speckle.
  for (const p of turf) {
    ctx.fillStyle = p.c ? 'rgba(12,40,22,0.55)' : 'rgba(110,190,120,0.22)';
    ctx.fillRect(p.x, p.y, p.s, 1);
  }
}

/** The crescent crater cracked into the turf by the plant foot. */
// The thick belly sits under the plant boot and the two horns open out in front of him (-x),
// where neither leg nor the swinging far foot covers them, so the C reads at a glance.
const CR_R = 72, CR_SQ = 0.5, CR_ROT = Math.PI, CR_BITE = 0.8, CR_OFF = 0.45, CR_DY = -8;

/** Crater centre for radius r: shifted toward the bite so the belly lands under the boot. */
function craterCentre(r: number): [number, number] {
  return [craterX + Math.cos(CR_ROT) * r * CR_OFF, GROUND + CR_DY + Math.sin(CR_ROT) * r * CR_OFF * CR_SQ];
}

/** Point on the crescent's spine (mid-way between its outer and inner edges), u 0..1 horn to horn. */
function craterSpine(u: number, R: number): [number, number, number] {
  const d = CR_BITE * R;
  const phi = Math.acos(d / (2 * R));
  const ang = CR_ROT + phi + (TAU - 2 * phi) * u;
  // Thickness of the crescent at this angle: outer radius minus the bite circle's edge.
  const ox = Math.cos(ang), oy = Math.sin(ang);
  const bx = Math.cos(CR_ROT) * d, by = Math.sin(CR_ROT) * d;
  // Distance along the ray from the centre to the bite circle (nearest positive root).
  const pb = ox * bx + oy * by;
  const disc = pb * pb - (bx * bx + by * by - R * R);
  const tIn = pb + Math.sqrt(Math.max(0, disc));
  const inner = Math.max(0, Math.min(R, tIn));
  const mid = (R + inner) / 2;
  return [ox * mid, oy * mid * CR_SQ, R - inner];
}

/** Gouge outline: a crescent squashed onto the ground plane, centre (cx, cy). */
function craterPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, bite: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, CR_SQ);
  crescentPath(ctx, 0, 0, r, bite, CR_ROT);
  ctx.restore();
}

function drawCrater(env: Env, t: number, rng: Rng) {
  const { ctx } = env;
  const s = t - PLANT;
  if (s < 0) return;
  const grow = ease.outBack(clamp(s / 0.05));
  const heat = 0.4 + 0.6 * Math.exp(-s * 3);
  const R = CR_R * grow;
  if (R < 1) return;
  // Late in the shot (the crater is sliding out of the rolled frame) only the glow pool lingers.
  const fa = clamp(1 - (s - 0.55) / 0.35, 0.25, 1);
  const [cx, cy] = craterCentre(R);
  // Glow pool around the crater.
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowSprite('crimson', 0.55), (cx + craterX) / 2, cy + 6, 100, 0.3 * heat * Math.max(fa, 0.7), 1.3, 0.3);
  ctx.globalCompositeOperation = 'source-over';
  // Cracks radiating out of the impact point under the boot.
  const cg = clamp(s / 0.28);
  const path = (c: (typeof cracks)[number], n: number) => {
    ctx.beginPath();
    ctx.moveTo(craterX + c.pts[0][0], cy + c.pts[0][1]);
    for (let i = 1; i < n; i++) ctx.lineTo(craterX + c.pts[i][0], cy + c.pts[i][1]);
  };
  // Fade with the crater, and vanish entirely late (branching cracks read as stray twigs).
  const fo = clamp((fa - 0.25) / 0.75);
  ctx.globalAlpha = fo;
  for (const c of cracks) {
    const g = clamp((cg - c.at) / (1 - c.at));
    if (g <= 0) continue;
    const n = Math.max(2, Math.ceil(c.pts.length * g));
    ctx.strokeStyle = '#0a0410';
    ctx.lineWidth = 3.2;
    path(c, n);
    ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(240,40,84,${0.7 * heat + 0.25})`;
    ctx.lineWidth = 1.6;
    path(c, n);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.globalAlpha = fa;
  // Heaved turf lip (same bite as the cut so the inner concave edge stays sharp), then the
  // dark cut with a moonlit silver edge.
  craterPath(ctx, cx, cy + 1, R * 1.08, CR_BITE);
  ctx.fillStyle = '#0e2c1a';
  ctx.fill();
  craterPath(ctx, cx, cy, R, CR_BITE);
  ctx.fillStyle = '#060210';
  ctx.fill();
  // Molten floor (clipped to the cut): crimson body, rose, then a thin silver-white seam.
  ctx.save();
  ctx.clip();
  craterPath(ctx, cx, cy, R, CR_BITE * 0.78);
  ctx.fillStyle = `rgba(200,16,56,${0.95 * heat})`;
  ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  craterPath(ctx, cx, cy, R, CR_BITE * 0.52);
  ctx.fillStyle = `rgba(255,70,110,${0.45 * heat})`;
  ctx.fill();
  craterPath(ctx, cx, cy, R, CR_BITE * 0.3);
  ctx.fillStyle = `rgba(250,246,255,${0.45 * heat * (0.85 + 0.15 * rng.next())})`;
  ctx.fill();
  ctx.restore();
  ctx.globalAlpha = fa;
  ctx.globalCompositeOperation = 'source-over';
  craterPath(ctx, cx, cy, R, CR_BITE);
  ctx.strokeStyle = 'rgba(230,234,255,0.8)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // Turf shards heaved up along the outer rim (thickest along the belly, none at the horn tips);
  // they fade out completely late in the shot so no stray spikes linger at the frame edge.
  const phi = Math.acos(CR_BITE / 2);
  ctx.globalAlpha = fo;
  for (let i = 1; i < 12; i++) {
    const u = i / 12;
    const ang = CR_ROT + phi + (TAU - 2 * phi) * u;
    const ex = cx + Math.cos(ang) * R * 1.02, ey = cy + Math.sin(ang) * R * 1.02 * CR_SQ;
    const hgt = (4 + ((i * 7) % 5)) * grow * (0.6 + 0.4 * Math.sin(Math.PI * u));
    const lean = Math.cos(ang) * 3;
    ctx.fillStyle = '#081a10';
    ctx.beginPath();
    ctx.moveTo(ex - 3, ey + 1);
    ctx.lineTo(ex + lean, ey - hgt - 1);
    ctx.lineTo(ex + 3, ey + 1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(235,40,80,${0.8 * heat})`;
    ctx.fillRect(Math.round(ex + lean * 0.5), Math.round(ey - hgt * 0.5), 1, Math.max(1, Math.round(hgt * 0.5)));
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'lighter';
  // Light curtain: the crescent's shape shoots up as a wall of crimson light, then sinks.
  const cu = clamp(1 - s / 0.3);
  if (cu > 0) {
    const H = 120 * ease.outCubic(clamp(s / 0.06)) * (0.35 + 0.65 * cu);
    for (let i = 0; i <= 28; i++) {
      const u = i / 28;
      const [sx, sy, th] = craterSpine(u, R);
      const w = clamp(th / (R * 0.5));
      if (w <= 0.02) continue;
      const h = H * (0.35 + 0.65 * w) * (0.85 + 0.15 * rng.next());
      drawGlow(ctx, glowSprite('crimson', 0.42), cx + sx, cy + sy - h * 0.5, h * 0.5, 0.5 * cu * w, 0.1, 1);
      drawGlow(ctx, glowSprite('silver', 0.15), cx + sx, cy + sy - h * 0.3, h * 0.3, 0.4 * cu * w, 0.03, 1);
    }
  }
  ctx.globalCompositeOperation = 'source-over';
}

export const shotLiftoff: Shot = {
  name: 'Lift-off',
  dur: DUR,
  seed: 103,
  cues: [
    // Smash cut: the crowd jumps up out of shot 2's hush, with a short falling swish.
    { at: 0, fn: (e) => { e.sfx.crowd(1.4, 0.14); e.sfx.whoosh(0.18, 2600, 500, 0.35); } },
    // Soft airy glint on the cross (not the menu blip).
    { at: BALL_IN, fn: (e) => e.sfx.whoosh(0.12, 6500, 9800, 0.05) },
    { at: PLANT, fn: (e) => { e.sfx.kick(0.6); e.sfx.boom(0.5, 0.45); e.sfx.crack(0.45); } },
    { at: PLANT + HS_LEN, fn: (e) => e.sfx.whoosh(1.0, 160, 2800, 0.5) },
    { at: 0.92, fn: (e) => e.sfx.whoosh(0.5, 700, 4200, 0.3) },
  ],
  rate: (t) => warp(t, [[PLANT, HS_LEN, HS_RATE]]),
  init(env) {
    const rng = env.rng;
    spin = new BallSpin();
    spin.rotate(1, 0.4, 0.2, 0.9);
    planted = false;
    ballTrail.clear();
    farTrail.clear();
    launchTrail.clear();
    // Crater sits under the planted boot (BK2's flat plant boot: between its ankle and toe).
    const hp = heroAt(PLANT);
    craterX = (at(hp, 'toeN')[0] + at(hp, 'ankleN')[0]) / 2;
    cracks = makeCracks(rng, 9, 95, 0.2);
    turf = [];
    for (let i = 0; i < 700; i++) {
      const y = rng.range(262, 700);
      turf.push({ x: Math.round(rng.range(-500, 1100)), y: Math.round(y), s: rng.next() < 0.3 ? 2 : 1, c: rng.next() < 0.55 ? 1 : 0 });
    }
    const c = camAt(0);
    env.cam.set(c.x, c.y, c.zoom, c.rot);
    env.cam.hit(0.5); // smash-cut kick
  },
  update(env, t, dt) {
    const { rng, parts, cam } = env;
    const a = anim(t);
    const hp = heroAt(t);
    const [hx, hy] = at(hp, 'pelvis');
    const [bx, by] = ballAt(a);
    spin.rotate(0.3, 1, 0.2, dt * 5);
    ballTrail.push(bx, by);

    // Charge-up: crimson motes drawn into the plant boot before the stamp.
    const [nx, ny] = at(hp, 'toeN');
    if (!planted && t > 0.1) {
      const n = Math.round(6 * dt * 60);
      for (let i = 0; i < n; i++) {
        const ang = rng.range(Math.PI, TAU), d = rng.range(40, 90);
        const sx = craterX + Math.cos(ang) * d, sy = GROUND + Math.sin(ang) * d * 0.5;
        parts.spawn({
          kind: PK.Glow, x: sx, y: sy, vx: (craterX - sx) * 5, vy: (GROUND - sy) * 5, drag: 1,
          max: 0.2, s0: rng.range(3, 6), s1: 1, ramp: rng.next() < 0.3 ? 'silver' : 'crimson', r0: 0.2, r1: 0.9, a0: 0.5, a1: 0.9, layer: 1,
        });
      }
    }

    // The stamp.
    if (!planted && t >= PLANT) {
      planted = true;
      cam.hit(0.55);
      ring(env, craterX, GROUND + 3, 8, 170, 0.5, 0.24, 'crimson');
      ring(env, craterX, GROUND + 3, 5, 70, 0.3, 0.24, 'silver');
      grassChunks(env, craterX, GROUND, 22, 1.1);
      for (let i = 0; i < 14; i++) {
        const ang = rng.range(Math.PI * 1.05, Math.PI * 1.95), sp = rng.range(60, 300);
        parts.spawn({
          kind: PK.Smoke, x: craterX + rng.range(-30, 30), y: GROUND, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp * 0.3, drag: 3,
          max: rng.range(0.5, 0.9), s0: rng.range(6, 10), s1: rng.range(18, 28), ramp: 'dust', r0: 0.3, r1: 1, a0: 0.35, a1: 0, add: false, layer: 0,
        });
      }
      sparks(env, craterX, GROUND, 34, 650, Math.PI * 0.9, -Math.PI / 2, 'crimson');
      sparks(env, craterX, GROUND, 16, 520, Math.PI * 0.7, -Math.PI / 2, 'silver');
      for (let i = 0; i < 26; i++) {
        parts.spawn({
          kind: PK.Glow, x: craterX + rng.range(-40, 40), y: GROUND + rng.range(-4, 6), vx: rng.range(-40, 40), vy: rng.range(-260, -80), drag: 2,
          max: rng.range(0.4, 0.8), s0: rng.range(6, 12), s1: 2, ramp: 'crimson', r0: 0.15, r1: 1, a0: 0.8, a1: 0, layer: 0,
        });
      }
      // Turf blocks heaved out of the crescent.
      for (let i = 0; i < 8; i++) {
        const side = rng.sign();
        parts.spawn({
          kind: PK.Debris, x: craterX + side * rng.range(10, 40), y: GROUND, vx: side * rng.range(60, 200), vy: rng.range(-420, -200), ay: 1100, drag: 0.4,
          vrot: rng.range(-10, 10), max: rng.range(0.6, 1.0), s0: rng.range(3, 5), s1: 3, ramp: 'smoke', r0: 0.2, r1: 0.6, a0: 1, a1: 1, add: false, layer: 1,
        });
      }
    }

    if (planted) {
      farTrail.push(...at(hp, 'toeF'));
      // The plant boot rips the launch column up out of the crater as it leaves the turf.
      if (t < T_AIR + 0.09) launchTrail.push(nx, ny);
      // Crater keeps breathing embers.
      if (rng.next() < 0.6) {
        parts.spawn({
          kind: PK.Glow, x: craterX + rng.range(-36, 36), y: GROUND + rng.range(-2, 5), vx: rng.range(-10, 10), vy: rng.range(-90, -30),
          max: rng.range(0.4, 0.8), s0: rng.range(2, 5), s1: 1, ramp: 'crimson', r0: 0.2, r1: 1, a0: 0.8, a1: 0, layer: 0,
        });
      }
      // Aura shed off his body, streaming down as he climbs.
      const rs = clamp(riseSpeed(a) / 300);
      const n = Math.round((3 + rs * 5) * dt * 60);
      for (let i = 0; i < n; i++) {
        const [px, py] = at(hp, rng.pick(['neck', 'pelvis', 'kneeN', 'toeF', 'head'] as const));
        const silver = rng.next() < 0.3;
        parts.spawn({
          kind: PK.Glow, x: px + rng.range(-12, 12), y: py + rng.range(-12, 12), vx: rng.range(-30, 30), vy: rng.range(60, 220) * (0.4 + rs),
          drag: 1.5, max: rng.range(0.25, 0.5), s0: rng.range(3, 7) * (silver ? 0.7 : 1), s1: 1, ramp: silver ? 'silver' : 'crimson',
          r0: silver ? 0.1 : 0.25, r1: 1, a0: 0.75, a1: 0, layer: 0,
        });
      }
    } else if (rng.next() < 0.5) {
      const [px, py] = at(hp, 'neck');
      parts.spawn({
        kind: PK.Glow, x: px + rng.range(-30, 30), y: py + rng.range(-10, 80), vx: rng.range(-10, 10), vy: rng.range(-90, -30),
        max: rng.range(0.3, 0.6), s0: rng.range(3, 6), s1: 1, ramp: 'crimson', r0: 0.25, r1: 1, a0: 0.6, a1: 0, layer: 0,
      });
    }
    // Slow silver motes hanging in the night air.
    if (rng.next() < 0.5) {
      parts.spawn({
        kind: PK.Pixel, x: cam.x + rng.range(-400, 400), y: cam.y + rng.range(-300, 300), vx: rng.range(-6, 6), vy: rng.range(-20, 6),
        max: rng.range(1, 1.8), s0: rng.range(1, 2.4), s1: 1, ramp: rng.next() < 0.4 ? 'crimson' : 'silver', r0: 0.1, r1: 1, a0: 0.8, a1: 0, layer: rng.next() < 0.5 ? 0 : 1,
      });
    }

    const c = camAt(a);
    cam.set(c.x, c.y, c.zoom, c.rot);
    cam.shakeAmp = 12;
    cam.shakeRoll = 0.03;
  },
  render(env, t) {
    const { ctx, fx, cam } = env;
    const rng = env.frng();
    const a = anim(t);
    const hp = heroAt(t);
    const [hx, hy] = at(hp, 'pelvis');
    const [bx, by] = ballAt(a);
    const rs = clamp(riseSpeed(a) / 300);
    const rollV = rollSpeed(a);
    const stamp = pulse(t, PLANT, 0.3);

    // ---- Far layers (all roll with the camera, with depth parallax).
    layer(env, 0.03);
    drawSky(env, t);
    layer(env, 0.2);
    drawLights(env, t);
    layer(env, 0.42);
    drawStands(env, t);

    // ---- World.
    env.world();
    ctx.imageSmoothingEnabled = false;
    drawNearPitch(env);
    // Shadow shrinking as he climbs (under the glow and the crater, never darkening them).
    const hip0 = takeoffHip()[1];
    const lift = clamp((hip0 - hy) / (hip0 - APEX[1]));
    ctx.fillStyle = `rgba(4,3,14,${0.45 * (1 - lift * 0.7)})`;
    ctx.beginPath();
    ctx.ellipse(hx + 4, GROUND + 3, 42 * (1 - lift * 0.45), 7 * (1 - lift * 0.45), 0, 0, TAU);
    ctx.fill();
    // Pre-stamp glow gathering under the boot.
    const charge = clamp((t - 0.1) / (PLANT - 0.1)) * (t < PLANT ? 1 : 0);
    if (charge > 0) {
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowSprite('crimson', 0.5), craterX, GROUND + 2, 50 + 70 * charge, 0.85 * charge, 1.5, 0.35);
      drawGlow(ctx, glowSprite('crimson', 0.25), craterX, GROUND + 1, 12 + 18 * charge, 0.9 * charge, 1.8, 0.5);
      // Foreshadow: the crescent the stamp is about to cut, faintly scored into the turf.
      const ca = charge * charge * (0.8 + 0.2 * rng.next());
      const [fcx, fcy] = craterCentre(CR_R);
      craterPath(ctx, fcx, fcy, CR_R, CR_BITE);
      ctx.fillStyle = `rgba(222,26,66,${0.2 * ca})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(255,90,130,${0.9 * ca})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    }
    drawCrater(env, t, rng);

    env.parts.draw(ctx, 0);

    // Launch column: crimson energy ripped up out of the crater by the plant boot.
    const la = 1 - clamp((t - PLANT - 0.1) / 0.18);
    if (planted && la > 0) crimsonRibbon(ctx, launchTrail.pts, 26, la * 0.8);
    // Far boot's crimson ribbon.
    if (planted) crimsonRibbon(ctx, farTrail.pts, 16, 0.9);

    // Ball (high cross) with a faint silver trail.
    ctx.globalCompositeOperation = 'lighter';
    ribbon(ctx, ballTrail.pts, 0, 9, 'rgb(150,160,230)', 0.22);
    ribbon(ctx, ballTrail.pts, 0, 3, 'rgb(235,240,255)', 0.3);
    drawGlow(ctx, glowOf([190, 200, 255]), bx, by, 40, 0.55);
    ctx.globalCompositeOperation = 'source-over';

    // Afterimages along the climb.
    if (a > PLANT + 0.02) {
      for (const [lag, al] of [[0.12, 0.38], [0.06, 0.55]] as const) {
        const gp = heroAt(tOf(a - lag));
        ctx.globalCompositeOperation = 'lighter';
        drawPlace(ctx, gp, silOf(gp, GHOST), al * (0.6 + 0.4 * rs));
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    // Dark halo so he never melts into the busy crowd behind him.
    const [nkx, nky] = at(hp, 'neck');
    const mx = (hx + nkx) / 2, my = (hy + nky) / 2;
    const halo = ctx.createRadialGradient(mx, my, 0, mx, my, 125);
    halo.addColorStop(0, 'rgba(5,3,16,0.5)');
    halo.addColorStop(0.6, 'rgba(5,3,16,0.28)');
    halo.addColorStop(1, 'rgba(5,3,16,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(mx - 130, my - 130, 260, 260);
    // Soft silver back-glow behind the head so the dark navy hair separates from the stands.
    const [hdx, hdy] = at(hp, 'head');
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowSprite('silver', 0.2), hdx, hdy, 52, 0.3);
    ctx.globalCompositeOperation = 'source-over';
    // Aura: a crimson outline with silver rim light hugging his silhouette, plus a soft glow.
    const aura = silOf(hp, AURA);
    const fl = 0.75 + 0.25 * Math.sin(t * 47) * Math.sin(t * 19);
    for (const [ox, oy] of [[-2, -2], [2, -2], [-2, 2], [2, 2]] as const) drawPlace(ctx, hp, aura, 0.85, 1, ox, oy);
    ctx.globalCompositeOperation = 'lighter';
    drawPlace(ctx, pivotOn(hp, 'pelvis'), aura, (0.28 + 0.25 * stamp) * fl, 1.06, 0, -1);
    ctx.globalCompositeOperation = 'source-over';
    drawPlace(ctx, hp);
    // Crater underlight on his legs right after the stamp.
    if (stamp > 0) {
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowSprite('crimson', 0.3), craterX, GROUND - 46, 60, stamp * 0.45, 1, 1);
      ctx.globalCompositeOperation = 'source-over';
    }

    // The ball itself, in front of him (as in shot 4): it meets his raised boot at the cut and
    // picks up shot 4's crimson lock-on glow on the way in.
    const lock = ease.inOutQuad(clamp((t - 1.0) / 0.38));
    drawBall(env, spin, bx, by, BALL_R, D, 0.1 * lock, 0.45 * lock, 'crimson');
    const tw = 0.6 + 0.4 * Math.sin(t * 23);
    sparkle(ctx, bx - 3, by - 4, 9 + 4 * tw, 0.65 * tw, t * 2);
    // One-shot floodlight glint on the cross as it starts to drop.
    const ent = pulse(t, BALL_IN, 0.16);
    if (ent > 0) sparkle(ctx, bx, by, 22 * (0.6 + 0.4 * ent), ent, (t - BALL_IN) * 3);

    env.parts.draw(ctx, 1);

    // Silver speed lines streaming down past him as he climbs.
    if (planted && rs > 0.05) {
      ctx.globalCompositeOperation = 'lighter';
      speedStreaks(ctx, rng, hx - 300, hy - 320, 600, 560, Math.PI / 2, Math.round(10 + 24 * rs), '#e6eaff', 0.4 * rs, 120);
      ctx.globalCompositeOperation = 'source-over';
    }
    // Stamp: focus lines converge on the boot.
    const imp = pulse(t, PLANT, 0.13);
    if (imp > 0) {
      focusLines(ctx, rng, craterX, GROUND, 150, 560, 26, '#de1a42', imp * 0.5, 4);
      focusLines(ctx, rng, craterX, GROUND, 170, 560, 16, '#f2f5ff', imp * 0.55, 3);
    }

    // ---- Screen space: roll speed arcs around the frame centre.
    env.screen();
    // Held to the last frame so the roll motion carries across the roll-match cut into shot 4.
    const ra = Math.max(clamp((rollV - 0.25) / 1.2), clamp((t - 1.25) / 0.1) * 0.85);
    if (ra > 0) {
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 18; i++) {
        const r = rng.range(170, 440);
        const a0 = rng.range(0, TAU);
        const len = rng.range(0.25, 0.6);
        ctx.fillStyle = i < 5 ? 'rgb(222,26,66)' : 'rgb(225,232,255)';
        ctx.globalAlpha = ra * rng.range(0.25, 0.55);
        taperArc(ctx, VW / 2, VH / 2, r, a0, a0 + len, rng.range(2, 4.5));
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    // ---- Post.
    const [cux, cuy] = cam.toUV(craterX, GROUND);
    const [hux, huy] = cam.toUV(hx, hy - 20);
    if (t >= PLANT) {
      const s = t - PLANT;
      fx.shocks.push({ x: cux, y: cuy, r: s * 1.4, s: 0.045 * clamp(1 - s * 2.2) });
    }
    const endK = clamp((t - 1.33) / 0.07);
    fx.radial = 0.025 * rs + 0.03 * ease.inQuad(endK);
    fx.radialX = hux;
    fx.radialY = huy;
    fx.ca = 0.0015 + imp * 0.008 + ra * 0.003 + endK * 0.004;
    fx.bloom = 0.95;
    fx.bloomThresh = 0.62;
    fx.vignette = 0.62;
    fx.sat = 0.88;
    fx.contrast = 1.08;
    fx.tint = [214, 220, 255];
    // No open or close flash: smash cut in from shot 2, roll match out into shot 4.
    // Only the stamp gets a short crimson flash.
    fx.flash = imp * 0.22;
    fx.flashColor = [255, 70, 110];
  },
};
