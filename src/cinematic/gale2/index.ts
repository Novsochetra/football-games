// GALE HAMMER v2 ("The Thunder Catches Up"): No.10's 30 m power shot (SPEC.md). Nine shots, 16.7 s at 1x, SP 75,
// field scenario 'longshot2'. Registered in specials.ts as id 'gale' (shipped 2026-11-16, replacing v1); the v1 'gale' film is
// untouched.

import type { Shot } from '../timeline';
import { shotDare } from './shot1_dare';
import { shotGrab } from './shot2_grab';
import { shotEye } from './shot3_eye';
import { shotInhale } from './shot4_inhale';
import { shotHammer } from './shot5_hammer';
import { shotBarrier } from './shot6_barrier';
import { shotDeadStop } from './shot7_deadstop';
import { shotThunder } from './shot8_thunder';
import { shotReturn } from './shot9_return';

export const galeHammer2: Shot[] = [shotDare, shotGrab, shotEye, shotInhale, shotHammer, shotBarrier, shotDeadStop, shotThunder, shotReturn];
