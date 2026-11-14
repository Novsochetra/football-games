// SHOT 1 · STITCH-IN (1.3 s): the move's declaration, as a manga page (SPEC.md §1).
//
// Warm paper with streaming ink speed lines and screentone corners. Two slanted manga panels slam in from opposite
// sides: the top one (ink, -6°) holds No.10's eyes at x4 with a jade rim light, the bottom one (paper, +4°) the
// outside of his right boot on the ball (Trivela T6 at x4, ink world, colour player). At 0.30 his pupils flick to his
// left (Glance G1 -> G2): the look-off. From 0.42 a pearl needle runs one straight line across both panels and the
// gutter between them; behind it a jade running stitch sews MERIDIAN THREAD onto the page letter by letter. At 0.98
// the thread yanks taut and rings like a plucked string; at 1.12 the needle pulls it off the right edge and both
// panels are drawn off the page after it, like cloth on a thread. Paper flash, cut.
//
// Beats (shot-local t):
//   0.00-0.18  panels slam in (top from the left, bottom 2 frames later from the right), cam.hit(0.25) on landing
//   0.30       the look-off: G1 -> G2, eye-dart lines, panels shake 1 px; at 0.38 (clean pupils first) a small sparkle +
//              jade lensFlare on the near eye's upper-outer corner, then a steady catch-light there
//   0.42-0.95  the stitch: needle along y 204, letters pop in as it passes (scale 0 -> 1, pulled 3 px down), tag unrolls
//   0.98       the yank: letters jerk 2 px onto the line, standing wave (2 nodes, 4 px, decays over 0.25 s)
//   1.12-1.30  needle and thread leave right (0.12 s, inCubic), the top panel after it, the bottom one 2 frames behind,
//              each sheared as cloth drawn from the thread line; paper flash 0.6 into the cut
//
// No.10 is never a puppet: the face is the hand-drawn sprite's head (the Glance G1 grid) at integer x4, G2 from the
// studio's GlanceFace strip (the same face of record as shot 3's freeze inset), else the Glance strip's G2 when it is
// exported, else the art team's G2 pixel edit (see G2_PATCH); the boot is Trivela T6.

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { Rng, clamp, ease, lerp } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { PIXEL_FONT, TITLE_FONT, focusLines, lensFlare, sparkle, type TrailPt } from '../../art/fx';
import { anim, findFrame, hasAnim } from '../../art/studioAnim';
import {
  HEX, JADE_FLARE, PAL, SHOT_NAME, THREAD_NOTES as N, drawBall, drawNo10, inkSmear, mangaPanels, meridianGrade, needleEye,
  needlePoint, no10, no10Final, no10Point, panelPoly, paperFlash, pulse, screentone, spinMarks, threadLine,
} from './common';

const DUR = 1.3;

// ---------------------------------------------------------------- timing
const SLAM_T = 0.15; // each panel's slam (top from 0, bottom from BOT_DELAY)
const BOT_DELAY = 2 / 60;
const LOOK_T = 0.3;
const NEEDLE_T0 = 0.42, NEEDLE_T1 = 0.95;
const YANK_T = 0.98;
const PULL_T = 1.12, PULL_LEN = 0.12, PULL_D = 980;

// ---------------------------------------------------------------- layout (page / world px; the camera only pushes in 3 %)
const LINE_Y = 204; // the needle's one straight line
const NX0 = -18, NX1 = 612; // needle run
const TOP = panelPoly(300, 112, 560, 220, -6);
const BOT = panelPoly(412, 252, 430, 140, 4);
const F = 4; // cut-in scale: integer x4 only
// Top panel: the eye midpoint (hand-drawn sprite px (49, 23)) lands here.
const EYE_X = 262, EYE_Y = 100;
// Bottom panel: Trivela T6's 'boot' anchor (the outside of the right boot) lands here; ground row 102 -> GROUND_Y.
const BOOT_X = 382, BOOT_Y = 284;
const GROUND_Y = BOOT_Y + (102 - 96) * F;

// ---------------------------------------------------------------- title
const TITLE_SIZE = 48;
const TITLE_CX = 332;
const TAG = 'SPECIAL PASS · No.10 > No.7 · NO-LOOK TRIVELA';
const TAG_Y = LINE_Y + 10;

// ---------------------------------------------------------------- the face (hand-drawn sprite head, Glance grid)
// Head region of hero_no10.png drawn at x4 (the Glance crop is (26, 8, 48, 26) inside it; the panel border crops it).
const HEAD = { x: 16, y: 0, w: 68, h: 50 };
const CROP = { x: 26, y: 8 };
const EYE_MID: [number, number] = [49, 23]; // sprite px
// G2 (look-off: both irises to HIS left, screen-right) as drawn by the art team on the Glance grid (MOTION_LIBRARY
// §3.8, art/final/G2): a 12-px edit of G1 in crop coordinates. Last-resort fallback only: the face of record is the
// studio's GlanceFace G2 (src/art/anim/GlanceFace.png, project "Sochetra Face"), which shot 3's inset also draws.
const G2_PATCH: readonly [number, number, string][] = [
  [17, 14, '#180411'], [18, 14, '#ffffff'], [27, 14, '#ffffff'], [28, 14, '#180411'], [29, 14, '#180411'],
  [18, 15, '#ffffff'], [20, 15, '#000000'], [26, 15, '#ffffff'], [27, 15, '#ffffff'], [28, 15, '#180411'],
  [29, 15, '#000000'], [28, 16, '#ffffff'],
];
// G2 near-eye (screen-right) iris centre in crop coords, pixel-edge convention (as StudioAnim.anchorOf returns it):
// GlanceFace G2 eyeR [28.0, 14.5] + 0.5. Used only when the strip is missing; otherwise read from the strip's anchor.
const G2_EYE_R_FALLBACK: [number, number] = [28.5, 15.0];

