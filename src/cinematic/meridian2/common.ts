// MERIDIAN THREAD v2: shared constants and helpers for the nine shots (SPEC.md: Palette, Continuity, Engine
// cheat-sheet). Night Ink: the stadium crushed to ink-black and emerald-black, the only saturated light is jade (the
// arc, the ball, the lamp heads it passes). The v1 helpers that still fit are re-exported from ../meridian/common (the
// shipped v1 stays untouched); the set's shared engine pieces come from ../kit, ../../engine/* and ../../art/*.
//
// What lives here (first versions, pure functions of their arguments unless noted; the shot agents refine them):
//   PAL / HEX / flashes      jade, emerald, mint, pearl on night-ink (+ ink, paper, tone; gold for the HUD only)
//   nightGrade / nightInk    the post settings and the canvas Night Ink grade (saturation, multiply, screentone, restore)
//   halftoneImpact / setPluck   the halftone impact stages A / B and the pluck-warp control (fx.pass = 'meridian')
//   LAYOUT / ARC / BALL_U    one table for the field scenario and every view; the 26 m arc; the ball's u by shot
//   SHOTS / RATE / SEQ*      the fixed shot table, the rate curves, the frame schedules (art plan.json)
//   meridianStroke, auroraHem, loom, skyEye, needleShaft, jadeSpear, threadSag, StitchRings, starChart, readout,
//   needlePupil, needleIris, stringFrame, lampTintFor: the four giant shapes and their supports
//   tower / drawTower        the Tower's studio frames (Rivals strips) with the 1.3x puppet fallbacks
//   placeholderShot          the labelled stand-in each shot file uses until it is produced
// Never the banned word anywhere: loft, pass, header, arc, line, push-off.

import type { Env, Shot } from '../timeline';
import type { Camera } from '../../engine/camera';
import { VW, VH } from '../../engine/camera';
import type { FxState } from '../../engine/post';
import { warmPost } from '../../engine/post';
import { TAU, clamp, ease, lerp, mixRGB, type RGB } from '../../engine/math';
import { PK, drawGlow, glowOf, type RampName } from '../../engine/particles';
import { TITLE_FONT, inkScratch, inkTone, pixelText, ribbon, sparkle, type InkRestore, type TrailPt } from '../../art/fx';
import { drawAnim, findFrame, hasAnim, anim, type AnimDraw, type StudioAnim } from '../../art/studioAnim';
import { POSES, P, RIVAL_KIT, joints, type Pose } from '../../art/puppet';
import { projectDecal, type DownPitchView, type Projected } from '../../art/stadium';
import { PuppetCache, nameCard, sparks, warp } from '../kit';
import type { No10Key } from '../../art/no10';
import type { No7Key } from '../../art/no7';
import { stitchTitle, pluckLine, threadLine, type Pluck } from '../meridian/common';

export {
  threadLine, crossStitch, needlePoint, needleEye, stitchTitle, sliceThread, pluckLine, TITLE_STYLE, JADE_FLARE, FADE_RGB,
  type Pluck, type ThreadOpts, type StitchTitleOpts,
} from '../meridian/common';

/** The special's on-screen name (the registry entry reads 'MERIDIAN THREAD v2' while it is in production). */
export const SHOT_NAME = 'MERIDIAN THREAD';

// ---------------------------------------------------------------- palette (SPEC "Palette, light and the four giant shapes")

export const PAL = {
  jade: [47, 224, 138] as RGB,
  emerald: [11, 143, 88] as RGB,
  mint: [191, 255, 224] as RGB,
  pearl: [251, 246, 234] as RGB,
  night: [6, 20, 15] as RGB,
  ink: [13, 13, 20] as RGB,
  paper: [239, 231, 214] as RGB,
  tone: [119, 113, 107] as RGB,
  gold: [252, 185, 76] as RGB,
};
export const HEX = {
  jade: '#2FE08A', emerald: '#0B8F58', mint: '#BFFFE0', pearl: '#FBF6EA', night: '#06140F', ink: '#0D0D14',
  paper: '#EFE7D6', tone: '#77716B', gold: '#FCB94C',
} as const;
/** fx.flash colour in Night Ink: pearl (paper reads yellow on black). Never pure white. */
export const PEARL_FLASH: RGB = [251, 246, 234];
/** The shot 4 -> 5 whiteout, grown out of the ball's jade core. */
export const MINT_FLASH: RGB = [191, 255, 224];
/** The tint a lamp head catches from the arc (stadium.ts LAMP_JADE). */
export const LAMP_JADE: RGB = [200, 255, 225];
const css = (c: readonly number[], a = 1) => (a >= 1 ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})` : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`);

// ---------------------------------------------------------------- post grade

export interface NightGradeOpts {
  bloom?: number;
  thresh?: number;
  vignette?: number;
  ca?: number;
}

/**
 * The shared post settings of every MERIDIAN v2 shot (contrast 1.12, sat 1, tint [235,255,245], vignette 0.6, grain
 * 0.05) plus the per-shot bloom / threshold (SPEC post table); selects MERIDIAN's program family (fx.pass).
 */
export function nightGrade(fx: FxState, o: NightGradeOpts = {}) {
  fx.pass = 'meridian';
  fx.contrast = 1.12;
  fx.sat = 1;
  fx.tint = [235, 255, 245];
  fx.vignette = o.vignette ?? 0.6;
  fx.grain = 0.05;
  fx.bloom = o.bloom ?? 1.0;
  fx.bloomThresh = o.thresh ?? 0.64;
  if (o.ca !== undefined) fx.ca = o.ca;
}

/** A pearl (default) or mint flash at `a` (the brief's flashes; FlashBudget counts a >= 0.3). */
export function meridianFlash(fx: FxState, a: number, color: RGB = PEARL_FLASH) {
  if (a <= 0) return;
  if (a >= fx.flash) {
    fx.flash = clamp(a);
    fx.flashColor = color;
  }
}

/**
 * Dev check (the brief): MERIDIAN never sets the pressure lens, the isobar impact, SOLO's impact mask or the beat echo,
 * so FINAL_MERIDIAN needs no combined variants. Called by placeholderShot after every render.
 */
export function assertMeridianFx(fx: FxState) {
  if (!import.meta.env.DEV) return;
  console.assert(fx.lens === 0 && fx.iso === 0 && fx.echo === 0 && !(fx as unknown as { impMask?: number }).impMask, 'MERIDIAN v2 set lens / iso / echo / impMask');
}

/** Every MERIDIAN v2 prepare(): compile FINAL_MERIDIAN (pluck + tone + streak) and allocate the ink buffers up front. */
export function warmMeridian(env: Env) {
  warmPost('meridian');
  prepareNightInk(env.ctx);
}

// ---------------------------------------------------------------- Night Ink (canvas)

/** An ellipse pool restored in colour (the ball's pool, the X's pool): centre, radii, soft edge (default 0.45 of r). */
export interface NightPool {
  pool: { x: number; y: number; rx: number; ry: number; soft?: number };
}
/** Draw the keep-colour mask yourself (black, any alpha) on the mask canvas, in the current transform. */
export type NightMaskFn = (m: CanvasRenderingContext2D) => void;
/** What colour nightInk gives back: a band along a polyline (InkRestore: pts, w 90, soft 60), a pool, or a mask. */
export type NightRestore = InkRestore | NightPool | NightMaskFn;

/** Allocate the Night Ink buffers (inkGrade's shared scratch / mask and the tone pattern). Call from prepare(). */
export function prepareNightInk(ctx: CanvasRenderingContext2D) {
  const b = inkScratch(ctx.canvas.width, ctx.canvas.height);
  inkTone(ctx);
  inkTone(b.sctx);
}

function gradeNight(c: CanvasRenderingContext2D, a: number) {
  const W = c.canvas.width, H = c.canvas.height, S = W / VW;
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalAlpha = 0.85 * a;
  c.globalCompositeOperation = 'saturation';
  c.fillStyle = 'rgb(128,128,128)';
  c.fillRect(0, 0, W, H);
  c.globalAlpha = a;
  c.globalCompositeOperation = 'multiply';
  c.fillStyle = 'rgb(70,92,84)';
  c.fillRect(0, 0, W, H);
  c.globalAlpha = 0.35 * a;
  c.setTransform(S, 0, 0, S, 0, 0);
  c.imageSmoothingEnabled = false;
  c.fillStyle = inkTone(c);
  c.fillRect(0, 0, VW, VH);
  c.restore();
}

/**
 * The Night Ink grade (MERIDIAN v2's world): drains everything drawn so far at `amount` 0..1 (skipped at 0):
 *   1. a 'saturation' fill toward mid-grey at 0.85 x amount;
 *   2. a 'multiply' of [70,92,84] at amount (the environment drops to about 25 % luminance, cold green-black);
 *   3. a 'multiply' of the cached screentone at 0.35 x amount (the shadows print as manga dots);
 *   4. restore (optional): a masked copy of the ungraded frame drawn back (a band along the stroke, an ellipse pool, or
 *      any mask the shot draws): colour comes back where jade light falls.
 * Layer order in every inked shot: sky, stands, pitch, rivals, keeper -> nightInk -> stroke and hem, ball, No.10, No.7,
 * the Tower's studio frames, particles, panels, text. Call it once per frame. Respects the current clip.
 */
