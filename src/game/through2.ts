// MERIDIAN THREAD v2 field scenario 'through2' (MERIDIAN_THREAD_v2.md, "Field scenario 'through' becomes lofted"):
// No.10 carries from LAYOUT.no10Start (700, 268) at 118 px/s; D1 steps up from (1016, 222) to (1004, 222) at field t
// 0.8 s; the Tower (the set's one big captain, his Rivals model sheet boxed at the field scale, 1.3x the others' bulk,
// the armband), D3 and D4 hold and side-step to mirror him; the keeper rocks on his line; No.7 jogs from (940, 344)
// to (994, 336) at the trigger, onside. The command window opens at x >= 760 with the star-chart preview: a dotted jade
// arc rising from the ball over the line (the field's real 16 m flight, h x 0.62) onto a pulsing cross-stitch X at
// LAYOUT.target, pearl ticks along it and four soft plucks (E5, F#5, A5, B5) as it passes over the four defenders. The
// result view: GOAL · MERIDIAN THREAD, No.7 celebrating near the far post, No.10 running in pointing (P3a), the Tower
// face-down at (1050, 236), D1 / D3 / D4 with their heads tipped back (craneUp), the keeper on the turf by the near post.
//
// A new scenario id so the shipped v1 'through' stays exactly as it was: Field calls these only when
// special.scenario === 'through2'. No.10 and No.7 are drawn from studio frames as box-filtered caches: never a puppet.

import type { Env } from '../cinematic/timeline';
import type { SpecialDef } from '../cinematic/specials';
import { VW, VH } from '../engine/camera';
import { clamp, ease, lerp } from '../engine/math';
import type { BallSpin } from '../engine/pixel';
import { PK, drawGlow, glowSprite } from '../engine/particles';
import { drawFieldBackdrop, drawGoal, drawShadow } from '../art/stadium';
import { KEEPER_KIT, POSES, P, RIVAL_KIT, RIVAL_KIT_C, RIVAL_KIT_D, drawPuppet, poseAt, renderPuppet, type Kit, type Pose } from '../art/puppet';
import { TITLE_FONT, pixelText } from '../art/fx';
import { drawAnimBoxed } from '../art/studioAnim';
import { drawBall } from '../cinematic/kit';
import { drawNo10Boxed, no10, no10Final, warmNo10Boxed, type No10Key } from '../art/no10';
import { drawNo7Boxed, no7, no7Final, warmNo7, type No7Key } from '../art/no7';
import { HEX, LAYOUT, SHOT_NAME, arcAt, crossStitch, drawTowerPuppet, starChart, tower, type ChartPt } from '../cinematic/meridian2/common';

const K = 0.42;
const FIELD_SCALE = 0.4, RESULT_SCALE = 0.5;
/** The command window opens when No.10 reaches x >= 760. */
export const THROUGH2_X = 760;
const DRIBBLE: No10Key[] = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'];
const NO7_RUN: No7Key[] = ['Run.R1', 'Run.R2', 'Run.R3', 'Run.R4', 'Run.R5', 'Run.R6', 'Run.R7', 'Run.R8'];
const RUN: [number, Pose][] = [[0, POSES.run1], [0.1, POSES.run2], [0.2, POSES.run3], [0.3, POSES.run4], [0.4, POSES.run1]];
const runPose = (t: number) => poseAt(RUN, t % 0.4, (x) => x);
const D = Math.PI / 180;
const SET = (k: number) => P({ ...POSES.stand, torso: 12 * D, kneeN: (22 + 6 * k) * D, kneeF: (26 - 6 * k) * D, thighN: (10 + 4 * k) * D });
/** The star-chart preview's plucks: E5, F#5, A5, B5 as it passes over the four defenders (cmdT, gain 0.12). */
const PLUCKS: [number, number][] = [[0.2, 659.26], [0.32, 739.99], [0.44, 880], [0.56, 987.77]];
/** The field view flies the real 16 m apex: h x 0.62. */
const FIELD_H = 0.62;

