// GALE HAMMER v2 · shot 6 · "Sound barrier" (2.8 s, seed 316): the ball's scene. SPEC.md §6 shot 6.
//
// Story job: wonder, then terror. The ball is the star, huge, and the camera rides it. The air does what no tackle can:
// the wall is beaten by the ball passing under it, and then destroyed by its sound.
//   6a 0.00-1.00  THE RIDE. Side rail at ball height, locked to the 65 px ball (screen x 230 -> 260): it rockets into
//              frame from the left on the whip-pan cut and the lens locks on. The world tears past at ~2800 px/s
//              (a perspective rail: the stands, the boards, the fanning turf stripes, the 18 m line, foreground
//              blades), fx.streak with a sharp hole on the ball, cam.buffet. Its energy shape: the vapour cone (a
//              170 px bell flaring 320 px behind it, streamlines racing back, Mach diamonds, wingtip corkscrews,
//              bow-shock isobars ahead of the nose, a navy pocket so the ball's ice core stays the hottest point),
//              the pressure bubble (fx.lens + its glass rim), the pressed wake with dew-mist walls.
//              0.15 air step 1: the ball dips to 0.15 m (an air sliver under it), a crater blooms in the turf, the
//              bubble squashes, a dew geyser, cam.hit, a shock. 0.25 the wall of three enters right; 0.28 they jump
//              as one; 0.32-0.68 slow motion (0.12): the ball shoots under their airborne boots (a hand's width to
//              spare), the cone's shoulder shoves their shins apart, their shadows smear flat, dew and blades stream
//              off their boots. Nothing happens to them yet. 0.68 full speed: the hanging wall slides out left.
//              0.82 air step 2.
//   6b 1.00-1.95  THE BARRIER. 1.00-1.10 the approach: push 1.45 -> 1.55, time brakes (1 -> 0.06), the cone tightens
//              into a needle (bell 170 -> 80) and brightens, 30 isobars pile up into a pressure wall one ball radius
//              ahead of the nose, the bubble rim turns ice-white, the shriek rises. 1.10 SILENCE (vacuum gap 2) and the
//              world drops to 15 %: the SWING-ORBIT (yaw 90° -> 25° over 0.40 s, swing.ts): floodlight bokeh on 4 depth
//              bands, the stand ring (dark tiers, its crowd crushed to 15 %), the turf's stripes and the wake rotating
//              into perspective with real parallax, slow isobar ripples; at 1.12
//              the needle snaps into the VAPOUR DISC (aspect = cos yaw: a line opening into a circle); zoom 1.55 ->
//              1.25; deep in the dark the wall still hangs in mid-air (staggered, each in his own pose, navy
//              silhouettes against the crowd). 1.50-1.60 THE HALO (rate 0.04): the
//              60 px ball dead centre in a 320 px ice-white disc, the stadium warped in its bubble.
//              1.60 DETONATION (loud, dry, open): isobar impact E6 (1.60: the growing pressure field, smooth bands
//              round a white-hot core with the dark ball printed at its eye) and its negative print E7 (1.667: a quiet
//              ice field, the navy ball, the flung bodies; no rings, lamps, crowd or particles); the disc blows apart
//              into 100 vapour shards and a white blast ring; two shocks; focus lines; radial, CA, bloom; cam.hit 1.0 +
//              shakeAmp 22 + pull-out punch + a one-frame zoom kick + shove; the ball rockets at the lens (60 -> ~150 px
//              in 0.18 s) behind a needle-sharp Mach chevron and tears out past the right edge on a 2-frame streak;
//              80 dew sparks; floodBack.
//              1.65-1.95 THE WALL IS FLUNG: the blast ring sweeps back over the three hanging defenders and throws them
//              apart (A up and away, C down, spinning, growing fast, rim-lit; at the end of the print an ice hit, a
//              wide ring and 14 dew sparks at each chest; blades and dew) against the darkened stadium; defender B is
//              hurled straight at the lens: a tumbling navy silhouette with a continuous ice rim, growing until his
//              body covers most of the frame (1.90-1.93); his boot's studs flash past the lens; the hit (cam.hit +
//              shove + kick) lands with him at 1.89.
//   6c 1.95-2.80  BALL'S-EYE. A 0.06 s whip into the chase POV (drawDownPitch, storm): the eye 1.6 m behind and 0.3 m
//              above the ball, the ball centred low (56 px) in its bubble, the vortex tunnel (vapour rings born at the
//              vanishing point, spinning arcs, sweeping past the lens), turf speed lines, filaments at the frame edges,
//              Mach diamonds, the grass bowing flat in a V AHEAD of the ball. 2.45 air step 3: a 400 px crater ring
//              stamped under the ball, the camera bounces, a dew curtain. The keeper grows out of the goal mouth (front
//              view, lit from below only); 2.30 he sets; 2.56 a scowl and gritted teeth; 2.60 he throws the double-fist
//              punch straight at the lens: his dark gloves (a cyan rim on the knuckles) fill the frame round the ball
//              at 2.76-2.80. Hard cut on contact into shot 7.
//
// Spaces: 6a is a 2.5D perspective rail of this shot (metres; the eye D0 m south of the ball at ball height, following
// the ball's height 75 %); 6b is swing.ts's yaw projection round the ball; 6c is the shared down-pitch view. All three
// are drawn in screen px under the runner's camera held at identity (x 320, y 180, zoom ~1), so cam.hit / shove /
// buffet act on everything. Clocks: the camera, the swing, cues, the muffle and every screen-space effect run on the
// unwarped shot clock t (the brief's times); the world scroll, the ball's flight and every particle run on the warped
// sim clock (a pure table of RATE[6]). Every decal and rig is a pure function of t; particles spawn only in update()
// on env.rng, one-shot bursts behind flags; flickers use hashes or env.frng(). Never the banned word anywhere.

import type { Env, Shot } from '../timeline';
import { STEP } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { TAU, clamp, ease, lerp, type RGB } from '../../engine/math';
import { PK, drawGlow, glowOf, softSprite } from '../../engine/particles';
import { BallSpin, OUTLINE, PixelBuffer, pal3, pack, type Pal3 } from '../../engine/pixel';
import { POSES, P, RIVAL_KIT, RIVAL_KIT_B, RIVAL_KIT_C, joints, mixPose, type Kit, type Pose } from '../../art/puppet';
import { drawDownPitch, projectDecal, type DownPitchView } from '../../art/stadium';
import { focusLines } from '../../art/fx';
import { drawBall, holdTrauma, keys, punch, pushShock, ring, type KeyRow, type PuppetSil } from '../kit';
import {
  HEX, MUFFLE, PAL, PUPPETS, RATE, SHOTS, airSliver, ballPathH, floodBack, galeIso, galeStorm, stormDarken, vacuumGrade,
  warmGale,
} from './common';
import { airCrater, bubbleRim, vaporDisc } from './air';
import { drawSwingGround, swingAspect, swingBokeh, swingProject, swingYaw, type SwingView } from './swing';

const META = SHOTS[5];
const DUR = META.dur;

/** Shot-local times (unwarped clock). */
const T = {
  step1: 0.15, wallIn: 0.25, jump: 0.28, pass: 0.5, slowEnd: 0.68, step2: 0.82, approach: 1.0, silence: 1.1, disc: 1.12,
  halo: 1.5, det: 1.6, iso2: 1.66, isoEnd: 1.73, hitA: 1.665, hitB: 1.68, hitC: 1.695, bodyEnd: 1.935, pov: 1.95,
  set: 2.3, step3: 2.45, cock: 2.56, punch: 2.6,
} as const;
/** t >= x on the 1/60 grid (float-safe). */
const at = (t: number, x: number) => t >= x - 1e-6;
const u01 = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
/** Frame-stable hash in [0, 1). */
const hash = (n: number) => {
  const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
};
const ICE = 'rgb(238,251,255)', CYAN = 'rgb(70,216,255)', NAVY = 'rgb(10,18,56)';
const SNAVY = HEX.stormNavy;

// ---------------------------------------------------------------- the sim clock (pure: the runner's steps of RATE[6])

const SIM = (() => {
  const n = Math.ceil(DUR / STEP) + 2;
  const a = new Float64Array(n);
  for (let k = 1; k < n; k++) a[k] = a[k - 1] + STEP * RATE[6](k * STEP);
  return a;
})();
/** Warped (simulation) seconds elapsed at shot-local t. */
function simAt(t: number): number {
  const f = clamp(t / STEP, 0, SIM.length - 1.001);
  const i = Math.floor(f);
  return lerp(SIM[i], SIM[i + 1], f - i);
}

// ---------------------------------------------------------------- 6a: the ride (a perspective rail, metres)

/** Screen px per metre at the ball plane per unit of zoom (zoom 1.35 = 155 px/m: a defender is 280 px tall). */
const K0 = 155 / 1.35;
/** Depth of the ball plane from the eye (m). */
const D0 = 6;
/** Ride speed (m per sim second): 2800 px/s at zoom 1.35. */
const V = 2800 / 155;
/** The hero ball (2x true scale): art radius 8 drawn at 3 × zoom; its radius in metres in every view of this shot. */
const BALL_R = 8, BALL_RM = 24 / K0;
/** Centre height licence: the hero ball's centre sits this much above the true path so a 0.15 m dip keeps a sliver. */
const HERO_DH = BALL_RM - 0.11;
/** The principal point's row in the ride (the horizon at the eye's height). */
const PY = 212;

const RIDE_ZOOM: KeyRow[] = [[0, 1.35], [T.approach, 1.45, 'linear'], [T.silence, 1.55, 'inOutQuad']];

/** Field x along the flight at sim time s (the story landmarks: step 1 930, the wall 960, step 2 1010, barrier 1045). */
let FXK: [number, number][] = [];
function buildFieldX() {
  FXK = [[0, 905], [simAt(T.step1), 930], [simAt(T.pass), 960], [simAt(T.step2), 1010], [simAt(T.silence), 1043], [simAt(T.det), 1046], [simAt(DUR) + 1, 1050]];
}
function fieldXAtSim(s: number) {
  if (s <= FXK[0][0]) return FXK[0][1];
  for (let i = 1; i < FXK.length; i++) if (s <= FXK[i][0]) return lerp(FXK[i - 1][1], FXK[i][1], (s - FXK[i - 1][0]) / (FXK[i][0] - FXK[i - 1][0]));
  return FXK[FXK.length - 1][1];
}

interface Ride {
  zoom: number;
  /** px per metre at the ball plane. */
  k: number;
  /** Ride odometer (m) of the ball, and of the eye's principal axis. */
  R: number;
  camR: number;
  /** Ball centre height (m, hero licence) and the eye's height (m). */
  hc: number;
  eyeH: number;
  /** Ball on screen. */
  bx: number;
  by: number;
  br: number;
}
function rideAt(t: number): Ride {
  const zoom = keys(RIDE_ZOOM, t);
  const k = K0 * zoom;
  const s = simAt(t);
  const R = V * s;
  const hc = ballPathH(fieldXAtSim(s)) + HERO_DH;
  // The eye follows the ball's height 75 % (the ball bobs 25 % on screen; the turf does the rest).
  const eyeH = 0.45 + 0.75 * (hc - 0.45);
  // The whip-pan landing: the ball rockets in from the left edge and the lens locks on (0.00-0.10), then drifts 230 -> 260.
  // The cut lands ON the ball: frame 0 already holds frame 1's ride position (not a sliver at the frame edge).
  const bx = t < 0.1 ? lerp(-24, 230, ease.outExpo(Math.max(t, STEP) / 0.1)) : lerp(230, 260, clamp((t - 0.1) / 1.0));
  const by = PY - (hc - eyeH) * k;
  return { zoom, k, R, camR: R + (320 - bx) / k, hc, eyeH, bx, by, br: BALL_RM * k };
}
/** Project a ride point: xm along the flight (m, same frame as R), hm above the turf (m), d = depth from the eye (m). */
function rp(r: Ride, xm: number, hm: number, d: number) {
  const s = (r.k * D0) / d;
  return { x: 320 + (xm - r.camR) * s, y: PY - (hm - r.eyeH) * s, s };
}

// ---------------------------------------------------------------- the wall (three puppets, arms linked)

const WALL_KITS: Kit[] = [RIVAL_KIT, RIVAL_KIT_B, RIVAL_KIT_C];
/** Ride depths (m) of A (far), B (the ball's plane), C (near), and their stagger along the flight (m). */
const WALL_D = [7.4, 6.0, 4.4] as const;
const WALL_X = [0.32, 0, -0.2] as const;
const wallXm = (i: number) => V * simAt(T.pass) + WALL_X[i];
/** Puppet units per metre (a standing puppet is ~91 units = 1.8 m). */
const PU_M = 50.5;
const DEG = Math.PI / 180;
const POSE = {
  crouch: mixPose(POSES.stand, POSES.crouch, 0.55),
  // Airborne, knees tucked high, boots hanging under the hips with the studs down (arms out to link).
  jump: P({ torso: 8 * DEG, head: -6 * DEG, thighN: 62 * DEG, kneeN: 96 * DEG, footN: 26 * DEG, thighF: 46 * DEG, kneeF: 100 * DEG, footF: 24 * DEG, armN: 78 * DEG, elbowN: 16 * DEG, armF: 64 * DEG, elbowF: 22 * DEG }),
  // The cone's shoulder shoves their shins back and apart (two flutter positions: socks and shorts ripple).
  shove: P({ torso: 4 * DEG, head: -2 * DEG, thighN: 52 * DEG, kneeN: 116 * DEG, footN: 40 * DEG, thighF: 30 * DEG, kneeF: 106 * DEG, footF: 34 * DEG, armN: 96 * DEG, elbowN: 20 * DEG, armF: 44 * DEG, elbowF: 30 * DEG }),
  shove2: P({ torso: 2 * DEG, head: 0, thighN: 56 * DEG, kneeN: 124 * DEG, footN: 46 * DEG, thighF: 26 * DEG, kneeF: 98 * DEG, footF: 28 * DEG, armN: 104 * DEG, elbowN: 26 * DEG, armF: 52 * DEG, elbowF: 24 * DEG }),
  // The hanging wall in the swing: A reaching up (arms high, knees opened), C tucked low and twisted.
  jumpA: P({ torso: 8 * DEG, head: -6 * DEG, thighN: 62 * DEG, kneeN: 70 * DEG, footN: 26 * DEG, thighF: 46 * DEG, kneeF: 100 * DEG, footF: 24 * DEG, armN: 120 * DEG, elbowN: 16 * DEG, armF: 64 * DEG, elbowF: 22 * DEG }),
  jumpC: P({ torso: -10 * DEG, head: -6 * DEG, thighN: 84 * DEG, kneeN: 124 * DEG, footN: 26 * DEG, thighF: 46 * DEG, kneeF: 100 * DEG, footF: 24 * DEG, armN: 78 * DEG, elbowN: 16 * DEG, armF: 64 * DEG, elbowF: 22 * DEG }),
  blown: POSES.blown,
  blown2: P({ ...POSES.blown, armN: -120 * DEG, armF: 130 * DEG, thighF: 120 * DEG, kneeF: 40 * DEG }),
};
/** Lowest point of a pose below its hip (puppet units), measured once. */
const lowUnits = new Map<string, number>();
function lowOf(name: keyof typeof POSE) {
  let v = lowUnits.get(name);
  if (v === undefined) {
    const j = joints(POSE[name]);
    v = Math.max(j.toeN[1], j.toeF[1], j.ankleN[1]) + 4.5;
    lowUnits.set(name, v);
  }
  return v;
}
/** GALE silhouettes: navy fill with an ice / cyan rim on the lit side. */
const SIL_UP: PuppetSil = { fill: [12, 18, 46], rim: [170, 236, 255], rim2: [46, 92, 170], lx: 0.25, ly: 1 };
const SIL_SWING: PuppetSil = { fill: [10, 16, 40], rim: [170, 236, 255], rim2: [46, 92, 170], lx: 1, ly: -0.2 };
/** A and C flung by the blast: navy bodies with a bright ice rim on the blast side (they must read in the dark third). */
const SIL_FLUNG: PuppetSil = { fill: [8, 14, 40], rim: [238, 251, 255], rim2: [70, 216, 255], lx: 0.8, ly: -0.6 };
/** Defender B at the lens: a flat navy body over an ice copy offset toward the blast, so his rim is one continuous
 * crescent at any scale (a per-pixel rim breaks into dots on stair-stepped edges once magnified). */
const SIL_FLAT: PuppetSil = { fill: [6, 11, 36], rim: [6, 11, 36], rim2: [6, 11, 36], lx: 0.7, ly: -0.7 };
const SIL_ICE: PuppetSil = { fill: [238, 251, 255], rim: [238, 251, 255], rim2: [238, 251, 255], lx: 0.7, ly: -0.7 };
/** B's render buckets (px per unit). */
const B_KK = [1.5, 2, 3, 4, 5] as const;

/** Stud height (m) of the wall at t: on the turf, then sprung up to a hand's width over the ball's top, hanging. */
function wallStud(t: number, ballTop: number) {
  if (t < T.jump) return 0;
  const top = ballTop + 0.075;
  if (t < 0.4) return top * ease.outQuad((t - T.jump) / (0.4 - T.jump));
  return top + 0.05 * ease.inOutQuad(u01(t, 0.4, 0.9));
}

// ---------------------------------------------------------------- the vapour cone (the shuttlecock of air)

interface ConeOpts {
  /** The ball's on-screen radius. */
  R: number;
  /** 0..1 extra brightness (the approach). */
  bright?: number;
  /** Bubble squash at an air step (1 = round). */
  sq?: number;
}
/**
 * GALE's vapour cone behind a ball at (x, y) flying +x: a translucent bell (a shuttlecock of condensation) flaring from
 * the ball to a crisp `bell` px mouth about half-way back, then frayed turbulence to `len` px. Navy halo; a thin
 * condensation shell with bright limbs (ice edge lines, soft falloff inward); cross-section rings shed by the ball and
 * sliding back to the mouth; streamlines racing back; the ice mouth rim with a turbulent fringe; an inner cyan shell;
 * the ice core streak with 4 Mach diamonds (12 Hz); two wingtip corkscrews peeling off the mouth; bow-shock isobars
 * ahead of the nose; the navy pocket (the ball's ice core stays the hottest point).
 */
