// MERIDIAN THREAD v2 · shot 4 · "Meridian Ride" (2.4 s, seed 414, global 5.1-7.5): THE BALL SHOWCASE. SPEC.md shot 4.
//
// The ride world (side elevation, X = (x - 772)·3, Y = -h·4): the ball, the stroke and its hem live on it at parallax 1
// (the camera locks the ball with kit.keys rows); the stadium is drawn in screen space as parallax layers keyed on the
// camera and on an "elevation" e(t) (0 = the low wide, 1 = up at floodlight height): the ink-green sky, the far stand (the
// crowd under its roof, parallax 0.24) with a row of floodlight masts whose lamp heads catch the arc's jade (lampTintFor,
// passive, smooth), the pitch far below (the 2.5D field strip at parallax 0.45, pivoted on the ball so each defender passes
// under it at his own u: D1 1.78, the Tower 1.94, D3 2.02, D4 2.14; a thin strip in the bottom 40-60 px with 24-28 px
// figures, so the far stand fills the long drop between it and the ball), the near stand's roof edge (parallax 0.7,
// crossing the frame bottom 0.9-1.7) and one foreground floodlight pylon (parallax 1.4).
//
//   0.00-0.40  WIDE REVEAL: the whip-tilt carries in (shared streak 0.10 -> 0 up over 0.30, the ball kept sharp) and settles
//              on the wide, a floodlit stadium (the lamps' spill on the crowd, Night Ink 0.55): No.10 small at bottom-left
//              in the monument (LF4 / LF4b boxed 0.4x, inked with a 1 px outline, backlit jade), the Meridian climbing out
//              from in front of his raised boot past the floodlight row, the line small on the right; the hem unfurls.
//   0.40-1.00  THE CATCH, a chase-crane: the lock leaves the ball's free screen point with its own velocity (Hermite) and
//              pulls it from the top edge to (392, 176) while the zoom rushes 0.82 -> 1.50 (outCubic: front-loaded, a
//              crane-rush streak 0.40-0.65, the ball past 40 px by 0.6 and big into the pylon); the stand falls away below, the
//              lamp row comes down to our level, the ball grows 12 -> 72 px. 0.55-0.95 THE PYLON whips past the foreground:
//              its lattice mast slides by the ball, then its 8 x 4 lamp grid (re-cut in ink so the grid reads through the
//              glow) catches the stroke's jade light as it sweeps past (one JADE_FLARE <= 120 px); streak 0.06 along its
//              motion with the hole on the ball; cam.hit 0.35, boom. 1.00 the lock lands: a +0.05 punch, two stitched rings
//              (3 px on ink under-rings, to 220 / 170 px) snap round the ball, light-stitches, a shock, zip + tick + boom 0.55.
//              0.9-1.7 the near stand's roof edge slides past under us and sinks away (ink slab, lit fascia, lamp heads).
//   1.00-1.70  THE RIDE: the ball at 72 px (r12 at integer x3), backspin + sidespin, seams glowing jade, two ink spin marks
//              with mint edges, pearl motes shedding 40/s; behind it the Meridian (75 px body, 180 px soft halo, ink
//              under-stroke, dry-brush edges and emerald brush hair, bristles, mint inner, the pearl thread with glints
//              running to the ball, cross-stitches, pearl star-chart ticks every 5 m, stitch-hole stars popping behind the
//              ball); the aurora hem hangs under it and its jade light pools on the pitch far below; lamp heads catch the
//              jade as they pass; ink and mint wind streaks rush down-left (10+, longer); a held flight tremor (~1 px).
//   1.70-2.22  OVER THE LINE (rate 0.45, the ball eased up to y 150 so the line reads far below): the back four (ink
//              silhouettes, manga extras) slide under the ball one by one, each AFRAID: his head snaps back (craneUp, a
//              flinch jolt and a tremble), rim-lit mint from above as the hem's light reaches him; every pass plucks the
//              string (E5 F#5 A5 B5) as a beat (+0.035 zoom punch, cam.hit 0.12): the stroke rings in a 2-node standing wave
//              (canvas 12 px + the shader pluck warp along it, 9 Hz, decay 0.3 s), a bright 40 px pulse of the thread core
//              runs back down it and light-stitches drip off it. As the light reaches each man his face comes out of the
//              ink (full colour, mint under the chin, the mouth hanging open). The Tower alone sinks into a jump load
//              (crouch, 1.3 x 1.15 bulk, the teal armband), two jade glints on the ball: not afraid (the villain is planted).
//   2.22-2.40  THE SNAP: the ball slows into the apex and turns white-hot; the camera crashes into its pearl core (zoom
//              1.36 -> 3.4 and the lock -> (320, 212), inCubic so the push reads before the white); manga focus lines rush
//              in (ink, jade-tipped); a radial of light grows out of the ball (emerald and jade rim in normal blend under
//              the white-hot ball, the mint core additive) and the mint
//              whiteout (fx.flash mint 0 -> 0.85 over 2.30-2.38, fx.fullFrame from 2.33: F3 / F4 at global 7.43) fills the
//              frame; shot 5 clears it outward from the ball.
//
// Roll 0 (shakeRoll 0.015). Night Ink 0.55 -> 0.85 over 0.3-1.0 (the wide reads as a lit stadium), with the stroke band and a pool on
// the pitch under the ball restored; No.10, the ball, the stroke, the hem and the lamp heads are drawn after the ink. Flash
// budget: only F3 / F4. The pluck warp is a displacement at 9 Hz; lens flares stay local (<= 120 px).

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import type { Camera } from '../../engine/camera';
import { BallSpin } from '../../engine/pixel';
import { TAU, clamp, ease, lerp, noise1 } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import { focusLines, lensFlare, sparkle, spinMarks, type TrailPt } from '../../art/fx';
import { POSES, P, RIVAL_KIT, RIVAL_KIT_C, RIVAL_KIT_D, KEEPER_KIT, joints, type Kit, type Pose } from '../../art/puppet';
import { drawPylon, type Stadium } from '../../art/stadium';
import { drawNo10Boxed, no10, warmNo10Boxed, type No10Key } from '../../art/no10';
import { drawBall, holdTrauma, keys, punch, pushShock, type KeyRow } from '../kit';
import {
  HEX, JADE_FLARE, LAYOUT, MINT_FLASH, PAL, PUPPETS, RATE, TOWER_BULK, StitchRings, arcAt, arcDir, assertMeridianFx,
  ballU, ctrlThrough, lampTintFor, meridianFlash, nightGrade, nightInk, resetSpin, rideXY, setPluck, stitchBurst, threadLine,
  warmMeridian, whip, type NightMaskFn,
} from './common';

const DUR = 2.4;
/** The stroke body's jade (the palette jade with its blue held down so the bloomed body stays jade, never cyan). */
const BODY_JADE = 'rgb(47,224,115)';
const DEG = Math.PI / 180;

// ================================================================ timing

/** The four passes over the line (the ball's u keys: D1 0.59, the Tower 0.655, D3 0.68, D4 0.713) and their plucks. */
const PASS = [1.78, 1.94, 2.02, 2.14] as const;
const PASS_HZ = [659.26, 739.99, 880, 987.77] as const;
const LOCK_T = 1.0;
const SNAP_T = 2.22;

// ================================================================ the ball on the arc (ride world)

interface BallPt {
  u: number;
  X: number;
  Y: number;
}
function ballAt(t: number): BallPt {
  const u = ballU(4, t);
  const a = arcAt(u);
  const [X, Y] = rideXY(a.x, a.h);
  return { u, X, Y };
}

/** The arc sampled on a fixed u grid (ride world + metres along it), so every per-point detail is stable as it grows. */
const DU = 0.004;
const GRID: { u: number; X: number; Y: number; m: number }[] = (() => {
  const out: { u: number; X: number; Y: number; m: number }[] = [];
  let m = 0, px = 0, ph = 0;
  for (let k = 0; k * DU <= 0.7201; k++) {
    const u = k * DU;
    const a = arcAt(u);
    if (k) m += Math.hypot(a.x - px, a.h - ph) / 10;
    px = a.x;
    ph = a.h;
    const [X, Y] = rideXY(a.x, a.h);
    out.push({ u, X, Y, m });
  }
  return out;
})();

// ================================================================ the camera

const hermite = (p0: number, m0: number, p1: number, m1: number, s: number) => {
  const s2 = s * s, s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * p0 + (s3 - 2 * s2 + s) * m0 + (-2 * s3 + 3 * s2) * p1 + (s3 - s2) * m1;
};
/** The catch rushes early (outCubic: the ball passes 40 px by 0.6 and lands big into the pylon), then holds for the lock. */
const ZOOM: KeyRow[] = [[0, 0.8], [0.4, 0.82, 'outSine'], [LOCK_T, 1.5, 'outCubic'], [SNAP_T, 1.36, 'inOutSine'], [DUR, 3.4, 'inCubic']];
/** The beats on the zoom: the lock landing (+0.05) and each pluck over the line (+0.035). */
const zoomBeats = (t: number) =>
  punch(t, LOCK_T, 0.05, 0.03, 0.22) + PASS.reduce((a, p) => a + punch(t, p, 0.035, 0.03, 0.2), 0);
/** The free key (the whip carrying in, settling): world (312, -187) -> (318, -215), outCubic. */
const FREE_X: KeyRow[] = [[0, 308], [0.4, 316, 'outCubic']];
const FREE_Y: KeyRow[] = [[0, -198], [0.4, -206, 'outCubic']];
/** The ball's screen point under the free key at 0.40 and its screen velocity there (the catch starts from it). */
const CATCH0 = (() => {
  const b0 = ballAt(0.4), b1 = ballAt(0.4 - 1 / 120);
  const z = 0.82;
  const p = [320 + (b0.X - 316) * z, 180 + (b0.Y + 206) * z];
  const v = [(b0.X - b1.X) * z * 120, (b0.Y - b1.Y) * z * 120];
  return { p, v };
})();
const RIDE_LX: KeyRow[] = [[LOCK_T, 392], [SNAP_T, 330, 'inOutSine'], [DUR, 320, 'inCubic']];
const RIDE_LY: KeyRow[] = [[LOCK_T, 176], [1.72, 150, 'inOutSine'], [SNAP_T, 160, 'inOutSine'], [DUR, 212, 'inCubic']];