interface Actor {
  kit: Kit;
  x: number;
  z: number;
  facing: 1 | -1;
  pose: Pose;
  h: number;
}

/** The parts of Field this scenario uses (all public on Field). */
export interface Through2Field {
  mode: 'intro' | 'command' | 'result';
  t: number;
  cmdT: number;
  score: number;
  hero: Actor;
  defA: Actor;
  defB: Actor;
  defC: Actor;
  defD: Actor;
  keeper: Actor;
  winger: Actor;
  ball: { x: number; z: number; h: number };
  spin: BallSpin;
  camX: number;
  timeScale: number;
  special: SpecialDef;
}

const state = new WeakMap<Through2Field, { plucks: number }>();
const st = (f: Through2Field) => {
  let s = state.get(f);
  if (!s) state.set(f, (s = { plucks: 0 }));
  return s;
};

/** Build the field caches up front (no hitch on the first frame). */
export function warmThrough2(env: Env) {
  warmNo10Boxed(env, DRIBBLE, FIELD_SCALE);
  warmNo10Boxed(env, ['P3a'], RESULT_SCALE);
  warmNo7(env, NO7_RUN, FIELD_SCALE);
  warmNo7(env, ['Celebrate.C1', 'Celebrate.C2', 'Point.Q2'], RESULT_SCALE);
  const tw = tower('TS');
  if (tw) tw.a.boxed(tw.i, FIELD_SCALE);
}

export function through2Reset(f: Through2Field) {
  const L = LAYOUT;
  st(f).plucks = 0;
  f.hero = { kit: f.hero.kit, x: L.no10Start.x, z: L.no10Start.z, facing: 1, pose: POSES.stand, h: 0 };
  f.defA = { kit: RIVAL_KIT, x: L.d1Home.x, z: L.d1Home.z, facing: -1, pose: SET(0), h: 0 };
  f.defB = { kit: RIVAL_KIT, x: L.tower.x, z: L.tower.z, facing: -1, pose: SET(0), h: 0 };
  f.defC = { kit: RIVAL_KIT_C, x: L.d3.x, z: L.d3.z, facing: -1, pose: SET(0), h: 0 };
  f.defD = { kit: RIVAL_KIT_D, x: L.d4.x, z: L.d4.z, facing: -1, pose: SET(0), h: 0 };
  f.winger = { ...f.winger, x: L.no7Start.x, z: L.no7Start.z, facing: 1, pose: POSES.stand, h: 0 };
  f.keeper = { kit: KEEPER_KIT, x: L.keeper.x, z: L.keeper.z, facing: -1, pose: POSES.gkReady, h: 0 };
  f.ball = { x: L.no10Start.x + 12, z: L.no10Start.z + 2, h: 0 };
  f.camX = 800;
}

/** The result view (fades up from [8,4,14]). */
export function through2Result(f: Through2Field, env: Env) {
  const L = LAYOUT;
  f.mode = 'result';
  f.t = 0;
  f.score = 1;
  f.timeScale = 1;
  env.sfx.crowd(3, 0.3);
  f.hero = { ...f.hero, x: 1080, z: 262, facing: 1, pose: POSES.stand, h: 0 };
  f.winger = { ...f.winger, x: 1150, z: 232, facing: -1, pose: POSES.celebrate, h: 0 };
  f.defA = { ...f.defA, x: L.d1.x + 6, z: L.d1.z, facing: -1, pose: POSES.craneUp, h: 0 };
  f.defB = { ...f.defB, x: L.towerDown.x, z: L.towerDown.z, facing: -1, pose: POSES.faceDown, h: -12 };
  f.defC = { ...f.defC, x: L.d3.x + 8, z: L.d3.z, facing: -1, pose: POSES.craneUp, h: 0 };
  f.defD = { ...f.defD, x: L.d4.x + 10, z: L.d4.z, facing: -1, pose: POSES.craneUp, h: 0 };
  f.keeper = { ...f.keeper, x: 1168, z: 292, facing: -1, pose: POSES.sprawl, h: -8 };
  f.ball = { x: L.finish.x + 26, z: L.finish.z, h: L.finish.h * 1.6 };
  env.parts.clear();
}

