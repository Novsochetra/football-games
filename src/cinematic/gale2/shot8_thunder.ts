// GALE HAMMER v2 · shot 8 · "Thunder hammer" (2.4 s, seed 318): the climax. SPEC.md §6 shot 8.
//
// Story job: catharsis. The thunder catches up and hammers the stopped ball: the biggest hit in the film, and it has
// to look as if it could break the goal, so it moves the goal.
//
// 8a · HAMMER 2 (0.00-0.36), the low reverse behind the ball (drawDownPitch looking east, eye 1.1 m up, 1.5 m behind
// the ball): the 92 px ball dead in the foreground, the keeper's terrified bust (KeeperFront KF4 ×2, a screen-space
// depth layer the zoom does not scale) past it, his goal looming behind him.
//   0.00-0.10  the thunder wall arrives from behind the lens: one imploding refraction ring (pushShock r 1.30 -> 0.55
//              round the ball), its ice edge line drawn on the same circle, the dust / dew curtain streaking in past the
//              frame edges toward the ball; cam.shove(0, +6); the rumble trauma held at 0.45.
//   0.10       HAMMER 2, the 12-layer stack on one frame: isobar weather map (E8) round the ball, then the negative
//              print (E9, 0.17-0.25); three shock rings (0.08 / 0.05 / 0.03, 0.03 s apart); the vapour cone reborn at
//              double size (seen end-on: its bell opens toward the lens); a second barrier torus (400 px); 90 dew
//              sparks + 60 blades frozen mid-burst by the hit-stop; 120 ice / cyan focus lines; CA 0.016 + radial 0.15;
//              bloom 1.3; lens bulge +0.45 (R 0.35) on the ball; cam.hit(1) + punch +0.20 + cam.shove(+18, 0);
//              floodBack. The ball is crushed by the pressure (squash), the keeper's face is lit ice by it.
//   0.32       his fists are flung open, then the ball blasts through where they were (it shrinks away up-left toward
//              the far top corner); his bust is torn up-right out of frame; the cone's mouth fills the frame as a white
//              shroud (E10, fx.fullFrame, 0.32-0.38) and the camera dives into it.
// 8b · THE GOAL MOVES (0.36-2.40), the side world view (camera south, the goal to the right, FIELD coordinates):
//   0.36       the shroud tears open from the ball outward; BLOW-BACK 2.40 -> 1.20 by 0.56 ('blowBack'), cam.shove(-30,
//              -12), trauma 0.8; the reborn cone (260 world px mouth) trails the ball into the far top corner; the keeper
//              is folded backward like a sail (gkFold) and cartwheeled up and over (one full turn).
//   0.40       the ball hits the net: it punches a pocket into the top corner (the ball spinning at its tip inside its
//              bubble) and the whole net domes to 1.0 (the cap); the cone slams into the net and bursts out through it;
//              shock ring, lens, frost, dew spray, focus lines.
//   0.45-0.70  the six pegs pop one after another (dirt and dew).
//   0.48-0.95  THE GOAL IS SHOVED 2.8 m: the frame skids back 28 world px, the post feet plough two furrows from the
//              painted line, the crossbar bows 14 px into a U and springs, the side netting snaps taut, frost races
//              along the frame, dust and clods spray; the keeper lands hooked in the near side netting (0.80).
//   0.95       the frame lurches to a stop (cam.hit 0.5, a puff thrown forward).
//   0.95-1.54  THE PROOF: crane down and push 1.24 -> 1.90 (then a 1.96 creep) onto the turf: the white goal line,
//              painted and unmoved, at screen x ~250; the furrow; the near post foot 53 px behind it with clods still
//              rolling off it; a peg on its side; dew drifting down through the floodlights; a cyan glint runs along the
//              painted line at 1.18; the keeper hooked in the side netting is multiplied by navy (0.5) through the hold.
//   1.54-1.88  the stadium hears it: the pull-out to 1.10 as the wind wave rolls in from screen-left (flags whip in
//              sequence, the ad boards fold in a domino wave, the towers sway, a slow pressure ring rolls across the
//              turf); 1.56 GOAL! (gustTitle, 130 px) rides in on the wave's front, G landing first (1.72) and '!' last
//              (1.84), over the whole shoved goal, its two furrows, six pegs and the keeper hooked in the side netting.
//   2.25-2.40  wind wipe into shot 9.
//
// Clocks: the camera, cues, sprite frames, the goal rig, the ball's flight and every screen-space effect run on the
// unwarped shot clock t; particles run on the warped sim clock (RATE[8]). Particles spawn only in update() on env.rng
// (one-shot bursts behind flags, reset in init); render() uses env.frng() and a frame-stable hash. The particle list is
// cleared on the cut to the side view (its coordinates change). Never the banned word anywhere.

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { TAU, clamp, ease, lerp, type RGB } from '../../engine/math';
import { PK, drawGlow, glowOf, softSprite } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { FIELD, drawDownPitch, drawFieldBackdrop, drawGoal, type DownPitchView, type NetDimple } from '../../art/stadium';
import { KEEPER_KIT, POSES } from '../../art/puppet';
import { drawAnim } from '../../art/studioAnim';
import { TITLE_FONT } from '../../art/fx';
import { drawBall, holdTrauma, keys, pushShock, zoomAbout, type KeyRow } from '../kit';
import {
  GOAL_SLIDE, HEX, MUFFLE, PAL, PUPPETS, RATE, SHOTS, STAMPS, STRIKE, drawKeeperFront, floodBack, galeIso, galeStorm, keeperFront,
  stormDarken, warmGale,
} from './common';
import { airCrater, bubbleRim, gustTitle, iceEdge, pressedWake, ringEdgeX, vaporCone, vaporTorus, windWipe, type ThunderRing, type WakePt } from './air';
import { drawGoalRig, goalRigAt, type GoalRig } from './goal';
import { returnPlate } from './shot9_return';

const META = SHOTS[7];
const DUR = META.dur;
type P2 = [number, number];

/** Frame-stable hash in [0, 1). */
const hash = (n: number) => {
  const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
};
const u01 = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
/**
 * Keep a ray's angle at least 0.14 rad off the frame axes, so no burst ray lies along the row or column through the
 * contact (the isobar frame's pattern check counts band changes along those two lines).
 */
const axisSafe = (a: number) => {
  const q = Math.PI / 2, k = Math.round(a / q), d = a - k * q;
  return Math.abs(d) < 0.14 ? k * q + (d < 0 ? -0.14 : 0.14) : a;
};
const ICE = 'rgb(238,251,255)', CYAN = 'rgb(70,216,255)', NAVY = 'rgb(10,18,56)';
const rgba = (c: RGB, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

// ---------------------------------------------------------------- timing (shot-local, unwarped)

const T = {
  hit: 0.1, iso2: 0.165, isoEnd: 0.232, shroud: 0.26, tear: 0.32, cut: 0.36, net: 0.4, peg: 0.45, shove: 0.48, land: 0.8,
  stop: 0.95, hold: 1.15, glint: 1.18, wave: 1.54, goal: 1.58, wide: 1.88, wipe: 2.25,
} as const;

// ================================================================ 8a · HAMMER 2 (the low reverse)

/** The eye: 1.5 m behind the dead ball, 1.1 m up (0.4 m under it), looking east and up at the keeper (a low horizon). */
const VIEW_A: DownPitchView = { x: 1141, z: 230, h: 11, f: 520, horizon: 300, cx: 336, tilt: 0 };
/** The ball (screen px at zoom 1; the camera zooms about it) and its draw: r 26 × 2 = 104 px. */
const BA: P2 = [300, 232];
const BR_A = 26;
/**
 * The keeper's bust staged behind the ball and to its right: chest anchor on screen (KF4 ×2: head ~80 px), a depth layer
 * the zoom does not scale. Film fix H1: he stands clear of the ball (it never sits on his chest between his gloves, so it
 * can never read as caught): his near glove (KF4 glove (36,110) about chest (66,90), ×2) lands just past the ball's right
 * rim (the bust sits 120 px right of the ball, so the ball never overlaps his torso edge), his face and far glove beyond
 * it, and the ball blasts through toward him (ballA aims at KA) at the tear.
 */
const KA: P2 = [BA[0] + 120, BA[1] - 28];
/** The bust's depth wash: a navy copy over him at this alpha pushes him back behind the ball (film fix H1). */
const KEEPER_WASH = 0.35;

/** 8a camera: a creeping push into the hit, the +0.20 punch held through the hit-stop, then the dive into the shroud. */
const ZOOM_A: KeyRow[] = [[0, 1.0], [T.hit, 1.04, 'inQuad'], [T.hit + 0.03, 1.24, 'outQuad'], [T.tear, 1.2, 'linear'], [T.cut, 1.9, 'inExpo']];

/**
 * The thunder wall's ring (screen heights, centred on the ball): inside the frame corners on frame 0 (the cloud bank that
 * ended shot 7 is already the frame edge), rushing in to a wide ragged bank (0.42 VH) at the hit: a cloud bank crashing
 * in round the ball and the keeper, never a closing iris.
 */
const wallR = (t: number) => lerp(0.62, 0.42, ease.inQuad(u01(t, 0, T.hit)));

/** The reborn cone's end-on radius (screen px about the ball): born at the hit, its white shell races past the frame. */
function coneR(t: number): number {
  if (t < T.hit) return 0;
  const u = u01(t, T.hit, T.tear);
  return lerp(60, 330, ease.outCubic(u)) + (t > T.tear ? 600 * ease.inQuad(u01(t, T.tear, T.cut)) : 0);
}

/**
 * Where the ball is drawn in 8a (screen px at zoom 1) and its draw scale. At 0.32 his fists are flung apart first (one
 * frame), then the ball blasts away from us straight into the gap where they were, shrinking with depth.
 */
function ballA(t: number): { x: number; y: number; D: number } {
  if (t < T.tear + 1 / 60) return { x: BA[0], y: BA[1], D: 2 };
  const u = ease.inQuad(u01(t, T.tear + 1 / 60, T.cut));
  return { x: lerp(BA[0], KA[0] - 4, u), y: lerp(BA[1], KA[1] + 30, u), D: lerp(2, 0.6, u) };
}

function placeCamA(env: Env, t: number) {
  zoomAbout(env.cam, BA[0], BA[1], BA[0], BA[1], keys(ZOOM_A, t));
}

/** Screen position of an 8a point (world-A = screen at zoom 1). */
function scrA(env: Env, x: number, y: number): P2 {
  const [u, v] = env.cam.toUV(x, y);
  return [u * VW, v * VH];
}

/**
 * The reborn vapour cone seen from behind the ball: its bell opens toward the lens, so it reads as concentric shells
 * round the ball: an outer turbulent white shell over a navy halo (normal blend), an inner cyan shell (additive),
 * three pulsing ice Mach rings, vapour streaks rushing outward past us and two wingtip corkscrews; a navy pocket keeps
 * the ball's ice core the hottest point.
 */
function coneMouth(ctx: CanvasRenderingContext2D, x: number, y: number, R: number, t: number, a: number, br: number) {
  if (a <= 0 || R <= 4) return;
  const ph = Math.floor(t * 30);
  ctx.save();
  // Navy halo under the shell.
  ctx.globalAlpha = 0.4 * a;
  ctx.strokeStyle = NAVY;
  ctx.lineWidth = Math.max(4, R * 0.34);
  ctx.beginPath();
  ctx.arc(x, y, R * 0.9, 0, TAU);
  ctx.stroke();
  // Vapour streaks rushing past the lens (white, normal blend), irregularly spaced.
  ctx.lineCap = 'round';
  for (let i = 0; i < 46; i++) {
    const th = hash(i * 3.3) * TAU + t * 0.6;
    const r0 = R * (0.3 + 0.25 * hash(i * 1.7 + ph * 0.13));
    const r1 = R * (0.8 + 0.45 * hash(i * 5.1));
    ctx.globalAlpha = (0.18 + 0.25 * hash(i * 9.7 + ph)) * a;
    ctx.strokeStyle = i % 3 ? 'rgb(226,246,255)' : '#ffffff';
    ctx.lineWidth = 1 + Math.round(2 * hash(i * 2.9));
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(th) * r0, y + Math.sin(th) * r0);
    ctx.lineTo(x + Math.cos(th) * r1, y + Math.sin(th) * r1);
    ctx.stroke();
  }
  // The outer white shell: turbulent puffs round the rim, swirling slowly with the wingtip vortices.
  const n = Math.round(clamp(R / 5, 28, 96));
  for (let i = 0; i < n; i++) {
    const th = (i / n) * TAU + hash(i) * 0.2 + t * 0.9;
    const rr = R * (0.92 + 0.14 * hash(ph * 7 + i));
    const s = R * (0.07 + 0.08 * hash(i * 3 + ph));
    ctx.globalAlpha = 0.5 * a;
    ctx.drawImage(softSprite('vapor', 0.06 + 0.2 * hash(i * 11)), x + Math.cos(th) * rr - s, y + Math.sin(th) * rr - s, s * 2, s * 2);
  }
  ctx.globalCompositeOperation = 'lighter';
  // Inner cyan shell.
  ctx.globalAlpha = 0.4 * a;
  ctx.strokeStyle = CYAN;
  ctx.lineWidth = Math.max(2, R * 0.05);
  ctx.beginPath();
  ctx.arc(x, y, R * 0.62, 0, TAU);
  ctx.stroke();
  // Mach rings (12 Hz).
  const pulse = 0.85 + 0.15 * Math.sin(t * TAU * 12);
  ctx.strokeStyle = ICE;
  ctx.lineWidth = 1.5;
  for (const k of [0.27, 0.37, 0.48]) {
    ctx.globalAlpha = 0.55 * a * (1.2 - k);
    ctx.beginPath();
    ctx.arc(x, y, Math.max(br * 1.15, R * k * pulse), 0, TAU);
    ctx.stroke();
  }
  // Two wingtip corkscrews spiralling out along the shell.
  ctx.fillStyle = ICE;
  for (const side of [0, Math.PI]) {
    for (let i = 0; i < 40; i++) {
      const u = i / 40;
      const th = side + t * 7 + u * 5.5;
      const rr = R * (0.35 + 0.75 * u);
      ctx.globalAlpha = 0.7 * a * (1 - u * 0.6);
      ctx.fillRect(Math.round(x + Math.cos(th) * rr), Math.round(y + Math.sin(th) * rr), 2, 2);
    }
  }
  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  drawGlow(ctx, glowOf(PAL.navy), x, y, br * 2.4, 0.55 * a);
}

