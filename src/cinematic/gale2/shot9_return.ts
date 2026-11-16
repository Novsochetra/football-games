// GALE HAMMER v2 · shot 9 · "Return the wind" (1.9 s, seed 319): the pose kids copy. SPEC.md §6 shot 9.
//
// Story job: pride, and the bookend of the grab. He grabbed the wind out of the stadium in shot 2; now he gives it back.
//   9a  THE BLOW (0.00-1.05). Front, low angle, waist-up: the WindHand bust at ×2 (head ~120 px) left of centre, the
//       west stand behind him thrown out of focus (a low-res render, so the floodlights and phone lights turn to bokeh),
//       the cloud lid above, flags still whipping, torn scarf strands and dew drifting down. The camera pushes
//       1.50 -> 1.62 and cranes down 10 px (we look up more).
//         0.00 WH4: the tail of shot 8's wind wipe leaves the frame right (shot 8 reveals this frame inside its wipe
//              with returnPlate()). His fist at his chest still holds the storm:
//              cyan light leaks between his knuckles and wisps escape. His hair, lifted all film, begins to fall.
//         0.12 WH4b: the fist trembles; the light in it swells.
//         0.25 WH5: the fist opens palm-up and the wind he grabbed spins up out of it as a mini tornado (72 px: 16
//              streak rings, two helices, a cyan core, vapour at its lip, 6 orbiting dew beads, an isobar ring on the
//              palm). A dew ring bursts off the palm; the tornado lights his face from below.
//         0.55 WH6: palm to his lips, cheeks puffed, eyes closed; the tornado leans away from his face.
//         0.62 THE BLOW: the tornado lifts off and flies at the lens at constant speed (×1.5 at 0.70, ×3.7 at 0.80, ×14
//              at 0.85), arcing under his chin, its axis turning toward us (rings -> circles), while his breath mist and
//              56 ice streaks rush past the lens; the pressure bubble bulges the lens, radial blur and CA build; the
//              camera is drawn in (zoom -> 1.70, 0.70 cam.hit 0.15, a buffet).
//         0.85 the gust slams the lens: its spiral streaks wrap past the frame edges, a vapour eye bursts outward, a
//              pressure ring, the camera is blown back (zoom 1.70 -> 1.52 'blowBack', a shove, gust + a wet boom).
//              WH7 (0.80): palm offered to us, chin up, a grin, clean from ~0.92 (the lens clears by 0.90).
//         1.03-1.20 the gust's tail sweeps left -> right as GALE's wind wipe, revealing 9b behind it.
//   9b  FOOTPRINTS OF AIR (1.05-1.90). The back view down the pitch (drawDownPitch, storm, the goal 2.8 m behind its
//       line, net domed 0.6): StandBack a/b ×2 on the right third, back-lit by the floodlights (navy veil, ice rims),
//       breathing every 0.2 s; the pressed wake runs on a diagonal from the bottom edge to the shoved goal with the
//       three air craters on it like stepping stones. The gust travels away from us down the wake (a translucent
//       whirl + a white streak band, ironing a bright band into the grass); each crater exhales a ring of dew mist as
//       it passes (1.20, 1.32, 1.44), its glow line flaring; the net flutters once at 1.52. Dew falls like snow through
//       two floodlight beams. The camera cranes up 12 px and zooms 1.00 -> 0.96. 1.25 the shared name card. 1.60-1.90
//       fade to [8,4,14] (the result view fades up from it).
//
// Composition note: the brief puts him in the foreground centre (feet y 330), but at the brief's view (x 845, z 266)
// the goal and the craters sit straight behind his ×2 back; he stands on the right third instead (x 448) and the eye
// sits 1.4 m to the right of the strike line (z 280), so the wake reads as a diagonal leading line to the goal. His
// feet are at y 270, just above the shared name card (top edge y 280), so the closing image keeps the whole figure.
//
// Photosensitivity: no full-frame events in this shot except the closing fade (fx.flash, one rising edge); the
// tornado's rings and the wipe are thin streaks (well under 50 % of any frame); shocks are local.
// Deterministic: module state reset in init(), env.rng only in update(), env.frng() in render(), one-shot spawns behind
// flags; every drawn shape, decal and camera value is a pure function of the shot clock (rate is 1 throughout).

import type { Env, Shot } from '../timeline';
import { Camera, VW, VH } from '../../engine/camera';
import { Rng, TAU, clamp, ease, lerp, type RGB } from '../../engine/math';
import { PK, drawGlow, glowOf, softSprite } from '../../engine/particles';
import { AIR_TONES } from '../../engine/audio';
import { focusLines } from '../../art/fx';
import { drawNo10, no10, no10Point, type No10Key } from '../../art/no10';
import { anim, drawAnim, findFrame, hasAnim, type StudioAnim } from '../../art/studioAnim';
import { FIELD, drawDownPitch, drawUpPitch, projectDecal, type DownPitchView } from '../../art/stadium';
import { holdTrauma, keys, nameCard, pushShock, ring, zoomAbout, type KeyRow } from '../kit';
import { BLINK, GOAL_SLIDE, HEX, MUFFLE, PAL, RATE, SEQ, SHOTS, SHOT_NAME, STAMPS, STRIKE, galeStorm, no10At, stormDarken, warmGale } from './common';
import { airCrater, windWipe } from './air';

const META = SHOTS[8];
const DUR = META.dur;
const FRAME = 1 / 60;

// ---------------------------------------------------------------- beats (shot-local t; rate 1)

const T_TREM = 0.12; // WH4b
const T_OPEN = 0.25; // WH5: the fist opens, the tornado spins up
const T_LIPS = 0.55; // WH6: palm to the lips
const T_BLOW = 0.62; // the blow: lift-off
const T_HIT = 0.7;
const T_GRIN = 0.8; // WH7
const T_LENS = 0.85; // the gust reaches the lens
const T_WIPE = 1.03; // the gust's tail: the wind wipe (WH7 holds clean ~0.90-1.03 before it)
const T_WIPE_END = 1.2;
const T_B = 1.05; // 9b's clock origin (the brief's times)
const T_CRATER = [1.2, 1.32, 1.44] as const;
const T_CARD = 1.25;
const T_FLUTTER = 1.52;
const T_FADE = 1.6;

const hash = (n: number) => {
  const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
};
const u01 = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const ICE = HEX.ice, CYAN = HEX.cyan, NAVY = HEX.navy;

// ---------------------------------------------------------------- 9a: the bust and its camera

/** WindHand studio scale (a bust at 2x figure scale: ×2 = a 4x figure close-up; ×2 × zoom 1.5 = 3 screen px / px). */
const SC = 2;
/** World position of the bust's chest (sternum) anchor. */
const CHEST: [number, number] = [320, 240];

/**
 * The push 1.50 -> 1.62, breathing with the air: a small pop in as the fist opens, drawn in toward the oncoming gust
 * (0.62-0.84), blown back as it passes the lens (0.85-0.97), settling onto 1.62 by the wipe.
 */
const ZOOM_A: readonly KeyRow[] = [
  [0, 1.5],
  [T_OPEN, 1.525, 'linear'],
  [T_OPEN + 0.08, 1.56, 'outCubic'],
  [T_BLOW, 1.57, 'linear'],
  [T_LENS - FRAME, 1.7, 'inQuad'],
  [0.97, 1.52, 'blowBack'],
  // After the blow-back, a slow hero push onto the grin (WH7) through the wipe.
  [1.2, 1.62, 'outCubic'],
];
/** The crane down of 10 px: the chest rises on screen 248 -> 238 (the bust's bottom edge stays below the frame). */
const CSY: readonly KeyRow[] = [[0, 248], [1.05, 238, 'inOutQuad']];
const CSX: readonly KeyRow[] = [[0, 258], [1.05, 262, 'linear']];

function frameCamA(env: Env, t: number) {
  zoomAbout(env.cam, CHEST[0], CHEST[1], keys(CSX, t), keys(CSY, t), keys(ZOOM_A, t));
}

/** World point of anchor `name` of WindHand frame `key` (the bust drawn with its chest on CHEST at SC). */
function anchorW(env: Env, key: No10Key, name: string): [number, number] {
  return no10Point(env, key, name, CHEST[0], CHEST[1], SC, { anchor: 'chest' });
}
/** World -> screen (with the camera's shake, shove and buffet). */
function toScreen(env: Env, w: [number, number]): [number, number] {
  const [u, v] = env.cam.toUV(w[0], w[1]);
  return [u * VW, v * VH];
}

// Anchors measured in init / prepare (world).
let P_FIST4: [number, number] = [308, 255];
let P_FIST4B: [number, number] = [310, 258];
let P_PALM5: [number, number] = [304, 266];
let P_PALM6: [number, number] = [304, 212];
let P_MOUTH6: [number, number] = [316, 192];
let P_PALM7: [number, number] = [280, 230];
function measure(env: Env) {
  P_FIST4 = anchorW(env, 'WH4', 'fist');
  P_FIST4B = anchorW(env, 'WH4b', 'fist');
  P_PALM5 = anchorW(env, 'WH5', 'palm');
  P_PALM6 = anchorW(env, 'WH6', 'palm');
  P_MOUTH6 = anchorW(env, 'WH6', 'mouth');
  P_PALM7 = anchorW(env, 'WH7', 'palm');
}

// ---------------------------------------------------------------- 9a: the bust's light (rims, the tornado's light, the fist)

const rimCache = new Map<string, HTMLCanvasElement>();
/** Edge pixels of frame i facing (dx, dy), solid colour c (the edge pixel full, the next one fainter). Cached. */
function rimOf(a: StudioAnim, i: number, dx: number, dy: number, c: RGB): HTMLCanvasElement {
  const key = `${a.name}|${i}|${dx},${dy}|${c.join(',')}`;
  let cv = rimCache.get(key);
  if (cv) return cv;
  const f = a.frames[i], w = a.w, h = a.h;
  cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const g = cv.getContext('2d')!;
  const im = g.createImageData(w, h);
  const op = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && f.px[(y * w + x) * 4 + 3] > 0;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (!op(x, y)) continue;
      // The bust's crop edges (bottom row, frame sides) never glow.
      if (y + dy >= h || x + dx < 0 || x + dx >= w) continue;
      const al = !op(x + dx, y + dy) ? 255 : !op(x + dx - dy, y + dy - dx) ? 150 : !op(x + 2 * dx, y + 2 * dy) ? 110 : 0;
      if (!al) continue;
      const o = (y * w + x) * 4;
      im.data[o] = c[0];
      im.data[o + 1] = c[1];
      im.data[o + 2] = c[2];
      im.data[o + 3] = al;
    }
  g.putImageData(im, 0, 0);
  rimCache.set(key, cv);
  return cv;
}

const gapCache = new Map<string, HTMLCanvasElement>();
/**
 * The light between his fingers: the dark interior lines of the fist (finger gaps, knuckle row, thumb line) within an
 * ellipse round art point (cx, cy), recoloured ice at the centre -> cyan at the rim. Interior only. Cached per frame.
 */
