// MERIDIAN THREAD v2 · shot 1 · "Meridian Sign" (cut-in, 1.4 s, seed 411): the declaration. SPEC.md shot 1.
//
// Two slanted manga panels slam onto a black ink page (an emerald burst from the arc's apex, rotating wedges, two
// layers of focus lines, jade speed streaks at -18 deg, screentone corners, rising motes; the slam's energy is a local
// mint light where the panels meet). Panel A: No.10 chest-up (MeridianSign MS1-MS4b at 5x: the brief's "chest-up
// crop"; at 3x the panel would show his whole body). He taps under his eye (0.16: a jade light event at the fingertip,
// stitched rings, a tick and a small hit) and his pupils squeeze into jade needle eyes because of it; the glint star
// sits on the eye's upper-outer highlight so the needle pupil stays readable. He flings the finger up over his crown
// and the Meridian is born out of his eye: an 18 px brush stroke of light (44 px halo) that rides his fingertip out of
// the panel, hangs over the open black above panel B with a held pearl star (0.52-0.58) and whips down like a needle
// into No.7's eye in panel B (launch, hang, needle-steep fall); the needle stays embedded in his lit pupil 0.12 s. His
// pointing hand breaks out of the panel border. At 0.58 a pearl needle peels off the stroke's apex, loops left over
// No.10's head and drops onto the title's start, then stitches MERIDIAN THREAD along a running stitch (0.64-1.00);
// at 1.00 the letters lock (slam 1.32 -> 1.0) with a twang, a strum, local mint light, jade sparks, a shock, and the
// pluck warp's debut along the stroke. Exit: the needle's-eye iris: a push to 2.0 on his jade needle pupil while its
// vesica opens to frame size onto shot 2's own first picture (loomStill), a pearl bead running the stroke into the eye.
// The grade and CA ease into shot 2's opening values by the cut. Full-frame lifts stay at 0.07-0.2 (no FlashBudget
// event; the hits are local light, so the black page stays black).
//
// Camera (roll 0): slam-settle 1.08 -> 1.00 with the panels, then 1.00 -> 1.06 (outSine) with punches on the tap,
// the landing and the title lock, a drift that leans after the stroke's flight, trauma hits on the slam / tap /
// landing / lock, and the 1.22-1.40 iris push (inOutCubic) with a little zoom blur.
// Deterministic: init() resets every flag and list; particles spawn in update() from env.rng; render() is a pure
// function of t (frame-stable flicker from env.frng()).

