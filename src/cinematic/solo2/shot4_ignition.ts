// SPOTLIGHT SOLO v2 · shot 4 · "Ignition" (0.8 s, g 5.6-6.4, seed 514): explosive acceleration. SPEC.md §6 shot 4.
//
// GO. A macro at turf level (eye 0.1 m, camera south looking north, he runs screen-right): the far stands a band of
// phone-light bokeh, the turf a black plane, and in it the only light is the blacklight ball (92 px, blazing, its own
// lilac pool on the turf) and his fluorescent boots. He plants, the right toe punches through the ball, and the roof
// follow-spot finds him for the first time: the drop beam slams down onto the contact, the impact prints the frame
// violet and white inside its cone, the turf tears open ahead of the ball and ultraviolet light erupts out of the wound.
// Then the ball and his boots blast out of a frame that holds still: one frame later we look at an empty spotlight on
// smoking, glowing torn turf, sods hanging in the air, neon prints of both boots where he stood and a chain of ball
// exposures streaking off the right edge. The camera whips 900 px after them; the ball flies alone through the smeared
// world (sharp in the streak's hole, a shrinking strobe chain behind it) and is caught; the beam sweeps in from the
// left and slams back on as his boot arrives. Then the step-print: four touches on 16ths (a falling tom fill), every
// image held three frames with its own jolt, every print leaving a neon copy of the boot and a ball exposure behind in
// the dark, the frame pushing in on the ball. Hard cut on the ONE of bar 4 (g 6.4) to his front (shot 5).
//
// Scale: MacroBoots at x2 nearest (the strip's canvas scale; boots and shins ~260 px tall, thighs extruded past the
// canvas top and sinking into his own shadow); the ball is the strip's canonical macro ball at x2 (r 46, 92 px; the
// brief's 70 px), so every MacroBoots ball contact lands exactly.
//
// Beats (shot-local; the ball, the boots, the beam and the camera are pure functions of t, so a seek is exact):
//   0.00 (g 5.6, beat 3) MB1, the plant: the left boot digs in, 12 soil crumbs and 3 crumb-sods spit back; the whip
//        from shot 3 lands (the world slides 84 px left to rest, streak 0.05 -> 0 over 3 frames); the stage is black:
//        only the blazing ball (halo 300 px) under-lighting the boots, their UV whites, a thin footlight rim from the
//        left. kickDrum 0.9 + scuff; punch +0.03, cam.hit(0.25).
//   0.05 the right boot (MB2) swings in from the left edge (3 frames, neon smear copies); whoosh.
//   0.10 (g 5.7) CONTACT, MB2, the toe-poke burst, the ignition stack:
//        1 beam impact A (0.100-0.133, E4): the roof spot's cone, apex over the ball, axis down, half 0.34;
//        2 the drop beam slams from the top of frame (40 -> 260 px, 2-frame drop), its pool, a light splash 30 -> 190;
//        3 turfRip 1.2 with a divot at the lens (pre-flown 0.045 s so the sods hang spread through the hit-stop);
//        4 the light gash (3 claws, 160 px ahead of the ball) tears open over 3 frames, five tapered UV shafts erupting
//          1.9x tall and settling to 70-140 px over 0.45 s, the wound's glow on the turf, smoke and UV haze rising;
//        5 two flat refraction shocks (s 0.05 / 0.03, sy 0.3) at the contact;
//        6 light rain, 60 lines for 0.15 s;
//        7 CA 0.012 -> 0.002, radial 0.035 on the ball for 3 frames;
//        8 punch +0.12, cam.hit(0.8), shakeAmp 16, a shove;
//        + the ball squashed round the toe (dent) for the whole hit-stop, the toe sunk 8 px into it, bloom +0.2.
//        kickDrum 1.2 + kick 1.0 + rip 1.2 + boom 1.0 + crack 0.6 + spotOn 0.8; gasp at 0.12.
//   0.10-0.18 the hit-stop (rate 0.05).
//   0.183 the release: the stretched ball and both boots blast right at 24000 px/s (neon smears), the camera holds.
//   0.200 LEFT BEHIND: the frame holds on the empty spot: the beam still on it (the operator has not reacted), the
//        erupting gash, the hanging sods, neon prints of both boots at the contact and five ball exposures streaking
//        off the right edge. whoosh at 0.18.
//   0.21-0.43 the whip-chase: cam +900 px (outExpo) + 1500 px/s, streak 0.09 -> 0 with a sharp hole on the ball; the
//        ball is back in frame two frames into the whip and caught at x 250 by 0.33, a shrinking strobe chain behind it;
//        the beam sweeps in from the left (0.30-0.40) and lands on him with a splash (spotOn 0.45 at 0.40).
//   0.367 the near boot (MB3) enters from the left edge.
//   0.40-0.80 the step-print (20 prints/s: every image held 3 frames, the shake held with it, plus a per-print jolt):
//        touches at 0.40 / 0.50 / 0.60 / 0.70 (MB3 = the near right boot; MB3 mirrored = the far left boot at 70 %),
//        each a tom (D3 C3 A2 F2), a boot tok, rip 0.35, a 6-sod spray, a light splash, 18 lines of light rain,
//        cam.hit(0.15), punch +0.02, the beam pumping +15 %, the ball blazing up; on every print a neon copy of the boot
//        and a ball exposure stay behind in the dark (75 px apart); the turf streaks past, the foreground blades streak
//        at 2.6x, the stands crawl at 0.2x; the frame pushes in 1.0 -> 1.1.
//   0.80 hard cut on the ONE of bar 4.
//
// Photosensitivity (§4.4): E4 (beam impact A, 2 frames from g 5.70) is the only full-frame event. The splashes, the
// pool, the beam's slam and its pumps, the touches' light rain are local.

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { clamp, ease, lerp, type RGB } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import type { BallSquash } from '../../engine/pixel';
import {
  DIM_V2, HEX, HUM, PAL, RATE, SHOTS, TOMS, drawBall, drawFluoro, flatShockAt, fourCount, lightRain, onFrames, padsFor, punch,
  rimLight, shadeSprite, soloImpact2, soloPic, soloStage, spinAt, stage, underLight, warmBalls, warmSolo2, type LitPic, type SoloKey,
} from './common';
import { stepFade } from './chorus';
import { lightGash, turfRip } from './turf';
import { GASHES } from './world';

const META = SHOTS[3];
const FR = 1 / 60;
/** The shot's global start (g 5.6). */
const G0 = 5.6;

// ---------------------------------------------------------------- the macro set (screen px at zoom 1; world x = screen x + camX)

/** MacroBoots draw scale: x2 nearest (crisp), the boot ~140 px long, boot and shin ~260 px tall. */
const SC = 2;
/** The ball's radius: the strip's canonical macro ball (r 23) at x2, so every MacroBoots contact lands on it (92 px). */
const R = 46;
const TURF = 300;
const HORIZON = 262;
/** The ball's screen x at the plant and at the lock, and the zoom pivot. */
const PX = 250;
const BY = TURF - R;
/** Rows of thigh extruded above each MacroBoots canvas (the canvas top would otherwise show at y 82). */
const EXT = 64;

// ---------------------------------------------------------------- beats

