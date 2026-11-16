// SPOTLIGHT SOLO v2 · shot 1 · "Spot slam" (1.6 s, g 0.0-1.6, seed 511): the stage is declared. SPEC.md §6 shot 1.
//
// The cut-in panel IS the spotlight. Out of black a drop beam slams onto his face at x8 (SoloFace SF1, lit hard from
// straight above: the crown blazes, the fringe throws its shadow over the eyes, the jaw falls into violet dark); light
// rain pours out of the rig, dust is blown sideways out of the pool. His eyes ignite in the shadow of his hair (pixel
// cores + stage-light cross glints, a Chorus pulse of the head), he narrows them (SF2), and the drummer counts the
// title in: SPOT / LIGHT / SO / LO, each word stamped by its own drop beam on an 8th (1-2-3-4), each lighting a pad
// (the four defenders to come). On the last word the lamp blows: a pop, a rain of glass, the panel dies in 2 frames and
// only his two eyes stay lit while the camera crashes into his right eye. Black. Hard cut onto STOMP 1 (g 1.6, E2).
//
// Beats (shot-local = global):
//   0.00 black, the stinger.
//   0.06 SLAM: the drop beam falls in 2 frames (lamp (320,-30) 50 px -> the pool 520 px, 6 % overshoot); its hot throat
//        and shafts reach only its falling foot, and it lights the face from the crown down as it passes; lampSlam(1.0),
//        the lamp hum, cam.hit.
//   0.083 / 0.100 E1: flash 0.35 ivory for 2 frames (the foot's last falling frame and the landing).
//   0.10 the foot lands: the face over-exposed (settling over 0.12 s, the top light over 0.22 s), the pool and its uv
//        halo behind his head, splash rx 40 -> 300, flat shock (s 0.04, sy 0.35), 140 lines of light rain (gone by 0.60),
//        60 dust motes + 26 light chips blown sideways along the pool's floor, a Chorus pulse of the head, a downward
//        shove + zoom punch; then dust drifts down through the beam until the blow.
//   0.45 the eyes ignite (3 x 2 pixel cores on the face grid opening over 3 frames, uv halos over uvDeep, the lilac spill
//        under the brow, cross glints 60 / 36 px fading over 0.25 s, a Chorus pulse of the head, bloom 1.25 -> 1.0,
//        a zoom punch); shing + swell.
//   0.60 SF2, the glare: the cores squash to 4 x 1 slits.
//   0.80 / 1.00 / 1.20 / 1.40 the count-in: lampTitle2 (72 px, baseline 300; drawn behind his head, so each word's drop
//        beam passes behind him) + per word: light rain into the word, a flat splash at its foot, a flat shock, the main
//        beam and the top light pump +15 %, the eyes flare, a pad lights, a zoom punch + shove; sticks + stomp + boom.
//   1.05 the tag SPECIAL DRIBBLE · No.10 slides in (y 342; HUD in screen space with the pads).
//   1.40-1.53 crash zoom 1.06 -> 1.45 toward his right eye (screen-left), inCubic so the rush peaks on the last lit frame.
//   1.45 the lamp blows: a 1-frame bulb pop at the top (r 60, local), 30 glass glints + 14 sparks raining from the top of
//        frame; everything but the eyes drops to black over 2 frames (1.45-1.48); the eyes hold at 0.9 with a last cross
//        glint and go out at 1.55; surge(0.5), hum off.
//   1.55-1.60 black. Hard cut onto STOMP 1.
//
// Photosensitivity (§4.4): the only full-frame event is E1 (flash 0.35, 2 frames, first frame 0.083). The bulb pop, the
// word stamps' 1-frame letter flashes and the bloom pumps are local or below the FlashBudget thresholds.

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { clamp, ease, lerp, smooth, type RGB } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import {
  HEX, HUM, PAL, PIXEL_FONT, RATE, SEQ, SHOTS, TITLE_FONT, crossGlint, flatShockAt, fourCount, lampTitle2, lightRain, onFrames,
  punch, soloAt, soloPic, soloPunch, soloStage, soloTopLeft, stage, warmSolo2, zoomAbout, type SoloKey,
} from './common';
import { Chorus, warmChorus } from './chorus';

const META = SHOTS[0];
const FR = 1 / 60;

// ---------------------------------------------------------------- the panel (world px = screen px at zoom 1)

/**
 * The face crop's centre and scale (SoloFace 48 x 26 at x8 = 384 x 208). The brief centres it at (320, 140), but the
 * crop's top row cuts straight through his hair, which reads as a flat-topped head under the top light; centred at
 * y 92 the cut sits 12 px above the frame (it stays hidden under the push, the shake and the shove) and the crown
 * runs into the lamp's glare: top-left (128, -12), eyes on y 108 (the upper third), the shirt's edge at y 196.
 */