import { STEP, type Env, type Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { TAU, clamp, ease, lerp, type Rng } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import { TITLE_FONT, mangaPanels, panelPoly, pixelText, screentone, sparkle, type TrailPt } from '../../art/fx';
import { anim, drawAnim, findFrame, hasAnim, type StudioAnim } from '../../art/studioAnim';
import { drawNo10, no10Point, type No10Key } from '../../art/no10';
import { drawNo7, no7Anim } from '../../art/no7';
import { keys, punch, pushShock, zoomAbout } from '../kit';
import {
  HEX, JADE_FLARE, PAL, PEARL_FLASH, RATE, SEQ10, SHOTS, SHOT_NAME, assertMeridianFx, ctrlThrough, meridianFlash, needlePoint,
  needlePupil, nightGrade, pluckLine, seqAt, setPluck, stitchRing, threadLine, warmMeridian,
} from './common';
import { loomStill } from './shot2_loom';

const META = SHOTS[0];
/** The last frame this shot draws (the timeline steps at 1/60 and enters shot 2 at 1.40): the cut's grade lands here. */
const T_END = META.dur - STEP;
const SEQ = SEQ10[1]!;

// ---------------------------------------------------------------- layout (screen px at zoom 1)

/** No.10's MeridianSign frames at 5x, registered on the planted feet (contact (64,102)) far below the panel. */
const S10 = 5;
const C10: [number, number] = [178, 538];
/** No.7's face crop at 5x: the midpoint between his eyes lands here (panel B). */
const S7 = 5;
const EYES7: [number, number] = [497, 112];
/** Panel A (No.10) and panel B (No.7): centre, size, slant (deg). */
const PA = { cx: 200, cy: 190, w: 360, h: 320, deg: -3 };
const PB = { cx: 500, cy: 110, w: 250, h: 130, deg: 4 };
const POLY_A = panelPoly(PA.cx, PA.cy, PA.w, PA.h, PA.deg);
const POLY_B = panelPoly(PB.cx, PB.cy, PB.w, PB.h, PB.deg);
/** Panel A shrunk by its border + gutter: outside it, the breaking-out hand covers the border too. */
const POLY_A_IN = panelPoly(PA.cx, PA.cy, PA.w - 14, PA.h - 14, PA.deg);
/** The arc's apex over the top of the frame (in the open black above panel B, clear of the A/B border join) and the
 *  point where the dive starts (screen). */
const APEX: [number, number] = [420, 16];
const DIVE: [number, number] = [500, 26];
/** The page burst's centre (the brief: the arc's apex point). */
const BURST: [number, number] = [320, 34];

// Beats (shot-local s).
const T_SLAM = 0.1;
const T_TAP = 0.16;
const T_GLINT = 0.3;
const T_THROW = 0.4;
const T_HANG = 0.58;
const T_LAND = 0.74;
const T_GRIN = 0.84;
/** The title needle peels off the stroke's apex (0.58, as the head dives) and loops round his head to the title's
 *  start; the stitch run is 0.64 -> 1.00 (0.36 s for the line where the 0.62 start had 0.38: ~5 % quicker per letter),
 *  so the last letter is on the line just before the lock. */
const T_TITLE = 0.58;
const T_RUN = 0.64;
const T_LOCK = 1.0;
const T_PUSH = 1.22;
const T_IRIS = 1.26;
/** The thread through the needle's eye: the lock's bead (out to No.7, 1.00-1.20) runs back over the stroke and slows
 *  into his pupil (1.20-1.31, outQuad), settling as the vesica starts to open, while it is still visible under the push. */
const T_THREAD = 1.2;
const THREAD_DUR = 0.11;

// Title (TITLE_STYLE: pearl fill, jade stroke, ink outer), stitched along a running stitch under the arc.
const TITLE_SIZE = 64;
const TITLE_C: [number, number] = [326, 300];
const TITLE_ANG = -0.045;
const TAG = 'SPECIAL PASS · No.10 > No.7';

// ---------------------------------------------------------------- module state (reset in init)

let still: HTMLCanvasElement | null = null;
let stillS = 0;
const fired = { slam: false, tap: false, glint: false, land: false, lock: false };

// ---------------------------------------------------------------- small helpers

const css = (c: readonly number[], a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const smoothstep = (a: number, b: number, x: number) => {
  const u = clamp((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

function polyPath(ctx: CanvasRenderingContext2D, poly: readonly (readonly [number, number])[], dx = 0, dy = 0) {
  ctx.moveTo(poly[0][0] + dx, poly[0][1] + dy);
  for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i][0] + dx, poly[i][1] + dy);
  ctx.closePath();
}

/** Uniform Catmull-Rom through `k`, `n` samples per segment. */
function catmull(k: readonly (readonly [number, number])[], n = 10): TrailPt[] {
  const out: TrailPt[] = [];
  for (let i = 0; i < k.length - 1; i++) {
    const p0 = k[Math.max(0, i - 1)], p1 = k[i], p2 = k[i + 1], p3 = k[Math.min(k.length - 1, i + 2)];
    for (let j = 0; j < n; j++) {
      const u = j / n, u2 = u * u, u3 = u2 * u;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
      out.push({ x: f(p0[0], p1[0], p2[0], p3[0]), y: f(p0[1], p1[1], p2[1], p3[1]) });
    }
  }
  const last = k[k.length - 1];
  out.push({ x: last[0], y: last[1] });
  return out;
}

function lengths(P: readonly TrailPt[]): number[] {
  const s = [0];
  for (let i = 1; i < P.length; i++) s.push(s[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y));
  return s;
}

/** Point and unit tangent at arc length d. */
function at(P: readonly TrailPt[], s: readonly number[], d: number) {
  let i = 1;
  while (i < P.length - 1 && s[i] < d) i++;
  const k = clamp((d - s[i - 1]) / Math.max(1e-6, s[i] - s[i - 1]));
  const dx = P[i].x - P[i - 1].x, dy = P[i].y - P[i - 1].y, l = Math.hypot(dx, dy) || 1;
  return { x: lerp(P[i - 1].x, P[i].x, k), y: lerp(P[i - 1].y, P[i].y, k), tx: dx / l, ty: dy / l };
}

/** The path cut at arc length d (head = last point). */
function cut(P: readonly TrailPt[], s: readonly number[], d: number): { pts: TrailPt[]; s: number[] } {
  const pts: TrailPt[] = [], ss: number[] = [];
  for (let i = 0; i < P.length && s[i] < d; i++) {
    pts.push(P[i]);
    ss.push(s[i]);
  }
  const h = at(P, s, d);
  pts.push({ x: h.x, y: h.y });
  ss.push(d);
  return { pts, s: ss };
}

/** A filled band along P with per-point widths W (round ends). */
function band(ctx: CanvasRenderingContext2D, P: readonly TrailPt[], W: readonly number[], color: string, alpha: number) {
  const n = P.length;
  if (n < 2 || alpha <= 0) return;
  const L: [number, number][] = [], R: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)];
    const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l, ny = dx / l, hw = W[i] / 2;
    L.push([P[i].x + nx * hw, P[i].y + ny * hw]);
    R.push([P[i].x - nx * hw, P[i].y - ny * hw]);
  }
  ctx.globalAlpha = clamp(alpha);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(L[0][0], L[0][1]);
  for (let i = 1; i < n; i++) ctx.lineTo(L[i][0], L[i][1]);
  for (let i = n - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]);
  ctx.closePath();
  ctx.fill();
  for (const i of [0, n - 1]) {
    ctx.beginPath();
    ctx.arc(P[i].x, P[i].y, W[i] / 2, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- the geometry of the frame at time t

interface Geo {
  key: No10Key;
  /** Panel offsets (slam-in, jolts). */
  ax: number;
  ay: number;
  bx: number;
  by: number;
  /** No.10's tapped eye (the stroke's root, the needle pupil, the iris), his other eye, the fingertip. */
  eye: [number, number];
  eye2: [number, number];
  tip: [number, number];
  /** No.7's eyes (screen-left / screen-right: the landing point is his left eye, screen-right). */
  n7L: [number, number];
  n7R: [number, number];
  /** The full path (eye -> fingertip -> apex -> dive -> No.7's eye), its arc lengths and total length. */
  P: TrailPt[];
  s: number[];
  L: number;
  /** Arc length of the head (0 before the stroke is born, L once it has landed). */
  head: number;
  /** Arc length at the apex (the hang). */
  sApex: number;
}

/** Arc-length progress of the stroke head (fractions of the path): born at the glint, rides the fingertip, thrown. */
function headFrac(t: number, uF: number, uA: number): number {
  if (t < T_GLINT) return 0;
  if (t < T_THROW) return uF * ease.outQuad((t - T_GLINT) / (T_THROW - T_GLINT));
  // Launch fast out of the fingertip and slow into a short hang over the top of the frame ...
  if (t < T_HANG) return lerp(uF, uA, ease.outQuad((t - T_THROW) / (T_HANG - T_THROW)));
  // ... then whip down like a needle (accelerating) into No.7's eye.
  if (t < T_LAND) return lerp(uA, 1, ease.inCubic((t - T_HANG) / (T_LAND - T_HANG)));
  return 1;
}

function geo(env: Env, t: number): Geo {
  const key = seqAt(SEQ, t);
  const sl = 1 - ease.outExpo(clamp((t + 0.015) / 0.175));
  // Panel B jolts when the needle lands; panel A kicks on the tap.
  const jB = t >= T_LAND ? Math.exp(-(t - T_LAND) / 0.07) : 0;
  const jA = t >= T_TAP ? Math.exp(-(t - T_TAP) / 0.06) : 0;
  const ax = -300 * sl + 2 * jA * Math.sin((t - T_TAP) * 90);
  const ay = 200 * sl;
  const bx = 300 * sl + 4 * jB * Math.sin((t - T_LAND) * 110);
  const by = -200 * sl + 3 * jB * Math.cos((t - T_LAND) * 95);
  const pt = (k: No10Key, name: string) => no10Point(env, k, name, C10[0] + ax, C10[1] + ay, S10, { anchor: 'contact' });
  const eye = pt(key, 'eye');
  const eye2 = pt(key, 'eyeL');
  const tip = pt(key, 'fingertip');
  const F = pt('MS3', 'fingertip');
  const n7R: [number, number] = [EYES7[0] + bx + 6 * S7, EYES7[1] + by];
  const n7L: [number, number] = [EYES7[0] + bx - 6 * S7, EYES7[1] + by];
  // Born just above his tapped eye (the needle pupil stays visible), ends on the brow of No.7's eye, pointing in.
  const ctrl: [number, number][] = [[eye[0] + 1, eye[1] - 5], [F[0] - 2, F[1] + 2], APEX, DIVE, [n7R[0] - 3, n7R[1] - 8]];
  const P = catmull(ctrl, 12);
  const s = lengths(P);
  const L = s[s.length - 1];
  // Arc length of the fingertip and apex control points (sample indices 12 and 24).
  const uF = s[12] / L, uA = s[24] / L;
  return { key, ax, ay, bx, by, eye, eye2, tip, n7L, n7R, P, s, L, head: headFrac(t, uF, uA) * L, sApex: s[24] };
}

/**
 * The brush's width profile along the path (fraction 0..1): thin at his eye, the brief's 18 px body (44 px halo) over
 * the top, a needle at No.7 (the film's escalation: 18 here, 44 at the boot in shot 3, 75 in the ride).
 */
function prof(u: number): number {
  return 2.5 + 15.5 * smoothstep(0, 0.42, u) * (1 - smoothstep(0.72, 1, u));
}

// ---------------------------------------------------------------- the Meridian (shot 1's brush stroke)

interface SignStrokeOpts {
  t: number;
  /** 0..1 how much of the comet head is still on (1 in flight, fades after the landing). */
  comet: number;
  /** Canvas pluck (px) and its phase (the stroke breathes after the lock). */
  pluck?: { amp: number; phase: number };
  /** A pearl pulse travelling along the stroke (arc fraction 0..1), the reel through the needle's eye. */
  pulse?: number;
  /** Extra light (0..1): the title lock. */
  boost?: number;
}

/**
 * The Meridian as a brush stroke of light: ink under-stroke, emerald halo (2.4w, additive), jade body, mint inner,
 * dry-brush bristles with noise gaps, the pearl thread core with glints running toward the head, ink cross-stitches
 * every 68 px, stitch-hole stars every 34 px (pop as the head passes, then hold as dots), the comet head with the
 * pearl needle at its point. Returns the drawn points.
 */
function signStroke(ctx: CanvasRenderingContext2D, g: Geo, o: SignStrokeOpts): TrailPt[] {
  if (g.head <= 1) return [];
  const c = cut(g.P, g.s, g.head);
  let P = c.pts;
  if (o.pluck && o.pluck.amp > 0.05) P = pluckLine(P, { amp: o.pluck.amp, phase: o.pluck.phase, nodes: 1 });
  const ss = c.s;
  const n = P.length;
  const L = g.L, Lh = g.head;
  const boost = clamp(o.boost ?? 0);
  // Width per point: the profile plus the comet swelling near the head while it flies.
  const W = ss.map((d) => Math.max(prof(d / L), o.comet * 17 * Math.exp(-(Lh - d) / 38)));
  const inkW = W.map((w) => w + lerp(2, 8, clamp((w - 2.5) / 10)));
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  // Ink under-stroke (normal blend: the manga outline, so nothing blows out to flat white).
  band(ctx, P, inkW, HEX.ink, 1);
  // Emerald halo (additive, two soft layers = 2.4w at 0.35 overall).
  ctx.globalCompositeOperation = 'lighter';
  band(ctx, P, W.map((w) => w * 2.4), HEX.emerald, 0.2 + 0.1 * boost);
  band(ctx, P, W.map((w) => w * 1.6), HEX.emerald, 0.18 + 0.1 * boost);
  ctx.globalCompositeOperation = 'source-over';
  // Jade body and mint inner.
  band(ctx, P, W, HEX.jade, 1);
  band(ctx, P, W.map((w) => w * 0.5), HEX.mint, 0.9);
  // Dry-brush bristles just inside each edge, broken by hashed gaps (stable along the stroke).
  ctx.lineWidth = 1;
  for (const side of [-1, 1])
    for (let b = 0; b < 6; b++) {
      const off = (0.5 - (b / 6) * 0.24) * side;
      ctx.strokeStyle = b % 2 ? HEX.mint : HEX.jade;
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      let on = false;
      for (let i = 0; i < n; i++) {
        if (W[i] < 6) {
          on = false;
          continue;
        }
        const a = P[Math.max(0, i - 1)], bb = P[Math.min(n - 1, i + 1)];
        const dx = bb.x - a.x, dy = bb.y - a.y, l = Math.hypot(dx, dy) || 1;
        const x = P[i].x - (dy / l) * W[i] * off * 1.08, y = P[i].y + (dx / l) * W[i] * off * 1.08;
        const gap = hash(b * 31 + side * 7 + Math.floor(ss[i] / 11)) < 0.3;
        if (gap) on = false;
        else if (!on) {
          ctx.moveTo(x, y);
          on = true;
        } else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  ctx.globalAlpha = 1;
  // The pearl thread core.
  band(ctx, P, W.map((w) => clamp(w * 0.22, 1, 3.2)), HEX.pearl, 1);
  // Glints running along the thread toward No.7 (the promise travels).
  ctx.globalCompositeOperation = 'lighter';
  const ps = lengths(P), PL = ps[ps.length - 1];
  for (let k = 0; k < 4; k++) {
    const d = (((o.t * 300 + k * PL * 0.25) % Math.max(1, PL)) + PL) % Math.max(1, PL);
    const q = at(P, ps, d);
    drawGlow(ctx, glowOf(PAL.pearl), q.x, q.y, 4 + prof(d / L) * 0.25, 0.7);
  }
  if (o.pulse !== undefined && o.pulse >= 0 && o.pulse <= 1) {
    const q = at(P, ps, o.pulse * PL);
    // Running into the needle's eye (from T_THREAD) the bead swells, so the light visibly pours into the pupil.
    const big = o.t >= T_THREAD;
    drawGlow(ctx, glowOf(PAL.mint), q.x, q.y, big ? 48 : 34, 0.6);
    drawGlow(ctx, glowOf(PAL.pearl), q.x, q.y, big ? 18 : 14, 1);
  }
  ctx.globalCompositeOperation = 'source-over';
  // Ink cross-stitches across the fat part of the body.
  ctx.strokeStyle = HEX.ink;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  for (let d = 34; d < PL - 12; d += 68) {
    const q = at(P, ps, d);
    const w = prof(d / L);
    if (w < 9) continue;
    const r = w * 0.24;
    ctx.moveTo(q.x - (q.tx + q.ty) * r, q.y - (q.ty - q.tx) * r);
    ctx.lineTo(q.x + (q.tx + q.ty) * r, q.y + (q.ty - q.tx) * r);
    ctx.moveTo(q.x - (q.tx - q.ty) * r, q.y - (q.ty + q.tx) * r);
    ctx.lineTo(q.x + (q.tx - q.ty) * r, q.y + (q.ty + q.tx) * r);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
  // Stitch-hole stars: pop as the head passes, then hold as 2 px pearl dots.
  for (let d = 68; d < PL - 6; d += 34) {
    const q = at(P, ps, d);
    const behind = PL - d;
    if (o.comet > 0.02 && behind < 80) sparkle(ctx, q.x, q.y, lerp(10, 5, behind / 80), 0.95, Math.PI / 4);
    else {
      ctx.fillStyle = HEX.pearl;
      ctx.fillRect(Math.round(q.x - 1), Math.round(q.y - 1), 2, 2);
    }
  }
  // The comet head and its pearl needle (in flight).
  if (o.comet > 0.02) {
    const h = P[n - 1], q = at(P, ps, PL);
    const r = 9 * o.comet;
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.emerald), h.x, h.y, 46 * o.comet, 0.75);
    drawGlow(ctx, glowOf(PAL.jade), h.x, h.y, 22 * o.comet, 0.7);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = HEX.mint;
    ctx.beginPath();
    ctx.arc(h.x, h.y, r * 0.55, 0, TAU);
    ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.pearl), h.x, h.y, 12 * o.comet, 1);
    ctx.globalCompositeOperation = 'source-over';
    needlePoint(ctx, h.x + q.tx * 7, h.y + q.ty * 7, Math.atan2(q.ty, q.tx), o.comet, 18);
    // The hang over the stadium reads as intent: a held pearl star at the head, shimmering, before the dive.
    if (o.t > 0.5 && o.t < T_HANG) sparkle(ctx, h.x, h.y, 14 + 4 * Math.sin(o.t * 60), 0.9);
  }
  ctx.restore();
  return P;
}

// ---------------------------------------------------------------- needle eyes, glints

/**
 * No.10's needle pupil at 5x: a vertical jade vesica (ink rim, mint spine, pearl glint) narrowing from a round pupil
 * (k 0) to a needle (k 1). s = scale (1 at the panel's 5x; the camera push enlarges it with the world).
 */
function eyePupil(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, k: number) {
  const kk = clamp(k);
  if (kk <= 0) return;
  const hh = 8 * s, ww = lerp(6, 3.2, kk) * s;
  const ves = (w: number, h: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y - h);
    ctx.quadraticCurveTo(x + w * 2, y, x, y + h);
    ctx.quadraticCurveTo(x - w * 2, y, x, y - h);
    ctx.closePath();
  };
  ctx.save();
  ctx.globalAlpha = clamp(kk * 3);
  ctx.fillStyle = HEX.ink;
  ves(ww + 1.5 * s, hh + 1.5 * s);
  ctx.fill();
  ctx.fillStyle = HEX.jade;
  ves(ww, hh);
  ctx.fill();
  ctx.fillStyle = HEX.mint;
  ctx.fillRect(x - 0.5 * s, y - hh * 0.6, 1 * s, hh * 1.2);
  ctx.fillStyle = HEX.pearl;
  ctx.fillRect(Math.round(x - 3 * s), Math.round(y - 5 * s), Math.max(2, Math.round(2 * s)), Math.max(2, Math.round(2 * s)));
  ctx.restore();
}