export function nightInk(ctx: CanvasRenderingContext2D, amount: number, restore?: NightRestore) {
  const a = clamp(amount);
  if (a <= 0) return;
  if (!restore) {
    gradeNight(ctx, a);
    return;
  }
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const m = ctx.getTransform();
  const b = inkScratch(W, H);
  const s = b.sctx;
  s.save();
  s.setTransform(1, 0, 0, 1, 0, 0);
  s.globalAlpha = 1;
  s.globalCompositeOperation = 'copy';
  s.drawImage(ctx.canvas, 0, 0);
  s.restore();
  gradeNight(s, a);
  const mc = b.mctx;
  mc.save();
  mc.setTransform(1, 0, 0, 1, 0, 0);
  mc.globalCompositeOperation = 'source-over';
  mc.globalAlpha = 1;
  mc.clearRect(0, 0, W, H);
  mc.setTransform(m);
  mc.fillStyle = '#000';
  mc.strokeStyle = '#000';
  if (typeof restore === 'function') restore(mc);
  else if ('pool' in restore) {
    const p = restore.pool;
    const soft = clamp(p.soft ?? 0.45, 0.01, 1);
    mc.translate(p.x, p.y);
    mc.scale(Math.max(1e-3, p.rx), Math.max(1e-3, p.ry));
    const g = mc.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(1 - soft, 'rgba(0,0,0,1)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    mc.fillStyle = g;
    mc.beginPath();
    mc.arc(0, 0, 1, 0, TAU);
    mc.fill();
  } else if (restore.pts.length >= 2 && restore.w > 0) {
    mc.lineCap = 'round';
    mc.lineJoin = 'round';
    const soft = restore.soft ?? 60;
    const path = () => {
      mc.beginPath();
      mc.moveTo(restore.pts[0].x, restore.pts[0].y);
      for (let i = 1; i < restore.pts.length; i++) mc.lineTo(restore.pts[i].x, restore.pts[i].y);
    };
    for (const [w, al] of [[restore.w + soft * 2, 0.3], [restore.w + soft, 0.6], [restore.w, 1]] as const) {
      mc.globalAlpha = al;
      mc.lineWidth = w;
      path();
      mc.stroke();
    }
  }
  mc.restore();
  s.save();
  s.setTransform(1, 0, 0, 1, 0, 0);
  s.globalCompositeOperation = 'destination-out';
  s.drawImage(b.mask, 0, 0);
  s.restore();
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(b.scratch, 0, 0);
  ctx.restore();
}

// ---------------------------------------------------------------- impact frames and the pluck warp

/** The halftone impact's two stage colour sets (SPEC "The halftone impact frame"). */
export const MERIDIAN_IMPACT = {
  /** Stage A, "jade print": night / mint, halftone dots (3 px cells at 45 deg) inside the threshold band only. */
  A: { a: PAL.night, b: PAL.mint, thresh: 0.45, tone: 3, ang: 0.785, band: 0.16 },
  /** Stage B, "pearl negative": pearl / emerald, a plain two-tone (no dots, so never A's dots inverted in place). */
  B: { a: PAL.pearl, b: PAL.emerald, thresh: 0.45, tone: 0, ang: 0.785, band: 0.16 },
} as const;

/**
 * Set this frame's impact to MERIDIAN's halftone stage `stage` at strength `a` (0..1). Stage A sets fx.tone (narrow
 * `band` per site if the dev probe measures more than 25 % of the frame in the band: 0.16 -> 0.10 -> 0.06); stage B
 * leaves tone at 0. FlashBudget counts each stage's rising edge (impA / impB change = a new event).
 */
export function halftoneImpact(fx: FxState, stage: 'A' | 'B', a = 1, o: { band?: number; thresh?: number } = {}) {
  const s = MERIDIAN_IMPACT[stage];
  fx.pass = 'meridian';
  fx.impact = clamp(a);
  fx.impA = [...s.a] as RGB;
  fx.impB = [...s.b] as RGB;
  fx.impThresh = o.thresh ?? s.thresh;
  fx.tone = s.tone;
  fx.toneAng = s.ang;
  fx.toneBand = o.band ?? s.band;
}

export interface PluckOpts {
  /** Peak amplitude in screen-height units (0.010 ≈ 4 px). Signed. */
  amp: number;
  /** Seconds since the pluck (negative = not yet: no warp). */
  tSince: number;
  hz?: number;
  /** Antinodes 1-3 (default 1). */
  n?: number;
  /** Falloff width in screen heights (0.8 = the whole frame; default 0.05). */
  w?: number;
  /** e-folding decay (s, default 0.4; the brief caps it at 0.6). */
  decay?: number;
  /** Faint jade line glow (default 0). */
  glow?: number;
}

/** The control point that makes a quadratic Bezier from p0 to p2 pass through pm at u = 0.5. */
export function ctrlThrough(p0: readonly [number, number], pm: readonly [number, number], p2: readonly [number, number]): [number, number] {
  return [2 * pm[0] - (p0[0] + p2[0]) / 2, 2 * pm[1] - (p0[1] + p2[1]) / 2];
}

/**
 * Run the pluck warp: three points (world points projected with cam.toUV, or screen px when cam is null) as the
 * Bezier P0, P1 (control), P2; amplitude = amp·cos(2π·hz·tSince)·exp(-tSince/decay). Frequency stays <= 9 Hz and the
 * decay <= 0.6 s (photosensitivity: a displacement, never a brightness change). Selects fx.pass 'meridian'.
 */
export function setPluck(fx: FxState, cam: Camera | null, pts3: readonly (readonly [number, number])[], o: PluckOpts) {
  if (o.tSince < 0 || pts3.length < 3) return;
  const hz = Math.min(9, o.hz ?? 9), decay = Math.min(0.6, o.decay ?? 0.4);
  const k = Math.cos(TAU * hz * o.tSince) * Math.exp(-o.tSince / Math.max(1e-3, decay));
  const uv = (p: readonly [number, number]): [number, number] => (cam ? cam.toUV(p[0], p[1]) : [p[0] / VW, p[1] / VH]);
  fx.pass = 'meridian';
  fx.pluck = o.amp * k;
  fx.pluckP0 = uv(pts3[0]);
  fx.pluckP1 = uv(pts3[1]);
  fx.pluckP2 = uv(pts3[2]);
  fx.pluckN = Math.max(1, Math.min(3, Math.round(o.n ?? 1)));
  fx.pluckW = o.w ?? 0.05;
  fx.pluckGlow = (o.glow ?? 0) * Math.exp(-o.tSince / Math.max(1e-3, decay));
}

/** A whip (shared fx.streak) with the ball kept sharp in a hole of radius R (screen heights) at screen (hx, hy) px. */
export function whip(fx: FxState, amount: number, dx: number, dy: number, hole?: { x: number; y: number; r: number }) {
  if (amount <= 0) return;
  fx.pass = 'meridian';
  fx.streak = amount;
  fx.streakDX = dx;
  fx.streakDY = dy;
  if (hole) {
    fx.streakHoleX = hole.x / VW;
    fx.streakHoleY = hole.y / VH;
    fx.streakHoleR = hole.r;
  }
}

// ---------------------------------------------------------------- layout v2 (field x, z, h; 10 px = 1 m)

export interface XZH {
  x: number;
  z: number;
  h: number;
}
const p3 = (x: number, z: number, h = 0): XZH => ({ x, z, h });

/** One table feeds the field scenario, every projection and every composed shot (SPEC "Layout v2"). */
export const LAYOUT = {
  no10Start: p3(700, 268),
  /** The loft, 41 m from goal, centre-right. */
  strike: p3(772, 268),
  /** D1, the far centre-back, stepped up to press (from d1Home at field t 0.8 s). */
  d1Home: p3(1016, 222),
  d1: p3(1004, 222),
  /** The Tower: the set's one big captain (Rivals model, armband, 1.3x bulk; SOLO v2's defender D). */
  tower: p3(1030, 250),
  d3: p3(1040, 282),
  /** D4, the near full-back: the offside line. */
  d4: p3(1052, 314),
  keeper: p3(1168, 258),
  /** The keeper comes off his line toward the near post as the ball falls. */
  keeperOut: p3(1146, 280),
  no7Start: p3(940, 344),
  /** No.7 at the strike: onside (behind D4's x). */
  no7Strike: p3(994, 336),
  /** 26 m, 3 m beyond the Tower, just under the lamp heads (towers 32 m). */
  apex: p3(1060, 276, 260),
  /** The cross-stitch X; the ball meets No.7's forehead at 0.9 m, 5.8 m out. */
  target: p3(1122, 296, 9),
  /** The far top corner, inside the far post. */
  finish: p3(1180, 218, 21),
  /** Where the Tower lies face-down in the result view. */
  towerDown: p3(1050, 236),
} as const;

/** Field metres (10 field px = 1 m). */
export const M = 10;

const qb = (a: number, b: number, c: number, t: number) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;
const qbd = (a: number, b: number, c: number, t: number) => 2 * (1 - t) * (b - a) + 2 * t * (c - b);
/** z(u) knots (u, z): sets off toward the far side, bends right onto No.7's run. */
const ZK: readonly [number, number][] = [[0, 268], [0.25, 262], [0.55, 270], [0.72, 276], [1, 296]];
function zAt(u: number) {
  const k = ZK;
  if (u <= 0) return k[0][1];
  if (u >= 1) return k[k.length - 1][1];
  let i = 0;
  while (i < k.length - 2 && u > k[i + 1][0]) i++;
  const [u0, z0] = k[i], [u1, z1] = k[i + 1];
  const tan = (j: number) => {
    const a = k[Math.max(0, j - 1)], b = k[Math.min(k.length - 1, j + 1)];
    return (b[1] - a[1]) / Math.max(1e-6, b[0] - a[0]);
  };
  const h = u1 - u0, s = (u - u0) / h;
  const m0 = tan(i) * h, m1 = tan(i + 1) * h;
  const s2 = s * s, s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * z0 + (s3 - 2 * s2 + s) * m0 + (-2 * s3 + 3 * s2) * z1 + (s3 - s2) * m1;
}

/**
 * The arc (SPEC "The arc"; the single source for every view). Rising limb u 0 -> 0.72: quadratic Bezier in (x, h)
 * (772, 0) (910, 260) (1060, 260), leaving the boot at 62 deg and flattening into the apex; falling limb u 0.72 -> 1:
 * (1060, 260) (1105, 260) (1122, 9), the slingshot fall (85 deg at the bottom). u maps linearly onto each limb's Bezier
 * parameter (this reproduces the brief's checkpoints: D1 under the ball at u 0.59, the Tower at 0.655 with the thread
 * at h 258, D3 at 0.68, D4 at 0.713). z(u) is a Catmull-Rom through (0, 268) (0.25, 262) (0.55, 270) (0.72, 276) (1, 296).
 */
export const U_APEX = 0.72;
export const RIDE = { sx: 3, sy: 4, x0: 772 } as const;
export function arcAt(u: number): XZH {
  const uu = clamp(u);
  if (uu <= U_APEX) {
    const t = uu / U_APEX;
    return { x: qb(772, 910, 1060, t), z: zAt(uu), h: qb(0, 260, 260, t) };
  }
  const t = (uu - U_APEX) / (1 - U_APEX);
  return { x: qb(1060, 1105, 1122, t), z: zAt(uu), h: qb(260, 260, 9, t) };
}
/** d(x, h)/du of the arc (field px per unit u): the ball's flight direction. */
export function arcDir(u: number): { dx: number; dh: number } {
  const uu = clamp(u);
  if (uu <= U_APEX) {
    const t = uu / U_APEX;
    return { dx: qbd(772, 910, 1060, t) / U_APEX, dh: qbd(0, 260, 260, t) / U_APEX };
  }
  const t = (uu - U_APEX) / (1 - U_APEX);
  return { dx: qbd(1060, 1105, 1122, t) / (1 - U_APEX), dh: qbd(260, 260, 9, t) / (1 - U_APEX) };
}
/** The ride world (shots 4, 6b): X = (x - 772)·3, Y = -h·4 (30 px per m across, 40 px per m up). */
export function rideXY(x: number, h: number): [number, number] {
  return [(x - RIDE.x0) * RIDE.sx, -h * RIDE.sy];
}
/** Points of the arc u0 -> u1 (n + 1) in side elevation, mapped by `map` (default the ride world). */
export function arcSide(u0: number, u1: number, n = 32, map: (x: number, h: number) => [number, number] = rideXY): TrailPt[] {
  const out: TrailPt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = arcAt(lerp(u0, u1, i / n));
    const [x, y] = map(a.x, a.h);
    out.push({ x, y });
  }
  return out;
}
/** Points of the arc u0 -> u1 projected into a DownPitchView (screen px, with their Projected scale). */
export function arcProjected(view: DownPitchView, u0: number, u1: number, n = 32): (TrailPt & { s: number; h: number })[] {
  const out: (TrailPt & { s: number; h: number })[] = [];
  for (let i = 0; i <= n; i++) {
    const a = arcAt(lerp(u0, u1, i / n));
    const p: Projected = projectDecal(a.x, a.z, a.h, view);
    out.push({ x: p.x, y: p.y, s: p.s, h: a.h });
  }
  return out;
}
/** The header line (the bowstring): target -> finish, straight; s 0..1. */
export function headerLineAt(s: number): XZH {
  const a = LAYOUT.target, b = LAYOUT.finish, k = clamp(s);
  return { x: lerp(a.x, b.x, k), z: lerp(a.z, b.z, k), h: lerp(a.h, b.h, k) };
}