function heroCone(ctx: CanvasRenderingContext2D, x: number, y: number, bell: number, len: number, t: number, a: number, o: ConeOpts) {
  if (a <= 0) return;
  const R = o.R, H = bell / 2, br = clamp(o.bright ?? 0), sq = o.sq ?? 1;
  const ph = Math.floor(t * 30);
  const RIM = 0.52;
  const w = (u: number) =>
    (u <= RIM ? R * 0.95 + (H - R * 0.95) * Math.pow(clamp(u / RIM), 0.62) : H * (1 + 0.12 * ((u - RIM) / (1 - RIM)))) * sq;
  const N = 22;
  const shape = (k: number, uMax: number, jit: number, salt: number) => {
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const u = (i / N) * uMax;
      const j = u > RIM ? 1 + jit * (hash(ph * 13 + i + salt) - 0.5) * ((u - RIM) / (1 - RIM)) : 1;
      ctx.lineTo(Math.round(x - u * len), Math.round(y - w(u) * k * j));
    }
    for (let i = N; i >= 0; i--) {
      const u = (i / N) * uMax;
      const j = u > RIM ? 1 + jit * (hash(ph * 7 + i + salt + 40) - 0.5) * ((u - RIM) / (1 - RIM)) : 1;
      ctx.lineTo(Math.round(x - u * len), Math.round(y + w(u) * k * j));
    }
    ctx.closePath();
  };
  const edge = (side: number, uMax: number) => {
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const u = (i / N) * uMax;
      ctx.lineTo(x - u * len, y + side * w(u));
    }
  };
  ctx.save();
  // 1. Navy halo (normal blend): the cone never reads as a flat pale slab.
  ctx.globalAlpha = 0.5 * a;
  ctx.fillStyle = NAVY;
  shape(1.16, 1, 0.5, 0);
  ctx.fill();
  // 2. The thin condensation shell: a faint body, densest toward the mouth.
  const g = ctx.createLinearGradient(x, 0, x - len * RIM, 0);
  g.addColorStop(0, `rgba(226,246,255,${0.05 * a})`);
  g.addColorStop(1, `rgba(226,246,255,${(0.2 + 0.1 * br) * a})`);
  ctx.globalAlpha = 1;
  ctx.fillStyle = g;
  shape(1, RIM, 0, 1);
  ctx.fill();
  // Frayed turbulence beyond the mouth (normal blend vapour, fading back).
  const g2 = ctx.createLinearGradient(x - len * RIM, 0, x - len, 0);
  g2.addColorStop(0, `rgba(226,246,255,${0.24 * a})`);
  g2.addColorStop(1, 'rgba(226,246,255,0)');
  ctx.fillStyle = g2;
  ctx.beginPath();
  shape(0.98, 1, 0.45, 3);
  ctx.save();
  ctx.clip();
  ctx.fillRect(x - len - 4, y - H * 2, len * (1 - RIM) + 8, H * 4);
  ctx.restore();
  // 2b. The outer soft white layer (alpha 0.45, normal blend): condensation thickest at the limbs, thin in the middle,
  // so the bell reads as a solid body of vapour, not a glass funnel.
  ctx.globalAlpha = 0.45 * a;
  const gv = ctx.createLinearGradient(0, y - H, 0, y + H);
  gv.addColorStop(0, 'rgba(240,250,255,1)');
  gv.addColorStop(0.5, 'rgba(240,250,255,0.25)');
  gv.addColorStop(1, 'rgba(240,250,255,1)');
  ctx.fillStyle = gv;
  shape(1.04, RIM, 0.15, 5);
  ctx.fill();
  // Vapour puffs streaming back along each limb at the streamline speed (12 per limb).
  for (const side of [-1, 1]) {
    for (let i = 0; i < 12; i++) {
      const sp = 1300 + hash(i * 2.7 + side) * 600;
      const span = len * RIM;
      const sOff = (t * sp + hash(i * 5.3 + side * 3) * span) % span;
      const u = clamp(sOff / len);
      const px = x - sOff, py = y + side * w(u) * (0.9 + 0.08 * hash(i * 1.1 + side));
      const sz = (6 + 10 * hash(i * 3.9 + side * 7)) * (0.6 + 0.8 * (u / RIM));
      ctx.globalAlpha = 0.5 * a * Math.sin(Math.PI * clamp(sOff / span));
      ctx.drawImage(softSprite('vapor', 0.1), px - sz * 1.8, py - sz * 0.7, sz * 3.6, sz * 1.4);
    }
  }
  // 3. Bright limbs: the shell's edges seen tangentially (soft wide, then a crisp ice line).
  ctx.lineJoin = 'round';
  for (const side of [-1, 1]) {
    for (const [lw, al, col] of [[12, 0.12, 'rgb(226,246,255)'], [6, 0.26, 'rgb(226,246,255)']] as const) {
      ctx.globalAlpha = (al + 0.1 * br) * a;
      ctx.strokeStyle = col;
      ctx.lineWidth = lw;
      edge(side, RIM);
      ctx.stroke();
    }
  }
  ctx.globalCompositeOperation = 'lighter';
  for (const side of [-1, 1]) {
    ctx.globalAlpha = (0.85 + 0.15 * br) * a;
    ctx.strokeStyle = ICE;
    ctx.lineWidth = 2.5;
    edge(side, RIM);
    ctx.stroke();
    ctx.globalAlpha = 0.3 * a;
    ctx.strokeStyle = CYAN;
    ctx.lineWidth = 4;
    edge(side, RIM * 0.9);
    ctx.stroke();
  }
  // 4. Inner cyan shell (additive).
  ctx.globalAlpha = (0.28 + 0.1 * br) * a;
  ctx.fillStyle = CYAN;
  shape(0.55, RIM, 0, 2);
  ctx.fill();
  // 5. Cross-section rings shed by the ball, sliding back to the mouth (faint: they hint the bell's depth).
  for (let i = 0; i < 4; i++) {
    const f = (i / 4 + t * 3.2) % 1;
    const u = 0.05 + f * (RIM - 0.05);
    const wu = w(u);
    ctx.globalAlpha = (0.18 * Math.sin(f * Math.PI) + 0.05 * br) * a;
    ctx.strokeStyle = i % 2 ? ICE : CYAN;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(x - u * len, y, Math.max(2, wu * 0.2), wu, 0, 0, TAU);
    ctx.stroke();
  }
  // 6. Streamlines racing back along the surface (dashes scrolling at the flow speed).
  ctx.lineWidth = 1;
  for (let i = 0; i < 14; i++) {
    const f = ((i + 0.5) / 14) * 1.8 - 0.9;
    const sp = 1100 + hash(i * 3.7) * 900;
    const dash = 24 + hash(i * 5.1) * 46, gap = 14 + hash(i * 2.3) * 34;
    const off = (t * sp + hash(i) * 200) % (dash + gap);
    ctx.globalAlpha = (0.22 + 0.3 * hash(i * 9.1) + 0.15 * br) * a;
    ctx.strokeStyle = i % 4 === 0 ? CYAN : ICE;
    ctx.beginPath();
    for (let s = -off; s < len; s += dash + gap) {
      const s0 = Math.max(R * 0.6, s), s1 = Math.min(len, s + dash);
      if (s1 <= s0 + 1) continue;
      ctx.moveTo(Math.round(x - s0), Math.round(y + f * w(s0 / len)));
      ctx.lineTo(Math.round(x - s1), Math.round(y + f * w(s1 / len)));
    }
    ctx.stroke();
  }
  // 7. The mouth rim: an ice ellipse seen nearly side-on, with a cyan glow.
  const mx = x - len * RIM, mr = w(RIM), mrx = Math.max(4, mr * 0.2);
  ctx.globalAlpha = (0.38 + 0.2 * br) * a;
  ctx.strokeStyle = CYAN;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(mx, y, mrx, mr, 0, 0, TAU);
  ctx.stroke();
  ctx.globalAlpha = a;
  ctx.strokeStyle = ICE;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(mx, y, mrx, mr, 0, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  ctx.globalAlpha = 0.4 * a;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(mx, y, mrx, mr, 0, Math.PI / 2, Math.PI * 1.5);
  ctx.stroke();
  // 8. Core streak and Mach diamonds (12 Hz).
  ctx.globalAlpha = 0.85 * a;
  ctx.fillStyle = ICE;
  ctx.fillRect(Math.round(x - len * 0.8), Math.round(y) - 1, Math.round(len * 0.8 - R * 0.6), 2);
  const pulse = 0.65 + 0.35 * Math.sin(t * TAU * 12);
  for (let i = 0; i < 4; i++) {
    const cx = x - R * 1.5 - i * (len * RIM - R * 1.2) * 0.32, s = R * 0.34 * (1 - i * 0.14) * pulse * sq;
    ctx.globalAlpha = (0.62 - i * 0.1) * a;
    ctx.beginPath();
    ctx.moveTo(cx - s * 1.8, y);
    ctx.lineTo(cx, y - s);
    ctx.lineTo(cx + s * 1.8, y);
    ctx.lineTo(cx, y + s);
    ctx.closePath();
    ctx.fill();
  }
  // 9. Bow-shock isobars just ahead of the nose (GALE's contour language), shimmering.
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const rr = R * (1.3 + i * 0.32) + Math.sin(t * 40 + i) * 0.8;
    ctx.globalAlpha = (0.6 - i * 0.16 + 0.2 * br) * a;
    ctx.strokeStyle = i ? CYAN : ICE;
    ctx.beginPath();
    ctx.ellipse(x - R * 0.2 * i, y, rr, rr * sq, 0, -1.15, 1.15);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
  // 10. Turbulent fringe on the mouth and frayed wisps beyond it (normal blend vapour).
  for (let i = 0; i < 18; i++) {
    const v = (i / 17) * 2 - 1;
    const px = mx - 6 - hash(i * 7 + ph) * 30, py = y + v * mr * 0.98;
    const s = 5 + hash(i * 3 + ph * 0.3) * 10;
    ctx.globalAlpha = 0.55 * a;
    ctx.drawImage(softSprite('vapor', 0.08), px - s * 1.3, py - s * 0.7, s * 2.6, s * 1.4);
  }
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 18; i++) {
    const v = hash(i * 4.3) * 2 - 1;
    const l = 24 + hash(i * 1.9 + ph) * 70;
    const px = mx - 8 - hash(i * 8.8 + ph * 0.5) * len * 0.4;
    ctx.globalAlpha = 0.4 * a;
    ctx.fillRect(Math.round(px - l), Math.round(y + v * mr * 1.02), Math.round(l), 1);
  }
  // 11. Wingtip corkscrews peeling off the mouth's top and bottom edges.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 34; i++) {
      const u = i / 34;
      const px = mx - u * len * (1 - RIM) * 1.1;
      const rad = 3 + u * 11;
      const yy = y + side * (mr + Math.sin(u * 18 - t * 36 + side) * rad);
      ctx.globalAlpha = 0.8 * a * (1 - u);
      ctx.fillRect(Math.round(px), Math.round(yy), 2, 2);
    }
  }
  ctx.restore();
  // 12. The navy pocket round the ball (its ice core stays the hottest point).
  ctx.globalCompositeOperation = 'source-over';
  drawGlow(ctx, glowOf(PAL.navy), x, y, R * 2.3, 0.62 * a);
  ctx.globalAlpha = 1;
}

/** The approach's pressure wall: n isobars piling up one ball radius ahead of the nose as k 0 -> 1. */
function pressureWall(ctx: CanvasRenderingContext2D, x: number, y: number, R: number, H: number, k: number, t: number) {
  if (k <= 0) return;
  const wallX = x + R * 2.0;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineWidth = 1;
  for (let i = 0; i < 30; i++) {
    const spread = (1 - ease.inCubic(k)) * (14 + i * 9) + i * 0.35;
    const px = wallX + spread;
    if (px > VW + 40) continue;
    const hh = H * (0.7 + 0.45 * (i / 30)) * (0.7 + 0.3 * k);
    ctx.globalAlpha = clamp((0.65 + 0.35 * k) * (1 - i / 34));
    ctx.strokeStyle = i % 3 ? CYAN : ICE;
    ctx.lineWidth = i % 3 ? 1.5 : 2;
    ctx.beginPath();
    ctx.ellipse(px - hh * 0.9, y, hh * 0.9, hh, 0, -0.66, 0.66);
    ctx.stroke();
  }
  // The wall itself: a bright standing front once they have piled up.
  if (k > 0.15) {
    const a = clamp((k - 0.15) / 0.5);
    drawGlow(ctx, glowOf(PAL.cyan), wallX, y, H * 1.0, 0.8 * a, 0.22, 1);
    ctx.globalAlpha = a;
    ctx.strokeStyle = ICE;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(wallX - H * 0.85, y, H * 0.85, H * 1.0, 0, -0.66, 0.66);
    ctx.stroke();
  }
  ctx.restore();
  void t;
}

// ---------------------------------------------------------------- 6a: the world of the ride

/** One frame of the ride: everything behind the figures (sky, stands, boards, turf, wake, craters). */
function drawRideWorld(env: Env, t: number, r: Ride) {
  const { ctx } = env;
  const st = env.art.stadium;
  ctx.fillStyle = SNAVY;
  ctx.fillRect(-60, -60, VW + 120, VH + 120);
  // Depth layers (m from the eye).
  const DS = 64, DB = 50, DF = 44;
  const sS = (r.k * D0) / DS, sB = (r.k * D0) / DB;
  // Sky band: the storm lid scudding over the roofline (normal blend clouds) and the floodlight glare.
  const roofY = PY - (13 - r.eyeH) * sS;
  for (let i = 0; i < 10; i++) {
    const sw = 700;
    const x = ((((i * 151 - (r.camR * sS) * 0.6 - t * 60) % sw) + sw) % sw) - 60;
    const y = roofY - 16 - hash(i * 3.3) * 26;
    const s = 40 + hash(i) * 50;
    ctx.globalAlpha = 0.55;
    ctx.drawImage(softSprite('storm', 0.55 + hash(i * 2.2) * 0.35), x - s * 1.6, y - s * 0.5, s * 3.2, s);
  }
  ctx.globalAlpha = 1;
  // Crowd plane (the stadium's crowd strip, tiled, parallax by depth).
  const cs = 1.5;
  const cw = st.crowd.width * cs, ch = st.crowd.height * cs;
  const crowdBot = PY - (1.6 - r.eyeH) * sS;
  const cx0 = (((-r.camR * sS) % cw) + cw) % cw - cw;
  ctx.imageSmoothingEnabled = false;
  for (let x = cx0; x < VW + 60; x += cw) ctx.drawImage(st.crowd, Math.round(x), Math.round(crowdBot - ch), cw, ch);
  ctx.fillStyle = '#05040c';
  ctx.fillRect(-60, Math.round(crowdBot - ch - 8), VW + 120, 10);
  // Flags whipping east over the crowd (the ball's wind and the storm).
  for (let i = 0; i < 9; i++) {
    const fx0 = (((i * 113 - r.camR * sS) % 760) + 760) % 760 - 60;
    const fy = crowdBot - ch * (0.35 + hash(i * 5.3) * 0.5);
    ctx.fillStyle = '#d8dde8';
    ctx.fillRect(Math.round(fx0), Math.round(fy), 1, 12);
    ctx.fillStyle = i % 3 ? '#c81e2a' : '#e8ecf4';
    for (let s = 0; s < 6; s++) ctx.fillRect(Math.round(fx0 + 1 + s * 2), Math.round(fy + Math.sin(t * 22 + s * 0.9 + i) * 1.5), 2, 4);
  }
  // Ad boards (depth 50 m, 1 m tall).
  const bTop = PY - (1.0 - r.eyeH) * sB, bBot = PY + r.eyeH * sB;
  const pw = 4.2 * sB;
  const bx0 = (((-r.camR * sB) % (pw * 4)) + pw * 4) % (pw * 4) - pw * 4;
  const boards = ['#1d2b6b', '#e8ecf4', '#c81e2a', '#141a3a'];
  for (let i = 0, x = bx0; x < VW + 60; i++, x += pw) {
    ctx.fillStyle = boards[((i % 4) + 4) % 4];
    ctx.fillRect(Math.round(x), Math.round(bTop), Math.ceil(pw) - 1, Math.max(2, Math.round(bBot - bTop)));
  }
  // Turf: a dark storm pitch with mowing stripes fanning out of the vanishing point (5 m bands along the flight).
  const gy = (d: number) => PY + r.eyeH * ((r.k * D0) / d);
  const gx = (xm: number, d: number) => 320 + (xm - r.camR) * ((r.k * D0) / d);
  const yFar = Math.round(bBot);
  ctx.fillStyle = '#1d4c32';
  ctx.fillRect(-60, yFar, VW + 120, VH + 60 - yFar);
  const dNear = 0.9;
  const b0 = Math.floor((r.camR - 30) / 5), b1 = Math.ceil((r.camR + 30) / 5);
  for (let b = b0; b <= b1; b++) {
    if (b % 2) continue;
    const X0 = b * 5, X1 = X0 + 5;
    ctx.fillStyle = '#357a48';
    ctx.beginPath();
    ctx.moveTo(gx(X0, DF), gy(DF));
    ctx.lineTo(gx(X1, DF), gy(DF));
    ctx.lineTo(gx(X1, dNear), gy(dNear));
    ctx.lineTo(gx(X0, dNear), gy(dNear));
    ctx.closePath();
    ctx.fill();
  }
  // Far touchline and the 18 m line (field x 1015 -> ride metres) racing past.
  ctx.fillStyle = 'rgba(220,235,255,0.55)';
  ctx.fillRect(-60, Math.round(gy(40)), VW + 120, 1);
  const lineR = r.R + (1015 - fieldXAtSim(simAt(t))) / 10;
  ctx.strokeStyle = 'rgba(230,240,255,0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(gx(lineR, 40), gy(40));
  ctx.lineTo(gx(lineR, dNear), gy(dNear));
  ctx.stroke();
  // Grass speed lines on the turf: rows at their own depth, smeared by the parallax of that depth.
  const slow = t >= 0.34 && t < 0.68 ? 0.2 : 1;
  for (let i = 0; i < 46; i++) {
    const d = lerp(1.4, 30, Math.pow(hash(i * 2.7), 1.7));
    const y = gy(d) + (hash(i * 9.3) - 0.5) * 2;
    if (y < yFar + 2 || y > VH + 4) continue;
    const s = (r.k * D0) / d;
    const span = VW + 400;
    const x = ((((hash(i * 4.1) * span - r.camR * s) % span) + span) % span) - 200;
    const l = Math.max(4, s * 0.25 * (0.5 + hash(i) )) * (0.3 + 0.7 * slow);
    ctx.globalAlpha = 0.18 + 0.2 * hash(i * 6.2);
    ctx.fillStyle = i % 3 ? '#4f9a5c' : '#9fd8a0';
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(l), Math.max(1, Math.round(s / 300)));
  }
  ctx.globalAlpha = 1;
}

