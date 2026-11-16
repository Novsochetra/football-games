// SPOTLIGHT SOLO v2 · shot 3 · "The stare" (1.2 s, g 4.4-5.6, seed 513): the monument. SPEC.md §6 shot 3.
//
// The reverse worm's-eye from the defenders' side (hard cut on the beat out of 2c's long shadow). No.10 stands
// 275 px tall (Encore EN1 / EN1b at x2.8) with his sole on the blazing ball, chin down, eyes up and glowing; the
// footlight lamp is a white-hot disc behind his head (his halo) throwing 14 hard god rays past him; his front is in
// shadow, under-lit violet by the ball, a white-hot rim on his hair and shoulders. Two flinching defenders frame him
// as out-of-focus black silhouettes in the foreground (B's shielding arm at the left, A's leg at the right), the 300
// phone lights are the stars behind him, and the camera arcs 30° round him (parallax: the foreground slides left, the
// lamp and the stands slide right; he is the pivot) while it pushes in. His drums count: a war drum on every beat, the
// Chorus steps out of him on the ONE of bar 3, and on the third drum the camera CRASHES 1.12 -> 3.2 down onto the
// ball under his sole (the foreground and the halo fly out of frame; a hidden swap to MacroBoots MB6 at zoom 2.44
// under the blur), the sole clamps the 108 px ball and the camera whip-pans right: a motion cut into the ignition.
//
// Beats (shot-local; global = 4.4 + t):
//   0.00 (g 4.4, beat 4 of bar 2) hard cut in: EN1; war drum 1 (punch +0.05, cam.hit 0.3, a flat shock along the turf
//        at his feet, flecks jump, the god rays and the turf glow pump, the grass fringe shivers); the Chorus LINE:
//        three crisp volt copies of EN1 at -14 / +28 / -42 px behind him; eye glints 26 px.
//   0.00-0.80 the arc (inOutSine): the pitch view trucks 0.77 m with a matching pan (his feet stay put; the stands
//        and their phone lights slide 120 px right), the halo slides 24 px right behind his head, the god rays turn
//        6° (+2°/s), the foreground silhouettes slide 160 px left; push 1.00 -> 1.12 about his chest. Rate 0.35: the
//        flecks and dust hang in the light. EN1 / EN1b alternate every 0.2 s (the breath).
//   0.40 (g 4.8, the ONE of bar 3) war drum 2 + crash + shing: the Chorus FAN steps out of him (volt copies at
//        ±40 / ±80 px and an aura copy at 1.06x, snapping back 6 px after 0.1 s like a speaker cone on the kick), the
//        eyes flare (cross glints 56 px), the halo flares +40 % for 2 frames, a 3-frame beat echo rises off him, a
//        short light rain falls behind him; punch +0.05, cam.hit 0.3, flat shock.
//   0.80 (g 5.2) war drum 3 + whoosh: the fan collapses into him (2 frames) and the CRASH ZOOM starts (inQuart,
//        1.12 -> 3.2 by 1.08), the centre sliding from his chest to the ball; radial blur building to 0.15 on the
//        ball, CA 0.01; a 32nd snare roll 0.3 -> 0.9 (0.85-1.05).
//   1.05 (a 32nd; zoom 2.44, at the radial blur's peak) the hidden swap: EN1 -> MacroBoots MB6 (sole on top), the
//        ball redrawn at native resolution (r 54 on screen at 3.2).
//   1.08 THE SOLE CLAMPS: the 108 px ball squashes 10 % for 2 frames under the pressing sole and its panels turn 30°,
//        turf flecks jump, a light splash on the turf at its foot, 40 lines of light rain round the ball, a flat shock
//        at its foot, CA 0.012, punch +0.10, cam.hit 0.5; rim + kick + whoosh.
//   1.08-1.20 whip-pan right (+420 px, inQuad), streak 0.07 with a sharp hole on the ball until it leaves: the motion
//        cut into the macro (g 5.6).
//
// Photosensitivity (§4.4): no full-frame event in this shot (no flash, no impact frame, no fullFrame). The halo flare
// (+40 %, 2 frames) is local; the echo only lightens (3 frames, a disc round him).

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { clamp, ease, lerp, type RGB } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import {
  DIM_V2, HEX, HUM, PAL, RATE, SHOTS, drawBall, drawPhoneLights, drawSolo, drawSoloFluoro, drawUpPitch, echoAt, eyeGlow, flatShockAt,
  fourCount, lightRain, padsFor, rimLight, rivalPic, shadeSprite, soloPic, soloPunch, soloStage, spinAt, stage, underLight, warmSolo,
  simTime, warmSolo2, zoomAbout, crossGlint, type DownPitchView, type Pic, type SoloKey,
} from './common';
import { Chorus, warmChorus } from './chorus';

