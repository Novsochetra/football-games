// GALE HAMMER v2 field scenario 'longshot2' (GALE_HAMMER_v2.md §8): 87th minute, 0-0, No.10 collects a loose ball
// 40 m out and runs at a wall of three; the keeper stands 2 m off his line and beckons once. The command window opens
// at 30 m (x 880) with the three ghost craters breathing, air loading on his boot and the stand flags starting to whip.
// The result view: the goal frame 2.8 m behind its painted line (two furrows, six pegs, the net still domed), the
// pressed wake and the three craters in the turf, the keeper hooked in the side netting, the wall down, No.10
// celebrating.
//
// A new scenario id so the shipped v1 'longshot' stays exactly as it was: Field calls these only when
// special.scenario === 'longshot2'. No.10 is drawn from studio frames (Dribble cycle, Celebrate C1/C2 or Strike F10)
// as box-filtered caches: never the field puppet.

import type { Env } from '../cinematic/timeline';
import type { SpecialDef } from '../cinematic/specials';
import { VW, VH } from '../engine/camera';
import { clamp, ease, lerp } from '../engine/math';
import type { BallSpin } from '../engine/pixel';
import { PK, drawGlow, glowSprite } from '../engine/particles';
import { FIELD, drawFieldBackdrop, drawGoal, drawShadow } from '../art/stadium';
import { KEEPER_KIT, POSES, P, RIVAL_KIT, RIVAL_KIT_B, RIVAL_KIT_C, drawPuppet, poseAt, renderPuppet, type Kit, type Pose } from '../art/puppet';
import { TITLE_FONT, pixelText } from '../art/fx';
import { drawBall } from '../cinematic/kit';
import { drawNo10Boxed, no10, no10Final, warmNo10Boxed, type No10Key } from '../art/no10';
import { GOAL_SLIDE, HEX, SHOT_NAME, STAMPS, STRIKE, WALL, ghostStamp } from '../cinematic/gale2/common';
import { airCrater, pressedWake, type WakePt } from '../cinematic/gale2/air';
import { drawGoalRig, goalRigAt } from '../cinematic/gale2/goal';

const K = 0.42;
const FIELD_SCALE = 0.4, RESULT_SCALE = 0.5;
/** The command window opens at 30 m (x 880). */
export const LONGSHOT2_X = 880;
const DRIBBLE: No10Key[] = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'];
const RUN: [number, Pose][] = [[0, POSES.run1], [0.1, POSES.run2], [0.2, POSES.run3], [0.3, POSES.run4], [0.4, POSES.run1]];
const runPose = (t: number) => poseAt(RUN, t % 0.4, (x) => x);
const D = Math.PI / 180;
const SET = (k: number) => P({ ...POSES.stand, torso: 12 * D, kneeN: (22 + 6 * k) * D, kneeF: (26 - 6 * k) * D, thighN: (10 + 4 * k) * D });

interface Actor {
  kit: Kit;
  x: number;
  z: number;
  facing: 1 | -1;
  pose: Pose;
  h: number;
}