// ---------------------------------------------------------------- the ball's u by shot (SPEC "Ball u by shot")

type UKey = readonly [number, number];
/** Monotone cubic (Fritsch-Carlson) through (t, u) keys: smooth, never overshoots, never runs backwards. */
function monotone(keys: readonly UKey[], t: number): number {
  const n = keys.length;
  if (t <= keys[0][0]) return keys[0][1];
  if (t >= keys[n - 1][0]) return keys[n - 1][1];
  let i = 0;
  while (i < n - 2 && t > keys[i + 1][0]) i++;
  const d = (j: number) => (keys[j + 1][1] - keys[j][1]) / (keys[j + 1][0] - keys[j][0]);
  const m = (j: number) => {
    if (j === 0) return d(0);
    if (j === n - 1) return d(n - 2);
    const a = d(j - 1), b = d(j);
    return a * b <= 0 ? 0 : (2 * a * b) / (a + b);
  };
  const [t0, u0] = keys[i], [t1, u1] = keys[i + 1];
  const h = t1 - t0, s = (t - t0) / h;
  const s2 = s * s, s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * u0 + (s3 - 2 * s2 + s) * h * m(i) + (-2 * s3 + 3 * s2) * u1 + (s3 - s2) * h * m(i + 1);
}

/** The per-shot u keys (shot-local unwarped t: u), slow motion baked into the spacing (seek is exact). */
export const BALL_U = {
  3: [[0.66, 0], [0.78, 0.05]] as const,
  4: [[0, 0.05], [0.4, 0.12], [1.0, 0.3], [1.7, 0.56], [1.78, 0.59], [1.94, 0.655], [2.02, 0.68], [2.14, 0.713], [2.4, 0.72]] as const,
  5: [[0, 0.72], [1.4, 0.721]] as const,
} as const;

/**
 * The ball's arc u at shot-local t for shots 3-8 (SPEC table). Shot 6 is the tug-of-war, never a stop: 0.721 -> 0.728
 * at 0.70 -> 0.734 at 0.86 (v0 ≈ 0.0375/s), the speed easing 100 % -> 30 % over 0.86-0.98 (outQuad) and holding 30 % to
 * 1.20 (0.739), 1.20 -> 1.34 back up to 0.744, then the slingshot (accelerating, starting at that speed) to 0.79 at 2.00.
 * Shot 7: 0.79 -> 0.995 (inQuad). Shot 8: 0.995 -> 1 at 0.36 (then the spear's own s; see spearS).
 */
export function ballU(shot: 3 | 4 | 5 | 6 | 7 | 8, t: number): number {
  switch (shot) {
    case 3:
      return t < 0.66 ? 0 : lerp(0, 0.05, clamp((t - 0.66) / 0.12));
    case 4:
      return monotone(BALL_U[4], t);
    case 5:
      return lerp(0.72, 0.721, clamp(t / 1.4));
    case 6: {
      if (t <= 0.7) return lerp(0.721, 0.728, t / 0.7);
      if (t <= 0.86) return lerp(0.728, 0.734, (t - 0.7) / 0.16);
      // Speed v(t) = v0 · f(t): f eases 1 -> 0.3 over 0.86-0.98 (outQuad), holds 0.3 to 1.20; scaled to land on 0.739.
      const f = (x: number) => (x < 0.98 ? 1 - 0.7 * ease.outQuad(clamp((x - 0.86) / 0.12)) : 0.3);
      if (t <= 1.2) {
        const N = 24, upto = Math.min(t, 1.2);
        let acc = 0, tot = 0;
        for (let i = 0; i < N; i++) {
          const x0 = 0.86 + ((i + 0.5) / N) * 0.34;
          const w = f(x0) * (0.34 / N);
          tot += w;
          if (x0 < upto) acc += w * clamp((upto - (x0 - 0.17 / N)) / (0.34 / N));
        }
        return 0.734 + 0.005 * (acc / tot);
      }
      if (t <= 1.34) return lerp(0.739, 0.744, (t - 1.2) / 0.14);
      const s = t - 1.34, v = 0.005 / 0.14, a = (0.046 - v * 0.66) / (0.66 * 0.66);
      return Math.min(0.79, 0.744 + v * s + a * s * s);
    }
    case 7:
      return lerp(0.79, 0.995, ease.inQuad(clamp(t / 1.2)));
    case 8:
      return lerp(0.995, 1, clamp(t / 0.36));
  }
}
/** Shot 8: the bead's position along the bowstring (0 at the forehead -> 1 at the far top corner) over 0.58-1.70. */
export function spearS(t: number): number {
  return clamp((t - 0.58) / 1.12);
}

// ---------------------------------------------------------------- timing (SPEC "Shots"; durations are fixed)

export const SHOTS = [
  { n: 1, file: 'shot1_sign.ts', name: 'Meridian Sign', dur: 1.4, seed: 411 },
  { n: 2, file: 'shot2_loom.ts', name: 'The Loom', dur: 1.8, seed: 412 },
  { n: 3, file: 'shot3_loft.ts', name: 'Outside Loft', dur: 1.9, seed: 413 },
  { n: 4, file: 'shot4_ride.ts', name: 'Meridian Ride', dur: 2.4, seed: 414 },
  { n: 5, file: 'shot5_apex.ts', name: 'Apex', dur: 1.4, seed: 415 },
  { n: 6, file: 'shot6_twang.ts', name: 'Sky Eye', dur: 2.0, seed: 416 },
  { n: 7, file: 'shot7_fall.ts', name: 'Needle Fall', dur: 1.2, seed: 417 },
  { n: 8, file: 'shot8_header.ts', name: 'Flying Header', dur: 1.7, seed: 418 },
  { n: 9, file: 'shot9_harp.ts', name: 'Harp Net', dur: 3.0, seed: 419 },
] as const;
export type ShotNo = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
/** Global start time of each shot (index 1..9; [10] = the total 16.8 s). */
export const SHOT_T0 = [0, 0, 1.4, 3.2, 5.1, 7.5, 8.9, 10.9, 12.1, 13.8, 16.8];

/** The warp windows of each shot (SPEC "Rate"), [start, length, rate] on the unwarped shot clock. */
export const WARP: Record<ShotNo, [number, number, number][]> = {
  1: [],
  2: [[0.92, 0.5, 0.45]],
  3: [[0.24, 0.2, 0.3], [0.5, 0.16, 0.03], [0.66, 0.14, 0.3], [1.45, 0.45, 0.6]],
  4: [[1.7, 0.05, 0.7], [1.75, 0.47, 0.45], [2.22, 0.18, 0.7]],
  5: [[0.02, 0.1, 0.3], [0.12, 1.1, 0.06], [1.22, 0.18, 0.3]],
  6: [[0, 0.7, 0.35], [0.7, 0.16, 0.6], [0.86, 0.34, 0.5], [1.2, 0.14, 0.04]],
  7: [[1.06, 0.14, 0.6]],
  8: [[0.26, 0.1, 0.3], [0.36, 0.22, 0.03], [0.58, 0.12, 0.3], [1.0, 0.22, 0.35], [1.22, 0.08, 0.06], [1.3, 0.4, 0.35]],
  9: [[0.04, 0.1, 0.06]],
};
/** The simulation rate curves (kit.warp over WARP[n]). */
export const RATE: Record<ShotNo, (t: number) => number> = {
  1: () => 1,
  2: (t) => warp(t, WARP[2]),
  3: (t) => warp(t, WARP[3]),
  4: (t) => warp(t, WARP[4]),
  5: (t) => warp(t, WARP[5]),
  6: (t) => warp(t, WARP[6]),
  7: (t) => warp(t, WARP[7]),
  8: (t) => warp(t, WARP[8]),
  9: (t) => warp(t, WARP[9]),
};