/** Floodlight glare at the top of the ride (towers far behind the stands): hot points under the cloud lid. */
function rideLamps(ctx: CanvasRenderingContext2D, t: number, r: Ride) {
  const s = (r.k * D0) / 110;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 4; i++) {
    const span = 1100;
    const x = ((((i * 290 + 120 - r.camR * s) % span) + span) % span) - 200;
    const y = 10 + (i % 2) * 6;
    const fl = 0.85 + 0.15 * Math.sin(t * 7 + i * 2);
    drawGlow(ctx, glowOf([170, 220, 250]), x, y, 90, 0.16 * fl, 1.6, 0.8);
    drawGlow(ctx, glowOf([255, 250, 230]), x, y, 26, 0.55 * fl);
    for (let j = 0; j < 5; j++) {
      ctx.globalAlpha = 0.85 * fl;
      ctx.fillStyle = '#fffbe8';
      ctx.fillRect(Math.round(x - 12 + j * 5), Math.round(y - 1), 3, 3);
    }
  }
  ctx.restore();
}

/** The pressed wake behind the ball (the V of combed grass in the ball plane) and the bow-wave mist walls. */
function drawRideWake(env: Env, t: number, r: Ride) {
  const { ctx } = env;
  const gy = (d: number) => PY + r.eyeH * ((r.k * D0) / d);
  const gx = (xm: number, d: number) => 320 + (xm - r.camR) * ((r.k * D0) / d);
  // The V opens behind the ball: half-width (across the flight, m) grows with distance behind.
  const half = (back: number) => 0.3 + back * 0.13;
  const pts = (side: number) => {
    const out: [number, number][] = [];
    for (let i = 0; i <= 14; i++) {
      const back = i * 2.2;
      const d = D0 + side * half(back);
      out.push([gx(r.R - back, d), gy(d)]);
    }
    return out;
  };
  const far = pts(1), near = pts(-1);
  ctx.save();
  ctx.globalAlpha = 0.62;
  ctx.fillStyle = HEX.pressed;
  ctx.beginPath();
  far.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  for (let i = near.length - 1; i >= 0; i--) ctx.lineTo(near[i][0], near[i][1]);
  ctx.closePath();
  ctx.fill();
  // The dark pressed groove at its centre.
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = HEX.pressedCore;
  ctx.beginPath();
  for (let i = 0; i <= 14; i++) {
    const back = i * 2.2;
    const x = gx(r.R - back, D0), y = gy(D0);
    i ? ctx.lineTo(x, y - 1) : ctx.moveTo(x, y - 1);
  }
  for (let i = 14; i >= 0; i--) {
    const back = i * 2.2;
    ctx.lineTo(gx(r.R - back, D0 - 0.08), gy(D0 - 0.08) + 1);
  }
  ctx.closePath();
  ctx.fill();
  // Comb lines raking back (pale), fixed to the turf (they scroll with it).
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = 'rgb(214,248,200)';
  for (let i = 0; i < 30; i++) {
    const back = ((i * 1.37 + (r.R % 1.37)) % 30);
    const side = hash(i * 3.3) * 2 - 1;
    const d = D0 + side * half(back) * 0.85;
    const x = gx(r.R - back, d);
    if (x > r.bx) continue;
    ctx.fillRect(Math.round(x - 10), Math.round(gy(d)), 10, 1);
  }
  // Dew-mist walls on its edges.
  for (let i = 0; i < 10; i++) {
    const back = 1 + i * 2.6;
    for (const side of [-1, 1]) {
      const d = D0 + side * half(back);
      const x = gx(r.R - back, d), y = gy(d);
      if (x > r.bx || x < -60) continue;
      const s = 10 + back * 1.6;
      ctx.globalAlpha = 0.28 * (0.7 + 0.3 * Math.sin(t * 9 + i * 1.3 + side));
      ctx.drawImage(softSprite('vapor', 0.25), x - s * 1.4, y - s * 1.5, s * 2.8, s * 1.6);
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- 6c: the keeper, front view (pixel puppet)

type KPoseName = 'ready' | 'ready2' | 'set' | 'cock' | 'punch';
type V2 = [number, number];
interface KPose {
  sh: V2; el: V2; gl: V2; hip: V2; kn: V2; an: V2; toe: V2; head: V2; fist: boolean; neckY: number;
}
/** Front-view keeper poses (units; origin = pelvis centre; right side, mirrored for the left). */
const KPOSES: Record<KPoseName, KPose> = {
  ready: { sh: [11, -24], el: [20, -11], gl: [22, -1], hip: [6, 2], kn: [13, 18], an: [12, 33], toe: [15, 36], head: [0, -38], fist: false, neckY: -28 },
  ready2: { sh: [11, -23.5], el: [19, -12.5], gl: [20, -4], hip: [6, 2], kn: [14, 17.5], an: [13, 33], toe: [16, 36], head: [0.8, -37.6], fist: false, neckY: -28 },
  set: { sh: [11, -22], el: [18, -14], gl: [14, -19], hip: [6, 2], kn: [16, 14], an: [14, 28], toe: [17, 31], head: [0, -35.5], fist: false, neckY: -26 },
  cock: { sh: [11.5, -22], el: [21, -15], gl: [8, -19], hip: [6, 2], kn: [16, 14], an: [14, 28], toe: [17, 31], head: [0, -35], fist: true, neckY: -26 },
  punch: { sh: [11, -21], el: [10, -18], gl: [5, -17], hip: [6, 2], kn: [15, 15], an: [14, 29], toe: [17, 32], head: [0, -33], fist: true, neckY: -25 },
};
const KF_FOOT = (p: KPose) => p.toe[1] + 2;
const kp = (c: RGB) => pack(c[0], c[1], c[2]);
const KSKIN: Pal3 = pal3([255, 214, 178], [232, 172, 132], [170, 110, 86]);
const KSHIRT: Pal3 = pal3([196, 255, 90], [140, 214, 50], [60, 120, 40]);
const KSHORTS: Pal3 = pal3([70, 70, 84], [40, 40, 52], [20, 20, 28]);
const KBOOT: Pal3 = pal3([90, 90, 100], [50, 50, 60], [20, 20, 28]);
const KGLOVE: Pal3 = pal3([255, 255, 255], [214, 220, 232], [150, 156, 176]);
const KORANGE: Pal3 = pal3([255, 170, 70], [255, 130, 40], [190, 70, 30]);
const KHAIR: Pal3 = pal3([120, 120, 130], [70, 70, 84], [30, 30, 40]);

const keeperCache = new Map<string, { cv: HTMLCanvasElement; glow: HTMLCanvasElement; sil: HTMLCanvasElement; rim: HTMLCanvasElement; ox: number; oy: number }>();
/** Render (once) the front keeper in `name` at k px per unit; returns the sprite, a cyan light mask and the foot anchor. */
function frontKeeper(name: KPoseName, k: number) {
  const key = `${name}|${k}`;
  let r = keeperCache.get(key);
  if (r) return r;
  const p = KPOSES[name];
  const W = Math.ceil(64 * k) + 8, H = Math.ceil(96 * k) + 8;
  const buf = new PixelBuffer(W, H);
  buf.lx = -0.5;
  buf.ly = -0.7;
  const ox = W / 2, oy = Math.round(H - 4 - KF_FOOT(p) * k - 50 * k) + 50 * k;
  const T2 = (v: V2, side = 1): V2 => [ox + v[0] * side * k, oy + v[1] * k];
  const cap = (a: V2, b: V2, rad: number, pal: Pal3 | number) => buf.capsule(a[0], a[1], b[0], b[1], Math.max(0.8, rad * k), pal);
  for (const side of [-1, 1]) {
    // Legs: shorts top, lime thigh-length socks under the shorts, boots.
    cap(T2(p.hip, side), T2(p.kn, side), 4.6, KSKIN);
    cap(T2(p.kn, side), T2(p.an, side), 4.0, KSHIRT);
    cap(T2(p.an, side), T2(p.toe, side), 3.4, KBOOT);
    cap(T2(p.hip, side), T2([lerp(p.hip[0], p.kn[0], 0.45), lerp(p.hip[1], p.kn[1], 0.45)], side), 5.6, KSHORTS);
  }
  // Torso (lime, long sleeves) and the collar.
  cap(T2([0, 0]), T2([0, p.neckY + 2]), 10.5, KSHIRT);
  cap(T2([-4, -2]), T2([4, -2]), 8.4, KSHORTS);
  cap(T2([-9, p.neckY + 4]), T2([9, p.neckY + 4]), 5.2, KSHIRT);
  buf.circle(ox, oy + (p.neckY + 1) * k, 3.6 * k, kp([30, 30, 40]));
  // Head: skull, ears, hair cap, face.
  const hc = T2(p.head);
  buf.circle(hc[0], hc[1] + 2 * k, 3.4 * k, KSKIN);
  for (const side of [-1, 1]) buf.circle(hc[0] + side * 8.6 * k, hc[1] + 0.8 * k, 2.0 * k, KSKIN[2]);
  buf.circle(hc[0], hc[1], 8.8 * k, KSKIN);
  buf.capsule(hc[0] - 6.4 * k, hc[1] - 4.6 * k, hc[0] + 6.4 * k, hc[1] - 4.6 * k, 4.4 * k, KHAIR);
  buf.capsule(hc[0] - 7.6 * k, hc[1] - 2.2 * k, hc[0] - 7.6 * k, hc[1] - 0.4 * k, 1.6 * k, KHAIR);
  buf.capsule(hc[0] + 7.6 * k, hc[1] - 2.2 * k, hc[0] + 7.6 * k, hc[1] - 0.4 * k, 1.6 * k, KHAIR);
  const dark = OUTLINE;
  // Brows (angled in: determined; on the strike, a hard scowl), eyes, a set mouth or gritted teeth.
  const fury = name === 'cock' || name === 'punch';
  const bIn = fury ? 0.6 * k : 0, bOut = fury ? -0.6 * k : 0;
  for (const side of [-1, 1]) {
    buf.capsule(hc[0] + side * 1.6 * k, hc[1] - 1.4 * k + bIn, hc[0] + side * 5.6 * k, hc[1] - 2.6 * k + bOut, Math.max(0.6, 0.7 * k), dark);
    buf.capsule(hc[0] + side * 3.6 * k, hc[1] + 0.6 * k, hc[0] + side * 3.6 * k, hc[1] + 1.4 * k, Math.max(0.6, 0.9 * k), dark);
  }
  if (fury) {
    // Gritted teeth: a white bar 5 x 1.4 units in a dark border, split by two tooth gaps.
    const my = hc[1] + 5.1 * k, hw = 2.5 * k, hh = 0.7 * k;
    for (let yy = Math.floor(my - hh - 1); yy <= Math.ceil(my + hh + 1); yy++)
      for (let xx = Math.floor(hc[0] - hw - 1); xx <= Math.ceil(hc[0] + hw + 1); xx++) {
        const inside = Math.abs(xx + 0.5 - hc[0]) <= hw && Math.abs(yy + 0.5 - my) <= hh;
        const gap = Math.abs(Math.abs(xx + 0.5 - hc[0]) - hw * 0.4) < 0.5;
        buf.set(xx, yy, inside && !gap ? KGLOVE[0] : dark);
      }
  } else buf.capsule(hc[0] - 2.6 * k, hc[1] + 5.2 * k, hc[0] + 2.6 * k, hc[1] + 5.0 * k, Math.max(0.55, 0.6 * k), KSKIN[2]);
  // Arms (long lime sleeves) and gloves (white, orange palm strap).
  for (const side of [-1, 1]) {
    cap(T2(p.sh, side), T2(p.el, side), 3.8, KSHIRT);
    cap(T2(p.el, side), T2(p.gl, side), 3.4, KSHIRT);
    const g = T2(p.gl, side);
    if (p.fist) {
      buf.circle(g[0], g[1], 5.2 * k, KGLOVE);
      buf.capsule(g[0] - 3.4 * k, g[1] - 1.6 * k, g[0] + 3.4 * k, g[1] - 1.6 * k, Math.max(0.5, 0.5 * k), KGLOVE[2]);
      buf.capsule(g[0] - side * 2.6 * k, g[1] + 3.2 * k, g[0] + side * 1.2 * k, g[1] + 3.4 * k, 1.6 * k, KORANGE);
    } else {
      buf.circle(g[0], g[1] + 1 * k, 4.4 * k, KGLOVE);
      for (let f = -1.5; f <= 1.5; f++) buf.capsule(g[0] + f * 2.2 * k, g[1] - 1 * k, g[0] + f * 2.4 * k, g[1] - 5.2 * k, 1.1 * k, KGLOVE);
      buf.circle(g[0], g[1] + 0.6 * k, 2.4 * k, KORANGE);
      buf.capsule(g[0] - 3.8 * k, g[1] + 4.4 * k, g[0] + 3.8 * k, g[1] + 4.4 * k, 1.4 * k, KORANGE);
    }
  }
  buf.outline();
  const cv0 = buf.flush();
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  cv.getContext('2d')!.drawImage(cv0, 0, 0);
  // The ball's cyan light on his front (a mask of the sprite, brighter low and centre).
  const glow = document.createElement('canvas');
  glow.width = W;
  glow.height = H;
  const gc = glow.getContext('2d')!;
  gc.drawImage(cv, 0, 0);
  gc.globalCompositeOperation = 'source-in';
  // Lit from below only (the oncoming ball skims the turf): brightest at his knees, falling off up his chest.
  const gr = gc.createRadialGradient(ox, oy + 12 * k, 4 * k, ox, oy + 12 * k, 44 * k);
  gr.addColorStop(0, 'rgba(120,230,255,1)');
  gr.addColorStop(1, 'rgba(40,120,220,0.25)');
  gc.fillStyle = gr;
  gc.fillRect(0, 0, W, H);
  // Film fix H2: the keeper reads as a storm silhouette in the goal mouth (no code face at 200 px; his face is first seen
  // on the studio bust in 7b): a navy copy of the sprite, and a rim of the edges facing the floodlights behind him
  // (ice where the edge faces up, cyan where it faces sideways), about one sprite unit wide.
  const sil = document.createElement('canvas');
  sil.width = W;
  sil.height = H;
  const sg = sil.getContext('2d')!;
  sg.drawImage(cv, 0, 0);
  sg.globalCompositeOperation = 'source-in';
  sg.fillStyle = 'rgb(12,18,44)';
  sg.fillRect(0, 0, W, H);
  const rim = document.createElement('canvas');
  rim.width = W;
  rim.height = H;
  const rg = rim.getContext('2d')!;
  const src = cv.getContext('2d')!.getImageData(0, 0, W, H).data;
  const out = rg.createImageData(W, H);
  const d = Math.max(1, Math.round(k));
  const op = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && src[(y * W + x) * 4 + 3] > 0;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (!op(x, y)) continue;
      const up = !op(x, y - d), side = !op(x - d, y) || !op(x + d, y);
      if (!up && !side) continue;
      const o = (y * W + x) * 4;
      const c = up ? [238, 251, 255] : [70, 216, 255];
      out.data[o] = c[0];
      out.data[o + 1] = c[1];
      out.data[o + 2] = c[2];
      out.data[o + 3] = up ? 255 : 200;
    }
  rg.putImageData(out, 0, 0);
  r = { cv, glow, sil, rim, ox, oy: oy + KF_FOOT(p) * k };
  keeperCache.set(key, r);
  return r;
}
/**
 * Draw the front keeper with his feet's centre at (x, y), `hpx` px tall (about 86 units). Picks a crisp k bucket. `dark`
 * lays the navy silhouette over him (1 = a full silhouette) and `rimA` adds his floodlight rim (additive).
 */
function drawFrontKeeper(ctx: CanvasRenderingContext2D, name: KPoseName, x: number, y: number, hpx: number, light: number, dark = 0, rimA = 0) {
  const want = hpx / 86;
  const ks = [1, 1.5, 2, 3, 4, 5];
  let k = ks[0];
  for (const c of ks) if (c <= want * 1.15) k = c;
  const sp = frontKeeper(name, k);
  const D = want / k;
  ctx.imageSmoothingEnabled = false;
  const dx = x - sp.ox * D, dy = y - sp.oy * D, dw = sp.cv.width * D, dh = sp.cv.height * D;
  ctx.drawImage(sp.cv, dx, dy, dw, dh);
  if (dark > 0) {
    ctx.globalAlpha = clamp(dark);
    ctx.drawImage(sp.sil, dx, dy, dw, dh);
  }
  if (light > 0 || rimA > 0) {
    ctx.globalCompositeOperation = 'lighter';
    if (light > 0) {
      ctx.globalAlpha = clamp(light);
      ctx.drawImage(sp.glow, dx, dy, dw, dh);
    }
    if (rimA > 0) {
      ctx.globalAlpha = clamp(rimA);
      ctx.drawImage(sp.rim, dx, dy, dw, dh);
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.globalAlpha = 1;
}

/** One fist from the front (knuckles at the lens): the storm-lit glove, four knuckles, creases, orange thumb and strap. */
const FGLOVE: Pal3 = pal3([120, 132, 170], [70, 80, 120], [30, 36, 70]);
const FORANGE: Pal3 = pal3([226, 132, 58], [176, 84, 34], [104, 42, 22]);
const FSLEEVE: Pal3 = pal3([150, 214, 70], [96, 160, 40], [44, 88, 30]);
/** Width of the glove's body in the fist sprite (px at k 4). */
const FIST_W = 36 * 4;
let fistCv: HTMLCanvasElement | null = null;
/** The fist's baked lighting: navy over all but the knuckle ridge (shade) and a cyan rim on the knuckle ridge only (rim). */
let fistShade: HTMLCanvasElement | null = null, fistRim: HTMLCanvasElement | null = null, fistNavy: HTMLCanvasElement | null = null;
function fistSprite(): HTMLCanvasElement {
  if (fistCv) return fistCv;
  const k = 4, W = 48 * k, H = 48 * k;
  const buf = new PixelBuffer(W, H);
  buf.lx = -0.45;
  buf.ly = -0.8;
  const c = (x: number, y: number): V2 => [W / 2 + x * k, H / 2 + y * k];
  const cap = (a: V2, b: V2, rad: number, pal: Pal3 | number) => buf.capsule(a[0], a[1], b[0], b[1], rad * k, pal);
  // Sleeve, strap, the glove's body and its broad knuckle ridge.
  cap(c(-10, 15), c(10, 15), 7.5, FSLEEVE);
  cap(c(-10.5, 9.5), c(10.5, 9.5), 4.4, FORANGE);
  cap(c(-8.5, 1), c(8.5, 1), 9, FGLOVE);
  cap(c(-9.5, -6), c(9.5, -6), 5.6, FGLOVE);
  // Knuckle highlights, finger creases and the fold of the fingers.
  // Knuckle bumps in the mid tone (the cyan rim, baked below, is the only light on the ridge).
  for (const fx of [-7, -2.4, 2.4, 7]) buf.circle(c(fx, -9)[0], c(fx, -9)[1], 1.1 * k, FGLOVE[1]);
  for (const fx of [-4.7, 0, 4.7]) cap(c(fx, -11.2), c(fx, -4), 0.4, FGLOVE[2]);
  cap(c(-11, -2.4), c(11, -2.4), 0.4, FGLOVE[2]);
  // The thumb wrapped across the front (orange palm leather), with a highlight.
  cap(c(-9.5, 4.6), c(2.5, 4.2), 3.4, FORANGE);
  buf.circle(c(-6, 3.4)[0], c(-6, 3.4)[1], 1.2 * k, FORANGE[0]);
  buf.outline();
  const cv0 = buf.flush();
  fistCv = document.createElement('canvas');
  fistCv.width = W;
  fistCv.height = H;
  const fc = fistCv.getContext('2d')!;
  fc.drawImage(cv0, 0, 0);
  // Each column's top edge.
  const id = fc.getImageData(0, 0, W, H).data;
  const top = new Int32Array(W).fill(-1);
  for (let x = 0; x < W; x++)
    for (let y = 0; y < H; y++)
      if (id[(y * W + x) * 4 + 3] > 0) {
        top[x] = y;
        break;
      }
  fistShade = document.createElement('canvas');
  fistShade.width = W;
  fistShade.height = H;
  const sc = fistShade.getContext('2d')!;
  sc.drawImage(fistCv, 0, 0);
  sc.globalCompositeOperation = 'source-in';
  // Dark gloves: the shade starts just under the knuckle ridge (-8 u) and is deep from the fingers' fold down.
  const g0 = H / 2 - 8 * k, g1 = H / 2 + 9 * k;
  const gy = sc.createLinearGradient(0, g0, 0, g1);
  gy.addColorStop(0, 'rgba(10,18,56,0)');
  gy.addColorStop(0.35, 'rgba(10,18,56,0.7)');
  gy.addColorStop(0.85, 'rgba(10,18,56,0.88)');
  sc.fillStyle = gy;
  sc.fillRect(0, 0, W, H);
  // Film fix H2: the whole fist as a navy silhouette (matching the silhouette keeper behind it); the knuckle rim carries it.
  fistNavy = document.createElement('canvas');
  fistNavy.width = W;
  fistNavy.height = H;
  const nc = fistNavy.getContext('2d')!;
  nc.drawImage(fistCv, 0, 0);
  nc.globalCompositeOperation = 'source-in';
  nc.fillStyle = 'rgb(12,18,44)';
  nc.fillRect(0, 0, W, H);
  fistRim = document.createElement('canvas');
  fistRim.width = W;
  fistRim.height = H;
  const rc = fistRim.getContext('2d')!;
  for (let x = 0; x < W; x++) {
    if (top[x] < 0) continue;
    const uy = (top[x] - H / 2) / k;
    if (uy > -6.5 || uy < -13) continue;
    for (let d = 0; d < 3; d++) {
      rc.fillStyle = `rgba(110,226,255,${[1, 0.85, 0.45][d]})`;
      rc.fillRect(x, top[x] + d, 1, 1);
    }
  }
  return fistCv;
}

// ---------------------------------------------------------------- shot state

const spin = new BallSpin();
let fired: Record<string, boolean> = {};

/** The shot's one-time events (flags; update() only). */
const ONCE = ['step1', 'jump', 'step2', 'swing', 'glitter', 'det', 'fling', 'flingHit', 'pov', 'step3'] as const;

/** The negative-print frames (iso stage 2). */
const printAt = (t: number) => at(t, T.iso2) && t < T.isoEnd - 1e-6;

/** Ball screen geometry of the swing (1.10-1.95): position, radius, the view. */
function swingAt(t: number) {
  const u = u01(t, T.silence, T.halo);
  const yaw = swingYaw(u);
  const r1 = rideAt(T.silence);
  const zoom = lerp(1.55, 1.25, ease.inOutCubic(u)) - punch(t, T.det, 0.12, 0.03, 0.35);
  const e = ease.inOutCubic(u);
  const cx = lerp(r1.bx, 320, e), cy = lerp(r1.by, 180, e);
  const v: SwingView = { yaw, dist: D0, f: K0 * zoom * D0, cx, cy };
  return { v, zoom, cx, cy, br: BALL_RM * K0 * zoom };
}
/** Where the three wall puppets hang in the swing (metres from the ball: behind it, across, height): staggered in depth
 * and height so they never read as a chorus line. */
const SW_WALL: [number, number, number][] = [[-10.5, -1.8, 0.95], [-10, 0, 0.55], [-8.8, -0.6, 0.3]];
/** Each hanging defender's own pose (cache name, pose). */
const SW_HANG: [string, Pose][] = [['w6-jumpA', POSE.jumpA], ['w6-jump', POSE.jump], ['w6-jumpC', POSE.jumpC]];

/** The 6c view: the chase POV 1.6 m behind and 0.3 m above the ball. */
function povAt(t: number) {
  const u = u01(t, T.pov, DUR);
  const bxw = lerp(1060, 1156, u);
  const bz = bxw < 1120 ? lerp(239, 231, (bxw - 1060) / 60) : lerp(231, 226, (bxw - 1120) / 36);
  const bump = t < T.step3 ? 0 : t < T.step3 + 0.1 ? 32 * ease.outQuad((t - T.step3) / 0.1) : 32 * (1 - ease.inOutQuad(u01(t, T.step3 + 0.1, T.step3 + 0.3)));
  const whip = t < T.pov + 0.07 ? 260 * (1 - ease.outCubic(u01(t, T.pov, T.pov + 0.07))) : 0;
  const view: DownPitchView = { x: bxw - 16, z: bz, h: ballPathH(bxw) * 10 + 3, f: lerp(560, 760, u), horizon: 140 + bump, cx: 320 + whip };
  return { view, bxw, bz, bump, whip, u, by: 236 + bump * 0.35, bx: 320 + whip };
}

// ---------------------------------------------------------------- the shot

export const shotBarrier: Shot = {
  name: META.name,
  dur: DUR,
  seed: META.seed,
  rate: RATE[6],
  muffle: MUFFLE[6],
  cues: [
    { at: 0, fn: (e) => { e.sfx.howl(1.0, 0.5, 1.4); e.sfx.whine(1.0, 0.1); e.sfx.duck(0.35, 1.0); e.cam.buffet(3, 9); e.cam.trauma = 0.3; e.sfx.whoosh(0.18, 2400, 600, 0.35); } },
    ...[0.15, 0.82].map((at) => ({ at, fn: (e: Env) => { e.sfx.kick(0.5); e.sfx.boom(0.4); e.cam.hit(0.4); e.cam.shove(0, 5); } })),
    { at: 0.28, fn: (e) => { e.sfx.scuff(); e.sfx.scuff(0.16, -0.3); e.sfx.scuff(0.16, 0.3); } },
    { at: 0.4, fn: (e) => e.sfx.whoosh(0.4, 300, 1500, 0.4) },
    { at: 0.68, fn: (e) => { e.sfx.whoosh(0.2, 800, 4000); e.cam.hit(0.25); } },
    { at: 1.0, fn: (e) => { e.sfx.whoosh(0.12, 400, 5000, 0.5); e.sfx.whine(0.12, 0.2); } },
    { at: 1.1, fn: (e) => { e.sfx.choke('tail'); e.sfx.glassRing(0.25); e.cam.buffet(0); } },
    {
      at: 1.6,
      fn: (e) => {
        e.sfx.sonicBoom(1.4);
        e.sfx.boom(1.35);
        e.sfx.crack(1.2);
        e.sfx.kick(1.0);
        e.cam.shakeAmp = 22;
        e.cam.hit(1.0);
        e.cam.shove(0, -10);
      },
    },
    { at: 1.62, fn: (e) => e.sfx.roar(1.4, 0.5) },
    { at: 1.7, fn: (e) => { e.sfx.whoosh(0.25, 300, 2000, 0.5, -0.6); e.sfx.kick(0.4); } },
    // Defender B fills the lens (1.89-1.92): the hit lands with him.
    { at: 1.89, fn: (e) => { e.cam.hit(0.8); e.cam.shove(20, 8); e.sfx.kick(0.7); e.sfx.boom(0.5); } },
    { at: 1.95, fn: (e) => { e.sfx.whoosh(0.8, 400, 3200, 0.5); e.sfx.crowd(2.0, 0.5); e.cam.buffet(4, 9); e.cam.shakeAmp = 12; } },
    { at: T.set, fn: (e) => e.sfx.scuff(0.22, 0.1) },
    { at: 2.45, fn: (e) => { e.sfx.boom(0.7); e.sfx.crack(0.6); e.cam.hit(0.45); e.cam.shove(0, -9); } },
    { at: 2.62, fn: (e) => e.sfx.whoosh(0.15, 300, 2500) },
  ],
  prepare(env) {
    warmGale();
    buildFieldX();
    // Warm the puppet caches the shot uses (the wall at ride scale, the swing and the flight at the lens).
    for (let i = 0; i < 3; i++) {
      for (const [name, pose] of [['crouch', POSE.crouch], ['jump', POSE.jump], ['shove', POSE.shove], ['shove2', POSE.shove2]] as const) {
        const kp = puppetK(WALL_D[i]);
        PUPPETS.get(`w6-${name}`, WALL_KITS[i], pose, kp, -1);
        PUPPETS.get(`w6-${name}`, WALL_KITS[i], pose, kp, -1, SIL_UP);
      }
      PUPPETS.get(SW_HANG[i][0], WALL_KITS[i], SW_HANG[i][1], 1.5, -1, SIL_SWING);
      PUPPETS.get(SW_HANG[i][0], WALL_KITS[i], SW_HANG[i][1], 1.5, -1, SIL_ICE);
      for (const kk of [1.5, 3])
        for (const sil of [SIL_FLUNG, SIL_ICE]) {
          PUPPETS.get('w6-blown', WALL_KITS[i], POSE.blown, kk, -1, sil);
          PUPPETS.get('w6-blown2', WALL_KITS[i], POSE.blown2, kk, -1, sil);
        }
    }
    for (const kk of B_KK)
      for (const sil of [SIL_FLAT, SIL_ICE]) {
        PUPPETS.get('w6-blown', RIVAL_KIT_B, POSE.blown, kk, -1, sil);
        PUPPETS.get('w6-blown2', RIVAL_KIT_B, POSE.blown2, kk, -1, sil);
      }
    for (const n of ['ready', 'ready2', 'set'] as KPoseName[]) for (const k of [1, 1.5, 2, 3]) frontKeeper(n, k);
    for (const n of ['cock', 'punch'] as KPoseName[]) for (const k of [3, 4, 5]) frontKeeper(n, k);
    fistSprite();
    void env;
  },
  init(env) {
    env.sfx.clearBus();
    buildFieldX();
    env.cam.set(VW / 2, VH / 2, 1, 0);
    env.cam.shakeRoll = 0.012;
    env.cam.shakeAmp = 10;
    env.cam.traumaDecay = 1.6;
    PUPPETS.frame();
    spin.m = new Float64Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    spin.rotate(0.3, 1, 0.2, 0.9);
    fired = {};
    for (const k of ONCE) fired[k] = false;
  },
  update(env, t, dt) {
    const { rng, parts, cam } = env;
    // The knuckle ball: panels turning at most 15°/s, dead still in the vacuum.
    spin.rotate(0.2, 1, 0.1, dt * 0.25);
    cam.x = VW / 2;
    cam.y = VH / 2;
    if (t < T.silence) {
      parts.wind = [900, 0];
      const r = rideAt(t);
      holdTrauma(cam, 0.3);
      // Dew streaming off the ball's surface like rain on a windscreen.
      const n = Math.ceil(dt * 70 + rng.next() * 0.6);
      for (let i = 0; i < n; i++) {
        const a = rng.range(-1.3, 1.3);
        parts.spawn({
          kind: PK.Streak, x: r.bx + Math.cos(a) * r.br * 0.9, y: r.by + Math.sin(a) * r.br * 0.95, vx: -rng.range(1500, 2600), vy: Math.sin(a) * rng.range(30, 140),
          drag: 1.5, max: rng.range(0.12, 0.3), s0: rng.range(1, 2), s1: 0.5, ramp: 'dew', r0: 0, r1: 1, k: 0.5, a0: 0.9, a1: 0,
        });
      }
      // The bow wave walls: dew and blades thrown up from the turf under the ball, streaming back with the world.
      const gyB = PY + r.eyeH * r.k;
      if (rng.next() < dt * 40)
        for (let i = 0; i < 2; i++)
          parts.spawn({
            kind: PK.Blade, x: r.bx + rng.range(-20, 30), y: gyB + rng.range(-2, 6), vx: -rng.range(1600, 2600), vy: -rng.range(80, 260), ay: 900, drag: 1.2,
            vrot: rng.range(-20, 20), rot: rng.range(0, TAU), max: rng.range(0.3, 0.6), s0: rng.range(3, 6), s1: 3, ramp: 'grass', r0: rng.next(), r1: rng.next(), a0: 1, a1: 1, add: false,
          });
      for (const [key, st] of [['step1', T.step1], ['step2', T.step2]] as const) {
        if (!fired[key] && at(t, st)) {
          fired[key] = true;
          stepBurst(env, r, 30);
        }
      }
      // The wall's take-off (0.28): turf dust and torn blades kicked up from under each defender's boots.
      if (!fired.jump && at(t, T.jump)) {
        fired.jump = true;
        for (let i = 0; i < 3; i++) {
          const b = wallBoot(t, r, i);
          if (!b) continue;
          const sc = (r.k * D0) / WALL_D[i] / 155;
          // Locked to the turf (the world scrolls past at V m/s at this depth), so the kick stays under their boots.
          const scroll = -V * (r.k * D0) / WALL_D[i];
          for (let k = 0; k < 12; k++)
            parts.spawn({
              kind: PK.Mist, x: b[0] + rng.range(-40, 40) * sc, y: b[1] + rng.range(-4, 6), vx: scroll + rng.range(-150, 150), vy: -rng.range(40, 200), drag: 0.15,
              max: rng.range(0.35, 0.6), s0: rng.range(6, 10) * sc, s1: rng.range(16, 28) * sc, k: 0.3, ramp: 'vapor', r0: 0.5, r1: 1, a0: 0.2, a1: 0,
            });
          for (let k = 0; k < 10; k++)
            parts.spawn({
              kind: PK.Blade, x: b[0] + rng.range(-36, 36) * sc, y: b[1] + rng.range(-2, 4), vx: scroll + rng.range(-300, 300), vy: -rng.range(200, 620), ay: 1400, drag: 0.15,
              vrot: rng.range(-22, 22), rot: rng.range(0, TAU), max: rng.range(0.4, 0.75), s0: rng.range(4, 8) * sc, s1: 3, ramp: 'grass', r0: rng.next(), r1: rng.next(), a0: 1, a1: 1, add: false,
            });
        }
      }
      // Dew and blades stream off the wall's boots into the wake as the cone's shoulder passes them.
      if (t >= 0.4 && t < 0.66 && rng.next() < dt * 160) {
        for (let i = 0; i < 3; i++) {
          const b = wallBoot(t, r, i);
          if (!b) continue;
          parts.spawn({
            kind: PK.Pixel, x: b[0] + rng.range(-8, 8), y: b[1] + rng.range(-4, 4), vx: rng.range(500, 1400), vy: rng.range(-60, 120), drag: 1, max: rng.range(0.3, 0.6),
            s0: rng.range(1, 2.5), s1: 1, ramp: 'dew', r0: 0, r1: 0.8, a0: 1, a1: 0.2,
          });
          if (rng.next() < 0.5)
            parts.spawn({
              kind: PK.Blade, x: b[0], y: b[1], vx: rng.range(400, 1100), vy: rng.range(-100, 100), drag: 1, vrot: rng.range(-16, 16), rot: rng.range(0, TAU),
              max: rng.range(0.4, 0.8), s0: rng.range(3, 6), s1: 3, ramp: 'grass', r0: rng.next(), r1: rng.next(), a0: 1, a1: 1, add: false,
            });
        }
      }
      return;
    }
    if (t < T.pov) {
      if (!fired.swing) {
        fired.swing = true;
        parts.clear();
        parts.wind = [0, 0];
      }
      const s = swingAt(t);
      if (!fired.glitter && at(t, T.disc)) {
        fired.glitter = true;
        // Dew frozen as glitter round the disc (the rate is 0.06: it hangs).
        const R = 160 * (s.zoom / 1.25);
        for (let i = 0; i < 70; i++) {
          // A filled disc (never a ring: a ring of ticks prints as a clock face on the negative-print frames).
          const a = rng.range(0, TAU), d = Math.sqrt(rng.next()) * 1.45 * R;
          parts.spawn({
            kind: PK.Pixel, x: s.cx + Math.cos(a) * d * 0.9, y: s.cy + Math.sin(a) * d, vx: Math.cos(a) * rng.range(4, 30), vy: Math.sin(a) * rng.range(4, 30), max: 3, s0: rng.range(1, 2.4), s1: 1,
            ramp: 'dew', r0: rng.range(0, 0.4), r1: 0.6, a0: 1, a1: 0.8,
          });
        }
      }
      if (!fired.det && at(t, T.det)) {
        fired.det = true;
        detonate(env, s.cx, s.cy, 160 * (s.zoom / 1.25));
      }
      if (!fired.fling && at(t, T.hitA)) {
        fired.fling = true;
        const sw = swingAt(t);
        SW_WALL.forEach(([dx, dz, dh], i) => {
          const p = swingProject(sw.v, dx, dz, dh);
          for (let k = 0; k < 20; k++) {
            const a = rng.range(Math.PI * 0.5, Math.PI * 1.5);
            parts.spawn({
              kind: PK.Blade, x: p.x, y: p.y + rng.range(-10, 20), vx: Math.cos(a) * rng.range(150, 600), vy: Math.sin(a) * rng.range(150, 500) - 100, ay: 600, drag: 1.2,
              vrot: rng.range(-20, 20), rot: rng.range(0, TAU), max: rng.range(0.5, 0.9), s0: rng.range(2, 4), s1: 2, ramp: 'grass', r0: rng.next(), r1: rng.next(), a0: 1, a1: 1, add: false,
            });
            parts.spawn({
              kind: PK.Pixel, x: p.x, y: p.y + rng.range(-12, 12), vx: Math.cos(a) * rng.range(200, 700), vy: Math.sin(a) * rng.range(200, 600), drag: 2, max: rng.range(0.3, 0.7),
              s0: rng.range(1, 2.4), s1: 1, ramp: 'dew', r0: 0, r1: 0.9, a0: 1, a1: 0,
            });
          }
          void i;
        });
      }
      if (!fired.flingHit && at(t, T.isoEnd)) {
        fired.flingHit = true;
        // The visible hit on A and C (the print is over): 14 dew sparks thrown outward from each chest.
        const sw = swingAt(t);
        for (const i of [0, 2]) {
          const f = flungAt(t, sw, i);
          for (let k = 0; k < 14; k++) {
            const a = rng.range(0, TAU), sp = rng.range(400, 900);
            parts.spawn({
              kind: PK.Streak, x: f.chx, y: f.chy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 2.2, max: rng.range(0.2, 0.35), s0: rng.range(1.2, 2.6), s1: 0.5,
              ramp: 'dew', r0: 0, r1: 1, k: 1.2, a0: 1, a1: 0,
            });
          }
        }
      }
      if (t >= T.det) holdTrauma(cam, t < 1.75 ? 0.5 : 0.25);
      return;
    }
    // 6c: the chase POV.
    if (!fired.pov) {
      fired.pov = true;
      parts.clear();
      parts.wind = [0, 300];
    }
    const pv = povAt(t);
    holdTrauma(cam, lerp(0.3, 0.6, pv.u));
    // Vapour filaments and dew whipping past the lens from the ball's wake.
    if (rng.next() < dt * 90) {
      const a = rng.range(0, TAU);
      const d = rng.range(40, 120);
      parts.spawn({
        kind: PK.Streak, x: pv.bx + Math.cos(a) * d, y: pv.by + Math.sin(a) * d * 0.7, vx: Math.cos(a) * rng.range(900, 1600), vy: Math.sin(a) * rng.range(600, 1200), drag: 0.5,
        max: rng.range(0.15, 0.35), s0: rng.range(1, 2.5), s1: 1, ramp: 'dew', r0: 0, r1: 1, k: 1.2, a0: 0.9, a1: 0,
      });
    }
    if (!fired.step3 && at(t, T.step3)) {
      fired.step3 = true;
      ring(env, 320, VH - 70, 40, 380, 0.25, 0.9, 'dew');
      // The dew curtain thrown up under the lens.
      for (let i = 0; i < 120; i++) {
        const x = rng.range(-40, VW + 40);
        parts.spawn({
          kind: PK.Pixel, x, y: VH + rng.range(0, 30), vx: (x - 320) * rng.range(0.5, 1.6), vy: -rng.range(300, 900), ay: 900, drag: 0.8, max: rng.range(0.4, 0.8),
          s0: rng.range(1.5, 3.5), s1: 1, ramp: 'dew', r0: 0, r1: 0.9, a0: 1, a1: 0.3,
        });
      }
      for (let i = 0; i < 24; i++)
        parts.spawn({
          kind: PK.Mist, x: rng.range(0, VW), y: VH + 10, vx: rng.range(-200, 200), vy: -rng.range(200, 500), drag: 2, max: rng.range(0.4, 0.7), s0: rng.range(14, 24), s1: rng.range(30, 50),
          k: 0.3, ramp: 'vapor', r0: 0.1, r1: 1, a0: 0.45, a1: 0,
        });
    }
  },
  render(env, t) {
    const { ctx, fx, cam } = env;
    PUPPETS.frame();
    cam.x = VW / 2;
    cam.y = VH / 2;
    cam.rot = 0;
    galeStorm(fx);
    if (t < T.silence) renderRide(env, t);
    else if (t < T.pov) renderSwing(env, t);
    else renderPov(env, t);
    void ctx;
  },
};

/** Puppet render resolution for a ride depth (px per unit ≈ the on-screen scale, so D stays ≈ 1). */
function puppetK(d: number) {
  return Math.round(((K0 * 1.38 * D0) / d / PU_M) * 2) / 2;
}

/** An air step: crater bloom (decal is a pure function of t), the dew geyser, a shock. */
function stepBurst(env: Env, r: Ride, n: number) {
  const { rng, parts } = env;
  const gy = PY + r.eyeH * r.k;
  for (let i = 0; i < n; i++) {
    const a = rng.range(-Math.PI * 0.95, -Math.PI * 0.05);
    const sp = rng.range(200, 620);
    parts.spawn({
      kind: PK.Pixel, x: r.bx + rng.range(-18, 18), y: gy, vx: Math.cos(a) * sp * 0.6 - rng.range(500, 1400), vy: Math.sin(a) * sp, ay: 1200, drag: 0.8,
      max: rng.range(0.35, 0.7), s0: rng.range(1.5, 3), s1: 1, ramp: 'dew', r0: 0, r1: 0.8, a0: 1, a1: 0.3,
    });
  }
  for (let i = 0; i < 8; i++)
    parts.spawn({
      kind: PK.Mist, x: r.bx + rng.range(-30, 10), y: gy - 4, vx: -rng.range(600, 1500), vy: -rng.range(20, 120), drag: 2, max: rng.range(0.3, 0.6), s0: 10, s1: 26, k: 0.25,
      ramp: 'vapor', r0: 0, r1: 1, a0: 0.5, a1: 0,
    });
  ring(env, r.bx, gy, 6, 70, 0.3, 0.25, 'cobalt');
}

/** The detonation's particles: shards of the disc, dew sparks, blast rings. */
function detonate(env: Env, cx: number, cy: number, R: number) {
  const { rng, parts } = env;
  for (let i = 0; i < 100; i++) {
    const th = rng.range(0, TAU);
    const sp = rng.range(260, 820);
    parts.spawn({
      kind: PK.Mist, x: cx + Math.cos(th) * R * 0.9 * rng.range(0.6, 1.05), y: cy + Math.sin(th) * R * rng.range(0.6, 1.05), vx: Math.cos(th) * sp, vy: Math.sin(th) * sp,
      drag: 2.4, max: rng.range(0.25, 0.5), s0: rng.range(6, 13), s1: rng.range(16, 30), k: 0.7, ramp: 'vapor', r0: 0, r1: 1, a0: 0.45, a1: 0,
    });
  }
  for (let i = 0; i < 80; i++) {
    const th = rng.range(0, TAU);
    const sp = rng.range(300, 1100);
    parts.spawn({
      kind: PK.Streak, x: cx, y: cy, vx: Math.cos(th) * sp, vy: Math.sin(th) * sp, drag: 2.6, ay: 120, max: rng.range(0.25, 0.6), s0: rng.range(1, 2.6), s1: 0.5, ramp: 'dew',
      r0: 0, r1: 1, k: 1.2, a0: 1, a1: 0,
    });
  }
  ring(env, cx, cy, R * 0.9, R * 3.2, 0.3, 0.95, 'cobalt');
  ring(env, cx, cy, R * 0.5, R * 2.4, 0.4, 0.95, 'dew');
}

/** A wall defender's boots (screen) in the ride, or null when he is out of frame. */
function wallBoot(t: number, r: Ride, i: number): [number, number] | null {
  const d = WALL_D[i];
  const xm = wallXm(i);
  const p = rp(r, xm, 0, d);
  if (p.x < -80 || p.x > VW + 80) return null;
  const stud = wallStud(t, rideAt(T.pass).hc + BALL_RM);
  const q = rp(r, xm, stud, d);
  return [q.x, q.y];
}

// ---------------------------------------------------------------- 6a render

function renderRide(env: Env, t: number) {
  const { ctx, fx, cam } = env;
  const r = rideAt(t);
  cam.zoom = 1;
  env.world();
  drawRideWorld(env, t, r);
  stormDarken(ctx, 0.25);
  env.world();
  rideLamps(ctx, t, r);
  drawRideWake(env, t, r);
  // Craters of the air steps (decals fixed in the turf, scrolling with it).
  const gyB = PY + r.eyeH * r.k;
  for (const st of [T.step1, T.step2]) {
    if (t < st) continue;
    const cr = rideAt(st);
    const x = rp(r, cr.R, 0, D0).x;
    if (x < -120) continue;
    airCrater(ctx, x, gyB, 45 * (r.k / 155), 0.25, (simAt(t) - simAt(st)) * 3, 3, 1);
  }
  // The wall: shadows on the turf, A behind the ball's plane, B over it, C nearer (drawn after the cone).
  const wallVis = t >= T.wallIn - 0.02 && t < 0.8;
  const ballTop = rideAt(T.pass).hc + BALL_RM;
  const drawDef = (i: number) => {
    const d = WALL_D[i];
    const xm = wallXm(i);
    const g = rp(r, xm, 0, d);
    if (g.x < -160 || g.x > VW + 160) return;
    const stud = wallStud(t, ballTop);
    const near = Math.abs(g.x - (r.bx - r.br * 2)) < 190;
    const passing = t >= 0.38 && t < 0.66 && near;
    const name: keyof typeof POSE = t < T.jump ? 'crouch' : passing ? (Math.floor(t * 24) % 2 ? 'shove2' : 'shove') : 'jump';
    const kp = puppetK(d);
    const upu = (r.k * D0) / d / PU_M;
    const D = upu / kp;
    const low = lowOf(t < T.jump ? 'crouch' : 'jump');
    const sy = rp(r, xm, stud, d).y;
    const hipY = sy - low * upu;
    PUPPETS.draw(ctx, `w6-${name}`, WALL_KITS[i], POSE[name], kp, -1, g.x, hipY, D, 0.5, SIL_UP);
    // The cone's light from below on their soles and shins (local, additive).
    const lk = clamp(1 - Math.abs(g.x - (r.bx - r.br * 2.5)) / 240) * (t >= T.jump ? 1 : 0.3);
    if (lk > 0) {
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.cyan), g.x - 10 * upu, sy, 34 * upu, 0.38 * lk, 1.3, 0.55);
      drawGlow(ctx, glowOf(PAL.ice), g.x - 10 * upu, sy + 2, 12 * upu, 0.3 * lk, 1.6, 0.4);
      ctx.globalCompositeOperation = 'source-over';
    }
  };
  if (wallVis) {
    for (let i = 0; i < 3; i++) {
      const d = WALL_D[i];
      const g = rp(r, wallXm(i), 0, d);
      if (g.x < -160 || g.x > VW + 160) continue;
      const stud = wallStud(t, ballTop);
      const smear = t >= 0.38 && t < 0.7 ? 2.4 : 1;
      const w = 0.5 * g.s * (1 + stud * 0.3);
      ctx.globalAlpha = 0.55 / (1 + stud * 1.2);
      ctx.fillStyle = '#02040e';
      ctx.beginPath();
      ctx.ellipse(g.x + (smear - 1) * w * 0.55, g.y, w * smear, w * 0.13, 0, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    drawDef(0);
    drawDef(1);
  }
  // Speed streaks behind the figures (the far ones) and the bow-wave mist.
  speedStreaks(ctx, t, r, 0);
  env.parts.draw(ctx, 0);
  // The cone, the pressure bubble, the ball.
  const app = u01(t, T.approach, T.silence);
  const stepSq = (st: number) => (t >= st && t < st + 0.12 ? 1 - 0.2 * Math.sin(((t - st) / 0.12) * Math.PI) : 1);
  const sq = stepSq(T.step1) * stepSq(T.step2);
  const bell = lerp(170, 80, ease.inCubic(app)) * (r.zoom / 1.35);
  const len = lerp(320, 210, ease.inQuad(app)) * (r.zoom / 1.35);
  // (Frame 0 draws the cone as frame 1 does: the cut lands on the ball and its cone.)
  const coneA = clamp(Math.max(t, STEP) / 0.04 + 0.2);
  heroCone(ctx, r.bx, r.by, bell, len, t, coneA, { R: r.br, bright: app, sq });
  // The air sliver under the ball at the dips (≥ 4 px of light between the ball and the turf).
  for (const st of [T.step1, T.step2]) {
    const k = 1 - Math.abs(t - st) / 0.06;
    if (k > 0) airSliver(ctx, r.bx, r.by + r.br, gyB, r.br * 1.6, k);
  }
  drawBall(env, spin, r.bx, r.by, BALL_R, 3 * r.zoom, 0.8, 1, 'cobalt', sq < 1 ? { sx: 1 + (1 - sq) * 0.6, sy: sq } : undefined, { storm: true });
  pressureWall(ctx, r.bx, r.by, r.br, bell * 0.9, ease.inOutQuad(app), t);
  const bubR = r.br * 1.55;
  ctx.save();
  ctx.translate(r.bx, r.by);
  ctx.scale(1 / Math.max(0.75, sq), sq);
  bubbleRim(ctx, 0, 0, bubR, t, 0.7 + 0.3 * app);
  if (app > 0) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.8 * app;
    ctx.strokeStyle = ICE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, bubR, 0, TAU);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
  ctx.globalAlpha = 1;
  if (wallVis) drawDef(2);
  env.parts.draw(ctx, 1);
  speedStreaks(ctx, t, r, 1);
  foregroundBlades(ctx, t, r);
  // Post: the pressure bubble (glass marble), the motion streak with a sharp hole on the ball, the storm grade.
  const [u, v] = cam.toUV(r.bx, r.by);
  fx.lens = 0.22 + 0.06 * app;
  fx.lensX = u;
  fx.lensY = v;
  fx.lensR = 0.16;
  const slow = t >= 0.34 && t < 0.68 ? 0.12 : 1;
  fx.streak = (t < 0.1 ? lerp(0.075, 0.035, t / 0.1) : 0.035) * slow * (1 - 0.7 * app);
  // The wall's entrance and take-off (0.25-0.40) must read as figures, not grey smears.
  fx.streak *= t >= T.wallIn && t < 0.4 ? 0.3 : 1;
  fx.streakDX = -1;
  fx.streakDY = 0;
  fx.streakHoleX = u;
  fx.streakHoleY = v;
  fx.streakHoleR = 0.14;
  fx.ca = 0.003 + 0.006 * app;
  fx.vignette = 0.62;
  // Air-step shocks.
  for (const st of [T.step1, T.step2]) {
    const age = t - st;
    if (age >= 0 && age < 0.3) {
      const [gu, gv] = cam.toUV(r.bx, gyB);
      pushShock(fx, { x: gu, y: gv, r: 0.05 + age * 1.6, s: 0.025 * (1 - age / 0.3) });
    }
  }
  if (app > 0) {
    // The rising shriek: the frame tightens toward the nose.
    fx.radial = 0.05 * app;
    const [nu, nv] = cam.toUV(r.bx + r.br * 2, r.by);
    fx.radialX = nu;
    fx.radialY = nv;
    fx.bloom = 1.0 + 0.2 * app;
  }
}

/** Horizontal speed streaks: layer 0 far and faint behind the figures, layer 1 near and bright in front. */
function speedStreaks(ctx: CanvasRenderingContext2D, t: number, r: Ride, layer: 0 | 1) {
  const slow = t >= 0.34 && t < 0.68 ? 0.15 : 1;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const n = layer ? 16 : 24;
  for (let i = 0; i < n; i++) {
    const h = hash(i * 7.7 + layer * 100);
    const y = layer ? lerp(40, 350, hash(i * 3.1 + 9)) : lerp(10, 300, h);
    if (layer && Math.abs(y - r.by) < r.br * 1.4) continue;
    const sp = (layer ? 3600 : 1500) * (0.7 + hash(i * 1.3) * 0.6);
    const len = (layer ? 120 : 50) + hash(i * 5.5) * (layer ? 220 : 90);
    const span = VW + len + 200;
    const x = VW + 100 - ((((simAt(t) * sp + hash(i * 2.9) * span) % span) + span) % span);
    ctx.globalAlpha = (layer ? 0.32 : 0.16) * (0.5 + 0.5 * hash(i * 4.4)) * (0.4 + 0.6 * slow);
    ctx.fillStyle = i % 5 ? ICE : CYAN;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(len * (0.3 + 0.7 * slow)), 1);
  }
  ctx.restore();
}

/** Foreground grass blades at the bottom of the frame (parallax ~4: they whip past as streaks). */
function foregroundBlades(ctx: CanvasRenderingContext2D, t: number, r: Ride) {
  const d = 1.6;
  const s = (r.k * D0) / d;
  const gy = PY + r.eyeH * s;
  if (gy > VH + 40) return;
  ctx.save();
  ctx.fillStyle = '#0d2414';
  ctx.globalAlpha = 0.9;
  ctx.fillRect(-60, Math.round(gy), VW + 120, VH + 60);
  for (let i = 0; i < 40; i++) {
    const xm = Math.floor((r.camR - 6) / 0.35) * 0.35 + i * 0.35;
    const x = 320 + (xm - r.camR) * s;
    if (x < -40 || x > VW + 40) continue;
    const h = (10 + hash(Math.round(xm / 0.35) * 1.7) * 22) * (s / 600);
    ctx.fillStyle = hash(Math.round(xm / 0.35)) > 0.5 ? '#163a20' : '#1f4a2a';
    ctx.globalAlpha = 0.95;
    ctx.fillRect(Math.round(x), Math.round(gy - h), Math.max(2, Math.round(s * 0.02)), Math.round(h + 4));
  }
  ctx.restore();
  void t;
}

// ---------------------------------------------------------------- 6b render

/** The ball's flight after the detonation: ab = s since the print began; e 0 -> 1 over 0.18 s (inQuad). */
const FLY = { dx: 380, dy: 120, dur: 0.18, grow: 0.72 } as const;
const flyE = (ab: number) => ease.inQuad(clamp(ab / FLY.dur));

function renderSwing(env: Env, t: number) {
  const { ctx, fx, cam } = env;
  const s = swingAt(t);
  const { v, cx, cy } = s;
  const det = at(t, T.det);
  const simT = simAt(t);
  // A one-hit zoom kick on the detonation (never held, so swingAt's pull-out punch reads through it).
  cam.zoom = det ? 1 + 0.04 * clamp(1 - (t - T.det) / 0.1) : 1;
  env.world();
  ctx.fillStyle = SNAVY;
  ctx.fillRect(-80, -80, VW + 160, VH + 160);
  // The world drops away to 15 % (the vacuum): the turf's stripes, the wake and the craters turning into perspective,
  // the stand ring's dark wall with its crowd specks, floodlight bokeh on 4 depth bands sliding by parallax as the camera
  // swings. The blast relights it a little.
  // The impact frames keep the field quiet so their luminance bands print only the subject (never a bullseye with polka
  // dots): the weather-map frames (iso stage 1) draw no world at all (the smooth pressure field and the ball), the
  // negative-print frames (stage 2) no turf stripes, crowd, lamps, bokeh or particles.
  const mapF = det && t < T.iso2 - 1e-6;
  const printF = det && !mapF && t < T.isoEnd - 1e-6;
  const relight = det ? 1 + 0.3 * clamp(1 - (t - T.iso2) / 0.35) : 1;
  const quiet = mapF || printF;
  if (!mapF) {
    drawSwingGround(ctx, v, simT, 1.2, { craters: [3.5, 11.5], wake: true });
    swingTurf(ctx, v, simT, quiet ? 0 : relight);
    swingStands(ctx, v, quiet ? 0.6 : 1, quiet ? null : env.art.stadium.crowd);
  }
  if (det && !mapF) stormDarken(ctx, 0.3);
  if (printF) {
    // Film fix M2: the negative print is three tones, never a near-white two-tone (ZENITH's impact frame) and never the
    // brightest full frame of the film: the void under the figures is a flat mid tone, so it prints cobalt, the all-ice
    // bodies and ball print navy and only the vignetted corners print ice (mean luminance ~0.3).
    // The third tone is the ice contour the print draws round the ball (below) and the pressed shadows under the bodies;
    // no dark corners (a round ice frame would read as an iris, MERIDIAN's).
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = 'rgb(118,124,140)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
  }
  if (!quiet) {
    swingLights(ctx, v, t, relight);
    swingBokeh(ctx, v, t, det ? 1.2 : 0.9);
  }
  // Isobars rippling slowly across the frame (faint contour rings round the ball); never on the impact frames.
  if (!(det && t < T.isoEnd - 1e-6)) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const rr = (((t - T.silence) * 40 + i * 70) % 420) + 170;
      ctx.globalAlpha = 0.12 * (1 - (rr - 170) / 420) * (det ? 0.4 : 1);
      ctx.strokeStyle = CYAN;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rr * Math.max(0.35, swingAspect(v)), rr, 0, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }
  // The wall hanging deep in the dark (frozen), then flung (not on the weather map: its notches only scribble the bands).
  // Film fix M2: on the print frames a soft dark halo hugs every figure, so the print gets its third tone: an ice contour
  // round the navy bodies and the navy ball on the cobalt void (never a two-tone frame).
  const printHalo = (on: boolean) => {
    ctx.shadowColor = on ? 'rgb(8,10,18)' : 'rgba(0,0,0,0)';
    ctx.shadowBlur = on ? 10 : 0;
  };
  printHalo(printF);
  if (!mapF) drawSwingWall(env, t, s, false);
  printHalo(false);
  if (!mapF && !printF) env.parts.draw(ctx, 0);
  const R = 160 * (s.zoom / 1.25);
  if (!det) {
    const asp = swingAspect(v);
    const snap = u01(t, T.disc, T.disc + 2 / 60);
    if (snap < 1) {
      // The needle (the cone, side-on, collapsing to a 40 px spike) in the last frames before the snap, with the pressure
      // wall still standing one ball radius ahead of its nose.
      heroCone(ctx, cx, cy, 40 * (s.zoom / 1.35), 320 * (s.zoom / 1.35) * Math.sin(v.yaw), t, 1 - snap, { R: s.br, bright: 1 });
      pressureWall(ctx, cx, cy, s.br, 70, 1 - snap, t);
    }
    if (snap > 0) haloDisc(ctx, cx + s.br * 0.15, cy, R * lerp(0.6, 1, snap), Math.max(0.03, asp), t, snap);
    drawBall(env, spin, cx, cy, BALL_R, 3 * s.zoom, 0.85, 1, 'cobalt', undefined, { storm: true });
    bubbleRim(ctx, cx, cy, s.br * 1.5, t, 0.9);
  } else {
    // The blast. Stage 1 (1.60-1.65) prints the pressure field itself, growing every frame, with the subject at its eye
    // (navy > cobalt > cyan > the white-hot core > the dark ball); then the condensation shell balloons out (rim puffs
    // only), the disc's rim is thrown outward as an ice ring, and the ball rockets at the lens behind its Mach chevron.
    const age = t - T.det;
    const map = mapF;
    if (map) {
      const asp = swingAspect(v), rr = R * (1 + age * 9);
      // A smooth luminance field (the glows drawn smoothed, not as stair-stepped sprites) so the bands are clean
      // concentric blobs with no islands; no stroked ring (the bands carry their own contour lines).
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      drawGlow(ctx, softSprite('vapor', 0.2), cx, cy, rr * 1.1, 0.7, asp * 1.25, 1);
      drawGlow(ctx, glowOf(PAL.cyan), cx, cy, rr * 0.8, 0.3, asp * 1.15, 1);
      ctx.restore();
    }
    const ab = Math.max(0, age - 0.066);
    const bu = ease.outCubic(clamp(ab / 0.3));
    if (!map) {
      // The blast ring and the fog shell only after the print (on a negative print they are a bullseye of rings).
      if (!printF) {
        fogShell(ctx, cx, cy, R, ab + 0.03, t);
        ctx.save();
        ctx.globalAlpha = clamp(1 - ab / 0.32) * 0.5;
        ctx.strokeStyle = NAVY;
        ctx.lineWidth = 26 * (1 - bu) + 6;
        ctx.beginPath();
        ctx.ellipse(cx, cy, R * (1.1 + 2.2 * bu) * 0.92, R * (1.1 + 2.2 * bu), 0, 0, TAU);
        ctx.stroke();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = clamp(1 - ab / 0.3);
        ctx.strokeStyle = ICE;
        ctx.lineWidth = 12 * (1 - bu) + 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, R * (1.1 + 2.2 * bu) * 0.92, R * (1.1 + 2.2 * bu), 0, 0, TAU);
        ctx.stroke();
        ctx.globalAlpha = clamp(1 - ab / 0.22) * 0.6;
        ctx.strokeStyle = CYAN;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(cx, cy, R * (0.7 + 1.4 * bu) * 0.92, R * (0.7 + 1.4 * bu), 0, 0, TAU);
        ctx.stroke();
        if (ab < 0.1) drawGlow(ctx, glowOf(PAL.cyan), cx, cy, R * 0.9, 0.45 * (1 - ab / 0.1));
        ctx.restore();
      }
      // Focus lines burst outward once the impact frames are over (never printed as a sunburst pattern).
      const fl = ab - (T.isoEnd - T.iso2);
      if (fl >= 0 && fl < 0.12) {
        const rng = env.frng(61);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        focusLines(ctx, rng, cx, cy, R * (1.2 + fl * 5), 760, 90, 'rgb(238,251,255)', 0.7 * (1 - fl / 0.12), 3);
        ctx.restore();
      }
    }
    // The ball rockets at the lens: 60 -> ~150 px in 0.18 s while it tears down-right and leaves the frame past the
    // right edge on its 2-frame streak (post, below). It holds on the contact through the weather map.
    const e = flyE(ab);
    // The Mach chevron only after the print frames (on a negative print a line from the centre reads as a clock hand).
    const chev = ab > T.isoEnd - T.det - 0.066;
    if (e < 1) {
      const k = 1 / (1 - FLY.grow * e);
      const bx = cx + FLY.dx * e, by = cy + FLY.dy * e;
      if (!map && chev) machChevron(ctx, bx, by, cx, cy, 400, 1 - e * 0.4, t);
      if (map) {
        // The weather map prints the subject: a navy ball with an ice outline at the eye of the map (it prints as a dark
        // disc in the white-hot core: navy > cobalt > cyan > ice > ball > ice > cyan > cobalt > navy along the row).
        ctx.fillStyle = NAVY;
        ctx.beginPath();
        ctx.arc(bx, by, s.br * 0.95, 0, TAU);
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = ICE;
        ctx.stroke();
      } else if (printF) {
        // The negative print stamps the ball as one solid navy disc (no panel texture or halo rings to print), ringed in ice.
        // A dark ring round it prints as an ice contour (the ball's shape, not a ring pattern: one ring only).
        ctx.strokeStyle = 'rgb(8,10,18)';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(bx, by, s.br * k * 0.95 + 4, 0, TAU);
        ctx.stroke();
        printHalo(true);
        ctx.fillStyle = ICE;
        ctx.beginPath();
        ctx.arc(bx, by, s.br * k * 0.95, 0, TAU);
        ctx.fill();
        printHalo(false);
      } else drawBall(env, spin, bx, by, BALL_R, 3 * s.zoom * k, 0.9, 1, 'cobalt', undefined, { storm: true });
    } else if (ab < 0.34) {
      machChevron(ctx, cx + FLY.dx + 20, cy + FLY.dy + 6, cx, cy, 420, 0.6 * (1 - (ab - FLY.dur) / (0.34 - FLY.dur)), t);
    }
  }
  if (!mapF && !printF) env.parts.draw(ctx, 1);
  printHalo(printF);
  drawSwingWall(env, t, s, true);
  printHalo(false);
  // Post.
  if (!det) {
    vacuumGrade(fx, u01(t, T.silence, T.silence + 2 / 60));
    const [u, w] = cam.toUV(cx, cy);
    const halo = u01(t, T.disc, T.halo);
    // The stadium bends in the bubble (the lens grows with the disc and spans it).
    fx.lens = 0.1 + 0.3 * halo;
    fx.lensX = u;
    fx.lensY = w;
    fx.lensR = clamp((R / VH) * 1.1, 0.1, 0.55);
    fx.ca = 0.003 + 0.004 * halo;
    if (t < T.disc + 0.04) {
      // The turn begins on a whip of air.
      fx.streak = 0.02 * (1 - u01(t, T.silence, T.disc + 0.04));
      fx.streakDX = -1;
      fx.streakHoleX = u;
      fx.streakHoleY = w;
      fx.streakHoleR = 0.12;
    }
  } else {
    const age = t - T.det;
    floodBack(fx, age * 2);
    const [u, w] = cam.toUV(cx, cy);
    if (at(t, T.det) && t < T.iso2 - 1e-6) {
      // The weather map: luminance-led (mix 0.38, so the dark ball prints dark at the eye), its radial term widening
      // every frame (the field grows), a faint wobble (rounder bands, no lobes).
      galeIso(fx, 1, [u, w], { mix: 0.38, r: 0.9 + 6 * age });
      fx.isoWob = 0.005;
    } else if (at(t, T.iso2) && t < T.isoEnd - 1e-6) galeIso(fx, 2);
    for (const [s0, sh] of [[T.det, 0.065], [1.65, 0.04]] as const) {
      const a2 = t - s0;
      // Softer through the weather map (a full-strength ring refracts the bands into islands).
      const mk = at(t, T.det) && t < T.iso2 - 1e-6 ? 0.3 : 1;
      if (a2 >= 0 && a2 < 0.35) pushShock(fx, { x: u, y: w, r: 1.4 * ease.outQuad(a2 / 0.35), s: sh * (1 - a2 / 0.35) * mk });
    }
    fx.radial = age < 0.066 ? 0.12 : 0.05 * clamp(1 - (age - 0.066) / 0.2);
    fx.radialX = u;
    fx.radialY = w;
    fx.ca = 0.014 * clamp(1 - age / 0.35) + 0.002;
    fx.bloom = Math.max(fx.bloom, 1.35 - age * 1.2);
    // On the impact frames the bloom only shapes the bands (the print replaces the colour): kept low so it never floods
    // the dark ball at the eye or melts the printed bodies into blobs.
    if (at(t, T.det) && t < T.isoEnd - 1e-6) fx.bloom = 0.3;
    // Defender B at the lens: a light zoom blur toward the lens centred on him (kept short: the 12-tap blur must never
    // ladder his 1 px rim into a comb).
    const b = bodyAt(t, s);
    if (b) {
      const [hu, hv] = cam.toUV(b.x, b.y);
      fx.radial = Math.max(fx.radial, 0.035 * b.u);
      fx.radialX = hu;
      fx.radialY = hv;
    }
    // The ball's last two frames: it bursts past the lens on a streak along its flight (its core held sharp).
    const ab = Math.max(0, age - 0.066);
    const e = flyE(ab);
    if (e < 1 && ab > FLY.dur - 2 / 60 - 1e-6) {
      const [bu2, bv2] = cam.toUV(cx + FLY.dx * e, cy + FLY.dy * e);
      const l = Math.hypot(FLY.dx, FLY.dy);
      fx.streak = 0.04;
      fx.streakDX = FLY.dx / l;
      fx.streakDY = FLY.dy / l;
      fx.streakHoleX = bu2;
      fx.streakHoleY = bv2;
      fx.streakHoleR = 0.1;
    }
  }
}

