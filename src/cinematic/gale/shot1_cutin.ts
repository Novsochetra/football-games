// SHOT 1 — CUT-IN (1.2 s): the GALE HAMMER declaration (SPEC.md §1).
// An elliptical window springs open like a squashed ball (a vertical sliver -> 110 % -> 100 %), with No.10's
// face inside at integer x4 and a cyan rim light from the right; a ring of dew beads orbits its inside edge.
// Behind it, wavy cyan isobars contract (pressure building, faster and faster). His eyes glint at 0.38, the
// title springs out letter by letter on a pressure wave (each letter a 4 px sliver overshooting to 115 %),
// riding the first statement of the G-B-D air-tone motif. At 1.00 the window squashes flat into a line and at
// 1.12 it POPS: the ring-pop wipe (GALE HAMMER's own transition) carries a light ice disc out past the frame
// edges, so the hard cut at 1.20 lands on shot 2's cyan flash-in.

import type { Shot, Env } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { TAU, clamp, ease, keys, lerp, type RGB } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import { lensFlare, pixelText, sparkle, TITLE_FONT, PIXEL_FONT } from '../../art/fx';
import { AIR_TONES, BLINK, HEX, MUFFLE, PAL, SHOT_NAME, galeGrade, pulse, pushShock } from './common';

const DUR = 1.2;

// ---------------------------------------------------------------- layout
const WX = VW / 2; // window centre
const WY = 140;
const WA = 226; // window half-width / half-height at rest (100 %)
const WB = 72;
const SC = 4; // face crop scale (integer, nearest-neighbour)
const ISO_X = VW / 2; // isobar centre (the frame centre)
const ISO_Y = VH / 2 - 14;
const ISO_K = 0.56; // isobar squash (matches the frame's aspect)
const TITLE_SIZE = 62;
const TITLE_Y = 294; // baseline
const TAG_Y = 306; // top of the tag plate
const TAG = 'SPECIAL SHOT · No.10 · LONG-RANGE 30 M';
const DEW_GLOW: RGB = [140, 220, 255];

// ---------------------------------------------------------------- beats
const T_SLIVER = 0.04; // the sliver arrives (stretching tall) before it springs open
const T_OVER = 0.14; // 110 % overshoot
const T_OPEN = 0.22; // settled at 100 %
const T_GLINT = 0.38;
const T_TAG = 0.24;
const T_TITLE = 0.5;
const STAG = 0.03; // letter stagger
const T_SQ = 1.0; // exit squash starts
const T_POP = 1.12;
const TONES = [0.52, 0.64, 0.76] as const;
const TONE_LETTER = [0, 5, 9] as const; // G, H, E: the letters each air tone rides

// ---------------------------------------------------------------- module state (reset in init)
let glinted = false;
let popped = false;
let sprung = false;
let toned = [false, false, false];

// Rim-light mask: the sprite's right-edge pixels (a cyan copy minus itself shifted 1 px left), built once.
let rimCv: HTMLCanvasElement | null = null;
let rimSrc: HTMLCanvasElement | null = null;
function rimOf(img: HTMLCanvasElement): HTMLCanvasElement {
  if (rimCv && rimSrc === img) return rimCv;
  const cv = document.createElement('canvas');
  cv.width = img.width;
  cv.height = img.height;
  const g = cv.getContext('2d')!;
  g.drawImage(img, 0, 0);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = HEX.cyan;
  g.fillRect(0, 0, cv.width, cv.height);
  g.globalCompositeOperation = 'destination-out';
  g.drawImage(img, -1, 0);
  rimCv = cv;
  rimSrc = img;
  return cv;
}

// ---------------------------------------------------------------- shapes over time (pure functions of t)