// ---------------------------------------------------------------- frame schedules (art plan.json / strip notes)

export type Seq<K extends string> = readonly (readonly [number, K])[];
/** The key showing at shot-local t. */
export function seqAt<K extends string>(seq: Seq<K>, t: number): K {
  let k = seq[0][1];
  for (const [at, key] of seq) if (t >= at - 1e-6) k = key;
  return k;
}
/**
 * No.10's schedules (shot-local t -> library key). Shot 1: the brief's "MS4b 1.05" returns to MS4 by 1.15 (the
 * needle's-eye iris anchors on MS4's OPEN eye (75,25)). Shot 2: 2a busts, then 2b's Scan frames. Shot 3: the LF4b ->
 * T8a seam is head-locked in the shot (the crash target eases LF4b.head -> T8a.head over 1.50-1.58, outCubic). Shot 9:
 * the answering sign (Run until 1.34, Point P1 the turn-in bridge), then the diptych P3a / P3b.
 */
export const SEQ10: Partial<Record<ShotNo, Seq<No10Key>>> = {
  1: [[0, 'MS1'], [0.3, 'MS2'], [0.4, 'MS3'], [0.57, 'MS3b'], [0.74, 'MS4'], [1.05, 'MS4b'], [1.15, 'MS4']],
  2: [[0, 'GZ3'], [0.3, 'GZ2'], [0.42, 'GZ2b'], [0.57, 'GZ2'], [0.72, 'GZ2b'], [0.8, 'GZ3'], [0.9, 'S1'], [0.98, 'S2a'], [1.1, 'S2b'], [1.3, 'S2a'], [1.62, 'S3']],
  3: [[0, 'AP1'], [0.1, 'AP3'], [0.22, 'LF1'], [0.46, 'LF1s'], [0.5, 'LF2'], [0.66, 'LF3'], [0.72, 'LF4'], [0.92, 'LF4b'], [1.12, 'LF4'], [1.32, 'LF4b'], [1.58, 'T8a'], [1.62, 'T8b']],
  6: [[0.98, 'PL1'], [1.12, 'PL2']],
  9: [[1.1, 'R1'], [1.34, 'P1'], [1.4, 'MS1'], [1.52, 'MS3'], [1.59, 'MS3b'], [1.66, 'MS4'], [1.98, 'MS4b'], [2.1, 'MS4'], [2.3, 'P3a'], [2.62, 'P3b']],
};
/**
 * No.7's schedules. Shot 8's H1b -> H2 hand-off (0.10) is head-locked by the shot: H2's pelvis = H1b's forehead (world)
 * - (47,-9) x scale, eased back onto the planned arc over 0.10-0.18 (outCubic) so H3 still meets the ball at 0.36.
 */
export const SEQ7: Partial<Record<ShotNo, Seq<No7Key>>> = {
  7: [[0, 'Run.R1'], [0.8, 'Header.H1'], [0.95, 'Header.H1b']],
  8: [[0, 'Header.H1b'], [0.1, 'Header.H2'], [0.36, 'Header.H3'], [0.4, 'Header.H3b'], [0.58, 'Header.H3'], [0.62, 'Header.H4'], [0.8, 'Header.H5']],
  9: [[1.1, 'Point.Q1'], [1.55, 'Point.Q2']],
};
/** The Tower's schedule in shot 6 (TC1 / TC1b alternate every 0.25 s in 6a; TJ2 / TJ2b every 0.08 s in the tug-of-war). */
export const SEQ_TOWER: Seq<TowerKey> = [
  [0, 'TC1'], [0.25, 'TC1b'], [0.5, 'TC1'], [0.7, 'TJ1'], [0.86, 'TJ2'], [0.94, 'TJ2b'], [1.02, 'TJ2'], [1.1, 'TJ2b'], [1.18, 'TJ2'], [1.2, 'TJ3'],
];

// ---------------------------------------------------------------- the Tower (Rivals strips; puppet fallbacks at 1.3x)

/** The Tower's frames: model sheet (TS / TF / TB), crane TC1 / TC1b, face bust TF3, leap TJ1, TJ2 / TJ2b, TJ3. */
export type TowerKey = 'TS' | 'TF' | 'TB' | 'TC1' | 'TC1b' | 'TF3' | 'TJ1' | 'TJ2' | 'TJ2b' | 'TJ3';
/** The Tower's bulk over the other defenders (puppet fallbacks and the field actor). */
export const TOWER_BULK = 1.3;
const TOWER_REF: Record<TowerKey, [string, string[]]> = {
  TS: ['TowerIdle', ['Side', 'TowerIdle_S']],
  TF: ['TowerIdle', ['Front', 'TowerIdle_F']],
  TB: ['TowerIdle', ['Back', 'TowerIdle_B']],
  TC1: ['TowerCrane', ['TC1']],
  TC1b: ['TowerCrane', ['TC1b', 'TC1']],
  TF3: ['TowerFace', ['TF3']],
  TJ1: ['TowerLeap', ['TJ1']],
  TJ2: ['TowerLeap', ['TJ2']],
  TJ2b: ['TowerLeap', ['TJ2b', 'TJ2']],
  TJ3: ['TowerLeap', ['TJ3']],
};
const DEG = Math.PI / 180;
/** The Tower's puppet stand-ins (the brief: leap, a hang = leap with one arm lowered, tuck; craneUp for TC1). */
export const TOWER_POSES: Record<TowerKey, Pose> = {
  TS: POSES.stand,
  TF: POSES.stand,
  TB: POSES.stand,
  TC1: POSES.craneUp,
  TC1b: POSES.craneUp,
  TF3: P({ ...POSES.stand, head: -20 * DEG }),
  TJ1: POSES.leap,
  TJ2: P({ ...POSES.leap, armF: 70 * DEG, elbowF: 40 * DEG, thighN: 60 * DEG, kneeN: 90 * DEG }),
  TJ2b: P({ ...POSES.leap, armF: 66 * DEG, elbowF: 44 * DEG, thighN: 56 * DEG, kneeN: 94 * DEG }),
  TJ3: POSES.tuck,
};
/** The Tower's studio frame for `key`, or null while the strip is not exported. */
export function tower(key: TowerKey): { a: StudioAnim; i: number } | null {
  const [name, frames] = TOWER_REF[key];
  if (!hasAnim(name)) return null;
  const a = anim(name);
  const i = findFrame(a, ...frames);
  return i >= 0 ? { a, i } : null;
}
/** One shared puppet cache for MERIDIAN v2's rivals and keeper (at most 3 live puppet renders per frame). */
export const PUPPETS = new PuppetCache();
/**
 * Draw the Tower's frame `key` (studio frame; anchor o.anchor / pivot as drawAnim) at `scale`, or his 1.3x RIVAL_KIT
 * puppet stand-in (hip on (x, y), with a code armband) while the strip is missing. Returns 'studio' | 'puppet'.
 */
export function drawTower(env: Env, key: TowerKey, x: number, y: number, scale: number, o: AnimDraw = {}): 'studio' | 'puppet' {
  const f = tower(key);
  if (f) {
    drawAnim(env.ctx, f.a, null, f.i, x, y, scale, o);
    return 'studio';
  }
  drawTowerPuppet(env.ctx, `tower-${key}`, TOWER_POSES[key], x, y, scale, o.flip ? -1 : 1, o.rot ?? 0, o.alpha ?? 1);
  return 'puppet';
}
/**
 * The Tower as a puppet: RIVAL_KIT at 1.3x bulk (wider, 6 % taller) with a 2 px ink-teal captain's armband on the far
 * upper arm. (x, y) = hip; D = world px per puppet px at k 1 (studio scale 1 ≈ D 1).
 */
export function drawTowerPuppet(ctx: CanvasRenderingContext2D, name: string, pose: Pose, x: number, y: number, D: number, facing: 1 | -1 = -1, rot = 0, alpha = 1, k = 1) {
  ctx.save();
  ctx.translate(x, y);
  if (rot) ctx.rotate(rot);
  ctx.scale(TOWER_BULK, 1.06);
  PUPPETS.draw(ctx, name, RIVAL_KIT, pose, k, facing, 0, 0, D, 1, { lx: 0.6, ly: -0.8 }, alpha);
  // The armband: a short band across the far upper arm, 35 % of the way from the shoulder to the hand.
  const j = joints(pose);
  const sh = j.neck, hand = j.handF;
  const kd = k * D;
  const bx = (sh[0] + (hand[0] - sh[0]) * 0.35) * facing * kd, by = (sh[1] + (hand[1] - sh[1]) * 0.35) * kd;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#146e6e';
  ctx.fillRect(Math.round(bx - 2 * kd), Math.round(by - kd), Math.max(1, Math.round(4 * kd)), Math.max(1, Math.round(2 * kd)));
  ctx.restore();
}

// ---------------------------------------------------------------- the four giant shapes and their supports