const FACE_X = 320, FACE_Y = 92, FACE_S = 8;
/** The drop beam: lamp (320, -30) 50 px wide, pool (320, 150) 520 px wide. */
const LAMP_X = 320, LAMP_Y = -30, LAMP_W = 50, POOL_Y = 150, POOL_W = 520;
/** The slam (the beam starts falling) and the frame its foot lands (2 frames later). */
const SLAM = 0.06, LAND = SLAM + 2 * FR;
/** The eyes ignite; the glare (SF2). */
const EYES = 0.45, GLARE = 0.6;
/** The count-in, one word per 8th: SPOT / LIGHT / SO / LO (stick clicks 1-2-3-4). */
const WORDS = ['SPOT', 'LIGHT ', 'SO', 'LO'] as const;
const ON = [0.8, 1.0, 1.2, 1.4] as const;
const TITLE_Y = 300, TITLE_SIZE = 72;
/** The tag. */
const TAG_AT = 1.05, TAG_Y = 342;
/** The crash zoom toward his right eye, the lamp blowing, the eyes going out. */
const CRASH0 = 1.4, CRASH1 = 1.55 - FR, BLOW = 1.45, EYES_OUT = 1.55;
/** The pads (16 x 16, y 312-328), centred under the title. */
const PAD = 16, PADS_X = Math.round(VW / 2 - (4 * PAD + 9) / 2), PADS_Y = 312;

/** The hot band of the pool behind his head: centred on the hair's widest rows, so its core hides behind him. */
const HALO_Y = 66;
/** Half-width of the beam's cone at screen y (world px). */
const coneHW = (y: number) => LAMP_W / 2 + ((POOL_W - LAMP_W) / 2) * clamp((y - LAMP_Y) / (POOL_Y - LAMP_Y));

/** 0 -> 1 -> 0 envelope: 1 at `at`, decaying over `len` (outQuad). */
const decay = (t: number, at: number, len: number) => (t < at ? 0 : 1 - ease.outQuad(clamp((t - at) / len)));
/** The +15 % pump of a lamp on each count word (0.1 s, like stage.pumpAt). */
const pumpK = (t: number) => (ON.some((a) => t >= a - 1e-6 && t < a + 0.1) ? 1 : 0);

/** How much of the panel is still lit: 1, then black over 2 frames after the lamp pops (1.45 lit, 1.467 half, 1.483 black). */
function litK(t: number) {
  if (t < SLAM) return 0;
  if (t < BLOW + FR - 1e-6) return 1;
  if (t < BLOW + 2 * FR - 1e-6) return 0.5;
  return 0;
}

// ---------------------------------------------------------------- the face under top light (pixel-exact, cached)

interface LitFace {
  /** The face multiplied by its light: full inside the cone and the hot band, violet-dark outside and toward the jaw. */
  base: HTMLCanvasElement;
  /** Additive top light (spot): the crown's top edges and the upper hair, inside the beam only. */
  top: HTMLCanvasElement;
  /** Additive side rims (volt) on the hair and ears against the dark. */
  rim: HTMLCanvasElement;
  /** Every opaque pixel in spot (the over-exposure on the slam, the pumps). */
  sil: HTMLCanvasElement;
  tl: [number, number];
  w: number;
  h: number;
}
const litCache = new Map<string, LitFace>();

/**
 * His face lit from straight above by the drop beam, baked per face pixel (so the light stays pixel art at x8): the
 * cone is the beam at the face's screen position; inside it the face keeps its colours, outside it (the outer hair
 * spikes) and toward the jaw and shirt it sinks to a violet dark. Cached per studio frame.
 */