/** Window size multipliers [sx, sy] at t (0 after the pop). */
function winScale(t: number): [number, number] {
  if (t >= T_POP) return [0, 0];
  let sx: number, sy: number;
  if (t < T_SLIVER) {
    // The sliver arrives: 6 % wide, stretching from a short dash to tall.
    sx = 0.06;
    sy = lerp(0.55, 1.3, ease.outQuad(t / T_SLIVER));
  } else {
    if (t < T_OVER) sx = lerp(0.06, 1.1, ease.outCubic((t - T_SLIVER) / (T_OVER - T_SLIVER)));
    else if (t < T_OPEN) sx = lerp(1.1, 1.0, ease.inOutQuad((t - T_OVER) / (T_OPEN - T_OVER)));
    else sx = 1;
    // Squash and stretch: narrow = tall, overshoot = flatter.
    sy = sx < 1 ? 1 + 0.3 * (1 - sx) : 1 - 1.0 * (sx - 1);
  }
  // Pressure building: the settled window very slowly flattens a touch (anticipation of the exit).
  const hold = ease.inQuad(clamp((t - T_OPEN) / (T_SQ - T_OPEN)));
  sx *= 1 + 0.02 * hold;
  sy *= 1 - 0.04 * hold;
  // Each air tone: the ball-window gives a small breath (squash and stretch, never a pulse in size).
  for (const tt of TONES) {
    const p = pulse(t, tt, 0.14) * Math.sin(Math.min(1, (t - tt) / 0.14) * Math.PI);
    sx *= 1 + 0.014 * p;
    sy *= 1 - 0.03 * p;
  }
  // Exit: squash vertically flat into a horizontal line (a breath of anticipation first, inBack).
  if (t >= T_SQ) {
    const u = clamp((t - T_SQ) / (T_POP - T_SQ));
    sy *= Math.max(0.02, 1 - ease.inBack(u));
    sx *= 1 + 0.16 * ease.inQuad(u);
  }
  return [sx, sy];
}

/** Isobar contraction phase (ring spacings travelled): ~40 %/s at first, speeding up toward the exit. */
const ISO_N = 8;
const ISO_RMIN = 50;
const ISO_RMAX = 560;
const ISO_D = Math.log(ISO_RMAX / ISO_RMIN) / ISO_N;
function isoPhase(t: number) {
  const r0 = -Math.log(0.6); // 40 %/s
  const tt = Math.min(t, T_POP);
  return (r0 / ISO_D) * (tt + (1.8 * tt * tt * tt) / (3 * T_POP * T_POP));
}