function gapOf(a: StudioAnim, i: number, cx: number, cy: number): HTMLCanvasElement {
  const key = `${a.name}|${i}|${cx},${cy}`;
  let cv = gapCache.get(key);
  if (cv) return cv;
  const f = a.frames[i], w = a.w, h = a.h;
  cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const g = cv.getContext('2d')!;
  const im = g.createImageData(w, h);
  const A = (x: number, y: number) => (x >= 0 && y >= 0 && x < w && y < h ? f.px[(y * w + x) * 4 + 3] : 0);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      if (!f.px[o + 3]) continue;
      const d = Math.hypot((x - cx) / 13, (y - cy) / 9);
      if (d > 1) continue;
      const L = f.px[o] * 0.3 + f.px[o + 1] * 0.59 + f.px[o + 2] * 0.11;
      if (L > 80 || !A(x + 1, y) || !A(x - 1, y) || !A(x, y + 1) || !A(x, y - 1)) continue;
      const c = d < 0.5 ? PAL.ice : PAL.cyan;
      im.data[o] = c[0];
      im.data[o + 1] = c[1];
      im.data[o + 2] = c[2];
      im.data[o + 3] = Math.round(255 * (1 - 0.6 * d * d));
    }
  g.putImageData(im, 0, 0);
  gapCache.set(key, cv);
  return cv;
}

let litCv: HTMLCanvasElement | null = null;
/** Frame i tinted c, masked by a radial falloff round art point (lx, ly) of radius r (the tornado lighting him). */
function litOf(a: StudioAnim, i: number, lx: number, ly: number, r: number, c: RGB): HTMLCanvasElement {
  if (!litCv || litCv.width !== a.w || litCv.height !== a.h) {
    litCv = document.createElement('canvas');
    litCv.width = a.w;
    litCv.height = a.h;
  }
  const g = litCv.getContext('2d')!;
  g.globalCompositeOperation = 'source-over';
  g.clearRect(0, 0, litCv.width, litCv.height);
  g.drawImage(a.tinted(i, c), 0, 0);
  g.globalCompositeOperation = 'destination-in';
  const gr = g.createRadialGradient(lx, ly, 0, lx, ly, r);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.45, 'rgba(255,255,255,0.45)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, litCv.width, litCv.height);
  g.globalCompositeOperation = 'source-over';
  return litCv;
}

/** Draw a derived 128 x 128 image of the bust exactly over it (its pivot on CHEST at SC), world space. */
function overlayBust(ctx: CanvasRenderingContext2D, img: HTMLCanvasElement, pivot: [number, number], alpha: number) {
  if (alpha <= 0.004) return;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = clamp(alpha);
  ctx.translate(CHEST[0], CHEST[1]);
  ctx.scale(SC, SC);
  ctx.drawImage(img, -pivot[0], -pivot[1]);
  ctx.restore();
}

// ---------------------------------------------------------------- 9a: the background (the west stand, out of focus)

/** The out-of-focus plate: the up-pitch stand rendered at 1/3 resolution and drawn up with smoothing (bokeh). */
const BG_W = 214, BG_H = 120;
let bgCv: HTMLCanvasElement | null = null;
function bgCanvas(): HTMLCanvasElement {
  if (!bgCv) {
    bgCv = document.createElement('canvas');
    bgCv.width = BG_W;
    bgCv.height = BG_H;
  }
  return bgCv;
}

/** The background lens: 4 m in front of him, 1.2 m up, looking west; the horizon low (the low angle). */
function viewA(env: Env, t: number): DownPitchView {
  const [ox, oy] = env.cam.screenOffset;
  const z = keys(ZOOM_A, t);
  // Parallax: the far stand drifts a third as far as the bust does under the crane and the push.
  const crane = keys(CSY, t) - 248;
  return { x: 905, z: 266, h: 12, f: 600 * Math.pow(z / 1.5, 0.35), horizon: 292 + crane * 0.3 + oy * 0.5, cx: 372 + ox * 0.5, dir: -1 };
}

/**
 * Flags whipping along the west stand's front (the wind dying: gust 1 -> 0.25). Drawn in screen space over the
 * upscaled plate (in the 1/3 plate they vanished): 2-3 px cloth at alpha 0.6, so they read as moving soft colour.
 */
function standFlags(ctx: CanvasRenderingContext2D, v: DownPitchView, t: number, gust: number) {
  const GZ = (FIELD.goalFar + FIELD.goalNear) / 2;
  const s = Math.max(0.6, projectDecal(40, GZ, 150, v).s);
  const ch = Math.max(2, Math.min(3, Math.round(4.4 * s)));
  for (let i = 0; i < 26; i++) {
    const z = GZ - 820 + i * 66 + hash(i * 3.1) * 30;
    const q = projectDecal(40, z, 120 + hash(i * 7.7) * 40, v);
    if (q.x < -40 || q.x > VW + 20) continue;
    const len = Math.round((9 + hash(i) * 6) * s * 1.6);
    const red = i % 4 !== 1;
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = '#1c1830';
    ctx.fillRect(Math.round(q.x), Math.round(q.y - 2 * s), 1, Math.round(10 * s));
    ctx.globalAlpha = 0.6;
    for (let k = 0; k < len; k++) {
      const ph = t * (8 + gust * 14) - k * 0.55 + i;
      const yy = q.y + Math.sin(ph) * (0.6 + gust * 2) * (k / len) - 2 * s + (1 - gust) * (k / len) * 3;
      ctx.fillStyle = red ? (k % 5 < 3 ? '#c8202e' : '#e8e8f0') : '#3a52c8';
      ctx.fillRect(Math.round(q.x + 1 + k), Math.round(yy), 1, ch);
    }
  }
  ctx.globalAlpha = 1;
}

function drawBackA(env: Env, t: number) {
  const ctx = env.ctx;
  const v = viewA(env, t);
  const gust = lerp(1, 0.25, u01(t, 0, 1.05));
  const cv = bgCanvas();
  const g = cv.getContext('2d')!;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = HEX.stormNavy;
  g.fillRect(0, 0, BG_W, BG_H);
  g.setTransform(BG_W / VW, 0, 0, BG_H / VH, 0, 0);
  g.imageSmoothingEnabled = true;
  drawUpPitch(g, env.art.stadium, v, t, { storm: 1, ambientFlashes: false });
  stormDarken(g, 0.3);
  // Torn scarf strands drift in the plate (after the darken, so they keep their colour; the upscale blurs them).
  drawStrands(g, t, gust);
  env.screen();
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(cv, 0, 0, BG_W, BG_H, -2, -2, VW + 4, VH + 4);
  ctx.restore();
  env.screen();
  standFlags(ctx, v, t, gust);
  drawBokehA(env, t, v);
}