interface CamKey {
  x: number;
  y: number;
  z: number;
  /** The ball's lock point on screen (before shake). */
  lx: number;
  ly: number;
  b: BallPt;
}
function camAt(t: number): CamKey {
  const z = keys(ZOOM, t) + zoomBeats(t);
  const b = ballAt(t);
  if (t <= 0.4) {
    const x = keys(FREE_X, t), y = keys(FREE_Y, t);
    return { x, y, z, lx: 320 + (b.X - x) * z, ly: 180 + (b.Y - y) * z, b };
  }
  let lx: number, ly: number;
  if (t < LOCK_T) {
    // The catch: the lock point leaves the ball's free screen point with its own velocity and lands on (392, 176).
    const T = LOCK_T - 0.4, s = (t - 0.4) / T;
    lx = hermite(CATCH0.p[0], CATCH0.v[0] * T * 0.6, 392, 0, s);
    ly = hermite(CATCH0.p[1], CATCH0.v[1] * T * 0.6, 176, 0, s);
  } else {
    lx = keys(RIDE_LX, t);
    ly = keys(RIDE_LY, t);
  }
  return { x: b.X - (lx - 320) / z, y: b.Y - (ly - 180) / z, z, lx, ly, b };
}

// ================================================================ the stadium layers (screen space, keyed on elevation)

/** Elevation 0 (the low wide) -> 1 (up at floodlight height). */
const ELEV: KeyRow[] = [[0, 0], [0.4, 0.06, 'inQuad'], [LOCK_T, 0.8, 'outCubic'], [SNAP_T, 1, 'inOutSine']];
/** Screen y of the pitch row under the ball's plane (z 276): the pitch stays a thin strip in the bottom 40-60 px, so the
 *  far stand fills the long drop between it and the ball (the ball reads 17-25 m up). */
const ANCHOR_Y: KeyRow[] = [[0, 331], [0.4, 343, 'outCubic'], [LOCK_T, 338, 'outCubic'], [SNAP_T, 336, 'inOutSine']];
/** Parallax of the pitch far below, the far stand, the foreground pylon. */
const PB = 0.45;
const PS = 0.24;
const PP = 1.4;
const Z_PLANE = 276;

interface Stage {
  t: number;
  cam: Camera;
  k: CamKey;
  /** Shake offset (screen px) the world transform adds; screen layers add it too. */
  shx: number;
  shy: number;
  e: number;
  anchorY: number;
  /** Pitch rows: screen y per field px of z. */
  vz: number;
  /** Pitch columns: screen px per field px of x. */
  sb: number;
  /** The pitch layer's x offset (pivots it on the ball's screen x, so each defender passes under it at his u). */
  off: number;
  farY: number;
  roofY: number;
  mastH: number;
  ball: { x: number; y: number };
  /** Ball draw scale (screen px per art px of the r12 ball) and radius on screen. */
  sc: number;
}

function stageAt(env: Env, t: number): Stage {
  const cam = env.cam;
  const k = camAt(t);
  cam.set(k.x, k.y, k.z, 0);
  const [ux, uy] = cam.toUV(k.x, k.y);
  const shx = ux * VW - VW / 2, shy = uy * VH - VH / 2;
  const e = keys(ELEV, t);
  const anchorY = keys(ANCHOR_Y, t) + shy;
  const vz = lerp(0.13, 0.34, e);
  const sb = 3 * k.z * PB;
  const lxOff = t < LOCK_T ? 392 : k.lx;
  const off = (lxOff - 320) * (1 - PB) + shx;
  const farY = anchorY + (172 - Z_PLANE) * vz;
  const roofY = farY - lerp(205, 74, e);
  // The lamp heads stand well above the ball's line at the ride (the ball stays the brightest point).
  const mastH = lerp(56, 140, e);
  const [bx, by] = cam.toUV(k.b.X, k.b.Y);
  let sc: number;
  if (t < 0.4) sc = 0.6 * k.z;
  else if (t < LOCK_T) sc = lerp(0.6, 2.0, ease.outCubic((t - 0.4) / (LOCK_T - 0.4))) * k.z;
  else if (t < SNAP_T) sc = 3;
  else sc = (3 * k.z) / 1.36;
  return { t, cam, k, shx, shy, e, anchorY, vz, sb, off, farY, roofY, mastH, ball: { x: bx * VW, y: by * VH }, sc };
}

/** Screen x of field x on the pitch layer; screen y of field z (feet row). */
const pitchX = (s: Stage, xf: number) => 320 + ((xf - 772) * 3 - s.k.x) * s.k.z * PB + s.off;
const pitchY = (s: Stage, zf: number) => s.anchorY + (zf - Z_PLANE) * s.vz;
/** Screen x of a far-stand layer coordinate. */
const standX = (s: Stage, X: number) => 320 + (X - s.k.x) * s.k.z * PS + s.shx;

/** The far floodlight masts along the roof (far-stand layer units) and their head scale. */
const MAST_EVERY = 560;
function farMasts(s: Stage): { x: number; y: number; sc: number }[] {
  const out: { x: number; y: number; sc: number }[] = [];
  const sc = lerp(0.5, 0.82, s.e);
  const first = Math.floor((s.k.x - 420 / (s.k.z * PS)) / MAST_EVERY) - 1;
  for (let i = first; i < first + 40; i++) {
    const x = standX(s, i * MAST_EVERY + 230);
    if (x < -80) continue;
    if (x > VW + 80) break;
    out.push({ x, y: s.roofY - s.mastH, sc });
  }
  return out;
}

const SKY_TOP = '#061a13';
const SKY_LOW = '#1a4a37';

function drawSky(ctx: CanvasRenderingContext2D, s: Stage) {
  const g = ctx.createLinearGradient(0, 0, 0, Math.max(40, s.roofY + 20));
  g.addColorStop(0, SKY_TOP);
  g.addColorStop(1, SKY_LOW);
  ctx.fillStyle = g;
  ctx.fillRect(-8, -8, VW + 16, VH + 16);
  // The floodlit haze over the far roof (it goes under the ink with the rest of the world).
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf([60, 90, 70]), VW / 2, s.roofY, 520, 0.35, 1.6, 0.3);
  ctx.globalCompositeOperation = 'source-over';
}

function drawFarStand(ctx: CanvasRenderingContext2D, st: Stadium, s: Stage) {
  const top = s.roofY, bot = s.farY - 4;
  if (bot <= top) return;
  // The stand's mass and the crowd under the roof (squashed as we rise above it).
  ctx.fillStyle = '#22402f';
  ctx.fillRect(-8, top, VW + 16, bot - top + 2);
  const ch = (bot - top) * 0.86;
  const cw = st.crowd.width * (ch / st.crowd.height) * 0.55;
  const x0 = standX(s, 0) % cw;
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.imageSmoothingEnabled = true;
  for (let x = x0 - cw; x < VW + cw; x += cw) ctx.drawImage(st.crowd, x, bot - ch, cw, ch);
  // Drained to ink-green before the Night Ink (restored colour then reads as light on the stand, not confetti).
  ctx.globalAlpha = 0.85;
  ctx.globalCompositeOperation = 'saturation';
  ctx.fillStyle = 'rgb(128,128,128)';
  ctx.fillRect(-8, top, VW + 16, bot - top + 4);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#06140f';
  ctx.fillRect(-8, top, VW + 16, bot - top + 4);
  ctx.restore();
  // The floodlights' spill on the crowd (strongest in the low wide, where the stand is the picture; a soft wash and a
  // soft round pool under each lamp head, never a shaft), so the wide reads as a lit stadium under the Night Ink.
  const spill = lerp(1, 0.4, clamp(s.e / 0.8));
  ctx.globalCompositeOperation = 'lighter';
  const wash = ctx.createLinearGradient(0, top, 0, bot);
  wash.addColorStop(0, `rgba(80,112,94,${0.55 * spill})`);
  wash.addColorStop(0.55, `rgba(62,92,76,${0.42 * spill})`);
  wash.addColorStop(1, `rgba(46,70,58,${0.3 * spill})`);
  ctx.fillStyle = wash;
  ctx.fillRect(-8, top, VW + 16, bot - top + 2);
  for (const m of farMasts(s)) drawGlow(ctx, glowOf([90, 120, 100]), m.x, top + (bot - top) * 0.3, 90 + 60 * (1 - s.e), 0.4 * spill, 1.3, 0.4);
  ctx.globalCompositeOperation = 'source-over';
  // Tier lines.
  ctx.fillStyle = 'rgba(2,8,5,0.55)';
  for (let k = 1; k < 5; k++) ctx.fillRect(-8, Math.round(lerp(top, bot, k / 5) + 6), VW + 16, 1);
  // The roof slab with its fascia and the shade it throws on the top rows.
  const rh = lerp(18, 12, s.e);
  const shade = ctx.createLinearGradient(0, top, 0, top + (bot - top) * 0.5);
  shade.addColorStop(0, 'rgba(2,6,4,0.9)');
  shade.addColorStop(1, 'rgba(2,6,4,0)');
  ctx.fillStyle = shade;
  ctx.fillRect(-8, top, VW + 16, (bot - top) * 0.5);
  ctx.fillStyle = '#020604';
  ctx.fillRect(-8, top - rh, VW + 16, rh + 3);
  ctx.fillStyle = '#2a4a3c';
  ctx.fillRect(-8, Math.round(top - rh), VW + 16, 1);
  // Advertising boards along the far touchline.
  ctx.fillStyle = '#0d1d16';
  ctx.fillRect(-8, bot - 3, VW + 16, 5);
}

