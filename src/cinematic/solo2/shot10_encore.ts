// SPOTLIGHT SOLO v2 · shot 10 · "Encore" (1.6 s, g 16.4-18.0, seed 520): the owner's ending (SPEC.md §8 option B, §12).
//
// The stadium is blazing again and the keeper is still sitting on his own goal line. No.10 has strolled up to him with
// the ball under his sole: he rolls it back in front of the keeper's boots (the drag-back), sets, and taps it past him
// with the inside of his boot. The camera whips after the ball along the turf; it rolls past the keeper's boots, over
// the glowing goal line, and bellies the net, which lights up lilac from the dent outward while a drop beam slams onto
// the goal. On the same beat No.10 throws his arms open to the crowd (the ta-da); the camera kicks back to the whole
// picture and GOAL is stamped letter by letter by four drop beams, a drum fill into the ONE of bar 11, where the
// picture freezes on the poster frame under the name card, then fades into the 'goal' result.
//
// Stage (a side view, camera south-west of the goal looking north, eye 0.7 m; goal to the RIGHT, he faces east, the
// DragBack strip unmirrored): a pinhole projector over world metres (X east from the goal line, Y up, Z depth from the
// lens), f 1500, horizon y 213 (stage px at zoom 1). No.10's planted far toe is pinned at (X -2.24, Z 9.0): there one
// DragBack pixel is 0.018 m, so he draws at exactly SC 3 (294 px at zoom 1) and the ball (r 6 px in the strip) at r 18.
// The keeper sits on his line at (X -0.1, Z 9.9) (the KEEPER_KIT sitBack puppet facing west, rendered at a third of his
// scale and drawn x3 so his pixels match the sprites'). The goal: near post at Z 7.6, far post at Z 14.92, crossbar
// 2.44 m, the net's roof to (X 0.8, Y 2.25) and its back to (X 2.0, Y 0); the ball rolls east at Z 9.0, 1.4 m inside
// the near post and 0.9 m in front of the keeper's boots. The camera stays west of the goal (it looks INTO the goal
// mouth from the front-left): a 3D truck (Xc: parallax between the figures, the posts and the stands) under a 2D pan /
// zoom (cam.x, cam.y, cam.zoom). The relit stadium: a defocused far stand (the stadium crowd strip, smooth-scaled, a
// plum veil), lilac LED boards chasing on the 8ths, phone lights, flash pops, two floodlight banks blazing at the top
// corners with god rays; a floodlit pitch with mowing bands and lines in perspective. Over the lit turf every violet
// light is laid in normal blend (additive violet on green reads cyan) with only the white-hot cores additive.
//
// Beats (shot-local; global in brackets; 150 BPM: beat 2 of bar 10 = 0.00, beat 3 = 0.40, beat 4 = 0.80, ONE = 1.20):
//   0.00 (g 16.4, beat 2)  HARD CUT on the crowd's fourth stomp (its stomps run from shot 9's crowdStomp(4)): DB1, his
//        sole on the ball's crown a long step ahead, in his follow-spot's beam and pool; the keeper (a glove still over
//        his eyes) on his line between the posts; the banks pump. Punch +0.06, cam.hit(0.45), a flat shock through the
//        turf; stomp + kickDrum + boom + crash; dust shaken off the turf; confetti falling all through the shot.
//   0.00-0.30  slow push 0.92 -> 0.97. 0.15 (32nd) DB2, THE DRAG: the sole pulls the ball back across in front of the
//        keeper's boots (scuff + tom); the keeper lowers his glove and stares at it.
//   0.30 (16th)  DB3, THE SET: the boot drops behind the ball, end-on; CRASH ZOOM 0.97 -> 1.42 onto the ball and the
//        boot (inExpo, 0.10 s; the ball 51 px); rim + tom.
//   0.40 (g 16.8, beat 3)  THE TAP (DB4): the inside of the boot pushes it: hit-stop 0.05 s, punch +0.08, cam.hit(0.4),
//        a light splash and a flat shock at the contact, uv sparks and grass blades, light rain round the ball, the
//        beat echo, the ball ignites (blaze 1.0); snare + kick + kickDrum + rim + whoosh; the crowd inhales (gasp, duck).
//   0.44-0.66  THE WHIP-PAN after the ball (2D pan 500 px + a 0.35 m truck, inOutCubic, zoom 1.42 -> 1.15) with streak
//        0.07 along x and a sharp hole on the ball: it rolls past the keeper's boots (he flinches, glove up) with a
//        strobe chain of crisp violet exposures behind it and a groove of violet light in the turf; the near post
//        whips past; a 32nd snare roll. ~0.6: the ball crosses the goal line, which flashes lilac where it crosses.
//   0.667 -> 0.70 (g 17.1)  THE NET: the ball bellies the net (2 frames), and on 0.70 the goal stack:
//        1 hit-stop rate 0.04 for 0.08 s (the net held at full bulge); 2 beam impact A (0.700-0.733) + B (0.733-0.750)
//        in a cone from the roof onto the goal (threshold 0.72: in a lit stadium only the hottest shapes print white);
//        3 punch +0.16, cam.hit(0.9), shakeAmp 18, a shove; 4 a drop beam slams onto the goal mouth + a light splash in
//        the net; 5 two flat shocks (0.05 / 0.03, sy 0.35); 6 light rain over the goal; 7 CA 0.012, radial 0.10;
//        8 the net lights up from the dent outward (uv -> volt -> lilac, ivory cores), god rays from the ball through
//        the mesh, a cross-star flare; 9 glass glints, uv streaks and motes burst out of the net, the crowd's flash pops
//        go wild, a confetti burst at the lens; 10 the strobe chain steps out on the 16ths; 11 the posts shiver, the
//        beat echo; 12 bloom up; the four HUD pads flare. DB4b: his arms fly open to the crowd on the same beat.
//        boom 1.3 + crack + kickDrum 1.2 + crash 1.2 + lampSlam 0.8 + shatter + roar + crowd.
//   0.78-1.10  THE KICK-BACK: the camera pulls out (zoom 1.17 -> 0.70, outExpo) and trucks back west 0.95 m: No.10 in
//        the ta-da on the left in his pool (a cross glint in his eye at 0.80), the keeper slumped on his line between
//        the posts (head down from 0.88), the net glowing violet under its beam with the ball in it, the groove of light
//        from his boot into the goal.
//   0.80 / 0.90 / 1.00 / 1.10 (beat 4 and its 16ths)  G / O / A / L, each stamped by its own drop beam (lampTitle2,
//        130 px): a drum fill into the ONE; kick + lampSlam + a falling tom per letter, the banks and his beam pump.
//        DB4c (the settle) at 0.95.
//   1.20 (g 17.6, the ONE of bar 11)  the cymbal + the stomp + stinger: FREEZE (rate 0) on the poster frame (hero 200 px,
//        GOAL, the keeper beaten, the lit net); the name card slams in. 1.42-1.60 fade to [8,4,14] into the 'goal' result.
//
// Where this differs from the brief (and why): §12 leaves the inner timings open; the art plan put the net at 0.80, here
// it bellies at 0.70 so the four GOAL stamps can sit on the four 16ths of beat 4 as a fill into the ONE. The net hit adds
// a beam impact A + B (g 17.10 / 17.133) that §4.4 does not list: with the fade (17.93) the worst 1 s window holds 3
// events (the FlashBudget limit), and a frame-by-frame run clamps none. The shot sets its own rate (the two hit-stops +
// the freeze) instead of RATE[10]. The roar stays at 1.8 (the curtain drop keeps the film's loudest roar, 2.0). No
// Chorus copies here: the Chorus is additive volt and over a lit red shirt it reads pink; SOLO's beat echo, the strobe
// chain and the drop beams carry the identity in the relit stadium.

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { clamp, ease, lerp, type RGB } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import type { BallSquash } from '../../engine/pixel';
import {
  FADE, HEX, KEEPER_KIT, echoAt, PAL, POSES, P, PUPPETS, SHOTS, SHOT_NAME, TOMS, crossGlint, drawBall, drawSolo, flatShockAt, fourCount, keys,
  lampTitle2, lightRain, mixPose, nameCard, onFrames, padsFor, punch, rimLight, soloAt, soloBlaze, soloImpact2, soloPic, soloPoint,
  soloTopLeft, spinAt, stage, warmBalls, warmSolo, warmSolo2, warp, type KeyRow, type SoloSeq,
} from './common';
import { ballExposure, stepFade } from './chorus';

