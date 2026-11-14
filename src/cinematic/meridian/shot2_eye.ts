// SHOT 2 · PLAYMAKER'S EYE (1.8 s): the read and the disguise (SPEC.md §2).
//
// Over No.10's right shoulder, at his head height, looking down the pitch at goal (GALE HAMMER's shared perspective
// pitch, fed from LAYOUT). He carries at real speed (Back Carry B1-B4, 12 fps), dips his chin to the ball (S1), and
// the read begins: the stadium drains to a manga ink page while he, No.7 and the ball keep their colour. His watch
// ticks: one dashed jade sightline per tick across the back line, ink brackets and weight arrows on each defender, the
// obvious central lane pinches shut under an ink ×, the route's three needle eyes open faintly. The look-off: an inset
// of his eyes (G2 -> G3, the smirk) slams in and all four defenders swivel and lean to the far side (they buy it).
// The tell (S3): the route stitches itself from his boot out to the far side and back behind D4, onto a cross-stitch X
// ahead of No.7's bending run. Time snaps back, a hard push-in over his shoulder, smash cut on the plant (paper flash).
//
// Everything on screen is a pure function of the shot clock t (positions follow the simulated clock simAt(t), built
// from rate() on the runner's 1/60 grid), so a seek lands on exactly the frame a play-through shows.

import type { Shot } from '../timeline';
import { STEP } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { clamp, ease, lerp, smooth } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { focusLines } from '../../art/fx';
import { KEEPER_KIT, RIVAL_KIT, RIVAL_KIT_B, RIVAL_KIT_C, RIVAL_KIT_D, type Kit } from '../../art/puppet';
import {
  HEX, LAYOUT, PATH, THREAD_NOTES as N, crossStitch, drawBall, drawDownPitch, drawFrontFigure, drawNo10, drawNo7Boxed,
  frontFigure, inkGrade, mangaPanels, meridianGrade, needleEye, needlePoint, no10, no10Point,
  no7Anchor, no7Point, panelPoly, paperFlash, pluckLine, prepareInk, projectDecal, screentone, sliceThread, threadLine, warmNo7,
  type DownPitchView, type No10Key, type No7Key, type XZ,
} from './common';

const DUR = 1.8;

// ---------------------------------------------------------------- clock

/** Time rate: 1.0 until 0.35, easing to 0.12 by 0.50, held, back to 1.0 over 1.62-1.75. */
function rate(t: number) {
  if (t < 0.35) return 1;
  if (t < 0.5) return lerp(1, 0.12, ease.inOutQuad((t - 0.35) / 0.15));
  if (t < 1.62) return 0.12;
  if (t < 1.75) return lerp(0.12, 1, ease.inOutQuad((t - 1.62) / 0.13));
  return 1;
}

/** The simulated clock on the runner's grid: SIM[k] = sum of STEP * rate(j * STEP), j = 1..k (exactly what update sees). */
const SIM: number[] = (() => {
  const n = Math.ceil(DUR / STEP) + 2;
  const out = [0];
  for (let k = 1; k <= n; k++) out.push(out[k - 1] + STEP * rate(k * STEP));
  return out;
})();
function simAt(t: number) {
  const f = clamp(t / STEP, 0, SIM.length - 1);
  const k = Math.floor(f);
  return lerp(SIM[k], SIM[Math.min(SIM.length - 1, k + 1)], f - k);
}
const SIM_END = simAt(DUR);

// ---------------------------------------------------------------- the view (camera rides at his right shoulder)

/** No.10 runs east at the field's carry speed and reaches the plant step (1.3 m behind the strike point) at the cut. */
const SPEED = 118;
const PLANT_X = LAYOUT.strike.x - 13;
const no10X = (s: number) => PLANT_X - SPEED * (SIM_END - s);
/** Eye: 2.7 m behind him at his head height (h 18), 1.35 m to his right; f puts the back line at 36-46 px. */
const BACK = 27, EYE_Z = 277.5, F = 444, HORIZON = 118, CX = 392;
/** The parallax drift right during the slow motion (world px of eye z); it slides him 16x as far (he is near). */
const drift = (t: number) => 1.2 * smooth(clamp((t - 0.35) / 1.3));
function viewAt(t: number): DownPitchView {
  return { x: no10X(simAt(t)) - BACK, z: EYE_Z + drift(t), h: 18, f: F, horizon: HORIZON, cx: CX };
}

/** No.10 on screen: Back frames at integer x3, registered on the Idle Back body centre (64, sole row 102). */
const SC = 3;
const PIV: [number, number] = [64, 103];
const N10_X = 172, N10_Y = 406;
const n10x = (t: number) => N10_X - drift(t) * 16;

function no10Frame(t: number): No10Key {
  if (t < 0.35) return (['B1', 'B2', 'B3', 'B4'] as const)[Math.floor(t * 12 + 1e-6) % 4];
  if (t < 0.5) return 'S1';
  if (t < 0.75) return 'S2a';
  if (t < 1.0) return 'S2b';
  if (t < 1.25) return 'S2a';
  return 'S3';
}