/** The pitch far below: the 2.5D field strip (field x along, z down), pivoted on the ball. */
function drawPitch(ctx: CanvasRenderingContext2D, st: Stadium, s: Stage) {
  const x0 = pitchX(s, 0), y0 = pitchY(s, 172);
  const w = st.pitch.width * s.sb, h = st.pitch.height * s.vz;
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(st.pitch, x0, y0, w, h);
  ctx.restore();
  // The goal far right (posts at z 214 / 300, bar at 2.44 m): small and white, it goes under the ink.
  const gx = pitchX(s, LAYOUT.finish.x), ytop = 24.4 * s.sb;
  if (gx < VW + 40) {
    const yf = pitchY(s, 214), yn = pitchY(s, 300);
    ctx.strokeStyle = '#e8eef0';
    ctx.lineWidth = Math.max(1, s.sb * 0.9);
    ctx.beginPath();
    ctx.moveTo(gx, yf);
    ctx.lineTo(gx, yf - ytop);
    ctx.lineTo(gx, yn - ytop);
    ctx.lineTo(gx, yn);
    ctx.stroke();
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let k = 1; k < 6; k++) {
      const yy = lerp(yf, yn, k / 6);
      ctx.moveTo(gx, yy - ytop);
      ctx.lineTo(gx + 3.4 * s.sb, yy - ytop * 0.4);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

// ================================================================ the line far below (cached puppet silhouettes)

interface Rival {
  name: string;
  kit: Kit;
  x: number;
  z: number;
  pass: number;
  big?: boolean;
  keeper?: boolean;
}
const LINE: Rival[] = [
  { name: 'd1', kit: RIVAL_KIT, x: LAYOUT.d1.x, z: LAYOUT.d1.z, pass: PASS[0] },
  { name: 'tower', kit: RIVAL_KIT, x: LAYOUT.tower.x, z: LAYOUT.tower.z, pass: PASS[1], big: true },
  { name: 'd3', kit: RIVAL_KIT_C, x: LAYOUT.d3.x, z: LAYOUT.d3.z, pass: PASS[2] },
  { name: 'd4', kit: RIVAL_KIT_D, x: LAYOUT.d4.x, z: LAYOUT.d4.z, pass: PASS[3] },
];
const KEEPER: Rival = { name: 'gk', kit: KEEPER_KIT, x: 1160, z: 262, pass: 9, keeper: true };
/** Watching the flight (set, chin up), then the fear (craneUp: head right back, mouth open, arms limp). */
const POSE_WATCH: Pose = P({ ...POSES.jockey, torso: 8 * DEG, head: -26 * DEG });
const POSE_FEAR: Pose = P({ ...POSES.craneUp, torso: -16 * DEG, head: -62 * DEG, armN: -14 * DEG, elbowN: 24 * DEG, armF: 16 * DEG, elbowF: 24 * DEG, kneeN: 16 * DEG, kneeF: 18 * DEG });
/** The Tower: set, then sinking into a jump load with his eyes locked on the ball (the only one not afraid). */
const POSE_TSET: Pose = P({ ...POSES.jockey, torso: 14 * DEG, head: -30 * DEG });
const POSE_TLOAD: Pose = P({ ...POSES.crouch, torso: 22 * DEG, head: -64 * DEG, armN: -40 * DEG, armF: -60 * DEG });
const POSE_GK: Pose = POSES.gkReady;
const PUP_K = 0.5;
/** Puppet units from the hip down to the soles (standing). */
const footOf = (p: Pose) => {
  const j = joints(p);
  return Math.max(j.toeN[1], j.toeF[1], j.ankleN[1]) + 2;
};
/** Manga extras: ink silhouettes with a dim emerald rim; the arc's light adds a mint rim from above (lighter, black fill). */
const SIL_DIM = { fill: PAL.ink, rim: [30, 110, 76] as [number, number, number], rim2: [12, 50, 34] as [number, number, number], lx: 0.25, ly: -1 };
const SIL_LIT = { fill: [0, 0, 0] as [number, number, number], rim: PAL.mint, rim2: [20, 110, 70] as [number, number, number], lx: 0.25, ly: -1 };

function poseOf(r: Rival, t: number): { name: string; pose: Pose } {
  if (r.keeper) return { name: 's4-gk', pose: POSE_GK };
  const after = t >= r.pass - 0.03;
  if (r.big) return after ? { name: 's4-tower-load', pose: POSE_TLOAD } : { name: 's4-tower-set', pose: POSE_TSET };
  return after ? { name: `s4-${r.name}-fear`, pose: POSE_FEAR } : { name: `s4-${r.name}-watch`, pose: POSE_WATCH };
}

/** The Tower's vertical stretch on the pitch layer (1.3x bulk wide, 1.15x tall: he towers over the line). */
const TOWER_TALL = 1.15;
/** The captain's armband in the Rivals model colours (B top light / t body / C under-edge). */
const ARMBAND = ['rgb(90,230,210)', 'rgb(40,190,170)', 'rgb(20,110,110)'] as const;

function drawRival(ctx: CanvasRenderingContext2D, s: Stage, r: Rival, light: number, pass: 'body' | 'light') {
  const t = s.t;
  const { name, pose } = poseOf(r, t);
  const x = pitchX(s, r.x), y = pitchY(s, r.z);
  if (x < -40 || x > VW + 40) return;
  // Figure height ~ 24-28 px: small and far below, so the ball reads 17-25 m up (from the k 0.5 cache).
  const D = Math.min(0.6, (s.sb * 13) / (93 * PUP_K));
  const big = r.big ? TOWER_BULK : 1;
  const tall = r.big ? TOWER_TALL : 1;
  // The fear jolt: a 4 px flinch back as the head snaps up; the Tower sinks.
  const since = t - r.pass;
  const jolt = since > -0.03 && since < 0.12 ? Math.sin(clamp((since + 0.03) / 0.15) * Math.PI) : 0;
  const tremble = since > 0 && !r.big && !r.keeper ? Math.sin(t * 70 + r.x) * 0.6 : 0;
  const hipY = y - footOf(pose) * PUP_K * D * tall - (r.big ? 0 : jolt * 4);
  const hx = x + (r.big ? 0 : jolt * 3) + tremble;
  const ox = Math.round(hx), oy = Math.round(hipY);
  const kd = PUP_K * D;
  if (pass === 'body') {
    // An ink silhouette (manga extra) with a short ink shadow on the lit turf.
    ctx.fillStyle = HEX.ink;
    ctx.globalAlpha = 0.45 + 0.3 * light;
    ctx.beginPath();
    ctx.ellipse(ox + 3, Math.round(y), 9 * D * big, 2.5 * D, 0, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.translate(ox, oy);
    ctx.scale(big, tall);
    PUPPETS.draw(ctx, name, r.kit, pose, PUP_K, -1, 0, 0, D, 0, SIL_DIM);
    ctx.restore();
    if (r.big) drawArmband(ctx, pose, ox, oy, D);
    return;
  }
  const j = joints(pose);
  // Head centre (screen) and the face's forward direction (the puppet faces west: x mirrored).
  const headX = ox - j.head[0] * kd * big, headY = oy + j.head[1] * kd * tall;
  const a = pose.torso + pose.head;
  const fwd: [number, number] = [-Math.cos(a), Math.sin(a)];
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.translate(ox, oy);
  ctx.scale(big, tall);
  // The arc's light from above: the lit silhouette added on top (its mint rim becomes a rim light).
  if (light > 0.01) {
    ctx.globalCompositeOperation = 'lighter';
    PUPPETS.draw(ctx, name, r.kit, pose, PUP_K, -1, 0, 0, D, 0, SIL_LIT, light);
    if (light > 0.5) PUPPETS.draw(ctx, name, r.kit, pose, PUP_K, -1, 0, 0, D, 0, SIL_LIT, (light - 0.5) * 1.2);
    ctx.globalCompositeOperation = 'source-over';
  }
  // The face comes out of the ink as the hem's light reaches it: the full-colour head inside a small circle.
  if (light > 0.3 && !r.keeper) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(-j.head[0] * kd, j.head[1] * kd, 9 * kd, 0, TAU);
    ctx.clip();
    PUPPETS.draw(ctx, name, r.kit, pose, PUP_K, -1, 0, 0, D, 1, undefined, clamp((light - 0.3) / 0.4));
    ctx.restore();
  }
  ctx.restore();
  if (r.keeper || light <= 0.05) return;
  // Under-lit jade: a mint glow just below the chin.
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.mint), headX + fwd[0] * 2 * D, headY + 4 * D + 2, 6 * D + 3, 0.32 * light);
  drawGlow(ctx, glowOf(PAL.jade), headX, headY, 7 * D + 3, 0.22 * light);
  ctx.globalCompositeOperation = 'source-over';
  if (light <= 0.3) return;
  if (r.big) {
    // The Tower is not afraid: two 1 px jade eye glints aimed at the ball.
    const bx = s.ball.x - headX, by = s.ball.y - headY, bl = Math.hypot(bx, by) || 1;
    const ex = headX + (bx / bl) * 2.2 * D * 2, ey = headY + (by / bl) * 2.2 * D * 2;
    ctx.globalAlpha = clamp(light * 1.4);
    ctx.fillStyle = HEX.jade;
    ctx.fillRect(Math.round(ex - 1), Math.round(ey), 1, 1);
    ctx.fillRect(Math.round(ex + 1), Math.round(ey), 1, 1);
    ctx.fillStyle = HEX.pearl;
    ctx.globalAlpha = clamp(light) * 0.8;
    ctx.fillRect(Math.round(ex + 1), Math.round(ey - 1), 1, 1);
    ctx.globalAlpha = 1;
  } else if (t >= r.pass - 0.03) {
    // Afraid: the mouth hangs open (a 2x2 ink hole low on the upturned face).
    const nx = -fwd[1], ny = fwd[0];
    const mx = headX + (fwd[0] * 0.55 + nx * -0.3) * 12 * kd, my = headY + (fwd[1] * 0.55 + ny * -0.3) * 12 * kd;
    ctx.globalAlpha = clamp((light - 0.3) / 0.3);
    ctx.fillStyle = HEX.ink;
    ctx.fillRect(Math.round(mx - 1), Math.round(my - 1), 2, 2);
    ctx.globalAlpha = 1;
  }
}

/** The Tower's captain's armband (3 px tall, the model's teal B / t / C rows) on the far upper arm. */
function drawArmband(ctx: CanvasRenderingContext2D, pose: Pose, hx: number, hipY: number, D: number) {
  const j = joints(pose);
  const kd = PUP_K * D;
  const sx = j.neck[0], sy = j.neck[1], hx2 = j.handF[0], hy2 = j.handF[1];
  const bx = -(sx + (hx2 - sx) * 0.35) * kd * TOWER_BULK, by = (sy + (hy2 - sy) * 0.35) * kd * TOWER_TALL;
  const w = Math.max(3, Math.round(5 * kd * TOWER_BULK));
  const x0 = Math.round(hx + bx - w / 2), y0 = Math.round(hipY + by - 1);
  for (let k = 0; k < 3; k++) {
    ctx.fillStyle = ARMBAND[k];
    ctx.fillRect(x0, y0 + k, w, 1);
  }
}

