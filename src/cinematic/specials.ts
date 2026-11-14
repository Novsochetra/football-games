// Registry of special shots. Each one is a list of camera cuts plus the field
// situation that triggers it (a dribble for a power shot, a high cross for a bicycle kick).

import type { Shot } from './timeline';
import { zenithMeteor } from './zenith';
import { crimsonCrescent } from './crescent';
import { galeHammer } from './gale';

export type SpecialId = 'zenith' | 'crescent' | 'gale';
/** dribble: run at the box (Zenith); cross: a high cross, back to goal (Crescent); longshot: 30 m out at a packed defence (GALE). */
export type Scenario = 'dribble' | 'cross' | 'longshot';

export interface SpecialDef {
  id: SpecialId;
  name: string;
  /** What the move is, in football terms. */
  kind: string;
  scenario: Scenario;
  cost: number;
  shots: Shot[];
  /** Still in production: hidden from the review page unless it is opened with ?all. */
  wip?: boolean;
}

export const SPECIALS: SpecialDef[] = [
  { id: 'zenith', name: 'ZENITH METEOR', kind: 'Sky volley', scenario: 'dribble', cost: 80, shots: zenithMeteor },
  { id: 'crescent', name: 'CRIMSON CRESCENT', kind: 'Bicycle kick', scenario: 'cross', cost: 90, shots: crimsonCrescent },
  { id: 'gale', name: 'GALE HAMMER', kind: 'Long-range power shot', scenario: 'longshot', cost: 60, shots: galeHammer, wip: true },
];

/** Specials shown on the review page (work-in-progress ones only with ?all). */
export const visibleSpecials = (showAll: boolean) => SPECIALS.filter((s) => showAll || !s.wip);

export const specialById = (id: SpecialId) => SPECIALS.find((s) => s.id === id)!;
