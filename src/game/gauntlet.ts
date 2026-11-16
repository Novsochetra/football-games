// SPOTLIGHT SOLO field scenario 'gauntlet' (SPEC "Field scenario 'gauntlet'"): 87th minute, 0-0, No.10 runs at a
// staggered wall of four white shirts at the box edge. The command window turns the field into a stage (lights to
// 70%, an ivory floor pool at his feet, the tempo starting at 150 BPM in the panel's lamps), a 0.15 s launch bridge
// drops every light to black before shot 1, and the result is a BREAKTHROUGH: No.10 on the penalty spot with his sole
// on the ball, the keeper crouched wide, all four defenders down, 1 ON 1.
//
// Field.ts calls these only when special.scenario === 'gauntlet', so the other scenarios are untouched.
// No.10 is drawn from studio frames (Dribble cycle, Settle F3) as box-filtered caches: never the field puppet.

import type { Env } from '../cinematic/timeline';
import type { SpecialDef } from '../cinematic/specials';
import { VW, VH } from '../engine/camera';
import { clamp, ease, lerp } from '../engine/math';
import { BallSpin } from '../engine/pixel';
import { PK, drawGlow, glowOf } from '../engine/particles';
import { drawFieldBackdrop, drawGoal, drawShadow } from '../art/stadium';
import { HERO_KIT, KEEPER_KIT, POSES, RIVAL_KIT, RIVAL_KIT_B, RIVAL_KIT_C, RIVAL_KIT_D, joints, poseAt, type Kit, type Pose } from '../art/puppet';
import { TITLE_FONT, pixelText } from '../art/fx';
import { stage } from '../art/stage';
import { drawBall } from '../cinematic/kit';
import { drawSoloBoxed, soloAnchor, soloPic, warmSolo, type SoloKey } from '../cinematic/solo/frames';
import { HEX, LAYOUT, PAL, PuppetCache, beatPulse } from '../cinematic/solo/common';

/** Field puppet scale (px per unit) and the No.10 cache scales (same as the other field views). */
const K = 0.42;
const FIELD_SCALE = 0.4, RESULT_SCALE = 0.5;
/** The command window opens when A is about 40 px away (hero x >= 860). */
const CMD_X = 860;
/** The launch bridge: 0.15 s (the pool snaps tight, then every light drops to black). */
const LAUNCH = 0.15, BLACKOUT = 0.07;
const DRIBBLE: SoloKey[] = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'];

interface Actor {
  kit: Kit;
  x: number;
  z: number;
  facing: 1 | -1;
  pose: Pose;
  h: number;
}