// ================================================================ the Meridian (screen space)

interface StrokePt extends TrailPt {
  /** Grid index (stable per-point details), -1 for the ball point. */
  k: number;
  /** Metres along the arc. */
  m: number;
}

/** The visible stroke: the grid behind the ball plus the ball's own point, in screen px (the world transform's mapping). */
function strokePts(s: Stage): StrokePt[] {
  const cam = s.cam;
  const out: StrokePt[] = [];
  const u = s.k.b.u;
  // Over the wide the stroke leaves from in front of No.10's raised boot, never painting over him.
  const u0 = s.t < 0.62 ? 0.014 : -1;
  for (let k = 0; k < GRID.length && GRID[k].u < u - 1e-6; k++) {
    const g = GRID[k];
    if (g.u < u0) continue;
    const [x, y] = cam.toUV(g.X, g.Y);
    out.push({ x: x * VW, y: y * VH, k, m: g.m });
  }
  const last = GRID[Math.max(0, out.length - 1)];
  const a = arcAt(u);
  out.push({ x: s.ball.x, y: s.ball.y, k: -1, m: last.m + Math.hypot(a.x - arcAt(last.u).x, a.h - arcAt(last.u).h) / 10 });
  return out;
}

const hash = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

interface PluckState {
  /** Canvas displacement amplitude (px) and its phase factor (already decayed). */
  amp: number;
  /** Arc length (px, back from the ball) of the ringing segment. */
  len: number;
}

/** Plucked copy of the stroke: a 2-node standing wave on the segment `len` px behind the ball. */
function plucked(P: StrokePt[], pl: PluckState): StrokePt[] {
  if (Math.abs(pl.amp) < 0.05 || P.length < 3) return P;
  const n = P.length;
  const back: number[] = new Array(n).fill(0);
  for (let i = n - 2; i >= 0; i--) back[i] = back[i + 1] + Math.hypot(P[i + 1].x - P[i].x, P[i + 1].y - P[i].y);
  return P.map((q, i) => {
    const d = back[i];
    if (d >= pl.len || i === n - 1) return q;
    const A = P[Math.max(0, i - 1)], B = P[Math.min(n - 1, i + 1)];
    const tl = Math.hypot(B.x - A.x, B.y - A.y) || 1;
    const w = pl.amp * Math.sin((2 * Math.PI * d) / pl.len);
    return { ...q, x: q.x - ((B.y - A.y) / tl) * w, y: q.y + ((B.x - A.x) / tl) * w };
  });
}

