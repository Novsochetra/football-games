// Registry of special shots. Each one is a list of camera cuts plus the field
// situation that triggers it (a dribble for a power shot, a high cross for a bicycle kick).

import type { Shot } from './timeline';
import { zenithMeteor } from './zenith';
import { crimsonCrescent } from './crescent';
import { spotlightSolo } from './solo';
import { meridianThread } from './meridian';
import { galeHammer2 } from './gale2';
import { meridianThread as meridianThread2 } from './meridian2';
import { spotlightSolo2 } from './solo2';

export type SpecialId = 'zenith' | 'crescent' | 'gale' | 'solo' | 'meridian' | 'gale2' | 'meridian2' | 'solo2';
/**
 * dribble: run at the box (Zenith); cross: a high cross, back to goal (Crescent); longshot: 30 m out at a packed defence
 * (GALE); gauntlet: a wall of four at the box edge (SPOTLIGHT SOLO); through: No.10 looks up, No.7 bends his run behind
 * a back four (MERIDIAN THREAD); longshot2: GALE v2's wall of three and the keeper's dare; through2: MERIDIAN v2's lofted
 * pass (LAYOUT v2: No.10 41 m out, the Tower in the line, No.7 wide and onside); gauntlet2: SPOTLIGHT SOLO v2's wall of
 * four with the Tower and the ENCORE goal.
 */
export type Scenario = 'dribble' | 'cross' | 'longshot' | 'gauntlet' | 'through' | 'longshot2' | 'through2' | 'gauntlet2';

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
  /** Run the set's photosensitivity guard (FlashBudget, cinematic/timeline.ts) on this special's frames (the v2 specials). */
  flashBudget?: boolean;
}

export const SPECIALS: SpecialDef[] = [
  { id: 'zenith', name: 'ZENITH METEOR', kind: 'Sky volley', scenario: 'dribble', cost: 80, shots: zenithMeteor },
  { id: 'crescent', name: 'CRIMSON CRESCENT', kind: 'Bicycle kick', scenario: 'cross', cost: 90, shots: crimsonCrescent },
  // GALE HAMMER (v2, shipped 2026-11-16): longshot2 = the wall of three, the keeper's dare and the shoved goal. The v1 film
  // stays in cinematic/gale/ (no longer registered).
  { id: 'gale', name: 'GALE HAMMER', kind: 'Long-range power shot', scenario: 'longshot2', cost: 75, shots: galeHammer2, flashBudget: true },
  { id: 'solo', name: 'SPOTLIGHT SOLO', kind: 'Special dribble', scenario: 'gauntlet', cost: 50, result: 'breakthrough', shots: spotlightSolo },
  { id: 'meridian', name: 'MERIDIAN THREAD', kind: 'No-look trivela pass', scenario: 'through', cost: 50, shots: meridianThread },
  // MERIDIAN THREAD v2 (in production): through2 = the v2 field scenario (the lofted pass over a line with the Tower).
  { id: 'meridian2', name: 'MERIDIAN THREAD v2', kind: 'No-look lofted pass', scenario: 'through2', cost: 70, shots: meridianThread2, wip: true, flashBudget: true },
  // SPOTLIGHT SOLO v2 (in production): gauntlet2 = the v2 field scenario (the wall of four with the Tower closing into a
  // staggered line, the ENCORE goal result). The owner chose the ENCORE ending (SPEC §8 option B): result 'goal'.
  { id: 'solo2', name: 'SPOTLIGHT SOLO v2', kind: 'Special dribble', scenario: 'gauntlet2', cost: 65, result: 'goal', shots: spotlightSolo2, wip: true, flashBudget: true },
];

/** Specials shown on the review page (work-in-progress ones only with ?all). */
export const visibleSpecials = (showAll: boolean) => SPECIALS.filter((s) => showAll || !s.wip);

export const specialById = (id: SpecialId) => SPECIALS.find((s) => s.id === id)!;
