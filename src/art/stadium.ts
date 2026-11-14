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

/** Goal frame + net, side view. `bulge` pushes the back net outward (0..1+). part: 'back' draws net, 'front' draws the near post. */
export function drawGoal(ctx: CanvasRenderingContext2D, part: 'back' | 'front', bulge = 0, shake = 0) {
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
      const b = Math.sin(u * Math.PI) * Math.sin(v * Math.PI * 0.9 + 0.1) * bulge * 46;
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