interface Heads {
  g1: HTMLCanvasElement;
  g2: HTMLCanvasElement;
  rim1: HTMLCanvasElement;
  rim2: HTMLCanvasElement;
  shade: HTMLCanvasElement;
  /** G2's near-eye iris centre, sprite px (CROP + the strip's eyeR anchor). The look-off glint keys off it. */
  eyeR: [number, number];
}
let heads: Heads | null = null;

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

/** The studio frame image of `key` (null while it is not exported). */
function frameImg(key: 'G1' | 'G2'): HTMLCanvasElement | null {
  const f = no10(key);
  return f ? f.a.frames[f.i].img : null;
}

/** Right-edge rim of a head canvas: the 1 px column of opaque pixels whose right neighbour is clear, in jade. */
function rimOf(src: HTMLCanvasElement): HTMLCanvasElement {
  const c = canvas(src.width, src.height);
  const g = c.getContext('2d')!;
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = HEX.jade;
  g.fillRect(0, 0, c.width, c.height);
  g.globalCompositeOperation = 'destination-out';
  g.drawImage(src, -1, 0);
  return c;
}

function buildHeads(env: Env): Heads {
  const hero = env.art.hero;
  const g1 = canvas(HEAD.w, HEAD.h);
  const a = g1.getContext('2d')!;
  a.imageSmoothingEnabled = false;
  a.drawImage(hero.img, HEAD.x, HEAD.y, HEAD.w, HEAD.h, 0, 0, HEAD.w, HEAD.h);
  // The Glance strip's G1 is the same crop on the same grid: draw it over, so the studio frame is the face of record.
  const s1 = frameImg('G1');
  if (s1 && s1.width === 48 && s1.height === 26) a.drawImage(s1, CROP.x - HEAD.x, CROP.y - HEAD.y);
  const g2 = canvas(HEAD.w, HEAD.h);
  const b = g2.getContext('2d')!;
  b.imageSmoothingEnabled = false;
  b.drawImage(g1, 0, 0);
  // G2: the studio GlanceFace strip first (the face of record, shared with shot 3), then the Glance strip's G2.
  const gf = hasAnim('GlanceFace') ? anim('GlanceFace') : null;
  const gi = gf ? findFrame(gf, 'G2') : -1;
  const fromStrip = !!gf && gi >= 0 && gf.frames[gi].name === 'G2';
  const s2 = fromStrip ? gf!.frames[gi].img : no10Final('G2') ? frameImg('G2') : null;
  const [ax, ay] = fromStrip ? gf!.anchorOf(gi, 'eyeR') : G2_EYE_R_FALLBACK;
  const eyeR: [number, number] = [CROP.x + ax, CROP.y + ay];
  if (s2 && s2.width === 48 && s2.height === 26) b.drawImage(s2, CROP.x - HEAD.x, CROP.y - HEAD.y);
  else
    for (const [x, y, col] of G2_PATCH) {
      b.fillStyle = col;
      b.fillRect(CROP.x - HEAD.x + x, CROP.y - HEAD.y + y, 1, 1);
    }
  // Ink-wash shadow (multiplied): the side away from the jade light (screen-left) and the jaw/neck sink into ink.
  const shade = canvas(HEAD.w, HEAD.h);
  const s = shade.getContext('2d')!;
  s.drawImage(g1, 0, 0);
  s.globalCompositeOperation = 'source-in';
  const gx = s.createLinearGradient(10, 0, HEAD.w * 0.6, 0);
  gx.addColorStop(0, 'rgb(128,116,150)');
  gx.addColorStop(0.5, 'rgb(214,206,222)');
  gx.addColorStop(1, 'rgb(255,255,255)');
  s.fillStyle = gx;
  s.fillRect(0, 0, HEAD.w, HEAD.h);
  s.globalCompositeOperation = 'multiply';
  // Below the chin (sprite row ~33) the collar and shoulders sink into the panel's ink.
  const gy = s.createLinearGradient(0, 33 - HEAD.y, 0, 47 - HEAD.y);
  gy.addColorStop(0, 'rgb(255,255,255)');
  gy.addColorStop(0.4, 'rgb(104,92,116)');
  gy.addColorStop(0.75, 'rgb(13,13,20)');
  gy.addColorStop(1, 'rgb(13,13,20)');
  s.fillStyle = gy;
  s.fillRect(0, 0, HEAD.w, HEAD.h);
  s.globalCompositeOperation = 'destination-in';
  s.drawImage(g1, 0, 0);
  return { g1, g2, rim1: rimOf(g1), rim2: rimOf(g2), shade, eyeR };
}