/** The eye glint: a pearl 4-point star with a jade anamorphic streak (never a white blow-out over the face). */
function jadeGlint(ctx: CanvasRenderingContext2D, x: number, y: number, k: number, t: number) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(JADE_FLARE), x, y, 150 * k, 0.35 * k, 9, 0.1);
  drawGlow(ctx, glowOf(PAL.jade), x, y, 34 * k, 0.5 * k);
  drawGlow(ctx, glowOf(PAL.pearl), x, y, 6, 0.7 * k);
  ctx.restore();
  sparkle(ctx, x, y, 12 + 26 * k, 0.85 * k, t * 2.2);
}

// ---------------------------------------------------------------- the black ink page

function page(ctx: CanvasRenderingContext2D, t: number, rng: Rng, energy: number) {
  const X0 = -120, Y0 = -120, WW = VW + 240, HH = VH + 240;
  // The burst: [2,12,9] at the edges to [20,90,60] at the apex point.
  const g = ctx.createRadialGradient(BURST[0], BURST[1], 8, BURST[0], BURST[1], 560);
  g.addColorStop(0, css(PAL.emerald.map((v, i) => lerp([20, 90, 60][i], v, 0.25 * energy))));
  g.addColorStop(0.2, `rgb(${lerp(8, 12, energy) | 0},${lerp(40, 58, energy) | 0},${lerp(27, 38, energy) | 0})`);
  g.addColorStop(0.55, 'rgb(3,16,11)');
  g.addColorStop(1, 'rgb(2,12,9)');
  ctx.fillStyle = g;
  ctx.fillRect(X0, Y0, WW, HH);
  // 24 emerald wedges turning at 0.4 rad/s.
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = css(PAL.emerald, 0.07 + 0.06 * energy);
  ctx.beginPath();
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * TAU + t * 0.4;
    ctx.moveTo(BURST[0], BURST[1]);
    ctx.lineTo(BURST[0] + Math.cos(a) * 900, BURST[1] + Math.sin(a) * 900);
    ctx.lineTo(BURST[0] + Math.cos(a + 0.07) * 900, BURST[1] + Math.sin(a + 0.07) * 900);
    ctx.closePath();
  }
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  // Focus lines, layer 1: 90 ink spears (rotating 0.1 rad/s, a frame-stable flicker in length and width).
  ctx.fillStyle = HEX.ink;
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  for (let k = 0; k < 90; k++) {
    const a = (k / 90) * TAU + t * 0.1 + hash(k) * 0.05;
    const r0 = 70 + hash(k + 9) * 90 + rng.next() * 24, w = (0.004 + hash(k + 3) * 0.008) * (0.8 + rng.next() * 0.4);
    ctx.moveTo(BURST[0] + Math.cos(a) * r0, BURST[1] + Math.sin(a) * r0);
    ctx.lineTo(BURST[0] + Math.cos(a - w) * 900, BURST[1] + Math.sin(a - w) * 900);
    ctx.lineTo(BURST[0] + Math.cos(a + w) * 900, BURST[1] + Math.sin(a + w) * 900);
    ctx.closePath();
  }
  ctx.fill();
  // Focus lines, layer 2: 40 with jade tips (the tip end lit, the tail in ink).
  ctx.globalAlpha = 1;
  for (let k = 0; k < 40; k++) {
    const a = (k / 40) * TAU - t * 0.1 + hash(k + 50) * 0.08;
    const r0 = 60 + hash(k + 70) * 120 - energy * 20 + rng.next() * 18;
    const r1 = r0 + 60 + hash(k + 90) * 60;
    const w = 0.006 + hash(k + 33) * 0.006;
    const x0 = BURST[0] + Math.cos(a) * r0, y0 = BURST[1] + Math.sin(a) * r0;
    ctx.fillStyle = HEX.ink;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(BURST[0] + Math.cos(a - w) * 900, BURST[1] + Math.sin(a - w) * 900);
    ctx.lineTo(BURST[0] + Math.cos(a + w) * 900, BURST[1] + Math.sin(a + w) * 900);
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = css(PAL.jade, 0.55 + 0.35 * energy);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(BURST[0] + Math.cos(a) * r1, BURST[1] + Math.sin(a) * r1);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }
  // Jade speed streaks at -18 deg (flowing up-right: the direction of the pass), alpha 0.5.
  streaks(ctx, t, X0, Y0, WW, HH, 34, 0.5, 0);
  // Screentone in the corners (emerald dots on the ink).
  screentone(ctx, [-60, -60, VW + 120, VH + 120], 5, 0.45, { color: [9, 46, 30], corners: 0.55 });
}

