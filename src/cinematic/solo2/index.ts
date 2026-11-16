// SPOTLIGHT SOLO v2 ("Lights Out"): No.10's special dribble past four defenders under a drop beam in a blacked-out
// stadium (SPEC.md). Ten shots, 18.0 s at 1x with the ENCORE ending (the owner's decision on §8: option B, result 'goal'),
// SP 65, field scenario 'gauntlet2'. Registered in specials.ts as id 'solo2' (wip until it ships); the shipped v1 'solo'
// is untouched.

import type { Shot } from '../timeline';
import { shotSpotSlam } from './shot1_slam';
import { shotLightsOut } from './shot2_lightsout';
import { shotStare } from './shot3_stare';
import { shotIgnition } from './shot4_ignition';
import { shotStepOver } from './shot5_stepover';
import { shotOverTheSlide } from './shot6_slide';
import { shotElastico } from './shot7_elastico';
import { shotNutmeg } from './shot8_nutmeg';
import { shotCurtainCall } from './shot9_curtain';
import { shotEncore } from './shot10_encore';

export const spotlightSolo2: Shot[] = [
  shotSpotSlam, shotLightsOut, shotStare, shotIgnition, shotStepOver, shotOverTheSlide, shotElastico, shotNutmeg, shotCurtainCall, shotEncore,
];