/** The parts of Field this scenario uses (all public on Field). */
export interface Longshot2Field {
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

const state = new WeakMap<Longshot2Field, { inhaleLoop: number }>();
const st = (f: Longshot2Field) => {
  let s = state.get(f);
  if (!s) state.set(f, (s = { inhaleLoop: -1 }));
  return s;
};

/** Build the field caches up front (no hitch on the first frame). */
export function warmLongshot2(env: Env) {
  warmNo10Boxed(env, DRIBBLE, FIELD_SCALE);
  warmNo10Boxed(env, ['C1', 'C2', 'F10'], RESULT_SCALE);
}

export function longshot2Reset(f: Longshot2Field) {
  st(f).inhaleLoop = -1;
  f.hero = { kit: f.hero.kit, x: 640, z: 266, facing: 1, pose: POSES.stand, h: 0 };
  f.defA = { kit: RIVAL_KIT, x: WALL.x, z: WALL.z[0], facing: -1, pose: SET(0), h: 0 };
  f.defB = { kit: RIVAL_KIT_B, x: WALL.x + 4, z: WALL.z[1], facing: -1, pose: SET(0), h: 0 };
  f.defC = { kit: RIVAL_KIT_C, x: WALL.x + 2, z: WALL.z[2], facing: -1, pose: SET(0), h: 0 };
  f.defD = { ...f.defD, x: -500 };
  f.winger = { ...f.winger, x: -500 };
  f.keeper = { kit: KEEPER_KIT, x: 1160, z: 258, facing: -1, pose: POSES.gkReady, h: 0 };
  f.ball = { x: 668, z: 268, h: 9 };
  f.camX = 730;
}

/** The result view (fades up from [8,4,14]). */
export function longshot2Result(f: Longshot2Field, env: Env) {
  f.mode = 'result';
  f.t = 0;
  f.score = 1;
  f.timeScale = 1;
  env.sfx.crowd(3, 0.3);
  f.hero = { ...f.hero, x: 930, z: 268, facing: 1, pose: POSES.stand, h: 0 };
  f.defA = { ...f.defA, x: 1002, z: 236, facing: -1, pose: POSES.sprawl, h: -8 };
  f.defB = { ...f.defB, x: 1046, z: 262, facing: -1, pose: POSES.faceDown, h: -12 };
  f.defC = { ...f.defC, x: 980, z: 296, facing: 1, pose: POSES.sitWrongWay, h: -9 };
  // Hooked in the near side netting of the shoved goal.
  f.keeper = { ...f.keeper, x: FIELD.goalX + (FIELD.goalNear - FIELD.horizon) * 0.35 + GOAL_SLIDE + 12, z: FIELD.goalNear - 6, facing: -1, pose: POSES.netTangle, h: -2 };
  // The ball rests in the far top corner of the shoved net.
  f.ball = { x: 1214 + GOAL_SLIDE, z: 226, h: 40 };
  env.parts.clear();
}

export function longshot2Update(f: Longshot2Field, env: Env, dt: number) {
  const sdt = dt * f.timeScale;
  f.t += sdt;
  const { rng, parts, sfx } = env;
  const h = f.hero;
  if (f.mode === 'intro' || f.mode === 'command') {
    if (f.mode === 'intro') {
      h.x += 118 * sdt;
      if (h.x >= LONGSHOT2_X) {
        f.mode = 'command';
        f.cmdT = 0;
        sfx.blip(660);
      }
    } else {
      f.cmdT += dt;
      f.timeScale = lerp(f.timeScale, 0.06, 1 - Math.exp(-dt * 8));
      h.x += 118 * sdt;
    }
    h.z = 266 + Math.sin(f.t * 1.3) * 4;
    // Dribble: small touches; the loose ball he collects is still bouncing for its first half second.
    const ph = (f.t % 0.8) / 0.8;
    f.ball.x = h.x + 12 + Math.sin(ph * Math.PI) * 10;
    f.ball.z = h.z + 2;
    f.ball.h = Math.abs(Math.sin(ph * Math.PI * 2)) * 2;
    if (f.t < 0.5) f.ball.h += 9 * Math.abs(Math.cos(f.t * 9)) * (1 - f.t / 0.5);
    f.spin.rotate(0, 0, 1, sdt * 12);
    // The wall of three side-steps into a line at 22 m and mirrors his z, arms linked.
    const lock = ease.inOutQuad(clamp((f.t - 0.3) / 0.6));
    [f.defA, f.defB, f.defC].forEach((d, i) => {
      d.x = WALL.x + [0, 4, 2][i];
      d.z = lerp(WALL.z[i] + (i - 1) * 10, WALL.z[i] + (h.z - 266) * 0.8, lock) + Math.sin(f.t * 8 + i * 2) * 1.2;
      d.pose = lock < 1 && lock > 0 ? runPose(f.t + i * 0.13) : P({ ...POSES.wideBlock, torso: 6 * D, armN: 70 * D, armF: -70 * D });
    });
    // The keeper beckons once (a glove raised and waved, 0.9-1.5 s), then sets.
    const bk = f.t > 0.9 && f.t < 1.5 ? Math.sin(((f.t - 0.9) / 0.6) * Math.PI * 3) : 0;
    f.keeper.pose = bk ? P({ ...POSES.stand, armN: (120 + 30 * bk) * D, elbowN: (60 + 40 * bk) * D, armF: 20 * D }) : POSES.gkReady;
    f.keeper.z = 258 + Math.sin(f.t * 2) * 4;
    if (rng.next() < 0.3 * f.timeScale) {
      parts.spawn({ kind: PK.Smoke, x: h.x - 6, y: h.z, vx: -30, vy: -8, max: 0.5, s0: 2, s1: 7, ramp: 'dust', a0: 0.4, a1: 0, add: false, r0: 0, r1: 1 });
    }
    if (f.mode === 'command') {
      if (rng.next() < 0.3) {
        parts.spawn({
          kind: PK.Glow, x: h.x + rng.range(-10, 10), y: h.z - rng.range(0, 40), vx: 0, vy: rng.range(-60, -20),
          max: 0.5, s0: rng.range(3, 6), s1: 1, ramp: 'cobalt', r0: 0.1, r1: 1, a0: 0.9, a1: 0, layer: 0,
        });
      }
      // Air loading: the soft looping inhale (in time with the ghost craters) and dew motes drifting toward his boot.
      const k = Math.floor(f.cmdT / 1.2);
      if (k !== st(f).inhaleLoop) {
        st(f).inhaleLoop = k;
        sfx.inhale(1.2, 0.1);
      }
      const [bx, by] = bootPoint(f);
      if (rng.next() < 0.7) {
        const th = rng.range(0, Math.PI * 2), r = rng.range(14, 34);
        const x = bx + Math.cos(th) * r, y = by + Math.sin(th) * r * 0.6;
        const T = rng.range(0.35, 0.6);
        parts.spawn({ kind: PK.Glow, x, y, ax: (2 * (bx - x)) / (T * T), ay: (2 * (by - y)) / (T * T), max: T, s0: rng.range(1.2, 2), s1: 0.6, ramp: 'dew', r0: 0.1, r1: 0.5, a0: 0.9, a1: 0.3, layer: 1 });
      }
    }
    f.camX = lerp(f.camX, h.x + 80, 1 - Math.exp(-dt * 3));
  } else {
    // Result: No.10 celebrates (Celebrate hops a little; the F10 fallback stays on the turf). Dew drifts down; no confetti.
    f.hero.h = no10Final('C1') ? Math.abs(Math.sin(f.t * Math.PI * 2)) * 3 : 0;
    f.camX = lerp(f.camX, 1080, 1 - Math.exp(-dt * 2));
    if (rng.next() < 0.4) {
      parts.spawn({
        kind: PK.Pixel, x: f.camX + rng.range(-320, 320), y: rng.range(20, 120), vx: rng.range(10, 40), vy: rng.range(20, 50),
        max: 3, s0: 1, s1: 1, a0: 0.8, a1: 0, ramp: 'dew', r0: 0, r1: 0.6, layer: 1,
      });
    }
  }
  parts.update(sdt * (f.mode === 'command' ? 4 : 1));
}

const bootPoint = (f: Longshot2Field): [number, number] => [f.hero.x + 4, f.hero.z - f.hero.h - 3];

function drawHero(f: Longshot2Field, env: Env) {
  const a = f.hero;
  drawShadow(env.ctx, a.x, a.z, 11, 0.35);
  if (f.mode === 'result') {
    const key: No10Key = no10Final('C1') ? (Math.floor(f.t / 0.25) % 2 ? 'C2' : 'C1') : 'F10';
    drawNo10Boxed(env, key, a.x, a.z - a.h, RESULT_SCALE, { anchor: 'contact' });
    return;
  }
  const key = DRIBBLE[Math.floor((f.t % 0.8) / 0.1) % 8];
  const fr = no10(key);
  const pivot: [number, number] | undefined = fr ? [fr.a.anchorOf(0, 'contact')[0], 103] : undefined;
  drawNo10Boxed(env, key, a.x, a.z - a.h, FIELD_SCALE, pivot ? { pivot } : { anchor: 'contact' });
}

function drawPuppetActor(env: Env, a: Actor) {
  drawShadow(env.ctx, a.x, a.z, 11, 0.35);
  const r = renderPuppet(a.kit, a.pose, { k: K, facing: a.facing });
  drawPuppet(env.ctx, r, a.x, a.z - a.h - 40 * K, 1);
}

/** The pressed wake from the strike spot toward the far top corner (the result view's turf). */
function wakePath(): WakePt[] {
  const pts: WakePt[] = [];
  for (let i = 0; i <= 24; i++) {
    const u = i / 24;
    pts.push({ x: lerp(STRIKE.x, FIELD.goalX - 4, u), y: lerp(STRIKE.z, 224, u), w: lerp(6, 14, u) });
  }
  return pts;
}

export function longshot2Render(f: Longshot2Field, env: Env, time: number, scoreboard: (time: number) => void) {
  const { ctx, cam, fx } = env;
  const result = f.mode === 'result', command = f.mode === 'command';
  const zoom = result ? 1.15 : 1.3;
  const camY = command ? lerp(214, 256, ease.outCubic(clamp(f.cmdT / 0.4))) : result ? 236 : 214;
  cam.reset();
  cam.set(f.camX, camY, zoom, 0);
  env.world();
  drawFieldBackdrop(ctx, env.art.stadium, f.camX, camY, time, { wind: command ? 0.3 : result ? 0.15 : 0.05, windDir: 1 });
  // Turf: the ghost craters breathing (command) or the aftermath (result).
  if (command) {
    const ph = (f.cmdT % 1.2) / 1.2;
    const sc = ph < 5 / 6 ? 0.92 + 0.08 * ease.inOutQuad(ph * 1.2) : 1 - 0.08 * ease.inOutQuad((ph - 5 / 6) * 6);
    const a = clamp(f.cmdT / 0.4);
    for (const s of STAMPS) ghostStamp(ctx, s.x, s.z, s.id === 3 ? 20 : 13, sc, a);
  }
  const rig = goalRigAt(Infinity);
  if (result) {
    pressedWake(ctx, wakePath(), time, { mist: 0.3, alpha: 0.7 });
    for (const s of STAMPS) airCrater(ctx, s.x, s.z, s.id === 3 ? 20 : 13, 0.3, 2, 3, 0.85);
    drawGoalRig(ctx, 'turf', rig);
    drawGoalRig(ctx, 'back', rig);
  } else drawGoal(ctx, 'back', 0);

  const items: { z: number; draw: () => void }[] = [];
  items.push({ z: f.hero.z, draw: () => drawHero(f, env) });
  for (const a of [f.defA, f.defB, f.defC, f.keeper]) items.push({ z: a.z, draw: () => drawPuppetActor(env, a) });
  items.push({
    z: f.ball.z + 0.5,
    draw: () => {
      const air = clamp(f.ball.h / 160);
      drawShadow(ctx, f.ball.x, f.ball.z, 4 - air * 1.5, 0.4 - air * 0.25);
      const by = f.ball.z - 3 - f.ball.h;
      if (air > 0.05) {
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, glowSprite('cyan', 0.5), f.ball.x, by, 14, 0.4);
        ctx.globalCompositeOperation = 'source-over';
      }
      drawBall(env, f.spin, f.ball.x, by, air > 0.1 ? 4 : 3, 1, 0, command ? 0.7 : air > 0.05 ? 0.3 : 0, 'cobalt', undefined, { storm: true });
    },
  });
  items.sort((a, b) => a.z - b.z);
  env.parts.draw(ctx, 0);
  for (const it of items) it.draw();
  if (result) drawGoalRig(ctx, 'front', rig);
  else drawGoal(ctx, 'front');
  env.parts.draw(ctx, 1);