/** Jade speed streaks at -18 deg, moving with t (pure function of t). */
function streaks(ctx: CanvasRenderingContext2D, t: number, x0: number, y0: number, w: number, h: number, n: number, alpha: number, salt: number) {
  const ang = (-18 * Math.PI) / 180, dx = Math.cos(ang), dy = Math.sin(ang);
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for (let k = 0; k < n; k++) {
    const sp = 500 + hash(k + salt) * 700;
    const len = 30 + hash(k + salt + 11) * 90;
    const span = w + 300;
    const along = ((hash(k + salt + 23) * span + t * sp) % span) - 150;
    const across = hash(k + salt + 37) * h;
    const x = x0 + along * dx;
    const y = y0 + across + along * dy;
    ctx.strokeStyle = css(k % 3 ? PAL.jade : PAL.mint, alpha * (0.35 + 0.65 * hash(k + salt + 51)));
    ctx.lineWidth = hash(k + salt + 61) < 0.2 ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx * len, y + dy * len);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
}

/** Focus lines inside a panel, converging on (cx, cy): ink spears, with jade glints when `lit`. */
function panelFocus(ctx: CanvasRenderingContext2D, cx: number, cy: number, n: number, r0: number, rng: Rng, lit: number, salt: number) {
  ctx.fillStyle = HEX.ink;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  for (let k = 0; k < n; k++) {
    const a = (k / n) * TAU + hash(k + salt) * 0.12;
    const rr = r0 + hash(k + salt + 5) * r0 * 0.8 + rng.next() * 14, w = 0.006 + hash(k + salt + 9) * 0.01;
    ctx.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    ctx.lineTo(cx + Math.cos(a - w) * 700, cy + Math.sin(a - w) * 700);
    ctx.lineTo(cx + Math.cos(a + w) * 700, cy + Math.sin(a + w) * 700);
    ctx.closePath();
  }
  ctx.fill();
  ctx.globalAlpha = 1;
  if (lit > 0.01) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = 1.5;
    for (let k = 0; k < n; k += 2) {
      const a = (k / n) * TAU + hash(k + salt) * 0.12 + 0.03;
      const rr = r0 * 0.9 + hash(k + salt + 5) * r0 * 0.6 + rng.next() * 10;
      ctx.strokeStyle = css(PAL.jade, lit * (0.4 + 0.5 * hash(k + salt + 77)));
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      ctx.lineTo(cx + Math.cos(a) * (rr + 50 + 50 * hash(k + 3)), cy + Math.sin(a) * (rr + 50 + 50 * hash(k + 3)));
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
  }
}

// ---------------------------------------------------------------- No.7's face crop (panel B)

/** No.7's front head (neutral: Idle Front; grin: Point Q2; blink: Q2b) with its eye midpoint (art px) for the crop. */
function no7Face(t: number): { a: StudioAnim; i: number; mid: [number, number] } | null {
  const grin = t >= T_GRIN;
  const blink = t >= 1.1 && t < 1.18;
  if (grin) {
    const a = no7Anim('Point');
    if (a) {
      const i = blink ? findFrame(a, 'Q2b', 'Q2') : findFrame(a, 'Q2');
      if (i >= 0) return { a, i, mid: [67, 27] };
    }
  }
  if (hasAnim('No7Idle')) {
    const a = anim('No7Idle');
    const i = findFrame(a, 'Front');
    if (i >= 0) return { a, i, mid: [65, 27] };
  }
  return null;
}

function drawNo7Face(env: Env, t: number, x: number, y: number) {
  const f = no7Face(t);
  if (f) drawAnim(env.ctx, f.a, null, f.i, x, y, S7, { pivot: f.mid });
  else drawNo7(env, t >= T_GRIN ? 'Point.Q2' : 'Point.Q1', x, y + 14 * S7, S7, { anchor: 'head' });
}

// ---------------------------------------------------------------- the title

/** Letter widths (measured every call: a cache taken before the title font loads would keep the fallback's widths). */
function measureTitle(ctx: CanvasRenderingContext2D): number[] {
  ctx.save();
  ctx.font = `${TITLE_SIZE}px ${TITLE_FONT}`;
  const w = [...SHOT_NAME].map((c) => ctx.measureText(c).width + TITLE_SIZE * 0.025);
  ctx.restore();
  return w;
}

/** Title placement: the baseline-left point and each letter's centre offset along the baseline. */
function titleLayout(ctx: CanvasRenderingContext2D) {
  const w = measureTitle(ctx);
  const total = w.reduce((a, b) => a + b, 0);
  const mids: number[] = [];
  let x = -total / 2;
  for (const ww of w) {
    mids.push(x + ww / 2);
    x += ww;
  }
  return { w, total, mids };
}

/** The needle's run along the baseline (offset from the title centre), 0.64 -> 1.00. */
function needleRun(total: number, t: number) {
  const x0 = -total / 2 - 30, x1 = total / 2 + 22;
  return { x: lerp(x0, x1, clamp((t - T_RUN) / (T_LOCK - T_RUN))), speed: (x1 - x0) / (T_LOCK - T_RUN), x0, x1 };
}

/** World point of a title-local point (before the lock's slam scale). */
function titleWorld(lx: number, ly: number): [number, number] {
  const c = Math.cos(TITLE_ANG), s = Math.sin(TITLE_ANG);
  return [TITLE_C[0] + lx * c - ly * s, TITLE_C[1] + lx * s + ly * c];
}

/**
 * 0.58-0.64: the pearl needle peels off the stroke's apex as the head dives, swings left over his head (clear of his
 * face) and drops down the left of panel A onto the title's start (outCubic), pulling a pearl thread that joins the
 * title's running stitch; the thread fades 0.64-0.78.
 */
function titleDrop(ctx: CanvasRenderingContext2D, g: Geo, t: number) {
  if (t < T_TITLE || t > T_RUN + 0.14 || g.sApex <= 0) return;
  const A = at(g.P, g.s, g.sApex);
  const { total } = titleLayout(ctx);
  const E = titleWorld(-total / 2 - 30, 6);
  const C: [number, number] = [-30, -30];
  const bz = (u: number): TrailPt => {
    const a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u;
    return { x: a * A.x + b * C[0] + c * E[0], y: a * A.y + b * C[1] + c * E[1] };
  };
  const k = ease.outCubic(clamp((t - T_TITLE) / (T_RUN - T_TITLE)));
  const fade = 1 - clamp((t - T_RUN) / 0.14);
  const pts: TrailPt[] = [];
  const N = 40;
  for (let i = 0; i <= N; i++) {
    const u = (i / N) * k;
    pts.push(bz(u));
  }
  threadLine(ctx, pts, 2, fade, { halo: 1.3 });
  if (t < T_RUN) {
    const h = pts[pts.length - 1], q = pts[pts.length - 2];
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.jade), h.x, h.y, 18, 0.85);
    drawGlow(ctx, glowOf(PAL.pearl), h.x, h.y, 6, 0.9);
    ctx.restore();
    needlePoint(ctx, h.x, h.y, Math.atan2(h.y - q.y, h.x - q.x), 1, 22);
  }
  // Where it leaves the stroke: a small pearl star at the apex.
  sparkle(ctx, A.x, A.y, lerp(16, 6, clamp((t - T_TITLE) / 0.1)), fade * (1 - clamp((t - T_TITLE) / 0.16)), Math.PI / 4);
}

