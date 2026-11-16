// MERIDIAN THREAD v2 · shot 2 · "The Loom" (1.8 s, seed 412): the power-up and the read. SPEC.md shot 2.
//
// 2a · THE LOOM (0.00-0.90), composed, chest-up front bust (GazeFront at x3, chest anchor on (320, 286)):
//   0.00-0.08  opens inside shot 1's needle's-eye iris: the jade vesica rim slides off the frame edges; the thread that
//              came through the eye runs on from the iris centre over his crown and off the top edge by 0.18 (a comet:
//              mint tail, pearl head, a glint where it leaves the frame).
//   0.00-0.25  the ink falls: Night Ink bleeds in from the frame edges as an ink drop in water (a shrinking noisy blob of
//              colour); No.10 stays in colour. GZ3 (head down, eyes on the ball); the drone builds.
//   0.30       GZ2 + THE LOOM (money image): chin up, puppeteer hands; 12 taut jade threads shoot (outExpo 0.10 s) from his
//              eyes and fingertips: eyes -> the four lamp heads of the two towers, fingertips -> six roof-rim pins
//              (puppet strings), eyes -> the lens (two threads widening 2 -> 8 px out of the bottom corners: the
//              crossbar and No.7, both behind us). Pins pop pearl stitch-stars and stitched rings; the lamp heads catch
//              the jade (passive tint + a <= 120 px JADE_FLARE); cam.hit 0.35, a shock off his eyes, CA, bloom swell.
//   0.42/0.57/0.72  the web is plucked on each tick: one thread per tick takes the shader pluck warp (amp 0.008, N 2,
//              9 Hz, decay 0.3, w 0.04) while the whole web shivers 2 px; a pearl pulse runs the plucked thread and
//              its pin flares (the plucked thread shivers 9 px); punch +0.04 and a 1-frame cam.hit(0.15) (D4, F#4, A4
//              panned to the thread). The pins land with a shing.
//   0.30-0.90  the camera's anchor slides from his chest to his eyes (a push toward the eyes, not the chest).
//   0.42-0.80  GZ2 <-> GZ2b every 0.15 s (fingers flex, hair lifts); jade rim light on his hands where the threads leave.
//   0.80       GZ3: eyes snap down (the decision, hard tick); the six hand strings SNAP (their broken ends appear 60 %
//              home with a spray of stitches and whip onto the roof pins in 4 frames), the four lamp threads let go in
//              0.10 s; the two lens threads (crossbar, No.7) stay. 0.80-0.90 the decision crash push onto his eyes
//              (+0.55, accelerating) into the hard cut.
// 2b · THE READ (0.90-1.80), over-the-shoulder DownPitchView (the brief's eye behind his right shoulder, f held at 640)
//              with No.10's Scan back frames at x2.4 bottom-left, the ball at his boot; the rivals are printed as manga
//              extras at 1.4x their projected scale (ink silhouettes rim-lit mint from above, the white shirts pale under
//              the ink) so the line looms and the swivel reads on the inked pitch:
//   0.90-1.45  a dolly in with his slow-motion carry (eye x 686 -> 732, f held): the line grows as he closes on it.
//   0.90-1.20  the look-off: S1 -> S2a (head to the far side); sightline dashes tick from his head toward the far side;
//              the two forward threads still run from his head over the defence to the crossbar and No.7's
//              shoulder (fade 1.10-1.20). 1.02 all four defenders swivel after his look (two cached poses each) as a
//              manga beat: 36 ink focus lines with jade tips slam in on the line (1.02-1.22) and big ink swish marks
//              trail every head (0.30 s); they shuffle toward the far side; the Tower (1.3x) leans hardest.
//   1.15-1.45  the star chart: a needle stitches a dotted jade PLAN ARCH out of the ball at his boot (rising from behind
//              him), over the line's heads (10 M / 20 M riding it left to right) and down onto a pulsing cross-stitch X
//              beyond the line (locks at 1.42 with a stitched ring and a burst of light-stitches, cleared as the crane
//              moves). From straight behind the true projection would be two vertical shafts, so the arch is drawn in
//              screen space and handed to the projection as the jib swings (plan = 1 - climb³).
//   1.45-1.74  the climb, a jib move with f held (no zoom, no pull-out): crane h 16 -> 124 (12.4 m) and tilt 0 -> -0.20
//              while the arm swings 4.6 m to the near side (eye z 286 -> 332), principal point 128 -> 196. From straight
//              behind the arc stacks along the lens axis (the brief's h 30 / tilt -0.30 put its visible peak above the
//              frame with 26 M on the falling slope); the swing stands the whole arch up over the stadium. The line and
//              No.10 slide out below, 10 M / 20 M pass, a pearl bead rides up the chart with the camera, two floodlight
//              heads rise into a screentone sky and catch the chart's jade (passive tint), the far roof (ink fascia,
//              lit lip, truss) below.
//   1.74       the bead lands on the 26 M apex tick on a hard tick: the chart flushes mint (a drawn line), the 26 M
//              readout slams in on an ink plate (36 -> 24 px), a local pearl glint, cam.hit(0.25); held 4 frames, the
//              smash cut fires at 1.80.
// No flash, impact or full-frame event (shot 2 spends nothing from the flash budget). Roll 0.

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { TAU, clamp, ease, lerp } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { inkTone, lensFlare, pixelText, ribbon, sparkle, type TrailPt } from '../../art/fx';
import { POSES, P, RIVAL_KIT, RIVAL_KIT_C, RIVAL_KIT_D, KEEPER_KIT, type Kit, type Pose } from '../../art/puppet';
import { drawDownPitch, drawPylon, projectDecal, type DownPitchView } from '../../art/stadium';
import { drawNo10, no10, no10Point, type No10Key } from '../../art/no10';
import { drawNo7Boxed, warmNo7, type No7Key } from '../../art/no7';
import { drawBall, holdTrauma, keys, punch, pushShock, zoomAbout } from '../kit';
import {
  HEX, JADE_FLARE, LAMP_JADE, LAYOUT, PAL, PUPPETS, RATE, SEQ10, TOWER_BULK, arcAt, assertMeridianFx, crossStitch,
  lampTintFor, needlePoint, nightGrade, nightInk, seqAt, setPluck, stitchBurst, stitchRing, U_APEX, warmMeridian, type NightMaskFn,
} from './common';

const SEQ = SEQ10[2]!;
const DEG = Math.PI / 180;

// ================================================================ 2a constants

/** The bust's chest pivot (sternum) and scale: head top near y 28, the frame cutting at the belt. */
const CHEST: [number, number] = [320, 286];
const BUST = 3;
/** The tick plucks (his inner clock). */
const TICKS = [0.42, 0.57, 0.72] as const;
const LOOM_T = 0.3;
const DECIDE_T = 0.8;
const CUT_T = 0.9;

/** The two floodlight heads of the west end (upper corners): drawPylon head top-centres and scale. */
const TOWERS: { x: number; y: number; s: number }[] = [
  { x: 82, y: 30, s: 0.9 },
  { x: 558, y: 24, s: 0.9 },
];
/** The roof rim's fascia (the strings pin just under it). */
const ROOF_Y = 34;
/** Lamp-head centres (for the glow / tint) derived from the pylon heads (58 x 28 units). */
const LAMP_C: [number, number][] = TOWERS.map((p) => [p.x, p.y + 14 * p.s]);

type From = 'eyeL' | 'eyeR' | 'tip1' | 'tip2' | 'tip3' | 'tip4' | 'tip5' | 'tip6';
interface Thread {
  from: From;
  /** Pin (screen px at zoom 1, world = screen in 2a). */
  x: number;
  y: number;
  /** Width at his end / at the pin (the lens threads widen 2 -> 8 px toward the camera). */
  w0: number;
  w1: number;
  /** Shoot delay (s) after 0.30: a ripple, not a single blink. */
  d: number;
  /** Which lamp head it pins (tint), -1 = none. */
  lamp: number;
  /** Kept after the decision (the crossbar and No.7 threads). */
  keep?: boolean;
  /** Stereo pan of its pluck. */
  pan: number;
}
/**
 * The loom: 4 eye threads to the lamp heads (left eye to the left pair, right eye to the right pair), 6 fingertip strings
 * up to the roof rim (three per hand, fanned like a puppeteer's strings), 2 eye threads at the lens (the crossbar and
 * No.7, behind the camera; their pins are seen in 2b).
 */
