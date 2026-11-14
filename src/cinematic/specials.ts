// Registry of special shots. Each one is a list of camera cuts plus the field
// situation that triggers it (a dribble for a power shot, a high cross for a bicycle kick).

import type { Shot } from './timeline';
import { zenithMeteor } from './zenith';
import { crimsonCrescent } from './crescent';
import { galeHammer } from './gale';
import { spotlightSolo } from './solo';
import { meridianThread } from './meridian';

export type SpecialId = 'zenith' | 'crescent' | 'gale' | 'solo' | 'meridian';
/**
 * dribble: run at the box (Zenith); cross: a high cross, back to goal (Crescent); longshot: 30 m out at a packed defence
 * (GALE); gauntlet: a wall of four at the box edge (SPOTLIGHT SOLO); through: No.10 looks up, No.7 bends his run behind
 * a back four (MERIDIAN THREAD).
 */
export type Scenario = 'dribble' | 'cross' | 'longshot' | 'gauntlet' | 'through';

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
  /** What the field shows afterwards: 'goal' (default) or 'breakthrough' (a dribble that ends one on one, no goal). */
  result?: 'goal' | 'breakthrough';
}

export const SPECIALS: SpecialDef[] = [
  { id: 'zenith', name: 'ZENITH METEOR', kind: 'Sky volley', scenario: 'dribble', cost: 80, shots: zenithMeteor },
  { id: 'crescent', name: 'CRIMSON CRESCENT', kind: 'Bicycle kick', scenario: 'cross', cost: 90, shots: crimsonCrescent },
  { id: 'gale', name: 'GALE HAMMER', kind: 'Long-range power shot', scenario: 'longshot', cost: 60, shots: galeHammer },
  { id: 'solo', name: 'SPOTLIGHT SOLO', kind: 'Special dribble', scenario: 'gauntlet', cost: 50, result: 'breakthrough', shots: spotlightSolo, wip: true },
  { id: 'meridian', name: 'MERIDIAN THREAD', kind: 'No-look trivela pass', scenario: 'through', cost: 50, shots: meridianThread },
];

/** Specials shown on the review page (work-in-progress ones only with ?all). */
export const visibleSpecials = (showAll: boolean) => SPECIALS.filter((s) => showAll || !s.wip);

export const specialById = (id: SpecialId) => SPECIALS.find((s) => s.id === id)!;