/** The swing's turf at 15 %: alternating mowing bands (5 m along the flight) and their pale edges, in perspective. */
function swingTurf(ctx: CanvasRenderingContext2D, v: SwingView, simT: number, k: number) {
  const h = 1.2;
  const scroll = (simT * 30) % 10;
  ctx.save();
  for (let i = -6; i <= 6; i++) {
    const x0 = i * 10 - scroll, x1 = x0 + 5;
    ctx.beginPath();
    let n = 0;
    for (let z = -40; z <= 40; z += 4) {
      const p = swingProject(v, x0, z, -h);
      if (p.d < 0.8) continue;
      n++ ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
    }
    for (let z = 40; z >= -40; z -= 4) {
      const p = swingProject(v, x1, z, -h);
      if (p.d < 0.8) continue;
      ctx.lineTo(p.x, p.y);
    }
    if (n < 2) continue;
    ctx.closePath();
    ctx.globalAlpha = clamp(0.85 * k);
    ctx.fillStyle = 'rgb(20,52,36)';
    ctx.fill();
  }
  // Stripe edges as pale lines (they carry the yaw's parallax).
  ctx.strokeStyle = 'rgb(90,150,110)';
  ctx.lineWidth = 1;
  for (let i = -12; i <= 12; i++) {
    const x0 = i * 5 - (simT * 30) % 5;
    ctx.beginPath();
    let n = 0;
    for (let z = -40; z <= 40; z += 4) {
      const p = swingProject(v, x0, z, -h);
      if (p.d < 0.8) continue;
      n++ ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
    }
    ctx.globalAlpha = clamp(0.6 * k);
    ctx.stroke();
  }
  ctx.restore();
}