const LOOM: Thread[] = [
  { from: 'eyeL', x: 68, y: 42, w0: 2, w1: 2, d: 0.0, lamp: 0, pan: -0.7 },
  { from: 'eyeL', x: 98, y: 54, w0: 2, w1: 2, d: 0.012, lamp: 0, pan: -0.6 },
  { from: 'eyeR', x: 572, y: 36, w0: 2, w1: 2, d: 0.004, lamp: 1, pan: 0.7 },
  { from: 'eyeR', x: 542, y: 48, w0: 2, w1: 2, d: 0.016, lamp: 1, pan: 0.6 },
  { from: 'tip3', x: 132, y: ROOF_Y + 3, w0: 2, w1: 2, d: 0.008, lamp: -1, pan: -0.5 },
  { from: 'tip2', x: 176, y: ROOF_Y + 3, w0: 2, w1: 2, d: 0.02, lamp: -1, pan: -0.4 },
  { from: 'tip1', x: 220, y: ROOF_Y + 3, w0: 2, w1: 2, d: 0.03, lamp: -1, pan: -0.3 },
  { from: 'tip4', x: 420, y: ROOF_Y + 3, w0: 2, w1: 2, d: 0.026, lamp: -1, pan: 0.3 },
  { from: 'tip5', x: 464, y: ROOF_Y + 3, w0: 2, w1: 2, d: 0.016, lamp: -1, pan: 0.4 },
  { from: 'tip6', x: 508, y: ROOF_Y + 3, w0: 2, w1: 2, d: 0.006, lamp: -1, pan: 0.5 },
  { from: 'eyeL', x: -24, y: 384, w0: 2, w1: 8, d: 0.0, lamp: -1, keep: true, pan: -0.2 },
  { from: 'eyeR', x: 664, y: 384, w0: 2, w1: 8, d: 0.0, lamp: -1, keep: true, pan: 0.2 },
];
/** Which thread each tick plucks: the left lamp, the right lamp, then No.7's thread (the promise). */
const PLUCKED = [0, 2, 11] as const;
const SHOOT = 0.1;

// ================================================================ 2b constants

const L = LAYOUT;
/** No.10's pelvis on screen (the Scan frames at x2.4 bottom-left, cropped at mid-calf; the ball peeks in at his foot). */
const NO10_PELVIS: [number, number] = [150, 288];
const SCAN = 2.4;
/** Two floodlight masts behind the far stand: their heads enter during the climb and catch the chart's jade. */
const MASTS: { x: number; z: number; h: number }[] = [
  { x: 1300, z: 150, h: 330 },
  { x: 1300, z: 404, h: 330 },
];
/** The goal's crossbar centre (the forward thread's pin). */
const BAR = { x: 1180, z: 257, h: 24 };
/** The line: D1, the Tower (1.3x), D3, D4 and the keeper, with their shuffle toward the far side after the look. */
interface Rival {
  name: string;
  kit: Kit;
  x: number;
  z: number;
  shift: number;
  lean: number;
  big?: boolean;
}
const LINE: Rival[] = [
  { name: 'd1', kit: RIVAL_KIT, x: L.d1.x, z: L.d1.z, shift: -14, lean: -0.1 },
  { name: 'tower', kit: RIVAL_KIT, x: L.tower.x, z: L.tower.z, shift: -24, lean: -0.22, big: true },
  { name: 'd3', kit: RIVAL_KIT_C, x: L.d3.x, z: L.d3.z, shift: -16, lean: -0.12 },
  { name: 'd4', kit: RIVAL_KIT_D, x: L.d4.x, z: L.d4.z, shift: -18, lean: -0.14 },
];
/** The two cached poses: set and watching No.10, then swivelled after his look toward the far side. */
const POSE_SET: Pose = POSES.jockey;
const POSE_LOOK: Pose = P({ ...POSES.jockey, torso: 26 * DEG, head: -14 * DEG, armN: 60 * DEG, armF: -50 * DEG, thighN: 40 * DEG, kneeN: 30 * DEG });
const SWIVEL_T = 1.02;
const CHART_T0 = 1.15;
const CHART_T1 = 1.42;
const CLIMB_T0 = 1.45;
/** The crane lands at 1.74 so the mint flush, the 26 M slam and the shake hold 4 frames before the smash cut at 1.80. */
const CLIMB_T1 = 1.74;
/** Puppet raster scale (fixed per shot so the cache is built once in prepare()); the draw scale D tracks the view. */
const PUP_K = 0.46;
const KEEPER_POSE = POSES.gkReady;
/**
 * The rivals in the read are printed as manga extras: solid ink figures rim-lit mint / emerald from above (the threads'
 * and the chart's light), so the swivel reads at 320 x 180 on the inked pitch.
 */
const SIL = { fill: PAL.ink, rim: PAL.mint, rim2: PAL.emerald, lx: 0.25, ly: -1 };
/**
 * The read's camera: just behind his right shoulder (the brief's eye: the strike point projects onto his boot), f held
 * at 640 (no zoom anywhere). The climb is a jib move: it crane-and-tilts from eye height (h 16) up the chart to 12.4 m
 * (h 124) while the arm swings 4.6 m out to the near side (z 286 -> 332), tilt 0 -> -0.20 (looking up), principal point
 * 128 -> 196; from straight behind the arc stacks along the lens axis, so the swing is what stands the whole arch up
 * over the stadium, its 26 M apex near top-centre and a floodlight head either side.
 */
const VIEW_A = { x: 726, z: 286, h: 16, f: 640, horizon: 128, cx: 400, tilt: 0 };
const VIEW_B = { x: 730, z: 332, h: 124, f: 640, horizon: 196, cx: 410, tilt: -0.2 };

// ================================================================ module state (init resets it)

let spin = new BallSpin();
/** Sim-clock seconds (dt is warped, so the 2b slow motion slows his run cycle, the spin and the particles). */
let sim = 0;
const fired = { loom: false, pins: false, snap: false, cut: false, xlock: false, climb: false };

// ================================================================ small helpers

const sstep = (a: number, b: number, x: number) => {
  const u = clamp((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

/** No.10's GazeFront key at t (GZ3 opens and closes 2a; GZ2 / GZ2b alternate in the loom). */
function gazeKey(t: number): No10Key {
  return seqAt(SEQ, Math.min(t, CUT_T - 1e-3));
}

/** Screen point of a bust anchor (world = screen in 2a; the camera zoom is applied by the transform). */
function bustPt(env: Env, key: No10Key, name: string): [number, number] {
  return no10Point(env, key, name, CHEST[0], CHEST[1], BUST, { anchor: 'chest' });
}

/**
 * A loom thread: straight and taut, tapered w0 -> w1, the stroke's thin preset widened for the lens (ink under-stroke,
 * additive emerald halo, jade body, pearl core); `heat` (0..1) brightens it as it is fresh or plucked.
 */
function loomThread(ctx: CanvasRenderingContext2D, pts: TrailPt[], w0: number, w1: number, a: number, heat: number) {
  if (pts.length < 2 || a <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  // A line of light on an inked hairline: a thin ink under-stroke, then a soft three-step emerald falloff (no hard
  // parallel rails), the jade body and the core.
  ribbon(ctx, pts, w0 + 2, w1 + 2, HEX.ink, a);
  ctx.globalCompositeOperation = 'lighter';
  for (const [k, al] of [[3.2, 0.1], [2.0, 0.16], [1.2, 0.26]] as const) ribbon(ctx, pts, w0 * k + 3, w1 * k + 4, HEX.emerald, (al + 0.12 * heat) * a);
  ctx.globalCompositeOperation = 'source-over';
  ribbon(ctx, pts, w0, w1, HEX.jade, a);
  ribbon(ctx, pts, Math.max(1, w0 * 0.5), Math.max(1, w1 * 0.4), heat > 0.4 ? HEX.pearl : HEX.mint, a);
  if (heat > 0) {
    ctx.globalCompositeOperation = 'lighter';
    ribbon(ctx, pts, 1, w1 * 0.3 + 1, HEX.pearl, 0.6 * heat * a);
  }
  ctx.restore();
}

/** Points along a straight thread a -> b with a standing-wave shiver of `amp` px (sin(πu) envelope). */
function threadPts(a: readonly [number, number], b: readonly [number, number], amp: number, phase: number, n = 14): TrailPt[] {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
  const nx = -dy / l, ny = dx / l;
  const out: TrailPt[] = [];
  for (let k = 0; k <= n; k++) {
    const u = k / n;
    const d = amp * Math.sin(Math.PI * u) * Math.cos(phase);
    out.push({ x: a[0] + dx * u + nx * d, y: a[1] + dy * u + ny * d });
  }
  return out;
}

/** The lamp-head glow (after the ink: the floodlights stay ON); `tint` 0..1 white -> jade-white. */
function lampGlow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, tint: number, a = 1) {
  const k = clamp(tint);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf([255, 248, 222]), x, y, r * 2.6, 0.22 * a * (1 - 0.6 * k));
  drawGlow(ctx, glowOf(LAMP_JADE), x, y, r * 2.4, 0.3 * a * k);
  drawGlow(ctx, glowOf(PAL.jade), x, y, r * 3.6, 0.22 * a * k);
  drawGlow(ctx, glowOf(k > 0.01 ? LAMP_JADE : [255, 255, 255]), x, y, r, 0.85 * a);
  ctx.restore();
}

/**
 * Crowd camera flashes in the inked stands (points of 6 px or less, one at a time, never in unison): `n` hashed seats in
 * the rect, each popping for 0.08 s once every ~1.6 s. Drawn after the ink.
 */
function crowdTwinkles(ctx: CanvasRenderingContext2D, x0: number, y0: number, w: number, h: number, t: number, n: number, a = 1) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const hx = (Math.sin(i * 91.7 + 3.1) * 43758.5) % 1, hy = (Math.sin(i * 47.3 + 1.7) * 24634.6) % 1, hp = (Math.sin(i * 13.9) * 9631.2) % 1;
    const ph = (t * 0.9 + Math.abs(hp) * 1.6) % 1.6;
    if (ph > 0.08) continue;
    const k = 1 - ph / 0.08;
    drawGlow(ctx, glowOf(PAL.pearl), x0 + Math.abs(hx) * w, y0 + Math.abs(hy) * h, 2 + 2.5 * k, 0.8 * k * a);
  }
  ctx.restore();
}