/** Left / right edges of a tapered band (tail width w0 -> head width w1), with a dry-brush roughness on the edges. */
function edges(P: StrokePt[], w0: number, w1: number, rough: number, salt: number) {
  const n = P.length;
  const s = [0];
  for (let i = 1; i < n; i++) s.push(s[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y));
  const L: [number, number][] = [], R: [number, number][] = [];
  const tot = Math.max(1, P[n - 1].m);
  for (let i = 0; i < n; i++) {
    const A = P[Math.max(0, i - 1)], B = P[Math.min(n - 1, i + 1)];
    let dx = B.x - A.x, dy = B.y - A.y;
    const l = Math.hypot(dx, dy) || 1;
    dx /= l;
    dy /= l;
    const f = P[i].m / tot;
    const k = P[i].k;
    const rl = rough ? noise1(P[i].m * 0.7, salt) * rough : 0;
    const rr = rough ? noise1(P[i].m * 0.7, salt + 9) * rough : 0;
    const w = lerp(w0, w1, f) * 0.5;
    L.push([P[i].x - dy * (w + rl), P[i].y + dx * (w + rl)]);
    R.push([P[i].x + dy * (w + rr), P[i].y - dx * (w + rr)]);
  }
  return { L, R };
}
function fillBand(ctx: CanvasRenderingContext2D, e: { L: [number, number][]; R: [number, number][] }, col: string, a: number, cap?: { x: number; y: number; r: number }) {
  if (a <= 0) return;
  ctx.globalAlpha = clamp(a);
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(e.L[0][0], e.L[0][1]);
  for (let i = 1; i < e.L.length; i++) ctx.lineTo(e.L[i][0], e.L[i][1]);
  for (let i = e.R.length - 1; i >= 0; i--) ctx.lineTo(e.R[i][0], e.R[i][1]);
  ctx.closePath();
  ctx.fill();
  if (cap && cap.r > 0) {
    ctx.beginPath();
    ctx.arc(cap.x, cap.y, cap.r, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

interface RideStrokeOpts {
  t: number;
  /** Stitch-hole stars: grid spacing (popping as the head passes). */
  starEvery: number;
  /** A pearl pulse running back along it (px behind the ball), 0..1 strength. */
  pulse?: { d: number; a: number };
  alpha?: number;
}

/**
 * The Meridian as the ride's subject: ink under-stroke (w + 8), a soft emerald halo to 2.4w (stacked additive bands),
 * the jade body w with dry-brush edges, the mint inner 0.5w, bristles, the pearl thread core with stitch glints running
 * to the ball, ink cross-stitches, pearl star-chart ticks every 5 m, stitch-hole stars popping behind the ball. Tail
 * 3 px at the boot -> W at the ball (the comet head wraps the ball).
 */
function rideStroke(ctx: CanvasRenderingContext2D, P: StrokePt[], W: number, o: RideStrokeOpts) {
  if (P.length < 2) return;
  const A = clamp(o.alpha ?? 1);
  const head = P[P.length - 1];
  const tail = 3;
  const n = P.length;
  const tot = Math.max(1, head.m);
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  // The soft emerald halo to 2.4w: a chain of glow sprites along the stroke (additive, never a hard edge), thin enough
  // that the jade never clips to cyan under the bloom; at most 48 sprites, only those near the viewport.
  ctx.globalCompositeOperation = 'lighter';
  const STEP = 14;
  let acc = 0, sprites = 0;
  for (let i = n - 1; i > 0 && sprites < 48; i--) {
    const q = P[i], a = P[i - 1];
    if (q.x < -W * 1.5 && a.x < -W * 1.5) break;
    if (q.y > VH + W * 1.5 && a.y > VH + W * 1.5) break;
    const seg = Math.hypot(q.x - a.x, q.y - a.y);
    for (let d = acc; d < seg && sprites < 48; d += STEP) {
      const k = d / Math.max(1e-6, seg);
      const w = lerp(tail, W, lerp(q.m, a.m, k) / tot);
      const cx = lerp(q.x, a.x, k), cy = lerp(q.y, a.y, k), out = W * 1.25;
      if (cx < -out || cx > VW + out || cy < -out || cy > VH + out) continue;
      drawGlow(ctx, glowOf(PAL.emerald), cx, cy, w * 1.25, 0.03 * A);
      sprites++;
    }
    acc = (acc - seg) % STEP;
    if (acc < 0) acc += STEP;
  }
  drawGlow(ctx, glowOf(PAL.emerald), head.x, head.y, W * 1.5, 0.18 * A);
  ctx.globalCompositeOperation = 'source-over';
  // Ink under-stroke (w + 8), the jade body w with soft brush edges.
  fillBand(ctx, edges(P, tail + 8, W + 8, W * 0.05, 3), HEX.ink, A, { x: head.x, y: head.y, r: (W + 8) / 2 });
  // The jade body at 0.82 with its blue held down (47,224,115): under the bloom the 75 px body doubles itself, and the
  // palette jade's blue would then climb to the clipped green and read cyan. This stays jade on screen (hue <= 160).
  fillBand(ctx, edges(P, tail, W, W * 0.07, 7), BODY_JADE, 0.82 * A, { x: head.x, y: head.y, r: W / 2 });
  // Brush hair: darker emerald streaks along the body (with gaps), so it reads as a stroke of a brush, not a tube.
  const line = (off: number, lw: number, col: string, al: number, gapP: number, salt: number) => {
    ctx.strokeStyle = col;
    ctx.lineWidth = lw;
    ctx.globalAlpha = al * A;
    ctx.beginPath();
    let on = false;
    for (let i = 0; i < n - 1; i++) {
      const q = P[i], B = P[i + 1];
      const dx = B.x - q.x, dy = B.y - q.y, l = Math.hypot(dx, dy) || 1;
      const w = lerp(tail, W, q.m / tot) * off;
      const gap = hash(Math.floor(q.m * 1.3) * 1.7 + salt * 31) < gapP;
      const x = q.x - (dy / l) * w, y = q.y + (dx / l) * w;
      if (gap) on = false;
      else if (!on) {
        ctx.moveTo(x, y);
        on = true;
      } else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };
  const hw = Math.max(1, W * 0.028);
  for (const [off, salt] of [[-0.38, 1], [-0.27, 2], [-0.15, 3], [0.16, 4], [0.29, 5], [0.4, 6]] as const) line(off, hw, HEX.emerald, 0.6, 0.35, salt);
  // Mint inner (0.5w, the light's hot centre) under the pearl thread.
  fillBand(ctx, edges(P, tail * 0.5, W * 0.24, W * 0.04, 11), 'rgb(200,255,205)', 0.35 * A, { x: head.x, y: head.y, r: W * 0.14 });
  // Dry brush: the body edge broken by ink gaps, and 1 px jade / mint bristles flying just outside it.
  for (const side of [-1, 1]) {
    line(0.5 * side, Math.max(2, W * 0.06), HEX.ink, 0.9, 0.62, 20 + side);
    for (let b = 0; b < 8; b++) line(side * (0.53 + b * 0.022), 1, b % 2 ? HEX.mint : HEX.jade, b % 2 ? 0.7 : 0.9, 0.45 + b * 0.04, 40 + b + side * 9);
  }
  ctx.globalAlpha = 1;
  // The pearl thread core (v1's threadLine) and the stitch glints running toward the ball.
  threadLine(ctx, P, 3, A, { under: false, halo: 0 });
  const s = [0];
  for (let i = 1; i < n; i++) s.push(s[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y));
  const Lpx = s[n - 1];
  const at = (d: number) => {
    let i = 1;
    while (i < n - 1 && s[i] < d) i++;
    const a = P[i - 1], b = P[i];
    const k = clamp((d - s[i - 1]) / Math.max(1e-6, s[i] - s[i - 1]));
    const l = Math.max(1e-6, s[i] - s[i - 1]);
    return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), tx: (b.x - a.x) / l, ty: (b.y - a.y) / l, m: lerp(a.m, b.m, k) };
  };
  ctx.globalCompositeOperation = 'lighter';
  for (let g = 0; g < 6; g++) {
    const d = Lpx - ((o.t * 900 + g * 140) % 840);
    if (d < 0) continue;
    const q = at(d);
    drawGlow(ctx, glowOf(PAL.pearl), q.x, q.y, 5 + W * 0.06, 0.8 * A);
  }
  if (o.pulse && o.pulse.a > 0) {
    // The pluck's pulse running back down the string: a bright 40 px stretch of the thread core, with a small glow.
    const dc = Math.max(0, Lpx - o.pulse.d);
    const q = at(dc);
    drawGlow(ctx, glowOf(PAL.pearl), q.x, q.y, W * 0.3, 0.6 * o.pulse.a * A);
    drawGlow(ctx, glowOf(PAL.mint), q.x, q.y, W * 0.7, 0.3 * o.pulse.a * A);
    ctx.globalCompositeOperation = 'source-over';
    const seg = (lw: number, col: string, al: number) => {
      ctx.strokeStyle = col;
      ctx.lineWidth = lw;
      ctx.globalAlpha = clamp(al * o.pulse!.a * A);
      ctx.beginPath();
      for (let d = Math.max(0, dc - 20), first = true; d <= Math.min(Lpx, dc + 20); d += 4, first = false) {
        const p = at(d);
        if (first) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    };
    seg(7, HEX.mint, 0.55);
    seg(3, HEX.pearl, 1);
    ctx.globalAlpha = 1;
  }
  ctx.globalCompositeOperation = 'source-over';
  // Ink cross-stitches across the body (every 6th grid point) and star-chart ticks every 5 m (pearl, outside the edge).
  ctx.strokeStyle = HEX.ink;
  ctx.lineWidth = Math.max(2, W * 0.035);
  ctx.globalAlpha = 0.85 * A;
  ctx.beginPath();
  for (let i = 1; i < n - 2; i++) {
    const q = P[i];
    if (q.k % 10 !== 4) continue;
    const B = P[i + 1];
    const dx = B.x - q.x, dy = B.y - q.y, l = Math.hypot(dx, dy) || 1;
    const tx = dx / l, ty = dy / l;
    const ww = lerp(tail, W, q.m / tot) * 0.13;
    ctx.moveTo(q.x - (tx + ty) * ww, q.y - (ty - tx) * ww);
    ctx.lineTo(q.x + (tx + ty) * ww, q.y + (ty - tx) * ww);
    ctx.moveTo(q.x - (tx - ty) * ww, q.y - (ty + tx) * ww);
    ctx.lineTo(q.x + (tx - ty) * ww, q.y + (ty + tx) * ww);
  }
  ctx.stroke();
  ctx.strokeStyle = HEX.pearl;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.9 * A;
  ctx.beginPath();
  for (let i = 1; i < n - 1; i++) {
    const a = P[i - 1], q = P[i];
    if (Math.floor(a.m / 5) === Math.floor(q.m / 5)) continue;
    const dx = q.x - a.x, dy = q.y - a.y, l = Math.hypot(dx, dy) || 1;
    const ww = lerp(tail, W, q.m / tot) * 0.5 + 5;
    const big = Math.floor(q.m / 10) !== Math.floor(a.m / 10);
    // Ticks hang on the upper (outer) edge of the arc.
    ctx.moveTo(q.x + (dy / l) * ww, q.y - (dx / l) * ww);
    ctx.lineTo(q.x + (dy / l) * (ww + (big ? 10 : 6)), q.y - (dx / l) * (ww + (big ? 10 : 6)));
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
  // Stitch-hole stars: pop as the head passes, then hold as pearl dots on the body.
  for (let i = 1; i < n - 1; i++) {
    const q = P[i];
    if (q.k % o.starEvery !== 0) continue;
    const behind = Lpx - s[i];
    if (behind < 150) sparkle(ctx, q.x, q.y, lerp(16, 7, behind / 150), A * (1 - 0.3 * (behind / 150)), Math.PI / 4);
    else {
      ctx.globalAlpha = 0.85 * A;
      ctx.fillStyle = HEX.pearl;
      ctx.fillRect(Math.round(q.x - 1), Math.round(q.y - 1), 2, 2);
      ctx.globalAlpha = 1;
    }
  }
  ctx.restore();
}

/** The aurora hem under the visible stroke (screen space): at most 160 rays, 60-200 px, alpha capped 0.35. */
function rideHem(ctx: CanvasRenderingContext2D, P: StrokePt[], H: number, phase: number, a: number, boost: number, W: number) {
  if (P.length < 2 || a <= 0) return;
  // Only the part of the stroke on screen (and a little beyond) carries rays.
  const vis = P.filter((q) => q.x > -60 && q.x < VW + 60 && q.y > -60 && q.y < VH + 40);
  if (vis.length < 2) return;
  const s = [0];
  for (let i = 1; i < vis.length; i++) s.push(s[i - 1] + Math.hypot(vis[i].x - vis[i - 1].x, vis[i].y - vis[i - 1].y));
  const L = s[s.length - 1];
  const n = Math.min(160, Math.max(4, Math.floor(L / 4)));
  const ray = hemRay();
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  let j = 1;
  const tot = vis[vis.length - 1].m || 1;
  for (let pass = 0; pass < 2; pass++) {
    j = 1;
    if (pass === 0) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = HEX.ink;
    } else ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const d = ((i + 0.5) / n) * L;
      while (j < vis.length - 1 && s[j] < d) j++;
      const A = vis[j - 1], B = vis[j];
      const k = clamp((d - s[j - 1]) / Math.max(1e-6, s[j] - s[j - 1]));
      const m = lerp(A.m, B.m, k);
      const near = clamp(m / tot);
      // Rays hang from just under the stroke's lower edge (so their pearl -> mint tops show below the body): 0.56 w + 2
      // on a level stroke, deeper where it climbs steeply (the vertical depth of the inked edge grows as 1 / cos).
      const sl = Math.abs(B.x - A.x) / Math.max(1e-6, Math.hypot(B.x - A.x, B.y - A.y));
      const x = lerp(A.x, B.x, k), y = lerp(A.y, B.y, k) + (lerp(3, W, near) * 0.56 + 2) / Math.max(0.4, sl);
      // Longest near the ball, shorter toward the tail; two slow sine folds.
      const f = 0.5 + 0.5 * Math.sin(m * 0.9 + phase) * Math.sin(m * 0.31 - phase * 0.7);
      const len = lerp(60, H, f) * lerp(0.55, 1, near);
      const sway = Math.sin(m * 1.7 + phase * 1.3) * 2;
      if (pass === 0) {
        ctx.globalAlpha = 0.24 * a * clamp((L - d) / 70);
        ctx.fillRect(x - 1.5, y, 3, len);
      } else {
        ctx.globalAlpha = Math.min(0.35, 0.35 * a * (0.55 + 0.45 * f) * (1 + boost)) * clamp((L - d) / 70);
        ctx.drawImage(ray, x - 1.5 + sway, y, 3, len);
      }
    }
  }
  ctx.restore();
}
let hemRayCv: HTMLCanvasElement | null = null;
function hemRay(): HTMLCanvasElement {
  if (hemRayCv) return hemRayCv;
  const c = document.createElement('canvas');
  c.width = 1;
  c.height = 64;
  const g = c.getContext('2d')!;
  const gr = g.createLinearGradient(0, 0, 0, 64);
  gr.addColorStop(0, HEX.pearl);
  gr.addColorStop(0.14, HEX.mint);
  gr.addColorStop(0.32, HEX.jade);
  gr.addColorStop(0.72, HEX.emerald);
  gr.addColorStop(1, 'rgba(11,143,88,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 1, 64);
  return (hemRayCv = c);
}

// ================================================================ the foreground pylon (parallax 1.4)

/** Where the pylon head sits in the ride world (chosen so its head crosses just under-right of the ball at 0.80). */
const PYLON = (() => {
  const t = 0.8;
  const k = camAt(t);
  const want = [k.lx - 150, k.ly + 50];
  return { X: k.x + (want[0] - 320) / (k.z * PP), Y: k.y + (want[1] - 180) / (k.z * PP) };
})();
function pylonAt(s: Stage) {
  const k = s.k;
  return {
    x: 320 + (PYLON.X - k.x) * k.z * PP + s.shx,
    y: 180 + (PYLON.Y - k.y) * k.z * PP + s.shy,
    sc: 1.3 * k.z * PP,
  };
}

// ================================================================ the near-stand roof edge (parallax 0.7)

/** The near stand's roof edge: an ink slab along the frame bottom with lamp heads every 340 units, crossing the frame
 *  bottom 0.9-1.7 (it slides past at 0.7 and sinks away under us as we climb, clear before the line comes in). */
const NEAR_P = 0.7;
const NEAR_LAMP = 340;
const NEAR_RIB = 34;
function drawNearRoof(env: Env, s: Stage, lampPts: TrailPt[]) {
  const t = s.t;
  if (t < 0.88 || t > 1.72) return;
  const ctx = env.ctx;
  const k = s.k;
  const nx = (X: number) => 320 + (X - k.x) * k.z * NEAR_P + s.shx;
  const rise = 1 - ease.outCubic(clamp((t - 0.88) / 0.14));
  const sink = ease.inQuad(clamp((t - 1.0) / 0.7));
  const yTop = Math.round(VH - 24 + s.shy + 22 * rise + 38 * sink);
  if (yTop >= VH + 2) return;
  const hs = 0.62 * k.z * NEAR_P;
  // The lamp heads on short masts standing on the roof edge (tinted by the arc's light as it passes them).
  const i0 = Math.floor((k.x - 520 / (k.z * NEAR_P)) / NEAR_LAMP) - 1;
  for (let i = i0; i < i0 + 8; i++) {
    const x = nx(i * NEAR_LAMP + 120);
    if (x < -60) continue;
    if (x > VW + 60) break;
    const hy = yTop - 34 * hs;
    const tint = lampTintFor([x, hy + 14 * hs], lampPts, 1);
    drawPylon(ctx, x, hy, hs, [tint, tint, tint, tint]);
    // We see these heads from above and behind (they face the pitch): their backs in ink, the lamps only glinting.
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = HEX.ink;
    ctx.fillRect(x - 29 * hs, hy, 58 * hs, 28 * hs);
    ctx.globalAlpha = 1;
    if (tint > 0.05) {
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.jade), x, hy + 14 * hs, 50 * hs + 20, 0.25 * tint);
      ctx.globalCompositeOperation = 'source-over';
    }
  }
  // The slab: ink, a 1 px lit fascia, a darker under-fascia, and roof ribs that stream past (the speed read).
  ctx.fillStyle = HEX.ink;
  ctx.fillRect(-8, yTop, VW + 16, VH + 16 - yTop);
  ctx.fillStyle = '#3d6b58';
  ctx.fillRect(-8, yTop, VW + 16, 1);
  ctx.fillStyle = '#1c3329';
  ctx.fillRect(-8, yTop + 4, VW + 16, 1);
  ctx.fillStyle = '#16261f';
  const r0 = Math.floor((k.x - 520 / (k.z * NEAR_P)) / NEAR_RIB) - 1;
  for (let i = r0; i < r0 + 80; i++) {
    const x = Math.round(nx(i * NEAR_RIB));
    if (x < -4) continue;
    if (x > VW + 4) break;
    ctx.fillRect(x, yTop + 5, i % 5 ? 1 : 2, 12);
  }
}

// ================================================================ No.10's monument outline (boxed ink copies, built in prepare)

const inkBoxes = new Map<string, HTMLCanvasElement>();
/** An ink-filled copy of No.10's boxed frame (the outline pass under the monument). */
function no10InkBox(key: No10Key, scale: number): { cv: HTMLCanvasElement; ax: number; ay: number } | null {
  const f = no10(key);
  if (!f) return null;
  const img = f.a.boxed(f.i, scale);
  const id = `${key}|${scale}`;
  let cv = inkBoxes.get(id);
  if (!cv) {
    cv = document.createElement('canvas');
    cv.width = img.width;
    cv.height = img.height;
    const g = cv.getContext('2d')!;
    g.drawImage(img, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = HEX.ink;
    g.fillRect(0, 0, cv.width, cv.height);
    inkBoxes.set(id, cv);
  }
  const [ax, ay] = f.a.anchorOf(f.i, 'contact');
  return { cv, ax, ay };
}
function drawNo10Monument(env: Env, key: No10Key, x: number, y: number, scale: number) {
  const ctx = env.ctx;
  const ink = no10InkBox(key, scale);
  if (ink) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) ctx.drawImage(ink.cv, Math.round(x - ink.ax * scale) + dx, Math.round(y - ink.ay * scale) + dy);
    ctx.restore();
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(no10(key)!.a.boxed(no10(key)!.i, scale), Math.round(x - ink.ax * scale), Math.round(y - ink.ay * scale));
    ctx.restore();
  } else drawNo10Boxed(env, key, x, y, scale, { anchor: 'contact' });
}