/** The stand ring round the swing (r 30 m, turf to 10 m up): dark navy quads with a 1 px crowd-speck line on top. */
function swingStands(ctx: CanvasRenderingContext2D, v: SwingView, k: number, crowd: HTMLCanvasElement | null) {
  const N = 64, RAD = 30, H0 = -1.2, H1 = 9;
  const CROWD = ['#c81e2a', '#e8ecf4', '#f0c040', '#5a78c8', '#e8ecf4', '#8a96b4'];
  ctx.save();
  for (let j = 0; j < N; j++) {
    const a0 = (j / N) * TAU, a1 = ((j + 1) / N) * TAU;
    const p00 = swingProject(v, Math.cos(a0) * RAD, Math.sin(a0) * RAD, H0);
    const p10 = swingProject(v, Math.cos(a1) * RAD, Math.sin(a1) * RAD, H0);
    if (p00.d < 2 || p10.d < 2) continue;
    if (Math.max(p00.x, p10.x) < -40 || Math.min(p00.x, p10.x) > VW + 40) continue;
    const p01 = swingProject(v, Math.cos(a0) * RAD, Math.sin(a0) * RAD, H1);
    const p11 = swingProject(v, Math.cos(a1) * RAD, Math.sin(a1) * RAD, H1);
    ctx.globalAlpha = clamp(0.7 * k);
    ctx.fillStyle = 'rgb(24,30,64)';
    ctx.beginPath();
    ctx.moveTo(p00.x, p00.y);
    ctx.lineTo(p10.x + 0.5, p10.y);
    ctx.lineTo(p11.x + 0.5, p11.y);
    ctx.lineTo(p01.x, p01.y);
    ctx.closePath();
    ctx.fill();
    // The crowd itself, crushed to the vacuum's 15 %: two tiers of the stadium's crowd strip in this segment (the lens
    // has real faces and colours to bend; the yaw slides them by parallax).
    if (crowd) {
      const sw = 48, sx = (j * 97) % (crowd.width - sw);
      const xl = Math.min(p01.x, p00.x), xr = Math.max(p11.x, p10.x) + 0.5;
      const ytop = Math.min(p01.y, p11.y), ybot = lerp(ytop, Math.max(p00.y, p10.y), 0.88);
      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = clamp(0.3 * k);
      for (let tier = 0; tier < 2; tier++) {
        const y0 = lerp(ytop, ybot, tier / 2), y1 = lerp(ytop, ybot, (tier + 1) / 2);
        ctx.drawImage(crowd, sx + tier * 7, 0, sw, crowd.height, Math.round(xl), Math.round(y0), Math.max(1, Math.round(xr - xl)), Math.max(1, Math.round(y1 - y0)));
      }
    }
    // Tier lines across the stand (3), faint, so the wall has structure as it slides by.
    ctx.globalAlpha = clamp(0.35 * k);
    ctx.fillStyle = 'rgb(44,56,104)';
    for (let r = 1; r <= 3; r++) {
      const f = r / 4;
      const ya = lerp(p00.y, p01.y, f), yb = lerp(p10.y, p11.y, f);
      const n = Math.max(1, Math.ceil(Math.abs(p10.x - p00.x)));
      for (let q = 0; q < n; q += 2) ctx.fillRect(Math.round(lerp(p00.x, p10.x, q / n)), Math.round(lerp(ya, yb, q / n)), 1, 1);
    }
    // The crowd specks along the top edge (1 px, every 2 px).
    const n = Math.max(1, Math.ceil(Math.abs(p11.x - p01.x) / 2));
    for (let q = 0; q < n; q++) {
      const f = q / n;
      const hsh = hash(j * 37.1 + q * 3.3);
      ctx.globalAlpha = clamp((0.35 + 0.35 * hsh) * k);
      ctx.fillStyle = CROWD[Math.floor(hsh * CROWD.length)];
      ctx.fillRect(Math.round(lerp(p01.x, p11.x, f)), Math.round(lerp(p01.y, p11.y, f)) + (hsh > 0.6 ? 1 : 0), 1, 1);
    }
  }
  ctx.restore();
}