// ================================================================ 2a · the loom

/** The west end of the bowl behind him (drawn before the ink): roof rim, two tiers, boards, pitch, the two towers. */
function backdrop2a(env: Env, t: number) {
  const { ctx } = env;
  const st = env.art.stadium;
  // Sky above the roof (screentone after the ink).
  const sky = ctx.createLinearGradient(0, -80, 0, 40);
  sky.addColorStop(0, '#03100b');
  sky.addColorStop(1, '#0c2a1e');
  ctx.fillStyle = sky;
  ctx.fillRect(-120, -120, VW + 240, 170);
  // The two tiers of the stand (the crowd strips, smoothed: far away), a tier gap, the boards, the pitch.
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  const drift = t * 6;
  ctx.drawImage(st.crowd, 300 + drift, 0, 860, 110, -110, 36, 860, 106);
  ctx.fillStyle = '#121a20';
  ctx.fillRect(-120, 140, VW + 240, 7);
  ctx.drawImage(st.crowdNear, 0, 0, 800, 90, -80, 146, 800, 94);
  ctx.restore();
  ctx.fillStyle = '#0d1418';
  ctx.fillRect(-120, 238, VW + 240, 16);
  const boards = ['#1d4f8a', '#b8322e', '#e0b020', '#2a8a4a'];
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = boards[i % 4];
    ctx.fillRect(-100 + i * 72, 241, 66, 10);
  }
  const pg = ctx.createLinearGradient(0, 254, 0, 420);
  pg.addColorStop(0, '#2b7a38');
  pg.addColorStop(1, '#1d5428');
  ctx.fillStyle = pg;
  ctx.fillRect(-120, 254, VW + 240, 200);
  // The roof rim: a heavy band across the top with its fascia and the truss shadow under it.
  ctx.fillStyle = '#07090c';
  ctx.fillRect(-120, -120, VW + 240, ROOF_Y - 1 + 120);
  ctx.fillStyle = '#2a3642';
  ctx.fillRect(-120, ROOF_Y - 4, VW + 240, 4);
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(-120, ROOF_Y, VW + 240, 12);
  ctx.strokeStyle = '#151c24';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = -120; x < VW + 120; x += 40) {
    ctx.moveTo(x, ROOF_Y - 4);
    ctx.lineTo(x + 20, ROOF_Y - 24);
    ctx.lineTo(x + 40, ROOF_Y - 4);
  }
  ctx.stroke();
  // The two floodlight towers in the upper corners (mast, head frame, lamp grid).
  for (const p of TOWERS) drawPylon(ctx, p.x, p.y, p.s, [0, 0, 0, 0]);
}

