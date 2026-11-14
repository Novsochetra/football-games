// SHOT 5 — PRESSURE FRONT (1.4 s). The finish (SPEC.md §5). The goal follows the same rule as the defenders: the
// ball arrives first, almost silently, and the pressure front arrives after it.
//
// Camera: a low side view at the goal. The lens sits at crossbar height (2.25 m, so the bar rides the horizon and
// the floodlit stands fill everything behind it: no sky), 6 m in front of the goal line and 22 m from the keeper's
// plane, in true perspective: the goal recedes toward a vanishing point off the left edge, every horizon level.
// A slow push-in (zoom 1.9 -> 2.1). The keeper is a puppet at k 1, blitted in screen space at exactly x2.
//
// Beats (shot-local t; the world simulates on simT, the warped clock):
//   0.00-0.22  step 3's pressure ring rolls across the six-yard box as a wave of flattening grass (pale pressed turf
//              behind a soft, broken cyan front, dew spray) and sweeps the keeper's feet as he pushes off (0.14):
//              gkReady -> push -> gkSwept (legs taken, tilted back) -> a tucked twist -> a low gkDive.
//   0.30-0.62  slow motion (rate 0.15, eased in from 0.26): the ball climbs over his outstretched gloves (~30 px
//              clear) inside its vapour cone, slips a hand's width under the bar (lighting its underside cyan).
//   0.633      the first full-speed frame: its last 0.6 m is one frame, a punch into the far top corner; only then
//              does the net dimple, with a tiny tick (picture first, never before it).
//   0.62-0.80  the held beat: dew still hangs on the mesh; he lands low and props up on his forearms; the front (a
//              near-planar refraction band) slides in across the frame.
//   0.80       the late boom: the whole net balloons and pulls taut (never tears), dew and dust blast off the mesh in
//              a squashed ring, the gust slams the keeper flat, the frame knocks back once (no ringing), cyan flash
//              0.3, the camera is knocked back and springs in.
//   0.90-1.30  the net exhales: it sighs back to 0.3, a fan of dew mist blows out of the mesh and a curtain of
//              droplets shakes off the bar and the top of the net; he lies flat, then lifts his head to look at it.
//   1.37       navy blink (the last 2 frames).
//
// The net is drawn with this shot's own perspective mesh (1 px lines at any zoom) driven by netExhale() — the
// same bulge / dimple / knock envelope as drawGoal, which at this scale would draw 4 px mesh lines.

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { TAU, Rng, clamp, ease, lerp } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import type { TrailPt } from '../../art/fx';
import { KEEPER_KIT, P, POSES, drawPuppet, joints, mixPose, renderPuppet, type Pose } from '../../art/puppet';
import {
  BLINK, HEX, MUFFLE, PAL, drawBall, galeGrade, lensAt, machCone, netExhale, recoilSpring, refractionBand, sparkleCyan, stampShock,
  vaporRibbon, type NetEnvelope,
} from './common';

const DUR = 1.4;
const HIT = 0.62;
const FRONT = 0.8;

// ---------------------------------------------------------------- the lens (metres -> world px)
/** Distance from the lens to the keeper's plane (m). Depth zd is measured away from the lens from that plane. */
const L = 22;
/** The lens's position along the pitch (the goal line is X 0, the field is -X). */
const XC = -6;
/** Lens height (m): crossbar height. */
const EYE = 2.25;
/** World px per metre in the keeper's plane. */
const PXM = 48;
const sOf = (zd: number) => L / (L + zd);
/** Project a pitch point (X along the pitch, H height, zd depth) to world px (origin: the vanishing point). */
function pr(X: number, H: number, zd: number): [number, number] {
  const s = L / (L + zd);
  return [(X - XC) * PXM * s, (EYE - H) * PXM * s];
}

// ---------------------------------------------------------------- the goal (m)
const POST = 3.66, BAR = 2.44, BAR_T = 0.12, PW = 0.12;
/** Net depth at the top (roof) and at the ground. */
const ROOF = 1.0, BACKD = 2.0;
const xBack = (H: number) => ROOF + (BACKD - ROOF) * (1 - H / BAR);
/** Metres of push per unit of netExhale bulge. */
const BM = 1.5;
/** Where the ball meets the back net: the far top corner. */
const IMP = { zd: 3.2, H: 2.12 };
/** The far stands' base (depth, m). */
const FAR_Z = 45;

// ---------------------------------------------------------------- clocks

/** Simulation rate: 1, easing into the slow motion over 0.26-0.30, 0.15 until the hit, then a snap to 1. */
const R0 = 0.26, R1 = 0.3, SLOW = 0.15;
function rateAt(t: number) {
  if (t < R0) return 1;
  if (t < R1) return lerp(1, SLOW, (t - R0) / (R1 - R0));
  if (t < HIT) return SLOW;
  return 1;
}
const S1 = R0 + ((R1 - R0) * (1 + SLOW)) / 2;
const S2 = S1 + SLOW * (HIT - R1);
/** The warped clock (the exact integral of rateAt): everything that moves in the world runs on it. */
function simT(t: number) {
  if (t < R0) return t;
  if (t < R1) {
    const u = t - R0;
    return R0 + u - ((1 - SLOW) * u * u) / (2 * (R1 - R0));
  }
  if (t < HIT) return S1 + SLOW * (t - R1);
  return S2 + (t - HIT);
}
/** The ball meets the mesh on the first full-speed frame after the rate snaps back to 1 (t 0.633, on the 1/60
 *  grid): its last 0.6 m is one frame, a punch. */
const T_HIT = 38 * (1 / 60);
const TAU_HIT = S2 + (T_HIT - HIT);

// ---------------------------------------------------------------- the ball (m, on simT)
const V = 46;
/** Ball centre where it meets the net (before the dimple). */
const XHIT = xBack(IMP.H) - 0.13;
interface P3 { X: number; H: number; zd: number }
function ballFlight(tau: number): P3 {
  const X = XHIT - V * (TAU_HIT - tau);
  const k = clamp((XHIT - X) / 5.5);
  return { X, H: IMP.H - 0.2 * Math.pow(k, 1.3), zd: IMP.zd - 0.55 * k };
}

// ---------------------------------------------------------------- the stamp-3 ring (m, on simT)
const RING = { X: -6, zd: 2.6 };
const ringR = (tau: number) => 2.4 + 27 * tau - 14 * tau * tau;
/** 0..1 strength of the rolling ring: it dies out at the goal line, just after it takes his feet. */
const ringA = (tau: number) => 1 - clamp((ringR(tau) - 6.4) / 1.7);

