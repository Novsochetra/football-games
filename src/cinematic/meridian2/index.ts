// MERIDIAN THREAD v2: No.10's no-look lofted outside-of-the-boot pass, a 26 m jade arc across the stadium into No.7's
// run, finished with a flying header (SPEC.md). Nine shots, 16.8 s at 1x, SP 70, field scenario 'through2'. Registered
// in specials.ts as id 'meridian2' (wip until it ships); the shipped v1 'meridian' (scenario 'through') is untouched.

import type { Shot } from '../timeline';
import { shotSign } from './shot1_sign';
import { shotLoom } from './shot2_loom';
import { shotLoft } from './shot3_loft';
import { shotRide } from './shot4_ride';
import { shotApex } from './shot5_apex';
import { shotTwang } from './shot6_twang';
import { shotNeedleFall } from './shot7_fall';
import { shotHeader } from './shot8_header';
import { shotHarp } from './shot9_harp';

export const meridianThread: Shot[] = [shotSign, shotLoom, shotLoft, shotRide, shotApex, shotTwang, shotNeedleFall, shotHeader, shotHarp];
