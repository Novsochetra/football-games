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

/** Draw the side-view field world (stands, lights, pitch). Camera transform already applied. */
export function drawFieldBackdrop(ctx: CanvasRenderingContext2D, st: Stadium, camX: number, camY: number, time: number) {
  const left = camX - 400, right = camX + 400;
  // Sky
  const sky = ctx.createLinearGradient(0, camY - 260, 0, FIELD.horizon);
  sky.addColorStop(0, '#05030d');
  sky.addColorStop(0.6, '#140c2e');
  sky.addColorStop(1, '#2a1640');
  ctx.fillStyle = sky;
  ctx.fillRect(left - 200, camY - 400, 1200, FIELD.horizon - (camY - 400));
  // Stars (strong parallax)
  ctx.fillStyle = '#cfd6ff';
  for (const s of st.stars) {
    const x = s.x + camX * 0.85 - 1000;
    if (x < left - 10 || x > right + 10 || s.y > 40) continue;
    ctx.globalAlpha = s.b * (0.6 + 0.4 * Math.sin(time * 3 + s.x));
    ctx.fillRect(Math.round(x), Math.round(s.y), 1, 1);
  }
  ctx.globalAlpha = 1;

  // Floodlight towers (parallax 0.5)
  for (const tx of [120, 620, 1120, 1620]) {
    const x = tx + camX * 0.5 - 300;
    if (x < left - 60 || x > right + 60) continue;
    ctx.drawImage(st.tower, Math.round(x), -40);
  }
  // Crowd (parallax 0.25)
  const cx = camX * 0.25 - 220;
  ctx.drawImage(st.crowd, Math.round(cx), FIELD.horizon - 110);
  // Roof edge
  ctx.fillStyle = '#07050f';
  ctx.fillRect(left - 200, FIELD.horizon - 122, 1200, 14);

  // Camera flashes in the crowd
  ctx.globalCompositeOperation = 'lighter';
  for (const f of st.flashes) {
    const ph = (time * 0.9 + f.t) % 3.2;
    if (ph > 0.12) continue;
    const x = f.x + cx;
    drawGlow(ctx, glowSprite('white', 0), x, FIELD.horizon - 110 + f.y, 6, 1 - ph / 0.12);
  }
  // Lamp glows
  for (const tx of [120, 620, 1120, 1620]) {
    const x = tx + camX * 0.5 - 300 + 20;
    if (x < left - 120 || x > right + 120) continue;
    drawGlow(ctx, glowOf([255, 250, 220]), x, -26, 70, 0.55);
    drawGlow(ctx, glowOf([255, 255, 255]), x, -26, 26, 0.9);
  }
  ctx.globalCompositeOperation = 'source-over';

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
  /** Screen y of the horizon. */
  horizon: number;
  /** Screen x of the view axis. */
  cx: number;
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
  const d = Math.max(2, x - v.x);
  const s = v.f / d;
  return { x: v.cx + (z - v.z) * s, y: v.horizon + (v.h - h) * s, s, k: Math.min(1, Math.max(0, (v.h - h) / d)), d };
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

  // Night sky (only a sliver ever shows above the stand: no moon, no stars here).
  const standD = gx + 90 - v.x;
  const standTop = v.horizon + (v.h - 170) * (v.f / standD);
  const sky = ctx.createLinearGradient(0, standTop - 120, 0, v.horizon);
  sky.addColorStop(0, '#05030d');
  sky.addColorStop(1, '#1a1036');
  ctx.fillStyle = sky;
  ctx.fillRect(-20, -20, W + 40, v.horizon + 22);

  // Floodlight towers in the far corners (behind the stand's ends).
  for (const side of [-1, 1]) {
    const base = P(gx + 150, gz + side * 520, 0), top = P(gx + 150, gz + side * 520, 320);
    const tw = Math.max(2, 3 * base.s);
    ctx.fillStyle = '#1b1830';
    ctx.fillRect(base.x - tw / 2, top.y, tw, base.y - top.y);
    ctx.fillStyle = '#2b2746';
    ctx.fillRect(top.x - 18 * top.s, top.y - 14 * top.s, 36 * top.s, 16 * top.s);
  }

  // Far stand behind the goal: the crowd strip as a vertical plane (smoothed: it is far away and the camera cranes).
  const sL = P(gx + 90, gz - 900, 0), sR = P(gx + 90, gz + 900, 0), sT = P(gx + 90, gz, 150);
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(st.crowd, 0, 0, st.crowd.width, st.crowd.height, sL.x, sT.y, sR.x - sL.x, sL.y - sT.y);
  ctx.restore();
  // Roof edge.
  ctx.fillStyle = '#07050f';
  const roof = P(gx + 90, gz, 168);
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
  for (const side of [-1, 1]) {
    const top = P(gx + 150, gz + side * 520, 312);
    drawGlow(ctx, glowOf([255, 250, 220]), top.x, top.y, 60, 0.5);
    drawGlow(ctx, glowOf([255, 255, 255]), top.x, top.y, 20, 0.85);
  }
  ctx.globalCompositeOperation = 'source-over';

  // Turf: run-off behind the goal line, then 5 m mowing stripes toward the eye.
  ctx.fillStyle = '#245f2d';
  ctx.fillRect(-20, sL.y, W + 40, H - sL.y + 20);
  const near = v.x + 3;
  const step = 50;
  for (let x = Math.floor(near / step) * step; x < gx; x += step) {
    const a = P(Math.max(near, x), gz), b = P(Math.min(gx, x + step), gz);
    if (b.y > H + 20) continue;
    ctx.fillStyle = Math.round(x / step) % 2 === 0 ? '#2f8a3c' : '#287a35';
    ctx.fillRect(-20, b.y, W + 40, Math.min(H + 20, a.y) - b.y + 1);
  }
  // Depth haze toward the horizon.
  const hz = ctx.createLinearGradient(0, sL.y, 0, sL.y + 80);
  hz.addColorStop(0, 'rgba(10,14,40,0.45)');
  hz.addColorStop(1, 'rgba(10,14,40,0)');
  ctx.fillStyle = hz;
  ctx.fillRect(-20, sL.y, W + 40, 80);

  // Lines: a ground polyline projected in pieces, its width shrinking with depth.
  ctx.strokeStyle = 'rgba(240,245,255,0.85)';
  ctx.lineCap = 'butt';
  const groundLine = (pts: [number, number][]) => {
    for (let i = 0; i + 1 < pts.length; i++) {
      const [x0, z0] = pts[i], [x1, z1] = pts[i + 1];
      const n = Math.max(1, Math.ceil(Math.abs(x1 - x0) / 20));
      for (let k = 0; k < n; k++) {
        let xa = lerp(x0, x1, k / n), xb = lerp(x0, x1, (k + 1) / n);
        let za = lerp(z0, z1, k / n), zb = lerp(z0, z1, (k + 1) / n);
        if (Math.max(xa, xb) <= near) continue;
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
        const a = P(xa, za), b = P(xb, zb);
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
  ctx.fillStyle = 'rgba(240,245,255,0.85)';
  ctx.fillRect(spot.x - Math.max(1, spot.s), spot.y - 0.5, Math.max(2, 2 * spot.s), 1);

  // Goal: net (behind) then posts and crossbar. 7.32 m x 2.44 m, net 2 m deep, ballooning away from us.
  const bulge = o.bulge ?? 0;
  const half = 37, GH = 24, GD = 20;
  ctx.strokeStyle = 'rgba(230,235,255,0.5)';
  ctx.lineWidth = 1;
  const netPt = (u: number, w: number): [number, number] => {
    const bump = Math.sin(u * Math.PI) * Math.sin(w * Math.PI * 0.9 + 0.1);
    const q = P(gx + GD + bump * bulge * 26, gz + (u - 0.5) * 2 * half * (1 + bump * bulge * 0.12), GH * (1 - w) * 0.92);
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
    const post = P(gx, gz + (u - 0.5) * 2 * half, 0), top = P(gx, gz + (u - 0.5) * 2 * half, GH);
    const [bx0, by0] = netPt(u, 1), [bx1, by1] = netPt(u, 0);
    ctx.beginPath();
    ctx.moveTo(post.x, post.y);
    ctx.lineTo(bx0, by0);
    ctx.moveTo(top.x, top.y);
    ctx.lineTo(bx1, by1);
    ctx.stroke();
  }
  const pl = P(gx, gz - half, 0), pr = P(gx, gz + half, 0), tl = P(gx, gz - half, GH), tr = P(gx, gz + half, GH);
  const pw = Math.max(1.5, 1.2 * pl.s);
  ctx.fillStyle = '#180411';
  ctx.fillRect(tl.x - pw / 2 - 1, tl.y - pw / 2 - 1, tr.x - tl.x + pw + 2, pw + 2);
  ctx.fillStyle = '#f4f6ff';
  ctx.fillRect(tl.x - pw / 2, tl.y, pw, pl.y - tl.y);
  ctx.fillRect(tr.x - pw / 2, tr.y, pw, pr.y - tr.y);
  ctx.fillRect(tl.x - pw / 2, tl.y - pw / 2, tr.x - tl.x + pw, pw);
}
