// Field view: the situation that sets up each special (a dribble for ZENITH METEOR, a high
// cross for CRIMSON CRESCENT), the slowed-down command window, and the aftermath.

import type { Env } from '../cinematic/timeline';
import { VW, VH } from '../engine/camera';
import { clamp, ease, lerp } from '../engine/math';
import { BallSpin } from '../engine/pixel';
import { PK, drawGlow, glowSprite } from '../engine/particles';
import { FIELD, drawFieldBackdrop, drawGoal, drawShadow } from '../art/stadium';
import {
  HERO_KIT, KEEPER_KIT, RIVAL_KIT, RIVAL_KIT_B, WINGER_KIT, POSES, P, drawPuppet, poseAt, renderPuppet, type Kit, type Pose,
} from '../art/puppet';
import { PIXEL_FONT, TITLE_FONT, pixelText } from '../art/fx';
import { drawBall } from '../cinematic/kit';
import type { SpecialDef } from '../cinematic/specials';

const K = 0.42;
const RUN: [number, Pose][] = [
  [0, POSES.run1], [0.1, POSES.run2], [0.2, POSES.run3], [0.3, POSES.run4], [0.4, POSES.run1],
];
const runPose = (t: number) => poseAt(RUN, t % 0.4, (x) => x);

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

  constructor(private env: Env, public special: SpecialDef) {
    this.reset();
  }

  setSpecial(def: SpecialDef) {
    this.special = def;
    this.reset();
  }

  reset() {
    this.mode = 'intro';
    this.t = 0;
    this.cmdT = 0;
    this.timeScale = 1;
    this.crossU = 0;
    this.keeper = { kit: KEEPER_KIT, x: 1168, z: 258, facing: -1, pose: POSES.gkReady, h: 0 };
    if (this.special.scenario === 'cross') {
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
    this.env.parts.clear();
  }

  showResult() {
    this.mode = 'result';
    this.t = 0;
    this.score = 1;
    this.timeScale = 1;
    // Carry the goal cheer from the cinematic into the result view.
    this.env.sfx.crowd(3, 0.3);
    const deg = Math.PI / 180;
    const sitA = P({ torso: 50 * deg, thighN: 90 * deg, kneeN: 90 * deg, thighF: 80 * deg, kneeF: 100 * deg, armN: 40 * deg, armF: 30 * deg });
    const sitB = P({ torso: 10 * deg, head: 30 * deg, thighN: 80 * deg, kneeN: 100 * deg, thighF: 70 * deg, kneeF: 110 * deg, armN: 30 * deg });
    if (this.special.scenario === 'cross') {
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
    const sdt = dt * this.timeScale;
    this.t += sdt;
    const { rng, parts } = this.env;
    if ((this.mode === 'intro' || this.mode === 'command') && this.special.scenario === 'cross') {
      this.updateCross(dt, sdt);
    } else if (this.mode === 'intro' || this.mode === 'command') {
      const h = this.hero;
      if (this.mode === 'intro') {
        h.x += 118 * sdt;
        if (h.x >= 925) {
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
      this.spin.rotate(0, 0, 1, sdt * 12);
      // Defenders close down.
      for (const d of [this.defA, this.defB]) {
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
      if (this.mode === 'command' && rng.next() < 0.8) {
        parts.spawn({
          kind: PK.Glow, x: h.x + rng.range(-10, 10), y: h.z - rng.range(0, 40), vx: 0, vy: rng.range(-60, -20),
          max: 0.5, s0: rng.range(3, 6), s1: 1, ramp: 'aura', r0: 0.1, r1: 1, a0: 0.9, a1: 0, layer: 0,
        });
      }
      this.camX = lerp(this.camX, h.x + 80, 1 - Math.exp(-dt * 3));
    } else {
      // result: celebrate bounce
      this.hero.h = Math.abs(Math.sin(this.t * 5)) * 8;
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
        max: 0.5, s0: rng.range(3, 6), s1: 1, ramp: 'crimson', r0: 0.1, r1: 1, a0: 0.9, a1: 0, layer: 0,
      });
    }
    this.camX = lerp(this.camX, lerp(1080, h.x + 20, look), 1 - Math.exp(-dt * 3));
  }

  private drawActor(a: Actor) {
    const ctx = this.env.ctx;
    drawShadow(ctx, a.x, a.z, 11, 0.35);
    const r = renderPuppet(a.kit, a.pose, { k: K, facing: a.facing });
    // feet at z - h; hip ~ 40 units above feet
    drawPuppet(ctx, r, a.x, a.z - a.h - 40 * K, 1);
  }

  render(time: number) {
    const env = this.env;
    const { ctx, cam, fx } = env;
    const zoom = this.mode === 'result' ? 1.15 : 1.3;
    cam.reset(); // clear any shake left over from the cinematic
    cam.set(this.camX, 214, zoom, 0);
    env.world();
    drawFieldBackdrop(ctx, env.art.stadium, this.camX, 214, time);
    drawGoal(ctx, 'back', this.mode === 'result' ? 0.15 : 0);

    // Depth-sorted actors + ball.
    const items: { z: number; draw: () => void }[] = [];
    const cast = [this.hero, this.defA, this.defB, this.keeper];
    if (this.special.scenario === 'cross') cast.push(this.winger);
    for (const a of cast) items.push({ z: a.z, draw: () => this.drawActor(a) });
    items.push({
      z: this.ball.z + 0.5,
      draw: () => {
        const air = clamp(this.ball.h / 160);
        drawShadow(ctx, this.ball.x, this.ball.z, 4 - air * 1.5, 0.4 - air * 0.25);
        const pal = this.special.id === 'crescent' ? 'crimson' : 'fire';
        const by = this.ball.z - 3 - this.ball.h;
        if (air > 0.05) {
          // A ball in the air reads poorly against the crowd: halo it and mark where it will drop.
          ctx.globalCompositeOperation = 'lighter';
          drawGlow(ctx, glowSprite(pal === 'crimson' ? 'crimson' : 'fire', 0.5), this.ball.x, by, 14, 0.5);
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
        const caption = this.special.scenario === 'cross' ? 'No.7 HITS THE BYLINE AND WHIPS IN A HIGH CROSS' : 'No.10 BREAKS THROUGH THE MIDFIELD';
        pixelText(ctx, caption, VW / 2, 48, 12, '#ffe7b0', 'center');
        ctx.globalAlpha = 1;
      }
    }

    fx.bloom = 0.7;
    fx.vignette = 0.4;
    fx.sat = this.mode === 'command' ? lerp(1, 0.75, clamp(this.cmdT * 3)) : 1;
    if (this.mode === 'command') fx.tint = [255, 238, 232];
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
    const gg = ctx.createLinearGradient(170, 0, 330, 0);
    gg.addColorStop(0, '#c8202a');
    gg.addColorStop(1, '#ffd34a');
    ctx.fillStyle = gg;
    ctx.globalAlpha = fl;
    ctx.fillRect(171, 260, 158, 8);
    ctx.globalAlpha = 1;
    pixelText(ctx, '100', 338, 258, 10, '#ffd34a');
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
    const dim = this.special.scenario === 'cross' ? ['HEADER', 'VOLLEY', 'TRAP'] : ['SHOOT', 'PASS', 'DRIBBLE'];
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
    drawGlow(ctx, glowSprite('aura', 0.4), 67, y0 + 49, 60, 0.25 * fl);
    ctx.globalCompositeOperation = 'source-over';
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
    const blink = 0.6 + 0.4 * Math.sin(time * 5);
    ctx.globalAlpha = a * blink;
    pixelText(ctx, 'R  REPLAY SPECIAL      SPACE  PLAY FROM KICK-OFF', VW / 2, 324, 10, '#ffffff', 'center');
    ctx.globalAlpha = 1;
    void PIXEL_FONT;
  }
}

export { FIELD };