  env.screen();
  scoreboard(time);
  if (command) drawCommand(f, env, time);
  if (result) drawResult(f, env, time);
  if (f.mode === 'intro') {
    const a = clamp(f.t / 0.4) * clamp((2.0 - f.t) / 0.4);
    if (a > 0) {
      ctx.globalAlpha = a;
      pixelText(ctx, 'No.10 · 30 M OUT · THE KEEPER DARES HIM', VW / 2, 48, 12, '#d6f4ff', 'center');
      ctx.globalAlpha = 1;
    }
  }

  fx.bloom = 0.7;
  fx.vignette = 0.4;
  fx.sat = command ? lerp(1, 0.75, clamp(f.cmdT * 3)) : 1;
  if (command) {
    fx.tint = [lerp(255, 214, clamp(f.cmdT * 3)), lerp(255, 228, clamp(f.cmdT * 3)), 255];
    const [u, v] = cam.toUV(...bootPoint(f));
    fx.lens = -0.06 * clamp(f.cmdT * 3);
    fx.lensX = u;
    fx.lensY = v;
    fx.lensR = 0.06;
  }
  if (result && f.t < 0.4) {
    fx.flash = 1 - ease.outQuad(clamp(f.t / 0.4));
    fx.flashColor = [8, 4, 14];
  }
}