/** One wavy isobar contour: radius wobble sin(5θ + t·3 + phase), 1 px cyan on a 3 px navy halo. */
function isobar(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, k: number, t: number, ph: number, a: number, wob = 0.035) {
  if (a <= 0.004 || R < 1) return;
  ctx.beginPath();
  const n = Math.max(48, Math.min(120, Math.round(R / 4)));
  for (let j = 0; j <= n; j++) {
    const th = (j / n) * TAU;
    const r = R * (1 + wob * Math.sin(5 * th + t * 3 + ph));
    const x = cx + Math.cos(th) * r, y = cy + Math.sin(th) * r * k;
    j ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = clamp(a * 1.1);
  ctx.strokeStyle = HEX.navy;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = clamp(a);
  ctx.strokeStyle = HEX.cyan;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

/** The background isobar field. Contracts until the pop, then is blown outward by it. */
function drawIsobars(ctx: CanvasRenderingContext2D, t: number, boost: number) {
  const ph = isoPhase(t);
  const blow = t >= T_POP ? Math.exp(10 * (t - T_POP)) : 1;
  const fadeOut = t >= T_POP ? 1 - clamp((t - T_POP) / 0.07) : 1;
  const n0 = Math.floor(ph);
  for (let n = n0; n <= n0 + ISO_N + 1; n++) {
    const q = n - ph; // 0 = innermost, ISO_N = outermost
    if (q < 0 || q > ISO_N) continue;
    const R = ISO_RMIN * Math.exp(q * ISO_D) * blow;
    const edgeIn = clamp((ISO_N - q) / 1.2); // fade in at the outside
    const edgeOut = clamp(q / 1.4); // fade out toward the centre (behind the window anyway)
    const a = (0.35 + boost) * edgeIn * edgeOut * fadeOut;
    isobar(ctx, ISO_X, ISO_Y, R, ISO_K, t, n * 1.7, a);
  }
}

/** Damped spring for each title letter: from the 4 px sliver to a 115 % overshoot, settling at 100 %. */
function letterSpring(lt: number, s0: number): number {
  if (lt <= 0) return s0;
  // Peak overshoot ~1.15 at ~0.065 s, settled by ~0.14 s.
  const decay = 0.0363;
  const per = 0.13;
  return 1 + (s0 - 1) * Math.exp(-lt / decay) * Math.cos((TAU * lt) / per);
}

/** Ice title fill gradient (top white -> ice -> pale cyan bottom). */
function titleFill(ctx: CanvasRenderingContext2D, size: number) {
  const g = ctx.createLinearGradient(0, -size * 0.8, 0, 0);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.5, HEX.ice);
  g.addColorStop(1, '#9fe6ff');
  return g;
}

interface Glyph {
  c: string;
  x: number; // centre x
  w: number;
}

function layoutTitle(ctx: CanvasRenderingContext2D): Glyph[] {
  ctx.save();
  ctx.font = `${TITLE_SIZE}px ${TITLE_FONT}`;
  const ws = [...SHOT_NAME].map((c) => ctx.measureText(c).width + TITLE_SIZE * (c === ' ' ? 0.02 : 0.045));
  ctx.restore();
  const total = ws.reduce((a, b) => a + b, 0);
  let x = WX - total / 2;
  return [...SHOT_NAME].map((c, i) => {
    const g = { c, x: x + ws[i] / 2, w: ws[i] };
    x += ws[i];
    return g;
  });
}

/** Eye centres (world px) for the face drawn with its sprite origin at (fx0, fy0). */
function eyePts(env: Env, fx0: number, fy0: number): [number, number][] {
  return env.art.hero.eyes.map(([ex, ey]) => [fx0 + (ex + 0.5) * SC, fy0 + (ey + 0.5) * SC] as [number, number]);
}

/** Sprite origin of the face at t (whole px; it drifts slowly left across the shot, a parallax against the window). */
function faceOrigin(env: Env, t: number): [number, number] {
  const [a, b] = env.art.hero.eyes;
  const mx = (a[0] + b[0]) / 2 + 0.5;
  const my = (a[1] + b[1]) / 2 + 0.5;
  const drift = Math.round(lerp(4, -4, ease.inOutQuad(clamp(t / DUR))));
  return [Math.round(WX - mx * SC) + drift, Math.round(WY - 2 - my * SC)];
}

// ---------------------------------------------------------------- the shot

export const shotCutIn: Shot = {
  name: 'Cut-in',
  dur: DUR,
  seed: 301,
  muffle: MUFFLE[1],
  cues: [
    { at: 0, fn: (env) => env.sfx.stinger() },
    { at: 0.02, fn: (env) => env.sfx.inhale(0.4) },
    { at: T_GLINT, fn: (env) => env.sfx.shing(1.1) },
    { at: T_TITLE, fn: (env) => (env.sfx.kick(0.35), env.sfx.whoosh(0.3, 800, 2400, 0.25)) },
    { at: TONES[0], fn: (env) => env.sfx.airTone(AIR_TONES.G5, 0.3) },
    { at: TONES[1], fn: (env) => env.sfx.airTone(AIR_TONES.B5, 0.3) },
    { at: TONES[2], fn: (env) => env.sfx.airTone(AIR_TONES.D6, 0.3) },
    { at: T_POP, fn: (env) => (env.sfx.crack(0.8), env.sfx.boom(0.4)) },
  ],
  prepare(env) {
    rimOf(env.art.hero.img);
  },
  init(env) {
    env.sfx.clearBus();
    glinted = false;
    popped = false;
    sprung = false;
    toned = [false, false, false];
    rimOf(env.art.hero.img);
    env.cam.set(VW / 2, VH / 2, 1, 0);
    env.cam.shakeRoll = 0; // GALE HAMMER never rolls the camera
    env.cam.shakeAmp = 7;
  },
  update(env, t, dt) {
    const { rng, parts } = env;

    // Air and dew drawn inward toward the window (the inhale, then pressure building faster to the exit).
    if (t < T_POP) {
      const inhale = t >= 0.02 && t < 0.42 ? 1 : 0; // the reverse sweep cuts off hard at 0.42
      const build = ease.inQuad(clamp((t - 0.5) / (T_POP - 0.5)));
      const rate = 1.5 + 2.5 * inhale + 3 * build;
      const n = Math.floor(rate * dt * 60 + rng.next());
      for (let i = 0; i < n; i++) {
        const a = rng.range(0, TAU);
        const r = rng.range(330, 470);
        const x = WX + Math.cos(a) * r, y = ISO_Y + Math.sin(a) * r * ISO_K;
        const dx = WX - x, dy = WY - y;
        const l = Math.hypot(dx, dy) || 1;
        const sp = rng.range(110, 220) * (1 + 0.8 * build);
        parts.spawn({
          kind: rng.next() < 0.7 ? PK.Streak : PK.Pixel, x, y, vx: (dx / l) * sp, vy: (dy / l) * sp, drag: -1.4,
          max: rng.range(0.45, 0.7), s0: rng.range(1, 1.8), s1: 0.8, k: 1.7,
          ramp: 'dew', r0: 0.1, r1: 0.9, a0: 0.75, a1: 0.1, layer: 0,
        });
      }
    }

    // 0.14 the window hits its 110 % overshoot: dew flicks off both tips.
    if (!sprung && t >= T_OVER) {
      sprung = true;
      for (const side of [-1, 1]) {
        for (let i = 0; i < 12; i++) {
          const a = (side > 0 ? 0 : Math.PI) + rng.range(-0.5, 0.5);
          const s = rng.range(160, 420);
          parts.spawn({
            kind: rng.next() < 0.5 ? PK.Streak : PK.Pixel, x: WX + side * WA * 1.1, y: WY + rng.range(-8, 8),
            vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.6, drag: 4.5, max: rng.range(0.25, 0.45), s0: rng.range(1.2, 2.2), s1: 0.6,
            ramp: 'dew', r0: 0, r1: 0.85, k: 1, a0: 1, a1: 0, layer: 1,
          });
        }
      }
    }

    // 0.38 eye glint: a few ice shards off each eye.
    if (!glinted && t >= T_GLINT) {
      glinted = true;
      const [fx0, fy0] = faceOrigin(env, t);
      for (const [ex, ey] of eyePts(env, fx0, fy0)) {
        for (let i = 0; i < 7; i++) {
          const a = rng.range(0, TAU);
          const s = rng.range(120, 300);
          parts.spawn({
            kind: PK.Streak, x: ex, y: ey, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.7, drag: 5,
            max: rng.range(0.18, 0.32), s0: rng.range(1, 1.6), s1: 0.3, ramp: 'dew', r0: 0, r1: 0.8, k: 1.2, layer: 1,
          });
        }
      }
    }

    // Each air tone: a puff of dew motes off the letter it rides.
    for (let k = 0; k < 3; k++) {
      if (toned[k] || t < toneRingAt(k)) continue;
      toned[k] = true;
      const g = layoutTitle(env.ctx)[TONE_LETTER[k]];
      for (let i = 0; i < 10; i++) {
        const a = rng.range(-Math.PI, 0);
        const s = rng.range(40, 120);
        parts.spawn({
          kind: PK.Pixel, x: g.x + rng.range(-10, 10), y: TITLE_Y - TITLE_SIZE * 0.4 + rng.range(-12, 12),
          vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.6 - 20, drag: 2.5,
          max: rng.range(0.35, 0.6), s0: 2, s1: 1, ramp: 'dew', r0: 0, r1: 0.9, a0: 0.9, a1: 0, layer: 1,
        });
      }
    }

    // 1.12 POP: the flattened window bursts into a ring (GALE's ring-pop wipe).
    if (!popped && t >= T_POP) {
      popped = true;
      // The PK.Ring in the cobalt ramp, drawn over the wipe (layer 2): normal blend so it reads on the ice disc.
      parts.spawn({ kind: PK.Ring, x: WX, y: WY, s0: 20, s1: 300, max: 0.12, k: 0.72, ramp: 'cobalt', r0: 0.3, r1: 0.95, a0: 1, a1: 0, add: false, layer: 2 });
      for (let i = 0; i < 40; i++) {
        const a = rng.range(0, TAU);
        const s = rng.range(700, 1500);
        parts.spawn({
          kind: PK.Streak, x: WX + Math.cos(a) * WA * 0.9 * rng.next(), y: WY, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.75,
          drag: 2, max: rng.range(0.12, 0.22), s0: rng.range(1.2, 2.4), s1: 0.6, ramp: 'dew', r0: 0, r1: 0.8, k: 1.3, layer: 1,
        });
      }
      env.cam.hit(0.35);
    }

    // Camera: the whole composition pushes in 1.00 -> 1.06 (accelerating, the pressure builds).
    // Accents: a small snap toward his eyes on the glint, a bump on the title's first thump.
    const ga = t - T_GLINT;
    const snap = ga < 0 ? 0 : ga < 2 / 60 ? ga / (2 / 60) : clamp(1 - (ga - 2 / 60) / 0.3);
    env.cam.zoom = lerp(1, 1.06, Math.pow(clamp(t / DUR), 1.4)) + 0.018 * ease.outQuad(snap) + 0.01 * pulse(t, T_TITLE, 0.16);
  },
  render(env, t) {
    const { ctx, fx } = env;
    const hero = env.art.hero;
    env.world();
    const frng = env.frng();
    const [sx, sy] = winScale(t);
    const a = WA * sx, b = WB * sy;
    const tonePulse = Math.max(...TONES.map((tt) => pulse(t, tt, 0.18)));

    // ------------------------------------------------------------ backdrop: navy -> cobalt
    const bg = ctx.createLinearGradient(0, -40, 0, VH + 40);
    bg.addColorStop(0, '#060b2a');
    bg.addColorStop(0.45, HEX.navy);
    bg.addColorStop(0.8, '#162a8c');
    bg.addColorStop(1, '#2440b8');
    ctx.fillStyle = bg;
    ctx.fillRect(-60, -60, VW + 120, VH + 120);
    // Soft cobalt bloom behind the window.
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.cobalt), WX, WY + 10, 330, 0.32, 1, 0.62);
    ctx.globalCompositeOperation = 'source-over';

    // The sliver arrives hot: a vertical cyan-ice glow that cools as the window springs open (no full-frame flash).
    const hot = 1 - clamp(t / 0.12);
    if (hot > 0) {
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.cyan), WX, WY, 150, 0.55 * hot, 0.35 + 0.65 * (1 - hot), 1.1);
      drawGlow(ctx, glowOf(PAL.ice), WX, WY, 90, 0.4 * hot * hot, 0.25, 1.2);
      ctx.globalCompositeOperation = 'source-over';
    }

    drawIsobars(ctx, t, 0.15 * tonePulse + 0.1 * pulse(t, T_GLINT, 0.25) + (t >= T_POP ? 0.3 : 0));
    env.parts.draw(ctx, 0);

    // ------------------------------------------------------------ the window
    if (t < T_POP && b > 0.5) {
      ctx.save();
      // Navy outer halo (normal blend): a soft wide band, then the solid 6 px band.
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = HEX.navy;
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.ellipse(WX, WY, a + 11, b + 11, 0, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = HEX.navy;
      ctx.beginPath();
      ctx.ellipse(WX, WY, a + 11, b + 11, 0, 0, TAU);
      ctx.fill();

      // Inside: cobalt backlight behind his head, navy toward the rim.
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(WX, WY, a, b, 0, 0, TAU);
      ctx.clip();
      const ig = ctx.createRadialGradient(WX + 30, WY - 16, 10, WX, WY, Math.max(a, 40));
      ig.addColorStop(0, '#3f6cf2');
      ig.addColorStop(0.35, '#2446c4');
      ig.addColorStop(0.75, '#14267e');
      ig.addColorStop(1, HEX.navy);
      ctx.fillStyle = ig;
      ctx.fillRect(WX - a - 4, WY - b - 4, a * 2 + 8, b * 2 + 8);
      // Inner isobars: contour rings around his head, contracting (pressure building inside the ball).
      const ip = isoPhase(t) * 1.15;
      const hx = WX, hy = WY - 10;
      for (let n = Math.floor(ip); n <= Math.floor(ip) + 6; n++) {
        const q = n - ip; // 0 inner .. 5 outer
        if (q < 0 || q > 5) continue;
        const R = 70 * Math.exp(q * 0.27);
        isobar(ctx, hx, hy, R * sx, 0.5 * Math.max(0.05, sy), t, n * 2.3, 0.26 * clamp(q / 0.8) * clamp((5 - q) / 0.8), 0.04);
      }
      // A cool cyan light source low on the right rim (it throws the rim light on his face).
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.cyan), WX + a * 0.86, WY + 4, 110, 0.2, 0.55, 1);
      ctx.globalCompositeOperation = 'source-over';

      // No.10's face, integer x4, nearest-neighbour (the hand-drawn face sprite, G1).
      const [fx0, fy0] = faceOrigin(env, t);
      ctx.imageSmoothingEnabled = false;
      const rows = 58; // hair tips down to the chest number
      ctx.drawImage(hero.img, 0, 0, hero.w, rows, fx0, fy0, hero.w * SC, rows * SC);
      // Cool cyan rim light from the right: the right-edge pixels, additive at 0.5.
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.5;
      ctx.drawImage(rimOf(hero.img), 0, 0, hero.w, rows, fx0, fy0, hero.w * SC, rows * SC);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      // Convex falloff: the window darkens toward its rim like a ball.
      ctx.save();
      ctx.translate(WX, WY);
      ctx.scale(1, b / Math.max(a, 1));
      const ev = ctx.createRadialGradient(0, 0, a * 0.55, 0, 0, Math.max(a, 2));
      ev.addColorStop(0, 'rgba(10,18,56,0)');
      ev.addColorStop(0.7, 'rgba(10,18,56,0.25)');
      ev.addColorStop(1, 'rgba(10,18,56,0.8)');
      ctx.fillStyle = ev;
      ctx.fillRect(-a - 4, -a - 4, a * 2 + 8, a * 2 + 8);
      ctx.restore();

      // Ring of 12 dew beads orbiting the inside edge (2 px white cores on a cyan glint).
      const beads: [number, number][] = [];
      for (let i = 0; i < 12; i++) {
        const th = (i / 12) * TAU + t * 1.5;
        const ins = 11 + 2 * Math.sin(t * 7 + i * 1.9);
        beads.push([WX + Math.cos(th) * Math.max(0, a - ins), WY + Math.sin(th) * Math.max(0, b - ins * 0.8)]);
      }
      ctx.globalCompositeOperation = 'lighter';
      for (const [bx, by] of beads) drawGlow(ctx, glowOf(DEW_GLOW), bx, by, 5, 0.55 * (0.7 + 0.3 * frng.next()));
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#ffffff';
      for (const [bx, by] of beads) ctx.fillRect(Math.round(bx - 1), Math.round(by - 1), 2, 2);

      // Glossy ball highlight: a short soft ice arc inside the upper left of the rim.
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = 'rgba(238,251,255,0.28)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.ellipse(WX, WY, Math.max(1, a - 6), Math.max(1, b - 6), 0, Math.PI * 1.1, Math.PI * 1.32);
      ctx.stroke();
      ctx.lineCap = 'butt';
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();

      // Border: the 3 px cobalt rim, then the 2 px ice outline on the window's edge.
      ctx.strokeStyle = HEX.cobalt;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(WX, WY, a + 3.5, b + 3.5, 0, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = HEX.ice;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(WX, WY, a + 1, Math.max(0.5, b + 1), 0, 0, TAU);
      ctx.stroke();
      // As it squashes flat, the compressed line heats up (ice glow over its navy halo).
      if (t >= T_SQ) {
        const u = clamp((t - T_SQ) / (T_POP - T_SQ));
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, glowOf(PAL.cyan), WX, WY, a * 0.9, 0.5 * ease.inQuad(u), 1, 0.08);
        drawGlow(ctx, glowOf(PAL.ice), WX, WY, a * 0.7, 0.6 * ease.inCubic(u), 1, 0.04);
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.restore();

      // 0.38 eye glint: sparkle on both eyes + a cyan lens flare, then a soft twinkle while the face is up.
      const eyes = eyePts(env, fx0, fy0);
      const gl = pulse(t, T_GLINT, 0.26);
      if (t > T_GLINT + 0.12 && t < T_SQ + 0.04) {
        const k = clamp((t - T_GLINT - 0.12) / 0.15) * (0.4 + 0.12 * Math.sin(t * 20));
        eyes.forEach(([ex, ey], i) => sparkle(ctx, ex, ey, 7, k, 0.4 + i * 0.6 + t * 0.8));
      }
      if (gl > 0) {
        const ge = ease.outCubic(gl);
        eyes.forEach(([ex, ey], i) => {
          sparkle(ctx, ex, ey, 8 + 22 * gl, ge, t * 2.2 + i * 0.5);
          if (i === 1) lensFlare(ctx, ex, ey, 46, ge * 0.6, [120, 220, 255]);
        });
      }
    }

    env.parts.draw(ctx, 1);

    // ------------------------------------------------------------ tag + title
    drawTag(ctx, t);
    drawTitle(ctx, t);

    // ------------------------------------------------------------ 1.12 POP: the ring-pop wipe
    if (t >= T_POP) {
      const u = clamp((t - T_POP) / (DUR - 0.01 - T_POP));
      // The flattened ball springs back round as it pops: the ring opens from a wide oval to a circle.
      const R = lerp(40, 480, Math.pow(u, 1.1));
      const k = lerp(0.35, 1, ease.outCubic(u));
      // Inside the ring: cool cyan light, about as bright as shot 2's opening flash-in (it carries the cut), with the
      // pressure it released still rippling out in it (two faint blown isobars).
      ctx.save();
      ctx.translate(WX, WY);
      ctx.scale(1, k);
      const dg = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
      dg.addColorStop(0, 'rgb(172,228,255)');
      dg.addColorStop(0.55, 'rgb(112,190,242)');
      dg.addColorStop(0.9, 'rgb(80,160,232)');
      dg.addColorStop(1, 'rgb(160,226,255)');
      ctx.fillStyle = dg;
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, TAU);
      ctx.fill();
      ctx.restore();
      for (let j = 0; j < 2; j++) {
        const rr = R * (0.45 + 0.25 * j) * (1 + 0.3 * u);
        ctx.globalAlpha = 0.35 * (1 - u * 0.5);
        ctx.strokeStyle = HEX.cobalt;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let q = 0; q <= 64; q++) {
          const a2 = (q / 64) * TAU;
          const r2 = rr * (1 + 0.035 * Math.sin(5 * a2 + t * 3 + j * 1.7));
          const x2 = WX + Math.cos(a2) * r2, y2 = WY + Math.sin(a2) * r2 * k;
          q ? ctx.lineTo(x2, y2) : ctx.moveTo(x2, y2);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      // Its rim in the window's colours: navy halo, cobalt band, ice edge (thickening as it nears the lens).
      const th = lerp(1, 1.6, u);
      for (const [c, w, off] of [[HEX.navy, 12, 9], [HEX.cobalt, 5, 3.5], [HEX.ice, 2, 0.5]] as const) {
        ctx.strokeStyle = c;
        ctx.lineWidth = w * th;
        ctx.beginPath();
        ctx.ellipse(WX, WY, R + off * th, (R + off * th) * k, 0, 0, TAU);
        ctx.stroke();
      }
      env.parts.draw(ctx, 2);
      const [ux, uy] = env.cam.toUV(WX, WY);
      pushShock(fx, { x: ux, y: uy, r: Math.min(0.5, (R * k * env.cam.zoom) / VH), s: 0.03 * (1 - 0.5 * u) });
    }

    // ------------------------------------------------------------ post
    galeGrade(fx);
    fx.contrast = 1.08;
    fx.vignette = 0.5;
    fx.bloom = lerp(0.9, 1.3, pulse(t, T_GLINT, 0.35));
    fx.bloomThresh = 0.76;
    fx.ca = 0.0016 + 0.004 * pulse(t, T_GLINT, 0.2) + (t >= T_POP ? 0.004 : 0);
    if (t >= T_POP) {
      // The pop flashes 0.5 for one frame; then the flash eases to ~0.2 while the bright disc grows, so the frame's
      // overall brightness keeps rising into shot 2's cyan flash-in (one event, never a strobe).
      fx.flash = keys([[T_POP, 0.5], [T_POP + 0.016, 0.5], [T_POP + 0.03, 0.2], [DUR - 0.016, 0.24]], t, ease.linear);
      fx.flashColor = BLINK.popFlash;
    }
  },
};