// ---------------------------------------------------------------- deterministic decoration (fixed seeds, scrolled by t)
function mk<T>(seed: number, n: number, f: (r: Rng) => T): T[] {
  const r = new Rng(seed);
  return Array.from({ length: n }, () => f(r));
}
/** Page speed lines (ink, -18°), streaming up-right. */
const STREAKS = mk(4011, 58, (r) => ({ u: r.next(), v: r.next(), len: r.range(40, 170), w: r.next() < 0.22 ? 2 : 1, a: r.range(0.35, 1), sp: r.range(0.75, 1.3) }));
/** Bottom panel motion lines (ink, horizontal), streaming left behind the boot. */
const MOTION = mk(4012, 20, (r) => ({ u: r.next(), y: r.range(178, GROUND_Y - 4), len: r.range(30, 120), w: r.next() < 0.25 ? 2 : 1, a: r.range(0.18, 0.5), sp: r.range(0.8, 1.25) }));
/** Grass tufts along the bottom panel's ground line. */
const TUFTS = mk(4013, 26, (r) => ({ x: r.range(0, 520), h: r.range(3, 8), lean: r.range(-0.5, 0.9), n: r.int(2, 3) }));

// ---------------------------------------------------------------- motion curves

/** Back-out with an adjustable (small) overshoot. */
function backOut(x: number, s: number) {
  const u = x - 1;
  return 1 + (s + 1) * u * u * u + s * u * u;
}

const slamTop = (t: number) => lerp(-740, 0, backOut(clamp(t / SLAM_T), 0.9));
const slamBot = (t: number) => lerp(760, 0, backOut(clamp((t - BOT_DELAY) / SLAM_T), 0.9));
/** Pull-off displacement (inCubic over PULL_LEN), starting `delay` after PULL_T. */
const pull = (t: number, delay = 0) => PULL_D * ease.inCubic(clamp((t - PULL_T - delay) / PULL_LEN));
/** The 1 px look-off shake (4 frames). */
const shake = (t: number) => (t >= LOOK_T && t < LOOK_T + 4 / 60 ? (Math.floor((t - LOOK_T) * 60 + 1e-6) % 2 ? -1 : 1) : 0);

/** Needle x along the line (before the pull-off). */
function needleX(t: number) {
  const run = lerp(NX0, NX1, clamp((t - NEEDLE_T0) / (NEEDLE_T1 - NEEDLE_T0)));
  // The yank: a short tug right (2 frames, a hair of overshoot) that pulls the thread taut.
  const tug = t >= YANK_T ? 9 * backOut(clamp((t - YANK_T) / (2 / 60)), 1.2) : 0;
  return run + tug;
}

/** The plucked line: standing wave with 2 interior nodes (3 lobes), 4 px, decaying over 0.25 s. x in line space. */
function pluckDisp(x: number, x0: number, x1: number, t: number) {
  if (t < YANK_T) return 0;
  const k = t - YANK_T;
  const amp = 4 * Math.pow(clamp(1 - k / 0.25), 1.6);
  if (amp <= 0) return 0;
  const f = clamp((x - x0) / Math.max(1, x1 - x0));
  return amp * Math.sin(3 * Math.PI * f) * Math.cos(k * 78);
}

/** Letters hang 2 px above the line until the yank jerks them onto it. */
function letterDrop(t: number) {
  return t < YANK_T ? -2 : -2 + 2 * backOut(clamp((t - YANK_T) / (3 / 60)), 2.2);
}

/** The face's slow drift (the top panel's own push), whole art px only so the grid never swims against the border. */
const faceDrift = (t: number) => Math.round(lerp(0, -6, ease.inOutQuad(clamp(t / DUR))));

/** Top-left of the x4 head canvas in panel space at t. */
function headOrigin(t: number): [number, number] {
  const ex = EYE_X + faceDrift(t), ey = EYE_Y;
  return [ex - (EYE_MID[0] - HEAD.x + 0.5) * F, ey - (EYE_MID[1] - HEAD.y + 0.5) * F];
}

/**
 * The look-off glint's spot in panel space: the upper-outer corner of the near eye (1.5 art px right of and 2 above
 * the G2 iris centre), off the iris so the 1 px pupils' flick to screen-right reads cleanly.
 */
function glintAt(h: Heads, t: number): [number, number] {
  const [x0, y0] = headOrigin(t);
  return [x0 + (h.eyeR[0] - HEAD.x + 1.5) * F, y0 + (h.eyeR[1] - HEAD.y - 2) * F];
}

// ---------------------------------------------------------------- module state (reset in init)
let spin = new BallSpin();
let landedTop = false, landedBot = false, looked = false, yanked = false;

// ---------------------------------------------------------------- drawing helpers