/**
 * The stadium's lights round the swing (all through swingProject, so they slide by parallax as the yaw turns): the roof
 * ring (48 lamps, r 40 m), the stand ring (72 lamps, r 28-34 m) and a mid band of 32 nearer bokeh (r 18 m).
 */
function swingLights(ctx: CanvasRenderingContext2D, v: SwingView, t: number, k: number) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const BANDS = [
    { n: 48, rad: (i: number) => 40 + 0 * i, hgt: (i: number) => 9 + (i % 3) * 2.5, big: 1000, ga: 0.34, fa: 0.22, ra: 0.3, off: 0.2 },
    { n: 72, rad: (i: number) => 28 + (i % 4) * 2, hgt: (i: number) => 1.5 + (i % 4) * 1.6, big: 640, ga: 0.22, fa: 0.14, ra: 0.2, off: 0.05 },
    { n: 32, rad: () => 18, hgt: (i: number) => 3 + (i % 3) * 1.4, big: 520, ga: 0.16, fa: 0.1, ra: 0.18, off: 0.11 },
  ];
  BANDS.forEach((B, bi) => {
    for (let i = 0; i < B.n; i++) {
      const th = (i / B.n) * TAU + B.off;
      const rad = B.rad(i);
      const p = swingProject(v, Math.cos(th) * rad, Math.sin(th) * rad, B.hgt(i) - 1.2);
      if (p.d < 2 || p.x < -60 || p.x > VW + 60 || p.y < -60 || p.y > VH + 60) continue;
      const r = clamp(B.big / p.d, 4, 26);
      const tw = 0.8 + 0.2 * Math.sin(t * 5 + i * 1.7 + bi);
      const col: RGB = bi === 0 ? [255, 248, 226] : bi === 2 ? [150, 210, 255] : i % 3 ? [170, 220, 250] : [255, 236, 200];
      drawGlow(ctx, glowOf(col), p.x, p.y, r * 2.4, B.ga * tw * k);
      // A soft-edged bokeh disc (defocused lamp) with a brighter rim.
      ctx.globalAlpha = clamp(B.fa * tw * k);
      ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = clamp(B.ra * tw * k);
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });
  ctx.restore();
}