/** Tag plate under the title: springs open horizontally from the centre (like the window), squashes out with it. */
function drawTag(ctx: CanvasRenderingContext2D, t: number) {
  if (t < T_TAG || t >= T_POP) return;
  const lt = t - T_TAG;
  const open = lt < 0.08 ? ease.outCubic(lt / 0.08) * 1.08 : lerp(1.08, 1, ease.inOutQuad(clamp((lt - 0.08) / 0.06)));
  const exitU = clamp((t - (T_SQ + 0.03)) / (T_POP - T_SQ - 0.03));
  const sy = Math.max(0, 1 - ease.inBack(exitU));
  if (sy <= 0.02) return;
  ctx.save();
  ctx.font = `10px ${PIXEL_FONT}`;
  const w = ctx.measureText(TAG).width + 28, h = 18;
  const hw = (w / 2) * open;
  ctx.translate(WX, TAG_Y + h / 2);
  ctx.scale(1, sy);
  ctx.translate(-WX, -(TAG_Y + h / 2));
  ctx.beginPath();
  ctx.rect(WX - hw, TAG_Y - 3, hw * 2, h + 6);
  ctx.clip();
  ctx.fillStyle = 'rgba(10,18,56,0.9)';
  ctx.fillRect(WX - w / 2, TAG_Y, w, h);
  ctx.fillStyle = HEX.cobalt;
  ctx.fillRect(WX - w / 2, TAG_Y - 2, w, 2);
  ctx.fillStyle = HEX.cyan;
  ctx.fillRect(WX - w / 2, TAG_Y + h, w, 1);
  pixelText(ctx, TAG, WX, TAG_Y + 4, 10, HEX.cyan, 'center', HEX.navy);
  ctx.restore();
}