const T_SWING = 0.05, T_HIT = 0.1, T_REL = 0.175, T_WHIP = 0.21, WHIP_LEN = 0.22, T_IN = 0.3667, T_SP0 = 0.4, T_SP1 = 0.8;
const TOUCH = [0.4, 0.5, 0.6, 0.7] as const;
const TOM_F = [TOMS.D3, TOMS.C3, TOMS.A2, TOMS.F2] as const;
/** The camera's tracking speed after the whip (px/s) and the ball's blast speed out of the frame. */
const V_RUN = 1500, BLAST = 24000;
/** The left-behind frame: from here the ball and both boots are out of frame and only the light remains. */
const T_EMPTY = 0.19;
/** The toe's push during the hit-stop (px) and the ball's offset when it crosses the right edge (T_WHIP). */
const PUSH = 2, EXIT = PUSH + BLAST * (T_WHIP - T_REL);
/** Print length of the step-print (3 frames). */
const PRINT = 0.05;
/** How far the toe sinks into the ball through the hit-stop (px). */
const TOE_IN = 8;
/** The ball exposures' radius (a crisp volt disc, smaller than the ball so a chain reads as a chain). */
const EXP_R = 30;
/** The step-print's held shake (sampled in update on each print's first step; reset in init). */
let held: { tr: number; off: [number, number] } | null = null;

