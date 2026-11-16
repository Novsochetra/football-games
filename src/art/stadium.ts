// Night-stadium environment, pre-rendered as 1x pixel-art canvases and composed
// with parallax. World units = logical pixels.

import { Rng, clamp, lerp } from '../engine/math';
import { drawGlow, glowSprite, glowOf } from '../engine/particles';

const mk = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  return [c, g] as const;
};

export interface Stadium {
  crowd: HTMLCanvasElement;
  crowdNear: HTMLCanvasElement;
  tower: HTMLCanvasElement;
  pitch: HTMLCanvasElement;
  stars: { x: number; y: number; b: number }[];
  flashes: { x: number; y: number; t: number }[];
  moon: HTMLCanvasElement;
  cloud: HTMLCanvasElement[];
}

/** Field layout (world px). */
export const FIELD = {
  horizon: 172, // far touchline
  goalX: 1180, // goal line x
  goalFar: 214, // far post depth (y)
  goalNear: 300, // near post depth (y)
  goalH: 58, // crossbar height
  goalDepth: 34, // net depth to the right
  width: 1400,
};

export function buildStadium(seed = 7): Stadium {
  const rng = new Rng(seed);

  // Crowd: tiered rows of tiny fans, home side heavy on red.
  const [crowd, cg] = mk(1600, 110);
  cg.fillStyle = '#0d0a1a';
  cg.fillRect(0, 0, 1600, 110);
  for (let row = 0; row < 26; row++) {
    const y = 4 + row * 4;
    cg.fillStyle = row % 2 ? '#151129' : '#120e22';
    cg.fillRect(0, y + 3, 1600, 1);
    for (let x = (row % 2) * 2; x < 1600; x += 3 + (rng.next() < 0.2 ? 1 : 0)) {
      if (rng.next() < 0.08) continue;
      const shade = lerp(0.35, 1, row / 26);
      const r = rng.next();
      const shirt = r < 0.55 ? [200, 30, 40] : r < 0.7 ? [40, 60, 160] : r < 0.82 ? [230, 230, 240] : [250, 190, 70];
      const skin = rng.pick([[230, 170, 120], [190, 120, 80], [140, 90, 60]]);
      cg.fillStyle = `rgb(${(shirt[0] * shade) | 0},${(shirt[1] * shade) | 0},${(shirt[2] * shade) | 0})`;
      cg.fillRect(x, y + 1, 2, 2);
      cg.fillStyle = `rgb(${(skin[0] * shade) | 0},${(skin[1] * shade) | 0},${(skin[2] * shade) | 0})`;
      cg.fillRect(x, y, 2, 1);
    }
  }
  // Flags / banners in the home end.
  for (let i = 0; i < 9; i++) {
    const x = rng.int(40, 1500), y = rng.int(30, 80);
    cg.fillStyle = '#c81e2a';
    cg.fillRect(x, y, 22, 8);
    cg.fillStyle = '#2a3fa8';
    cg.fillRect(x, y, 22, 2);
    cg.fillRect(x, y + 6, 22, 2);
  }
  // Ad boards (LED strip)
  cg.fillStyle = '#05040b';
  cg.fillRect(0, 98, 1600, 12);
  for (let x = 0; x < 1600; x += 80) {
    const hue = rng.pick(['#ff3b3b', '#ffd34a', '#3fd0ff', '#ffffff']);
    cg.fillStyle = hue;
    cg.fillRect(x + 4, 101, 60, 6);
    cg.fillStyle = '#05040b';
    for (let k = 0; k < 6; k++) cg.fillRect(x + 8 + k * 9, 102, 4, 4);
  }

  // Near stands (big blurred-ish blocks for low-angle shots).
  const [crowdNear, cn] = mk(800, 90);
  cn.fillStyle = '#0a0814';
  cn.fillRect(0, 0, 800, 90);
  for (let row = 0; row < 12; row++) {
    for (let x = (row % 2) * 4; x < 800; x += 7) {
      if (rng.next() < 0.1) continue;
      const shade = lerp(0.25, 0.7, row / 12);
      const r = rng.next();
      const c = r < 0.6 ? [190, 30, 40] : r < 0.75 ? [40, 60, 160] : [220, 220, 230];
      cn.fillStyle = `rgb(${(c[0] * shade) | 0},${(c[1] * shade) | 0},${(c[2] * shade) | 0})`;
      cn.fillRect(x, 4 + row * 7, 5, 5);
      cn.fillStyle = `rgba(230,170,120,${shade})`;
      cn.fillRect(x + 1, 2 + row * 7, 3, 2);
    }
  }

  // Floodlight tower.
  const [tower, tg] = mk(40, 220);
  tg.fillStyle = '#1b1830';
  tg.fillRect(18, 30, 4, 190);
  tg.fillStyle = '#26223f';
  for (let y = 40; y < 220; y += 10) {
    tg.fillRect(14, y, 12, 1);
  }
  tg.fillStyle = '#2b2746';
  tg.fillRect(2, 2, 36, 28);
  tg.fillStyle = '#fffbe8';
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) tg.fillRect(5 + c * 7, 5 + r * 6, 5, 4);

  // Pitch with mowing stripes and markings.
  const [pitch, pg] = mk(FIELD.width, 260);
  for (let x = -260; x < FIELD.width + 260; x += 70) {
    for (let y = 0; y < 260; y++) {
      const sx = x + y * 0.35;
      pg.fillStyle = ((x / 70) & 1) === 0 ? '#2f8a3c' : '#287a35';
      pg.fillRect(Math.round(sx), y, 70, 1);
    }
  }
  // Depth shading: far = darker.
  for (let y = 0; y < 260; y++) {
    pg.fillStyle = `rgba(8,12,30,${clamp(0.45 - y / 400)})`;
    pg.fillRect(0, y, FIELD.width, 1);
  }
  // Grass speckle.
  for (let i = 0; i < 9000; i++) {
    pg.fillStyle = rng.next() < 0.5 ? 'rgba(20,60,26,0.5)' : 'rgba(110,190,90,0.25)';
    pg.fillRect(rng.int(0, FIELD.width), rng.int(0, 260), 1, 1);
  }
  pg.fillStyle = 'rgba(240,245,255,0.85)';
  pg.fillRect(0, 0, FIELD.width, 2); // far touchline
  const gx = FIELD.goalX;
  const line = (x0: number, y0: number, x1: number, y1: number) => {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let i = 0; i <= n; i++) pg.fillRect(Math.round(lerp(x0, x1, i / n)), Math.round(lerp(y0, y1, i / n)), 2, 1);
  };
  // goal line, penalty box, six-yard box (with slight oblique so they read as ground lines)
  const ob = 0.35;
  line(gx, 0, gx + 230 * ob, 230);
  line(gx - 150, 14, gx - 150 + 190 * ob, 204);
  line(gx - 150, 14, gx, 14);
  line(gx - 150 + 190 * ob, 204, gx + 190 * ob, 204);
  line(gx - 52, 64, gx - 52 + 90 * ob, 154);
  line(gx - 52, 64, gx + 64 * ob - 22, 64);
  line(gx - 52 + 90 * ob, 154, gx + 154 * ob, 154);
  pg.fillRect(gx - 104 + 110 * ob, 110, 3, 2); // penalty spot
  // halfway line + center circle
  line(260, 0, 260 + 260 * ob, 260);

  const stars: Stadium['stars'] = [];
  for (let i = 0; i < 260; i++) stars.push({ x: rng.range(0, 2000), y: rng.range(-1400, 120), b: rng.range(0.2, 1) });
  const flashes: Stadium['flashes'] = [];
  for (let i = 0; i < 70; i++) flashes.push({ x: rng.range(0, 1600), y: rng.range(4, 96), t: rng.range(0, 10) });

  // Full moon, dithered pixel craters.
  const [moon, mg] = mk(160, 160);
  for (let y = 0; y < 160; y++)
    for (let x = 0; x < 160; x++) {
      const dx = (x + 0.5 - 80) / 78, dy = (y + 0.5 - 80) / 78;
      const d = dx * dx + dy * dy;
      if (d > 1) continue;
      const nz = Math.sqrt(1 - d);
      const lam = clamp(nz * 0.7 + (-dx * 0.3 - dy * 0.2) * 0.6 + 0.2);
      let crater = 0;
      for (const [cx, cy, cr] of [[0.3, -0.2, 0.22], [-0.35, 0.25, 0.3], [0.1, 0.45, 0.14], [-0.2, -0.45, 0.16], [0.55, 0.2, 0.12], [-0.6, -0.1, 0.1]]) {
        const q = Math.hypot(dx - cx, dy - cy);
        if (q < cr) crater = Math.max(crater, 1 - q / cr);
      }
      const dither = ((x ^ y) & 1) * 0.04;
      const v = clamp(lam - crater * 0.22 + dither);
      const base = v > 0.75 ? [250, 246, 230] : v > 0.55 ? [226, 222, 214] : v > 0.35 ? [176, 178, 200] : [120, 124, 160];
      mg.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
      mg.fillRect(x, y, 1, 1);
    }

  // Pixel clouds (3 variants).
  const cloud: HTMLCanvasElement[] = [];
  for (let v = 0; v < 3; v++) {
    const [cc, cgc] = mk(140, 50);
    const blobs: [number, number, number][] = [];
    for (let i = 0; i < 9; i++) blobs.push([rng.range(20, 120), rng.range(22, 34), rng.range(10, 20)]);
    for (let y = 0; y < 50; y++)
      for (let x = 0; x < 140; x++) {
        let inside = false, top = 0;
        for (const [bx, by, br] of blobs) {
          const q = Math.hypot(x - bx, (y - by) * 1.3);
          if (q < br) {
            inside = true;
            top = Math.max(top, (by - y) / br);
          }
        }
        if (!inside || y > 40) continue;
        const c = top > 0.6 ? '#c9cdf0' : top > 0.25 ? '#7f84bf' : '#4b4d8a';
        cgc.fillStyle = c;
        cgc.fillRect(x, y, 1, 1);
      }
    cloud.push(cc);
  }

  return { crowd, crowdNear, tower, pitch, stars, flashes, moon, cloud };
}