/** The parts of Field this scenario controls (all public on Field). */
export interface GauntletField {
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

interface GState {
  /** Launch bridge clock (-1 = not launching). */
  launchT: number;
  launched: boolean;
  /** Per-defender run-cycle phase and pose name for the cache. */
  poseName: Map<Actor, string>;
}

const STATE = new WeakMap<GauntletField, GState>();
const st = (f: GauntletField): GState => {
  let s = STATE.get(f);
  if (!s) STATE.set(f, (s = { launchT: -1, launched: false, poseName: new Map() }));
  return s;
};

const puppets = new PuppetCache();
const RUN: [number, Pose][] = [[0, POSES.run1], [0.1, POSES.run2], [0.2, POSES.run3], [0.3, POSES.run4], [0.4, POSES.run1]];
/** Run phase quantised to 1/40 s, so the run cycle comes from a cache (16 poses per kit). */
const runPhase = (t: number) => Math.round((((t % 0.4) + 0.4) % 0.4) * 40) % 16;
const runPose = (ph: number) => poseAt(RUN, ph / 40, (x) => x);

/** How far the hip sits above the ground for a pose (units): the lowest joint touches the turf. */
function hipAbove(pose: Pose): number {
  const j = joints(pose);
  return Math.max(j.toeN[1] + 3, j.toeF[1] + 3, j.ankleN[1] + 3, j.kneeN[1] + 5, j.handN[1] + 3, j.handF[1] + 3, j.head[1] + 12, j.neck[1] + 8);
}

/** Pre-render the caches (call when the special is selected). */
export function warmGauntlet(env: Env) {
  warmSolo(env, DRIBBLE, { boxed: [FIELD_SCALE] });
  warmSolo(env, ['ST3', 'ST3b'], { boxed: [RESULT_SCALE] });
  for (const kit of [RIVAL_KIT, RIVAL_KIT_B, RIVAL_KIT_C, RIVAL_KIT_D]) for (let p = 0; p < 16; p++) puppets.get(`run${p}`, kit, runPose(p), K, -1);
  puppets.get('gkReady', KEEPER_KIT, POSES.gkReady, K, -1);
  puppets.get('gkSpread', KEEPER_KIT, POSES.gkSpread, K, -1);
  for (const [n, kit] of [['kneelStumble', RIVAL_KIT], ['faceDown', RIVAL_KIT_B], ['sideTopple', RIVAL_KIT_C], ['sitBack', RIVAL_KIT_D]] as const)
    puppets.get(n, kit, POSES[n], K, -1);
}

/** Set-up: No.10 picks the ball up at x 690, z 262; the wall of four; the keeper on his line. */
export function gauntletReset(f: GauntletField) {
  const L = LAYOUT;
  const a = (kit: Kit, p: { x: number; z: number }): Actor => ({ kit, x: p.x, z: p.z, facing: -1, pose: POSES.jockey, h: 0 });
  f.hero = { kit: HERO_KIT, x: L.heroStart.x, z: L.heroStart.z, facing: 1, pose: POSES.stand, h: 0 };
  f.defA = a(RIVAL_KIT, L.A);
  f.defB = a(RIVAL_KIT_B, L.B);
  f.defC = a(RIVAL_KIT_C, L.C);
  f.defD = a(RIVAL_KIT_D, L.D);
  f.keeper = { kit: KEEPER_KIT, x: L.keeper.x, z: L.keeper.z, facing: -1, pose: POSES.gkReady, h: 0 };
  f.winger = { ...f.winger, x: -500 };
  f.ball = { x: L.heroStart.x + 20, z: L.heroStart.z + 2, h: 0 };
  f.camX = 790;
  const s = st(f);
  s.launchT = -1;
  s.launched = false;
  s.poseName.clear();
}

/** Start the launch bridge (on confirm): sticks(), the pool snaps tight, then every field light drops to black. */
export function gauntletLaunch(f: GauntletField, env: Env) {
  const s = st(f);
  if (s.launchT >= 0) return;
  s.launchT = 0;
  s.launched = false;
  env.sfx.sticks();
}

/** True once the bridge has run its 0.15 s: game.ts then unleashes shot 1 (which opens on black). */
export const gauntletLaunched = (f: GauntletField) => st(f).launched;
/** True while the bridge is running. */
export const gauntletLaunching = (f: GauntletField) => st(f).launchT >= 0 && !st(f).launched;

/** The result view: BREAKTHROUGH · 1 ON 1 (no goal: the score stays 0-0). */
export function gauntletResult(f: GauntletField, env: Env) {
  const R = LAYOUT.result;
  f.mode = 'result';
  f.t = 0;
  f.timeScale = 1;
  f.score = 0;
  const s = st(f);
  s.launchT = -1;
  s.launched = false;
  env.sfx.crowd(3, 0.35);
  const down = (d: Actor, p: { x: number; z: number }, pose: Pose, name: string) => {
    Object.assign(d, { x: p.x, z: p.z, facing: -1, pose, h: 0 });
    s.poseName.set(d, name);
  };
  down(f.defA, R.A, POSES.kneelStumble, 'kneelStumble');
  down(f.defB, R.B, POSES.faceDown, 'faceDown');
  down(f.defC, R.C, POSES.sideTopple, 'sideTopple');
  down(f.defD, R.D, POSES.sitBack, 'sitBack');
  down(f.keeper, R.keeper, POSES.gkSpread, 'gkSpread');
  f.hero = { ...f.hero, x: R.hero.x, z: R.hero.z, facing: 1, h: 0 };
  // The ball under his sole: Settle F3's ball anchor on the half-size cache.
  const [bx, by] = settleBall(env);
  f.ball = { x: R.hero.x + bx, z: R.hero.z, h: -by };
  f.camX = 1040;
  env.parts.clear();
}

/** Ball offset from his feet in the result cache (world px): x ahead, y up (negative = above the feet). */
function settleBall(env: Env): [number, number] {
  const piv = soloAnchor(env, 'ST3', 'contact');
  const b = soloAnchor(env, 'ST3', 'ball');
  return [(b[0] - piv[0]) * RESULT_SCALE, Math.min(0, (b[1] - piv[1]) * RESULT_SCALE) + 3];
}

export function gauntletUpdate(f: GauntletField, env: Env, dt: number) {
  const s = st(f);
  const sdt = dt * f.timeScale;
  f.t += sdt;
  const { rng, parts } = env;
  if (f.mode === 'intro' || f.mode === 'command') {
    const h = f.hero;
    if (f.mode === 'intro') {
      h.x += 118 * sdt;
      if (h.x >= CMD_X) {
        f.mode = 'command';
        f.cmdT = 0;
        env.sfx.blip(660);
      }
    } else {
      f.cmdT += dt;
      f.timeScale = lerp(f.timeScale, 0.06, 1 - Math.exp(-dt * 8));
      h.x += 118 * sdt;
      if (s.launchT >= 0 && !s.launched) {
        s.launchT += dt;
        if (s.launchT >= LAUNCH - 1e-6) s.launched = true;
      }
    }
    // The existing small-touch dribble.
    const ph = (f.t % 0.8) / 0.8;
    f.ball.x = h.x + 12 + Math.sin(ph * Math.PI) * 10;
    f.ball.z = h.z + 2;
    f.ball.h = Math.abs(Math.sin(ph * Math.PI * 2)) * 2;
    f.spin.rotate(0, 0, 1, sdt * 12);
    // The wall closes in (the run cycles crawl with the time scale while the window is open).
    const targets: [Actor, number, number, number, number][] = [
      [f.defA, 50, 26, 44, 0.13], [f.defB, 105, 36, 74, 0.27], [f.defC, 150, -20, 74, 0.05], [f.defD, 185, 8, 74, 0.33],
    ];
    for (const [d, dx, dz, gap, phase] of targets) {
      const x0 = d.x;
      d.x = lerp(d.x, h.x + dx, 1 - Math.exp(-sdt * 0.7));
      d.z = lerp(d.z, h.z + dz, 1 - Math.exp(-sdt * 0.9));
      d.x = Math.max(d.x, h.x + gap);
      const moving = sdt > 0 && Math.abs(d.x - x0) / sdt > 6;
      const p = runPhase(f.t + phase);
      d.pose = moving ? runPose(p) : POSES.jockey;
      s.poseName.set(d, moving ? `run${p}` : 'jockey');
    }
    f.keeper.z = LAYOUT.keeper.z + Math.sin(f.t * 2) * 6;
    f.keeper.pose = POSES.gkReady;
    s.poseName.set(f.keeper, 'gkReady');
    if (rng.next() < 0.3 * f.timeScale) {
      parts.spawn({ kind: PK.Smoke, x: h.x - 6, y: h.z, vx: -30, vy: -8, max: 0.5, s0: 2, s1: 7, ramp: 'dust', a0: 0.4, a1: 0, add: false, r0: 0, r1: 1 });
    }
    // A few ultraviolet motes drift up out of the floor pool (the one shared mapping: solo -> 'uv'). Normal blend from
    // lilac down, each on a uvDeep halo: added over the green turf, ivory and lilac read as mint (MERIDIAN THREAD's
    // jade), never violet.
    if (f.mode === 'command' && rng.next() < 0.25) {
      const x = h.x + rng.range(-12, 12), y = h.z - rng.range(0, 10), vy = rng.range(-30, -12), s0 = rng.range(1.5, 3);
      parts.spawn({ kind: PK.Glow, x, y, vx: 0, vy, max: 0.6, s0: s0 * 2, s1: 1, ramp: 'uv', r0: 1, r1: 1, a0: 0.45, a1: 0, layer: 0, add: false });
      parts.spawn({ kind: PK.Glow, x, y, vx: 0, vy, max: 0.6, s0, s1: 0.5, ramp: 'uv', r0: 0.4, r1: 0.9, a0: 0.7, a1: 0, layer: 0, add: false });
    }
    f.camX = lerp(f.camX, h.x + 80, 1 - Math.exp(-dt * 3));
  } else {
    // Result: No.10 holds the ball on the spot (Settle F3 / F3b breathing on the beat); the camera settles.
    f.camX = lerp(f.camX, 1040, 1 - Math.exp(-dt * 2));
    f.keeper.pose = POSES.gkSpread;
  }
  parts.update(sdt * (f.mode === 'command' ? 4 : 1));
}

/** No.10 on the field: the Dribble cycle (0.4x) while running, Settle F3 / F3b (0.5x) in the result view. */
function drawHero(f: GauntletField, env: Env) {
  const a = f.hero;
  drawShadow(env.ctx, a.x, a.z, 11, 0.35);
  if (f.mode === 'result') {
    const key: SoloKey = Math.floor(f.t / 0.4) % 2 ? 'ST3b' : 'ST3';
    drawSoloBoxed(env, key, a.x, a.z, RESULT_SCALE, { anchor: 'contact' });
    return;
  }
  const key = DRIBBLE[Math.floor((f.t % 0.8) / 0.1) % 8];
  const p = soloPic(env, key);
  // Studio strips share one registration: a fixed pivot (frame 1's toe on the ground row) so the actor's x carries him.
  const pivot: [number, number] | undefined = p.source !== 'fallback' ? [soloAnchor(env, 'D1', 'contact')[0], 103] : undefined;
  drawSoloBoxed(env, key, a.x, a.z - a.h, FIELD_SCALE, pivot ? { pivot } : { anchor: 'contact' });
}

function drawPuppetActor(f: GauntletField, env: Env, a: Actor) {
  const ctx = env.ctx;
  const name = st(f).poseName.get(a) ?? 'jockey';
  const lying = f.mode === 'result' && a !== f.keeper;
  drawShadow(ctx, a.x, a.z, lying ? 14 : 11, 0.35);
  // Upright field poses keep the field's standard hip height; the result poses sit their lowest joint on the turf.
  const hip = (f.mode === 'result' ? hipAbove(a.pose) : 40) * K;
  puppets.draw(ctx, name, a.kit, a.pose, K, a.facing, a.x, a.z - a.h - hip, 1);
}

/** Torn turf behind B's slide (dark divots, no glow), fading over 3 s of the result view. */
function drawTornTurf(f: GauntletField, env: Env) {
  const a = clamp(1 - f.t / 3);
  if (a <= 0) return;
  const ctx = env.ctx;
  const b = LAYOUT.result.B;
  ctx.globalAlpha = a * 0.85;
  for (let i = 0; i < 9; i++) {
    const x = b.x + 8 + i * 6 + ((i * 7) % 3);
    const w = 4 - (i % 2), y = b.z + ((i * 5) % 3) - 1;
    ctx.fillStyle = i % 3 === 0 ? '#3a2a1c' : '#1d4a24';
    ctx.fillRect(Math.round(x), Math.round(y), w, 2);
  }
  ctx.globalAlpha = 1;
}

export function gauntletRender(f: GauntletField, env: Env, time: number, scoreboard: (time: number) => void) {
  const { ctx, cam, fx } = env;
  const s = st(f);
  const zoom = f.mode === 'result' ? 1.15 : 1.3;
  cam.reset();
  cam.set(f.camX, 214, zoom, 0);
  env.world();
  const cmdK = f.mode === 'command' ? clamp(f.cmdT * 3) : 0;
  const launching = f.mode === 'command' && s.launchT >= 0;
  const black = launching && s.launchT >= BLACKOUT;
  const glow = lerp(1, 0.7, cmdK);
  drawFieldBackdrop(ctx, env.art.stadium, f.camX, 214, time, { towers: [glow, glow, glow, glow] });
  drawGoal(ctx, 'back', 0);
  if (f.mode === 'result') drawTornTurf(f, env);

  const items: { z: number; draw: () => void }[] = [];
  for (const a of [f.defA, f.defB, f.defC, f.defD, f.keeper]) items.push({ z: a.z, draw: () => drawPuppetActor(f, env, a) });
  items.push({ z: f.hero.z, draw: () => drawHero(f, env) });
  items.push({
    z: f.ball.z + 0.5,
    draw: () => {
      drawShadow(ctx, f.ball.x, f.ball.z, 4, 0.4);
      drawBall(env, f.spin, f.ball.x, f.ball.z - 3 - f.ball.h, 3, 1, 0, f.mode === 'command' ? 0.6 : 0, f.mode === 'command' ? 'blacklight' : 'fire');
    },
  });
  items.sort((a, b) => a.z - b.z);
  env.parts.draw(ctx, 0);
  for (const it of items) it.draw();
  drawGoal(ctx, 'front');
  env.parts.draw(ctx, 1);

  // Stage theme while the command window is open: the floodlights dim to 70% around a soft pool at his feet.
  if (cmdK > 0) {
    const [u, v] = cam.toUV(f.hero.x, f.hero.z - 14);
    const tight = launching ? clamp(s.launchT / BLACKOUT) : 0;
    const hole = { x: u * VW, y: v * VH, rx: lerp(46, 22, tight), ry: lerp(58, 30, tight), soft: lerp(30, 10, tight), gain: 1 };
    env.screen();
    stage.dim(ctx, lerp(0.4, 0.7, tight) * cmdK, [hole]);
    env.world();
    stage.floorPool(ctx, f.hero.x + 4, f.hero.z, lerp(26, 14, tight), lerp(6, 3.5, tight), 0.35 * cmdK);
  }
  if (black) {
    // Every field light drops to black in one frame; only the tight pool on his feet is left, then the hard cut.
    env.screen();
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, VW, VH);
    env.world();
    stage.floorPool(ctx, f.hero.x + 4, f.hero.z, 14, 3.5, 0.5);
    drawHero(f, env);
  }