/** Arc length along a polyline (cumulative, first = 0). */
export function arcLengths(pts: readonly TrailPt[]): number[] {
  const s = [0];
  for (let i = 1; i < pts.length; i++) s.push(s[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  return s;
}
/** The point and unit tangent at arc length d of a polyline (with its cumulative lengths s). */
export function pointAt(pts: readonly TrailPt[], s: readonly number[], d: number): { x: number; y: number; tx: number; ty: number } {
  const n = pts.length;
  let i = 1;
  while (i < n - 1 && s[i] < d) i++;
  const a = pts[i - 1], b = pts[i];
  const l = Math.max(1e-6, s[i] - s[i - 1]);
  const k = clamp((d - s[i - 1]) / l);
  return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), tx: (b.x - a.x) / l, ty: (b.y - a.y) / l };
}
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export interface StrokeOpts {
  /** Radius of the comet head wrapping the ball at the last point (px; 0 = none). */
  head?: number;
  /** Tail width (px) at the first point (default 3: the boot end). */
  tail?: number;
  /** Dry-brush bristles along each edge (default true; 8 per edge). */
  bristles?: boolean | number;
  /** Stitch-hole stars every `spacing` px (default 34) popping as the head passes, then holding as dots. */
  stars?: { spacing?: number; seed?: number } | false;
  /** Star-chart ticks every `every` px (pearl, 1 px). */
  ticks?: { every: number } | false;
  /** Short ink cross-stitches every `every` px (default 68). */
  cross?: { every?: number } | false;
  /** 0..1: the light drains (the body thins 75 -> 40 px at 1, flickers; the halo dims). */
  drain?: number;
  /** A plucked standing wave (v1 pluckLine: amp px, phase, nodes). */
  pluck?: Pluck;
  /** A pearl pulse travelling along the stroke: u = arc fraction from the tail, w = px length. */
  pulse?: { u: number; w?: number };
  /** Overall alpha. */
  alpha?: number;
  /** Seconds (flicker, glints). */
  t?: number;
  /** The thin preset (the loom's threads): ink 4, halo 8, jade 2, pearl core 1; no bristles, stars or head. */
  thin?: boolean;
}

/**
 * The Meridian, a brush stroke of light (the move's subject shape): outside in, an ink under-stroke (w + 8), an emerald
 * halo 2.4w (additive, 0.35), the jade body w, a mint inner 0.5w and the pearl thread core (v1's threadLine, 3 px) with
 * stitch glints travelling toward the ball; dry-brush bristles (1 px jade / mint streaks along each edge with noise
 * gaps), stitch-hole stars every 34 px popping as the head passes, ink cross-stitches every 68 px, optional star-chart
 * ticks. The width tapers from o.tail at the first point to w at the last (the ball). pts in the current transform,
 * tail first, ball last. Returns the (plucked) points it drew.
 */
