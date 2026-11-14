// Shot-based cinematic runner. A special move is a list of shots (camera cuts).
// Each shot owns its state, so any shot can be replayed or scrubbed in isolation:
// seeking re-inits the shot and fast-forwards it at a fixed step (deterministic RNG).

import type { Camera } from '../engine/camera';
import type { FxState } from '../engine/post';
import type { Particles } from '../engine/particles';
import type { Sfx } from '../engine/audio';
import { Rng } from '../engine/math';
import type { HeroArt } from '../art/heroSprite';
import type { Stadium } from '../art/stadium';

export interface Art {
  hero: HeroArt;
  stadium: Stadium;
}

export interface Env {
  ctx: CanvasRenderingContext2D;
  /** Device px per logical px. */
  S: number;
  cam: Camera;
  fx: FxState;
  parts: Particles;
  sfx: Sfx;
  art: Art;
  /** Simulation RNG (deterministic per shot). */
  rng: Rng;
  /** Frame-stable RNG for flickering visuals (same frame => same pattern). */
  frng(salt?: number): Rng;
  /** Screen-space transform (logical px, no camera). */
  screen(): void;
  /** World transform via camera. */
  world(): void;
}

export interface Shot {
  name: string;
  dur: number;
  /** Seed for the shot's RNG. */
  seed: number;
  /** Optional one-time warm-up (build caches) run when the special is selected, so the first play has no hitch at a cut. */
  prepare?(env: Env): void;
  init(env: Env): void;
  /** t = local seconds, dt = simulation step (already time-warped). */
  update(env: Env, t: number, dt: number): void;
  render(env: Env, t: number): void;
  /** Simulation rate at local time t (hit-stop < 1, slow-mo < 1). Default 1. */
  rate?(t: number): number;
  /** Sound/one-shot cues: fired once when local time crosses `at`. */
  cues?: { at: number; fn: (env: Env) => void }[];
}

export const STEP = 1 / 60;

export class Cinematic {
  idx = 0;
  t = 0;
  done = false;
  private frame = 0;
  /** Cues of the current shot that already fired (each cue fires exactly once per shot entry). */
  private fired: boolean[] = [];

  constructor(public readonly title: string, public readonly shots: Shot[], private env: Env) {}

  get total() {
    return this.shots.reduce((a, s) => a + s.dur, 0);
  }

  get shot() {
    return this.shots[this.idx];
  }

  startOf(i: number) {
    let a = 0;
    for (let k = 0; k < i; k++) a += this.shots[k].dur;
    return a;
  }

  get globalTime() {
    return this.startOf(this.idx) + this.t;
  }

  private enter(i: number) {
    const env = this.env;
    this.idx = i;
    this.t = 0;
    this.fired = [];
    env.parts.clear();
    env.cam.reset();
    env.rng = new Rng(this.shots[i].seed);
    this.shots[i].init(env);
  }

  start(i = 0) {
    this.done = false;
    this.enter(i);
  }

  /** Advance by real dt (already multiplied by the QC speed). */
  step(dt: number) {
    if (this.done) return;
    const env = this.env;
    const s = this.shot;
    // At the fixed step, snap to the 1/60 grid so float drift never adds a frame or lands a seek one frame short.
    const t1 = dt === STEP ? (Math.round(this.t / STEP) + 1) * STEP : this.t + dt;
    // Same predicate as the shots' own one-shot flags (t >= at), so sound and picture land on the
    // same step; the fired[] guard stops a cue double-firing when t lands exactly on its time.
    if (s.cues)
      s.cues.forEach((c, k) => {
        if (!this.fired[k] && c.at <= t1) {
          this.fired[k] = true;
          c.fn(env);
        }
      });
    const r = s.rate ? s.rate(t1) : 1;
    this.t = t1;
    this.frame++;
    s.update(env, t1, dt * r);
    env.parts.update(dt * r);
    env.cam.update(dt);
    if (this.t >= s.dur) {
      if (this.idx + 1 < this.shots.length) this.enter(this.idx + 1);
      else this.done = true;
    }
  }

  render() {
    const ctx = this.env.ctx;
    this.env.fx.reset();
    // Every frame starts from the same 2D context state, so a frame never depends on what the
    // previous frame (or the previous shot) left behind (line caps/joins, alpha, composite, font...).
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';
    ctx.lineWidth = 1;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.beginPath();
    this.shot.render(this.env, Math.min(this.t, this.shot.dur));
    ctx.restore();
  }

  /** Jump to a global time: re-init the containing shot and fast-forward silently. */
  seek(gt: number) {
    const env = this.env;
    let i = 0, acc = 0;
    while (i < this.shots.length - 1 && acc + this.shots[i].dur <= gt) acc += this.shots[i++].dur;
    const local = Math.max(0, Math.min(gt - acc, this.shots[i].dur - 1e-4));
    this.done = false;
    this.enter(i);
    env.sfx.silent = true;
    const n = Math.floor(local / STEP + 1e-6);
    for (let k = 0; k < n; k++) this.step(STEP);
    env.sfx.silent = false;
  }
}
