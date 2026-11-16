// MERIDIAN THREAD v2 · shot 6 · "Sky Eye" (2.0 s, seed 416, global 8.9-10.9; TWANG at 1.20 = global 10.10). SPEC.md shot 6.
//
// 6a THE EYE OPENS (0.00-0.70, rate 0.35). Hard reverse cut from shot 5's look-down: a worm's-eye from among the
// defenders, over the Tower's shoulder. The bowl seen from the turf (the roof rim and the stands closing in round an
// emerald-black screentone sky, two floodlight towers leaning in with their lamp heads facing down at us), the Meridian
// climbing out of the bottom-left corner to the ball high above (r12 x2, 48 px, barely creeping, spin turning), the
// Tower's back (TC1 / TC1b at 3x: an ink silhouette rim-lit from above, trembling 1 px) bottom-left, D3 and D4's heads
// bottom-right. Camera zoom 1.00 -> 1.10 about (320, 120) with a breath of tilt up, held tremor 0.15.
//   0.05  THE EYE OPENS: a pearl hairline splits the sky through the ball (0.05-0.11); the lids part (outCubic 0.30 s)
//         into a 360 x 150 almond opened to 70 %: pearl-rimmed lids on an ink outline, the dark emerald iris field in
//         screentone, 24 jade meridian lines radiating from the ball (the pupil), a degree ring and a running-stitch
//         ring, faint lashes outside; a lantern of emerald light round it; one slow shock out of the pupil. The ball's
//         pearl glint slides down toward the defenders (0.35): it looks at them; their rims light up jade from above.
//   0.42  THE COIL: a slanted manga panel slams in at the right: the Tower's face (TF3 x2, grim, the jade eye reflected
//         in both pupils, screentone shadow, ink "GRR"); it shakes 1 px and rips upward at 0.66 (his launch: the cut).
//
// 6b THE LEAP, THE TUG-OF-WAR, THE STRUM, TWANG (0.70-2.00), the ride world at apex height (X = (x - 772)·3,
// Y = -h·4), the ball locked at (360, 96) at zoom 1.7, the Sky Eye behind it (a slim 320 x 120), floodlight lamp heads
// just above us at the upper left on masts rising from the far stand's roofline low in the frame (floodlit haze over it).
//   0.70  THE LEAP: the Tower erupts from the bottom of the frame (TJ1 2.4x, arms up, body arched), ink and mint speed
//         lines streaming down behind him, a dust plume far below; cam.hit 0.4.
//   0.86  THE GRAB: his fist closes on the thread 72 px behind the ball (TJ2 / TJ2b): never on the ball. Sparks.
//   0.86-1.20 THE TUG-OF-WAR (never a stop): his dead weight hauls the line into a V (60 px; the camera sags with him),
//         the thread bites his glove and frays (jade fibres), the stroke's light drains (75 -> 40 px, flickering), the
//         eye narrows 70 % -> 45 %, but the ball keeps creeping on (~28 px against the held camera, spin turning,
//         stitch stars popping), the stretch between fist and ball growing and thinning. Push 1.70 -> 1.90.
//   0.98-1.34 THE STRUM (insert panel, bottom-right): No.10 far below, Pluck PL1 (hand hooked on an invisible string)
//         -> PL2 at 1.12 (the strum down and across, a 1 px motion arc, a pearl spark along it; the string sings).
//   1.14  the vibration runs up the stroke from his end to the Tower's fist (a pearl pulse, 0.06 s).
//   1.20  TWANG! Stack B: hit-stop 0.04 for 0.14 s, cam.hit 0.9 / shakeAmp 18, punch +0.12, the halftone jade print
//         (stage A only, 0.06 s: F5; the haze held back so it prints figure on ground), a full-frame standing wave along the line (pluck warp amp 0.05, N 3, 9 Hz), the
//         stroke swings in the same wave and its drained light slams back to full (the lamp heads brighten with it), a
//         shock and a stitched ring at the fist, 60 sparks + 30 light-stitches + 20 fibres, 80 focus lines, CA 0.010,
//         radial 0.08, bloom 1.3, "TWANG!" across the sky (48 px). The Tower is torn off the line (TJ3, a readable
//         still through the hit-stop), then flung tumbling up and left out of the frame, a backlit shadow across the eye.
//   1.34-1.72 THE RELEASE: the line snaps straight like a slingshot (a pearl pulse whips from the eye to the ball, the
//         stroke tightens 75 -> 44 px), the ball whips out of the apex and starts to fall, streaking the air; the eye
//         stays high in front of the line, the thread running through its empty pupil (the eye of a needle), and its
//         lids begin to close (70 % -> 20 %); zoom 1.90 -> 1.60.
//   1.72-2.00 WHIP-TILT DOWN after the ball: the world rushes up 520 px (inCubic) on the shared streak (0.10 along
//         (0, 1), the ball sharp in its hole), the stroke stretched into a needle from the eye down to the ball: the
//         motion cut into shot 7.
//
// Roll 0 (shakeRoll 0.015). Night Ink 0.85 once per frame; the ball, the stroke, the eye, the Tower's studio frames, No.10
// and the panels are drawn after it. Flash budget: F5 only (stage A at 1.20-1.26); the eye is a local light ramped over
// 0.30 s, the lamp heads tint smoothly with their distance to the arc (no switching, flares <= 120 px).

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { BallSpin } from '../../engine/pixel';
import { TAU, clamp, ease, lerp, noise1, type RGB } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import { focusLines, inkSfx, lensFlare, mangaPanels, panelPoly, sparkle, spinMarks, type TrailPt } from '../../art/fx';
import { POSES, P, RIVAL_KIT_C, RIVAL_KIT_D, joints, type Pose } from '../../art/puppet';
import { drawNo10, no10Point } from '../../art/no10';
import { drawAnim } from '../../art/studioAnim';
import { drawBall, holdTrauma, keys, punch, pushShock, zoomAbout, type KeyRow } from '../kit';
import {
  HEX, JADE_FLARE, PAL, PUPPETS, RATE, SEQ10, SEQ_TOWER, StitchRings, arcAt, assertMeridianFx, ballU, ctrlThrough,
  halftoneImpact, jadeSparks, lampTintFor, nightGrade, nightInk, resetSpin, rideXY, seqAt, setPluck, stitchBurst,
  threadLine, tower, warmMeridian, whip, type TowerKey,
} from './common';

const DUR = 2.0;
const T_B = 0.7;
const GRAB = 0.86;
const STRUM = 1.12;
const TWANG = 1.2;
const RELEASE = 1.34;
const WHIP = 1.72;
const LAMP_WARM: RGB = [255, 246, 214];
const LAMP_JADE: RGB = [200, 255, 225];

