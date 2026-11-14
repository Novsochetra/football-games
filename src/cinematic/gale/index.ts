// GALE HAMMER — No.10's long-range power shot (one tier below ZENITH METEOR). Shot briefs: SPEC.md in this folder.

import type { Shot } from '../timeline';
import { shotCutIn } from './shot1_cutin';
import { shotLoad } from './shot2_load';
import { shotSquash } from './shot3_squash';
import { shotAirSteps } from './shot4_airsteps';
import { shotFront } from './shot5_front';
import { shotFootprints } from './shot6_footprints';

export const galeHammer: Shot[] = [shotCutIn, shotLoad, shotSquash, shotAirSteps, shotFront, shotFootprints];
