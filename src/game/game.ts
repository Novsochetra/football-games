// Top-level flow: field (dribble + command) -> special-shot cinematic -> result.

import type { Env } from '../cinematic/timeline';
import { Cinematic } from '../cinematic/timeline';
import { Field } from './field';
import { SPECIALS, specialById, type SpecialDef, type SpecialId } from '../cinematic/specials';

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
    this.special = new Cinematic(this.def.name, this.def.shots, env);
    this.prepare();
  }

  /** Warm every shot's caches once, so the first play of a special does not stall on a cut. */
  private prepare() {
    for (const s of this.def.shots) s.prepare?.(this.env);
  }

  /** Switch which special shot is being reviewed; returns to the field for that situation. */
  select(id: SpecialId) {
    this.def = specialById(id);
    this.special = new Cinematic(this.def.name, this.def.shots, this.env);
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
      if (this.field.mode === 'command' && this.field.cmdT > 0.25) {
        this.env.sfx.blip(990);
        this.unleash(0);
      } else if (this.field.mode === 'result') {
        this.kickoff();
      } else if (this.field.mode === 'intro') {
        // Skip ahead to the command window (the long shot opens it at 30 m, x 880).
        this.field.hero.x = Math.max(this.field.hero.x, this.def.scenario === 'longshot' ? 879 : 924);
      }
    }
  }

  update(dt: number) {
    this.time += dt;
    if (this.phase === 'field') {
      this.field.update(dt);
      if (this.autoplay && this.field.mode === 'command' && this.field.cmdT > 1.2) this.unleash(0);
    } else {
      this.special.step(dt);
      if (this.special.done) {
        this.phase = 'field';
        this.field.showResult();
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