/** The detonation's condensation cloud: a white fog shell ballooning out from the disc (normal blend), fading. */
function fogShell(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, age: number, t: number) {
  if (age < 0.02) return;
  const e = ease.outCubic(clamp((age - 0.02) / 0.4));
  // Gone by 1.85: the flung wall is seen against the dark, not a grey wash.
  const fade = clamp(1 - (age - 0.06) / 0.15) * ease.inOutQuad(clamp((age - 0.02) / 0.1));
  if (fade <= 0) return;
  ctx.save();
  const rr = R * (0.8 + 2.4 * e);
  // Only the shell's rim: puffs ballooning outward (no filled body, so the world stays dark inside it).
  for (let i = 0; i < 36; i++) {
    const th = (i / 36) * TAU + hash(i * 3.1) * 0.2;
    const d = rr * (0.82 + 0.25 * hash(i * 7.7));
    const sz = R * (0.22 + 0.2 * hash(i * 1.9)) * (0.8 + e);
    ctx.globalAlpha = 0.35 * fade;
    ctx.drawImage(softSprite('vapor', 0.05 + 0.3 * hash(i)), cx + Math.cos(th) * d * 0.95 - sz, cy + Math.sin(th) * d - sz, sz * 2, sz * 2);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
  void t;
}

/** The vapour disc in its halo: vaporDisc + radial condensation streaks, an ice inner ring, the turbulent rim. */
function haloDisc(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, aspect: number, t: number, a: number, pocket = true) {
  vaporDisc(ctx, x, y, r, aspect, t, a);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(aspect, 1);
  // The condensation body: an ice-white mass thickening toward the rim (clear round the ball's pocket), so the disc
  // reads as a bright vapour disc, not a glass ring.
  const gd = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r);
  gd.addColorStop(0, 'rgba(226,246,255,0)');
  gd.addColorStop(0.6, `rgba(226,246,255,${0.35 * a})`);
  gd.addColorStop(1, `rgba(240,250,255,${0.7 * a})`);
  ctx.fillStyle = gd;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  // Radial condensation streaks flowing outward (the pressure leaving the ball).
  ctx.lineWidth = 1 / Math.max(0.3, aspect);
  for (let i = 0; i < 48; i++) {
    const th = (i / 48) * TAU + hash(i * 2.1) * 0.1;
    const f = (t * (0.5 + hash(i) * 0.5) + hash(i * 3.3)) % 1;
    const r0 = r * (0.3 + 0.55 * f), r1 = r0 + r * (0.1 + 0.12 * hash(i * 6.6));
    ctx.globalAlpha = 0.4 * a * (1 - f * 0.6);
    ctx.strokeStyle = i % 3 ? ICE : CYAN;
    ctx.beginPath();
    ctx.moveTo(Math.cos(th) * r0, Math.sin(th) * r0);
    ctx.lineTo(Math.cos(th) * r1, Math.sin(th) * r1);
    ctx.stroke();
  }
  // Ice inner ring round the ball's pocket, and the bright standing rim.
  ctx.lineWidth = 2 / Math.max(0.3, aspect);
  ctx.globalAlpha = 0.7 * a;
  ctx.strokeStyle = ICE;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.2, 0, TAU);
  ctx.stroke();
  ctx.globalAlpha = 0.5 * a;
  ctx.lineWidth = 6 / Math.max(0.3, aspect);
  ctx.strokeStyle = CYAN;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.0, 0, TAU);
  ctx.stroke();
  ctx.globalAlpha = 0.9 * a;
  ctx.lineWidth = 2 / Math.max(0.3, aspect);
  ctx.strokeStyle = ICE;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.985, 0, TAU);
  ctx.stroke();
  ctx.restore();
  // The navy pocket for the ball (or, on the weather-map frames, an even condensation fill).
  ctx.globalCompositeOperation = 'source-over';
  if (pocket) drawGlow(ctx, glowOf(PAL.navy), x, y, r * 0.28, 0.75 * a, aspect, 1);
  else drawGlow(ctx, softSprite('vapor', 0.1), x, y, r * 0.5, 0.85 * a, aspect, 1);
  ctx.globalAlpha = 1;
}