/** Floodlight and phone-light bokeh: soft discs with a faint rim, cool white; the tower lamps glare in the top corners. */
function drawBokehA(env: Env, t: number, v: DownPitchView) {
  const ctx = env.ctx;
  const GZ = (FIELD.goalFar + FIELD.goalNear) / 2;
  ctx.globalCompositeOperation = 'lighter';
  for (const side of [-1, 1]) {
    // A floodlight bank seen out of focus: a 5 x 3 grid of lamp discs on a cold halo, an anamorphic flare through it
    // (a lamp head, never a lone round disc).
    const L = projectDecal(-20, GZ + side * 520, 312, v);
    if (L.x < -120 || L.x > VW + 120) continue;
    const fl = 0.93 + 0.07 * Math.sin(t * 23 + side);
    drawGlow(ctx, glowOf([60, 100, 200]), L.x, L.y, 210, 0.2 * fl, 1.3, 0.75);
    drawGlow(ctx, glowOf([150, 200, 255]), L.x, L.y, 70, 0.22 * fl, 1.5, 0.75);
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 5; c++) {
        const x = L.x + (c - 2) * 15 + r * 2, y = L.y + (r - 1) * 13;
        drawGlow(ctx, glowOf([214, 236, 255]), x, y, 9, 0.5 * fl * (0.8 + 0.2 * hash(r * 5 + c)));
        drawGlow(ctx, glowOf([255, 255, 255]), x, y, 3.5, 0.7 * fl);
      }
    drawGlow(ctx, glowOf([110, 200, 255]), L.x, L.y, 40, 0.5 * fl, 9, 0.06);
  }
  // The far tower, just off frame right, glares through the storm haze over the stand and the cloud lid.
  {
    const fl = 0.95 + 0.05 * Math.sin(t * 19 + 2);
    drawGlow(ctx, glowOf([50, 84, 176]), VW + 30, 70, 330, 0.3 * fl, 1.1, 1);
    drawGlow(ctx, glowOf([120, 176, 255]), VW + 10, 54, 90, 0.18 * fl, 1.6, 0.8);
  }
  // Roof lights along the stand's lip and phone lights in the crowd: discs of 6-24 px.
  const roof = projectDecal(40, GZ, 168, v), base = projectDecal(40, GZ, 20, v);
  for (let i = 0; i < 34; i++) {
    const isRoof = i < 10;
    const x = isRoof ? 20 + i * 66 + hash(i * 5.3) * 30 : hash(i * 2.7) * VW;
    const y = isRoof ? roof.y + 4 + hash(i * 1.9) * 6 : lerp(roof.y + 16, base.y, hash(i * 4.1));
    const r = isRoof ? 10 + hash(i * 3.3) * 8 : 3 + hash(i * 6.1) * 6;
    const tw = 0.75 + 0.25 * Math.sin(t * (3 + hash(i) * 4) + i);
    const a = 1.6 * (isRoof ? 0.3 : 0.16 + 0.2 * hash(i * 8.8)) * tw;
    const c: RGB = hash(i * 9.4) < 0.7 ? [200, 228, 255] : [255, 240, 214];
    drawGlow(ctx, glowOf(c), x, y, r, a);
    if (r > 8) {
      ctx.globalAlpha = a * 0.25;
      ctx.strokeStyle = 'rgb(220,240,255)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.62, 0, TAU);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

/**
 * Four torn scarf strands drifting down behind him (red / white bands, 3-4 px wide, 24-40 px long, rippling and
 * tumbling), the wind dying. Drawn into the 1/3 plate in screen units, so the upscale blurs them. A pure function of t.
 */
function drawStrands(ctx: CanvasRenderingContext2D, t: number, gust: number) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let i = 0; i < 4; i++) {
    const L = 24 + hash(i * 3.7) * 16;
    const wd = 3 + hash(i * 8.3);
    const x0 = ((i + 0.15 + 0.7 * hash(i * 1.3)) * (VW + 80)) / 4, y0 = 20 + hash(i * 2.9) * 150;
    const x = ((x0 + t * (30 + 40 * gust) * (0.6 + hash(i * 6.6))) % (VW + 80)) - 40 + Math.sin(t * 2.3 + i) * 10;
    const y = y0 + t * (18 + hash(i * 4.4) * 16);
    const rot = hash(i * 7.1) * TAU + t * (1.2 + hash(i * 5.5) * 1.6) * (i % 2 ? 1 : -1);
    const c = Math.cos(rot), s = Math.sin(rot);
    const pt = (k: number): [number, number] => {
      const wv = Math.sin(t * 9 + k * 0.22 + i) * 3 * (0.4 + 0.6 * k / L);
      return [x + c * (k - L / 2) - s * wv, y + s * (k - L / 2) + c * wv];
    };
    const N = 6;
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = wd;
    for (let b = 0; b < N; b++) {
      ctx.strokeStyle = b % 2 ? '#d4d8e6' : '#b01e2c';
      ctx.beginPath();
      for (let q = 0; q <= 3; q++) {
        const [px, py] = pt(((b + q / 3) * L) / N);
        q ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
}

/** Dew drifting down (tiny glints behind him; big soft drops in front when `front`). Screen space, a pure function. */
function drawDew(ctx: CanvasRenderingContext2D, t: number, front: boolean, push = 0) {
  ctx.globalCompositeOperation = 'lighter';
  const n = front ? 9 : 46;
  for (let i = 0; i < n; i++) {
    const sd = i + (front ? 500 : 0);
    const sp = front ? 26 + hash(sd * 3.1) * 20 : 10 + hash(sd * 3.1) * 16;
    let x = hash(sd * 1.7) * (VW + 60) - 30 + Math.sin(t * 1.3 + i) * 6;
    let y = ((hash(sd * 2.3) * 420 + t * sp) % 420) - 30;
    if (push > 0) {
      // The gust flings the drops outward from the lens's centre.
      const dx = x - VW / 2, dy = y - VH / 2;
      x += dx * push;
      y += dy * push;
    }
    if (front) {
      const r = 6 + hash(sd * 4.7) * 9;
      const a = 0.1 + 0.1 * hash(sd * 5.9);
      drawGlow(ctx, glowOf([200, 236, 255]), x, y, r, a);
      ctx.globalAlpha = a * 0.6;
      ctx.strokeStyle = 'rgb(220,244,255)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.55, 0, TAU);
      ctx.stroke();
    } else {
      const tw = 0.5 + 0.5 * Math.sin(t * (6 + hash(sd) * 6) + i * 1.7);
      ctx.globalAlpha = (0.25 + 0.5 * tw) * (0.5 + 0.5 * hash(sd * 6.3));
      ctx.fillStyle = i % 5 ? ICE : CYAN;
      const q = hash(sd * 8.2) < 0.25 ? 2 : 1;
      ctx.fillRect(Math.round(x), Math.round(y), q, q);
    }
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

/** The tail of shot 8's wind wipe (windWipe's streaks at p = 1, same hashes) leaving the frame right. */
function drawWipeTail(ctx: CanvasRenderingContext2D, t: number) {
  if (t >= 0.1) return;
  const u = t / 0.1;
  const lead = VW + 260 + 1500 * u * u;
  for (let i = 0; i < 60; i++) {
    const y = Math.round(hash(i * 3.7) * VH);
    const hgt = 2 + Math.floor(hash(i * 5.9) * 5);
    const len = 80 + hash(i * 1.3) * 220;
    const lag = hash(i * 8.1) * 160;
    const x0 = lead - lag - len;
    if (x0 > VW) continue;
    ctx.globalAlpha = 0.5 * (1 - u);
    ctx.fillStyle = NAVY;
    ctx.fillRect(Math.round(x0) - 2, y - 1, Math.round(len) + 4, hgt + 2);
    ctx.globalAlpha = 0.9 * (1 - u * 0.5);
    ctx.fillStyle = i % 4 ? ICE : '#ffffff';
    ctx.fillRect(Math.round(x0), y, Math.round(len), hgt);
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- the tornado (9a's palm tornado, 9b's gust)

interface Twister {
  /** Base of the axis (screen). */
  x: number;
  y: number;
  /** Axis length (screen px). */
  H: number;
  /** Ring aspect ry / rx (0.28 side-on -> ~0.9 axis-on). */
  asp: number;
  /** Axis lean (radians; + = top toward screen right). */
  lean: number;
  /** Axis foreshortening (1 upright, -> 0.35 pointing at the lens). */
  vs: number;
  a: number;
  /** Line width scale. */
  w: number;
  /** Phase (radians). */
  spin: number;
  /** Draw its own navy halo and ambient light (the palm tornado; off for the far gust). */
  halo: boolean;
  /** Approach factor (1 at rest): the soft layers (core, vapour, sheath) thin out as it fills the frame. */
  k?: number;
  /** The touch point at its base (1 while it spins on the palm; 0 once it has lifted off). */
  touch?: number;
  /** Scales the core glow (kept low while it passes in front of his face). */
  core?: number;
}

const RINGS_N = 16;
function axisPt(tw: Twister, u: number, t: number): [number, number] {
  const L = u * tw.H * tw.vs;
  const bend = Math.sin(t * 5.3 + u * 3.1) * u * tw.H * 0.07 * tw.vs;
  return [tw.x + Math.sin(tw.lean) * L + Math.cos(tw.lean) * bend, tw.y - Math.cos(tw.lean) * L + Math.sin(tw.lean) * bend];
}
const ringR = (tw: Twister, u: number) => tw.H * (0.045 + 0.42 * Math.pow(u, 1.5));

/**
 * A tornado of air: 16 streak rings (3 arcs each) round a bending axis widening upward, two climbing helices, a cyan
 * core, vapour at its lip, 6 orbiting dew beads and an isobar ring at its base. Back halves before the core, front
 * halves (ice, over navy under-strokes) after. Screen space; additive layers are ice / cyan only.
 */
function drawTwister(ctx: CanvasRenderingContext2D, tw: Twister, t: number) {
  if (tw.a <= 0.01 || tw.H <= 1) return;
  const a = tw.a;
  const mid = axisPt(tw, 0.5, t);
  const lw = Math.max(1, tw.w);
  const soft = 1 / Math.max(1, tw.k ?? 1);
  if (tw.halo) {
    // A navy pocket (it keeps the funnel the hottest thing over his red shirt), then its own cold light.
    ctx.globalCompositeOperation = 'source-over';
    drawGlow(ctx, glowOf(PAL.navy), mid[0], mid[1], Math.min(tw.H * 0.7, 260), 0.6 * a, 0.9, 1.1);
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.cyan), mid[0], mid[1], Math.min(tw.H * 0.62, 240), 0.12 * a * Math.sqrt(soft));
    // A storm-navy pocket in the funnel's own shape (normal blend): the additive ice / cyan then reads ice-cyan on
    // dark, never pink over his red shirt. It thins as the tornado nears the lens.
    ctx.globalCompositeOperation = 'source-over';
    // REV2-A: soft per-ring navy discs (shaped like each ring) instead of a hard-edged triangle, so the pocket never
    // reads as a dark paper cone and follows the rings as the axis turns toward the lens (asp -> 0.9, vs -> 0.32).
    const pa = 0.5 * a * Math.min(1, soft * 1.6);
    for (let s = 0; s <= 10; s++) {
      const u = s / 10;
      const [cx, cy] = axisPt(tw, u, t);
      const r = ringR(tw, u) * 1.2 + 3;
      drawGlow(ctx, glowOf(PAL.stormNavy), cx, cy, r * 1.3, pa, 1, Math.max(0.5, tw.asp * 1.3));
    }
    // Vapour mass inside the funnel (three soft blobs along the axis).
    for (let k = 0; k < 3; k++) {
      const u = 0.3 + 0.27 * k;
      const [cx, cy] = axisPt(tw, u, t);
      const r = ringR(tw, u) * 1.1 + 3;
      ctx.globalAlpha = 0.18 * a * Math.min(1, soft * 1.6);
      ctx.drawImage(softSprite('vapor', 0.2), cx - r, cy - r * 0.8, r * 2, r * 1.6);
    }
    ctx.globalAlpha = 1;
  }
  // The funnel's body: a translucent vapour sheath between its edges (additive ice, thinning as it nears the lens).
  {
    const L: number[] = [], R: number[] = [];
    for (let s = 0; s <= 12; s++) {
      const u = s / 12;
      const [cx, cy] = axisPt(tw, u, t);
      const r = ringR(tw, u) * 0.96;
      const nx = Math.cos(tw.lean), ny = Math.sin(tw.lean);
      L.push(cx - nx * r, cy - ny * r);
      R.push(cx + nx * r, cy + ny * r);
    }
    const [bx0, by0] = axisPt(tw, 0, t), [bx1, by1] = axisPt(tw, 1, t);
    const g = ctx.createLinearGradient(bx0, by0, bx1, by1);
    g.addColorStop(0, `rgba(238,251,255,${0.26 * a * soft * (0.5 + 0.5 * (tw.touch ?? 1))})`);
    g.addColorStop(0.5, `rgba(150,225,255,${0.16 * a * soft})`);
    g.addColorStop(1, `rgba(120,200,255,${0.05 * a * soft})`);
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(L[0], L[1]);
    for (let i = 2; i < L.length; i += 2) ctx.lineTo(L[i], L[i + 1]);
    for (let i = R.length - 2; i >= 0; i -= 2) ctx.lineTo(R[i], R[i + 1]);
    ctx.closePath();
    ctx.fill();
  }
  // Arcs: [back pass, front pass].
  const arcs = (front: boolean) => {
    ctx.beginPath();
    for (let i = 0; i < RINGS_N; i++) {
      const u = (i + 0.5) / RINGS_N;
      const [cx, cy] = axisPt(tw, u, t);
      const rx = ringR(tw, u), ry = rx * tw.asp;
      for (let j = 0; j < 3; j++) {
        const th0 = tw.spin * (1.35 - 0.55 * u) + (j * TAU) / 3 + i * 0.83;
        const len = 1.1 + 0.7 * hash(i * 3 + j * 7.3);
        let pen = false;
        for (let q = 0; q <= 8; q++) {
          const th = th0 + (len * q) / 8;
          const isFront = Math.sin(th) >= 0;
          if (isFront !== front) {
            pen = false;
            continue;
          }
          const x = cx + Math.cos(th) * rx, y = cy + Math.sin(th) * ry;
          if (pen) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
          pen = true;
        }
      }
    }
  };
  const helix = (front: boolean) => {
    ctx.beginPath();
    for (let h = 0; h < 2; h++) {
      let pen = false;
      for (let s = 0; s <= 44; s++) {
        const u = s / 44;
        const th = u * TAU * 2.6 + tw.spin * 1.1 + h * Math.PI;
        const isFront = Math.sin(th) >= 0;
        if (isFront !== front) {
          pen = false;
          continue;
        }
        const [cx, cy] = axisPt(tw, u, t);
        const r = ringR(tw, u) * 0.92;
        const x = cx + Math.cos(th) * r, y = cy + Math.sin(th) * r * tw.asp;
        if (pen) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
        pen = true;
      }
    }
  };
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // Back halves: dim cyan.
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.32 * a;
  ctx.strokeStyle = CYAN;
  ctx.lineWidth = lw;
  arcs(false);
  ctx.stroke();
  ctx.globalAlpha = 0.22 * a;
  helix(false);
  ctx.stroke();
  // The core: a cyan column and an ice thread along the axis.
  drawGlow(ctx, glowOf(PAL.cyan), mid[0], mid[1], Math.min(70, tw.H * 0.2 * Math.max(0.5, tw.vs)), 0.5 * a * soft * (tw.core ?? 1), 0.75, 1.7);
  ctx.globalAlpha = 0.6 * a * Math.sqrt(soft);
  ctx.strokeStyle = ICE;
  ctx.lineWidth = Math.max(1, lw * 0.8);
  ctx.beginPath();
  for (let s = 0; s <= 10; s++) {
    const [x, y] = axisPt(tw, s / 10 * 0.85, t);
    s ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
  // Vapour at the lip (normal blend, soft white).
  ctx.globalCompositeOperation = 'source-over';
  for (let k = 0; k < 7; k++) {
    const u = 0.62 + 0.38 * hash(k * 2.1);
    const th = tw.spin * 0.9 + k * 0.9;
    const [cx, cy] = axisPt(tw, u, t);
    const r = ringR(tw, u);
    const s = r * (0.45 + 0.35 * hash(k * 4.4));
    ctx.globalAlpha = 0.16 * a * soft;
    ctx.drawImage(softSprite('vapor', 0.15 + 0.3 * hash(k)), cx + Math.cos(th) * r - s, cy + Math.sin(th) * r * tw.asp - s * 0.6, s * 2, s * 1.2);
  }
  // Front halves: navy under-strokes, then ice / cyan.
  ctx.globalAlpha = 0.32 * a;
  ctx.strokeStyle = NAVY;
  ctx.lineWidth = lw + 2;
  arcs(true);
  ctx.stroke();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.85 * a;
  ctx.strokeStyle = ICE;
  ctx.lineWidth = lw;
  ctx.stroke();
  ctx.globalAlpha = 0.6 * a;
  ctx.strokeStyle = CYAN;
  helix(true);
  ctx.stroke();
  // Dew beads orbiting it.
  for (let b = 0; b < 6; b++) {
    const u = 0.22 + 0.12 * b;
    const th = tw.spin * 1.6 + (b * TAU) / 6;
    const [cx, cy] = axisPt(tw, u, t);
    const r = ringR(tw, u) + 3 * lw;
    const fr = Math.sin(th) >= 0;
    const q = Math.max(2, Math.round(2 * lw));
    ctx.globalAlpha = (fr ? 1 : 0.45) * a;
    ctx.fillStyle = fr ? '#ffffff' : ICE;
    ctx.fillRect(Math.round(cx + Math.cos(th) * r - q / 2), Math.round(cy + Math.sin(th) * r * tw.asp - q / 2), q, q);
  }
  // The isobar ring and the touch point at its base.
  const [bx, by] = axisPt(tw, 0, t);
  const br = tw.H * 0.17 * (1 + 0.08 * Math.sin(t * 17));
  ctx.globalAlpha = 0.6 * a;
  ctx.strokeStyle = CYAN;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(bx, by, br, br * Math.max(0.25, tw.asp), tw.lean * 0.5, 0, TAU);
  ctx.stroke();
  drawGlow(ctx, glowOf(PAL.ice), bx, by, 5 * lw + 3, 0.8 * a * soft * (tw.touch ?? 1));
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
}

// ---------------------------------------------------------------- 9a: where the palm tornado is

/** Screen pose of the palm tornado at t (null before the fist opens or after it has passed the lens). */
function tornadoAt(env: Env, t: number): (Twister & { k: number; cx: number; cy: number }) | null {
  if (t < T_OPEN || t > 0.99) return null;
  const spin = -t * 26;
  const p5 = toScreen(env, P_PALM5), p6 = toScreen(env, P_PALM6);
  const z = env.cam.zoom / 1.5;
  const H0 = 72 * z;
  if (t < T_BLOW) {
    // On the palm: spin-up (outBack), breathing; on WH6 it moves to the lips' palm in 2 frames and leans away.
    const up = ease.outBack(u01(t, T_OPEN, T_OPEN + 0.12));
    const toLips = u01(t, T_LIPS, T_LIPS + 2 * FRAME);
    const x = lerp(p5[0], p6[0] - 6, toLips), y = lerp(p5[1], p6[1], toLips);
    const H = H0 * up * (1 + 0.04 * Math.sin(t * 13)) * lerp(1, 0.92, toLips);
    const lean = lerp(-0.08 + 0.05 * Math.sin(t * 7), -0.62, ease.outCubic(u01(t, T_LIPS, T_BLOW)));
    const tw: Twister = { x, y, H, asp: 0.28, lean, vs: 1, a: clamp(up * 1.4), w: 2, spin, halo: true, k: 1, core: lerp(1, 0.5, toLips) };
    const m = axisPt(tw, 0.5, t);
    return { ...tw, k: 1, cx: m[0], cy: m[1] };
  }
  // The flight at the lens: a constant-speed approach (size ~ 1 / distance: ×1.5 at 0.70, ×2.1 at 0.75, ×3.7 at 0.80,
  // ×14 at 0.85), visibly rushing at us from the first frame; then on past the lens (k -> 34) as it fades.
  const u = u01(t, T_BLOW, T_LENS);
  const e = u;
  const k = t <= T_LENS ? 1 / (1 - 0.93 * e) : 14.3 * (1 + 12 * (t - T_LENS));
  const H = H0 * 0.92 * k;
  // REV2-C: the axis swings to the lens right after lift-off (rings -> circles early), so it reads as aimed at us.
  const asp = lerp(0.28, 0.9, ease.outQuad(clamp(u * 1.1)));
  const vs = lerp(1, 0.32, ease.outQuad(u));
  const lean = lerp(-0.62, 0.1, ease.outQuad(u));
  // Its axis centre arcs down under his chin (never across the blowing face), rising to the lens's centre-right.
  const c0x = p6[0] - 6 + Math.sin(-0.62) * H0 * 0.46, c0y = p6[1] - Math.cos(-0.62) * H0 * 0.46;
  const cx = lerp(c0x, 404, ease.inOutSine(u));
  const cy = lerp(c0y, 190, ease.outCubic(u)) + 30 * Math.sin(Math.PI * Math.min(1, u * 1.25));
  const L = H * vs * 0.5;
  const x = cx - Math.sin(lean) * L, y = cy + Math.cos(lean) * L;
  // Past the lens it is gone in 5 frames (WH7's grin must read clean).
  const a = t <= T_LENS ? 1 : clamp(1 - (t - T_LENS) / 0.08);
  const touch = 1 - u01(t, T_BLOW, T_BLOW + 0.05);
  // The core stays dim while it passes his chin and mouth.
  const core = lerp(0.35, 1, u01(t, T_BLOW + 0.08, T_BLOW + 0.14));
  return { x, y, H, asp, lean, vs, a, w: Math.min(5, 1.2 * Math.pow(k, 0.55)), spin, halo: true, k, touch, core, cx, cy };
}

/** The air rushing past the lens ahead of the gust: 56 ice / cyan streaks flung outward from the tornado's centre. */
function drawRush(ctx: CanvasRenderingContext2D, t: number, cx: number, cy: number) {
  const s0 = T_BLOW + 0.04;
  if (t < s0 || t > 0.97) return;
  const fade = clamp((t - s0) / 0.06) * (1 - clamp((t - 0.88) / 0.09));
  if (fade <= 0) return;
  ctx.lineCap = 'round';
  for (let i = 0; i < 56; i++) {
    const th = hash(i * 1.71) * TAU;
    const per = 0.32 + 0.18 * hash(i * 4.4);
    const ph = ((t - s0) / per + hash(i * 3.3)) % 1;
    const r = (30 + 40 * hash(i * 5.7)) * Math.exp(ph * 3.3);
    const r1 = r * (1.14 + 0.1 * hash(i * 7.7));
    const w = 1 + 3 * ph;
    const al = fade * Math.sin(Math.PI * ph) * (0.55 + 0.4 * hash(i * 2.2));
    if (al <= 0.02) continue;
    const c = Math.cos(th), s = Math.sin(th);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.4 * al;
    ctx.strokeStyle = NAVY;
    ctx.lineWidth = w + 2;
    ctx.beginPath();
    ctx.moveTo(cx + c * r, cy + s * r);
    ctx.lineTo(cx + c * r1, cy + s * r1);
    ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = al;
    ctx.strokeStyle = i % 3 ? ICE : CYAN;
    ctx.lineWidth = w;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.lineCap = 'butt';
}

/**
 * The blow (0.62-0.84): a vapour ring puffed off his lips that widens toward the lens along the gust's path (GALE's
 * torus language, small), with a 3-frame burst of ice lines from his mouth. Screen space, a pure function of t.
 */
function drawBlowRing(ctx: CanvasRenderingContext2D, t: number, mx: number, my: number) {
  if (t < T_BLOW || t > T_BLOW + 0.22) return;
  const q = (t - T_BLOW) / 0.22;
  const e = ease.outCubic(q);
  const cx = lerp(mx + 10, 404, e * 0.55), cy = lerp(my, 190, e * 0.55);
  const rx = lerp(6, 190, e), ry = rx * lerp(0.5, 0.8, e);
  const a = (1 - q) * (1 - q);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 0.35 * a;
  ctx.strokeStyle = NAVY;
  ctx.lineWidth = 4 + 6 * e;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, -0.2, 0, TAU);
  ctx.stroke();
  for (let j = 0; j < 16; j++) {
    const th = (j / 16) * TAU + q * 1.5;
    const sz = (4 + 14 * e) * (0.7 + 0.5 * hash(j * 3.3));
    ctx.globalAlpha = 0.22 * a;
    ctx.drawImage(softSprite('vapor', 0.1 + 0.3 * hash(j)), cx + Math.cos(th) * rx - sz, cy + Math.sin(th) * ry - sz * 0.6, sz * 2, sz * 1.2);
  }
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.85 * a;
  ctx.strokeStyle = ICE;
  ctx.lineWidth = 1.5 + 1.5 * e;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, -0.2, 0, TAU);
  ctx.stroke();
  ctx.globalAlpha = 0.5 * a;
  ctx.strokeStyle = CYAN;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx * 0.82, ry * 0.82, -0.2, 0, TAU);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

/** The gust hitting the lens (0.85-0.97): an ice bloom where it lands and a ring of vapour flung out past the edges. */
function drawVaporEye(ctx: CanvasRenderingContext2D, t: number, cx: number, cy: number) {
  const q = u01(t, T_LENS, T_LENS + 0.12);
  if (q >= 1) return;
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.ice), cx, cy, 160, 0.35 * (1 - q));
  ctx.globalCompositeOperation = 'source-over';
  const R = lerp(120, 420, ease.outCubic(q));
  for (let j = 0; j < 18; j++) {
    const th = (j / 18) * TAU + 0.6 * q + 0.25 * hash(j * 1.3);
    const rr = R * (0.85 + 0.3 * hash(j * 2.3));
    const sz = (34 + 70 * q) * (0.7 + 0.6 * hash(j * 3.9));
    ctx.globalAlpha = 0.5 * (1 - q) * (0.7 + 0.3 * hash(j * 5.1));
    ctx.drawImage(softSprite('vapor', 0.12 + 0.3 * hash(j * 1.7)), cx + Math.cos(th) * rr - sz, cy + Math.sin(th) * rr * 0.8 - sz * 0.7, sz * 2, sz * 1.4);
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- 9a render

function drawBust(env: Env, key: No10Key, t: number, tor: ReturnType<typeof tornadoAt>) {
  const ctx = env.ctx;
  const f = no10(key);
  // Cold backlight behind his head and shoulders (the floodlights through the storm).
  const head = f ? anchorW(env, key, 'head') : [CHEST[0], CHEST[1] - 110];
  ctx.globalCompositeOperation = 'lighter';
  // A wide cold backlight wash (the stand's floodlights through the storm) that lifts the murk round him.
  drawGlow(ctx, glowOf([40, 80, 170]), head[0] + 30, head[1] + 60, 380, 0.38, 1.7, 0.9);
  drawGlow(ctx, glowOf(PAL.cyan), head[0] + 6, head[1] + 24, 150, 0.14);
  ctx.globalCompositeOperation = 'source-over';
  drawNo10(env, key, CHEST[0], CHEST[1], SC, { anchor: 'chest' });
  if (!f) return;
  const pivot = f.a.anchorOf(f.i, 'chest');
  ctx.globalCompositeOperation = 'lighter';
  overlayBust(ctx, rimOf(f.a, f.i, 1, 0, PAL.cyan), pivot, 0.5);
  overlayBust(ctx, rimOf(f.a, f.i, -1, 0, PAL.ice), pivot, 0.26);
  overlayBust(ctx, rimOf(f.a, f.i, 0, -1, PAL.ice), pivot, 0.2);
  // The storm still in his fist (WH4 / WH4b): light leaking between the knuckles, swelling toward the opening.
  if (t < T_OPEN) {
    const fa = f.a.frames[f.i].anchors.fist ?? f.a.frames[f.i].anchors.palm;
    if (fa) {
      const fl = 0.85 + 0.15 * env.frng(3).next();
      const swell = 0.7 + 0.3 * ease.inQuad(t / T_OPEN);
      overlayBust(ctx, gapOf(f.a, f.i, fa[0], fa[1]), pivot, swell * fl);
      if (t > 0.17) overlayBust(ctx, gapOf(f.a, f.i, fa[0], fa[1]), pivot, u01(t, 0.17, T_OPEN));
      overlayBust(ctx, litOf(f.a, f.i, fa[0] + 0.5, fa[1] - 4, 34, PAL.cyan), pivot, 0.2 * swell * fl);
      const fw = no10Point(env, key, 'fist', CHEST[0], CHEST[1], SC, { anchor: 'chest' });
      drawGlow(ctx, glowOf(PAL.cyan), fw[0], fw[1], 34, 0.22 * swell * fl);
    }
  }
  // The tornado lights him from below (WH5 / WH6), then the gust's cold wash as it passes the lens.
  if (tor && t < T_LENS + 0.1) {
    // Its core in art space: invert the bust transform from screen.
    const z = env.cam.zoom * SC;
    const [csx, csy] = toScreen(env, CHEST);
    const lx = pivot[0] + (tor.cx - csx) / z, ly = pivot[1] + (tor.cy - csy) / z;
    const fl = 0.88 + 0.12 * env.frng(4).next();
    const near = t < T_BLOW ? 1 : 1 - u01(t, T_BLOW, T_BLOW + 0.15);
    const onFace = key === 'WH6' ? 0.3 : 1;
    if (near > 0) overlayBust(ctx, litOf(f.a, f.i, lx, ly, 44, PAL.cyan), pivot, 0.36 * fl * near * tor.a * onFace);
    // ...and his chin and cheeks from below while he holds it (WH5, WH6); gone within 2 frames of the blow, so the
    // puffed cheeks and O-mouth read clean.
    const chin = t < T_BLOW ? 1 : 1 - u01(t, T_BLOW, T_BLOW + 2 * FRAME);
    if (chin > 0 && (key === 'WH5' || key === 'WH6')) {
      const hd = f.a.anchorOf(f.i, 'head');
      // WH6 holds the tornado beside his face (its own light already reaches the cheek), so the under-light is lower.
      overlayBust(ctx, litOf(f.a, f.i, hd[0], hd[1] + 18, 30, PAL.cyan), pivot, (key === 'WH6' ? 0.1 : 0.22) * fl * chin * tor.a);
    }
  }
  if (t >= T_BLOW + 0.1 && t < 1.05) {
    const wash = Math.sin(Math.PI * u01(t, T_BLOW + 0.1, 1.0));
    overlayBust(ctx, f.a.tinted(f.i, PAL.cyan), pivot, 0.1 * wash);
  }
  ctx.globalCompositeOperation = 'source-over';
}

/** 9a. `plate`: the clean still for shot 8's reveal (no particles, no wipe tail, no wipe, no post). */
function renderA(env: Env, t: number, plate = false) {
  const { ctx, fx } = env;
  frameCamA(env, t);
  const key = no10At(SEQ[9], Math.min(t, 1.04));
  const tor = tornadoAt(env, t);

  // 1. The out-of-focus stand (strands in its plate, flags and bokeh over it) and dew behind him.
  drawBackA(env, t);
  env.screen();
  drawDew(ctx, t, false, t > T_BLOW ? 0.5 * ease.inQuad(u01(t, T_BLOW, 0.95)) : 0);

  // 2. The bust and its light.
  env.world();
  drawBust(env, key, t, tor);
  if (!plate) env.parts.draw(ctx, 0);

  // 3. The fist opening: ice focus lines burst off the palm for 4 frames.
  env.screen();
  if (t >= T_OPEN && t < T_OPEN + 4 * FRAME) {
    const [px, py] = toScreen(env, P_PALM5);
    ctx.globalCompositeOperation = 'lighter';
    focusLines(ctx, env.frng(11), px, py - 20, 40, 320, 60, ICE, 0.32 * (1 - (t - T_OPEN) / (4 * FRAME)) + 0.1, 3);
    ctx.globalCompositeOperation = 'source-over';
  }

  // 4. The tornado, the air rushing past the lens, the particles in front.
  if (tor) drawTwister(ctx, tor, t);
  // 0.85 the gust slams the lens: a vapour eye (an ice bloom where it hits, 18 vapour blobs flung out past the frame
  // edges). Local and soft: never an fx.flash, so the FlashBudget is unchanged.
  if (tor && t >= T_LENS && t < T_LENS + 0.12) drawVaporEye(ctx, t, tor.cx, tor.cy);
  if (tor && t >= T_BLOW) drawRush(ctx, t, tor.cx, tor.cy);
  if (t >= T_BLOW && t < T_BLOW + 0.23) {
    const [mx, my] = toScreen(env, P_MOUTH6);
    drawBlowRing(ctx, t, mx, my);
    if (t < T_BLOW + 3 * FRAME) {
      // The burst starts outside his face (70 px out), so the puffed cheeks and O-mouth stay readable.
      ctx.globalCompositeOperation = 'lighter';
      focusLines(ctx, env.frng(17), mx + 6, my, 70, 300, 36, ICE, 0.18 * (1 - (t - T_BLOW) / (3 * FRAME)) + 0.05, 2);
      ctx.globalCompositeOperation = 'source-over';
    }
  }
  env.world();
  if (!plate) env.parts.draw(ctx, 1);
  env.screen();
  drawDew(ctx, t, true, t > T_BLOW ? 1.2 * ease.inQuad(u01(t, T_BLOW, 0.97)) : 0);

  // 5. Ground fog at the bottom edge; shot 8's wipe tail; the wipe into 9b.
  const fog = ctx.createLinearGradient(0, VH - 60, 0, VH);
  fog.addColorStop(0, 'rgba(6,11,36,0)');
  fog.addColorStop(1, 'rgba(6,11,36,0.45)');
  ctx.fillStyle = fog;
  ctx.fillRect(0, VH - 60, VW, 60);
  if (plate) return;
  drawWipeTail(ctx, t);
  if (t >= T_WIPE) {
    const q = u01(t, T_WIPE, T_WIPE_END);
    const pw = 0.25 + 0.75 * q;
    const lead = lerp(-260, VW + 260, ease.inOutQuad(clamp(pw)));
    // The reveal edge trails the streak front and clears the frame at the end of the wipe.
    const edge = lerp(lead - 380, lead + 140, ease.inQuad(q));
    if (edge > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, Math.min(VW, edge), VH);
      ctx.clip();
      renderB(env, t, false);
      ctx.restore();
    }
    env.screen();
    windWipe(ctx, pw, 1);
  }

  // 6. Post.
  galeStorm(fx);
  fx.sat = 0.96;
  fx.vignette = 0.6;
  // REV2-B: no post smear on the first frames (shot 8's returnPlate is sharp; a smear here blurs the cut for 4 frames).
  if (t >= T_OPEN && t < T_OPEN + 0.2) {
    const q = (t - T_OPEN) / 0.2;
    const [px, py] = toScreen(env, P_PALM5);
    pushShock(fx, { x: px / VW, y: (py - 20) / VH, r: 0.32 * ease.outCubic(q), s: 0.022 * (1 - q) });
    fx.ca = 0.0012 + 0.005 * (1 - q);
    fx.bloom = 1.0 + 0.2 * (1 - q);
  }
  if (tor && t >= T_BLOW && t < 0.98) {
    const u = u01(t, T_BLOW, T_LENS);
    // The lens clears by 0.90, so WH7's grin reads clean before the wipe.
    const out = u01(t, T_LENS, 0.9);
    const k = ease.inQuad(u) * (1 - out);
    fx.lens = 0.28 * k;
    fx.lensR = lerp(0.14, 0.6, u);
    fx.lensX = tor.cx / VW;
    fx.lensY = tor.cy / VH;
    fx.radial = 0.05 * k;
    fx.radialX = tor.cx / VW;
    fx.radialY = tor.cy / VH;
    fx.ca = 0.0012 + 0.008 * k;
    // His skin must not bloom out under the lens bulge as the gust arrives.
    fx.bloomThresh = 0.62 + 0.1 * k;
  }
  if (t >= T_LENS && t < T_LENS + 0.32) {
    const q = (t - T_LENS) / 0.32;
    pushShock(fx, { x: 404 / VW, y: 190 / VH, r: 1.45 * ease.outCubic(q), s: 0.036 * (1 - q) });
  }
  if (t >= T_WIPE) {
    // The wipe's own smear (horizontal), as the gust's tail sweeps across.
    const q = u01(t, T_WIPE, T_WIPE_END);
    // It starts as the streaks enter the frame (q ~ 0.1), so the held grin is not smeared before the wipe arrives.
    fx.streak = Math.max(fx.streak, 0.014 * Math.sin(Math.PI * clamp((q - 0.1) / 0.9))); // REV2-D (was 0.035)
    fx.streakDX = 1;
    fx.streakDY = 0;
    fx.streakHoleR = 0;
    if (t >= 1.06) {
      // The first look at 9b: the gust whirl (crater 1) stays crisp inside a sharp hole that rides on it.
      const vB = viewB(projB(env, t, false));
      const gx = keys(GUST_X, t), gz = wakeZ(Math.min(gx, WAKE_X1));
      const b = projectDecal(gx, gz, 0, vB), tp = projectDecal(gx, gz, 22, vB);
      fx.streakHoleX = b.x / VW;
      fx.streakHoleY = (b.y + tp.y) / 2 / VH;
      fx.streakHoleR = clamp(((b.y - tp.y) * 0.62 + 12) / VH, 0.1, 0.34);
    }
  }
}

// ---------------------------------------------------------------- 9b: footprints of air (the back view down the pitch)

/** The eye: 3.5 m behind the strike, 1.4 m up, 1.4 m right of the strike line (the wake reads as a diagonal). */
const EYE_B = { x: 845, z: 280, h: 14, f: 560, horizon: 150, cx: 320 } as const;
/** No.10 (StandBack ×2), the right third: his contact anchor in comp space (the feet just above the name card's top
 *  edge, y 280, so the closing image keeps his boots; his head rises above the horizon). */
const HERO_B: [number, number] = [448, 270];
/** The camera: crane up 12 px, zoom 1.00 -> 0.96 over 9b (comp space = screen at the start). */
function camB(t: number): { z: number; cy: number } {
  const u = ease.inOutQuad(u01(t, T_B, DUR));
  return { z: lerp(1, 0.96, u), cy: VH / 2 - 12 * u };
}
function frameCamB(env: Env, t: number) {
  const c = camB(t);
  zoomAbout(env.cam, VW / 2, c.cy, VW / 2, VH / 2, c.z);
}
interface Proj { z: number; cx: number; cy: number; sx: number; sy: number }
function projB(env: Env, t: number, main: boolean): Proj {
  const c = camB(t);
  if (main) {
    const cam = env.cam;
    const [u, v] = cam.toUV(cam.x, cam.y);
    return { z: cam.zoom, cx: cam.x, cy: cam.y, sx: u * VW, sy: v * VH };
  }
  return { z: c.z, cx: VW / 2, cy: c.cy, sx: VW / 2, sy: VH / 2 };
}
const PX = (p: Proj, x: number) => p.sx + (x - p.cx) * p.z;
const PY = (p: Proj, y: number) => p.sy + (y - p.cy) * p.z;
function viewB(p: Proj): DownPitchView {
  return { x: EYE_B.x, z: EYE_B.z, h: EYE_B.h, f: EYE_B.f * p.z, horizon: PY(p, EYE_B.horizon), cx: PX(p, EYE_B.cx) };
}

/** The wake's centre line: from the strike to the far top corner (z 266 -> 224), as the field's result view. */
const WAKE_X0: number = STRIKE.x, WAKE_X1: number = FIELD.goalX - 4;
const wakeZ = (x: number) => lerp(STRIKE.z, 224, (x - WAKE_X0) / (WAKE_X1 - WAKE_X0));
const wakeW = (x: number) => lerp(6, 14, clamp((x - WAKE_X0) / (WAKE_X1 - WAKE_X0)));

/** The gust's front (field x) on its way down the wake: past each crater at 1.20 / 1.32 / 1.44, the net at 1.52. */
const GUST_X: readonly KeyRow[] = [
  [1.06, 846], [T_CRATER[0], STAMPS[0].x, 'outQuad'], [T_CRATER[1], STAMPS[1].x, 'linear'], [T_CRATER[2], STAMPS[2].x, 'linear'],
  [T_FLUTTER, FIELD.goalX + GOAL_SLIDE + 14, 'linear'],
];

/** The pressed wake in the down view: a pale combed V band, the dark groove, comb chevrons, an ironed band at the gust. */
function drawWakeB(ctx: CanvasRenderingContext2D, v: DownPitchView, t: number, gx: number) {
  const N = 26;
  const xs: number[] = [];
  for (let i = 0; i <= N; i++) xs.push(lerp(WAKE_X0 + 2, WAKE_X1, Math.pow(i / N, 1.6)));
  const band = (k: number, x0: number = WAKE_X0, x1: number = WAKE_X1) => {
    ctx.beginPath();
    let first = true;
    for (const x of xs) {
      if (x < x0 || x > x1) continue;
      const q = projectDecal(x, wakeZ(x) - wakeW(x) * k, 0, v);
      first ? ctx.moveTo(q.x, q.y) : ctx.lineTo(q.x, q.y);
      first = false;
    }
    for (let i = xs.length - 1; i >= 0; i--) {
      const x = xs[i];
      if (x < x0 || x > x1) continue;
      const q = projectDecal(x, wakeZ(x) + wakeW(x) * k, 0, v);
      ctx.lineTo(q.x, q.y);
    }
    ctx.closePath();
  };
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = HEX.pressed;
  band(1);
  ctx.fill();
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = HEX.pressedCore;
  band(0.22);
  ctx.fill();
  // Comb chevrons raking back along the V.
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = 'rgb(214,248,200)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 1; i < 40; i++) {
    const x = lerp(WAKE_X0 + 6, WAKE_X1 - 8, Math.pow(i / 40, 1.5));
    const w = wakeW(x);
    for (const side of [-1, 1]) {
      const a = projectDecal(x, wakeZ(x) + side * w * 0.3, 0, v), b = projectDecal(x - w * 0.9, wakeZ(x) + side * w * 0.85, 0, v);
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
    }
  }
  ctx.stroke();
  // The ironed band: the gust presses the grass flat again as it passes (a bright sheen just behind its front).
  if (gx > WAKE_X0) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = 'rgb(200,240,232)';
    band(1.1, Math.max(WAKE_X0, gx - 46), Math.min(WAKE_X1, gx + 4));
    ctx.fill();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = CYAN;
    band(0.5, Math.max(WAKE_X0, gx - 18), Math.min(WAKE_X1, gx + 2));
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
  // Dew-mist walls along its edges.
  for (let i = 2; i < N; i += 2) {
    const x = xs[i];
    for (const side of [-1, 1]) {
      const q = projectDecal(x, wakeZ(x) + side * wakeW(x) * 1.05, 0, v);
      const s = 3 + wakeW(x) * q.s * 0.35;
      ctx.globalAlpha = 0.16 * (0.6 + 0.4 * Math.sin(t * 5 + i));
      ctx.drawImage(softSprite('vapor', 0.25), q.x - s, q.y - s * 1.2, s * 2, s * 1.4);
    }
  }
  ctx.globalAlpha = 1;
}

/** The three craters, and each one's exhale (a rising, widening ring of dew mist; its glow line flaring). */
function drawCratersB(ctx: CanvasRenderingContext2D, v: DownPitchView, t: number) {
  STAMPS.forEach((s, i) => {
    const R = s.id === 3 ? 20 : 13;
    const p = projectDecal(s.x, s.z, 0, v);
    const age = t - T_CRATER[i];
    const k = Math.max(0.1, p.k);
    // The crater (old: its glow cooled), re-lit as the gust passes.
    airCrater(ctx, p.x, p.y, R * p.s, k, 2, 3, 0.9);
    const flare = age >= 0 ? Math.exp(-age * 5) : 0;
    if (flare > 0.01) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.9 * flare;
      ctx.strokeStyle = CYAN;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, R * p.s * 0.72, R * p.s * 0.72 * k, 0, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 0.7 * flare;
      ctx.strokeStyle = ICE;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, R * p.s * 0.4, R * p.s * 0.4 * k, 0, 0, TAU);
      ctx.stroke();
      drawGlow(ctx, glowOf(PAL.cyan), p.x, p.y, R * p.s * 1.3, 0.35 * flare, 1, Math.max(0.25, k * 1.6));
      ctx.globalCompositeOperation = 'source-over';
    }
    // The exhale: a ring of dew mist rising 2.5 m and widening ×2.4 over 0.55 s.
    if (age >= 0 && age < 0.5) {
      const q = age / 0.5;
      const h = 11 * ease.outCubic(q);
      const rr = R * (0.85 + 1.0 * ease.outCubic(q));
      const c = projectDecal(s.x, s.z, h, v);
      const kk = Math.max(0.12, Math.abs(c.k) + 0.06);
      const rx = rr * c.s, ry = rx * kk;
      const al = Math.sin(Math.PI * Math.min(1, q * 1.6)) * (1 - q * 0.5);
      ctx.globalCompositeOperation = 'source-over';
      for (let j = 0; j < 14; j++) {
        const th = (j / 14) * TAU + age * 3;
        const sz = rx * 0.32 * (0.7 + 0.5 * hash(i * 9 + j));
        ctx.globalAlpha = 0.3 * al;
        ctx.drawImage(softSprite('vapor', 0.1 + 0.3 * hash(j)), c.x + Math.cos(th) * rx - sz, c.y + Math.sin(th) * ry - sz * 0.5, sz * 2, sz);
      }
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.55 * al;
      ctx.strokeStyle = ICE;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, rx, ry, 0, 0, TAU);
      ctx.stroke();
      // Dew flung up off the crater's rim, glinting.
      for (let j = 0; j < 10; j++) {
        const th = hash(i * 13 + j * 1.9) * TAU;
        const sp = 14 + 18 * hash(j * 3.3 + i);
        const hh = sp * age * 2.2 - 40 * age * age;
        if (hh < 0) continue;
        const d = projectDecal(s.x + Math.cos(th) * (R + sp * age), s.z + Math.sin(th) * (R + sp * age), hh, v);
        ctx.globalAlpha = 0.9 * (1 - q);
        ctx.fillStyle = j % 3 ? ICE : CYAN;
        ctx.fillRect(Math.round(d.x), Math.round(d.y), 2, 2);
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  });
  ctx.globalAlpha = 1;
}

/** The gust going away from us down the wake: a white streak band in perspective and its whirl at the front. */
function drawGustB(ctx: CanvasRenderingContext2D, v: DownPitchView, t: number, gx: number) {
  if (t < 1.06 || t > T_FLUTTER + 0.2) return;
  const out = clamp((t - T_FLUTTER) / 0.2);
  const a0 = clamp((t - 1.06) / 0.05) * (1 - out);
  if (a0 <= 0) return;
  // The streak band: 26 streaks trailing the front, low over the wake.
  ctx.lineCap = 'round';
  for (let i = 0; i < 26; i++) {
    const lag = 4 + hash(i * 3.1) * 50, len = 30 + hash(i * 5.3) * 70;
    const x1 = Math.min(gx - lag, FIELD.goalX + GOAL_SLIDE), x0 = Math.max(904, x1 - len);
    if (x1 <= x0 + 4) continue;
    const dz = (hash(i * 7.7) * 2 - 1) * (wakeW(x1) + 4), h = 1 + hash(i * 9.1) * 16;
    const p0 = projectDecal(x0, wakeZ(x0) + dz, h, v), p1 = projectDecal(x1, wakeZ(x1) + dz, h, v);
    const w = Math.max(1, Math.min(4, 0.35 * p1.s));
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.3 * a0;
    ctx.strokeStyle = NAVY;
    ctx.lineWidth = w + 2;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = (0.45 + 0.4 * hash(i)) * a0;
    ctx.strokeStyle = i % 4 ? ICE : CYAN;
    ctx.lineWidth = w;
    ctx.stroke();
  }
  ctx.lineCap = 'butt';
  // The whirl at the front: a 3 m tornado of air shrinking with distance.
  const gz = wakeZ(Math.min(gx, WAKE_X1));
  const base = projectDecal(gx, gz, 0, v), top = projectDecal(gx, gz, 22, v);
  const H = base.y - top.y;
  const gtw: Twister = { x: base.x, y: base.y, H, asp: 0.3, lean: 0.06, vs: 1, a: 0.75 * a0, w: Math.max(1, Math.min(2.2, H / 70)), spin: -t * 30, halo: false, k: 1 };
  // Vapour mass round its axis (it reads as a body of air, not a wire).
  ctx.globalCompositeOperation = 'source-over';
  for (let j = 0; j < 4; j++) {
    const u = 0.15 + 0.25 * j;
    const [cx, cy] = axisPt(gtw, u, t);
    const r = ringR(gtw, u) * 1.3 + 4;
    ctx.globalAlpha = 0.2 * a0;
    ctx.drawImage(softSprite('vapor', 0.2), cx - r, cy - r * 0.7, r * 2, r * 1.4);
  }
  ctx.globalAlpha = 1;
  drawTwister(ctx, gtw, t);
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.cyan), base.x, base.y - H * 0.4, H * 0.55, 0.16 * a0, 0.8, 1.2);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}