export function meridianStroke(ctx: CanvasRenderingContext2D, pts: readonly TrailPt[], w: number, o: StrokeOpts = {}): TrailPt[] {
  if (pts.length < 2) return pts.slice();
  const A = clamp(o.alpha ?? 1);
  if (A <= 0) return pts.slice();
  const t = o.t ?? 0;
  const drain = clamp(o.drain ?? 0);
  const P = o.pluck ? pluckLine(pts, o.pluck) : pts.slice();
  const s = arcLengths(P);
  const L = s[s.length - 1];
  if (o.thin) {
    ctx.save();
    ctx.lineCap = 'round';
    const line = (lw: number, col: string, a: number) => {
      ctx.globalAlpha = clamp(a);
      ctx.strokeStyle = col;
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(P[0].x, P[0].y);
      for (let i = 1; i < P.length; i++) ctx.lineTo(P[i].x, P[i].y);
      ctx.stroke();
    };
    line(Math.max(4, w + 2), HEX.ink, A);
    ctx.globalCompositeOperation = 'lighter';
    line(Math.max(8, w * 4), HEX.emerald, 0.3 * A);
    ctx.globalCompositeOperation = 'source-over';
    line(Math.max(2, w), HEX.jade, A);
    line(1, HEX.pearl, A);
    ctx.restore();
    return P;
  }
  const flick = drain > 0 ? 1 - drain * 0.35 * (0.5 + 0.5 * Math.sin(t * 47 + Math.sin(t * 13) * 3)) : 1;
  const W = w * (1 - 0.47 * drain);
  const tail = o.tail ?? 3;
  const head = o.head ?? 0;
  const hx = P[P.length - 1].x, hy = P[P.length - 1].y;
  const layer = (scale: number, col: string, a: number, add: boolean, extra = 0, rgb?: RGB) => {
    if (a <= 0) return;
    ctx.globalCompositeOperation = add ? 'lighter' : 'source-over';
    ribbon(ctx, P as TrailPt[], tail * scale + extra, W * scale + extra, col, a);
    if (head > 0) {
      // The comet head wraps the ball: solid rings for the ink / body / inner layers, a soft glow for the halo.
      const r = Math.min(head * (scale >= 2 ? 1 : scale) + extra / 2, Math.max(head, (W * scale + extra) / 2));
      if (rgb) drawGlow(ctx, glowOf(rgb), hx, hy, head * 2.6, a);
      else {
        ctx.globalAlpha = clamp(a);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(hx, hy, r, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  };
  ctx.save();
  layer(1, HEX.ink, A, false, 8);
  layer(2.4, HEX.emerald, 0.35 * A * (1 - 0.5 * drain) * flick, true, 0, PAL.emerald);
  layer(1, HEX.jade, A * flick, false);
  layer(0.5, HEX.mint, 0.9 * A * (1 - 0.6 * drain) * flick, false);
  ctx.globalCompositeOperation = 'source-over';
  // Dry-brush bristles: thin streaks just inside each edge, broken by hashed gaps (deterministic along the stroke).
  const nb = o.bristles === false ? 0 : typeof o.bristles === 'number' ? o.bristles : 8;
  if (nb > 0 && L > 8) {
    ctx.lineWidth = 1;
    for (const side of [-1, 1])
      for (let b = 0; b < nb; b++) {
        const off = 0.5 - (b / nb) * 0.22;
        ctx.strokeStyle = b % 2 ? HEX.mint : HEX.jade;
        ctx.globalAlpha = 0.55 * A * flick;
        ctx.beginPath();
        let on = false;
        for (let d = 0; d <= L; d += 4) {
          const q = pointAt(P, s, d);
          const ww = lerp(tail, W, d / L) * off * side;
          const gap = hash(b * 31 + side * 7 + Math.floor(d / 9)) < 0.28;
          const x = q.x - q.ty * ww, y = q.y + q.tx * ww;
          if (gap) on = false;
          else if (!on) {
            ctx.moveTo(x, y);
            on = true;
          } else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    ctx.globalAlpha = 1;
  }
  // The pearl thread core (v1's threadLine), with stitch glints travelling toward the ball.
  threadLine(ctx, P, Math.max(2, Math.min(3, W * 0.1)), A, { under: false, halo: 0 });
  ctx.globalCompositeOperation = 'lighter';
  for (let g = 0; g < 4; g++) {
    const d = (((t * 260 + g * L * 0.25) % Math.max(1, L)) + L) % Math.max(1, L);
    const q = pointAt(P, s, d);
    drawGlow(ctx, glowOf(PAL.pearl), q.x, q.y, 4 + W * 0.08, 0.7 * A * flick);
  }
  ctx.globalCompositeOperation = 'source-over';
  // Ink cross-stitches across the body.
  if (o.cross !== false) {
    const every = (o.cross && o.cross.every) || 68;
    ctx.strokeStyle = HEX.ink;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8 * A;
    for (let d = every * 0.5; d < L - 10; d += every) {
      const q = pointAt(P, s, d);
      const ww = lerp(tail, W, d / L) * 0.35;
      ctx.beginPath();
      ctx.moveTo(q.x - (q.tx + q.ty) * ww * 0.6, q.y - (q.ty - q.tx) * ww * 0.6);
      ctx.lineTo(q.x + (q.tx + q.ty) * ww * 0.6, q.y + (q.ty - q.tx) * ww * 0.6);
      ctx.moveTo(q.x - (q.tx - q.ty) * ww * 0.6, q.y - (q.ty + q.tx) * ww * 0.6);
      ctx.lineTo(q.x + (q.tx - q.ty) * ww * 0.6, q.y + (q.ty + q.tx) * ww * 0.6);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  // Star-chart ticks (pearl, 1 px, perpendicular).
  if (o.ticks) {
    ctx.strokeStyle = HEX.pearl;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.85 * A;
    ctx.beginPath();
    for (let d = o.ticks.every; d < L; d += o.ticks.every) {
      const q = pointAt(P, s, d);
      const ww = lerp(tail, W, d / L) * 0.5 + 4;
      ctx.moveTo(q.x - q.ty * ww, q.y + q.tx * ww);
      ctx.lineTo(q.x - q.ty * (ww + 5), q.y + q.tx * (ww + 5));
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  // Stitch-hole stars: pop (18 -> 10 px) as the head passes, then hold as 2 px dots.
  if (o.stars !== false) {
    const sp = (o.stars && o.stars.spacing) || 34;
    for (let d = sp; d < L; d += sp) {
      const q = pointAt(P, s, d);
      const behind = L - d;
      if (behind < 70) sparkle(ctx, q.x, q.y, lerp(9, 5, behind / 70), A * (1 - 0.3 * (behind / 70)), Math.PI / 4);
      else {
        ctx.globalAlpha = 0.8 * A;
        ctx.fillStyle = HEX.pearl;
        ctx.fillRect(Math.round(q.x - 1), Math.round(q.y - 1), 2, 2);
        ctx.globalAlpha = 1;
      }
    }
  }
  // A travelling pearl pulse (the vibration, the reel-in).
  if (o.pulse) {
    const pw = o.pulse.w ?? 60;
    const q = pointAt(P, s, clamp(o.pulse.u) * L);
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.pearl), q.x, q.y, pw * 0.5, A);
    drawGlow(ctx, glowOf(PAL.mint), q.x, q.y, pw, 0.5 * A);
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
  return P;
}

/**
 * The aurora hem (a support, never the subject): at most 160 vertical rays hanging 60-200 px under the stroke, pearl at
 * the top -> jade -> emerald -> 0, two slow sine folds, additive over an ink under-layer, alpha capped at 0.35. h =
 * the longest ray (<= 200), phase = the folds' phase (drift it at 0.2x in the hang), a = strength.
 */
export function auroraHem(ctx: CanvasRenderingContext2D, pts: readonly TrailPt[], h: number, phase: number, a: number) {
  if (pts.length < 2 || a <= 0) return;
  const s = arcLengths(pts);
  const L = s[s.length - 1];
  const n = Math.min(160, Math.max(2, Math.floor(L / 4)));
  const H = Math.min(200, Math.max(60, h));
  const ray = hemRay();
  ctx.save();
  // The ink under-layer (normal blend) so the light sits on dark, never on mid-grey.
  ctx.globalAlpha = 0.22 * clamp(a);
  ctx.fillStyle = HEX.ink;
  for (let i = 0; i < n; i++) {
    const q = pointAt(pts, s, ((i + 0.5) / n) * L);
    const f = 0.5 + 0.5 * Math.sin(i * 0.11 + phase) * Math.sin(i * 0.037 - phase * 0.7);
    ctx.fillRect(q.x - 2, q.y, 4, lerp(60, H, f));
  }
  ctx.globalCompositeOperation = 'lighter';
  ctx.imageSmoothingEnabled = true;
  for (let i = 0; i < n; i++) {
    const q = pointAt(pts, s, ((i + 0.5) / n) * L);
    const f = 0.5 + 0.5 * Math.sin(i * 0.11 + phase) * Math.sin(i * 0.037 - phase * 0.7);
    const len = lerp(60, H, f);
    const sway = Math.sin(i * 0.23 + phase * 1.3) * 3;
    ctx.globalAlpha = Math.min(0.35, 0.35 * clamp(a) * (0.6 + 0.4 * f));
    ctx.drawImage(ray, q.x - 1.5 + sway * 0.2, q.y, 3, len);
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
  gr.addColorStop(0, css(PAL.pearl));
  gr.addColorStop(0.2, css(PAL.jade));
  gr.addColorStop(0.6, css(PAL.emerald));
  gr.addColorStop(1, 'rgba(11,143,88,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 1, 64);
  return (hemRayCv = c);
}

/** One loom thread pinned to the stadium: from anchor `from` (index into the anchor list) to the pin (x, y). */
export interface LoomPin {
  from: number;
  x: number;
  y: number;
  /** Width at the hero end and at the pin (default [2, 2]; the two lens threads widen 2 -> 8 px). */
  w?: readonly [number, number];
}
export interface LoomOpts {
  /** 0..1: how far the threads have shot out (outExpo over 0.10 s in the brief). */
  shoot?: number;
  /** Per-thread canvas shiver (px amplitude; the tick plucks). */
  pluck?: readonly number[];
  /** Per-thread 0..1 release: the thread lets go of him and fades on its pin. */
  release?: readonly number[];
  /** Pearl stitch-stars on the pins (default true). */
  stars?: boolean;
  alpha?: number;
}
/**
 * Shot 2a's loom: straight, taut threads from his eyes and fingertips (`from` anchors) to screen pins, each the
 * stroke's thin preset (ink 4, halo 8, jade 2, the pearl core 1) with a pearl stitch-star on its pin. No tendrils, no
 * aura, nothing rising off him. t = seconds (the shiver).
 */
export function loom(ctx: CanvasRenderingContext2D, from: readonly (readonly [number, number])[], pins: readonly LoomPin[], t: number, o: LoomOpts = {}) {
  const reach = clamp(o.shoot ?? 1);
  if (reach <= 0) return;
  const A = clamp(o.alpha ?? 1);
  pins.forEach((p, i) => {
    const a = from[p.from];
    if (!a) return;
    const rel = clamp(o.release?.[i] ?? 0);
    const alpha = A * (1 - rel);
    if (alpha <= 0) return;
    const bx = lerp(a[0], p.x, reach), by = lerp(a[1], p.y, reach);
    const start = rel > 0 ? [lerp(a[0], p.x, rel * 0.9), lerp(a[1], p.y, rel * 0.9)] : a;
    const amp = o.pluck?.[i] ?? 0;
    const pts: TrailPt[] = [];
    for (let k = 0; k <= 12; k++) {
      const u = k / 12;
      const x = lerp(start[0], bx, u), y = lerp(start[1], by, u);
      const dx = bx - start[0], dy = by - start[1], l = Math.hypot(dx, dy) || 1;
      const d = amp * Math.sin(Math.PI * u) * Math.sin(t * 60 + i);
      pts.push({ x: x - (dy / l) * d, y: y + (dx / l) * d });
    }
    const [w0, w1] = p.w ?? [2, 2];
    meridianStroke(ctx, pts, (w0 + w1) / 2, { thin: true, alpha });
    if (reach >= 1 && o.stars !== false) sparkle(ctx, p.x, p.y, 6, alpha, Math.PI / 4);
  });
}

/**
 * The Sky Eye (shot 6): an almond of light w x h (340 x 150) opened to `open` (0 hairline -> 1; the brief holds 0.70);
 * open < 0 squeezes it into the needle's-eye vesica (-1: a narrow almond 30 % of the width). The ball is the pupil at
 * (cx, cy) (the shot draws it). Pearl-rimmed lids on an ink outline, a dark emerald iris field, 24 jade meridian lines
 * radiating from the pupil (iris striations inside the lids, faint lashes outside up to 260 px), a ring of degree ticks
 * at r 46. `look` 0..1 slides the pearl glint down toward the defenders. rot turns it (the needle's eye stands vertical).
 */
export function skyEye(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, open: number, look: number, t: number, rot = 0) {
  const sq = open < 0 ? clamp(-open) : 0;
  const op = open < 0 ? lerp(0.35, 0.22, sq) : clamp(open);
  const ww = w * lerp(1, 0.3, sq);
  const gap = h * op;
  if (ww <= 1) return;
  ctx.save();
  ctx.translate(cx, cy);
  if (rot) ctx.rotate(rot);
  const half = ww / 2;
  const lid = (sign: number) => {
    ctx.moveTo(-half, 0);
    ctx.quadraticCurveTo(0, sign * gap, half, 0);
  };
  const almond = () => {
    ctx.beginPath();
    lid(-1);
    ctx.quadraticCurveTo(0, gap, -half, 0);
    ctx.closePath();
  };
  const fade = 1 - sq;
  // Lashes outside the almond (faint).
  if (gap > 2 && fade > 0) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = HEX.jade;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.18 * fade * clamp(op / 0.7);
    ctx.beginPath();
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * TAU + t * 0.05;
      ctx.moveTo(Math.cos(a) * gap * 0.75, Math.sin(a) * gap * 0.75);
      ctx.lineTo(Math.cos(a) * 260, Math.sin(a) * 260 * 0.6);
    }
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }
  if (gap > 0.5) {
    ctx.save();
    almond();
    ctx.clip();
    const g = ctx.createRadialGradient(0, 0, 4, 0, 0, half);
    g.addColorStop(0, '#0f6a45');
    g.addColorStop(0.5, '#08402a');
    g.addColorStop(1, '#03170f');
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = g;
    ctx.fillRect(-half, -gap, ww, gap * 2);
    // The meridian lines (iris striations) and the degree ring.
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = HEX.jade;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.55 * fade;
    ctx.beginPath();
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * TAU + t * 0.05;
      ctx.moveTo(Math.cos(a) * 16, Math.sin(a) * 16);
      ctx.lineTo(Math.cos(a) * half, Math.sin(a) * half);
    }
    ctx.stroke();
    ctx.globalAlpha = 0.7 * fade;
    ctx.strokeStyle = HEX.mint;
    ctx.beginPath();
    for (let k = 0; k < 36; k++) {
      const a = (k / 36) * TAU;
      const r0 = k % 3 ? 44 : 41;
      ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
      ctx.lineTo(Math.cos(a) * 48, Math.sin(a) * 48);
    }
    ctx.stroke();
    ctx.restore();
  }
  // Lids: ink outline, pearl rim, pearl corners.
  ctx.lineCap = 'round';
  for (const [lw, col, a] of [[5, HEX.ink, 1], [2, HEX.pearl, 1]] as const) {
    ctx.globalAlpha = a;
    ctx.strokeStyle = col;
    ctx.lineWidth = lw;
    ctx.beginPath();
    lid(-1);
    lid(1);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.pearl), -half, 0, 10, 0.8);
  drawGlow(ctx, glowOf(PAL.pearl), half, 0, 10, 0.8);
  // The pupil's glint, sliding down toward the defenders.
  if (gap > 4) drawGlow(ctx, glowOf(PAL.pearl), 0, lerp(-6, 9, clamp(look)), 7, 0.85);
  ctx.restore();
}

/**
 * Shot 7's needle of light: a straight shaft from the needle's eye `eye` to the ball point `tip` (w 18 -> 10 in the
 * brief), ink under-stroke, emerald halo, jade body tapering toward the eye, a pearl core, glints running to the tip.
 */
export function needleShaft(ctx: CanvasRenderingContext2D, eye: readonly [number, number], tip: readonly [number, number], w: number, t: number) {
  const pts: TrailPt[] = [];
  for (let k = 0; k <= 16; k++) pts.push({ x: lerp(eye[0], tip[0], k / 16), y: lerp(eye[1], tip[1], k / 16) });
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ribbon(ctx, pts, 4, w + 6, HEX.ink, 1);
  ctx.globalCompositeOperation = 'lighter';
  ribbon(ctx, pts, 4, w * 3, HEX.emerald, 0.35);
  ctx.globalCompositeOperation = 'source-over';
  ribbon(ctx, pts, 2, w, HEX.jade, 1);
  ribbon(ctx, pts, 1, w * 0.35, HEX.pearl, 1);
  ctx.globalCompositeOperation = 'lighter';
  for (let g = 0; g < 3; g++) {
    const u = (t * 2.4 + g / 3) % 1;
    drawGlow(ctx, glowOf(PAL.pearl), lerp(eye[0], tip[0], u), lerp(eye[1], tip[1], u), 4 + w * 0.3 * u, 0.8);
  }
  ctx.restore();
}

/**
 * Shot 8's bowstring spear: the line snapped straight from (x0, y0) to (x1, y1): body w (24), halo ~3.75w (90),
 * pearl core w/4 (6), vibrating in a standing wave of `amp` px (14 -> 0 over 0.6 s in the brief) with `nodes` interior
 * nodes at `phase` (radians). Returns the displaced points (the bead rides them).
 */
export function jadeSpear(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, w: number, amp: number, phase: number, nodes = 3): TrailPt[] {
  const base: TrailPt[] = [];
  for (let k = 0; k <= 48; k++) base.push({ x: lerp(x0, x1, k / 48), y: lerp(y0, y1, k / 48) });
  const pts = amp ? pluckLine(base, { amp, phase, nodes }) : base;
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  };
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = HEX.ink;
  ctx.lineWidth = w + 8;
  path();
  ctx.stroke();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = HEX.emerald;
  ctx.lineWidth = w * 3.75;
  path();
  ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.strokeStyle = HEX.jade;
  ctx.lineWidth = w;
  path();
  ctx.stroke();
  ctx.strokeStyle = HEX.mint;
  ctx.lineWidth = w * 0.5;
  path();
  ctx.stroke();
  ctx.strokeStyle = HEX.pearl;
  ctx.lineWidth = Math.max(2, w / 4);
  path();
  ctx.stroke();
  ctx.restore();
  return pts;
}

/**
 * The tug-of-war geometry (shot 6b): the line hauled down into a V through the grab point at arc fraction `grabU`
 * (0 = the tail, 1 = the ball): every point displaced along `dir` (default straight down) by sag · the V profile
 * (0 at both ends, 1 at the grab). Returns new points.
 */
export function threadSag(pts: readonly TrailPt[], grabU: number, sag: number, dir: readonly [number, number] = [0, 1]): TrailPt[] {
  if (pts.length < 2 || !sag) return pts.slice();
  const s = arcLengths(pts);
  const L = s[s.length - 1] || 1;
  const g = clamp(grabU, 0.02, 0.98);
  return pts.map((q, i) => {
    const f = s[i] / L;
    const v = f < g ? f / g : (1 - f) / (1 - g);
    const k = sag * Math.sin((v * Math.PI) / 2);
    return { x: q.x + dir[0] * k, y: q.y + dir[1] * k };
  });
}

export interface StitchRingOpts {
  /** Vertical squash (0.35 on the turf). */
  squash?: number;
  color?: string;
  /** Dash and gap (px). */
  dash?: number;
  gap?: number;
  phase?: number;
  width?: number;
  /** Ink under-stroke (default true). */
  ink?: boolean;
  rot?: number;
}
/** MERIDIAN's ring style: a running-stitch dashed ring with needle-hole dots, vesica-squashed on the turf. */
export function stitchRing(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: number, o: StitchRingOpts = {}) {
  if (r <= 0 || a <= 0) return;
  const sq = o.squash ?? 1, dash = o.dash ?? 9, gap = o.gap ?? 5, lw = o.width ?? 2;
  ctx.save();
  ctx.translate(x, y);
  if (o.rot) ctx.rotate(o.rot);
  ctx.scale(1, sq);
  ctx.setLineDash([dash, gap]);
  ctx.lineDashOffset = o.phase ?? 0;
  if (o.ink !== false) {
    ctx.globalAlpha = clamp(a);
    ctx.strokeStyle = HEX.ink;
    ctx.lineWidth = lw + 2;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.stroke();
  }
  ctx.globalAlpha = clamp(a);
  ctx.strokeStyle = o.color ?? HEX.jade;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([]);
  // Needle holes in the gaps.
  const per = dash + gap, n = Math.max(4, Math.floor((TAU * r) / per));
  ctx.fillStyle = HEX.pearl;
  for (let k = 0; k < n; k++) {
    const an = ((k * per + dash + gap / 2 - (o.phase ?? 0)) / r) % TAU;
    ctx.fillRect(Math.round(Math.cos(an) * r - 0.5), Math.round(Math.sin(an) * r - 0.5), 1, 1);
  }
  ctx.restore();
}
/** An expanding stitched ring (started at shot time t0). */
export interface StitchRingSpec {
  x: number;
  y: number;
  t0: number;
  r0: number;
  r1: number;
  dur: number;
  squash?: number;
  color?: string;
  width?: number;
}
/** A deterministic list of expanding stitched rings: add() at a cue, draw(ctx, t) every frame (a pure function of t). */
export class StitchRings {
  list: StitchRingSpec[] = [];
  add(r: StitchRingSpec) {
    this.list.push(r);
  }
  clear() {
    this.list.length = 0;
  }
  draw(ctx: CanvasRenderingContext2D, t: number) {
    for (const r of this.list) {
      const u = (t - r.t0) / r.dur;
      if (u < 0 || u >= 1) continue;
      stitchRing(ctx, r.x, r.y, lerp(r.r0, r.r1, ease.outCubic(u)), 1 - ease.inQuad(u), { squash: r.squash, color: r.color, width: r.width, phase: -u * 40 });
    }
  }
}

/** A star-chart point: screen position and its height in metres. */
export interface ChartPt {
  x: number;
  y: number;
  /** Height above the turf (m). */
  h: number;
}
/**
 * Shot 2b's star chart: a dotted jade arc (2 px, 14 px emerald halo) along `pts`, drawn to `reveal` (0..1), with
 * pearl degree ticks wherever the rising limb crosses every `every` m (default 5), 6 px numerals every `label` m
 * (default 10), and o.apex ('26 M') at the highest point.
 */
export function starChart(ctx: CanvasRenderingContext2D, pts: readonly ChartPt[], o: { reveal?: number; every?: number; label?: number; apex?: string; alpha?: number } = {}) {
  if (pts.length < 2) return;
  const A = clamp(o.alpha ?? 1);
  const n = Math.max(2, Math.ceil(pts.length * clamp(o.reveal ?? 1)));
  const P = pts.slice(0, n);
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(P[0].x, P[0].y);
    for (let i = 1; i < P.length; i++) ctx.lineTo(P[i].x, P[i].y);
  };
  ctx.save();
  ctx.lineCap = 'round';
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.3 * A;
  ctx.strokeStyle = HEX.emerald;
  ctx.lineWidth = 14;
  path();
  ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
  ctx.setLineDash([3, 4]);
  ctx.globalAlpha = A;
  ctx.strokeStyle = HEX.jade;
  ctx.lineWidth = 2;
  path();
  ctx.stroke();
  ctx.setLineDash([]);
  const every = o.every ?? 5, label = o.label ?? 10;
  let apexI = 0;
  for (let i = 1; i < pts.length; i++) if (pts[i].h > pts[apexI].h) apexI = i;
  const top = Math.min(apexI, P.length - 1);
  for (let i = 1; i <= top; i++) {
    const a = P[i - 1], b = P[i];
    for (let m = Math.ceil(a.h / every) * every; m <= b.h && m > 0; m += every) {
      if (m <= a.h) continue;
      const k = (m - a.h) / Math.max(1e-6, b.h - a.h);
      const x = lerp(a.x, b.x, k), y = lerp(a.y, b.y, k);
      ctx.fillStyle = HEX.pearl;
      ctx.fillRect(Math.round(x + 2), Math.round(y), 5, 1);
      if (m % label === 0) pixelText(ctx, `${m}`, x + 9, y - 4, 6, HEX.pearl, 'left', HEX.ink);
    }
  }
  if (o.apex && n > apexI) {
    const q = P[apexI];
    ctx.fillStyle = HEX.pearl;
    ctx.fillRect(Math.round(q.x - 1), Math.round(q.y - 6), 2, 12);
    pixelText(ctx, o.apex, q.x + 8, q.y - 14, 8, HEX.pearl, 'left', HEX.ink);
  }
  ctx.restore();
}

/** Shot 5's height readout: pearl pixel text (16 px) in a jade bracket, with an optional 1 px leader line to a point. */
export function readout(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, a: number, o: { leader?: readonly [number, number] } = {}) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = clamp(a);
  if (o.leader) {
    ctx.strokeStyle = HEX.jade;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 4, y + 8);
    ctx.lineTo(o.leader[0], o.leader[1]);
    ctx.stroke();
  }
  ctx.strokeStyle = HEX.jade;
  ctx.lineWidth = 2;
  const w = 12 + text.length * 12;
  ctx.beginPath();
  ctx.moveTo(x + 5, y - 2);
  ctx.lineTo(x, y - 2);
  ctx.lineTo(x, y + 20);
  ctx.lineTo(x + 5, y + 20);
  ctx.moveTo(x + w - 5, y - 2);
  ctx.lineTo(x + w, y - 2);
  ctx.lineTo(x + w, y + 20);
  ctx.lineTo(x + w - 5, y + 20);
  ctx.stroke();
  pixelText(ctx, text, x + 6, y, 16, HEX.pearl, 'left', HEX.ink);
  ctx.restore();
}

/**
 * No.10's needle eye: a jade vertical vesica pupil (s px tall at k 1) with a pearl glint, over his drawn pupil at (x, y).
 * k 0..1 narrows it in (0.20-0.30 in shot 1). glintOnly: just the glint (No.7's answering eyes).
 */
export function needlePupil(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, k: number, glintOnly = false) {
  const kk = clamp(k);
  if (kk <= 0) return;
  ctx.save();
  if (!glintOnly) {
    const hh = s * 0.5, ww = s * lerp(0.4, 0.16, kk);
    ctx.globalAlpha = kk;
    ctx.fillStyle = HEX.ink;
    ctx.beginPath();
    ctx.moveTo(x, y - hh - 1);
    ctx.quadraticCurveTo(x + ww + 1, y, x, y + hh + 1);
    ctx.quadraticCurveTo(x - ww - 1, y, x, y - hh - 1);
    ctx.fill();
    ctx.fillStyle = HEX.jade;
    ctx.beginPath();
    ctx.moveTo(x, y - hh);
    ctx.quadraticCurveTo(x + ww, y, x, y + hh);
    ctx.quadraticCurveTo(x - ww, y, x, y - hh);
    ctx.fill();
  }
  ctx.globalAlpha = kk;
  ctx.fillStyle = HEX.pearl;
  ctx.fillRect(Math.round(x - s * 0.12), Math.round(y - s * 0.28), Math.max(1, Math.round(s * 0.12)), Math.max(1, Math.round(s * 0.12)));
  ctx.restore();
}

/**
 * Shot 1's exit, the needle's-eye iris: a vertical vesica centred on (cx, cy) grown from 2 x 6 px (p 0) until it
 * covers the frame (p 1; outCubic applied here), with `still` (2a's opening frame, cached in prepare()) drawn inside it
 * in screen space, a 6 px jade rim on an ink line and a pearl glint running round the rim. Screen space.
 */
export function needleIris(ctx: CanvasRenderingContext2D, cx: number, cy: number, p: number, still: HTMLCanvasElement | null) {
  const e = ease.outCubic(clamp(p));
  if (e <= 0) return;
  const a = lerp(1, 400, e), b = a * 3;
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(cx, cy - b);
    ctx.quadraticCurveTo(cx + a * 2, cy, cx, cy + b);
    ctx.quadraticCurveTo(cx - a * 2, cy, cx, cy - b);
    ctx.closePath();
  };
  ctx.save();
  path();
  ctx.save();
  ctx.clip();
  if (still) {
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(still, 0, 0, VW, VH);
  } else {
    ctx.fillStyle = HEX.night;
    ctx.fillRect(0, 0, VW, VH);
  }
  ctx.restore();
  ctx.lineJoin = 'round';
  ctx.strokeStyle = HEX.ink;
  ctx.lineWidth = 9;
  path();
  ctx.stroke();
  ctx.strokeStyle = HEX.jade;
  ctx.lineWidth = 6;
  path();
  ctx.stroke();
  // The glint running round the rim.
  const ang = e * TAU * 1.5;
  const gx = cx + Math.sin(ang) * a, gy = cy - Math.cos(ang) * b * 0.9;
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.pearl), gx, gy, 10, 0.9);
  ctx.restore();
}