const META = SHOTS[9];
const FR = 1 / 60;
/** The shot's global start (g 16.4). */
const G0 = 16.4;

// ---------------------------------------------------------------- beats (shot-local)

const T_DRAG = 0.15, T_SET = 0.3, T_TAP = 0.4, T_GO = 0.45, T_HIT = 0.7 - 2 * FR, T_NET = 0.7, T_TADA = 0.7, T_SETTLE = 0.95;
const T_FREEZE = 1.2, T_FADE = 1.42;
const STAMPS = [0.8, 0.9, 1.0, 1.1] as const;

/** The shot's own rate: the tap's hit-stop, the net's hit-stop, and the freeze on the ONE of bar 11. */
const rate10 = (t: number) => (t >= T_FREEZE - 1e-6 ? 0 : warp(t, [[T_TAP, 0.05, 0.05], [T_NET, 0.08, 0.04]]));

// ---------------------------------------------------------------- the stage: a pinhole projector over world metres

/** Focal length (stage px), eye height (m), horizon (stage y at zoom 1), metres per DragBack pixel. */
const F = 1500, EYE = 0.7, HY = 213, MPX = 0.018;
/** No.10: depth, sprite scale (F·MPX / ZH = 3), planted far toe X. */
const ZH = 9.0, SC = 3, XH = -2.24;
/** The keeper: hip X, depth, puppet scale (px per puppet unit at his depth). */
const XK = -0.1, ZK = 9.9, KK = (F * MPX) / ZK;
/** The goal: near / far post depth, crossbar height, post width, the net's roof corner and back foot. */
const ZN = 7.6, ZF = ZN + 7.32, BAR = 2.44, PW = 0.12, ROOF_X = 0.8, ROOF_Y = 2.25, BACK_X = 2.0;
/** The ball: world radius, depth, and where it stops against the net. */
const BR = 6 * MPX, ZB = ZH, X_NET = BACK_X - 0.06 - BR - (BR * 1.2 * 1) / 2.25;
/** The far stand (for parallax) and the floodlight banks above it (world X, parallax depth). */
const Z_STAND = 60, BANKS = [-14, 12] as const, Z_BANK = 70;

/** World (X, Y, Z) -> stage px at truck xc. */
function P3(X: number, Y: number, Z: number, xc: number): [number, number] {
  return [320 + (F * (X - xc)) / Z, HY + (F * (EYE - Y)) / Z];
}
/** Stage px per metre at depth Z. */
const PPM = (Z: number) => F / Z;
/** The action plane's reference x (particles live at xc = 0 and are shifted by planeShift when drawn). */
const planeX = (X: number) => 320 + (F * X) / ZH;
const planeShift = (xc: number) => (-F * xc) / ZH;

// ---------------------------------------------------------------- the camera: a 3D truck under a 2D zoom / reframe

const XC: KeyRow[] = [
  [0, -1.58], [T_SET, -1.52, 'inOutSine'], [0.44, -1.5, 'linear'], [0.66, -1.15, 'inOutCubic'], [0.78, -1.13, 'linear'], [1.1, -2.08, 'outExpo'],
  [T_FREEZE, -2.1, 'linear'],
];
const CX: KeyRow[] = [
  [0, 380], [T_SET, 360, 'inOutSine'], [T_TAP, 272, 'inExpo'], [0.44, 272, 'linear'], [0.66, 760, 'inOutCubic'], [0.78, 768, 'linear'],
  [1.1, 650, 'outExpo'], [T_FREEZE, 650, 'linear'],
];
const CY: KeyRow[] = [
  [0, 198], [T_SET, 204, 'inOutSine'], [T_TAP, 284, 'inExpo'], [0.44, 284, 'linear'], [0.66, 258, 'inOutCubic'], [0.78, 260, 'linear'],
  [1.1, 214, 'outExpo'], [T_FREEZE, 214, 'linear'],
];
const ZM: KeyRow[] = [
  [0, 0.92], [T_SET, 0.97, 'inOutSine'], [T_TAP, 1.42, 'inExpo'], [0.44, 1.42, 'linear'], [0.66, 1.15, 'inOutCubic'], [0.78, 1.17, 'linear'],
  [1.1, 0.7, 'outExpo'], [T_FREEZE, 0.68, 'linear'],
];
interface View {
  xc: number;
  cx: number;
  cy: number;
  z: number;
}
function view(tw: number): View {
  const z =
    keys(ZM, tw) + punch(tw, 0, 0.06, 0, 0.14) + punch(tw, T_DRAG, 0.012, 0.01, 0.08) + punch(tw, T_TAP, 0.08, 0, 0.16) + punch(tw, T_NET, 0.16, 0, 0.3) +
    STAMPS.reduce((a, s) => a + punch(tw, s, 0.018, 0, 0.08), 0);
  return { xc: keys(XC, tw), cx: keys(CX, tw), cy: keys(CY, tw), z };
}
/** The visible stage rectangle at a view. */
const visible = (v: View) => ({ x0: v.cx - VW / 2 / v.z, x1: v.cx + VW / 2 / v.z, y0: v.cy - VH / 2 / v.z, y1: v.cy + VH / 2 / v.z });
/** Stage -> screen at a view (no shake). */
const toScr = (v: View, x: number, y: number): [number, number] => [VW / 2 + (x - v.cx) * v.z, VH / 2 + (y - v.cy) * v.z];

// ---------------------------------------------------------------- No.10: the DragBack schedule (pinned on the far toe)

const SEQ10: SoloSeq = [[0, 'DB1'], [T_DRAG, 'DB2'], [T_SET, 'DB3'], [T_TAP, 'DB4'], [T_TADA, 'DB4b'], [T_SETTLE, 'DB4c']];

// ---------------------------------------------------------------- the ball: under the sole, the drag, the roll, the net

const X_DB1 = XH + 30 * MPX, X_DB2 = XH + 16 * MPX, X_DB4 = XH + 34 * MPX;
const ROLL = (u: number) => 1 - Math.pow(1 - u, 1.25);
/** The ball's world X at (world) time tw. */
function ballX(tw: number): number {
  if (tw < T_DRAG - 2 * FR) return X_DB1 - 0.02 * Math.sin(tw * 9);
  if (tw < T_DRAG + 2 * FR) return lerp(X_DB1 - 0.02 * Math.sin((T_DRAG - 2 * FR) * 9), X_DB2, ease.outQuad((tw - (T_DRAG - 2 * FR)) / (4 * FR)));
  if (tw < T_TAP) return X_DB2;
  if (tw < T_GO) return X_DB4 - 0.04 + 0.04 * ((tw - T_TAP) / (T_GO - T_TAP));
  if (tw < T_HIT) return lerp(X_DB4, X_NET, ROLL((tw - T_GO) / (T_HIT - T_GO)));
  return X_NET + 0.32 * bulgeA(tw);
}
/** The roll angle (panels turn with the distance; the sole spins it a little under the drag). */
const ballAng = (tw: number) => ballX(tw) / BR + (tw < T_TAP ? tw * 1.5 : 0.6);
/** When the ball crosses the goal line (solved once). */
const T_LINE = (() => {
  for (let i = 0; i < 400; i++) {
    const t = T_GO + (i / 400) * (T_HIT - T_GO);
    if (ballX(t) >= 0) return Math.round(t * 60) / 60;
  }
  return 0.55;
})();
/** The strobe chain: one crisp exposure every 2 frames of the roll. */
const EXPO = Array.from({ length: 7 }, (_, i) => T_GO + (i * 2) / 60);

// ---------------------------------------------------------------- the net: an analytic bulge and its light