/**
 * Flags along the far stand's front, whipping in a wave left -> right as the gust reaches the goal (the stadium feels
 * its wind come home), then settling. Drawn after the darken in dimmed colours.
 */
function farFlags(ctx: CanvasRenderingContext2D, v: DownPitchView, t: number) {
  const GZ = (FIELD.goalFar + FIELD.goalNear) / 2, X = FIELD.goalX + 90;
  for (let i = 0; i < 22; i++) {
    const z = GZ - 430 + i * 41 + hash(i * 2.3) * 12;
    const q = projectDecal(X, z, 26 + hash(i * 5.1) * 6, v);
    if (q.x < -30 || q.x > VW + 30) continue;
    const ph = t - (T_FLUTTER - 0.06) - (q.x / VW) * 0.22;
    const whip = 0.25 + 1.4 * (ph > 0 ? clamp(ph / 0.06) * Math.exp(-ph * 3) : 0);
    const len = Math.round(8 * q.s * 1.3);
    const red = i % 3 !== 1;
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = '#141024';
    ctx.fillRect(Math.round(q.x), Math.round(q.y - 2), 1, Math.round(9 * q.s));
    for (let k = 0; k < len; k++) {
      const yy = q.y + Math.sin(t * (9 + 10 * whip) - k * 0.6 + i) * whip * 1.6 * (k / len) - 1;
      ctx.fillStyle = red ? (k % 5 < 3 ? '#7c1c2a' : '#9aa0b8') : '#2a3a86';
      ctx.fillRect(Math.round(q.x + 1 + k), Math.round(yy), 1, Math.max(2, Math.round(2.4 * q.s)));
    }
  }
  ctx.globalAlpha = 1;
}