const META = SHOTS[2];
const FR = 1 / 60;

// ---------------------------------------------------------------- timing (shot-local)

/** The three war drums (beat 4 of bar 2, the ONE of bar 3, beat 2 of bar 3). */
const DRUMS = [0, 0.4, 0.8] as const;
/** The arc and the push end; the crash zoom runs CRASH0 -> CLAMP. */
const ARC_END = 0.8, CRASH0 = 0.8, CLAMP = 1.08, END = 1.2;
/** The fan steps out on the ONE; it collapses into him as the crash starts. */
const FAN = 0.4;
/** The hidden swap to MacroBoots MB6 on the 32nd at 1.05, the first frame the crash zoom passes 2.4 (zoom 2.44). */
const SWAP = 1.05;
const Z0 = 1.12, Z1 = 3.2;

// ---------------------------------------------------------------- the set (world px = screen px at zoom 1)

/** Encore at x2.8 (275 px): the body centre (frame x 64) on x 320, the soles (row 102) on y 341.6; integer top-left. */
const SC = 2.8;
const TL = [141, 56] as const;
const PIV: [number, number] = [64, 102];
const HX = TL[0] + PIV[0] * SC, FEET = TL[1] + PIV[1] * SC;
/** The ball under his right sole (Encore's ball anchor (50, 98), r 6 at x1). */
const BALL = { x: TL[0] + 50.5 * SC, y: TL[1] + 98.5 * SC, r: 6 * SC };
/** MacroBoots: ballR 23 at the strip's own scale, the ball anchor (62, 86). Drawn so its ball matches ours. */
const MB_S = BALL.r / 23;
/** The footlight lamp behind his head (world, at the start of the arc; it slides 24 px right over the arc). */
const LAMP = { x: 314, y: 78, r: 34 };
/** The pitch view: the eye 0.3 m up, 6 m in front of him; f and the horizon put his feet's depth on FEET. */
const EYE_H = 3, F = 1000, DEPTH = 60;
const V0: DownPitchView = { x: 900, z: 262, h: EYE_H, f: F, horizon: FEET - (EYE_H * F) / DEPTH, cx: 320, dir: -1 };
/** The arc's truck (world px, across the pitch) chosen so the far stand slides 120 px right; the pan keeps him put. */
const TRUCK = -120 / (F * (1 / DEPTH - 1 / 860));

// ---------------------------------------------------------------- small helpers

