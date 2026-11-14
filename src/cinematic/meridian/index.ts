// MERIDIAN THREAD — No.10's special pass: a no-look outside-of-the-boot through pass into No.7's stride.
// Shot briefs: SPEC.md in this folder. Engine pieces: ./common.ts (and ENGINE notes in the scratchpad hand-off).
//
//  1 Stitch-in          manga cut-in: the look-off, the boot, the stitched title
//  2 Playmaker's eye    over the shoulder: the read, the ink page, the look-off gag, the stitched route
//  3 Outside of the boot  plant, whip, the ink freeze, the thread unspools, the wink; thread wipe
//  4 Needle's eye       the ball scene as one manga page: three panels, three needle eyes, three notes
//  5 Meridian           crane up: the whole thread across the inked pitch, ball and No.7 meet on the X
//  6 First touch        the thread pulls taut, the colour washes back, No.7 finishes; the diptych

import type { Shot } from '../timeline';
import { shotStitch } from './shot1_stitch';
import { shotEye } from './shot2_eye';
import { shotOutside } from './shot3_outside';
import { shotNeedle } from './shot4_needle';
import { shotMeridian } from './shot5_meridian';
import { shotTouch } from './shot6_touch';

export const meridianThread: Shot[] = [shotStitch, shotEye, shotOutside, shotNeedle, shotMeridian, shotTouch];