/** The page: warm paper, ink speed lines streaming up-right at -18°, screentone darkening the four corners. */
function drawPage(ctx: CanvasRenderingContext2D, t: number) {
  // Into the paper flash the page's ink (streaks, corner tone) fades with it, so the last frame is the flat paper
  // shot 2 opens on.
  const fk = ease.inQuad(clamp((t - 1.19) / 0.09));
  ctx.fillStyle = HEX.paper;
  ctx.fillRect(-40, -40, VW + 80, VH + 80);
  ctx.save();
  ctx.translate(VW / 2, VH / 2);
  ctx.rotate((-18 * Math.PI) / 180);
  const SPAN = 980, SPANY = 800;
  ctx.strokeStyle = HEX.ink;
  ctx.lineCap = 'butt';
  for (const s of STREAKS) {
    // Streams at 620 px/s, with a burst on the slam (the offset is continuous in t).
    const run = (620 * t + 300 * (1 - Math.exp(-t / 0.12))) * s.sp;
    const x = ((s.u * SPAN + run) % SPAN) - SPAN / 2;
    const y = (s.v - 0.5) * SPANY;
    ctx.globalAlpha = 0.35 * s.a * (1 - fk);
    ctx.lineWidth = s.w;
    ctx.beginPath();
    ctx.moveTo(x - s.len, y);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  ctx.restore();
  screentone(ctx, [-24, -24, VW + 48, VH + 48], 6, 0.55 * (1 - fk), { corners: 0.6 });
}

/** Horizontal ink motion lines trailing a panel while it moves fast (dir +1 = moving right). */
function slamLines(ctx: CanvasRenderingContext2D, poly: readonly (readonly [number, number])[], dx: number, speed: number) {
  const a = clamp(Math.abs(speed) / 60);
  if (a <= 0.02) return;
  const dir = speed > 0 ? 1 : -1;
  const xs = poly.map((p) => p[0] + dx), ys = poly.map((p) => p[1]);
  const edge = dir > 0 ? Math.min(...xs) : Math.max(...xs);
  const y0 = Math.min(...ys), y1 = Math.max(...ys);
  const r = new Rng(dir > 0 ? 71 : 72);
  ctx.save();
  ctx.strokeStyle = HEX.ink;
  for (let i = 0; i < 16; i++) {
    const y = lerp(y0 + 8, y1 - 8, r.next());
    const len = r.range(60, 220) * a;
    ctx.globalAlpha = 0.5 * a * r.range(0.4, 1);
    ctx.lineWidth = r.next() < 0.3 ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(edge + dir * r.range(-30, 10), y);
    ctx.lineTo(edge - dir * len, y);
    ctx.stroke();
  }
  ctx.restore();
}

/** Motion streaks across a panel's content while it moves fast (drawn inside its clip). */
function panelStreaks(ctx: CanvasRenderingContext2D, poly: readonly (readonly [number, number])[], speed: number, color: string, seed: number) {
  const a = clamp((Math.abs(speed) - 4) / 40);
  if (a <= 0) return;
  const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const r = new Rng(seed);
  ctx.save();
  ctx.strokeStyle = color;
  for (let i = 0; i < 22; i++) {
    const y = lerp(y0, y1, r.next());
    const x = lerp(x0, x1, r.next());
    const len = r.range(80, 320);
    ctx.globalAlpha = 0.55 * a * r.range(0.3, 1);
    ctx.lineWidth = r.next() < 0.3 ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(x - len / 2, y);
    ctx.lineTo(x + len / 2, y);
    ctx.stroke();
  }
  ctx.restore();
}

/** Where the thread leaves the needle (its eye, near the tail). */
const NEEDLE_EYE = 19;

/**
 * The pearl needle of light: a tapered pearl sliver with an ink outline and its eye near the tail (the thread leaves
 * from there), an emerald halo, a 3 px pearl point at the tip and a short ink speed streak behind it.
 */
function drawNeedle(ctx: CanvasRenderingContext2D, x: number, y: number, streak: number) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.emerald), x - 8, y, 26, 0.6, 1.5, 0.7);
  ctx.globalCompositeOperation = 'source-over';
  if (streak > 0) {
    ctx.strokeStyle = HEX.ink;
    ctx.lineCap = 'round';
    for (const [dy, k] of [[-4, 0.6], [4, 0.45]] as const) {
      ctx.globalAlpha = 0.7;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 26, y + dy);
      ctx.lineTo(x - 26 - streak * k, y + dy);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  const body = (pad: number) => {
    ctx.beginPath();
    ctx.moveTo(x + 2 + pad, y);
    ctx.lineTo(x - 22, y - 1.6 - pad);
    ctx.lineTo(x - 25 - pad, y);
    ctx.lineTo(x - 22, y + 1.6 + pad);
    ctx.closePath();
  };
  ctx.fillStyle = HEX.ink;
  body(1.4);
  ctx.fill();
  ctx.fillStyle = HEX.pearl;
  body(0);
  ctx.fill();
  // The eye: a 1 px ink slot near the tail.
  ctx.fillStyle = HEX.ink;
  ctx.fillRect(Math.round(x - NEEDLE_EYE - 2), Math.round(y - 0.5), 3, 1);
  ctx.restore();
  needlePoint(ctx, x, y, 0, 1, 0);
}