export function through2Update(f: Through2Field, env: Env, dt: number) {
  const sdt = dt * f.timeScale;
  f.t += sdt;
  const { rng, parts, sfx } = env;
  const h = f.hero, L = LAYOUT;
  if (f.mode === 'intro' || f.mode === 'command') {
    if (f.mode === 'intro') {
      h.x += 118 * sdt;
      if (h.x >= THROUGH2_X) {
        f.mode = 'command';
        f.cmdT = 0;
        sfx.blip(660);
      }
    } else {
      f.cmdT += dt;
      f.timeScale = lerp(f.timeScale, 0.06, 1 - Math.exp(-dt * 8));
      h.x += 118 * sdt;
      const s = st(f);
      while (s.plucks < PLUCKS.length && f.cmdT >= PLUCKS[s.plucks][0]) {
        sfx.pluck(PLUCKS[s.plucks][1], 0.9, 0.12);
        s.plucks++;
      }
    }
    // Dribble: small touches.
    const ph = (f.t % 0.8) / 0.8;
    f.ball.x = h.x + 12 + Math.sin(ph * Math.PI) * 10;
    f.ball.z = h.z + 2;
    f.ball.h = Math.abs(Math.sin(ph * Math.PI * 2)) * 2;
    f.spin.rotate(0, 0, 1, sdt * 12);
    // D1 steps up at 0.8 s; the Tower, D3 and D4 hold the line and side-step to mirror him.
    const out = ease.inOutQuad(clamp((f.t - 0.8) / 0.4));
    f.defA.x = lerp(L.d1Home.x, L.d1.x, out);
    f.defA.pose = out > 0 && out < 1 ? runPose(f.t + 0.13) : SET(Math.sin(f.t * 9));
    const line: [Actor, { x: number; z: number }, number][] = [[f.defB, L.tower, 0.27], [f.defC, L.d3, 0.51], [f.defD, L.d4, 0.77]];
    for (const [d, home, phs] of line) {
      d.x = home.x;
      d.z = home.z + (h.z - L.no10Start.z) * 0.5 + Math.sin(f.t * 4 + phs * 6) * 1.5;
      d.pose = SET(Math.sin(f.t * 8 + phs * 9));
    }
    f.keeper.z = L.keeper.z + Math.sin(f.t * 2) * 6;
    f.keeper.pose = POSES.gkReady;
    // No.7 jogs up the near touchline, onside at the trigger.
    const w = f.winger;
    const k = clamp((h.x - L.no10Start.x) / (THROUGH2_X - L.no10Start.x));
    w.x = lerp(L.no7Start.x, L.no7Strike.x, k) + (f.mode === 'command' ? 100 * f.cmdT * f.timeScale : 0);
    w.z = lerp(L.no7Start.z, L.no7Strike.z, k);
    if (rng.next() < 0.3 * f.timeScale) {
      parts.spawn({ kind: PK.Smoke, x: h.x - 6, y: h.z, vx: -30, vy: -8, max: 0.5, s0: 2, s1: 7, ramp: 'dust', a0: 0.4, a1: 0, add: false, r0: 0, r1: 1 });
    }
    if (f.mode === 'command' && rng.next() < 0.6) {
      parts.spawn({
        kind: PK.Glow, x: h.x + rng.range(-10, 10), y: h.z - rng.range(0, 40), vx: 0, vy: rng.range(-60, -20),
        max: 0.5, s0: rng.range(3, 6), s1: 1, ramp: 'jade', r0: 0.1, r1: 1, a0: 0.9, a1: 0, layer: 0,
      });
    }
    f.camX = lerp(f.camX, f.mode === 'command' ? 950 : h.x + 80, 1 - Math.exp(-dt * 3));
  } else {
    // Result: the two friends celebrate (Celebrate hops a little); confetti in MERIDIAN's colours.
    f.winger.h = Math.abs(Math.sin(f.t * Math.PI * 2 + 1)) * 3;
    f.camX = lerp(f.camX, 1090, 1 - Math.exp(-dt * 2));
    if (rng.next() < 0.5) {
      parts.spawn({
        kind: PK.Confetti, x: f.camX + rng.range(-320, 320), y: -40, vx: rng.range(-30, 30), vy: rng.range(40, 90), vrot: rng.range(-4, 4),
        max: 4, s0: 4, s1: 4, a0: 1, a1: 1, add: false, color: rng.pick([HEX.jade, HEX.pearl, '#ff3b3b']), k: rng.next(), layer: 1,
      });
    }
  }
  parts.update(sdt * (f.mode === 'command' ? 4 : 1));
}