// ================================================================ state

let spin = new BallSpin();
const rings = new StitchRings();
const fired = { lock: false, p: [false, false, false, false] };

/** Plucks of the string at each pass: canvas amplitude (px) and the warp, decayed. */
function pluckAt(t: number): { amp: number; tSince: number; i: number } {
  let i = -1;
  for (let k = 0; k < PASS.length; k++) if (t >= PASS[k]) i = k;
  if (i < 0) return { amp: 0, tSince: -1, i };
  const ts = t - PASS[i];
  return { amp: 12 * Math.cos(TAU * 9 * ts) * Math.exp(-ts / 0.3), tSince: ts, i };
}

function nightMask(s: Stage, P: StrokePt[]): NightMaskFn {
  return (m) => {
    // The stroke band (w 90, soft 60) and a pool on the pitch under the ball, where the hem's light falls.
    if (P.length >= 2) {
      m.lineCap = 'round';
      m.lineJoin = 'round';
      for (const [w, al] of [[90 + 120, 0.3], [90 + 60, 0.6], [90, 1]] as const) {
        m.globalAlpha = al;
        m.lineWidth = w;
        m.beginPath();
        m.moveTo(P[0].x, P[0].y);
        for (let i = 1; i < P.length; i++) m.lineTo(P[i].x, P[i].y);
        m.stroke();
      }
    }
    m.globalAlpha = clamp((s.e - 0.3) / 0.5);
    const px = s.ball.x - 40, py = s.anchorY - 4;
    m.save();
    m.translate(px, py);
    m.scale(190, 46);
    const g = m.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, 'rgba(0,0,0,0.9)');
    g.addColorStop(0.55, 'rgba(0,0,0,0.6)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    m.fillStyle = g;
    m.beginPath();
    m.arc(0, 0, 1, 0, TAU);
    m.fill();
    m.restore();
  };
}

// ================================================================ the shot

