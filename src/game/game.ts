// Top-level flow: field (dribble + command) -> special-shot cinematic -> result.

import type { Env } from '../cinematic/timeline';
import { Cinematic } from '../cinematic/timeline';
import { Field } from './field';
import { SPECIALS, specialById, type SpecialDef, type SpecialId } from '../cinematic/specials';
import { gauntletLaunch, gauntletLaunched, gauntletLaunching } from './gauntlet';
import { gauntlet2Launch, gauntlet2Launched, gauntlet2Launching } from './gauntlet2';

export type Phase = 'field' | 'special';

export class Game {
  phase: Phase = 'field';
  field: Field;
  special: Cinematic;
  def: SpecialDef;
  time = 0;
  /** Auto-confirm the command window (for hands-free review loops). */
  autoplay = false;
  onPhase?: (p: Phase) => void;

  constructor(private env: Env) {
    this.def = SPECIALS[0];
    this.field = new Field(env, this.def);
    this.special = new Cinematic(this.def.name, this.def.shots, env, { flashBudget: this.def.flashBudget });
    this.prepare();
  }

  /** Warm every shot's caches once, so the first play of a special does not stall on a cut. */
  private prepare() {
    for (const s of this.def.shots) s.prepare?.(this.env);
  }

  /** Switch which special shot is being reviewed; returns to the field for that situation. */
  select(id: SpecialId) {
    this.def = specialById(id);
    this.special = new Cinematic(this.def.name, this.def.shots, this.env, { flashBudget: this.def.flashBudget });
    this.prepare();
    this.field.setSpecial(this.def);
    this.kickoff();
  }

  kickoff() {
    this.phase = 'field';
    this.env.sfx.clearBus({ tails: true });
    this.field.reset();
    this.onPhase?.('field');
  }

  /** Fire the special shot from the start of the cinematic. */
  unleash(fromShot = 0) {
    this.env.sfx.unlock();
    this.env.sfx.clearBus({ tails: true });
    this.phase = 'special';
    this.special.start(fromShot);
    this.onPhase?.('special');
  }

  /** Main confirm button (space / tap). */
  confirm() {
    this.env.sfx.unlock();
    if (this.phase === 'field') {
      if (this.def.scenario === 'gauntlet2' && this.field.mode === 'command' && this.field.cmdT > 0.25) {
        // SPOTLIGHT SOLO v2: the same 0.15 s launch bridge; update() unleashes.
        if (!gauntlet2Launching(this.field)) gauntlet2Launch(this.field, this.env);
        return;
      }
      if (this.def.scenario === 'gauntlet' && this.field.mode === 'command' && this.field.cmdT > 0.25) {
        // SPOTLIGHT SOLO: the 0.15 s launch bridge (sticks, the pool snaps tight, every light to black); update() unleashes.
        if (!gauntletLaunching(this.field)) gauntletLaunch(this.field, this.env);
        return;
      }
      if (this.field.mode === 'command' && this.field.cmdT > 0.25) {
        this.env.sfx.blip(990);
        this.unleash(0);
      } else if (this.field.mode === 'result') {
        this.kickoff();
      } else if (this.field.mode === 'intro' && (this.def.scenario === 'gauntlet' || this.def.scenario === 'gauntlet2')) {
        // Skip ahead to just before the command window (it opens at x 860).
        this.field.hero.x = Math.max(this.field.hero.x, 850);
      } else if (this.field.mode === 'intro') {
        // Skip ahead to the command window (the long shot opens it at 30 m, x 880; the through ball at x 900; MERIDIAN v2's
        // lofted pass at x 760).
        this.field.hero.x = Math.max(
          this.field.hero.x,
          this.def.scenario === 'longshot' || this.def.scenario === 'longshot2'
            ? 879
            : this.def.scenario === 'through'
              ? 899
              : this.def.scenario === 'through2'
                ? 759
                : 924,
        );
      }
    }
  }

  update(dt: number) {
    this.time += dt;
    if (this.phase === 'field') {
      this.field.update(dt);
      if (this.autoplay && this.field.mode === 'command' && this.field.cmdT > 1.2) this.unleash(0);
      if (this.phase === 'field' && this.def.scenario === 'gauntlet' && gauntletLaunched(this.field)) this.unleash(0);
      if (this.phase === 'field' && this.def.scenario === 'gauntlet2' && gauntlet2Launched(this.field)) this.unleash(0);
    } else {
      this.special.step(dt);
      if (this.special.done) {
        this.phase = 'field';
        if (this.def.result === 'breakthrough') this.field.showBreakthrough();
        else this.field.showResult();
        this.onPhase?.('field');
      }
    }
  }

  render() {
    this.env.fx.reset();
    if (this.phase === 'field') this.field.render(this.time);
    else this.special.render();
  }
}