/** One volumetric floodlight beam (additive) from (x0, y0) to a ground ellipse round (x1, y1). */
function beam(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, w0: number, w1: number, a: number) {
  const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1;
  const nx = -dy / l, ny = dx / l;
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, `rgba(214,236,255,${a * 2})`);
  g.addColorStop(0.5, `rgba(170,214,255,${a})`);
  g.addColorStop(1, 'rgba(120,180,255,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x0 + nx * w0, y0 + ny * w0);
  ctx.lineTo(x1 + nx * w1, y1 + ny * w1);
  ctx.lineTo(x1 - nx * w1, y1 - ny * w1);
  ctx.lineTo(x0 - nx * w0, y0 - ny * w0);
  ctx.closePath();
  ctx.fill();
}
const BEAMS = [
  { x0: -60, y0: -40, x1: 250, y1: 230, w0: 14, w1: 110 },
  { x0: 720, y0: -50, x1: 330, y1: 210, w0: 14, w1: 120 },
] as const;

/** Dew falling like snow through the floodlights (brighter inside the beams). Screen space, a pure function. */
function drawSnowB(ctx: CanvasRenderingContext2D, t: number) {
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 80; i++) {
    const sp = 18 + hash(i * 3.9) * 30;
    const x = hash(i * 1.37) * (VW + 40) - 20 + Math.sin(t * 1.7 + i * 0.7) * 5;
    const y = ((hash(i * 2.71) * 400 + t * sp) % 400) - 20;
    let lit = 0.25;
    for (const b of BEAMS) {
      const dx = b.x1 - b.x0, dy = b.y1 - b.y0, l2 = dx * dx + dy * dy;
      const u = clamp(((x - b.x0) * dx + (y - b.y0) * dy) / l2);
      const d = Math.hypot(x - (b.x0 + dx * u), y - (b.y0 + dy * u));
      if (d < lerp(b.w0, b.w1, u)) lit = Math.max(lit, 1 - 0.4 * u);
    }
    const tw = 0.6 + 0.4 * Math.sin(t * (5 + hash(i) * 5) + i);
    ctx.globalAlpha = lit * tw;
    ctx.fillStyle = i % 6 ? ICE : CYAN;
    // Drops inside the beams are 2 px (snow through the floodlights).
    const q = lit > 0.5 ? 2 : 1;
    ctx.fillRect(Math.round(x), Math.round(y), q, q);
  }
  // A few big out-of-focus flakes near the lens.
  for (let i = 0; i < 6; i++) {
    const x = hash(i * 9.3 + 2) * VW + Math.sin(t + i) * 8;
    const y = ((hash(i * 4.9 + 1) * 420 + t * 40) % 420) - 30;
    drawGlow(ctx, glowOf([200, 236, 255]), x, y, 7 + hash(i * 2.2) * 6, 0.12);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

/** No.10 from behind, back-lit: the figure, a navy veil (the floodlights are in front of him), ice rims, his hair lit. */
function drawHeroB(env: Env, p: Proj, t: number) {
  const ctx = env.ctx;
  const x = PX(p, HERO_B[0]), y = PY(p, HERO_B[1]), s = SC * p.z;
  // Contact shadow.
  ctx.globalAlpha = 0.5;
  drawGlow(ctx, glowOf([4, 6, 18]), x, y, 54 * p.z, 0.55, 1, 0.16);
  ctx.globalAlpha = 1;
  const breath = Math.floor((t - T_B) / 0.2) % 2;
  if (hasAnim('StandBack')) {
    const a = anim('StandBack');
    const i = Math.max(0, findFrame(a, breath ? 'b' : 'a', 'a'));
    const piv = a.anchorOf(i, 'contact');
    drawAnim(ctx, a, null, i, x, y, s, { pivot: piv });
    drawAnim(ctx, a, a.tinted(i, PAL.navy), i, x, y, s, { pivot: piv, alpha: 0.5 });
    ctx.globalCompositeOperation = 'lighter';
    drawAnim(ctx, a, rimOf(a, i, -1, 0, PAL.ice), i, x, y, s, { pivot: piv, alpha: 0.8 });
    drawAnim(ctx, a, rimOf(a, i, 1, 0, PAL.ice), i, x, y, s, { pivot: piv, alpha: 0.8 });
    drawAnim(ctx, a, rimOf(a, i, 0, -1, PAL.cyan), i, x, y, s, { pivot: piv, alpha: 0.85 });
    ctx.globalCompositeOperation = 'source-over';
  } else {
    // Fallback while StandBack is missing: the library's back-lit stand-in (never the puppet).
    drawNo10(env, breath ? 'Sb' : 'Sa', x, y, s);
  }
}

function renderB(env: Env, t: number, main: boolean) {
  const { ctx, fx } = env;
  if (main) frameCamB(env, t);
  const p = projB(env, t, main);
  const v = viewB(p);
  env.screen();
  ctx.fillStyle = HEX.stormNavy;
  ctx.fillRect(0, 0, VW, VH);
  // The net flutters once as the gust reaches it (bulge 0.6 -> ~0.9 -> 0.6, never past the 1.0 cap).
  const fa = t - T_FLUTTER;
  const bulge = fa > 0 ? 0.6 + 0.32 * Math.exp(-fa * 7) * Math.sin(fa * TAU * 4.5) : 0.6;
  drawDownPitch(ctx, env.art.stadium, v, t, { storm: 1, goalSlide: GOAL_SLIDE, bulge: clamp(bulge, 0.3, 1), ambientFlashes: false });
  stormDarken(ctx, 0.42);
  farFlags(ctx, v, t);
  // The floodlight beams falling across the pitch.
  ctx.globalCompositeOperation = 'lighter';
  for (const b of BEAMS) beam(ctx, PX(p, b.x0), PY(p, b.y0), PX(p, b.x1), PY(p, b.y1), b.w0 * p.z, b.w1 * p.z, 0.075);
  ctx.globalCompositeOperation = 'source-over';

  const gx = keys(GUST_X, t);
  drawWakeB(ctx, v, t, t >= 1.06 ? gx : 0);
  drawCratersB(ctx, v, t);
  // The goal catches the gust: a cyan glint runs along the crossbar, a vapour puff out of the back of the net.
  if (fa > -0.02 && fa < 0.4) {
    const GZ = (FIELD.goalFar + FIELD.goalNear) / 2, gxl = FIELD.goalX + GOAL_SLIDE;
    const l = projectDecal(gxl, GZ - 37, 24, v), r = projectDecal(gxl, GZ + 37, 24, v);
    const q = clamp((fa + 0.02) / 0.3);
    const gxp = lerp(l.x, r.x, q);
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.cyan), gxp, l.y, 14, 0.8 * (1 - q));
    drawGlow(ctx, glowOf(PAL.ice), gxp, l.y, 5, 1 - q, 2.5, 0.6);
    const n = projectDecal(gxl + 26, GZ - 14, 12, v);
    const pu = clamp(fa / 0.4);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.35 * Math.sin(Math.PI * pu);
    const sz = 10 + 30 * pu;
    ctx.drawImage(softSprite('vapor', 0.2), n.x - sz, n.y - sz * 0.6, sz * 2, sz * 1.2);
    ctx.globalAlpha = 1;
  }
  drawGustB(ctx, v, t, gx);
  drawHeroB(env, p, t);
  drawSnowB(ctx, t);
  // Ground fog at the bottom edge (it seats the card).
  const fog = ctx.createLinearGradient(0, VH - 90, 0, VH);
  fog.addColorStop(0, 'rgba(6,11,36,0)');
  fog.addColorStop(1, 'rgba(6,11,36,0.5)');
  ctx.fillStyle = fog;
  ctx.fillRect(0, VH - 90, VW, 90);
  if (!main) return;

  // The wipe's last streaks leave the frame right (windWipe's hashes, past p = 1).
  if (t < T_WIPE_END + 0.1) {
    const u = u01(t, T_WIPE_END, T_WIPE_END + 0.1);
    const lead = VW + 260 + 1500 * u * u;
    for (let i = 0; i < 60; i++) {
      const y = Math.round(hash(i * 3.7) * VH);
      const hgt = 2 + Math.floor(hash(i * 5.9) * 5);
      const len = 80 + hash(i * 1.3) * 220;
      const x0 = lead - hash(i * 8.1) * 160 - len;
      if (x0 > VW) continue;
      ctx.globalAlpha = 0.5 * (1 - u);
      ctx.fillStyle = NAVY;
      ctx.fillRect(Math.round(x0) - 2, y - 1, Math.round(len) + 4, hgt + 2);
      ctx.globalAlpha = 0.9 * (1 - u * 0.5);
      ctx.fillStyle = i % 4 ? ICE : '#ffffff';
      ctx.fillRect(Math.round(x0), y, Math.round(len), hgt);
    }
    ctx.globalAlpha = 1;
  }
  if (t >= T_CARD) nameCard(ctx, t - T_CARD, { title: SHOT_NAME, line2: 'No.10  ·  SPECIAL SHOT', score: 'CAM 1 - 0 RIV', style: 'gale' });

  // Post.
  galeStorm(fx);
  fx.vignette = 0.62;
  fx.sat = 0.95;
  // The gust's pull down the wake (a faint radial toward its whirl), then a small pressure ring at the net.
  if (t >= 1.08 && t < T_FLUTTER + 0.1) {
    const gz = wakeZ(Math.min(gx, WAKE_X1));
    const g = projectDecal(gx, gz, 12, v);
    fx.radial = 0.018 * Math.sin(Math.PI * u01(t, 1.08, T_FLUTTER + 0.1));
    fx.radialX = g.x / VW;
    fx.radialY = g.y / VH;
  }
  if (fa >= 0 && fa < 0.35) {
    const GZ = (FIELD.goalFar + FIELD.goalNear) / 2;
    // REV2-E: the ring sits behind the net and stays small, so the shoved frame stands rigid (only the net flutters).
    const n = projectDecal(FIELD.goalX + GOAL_SLIDE + 40, GZ, 12, v);
    const q = fa / 0.35;
    pushShock(fx, { x: n.x / VW, y: n.y / VH, r: 0.18 * ease.outCubic(q), s: 0.007 * (1 - q) });
  }
  T_CRATER.forEach((at, i) => {
    const age = t - at;
    if (age < 0 || age > 0.3) return;
    const s = STAMPS[i];
    const c = projectDecal(s.x, s.z, 0, v);
    pushShock(fx, { x: c.x / VW, y: c.y / VH, r: (0.05 + 0.45 * ease.outCubic(age / 0.3)) * (i === 0 ? 1 : 0.6), s: 0.012 * (1 - age / 0.3) * (i === 2 ? 0.4 : 1) });
  });
  // The fade to [8,4,14] (the result view fades up from it): one rising edge, the shot's only full-frame event.
  if (t >= T_FADE) {
    fx.flash = ease.inQuad(u01(t, T_FADE, DUR));
    fx.flashColor = BLINK.fade;
  }
}