function drawHero(f: Through2Field, env: Env) {
  const a = f.hero;
  drawShadow(env.ctx, a.x, a.z, 11, 0.35);
  if (f.mode === 'result') {
    drawNo10Boxed(env, 'P3a', a.x, a.z - a.h, RESULT_SCALE, { anchor: 'contact' });
    return;
  }
  const key = DRIBBLE[Math.floor((f.t % 0.8) / 0.1) % 8];
  const fr = no10(key);
  const pivot: [number, number] | undefined = fr ? [fr.a.anchorOf(0, 'contact')[0], 103] : undefined;
  drawNo10Boxed(env, key, a.x, a.z - a.h, FIELD_SCALE, pivot ? { pivot } : { anchor: 'contact' });
}

function drawWinger(f: Through2Field, env: Env) {
  const a = f.winger;
  drawShadow(env.ctx, a.x, a.z, 11, 0.35);
  if (f.mode === 'result') {
    const key: No7Key = no7Final('Celebrate.C1') ? (Math.floor(f.t / 0.25) % 2 ? 'Celebrate.C2' : 'Celebrate.C1') : 'Point.Q2';
    drawNo7Boxed(env, key, a.x, a.z - a.h, RESULT_SCALE, { flip: true });
    return;
  }
  const key = NO7_RUN[Math.floor(f.t / 0.07) % 8];
  const fr = no7(key);
  const pivot: [number, number] | undefined = fr ? [fr.a.anchorOf(no7('Run.R1')?.i ?? fr.i, 'contact')[0], 103] : undefined;
  drawNo7Boxed(env, key, a.x, a.z - a.h, FIELD_SCALE, pivot ? { pivot } : {});
}

function drawPuppetActor(env: Env, a: Actor) {
  drawShadow(env.ctx, a.x, a.z, 11, 0.35);
  const r = renderPuppet(a.kit, a.pose, { k: K, facing: a.facing });
  drawPuppet(env.ctx, r, a.x, a.z - a.h - 40 * K, 1);
}

/** The Tower: his model sheet (TowerIdle side) boxed at the field scale, facing west; the 1.3x puppet otherwise. */
function drawTowerActor(f: Through2Field, env: Env) {
  const a = f.defB;
  drawShadow(env.ctx, a.x, a.z, 14, 0.4);
  const tw = tower('TS');
  if (tw && f.mode !== 'result') {
    drawAnimBoxed(env.ctx, tw.a, tw.i, a.x, a.z - a.h, FIELD_SCALE, { anchor: 'contact', flip: true });
    return;
  }
  drawTowerPuppet(env.ctx, `field-tower-${f.mode === 'result' ? 'down' : 'set'}`, a.pose, a.x, a.z - a.h - 40 * K, 1, a.facing, 0, 1, K);
}