/** Focus lines converging on (cx, cy): thin wedges from rOut to rIn, cyan halo + ice core (additive). */
function focusLinesIce(ctx: CanvasRenderingContext2D, seed: number, cx: number, cy: number, n: number, rIn: number, rOut: number, a: number) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const [col, wk, al] of [[CYAN, 2.2, 0.35], [ICE, 0.9, 0.6]] as const) {
    ctx.fillStyle = col;
    ctx.globalAlpha = clamp(al * a);
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const th = axisSafe(hash(seed + i * 7.31) * TAU);
      const w = (0.002 + 0.004 * hash(seed + i * 3.7)) * wk;
      const r0 = rIn * (0.85 + 0.6 * hash(seed + i * 1.9));
      ctx.moveTo(cx + Math.cos(th) * r0, cy + Math.sin(th) * r0);
      ctx.lineTo(cx + Math.cos(th - w) * rOut, cy + Math.sin(th - w) * rOut);
      ctx.lineTo(cx + Math.cos(th + w) * rOut, cy + Math.sin(th + w) * rOut);
      ctx.closePath();
    }
    ctx.fill();
  }
  ctx.restore();
}

/**
 * The wall itself on the reverse angle: everything outside the closing ring is the cloud bank that ended shot 7 (a
 * pale storm-vapour flood with billowing puffs along its inner edge), so the frame edge on the cut is the same wall and
 * the picture's mean brightness carries across it. Screen space, normal blend.
 */
