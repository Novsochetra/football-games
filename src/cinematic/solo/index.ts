// SPOTLIGHT SOLO — No.10's special dribble (the floodlights die, a follow-spot makes the pitch his stage, his feet
// play a 150 BPM drum solo through four real skills). Shot briefs: SPEC.md in this folder.

import type { Shot } from '../timeline';
import { shotCountIn } from './shot1_countin';
import { shotLights } from './shot2_lights';
import { shotStepOver } from './shot3_stepover';
import { shotSoleLift } from './shot4_sole';
import { shotElastico } from './shot5_elastico';
import { shotNutmeg } from './shot6_nutmeg';
import { shotOnTheMark } from './shot7_mark';

export const spotlightSolo: Shot[] = [shotCountIn, shotLights, shotStepOver, shotSoleLift, shotElastico, shotNutmeg, shotOnTheMark];