const h01 = (i: number, s: number) => {
  const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
/** 1 at `at`, falling to 0 over `len` (outQuad); 0 before. */
const decay = (t: number, at: number, len: number) => (t < at ? 0 : 1 - ease.outQuad(clamp((t - at) / len)));
const drumK = (t: number, len = 0.16) => Math.max(...DRUMS.map((d) => decay(t, d, len)));
const arcU = (t: number) => ease.inOutSine(clamp(t / ARC_END));
/** The crash: inQuart (a rush you can see build over ~10 frames that slams into the clamp; pure inExpo holds for 12). */
const crashU = (t: number) => (t < CRASH0 ? 0 : ease.inQuart(clamp((t - CRASH0) / (CLAMP - CRASH0))));
const whipU = (t: number) => (t < CLAMP ? 0 : ease.inQuad(clamp((t - CLAMP) / (END - CLAMP))));
const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${clamp(a)})`;

/** No.10's frame: EN1 / EN1b every 0.2 s (the breath) to 0.80, EN1 under the crash, MB6 from the swap. */
function keyAt(t: number): SoloKey {
  if (t >= SWAP - 1e-6) return 'MB6';
  if (t >= 0.8 - 1e-6) return 'EN1';
  return Math.floor(t / 0.2 + 1e-6) % 2 ? 'EN1b' : 'EN1';
}

// ---------------------------------------------------------------- camera

interface Cam {
  /** World pivot, its screen position, the zoom. */
  wx: number;
  wy: number;
  sx: number;
  sy: number;
  z: number;
}
/**
 * The arc's push (1.00 -> 1.12 about his chest), a +0.05 punch on each war drum, then the crash zoom (inQuart) with the
 * pivot sliding from his chest to the ball, the clamp's +0.10 punch and the whip-pan right (+420 px, inQuad).
 */
function camAt(t: number): Cam {
  const u = arcU(t), c = crashU(t);
  let z = lerp(1, Z0, u);
  if (t >= CRASH0) z = lerp(Z0, Z1, c);
  z += DRUMS.reduce((a: number, d) => a + soloPunch(t, d, 0.05, 0.12), 0) + soloPunch(t, CLAMP, 0.1, 0.12);
  return { wx: lerp(HX, BALL.x, c), wy: lerp(200, BALL.y, c), sx: HX - 420 * whipU(t), sy: lerp(200, 192, c), z };
}

/** The pitch view under the camera: zoom = focal length, the pan = the principal point (crisp at any zoom). */
function screenView(env: Env, v: DownPitchView): DownPitchView {
  const [ax, ay] = env.cam.toUV(0, 0);
  const [bx] = env.cam.toUV(100, 0);
  const z = ((bx - ax) * VW) / 100;
  return { ...v, f: v.f * z, cx: ax * VW + z * v.cx, horizon: ay * VH + z * v.horizon };
}

/**
 * The near layers (foreground silhouettes, the grass fringe) zoom harder than the world during the crash (they are a
 * metre from the lens): screen = pivot's screen + zn·(world - pivot), zn = z^1.7 once the crash starts.
 */
function nearTransform(env: Env, cm: Cam, t: number) {
  const [qx, qy] = env.cam.toUV(cm.wx, cm.wy);
  const zn = t < CRASH0 ? cm.z : Math.pow(cm.z, 1.7) / Math.pow(Z0, 0.7);
  const S = env.S;
  env.ctx.setTransform(S, 0, 0, S, 0, 0);
  env.ctx.translate(qx * VW, qy * VH);
  env.ctx.scale(zn, zn);
  env.ctx.translate(-cm.wx, -cm.wy);
}

// ---------------------------------------------------------------- the lamp, god rays, motes

/** The footlight lamp: a white-hot disc behind his head under a 150 px glow (uvDeep underlay, so nothing goes flat). */
function drawLamp(ctx: CanvasRenderingContext2D, x: number, y: number, k: number) {
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  drawGlow(ctx, glowOf(PAL.uvDeep), x, y, 250, 0.55);
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.uv), x, y, 190, 0.5 * k);
  drawGlow(ctx, glowOf(PAL.volt), x, y, 120, 0.55 * k);
  drawGlow(ctx, glowOf(PAL.ivory), x, y, 72, 0.75 * k);
  ctx.restore();
  // The lens: a hard disc with a volt rim, a white-hot face.
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = HEX.volt;
  ctx.beginPath();
  ctx.arc(x, y, LAMP.r + 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = HEX.spot;
  ctx.beginPath();
  ctx.arc(x, y, LAMP.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf([255, 255, 255]), x, y, LAMP.r * 1.25, 0.9 * Math.min(1, k));
  ctx.restore();
}

/** 40 motes drifting in the lamp's light (behind him): seeded, twinkling, a pure function of the sim clock. */
function drawMotes(ctx: CanvasRenderingContext2D, lx: number, ly: number, s: number, t: number) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 40; i++) {
    const a = h01(i, 5) * Math.PI * 2, d = 40 + 230 * Math.sqrt(h01(i, 6));
    const x = lx + Math.cos(a) * d * 1.3 + 6 * Math.sin(s * (0.7 + h01(i, 7)) + i);
    const y = ly + Math.sin(a) * d * 0.9 - 14 * s * (0.4 + h01(i, 8)) + 120;
    const tw = 0.55 + 0.45 * Math.sin(t * (5 + 7 * h01(i, 9)) + i * 1.7);
    const near = clamp(1 - d / 300);
    ctx.globalAlpha = clamp((0.25 + 0.6 * near) * tw);
    ctx.fillStyle = i % 3 === 0 ? HEX.lilac : HEX.ivory;
    const q = h01(i, 10) < 0.25 ? 2 : 1;
    ctx.fillRect(Math.round(x), Math.round(y), q, q);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the foreground silhouettes (out of focus)

const fgCache = new Map<string, HTMLCanvasElement | null>();
/**
 * A flinching defender seen from behind, a metre from the lens: the studio frame's silhouette (mirrored: his back is
 * to us), near-black with a 6 px lilac rim (a 2 px ivory core) on the top and the lamp side, scaled `s`, blurred
 * 3.5 px (out of focus). Built once. null when the rival frame is missing (then it is skipped: framing only).
 */
function fgSil(key: 'RF4' | 'RF1', s: number, lampSide: 1 | -1): HTMLCanvasElement | null {
  const ck = `${key}|${s}|${lampSide}`;
  if (fgCache.has(ck)) return fgCache.get(ck)!;
  const p = rivalPic(key);
  if (!p) {
    fgCache.set(ck, null);
    return null;
  }
  const pad = 12;
  const W = Math.ceil(p.w * s) + pad * 2, H = Math.ceil(p.h * s) + pad * 2;
  const tint = (c: string) => {
    const cv = document.createElement('canvas');
    cv.width = p.w;
    cv.height = p.h;
    const g = cv.getContext('2d')!;
    g.translate(p.w, 0);
    g.scale(-1, 1);
    g.drawImage(p.img, 0, 0);
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = c;
    g.fillRect(0, 0, p.w, p.h);
    return cv;
  };
  const rimC = tint(HEX.lilac), hot = tint(HEX.ivory), body = tint('#0b0616');
  const big = document.createElement('canvas');
  big.width = W;
  big.height = H;
  const g = big.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  // A 6 px lilac rim on the top and the lamp side, its inner 2 px ivory, the body near-black.
  g.drawImage(rimC, pad, pad, p.w * s, p.h * s);
  g.globalCompositeOperation = 'source-atop';
  g.drawImage(body, pad - lampSide * 6, pad + 6, p.w * s, p.h * s);
  const rim2 = document.createElement('canvas');
  rim2.width = W;
  rim2.height = H;
  const r2 = rim2.getContext('2d')!;
  r2.imageSmoothingEnabled = false;
  r2.drawImage(hot, pad, pad, p.w * s, p.h * s);
  r2.globalCompositeOperation = 'destination-out';
  r2.drawImage(hot, pad - lampSide * 2, pad + 2, p.w * s, p.h * s);
  g.globalCompositeOperation = 'source-over';
  g.globalAlpha = 0.8;
  g.drawImage(rim2, 0, 0);
  g.globalAlpha = 1;
  const out = document.createElement('canvas');
  out.width = W;
  out.height = H;
  const o = out.getContext('2d')!;
  o.filter = 'blur(3.5px)';
  o.drawImage(big, 0, 0);
  o.filter = 'none';
  fgCache.set(ck, out);
  return out;
}

/** Draw a foreground silhouette so its (mirrored) pelvis lands on (x, y). */
function drawFg(ctx: CanvasRenderingContext2D, key: 'RF4' | 'RF1', s: number, lampSide: 1 | -1, x: number, y: number) {
  const cv = fgSil(key, s, lampSide);
  const p = rivalPic(key);
  if (!cv || !p) return;
  const [px, py] = p.anchor('pelvis');
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(cv, x - (p.w - px) * s - 12, y - py * s - 12);
  ctx.restore();
}

// ---------------------------------------------------------------- the grass fringe at the lens

/** Grass blades a hand from the lens along the frame bottom: dark, backlit tips; they shiver 2 px on each drum. */
function drawFringe(ctx: CanvasRenderingContext2D, t: number, off: number) {
  const sh = 2 * drumK(t, 0.12);
  ctx.save();
  for (let i = 0; i < 70; i++) {
    const x = -40 + h01(i, 21) * 760 + off;
    // Short in front of the ball and his feet, tall at the frame edges.
    const edge = clamp(Math.abs(x - 300) / 300);
    const h = lerp(6, 34, edge * edge) * (0.55 + 0.45 * h01(i, 22));
    const lean = (h01(i, 23) - 0.5) * 0.6 + sh * (i % 2 ? 0.25 : -0.25);
    const w = 2 + 2 * h01(i, 24);
    const bx = x, by = 364;
    const tx = bx + lean * h, ty = by - h;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#0a0514';
    ctx.beginPath();
    ctx.moveTo(bx - w, by);
    ctx.lineTo(tx, ty);
    ctx.lineTo(bx + w, by);
    ctx.closePath();
    ctx.fill();
    // The lamp catches the tip (lilac, additive).
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = rgba(i % 4 === 0 ? PAL.ivory : PAL.lilac, 0.35 + 0.3 * h01(i, 25));
    ctx.fillRect(Math.round(tx - 0.5), Math.round(ty), 1, Math.max(2, Math.round(h * 0.3)));
  }
  ctx.restore();
}

// ---------------------------------------------------------------- him under the lamp

/** EN1 / EN1b at x2.8: the sprite, his front in shadow, under-lit by the ball, the white-hot rim from the lamp, fluoro. */
function drawStare(env: Env, key: SoloKey, pump: number) {
  const ctx = env.ctx;
  const p = soloPic(env, key);
  drawSolo(env, key, HX, FEET, SC, { pivot: PIV });
  shadeSprite(ctx, p.img, TL[0], TL[1], SC, 0.34, [150, 118, 255]);
  // Under-light from the blazing ball: strong on the shins and knees, a wide violet wash up to the chin.
  underLight(ctx, p.img, TL[0], TL[1], SC, BALL.x, BALL.y, 125, PAL.lilac, 0.6 * pump);
  underLight(ctx, p.img, TL[0], TL[1], SC, BALL.x + 20, BALL.y, 300, PAL.volt, 0.16 * pump);
  // The lamp behind him: a white-hot rim on the hair and shoulders, an ivory rim down the upper outer edges.
  rimLight(ctx, p.img, TL[0], TL[1], SC, [0, -1], 3, PAL.spot, 0.95);
  rimLight(ctx, p.img, TL[0], TL[1], SC, [-1, -0.7], 2, PAL.ivory, 0.5);
  rimLight(ctx, p.img, TL[0], TL[1], SC, [1, -0.7], 2, PAL.ivory, 0.5);
  // His whites fluoresce (boots, sock trims) under the ultraviolet.
  drawSoloFluoro(env, key, HX, FEET, SC, 0.42, { pivot: PIV });
}

/** His glowing eyes on the pupil anchors (narrowed slits, uv halos, stage-light cross glints). */
function drawEyes(env: Env, key: SoloKey, cross: number, flare: number) {
  const p = soloPic(env, key);
  for (const nm of ['pupilL', 'pupilR'] as const) {
    const [ax, ay] = p.anchor(nm);
    const x = TL[0] + (ax + 0.5) * SC, y = TL[1] + (ay + 0.5) * SC;
    eyeGlow(env.ctx, x, y, { narrow: 1, px: 2, halo: 14 + 10 * flare, cross: 0, a: 1 });
    if (cross > 1) crossGlint(env.ctx, x, y, Math.min(60, cross), 0.95);
  }
}

// ---------------------------------------------------------------- the ball

/** The ball's spin: alive (1.3 rad/s), plus the clamp's 30° turn over 3 frames. */
function ballSpin(t: number) {
  const kick = t < CLAMP ? 0 : ease.outCubic(clamp((t - CLAMP) / (3 * FR))) * (Math.PI / 6);
  return spinAt(1.3 * t + kick, 0.25, 1, 0.15);
}

// ---------------------------------------------------------------- the shot

const chorus = new Chorus();

export const shotStare: Shot = {
  name: META.name,
  dur: META.dur,
  seed: META.seed,
  rate: RATE[3],
  cues: [
    {
      at: 0,
      fn: (e) => {
        e.sfx.warDrum(1.0);
        e.sfx.crowd(1.6, 0.32);
        e.sfx.duck(0.85);
        e.sfx.rumble(1.1, 0.28);
        e.cam.hit(0.3);
        flecks(e, 26, 1);
      },
    },
    {
      at: FAN,
      fn: (e) => {
        e.sfx.warDrum(1.1);
        e.sfx.crash(0.5);
        e.sfx.shing(1.2);
        e.sfx.boom(0.35);
        e.cam.hit(0.3);
        flecks(e, 34, 1.2);
      },
    },
    {
      at: CRASH0,
      fn: (e) => {
        e.sfx.warDrum(1.2);
        e.sfx.whoosh(0.28, 200, 2400);
        e.cam.hit(0.3);
        flecks(e, 20, 1);
      },
    },
    // The snare roll on the 32nds into the clamp, 0.3 -> 0.9.
    ...[0.85, 0.9, 0.95, 1.0, 1.05].map((at, i) => ({ at, fn: (e: Env) => e.sfx.snare(0.3 + i * 0.15) })),
    {
      at: CLAMP,
      fn: (e) => {
        e.sfx.rim(1.0);
        e.sfx.kick(0.8);
        e.sfx.whoosh(0.15);
        e.cam.shakeAmp = 6;
        e.cam.hit(0.5);
        // Turf flecks jump round the ball's foot (world px at the ball's depth; seen at zoom 3.2).
        for (let i = 0; i < 26; i++) {
          const side = i % 2 ? 1 : -1;
          e.parts.spawn({
            kind: PK.Pixel, x: BALL.x + side * e.rng.range(8, 30), y: BALL.y + BALL.r - e.rng.range(0, 3),
            vx: side * e.rng.range(20, 90), vy: -e.rng.range(60, 170), ay: 420, drag: 1.2, max: e.rng.range(0.25, 0.5),
            s0: e.rng.range(0.8, 1.6), s1: 0.6, ramp: i % 3 ? 'sod' : 'mote', r0: 0, r1: 0.9, a0: 1, a1: 0.3, add: i % 3 === 0, layer: 2,
          });
        }
      },
    },
  ],
  prepare(env) {
    warmSolo2();
    warmSolo(env, ['EN1', 'EN1b', 'MB6'], { fluoro: true });
    warmChorus(env, ['EN1'], [SC, SC * 1.06]);
    fgSil('RF4', 3.6, 1);
    fgSil('RF1', 4.6, -1);
  },
  init(env) {
    env.sfx.clearBus();
    env.cam.set(VW / 2, VH / 2, 1, 0);
    env.cam.shakeRoll = 0.015;
    env.cam.shakeAmp = 5;
    // Dust and turf flecks already hanging in the lamp's light round his legs (they float: the world nearly stops).
    for (let i = 0; i < 40; i++) {
      const x = HX + env.rng.range(-170, 170), y = FEET - env.rng.range(0, 150);
      env.parts.spawn({
        kind: PK.Pixel, x, y, vx: env.rng.range(-6, 6), vy: -env.rng.range(4, 16), ay: -12, drag: 0.4, max: env.rng.range(1.6, 3),
        s0: env.rng.range(0.8, 1.8), s1: 0.8, ramp: 'mote', r0: 0, r1: 0.8, a0: 0.8, a1: 0, add: true, layer: 0,
      });
    }
  },
  update(env, t) {
    env.sfx.hum(HUM[3](t), 0.025);
    // The held tremor: the ground hums under the drums.
    if (t < CRASH0 && env.cam.trauma < 0.22) env.cam.trauma = 0.22;
  },
  render(env, t) {
    const { ctx, fx } = env;
    chorus.frame();
    env.screen();
    ctx.fillStyle = HEX.void;
    ctx.fillRect(0, 0, VW, VH);

    const cm = camAt(t);
    zoomAbout(env.cam, cm.wx, cm.wy, cm.sx, cm.sy, cm.z);
    const u = arcU(t);
    const key = keyAt(t);
    const pump = 1 + 0.15 * drumK(t, 0.1);
    const flare = decay(t, FAN, 0.25);
    const halo = t >= FAN && t < FAN + 2 * FR ? 1.4 : 1;

    // ---- 1 · the stadium behind him (screen space through the camera: the pitch view zooms by focal length)
    const v = screenView(env, { ...V0, z: V0.z + TRUCK * u, cx: V0.cx - (F * TRUCK * u) / DEPTH });
    env.screen();
    drawUpPitch(ctx, env.art.stadium, v, t, { towers: [0, 0, 0, 0], ambientFlashes: false });
    // The dim (0.94): only the air round the lamp keeps a little of the stand.
    const toS = (x: number, y: number) => {
      const [a, b] = env.cam.toUV(x, y);
      return [a * VW, b * VH] as const;
    };
    const [lx0, ly0] = toS(LAMP.x + 24 * u, LAMP.y);
    stage.dim(ctx, 0.94, [{ x: lx0, y: ly0, rx: 60 * cm.z, ry: 60 * cm.z, soft: 90 * cm.z, gain: 0.25 }], { max: DIM_V2 });
    // The far stand and its boards are out of the footlight's reach: they sink to a deep violet (light only, sat 1).
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgb(104,86,150)';
    ctx.fillRect(0, 0, VW, Math.max(0, v.horizon + 4 * (v.f / F)));
    ctx.restore();
    drawPhoneLights(ctx, env.art.stadium, 0, t, 0.9, { n: 300, view: v });

    // ---- 2 · world: the lamp, the rays, the turf light, the Chorus, the ball, him
    env.world();
    const lx = LAMP.x + 24 * u, ly = LAMP.y;
    drawLamp(ctx, lx, ly, pump * halo);
    const rot = ((2 * t + 6 * u) * Math.PI) / 180;
    // The rays stab 20 % longer on every war drum.
    const reach = 1 + 0.2 * drumK(t, 0.12);
    stage.godRays(ctx, lx, ly, 14, 70 * reach, 230 * reach, 16, 0.9 * pump * halo, rot, 3, Math.PI * 2, t);
    stage.godRays(ctx, lx, ly, 14, 70 * reach, 230 * reach, 4, 1.25 * pump * halo, rot, 3, Math.PI * 2, t);
    drawMotes(ctx, lx, ly, simTime(3, t), t);
    env.parts.draw(ctx, 0);
    // The turf behind and round his feet catches the lamp (a hot band at grazing light); pumps on the drums.
    const wide = 1 - crashU(t);
    stage.pool(ctx, HX + 6, FEET - 12, 190, 15, 0.42 * pump * wide);
    stage.pool(ctx, HX, FEET + 6, 300, 22, 0.16 * pump * wide);
    // The ball's own light on the grass round it.
    stage.pool(ctx, BALL.x, BALL.y + BALL.r - 2, 46 + 14 * crashU(t), 6 + 2 * crashU(t), 0.55 * pump + 0.25 * crashU(t));
    // His shadow runs at the lens: a soft wedge from his feet to the frame bottom (stacked, widening, fading).
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    for (let i = 0; i < 6; i++) {
      const k = i / 5;
      ctx.fillStyle = `rgba(22,10,38,${0.22 - 0.025 * i})`;
      ctx.beginPath();
      ctx.moveTo(HX - 30 - 14 * k, FEET - 4);
      ctx.lineTo(HX + 56 + 14 * k, FEET - 4);
      ctx.lineTo(HX + 120 + 50 * k, FEET + 40);
      ctx.lineTo(HX - 100 - 50 * k, FEET + 40);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // The Chorus behind him: the line (0.00), the fan on the ONE (0.40), collapsing into him at 0.80.
    if (key !== 'MB6') {
      const CX = TL[0] + 85 * SC, CY = FEET;
      // The line steps into the fan on the ONE (it never overlaps the fan).
      if (t < FAN - 1e-6) chorus.line(env, 'EN1', CX, CY, SC, 0, t, [-14, 28, -42], { a: 0.36, hold: 0.3 });
      if (t >= FAN) {
        // The fan holds to 0.65, then steps down on the 16ths (2/3, 1/3) into the collapse at 0.80.
        const back = t - FAN < 0.1 ? 0 : 6;
        const col = clamp((t - CRASH0) / (2 * FR));
        for (const dx of [80, -80, 40, -40]) {
          const off = Math.sign(dx) * (Math.abs(dx) - back) * (1 - col);
          chorus.drop(env, 'EN1', CX + off, CY, SC, FAN, t, { a: Math.abs(dx) > 50 ? 0.5 : 0.3, hold: 0.15 });
        }
        // The aura copy: 1.06x about his feet, peeking round him on the kick (then it steps away).
        chorus.drop(env, 'EN1', HX + 21 * SC * 1.06, CY, SC * 1.06, FAN, t, { a: 0.4, hold: 0 });
      }
    }

    // The ball, blazing (before him: his sole sits on it).
    // The clamp: the sole presses the ball 10 % flat for 2 frames (its foot stays on the turf, the boot follows its crown).
    const sq = t >= CLAMP && t < CLAMP + 2 * FR ? { sx: 1.1, sy: 0.9 } : undefined;
    const press = sq ? BALL.r * (1 - sq.sy) : 0;
    if (key !== 'MB6') {
      drawBall(env, ballSpin(t), BALL.x, BALL.y, 6, SC, 0, 1, 'blacklight', sq, { blaze: 0.8, blazeR: 45 });
    } else {
      const R = 54;
      drawBall(env, ballSpin(t), BALL.x, BALL.y + press, R, BALL.r / R, 0, 1, 'blacklight', sq, { blaze: 0.85, blazeR: 52 });
    }

    if (key !== 'MB6') {
      drawStare(env, key, pump);
      // The ball's light spills over his sole and shins.
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.volt), BALL.x, BALL.y, 40, 0.28 * pump);
      ctx.restore();
      // The eyes: glints on the cut, the flare on the ONE.
      drawEyes(env, key, 26 * decay(t, 0, 0.3) + 56 * flare, flare);
    } else {
      // MacroBoots MB6: the sole on the ball's crown, lit from the ball below and the lamp behind.
      const mp: Pic = soloPic(env, 'MB6');
      const dy = 2 * press;
      drawSolo(env, 'MB6', BALL.x, BALL.y + dy, MB_S, { pivot: [62, 86] });
      const mtx = BALL.x - 62 * MB_S, mty = BALL.y + dy - 86 * MB_S;
      shadeSprite(ctx, mp.img, mtx, mty, MB_S, 0.4, [150, 118, 255]);
      underLight(ctx, mp.img, mtx, mty, MB_S, BALL.x, BALL.y, 48, PAL.lilac, 0.55);
      rimLight(ctx, mp.img, mtx, mty, MB_S, [0, -1], 1, PAL.spot, 0.7);
      drawSoloFluoro(env, 'MB6', BALL.x, BALL.y + dy, MB_S, 0.22, { pivot: [62, 86] });
    }
    // The clamp's light splash on the turf at the ball's foot (SOLO's impact shape: filled light, never a ring).
    stage.splash(ctx, BALL.x, BALL.y + BALL.r, 8, 46, 0.2, CLAMP, t, 0.85);
    env.parts.draw(ctx, 1);
    env.parts.draw(ctx, 2);

    // ---- 3 · the near layers (a metre from the lens): the grass fringe and the two flinching defenders
    nearTransform(env, cm, t);
    drawFringe(ctx, t, -60 * u);
    // B (RIVAL_KIT_B tones do not matter in silhouette): his shielding arm at the left; A's leg and hip at the right.
    drawFg(ctx, 'RF4', 3.6, 1, 56 - 160 * u, 336);
    drawFg(ctx, 'RF1', 4.6, -1, 716 - 160 * u, 236);

    // ---- 4 · screen-space light: the beat's light rain and the clamp's rain round the ball
    env.screen();
    const [bsx, bsy] = toS(BALL.x, BALL.y);
    lightRain(ctx, HX, 420, 30, FAN, t, { life: 0.18, y0: -60, y1: 120, len0: 20, len1: 70, a: 0.7, seed: 31 });
    lightRain(ctx, bsx, 300, 40, CLAMP, t, { life: 0.2, y0: -60, y1: Math.max(10, bsy - 60), v0: 1600, v1: 600, decel: 0.12, len0: 40, len1: 110, seed: 33 });
    // The HUD: the four unlit pads (the four defenders to come).
    fourCount(ctx, padsFor(3), t);

    // ---- post
    soloStage(fx, { tint: [232, 224, 255], bloom: 1.05, vignette: 0.75 });
    fx.bloom += 0.1 * drumK(t, 0.12) + 0.08 * flare;
    fx.ca = Math.max(fx.ca, 0.004 * drumK(t, 0.1), t >= CRASH0 && t < END ? lerp(0.003, 0.01, clamp((t - CRASH0) / 0.2)) : 0, 0.012 * decay(t, CLAMP, 0.1));
    // Flat shocks along the turf: one per war drum at his feet, one at the ball's foot on the clamp.
    const [ux, uy] = env.cam.toUV(HX, FEET);
    DRUMS.forEach((d, i) => flatShockAt(fx, ux, uy, d, t, [0.02, 0.03, 0.025][i], 0.3, 0.4));
    const [cux, cuy] = env.cam.toUV(BALL.x, BALL.y + BALL.r);
    flatShockAt(fx, cux, cuy, CLAMP, t, 0.035, 0.3, 0.3);
    // The beat echo on the ONE: three violet copies rising off him (lighten only, a disc round him).
    const [eux, euy] = env.cam.toUV(HX, 200);
    echoAt(env, t, FAN, 3, 0.35, 0, { dy: -0.018, sx: eux * VW, sy: euy * VH, R: 0.5 });
    // The crash: a radial pull on the ball.
    if (t >= CRASH0 && t < CLAMP + 2 * FR) {
      fx.radialX = bsx / VW;
      fx.radialY = bsy / VH;
      // Building with the rush, at its peak over the swap, gone 2 frames after the clamp.
      fx.radial = 0.15 * (t < CLAMP ? Math.pow(clamp((t - CRASH0) / (SWAP - CRASH0)), 1.5) : 1 - clamp((t - CLAMP) / (2 * FR)));
    }
    // The whip-pan: streak along the move with a sharp hole on the ball until it leaves.
    if (t >= CLAMP) {
      const w = whipU(t);
      fx.streak = 0.07 * clamp(w * 3);
      fx.streakDX = -1;
      fx.streakDY = 0;
      fx.streakHoleX = bsx / VW;
      fx.streakHoleY = bsy / VH;
      fx.streakHoleR = 0.2;
    }
  },
};

/** Turf flecks and dust jumping off the turf round his feet on a war drum (they hang in the light at rate 0.35). */
function flecks(e: Env, n: number, power: number) {
  for (let i = 0; i < n; i++) {
    const x = HX + e.rng.range(-150, 150), y = FEET - e.rng.range(0, 10);
    e.parts.spawn({
      kind: PK.Pixel, x, y, vx: e.rng.range(-30, 30), vy: -e.rng.range(40, 150) * power, ay: 60, drag: 1.4, max: e.rng.range(1.0, 2.0),
      s0: e.rng.range(0.8, 2), s1: 0.6, ramp: i % 4 === 0 ? 'sod' : 'mote', r0: 0, r1: 0.9, a0: 0.9, a1: 0, add: i % 4 !== 0, layer: i % 3 ? 1 : 0,
    });
  }
}