const hash = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};
const css = (c: readonly number[], a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const mixc = (a: RGB, b: RGB, k: number): RGB => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// ================================================================ shared drawing helpers

/** A 4 x 4 screentone tile (a 2 x 2 dot + a 1 px dot) in `c`. */
const toneTiles = new Map<string, HTMLCanvasElement>();
function toneTile(c: string) {
  let t = toneTiles.get(c);
  if (!t) {
    t = document.createElement('canvas');
    t.width = t.height = 4;
    const g = t.getContext('2d')!;
    g.fillStyle = c;
    g.fillRect(0, 0, 2, 2);
    g.fillRect(2, 2, 1, 1);
    toneTiles.set(c, t);
  }
  return t;
}
/** Fill a rect (current transform) with screentone dots in `c` at alpha a. */
function tone(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string, a: number) {
  if (a <= 0) return;
  const pat = ctx.createPattern(toneTile(c), 'repeat');
  if (!pat) return;
  ctx.save();
  ctx.globalAlpha = clamp(a);
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = pat;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

/** A stroke point: screen position, metres along the arc (stable per-point details), a grid index and a width scale. */
interface SP {
  x: number;
  y: number;
  m: number;
  k: number;
  ws?: number;
}

function edges(P: SP[], w0: number, w1: number, rough: number, salt: number) {
  const n = P.length;
  const L: [number, number][] = [], R: [number, number][] = [];
  const m0 = P[0].m, tot = Math.max(1e-3, P[n - 1].m - m0);
  for (let i = 0; i < n; i++) {
    const A = P[Math.max(0, i - 1)], B = P[Math.min(n - 1, i + 1)];
    let dx = B.x - A.x, dy = B.y - A.y;
    const l = Math.hypot(dx, dy) || 1;
    dx /= l;
    dy /= l;
    const f = (P[i].m - m0) / tot;
    const rl = rough ? noise1(P[i].m * 0.7, salt) * rough : 0;
    const rr = rough ? noise1(P[i].m * 0.7, salt + 9) * rough : 0;
    const w = lerp(w0, w1, f) * 0.5 * (P[i].ws ?? 1);
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

interface BrushOpts {
  t: number;
  /** Width at the tail (first point). */
  tail?: number;
  /** 0..1: the light drains (body 75 -> 40 px, flicker, the halo dims). */
  drain?: number;
  /** 0..1: the light slammed back past full (the TWANG). */
  boost?: number;
  /** Stitch-hole stars every n grid points. */
  starEvery?: number;
  /** A pearl pulse at `d` px from the tail, strength a. */
  pulse?: { d: number; a: number };
  /** Star-chart ticks (every 5 m). */
  ticks?: boolean;
  alpha?: number;
}

/**
 * The Meridian as a brush stroke of light (screen space; tail first, ball last): ink under-stroke (w + 8), a soft emerald
 * halo to 2.4w, the jade body with dry-brush edges and emerald brush hair, the mint inner, bristles, the pearl thread
 * with stitch glints running to the ball, ink cross-stitches, pearl ticks, stitch-hole stars popping near the head.
 */
function brush(ctx: CanvasRenderingContext2D, P: SP[], W0: number, o: BrushOpts) {
  const n = P.length;
  if (n < 2) return;
  const A = clamp(o.alpha ?? 1);
  const drain = clamp(o.drain ?? 0), boost = clamp(o.boost ?? 0);
  const flick = drain > 0 ? 1 - drain * 0.4 * (0.5 + 0.5 * Math.sin(o.t * 53 + Math.sin(o.t * 17) * 3)) : 1;
  const W = W0 * (1 - 0.47 * drain) * (1 + 0.12 * boost);
  const head = P[n - 1];
  const tail = o.tail ?? 3;
  const m0 = P[0].m, tot = Math.max(1e-3, head.m - m0);
  const wAt = (i: number) => lerp(tail, W, (P[i].m - m0) / tot) * (P[i].ws ?? 1);
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  // Soft emerald halo to 2.4w (a chain of glow sprites, additive).
  ctx.globalCompositeOperation = 'lighter';
  const ha = 0.07 * A * (1 - 0.55 * drain) * flick * (1 + 0.8 * boost);
  let acc = 0;
  for (let i = n - 1; i > 0; i--) {
    const q = P[i], a = P[i - 1];
    const seg = Math.hypot(q.x - a.x, q.y - a.y);
    const offA = (q.x < -W * 1.6 || q.x > VW + W * 1.6 || q.y < -W * 1.6 || q.y > VH + W * 1.6) && (a.x < -W * 1.6 || a.x > VW + W * 1.6 || a.y < -W * 1.6 || a.y > VH + W * 1.6);
    if (!offA) {
      for (let d = acc; d < seg; d += 9) {
        const k = d / Math.max(1e-6, seg);
        const w = lerp(wAt(i), wAt(i - 1), k);
        drawGlow(ctx, glowOf(PAL.emerald), lerp(q.x, a.x, k), lerp(q.y, a.y, k), w * 1.25, ha);
      }
    }
    acc = (acc - seg) % 9;
    if (acc < 0) acc += 9;
  }
  drawGlow(ctx, glowOf(PAL.emerald), head.x, head.y, W * 1.5, 0.3 * A * (1 + boost));
  ctx.globalCompositeOperation = 'source-over';
  const hr = (head.ws ?? 1) * W;
  fillBand(ctx, edges(P, tail + 8, W + 8, W * 0.05, 3), HEX.ink, A, { x: head.x, y: head.y, r: (hr + 8) / 2 });
  fillBand(ctx, edges(P, tail, W, W * 0.07, 7), HEX.jade, A * flick, { x: head.x, y: head.y, r: hr / 2 });
  // Brush hair (emerald streaks with gaps) and the dry-brush edges (ink gaps, 1 px jade / mint bristles outside).
  const line = (off: number, lw: number, col: string, al: number, gapP: number, salt: number) => {
    ctx.strokeStyle = col;
    ctx.lineWidth = lw;
    ctx.globalAlpha = clamp(al * A);
    ctx.beginPath();
    let on = false;
    for (let i = 0; i < n - 1; i++) {
      const q = P[i], B = P[i + 1];
      const dx = B.x - q.x, dy = B.y - q.y, l = Math.hypot(dx, dy) || 1;
      const w = wAt(i) * off;
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
  fillBand(ctx, edges(P, tail * 0.5, W * 0.26, W * 0.04, 11), HEX.mint, (0.52 + 0.4 * boost) * A * (1 - 0.5 * drain) * flick, { x: head.x, y: head.y, r: hr * 0.15 });
  for (const side of [-1, 1]) {
    line(0.5 * side, Math.max(2, W * 0.06), HEX.ink, 0.9, 0.62, 20 + side);
    for (let b = 0; b < 8; b++) line(side * (0.53 + b * 0.022), 1, b % 2 ? HEX.mint : HEX.jade, (b % 2 ? 0.7 : 0.9) * flick, 0.45 + b * 0.04, 40 + b + side * 9);
  }
  ctx.globalAlpha = 1;
  // The pearl thread core and its glints running to the ball.
  threadLine(ctx, P, drain > 0.3 ? 2 : 3, A, { under: false, halo: 0 });
  const s = [0];
  for (let i = 1; i < n; i++) s.push(s[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y));
  const Lpx = s[n - 1];
  const at = (d: number) => {
    let i = 1;
    while (i < n - 1 && s[i] < d) i++;
    const a = P[i - 1], b = P[i];
    const l = Math.max(1e-6, s[i] - s[i - 1]);
    const k = clamp((d - s[i - 1]) / l);
    return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) };
  };
  ctx.globalCompositeOperation = 'lighter';
  for (let g = 0; g < 6; g++) {
    const d = Lpx - ((o.t * 700 + g * 140) % 840);
    if (d < 0) continue;
    const q = at(d);
    drawGlow(ctx, glowOf(PAL.pearl), q.x, q.y, 5 + W * 0.06, 0.8 * A * flick);
  }
  if (o.pulse && o.pulse.a > 0) {
    const q = at(clamp(o.pulse.d, 0, Lpx));
    drawGlow(ctx, glowOf(PAL.pearl), q.x, q.y, W * 0.8 + 10, 0.95 * o.pulse.a * A);
    drawGlow(ctx, glowOf(PAL.mint), q.x, q.y, W * 1.6 + 20, 0.5 * o.pulse.a * A);
    sparkle(ctx, q.x, q.y, 16, o.pulse.a, Math.PI / 4);
  }
  ctx.globalCompositeOperation = 'source-over';
  // Ink cross-stitches and pearl star-chart ticks.
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
    const ww = wAt(i) * 0.13;
    ctx.moveTo(q.x - (tx + ty) * ww, q.y - (ty - tx) * ww);
    ctx.lineTo(q.x + (tx + ty) * ww, q.y + (ty - tx) * ww);
    ctx.moveTo(q.x - (tx - ty) * ww, q.y - (ty + tx) * ww);
    ctx.lineTo(q.x + (tx - ty) * ww, q.y + (ty + tx) * ww);
  }
  ctx.stroke();
  if (o.ticks !== false) {
    ctx.strokeStyle = HEX.pearl;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.9 * A;
    ctx.beginPath();
    for (let i = 1; i < n - 1; i++) {
      const a = P[i - 1], q = P[i];
      if (Math.floor(a.m / 5) === Math.floor(q.m / 5)) continue;
      const dx = q.x - a.x, dy = q.y - a.y, l = Math.hypot(dx, dy) || 1;
      const ww = wAt(i) * 0.5 + 5;
      const big = Math.floor(q.m / 10) !== Math.floor(a.m / 10);
      ctx.moveTo(q.x + (dy / l) * ww, q.y - (dx / l) * ww);
      ctx.lineTo(q.x + (dy / l) * (ww + (big ? 10 : 6)), q.y - (dx / l) * (ww + (big ? 10 : 6)));
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const every = o.starEvery ?? 4;
  for (let i = 1; i < n - 1; i++) {
    const q = P[i];
    if (q.k < 0 || q.k % every !== 0) continue;
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

/** A standing wave along a stroke (canvas): amp px, `nodes` antinodes, keeping each point's m / k. */
function wave(P: SP[], amp: number, nodes: number): SP[] {
  const n = P.length;
  if (n < 3 || Math.abs(amp) < 0.05) return P;
  const s = [0];
  for (let i = 1; i < n; i++) s.push(s[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y));
  const L = s[n - 1] || 1;
  return P.map((q, i) => {
    const A = P[Math.max(0, i - 1)], B = P[Math.min(n - 1, i + 1)];
    const tl = Math.hypot(B.x - A.x, B.y - A.y) || 1;
    const d = amp * Math.sin((nodes * Math.PI * s[i]) / L);
    return { ...q, x: q.x - ((B.y - A.y) / tl) * d, y: q.y + ((B.x - A.x) / tl) * d };
  });
}

/**
 * The Sky Eye (MERIDIAN's own: an almond of light whose pupil is the ball): w x h, lids opened to `open` (fraction of
 * h). A lantern of emerald light round it, faint jade lashes outside (the meridian lines continuing), inside the dark
 * emerald iris field in screentone, 24 jade meridian lines radiating from the pupil, a degree ring and a running-stitch
 * ring, an ink ring round the pupil; pearl-rimmed lids on an ink outline, pearl corner glints. It reads as light (a
 * lantern), never as a face: no brows, no lashes on the lids. The shot draws the ball (the pupil) on top.
 */
function skyEye6(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, open: number,
  o: { t: number; light: number; pupilR: number; lash?: number; lidsOnly?: boolean; alpha?: number },
) {
  const gap = h * clamp(open);
  const half = w / 2;
  const L = clamp(o.light);
  const ring = o.pupilR + 20;
  const LA = clamp(o.alpha ?? 1);
  if (LA <= 0) return;
  ctx.save();
  ctx.translate(cx, cy);
  const body = !o.lidsOnly;
  ctx.globalCompositeOperation = 'lighter';
  if (body) {
  drawGlow(ctx, glowOf(PAL.emerald), 0, 0, half * 1.3, 0.42 * L * LA, 1, 0.66);
  drawGlow(ctx, glowOf(PAL.jade), 0, 0, half * 0.72, 0.2 * L * LA, 1, 0.5);
  }
  // Lashes: the 24 meridian lines continuing outside the almond, faint, tapering out.
  const lash = clamp(o.lash ?? 1) * L;
  if (body && gap > 2 && lash > 0) {
    ctx.fillStyle = HEX.jade;
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * TAU + o.t * 0.05 + 0.065;
      const c = Math.cos(a), sn = Math.sin(a);
      const r0 = 1 / Math.sqrt((c / (half * 0.94)) ** 2 + (sn / (gap / 2 + 2)) ** 2) + 4;
      const r1 = r0 + lerp(40, 260 - r0 * 0.5, 0.35 + 0.65 * Math.abs(c)) * lash;
      if (r1 <= r0) continue;
      const wd = k % 6 === 0 ? 2.2 : 1.4;
      ctx.globalAlpha = ((k % 6 === 0 ? 0.32 : 0.2) * L) * LA;
      ctx.beginPath();
      ctx.moveTo(c * r0 - sn * wd, sn * r0 + c * wd);
      ctx.lineTo(c * r1, sn * r1);
      ctx.lineTo(c * r0 + sn * wd, sn * r0 - c * wd);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = (1) * LA;
  }
  ctx.globalCompositeOperation = 'source-over';
  const lid = (sign: number, g = gap) => {
    ctx.moveTo(-half, 0);
    ctx.quadraticCurveTo(0, sign * g, half, 0);
  };
  if (body && gap > 0.8) {
    ctx.save();
    ctx.beginPath();
    lid(-1);
    ctx.quadraticCurveTo(0, gap, -half, 0);
    ctx.closePath();
    ctx.clip();
    const g = ctx.createRadialGradient(0, 0, o.pupilR * 0.5, 0, 0, half);
    g.addColorStop(0, '#14805a');
    g.addColorStop(0.3, '#0b5236');
    g.addColorStop(0.7, '#052a1c');
    g.addColorStop(1, '#021209');
    ctx.globalAlpha = (0.96) * LA;
    ctx.fillStyle = g;
    ctx.fillRect(-half, -gap, w, gap * 2);
    ctx.globalAlpha = (1) * LA;
    tone(ctx, -half, -gap, w, gap * 2, '#010805', 0.5 * LA);
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.jade), 0, 0, ring * 1.7, 0.42 * L * LA);
    // Iris striations: the 24 meridian lines from the pupil out to the lids.
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * TAU + o.t * 0.05 + 0.065;
      ctx.moveTo(Math.cos(a) * (o.pupilR + 5), Math.sin(a) * (o.pupilR + 5));
      ctx.lineTo(Math.cos(a) * half, Math.sin(a) * half);
    }
    ctx.strokeStyle = HEX.jade;
    ctx.globalAlpha = (0.6 * (0.5 + 0.5 * L)) * LA;
    ctx.stroke();
    // The degree ring (every 5 deg, long every 30) and its circle.
    ctx.strokeStyle = HEX.mint;
    ctx.globalAlpha = (0.85 * (0.4 + 0.6 * L)) * LA;
    ctx.beginPath();
    for (let k = 0; k < 72; k++) {
      const a = (k / 72) * TAU - o.t * 0.12;
      const r0 = k % 6 === 0 ? ring - 6 : ring - 3;
      ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
      ctx.lineTo(Math.cos(a) * (ring + 1), Math.sin(a) * (ring + 1));
    }
    ctx.stroke();
    ctx.strokeStyle = HEX.jade;
    ctx.globalAlpha = (0.7) * LA;
    ctx.beginPath();
    ctx.arc(0, 0, ring + 2, 0, TAU);
    ctx.stroke();
    // A running-stitch ring further out (MERIDIAN's ring style), turning the other way.
    ctx.globalCompositeOperation = 'source-over';
    ctx.setLineDash([7, 5]);
    ctx.lineDashOffset = o.t * 30;
    ctx.strokeStyle = HEX.ink;
    ctx.lineWidth = 4;
    ctx.globalAlpha = (0.8) * LA;
    ctx.beginPath();
    ctx.arc(0, 0, ring * 1.62, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = HEX.jade;
    ctx.lineWidth = 2;
    ctx.globalAlpha = (0.9 * (0.5 + 0.5 * L)) * LA;
    ctx.stroke();
    ctx.setLineDash([]);
    // The ink ring round the pupil, a jade ring outside it.
    ctx.globalAlpha = (1) * LA;
    ctx.strokeStyle = HEX.ink;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, o.pupilR + 2, 0, TAU);
    ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = HEX.jade;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = (0.9 * L) * LA;
    ctx.beginPath();
    ctx.arc(0, 0, o.pupilR + 6, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
  // The lids: ink outline (heavier on the upper lid), pearl rim, a mint line just inside.
  ctx.lineCap = 'round';
  ctx.globalAlpha = LA;
  ctx.strokeStyle = HEX.ink;
  ctx.lineWidth = 8;
  ctx.beginPath();
  lid(-1);
  lid(1);
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.beginPath();
  lid(-1, gap + 5);
  ctx.stroke();
  ctx.strokeStyle = HEX.pearl;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  lid(-1);
  lid(1);
  ctx.stroke();
  if (gap > 8) {
    ctx.strokeStyle = HEX.mint;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.8 * L * LA;
    ctx.beginPath();
    ctx.moveTo(-half + 12, 0);
    ctx.quadraticCurveTo(0, -(gap - 7), half - 12, 0);
    ctx.moveTo(-half + 12, 0);
    ctx.quadraticCurveTo(0, gap - 7, half - 12, 0);
    ctx.stroke();
    ctx.globalAlpha = (1) * LA;
  }
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.pearl), -half, 0, 14, 0.9 * (0.4 + 0.6 * L) * LA);
  drawGlow(ctx, glowOf(PAL.pearl), half, 0, 14, 0.9 * (0.4 + 0.6 * L) * LA);
  ctx.restore();
  sparkle(ctx, cx - half, cy, 9 * (0.5 + 0.5 * L), 0.9 * LA, Math.PI / 4);
  sparkle(ctx, cx + half, cy, 9 * (0.5 + 0.5 * L), 0.9 * LA, Math.PI / 4);
}

/** The almond's path (for clips): the same lids as skyEye6. */
function eyePath(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, open: number) {
  const gap = h * clamp(open), half = w / 2;
  ctx.beginPath();
  ctx.moveTo(cx - half, cy);
  ctx.quadraticCurveTo(cx, cy - gap, cx + half, cy);
  ctx.quadraticCurveTo(cx, cy + gap, cx - half, cy);
  ctx.closePath();
}

/** The pearl hairline that splits the sky before the lids part (k 0..1 = its reach). */
function hairline(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, k: number, a: number) {
  if (k <= 0 || a <= 0) return;
  const hw = (w / 2) * k;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = HEX.ink;
  ctx.beginPath();
  ctx.moveTo(cx - hw - 4, cy);
  ctx.lineTo(cx, cy - 4);
  ctx.lineTo(cx + hw + 4, cy);
  ctx.lineTo(cx, cy + 4);
  ctx.closePath();
  ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.mint), cx, cy, hw * 1.05, 0.55 * a, 1, 0.08);
  drawGlow(ctx, glowOf(PAL.emerald), cx, cy, hw * 0.9, 0.5 * a, 1, 0.3);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = HEX.pearl;
  ctx.beginPath();
  ctx.moveTo(cx - hw, cy);
  ctx.lineTo(cx, cy - 1.8);
  ctx.lineTo(cx + hw, cy);
  ctx.lineTo(cx, cy + 1.8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  sparkle(ctx, cx - hw, cy, 10, a, Math.PI / 4);
  sparkle(ctx, cx + hw, cy, 10, a, Math.PI / 4);
}

/** The ball's look: a pearl 4-point glint sliding from its top to its lower half (it looks down at the defenders). */
function pupilGlint(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, look: number, a: number) {
  if (a <= 0) return;
  const gy = y + lerp(-0.42, 0.5, clamp(look)) * r;
  const gx = x + lerp(-0.25, 0.05, clamp(look)) * r;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.pearl), gx, gy, r * 0.5, 0.8 * a);
  ctx.restore();
  sparkle(ctx, gx, gy, r * 0.55, a, 0);
}

/** A floodlight lamp head's emissive pass (after the ink): the lamp grid, its warm glare, the jade it catches. */
interface Lamp {
  x: number;
  y: number;
  s: number;
  rot: number;
  cols: number;
  rows: number;
  tint: number;
}
function lampHead(ctx: CanvasRenderingContext2D, L: Lamp) {
  const cw = 7 * L.s, ch = 5 * L.s, W = L.cols * cw + 2 * L.s, H = L.rows * ch + 2 * L.s;
  ctx.save();
  ctx.translate(L.x, L.y);
  ctx.rotate(L.rot);
  ctx.fillStyle = '#020604';
  ctx.fillRect(-W / 2 - 2 * L.s, -H / 2 - 2 * L.s, W + 4 * L.s, H + 4 * L.s);
  ctx.fillStyle = css(mixc(LAMP_WARM, LAMP_JADE, L.tint));
  for (let r = 0; r < L.rows; r++)
    for (let c = 0; c < L.cols; c++) ctx.fillRect(-W / 2 + L.s + c * cw + 0.5 * L.s, -H / 2 + L.s + r * ch + 0.5 * L.s, cw - L.s, ch - L.s);
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf([255, 248, 222]), L.x, L.y, W * 1.25, 0.28 * (1 - 0.6 * L.tint), 1.5, 0.8);
  drawGlow(ctx, glowOf(LAMP_JADE), L.x, L.y, W * 1.1, 0.4 * L.tint, 1.5, 0.8);
  drawGlow(ctx, glowOf(PAL.jade), L.x, L.y, W * 1.7, 0.18 * L.tint, 1.4, 0.9);
  ctx.restore();
}