/** Camera bob synced to his strides (B2 / B4 are the passing frames: the camera rises with him). */
function bob(t: number) {
  if (t >= 0.35) return 0;
  const k = no10Frame(t);
  return k === 'B2' || k === 'B4' ? 2 : 0;
}

// ---------------------------------------------------------------- the ball (rolls ahead of his right toe)

const BALL_Z = 264.5;
/** Ball lead ahead of him (field px): at the toe, the touch at 0.05 pushes it a stride ahead, he closes on it to plant. */
function ballLead(s: number) {
  return 7 + 10 * ease.outCubic(clamp((s - 0.05) / 0.3)) - 4.5 * ease.inOutQuad(clamp((s - 0.42) / 0.27));
}
const ballX = (s: number) => no10X(s) + ballLead(s);
const spin = new BallSpin();

// ---------------------------------------------------------------- the back line

interface Defender {
  kit: Kit;
  /** Field position at sim 0 and at the cut (D1 is still stepping out toward him). */
  from: XZ;
  to: XZ;
  /** Sightline tick. */
  tick: number;
  /** Swivel start (the look-off). */
  sw: number;
}
const xz = (x: number, z: number): XZ => ({ x, z });
const DEFS: Defender[] = [
  // View-only cheats (this camera only): from the eye D1 (near), D2 and needle eye 2 (far) all fall on one screen
  // column. D1 shades 0.3 m toward the ball line and D2 1.4 m wider, so D1 stands clear between D2 and eye 2
  // (>= 18 px from D2, 6 px from eye 2, 28 px from D3; eye 1 6 px off his far-side boot, correct for the poke).
  { kit: RIVAL_KIT, from: xz(976, 255), to: xz(LAYOUT.d1Out.x, LAYOUT.d1Out.z - 3), tick: 0.55, sw: 0.97 },
  { kit: RIVAL_KIT_B, from: xz(1031, 223), to: xz(LAYOUT.d2.x, LAYOUT.d2.z - 14), tick: 0.7, sw: 1.03 },
  { kit: RIVAL_KIT_C, from: xz(1035, 269), to: LAYOUT.d3, tick: 0.85, sw: 1.0 },
  { kit: RIVAL_KIT_D, from: xz(1051, 308), to: LAYOUT.d4, tick: 1.0, sw: 1.07 },
];

/** 0 -> 1 (overshooting a little): the head-and-shoulders swivel to the far side. */
const swivel = (d: Defender, t: number) => (t < d.sw ? 0 : ease.outBack(clamp((t - d.sw) / 0.16)));

interface DefPose {
  x: number;
  y: number;
  sc: number;
  h: number;
  lean: number;
  turn: number;
  frame: number;
  sw: number;
}

function defPose(d: Defender, i: number, t: number, v: DownPitchView): DefPose {
  const s = simAt(t);
  const u = smooth(clamp(s / SIM_END));
  const sw = swivel(d, t);
  // They buy it: D2 and D3 side-step toward the far side (low z) as they swivel. D1 (the presser) stays square to
  // the ball and D4 holds the offside line: both only turn and lean, which keeps D1 clear of D2 and D4 clear of the X.
  const step = i === 1 || i === 2 ? 5.5 : 0;
  const fx = lerp(d.from.x, d.to.x, u), fz = lerp(d.from.z, d.to.z, u) - step * clamp(sw);
  const p = projectDecal(fx, fz, 0, v);
  const sc = clamp((p.s * 18) / 46, 0.78, 1);
  return {
    x: p.x,
    y: p.y,
    sc,
    h: 46 * sc,
    lean: -0.45 * sw,
    turn: -clamp(sw * 1.1, 0, 1),
    // The 2-frame shuffle on the simulated clock (it slows with the world); settled once they have bought it.
    frame: sw > 0.5 ? 1 : Math.floor(s * 7 + i * 0.5) % 2,
    sw,
  };
}

/** The keeper rocks on his line, shading 2 m toward the near post (No.7's side), so D3 never hides him in this view. */
const KEEPER = xz(LAYOUT.keeper.x, LAYOUT.keeper.z + 20);
/** The keeper rocks on his line; he follows the look last and only half-turns. */
const keeperTurn = (t: number) => -0.5 * smooth(clamp((t - 1.12) / 0.2));

// ---------------------------------------------------------------- No.7's bending run (0.4x Run subset)

const RUN7: No7Key[] = ['Run.R1', 'Run.R4', 'Run.R5', 'Run.R8'];
const NO7_FROM = xz(918, 356);
function no7Field(s: number): XZ {
  const u = clamp(s / SIM_END);
  // Up the near touchline, then bending inside toward no7Strike (onside, behind D4).
  return xz(lerp(NO7_FROM.x, LAYOUT.no7Strike.x, u), lerp(NO7_FROM.z, LAYOUT.no7Strike.z, ease.outQuad(u)));
}
const no7Frame = (s: number): No7Key => RUN7[Math.floor(s / 0.14 + 1e-6) % 4];

// ---------------------------------------------------------------- the stitched route