/** The ink drop's radius at t: from beyond the frame (540) to nothing over 0.00-0.25 (inOutSine). */
const inkR = (t: number) => lerp(540, 0, ease.inOutSine(clamp(t / 0.25)));
/** The noisy edge of the ink drop (an ink blot spreading in water), radius r. */
function blobPath(c: CanvasRenderingContext2D, r: number, t: number) {
  c.beginPath();
  for (let i = 0; i <= 90; i++) {
    const th = (i / 90) * TAU;
    const n = 1 + 0.13 * Math.sin(5 * th + 1.3 + t * 4) + 0.08 * Math.sin(11 * th + 4.1 - t * 6) + 0.05 * Math.sin(19 * th + 2.2) + 0.03 * Math.sin(31 * th - t * 9);
    const x = 320 + Math.cos(th) * r * n * 1.15, y = 196 + Math.sin(th) * r * n * 0.82;
    i ? c.lineTo(x, y) : c.moveTo(x, y);
  }
  c.closePath();
}
/** The ink-drop mask: the colour that survives is the blob, shrinking to nothing (0 -> 0.25). */
function inkDrop(t: number): NightMaskFn | undefined {
  const R = inkR(t);
  if (R <= 1) return undefined;
  return (m) => {
    for (const [dr, a] of [[46, 0.25], [22, 0.55], [0, 1]] as const) {
      m.globalAlpha = a;
      blobPath(m, R + dr, t);
      m.fill();
    }
    m.globalAlpha = 1;
  };
}
/** The ink front: a darker wet edge where the blot is still spreading (drawn just outside the colour that is left). */
function inkFront(ctx: CanvasRenderingContext2D, t: number) {
  const R = inkR(t);
  if (R <= 4 || R > 520) return;
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.strokeStyle = HEX.ink;
  for (const [dr, w, a] of [[30, 26, 0.35], [16, 10, 0.6]] as const) {
    ctx.globalAlpha = a;
    ctx.lineWidth = w;
    blobPath(ctx, R + dr, t);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * The 1 px jade rim on his hands (x3: 3 px) where the threads leave him: the frame tinted jade, drawn 3 px off in four
 * directions under the bust, clipped to the hands only (the face takes its light from the eye glows).
 */
function handRim(env: Env, key: No10Key, a: number) {
  const f = no10(key);
  if (!f || a <= 0) return;
  const ctx = env.ctx;
  const tips = (['tip2', 'tip5'] as const).map((n) => bustPt(env, key, n));
  const tint = f.a.tinted(f.i, PAL.jade);
  ctx.save();
  ctx.beginPath();
  for (const [x, y] of tips) {
    ctx.moveTo(x + 46, y + 20);
    ctx.arc(x, y + 20, 46, 0, TAU);
  }
  ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  for (const [dx, dy] of [[-3, 0], [3, 0], [0, -3], [0, 3]] as const)
    drawNo10(env, key, CHEST[0] + dx, CHEST[1] + dy, BUST, { anchor: 'chest', alpha: a }, tint);
  ctx.restore();
}

function render2a(env: Env, t: number) {
  const { ctx, fx, cam } = env;
  const key = gazeKey(t);
  // Camera: 1.00 -> 1.10 (inOutSine), its anchor sliding from his chest-line to his eyes through the hold (0.30-0.90),
  // a kick when the loom shoots, a +0.04 punch on every tick, a snap on the decision, then the decision crash push onto
  // his eyes into the hard cut (+0.55 by 0.90, accelerating; the eyes ride up to y 176). From 0.80 the anchor is GZ3's
  // eyes, so his eyes hold their place on screen as his head drops. Roll 0.
  const emOf = (k: No10Key): [number, number] => {
    const [lx, ly] = bustPt(env, k, 'eyeL'), [rx, ry] = bustPt(env, k, 'eyeR');
    return [(lx + rx) / 2, (ly + ry) / 2];
  };
  const em = emOf(t >= DECIDE_T ? 'GZ3' : 'GZ2');
  const toEyes = sstep(LOOM_T, CUT_T, t);
  const ax = lerp(320, em[0], toEyes), ay = lerp(200, em[1], toEyes);
  let z = keys([[0, 1], [0.9, 1.1, 'inOutSine']], t);
  z += punch(t, LOOM_T, 0.05, 0.03, 0.3);
  for (const tk of TICKS) z += punch(t, tk, 0.04, 0.03, 0.12);
  z += punch(t, DECIDE_T, 0.035, 0.02, 0.12);
  z += keys([[DECIDE_T, 0], [CUT_T - 1 / 60, 0.55, 'inCubic']], t);
  zoomAbout(cam, ax, ay, ax, lerp(200, 176, sstep(DECIDE_T, CUT_T, t)), z);
  env.world();

  // ---- the world (inked)
  backdrop2a(env, t);
  // The ink falls (0.00-0.25): an ink drop from the edges; then the full Night Ink.
  nightInk(ctx, 0.85, inkDrop(t));
  inkFront(ctx, t);
  crowdTwinkles(ctx, -60, 40, 760, 196, t, 46, sstep(0.1, 0.3, t));
  // ---- the lamps (after the ink: the floodlights stay on; their heads catch the jade the threads pin to them)
  const shootK = (d: number) => ease.outExpo(clamp((t - LOOM_T - d) / SHOOT));
  // The release: the eye threads let go in 0.10 s; the hand strings SNAP at the GZ3 swap (his hands leave the frame), so
  // their broken ends are already 60 % of the way home on the first GZ3 frame and whip onto their pins in 4 frames.
  const releaseK = (th: Thread) =>
    th.keep
      ? 0
      : th.from.startsWith('tip')
        ? t < DECIDE_T
          ? 0
          : lerp(0.6, 1, ease.outCubic(clamp((t - DECIDE_T) / 0.06)))
        : ease.outQuad(clamp((t - DECIDE_T) / 0.1));
  for (let i = 0; i < 2; i++) {
    let tint = 0, pulse = 0;
    LOOM.forEach((th, k) => {
      if (th.lamp !== i) return;
      tint = Math.max(tint, shootK(th.d) * (1 - 0.7 * releaseK(th)));
      TICKS.forEach((tk, j) => {
        if (PLUCKED[j] === k && t >= tk) pulse = Math.max(pulse, Math.exp(-(t - tk) / 0.18));
      });
    });
    const [lx, ly] = LAMP_C[i];
    lampGlow(ctx, lx, ly, 20, tint, 1 + 0.6 * pulse);
    // The arrival flare (<= 120 px, JADE_FLARE) and a smaller one on every pluck of its thread.
    const arrive = t >= LOOM_T + SHOOT ? Math.exp(-(t - LOOM_T - SHOOT) / 0.22) : 0;
    const fl = Math.max(arrive, 0.7 * pulse);
    if (fl > 0.02) lensFlare(ctx, lx, ly, 120 * fl, 0.7 * fl, JADE_FLARE);
  }

  // ---- No.10 (never graded): the rim on his hands, the bust, his eyes' jade
  const loomOn = t >= LOOM_T && t < DECIDE_T;
  const fromPts = new Map<From, [number, number]>();
  const fromKey: No10Key = key === 'GZ3' ? 'GZ2' : key;
  for (const n of ['eyeL', 'eyeR', 'tip1', 'tip2', 'tip3', 'tip4', 'tip5', 'tip6'] as const) fromPts.set(n, bustPt(env, fromKey, n));
  if (key === 'GZ3') {
    // GZ3 has no tips (hands off the canvas); the eyes are its own. The kept lens threads follow its eyes.
    fromPts.set('eyeL', bustPt(env, 'GZ3', 'eyeL'));
    fromPts.set('eyeR', bustPt(env, 'GZ3', 'eyeR'));
  }
  if (loomOn) handRim(env, key, 0.55 + 0.25 * Math.sin(t * 31));
  drawNo10(env, key, CHEST[0], CHEST[1], BUST, { anchor: 'chest' });
  // The thread that came through the needle's eye runs on from the iris centre (in front of him: the continuity of shot
  // 1's thread) up over his crown and off the top edge by ~0.04, a ~100 px comet whipping through (the tail clears his
  // face by ~0.06 and the frame by 0.10): a mint tail, a pearl head, a glint where it leaves the frame. Never graded.
  if (t < 0.3) {
    const hd = ease.outCubic(clamp(t / 0.12)), tl = ease.outCubic(clamp((t - 0.035) / 0.12));
    const a: [number, number] = [lerp(320, 354, tl), lerp(180, -80, tl)], b: [number, number] = [lerp(320, 356, hd), lerp(180, -80, hd)];
    if (b[1] < a[1] - 2) {
      const fade = 1 - clamp((t - 0.22) / 0.08);
      const pts = threadPts(a, b, 0, 0, 10);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ribbon(ctx, pts, 0, 6, HEX.mint, 0.8 * fade);
      ctx.restore();
      loomThread(ctx, pts, 1, 4, fade, 0.8);
      if (b[1] > -30) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, glowOf(PAL.pearl), b[0], b[1], 12, 0.9 * fade);
        ctx.restore();
        needlePoint(ctx, b[0], b[1], Math.atan2(b[1] - a[1], b[0] - a[0]), 1, 16);
      }
      // Where it leaves the frame (the top edge in screen space, through the current zoom).
      const topY = cam.y - VH / 2 / cam.zoom;
      if (b[1] < topY && a[1] > topY) {
        const k = (topY - a[1]) / (b[1] - a[1]);
        const ex = lerp(a[0], b[0], k);
        sparkle(ctx, ex, topY + 3, 10 * fade, 0.9 * fade, Math.PI / 4);
      }
    }
  }

  // The anticipation (0.20-0.30): jade gathers in his eyes before the snap; then the eyes burn while the loom holds.
  const gather = sstep(0.18, 0.3, t) * (t < LOOM_T ? 1 : 0);
  const burn = t >= LOOM_T ? (t < DECIDE_T ? lerp(1, 0.6, sstep(LOOM_T + 0.08, LOOM_T + 0.25, t)) : Math.max(0, 1 - (t - DECIDE_T) / 0.1) * 0.3 + 0.3) : gather * 0.8;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const n of ['eyeL', 'eyeR'] as const) {
    const [ex, ey] = fromPts.get(n)!;
    drawGlow(ctx, glowOf(PAL.emerald), ex, ey, 22, 0.45 * burn);
    drawGlow(ctx, glowOf(PAL.jade), ex, ey, 9, 0.6 * burn);
    drawGlow(ctx, glowOf(PAL.pearl), ex, ey, 3.5, 0.85 * burn);
  }
  ctx.restore();
  if (t >= LOOM_T && t < LOOM_T + 0.2) {
    const s = 1 - (t - LOOM_T) / 0.2;
    for (const n of ['eyeL', 'eyeR'] as const) {
      const [ex, ey] = fromPts.get(n)!;
      sparkle(ctx, ex, ey, 8 + 22 * s, 0.9 * s, Math.PI / 4 + t * 2);
    }
  }

  // ---- THE LOOM (after him: the threads leave his eyes and fingertips)
  if (t >= LOOM_T) {
    LOOM.forEach((th, i) => {
      const reach = shootK(th.d);
      if (reach <= 0) return;
      const rel = releaseK(th);
      const alpha = 1 - rel;
      if (alpha <= 0.01) return;
      const a0 = fromPts.get(th.from)!;
      // The release: his end lets go and snaps back toward the pin while the thread fades.
      const a: [number, number] = [lerp(a0[0], th.x, rel * 0.85), lerp(a0[1], th.y, rel * 0.85)];
      const b: [number, number] = [lerp(a0[0], th.x, reach), lerp(a0[1], th.y, reach)];
      // Shiver: the whole web 2 px on every tick; the plucked thread 5 px.
      let amp = 0, ph = 0, heat = Math.max(0, 1 - (t - LOOM_T - th.d) / 0.25);
      TICKS.forEach((tk, j) => {
        if (t < tk) return;
        const e = Math.exp(-(t - tk) / 0.3);
        const own = PLUCKED[j] === i;
        const amt = (own ? 9 : 2) * e;
        if (amt > Math.abs(amp)) {
          amp = amt;
          ph = TAU * 9 * (t - tk) + i * 1.7;
        }
        if (own) heat = Math.max(heat, Math.exp(-(t - tk) / 0.16));
      });
      // The twang as each thread pins taut (an overshoot that rings out in 0.15 s), and the whip as it lets go.
      const pinT = LOOM_T + th.d + SHOOT;
      if (t >= pinT) {
        const amt = 3.5 * Math.exp(-(t - pinT) / 0.12);
        if (amt > Math.abs(amp)) {
          amp = amt;
          ph = TAU * 9 * (t - pinT) + i;
        }
      }
      if (rel > 0) {
        const amt = 6 * rel * (1 - rel) * 4;
        if (amt > Math.abs(amp)) {
          amp = amt;
          ph = TAU * 7 * (t - DECIDE_T) + i * 2.3;
        }
      }
      const pts = threadPts(a, b, amp, ph);
      loomThread(ctx, pts, th.w0, lerp(th.w0, th.w1, reach), alpha, heat);
      if (reach < 1) {
        // The racing head: a pearl needle point.
        needlePoint(ctx, b[0], b[1], Math.atan2(b[1] - a[1], b[0] - a[0]), 1, 18);
      } else {
        // Pearl glints flowing out along the thread (his power running into the stadium).
        const L0 = Math.hypot(b[0] - a[0], b[1] - a[1]);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let g = 0; g < 2; g++) {
          const u = ((t * 700 + g * L0 * 0.5 + i * 37) % Math.max(1, L0)) / Math.max(1, L0);
          const q = pts[Math.min(pts.length - 1, Math.round(u * (pts.length - 1)))];
          drawGlow(ctx, glowOf(PAL.pearl), q.x, q.y, 3 + 2 * th.w1 * u, 0.7 * alpha);
        }
        ctx.restore();
        // The pin: a pearl stitch-star (pops 18 px on arrival, holds 7 px; flares on its pluck).
        const pop = Math.exp(-(t - LOOM_T - th.d - SHOOT) / 0.12);
        if (th.x > 0 && th.x < VW && th.y > 0 && th.y < VH) {
          sparkle(ctx, th.x, th.y, 7 + 11 * pop + 8 * heat * (1 - pop), alpha, Math.PI / 4);
          stitchRing(ctx, th.x, th.y, lerp(4, 30, 1 - pop), pop * alpha, { width: 1.5, dash: 4, gap: 3 });
        }
        // The pulse running the plucked thread (0.12 s) from him to the pin.
        TICKS.forEach((tk, j) => {
          if (PLUCKED[j] !== i || t < tk || t > tk + 0.16) return;
          const u = ease.outQuad(clamp((t - tk) / 0.12));
          const q = pts[Math.round(u * (pts.length - 1))];
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          drawGlow(ctx, glowOf(PAL.pearl), q.x, q.y, 6 + 1.5 * th.w1, 0.95);
          drawGlow(ctx, glowOf(PAL.mint), q.x, q.y, 12 + 3 * th.w1, 0.45);
          ctx.restore();
        });
      }
    });
  }

  // Particles (the stitches flung off the pins and the eyes).
  env.parts.draw(ctx, 0);
  env.parts.draw(ctx, 1);

  // ---- the needle's-eye iris carried over from shot 1: its jade rim slides off the frame edges (0.00-0.08)
  if (t < 0.08) {
    env.screen();
    const e = ease.outCubic(clamp(t / 0.08));
    const A = lerp(330, 470, e), B = A * 3;
    const path = () => {
      ctx.beginPath();
      ctx.moveTo(320, 180 - B);
      ctx.quadraticCurveTo(320 + A * 2, 180, 320, 180 + B);
      ctx.quadraticCurveTo(320 - A * 2, 180, 320, 180 - B);
      ctx.closePath();
    };
    ctx.save();
    ctx.beginPath();
    ctx.rect(-10, -10, VW + 20, VH + 20);
    ctx.moveTo(320, 180 - B);
    ctx.quadraticCurveTo(320 - A * 2, 180, 320, 180 + B);
    ctx.quadraticCurveTo(320 + A * 2, 180, 320, 180 - B);
    ctx.closePath();
    ctx.fillStyle = HEX.night;
    ctx.fill('evenodd');
    ctx.lineJoin = 'round';
    ctx.strokeStyle = HEX.ink;
    ctx.lineWidth = 9;
    path();
    ctx.stroke();
    ctx.strokeStyle = HEX.jade;
    ctx.lineWidth = 6;
    path();
    ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.pearl), 320 - A * 0.98, 180 - 40 + e * 80, 12, 0.9);
    ctx.restore();
  }

  // ---- post
  const shot = t >= LOOM_T ? Math.exp(-(t - LOOM_T) / 0.18) : 0;
  // Threshold 0.86: the pearl / mint cores and the stitch-stars bloom; his skin (luminance ~0.82 at x3) does not.
  nightGrade(fx, { bloom: lerp(1.0, 1.15, clamp(t / CUT_T)) + 0.3 * shot, thresh: 0.86, ca: 0.0015 + 0.008 * shot });
  if (t >= LOOM_T && t < LOOM_T + 0.6) {
    // One slow shock off his eyes as the loom shoots (a refraction ring, not a brightness change).
    const u = (t - LOOM_T) / 0.6;
    const [ex, ey] = bustPt(env, 'GZ2', 'eyeL'), [fx2, fy2] = bustPt(env, 'GZ2', 'eyeR');
    const [ux, uy] = cam.toUV((ex + fx2) / 2, (ey + fy2) / 2);
    pushShock(fx, { x: ux, y: uy, r: lerp(0.02, 0.95, ease.outCubic(u)), s: 0.03 * (1 - u) });
  }
  // The shader pluck on one thread per tick (amp 0.008, N 2, 9 Hz, decay 0.3, width 0.04).
  TICKS.forEach((tk, j) => {
    if (t < tk || t > tk + 0.15) return;
    const th = LOOM[PLUCKED[j]];
    const a = fromPts.get(th.from)!;
    setPluck(fx, cam, [a, [(a[0] + th.x) / 2, (a[1] + th.y) / 2], [th.x, th.y]], { amp: 0.008, n: 2, hz: 9, decay: 0.3, w: 0.04, tSince: t - tk, glow: 0.4 });
  });
}