/** The star-chart preview (world space, on the turf under the players): the real 16 m flight, drawn as y = z - h. */
function drawPreview(f: Through2Field, env: Env, time: number) {
  if (f.mode !== 'command') return;
  const ctx = env.ctx;
  const grow = ease.outCubic(clamp(f.cmdT / 0.6));
  const pts: ChartPt[] = [];
  for (let i = 0; i <= 48; i++) {
    const a = arcAt(i / 48);
    pts.push({ x: a.x, y: a.z - a.h * FIELD_H, h: (a.h * FIELD_H) / 10 });
  }
  starChart(ctx, pts, { reveal: Math.max(0.05, grow), apex: '16 M', alpha: clamp(f.cmdT / 0.15) });
  if (grow > 0.98) crossStitch(ctx, LAYOUT.target.x, LAYOUT.target.z, 5 * (1 + 0.18 * Math.sin(time * 9)), 1, 0.55);
}

export function through2Render(f: Through2Field, env: Env, time: number, scoreboard: (time: number) => void) {
  const { ctx, cam, fx } = env;
  const result = f.mode === 'result', command = f.mode === 'command';
  const k = command ? ease.outCubic(clamp(f.cmdT / 0.4)) : 0;
  const zoom = result ? 1.15 : lerp(1.3, 1.0, k);
  const camY = command ? lerp(214, 240, k) : result ? 236 : 214;
  cam.reset();
  cam.set(f.camX, camY, zoom, 0);
  env.world();
  drawFieldBackdrop(ctx, env.art.stadium, f.camX, camY, time);
  drawPreview(f, env, time);
  drawGoal(ctx, 'back', result ? 0.15 : 0);
  const items: { z: number; draw: () => void }[] = [];
  items.push({ z: f.hero.z, draw: () => drawHero(f, env) });
  items.push({ z: f.winger.z, draw: () => drawWinger(f, env) });
  items.push({ z: f.defB.z, draw: () => drawTowerActor(f, env) });
  for (const a of [f.defA, f.defC, f.defD, f.keeper]) items.push({ z: a.z, draw: () => drawPuppetActor(env, a) });
  items.push({
    z: f.ball.z + 0.5,
    draw: () => {
      const air = clamp(f.ball.h / 160);
      drawShadow(ctx, f.ball.x, f.ball.z, 4 - air * 1.5, 0.4 - air * 0.25);
      const by = f.ball.z - 3 - f.ball.h;
      if (command) {
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, glowSprite('jade', 0.1), f.ball.x, by, 14, 0.5);
        ctx.globalCompositeOperation = 'source-over';
      }
      drawBall(env, f.spin, f.ball.x, by, 3, 1, 0, command ? 0.7 : 0, 'pearl');
    },
  });
  items.sort((a, b) => a.z - b.z);
  env.parts.draw(ctx, 0);
  for (const it of items) it.draw();
  drawGoal(ctx, 'front');
  env.parts.draw(ctx, 1);

  env.screen();
  scoreboard(time);
  if (command) drawCommand(f, env, time);
  if (result) drawResult(f, env, time);
  if (f.mode === 'intro') {
    const a = clamp(f.t / 0.15);
    if (a > 0) {
      ctx.globalAlpha = a;
      pixelText(ctx, 'No.10 LOOKS UP · No.7 MAKES HIS RUN', VW / 2, 48, 12, '#d9f5e4', 'center');
      ctx.globalAlpha = 1;
    }
  }
  fx.bloom = 0.7;
  fx.vignette = 0.4;
  fx.sat = command ? lerp(1, 0.78, clamp(f.cmdT * 3)) : 1;
  if (command) fx.tint = [246, 250, 244];
  if (result && f.t < 0.4) {
    fx.flash = 1 - ease.outQuad(clamp(f.t / 0.4));
    fx.flashColor = [8, 4, 14];
  }
}