// ---------------------------------------------------------------- the keeper (on simT)
/** Set on his line, a stride toward the far post. */
const KX = 0.05, KZ = 1.2;
const DIP: Pose = P({ ...POSES.gkReady, torso: 0.45, kneeN: 1.2, kneeF: 1.2 });
/** Pushing off toward the far post (his left on screen). */
const PUSH: Pose = P({ ...POSES.gkReady, torso: 0.55, head: -0.35, thighN: 0.8, kneeN: 1.4, thighF: -0.15, kneeF: 1.15, armN: 0.7, elbowN: 0.8, armF: 0.5, elbowF: 0.8 });
const SWEPT: Pose = POSES.gkSwept;
/** Knocked off balance: knees snatched up, he twists forward out of the fall (no upright pass between). */
const TWIST: Pose = P({ torso: 0.35, head: -0.25, thighN: 1.15, kneeN: 1.7, footN: 0.1, thighF: 0.75, kneeF: 1.75, armN: 2.3, elbowN: 0.35, armF: 2.0, elbowF: 0.45, spin: 0.2 });
/** Feet gone, falling: he flings the near glove up at the ball as it climbs past. */
const REACH: Pose = P({ torso: 0.1, head: -0.05, thighN: -0.3, kneeN: 0.75, footN: -0.2, thighF: -0.55, kneeF: 0.95, armN: 3.9, elbowN: 0, armF: 2.9, elbowF: 0.2, spin: 0.8 });
/** The low dive he is left with, tilted toward the turf, arms still stretched after it. */
const LOWDIVE: Pose = { ...POSES.gkDive, head: -0.45, armN: 4.1, elbowN: 0, armF: 2.95, elbowF: 0.1, spin: 1.3 };
const LAND: Pose = { ...POSES.gkDive, head: -0.5, thighN: 0.35, kneeN: 0.55, thighF: -0.1, kneeF: 0.75, armN: 3.6, elbowN: 0.25, armF: 2.8, elbowF: 0.35, spin: 1.5 };
/** Down, but propped on his forearms, head up toward the net, boots kicked up behind: he has not given up yet. */
const PROP: Pose = P({ torso: -0.12, head: -0.75, thighN: 0.15, kneeN: 1.5, footN: 0.2, thighF: -0.05, kneeF: 1.25, armN: 2.35, elbowN: 1.2, armF: 2.15, elbowF: 1.25, spin: 1.38 });
/** Pressed flat by the gust: chest, arms and legs on the turf. */
const FLAT: Pose = P({ torso: 0.05, head: 0.15, thighN: 0.1, kneeN: 0.15, thighF: -0.05, kneeF: 0.25, armN: 2.95, elbowN: 0.1, armF: 2.8, elbowF: 0.12, spin: 1.57 });
/** Flat, lifting his head to look back at the net. */
const FLAT_LOOK: Pose = { ...FLAT, head: -0.5, torso: -0.08, armN: 2.75, elbowN: 0.5 };
/** [simT, pose, dX (m), dzd (m), hip height (world px at k 1; null = standing on the pose's lowest point)] */
type KKey = readonly [number, Pose, number, number, number | null];
const KEYS: readonly KKey[] = [
  [0, POSES.gkReady, 0, 0, null],
  [0.06, DIP, 0, 0, null],
  [0.12, PUSH, -0.04, 0.04, null],
  [0.2, mixPose(PUSH, SWEPT, 0.7), 0.02, 0.12, 34],
  [0.245, { ...SWEPT, spin: -0.3 }, 0.04, 0.2, 33],
  // Two breakdowns (on the t 0.267 and 0.283 frames): the ring has taken his feet toward the goal, so he twists
  // out of the back-tilt into the forward dive as time slows (t 0.25-0.33, peaking mid-turn), never in one pop.
  [0.2662, P({ ...mixPose(SWEPT, TWIST, 0.25), spin: -0.22 }), 0.025, 0.215, 34],
  [0.2776, P({ ...mixPose(SWEPT, TWIST, 0.55), spin: -0.06 }), 0, 0.235, 35],
  [0.2875, TWIST, -0.03, 0.26, 36],
  [0.3055, REACH, -0.12, 0.32, 39],
  [0.335, LOWDIVE, -0.42, 0.55, 35],
  [0.39, mixPose(LOWDIVE, LAND, 0.6), -0.68, 0.66, 26],
  [0.42, LAND, -0.78, 0.7, null],
  [0.45, LAND, -0.8, 0.7, 21],
  [0.49, PROP, -0.8, 0.7, 14],
  [0.511, PROP, -0.8, 0.7, 14],
  [0.528, FLAT, -0.74, 0.7, 11],
  [0.8, FLAT, -0.73, 0.7, 11],
  [0.95, FLAT_LOOK, -0.73, 0.7, 11],
  [1.2, FLAT_LOOK, -0.73, 0.7, 11],
];

/** The keeper at simT: pose, ground position (m) and hip height above the turf (world px). */
function keeperAt(tau: number): { pose: Pose; X: number; zd: number; hip: number } {
  let i = 0;
  while (i < KEYS.length - 2 && tau > KEYS[i + 1][0]) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const u = clamp((tau - a[0]) / (b[0] - a[0]));
  const e = u * u * (3 - 2 * u);
  const pose = mixPose(a[1], b[1], e);
  return {
    pose,
    X: KX + lerp(a[2], b[2], e),
    zd: KZ + lerp(a[3], b[3], e),
    hip: Math.max(lerp(a[4] ?? lowest(a[1]), b[4] ?? lowest(b[1]), e), lowest(pose) + 0.5),
  };
}

/** Lowest point of a pose below the hip, in puppet units (each part's drawn thickness included). */
function lowest(pose: Pose): number {
  const j = joints(pose);
  const parts: [[number, number], number][] = [
    [[0, 0], 9.6], [j.neck, 8.4], [j.head, 12], [j.kneeN, 5], [j.ankleN, 4.4], [j.toeN, 3.8], [j.toeF, 3.8], [j.handN, 4.6], [j.handF, 4.6],
  ];
  let m = -1e9;
  for (const [p, r] of parts) m = Math.max(m, p[1] + r);
  return m;
}

// ---------------------------------------------------------------- module state (reset in init)
let spin = new BallSpin();
let ringHit = false;
let tickDone = false;
let boomDone = false;
let landDone = false;
let dewAcc = 0;
let mistAcc = 0;
let dropAcc = 0;
interface Bead { panel: 0 | 1 | 2; a: number; b: number; ph: number; gone: boolean }
let beads: Bead[] = [];
interface Blade { X: number; zd: number; h: number; ph: number; c: number }
let blades: Blade[] = [];
interface Spark { X: number; zd: number; ph: number; f: number }
let sparks: Spark[] = [];
let fgBlades: HTMLCanvasElement[] | null = null;

// ---------------------------------------------------------------- camera

/** A slow push-in (zoom 1.9 -> 2.1, drifting toward the corner); the late boom knocks it back once (the move's
 *  recoil: a 4 % pull-out and a shove toward the goal that spring back, never a roll). */
function camAt(t: number): { x: number; y: number; z: number } {
  const u = ease.inOutQuad(clamp(t / DUR));
  const kb = recoilSpring(t, FRONT, 1, 1.6, 6);
  return { x: lerp(258, 284, u) + 7 * kb, y: lerp(44, 40, u) - 2 * kb, z: lerp(1.9, 2.1, u) * (1 - 0.04 * kb) };
}

function toScreen(env: Env, x: number, y: number): [number, number] {
  const [u, v] = env.cam.toUV(x, y);
  return [u * VW, v * VH];
}

// ---------------------------------------------------------------- the net (a perspective mesh)

const NA = 46, NB = 15, NS = 12, NR = 6;
/** Per-panel projected mesh points (flat x,y arrays), rebuilt per frame without allocation. */
const meshBack = new Float64Array((NA + 1) * (NB + 1) * 2);
const meshFar = new Float64Array((NS + 1) * (NB + 1) * 2);
const meshNear = new Float64Array((NS + 1) * (NB + 1) * 2);
const meshRoof = new Float64Array((NR + 1) * (NA + 1) * 2);

/** A point of a net panel (a, b in 0..1), displaced by the balloon and the corner dimple, in metres. */
function netPoint(panel: 0 | 1 | 2 | 3, a: number, b: number, n: NetEnvelope): P3 {
  const A = n.bulge * BM;
  const pv = Math.sin(Math.PI * (0.12 + 0.88 * b));
  if (panel === 0) {
    // Back net: a across (far post -> near post), b down.
    const zd = POST - 2 * POST * a, H = BAR * (1 - b);
    const g = Math.exp(-(((zd - IMP.zd) / 0.8) ** 2 + ((H - IMP.H) / 0.7) ** 2));
    return { X: xBack(H) + A * Math.sin(Math.PI * a) * pv + n.dimple * BM * 1.2 * g, H, zd };
  }
  if (panel === 3) {
    // Roof: a = depth (crossbar -> back), b across (far -> near).
    const zd = POST - 2 * POST * b;
    const sw = Math.sin(Math.PI * b);
    const g = Math.exp(-(((zd - IMP.zd) / 0.8) ** 2));
    return { X: a * ROOF + A * sw * 0.37 * a + n.dimple * BM * 0.5 * g * a, H: BAR + A * 0.22 * sw * Math.sin(Math.PI * a), zd };
  }
  // Side nets: a = depth fraction (post -> back), b down.
  const H = BAR * (1 - b);
  const side = panel === 1 ? 1 : -1;
  let out = A * 0.85 * Math.sin(Math.PI * a) * pv;
  if (panel === 1) out += n.dimple * BM * 0.5 * a * Math.exp(-(((H - IMP.H) / 0.7) ** 2));
  return { X: a * xBack(H), H, zd: side * POST + side * out };
}