const h01 = (i: number, s: number) => {
  const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
const decay = (t: number, at: number, len: number) => (t < at ? 0 : 1 - ease.outQuad(clamp((t - at) / len)));

/** The step-print's held time: from 0.40 every image is the one of the last print (3 frames). */
const printT = (t: number) => (t >= T_SP0 - 1e-6 && t < T_SP1 ? T_SP0 + PRINT * Math.floor((t - T_SP0) / PRINT + 1e-6) : t);

/** The camera's world offset: the whip from shot 3 landing (84 px), held, then the whip-chase + tracking. */
function camX(t: number) {
  if (t < 0.05) return -84 * (1 - ease.outCubic(t / 0.05));
  if (t < T_WHIP) return 0;
  return 900 * ease.outExpo(clamp((t - T_WHIP) / WHIP_LEN)) + V_RUN * (t - T_WHIP);
}
/** The ball's screen x at zoom 1. */
function ballSX(t: number): number {
  if (t < T_WHIP) return ballW(t) - camX(t);
  // The whip-chase catches it: back in frame two frames into the whip, locked by 0.33.
  if (t < T_SP0) return PX + EXIT * Math.pow(1 - clamp((t - T_WHIP) / WHIP_LEN), 7);
  // The step-print: each touch puts it 4 px back on the boot, the roll takes it 8 px ahead.
  return PX + ((t - T_SP0) % 0.1 < PRINT - 1e-6 ? -4 : 8);
}
/** The ball's world x. */
function ballW(t: number): number {
  if (t < T_HIT) return PX;
  if (t < T_REL) return PX + PUSH * ease.outQuad(clamp((t - T_HIT) / 0.05));
  if (t < T_WHIP) return PX + PUSH + BLAST * (t - T_REL);
  return ballSX(t) + camX(t);
}
/** Spin angle (rad): alive at rest (1.2 rad/s), rolling with its world travel once it goes. */
const spinAngle = (t: number) => (t < T_REL ? 1.2 * t : 1.2 * T_REL + (ballW(t) - PX) / R);
function ballSquash(t: number): BallSquash | undefined {
  if (t >= T_HIT && t < T_REL) return { sx: 0.9, sy: 1.06, dent: 0.16 };
  if (t >= T_REL && t < T_WHIP) return { sx: 1.42, sy: 0.8 };
  if (t >= T_WHIP && t < 0.3) {
    const u = (t - T_WHIP) / 0.09;
    return { sx: lerp(1.2, 1, u), sy: lerp(0.9, 1, u) };
  }
  if (t >= T_SP0 && (t - T_SP0) % 0.1 < PRINT - 1e-6) return { sx: 0.9, sy: 1.06, dent: 0.14 };
  return undefined;
}

/**
 * The roof follow-spot's world x (the operator's lag, a pure function): on the ball from the slam, it stays on the
 * empty spot through the left-behind frames, sweeps in from the left edge 0.30-0.40 and lands on him for the first touch.
 */
function beamW(t: number) {
  if (t < T_REL) return PX + PUSH;
  if (t < 0.3) return PX + PUSH + 260 * ease.inQuad(clamp((t - T_REL) / 0.1));
  if (t < T_SP0) {
    const u = ease.inOutCubic((t - 0.3) / (T_SP0 - 0.3));
    return lerp(-220, ballSX(T_SP0) - 6, u) + camX(t);
  }
  return ballW(t) - 6;
}
const beamOn = (t: number) => t >= T_HIT;

// ---------------------------------------------------------------- the view (camera + held shake)

interface View {
  cx: number;
  z: number;
  ox: number;
  oy: number;
}
/** Zoom kicks: the plant, the contact, the touches (pivot = the ball's lock point). */
const zoomAt = (t: number) =>
  1 + punch(t, 0, 0.03, 0.02, 0.15) + punch(t, T_HIT, 0.12, 0.03, 0.4) + TOUCH.reduce((a, k) => a + punch(t, k, 0.02, 0.02, 0.08), 0) +
  // The step-print pushes in on the ball (1.0 -> 1.1) into the hard cut.
  0.1 * ease.inQuad(clamp((t - T_SP0) / (T_SP1 - T_SP0)));
const toScreen = (v: View, wx: number, wy: number): [number, number] => [(wx - v.cx - PX) * v.z + PX + v.ox, (wy - BY) * v.z + BY + v.oy];
function applyView(env: Env, v: View) {
  env.screen();
  const ctx = env.ctx;
  ctx.translate(PX + v.ox, BY + v.oy);
  ctx.scale(v.z, v.z);
  ctx.translate(-(v.cx + PX), -BY);
}
/** The live shake offset (screen px) of env.cam (trauma shake + shove), sampled with the view's zoom. */
function shakeOf(env: Env, z: number): [number, number] {
  const cam = env.cam;
  cam.zoom = z;
  cam.rot = 0;
  const [u, w] = cam.toUV(cam.x, cam.y);
  return [u * VW - VW / 2, w * VH - VH / 2];
}

// ---------------------------------------------------------------- MacroBoots, extended upward and lit

interface Ext extends LitPic {
  /** The 'ball' anchor in this canvas (mirrored copies keep the body on the same side of the ball). */
  ax: number;
  ay: number;
  copy: HTMLCanvasElement;
  halo: HTMLCanvasElement;
}
const extCache = new Map<string, Ext>();
const PLUM: RGB = [22, 10, 38];

/**
 * A MacroBoots frame with its thigh extruded EXT rows above the canvas top (the top row repeated along the leg's lean,
 * sinking into his own shadow: top light, his body shades his thighs), optionally mirrored (the left boot). The
 * mirrored copy is placed by its body, not its mirrored ball anchor, so its inside face still meets the ball's left.
 * Also builds its Chorus-look copy (volt body, ivory rim on the beam side, uv glow, speed-line cuts, fading upward).
 */
function extPic(env: Env, key: SoloKey, flip: boolean): Ext {
  const p = soloPic(env, key);
  const id = `ign:${p.id}:${flip ? 'w' : 'e'}`;
  const hit = extCache.get(id);
  if (hit) return hit;
  const W = p.w, H = p.h + EXT;
  const src = p.px;
  const at = (x: number, y: number) => {
    const sx = flip ? W - 1 - x : x;
    return (y * W + sx) * 4;
  };
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const g = cv.getContext('2d')!;
  const img = g.createImageData(W, H);
  const d = img.data;
  const put = (x: number, y: number, i: number, f: number) => {
    const o = (y * W + x) * 4;
    for (let c = 0; c < 3; c++) d[o + c] = Math.round(src[i + c] * f + PLUM[c] * (1 - f) * 0.7);
    d[o + 3] = 255;
  };
  for (let y = 0; y < p.h; y++)
    for (let x = 0; x < W; x++) {
      const i = at(x, y);
      if (src[i + 3] < 40) continue;
      put(x, y + EXT, i, y < 24 ? lerp(0.74, 1, y / 24) : 1);
    }
  // The leg's lean at the top edge: centre of the opaque run on rows 0 and 10.
  const centre = (y: number) => {
    let s = 0, n = 0;
    for (let x = 0; x < W; x++) if (src[at(x, y) + 3] >= 40) (s += x), n++;
    return n ? s / n : NaN;
  };
  const c0 = centre(0), c10 = centre(10);
  const slope = Number.isFinite(c0) && Number.isFinite(c10) ? clamp((c0 - c10) / 10, -1.5, 1.5) : 0;
  for (let r = 1; r <= EXT; r++) {
    const sh = Math.round(slope * r), f = lerp(0.74, 0.16, r / EXT);
    for (let x = 0; x < W; x++) {
      const i = at(x, 0);
      if (src[i + 3] < 40) continue;
      const nx = x + sh;
      if (nx >= 0 && nx < W) put(nx, EXT - r, i, f);
    }
  }
  g.putImageData(img, 0, 0);
  // Placement: the ball anchor, in the extended canvas (mirrored: the body keeps its side of the ball).
  const [bax, bay] = p.anchor('ball');
  let ax = bax;
  if (flip) {
    let s = 0, n = 0;
    for (let y = p.h - 40; y < p.h; y++) for (let x = 0; x < W; x++) if (src[(y * W + x) * 4 + 3] >= 40) (s += x + 0.5), n++;
    const cb = n ? s / n : W / 2;
    ax = W - cb + (bax - cb);
  }
  // The copy, a crisp neon print of the boot: an ivory 1 px edge all round, a volt band inside it, a faint volt body,
  // a 1 px uv glow outside, three speed-line cuts; it fades out up the shin. Its halo: uvDeep, 2 px round the mask.
  const mask = new Uint8Array(W * H);
  for (let k = 0; k < W * H; k++) mask[k] = d[k * 4 + 3] > 0 ? 1 : 0;
  const m = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && mask[y * W + x] === 1;
  const edge = (x: number, y: number) => !m(x - 1, y) || !m(x + 1, y) || !m(x, y - 1) || !m(x, y + 1);
  const cuts = [Math.round(H * 0.42), Math.round(H * 0.61), Math.round(H * 0.77)];
  const copy = document.createElement('canvas'), halo = document.createElement('canvas');
  copy.width = halo.width = W;
  copy.height = halo.height = H;
  const cg = copy.getContext('2d')!, hg = halo.getContext('2d')!;
  const ci = cg.createImageData(W, H), hi = hg.createImageData(W, H);
  const px4 = (dd: Uint8ClampedArray, o: number, c: readonly number[], a: number) => {
    dd[o] = c[0];
    dd[o + 1] = c[1];
    dd[o + 2] = c[2];
    dd[o + 3] = Math.round(a);
  };
  for (let y = 0; y < H; y++) {
    const fade = clamp((y - 84) / 64);
    if (fade <= 0) continue;
    for (let x = 0; x < W; x++) {
      const o = (y * W + x) * 4;
      let near = false;
      for (let dy = -2; dy <= 2 && !near; dy++) for (let dx = -2; dx <= 2 && !near; dx++) if (m(x + dx, y + dy)) near = true;
      if (!near) continue;
      px4(hi.data, o, PAL.uvDeep, 150 * fade);
      if (m(x, y)) {
        if (cuts.includes(y)) continue;
        if (edge(x, y)) px4(ci.data, o, PAL.ivory, 255 * fade);
        else if (edge(x - 1, y) || edge(x + 1, y) || edge(x, y - 1) || edge(x, y + 1)) px4(ci.data, o, PAL.volt, 235 * fade);
        else px4(ci.data, o, PAL.volt, 80 * fade);
      } else if (m(x - 1, y) || m(x + 1, y) || m(x, y - 1) || m(x, y + 1)) px4(ci.data, o, PAL.uv, 130 * fade);
    }
  }
  cg.putImageData(ci, 0, 0);
  hg.putImageData(hi, 0, 0);
  const e: Ext = { id, w: W, h: H, px: d, img: cv, ax, ay: bay + EXT, copy, halo };
  extCache.set(id, e);
  return e;
}

/** A boot to draw: its frame, mirrored or not, the world point its ball anchor lands on, far side (70 %), alpha. */
interface Boot {
  key: SoloKey;
  flip: boolean;
  x: number;
  y: number;
  far: boolean;
  a: number;
  /** Motion this frame (screen px, + = right): volt smear copies trail behind it. */
  smear: number;
}

/** No.10's boots at (render) time t: the plant, the swing, the poke, the push-off; the catch; the step-print touches. */
function bootsAt(t: number): Boot[] {
  const out: Boot[] = [];
  if (t < T_WHIP) {
    // MB1: the plant, the left boot (far side once the right boot is in front of it); it pushes off on the release.
    let mx = 0, my = 0, ms = 0;
    if (t >= T_REL) {
      // The push-off: the heel rips up and the boot is gone a frame after the ball.
      const u = (t - T_REL) / (T_WHIP - T_REL);
      mx = 900 * Math.pow(u, 1.5);
      my = -30 * u;
      ms = 160;
    }
    out.push({ key: 'MB1', flip: false, x: PX + mx, y: BY + my, far: t >= T_SWING, a: 1, smear: ms });
    if (t >= T_SWING) {
      let dx: number, sm = 0;
      if (t < T_HIT) {
        const u = (t - T_SWING) / (T_HIT - T_SWING);
        dx = -250 * (1 - u) * (1 - u);
        sm = 120;
      } else if (t < T_REL) dx = TOE_IN;
      else {
        // The follow-through: the boot goes with the ball.
        dx = TOE_IN + 1.15 * (ballW(t) - PX - PUSH);
        sm = 220;
      }
      out.push({ key: 'MB2', flip: false, x: PX + dx, y: BY, far: false, a: 1, smear: sm });
    }
  } else if (t >= T_IN && t < T_SP0) {
    const u = (t - T_IN) / (T_SP0 - T_IN);
    out.push({ key: 'MB3', flip: false, x: ballW(t) - 240 * (1 - u) * (1 - u), y: BY, far: false, a: 1, smear: 160 });
  } else if (t >= T_SP0) {
    const k = Math.min(3, Math.floor((t - T_SP0) / 0.1 + 1e-6));
    const touching = t - (T_SP0 + 0.1 * k) < PRINT - 1e-6;
    // The touching boot (even = the near right boot, odd = the far left boot, mirrored), or the next one swinging in.
    const j = touching ? k : k + 1;
    const far = j % 2 === 1;
    out.push({ key: 'MB3', flip: far, x: ballW(t) - (touching ? 0 : 118), y: BY - (far ? 6 : 0), far, a: 1, smear: touching ? 0 : 140 });
  }
  return out;
}

/** Draw a boot lit by the stage: base, darkness (multiply), the ball's under-light, the beam's top rim, the UV whites. */
function drawBoot(env: Env, b: Boot, t: number, lit: number) {
  const ctx = env.ctx;
  const e = extPic(env, b.key, b.flip);
  const x = Math.round(b.x - e.ax * SC), y = Math.round(b.y - e.ay * SC);
  const W = e.w * SC, H = e.h * SC;
  // Volt smear copies trailing the motion.
  if (b.smear > 0) {
    for (let i = 1; i <= 2; i++) {
      const dx = -Math.sign(b.smear) * Math.abs(b.smear) * 0.32 * i;
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = 0.5 / i;
      ctx.drawImage(e.halo, x + dx, y, W, H);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.42 / i;
      ctx.drawImage(e.copy, x + dx, y, W, H);
      ctx.restore();
    }
  }
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = b.a;
  ctx.drawImage(e.img, x, y, W, H);
  ctx.restore();
  // In the dark the boots are violet shadow; inside the roof spot they take its cool white light (never a flat white).
  const L = clamp(lit);
  const k = lerp(0.42, 0.8, L) * (b.far ? 0.66 : 1);
  const tint: RGB = [lerp(150, 236, L), lerp(124, 230, L), lerp(255, 255, L)];
  shadeSprite(ctx, e.img, x, y, SC, k, tint);
  const [bx, by] = [ballW(t), BY];
  underLight(ctx, e.img, x, y, SC, bx, by, 190, PAL.lilac, (b.far ? 0.4 : 0.75) * lerp(1, 0.35, L));
  if (L > 0) rimLight(ctx, e.img, x, y, SC, [0.15, -1], 2, PAL.spot, 0.7 * L * (b.far ? 0.6 : 1));
  drawFluoro(ctx, e, x, y, SC, (b.far ? 0.3 : 0.55) * lerp(1, 0.15, L));
  // The footlight lamp low behind him (screen-left, shot 3's halo): a thin ivory rim on the back edges, strongest in the dark.
  rimLight(ctx, e.img, x, y, SC, [-1, -0.25], 2, PAL.ivory, lerp(0.55, 0.2, L) * (b.far ? 0.5 : 1));
  legFalloff(ctx, e.img, x, y);
}

let fallCv: HTMLCanvasElement | null = null;
/**
 * The light falls off up the leg: the roof spot is focused on the turf, so his shins and thighs sink into the dark above
 * world y 170 (multiplied toward plum, 12 % at y 20). Applied to the boot's own pixels.
 */
function legFalloff(ctx: CanvasRenderingContext2D, img: HTMLCanvasElement, x: number, y: number) {
  const W = img.width * SC, H = img.height * SC;
  if (!fallCv) fallCv = document.createElement('canvas');
  if (fallCv.width < W || fallCv.height < H) {
    fallCv.width = Math.max(fallCv.width, W);
    fallCv.height = Math.max(fallCv.height, H);
  }
  const g = fallCv.getContext('2d')!;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-over';
  g.clearRect(0, 0, fallCv.width, fallCv.height);
  g.imageSmoothingEnabled = false;
  g.drawImage(img, 0, 0, W, H);
  g.globalCompositeOperation = 'source-in';
  const gr = g.createLinearGradient(0, 170 - y, 0, 20 - y);
  gr.addColorStop(0, 'rgb(255,255,255)');
  gr.addColorStop(0.55, 'rgb(150,128,190)');
  gr.addColorStop(1, 'rgb(30,20,52)');
  g.fillStyle = gr;
  g.fillRect(0, 0, W, H);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalCompositeOperation = 'multiply';
  ctx.drawImage(fallCv, 0, 0, W, H, x, y, W, H);
  ctx.restore();
}

/** The boot's volt copy (a Chorus copy of the boots, born t0, stepped fade on the 16ths). */
function drawBootCopy(env: Env, b: Boot, a: number) {
  if (a <= 0) return;
  const ctx = env.ctx;
  const e = extPic(env, b.key, b.flip);
  const x = Math.round(b.x - e.ax * SC), y = Math.round(b.y - e.ay * SC);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = clamp(a * 0.7);
  ctx.drawImage(e.halo, x, y, e.w * SC, e.h * SC);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = clamp(a);
  ctx.drawImage(e.copy, x, y, e.w * SC, e.h * SC);
  ctx.restore();
}

// ---------------------------------------------------------------- the set: stands, turf, foreground

/** The far stands as a soft band (0.2x): the dark tiers under the roof lip. Screen space (before the dim). */
function drawStands(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, 30, 0, HORIZON);
  g.addColorStop(0, '#07030c');
  g.addColorStop(0.35, '#120821');
  g.addColorStop(1, '#1a0d2c');
  ctx.fillStyle = g;
  ctx.fillRect(-60, 30, VW + 120, HORIZON - 30);
  // The stand's roof lip: a black edge with a faint lilac line.
  ctx.fillStyle = '#05020a';
  ctx.fillRect(-60, 0, VW + 120, 34);
  ctx.fillStyle = 'rgba(201,182,255,0.08)';
  ctx.fillRect(-60, 33, VW + 120, 1);
  // Tiers.
  for (let i = 0; i < 9; i++) {
    const y = 52 + i * 23;
    ctx.fillStyle = `rgba(42,22,96,${0.18 + 0.04 * (i % 2)})`;
    ctx.fillRect(-60, y, VW + 120, 9);
  }
}