// ================================================================ 2b · the read

/** The view at t: a slow push with him (eye x 718 -> 730), then the climb up the star chart (crane + tilt + lens shift). */
function view2b(t: number): DownPitchView {
  const c = ease.inOutCubic(clamp((t - CLIMB_T0) / (CLIMB_T1 - CLIMB_T0)));
  // Handheld: a slow 2-3 px drift of the frame (never a roll), settling as the crane locks off.
  const hand = 1 - 0.7 * c;
  const hx = (Math.sin(t * 2.3) * 2.4 + Math.sin(t * 5.1 + 1) * 0.8) * hand, hy = Math.sin(t * 1.9 + 2) * 2 * hand;
  const A = VIEW_A, B = VIEW_B;
  return {
    // A motivated dolly in on the line (f held: not a zoom), eye x 686 -> 732, then the climb.
    x: keys([[CUT_T, A.x - 40], [CLIMB_T0, A.x + 6, 'inOutSine'], [CLIMB_T1, B.x, 'inOutCubic']], t),
    z: lerp(A.z, B.z, c),
    h: lerp(A.h, B.h, c),
    f: A.f,
    horizon: lerp(A.horizon, B.horizon, c) + hy,
    cx: lerp(A.cx, B.cx, c) + hx,
    tilt: lerp(A.tilt, B.tilt, c),
  };
}

/** No.7's field x during 2b (jogging onto the line, onside). */
const no7X = (t: number) => lerp(966, 984, clamp((t - CUT_T) / 0.9));

/** The ball at his right foot (screen), sliding with him. */
function heroSlide(t: number) {
  return lerp(0, 260, ease.inOutCubic(clamp((t - CLIMB_T0) / (CLIMB_T1 - CLIMB_T0))));
}

interface ChartPt {
  x: number;
  y: number;
  h: number;
  u: number;
}
/**
 * The star chart's points (64 segments). Seen from straight behind, the projected ARC stacks along the lens axis (two
 * vertical shafts), so before the climb the chart is a screen-space PLAN ARCH: from the ball at his boot up over the
 * line to an apex at y 24 (62 % of the way to the X), then down onto the X (two quadratic limbs split at the arc's own
 * apex u 0.72, so the h readings, ticks and numerals ride it left to right). As the jib swings (climb 0 -> 1) the arch
 * hands over to the true projection (plan = 1 - climb³), which the swing stands up over the stadium by the lock. The
 * projection's first few metres are nudged onto his boot, the nudge fading out as the crane lifts away.
 */
function chartPts(v: DownPitchView, boot: [number, number], climb: number): ChartPt[] {
  const out: ChartPt[] = [];
  const p0 = projectDecal(arcAt(0).x, arcAt(0).z, 0, v);
  const Xp = projectDecal(L.target.x, L.target.z, 0, v);
  const apex: [number, number] = [lerp(boot[0], Xp.x, 0.62), 24];
  const plan = 1 - climb ** 3;
  const rise: [number, number][] = [boot, [lerp(boot[0], apex[0], 0.3), apex[1] - 12], apex];
  const fall: [number, number][] = [apex, [Xp.x - 4, apex[1]], [Xp.x, Xp.y]];
  for (let i = 0; i <= 64; i++) {
    const u = i / 64;
    const a = arcAt(u);
    const p = projectDecal(a.x, a.z, a.h, v);
    const k = (1 - sstep(0, 0.12, u)) * (1 - clamp(climb * 3));
    const px = p.x + (boot[0] - p0.x) * k, py = p.y + (boot[1] - p0.y) * k;
    const r = u <= U_APEX ? u / U_APEX : (u - U_APEX) / (1 - U_APEX);
    const [qa, qc, qb] = u <= U_APEX ? rise : fall;
    const qx = (1 - r) ** 2 * qa[0] + 2 * (1 - r) * r * qc[0] + r * r * qb[0];
    const qy = (1 - r) ** 2 * qa[1] + 2 * (1 - r) * r * qc[1] + r * r * qb[1];
    out.push({ x: lerp(px, qx, plan), y: lerp(py, qy, plan), h: a.h / 10, u });
  }
  return out;
}

/** The star chart: a dotted jade arc (2 px, 14 px emerald halo) to `reveal`, a pearl needle stitching it, pearl ticks
 * every 5 m up the rising limb with 10 M / 20 M numerals, and the 26 M apex tick (its glint from 1.78). */