function litFace(env: Env, key: SoloKey): LitFace {
  const p = soloPic(env, key);
  const hit = litCache.get(p.id);
  if (hit) return hit;
  const { w, h, px } = p;
  const tl = soloTopLeft(env, key, FACE_X, FACE_Y, FACE_S);
  const mk = () => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  };
  const cvs = [mk(), mk(), mk(), mk()];
  const ids = cvs.map((c) => c.getContext('2d')!.createImageData(w, h));
  const op = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && px[(y * w + x) * 4 + 3] > 40;
  const shadow: RGB = [0.3, 0.22, 0.5];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (!op(x, y)) continue;
      const i = (y * w + x) * 4;
      const wx = tl[0] + (x + 0.5) * FACE_S, wy = tl[1] + (y + 0.5) * FACE_S;
      const hw = coneHW(wy);
      const cone = 1 - smooth(clamp((Math.abs(wx - LAMP_X) - (hw - 26)) / 34));
      // The beam is hottest on the hair and the brow; the jaw, the neck and the shirt fall out of it.
      // The crop's last rows (the shirt) sink further, so the bust dissolves into the dark instead of ending on a hard cut.
      const fall = (1 - 0.55 * smooth(clamp((y - h * 0.62) / (h * 0.38)))) * lerp(1, 0.55, clamp((y - (h - 4)) / 3));
      const k = lerp(0.38, 1, cone) * fall;
      const b = ids[0].data;
      for (let c = 0; c < 3; c++) b[i + c] = Math.round(px[i + c] * lerp(shadow[c], 1, k));
      b[i + 3] = 255;
      // Top light: the first lit row under the sky (the crown's top edges), a softer second row, and the upper hair.
      let top = 0;
      if (!op(x, y - 1)) top = 1;
      else if (!op(x, y - 2)) top = 0.42;
      top = Math.max(top, 0.07 * clamp(1 - y / 9));
      top *= Math.pow(cone, 1.5) * (y < h * 0.7 ? 1 : 0.35);
      const tp = ids[1].data;
      tp[i] = PAL.spot[0];
      tp[i + 1] = PAL.spot[1];
      tp[i + 2] = PAL.spot[2];
      tp[i + 3] = Math.round(255 * clamp(top));
      // Side rims (volt) where the hair and the ears meet the dark.
      const side = (!op(x - 1, y) || !op(x + 1, y)) && y < h * 0.72 ? 0.75 : 0;
      const rp = ids[2].data;
      rp[i] = PAL.volt[0];
      rp[i + 1] = PAL.volt[1];
      rp[i + 2] = PAL.volt[2];
      rp[i + 3] = Math.round(255 * side * lerp(0.5, 1, cone));
      const sp = ids[3].data;
      sp[i] = PAL.spot[0];
      sp[i + 1] = PAL.spot[1];
      sp[i + 2] = PAL.spot[2];
      sp[i + 3] = 255;
    }
  cvs.forEach((c, k) => c.getContext('2d')!.putImageData(ids[k], 0, 0));
  const L: LitFace = { base: cvs[0], top: cvs[1], rim: cvs[2], sil: cvs[3], tl, w, h };
  litCache.set(p.id, L);
  return L;
}

/** Draw a face-sized canvas at the face's place (nearest, x8), with `op` and alpha a, clipped above y < clipY. */
function blitFace(ctx: CanvasRenderingContext2D, L: LitFace, img: HTMLCanvasElement, op: GlobalCompositeOperation, a: number, clipY = Infinity) {
  if (a <= 0) return;
  ctx.save();
  if (clipY < Infinity) {
    ctx.beginPath();
    ctx.rect(-200, -200, VW + 400, clipY + 200);
    ctx.clip();
  }
  ctx.imageSmoothingEnabled = false;
  ctx.globalCompositeOperation = op;
  ctx.globalAlpha = clamp(a);
  ctx.drawImage(img, L.tl[0], L.tl[1], L.w * FACE_S, L.h * FACE_S);
  ctx.restore();
}

// ---------------------------------------------------------------- the eyes (pixel cores on the face grid)

interface EyePt {
  /** Screen centre of the core. */
  x: number;
  y: number;
  /** The core rect in screen px. */
  rx: number;
  ry: number;
  rw: number;
  rh: number;
}

/**
 * The two eye cores on the face's pixel grid, read from the strip's pupil anchors: 3 x 2 face pixels (the eye pit and
 * the pupil row), or 4 x 1 on the pupil row when narrowed (the glare). `open` (0..1) opens them over 3 frames.
 */
function eyePts(env: Env, key: SoloKey, narrow: boolean, open: number): EyePt[] {
  const p = soloPic(env, key);
  const tl = soloTopLeft(env, key, FACE_X, FACE_Y, FACE_S);
  const out: EyePt[] = [];
  for (const nm of ['pupilL', 'pupilR'] as const) {
    const [ax, ay] = p.anchor(nm);
    const ix = Math.floor(ax), iy = Math.floor(ay);
    const left = nm === 'pupilL';
    const cx0 = narrow ? (left ? ix - 1 : ix - 2) : ix - 1, cy0 = narrow ? iy : iy - 1;
    const cw = narrow ? 4 : 3, ch = narrow ? 1 : 2;
    const rw = cw * FACE_S, fullH = ch * FACE_S;
    const rh = Math.max(2, Math.round(fullH * clamp(open)));
    const rx = tl[0] + cx0 * FACE_S, ry = tl[1] + cy0 * FACE_S + Math.round((fullH - rh) / 2);
    out.push({ x: rx + rw / 2, y: tl[1] + cy0 * FACE_S + fullH / 2, rx, ry, rw, rh });
  }
  return out;
}