  env.screen();
  if (!black) {
    scoreboard(time);
    if (f.mode === 'command') drawCommand(f, env, time, launching);
    if (f.mode === 'result') drawResult(f, env, time);
    if (f.mode === 'intro') {
      const a = clamp(f.t / 0.4) * clamp((2.0 - f.t) / 0.4);
      if (a > 0) {
        ctx.globalAlpha = a;
        pixelText(ctx, 'No.10 FACES A WALL OF FOUR', VW / 2, 48, 12, HEX.ivory, 'center');
        ctx.globalAlpha = 1;
      }
    }
  }

  fx.bloom = 0.7;
  fx.vignette = 0.4;
  fx.sat = 1; // SPOTLIGHT SOLO never desaturates: the darkness is light only.
  if (f.mode === 'command') fx.tint = [238, 230, 255];
  if (f.mode === 'result' && f.t < 0.4) {
    fx.flash = 1 - ease.outQuad(clamp(f.t / 0.4));
    fx.flashColor = [8, 4, 14];
  }
}

/** The command window in ultraviolet: the tempo starts here (the lamp pads chase at 150 BPM, the gauge pulses). */
function drawCommand(f: GauntletField, env: Env, time: number, launching: boolean) {
  const ctx = env.ctx;
  const hero = env.art.hero;
  const k = ease.outBack(clamp(f.cmdT / 0.3));
  const y0 = lerp(VH + 10, 248, k);
  const beat = beatPulse(f.cmdT);
  ctx.save();
  ctx.translate(0, y0 - 248);
  ctx.fillStyle = HEX.plum;
  ctx.fillRect(16, 246, VW - 32, 102);
  ctx.fillStyle = HEX.uv;
  ctx.fillRect(18, 248, VW - 36, 98);
  ctx.fillStyle = '#0d0820';
  ctx.fillRect(21, 251, VW - 42, 92);
  // Portrait
  ctx.fillStyle = HEX.uvDeep;
  ctx.fillRect(28, 258, 78, 78);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(hero.img, 24, 0, 52, 52, 28, 258, 78, 78);
  ctx.strokeStyle = HEX.lilac;
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 258, 78, 78);
  pixelText(ctx, 'No.10', 34, 322, 10, '#ffffff');
  // Spirit gauge: uvDeep -> ultraviolet, pulsing on every beat.
  pixelText(ctx, 'SPIRIT', 118, 258, 10, HEX.lilac);
  ctx.fillStyle = HEX.plum;
  ctx.fillRect(170, 259, 160, 10);
  const gg = ctx.createLinearGradient(170, 0, 330, 0);
  gg.addColorStop(0, HEX.uvDeep);
  gg.addColorStop(1, HEX.uv);
  ctx.fillStyle = gg;
  ctx.globalAlpha = 0.7 + 0.3 * beat;
  ctx.fillRect(171, 260, 158, 8);
  ctx.globalAlpha = 1;
  pixelText(ctx, '100', 338, 258, 10, HEX.lilac);
  // Four lamp pads chasing at 150 BPM.
  const lit = Math.floor(f.cmdT / 0.4 + 1e-6) % 4;
  for (let i = 0; i < 4; i++) {
    const x = 372 + i * 13, y = 259;
    if (i === lit) {
      drawGlow(ctx, glowOf(PAL.uvDeep), x + 4.5, y + 4.5, 10, 0.9);
      drawGlow(ctx, glowOf(PAL.uv), x + 4.5, y + 4.5, 8, 0.6);
    }
    ctx.fillStyle = i === lit ? HEX.ivory : HEX.uvDeep;
    ctx.fillRect(x, y, 9, 9);
    ctx.strokeStyle = HEX.lilac;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, 8, 8);
  }
  // DRIBBLE is lit: > SPOTLIGHT SOLO  SP 50
  const blink = Math.sin(time * 10) > 0;
  ctx.fillStyle = 'rgba(122,77,255,0.32)';
  ctx.fillRect(116, 276, 330, 24);
  pixelText(ctx, blink ? '>' : ' ', 122, 281, 14, HEX.ivory);
  ctx.save();
  ctx.font = `20px ${TITLE_FONT}`;
  ctx.fillStyle = HEX.ivory;
  ctx.textBaseline = 'top';
  ctx.fillText(f.special.name, 140, 277);
  ctx.restore();
  ctx.fillStyle = 'rgba(22,10,38,0.9)';
  ctx.fillRect(322, 279, 66, 17);
  ctx.strokeStyle = HEX.lilac;
  ctx.lineWidth = 1;
  ctx.strokeRect(322.5, 279.5, 65, 16);
  pixelText(ctx, 'DRIBBLE', 355, 283, 8, HEX.lilac, 'center', HEX.plum);
  pixelText(ctx, `SP ${f.special.cost}`, 400, 282, 10, HEX.lilac);
  // Dimmed rows.
  pixelText(ctx, 'SHOOT   OUT OF RANGE', 140, 306, 10, '#5d5a80');
  pixelText(ctx, 'PASS    LANES CLOSED', 140, 322, 10, '#5d5a80');
  // Prompt
  if (f.cmdT > 0.35 && !launching) {
    ctx.globalAlpha = 0.55 + 0.45 * Math.sin(time * 6);
    ctx.fillStyle = HEX.uv;
    ctx.fillRect(462, 276, 150, 50);
    ctx.globalAlpha = 1;
    pixelText(ctx, 'SPACE / TAP', 537, 284, 10, '#ffffff', 'center', HEX.plum);
    pixelText(ctx, 'TAKE THE STAGE', 537, 303, 12, HEX.ivory, 'center', HEX.plum);
  }
  ctx.restore();
  // Lilac portrait glow over its uvDeep halo.
  drawGlow(ctx, glowOf(PAL.uvDeep), 67, y0 + 49, 64, 0.35);
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.lilac), 67, y0 + 49, 56, 0.18 * (0.75 + 0.25 * beat));
  ctx.globalCompositeOperation = 'source-over';
}

function drawResult(f: GauntletField, env: Env, time: number) {
  const ctx = env.ctx;
  const a = clamp(f.t / 0.5);
  ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(22,10,38,0.82)';
  ctx.fillRect(0, 282, VW, 60);
  ctx.fillStyle = HEX.uv;
  ctx.fillRect(0, 282, VW, 3);
  ctx.save();
  ctx.font = `30px ${TITLE_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = HEX.ivory;
  ctx.fillText('BREAKTHROUGH  ·  1 ON 1', VW / 2, 286);
  ctx.restore();
  ctx.globalAlpha = a * (0.6 + 0.4 * Math.sin(time * 5));
  pixelText(ctx, 'R  REPLAY  ·  SPACE  KICK-OFF', VW / 2, 324, 10, '#ffffff', 'center');
  ctx.globalAlpha = 1;
}