function buildMesh(n: NetEnvelope, kx: number) {
  let k = 0;
  for (let j = 0; j <= NB; j++)
    for (let i = 0; i <= NA; i++) {
      const p = netPoint(0, i / NA, j / NB, n);
      const [x, y] = pr(p.X, p.H, p.zd);
      meshBack[k++] = x + kx;
      meshBack[k++] = y;
    }
  for (const [panel, buf] of [[1, meshFar], [2, meshNear]] as const) {
    k = 0;
    for (let j = 0; j <= NB; j++)
      for (let i = 0; i <= NS; i++) {
        const p = netPoint(panel, i / NS, j / NB, n);
        const [x, y] = pr(p.X, p.H, p.zd);
        buf[k++] = x + kx;
        buf[k++] = y;
      }
  }
  k = 0;
  for (let j = 0; j <= NA; j++)
    for (let i = 0; i <= NR; i++) {
      const p = netPoint(3, i / NR, j / NA, n);
      const [x, y] = pr(p.X, p.H, p.zd);
      meshRoof[k++] = x + kx;
      meshRoof[k++] = y;
    }
}

/** Stroke a (cols+1) x (rows+1) grid of projected points: rows then columns. */
function strokeGrid(ctx: CanvasRenderingContext2D, buf: Float64Array, cols: number, rows: number) {
  ctx.beginPath();
  for (let j = 0; j <= rows; j++) {
    for (let i = 0; i <= cols; i++) {
      const k = (j * (cols + 1) + i) * 2;
      i ? ctx.lineTo(buf[k], buf[k + 1]) : ctx.moveTo(buf[k], buf[k + 1]);
    }
  }
  for (let i = 0; i <= cols; i++) {
    for (let j = 0; j <= rows; j++) {
      const k = (j * (cols + 1) + i) * 2;
      j ? ctx.lineTo(buf[k], buf[k + 1]) : ctx.moveTo(buf[k], buf[k + 1]);
    }
  }
  ctx.stroke();
}

function meshXY(panel: 0 | 1 | 2, a: number, b: number): [number, number] {
  const cols = panel === 0 ? NA : NS;
  const buf = panel === 0 ? meshBack : panel === 1 ? meshFar : meshNear;
  const i = Math.round(a * cols), j = Math.round(b * NB);
  const k = (j * (cols + 1) + i) * 2;
  return [buf[k], buf[k + 1]];
}

// ---------------------------------------------------------------- drawing: stands, ground, grass

/** The far stands in screen space (their own parallax): the shared crowd art, floodlit haze, tier fronts, the LED
 *  ribbon, ambient camera flashes, and the floodlight halos just above the frame. */
