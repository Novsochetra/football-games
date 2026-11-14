// Field view: the situation that sets up each special (a dribble for ZENITH METEOR, a high
// cross for CRIMSON CRESCENT, a long shot from 30 m for GALE HAMMER, a through ball behind a back
// four for MERIDIAN THREAD), the slowed-down command window, and the aftermath.

import type { Env } from '../cinematic/timeline';
import { VW, VH } from '../engine/camera';
import { clamp, ease, lerp } from '../engine/math';
import { BallSpin } from '../engine/pixel';
import { PK, drawGlow, glowSprite, type RampName } from '../engine/particles';
import { FIELD, drawFieldBackdrop, drawGoal, drawShadow } from '../art/stadium';
import {
  HERO_KIT, KEEPER_KIT, RIVAL_KIT, RIVAL_KIT_B, RIVAL_KIT_C, RIVAL_KIT_D, WINGER_KIT, POSES, P, drawPuppet, poseAt, renderPuppet,
  type Kit, type Pose,
} from '../art/puppet';
import { PIXEL_FONT, TITLE_FONT, pixelText } from '../art/fx';
import { drawBall } from '../cinematic/kit';
import type { SpecialDef, SpecialId } from '../cinematic/specials';
import { drawNo10Boxed, no10, no10Final, warmNo10Boxed, type No10Key } from '../art/no10';
import { STAMPS, drawStamp, ghostStamp } from '../cinematic/gale/common';
import { gauntletRender, gauntletReset, gauntletResult, gauntletUpdate, warmGauntlet } from './gauntlet';
import { drawNo7Boxed, no7, no7Final, warmNo7, type No7Key } from '../art/no7';
import { HEX as MT, LAYOUT, PATH, crossStitch, needleEye, threadLine, type XZ } from '../cinematic/meridian/common';
import { THREAD_NOTES } from '../engine/audio';

const K = 0.42;
const RUN: [number, Pose][] = [
  [0, POSES.run1], [0.1, POSES.run2], [0.2, POSES.run3], [0.3, POSES.run4], [0.4, POSES.run1],
];
const runPose = (t: number) => poseAt(RUN, t % 0.4, (x) => x);

/** One shared mapping: each special's aura / command-window mote ramp. */
export const AURA_RAMP: Record<SpecialId, RampName> = { zenith: 'aura', crescent: 'crimson', gale: 'cobalt', solo: 'uv', meridian: 'jade' };

/** Long shot (GALE HAMMER): No.10 is drawn from the studio Dribble cycle / Celebrate as box-filtered caches, never a puppet. */
const DRIBBLE: No10Key[] = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'];
const FIELD_SCALE = 0.4, RESULT_SCALE = 0.5;
/** Command window opens at 30 m (x 880). */
const LONGSHOT_X = 880;
/** Through ball (MERIDIAN THREAD): the command window opens when No.10 reaches x 900 (~1.2 s). */
const THROUGH_X = 900;
/** No.7's re-skinned Run cache for the field (and the result view's Celebrate). */
const NO7_RUN: No7Key[] = ['Run.R1', 'Run.R2', 'Run.R3', 'Run.R4', 'Run.R5', 'Run.R6', 'Run.R7', 'Run.R8'];
/** Command-window stitch preview: the eye markers pluck E5, F#5, A5 at these cmdT. */
const EYE_PLUCKS = [0.25, 0.45, 0.65];

interface Actor {
  kit: Kit;
  x: number;
  z: number;
  facing: 1 | -1;
  pose: Pose;
  h: number; // height above ground
}

export type FieldMode = 'intro' | 'command' | 'result';

export class Field {
  mode: FieldMode = 'intro';
  t = 0;
  cmdT = 0;
  score = 0;
  hero!: Actor;
  defA!: Actor;
  defB!: Actor;
  /** The two extra defenders of the four-man wall ('through' and 'gauntlet' only; parked off the pitch otherwise). */
  defC!: Actor;
  defD!: Actor;
  keeper!: Actor;
  /** No.7, who delivers the cross (cross scenario only). */
  winger!: Actor;
  /** Cross flight progress 0..1 (cross scenario). */
  crossU = 0;
  ball = { x: 0, z: 0, h: 0 };
  spin = new BallSpin();
  camX = 800;
  /** Simulation time scale (slow-mo when the command window is open). */
  timeScale = 1;
  /** Long shot: index of the last command-window inhale loop started. */
  private inhaleLoop = -1;
  /** Through ball: how many of the stitch preview's eye plucks have played. */
  private eyePlucks = 0;

  constructor(private env: Env, public special: SpecialDef) {
    this.reset();
  }

  setSpecial(def: SpecialDef) {
    this.special = def;
    this.reset();
    if (def.scenario === 'longshot') {
      // Build the field caches up front (no hitch on the first frame).
      warmNo10Boxed(this.env, DRIBBLE, FIELD_SCALE);
      warmNo10Boxed(this.env, ['C1', 'C2'], RESULT_SCALE);
    } else if (def.scenario === 'through') {
      warmNo10Boxed(this.env, DRIBBLE, FIELD_SCALE);
      warmNo10Boxed(this.env, ['C1', 'C2', 'P3a'], RESULT_SCALE);
      warmNo7(this.env, NO7_RUN, FIELD_SCALE);
      warmNo7(this.env, ['Celebrate.C1', 'Celebrate.C2', 'Point.Q2'], RESULT_SCALE);
    }
    if (def.scenario === 'gauntlet') warmGauntlet(this.env);
  }