/** SPOTLIGHT SOLO stage options for drawFieldBackdrop (all optional; omitted = the normal lit stadium). */
export interface FieldBackdropOpts {
  /**
   * Per floodlight tower (left to right, world x 120 / 620 / 1120 / 1620): true or 1 = lit, false or 0 = the lamp
   * grid goes dark and its glow is gone; a number in between scales the glow (fade a dying bank over 3 frames).
   */
  towers?: (boolean | number)[];
  /** Strength of the steady twinkling phone lights in the stands (0 = none). Prefer drawPhoneLights after a stage dim. */
  phones?: number;
  // ---- GALE HAMMER v2 (all optional; omitted = the shipped backdrop)
  /** Storm night 0..1: a cloud lid scudding over the roofline (hides the stars), mist streaks across the floodlight glare, a navy multiply on the stands. */
  storm?: number;
  /** Flags and scarves whipping in the stands, 0..1. */
  wind?: number;
  /** Wind direction along x (+1 = toward the goal, east; default +1). */
  windDir?: 1 | -1;
  /** A gust wave travelling left -> right through the crowd (0..1 = its front across the visible stands; see windWaveX). */
  windWave?: number;
  /** The ad boards folding back in a domino wave left -> right, 0..1. */
  boardsFold?: number;
  /** Floodlight towers swaying (px amplitude). */
  towerSway?: number;
  // ---- MERIDIAN THREAD v2 (optional; omitted = the shipped backdrop)
  /**
   * Per floodlight tower (left to right, world x 120 / 620 / 1120 / 1620), 0..1: the lamp heads catch the arc's jade
   * light (the lamp grid and the lamp core turn jade-white [200,255,225] with a faint jade halo; the glare over the
   * pitch keeps its colour). A continuous value from lampTintFor every frame: never switched, no lamp events.
   */
  lampTint?: number[];
}

/** World x of the wind wave's front in drawFieldBackdrop at camera x `camX` (gustTitle rides it). */
export function windWaveX(camX: number, windWave: number) {
  return lerp(camX - 400, camX + 400, clamp(windWave));
}

const stormClouds = new WeakMap<Stadium, HTMLCanvasElement[]>();
/** The three cloud sprites re-tinted as a storm lid (built once per stadium). */
function stormCloudSprites(st: Stadium): HTMLCanvasElement[] {
  let arr = stormClouds.get(st);
  if (!arr) {
    arr = st.cloud.map((c) => {
      const [cv, g] = mk(c.width, c.height);
      g.drawImage(c, 0, 0);
      g.globalCompositeOperation = 'source-atop';
      g.fillStyle = 'rgba(30,38,66,0.82)';
      g.fillRect(0, 0, c.width, c.height);
      return cv;
    });
    stormClouds.set(st, arr);
  }
  return arr;
}

/** GALE v2 storm sky: the cloud lid (normal blend) between yTop and yLid, scudding with the wind. */
function stormLid(ctx: CanvasRenderingContext2D, st: Stadium, x0: number, x1: number, yLid: number, time: number, k: number, dir: number, par: number) {
  const spr = stormCloudSprites(st);
  const span = 1400;
  ctx.globalAlpha = clamp(k);
  for (let i = 0; i < 14; i++) {
    const c = spr[i % 3];
    const sc = 1.6 + (i % 4) * 0.35;
    const w = c.width * sc;
    let x = ((i * 173 + time * 70 * dir - par) % span + span) % span + x0 - 300;
    while (x < x1 + 300) {
      ctx.drawImage(c, Math.round(x), Math.round(yLid - c.height * sc * (0.55 + (i % 3) * 0.12)), w, c.height * sc);
      x += span;
    }
  }
  ctx.globalAlpha = 1;
}