/** The goal mouth for stringFrame: posts at x0 / x1, crossbar at yTop, the goal line at yGround (screen px). */
export interface GoalMouth {
  x0: number;
  x1: number;
  yTop: number;
  yGround: number;
}
/**
 * Shot 9a's singing goal frame: the crossbar and both posts as plucked strings (a standing wave of `amp` px, sin(π·s)
 * along each bar) drawn as three ghost positions with a jade glow on each bar: a drawn shape, never a full-frame flicker.
 */
export function stringFrame(ctx: CanvasRenderingContext2D, g: GoalMouth, amp: number, phase: number) {
  const bar = (ax: number, ay: number, bx: number, by: number, k: number, horiz: boolean) => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 20; i++) {
      const s = i / 20;
      const d = amp * Math.sin(Math.PI * s) * Math.cos(phase + k * 2.1);
      pts.push([lerp(ax, bx, s) + (horiz ? 0 : d), lerp(ay, by, s) + (horiz ? d : 0)]);
    }
    return pts;
  };
  const stroke = (pts: [number, number][], w: number, col: string, a: number) => {
    ctx.globalAlpha = clamp(a);
    ctx.strokeStyle = col;
    ctx.lineWidth = w;
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
  };
  ctx.save();
  ctx.lineCap = 'round';
  const bars: [number, number, number, number, boolean][] = [
    [g.x0, g.yTop, g.x1, g.yTop, true],
    [g.x0, g.yTop, g.x0, g.yGround, false],
    [g.x1, g.yTop, g.x1, g.yGround, false],
  ];
  for (const [ax, ay, bx, by, horiz] of bars) {
    const ghosts = Math.abs(amp) > 0.3 ? [0, 1, 2] : [0];
    for (const k of ghosts) {
      const pts = bar(ax, ay, bx, by, k, horiz);
      if (k === 0) {
        stroke(pts, 9, HEX.ink, 1);
        ctx.globalCompositeOperation = 'lighter';
        stroke(pts, 14, HEX.emerald, 0.3);
        ctx.globalCompositeOperation = 'source-over';
        stroke(pts, 5, HEX.pearl, 1);
      } else {
        ctx.globalCompositeOperation = 'lighter';
        stroke(pts, 4, HEX.jade, 0.25);
        ctx.globalCompositeOperation = 'source-over';
      }
    }
  }
  ctx.restore();
}