/** The bulge amplitude: 0 until the ball meets the net, full on the impact frame, held through the hit-stop, then a damped spring to a rest dent. */
function bulgeA(tw: number): number {
  if (tw < T_HIT) return 0;
  if (tw < T_NET) return ease.outQuad((tw - T_HIT) / (T_NET - T_HIT));
  if (tw < T_NET + 0.08) return 1 + (0.04 * (tw - T_NET)) / 0.08;
  const u = tw - (T_NET + 0.08);
  return 0.3 + 0.74 * Math.exp(-u / 0.22) * Math.cos(2 * Math.PI * 2.4 * u);
}
const DENT = { Y: 0.42, Z: ZB, sy: 0.62, sz: 0.8, amt: 0.5 };
/** A net point displaced by the bulge (outward, along +X, more toward the back of the net). */
function netPt(X: number, Y: number, Z: number, tw: number): [number, number, number] {
  const a = bulgeA(tw);
  if (a <= 0) return [X, Y, Z];
  const g = Math.exp(-((Z - DENT.Z) ** 2) / (2 * DENT.sz ** 2) - ((Y - DENT.Y) ** 2) / (2 * DENT.sy ** 2));
  return [X + DENT.amt * a * g * clamp(X / BACK_X), Y, Z];
}
/** The net's light (0..1) at a world point: a front racing out of the dent from the impact, then a held glow. */
function netLight(Y: number, Z: number, tw: number): number {
  if (tw < T_HIT) return 0;
  const age = tw - T_HIT;
  const d = Math.hypot((Z - DENT.Z) * 0.8, Y - DENT.Y);
  const r = 0.6 + 11 * Math.max(0, age - 0.02);
  if (d > r) return 0;
  const front = clamp(1 - (r - d) / 0.9);
  const core = clamp(1 - d / (r + 1.2));
  const fade = 0.42 + 0.58 * Math.exp(-age / 0.25);
  return clamp(0.18 + 0.7 * Math.max(core * core * fade, front * 0.85));
}

// ---------------------------------------------------------------- the keeper (KEEPER_KIT puppet, facing west, sat on his line)

const D = Math.PI / 180;
/** The keeper puppet is rendered at a third of his scale and drawn x3, so his pixels match the studio sprites' (SC 3). */
const KP = Math.round((KK / 3) * 100) / 100;
const K_SIT = POSES.sitBack;
const K_SHIELD = P({ ...POSES.sitBack, torso: -28 * D, head: 24 * D, thighN: 92 * D, kneeN: 70 * D, thighF: 84 * D, kneeF: 80 * D, armN: 118 * D, elbowN: 100 * D, armF: -58 * D, elbowF: 12 * D });
const K_SLUMP = P({ ...POSES.sitBack, torso: 6 * D, head: -28 * D, thighN: 78 * D, kneeN: 58 * D, thighF: 72 * D, kneeF: 70 * D, armN: 34 * D, elbowN: 44 * D, armF: -14 * D, elbowF: 26 * D });
const K_MID = mixPose(K_SHIELD, K_SLUMP, 0.5);
function keeperPose(tw: number): [string, typeof K_SIT] {
  if (tw < T_DRAG) return ['k10shield', K_SHIELD];
  if (tw < T_GO + 0.04) return ['k10sit', K_SIT];
  if (tw < 0.84) return ['k10shield', K_SHIELD];
  if (tw < 0.9) return ['k10mid', K_MID];
  return ['k10slump', K_SLUMP];
}

// ---------------------------------------------------------------- tiny helpers