/** The glowing eyes: uvDeep halos (normal), uv glow + ivory bloom (additive), the strobe-white cores, cross glints. */
function drawEyes(ctx: CanvasRenderingContext2D, pts: EyePt[], a: number, o: { flare?: number; cross?: number; spill?: number } = {}) {
  if (a <= 0) return;
  const fl = o.flare ?? 0;
  ctx.save();
  if ((o.spill ?? 0) > 0 && pts.length === 2) {
    // The lilac spill under the brow: a flat band of light across both eyes, just under the fringe's shadow.
    const mx = (pts[0].x + pts[1].x) / 2, my = (pts[0].y + pts[1].y) / 2 + 7;
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.lilac), mx, my, 70, 0.3 * (o.spill ?? 0) * a, 1.15, 0.2);
  }
  for (const e of pts) {
    ctx.globalCompositeOperation = 'source-over';
    drawGlow(ctx, glowOf(PAL.uvDeep), e.x, e.y, 46, 0.55 * a);
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(PAL.uv), e.x, e.y, 30 * (1 + 0.5 * fl), (0.65 + 0.35 * fl) * a);
    drawGlow(ctx, glowOf(PAL.ivory), e.x, e.y, 12 * (1 + 0.4 * fl), 0.75 * a);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = clamp(a);
    ctx.fillStyle = '#FFFAEC';
    ctx.fillRect(e.rx, e.ry, e.rw, e.rh);
    ctx.globalAlpha = 1;
    if ((o.cross ?? 0) > 1) crossGlint(ctx, e.x, e.y, Math.min(60, o.cross!), a);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the drop beam's extras (the hot throat, shafts)