  reset() {
    this.mode = 'intro';
    this.t = 0;
    this.cmdT = 0;
    this.timeScale = 1;
    this.crossU = 0;
    this.inhaleLoop = -1;
    this.eyePlucks = 0;
    this.keeper = { kit: KEEPER_KIT, x: 1168, z: 258, facing: -1, pose: POSES.gkReady, h: 0 };
    if (this.special.scenario === 'through') {
      // No.10 looks up 30 m out; a flat back four, D1 about to press; No.7 wide on the near touchline (all from LAYOUT).
      const L = LAYOUT;
      this.hero = { kit: HERO_KIT, x: L.no10Start.x, z: L.no10Start.z, facing: 1, pose: POSES.stand, h: 0 };
      this.defA = { kit: RIVAL_KIT, x: L.d1.x, z: L.d1.z, facing: -1, pose: POSES.stand, h: 0 };
      this.defB = { kit: RIVAL_KIT_B, x: L.d2.x, z: L.d2.z, facing: -1, pose: POSES.stand, h: 0 };
      this.winger = { kit: WINGER_KIT, x: L.no7Start.x, z: L.no7Start.z, facing: 1, pose: POSES.stand, h: 0 };
      this.keeper.x = L.keeper.x;
      this.keeper.z = L.keeper.z;
      this.ball = { x: L.no10Start.x + 12, z: L.no10Start.z + 2, h: 0 };
      this.camX = 840;
    } else if (this.special.scenario === 'longshot') {
      // 87th minute, 0-0: No.10 collects a loose ball 40 m out and runs at a packed defence; the keeper is 2 m off his line.
      this.hero = { kit: HERO_KIT, x: 640, z: 266, facing: 1, pose: POSES.stand, h: 0 };
      this.defA = { kit: RIVAL_KIT, x: 968, z: 244, facing: -1, pose: POSES.stand, h: 0 };
      this.defB = { kit: RIVAL_KIT_B, x: 978, z: 296, facing: -1, pose: POSES.stand, h: 0 };
      this.winger = { kit: WINGER_KIT, x: -500, z: 300, facing: 1, pose: POSES.stand, h: 0 };
      this.keeper.x = 1160;
      this.ball = { x: 668, z: 268, h: 9 };
      this.camX = 730;
    } else if (this.special.scenario === 'cross') {
      // No.10 in the box, back to goal; No.7 races to the right byline to cross.
      this.hero = { kit: HERO_KIT, x: 1030, z: 264, facing: -1, pose: POSES.stand, h: 0 };
      this.defA = { kit: RIVAL_KIT, x: 1066, z: 254, facing: -1, pose: POSES.stand, h: 0 };
      this.defB = { kit: RIVAL_KIT_B, x: 984, z: 300, facing: 1, pose: POSES.stand, h: 0 };
      this.winger = { kit: WINGER_KIT, x: 1080, z: 336, facing: 1, pose: POSES.stand, h: 0 };
      this.ball = { x: 1094, z: 338, h: 0 };
      this.camX = 1050;
    } else {
      this.hero = { kit: HERO_KIT, x: 690, z: 262, facing: 1, pose: POSES.stand, h: 0 };
      this.defA = { kit: RIVAL_KIT, x: 1090, z: 236, facing: -1, pose: POSES.stand, h: 0 };
      this.defB = { kit: RIVAL_KIT_B, x: 1060, z: 300, facing: -1, pose: POSES.stand, h: 0 };
      this.winger = { kit: WINGER_KIT, x: -500, z: 300, facing: 1, pose: POSES.stand, h: 0 };
      this.ball = { x: 710, z: 264, h: 0 };
      this.camX = 790;
    }
    // Parked off the pitch: only 'through' and 'gauntlet' field the extra two defenders (and set their own kits).
    this.defC = { kit: RIVAL_KIT_B, x: -500, z: 244, facing: -1, pose: POSES.stand, h: 0 };
    this.defD = { kit: RIVAL_KIT_B, x: -500, z: 272, facing: -1, pose: POSES.stand, h: 0 };
    if (this.special.scenario === 'gauntlet') gauntletReset(this);
    if (this.special.scenario === 'through') {
      // MERIDIAN THREAD's D3 (near centre-back) and D4 (near-side full-back, the offside line).
      this.defC = { kit: RIVAL_KIT_C, x: LAYOUT.d3.x, z: LAYOUT.d3.z, facing: -1, pose: POSES.stand, h: 0 };
      this.defD = { kit: RIVAL_KIT_D, x: LAYOUT.d4.x, z: LAYOUT.d4.z, facing: -1, pose: POSES.stand, h: 0 };
    }
    this.env.parts.clear();
  }

  /** SPOTLIGHT SOLO's result: BREAKTHROUGH · 1 ON 1 (no goal). */
  showBreakthrough() {
    gauntletResult(this, this.env);
  }