/**
 * The phone lights in the far stands (0.2x), out of focus: ~150 soft bokeh discs with a crisp core, a few twinkling.
 * Drawn after the dim (they are lights), so at speed the streak pulls them into lines. Screen space.
 */
function drawPhones(ctx: CanvasRenderingContext2D, cx: number, fr: { next(): number }, A: number) {
  const off = -0.2 * cx;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const span = 980;
  for (let i = 0; i < 150; i++) {
    const x = ((((h01(i, 3) * span + off) % span) + span) % span) - 170;
    const y = 54 + h01(i, 4) * 196;
    const r = 2 + h01(i, 5) * 4.5 * (0.6 + (y - 54) / 300);
    const tw = 0.75 + 0.25 * fr.next();
    const c: RGB = h01(i, 6) < 0.6 ? [201, 182, 255] : h01(i, 6) < 0.85 ? [246, 240, 223] : [122, 77, 255];
    const a = (0.2 + 0.3 * h01(i, 7)) * tw * A;
    drawGlow(ctx, glowOf(c), x, y, r * 1.7, a);
    ctx.globalAlpha = clamp(a * 1.6);
    ctx.fillStyle = h01(i, 8) < 0.7 ? '#E2DCFF' : '#FFFAEC';
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

/** The turf: a near-black plane from the horizon down, the near band a little lifted. Screen space. */
function drawTurfBase(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, HORIZON, 0, VH);
  g.addColorStop(0, '#0b1810');
  g.addColorStop(0.5, '#1d3e22');
  g.addColorStop(0.62, '#173520');
  g.addColorStop(1, '#0d2015');
  ctx.fillStyle = g;
  ctx.fillRect(-60, HORIZON, VW + 120, VH - HORIZON + 40);
}

/** The grass at the subject plane (world, parallax 1): blade tufts along the turf line and a few strokes below it. */
function drawGrass(ctx: CanvasRenderingContext2D, x0: number, x1: number) {
  const step = 7;
  const i0 = Math.floor(x0 / step) - 1, i1 = Math.ceil(x1 / step) + 1;
  for (let i = i0; i <= i1; i++) {
    const x = i * step + Math.floor(h01(i, 11) * 5);
    const hgt = 3 + Math.floor(h01(i, 12) * 8);
    ctx.fillStyle = h01(i, 13) < 0.5 ? '#245a2a' : '#1a4420';
    ctx.fillRect(x, TURF - hgt + 2, 1, hgt);
    if (h01(i, 14) < 0.5) {
      ctx.fillStyle = '#2f6e33';
      ctx.fillRect(x + 2, TURF - Math.floor(hgt * 0.6) + 2, 1, Math.floor(hgt * 0.6));
    }
    if (h01(i, 15) < 0.35) {
      ctx.fillStyle = '#122a17';
      const yy = TURF + 8 + Math.floor(h01(i, 16) * 40);
      ctx.fillRect(x, yy, 1, 3 + Math.floor(h01(i, 17) * 5));
    }
  }
}

/** Lit grass tips inside the beam's pool (additive, world). */
function drawLitGrass(ctx: CanvasRenderingContext2D, cx: number, rx: number, a: number) {
  if (a <= 0) return;
  const step = 7;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = Math.floor((cx - rx) / step); i <= Math.ceil((cx + rx) / step); i++) {
    const x = i * step + Math.floor(h01(i, 11) * 5);
    const hgt = 3 + Math.floor(h01(i, 12) * 8);
    const k = 1 - Math.abs(x - cx) / rx;
    if (k <= 0) continue;
    ctx.fillStyle = `rgba(226,220,255,${clamp(a * k * 0.9)})`;
    ctx.fillRect(x, TURF - hgt + 2, 1, 2);
  }
  ctx.restore();
}