/** The lamp's white-hot throat at the top of frame and a few hard shafts inside the cone (additive, seeded). */
function beamThroat(ctx: CanvasRenderingContext2D, t: number, k: number) {
  if (k <= 0) return;
  ctx.save();
  // While the beam falls (2 frames) its shafts only reach its foot.
  const drop = clamp((t - SLAM) / (2 * FR));
  if (drop < 1) {
    ctx.beginPath();
    ctx.rect(-400, -400, VW + 800, 400 + lerp(LAMP_Y, POOL_Y + 100, ease.outQuad(drop)));
    ctx.clip();
  }
  ctx.globalCompositeOperation = 'lighter';
  // The throat: the beam is hottest where it leaves the lamp.
  const g = ctx.createLinearGradient(0, LAMP_Y, 0, 120);
  g.addColorStop(0, `rgba(255,250,236,${0.55 * k})`);
  g.addColorStop(0.45, `rgba(255,250,236,${0.18 * k})`);
  g.addColorStop(1, 'rgba(255,250,236,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(LAMP_X - LAMP_W * 0.42, LAMP_Y);
  ctx.lineTo(LAMP_X + LAMP_W * 0.42, LAMP_Y);
  ctx.lineTo(LAMP_X + coneHW(120) * 0.55, 120);
  ctx.lineTo(LAMP_X - coneHW(120) * 0.55, 120);
  ctx.closePath();
  ctx.fill();
  // Hard shafts: 9 thin wedges from the lamp, flickering on their own seeds.
  for (let i = 0; i < 9; i++) {
    const h1 = Math.sin((i + 1) * 12.9898) * 43758.5453, r1 = h1 - Math.floor(h1);
    const h2 = Math.sin((i + 1) * 78.233) * 24634.6345, r2 = h2 - Math.floor(h2);
    const u = (i + 0.5) / 9 - 0.5 + (r1 - 0.5) * 0.06;
    const xEnd = LAMP_X + u * 2 * coneHW(POOL_Y) * 0.92;
    const fl = 0.8 + 0.2 * Math.sin(t * (9 + 5 * r2) + i * 2.1);
    const a = (0.06 + 0.07 * r2) * k * fl;
    const wEnd = 10 + 22 * r1;
    const gr = ctx.createLinearGradient(LAMP_X, LAMP_Y, xEnd, POOL_Y + 40);
    gr.addColorStop(0, `rgba(255,250,236,${a * 1.6})`);
    gr.addColorStop(0.6, `rgba(246,240,223,${a})`);
    gr.addColorStop(1, 'rgba(201,182,255,0)');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(LAMP_X + u * LAMP_W * 0.8 - 1, LAMP_Y);
    ctx.lineTo(LAMP_X + u * LAMP_W * 0.8 + 1, LAMP_Y);
    ctx.lineTo(xEnd + wEnd / 2, POOL_Y + 40);
    ctx.lineTo(xEnd - wEnd / 2, POOL_Y + 40);
    ctx.closePath();
    ctx.fill();
  }
  // The lens glare where the beam enters the frame (round, never a horizontal streak).
  drawGlow(ctx, glowOf(PAL.uv), LAMP_X, -6, 110, 0.45 * k);
  drawGlow(ctx, glowOf(PAL.ivory), LAMP_X, -10, 70, 0.7 * k);
  drawGlow(ctx, glowOf([255, 255, 255]), LAMP_X, -14, 34, 0.9 * k);
  ctx.restore();
}


/** One reused offscreen layer the size of the canvas (the beam is drawn into it so its foot can fade out). */
let beamCv: HTMLCanvasElement | null = null;
function beamLayer(ctx: CanvasRenderingContext2D): CanvasRenderingContext2D {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  if (!beamCv) beamCv = document.createElement('canvas');
  if (beamCv.width !== W || beamCv.height !== H) {
    beamCv.width = W;
    beamCv.height = H;
  }
  const g = beamCv.getContext('2d')!;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';
  g.clearRect(0, 0, W, H);
  g.setTransform(ctx.getTransform());
  g.imageSmoothingEnabled = false;
  return g;
}

/**
 * The drop beam with its foot fading into the pool (no hard bottom edge across the frame): stage.pillar + the hot
 * throat drawn into the offscreen layer, masked by a vertical fade (world y 70 -> POOL_Y + 30), added onto ctx.
 */
function dropBeam(ctx: CanvasRenderingContext2D, t: number, slamK: number): number {
  const g = beamLayer(ctx);
  const bk = stage.pillar(g, {
    x0: LAMP_X, y0: LAMP_Y, x1: LAMP_X, y1: POOL_Y + 40, w0: LAMP_W, w1: POOL_W * 1.2, a: 1, t, slamAt: SLAM, pumps: ON, motes: 40, seed: 11, core: 0.34, edge: 6,
  });
  if (bk <= 0) return 0;
  beamThroat(g, t, Math.min(1.3, bk) * (1 + 0.6 * slamK));
  g.globalCompositeOperation = 'destination-in';
  const m = g.createLinearGradient(0, 60, 0, POOL_Y + 30);
  m.addColorStop(0, 'rgba(0,0,0,1)');
  m.addColorStop(0.55, 'rgba(0,0,0,0.75)');
  m.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = m;
  g.fillRect(-400, -400, VW + 800, VH + 800);
  g.globalCompositeOperation = 'source-over';
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 1;
  ctx.drawImage(beamCv!, 0, 0);
  ctx.restore();
  return bk;
}

// ---------------------------------------------------------------- title geometry, the tag

/** Each title word's centre x and visible width, laid out exactly as lampTitle2 lays them (one line centred on 320). */
function wordGeom(ctx: CanvasRenderingContext2D): { cx: number; w: number }[] {
  ctx.save();
  ctx.font = `${TITLE_SIZE}px ${TITLE_FONT}`;
  const widths = WORDS.map((g) => ctx.measureText(g).width);
  const total = widths.reduce((a, b) => a + b, 0);
  let gx = VW / 2 - total / 2;
  const out = WORDS.map((g, i) => {
    const vw = ctx.measureText(g.trimEnd()).width;
    const r = { cx: gx + vw / 2, w: vw };
    gx += widths[i];
    return r;
  });
  ctx.restore();
  return out;
}

/** The tag SPECIAL DRIBBLE · No.10 (pixel font 10 px, lilac): slides in from the right over 0.12 s, flanked by volt ticks. */
function drawTag(ctx: CanvasRenderingContext2D, t: number) {
  const lt = t - TAG_AT;
  if (lt < 0) return;
  const k = ease.outCubic(clamp(lt / 0.12));
  const text = 'SPECIAL DRIBBLE · No.10';
  ctx.save();
  ctx.font = `10px ${PIXEL_FONT}`;
  const tw = Math.ceil(ctx.measureText(text).width);
  const x = Math.round(VW / 2 + 36 * (1 - k));
  ctx.globalAlpha = clamp(lt / 0.06);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = HEX.uvDeep;
  ctx.fillText(text, x + 1, TAG_Y + 1);
  ctx.fillStyle = HEX.lilac;
  ctx.fillText(text, x, TAG_Y);
  // Volt ticks either side, growing out from the text.
  ctx.fillStyle = HEX.volt;
  const L = Math.round(26 * k);
  ctx.fillRect(x - tw / 2 - 8 - L, TAG_Y + 5, L, 1);
  ctx.fillRect(x + tw / 2 + 8, TAG_Y + 5, L, 1);
  ctx.restore();
}

// ---------------------------------------------------------------- camera

/**
 * The push about the eye line with a slow drift (the frame settles onto his eyes), the punches (the landing, the eyes,
 * the count), then the crash zoom: his right eye (screen-left) rushes to the centre as the zoom slams 1.06 -> 1.45,
 * peaking on the last frame his eyes are lit.
 */
function camPose(env: Env, t: number) {
  const base = (tt: number) =>
    lerp(1, 1.06, ease.outSine(clamp((tt - SLAM) / (CRASH0 - SLAM)))) +
    punch(tt, LAND, 0.05, 0.02, 0.3) +
    punch(tt, EYES, 0.035, 0.02, 0.25) +
    ON.reduce((a, at) => a + soloPunch(tt, at, 0.035, 0.1), 0);
  const PX = 320, PY = 150;
  // The drift: the pivot slides 10 px left and 6 px up across the shot (a held, living frame between the hits).
  const d = ease.inOutSine(clamp((t - LAND) / (CRASH0 - LAND)));
  const SX = PX + lerp(5, -5, d), SY = PY + lerp(4, -2, d);
  let z = base(t);
  const cam = env.cam;
  if (t < CRASH0) {
    zoomAbout(cam, PX, PY, SX, SY, z);
    return;
  }
  const [eye] = eyePts(env, soloAt(SEQ[1], t).key, true, 1);
  const e = ease.inCubic(clamp((t - CRASH0) / (CRASH1 - CRASH0)));
  z = lerp(z, 1.45, e);
  const s0x = SX + (eye.x - PX) * z, s0y = SY + (eye.y - PY) * z;
  zoomAbout(cam, eye.x, eye.y, lerp(s0x, 318, e), lerp(s0y, 168, e), z);
}

// ---------------------------------------------------------------- the shot

const chorus = new Chorus();

/** Glass and sparks from the blown lamp live in screen space (they rain from the top of frame whatever the crash does). */
const GLASS_LAYER = 2;

export const shotSpotSlam: Shot = {
  name: META.name,
  dur: META.dur,
  seed: META.seed,
  rate: RATE[1],
  cues: [
    { at: 0.0, fn: (e) => e.sfx.stinger() },
    {
      at: SLAM,
      fn: (e) => {
        e.sfx.lampSlam(1.0);
        e.cam.shakeAmp = 12;
        e.cam.hit(0.45);
      },
    },
    {
      // The foot lands (the frame after the 2-frame drop): the jolt, the dust and the light chips.
      at: LAND - 0.004,
      fn: (e) => {
        e.cam.shove(0, 6);
        e.cam.hit(0.2);
        // 60 dust motes blown sideways out of the pool, and a spray of light chips skimming the pool's floor.
        for (let i = 0; i < 60; i++) {
          const side = i % 2 ? 1 : -1;
          const y = e.rng.range(170, 250);
          e.parts.spawn({
            kind: PK.Pixel, x: 320 + side * e.rng.range(10, 170), y, vx: side * e.rng.range(120, 420), vy: e.rng.range(-50, 12), drag: 2.2,
            max: e.rng.range(0.45, 1.0), s0: e.rng.range(1, 2.4), s1: 1, ramp: 'mote', r0: 0, r1: 1, a0: 0.95, a1: 0, add: false, layer: 0,
          });
        }
        for (let i = 0; i < 26; i++) {
          const side = i % 2 ? 1 : -1;
          e.parts.spawn({
            kind: PK.Streak, x: 320 + side * e.rng.range(60, 180), y: e.rng.range(222, 246), vx: side * e.rng.range(380, 760), vy: e.rng.range(-30, 10),
            drag: 3, max: e.rng.range(0.18, 0.35), s0: e.rng.range(1, 1.8), s1: 0.4, ramp: 'uv', r0: 0, r1: 0.8, k: 1.4, layer: 0,
          });
        }
      },
    },
    {
      at: EYES,
      fn: (e) => {
        e.sfx.shing(1.2);
        e.sfx.crashSwell(0.4, 0.12);
        e.cam.hit(0.15);
      },
    },
    ...ON.map((at) => ({
      at,
      fn: (e: Env) => {
        // The count-in, 1-2-3-4: sticks + a stomp + a boom per word.
        e.sfx.sticks(0.6);
        e.sfx.stomp(0.45);
        e.sfx.boom(0.3);
        e.cam.hit(0.12);
        e.cam.shove(0, 2.5);
      },
    })),
    { at: 1.0, fn: (e) => e.sfx.crashSwell(0.6) },
    { at: CRASH0, fn: (e) => e.sfx.whoosh(0.15, 400, 2400, 0.3) },
    {
      at: BLOW,
      fn: (e) => {
        e.sfx.surge(0.5);
        e.cam.hit(0.3);
        // The lamp blows: 30 glints of glass and a spray of sparks rain down out of the top of frame (screen space).
        for (let i = 0; i < 30; i++)
          e.parts.spawn({
            kind: PK.Glass, x: 320 + e.rng.range(-90, 90), y: e.rng.range(0, 26), vx: e.rng.range(-220, 220), vy: e.rng.range(260, 620), ay: 900,
            max: e.rng.range(0.3, 0.5), s0: e.rng.range(1.2, 2.6), s1: 1, ramp: 'glass', r0: 0, r1: 1, a0: 1, a1: 0.4, k: 0.4, layer: GLASS_LAYER,
          });
        for (let i = 0; i < 14; i++) {
          const a = Math.PI / 2 + e.rng.range(-1.3, 1.3), sp = e.rng.range(220, 520);
          e.parts.spawn({
            kind: PK.Streak, x: 320 + e.rng.range(-20, 20), y: 4, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, ay: 500, drag: 2.5,
            max: e.rng.range(0.12, 0.28), s0: e.rng.range(1, 1.8), s1: 0.4, ramp: 'glass', r0: 0, r1: 1, k: 1.3, layer: GLASS_LAYER,
          });
        }
      },
    },
  ],
  prepare(env) {
    warmSolo2();
    for (const k of ['SF1', 'SF2'] as const) litFace(env, k);
    warmChorus(env, ['SF1', 'SF2'], [FACE_S]);
  },
  init(env) {
    env.sfx.clearBus();
    env.cam.set(VW / 2, VH / 2, 1, 0);
    env.cam.shakeRoll = 0.015;
    env.cam.shakeAmp = 10;
  },
  update(env, t) {
    env.sfx.hum(HUM[1](t), 0.025);
    // Dust drifting down through the beam (2 motes a step from the landing to the blow), lit ivory-lilac.
    if (t >= LAND && t < BLOW) {
      const r = env.rng;
      for (let i = 0; i < 2; i++) {
        const y = r.range(-10, 150);
        const hw = coneHW(y) * 0.9;
        env.parts.spawn({
          kind: PK.Pixel, x: LAMP_X + r.range(-hw, hw), y, vx: r.range(-8, 8), vy: r.range(6, 22), drag: 0.2, max: r.range(0.5, 1.1),
          s0: r.next() < 0.2 ? 2 : 1, s1: 1, ramp: 'mote', r0: 0, r1: 0.7, a0: 0.75, a1: 0, add: true, layer: 0, k: 1,
        });
      }
    }
  },
  render(env, t) {
    const { ctx, fx } = env;
    chorus.frame();
    env.screen();
    ctx.fillStyle = HEX.void;
    ctx.fillRect(0, 0, VW, VH);
    camPose(env, t);
    env.world();

    const L = litK(t);
    const { key } = soloAt(SEQ[1], t);
    const face = litFace(env, key);
    const geo = wordGeom(ctx);
    const pump = 1 + 0.15 * pumpK(t);
    // The beam's foot (y) while it falls (2 frames), revealing him from the crown down.
    const drop = clamp((t - SLAM) / (2 * FR));
    const footY = lerp(LAMP_Y, POOL_Y + 100, ease.outQuad(drop));
    const landed = t >= LAND - 1e-6;
    const slamK = decay(t, LAND, 0.22);

    if (L > 0) {
      // 2 · Light rain out of the rig (behind everything): 140 lines in a 600 px band, gone by 0.60.
      lightRain(ctx, 320, 600, 140, SLAM, t, { life: 0.48, v0: 900, v1: 150, decel: 0.35, len0: 30, len1: 90, y0: -70, y1: 190, seed: 21 });
      // 3 · The drop beam (plum underlay, ivory body, white-hot core, volt edges, 40 motes, the hot throat; foot faded).
      dropBeam(ctx, t, slamK);
      // 4 · The pool's hot band behind his head (his hair silhouetted against it), the splash at his feet, the dust.
      if (landed) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, glowOf(PAL.uv), LAMP_X, HALO_Y + 6, 340, (0.42 + 0.2 * slamK) * pump, 1, 0.42);
        ctx.restore();
        stage.pool(ctx, LAMP_X, HALO_Y, 250, 84, (0.72 + 0.3 * slamK) * pump);
      }
      stage.splash(ctx, 320, 240, 40, 300, 0.3, LAND, t, 1);
      env.parts.draw(ctx, 0);

      // 7 · The count-in, behind him (each word's drop beam passes behind his head): light rain into each word, a flat
      // splash at its foot, then the stamped title.
      ON.forEach((at, i) => {
        const g = geo[i];
        lightRain(ctx, g.cx, g.w + 24, 26, at, t, { life: 0.2, v0: 1100, v1: 300, decel: 0.12, len0: 18, len1: 60, y0: 150, y1: 250, seed: 40 + i });
        stage.splash(ctx, g.cx, TITLE_Y + 2, 12, g.w * 0.62, 0.16, at, t, 0.8);
      });
      lampTitle2(ctx, WORDS, VW / 2, TITLE_Y, TITLE_SIZE, t, ON, { hold: 0.16 });

      // The Chorus: a volt pulse of his head on the slam and again as the eyes ignite (behind the face).
      chorus.pulse(env, key, FACE_X, FACE_Y, FACE_S, LAND, t, 1.22, { a: 0.5 });
      chorus.pulse(env, 'SF1', FACE_X, FACE_Y, FACE_S, EYES, t, 1.16, { a: 0.62 });

      // 5 · SoloFace x8 under top light, revealed from the crown down as the beam's foot falls.
      const clipY = landed ? Infinity : footY - 90;
      const topA = lerp(0.8, 1.15, slamK) * pump;
      blitFace(ctx, face, face.base, 'source-over', 1, clipY);
      blitFace(ctx, face, face.top, 'lighter', topA, clipY);
      blitFace(ctx, face, face.rim, 'lighter', 0.6 * pump, clipY);
      // The light lands on him: the face over-exposed for a moment, settling over 0.22 s.
      blitFace(ctx, face, face.sil, 'lighter', landed ? 0.55 * decay(t, LAND, 0.12) : 0.25, clipY);

      // The lamp right above him: its glare spills over his crown at the top of frame (round, never a streak).
      if (landed) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const ga = (0.75 + 0.5 * slamK) * pump;
        drawGlow(ctx, glowOf(PAL.uv), LAMP_X, -10, 130, 0.3 * ga);
        drawGlow(ctx, glowOf(PAL.ivory), LAMP_X, -12, 84, 0.5 * ga);
        drawGlow(ctx, glowOf([255, 255, 255]), LAMP_X, -16, 40, 0.8 * ga);
        ctx.restore();
      }

      // 6 · The eyes: they ignite at 0.45 over 3 frames, narrow on the glare, flare on every count word.
      if (t >= EYES) {
        const open = clamp((t - EYES + FR) / (3 * FR));
        const pts = eyePts(env, key, t >= GLARE, open);
        const crossK = 1 - ease.outQuad(clamp((t - EYES) / 0.25));
        const flare = Math.max(decay(t, EYES, 0.2), ...ON.map((a) => decay(t, a, 0.15) * 0.6));
        drawEyes(ctx, pts, 1, { cross: 60 * crossK, flare, spill: open });
      }

      // 8 · The pads (the four defenders to come) and the tag: HUD, in screen space (they ride the shove, not the zoom).
      env.screen();
      const [ox, oy] = env.cam.screenOffset;
      ctx.save();
      ctx.translate(ox, oy);
      if (landed) fourCount(ctx, ON, t, { x: PADS_X, y: PADS_Y, pad: PAD });
      drawTag(ctx, t);
      ctx.restore();
      env.world();
    }

    // The lamp blows: everything but the eyes drops to black over 2 frames.
    if (t >= BLOW && L < 1) {
      env.screen();
      ctx.globalAlpha = 1 - L;
      ctx.fillStyle = HEX.void;
      ctx.fillRect(0, 0, VW, VH);
      ctx.globalAlpha = 1;
      env.world();
    }
    if (t >= BLOW && t < EYES_OUT) {
      // Only his two eyes stay lit (0.9), with a last glint as the light dies; out at 1.55.
      if (L < 1) drawEyes(ctx, eyePts(env, key, true, 1), 0.9, { cross: 16 + 30 * decay(t, BLOW + FR, 0.08), flare: 0.35 });
    }
    // 9 · The bulb pop (a local white bloom at the top of frame, 1 frame) and the glass, in screen space.
    env.screen();
    if (onFrames(t, BLOW, 1)) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.lilac), LAMP_X, 0, 110, 0.7);
      drawGlow(ctx, glowOf([255, 255, 255]), LAMP_X, 0, 60, 1);
      ctx.restore();
    }
    env.parts.draw(ctx, GLASS_LAYER);

    // ---------------------------------------------------------------- post
    soloStage(fx, { vignette: 0.7 });
    // Bloom: the slam, the eyes (1.25 -> 1.0 over 0.2 s), a small pump on every stamp; held a touch lower under the title.
    const titleOn = t >= ON[0] ? 1 : 0;
    fx.bloom = lerp(1.0, 0.85, titleOn) + 0.2 * slamK + 0.25 * decay(t, EYES, 0.2) + 0.12 * Math.max(...ON.map((a) => decay(t, a, 0.12)));
    fx.bloomThresh = lerp(0.66, 0.78, titleOn);
    fx.ca = Math.max(fx.ca, 0.009 * decay(t, LAND, 0.2), 0.004 * Math.max(...ON.map((a) => decay(t, a, 0.1))), t >= CRASH0 && t < EYES_OUT ? lerp(0.003, 0.012, clamp((t - CRASH0) / 0.15)) : 0);
    // A flat refraction shock rolling out along the pool's floor from the landing, and a small one under every word.
    const [ux, uy] = env.cam.toUV(320, 240);
    flatShockAt(fx, ux, uy, LAND, t, 0.04, 0.35);
    ON.forEach((at, i) => {
      const [wx, wy] = env.cam.toUV(geo[i].cx, TITLE_Y + 2);
      flatShockAt(fx, wx, wy, at, t, 0.015, 0.3, 0.3);
    });
    // The crash zoom: a radial pull on his right eye.
    if (t >= CRASH0 && t < EYES_OUT) {
      const [eye] = eyePts(env, key, true, 1);
      const [ex, ey] = env.cam.toUV(eye.x, eye.y);
      fx.radialX = ex;
      fx.radialY = ey;
      fx.radial = 0.12 * ease.inQuad(clamp((t - CRASH0) / 0.15));
    }
    // E1: the drop beam slams (flash 0.35 ivory, 2 frames: the foot's last falling frame and the landing).
    if (onFrames(t, LAND - FR, 2)) {
      fx.flash = 0.35;
      fx.flashColor = PAL.ivory;
    }
  },
};