/** When the air-tone ring k starts: with its tone, or as soon as its letter starts to spring. */
function toneRingAt(k: number) {
  return Math.max(TONES[k], T_TITLE + STAG * TONE_LETTER[k] + 0.015);
}

/** GALE HAMMER: each letter springs out of a 4 px sliver, 0.03 s apart, overshooting to 115 % (a pressure wave). */
function drawTitle(ctx: CanvasRenderingContext2D, t: number) {
  if (t < T_TITLE || t >= T_POP) return;
  const gs = layoutTitle(ctx);
  const size = TITLE_SIZE;
  const capH = size * 0.74;
  const skew = -0.18;
  // Air-tone rings: a thin pressure ring puffs out from behind the letter each tone rides (it starts as that
  // letter springs, at most 0.025 s after its tone).
  TONES.forEach((tt, k) => {
    const g = gs[TONE_LETTER[k]];
    const age = t - toneRingAt(k);
    if (age < 0 || age > 0.34) return;
    const u = age / 0.34;
    const cy = TITLE_Y - capH * 0.5;
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.cyan), g.x, cy, 46, 0.3 * (1 - u), 1, 0.9);
    ctx.globalCompositeOperation = 'source-over';
    const rr = lerp(g.w * 0.5, g.w * 0.5 + 74, ease.outCubic(u));
    isobar(ctx, g.x, cy, rr, 0.4, t, k * 2, 0.9 * Math.pow(1 - u, 1.5), 0.02);
    isobar(ctx, g.x, cy, rr * 0.72, 0.4, t, k * 2 + 1, 0.5 * Math.pow(1 - u, 2), 0.02);
  });
  ctx.save();
  ctx.font = `${size}px ${TITLE_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  const fill = titleFill(ctx, size);
  gs.forEach((g, i) => {
    if (g.c === ' ') return;
    const lt = t - (T_TITLE + STAG * i);
    if (lt <= 0) return;
    let sx = letterSpring(lt, 4 / (g.w + 10));
    let sy = sx < 1 ? Math.min(1.35, 1 + 0.45 * (1 - sx)) : 1 - 0.6 * (sx - 1);
    // Exit: each letter squashes flat in a wave, left to right.
    const st = T_SQ + 0.004 * i;
    const eu = clamp((t - st) / (T_POP - st));
    if (eu > 0) {
      sy *= Math.max(0, 1 - ease.inBack(eu));
      sx *= 1 + 0.3 * ease.inQuad(eu);
    }
    if (sy <= 0.02) return;
    ctx.save();
    ctx.translate(g.x, TITLE_Y - capH / 2);
    ctx.transform(1, 0, skew, 1, 0, 0);
    ctx.scale(sx, sy);
    ctx.translate(0, capH / 2);
    // 2 px navy outer stroke, 3 px cobalt stroke, ice fill.
    ctx.strokeStyle = HEX.navy;
    ctx.lineWidth = 10;
    ctx.strokeText(g.c, 0, 0);
    ctx.strokeStyle = HEX.cobalt;
    ctx.lineWidth = 6;
    ctx.strokeText(g.c, 0, 0);
    ctx.fillStyle = fill;
    ctx.fillText(g.c, 0, 0);
    // White-hot while it springs.
    const hot = 1 - clamp(lt / 0.1);
    if (hot > 0) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = hot * 0.85;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(g.c, 0, 0);
    }
    ctx.restore();
  });
  ctx.restore();
}

export type { Env };
