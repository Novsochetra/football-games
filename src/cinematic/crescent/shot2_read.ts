// SHOT 2 — READ THE CROSS: front low-angle close-up of No.10, cool and quiet.
// The cross falls out of the night in slow motion behind and above him while the stadium
// swells around him in a dolly zoom (vertigo). A thin crimson + silver aura licks his
// silhouette, two heartbeats lurch the world, the ball's shadow crosses his face, and his
// eyes flash silver out of the shadow with a crescent glint before the cut.

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { TAU, clamp, ease, lerp } from '../../engine/math';
import { PK, drawGlow, glowOf, glowSprite } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { lensFlare, ribbon, sparkle } from '../../art/fx';
import { PAL, Trail, crescentArc, crescentPath, drawBall, drawHero, pulse } from './common';

const DUR = 1.7;
const SC = 3.4; // hero draw scale (hand-drawn sprite)
const FEET_X = 320;
const FEET_Y = 505; // feet far below frame: chest-up framing
const BEATS = [0.3, 0.75] as const;
const EYE_T = 1.35;
const END_T = 1.45;
// Dolly-zoom pivot: just above his head (the low-angle vanishing point).
const PIV_X = 323;
const PIV_Y = 176;
// Crescent moon (sky layer coords).
const MOON_X = 206, MOON_Y = 92, MOON_R = 24;
// Ball path (screen): the cross enters high at top-right and drops onto a point just above his
// hair, arriving at LAND_T (it then keeps sinking slowly in slow motion into shot 3).
const B0X = 528, B0Y = 40, B1X = 334, B1Y = 110;
const LAND_T = 1.4;

let spin = new BallSpin();
const trail = new Trail(16);
let beatDone = [false, false];
let eyeDone = false;
let edgeIdx: number[] = [];
let rimTop: HTMLCanvasElement | null = null;
let rimL: HTMLCanvasElement | null = null;
let rimR: HTMLCanvasElement | null = null;
let hairRed: HTMLCanvasElement | null = null;
let glintCv: HTMLCanvasElement | null = null;
// Eye overpaint (native sprite px): pupils shifted one pixel right, so he looks up at the ball.
let gazeR: HTMLCanvasElement | null = null;
// Out-of-focus foreground motes (bokeh) drifting in slow motion.
let bokeh: { x: number; y: number; r: number; vx: number; vy: number; c: 0 | 1; a: number }[] = [];

const sx = (env: Env, px: number) => FEET_X + (px - env.art.hero.footX) * SC;
const sy = (env: Env, py: number) => FEET_Y + (py - env.art.hero.footY) * SC;

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

/** Pixel rim mask: the hero's edge pixels on the side facing (-dx,-dy), tinted. */
function rimMask(env: Env, c: [number, number, number], dx: number, dy: number) {
  const h = env.art.hero;
  const cv = canvas(h.w, h.h);
  const g = cv.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  g.drawImage(h.tinted(c), 0, 0);
  g.globalCompositeOperation = 'destination-out';
  g.drawImage(h.img, dx, dy);
  return cv;
}

/** Ball path parameter: eases in from the far cross, slows into a slow-motion hang above his head
 *  at LAND_T (p = 1), then keeps sinking at the same slow speed (p > 1). */
function ballP(t: number) {
  const u = clamp(t / LAND_T);
  const ss = u * u * (3 - 2 * u);
  const p = lerp(ss, u, 0.2);
  return t <= LAND_T ? p : 1 + ((t - LAND_T) * 0.2) / LAND_T;
}

function ballAt(t: number): { x: number; y: number; r: number } {
  const p = ballP(t);
  // Arc: the cross bends as it drops (flat and far at first, then steeper as it falls onto him).
  const x = lerp(B0X, B1X, p) + Math.sin(p * Math.PI) * 10;
  const y = lerp(B0Y, B1Y, p) - Math.sin(p * Math.PI) * 22;
  // Perspective growth: r 4.4 far away -> ~19 above his head.
  return { x, y, r: 4.4 / (1 - 0.77 * Math.min(p, 1.08)) };
}

/** Background zoom amount 0..~0.65 (dolly zoom), lurching forward on each heartbeat. */
function bgZoom(t: number) {
  const end = ease.inCubic(clamp((t - END_T) / (DUR - END_T)));
  let z = 0.36 * ease.inOutQuad(clamp(t / 1.6));
  for (const b of BEATS) z += 0.1 * ease.outCubic(clamp((t - b) / 0.2));
  return z + 0.2 * end;
}