/** Route draw-on (from his boot along PATH); the X lands with the pluck at 1.35. */
const ROUTE_T0 = 1.25, ROUTE_T1 = 1.35;
const routeProgress = (t: number) => ease.outCubic(clamp((t - ROUTE_T0) / (ROUTE_T1 - ROUTE_T0)));

// ---------------------------------------------------------------- the inset (his eyes)

const INSET = { cx: 512, cy: 62, w: 210, h: 92, deg: -4 };
const INSET_IN = 0.95, INSET_G3 = 1.1, INSET_OUT = 1.25;
/** Face crops are drawn so this crop point (between the eyes; every Glance frame shares the 48x26 grid) lands on the anchor. */
const FACE_PIV: [number, number] = [24, 14.5];
/** Stand-ins for Glance G2 / G3 (null when the library frame itself is exported). */
let g2Img: HTMLCanvasElement | null = null;
let g3Img: HTMLCanvasElement | null = null;

/** True when the library frame itself is in the Glance strip (not one of no10.ts's stand-ins). */
function glanceReal(key: 'G2' | 'G3') {
  const f = no10(key);
  return !!f && f.a.frames[f.i].name === key;
}

/**
 * Glance G2 / G3 stand-ins while the library frames are not exported (the art hand-off left Glance open): the studio
 * G1 crop with its two 2x2 irises moved one pixel to his left (crop-right, brows untouched) for G2, plus the 1 px
 * smirk (the mouth's right end lifts a row) for G3. Pixel edits on G1's own grid (the same code pupil override
 * CRIMSON CRESCENT shot 2 uses), so the swap never jumps; the library frames replace them as soon as they are exported.
 * The inset draws every face crop mirrored, so on screen the gaze (and the smirk) point screen-left, to the far side.
 */
function deriveGlance() {
  g2Img = g3Img = null;
  const realG2 = glanceReal('G2'), realG3 = glanceReal('G3');
  if (realG2 && realG3) return;
  // The real G2, or its studio stand-in (Glance G1, found by the strip's exact stem).
  const base = no10('G2');
  if (!base || base.a.w !== 48 || base.a.h !== 26) return;
  const make = (src: HTMLCanvasElement, pupils: boolean, smirk: boolean) => {
    const cv = document.createElement('canvas');
    cv.width = src.width;
    cv.height = src.height;
    const g = cv.getContext('2d')!;
    g.drawImage(src, 0, 0);
    const px = (x: number, y: number, c: string) => {
      g.fillStyle = c;
      g.fillRect(x, y, 1, 1);
    };
    const W = '#ffffff', K = 'rgb(24,4,17)', SKIN = 'rgb(244,147,72)';
    // Left eye: iris (18-19, 14-15) -> (19-20, 14-15). Right eye: (26-27, 14-15) -> (27-28, 14-15).
    if (pupils)
      for (const [x0, x1] of [[18, 20], [26, 28]] as const) {
        for (const y of [14, 15]) {
          px(x0, y, W);
          px(x0 + 1, y, K);
          px(x1, y, K);
        }
      }
    if (smirk) {
      px(23, 20, SKIN);
      px(23, 19, K);
    }
    return cv;
  };
  const src = base.a.frames[base.i].img;
  if (!realG2) g2Img = make(src, true, false);
  if (!realG3) g3Img = make(src, !realG2, true);
}

// ---------------------------------------------------------------- small ink drawings

function inkBrackets(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, a: number, pop: number) {
  if (a <= 0) return;
  const k = lerp(1.35, 1, ease.outBack(clamp(pop)));
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const hw = ((x1 - x0) / 2) * k, hh = ((y1 - y0) / 2) * k;
  const L = Math.max(4, Math.min(hw, hh) * 0.45);
  ctx.save();
  ctx.globalAlpha = clamp(a);
  ctx.lineCap = 'square';
  for (const [w, c] of [[4, HEX.paper], [2, HEX.ink]] as const) {
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.beginPath();
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]] as const) {
      const px = Math.round(cx + sx * hw), py = Math.round(cy + sy * hh);
      ctx.moveTo(px, py - sy * L);
      ctx.lineTo(px, py);
      ctx.lineTo(px - sx * L, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/** A small hand-drawn ink arrow, bending down onto the foot that carries the weight. */
function weightArrow(ctx: CanvasRenderingContext2D, x: number, y: number, side: number, size: number, a: number) {
  if (a <= 0) return;
  const x0 = x + side * size * 0.85, y0 = y - size * 1.25;
  const cx = x + side * size * 0.9, cy = y - size * 0.35;
  const x1 = x + side * size * 0.28, y1 = y - size * 0.12;
  const ang = Math.atan2(y1 - cy, x1 - cx);
  ctx.save();
  ctx.globalAlpha = clamp(a);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const [w, c] of [[3.5, HEX.paper], [1.6, HEX.ink]] as const) {
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(cx, cy, x1, y1);
    const hl = Math.max(3, size * 0.42);
    ctx.moveTo(x1 - Math.cos(ang - 0.55) * hl, y1 - Math.sin(ang - 0.55) * hl);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x1 - Math.cos(ang + 0.55) * hl, y1 - Math.sin(ang + 0.55) * hl);
    ctx.stroke();
  }
  ctx.restore();
}