  showResult() {
    if (this.special.result === 'breakthrough') return this.showBreakthrough();
    this.mode = 'result';
    this.t = 0;
    this.score = 1;
    this.timeScale = 1;
    // Carry the goal cheer from the cinematic into the result view.
    this.env.sfx.crowd(3, 0.3);
    const deg = Math.PI / 180;
    const sitA = P({ torso: 50 * deg, thighN: 90 * deg, kneeN: 90 * deg, thighF: 80 * deg, kneeF: 100 * deg, armN: 40 * deg, armF: 30 * deg });
    const sitB = P({ torso: 10 * deg, head: 30 * deg, thighN: 80 * deg, kneeN: 100 * deg, thighF: 70 * deg, kneeF: 110 * deg, armN: 30 * deg });
    if (this.special.scenario === 'through') {
      // No.7 celebrates by the near post, No.10 runs in pointing at him; all four defenders still look at the far side
      // where the ball never went; the keeper is sprawled; the ball sits in the far side of the net.
      const look = (a: Actor, x: number, z: number, facing: 1 | -1, pose: Pose = POSES.lookFar, h = 0): Actor => ({ ...a, x, z, facing, pose, h });
      this.hero = { ...this.hero, x: 1000, z: 272, facing: 1, pose: POSES.stand, h: 0 };
      this.winger = { ...this.winger, x: 1130, z: 318, facing: -1, pose: POSES.celebrate, h: 0 };
      this.defA = look(this.defA, 962, 250, -1);
      this.defB = look(this.defB, 1026, 238, 1);
      this.defC = look(this.defC, 1046, 264, -1);
      this.defD = look(this.defD, 1066, 302, -1, P({ ...POSES.sitWrongWay, armN: 140 * deg, elbowN: 4 * deg, head: -24 * deg }), -9);
      this.keeper = { ...this.keeper, x: 1160, z: 250, facing: -1, pose: P({ ...POSES.gkDive, spin: 1.6 }), h: -4 };
      this.ball = { x: LAYOUT.finish.x, z: LAYOUT.finish.z, h: 0 };
    } else if (this.special.scenario === 'longshot') {
      // The stamps stay in the turf; the ball sits in the far top corner; the keeper lies flat; both defenders are down.
      this.hero = { ...this.hero, x: 906, z: 266, facing: 1, pose: POSES.stand, h: 0 };
      // Seated on the turf: the hip sits ~9 px lower than a standing hip (h < 0), defender 1 knocked onto his back.
      this.defA = { ...this.defA, x: 1030, z: 240, facing: -1, pose: P({ ...sitA, spin: -0.9 }), h: -10 };
      this.defB = { ...this.defB, x: 1066, z: 300, facing: -1, pose: sitB, h: -8 };
      this.keeper = { ...this.keeper, x: 1174, z: 250, facing: -1, pose: P({ ...POSES.gkSwept, spin: -1.45 }), h: -6 };
      this.ball = { x: 1214, z: 226, h: 44 };
    } else if (this.special.scenario === 'cross') {
      // Back to goal: No.10 celebrates facing away from the net he just scored in.
      this.hero = { ...this.hero, x: 1022, z: 266, facing: -1, pose: POSES.celebrate, h: 0 };
      this.winger = { ...this.winger, x: 1086, z: 318, facing: -1, pose: POSES.celebrate, h: 0 };
      this.defA = { ...this.defA, x: 1096, z: 248, facing: 1, pose: sitB };
      this.defB = { ...this.defB, x: 960, z: 300, facing: 1, pose: sitA };
      this.keeper = { ...this.keeper, x: 1150, z: 246, facing: -1, pose: P({ ...POSES.gkDive, spin: 1.6 }), h: -4 };
      this.ball = { x: 1226, z: 262, h: 0 };
    } else {
      this.hero = { ...this.hero, x: 1010, z: 266, facing: 1, pose: POSES.celebrate };
      this.defA = { ...this.defA, x: 930, z: 236, facing: 1, pose: sitA };
      this.defB = { ...this.defB, x: 1100, z: 312, facing: -1, pose: sitB };
      this.keeper = { ...this.keeper, x: 1214, z: 262, facing: -1, pose: P({ ...POSES.gkBlown, spin: -80 * deg }), h: -6 };
      this.ball = { x: 1222, z: 256, h: 0 };
    }
    this.env.parts.clear();
  }

  /** Is the command window waiting for the player? */
  get awaitingInput() {
    return this.mode === 'command' && this.cmdT > 0.35;
  }

  update(dt: number) {
    if (this.special.scenario === 'gauntlet') return gauntletUpdate(this, this.env, dt);
    const sdt = dt * this.timeScale;
    this.t += sdt;
    const { rng, parts } = this.env;
    if ((this.mode === 'intro' || this.mode === 'command') && this.special.scenario === 'cross') {
      this.updateCross(dt, sdt);
    } else if ((this.mode === 'intro' || this.mode === 'command') && this.special.scenario === 'through') {
      this.updateThrough(dt, sdt);
    } else if (this.mode === 'intro' || this.mode === 'command') {
      const h = this.hero;
      const longshot = this.special.scenario === 'longshot';
      if (this.mode === 'intro') {
        h.x += 118 * sdt;
        if (h.x >= (longshot ? LONGSHOT_X : 925)) {
          this.mode = 'command';
          this.cmdT = 0;
          this.env.sfx.blip(660);
        }
      } else {
        this.cmdT += dt;
        this.timeScale = lerp(this.timeScale, 0.06, 1 - Math.exp(-dt * 8));
        h.x += 118 * sdt;
      }
      h.pose = runPose(this.t);
      // Dribble: ball pushed ahead in small touches.
      const ph = (this.t % 0.8) / 0.8;
      this.ball.x = h.x + 12 + Math.sin(ph * Math.PI) * 10;
      this.ball.z = h.z + 2;
      this.ball.h = Math.abs(Math.sin(ph * Math.PI * 2)) * 2;
      // Long shot: the loose ball he collects is still bouncing for its first half second.
      if (longshot && this.t < 0.5) this.ball.h += 9 * Math.abs(Math.cos(this.t * 9)) * (1 - this.t / 0.5);
      this.spin.rotate(0, 0, 1, sdt * 12);
      if (longshot) this.updateScreen(sdt);
      // Defenders close down.
      else for (const d of [this.defA, this.defB]) {
        const tx = h.x + 70, tz = h.z + (d === this.defA ? -18 : 22);
        d.x = lerp(d.x, tx, 1 - Math.exp(-sdt * 0.7));
        d.z = lerp(d.z, tz, 1 - Math.exp(-sdt * 0.9));
        d.x = Math.max(d.x, h.x + (d === this.defA ? 52 : 74)); // close down without overlapping No.10
        d.pose = runPose(this.t + (d === this.defA ? 0.13 : 0.27));
      }
      this.keeper.z = 258 + Math.sin(this.t * 2) * 6;
      this.keeper.pose = POSES.gkReady;
      // Kick-up dust behind the hero
      if (rng.next() < 0.3 * this.timeScale) {
        parts.spawn({
          kind: PK.Smoke, x: h.x - 6, y: h.z, vx: -30, vy: -8, max: 0.5, s0: 2, s1: 7, ramp: 'dust', a0: 0.4, a1: 0, add: false, r0: 0, r1: 1,
        });
      }
      // Spirit aura while the command window is open.
      if (this.mode === 'command' && rng.next() < (longshot ? 0.3 : 0.8)) {
        parts.spawn({
          kind: PK.Glow, x: h.x + rng.range(-10, 10), y: h.z - rng.range(0, 40), vx: 0, vy: rng.range(-60, -20),
          max: 0.5, s0: rng.range(3, 6), s1: 1, ramp: AURA_RAMP[this.special.id], r0: 0.1, r1: 1, a0: 0.9, a1: 0, layer: 0,
        });
      }
      if (this.mode === 'command' && longshot) this.updateAirLoading(dt);
      this.camX = lerp(this.camX, h.x + 80, 1 - Math.exp(-dt * 3));
    } else {
      // result: celebrate bounce (the long shot's studio Celebrate frames only hop a little)
      const studio = this.special.scenario === 'longshot' || this.special.scenario === 'through';
      this.hero.h = studio ? Math.abs(Math.sin(this.t * Math.PI * 2)) * 3 : Math.abs(Math.sin(this.t * 5)) * 8;
      if (this.special.scenario === 'through') this.winger.h = Math.abs(Math.sin(this.t * Math.PI * 2 + 1)) * 3;
      this.camX = lerp(this.camX, 1080, 1 - Math.exp(-dt * 2));
      if (rng.next() < 0.5) {
        parts.spawn({
          kind: PK.Confetti, x: this.camX + rng.range(-320, 320), y: -40, vx: rng.range(-30, 30), vy: rng.range(40, 90), vrot: rng.range(-4, 4),
          max: 4, s0: 4, s1: 4, a0: 1, a1: 1, add: false, color: rng.pick(['#ff3b3b', '#ffd34a', '#3f6fff', '#ffffff']), k: rng.next(), layer: 1,
        });
      }
    }
    parts.update(sdt * (this.mode === 'command' ? 4 : 1));
  }

