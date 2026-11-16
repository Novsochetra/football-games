// ZENITH METEOR — No.10's special shot.
//
//  1 Cut-in      special-move declaration: eyes close-up + name slam
//  2 Power-up    low-angle aura charge, cracked pitch, eye flash
//  3 Flick-up    scoop the ball straight into the sky (impact frame)
//  4 Ascent      chase the ball up through the clouds; No.10 leaps after it
//  5 Zenith      time stops before the full moon; somersault volley
//  6 Descent     meteor falls on the stadium; defenders blown away
//  7 Keeper      the keeper's gloves burn, he is forced back and blasted
//  8 Net         the net stretches to tearing point — GOAL

import type { Shot } from '../timeline';
import { shotCutIn } from './shot1_cutin';
import { shotCharge } from './shot2_charge';
import { shotFlick } from './shot3_flick';
import { shotAscent } from './shot4_ascent';
import { shotZenith } from './shot5_zenith';
import { shotDescent } from './shot6_descent';
import { shotKeeper } from './shot7_keeper';
import { shotNet } from './shot8_net';

export const zenithMeteor: Shot[] = [shotCutIn, shotCharge, shotFlick, shotAscent, shotZenith, shotDescent, shotKeeper, shotNet];
