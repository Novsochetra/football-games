// Registry of special shots. Each one is a list of camera cuts plus the field
// situation that triggers it (a dribble for a power shot, a high cross for a bicycle kick).

import type { Shot } from './timeline';
import { zenithMeteor } from './zenith';
import { crimsonCrescent } from './crescent';

export type SpecialId = 'zenith' | 'crescent';
export type Scenario = 'dribble' | 'cross';

export interface SpecialDef {
  id: SpecialId;
  name: string;
  /** What the move is, in football terms. */
  kind: string;
  scenario: Scenario;
  cost: number;
  shots: Shot[];
}

export const SPECIALS: SpecialDef[] = [
  { id: 'zenith', name: 'ZENITH METEOR', kind: 'Sky volley', scenario: 'dribble', cost: 80, shots: zenithMeteor },
  { id: 'crescent', name: 'CRIMSON CRESCENT', kind: 'Bicycle kick', scenario: 'cross', cost: 90, shots: crimsonCrescent },
];

export const specialById = (id: SpecialId) => SPECIALS.find((s) => s.id === id)!;