  /** Cross scenario: No.7 hits the byline and whips the ball high toward No.10. */
  private updateCross(dt: number, sdt: number) {
    const { rng, parts } = this.env;
    const KICK = 0.95, FLIGHT = 1.55;
    const w = this.winger, h = this.hero;
    if (this.t < KICK) {
      w.x = lerp(1080, 1150, this.t / KICK);
      w.pose = this.t > KICK - 0.2 ? POSES.crossKick : runPose(this.t);
      this.ball.x = w.x + 12;
      this.ball.z = w.z + 2;
      this.ball.h = 0;
      this.spin.rotate(0, 0, 1, sdt * 12);
    } else {
      const u = clamp((this.t - KICK) / FLIGHT);
      this.crossU = u;
      w.pose = u < 0.25 ? POSES.crossKick : POSES.stand;
      // High looping arc from the byline to just above No.10's head.
      this.ball.x = lerp(1162, h.x - 4, u);
      this.ball.z = lerp(338, h.z, u);
      this.ball.h = lerp(2, 64, u) + 4 * 175 * u * (1 - u);
      this.spin.rotate(1, 0.3, 0, sdt * 14);
      if (this.mode === 'intro' && u >= 0.64) {
        this.mode = 'command';
        this.cmdT = 0;
        this.env.sfx.blip(660);
      }
    }
    if (this.mode === 'command') {
      this.cmdT += dt;
      this.timeScale = lerp(this.timeScale, 0.06, 1 - Math.exp(-dt * 8));
    }
    // No.10 reads the flight: head tilts up, small adjusting steps under the ball.
    const look = clamp((this.t - KICK) / FLIGHT);
    h.pose = P({ ...POSES.stand, head: -(0.15 + 0.55 * look), torso: -0.05 - 0.1 * look });
    h.x = lerp(1030, 1036, look);
    // The marker tucks in behind him; the other defender drifts toward the ball's landing spot.
    this.defA.x = lerp(this.defA.x, h.x + 30, 1 - Math.exp(-sdt * 1.2));
    this.defA.pose = P({ ...POSES.stand, head: -0.4 * look });
    this.defB.x = lerp(this.defB.x, h.x - 34, 1 - Math.exp(-sdt * 0.8));
    this.defB.pose = this.t < 1.6 ? runPose(this.t + 0.2) : POSES.stand;
    this.keeper.pose = POSES.gkReady;
    this.keeper.z = lerp(258, 268, look);
    if (this.mode === 'command' && rng.next() < 0.8) {
      parts.spawn({
        kind: PK.Glow, x: h.x + rng.range(-10, 10), y: h.z - rng.range(0, 40), vx: 0, vy: rng.range(-60, -20),
        max: 0.5, s0: rng.range(3, 6), s1: 1, ramp: AURA_RAMP[this.special.id], r0: 0.1, r1: 1, a0: 0.9, a1: 0, layer: 0,
      });
    }
    this.camX = lerp(this.camX, lerp(1080, h.x + 20, look), 1 - Math.exp(-dt * 3));
  }