/** 0 -> 1 over the last frames (1.56 -> 1.68): the smash-cut glint re-ignites. */
function smash(t: number) {
  return ease.inQuad(clamp((t - 1.56) / 0.12));
}

function beat(t: number) {
  let v = 0;
  for (const b of BEATS) v = Math.max(v, pulse(t, b, 0.32));
  return v;
}

export const shotRead: Shot = {
  name: 'Read the cross',
  dur: DUR,
  seed: 102,
  rate: (t) => (t > EYE_T && t < EYE_T + 0.08 ? 0.35 : 1),
  cues: [
    { at: 0, fn: (e) => { e.sfx.crowd(1.7, 0.07); e.sfx.whoosh(1.5, 160, 620, 0.14); } },
    { at: BEATS[0], fn: (e) => e.sfx.boom(0.35, 0.6) },
    { at: BEATS[1], fn: (e) => e.sfx.boom(0.35, 0.6) },
    { at: EYE_T, fn: (e) => e.sfx.shing(0.9) },
    { at: 1.42, fn: (e) => e.sfx.whoosh(0.3, 500, 5200, 0.45) },
  ],
  init(env) {
    spin = new BallSpin();
    spin.rotate(1, 0.4, 0.2, 0.9);
    trail.clear();
    beatDone = [false, false];
    eyeDone = false;
    const hero = env.art.hero;
    edgeIdx = [];
    hero.edges.forEach((e, i) => {
      if (e.y < 60 && e.ny < 0.6) edgeIdx.push(i);
    });
    if (!rimTop) rimTop = rimMask(env, PAL.silver, 0, 1);
    if (!rimL) rimL = rimMask(env, [255, 70, 110], 1, 0);
    if (!rimR) rimR = rimMask(env, [255, 70, 110], -1, 0);
    if (!hairRed) {
      hairRed = canvas(hero.w, hero.h);
      const g = hairRed.getContext('2d')!;
      g.drawImage(hero.hair, 0, 0);
      g.globalCompositeOperation = 'source-in';
      g.fillStyle = 'rgb(235,40,80)';
      g.fillRect(0, 0, hero.w, hero.h);
    }
    if (!glintCv) glintCv = canvas(hero.w, hero.h);
    if (!gazeR) {
      gazeR = canvas(hero.w, hero.h);
      const g = gazeR.getContext('2d')!;
      for (const [ex, ey] of hero.eyes) {
        // The 2x2 pupil sits at (ex-1..ex, ey-1..ey): whiten its left column, darken the next one.
        g.fillStyle = 'rgb(255,255,255)';
        g.fillRect(ex - 1, ey - 1, 1, 2);
        g.fillStyle = 'rgb(24,4,17)';
        g.fillRect(ex + 1, ey - 1, 1, 2);
      }
    }
    const r0 = env.rng;
    bokeh = [];
    for (let i = 0; i < 9; i++) {
      const left = i % 2 === 0;
      bokeh.push({
        x: left ? r0.range(-10, 200) : r0.range(440, 650), y: r0.range(20, 350), r: r0.range(7, 18),
        vx: r0.range(-6, 6), vy: r0.range(-16, -5), c: r0.next() < 0.4 ? 1 : 0, a: r0.range(0.1, 0.22),
      });
    }
    env.cam.set(VW / 2, VH / 2, 1, -0.035);
  },
  update(env, t, dt) {
    const { rng, parts, cam } = env;
    const hero = env.art.hero;
    spin.rotate(0.55, 0.3, 0.8, dt * 4.2);
    const b = ballAt(t);
    trail.push(b.x, b.y);

    // Cold aura: thin crimson + silver flames licking up the silhouette.
    const hb = beat(t);
    const n = Math.round((10 + hb * 16) * dt * 60);
    for (let i = 0; i < n; i++) {
      const e = hero.edges[edgeIdx[(rng.next() * edgeIdx.length) | 0]];
      const x = sx(env, e.x) + e.nx * 2;
      const y = sy(env, e.y) + e.ny * 2;
      const silver = rng.next() < 0.28;
      const front = rng.next() < 0.14;
      const vx = e.nx * rng.range(8, 30) * (1 + hb * 2) + rng.range(-6, 6), vy = rng.range(-120, -45) * (1 + hb);
      if (rng.next() < 0.55) {
        // Thin flame tongue.
        parts.spawn({
          kind: PK.Streak, x, y, vx, vy, drag: 0.6, max: rng.range(0.25, 0.5), s0: rng.range(1.2, 2.6), s1: 0.4,
          ramp: silver ? 'silver' : 'crimson', r0: silver ? 0.1 : rng.range(0.2, 0.35), r1: 1, k: rng.range(2.5, 4.5),
          a0: front ? 0.4 : 0.9, a1: 0, layer: front ? 1 : 0,
        });
      } else {
        parts.spawn({
          kind: PK.Glow, x, y, vx, vy,
          drag: 1.1, max: rng.range(0.3, 0.6), s0: rng.range(3, 6) * (silver ? 0.7 : 1), s1: 1,
          ramp: silver ? 'silver' : 'crimson', r0: silver ? rng.range(0.1, 0.4) : rng.range(0.3, 0.5), r1: 1,
          a0: front ? 0.3 : 0.75, a1: 0, layer: front ? 1 : 0,
        });
      }
    }
    // Slow silver motes and crimson embers hanging in the air (slow-motion feel).
    if (rng.next() < 0.55) {
      const ember = rng.next() < 0.45;
      parts.spawn({
        kind: PK.Pixel, x: rng.range(-20, VW + 20), y: rng.range(40, VH + 10), vx: rng.range(-6, 6), vy: rng.range(-28, -8),
        max: rng.range(1.2, 2.2), s0: rng.range(1, 2.6), s1: 1, ramp: ember ? 'crimson' : 'silver', r0: ember ? 0.3 : 0.1, r1: 1,
        a0: 0.9, a1: 0, layer: rng.next() < 0.5 ? 0 : 1,
      });
    }

    // Heartbeats: the aura flares outward.
    BEATS.forEach((bt, i) => {
      if (beatDone[i] || t < bt) return;
      beatDone[i] = true;
      cam.hit(0.32);
      for (let k = 0; k < 46; k++) {
        const e = hero.edges[edgeIdx[(rng.next() * edgeIdx.length) | 0]];
        parts.spawn({
          kind: PK.Glow, x: sx(env, e.x), y: sy(env, e.y),
          vx: e.nx * rng.range(60, 160), vy: e.ny * rng.range(40, 120) - rng.range(20, 60), drag: 3,
          max: rng.range(0.3, 0.55), s0: rng.range(3, 6), s1: 1, ramp: 'crimson', r0: 0.1, r1: 1, a0: 0.9, a1: 0, layer: 0,
        });
      }
    });

    // Eye glint: silver needles thrown off the eyes.
    if (!eyeDone && t >= EYE_T) {
      eyeDone = true;
      for (const [ex, ey] of hero.eyes) {
        const x = sx(env, ex + 0.5), y = sy(env, ey + 0.5);
        for (let k = 0; k < 10; k++) {
          const a = rng.range(0, TAU), s = rng.range(160, 420);
          parts.spawn({
            kind: PK.Streak, x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 5,
            max: rng.range(0.18, 0.32), s0: rng.range(1, 1.8), s1: 0.3, ramp: 'silver', r0: 0, r1: 0.8, k: 1.2, layer: 1,
          });
        }
      }
    }

    // Camera: slight Dutch angle, heartbeat zoom pulses, then a push + roll kick into the cut.
    const end = ease.inCubic(clamp((t - END_T) / (DUR - END_T)));
    const eyeX = sx(env, 49.5), eyeY = sy(env, 23.5);
    cam.set(
      lerp(VW / 2, eyeX, end * 0.7),
      lerp(VH / 2, eyeY, end * 0.7),
      1 + 0.035 * hb + 0.22 * end,
      lerp(-0.035, -0.06, clamp(t / END_T)) + 0.16 * end,
    );
    cam.shakeAmp = 5;
    cam.shakeRoll = 0.01;
  },
  render(env, t) {
    const { ctx, fx } = env;
    const hero = env.art.hero;
    const st = env.art.stadium;
    const hb = beat(t);
    const z = bgZoom(t);
    const end = clamp((t - END_T) / (DUR - END_T));
    env.world();
    ctx.imageSmoothingEnabled = false;

    const layer = (s: number, draw: () => void) => {
      ctx.save();
      ctx.translate(PIV_X, PIV_Y);
      ctx.scale(s, s);
      ctx.translate(-PIV_X, -PIV_Y);
      draw();
      ctx.restore();
    };

    // ---- Sky layer (infinitely far: full dolly-zoom magnification).
    layer(1 + z, () => {
      const sky = ctx.createLinearGradient(0, -200, 0, 200);
      sky.addColorStop(0, '#020109');
      sky.addColorStop(0.55, '#0b0926');
      sky.addColorStop(1, '#1b1446');
      ctx.fillStyle = sky;
      ctx.fillRect(-500, -500, VW + 1000, 1000);
      ctx.fillStyle = '#dfe4ff';
      for (const s of st.stars) {
        const x = ((s.x * 0.47) % 1100) - 230;
        const y = ((s.y + 1400) / 1520) * 250 - 80;
        if (y > 140) continue;
        ctx.globalAlpha = s.b * (0.55 + 0.45 * Math.sin(t * 4 + s.x));
        ctx.fillRect(Math.round(x), Math.round(y), 1, s.b > 0.85 ? 2 : 1);
      }
      ctx.globalAlpha = 1;
      // Crescent moon: silver halo, faint earthshine disk, crisp lit crescent.
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf([120, 130, 230]), MOON_X, MOON_Y, MOON_R * 5, 0.28);
      drawGlow(ctx, glowOf([220, 228, 255]), MOON_X, MOON_Y, MOON_R * 2.2, 0.22);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(40,40,90,0.55)';
      ctx.beginPath();
      ctx.arc(MOON_X, MOON_Y, MOON_R, 0, TAU);
      ctx.fill();
      ctx.save();
      crescentPath(ctx, MOON_X, MOON_Y, MOON_R, 0.62, -0.75);
      ctx.clip();
      ctx.drawImage(st.moon, MOON_X - MOON_R, MOON_Y - MOON_R, MOON_R * 2, MOON_R * 2);
      ctx.restore();
      // Thin cloud band drifting under the moon.
      ctx.globalAlpha = 0.28;
      ctx.drawImage(st.cloud[1], MOON_X - 120 + t * 14, MOON_Y + 6, 220, 60);
      ctx.drawImage(st.cloud[2], MOON_X + 170 + t * 10, MOON_Y - 40, 180, 50);
      ctx.globalAlpha = 1;
    });

    // ---- Stands + floodlights (far).
    layer(1 + z * 0.9, () => {
      // Floodlight towers, leaning in (low-angle convergence).
      for (const [x, lean] of [[78, 0.1], [568, -0.1]] as const) {
        ctx.save();
        ctx.translate(x, 46);
        ctx.rotate(lean);
        ctx.scale(1.7, 1.7);
        ctx.drawImage(st.tower, -20, -16);
        ctx.restore();
      }
      // Stand bowl: crowd texture under a dark wash.
      // Integer 2x so its pixels sit on the same grid family as the rest of the backdrop.
      const cw = st.crowdNear.width, ch = Math.min(st.crowdNear.height, 81);
      ctx.globalAlpha = 0.8;
      ctx.drawImage(st.crowdNear, 0, 0, cw, ch, PIV_X - cw, 148, cw * 2, ch * 2);
      ctx.globalAlpha = 1;
      const wash = ctx.createLinearGradient(0, 140, 0, 320);
      wash.addColorStop(0, 'rgba(5,3,16,0.8)');
      wash.addColorStop(1, 'rgba(12,8,34,0.42)');
      ctx.fillStyle = wash;
      ctx.fillRect(-500, 140, VW + 1000, 182);
      // Roof edge with a silver underside line.
      ctx.fillStyle = '#05030c';
      ctx.fillRect(-500, 126, VW + 1000, 22);
      ctx.fillStyle = 'rgba(170,180,240,0.35)';
      ctx.fillRect(-500, 147, VW + 1000, 1);
      for (let x = -470; x < VW + 470; x += 26) {
        ctx.fillStyle = '#e8ecff';
        ctx.fillRect(x, 142, 3, 2);
      }
      // LED boards.
      ctx.fillStyle = '#05040b';
      ctx.fillRect(-500, 304, VW + 1000, 14);
      for (let x = -480; x < VW + 480; x += 64) {
        ctx.fillStyle = (x / 64) & 1 ? 'rgba(222,26,66,0.75)' : 'rgba(200,210,255,0.55)';
        ctx.fillRect(x + 4, 308, 50, 5);
      }
      // Crowd camera flashes.
      ctx.globalCompositeOperation = 'lighter';
      for (const f of st.flashes) {
        const ph = (t * 1.6 + f.t) % 1.8;
        if (ph > 0.1) continue;
        drawGlow(ctx, glowOf([235, 240, 255]), (f.x / 1600) * 1300 - 330, 158 + f.y * 1.45, 6, 1 - ph / 0.1);
      }
      // Lamps + soft beams angling down onto the pitch.
      for (const [lx, ly] of [[82, 22], [564, 22]] as const) {
        const dir = lx < PIV_X ? 1 : -1;
        for (const [ex, w] of [[220, 60], [330, 90]] as const) {
          const bx = PIV_X - dir * 40 + dir * (ex - 220) * 0.6;
          const g = ctx.createLinearGradient(lx, ly, bx, 330);
          g.addColorStop(0, 'rgba(200,210,255,0.075)');
          g.addColorStop(1, 'rgba(210,220,255,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(lx - 6, ly);
          ctx.lineTo(lx + 6, ly);
          ctx.lineTo(bx + w, 340);
          ctx.lineTo(bx - w, 340);
          ctx.closePath();
          ctx.fill();
        }
        drawGlow(ctx, glowOf([200, 210, 255]), lx, ly, 110, 0.3);
        drawGlow(ctx, glowOf([255, 255, 255]), lx, ly, 34, 0.95);
      }
      ctx.globalCompositeOperation = 'source-over';
    });

    // ---- Goal behind him + the pitch (nearer: less magnification).
    layer(1 + z * 0.55, () => {
      const hz = 318;
      const grass = ctx.createLinearGradient(0, hz, 0, 460);
      grass.addColorStop(0, '#0d2418');
      grass.addColorStop(1, '#174a26');
      ctx.fillStyle = grass;
      ctx.fillRect(-500, hz, VW + 1000, 300);
      for (let i = -14; i <= 14; i += 2) {
        ctx.fillStyle = 'rgba(30,90,44,0.35)';
        ctx.beginPath();
        ctx.moveTo(PIV_X + i * 30, hz);
        ctx.lineTo(PIV_X + (i + 1) * 30, hz);
        ctx.lineTo(PIV_X + (i + 1) * 200, hz + 300);
        ctx.lineTo(PIV_X + i * 200, hz + 300);
        ctx.closePath();
        ctx.fill();
      }
      const gl = PIV_X - 172, gr = PIV_X + 172, gt = 214, gb = hz + 6;
      ctx.strokeStyle = 'rgba(170,180,235,0.11)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = gl + 12; x < gr; x += 12) {
        ctx.moveTo(x, gt);
        ctx.lineTo(x + (x - PIV_X) * 0.06, gb);
      }
      for (let y = gt + 12; y < gb; y += 12) {
        ctx.moveTo(gl, y);
        ctx.lineTo(gr, y);
      }
      ctx.stroke();
      ctx.fillStyle = '#0a0716';
      ctx.fillRect(gl - 4, gt - 4, gr - gl + 8, 9);
      ctx.fillRect(gl - 4, gt - 4, 9, gb - gt + 4);
      ctx.fillRect(gr - 5, gt - 4, 9, gb - gt + 4);
      ctx.fillStyle = '#7d84ad';
      ctx.fillRect(gl - 3, gt - 3, gr - gl + 6, 6);
      ctx.fillRect(gl - 3, gt - 3, 6, gb - gt + 3);
      ctx.fillRect(gr - 3, gt - 3, 6, gb - gt + 3);
      ctx.fillStyle = 'rgba(225,230,255,0.9)';
      ctx.fillRect(gl - 3, gt - 3, gr - gl + 6, 1);
      ctx.fillRect(gl - 3, gt - 3, 1, gb - gt + 3);
      ctx.fillRect(gr + 2, gt - 3, 1, gb - gt + 3);
      // Night haze over the far world.
      const haze = ctx.createLinearGradient(0, 120, 0, 340);
      haze.addColorStop(0, 'rgba(14,10,40,0)');
      haze.addColorStop(1, 'rgba(14,10,40,0.55)');
      ctx.fillStyle = haze;
      ctx.fillRect(-500, 120, VW + 1000, 400);
    });

    // ---- Glows behind him: silver backlight from the floods + the crimson aura heat.
    const hx = sx(env, 49), headY = sy(env, 18), chestY = sy(env, 42);
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf([120, 130, 230]), hx, headY - 10, 170, 0.22);
    drawGlow(ctx, glowSprite('crimson', 0.55), hx, chestY, 230 + hb * 40, 0.26 + hb * 0.2, 1.1, 1);
    ctx.globalCompositeOperation = 'source-over';

    // He reads the cross: a dotted tracer of the ball's coming path down to a thin silver crescent
    // marking where it will drop, just above his head.
    const b = ballAt(t);
    const tg = ballAt(LAND_T);
    const rd = clamp((t - 0.55) / 0.12) * (1 - clamp((t - 0.98) / 0.12));
    if (rd > 0) {
      const march = (t * 2.5) % 1;
      ctx.fillStyle = '#e6eaff';
      for (let i = 1; i < 40; i++) {
        const tt = t + (i - march) * 0.035;
        if (tt > LAND_T) break;
        const p = ballAt(tt);
        if (Math.hypot(p.x - b.x, p.y - b.y) < b.r * 1.6) continue;
        if (Math.hypot(p.x - tg.x, p.y - tg.y) < 15) continue;
        ctx.globalAlpha = rd * 0.75 * (1 - (i / 40) * 0.5);
        ctx.fillRect(Math.round(p.x) - 1, Math.round(p.y) - 1, 2, 2);
      }
      ctx.globalAlpha = rd * 0.55;
      const ra = -0.9 + t * 2.2;
      ctx.strokeStyle = 'rgb(230,235,255)';
      ctx.lineWidth = 1;
      crescentPath(ctx, tg.x, tg.y, 12 + (1 - rd) * 8, 0.6, ra);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Ball trail + ball (behind him in depth: drawn before the hero).
    if (trail.pts.length > 2) {
      ctx.globalCompositeOperation = 'lighter';
      ribbon(ctx, trail.pts, 0, b.r * 1.3, 'rgb(150,160,230)', 0.18);
      ribbon(ctx, trail.pts, 0, b.r * 0.5, 'rgb(235,240,255)', 0.25);
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf([190, 200, 255]), b.x, b.y, b.r * 3.2, 0.35);
    ctx.globalCompositeOperation = 'source-over';
    const br = clamp(Math.round(b.r / 3), 2, 7);
    drawBall(env, spin, b.x, b.y, br, b.r / br);
    // Floodlight glint riding the ball while it is still far away.
    const tw = clamp(1 - t / 0.9) * (0.65 + 0.35 * Math.sin(t * 26));
    if (tw > 0) sparkle(ctx, b.x - b.r * 0.3, b.y - b.r * 0.35, 10 + 6 * tw, tw * 0.9, t * 1.5);

    env.parts.draw(ctx, 0);

    // ---- Aura outline: offset tinted copies make a thin glowing edge around the silhouette.
    const fl = 0.8 + 0.2 * Math.sin(t * 37) * Math.sin(t * 21);
    const deep = hero.tinted([120, 6, 36]);
    const red = hero.tinted([222, 26, 66]);
    const sil = hero.tinted([220, 228, 255]);
    const grow = 1 + hb * 0.9;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      drawHero(env, FEET_X + Math.cos(a) * 5.5 * grow, FEET_Y + Math.sin(a) * 5 * grow - 1.5, SC, deep, 0.22 * fl);
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + 0.5;
      drawHero(env, FEET_X + Math.cos(a) * 2.6 * grow, FEET_Y + Math.sin(a) * 2.6 * grow, SC, red, 0.4 * fl);
    }
    ctx.globalCompositeOperation = 'lighter';
    drawHero(env, FEET_X, FEET_Y - 2.2, SC, sil, 0.2);
    drawHero(env, FEET_X - 2, FEET_Y, SC, red, 0.25 * fl * (1 + hb));
    drawHero(env, FEET_X + 2, FEET_Y, SC, red, 0.25 * fl * (1 + hb));
    ctx.globalCompositeOperation = 'source-over';

    // ---- The hero.
    const x0 = FEET_X - hero.footX * SC, y0 = FEET_Y - hero.footY * SC;
    const rw = hero.w * SC, rh = hero.h * SC;
    drawHero(env, FEET_X, FEET_Y, SC);
    // Gaze: his pupils track the cross, up-right while it is still out wide, then straight up.
    if (b.x - hx > 36) ctx.drawImage(gazeR!, x0, y0, rw, rh);
    // Cool grade on the body: a touch of indigo so the rim lights pop.
    ctx.globalCompositeOperation = 'multiply';
    drawHero(env, FEET_X, FEET_Y, SC, hero.tinted([150, 150, 205]), 0.32);
    ctx.globalCompositeOperation = 'source-over';
    // Pixel rim lights: silver on the top edges, crimson on the sides.
    ctx.globalAlpha = 0.8;
    ctx.drawImage(rimTop!, x0, y0, rw, rh);
    ctx.globalAlpha = 0.7 * fl;
    ctx.drawImage(rimL!, x0, y0, rw, rh);
    ctx.drawImage(rimR!, x0, y0, rw, rh);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.35;
    ctx.drawImage(rimTop!, x0, y0, rw, rh);
    // Heartbeat: the crimson pixel rims surge, so the red stays alive while the world drains.
    ctx.globalAlpha = 0.7 * hb;
    ctx.drawImage(rimL!, x0, y0, rw, rh);
    ctx.drawImage(rimR!, x0, y0, rw, rh);
    drawHero(env, FEET_X, FEET_Y, SC, red, 0.06 * hb);
    ctx.globalAlpha = 1;
    // Hair glinting crimson, with a silver specular sweep.
    ctx.globalAlpha = 0.1 + 0.05 * Math.sin(t * 9) + hb * 0.15;
    ctx.drawImage(hairRed!, x0, y0, rw, rh);
    ctx.globalAlpha = 1;
    // Specular sweep: a hard, slanted band of sprite pixels (silver core, crimson fringe).
    const sweep = (t - 0.4) / 0.5;
    if (sweep > 0 && sweep < 1) {
      const g = glintCv!.getContext('2d')!;
      g.globalCompositeOperation = 'source-over';
      g.clearRect(0, 0, hero.w, hero.h);
      const bx = lerp(22, 84, sweep);
      for (let y = 0; y < 22; y++) {
        const x = Math.round(bx - (y - 8) * 0.7);
        g.fillStyle = 'rgb(235,40,80)';
        g.fillRect(x - 2, y, 1, 1);
        g.fillRect(x + 2, y, 1, 1);
        g.fillStyle = 'rgb(250,248,255)';
        g.fillRect(x - 1, y, 3, 1);
      }
      g.globalCompositeOperation = 'destination-in';
      g.drawImage(hero.hair, 0, 0);
      g.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.55 * Math.sin(sweep * Math.PI);
      ctx.drawImage(glintCv!, x0, y0, rw, rh);
      ctx.globalAlpha = 1;
    }
    ctx.globalCompositeOperation = 'source-over';

    // ---- The ball's shadow crosses his face.
    // Timed to the ball: darkest (~1.2 s) while it hangs just above his head, clear by the flash.
    const sk = clamp((t - 1.0) / 0.42);
    if (sk > 0 && sk < 1) {
      const fade = Math.min(1, sk * 5, (1 - sk) * 4);
      const e = lerp(sk, ease.inOutQuad(sk), 0.5);
      const cx = lerp(sx(env, 66), sx(env, 32), e) + (b.x - hx) * 0.25;
      const cy = lerp(sy(env, 2), sy(env, 44), e);
      const dark = hero.tinted([8, 6, 26]);
      for (const [rx, ry, a] of [[52, 42, 0.32], [38, 30, 0.5]] as const) {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, -0.5, 0, TAU);
        ctx.clip();
        drawHero(env, FEET_X, FEET_Y, SC, dark, a * fade);
        ctx.restore();
      }
    }

    env.parts.draw(ctx, 1);

    // Foreground bokeh (soft, slow): depth for the close-up.
    ctx.globalCompositeOperation = 'lighter';
    for (const o of bokeh) {
      const x = o.x + o.vx * t, y = o.y + o.vy * t;
      drawGlow(ctx, o.c ? glowSprite('crimson', 0.45) : glowOf([200, 210, 255]), x, y, o.r * 1.4, o.a);
      ctx.globalAlpha = o.a * 0.35;
      ctx.fillStyle = o.c ? 'rgb(235,60,100)' : 'rgb(210,220,255)';
      ctx.beginPath();
      ctx.arc(x, y, o.r * 0.7, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // ---- Eyes: a faint pre-glow, then the silver flash and a crescent glint.
    const pre = clamp((t - 1.15) / 0.2) * (1 - clamp((t - EYE_T) / 0.05));
    const ef = pulse(t, EYE_T, 0.45);
    // Smash-cut re-ignition: the crescent halo and the silver eyes flare back to full intensity
    // on the last frames, so the shot ends on the glint itself (no fade, no flash) into shot 3.
    const g2 = smash(t);
    for (const [i, [ex, ey]] of hero.eyes.entries()) {
      const px = sx(env, ex + 0.5), py = sy(env, ey + 0.5);
      if (pre > 0) {
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, glowOf([210, 220, 255]), px, py, 10, pre * 0.8);
        ctx.globalCompositeOperation = 'source-over';
      }
      if (ef > 0) sparkle(ctx, px, py, 6 + 11 * ef, ef, i * 0.4 + t * 2);
    }
    if (ef > 0 || g2 > 0) {
      const mx = sx(env, 49.5), my = sy(env, 23.5);
      // One small flare per eye (not one big one between them) keeps two distinct points of light.
      for (const [ex, ey] of hero.eyes) lensFlare(ctx, sx(env, ex + 0.5), sy(env, ey + 0.5), 24, ef * 0.32, [190, 200, 255]);
      const cp = ease.outCubic(clamp((t - EYE_T) / 0.2));
      const ca = 1 - clamp((t - EYE_T - 0.2) / 0.25);
      if (g2 > 0) {
        // Crimson heat under the re-ignited halo.
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, glowOf([222, 26, 66]), mx, my - 4, 150, 0.45 * g2);
        ctx.globalCompositeOperation = 'source-over';
      }
      crescentArc(ctx, mx, my - 4, 112, Math.PI * 0.92, Math.PI * 2.08, 15 + 8 * g2, Math.max(cp, g2), Math.max(ca, g2));
      // Silver eye re-flare: small, so the two eyes stay two points of light.
      if (g2 > 0) {
        for (const [i, [ex, ey]] of hero.eyes.entries()) sparkle(ctx, sx(env, ex + 0.5), sy(env, ey + 0.5), 5 + 9 * g2, g2, i * 0.4 + t * 3);
      }
    }

    // ---- Post: cool indigo grade; heartbeats desaturate, pulse vignette and ripple.
    const [ux, uy] = env.cam.toUV(hx, chestY - 20);
    for (const bt of BEATS) {
      const k = (t - bt) / 0.45;
      if (k > 0 && k < 1) fx.shocks.push({ x: ux, y: uy, r: lerp(0.05, 0.85, ease.outCubic(k)), s: 0.012 * (1 - k) });
    }
    const [eux, euy] = env.cam.toUV(sx(env, 49.5), sy(env, 23.5));
    // White match out of shot 1's exit flash: frame 0 is the same vignetted white, gone by ~0.08 s.
    const whiteIn = Math.pow(1 - clamp(t / 0.083), 2);
    fx.bloom = 0.8 + ef * 0.05 + 0.2 * g2;
    fx.bloomThresh = 0.62;
    fx.vignette = lerp(0.75 + hb * 0.25, 0.6, whiteIn);
    fx.ca = 0.0012 + hb * 0.003 + end * 0.006;
    let dsat = 0;
    for (const bt of BEATS) dsat = Math.max(dsat, pulse(t, bt, 0.2));
    // The beat drains the world to cold silver (not sepia); the crimson surge on him survives it.
    fx.sat = lerp(0.9, 0.5, dsat);
    fx.contrast = 1.1;
    fx.tint = [lerp(226, 190, dsat), lerp(230, 205, dsat), 255];
    // End push blur kept light so the eyes and the crimson halo stay crisp on the cut frame.
    fx.radial = ease.inQuad(end) * 0.05 + hb * hb * 0.025;
    fx.radialX = eux;
    fx.radialY = euy;
    // No flash on the way out: 2 -> 3 is a smash cut on the glint.
    fx.flash = Math.max(whiteIn, ef * 0.22);
    fx.flashColor = whiteIn > ef * 0.22 ? [255, 240, 248] : [236, 240, 255];
  },
};