function drawTitle(ctx: CanvasRenderingContext2D, t: number, rng: Rng) {
  if (t < T_RUN) return;
  const { total, mids } = titleLayout(ctx);
  const run = needleRun(total, t);
  const lock = t >= T_LOCK ? clamp((t - T_LOCK) / 0.14) : -1;
  const slam = lock >= 0 ? lerp(1.32, 1, ease.outBack(lock)) : 1;
  const shake = lock >= 0 ? 3 * Math.exp(-(t - T_LOCK) / 0.06) : 0;
  ctx.save();
  ctx.translate(TITLE_C[0] + (rng.next() - 0.5) * shake, TITLE_C[1] + (rng.next() - 0.5) * shake);
  ctx.rotate(TITLE_ANG);
  ctx.scale(slam, slam);
  // The running stitch the needle leaves behind (snaps taut and flares on the lock).
  const end = Math.min(run.x, run.x1);
  const pts: TrailPt[] = [];
  const sag = lock >= 0 ? 0 : 1;
  for (let x = run.x0; x < end; x += 8) pts.push({ x, y: 6 + sag * 2 * Math.sin((x - run.x0) * 0.05 + t * 30) * clamp((end - x) / 60) });
  pts.push({ x: end, y: 6 });
  if (pts.length > 1) threadLine(ctx, pts, lock >= 0 ? 3 : 2, 1, { stitch: { dash: 13, dip: 7, phase: 0 }, halo: lock >= 0 ? 1.6 : 0.9 });
  // Letters: pearl fill (gradient), jade stroke, ink outer; each pops onto the line as the needle passes its centre.
  ctx.font = `${TITLE_SIZE}px ${TITLE_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  [...SHOT_NAME].forEach((c, i) => {
    if (c === ' ' || run.x < mids[i]) return;
    const lt = (run.x - mids[i]) / run.speed + Math.max(0, t - T_LOCK);
    const p = clamp(lt / 0.09);
    const sc = Math.max(0.001, ease.outBack(p));
    const dy = -10 * (1 - ease.outCubic(clamp(lt / 0.12)));
    ctx.save();
    ctx.translate(mids[i], dy);
    ctx.transform(1, 0, -0.16, 1, 0, 0);
    ctx.scale(sc, sc);
    ctx.globalAlpha = clamp(lt / 0.03);
    ctx.strokeStyle = HEX.ink;
    ctx.lineWidth = TITLE_SIZE * 0.26;
    ctx.strokeText(c, 0, 0);
    ctx.strokeStyle = HEX.emerald;
    ctx.lineWidth = TITLE_SIZE * 0.17;
    ctx.strokeText(c, 0, 0);
    ctx.strokeStyle = HEX.jade;
    ctx.lineWidth = TITLE_SIZE * 0.1;
    ctx.strokeText(c, 0, 0);
    const gr = ctx.createLinearGradient(0, -TITLE_SIZE * 0.78, 0, 0);
    gr.addColorStop(0, '#ffffff');
    gr.addColorStop(0.5, HEX.pearl);
    gr.addColorStop(1, '#bfeed2');
    ctx.fillStyle = gr;
    ctx.fillText(c, 0, 0);
    // A white-hot pop as it lands, and again on the lock.
    const hot = Math.max(1 - p, lock >= 0 ? 1 - clamp((t - T_LOCK) / 0.1) : 0);
    if (hot > 0) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = hot * 0.75;
      ctx.fillStyle = HEX.mint;
      ctx.fillText(c, 0, 0);
    }
    ctx.restore();
  });
  // The pearl needle on its run (it rides off the end of the line at the lock).
  if (t < T_LOCK + 0.05) {
    const nx = run.x + (t > T_LOCK ? (t - T_LOCK) * 900 : 0);
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.jade), nx, 6, 16, 0.8);
    ctx.globalCompositeOperation = 'source-over';
    needlePoint(ctx, nx, 6, 0, 1, 22);
  }
  ctx.restore();
  // The tag types in under it.
  if (t >= T_LOCK) {
    const nChars = Math.floor((t - T_LOCK) / 0.0065);
    const txt = TAG.slice(0, Math.min(TAG.length, nChars));
    if (txt) {
      ctx.save();
      ctx.translate(TITLE_C[0], TITLE_C[1] + 12);
      ctx.rotate(TITLE_ANG);
      ctx.fillStyle = 'rgba(6,20,15,0.85)';
      ctx.font = `12px "Silkscreen", "Press Start 2P", monospace`;
      const tw = ctx.measureText(TAG).width;
      ctx.fillRect(-tw / 2 - 8, -1, tw + 16, 17);
      ctx.fillStyle = HEX.jade;
      ctx.fillRect(-tw / 2 - 8, -1, 3, 17);
      pixelText(ctx, txt, -tw / 2, 1, 12, HEX.pearl, 'left', HEX.ink);
      ctx.restore();
    }
  }
}

/** World position of the title's letter i centre (for the lock sparks). */
function titlePoint(ctx: CanvasRenderingContext2D, i: number): [number, number] {
  const { mids } = titleLayout(ctx);
  return titleWorld(mids[i], -TITLE_SIZE * 0.35);
}

// ---------------------------------------------------------------- the needle's-eye iris (2a's opening still inside it)

// The still is shot 2's own first picture (loomStill: backdrop2a at t 0 and the GZ3 bust), cached in prepare(), so the
// eye opens onto exactly the frame shot 2 starts on.

/** The needle's-eye iris: a vertical vesica grown from the pupil to cover the frame, 2a's still inside it. Screen space. */
function iris(ctx: CanvasRenderingContext2D, cx: number, cy: number, p: number, t: number) {
  // Opens slowly round the pupil while the camera pushes in, then races out to cover the frame. On the last frame drawn
  // (t = 1.40 - 1/60, p 0.88) the half-width is ~326: where shot 2's first frame has it (330, the rim grazing the frame
  // corners) before it slides the rim off.
  const e = Math.pow(clamp(p), 2.4);
  const a = lerp(4, 440, e), b = a * 3;
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
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(still, 0, 0, VW, VH);
  } else {
    ctx.fillStyle = HEX.night;
    ctx.fillRect(0, 0, VW, VH);
  }
  ctx.restore();
  // The rim: ink line, 6 px jade, a pearl glint running round it.
  ctx.lineJoin = 'round';
  ctx.strokeStyle = HEX.ink;
  ctx.lineWidth = 10;
  path();
  ctx.stroke();
  ctx.strokeStyle = HEX.jade;
  ctx.lineWidth = 6;
  path();
  ctx.stroke();
  ctx.strokeStyle = HEX.mint;
  ctx.lineWidth = 1.5;
  path();
  ctx.stroke();
  const ang = e * TAU * 1.5;
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.pearl), cx + Math.sin(ang) * a, cy - Math.cos(ang) * b * 0.9, 12, 0.9);
  drawGlow(ctx, glowOf(PAL.jade), cx, cy, a * 0.5 + 10, 0.35 * (1 - e));
  ctx.restore();
}

// ---------------------------------------------------------------- camera

/** Base zoom (before the iris push): the slam settle, 1.00 -> 1.06 outSine, punches on the tap / landing / lock. */
function baseZoom(t: number) {
  const settle = 0.08 * (1 - ease.outExpo(clamp(t / 0.16)));
  return keys([[0, 1], [T_PUSH, 1.06, 'outSine']], t) + settle + punch(t, T_TAP, 0.07, 0.03, 0.18) + punch(t, T_LAND, 0.035, 0.03, 0.22) + punch(t, T_LOCK, 0.05, 0.04, 0.26);
}
/** The look after the stroke: drift up-right with its flight, back as the title locks. */
function drift(t: number): [number, number] {
  return [
    keys([[0.34, 0], [0.62, 12, 'inOutSine'], [0.8, 19, 'outSine'], [1.2, 8, 'inOutSine']], t),
    keys([[0.34, 0], [0.6, -13, 'inOutSine'], [0.82, -5, 'inOutSine'], [1.2, 2, 'inOutSine']], t),
  ];
}

function camera(env: Env, t: number, eye: [number, number]) {
  const cam = env.cam;
  if (t < T_PUSH) {
    const [dx, dy] = drift(t);
    zoomAbout(cam, VW / 2 + dx, VH / 2 + dy, VW / 2, VH / 2, baseZoom(t));
    return;
  }
  // The needle's-eye push: 1.06 -> 2.0 onto his pupil, which slides to the frame centre (inOutCubic).
  const z0 = baseZoom(T_PUSH);
  const [dx, dy] = drift(T_PUSH);
  const sx0 = VW / 2 + (eye[0] - (VW / 2 + dx)) * z0, sy0 = VH / 2 + (eye[1] - (VH / 2 + dy)) * z0;
  const u = ease.inOutCubic(clamp((t - T_PUSH) / (META.dur - T_PUSH)));
  zoomAbout(cam, eye[0], eye[1], lerp(sx0, VW / 2, u), lerp(sy0, VH / 2, u), lerp(z0, 2.0, u));
}

/** World point -> screen px under the current camera (no shake). */
function toScreen(env: Env, x: number, y: number): [number, number] {
  const [u, v] = env.cam.toUV(x, y);
  return [u * VW, v * VH];
}

// ---------------------------------------------------------------- the shot

export const shotSign: Shot = {
  name: META.name,
  dur: META.dur,
  seed: META.seed,
  rate: RATE[1],
  cues: [
    { at: 0, fn: (e) => { e.sfx.bow(146.83, 1.4, 0.22); e.sfx.crowd(1.4, 0.1); } },
    { at: T_SLAM, fn: (e) => { e.sfx.kick(0.4); e.sfx.boom(0.4); e.cam.shakeAmp = 10; e.cam.hit(0.25); } },
    { at: T_TAP, fn: (e) => { e.sfx.tick(0.8); e.cam.hit(0.12); } },
    { at: T_GLINT, fn: (e) => { e.sfx.tick(); e.sfx.shing(1.2); } },
    { at: T_THROW, fn: (e) => { e.sfx.whoosh(0.34, 400, 2400, 0.4); e.cam.shove(5, -4); } },
    ...[0, 1, 2, 3, 4, 5, 6].map((k) => ({ at: +(0.66 + k * 0.054).toFixed(3), fn: (e: Env) => e.sfx.tick(0.2) })),
    { at: T_LAND, fn: (e) => { e.sfx.pluck(659.26); e.cam.hit(0.18); e.cam.shove(4, 3); } },
    { at: T_GRIN, fn: (e) => e.sfx.pluck(880) },
    { at: T_LOCK, fn: (e) => { e.sfx.twang(0.5); e.sfx.boom(0.6); e.sfx.strum([293.66, 369.99, 440, 587.33], 0.02); e.cam.hit(0.3); } },
    { at: 1.24, fn: (e) => e.sfx.zip(0.16, 600, 5000, 0.4) },
  ],
  prepare(env) {
    warmMeridian(env);
    still = loomStill(env);
    stillS = env.S || 1;
  },
  init(env) {
    env.sfx.clearBus();
    env.cam.set(VW / 2, VH / 2, 1, 0);
    env.cam.shakeRoll = 0.015;
    env.cam.shakeAmp = 10;
    fired.slam = fired.tap = fired.glint = fired.land = fired.lock = false;
  },
  update(env, t) {
    const rng = env.rng;
    const P = env.parts;
    // Jade motes rising behind the panels (2 per frame).
    for (let k = 0; k < 2; k++)
      P.spawn({
        kind: PK.Glow, x: rng.range(-20, VW + 20), y: VH + 10, vx: rng.range(-10, 30), vy: rng.range(-110, -50), max: rng.range(1.2, 2.4),
        s0: rng.range(2, 5), s1: 1, ramp: 'jade', r0: 0.2, r1: 0.8, a0: 0.8, a1: 0, layer: 0,
      });
    const g = geo(env, t);
    if (!fired.slam && t >= T_SLAM) {
      fired.slam = true;
      // Ink flecks and light-stitches knocked off where the two panels land.
      for (let k = 0; k < 18; k++) {
        const a = rng.range(0, TAU), sp = rng.range(120, 420);
        P.spawn({ kind: PK.Stitch, x: 382, y: 150, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 3, max: rng.range(0.25, 0.5), s0: rng.range(4, 7), s1: 3, ramp: 'jade', r0: 0.1, r1: 0.9, a0: 1, a1: 0, add: false });
      }
    }
    if (!fired.tap && t >= T_TAP) {
      fired.tap = true;
      for (let k = 0; k < 10; k++) {
        const a = rng.range(-Math.PI, 0), sp = rng.range(60, 200);
        P.spawn({ kind: PK.Pixel, x: g.tip[0], y: g.tip[1], vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 4, max: rng.range(0.25, 0.45), s0: 2, s1: 1, ramp: 'jade', r0: 0, r1: 0.8, a0: 1, a1: 0 });
      }
    }
    if (!fired.glint && t >= T_GLINT) {
      fired.glint = true;
      for (let k = 0; k < 14; k++) {
        const a = rng.range(0, TAU), sp = rng.range(80, 260);
        P.spawn({ kind: PK.Streak, x: g.eye[0], y: g.eye[1], vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 4, max: rng.range(0.2, 0.4), s0: 1.5, s1: 0.5, ramp: 'jade', r0: 0, r1: 0.9, k: 1.2 });
      }
    }
    // The comet sheds sparks, light-stitches and jade droplets while it flies.
    if (t >= T_GLINT && t < T_LAND && g.head > 4) {
      const h = at(g.P, g.s, g.head);
      const back = Math.atan2(-h.ty, -h.tx);
      for (let k = 0; k < 3; k++) {
        const a = back + rng.range(-0.9, 0.9), sp = rng.range(80, 320);
        P.spawn({ kind: PK.Streak, x: h.x, y: h.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp + 40, drag: 3, ay: 160, max: rng.range(0.2, 0.5), s0: rng.range(1, 2.2), s1: 0.4, ramp: 'jade', r0: 0, r1: 1, k: 1.3 });
      }
      if (rng.next() < 0.7) {
        const a = back + rng.range(-0.5, 0.5), sp = rng.range(60, 200);
        P.spawn({ kind: PK.Stitch, x: h.x, y: h.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 2.5, max: rng.range(0.3, 0.6), s0: rng.range(4, 6), s1: 3, ramp: 'jade', r0: 0.1, r1: 0.9, a0: 1, a1: 0, add: false });
      }
      // Droplets flicked off the brush (fall with gravity).
      if (rng.next() < 0.5) {
        const a = back + Math.PI / 2 * (rng.next() < 0.5 ? -1 : 1) + rng.range(-0.4, 0.4), sp = rng.range(40, 140);
        P.spawn({ kind: PK.Glow, x: h.x, y: h.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, ay: 420, drag: 1, max: rng.range(0.35, 0.6), s0: rng.range(2, 3.5), s1: 1, ramp: 'jade', r0: 0.15, r1: 0.6, a0: 1, a1: 0 });
      }
    }
    if (!fired.land && t >= T_LAND) {
      fired.land = true;
      // The needle pierces No.7's eye: a burst back up the stroke and out across panel B.
      const h = at(g.P, g.s, g.L - 0.5);
      const back = Math.atan2(-h.ty, -h.tx);
      for (let k = 0; k < 30; k++) {
        const a = back + rng.range(-1.4, 1.4), sp = rng.range(140, 460);
        P.spawn({ kind: PK.Streak, x: g.n7R[0], y: g.n7R[1], vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 3.5, ay: 200, max: rng.range(0.25, 0.6), s0: rng.range(1.2, 2.4), s1: 0.4, ramp: 'jade', r0: 0, r1: 1, k: 1.2 });
      }
      for (let k = 0; k < 16; k++) {
        const a = rng.range(0, TAU), sp = rng.range(100, 300);
        P.spawn({ kind: PK.Stitch, x: g.n7R[0], y: g.n7R[1], vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 2.5, max: rng.range(0.3, 0.6), s0: rng.range(4, 7), s1: 3, ramp: 'jade', r0: 0.05, r1: 0.9, a0: 1, a1: 0, add: false });
      }
    }
    if (!fired.lock && t >= T_LOCK) {
      fired.lock = true;
      // 24 jade sparks off the title, 16 light-stitches.
      const ctx = env.ctx;
      for (let k = 0; k < 24; k++) {
        const i = Math.floor(rng.next() * SHOT_NAME.length);
        const [x, y] = titlePoint(ctx, i);
        const a = -Math.PI / 2 + rng.range(-1.1, 1.1), sp = rng.range(180, 480);
        P.spawn({ kind: PK.Streak, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 3, ay: 260, max: rng.range(0.3, 0.6), s0: rng.range(1.2, 2.4), s1: 0.4, ramp: 'jade', r0: 0, r1: 1, k: 1.3 });
      }
      for (let k = 0; k < 16; k++) {
        const [x, y] = titlePoint(ctx, Math.floor(rng.next() * SHOT_NAME.length));
        const a = rng.range(0, TAU), sp = rng.range(80, 260);
        P.spawn({ kind: PK.Stitch, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 2.5, max: rng.range(0.3, 0.55), s0: rng.range(4, 6), s1: 3, ramp: 'jade', r0: 0.05, r1: 0.9, a0: 1, a1: 0, add: false });
      }
    }
  },
  render(env, t) {
    const { ctx, fx } = env;
    const rng = env.frng(11);
    if (!still) {
      still = loomStill(env);
      stillS = env.S || 1;
    }
    const g = geo(env, t);
    camera(env, t, g.eye);
    env.world();
    ctx.imageSmoothingEnabled = false;

    // Energy of the page: the throw, the landing, the lock (the lock's share is small: its energy is the title's light).
    const fly = t >= T_THROW && t < T_LAND + 0.1 ? 1 : 0;
    const energy = clamp(fly * 0.6 + (t >= T_LAND ? Math.exp(-(t - T_LAND) / 0.2) : 0) + (t >= T_LOCK ? 0.25 * Math.exp(-(t - T_LOCK) / 0.18) : 0) + (t >= T_GLINT && t < T_THROW ? 0.3 : 0));
    page(ctx, t, rng, energy);
    env.parts.draw(ctx, 0);

    const sl = 1 - ease.outExpo(clamp((t + 0.015) / 0.175));
    // The slam's trailing speed lines (ink with jade edges) while the panels fly in from opposite corners.
    if (sl > 0.01) {
      ctx.save();
      for (const [poly, dx, dy] of [[POLY_A, g.ax, g.ay], [POLY_B, g.bx, g.by]] as const) {
        const len = Math.hypot(dx, dy) * 1.4 + 40, ux = -dx / (Math.hypot(dx, dy) || 1), uy = -dy / (Math.hypot(dx, dy) || 1);
        for (let k = 0; k < 14; k++) {
          const q = poly[k % 4], r = poly[(k + 1) % 4], f = hash(k + 3);
          const x = lerp(q[0], r[0], f) + dx, y = lerp(q[1], r[1], f) + dy;
          ctx.strokeStyle = k % 3 ? HEX.ink : HEX.jade;
          ctx.globalAlpha = 0.8 * sl;
          ctx.lineWidth = k % 3 ? 3 : 1.5;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + ux * len * (0.5 + f), y + uy * len * (0.5 + f));
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    const key = g.key;
    const blink = key === 'MS4b';
    // The needle pupils squeeze because of the tap.
    const pupK = blink ? 0 : clamp((t - T_TAP) / 0.12);
    const glint = t >= T_GLINT ? Math.exp(-(t - T_GLINT) / 0.16) : 0;
    const strokeLit = g.head > 1 ? 1 : 0;
    // ---- Panel A: No.10 chest-up, the needle eyes.
    const drawA = (c: CanvasRenderingContext2D) => {
      const fxA = g.eye[0] - g.ax, fyA = g.eye[1] - g.ay;
      const bg = c.createRadialGradient(fxA - 10, fyA - 20, 10, fxA, fyA, 320);
      bg.addColorStop(0, `rgb(${lerp(12, 26, energy) | 0},${lerp(54, 100, energy) | 0},${lerp(37, 66, energy) | 0})`);
      bg.addColorStop(0.4, 'rgb(5,22,15)');
      bg.addColorStop(1, 'rgb(2,8,6)');
      c.fillStyle = bg;
      c.fillRect(-40, -40, 480, 440);
      panelFocus(c, fxA, fyA, 64, 120, rng, 0.35 + glint * 0.6 + energy * 0.4, 100);
      streaks(c, t, -40, 0, 480, 380, 18, 0.28, 300);
      screentone(c, [10, 20, 380, 340], 4, 0.6, { color: [10, 46, 31], corners: 0.6 });
      // The burst's light behind his head.
      c.globalCompositeOperation = 'lighter';
      drawGlow(c, glowOf(PAL.emerald), fxA + 10, fyA - 30, 170, 0.35 + 0.25 * energy);
      c.globalCompositeOperation = 'source-over';
    };
    const drawA2 = () => {
      // Drawn in world space with the panel offset already applied by mangaPanels' translate.
      drawNo10(env, key, C10[0], C10[1], S10, { anchor: 'contact' });
      const e1 = no10Point(env, key, 'eyeR', C10[0], C10[1], S10, { anchor: 'contact' });
      const e2 = no10Point(env, key, 'eyeL', C10[0], C10[1], S10, { anchor: 'contact' });
      if (pupK > 0) {
        ctx.globalCompositeOperation = 'lighter';
        for (const [x, y] of [e1, e2]) drawGlow(ctx, glowOf(PAL.emerald), x, y, 16 + 14 * glint, 0.5 * pupK + 0.4 * glint);
        ctx.globalCompositeOperation = 'source-over';
        for (const [x, y] of [e1, e2]) eyePupil(ctx, x, y, 1, pupK);
      }
      // The stroke's light on his face where it is born.
      if (strokeLit) {
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, glowOf(PAL.jade), e1[0], e1[1] - 8, 30, 0.3);
        ctx.globalCompositeOperation = 'source-over';
      }
    };
    // ---- Panel B: No.7's face, his eyes.
    const drawB = (c: CanvasRenderingContext2D) => {
      const lit = t >= T_LAND ? Math.exp(-(t - T_LAND) / 0.25) : 0;
      const ex = EYES7[0], ey = EYES7[1];
      const bg = c.createRadialGradient(ex + 30, ey, 6, ex, ey, 220);
      bg.addColorStop(0, `rgb(${lerp(10, 60, lit) | 0},${lerp(46, 200, lit) | 0},${lerp(32, 130, lit) | 0})`);
      bg.addColorStop(0.5, 'rgb(4,18,13)');
      bg.addColorStop(1, 'rgb(2,8,6)');
      c.fillStyle = bg;
      c.fillRect(340, 0, 320, 230);
      panelFocus(c, ex + 30, ey, 40, 70, rng, 0.25 + lit, 200);
      drawNo7Face(env, t, ex, ey);
      // His pupils glint where the stitch lands (no needle shape: the needle eyes are No.10's).
      if (t >= T_LAND) {
        const k = Math.exp(-(t - T_LAND) / 0.3);
        for (const [x, y] of [[ex + 6 * S7, ey], [ex - 6 * S7, ey]] as const) {
          needlePupil(c, x, y, 12, 1, true);
          sparkle(c, x, y - 2, 8 + 10 * k, 0.5 + 0.5 * k, t * 3);
        }
        c.globalCompositeOperation = 'lighter';
        drawGlow(c, glowOf(PAL.jade), ex + 6 * S7, ey, 50, 0.6 * lit);
        c.globalCompositeOperation = 'source-over';
      }
    };
    mangaPanels(ctx, [
      { poly: POLY_A, border: 4, gutter: 3, fill: HEX.night, dx: g.ax, dy: g.ay, draw: (c) => { drawA(c); drawA2(); } },
      { poly: POLY_B, border: 4, gutter: 3, fill: HEX.night, dx: g.bx, dy: g.by, draw: (c) => drawB(c) },
    ]);
    // His pointing hand breaks out of panel A (the power ignores the page borders).
    {
      ctx.save();
      ctx.beginPath();
      ctx.rect(300 + g.ax, -60 + g.ay, 400, 300);
      ctx.clip();
      ctx.beginPath();
      ctx.rect(-1000, -1000, 3000, 3000);
      polyPath(ctx, POLY_A_IN, g.ax, g.ay);
      ctx.clip('evenodd');
      ctx.translate(g.ax, g.ay);
      drawNo10(env, key, C10[0], C10[1], S10, { anchor: 'contact' });
      ctx.restore();
    }

    // The slam's energy as local light where the two panels meet.
    if (t >= T_SLAM && t < T_SLAM + 0.3) {
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.mint), 382, 150, 180, 0.5 * Math.exp(-(t - T_SLAM) / 0.06));
      ctx.globalCompositeOperation = 'source-over';
    }
    // ---- The tap: a jade light event at his fingertip under the eye (a stitched ring + mint inner ring spread from it).
    if (t >= T_TAP && t < T_TAP + 0.24) {
      const u = (t - T_TAP) / 0.24;
      const tp = no10Point(env, 'MS1', 'fingertip', C10[0] + g.ax, C10[1] + g.ay, S10, { anchor: 'contact' });
      if (t < T_TAP + 0.14) {
        const k = Math.exp(-(t - T_TAP) / 0.06);
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, glowOf(PAL.jade), tp[0], tp[1], 40, 0.8 * k);
        drawGlow(ctx, glowOf(PAL.pearl), tp[0], tp[1], 10, k);
        ctx.globalCompositeOperation = 'source-over';
        sparkle(ctx, tp[0], tp[1], 18 * k, k, 0.6);
      }
      const r = lerp(6, 54, ease.outCubic(u));
      stitchRing(ctx, tp[0], tp[1], r, 1 - u, { color: HEX.jade, width: 4, phase: -u * 40 });
      stitchRing(ctx, tp[0], tp[1], r * 0.7, 1 - u, { color: HEX.mint, width: 1.5, ink: false });
    }

    // ---- The Meridian (drawn after the panels, unclipped).
    const landed = t >= T_LAND;
    const comet = landed ? 1 - clamp((t - T_LAND) / 0.12) : 1;
    const plk = t >= T_LOCK && t < T_PUSH + 0.1 ? 6 * Math.exp(-(t - T_LOCK) / 0.3) : 0;
    const pulse = t >= T_LOCK && t < T_LOCK + 0.2 ? lerp(0.12, 1, ease.inOutSine((t - T_LOCK) / 0.2)) : t >= T_THREAD ? 1 - ease.outQuad(clamp((t - T_THREAD) / THREAD_DUR)) : undefined;
    const drawn = signStroke(ctx, g, { t, comet, pluck: { amp: plk, phase: TAU * 9 * (t - T_LOCK) }, pulse, boost: t >= T_LOCK ? Math.exp(-(t - T_LOCK) / 0.15) : 0 });
    // The glint: a pearl star and a jade flare on the eye.
    // (on the eye's upper-outer highlight; the jade needle pupil is printed again over the star so it stays readable:
    // an eye of light with a needle in it)
    if (glint > 0.02) {
      jadeGlint(ctx, g.eye[0] + 7, g.eye[1] - 7, glint, t);
      if (pupK > 0) eyePupil(ctx, g.eye[0], g.eye[1], 1, pupK);
    }
    // The landing: the pearl stitch pierces No.7's eye, a stitched ring and the needle through.
    if (landed && t < T_LAND + 0.45) {
      const u = (t - T_LAND) / 0.45;
      const [x, y] = g.n7R;
      const u2 = clamp(u * 1.8);
      stitchRing(ctx, x, y, lerp(10, 170, ease.outCubic(u2)), 1 - u2, { color: HEX.jade, width: 3, phase: -u * 60 });
      stitchRing(ctx, x, y, lerp(6, 70, ease.outCubic(clamp(u * 2.6))), 1 - clamp(u * 2.6), { color: HEX.pearl, width: 2, phase: u * 50 });
      sparkle(ctx, x, y, lerp(26, 6, ease.outCubic(u)), 1 - u, Math.PI / 4 + u);
      // The pierce: a local pearl burst (never a full-frame flash) and panel B's border struck jade.
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.pearl), x, y, 22, 0.85 * Math.pow(1 - clamp(u * 4), 2));
      drawGlow(ctx, glowOf(PAL.jade), x, y, 70, 0.6 * Math.pow(1 - clamp(u * 2), 2));
      ctx.globalCompositeOperation = 'source-over';
      ctx.save();
      ctx.lineJoin = 'miter';
      ctx.beginPath();
      polyPath(ctx, POLY_B, g.bx, g.by);
      ctx.strokeStyle = HEX.jade;
      ctx.lineWidth = 4;
      ctx.globalAlpha = 1 - clamp(u * 2.5);
      ctx.stroke();
      ctx.restore();
      // The needle stays embedded in the lit pupil for 0.12 s (drawn after the glows).
      if (t < T_LAND + 0.12) {
        const h = at(g.P, g.s, g.L - 0.5);
        needlePoint(ctx, x + h.tx * 10, y + h.ty * 10, Math.atan2(h.ty, h.tx), 1, 26);
      }
    }
    env.parts.draw(ctx, 1);
    titleDrop(ctx, g, t);
    // The lock's energy as local light: a band of mint along the title (squashed 0.28 across it), so the black page
    // above stays black and the letters are the hot subject.
    if (t >= T_LOCK && t < T_LOCK + 0.3) {
      ctx.save();
      ctx.translate(TITLE_C[0], TITLE_C[1] - 24);
      ctx.rotate(TITLE_ANG);
      ctx.scale(1, 0.28);
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.mint), 0, 0, 290, 0.38 * Math.exp(-(t - T_LOCK) / 0.12));
      ctx.restore();
    }
    drawTitle(ctx, t, rng);

    // ---- Post.
    const eyeS = toScreen(env, g.eye[0], g.eye[1]);
    // The grade eases into shot 2's opening values (bloom 1.0, threshold 0.86, vignette 0.6) by the last frame.
    const kCut = clamp((t - 1.3) / (T_END - 1.3));
    nightGrade(fx, { bloom: 1.0 + 0.15 * clamp(energy) * (1 - kCut), thresh: lerp(0.7, 0.86, kCut), vignette: lerp(0.5, 0.6, kCut) });
    fx.ca = 0.002 + (t >= T_LOCK && t < T_LOCK + 0.1 ? 0.006 : 0) + (t >= T_LAND && t < T_LAND + 0.08 ? 0.004 : 0);
    // Shocks: the slam where the panels meet, the landing in No.7's eye, the title lock (s 0.02 under it).
    const shock = (t0: number, wx: number, wy: number, r1: number, s: number, dur: number) => {
      if (t < t0 || t > t0 + dur) return;
      const u = (t - t0) / dur;
      const [x, y] = env.cam.toUV(wx, wy);
      pushShock(fx, { x, y, r: lerp(0.01, r1, ease.outCubic(u)), s: s * (1 - u) });
    };
    shock(T_SLAM, 382, 150, 0.5, 0.015, 0.35);
    shock(T_LAND, g.n7R[0], g.n7R[1], 0.35, 0.018, 0.32);
    shock(T_LOCK, TITLE_C[0], TITLE_C[1] - 20, 0.6, 0.02, 0.4);
    // The pluck warp's debut along the stroke (amp 0.010, N 2, 9 Hz, decay 0.4, width 0.05).
    if (t >= T_LOCK && t < T_PUSH && drawn.length > 2) {
      const ps = lengths(drawn);
      const m = at(drawn, ps, ps[ps.length - 1] / 2);
      const p0: [number, number] = [drawn[0].x, drawn[0].y], p2: [number, number] = [drawn[drawn.length - 1].x, drawn[drawn.length - 1].y];
      setPluck(fx, env.cam, [p0, ctrlThrough(p0, [m.x, m.y], p2), p2], { amp: 0.01, n: 2, hz: 9, decay: 0.4, w: 0.05, tSince: t - T_LOCK, glow: 0.4 });
    }
    // Faint pearl lifts (the hits' energy is local light, drawn in the picture: the black page stays black): the slam
    // 0.07, the lock 0.03 (a full-frame mix of 0.08 alone lifts the page's ink over the deep-shadow line on the money
    // frame), the iris rim glint (peaks mid-push, 0 by the cut so the grade meets shot 2's). No FlashBudget event.
    meridianFlash(
      fx,
      Math.max(
        t >= T_SLAM ? 0.07 * Math.exp(-(t - T_SLAM) / 0.05) : 0,
        t >= T_LOCK ? 0.03 * Math.exp(-(t - T_LOCK) / 0.06) : 0,
        t >= T_PUSH ? 0.2 * Math.sin(Math.PI * clamp((t - T_PUSH) / (T_END - T_PUSH))) : 0,
      ),
      PEARL_FLASH,
    );
    // ---- The exit: zoom blur on the push and the needle's-eye iris over everything.
    if (t >= T_PUSH) {
      const u = clamp((t - T_PUSH) / (META.dur - T_PUSH));
      // Zoom blur with the push's speed (inOutCubic'), gone before the iris shows 2a's picture.
      const sp = u < 0.5 ? 4 * u * u : 4 * (1 - u) * (1 - u);
      fx.radial = 0.07 * sp * (1 - clamp((t - 1.32) / 0.04));
      fx.radialX = eyeS[0] / VW;
      fx.radialY = eyeS[1] / VH;
      fx.ca = Math.max(fx.ca, 0.004 * Math.sin(Math.PI * u));
      // ... and down to shot 2's 0.0015 for the cut.
      fx.ca = lerp(fx.ca, 0.0015, clamp((t - 1.34) / (T_END - 1.34)));
    }
    env.screen();
    if (t >= T_IRIS) iris(ctx, eyeS[0], eyeS[1], (t - T_IRIS) / (META.dur - T_IRIS), t);
    assertMeridianFx(fx);
  },
};