/** GALE v2: wind-blown mist streaks across the floodlight glare (additive, faint). */
function mistStreaks(ctx: CanvasRenderingContext2D, x0: number, x1: number, y0: number, y1: number, time: number, k: number, dir: number) {
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = 'lighter';
  const w = x1 - x0 + 400;
  for (let i = 0; i < 26; i++) {
    const h = ((i * 0.618) % 1);
    const len = 60 + ((i * 37) % 140);
    const y = lerp(y0, y1, ((i * 0.377) % 1));
    const x = (((i * 211 + time * (160 + h * 120) * dir) % w) + w) % w + x0 - 200;
    ctx.globalAlpha = clamp(k * (0.06 + 0.08 * h));
    ctx.fillStyle = '#d8ecff';
    ctx.fillRect(Math.round(x), Math.round(y), len, 1);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = prev;
}

/** GALE v2: flags and scarves whipping over the crowd (crowd parallax), with an optional travelling gust wave. */
function standFlags(ctx: CanvasRenderingContext2D, cx: number, left: number, right: number, time: number, wind: number, dir: number, wave?: number) {
  const y0 = FIELD.horizon - 110;
  const front = wave === undefined ? -1e9 : lerp(left, right, clamp(wave));
  for (let i = 0; i < 22; i++) {
    const x = Math.round(cx + 30 + i * 73 + ((i * 29) % 23));
    if (x < left - 30 || x > right + 30) continue;
    const y = y0 + 14 + ((i * 41) % 70);
    // The wave front whips the flags it has passed (hardest just behind it).
    const behind = x < front ? Math.exp(-(front - x) / 160) : 0;
    const k = clamp(wind + behind * 1.2, 0, 1.6);
    const len = 10 + (i % 3) * 4;
    const red = i % 4 !== 1;
    ctx.fillStyle = '#2a2440';
    ctx.fillRect(x, y - 2, 1, 12);
    for (let s2 = 0; s2 < len; s2++) {
      const ph = time * (7 + k * 9) - s2 * 0.5 + i;
      const yy = y + Math.sin(ph) * (0.6 + k * 2.2) * (s2 / len) + (1 - k) * s2 * 0.35;
      ctx.fillStyle = red ? (s2 % 5 < 3 ? '#b51c28' : '#e8e8f0') : '#2a3fa8';
      ctx.fillRect(Math.round(x + 1 + s2 * dir), Math.round(yy), 1, 4);
    }
  }
}

/** GALE v2: the ad boards folding back in a domino wave (0..1), drawn over the board strip of the crowd. */
function foldBoards(ctx: CanvasRenderingContext2D, cx: number, left: number, right: number, fold: number) {
  const y = FIELD.horizon - 12;
  ctx.fillStyle = '#05040b';
  ctx.fillRect(left - 200, y, right - left + 400, 12);
  const hues = ['#ff3b3b', '#ffd34a', '#3fd0ff', '#ffffff'];
  for (let x = Math.floor((left - cx) / 80) * 80; x + cx < right + 80; x += 80) {
    const sx = x + cx;
    const u = clamp((sx - left) / Math.max(1, right - left));
    const a = clamp(fold * 1.6 - u * 0.6) * (Math.PI / 2) * 0.92;
    const hh = Math.max(1, Math.round(6 * Math.cos(a)));
    ctx.fillStyle = hues[(((x / 80) % 4) + 4) % 4];
    ctx.globalAlpha = 1 - 0.5 * (a / (Math.PI / 2));
    ctx.fillRect(Math.round(sx + 4), y + 9 - hh, 60, hh);
    ctx.globalAlpha = 1;
  }
}

const TOWER_X = [120, 620, 1120, 1620];
const towerLevel = (o: FieldBackdropOpts, tx: number) => {
  const v = o.towers?.[TOWER_X.indexOf(tx)];
  return v === undefined || v === true ? 1 : v === false ? 0 : clamp(v);
};
const darkTowers = new WeakMap<Stadium, HTMLCanvasElement>();
/** The floodlight tower with its lamp grid switched off (built once). */
function darkTower(st: Stadium): HTMLCanvasElement {
  let cv = darkTowers.get(st);
  if (!cv) {
    const [c, g] = mk(st.tower.width, st.tower.height);
    g.drawImage(st.tower, 0, 0);
    g.fillStyle = '#2a2440';
    for (let r = 0; r < 4; r++) for (let k = 0; k < 5; k++) g.fillRect(5 + k * 7, 5 + r * 6, 5, 4);
    darkTowers.set(st, (cv = c));
  }
  return cv;
}

// ---------------------------------------------------------------- SPOTLIGHT SOLO v2: phone-light sea, banks

/** SPOTLIGHT SOLO v2 options for drawPhoneLights (all optional; omitted = the shipped 60 steady lights). */
export interface PhoneLightOpts {
  /** How many lights (default 60; v2 passes 300: the stands become a starfield). */
  n?: number;
  /** A left -> right switch-on wave: [t0, dur] on the `time` clock (each light snaps on over 2 frames as the front passes). */
  wave?: readonly [number, number];
  /** A +30 % brightness wave crossing left -> right: [t0, dur] (the cue at the curtain call). */
  surge?: readonly [number, number];
  /** 1 px bob on every 0.4 s beat of `time` (the crowd on his beat after OLÉ 1). */
  sway?: boolean;
  /** Every light jumps up this many px (the crowd's stomp; the shot sets it, e.g. 2 on the stomp frame). */
  jump?: number;
  /**
   * Place the lights on the far stand of this down/up-pitch view (screen space: call after env.screen()) instead of
   * the side-view crowd strip (world space, parallax 0.25).
   */
  view?: DownPitchView;
}

/** Phone-light positions: the stadium's flash positions first, then deterministic extras (crowd-strip px). */
function phoneSpot(st: Stadium, i: number): { x: number; y: number; t: number } {
  if (i < st.flashes.length) return st.flashes[i];
  const h = (k: number) => {
    const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
    return v - Math.floor(v);
  };
  return { x: h(1) * 1600, y: 4 + h(2) * 92, t: h(3) * 10 };
}

/** The far stand's screen quad in a down/up-pitch view: left / right foot and top (the crowd strip is drawn into it). */
export function farStandRect(v: DownPitchView) {
  const gz = GOAL_Z(), west = (v.dir ?? 1) < 0;
  const farX = west ? 40 : FIELD.goalX + 90;
  const sL = projectDecal(farX, gz - 900 * (west ? -1 : 1), 0, v), sR = projectDecal(farX, gz + 900 * (west ? -1 : 1), 0, v);
  const sT = projectDecal(farX, gz, 150, v);
  return { x0: sL.x, x1: sR.x, top: sT.y, foot: sL.y };
}

function phoneLightsV2(ctx: CanvasRenderingContext2D, st: Stadium, camX: number, time: number, a: number, o: PhoneLightOpts) {
  const n = Math.max(0, Math.round(o.n ?? 60));
  const cx = camX * 0.25 - 220;
  const fr = o.view ? farStandRect(o.view) : null;
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = 'lighter';
  const beat = o.sway ? Math.floor(time / 0.4 + 1e-6) : 0;
  // The visible span for the waves: the screen in a pitch view, the camera's 800 px in the side view.
  const left = fr ? 0 : camX - 400, span = fr ? 640 : 800;
  for (let i = 0; i < n; i++) {
    const f = phoneSpot(st, i);
    let x: number, y: number;
    if (fr) {
      x = Math.round(lerp(fr.x0, fr.x1, f.x / st.crowd.width));
      y = Math.round(lerp(fr.top, fr.foot, f.y / st.crowd.height));
      if (x < -4 || x > 644 || y < -4 || y > 364) continue;
    } else {
      x = Math.round(f.x + cx);
      y = Math.round(FIELD.horizon - 110 + f.y);
    }
    if (o.sway && (beat + i) % 2) y += 1;
    if (o.jump) y -= Math.round(o.jump);
    const u = clamp((x - left) / span);
    let on = 1;
    if (o.wave) on = clamp((time - (o.wave[0] + o.wave[1] * u)) / (2 / 60));
    if (on <= 0) continue;
    let boost = 1;
    if (o.surge) {
      const front = (time - o.surge[0]) / Math.max(1e-3, o.surge[1]);
      boost += 0.3 * Math.exp(-(((u - front) / 0.12) ** 2)) + (front > u ? 0.12 : 0);
    }
    const k = clamp(a * on * boost * (1 + 0.3 * Math.sin(time * (0.9 + (i % 5) * 0.17) + f.t * 6.1)), 0, 1.4);
    const c: [number, number, number] = i % 3 === 0 ? [201, 182, 255] : [246, 240, 223];
    drawGlow(ctx, glowOf(c), x + 0.5, y + 0.5, 3, 0.35 * k);
    ctx.globalAlpha = clamp(k);
    ctx.fillStyle = i % 3 === 0 ? '#C9B6FF' : '#F6F0DF';
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = prev;
}

/** A floodlight bank's lamp grid: cols x rows cells inside the rect (screen or world px, whichever the caller uses). */
export interface BankRect {
  x: number;
  y: number;
  w: number;
  h: number;
  cols: number;
  rows: number;
}

/** The two near roof banks of a pitch view, at the top corners of the frame (screen px; SOLO v2's near pair). */
const NEAR_BANKS: readonly BankRect[] = [
  { x: -16, y: -10, w: 136, h: 44, cols: 5, rows: 4 },
  { x: 520, y: -10, w: 136, h: 44, cols: 5, rows: 4 },
];

/**
 * SPOTLIGHT SOLO v2: the four floodlight banks of a down/up-pitch view in screen px, in towers order: far-left,
 * far-right (the corner towers' lamp heads), near-left, near-right (the roof banks at the top corners).
 */
export function pitchBanks(v: DownPitchView): BankRect[] {
  const gz = GOAL_Z(), west = (v.dir ?? 1) < 0;
  const towerX = west ? -20 : FIELD.goalX + 150;
  const far = [-1, 1].map((side) => {
    const top = projectDecal(towerX, gz + side * 520, 320, v);
    return { x: top.x - 18 * top.s, y: top.y - 14 * top.s, w: 36 * top.s, h: 16 * top.s, cols: 5, rows: 4 };
  });
  far.sort((p, q) => p.x - q.x);
  return [far[0], far[1], { ...NEAR_BANKS[0] }, { ...NEAR_BANKS[1] }];
}

/**
 * SPOTLIGHT SOLO v2: the four floodlight towers' lamp grids of the side-view backdrop (drawFieldBackdrop) in world px
 * at camera x camX (left to right, world x 120 / 620 / 1120 / 1620; the same order as FieldBackdropOpts.towers).
 */
export function fieldBanks(camX: number, time = 0, towerSway = 0): BankRect[] {
  return [120, 620, 1120, 1620].map((tx) => {
    const x = Math.round(tx + camX * 0.5 - 300 + (towerSway ? Math.sin(time * 5.3 + tx * 0.01) * towerSway : 0));
    return { x: x + 5, y: -35, w: 33, h: 22, cols: 5, rows: 4 };
  });
}

/** Lamp cells of a bank (SOLO v2 near roof banks and the pitch-view corner heads): lit cells blaze, dead ones are dark. */
function bankCells(ctx: CanvasRenderingContext2D, b: BankRect, lv: number) {
  ctx.fillStyle = '#0b0918';
  ctx.fillRect(b.x - 2, b.y - 2, b.w + 4, b.h + 4);
  const cw = b.w / b.cols, ch = b.h / b.rows;
  ctx.fillStyle = lv > 0.5 ? '#FFFBE8' : '#2a2440';
  for (let r = 0; r < b.rows; r++) for (let c = 0; c < b.cols; c++) ctx.fillRect(b.x + c * cw + cw * 0.14, b.y + r * ch + ch * 0.14, cw * 0.72, ch * 0.66);
}

/**
 * SPOTLIGHT SOLO: about 60 steady phone lights across the dark stands (the camera-flash positions, crowd parallax
 * 0.25), each twinkling slowly (±30%), ivory and lilac. Light sources: draw them AFTER the stage dim layer.
 * World transform (the field camera) applied; `a` = strength 0..1.
 */
export function drawPhoneLights(ctx: CanvasRenderingContext2D, st: Stadium, camX: number, time: number, a = 1, o: PhoneLightOpts = {}) {
  if (a <= 0) return;
  if (o.n !== undefined || o.wave || o.surge || o.sway || o.view || o.jump) return phoneLightsV2(ctx, st, camX, time, a, o);
  const cx = camX * 0.25 - 220;
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < Math.min(60, st.flashes.length); i++) {
    const f = st.flashes[i];
    const x = Math.round(f.x + cx), y = Math.round(FIELD.horizon - 110 + f.y);
    const k = clamp(a * (1 + 0.3 * Math.sin(time * (0.9 + (i % 5) * 0.17) + f.t * 6.1)));
    const c: [number, number, number] = i % 3 === 0 ? [201, 182, 255] : [246, 240, 223];
    drawGlow(ctx, glowOf(c), x + 0.5, y + 0.5, 3, 0.35 * k);
    ctx.globalAlpha = k;
    ctx.fillStyle = i % 3 === 0 ? '#C9B6FF' : '#F6F0DF';
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = prev;
}

// ---------------------------------------------------------------- MERIDIAN THREAD v2: lamp heads catching jade light

/** The jade-white a lamp head turns as the arc passes (MERIDIAN v2). */
export const LAMP_JADE: [number, number, number] = [200, 255, 225];

/**
 * Overlay a lamp grid (cols x rows cells of cw x ch, pitch px x py from (x0, y0)) in jade-white at `k` 0..1 (normal
 * blend, so the cells read jade-white, not blown out).
 */
function tintLampGrid(ctx: CanvasRenderingContext2D, x0: number, y0: number, cols: number, rows: number, px: number, py: number, k: number, cw = 5, ch = 4) {
  ctx.globalAlpha = clamp(k);
  ctx.fillStyle = 'rgb(200,255,225)';
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) ctx.fillRect(x0 + c * px, y0 + r * py, cw, ch);
  ctx.globalAlpha = 1;
}

/** A lamp core glow at (x, y) blending white -> jade-white by `k`, plus a faint jade halo (additive; caller's blend). */
function lampCore(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: number, k: number) {
  const kk = clamp(k);
  drawGlow(ctx, glowOf([255, 255, 255]), x, y, r, a * (1 - kk));
  drawGlow(ctx, glowOf(LAMP_JADE), x, y, r, a * kk);
  drawGlow(ctx, glowOf([47, 224, 138]), x, y, r * 1.8, 0.28 * a * kk);
}

/** Draw the side-view field world (stands, lights, pitch). Camera transform already applied. */
export function drawFieldBackdrop(ctx: CanvasRenderingContext2D, st: Stadium, camX: number, camY: number, time: number, opts: FieldBackdropOpts = {}) {
  const left = camX - 400, right = camX + 400;
  // Sky
  const sky = ctx.createLinearGradient(0, camY - 260, 0, FIELD.horizon);
  sky.addColorStop(0, '#05030d');
  sky.addColorStop(0.6, '#140c2e');
  sky.addColorStop(1, '#2a1640');
  ctx.fillStyle = sky;
  ctx.fillRect(left - 200, camY - 400, 1200, FIELD.horizon - (camY - 400));
  const storm = opts.storm ?? 0;
  const dir = opts.windDir ?? 1;
  if (storm > 0) {
    // The storm lid hides the stars: a navy ceiling and scudding cloud over the roofline.
    ctx.fillStyle = `rgba(6,11,36,${clamp(storm)})`;
    ctx.fillRect(left - 200, camY - 400, 1200, FIELD.horizon - (camY - 400));
    stormLid(ctx, st, left, right, FIELD.horizon - 118, time, storm, dir, camX * 0.35);
  }
  // Stars (strong parallax)
  ctx.fillStyle = '#cfd6ff';
  if (storm < 1) for (const s of st.stars) {
    const x = s.x + camX * 0.85 - 1000;
    if (x < left - 10 || x > right + 10 || s.y > 40) continue;
    ctx.globalAlpha = s.b * (0.6 + 0.4 * Math.sin(time * 3 + s.x));
    ctx.fillRect(Math.round(x), Math.round(s.y), 1, 1);
  }
  ctx.globalAlpha = 1;

  // Floodlight towers (parallax 0.5)
  const sway = (tx: number) => (opts.towerSway ? Math.sin(time * 5.3 + tx * 0.01) * opts.towerSway : 0);
  for (const tx of [120, 620, 1120, 1620]) {
    const x = tx + camX * 0.5 - 300 + sway(tx);
    if (x < left - 60 || x > right + 60) continue;
    ctx.drawImage(towerLevel(opts, tx) > 0.5 ? st.tower : darkTower(st), Math.round(x), -40);
    const lt = opts.lampTint ? clamp(opts.lampTint[TOWER_X.indexOf(tx)] ?? 0) : 0;
    if (lt > 0 && towerLevel(opts, tx) > 0.5) tintLampGrid(ctx, Math.round(x) + 5, -35, 5, 4, 7, 6, lt);
  }
  // Crowd (parallax 0.25)
  const cx = camX * 0.25 - 220;
  ctx.drawImage(st.crowd, Math.round(cx), FIELD.horizon - 110);
  // Roof edge
  ctx.fillStyle = '#07050f';
  ctx.fillRect(left - 200, FIELD.horizon - 122, 1200, 14);
  if (opts.boardsFold) foldBoards(ctx, cx, left, right, opts.boardsFold);
  if (opts.wind || opts.windWave !== undefined) standFlags(ctx, cx, left, right, time, opts.wind ?? 0, dir, opts.windWave);
  if (storm > 0) {
    // Navy multiply on the stands (the stands sit dark under the storm; the lamps stay hot).
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = `rgba(${Math.round(lerp(255, 70, storm))},${Math.round(lerp(255, 86, storm))},${Math.round(lerp(255, 140, storm))},1)`;
    ctx.fillRect(left - 200, FIELD.horizon - 124, 1200, 124);
    ctx.globalCompositeOperation = 'source-over';
  }

  // Camera flashes in the crowd
  ctx.globalCompositeOperation = 'lighter';
  for (const f of st.flashes) {
    const ph = (time * 0.9 + f.t) % 3.2;
    if (ph > 0.12) continue;
    const x = f.x + cx;
    drawGlow(ctx, glowSprite('white', 0), x, FIELD.horizon - 110 + f.y, 6, 1 - ph / 0.12);
  }
  if (opts.phones) drawPhoneLights(ctx, st, camX, time, opts.phones);
  // Lamp glows
  for (const tx of [120, 620, 1120, 1620]) {
    const x = tx + camX * 0.5 - 300 + 20 + sway(tx);
    if (x < left - 120 || x > right + 120) continue;
    const lv = towerLevel(opts, tx);
    if (lv <= 0) continue;
    drawGlow(ctx, glowOf([255, 250, 220]), x, -26, 70, 0.55 * lv);
    const lt = opts.lampTint ? clamp(opts.lampTint[TOWER_X.indexOf(tx)] ?? 0) : 0;
    if (lt > 0) lampCore(ctx, x, -26, 26, 0.9 * lv, lt);
    else drawGlow(ctx, glowOf([255, 255, 255]), x, -26, 26, 0.9 * lv);
  }
  ctx.globalCompositeOperation = 'source-over';
  if (storm > 0) mistStreaks(ctx, left, right, -80, FIELD.horizon - 60, time, storm, dir);

  // Pitch
  ctx.drawImage(st.pitch, 0, FIELD.horizon);
  // Pitch beyond the edges (repeat a plain color)
  ctx.fillStyle = '#287a35';
  if (left < 0) ctx.fillRect(left - 200, FIELD.horizon, -left + 200, 400);
  if (right > FIELD.width) ctx.fillRect(FIELD.width, FIELD.horizon, right - FIELD.width + 200, 400);
}

/** A local bulge of the back net (side view): (u, v) on the back panel (u far->near post, v 0 top..1 ground). */
export interface NetDimple {
  u: number;
  v: number;
  /** Strength, in the same units as `bulge` (1 = 46 px). */
  amt: number;
  /** Radius in panel units (default 0.22). */
  r?: number;
}

/**
 * Goal frame + net, side view. `bulge` pushes the back net outward (0..1+). part: 'back' draws net, 'front' draws the near post.
 * `dimple` (optional) adds a local bulge on the back net (e.g. the ball punching into the top corner).
 */
export function drawGoal(ctx: CanvasRenderingContext2D, part: 'back' | 'front', bulge = 0, shake = 0, dimple?: NetDimple) {
  const gx = FIELD.goalX, far = FIELD.goalFar, near = FIELD.goalNear, H = FIELD.goalH, D = FIELD.goalDepth;
  const ob = 0.35;
  const fx = gx + (far - FIELD.horizon) * ob, nx = gx + (near - FIELD.horizon) * ob;
  const sh = shake;
  if (part === 'back') {
    // Net: back panel with bulge
    ctx.strokeStyle = 'rgba(230,235,255,0.55)';
    ctx.lineWidth = 1;
    const cols = 10, rows = 7;
    const P = (u: number, v: number): [number, number] => {
      // u along depth (far->near), v height (0 top .. 1 ground)
      const baseX = lerp(fx, nx, u) + D;
      const y = lerp(far, near, u) - H * (1 - v) * 0.92;
      let b = Math.sin(u * Math.PI) * Math.sin(v * Math.PI * 0.9 + 0.1) * bulge * 46;
      if (dimple) {
        const r = dimple.r ?? 0.22;
        b += Math.exp(-((u - dimple.u) ** 2 + (v - dimple.v) ** 2) / (r * r)) * dimple.amt * 46;
      }
      return [baseX + b, y + b * 0.1];
    };
    for (let i = 0; i <= cols; i++) {
      ctx.beginPath();
      for (let j = 0; j <= rows; j++) {
        const [x, y] = P(i / cols, j / rows);
        j ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
    for (let j = 0; j <= rows; j++) {
      ctx.beginPath();
      for (let i = 0; i <= cols; i++) {
        const [x, y] = P(i / cols, j / rows);
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
    // roof net lines
    for (let i = 0; i <= cols; i++) {
      const u = i / cols;
      const [bx, by] = P(u, 0);
      ctx.beginPath();
      ctx.moveTo(lerp(fx, nx, u), lerp(far, near, u) - H);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }
    // far post + crossbar
    ctx.fillStyle = '#f4f6ff';
    ctx.fillRect(Math.round(fx - 2 + sh), far - H, 4, H);
    ctx.save();
    ctx.strokeStyle = '#f4f6ff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(fx + sh, far - H);
    ctx.lineTo(nx + sh, near - H);
    ctx.stroke();
    ctx.restore();
  } else {
    ctx.fillStyle = '#180411';
    ctx.fillRect(Math.round(nx - 3 + sh), near - H - 1, 6, H + 1);
    ctx.fillStyle = '#f4f6ff';
    ctx.fillRect(Math.round(nx - 2 + sh), near - H, 4, H);
    ctx.fillStyle = '#b8bcd8';
    ctx.fillRect(Math.round(nx + 1 + sh), near - H, 1, H);
  }
}

/** Soft ellipse shadow on the ground. */
export function drawShadow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, a = 0.35) {
  ctx.fillStyle = `rgba(5,8,20,${a})`;
  ctx.beginPath();
  ctx.ellipse(x, y, w, w * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ---------------------------------------------------------------- Down-the-pitch ground (back views)

/**
 * A perspective view straight down the pitch toward the goal (+x), for back views: the eye stands at field
 * (x, z) at height h (world px; 10 px ~ 1 m; the goal line is FIELD.goalX = 1180 and the goal centre is z 257),
 * looking along +x with a level horizon. Screen x grows with field z (looking east, the near touchline is
 * to the right). f = focal length (screen px per world px at 1 world px of depth): scale it to zoom.
 */
export interface DownPitchView {
  x: number;
  z: number;
  h: number;
  f: number;
  /** Screen y of the horizon (with a tilt: the principal point's y; it equals the horizon only at tilt 0). */
  horizon: number;
  /** Screen x of the view axis. */
  cx: number;
  /**
   * Shared (v2 set): pitch of the view in radians, + looks down, - looks up (default 0 = the level view). Pitch only:
   * no yaw, no roll. With Z = depth along the view direction, X = across, Y = h - eye.h:
   * Zc = Z·cos t - Y·sin t, Yc = Z·sin t + Y·cos t, screen (cx + f·X/Zc, horizon - f·Yc/Zc), s = f/Zc (Zc >= 2).
   */
  tilt?: number;
  /** Shared (v2 set): +1 looks east down the pitch (default), -1 looks west up the pitch (see projectUp). */
  dir?: 1 | -1;
}

/** A starting view: ~4 m behind a striker 30 m out, eye at 1.8 m. */
export const DOWN_PITCH_VIEW: DownPitchView = { x: 840, z: GOAL_Z(), h: 18, f: 560, horizon: 112, cx: 320 };

function GOAL_Z() {
  return (FIELD.goalFar + FIELD.goalNear) / 2;
}

let lastView: DownPitchView = DOWN_PITCH_VIEW;

export interface Projected {
  /** Screen position. */
  x: number;
  y: number;
  /** Screen px per world px at that depth. */
  s: number;
  /** Ground foreshortening: a ground circle of radius R draws as an ellipse R*s wide and R*s*k tall. */
  k: number;
  /** Depth from the eye (world px). */
  d: number;
}

/**
 * Project a field point (x along the pitch, z across, h height above the turf) into the screen of `v`
 * (default: the view last passed to drawDownPitch). Use it to place stamps, players and the ball on the
 * down-the-pitch ground. Points at or behind the eye are clamped to 2 px of depth.
 */
export function projectDecal(x: number, z: number, h = 0, v: DownPitchView = lastView): Projected {
  // The shared pitch projector (v2 set): the view's optional `tilt` and `dir`. At tilt 0 looking east it is exactly
  // the shipped formula. Looking west (dir -1) the depth runs toward -x and screen x grows toward the far touchline.
  const t = v.tilt ?? 0, dir = v.dir ?? 1;
  if (t === 0 && dir === 1) {
    const d = Math.max(2, x - v.x);
    const s = v.f / d;
    return { x: v.cx + (z - v.z) * s, y: v.horizon + (v.h - h) * s, s, k: Math.min(1, Math.max(0, (v.h - h) / d)), d };
  }
  const Z = dir * (x - v.x), X = dir * (z - v.z), Y = h - v.h;
  const c = Math.cos(t), sn = Math.sin(t);
  const Zc = Math.max(2, Z * c - Y * sn), Yc = Z * sn + Y * c;
  const s = v.f / Zc;
  return { x: v.cx + X * s, y: v.horizon - Yc * s, s, k: Math.min(1, Math.max(0, (v.h - h) / Zc)), d: Zc };
}

/** Screen y of the true horizon of a (tilted) view: horizon - f·tan(tilt). */
export function horizonY(v: DownPitchView) {
  return v.tilt ? v.horizon - v.f * Math.tan(v.tilt) : v.horizon;
}

export interface DownPitchOpts {
  /** How far the net is ballooned away from us (0..1). */
  bulge?: number;
  /** A ripple of camera flashes across the far stand, left to right: 0..1 = the wave front's position. */
  flashWave?: number;
  /** Strength of the flash wave (default 1). */
  flashAmt?: number;
  /** Ambient crowd camera flashes (default true). */
  ambientFlashes?: boolean;
  // ---- SPOTLIGHT SOLO v2 (omitted = the shipped lit view)
  /**
   * Floodlight bank levels 0..1 in pitchBanks order: far-left, far-right (the corner towers' lamp heads get lamp cells
   * and their glows scale by the level), near-left, near-right (roof banks drawn as lamp-grid glare at the top corners).
   */
  towers?: number[];
  /** Looking west (drawUpPitch): draw the near goal posts, crossbar and side netting where they project (9c's goal mouth). */
  posts?: boolean;
  // ---- GALE HAMMER v2
  /** The goal frame shoved this many world px back (+x) off its painted line (which stays at FIELD.goalX), with two furrows. */
  goalSlide?: number;
  /** Storm night 0..1: a cloud lid over the far stand, a navy multiply on it, mist streaks across the lamps. */
  storm?: number;
  // ---- MERIDIAN THREAD v2
  /** The two corner towers' lamp heads (left, right) catching the arc's jade light, 0..1 (see FieldBackdropOpts.lampTint). */
  lampTint?: number[];
}

/**
 * Draw the down-the-pitch ground in screen space (call env.screen() first): the far stand and floodlights
 * behind the goal, projected mowing stripes, the box lines, and the goal small at the vanishing area.
 * Shared by GALE HAMMER (shot 6) and MERIDIAN THREAD. Remembers `v` for projectDecal().
 */
export function drawDownPitch(ctx: CanvasRenderingContext2D, st: Stadium, v: DownPitchView, time: number, o: DownPitchOpts = {}) {
  lastView = v;
  const W = 640, H = 360;
  const gx = FIELD.goalX, gz = GOAL_Z();
  const P = (x: number, z: number, h = 0) => projectDecal(x, z, h, v);
  // v.dir -1 (drawUpPitch): the same renderer looking west: the far stand at x 40, the towers beyond it, the stripes,
  // the halfway line and centre circle, the near penalty box and D seen from the goal side; no goal (it is behind).
  const west = (v.dir ?? 1) < 0;
  const farX = west ? 40 : gx + 90, towerX = west ? -20 : gx + 150;

  // Night sky (only a sliver ever shows above the stand: no moon, no stars here).
  const standD = west ? v.x - farX : gx + 90 - v.x;
  const standTop = v.horizon + (v.h - 170) * (v.f / standD);
  const sky = ctx.createLinearGradient(0, standTop - 120, 0, v.horizon);
  sky.addColorStop(0, '#05030d');
  sky.addColorStop(1, '#1a1036');
  ctx.fillStyle = sky;
  const hy = v.tilt ? horizonY(v) : v.horizon;
  if (hy + 22 > -20) ctx.fillRect(-20, -20, W + 40, hy + 22);
  const storm = o.storm ?? 0;
  if (storm > 0 && hy + 22 > -20) {
    ctx.fillStyle = `rgba(6,11,36,${clamp(storm * 0.85)})`;
    ctx.fillRect(-20, -20, W + 40, hy + 22);
    stormLid(ctx, st, 0, W, standTop - 4, time, storm, 1, 0);
  }

  // Floodlight towers in the far corners (behind the stand's ends).
  for (const side of [-1, 1]) {
    const base = P(towerX, gz + side * 520, 0), top = P(towerX, gz + side * 520, 320);
    const tw = Math.max(2, 3 * base.s);
    ctx.fillStyle = '#1b1830';
    ctx.fillRect(base.x - tw / 2, top.y, tw, base.y - top.y);
    ctx.fillStyle = '#2b2746';
    ctx.fillRect(top.x - 18 * top.s, top.y - 14 * top.s, 36 * top.s, 16 * top.s);
    if (o.towers) {
      const b = { x: top.x - 18 * top.s, y: top.y - 14 * top.s, w: 36 * top.s, h: 16 * top.s, cols: 5, rows: 4 };
      bankCells(ctx, b, clamp(o.towers[top.x < v.cx ? 0 : 1] ?? 1));
    }
  }

  // Far stand behind the goal: the crowd strip as a vertical plane (smoothed: it is far away and the camera cranes).
  const sL = P(farX, gz - 900 * (west ? -1 : 1), 0), sR = P(farX, gz + 900 * (west ? -1 : 1), 0), sT = P(farX, gz, 150);
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(st.crowd, 0, 0, st.crowd.width, st.crowd.height, sL.x, sT.y, sR.x - sL.x, sL.y - sT.y);
  ctx.restore();
  // Roof edge.
  ctx.fillStyle = '#07050f';
  const roof = P(farX, gz, 168);
  ctx.fillRect(-20, roof.y, W + 40, Math.max(2, sT.y - roof.y));
  // Camera flashes: ambient twinkles plus an optional wave rippling left to right.
  ctx.globalCompositeOperation = 'lighter';
  const fw = o.flashWave, famt = o.flashAmt ?? 1;
  for (const fl of st.flashes) {
    const u = fl.x / st.crowd.width;
    const x = lerp(sL.x, sR.x, u), y = lerp(sT.y, sL.y, fl.y / st.crowd.height);
    if (x < -10 || x > W + 10) continue;
    let a = 0;
    if (o.ambientFlashes !== false) {
      const ph = (time * 0.9 + fl.t) % 3.2;
      if (ph < 0.12) a = 1 - ph / 0.12;
    }
    if (fw !== undefined) {
      // Map the visible part of the stand to the wave 0..1 so it crosses the frame.
      const sx = clamp(x / W);
      const dx = Math.abs(sx - fw);
      if (dx < 0.06) a = Math.max(a, (1 - dx / 0.06) * famt * (0.55 + 0.45 * ((fl.t * 7.3) % 1)));
    }
    if (a > 0) drawGlow(ctx, glowSprite('white', 0), x, y, 5, a);
  }
  // Lamp glows (warm floodlights).
  if (storm > 0) {
    // Storm: the far stand sits dark under a navy multiply (drawn before the lamps, which stay hot).
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = `rgb(${Math.round(lerp(255, 70, storm))},${Math.round(lerp(255, 86, storm))},${Math.round(lerp(255, 140, storm))})`;
    ctx.fillRect(-20, Math.min(roof.y, sT.y) - 2, W + 40, sL.y - Math.min(roof.y, sT.y) + 2);
    ctx.globalCompositeOperation = 'lighter';
  }
  for (const side of [-1, 1]) {
    const top = P(towerX, gz + side * 520, 312);
    const lv = o.towers ? clamp(o.towers[top.x < v.cx ? 0 : 1] ?? 1) : 1;
    if (lv <= 0) continue;
    drawGlow(ctx, glowOf([255, 250, 220]), top.x, top.y, 60, 0.5 * lv);
    const lt = o.lampTint ? clamp(o.lampTint[side < 0 ? 0 : 1] ?? 0) : 0;
    if (lt > 0) lampCore(ctx, top.x, top.y, 20, 0.85 * lv, lt);
    else drawGlow(ctx, glowOf([255, 255, 255]), top.x, top.y, 20, 0.85 * lv);
  }
  if (o.towers) {
    // SPOTLIGHT SOLO v2: the near roof banks at the top corners (lamp cells + glare by level).
    for (let i = 0; i < 2; i++) {
      const b = NEAR_BANKS[i], lv = clamp(o.towers[2 + i] ?? 1);
      ctx.globalCompositeOperation = 'source-over';
      bankCells(ctx, b, lv);
      ctx.globalCompositeOperation = 'lighter';
      if (lv > 0) {
        drawGlow(ctx, glowOf([255, 250, 220]), b.x + b.w / 2, b.y + b.h / 2, 150, 0.45 * lv, 1.3, 0.8);
        drawGlow(ctx, glowOf([255, 255, 255]), b.x + b.w / 2, b.y + b.h / 2, 60, 0.7 * lv, 1.4, 0.6);
      }
    }
  }
  ctx.globalCompositeOperation = 'source-over';
  if (storm > 0) mistStreaks(ctx, 0, W, Math.max(-20, standTop - 60), sL.y, time, storm, 1);

  // Turf: run-off behind the goal line, then 5 m mowing stripes toward the eye.
  ctx.fillStyle = '#245f2d';
  ctx.fillRect(-20, sL.y, W + 40, H - sL.y + 20);
  const near = v.x + 3;
  const step = 50;
  if (!west)
    for (let x = Math.floor(near / step) * step; x < gx; x += step) {
      const a = P(Math.max(near, x), gz), b = P(Math.min(gx, x + step), gz);
      if (b.y > H + 20) continue;
      ctx.fillStyle = Math.round(x / step) % 2 === 0 ? '#2f8a3c' : '#287a35';
      ctx.fillRect(-20, b.y, W + 40, Math.min(H + 20, a.y) - b.y + 1);
    }
  else {
    // Looking west: the stripe [x - step, x] keeps the colour it has looking east.
    const nearW = v.x - 3;
    for (let x = Math.ceil(nearW / step) * step; x > farX; x -= step) {
      const a = P(Math.min(nearW, x), gz), b = P(Math.max(farX, x - step), gz);
      if (b.y > H + 20) continue;
      ctx.fillStyle = Math.round((x - step) / step) % 2 === 0 ? '#2f8a3c' : '#287a35';
      ctx.fillRect(-20, b.y, W + 40, Math.min(H + 20, a.y) - b.y + 1);
    }
  }
  // Depth haze toward the horizon.
  const hz = ctx.createLinearGradient(0, sL.y, 0, sL.y + 80);
  hz.addColorStop(0, 'rgba(10,14,40,0.45)');
  hz.addColorStop(1, 'rgba(10,14,40,0)');
  ctx.fillStyle = hz;
  ctx.fillRect(-20, sL.y, W + 40, 80);

  drawPitchLines(ctx, v);
  if (west) {
    if (o.posts) upPitchPosts(ctx, v);
    return;
  }

  // Goal: net (behind) then posts and crossbar. 7.32 m x 2.44 m, net 2 m deep, ballooning away from us.
  const bulge = o.bulge ?? 0;
  const half = 37, GH = 24, GD = 20;
  const slide = o.goalSlide ?? 0;
  if (slide > 0) {
    // GALE v2: the two furrows the shoved posts ploughed, from the painted line to the post feet (soil core, grass lips).
    for (const side of [-1, 1]) {
      const zz = gz + side * half;
      const a0 = P(gx, zz - 2), a1 = P(gx, zz + 2), b0 = P(gx + slide, zz - 2), b1 = P(gx + slide, zz + 2);
      ctx.fillStyle = '#163a1c';
      ctx.beginPath();
      ctx.moveTo(a0.x - 1, a0.y);
      ctx.lineTo(b0.x - 1, b0.y);
      ctx.lineTo(b1.x + 1, b1.y);
      ctx.lineTo(a1.x + 1, a1.y);
      ctx.fill();
      ctx.fillStyle = '#4a3424';
      ctx.beginPath();
      ctx.moveTo(a0.x, a0.y);
      ctx.lineTo(b0.x, b0.y);
      ctx.lineTo(b1.x, b1.y);
      ctx.lineTo(a1.x, a1.y);
      ctx.fill();
    }
  }
  const gxL = gx + slide;
  ctx.strokeStyle = 'rgba(230,235,255,0.5)';
  ctx.lineWidth = 1;
  const netPt = (u: number, w: number): [number, number] => {
    const bump = Math.sin(u * Math.PI) * Math.sin(w * Math.PI * 0.9 + 0.1);
    const q = P(gxL + GD + bump * bulge * 26, gz + (u - 0.5) * 2 * half * (1 + bump * bulge * 0.12), GH * (1 - w) * 0.92);
    return [q.x, q.y];
  };
  for (let i = 0; i <= 8; i++) {
    ctx.beginPath();
    for (let j = 0; j <= 6; j++) {
      const [x, y] = netPt(i / 8, j / 6);
      j ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
  }
  for (let j = 0; j <= 6; j++) {
    ctx.beginPath();
    for (let i = 0; i <= 8; i++) {
      const [x, y] = netPt(i / 8, j / 6);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
  }
  // Side and roof nets: from the frame back to the back panel's edges.
  for (const u of [0, 1]) {
    const post = P(gxL, gz + (u - 0.5) * 2 * half, 0), top = P(gxL, gz + (u - 0.5) * 2 * half, GH);
    const [bx0, by0] = netPt(u, 1), [bx1, by1] = netPt(u, 0);
    ctx.beginPath();
    ctx.moveTo(post.x, post.y);
    ctx.lineTo(bx0, by0);
    ctx.moveTo(top.x, top.y);
    ctx.lineTo(bx1, by1);
    ctx.stroke();
  }
  const pl = P(gxL, gz - half, 0), pr = P(gxL, gz + half, 0), tl = P(gxL, gz - half, GH), tr = P(gxL, gz + half, GH);
  const pw = Math.max(1.5, 1.2 * pl.s);
  ctx.fillStyle = '#180411';
  ctx.fillRect(tl.x - pw / 2 - 1, tl.y - pw / 2 - 1, tr.x - tl.x + pw + 2, pw + 2);
  ctx.fillStyle = '#f4f6ff';
  ctx.fillRect(tl.x - pw / 2, tl.y, pw, pl.y - tl.y);
  ctx.fillRect(tr.x - pw / 2, tr.y, pw, pr.y - tr.y);
  ctx.fillRect(tl.x - pw / 2, tl.y - pw / 2, tr.x - tl.x + pw, pw);
}

/**
 * SPOTLIGHT SOLO v2 (DownPitchOpts.posts, looking west from the goal mouth): the goal's posts and crossbar at
 * x = FIELD.goalX and the side netting running back from them, drawn where they project (often only a slab of post
 * at the frame edge). Points behind the eye are clamped by projectDecal; nothing is drawn when the frame misses it.
 */
function upPitchPosts(ctx: CanvasRenderingContext2D, v: DownPitchView) {
  const gx = FIELD.goalX, gz = GOAL_Z(), half = 37, GH = 24, GD = 20;
  if ((v.dir ?? 1) > 0 || v.x - gx > 400) return;
  const P = (x: number, z: number, h = 0) => projectDecal(x, z, h, v);
  ctx.save();
  ctx.strokeStyle = 'rgba(230,235,255,0.4)';
  ctx.lineWidth = 1;
  for (const side of [-1, 1]) {
    const z = gz + side * half;
    for (let k = 0; k <= 4; k++) {
      const a = P(gx, z, (GH * k) / 4), b = P(Math.min(v.x - 1, gx + GD), z, (GH * k) / 4 * 0.6);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }
  for (const side of [-1, 1]) {
    const bot = P(gx, gz + side * half, 0), top = P(gx, gz + side * half, GH);
    const w = Math.max(1.5, 1.2 * bot.s);
    ctx.fillStyle = '#180411';
    ctx.fillRect(bot.x - w / 2 - 1, top.y - 1, w + 2, bot.y - top.y + 2);
    ctx.fillStyle = '#f4f6ff';
    ctx.fillRect(bot.x - w / 2, top.y, w, bot.y - top.y);
  }
  const tl = P(gx, gz - half, GH), tr = P(gx, gz + half, GH);
  const w = Math.max(1.5, 1.2 * tl.s);
  ctx.fillStyle = '#f4f6ff';
  ctx.fillRect(Math.min(tl.x, tr.x), Math.min(tl.y, tr.y) - w / 2, Math.abs(tr.x - tl.x), w);
  ctx.restore();
}

/** The halfway line's field x (the pitch canvas draws it there). */
const HALFWAY_X = 260;

/**
 * The pitch's ground lines in a down/up-pitch view (shared by both directions): the goal line, the six-yard and
 * penalty boxes, the D and the spot, plus (looking west) the halfway line and centre circle; widths shrink with depth.
 * drawDownPitch draws them in white; call it again after a dim with another colour / alpha (screen space).
 */
export function drawPitchLines(ctx: CanvasRenderingContext2D, v: DownPitchView, a = 1, color = 'rgba(240,245,255,0.85)') {
  const gx = FIELD.goalX, gz = GOAL_Z();
  const P = (x: number, z: number, h = 0) => projectDecal(x, z, h, v);
  const west = (v.dir ?? 1) < 0;
  // Clip in depth: looking west, mirror x about the eye so the same clipping code runs on depth.
  const ux = (x: number) => (west ? 2 * v.x - x : x);
  const near = v.x + 3;
  if (a !== 1) ctx.globalAlpha = a;
  // Lines: a ground polyline projected in pieces, its width shrinking with depth.
  ctx.strokeStyle = color;
  ctx.lineCap = 'butt';
  const groundLine = (pts: [number, number][]) => {
    for (let i = 0; i + 1 < pts.length; i++) {
      const [x0, z0] = pts[i], [x1, z1] = pts[i + 1];
      const n = Math.max(1, Math.ceil(Math.abs(x1 - x0) / 20));
      for (let k = 0; k < n; k++) {
        let xa = lerp(x0, x1, k / n), xb = lerp(x0, x1, (k + 1) / n);
        let za = lerp(z0, z1, k / n), zb = lerp(z0, z1, (k + 1) / n);
        if (Math.max(ux(xa), ux(xb)) <= near) continue;
        xa = ux(xa);
        xb = ux(xb);
        if (xa < near) {
          const u = (near - xa) / (xb - xa);
          xa = near;
          za = lerp(za, zb, u);
        }
        if (xb < near) {
          const u = (near - xb) / (xa - xb);
          xb = near;
          zb = lerp(zb, za, u);
        }
        const a = P(ux(xa), za), b = P(ux(xb), zb);
        ctx.lineWidth = Math.max(1, 1.2 * Math.min(a.s, b.s));
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  };
  groundLine([[gx, gz - 340], [gx, gz + 340]]); // goal line
  groundLine([[gx, gz - 92], [gx - 55, gz - 92], [gx - 55, gz + 92], [gx, gz + 92]]); // six-yard box
  groundLine([[gx, gz - 202], [gx - 165, gz - 202], [gx - 165, gz + 202], [gx, gz + 202]]); // penalty box
  // The "D": the part of the 9.15 m circle round the spot that lies outside the box.
  const arc: [number, number][] = [];
  for (let i = 0; i <= 16; i++) {
    const a = Math.PI - 0.92 + (1.84 * i) / 16;
    arc.push([gx - 110 + Math.cos(a) * 91.5, gz + Math.sin(a) * 91.5]);
  }
  groundLine(arc);
  const spot = P(gx - 110, gz);
  ctx.fillStyle = color;
  ctx.fillRect(spot.x - Math.max(1, spot.s), spot.y - 0.5, Math.max(2, 2 * spot.s), 1);
  if (west) {
    // The halfway line, the centre circle and the centre spot.
    groundLine([[HALFWAY_X, gz - 340], [HALFWAY_X, gz + 340]]);
    const circle: [number, number][] = [];
    for (let i = 0; i <= 32; i++) circle.push([HALFWAY_X + Math.cos((i / 32) * Math.PI * 2) * 91.5, gz + Math.sin((i / 32) * Math.PI * 2) * 91.5]);
    groundLine(circle);
    const cs = P(HALFWAY_X, gz);
    if (cs.d > 2) ctx.fillRect(cs.x - Math.max(1, cs.s), cs.y - 0.5, Math.max(2, 2 * cs.s), 1);
  }
  if (a !== 1) ctx.globalAlpha = 1;

}

/**
 * The up-pitch view: the same pitch renderer as drawDownPitch looking west (-x) (v.dir -1): the far stand at x 40,
 * the stripes, the halfway line and centre circle, the near penalty box and D seen from the goal side.
 * Remembers `v` like drawDownPitch (projectDecal then projects with dir -1).
 */
export function drawUpPitch(ctx: CanvasRenderingContext2D, st: Stadium, v: DownPitchView, time: number, o: DownPitchOpts = {}) {
  drawDownPitch(ctx, st, v.dir === -1 ? v : { ...v, dir: -1 }, time, o);
}

// ================================================================ MERIDIAN THREAD v2 views (screen space)
// The arc's floodlights stay ON and passive: lamp heads only catch the jade light as a smooth function of distance
// (the shot computes it with lampTintFor). Nothing here switches a bank, dims a lamp or casts a shaft.

const mixC = (a: readonly number[], b: readonly number[], k: number) =>
  `rgb(${Math.round(lerp(a[0], b[0], k))},${Math.round(lerp(a[1], b[1], k))},${Math.round(lerp(a[2], b[2], k))})`;
const WARM_LAMP = [255, 251, 232] as const;

/**
 * The foreground floodlight pylon (MERIDIAN v2 shot 4's wipe): an ink silhouette lattice mast under an 8 x 4 lamp grid,
 * drawn in the current transform. (x, y) = the top centre of the lamp head, s = px per pylon unit (the head is 58 x 28
 * units; cells 5 x 4 on a 7 x 6 pitch; the mast runs 600 units down). rowTint[r] (0..1, top row first) turns that
 * row's lamps jade-white with its own glow: pass lampTintFor values every frame (smooth, never switched).
 */
export function drawPylon(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rowTint: readonly number[] = [0, 0, 0, 0]) {
  const W = 58 * s, H = 28 * s;
  const x0 = x - W / 2;
  ctx.save();
  // Mast: two rails and cross-braces (ink).
  ctx.fillStyle = '#07050f';
  ctx.strokeStyle = '#07050f';
  const railW = Math.max(1, 3 * s), mastW = 22 * s, top = y + H;
  ctx.fillRect(x - mastW / 2, top, railW, 600 * s);
  ctx.fillRect(x + mastW / 2 - railW, top, railW, 600 * s);
  ctx.lineWidth = Math.max(1, 1.5 * s);
  ctx.beginPath();
  for (let k = 0; k < 30; k++) {
    const yy = top + k * 20 * s;
    ctx.moveTo(x - mastW / 2, yy);
    ctx.lineTo(x + mastW / 2, yy + 20 * s);
    ctx.moveTo(x + mastW / 2, yy);
    ctx.lineTo(x - mastW / 2, yy + 20 * s);
  }
  ctx.stroke();
  // Head frame.
  ctx.fillStyle = '#0b0a14';
  ctx.fillRect(x0 - 2 * s, y - 2 * s, W + 4 * s, H + 4 * s);
  ctx.fillStyle = '#07050f';
  ctx.fillRect(x0 - 2 * s, y + H + 2 * s, W + 4 * s, 3 * s);
  // Lamps by row.
  for (let r = 0; r < 4; r++) {
    const k = clamp(rowTint[r] ?? 0);
    ctx.fillStyle = mixC(WARM_LAMP, LAMP_JADE, k);
    for (let c = 0; c < 8; c++) ctx.fillRect(x0 + (2 + c * 7) * s, y + (2 + r * 6) * s, 5 * s, 4 * s);
  }
  ctx.globalCompositeOperation = 'lighter';
  for (let r = 0; r < 4; r++) {
    const k = clamp(rowTint[r] ?? 0);
    const yy = y + (4 + r * 6) * s;
    drawGlow(ctx, glowOf([255, 250, 220]), x, yy, 46 * s, 0.22 * (1 - k), 1.6, 0.5);
    drawGlow(ctx, glowOf(LAMP_JADE), x, yy, 46 * s, 0.3 * k, 1.6, 0.5);
    drawGlow(ctx, glowOf([47, 224, 138]), x, yy, 70 * s, 0.16 * k, 1.4, 0.6);
  }
  ctx.restore();
}

/** Options for altitudeBackdrop (all optional). Layer positions are in ride-world units (ARC: X = (x-772)·3, Y = -h·4). */
export interface AltitudeOpts {
  /** Camera zoom (the layers scale with it). Default 1. */
  zoom?: number;
  /** Seconds, for the slow tone drift. */
  time?: number;
  /** Ride-world Y of the far stand's roofline (parallax 0.35). Default -520. */
  roofY?: number;
  /** Ride-world X spacing of the far floodlight towers along the roofline (parallax 0.35). Default 380. */
  towerEvery?: number;
  /** The tint (0..1) of a far lamp head at screen (sx, sy): pass a lampTintFor closure. Default 0. */
  lampTint?: (sx: number, sy: number) => number;
  /** The pre-rendered pitch strip (pitchStrip()), drawn at parallax 0.35 with its top-left at ride-world (pitchX, pitchY). */
  pitch?: HTMLCanvasElement | null;
  pitchX?: number;
  pitchY?: number;
  /** Ride-world Y of the near stand's roof edge (parallax 0.7). Default 120 (null = not drawn). */
  nearY?: number | null;
}

/** Screen position of a ride-world point on a parallax layer (camera (cx, cy), zoom z, parallax p). */
export function parallaxAt(cx: number, cy: number, z: number, p: number, X: number, Y: number): [number, number] {
  return [320 + (X - cx) * z * p, 180 + (Y - cy) * z * p];
}

const pitchStrips = new WeakMap<Stadium, Map<number, HTMLCanvasElement>>();
/** The field pitch (st.pitch, 1400 x 260) box-scaled to `scale` (0.35: 490 x 91): shot 4's pitch far below. Cached; build in prepare(). */
export function pitchStrip(st: Stadium, scale = 0.35): HTMLCanvasElement {
  let m = pitchStrips.get(st);
  if (!m) pitchStrips.set(st, (m = new Map()));
  let cv = m.get(scale);
  if (!cv) {
    const [c, g] = mk(Math.max(1, Math.round(st.pitch.width * scale)), Math.max(1, Math.round(st.pitch.height * scale)));
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = 'high';
    g.drawImage(st.pitch, 0, 0, c.width, c.height);
    m.set(scale, (cv = c));
  }
  return cv;
}

const toneTiles = new Map<string, HTMLCanvasElement>();
/** A 4 x 4 screentone tile (a 2 x 2 dot + a 1 px dot) in `c` on transparent. */
function toneTile(c: string): HTMLCanvasElement {
  let t = toneTiles.get(c);
  if (!t) {
    const [cv, g] = mk(4, 4);
    g.fillStyle = c;
    g.fillRect(0, 0, 2, 2);
    g.fillRect(2, 2, 1, 1);
    toneTiles.set(c, (t = cv));
  }
  return t;
}

/** Fill the current transform's rect with a screentone pattern (`c` dots) at alpha a, offset by (ox, oy) px. */
function toneFill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string, a: number, ox = 0, oy = 0) {
  if (a <= 0) return;
  const pat = ctx.createPattern(toneTile(c), 'repeat');
  if (!pat) return;
  ctx.save();
  ctx.globalAlpha = clamp(a);
  ctx.imageSmoothingEnabled = false;
  ctx.translate(Math.round(ox) % 4, Math.round(oy) % 4);
  ctx.fillStyle = pat;
  ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
  ctx.restore();
}

/**
 * MERIDIAN v2 shots 4 and 6b: the ride world's stadium layers seen from up in the bowl (ZENITH shot 4's sky-by-altitude
 * skeleton, re-skinned: no stars, no clouds, no moon). Screen space (call env.screen() first); the camera is the ride
 * world's (camX, camY, o.zoom). Back to front: the screentone ink sky (parallax 0.08; [4,17,12] -> [10,42,30]), the
 * far stand's roofline and its floodlight lamp heads (0.35; tints from o.lampTint), the pitch strip far below (0.35),
 * the near stand's roof edge (0.7). The foreground pylon (1.4) is the shot's drawPylon call.
 */
export function altitudeBackdrop(ctx: CanvasRenderingContext2D, st: Stadium, camX: number, camY: number, o: AltitudeOpts = {}) {
  const z = o.zoom ?? 1, time = o.time ?? 0;
  const W = 640, H = 360;
  // Sky (0.08): the ink-green screentone gradient.
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#04110c');
  sky.addColorStop(1, '#0a2a1e');
  ctx.fillStyle = sky;
  ctx.fillRect(-4, -4, W + 8, H + 8);
  const [tx, ty] = parallaxAt(camX, camY, z, 0.08, 0, 0);
  toneFill(ctx, 0, 0, W, H, '#020806', 0.55, tx + time * 2, ty);
  // Far roofline (0.35): the stand's dark mass below the roof edge, the crowd strip ghosted in it, towers above it.
  const roofY = o.roofY ?? -520;
  const [, ry] = parallaxAt(camX, camY, z, 0.35, 0, roofY);
  const zp = z * 0.35;
  if (ry < H + 40) {
    ctx.fillStyle = '#050b08';
    ctx.fillRect(-4, ry, W + 8, H - ry + 8);
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.imageSmoothingEnabled = true;
    const cw = st.crowd.width * zp * 1.4, chh = st.crowd.height * zp * 1.4;
    const [cx0] = parallaxAt(camX, camY, z, 0.35, -600, 0);
    for (let x = cx0 - Math.ceil((cx0 + 10) / cw) * cw; x < W; x += cw) ctx.drawImage(st.crowd, x, ry + 10 * zp, cw, chh);
    ctx.restore();
    toneFill(ctx, 0, ry, W, H - ry, '#000000', 0.5);
    ctx.fillStyle = '#020403';
    ctx.fillRect(-4, ry - 6 * zp, W + 8, 10 * zp);
  }
  // Floodlight towers along the roofline with their lamp heads.
  const every = o.towerEvery ?? 380;
  const first = Math.floor((camX - 640 / (zp || 1)) / every) - 1, last = Math.ceil((camX + 640 / (zp || 1)) / every) + 1;
  for (let k = first; k <= last; k++) {
    const [sx, sy] = parallaxAt(camX, camY, z, 0.35, k * every + 120, roofY);
    if (sx < -80 || sx > W + 80) continue;
    const headY = sy - 150 * zp, hw = 40 * zp, hh = 22 * zp;
    if (headY > H + 20) continue;
    ctx.fillStyle = '#030605';
    ctx.fillRect(sx - 3 * zp, headY + hh, 6 * zp, sy - headY - hh);
    ctx.fillRect(sx - hw / 2 - 2 * zp, headY - 2 * zp, hw + 4 * zp, hh + 4 * zp);
    const lt = clamp(o.lampTint ? o.lampTint(sx, headY + hh / 2) : 0);
    ctx.fillStyle = mixC(WARM_LAMP, LAMP_JADE, lt);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) ctx.fillRect(sx - hw / 2 + (1 + c * 8) * zp, headY + (1 + r * 7) * zp, 6 * zp, 5 * zp);
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf([255, 250, 220]), sx, headY + hh / 2, 60 * zp + 10, 0.35);
    lampCore(ctx, sx, headY + hh / 2, 22 * zp + 4, 0.8, lt);
    ctx.globalCompositeOperation = 'source-over';
  }
  // The pitch far below (0.35).
  if (o.pitch) {
    const [px, py] = parallaxAt(camX, camY, z, 0.35, o.pitchX ?? 0, o.pitchY ?? 0);
    if (py < H + 10) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(o.pitch, px, py, o.pitch.width * zp * (1 / 0.35), o.pitch.height * zp * (1 / 0.35));
      ctx.restore();
    }
  }
  // Near stand's roof edge (0.7): an ink wedge sloping up to the right with a lip.
  if (o.nearY !== null) {
    const [, ny] = parallaxAt(camX, camY, z, 0.7, 0, o.nearY ?? 120);
    if (ny < H + 60) {
      ctx.fillStyle = '#010302';
      ctx.beginPath();
      ctx.moveTo(-10, ny + 30 * z);
      ctx.lineTo(W + 10, ny - 10 * z);
      ctx.lineTo(W + 10, H + 10);
      ctx.lineTo(-10, H + 10);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#16302a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-10, ny + 30 * z);
      ctx.lineTo(W + 10, ny - 10 * z);
      ctx.stroke();
    }
  }
}

/** Options for upView. */
export interface UpViewOpts {
  time?: number;
  /** The two towers' lamp heads (left, right) catching the arc's jade light, 0..1. */
  lampTint?: readonly number[];
  /** How far the towers lean in toward the top (0..1, default 1). */
  lean?: number;
  /** Screen y of the roof-rim wedges' inner tips (default 120). */
  rim?: number;
}

/**
 * MERIDIAN v2 shot 6a: the worm's-eye stadium (adapted from ZENITH shot 6a's rim-from-below renderer, regraded): the
 * emerald-black screentone sky, the roof rim as dark wedges in the top corners, two floodlight towers leaning in
 * toward the top in perspective with their lamp heads tinted by o.lampTint. Screen space.
 */
export function upView(ctx: CanvasRenderingContext2D, st: Stadium, o: UpViewOpts = {}) {
  const W = 640, H = 360, time = o.time ?? 0;
  const lean = o.lean ?? 1, rim = o.rim ?? 120;
  const g = ctx.createRadialGradient(W / 2, H * 0.42, 20, W / 2, H * 0.42, 420);
  g.addColorStop(0, '#0c2e21');
  g.addColorStop(0.55, '#06140f');
  g.addColorStop(1, '#020806');
  ctx.fillStyle = g;
  ctx.fillRect(-4, -4, W + 8, H + 8);
  toneFill(ctx, 0, 0, W, H, '#010403', 0.45, time * 3, 0);
  // Roof rim wedges (top corners), with the crowd's front rows ghosted under the lip.
  for (const side of [-1, 1]) {
    const x0 = side < 0 ? -10 : W + 10;
    ctx.fillStyle = '#010302';
    ctx.beginPath();
    ctx.moveTo(x0, -10);
    ctx.lineTo(W / 2 - side * 70, -10);
    ctx.lineTo(x0 + side * -1 * 30, rim + 40);
    ctx.lineTo(x0, rim + 90);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#163a2b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 - side * 70, -10);
    ctx.lineTo(x0 + side * -1 * 30, rim + 40);
    ctx.stroke();
  }
  // Two towers leaning in: bases below the bottom corners, heads near the top.
  for (const [i, side] of [[0, -1], [1, 1]] as const) {
    const bx = side < 0 ? 30 : W - 30, by = H + 40;
    const hx = lerp(bx, side < 0 ? 150 : W - 150, lean), hy = 52;
    const ang = Math.atan2(hy - by, hx - bx) + Math.PI / 2;
    ctx.save();
    ctx.fillStyle = '#020403';
    ctx.beginPath();
    ctx.moveTo(bx - 14, by);
    ctx.lineTo(bx + 14, by);
    ctx.lineTo(hx + 3, hy + 20);
    ctx.lineTo(hx - 3, hy + 20);
    ctx.closePath();
    ctx.fill();
    ctx.translate(hx, hy);
    ctx.rotate(ang);
    const lt = clamp(o.lampTint?.[i] ?? 0);
    ctx.fillStyle = '#050908';
    ctx.fillRect(-26, -16, 52, 30);
    ctx.fillStyle = mixC(WARM_LAMP, LAMP_JADE, lt);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) ctx.fillRect(-23 + c * 8, -13 + r * 7, 6, 5);
    ctx.restore();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf([255, 250, 220]), hx, hy, 90, 0.3);
    lampCore(ctx, hx, hy, 28, 0.85, lt);
    ctx.globalCompositeOperation = 'source-over';
  }
  void st;
}