function drawChart(ctx: CanvasRenderingContext2D, pts: ChartPt[], reveal: number, t: number, climb = 0) {
  const n = Math.max(2, Math.ceil(pts.length * clamp(reveal)));
  // The lock holds full for 2 frames, then rings out (the 4 frames before the smash cut read as a hit).
  const lock = t >= CLIMB_T1 ? Math.exp(-Math.max(0, t - CLIMB_T1 - 0.03) / 0.1) : 0;
  const bold = clamp(climb + lock);
  const P = pts.slice(0, n);
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(P[0].x, P[0].y);
    for (let i = 1; i < P.length; i++) ctx.lineTo(P[i].x, P[i].y);
  };
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = HEX.ink;
  ctx.lineWidth = 6 + 3 * bold;
  path();
  ctx.stroke();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.32 + 0.12 * bold;
  ctx.strokeStyle = HEX.emerald;
  ctx.lineWidth = 14 + 8 * bold;
  path();
  ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.setLineDash([6, 4]);
  ctx.lineDashOffset = -t * 40;
  ctx.strokeStyle = HEX.jade;
  ctx.lineWidth = 2.5 + 1.5 * bold;
  path();
  ctx.stroke();
  ctx.setLineDash([]);
  if (lock > 0.02) {
    // The lock: the whole chart flushes mint for a beat as the tick lands (a drawn line, not a flash).
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.5 * lock;
    ctx.strokeStyle = HEX.mint;
    ctx.lineWidth = 3;
    path();
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }
  // Ticks every 5 m up the rising limb, numerals every 10 m, the apex tick.
  let apexI = 0;
  for (let i = 1; i < pts.length; i++) if (pts[i].h > pts[apexI].h) apexI = i;
  const top = Math.min(apexI, P.length - 1);
  for (let i = 1; i <= top; i++) {
    const a = P[i - 1], b = P[i];
    for (let m = Math.ceil(a.h / 5) * 5; m <= b.h && m > 0; m += 5) {
      if (m <= a.h || m >= 26) continue;
      const k = (m - a.h) / Math.max(1e-6, b.h - a.h);
      const x = lerp(a.x, b.x, k), y = lerp(a.y, b.y, k);
      const big = m % 10 === 0;
      ctx.fillStyle = HEX.ink;
      ctx.fillRect(Math.round(x + 3), Math.round(y - 2), big ? 12 : 8, 4);
      ctx.fillStyle = HEX.pearl;
      ctx.fillRect(Math.round(x + 4), Math.round(y - 1), big ? 10 : 6, 2);
      if (big) pixelText(ctx, `${m} M`, x + 17, y - 6, 12, HEX.pearl, 'left', HEX.ink);
    }
  }
  if (n > apexI) {
    const q = pts[apexI];
    ctx.fillStyle = HEX.ink;
    ctx.fillRect(Math.round(q.x - 2), Math.round(q.y - 9), 4, 18);
    ctx.fillStyle = HEX.pearl;
    ctx.fillRect(Math.round(q.x - 1), Math.round(q.y - 8), 2, 16);
    // The readout: a small 26 M while the chart draws; on the landing it SLAMS in (36 -> 24 px, outBack) on an ink
    // plate, with a local pearl glint on the tick (drawn, so it costs nothing from the flash budget).
    const slam = t >= CLIMB_T1 - 0.06 ? ease.outBack(clamp((t - (CLIMB_T1 - 0.06)) / 0.06)) : -1;
    if (slam < 0) pixelText(ctx, '26 M', q.x + 11, q.y - 18, 16, HEX.pearl, 'left', HEX.ink);
    else {
      const size = Math.round(24 * lerp(1.5, 1, slam));
      const tx = q.x + 20, ty = q.y - 30 - (size - 24) * 0.5;
      const pw = Math.round(size * 2.9 + 12), ph = size + 8;
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = HEX.ink;
      ctx.fillRect(Math.round(tx - 5), Math.round(ty - 4), pw, ph);
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = HEX.emerald;
      ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(tx - 5) + 0.5, Math.round(ty - 4) + 0.5, pw - 1, ph - 1);
      ctx.globalAlpha = 1;
      ctx.fillStyle = HEX.mint;
      ctx.fillRect(Math.round(tx - 5), Math.round(ty + size + 5), Math.round(pw * clamp(slam)), 2);
      pixelText(ctx, '26 M', tx, ty, size, HEX.pearl, 'left', HEX.ink);
    }
    if (lock > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.pearl), q.x, q.y, 30, 0.6 * lock);
      ctx.restore();
      sparkle(ctx, q.x, q.y, 18 + 14 * lock, lock, Math.PI / 4);
    }
  }
  // The climb's comet: a pearl bead riding up the chart with the camera, landing on the 26 M tick at the lock.
  if (climb > 0 && n > apexI) {
    const f = Math.min(apexI, lerp(4, apexI, ease.inOutCubic(climb)));
    const i0 = Math.floor(f), k = f - i0;
    const at = (j: number) => pts[Math.max(0, Math.min(pts.length - 1, j))];
    const hx = lerp(at(i0).x, at(i0 + 1).x, k), hy = lerp(at(i0).y, at(i0 + 1).y, k);
    const tail: TrailPt[] = [];
    for (let j = Math.max(0, i0 - 6); j <= i0; j++) tail.push({ x: at(j).x, y: at(j).y });
    tail.push({ x: hx, y: hy });
    ctx.globalCompositeOperation = 'lighter';
    if (tail.length > 2) ribbon(ctx, tail, 0, 9, HEX.mint, 0.55);
    drawGlow(ctx, glowOf(PAL.jade), hx, hy, 26, 0.6);
    drawGlow(ctx, glowOf(PAL.pearl), hx, hy, 9, 1);
    ctx.globalCompositeOperation = 'source-over';
  }
  // The needle stitching it.
  if (reveal > 0 && reveal < 1) {
    const h = P[P.length - 1], hb = P[Math.max(0, P.length - 2)];
    needlePoint(ctx, h.x, h.y, Math.atan2(h.y - hb.y, h.x - hb.x), 1, 16);
  }
  ctx.restore();
}

/** The ink swish marks at the swivel: three curved strokes trailing each head (manga motion lines). */
function swish(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, a: number) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = clamp(a);
  ctx.lineCap = 'round';
  for (let k = 0; k < 3; k++) {
    const r = (9 + k * 5) * s;
    ctx.strokeStyle = HEX.ink;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x - 2 * s, y, r, -1.15, -0.25);
    ctx.stroke();
    ctx.strokeStyle = k === 1 ? HEX.mint : HEX.jade;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x - 2 * s, y, r, -1.15, -0.25);
    ctx.stroke();
  }
  ctx.restore();
}

const frac = (x: number) => x - Math.floor(x);
/**
 * The swivel's manga beat: 36 ink focus lines (tapered wedges from beyond the frame) with jade tips converging on the
 * line's centre (cx, cy), their inner ends on an ellipse (rx, ry) that clears the defenders; `slam` 0..1 pulls the
 * inner ends in as the beat lands. MERIDIAN owns ink focus lines (2b only; never in the 2a loom).
 */
function focusLines(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, a: number, slam: number) {
  if (a <= 0) return;
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < 36; i++) {
    const h1 = frac(Math.sin(i * 12.9898 + 1.3) * 43758.5453), h2 = frac(Math.sin(i * 78.233 + 0.7) * 12345.678);
    const th = ((i + 0.6 * h1) / 36) * TAU;
    const c = Math.cos(th), s = Math.sin(th);
    const rin = (1 + 0.45 * h2) * lerp(1.35, 1, slam);
    const x0 = cx + c * rx * rin, y0 = cy + s * ry * rin;
    const x1 = cx + c * 760, y1 = cy + s * 760;
    const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l, ny = dx / l, w = 3 + 6 * h1;
    ctx.globalAlpha = 0.9 * a;
    ctx.fillStyle = HEX.ink;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1 + nx * w, y1 + ny * w);
    ctx.lineTo(x1 - nx * w, y1 - ny * w);
    ctx.closePath();
    ctx.fill();
    // The jade tip (the inner 16-34 px) and a hairline of emerald along the wedge so it reads on the inked pitch.
    const tl = 16 + 18 * h2;
    ctx.globalAlpha = a;
    ctx.strokeStyle = HEX.jade;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0 + (dx / l) * tl, y0 + (dy / l) * tl);
    ctx.stroke();
    ctx.globalAlpha = 0.45 * a;
    ctx.strokeStyle = HEX.emerald;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0 + (dx / l) * tl, y0 + (dy / l) * tl);
    ctx.lineTo(x0 + (dx / l) * (tl + 90), y0 + (dy / l) * (tl + 90));
    ctx.stroke();
  }
  ctx.restore();
}

/** The rivals' draw scale over their projected scale: the line LOOMS in the read. */
const LOOM_K = 1.4;