// ---------------------------------------------------------------- shot 8's reveal plate

let plateCv: HTMLCanvasElement | null = null;
/**
 * Shot 9's first frame (9a at t = 0: the bust, the stand, the dew; no particles, no wipe tail, no post) as a cached
 * VW x VH canvas, built once in prepare() (lazily if asked earlier). Shot 8 draws it inside its wind wipe's clip, so
 * the 8 -> 9 cut is a true wipe: `const edge = windWipe(ctx, p); clip to [0, edge); drawImage(returnPlate(env), 0, 0);
 * windWipe(ctx, p)` (the streaks on top). Rendered with its own camera and a fixed flicker seed: deterministic, and the
 * live env (ctx, cam, fx, particles) is never touched.
 */
export function returnPlate(env: Env): HTMLCanvasElement {
  if (plateCv) return plateCv;
  measure(env);
  const c = document.createElement('canvas');
  c.width = VW;
  c.height = VH;
  const g = c.getContext('2d')!;
  const cam = new Camera();
  cam.shakeRoll = 0.012;
  const e2: Env = {
    ...env,
    ctx: g,
    S: 1,
    cam,
    frng: (salt = 0) => new Rng((salt * 104729) | 0),
    screen: () => {
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.imageSmoothingEnabled = false;
    },
    world: () => {
      cam.apply(g, 1);
      g.imageSmoothingEnabled = false;
    },
  };
  g.fillStyle = HEX.stormNavy;
  g.fillRect(0, 0, VW, VH);
  renderA(e2, 0, true);
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';
  plateCv = c;
  return c;
}