// ================================================================ 6a · the eye opens (worm's-eye)

const A_EYE = { w: 360, h: 150 };
const A_BALL_R = 24;
/** The ball high above, barely creeping (u 0.721 -> 0.728). */
const ballA = (t: number): [number, number] => [lerp(316, 323, clamp(t / T_B)), 96];
const openA = (t: number) => (t < 0.11 ? 0 : 0.7 * ease.outCubic(clamp((t - 0.11) / 0.3)));
const hairA = (t: number) => (t < 0.05 ? 0 : ease.outExpo(clamp((t - 0.05) / 0.06)));
/** The eye's light 0..1 (the hairline glints first, the lids open the lantern). */
const lightA = (t: number) => Math.max(0.35 * hairA(t), clamp(openA(t) / 0.7));

/** The Meridian in the worm's-eye: from the bottom-left corner up to the ball (a quadratic, sampled, m in metres). */
function strokeA(ball: [number, number]): SP[] {
  const p0: [number, number] = [-70, 440], c: [number, number] = [70, 175];
  const out: SP[] = [];
  let m = 0, px = p0[0], py = p0[1];
  const N = 44;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const x = (1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * c[0] + u * u * ball[0];
    const y = (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * c[1] + u * u * ball[1];
    m += Math.hypot(x - px, y - py) / 9;
    px = x;
    py = y;
    out.push({ x, y, m, k: i });
  }
  return out;
}

/** The two leaning towers' lamp heads (worm's-eye), facing down at us. */
function lampsA(t: number, P: SP[], ball: [number, number]): Lamp[] {
  const heads: [number, number, number][] = [[78, 42, 0.5], [566, 36, -0.45]];
  return heads.map(([x, y, rot]) => {
    const k = Math.max(lampTintFor([x, y], P, 1), lampTintFor([x, y], [ball], 0.8 + 0.4 * lightA(t)));
    return { x, y, s: 1.6, rot, cols: 6, rows: 4, tint: clamp(k) };
  });
}

const BOWL = { cx: 320, cy: 160, rx: 352, ry: 238 };
/** The bowl from the turf (before the ink): the stands' underside in the corners, the sky in the roof's opening. */
function bowlA(ctx: CanvasRenderingContext2D) {
  const { cx, cy, rx, ry } = BOWL;
  ctx.fillStyle = '#16302a';
  ctx.fillRect(-60, -60, VW + 120, VH + 120);
  for (let r = 0; r < 9; r++) {
    const k = 1.16 + r * 0.06;
    const n = 70 + r * 8;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + r * 0.37;
      const x = cx + Math.cos(a) * rx * k, y = cy + Math.sin(a) * ry * k;
      if (x < -10 || x > VW + 10 || y < -10 || y > VH + 10) continue;
      const hh = hash(i * 7 + r * 131);
      ctx.fillStyle = hh < 0.33 ? '#3a5248' : hh < 0.66 ? '#22382f' : '#4a6257';
      ctx.fillRect(Math.round(x), Math.round(y), 4, 3);
    }
  }
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU);
  ctx.clip();
  const g = ctx.createRadialGradient(318, 100, 20, 318, 130, 430);
  g.addColorStop(0, '#2a8a64');
  g.addColorStop(0.3, '#16563f');
  g.addColorStop(0.65, '#0c3a29');
  g.addColorStop(1, '#0a3022');
  ctx.fillStyle = g;
  ctx.fillRect(-10, -10, VW + 20, VH + 20);
  tone(ctx, -10, -10, VW + 20, VH + 20, '#010604', 0.55);
  ctx.restore();
}

/** After the ink: the light in the bowl (the eye's lantern on the sky, the floodlit haze low behind the figures). */
function bowlLightA(ctx: CanvasRenderingContext2D, L: number, ball: [number, number]) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf([20, 90, 64]), ball[0], ball[1] + 30, 470, 0.35 + 0.45 * L, 1.15, 0.95);
  drawGlow(ctx, glowOf([36, 110, 84]), 150, 395, 330, 0.55, 1.2, 0.75);
  drawGlow(ctx, glowOf([36, 110, 84]), 560, 410, 280, 0.45, 1.2, 0.7);
  drawGlow(ctx, glowOf([70, 90, 76]), 78, 42, 170, 0.35, 1, 1);
  drawGlow(ctx, glowOf([70, 90, 76]), 566, 36, 170, 0.35, 1, 1);
  ctx.restore();
}