export const shotRide: Shot = {
  name: 'Meridian Ride',
  dur: DUR,
  seed: 414,
  rate: RATE[4],
  cues: [
    // The bed runs on the real clock: the shot plays ~3.07 s real with the warp, so it is 3.0 s long (A3 -> A4 at the apex).
    { at: 0, fn: (e) => { e.sfx.whoosh(3.0, 500, 1400, 0.35); e.sfx.bow(220, 3.0, 0.3, 440); e.cam.shakeAmp = 8; } },
    { at: 0.4, fn: (e) => e.sfx.whoosh(0.6, 260, 2600, 0.32) },
    { at: 0.7, fn: (e) => { e.sfx.boom(0.5); e.sfx.whoosh(0.25, 300, 2000, 0.5); e.cam.hit(0.35); } },
    { at: LOCK_T, fn: (e) => { e.sfx.zip(0.12, 900, 3200, 0.16); e.sfx.tick(0.25); e.sfx.boom(0.55); e.cam.hit(0.22); } },
    { at: 1.1, fn: (e) => { e.sfx.crowd(1.6, 0.6); e.sfx.ooh(0.5); } },
    { at: PASS[0], fn: (e) => { e.sfx.pluck(PASS_HZ[0], 1.2, 0.5, -0.1); e.cam.hit(0.12); } },
    { at: PASS[1], fn: (e) => { e.sfx.pluck(PASS_HZ[1], 1.2, 0.5, 0); e.cam.hit(0.12); } },
    { at: PASS[2], fn: (e) => { e.sfx.pluck(PASS_HZ[2], 1.2, 0.5, 0.05); e.cam.hit(0.12); } },
    { at: PASS[3], fn: (e) => { e.sfx.pluck(PASS_HZ[3], 1.2, 0.5, 0.1); e.cam.hit(0.12); } },
    { at: SNAP_T, fn: (e) => { e.sfx.shing(1.6); e.sfx.zip(0.18, 500, 5200, 0.22); } },
    // The swell cuts toward near silence: the crowd ducked TO 0.15 (duck takes the depth).
    { at: 2.32, fn: (e) => e.sfx.duck(0.85, 1.4) },
    // Shot 5's held D6 starts clean.
    { at: 2.38, fn: (e) => e.sfx.choke('bow') },
  ],
  prepare(env) {
    warmMeridian(env);
    const ctx = env.ctx;
    ctx.save();
    ctx.globalAlpha = 0;
    // The pitch puppets (both poses, both silhouettes) and No.10's boxed monument, so the shot never hitches.
    for (const r of [...LINE, KEEPER])
      for (const tt of [0, 9])
        {
          const { name, pose } = poseOf(r, tt);
          PUPPETS.draw(ctx, name, r.kit, pose, PUP_K, -1, -999, -999, 1, 0, SIL_DIM);
          PUPPETS.draw(ctx, name, r.kit, pose, PUP_K, -1, -999, -999, 1, 0, SIL_LIT);
          // The full-colour entry (the face that comes out of the ink as the light reaches him).
          PUPPETS.draw(ctx, name, r.kit, pose, PUP_K, -1, -999, -999, 1, 1);
        }
    ctx.restore();
    warmNo10Boxed(env, ['LF4', 'LF4b'], 0.4);
    no10InkBox('LF4', 0.4);
    no10InkBox('LF4b', 0.4);
  },
  init(env) {
    env.sfx.clearBus();
    env.cam.set(VW / 2, VH / 2, 1, 0);
    env.cam.shakeRoll = 0.015;
    env.cam.shakeAmp = 8;
    PUPPETS.frame();
    spin = new BallSpin();
    resetSpin(spin);
    rings.clear();
    fired.lock = false;
    fired.p = [false, false, false, false];
  },
  update(env, t, dt) {
    const { rng, parts } = env;
    // Backspin with a little sidespin (the outside of the boot): 6 rev/s, slowed with the warp.
    spin.rotate(0, 0.42, 1, -dt * TAU * 6);
    // The flight tremor (held trauma: about 1 px), a little rougher through the catch.
    if (t >= 0.45 && t < LOCK_T) holdTrauma(env.cam, 0.28);
    else if (t >= LOCK_T && t < SNAP_T) holdTrauma(env.cam, 0.32);
    const b = ballAt(t), b0 = ballAt(Math.max(0, t - 1 / 60));
    const vx = (b.X - b0.X) * 60, vy = (b.Y - b0.Y) * 60;
    const k = camAt(t);
    const rWorld = (12 * (t < LOCK_T ? 2 : 3 / k.z));
    // Pearl motes shedding off the ball (40/s), lagging behind it.
    if (t > 0.3 && t < SNAP_T + 0.1 && rng.next() < dt * 40) {
      const a = rng.range(0, TAU), r = rng.range(0.4, 1) * rWorld;
      parts.spawn({
        kind: PK.Glow, x: b.X + Math.cos(a) * r, y: b.Y + Math.sin(a) * r, vx: vx * 0.72 + rng.range(-40, 40), vy: vy * 0.72 + rng.range(-40, 40),
        drag: 1.4, max: rng.range(0.45, 0.9), s0: rng.range(2.5, 4.5), s1: 0, ramp: 'jade', r0: 0, r1: 0.55, a0: 0.95, a1: 0, layer: 1,
      });
    }
    // Jade droplets flicked off the stroke behind the ball, and motes peeling off it.
    if (t > 0.2 && rng.next() < dt * 26) {
      const u = Math.max(0.01, b.u - rng.range(0.008, 0.07));
      const a = arcAt(u), [X, Y] = rideXY(a.x, a.h);
      const d = arcDir(u), dl = Math.hypot(d.dx * 3, d.dh * 4) || 1;
      const nx = (d.dh * 4) / dl, ny = (d.dx * 3) / dl;
      const off = rng.range(-1, 1) * 18;
      const drop = rng.next() < 0.55;
      parts.spawn(drop
        ? { kind: PK.Pixel, x: X + nx * off, y: Y + ny * off, vx: rng.range(-30, 30), vy: rng.range(20, 90), ay: 420, drag: 0.6, max: rng.range(0.5, 1), s0: rng.range(1.5, 2.6), s1: 1, ramp: 'jade', r0: 0.15, r1: 0.7, a0: 1, a1: 0, layer: 0 }
        : { kind: PK.Glow, x: X + nx * off, y: Y + ny * off, vx: rng.range(-25, 25), vy: rng.range(-30, 30), drag: 1, max: rng.range(0.5, 1), s0: rng.range(2, 3.5), s1: 0, ramp: 'jade', r0: 0.2, r1: 0.8, a0: 0.8, a1: 0, layer: 0 });
    }
    // The lock lands: a stitched ring snaps round the ball, light-stitches flung off it.
    if (!fired.lock && t >= LOCK_T) {
      fired.lock = true;
      rings.add({ x: 0, y: 0, t0: LOCK_T, r0: 44, r1: 220, dur: 0.42, color: HEX.pearl, width: 3 });
      rings.add({ x: 0, y: 0, t0: LOCK_T + 0.05, r0: 40, r1: 170, dur: 0.36, color: HEX.jade, width: 3 });
      stitchBurst(env, b.X, b.Y, 22, 260 / k.z);
    }
    // Each pass: light-stitches drip from the plucked string toward the man below.
    for (let i = 0; i < PASS.length; i++)
      if (!fired.p[i] && t >= PASS[i]) {
        fired.p[i] = true;
        stitchBurst(env, b.X - 30 / k.z, b.Y + 20 / k.z, 10, 180 / k.z, 1.4, Math.PI * 0.6);
      }
  },
  render(env: Env, t: number) {
    const { ctx, fx } = env;
    const st = env.art.stadium;
    PUPPETS.frame();
    const s = stageAt(env, t);
    const raw = strokePts(s);
    const pk = pluckAt(t);
    const P = plucked(raw, { amp: pk.amp, len: 380 });
    const W = Math.max(20, 25 * s.sc);
    const ball = s.ball;
    const rBall = 12 * s.sc;

    // ---------------------------------------------------------------- the world (inked)
    env.screen();
    drawSky(ctx, s);
    drawFarStand(ctx, st, s);
    drawPitch(ctx, st, s);
    // The hem's light falling on the pitch far below (under the ink; the restored pool keeps it).
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.jade), s.ball.x - 50, s.anchorY - 4, 230, 0.5 * clamp(s.e * 1.6), 1.15, 0.32);
    drawGlow(ctx, glowOf(PAL.mint), s.ball.x - 30, s.anchorY - 8, 120, 0.22 * clamp(s.e * 1.6), 1.2, 0.3);
    ctx.globalCompositeOperation = 'source-over';
    const rivals = [KEEPER, ...LINE].sort((a, b) => a.z - b.z);
    const lightOf = (r: Rival) => (r.keeper ? 0.15 : ease.inOutSine(clamp((s.ball.x + 170 - pitchX(s, r.x)) / 170) * clamp(s.e * 1.5)));
    // Night Ink 0.85, eased in over 0.3-1.0 from a lighter 0.55 so the wide reveal reads (the stand, the floodlit air).
    nightInk(ctx, lerp(0.55, 0.85, ease.inOutSine(clamp((t - 0.3) / 0.7))), nightMask(s, P));

    // ---------------------------------------------------------------- light over the ink
    const lampPts: TrailPt[] = [];
    for (let i = 0; i < P.length; i += 3) lampPts.push(P[i]);
    lampPts.push(ball);
    // The far masts and their lamp heads catching the arc's jade (passive, smooth with distance).
    ctx.save();
    ctx.beginPath();
    ctx.rect(-10, -10, VW + 20, s.roofY - 12 + 10);
    ctx.clip();
    let best = { k: 0, x: 0, y: 0 };
    const masts = farMasts(s);
    for (const m of masts) {
      const hc: [number, number] = [m.x, m.y + 14 * m.sc];
      const k = lampTintFor(hc, lampPts, 1);
      drawPylon(ctx, m.x, m.y, m.sc, [k, k, k, k]);
      if (k > best.k) best = { k, x: hc[0], y: hc[1] };
    }
    ctx.restore();
    // The floodlit air round each lamp head (a soft round haze, never a shaft) and the lit fascia of the far roof.
    ctx.globalCompositeOperation = 'lighter';
    for (const m of masts) {
      const hc: [number, number] = [m.x, m.y + 14 * m.sc];
      const k = lampTintFor(hc, lampPts, 1);
      // The haze thins out close to the ball, so the ball stays the brightest point.
      const near = clamp((Math.hypot(hc[0] - ball.x, hc[1] - ball.y) - rBall * 1.5) / 80);
      drawGlow(ctx, glowOf(k > 0.01 ? [Math.round(lerp(70, 40, k)), Math.round(lerp(90, 150, k)), Math.round(lerp(80, 100, k))] : [70, 90, 80]), hc[0], hc[1] + 30, 150 * m.sc + 60, 0.32 * near);
    }
    ctx.globalCompositeOperation = 'source-over';
    {
      const rh = lerp(18, 12, s.e);
      ctx.fillStyle = '#3d6b58';
      ctx.globalAlpha = 0.8;
      ctx.fillRect(-8, Math.round(s.roofY - rh), VW + 16, 1);
      ctx.globalAlpha = 0.35;
      ctx.fillRect(-8, Math.round(s.roofY + 2), VW + 16, 1);
      ctx.globalAlpha = 1;
      // Crowd camera flashes: single pearl pixels popping slowly, one at a time (local, never in unison).
      const fr = env.frng(11);
      for (let i = 0; i < 7; i++) {
        const ph = (t * 1.7 + i * 0.37) % 1;
        if (ph > 0.18) continue;
        const fx2 = (hash(i * 13 + Math.floor(t * 1.7 + i * 0.37) * 7) * VW) | 0;
        const fy2 = Math.round(lerp(s.roofY + 8, s.farY - 8, hash(i * 7 + Math.floor(t * 1.7 + i * 0.37) * 3)));
        ctx.globalAlpha = 0.9 * (1 - ph / 0.18);
        ctx.fillStyle = HEX.pearl;
        ctx.fillRect(fx2, fy2, fr.next() < 0.5 ? 1 : 2, 1);
      }
      ctx.globalAlpha = 1;
    }
    if (best.k > 0.5 && Math.hypot(best.x - ball.x, best.y - ball.y) >= rBall * 2.5) lensFlare(ctx, best.x, best.y, 90 * best.k, 0.35 * best.k, JADE_FLARE);
    // The arc's light on the stand and on the pitch far below (under the hem).
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.emerald), ball.x - 30, (s.roofY + s.farY) / 2, 260, 0.22 * clamp(s.e * 2), 1.4, 0.35);
    ctx.globalCompositeOperation = 'source-over';
    // The line far below and the keeper: rim-lit by the arc from above as it comes over them.
    for (const r of rivals) {
      drawRival(ctx, s, r, lightOf(r), 'body');
      drawRival(ctx, s, r, lightOf(r), 'light');
    }
    // The near stand's roof edge sliding past under us (0.9-1.7).
    drawNearRoof(env, s, lampPts);
    // ---------------------------------------------------------------- the hem, the stroke, the ball
    const boost = pk.tSince >= 0 ? 0.6 * Math.exp(-pk.tSince / 0.3) : 0;
    rideHem(ctx, P, lerp(90, 200, clamp((t - 0.2) / 0.8)), (t + pk.i * 0.4) * 0.8, clamp(t / 0.5) * (t > 2.3 ? 1 - (t - 2.3) / 0.1 : 1), boost, W);
    rideStroke(ctx, P, W, {
      t,
      starEvery: 16,
      pulse: pk.tSince >= 0 ? { d: pk.tSince * 1100, a: Math.exp(-pk.tSince / 0.25) } : undefined,
    });
    env.world();
    env.parts.draw(ctx, 0);
    env.screen();
    // No.10 at the boot end (over the stroke's tail): the monument, small and far below (LF4 / LF4b every 0.2 s), boxed 0.4x.
    if (t < 0.62) {
      const root = s.cam.toUV(0, 0);
      const key: No10Key = Math.floor(t / 0.2) % 2 ? 'LF4b' : 'LF4';
      const nx = root[0] * VW - 18, ny = root[1] * VH + 2;
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.emerald), nx + 4, ny - 20, 34, 0.5);
      drawGlow(ctx, glowOf(PAL.jade), nx + 10, ny - 4, 14, 0.6);
      ctx.globalCompositeOperation = 'source-over';
      // Inked: a 1 px ink outline so the small monument reads against the stroke and the dark stand.
      drawNo10Monument(env, key, nx, ny, 0.4);
    }

    // The ball: r12 at x3 through the ride (72 px), fractional only in the catch and the snap; a small native ball in
    // the wide.
    const seam = 1;
    const heat = t < SNAP_T ? 0 : 0.6 + 0.4 * ease.inQuad(clamp((t - SNAP_T) / 0.12));
    const snapK = t >= SNAP_T ? clamp((t - SNAP_T) / (DUR - SNAP_T)) : 0;
    if (snapK > 0) {
      // The snap's rim (emerald, jade) in normal blend under the white-hot ball, so it tints the frame toward jade and
      // never piles up past it into cyan; the mint core goes on additive after the ball.
      drawGlow(ctx, glowOf(PAL.emerald), ball.x, ball.y, lerp(120, 900, ease.inQuad(snapK)), 0.6 * snapK);
      drawGlow(ctx, glowOf(PAL.jade), ball.x, ball.y, lerp(70, 760, ease.inQuad(snapK)), 0.75 * snapK);
    }
    // Glow 1.6 in the ride: its ink halo (r x 3) separates the ball from the stroke head.
    const bg = t < 0.4 ? 1.2 : lerp(1.2, 1.6, clamp((t - 0.4) / 0.6));
    if (s.sc < 1) drawBall(env, spin, ball.x, ball.y, Math.max(4, Math.round(12 * s.sc)), 1, heat, bg, 'pearl');
    else {
      // drawBall's pearl glow layers, re-weighted: its ink halo at glow 1.6 (r x 3, separating the ball from the stroke
      // head), the emerald and pearl glows at 0.6 so they don't wash the comet head into cyan.
      const R = 12 * s.sc;
      drawGlow(ctx, glowOf(PAL.ink), ball.x, ball.y, R * 3, 0.55 * bg * (1 - snapK));
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.emerald), ball.x, ball.y, R * 4.4, 0.6);
      drawGlow(ctx, glowOf(PAL.pearl), ball.x, ball.y, R * 1.8, 0.6);
      ctx.globalCompositeOperation = 'source-over';
      drawBall(env, spin, Math.round(ball.x), Math.round(ball.y), 12, s.sc, heat, 0, 'pearl', undefined, { seamGlow: seam });
    }
    // Two ink spin marks (backspin), with a mint edge so they read on the halo.
    if (s.sc >= 1.5) {
      const ph = -t * 14;
      spinMarks(ctx, ball.x, ball.y, rBall + 2, ph, { color: HEX.mint, ink: false, width: rBall * 0.22 + 2, len: 1.0, dir: -1, alpha: 0.9 });
      spinMarks(ctx, ball.x, ball.y, rBall + 2, ph, { color: HEX.ink, ink: false, width: rBall * 0.22, len: 0.95, dir: -1, alpha: 0.95 });
    }
    env.world();
    env.parts.draw(ctx, 1);
    env.screen();
    // The lock's stitched rings round the ball, each on a solid ink under-ring (r + 2) so they land as a hit, not a HUD.
    ctx.save();
    ctx.translate(ball.x, ball.y);
    for (const rg of rings.list) {
      const u = (t - rg.t0) / rg.dur;
      if (u < 0 || u >= 1) continue;
      ctx.globalAlpha = clamp(1 - ease.inQuad(u)) * 0.9;
      ctx.strokeStyle = HEX.ink;
      ctx.lineWidth = (rg.width ?? 2) + 3;
      ctx.beginPath();
      ctx.arc(0, 0, lerp(rg.r0, rg.r1, ease.outCubic(u)) + 2, 0, TAU);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    rings.draw(ctx, t);
    ctx.restore();

    // ---------------------------------------------------------------- speed: ink wind streaks rushing down-left
    const kv = camAt(Math.min(DUR, t + 1 / 60));
    const cvx = (kv.x - s.k.x) * 60 * s.k.z, cvy = (kv.y - s.k.y) * 60 * s.k.z;
    const spd = Math.hypot(cvx, cvy);
    if (spd > 40 && t < SNAP_T + 0.05) {
      const rr = env.frng(4);
      const dx = -cvx / spd, dy = -cvy / spd;
      const ride = t >= LOCK_T && t < SNAP_T;
      const nStreak = Math.round(clamp(spd / 900) * 26) + (ride ? 10 : 4);
      for (let i = 0; i < nStreak; i++) {
        const x = rr.range(-40, VW + 40), y = rr.range(-40, VH + 40);
        if (Math.hypot(x - ball.x, y - ball.y) < rBall * 1.6) continue;
        const l = rr.range(30, 60) * (0.6 + clamp(spd / 900)) * (ride ? 1.5 : 1);
        const mint = rr.next() < 0.4;
        ctx.strokeStyle = mint ? HEX.mint : HEX.ink;
        ctx.globalAlpha = mint ? 0.3 : 0.6;
        ctx.lineWidth = rr.next() < 0.25 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx * l, y + dy * l);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // ---------------------------------------------------------------- the foreground pylon (0.62-1.0)
    let pylonVel: [number, number] | null = null;
    if (t > 0.5 && t < 1.15) {
      const py = pylonAt(s);
      if (py.x > -220 && py.x < VW + 220 && py.y < VH + 40) {
        const rows = [0, 1, 2, 3].map((r) => lampTintFor([py.x, py.y + (4 + r * 6) * py.sc], lampPts, 1));
        drawPylon(ctx, py.x, py.y, py.sc, rows);
        // Re-cut the lamp grid in ink (the glow and the bloom would melt it into one block).
        {
          const sc = py.sc, x0 = py.x - 29 * sc;
          ctx.fillStyle = HEX.ink;
          ctx.globalAlpha = 0.85;
          for (let c = 0; c <= 8; c++) ctx.fillRect(x0 + c * 7 * sc - 0.5 * sc, py.y, 2 * sc, 28 * sc);
          for (let r = 0; r <= 4; r++) ctx.fillRect(x0, py.y + r * 6 * sc - 0.5 * sc, 58 * sc, 2 * sc);
          ctx.globalAlpha = 1;
        }
        let bi = 0;
        for (let r = 1; r < 4; r++) if (rows[r] > rows[bi]) bi = r;
        if (rows[bi] > 0.3) lensFlare(ctx, py.x, py.y + (4 + bi * 6) * py.sc, Math.min(110, 110 * rows[bi]), 0.42 * rows[bi], JADE_FLARE);
        const k2 = camAt(Math.min(DUR, t + 1 / 60));
        pylonVel = [(PYLON.X - k2.x) * k2.z * PP - (PYLON.X - s.k.x) * s.k.z * PP, (PYLON.Y - k2.y) * k2.z * PP - (PYLON.Y - s.k.y) * s.k.z * PP];
      }
    }

    // ---------------------------------------------------------------- the snap: light out of the ball's core
    if (t >= SNAP_T) {
      const k = clamp((t - SNAP_T) / (DUR - SNAP_T));
      // Manga focus lines rushing in on the core (ink, then jade-tipped), tightening with the zoom.
      const fr = env.frng(21);
      const rIn = lerp(170, 60, ease.inQuad(k));
      focusLines(ctx, fr, ball.x, ball.y, rIn, 760, 70, HEX.ink, 0.75 * clamp(k * 3), 4);
      ctx.globalCompositeOperation = 'lighter';
      focusLines(ctx, fr, ball.x, ball.y, rIn * 1.15, 700, 34, HEX.jade, 0.35 * clamp(k * 3), 2);
      ctx.globalCompositeOperation = 'source-over';
      // The mint core, additive, out of the ball (its emerald and jade rim went on under the ball, in normal blend).
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.mint), ball.x, ball.y, lerp(30, 560, ease.inCubic(k)), 0.95 * k);
      ctx.globalCompositeOperation = 'source-over';
    }

    // ---------------------------------------------------------------- post
    nightGrade(fx, { bloom: 1.1, thresh: 0.64, ca: 0.004 });
    // Radial 0.03 on the ball: off over the wide (the monument stays crisp), eased down over the line so the four
    // small faces read, then the snap's crash.
    const radialBase = 0.03 * clamp((t - 0.35) / 0.15) * (1 - 0.5 * clamp((t - 1.62) / 0.08) * (1 - clamp((t - 2.16) / 0.06)));
    fx.radial = t < SNAP_T ? radialBase : lerp(radialBase, 0.16, ease.inQuad(clamp((t - SNAP_T) / 0.18)));
    fx.radialX = ball.x / VW;
    fx.radialY = ball.y / VH;
    if (t >= SNAP_T) fx.ca = lerp(0.004, 0.012, clamp((t - SNAP_T) / 0.18));
    if (t < 0.3) whip(fx, 0.1 * (1 - ease.outSine(t / 0.3)), 0, -1, { x: ball.x, y: ball.y, r: 0.08 });
    // The crane rush of the catch: a short streak down the frame, the ball kept sharp.
    else if (t >= 0.4 && t < 0.65) whip(fx, 0.05 * clamp((t - 0.4) / 0.03) * (1 - clamp((t - 0.43) / 0.22)), 0, 1, { x: ball.x, y: ball.y, r: 0.1 });
    if (pylonVel && t >= 0.68 && t < 0.92) {
      const l = Math.hypot(pylonVel[0], pylonVel[1]) || 1;
      whip(fx, 0.06, pylonVel[0] / l, pylonVel[1] / l, { x: ball.x, y: ball.y, r: 0.1 });
    }
    // The string rings at each pass: the picture bends along the segment behind the ball.
    if (pk.tSince >= 0 && pk.tSince < 0.6 && raw.length > 3) {
      let i = raw.length - 1, d = 0;
      while (i > 0 && d < 380) {
        d += Math.hypot(raw[i].x - raw[i - 1].x, raw[i].y - raw[i - 1].y);
        i--;
      }
      const p0: [number, number] = [ball.x, ball.y], p2: [number, number] = [raw[i].x, raw[i].y];
      const mid = raw[Math.round((i + raw.length - 1) / 2)];
      setPluck(fx, null, [p0, ctrlThrough(p0, [mid.x, mid.y], p2), p2], { amp: 0.009, tSince: pk.tSince, hz: 9, n: 2, w: 0.05, decay: 0.3, glow: 0.3 });
    }
    // The catch lands: one small shock out of the ball.
    if (t >= LOCK_T && t < LOCK_T + 0.4) {
      const a = t - LOCK_T;
      pushShock(fx, { x: ball.x / VW, y: ball.y / VH, r: 0.06 + a * 1.1, s: 0.035 * (1 - a / 0.4) });
    }
    // The mint whiteout (F3 flash, F4 fullFrame at global 7.43).
    if (t >= 2.3) meridianFlash(fx, 0.85 * clamp((t - 2.3) / 0.08), MINT_FLASH);
    if (t >= 2.33) fx.fullFrame = true;
    assertMeridianFx(fx);
  },
};