// ---------------------------------------------------------------- module state (reset in init)

let opened = false;
let blown = false;
let wispAcc = 0;

// ---------------------------------------------------------------- the shot

export const shotReturn: Shot = {
  name: META.name,
  dur: DUR,
  seed: META.seed,
  rate: RATE[9],
  muffle: MUFFLE[9],
  cues: [
    {
      at: 0,
      fn: (e) => {
        e.sfx.roar(2.0, 0.5);
        e.sfx.crowd(2.0, 0.3);
        e.cam.shakeAmp = 8;
        e.cam.shakeRoll = 0.012;
      },
    },
    // The fist opens: the gust with a whirl (the tornado spinning up).
    {
      at: T_OPEN,
      fn: (e) => {
        e.sfx.gust(0.4, 0.15);
        e.sfx.whoosh(0.4, 380, 1500, 0.12);
        e.cam.shove(0, 3);
      },
    },
    // The blow: breath and the motif's last statement, one blown chord.
    {
      at: T_BLOW,
      fn: (e) => {
        e.sfx.breath(0.6);
        e.sfx.airTone(AIR_TONES.G5, 0.15);
        e.sfx.airTone(AIR_TONES.B5, 0.15);
        e.sfx.airTone(AIR_TONES.D6, 0.15);
        e.cam.buffet(1.4, 10);
      },
    },
    { at: T_HIT, fn: (e) => e.cam.hit(0.15) },
    // The gust slams the lens: it blows the camera back. A wet, low-gain boom (No.10's hits at 1.3+ stay far bigger).
    {
      at: T_LENS,
      fn: (e) => {
        e.sfx.whoosh(0.3, 2000, 400);
        e.sfx.gust(0.5, 0.3);
        e.sfx.boom(0.4, 0.9);
        e.cam.buffet(0);
        e.cam.shove(8, -14);
      },
    },
    { at: T_WIPE, fn: (e) => e.sfx.whoosh(0.18, 700, 2600, 0.16) },
    ...T_CRATER.map((at) => ({ at, fn: (e: Env) => e.sfx.whoosh(0.2, 600, 200, 0.12) })),
    { at: T_CARD, fn: (e) => e.sfx.stinger() },
    { at: 1.5, fn: (e) => e.sfx.whistle() },
  ],

  prepare(env) {
    warmGale();
    measure(env);
    // Rim, gap and tint caches for every frame the shot shows (no allocation on the first play).
    for (const k of ['WH4', 'WH4b', 'WH5', 'WH6', 'WH7'] as No10Key[]) {
      const f = no10(k);
      if (!f) continue;
      rimOf(f.a, f.i, 1, 0, PAL.cyan);
      rimOf(f.a, f.i, -1, 0, PAL.ice);
      rimOf(f.a, f.i, 0, -1, PAL.ice);
      f.a.tinted(f.i, PAL.cyan);
      const fa = f.a.frames[f.i].anchors.fist;
      if (fa) gapOf(f.a, f.i, fa[0], fa[1]);
    }
    if (hasAnim('StandBack')) {
      const a = anim('StandBack');
      for (const n of ['a', 'b']) {
        const i = findFrame(a, n);
        if (i < 0) continue;
        a.tinted(i, PAL.navy);
        rimOf(a, i, -1, 0, PAL.ice);
        rimOf(a, i, 1, 0, PAL.ice);
        rimOf(a, i, 0, -1, PAL.cyan);
      }
    }
    bgCanvas();
    plateCv = null;
    returnPlate(env);
  },

  init(env) {
    env.sfx.clearBus();
    env.cam.set(VW / 2, VH / 2, 1, 0);
    env.cam.shakeRoll = 0.012;
    measure(env);
    opened = false;
    blown = false;
    wispAcc = 0;
    frameCamA(env, 0);
  },

  update(env, t, dt) {
    const rng = env.rng;
    if (t < T_WIPE_END) frameCamA(env, t);
    else frameCamB(env, t);
    // WH4 / WH4b: wisps of the held storm escaping between his knuckles.
    if (t < T_OPEN) {
      wispAcc += dt * (18 + 40 * (t / T_OPEN));
      const [fx0, fy0] = t < T_TREM ? P_FIST4 : P_FIST4B;
      while (wispAcc >= 1) {
        wispAcc -= 1;
        const a = -Math.PI / 2 + rng.range(-1.1, 1.1), s = rng.range(40, 110);
        env.parts.spawn({
          kind: PK.Streak, x: fx0 + rng.range(-12, 12), y: fy0 + rng.range(-8, 4), vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 2,
          max: rng.range(0.2, 0.4), s0: rng.range(0.8, 1.5), s1: 0.4, ramp: 'cobalt', r0: 0, r1: 0.45, a0: 0.9, a1: 0, k: 0.6, layer: 1,
        });
      }
    }
    // The fist opens: a dew ring bursts off the palm, sparks and mist fly.
    if (!opened && t >= T_OPEN) {
      opened = true;
      const [x, y] = P_PALM5;
      ring(env, x, y - 6, 8, 70, 0.32, 0.4, 'dew');
      ring(env, x, y - 6, 4, 46, 0.24, 0.4, 'dew');
      for (let q = 0; q < 22; q++) {
        const a = rng.range(-Math.PI, 0) + rng.range(-0.3, 0.3), s = rng.range(160, 420);
        env.parts.spawn({
          kind: PK.Streak, x, y: y - 6, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.7, drag: 3,
          max: rng.range(0.2, 0.42), s0: rng.range(1, 2), s1: 0.5, ramp: q % 3 ? 'dew' : 'cobalt', r0: 0, r1: 0.5, k: 1, layer: 1,
        });
      }
      for (let q = 0; q < 8; q++) {
        const a = rng.range(-Math.PI, 0), s = rng.range(60, 160);
        env.parts.spawn({
          kind: PK.Mist, x: x + Math.cos(a) * 10, y: y - 8, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.6, drag: 2.5,
          max: rng.range(0.35, 0.55), s0: 5, s1: 20, ramp: 'vapor', r0: 0.1, r1: 0.7, a0: 0.24, a1: 0, k: 0.3, layer: 0,
        });
      }
    }
    // While it spins on his palm, dew motes are drawn up into it.
    if (t >= T_OPEN + 0.06 && t < T_BLOW) {
      const [x, y] = t < T_LIPS ? P_PALM5 : P_PALM6;
      for (let q = 0; q < 2; q++) {
        const a = rng.range(0, Math.PI * 2), r = rng.range(36, 70);
        env.parts.spawn({
          kind: PK.Streak, x: x + Math.cos(a) * r, y: y - 14 + Math.sin(a) * r * 0.45, vx: -Math.cos(a) * r * 3 - Math.sin(a) * 60, vy: -Math.sin(a) * r * 1.3 - 40,
          max: 0.3, s0: rng.range(0.8, 1.4), s1: 0.4, ramp: 'dew', r0: 0, r1: 0.6, a0: 0.8, a1: 0.2, k: 0.7, layer: 1,
        });
      }
    }
    // The blow: his breath mist rushes at the lens (growing as it nears).
    if (!blown && t >= T_BLOW) {
      blown = true;
      const [x, y] = P_MOUTH6;
      for (let q = 0; q < 10; q++) {
        const a = rng.range(-0.7, 0.35), s = rng.range(300, 620);
        env.parts.spawn({
          // Starts ahead of the lips and faint, so the blow's acting (cheeks, O-mouth, closed eyes) stays clear.
          kind: PK.Mist, x: x + 24 + rng.range(-4, 4), y: y + rng.range(-3, 3), vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.6 - 30, drag: 1.2,
          max: rng.range(0.22, 0.34), s0: 3, s1: rng.range(22, 40), ramp: 'vapor', r0: 0.1, r1: 0.7, a0: 0.05, a1: 0, k: 0.35, layer: 1,
        });
      }
    }
    // The gust's approach: a building tremor under the buffet.
    if (t >= T_BLOW && t < T_LENS) holdTrauma(env.cam, 0.12 + 0.18 * u01(t, T_BLOW, T_LENS));
  },

  render(env, t) {
    if (t < T_WIPE_END) renderA(env, t);
    else renderB(env, t, true);
  },
};