function drawStands(env: Env, time: number) {
  const ctx = env.ctx;
  const st = env.art.stadium;
  const cam = env.cam;
  env.screen();
  const [, base] = toScreen(env, 0, pr(0, 0, FAR_Z)[1]);
  const zb = 2.4 * (1 + (cam.zoom / 2 - 1) * 0.35);
  const top = base - 110 * zb;
  // Backing (above the crowd art, if the push ever reveals it): floodlit navy haze, never a night sky.
  const bg = ctx.createLinearGradient(0, 0, 0, base);
  bg.addColorStop(0, 'rgb(30,48,108)');
  bg.addColorStop(1, 'rgb(60,88,150)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, VW, base + 2);
  const sx = 560 + cam.x * 0.3;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(st.crowd, sx, 0, VW / zb + 2, 110, 0, top, (VW / zb + 2) * zb, 110 * zb);
  const row = (r: number) => base - (110 - r) * zb;
  // Depth haze: cool and lifted (high-key), so the crowd reads soft and far behind the goal.
  const hz = ctx.createLinearGradient(0, Math.min(0, top), 0, base);
  hz.addColorStop(0, 'rgba(70,104,170,0.55)');
  hz.addColorStop(1, 'rgba(150,186,230,0.4)');
  ctx.fillStyle = hz;
  ctx.fillRect(0, 0, VW, base);
  // Tier fronts (a quiet grid, so the refraction band reads as it crosses).
  ctx.fillStyle = 'rgba(8,12,34,0.5)';
  for (let r = 12; r < 98; r += 13) ctx.fillRect(0, row(r), VW, 1.5);
  ctx.fillStyle = 'rgba(190,215,255,0.14)';
  for (let r = 12; r < 98; r += 13) ctx.fillRect(0, row(r) - 1, VW, 1);
  const aisle = 48 * zb;
  ctx.fillStyle = 'rgba(150,170,210,0.28)';
  for (let x = -((sx * zb) % aisle); x < VW; x += aisle) ctx.fillRect(Math.round(x), row(4), 3, row(98) - row(4));
  // Ambient camera flashes (sparse; the stands' big wave belongs to shot 6).
  ctx.globalCompositeOperation = 'lighter';
  for (const f of st.flashes) {
    const ph = (time * 0.7 + f.t) % 4.5;
    if (ph > 0.1) continue;
    const x = (f.x - sx) * zb, y = row(f.y);
    if (x < -10 || x > VW + 10) continue;
    drawGlow(ctx, glowOf([235, 245, 255]), x, y, 7, 0.8 * (1 - ph / 0.1));
  }
  // Floodlight halos just above the frame (cool white, soft: they never blow out).
  for (const lx of [150 - cam.x * 0.4 + 120, 610 - cam.x * 0.4 + 120]) {
    drawGlow(ctx, glowOf([150, 190, 255]), lx, -40, 170, 0.35);
    drawGlow(ctx, glowOf([235, 248, 255]), lx, -40, 60, 0.6);
  }
  ctx.globalCompositeOperation = 'source-over';
}

/** A strip on the turf from (X0, zd0) to (X1, zd1), w metres wide (pitch lines). */
function groundStrip(ctx: CanvasRenderingContext2D, X0: number, zd0: number, X1: number, zd1: number, w: number) {
  const dx = X1 - X0, dz = zd1 - zd0;
  const l = Math.hypot(dx, dz) || 1;
  const nx = (-dz / l) * w * 0.5, nz = (dx / l) * w * 0.5;
  const N = 8;
  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const [x, y] = pr(X0 + dx * u + nx, 0, zd0 + dz * u + nz);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  for (let i = N; i >= 0; i--) {
    const u = i / N;
    const [x, y] = pr(X0 + dx * u - nx, 0, zd0 + dz * u - nz);
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function drawGround(env: Env, time: number) {
  const ctx = env.ctx;
  const cam = env.cam;
  const halfW = VW / (2 * cam.zoom) + 40, halfH = VH / (2 * cam.zoom) + 40;
  const Lx = cam.x - halfW, Rx = cam.x + halfW, B = cam.y + halfH;
  const yFar = pr(0, 0, FAR_Z)[1];
  const g = ctx.createLinearGradient(0, yFar, 0, B);
  g.addColorStop(0, '#3f7f5e');
  g.addColorStop(0.35, '#2f8a40');
  g.addColorStop(0.7, '#2c8a3c');
  g.addColorStop(1, '#236a31');
  ctx.fillStyle = g;
  ctx.fillRect(Lx, yFar - 1, Rx - Lx, B - yFar + 1);
  // Mowing stripes (5 m bands parallel to the goal line, converging on the vanishing point).
  ctx.fillStyle = 'rgba(190,255,190,0.065)';
  for (let k = -12; k < 6; k += 2) {
    const X0 = k * 5, X1 = X0 + 5;
    const a = pr(X0, 0, -9), b = pr(X1, 0, -9), c = pr(X1, 0, FAR_Z), d = pr(X0, 0, FAR_Z);
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.lineTo(c[0], c[1]);
    ctx.lineTo(d[0], d[1]);
    ctx.closePath();
    ctx.fill();
  }
  // Pitch lines: the goal line (to the far corner), the six-yard box and the penalty box's far sides.
  ctx.fillStyle = 'rgba(238,244,255,0.78)';
  groundStrip(ctx, 0, -12, 0, 34, 0.12);
  groundStrip(ctx, -5.5, 9.16, 0, 9.16, 0.12);
  groundStrip(ctx, -5.5, -9.16, -5.5, 9.16, 0.12);
  groundStrip(ctx, -16.5, 20.16, 0, 20.16, 0.12);
  // Distance haze.
  const hb = ctx.createLinearGradient(0, yFar - 2, 0, yFar + 34);
  hb.addColorStop(0, 'rgba(170,205,240,0.6)');
  hb.addColorStop(1, 'rgba(170,205,240,0)');
  ctx.fillStyle = hb;
  ctx.fillRect(Lx, yFar - 2, Rx - Lx, 36);
  // Floodlight pool on the goal mouth (cool white, soft).
  ctx.globalCompositeOperation = 'lighter';
  const [px, py] = pr(-0.5, 0, 0.5);
  drawGlow(ctx, glowOf([110, 160, 205]), px, py, 300, 0.2, 1.4, 0.2);
  // Dew sparkles on the turf.
  for (const p of sparks) {
    const [x, y] = pr(p.X, 0, p.zd);
    if (x < Lx || x > Rx || y > B) continue;
    const tw = Math.pow(Math.max(0, Math.sin(p.ph + time * p.f)), 10);
    const sz = Math.max(1 / cam.zoom, 0.9 * sOf(p.zd));
    ctx.globalAlpha = 0.3 + 0.6 * tw;
    ctx.fillStyle = tw > 0.6 ? HEX.ice : 'rgb(150,220,255)';
    ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

/** The rolling pressure ring (stamp 3's expanding edge): a wave of flattening grass. Behind the front the turf lies
 *  pale and pressed; the front itself is soft and broken (navy halo, cyan body, ice where it is strongest), never a
 *  crisp painted line, and it fades toward the ends of the arc. */
function drawRing(env: Env, tau: number, t: number) {
  const a = ringA(tau);
  if (a <= 0) return;
  const ctx = env.ctx;
  const R = ringR(tau);
  const TH = 0.95, N = 40;
  const pt = (r: number, th: number) => pr(RING.X + Math.cos(th) * r, 0, RING.zd + Math.sin(th) * r);
  ctx.save();
  // Pressed grass behind the front: brightest right behind it, fading inward and toward the ends of the arc.
  const steps = [[0, 0.3, 0.3], [0.3, 0.75, 0.2], [0.75, 1.5, 0.1], [1.5, 2.6, 0.05]] as const;
  for (let i = 0; i < N; i++) {
    const u = i / N;
    const th0 = lerp(-TH, TH, u), th1 = lerp(-TH, TH, (i + 1) / N);
    const ends = Math.pow(Math.sin(Math.PI * (u + 0.5 / N)), 0.8);
    for (const [d0, d1, al] of steps) {
      const r0 = Math.max(0.05, R - d1), r1 = Math.max(0.05, R - d0);
      const p0 = pt(r1, th0), p1 = pt(r1, th1), p2 = pt(r0, th1), p3 = pt(r0, th0);
      ctx.globalAlpha = al * a * ends;
      ctx.fillStyle = HEX.pressed;
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0] + 0.3, p1[1]);
      ctx.lineTo(p2[0] + 0.3, p2[1]);
      ctx.lineTo(p3[0], p3[1]);
      ctx.closePath();
      ctx.fill();
    }
  }
  // The front: short soft segments whose strength wanders along the arc (turbulent, never one taut line).
  const lw = 1 / env.cam.zoom;
  ctx.lineCap = 'round';
  for (let pass = 0; pass < 3; pass++) {
    ctx.globalCompositeOperation = pass === 0 ? 'source-over' : 'lighter';
    ctx.strokeStyle = pass === 0 ? HEX.navy : pass === 1 ? HEX.cyan : HEX.ice;
    ctx.lineWidth = (pass === 0 ? 6 : pass === 1 ? 3 : 1.2) * lw;
    for (let i = 0; i < N; i++) {
      const u = i / N;
      const th0 = lerp(-TH, TH, u), th1 = lerp(-TH, TH, (i + 1) / N);
      const ends = Math.sin(Math.PI * u);
      const nz = 0.5 + 0.5 * Math.sin(i * 1.7 + t * 9) * Math.cos(i * 0.63 - t * 5);
      const k = a * ends * nz;
      const al = pass === 0 ? 0.3 * k : pass === 1 ? 0.5 * k : nz > 0.7 ? 0.8 * k : 0;
      if (al <= 0.01) continue;
      const lift = pass === 0 ? 0 : 0.6;
      const [x0, y0] = pt(R, th0), [x1, y1] = pt(R, th1);
      ctx.globalAlpha = al;
      ctx.beginPath();
      ctx.moveTo(x0, y0 - lift);
      ctx.lineTo(x1, y1 - lift);
      ctx.stroke();
    }
  }
  // A low, soft wall of shoved air riding the front (normal blend, turbulent).
  ctx.globalCompositeOperation = 'source-over';
  for (let i = 1; i < 12; i++) {
    const u = i / 12;
    const [x, y] = pt(R + 0.1, lerp(-TH, TH, u));
    const s = sOf(RING.zd + Math.sin(lerp(-TH, TH, u)) * R);
    const w = 0.5 + 0.5 * Math.sin(i * 2.3 + t * 7);
    drawGlow(ctx, glowOf([220, 240, 255]), x, y - 6 * s, 16 * s, 0.12 * a * w * Math.sin(Math.PI * u), 1.4, 0.7);
  }
  ctx.restore();
}

/** Lean of a blade (radians, + = toward the goal) and how pressed (pale) it is: idle sway, flattened by the rolling
 *  ring, then bowed by the front as it sweeps through. */
function bladeLean(b: Blade, t: number, tau: number): [number, number] {
  let lean = Math.sin(b.ph + t * 2.1) * 0.12;
  let press = 0;
  const d = Math.hypot(b.X - RING.X, b.zd - RING.zd);
  const over = ringR(tau) - d;
  if (over > 0) {
    const f = clamp(over / 0.35) * (1 - 0.55 * clamp((over - 0.6) / 3));
    lean += 1.25 * f;
    press = Math.max(press, f);
  }
  const [sx] = pr(b.X, 0, b.zd);
  const arrive = 0.69 + clamp(sx / 560) * 0.16;
  if (t >= arrive) {
    const g = clamp((t - arrive) / 0.06) * (1 - 0.5 * clamp((t - arrive - 0.15) / 0.5));
    lean += 1.0 * g;
    press = Math.max(press, g * 0.6);
  }
  return [lean, press];
}

function drawBlades(env: Env, t: number, tau: number, front: boolean, keeperZd: number) {
  const ctx = env.ctx;
  ctx.save();
  ctx.lineWidth = 1.7 / env.cam.zoom;
  for (let pass = 0; pass < 3; pass++) {
    ctx.strokeStyle = pass === 0 ? '#2a6e36' : pass === 1 ? '#57b85e' : '#a8e898';
    ctx.beginPath();
    for (const b of blades) {
      if (front !== b.zd < keeperZd) continue;
      const [lean, press] = bladeLean(b, t, tau);
      const want = press > 0.45 ? 2 : b.c > 0.5 ? 1 : 0;
      if (want !== pass) continue;
      const s = sOf(b.zd);
      const [x, y] = pr(b.X, 0, b.zd);
      const h = b.h * PXM * s;
      const l = clamp(lean, -1.45, 1.45);
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + Math.sin(l) * h * 0.4, y - h * 0.6 * Math.cos(l * 0.6), x + Math.sin(l) * h, y - Math.cos(l) * h);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/** Out-of-focus foreground grass right at the lens (2 variants), pre-blurred once. */
function makeFgBlades(): HTMLCanvasElement[] {
  const out: HTMLCanvasElement[] = [];
  const shapes = [
    [[30, 40, 10, 6], [72, 70, 24, 5], [118, 26, -6, 6]],
    [[44, 56, -20, 6], [98, 34, 28, 7]],
  ];
  for (const sh of shapes) {
    const c = document.createElement('canvas');
    c.width = 170;
    c.height = 160;
    const g = c.getContext('2d')!;
    g.filter = 'blur(4px)';
    for (const [bx, tipY, lean, w] of sh) {
      g.fillStyle = tipY > 40 ? 'rgb(14,38,30)' : 'rgb(8,24,22)';
      g.beginPath();
      g.moveTo(bx - w, 160);
      g.quadraticCurveTo(bx - w * 0.4 + lean * 0.35, (160 + tipY) / 2, bx + lean, tipY);
      g.quadraticCurveTo(bx + w * 0.5 + lean * 0.4, (160 + tipY) / 2 + 6, bx + w, 160);
      g.closePath();
      g.fill();
    }
    out.push(c);
  }
  return out;
}

// ---------------------------------------------------------------- drawing: the goal frame

function drawPost(ctx: CanvasRenderingContext2D, zd: number, kx: number) {
  const [x0, yT] = pr(-PW / 2, BAR, zd);
  const [x1, yB] = pr(PW / 2, 0, zd);
  const X0 = x0 + kx, X1 = x1 + kx;
  const w = X1 - X0;
  ctx.fillStyle = '#180411';
  ctx.globalAlpha = 0.55;
  ctx.fillRect(X0 - 0.6, yT - 0.6, w + 1.2, yB - yT + 0.6);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#f4f6ff';
  ctx.fillRect(X0, yT, w, yB - yT);
  ctx.fillStyle = '#b8c2dc';
  ctx.fillRect(X0 + w * 0.62, yT, w * 0.38, yB - yT);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillRect(X0 + w * 0.12, yT, Math.max(0.5, w * 0.16), yB - yT);
}

function drawBar(ctx: CanvasRenderingContext2D, kx: number) {
  const a = pr(-PW / 2, BAR, -POST), b = pr(-PW / 2, BAR, POST);
  const c = pr(-PW / 2, BAR - BAR_T, POST), d = pr(-PW / 2, BAR - BAR_T, -POST);
  const quad = (p: [number, number][], grow = 0) => {
    ctx.beginPath();
    ctx.moveTo(p[0][0] + kx + grow, p[0][1] - grow);
    ctx.lineTo(p[1][0] + kx - grow, p[1][1] - grow);
    ctx.lineTo(p[2][0] + kx - grow, p[2][1] + grow);
    ctx.lineTo(p[3][0] + kx + grow, p[3][1] + grow);
    ctx.closePath();
  };
  ctx.fillStyle = 'rgba(24,4,17,0.55)';
  quad([a, b, c, d], 0.6);
  ctx.fill();
  ctx.fillStyle = '#f4f6ff';
  quad([a, b, c, d]);
  ctx.fill();
  // Shaded underside (the lens looks slightly up at it).
  const m1 = pr(-PW / 2, BAR - BAR_T * 0.4, -POST), m2 = pr(-PW / 2, BAR - BAR_T * 0.4, POST);
  ctx.fillStyle = '#b8c2dc';
  quad([m1, m2, c, d]);
  ctx.fill();
}

/** The bar's underside lit cyan where the ball slips under it (centred on the ball's screen x, sliding with it): an
 *  additive cyan glow and an ice edge, over a navy halo. */
function drawBarLight(env: Env, bx: number, a: number, kx: number) {
  if (a <= 0.01) return;
  const ctx = env.ctx;
  const [ax, ay] = pr(-PW / 2, BAR - BAR_T, -POST), [fx, fy] = pr(-PW / 2, BAR - BAR_T, POST);
  const yAt = (x: number) => lerp(fy, ay, clamp((x - fx) / (ax - fx)));
  // Only under the bar: it fades in as the ball's x comes under the far end.
  a *= clamp((bx - fx + 4) / 10);
  if (a <= 0.01) return;
  const x = Math.max(bx, fx + 6), y = yAt(x);
  const lw = 1 / env.cam.zoom;
  const W = 26;
  ctx.save();
  const g = (c: string, al: number) => {
    const gr = ctx.createLinearGradient(x - W + kx, 0, x + W + kx, 0);
    gr.addColorStop(0, `rgba(${c},0)`);
    gr.addColorStop(0.5, `rgba(${c},${al})`);
    gr.addColorStop(1, `rgba(${c},0)`);
    return gr;
  };
  // Under the bar's bottom edge, against the dark stands (on the white bar face additive cyan would only whiten it).
  ctx.fillStyle = g('10,18,56', 0.7 * a);
  ctx.fillRect(Math.max(fx, x - W) + kx, y + 0.3, W * 2, 6);
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.cyan), x + kx, y + 3, W, 0.85 * a, 1, 0.26);
  ctx.fillStyle = g('70,216,255', 1 * a);
  ctx.fillRect(Math.max(fx, x - W) + kx, y + 0.3, W * 2, 2.4);
  ctx.fillStyle = g('238,251,255', 0.95 * a);
  ctx.fillRect(Math.max(fx, x - W * 0.6) + kx, y + 0.3, W * 1.2, Math.max(lw, 0.8));
  ctx.restore();
}

// ---------------------------------------------------------------- drawing: the net

function drawNetPanels(env: Env, which: 'behind' | 'near', t: number, n: NetEnvelope) {
  const ctx = env.ctx;
  const lw = 1 / env.cam.zoom;
  // The mesh pulls taut and catches the floodlights as it balloons; the front lights it ice for a few frames.
  const taut = 1 + 0.55 * clamp(n.bulge / 0.85);
  const hitGlow = t >= FRONT ? 1 - clamp((t - FRONT) / 0.12) : 0;
  ctx.save();
  ctx.lineWidth = lw;
  ctx.lineJoin = 'round';
  const panels: [Float64Array, number, number, number][] = which === 'behind'
    ? [[meshFar, NS, NB, 0.32], [meshBack, NA, NB, 0.38], [meshRoof, NR, NA, 0.48]]
    : [[meshNear, NS, NB, 0.48]];
  for (const [buf, c, r, al] of panels) {
    ctx.strokeStyle = `rgba(222,236,255,${clamp(al * taut)})`;
    strokeGrid(ctx, buf, c, r);
  }
  if (hitGlow > 0) {
    ctx.lineWidth = 2.5 * lw;
    for (const [buf, c, r] of panels) {
      ctx.strokeStyle = `rgba(10,18,56,${0.2 * hitGlow})`;
      strokeGrid(ctx, buf, c, r);
    }
    ctx.lineWidth = lw;
    ctx.globalCompositeOperation = 'lighter';
    for (const [buf, c, r] of panels) {
      ctx.strokeStyle = `rgba(120,225,255,${0.45 * hitGlow})`;
      strokeGrid(ctx, buf, c, r);
    }
  }
  ctx.restore();
  // Dew beads still hanging on the knots (they twinkle; the late boom blasts them off).
  ctx.save();
  for (const b of beads) {
    if (b.gone) continue;
    if ((which === 'near') !== (b.panel === 2)) continue;
    const [x, y] = meshXY(b.panel, b.a, b.b);
    const tw = Math.pow(Math.max(0, Math.sin(b.ph + t * 5.3)), 8);
    const r = lw * (1.1 + 0.5 * tw);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = HEX.navy;
    ctx.fillRect(x - r - lw * 0.5, y - r - lw * 0.5, (r + lw * 0.5) * 2, (r + lw * 0.5) * 2);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.6 + 0.4 * tw;
    ctx.fillStyle = tw > 0.5 ? HEX.ice : 'rgb(160,226,255)';
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    if (tw > 0.6) drawGlow(ctx, glowOf(PAL.cyan), x, y, 10 * lw, 0.3 * tw);
  }
  ctx.restore();
}

/** The front's footprint on the goal (the late boom): a squashed ring of shoved air blasting out across the back
 *  net with the dew beads (the same ellipse and speed), soft and broken like the turf ring's front (navy halo, cyan
 *  body, ice where it is strongest), gone in 0.22 s. */
const FOOT = { dur: 0.22, k: 0.47 };
function drawFootprint(env: Env, t: number) {
  const age = t - FRONT;
  if (age < 0 || age >= FOOT.dur) return;
  const ctx = env.ctx;
  const [cx, cy] = pr(xBack(1.2), 1.2, 0.4);
  const R = 60 + 87.5 * (1 - Math.exp(-2 * age));
  const a = Math.pow(1 - age / FOOT.dur, 1.5);
  const lw = 1 / env.cam.zoom;
  const N = 64;
  ctx.save();
  ctx.lineCap = 'round';
  for (let pass = 0; pass < 3; pass++) {
    ctx.globalCompositeOperation = pass === 0 ? 'source-over' : 'lighter';
    ctx.strokeStyle = pass === 0 ? HEX.navy : pass === 1 ? HEX.cyan : HEX.ice;
    ctx.lineWidth = (pass === 0 ? 7 : pass === 1 ? 3 : 1.2) * lw;
    for (let i = 0; i < N; i++) {
      const th0 = (i / N) * TAU, th1 = ((i + 1) / N) * TAU;
      const nz = 0.5 + 0.5 * Math.sin(i * 1.7 + t * 9) * Math.cos(i * 0.63 - t * 5);
      const al = (pass === 0 ? 0.32 : pass === 1 ? 0.55 : nz > 0.65 ? 0.85 : 0) * a * nz;
      if (al <= 0.01) continue;
      ctx.globalAlpha = al;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(th0) * R, cy + Math.sin(th0) * R * FOOT.k);
      ctx.lineTo(cx + Math.cos(th1) * R, cy + Math.sin(th1) * R * FOOT.k);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the ball and its air

function ballNow(tau: number, n: NetEnvelope): P3 {
  if (tau < TAU_HIT) return ballFlight(tau);
  // Lodged in the corner: it rides the dimple and the balloon.
  const p = netPoint(0, (POST - IMP.zd) / (2 * POST), 1 - IMP.H / BAR, n);
  return { X: p.X - 0.13, H: IMP.H - 0.02 * clamp((tau - TAU_HIT) / 0.3), zd: IMP.zd };
}

/** The vapour trail in screen px: the ball's path over the last 0.03 sim-s (about 1.4 m), frozen in the net. */
function trailPts(env: Env, tau: number): TrailPt[] {
  const t1 = Math.min(tau, TAU_HIT);
  const t0 = t1 - 0.03;
  const pts: TrailPt[] = [];
  for (let i = 0; i < 18; i++) {
    const p = ballFlight(lerp(t0, t1, i / 17));
    const [x, y] = pr(p.X, p.H, p.zd);
    const [sx, sy] = toScreen(env, x, y);
    pts.push({ x: sx, y: sy });
  }
  return pts;
}

// ---------------------------------------------------------------- the keeper

function drawKeeper(env: Env, tau: number) {
  const ctx = env.ctx;
  const k = keeperAt(tau);
  const [gx, gy] = pr(k.X, 0, k.zd);
  // Contact shadow on the turf (soft navy, stretched as he goes flat).
  const flat = clamp(Math.abs(k.pose.spin) / 1.5);
  const air = clamp((k.hip - lowest(k.pose)) / 18);
  ctx.save();
  ctx.globalAlpha = 0.38 - 0.16 * air;
  ctx.fillStyle = HEX.navy;
  ctx.beginPath();
  ctx.ellipse(gx - 14 * flat, gy + 1, 20 + 26 * flat - 6 * air, 4, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
  // Blitted in screen space at exactly x2 (square, stable pixels through the push-in): his ground point is
  // projected, then the hip is lifted by its height at x2, so his lowest point stays on the turf at any zoom.
  const r = renderPuppet(KEEPER_KIT, k.pose, { k: 1, facing: -1 });
  const [sx, sgy] = toScreen(env, gx, gy);
  env.screen();
  drawPuppet(ctx, r, Math.round(sx), Math.round(sgy - k.hip * 2), 2);
  env.world();
}

// ---------------------------------------------------------------- the shot

export const shotFront: Shot = {
  name: 'Pressure front',
  dur: DUR,
  seed: 305,
  muffle: MUFFLE[5],
  rate: rateAt,
  cues: [
    { at: 0, fn: (env) => env.sfx.crowd(3, 0.5) },
    { at: 0.3, fn: (env) => env.sfx.whoosh(0.4, 400, 2500, 0.4) },
    // The tick lands on the frame the ball meets the mesh (picture first, never before it).
    { at: T_HIT, fn: (env) => env.sfx.kick(0.15) },
    { at: FRONT, fn: (env) => (env.sfx.sonicBoom(0.8), env.sfx.boom(0.6, 0.2), env.sfx.kick(0.5)) },
    { at: 0.85, fn: (env) => env.sfx.crackle(0.6, 0.12) },
    { at: 0.9, fn: (env) => env.sfx.gust(1.4) },
  ],
  prepare() {
    if (!fgBlades) fgBlades = makeFgBlades();
  },
  init(env) {
    env.sfx.clearBus();
    spin = new BallSpin();
    spin.rotate(0.4, 1, 0.3, 0.9);
    ringHit = tickDone = boomDone = landDone = false;
    dewAcc = mistAcc = dropAcc = 0;
    if (!fgBlades) fgBlades = makeFgBlades();
    // Static set dressing from its own seed (independent of the simulation RNG).
    const r = new Rng(3051);
    beads = [];
    for (let i = 0; i < 90; i++) beads.push({ panel: 0, a: r.next(), b: r.range(0.05, 0.92), ph: r.range(0, TAU), gone: false });
    for (let i = 0; i < 26; i++) beads.push({ panel: 1, a: r.range(0.1, 1), b: r.range(0.05, 0.92), ph: r.range(0, TAU), gone: false });
    for (let i = 0; i < 60; i++) beads.push({ panel: 2, a: r.range(0.05, 1), b: r.range(0.05, 0.95), ph: r.range(0, TAU), gone: false });
    blades = [];
    for (let i = 0; i < 300; i++) blades.push({ X: r.range(-5.2, 0.3), zd: r.range(-3.8, 5.5), h: r.range(0.07, 0.15), ph: r.range(0, TAU), c: r.next() });
    sparks = [];
    for (let i = 0; i < 170; i++) sparks.push({ X: r.range(-9, 4), zd: r.range(-4, 30), ph: r.range(0, TAU), f: r.range(1.5, 4) });
    const c = camAt(0);
    env.cam.set(c.x, c.y, c.z, 0);
    env.cam.shakeRoll = 0; // GALE keeps every horizon level
    env.cam.shakeAmp = 9;
  },
  update(env, t, dt) {
    const rng = env.rng;
    const tau = simT(t);
    // Dew kicked up along the ring's leading edge as it rolls (the visible arc only).
    const ra = ringA(tau);
    if (ra > 0.05) {
      dewAcc += dt * 520 * ra;
      const R = ringR(tau);
      while (dewAcc >= 1) {
        dewAcc -= 1;
        const th = rng.range(-1.2, 1.2);
        const X = RING.X + Math.cos(th) * R, zd = RING.zd + Math.sin(th) * R;
        if (zd < -6) continue;
        const [x, y] = pr(X, 0, zd);
        const s = sOf(zd);
        const pick = rng.next();
        env.parts.spawn({
          kind: pick < 0.6 ? PK.Glow : PK.Pixel, x, y: y - 1, vx: rng.range(30, 110) * s, vy: -rng.range(50, 150) * s, ay: 520 * s, drag: 1.4,
          max: rng.range(0.25, 0.5), s0: rng.range(1.2, 2.2) * s, s1: 0.7, ramp: pick < 0.85 ? 'dew' : 'grass', r0: 0, r1: 0.7, a0: 0.95, a1: 0,
          add: pick < 0.85, layer: zd < KZ ? 1 : 0,
        });
      }
    }
    // The ring sweeps his feet.
    if (!ringHit && tau >= 0.14) {
      ringHit = true;
      const [x, y] = pr(KX, 0, KZ);
      for (let i = 0; i < 18; i++)
        env.parts.spawn({
          kind: PK.Glow, x: x + rng.range(-14, 14), y: y - 1, vx: rng.range(-30, 120), vy: -rng.range(60, 180), ay: 520, drag: 1.2,
          max: rng.range(0.3, 0.6), s0: rng.range(1.2, 2.2), s1: 0.7, ramp: 'dew', r0: 0, r1: 0.7, a0: 1, a1: 0, layer: 1,
        });
      for (let i = 0; i < 6; i++)
        env.parts.spawn({
          kind: PK.Smoke, x: x + rng.range(-12, 12), y: y - 2, vx: rng.range(20, 90), vy: -rng.range(5, 25), drag: 2.5,
          max: rng.range(0.4, 0.7), s0: rng.range(4, 7), s1: rng.range(12, 18), ramp: i % 2 ? 'dust' : 'white', r0: 0.2, r1: 1, a0: 0.25, a1: 0, add: false, layer: 1,
        });
      env.cam.hit(0.12);
    }
    // He lands low.
    if (!landDone && tau >= 0.42) {
      landDone = true;
      const k = keeperAt(0.42);
      const [x, y] = pr(k.X, 0, k.zd);
      for (let i = 0; i < 10; i++)
        env.parts.spawn({
          kind: PK.Smoke, x: x + rng.range(-40, 10), y: y - 1, vx: rng.range(-90, 30), vy: -rng.range(4, 26), drag: 2.6,
          max: rng.range(0.5, 0.9), s0: rng.range(4, 8), s1: rng.range(14, 24), ramp: i % 3 ? 'dust' : 'white', r0: 0.2, r1: 1, a0: 0.28, a1: 0, add: false, layer: 1,
        });
      for (let i = 0; i < 12; i++)
        env.parts.spawn({
          kind: PK.Glow, x: x + rng.range(-40, 10), y: y - 1, vx: rng.range(-60, 60), vy: -rng.range(50, 140), ay: 520, drag: 1,
          max: rng.range(0.3, 0.6), s0: rng.range(1, 1.8), s1: 0.6, ramp: 'dew', r0: 0, r1: 0.7, a0: 1, a1: 0, layer: 1,
        });
    }
    const n = netExhale(t, FRONT, T_HIT);
    // The ball touches the mesh: only a few beads shake off at the corner (the tick).
    if (!tickDone && tau >= TAU_HIT) {
      tickDone = true;
      env.cam.hit(0.06);
      buildMesh(n, 0);
      for (const b of beads) {
        if (b.panel !== 0) continue;
        const zd = POST - 2 * POST * b.a, H = BAR * (1 - b.b);
        if (Math.hypot(zd - IMP.zd, H - IMP.H) > 0.55) continue;
        b.gone = true;
        const [x, y] = meshXY(0, b.a, b.b);
        env.parts.spawn({
          kind: PK.Glow, x, y, vx: rng.range(-40, 40), vy: rng.range(-50, 10), ay: 520, drag: 0.8,
          max: rng.range(0.4, 0.7), s0: rng.range(1, 1.6), s1: 0.6, ramp: 'dew', r0: 0, r1: 0.6, a0: 1, a1: 0.2, layer: 0,
        });
      }
    }
    // The late boom: the front's footprint on the goal, a squashed ring of dew and dust blasted off the mesh.
    if (!boomDone && t >= FRONT) {
      boomDone = true;
      env.cam.hit(0.42);
      buildMesh(netExhale(FRONT + 0.06, FRONT, T_HIT), 0);
      const [cx, cy] = pr(xBack(1.2), 1.2, 0.4);
      for (const b of beads) {
        if (b.gone) continue;
        b.gone = true;
        const [x, y] = meshXY(b.panel, b.a, b.b);
        const dx = x - cx, dy = (y - cy) * 1.8;
        const d = Math.hypot(dx, dy) || 1;
        const sp = rng.range(70, 190);
        env.parts.spawn({
          kind: rng.next() < 0.75 ? PK.Glow : PK.Pixel, x, y, vx: (dx / d) * sp + rng.range(-20, 20), vy: (dy / d) * sp * 0.5 - rng.range(0, 40), ay: 420, drag: 1.6,
          max: rng.range(0.5, 1), s0: rng.range(1.1, 2), s1: 0.7, ramp: 'dew', r0: 0, r1: 0.7, a0: 1, a1: 0.1, layer: b.panel === 2 ? 1 : 0,
        });
      }
      // 70 beads on the footprint's ellipse (drawFootprint), at its speed, so they hold the elliptical front for
      // ~0.1 s before they scatter.
      for (let i = 0; i < 70; i++) {
        const th = rng.range(0, TAU);
        const x = cx + Math.cos(th) * 60, y = cy + Math.sin(th) * 28;
        const sp = rng.range(150, 200);
        env.parts.spawn({
          kind: PK.Glow, x, y, vx: Math.cos(th) * sp, vy: Math.sin(th) * sp * 0.48, ay: 300, drag: 2,
          max: rng.range(0.4, 0.8), s0: rng.range(1.2, 2.4), s1: 0.6, ramp: 'dew', r0: 0, r1: 0.8, a0: 1, a1: 0, layer: 1,
        });
      }
      for (let i = 0; i < 14; i++) {
        const th = rng.range(0, TAU);
        env.parts.spawn({
          kind: PK.Smoke, x: cx + Math.cos(th) * 50, y: cy + Math.sin(th) * 26, vx: Math.cos(th) * rng.range(60, 140), vy: Math.sin(th) * rng.range(20, 60), drag: 2.4,
          max: rng.range(0.5, 0.9), s0: rng.range(8, 14), s1: rng.range(24, 40), ramp: i % 2 ? 'white' : 'dust', r0: 0.1, r1: 0.8, a0: 0.24, a1: 0, add: false, layer: 1,
        });
      }
      // The gust flattens the keeper: dust blown off him toward the goal.
      const k = keeperAt(simT(FRONT));
      const [kx, ky] = pr(k.X, 0, k.zd);
      for (let i = 0; i < 10; i++)
        env.parts.spawn({
          kind: PK.Smoke, x: kx + rng.range(-50, 20), y: ky - rng.range(0, 8), vx: rng.range(60, 180), vy: -rng.range(0, 20), drag: 2.2,
          max: rng.range(0.4, 0.8), s0: rng.range(4, 8), s1: rng.range(14, 22), ramp: 'dust', r0: 0.2, r1: 1, a0: 0.3, a1: 0, add: false, layer: 1,
        });
    }
    // The exhale: a fan of dew mist out of the mesh toward the lens, and a curtain of droplets off the bar and net top.
    if (n.mist > 0) {
      mistAcc += dt * 110 * n.mist;
      buildMesh(n, 0);
      while (mistAcc >= 1) {
        mistAcc -= 1;
        const near = rng.next() < 0.5;
        const [x, y] = near ? meshXY(2, rng.range(0.2, 0.9), rng.range(0.15, 0.8)) : meshXY(0, rng.range(0.05, 0.6), rng.range(0.1, 0.8));
        env.parts.spawn({
          kind: PK.Smoke, x, y, vx: near ? rng.range(20, 80) : -rng.range(50, 140), vy: near ? rng.range(10, 40) : rng.range(-15, 20), drag: 1.4,
          max: rng.range(0.6, 1.1), s0: rng.range(5, 9), s1: rng.range(26, 46), ramp: 'white', r0: 0.1, r1: 0.6, a0: 0.18, a1: 0, add: false, layer: 1,
        });
      }
    }
    if (t >= 0.9 && t < 1.32) {
      dropAcc += dt * 400;
      while (dropAcc >= 1) {
        dropAcc -= 1;
        const onBar = rng.next() < 0.55;
        const zd = rng.range(-POST, POST);
        const p = onBar ? { X: 0, H: BAR - BAR_T, zd } : netPoint(3, 1, (POST - zd) / (2 * POST), n);
        const [x, y] = pr(p.X, p.H, p.zd);
        const kind = rng.next();
        env.parts.spawn({
          kind: kind < 0.45 ? PK.Glow : kind < 0.8 ? PK.Pixel : PK.Streak, x: x + rng.range(-1, 1), y: y + rng.range(0, 2), vx: rng.range(-12, 12), vy: rng.range(10, 60), ay: 520, drag: 0.4,
          max: rng.range(0.5, 1), s0: kind < 0.8 ? rng.range(1.1, 2.1) : 0.9, s1: kind < 0.8 ? 0.9 : 0.6, ramp: 'dew', r0: 0, r1: 0.6, a0: 1, a1: 0.3, k: 0.7, layer: 1,
        });
      }
    }
    // Near-zero spin: the knuckle detail turns at most ~12 deg/s.
    spin.rotate(0.3, 1, 0.2, dt * 0.2);
    const c = camAt(t);
    env.cam.set(c.x, c.y, c.z, 0);
  },
  render(env, t) {
    const { ctx, fx, cam } = env;
    const tau = simT(t);
    const n = netExhale(t, FRONT, T_HIT);
    const kx = n.knock / cam.zoom;
    buildMesh(n, kx);
    const kp = keeperAt(tau);

    // ---- the stands (own parallax), then the world.
    drawStands(env, t);
    env.world();
    drawGround(env, t);
    drawRing(env, tau, t);
    drawBlades(env, t, tau, false, kp.zd);

    // ---- the goal behind the keeper: far and back nets, roof, far post, crossbar.
    drawNetPanels(env, 'behind', t, n);
    drawPost(ctx, POST, kx);
    drawBar(ctx, kx);
    drawFootprint(env, t);
    env.parts.draw(ctx, 0);

    // ---- the keeper.
    drawKeeper(env, tau);

    // ---- the ball: vapour trail and Mach cone (screen space), then the ball.
    const b = ballNow(tau, n);
    const [bx, by] = pr(b.X, b.H, b.zd);
    const bxk = b.X > 0 ? bx + kx : bx;
    const after = clamp((tau - TAU_HIT) / 0.25);
    if (toScreen(env, bxk, by)[0] > -40) {
      env.screen();
      const [sbx, sby] = toScreen(env, bxk, by);
      // After the hit the frozen trail never sits as a taut bar: it billows up, widens and curls apart (~0.18 s,
      // fastest at first).
      const puff = clamp((tau - TAU_HIT) / 0.18);
      const pe = 1 - (1 - puff) * (1 - puff);
      const pts = trailPts(env, tau);
      if (puff > 0)
        for (let i = 0; i < pts.length; i++) {
          const f = 1 - i / 17;
          pts[i].y -= 16 * pe * f + 4 * Math.sin(i * 1.3 + t * 11) * pe;
          pts[i].x += 6 * pe * f;
        }
      vaporRibbon(ctx, pts, 11 + 22 * pe, t, (1 - puff) * (1 - puff), 12);
      const p0 = pts[pts.length - 3], p1 = pts[pts.length - 1];
      const dir = Math.atan2(p1.y - p0.y, p1.x - p0.x);
      machCone(ctx, sbx - 10 * after, sby, dir, 150 * (1 - after * 0.6), 1 - clamp((tau - TAU_HIT) / 0.08));
      env.world();
      const glow = lerp(0.8, 0.35, after);
      drawBall(env, spin, Math.round(bxk), Math.round(by), 6, 1, 0.4, glow, 'cobalt');
    }
    // The bar's underside lights cyan as the ball slips under it (it fades once the ball is under the roof net).
    const xPass = ballFlight(Math.min(tau, TAU_HIT)).X;
    const lit = Math.exp(-(((xPass + 0.1) / 0.8) ** 2)) * (1 - after);
    drawBarLight(env, bxk, lit, 0);
    // The corner tick: a small ice sparkle where it meets the mesh.
    if (t >= T_HIT && t < T_HIT + 0.15) {
      env.screen();
      const [sx, sy] = toScreen(env, bxk + 8, by);
      const k = 1 - (t - T_HIT) / 0.15;
      sparkleCyan(ctx, sx, sy, 18 * k, k, 0.4);
      env.world();
    }

    // ---- in front: the near side net, the near post, the near grass.
    drawNetPanels(env, 'near', t, n);
    drawPost(ctx, -POST, kx);
    drawBlades(env, t, tau, true, kp.zd);
    env.parts.draw(ctx, 1);

    // ---- screen space: out-of-focus blades at the lens.
    env.screen();
    if (fgBlades) {
      const zk = Math.pow(cam.zoom / 1.9, 1.3);
      ctx.globalAlpha = 0.85;
      const items = [[40, 0, 1.1], [600, 1, 1.0]] as const;
      for (const [x0, v, s] of items) {
        const im = fgBlades[v];
        const cx = VW / 2 + (x0 - VW / 2 - (cam.x - 258) * 1.2) * zk;
        const w = im.width * s * zk, h = im.height * s * zk;
        ctx.drawImage(im, cx - w / 2, VH - h * 0.5, w, h);
      }
      ctx.globalAlpha = 1;
    }

    // ---- post.
    galeGrade(fx);
    fx.vignette = 0.4;
    fx.bloom = 0.85;
    fx.bloomThresh = 0.68;
    fx.ca = 0.0012 + (tau < TAU_HIT && t > 0.24 ? 0.0008 : 0) + (t >= FRONT ? 0.0025 * (1 - clamp((t - FRONT) / 0.2)) : 0);
    // The front: a near-planar refraction band that crosses the goal as it balloons, then one small, short pulse
    // that stays inside the back net (it never reaches the posts, the bar or the ball: the frame shudders once,
    // never rings).
    refractionBand(fx, (t - 0.69) / 0.2, 0.035);
    if (t >= FRONT && t < FRONT + 0.14) {
      const [cx, cy] = pr(xBack(1.2), 1.2, 0.4);
      stampShock(env, cx, cy, t - FRONT, 0.16, 0.012, 0.14);
    }
    const sw = tau - 0.14;
    if (sw >= 0 && sw < 0.2) {
      const k0 = keeperAt(0.14);
      const [fx0, fy0] = pr(k0.X, 0, k0.zd);
      stampShock(env, fx0, fy0, sw, 0.14, 0.022, 0.2);
    }
    if (t >= FRONT && t < FRONT + 0.25) {
      const [cx, cy] = pr(xBack(1.2), 1.2, 0.4);
      const u = (t - FRONT) / 0.25;
      lensAt(env, cx, cy, 0.06 * Math.sin(Math.PI * Math.min(1, u * 2)) * (1 - u), 0.24);
    }
    if (t < 0.05) {
      fx.flash = 0.45 * (1 - t / 0.05);
      fx.flashColor = BLINK.cyan;
    } else if (t >= FRONT && t < FRONT + 0.14) {
      fx.flash = 0.3 * (1 - (t - FRONT) / 0.14);
      fx.flashColor = BLINK.cyan;
    }
    if (t >= DUR - 2.5 / 60) {
      fx.flash = 0.8;
      fx.flashColor = BLINK.navy;
    }
  },
};