  /**
   * Through ball (MERIDIAN THREAD): No.10 carries at 118 px/s from LAYOUT.no10Start with the usual small touches; D1
   * steps out to press him at 0.8 s; D2-D4 hold a flat line and side-step to mirror him; the keeper rocks on his line;
   * No.7 jogs up the near touchline at 100 px/s and bends his run inside from 0.9 s, onside behind D4 at the trigger.
   * The command window opens at x 900 (~1.2 s) with the stitch preview (three eye plucks).
   */
  private updateThrough(dt: number, sdt: number) {
    const { rng, parts, sfx } = this.env;
    const h = this.hero, L = LAYOUT;
    if (this.mode === 'intro') {
      h.x += 118 * sdt;
      if (h.x >= THROUGH_X) {
        this.mode = 'command';
        this.cmdT = 0;
        sfx.blip(660);
      }
    } else {
      this.cmdT += dt;
      this.timeScale = lerp(this.timeScale, 0.06, 1 - Math.exp(-dt * 8));
      h.x += 118 * sdt;
      // The stitch preview: each eye marker plucks as it lights (E5, F#5, A5 at gain 0.12).
      while (this.eyePlucks < 3 && this.cmdT >= EYE_PLUCKS[this.eyePlucks]) {
        sfx.pluck([THREAD_NOTES.E5, THREAD_NOTES.Fs5, THREAD_NOTES.A5][this.eyePlucks], 0.9, 0.12);
        this.eyePlucks++;
      }
    }
    h.pose = runPose(this.t);
    const ph = (this.t % 0.8) / 0.8;
    this.ball.x = h.x + 12 + Math.sin(ph * Math.PI) * 10;
    this.ball.z = h.z + 2;
    this.ball.h = Math.abs(Math.sin(ph * Math.PI * 2)) * 2;
    this.spin.rotate(0, 0, 1, sdt * 12);
    // D1 presses from 0.8 s; the other three hold the line and shuffle to mirror him.
    const d1 = this.defA;
    const out = ease.inOutQuad(clamp((this.t - 0.8) / 0.55));
    d1.x = Math.max(lerp(L.d1.x, L.d1Out.x, out), h.x + 40);
    d1.z = lerp(L.d1.z, L.d1Out.z, out);
    const deg = Math.PI / 180;
    const set = (k: number) => P({ ...POSES.stand, torso: 12 * deg, kneeN: (22 + 6 * k) * deg, kneeF: (26 - 6 * k) * deg, thighN: (10 + 4 * k) * deg });
    d1.pose = out > 0 && out < 1 ? runPose(this.t + 0.13) : set(Math.sin(this.t * 9));
    const line: [Actor, XZ, number][] = [[this.defB, L.d2, 0.27], [this.defC, L.d3, 0.51], [this.defD, L.d4, 0.77]];
    for (const [d, home, phs] of line) {
      d.x = home.x;
      d.z = home.z + (h.z - L.no10Start.z) * 0.5 + Math.sin(this.t * 4 + phs * 6) * 1.5;
      d.pose = set(Math.sin(this.t * 8 + phs * 9));
    }
    this.keeper.z = L.keeper.z + Math.sin(this.t * 2) * 6;
    this.keeper.pose = POSES.gkReady;
    // No.7: jog, then bend the run inside (onside behind D4).
    const w = this.winger;
    w.x += 100 * sdt;
    w.z = lerp(L.no7Start.z, L.no7Strike.z, ease.inOutQuad(clamp((this.t - 0.9) / 0.35)));
    w.pose = runPose(this.t + 0.2);
    if (rng.next() < 0.3 * this.timeScale) {
      parts.spawn({
        kind: PK.Smoke, x: h.x - 6, y: h.z, vx: -30, vy: -8, max: 0.5, s0: 2, s1: 7, ramp: 'dust', a0: 0.4, a1: 0, add: false, r0: 0, r1: 1,
      });
    }
    if (this.mode === 'command' && rng.next() < 0.6) {
      parts.spawn({
        kind: PK.Glow, x: h.x + rng.range(-10, 10), y: h.z - rng.range(0, 40), vx: 0, vy: rng.range(-60, -20),
        max: 0.5, s0: rng.range(3, 6), s1: 1, ramp: AURA_RAMP[this.special.id], r0: 0.1, r1: 1, a0: 0.9, a1: 0, layer: 0,
      });
    }
    this.camX = lerp(this.camX, h.x + 80, 1 - Math.exp(-dt * 3));
  }

  /** Through ball, command window (world space, on the turf under the players): the stitch preview along PATH. */
  private drawThroughTurf(time: number) {
    if (this.mode !== 'command') return;
    const ctx = this.env.ctx;
    const grow = ease.outCubic(clamp(this.cmdT / 0.6));
    const pts = [{ x: this.ball.x, y: this.ball.z }, ...PATH.points(0.04, Math.max(0.05, grow), 4).map((q) => ({ x: q.x, y: q.z }))];
    threadLine(ctx, pts, 1.2, 0.95 * clamp(this.cmdT / 0.15), { stitch: { dash: 6, dip: 3, phase: -time * 8 }, halo: 0.7 });
    PATH.eyes.forEach((u, i) => {
      const e = PATH.at(u), d = PATH.dir(u);
      const lit = this.cmdT - EYE_PLUCKS[i];
      if (lit < -0.05) return;
      const beat = 0.75 + 0.25 * Math.sin(time * 6 - i * 1.4);
      needleEye(ctx, e.x, e.z, 11, clamp(lit / 0.12) * beat, Math.atan2(d.z, d.x), 0.9, 0.55);
    });
    if (grow > 0.98) crossStitch(ctx, LAYOUT.target.x, LAYOUT.target.z, 4.5 * (1 + 0.18 * Math.sin(time * 9)), 1, 0.55);
  }

  /** Through ball, command window: the tiny almond eye glyph above No.10, looking off to the far side (up-screen). */
  private drawLookGlyph(time: number) {
    if (this.mode !== 'command') return;
    const ctx = this.env.ctx;
    const h = this.hero;
    const x = h.x - 1, y = h.z - h.h - 50;
    const blink = Math.sin(time * 2.6) > 0.93 ? 0.15 : 1;
    const a = clamp(this.cmdT / 0.25);
    needleEye(ctx, x, y, 12, blink, 0, a, 1, { fill: 0 });
    if (blink > 0.5) {
      ctx.globalAlpha = a;
      ctx.fillStyle = MT.ink;
      ctx.fillRect(x - 3, y - 2, 2, 2);
      ctx.fillStyle = MT.pearl;
      ctx.fillRect(x - 3, y - 2, 1, 1);
      ctx.globalAlpha = 1;
    }
  }

  /** Through ball: No.7 from his studio Run cache (puppet stand-in until exported); Celebrate in the result view. */
  private drawWinger(a: Actor) {
    const env = this.env;
    drawShadow(env.ctx, a.x, a.z, 11, 0.35);
    if (this.mode === 'result') {
      const key: No7Key = no7Final('Celebrate.C1') ? (Math.floor(this.t / 0.25) % 2 ? 'Celebrate.C2' : 'Celebrate.C1') : 'Point.Q2';
      drawNo7Boxed(env, key, a.x, a.z - a.h, RESULT_SCALE, { flip: a.facing < 0 });
      return;
    }
    const key = NO7_RUN[Math.floor(this.t / 0.07) % 8];
    const f = no7(key);
    // Like the Dribble strip, the Run strip is drawn in place on one registration: a fixed pivot, the actor's x carries him.
    const pivot: [number, number] | undefined = f ? [f.a.anchorOf(no7('Run.R1')?.i ?? f.i, 'contact')[0], 103] : undefined;
    drawNo7Boxed(env, key, a.x, a.z - a.h, FIELD_SCALE, pivot ? { pivot } : {});
  }