/** Top panel content: ink, jade light from screen-right, paper focus lines on his eyes, the face at x4. */
function drawEyesPanel(env: Env, ctx: CanvasRenderingContext2D, t: number) {
  const h = heads ?? (heads = buildHeads(env));
  const rng = env.frng(7);
  // A slow drift (the panel's own push), whole art px only so the pixel grid never swims against the border.
  const ex = EYE_X + faceDrift(t), ey = EYE_Y;
  // Jade light from screen-right.
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.emerald), 640, EYE_Y + 10, 330, 0.4, 0.9, 1.1);
  drawGlow(ctx, glowOf(PAL.jade), 660, EYE_Y, 140, 0.12, 0.6, 1.6);
  ctx.globalCompositeOperation = 'source-over';
  // Paper focus lines converging on the eyes (the manga reverse-panel look).
  focusLines(ctx, rng, ex, ey, 150, 640, 54, HEX.paper, 0.26, 3);
  // The face.
  const look = t >= LOOK_T;
  const img = look ? h.g2 : h.g1;
  const [x0, y0] = headOrigin(t);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, x0, y0, HEAD.w * F, HEAD.h * F);
  ctx.globalCompositeOperation = 'multiply';
  ctx.drawImage(h.shade, x0, y0, HEAD.w * F, HEAD.h * F);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.4;
  ctx.drawImage(look ? h.rim2 : h.rim1, x0, y0, HEAD.w * F, HEAD.h * F);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  // The look-off: eye-dart lines toward his left (screen-right), a glint and a small jade flare on the near eye.
  if (look) {
    const k = clamp(1 - (t - LOOK_T) / 0.4);
    const kin = ease.outCubic(clamp((t - LOOK_T + 1 / 60) / 0.07));
    const [sx, sy] = glintAt(h, t);
    if (k > 0) {
      ctx.save();
      ctx.strokeStyle = HEX.paper;
      ctx.lineCap = 'round';
      const bx = x0 + (71 - HEAD.x) * F;
      for (const [dy, len, w] of [[-14, 30, 2], [0, 42, 3], [14, 28, 2]] as const) {
        ctx.globalAlpha = 0.9 * k;
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.moveTo(bx + 6 * (1 - kin), ey + dy * 0.9);
        ctx.lineTo(bx + 6 + len * kin, ey + dy * 1.25);
        ctx.stroke();
      }
      ctx.restore();
    }
    // The glint waits 0.08 s so the first frames of G2 show clean pupils, then bursts small on the eye's outer corner.
    const gl = pulse(t, LOOK_T + 0.08, 0.3);
    if (gl > 0) {
      sparkle(ctx, sx, sy, 4 + 6 * gl, ease.outCubic(gl), 0.25);
      lensFlare(ctx, sx, sy, 12, 0.25 * gl, JADE_FLARE);
    }
    // A steady small catch-light once the flick has landed.
    const hold = clamp((t - LOOK_T - 0.3) / 0.1) * (0.55 + 0.1 * Math.sin(t * 19));
    if (hold > 0) sparkle(ctx, sx, sy, 3, 0.8 * hold, 0.25 + t * 0.8);
  }
}

/** Bottom panel content: inked turf on paper, ink motion lines, the boot's ink smear, T6 at x4, the pearl ball. */
function drawBootPanel(env: Env, ctx: CanvasRenderingContext2D, t: number) {
  // Motion lines streaming left (we ride with the swing).
  ctx.save();
  ctx.strokeStyle = HEX.ink;
  for (const m of MOTION) {
    const W = 760;
    const x = W - ((m.u * W + t * 900 * m.sp) % W) + 40;
    ctx.globalAlpha = m.a;
    ctx.lineWidth = m.w;
    ctx.beginPath();
    ctx.moveTo(x, m.y);
    ctx.lineTo(x + m.len, m.y);
    ctx.stroke();
  }
  ctx.restore();
  // Inked turf: screentone below an ink ground line with tufts.
  screentone(ctx, [140, GROUND_Y, 540, 70], 4, 0.6, { color: PAL.tone });
  ctx.fillStyle = HEX.ink;
  ctx.fillRect(140, GROUND_Y, 540, 2);
  ctx.save();
  ctx.strokeStyle = HEX.ink;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  for (const tf of TUFTS) {
    // Static: T6 is a held frame and the plant never slides, so the ground under it must not scroll.
    const x = tf.x + 150;
    for (let k = 0; k < tf.n; k++) {
      ctx.beginPath();
      ctx.moveTo(x + k * 3, GROUND_Y + 1);
      ctx.lineTo(x + k * 3 + tf.lean * tf.h + (k - 1) * 2, GROUND_Y + 1 - tf.h * (k === 1 ? 1.3 : 1));
      ctx.stroke();
    }
  }
  ctx.restore();
  // The swing: an ink smear along the boot's path (T4 -> T5 -> T6 'boot' anchors), feeding into the outside of the boot.
  const P = (ax: number, ay: number): TrailPt => ({ x: BOOT_X + (ax - 80) * F, y: BOOT_Y + (ay - 96) * F });
  const k0 = P(35, 79), k1 = P(50, 92), k2 = P(80, 96);
  const path: TrailPt[] = [];
  for (let i = 0; i <= 16; i++) {
    const u = i / 16;
    const b0 = (1 - u) * (1 - u), b1 = 2 * u * (1 - u), b2 = u * u;
    path.push({ x: b0 * k0.x + b1 * (k1.x + 10) + b2 * (k2.x - 6), y: b0 * k0.y + b1 * (k1.y + 14) + b2 * (k2.y - 2) });
  }
  inkSmear(ctx, path, 30, 0.3, { lines: 3 });
  // Trivela T6: the outside of the right boot on the ball.
  drawNo10(env, 'T6', BOOT_X, BOOT_Y, F, { anchor: 'boot' });
  const [bx, by] = no10Point(env, 'T6', 'ball', BOOT_X, BOOT_Y, F, { anchor: 'boot' });
  drawBall(env, spin, bx, by, 6, F, 0, 0.55, 'pearl');
  // Two curved ink spin marks round the ball's equator: clockwise from above (the front face slides left).
  spinMarks(ctx, bx, by, 6 * F, -2.4 + t * 6, { color: HEX.ink, ink: false, alpha: 1, squash: 0.8, dir: 1, len: 1.15, width: 6 });
}