function render2b(env: Env, t: number) {
  const { ctx, fx, cam } = env;
  // The hard stop on the 26 M tick (cam.hit in the cue) shakes the whole frame; no zoom anywhere in the climb.
  zoomAbout(cam, 320, 180, 320, 180, 1 + punch(t, CLIMB_T1, 0.025, 0.015, 0.1));
  env.world();
  const v = view2b(t);
  const climb = ease.inOutCubic(clamp((t - CLIMB_T0) / (CLIMB_T1 - CLIMB_T0)));
  const P = (x: number, z: number, h = 0) => projectDecal(x, z, h, v);

  // ---- the world (inked): sky, the far stand, the masts above its roof, the pitch, the goal, the line, the keeper
  drawDownPitch(ctx, env.art.stadium, v, 30 + t, {});

  // The whole read is printed in Night Ink.
  nightInk(ctx, 0.85);

  // The sky over the far roof (it opens up in the climb): emerald-black printed as screentone, the masts standing in
  // it, the roof as a structure (ink fascia, a lit lip, the truss) along the top of the far stand.
  const standTop = P(1270, 257, 168).y;
  if (standTop > -40) {
    const sky = ctx.createLinearGradient(0, standTop - 360, 0, standTop);
    sky.addColorStop(0, '#020a07');
    sky.addColorStop(0.7, '#06180f');
    sky.addColorStop(1, HEX.night);
    ctx.fillStyle = sky;
    ctx.fillRect(-40, -60, VW + 80, standTop + 60);
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = inkTone(ctx);
    ctx.fillRect(-40, -60, VW + 80, standTop + 60);
    ctx.restore();
  }
  ctx.save();
  ctx.beginPath();
  ctx.rect(-40, -60, VW + 80, standTop + 60);
  ctx.clip();
  for (const m of MASTS) {
    const base = P(m.x, m.z, 0), head = P(m.x, m.z, m.h);
    const w = Math.max(3, 6 * head.s);
    ctx.fillStyle = '#0a0d14';
    ctx.beginPath();
    ctx.moveTo(base.x - w, base.y);
    ctx.lineTo(base.x + w, base.y);
    ctx.lineTo(head.x + w * 0.6, head.y);
    ctx.lineTo(head.x - w * 0.6, head.y);
    ctx.fill();
  }
  ctx.restore();
  const heads = MASTS.map((m) => P(m.x, m.z, m.h));
  // The far roof: the truss zigzag above, the lit lip, the ink fascia (drawn over the mast feet).
  if (standTop > -40 && standTop < VH + 40) {
    ctx.save();
    ctx.strokeStyle = '#1d3a30';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = -40; x < VW + 40; x += 40) {
      ctx.moveTo(x, standTop - 13);
      ctx.lineTo(x + 20, standTop - 33);
      ctx.lineTo(x + 40, standTop - 13);
    }
    ctx.moveTo(-40, standTop - 33);
    ctx.lineTo(VW + 40, standTop - 33);
    ctx.stroke();
    ctx.fillStyle = HEX.ink;
    ctx.fillRect(-40, standTop - 12, VW + 80, 12);
    ctx.fillStyle = '#2f6a50';
    ctx.fillRect(-40, standTop - 13, VW + 80, 2);
    ctx.restore();
  }
  // The far stand's crowd flashes (tiny, one at a time).
  const standFoot = P(1270, 257, 0).y;
  if (standFoot > standTop + 8) crowdTwinkles(ctx, -20, Math.max(-20, standTop + 6), VW + 40, standFoot - Math.max(-20, standTop + 6) - 4, t, 40);

  // The defenders (manga extras at 1.4x their projected scale, so the line looms: ink figures rim-lit mint, the white
  // shirts showing pale under the ink): set and watching him, then swivelled after his look (1.02) and shuffling toward
  // the far side; the Tower (1.3x) leans hardest. The keeper on his line behind them.
  PUPPETS.frame();
  const sw = t >= SWIVEL_T;
  const shuffle = ease.outCubic(clamp((t - SWIVEL_T) / 0.4));
  const kp = P(L.keeper.x, L.keeper.z, 0);
  PUPPETS.draw(ctx, 's2-keeper', KEEPER_KIT, KEEPER_POSE, PUP_K, -1, kp.x, kp.y - 40 * kp.s * 0.18 * LOOM_K, ((kp.s * 0.18) / PUP_K) * LOOM_K, 0.3, SIL);
  const rivalHeads: [number, number, number][] = [];
  for (const r of LINE) {
    const q = P(r.x, r.z + r.shift * shuffle, 0);
    if (q.y - 60 * q.s * 0.18 * LOOM_K > VH + 10) continue;
    const D = ((q.s * 0.18) / PUP_K) * LOOM_K;
    const hipY = q.y - 40 * q.s * 0.18 * LOOM_K;
    const lean = sw ? r.lean * ease.outBack(clamp((t - SWIVEL_T) / 0.12)) : 0;
    const pose = sw ? POSE_LOOK : POSE_SET;
    const name = `s2-${r.name}-${sw ? 'look' : 'set'}`;
    if (r.big) {
      ctx.save();
      ctx.translate(q.x, hipY);
      ctx.rotate(lean);
      ctx.scale(TOWER_BULK, 1.06);
      PUPPETS.draw(ctx, name, r.kit, pose, PUP_K, -1, 0, 0, D, 0.3, SIL);
      ctx.restore();
    } else PUPPETS.draw(ctx, name, r.kit, pose, PUP_K, -1, q.x, hipY, D, 0.3, SIL, 1, lean);
    rivalHeads.push([q.x, hipY - 52 * q.s * 0.18 * LOOM_K * (r.big ? 1.06 : 1), q.s]);
  }

  // ---- the lights (after the ink): the floodlight heads entering in the climb catch the chart's jade
  const [bx, by] = no10Point(env, seqAt(SEQ, t), 'ball', NO10_PELVIS[0], NO10_PELVIS[1] + heroSlide(t), SCAN, { anchor: 'pelvis' });
  const chart = chartPts(v, [bx, by], climb);
  const reveal = ease.inOutSine(clamp((t - CHART_T0) / (CHART_T1 - CHART_T0)));
  const shown = chart.slice(0, Math.max(2, Math.ceil(chart.length * reveal)));
  for (const hd of heads) {
    if (hd.y < -60 || hd.y > VH + 40) continue;
    const s = Math.max(0.45, hd.s * 0.7);
    const tint = reveal > 0 ? lampTintFor([hd.x, hd.y], shown) : 0;
    drawPylon(ctx, hd.x, hd.y - 14 * s, s, [tint, tint, tint * 0.8, tint * 0.6]);
    lampGlow(ctx, hd.x, hd.y, 13 * Math.max(0.6, hd.s), tint, 0.75);
  }

  // ---- the two forward threads from 2a (0.90-1.20): from his head over the defence to the crossbar and No.7's shoulder
  const key = seqAt(SEQ, t);
  const slide = heroSlide(t);
  const head = no10Point(env, key, 'head', NO10_PELVIS[0], NO10_PELVIS[1] + slide, SCAN, { anchor: 'pelvis' });
  const n7 = P(no7X(t), 338, 0);
  const n7Shoulder: [number, number] = [n7.x - 2, n7.y - 15 * n7.s];
  const bar = P(BAR.x, BAR.z, BAR.h);
  const fwd = 1 - sstep(1.1, 1.2, t);
  if (fwd > 0) {
    for (const [pin, w1] of [[[bar.x, bar.y], 2], [n7Shoulder, 2]] as const) {
      const pts = threadPts([head[0] + 4, head[1] + 6], pin, 0, 0, 10);
      loomThread(ctx, pts, 2, w1, fwd, 0.2);
      sparkle(ctx, pin[0], pin[1], 6 + 2 * Math.sin(t * 20), fwd, Math.PI / 4);
    }
  }

  // ---- No.7 tiny on the near side (Run boxed 0.4x, never graded)
  const runK = (['Run.R1', 'Run.R2', 'Run.R3', 'Run.R4', 'Run.R5', 'Run.R6', 'Run.R7', 'Run.R8'] as No7Key[])[Math.floor(sim * 12) % 8];
  drawNo7Boxed(env, runK, n7.x, n7.y, 0.4, { anchor: 'contact' });

  // ---- the swivel as a manga beat (1.02-1.22): focus lines slam in on the line, big swish marks trail every head
  if (rivalHeads.length && t >= SWIVEL_T && t < 1.22) {
    let cx = 0, cy = 0, x0 = Infinity, x1 = -Infinity;
    for (const [hx, hy] of rivalHeads) {
      cx += hx / rivalHeads.length;
      cy += hy / rivalHeads.length;
      x0 = Math.min(x0, hx);
      x1 = Math.max(x1, hx);
    }
    const fa = 1 - sstep(1.13, 1.22, t);
    focusLines(ctx, cx, cy + 10, (x1 - x0) / 2 + 46, 52, fa, ease.outCubic(clamp((t - SWIVEL_T) / 0.08)));
  }
  const sa = t >= SWIVEL_T ? 1 - clamp((t - SWIVEL_T) / 0.3) : 0;
  if (sa > 0) for (const [hx, hy, s] of rivalHeads) swish(ctx, hx + 8, hy, Math.max(1.4, s * 0.9), sa);

  // ---- the sightline (0.92-1.20): dashes tick from his head toward the far side
  if (t >= 0.92 && t < 1.24) {
    const n = Math.floor(clamp((t - 0.92) / 0.16) * 9);
    const fade = 1 - sstep(1.14, 1.24, t);
    const o: [number, number] = [head[0] - 10, head[1] - 4], e: [number, number] = [-20, 104];
    ctx.save();
    ctx.lineCap = 'round';
    for (let k = 0; k < n; k++) {
      const u0 = k / 9 + 0.02, u1 = u0 + 0.06;
      for (const [w, col] of [[4, HEX.ink], [2, HEX.jade]] as const) {
        ctx.globalAlpha = fade;
        ctx.strokeStyle = col;
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.moveTo(lerp(o[0], e[0], u0), lerp(o[1], e[1], u0));
        ctx.lineTo(lerp(o[0], e[0], u1), lerp(o[1], e[1], u1));
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // ---- the star chart (1.15-1.45) and the cross-stitch X beyond the line (locks at 1.42): the plan arches over the
  // line from the ball at his boot, rising from BEHIND him (he occludes it), and down onto the X
  const X = P(L.target.x, L.target.z, 0);
  if (t >= CHART_T0) {
    drawChart(ctx, chart, reveal, t, climb);
    const lock = t >= CHART_T1 ? 1 : 0;
    if (reveal > 0.9) {
      const pulse = 1 + 0.12 * Math.sin((t - CHART_T1) * 26);
      const s = 12 * (lock ? pulse : lerp(0.4, 1, (reveal - 0.9) / 0.1));
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.jade), X.x, X.y, 28, 0.35 + 0.2 * lock);
      ctx.restore();
      crossStitch(ctx, X.x, X.y, s, 1, 0.45);
    }
    if (lock) {
      const u = clamp((t - CHART_T1) / 0.3);
      stitchRing(ctx, X.x, X.y, lerp(6, 46, ease.outCubic(u)), 1 - u, { squash: 0.45, width: 2 });
    }
  }

  // ---- No.10 (never graded): the Scan back frames at x2.4, bottom-left, the ball at his foot; he slides out in the climb
  if (NO10_PELVIS[1] + slide - 140 < VH) {
    drawBall(env, spin, bx, by, 5, SCAN, 0, 0.35, 'pearl');
    drawNo10(env, key, NO10_PELVIS[0], NO10_PELVIS[1] + slide, SCAN, { anchor: 'pelvis' });
  }
  env.parts.draw(ctx, 1);

  // ---- post
  nightGrade(fx, { bloom: 1.0, thresh: 0.64 });
  // The climb's motion: a short vertical streak at its fastest (the frame slides down), the apex kept sharp.
  const vel = Math.sin(Math.PI * clamp((t - CLIMB_T0) / (CLIMB_T1 - CLIMB_T0)));
  const apex = chart[32];
  if (climb > 0 && climb < 1 && vel > 0.3) {
    fx.streak = 0.02 * (vel - 0.3) / 0.7;
    fx.streakDX = 0;
    fx.streakDY = 1;
    fx.streakHoleX = clamp(apex.x / VW);
    fx.streakHoleY = clamp(apex.y / VH);
    fx.streakHoleR = 0.08;
  }
}

