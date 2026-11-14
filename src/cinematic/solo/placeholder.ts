// SPOTLIGHT SOLO placeholder shots: a labelled card on the dark stage plus a working demo of the engine pieces each
// shot uses (frames, afterimages, stage light, beat-snap camera, echo, impact, HUD). Delete this file once all seven
// shots are real.

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { clamp } from '../../engine/math';
import { BallSpin } from '../../engine/pixel';
import { drawGlow, glowOf } from '../../engine/particles';
import { fourCount, pixelText } from '../../art/fx';
import { stage, type StagePool } from '../../art/stage';
import { drawBall } from '../kit';
import { drawSolo, soloPoint, soloView, warmSolo, type SoloKey } from './frames';
import {
  Afterimages, HEX, HUM, PAL, SCALE, SEQ, SHOT_NAME, beatCam, beatOf, globalT, padsFor, soloAt, soloGrade, type CamKey,
} from './common';

type Idx = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface Demo {
  init?(env: Env): void;
  update?(env: Env, t: number, dt: number): void;
  /** Draws the shot's picture (screen or world space); the card and the HUD go on top. */
  render?(env: Env, t: number): void;
}

/**
 * A labelled placeholder shot: the dark stage, the shot's name, clock, beat and bar, the four-count (shots 2-6), plus
 * an optional demo. Init clears the bus (every SOLO shot must); update drives the lamp hum state (seek-exact).
 */
export function placeholderShot(idx: Idx, name: string, dur: number, seed: number, demo?: Demo): Shot {
  return {
    name,
    dur,
    seed,
    prepare(env) {
      // Warm the frame pictures and their ultraviolet exposures (no hitch on the first play).
      warmSolo(env, SEQ[idx].map(([, k]) => k), { ghosts: true });
    },
    init(env) {
      env.sfx.clearBus();
      env.cam.set(VW / 2, VH / 2, 1, 0);
      demo?.init?.(env);
    },
    update(env, t, dt) {
      env.sfx.hum(HUM[idx](t));
      demo?.update?.(env, t, dt);
    },
    render(env, t) {
      env.screen();
      const ctx = env.ctx;
      ctx.fillStyle = HEX.plum;
      ctx.fillRect(0, 0, VW, VH);
      drawGlow(ctx, glowOf(PAL.uvDeep), VW / 2, VH / 2 + 40, 260, 0.7);
      soloGrade(env.fx);
      if (demo?.render) demo.render(env, t);
      env.screen();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(22,10,38,0.78)';
      ctx.fillRect(0, 312, VW, 44);
      pixelText(ctx, `${SHOT_NAME} · SHOT ${idx} · ${name.toUpperCase()}`, VW / 2, 316, 12, HEX.ivory, 'center', HEX.plum);
      const b = beatOf(globalT(idx, t));
      pixelText(
        ctx, `PLACEHOLDER  ${t.toFixed(2)} / ${dur.toFixed(2)}s  ·  beat ${b >= 0 ? b.toFixed(2) : '-'}  ·  bar ${b >= 0 ? 1 + Math.floor(b / 4 + 1e-6) : 0}`,
        VW / 2, 336, 10, HEX.lilac, 'center', HEX.plum,
      );
      if (idx >= 2 && idx <= 6) fourCount(ctx, padsFor(idx), t, { alpha: idx === 2 ? clamp((t - 0.8) / 0.2) : 1 });
    },
  };
}

export interface StageDemo {
  /** Hero feet (screen px) and the light. */
  x: number;
  y: number;
  /** Dim level outside the pool at t. */
  dim: (t: number) => number;
  /** Stage hole (screen ellipse) and floor pool radii. */
  hole: [number, number];
  pool: [number, number];
  /** Where the beam starts (screen px); null = no beam (shot 5's footlights). */
  beamFrom: [number, number] | null;
  /** Beat-snap camera keys (x/y = offsets of the view in screen px, zoom about the hero). */
  cam?: readonly CamKey[];
  /** Beat flare times. */
  flares?: readonly number[];
  /** Hero exposures to drop: [time, life]. */
  ghosts?: readonly (readonly [number, number])[];
  /** Ball radius at scale 1 (the ball is drawn at the frame's ball anchor). */
  ball?: boolean;
  flip?: (t: number) => boolean;
}

/** A small working demo of a stage shot: dim + hole, beam + floor pool, exposures, No.10 from the schedule, ball. */
export function stageDemo(idx: Idx, o: StageDemo): Demo {
  const ghosts = new Afterimages();
  const spin = new BallSpin();
  let next = 0;
  const key = (t: number): SoloKey => soloAt(SEQ[idx], t);
  return {
    init() {
      ghosts.clear();
      next = 0;
    },
    update(env, t) {
      const list = o.ghosts ?? [];
      while (next < list.length && t >= list[next][0] - 1e-6) {
        const [at, life] = list[next++];
        const k = key(at);
        ghosts.dropHero(k, o.x, o.y, SCALE[idx](at), t, life, { flip: o.flip?.(at), anchor: soloView(k) === 'face' ? 'center' : undefined });
      }
      spin.rotate(1, 0, 0, 0.12);
      void env;
    },
    render(env, t) {
      const ctx = env.ctx;
      const cam = o.cam ? beatCam(o.cam, t) : { x: 0, y: 0, zoom: 1 };
      // Screen-space "world": zoom about the hero's feet, then offset.
      const S = env.S;
      const apply = () => ctx.setTransform(S * cam.zoom, 0, 0, S * cam.zoom, S * (o.x - o.x * cam.zoom - cam.x * cam.zoom), S * (o.y - o.y * cam.zoom - cam.y * cam.zoom));
      apply();
      // A plain stage: dark stands and turf.
      ctx.fillStyle = '#20163a';
      ctx.fillRect(-200, -100, VW + 400, 220);
      ctx.fillStyle = '#2b6a37';
      ctx.fillRect(-200, 120, VW + 400, 400);
      const fl = stage.flare(t, o.flares ?? []);
      const [sx, sy] = [(o.x - cam.x - o.x) * cam.zoom + o.x, (o.y - 110 - cam.y - o.y) * cam.zoom + o.y];
      const hole: StagePool = { x: sx, y: sy, rx: o.hole[0] * cam.zoom * fl.size, ry: o.hole[1] * cam.zoom * fl.size, soft: 40, gain: 1 };
      stage.dim(ctx, o.dim(t), [hole]);
      apply();
      if (o.beamFrom) stage.beam(ctx, o.beamFrom[0], o.beamFrom[1], o.x, o.y, 30, o.pool[0] * 2, 0.16, { t, seed: idx });
      stage.floorPool(ctx, o.x, o.y, o.pool[0] * fl.size, o.pool[1] * fl.size, 0.35 * fl.gain);
      ghosts.draw(env, t);
      const k = key(t);
      const sc = SCALE[idx](t);
      const flip = o.flip?.(t) ?? false;
      drawSolo(env, k, o.x, o.y, sc, { flip });
      if (o.ball) {
        const [bx, by] = soloPoint(env, k, 'ball', o.x, o.y, sc, { flip });
        drawBall(env, spin, bx, by, 6 * sc, 1, 0, 0.8, 'blacklight');
      }
      env.screen();
    },
  };
}
