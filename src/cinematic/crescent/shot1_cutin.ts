// SHOT 1 — CUT-IN: the special-move declaration. A crescent-shaped panel swings in on a
// ~120° roll with No.10's eyes inside (upside down at first, turning upright with the panel:
// the inversion to come). His eyes glint silver, then a sweeping crescent of light reveals
// the name CRIMSON CRESCENT, and the panel spins away into a flash.

import type { Shot, Env } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { TAU, clamp, ease, lerp } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import { focusLines, lensFlare, pixelText, sparkle, TITLE_FONT } from '../../art/fx';
import { PAL, SHOT_NAME, crescentArc, crescentPath, pulse } from './common';

const DUR = 1.7;

// Panel geometry (local frame: origin = the crescent's circle center, the pivot it swings on).
const PX = VW / 2, PY = 250; // pivot on screen
const R = 230; // outer radius
const BITE = 0.67; // bite offset (x R): band thickness at the middle = BITE * R
const PHI = Math.acos(BITE / 2); // horn angle from the bite axis
const BAND_IN = -R + BITE * R; // local y of the band's inner edge at the middle
// Eye line sits a little below mid-band so the navy crown shows under the outer arc.
const EYE_LY = (-R + BAND_IN) / 2 + 16;
const REST = -0.07; // resting roll of the panel
const SWING = 1.95; // ~112° swing-in (starts with the inverted eyes on screen)
const SWING_T = 0.27;
const EXIT_T = 1.5;
const EXIT_WIPE_T = 1.56;

// Beats.
const GLINT_T = 0.55;
const SWEEP_T0 = 0.8, SWEEP_T1 = 1.15;

// Title layout.
const TITLE_Y = 332;
const TITLE_SIZE = 54;
const TAG_Y = 252;
const SWEEP_R = 150; // radius of the sweeping light crescent

let glinted = false;
let swept = false;
let landed = false;
let titleW = 400; // measured in init

interface PanelXf {
  rot: number;
  s: number;
  faceRot: number;
  sc: number;
  ex: number; // eye midpoint, panel-local
  ey: number;
  speed: number; // 0..1 how fast the panel is turning (for smears)
  exit: number;
}

/** Back-out with an adjustable (small) overshoot. */
function backOut(x: number, s: number) {
  const u = x - 1;
  return 1 + (s + 1) * u * u * u + s * u * u;
}

function panelAt(t: number): PanelXf {
  const sw = clamp(t / SWING_T);
  // Gentle out-curve so the swing (and the inverted face riding it) stays readable.
  const e = backOut(sw, 0.6);
  const exit = ease.inQuad(clamp((t - EXIT_T) / (DUR - EXIT_T)));
  const drift = ease.inOutQuad(clamp((t - SWING_T) / (EXIT_T - SWING_T))) * 0.05;
  const rot = REST - SWING * (1 - e) + drift + exit * 2.4;
  const s = lerp(1.16, 1, ease.outCubic(sw)) * (1 + exit * 0.45);
  // The face starts fully upside down, rides the swing still inverted, then rolls upright
  // (same direction as the panel) as the panel locks in: the inversion to come.
  const eF = ease.inOutCubic(clamp((t - 0.12) / 0.26));
  const faceRot = -Math.PI * (1 - eF) + SWING * (1 - e);
  const sc = lerp(9.4, 10.2, ease.outCubic(clamp(t / DUR)));
  const ex = lerp(14, -10, ease.outCubic(clamp(t / DUR)));
  const speed = Math.max(sw < 1 ? Math.pow(1 - sw, 1.5) : 0, exit);
  return { rot, s, faceRot, sc, ex, ey: EYE_LY, speed, exit };
}

/** Midpoint between the eyes in sprite pixels (pixel centers). */
function eyeMid(env: Env): [number, number] {
  const [a, b] = env.art.hero.eyes;
  return [(a[0] + b[0]) / 2 + 0.5, (a[1] + b[1]) / 2 + 0.5];
}