/** After the light: the bowl's structure in ink (roof rim band, its fascia catching the eye's jade, the two towers). */
function bowlInkA(ctx: CanvasRenderingContext2D, L: number) {
  const { cx, cy, rx, ry } = BOWL;
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx + 46, ry + 40, 0, 0, TAU);
  ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU, true);
  ctx.fillStyle = '#020605';
  ctx.fill('evenodd');
  ctx.strokeStyle = '#0f2a1f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * TAU;
    ctx.moveTo(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry);
    ctx.lineTo(cx + Math.cos(a + 0.05) * (rx + 46), cy + Math.sin(a + 0.05) * (ry + 40));
  }
  ctx.stroke();
  // The fascia (the roof's inner edge) catching the eye's light.
  ctx.strokeStyle = HEX.jade;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.3 + 0.5 * L;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx + 1, ry + 1, 0, 0, TAU);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();
  for (const [bx, hx, hy] of [[-30, 78, 42], [670, 566, 36]] as const) {
    ctx.save();
    ctx.strokeStyle = '#010302';
    const by = VH + 40;
    const nx = hy - by, ny = -(hx - bx);
    const l = Math.hypot(nx, ny);
    const ox = (nx / l) * 10, oy = (ny / l) * 10;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(bx - ox * 1.8, by - oy * 1.8);
    ctx.lineTo(hx - ox * 0.6, hy + 18 - oy * 0.6);
    ctx.moveTo(bx + ox * 1.8, by + oy * 1.8);
    ctx.lineTo(hx + ox * 0.6, hy + 18 + oy * 0.6);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let k = 0; k < 14; k++) {
      const u0 = k / 14, u1 = (k + 1) / 14;
      const w0 = lerp(1.8, 0.6, u0), w1 = lerp(1.8, 0.6, u1);
      const x0 = lerp(bx, hx, u0), y0 = lerp(by, hy + 18, u0), x1 = lerp(bx, hx, u1), y1 = lerp(by, hy + 18, u1);
      ctx.moveTo(x0 - ox * w0, y0 - oy * w0);
      ctx.lineTo(x1 + ox * w1, y1 + oy * w1);
      ctx.moveTo(x0 + ox * w0, y0 + oy * w0);
      ctx.lineTo(x1 - ox * w1, y1 - oy * w1);
    }
    ctx.stroke();
    // The eye's jade catching the near rail.
    ctx.strokeStyle = HEX.jade;
    ctx.globalAlpha = 0.35 * L;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const side = bx < 0 ? 1 : -1;
    ctx.moveTo(bx + side * ox * 1.8, by + side * oy * 1.8);
    ctx.lineTo(hx + side * ox * 0.6, hy + 18 + side * oy * 0.6);
    ctx.stroke();
    ctx.restore();
  }
}

/** D3 and D4 far below the lens, looking straight up: cached puppet crops as ink silhouettes rim-lit jade from above. */
const POSE_UP: Pose = P({ ...POSES.craneUp, head: -70 * (Math.PI / 180), torso: -14 * (Math.PI / 180) });
const SIL_UP = { fill: [3, 8, 6] as RGB, rim: PAL.jade, rim2: [14, 110, 70] as RGB, lx: 0.1, ly: -1 };
function rivalHeadsA(ctx: CanvasRenderingContext2D, t: number) {
  const j = joints(POSE_UP);
  const list: [string, typeof RIVAL_KIT_C, number, number, number][] = [
    ['s6-d3-up', RIVAL_KIT_C, 474, 300, 2.7],
    ['s6-d4-up', RIVAL_KIT_D, 592, 326, 2.3],
  ];
  for (const [name, kit, hx, hy, D] of list) {
    const tr = Math.sin(t * 61 + hx) * 0.6;
    // Place the cached pose so its head lands on (hx, hy) (k 1: puppet units x D).
    const x = hx + j.head[0] * D, y = hy - j.head[1] * D;
    PUPPETS.draw(ctx, name, kit, POSE_UP, 1, -1, Math.round(x + tr), Math.round(y), D, 0, SIL_UP);
  }
}

/** The Tower's back from below (TC1 / TC1b at 3x): an ink silhouette rim-lit jade from above, trembling 1 px. */
function towerBackA(ctx: CanvasRenderingContext2D, t: number) {
  const key = seqAt(SEQ_TOWER, Math.min(t, 0.69));
  const f = tower(key);
  if (!f) return;
  const tr = Math.floor(t * 30) % 2;
  const L = lightA(t);
  const dim = f.a.silhouette(f.i, { fill: [2, 6, 5], rim: [30, 96, 68], rim2: [12, 44, 32], lx: 0.15, ly: -1 });
  const lit = f.a.silhouette(f.i, { fill: [2, 6, 5], rim: PAL.mint, rim2: PAL.jade, lx: 0.15, ly: -1 });
  drawAnim(ctx, f.a, dim, f.i, 168 + tr, 262, 3, { anchor: 'head' });
  drawAnim(ctx, f.a, lit, f.i, 168 + tr, 262, 3, { anchor: 'head', alpha: 0.35 + 0.65 * L });
}