/**
 * The passive lamp-head tint (the brief: floodlights stay ON; their heads only catch the arc's light): smoothstep of
 * the screen distance from the head to the nearest point of the stroke (or the ball: pass one point), 1 at 60 px ->
 * 0 at 260 px, times the stroke's light (1 - drain). A smooth function every frame, never a switch.
 */
export function lampTintFor(head: readonly [number, number], pts: readonly TrailPt[] | readonly (readonly [number, number])[], light = 1): number {
  if (!pts.length || light <= 0) return 0;
  const P = (pts as readonly unknown[]).map((q) => (Array.isArray(q) ? { x: q[0] as number, y: q[1] as number } : (q as TrailPt)));
  let best = Infinity;
  if (P.length === 1) best = Math.hypot(P[0].x - head[0], P[0].y - head[1]);
  for (let i = 1; i < P.length; i++) {
    const a = P[i - 1], b = P[i];
    const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy || 1e-9;
    const k = clamp(((head[0] - a.x) * dx + (head[1] - a.y) * dy) / l2);
    best = Math.min(best, Math.hypot(head[0] - (a.x + dx * k), head[1] - (a.y + dy * k)));
  }
  const u = clamp((260 - best) / 200);
  return clamp(light) * u * u * (3 - 2 * u);
}

// ---------------------------------------------------------------- particles

/** Jade sparks (the shared kit.sparks on the 'jade' ramp). */
export function jadeSparks(env: Env, x: number, y: number, n: number, speed: number, cone = TAU, dir = 0) {
  sparks(env, x, y, n, speed, cone, dir, 'jade');
}
/** Light-stitches (PK.Stitch on the 'jade' ramp) flung from (x, y). */
export function stitchBurst(env: Env, x: number, y: number, n: number, speed: number, cone = TAU, dir = 0, ramp: RampName = 'jade') {
  const rng = env.rng;
  for (let i = 0; i < n; i++) {
    const a = dir + rng.range(-cone / 2, cone / 2);
    const s = speed * rng.range(0.3, 1);
    env.parts.spawn({ kind: PK.Stitch, x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 2.5, max: rng.range(0.3, 0.7), s0: rng.range(4, 6), s1: 3, ramp, r0: 0.1, r1: 0.9, a0: 1, a1: 0, add: false });
  }
}
/** Ink flecks (normal blend, the 'ink' ramp). */
export function inkFlecks(env: Env, x: number, y: number, n: number, speed: number) {
  const rng = env.rng;
  for (let i = 0; i < n; i++) {
    const a = rng.range(0, TAU), s = speed * rng.range(0.2, 1);
    env.parts.spawn({ kind: PK.Pixel, x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 3, ay: 120, max: rng.range(0.3, 0.8), s0: rng.range(1, 3), s1: 1, ramp: 'ink', r0: 0.6, r1: 1, a0: 1, a1: 0, add: false });
  }
}

// ---------------------------------------------------------------- the name card

/** The set's shared name card in MERIDIAN's style with the stitched title (9c, from 2.45). t = card time. */
export function meridianCard(ctx: CanvasRenderingContext2D, t: number) {
  nameCard(ctx, t, {
    title: SHOT_NAME,
    line2: 'No.10 > No.7 · ASSIST',
    score: 'CAM 1 - 0 RIV',
    style: 'meridian',
    titleFn: (c, x, y, tt) => {
      c.save();
      c.font = `30px ${TITLE_FONT}`;
      const w = c.measureText(SHOT_NAME).width;
      stitchTitle(c, SHOT_NAME, x + w / 2 + 6, y, 30, tt, { dur: 0.3 });
      c.restore();
    },
  });
}

// ---------------------------------------------------------------- placeholder shots (until each shot is produced)

export interface ShotSpec {
  n: ShotNo;
  cues?: { at: number; fn: (env: Env) => void }[];
}
export interface PlaceholderDemo {
  prepare?(env: Env): void;
  init?(env: Env): void;
  update?(env: Env, t: number, dt: number): void;
  /** Draw the demo (it sets its own transforms); the label card is drawn on top. */
  render?(env: Env, t: number): void;
}

/**
 * A stand-in shot with the brief's exact name, duration, seed, cues and rate curve, a rough demo of its engine pieces
 * and a small label (shot number, name, local time). prepare() warms FINAL_MERIDIAN and the Night Ink buffers; init()
 * calls sfx.clearBus() (every MERIDIAN init does, even a silent one) and sets cam.shakeRoll 0.015 (roll stays 0).
 */
export function placeholderShot(spec: ShotSpec, demo: PlaceholderDemo = {}): Shot {
  const meta = SHOTS[spec.n - 1];
  return {
    name: meta.name,
    dur: meta.dur,
    seed: meta.seed,
    rate: RATE[spec.n],
    cues: spec.cues,
    prepare(env) {
      warmMeridian(env);
      demo.prepare?.(env);
    },
    init(env) {
      env.sfx.clearBus();
      env.cam.set(VW / 2, VH / 2, 1, 0);
      env.cam.shakeRoll = 0.015;
      PUPPETS.frame();
      demo.init?.(env);
    },
    update(env, t, dt) {
      demo.update?.(env, t, dt);
    },
    render(env, t) {
      const ctx = env.ctx;
      env.screen();
      ctx.fillStyle = HEX.night;
      ctx.fillRect(0, 0, VW, VH);
      PUPPETS.frame();
      demo.render?.(env, t);
      env.screen();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(6,20,15,0.8)';
      ctx.fillRect(8, 8, 262, 30);
      ctx.fillStyle = HEX.jade;
      ctx.fillRect(8, 8, 3, 30);
      pixelText(ctx, `MERIDIAN v2 · SHOT ${spec.n} · ${meta.name.toUpperCase()}`, 16, 12, 9, HEX.pearl, 'left', HEX.ink);
      pixelText(ctx, `PLACEHOLDER  t ${t.toFixed(2)} / ${meta.dur.toFixed(1)} s`, 16, 25, 8, HEX.jade, 'left', HEX.ink);
      if (!env.fx.pass) nightGrade(env.fx);
      assertMeridianFx(env.fx);
    },
  };
}

/** Reset a BallSpin to identity (call from init(): spin advances in update() with dt, so seek replays it exactly). */
export function resetSpin(spin: { m: Float64Array }) {
  spin.m = new Float64Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
}

/** Mix a palette colour toward another (helpers for the shots). */
export const mix = (a: RGB, b: RGB, k: number): RGB => mixRGB(a, b, clamp(k));