/** Panel-local point -> world point. */
function toWorld(p: PanelXf, lx: number, ly: number): [number, number] {
  const c = Math.cos(p.rot), s = Math.sin(p.rot);
  return [PX + (lx * c - ly * s) * p.s, PY + (lx * s + ly * c) * p.s];
}

/** Eye pixel (sprite coords) -> world point. */
function eyeWorld(env: Env, p: PanelXf, ex: number, ey: number): [number, number] {
  const [mx, my] = eyeMid(env);
  const fx = (ex + 0.5 - mx) * p.sc, fy = (ey + 0.5 - my) * p.sc;
  const c = Math.cos(p.faceRot), s = Math.sin(p.faceRot);
  return toWorld(p, p.ex + fx * c - fy * s, p.ey + fx * s + fy * c);
}

function panelPath(ctx: CanvasRenderingContext2D) {
  crescentPath(ctx, 0, 0, R, BITE, Math.PI / 2);
}

/** Title with dark outer stroke, crimson stroke and a chrome silver-white fill. */
function drawTitle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, white = 0) {
  ctx.save();
  ctx.font = `${size}px ${TITLE_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.translate(x, y);
  ctx.transform(1, 0, -0.2, 1, 0, 0);
  ctx.strokeStyle = '#0a0618';
  ctx.lineWidth = size * 0.28;
  ctx.strokeText(SHOT_NAME, 0, 0);
  ctx.strokeStyle = '#d4163f';
  ctx.lineWidth = size * 0.14;
  ctx.strokeText(SHOT_NAME, 0, 0);
  const g = ctx.createLinearGradient(0, -size * 0.78, 0, 0);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.46, '#eef0ff');
  g.addColorStop(0.5, '#a7acdc');
  g.addColorStop(0.78, '#d3d6f4');
  g.addColorStop(1, '#ffe4ec');
  ctx.fillStyle = g;
  ctx.fillText(SHOT_NAME, 0, 0);
  if (white > 0) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = clamp(white);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(SHOT_NAME, 0, 0);
    ctx.globalAlpha = clamp(white * 0.6);
    ctx.strokeStyle = '#ff6a8a';
    ctx.lineWidth = size * 0.1;
    ctx.strokeText(SHOT_NAME, 0, 0);
  }
  ctx.restore();
}

export const shotCutIn: Shot = {
  name: 'Cut-in',
  dur: DUR,
  seed: 101,
  cues: [
    { at: 0, fn: (e) => { e.sfx.stinger(); e.sfx.whoosh(0.3, 400, 3600, 0.4); } },
    { at: GLINT_T, fn: (e) => e.sfx.shing() },
    { at: SWEEP_T0 - 0.03, fn: (e) => e.sfx.whoosh(0.38, 900, 7500, 0.38) },
    { at: SWEEP_T1, fn: (e) => e.sfx.boom(0.4, 0.5) },
    { at: EXIT_T, fn: (e) => e.sfx.whoosh(0.22, 700, 6000, 0.35) },
  ],
  init(env) {
    glinted = false;
    swept = false;
    landed = false;
    env.ctx.save();
    env.ctx.font = `${TITLE_SIZE}px ${TITLE_FONT}`;
    titleW = env.ctx.measureText(SHOT_NAME).width || 400;
    env.ctx.restore();
    env.cam.set(VW / 2, VH / 2, 1, -0.015);
    env.cam.shakeAmp = 5;
  },
  update(env, t, dt) {
    const { rng, parts } = env;
    const p = panelAt(t);

    // Silver motes and crimson embers swirling clockwise around the panel's pivot.
    const n = Math.round(3 * dt * 60);
    for (let i = 0; i < n; i++) {
      const a = rng.range(0, TAU);
      const r = rng.range(170, 430);
      const sp = rng.range(160, 420) * (1 + p.speed * 1.5);
      const silver = rng.next() < 0.5;
      parts.spawn({
        kind: rng.next() < 0.6 ? PK.Streak : PK.Pixel,
        x: PX + Math.cos(a) * r, y: PY - 40 + Math.sin(a) * r * 0.8,
        vx: -Math.sin(a) * sp, vy: Math.cos(a) * sp * 0.8 - 20,
        max: rng.range(0.35, 0.8), s0: rng.range(1, 2.4), s1: 0.6, k: 0.8,
        ramp: silver ? 'silver' : 'crimson', r0: silver ? 0 : 0.15, r1: silver ? 0.8 : 0.9, a0: 0.9, a1: 0,
        layer: rng.next() < 0.75 ? 0 : 1,
      });
    }

    // Panel locks in: silver sparks shed from both horn tips.
    if (!landed && t >= SWING_T * 0.8) {
      landed = true;
      for (const side of [-1, 1]) {
        const hx = side * R * Math.sin(PHI);
        const hy = R * BITE / 2;
        const [wx, wy] = toWorld(p, hx * 0.92, hy * 0.85);
        for (let i = 0; i < 14; i++) {
          const a = (side > 0 ? -0.3 : Math.PI + 0.3) + rng.range(-0.8, 0.8);
          const s = rng.range(120, 420);
          parts.spawn({
            kind: PK.Streak, x: wx, y: wy, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 60, drag: 3, ay: 220,
            max: rng.range(0.25, 0.55), s0: rng.range(1, 2), s1: 0.4, ramp: 'silver', r0: 0, r1: 1, k: 1.2, layer: 1,
          });
        }
      }
    }

    // Eye glint: tiny silver shards burst from the eyes.
    if (!glinted && t >= GLINT_T) {
      glinted = true;
      for (const [ex, ey] of env.art.hero.eyes) {
        const [wx, wy] = eyeWorld(env, p, ex, ey);
        for (let i = 0; i < 10; i++) {
          const a = rng.range(0, TAU);
          const s = rng.range(140, 360);
          parts.spawn({
            kind: PK.Streak, x: wx, y: wy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 4,
            max: rng.range(0.2, 0.4), s0: rng.range(1, 1.8), s1: 0.3, ramp: 'silver', r0: 0, r1: 0.7, k: 1.4, layer: 1,
          });
        }
      }
    }

    // Light sweep: silver dust peels off the leading edge as it passes the letters.
    if (t >= SWEEP_T0 && t < SWEEP_T1 + 0.05) {
      const edge = sweepEdge(t);
      for (let i = 0; i < Math.round(4 * dt * 60); i++) {
        const yy = rng.range(-SWEEP_R * 0.55, SWEEP_R * 0.35);
        const xx = edge - SWEEP_R + Math.sqrt(SWEEP_R * SWEEP_R - yy * yy);
        parts.spawn({
          kind: PK.Pixel, x: xx, y: TITLE_Y - 24 + yy, vx: rng.range(40, 160), vy: rng.range(-60, 30),
          drag: 2, max: rng.range(0.3, 0.7), s0: rng.range(1, 3), s1: 1,
          ramp: rng.next() < 0.6 ? 'silver' : 'crimson', r0: 0, r1: 0.8, a0: 1, a1: 0, layer: 1,
        });
      }
    }
    if (!swept && t >= SWEEP_T1) {
      swept = true;
      env.cam.hit(0.32);
    }

    // Camera: slow push and a gentle roll that keeps turning (the world will turn over).
    const k = t / DUR;
    env.cam.zoom = lerp(1, 1.05, k) + pulse(t, GLINT_T, 0.25) * 0.025 + pulse(t, SWEEP_T1, 0.2) * 0.02;
    env.cam.rot = lerp(-0.015, 0.02, ease.inOutQuad(k));
  },
  render(env, t) {
    const { ctx, fx } = env;
    const hero = env.art.hero;
    const st = env.art.stadium;
    const p = panelAt(t);
    env.world();
    const rng = env.frng();

    // ---------------------------------------------------------------- Backdrop
    const bg = ctx.createLinearGradient(0, -40, 0, VH + 40);
    bg.addColorStop(0, '#0b0722');
    bg.addColorStop(0.45, '#1e0e44');
    bg.addColorStop(0.8, '#560a2a');
    bg.addColorStop(1, '#860e28');
    ctx.fillStyle = bg;
    ctx.fillRect(-60, -60, VW + 120, VH + 120);
    const [cx0, cy0] = toWorld(panelAt(0.6), 0, EYE_LY);
    const rg = ctx.createRadialGradient(cx0, cy0 + 40, 20, cx0, cy0 + 40, 380);
    rg.addColorStop(0, 'rgba(226,26,56,0.36)');
    rg.addColorStop(0.5, 'rgba(150,14,48,0.16)');
    rg.addColorStop(1, 'rgba(40,10,60,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(-60, -60, VW + 120, VH + 120);

    // Huge thin crescent moon, slowly rotating behind everything.
    drawBigMoon(ctx, st.moon, t);

    // Focus lines: silver converging on the eyes, dark ones for contrast.
    focusLines(ctx, rng, cx0, cy0, 150, 560, 64, '#e8ecff', 0.3, 4);
    focusLines(ctx, rng, cx0, cy0, 220, 560, 36, '#0a0618', 0.45, 6);

    env.parts.draw(ctx, 0);

    // ---------------------------------------------------------------- Crescent panel
    ctx.save();
    ctx.translate(PX, PY);

    // Rotation smear: crimson ghosts of the panel trailing the swing.
    if (p.speed > 0.02) {
      for (let i = 3; i >= 1; i--) {
        ctx.save();
        ctx.rotate(p.rot - i * 0.16 * p.speed * (p.exit > 0 ? 1.6 : 1));
        ctx.scale(p.s, p.s);
        panelPath(ctx);
        ctx.globalAlpha = 0.28 * p.speed * (1 - i / 4);
        ctx.fillStyle = i === 1 ? '#ff4a78' : '#b0103e';
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    ctx.rotate(p.rot);
    ctx.scale(p.s, p.s);
    // Dark halo + soft crimson glow so the panel separates from the backdrop.
    ctx.lineJoin = 'round';
    panelPath(ctx);
    ctx.strokeStyle = 'rgba(220,24,70,0.28)';
    ctx.lineWidth = 30;
    ctx.stroke();
    ctx.strokeStyle = '#07040f';
    ctx.lineWidth = 16;
    ctx.stroke();

    ctx.save();
    panelPath(ctx);
    ctx.clip();
    // Inside: deep plum body, back-lit crimson along the outer edge (the hair reads dark on it).
    const ig = ctx.createRadialGradient(0, 0, R * (1 - BITE), 0, 0, R);
    ig.addColorStop(0, '#26081e');
    ig.addColorStop(0.55, '#4e0a28');
    ig.addColorStop(0.85, '#a8102f');
    ig.addColorStop(1, '#d0163a');
    ctx.fillStyle = ig;
    ctx.fillRect(-R - 10, -R - 10, R * 2 + 20, R * 2 + 20);

    // Eyes close-up (face crop), rotating upright with the panel.
    const f = hero.face;
    ctx.save();
    ctx.translate(p.ex, p.ey);
    ctx.rotate(p.faceRot);
    // Crop wide and from the top of the hair so no straight crop edge shows while it rolls.
    const [mx, my] = eyeMid(env);
    const sx = Math.max(0, f.x - 8), sw = Math.min(hero.w - sx, f.w + 16), sh = f.y + f.h;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(hero.img, sx, 0, sw, sh, -(mx - sx) * p.sc, -my * p.sc, sw * p.sc, sh * p.sc);
    // Spotlight the eyes: the crop dissolves into the panel toward the horns (no hard crop edges).
    const vg = ctx.createRadialGradient(0, 0, 120, 0, 0, 236);
    vg.addColorStop(0, 'rgba(38,8,30,0)');
    vg.addColorStop(0.6, 'rgba(38,8,30,0.75)');
    vg.addColorStop(1, 'rgba(38,8,30,1)');
    ctx.fillStyle = vg;
    ctx.fillRect(-640, -640, 1280, 1280);
    // Below the mouth (collar, shoulders) melts into the panel too.
    const fade = ctx.createLinearGradient(0, 50, 0, 86);
    fade.addColorStop(0, 'rgba(38,8,30,0)');
    fade.addColorStop(1, 'rgba(38,8,30,1)');
    ctx.fillStyle = fade;
    ctx.fillRect(-640, 50, 1280, 640);
    ctx.restore();

    // Crimson back-light along the outer edge, crimson rim light from below (inner edge).
    ctx.globalCompositeOperation = 'lighter';
    const back = ctx.createRadialGradient(0, 0, R - 30, 0, 0, R);
    back.addColorStop(0, 'rgba(235,24,48,0)');
    back.addColorStop(1, 'rgba(235,24,48,0.22)');
    ctx.fillStyle = back;
    ctx.fillRect(-R - 10, -R - 10, R * 2 + 20, R * 2 + 20);
    const rim = ctx.createRadialGradient(0, BITE * R, R - 2, 0, BITE * R, R + 58);
    rim.addColorStop(0, 'rgba(255,40,66,0.55)');
    rim.addColorStop(0.4, 'rgba(210,18,48,0.2)');
    rim.addColorStop(1, 'rgba(210,18,48,0)');
    ctx.fillStyle = rim;
    ctx.fillRect(-R - 10, -R - 10, R * 2 + 20, R * 2 + 20);

    // Rotational streaks circling the pivot (strong while turning, faint at rest).
    const sa = 0.07 + p.speed * 0.5;
    ctx.strokeStyle = '#e8ecff';
    for (let i = 0; i < 22; i++) {
      const rr = rng.range(R * (1 - BITE) + 4, R - 3);
      const a0 = -Math.PI / 2 + rng.range(-1.35, 1.35);
      const span = rng.range(0.05, 0.22) * (1 + p.speed * 2);
      ctx.globalAlpha = clamp(sa * rng.range(0.4, 1));
      ctx.lineWidth = rng.next() < 0.25 ? 2 : 1;
      ctx.beginPath();
      ctx.arc(0, 0, rr, a0, a0 + span);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // Crimson rim just inside the edge.
    panelPath(ctx);
    ctx.strokeStyle = '#e01a4a';
    ctx.lineWidth = 12;
    ctx.stroke();
    ctx.restore();

    // Silver outline (flares with the eye glint).
    panelPath(ctx);
    ctx.lineJoin = 'miter';
    ctx.strokeStyle = '#eef0ff';
    ctx.lineWidth = 4;
    ctx.stroke();
    const og = pulse(t, GLINT_T, 0.3);
    if (og > 0) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(200,210,255,${0.45 * og})`;
      ctx.lineWidth = 10;
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();

    // Eye glints.
    const gl = pulse(t, GLINT_T, 0.3);
    if (t > GLINT_T + 0.1 && p.exit < 0.5) {
      const k = clamp((t - GLINT_T - 0.1) / 0.2) * (0.55 + 0.15 * Math.sin(t * 22));
      for (const [i, [ex, ey]] of hero.eyes.entries()) {
        const [wx, wy] = eyeWorld(env, p, ex, ey);
        sparkle(ctx, wx, wy, 11, k * (1 - p.exit * 2), 0.3 + i * 0.5 + t * 0.6);
      }
    }
    if (gl > 0) {
      const ge = ease.outCubic(gl);
      for (const [i, [ex, ey]] of hero.eyes.entries()) {
        const [wx, wy] = eyeWorld(env, p, ex, ey);
        sparkle(ctx, wx, wy, 16 + 40 * gl, ge, t * 2.4 + i * 0.4);
        if (i === 1) lensFlare(ctx, wx, wy, 60, ge * 0.7, [214, 222, 255]);
      }
    }

    env.parts.draw(ctx, 1);

    // ---------------------------------------------------------------- Labels
    // Title revealed by a sweeping crescent of light.
    if (t >= SWEEP_T0) {
      const edge = sweepEdge(t);
      const yc = TITLE_Y - 24;
      const scl = 1 + clamp((t - SWEEP_T1) / (EXIT_T - SWEEP_T1)) * 0.025;
      const tx = VW / 2 + 4;
      // Revealed part = left of the sweep's leading arc.
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(-60, yc - SWEEP_R);
      ctx.lineTo(edge - SWEEP_R, yc - SWEEP_R);
      ctx.arc(edge - SWEEP_R, yc, SWEEP_R, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(-60, yc + SWEEP_R);
      ctx.closePath();
      ctx.clip();
      ctx.translate(tx, TITLE_Y);
      ctx.scale(scl, scl);
      drawTitle(ctx, 0, 0, TITLE_SIZE, pulse(t, SWEEP_T1, 0.25) * 0.5);
      ctx.restore();
      // Hot crescent band just behind the edge: letters are white-hot as they appear.
      const sweepOn = t < SWEEP_T1 + 0.12;
      if (sweepOn) {
        ctx.save();
        crescentPath(ctx, edge - SWEEP_R, yc, SWEEP_R, 70 / SWEEP_R, Math.PI);
        ctx.clip();
        drawTitle(ctx, tx, TITLE_Y, TITLE_SIZE, 0.85);
        ctx.restore();
      }
      // The blade of light itself.
      const la = 1 - clamp((t - SWEEP_T1) / 0.12);
      if (la > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, glowOf([255, 70, 120]), edge - 16, yc, 110, 0.4 * la, 0.45, 1.5);
        drawGlow(ctx, glowOf([235, 240, 255]), edge - 6, yc, 60, 0.35 * la, 0.35, 1.6);
        ctx.restore();
        crescentArc(ctx, edge - SWEEP_R, yc, SWEEP_R, -1.1, 1.1, 34, 1, la);
      }
    }

    // Tag plate slides in from the left (drawn over the sweep so the blade passes behind it).
    const tagIn = ease.outBack(clamp((t - 0.3) / 0.22));
    if (tagIn > 0) drawTag(ctx, lerp(-420, VW / 2, tagIn), TAG_Y);

    // Exit wipe: a huge crescent blade sweeps toward goal (+x), leaving silver-white behind it.
    const wk = clamp((t - EXIT_WIPE_T) / (DUR - 0.02 - EXIT_WIPE_T));
    if (wk > 0) {
      const RB = 460;
      const we = lerp(-60, VW + 160, ease.inQuad(wk));
      const wy = VH / 2 - 30;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(-200, wy - RB);
      ctx.lineTo(we - RB, wy - RB);
      ctx.arc(we - RB, wy, RB, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(-200, wy + RB);
      ctx.closePath();
      const wg = ctx.createLinearGradient(we - 260, 0, we, 0);
      wg.addColorStop(0, '#f6f2ff');
      wg.addColorStop(1, '#ffd2de');
      ctx.fillStyle = wg;
      ctx.fill();
      ctx.restore();
      crescentArc(ctx, we - RB, wy, RB, -0.95, 0.95, 46, 1, 1);
    }

    // ---------------------------------------------------------------- Post
    const exit = p.exit;
    fx.ca = 0.003 + gl * 0.006 + exit * 0.01;
    fx.bloom = 0.8;
    fx.bloomThresh = 0.8;
    fx.vignette = 0.6;
    fx.contrast = 1.08;
    fx.flashColor = [255, 240, 248];
    fx.flash = Math.max(pulse(t, 0.02, 0.08) * 0.4, ease.inQuad(clamp((t - 1.6) / 0.1)), pulse(t, SWEEP_T1, 0.14) * 0.22);
    if (exit > 0) {
      const [ux, uy] = env.cam.toUV(PX, PY - R * 0.5);
      fx.radial = exit * 0.22;
      fx.radialX = ux;
      fx.radialY = uy;
    }

    if (t < 0.02) {
      fx.impact = 1;
      fx.impA = [14, 4, 22];
      fx.impB = [232, 28, 72];
    }
  },
};