/** TF3 x2 with a jade rim from above and a screentone shadow (built in prepare(); null while the strip is missing). */
let tf3Cv: HTMLCanvasElement | null = null;
function buildTF3(): HTMLCanvasElement | null {
  const f = tower('TF3');
  if (!f) return null;
  const S = 2;
  const cv = document.createElement('canvas');
  cv.width = f.a.w * S;
  cv.height = f.a.h * S;
  const g = cv.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  g.drawImage(f.a.tinted(f.i, PAL.jade), 0, -S, f.a.w * S, f.a.h * S);
  g.drawImage(f.a.frames[f.i].img, 0, 0, f.a.w * S, f.a.h * S);
  g.globalCompositeOperation = 'source-atop';
  // The eye's light from above (a jade wash on the brow and the crown), the shadow side printed in screentone.
  const gr = g.createLinearGradient(0, 30 * S, 0, 64 * S);
  gr.addColorStop(0, 'rgba(47,224,138,0.22)');
  gr.addColorStop(1, 'rgba(47,224,138,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, cv.width, 64 * S);
  const pat = g.createPattern(toneTile('#06140f'), 'repeat');
  if (pat) {
    g.fillStyle = pat;
    for (let y = 54; y < 128; y += 2) {
      g.globalAlpha = clamp((y - 54) / 50) * 0.75;
      g.fillRect(0, y * S, cv.width, 2 * S);
    }
    g.globalAlpha = 0.55;
    g.fillRect(f.a.w * S * 0.68, 20 * S, f.a.w * S * 0.32, 40 * S);
  }
  const sh = g.createLinearGradient(0, 70 * S, 0, 128 * S);
  sh.addColorStop(0, 'rgba(6,20,15,0)');
  sh.addColorStop(1, 'rgba(6,20,15,0.7)');
  g.globalAlpha = 1;
  g.fillStyle = sh;
  g.fillRect(0, 70 * S, cv.width, 58 * S);
  return cv;
}

/** 0.42-0.70: the coil panel (TF3 x2) slams in at the right, shakes 1 px, rips upward at 0.66. Screen space. */
function coilPanel(env: Env, t: number) {
  if (t < 0.42 || t >= T_B) return;
  const ctx = env.ctx;
  if (!tf3Cv) tf3Cv = buildTF3();
  const slam = 1 - ease.outExpo(clamp((t - 0.42) / 0.06));
  const rip = t >= 0.66 ? -440 * ease.inQuad(clamp((t - 0.66) / 0.04)) : 0;
  const shake = Math.floor(t * 30) % 2;
  const PX = 512, PY = 196;
  const poly = panelPoly(PX, PY, 230, 200, 3);
  const f = tower('TF3');
  mangaPanels(ctx, [{
    poly,
    border: 4,
    gutter: 3,
    fill: '#06140f',
    dx: Math.round(300 * slam) + shake,
    dy: Math.round(rip),
    draw: (c) => {
      // Background: a jade burst behind his head, ink focus lines, screentone.
      c.save();
      c.globalCompositeOperation = 'lighter';
      drawGlow(c, glowOf(PAL.emerald), PX + 6, PY - 30, 170, 0.6);
      c.restore();
      focusLines(c, env.frng(61), PX + 6, PY - 26, 70, 260, 46, HEX.ink, 0.9, 4);
      tone(c, PX - 130, PY - 120, 260, 240, '#020806', 0.4);
      if (tf3Cv && f) {
        const ch = f.a.anchorOf(f.i, 'chest');
        const x = Math.round(PX - ch[0] * 2), y = Math.round(PY + 64 - ch[1] * 2);
        c.imageSmoothingEnabled = false;
        c.drawImage(tf3Cv, x, y);
        // The jade eye reflected in both pupils: two tiny jade almonds with a pearl point.
        for (const nm of ['eyeL', 'eyeR']) {
          const e = f.a.anchorOf(f.i, nm);
          const ex = x + Math.floor(e[0]) * 2, ey = y + Math.floor(e[1]) * 2;
          c.fillStyle = HEX.jade;
          c.fillRect(ex - 1, ey, 4, 2);
          c.fillRect(ex, ey - 1, 2, 4);
          c.fillStyle = HEX.pearl;
          c.fillRect(ex, ey, 1, 1);
          c.save();
          c.globalCompositeOperation = 'lighter';
          drawGlow(c, glowOf(PAL.jade), ex + 1, ey + 1, 5, 0.6);
          c.restore();
        }
      }
    },
  }]);
  inkSfx(ctx, 'GRR', PX - 72 + 300 * slam, PY - 66 + rip, 26, -0.12, { fill: HEX.jade, outer: HEX.ink, pop: clamp((t - 0.44) / 0.08) });
  if (t >= 0.62) {
    // His launch read on the panel: mint streaks tearing upward with it.
    const fr = env.frng(62);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = HEX.mint;
    for (let i = 0; i < 18; i++) {
      const x = PX - 110 + fr.next() * 220, y = PY + 100 + rip + fr.next() * 120;
      ctx.globalAlpha = 0.35 * fr.next();
      ctx.lineWidth = fr.next() < 0.3 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 40 + fr.next() * 80);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function render6a(env: Env, t: number) {
  const { ctx, fx, cam } = env;
  // A slow push (1.00 -> 1.10 about (320, 120)) with a breath of tilt up into the eye.
  zoomAbout(cam, 320, lerp(132, 120, ease.inOutSine(clamp(t / T_B))), 320, 120, lerp(1, 1.1, ease.inSine(clamp(t / T_B))));
  env.world();
  const ball = ballA(t);
  const P = strokeA(ball);
  const L = lightA(t);
  bowlA(ctx);
  nightInk(ctx, 0.85);
  bowlLightA(ctx, L, ball);
  bowlInkA(ctx, L);
  rivalHeadsA(ctx, t);
  // The lamp heads (emissive, after the ink), tinted by their distance to the arc and the eye.
  const lamps = lampsA(t, P, ball);
  for (const l of lamps) lampHead(ctx, l);
  let best = lamps[0];
  for (const l of lamps) if (l.tint > best.tint) best = l;
  if (best.tint > 0.35) lensFlare(ctx, best.x, best.y, 110 * best.tint, 0.4 * best.tint, JADE_FLARE);
  // A few crowd camera flashes (tiny, one at a time, never in unison).
  {
    ctx.save();
    for (let i = 0; i < 5; i++) {
      const ph = (t * 0.9 + i * 0.37) % 1;
      if (ph > 0.12) continue;
      const a = hash(i * 13 + Math.floor(t * 0.9 + i * 0.37) * 7) * TAU;
      const x = 320 + Math.cos(a) * 352 * 1.3, y = 160 + Math.sin(a) * 238 * 1.3;
      if (x < 2 || x > VW - 2 || y < 2 || y > VH - 2) continue;
      ctx.globalAlpha = 0.9 * (1 - ph / 0.12);
      ctx.fillStyle = HEX.pearl;
      ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
    }
    ctx.restore();
  }
  // The stroke from the bottom-left corner up to the ball.
  brush(ctx, P, 40, { t, tail: 20, starEvery: 5, ticks: false });
  // The eye: the hairline, then the lids.
  const open = openA(t);
  if (open > 0) skyEye6(ctx, ball[0], ball[1], A_EYE.w, A_EYE.h, open, { t, light: L, pupilR: A_BALL_R, lash: ease.outCubic(clamp((t - 0.12) / 0.4)) });
  hairline(ctx, ball[0], ball[1], A_EYE.w, hairA(t), t < 0.11 ? 1 : 1 - clamp((t - 0.11) / 0.08));
  drawBall(env, spin, ball[0], ball[1], 12, 2, 0, 1.0 + 0.4 * L, 'pearl', undefined, { seamGlow: 0.9 });
  spinMarks(ctx, ball[0], ball[1], A_BALL_R + 1, -t * 9, { color: HEX.mint, ink: true, width: 4, len: 0.9, dir: -1, alpha: 0.8 });
  if (t >= 0.2) pupilGlint(ctx, ball[0], ball[1], A_BALL_R, ease.inOutSine(clamp((t - 0.35) / 0.25)), clamp((t - 0.2) / 0.1));
  // Jade motes drifting down out of the eye's light (falling, never rising off a figure).
  env.parts.draw(ctx, 0);
  env.parts.draw(ctx, 1);
  // The foreground: the Tower's back, rim-lit from above.
  towerBackA(ctx, t);
  // The panel (screen space, integer x2).
  env.screen();
  coilPanel(env, t);
  // Post.
  nightGrade(fx, { bloom: 1.15, thresh: 0.62, ca: t >= 0.05 ? 0.006 : 0.003 });
  if (t >= 0.05) {
    const [u, v] = cam.toUV(ball[0], ball[1]);
    const k = clamp((t - 0.05) / 0.6);
    pushShock(fx, { x: u, y: v, r: 0.6 * ease.outCubic(k), s: 0.025 * (1 - k) });
  }
}

// ================================================================ 6b · the ride world at apex height

/** The ball's ride-world point at t. */
function ballW(t: number): [number, number] {
  const a = arcAt(ballU(6, t));
  return rideXY(a.x, a.h);
}

/** The arc on a fixed u grid (ride world + metres from the boot), so per-point details stay put as the line moves. */
const DU = 0.004;
const GRID: { u: number; X: number; Y: number; m: number }[] = (() => {
  const out: { u: number; X: number; Y: number; m: number }[] = [];
  let m = 0, px = 772, ph = 0;
  for (let k = 0; k * DU <= 0.8001; k++) {
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
const metresAt = (u: number) => {
  const i = Math.min(GRID.length - 2, Math.floor(u / DU));
  return lerp(GRID[i].m, GRID[i + 1].m, clamp((u - GRID[i].u) / DU));
};

const ZOOM6: KeyRow[] = [[T_B, 1.7], [GRAB, 1.7], [1.16, 1.9, 'outSine'], [RELEASE, 1.9], [WHIP, 1.6, 'outCubic'], [DUR, 1.6]];
const LOCK_X = 360, LOCK_Y = 96;
/** The grab: 72 px (screen, at the 0.86 zoom) behind the ball along the arc. */
const GRAB_PX = 72;
const U_GRAB = (() => {
  const u0 = ballU(6, GRAB);
  const want = GRAB_PX / 1.7;
  let u = u0, d = 0;
  let [px, py] = ballW(GRAB);
  while (d < want && u > 0.5) {
    u -= 0.0002;
    const a = arcAt(u);
    const [x, y] = rideXY(a.x, a.h);
    d += Math.hypot(x - px, y - py);
    px = x;
    py = y;
  }
  return u;
})();
const GRAB_W = (() => {
  const a = arcAt(U_GRAB);
  return rideXY(a.x, a.h);
})();
/** The apex in the ride world (the eye stays here once the ball has whipped out of it). */
const APEX_W = rideXY(arcAt(0.72).x, arcAt(0.72).h);

/** Depth of the V (screen px): hauled 0 -> 60 over the tug, snapped back at the TWANG. */
function sagAt(t: number) {
  if (t < GRAB) return 0;
  if (t < 1.16) return 60 * ease.outQuad((t - GRAB) / 0.3);
  if (t < TWANG) return 60 + Math.sin((t - 1.16) * 90) * 1.5;
  return 60 * Math.exp(-(t - TWANG) / 0.018);
}
/** How far the ball has crept (0..1) through the tug (its own u keys: speed eased to 30 %, never zero). */
const creepK = (t: number) => clamp((ballU(6, Math.min(t, TWANG)) - ballU(6, GRAB)) / (ballU(6, TWANG) - ballU(6, GRAB)));
const CREEP_EXTRA = 20;

interface View {
  z: number;
  cx: number;
  cy: number;
  /** The ball's screen point (shake included). */
  bx: number;
  by: number;
  /** The whip-tilt's world offset (screen px, world layers move up by it). */
  wy: number;
  /** Shake (screen px). */
  shx: number;
  shy: number;
  /** The creep the camera does not follow: the ball's extra screen x over its world projection (the tug). */
  ex: number;
}

function viewAt(env: Env | null, t: number): View {
  const z = keys(ZOOM6, t) + punch(t, TWANG, 0.12, 0.05, 0.3);
  const [BX, BY] = ballW(t);
  // The camera sinks with his weight (the lamps and the eye ride up; his legs stay in the frame).
  const follow = 0.75 * sagAt(t);
  let sx: number, sy: number, cx: number, ex = 0;
  const holdX = (() => {
    const [hx] = ballW(GRAB);
    return hx - (LOCK_X - 320) / 1.7;
  })();
  if (t < GRAB) {
    sx = LOCK_X;
    sy = LOCK_Y;
    cx = BX - (sx - 320) / z;
  } else if (t < TWANG) {
    cx = holdX;
    ex = CREEP_EXTRA * creepK(t);
    sx = 320 + (BX - cx) * z + ex;
    sy = LOCK_Y - follow;
  } else if (t < RELEASE) {
    const k = ease.outCubic((t - TWANG) / (RELEASE - TWANG));
    cx = lerp(holdX, BX - (LOCK_X - 320) / z, k);
    ex = CREEP_EXTRA * (1 - k);
    sx = 320 + (BX - cx) * z + ex;
    sy = LOCK_Y - follow;
  } else if (t < WHIP) {
    sx = keys([[RELEASE, LOCK_X], [WHIP, 392, 'inQuad']], t);
    sy = keys([[RELEASE, LOCK_Y], [WHIP, 150, 'inQuad']], t);
    cx = BX - (sx - 320) / z;
  } else {
    sx = keys([[WHIP, 392], [DUR, 352, 'inOutSine']], t);
    sy = keys([[WHIP, 150], [DUR, 166, 'outQuad']], t);
    cx = BX - (sx - 320) / z;
  }
  const cy = BY - (sy - 180) / z;
  const wy = t >= WHIP ? 520 * ease.inCubic(clamp((t - WHIP) / (DUR - WHIP))) : 0;
  let shx = 0, shy = 0;
  if (env) {
    env.cam.set(cx, cy, z, 0);
    const [u, v] = env.cam.toUV(cx, cy);
    shx = u * VW - VW / 2;
    shy = v * VH - VH / 2;
  }
  return { z, cx, cy, bx: sx + shx, by: sy + shy, wy, shx, shy, ex };
}
/** A ride-world point on screen (the world layers: the whip-tilt moves them up by wy). */
const proj = (v: View, X: number, Y: number): [number, number] => [320 + (X - v.cx) * v.z + v.shx, 180 + (Y - v.cy) * v.z + v.shy - v.wy];

interface LineB {
  P: SP[];
  /** The fist on the (sagged) line, screen. */
  fx: number;
  fy: number;
  /** Index of the grab point in P (-1 before the grab). */
  gi: number;
}

/**
 * The Meridian at apex height, screen space: the grid behind the ball, hauled into a V through the grab (a fixed point
 * of the thread), the stretch between the fist and the ball carried forward with the creep, then the ball's own point;
 * in the whip the last stretch becomes the needle hanging from the apex down to the ball.
 */
function lineB(t: number, v: View): LineB {
  const u = ballU(6, t);
  const P: SP[] = [];
  for (let k = 0; k < GRID.length && GRID[k].u < u - 1e-6; k++) {
    const g = GRID[k];
    if (g.u < 0.36) continue;
    const [x, y] = proj(v, g.X, g.Y);
    P.push({ x, y, m: g.m, k });
  }
  const [BX, BY] = ballW(t);
  const [px, py] = proj(v, BX, BY);
  const mB = metresAt(u);
  P.push({ x: px, y: py, m: mB, k: -1 });
  // The grab point (a fixed point of the thread from 0.86 to the TWANG).
  let gi = -1;
  const sag = sagAt(t);
  const tug = t >= GRAB && t < TWANG + 0.1;
  if (tug) {
    const mG = metresAt(U_GRAB);
    gi = 0;
    while (gi < P.length - 1 && P[gi].m < mG) gi++;
    const [gx, gy] = proj(v, GRAB_W[0], GRAB_W[1]);
    P.splice(gi, 0, { x: gx, y: gy, m: mG, k: -2 });
    // Arc distances along the screen polyline from the grab.
    const n = P.length;
    const s = [0];
    for (let i = 1; i < n; i++) s.push(s[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y));
    const sG = s[gi], sB = s[n - 1];
    for (let i = 0; i < n; i++) {
      let prof: number;
      if (i <= gi) {
        const d = sG - s[i];
        const f = clamp(1 - d / 270);
        prof = f * f * (3 - 2 * f);
      } else prof = 1 - (s[i] - sG) / Math.max(1, sB - sG);
      // The creep: the stretch between fist and ball is carried forward with the ball.
      const fwd = i > gi ? v.ex * (1 - prof) : 0;
      P[i] = { ...P[i], x: P[i].x + fwd, y: P[i].y + sag * prof, ws: i > gi ? lerp(1, 0.55, clamp(sag / 60)) : 1 };
    }
  }
  // The ball's own point (the lock keys it; it can run ahead of its world projection: the creep, the whip's fall).
  const last = P[P.length - 1];
  const dx = v.bx - last.x, dy = v.by - last.y;
  if (Math.hypot(dx, dy) > 24) {
    // The needle: the stretch from the apex down to the ball.
    const steps = Math.ceil(Math.hypot(dx, dy) / 14);
    const x0 = last.x, y0 = last.y;
    P.pop();
    for (let i = 0; i <= steps; i++) {
      const k = i / steps;
      P.push({ x: lerp(x0, v.bx, k), y: lerp(y0, v.by, k) + Math.sin(k * Math.PI) * dx * 0.08, m: mB + k * 0.6, k: -1 });
    }
  } else {
    P[P.length - 1] = { ...last, x: v.bx, y: v.by };
  }
  // Clip the far tail (off screen bottom-left) so the stroke work stays on screen.
  let first = 0;
  while (first < P.length - 3 && P[first + 1].x < -220 && P[first + 1].y > VH + 120) first++;
  const out = first > 0 ? P.slice(first) : P;
  const gi2 = gi >= 0 ? gi - first : -1;
  const f = gi2 >= 0 ? out[gi2] : out[out.length - 1];
  return { P: out, fx: f.x, fy: f.y, gi: gi2 };
}

/** The ride world's stadium at apex height: the far stand's roofline low in the frame, lamp masts rising past us. */
interface Back {
  roofY: number;
  shift: number;
  lamps: Lamp[];
}
const ROOF0 = 292;
function backB(v: View, P: SP[], light: number): Back {
  const v0 = viewAt(null, T_B);
  // Far layer (parallax 0.3): it drifts a little against the camera's travel; the whip-tilt moves it with everything.
  const PF = 0.3;
  const shift = -(v.cx - v0.cx) * v.z * PF;
  const roofY = ROOF0 - (v.cy - v0.cy) * v.z * PF + v.shy - v.wy;
  const heads: [number, number, number][] = [[50, 246, 1.25], [188, 224, 1.0], [616, 228, 0.85]];
  const ballPt: [number, number][] = [[v.bx, v.by]];
  const lamps = heads.map(([x, dy, s]) => {
    const hx = x + shift + v.shx, hy = roofY - dy;
    const k = Math.max(lampTintFor([hx, hy], P, light), lampTintFor([hx, hy], ballPt, light));
    return { x: hx, y: hy, s: 1.4 * s, rot: 0, cols: 6, rows: 3, tint: clamp(k) };
  });
  return { roofY, shift, lamps };
}
/** Before the ink: the sky down to the roofline, the far stand (roof slab, crowd tiers), the pitch far below. */
function drawBackB(ctx: CanvasRenderingContext2D, st: Env['art']['stadium'], b: Back) {
  const g = ctx.createLinearGradient(0, b.roofY - 360, 0, b.roofY);
  g.addColorStop(0, '#05140e');
  g.addColorStop(0.55, '#0e3426');
  g.addColorStop(1, '#2a6a50');
  ctx.fillStyle = g;
  ctx.fillRect(-10, -10, VW + 20, VH + 20);
  tone(ctx, -10, -10, VW + 20, VH + 20, '#010604', 0.5);
  if (b.roofY < VH + 30) {
    const top = b.roofY;
    const bot = top + 300;
    ctx.fillStyle = '#20382e';
    ctx.fillRect(-10, top, VW + 20, bot - top);
    const ch = 300 * 0.86;
    const cw = st.crowd.width * (ch / st.crowd.height) * 0.6;
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.imageSmoothingEnabled = true;
    const x0 = (((b.shift % cw) + cw) % cw) - cw;
    for (let x = x0; x < VW + cw; x += cw) ctx.drawImage(st.crowd, x, top + 16, cw, ch);
    ctx.globalCompositeOperation = 'saturation';
    ctx.fillStyle = 'rgb(128,128,128)';
    ctx.fillRect(-10, top, VW + 20, bot - top + 10);
    ctx.restore();
    const shade = ctx.createLinearGradient(0, top, 0, top + 90);
    shade.addColorStop(0, 'rgba(2,6,4,0.95)');
    shade.addColorStop(1, 'rgba(2,6,4,0)');
    ctx.fillStyle = shade;
    ctx.fillRect(-10, top, VW + 20, 90);
    ctx.fillStyle = 'rgba(2,8,5,0.55)';
    for (let k = 1; k < 7; k++) ctx.fillRect(-10, Math.round(top + k * 42), VW + 20, 1);
    ctx.fillStyle = '#010403';
    ctx.fillRect(-10, top - 12, VW + 20, 15);
    if (bot < VH + 10) {
      ctx.fillStyle = '#123a27';
      ctx.fillRect(-10, bot, VW + 20, VH - bot + 10);
      ctx.fillStyle = '#18482f';
      for (let k = 0; k < 8; k++) ctx.fillRect(-10, bot + 8 + k * 26, VW + 20, 13);
    }
  }
}
/** After the ink: the floodlit haze over the roofline, the masts in ink, the roof's lit lip, the lamp heads. */
function drawBackLightB(ctx: CanvasRenderingContext2D, b: Back, haze = 1) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf([40, 110, 84]), 320, b.roofY - 6, 520, 0.5 * haze, 1.2, 0.32);
  drawGlow(ctx, glowOf([60, 120, 96]), 320, b.roofY + 20, 420, 0.3 * haze, 1.4, 0.18);
  ctx.restore();
  ctx.fillStyle = '#010302';
  for (const l of b.lamps) {
    const w = 5 * l.s;
    ctx.fillRect(l.x - w / 2, l.y, w, b.roofY - l.y);
    ctx.fillRect(l.x - w * 1.6, b.roofY - 26, w * 3.2, 26);
    ctx.strokeStyle = '#010302';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let y = l.y + 30; y < b.roofY - 26; y += 14) {
      ctx.moveTo(l.x - w * 1.1, y);
      ctx.lineTo(l.x + w * 1.1, y + 14);
    }
    ctx.stroke();
  }
  ctx.fillStyle = '#5a8a74';
  ctx.globalAlpha = 0.7;
  ctx.fillRect(-10, Math.round(b.roofY - 12), VW + 20, 1);
  ctx.globalAlpha = 1;
  for (const l of b.lamps) lampHead(ctx, l);
}

/** The Tower in 6b: TJ1 erupting (fist arriving on the grab), TJ2 / TJ2b hanging and swinging, TJ3 flung. */
const T_SCALE = 2.4;
function towerPivot(t: number, line: LineB, v: View): { key: TowerKey; x: number; y: number; anchor: string; rot: number } | null {
  const key = seqAt(SEQ_TOWER, t);
  if (t < GRAB) {
    const k = ease.outCubic(clamp((t - T_B) / (GRAB - T_B)));
    // Aim at where the grab point will be (the fist arrives on the thread at 0.86).
    const [gx, gy] = proj(v, GRAB_W[0], GRAB_W[1]);
    // His gloves are already breaking into the bottom of the frame on the cut (the panel ripped upward: his launch).
    return { key, x: gx + lerp(-46, 0, k), y: gy + lerp(232, 0, k), anchor: 'fist', rot: lerp(0.22, 0.02, k) };
  }
  if (t < TWANG) {
    const s = t - GRAB;
    const swing = -0.2 * Math.exp(-s / 0.22) * Math.sin(TAU * 1.7 * s) + 0.05 * Math.sin(t * 40) * clamp(s / 0.1) * 0.3;
    return { key, x: line.fx, y: line.fy, anchor: 'fist', rot: swing };
  }
  return null;
}
/** TJ3's flight: a readable still through the hit-stop, then flung tumbling up and left out of the frame. */
function flingAt(t: number, start: [number, number]): { x: number; y: number; rot: number; k: number } {
  const s = t - TWANG;
  const tau = s < 0.08 ? s * 0.15 : 0.012 + (s - 0.08) * 1.55;
  return { x: start[0] - 620 * tau, y: start[1] - 860 * tau + 420 * tau * tau, rot: -0.35 - 14 * tau, k: tau };
}

let flingStart: [number, number] = [300, 300];
/** The fist on screen when the line snaps (the TWANG's shock, ring, focus lines and radial centre). */
let fistTw: [number, number] = [300, 140];

/** 0.98-1.34: the strum insert (No.10 far below, Pluck PL1 -> PL2 at x2). Screen space. */
function strumPanel(env: Env, t: number) {
  if (t < 0.98 || t >= 1.36) return;
  const ctx = env.ctx;
  const PX = 528, PY = 250;
  const slam = 1 - ease.outExpo(clamp((t - 0.98) / 0.08));
  const out = t > 1.29 ? ease.inQuad(clamp((t - 1.29) / 0.06)) : 0;
  const shake = Math.floor(t * 30) % 2;
  const dx = Math.round(260 * slam + 420 * out) + shake, dy = Math.round(160 * out);
  const key = seqAt(SEQ10[6]!, t);
  const cx = PX - 8, cy = PY + 18;
  const h1 = no10Point(env, 'PL1', 'hand', cx, cy, 2, { anchor: 'chest' });
  const h2 = no10Point(env, 'PL2', 'hand', cx, cy, 2, { anchor: 'chest' });
  mangaPanels(ctx, [{
    poly: panelPoly(PX, PY, 200, 210, 3),
    border: 4,
    gutter: 3,
    fill: '#06140f',
    dx,
    dy,
    draw: (c) => {
      c.save();
      c.globalCompositeOperation = 'lighter';
      drawGlow(c, glowOf(PAL.emerald), h1[0], h1[1], 150, 0.55);
      c.restore();
      focusLines(c, env.frng(71), h1[0], h1[1], 60, 240, 40, HEX.ink, 0.85, 4);
      tone(c, PX - 110, PY - 115, 220, 230, '#020806', 0.35);
      // The string he plays sings once it is struck: a jade line at chest height, ringing in 3 ghost positions.
      if (t >= STRUM) {
        const a = Math.exp(-(t - STRUM) / 0.12);
        c.save();
        c.globalCompositeOperation = 'lighter';
        for (let gst = 0; gst < 3; gst++) {
          const off = Math.cos((t - STRUM) * 60 + gst * 2.1) * 6 * a;
          c.strokeStyle = gst ? HEX.jade : HEX.mint;
          c.globalAlpha = (gst ? 0.35 : 0.8) * a;
          c.lineWidth = gst ? 1 : 2;
          c.beginPath();
          c.moveTo(PX - 110, h1[1] - 6);
          c.quadraticCurveTo(h1[0], h1[1] - 6 + off * 2, PX + 110, h1[1] - 8);
          c.stroke();
        }
        c.restore();
      }
      drawNo10(env, key, cx, cy, 2, { anchor: 'chest' });
      if (t >= STRUM) {
        // The strum's 1 px motion arc from the hook to the hip, and a pearl spark running along it.
        const mx = (h1[0] + h2[0]) / 2 + 26, my = (h1[1] + h2[1]) / 2 - 10;
        const fade = clamp(1 - (t - STRUM - 0.12) / 0.1);
        c.save();
        c.strokeStyle = HEX.pearl;
        c.lineWidth = 1;
        c.globalAlpha = 0.9 * fade;
        c.beginPath();
        c.moveTo(h1[0], h1[1]);
        c.quadraticCurveTo(mx, my, h2[0], h2[1]);
        c.stroke();
        c.strokeStyle = HEX.jade;
        c.globalAlpha = 0.45 * fade;
        c.lineWidth = 3;
        c.stroke();
        const k = ease.outCubic(clamp((t - STRUM) / 0.07));
        const sx = (1 - k) * (1 - k) * h1[0] + 2 * (1 - k) * k * mx + k * k * h2[0];
        const sy = (1 - k) * (1 - k) * h1[1] + 2 * (1 - k) * k * my + k * k * h2[1];
        c.globalCompositeOperation = 'lighter';
        drawGlow(c, glowOf(PAL.pearl), sx, sy, 10, 0.9 * fade);
        c.restore();
        sparkle(c, sx, sy, 9, fade, Math.PI / 4);
      }
    },
  }]);
}

function render6b(env: Env, t: number) {
  const { ctx, fx } = env;
  env.screen();
  const v = viewAt(env, t);
  const line = lineB(t, v);
  const drain = t < GRAB ? 0 : t < TWANG ? 0.6 * ease.outQuad(clamp((t - GRAB) / 0.3)) : 0;
  const boost = t >= TWANG ? Math.exp(-(t - TWANG) / 0.25) : 0;
  const light = (1 - drain) * (1 + 0.4 * boost);
  // ---------------------------------------------------------------- the world (inked)
  const b = backB(v, line.P, light);
  // The print frame (1.20-1.26) reads as figure on ground: the haze is held back so the night stays night.
  const printing = t >= TWANG && t < TWANG + 0.06;
  drawBackB(ctx, env.art.stadium, b);
  nightInk(ctx, printing ? 1 : 0.85);
  drawBackLightB(ctx, b, printing ? 0 : 1);
  {
    let best = b.lamps[0];
    for (const l of b.lamps) if (l.tint > best.tint) best = l;
    if (best.tint > 0.35 && best.y > -40) lensFlare(ctx, best.x, best.y, 110 * best.tint, 0.4 * best.tint, JADE_FLARE);
  }
  // ---------------------------------------------------------------- the Sky Eye behind the ball
  const zr = v.z / 1.7;
  const open = t < GRAB ? 0.7 : t < TWANG ? lerp(0.7, 0.45, ease.outQuad(clamp((t - GRAB) / 0.3))) : t < RELEASE ? 0.7 : lerp(0.7, 0.2, ease.inOutSine(clamp((t - RELEASE) / (DUR - RELEASE))));
  const [ax, ay] = proj(v, APEX_W[0], APEX_W[1]);
  const away = ease.inOutSine(clamp((t - RELEASE) / 0.3));
  const ex = lerp(v.bx - v.ex, ax, away), ey = lerp(v.by, ay, away);
  const ballR = 12 * 2.5 * zr;
  const eyeO = { t, light: (1 - 0.5 * drain) * (1 - away * 0.3), pupilR: lerp(ballR, ballR * 0.8, away), lash: 0.75 };
  skyEye6(ctx, ex, ey, 320 * zr, 120 * zr, open, eyeO);
  // His shadow flicks across the eye as he is flung (an ink silhouette swept over the iris, clipped to the almond,
  // under the line and the ball).
  if (t >= 1.27 && t < 1.39) {
    const f = tower('TJ3');
    if (f) {
      const k = (t - 1.27) / 0.12;
      const w = 320 * zr, h = 120 * zr;
      ctx.save();
      eyePath(ctx, ex, ey, w, h, open);
      ctx.clip();
      const sil = f.a.silhouette(f.i, { fill: [2, 8, 5], rim: [8, 40, 26], rim2: [4, 20, 13], lx: 0, ly: -1 }, -0.35 - 14 * k * 0.2);
      drawAnim(ctx, f.a, sil, f.i, Math.round(ex - w * 0.6 + w * 1.2 * ease.inOutSine(k)), Math.round(ey + h * 0.35 - h * 0.5 * k), T_SCALE * 1.6, { anchor: 'pelvis', rot: -0.35 - 14 * k * 0.2, alpha: 0.75 * Math.sin(Math.PI * k) });
      ctx.restore();
    }
  }
  // ---------------------------------------------------------------- the stroke (TWANG: it swings in the standing wave)
  let P = line.P;
  if (t >= TWANG) {
    const s = t - TWANG;
    P = wave(P, 14 * Math.sin(TAU * 9 * s) * Math.exp(-s / 0.6), 3);
  }
  const pulse = t >= 1.14 && t < TWANG ? { d: 0, a: 1 } : undefined;
  if (pulse && line.gi >= 0) {
    let sF = 0;
    for (let i = 1; i <= line.gi; i++) sF += Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y);
    pulse.d = sF * ease.inQuad(clamp((t - 1.14) / 0.06));
  }
  // The line snaps straight and tightens after the release (75 -> 44 px), then into the needle in the whip (-> 24).
  const W = t < RELEASE ? 75 * zr : t < WHIP ? lerp(75 * zr, 44, ease.outCubic((t - RELEASE) / (WHIP - RELEASE))) : lerp(44, 24, ease.inQuad(clamp((t - WHIP) / (DUR - WHIP))));
  brush(ctx, P, W, { t, tail: 10, drain, boost, starEvery: 4, pulse });
  // Once the ball has left it, the eye stays high in front of the line, the thread running through its empty pupil
  // (the eye of a needle: shot 7 squeezes it into the needle's eye).
  if (away > 0) {
    ctx.save();
    ctx.globalAlpha = away;
    skyEye6(ctx, ex, ey, 320 * zr, 120 * zr, open, { ...eyeO, alpha: away });
    ctx.restore();
    threadLine(ctx, P, 2, away, { under: true, halo: 1 });
  }
  // Under the line at the grab: fibres and the bite drawn after the Tower (see below).
  // ---------------------------------------------------------------- the Tower (leap, tug), under the ball
  const tp = towerPivot(t, line, v);
  if (t >= T_B && t < GRAB) {
    // Ink and mint speed lines streaming down behind him; the fist reaching for the thread.
    const fr = env.frng(81);
    const k = clamp((t - T_B) / (GRAB - T_B));
    const cx = tp ? tp.x + 10 : 300;
    ctx.save();
    for (let i = 0; i < 36; i++) {
      const x = cx - 150 + fr.next() * 300;
      const y0 = (tp ? tp.y : 200) + 20 + fr.next() * 320;
      const len = 80 + fr.next() * 180 * (1 - k * 0.6);
      const mint = fr.next() < 0.5;
      ctx.strokeStyle = mint ? HEX.mint : HEX.ink;
      ctx.globalAlpha = (mint ? 0.5 : 0.85) * (1 - k * 0.5);
      ctx.lineWidth = fr.next() < 0.3 ? 3 : 1;
      ctx.beginPath();
      ctx.moveTo(x, y0);
      ctx.lineTo(x, y0 + len);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (tp) {
    const f = tower(tp.key);
    if (f) {
      // A jade rim from the line and the eye above him: the lit silhouette under the frame, offset up a pixel.
      const rim = f.a.tinted(f.i, PAL.jade);
      drawAnim(ctx, f.a, rim, f.i, Math.round(tp.x), Math.round(tp.y) - 2, T_SCALE, { anchor: tp.anchor, rot: tp.rot, alpha: 0.85 });
      drawAnim(ctx, f.a, null, f.i, Math.round(tp.x), Math.round(tp.y), T_SCALE, { anchor: tp.anchor, rot: tp.rot });
    }
    if (t >= GRAB) {
      // The thread biting into his glove: the pearl core drawn across the fist, a jade glow round the grip.
      const n = line.P.length, gi = line.gi;
      if (gi > 0 && gi < n - 1) {
        const a = line.P[gi - 1], c = line.P[gi + 1];
        ctx.save();
        ctx.lineCap = 'round';
        ctx.strokeStyle = HEX.ink;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(lerp(line.fx, a.x, 0.6), lerp(line.fy, a.y, 0.6));
        ctx.lineTo(line.fx, line.fy);
        ctx.lineTo(lerp(line.fx, c.x, 0.6), lerp(line.fy, c.y, 0.6));
        ctx.stroke();
        ctx.strokeStyle = HEX.pearl;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, glowOf(PAL.jade), line.fx, line.fy, 26, 0.55 + 0.25 * Math.sin(t * 70));
        ctx.restore();
      }
    }
  }
  // ---------------------------------------------------------------- the ball (the pupil), its spin marks
  const heat = t >= TWANG ? 0.35 * boost : 0;
  drawBall(env, spin, Math.round(v.bx), Math.round(v.by), 12, 2.5 * zr, heat, 1.2 + 0.6 * boost, 'pearl', undefined, { seamGlow: 0.9 });
  spinMarks(ctx, v.bx, v.by, ballR + 2, -t * 14, { color: HEX.mint, ink: false, width: ballR * 0.22 + 2, len: 1.0, dir: -1, alpha: 0.9 });
  spinMarks(ctx, v.bx, v.by, ballR + 2, -t * 14, { color: HEX.ink, ink: false, width: ballR * 0.22, len: 0.95, dir: -1, alpha: 0.95 });
  if (t < RELEASE) pupilGlint(ctx, v.bx, v.by, ballR, 1, 0.8 * (1 - 0.5 * drain));
  // ---------------------------------------------------------------- particles, rings
  env.parts.draw(ctx, 0);
  env.parts.draw(ctx, 1);
  rings.draw(ctx, t);
  // ---------------------------------------------------------------- TWANG: the Tower torn off and flung
  if (t >= TWANG && t < 1.62) {
    const f = tower('TJ3');
    const fl = flingAt(t, flingStart);
    if (f && fl.y > -260 && fl.x > -260) {
      drawAnim(ctx, f.a, f.a.tinted(f.i, PAL.jade), f.i, Math.round(fl.x), Math.round(fl.y) - 2, T_SCALE, { anchor: 'pelvis', rot: fl.rot, alpha: 0.8 });
      drawAnim(ctx, f.a, null, f.i, Math.round(fl.x), Math.round(fl.y), T_SCALE, { anchor: 'pelvis', rot: fl.rot });
      // His shadow across the eye: backlit as he crosses its light.
      const near = clamp(1 - Math.hypot(fl.x - ex, fl.y - ey) / 220);
      if (near > 0) {
        const sil = f.a.silhouette(f.i, { fill: [3, 8, 6], rim: PAL.mint, rim2: PAL.jade, lx: (fl.x - ex) / 200, ly: (fl.y - ey) / 200 }, fl.rot);
        drawAnim(ctx, f.a, sil, f.i, Math.round(fl.x), Math.round(fl.y), T_SCALE, { anchor: 'pelvis', rot: fl.rot, alpha: near });
      }
    }
  }
  // The release: the line snaps straight like a slingshot, a pearl pulse whips from the eye down to the ball, and the
  // ball's fall streaks the air behind it.
  if (t >= RELEASE && t < WHIP + 0.05) {
    const k = clamp((t - RELEASE) / 0.1);
    if (k < 1) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const q = [lerp(ex, v.bx, ease.inQuad(k)), lerp(ey, v.by, ease.inQuad(k))];
      drawGlow(ctx, glowOf(PAL.pearl), q[0], q[1], 26, 0.9 * (1 - k * 0.5));
      drawGlow(ctx, glowOf(PAL.mint), q[0], q[1], 60, 0.5 * (1 - k * 0.5));
      ctx.restore();
    }
    const v2 = viewAt(null, Math.min(DUR, t + 1 / 60));
    const [b1x, b1y] = ballW(Math.min(DUR, t + 1 / 60));
    const [b0x, b0y] = ballW(t);
    const vx = (b1x - b0x) * v.z * 60 + (v2.wy - v.wy) * 0, vy = (b1y - b0y) * v.z * 60;
    const sp = Math.hypot(vx, vy);
    if (sp > 20) {
      const fr = env.frng(93);
      const dx = -vx / sp, dy = -vy / sp;
      ctx.save();
      for (let i = 0; i < 18; i++) {
        const a = fr.range(-1, 1), r = ballR * fr.range(1.1, 2.4);
        const x = v.bx - dy * a * r + dx * fr.range(10, 40), y = v.by + dx * a * r + dy * fr.range(10, 40);
        const l = fr.range(30, 80) * clamp(sp / 400);
        const mint = fr.next() < 0.5;
        ctx.strokeStyle = mint ? HEX.mint : HEX.ink;
        ctx.globalAlpha = mint ? 0.45 : 0.75;
        ctx.lineWidth = fr.next() < 0.3 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx * l, y + dy * l);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
  if (t >= TWANG && t < 1.34) {
    const k = (t - TWANG) / 0.14;
    const fr = env.frng(91);
    focusLines(ctx, fr, fistTw[0], fistTw[1], lerp(70, 120, k), 760, 80, HEX.ink, 0.85 * (1 - k * 0.6), 5);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    focusLines(ctx, fr, fistTw[0], fistTw[1], lerp(80, 140, k), 700, 30, HEX.jade, 0.45 * (1 - k * 0.6), 2);
    ctx.restore();
  }
  if (t >= TWANG && t < 1.6) {
    const s = t - TWANG;
    const a = s < 0.32 ? 1 : 1 - (s - 0.32) / 0.08;
    inkSfx(ctx, 'TWANG!', 178, 62, 48, -0.12, { fill: HEX.jade, outer: HEX.ink, pop: clamp(0.45 + s / 0.07), alpha: a });
  }
  // ---------------------------------------------------------------- the strum insert
  strumPanel(env, t);
  // ---------------------------------------------------------------- post
  nightGrade(fx, { bloom: printing ? 1.15 : 1.15 + 0.15 * boost, thresh: 0.62, ca: 0.004 });
  if (printing) halftoneImpact(fx, 'A');
  if (t >= TWANG && line.P.length > 2) {
    const s = t - TWANG;
    const p0: [number, number] = [line.P[0].x, line.P[0].y], p2: [number, number] = [v.bx, v.by];
    const mid = line.P[Math.floor(line.P.length / 2)];
    // The standing wave starts from the taut line (sine phase: zero displacement on the print, peak 1/36 s later).
    setPluck(fx, null, [p0, ctrlThrough(p0, [mid.x, mid.y], p2), p2], { amp: 0.05, n: 3, hz: 9, decay: 0.6, w: 0.8, tSince: s + 1 / 12 });
    fx.ca = lerp(0.004, 0.01, clamp(1 - s / 0.4));
    fx.radial = s < 0.06 ? 0.03 : 0.08 * clamp(1 - (s - 0.06) / 0.1);
    fx.radialX = fistTw[0] / VW;
    fx.radialY = fistTw[1] / VH;
    pushShock(fx, { x: fistTw[0] / VW, y: fistTw[1] / VH, r: s * 1.5, s: 0.06 * clamp(1 - s / 0.5) });
  }
  if (t >= WHIP) whip(fx, 0.1 * ease.inCubic(clamp((t - WHIP) / (DUR - WHIP))), 0, 1, { x: v.bx, y: v.by, r: 0.08 });
}

// ================================================================ state

const spin = new BallSpin();
const rings = new StitchRings();
let cleared = false;

/** The fist on screen at t (no shake), for the cues' bursts. */
function fistAt(t: number): [number, number] {
  const v = viewAt(null, t);
  const l = lineB(t, v);
  return [l.fx, l.fy];
}

export const shotTwang: Shot = {
  name: 'Sky Eye',
  dur: DUR,
  seed: 416,
  rate: RATE[6],
  cues: [
    { at: 0, fn: (e) => { e.sfx.bow(1174.66, 1.2, 0.14, undefined, 6); e.cam.shakeAmp = 6; } },
    { at: 0.05, fn: (e) => { e.sfx.eyeOpen(); e.sfx.ooh(0.5); } },
    { at: 0.42, fn: (e) => { e.sfx.boom(0.3); e.sfx.strain(0.25, 0.3); e.cam.hit(0.2); } },
    { at: 0.7, fn: (e) => { e.sfx.whoosh(0.3, 300, 2400, 0.5); e.sfx.boom(0.45); e.sfx.strain(0.2, 0.3); e.cam.shakeAmp = 10; e.cam.hit(0.4); } },
    {
      at: GRAB,
      fn: (e) => {
        e.sfx.zip(0.1, 2000, 600);
        e.sfx.fray(0.3);
        e.sfx.strain(0.35, 0.35);
        e.cam.hit(0.25);
        const [x, y] = fistAt(GRAB);
        jadeSparks(e, x, y, 20, 420);
      },
    },
    { at: 0.9, fn: (e) => e.sfx.ooh(0.6) },
    { at: STRUM, fn: (e) => e.sfx.zip(0.08, 1200, 400, 0.3) },
    { at: 1.14, fn: (e) => e.sfx.strum([587.33, 659.26, 739.99, 880, 987.77], 0.012, 0.6, 0.25) },
    {
      at: TWANG,
      fn: (e) => {
        e.sfx.twang(1.3);
        e.sfx.boom(1.3);
        e.sfx.crack(0.8);
        e.sfx.choke('bow');
        e.cam.shakeAmp = 18;
        e.cam.hit(0.9);
        const [x, y] = fistAt(TWANG - 1 / 60);
        fistTw = [x, y];
        rings.add({ x, y, t0: TWANG, r0: 10, r1: 240, dur: 0.4, width: 3 });
        jadeSparks(e, x, y, 60, 900);
        stitchBurst(e, x, y, 30, 640);
        for (let i = 0; i < 20; i++) {
          const a = e.rng.range(0, TAU), s = e.rng.range(60, 260);
          e.parts.spawn({ kind: PK.Streak, x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 2, max: e.rng.range(0.4, 0.8), s0: 1.5, s1: 0.5, ramp: 'jade', r0: 0.2, r1: 1, k: 0.6, add: true });
        }
      },
    },
    { at: 1.3, fn: (e) => e.sfx.roar(1.2, 0.8) },
    { at: RELEASE, fn: (e) => e.sfx.zip(0.16, 500, 2600, 0.2) },
    { at: WHIP, fn: (e) => e.sfx.whoosh(0.3, 2400, 400, 0.45) },
  ],
  prepare(env) {
    warmMeridian(env);
    tf3Cv = buildTF3();
    // Warm the silhouettes and puppet crops this shot draws.
    for (const k of ['TC1', 'TC1b'] as const) {
      const f = tower(k);
      if (f) {
        f.a.silhouette(f.i, { fill: [2, 6, 5], rim: [30, 96, 68], rim2: [12, 44, 32], lx: 0.15, ly: -1 });
        f.a.silhouette(f.i, { fill: [2, 6, 5], rim: PAL.mint, rim2: PAL.jade, lx: 0.15, ly: -1 });
      }
    }
    for (const k of ['TJ1', 'TJ2', 'TJ2b', 'TJ3'] as const) {
      const f = tower(k);
      if (f) f.a.tinted(f.i, PAL.jade);
    }
    PUPPETS.get('s6-d3-up', RIVAL_KIT_C, POSE_UP, 1, -1, SIL_UP);
    PUPPETS.get('s6-d4-up', RIVAL_KIT_D, POSE_UP, 1, -1, SIL_UP);
  },
  init(env) {
    env.sfx.clearBus();
    env.cam.set(VW / 2, VH / 2, 1, 0);
    env.cam.shakeRoll = 0.015;
    PUPPETS.frame();
    resetSpin(spin);
    rings.clear();
    cleared = false;
    flingStart = [300, 300];
    fistTw = [300, 140];
  },
  update(env, t, dt) {
    spin.rotate(0.2, 0, 1, -dt * 4 * TAU);
    holdTrauma(env.cam, t < T_B ? 0.15 : t >= GRAB && t < 1.16 ? 0.3 : 0);
    const rng = env.rng;
    if (t < T_B) {
      // Jade motes sifting down out of the eye's light (world space of 6a).
      const L = lightA(t);
      if (L > 0.2 && rng.next() < 0.6 * L) {
        const b = ballA(t);
        env.parts.spawn({ kind: PK.Glow, x: b[0] + rng.range(-150, 150), y: b[1] + rng.range(-10, 40), vx: rng.range(-6, 6), vy: rng.range(20, 60), max: rng.range(0.8, 1.4), s0: rng.range(1.5, 3), s1: 0.5, ramp: 'jade', r0: 0.1, r1: 0.9, a0: 0.8, a1: 0 });
      }
      return;
    }
    if (!cleared) {
      // 6b draws in screen space: the 6a motes do not carry across the cut.
      env.parts.clear();
      cleared = true;
      for (let i = 0; i < 10; i++) {
        env.parts.spawn({ kind: PK.Smoke, x: 300 + rng.range(-40, 40), y: VH + 6, vx: rng.range(-30, 30), vy: rng.range(-70, -30), drag: 1.5, max: rng.range(0.5, 0.9), s0: rng.range(5, 9), s1: rng.range(14, 22), ramp: 'ink', r0: 0.62, r1: 0.95, a0: 0.55, a1: 0, add: false });
      }
    }
    // Pearl motes shed by the ball (40/s), drifting back along the line.
    const v = viewAt(null, t);
    if (rng.next() < 0.66) {
      env.parts.spawn({ kind: PK.Glow, x: v.bx + rng.range(-18, 18), y: v.by + rng.range(-18, 18), vx: rng.range(-90, -30), vy: rng.range(-10, 40), drag: 1, max: rng.range(0.4, 0.8), s0: rng.range(1.5, 3), s1: 0.5, ramp: 'jade', r0: 0, r1: 0.8, a0: 0.9, a1: 0 });
    }
    // The tug-of-war: fibres fraying at the fist (6 per frame).
    if (t >= GRAB && t < TWANG) {
      const [x, y] = fistAt(t);
      for (let i = 0; i < 6; i++) {
        const a = rng.range(-Math.PI, 0) + (rng.next() < 0.5 ? 0 : Math.PI * 0.3);
        const s = rng.range(30, 140);
        env.parts.spawn({ kind: PK.Streak, x: x + rng.range(-8, 8), y: y + rng.range(-6, 6), vx: Math.cos(a) * s, vy: Math.sin(a) * s + 40, drag: 2.5, max: rng.range(0.2, 0.45), s0: 1, s1: 0.4, ramp: 'jade', r0: 0.15, r1: 1, k: 0.7, add: true });
      }
    }
    if (t < TWANG) {
      // Where TJ3 starts: TJ2's pelvis when he is torn off the line.
      const f2 = tower('TJ2');
      const l = lineB(t, v);
      if (f2) {
        const fa = f2.a.anchorOf(f2.i, 'fist'), pa = f2.a.anchorOf(f2.i, 'pelvis');
        flingStart = [l.fx + (pa[0] - fa[0]) * T_SCALE, l.fy + (pa[1] - fa[1]) * T_SCALE];
      } else flingStart = [l.fx, l.fy + 180];
    }
  },
  render(env, t) {
    const ctx = env.ctx;
    env.screen();
    ctx.fillStyle = HEX.night;
    ctx.fillRect(0, 0, VW, VH);
    PUPPETS.frame();
    if (t < T_B) render6a(env, t);
    else render6b(env, t);
    env.screen();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    assertMeridianFx(env.fx);
  },
};