function wallFlood(ctx: CanvasRenderingContext2D, cx: number, cy: number, Rpx: number, t: number) {
  const ph = Math.floor(t * 30);
  ctx.save();
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = 'rgb(170,186,220)';
  ctx.beginPath();
  ctx.rect(-20, -20, VW + 40, VH + 40);
  // A ragged billowing inner edge (frame-stable noise + a rolling 5-lobe wobble): a cloud bank, never a clean circle.
  for (let i = 0; i <= 48; i++) {
    const th = (i / 48) * TAU;
    const rr = (Rpx + 12) * (1 + 0.2 * (hash(i * 3.1 + ph * 0.37) - 0.5) + 0.08 * Math.sin(th * 5 + t * 20));
    (i ? ctx.lineTo : ctx.moveTo).call(ctx, cx + Math.cos(-th) * rr, cy + Math.sin(-th) * rr);
  }
  ctx.closePath();
  ctx.fill('evenodd');
  // Darker billows inside the bank (its rolling body), then the bright puffs packed along the inner edge.
  for (let i = 0; i < 18; i++) {
    const th = hash(i * 5.3 + 1) * TAU, s = 40 + 40 * hash(i * 2.9);
    const rr = Rpx + s * (0.9 + 0.8 * hash(i * 7.1));
    ctx.globalAlpha = 0.35;
    ctx.drawImage(softSprite('storm', 0.55 + 0.3 * hash(i)), cx + Math.cos(th) * rr - s, cy + Math.sin(th) * rr - s, s * 2, s * 2);
  }
  for (let i = 0; i < 40; i++) {
    const th = hash(i * 3.7) * TAU + 0.02 * Math.sin(ph * 0.7 + i), s = 30 + 30 * hash(i * 1.3);
    ctx.globalAlpha = 0.6;
    ctx.drawImage(softSprite(i % 2 ? 'storm' : 'vapor', 0.3), cx + Math.cos(th) * (Rpx + s * 0.6) - s, cy + Math.sin(th) * (Rpx + s * 0.6) - s, s * 2, s * 2);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

/** The dust / dew curtain of the wall from behind the lens: streaks outside the ring, pointing in toward the ball. */
function curtainIn(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, t: number, a: number) {
  if (a <= 0) return;
  const ph = Math.floor(t * 30);
  ctx.save();
  ctx.lineCap = 'butt';
  for (let i = 0; i < 80; i++) {
    const th = hash(i * 4.1) * TAU;
    const len = 24 + 80 * hash(i * 6.7);
    const back = R * (1.0 + 0.35 * hash(i * 2.3 + ph * 0.07));
    const x0 = cx + Math.cos(th) * (back + len), y0 = cy + Math.sin(th) * (back + len);
    const x1 = cx + Math.cos(th) * back, y1 = cy + Math.sin(th) * back;
    ctx.globalAlpha = 0.45 * a;
    ctx.strokeStyle = NAVY;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.globalAlpha = (0.35 + 0.4 * hash(i * 8.9)) * a;
    ctx.strokeStyle = i % 4 === 0 ? ICE : i % 4 === 1 ? 'rgb(200,214,240)' : 'rgb(120,136,170)';
    ctx.lineWidth = 1 + Math.round(2 * hash(i * 1.1));
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }
  // Dust puffs riding the edge (storm smoke, normal blend).
  for (let i = 0; i < 26; i++) {
    const th = hash(i * 7.7 + 3) * TAU;
    const rr = R * (0.98 + 0.12 * hash(i * 5.3));
    const s = 16 + 26 * hash(i * 2.2);
    ctx.globalAlpha = 0.4 * a;
    ctx.drawImage(softSprite('storm', 0.25 + 0.4 * hash(i)), cx + Math.cos(th) * rr - s, cy + Math.sin(th) * rr - s, s * 2, s * 2);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

/** The white shroud: the cone's mouth filling the frame from the edges in (screen space), a ragged vapour rim at the hole. */
function shroud(ctx: CanvasRenderingContext2D, cx: number, cy: number, hole: number, a: number, t: number) {
  if (a <= 0) return;
  const ph = Math.floor(t * 30);
  ctx.save();
  ctx.globalAlpha = clamp(a);
  ctx.fillStyle = 'rgb(214,238,252)';
  ctx.beginPath();
  ctx.rect(-20, -20, VW + 40, VH + 40);
  ctx.arc(cx, cy, Math.max(1, hole), 0, TAU, true);
  ctx.fill('evenodd');
  // A soft inner fringe so the hole has a vapour edge, not a hard circle.
  const n = 40;
  for (let i = 0; i < n; i++) {
    const th = (i / n) * TAU + hash(i + ph) * 0.15;
    const rr = hole * (0.98 + 0.08 * hash(i * 3 + ph));
    const s = 14 + hole * 0.16 * (0.6 + 0.6 * hash(i * 5));
    ctx.globalAlpha = 0.7 * a;
    ctx.drawImage(softSprite('vapor', 0.04), cx + Math.cos(th) * rr - s, cy + Math.sin(th) * rr - s, s * 2, s * 2);
  }
  // A few cyan threads streaming across it (vapour structure, not a flat white).
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = 'rgb(170,220,250)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 26; i++) {
    const th = hash(i * 9.1) * TAU;
    const r0 = hole + 20 + 160 * hash(i * 4.4), r1 = r0 + 80 + 120 * hash(i * 2.6);
    ctx.globalAlpha = 0.35 * a;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(th) * r0, cy + Math.sin(th) * r0);
    ctx.lineTo(cx + Math.cos(th) * r1, cy + Math.sin(th) * r1);
    ctx.stroke();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

/** Hanging dew beads round the dead ball, shivering (before the hit) / frozen (in the hit-stop). */
function dewBeads(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, t: number) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 14; i++) {
    const th = hash(i * 2.1) * TAU;
    const rr = r * (1.15 + 0.6 * hash(i * 3.3));
    const jit = t < T.hit ? Math.sin(t * 70 + i) * 0.8 : 0;
    const bx = x + Math.cos(th) * rr + jit + Math.min(t, T.hit) * 30, by = y + Math.sin(th) * rr;
    drawGlow(ctx, glowOf(PAL.cyan), bx, by, 5, 0.3);
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = ICE;
    ctx.fillRect(Math.round(bx), Math.round(by), i % 3 ? 1 : 2, i % 3 ? 1 : 2);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

/** Iso stage 2's source picture: a flat mid-storm wash (its luma sits mid-band, so the background prints cobalt). */
const WASH = 'rgb(112,128,168)';
const WASH_A = 0.85;

function renderA(env: Env, t: number) {
  const { ctx, fx } = env;
  placeCamA(env, t);
  const st1 = t >= T.hit && t < T.iso2;
  const st2 = t >= T.iso2 && t < T.isoEnd;
  env.world();
  ctx.fillStyle = HEX.stormNavy;
  ctx.fillRect(-200, -200, VW + 400, VH + 400);
  // The goal behind him (the same down-pitch world as shot 6c's POV, from lower and closer): storm, far stand, net.
  drawDownPitch(ctx, env.art.stadium, VIEW_A, t, { storm: 1, ambientFlashes: false });
  if (st2) {
    // The negative print's source: a flat mid-storm wash, so the print is a navy keeper (lit ice) and ball on a cobalt
    // field: a different geometry from stage 1's radial weather map, never its contrast reversal (§4.1).
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = WASH_A;
    ctx.fillStyle = WASH;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
  } else stormDarken(ctx, t < T.hit ? 0.5 : 0.36);
  env.world();
  // Floodlight glare over the far stand's roof (top corners) and a cold backlight behind the keeper, so the terrified
  // face reads against the storm while the ball stays the hottest point.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const [gx, gy, r] of [[40, -6, 90], [612, -14, 110]] as const) {
    drawGlow(ctx, glowOf([200, 225, 255]), gx, gy, r, 0.35);
    drawGlow(ctx, glowOf([255, 255, 255]), gx, gy, r * 0.25, 0.6);
  }
  drawGlow(ctx, glowOf([90, 140, 220]), KA[0] + 10, KA[1] - 120, 150, 0.22);
  ctx.restore();
  const hitAge = t - T.hit;
  const b = ballA(t);
  const BD = BR_A * 2; // the ball's on-world radius at D 2
  // The reborn cone's barrier torus (behind the figures): a 400 px white smoke ring blown off the hit.
  if (hitAge >= 0) {
    const ta = ease.outCubic(u01(t, T.hit, T.cut + 0.02));
    // On iso stage 1 it is kept faint, so the weather map stays at most 4 band pairs (no extra ring of bands round the ball).
    const ia = st1 ? 0.35 : 1;
    vaporTorus(ctx, BA[0], BA[1], lerp(30, 200, ta), t, ia * 0.6 * (1 - 0.5 * ta) * (1 - u01(t, T.shroud, T.tear + 0.02)), 0.86);
  }
  env.parts.draw(ctx, 0);
  // The pre-hit navy pocket goes UNDER the keeper, so his terrified face keeps the warm skin and red mouth of 7b.
  if (hitAge < 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    drawGlow(ctx, glowOf(PAL.navy), b.x, b.y, BD * 1.9, 0.7);
    ctx.restore();
  }
  // The keeper's bust right behind the ball: a depth layer the zoom does not scale (it only shakes with the lens); a
  // 1 px code tremor; lit ice by the hit; at 0.32 his fists are flung apart and the bust is torn away up-right.
  drawKeeperA(env, t, st2);
  // The end-on cone (behind the ball's glow), the dead ball, its beads.
  if (hitAge >= 0 && !st2) coneMouth(ctx, b.x, b.y, coneR(t), t, 1, BR_A * b.D);
  // In the hit-stop the crushed ball keeps its panels (the showcase), white-hot only at the core, inside a navy pocket.
  const hold = t >= T.isoEnd && t < T.tear;
  const heat = hitAge < 0 ? 0.55 : t < T.isoEnd ? 0.95 : hold ? 0.55 : 0.7;
  const glow = hitAge < 0 ? 0.75 : st1 ? 1.0 : t < T.isoEnd ? 1.35 : hold ? 0.85 : 1.0;
  const sq = hitAge >= 0 && t < T.tear ? { sx: 1.1 + 0.03 * Math.sin(t * 95), sy: 0.92 - 0.03 * Math.sin(t * 95) } : undefined;
  if (hitAge < 0 || hold) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    if (hitAge < 0) drawGlow(ctx, glowOf(PAL.navy), b.x, b.y, BD * 1.2, 0.5);
    else drawGlow(ctx, glowOf(PAL.navy), b.x, b.y, BD * 2.4, 0.6);
    ctx.restore();
  }
  drawBall(env, spin, b.x, b.y, BR_A, b.D, heat, glow, 'cobalt', sq, { storm: true });
  if (st2) {
    // The negative print keeps the ball the hot point: its source is a dark disc, so it prints ice inside a navy rim
    // (its glow), exactly where stage 1's ice core was.
    ctx.fillStyle = HEX.stormNavy;
    ctx.beginPath();
    ctx.ellipse(b.x, b.y, BD * (sq?.sx ?? 1) * 0.96, BD * (sq?.sy ?? 1) * 0.96, 0, 0, TAU);
    ctx.fill();
  }
  if (t < T.tear && !st2) dewBeads(ctx, b.x, b.y, BD, t);
  env.parts.draw(ctx, 1);
  // Focus lines: 120 ice / cyan wedges converging on the ball, starting well outside it (never across its face). On iso
  // stage 1 they print as spokes through the weather map (as in hammer 1), none on stage 2, full in the hold.
  if (hitAge >= 0 && t < T.cut && !st2) {
    const fa = st1 ? 0.45 : t < T.tear ? 0.45 : 0.45 * (1 - u01(t, T.tear, T.cut));
    focusLinesIce(ctx, Math.floor(t * 30) * 17, b.x, b.y, 120, BD * 1.6 * (1 + 0.15 * hash(Math.floor(t * 30))), 560, fa);
  }

  // Screen space: the thunder wall (0.00-0.10: the billowing bank, its curtain, a thin ice edge), the shroud (0.26-0.36).
  env.screen();
  const [bx, by] = scrA(env, b.x, b.y);
  const [u, v] = [bx / VW, by / VH];
  if (t < T.hit) {
    const R = wallR(t);
    const ring: ThunderRing = { x: u, y: v, r: R, s: 0.03 };
    fx.shockWidth = 0.05;
    pushShock(fx, { x: u, y: v, r: R, s: lerp(0.02, 0.03, u01(t, 0, T.hit)) });
    wallFlood(ctx, bx, by, R * VH, t);
    curtainIn(ctx, bx, by, R * VH, t, 1);
    iceEdge(ctx, ring, lerp(0.35, 0.6, u01(t, 0, T.hit)), true);
  }
  if (t >= T.shroud) {
    // A gradual close (no one-frame jump): the hole shrinks steadily, the vapour thickens to 0.72 (the brief's
    // photosensitivity fallback for a fourth luminance change in the 12.50-13.50 window).
    const k = u01(t, T.shroud, T.cut);
    const hole = lerp(470, 110, ease.inOutSine(k));
    shroud(ctx, bx, by, hole, lerp(0.2, 0.72, k), t);
  }
  if (t >= T.tear) fx.fullFrame = true;

  // Post: the storm grade, then the stack.
  galeStorm(fx);
  fx.vignette = 0.66;
  if (hitAge >= 0) {
    floodBack(fx, hitAge);
    if (t >= T.isoEnd) fx.bloom = Math.min(fx.bloom, 1.05);
    // Stage 1 is hammer 2's biggest print (escalation over hammer 1's ~55 %): a wide weather map, ~60 % of the frame.
    if (st1) galeIso(fx, 1, [u, v], { mix: 0.5, r: 0.85 });
    else if (st2) {
      galeIso(fx, 2);
      // Keep the wash in the middle band: a low bloom so the lit subjects do not lift the whole background.
      fx.bloom = 0.3;
    }
    // Three shock rings off the ball, 0.03 s apart (3 of the 4 slots: the wall's ring is released at the hit).
    fx.shockWidth = 0.045;
    ([[T.hit, 0.08, 1.3], [T.hit + 0.03, 0.05, 1.0], [T.hit + 0.06, 0.03, 0.75]] as const).forEach(([at, s, rr]) => {
      if (t < at) return;
      const p = u01(t, at, at + 0.36);
      pushShock(fx, { x: u, y: v, r: 0.04 + rr * ease.outQuad(p), s: s * (1 - p * 0.85) });
    });
    // Lens bulge on the ball, CA, radial blur.
    fx.lens = 0.45 * (1 - ease.inQuad(u01(t, T.hit, T.cut + 0.05)));
    fx.lensX = u;
    fx.lensY = v;
    fx.lensR = 0.35;
    fx.ca = lerp(0.016, 0.008, u01(t, T.hit, T.cut));
    // Radial 0.15 on the impact stages; it eases off so the hold reads, then pulls hard into the dive.
    fx.radial = t < T.isoEnd ? 0.15 : t < T.tear ? 0.05 : lerp(0.05, 0.25, u01(t, T.tear, T.cut));
    fx.radialX = u;
    fx.radialY = v;
  } else {
    // The dread: the air in front of the wall is squeezed: the pressure lens pinches the frame toward the ball while
    // the grade tightens. No chromatic split: the refraction ring carries the pressure (no rainbow fringe on the wall).
    const k = u01(t, 0, T.hit);
    fx.lens = -0.12 * ease.inQuad(k);
    fx.lensX = u;
    fx.lensY = v;
    fx.lensR = 0.5;
    fx.ca = 0;
    fx.vignette = 0.6 + 0.12 * k;
    // The air crashing in: a light in-rush toward the ball (kept low so the keeper's face stays readable).
    fx.radial = lerp(0.04, 0.12, k);
    fx.radialX = u;
    fx.radialY = v;
  }
}

/** KF4's bottom row with the glove cuffs and inner outlines replaced by jersey green, stretched into his torso below the
 * bust (the low angle frames him to the waist), darkening downward; and its ice-tinted copy for the lit passes. Built once. */
const BODY_ROWS = 70;
/** The torso extension tapers and fades to nothing by this row (film fix H1). */
const TAPER_ROWS = 50;
/** Navy copies of the tear's sprites (built once each): the depth wash on the torn bust and the flung gloves. */
const navyCopies = new WeakMap<HTMLCanvasElement, HTMLCanvasElement>();
function navyOf(img: HTMLCanvasElement): HTMLCanvasElement {
  let cv = navyCopies.get(img);
  if (cv) return cv;
  cv = document.createElement('canvas');
  cv.width = img.width;
  cv.height = img.height;
  const g = cv.getContext('2d')!;
  g.drawImage(img, 0, 0);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = HEX.navy;
  g.fillRect(0, 0, cv.width, cv.height);
  navyCopies.set(img, cv);
  return cv;
}
let bodyExt: [HTMLCanvasElement, HTMLCanvasElement] | null = null;
function bustBodyOf(img: HTMLCanvasElement): [HTMLCanvasElement, HTMLCanvasElement] | null {
  if (bodyExt) return bodyExt;
  const w = img.width;
  let src: Uint8ClampedArray;
  try {
    src = img.getContext('2d')!.getImageData(0, img.height - 1, w, 1).data;
  } catch {
    return null;
  }
  const green = (x: number) => src[x * 4 + 3] > 0 && src[x * 4 + 1] > src[x * 4] + 20 && src[x * 4 + 1] > src[x * 4 + 2] + 20;
  let x0 = -1, x1 = -1;
  for (let x = 0; x < w; x++) if (src[x * 4 + 3] > 0) { if (x0 < 0) x0 = x; x1 = x; }
  const row = document.createElement('canvas');
  row.width = w;
  row.height = 1;
  const rg = row.getContext('2d')!;
  const out = rg.createImageData(w, 1);
  for (let x = 0; x < w; x++) {
    let k = x;
    if (x > x0 && x < x1 && !green(x)) {
      k = -1;
      for (let d = 1; d < w && k < 0; d++) {
        if (x - d > x0 && green(x - d)) k = x - d;
        else if (x + d < x1 && green(x + d)) k = x + d;
      }
      if (k < 0) k = x;
    }
    for (let c = 0; c < 4; c++) out.data[x * 4 + c] = src[k * 4 + c];
  }
  rg.putImageData(out, 0, 0);
  const mkExt = (tint: string | null) => {
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = BODY_ROWS;
    const g = cv.getContext('2d')!;
    g.imageSmoothingEnabled = false;
    // Film fix H1: a torso, not a slab: the sides taper in (a trapezoid, ~6 sprite px per side by row TAPER_ROWS) ...
    g.save();
    g.beginPath();
    g.moveTo(x0, 0);
    g.lineTo(x1 + 1, 0);
    g.lineTo(x1 + 1 - 6, TAPER_ROWS);
    g.lineTo(x1 + 1 - 6, BODY_ROWS);
    g.lineTo(x0 + 6, BODY_ROWS);
    g.lineTo(x0 + 6, TAPER_ROWS);
    g.closePath();
    g.clip();
    g.drawImage(row, 0, 0, w, 1, 0, 0, w, BODY_ROWS);
    g.restore();
    g.globalCompositeOperation = 'source-atop';
    if (tint) {
      g.fillStyle = tint;
      g.fillRect(0, 0, w, BODY_ROWS);
    } else {
      // Darkening downward (out of the backlight) and round at both sides, so the torso reads as a body, not a slab.
      const gr = g.createLinearGradient(0, 0, 0, BODY_ROWS);
      gr.addColorStop(0, 'rgba(10,18,56,0.25)');
      gr.addColorStop(1, 'rgba(10,18,56,0.85)');
      g.fillStyle = gr;
      g.fillRect(0, 0, w, BODY_ROWS);
      const gh = g.createLinearGradient(0, 0, w, 0);
      gh.addColorStop(0, 'rgba(10,18,56,0.55)');
      gh.addColorStop(0.3, 'rgba(10,18,56,0)');
      gh.addColorStop(0.7, 'rgba(10,18,56,0)');
      gh.addColorStop(1, 'rgba(10,18,56,0.55)');
      g.fillStyle = gh;
      g.fillRect(0, 0, w, BODY_ROWS);
    }
    // ... and it fades out downward (1 -> 0 by row TAPER_ROWS), so no flat bottom edge ever shows.
    g.globalCompositeOperation = 'destination-in';
    const fade = g.createLinearGradient(0, 0, 0, TAPER_ROWS);
    fade.addColorStop(0, 'rgba(0,0,0,1)');
    fade.addColorStop(0.55, 'rgba(0,0,0,0.6)');
    fade.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = fade;
    g.fillRect(0, 0, w, BODY_ROWS);
    return cv;
  };
  return (bodyExt = [mkExt(null), mkExt(HEX.ice)]);
}

/** KF4's glove rectangles (sprite px) and their anchors: the parts that are flung apart at the tear. */
const GLOVES: { r: [number, number, number, number]; a: P2 }[] = [
  { r: [16, 83, 36, 45], a: [36, 110] },
  { r: [72, 85, 33, 43], a: [92, 112] },
];
/**
 * The tear's sprites, built once from KF4: the bust with both gloves lifted out (each glove pixel and its outline is
 * replaced by the nearest jersey pixel on its row), and each glove alone on a transparent sprite.
 */
let tearParts: { bust: HTMLCanvasElement; gloves: HTMLCanvasElement[] } | null | undefined;
function tearPartsOf(img: HTMLCanvasElement) {
  if (tearParts !== undefined) return tearParts;
  const w = img.width, h = img.height;
  let src: Uint8ClampedArray;
  try {
    src = img.getContext('2d')!.getImageData(0, 0, w, h).data;
  } catch {
    return (tearParts = null);
  }
  const at = (x: number, y: number) => (y * w + x) * 4;
  const isGreen = (i: number) => src[i + 3] > 0 && src[i + 1] > src[i] + 20 && src[i + 1] > src[i + 2] + 20;
  const isGlove = (i: number) =>
    src[i + 3] > 0 && ((src[i] > 150 && src[i + 2] < 140) || (src[i] > 240 && src[i + 1] > 240 && src[i + 2] > 240) || (src[i] > 240 && src[i + 1] > 200 && src[i + 2] > 160));
  const mk = () => {
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    const g = cv.getContext('2d')!;
    return { cv, g, d: g.createImageData(w, h) };
  };
  const bust = mk();
  bust.d.data.set(src);
  const gl = GLOVES.map(() => mk());
  GLOVES.forEach(({ r: [rx, ry, rw, rh] }, gi) => {
    for (let y = ry; y < Math.min(h, ry + rh); y++)
      for (let x = rx; x < Math.min(w, rx + rw); x++) {
        const i = at(x, y);
        if (!src[i + 3] || isGreen(i)) continue;
        // A glove pixel, or a dark outline pixel touching one.
        let mine = isGlove(i);
        if (!mine && src[i] < 60 && src[i + 1] < 60) {
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const xx = x + dx, yy = y + dy;
            if (xx >= 0 && yy >= 0 && xx < w && yy < h && isGlove(at(xx, yy))) mine = true;
          }
        }
        if (!mine) continue;
        for (let c = 0; c < 4; c++) gl[gi].d.data[i + c] = src[i + c];
        // Fill the hole in the bust with the nearest jersey pixel on this row (or clear it at the silhouette edge).
        let k = -1;
        for (let d = 1; d < w && k < 0; d++) {
          if (x - d >= 0 && isGreen(at(x - d, y))) k = at(x - d, y);
          else if (x + d < w && isGreen(at(x + d, y))) k = at(x + d, y);
        }
        for (let c = 0; c < 4; c++) bust.d.data[i + c] = k >= 0 ? src[k + c] : 0;
      }
  });
  bust.g.putImageData(bust.d, 0, 0);
  gl.forEach((p) => p.g.putImageData(p.d, 0, 0));
  return (tearParts = { bust: bust.cv, gloves: gl.map((p) => p.cv) });
}

/** The keeper's bust in 8a (screen-space depth layer), with his torso continuing below the sprite. */
function drawKeeperA(env: Env, t: number, st2: boolean) {
  const { ctx, cam } = env;
  // Counter the zoom so the bust keeps its size (a depth layer), but keep a little parallax and all the shake.
  const z = cam.zoom;
  const par = 0.25; // how much of the zoom the bust takes (a slight depth cue)
  const sc = (1 + (z - 1) * par) / z;
  ctx.save();
  ctx.translate(BA[0], BA[1]);
  ctx.scale(sc, sc);
  ctx.translate(-BA[0], -BA[1]);
  const trem = t < T.hit ? (Math.floor(t * 60) % 2 ? 1 : 0) : Math.floor(t * 60) % 2 ? 1 : -1;
  let x = KA[0] + trem, y = KA[1];
  let rot = 0, alpha = 1, s = 2, j = 0, u = 0;
  const torn = t >= T.tear;
  if (torn) {
    // The thunder flings his fists apart and folds him backward: the bust is thrown up and away from us (it shrinks
    // with depth), the gloves fly apart left and right, and the ball blasts through the gap where they were.
    j = ease.outQuad(u01(t, T.tear, T.tear + 0.02));
    u = ease.inQuad(u01(t, T.tear + 0.02, T.cut));
    x += 24 * j + 150 * u;
    y -= 60 * j + 120 * u;
    rot = 0.1 * j + 0.45 * u;
    s = 2 * (1 - 0.15 * j - 0.2 * u);
    alpha = 1 - 0.3 * u;
  }
  const f = keeperFront('KF4');
  if (f) {
    const fr = f.a.frames[f.i];
    const pivot = (fr.anchors.chest ?? [f.a.w / 2, f.a.h / 2]) as P2;
    const ext = bustBodyOf(fr.img);
    const parts = torn ? tearPartsOf(fr.img) : null;
    const place = (a: number) => {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = a;
      ctx.translate(x, y);
      if (rot) ctx.rotate(rot);
      ctx.scale(s, s);
      ctx.translate(-pivot[0], -pivot[1]);
    };
    const body = (img: HTMLCanvasElement, a: number) => {
      if (a <= 0) return;
      place(a);
      ctx.drawImage(img, 0, f.a.h);
      ctx.restore();
    };
    // His torso below the bust (it folds away with him at the tear).
    if (ext) body(ext[0], alpha * (1 - j));
    if (parts) {
      place(alpha);
      ctx.drawImage(parts.bust, 0, 0);
      ctx.globalAlpha = alpha * KEEPER_WASH;
      ctx.drawImage(navyOf(parts.bust), 0, 0);
      GLOVES.forEach((g, gi) => {
        const sd = gi === 0 ? -1 : 1;
        ctx.save();
        ctx.translate(g.a[0] + sd * (34 * j + 18 * u), g.a[1] - (14 * j + 26 * u));
        ctx.rotate(sd * 0.8 * j);
        ctx.translate(-g.a[0], -g.a[1]);
        ctx.globalAlpha = alpha;
        ctx.drawImage(parts.gloves[gi], 0, 0);
        ctx.globalAlpha = alpha * KEEPER_WASH;
        ctx.drawImage(navyOf(parts.gloves[gi]), 0, 0);
        ctx.restore();
      });
      ctx.restore();
    } else {
      drawAnim(ctx, f.a, null, f.i, x, y, s, { pivot, rot, alpha });
      // The depth wash: a navy copy over him (normal blend) pushes him back behind the hot ball.
      drawAnim(ctx, f.a, f.a.tinted(f.i, PAL.navy), f.i, x, y, s, { pivot, rot, alpha: alpha * KEEPER_WASH });
    }
    // Lit by the hit: an ice copy of the bust, additive (the face blown white by the pressure flash). On iso stage 2 it
    // is lit hard, so the negative print shows him as a navy silhouette.
    const lit = st2 ? 0.8 : t >= T.isoEnd && !torn ? 0.3 * (1 - u01(t, T.isoEnd, T.cut)) : 0;
    if (lit > 0) {
      ctx.globalCompositeOperation = 'lighter';
      drawAnim(ctx, f.a, f.a.tinted(f.i, st2 ? PAL.ice : PAL.cyan), f.i, x, y, s, { pivot, rot, alpha: lit * alpha });
      if (ext && st2) body(ext[1], lit * alpha);
      ctx.globalCompositeOperation = 'source-over';
    }
  } else drawKeeperFront(env, 'KF4', x, y, 2);
  ctx.restore();
}

// ================================================================ 8b · THE GOAL MOVES (the side world view)

const OB = 0.35;
const postX = (z: number) => FIELD.goalX + (z - FIELD.horizon) * OB;
const FAR = FIELD.goalFar, NEAR = FIELD.goalNear, GH = FIELD.goalH, GD = FIELD.goalDepth;
/** Side-view px per metre of height (the crossbar 58 px = 2.44 m). */
const HPM = GH / 2.44;

/** The pocket the ball punches into the back net near the far top corner (drawGoal's (u, v) on the back panel). */
const POCKET = { u: 0.1, v: 0.18, r: 0.2 };
function pocketAmt(t: number): number {
  if (t < T.net) return 0;
  const u = t - T.net;
  return u < 0.06 ? 0.62 * ease.outQuad(u / 0.06) : lerp(0.62, 0.32, ease.inOutQuad(clamp((u - 0.06) / 1.2)));
}
/** The back-net point at (u, v) under the rig's dome and the pocket (world px, slide included). */
function netPoint(rig: GoalRig, t: number, u: number, v: number): P2 {
  const fx0 = postX(FAR), nx0 = postX(NEAR);
  const baseX = lerp(fx0, nx0, u) + GD;
  const y = lerp(FAR, NEAR, u) - GH * (1 - v) * 0.92;
  let b = Math.sin(u * Math.PI) * Math.sin(v * Math.PI * 0.9 + 0.1) * rig.dome * 46;
  const d = Math.exp(-((u - POCKET.u) ** 2 + (v - POCKET.v) ** 2) / (POCKET.r * POCKET.r));
  b += d * pocketAmt(t) * 46;
  return [baseX + b + Math.round(rig.slide), y + b * 0.1];
}

/** The ball in 8b (world px): from the keeper's fists into the pocket, then riding the pocket as it relaxes. */
function ballB(t: number, rig: GoalRig): P2 {
  const tip = netPoint(rig, t, POCKET.u, POCKET.v);
  const rest: P2 = [tip[0] - 7, tip[1] + 1];
  if (t >= T.net) return rest;
  const u = u01(t, T.cut - 0.02, T.net);
  const start: P2 = [1166, KEEPER_Y - 1.55 * HPM];
  return [lerp(start[0], rest[0], u), lerp(start[1], rest[1], u)];
}
/** The keeper's ground row in the side view (z of his dead stop). */
const KEEPER_Y = 226;
/** The keeper puppet's world scale in 8b (big enough that the fold and cartwheel read at the wide zoom). */
const KEEPER_S = 0.9;

/** The keeper (puppet): folded like a sail and cartwheeled one full turn up and over into the near side netting. */
function keeperB(t: number, rig: GoalRig): { x: number; y: number; rot: number; tangled: boolean } {
  const x1 = postX(NEAR) + 12 + rig.slide, y1 = NEAR + 2 - 40 * KEEPER_S;
  if (t < T.land) {
    const u = u01(t, T.cut, T.land);
    const x = lerp(1162, x1, ease.outQuad(u));
    // A high arc: the fold and the full turn happen above the crossbar, in silhouette against the stands, after the
    // whiteout (the turn starts at the net impact).
    const y = lerp(KEEPER_Y - 22, y1, ease.inQuad(u)) - 140 * Math.sin(Math.PI * Math.min(1, u * 1.15));
    return { x, y, rot: 0.45 + (TAU - 0.45) * ease.outQuad(u01(t, T.net, T.land)), tangled: false };
  }
  // Hooked in the netting: a damped swing, riding the sliding goal.
  const a = t - T.land;
  const sw = Math.exp(-a * 5) * Math.sin(a * 18);
  return { x: x1 + sw * 2, y: y1 + Math.abs(sw) * 2 - 2 * Math.exp(-a * 8), rot: sw * 0.06, tangled: true };
}

/**
 * 8b camera: blow-back (2.4 -> 1.2 by 0.56, so the skid plays on a settled, close frame), a slight creep through the
 * shove, the proof push and hold, the pull-out for GOAL! (ending tight enough that the shoved goal, its furrows and pegs
 * stay big under the letters).
 */
const ZOOM_B: KeyRow[] = [
  [T.cut, 2.4], [0.56, 1.2, 'blowBack'], [T.stop, 1.24, 'linear'], [T.hold, 1.9, 'inOutCubic'], [T.wave, 1.96, 'linear'],
  [T.wide, 1.1, 'outCubic'], [T.wipe, 1.08, 'linear'],
];
/** 0 = framing the corner, 1 = the goal mouth (the blow-back's settle). */
const FRAME_B: KeyRow[] = [[T.cut, 0], [0.56, 1, 'blowBack']];
/** 0 = the goal mouth at crossbar height, 1 = the turf at the near post foot (the proof push). */
const CRANE_B: KeyRow[] = [[T.cut, 0], [T.stop, 0], [T.hold, 1, 'inOutCubic'], [T.wave, 1], [T.wide, 0, 'outCubic']];

function placeCamB(env: Env, t: number, rig: GoalRig) {
  const fr = keys(FRAME_B, t), cr = keys(CRANE_B, t);
  // The far top corner (the ball's entry) -> the goal mouth at crossbar height. The camera does not truck with the
  // slide: the settled frame holds still, so the goal visibly skids right across the fixed painted line and turf.
  const corner: P2 = [postX(222) + 6, 222 - 1.9 * HPM];
  const mouth: P2 = [postX(257) + 18, 200];
  const foot: P2 = [postX(NEAR) + rig.slide, NEAR];
  const wx0 = lerp(corner[0], mouth[0], fr), wy0 = lerp(corner[1], mouth[1], fr);
  const sx0 = lerp(320, 330, fr), sy0 = 196;
  const wx = lerp(wx0, foot[0], cr), wy = lerp(wy0, foot[1], cr);
  const sx = lerp(sx0, 303, cr), sy = lerp(sy0, 250, cr);
  zoomAbout(env.cam, wx, wy, sx, sy, keys(ZOOM_B, t));
}

/** The pressed wake from the strike spot toward the far top corner (the turf this shot inherits). */
const WAKE: WakePt[] = (() => {
  const pts: WakePt[] = [];
  for (let i = 0; i <= 30; i++) {
    const u = i / 30;
    pts.push({ x: lerp(STRIKE.x, FIELD.goalX - 2, u), y: lerp(STRIKE.z, 224, u), w: lerp(6, 16, u) });
  }
  return pts;
})();

/** The field's pitch canvas ends at x 1400: tile its plain stripes behind the goal (1260-1400 is one 140 px period). */
function pitchBeyond(ctx: CanvasRenderingContext2D, env: Env) {
  const pc = env.art.stadium.pitch;
  for (let x = FIELD.width; x < FIELD.width + 420; x += 140) ctx.drawImage(pc, 1260, 0, 140, pc.height, x, FIELD.horizon, 140, pc.height);
}

/** The bright painted goal line (unmoved, at FIELD.goalX): it is the proof, so it is drawn crisp over the darkened turf. */
function paintedLine(ctx: CanvasRenderingContext2D, a: number) {
  ctx.globalAlpha = a;
  ctx.fillStyle = '#eef4ff';
  for (let y = FIELD.horizon; y < FIELD.horizon + 230; y++) ctx.fillRect(Math.round(FIELD.goalX + (y - FIELD.horizon) * OB), y, 2, 1);
  ctx.globalAlpha = 1;
}

/**
 * The proof in the turf: each post's empty socket left on the painted line (a dark hole with a frosted rim), the furrow
 * ploughed from it to the post foot (soil core, torn grass lips flipped up), the soil heaped against the foot, a few
 * clods thrown either side, and (after the stop) clods still rolling off the near foot.
 */
function furrowDetail(ctx: CanvasRenderingContext2D, rig: GoalRig, t: number) {
  if (rig.slide < 0.5) return;
  for (const [z, salt] of [[FAR, 1], [NEAR, 2]] as const) {
    const px = postX(z), len = rig.slide;
    const L = Math.max(1, Math.round(len));
    // The trench: a taper (3 px at the socket, 8 px at the foot: the frame dug in harder as it was dragged), per column
    // with a ragged lip (±1 px), a dark rim, a soil core lit on its far wall, and grass lips flipped up on both edges.
    for (let x = 0; x < L; x++) {
      const w = lerp(3, 8, x / Math.max(8, L));
      const r1 = hash(x * 1.7 + salt * 13) > 0.6 ? 1 : hash(x * 1.7 + salt * 13) < 0.25 ? -1 : 0;
      const r2 = hash(x * 2.9 + salt * 7) > 0.6 ? 1 : hash(x * 2.9 + salt * 7) < 0.25 ? -1 : 0;
      const top = Math.round(z - w / 2) + r1, bot = Math.round(z + w / 2) + r2;
      const cx = Math.round(px + x);
      ctx.fillStyle = '#08140a';
      ctx.fillRect(cx, top - 1, 1, bot - top + 2);
      ctx.fillStyle = '#2a1a10';
      ctx.fillRect(cx, top, 1, bot - top);
      ctx.fillStyle = '#5a3c26';
      ctx.fillRect(cx, top, 1, Math.max(1, Math.round((bot - top) * 0.35)));
      if (hash(x * 4.3 + salt) > 0.55) {
        ctx.fillStyle = '#7a5638';
        ctx.fillRect(cx, top + 1 + Math.floor(hash(x * 3.1 + salt) * Math.max(1, bot - top - 2)), 1, 1);
      }
      // Torn grass lips: tufts flipped up on the far edge, a lower lip on the near edge.
      if (x % 2 === 0) {
        const h1 = 1 + Math.floor(hash(x * 1.3 + salt * 9) * 3), h2 = 1 + Math.floor(hash(x * 2.3 + salt * 5) * 2);
        ctx.fillStyle = hash(x + salt * 9) > 0.5 ? '#2d6a32' : '#1d4a24';
        ctx.fillRect(cx, top - 1 - h1, 2, h1);
        ctx.fillStyle = '#3b7d3c';
        ctx.fillRect(cx, bot + 1, 2, h2);
      }
    }
    // The empty socket on the painted line: where the post stood (a 7x5 dark hole with a 9 px frost rim above and below;
    // proofLight leaves these rows unlit, so it sits crisp on the glowing line).
    ctx.fillStyle = '#05070f';
    ctx.fillRect(Math.round(px - 3), Math.round(z - 3), 7, 5);
    ctx.fillStyle = '#c8e8ff';
    ctx.fillRect(Math.round(px - 4), Math.round(z - 4), 9, 1);
    ctx.fillRect(Math.round(px - 4), Math.round(z + 2), 9, 1);
    // The soil mound pushed up in front of the post foot (4 rows, lit on top, shadowed at its base).
    const mx = Math.round(px + len + 1), my = Math.round(z + 3);
    const rows: [number, number, string][] = [[3, 4, '#7a5638'], [2, 6, '#5a3c26'], [1, 8, '#3a2618'], [0, 9, '#2a1a10']];
    for (const [dy, w, c] of rows) {
      ctx.fillStyle = c;
      ctx.fillRect(mx + Math.floor((9 - w) / 2), my - dy, w, 1);
    }
    ctx.fillStyle = '#05070f';
    ctx.fillRect(mx, my + 1, 10, 1);
    ctx.fillStyle = '#2d6a32';
    ctx.fillRect(mx + 3, my - 4, 2, 1);
    ctx.fillRect(mx + 6, my - 3, 1, 1);
    // A few small clods thrown either side of the furrow (they appear as the post passes them).
    for (let i = 0; i < 5; i++) {
      const cx = hash(i * 3.1 + salt) * GOAL_SLIDE;
      if (cx > len) continue;
      const side = hash(i * 7.9 + salt) > 0.5 ? 1 : -1;
      const cy = z + side * (8 + 5 * hash(i * 1.3 + salt));
      const sz = 1 + Math.floor(hash(i * 5.5 + salt) * 2);
      ctx.fillStyle = '#05070f';
      ctx.fillRect(Math.round(px + cx), Math.round(cy) + sz, sz, 1);
      ctx.fillStyle = hash(i * 2.2) > 0.4 ? '#5a3c26' : '#2d6a32';
      ctx.fillRect(Math.round(px + cx), Math.round(cy), sz, sz);
    }
  }
  // The near peg, popped and lying on its side by the near post foot: a metal tent peg (shaft, hook, soil on its tip).
  const pk = u01(t, T.peg + 0.25, T.peg + 0.4);
  if (pk > 0) {
    const gx = Math.round(postX(NEAR) + rig.slide + 16 + 4 * ease.outQuad(pk)), gy = Math.round(NEAR + 7 - 6 * Math.sin(Math.PI * pk));
    ctx.fillStyle = '#05070f';
    ctx.fillRect(gx - 1, gy - 3, 9, 5);
    ctx.fillStyle = '#9aa2b4';
    ctx.fillRect(gx, gy, 7, 1);
    ctx.fillStyle = '#e8ecf6';
    ctx.fillRect(gx + 1, gy - 1, 4, 1);
    ctx.fillStyle = '#c8ccd8';
    ctx.fillRect(gx + 6, gy - 2, 1, 2);
    ctx.fillStyle = '#5a3c26';
    ctx.fillRect(gx, gy, 2, 1);
  }
  // Six clods ploughed off the feet during the skid, thrown forward and sideways, hopping and rolling until they settle
  // (by 1.5); each 3 px with a 1 px shadow that separates while it hops. Pure functions of the shot clock.
  for (let i = 0; i < 6; i++) {
    const z = i < 4 ? NEAR : FAR;
    const t0 = T.shove + 0.06 + i * 0.07;
    if (t < t0) continue;
    const s0 = goalRigAt(t0).slide;
    const x0 = postX(z) + s0 + 4, y0 = z;
    const p = ease.outCubic(u01(t, t0, 1.5));
    const dx = 8 + 22 * hash(i * 1.9 + 4), dy = (hash(i * 3.3) > 0.5 ? 1 : -1) * (3 + 6 * hash(i * 2.7));
    const hop = Math.abs(Math.sin(Math.PI * 3 * p)) * 7 * (1 - p) * (1 - p);
    const x = Math.round(x0 + dx * p), gy = Math.round(y0 + dy * p), y = Math.round(gy - hop);
    ctx.fillStyle = '#05070f';
    ctx.fillRect(x, gy + 3, 3, 1);
    ctx.fillStyle = '#3a2618';
    ctx.fillRect(x, y, 3, 3);
    // The lit facet turns as it rolls.
    const f = Math.floor(p * 9 + i) % 4;
    ctx.fillStyle = i % 3 === 1 ? '#3b7d3c' : '#7a5638';
    ctx.fillRect(x + (f === 1 || f === 2 ? 1 : 0), y + (f >= 2 ? 1 : 0), 2, 1);
  }
}

/** The near side netting (the panel facing the lens), from the near post back to the back net; taut during the skid. */
function sideNetting(ctx: CanvasRenderingContext2D, rig: GoalRig, t: number) {
  const nx = postX(NEAR) + Math.round(rig.slide);
  const back0 = netPoint(rig, t, 1, 0), back1 = netPoint(rig, t, 1, 1);
  const top: P2 = [nx, NEAR - GH], foot: P2 = [nx, NEAR];
  // The skid drags the panel: it bows back while the frame accelerates, snaps taut with a ripple.
  const sk = t > T.shove && t < T.stop + 0.3 ? Math.sin((t - T.shove) * 26) * Math.exp(-(t - T.shove) * 4) * 4 : 0;
  ctx.save();
  ctx.strokeStyle = 'rgba(230,235,255,0.42)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const v = i / 5;
    const a: P2 = [lerp(top[0], foot[0], v), lerp(top[1], foot[1], v)];
    const b: P2 = [lerp(back0[0], back1[0], v), lerp(back0[1], back1[1], v)];
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.quadraticCurveTo((a[0] + b[0]) / 2 + sk, (a[1] + b[1]) / 2 + 2, b[0], b[1]);
    ctx.stroke();
  }
  for (let i = 1; i <= 4; i++) {
    const u = i / 5;
    ctx.beginPath();
    ctx.moveTo(lerp(top[0], back0[0], u) + sk * Math.sin(u * Math.PI), lerp(top[1], back0[1], u));
    ctx.lineTo(lerp(foot[0], back1[0], u) + sk * Math.sin(u * Math.PI), lerp(foot[1], back1[1], u));
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * The crossbar's drawn bend (px): the rig's spring exaggerated 1.6x during the skid so the U reads at the wide zoom
 * (easing back to 1x by 1.0), plus a small ±3 px spring that stays alive through the proof hold (dying by ~1.6).
 */
function bendAt(rig: GoalRig, t: number): number {
  const k = lerp(1.6, 1, u01(t, 0.8, 1.0));
  const live = t > 0.95 ? 3 * Math.exp(-Math.max(0, t - 1.15) * 3) * Math.sin(t * 25) * u01(t, 0.95, 1.15) : 0;
  return rig.bend * k + live;
}

/** The goal's back part (net with the ball's pocket, far post, crossbar bowed into a U, frost) under the rig. */
function rigBack(ctx: CanvasRenderingContext2D, rig: GoalRig, t: number) {
  const fx0 = postX(FAR), nx0 = postX(NEAR);
  const dimple: NetDimple = { u: POCKET.u, v: POCKET.v, amt: pocketAmt(t), r: POCKET.r };
  ctx.save();
  ctx.translate(Math.round(rig.slide), 0);
  drawGoal(ctx, 'back', rig.dome, 0, dimple);
  const bend = bendAt(rig, t);
  if (Math.abs(bend) > 0.3) {
    const n = 14;
    const pt = (i: number): P2 => {
      const u = i / n;
      return [lerp(fx0, nx0, u) + Math.sin(Math.PI * u) * bend, lerp(FAR, NEAR, u) - GH];
    };
    // Over the straight bar: erase it first (navy), then the bowed bar.
    ctx.strokeStyle = HEX.navy;
    ctx.lineWidth = 6;
    ctx.beginPath();
    for (let i = 0; i <= n; i++) (i ? ctx.lineTo : ctx.moveTo).apply(ctx, pt(i));
    ctx.stroke();
    ctx.strokeStyle = '#f4f6ff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i <= n; i++) (i ? ctx.lineTo : ctx.moveTo).apply(ctx, pt(i));
    ctx.stroke();
  }
  ctx.restore();
}

/** Frost racing along the frame from the impact corner, and the frame's ice rim light (additive). */
function frostGlow(ctx: CanvasRenderingContext2D, rig: GoalRig, t: number) {
  if (rig.frost <= 0) return;
  const s = Math.round(rig.slide);
  const fx0 = postX(FAR) + s, nx0 = postX(NEAR) + s;
  const run = rig.frost;
  const bend = bendAt(rig, t);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  // The crossbar from the far corner toward the near post, then down both posts.
  const n = 24;
  for (let i = 0; i < n * Math.min(1, run * 1.4); i++) {
    const u = i / n;
    const x = lerp(fx0, nx0, u) + Math.sin(Math.PI * u) * bend, y = lerp(FAR, NEAR, u) - GH;
    drawGlow(ctx, glowOf(PAL.cyan), x, y, 6, 0.35 * run);
    ctx.globalAlpha = 0.9 * run;
    ctx.fillStyle = ICE;
    ctx.fillRect(Math.round(x - 1), Math.round(y - 2 - (i % 3)), 2, 1);
  }
  const down = clamp(run * 1.4 - 0.4);
  for (const [px, z] of [[fx0, FAR], [nx0, NEAR]] as const) {
    for (let y = 0; y < GH * down; y += 3) {
      ctx.globalAlpha = 0.85 * run;
      ctx.fillStyle = ICE;
      ctx.fillRect(Math.round(px + 1 + (y % 2)), Math.round(z - GH + y), 1, 2);
    }
    drawGlow(ctx, glowOf(PAL.cyan), px, z - GH + GH * down * 0.5, 10, 0.25 * run * down, 0.5, 3);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

/** World x of the thunder wall's front in 8b: it hammered the ball and runs on through the goal, shoving it. */
const WALL_X: KeyRow[] = [[T.cut, 1150], [0.46, 1212, 'outQuad'], [T.stop, 1300, 'linear'], [1.12, 1540, 'inQuad']];
const wallX = (t: number) => keys(WALL_X, t);

/**
 * The thunder wall carrying on through the goal (screen space; drawn behind the frame): one large-radius refraction
 * ring centred far off-frame left (GALE's side-view wall, as in 7b), its ice edge line and the dust / dew curtain
 * behind it. It reaches the posts at ~0.46 and shoves the goal; it thins out past the net by ~1.0.
 */
function wallSweep(env: Env, t: number) {
  const a = u01(t, T.cut, T.cut + 0.05) * (1 - u01(t, T.stop + 0.02, 1.12));
  if (a <= 0) return;
  const { ctx, fx, cam } = env;
  env.screen();
  const [e] = cam.toUV(wallX(t), 240);
  const cxU = -2.0, cyU = 0.55;
  const ring: ThunderRing = { x: cxU, y: cyU, r: (e - cxU) * (VW / VH), s: 0.03 * a };
  fx.shockWidth = 0.05;
  pushShock(fx, { x: ring.x, y: ring.y, r: ring.r, s: ring.s });
  const h = lerp(200, 280, u01(t, T.cut, 0.7));
  if (t > T.shove) {
    // Clear the fog off the proof: once the goal is shoved the curtain thins and stays left of the painted line, so the
    // line, the sockets and the furrows read.
    const lx = cam.toUV(FIELD.goalX + (NEAR - FIELD.horizon) * OB, NEAR)[0] * VW;
    ctx.save();
    ctx.beginPath();
    ctx.rect(-60, 0, lx - 10 + 60, VH);
    ctx.clip();
    curtainSide(ctx, ring, h, t, a * 0.8);
    ctx.restore();
  } else curtainSide(ctx, ring, h, t, a);
  // The wall's front edge hugs the ground inside the dust curtain (a low pressure front, never a line from the sky): a
  // short ragged glint at the curtain's foot, held at full strength through the slam and gone by 0.66 (nothing crosses
  // the proof).
  const ea = a * (1 - u01(t, 0.6, 0.66));
  const top = VH - h * 0.5;
  const ph = Math.floor(t * 30);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let y = Math.max(0, Math.ceil(top)); y < VH && ea > 0; y++) {
    const x0 = ringEdgeX(ring, y);
    if (x0 === null || hash(y * 1.7 + ph) < 0.3) continue;
    const x = x0 + (hash(y * 3.1 + ph * 0.5) - 0.5) * 6;
    const k = ea * clamp((y - top) / (h * 0.3));
    ctx.globalAlpha = 0.22 * k;
    ctx.fillStyle = CYAN;
    ctx.fillRect(Math.round(x) - 4, y, 8, 1);
    ctx.globalAlpha = 0.4 * k;
    ctx.fillStyle = ICE;
    ctx.fillRect(Math.round(x), y, 1, 1);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

/**
 * The wall's dust / dew curtain in the side view (screen space, normal blend): rolling storm smoke and vapour packed
 * behind the ice edge, h px tall from the bottom of the frame with a torn top, and wind streaks raking through it.
 */
function curtainSide(ctx: CanvasRenderingContext2D, ring: ThunderRing, h: number, t: number, a: number) {
  if (a <= 0) return;
  const ph = Math.floor(t * 24);
  ctx.save();
  for (let i = 0; i < 72; i++) {
    const y = VH + 10 - Math.pow(hash(i * 2.3), 0.8) * h;
    const x = ringEdgeX(ring, y);
    if (x === null) continue;
    const back = hash(i * 5.7) * 150 + 6;
    const s = 12 + hash(i * 3.1) * 30 * (1 - (VH - y) / (h * 1.6));
    const torn = y < VH - h * 0.75 ? 0.45 : 1;
    const roll = Math.sin(t * 9 + i) * 4;
    ctx.globalAlpha = clamp(a * 0.5 * torn);
    ctx.drawImage(softSprite('storm', 0.15 + hash(i) * 0.5), x - back - s, y - s + roll, s * 2, s * 2);
    if (i % 2 === 0) {
      ctx.globalAlpha = clamp(a * 0.3 * torn);
      ctx.drawImage(softSprite('vapor', 0.1 + hash(i * 9) * 0.3), x - back * 0.4 - s * 0.6, y - s * 0.6 - roll, s * 1.2, s * 1.2);
    }
  }
  // Streaks raking right through the curtain (irregular: never stripes).
  ctx.fillStyle = 'rgb(226,246,255)';
  for (let i = 0; i < 30; i++) {
    const y = Math.round(VH - hash(i * 7.3) * h * 0.9);
    const x = ringEdgeX(ring, y);
    if (x === null) continue;
    const len = 20 + 70 * hash(i * 1.9 + ph * 0.1);
    // Every streak stays at least 24 px behind the edge: nothing ticks off the front line.
    const x0 = x - 24 - hash(i * 4.4 + ph * 0.3) * 150;
    const len2 = Math.min(len, x - 24 - x0);
    if (len2 < 4) continue;
    ctx.globalAlpha = clamp(a * (0.25 + 0.3 * hash(i * 3.9)));
    ctx.fillRect(Math.round(x0), y, Math.round(len2), 1 + (i % 3 === 0 ? 1 : 0));
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

/** The frame's cold rim light (it is the subject of the climax: white posts glowing ice in the storm). */
function frameGlow(ctx: CanvasRenderingContext2D, rig: GoalRig, t: number) {
  const s = Math.round(rig.slide);
  const fx0 = postX(FAR) + s, nx0 = postX(NEAR) + s;
  const a = 0.3 + 0.4 * (1 - u01(t, T.net, T.net + 1.2));
  const bend = bendAt(rig, t);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const [px, z] of [[fx0, FAR], [nx0, NEAR]] as const) drawGlow(ctx, glowOf(PAL.cyan), px, z - GH / 2, 9, a, 0.6, GH / 16);
  for (let i = 0; i <= 6; i++) {
    const u = i / 6;
    drawGlow(ctx, glowOf(PAL.cyan), lerp(fx0, nx0, u) + Math.sin(Math.PI * u) * bend, lerp(FAR, NEAR, u) - GH, 9, a * 0.8);
  }
  ctx.restore();
}

/** The proof hold's key (0 -> 1 over the push, held, out on the pull-out). */
const HOLD_K: KeyRow[] = [[T.stop, 0], [T.hold, 1], [T.wave, 1], [T.wide, 0]];
/** How hard the hooked keeper is multiplied by navy at the hold's peak (he sits beside the proof; the gap is the subject). */
const KEEPER_HOLD_MUL = 0.5;
/** Navy-multiplied copies of cached puppet canvases (colour × navy, the puppet's own alpha kept). */
const navyMul = new WeakMap<HTMLCanvasElement, HTMLCanvasElement>();
function navyMulOf(img: HTMLCanvasElement): HTMLCanvasElement {
  let cv = navyMul.get(img);
  if (cv) return cv;
  cv = document.createElement('canvas');
  cv.width = img.width;
  cv.height = img.height;
  const g = cv.getContext('2d')!;
  g.drawImage(img, 0, 0);
  g.globalCompositeOperation = 'multiply';
  g.fillStyle = HEX.navy;
  g.fillRect(0, 0, cv.width, cv.height);
  g.globalCompositeOperation = 'destination-in';
  g.drawImage(img, 0, 0);
  navyMul.set(img, cv);
  return cv;
}
/** The shove's key: the goal area lit while it is hit and skids (net -> shove -> stop), handing over to the hold. */
const SHOVE_K: KeyRow[] = [[T.net, 0], [T.shove, 1], [T.stop, 1], [T.hold, 0]];

/** A cool floodlight pool over the goal area (additive), so the frame and the furrows read in the storm night. */
function lightPool(ctx: CanvasRenderingContext2D, rig: GoalRig, t: number) {
  // Bright and wide over the whole goal while it is slammed and skids; in the proof hold, a capped pool centred on the
  // near post foot (never a white flare over the socket on the painted line).
  const h = keys(HOLD_K, t), sh = keys(SHOVE_K, t);
  const k = Math.max(0.45 + 0.4 * sh, 0.45 + 0.15 * h);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf([190, 225, 255]), postX(NEAR) + rig.slide * lerp(0.5, 1, h), NEAR - 4, lerp(130, 100, h), k, 1.3, 0.6);
  ctx.restore();
}

/**
 * The proof's light (world space, additive, faded in over the push and out on the pull-out): an ice core and a cyan halo
 * along the painted line, and ice cores down both post feet, so the line, the furrow's ends and the frame carry the
 * hottest pixels of the hold.
 */
function proofLight(ctx: CanvasRenderingContext2D, rig: GoalRig, t: number) {
  const k = keys([[T.stop, 0], [T.hold, 1], [T.wave, 1], [T.wide, 0]], t);
  if (k <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let y = NEAR - 80; y < NEAR + 70; y++) {
    // The two empty sockets stay dark on the lit line.
    if ((y >= FAR - 4 && y <= FAR + 2) || (y >= NEAR - 4 && y <= NEAR + 2)) continue;
    const x = Math.round(FIELD.goalX + (y - FIELD.horizon) * OB);
    ctx.globalAlpha = 0.24 * k;
    ctx.fillStyle = CYAN;
    ctx.fillRect(x - 3, y, 8, 1);
    ctx.globalAlpha = 0.85 * k;
    ctx.fillStyle = ICE;
    ctx.fillRect(x, y, 3, 1);
  }
  const s = Math.round(rig.slide);
  for (const z of [FAR, NEAR]) {
    const px = postX(z) + s;
    ctx.globalAlpha = 0.8 * k;
    ctx.fillStyle = ICE;
    ctx.fillRect(px, z - GH, 2, GH);
    drawGlow(ctx, glowOf(PAL.cyan), px + 1, z - 4, 10, 0.35 * k, 1.2, 0.6);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

/** Floodlight beams slanting down from the upper right, with dust and dew drifting through them (the proof's hold). */
function beams(ctx: CanvasRenderingContext2D, env: Env, a: number) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) {
    const x0 = 380 + i * 120, w = 46 + i * 18;
    const g = ctx.createLinearGradient(x0, 0, x0 - 220, VH);
    g.addColorStop(0, rgba([200, 230, 255], 0.1 * a));
    g.addColorStop(1, rgba([200, 230, 255], 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x0, -10);
    ctx.lineTo(x0 + w, -10);
    ctx.lineTo(x0 + w - 230, VH + 10);
    ctx.lineTo(x0 - 230, VH + 10);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  void env;
}

/** The cyan glint running down the painted line (1.18-1.40): the eye is led along the line to the gap. */
function lineGlint(ctx: CanvasRenderingContext2D, t: number) {
  const u = u01(t, T.glint, T.glint + 0.22);
  if (u <= 0 || u >= 1) return;
  const y = lerp(232, 318, ease.inOutQuad(u));
  const x = FIELD.goalX + (y - FIELD.horizon) * OB + 1;
  const a = Math.sin(u * Math.PI);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.cyan), x, y, 12, 0.7 * a, 0.6, 1.4);
  drawGlow(ctx, glowOf(PAL.ice), x, y, 4, 0.95 * a);
  ctx.globalAlpha = 0.9 * a;
  ctx.fillStyle = ICE;
  for (let k = -8; k <= 8; k++) ctx.fillRect(Math.round(x + k * OB), Math.round(y + k), 2, 1);
  ctx.restore();
  ctx.globalAlpha = 1;
}

/** The ice / cyan focus lines round the net impact (screen space). */
function netFocus(ctx: CanvasRenderingContext2D, env: Env, t: number, wx: number, wy: number) {
  const a = 1 - u01(t, T.net, T.net + 0.16);
  if (t < T.net || a <= 0) return;
  const [u, v] = env.cam.toUV(wx, wy);
  // They stop well outside the dome, so the ball in its pocket stays visible.
  focusLinesIce(ctx, Math.floor(t * 30) * 13 + 5, u * VW, v * VH, 40, 110, 520, a * 0.8);
}

/** GOAL! as a train of glyphs: each glyph's screen centre x (130 px, centred on the frame) and width. */
const GOAL_SIZE = 130;
function goalGlyphs(ctx: CanvasRenderingContext2D): { c: string; cx: number }[] {
  ctx.save();
  ctx.font = `${GOAL_SIZE}px ${TITLE_FONT}`;
  const g = [...'GOAL!'];
  const ws = g.map((c) => ctx.measureText(c).width + GOAL_SIZE * 0.03);
  ctx.restore();
  let gx = VW / 2 - ws.reduce((p, q) => p + q, 0) / 2;
  return g.map((c, i) => {
    const cx = gx + ws[i] / 2;
    gx += ws[i];
    return { c, cx };
  });
}
/** How far each glyph flies in from its own slot. */
const GLYPH_RUN = 320;
/**
 * Film fix H3: GOAL! assembles in reading order and holds. The whole train leaves together at 1.56 on the wave's front,
 * and each glyph's flight is 0.03 s longer than the one before it, so 'G' lands first (1.72), then O, A, L, and '!'
 * (1.84): every glyph stays right of the one before it the whole way in (the gap never closes by more than ~25 px), and
 * the word holds fully assembled ~0.38 s to the wipe.
 */
const G0 = T.wave + 0.02;
const glyphStart = (_i: number, _n: number) => G0;
const glyphDur = (i: number) => 0.16 + 0.03 * i;
/** When glyph i lands in its slot. */
const glyphLand = (i: number) => G0 + glyphDur(i);

/**
 * The stadium wind wave's front (screen x): it rolls in from screen-left at 1.54, carries the leading glyph '!' while it
 * flies into its slot, then runs on off the right edge by 1.89 (GOAL! rides it, then it passes the letters).
 */
function waveFrontX(t: number, leadCx: number): number {
  const start = leadCx - GLYPH_RUN + 30;
  if (t < G0) return lerp(-80, start, u01(t, T.wave, G0));
  const lead = leadCx - GLYPH_RUN * (1 - ease.outCubic(u01(t, G0, glyphLand(4)))) + 30;
  return Math.max(lead, lerp(start, VW + 60, u01(t, G0, T.wave + 0.35)));
}

/** The gust band riding the wave front across the stands (additive ice), with dew streaks raking right off it. */
function gustBand(ctx: CanvasRenderingContext2D, env: Env, fx0: number, t: number) {
  const a = 1 - u01(t, T.wave + 0.3, T.wave + 0.4);
  if (a <= 0) return;
  const { cam } = env;
  const hy = (FIELD.horizon - cam.y) * cam.zoom + VH / 2;
  const y0 = hy - 170, y1 = hy - 50;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  if (y1 > 0) {
    const g = ctx.createLinearGradient(fx0 - 220, 0, fx0 + 24, 0);
    g.addColorStop(0, 'rgba(238,251,255,0)');
    g.addColorStop(0.9, `rgba(238,251,255,${0.55 * a})`);
    g.addColorStop(1, 'rgba(238,251,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(fx0 - 220, y0, 244, y1 - y0);
  }
  const ph = Math.floor(t * 30);
  ctx.fillStyle = ICE;
  for (let i = 0; i < 30; i++) {
    const y = Math.round(20 + hash(i * 3.3 + 1) * (VH - 40));
    const len = 20 + 40 * hash(i * 1.7 + ph * 0.11);
    const x0 = fx0 - 90 * hash(i * 5.1 + ph * 0.07);
    ctx.globalAlpha = (0.25 + 0.35 * hash(i * 7.9)) * a;
    ctx.fillRect(Math.round(x0), y, Math.round(len), 1);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

/**
 * The stadium hears it: 14 ice / cyan flags and scarves along the stand rows (world space, on the crowd's 0.25 parallax),
 * each switching on and whipping right on a 7 Hz flutter as the wind wave's front passes it.
 */
function waveFlags(ctx: CanvasRenderingContext2D, env: Env, front: number, t: number) {
  const { cam } = env;
  const cx = cam.x * 0.25 - 220;
  ctx.save();
  for (let i = 0; i < 14; i++) {
    const row = i % 3;
    const wx = Math.round(cx + 840 + i * 42 + 14 * hash(i * 2.7));
    const wy = Math.round(FIELD.horizon - 96 + row * 30 + 6 * hash(i * 5.1));
    const sx = (wx - cam.x) * cam.zoom + VW / 2;
    const on = clamp((front - sx) / 40);
    if (on <= 0) continue;
    const col = i % 2 ? CYAN : ICE;
    // The pole.
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#05070f';
    ctx.fillRect(wx, wy - 1, 1, 9);
    // The cloth: three 2 px segments trailing right, each lagging the 7 Hz flutter a little (a travelling ripple).
    const lift = 1 - on; // still drooping as the wave reaches it
    for (let k = 0; k < 3; k++) {
      const dy = Math.round(Math.sin(t * TAU * 7 + i * 1.3 - k * 0.9) * (0.6 + 0.6 * k) + lift * (2 + k * 2));
      ctx.globalAlpha = 0.95 * on;
      ctx.fillStyle = col;
      ctx.fillRect(wx + 1 + k * 2, wy + dy, 2, 6 - k);
    }
  }
  ctx.restore();
  ctx.globalAlpha = 1;
  // A cold glow on each live flag, so they read through the storm grade.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 14; i++) {
    const row = i % 3;
    const wx = cx + 840 + i * 42 + 14 * hash(i * 2.7), wy = FIELD.horizon - 96 + row * 30 + 6 * hash(i * 5.1);
    const sx = (wx - cam.x) * cam.zoom + VW / 2;
    const on = clamp((front - sx) / 40);
    if (on > 0) drawGlow(ctx, glowOf(PAL.cyan), wx + 4, wy + 3, 7, 0.35 * on);
  }
  ctx.restore();
}

function renderB(env: Env, t: number) {
  const { ctx, fx, cam } = env;
  const rig = goalRigAt(t);
  placeCamB(env, t, rig);
  // GOAL!'s layout and the wind wave's front: the backdrop's windWave is set so its front (windWaveX: cam.x ± 400 world px)
  // lands on the same screen x as the gust band and the leading glyph.
  const glyphs = goalGlyphs(ctx);
  const front = waveFrontX(t, glyphs[glyphs.length - 1].cx);
  const wave = clamp(((front - VW / 2) / cam.zoom + 400) / 800);
  env.world();
  ctx.fillStyle = HEX.stormNavy;
  ctx.fillRect(cam.x - 900, cam.y - 600, 1800, 1200);
  const st = env.art.stadium;
  drawFieldBackdrop(ctx, st, cam.x, cam.y, t, {
    storm: 1,
    wind: t < T.wave ? 0.65 : 0.9,
    windWave: t >= T.wave ? wave : undefined,
    boardsFold: t >= T.wave ? wave : 0,
    towerSway: t >= T.wave ? 2 * (1 - wave * 0.4) : 0.6,
  });
  pitchBeyond(ctx, env);
  // The storm night; eased while the goal is slammed and skids (it is lit, the subject), and a touch in the proof hold so
  // the turf round the line reads.
  stormDarken(ctx, 0.5 - 0.06 * keys(HOLD_K, t) - 0.2 * keys(SHOVE_K, t));
  const shK = keys(SHOVE_K, t);
  if (shK > 0) {
    // The slam's dust and dew hanging in the floodlights behind the goal (normal blend, storm ramp): the frame and the
    // flying keeper read against a lit haze instead of a black stand.
    env.world();
    ctx.save();
    drawGlow(ctx, glowOf([120, 136, 170]), postX(257) + rig.slide, FIELD.horizon - 30, 120, 0.3 * shK, 1.8, 0.8);
    ctx.restore();
  }
  if (t >= T.wave) {
    // The stadium hears it: the wind wave lifts the stands out of the storm (additive, above the horizon only).
    const waveK = keys([[T.wave, 0], [T.wave + 0.15, 1], [T.wipe, 0.6]], t);
    const hy = (FIELD.horizon - cam.y) * cam.zoom + VH / 2;
    if (hy > 0 && waveK > 0) {
      env.screen();
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(120,150,210,${0.2 * waveK})`;
      ctx.fillRect(0, 0, VW, Math.min(VH, hy));
      ctx.restore();
    }
    env.world();
    waveFlags(ctx, env, front, t);
  }
  env.world();
  lightPool(ctx, rig, t);
  // The turf this shot inherits: the pressed wake and air step 3's crater, then the painted line (unmoved).
  pressedWake(ctx, WAKE, t, { mist: 0.25, alpha: 0.6 });
  const c3 = STAMPS[2];
  airCrater(ctx, c3.x, c3.z, 20, 0.3, 2, 3, 0.8);
  paintedLine(ctx, 0.9);
  drawGoalRig(ctx, 'turf', rig, t);
  furrowDetail(ctx, rig, t);
  if (t >= T.glint) lineGlint(ctx, t);
  // The thunder wall carries on through the goal (behind the frame): its dust curtain and ground-hugging edge sweep on.
  wallSweep(env, t);
  env.world();
  env.parts.draw(ctx, 0);
  // The ball in its pocket. Through the impact (to 0.70) it is drawn over the net, the cone and its torus, so its panels
  // and ice core read at the tip of the dome; afterwards it sits behind the mesh.
  const [bx, by] = ballB(t, rig);
  const inNet = t >= T.net;
  const showcase = t < T.net + 0.3;
  const sq = inNet && t < T.net + 0.08 ? { sx: 0.8, sy: 1.15 } : undefined;
  if (!showcase) drawBall(env, spin, bx, by, 4, 2, 0.85, 1.1, 'cobalt', sq, { storm: true });
  rigBack(ctx, rig, t);
  // The pressure bubble round the ball at the tip of its pocket (a glass-marble lens: the post lens does the bending).
  if (inNet) bubbleRim(ctx, bx, by, 12, t, 0.9 * (1 - u01(t, T.net + 0.4, T.net + 1.4)));
  // The reborn cone trailing the ball into the corner, then slamming into the net and bursting through it (a navy
  // pocket keeps the ball the hottest point: never a white blob).
  if (t < T.net + 0.22) {
    const k = u01(t, T.net, T.net + 0.22);
    const len = t < T.net ? 180 : 180 * (1 - ease.outQuad(k));
    // After the net it collapses fast (gone by 0.48), so the pocketed ball's ice core outshines its cone.
    const ca = t < T.net ? 0.45 : 0.3 * (1 - k) * (1 - u01(t, T.net, T.net + 0.08));
    vaporCone(ctx, bx, by, 0, t < T.net ? 52 : 52 * (1 - 0.6 * k), len, t, ca, { ballR: 9, pocket: true });
  }
  if (inNet) {
    // The barrier torus left at the pocket: a ring across the flight line, so seen side-on it is a tall thin ellipse.
    const k = u01(t, T.net, T.net + 0.45);
    ctx.save();
    ctx.translate(bx - 6, by + 4);
    ctx.scale(0.32, 1);
    vaporTorus(ctx, 0, 0, lerp(10, 74, ease.outCubic(k)), t, 1 - k, 1);
    ctx.restore();
  }
  // The keeper: folded and cartwheeled high over the crossbar, then hooked in the near side netting.
  const kp = keeperB(t, rig);
  const kz = clamp(Math.round(KEEPER_S * cam.zoom * 10) / 10, 0.4, 2.0);
  if (kp.tangled) {
    PUPPETS.draw(ctx, 'gk8-tangle', KEEPER_KIT, POSES.netTangle, kz, -1, kp.x, kp.y, KEEPER_S / kz, 1, undefined, 1, kp.rot);
    // In the proof hold he is multiplied by navy (0.5 at the hold's peak), so the eye goes to the line / post-foot gap.
    const hk = keys(HOLD_K, t);
    if (hk > 0) {
      const r = PUPPETS.get('gk8-tangle', KEEPER_KIT, POSES.netTangle, kz, -1), D = KEEPER_S / kz;
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = KEEPER_HOLD_MUL * hk;
      ctx.translate(kp.x, kp.y);
      ctx.rotate(kp.rot);
      ctx.drawImage(navyMulOf(r.cv), -r.ox * D, -r.oy * D, r.cv.width * D, r.cv.height * D);
      ctx.restore();
    }
  } else PUPPETS.draw(ctx, 'gk8-fold', KEEPER_KIT, POSES.gkFold, kz, -1, kp.x, kp.y, KEEPER_S / kz, 1, undefined, 1, kp.rot);
  sideNetting(ctx, rig, t);
  drawGoalRig(ctx, 'front', rig, t);
  frameGlow(ctx, rig, t);
  frostGlow(ctx, rig, t);
  env.parts.draw(ctx, 1);
  // The showcase: through the impact the ball is drawn last (over the net, the spray and the cone), panels and ice core
  // readable at the tip of the dome.
  if (showcase) drawBall(env, spin, bx, by, 4, 2, 0.95, 1.25, 'cobalt', sq, { storm: true });
  // The proof's light: the painted line, the post feet and the frame are the hot subject of the hold.
  proofLight(ctx, rig, t);

  // Screen space: the tearing shroud, the net focus lines, the beams, the wave's gust band, GOAL!, the wipe.
  env.screen();
  const [bu, bv] = cam.toUV(bx, by);
  if (t < T.cut + 0.16) {
    // The shroud tears open from the ball outward over 0.16 s (a steady fall in brightness, no one-frame drop).
    const k = u01(t, T.cut, T.cut + 0.16);
    shroud(ctx, bu * VW, bv * VH, lerp(110, 640, ease.inOutQuad(k)), 0.72 * (1 - ease.inOutSine(k)), t);
    if (t < T.cut + 0.03) fx.fullFrame = true;
  }
  netFocus(ctx, env, t, bx, by);
  beams(ctx, env, keys([[T.stop, 0], [T.hold, 1], [T.wave, 1], [T.wide, 0.3]], t));
  if (t >= T.wave) gustBand(ctx, env, front, t);
  if (t >= G0) {
    // The glyphs ride in on the wave's front as a train: the rightmost leads and every glyph flies the same distance from
    // its own slot, so neighbours never overlap.
    glyphs.forEach((g, i) => gustTitle(ctx, g.c, g.cx, 132, GOAL_SIZE, t, glyphStart(i, glyphs.length), { fromX: g.cx - GLYPH_RUN, dur: glyphDur(i) }));
  }
  if (t >= T.wipe) {
    // The 8 -> 9 cut is a true wind wipe: shot 9's first frame (returnPlate) is revealed behind the streak train on a
    // ragged 6 px-row edge that trails the streaks' tails, and the streaks ride on top. At the wipe's end the whole
    // frame is the plate, so shot 9's t = 0 lands on the same picture.
    const p = u01(t, T.wipe, DUR);
    const lead = lerp(-260, VW + 260, ease.inOutQuad(clamp(p)));
    const edge = lead - 380 * (1 - ease.inQuad(clamp(p)));
    if (edge > -60) {
      ctx.save();
      ctx.beginPath();
      for (let y = 0; y < VH; y += 6) {
        const jag = (0.6 * (0.5 + 0.5 * Math.sin(y * 0.37)) + 0.4 * (((y * 7919) % 13) / 13)) * 60;
        const w = Math.round(edge - jag);
        if (w > 0) ctx.rect(0, y, w, 6);
      }
      ctx.clip();
      ctx.drawImage(returnPlate(env), 0, 0);
      ctx.restore();
    }
    windWipe(ctx, p);
  }

  // Post.
  galeStorm(fx);
  fx.vignette = 0.62;
  const sinceNet = t - T.net;
  if (sinceNet >= 0) {
    const p = u01(t, T.net, T.net + 0.5);
    if (p < 1) pushShock(fx, { x: bu, y: bv, r: 0.04 + 1.0 * ease.outQuad(p), s: 0.06 * (1 - p) });
    const q = u01(t, T.net + 0.06, T.net + 0.6);
    if (q > 0 && q < 1) pushShock(fx, { x: bu, y: bv, r: 0.04 + 0.7 * ease.outQuad(q), s: 0.03 * (1 - q) });
    fx.lens = 0.3 * (1 - ease.outQuad(u01(t, T.net, T.net + 0.4)));
    fx.lensX = bu;
    fx.lensY = bv;
    fx.lensR = 0.22;
    fx.ca = 0.012 * (1 - u01(t, T.net, T.net + 0.35));
    fx.bloom = lerp(1.25, 1.0, u01(t, T.net, T.net + 0.4));
  }
  if (showcase) fx.bloom = Math.min(fx.bloom, 1.1);
  // The proof hold: the line, the post feet and the frame bloom (the hold's hot pixels).
  const pk = keys(HOLD_K, t);
  if (pk > 0) {
    fx.bloom = lerp(fx.bloom, 1.4, pk);
    fx.bloomThresh = lerp(fx.bloomThresh, 0.62, pk);
  }
  // THE SLAM made visible: a horizontal smear along the skid (the goal mouth kept crisp) and a pressure ring off the
  // goal mouth (the 4th shock slot: net ring, net echo, the wall's ring, this).
  const [mu, mv] = cam.toUV(postX(257) + rig.slide, 257 - GH * 0.5);
  // (Only through the blow-back's last frames: once the camera settles at 0.56 the skid plays on a crisp, still frame.)
  if (t >= T.shove && t < 0.56) {
    fx.streak = 0.03 * (1 - u01(t, T.shove, 0.56));
    fx.streakDX = 1;
    fx.streakDY = 0;
    fx.streakHoleX = mu;
    fx.streakHoleY = mv;
    fx.streakHoleR = 0.2;
  }
  if (t >= T.shove && t < 0.78) {
    const p = u01(t, T.shove, 0.78);
    pushShock(fx, { x: mu, y: mv, r: lerp(0.05, 0.65, ease.outQuad(p)), s: 0.04 * (1 - p) });
  }
  // The blow-back's radial blur (from the corner, decaying as the zoom settles at 0.56).
  if (t < 0.56) {
    fx.radial = 0.14 * (1 - ease.outQuad(u01(t, T.cut, 0.56)));
    fx.radialX = bu;
    fx.radialY = bv;
  }
  // The frame's stop: a short ripple from the post feet.
  if (t >= T.stop && t < T.stop + 0.4) {
    const [fu, fv] = cam.toUV(postX(NEAR) + rig.slide, NEAR);
    const p = u01(t, T.stop, T.stop + 0.4);
    pushShock(fx, { x: fu, y: fv, r: 0.02 + 0.5 * p, s: 0.02 * (1 - p) });
  }
  // The stadium's pressure ring rolling across the turf with the wind wave.
  if (t >= T.wave && t < T.wave + 0.6) {
    const p = u01(t, T.wave, T.wave + 0.6);
    const [gu, gv] = cam.toUV(postX(257) + rig.slide, 280);
    pushShock(fx, { x: gu, y: gv, r: lerp(0.2, 1.6, p), s: 0.025 * (1 - p) });
  }
}

// ================================================================ the shot

let spin = new BallSpin();
const F = { hit: false, tear: false, cut: false, net: false, pegs: [false, false, false, false, false, false], land: false, stop: false };

function resetState() {
  spin = new BallSpin();
  spin.rotate(0.4, 1, 0.2, 0.9);
  F.hit = F.tear = F.cut = F.net = F.land = F.stop = false;
  F.pegs = [false, false, false, false, false, false];
}

/** 8a: the hammer's frozen burst (sparks and blades placed mid-flight, so the hit-stop shows the explosion). */
function burstA(env: Env) {
  const { rng, parts } = env;
  const [x, y] = BA;
  // Everything starts outside 1.35 ball radii (streak tails included: a streak trails v · 0.03 · k behind its head), so
  // the frozen burst never slashes across the crushed ball's panels in the hold.
  const rMin = BR_A * 2 * 1.35;
  for (let i = 0; i < 90; i++) {
    const a = axisSafe(rng.range(0, TAU)), sp = rng.range(500, 1500), k = rng.range(1.2, 2.6);
    const r = rMin + sp * 0.03 * k + rng.range(0, 190);
    parts.spawn({
      kind: PK.Streak, x: x + Math.cos(a) * r, y: y + Math.sin(a) * r, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 1.5,
      max: rng.range(0.5, 0.9), s0: rng.range(1.5, 3), s1: 1, k, ramp: 'dew', r0: 0, r1: 0.7, a0: 1, a1: 0, layer: 1,
    });
  }
  for (let i = 0; i < 60; i++) {
    const a = axisSafe(rng.range(0, TAU)), r = rng.range(rMin / 0.8 + 8, 320), sp = rng.range(300, 900);
    parts.spawn({
      kind: PK.Blade, x: x + Math.cos(a) * r, y: y + Math.sin(a) * r * 0.8, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 1.2,
      rot: rng.range(0, TAU), vrot: rng.range(-20, 20), max: rng.range(0.6, 1.0), s0: rng.range(4, 7), s1: 4, ramp: 'grass',
      r0: rng.next(), r1: rng.next(), a0: 1, a1: 1, add: false, layer: 1,
    });
  }
  for (let i = 0; i < 24; i++) {
    const a = rng.range(0, TAU), r = rng.range(Math.max(110, rMin + 40), 260);
    parts.spawn({
      kind: PK.Mist, x: x + Math.cos(a) * r, y: y + Math.sin(a) * r, vx: Math.cos(a) * 500, vy: Math.sin(a) * 500, drag: 2,
      max: rng.range(0.5, 0.8), s0: rng.range(14, 22), s1: rng.range(26, 40), k: 0.5, ramp: 'vapor', r0: 0, r1: 1, a0: 0.55, a1: 0, layer: 0,
    });
  }
}

/**
 * 8b: the net impact: the cone's vapour bursts out through the mesh, dew sprays off the pocket. Centred where the ball
 * sits once the dome has blown out (it rides the dome ~30 px right during the hit-stop), and placed mid-flight (as
 * hammer 2's burst), so the frozen spray reads as a ring round the pocketed ball and never clumps into a white flare
 * beside it: the ball's ice core stays the hottest point.
 */
function burstNet(env: Env, x: number, y: number) {
  const { rng, parts } = env;
  for (let i = 0; i < 30; i++) {
    const a = rng.range(-0.8, 0.8), sp = rng.range(200, 700);
    parts.spawn({
      kind: PK.Mist, x: x + rng.range(14, 34), y: y + rng.range(-14, 14), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, drag: 3.2,
      max: rng.range(0.4, 0.8), s0: rng.range(3, 5), s1: rng.range(7, 11), k: 0.9, ramp: 'vapor', r0: 0.1, r1: 1, a0: 0.25, a1: 0, layer: 0, wind: 0.4,
    });
  }
  for (let i = 0; i < 70; i++) {
    const a = rng.range(0, TAU), sp = rng.range(120, 520);
    const r = 14 + sp * 0.03 + rng.range(0, 26);
    parts.spawn({
      kind: PK.Streak, x: x + Math.cos(a) * r, y: y + Math.sin(a) * r, vx: Math.cos(a) * sp + 120, vy: Math.sin(a) * sp, ay: 300, drag: 1.6,
      max: rng.range(0.4, 0.9), s0: rng.range(1, 2), s1: 0.6, k: rng.range(0.8, 1.6), ramp: 'dew', r0: 0, r1: 0.8, a0: 1, a1: 0, layer: 1,
    });
  }
}

/** A peg popping out of the turf: dirt and dew. */
function pegPuff(env: Env, x: number, y: number) {
  const { rng, parts } = env;
  for (let i = 0; i < 5; i++)
    parts.spawn({
      kind: PK.Smoke, x: x + rng.range(-2, 2), y: y - 1, vx: rng.range(-20, 50), vy: rng.range(-60, -20), drag: 3, max: rng.range(0.5, 0.9),
      s0: rng.range(2, 4), s1: rng.range(6, 10), ramp: 'dust', r0: 0.3, r1: 1, a0: 0.35, a1: 0, add: false, layer: 1,
    });
  for (let i = 0; i < 6; i++)
    parts.spawn({
      kind: PK.Pixel, x, y: y - 2, vx: rng.range(-40, 80), vy: rng.range(-160, -60), ay: 500, drag: 1, max: rng.range(0.4, 0.7),
      s0: 1, s1: 1, ramp: i % 2 ? 'dew' : 'dust', r0: 0, r1: 0.6, a0: 1, a1: 0.5, add: i % 2 === 1, layer: 1,
    });
}

/** The skid: dust rolling off both post feet, clods and blades thrown, a low dew bow ahead of the frame. */
function skidSpray(env: Env, rig: GoalRig, speed: number) {
  const { rng, parts } = env;
  for (const z of [FAR, NEAR]) {
    const x = postX(z) + rig.slide;
    const n = speed * (z === NEAR ? 1.2 : 0.7);
    let k = n;
    while (k > 0) {
      if (rng.next() < k) {
        parts.spawn({
          kind: PK.Smoke, x: x + rng.range(-3, 3), y: z - rng.range(0, 3), vx: rng.range(40, 140), vy: rng.range(-50, -10), drag: 2.2,
          max: rng.range(0.6, 1.2), s0: rng.range(3, 6), s1: rng.range(16, 28), ramp: 'storm', r0: 0.1, r1: 0.9, a0: 0.5, a1: 0, add: false, layer: z === NEAR ? 1 : 0, wind: 0.4,
        });
        if (rng.next() < 0.5)
          parts.spawn({
            kind: PK.Pixel, x, y: z - 1, vx: rng.range(60, 220), vy: rng.range(-200, -60), ay: 900, drag: 0.6,
            max: rng.range(0.25, 0.45), s0: rng.range(1.5, 2.5), s1: 1.5, ramp: 'dust', r0: 0.4, r1: 1, a0: 1, a1: 0.6, add: false, layer: 1,
          });
        if (rng.next() < 0.6)
          parts.spawn({
            kind: PK.Blade, x, y: z - 2, vx: rng.range(40, 200), vy: rng.range(-220, -80), ay: 600, drag: 1.4, rot: rng.range(0, TAU), vrot: rng.range(-16, 16),
            max: rng.range(0.5, 0.9), s0: rng.range(3, 4), s1: 3, ramp: 'grass', r0: rng.next(), r1: rng.next(), a0: 1, a1: 1, add: false, layer: 1,
          });
      }
      k -= 1;
    }
    // Two clods per foot per frame, thrown up and forward off the ploughing post foot.
    for (let i = 0; i < 2; i++)
      parts.spawn({
        kind: PK.Pixel, x: x + rng.range(-1, 3), y: z - 2, vx: rng.range(80, 260), vy: rng.range(-240, -80), ay: 900, drag: 0.5,
        max: rng.range(0.35, 0.6), s0: 3, s1: 3, ramp: 'dust', r0: 0.5, r1: 1, a0: 1, a1: 1, add: false, layer: 1,
      });
  }
}

export const shotThunder: Shot = {
  name: META.name,
  dur: DUR,
  seed: META.seed,
  rate: RATE[8],
  muffle: MUFFLE[8],
  cues: [
    { at: 0, fn: (e) => { e.sfx.whoosh(0.1, 200, 3000); e.cam.shove(0, 6); e.cam.shakeAmp = 16; e.cam.trauma = 0.45; } },
    { at: T.hit, fn: (e) => { e.sfx.hammerBoom(1.5); e.sfx.kick(1.4); e.cam.shakeAmp = 24; e.cam.hit(1.0); e.cam.shove(18, 0); } },
    { at: T.tear, fn: (e) => { e.sfx.whoosh(0.3, 300, 5000, 0.6); e.sfx.kick(0.6); } },
    { at: T.cut, fn: (e) => { e.sfx.roar(1.6, 0.6); e.cam.shakeAmp = 20; e.cam.trauma = Math.max(e.cam.trauma, 0.8); e.cam.shove(-30, -12); } },
    { at: T.net, fn: (e) => { e.sfx.boom(1.1); e.sfx.kick(0.8); e.cam.hit(0.3); } },
    ...[0, 1, 2, 3, 4, 5].map((i) => ({ at: T.peg + i * 0.05, fn: (e: Env) => e.sfx.pegPop() })),
    { at: T.shove, fn: (e) => { e.sfx.metalGroan(0.8); e.sfx.scrape(0.5, 0.35); e.cam.shove(14, 0); } },
    { at: T.land, fn: (e) => { e.sfx.kick(0.3); e.sfx.whoosh(0.12, 900, 300, 0.15); } },
    { at: T.stop, fn: (e) => { e.sfx.kick(0.5); e.cam.hit(0.5); e.cam.shove(6, 2); } },
    ...[1.0, 1.2, 1.4, 1.6].map((at) => ({ at, fn: (e: Env) => e.sfx.scuff(0.15) })),
    { at: T.wave, fn: (e) => { e.sfx.boom(0.8, 0.9); e.sfx.gust(0.8, 0.45); e.sfx.crowd(3.0, 0.65); e.cam.shove(10, 0); } },
    { at: T.goal, fn: (e) => { e.sfx.stinger(); e.sfx.crashSwell(0.5, 0.25); } },
    ...[0, 1, 2, 3, 4].map((i) => ({ at: glyphLand(i) - 0.06, fn: (e: Env) => e.sfx.whoosh(0.08, 2400, 900, 0.2) })),
    { at: T.wipe, fn: (e) => e.sfx.whoosh(0.15, 800, 5000) },
  ],
  prepare(env) {
    warmGale();
    // Warm the keeper's two side-view poses at the zoom-matched puppet scales the shot uses.
    for (let k = 4; k <= 20; k++) {
      PUPPETS.get('gk8-fold', KEEPER_KIT, POSES.gkFold, k / 10, -1);
      PUPPETS.get('gk8-tangle', KEEPER_KIT, POSES.netTangle, k / 10, -1);
    }
    // KF4 and its derived sprites (the torso below the bust, the gloveless bust and the two gloves for the tear).
    const kf = keeperFront('KF4');
    if (kf) {
      bustBodyOf(kf.a.frames[kf.i].img);
      tearPartsOf(kf.a.frames[kf.i].img);
    }
    void env;
  },
  init(env) {
    env.sfx.clearBus();
    env.cam.set(VW / 2, VH / 2, 1, 0);
    PUPPETS.frame();
    resetState();
  },
  update(env, t, dt) {
    const { cam } = env;
    // The rumble before the hit; trauma held >= 0.4 through the hit-stop.
    if (t < T.hit) holdTrauma(cam, 0.45);
    else if (t < T.tear) holdTrauma(cam, 0.42);
    if (!F.hit && t >= T.hit) {
      F.hit = true;
      burstA(env);
    }
    if (!F.cut && t >= T.cut) {
      // The cut to the side world view: the particle space changes, start clean.
      F.cut = true;
      env.parts.clear();
      env.parts.wind = [260, -20];
    }
    if (t >= T.tear) spin.rotate(0.2, 1, 0.1, dt * (t < T.net ? 40 : 18));
    if (!F.cut) return;
    const rig = goalRigAt(t);
    if (!F.net && t >= T.net) {
      F.net = true;
      const [bx, by] = ballB(T.net + 0.08, goalRigAt(T.net + 0.08));
      burstNet(env, bx, by);
    }
    for (let i = 0; i < 6; i++) {
      if (F.pegs[i] || t < T.peg + i * 0.05) continue;
      F.pegs[i] = true;
      const z = lerp(FAR, NEAR, i / 5);
      pegPuff(env, postX(z) + GD + rig.slide * 0.8, z);
    }
    if (t >= T.shove && t < T.stop) {
      const sp = 1 - u01(t, T.shove, T.stop);
      skidSpray(env, rig, 4 * sp * sp + 0.5);
      holdTrauma(cam, 0.3 * sp + 0.12);
    }
    // The proof's hold: a low living rumble (trauma 0.12), no spikes.
    if (t >= T.stop && t < T.wave) holdTrauma(cam, 0.12);
    if (t < T.land) {
      const kp = keeperB(t, rig);
      env.parts.spawn({
        kind: PK.Mist, x: kp.x + env.rng.range(-4, 4), y: kp.y + env.rng.range(-6, 6), vx: env.rng.range(-60, 20), vy: env.rng.range(-20, 20), drag: 3,
        max: env.rng.range(0.3, 0.5), s0: 5, s1: env.rng.range(12, 16), k: 0.4, ramp: 'vapor', r0: 0.2, r1: 1, a0: 0.45, a1: 0, layer: 0,
      });
    }
    if (!F.land && t >= T.land) {
      F.land = true;
      const kp = keeperB(t, rig);
      pegPuff(env, kp.x, kp.y + 10);
    }
    if (!F.stop && t >= T.stop) {
      F.stop = true;
      // The lurch: soil and dust thrown forward off both feet.
      for (const z of [FAR, NEAR]) {
        const x = postX(z) + rig.slide;
        for (let i = 0; i < 8; i++)
          env.parts.spawn({
            kind: PK.Smoke, x: x + 2, y: z - 2, vx: env.rng.range(60, 180), vy: env.rng.range(-50, -10), drag: 2.5, max: env.rng.range(0.6, 1.0),
            s0: 3, s1: env.rng.range(10, 16), ramp: 'storm', r0: 0.1, r1: 0.9, a0: 0.55, a1: 0, add: false, layer: 1,
          });
      }
    }
    // The proof's hold: dew falling like snow through the floodlights, dust motes.
    if (t >= T.stop && t < T.wide) {
      const n = 2;
      for (let i = 0; i < n; i++) {
        const x = postX(NEAR) + rig.slide + env.rng.range(-170, 130), y = env.rng.range(150, 250);
        env.parts.spawn({
          kind: PK.Pixel, x, y, vx: env.rng.range(-6, 10), vy: env.rng.range(18, 40), max: env.rng.range(1.2, 2.2), s0: 1, s1: 1,
          ramp: 'dew', r0: 0.1, r1: 0.6, a0: 0.9, a1: 0.2, layer: 1,
        });
      }
    }
    // The stadium's wind wave: dew and mist streaming right along it.
    if (t >= T.wave) {
      const n = t < T.wave + 0.4 ? 5 : 2;
      for (let i = 0; i < n; i++) {
        const x = cam.x - 400 / cam.zoom + env.rng.range(-20, 80), y = cam.y + env.rng.range(-170, 170) / cam.zoom;
        env.parts.spawn({
          kind: PK.Streak, x, y, vx: env.rng.range(500, 900), vy: env.rng.range(-30, 20), max: env.rng.range(0.6, 1.0), s0: 1, s1: 1, k: 0.8,
          ramp: 'dew', r0: 0.1, r1: 0.7, a0: 0.7, a1: 0, layer: 1,
        });
      }
    }
    void dt;
  },
  render(env, t) {
    PUPPETS.frame();
    if (t < T.cut) renderA(env, t);
    else renderB(env, t);
  },
};