// ================================================================ the shot

export const shotLoom: Shot = {
  name: 'The Loom',
  dur: 1.8,
  seed: 412,
  rate: RATE[2],
  cues: [
    { at: 0, fn: (e) => { e.sfx.crowd(1.8, 0.4); e.sfx.duck(0.3, 1.5); e.cam.shakeAmp = 8; } },
    { at: 0.05, fn: (e) => e.sfx.rumble(1.2, 0.35) },
    { at: LOOM_T, fn: (e) => { e.sfx.boom(0.6); e.sfx.bow(73.42, 1.5, 0.3, 110); e.sfx.zip(0.12, 400, 3000); e.cam.hit(0.35); } },
    // The twelve pins land (the money image's arrival).
    { at: LOOM_T + SHOOT, fn: (e) => e.sfx.shing(0.7) },
    { at: TICKS[0], fn: (e) => { e.sfx.tick(); e.sfx.pluck(293.66, 0.8, 0.3, LOOM[PLUCKED[0]].pan); e.cam.hit(0.15); } },
    { at: TICKS[1], fn: (e) => { e.sfx.tick(); e.sfx.pluck(369.99, 0.8, 0.3, LOOM[PLUCKED[1]].pan); e.cam.hit(0.15); } },
    { at: TICKS[2], fn: (e) => { e.sfx.tick(); e.sfx.pluck(440, 0.8, 0.3, LOOM[PLUCKED[2]].pan); e.cam.hit(0.15); } },
    { at: DECIDE_T, fn: (e) => { e.sfx.tick(0.6); e.sfx.zip(0.08, 3000, 700, 0.12); e.cam.hit(0.12); } },
    { at: 0.92, fn: (e) => { e.sfx.tick(); e.cam.shakeAmp = 6; } },
    { at: SWIVEL_T, fn: (e) => e.sfx.whoosh(0.15, 2000, 600, 0.2) },
    { at: 1.06, fn: (e) => e.sfx.tick() },
    { at: 1.2, fn: (e) => e.sfx.tick() },
    { at: CHART_T1, fn: (e) => e.sfx.pluck(587.33, 0.8, 0.4) },
    { at: CLIMB_T0, fn: (e) => { e.sfx.bow(293.66, 0.33, 0.2, 587.33); e.sfx.whoosh(0.33, 400, 2400, 0.3); } },
    { at: CLIMB_T1, fn: (e) => { e.sfx.tick(0.7); e.cam.hit(0.25); } },
  ],
  prepare(env) {
    warmMeridian(env);
    // Warm the puppet rasters (fixed k) and No.7's boxed run so the cut into 2b never hitches.
    const ctx = env.ctx;
    ctx.save();
    ctx.globalAlpha = 0;
    for (const pose of ['set', 'look'] as const) {
      const ps = pose === 'set' ? POSE_SET : POSE_LOOK;
      for (const r of LINE) PUPPETS.draw(ctx, `s2-${r.name}-${pose}`, r.kit, ps, PUP_K, -1, -999, -999, 1, 0.3, SIL);
    }
    PUPPETS.draw(ctx, 's2-keeper', KEEPER_KIT, KEEPER_POSE, PUP_K, -1, -999, -999, 1, 0.3, SIL);
    ctx.restore();
    warmNo7(env, ['Run.R1', 'Run.R2', 'Run.R3', 'Run.R4', 'Run.R5', 'Run.R6', 'Run.R7', 'Run.R8'], 0.4);
  },
  init(env) {
    env.sfx.clearBus();
    env.cam.set(VW / 2, VH / 2, 1, 0);
    env.cam.shakeRoll = 0.015;
    env.cam.shakeAmp = 8;
    PUPPETS.frame();
    spin = new BallSpin();
    sim = 0;
    fired.loom = fired.pins = fired.snap = fired.cut = fired.xlock = fired.climb = false;
  },
  update(env, t, dt) {
    sim += dt;
    const { rng } = env;
    // 2a's held tremor: trauma floor 0.20 -> 0.40.
    if (t < CUT_T) holdTrauma(env.cam, lerp(0.2, 0.4, t / CUT_T));
    else holdTrauma(env.cam, 0.08);
    // The ball rolls at his foot in 2b (slowed with the read).
    if (t >= CUT_T) spin.rotate(1, 0, 0.15, dt * 7);
    // The loom shoots: light-stitches flung off his eyes and fingertips along the threads.
    if (!fired.loom && t >= LOOM_T) {
      fired.loom = true;
      for (const n of ['eyeL', 'eyeR', 'tip2', 'tip5'] as const) {
        const [x, y] = bustPt(env, 'GZ2', n);
        stitchBurst(env, x, y, 6, 260, TAU, 0);
      }
    }
    // The pins land: a burst of light-stitches at every pin in the frame.
    if (!fired.pins && t >= LOOM_T + SHOOT) {
      fired.pins = true;
      for (const th of LOOM) {
        if (th.x < 0 || th.x > VW || th.y < 0 || th.y > VH) continue;
        stitchBurst(env, th.x, th.y, 5, 180, TAU, 0);
      }
    }
    // The decision: the hand strings SNAP at the GZ3 swap; a spray of light-stitches where each broken end appears.
    if (!fired.snap && t >= DECIDE_T) {
      fired.snap = true;
      for (const n of ['tip1', 'tip3', 'tip4', 'tip6'] as const) {
        const [x, y] = bustPt(env, 'GZ2', n);
        const th = LOOM.find((q) => q.from === n)!;
        stitchBurst(env, lerp(x, th.x, 0.6), lerp(y, th.y, 0.6), 4, 200, TAU, 0);
      }
    }
    // The hard cut to the read: nothing of 2a's light-stitches survives into the other camera.
    if (!fired.cut && t >= CUT_T) {
      fired.cut = true;
      env.parts.clear();
    }
    // The X locks beyond the line: a few stitches flung off it.
    if (!fired.xlock && t >= CHART_T1) {
      fired.xlock = true;
      const X = projectDecal(L.target.x, L.target.z, 0, view2b(t));
      for (let i = 0; i < 10; i++) {
        const a = rng.range(0, TAU), s = rng.range(60, 160);
        env.parts.spawn({ kind: PK.Stitch, x: X.x, y: X.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.45, drag: 3, max: rng.range(0.25, 0.5), s0: 4, s1: 2, ramp: 'jade', r0: 0.1, r1: 0.8, a0: 1, a1: 0, add: false });
      }
    }
    // The crane leaves the X behind: its screen-space stitches must not float up the sky with the climb.
    if (!fired.climb && t >= CLIMB_T0 + 0.04) {
      fired.climb = true;
      env.parts.clear();
    }
  },
  render(env, t) {
    const ctx = env.ctx;
    env.screen();
    ctx.fillStyle = HEX.night;
    ctx.fillRect(0, 0, VW, VH);
    if (t < CUT_T) render2a(env, t);
    else render2b(env, t);
    assertMeridianFx(env.fx);
  },
};

/**
 * 2a's opening frame (the GZ3 bust on the loom backdrop, in colour, before the ink falls) for shot 1's needle's-eye
 * iris to cache in its prepare(): draw it into a 640 x 360 canvas so the iris opens onto exactly this picture.
 */
export function loomStill(env: Env): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = VW;
  c.height = VH;
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  const e2: Env = { ...env, ctx: g, screen: () => g.setTransform(1, 0, 0, 1, 0, 0), world: () => g.setTransform(1, 0, 0, 1, 0, 0) };
  backdrop2a(e2, 0);
  drawNo10(e2, 'GZ3', CHEST[0], CHEST[1], BUST, { anchor: 'chest' });
  return c;
}