function drawCommand(f: Through2Field, env: Env, time: number) {
  const ctx = env.ctx;
  const hero = env.art.hero;
  const k = ease.outBack(clamp(f.cmdT / 0.3));
  const y0 = lerp(VH + 10, 248, k);
  ctx.save();
  ctx.translate(0, y0 - 248);
  ctx.fillStyle = '#180411';
  ctx.fillRect(16, 246, VW - 32, 102);
  ctx.fillStyle = '#fcb94c';
  ctx.fillRect(18, 248, VW - 36, 98);
  ctx.fillStyle = '#0d0b22';
  ctx.fillRect(21, 251, VW - 42, 92);
  ctx.fillStyle = '#8d1a16';
  ctx.fillRect(28, 258, 78, 78);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(hero.img, 24, 0, 52, 52, 28, 258, 78, 78);
  ctx.strokeStyle = '#fcb94c';
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 258, 78, 78);
  pixelText(ctx, 'No.10', 34, 322, 10, '#ffffff');
  pixelText(ctx, 'SPIRIT', 118, 258, 10, '#9fb4ff');
  ctx.fillStyle = '#180411';
  ctx.fillRect(170, 259, 160, 10);
  const fl = 0.75 + 0.25 * Math.sin(time * 12);
  const gg = ctx.createLinearGradient(170, 0, 330, 0);
  gg.addColorStop(0, HEX.emerald);
  gg.addColorStop(1, HEX.jade);
  ctx.fillStyle = gg;
  ctx.globalAlpha = fl;
  ctx.fillRect(171, 260, 158, 8);
  ctx.globalAlpha = 1;
  pixelText(ctx, '100', 338, 258, 10, HEX.jade);
  const blink = Math.sin(time * 10) > 0;
  ctx.fillStyle = 'rgba(11,143,88,0.35)';
  ctx.fillRect(116, 276, 330, 24);
  pixelText(ctx, blink ? '>' : ' ', 122, 281, 14, HEX.jade);
  ctx.save();
  ctx.font = `20px ${TITLE_FONT}`;
  ctx.fillStyle = HEX.pearl;
  ctx.textBaseline = 'top';
  ctx.fillText(SHOT_NAME, 140, 277);
  ctx.restore();
  pixelText(ctx, `SP ${f.special.cost}`, 400, 282, 10, HEX.jade);
  ['SHOOT', 'SHORT PASS', 'DRIBBLE'].forEach((s, i) => pixelText(ctx, s, 140 + i * 90, 312, 10, '#5d5a80'));
  pixelText(ctx, 'NEXT STAGE', 140, 327, 8, '#3f3c60');
  if (f.cmdT > 0.35) {
    const a = 0.55 + 0.45 * Math.sin(time * 6);
    ctx.globalAlpha = a;
    ctx.fillStyle = HEX.emerald;
    ctx.fillRect(462, 276, 150, 50);
    ctx.globalAlpha = 1;
    pixelText(ctx, 'SPACE / TAP', 537, 284, 10, '#ffffff', 'center');
    pixelText(ctx, 'UNLEASH', 537, 302, 14, HEX.pearl, 'center');
  }
  ctx.restore();
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowSprite('jade', 0.4), 67, y0 + 49, 60, 0.25 * fl);
  ctx.globalCompositeOperation = 'source-over';
}

function drawResult(f: Through2Field, env: Env, time: number) {
  const ctx = env.ctx;
  const a = clamp(f.t / 0.5);
  ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(8,6,20,0.8)';
  ctx.fillRect(0, 282, VW, 60);
  ctx.fillStyle = HEX.jade;
  ctx.fillRect(0, 282, VW, 3);
  ctx.save();
  ctx.font = `30px ${TITLE_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = HEX.pearl;
  ctx.fillText(`GOAL  ·  ${SHOT_NAME}`, VW / 2, 286);
  ctx.restore();
  pixelText(ctx, 'No.7 SCORES · ASSIST No.10', VW / 2, 318, 10, HEX.jade, 'center');
  const blink = 0.6 + 0.4 * Math.sin(time * 5);
  ctx.globalAlpha = a * blink;
  pixelText(ctx, 'R  REPLAY SPECIAL      SPACE  PLAY FROM KICK-OFF', VW / 2, 331, 10, '#ffffff', 'center');
  ctx.globalAlpha = 1;
  void no10Final;
}