const h01 = (i: number, s: number) => {
  const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${clamp(a)})`;
const decay = (t: number, at: number, len: number) => (t < at ? 0 : clamp(1 - (t - at) / len));
/** Fill a world-space quad (four corners already in stage px). */
function quad(ctx: CanvasRenderingContext2D, pts: readonly [number, number][]) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fill();
}

// ---------------------------------------------------------------- the set: the far stand, the banks, the turf, the lines

/** The far stand: a defocused crowd (the stadium's crowd strip upscaled smooth), lilac LED boards, phone lights, flash pops. */
function drawStand(env: Env, v: View, tw: number, t: number) {
  const ctx = env.ctx;
  const st = env.art.stadium;
  const vis = visible(v);
  const shift = (-F * v.xc) / Z_STAND;
  // A stomp drops the stands 3 px for 2 frames (the 4th stomp on the cut, and the one on the ONE).
  const jump = onFrames(tw, 0, 2) || onFrames(t, T_FREEZE, 2) ? 3 : 0;
  ctx.fillStyle = '#06040c';
  ctx.fillRect(vis.x0 - 10, vis.y0 - 10, vis.x1 - vis.x0 + 20, HY + 40 - vis.y0);
  const CS = 2.6;
  const boardTop = HY - 10;
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  const w = st.crowd.width * CS;
  let x = 320 - w / 2 + shift;
  x = ((((x - vis.x0) % w) + w) % w) + vis.x0 - w;
  for (; x < vis.x1; x += w) ctx.drawImage(st.crowd, 0, 0, st.crowd.width, 98, x, boardTop - 98 * CS + jump, w, 98 * CS);
  ctx.restore();
  // The crowd sits back behind the action: a plum veil (deeper low down, under the boards' glare line) and a faint
  // lilac haze of the floodlights high up.
  ctx.save();
  const g = ctx.createLinearGradient(0, boardTop - 280, 0, boardTop);
  g.addColorStop(0, 'rgba(22,10,38,0.25)');
  g.addColorStop(1, 'rgba(22,10,38,0.5)');
  ctx.fillStyle = g;
  ctx.fillRect(vis.x0 - 10, boardTop - 300, vis.x1 - vis.x0 + 20, 300);
  ctx.globalCompositeOperation = 'lighter';
  const h = ctx.createLinearGradient(0, boardTop - 300, 0, boardTop - 120);
  h.addColorStop(0, 'rgba(120,100,180,0.18)');
  h.addColorStop(1, 'rgba(120,100,180,0)');
  ctx.fillStyle = h;
  ctx.fillRect(vis.x0 - 10, boardTop - 300, vis.x1 - vis.x0 + 20, 180);
  ctx.restore();
  // The LED boards: plum with lilac / ivory panels (SOLO's colours), chasing on the beat.
  ctx.fillStyle = '#0b0614';
  ctx.fillRect(vis.x0 - 10, boardTop, vis.x1 - vis.x0 + 20, 32);
  const beat = Math.floor((G0 + tw - 1.6) / 0.2);
  for (let i = Math.floor((vis.x0 - shift) / 96) - 1; i <= Math.ceil((vis.x1 - shift) / 96) + 1; i++) {
    const bx = i * 96 + shift;
    const lit = (i + beat) % 3 === 0;
    ctx.fillStyle = lit ? '#F6F0DF' : i % 2 ? '#7A4DFF' : '#C9B6FF';
    ctx.fillRect(Math.round(bx + 6), boardTop + 8, 78, 14);
    ctx.fillStyle = '#0b0614';
    for (let k = 0; k < 7; k++) ctx.fillRect(Math.round(bx + 12 + k * 10), boardTop + 11, 5, 8);
  }
  ctx.fillStyle = 'rgba(201,182,255,0.35)';
  ctx.fillRect(vis.x0 - 10, boardTop, vis.x1 - vis.x0 + 20, 1);
  // Phone lights waving (a 1 px sway on the beat) and the crowd's camera flashes (local pops; wild after the goal).
  const fr = env.frng(41);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const span = 1500;
  const sway = Math.round(Math.sin((G0 + tw) * Math.PI * 2.5)) ;
  for (let i = 0; i < 150; i++) {
    const px = ((((h01(i, 3) * span + shift * 1.0) % span) + span) % span) - 430;
    const py = boardTop - 12 - h01(i, 4) * 250 + jump;
    const tw2 = 0.7 + 0.3 * fr.next();
    const c: RGB = h01(i, 6) < 0.6 ? PAL.lilac : h01(i, 6) < 0.85 ? PAL.ivory : PAL.uv;
    drawGlow(ctx, glowOf(c), px + sway, py, 3 + 3 * h01(i, 5), 0.32 * tw2);
    ctx.globalAlpha = 0.85 * tw2;
    ctx.fillStyle = '#FFFAEC';
    ctx.fillRect(Math.round(px + sway), Math.round(py), 1, 1);
    ctx.globalAlpha = 1;
  }
  const slot = Math.floor(tw * 30);
  const wild = tw >= T_NET ? 1 : 0;
  for (let s = slot - 3; s <= slot; s++) {
    for (let k = 0; k < 1 + 2 * wild; k++) {
      if (h01(s * 7 + k, 51) > 0.38 + 0.4 * wild) continue;
      const age = (tw - s / 30) / 0.1;
      if (age < 0 || age > 1) continue;
      const fx = vis.x0 + h01(s * 7 + k, 52) * (vis.x1 - vis.x0);
      const fy = boardTop - 20 - h01(s * 7 + k, 53) * 230;
      drawGlow(ctx, glowOf([255, 255, 255]), fx, fy, 9, 0.9 * (1 - age));
    }
  }
  ctx.restore();
}

/** The floodlight banks blazing just above the frame's top corners (screen space): lamp cells, glare, flares, god rays. */
function drawBanks(env: Env, v: View, tw: number, t: number) {
  const ctx = env.ctx;
  const pump = STAMPS.some((s) => tw >= s && tw < s + 0.1) || (tw >= T_NET && tw < T_NET + 0.12) || onFrames(tw, 0, 4) ? 1.15 : 1;
  for (let b = 0; b < BANKS.length; b++) {
    const sxStage = 320 + (F * (BANKS[b] - v.xc)) / Z_BANK;
    const sx = VW / 2 + (sxStage - v.cx) * Math.max(0.85, v.z);
    const sy = -22;
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#120c20';
    ctx.fillRect(Math.round(sx - 66), sy - 40, 132, 66);
    ctx.globalCompositeOperation = 'lighter';
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 6; c++) {
        ctx.fillStyle = (r + c) % 3 === 0 ? '#FFFAEC' : '#F6F0DF';
        ctx.fillRect(Math.round(sx - 60 + c * 20), sy - 36 + r * 15, 16, 11);
      }
    drawGlow(ctx, glowOf([200, 190, 255]), sx, sy, 260, 0.32 * pump);
    drawGlow(ctx, glowOf(PAL.ivory), sx, sy, 150, 0.6 * pump);
    drawGlow(ctx, glowOf(PAL.spot), sx, sy + 4, 70, 0.95 * pump);
    stage.godRays(ctx, sx, sy, 9, 260, 520, 46, 0.22 * pump, Math.PI / 2 + (b ? -0.32 : 0.32), 31 + b, 1.1, G0 + t);
    ctx.restore();
    starFlare(ctx, sx, sy + 6, 110, 0.5 * pump);
    ctx.globalCompositeOperation = 'source-over';
  }
}

/** The floodlit turf: mowing bands converging to the vanishing point, darker toward the far touchline. Row by row. */
function drawTurf(ctx: CanvasRenderingContext2D, v: View) {
  const vis = visible(v);
  const yTop = HY + 22;
  const STRIPE = 5.5;
  for (let y = Math.max(yTop, Math.floor(vis.y0)); y < vis.y1 + 2; y++) {
    const Z = (F * EYE) / (y + 0.5 - HY);
    const far = clamp((Z - 8) / 38);
    const X0 = v.xc + ((vis.x0 - 320) * Z) / F, X1 = v.xc + ((vis.x1 - 320) * Z) / F;
    for (let k = Math.floor(X0 / STRIPE); k <= Math.floor(X1 / STRIPE); k++) {
      const xa = Math.max(vis.x0 - 2, 320 + (F * (k * STRIPE - v.xc)) / Z);
      const xb = Math.min(vis.x1 + 2, 320 + (F * ((k + 1) * STRIPE - v.xc)) / Z);
      const even = (k & 1) === 0;
      const base: RGB = even ? [50, 142, 62] : [42, 126, 54];
      const m = lerp(1.06, 0.68, far);
      ctx.fillStyle = `rgb(${Math.round(base[0] * m)},${Math.round(base[1] * m)},${Math.round(base[2] * m)})`;
      ctx.fillRect(Math.floor(xa), y, Math.ceil(xb - xa) + 1, 1);
    }
  }
  // The strip between the far touchline and the boards (unmown, in the boards' shade).
  ctx.fillStyle = '#16351c';
  const yb = HY + (F * EYE) / 45.4;
  ctx.fillRect(vis.x0 - 4, yTop, vis.x1 - vis.x0 + 8, Math.max(0, yb - yTop));
}

/** The pitch lines (white, a fluorescent lilac edge): the goal line, the six-yard box, the penalty box, the far touchline. */
function drawLines(ctx: CanvasRenderingContext2D, v: View) {
  const xc = v.xc;
  const W = 0.12;
  const alongZ = (X: number, Z1: number, Z2: number) => {
    const a = Math.max(1.2, Z1), b = Math.min(45.3, Z2);
    if (b <= a) return;
    quad(ctx, [P3(X - W / 2, 0, a, xc), P3(X + W / 2, 0, a, xc), P3(X + W / 2, 0, b, xc), P3(X - W / 2, 0, b, xc)]);
  };
  const alongX = (Z: number, X1: number, X2: number) => {
    if (Z < 1.2) return;
    quad(ctx, [P3(X1, 0, Z - W / 2, xc), P3(X2, 0, Z - W / 2, xc), P3(X2, 0, Z + W / 2, xc), P3(X1, 0, Z + W / 2, xc)]);
  };
  const ZG = (ZN + ZF) / 2;
  ctx.fillStyle = 'rgba(236,236,250,0.88)';
  alongZ(0, 0, 45.3);
  alongZ(-5.5, ZG - 9.16, ZG + 9.16);
  alongX(ZG + 9.16, -5.5, 0);
  alongZ(-16.5, ZG - 20.16, ZG + 20.16);
  alongX(ZG + 20.16, -16.5, 0);
  alongX(45.3, -60, 0);
}

// ---------------------------------------------------------------- the goal: posts, crossbar, net mesh

const NU = 34, NV = 13;
/** A point on the back + roof panel: u along Z (near -> far post), v from the crossbar (0) over the roof to the back foot (1). */
function backPanel(u: number, vv: number): [number, number, number] {
  const Z = lerp(ZN, ZF, u);
  if (vv <= 0.22) {
    const k = vv / 0.22;
    return [lerp(PW / 2, ROOF_X, k), lerp(BAR, ROOF_Y, k), Z];
  }
  const k = (vv - 0.22) / 0.78;
  return [lerp(ROOF_X, BACK_X, k), lerp(ROOF_Y, 0, k), Z];
}
/** The side panel's back boundary X at height Y (the back slope; the roof above ROOF_Y). */
const sideBackX = (Y: number) => (Y <= ROOF_Y ? lerp(BACK_X, ROOF_X, Y / ROOF_Y) : lerp(ROOF_X, PW / 2, (Y - ROOF_Y) / (BAR - ROOF_Y)));

/** The strand colour by light level (bucket 0 = the plain white net; 1-4 lilac -> volt -> ivory, additive). */
const NET_COL = ['rgba(232,234,250,0.42)', 'rgba(122,77,255,0.85)', 'rgba(150,104,255,0.92)', 'rgba(201,182,255,0.9)', 'rgba(255,250,236,0.7)'];
const bucket = (l: number) => (l <= 0.02 ? 0 : 1 + Math.min(3, Math.floor(l * 4)));

interface Seg {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  l: number;
}
/** Build the net's strand segments for this frame (stage px + light). */
function netSegs(xc: number, tw: number): { back: Seg[]; near: Seg[]; far: Seg[] } {
  const back: Seg[] = [], near: Seg[] = [], far: Seg[] = [];
  const S = (X: number, Y: number, Z: number) => {
    const [x, y, z] = netPt(X, Y, Z, tw);
    return P3(x, y, z, xc);
  };
  // Back + roof panel grid.
  const grid: [number, number, number][][] = [];
  for (let j = 0; j <= NV; j++) {
    const row: [number, number, number][] = [];
    for (let i = 0; i <= NU; i++) {
      const [X, Y, Z] = backPanel(i / NU, j / NV);
      const [sx, sy] = S(X, Y, Z);
      row.push([sx, sy, netLight(Y, Z, tw)]);
    }
    grid.push(row);
  }
  for (let j = 0; j <= NV; j++)
    for (let i = 0; i <= NU; i++) {
      const p = grid[j][i];
      if (i < NU) {
        const q = grid[j][i + 1];
        back.push({ ax: p[0], ay: p[1], bx: q[0], by: q[1], l: (p[2] + q[2]) / 2 });
      }
      if (j < NV) {
        const q = grid[j + 1][i];
        back.push({ ax: p[0], ay: p[1], bx: q[0], by: q[1], l: (p[2] + q[2]) / 2 });
      }
    }
  // Side panels (near at ZN, far at ZF): vertical strands every 0.18 m, horizontal every 0.19 m.
  for (const [Z, out] of [[ZN, near], [ZF, far]] as const) {
    for (let X = PW / 2 + 0.18; X < BACK_X - 0.02; X += 0.18) {
      const top = X <= ROOF_X ? lerp(BAR, ROOF_Y, (X - PW / 2) / (ROOF_X - PW / 2)) : ROOF_Y * (1 - (X - ROOF_X) / (BACK_X - ROOF_X));
      const n = Math.max(1, Math.ceil(top / 0.38));
      for (let k = 0; k < n; k++) {
        const y0 = (top * k) / n, y1 = (top * (k + 1)) / n;
        const [ax, ay] = S(X, y0, Z), [bx, by] = S(X, y1, Z);
        out.push({ ax, ay, bx, by, l: netLight((y0 + y1) / 2, Z, tw) });
      }
    }
    for (let Y = 0.19; Y < BAR - 0.02; Y += 0.19) {
      const xb = sideBackX(Y);
      const n = Math.max(1, Math.ceil((xb - PW / 2) / 0.36));
      for (let k = 0; k < n; k++) {
        const x0 = lerp(PW / 2, xb, k / n), x1 = lerp(PW / 2, xb, (k + 1) / n);
        const [ax, ay] = S(x0, Y, Z), [bx, by] = S(x1, Y, Z);
        out.push({ ax, ay, bx, by, l: netLight(Y, Z, tw) });
      }
    }
  }
  return { back, near, far };
}
function drawSegs(ctx: CanvasRenderingContext2D, segs: Seg[], width: number, litOnly = false, baseA = 1) {
  ctx.save();
  ctx.lineCap = 'butt';
  for (let b = litOnly ? 1 : 0; b < NET_COL.length; b++) {
    ctx.globalCompositeOperation = b === NET_COL.length - 1 ? 'lighter' : 'source-over';
    ctx.strokeStyle = NET_COL[b];
    ctx.globalAlpha = b === 0 ? baseA : 1;
    ctx.lineWidth = b === 0 ? width : width * (1 + 0.25 * b);
    ctx.beginPath();
    let any = false;
    for (const s of segs) {
      if (bucket(s.l) !== b) continue;
      ctx.moveTo(s.ax, s.ay);
      ctx.lineTo(s.bx, s.by);
      any = true;
    }
    if (any) ctx.stroke();
  }
  ctx.restore();
}

/** A post (white, a shade side, a lilac fluorescent edge) at depth Z. */
function drawPost(ctx: CanvasRenderingContext2D, Z: number, xc: number, shake: number) {
  const a = P3(-PW / 2, 0, Z, xc), b = P3(PW / 2, BAR, Z, xc);
  const x0 = Math.round(a[0] + shake), x1 = Math.round(b[0] + shake), yb = Math.round(a[1]), yt = Math.round(b[1]);
  const w = Math.max(2, x1 - x0);
  ctx.fillStyle = '#1a1028';
  ctx.fillRect(x0 - 1, yt - 1, w + 2, yb - yt + 2);
  ctx.fillStyle = '#F4F6FF';
  ctx.fillRect(x0, yt, w, yb - yt);
  ctx.fillStyle = '#B9B6D8';
  ctx.fillRect(x0 + Math.ceil(w * 0.62), yt, Math.max(1, Math.floor(w * 0.38)), yb - yt);
  ctx.fillStyle = 'rgba(201,182,255,0.5)';
  ctx.fillRect(x0, yt, 1, yb - yt);
}
function drawCrossbar(ctx: CanvasRenderingContext2D, xc: number, shake: number) {
  const a = P3(0, BAR, ZF, xc), b = P3(0, BAR, ZN, xc), c = P3(0, BAR - PW, ZN, xc), d = P3(0, BAR - PW, ZF, xc);
  ctx.fillStyle = '#1a1028';
  quad(ctx, [[a[0] + shake, a[1] - 1], [b[0] + shake, b[1] - 2], [c[0] + shake, c[1] + 2], [d[0] + shake, d[1] + 1]]);
  ctx.fillStyle = '#F4F6FF';
  quad(ctx, [[a[0] + shake, a[1]], [b[0] + shake, b[1]], [c[0] + shake, c[1]], [d[0] + shake, d[1]]]);
}

/** A lamp's flare in SOLO's own shape: a soft lilac bloom under a stage-light cross glint (never a horizontal streak). */
function starFlare(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, a: number) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.lilac), x, y, size, 0.45 * a);
  drawGlow(ctx, glowOf(PAL.spot), x, y, size * 0.32, 0.75 * a);
  ctx.restore();
  crossGlint(ctx, x, y, Math.min(60, size * 0.55), a);
  ctx.globalCompositeOperation = 'source-over';
}

/** The ball's strobe chain over the lit turf: SOLO's crisp exposures drawn in normal blend (violet, not cyan, on green). */
function strobe(ctx: CanvasRenderingContext2D, pts: readonly { x: number; y: number; t0: number; r: number }[], t: number) {
  ctx.save();
  for (const p of pts) {
    const a = stepFade(t - p.t0, 0.7, 0.12);
    if (a <= 0) continue;
    const e = ballExposure(p.r);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = clamp(a * 0.8);
    ctx.drawImage(e.halo, Math.round(p.x - e.halo.width / 2), Math.round(p.y - e.halo.height / 2));
    ctx.globalAlpha = clamp(a);
    ctx.drawImage(e.disc, Math.round(p.x - e.disc.width / 2), Math.round(p.y - e.disc.height / 2));
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the shot's per-frame state (reset in init)


export const shotEncore: Shot = {
  name: META.name,
  dur: META.dur,
  seed: META.seed,
  rate: rate10,
  cues: [
    {
      at: 0,
      fn: (e) => {
        // The crowd's fourth stomp (its first three ran in shot 9) lands on the cut: the arena kick under it.
        e.sfx.stomp(1.1);
        e.sfx.kickDrum(0.9);
        e.sfx.boom(0.6);
        e.sfx.crash(0.6);
        e.sfx.hat();
        e.sfx.crowd(2.6, 0.55);
        e.cam.shakeAmp = 12;
        e.cam.hit(0.45);
        // Dust shaken off the turf by the stomp (the action plane).
        const r = e.rng;
        for (let i = 0; i < 26; i++) {
          const X = lerp(-3.4, 1.4, r.next());
          e.parts.spawn({
            kind: PK.Smoke, x: planeX(X), y: HY + (F * EYE) / ZH + r.range(-4, 6), vx: r.range(-30, 30), vy: r.range(-60, -20), drag: 2.5,
            max: r.range(0.5, 0.9), s0: r.range(4, 8), s1: r.range(12, 20), ramp: 'dust', r0: 0, r1: 1, a0: 0.28, a1: 0, add: false, layer: 1,
          });
        }
      },
    },
    { at: 0.1, fn: (e) => e.sfx.hat(false, 0.18) },
    { at: T_DRAG, fn: (e) => { e.sfx.scuff(0.45, -0.3); e.sfx.tom(TOMS.C3, 0.55, -0.2); e.cam.shakeAmp = 6; e.cam.hit(0.1); } },
    { at: 0.2, fn: (e) => e.sfx.hat(true, 0.18) },
    { at: T_SET, fn: (e) => { e.sfx.rim(0.7, -0.2); e.sfx.tom(TOMS.A2, 0.55, -0.2); e.sfx.whoosh(0.1, 300, 1500, 0.3); } },
    { at: 0.35, fn: (e) => e.sfx.snare(0.3) },
    {
      at: T_TAP,
      fn: (e) => {
        // THE TAP (g 16.8, beat 3).
        e.sfx.snare(1.0, -0.2);
        e.sfx.kick(0.8);
        e.sfx.kickDrum(0.9);
        e.sfx.rim(0.9, -0.2);
        e.sfx.whoosh(0.3, 300, 2600, 0.45, 0.5);
        e.sfx.gasp(0.55);
        e.sfx.duck(0.5, 0.28);
        e.cam.shakeAmp = 12;
        e.cam.hit(0.4);
        const r = e.rng;
        const x = planeX(X_DB4 - BR), y = HY + (F * (EYE - BR)) / ZH;
        for (let i = 0; i < 12; i++) {
          const a = r.range(-2.4, -0.7), sp = r.range(160, 420);
          e.parts.spawn({
            kind: PK.Streak, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 3.5, ay: 300, max: r.range(0.2, 0.45), s0: r.range(1.2, 2.2), s1: 0.5,
            ramp: 'uv', r0: 0, r1: 0.9, k: 1.2, layer: 1,
          });
        }
        for (let i = 0; i < 14; i++) {
          const a = r.range(-2.6, -0.5), sp = r.range(90, 260);
          e.parts.spawn({
            kind: PK.Blade, x: x + r.range(-10, 10), y: y + 16, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, ay: 700, drag: 1.2, vrot: r.range(-20, 20),
            rot: r.range(0, 6.28), max: r.range(0.4, 0.8), s0: r.range(3, 5), s1: 3, ramp: 'grass', r0: 0, r1: 1, a0: 1, a1: 0.5, add: false, layer: 1,
          });
        }
      },
    },
    ...[0.5, 0.55, 0.6, 0.65].map((at, i) => ({ at, fn: (e: Env) => { e.sfx.snare(0.3 + 0.17 * i, 0.3); } })),
    {
      at: T_LINE,
      fn: (e) => {
        // Over the line: the fluorescent line flashes where the ball crosses.
        e.sfx.hat(true, 0.3, 0.4);
        e.sfx.shing(1.4);
        const r = e.rng;
        const x = planeX(0), y = HY + (F * EYE) / ZB;
        for (let i = 0; i < 16; i++)
          e.parts.spawn({
            kind: PK.Glass, x: x + r.range(-14, 14), y: y + r.range(-4, 4), vx: r.range(-60, 120), vy: r.range(-160, -40), ay: 380, drag: 1, max: r.range(0.4, 0.8),
            s0: r.range(1, 2.4), s1: 1, ramp: 'glass', r0: 0, r1: 1, a0: 1, a1: 0.3, layer: 1,
          });
      },
    },
    {
      at: T_NET,
      fn: (e) => {
        // THE NET (g 17.1): the goal stack.
        e.sfx.boom(1.3);
        e.sfx.crack(1.0);
        e.sfx.kickDrum(1.2);
        e.sfx.crash(1.2, 0.3);
        e.sfx.lampSlam(0.8);
        e.sfx.whoosh(0.18, 2600, 700, 0.35, 0.4);
        e.sfx.shatter(0.6, 0.4);
        e.sfx.roar(1.8, 0.7);
        e.sfx.crowd(3.2, 0.7);
        e.cam.shakeAmp = 18;
        e.cam.hit(0.9);
        e.cam.shove(5, 3);
        const r = e.rng;
        const bx = planeX(X_NET + 0.15), by = HY + (F * (EYE - 0.35)) / ZB;
        for (let i = 0; i < 70; i++) {
          const a = r.range(-Math.PI * 0.95, Math.PI * 0.15), sp = r.range(120, 520);
          e.parts.spawn({
            kind: PK.Glass, x: bx + r.range(-10, 10), y: by + r.range(-14, 14), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120, ay: 520, drag: 1.4,
            max: r.range(0.6, 1.3), s0: r.range(1, 3), s1: 1, ramp: 'glass', r0: 0, r1: 1, a0: 1, a1: 0.2, layer: 1,
          });
        }
        for (let i = 0; i < 36; i++) {
          const a = r.range(0, Math.PI * 2), sp = r.range(300, 900);
          e.parts.spawn({
            kind: PK.Streak, x: bx, y: by, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.7, drag: 2.6, max: r.range(0.25, 0.5), s0: r.range(1.5, 3), s1: 0.6,
            ramp: i % 3 ? 'uv' : 'glass', r0: 0, r1: 0.9, k: 1.6, layer: 1,
          });
        }
        for (let i = 0; i < 26; i++)
          e.parts.spawn({
            kind: PK.Glow, x: bx + r.range(-30, 30), y: by + r.range(-40, 20), vx: r.range(-40, 40), vy: r.range(-90, -20), drag: 1, max: r.range(0.6, 1.1),
            s0: r.range(3, 6), s1: r.range(8, 14), ramp: 'uv', r0: 0.1, r1: 0.9, a0: 0.6, a1: 0, layer: 1,
          });
        // A confetti burst at the lens (screen space).
        for (let i = 0; i < 60; i++)
          e.parts.spawn({
            kind: PK.Confetti, x: r.range(0, VW), y: r.range(-40, 40), vx: r.range(-120, 120), vy: r.range(-60, 160), ay: 90, drag: 0.8, vrot: r.range(-10, 10),
            max: r.range(1.4, 2.4), s0: r.range(3, 5), s1: 4, a0: 1, a1: 0.8, k: r.next(), color: [HEX.kit, HEX.ivory, HEX.lilac][i % 3], add: false, layer: 0,
          });
      },
    },
    ...STAMPS.map((at, i) => ({
      at,
      fn: (e: Env) => {
        e.sfx.kick(0.6);
        e.sfx.lampSlam(0.42 + 0.04 * i);
        e.sfx.tom([TOMS.D3, TOMS.C3, TOMS.A2, TOMS.F2][i], 0.5, -0.45 + 0.3 * i);
        e.cam.shakeAmp = 8;
        e.cam.hit(0.12);
      },
    })),
    {
      at: T_FREEZE,
      fn: (e) => {
        // The ONE of bar 11 (g 17.6): the cymbal, the stomp, the stinger under the card. The picture freezes.
        e.sfx.crash(1.3);
        e.sfx.stomp(1.3);
        e.sfx.boom(0.9);
        e.sfx.stinger();
        e.sfx.shing(1.0);
      },
    },
  ],
  prepare(env) {
    warmSolo2();
    warmSolo(env, ['DB1', 'DB2', 'DB3', 'DB4', 'DB4b', 'DB4c']);
    warmBalls([18, 19, 20]);
    for (const [name, pose] of [['k10sit', K_SIT], ['k10shield', K_SHIELD], ['k10mid', K_MID], ['k10slump', K_SLUMP]] as const)
      PUPPETS.get(name, KEEPER_KIT, pose, KP, -1);
  },
  init(env) {
    env.sfx.clearBus();
    env.cam.set(VW / 2, VH / 2, 1, 0);
    env.cam.shakeRoll = 0.015;
    env.cam.shakeAmp = 12;
    PUPPETS.frame();
  },
  update(env, t) {
    env.sfx.hum(false, 0.025);
    const r = env.rng;
    // Confetti drifting down in front of the lens all through the shot (the stadium is on its feet).
    if (t < T_FREEZE) {
      const n = t >= T_NET ? 3 : 2;
      for (let i = 0; i < n; i++)
        env.parts.spawn({
          kind: PK.Confetti, x: r.range(-20, VW + 20), y: -12, vx: r.range(-40, 40), vy: r.range(70, 170), ay: 50, drag: 0.5, vrot: r.range(-8, 8),
          max: 2.4, s0: r.range(3, 5), s1: 4, a0: 1, a1: 0.85, k: r.next(), color: [HEX.kit, HEX.ivory, HEX.lilac][i % 3], add: false, layer: 0,
        });
      // Motes hanging in the goal's beam after the hit.
      if (t >= T_NET && r.next() < 0.5) {
        const bx = planeX(X_NET + r.range(-0.4, 0.6));
        env.parts.spawn({
          kind: PK.Glow, x: bx, y: HY + r.range(-60, 120), vx: r.range(-8, 8), vy: r.range(-20, 10), drag: 0.5, max: r.range(0.5, 0.9), s0: 1.5, s1: 3,
          ramp: 'mote', r0: 0, r1: 1, a0: 0.7, a1: 0, layer: 1,
        });
      }
    }
  },
  render(env, t) {
    PUPPETS.frame();
    const { ctx, fx, cam } = env;
    const tw = Math.min(t, T_FREEZE);
    const v = view(tw);
    const xc = v.xc;
    cam.x = v.cx;
    cam.y = v.cy;
    cam.zoom = v.z;
    cam.rot = 0;
    const impA = onFrames(tw, T_NET, 2), impB = onFrames(tw, T_NET + 2 * FR, 1);
    const imp = impA || impB;

    // ---- 1 · the far stand, the boards, the crowd's lights (stage space, before everything).
    env.screen();
    ctx.fillStyle = HEX.void;
    ctx.fillRect(0, 0, VW, VH);
    env.world();
    drawStand(env, v, tw, t);

    // ---- 2 · the turf, the lines, the ball's groove of light, the goal line's flash.
    drawTurf(ctx, v);
    drawLines(ctx, v);
    const bxW = ballX(tw);
    const [bsx, bsy] = P3(bxW, BR, ZB, xc);
    const br = Math.round(BR * PPM(ZB));
    const [gsx, gsy] = P3(bxW, 0, ZB, xc);
    // The groove: a lilac line of light on the turf from the tap to the ball (it stays, the poster's fuse into the goal).
    if (tw >= T_TAP) {
      const xa = X_DB4 - 0.05, xb = Math.min(bxW, X_NET);
      if (xb > xa) {
        const k = 0.72 + 0.28 * decay(tw, T_NET, 0.5);
        ctx.save();
        for (const [w, c, a, add] of [[0.4, PAL.uvDeep, 0.55, false], [0.22, PAL.uv, 0.75, false], [0.1, PAL.volt, 0.9, false], [0.035, PAL.spot, 0.9, true]] as const) {
          ctx.globalCompositeOperation = add ? 'lighter' : 'source-over';
          ctx.fillStyle = rgba(c, a * k);
          quad(ctx, [P3(xa, 0, ZB - w / 2, xc), P3(xb, 0, ZB - w / 2, xc), P3(xb, 0, ZB + w / 2, xc), P3(xa, 0, ZB + w / 2, xc)]);
        }
        ctx.restore();
      }
    }
    if (tw >= T_LINE) {
      const k = 0.35 + 0.65 * decay(tw, T_LINE, 0.35);
      ctx.save();
      ctx.fillStyle = rgba(PAL.uv, 0.8 * k);
      quad(ctx, [P3(-0.12, 0, ZB - 1.6, xc), P3(0.12, 0, ZB - 1.6, xc), P3(0.12, 0, ZB + 1.8, xc), P3(-0.12, 0, ZB + 1.8, xc)]);
      ctx.fillStyle = rgba(PAL.lilac, 0.9 * k);
      quad(ctx, [P3(-0.06, 0, ZB - 1.2, xc), P3(0.06, 0, ZB - 1.2, xc), P3(0.06, 0, ZB + 1.3, xc), P3(-0.06, 0, ZB + 1.3, xc)]);
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = rgba(PAL.spot, 0.8 * k);
      quad(ctx, [P3(-0.04, 0, ZB - 0.6, xc), P3(0.04, 0, ZB - 0.6, xc), P3(0.04, 0, ZB + 0.7, xc), P3(-0.04, 0, ZB + 0.7, xc)]);
      ctx.restore();
      const [lx, ly] = P3(0, 0, ZB, xc);
      stage.splash(ctx, lx, ly, 10, 70, 0.28, T_LINE, tw, 0.9);
    }

    // ---- 3 · the goal behind: the far side net, the far post.
    const shake = tw >= T_NET && tw < T_NET + 0.4 ? Math.sin((tw - T_NET) * 90) * 2 * decay(tw, T_NET, 0.4) : 0;
    const segs = netSegs(xc, tw);
    drawSegs(ctx, segs.far, 1);
    drawPost(ctx, ZF, xc, shake * 0.5);

    // ---- 4 · the keeper on his line (behind the ball's path).
    {
      const [kname, kpose] = keeperPose(tw);
      const [kx, ky] = P3(XK, 0.13, ZK, xc);
      const [s0x, s0y] = P3(XK - 0.35, 0, ZK, xc);
      ctx.fillStyle = 'rgba(10,20,14,0.42)';
      ctx.beginPath();
      ctx.ellipse(s0x, s0y + 2, 66 * (KK / 2.5), 11, 0, 0, Math.PI * 2);
      ctx.fill();
      const flinch = tw >= T_GO && tw < T_GO + 0.08 ? Math.round(-3 * decay(tw, T_GO, 0.08)) : 0;
      PUPPETS.draw(ctx, kname, KEEPER_KIT, kpose, KP, -1, Math.round(kx + flinch), Math.round(ky), KK / KP, 1);
    }

    // ---- 5 · the ball: its strobe chain, its shadow, the blaze, the ball.
    if (tw >= T_GO && tw < T_NET + 0.45) {
      const pts = EXPO.map((te) => {
        const [x, y] = P3(ballX(te), BR, ZB, xc);
        return { x, y, t0: te, r: br };
      }).filter((p) => p.t0 <= tw - FR);
      strobe(ctx, pts, tw);
    }
    ctx.fillStyle = 'rgba(8,16,10,0.5)';
    ctx.beginPath();
    ctx.ellipse(gsx, gsy + 1, br * 1.1, br * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    const blaze = tw < T_TAP ? 0.55 : tw < T_NET ? 1.0 : lerp(1.0, 0.7, clamp((tw - T_NET) / 0.3));
    const sq: BallSquash | undefined = onFrames(tw, T_TAP, 3) ? { sx: 1.1, sy: 0.9 } : tw >= T_HIT && tw < T_NET + 0.08 ? { sx: 0.84, sy: 1.12 } : undefined;
    const drawTheBall = () =>
      drawBall(env, spinAt(ballAng(tw), 0, 0, 1), Math.round(bsx), Math.round(bsy), br, 1, 0, 0.5, 'blacklight', sq, { blaze, blazeR: 44 + 20 * blaze });

    // ---- 6 · No.10 (DragBack, pinned on his far toe), the ball under his sole first.
    const { key } = soloAt(SEQ10, tw);
    const [hx, hy] = P3(XH, 0, ZH, xc);
    const hxr = Math.round(hx), hyr = Math.round(hy);
    ctx.fillStyle = 'rgba(8,16,10,0.42)';
    ctx.beginPath();
    ctx.ellipse(hxr + 22, hyr + 1, 84, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    {
      // His follow-spot from the roof stays on him: the drop beam and a hot pool round his boots (pumped by the stomp
      // and the GOAL stamps).
      const pump = onFrames(tw, 0, 6) || STAMPS.some((s) => tw >= s && tw < s + 0.1) ? 1.15 : 1;
      const vis = visible(v);
      ctx.save();
      stage.pillar(ctx, { x0: hxr + 70, y0: vis.y0 - 60, x1: hxr + 24, y1: hyr + 2, w0: 46, w1: 250, a: 0.42 * pump, t: tw, motes: 22, seed: 61, core: 0.22, edge: 4 });
      stage.pool(ctx, hxr + 24, hyr + 3, 120, 16, 0.55 * pump);
      ctx.restore();
    }
    drawTheBall();
    drawSolo(env, key, hxr, hyr, SC);
    {
      const pic = soloPic(env, key);
      const [tx, ty] = soloTopLeft(env, key, hxr, hyr, SC);
      rimLight(ctx, pic.img, tx, ty, SC, [0.2, -1], 3, PAL.spot, 0.45);
      rimLight(ctx, pic.img, tx, ty, SC, [-1, -0.2], 2, PAL.lilac, 0.3);
    }
    // His eye glints on the ta-da as the kick-back reveals him (beat 4, with the G).
    if (tw >= STAMPS[0] && tw < STAMPS[0] + 0.3) {
      const [ex, ey] = soloPoint(env, key, 'eye', hxr, hyr, SC);
      crossGlint(ctx, ex + 1, ey + 1, 34, decay(tw, STAMPS[0], 0.3));
    }

    // ---- 7 · the goal in front: the back + roof net (over the ball once it is in), the near side net, the near post, the bar.
    drawSegs(ctx, segs.back, 1);
    drawSegs(ctx, segs.near, 1, false, 0.55);
    drawPost(ctx, ZN, xc, shake);
    drawCrossbar(ctx, xc, shake);
    if (tw >= T_HIT) {
      // The lit strands again, wider and soft (a violet halo round the light, normal blend), then the cores on top.
      ctx.save();
      ctx.globalAlpha = 0.28;
      drawSegs(ctx, segs.back, 4, true);
      ctx.globalAlpha = 1;
      drawSegs(ctx, segs.back, 1.2, true);
      ctx.restore();
    }

    // ---- 8 · the light of the goal: the drop beam slammed onto the goal mouth, the glow in the net, god rays, splash.
    const [nx, ny] = P3(Math.max(X_NET, bxW) - 0.02, BR + 0.12, ZB, xc);
    const [nfx, nfy] = P3(X_NET - 0.2, 0, ZB + 0.6, xc);
    if (tw >= T_NET) {
      const lt = tw - T_NET;
      stage.pillar(ctx, { x0: nfx + 30, y0: v.cy - VH / 2 / v.z - 60, x1: nfx, y1: nfy, w0: 60, w1: 230, a: lt < 0.1 ? 0.85 : lerp(0.85, 0.42, clamp((lt - 0.1) / 0.4)), t: tw, slamAt: T_NET, motes: 26, seed: 107, core: 0.3 });
      stage.splash(ctx, nx, ny, 24, 170, 0.5, T_NET, tw, 0.9);
      const k = 0.5 + 0.5 * decay(tw, T_NET, 0.5);
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      drawGlow(ctx, glowOf(PAL.uvDeep), nx, ny, 230, 0.55);
      drawGlow(ctx, glowOf(PAL.uv), nx, ny, 170, 0.4 * k);
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.volt), nx, ny, 120, 0.22 * k);
      drawGlow(ctx, glowOf(PAL.lilac), nx, ny, 60, 0.4 * k);
      drawGlow(ctx, glowOf(PAL.spot), nx, ny, 26, 0.7 * k);
      ctx.restore();
      stage.godRays(ctx, nx, ny, 10, 60, 200 * (0.6 + 0.4 * decay(tw, T_NET, 0.6)), 12, 0.32 * (0.5 + 0.5 * decay(tw, T_NET, 0.8)), (G0 + tw) * 0.3, 77, Math.PI * 2, G0 + t);
      starFlare(ctx, nx, ny, 90 * k, 0.45 * k);
      ctx.globalCompositeOperation = 'source-over';
    }
    // The tap's light splash at the contact.
    stage.splash(ctx, Math.round(P3(X_DB4 - BR * 0.8, 0, ZB, xc)[0]), Math.round(gsy), 14, 90, 0.3, T_TAP, tw, 0.9);

    // ---- 9 · the action plane's particles (spawned at xc = 0: shifted by the truck).
    ctx.save();
    ctx.translate(planeShift(xc), 0);
    env.parts.draw(ctx, 1);
    ctx.restore();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    // ---- 10 · screen space: the banks' glare, light rain, confetti, the HUD, GOAL, the card, the fade.
    env.screen();
    if (!imp) drawBanks(env, v, tw, t);
    const [nsx] = toScr(v, nx, ny);
    lightRain(ctx, nsx, 300, 80, T_NET, tw, { y0: -40, y1: 200, a: 0.9, seed: 9 });
    lightRain(ctx, toScr(v, bsx, bsy)[0], 120, 26, T_TAP, tw, { y0: -20, y1: 140, a: 0.6, seed: 4, life: 0.18 });
    env.parts.draw(ctx, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    fourCount(ctx, padsFor(10), t, { flareAllAt: [T_NET] });
    lampTitle2(ctx, ['G', 'O', 'A', 'L'], 320, 150, 130, t, STAMPS, { stroke: 4, outer: 4, beamTop: -20 });
    if (t >= T_FREEZE) nameCard(ctx, t - T_FREEZE, { title: SHOT_NAME, line2: 'No.10  ·  SPECIAL DRIBBLE', score: '4 DEFENDERS BEATEN', style: 'solo' });

    // ---- 11 · post: the relit grade, the hits, the beam impact, the whip's streak, the fade.
    soloBlaze(fx, 1.2 + tw);
    fx.vignette = 0.6;
    fx.bloom = 0.95 + 0.15 * decay(tw, T_NET, 0.25) + 0.06 * decay(tw, T_TAP, 0.15);
    fx.ca = 0.002 + 0.01 * decay(tw, T_NET, 0.2) + 0.005 * decay(tw, T_TAP, 0.12);
    if (tw >= T_NET && tw < T_NET + 0.2) {
      const [ux, uy] = cam.toUV(nx, ny);
      fx.radial = 0.1 * decay(tw, T_NET, 0.2);
      fx.radialX = ux;
      fx.radialY = uy;
    }
    {
      const [ux, uy] = cam.toUV(nx, nfy);
      flatShockAt(fx, ux, uy, T_NET, tw, 0.05, 0.35);
      flatShockAt(fx, ux, uy, T_NET + 0.05, tw, 0.03, 0.35);
      const [tx2, ty2] = cam.toUV(P3(X_DB4, 0, ZB, xc)[0], gsy);
      flatShockAt(fx, tx2, ty2, T_TAP, tw, 0.025, 0.3, 0.35);
    }
    // The crowd's stomp on the cut rolls through the turf; SOLO's beat echo doubles the frame on the tap and the net.
    {
      const [ux, uy] = cam.toUV(hx + 30, hy);
      flatShockAt(fx, ux, uy, 0, tw, 0.022, 0.3, 0.4);
    }
    echoAt(env, tw, T_TAP + 3 * FR, 3, 0.45, 0.01);
    echoAt(env, tw, T_NET + 3 * FR, 4, 0.55, -0.012);
    // The whip: streak along x with a sharp hole on the ball.
    if (tw >= 0.44 && tw < 0.66) {
      const u = (tw - 0.44) / 0.22;
      const [ux, uy] = cam.toUV(bsx, bsy);
      fx.streak = 0.07 * Math.sin(Math.PI * u);
      fx.streakDX = 1;
      fx.streakDY = 0;
      fx.streakHoleX = ux;
      fx.streakHoleY = uy;
      fx.streakHoleR = 0.09;
    }
    if (imp) {
      const [ux] = cam.toUV(nx, ny);
      soloImpact2(fx, impA ? 'A' : 'B', { x: ux, y: -0.05, dx: 0, dy: 1, half: 0.3 });
      // A lit stadium sits mostly above SOLO's 0.40 threshold: print only the hottest shapes (the net's light, the ball,
      // the posts, the beam) so the subject still reads inside the cone.
      fx.impThresh = 0.72;
    }
    if (t >= T_FADE) {
      fx.flash = ease.inQuad(clamp((t - T_FADE) / (META.dur - T_FADE)));
      fx.flashColor = FADE;
    }
  },
};