interface TitleLayout {
  chars: string[];
  mids: number[];
  left: number;
  total: number;
}

function titleLayout(ctx: CanvasRenderingContext2D): TitleLayout {
  ctx.save();
  ctx.font = `${TITLE_SIZE}px ${TITLE_FONT}`;
  const chars = [...SHOT_NAME];
  const widths = chars.map((c) => ctx.measureText(c).width + TITLE_SIZE * 0.035);
  ctx.restore();
  const total = widths.reduce((p, q) => p + q, 0);
  const left = TITLE_CX - total / 2;
  let x = left;
  const mids = widths.map((w) => {
    const m = x + w / 2;
    x += w;
    return m;
  });
  return { chars, mids, left, total };
}

/** Time the needle passes x (its run is linear). */
const passT = (x: number) => NEEDLE_T0 + ((x - NX0) / (NX1 - NX0)) * (NEEDLE_T1 - NEEDLE_T0);

/**
 * The stitched title: letters pop in as the needle passes their centre (scale 0 -> 1, pulled 3 px down onto the line),
 * hang 2 px above it until the yank jerks them onto it, and ride the plucked string. Ink fill, 2 px jade inner stroke,
 * 3 px paper outer stroke (with a 3 px ink drop under it), skew -0.12.
 */
function drawTitle(ctx: CanvasRenderingContext2D, L: TitleLayout, t: number, off: number, lx0: number, lx1: number) {
  ctx.save();
  ctx.font = `${TITLE_SIZE}px ${TITLE_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  const drop = letterDrop(t);
  for (const pass of [0, 1, 2, 3]) {
    L.chars.forEach((c, i) => {
      if (c === ' ') return;
      const mid = L.mids[i];
      const lt = t - passT(mid);
      if (lt < 0) return;
      const sc = backOut(clamp(lt / 0.09), 1.6);
      const dy = -3 * (1 - ease.outCubic(clamp(lt / 0.12))) + drop + pluckDisp(mid, lx0, lx1, t);
      ctx.save();
      ctx.globalAlpha = clamp(lt / 0.03);
      ctx.translate(mid + off, LINE_Y + dy);
      ctx.transform(1, 0, -0.12, 1, 0, 0);
      ctx.scale(Math.max(0.001, sc), Math.max(0.001, sc));
      if (pass === 0) {
        ctx.strokeStyle = HEX.ink;
        ctx.lineWidth = 10;
        ctx.strokeText(c, 3, 3);
        ctx.fillStyle = HEX.ink;
        ctx.fillText(c, 3, 3);
      } else if (pass === 1) {
        ctx.strokeStyle = HEX.paper;
        ctx.lineWidth = 10;
        ctx.strokeText(c, 0, 0);
      } else if (pass === 2) {
        ctx.strokeStyle = HEX.jade;
        ctx.lineWidth = 4;
        ctx.strokeText(c, 0, 0);
      } else {
        ctx.fillStyle = HEX.ink;
        ctx.fillText(c, 0, 0);
        // A jade flash across a fresh letter as it lands.
        const g = clamp(1 - lt / 0.1);
        if (g > 0) {
          ctx.globalAlpha = 0.7 * g;
          ctx.fillStyle = HEX.jade;
          ctx.fillText(c, 0, 0);
        }
      }
      ctx.restore();
    });
  }
  ctx.restore();
}

/** The tag: a paper caption strip under the line, unrolled by the needle as it passes. */
function drawTag(ctx: CanvasRenderingContext2D, nx: number, off: number, L: TitleLayout) {
  ctx.save();
  ctx.font = `10px ${PIXEL_FONT}`;
  const tw = ctx.measureText(TAG).width;
  ctx.restore();
  const w = tw + 34;
  const x = L.left + L.total / 2 - w / 2 + 14;
  const reveal = nx - x;
  if (reveal <= 0) return;
  ctx.save();
  ctx.translate(off, 0);
  ctx.beginPath();
  ctx.rect(x - 8, TAG_Y - 6, Math.min(w + 16, reveal + 2), 30);
  ctx.clip();
  ctx.save();
  ctx.translate(x, TAG_Y);
  ctx.transform(1, 0, -0.12, 1, 0, 0);
  ctx.fillStyle = HEX.ink;
  ctx.fillRect(2, 2, w, 16);
  ctx.fillRect(-1, -1, w + 2, 18);
  ctx.fillStyle = HEX.paper;
  ctx.fillRect(0, 0, w, 16);
  ctx.fillStyle = HEX.jade;
  ctx.fillRect(0, 14, w, 2);
  ctx.restore();
  needleEye(ctx, x + 12, TAG_Y + 7.5, 15, 1, 0, 1, 1, { fill: 0.5 });
  ctx.font = `10px ${PIXEL_FONT}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = HEX.ink;
  ctx.fillText(TAG, x + 24, TAG_Y + 3);
  ctx.restore();
}