  /** Through ball result: No.10 runs in pointing (Celebrate C1/C2; until drawn, Point P3a full-body). Never the puppet. */
  private drawThroughHero(a: Actor) {
    if (this.mode !== 'result') return this.drawHeroStudio(a);
    const env = this.env;
    drawShadow(env.ctx, a.x, a.z, 11, 0.35);
    const key: No10Key = no10Final('C1') ? (Math.floor(this.t / 0.25) % 2 ? 'C2' : 'C1') : 'P3a';
    drawNo10Boxed(env, key, a.x, a.z - a.h, RESULT_SCALE, { anchor: 'contact' });
  }

  /**
   * Long shot: the two white defenders do not close him down. They drop back to the edge of the box
   * (x ~1012 / ~1022), facing -1, backpedalling with the run poses played backward, then side-step to
   * mirror his z: a screen that blocks the lane.
   */
  private updateScreen(sdt: number) {
    const h = this.hero;
    const spots: [Actor, number, number, number][] = [[this.defA, 1012, -22, 0.13], [this.defB, 1022, 26, 0.27]];
    for (const [d, tx, dz, ph] of spots) {
      const x0 = d.x;
      d.x = lerp(d.x, tx, 1 - Math.exp(-sdt * 1.4));
      d.z = lerp(d.z, h.z + dz, 1 - Math.exp(-sdt * 2.2));
      const speed = sdt > 0 ? Math.abs(d.x - x0) / sdt : 0;
      // Backpedal: the run cycle played backward while still dropping; then a set, side-shuffling stance.
      d.pose = speed > 10 ? runPose(0.4 - ((this.t * 0.9 + ph) % 0.4)) : P({ ...POSES.stand, torso: 12 * (Math.PI / 180), kneeN: 24 * (Math.PI / 180), kneeF: 24 * (Math.PI / 180), thighN: 12 * (Math.PI / 180) });
    }
  }

  /**
   * Long shot command window: the soft looping inhale (gain 0.1, 1.2 s, in time with the ghost stamps
   * breathing) and dew motes drifting toward his boot (instead of rising aura motes).
   */
  private updateAirLoading(dt: number) {
    const { rng, parts, sfx } = this.env;
    const k = Math.floor(this.cmdT / 1.2);
    if (k !== this.inhaleLoop) {
      this.inhaleLoop = k;
      sfx.inhale(1.2, 0.1);
    }
    const [bx, by] = this.bootPoint();
    if (rng.next() < 0.7) {
      const th = rng.range(0, Math.PI * 2), r = rng.range(14, 34);
      const x = bx + Math.cos(th) * r, y = by + Math.sin(th) * r * 0.6;
      const T = rng.range(0.35, 0.6);
      parts.spawn({
        kind: PK.Glow, x, y, ax: (2 * (bx - x)) / (T * T), ay: (2 * (by - y)) / (T * T), max: T,
        s0: rng.range(1.2, 2), s1: 0.6, ramp: 'dew', r0: 0.1, r1: 0.5, a0: 0.9, a1: 0.3, layer: 1,
      });
    }
    void dt;
  }

  /** World point of No.10's boot in the field view (the pressure-lens centre while the command window is open). */
  private bootPoint(): [number, number] {
    return [this.hero.x + 4, this.hero.z - this.hero.h - 3];
  }

  /** Long shot: No.10 from the studio caches (Dribble while running, Celebrate in the result view). */
  private drawHeroStudio(a: Actor) {
    const env = this.env;
    drawShadow(env.ctx, a.x, a.z, 11, 0.35);
    if (this.mode === 'result') {
      const key: No10Key = Math.floor(this.t / 0.25) % 2 ? 'C2' : 'C1';
      drawNo10Boxed(env, key, a.x, a.z - a.h, RESULT_SCALE, { anchor: 'contact' });
      return;
    }
    const key = DRIBBLE[Math.floor((this.t % 0.8) / 0.1) % 8];
    // The Dribble strip is drawn in place on one registration (the idle boot spot on the ground row), so it sits
    // on a fixed pivot and the actor's x carries him; the Jump-strip stand-in sits on its contact toe.
    const f = no10(key);
    const pivot: [number, number] | undefined = f ? [f.a.anchorOf(0, 'contact')[0], 103] : undefined;
    drawNo10Boxed(env, key, a.x, a.z - a.h, FIELD_SCALE, pivot ? { pivot } : { anchor: 'contact' });
  }

  private drawActor(a: Actor) {
    const ctx = this.env.ctx;
    if (a === this.hero && this.special.scenario === 'longshot') return this.drawHeroStudio(a);
    if (a === this.hero && this.special.scenario === 'through') return this.drawThroughHero(a);
    if (a === this.winger && this.special.scenario === 'through') return this.drawWinger(a);
    drawShadow(ctx, a.x, a.z, 11, 0.35);
    const r = renderPuppet(a.kit, a.pose, { k: K, facing: a.facing });
    // feet at z - h; hip ~ 40 units above feet
    drawPuppet(ctx, r, a.x, a.z - a.h - 40 * K, 1);
  }