/** Ink swish marks: short curved strokes trailing the head as it swivels to the far side (screen-left). */
function swish(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: number) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = clamp(a);
  ctx.lineCap = 'round';
  for (const [w, c] of [[3.2, HEX.paper], [1.4, HEX.ink]] as const) {
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    for (let k = 0; k < 3; k++) {
      const rr = r * (1.25 + k * 0.38);
      const a0 = -0.95 + k * 0.08, a1 = 0.55 - k * 0.12;
      ctx.beginPath();
      ctx.arc(x, y, rr, a0, a1);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function inkCross(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, a: number) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = clamp(a);
  ctx.lineCap = 'round';
  for (const [w, c] of [[4.5, HEX.paper], [2, HEX.ink]] as const) {
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(x - s, y - s * 0.8);
    ctx.lineTo(x + s, y + s * 0.8);
    ctx.moveTo(x + s, y - s * 0.8);
    ctx.lineTo(x - s, y + s * 0.8);
    ctx.stroke();
  }
  ctx.restore();
}

/** A small four-point pearl glint (additive, jade-tinted halo; never the cyan sparkle glow). */
function pearlGlint(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: number) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf([190, 255, 215]), x, y, r * 1.1, a * 0.45);
  ctx.globalAlpha = clamp(a);
  ctx.fillStyle = HEX.pearl;
  ctx.translate(x, y);
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.14, 0);
    ctx.lineTo(-r * 0.14, 0);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the stadium roof and floodlights (behind his head)

/** The lower roof over the far stand, its front edge 3.9 m up, with its floodlight bank (projected with the view). */
const ROOF_H = 36, HERO_LAMP_H = 22;
const LAMP_Z0 = 58, LAMP_DZ = 92;
function drawRoof(ctx: CanvasRenderingContext2D, v: DownPitchView, t: number) {
  const y = Math.round(projectDecal(1270, v.z, ROOF_H, v).y);
  ctx.fillStyle = '#07050f';
  ctx.fillRect(-60, -80, VW + 120, y + 80);
  ctx.fillStyle = '#120d1c';
  ctx.fillRect(-60, y - 7, VW + 120, 5);
  ctx.fillStyle = 'rgba(255,240,210,0.22)';
  ctx.fillRect(-60, y - 1, VW + 120, 1);
  ctx.globalCompositeOperation = 'lighter';
  for (let k = -3; k < 9; k++) {
    const big = k === 0;
    const p = projectDecal(1270, LAMP_Z0 + k * LAMP_DZ, big ? HERO_LAMP_H : ROOF_H + 1, v);
    if (p.x < -80 || p.x > VW + 80) continue;
    if (big) {
      // The bank behind his head hangs from the fascia on a short gantry.
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#120d1c';
      ctx.fillRect(Math.round(p.x) - 1, y - 2, 2, Math.round(p.y) - y);
      ctx.fillRect(Math.round(p.x) - 12, Math.round(p.y) - 5, 24, 5);
      ctx.globalCompositeOperation = 'lighter';
    }
    const fl = 0.92 + 0.08 * Math.sin(t * 9 + k * 2.1);
    drawGlow(ctx, glowOf([255, 236, 196]), p.x, p.y, big ? 150 : 60, (big ? 0.62 : 0.26) * fl);
    drawGlow(ctx, glowOf([255, 252, 238]), p.x, p.y, big ? 48 : 18, (big ? 1 : 0.7) * fl);
    // The lamp heads: a short row of hot squares.
    ctx.fillStyle = '#fffaf0';
    const n = big ? 4 : 3;
    for (let j = 0; j < n; j++) ctx.fillRect(Math.round(p.x - n * 2.5 + j * 5), Math.round(p.y - 3), 3, 2);
  }
  ctx.globalCompositeOperation = 'source-over';
}

// ---------------------------------------------------------------- camera

/**
 * The slow dolly-in; the tilt down onto his boots for the tell (S3, the toe turned in); then the hard push-in over
 * his shoulder toward the X, which releases the tilt (a crane-push from the boot up to the X); handheld; stride bob.
 */
function camera(t: number) {
  const dolly = 1 + 0.08 * smooth(clamp((t - 0.35) / 1.2));
  const push = ease.inQuad(clamp((t - 1.55) / 0.23));
  // Synced to S3 (1.25), landing at 1.40 as the inset has flown out (an earlier tilt lifts No.7 under the panel).
  const tell = smooth(clamp((t - 1.25) / 0.15)) * (1 - push);
  const zoom = dolly * lerp(1, 1.25 / 1.08, push);
  const px = lerp(360, 480, push), py = lerp(175, 155, push);
  const hh = t < 0.35 || t > 1.62 ? 1 : 0.6;
  const hx = (Math.sin(t * 2.3) * 0.7 + Math.sin(t * 5.3 + 1.3) * 0.45) * hh;
  const hy = (Math.sin(t * 1.9 + 0.7) * 0.55 + Math.sin(t * 4.4) * 0.35) * hh;
  // update() subtracts hy from the view centre, so a lower hy moves the view down (onto the boots).
  return { zoom, px, py, hx, hy: hy - bob(t) - 50 * tell };
}