export const shotStitch: Shot = {
  name: 'Stitch-in',
  dur: DUR,
  seed: 401,
  cues: [
    // The opening figure: D4-A4-E5 plucked 60 ms apart (open strings tuning), over a soft boom.
    { at: 0, fn: (env) => (env.sfx.strum([N.D4, N.A4, N.E5], 0.06, 1.4, 0.4), env.sfx.boom(0.35)) },
    { at: LOOK_T, fn: (env) => (env.sfx.tick(), env.sfx.shing(1.3)) },
    { at: NEEDLE_T0, fn: (env) => env.sfx.zip(0.5, 600, 4000) },
    { at: YANK_T, fn: (env) => (env.sfx.pluck(N.D6, 0.3), env.sfx.crack(0.25)) },
    { at: PULL_T, fn: (env) => env.sfx.whoosh(0.18, 2000, 7000, 0.3) },
  ],
  prepare(env) {
    heads = buildHeads(env);
  },
  init(env) {
    env.sfx.clearBus();
    spin = new BallSpin();
    landedTop = landedBot = looked = yanked = false;
    env.cam.set(VW / 2, VH / 2, 1, 0);
    env.cam.shakeAmp = 10;
    env.cam.shakeRoll = 0; // no camera roll in this move
  },
  update(env, t, dt) {
    const { rng, parts, cam } = env;
    // A slow 3 % push-in under everything.
    cam.set(VW / 2, VH / 2, 1 + 0.03 * ease.inOutQuad(clamp(t / DUR)), 0);
    // The ball spins: sidespin (clockwise from above) over a forward roll.
    spin.rotate(0, 1, 0, -14 * dt);
    spin.rotate(0, 0, 1, 9 * dt);

    // Panel landings: cam hit, ink specks thrown off the leading edge.
    const land = (poly: readonly (readonly [number, number])[], dir: 1 | -1, n: number) => {
      const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
      const ex = dir > 0 ? Math.max(...xs) : Math.min(...xs);
      for (let i = 0; i < n; i++) {
        const y = rng.range(Math.min(...ys) + 10, Math.max(...ys) - 10);
        const a = (dir > 0 ? 0 : Math.PI) + rng.range(-0.7, 0.7);
        const s = rng.range(80, 260);
        parts.spawn({
          kind: PK.Pixel, x: Math.min(VW - 2, Math.max(2, ex)), y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 30, drag: 5, ay: 120,
          max: rng.range(0.2, 0.42), s0: rng.range(1.5, 3), s1: 1, ramp: 'ink', r0: 0.65, r1: 1, a0: 0.9, a1: 0, add: false, layer: 1,
        });
      }
    };
    if (!landedTop && t >= SLAM_T * 0.62) {
      landedTop = true;
      cam.hit(0.25);
      land(TOP, 1, 12);
    }
    if (!landedBot && t >= BOT_DELAY + SLAM_T * 0.62) {
      landedBot = true;
      cam.hit(0.12);
      land(BOT, -1, 10);
    }
    // The look-off: a few jade motes leave the near eye's glint spot toward his left (screen-right).
    if (!looked && t >= LOOK_T) {
      looked = true;
      const [sx, sy] = glintAt(heads ?? (heads = buildHeads(env)), t);
      for (let i = 0; i < 7; i++) {
        const a = rng.range(-0.5, 0.35);
        const s = rng.range(90, 220);
        parts.spawn({
          kind: PK.Pixel, x: sx, y: sy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 7,
          max: rng.range(0.18, 0.32), s0: rng.range(1.5, 2.5), s1: 1, ramp: 'jade', r0: 0.1, r1: 0.6, add: true, layer: 1,
        });
      }
    }
    // The needle sheds pearl/jade motes while it stitches (they fade within ~20 px).
    if (t >= NEEDLE_T0 && t < NEEDLE_T1) {
      const nx = needleX(t);
      for (let i = 0; i < 2; i++) {
        parts.spawn({
          kind: PK.Pixel, x: nx - rng.range(2, 14), y: LINE_Y + rng.range(-3, 3), vx: rng.range(-60, -10), vy: rng.range(-40, 25), drag: 6,
          max: rng.range(0.14, 0.28), s0: rng.range(1.2, 2.4), s1: 0.8, ramp: 'jade', r0: rng.range(0, 0.3), r1: 0.75, add: rng.next() < 0.5, layer: 1,
        });
      }
    }
    // The yank: ink specks and jade motes snap off the taut end.
    if (!yanked && t >= YANK_T) {
      yanked = true;
      cam.hit(0.1);
      const nx = needleX(t);
      for (let i = 0; i < 10; i++) {
        const a = rng.range(-0.9, 0.9);
        const s = rng.range(80, 240);
        const ink = i % 2 === 0;
        parts.spawn({
          kind: PK.Pixel, x: nx - 4, y: LINE_Y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 7, max: rng.range(0.16, 0.3),
          s0: rng.range(1.5, 2.6), s1: 1, ramp: ink ? 'ink' : 'jade', r0: ink ? 0.7 : 0.1, r1: ink ? 1 : 0.7, add: !ink, layer: 1,
        });
      }
    }
  },
  render(env, t) {
    const { ctx, fx } = env;
    env.world();
    drawPage(ctx, t);

    // Panel offsets: slam in, the look-off shake, the pull-off after the needle (top 1 frame behind it, bottom 2 more).
    // The yank tugs the sewn panels 3 px toward the needle.
    const sh = shake(t) + 3 * pulse(t, YANK_T, 0.14) * clamp((t - YANK_T) * 60);
    const dTop = slamTop(t) + pull(t, 1 / 60) + sh;
    const dBot = slamBot(t) + pull(t, 3 / 60) + sh;
    const vTop = slamTop(t) - slamTop(t - 1 / 60) + (pull(t, 1 / 60) - pull(t - 1 / 60, 1 / 60));
    const vBot = slamBot(t) - slamBot(t - 1 / 60) + (pull(t, 3 / 60) - pull(t - 1 / 60, 3 / 60));
    slamLines(ctx, TOP, dTop, vTop);
    slamLines(ctx, BOT, dBot, vBot);

    // Cloth drawn by a thread: the part of each panel far from the line lags behind it.
    const shear = (d: number) => 0.32 * Math.pow(clamp(d / PULL_D), 0.6);
    const sTop = shear(pull(t, 1 / 60)), sBot = shear(pull(t, 3 / 60));
    ctx.save();
    ctx.transform(1, 0, sTop, 1, -sTop * LINE_Y, 0);
    mangaPanels(ctx, [{ poly: TOP, dx: dTop, fill: HEX.ink, draw: (c) => (drawEyesPanel(env, c, t), panelStreaks(c, TOP, vTop, HEX.paper, 81)) }], t);
    ctx.restore();
    ctx.save();
    ctx.transform(1, 0, -sBot, 1, sBot * LINE_Y, 0);
    // It overlaps the top panel, so its own gutter must be the full 6 px of paper between them.
    mangaPanels(ctx, [{ poly: BOT, dx: dBot, gutter: 6, draw: (c) => (drawBootPanel(env, c, t), panelStreaks(c, BOT, vBot, HEX.ink, 82)) }], t);
    ctx.restore();

    // The stitch: thread, title, tag and needle, all pulled off with the needle.
    if (t >= NEEDLE_T0) {
      const off = pull(t);
      const L = titleLayout(ctx);
      const nx = needleX(t);
      const lx0 = NX0, lx1 = nx - NEEDLE_EYE;
      // Running stitch behind the needle: dash ~ half a letter, a dip, two ink needle holes per dip.
      const pts: TrailPt[] = [];
      for (let x = lx0; x < lx1; x += 5) pts.push({ x: x + off, y: LINE_Y + pluckDisp(x, lx0, lx1, t) });
      pts.push({ x: lx1 + off, y: LINE_Y });
      drawTag(ctx, nx, off, L);
      drawTitle(ctx, L, t, off, lx0, lx1);
      const half = L.total / L.chars.length / 2;
      threadLine(ctx, pts, 2.4, 1, { stitch: { dash: half + 2, dip: half * 0.55, phase: 0 }, halo: 0.9 });
      // The needle: on its run, the tug, then off the right edge.
      if (nx + off < VW + 40) {
        const tremble = t >= YANK_T && t < PULL_T ? Math.sin(t * 90) * pulse(t, YANK_T, 0.2) * 1.5 : 0;
        drawNeedle(ctx, nx + off, LINE_Y + tremble, t < NEEDLE_T1 ? 22 : Math.min(60, off * 0.3));
      }
      // Tension ticks at the taut end on the yank.
      const yk = pulse(t, YANK_T, 0.16);
      if (yk > 0) {
        ctx.save();
        ctx.strokeStyle = HEX.ink;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.globalAlpha = yk;
        for (const a of [-0.9, -0.45, 0.45, 0.9]) {
          ctx.beginPath();
          ctx.moveTo(nx + off + 6 + Math.cos(a) * 8, LINE_Y + Math.sin(a) * 8);
          ctx.lineTo(nx + off + 6 + Math.cos(a) * 18, LINE_Y + Math.sin(a) * 18);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    env.parts.draw(ctx, 1);

    // ---------------------------------------------------------------- post
    meridianGrade(fx, true);
    fx.vignette = 0.25;
    fx.ca = 0.004 * pulse(t, SLAM_T * 0.62, 0.12) + 0.003 * pulse(t, YANK_T, 0.1);
    // Paper flash into the cut (the next shot opens out of it).
    paperFlash(fx, 0.6 * ease.inQuad(clamp((t - 1.19) / 0.09)));
  },
};