/** The needle-sharp Mach chevron behind the ball: two ice lines diverging back toward (tx, ty), len px long. */
function machChevron(ctx: CanvasRenderingContext2D, bx: number, by: number, tx: number, ty: number, len: number, a: number, t: number) {
  if (a <= 0) return;
  const ang = Math.atan2(ty - by, tx - bx);
  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(ang);
  // Vapour fill between the arms, navy halo, then the arms.
  ctx.globalAlpha = 0.35 * a;
  ctx.fillStyle = NAVY;
  ctx.beginPath();
  ctx.moveTo(-6, 0);
  ctx.lineTo(len, -len * 0.2);
  ctx.lineTo(len, len * 0.2);
  ctx.closePath();
  ctx.fill();
  const g = ctx.createLinearGradient(0, 0, len, 0);
  g.addColorStop(0, `rgba(240,250,255,${0.55 * a})`);
  g.addColorStop(1, 'rgba(240,250,255,0)');
  ctx.globalAlpha = 1;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(len, -len * 0.15);
  ctx.lineTo(len, len * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  for (const side of [-1, 1]) {
    ctx.globalAlpha = 0.95 * a;
    ctx.strokeStyle = ICE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(len, side * len * 0.15);
    ctx.stroke();
    ctx.globalAlpha = 0.45 * a;
    ctx.strokeStyle = CYAN;
    ctx.lineWidth = 5;
    ctx.stroke();
  }
  ctx.globalAlpha = 0.9 * a;
  ctx.fillStyle = ICE;
  ctx.fillRect(0, -1, len * 0.85, 2);
  ctx.restore();
  ctx.globalAlpha = 1;
  void t;
}

/** The wall in the swing: hanging deep in the dark, then flung (A up, C down, B at the lens). front = the flung pass. */
function drawSwingWall(env: Env, t: number, s: ReturnType<typeof swingAt>, front: boolean) {
  const { ctx, fx, cam } = env;
  const hits = [T.hitA, T.hitB, T.hitC];
  SW_WALL.forEach(([dx, dz, dh], i) => {
    const p = swingProject(s.v, dx, dz, dh);
    const upu = p.s / PU_M;
    const hit = hits[i];
    const flung = t >= hit;
    if (i === 1 && flung) {
      if (front) drawBodyAtLens(env, t, s);
      return;
    }
    // A and C hang in the back pass; once flung they fly in front of the blast cloud.
    if (flung !== front) return;
    if (p.x < -200 || p.x > VW + 200) return;
    if (!flung) {
      // Hanging: the slow-motion float (a few px over the halo's half second), each in his own pose, pure navy
      // silhouettes with the swing's cyan rim (never three lit copies of one figure).
      const y = p.y - Math.sin((t - T.silence) * 2 + i) * 2;
      // Their shadows on the turf below: they hang in mid-air.
      const g = swingProject(s.v, dx, dz, -1.2);
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#01030a';
      ctx.beginPath();
      ctx.ellipse(g.x, g.y, 0.45 * g.s, 0.07 * g.s, 0, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
      const [nm, pose] = SW_HANG[i];
      PUPPETS.draw(ctx, nm, WALL_KITS[i], pose, 1.5, -1, p.x, y, (upu * 1.3) / 1.5, 0, printAt(t) ? SIL_ICE : SIL_SWING, 1, 0);
      return;
    }
    // Flung: thrown apart by the blast ring (A up and away, C down), spinning, growing as they fly past the camera.
    const { age, x, y, rot, wpu, chx, chy } = flungAt(t, s, i);
    const kp = wpu > 2.2 ? 3 : 1.5;
    const nm = i === 0 ? 'w6-blown' : 'w6-blown2';
    // On the negative-print frames they are drawn all-ice, so the print stamps them as solid navy silhouettes.
    const sil = printAt(t) ? SIL_ICE : SIL_FLUNG;
    PUPPETS.draw(ctx, nm, WALL_KITS[i], i === 0 ? POSE.blown : POSE.blown2, kp, -1, x, y, wpu / kp, 0, sil, 1, rot);
    // The hit: an ice impact at the chest and a ring thrown off it, timed from the end of the print (never printed as
    // rings), and a shock in the post.
    const ha = t - Math.max(hit, T.isoEnd);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    if (ha >= 0 && ha < 0.1) drawGlow(ctx, glowOf(PAL.ice), chx, chy, 70 * upu, 0.8 * (1 - ha / 0.1));
    if (ha >= 0 && ha < 0.22) {
      ctx.globalAlpha = 0.85 * (1 - ha / 0.22);
      ctx.strokeStyle = ICE;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(chx, chy, 10 * upu + ha * 520, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 0.5 * (1 - ha / 0.22);
      ctx.strokeStyle = CYAN;
      ctx.lineWidth = 8;
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
    if (age < 0.25) {
      const [u, w] = cam.toUV(chx, chy);
      pushShock(fx, { x: u, y: w, r: 0.04 + age * 1.2, s: 0.03 * (1 - age / 0.25) });
    }
  });
}

/** A (i 0) or C (i 2) flung by the blast at t >= its hit: hip position, spin, scale (px per unit) and chest. */
function flungAt(t: number, s: ReturnType<typeof swingAt>, i: number) {
  const [dx, dz, dh] = SW_WALL[i];
  const p = swingProject(s.v, dx, dz, dh);
  const upu = p.s / PU_M;
  const age = t - [T.hitA, T.hitB, T.hitC][i];
  const dir = i === 0 ? [-900, -700] : [-800, 520];
  const x = p.x + dir[0] * age;
  const y = p.y + dir[1] * age + (i === 0 ? 0 : 300 * age * age);
  const rot = (i === 0 ? -1 : 1) * (7 + i) * age;
  const wpu = upu * (1 + age * 9);
  return { age, x, y, rot, wpu, upu, chx: x + Math.sin(rot) * 20 * wpu, chy: y - Math.cos(rot) * 20 * wpu };
}

/** Defender B's flight at the lens (1.68-1.935): screen position, scale, spin. Null outside it. */
function bodyAt(t: number, s: ReturnType<typeof swingAt>) {
  if (t < T.hitB || t >= T.bodyEnd) return null;
  const [dx, dz, dh] = SW_WALL[1];
  const p = swingProject(s.v, dx, dz, dh);
  const u = u01(t, T.hitB, T.bodyEnd);
  // Perspective: depth falls toward the lens, so the scale grows hyperbolically (1 -> ~10 in the last frames).
  // The slam: over his last frames he tumbles right over the lens (×4 on top of the perspective), so his body covers
  // most of the frame for three frames (1.90-1.93) before the cut.
  const sl = u01(u, 0.72, 0.87);
  // Capped so his ice rim still crosses the frame on the last two frames (a body at the lens, never a black frame).
  const k = Math.min(24, (1 / (1 - 0.978 * Math.pow(u, 1.3))) * (1 + 3 * sl * sl * (3 - 2 * sl)));
  const x = lerp(p.x, 330, ease.inQuad(u)), y = lerp(p.y, 190, ease.inQuad(u)) + Math.sin(u * 9) * 6;
  return { u, k, x, y, upu: (p.s / PU_M) * k * 0.9, rot: 0.6 + (t - T.hitB) * 8 };
}

/** A puppet foot (units from the hip, facing right): the ankle and the ankle -> toe vector (puppet.ts skeleton). */
function footOf(p: Pose, near: boolean) {
  const th = near ? p.thighN : p.thighF, kn = near ? p.kneeN : p.kneeF, ft = near ? p.footN : p.footF;
  const kx = (near ? 2 : -2) + Math.sin(th) * 19, ky = 3 + Math.cos(th) * 19;
  const ax = kx + Math.sin(th - kn) * 18, ay = ky + Math.cos(th - kn) * 18;
  const a3 = th - kn + Math.PI / 2 - ft;
  return { ax, ay, fdx: Math.sin(a3) * 8, fdy: Math.cos(a3) * 8 };
}

/** Defender B hurled at the lens: a tumbling navy silhouette with an ice rim, growing until it covers the frame. */
function drawBodyAtLens(env: Env, t: number, s: ReturnType<typeof swingAt>) {
  const { ctx } = env;
  const b = bodyAt(t, s);
  if (!b) return;
  const { x, y, upu, rot } = b;
  const kk = upu < 1.8 ? B_KK[0] : upu < 2.6 ? B_KK[1] : upu < 3.6 ? B_KK[2] : upu < 4.6 ? B_KK[3] : B_KK[4];
  const two = Math.floor(t * 20) % 2 === 1;
  const pose = two ? POSE.blown2 : POSE.blown;
  const nm = two ? 'w6-blown2' : 'w6-blown';
  // The rim: ice copies offset toward the blast (upper right), a soft wide one and a crisp 2 px one, then the body.
  const ro = 2 + 0.25 * Math.min(b.k, 8);
  if (printAt(t)) {
    // The negative print: one all-ice body, stamped as a solid navy silhouette.
    PUPPETS.draw(ctx, nm, RIVAL_KIT_B, pose, kk, -1, x, y, upu / kk, 0, SIL_ICE, 1, rot);
    return;
  }
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  PUPPETS.draw(ctx, nm, RIVAL_KIT_B, pose, kk, -1, x + ro * 1.8, y - ro * 1.8, upu / kk, 0, SIL_ICE, 0.18, rot);
  ctx.restore();
  PUPPETS.draw(ctx, nm, RIVAL_KIT_B, pose, kk, -1, x + ro * 0.7, y - ro * 0.7, upu / kk, 0, SIL_ICE, 0.95, rot);
  PUPPETS.draw(ctx, nm, RIVAL_KIT_B, pose, kk, -1, x, y, upu / kk, 0, SIL_FLAT, 1, rot);
  if (b.k <= 3) return;
  // His leading boot's sole with six ice studs flashing past the lens (a body with studs, not a pillar). He tumbles,
  // so the leading boot is whichever foot is in frame nearest the lens centre.
  const c = Math.cos(rot), sn = Math.sin(rot);
  // Puppet units (facing right) -> screen: mirrored (facing -1), turned by rot about the hip.
  const W = (qx: number, qy: number): [number, number] => {
    const lx = -qx * upu, ly = qy * upu;
    return [x + lx * c - ly * sn, y + lx * sn + ly * c];
  };
  let best: { ax: number; ay: number; fdx: number; fdy: number; d: number } | null = null;
  for (const near of [true, false]) {
    const f = footOf(pose, near);
    const m = W(f.ax + f.fdx * 0.4, f.ay + f.fdy * 0.4);
    if (m[0] < -10 || m[0] > VW + 10 || m[1] < -10 || m[1] > VH + 10) continue;
    const d = Math.hypot(m[0] - 320, m[1] - 190);
    if (!best || d < best.d) best = { ...f, d };
  }
  if (!best) return;
  const { ax, ay, fdx, fdy } = best;
  const fl = Math.hypot(fdx, fdy) || 1;
  const ux = fdx / fl, uy = fdy / fl;
  // The sole side of the foot (below it for a foot pointing forward).
  const nx = -uy, ny = ux;
  const at2 = (f: number, off: number) => W(ax + fdx * f + nx * off, ay + fdy * f + ny * off);
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgb(6,11,36)';
  ctx.lineWidth = 3.4 * upu;
  const h0 = at2(-0.35, 2), h1 = at2(1.15, 2);
  ctx.beginPath();
  ctx.moveTo(h0[0], h0[1]);
  ctx.lineTo(h1[0], h1[1]);
  ctx.stroke();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.6;
  ctx.strokeStyle = 'rgb(110,220,255)';
  ctx.lineWidth = Math.max(1, upu * 0.5);
  const e0 = at2(-0.35, 3.8), e1 = at2(1.15, 3.8);
  ctx.beginPath();
  ctx.moveTo(e0[0], e0[1]);
  ctx.lineTo(e1[0], e1[1]);
  ctx.stroke();
  const st = Math.max(2, Math.round(2 * upu));
  for (let i = 0; i < 6; i++) {
    const q = at2(-0.25 + (i / 5) * 1.3, 4.2);
    drawGlow(ctx, glowOf(PAL.cyan), q[0], q[1], st * 1.6, 0.5);
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = ICE;
    ctx.fillRect(Math.round(q[0] - st / 2), Math.round(q[1] - st / 2), st, st);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- 6c render

function renderPov(env: Env, t: number) {
  const { ctx, fx, cam } = env;
  const pv = povAt(t);
  const view = pv.view;
  cam.zoom = 1.05;
  env.world();
  ctx.fillStyle = SNAVY;
  ctx.fillRect(-80, -80, VW + 160, VH + 160);
  drawDownPitch(ctx, env.art.stadium, view, t, { storm: 1, ambientFlashes: false });
  stormDarken(ctx, 0.45);
  env.world();
  // Ahead of the ball the grass bows flat in a V before it arrives (the pressure travels ahead of it).
  bowV(ctx, t, view, pv.bxw, pv.bz);
  turfStreaks(ctx, t, view, pv.bxw, pv.bz);
  // Air step 3: the 400 px crater stamped under the lens, a foreshortened ring under the ball (its cyan glow line and
  // cobalt core ring read as a crater pressed into the turf).
  if (at(t, T.step3)) {
    const c = projectDecal(1120, 231, 0, view);
    const age = t - T.step3;
    const cy0 = VH - 70;
    // The pressed ring under it (the turf shoved down), then the crater at full strength for its first 0.25 s.
    ctx.save();
    ctx.strokeStyle = NAVY;
    ctx.lineWidth = 8;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.ellipse(c.x, cy0, 190, 61, 0, 0, TAU);
    ctx.stroke();
    ctx.restore();
    airCrater(ctx, c.x, cy0, 200, 0.32, age * 2, 3, age < 0.25 ? 1 : clamp(1 - (age - 0.25) / 0.5) * 0.7 + 0.3);
    airCrater(ctx, c.x, cy0, 120, 0.32, age * 2, 2, clamp(1 - age / 0.5) * 0.8);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.cyan), c.x, cy0, 220, 0.3 * clamp(1 - age / 0.4), 1, 0.32);
    ctx.restore();
  }
  // The keeper in the goal mouth: front view, lit cyan by the oncoming ball.
  const kf = projectDecal(1158, 226, 0, view);
  const hpx = 19 * kf.s;
  const pose: KPoseName = t < T.set ? (Math.floor((t - T.pov) / 0.1) % 2 ? 'ready2' : 'ready') : t < T.cock ? 'set' : t < T.punch ? 'cock' : 'punch';
  const squat = t >= T.set && t < T.set + 0.08 ? 1 - 0.05 * Math.sin(((t - T.set) / 0.08) * Math.PI) : 1;
  // Film fix H2: a storm silhouette (fully dark by the time he sets and fills the goal mouth), rimmed by the floodlights
  // behind him and lit faintly from below by the oncoming ball until he cocks his fists; from then only the rim reads.
  const dark = lerp(0.6, 1, u01(t, T.pov, T.set));
  const light = t >= T.cock ? 0 : 0.05 + 0.22 * ease.inQuad(pv.u);
  drawFrontKeeper(ctx, pose, kf.x, kf.y, hpx * squat, light, dark, 0.55 + 0.35 * u01(t, T.pov, T.set));
  // The vortex tunnel: vapour rings peeling off the cone round us, expanding past the frame edges.
  vortexRings(ctx, t, 320 + pv.whip, view.horizon + 30);
  edgeFilaments(ctx, t, pv.bx, pv.by);
  env.parts.draw(ctx, 0);
  // The keeper's double-fist punch at the lens (2.60-2.80): the gloves converge on the ball and fill the frame.
  if (t >= T.punch) drawFists(ctx, t, kf, pv);
  // Mach diamonds ahead, the ball in its bubble.
  machDiamonds(ctx, t, pv.bx, pv.by - 4);
  // The white-hot pressure bubble round the ball (the hottest mass in the frame, pulsing with the Mach diamonds).
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  // (It draws back as the fists close in, so the gloves stay dark round the ball.)
  const hb = (0.92 + 0.08 * Math.sin(t * TAU * 12)) * (1 - 0.5 * u01(t, T.punch, DUR));
  drawGlow(ctx, glowOf(PAL.ice), pv.bx, pv.by, 86, 0.9 * hb);
  drawGlow(ctx, glowOf(PAL.cyan), pv.bx, pv.by, 120, 0.35);
  ctx.restore();
  drawBall(env, spin, pv.bx, pv.by, 7, 4, 0.85, 1, 'cobalt', undefined, { storm: true });
  bubbleRim(ctx, pv.bx, pv.by, 40, t, 0.85);
  env.parts.draw(ctx, 1);
  // Post.
  const [u, w] = cam.toUV(pv.bx, pv.by);
  fx.lens = 0.18;
  fx.lensX = u;
  fx.lensY = w;
  fx.lensR = 0.13;
  const [gu, gv] = cam.toUV(kf.x, kf.y - hpx * 0.5);
  // A light zoom blur centred between the ball and the keeper's chest (both stay sharp); the speed lives in the canvas.
  fx.radial = 0.035 * (t >= T.punch ? 1 - 0.5 * u01(t, T.punch, DUR) : 1);
  fx.radialX = (u + gu) / 2;
  fx.radialY = (w + gv) / 2;
  fx.vignette = 0.66;
  if (pv.whip > 1) {
    fx.streak = 0.08 * (pv.whip / 260);
    fx.streakDX = -1;
    fx.streakDY = 0;
    fx.streakHoleR = 0;
  }
  if (at(t, T.step3) && t < T.step3 + 0.3) {
    const age = t - T.step3;
    pushShock(fx, { x: u, y: Math.min(0.98, w + 0.25), r: 0.08 + age * 2.2, s: 0.035 * (1 - age / 0.3) });
  }
  fx.ca = 0.003 + 0.005 * u01(t, T.punch, DUR);
}

/** The pressed V ahead of the ball: pale combed grass bowing flat before the ball reaches it. */
function bowV(ctx: CanvasRenderingContext2D, t: number, v: DownPitchView, bxw: number, bz: number) {
  ctx.save();
  const apex = bxw + 34;
  const P = (x: number, z: number) => projectDecal(x, z, 0, v);
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = HEX.pressed;
  ctx.beginPath();
  const a = P(apex, bz), l = P(bxw + 2, bz - 7), r = P(bxw + 2, bz + 7);
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(l.x, l.y);
  ctx.lineTo(r.x, r.y);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = 'rgb(214,248,200)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 9; i++) {
    const f = (i / 8) * 2 - 1;
    const p0 = P(apex - 4, bz + f * 0.8), p1 = P(bxw + 3, bz + f * 6.5);
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  }
  ctx.restore();
  void t;
}

/**
 * Turf speed lines: 36 lanes evenly spaced across the pitch, each a streak sliding from the vanishing point toward the
 * lens (projected on the turf, so they fan out radially and quicken as they come close).
 */
function turfStreaks(ctx: CanvasRenderingContext2D, t: number, v: DownPitchView, bxw: number, bz: number) {
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < 36; i++) {
    const z = bz + ((i + 0.5) / 36 - 0.5) * 2 * 26;
    const f = (t * (2.4 + hash(i * 1.9) * 1.2) + hash(i * 7.3)) % 1;
    const far = bxw + 6 + 30 * (1 - f);
    const near = Math.max(bxw + 6, far - (3 + 9 * f));
    const a = projectDecal(far, z, 0, v), b = projectDecal(near, z, 0, v);
    ctx.globalAlpha = 0.25 * Math.sin(Math.PI * f);
    ctx.strokeStyle = i % 4 ? 'rgb(190,236,200)' : 'rgb(170,230,255)';
    ctx.lineWidth = Math.max(1, b.s * 0.08);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

/** 9 elliptical vapour rings peeling off the cone from the vanishing point and expanding past the frame edges. */
function vortexRings(ctx: CanvasRenderingContext2D, t: number, cx: number, cy: number) {
  ctx.save();
  for (let i = 0; i < 9; i++) {
    const f = (t * 2.8 + i / 9) % 1;
    const sc = 0.1 * Math.pow(16, f);
    const rx = VW * 0.5 * sc, ry = VH * 0.46 * sc;
    // Faint while small (far ahead in the tunnel, behind the keeper), strongest as they sweep past the frame edges.
    const al = clamp((f - 0.25) / 0.35) * (1 - f) * 1.9;
    if (al <= 0.01) continue;
    const spinDir = i % 2 ? 1 : -1;
    const ex = cx, ey = cy - 24 * f;
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = al * 0.4;
    ctx.strokeStyle = NAVY;
    ctx.lineWidth = 4 + 16 * f;
    ctx.beginPath();
    ctx.ellipse(ex, ey, rx, ry, 0, 0, TAU);
    ctx.stroke();
    // The ring's soft condensation body (a wide pale band), then a few long puffs strung round it.
    ctx.globalAlpha = al * 0.16;
    ctx.strokeStyle = 'rgb(226,246,255)';
    ctx.lineWidth = 6 + 22 * f;
    ctx.beginPath();
    ctx.ellipse(ex, ey, rx, ry, 0, 0, TAU);
    ctx.stroke();
    for (let j = 0; j < 6; j++) {
      const th = (j / 6) * TAU + t * 1.4 + i * 0.7;
      const sz = (6 + 26 * f) * (0.7 + 0.5 * hash(i * 7 + j * 3));
      ctx.save();
      ctx.translate(ex + Math.cos(th) * rx, ey + Math.sin(th) * ry);
      ctx.rotate(Math.atan2(Math.cos(th) * ry, -Math.sin(th) * rx));
      ctx.globalAlpha = al * 0.4;
      ctx.drawImage(softSprite('vapor', 0.1 + 0.3 * hash(j)), -sz * 2.4, -sz * 0.6, sz * 4.8, sz * 1.2);
      ctx.restore();
    }
    // The ring's bright solid edge: three arcs spinning round the tunnel (alternate rings turn opposite ways), so the
    // wake reads as a turning vortex, never a target of concentric circles. They fray into puffs past the frame edges.
    const ea = al * 0.85 * clamp((0.8 - f) / 0.15);
    if (ea > 0) {
      ctx.globalCompositeOperation = 'lighter';
      for (let q = 0; q < 3; q++) {
        const a0 = (q / 3) * TAU + spinDir * t * 2.6 + i * 1.3;
        ctx.beginPath();
        ctx.ellipse(ex, ey, rx, ry, 0, a0, a0 + 1.1 + 0.4 * hash(i * 3 + q));
        ctx.globalAlpha = clamp(ea);
        ctx.strokeStyle = 'rgb(226,246,255)';
        ctx.lineWidth = 1.5 + 3 * f;
        ctx.stroke();
        // A white-hot core along each spinning arc (the speed reads as light, not blur).
        ctx.globalAlpha = clamp(ea * 1.2);
        ctx.strokeStyle = 'rgb(240,252,255)';
        ctx.lineWidth = 1 + 2 * f;
        ctx.stroke();
      }
    }
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

/** Vapour filaments streaming along the frame edges (radial, outward from the ball). */
function edgeFilaments(ctx: CanvasRenderingContext2D, t: number, cx: number, cy: number) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 64; i++) {
    const th = hash(i * 1.7) * TAU;
    const f = (t * (2.2 + hash(i * 2.9) * 1.6) + hash(i * 5.3)) % 1;
    const d0 = 170 + f * 420, d1 = d0 + 40 + 120 * f;
    ctx.globalAlpha = 0.55 * f;
    ctx.strokeStyle = i % 4 ? ICE : CYAN;
    ctx.lineWidth = 1 + f * 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(th) * d0, cy + Math.sin(th) * d0 * 0.62);
    ctx.lineTo(cx + Math.cos(th) * d1, cy + Math.sin(th) * d1 * 0.62);
    ctx.stroke();
  }
  ctx.restore();
}

/** Nested Mach diamonds pulsing (12 Hz) round the ball, receding ahead of it. */
function machDiamonds(ctx: CanvasRenderingContext2D, t: number, cx: number, cy: number) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const pulse = 0.6 + 0.4 * Math.sin(t * TAU * 12);
  for (let i = 0; i < 3; i++) {
    const s = (64 - i * 16) * (0.85 + 0.15 * pulse);
    ctx.globalAlpha = (0.38 - i * 0.08) * pulse;
    ctx.strokeStyle = i ? CYAN : ICE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - s * 1.5, cy);
    ctx.lineTo(cx, cy - s * 0.55);
    ctx.lineTo(cx + s * 1.5, cy);
    ctx.lineTo(cx, cy + s * 0.55);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
}

/** The double-fist punch at the lens: two gloves thrust from his chest, converging on the ball, filling the frame. */
function drawFists(ctx: CanvasRenderingContext2D, t: number, kf: { x: number; y: number; s: number }, pv: ReturnType<typeof povAt>) {
  const u = u01(t, T.punch, DUR);
  const spr = fistSprite();
  const hpx = 19 * kf.s;
  const chestY = kf.y - hpx * 0.6;
  // The fist's on-screen width: from his chest (~0.11 of his height) to the lens (the depth collapses).
  const fw = hpx * 0.11 * Math.exp(2.6 * u * u);
  const D = fw / FIST_W;
  const e = ease.inQuad(u);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  for (const side of [-1, 1]) {
    const x = lerp(kf.x + side * hpx * 0.07, pv.bx + side * fw * 0.47, e);
    const y = lerp(chestY, pv.by - fw * 0.16, e);
    const w = spr.width * D, h = spr.height * D;
    ctx.globalCompositeOperation = 'source-over';
    drawGlow(ctx, glowOf(PAL.navy), x, y, fw * 0.85, 0.55);
    ctx.save();
    ctx.translate(x, y);
    // His left fist (screen right) mirrored, both tilted in: a two-fisted hammer, not a block.
    ctx.rotate(-side * 0.16);
    ctx.scale(side > 0 ? -1 : 1, 1);
    const rx = Math.round(-w / 2), ry = Math.round(-h / 2), rw = Math.round(w), rh = Math.round(h);
    ctx.drawImage(spr, rx, ry, rw, rh);
    // Heavy, dark fists: navy below the knuckle ridge, a hard cyan rim only on the knuckles.
    if (fistShade) ctx.drawImage(fistShade, rx, ry, rw, rh);
    if (fistNavy) {
      ctx.globalAlpha = 0.88;
      ctx.drawImage(fistNavy, rx, ry, rw, rh);
      ctx.globalAlpha = 1;
    }
    if (fistRim) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.7 + 0.3 * u;
      ctx.drawImage(fistRim, rx, ry, rw, rh);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
  }
  ctx.restore();
}