function drawCommand(f: Longshot2Field, env: Env, time: number) {
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
  gg.addColorStop(0, HEX.cobalt);
  gg.addColorStop(1, HEX.cyan);
  ctx.fillStyle = gg;
  ctx.globalAlpha = fl;
  ctx.fillRect(171, 260, 158, 8);
  ctx.globalAlpha = 1;
  pixelText(ctx, '100', 338, 258, 10, HEX.cyan);
  const blink = Math.sin(time * 10) > 0;
  ctx.fillStyle = 'rgba(45,82,224,0.35)';
  ctx.fillRect(116, 276, 330, 24);
  pixelText(ctx, blink ? '>' : ' ', 122, 281, 14, HEX.cyan);
  ctx.save();
  ctx.font = `20px ${TITLE_FONT}`;
  ctx.fillStyle = HEX.ice;
  ctx.textBaseline = 'top';
  ctx.fillText(SHOT_NAME, 140, 277);
  ctx.restore();
  pixelText(ctx, `SP ${f.special.cost}`, 400, 282, 10, HEX.cyan);
  // The cyan 30 M readout beside the highlighted row.
  ctx.fillStyle = 'rgba(10,18,56,0.9)';
  ctx.fillRect(330, 279, 52, 17);
  ctx.strokeStyle = HEX.cyan;
  ctx.lineWidth = 1;
  ctx.strokeRect(330.5, 279.5, 51, 16);
  pixelText(ctx, '30 M', 356, 282, 10, HEX.cyan, 'center', HEX.navy);
  ['SHOOT', 'PASS', 'DRIBBLE'].forEach((s, i) => pixelText(ctx, s, 140 + i * 90, 312, 10, '#5d5a80'));
  pixelText(ctx, 'NEXT STAGE', 140, 327, 8, '#3f3c60');
  if (f.mode === 'command' && f.cmdT > 0.35) {
    const a = 0.55 + 0.45 * Math.sin(time * 6);
    ctx.globalAlpha = a;
    ctx.fillStyle = '#2D52E0';
    ctx.fillRect(462, 276, 150, 50);
    ctx.globalAlpha = 1;
    pixelText(ctx, 'SPACE / TAP', 537, 284, 10, '#ffffff', 'center');
    pixelText(ctx, 'UNLEASH', 537, 302, 14, HEX.ice, 'center');
  }
  ctx.restore();
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowSprite('cobalt', 0.4), 67, y0 + 49, 60, 0.25 * fl);
  ctx.globalCompositeOperation = 'source-over';
}

function drawResult(f: Longshot2Field, env: Env, time: number) {
  const ctx = env.ctx;
  const a = clamp(f.t / 0.5);
  ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(8,6,20,0.8)';
  ctx.fillRect(0, 282, VW, 60);
  ctx.fillStyle = HEX.cobalt;
  ctx.fillRect(0, 282, VW, 3);
  ctx.save();
  ctx.font = `30px ${TITLE_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = HEX.ice;
  ctx.fillText(`GOAL  ·  ${SHOT_NAME}`, VW / 2, 286);
  ctx.restore();
  const blink = 0.6 + 0.4 * Math.sin(time * 5);
  ctx.globalAlpha = a * blink;
  pixelText(ctx, 'R  REPLAY SPECIAL      SPACE  PLAY FROM KICK-OFF', VW / 2, 324, 10, '#ffffff', 'center');
  ctx.globalAlpha = 1;
}