/** Foreground blades at the lens (2.6x parallax): dark tufts at rest, horizontal streaks (40-90 px) at speed. Screen. */
function drawForeground(ctx: CanvasRenderingContext2D, cx: number, speed: number, beamSX: number, beamA: number) {
  const off = -2.6 * cx;
  const span = 1500;
  const streak = speed > 500 ? clamp(speed * 0.022, 40, 90) : 0;
  for (let i = 0; i < 46; i++) {
    const x = ((((h01(i, 21) * span + off) % span) + span) % span) - 300;
    const hgt = 22 + h01(i, 22) * 46;
    const lit = beamA * clamp(1 - Math.abs(x - beamSX) / 220);
    if (streak > 0) {
      const y = Math.round(VH - hgt * 0.7);
      const w = Math.round(streak * (0.6 + 0.4 * h01(i, 23)));
      ctx.fillStyle = '#06100a';
      ctx.fillRect(Math.round(x), y, w, 2 + Math.round(h01(i, 24) * 2));
      ctx.fillStyle = `rgba(201,182,255,${0.45 + 0.45 * lit})`;
      ctx.fillRect(Math.round(x), y, w, 1);
    } else {
      const lean = (h01(i, 25) - 0.5) * 18;
      const w0 = 3 + h01(i, 26) * 4;
      ctx.fillStyle = '#06100a';
      ctx.beginPath();
      ctx.moveTo(x - w0, VH + 2);
      ctx.lineTo(x + lean, VH - hgt);
      ctx.lineTo(x + w0, VH + 2);
      ctx.closePath();
      ctx.fill();
      if (lit > 0.02) {
        ctx.strokeStyle = `rgba(201,182,255,${0.5 * lit})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - w0 + 1, VH);
        ctx.lineTo(x + lean, VH - hgt + 1);
        ctx.stroke();
      }
    }
  }
}

/**
 * At speed the lit grass glints smear into thin horizontal streaks along the turf (parallax 1.3, length with the camera's
 * speed, 30-150 px): the ground rushing past at boot height. Screen space, after the dim.
 */
function drawTurfStreaks(ctx: CanvasRenderingContext2D, cx: number, speed: number, lightX: number) {
  if (speed < 500) return;
  const L = clamp(speed * 0.028, 30, 150);
  const off = -1.3 * cx;
  const span = 1300;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 40; i++) {
    const x = ((((h01(i, 101) * span + off) % span) + span) % span) - 300;
    const y = Math.round(TURF - 6 + h01(i, 102) * 56);
    const near = clamp(1 - Math.abs(x + L / 2 - lightX) / 420);
    const a = (0.12 + 0.3 * h01(i, 103)) * (0.35 + 0.65 * near);
    ctx.fillStyle = h01(i, 104) < 0.7 ? `rgba(201,182,255,${a})` : `rgba(246,240,223,${a})`;
    ctx.fillRect(Math.round(x), y, Math.round(L * (0.5 + 0.5 * h01(i, 105))), 1);
  }
  ctx.restore();
}

/** A torn sod slab (the PK.Sod look), drawn by the step-print's sprays. */
function drawSod(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rot: number) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.rotate(rot);
  const w = Math.max(2, s), hh = Math.max(1, Math.round(s * 0.45));
  ctx.fillStyle = HEX.soilDeep;
  ctx.fillRect(-w / 2 - 0.5, -hh / 2 - 0.5, w + 1, hh + 2);
  ctx.fillStyle = HEX.soil;
  ctx.fillRect(-w / 2, 0, w, hh / 2 + 1);
  ctx.fillStyle = HEX.torn;
  ctx.fillRect(-w / 2, -hh / 2, w, Math.max(1, hh / 2 + 0.5));
  ctx.fillStyle = '#78C85A';
  ctx.fillRect(-w / 2, -hh / 2, Math.max(1, w * 0.6), 1);
  ctx.restore();
}

/** The 6-sod spray of touch k (a pure function of the print time: held with the step-print). World. */
function drawTouchSpray(ctx: CanvasRenderingContext2D, k: number, tr: number) {
  const tk = TOUCH[k];
  const tau = tr - tk;
  if (tau < 0 || tau > 0.6) return;
  const cx = ballW(tk) - R + 6, cy = TURF;
  for (let i = 0; i < 16; i++) {
    const sod = i < 6;
    const vx = -(90 + 320 * h01(i, 31 + k)), vy = -(160 + 380 * h01(i, 41 + k));
    const x = cx + vx * tau, y = Math.min(cy + 4, cy + vy * tau + 700 * tau * tau);
    if (sod) drawSod(ctx, x, y, 5 + 4 * h01(i, 51 + k), h01(i, 61 + k) * 6 + tau * (8 - 16 * h01(i, 71 + k)));
    else {
      ctx.fillStyle = h01(i, 81) < 0.5 ? HEX.soil : '#3C8A3A';
      const q = 1 + Math.round(h01(i, 91 + k));
      ctx.fillRect(Math.round(x), Math.round(y), q, q);
    }
  }
}

// ---------------------------------------------------------------- the gash (the ignition's 3-claw rip, macro projector)

const GASH = GASHES.find((g) => g.id === 'ignition')!;
/** The macro projector for the ignition gash: torn by the burst, it starts under the ball and runs 160 px ahead of it. */
const KX = 20, KZ = 5, GX = PX + 36;
const gashProject = (x: number, z: number, h = 0) => ({ x: GX + (x - GASH.x) * KX, y: TURF + 3 + (z - GASH.z) * KZ - h * KX, s: 10, k: 0.3 });

// ---------------------------------------------------------------- SOLO's strobe exposures and the wound's shafts

const expCache = new Map<number, HTMLCanvasElement>();
/**
 * A crisp ball exposure (the strobe chain): a disc with a 2 px ivory edge, a volt band inside it and a faint volt body,
 * a 1 px uv glow outside. Cached per radius; drawn additive over a uvDeep glow.
 */
function exposure(r: number): HTMLCanvasElement {
  const R0 = Math.max(4, Math.round(r));
  let cv = expCache.get(R0);
  if (cv) return cv;
  const size = R0 * 2 + 6, c0 = size / 2;
  cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const g = cv.getContext('2d')!;
  const img = g.createImageData(size, size);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const dd = Math.hypot(x + 0.5 - c0, y + 0.5 - c0);
      const o = (y * size + x) * 4;
      let c: RGB | null = null, a = 0;
      if (dd <= R0 && dd > R0 - 2) (c = PAL.ivory), (a = 255);
      else if (dd <= R0 - 2 && dd > R0 - 5) (c = PAL.volt), (a = 220);
      else if (dd <= R0 - 5) (c = PAL.volt), (a = 165);
      else if (dd <= R0 + 1.5) (c = PAL.uv), (a = 130);
      if (!c) continue;
      img.data[o] = c[0];
      img.data[o + 1] = c[1];
      img.data[o + 2] = c[2];
      img.data[o + 3] = a;
    }
  g.putImageData(img, 0, 0);
  expCache.set(R0, cv);
  return cv;
}
function drawExposure(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: number) {
  if (a <= 0) return;
  const cv = exposure(r);
  ctx.save();
  drawGlow(ctx, glowOf(PAL.uvDeep), x, y, r * 1.5, 0.55 * a);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = clamp(a);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(cv, Math.round(x - cv.width / 2), Math.round(y - cv.height / 2));
  ctx.restore();
}

/**
 * The ultraviolet light pouring up out of the ignition gash (world, after its claws): five tapered shafts, narrow at the
 * wound and opening upward (60-140 px; 1.9x taller and wider in the eruption at its birth), each with a white-hot core
 * line and a glowing foot, flickering on the 8ths, dimming with age.
 */
function drawShafts(ctx: CanvasRenderingContext2D, tr: number) {
  const age = G0 + tr - GASH.born;
  if (age < 0) return;
  const open = clamp(age / 0.05);
  const er = tr < T_HIT + 0.05 ? 0.9 : 0.9 * decay(tr, T_HIT + 0.05, 0.45);
  const dim = lerp(1, 0.65, clamp(age / 1.2));
  const beat8 = Math.floor((G0 + tr - 1.6) / 0.2 + 1e-6);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < GASH.shafts; i++) {
    const u = (i + 0.5) / GASH.shafts;
    const x = GX + 160 * u + (h01(i, 201) - 0.5) * 16;
    const y = TURF + 2 + Math.round((h01(i, 202) - 0.5) * 8);
    const fl = 1 + 0.15 * ((beat8 + i) % 2 ? 1 : -1);
    const H = lerp(70, 140, h01(i, 203)) * (1 + 0.9 * er) * open;
    const w0 = 3 + 3 * h01(i, 204), w1 = w0 * 3.4 * (1 + 0.6 * er);
    const k = clamp((0.55 + 0.45 * h01(i, 205)) * dim * fl * (1 + 0.5 * er));
    const gr = ctx.createLinearGradient(0, y, 0, y - H);
    gr.addColorStop(0, `rgba(255,250,236,${0.7 * k})`);
    gr.addColorStop(0.18, `rgba(168,128,255,${0.5 * k})`);
    gr.addColorStop(0.55, `rgba(122,77,255,${0.3 * k})`);
    gr.addColorStop(1, 'rgba(122,77,255,0)');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(x - w0 / 2, y);
    ctx.lineTo(x + w0 / 2, y);
    ctx.lineTo(x + w1 / 2, y - H);
    ctx.lineTo(x - w1 / 2, y - H);
    ctx.closePath();
    ctx.fill();
    const gc = ctx.createLinearGradient(0, y, 0, y - H * 0.8);
    gc.addColorStop(0, `rgba(255,250,236,${0.9 * k})`);
    gc.addColorStop(1, 'rgba(255,250,236,0)');
    ctx.fillStyle = gc;
    ctx.fillRect(Math.round(x), y - H * 0.8, 1, H * 0.8);
    drawGlow(ctx, glowOf(PAL.volt), x, y, 12 + 8 * er, 0.7 * k);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the shot

/** Pre-fly the particles spawned since index i0 by tau seconds (so the sods hang spread out through the hit-stop). */
function preFly(env: Env, i0: number, tau: number) {
  const L = env.parts.list;
  for (let i = i0; i < L.length; i++) {
    const p = L[i];
    p.x += p.vx * tau;
    p.y += p.vy * tau + 0.5 * p.ay * tau * tau;
    p.vy += p.ay * tau;
    p.rot += p.vrot * tau;
    p.life += tau;
  }
}

export const shotIgnition: Shot = {
  name: META.name,
  dur: META.dur,
  seed: META.seed,
  rate: RATE[4],
  cues: [
    {
      at: 0.0,
      fn: (e) => {
        e.sfx.kickDrum(0.9);
        e.sfx.scuff(0.3);
        e.cam.shakeAmp = 10;
        e.cam.hit(0.25);
        // The plant: 12 soil crumbs and 3 crumb-sods spit back off the left boot's studs.
        const r = e.rng;
        for (let i = 0; i < 12; i++) {
          const a = -Math.PI / 2 - 0.5 - r.range(0, 0.9), sp = r.range(120, 320);
          e.parts.spawn({
            kind: PK.Pixel, x: PX - 60 + r.range(-14, 14), y: TURF + r.range(-2, 2), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, ay: 900,
            drag: 0.8, max: r.range(0.4, 0.8), s0: r.range(1.5, 3), s1: 1.5, ramp: 'sod', r0: 0.5, r1: 1, a0: 1, a1: 0.8, add: false, layer: 1,
          });
        }
        for (let i = 0; i < 3; i++) {
          const a = -Math.PI / 2 - 0.4 - r.range(0, 0.6), sp = r.range(140, 260);
          e.parts.spawn({
            kind: PK.Sod, x: PX - 64 + r.range(-8, 8), y: TURF, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, ay: 1100, drag: 0.4,
            vrot: r.range(-12, 12), rot: r.range(0, 6), max: 0.9, s0: r.range(4, 6), s1: 4, a0: 1, a1: 1, k: TURF + 5, layer: 1,
          });
        }
      },
    },
    { at: T_SWING, fn: (e) => e.sfx.whoosh(0.08, 500, 2200, 0.3, 0.2) },
    {
      at: T_HIT,
      fn: (e) => {
        // CONTACT (g 5.7): the ignition stack's sound and the turf tearing.
        e.sfx.kickDrum(1.2);
        e.sfx.kick(1.0);
        e.sfx.rip(1.2);
        e.sfx.boom(1.0);
        e.sfx.crack(0.6);
        e.sfx.spotOn(0.8);
        e.cam.shakeAmp = 16;
        e.cam.hit(0.8);
        e.cam.shove(-3, 5);
        const i0 = e.parts.list.length;
        turfRip(e, PX - 34, TURF, -Math.PI / 2 - 0.55, 1.2, { lens: true, ground: TURF + 5 });
        preFly(e, i0, 0.045);
      },
    },
    { at: 0.12, fn: (e) => e.sfx.gasp(0.5) },
    { at: 0.18, fn: (e) => e.sfx.whoosh(0.3, 300, 3000) },
    { at: 0.38, fn: (e) => e.sfx.whoosh(0.12, 600, 2400, 0.25, -0.2) },
    ...TOUCH.map((at, i) => ({
      at,
      fn: (e: Env) => {
        // The touches: a falling tom fill (D3 C3 A2 F2), the boot's tok, the turf ripping under the plant foot.
        e.sfx.tom(TOM_F[i], 0.6);
        e.sfx.kick(0.3);
        e.sfx.rip(0.35);
        if (i === 0) e.sfx.spotOn(0.45);
        e.cam.shakeAmp = 9;
        e.cam.hit(0.15);
      },
    })),
  ],
  prepare(env) {
    warmSolo2();
    warmBalls([R]);
    for (const k of ['MB1', 'MB2', 'MB3'] as const) for (const f of [false, true]) extPic(env, k, f);
    for (const r of [EXP_R, 37, 33, 29, 26, 23, 20]) exposure(r);
  },
  init(env) {
    env.sfx.clearBus();
    env.cam.set(VW / 2, VH / 2, 1, 0);
    env.cam.shakeRoll = 0.015;
    env.cam.shakeAmp = 10;
    held = null;
  },
  update(env, t, dt) {
    env.sfx.hum(HUM[4](t), 0.025);
    const r = env.rng;
    // Smoke and a UV haze rising out of the gash from the contact (slowed by the hit-stop's rate like everything else).
    if (t >= T_HIT + FR && t < 0.34) {
      for (let i = 0; i < 2; i++) {
        const x = GX + r.range(0, 160);
        env.parts.spawn({
          kind: PK.Smoke, x, y: TURF + r.range(-2, 4), vx: r.range(-30, 20), vy: r.range(-90, -40), drag: 1.2, max: r.range(0.5, 0.9),
          s0: r.range(6, 10), s1: r.range(22, 34), ramp: 'smoke', r0: 0.2, r1: 1, a0: 0.55, a1: 0, add: false, layer: 0,
        });
      }
      env.parts.spawn({
        kind: PK.Glow, x: GX + r.range(10, 150), y: TURF - r.range(0, 10), vx: r.range(-10, 10), vy: r.range(-80, -40), drag: 0.8, max: 0.5,
        s0: 6, s1: 22, ramp: 'uv', r0: 0.3, r1: 1, a0: 0.3, a1: 0, layer: 0,
      });
    }
    // The step-print holds the shake with the image: sample it on every print's first step.
    if (t >= T_SP0 - 1e-6 && t < T_SP1) {
      const tr = printT(t);
      if (!held || held.tr !== tr) held = { tr, off: shakeOf(env, zoomAt(tr)) };
    } else held = null;
    void dt;
  },
  render(env, t) {
    const { ctx, fx } = env;
    const tr = printT(t);
    const z = zoomAt(tr);
    let [ox, oy] = held && held.tr === tr ? held.off : shakeOf(env, z);
    // The step-print's jolt: every held image sits a few px off the last (a hand-cranked shutter), more on the touches.
    if (tr >= T_SP0 - 1e-6) {
      const k = Math.round((tr - T_SP0) / PRINT), j = (tr - T_SP0) % 0.1 < PRINT - 1e-6 ? 1 : 0.5;
      ox += (h01(k, 301) - 0.5) * 12 * j;
      oy += (h01(k, 302) - 0.5) * 8 * j;
    }
    const cx = camX(tr);
    const v: View = { cx, z, ox, oy };
    // Keep env.cam on the view (toUV users).
    env.cam.zoom = z;
    env.cam.x = cx + PX + (VW / 2 - PX) / z;
    env.cam.y = BY + (VH / 2 - BY) / z;
    const speed = Math.abs(camX(tr + FR) - camX(tr)) / FR;
    const bW = ballW(tr), bS = toScreen(v, bW, BY);
    const on = beamOn(tr);
    const beamX = beamW(tr);
    const [beamSX] = toScreen(v, beamX, BY);
    const slamK = decay(tr, T_HIT, 0.25);
    const pump = TOUCH.some((k) => tr >= k - 1e-6 && tr < k + 0.1) ? 1.15 : 1;

    // ---- 1 · the set (screen space, shaken): the stands' bokeh band at 0.2x, the turf plane.
    env.screen();
    ctx.fillStyle = HEX.void;
    ctx.fillRect(0, 0, VW, VH);
    ctx.save();
    ctx.translate(ox, oy);
    drawStands(ctx);
    drawTurfBase(ctx);
    ctx.restore();

    // ---- 2 · the subject plane (world): grass along the turf line.
    applyView(env, v);
    const wx0 = cx + PX + (0 - PX - ox) / z - 20, wx1 = cx + PX + (VW - PX - ox) / z + 20;
    drawGrass(ctx, wx0, wx1);

    // ---- 3 · the dark: the stage dim, holes for the ball's own glow, the beam's column and its pool, the gash.
    const pools = [{ x: bS[0], y: bS[1], rx: 110, ry: 80, soft: 90, gain: on ? 0.35 : 0.6 }];
    if (on) {
      pools.push({ x: beamSX, y: 150, rx: 110, ry: 220, soft: 60, gain: 0.3 });
      pools.push({ x: beamSX, y: toScreen(v, 0, TURF)[1], rx: 200, ry: 48, soft: 70, gain: 0.95 });
      const [gx] = toScreen(v, GX + 80, TURF);
      pools.push({ x: gx, y: toScreen(v, 0, TURF)[1], rx: 110, ry: 34, soft: 50, gain: 0.7 });
    }
    stage.dim(ctx, 0.94, pools, { max: DIM_V2 });
    // The phone lights are lights: after the dim.
    env.screen();
    ctx.save();
    ctx.translate(ox, oy);
    drawPhones(ctx, cx, env.frng(7), 0.85);
    ctx.restore();
    applyView(env, v);
    // The blazing ball lights the turf under it (a lilac pool that travels with it, its grass tips lit).
    if (bS[0] < VW + 140) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.uv), bW, TURF + 2, 160, 0.5, 1, 0.16);
      drawGlow(ctx, glowOf(PAL.lilac), bW, TURF + 1, 90, 0.45, 1, 0.12);
      ctx.restore();
      drawLitGrass(ctx, bW, 110, 0.55);
    }

    // ---- 4 · the drop beam (world), its pool on the turf, the lit grass tips.
    if (on) {
      const back = tr >= 0.3 && tr < T_SP0 + 0.1 ? decay(tr, T_SP0, 0.2) : 0;
      // The beam lights the air: an ultraviolet haze round its column (dust in the light), deepest at the turf.
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.uv), beamX, 200, 250, (0.4 + 0.15 * slamK) * pump, 1, 0.95);
      drawGlow(ctx, glowOf(PAL.uv), beamX, TURF - 10, 300, 0.32 * pump, 1, 0.35);
      ctx.restore();
      stage.pillar(ctx, {
        x0: beamX, y0: -60, x1: beamX, y1: TURF + 6, w0: 40, w1: 260, a: 1, t: tr, slamAt: T_HIT, pumps: TOUCH, motes: 36, seed: 14, core: 0.33,
      });
      stage.pool(ctx, beamX, TURF + 3, 180, 22, (0.95 + 0.3 * slamK + 0.3 * back) * pump);
      drawLitGrass(ctx, beamX, 150, 0.9 * pump);
      stage.splash(ctx, PX, TURF + 4, 30, 190, 0.2, T_HIT, tr, 1);
      stage.splash(ctx, ballW(T_SP0) - 6, TURF + 4, 24, 150, 0.2, T_SP0, tr, 0.8);
      // Every touch: a small filled splash of light at the boot (local).
      TOUCH.forEach((k, i) => i > 0 && stage.splash(ctx, ballW(k) - R + 8, TURF + 3, 14, 80, 0.22, k, tr, 0.55));
    }
    // Light rain out of the rig on the contact (60 lines, 0.15 s).
    lightRain(ctx, PX, 300, 60, T_HIT, tr, { life: 0.15, y0: -80, y1: 190, len0: 24, len1: 90, seed: 41 });
    // A short fall of light rain in the beam on every touch (the touches are hits too: 18 lines, 0.12 s).
    TOUCH.forEach((k, i) => lightRain(ctx, ballW(k) - 10, 170, 18, k, tr, { life: 0.12, y0: -40, y1: 160, len0: 20, len1: 70, seed: 60 + i, a: 0.8 }));

    // ---- 5 · the light gash (born g 5.7), smoke and UV haze behind the boots.
    // Its birth erupts (shafts 1.7x taller and wider for 0.45 s), then it settles into the torn route.
    lightGash(ctx, GASH, gashProject, G0 + tr, { noShafts: true });
    drawShafts(ctx, tr);
    if (tr >= T_HIT) {
      // The wound's own glow on the turf (additive).
      const age = tr - T_HIT;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.volt), GX + 80, TURF + 2, 110, 0.5 * clamp(age / 0.05) * lerp(1, 0.7, clamp(age / 0.6)), 1, 0.3);
      ctx.restore();
    }
    env.parts.draw(ctx, 0);

    // ---- 6 · the strobe chain left behind (the ball's exposures out of the contact, world) and the whip trail.
    if (tr >= T_REL && tr < 0.6) {
      ctx.save();
      for (let i = 0; i < 5; i++) {
        const dx = 40 + 92 * i;
        const t0 = T_REL + dx / BLAST;
        if (tr < t0) break;
        const a = stepFade(tr - t0, 0.5 - 0.06 * i, 0.06);
        if (a <= 0) continue;
        drawExposure(ctx, PX + PUSH + dx, BY, EXP_R, a * 1.4);
      }
      ctx.restore();
    }
    // Volt copies of both boots at the contact, left behind as they blast out (stepped fade).
    if (tr >= T_EMPTY) {
      const a = stepFade(tr - T_EMPTY, 0.5, 0.05);
      drawBootCopy(env, { key: 'MB1', flip: false, x: PX, y: BY, far: true, a: 1, smear: 0 }, a * 0.6);
      drawBootCopy(env, { key: 'MB2', flip: false, x: PX + TOE_IN, y: BY, far: false, a: 1, smear: 0 }, a);
    }
    // The step-print: on every print a volt copy of the boot and a ball exposure stay behind in the dark.
    if (tr >= T_SP0) {
      for (let tp = T_SP0; tp < tr - 1e-6; tp += PRINT) {
        const a = stepFade(tr - tp, 0.6, 0.05);
        if (a <= 0) continue;
        for (const b of bootsAt(tp)) drawBootCopy(env, b, a * (b.far ? 0.7 : 1));
        drawExposure(ctx, ballW(tp), TURF - EXP_R, EXP_R, a * 1.4);
      }
    }

    // ---- 7 · No.10's boots and the ball (far boot, ball, near boot; MB1's ball sits over it, MB2 / MB3 over the ball).
    const boots = bootsAt(tr);
    const lit = (b: Boot) => (on ? clamp(1 - (Math.abs(b.x - 40 - beamX) - 100) / 90) : 0);
    for (const b of boots) if (b.far || b.key === 'MB1') drawBoot(env, b, tr, lit(b));
    // The whip: the ball's strobe chain, six exposures shrinking behind it (screen-relative to it), gone as it is caught.
    if (tr >= T_WHIP + FR && tr < 0.39) {
      const k = 1 - clamp((tr - 0.32) / 0.07);
      [37, 33, 29, 26, 23, 20].forEach((r, i) => drawExposure(ctx, bW - 44 * (i + 1), BY + (R - r) * 0.6, r, (0.75 - 0.11 * i) * k));
    }
    // The ball: blazing (the only light before the beam: halo 300 px), alive, squashed round the toe in the hit-stop.
    if (bS[0] < VW + 120) {
      const sq = ballSquash(tr);
      const flying = tr >= T_WHIP && tr < T_SP0;
      const touchK = tr >= T_SP0 && (tr - T_SP0) % 0.1 < PRINT - 1e-6 ? 0.2 : 0;
      const blaze = flying ? 1 : on ? 0.75 + 0.25 * slamK + touchK : 0.95;
      // The motion smear of the blast (2 frames): a volt-white streak from the contact to the ball.
      if (tr >= T_REL && tr < T_WHIP) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const x0 = Math.max(PX, bW - 260);
        const gr = ctx.createLinearGradient(x0, 0, bW, 0);
        gr.addColorStop(0, 'rgba(122,77,255,0)');
        gr.addColorStop(0.6, 'rgba(168,128,255,0.45)');
        gr.addColorStop(1, 'rgba(255,250,236,0.8)');
        ctx.fillStyle = gr;
        ctx.fillRect(x0, BY - R * 0.62, bW - x0, R * 1.24);
        ctx.restore();
      }
      drawBall(env, spinAt(spinAngle(tr), 0, 0, 1), Math.round(bW), BY, R, 1, 0, 0.5, 'blacklight', sq, { blaze, blazeR: on && !flying ? 120 : 150 });
    }
    for (const b of boots) if (!(b.far || b.key === 'MB1')) drawBoot(env, b, tr, lit(b));

    // ---- 8 · flying turf (world): the sods, crumbs, blades and the divot; the step-print sprays (held with it).
    env.parts.draw(ctx, 1);
    TOUCH.forEach((_, k) => drawTouchSpray(ctx, k, tr));
    // The contact's hot core (the toe in the ball) for the hit-stop.
    if (tr >= T_HIT && tr < T_REL) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const k = 1 - (tr - T_HIT) / (T_REL - T_HIT);
      drawGlow(ctx, glowOf(PAL.volt), PX - 33, BY + 2, 60, 0.45 * k + 0.15);
      drawGlow(ctx, glowOf(PAL.spot), PX - 33, BY + 2, 16, 0.5 * k + 0.1);
      ctx.restore();
    }

    // ---- 9 · the lens: the turf rushing past, foreground blades (2.6x), the HUD.
    env.screen();
    ctx.save();
    ctx.translate(ox, oy);
    drawTurfStreaks(ctx, cx, tr >= T_SP0 ? V_RUN : speed, bS[0]);
    drawForeground(ctx, cx, speed, beamSX, on ? 1 : 0.35);
    ctx.restore();
    fourCount(ctx, padsFor(4), t);

    // ---------------------------------------------------------------- post
    soloStage(fx, { bloom: 1.05 });
    fx.bloom = 1.0 + 0.2 * slamK + (pump > 1 ? 0.08 : 0);
    // The whip from shot 3 lands (streak 0.05 -> 0 over 3 frames).
    if (t < 0.05) {
      fx.streak = 0.05 * (1 - t / 0.05);
      fx.streakDX = -1;
      fx.streakDY = 0;
    }
    // The whip-chase: streak 0.09 -> 0, a sharp hole on the ball once it is back in frame.
    if (t >= T_WHIP && t < T_SP0) {
      fx.streak = 0.09 * (1 - (t - T_WHIP) / (T_SP0 - T_WHIP));
      fx.streakDX = -1;
      fx.streakDY = 0;
      if (bS[0] < VW + 30) {
        fx.streakHoleX = bS[0] / VW;
        fx.streakHoleY = bS[1] / VH;
        fx.streakHoleR = 0.2;
      }
    }
    // E4: beam impact A in the roof spot's cone (apex over the ball, axis down), 2 frames from the contact.
    if (onFrames(t, T_HIT, 2)) soloImpact2(fx, 'A', { x: beamSX / VW, y: -0.05, dx: 0, dy: 1, half: 0.34 });
    // Two flat refraction shocks rolling out along the turf from the contact.
    const [cu, cv] = toScreen(v, PX - 33, BY + 10);
    flatShockAt(fx, cu / VW, cv / VH, T_HIT, t, 0.05, 0.3, 0.32);
    flatShockAt(fx, cu / VW, cv / VH, T_HIT + 0.03, t, 0.03, 0.3, 0.32);
    // CA and a radial pull on the ball.
    const hitK = decay(t, T_HIT, 0.25);
    fx.ca = Math.max(fx.ca, 0.002 + 0.01 * hitK);
    if (hitK > 0 && t < T_HIT + 0.05) {
      fx.radial = 0.035 * hitK;
      fx.radialX = bS[0] / VW;
      fx.radialY = bS[1] / VH;
    }
  },
};