  render(time: number) {
    if (this.special.scenario === 'gauntlet') return gauntletRender(this, this.env, time, (t) => this.drawScoreboard(t));
    const env = this.env;
    const { ctx, cam, fx } = env;
    const zoom = this.mode === 'result' ? 1.15 : 1.3;
    // The through ball tilts the camera down a little so the stitch preview's X, No.7's run and the result's
    // celebrations sit above the command panel / banner (every other scenario keeps y 214).
    const camY =
      this.special.scenario !== 'through' ? 214 : this.mode === 'command' ? lerp(214, 256, ease.outCubic(clamp(this.cmdT / 0.4))) : this.mode === 'result' ? 236 : 214;
    cam.reset(); // clear any shake left over from the cinematic
    cam.set(this.camX, camY, zoom, 0);
    env.world();
    drawFieldBackdrop(ctx, env.art.stadium, this.camX, camY, time);
    const longshot = this.special.scenario === 'longshot';
    if (longshot) this.drawLongshotTurf(time);
    const through = this.special.scenario === 'through';
    if (through) this.drawThroughTurf(time);
    drawGoal(ctx, 'back', this.mode === 'result' ? 0.15 : 0);

    // Depth-sorted actors + ball.
    const items: { z: number; draw: () => void }[] = [];
    const cast = [this.hero, this.defA, this.defB, this.keeper];
    if (this.special.scenario === 'cross' || through) cast.push(this.winger);
    if (through) cast.push(this.defC, this.defD); // ('gauntlet' draws its own wall of four in gauntlet.ts)
    for (const a of cast) items.push({ z: a.z, draw: () => this.drawActor(a) });
    items.push({
      z: this.ball.z + 0.5,
      draw: () => {
        const air = clamp(this.ball.h / 160);
        drawShadow(ctx, this.ball.x, this.ball.z, 4 - air * 1.5, 0.4 - air * 0.25);
        const pal = this.special.id === 'crescent' ? 'crimson' : this.special.id === 'gale' ? 'cobalt' : this.special.id === 'meridian' ? 'pearl' : 'fire';
        const by = this.ball.z - 3 - this.ball.h;
        if (air > 0.05) {
          // A ball in the air reads poorly against the crowd: halo it and mark where it will drop.
          ctx.globalCompositeOperation = 'lighter';
          drawGlow(ctx, glowSprite(pal === 'crimson' ? 'crimson' : pal === 'cobalt' ? 'cobalt' : 'fire', 0.5), this.ball.x, by, 14, 0.5);
          ctx.globalCompositeOperation = 'source-over';
          if (this.special.scenario === 'cross') {
            const pulseR = 7 + Math.sin(time * 8) * 1.5;
            ctx.strokeStyle = 'rgba(255,120,140,0.8)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(this.hero.x - 4, this.hero.z, pulseR * 1.6, pulseR * 0.45, 0, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        drawBall(env, this.spin, this.ball.x, by, air > 0.1 ? 4 : 3, 1, 0, this.mode === 'command' ? 0.7 : air > 0.05 ? 0.3 : 0, pal);
      },
    });
    items.sort((a, b) => a.z - b.z);
    env.parts.draw(ctx, 0);
    for (const it of items) it.draw();
    drawGoal(ctx, 'front');
    if (through) this.drawLookGlyph(time);
    env.parts.draw(ctx, 1);

    // Screen-space HUD.
    env.screen();
    this.drawScoreboard(time);
    if (this.mode === 'command') this.drawCommand(time);
    if (this.mode === 'result') this.drawResult(time);
    if (this.mode === 'intro') {
      const a = clamp(this.t / 0.4) * clamp((2.0 - this.t) / 0.4);
      if (a > 0) {
        ctx.globalAlpha = a;
        const caption =
          this.special.scenario === 'cross'
            ? 'No.7 HITS THE BYLINE AND WHIPS IN A HIGH CROSS'
            : this.special.scenario === 'longshot'
              ? 'No.10 RUNS AT A PACKED DEFENCE · 30 M OUT'
              : this.special.scenario === 'through'
                ? 'No.10 LOOKS UP · No.7 BENDS HIS RUN'
                : 'No.10 BREAKS THROUGH THE MIDFIELD';
        pixelText(ctx, caption, VW / 2, 48, 12, '#ffe7b0', 'center');
        ctx.globalAlpha = 1;
      }
    }

    fx.bloom = 0.7;
    fx.vignette = 0.4;
    fx.sat = this.mode === 'command' ? lerp(1, 0.75, clamp(this.cmdT * 3)) : 1;
    if (this.mode === 'command') fx.tint = longshot ? [236, 244, 255] : through ? [246, 248, 240] : [255, 238, 232];
    if (this.mode === 'command' && longshot) {
      // Air loading: a faint pressure-lens pinch on his boot.
      const [u, v] = cam.toUV(...this.bootPoint());
      fx.lens = -0.06 * clamp(this.cmdT * 3);
      fx.lensX = u;
      fx.lensY = v;
      fx.lensR = 0.06;
    }
    // Both specials end by fading to near-black; fade the result view up from that same dark.
    if (this.mode === 'result' && this.t < 0.4) {
      fx.flash = 1 - ease.outQuad(clamp(this.t / 0.4));
      fx.flashColor = [8, 4, 14];
    }
  }

  private drawScoreboard(time: number) {
    const ctx = this.env.ctx;
    ctx.fillStyle = 'rgba(8,6,20,0.85)';
    ctx.fillRect(14, 12, 184, 24);
    ctx.fillStyle = '#c8202a';
    ctx.fillRect(14, 12, 6, 24);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(192, 12, 6, 24);
    pixelText(ctx, `CAM ${this.score} - 0 RIV`, 28, 17, 12, '#ffffff');
    const min = 87, sec = Math.floor(14 + (this.mode === 'result' ? 20 : this.t * 2)) % 60;
    pixelText(ctx, `${min}:${String(sec).padStart(2, '0')}`, 152, 17, 12, '#fcb94c');
    void time;
  }

  private drawCommand(time: number) {
    const ctx = this.env.ctx;
    const hero = this.env.art.hero;
    const k = ease.outBack(clamp(this.cmdT / 0.3));
    const y0 = lerp(VH + 10, 248, k);
    ctx.save();
    ctx.translate(0, y0 - 248);
    // Panel
    ctx.fillStyle = '#180411';
    ctx.fillRect(16, 246, VW - 32, 102);
    ctx.fillStyle = '#fcb94c';
    ctx.fillRect(18, 248, VW - 36, 98);
    ctx.fillStyle = '#0d0b22';
    ctx.fillRect(21, 251, VW - 42, 92);
    // Portrait
    ctx.fillStyle = '#8d1a16';
    ctx.fillRect(28, 258, 78, 78);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(hero.img, 24, 0, 52, 52, 28, 258, 78, 78);
    ctx.strokeStyle = '#fcb94c';
    ctx.lineWidth = 2;
    ctx.strokeRect(28, 258, 78, 78);
    pixelText(ctx, 'No.10', 34, 322, 10, '#ffffff');
    // Spirit gauge
    pixelText(ctx, 'SPIRIT', 118, 258, 10, '#9fb4ff');
    ctx.fillStyle = '#180411';
    ctx.fillRect(170, 259, 160, 10);
    const fl = 0.75 + 0.25 * Math.sin(time * 12);
    const gale = this.special.id === 'gale';
    const meridian = this.special.id === 'meridian';
    const gg = ctx.createLinearGradient(170, 0, 330, 0);
    gg.addColorStop(0, gale ? '#2D52E0' : meridian ? '#0B8F58' : '#c8202a');
    gg.addColorStop(1, gale ? '#46D8FF' : meridian ? '#2FE08A' : '#ffd34a');
    ctx.fillStyle = gg;
    ctx.globalAlpha = fl;
    ctx.fillRect(171, 260, 158, 8);
    ctx.globalAlpha = 1;
    pixelText(ctx, '100', 338, 258, 10, gale ? '#46D8FF' : meridian ? '#2FE08A' : '#ffd34a');
    // Commands
    const blink = Math.sin(time * 10) > 0;
    ctx.fillStyle = 'rgba(200,32,42,0.35)';
    ctx.fillRect(116, 276, 330, 24);
    pixelText(ctx, blink ? '>' : ' ', 122, 281, 14, '#ffd34a');
    ctx.save();
    ctx.font = `20px ${TITLE_FONT}`;
    ctx.fillStyle = '#ffe9a8';
    ctx.textBaseline = 'top';
    ctx.fillText(this.special.name, 140, 277);
    ctx.restore();
    pixelText(ctx, `SP ${this.special.cost}`, 400, 282, 10, '#ff8a6a');
    if (this.special.scenario === 'longshot') {
      // The 30 M readout beside the highlighted row.
      ctx.fillStyle = 'rgba(10,18,56,0.9)';
      ctx.fillRect(330, 279, 52, 17);
      ctx.strokeStyle = '#46D8FF';
      ctx.lineWidth = 1;
      ctx.strokeRect(330.5, 279.5, 51, 16);
      pixelText(ctx, '30 M', 356, 282, 10, '#46D8FF', 'center', '#0A1238');
    }
    const dim =
      this.special.scenario === 'cross' ? ['HEADER', 'VOLLEY', 'TRAP'] : this.special.scenario === 'through' ? ['SHOOT', 'SHORT PASS', 'DRIBBLE'] : ['SHOOT', 'PASS', 'DRIBBLE'];
    dim.forEach((s, i) => pixelText(ctx, s, 140 + i * 90, 312, 10, '#5d5a80'));
    pixelText(ctx, 'NEXT STAGE', 140, 327, 8, '#3f3c60');
    // Prompt
    if (this.awaitingInput) {
      const a = 0.55 + 0.45 * Math.sin(time * 6);
      ctx.globalAlpha = a;
      ctx.fillStyle = '#c8202a';
      ctx.fillRect(462, 276, 150, 50);
      ctx.globalAlpha = 1;
      pixelText(ctx, 'SPACE / TAP', 537, 284, 10, '#ffffff', 'center');
      pixelText(ctx, 'UNLEASH', 537, 302, 14, '#ffd34a', 'center');
    }
    ctx.restore();
    // Spotlight glow around the hero portrait edge
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowSprite(gale ? 'cobalt' : meridian ? 'jade' : 'aura', 0.4), 67, y0 + 49, 60, 0.25 * fl);
    ctx.globalCompositeOperation = 'source-over';
  }

  /**
   * Long shot turf (world space, under the players): the ghost stamps breathing together while the command window
   * is open, and the three stamp decals left in the turf in the result view. No line ever joins them.
   */
  private drawLongshotTurf(time: number) {
    const ctx = this.env.ctx;
    if (this.mode === 'command') {
      // Scale 0.92 -> 1.0 over each 1.2 s inhale, easing back in the last 0.2 s (the loop's hard cut).
      const ph = (this.cmdT % 1.2) / 1.2;
      const sc = ph < 5 / 6 ? 0.92 + 0.08 * ease.inOutQuad(ph * 1.2) : 1 - 0.08 * ease.inOutQuad((ph - 5 / 6) * 6);
      const a = clamp(this.cmdT / 0.4);
      for (const s of STAMPS) ghostStamp(ctx, s.x, s.z, s.id === 3 ? 20 : 13, sc, a);
    } else if (this.mode === 'result') {
      for (const s of STAMPS) drawStamp(ctx, s.x, s.z, s.id === 3 ? 20 : 13, 1, { squash: 0.3, alpha: 0.85, mist: 0.6, time });
    }
  }

  private drawResult(time: number) {
    const ctx = this.env.ctx;
    const a = clamp(this.t / 0.5);
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(8,6,20,0.8)';
    ctx.fillRect(0, 282, VW, 60);
    ctx.fillStyle = '#c8202a';
    ctx.fillRect(0, 282, VW, 3);
    ctx.save();
    ctx.font = `30px ${TITLE_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#ffe9a8';
    ctx.fillText(`GOAL  ·  ${this.special.name}`, VW / 2, 286);
    ctx.restore();
    const through = this.special.scenario === 'through';
    if (through) pixelText(ctx, 'No.7 SCORES · ASSIST No.10', VW / 2, 318, 10, '#2FE08A', 'center');
    const blink = 0.6 + 0.4 * Math.sin(time * 5);
    ctx.globalAlpha = a * blink;
    pixelText(ctx, 'R  REPLAY SPECIAL      SPACE  PLAY FROM KICK-OFF', VW / 2, through ? 331 : 324, 10, '#ffffff', 'center');
    ctx.globalAlpha = 1;
    void PIXEL_FONT;
  }
}

export { FIELD };