/** World x of the light sweep's leading edge at time t. */
function sweepEdge(t: number) {
  const u = ease.inOutQuad(clamp((t - SWEEP_T0) / (SWEEP_T1 - SWEEP_T0)));
  const x0 = VW / 2 - titleW / 2 - 50;
  const x1 = VW / 2 + titleW / 2 + 60;
  return lerp(x0, x1, u) + Math.max(0, t - SWEEP_T1) * 900;
}

/** Thin pixel crescent moon (the stadium moon texture clipped to a crescent), slowly turning. */
function drawBigMoon(ctx: CanvasRenderingContext2D, moon: HTMLCanvasElement, t: number) {
  const cx = PX, cy = PY, r = 312;
  // Bite direction; the moon's fat side sits opposite it (upper left, turning clockwise).
  const rot = -Math.PI / 2 - 1.05 + Math.PI + t * 0.4;
  ctx.save();
  crescentPath(ctx, cx, cy, r, 0.2, rot);
  ctx.clip();
  ctx.imageSmoothingEnabled = false;
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.5;
  const d = r * (160 / 78);
  ctx.drawImage(moon, cx - d / 2, cy - d / 2, d, d);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  // Cool it toward the terminator so it reads as a lit limb, not a grey band.
  const tg = ctx.createRadialGradient(cx + Math.cos(rot) * r * 0.2, cy + Math.sin(rot) * r * 0.2, r * 0.95, cx, cy, r * 1.05);
  tg.addColorStop(0, 'rgba(30,18,80,0.75)');
  tg.addColorStop(1, 'rgba(30,18,80,0)');
  ctx.fillStyle = tg;
  ctx.fillRect(cx - r - 10, cy - r - 10, r * 2 + 20, r * 2 + 20);
  ctx.restore();
  // Silver glow along the lit limb.
  ctx.save();
  crescentPath(ctx, cx, cy, r, 0.2, rot);
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = 'rgba(190,200,255,0.16)';
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(230,236,255,0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

/** Tag plate: dark outline, silver plate, crimson crescent icon, indigo pixel text. */
function drawTag(ctx: CanvasRenderingContext2D, cx: number, y: number) {
  const text = 'SPECIAL SHOT · No.10 · BICYCLE KICK';
  ctx.save();
  ctx.font = '10px "Silkscreen", "Press Start 2P", monospace';
  const w = ctx.measureText(text).width + 40;
  const x = cx - w / 2;
  ctx.translate(x, y);
  ctx.save();
  ctx.transform(1, 0, -0.25, 1, 0, 0);
  ctx.fillStyle = '#0a0618';
  ctx.fillRect(-5, -4, w + 10, 26);
  ctx.fillStyle = '#e01a4a';
  ctx.fillRect(-2, -1, w + 4, 20);
  ctx.fillStyle = '#eef0ff';
  ctx.fillRect(1, 0, w - 2, 18);
  ctx.restore();
  // Mini crescent icon.
  ctx.fillStyle = `rgb(${PAL.crimson.join(',')})`;
  crescentPath(ctx, 14, 9, 7, 0.75, -0.6);
  ctx.fill();
  ctx.restore();
  pixelText(ctx, text, x + 28, y + 4, 10, '#160c34', 'left', 'rgba(0,0,0,0)');
}

export type { Env };