// ---------------------------------------------------------------- shot

let touched = false;
let slammed = false;

export const shotEye: Shot = {
  name: "Playmaker's eye",
  dur: DUR,
  seed: 402,
  rate,
  cues: [
    // The bed outlasts the cut (holds to 1.8 s, tails off under shot 3's own bed): the crowd is dipped, never silenced.
    { at: 0, fn: (env) => env.sfx.crowd(3.0, 0.2) },
    { at: 0.05, fn: (env) => env.sfx.kick(0.15) },
    { at: 0.38, fn: (env) => env.sfx.duck(0.35, 1.3) },
    { at: 0.55, fn: (env) => env.sfx.tick() },
    { at: 0.7, fn: (env) => env.sfx.tick() },
    { at: 0.85, fn: (env) => env.sfx.tick() },
    { at: 1.0, fn: (env) => (env.sfx.tick(), env.sfx.shing(1.1)) },
    { at: 1.35, fn: (env) => env.sfx.pluck(N.D5, 0.5) },
    { at: 1.55, fn: (env) => env.sfx.whoosh(0.25, 400, 3000, 0.45) },
  ],
  prepare(env) {
    prepareInk(env.ctx);
    deriveGlance();
    warmNo7(env, RUN7, 0.4, true);
    // Warm every front-figure raster a play-through uses (cached per kit / scale / lean / turn / frame).
    for (let k = 0; k <= Math.round(DUR / STEP); k++) {
      const t = k * STEP;
      const v = viewAt(t);
      DEFS.forEach((d, i) => {
        const p = defPose(d, i, t, v);
        frontFigure(d.kit, p.sc, p.lean, p.turn, p.frame);
      });
      frontFigure(KEEPER_KIT, 0.56, 0, keeperTurn(t), Math.floor(simAt(t) * 5) % 2);
    }
  },
  init(env) {
    env.sfx.clearBus();
    env.cam.reset();
    env.cam.shakeRoll = 0;
    env.cam.set(VW / 2, VH / 2, 1, 0);
    touched = false;
    slammed = false;
  },
  update(env, t) {
    // The touch on B1: a few grass flecks off the ball.
    if (!touched && t >= 0.05) {
      touched = true;
      const s = simAt(t);
      const b = projectDecal(ballX(s), BALL_Z, 0, viewAt(t));
      const rng = env.rng;
      for (let i = 0; i < 6; i++) {
        const a = rng.range(-Math.PI * 0.9, -Math.PI * 0.1);
        const sp = rng.range(60, 170);
        env.parts.spawn({
          kind: PK.Debris, x: b.x + rng.range(-6, 6), y: b.y - 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, ay: 700, drag: 1.2,
          vrot: rng.range(-12, 12), max: rng.range(0.25, 0.45), s0: rng.range(1.5, 2.5), s1: 1, ramp: 'grass',
          r0: rng.next(), r1: rng.next(), a0: 1, a1: 0, add: false,
        });
      }
    }
    // The inset slams in: a small knock on the camera (no roll in this move).
    if (!slammed && t >= INSET_IN + 0.06) {
      slammed = true;
      env.cam.hit(0.3);
    }
    const c = camera(t);
    env.cam.set(c.px - (c.px - VW / 2) / c.zoom - c.hx, c.py - (c.py - VH / 2) / c.zoom - c.hy, c.zoom, 0);
  },
  render(env, t) {
    const { ctx, fx } = env;
    const s = simAt(t);
    const v = viewAt(t);
    const ink = 0.9 * smooth(clamp((t - 0.38) / 0.25));
    const P = (x: number, z: number, h = 0) => projectDecal(x, z, h, v);

    env.world();
    ctx.imageSmoothingEnabled = false;

    // ---- Environment (graded): pitch, roof + floodlights, keeper, the back line.
    drawDownPitch(ctx, env.art.stadium, v, t);
    drawRoof(ctx, v, t);
    // The ink page wants paper-grey turf, not a dark photo: lift the grass toward paper as the read drains it.
    if (ink > 0) {
      const turfY = P(1270, v.z, 0).y;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = (ink / 0.9) * 0.75;
      ctx.fillStyle = 'rgb(190,184,174)';
      ctx.fillRect(-60, turfY, VW + 120, VH + 80 - turfY);
      ctx.restore();
    }
    {
      const kp = P(KEEPER.x, KEEPER.z + Math.sin(s * 7) * 2.5);
      drawFrontFigure(ctx, KEEPER_KIT, kp.x, kp.y, 0.56, 0, keeperTurn(t), Math.floor(s * 5) % 2);
    }
    const poses = DEFS.map((d, i) => defPose(d, i, t, v));
    // Far to near, so D1 (stepping out) overlaps the line.
    [0, 1, 2, 3]
      .sort((a, b) => poses[a].y - poses[b].y)
      .forEach((i) => {
        const p = poses[i];
        drawFrontFigure(ctx, DEFS[i].kit, p.x, p.y, p.sc, p.lean, p.turn, p.frame);
      });

    // ---- The read: the page drains to ink (No.10, No.7, the ball and the jade stay in colour, drawn after).
    inkGrade(ctx, ink);

    // Ink focus lines converge on his head.
    const key = no10Frame(t);
    const nx = n10x(t);
    const head = no10Point(env, key, 'head', nx, N10_Y, SC, { pivot: PIV });
    if (t > 0.38 && t < 1.0) {
      const a = 0.3 * smooth(clamp((t - 0.38) / 0.2)) * (1 - smooth(clamp((t - 0.85) / 0.15)));
      focusLines(ctx, env.frng(21), head[0], head[1] - 10, 250, 760, 64, HEX.ink, a, 2.2);
    }

    // The obvious central lane (between D1 and D3) shows a jade almond that pinches shut under an ink ×: covered.
    // Anchored on the open turf between D1 and D3, nearer to No.10 (where the screen lerp D1 -> D3 lands as it
    // opens), so it reads as a mark on the lane, not on anyone's boots, and stays put on the turf while D3 side-steps.
    {
      const lane = P(966, 264);
      const open = t < 0.8 ? 0 : t < 0.86 ? ease.outCubic((t - 0.8) / 0.06) : 1 - ease.inCubic(clamp((t - 0.9) / 0.08));
      const vis = t < 0.8 ? 0 : 1 - smooth(clamp((t - 1.12) / 0.15));
      if (open > 0.02) needleEye(ctx, lane.x, lane.y - 1, 24, open, 0, 0.9 * vis, 0.55);
      if (t >= 0.9) inkCross(ctx, lane.x, lane.y - 1, 5 * lerp(1.6, 1, ease.outBack(clamp((t - 0.9) / 0.06))), vis);
    }

    // The route's three needle eyes open faintly in turn: at D1's boots, between D2 and D3, behind D4's heel.
    // Eye 2 tilted along the path between D2 and D3.
    const eyeRot = [-Math.PI / 2, -0.35, -0.7];
    PATH.eyes.forEach((u, i) => {
      const e = PATH.at(u);
      const p = P(e.x, e.z);
      const open = ease.outCubic(clamp((t - (0.85 + i * 0.1)) / 0.12));
      if (open <= 0.02) return;
      // Kept almond-shaped (squash 0.8, not a flat ellipse decal): the pointed tips must read as a needle's eye.
      const len = 7 * p.s;
      needleEye(ctx, p.x, i === 0 ? p.y - len * 0.42 : p.y - 1, len, open, eyeRot[i], 0.55 + 0.2 * routeProgress(t), i === 0 ? 1 : 0.8);
    });

    // Sightlines: one dashed jade line per tick, from his head to each defender; brackets and weight arrows.
    DEFS.forEach((d, i) => {
      const p = poses[i];
      if (t < d.tick) return;
      const fade = 1 - smooth(clamp((t - 1.22) / 0.14));
      if (fade <= 0) return;
      const grow = ease.outCubic(clamp((t - d.tick) / 0.07));
      const tx = p.x - p.turn * 2, ty = p.y - p.h * 0.78;
      const ex = lerp(head[0], tx, grow), ey = lerp(head[1], ty, grow);
      ctx.save();
      ctx.lineCap = 'butt';
      ctx.setLineDash([5, 3]);
      ctx.lineDashOffset = -t * 40;
      ctx.globalAlpha = 0.85 * fade;
      ctx.strokeStyle = HEX.ink;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(head[0], head[1]);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.strokeStyle = HEX.jade;
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.restore();
      if (grow >= 1) {
        const pop = clamp((t - d.tick - 0.07) / 0.08);
        // Once he buys it, his bracket and weight arrow clear away so the swivel, lean and swish read on their own
        // (only the sightline stays until 1.22).
        const bf = fade * (1 - smooth(clamp((t - Math.max(d.sw + 0.04, d.tick + 0.15)) / 0.1)));
        inkBrackets(ctx, p.x - 13 * p.sc, p.y - p.h - 3, p.x + 13 * p.sc, p.y + 3, bf, pop);
        // Which foot carries his weight: the planted foot of the shuffle, then the far-side foot once he buys it.
        const side = p.sw > 0.35 ? -1 : p.frame === 0 ? 1 : -1;
        weightArrow(ctx, p.x + side * 4.5 * p.sc, p.y - 1, side, 12 * p.sc, bf * pop);
        // The ping where the sightline lands.
        if (pop < 1) pearlGlint(ctx, tx, ty, 6 * (1 - pop) + 2, 1 - pop);
      }
    });

    // The look-off: swish marks as each head swivels to the far side.
    DEFS.forEach((d, i) => {
      const p = poses[i];
      const k = clamp((t - d.sw) / 0.24);
      if (t < d.sw || k >= 1) return;
      const a = Math.sin(Math.PI * clamp(k * 1.4)) * 0.95;
      swish(ctx, p.x + 5 * p.sc, p.y - p.h + 7 * p.sc, 6.5 * p.sc, a);
      // Motion lines trailing the body as it slides and leans to the far side.
      ctx.save();
      ctx.globalAlpha = a * 0.9;
      ctx.lineCap = 'round';
      for (const [w, c] of [[3, HEX.paper], [1.2, HEX.ink]] as const) {
        ctx.strokeStyle = c;
        ctx.lineWidth = w;
        ctx.beginPath();
        for (let j = 0; j < 3; j++) {
          const yy = Math.round(p.y - p.h * (0.62 - j * 0.17));
          const x0 = p.x + (9 + (j % 2) * 3) * p.sc;
          ctx.moveTo(x0, yy);
          ctx.lineTo(x0 + (8 + j * 3) * p.sc * (0.5 + a * 0.5), yy);
        }
        ctx.stroke();
      }
      ctx.restore();
    });
    {
      const kp = P(KEEPER.x, KEEPER.z);
      const k = clamp((t - 1.12) / 0.24);
      if (t > 1.12 && k < 1) swish(ctx, kp.x + 3, kp.y - 22, 3.4, Math.sin(Math.PI * k) * 0.8);
    }

    // The stitched route: from his boot, out toward the far side, bending back behind D4 onto the X.
    const b = P(ballX(s), BALL_Z);
    const rp = routeProgress(t);
    const tgt = P(LAYOUT.target.x, LAYOUT.target.z);
    if (rp > 0) {
      const pts = [{ x: b.x, y: b.y + 2 }, ...PATH.points(0, 1, 3).map((q) => {
        const p = P(q.x, q.z);
        return { x: p.x, y: p.y };
      })];
      const pl = t > ROUTE_T1 ? pluckLine(pts, { amp: 2.6 * Math.exp(-(t - ROUTE_T1) * 9), phase: (t - ROUTE_T1) * 70, nodes: 2 }) : pts;
      // Perspective: the near stretch (boot -> eye 1) is stitched bigger than the far one.
      const nNear = 1 + PATH.points(0, PATH.eyes[0], 3).length;
      const near = pl.slice(0, nNear), far = pl.slice(nNear - 1);
      const len = (q: readonly { x: number; y: number }[]) => q.reduce((a, c, i) => (i ? a + Math.hypot(c.x - q[i - 1].x, c.y - q[i - 1].y) : 0), 0);
      const ln = len(near), lf = len(far), at = rp * (ln + lf);
      const shownNear = sliceThread(near, 0, clamp(at / ln));
      threadLine(ctx, shownNear, 3, 1, { stitch: { dash: 13, dip: 5, phase: -t * 16 } });
      let shown = shownNear;
      if (at > ln) {
        shown = sliceThread(far, 0, clamp((at - ln) / lf));
        threadLine(ctx, shown, 2, 1, { stitch: { dash: 8, dip: 4, phase: -t * 10 } });
      }
      if (rp < 1) {
        const h = shown[shown.length - 1], h0 = shown[Math.max(0, shown.length - 3)];
        needlePoint(ctx, h.x, h.y, Math.atan2(h.y - h0.y, h.x - h0.x), 1, 10);
      }
    }
    if (t >= ROUTE_T1) {
      const pop = lerp(1.9, 1, ease.outBack(clamp((t - ROUTE_T1) / 0.08)));
      const beat = 1 + 0.12 * Math.sin((t - ROUTE_T1) * 22);
      crossStitch(ctx, tgt.x, tgt.y, 12 * pop * beat, 1, 0.55);
      if (t < ROUTE_T1 + 0.12) pearlGlint(ctx, tgt.x, tgt.y, 10 * (1 - (t - ROUTE_T1) / 0.12) + 3, 1 - (t - ROUTE_T1) / 0.12);
    }

    // ---- No.7 (colour): bending his run in from screen-right.
    {
      const q = no7Field(s);
      const p = P(q.x, q.z);
      const k = no7Frame(s);
      const pel = no7Anchor(k, 'pelvis');
      const o7 = { flip: true, pivot: [pel[0], 103] as [number, number] };
      drawNo7Boxed(env, k, p.x, p.y, 0.4, o7);
      // The X is HIS: a dotted run line from his boots, curving over the turf ahead of him onto the X (an arrowhead
      // at the X), and a pearl glint on his head as the stitch locks. The pass reads 'to No.7', never 'to D4'.
      if (t >= ROUTE_T1) {
        const a = ease.outCubic(clamp((t - ROUTE_T1) / 0.1));
        // The bend dips under D4's boots (>= 5 px below his soles) and lands on the X's near arm from below.
        const x0 = p.x - 4, y0 = p.y - 2;
        const qx = (p.x + tgt.x) / 2 - 10, qy = Math.max(p.y, tgt.y) + 14;
        const x1 = tgt.x + 6, y1 = tgt.y + 5;
        const ang = Math.atan2(y1 - qy, x1 - qx);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (const [w, c] of [[3.5, HEX.paper], [1.5, HEX.ink]] as const) {
          ctx.strokeStyle = c;
          ctx.lineWidth = w;
          ctx.setLineDash([2, 4]);
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.quadraticCurveTo(qx, qy, x1, y1);
          ctx.stroke();
          // The arrowhead on the X end (solid strokes).
          ctx.setLineDash([]);
          const hl = 5;
          ctx.beginPath();
          ctx.moveTo(x1 - Math.cos(ang - 0.6) * hl, y1 - Math.sin(ang - 0.6) * hl);
          ctx.lineTo(x1, y1);
          ctx.lineTo(x1 - Math.cos(ang + 0.6) * hl, y1 - Math.sin(ang + 0.6) * hl);
          ctx.stroke();
        }
        ctx.restore();
      }
      if (t >= ROUTE_T1 && t < ROUTE_T1 + 0.12) {
        const g = (t - ROUTE_T1) / 0.12;
        const hp = no7Point(env, k, 'head', p.x, p.y, 0.4, o7);
        pearlGlint(ctx, hp[0], hp[1] - 2, 7 * (1 - g) + 3, Math.sin(Math.PI * g));
      }
    }

    // ---- The ball (colour) at his right toe, drawn behind his boot where they overlap.
    {
      const r = 4, D = 3;
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = HEX.ink;
      ctx.beginPath();
      ctx.ellipse(b.x + 1, b.y + 1, r * D * 1.05, r * D * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      spin.m = new Float64Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
      spin.rotate(0.35, 0.2, 1, 0.6);
      spin.rotate(1, 0, 0, -(ballX(s) - ballX(0)) / 1.1);
      const by = b.y - r * D;
      drawBall(env, spin, b.x, by, r, D, 0, 0.42 * (ink / 0.9), 'pearl');
      // S1: the chin dip catches the ball (a small pearl glint as he decides).
      if (t > 0.35 && t < 0.55) pearlGlint(ctx, b.x - 5, by - 7, 11, Math.sin((Math.PI * (t - 0.35)) / 0.2));
    }

    env.parts.draw(ctx, 1);

    // ---- No.10 (colour): Back frames at x3, cropped at the knees, his mop against the floodlight.
    drawNo10(env, key, nx, N10_Y, SC, { pivot: PIV });

    // ---- The inset: his eyes, G2 -> G3 (screen space).
    env.screen();
    if (t >= INSET_IN && t < INSET_OUT + 0.16) {
      const inK = ease.outBack(clamp((t - INSET_IN) / 0.1));
      const outK = ease.inCubic(clamp((t - INSET_OUT) / 0.15));
      // The slam lands with a 1 px panel shake.
      const kick = t >= INSET_IN + 0.1 && t < INSET_IN + 0.15 ? (Math.floor(t * 60) % 2 ? 1 : -1) : 0;
      // It flies out steeply up-right, clearing No.7 (lifted by the tilt onto the boots) before the X locks on him.
      const dx = (1 - inK) * 300 + outK * 320 + kick, dy = -(1 - inK) * 24 - outK * 90;
      const poly = panelPoly(INSET.cx, INSET.cy, INSET.w, INSET.h, INSET.deg);
      const g3 = t >= INSET_G3;
      mangaPanels(ctx, [{
        poly, dx, dy, border: 3, gutter: 3,
        draw: (c) => {
          // Shot 1's corner tone (dot 6): a manga halftone, never a fine checker.
          screentone(c, [INSET.cx - INSET.w / 2 - 20, INSET.cy - INSET.h / 2 - 20, INSET.w + 40, INSET.h + 40], 6, 0.45, { corners: 0.75 });
          focusLines(c, env.frng(23), INSET.cx, INSET.cy - 4, 62, 190, 30, HEX.ink, 0.5, 2.2);
          const fkey: No10Key = g3 ? 'G3' : 'G2';
          const img = g3 ? g3Img : g2Img;
          const ax = Math.round(INSET.cx - 4), ay = Math.round(INSET.cy + 4);
          // Mirrored so his gaze points screen-left, the way the back line swivels (the far side): the disguise reads.
          // FACE_PIV x is the crop centre, so the face stays centred at integer x4. With a stand-in image, drawNo10
          // resolves fkey to the studio frame it was derived from (same 48x26 grid).
          drawNo10(env, fkey, ax, ay, 4, { pivot: FACE_PIV, flip: true }, img ?? undefined);
          if (g3) {
            // The cheeky glint on his near eye as the smirk lands (the right iris's corner, mirrored with the face).
            const k = clamp((t - INSET_G3) / 0.12);
            if (k < 1) pearlGlint(c, ax - (29 - FACE_PIV[0]) * 4, ay + (14 - FACE_PIV[1]) * 4, 9 * (1 - k) + 3, Math.sin(Math.PI * k));
          }
        },
      }], t);
    }

    // ---- Post: vignette, flashes, the push-in's radial blur on the X.
    fx.vignette = lerp(0.45, 0.6, ink / 0.9);
    if (t < 0.05) paperFlash(fx, 1 - t / 0.05);
    if (t > 1.55) {
      const [ux, uy] = env.cam.toUV(tgt.x, tgt.y);
      fx.radial = 0.25 * ease.inCubic(clamp((t - 1.55) / 0.23));
      fx.radialX = ux;
      fx.radialY = uy;
    }
    // Smash cut on the plant step: a 2-frame paper flash (shot 3 opens from it).
    if (t >= DUR - 2 * STEP - 1e-6) paperFlash(fx, t >= DUR - STEP - 1e-6 ? 1 : 0.75);
    meridianGrade(fx, ink > 0);
  },
};
