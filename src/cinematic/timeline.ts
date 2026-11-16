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
  /**
   * Master muffle level (0 = open, 1 = fully muffled) at local time t, on the runner's unwarped clock.
   * Applied with sfx.muffle() on every step and right after init, so seek and replay are exact. Default 0.
   */
  muffle?(t: number): number;
}

export const STEP = 1 / 60;

/** A full-frame event counted by the FlashBudget guard. */
export interface FlashEvent {
  /** Global cinematic time (s) of the rising edge. */
  t: number;
  kind: 'flash' | 'impact' | 'iso' | 'fullFrame';
  /** True when the guard clamped it (a 4th event inside one 1 s window). */
  clamped: boolean;
}

/**
 * FlashBudget: the v2 set's single photosensitivity guard (GALE HAMMER v2 §10.1 item 6; MERIDIAN and SOLO import it
 * unchanged). After each rendered frame it records the rising edges of fx.flash >= 0.3, fx.impact >= 0.5,
 * fx.iso >= 0.5 and fx.fullFrame over a rolling 60-frame (1 s) window of the cinematic clock. Runtime: once a window
 * holds LIMIT events, any further event is clamped (flash / impact / iso set to 0 for as long as that signal stays up)
 * until the window clears. Dev builds console.assert the unclamped count. `events` is the list capture tools print.
 * Only specials registered with flashBudget: true run it, so the shipped specials are untouched.
 */
export class FlashBudget {
  static readonly LIMIT = 3;
  static readonly WINDOW = 60;
  static readonly THRESH = { flash: 0.3, impact: 0.5, iso: 0.5 } as const;
  events: FlashEvent[] = [];
  private prev = { flash: false, impact: false, iso: false, fullFrame: false };
  private held = { flash: false, impact: false, iso: false };
  private lastFrame = -1;
  /** The impact / iso stage signature of the last frame: a stage change while the signal stays up is a new event. */
  private sig = { impact: '', iso: '' };
  /** Accepted (unclamped) event frames inside the rolling window. */
  private window: number[] = [];

  reset() {
    this.events = [];
    this.prev = { flash: false, impact: false, iso: false, fullFrame: false };
    this.held = { flash: false, impact: false, iso: false };
    this.lastFrame = -1;
    this.window = [];
    this.sig = { impact: '', iso: '' };
  }

  /** Call after a frame is rendered (before the post pass reads fx). `gt` = global cinematic time. */
  observe(fx: FxState, gt: number) {
    const frame = Math.round(gt / STEP);
    if (frame !== this.lastFrame) {
      if (frame < this.lastFrame || frame > this.lastFrame + 2) {
        // A seek: the history no longer applies.
        this.prev = { flash: false, impact: false, iso: false, fullFrame: false };
        this.held = { flash: false, impact: false, iso: false };
        this.window = [];
        this.events = this.events.filter((e) => Math.round(e.t / STEP) < frame - FlashBudget.WINDOW);
      }
      this.window = this.window.filter((f) => f > frame - FlashBudget.WINDOW);
      const up = {
        flash: fx.flash >= FlashBudget.THRESH.flash,
        impact: fx.impact >= FlashBudget.THRESH.impact,
        iso: fx.iso >= FlashBudget.THRESH.iso,
        fullFrame: fx.fullFrame,
      };
      // A two-stage impact (stage A -> stage B, or GALE's weather map -> negative print) counts as two events.
      const sig = { impact: `${fx.impA}|${fx.impB}|${fx.impThresh}`, iso: `${fx.isoBands}|${fx.isoInvert}|${fx.isoMix}` };
      const restage = { flash: false, impact: up.impact && sig.impact !== this.sig.impact, iso: up.iso && sig.iso !== this.sig.iso, fullFrame: false };
      this.sig = sig;
      for (const kind of ['flash', 'impact', 'iso', 'fullFrame'] as const) {
        if (!up[kind]) {
          if (kind !== 'fullFrame') this.held[kind] = false;
        } else if (!this.prev[kind] || restage[kind]) {
          const clamped = this.window.length >= FlashBudget.LIMIT;
          this.events.push({ t: frame * STEP, kind, clamped });
          if (clamped) {
            if (kind !== 'fullFrame') this.held[kind] = true;
          } else this.window.push(frame);
        }
      }
      if (import.meta.env.DEV) {
        const raw = this.events.filter((e) => Math.round(e.t / STEP) > frame - FlashBudget.WINDOW).length;
        console.assert(raw <= FlashBudget.LIMIT, `FlashBudget: ${raw} full-frame events in 1 s at ${gt.toFixed(2)} s`);
      }
      this.prev = up;
      this.lastFrame = frame;
    }
    if (this.held.flash) fx.flash = 0;
    if (this.held.impact) fx.impact = 0;
    if (this.held.iso) fx.iso = 0;
  }
}

export class Cinematic {
  idx = 0;
  t = 0;
  done = false;
  private frame = 0;
  /** Cues of the current shot that already fired (each cue fires exactly once per shot entry). */
  private fired: boolean[] = [];

  /** The photosensitivity guard (only for specials registered with flashBudget: true). */
  readonly budget: FlashBudget | null;

  constructor(public readonly title: string, public readonly shots: Shot[], private env: Env, o: { flashBudget?: boolean } = {}) {
    this.budget = o.flashBudget ? new FlashBudget() : null;
  }

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
    // Same JS tick as init (which may clearBus()): the new shot's level wins, so a muffle that carries over
    // a cut never opens for a frame.
    env.sfx.muffle(this.shots[i].muffle?.(0) ?? 0);
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
    env.sfx.muffle(s.muffle?.(t1) ?? 0);
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
    this.budget?.observe(this.env.fx, this.globalTime);
  }

  /** Jump to a global time: re-init the containing shot and fast-forward silently. */
  seek(gt: number) {
    const env = this.env;
    let i = 0, acc = 0;
    while (i < this.shots.length - 1 && acc + this.shots[i].dur <= gt) acc += this.shots[i++].dur;
    const local = Math.max(0, Math.min(gt - acc, this.shots[i].dur - 1e-4));
    this.done = false;
    // A jump in time: open the muffle, release ducks and choke every held voice before fast-forwarding.
    env.sfx.clearBus({ tails: true });
    this.enter(i);
    env.sfx.silent = true;
    const n = Math.floor(local / STEP + 1e-6);
    for (let k = 0; k < n; k++) this.step(STEP);
    env.sfx.silent = false;
  }
}
