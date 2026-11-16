# SPOTLIGHT SOLO v2: shot spec ("Lights Out")

No.10's special dribble. A wall of four giant defenders stomps toward him in a blazing stadium, and the
whole crowd stomps with them. He does not move. He puts his sole on the ball, raises one arm straight up
and **SNAPS**, and the floodlights blow out bank by bank in a shower of glass. In the black only two things
glow: **the ball at his feet and his eyes**. Now the defenders are the scared ones. A lamp slams on behind
him and throws his shadow 30 m across the wall, up the net and onto the crowd, with two eyes glowing in its
head. Then he goes. Every cut **rips the turf open** and ultraviolet light pours up out of the wound; a
chorus of razor-sharp ultraviolet copies of him stamps the drum; and every defender who challenges him is
wrecked, and **the strobe photographs him in mid-defeat**: a neon print of the moment stays hanging in the
dark in its own spotlight while the real man crashes to the turf beneath it. One print corkscrews in mid-air,
one spins off the turf he peeled up, one hangs in the splits, and the biggest one, who smothered him into
total black, buckles at the knees when the ball **CRACKS** out through his legs and topples over the third.
On the penalty spot No.10 stops the ball dead. Silence. The camera rises over the trail of wreckage. Then he
lifts an open palm to the stands, and the crowd he has won over **stomps on his beat**: **the whole stadium
slams back on**, the four prints shatter into glass and light, the torn route erupts like a fuse racing to
his boot, the keeper is blasted off his feet onto his own goal line, and the crowd roars. **1 ON 1.**

**The playground test** (what a 9-year-old says on the way home): *"Four giants stomped at him and the whole
stadium stomped too, so he went SNAP and all the lights EXPLODED! You could only see his eyes and the ball
glowing! Then his shadow went all the way up to the crowd! Every time he did a skill the grass ripped open
and light came out, and a flash took a glowing photo of the defender falling, one was upside down in the
AIR! The big one jumped on him and it went black, then CRACK, the ball came out through his legs! And at the
end he put his hand up to the crowd, everybody stomped, ALL the lights came back on, the glowing photos
smashed and the keeper got knocked flat on his line!"* Every shot below gives one sentence
of that story.

This brief replaces `docs/skills/SPOTLIGHT_SOLO.md` (v1: 7 shots, 11.0 s, "smaller than every shot") and is
the new `src/cinematic/solo/SPEC.md`. The owner's verdict on v1: *"the spotlight looks so simple, not like a
powerful dribble skill ... make sure all the 3 skills have good cinematic moves and look as powerful and
scary as they can, with good visual effects, cinematic scene, camera move and great ball showcase."* So v2
drops every "smaller" rule of v1 and takes the full power kit, while keeping SOLO's name, its world (stage
light, ultraviolet, the drum solo) and its best v1 ideas. The format follows `src/cinematic/crescent/SPEC.md`,
v1's brief and the sibling `GALE_HAMMER_v2.md`.

## 0. What changed and where it came from

### 0.1 v1 → v2

| | v1 (shipped) | **v2 (this brief)** |
|---|---|---|
| Runtime / shots / SP | 11.0 s / 7 / 50 | **16.4 s / 9 / 65**, one unbroken 150 BPM grid |
| Story | four equal skills, then a freeze and a caption | **a fear reversal**: they stomp, he snaps the stadium dark, then wrecks them one by one; at the end his open palm calls the crowd, whose stomp on his beat slams the stadium back on |
| Peaks | four 0.1-0.2 s hit-stops of the same size | ignition **5.7 s (35 %)**, the cut **7.2 s**, the release **9.6 s (59 %)**, the snap **11.2 s**, the crack **12.8 s**, **the curtain drop 15.2 s (93 %, the loudest moment)**, each bigger than the last |
| World | plum murk (69 % deep shadow, 0.5 % hot pixels) | **blackout with white-hot sources**: the floodlights blown out on screen, a drop beam, a footlight lamp, trophy spots, light pouring out of torn turf; target 50-65 % shadow and **3 %+ hot pixels** |
| Hero monument | none (small figures in the dark) | **The Stare**: 275 px, worm's-eye, a lamp halo behind his head, 14 god rays, underlit by the blazing ball, a chorus of copies stepping out on the drum |
| Ball's energy shape | a plain 24-36 px disc, faint lilac discs | the **blacklight ball at 70-120 px** in eight close-ups; crisp strobe chains (a 9-exposure hurdle arc, a 320 px Elastico V) |
| Contact stack | 2 frames of flat violet impact; one `cam.hit(0.15)` in the film | **11 layers** on every skill: hit-stop 0.03, cam.hit 0.9-1.0, punch, SOLO's own **beam impact** (two stages), 2 flat refraction shocks, a light gash with UV shafts, turfRip, light rain, strobe chain, CA, boom 1.2-1.3 |
| Camera | "holds still and snaps only on the beat" | **the beat-slam camera**: crash zooms to 3.2x, a crane-rush after his shadow, an arc round his body, left-behind + whip-chase, a front dolly, the **glue cam** at turf level, a front ride at turf level ahead of the ball looking back at him, a 22 m constellation crane tilted 46° down, over the keeper's shoulder |
| Opponents | four gentle falls at small scale | **four wrecked in real time**, each photographed by the strobe mid-defeat: his **neon print** (mid-air, mid-spin, mid-split, mid-fall) hangs over his body on the turf, and **the four prints shatter** at the relight; the keeper **blasted off his feet onto his goal line** |
| Sound | toms, hats, OLÉ, booms up to 0.5, no roar | the wall's stomp with the crowd, **the SNAP**, floodlight surges, war drums, the drum solo with arena weight (booms up to **1.4**), turf rips, strobe zaps, four silences, OLÉ 1-4, three roars, **relight + roar 2.0** |
| Ending | freeze, "1 ON 1" at ~40 px | **the curtain drop**, **1 ON 1 at 130 px** over a beaten keeper, a freeze on the Encore pose, name card; a dribble that ends through on goal **only if the SHOOT chain ships built and tested**, otherwise the ENCORE goal is the default (the owner chooses, §8) |

### 0.2 Synthesis

The judges scored the three pitches hero 50, camera 48, power 48, and recommended: **hero as the spine,
power as the VFX vocabulary and payoff, camera for the ball and skill camera moves**. This brief does that.

- **Spine (hero pitch, "Lights Out"):** the fear reversal; the wall stomps first; the copyable **SNAP** that
  kills the stadium; **Eyes in the Dark** (the ball, then two eyes, glowing in total black, seen past D's
  shoulder); the **false defeat** (D smothers him: black, silence, a sliver of light, CRACK); the front ride
  with the 108 px ball rushing at the lens and his boots striking it; the trophy spots and the constellation
  crane; the **conductor's cue** bookend (his open palm to the stands, the crowd's stomp on his beat).
- **VFX vocabulary and payoff (power pitch, "Blackout Showtime"):** the drop beam; floodlight banks blown
  out on screen (cell pops, glass, smoke); the **Chorus** of crisp ultraviolet copies; **light gashes**
  (3-claw stud rips with UV shafts) kept as a route; **strobe prints**; the **sod carpet**; light rain;
  the **curtain drop** (relight wave, the four prints shatter, the **fuse** races to his sole, the keeper
  blasted onto his line, 1 ON 1 at 130 px, roar 2.0); the stomp / rip / strobe-zap / crowd-stomp / relight
  sounds.
- **Ball and camera (camera pitch, "the camera dances with him"):** the low OTS at the lit wall; the
  **30 m long shadow** rushing over the wall with eye-slits in its head; the stare's lamp halo, god rays and
  underlight; the **crash zoom 1.14 → 3.2 onto the ball** under his sole; the **ignition macro** (left behind
  for 3 frames, then a whip-chase); the **glue cam** through the elastico; the **beam impact** (the impact
  shader inside the spot's cone only); flat ground shocks.

**Kept from v1, made bigger:** the name; ultraviolet / ivory / plum and darkness made by light (`stage.dim`,
`sat` 1); the four real skills in the same order with their marquee tags (kids learn the names); the sole lift
over the slide tackle (v1's best shot, now the breath and a money frame); the nutmeg arch (v1's best
composition, now the gate and the false defeat); the stick count-in, the 150 BPM grid, the cymbal choke, the
OLÉ count and the four-count HUD; the blacklight ball, phone lights, fluorescent lines, the follow-spot's
operator lag; `fx.echo`; the `'breakthrough'` result and its SHOOT chain.

**Dropped from v1:** "smaller than every shot"; the soft oval spot panel; "holds still, snaps only on the
beat"; flat full-frame violet impact frames; soft smudge ghosts; the ghost-wipe blob; gentle falls at small
scale; the static ending and its 40 px caption; the one-dimension set rule (see §1.1).

### 0.3 Every weakness the judges named, and its fix

| Pitch | Weakness | Fix in this brief |
|---|---|---|
| camera | shots 5, 7 and 8 depend on an unbuilt yawed `pitch3D` | **no `pitch3D`**: the front dolly, the gate and the front ride use `drawUpPitch` (the reverse direction of the one pitch renderer, with the shared pitch-only tilt), the crane uses `drawDownPitch` with that tilt, the glue cam is faked in screen space (the ball fixed, the turf pattern and stands slide under streak blur) |
| camera | the 205° carousel round a running figure needs ~30 new frames and view swaps under occluders | dropped; the only orbit is a **30° arc round a standing figure with one drawn view** (shot 3); the only view change inside a shot is one hard cut to one drawn front frame (shot 6) and one sprite swap hidden in a crash zoom's blur (shot 3) |
| camera | `castShadow` onto vertical planes and a step-print shutter are new | `longShadow` is a screen-space strip with clip bands that climb each defender (no 3D projection; fallback: ground only); step-print is a shot-level snapshot (`StepPrint`) used for 0.4 s in shot 4, no runner change |
| camera | the softest payoff: staircase relight at flash 0.45, a dolly zoom that overlaps MERIDIAN, a freeze with no roar, no single biggest beat | the payoff is power's **curtain drop**: relight 1.4 + stomp 1.4 + boom 1.4 + crack 1.2 + **roar 2.0**, flash 0.6, the beat pulse, the four prints shatter, the keeper blasted onto his line, the fuse, 1 ON 1 at 130 px; **no dolly zoom anywhere**; the freeze comes after the roar |
| power | the 150° bullet-time orbit round the frozen ball collides with GALE v2 | dropped: the frozen breath is a **parallax slide** plus **one hard cut** to a drawn front view (the 96 px ball-in-beam money frame); GALE keeps the only orbit round a ball |
| power | 31 engine pieces (Sobel neon, echo upgrade, streak variants, tape-stop, statues with per-actor clocks, an orbit rig, turnaround frames) and 31 new frames | no orbit rig, no turnaround frames, no tape-stop (SOLO's silence stays the choke), no echo upgrade (v1 echo + the canvas Chorus); streak is GALE's block compiled into one SOLO program; **strobe prints** (a snapshot over an ordinary fall) as the one defender system; **27 must-have frames** (+7 optional) |
| power | Sobel neon on 640x360 pixel art is unproven, may read as a glitch filter | the shipping impact is the **beam impact** (one cone mask on the existing two-tone shader); neon is only an optional prototype behind a dev flag (§10.1) |
| power | clutter when chorus, statues, shafts, light rain and strobe chains share a frame | caps (§11.4): one hero formation per frame, ≤ 5 chorus copies while a print is on screen, light rain only on hits, shafts dim with age, background prints at 60 % rim, four "clean" money frames |
| hero | the dribble beats are the least violent; the first skill lands at 7.4 s after 6.6 s of setup | the setup is violent (two stomps, the snap, a blown-out stadium, the slam and the shadow rush, a crash zoom: 7 hard frame changes before 5.6 s); the **ignition** at 5.7 s (35 %) is a full stack; the first defender is destroyed at 7.2 s with an **11-layer stack** (turfRip 1.5, a 140 px 3-claw gash with 6 shafts, beam impact, cam.hit 1.0 at shakeAmp 20) |
| hero | B into the boards and D's pile-up happen off-screen | B is **strobed on screen** mid-spin above the sod carpet he peeled (no boards) and tumbles off it; D's buckle and pop are seen behind No.10 in the front ride, the pop **lighting him from behind** (his and the ball's shadows shoot at the lens); D's print hangs over his fallen body in the crane and shatters at the curtain drop |
| hero | trophy spots and the keeper backing into his net lean comic | the spots light **neon prints of each defeat** over the fallen bodies (menace, not gags); the keeper is **blasted off his feet onto his goal line** by the relight (K2, then `sitBack`, about 0.4 s), no net bump |
| hero | the no-shader impact preset: the 0.80 "blacklight frame" reads as a dip to black, the 0.5 violet print as v1's wash | the beam impact ships (stage A threshold 0.40: the subject blazes white inside a violet cone); hero's preset is only the fallback, retuned (§2.3) |

## 1. Identity

### 1.1 The five specials: the shared set table

The v1 "set rule" (each special changes one dimension of the world and never touches another's) is
**dropped**, as in GALE HAMMER v2: it is what made the three new skills small. The **identity rule**: every
special may use the full power kit (hit-stops, impact frames, refraction shocks, crash zooms, shake,
silence, roar, an opponent payoff), but each keeps its own **palette, element, signature energy shape,
signature camera move, signature post effect, impact-frame style, transition, sound signature, gesture,
keeper beat and false defeat**, and never borrows another's.

**One shared file.** This table is the set table. Its single source is `docs/skills/SET_TABLE.md`; the
GALE, MERIDIAN and SOLO v2 briefs carry the same rows word for word, and a change is made in that file first
and then copied into all three briefs. The ZENITH, CRESCENT, GALE and MERIDIAN columns below are copied word
for word from the set table as `GALE_HAMMER_v2.md` §1.1 prints it (they replace the stale pitch-era MERIDIAN
column this brief used to carry). The SOLO column is this brief's set-critic revision (the drop beam, neon
prints, the open-palm cue, the keeper blasted onto his line, the ENCORE ending rule): it goes into
`SET_TABLE.md` and is copied into the GALE and MERIDIAN briefs at their next sync.

| | ZENITH METEOR | CRIMSON CRESCENT | GALE HAMMER v2 | MERIDIAN THREAD v2 | **SPOTLIGHT SOLO v2** |
|---|---|---|---|---|---|
| Move | sky volley | bicycle kick | 30 m power shot | no-look lofted outside-of-the-boot pass, No.7's flying header | **special dribble through four, ends 1 on 1** |
| Element | fire, the sky, the moon | the crescent blade, rotation | air pressure: vacuum, vapour, shock, wind, late thunder | a line of jade light that the world treats as a string (bowed, held, plucked, strummed) | **stage light as a weapon: blackout, white-hot beams, ultraviolet pouring from torn turf** |
| Palette | fire orange / gold, night blue | crimson + silver, indigo | ice white and electric cyan on storm navy; cobalt only as halo, stroke and iso band | jade / emerald / mint / pearl on night-ink | **white-hot + ultraviolet / volt + ivory on plum-black** |
| Space | vertical, up into space | rotation, stadium upside down | horizontal and low (ball at most 1.9 m), down the pitch | 26 m inside the bowl at floodlight height, never above the roofs | **a stage on the turf (ball at most 1.4 m), one 22 m crane** |
| Signature camera | tilt and ride up into the sky; meteor POV at the lens | camera roll, whip-roll | vacuum pull + blow-back; ride + swing-orbit round the vapour disc; chase POV inside the wake; the proof push; never rolls | chase-crane catch and ride up the arc, look-down hang, fall with the needle; roll 0, no dolly zoom | **the beat-slam camera on a 150 BPM grid; the glue cam; an arc round his body; the shadow crane-rush; never rolls** |
| Energy shape | fire column, meteor | crescent arc and blades | vapour cone, vapour disc, cyclone wall, pressure orb, pressed V-wake, thunder wall | Meridian brush stroke, Sky Eye, needle / bowstring, harp | **the drop beam, the Chorus (crisp UV copies of him), light gashes with UV shafts, neon strobe prints, the strobe chain** |
| Signature post effect | two-tone impact `fx.impact` | slash split `fx.cut*` | pressure lens `fx.lens*` + isobar frame `fx.iso*` | pluck warp `fx.pluck*` + halftone `fx.tone*` | **beat echo `fx.echo*` + cone-masked impact `fx.impMask*`** |
| Impact frame | black/white, then red/black | crimson/black, silver/indigo | isobar weather map (≤ 4 band pairs, rings round the contact), then a luminance-only negative print (no rings) | jade halftone print (night/mint), then pearl negative (pearl/emerald) | **beam impact (cone-masked volt/white-hot, then lilac cut-out)** |
| Own transition | white flash | white crescent-blade wipe | wind wipe, ring-pop | needle-eye iris, whip-tilts, whiteout from the ball core | **blackout cuts, chorus wipe, whip-pans (no irises)** |
| Signature sound | roar, fire, `timeStop` | metal shing, heartbeats | howl → vacuum → hammer; sonic boom; the thunder that catches up; ear-pops; G-B-D air tones; digit clacks | the string: plucked motif, bowed arc, held note, `twang`, harp glissando; watch ticks | **the snap; the stick count-in and the 150 BPM drum solo; the choke into silence; OLÉ 1-4; the crowd stomp; the relight** |
| Gesture | (power-up roar) | (back to goal) | grab the wind / return the wind (the palm blow) | the Meridian Sign (tap, sweep, point) and the pluck | **the snap (lights out) and the open-palm cue to the stands (the relight)** |
| Opponents | defenders blasted, keeper burned, net torn | defenders spun, glove torn off | the wall flung by the barrier blast, one body hurled at the lens; the goal shoved off its line | Tower flung by a pluck; keeper lashed and spun to the turf | **four wrecked one by one, each falling in real time under the neon print the strobe leaves of his defeat; the prints shatter when the crowd's stomp relights the stadium** |
| Keeper beat | holds the meteor in a 1.1 s grind, burned into a torn net | fingertips on the ball, glove torn off | the set's only double-fist punch (`gkPunch`); folded and cartwheeled by the thunder; the set's only side-netting end pose (`netTangle`) | lashed by the line at full speed and spun to the turf | **his own spot slams on for the duel; the relight blasts him off his feet onto his goal line, still down at 1 ON 1** |
| False defeat | the grind: the keeper seems to hold it | the fingertip near-miss freeze | the set's only dead stop + grin: the ball hangs dead, the keeper grins at us, the thunder wall races in behind him (0.45 s) | the Tower grabs the thread and the arc sags (a hang of at most 0.12 s inside a 0.30 s sag) | **D smothers him: black, silence, a sliver of light, CRACK** |
| Ending | GOAL! slam (132 px), torn net | lands back to goal, never turns | the goal 2.8 m behind its painted line; GOAL! on the wind wave; Return the Wind | the friends point at each other under the arc; the fingertip diptych | **the curtain drop: the crowd's stomp relights the stadium, 1 ON 1 at 130 px over the beaten keeper; the ENCORE goal is the default unless the SHOOT chain ships** |
| Runtime / SP | 17.2 s / 80 | 15.3 s / 90 | 16.7 s / 75 | 16.8 s / 70 | **16.4 s / 65 (ENCORE 18.0 s)** |

**Shared engine tools, not shared looks** (one implementation each; §10): hit-stops and `rate()` curves; the
impact shader (each special with its own colours; SOLO adds the `IMPMASK` cone chunk); GALE's `STREAK` shader
chunk, `FlashBudget` (GALE v2 §10.1 item 6, imported unchanged), `fx.fullFrame`, `cam.shove`, `cam.buffet`,
`PK.Blade` and `Particles.wind`; MERIDIAN's `keys()` and `punch()` in `kit.ts`; the `PuppetCache` (SOLO's,
moved to `kit.ts`: the set's only puppet cache); the one `nameCard`; the one engine particle cap
`Particles.CAP`; the one pitch renderer (`drawDownPitch` and its reverse direction `drawUpPitch`, with the
shared pitch-only `tilt`); `drawPhoneLights` (extended with `n` / `wave` / `sway`); `studioAnim`,
`stinger()`, the one `crowdBus` with `duck(depth, dur)`, and `sfx.clearBus()`.

### 1.2 SOLO owns (no other special may use these as its core look)

- **Stage light as power**: the drop beam that falls and slams; the floodlight banks **blown out on screen**
  and the **relight**; the footlight lamp and No.10's **30 m long shadow**; trophy spots; two pools for the
  duel; the phone-light sea.
- **The snap**: the arm straight up and a finger snap that kills the stadium (once, in 2a; there is no
  second snap).
- **The conductor's cue**: an open palm raised high to the stands, answered by the crowd's stomp on his
  beat, which slams the stadium back on (9c).
- **The Chorus**: crisp additive ultraviolet copies of No.10's drawn frames (line, fan, throw, pulse, wipe),
  and the **strobe chain** of the ball.
- **Neon strobe prints**: the strobe photographs each defender mid-defeat and leaves a volt/ivory print of
  the pose hanging in the dark over his fallen body (the man himself falls in real time); the prints
  shatter into glass and light at the relight.
- **Light gashes**: turf torn by studs with light pouring up from under the stage; the **sod carpet**; the
  **fuse**.
- **Light rain**: SOLO's focus lines are parallel vertical lines of light falling from the rig, never radial.
- **The beam impact** (cone-masked two-tone in volt / white-hot / lilac / void).
- The **glue cam**, the arc round his body, the shadow crane-rush; the **drum solo** with the stick
  count-in, the choke, OLÉ 1-4 and the crowd stomp; the **slide tackle** as a featured beat.

**Never in SPOTLIGHT SOLO:** air, wind, vapour, isobars, pressure lenses (GALE); cyan, cobalt, ice, jade;
threads, stitches, halftone, ink, paper or manga panels (MERIDIAN); fire, gold (except the shared name card),
the moon, a sky shot or a vertical ride, the black/white two-tone (ZENITH); crimson, crescents, **camera roll**
(shake roll at most 0.015 rad), the slash split, heartbeats (CRESCENT); **dolly zooms** (CRESCENT, MERIDIAN);
a frozen orbit round the ball (GALE); **drawn concentric rings of any kind** (`ring()`, ring particles,
ring-pops: SOLO's impacts are filled light splashes, light rain and invisible flat refraction); `timeStop()`;
a low-pass or muffle on the mix (SOLO's silence is the choke plus a crowd `duck`); desaturation (`sat` stays
1); the ball above 1.4 m; a goal of its own (except the ENCORE ending, §8); a decoy afterimage; a red
full-frame flash or body wipe; **horizontal anamorphic eye streaks** or streak flares (GALE's eye streak:
SOLO's eyes carry cross glints); **a chase POV behind the ball** (GALE shot 6c); a palm thrust at the lens,
held palm-up at shoulder height or blown (GALE's grab and return); `tick()` (MERIDIAN's watch ticks); the
word "hammer" (GALE HAMMER: SOLO's beam is the drop beam); **frozen opponents, a second snap, or opponents
who all collapse at once** (§1.4); comic undercuts (a face looking back between the legs, a laugh at a fall).

### 1.3 SOLO's camera grammar: the beat-slam camera

Every big move **lands on the 16th grid**, and between the keys the camera now moves (tracks, drifts, pushes):
v1's "hold still, snap on the beat" is gone. The horizon is always level. Every camera table is a shared
`kit.keys()` track with `kit.punch()` kicks; `beatCam2` (§10.2) only lays SOLO's beat grid over them.

| Move | What it is | Where |
|---|---|---|
| **Kick-drum pump / beat punch** | zoom kicks +0.02-0.18 locked to the drum hits (`bounce` over `kit.punch`), never free-running | every shot |
| **Crash zoom** | inExpo 0.15-0.28 s onto the hand, the eyes, the ball | 2a (the hand, 1.9x), 3 (the ball, 3.2x), 1 (the eye) |
| **Shadow crane-rush** | the camera chases the head of his shadow up and over the wall | 2c |
| **The arc** | a 30° parallax orbit round the standing monument, one drawn view | 3 |
| **Left behind + whip-chase** | the subject blasts out of a frame that holds still for 3 frames, the camera whips 900 px after it | 4 |
| **Front retreating dolly** | low, backpedalling at his speed; one truck-whip on the cut | 5 |
| **Ride-up, frozen slide, hard cut to the front** | the breath over the slide: parallax inside frozen time, then the front money frame | 6 |
| **The glue cam** | locked to the 104 px ball at turf level; yaw-whips +35° / −70° through the elastico while the world smears | 7 |
| **Through the gate + the front ride** | behind D into the black, out with the ball, then a front retreating ride at turf level (eye 0.1 m, 0.5-0.6 m ahead of the ball) looking back at him; never behind the ball (GALE's chase POV) | 8 |
| **Constellation crane** | rises 22 m and tilts 0.80 rad down (the shared pitch-only tilt) over the torn route in silence, then whip-tilts back up to the horizon | 9b |
| **Over the keeper's shoulder + kick-back** | the duel, then a pull-out as the stadium relights | 9c |
| **Whip-pans** | on every change of direction, with streak blur and a sharp hole on the subject | 3, 5, 6 |

### 1.4 Originality guard

- **No exposure is a decoy.** Nobody tackles, touches or passes through a Chorus copy or a ball exposure, and
  nothing blinks out on contact (the "afterimage technique" trope). Copies only record the rhythm and fade on
  the grid. Nothing is named "phantom" or "ghost" on screen.
- **No time stop, no frozen opponents, no simultaneous collapse.** "Snap to stop time, walk past frozen
  opponents, snap again and they all fall" is the structure of Inazuma Eleven's dribble technique Heaven's
  Time, and "you are already beaten" (the delayed defeat) is a famous anime trope. SOLO has neither: there
  is **one snap** (lights out); every defender is **visibly beaten by a real skill and falls in real time**
  right after his strobe pop; the pop leaves a **print** (a photograph of the moment in neon light, not the
  man) hanging over his body on the turf; the relight is set off by **the crowd stomping on his beat**, cued
  by his open palm; and at the curtain drop only the prints shatter: nobody collapses late. The breath over
  the slide (6c) is a film hit-stop that holds everyone, No.10 included; he never moves through stopped time.
  No catchphrase, no countdown, no pointing.
- **The long shadow is a shadow**: it never moves on its own, never touches or pins anyone (MERIDIAN v2 stitches
  defenders' shadows), and never becomes a creature. Its eye-slits are the reflection of his eyes, two glints.
- **Glowing eyes** are two lit pupils in the shadow of his hair under top light, each with a small
  **stage-light cross glint** (a 4-point star, arms at most 60 px, the vertical arm longest, like a spot's
  lens star); never a horizontal streak (GALE's anamorphic eye streak), never a light trail streaming from
  the eye (a well-known sports-anime look), never red, never teeth.
- No defender falls on his backside after a crossover (the "ankle break"). The four falls are a corkscrew
  slammed face-down, a spin off a peeled sod strip into a double tumble, a split that topples onto its side
  and a forward topple on buckling knees. (The keeper's seat on his goal line comes from the relight's blast,
  not a crossover.)
- **No comedy undercuts**: no face looking back through its own legs, no laugh at a fall; the crowd gasps.
- The skills are real and named (step-over, sole lift over a slide, elastico, nutmeg). The snap is a stage
  magician's gesture and the open palm a conductor's cue to the crowd, not football moves. The cue is never
  GALE's palm: the arm is raised high to the stands with the palm open and up, never thrust at the lens,
  held at shoulder height or blown. Nothing here is a Captain Tsubasa move.
- Not Khmer-styled (owner rule): arena drums and a stage, no traditional instruments or motifs.
- The forbidden word (d-r-i-v-e) appears nowhere in names, captions, cue labels or code: use `push`, `burst`,
  `break`, `poke`, `surge`, `ignite`. "Hammer" is not used either (GALE HAMMER owns it): the beam is the
  **drop beam**, and his boots strike or tap the ball.
- The name SPOTLIGHT SOLO was checked in v1 (no anime or game move found). Re-check before shipping; the
  fallback name is VIOLET ENCORE.

## 2. Palette and grade

### 2.1 Palette (`PAL` and `HEX` in `./common.ts`; v1 keys kept, new keys marked)

| key | hex | RGB | use |
|---|---|---|---|
| `spot` (new) | #FFFAEC | 255,250,236 | beam cores, pool centres, light splashes, beam impact stage A light tone |
| `ivory` | #F6F0DF | 246,240,223 | eye cores, the ball's glow core, Chorus rims, title fill |
| `volt` (new) | #A880FF | 168,128,255 | Chorus bodies (additive), gash cores and shafts, print edge lines, beam impact stage A dark tone |
| `uv` | #7A4DFF | 122,77,255 | glows, title stroke, the beat echo tint, outer glow of every copy |
| `lilac` | #C9B6FF | 201,182,255 | defender rims in the dark, fluorescent pitch lines, beam impact stage B field |
| `uvDeep` | #2A1660 | 42,22,96 | the dark halo under **every** violet glow; print bodies |
| `plum` | #160A26 | 22,10,38 | the dimmed stadium, title outer stroke, shadows |
| `void` (new) | #080310 | 8,3,16 | the blackout; outside the beam impact's cone; stage B dark tone |
| `soil` (new) | #4A3424 | 74,52,36 | sod undersides, gash walls (dark against the shafts) |
| `soilDeep` (new) | #22160F | 34,22,16 | gash floors, B's dark furrow |
| `torn` (new) | #3C8A3A | 60,138,58 | torn grass lips and sod tops |
| `kit` | #DF2321 | 223,35,33 | his shirt: the only warm colour in the dark |

- Ball: `drawBall(..., 'blacklight')` (kept) with the new `blaze` option (§10.7).
- Particle ramps: `'uv'`, `'mote'` (kept), `'sod'` and `'glass'` (new, §10.5), `'dust'`, `'grass'`. No cyan,
  cobalt, jade, gold, fire or crimson anywhere; gold only on the shared name card.

### 2.2 Grades (`common.ts`; they replace v1's `soloGrade`)

| helper | tint | sat | contrast | bloom / thresh | vignette | ca | use |
|---|---|---|---|---|---|---|---|
| `soloLit(fx)` | [232,228,255] | 1.0 | 1.12 | 0.9 / 0.66 | 0.60 | 0.0015 | shot 2a (the floodlit wall) |
| `soloStage(fx, k)` | [236,228,255] | 1.0 | 1.14 | 1.0 / 0.66 | 0.65 | 0.002 | every stage shot (default) |
| `soloBlaze(fx, u)` | [246,242,255] | 1.0 | 1.10 | 1.25 / 0.60 → 0.95 / 0.66 over 0.3 s | 0.55 | 0.010 → 0.002 | shot 9c from the relight |

- **Darkness is light only**: `stage.dim` (multiply) up to **0.94** outside the pools in v2 shots (v1 capped
  at 0.88; the hot beams now carry the read). Blackouts (`uncapped`, up to 0.97) last at most 0.6 s and always
  keep something glowing (the ball, eyes, a rim, a sliver of light).
- `bloomThresh` drops to 0.66 (v1 0.74) so the beams, pools, eyes and ball bloom. Every additive layer
  (beam core, Chorus, gash shafts, ball, eyes, print edges) is drawn **after** `stage.dim` over a uvDeep
  halo in normal blend, so they are the only hot pixels and nothing blows out to a flat white field.
- `fx.pass = 'solo'` is set by every grade helper (it selects the SOLO post program, §10.1).

**Picture targets** (6 fps film, `tools/metrics.py`):

| metric | v1 | v2 target | ZENITH / CRESCENT |
|---|---|---|---|
| deep-shadow pixels (L < 0.12) | 69 % | **50-65 %** (still the darkest special) | 43 % / 52 % |
| hot pixels (L > 0.85) | 0.5 % | **3 %+** | 4.9 % / 2.4 % |
| saturated light (S > 0.6, V > 0.75) | 4.0 % | **5 %+** (UV that glows, not haze) | 2.7 % / 1.8 % |
| mean frame-to-frame change | 0.063 | **0.11+** | 0.125 / 0.095 |
| violent changes (> 0.15 per 1/6 s) | 5 | **18+** in 98 frames | 29 / 8 |
| luminance contrast (mean std) | 0.130 | **0.18+** | 0.208 / 0.159 |

### 2.3 The SOLO impact: the beam impact

SOLO's impact frame is the existing two-tone impact **inside the spot's cone only**; outside the cone the
frame drops to `void`. It reads as "the light itself punches", and no other special has a masked impact.

| stage | inside the cone (`impA` dark / `impB` light, `impThresh`) | outside the cone | frames |
|---|---|---|---|
| **A** | `volt` [168,128,255] / `spot` [255,250,236], 0.40: the subject blazes white inside a violet cone | `void`, amount 1.0 | 2 (0.033 s) |
| **B** (inverted) | `lilac` [201,182,255] / `void` [8,3,16], 0.40: the subject becomes a black cut-out in a lilac cone | `void`, amount 0.85 | 1 (0.017 s) |

- Helper `soloImpact2(fx, stage, cone?)` (§10.1). The cone (apex, axis, half-angle) is the beam that lights
  that hit: from the roof down onto him (shots 4-7, 9), from the footlight toward the wall (shot 2c), and a
  wide fan out of the gap between D's legs (shot 8).
- Sites: the slam (2c, A), the ignition (4, A), the cut (5, A + B), the release (6, A + B), the snap (7, A + B),
  the crack (8, A), the stop (9a, B only). **7 sites, 10 events**, all inside the flash budget (§4.4).
- **No-shader fallback** (if the cone mask slips): full-frame stage A = `impA` `void`, `impB` `lilac`,
  threshold **0.72** (not hero's 0.80), with a canvas pass that adds the beam cone at +40 % on the same frame,
  so it never reads as a plain dip to black; stage B = `impA` `uv`, `impB` `spot`, threshold 0.40 (a hard
  violet-and-white print, never v1's 0.62 lilac wash).
- Optional prototype only: the Sobel neon frame (`fx.neon`, §10.1) behind a dev flag.

## 3. Continuity (all shots)

**Setting.** Night. Shots 1-2a: the stadium is **fully floodlit**, so the blackout is a real event. From the
snap (2a, 1.60) to the relight (9c, 1.60) the stadium is **the blackout stage**: struck to plum-black,
lit only by sources we can point at (the footlight lamp, the roof follow-spot, the trophy spots, the
keeper's spot, the phone lights, and the whites that fluoresce under ultraviolet: the ball, his white boots,
the pitch lines, the cores of the torn turf). From 9c 1.60 the stadium blazes again. **No moon, no sky shot.**

**Light rigs.**

| shot | light |
|---|---|
| 1 | the drop beam (the cut-in panel) |
| 2a | the four floodlight banks ON behind the wall (back-light), then blown out at 1.65-1.80 |
| 2b | void: only phone lights, the ball and his eyes |
| 2c-3 | the **footlight lamp**: a low stage lamp on the turf 8 m behind him (the halo behind his head in shot 3; it throws the 30 m shadow in 2c) |
| 4-8 | the **roof follow-spot** on the main stand roof: it enters from the top of frame and its pool travels with him (operator lag `FollowSpot`, 60 ms); it lights from the ignition on |
| from each strobe pop | that defender's **trophy spot** (narrow hard cone from the roof) over his print and his body, kept until the relight |
| 9b-9c | his follow-spot + the **keeper's spot** (slams on at 9b 0.80); then the relight on the crowd's stomp (9c 1.60) |

**Direction and characters.**
- The goal is to the **right** (+x). In side views No.10 runs **east** (`HERO_FACING = 1`, studio frames
  unmirrored). In front views the camera stands between him and the goal (looking west, `drawUpPitch`), so
  screen-left is **his right**. In back views (looking east, `drawDownPitch`) screen-right is his right.
- No.10 is **always studio-drawn**, never a puppet, including the field and result views. Close-ups use drawn
  crops (SoloFace, MacroBoots); foreground layers may be drawn larger than their projected size (forced
  perspective), never smeared.
- Defenders: A `RIVAL_KIT`, B `RIVAL_KIT_B`, C `RIVAL_KIT_C`. **D is the Tower**, the set's one big captain
  (MERIDIAN v2's: the same Rivals model sheet, `RIVAL_KIT` with a captain's armband, 1.3x bulk; drawn and
  puppet at 1.3x, the biggest). Keeper `KEEPER_KIT` (the same keeper model sheet as GALE v2's KeeperFront
  busts). Drawn frames where §9 lists them, puppets otherwise, every puppet through the shared `PuppetCache`
  (`kit.ts`); **at most 4 live puppet renders per frame** (prints, bodies at rest and the result pile are
  cached canvases).
- In the dark a defender is a plum silhouette with a lilac rim (`DEF_SIL`); inside a pool he crossfades to full
  colour over 4 frames. A print is drawn in the neon look (§10.4); the body under it keeps the normal look.
- **Falls stay safe**: B's studs pass at least 8 px under No.10's trailing boot and never touch him or the ball;
  nothing hits a head; D topples over fallen C's outstretched leg and lands shoulder-first, never on his head;
  the keeper lands seated on his line, never on his head or neck.

**The route** (field world px, 10 px = 1 m; goal line x 1180, goal centre z 257; the penalty spot is the
`drawDownPitch` spot (1070, 257)). The cinematic uses these; the field result view keeps v1's field-view
coordinates (§8).

| item | x | z | h (m) | shot / local t |
|---|---|---|---|---|
| No.10 at the snap | 840 | 262 | | 2 |
| the wall, after two stomps (A, D, B, C left to right in 2a) | 905-918 | 236-292 | | 2a |
| the footlight lamp | 760 | 262 | 1.0 | 2c-3 |
| ignition (the plant) | 846 | 262 | | 4 / 0.00 |
| A's cut | 884 | 264 | | 5 / 0.80 |
| **print A** (mid-air corkscrew) / A's body, face-down | 892 / 896 | 254 | 0.4 / 0 | 5 / 0.95 (pop), 1.15 (landed) |
| B's slide (east → west) | 965 → 912 | 288 | | 6 / −0.2-1.95 |
| the hurdle (take-off / apex / landing) | 926 / 936 / 946 | 286 | ball apex 1.4 | 6 / 0.60 / 0.80 / 1.75 |
| the sod carpet (peeled strip) | 918-948 | 288 | | 6 / 1.60-1.95 |
| **print B** (mid-spin) / B's body, on his back | 908 / 912 | 290 / 292 | 0.3 / 0 | 6 / 1.80 (pop), 2.10 (landed) |
| C's V (the pivot) | 975 | 270 | | 7 / 0.80 |
| **print C** (side split) / C's body, on his side | 990 | 276 / 278 | 0 | 7 / 0.95 (pop), 1.15 (landed) |
| D's gate (the nutmeg) | 1010 | 262 | | 8 / 0.00-0.86 |
| **print D** (mid-topple over C's leg) / D's body, on his back | 996 / 986 | 272 / 268 | 0.6 / 0 | 8 / 1.10 (pop), 1.40 (landed) |
| the ride (ball) | 1016 → 1066 | 262 → 257 | | 8 / 0.86-1.55 |
| **the mark** (the penalty spot) | 1070 | 257 | | 9 / 0.00 |
| the keeper (set → blasted off his feet, seated on the goal line) | 1172 → 1180 | 257 | | 9 / 1.62-2.02 |

**The prints and the falls** (`soloWorld.PRINTS`, all times global; `StrobePrint`, §10.4). Each defender is
beaten by a real skill and **falls in real time**. The strobe pop at the listed time snapshots his mid-defeat
pose into a cached neon print that hangs where he was, while his body finishes the fall and lies on the turf
under it. Nobody is ever frozen and nothing falls late; at the relight only the prints shatter.

| | beaten by | pop (print made) | print pose | the body's fall (real time, from the pop) | landed | trophy spot | prints shatter |
|---|---|---|---|---|---|---|---|
| A | the step-over cut: crossed ankles, a 270° corkscrew | 7.35 | `corkscrew`, spin 1.2π, arms flung, 0.4 m up | finishes the corkscrew and slams face-down (`faceDown`) under the print | 7.55 | 7.60 | 15.22 |
| B | the sole lift: misses so hard he peels a 3 m sod carpet and spins off it | 9.80 | RivalSlide S4 (or `slideSpin` + spin 2.2 rad), 0.3 m up | a double tumble off the end of his carpet onto his back (`sprawl`) | 10.10 | 10.00 | 15.22 |
| C | the elastico: stabs at the shown ball, boots shoot apart | 11.35 | `splitFreeze` (the side split, arms up) | the split topples onto his side (`sideTopple`) | 11.55 | 11.60 | 15.22 |
| D (the Tower) | the nutmeg after his own smother: his knees buckle (`kneeBuckle`) and he topples forward over C's outstretched leg | 13.10 | `tumble`, pitched 70°, arms reaching down, 0.6 m up | pitches on over C's leg, lands shoulder-first and rolls onto his back (`sprawl`) | 13.40 | 13.20 | 15.22 |

**The torn route** (`soloWorld.GASHES`, born at the global time listed; they stay for the rest of the film
and become the fuse in 9c): the ignition (5.70, 3 claws, 120 px, toward +x); A's cut (7.20, 3 claws, 140 px,
fanned south-east); five stride rips (7.25-7.85, 2 claws); B's **dark furrow** (8.0-9.95, no light in it:
B's rip is ugly, No.10's glow); the **sod carpet** (9.60-9.95); the landing (9.75, 3 claws); C's **spiral
divot** and the two V gouges (11.20); C's split furrows (11.25); the nutmeg line and D's push-off (12.80,
4 claws); three ride taps (13.0, 13.2, 13.4); the twin brake rips (13.55); the crack star on the spot (13.60).
**12+ gash sites.**

**Text.** At most three words of big text on screen at a time: SPOTLIGHT SOLO, the four marquee tags,
1 ON 1 (plus the small tag, the four-count HUD and the name card). Never the forbidden word.

**Times.** All times are shot-local `t` on the runner's unwarped clock, with the global time in brackets
(g). `rate(t)` only slows `update` (particles, motes, falling bodies); sprite schedules, cameras, cues,
print and fall clocks, titles and screen effects run on `t` exactly as listed. Every decal, print, fallen
body, trophy spot and gash is a pure function of the global time, rebuilt in each shot's `init` from `soloWorld`, so every shot
seeks exactly. Every SOLO `init` calls `sfx.clearBus()` and sets `cam.shakeRoll = 0.015`.

## 4. Tempo, pacing and escalation

### 4.1 The grid

One tempo for the whole special: **150 BPM**. A beat is 0.4 s (24 frames), an 8th 0.2 s, a 16th 0.1 s
(6 frames), a 32nd 0.05 s (3 frames), so every hit sits on the 1/60 s grid.

- Shot 1 is the count-in: four stick clicks on 8ths (0.8, 1.0, 1.2, 1.4), one per title word. **The grid's
  beat 0 is global 1.6 s**, the first frame of shot 2 (`GRID0 = 1.6`, was 1.4).
- Every shot lasts whole beats (4, 7, 3, 2, 4, 6, 4, 4, 7), so the grid runs unbroken across every cut.
  `SHOT_T0 = [0, 1.6, 4.4, 5.6, 6.4, 8.0, 10.4, 12.0, 13.6, 16.4]`.
- Bars are 4 beats; the ONE of bar n is at `BAR(n) = 1.6 + (n − 1) · 1.6`: 1.6, 3.2, 4.8, 6.4, 8.0, 9.6,
  11.2, 12.8, 14.4, 16.0.
- `rate()` slows only the simulation, never the shot clock, so the music never drifts: **every hit-stop and
  freeze is a rest in the bar**. `onGrid(t)` (dev assert) now accepts 32nds where §6 lists them.

| Bar | ONE (g) | shot (local) | on the ONE |
|---|---|---|---|
| 1 | 1.6 | 2 (0.00) | **STOMP 1**: the lit wall of four and the whole stadium stomp as one |
| 2 | 3.2 | 2 (1.60) | **THE SNAP**: the stadium blows out on the next four 32nds |
| 3 | 4.8 | 3 (0.40) | the chorus fan steps out behind the monument; the eyes flare |
| 4 | 6.4 | 5 (0.00) | A attacks out of the dark (the sell is beat 2, **THE CUT beat 3 = 7.2**) |
| 5 | 8.0 | 6 (0.00) | **SOLE ON**: the ball stopped dead, B's studs in frame |
| 6 | 9.6 | 6 (1.60) | **THE RELEASE** over the slide; the sod carpet peels |
| 7 | 11.2 | 7 (0.80) | **THE ELASTICO SNAP** inside the glue cam |
| 8 | 12.8 | 8 (0.80) | **CRACK**: the ball out through D's legs |
| 9 | 14.4 | 9 (0.80) | the keeper's spot slams on, in silence: the duel |
| 10 | 16.0 | 9 (2.40) | the final cymbal under the name card, with the crowd's third stomp |

His cue (the open palm) comes on the "and" of beat 2 (g 15.0); **the crowd's stomp and the curtain drop** land
on **beat 3 of bar 9 (g 15.2)**, after the stop on beat 3 of bar 8 and a two-beat-plus silence: stop, rest,
rest, HIT, the classic drum break, played by the stadium.

### 4.2 Shots and the emotional curve

| # | Shot | Dur | Global | Story job |
|---|---|---|---|---|
| 1 | Spot slam (cut-in) | 1.6 | 0.0-1.6 | the stage is declared; eyes in the shadow |
| 2 | Lights out | 2.8 | 1.6-4.4 | threat (the stomping wall), the snap, the blackout, eyes in the dark, the long shadow |
| 3 | The stare | 1.2 | 4.4-5.6 | monument; the crash zoom onto the ball |
| 4 | Ignition | 0.8 | 5.6-6.4 | explosive acceleration |
| 5 | Step-over: A | 1.6 | 6.4-8.0 | the first victim, corkscrewed, printed mid-air, slammed face-down |
| 6 | Over the slide: B | 2.4 | 8.0-10.4 | danger, the breath, the release, the sod carpet |
| 7 | Elastico: C | 1.6 | 10.4-12.0 | **the ball showcase** (glue cam); C printed in the splits as he topples |
| 8 | Nutmeg: D | 1.6 | 12.0-13.6 | the false defeat, the crack, the front ride |
| 9 | Curtain call | 2.8 | 13.6-16.4 | the stop, the constellation, the cue, the crowd's stomp, the curtain drop |

```
feeling  DARE  THREAT   DEFIANCE  POWER   DREAD(them)  SLAM   AWE      GO!   FAKE  WRECK   DANGER BREATH RELEASE  SHOWCASE  WRECK  FALSE   CRACK  RIDE  STOP  AWE    TRIUMPH
shot     1     2        2         2       2            2      3        4     5     5       6      6      6        7         7      8       8      8     9     9      9
global   0.0   1.6      2.4       3.2     3.4          4.0    4.4      5.7   6.8   7.2     8.4    8.8    9.6      10.4      11.2   12.4    12.8   13.0  13.6  13.7   15.2   16.4
power    ▃▅    ▆▇(them) ▃         █       ▁▁ ▃ ▃       ██     ▅▆ ▇     ██    ▁     ██      ▆▇     ▁▁▁    ███      ▅▆ ▁ ██   ██     ▁▁(blk) ███    ▇▇    █ ▁▁  ▁ ▂ ▁  ████ ▇▆
```

**Silence, then violence, four times**, each release bigger than the one before:
1. the blown-out stadium and the eyes in the dark (g 3.40-4.00), then the **slam** (boom 1.1 + lampSlam 1.4);
2. the choke over the slide (g 8.80-9.60, rate 0.03), then the **release** (boom 1.3 + snare 1.3 + crack 1.0);
3. the smother's black (g 12.40-12.80), then the **crack** (boom 1.3 + kick 1.2 + crack 1.0);
4. the stop and the constellation (g 13.66-15.20), then the crowd's stomp and the **curtain drop** (relight 1.4 +
   boom 1.4 + roar 2.0).

The release over B sits at **59 %** (ZENITH's volley 50 %, CRESCENT's strike 47 %); the curtain drop is the
loudest and biggest frame of the film at 93 %.

### 4.3 Intensity ladder (No.10's hits; the opponents' beats are smaller on purpose)

| global t | beat | sound peak | picture |
|---|---|---|---|
| 0.06 | the drop beam slams onto his face | lampSlam 1.0 | flash 0.35, light splash, light rain 140 |
| 1.60 / 2.40 | STOMP 1 / STOMP 2 (the wall, theirs) | stomp 1.0 / 1.15 + the crowd stomp | dust rolling at the lens, cam.hit 0.4 / 0.55 |
| **3.20** | **THE SNAP** | snap 1.0 alone | spark, light rain from the hand, CA |
| 3.25-3.40 | the stadium blows out | surge 0.9 → 1.3 + boom 0.4 → 0.6 | cell pops, glass showers, smoke, dim 0.3 → 0.92 |
| 3.60 / 3.80 | eyes in the dark | warDrum 1.0 / 1.05 + boom 0.5 / 0.6 | the ball ignites; two eyes open |
| **4.00** | **THE SLAM** + the long shadow | lampSlam 1.4 + crash 0.8 | beam impact A, the shadow 30 m, crane-rush |
| 5.20 | crash zoom onto the ball | warDrum 1.2 + 16th roll | 1.12 → 3.2x, the ball 108 px |
| **5.70** | **IGNITION** | kickDrum 1.2 + kick 1.0 + rip 1.2 + boom 1.0 | beam impact A, divot at the lens, left behind, whip-chase |
| **7.20** | **THE CUT** (A) | snare 1.4 + boom 1.2 + kick 1.2 + rip 1.0 + crash 0.8 | 11-layer stack; A corkscrews, printed at 7.35, face-down by 7.55 |
| 8.00 | SOLE ON | rim 1.0 + kickDrum 0.6 + boom 0.4 | 79 px macro, B's studs |
| **9.60** | **THE RELEASE** (B) | snare 1.3 + boom 1.3 + kick 1.2 + crack 1.0 + crash 1.0, rip 1.4 | 11-layer stack; the sod carpet; B printed at 9.80, on his back by 10.10 |
| **11.20** | **THE SNAP** (C) | snare 1.2 + boom 1.2 + kickDrum 1.2 + crash 1.0 + rip 1.3 | glue-cam whip −70°; the V; C printed at 11.35 |
| **12.80** | **CRACK** (D) | boom 1.3 + kick 1.2 + kickDrum 1.2 + crack 1.0 + crash 1.0 | light through the legs, ball 120 px at the lens |
| 13.60 | SOLE STOP | kickDrum 1.2 + boom 1.1 + crash 1.0, then the choke | 72 px macro, the cut-out |
| 14.40 | the keeper's spot (theirs) | lampSlam 0.9 + boom 0.6 | two pools, the duel |
| **15.20** | **THE CROWD'S STOMP: THE CURTAIN DROP** (cued by his open palm at 15.0) | **crowdStomp(4) + relight 1.4 + stomp 1.4 + boom 1.4 + crack 1.2 + roar 2.0** | the four pads flare, relight wave, beat pulse, the 4 prints shatter, the fuse, the keeper blasted onto his line, 1 ON 1 at 130 px |

**Every cut lands on a punch or a beat**: hard cut out of black onto the stomp, cut on the last bank's CHUNK,
hard cut on the slam, hard cut on the beat, whip-pan motion cut, hard cut on the beat, whip-pan, whip-pan,
chorus wipe, match cut on the sole, whip-tilt, fade. No soft blinks, no irises.

### 4.4 Photosensitivity budget (a game for children)

At most **3 full-frame events in any 1 s window**, across cuts, as counted by the set's single `FlashBudget`
definition (GALE v2 §10.1 item 6), imported unchanged: SOLO defines no thresholds or event kinds of its own. SOLO's
beam impact is an ordinary `fx.impact` to it (the mask does not matter), and SOLO flags `fx.fullFrame` on the
frames this table marks. Impact stages last at most 2 frames.

| # | global t | event |
|---|---|---|
| E1 | 0.06 | the drop beam slams (flash 0.35 ivory) |
| E2 | 1.60 | the cut from black to the blazing stadium (`fullFrame`) |
| E3 | 4.00 | the slam: beam impact A (footlight cone) |
| E4 | 5.70 | the ignition: beam impact A |
| E5 / E6 | 7.200 / 7.233 | the cut: beam impact A / B |
| E7 / E8 | 9.600 / 9.633 | the release: A / B |
| E9 / E10 | 11.200 / 11.233 | the snap: A / B |
| E11 | 12.80 | the crack: beam impact A (the fan from the gap) |
| E12 | 13.60 | the stop: the cut-out (B, 1 frame) |
| E13 / E14 | 15.20 / 15.30 | the relight on the crowd's stomp (flash 0.6 ivory) / the near banks (`fullFrame`) |

- **Worst window: 2 events** (7.2-8.2, 9.6-10.6, 11.2-12.2, 12.8-13.8, 15.2-16.2). All others hold 0-1.
- Not counted, because they are local or only darken: the banks dying (one-way darkening), the blacks of 2b
  and 8a, the strobe pops (one per defender, radius ≤ 90 px, 3 frames), trophy clanks (narrow cones), the
  drop beam's pumps (+15 % inside the pool only), the S1 bulb pop (1 frame, 60 px), the chorus wipe (≤ 50 %
  of the frame on any frame), eye glints, the four prints shattering (local glass and light, ≤ 60 px each,
  far behind him), crowd camera flashes (≤ 12 per second, each < 2 % of the frame).
- **Nothing strobes.** The "strobe" is a single local pop per defender, then a still. No red full-frame event
  (the chorus wipe is violet, never his red shirt at the lens).
- The shared `FlashBudget` guard (GALE v2 §10.1 item 6) asserts this table in dev captures and clamps any
  extra event at runtime.

### 4.5 The sound arc

**The footwork is a drum solo with arena weight**, and the story is told in who owns the beat.

- **Their beat** (shot 2a): the wall stomps in **half-time** (one stomp every two beats) and the whole crowd
  stomps with them (`crowdStomp`): scary, heavy, slow.
- **The snap** stops it dead. The stadium dies in four 32nd-note **surges** (relay slams, zaps, glass). Then
  silence and two **war drums** in the dark (DOOM ... DOOM) as the ball and his eyes light.
- **His beat** starts with the **lamp slam**: war drums on quarters (shot 3), a falling tom fill on 16ths
  (shot 4), toms on 8ths with a snare on every sell and a snare crack + boom + rip on every skill (shots 5-7),
  hats on 16ths, a half-time break with the **choke** over the slide (shot 6), a snare crescendo into the
  choke at the smother (shot 8), sticks in the black (tk ... tk: he is still in there), then 8th toms and a
  32nd roll on the ride.
- **The crowd changes sides**: it stomps with the wall at the start; after OLÉ 1 it stomps on **his** beat,
  louder at every OLÉ (`crowdStomp(level)`); a gasp at every danger (and when D topples, rising into OLÉ 4);
  a dead hush at the stop; an awed "ooh" at the constellation; then, at his cue, **the crowd's own stomp on
  his beat sets off the relight**, and the roar.
- **The payoff is the loudest moment**: his cue, the crowd's stomp on beat 3, then `relight` + stomp + boom
  1.4 + crack + **roar 2.0**, the four prints shattering, the fuse's eight rips rising in pitch, the keeper's
  landing, the stinger under the card.
- SOLO's silence is always a **musical stop** (the cymbal `choke()` + a crowd `duck`), never a filter and
  never `timeStop()`. Inside every silence one sound stays (the lamp hum, a sub, a breath, the sticks), so it
  never reads as a bug.
- Tom notes as v1: D2 73.4, F2 87.3, A2 110, C3 130.8, D3 146.8 Hz; war drum 58 Hz.

## 5. Shots (durations are fixed: do not change them)

| # | File / export | Dur | Seed | `name` |
|---|---|---|---|---|
| 1 | `shot1_slam.ts` / `shotSpotSlam` | 1.6 | 511 | "Spot slam" |
| 2 | `shot2_lightsout.ts` / `shotLightsOut` | 2.8 | 512 | "Lights out" |
| 3 | `shot3_stare.ts` / `shotStare` | 1.2 | 513 | "The stare" |
| 4 | `shot4_ignition.ts` / `shotIgnition` | 0.8 | 514 | "Ignition" |
| 5 | `shot5_stepover.ts` / `shotStepOver` | 1.6 | 515 | "Step-over" |
| 6 | `shot6_slide.ts` / `shotOverTheSlide` | 2.4 | 516 | "Over the slide" |
| 7 | `shot7_elastico.ts` / `shotElastico` | 1.6 | 517 | "Elastico" |
| 8 | `shot8_nutmeg.ts` / `shotNutmeg` | 1.6 | 518 | "Nutmeg" |
| 9 | `shot9_curtain.ts` / `shotCurtainCall` | 2.8 | 519 | "Curtain call" |

Total **16.4 s** at 1x. The v1 shot files (`shot1_countin.ts` … `shot7_mark.ts`) are deleted; `index.ts`
exports `spotlightSolo` with the nine new shots. With the ENCORE ending (§8, §12) a tenth shot follows:
`shot10_encore.ts` / `shotEncore`, 1.6 s, seed 520, "Encore" (18.0 s in all).

| # | Shot | What happens | Cut into the next shot |
|---|---|---|---|
| 1 | Spot slam | A drop beam slams onto his face at 8x, lit from straight above; his eyes ignite in the shadow of his hair; four title words, each stamped by its own drop beam on the drummer's count; the beam blows and only his eyes stay lit | Hard cut out of black onto STOMP 1 |
| 2 | Lights out | The lit wall of four stomps with the whole stadium; he raises his arm and SNAPS; the floodlights blow out; in the black, past D's shoulder, the ball and two eyes glow; a footlight slams on and his 30 m shadow rushes over the wall with eyes in its head | Hard cut on the beat |
| 3 | The stare | Worm's-eye monument: a lamp halo behind his head, god rays, underlit by the blazing ball, a chorus of copies stepping out on the drum, a 30° arc round him; crash zoom 3.2x onto the ball under his sole | Whip-pan motion cut |
| 4 | Ignition | Macro at turf level: plant, the toe-poke burst, beam impact, a divot at the lens; ball and boots blast out of a frame that holds still, the camera whips 900 px after them; step-print touches | Hard cut on the ONE |
| 5 | Step-over: A | Front dolly: the sell throws three copies of him the wrong way; the cut rips the turf open; A corkscrews into the air, the strobe prints him there and he slams face-down under his print; he outruns his own spot; trophy 1, OLÉ 1 | Whip-pan motion cut |
| 6 | Over the slide: B | 79 px macro: sole on, B's studs racing in; the flick to 1.4 m; the hurdle; the choke: a frozen parallax slide, then a hard cut to the front money frame (the 96 px ball in the beam); the release: B peels a 3 m sod carpet, is printed mid-spin and tumbles off it; cushion; trophy 2, OLÉ 2 | Whip-pan motion cut |
| 7 | Elastico: C | **The ball showcase**: the glue cam locked to the 104 px ball at turf level, yaw-whipping +35° and −70° through the elastico; the V torn into the turf; C printed in the splits as he topples; the reveal; trophy 3, OLÉ 3 | Chorus wipe |
| 8 | Nutmeg: D | Behind D's arch: D smothers him, black, silence, sticks, a sliver of light, CRACK: light bursts through his legs, his knees buckle and the ball blasts at the lens; the front ride at turf level, the 108 px ball rushing at the lens, his boots striking it from behind, his face under-lit; D's pop flares behind him; trophy 4, OLÉ 4 | Match cut on the sole |
| 9 | Curtain call | Sole stop on the penalty spot; silence; the constellation crane tilting down over the torn route, four prints hanging over four fallen bodies; the keeper's spot slams on; over the keeper's shoulder, he raises an open palm to the stands, the crowd stomps on his beat and the stadium slams back on, the prints shatter, the fuse erupts to his sole, the keeper is blasted off his feet onto his goal line, 1 ON 1, freeze, name card | Fade to [8,4,14] (ENCORE: into shot 10) |

---

## 6. Shot by shot

Conventions: "SC" = integer-ish studio draw scale (No.10 is 98 px tall at SC 1; nearest neighbour); "zoom" =
`cam.zoom` on the screen-space composition; on-screen size = SC × zoom. `drawBall(r, D)`: r × D px radius.
Ball on screen at the boot = 2 × 6 × SC × zoom. Pitch views are given as `{x, z, h, f, horizon, cx}` (world px;
`drawDownPitch` looks east, `drawUpPitch` looks west: two directions of the one pitch renderer), plus `tilt`
(rad, + looks down) where a view uses the shared pitch-only tilt; `horizon` is then the principal point's y. `warp` rows are `kit.warp(t, [[start, len, rate]])`.
"(g …)" is the global time. Every camera key, cue and sprite key below sits on the 16th grid unless marked
(32nd).

### 1 · Spot slam (1.6 s, g 0.0-1.6): the stage is declared

**Story job.** Declare the move in SOLO's own language: light that drops and slams, eyes in the dark, a drummer's
count. The same family as every cut-in (eyes, glint, title, tag), but here the spotlight is the panel and it
hits like a punch.

**Camera** (screen space). `cam.set(320, 180, 1.00)`; push 1.00 → 1.06 (outSine) over 0.06-1.40;
`cam.hit(0.35)` at 0.06 (shakeAmp 10); beat punches +0.035 at 0.80, 1.00, 1.20, 1.40 (decay 0.1 s), each with
`cam.hit(0.12)`; **1.40-1.55 crash zoom 1.06 → 1.45 toward his right eye** (inExpo) as the beam blows.

**Beats**
- 0.00: black.
- **0.06: SLAM.** The drop beam (`stage.pillar`) falls from the top of frame in 2 frames: lamp at (320, −30),
  50 px wide at the top, 520 px at the pool; 6 % overshoot. The pool is a horizontal band (centre (320, 150),
  rx 300, ry 90). In it, **SoloFace SF1 at ×8** (384 × 208 px, centred (320, 140)), lit hard from straight
  above: the fringe throws its shadow across the eyes, only the cheekbones, nose bridge and jaw catch the
  light. Light splash rx 40 → 300 (0.15 s); 60 dust motes blown sideways out of the pool; a flat refraction
  shock (s 0.04, sy 0.35) at (320, 240); flash 0.35 ivory for 2 frames (**E1**).
- Background: black with **light rain**: 140 vertical lines (1 px, 30-90 px long) falling from the top edge in
  a 600 px band round the pool, 900 px/s slowing to 150 px/s, gone by 0.60.
- **0.45: the eyes ignite.** `eyeGlow` at SF1's `eyeL`/`eyeR`: 3 × 2 strobe-white cores open over 3 frames,
  18 px uv halos, a lilac band of spill light under the brow; on each eye a **stage-light cross glint** (a
  4-point lilac-white star, vertical arm 60 px, horizontal arm 36 px, like a spot's lens star; it fades over
  0.25 s); bloom 1.0 → 1.25 for 0.2 s.
- 0.60: **SF2** (the glare: brows down, lids narrowed, still glowing); the glints squash 3 × 2 → 4 × 1.
- **0.80, 1.00, 1.20, 1.40: the count-in.** `SPOT` / `LIGHT` / `SO` / `LO`, each **stamped by its own narrow
  drop beam** (40 px wide, falling in 2 frames) with `lampTitle2`: TITLE_FONT 72 px, baseline y 300, ivory fill,
  3 px uv stroke, 4 px plum outer stroke; each word lands with a 6 px squash (60 → 110 → 100 %) and a puff of
  motes, and leaves a crisp volt **Chorus copy** 10 px to its left that fades on the next three 16ths
  (0.6 → 0.4 → 0.2 → 0). The four lamp pads (16 × 16, y 312-328) light one per word: the four defenders to come.
- 1.05: tag `SPECIAL DRIBBLE · No.10` (pixel font 10 px, lilac) slides in at y 342.
- **1.45: the beam blows.** The lamp at the top pops (a white bloom on the lens at (320, 0), r 60, 1 frame,
  local) and 30 `PK.Glass` glints rain down; beam, pool, face, title and pads drop to black in 2 frames
  (1.45-1.48), **except his two eyes**, which keep glowing (eyeGlow at 0.9) for 3 more frames and go out at
  1.55. Black to 1.60.

**VFX layers** (draw order): 1 black ground; 2 light rain; 3 drop beam (plum underlay 0.25, ivory body
≤ 0.22 additive, white-hot core ≤ 0.35, volt edges 6 px, 40 motes); 4 light splash + dust; 5 SoloFace ×8;
6 eyeGlow + cross glints; 7 word beams, title, Chorus copies; 8 pads + tag; 9 bulb pop + glass. Grade
`soloStage` with vignette 0.70.

**Rate.** `warp [[0.06, 0.05, 0.10]]` (motes and dust hang for 3 frames on the slam).

**Sound**

| t | sound |
|---|---|
| 0.00 | `stinger()` (the shared special-move signature) |
| 0.06 | `lampSlam(1.0)`; the lamp hum starts (`hum(true, 0.03)`) |
| 0.45 | `shing(1.2)` + `crashSwell(0.4, 0.12)` (a low swell under the glare) |
| 0.80 / 1.00 / 1.20 / 1.40 | `sticks(0.6)` + `stomp(0.45)` + `boom(0.3)` per word: the count-in, 1-2-3-4 |
| 1.00-1.60 | `crashSwell(0.6)` rising into the downbeat |
| 1.45 | `surge(0.5)` (the lamp blows: relay, zap, glass ticks); hum off |

**Cut.** Hard cut out of black onto STOMP 1 in the blazing stadium (g 1.6, the ONE of bar 1, **E2**).

### 2 · Lights out (2.8 s, g 1.6-4.4): the threat, the snap, eyes in the dark, the long shadow

**Story job.** Make the threat huge (four giants and a whole stadium stomping), then flip it with one gesture
kids can copy, then show his presence through the defenders' fear. Three setups, cut on the beat.

#### 2a · The wall (0.00-1.80)

**Camera.** Low over the shoulder, behind No.10's right shoulder, looking down the pitch at the wall:
`drawDownPitch` `{x 812, z 270, h 9, f 1000, horizon 228, cx 320}` with `towers [1,1,1,1]` (fully lit), lens
flares 90 px lilac-white on the two far lamps. Foreground (forced perspective): **No.10 SnapBack at SC 3.4**
in the left third, cropped at the waist by the frame bottom, the back of his head at (196, 120), back-lit
(dark, 2 px ivory rim). The wall 7 m beyond him, figures **170-200 px tall** (D, the Tower, 240 px), feet at y 300-318,
left to right A (300), D (395), B (470), C (545): as tall on screen as he is.
- 0.00-1.40: push 1.00 → 1.10 (inCubic) about (330, 190); punches +0.04 at 0.00 and 0.80 (outBack, 0.1 s);
  `cam.hit(0.4)` at 0.00, `cam.hit(0.55)` at 0.80, shakeAmp 14.
- **1.40-1.55: crash zoom 1.10 → 1.90** (inExpo) onto his raised hand at (205, 40), silhouetted against the
  far-left floodlight's glare.
- 1.62-1.74: snap back out 1.90 → 1.05 (outExpo) to watch the stadium die.

**Beats**
- **0.00 (g 1.6, ONE of bar 1): STOMP 1.** The wall lands RivalFront **RF3** in unison (they were in RF2 on
  the cut): dust rolls along the turf toward the lens (4 × 30 `dustBurst`), a flat shock (s 0.02, sy 0.3) at
  their feet; **the stands stomp with them** (the crowd sprite bobs 1 px, the boards flex). Their long shadows
  (from the floodlights behind them) reach across the turf toward us.
- 0.25 RF1 (the glare). 0.65 RF2 (load).
- **0.80 (g 2.4): STOMP 2**, 0.6 m closer; bigger dust and a second flat shock (s 0.025); their shadows lurch
  over his back (his rim dims).
- 0.95 **SB1**: his right arm rises out to the side and up, slowly. 1.30 **SB2**: arm straight up, fingers set.
  The crowd's stomp stops; a hush.
- 1.10 RF1.
- **1.60 (g 3.2, ONE of bar 2): THE SNAP** (**SB3**). A spark at the fingertips (`sparkle` r 16), 8 short lines
  of light rain falling from the hand (20-40 px), a small refraction shock (s 0.015) at the hand, CA 0.006,
  `cam.hit(0.3)`, punch +0.06.
- **1.65, 1.70, 1.75, 1.80 (32nds): the stadium blows out.** The four floodlight banks surge out in turn
  (far-left, far-right, near-left, near-right; the near pair are the roof banks at the top corners), each
  with `stage.surge(..., 'out')`: the 5 × 4 lamp cells pop in 0.08 s (1-frame white blinks, then dead), 60-120
  `PK.Glass` with gravity, a sparking cable (6 `'glass'` sparks per frame for 0.2 s), a smoke plume, the glow
  collapsing over 3 frames. Stage dim steps 0.30 → 0.55 → 0.75 → 0.92; the wall loses its rims and turns to
  plum silhouettes; the crowd's colour sinks. `cam.hit(0.15)` each.
- 1.80: cut on the fourth CHUNK.

#### 2b · Eyes in the dark (1.80-2.40)

**Camera.** Over D's right shoulder, low, looking back at No.10 7 m away: `drawUpPitch` `{x 930, z 252, h 13,
f 640, horizon 170, cx 320}`, stage dim **0.97 (uncapped, 0.6 s)**. D (the Tower, puppet `jockey` at 1.3x, ~370 px, facing −1,
`DEF_SIL` with a 1 px lilac rim from the phone lights) fills the right 35 % (x 430-640), cropped at the waist.
Creep 1.00 → 1.05 (linear); a nervous handheld drift (trauma floor 0.08).

**Beats**
- 1.80: total black, only D's faint rim.
- 1.85-2.00: the **phone-light sea** switches on in a wave across the dark stands (`drawPhoneLights` with
  `n` 300 and `wave`, left → right in 0.15 s): the stands become a starfield.
- **2.00 (g 3.6): DOOM.** The ball ignites on the turf at (250, 286): `drawBall` blacklight r 6 × 2.4 with
  `blaze` 1.0 (a 90 px violet halo over uvDeep). Something is glowing in the dark. D's head jerks back 4 px.
- **2.20 (g 3.8): DOOM.** **Two eyes open** 118 px above the ball (`eyeGlow`: 3 × 2 ivory cores, 18 px uv
  glow, a cross glint on each (vertical arm 40 px, horizontal 24 px), opening over 3 frames). His boots glow beside the ball (`fluoroMask`
  of Encore EN1 at SC 1.6, registered so its eyes sit on the glints); a 1 px lilac rim at 30 % hints at a
  boy-shaped hole in the dark. D's breath puffs (6 lilac particles at his mouth).
- 2.30: the eyes narrow (cores 3 × 2 → 4 × 1): the smirk.

#### 2c · The long shadow (2.40-2.80)

**Camera.** Back to the 2a OTS (`towers [0,0,0,0]`, zoom 1.05).
- **2.44-2.70: the crane-rush.** The camera chases the head of his shadow up and over the wall: x 812 → 872,
  h 9 → 45, f 1000 → 760, horizon 228 → 150 (inExpo, 0.26 s); radial 0.12 centred on the shadow's head;
  his own silhouette whips past the bottom-left edge at 2.47 (a foreground wipe); the flinching defenders'
  heads and raised forearms pass under the frame bottom (200-260 px) at 2.60-2.70.
- 2.70-2.80: micro-push +0.02, tremor trauma 0.3.

**Beats**
- **2.40 (g 4.0, beat 3): THE SLAM.** The footlight lamp behind the camera's left shoulder fires:
  1. beam impact **stage A** for 2 frames (2.400-2.433): cone apex at the bottom-left corner (UV 0.0, 1.0),
     axis (0.8, −0.6), half-angle 0.45 rad (**E3**);
  2. the four defenders are lit hard white from the front for the first time: **RF4** (forearm across the
     eyes, squinting, a half step back): they are scared;
  3. No.10 a black silhouette with a 2 px white-hot rim (SB3) at the left;
  4. **his shadow shoots 30 m down the pitch in 4 frames** (`longShadow`): along the turf from his feet,
     over the wall (a dark band climbs each body from the feet up in 0.05 s), up the goal net and onto the
     advertising boards and the first rows of the far stand;
  5. a flat shock (s 0.04, sy 0.3) at the shadow's head; 80 motes in the beam; CA 0.01; bloom 1.15;
     `cam.hit(0.8)`, shakeAmp 18.
- **2.70 (g 4.3): the eye-slits.** Two ivory glints open in the shadow's head on the far stand (`eyeGlow`
  narrow: 4 × 1 cores, cross glints with a 30 px vertical arm, a 1-frame sparkle at 2.72); the phone lights under the shadow's head go out.

**VFX layers.** 2a: lit `drawDownPitch` + lamp glare and flares; RivalFront back-lit (dark fronts, 2 px hot rims
additive 0.35) with long shadows toward us; dust rolls and flat shocks; SnapBack dark with an ivory rim; the
snap spark and light lines; the four surges (cells, glass, smoke, cables) and the dim steps. 2b: `drawUpPitch`
in void; the phone lights' wave (`drawPhoneLights`); D's silhouette; the ball's blaze; eyes, fluoro boots, the 30 % rim. 2c: dark
`drawDownPitch` + dim 0.90 outside the beam; the footlight beam (`stage.pillar` laid low from the bottom-left)
with motes; lit defenders; `longShadow` with climbing bands and eye-slits; No.10's rimmed silhouette; beam
impact A, radial, CA. Grades: `soloLit` (2a to 1.60), then `soloStage`.

**Rate.** `warp [[0.00, 0.05, 0.15], [0.80, 0.05, 0.15], [1.60, 0.05, 0.05], [2.40, 0.05, 0.10]]`.

**Sound**

| t | sound |
|---|---|
| 0.00 | `stomp(1.0)` + `crowdStomp(1)` (the stands stomp with the wall) + `crowd(2.0, 0.45)` |
| 0.80 | `stomp(1.15)` + `crowdStomp(1)` |
| 0.95-1.40 | `duck(0.7, 0.6)`: the crowd hushes as his arm rises; `whoosh(0.2, 300, 900)` (cloth) |
| 1.40 | `whoosh(0.15, 300, 1800)` (the crash zoom) |
| **1.60** | **`snap(1.0)`**, alone (the crowd ducked to 0.9 for 0.15 s) |
| 1.65 / 1.70 / 1.75 / 1.80 | `surge(0.9)` / `surge(1.0)` / `surge(1.1)` / `surge(1.3)`, each + `boom(0.4 / 0.45 / 0.5 / 0.6)`; `gasp(0.7)` at 1.68, then `duck(0.95, 0.6)` |
| 1.80-2.40 | silence: a faint `rumble(0.6, 0.06)` sub only |
| 2.00 | `warDrum(1.0)` + `boom(0.5)`; `cam.hit(0.2)` |
| 2.20 | `warDrum(1.05)` + `boom(0.6)` + `shing(0.8)`; `cam.hit(0.2)` |
| 2.20-2.40 | `crashSwell(0.2)` |
| **2.40** | **`lampSlam(1.4)` + `crash(0.8)`**; the lamp hum starts |
| 2.42 | `whoosh(0.28, 200, 1800)` (the rush) |
| 2.70 | `shing(0.9)` (eye-slits) + `gasp(0.4)` |

**Cut.** Hard cut on the beat (g 4.4) into the reverse worm's-eye.

### 3 · The stare (1.2 s, g 4.4-5.6): the monument

**Story job.** Awe. He owns the stage. SOLO's answer to ZENITH's power-up and CRESCENT's dolly zoom, ending on
the special's first ball close-up.

**Camera.** The reverse worm's-eye from the defenders' side: `drawUpPitch` `{x 900, z 262, h 2.5, f 560,
horizon 250, cx 320}` (eye 0.25 m, 6 m in front of him), stage dim 0.94, phone stars above. **The footlight
lamp is a white-hot disc** (r 34 + a 150 px glow) directly **behind his head** at (330, 95): his halo.
**14 hard god rays** (60-220 px) fan from it past him toward the lens, rotating 2°/s, flickering ±10 %.
No.10 **Encore EN1 at SC 2.8 (275 px)**, feet at (320, 352). Foreground: B's shoulder (left, x 0-140) and A's
legs (right, x 500-640) as out-of-focus black silhouettes (puppet renders box-filtered 2x, ~330 px tall,
lilac rims).
- **0.00-0.80: the arc round his body**, a 30° parallax orbit with one drawn view: the foreground silhouettes
  slide 160 px left (parallax 1.6), the halo slides 24 px and stays behind his head, the phone stars pan
  120 px (layers 0.4 / 0.7), the god rays rotate 6°; push 1.00 → 1.12 (inOutSine) about (320, 200).
- Punches +0.05 at 0.00, 0.40 and 0.80 (each war drum) with `cam.hit(0.3)`; a held tremor (trauma 0.22,
  shakeAmp 5): the ground hums.
- **0.80-1.08 (g 5.2): crash zoom 1.12 → 3.2** (inExpo, 0.28 s), the centre sliding from his chest (320, 200)
  to the ball (330, 338); radial 0.15 on the ball. **At 1.00** (zoom ≥ 2.4, under the blur) the sprite swaps to
  **MacroBoots MB6** at ×5 so the boot stays crisp: **the ball 108 px (r 54)** with his sole clamped on top.
- 1.08: punch +0.10, `cam.hit(0.5)`. **1.08-1.20: whip-pan right** (cam.x +420, inQuad, streak 0.07 with a
  sharp hole on the ball until it leaves).

**Beats**
- 0.00 (g 4.4): EN1 (chin down, eyes up under the brow, sole on the ball). **The Chorus line**: 3 crisp volt
  copies of EN1 behind him at ±14 / 28 / 42 px, alternating sides.
- EN1 / EN1b alternate every 0.2 s to 0.80 (the breath).
- **0.40 (g 4.8, ONE of bar 3): the fan steps out**: 5 copies at ±40 / 80 px (alpha 0.55, stepped fade), snapping
  back 6 px after 0.1 s, like a speaker cone on the kick; the eyes flare (`eyeGlow` narrow + cross glints, vertical arm 56 px);
  the halo flares +40 % for 2 frames.
- 0.60-0.80 (optional, only if RivalFearFace is drawn): a 0.2 s insert of D's face (FF1, drawn on the
  Tower's TF3 head), under-lit violet by the halo: pupils pin-pricked, a sweat bead, the gulp. Otherwise the shot plays straight.
- 0.80: the fan collapses into him (offsets to 0 over 2 frames) as the crash zoom starts.
- 1.00: MB6 swap. **1.08: the sole clamps**: the ball's panels turn 30°, turf flecks jump.

**VFX**
1. **Underlight**: the ball blazes (r 6 × 2.8, blaze 0.8, a 90 px volt glow over uvDeep); `underLight` lights
   his shins, knees and the underside of his chin; his front is in shadow (multiplied to 35 % with a uv tint);
   a 2-3 px white-hot rim on his hair and shoulders from the lamp behind.
2. His shadow runs toward the lens along the turf and swallows the foreground silhouettes' feet.
3. The Chorus (line, fan, collapse).
4. Turf flecks and dust hover in the beam (gravity −0.2 at rate 0.35); grass blades shiver 2 px on each drum.
5. God rays, halo, 40 motes.
6. The four unlit pads top-right from 0.00 (`fourCount`).
7. Crash zoom: radial 0.15, CA 0.01, 40 lines of light rain round the ball at 1.08 (no radial focus lines).
8. Grade `soloStage` (tint [232,224,255], bloom 1.05 / 0.66, vignette 0.75).

**Rate.** 0.35 on [0, 0.80) (the world nearly stops while the drums count), 1 after.

**Sound**

| t | sound |
|---|---|
| 0.00 | `warDrum(1.0)` (his drums begin) |
| 0.40 | `warDrum(1.1)` + `crash(0.5)` + `shing(1.2)` |
| 0.60 | (insert only) `breath(0.2, 0.15)`: the gulp (breath only; `tick()` is MERIDIAN's) |
| 0.80 | `warDrum(1.2)` + `whoosh(0.28, 200, 2400)` |
| 0.80-1.08 | a 16th `snare` roll, 0.3 → 0.9 |
| 1.08 | `rim(1.0)` + `kick(0.8)` + `whoosh(0.15)` into the whip |
| bed | `duck(0.85)` held (a held-breath murmur); the lamp hum |

**Cut.** Whip-pan right: a motion cut into the macro (g 5.6).

### 4 · Ignition (0.8 s, g 5.6-6.4): explosive acceleration

**Story job.** GO. The first violent hit by No.10 (35 % of the film), and the first time the roof follow-spot
finds him.

**Camera.** Macro side view at turf level (eye 0.1 m; camera south, looking north; he runs screen-right): the
turf line at y 300, **the ball r 35 (70 px)** at x 250, **MacroBoots at ×5** (boots and shins, ~260 px tall).
Behind: the dark stands as a blurred band (0.2x) with smeared phone lights (`macroSet`).
- 0.00-0.05: the whip from shot 3 lands (streak 0.05 → 0 over 3 frames).
- 0.10: punch +0.12, `cam.hit(0.8)`, shakeAmp 16.
- **0.18-0.21: left behind.** The ball and his boots blast out of frame to the right at 1800 px/s on screen;
  the camera holds still for 3 frames on the smoking gash and the falling sods.
- **0.21-0.43: whip-chase**: cam.x +900 (outExpo), streak 0.09 → 0 (sharp hole on the ball once it re-enters);
  the camera catches the ball and locks it at x 250 ± 10.
- **0.40-0.80: step-print** (`StepPrint`, 3 frames per print = 20 prints/s): foreground grass blades streak at
  2.6x parallax (1 px, 40-90 px long), the background a dark blur at 0.2x; punch +0.02 per touch.

**Beats**
- **0.00 (g 5.6, beat 3): MB1, the plant**: the left boot digs in, studs biting, toe twisting; 12 soil crumbs spit.
- **0.10 (g 5.7): CONTACT, MB2, the toe-poke burst.** The stack:
  1. beam impact **stage A** (0.100-0.133), cone apex (0.39, −0.05), axis (0, 1), half 0.32 rad: the roof
     follow-spot slams onto the ball as he goes (**E4**);
  2. the drop beam (`stage.pillar`) slams from the top (40 px → 260 px) with a light splash under the ball;
  3. `turfRip(1.2, lens)`: a 40 px divot flies at the lens, 24 sods, a soil spray, 40 blades;
  4. a **light gash** (3 claws, 120 px, 5 UV shafts 60-120 px pouring up);
  5. 2 flat shocks (s 0.05, 0.03; sy 0.3);
  6. light rain 60 lines for 0.15 s;
  7. CA 0.012, radial 0.08 on the ball;
  8. punch +0.12, `cam.hit(0.8)`.
- 0.18: MB2 held as it leaves, streaked.
- **0.40, 0.50, 0.60, 0.70: touches on 16ths**: MB3 (right, near) / MB3 mirrored (left, far boot at 70 %
  brightness), alternating; each a 6-sod spray, a crisp ball exposure (volt fill, ivory rim) and `cam.hit(0.15)`.
- On every print: one ball exposure (a chain of 4 discs behind the ball) and one crisp volt copy of the boots.
- **Ball**: 70 px, panels spinning with its speed, `blaze` 0.8.

**Rate.** `warp [[0.10, 0.08, 0.05], [0.18, 0.06, 2.0]]`.

**Sound**

| t | sound |
|---|---|
| 0.00 | `kickDrum(0.9)` + `scuff(0.3)` |
| **0.10** | **`kickDrum(1.2)` + `kick(1.0)` + `rip(1.2)` + `boom(1.0)` + `crack(0.6)` + `spotOn(0.8)`** |
| 0.12 | `gasp(0.5)` |
| 0.18 | `whoosh(0.3, 300, 3000)` |
| 0.40 / 0.50 / 0.60 / 0.70 | `tom(D3)` / `tom(C3)` / `tom(A2)` / `tom(F2)` + boot tok + `rip(0.35)` (a falling fill) |

**Cut.** Hard cut on the beat (g 6.4, the ONE of bar 4) to his front.

### 5 · Step-over: A (1.6 s, g 6.4-8.0): the first victim

**Story job.** The first one to step into his light is spun into the air, photographed there by the strobe
and slammed face-down. Kids gasp and learn the name of the skill.

**Camera.** Front retreating dolly, low: `drawUpPitch` `{x hero.x + 70, z 266, h 6, f 560, horizon 196, cx 320}`,
backpedalling at his speed; stage dim 0.94 with his pool (the roof spot from the top-centre). No.10 at
**SC 2.4 (235 px)**, feet at (320, 340). `beatCam2` keys:
- 0.00 track (zoom 1.00).
- 0.40 snap punch +0.15 (outExpo, 0.06 s); 0.40-0.60 drift 24 px right during the rest.
- **0.80 punch +0.16, `cam.hit(1.0)`, shakeAmp 20**; 0.96-1.06 truck-whip left 160 px (inOutQuad) after the
  ball, streak 0.05.
- 1.20 scale step 2.4 → 3 on the beat-snap (g 7.6), reframed on his chest.
- **1.40-1.60 whip-pan left 500 px** (inQuad), streak 0.05: motion cut.

**Beats**
- **0.00 (g 6.4, ONE of bar 4)**: FrontTouch FT1 (touch). **A bursts out of the dark** at screen-left (puppet
  ~255 px, facing +1, `jockey`), plum with a lilac rim; full colour as he crosses the pool edge at 0.25
  (4-frame crossfade).
- 0.14 StepOver F2; 0.27 F3 (the leg circles the ball). Tag `STEP-OVER` slides in at 0.40.
- **0.40 (g 6.8, beat 2): THE SELL** (F4, held to 0.60 at rate 0.08: the breath). His whole body drops to
  screen-right; `cam.hit(0.3)`. **The sell throw**: 3 crisp Chorus copies of F4 thrown 20 / 40 / 60 px to
  screen-right (alpha 0.55 / 0.4 / 0.25) + `fx.echo` 0.8 (dx +0.015, 4 frames, `echoR` 0.35 on him). **The beam lurches
  40 px right with them for 2 frames**: the light is fooled too. A bites: a full-stretch lunge to
  screen-right (`lungeCommit`), ankles crossing.
- 0.60 F5 (load). 0.70 F6 (push).
- **0.80 (g 7.2, beat 3): THE CUT** (F7): the outside of the right boot snaps the ball to screen-left at
  900 px/s. **THE CUT STACK** (11 layers on the same frame):
  1. hit-stop rate 0.03 for 0.16 s, then 2.2 for 0.10 s;
  2. beam impact **A** (0.800-0.833) then **B** (0.833-0.850), cone from the roof onto him (apex (0.5, −0.05),
     axis (0.12, 1), half 0.30) (**E5 / E6**);
  3. punch +0.16, `cam.hit(1.0)`, shakeAmp 20;
  4. a **light gash**: his plant foot rips 3 claws, 140 px, fanned to screen-left; 6 UV shafts 60-120 px;
  5. `turfRip(1.5, lens)`: 24 sods, 60 crumbs, 80 blades at the lens and to the left; 2 divots (40 px) tumble
     past the lens;
  6. 2 flat refraction shocks at the boot (s 0.06, 0.035; sy 0.3);
  7. light rain, 90 lines for 0.2 s round him;
  8. CA 0.014, radial 0.10;
  9. the ball's strobe chain: 6 crisp exposures + a 30 px uv speed streak;
  10. 2 Chorus copies of F7 along the cut;
  11. bloom 1.15 for 0.2 s.
- **0.85-0.95: A is destroyed.** His crossed ankles give: he corkscrews 270° and leaves the ground (`corkscrew`,
  spin 0 → 1.5π over 0.15 s, hip +40 px), arms flung, a spiral of grass and dust off him.
- **0.95 (g 7.35): the strobe fires on A**: a local flash-bulb pop (radius 90 px, 3 frames) at his chest leaves
  his **neon print** hanging 40 px in the air mid-corkscrew (it stays until the relight), while A himself
  finishes the corkscrew in real time and **slams face-down** on the turf under it (0.95-1.15: a sod burst,
  a dust puff; `faceDown`).
- 0.85 Break BR1 · 1.00 BR2 · 1.15 BR3 · 1.30 BR2 · 1.45 BR3 (front, bursting to screen-left and toward the
  lens); each stride rips a 2-claw gash (60 px, 3 shafts) and a 6-sod spray.
- **1.05-1.30: he outruns his own light.** The beam lags (operator lag 0.12 s here); at 1.15 he is out of its
  pool, lit only by his Chorus and the gash light; at 1.25 the beam whips 120 px to catch him (motes smeared
  along the whip) and slams back on with a light splash.
- **1.20 (g 7.6, beat 4): TROPHY 1**: a narrow white spot CLANKs on over print A and his body (`stage.trophy`); **OLÉ! 1**;
  pad 1 lights.
- **Ball**: dead still under the step-over (its stillness sells the fake), snapped at 0.80, glued to the right
  boot's ball anchor from 0.95.

**Rate.** `warp [[0.40, 0.20, 0.08], [0.80, 0.16, 0.03], [0.96, 0.10, 2.2]]`.

**Sound**

| t | sound |
|---|---|
| 0.00 | `kickDrum(0.8)` + `tom(A2)` + boot tok |
| 0.14 / 0.27 | `hat()` / `hat(true)` + `whoosh(0.15, 300, 900)` (cloth) |
| 0.40 | `snare(1.0)` + `kickDrum(0.8)` + `whoosh(0.2, 300, 1600, 0.5, +0.6)`; then the rest: `crashSwell(0.2, 0.15)` under the hum |
| **0.80** | **`snare(1.4)` + `crack(0.8)` + `boom(1.2)` + `kick(1.2)` + `rip(1.0)` + `crash(0.8)`** |
| 0.85 / 0.95 / 1.05 / 1.15 | 16th toms C3 / A2 / F2 / D2, each + `rip(0.35)` |
| 0.95 | `strobeZap(1.0)` |
| 1.15 | `boom(0.5)` + `scuff(0.6)` (A hits the turf under his print) |
| 1.20 | `exhibit(1.0)` + `ole(1)` + `crowdStomp(2)` (the stands now stomp for him) |
| 1.25 | `whoosh(0.12)` + `spotOn(0.5)` (the beam whips back onto him) |
| 1.40 | `whoosh(0.3, 300, 2000, 0.5, −0.6)` |

**Cut.** Whip-pan left: motion cut onto the ONE of bar 5 (g 8.0).

### 6 · Over the slide: B (2.4 s, g 8.0-10.4): danger, the breath, the release

**Story job.** The real threat (studs first, out of the dark) and the film's breath. v1's best shot, made
enormous: the ball at 79-96 px, a frozen tableau, then a release that peels the pitch.

#### 6a · Sole on (0.00-0.30)

**Camera.** Side view at boot height (`drawFieldBackdrop`, camera south looking north; stage dim 0.94 with his
pool): No.10 **SoleLift at SC 3** (294 px if whole), **zoom 2.2** framed on the boot and the ball: **the ball
79 px** at (300, 300). B's studs slide into the right edge out of the dark (RivalSlide S1 → S2 at SC 3, only
his boots and shins in frame, plum with a lilac rim), ploughing a **dark furrow** (no light in it) that throws
grass and soil at the lens.

**Beats**
- **0.00 (g 8.0, ONE of bar 5): SOLE ON** (F3): the sole lands on top of the ball and it stops dead (squash 8 %
  for 2 frames); a light splash under the sole (rx 40 → 120); the turf dents; a flat shock (s 0.02, sy 0.3);
  `cam.hit(0.4)`.
- 0.10 F4 DRAG. 0.20 F5 SCOOP.

#### 6b · The ride-up (0.30-0.80)

- 0.30-0.40: pull out 2.2 → 1.15 (outCubic).
- **0.40 (g 8.4, beat 2): FLICK** (F6): the ball leaps off the laces, vy 910 px/s at ×3 (gravity 1648 px/s²),
  **apex 250 px above the turf (1.4 m)**, at his eye line once he is up. Strobe-chain exposures are dropped
  every 1/40 s of sim time (they bunch toward the apex like a real strobe photograph). Tag `SOLE LIFT`.
- 0.40-0.75: **the camera rides up with the ball**: tilt up 40 px, zoom 1.15 → 1.00 (outQuad), the ball kept
  near the centre line.
- **0.60 (g 8.6): THE HURDLE** (F7 → F8, or F8h if drawn): he leaps over the slide like a hurdler; his pelvis
  rises 60 px on a hop arc; B's slide arrives under him (S2, then S2c "tip back" at 0.80).
- 0.60-0.80: rate 1 → 0.3 (inQuad).

#### 6c · The breath (0.80-1.60)

- **0.80 (g 8.8, beat 3): THE CHOKE.** Rate 0.03, held to 1.60. The tableau: No.10 tucked at the top of his hop
  (F8b), eyes on the ball; the ball at its apex near his eye line at the top of a **strobe chain of 9 crisp
  exposures** arcing up from his laces; B's studs **8 px under his trailing boot**, B's face tipped back in
  horror (S2c); the sods, soil and blades from B's furrow frozen in the air; motes frozen as points; the beam
  straight overhead (the hottest pool in the film); dim 0.94 outside.
- **0.80-1.20: the frozen parallax slide**: the camera trucks 140 px right relative to the frozen tableau and
  pushes 1.00 → 1.10 (inOutSine): the frozen foreground chunks sweep past the lens at 2.4x, B slides out from
  under him at 1.3x, the stands at 0.2x. (A slide, never an orbit: GALE owns the frozen orbit.)
- **1.20 (g 9.2, beat 4): HARD CUT TO THE FRONT, the money frame** (1.20-1.60). The camera east of him, low:
  `drawUpPitch` `{x 975, z 286, h 5, f 560, horizon 230, cx 320}`; slow push 1.00 → 1.06 (inOutSine), no shake.
  - **HurdleFront HF1 at SC 2.4** mid-air, centred (330, 230): knees tucked, arms flung wide, eyes up at the ball.
  - **The ball at 96 px** (r 48: hero-ball scale 1.6x, allowed because no boot touches it in this frame) at
    (300, 92), nearest the lens, blazing (`blaze` 1.0, bloom 1.25 on it), its panels still turning (1 rad/s):
    the ball is alive.
  - The strobe chain arcs from his laces up toward the lens, its exposures growing 20 → 80 px.
  - B in the bottom-right foreground: an out-of-focus dark mass (code silhouette: head and shoulders,
    box-filtered 2x, lilac rim) with his two studs-up boot soles (dark soles, ivory stud dots) just under
    No.10's trailing boot; frozen sods fanned round them.
  - The roof beam's white-hot core straight above him; a lilac `lensFlare` from the lamp at 1.25.
- **1.60 (g 9.6, ONE of bar 6): THE RELEASE.** Hard cut back to the side (zoom 1.0, his pelvis at x 300).
  **THE RELEASE STACK:**
  1. rate 2.0 for 0.12 s, then 1;
  2. beam impact **A** (1.600-1.633) + **B** (1.633-1.650), cone from the roof onto both of them (**E7 / E8**);
  3. punch +0.18, `cam.hit(1.0)`, shakeAmp 20; whip right with him: x +320 in 0.15 s;
  4. 2 flat shocks (s 0.065, 0.04; sy 0.3);
  5. light rain 100;
  6. CA 0.012, radial 0.12, bloom 1.15;
  7. `fx.echo` 0.5 (dx +0.012, 4 frames);
  8. **B slides on through under him and his studs bite and PEEL A 3 m SOD CARPET** off the pitch (`sodCarpet`,
     1.60-1.95), rolled up behind him soil side up, ultraviolet light leaking out of the bare strip; the slide
     throws him into a corkscrew spin (RivalSlide S4, or `slideSpin` + spin);
  9. turf rains back down for 0.5 s;
  10. the ball's 9-exposure chain fades on the grid;
  11. the landing gash (below).
- 1.75: F10 LAND; his left boot plants and **rips a 3-claw gash** with shafts; `cam.hit(0.3)`.
- **1.80 (g 9.8): the strobe fires on B**: the pop prints him mid-spin 30 px off the ground above his own sod
  carpet (print 2), and his body spins on in real time into a double tumble off the end of the carpet, landing
  on his back (`sprawl`) at 2.10.
- **2.00 (g 10.0, beat 2): CUSHION** (F11): the ball drops onto his raised instep and dies there (re-solve the
  release so the catch lands exactly on 2.00). **TROPHY 2** clanks on over B's print and B; **OLÉ! 2**; pad 2.
- 2.05-2.20: Dribble F2-F4 (side), away. **2.20-2.40: whip-pan right** (streak 0.05).
- **Ball**: stopped dead, dragged, scooped, flicked to 1.4 m, frozen in the beam, cushioned dead on the instep.
  Its plum shadow on the pool shrinks as it rises (the light is above, so the shadow shows the height).

**VFX layers.** 1 side stage + pool; 2 SoleLift at ×3 and the blacklight ball (r up to 48, rasterised per
integer radius); 3 B's dark furrow and spray; 4 light splash under the sole; 5 strobe chain (9) and his
Chorus copies of F5, F6, F7 on the hop path; 6 frozen 2.5D particles (sods, soil, blades, dust) on 3 parallax
depths; 7 the beam overhead; 8 the front money frame (HF1, 96 px ball, B's code silhouette); 9 the release
stack; 10 the sod carpet with UV leak; 11 B's spin, pop, print and tumble; 12 landing gash; 13 whip streak.

**Rate.** `warp [[0.00, 0.06, 0.10]]`; 1 → 0.3 over [0.60, 0.80) (inQuad); `[0.80, 0.80, 0.03]`;
`[1.60, 0.12, 2.0]`.

**Sound**

| t | sound |
|---|---|
| 0.00 | `rim(1.0)` + `kickDrum(0.6)` + `boom(0.4)` (the THUNK); `scrape(1.6, 0.35)` + `rip(0.5)` under B's slide |
| 0.10 / 0.20 | `snare(0.3)` ghost / `hat()` |
| 0.40 | `tom(C3)` + `kick(0.5)` + `whoosh(0.3, 300, 2000)` rising with the ball |
| 0.60 | `kickDrum(0.9)` + `crash(0.6)` + `gasp(0.6)` |
| **0.80** | **`choke()`**; `duck(0.95, 0.8)`; silence but the lamp hum; `crashSwell(0.8, 0.25)` rising under it |
| 1.20 | `shing(1.4)` (the money frame) |
| **1.60** | **`snare(1.3)` + `crack(1.0)` + `boom(1.3)` + `kick(1.2)` + `crash(1.0)` + `whoosh(0.2, 400, 2400)`** |
| 1.62 | `rip(1.4)` (the sod carpet) |
| 1.75 | `rip(0.6)` + `scuff()` (landing) |
| 1.80 | `strobeZap(1.0)` |
| 2.00 | `tom(A2)` + tok + `kickDrum(0.8)`; `exhibit(1.0)` + `ole(2)` + `roar(0.8, 0.35)` + `crowdStomp(2)` |
| 2.10 | `boom(0.5)` (B lands on his back) |
| 2.20 | `whoosh(0.2)` |

**Cut.** Whip-pan right: motion cut into the glue cam (g 10.4).

### 7 · Elastico: C (1.6 s, g 10.4-12.0): THE BALL SHOWCASE

**Story job.** The ball is the star. The camera is glued to it at turf level while the world whips round it;
the elastico (invisible in v1) becomes readable and violent. C is fooled so badly he splits and topples, printed in neon mid-split.

#### 7a · The glue cam (0.00-1.05)

**Camera** (`gluecam`, faked in screen space; no `pitch3D`). Turf level (eye 0.15 m), locked 1.2 m from the
ball, heading 30° off his running line (front-right three-quarter). **The ball holds at r 52 (104 px) at
(320, 290) for the whole ride.** His boots and shins (**MacroBoots at ×4**, ~180 px) step in round it, his
shorts hem at the top edge. The turf (stripe bands and lilac fluorescent line segments in a ground frame) flows
past at 6.5 m/s and turns with the fake yaw ψ; the stands are a dark band at 0.2x with phone lights, sliding
8 px per degree of ψ. MacroBoots are side-view drawings; at 30° off and macro scale the cheat does not read.
- 0.00-0.05: opens out of the whip (streak 0.05 → 0).
- 0.00-0.40: the ride; the touches on the 8ths keep the ball dead centre while the world rushes.
- **0.40 (g 10.8, beat 4): THE SHOW**: ψ +35° in 0.08 s (outQuad): the world whips left, the ball stays
  centred; streak 0.06 along the tangent.
- 0.45-0.70: the rest (rate 0.06).
- **0.80 (g 11.2, ONE of bar 7): THE SNAP**: **ψ −70° in 0.06 s**; streak **0.10** along the tangent (the whole
  world smears, the ball sharp inside the hole, R 0.12); punch +0.14, `cam.hit(0.9)`, shakeAmp 16.
- 0.86-1.05: ψ eases −35° → −20°; the flow continues.

**Beats**
- 0.00 MB3 inside touch (right); 0.20 MB3 mirrored (left). Hats on the 16ths.
- 0.20: **C** appears in the background: a dark figure sprinting in from screen-right, growing (puppet
  silhouette, lilac rim), full colour as he enters the pool at 0.35.
- **0.40: MB4, the outside push** (the show): the ball rolls out on the boot's outside edge. Tag `ELASTICO`.
  C lunges at the shown ball: his planting boot and shin enter from the right at 0.55 as an out-of-focus
  foreground block (the puppet's leg rendered at ×8, box-filtered 2x).
- 0.70: the wrap (MB4 rolling round the ball); **0.767: the wrap smear** (2 frames, a volt-tinted streak of MB5).
- **0.80: MB5, the inside snap**: the inside of the boot whips the ball back. **THE SNAP STACK:**
  1. rate 0.03 for 0.08 s, then 1.8 for 0.08 s;
  2. beam impact **A** (0.800-0.833) + **B** (0.833-0.850), cone from the roof onto the ball (apex (0.5, −0.05),
     axis (0, 1), half 0.28) (**E9 / E10**);
  3. punch +0.14, `cam.hit(0.9)`, shakeAmp 16;
  4. the pivot boot twists a **spiral divot** into the turf (torn blades swirled, 3 UV shafts);
  5. `turfRip(1.3, lens)` at the apex of the V;
  6. 2 flat shocks (s 0.05, 0.03; sy 0.3);
  7. light rain 60;
  8. CA 0.014;
  9. **the Elastico V**: 12 crisp ball exposures laid on the turf along the hairpin (out, round the turn,
     back), 320 px wide in the reveal; in the ride they smear past with the world;
  10. a Chorus copy of the boot (MB4) left at the turn;
  11. bloom 1.1 for 0.15 s.
- 0.80-0.95: C's lunge finds only light: his boots shoot apart into a full side split and **rip two furrows**.
  **0.95 (g 11.35): the strobe fires on C** (local pop): it leaves **print 3**, the split with the arms flung
  up, hanging where he was, while his body topples out of the split onto his side in real time (0.95-1.15,
  `sideTopple`); we see him pass the right edge as a falling dark shape under a neon one.
- 1.00: MB3 touch (left).

#### 7b · The reveal (1.05-1.60)

**Camera.** Hard cut on the 16th (g 11.45) to a high front three-quarter: `drawUpPitch` `{x 1060, z 262, h 30,
f 560, horizon 120, cx 320}` (eye 3 m, 7 m east of C, looking west and down); push 1.00 → 1.06.

**Beats**
- No.10 bursts toward the lens and screen-right (**Break west strip** BR2 / BR3 on 8ths, SC 2.4 → 3 at 1.20),
  leaving C behind.
- **C's print** in the side split left of centre (neon, arms up), in the picture plane, hanging over C's body
  on its side; the **glowing V** torn
  into the turf between them (12 exposures as fading discs, two 45 px gouges, the spiral divot and its shafts).
- In the right foreground, **D's back-lit silhouette** (the Tower: the armband catching the rim), waiting
  (the gate to come), cropped at the frame edge.
- **1.20 (g 11.6, beat 2): TROPHY 3** clanks on over C's print and C; **OLÉ! 3**; pad 3.
- **1.40-1.60: the chorus wipe**: crisp volt copies of his Break west frame at scales 3, 4, 5 and 6, dropped on
  the 16ths (1.40, 1.45, 1.50, 1.55: 32nds), sweeping left to right with speed lines; at most 50 % of the frame
  covered on any frame (not a flash). Cut at 1.60 under the last copy.

**VFX layers.** 7a: glue-cam ground + stands band; ball r 52 with blaze, spin and turf spit; MacroBoots ×4;
C's background figure and foreground leg block; the snap stack; tangent streak. 7b: dark `drawUpPitch` + pool;
the V decals and shafts; C's print, body and trophy spot; Break west; D's (the Tower's) foreground silhouette; the chorus wipe.

**Rate.** `warp [[0.45, 0.25, 0.06], [0.80, 0.08, 0.03], [0.88, 0.08, 1.8]]`.

**Sound**

| t | sound |
|---|---|
| 0.00 / 0.20 | `tom(D3)` + tok / `tom(C3)` + tok; `hat()` on the 16ths |
| 0.40 | `snare(0.9)` + `rim(1.0)` + `whoosh(0.12, 400, 2000, 0.4, +0.6)` (the show); then the rest: the hum + `crashSwell(0.3, 0.15)` |
| **0.80** | **`snare(1.2)` + `crack(0.9)` + `crash(1.0)` + `kickDrum(1.2)` + `boom(1.2)` + `rip(1.3)` + `whoosh(0.12, 600, 3000, 0.5)` panned right → left** |
| 0.85 | `scrape(0.4, 0.3)` (C's boots splitting the turf) |
| 0.95 | `strobeZap(0.9)` |
| 1.05 | `whoosh(0.2)` |
| 1.15 | `boom(0.45)` (C hits the turf) |
| 1.20 | `exhibit(1.0)` + `ole(3)` + `crowdStomp(3)` |
| 1.20-1.40 | 16th tom fill D3 C3 A2 F2 |
| 1.40 | `whoosh(0.25, 300, 1800)` panned left → right (the wipe) |

**Cut.** The chorus wipe onto the gate (g 12.0).

### 8 · Nutmeg: D (1.6 s, g 12.0-13.6): the false defeat, the crack, the front ride

**Story job.** The struggle. The biggest defender swallows him; the screen goes black and silent; kids gasp.
Then the ball cracks out through his legs in a burst of light, his knees buckle, and we ride in front of
it: the ball rushing at the lens with No.10 behind it.

#### 8a · The gate (0.00-0.86)

**Camera.** Low behind D (eye 0.4 m), looking west up the pitch: `drawUpPitch` `{x 1032, z 262, h 4, f 560,
horizon 180, cx 320}`, dim 0.94. D a back-lit silhouette, legs spread in a wide block (`wideBlock`, the Tower at
1.3x, ~390 px): his legs rise from the frame's bottom corners to y ≈ 150, his arms spread to the edges: **the gate**.
Beyond it No.10 (FrontTouch → Nutmeg F2-F4, front, SC 1.6 → 2.0 at 0.40) charges at us in his pool; the spot
behind him paints lilac rims on D's legs. Push 1.00 → 1.10.

**Beats**
- 0.00 (g 12.0, beat 3): opens out of the wipe; FT1 touch.
- 0.20: D sinks wider (legs +10 %); Nutmeg F2 (the shoulder dip). Tag `NUTMEG`.
- 0.30: Nutmeg F3 (the set).
- **0.40 (g 12.4, beat 4): D SMOTHERS HIM.** His torso folds down over the lens (`smother`: torso 0 → 95° in
  0.12 s, inExpo, arms spread down); his back fills the frame: **BLACK**. `cam.hit(0.5)` as he lands on us.
- 0.40-0.80: black (dim 0.97 + D's back), a 1 px lilac rim along D's back at the top. At 0.62 a sliver of
  light grows at the bottom centre between his boots (12 → 60 px wide, ivory core). Kids: *"Nooo, he got him!"*
- **0.80 (g 12.8, ONE of bar 8): CRACK.** The toe-poke (MB2 as a black silhouette in the gap: heard, then seen).
  **Light bursts through the gap between D's legs:**
  1. rate 0.03 for 0.06 s, then 1.4 for 0.20 s;
  2. beam impact **A** (0.800-0.833) with the cone apex at the gap (0.5, 0.88), axis (0, −1), half 0.9 rad:
     a wide fan of violet and white-hot light out of the gap; D's legs, outside it, stay black (**E11**);
  3. 12 god rays from the gap (additive 0.5);
  4. **the ball blasts out of the light at the lens: r 10 → 60 (20 → 120 px) in 3 frames**, blazing;
  5. `cam.hit(0.9)`, shakeAmp 20; CA 0.014; radial 0.25 on the gap; 40 speed streaks (ivory and volt);
  6. a flat shock (s 0.06, sy 0.3) at the gap;
  7. **D's knees buckle inward** as the light bursts through the gap (`kneeBuckle`, a 2-frame puppet leg pose:
     0.80 the knees snap in toward each other, 0.83 they fold and his weight drops 8 px): the gate collapses
     round the light, and his topple over C begins.
- 0.86 (g 12.86): the ball fills the bottom-right and passes the lens: **hard cut on the pass**.

#### 8b · The front ride (0.86-1.60)

**Camera.** A **front retreating ride at turf level**, ahead of the ball and looking west back at him (so it
never repeats GALE v2 shot 6c's chase POV behind the ball): `drawUpPitch` `{x ball.x + 6.0 → 5.2, z ball.z,
h 1, f 240, horizon 180, tilt −0.50, cx 320}` (eye 0.1 m; a wide lens tilted 29° up with the shared pitch-only
tilt, so the horizon sits at y 311), travelling east with the ball at 7 m/s (ball x 1016 → 1066) and losing
8 cm of the gap over the ride, so the ball creeps at the lens. Stage dim 0.92 with his pool travelling with
him; the fluorescent box lines (`drawPitchLines`, lilac additive) stream toward the lens in the turf band under
the horizon; the far stand's phone lights make a band behind his knees, the dark bowl rises at both edges. The
keeper is behind the camera: **never in frame**. Trauma 0.2 → 0.6 over 1.30-1.55.

**Computed picture** (`projectDecal` with the tilt): the ball centre at (320, 306), **r 50 → 57 (100 → 114 px;
108 at 1.30)**, its contact patch on the bottom edge; No.10 0.4 m behind it: crown y ≈ 36 → 25, face y ≈ 52 → 41,
hips y ≈ 128; D (1.3x) 3.4 m behind the ball at 1.10, his print's chest at (253, 253), about 137 px tall, just
past No.10's right side (screen-left); C on the turf beyond at x ≈ 220.

**Beats**
- **The ball** dead centre in the foreground, rushing at the lens: its spin locked to its speed, uv spin streaks,
  a 300 px blacklight halo (`blaze` 1.0) whose light comes up under him: `underLight` from the ball lights his
  shins, knees, the underside of his chin and his cheekbones violet-white, his eyes in the shadow of his brow,
  his front otherwise dark (35 % with a uv tint); the roof spot behind him rims his hair and shoulders.
- No.10: **Break BR2 / BR3 (front) at SC 3** (294 px), alternating on the 8ths, crown at y ≈ 32, his body behind
  the ball; his near boots and shins are a **forced-perspective macro layer** over his legs (MacroBoots ×4,
  ~140 px): the wide lens makes the near parts bigger, and the layering is that distortion, never a smear.
- **His boots strike it on the 8ths, from behind**: 1.00 (g 13.0) the right boot (MB3 ×4, screen-left: his
  right), turned out so its inside meets the back of the ball; 1.20 (g 13.2) the left (MB3 mirrored,
  screen-right); 1.40 (g 13.4) the right. The ball is drawn over the boot it touches (the front-view rule). Each
  tap jolts the ball toward the lens (r +2 for 2 frames), throws a `turfRip(0.4, lens)` spray and volt spark
  flecks (`sparks` 'uv') at the lens, tears a small tap gash in the turf band, `cam.hit(0.15)`.
- 0.86-1.10: behind him, past his right side, D's knees have gone and he topples forward over C's leg.
- **1.10 (g 13.1): the strobe fires on D behind him**: a local pop (radius 90 px, 3 frames) at (253, 253) leaves
  D's print hanging there (print 4) and **lights No.10 from behind**: a 2 px white-hot rim (`rimLight`) down his
  left edge (screen-left) and through his hair, and **his shadow and the ball's shoot 120 px at the lens** along
  the turf band (2 frames, local); a dust plume drifts in at the bottom edge. D's body pitches on over C's leg and
  lands on his back behind No.10's legs by 1.40.
- **1.20 (g 13.2, beat 2): TROPHY 4** (the double CLANK) over D's print behind him; all four pads flare; **OLÉ! 4**,
  the loudest.
- 1.30-1.55: the turf band's flecks and line segments stream faster out of the bottom edge (60 flecks); the 32nd
  roll.
- **1.50-1.60: his right sole descends** onto the crown of the ball from above (MB6 ×4, the boot turned across
  the ball, its side and studs to the lens): **match cut on the descending sole**.

**VFX layers.** 8a: dark `drawUpPitch` + his pool; D's arch with lilac rims; Nutmeg front at SC 1.6-2.0; the
smother; the black and its rim; the sliver; the crack stack (beam fan, god rays, the ball at the lens, speed
streaks, radial); D's knees buckling. 8b: dark `drawUpPitch` (tilt −0.50) + travelling pool + fluorescent lines
streaming at the lens; No.10 (Break at SC 3) with `underLight` from the ball and the pop's `rimLight`; the
MacroBoots ×4 layer; the 100-114 px ball with halo and spin streaks; turf sprays and tap gashes; D's topple, pop,
print and back-light; the two shadows at the lens; streaming flecks.

**Rate.** `warp [[0.80, 0.06, 0.03], [0.86, 0.20, 1.4]]`.

**Sound**

| t | sound |
|---|---|
| 0.00 | `tom(F2)` + tok |
| 0.10 / 0.20 / 0.30 | a 16th `snare` crescendo 0.3 / 0.5 / 0.7 |
| **0.40** | **`choke()`**; `gasp(0.8)` cut short by `duck(0.95, 0.4)`; `boom(0.5)` (D lands on us) |
| 0.40-0.80 | silence: only the lamp hum |
| 0.60 / 0.70 | `sticks(0.4)`: tk ... tk (he is still in there) |
| **0.80** | **`kick(1.2)` + `crack(1.0)` + `boom(1.3)` + `kickDrum(1.2)` + `crash(1.0)` + `whoosh(0.3, 200, 3000)`**; `crowd(2.0, 0.6)` bursts back |
| 0.86 | `whoosh(0.2, 600, 2400, 0.5)` panned left → right (past the lens) |
| 1.00 / 1.20 / 1.40 | `tom(D3)` / `tom(C3)` / `tom(A2)` + tok + `rip(0.4)` |
| 1.10 | `boom(1.0)` + `crack(0.5)` + `strobeZap(0.8)` + `gasp(0.6)` (D's pop behind him; the gasp rises into the OLÉ) |
| 1.20 | `exhibit(1.1)` twice (10 ms apart) + `ole(4)` + `roar(1.2, 0.5)` |
| 1.40 | `boom(0.6)` (D lands on his back behind him) |
| 1.30-1.60 | a 32nd `snare` roll 0.3 → 1.0 |

**Cut.** Match cut on the descending sole into the stop (g 13.6).

### 9 · Curtain call (2.8 s, g 13.6-16.4): the stop, the constellation, the cue

**Story job.** The victory. He stops dead, the camera shows what he did, and then he cues the crowd he has won
over: their stomp on his beat makes the stadium answer him. The loudest, biggest frame of the film.

#### 9a · The stop (0.00-0.10)

**Camera.** Low side macro: Settle F2 at SC 3, zoom 2.0: **the ball 72 px** on the penalty spot, which glows
lilac under it; the twin brake rips behind his heels already torn.

- **0.00 (g 13.6, beat 3): SOLE STOP.** The sole slams onto the ball and it stops dead: rate 0.03 for 0.10 s;
  beam impact **B only** (1 frame: the cut-out, **E12**); a flat shock (s 0.05, sy 0.3); light rain 50; a dust
  ring; a 4-point crack star in the spot mark; `cam.hit(0.8)`.
- Sound: `kickDrum(1.2)` + `crash(1.0)` + `boom(1.1)`, then **`choke()` at 0.06**: silence; `duck(0.95, 1.5)`;
  only the lamp hum.

#### 9b · The constellation (0.10-1.20)

**Camera.** Hard cut (g 13.7) to the crane on `drawDownPitch` with **the shared pitch-only tilt**
(`DownPitchView.tilt`, MERIDIAN v2's build item), in silence, from behind and above him: x 1040 → 780 (pull back
26 m), z 262, h 6 → 220 (22 m up), f 560 → 470, horizon (principal point y) 140 → 180, **tilt 0 → 0.80 rad**
(46° down), inOutCubic over 0.10-0.90; hold 0.90-1.00; **1.00-1.20 the whip-tilt**: tilt 0.80 → 0.10 in 0.2 s
(inCubic; the route slides off the bottom of the frame, the horizon drops in to y 133 and the far stand's dark
roofline to y ≈ 106 under the streak), vertical streak 0.06 along (0, 1): motion cut. Through the rise the far
stand fills the top of the frame and the horizon leaves it by u ≈ 0.4: no sky in any frame.

**The end key, computed** (x 780, z 262, h 220, f 470, principal point y 180, tilt 0.80; `projectDecal` with the
tilt): the ignition gash at y ≈ 424 (just below the frame), A's print y ≈ 322, B's ≈ 294, C's ≈ 184, D's ≈ 171
(each body a few px from its print), **the mark (No.10) y ≈ 108**, the keeper y ≈ 40, all within x 304-376.
Figures are drawn at their projected scale (s 1.55-2.02): the defenders 28-37 px tall (D, at 1.3x, about 37),
No.10 24 px. (A level pinhole at that eye cannot frame the route: with horizon −30 the prints sat 46-63° below
the horizon, at y 436-876, and only the mark and the keeper were in frame.)

**What it reveals** (everything placed with `projectDecal`): the dark pitch with **the torn route glowing**
(volt cores, shafts dimmed by age, B's dark furrow and the bare UV strip of the sod carpet) zigzagging up the
frame from the bottom edge; **the four neon prints** hanging along it in their trophy spots, **each over the
defender's body on the turf**: A's corkscrew 0.4 m up over A face-down, B's spin over B on his back at the end of
his rolled sod carpet, C's split over C on his side, D's forward topple over D sprawled past C's leg (spots 3 and
4 overlap); at the head of the trail **No.10 in his own pool on the penalty spot**, ball under his sole (Settle
F3, a 0.25x box-filtered cache, 24 px, in a hot pool rx 40); the keeper dark and small on his line at the top of
the frame; phone lights twinkling round the bowl. Kids read it at a glance: *the trail of everyone he beat, each
one lying under his own photograph.*

- **0.80 (g 14.4, ONE of bar 9): the keeper's spot SLAMS on** (a drop beam from the main stand roof onto the
  goal line, a light splash, a flat shock s 0.02; no flash; `cam.hit(0.3)`). Two pools on a dark pitch: **the duel**.
- Sound: silence; an awed `ooh(0.5)` rising 0.30-0.80; **`lampSlam(0.9)` + `boom(0.6)` at 0.80** (a second lamp
  hum joins); `crashSwell(0.3)` 0.90-1.20.

#### 9c · The cue (1.20-2.80)

**Camera.** Over the keeper's right shoulder, low, telephoto, from just inside the goal mouth: `drawUpPitch`
`{x 1186, z 250, h 15, f 900, horizon 205, cx 320}` (0.6 m behind the goal line, so the keeper lands on his line
in front of the lens). The keeper's back (**KeeperBack K1 at SC 4**, box-filtered 2x: out of focus) fills the
left 30 %, cut at mid-back, a lilac rim from his own spot, a glove at the edge trembling ±1 px. No.10 12 m away
at centre-right in his pool on the spot, facing us (**Encore at SC 2.2**, 216 px), ball under his sole; far
behind him the route glowing faintly and the four prints hanging over the four bodies; the dark far stand above
him with its phone lights; the floodlight towers dark (`towers [0,0,0,0]`).
- 1.20-1.60: push 1.00 → 1.08.
- **1.60: `cam.hit(1.0)`, shakeAmp 18; the kick-back pull-out 1.08 → 0.92** (outExpo, 0.4 s) so the whole
  relit stadium enters the frame.
- 1.62-1.85: the keeper is thrown back at the lens: his K2 back swells to SC 4.6 across the left 40 %, then
  drops to the bottom-left as he lands; **1.85: `cam.hit(0.5)`** on his landing.
- 1.90-2.20: slow rise 20 px.

**Beats**
- 1.20 (g 14.8, beat 2): EN1 (chin down, eyes up). **1.28: the eyes ignite** (`eyeGlow` + cross glints,
  vertical arm 48 px); the keeper flinches (K1 shoulders +2 px in code).
- **1.40 (g 15.0, the "and" of beat 2): THE CUE** (**EN2**): without taking his eyes off the keeper he lifts his
  right arm out to the side and up, **palm open and turned up to the stands**, fingers spread: a conductor
  asking the house for the beat. The phone lights across the stand behind him surge +30 % in a wave
  (`drawPhoneLights` `wave`); the hush breaks into a rising murmur.
- **1.60 (g 15.2, beat 3): THE CROWD'S STOMP → THE CURTAIN DROP.** **EN3**: the open palm lifts the last 4 px on
  the beat and holds high (the cue given). **The whole bowl stomps on his beat** (`crowdStomp(4)`: its first
  stomp lands on this frame; the crowd sprites drop 2 px, the boards flex, every phone light jumps), **the four
  HUD pads flare at once** (`flareAllAt`), and the stadium slams back on:
  1. rate 0.05 for 0.08 s, then 1: everything moves at once;
  2. **the relight**: every floodlight bank surges back on in one wave, from the stands he cued toward the
     camera: the far banks at 1.60 (flash 0.6 ivory, **E13**), the near banks at 1.70 (a luminance step,
     `fullFrame`, **E14**); each lamp grid blazes with a starburst `lensFlare` (120 px); 8 god rays per tower
     fan down across the stadium; stage dim 0.94 → 0 over 0.20 s; grade `soloBlaze`;
  3. **the beat pulse**: one crisp volt Chorus copy of EN3 blasts outward from him, scale 1.0 → 2.4 over 0.3 s,
     sweeping over the keeper; a flat shock (s 0.05, sy 0.3) rolls from his feet toward the lens; light rain 70;
  4. **the four prints shatter at 1.62**: each breaks into 24 `PK.Glass` glints and a burst of volt-ivory light
     (a light splash, rx ≤ 60 px), small and far behind No.10, and its trophy spot is swallowed by the relight;
     the four bodies stay where they fell (nothing collapses: they are already down);
  5. **the fuse**: the torn route erupts segment by segment from A's spot toward his feet (8 segments, 0.06 s
     apart, 1.60-2.02), each a burst of sods and UV shafts up to 140 px, growing as they race toward the camera;
     the last (2.02) blasts a wall of sods and light round No.10, **who does not move**: palm up to the stands,
     sole on the ball, eyes on the keeper;
  6. **the keeper is blasted off his feet** (1.62-2.02, about 0.4 s): **K2** at 1.62, thrown back off both boots
     toward the lens, one glove up shielding his eyes, the other arm flung back; at 1.85 (32nd) he lands
     **sitting on his own goal line** (the puppet `sitBack` from behind, at the K frames' scale, box-filtered 2x)
     in the bottom-left foreground, a dust puff and sod flecks off the line; 1.85-2.02 he rocks back onto his
     hands, a glove still over his eyes. Beaten: still 1 on 1, but the keeper is on the turf;
  7. the crowd is on its feet: 300 phone lights waving, camera-flash pops (local, at most 12 per second),
     streamers (`PK.Confetti` in kit red, ivory and lilac, 3 per frame from 1.80).
- **1.80 / 1.90 / 2.00 (g 15.4 / 15.5 / 15.6): `1 ON 1` at 130 px** top-centre, each glyph stamped by its own
  drop beam (`1` 1.80, `ON` 1.90, `1` 2.00): ivory fill, 4 px uv stroke, 4 px plum outer stroke. EN3 / EN3b
  alternate every 0.2 s 1.80-2.20.
- **2.20 (g 15.8): FREEZE** (rate 0) on the Encore pose (EN3b): the open palm held high to the crowd, ball under
  the sole, the stadium blazing, the wreckage lit behind him, **the keeper sitting on his goal line** in the
  bottom-left foreground with a glove over his eyes. **The poster frame.** The HUD, the card and the confetti
  keep moving on the shot clock.
- 2.20-2.40: the name card slides in (the shared `nameCard`, matching ZENITH and CRESCENT): left `SPOTLIGHT
  SOLO`, under it `No.10 · SPECIAL DRIBBLE`, right `4 DEFENDERS BEATEN` with the four pads lit.
- 2.40 (g 16.0, ONE of bar 10): the final cymbal, with the crowd's third stomp.
- 2.50-2.80: fade to [8,4,14] into the result view. (With the ENCORE ending, §8 and §12, there is no freeze, card
  or fade here: EN3 / EN3b keep alternating to 2.80 and shot 10 follows.)

**VFX layers.** 9a: side macro, blacklight ball 72 px, spot glow, crack star, brake rips, the cut-out frame. 9b:
`drawDownPitch` crane with the shared tilt, the route decals and shafts, 4 prints over 4 bodies + 4 trophy spots,
No.10's pool and 0.25x cache, the keeper's slam. 9c: `drawUpPitch` telephoto; KeeperBack K1 / K2, then the
`sitBack` puppet, defocused; Encore + fluoro boots + eyes; the cue and the phone lights' surge; the crowd's
stomp and the pads' flare; the relight (surges in, flares, god rays, dim lift); the beat pulse; the prints
shattering; the fuse; the keeper's blast and landing; streamers, phone lights, flash pops; 1 ON 1; card; fade.

**Rate.** `warp [[0.00, 0.10, 0.03], [1.60, 0.08, 0.05]]`; 0 from 2.20 (not with ENCORE).

**Sound (9c)**

| t | sound |
|---|---|
| 1.20-1.60 | silence: two lamp hums; the keeper's `breath(0.3, 0.2)` at 1.24 |
| 1.28 | `shing(1.0)` (the eyes) |
| 1.40 | `whoosh(0.12, 300, 900)` (the arm) + `crashSwell(0.3, 0.2)` + `ooh(0.4)` rising: the hush breaks |
| **1.60** | **`crowdStomp(4)`**: the bowl's first stomp, on his beat, the trigger and the first sound of the curtain drop (its next stomps land on 2.00, 2.40 and 2.80) |
| **1.617** | **`relight(1.4)` + `stomp(1.4)` + `boom(1.4)` + `crack(1.2)` + `crash(1.0)` + `roar(2.0, 0.7)` + `crowd(3.0, 0.7)`**: the loudest moment of the film |
| 1.62 | four `shatter(0.5)` (the prints, 10 ms apart, panned to their places) |
| 1.60-2.02 | the fuse: 8 `rip()` bursts rising 0.4 → 1.0 with sub thumps |
| 1.85 | `boom(0.6)` + `scuff(0.8)` (the keeper lands on his line) |
| 2.02 | `boom(1.2)` (the final eruption) |
| 1.80 / 1.90 / 2.00 | `kick(0.6)` + `lampSlam(0.4)` per stamp |
| 2.20 | `stinger()` + `shing(1.0)` under the card |
| 2.40 | `crash(1.2)` (with the crowd's third stomp) |

**Cut.** Fade to [8,4,14], into the `'breakthrough'` result view (ENCORE: a hard cut on the fourth stomp into
shot 10).

---

## 7. Money shots and the ball showcase

| # | Name | Global t | What a kid screenshots |
|---|---|---|---|
| 1 | **THE SNAP** | 3.20-3.30 | over his shoulder, his arm straight up against the blazing floodlights, a spark at his fingertips, four giants stomping beyond him, the first bank popping into glass |
| 2 | **EYES IN THE DARK** | 3.80-4.00 | past the biggest defender's black shoulder: a ball glowing on the grass and two eyes glowing above it, 300 phone lights like stars |
| 3 | **THE LONG SHADOW** | 4.10-4.40 | four defenders lit hard white, forearms over their eyes, his 30 m shadow laid over them and up the net, two ivory eyes glowing in its head on the crowd |
| 4 | **THE STARE** | 4.80 | worm's-eye monument at 275 px: the lamp halo behind his head, 14 god rays, underlit by the blazing ball under his sole, a fan of five ultraviolet copies of him stepping out on the drum |
| 5 | **THE CUT** | 7.25-7.35 | A corkscrewing in mid-air while No.10 explodes the other way, a 3-claw gash pouring ultraviolet light out of the turf, sods flying at the lens, then A's neon print hanging in the air as his body slams face-down under it |
| 6 | **IN THE BEAM** | 9.20-9.60 | the front money frame: the 96 px ball hanging in the beam over the lens, No.10 mid-hurdle with his eyes on it, B's studs-up soles under his boot, sods frozen round them |
| 7 | **THE V** | 11.20-11.30 | the 104 px ball dead centre in a smeared world as the camera whips −70°, his boot whipped round it, the V tearing into the turf |
| 8 | **CRACK** | 12.80-12.86 | out of total black, a fan of light bursts through D's legs, his knees buckling inward round it, and the ball blasts at the lens |
| 9 | **THE CONSTELLATION** | 14.40 | from 22 m up, tilted 46° down: a zigzag of glowing torn turf linking four neon prints, each hanging over a fallen defender, No.10 at its head on the penalty spot, the keeper's spot slamming on beyond |
| 10 | **CURTAIN CALL** | 15.30-15.80 | over the keeper, blasted onto his goal line with a glove over his eyes: No.10's open palm raised to the stands as the crowd's stomp slams the stadium back on, the four prints shattering into glass and light far behind him, the route erupting toward him, **1 ON 1** at 130 px |

Four frames stay **clean** (no Chorus formation, no light rain): 2 (eyes in the dark), 6 (in the beam, only the
strobe chain), 8 (crack) and the 2.20 freeze of 10.

**The ball showcase is shot 7, the glue cam** (g 10.4-11.45): the camera is locked to the ball at turf level for
1.05 s, holding it at **104 px** in the centre while the world whips +35° and −70° round it through the elastico;
his boots (~180 px) step in round it; the V tears into the turf; the reveal shows the 320 px V glowing.

**Every ball close-up** (the ball is 24-36 px in v1):

| shot | moment | ball on screen |
|---|---|---|
| 2b | the ball ignites alone in the black | 29 px + a 90 px halo |
| 3 | the crash zoom onto the sole | **108 px** |
| 4 | the ignition macro, left behind, whip-chased, step-print chain | **70 px** |
| 6 | the sole-on macro | **79 px** |
| 6 | in the beam (front money frame) | **96 px** + a 9-exposure chain |
| 7 | the glue cam | **104 px** |
| 8 | out of the light at the lens | 20 → **120 px** |
| 8 | the front ride, rushing at the lens, his boots striking it from behind | **100 → 114 px** (108 at 1.30) + a 300 px halo |
| 9 | the stop on the spot | **72 px** |

**Glue rules** (kept): the ball is never more than one foot-length from the boot except the scripted moments
(the cut, the flick, the snap, the poke); spin locked to ground speed (and ≥ 1 rad/s in freezes: the ball is
alive); its plum shadow shows its height. **Hero-ball scale** (drawing the ball up to 1.6x its true size) is
allowed only where no boot touches it on that frame (the front money frame).

## 8. Field scenario `'gauntlet'` (`src/game/gauntlet.ts`, `src/game/field.ts`, `specials.ts`)

- **Setup unchanged** (87th minute, 0-0; four defenders A-D and the keeper; intro caption
  `No.10 FACES A WALL OF FOUR`; No.10 from the Dribble cache, never the field puppet). One change: when the
  command window opens, the four defenders close into a **staggered line 6-8 m ahead** (the wall of shot 2):
  A (h.x + 60, h.z + 28), B (h.x + 68, h.z − 24), C (h.x + 74, h.z + 14), D (h.x + 70, h.z − 4).
- **Command window** unchanged: lights to 70 %, the ivory floor pool, the lamp pads chasing at 150 BPM,
  `DRIBBLE · > SPOTLIGHT SOLO  SP 65`, prompt `SPACE / TAP · TAKE THE STAGE`.
- **Bridge** unchanged (0.15 s: `sticks()`, the pool snaps tight, every field light drops to black): shot 1
  opens on black.
- **Result `'breakthrough'`** (v1's field-view coordinates kept; poses new):
  - floodlights on; No.10 on the field's spot (1114, 282) with his sole on the ball (Settle F3 / F3b, 0.5x cache);
  - the keeper sitting on his goal line at (1176, 282) (`sitBack`), scrambling up over 1.2 s into a shaky wide
    crouch at (1150, 282) (`gkSpread`, ±1 px tremble): beaten, and up only just in time for the shot;
  - A face-down at (925, 276) (`faceDown`); B on his back at (935, 300) (`sprawl`) at the end of a rolled sod
    carpet (decal: a bare soil strip and the roll); C on his side at (1030, 256) (`sideTopple`) with D (the
    Tower) on his back across C's legs at (1036, 258) (the pile pre-rendered as one `PuppetCache` canvas in
    `prepare()`); no prints (they shattered);
  - the torn route as a field decal (12 short rips with lilac cores) fading over 3 s;
  - banner `BREAKTHROUGH · 1 ON 1`; `crowd(3, 0.5)`.
- **Ship rule (the ending).** v2 ships with the `'breakthrough'` ending **only if `field.showBreakthrough()` and
  the SHOOT chain are built and tested**: a test plays `'gauntlet'` → SOLO → `'breakthrough'` → SHOOT (SHOOT
  lit, offering ZENITH METEOR) → a goal or a save, so the player always gets the shot. If either is missing,
  **the ENCORE goal variant (§12) is the default ending** (result `'goal'`). There is no
  `R REPLAY · SPACE KICK-OFF` dead end after a 16 s special.
- **Ask the owner which ending he wants** (before the ending is built): *"At the end of SPOTLIGHT SOLO, do you
  want (A) 1 ON 1: the keeper is knocked flat and the player takes the shot himself with SHOOT, or (B) ENCORE:
  No.10 rolls the ball past the fallen keeper and taps it into the net himself, inside the special?"*
- **Registry** (`specials.ts`): `{ id: 'solo', name: 'SPOTLIGHT SOLO', kind: 'Special dribble', scenario:
  'gauntlet', cost: 65, result: 'breakthrough' (ENCORE: 'goal'), shots: spotlightSolo }`.

**Why the default is still 1 ON 1 when the SHOOT chain ships.** It is a dribble. The payoff is the opponents'
defeat (the four prints shattering, the keeper blasted onto his line) and it is staged to hit like a goal (the
loudest moment, roar 2.0, 1 ON 1 at GOAL! size). The finish belongs to the player through the SHOOT chain; a
dribble that always scored would steal the shots' payoff and make SOLO a cheaper guaranteed goal than ZENITH or
GALE. Without a tested chain that argument fails, and ENCORE ships.

## 9. Studio art (Pixel Studio)

Canvas 128 × 128, No.10 98 px tall standing, sole on row 102, the 15-colour palette, the `Art` / `Num` / `Ball`
layers and the anchor schema of `../MOTION_LIBRARY.md` §1. The ball is **never** drawn in a frame: a `Ball`
guide layer with the #00FF00 disc gives the `ball` anchor and is cleared before export. Exceptions: SoloFace
uses the 48 × 26 GlanceFace canvas and registration; MacroBoots use the StrikeMacro convention (boot and shin
only, the boot ~70 px long, `turf` row and `scale` in the JSON). Front and back views are never mirrored
(numbers); MacroBoots carry no numbers and may be mirrored.

**27 must-have frames** (17 No.10 incl. 2 breath variants, 10 Rivals) **+ 7 optional** (+ 4 DragBack frames,
must-have only if the ENCORE ending ships, §8 / §12).

### 9.1 Project "Sochetra" (No.10): 17 frames

| Strip / ID | View | Pose | Used (shot / t / scale) | Holds | Anchors |
|---|---|---|---|---|---|
| **SoloFace SF1** | face crop (GlanceFace canvas) | lit hard from straight above: the fringe throws a 4-5 px shadow band over the eyes; inside the band the eyes are open with one ivory pupil pixel each (the engine adds the glow); cheekbones, nose bridge and jaw lit; mouth set, no smile | 1 / 0.06-0.60 / ×8 | 0.54 (cut-in panel) | `eyeL`, `eyeR`, `pupilL`, `pupilR`, `head`, `bbox` |
| SoloFace SF2 | same | the glare: brows down 1 px, lids narrowed to 2 px slits (still lit), jaw set | 1 / 0.60-1.45 / ×8 | 0.85 (cut-in panel under push and title) | same |
| **SnapBack SB1** | back, full body (base on StandBack a) | weight on the left leg, the right sole on the ball, the right arm rising out to the side: elbow at shoulder height, forearm vertical, hand loose; head level toward the wall | 2 / 0.95 / ×3.4 (cropped at the waist) | 0.35 | `contact`, `pelvis`, `head`, `hand` |
| SnapBack SB2 | same | arm straight up, elbow by the ear, **fingers set** (thumb and middle pressed, index up); shoulders square; head tipped back 1 px | 2 / 1.30-1.60 / ×3.4 | 0.30 | same |
| SnapBack SB3 | same | **the snap**: middle finger struck into the palm, thumb and index flicked apart (a 3 px gap), wrist kicked 1 px; the shoulder drops 1 px | 2 / 1.60-1.80, 2.40-2.80 (silhouette) / ×3.4 | 0.2, then under the crane-rush | same |
| **Encore EN1** | front, full body (base on StandFront a) | **the stare**: right sole on top of the ball, weight back on the left leg, arms loose and slightly out, chin down, **eyes up under the brow** (pupils at the top of the eyes), a faint smirk (one mouth corner up 1 px) | 3 / 0.00-0.80 / ×2.8; 2b / fluoro / ×1.6; 9c / 1.20 / ×2.2 | 0.2, alternating with EN1b | `contact`, `ball`, `eyeL`, `eyeR`, `head`, `chest` |
| Encore EN1b | same | breath variant: shoulders up 1 px, hair spikes and shirt hem 1 px | 3 / alternating | 0.2 | same |
| Encore EN2 | same | **the cue begins** (redrawn: no snap): the right arm swinging out to the side and up past shoulder height, **palm open and turned up** toward the stands, fingers spread (never a fist or a point), chin lifting level, eyes still on the lens (the keeper); sole on the ball | 9c / 1.40 / ×2.2 | 0.20 | same + `hand` |
| Encore EN3 | same | **the cue** (redrawn: no snap): the arm raised high and out (the hand above his head, a little to his right), the open palm turned up to the stands, five fingers spread, the wrist lifted 1 px (the lift on the beat); chest open, shoulders square, chin level, eyes hard on the lens; sole still on the ball | 9c / 1.60-2.20 / ×2.2 | alternating with EN3b from 1.80 | same + `hand` |
| Encore EN3b | same | hold variant of the cue (redrawn with EN3): hair spikes and hem settle 1 px, a 1 px shoulder drop, the palm still open and high (the freeze pose) | 9c / 1.90, 2.10, freeze from 2.20 | freeze | same |
| **MacroBoots MB1** | side macro, boots and shins | the plant: left boot dug into the turf, studs biting, toe twisting, heel lifting, shin 30° forward | 4 / 0.00 / ×5 | 0.10 | `boot`, `turf`, `ball` |
| MacroBoots MB2 | same | the toe-poke burst: the right toe punching through the ball's centre, ankle locked, laces up, shin at 45° | 4 / 0.10-0.21 / ×5; 8a / 0.80 (silhouette) | 0.11 (inside the hit-stop) | `toe`, `ball` |
| MacroBoots MB3 | same | inside tap: right boot turned out 80°, the inside of the boot meeting the ball's side, knee over the toe | 4 / 0.4, 0.6 / ×5; 7a / 0.00, 1.00 / ×4; 8b / 1.00, 1.40 / ×4, from behind the ball in the front ride (mirrored for the left at 1.20) | 0.10 | `boot`, `ball` |
| MacroBoots MB4 | same | outside push (the elastico's show): the boot rolled onto its outside edge, ankle rolled 20°, toe pointed, the ball pushed outward | 7a / 0.40-0.767 / ×4 | 0.37 (under a whip and a rest) | `boot`, `ball` |
| MacroBoots MB5 | same | inside snap: the boot wrapped round the far side of the ball and whipping back, inside of the foot, toe hooked | 7a / 0.80-1.00 / ×4 | 0.20 | `boot`, `ball` |
| MacroBoots MB6 | same | sole on top: the right sole pressed flat on the ball's crown, studs visible, ankle flexed, heel down | 3 / 1.00-1.20 / ×5; 8b / 1.50-1.60 / ×4 (turned across the ball, side to the lens) | 0.20 | `sole`, `ball` |
| **HurdleFront HF1** | front, full body, airborne | the hurdle from the front: knees tucked high and apart (the lead knee at chest height, the trailing boot raised behind), arms flung wide and up, chest open, chin up, **eyes up at the ball** above the lens; hair spikes lifted (weightless) | 6 / 1.20-1.60 / ×2.4 | 0.40 (inside a time freeze) | `pelvis`, `eyeL`, `eyeR`, `bootTrail` |

### 9.2 Project "Rivals": 10 frames

One Rivals model sheet for the set: **D is MERIDIAN v2's Tower** (the set's one big captain: the captain's
armband, 1.3x bulk, the head of TowerFace TF3), and the KeeperBack frames come from **the same keeper model
sheet as GALE v2's KeeperFront busts** (`KEEPER_KIT`, one face, one build).

| Strip / ID | View | Pose | Used | Anchors |
|---|---|---|---|---|
| **RivalFront RF1** | front, full body (`RIVAL_KIT`; B and C by tone-for-tone swaps) | hunched glare: shoulders forward, fists clenched at the hips, chin down, brows down, feet planted wide | 2a / 0.25-0.65, 1.10-1.60 (with a 1 px code breath) | `contact`, `head`, `chest` |
| RivalFront RF2 | same | stomp load: the right knee up to hip height, body leaning back 4°, fists down | 2a / 0.65 (and on the cut-in frame) | same |
| RivalFront RF3 | same | **the stomp**: the right foot slammed flat, body dipped 4 px, shoulders forward, mouth open (a shout) | 2a / 0.00, 0.80 | same |
| RivalFront RF4 | same | **blinded**: a forearm across the eyes, head turned 20°, a half step back (weight on the back foot), squinting | 2c / 2.40-2.80 (lit hard white) | same |
| **RivalFront RF1T-RF4T** (4 frames) | front, full body, **drawn on the Tower's body** (D: `RIVAL_KIT`, the armband, 1.3x bulk, TF3's head) | the same four poses as RF1-RF4, re-proportioned from them with `add_frame` (new torso, arms and thighs; the same timing) | 2a, 2c: D only | same |
| **KeeperBack K1** | back, full body (`KEEPER_KIT`, GALE's KeeperFront model) | set crouch, gloves wide and low, knees bent, head up toward No.10 | 9c / 1.20-1.62 / ×4 (box-filtered 2x) | `contact`, `head`, `gloveL`, `gloveR` |
| KeeperBack K2 | same | **blasted off his feet**: thrown back off both boots toward the viewer, body tipped back 25°, knees up, one glove up shielding his eyes, the other arm flung back, head turned 15° | 9c / 1.62-1.85 (then the `sitBack` puppet) | same |

### 9.3 Reused library frames (no change)

| Shot | Frames (shot-local t) | Scale |
|---|---|---|
| 5 | FrontTouch FT1 0.00 · StepOver F2 0.14 · F3 0.27 · F4 0.40-0.60 · F5 0.60 · F6 0.70 · F7 0.80 · Break BR1 0.85 · BR2 1.00 · BR3 1.15 · BR2 1.30 · BR3 1.45 | ×2.4, ×3 from 1.20 |
| 6 | SoleLift F3 0.00 · F4 0.10 · F5 0.20 · F6 0.40 · F7 0.60 · F8 0.70 · F8b 0.80-1.20 · F9 1.68 · F10 1.75 · F11 2.00 · Dribble F2 2.05 · F3 2.10 · F4 2.15; RivalSlide S1 0.00 · S2 0.40 · S2c 0.80-1.60 · S3 / S4 1.70 | ×3 |
| 7b | Break west strip BR2 / BR3 on 8ths from 1.05 | ×2.4, ×3 from 1.20 |
| 8a | FrontTouch FT1 0.00 · Nutmeg F2 0.20 · F3 0.30 · F4 0.40 (then hidden by the smother) | ×1.6, ×2 from 0.40 |
| 8b | Break BR2 0.86 · BR3 1.00 · BR2 1.20 · BR3 1.40 (front, his body behind the ball; the near boots are MacroBoots, §9.1) | ×3 |
| 9a / 9b | Settle F2 (the stop, ×3 at zoom 2), Settle F3 (the crane, a 0.25x box-filtered cache) | |
| field | Dribble cycle (intro, command window), Settle F3 / F3b (result) | 0.4x / 0.5x caches |

### 9.4 Puppet poses (joint angles only, `POSES` in `puppet.ts`)

- **New**: `corkscrew` (A airborne, hips turned 90° from the shoulders, legs crossed, arms flung; the shot sets
  `spin`), `smother` (D folding forward to 95°, arms spread down, knees bent), `tumble` (D pitched forward 70°,
  arms reaching down, the trailing leg up), **`kneeBuckle`** (D's 2-frame leg pose at the crack: 1, the knees
  snap inward toward each other; 2, they fold and the hips drop 8 px, the torso still bent over).
- **Reused**: `jockey`, `lungeCommit`, `slideSpin`, `splitFreeze`, `sideTopple`, `wideBlock`, `faceDown`,
  `sprawl`, `sitBack` (now also the keeper's landing on his line), `flinch`, `gkReady`, `gkSpread`, `run1-4`.
  `lookThrough` is no longer used.
- Every pose renders through the shared `PuppetCache` (`kit.ts`). Prints, bodies at rest and the result-view
  pile are cached canvases (they never count as live puppet renders); a falling body is a live render until it
  lands.

### 9.5 Drawing notes, priority, fallbacks

- **Natural motion** (motion library §3 rules): pinned feet (build each frame with `add_frame` and redraw only
  what moves); arcs; a 2-4 px pelvis drop on downs; counter-rotation; hair and hem trail by one frame; the eyes
  stay up on the defender or the keeper. No hold longer than 0.3 s without a drawn variant, except inside a
  time freeze (HF1), under violent camera motion (SB3 in the crane-rush, MB4 in the whip) and in the cut-in
  panel (SoloFace), as in ZENITH and CRESCENT.
- **The snap reads in silhouette** (SB3 against the floodlight glare): arm straight up, a clear 3 px gap
  between thumb and fingers. **The cue reads in silhouette too** (EN3 against the relight): the arm high and
  out, the palm open and up with five separate fingers, never a fist, a point or a snap. Review SB2/SB3 and
  EN2/EN3 at 4x first.
- Every frame that becomes a Chorus copy (EN1, EN3, StepOver F4 and F7, Break BR2/BR3, SoleLift F5-F7, HF1)
  must read as a solid two-value silhouette with no ambiguous leg overlap (v1 rule, the key to crisp copies).
- **Menace comes from top light**, not a new face rig: SoloFace and EN1 put the eyes in the shadow of the hair
  with one ivory pupil pixel; the engine adds the glow. Never an eye trail.
- **Priority**: (1) EN1 / EN1b / EN3, SB1-SB3, MB2 / MB4 / MB5 / MB6, RF1 / RF3, RF1T / RF3T; (2) HF1, K1 / K2,
  SF1 / SF2, MB1 / MB3, RF2 / RF4, RF2T / RF4T, EN2 / EN3b; (3) the optional frames. If ENCORE ships, DragBack
  DB1-DB4 join priority 1.
- **Optional (7)**: SoleLift **F8h** (a higher, tucked hurdle for 6b-6c); **SnapHand SH1 / SH2** (a back-lit
  macro hand for the 2a crash zoom); **Break BR0** (a rip push-off for shot 5); Rivals **RivalTwist T2** (A's
  airborne corkscrew from the front, for print A); **RivalSlide S4** (B flung into a corkscrew off his slide);
  **RivalFearFace FF1** (D's gulp, the 0.2 s insert in shot 3, drawn on the Tower's TF3 head from MERIDIAN v2's
  sheet). RivalUpside RU1 is dropped (the upside-down face was a gag).
- **Fallbacks while art is late** (never a puppet No.10):
  - SoloFace → GlanceFace G1 at ×8 with a code shadow band under the fringe (multiply plum over 40 % of the
    face) and `eyeGlow` on its eye anchors;
  - SnapBack → StandBack a/b, and the snap played as a 0.2 s reverse insert of Encore EN2 / EN3 at ×2
    (1.50-1.70) before the cascade;
  - Encore EN1 / EN1b → StandFront a/b with Settle F3's head-up timing; EN2 / EN3 have no fallback (P1);
  - MacroBoots → StrikeMacro M1 / M2 for MB1 / MB2; SoleLift F3 at ×4 cropped for MB6; Dribble F1 at ×4
    cropped for MB3; Elastico F2 / F5 at ×4 cropped for MB4 / MB5;
  - HF1 → no front cut: the side parallax slide holds to 1.60 and the ball's blaze rises to 1.4 instead;
  - RivalFront → puppets in silhouette, side-on, stomping toward the lens on a diagonal; RF4 → `flinch`;
    RF1T-RF4T → RF1-RF4 at 1.3x in code with a code armband;
  - KeeperBack → the keeper puppet in silhouette side-on at the left edge, box-filtered 2x; K2 → the puppet
    thrown back from 1.62 into `sitBack`.

## 10. Engine cheat-sheet (new pieces; everything else as in v1, CRESCENT and GALE v2)

### 10.1 Post (`engine/post.ts`)

1. **`FINAL_SOLO = buildFinal([IMPMASK, FLATSHOCK, STREAK, ECHO])`**: one lazily compiled program assembled by
   the shared `buildFinal(chunks)` (GALE v2 §10.0) from named chunks that each exist once: SOLO's `IMPMASK`
   (the cone-masked impact), `FLATSHOCK` (the `sy` squash of the shock distance) and `ECHO` (v1's echo block),
   plus **the shared `STREAK` chunk, byte-identical to GALE's** (GALE v2 §10.1 item 3; a dev assert checks that
   `FINAL_SOLO`, `FINAL_GALE` and `FINAL_MERIDIAN` hold the same chunk string). It is used on a frame when
   `fx.pass === 'solo'` **and** (`impMask > 0`, any shock has `sy ≠ 1`, `streak > 0` or `echo > 0`); all other
   frames, and every other special, run their own programs byte for byte. Warmed by `post.warm('solo')` from
   shot 1's `prepare()`. New `FxState` fields (all reset in `reset()`):
   - `pass: '' | 'solo'`;
   - `impMask` (0/1), `impMaskX`, `impMaskY` (cone apex, UV, y down), `impMaskDX`, `impMaskDY` (unit axis),
     `impMaskHalf` (half-angle, rad, default 0.35), `impMaskSoft` (rad, default 0.04), `impOut` (RGB, default
     `void`), `impOutAmt` (0..1, default 1). Shader: `d = (uv − apex)·(aspect, 1)`;
     `m = (1 − smoothstep(half − soft, half + soft, acos(dot(normalize(d), axis))))·step(0, dot(d, axis))`;
     `col = mix(col, mix(impA, impB, k), impact·m)`; `col = mix(col, impOut, impact·(1 − m)·impOutAmt)`.
     With `impMask` 0 it is the original full-frame line;
   - `Shock.sy?: number` (default 1; chunk `FLATSHOCK`): in `FINAL_SOLO` the ring distance uses `d.y / sy`
     (0.25-0.4 squashes the refraction into a flat ellipse along the turf). SOLO never draws a ring;
   - `streak`, `streakDX/DY`, `streakHoleX/Y/R`: GALE v2 §10.1 item 3, unchanged.
2. **`soloImpact2(fx, stage: 'A' | 'B', cone?: { x, y, dx, dy, half })`** (`solo/common.ts`): sets the §2.3
   colours, threshold 0.40, the mask and `impOut`; without a cone it is full frame. `soloImpactFallback(...)`:
   the no-shader version of §2.3.
3. **FlashBudget**: imported unchanged from GALE v2 §10.1 item 6 (`timeline.ts`, the set's single definition;
   SOLO defines no thresholds of its own). SOLO only sets `fx.fullFrame` on the S2 first frame
   (black → lit) and at 9c 1.70, and compares the capture tool's event printout with §4.4.
4. Optional prototype, not shipped by default: **`fx.neon`** (a 3x3 Sobel edge pass on luminance: edges above
   `neonThresh` glow ivory → volt, the rest crushed to `void`), a `NEON` chunk in `FINAL_SOLO` behind the
   `?neon` dev flag.
   Ship it only if a review agrees it reads as a punch at phone size.

### 10.2 Camera and timing (`solo/common.ts`, `engine/camera.ts`)

5. Tempo: `BPM 150`, `BEAT 0.4`, `EIGHTH`, `SIXTEENTH`, `THIRTYSECOND 0.05`, **`GRID0 1.6`**,
   **`SHOT_T0 = [0, 1.6, 4.4, 5.6, 6.4, 8.0, 10.4, 12.0, 13.6, 16.4]`** (ENCORE appends 18.0), `BAR(n) = 1.6 + (n − 1)·1.6`,
   `OLE_GLOBAL = [7.6, 10.0, 11.6, 13.2]`, `padsFor(shot)`, `onGrid(t, what, grid)` (32nds allowed).
6. **The camera is the shared `kit.ts` set**: every track is **`kit.keys(track, t)`** (MERIDIAN's keyed track,
   with GALE's `'step2'` preset for v1's 2-frame snap) and every zoom kick is **`kit.punch(t, at, amt, tin,
   tout)`**; SOLO keeps no curve of its own. **`beatCam2(keys, t): CamPose`** is a thin grid layer over them:
   it takes SOLO's beat keys `{ t, x, y, zoom, move: 'snap' | 'cut' | 'crash' | 'whip' | 'glide' | 'track' |
   'rush', dur?, ease?, streak? }`, checks each `t` with `onGrid` (16ths, 32nds where §6 lists them), turns each
   move into `keys()` rows (`'snap'` = a `'step2'` row plus a 3 % overshoot row, `'crash'` inExpo, `'whip'` inQuad,
   `'rush'` inExpo, `'cut'` a step) and writes `fx.streak` / `fx.radial` for whips and rushes. `bounce(t, hits,
   amt = 0.025, decay = 0.1)` (the kick-drum pump) is a sum of `kit.punch` calls. All pure functions of `t`
   (exact seek). Every SOLO `init`: `cam.shakeRoll = 0.015` (roll stays 0).
7. **`StepPrint`**: `sp.update(t, n, snapshot)` stores the render state (sprite keys, ball, camera) on every n-th
   fixed step inside its window; `sp.state(t)` returns the held state. Shot 4 only (0.40-0.80, n 3). No runner
   change; seek-exact because update runs on the fixed step.
8. `RATE[n](t)` per shot (§6 `warp` rows) and `HUM[n](t)` (the lamp hum is on whenever a SOLO lamp is lit:
   1 0.06-1.45, 2 from 2.40, 3-8 throughout, 9 to 1.60).

### 10.3 Light and stage (`art/stage.ts`)

9. **`stage.dim(ctx, level, pools, o)`**: up to **8 pools**; `o.max` (default `DIM_MAX` 0.88; SOLO v2 shots pass
   **0.94**); `o.uncapped` (≤ 0.97) only for the listed blackouts.
10. **`stage.pillar(ctx, o: PillarOpts)`** (the **drop beam**): `{ x0, y0, x1, y1, w0, w1, a, t, slamAt?, pumps?: number[], motes?,
    seed?, core = 0.3, edge = 6 }`: plum underlay 0.25 (normal), ivory body ≤ 0.22 and a white-hot core ≤ 0.35
    (additive), volt edges, seeded motes; with `slamAt`, a 2-frame drop with a 6 % overshoot; +15 % for 0.1 s at
    each `pumps` time (inside the pool only). **`stage.splash(ctx, x, y, rx0, rx1, aspect, t0, t, a)`**: the
    filled light splash (0.15 s). **`stage.pool(ctx, x, y, rx, ry, a)`**: the hot pool (L > 0.92 at its centre).
    `stage.beam` stays for the field command window.
11. **`stage.trophy(ctx, x, footY, s, t0, t)`**: the narrow hard spot from the roof (12 → 70 px × s), pool rx 50 × s,
    a 2-frame switch-on with one over-bright frame, motes; positions from `soloWorld`.
12. **`stage.godRays(ctx, x, y, n, len0, len1, w, a, rot, seed)`**.
13. **`stage.surge(ctx, env, bank: BankRect, t0, t, dir: 'out' | 'in')`**: a floodlight bank's 5 × 4 lamp cells
    pop over 0.08 s (1-frame white blinks, then dead) with 60-120 `PK.Glass`, a sparking cable (`'glass'` sparks),
    smoke and a 3-frame glow collapse; `'in'` reverses with a rising glare and a 120 px `lensFlare`. Bank
    rectangles come from the pitch views (`towers?: number[]` levels on `drawFieldBackdrop`, `drawDownPitch`
    and `drawUpPitch`, plus `banks(v)` returning their screen rects).
14. **`fluoroMask(pic)`** (cached per frame): the pixels of the boot white (#dfdae6), sock trims and eye whites;
    **`drawFluoro(ctx, pic, x, y, scale, a)`** draws them lilac-white, additive, after the dim.
15. **`eyeGlow(ctx, x, y, o: { open, narrow, a, cross, gap })`**: two 3 × 2 cores (4 × 1 narrowed), 18 px uv
    halos over uvDeep, and on each eye a **stage-light cross glint**: a 4-point star whose vertical arm is the
    longest (`cross` ≤ 60 px; the horizontal arm 0.6 × the vertical), like a spot's lens star. No horizontal
    streak flares (GALE's anamorphic eye streak).
16. **`longShadow(ctx, o)`**: `{ sil, footX, footY, headX, headY, w0, w1, t0, t, climb: { x, y0, y1, clip }[],
    eyes?: { at } }`: a perspective strip of horizontal slices of the silhouette, multiply plum at 0.85 with a
    2 px volt edge, extending over 4 frames; on each `climb` plane (a defender, the net, the boards) a band rises
    from the foot to the top in 0.05 s, clipped to that plane's canvas; eye-slits = two ivory 4 × 1 glints with
    cross glints (vertical arm 30 px). Fallback: the ground strip and the eye-slits only.
17. **`underLight(ctx, pic, x, y, scale, lx, ly, r, color)`** and **`rimLight(ctx, pic, x, y, scale, dir, w,
    color)`**: a radial light from a point (the ball) and a light-side rim, both clipped to the sprite.
18. **`lightRain(ctx, x, w, n, t0, t, o)`**: SOLO's focus lines: n thin vertical lines (1 px, 20-90 px long)
    falling from the top of frame in a band of width w, 900 → 200 px/s over 0.2 s, ivory and volt, additive
    over uvDeep. Never radial.

### 10.4 The Chorus, the prints, the world (`solo/chorus.ts`, `solo/print.ts`, `solo/world.ts`)

19. **`Chorus`** (replaces v1's `Afterimages`): `drop(key, x, y, scale, t, o)`, `line(key, ..., offsets)`,
    `fan(key, ..., n, spread, kicks)`, `throw(key, ..., offsets)`, `pulse(key, x, y, scale, t0, t, maxScale)`,
    `wipe(keys, t0, scales, dir)`, `strobeChain(points, t, r)`. Look: an additive volt body at 0.55 over a
    uvDeep halo, a 1 px ivory rim on the beam side, a 2 px uv outer glow, 3-5 horizontal speed lines cut
    through; cached per frame and scale (built on `frames.ts` `uvSilhouette`). Caps: 8 hero copies and 12 ball
    exposures alive; fades step on the 16th grid. **Never a decoy.**
20. **`StrobePrint`** (replaces `StrobeStatue`: a snapshot plus an ordinary fall): `new StrobePrint(def)` with
    `{ id, model, kit, popAt, printPose, fall: [{ t, pose, x, z, h, rot }], landAt, restPose, shatterAt }`;
    `at(gt) → { phase: 'live' | 'falling' | 'down', pose, x, z, h, rot, print: null | { pose, x, z, h, rot },
    shattered }`; `draw(ctx, project, gt, o)`. The **body** is an ordinary defender (a puppet through the shared
    `PuppetCache`, or a drawn frame) that **completes its fall in real time** after the pop (rotation,
    translation, a landing sod burst) and rests as a cached canvas from `landAt`. The **print** is a snapshot of
    the body's render at `popAt` (cached in `prepare()`, never re-posed), drawn in the neon look: fill `uvDeep`,
    a 1-2 px `volt` edge, an `ivory` core on the lit side, a faint ivory after-glow; it hangs where the body was
    at the pop until `shatterAt`, then breaks into `PK.Glass` and a light splash (rx ≤ 60 px). The flash-bulb
    pop (local, radius ≤ 90 px, 3 frames) marks `popAt`. All of it is a pure function of the global time, so
    every shot seeks exactly; there is no frozen phase and no release.
    **`PuppetCache`** moves from `solo/common.ts` to `kit.ts` as **the set's only puppet cache** (MERIDIAN's
    `cachePuppet` and GALE's wall and keeper use it): key = model, kit, pose, scale bucket, facing; SOLO uses it
    for every defender and keeper pose, the print snapshots, bodies at rest and the result pile.
21. **`soloWorld`**: `ROUTE`, `PRINTS` (§3), `GASHES`, `TROPHIES`, `KEEPER`, `MARK`, and `worldAt(gt)` (what
    exists at a global time). Shots import it; there is no mutable cross-shot state.

### 10.5 Turf and particles (`solo/turf.ts`, `engine/particles.ts`)

22. **`lightGash(ctx, g, project, gt, o)`**: claw rips (2-4 claws, 60-140 px), ragged grass lips (`torn`),
    soil walls (`soil`), standing sods at the ends, a volt core line; 3-6 UV shafts (60-140 px tall, additive
    volt over uvDeep, flickering ±15 % on the 8ths, dimming 1.0 → 0.45 over 4 s of age). Kinds: `claw`,
    `furrow` (B's: dark, no light), `carpet` (the bare strip with a UV leak), `spiral` (C's pivot), `line` (the
    nutmeg), `brake` (twin), `star` (the spot). **`fuse(gt0, order)`** erupts them in sequence (sods + shafts to
    140 px). Works in side views, front and back pitch views (via the projector) and the crane.
23. **`turfRip(env, x, y, dir, power, o?: { lens?: boolean })`**: `PK.Sod` slabs (6-10 px, `torn` top / `soil`
    underside, tumbling, bouncing once, landing as divot decals), soil crumbs (`PK.Pixel`, `'sod'`), grass blades
    (`PK.Blade`, shared with GALE v2); with `lens`, 1-2 divots (40 px) tumble past the camera.
24. **`sodCarpet(ctx, path, roll, t)`**: a 3 m strip peeling and rolling up (soil side up, the roll growing
    6 → 12 px), the bare soil below leaking UV.
25. Particles: kinds **`PK.Sod`** and **`PK.Glass`** (a falling glint with gravity and a one-frame sparkle);
    ramps **`'sod'`** [[120,200,90], [60,138,58], [74,52,36], [34,22,16]] and **`'glass'`** [[255,255,255],
    [226,220,255], [160,140,240], [90,70,160]]. No cap of SOLO's own: the single engine cap `Particles.CAP`
    (1500, oldest-first recycling, GALE v2 §10.0) holds, and SOLO's frames stay at or under 1000 live (a
    budget the dev overlay checks, not a second cap).

### 10.6 Pitch views (`art/stadium.ts`, `solo/gluecam.ts`)

26. **`drawUpPitch(ctx, st, v, time, o)`**: **the reverse direction of the one pitch renderer**, not a second
    renderer. `drawDownPitch` and `drawUpPitch` are two thin entries into the same `stadium.ts` code with
    `v.dir` +1 (looking east, +x) or −1 (looking west, −x): the same shared projector `projectDecal(x, z, h, v)`
    (Z = dir·(x − eye.x), X = dir·(z − eye.z), Y = h − eye.h, then the shared pitch-only `tilt`), the same mowing
    stripes, box lines, goal, stand planes, floodlight towers and banks (`towers?`, `banks(v)`), phone lights and
    `drawPitchLines`. Looking west it shows what lies west: the far stand at x ≈ 40, the halfway line and centre
    circle, the near penalty box and the D seen from the goal side; `posts?: true` draws the near post and side
    netting at the frame edge. No `projectUp` is written. It remembers `v` like `drawDownPitch`.
27. **`DownPitchView.tilt`** (radians, + looks down; MERIDIAN v2's shared build item, built once in `stadium.ts`):
    `Zc = Z·cos t − Y·sin t`, `Yc = Z·sin t + Y·cos t`, screen `x = cx + f·X/Zc`, `y = horizon − f·Yc/Zc`,
    `s = f/Zc`; `horizon` is the principal point's y. SOLO uses it in 9b (0 → 0.80 → 0.10) and 8b (−0.50), in both
    directions. Plus `drawDownPitch` options `towers?: number[]` (far-left, far-right, near-left, near-right; the
    near pair drawn as lamp-grid glare at the top corners) and **`drawPitchLines(ctx, v, a, color)`** (the box
    lines again, lilac and additive, after the dim), shared by the two directions.
28. **`gluecam`**: `glueGround(ctx, psi, flow, t)`: a screen-space turf plane (stripe bands and fluorescent line
    segments generated in a ground frame, rotated by the fake yaw ψ and scrolled by `flow` metres), the stands
    band translating 8 px per degree of ψ with phone lights; the ball fixed at (320, 290); the shot sets
    `fx.streak` along the tangent during whips with a hole on the ball (R 0.12).
29. **`drawPhoneLights(ctx, st, view, t, o)`** extended, not duplicated: `o.n` (default 60; SOLO passes 300),
    `o.wave?: [t0, dur]` (a left → right switch-on wave; also the +30 % surge at the cue) and `o.sway?: boolean`
    (1 px on the beat after OLÉ 1); drawn after the dim. There is no `phoneSea`.

### 10.7 Ball, title, HUD (`kit.ts`, `art/fx.ts`)

30. **`drawBall(..., 'blacklight')` + `o.blaze` (0..1)**: an additive ivory core and a 90-300 px halo over a
    uvDeep halo; `renderBall` cached per integer radius up to 60 (warm r 17, 29, 34, 35, 36, 40, 48, 52, 54, 60
    in `prepare()`); spin keeps turning at ≥ 1 rad/s in freezes.
31. **`lampTitle2(ctx, groups, x, y, size, t, onTimes, o)`**: each group stamped by its own 40 px drop beam
    (2-frame drop), a 60 → 110 → 100 % squash, motes, a volt Chorus copy stepping out; used for the title (72 px)
    and `1 ON 1` (130 px). **`fourCount`** pads at 16 × 16 with `flareAllAt`. `marqueeTag` kept.

### 10.8 Audio (`engine/audio.ts`, procedural)

32. **`snap(power)`**: a dry finger snap: a 15 ms noise burst band-passed 2-6 kHz + a 1.5 kHz ping + a 1.2 s hall
    tail; ducks the crowd bus for 0.15 s.
33. **`stomp(power)`**: an arena kick (55-60 Hz body + beater click) + `boom(0.5·power)` + four `scuff`s within
    15 ms + a short stadium room tail.
34. **`lampSlam(power)`**: `spotOn(power)` + `boom(0.8·power)` + `kickDrum(0.85·power)` + `crash(0.6·power)` +
    a 40 Hz sine drop (0.4 s) + a shutter clack.
35. **`rip(power)`**: turf tearing: band-passed noise (400-1500 Hz) sweeping down + crackle grains + a soil thud.
36. **`strobeZap(power)`**: a capacitor whine rising 2 → 6 kHz in 0.12 s, then a hard CLACK and a short tail.
37. **`surge(power)`** (a bank blowing: relay slam, electrical zap, glass ticks, a sub thump) and
    **`relight(power)`** (a rising electrical swell 0.3 s, three relay slams, the crowd's roar onset).
38. **`exhibit(power)`**: the trophy CLANK: a darker `spotOn` with a low metallic ring (180 + 540 Hz, 0.8 s).
39. **`warDrum(power)`**: a floor tom at 58 Hz with a long body + `kickDrum(0.8·power)`.
40. **`crowdStomp(level)`**: the stands stomping four times on the beat from the call (one stomp per beat),
    louder and denser with `level` (1 = with the wall; 2-4 = for him). `crowdStomp(4)` at 9c 1.60 is the
    relight's trigger: its first stomp is the first sound of the curtain drop, on g 15.2.
41. **`gasp(power)`**: a short crowd inhale (a reversed `ooh` envelope).
42. **`shatter(power)`**: a print breaking: the glass-tick layer of `surge()` (about 30 band-passed ticks,
    3-8 kHz, over 0.15 s) plus a bright 3.2 kHz ping and a short tail; no relay, no sub.
- **Kept**: `tom`, `snare`, `rim`, `hat`, `kickDrum`, `crash`, `crashSwell`, `choke`, `sticks`, `spotOn`,
  `lightsOff` / `lightsOn` (field only), `lampHum` / `hum`, `ole(1-4)`, `ooh`, `duck`, `scrape`, `scuff`,
  `breath`, `rumble`, `clearBus`, and the shared `boom`, `crack`, `kick`, `whoosh`, `shing`, `stinger`,
  `roar`, `crowd`. **Not used**: `timeStop()`, heartbeats, the muffle bus, `sonicBoom()`, plucks, `tick()` (MERIDIAN's).

### 10.9 Folder (`src/cinematic/solo/`)

`common.ts` (PAL / HEX v2, tempo, `SHOT_T0`, `RATE`, `HUM`, `SEQ`, `SCALE`, grades, `soloImpact2`, `beatCam2` (the
grid layer on `kit.keys()`), `bounce`, `StepPrint`; `keys`, `punch` and `PuppetCache` come from `kit.ts`),
`world.ts`, `chorus.ts`, `print.ts` (`StrobePrint`), `turf.ts`, `gluecam.ts`, `frames.ts`
(new `SoloKey`s: SF1-2, SB1-3, EN1, EN1b, EN2, EN3, EN3b, MB1-6, HF1 with the §9.5 fallbacks), `shot1_slam.ts` …
`shot9_curtain.ts` (+ `shot10_encore.ts` only with the ENCORE ending), `index.ts` (`spotlightSolo`), and this brief
as `SPEC.md`. v1's shot files and
`Afterimages` are removed; `docs/skills/SPOTLIGHT_SOLO.md` points to `SPEC.md`.

## 11. Quality bar (what reviewers check)

1. **Still frames read instantly**: who beats whom, with which skill, in which direction. Every frame from 2c
   to 9c holds **one giant hot shape** (beam, halo and god rays, Chorus, gash shafts, strobe chain, neon print,
   the blazing ball). Re-run `compare_keyframes.png`: SOLO's row must read like ZENITH's and CRESCENT's.
2. **Dark world, hot subject**: the §2.2 metric targets on a 6 fps film (deep shadow 50-65 %, hot 3 %+,
   saturated light 5 %+, mean change 0.11+, violent changes 18+, contrast 0.18+). Every additive glow sits on a
   uvDeep halo; nothing blows out to a flat white field; the beam pools reach L > 0.92 and bloom.
3. **The ball**: the §7 sizes (108, 70, 79, 96, 104, 120, 100-114, 72 px); glued except the scripted moments; it
   always has its blacklight glow; it is alive (spinning) even in freezes.
4. **Clutter caps**: one hero formation per frame; at most 5 Chorus copies while a print is on screen; light
   rain only on a hit (0.15-0.25 s; 0.5 s on the cut-in slam); background prints at 60 % rim brightness;
   the four clean money frames of §7 hold.
5. **The hero**: studio-drawn everywhere (never a puppet, including the field and result views); at least 200 px
   in every shot he leads except the crane (275 monument, 235-294 in the skills, 216 over the keeper's shoulder);
   sprite scale changes only on a beat-snap or a hidden swap.
6. **Contact stacks**: the cut, the release and the snap show all 11 listed layers on the same frame; the
   ignition 8; the crack 7; the curtain drop all 7 parts.
7. **Escalation**: No.10's hits grow (sound peak, layers, frame coverage); the curtain drop is the loudest and
   brightest moment of the film; every No.10 skill hit carries a low end of boom ≥ 1.2.
8. **Code tallies**: `cam.hit` sites ≥ 22 (max 1.0); boom sites, counting `stomp` and `lampSlam`, ≥ 20 (max
   1.4); flat refraction shock sites ≥ 14 (never drawn); beam impact sites 7 (10 events); light-gash sites ≥ 12;
   prints 4 (and 4 shatters); roars 3 (OLÉ 2, OLÉ 4, the relight); silences 4; finger snaps exactly 1.
9. **On the beat**: every touch, skill key, slam, OLÉ, strobe pop, body landing, trophy clank and the crowd's trigger stomp lands within one frame of its
   listed time, picture and sound on the same step; every ONE in §4.1 holds.
10. **Feet never slide**: the world scroll equals the stride from the contact anchors; planted boots keep their
    pixels; in the stare and the stop the sole stays on the ball for whole frames.
11. **Opponents overpowered, menace not slapstick**: each defender visibly beaten by a real skill and falling in
    real time right after his strobe pop; the pop leaves a print, never a frozen body; nothing falls late and
    nobody collapses at the relight (only the prints shatter); the keeper is blasted off his feet onto his goal
    line (K2 → `sitBack`, about 0.4 s) and is still down at 1 ON 1 and the freeze; no boards gag, no net bump, no
    defender on his backside after a crossover, no face between the legs, no laugh.
12. **Camera**: the §1.3 grammar is all present; roll 0 (shake roll ≤ 0.015 rad); no dolly zoom; no frozen
    orbit; no chase POV behind the ball (8b is a front ride); the 9b crane frames the whole route (§6 9b numbers); every cut is its listed punch.
13. **Identity and originality**: nothing from the never-list of §1.2; `sat` stays 1; no drawn rings; the mix is
    never filtered; no exposure is ever a decoy; one snap only, no frozen opponents, no simultaneous collapse (not
    Heaven's Time); eyes carry cross glints only, never a horizontal streak; no `tick()`.
14. **Sound**: the snap is alone in the mix; the crowd stomps with the wall first, for him after OLÉ 1, and its
    stomp on his beat is the first sound of the curtain drop; every silence keeps one sound (hum, sub, breath, sticks); loudness peaks at the curtain drop and stays
    under the limiter.
15. **Photosensitivity**: §4.4 holds under the FlashBudget assert on a full capture; pops ≤ 90 px; beam pumps
    ≤ +15 % inside the pool; nothing strobes; no red full-frame event.
16. **Seek and performance**: prints, falls, gashes, the sod carpet, trophy spots and the fuse are pure functions of
    the global time; `sfx.clearBus()` in every `init`; no large canvas allocations per frame; Chorus, print and
    shadow canvases cached in `prepare()` (puppets through the shared `PuppetCache`); ≤ 4 live puppet renders;
    ≤ 1000 live particles (SOLO's budget under the shared `Particles.CAP`); one extra shader program built from
    shared chunks; 60 fps on a low-end phone.
17. **Text and names**: at most three big words on screen at a time; the forbidden word nowhere; "hammer"
    nowhere (the drop beam; boots strike or tap the ball).

## 12. Risks and fallbacks

| Risk | Fallback |
|---|---|
| **Runtime 16.4 s** (v1 11.0 s) may tire repeat players | SP 65; durations fixed for seek; a later "short replay" can start at shot 3 after the first viewing (12.0 s) |
| **Blacks read as a bug** (2b, the smother) | never more than 0.6 s near-black, and every dark frame keeps a glow (ball, eyes, rim, sliver) and a sound (sub, hum, sticks); check at phone size in a bright room |
| **The eyes in the dark scare the youngest** | ivory-violet glints only (never red, never teeth), the smirk, and the hero in full light 1.2 s later; the shadow's eye-slits are 4 × 1 glints, not faces |
| **The beam impact's cone mask slips** | the no-shader fallback of §2.3 (threshold 0.72 + a canvas cone pass); never hero's 0.80 dip-to-black or v1's 0.62 lilac wash |
| **The long shadow reads as a flat smear** | the climbing bands on each lit defender sell the 3D; fallback: the ground strip + eye-slits only, and the money frame becomes the lit, flinching wall |
| **The glue cam's fake yaw reads as a slide** | the stripe bands rotate (not just translate) with ψ, the stands slide at a different rate, the tangent streak is strong (0.10) for exactly the whip frames; fallback: a straight side ride with lateral whip-pans |
| **The prints read as the delayed-defeat trope or as Inazuma Eleven's Heaven's Time** | one snap only (lights out); nobody is ever frozen: each body falls in real time right after its pop and lies on the turf under its print; the relight is caused by the crowd's stomp on his cued beat, not a second snap; at the curtain drop only the prints shatter and nobody collapses; no caption, no pointing. Re-check before shipping that no named anime move leaves glowing photographs of beaten opponents hanging in the air |
| **Clutter** | the §11.4 caps; reviewers check the four clean frames first |
| **Art load** (27 frames + 7 optional; + 4 with ENCORE) | the §9.5 priority and fallbacks; 2 of the 27 are breath variants and 4 are the Tower's re-proportioned RF frames; no turnaround sheets |
| **Performance**: surges + 300 phone lights + Chorus + prints + gashes in one frame | cached sprites (`PuppetCache`), SOLO's ≤ 1000-particle budget under the shared `Particles.CAP`, one extra shader program from shared chunks; test on a low-end phone |
| **GALE v2 overlap** (the ride, the false defeat, the eyes, the gesture, the name) | SOLO's ride is a **front retreating ride** at turf level looking back at him (the ball rushing at the lens, his face under-lit, his boots striking it from behind), never GALE's chase POV behind the ball, and has no vapour; its false defeat is a smother into black, never a stopped ball; SOLO never orbits the ball; its eye glints are short cross stars led by the vertical arm, never GALE's horizontal anamorphic streak; its cue is an open palm raised high to the stands, never a palm at the lens or a blow; "hammer" is used nowhere (the drop beam); GALE never rips turf, snaps or switches lights |
| **MERIDIAN v2 overlap** (shadows, dolly zoom, the tilt, ticks) | SOLO's long shadow is his own, cast by a lamp, touching nobody; no dolly zoom; no sky; no arc above 1.4 m; the crane shares MERIDIAN's `tilt` build item but not its look (no star chart, no needle); no `tick()`; D is MERIDIAN's Tower model, a shared cast member, not a shared beat |
| **ZENITH / CRESCENT overlap** | no fire, no moon, no black/white or crimson impact, no roll; the relight is light, not a GOAL! net payoff |
| **The ending** (the study's v1 complaint: no goal; a dead end without the SHOOT chain) | the §8 ship rule: 1 ON 1 ships only with `field.showBreakthrough()` and the SHOOT chain built and tested; otherwise **ENCORE is the default**. ENCORE (+1.6 s = 4 beats, 18.0 s, result `'goal'`): shot 9 plays to 2.80 with no freeze, card or fade (the curtain drop and 1 ON 1 unchanged), then shot 10 "Encore" (`shot10_encore.ts` / `shotEncore`, 1.6 s, g 16.4-18.0, seed 520) opens on the crowd's fourth stomp: his sole rolls the ball across in front of the keeper still sitting on his line (a drag-back, DragBack DB1-DB2, side), he taps it past him into the net with the inside of his boot (DB3-DB4), the net bellies in lilac light, `GOAL` is stamped by four drop beams (`lampTitle2`, 130 px; never ZENITH's slam or GALE's wind), the cymbal on the ONE of bar 11 (g 17.6), freeze, name card, fade. Its 4 DragBack frames are must-have only if ENCORE ships. **Ask the owner which ending he wants** (§8) |
| **Name** | SPOTLIGHT SOLO was checked in v1; re-check before shipping; fallback VIOLET ENCORE |
| **Old Safari** lacks `StereoPannerNode` | panned drums and whooshes fall back to mono |

## 13. Set-critic revisions (Nov 2026)

Applied after the set critic compared the three v2 briefs. The 9 shots and their durations, 16.4 s, SP 65, the
150 BPM grid and the 7 beam-impact sites (10 events) are unchanged.

1. **Originality (not Heaven's Time).** "Snap, opponents frozen, second snap, all collapse" was the structure of
   Inazuma Eleven's Heaven's Time and the delayed-defeat trope. The first snap (lights out) stays. There are no
   statues: each defender falls in real time right after his strobe pop, which leaves a **neon print** (a cached
   volt/ivory snapshot of the mid-defeat pose) hanging over his body on the turf (`StrobeStatue` → `StrobePrint`,
   `STATUES` → `PRINTS`, `statue.ts` → `print.ts`; bodies land at 7.55 / 10.10 / 11.55 / 13.40 with thuds). The
   relight at g 15.2 is set off by **the crowd stomping on his beat** (`crowdStomp(4)` on beat 3, the four pads
   flaring), cued by his **open palm** to the stands at 15.0; EN2 / EN3 / EN3b are redrawn as that conductor's cue,
   with no finger snap. At the curtain drop the four prints shatter into glass and light (`shatter()`); nobody
   collapses. Updated: intro, playground test, §0, §1.2, §1.4, §3, §4, §5, shots 5-9, money shots 5, 9 and 10,
   §11.11, §12.
2. **9b crane** on the shared `DownPitchView.tilt`: end key x 780, z 262, h 220, f 470, principal point y 180,
   tilt 0.80 (ignition gash y ≈ 424, prints A ≈ 322, B ≈ 294, C ≈ 184, D ≈ 171, the mark ≈ 108, the keeper ≈ 40;
   defenders 28-37 px). The 1.00-1.20 whip-tilt is a tilt ramp 0.80 → 0.10. No.10's crane cache is 0.25x.
3. **8b re-axised** as a front retreating ride at turf level looking west (`drawUpPitch`, eye 0.1 m, 0.60 → 0.52 m
   ahead of the ball, f 240, tilt −0.50): the ball 100 → 114 px rushing at the lens, his boots striking it from
   behind (MB3, MB3 mirrored), his face under-lit by the ball, D's pop behind him lighting him from behind so his
   and the ball's shadows shoot at the lens. The keeper is never in frame; the match cut on the descending sole
   stays. GALE's chase POV is on SOLO's never-list.
4. **Ending.** (a) The relight blasts the keeper off his feet onto his goal line (K2, then `sitBack`, 1.62-2.02), so
   1 ON 1 and the freeze show a beaten keeper (the 9c camera moves 1 m back into the goal mouth; the result view
   starts him seated). (b) §8 ship rule: 1 ON 1 ships only with `field.showBreakthrough()` and the SHOOT chain built
   and tested; otherwise the ENCORE goal (§12: shot 10, +1.6 s, result `'goal'`, 4 DragBack frames) is the
   default. The `R REPLAY · SPACE KICK-OFF` dead end is gone. (c) The owner is asked which ending he wants (§8).
5. **Eyes.** The 420 px anamorphic glint, the 120 px streak flares and the 240 px glints (shots 1, 2b, 2c, 3, 9c)
   are stage-light cross glints: 4-point stars, arms ≤ 60 px, the vertical arm longest (`eyeGlow.cross`,
   `longShadow`). Horizontal eye streaks stay GALE's.
6. **No comedy.** D's upside-down face is replaced by his knees buckling inward (`kneeBuckle`, a 2-frame puppet
   leg pose); the laugh at his topple is a gasp into OLÉ 4; RivalUpside RU1 is dropped (optional 8 → 7) and
   `lookThrough` is unused; the shot 3 gulp is breath only (no `tick()`).
7. **Naming.** "Hammer beam" is the **drop beam** everywhere (`stage.pillar` slams, the `lampTitle2` stamps, shot
   text); the boots strike or tap the ball; "hammer" is on the never-list.
8. **Shared engine.** `drawUpPitch` is the reverse direction (`v.dir` −1) of the one pitch renderer (shared
   projector, stripes, lines, towers and banks, the shared tilt; no `projectUp`); `PuppetCache` moves to `kit.ts`
   as the set's only puppet cache; cameras are `kit.keys()` tracks with `kit.punch()`, `beatCam2` a thin grid layer;
   `drawPhoneLights` gains `n` / `wave` / `sway` (no `phoneSea`); the single `Particles.CAP` (SOLO's budget
   ≤ 1000 live); `FINAL_SOLO = buildFinal([IMPMASK, FLATSHOCK, STREAK, ECHO])` with GALE's `STREAK` chunk byte for
   byte; `FlashBudget` imported unchanged from GALE v2 §10.1 item 6.
9. **Cast and art.** D is MERIDIAN v2's Tower (one Rivals model sheet: armband, 1.3x bulk). His RF frames are drawn
   on that body (RF1T-RF4T: +4, the only count change, so 27 must-have frames), the optional FF1 reuses TF3's head,
   and KeeperBack K1 / K2 come from GALE's keeper model sheet (K2 redrawn as the blast off his feet). EN2 / EN3 /
   EN3b are redrawn for the cue, so No.10 stays at 17 frames.
10. **Identity table.** §1.1 is now the shared set table (rows added: signature post effect, gesture, keeper beat,
    false defeat), its ZENITH, CRESCENT, GALE and MERIDIAN columns copied word for word from GALE v2 §1.1 (MERIDIAN:
    26 m inside the bowl, never above the roofs; the chase-crane catch and ride up the arc; the Tower flung by a
    pluck; 16.8 s / 70), with one source file, `docs/skills/SET_TABLE.md`. SOLO's revised column goes into that
    file first; the GALE and MERIDIAN briefs copy it at their next sync.

## Production note (file paths)
Shot files live directly in `src/cinematic/solo2/` (for example `src/cinematic/solo2/shot1_*.ts`). If a task prompt shows a doubled path such as `src/cinematic/solo2/src/cinematic/solo2/shotN_x.ts`, it means `src/cinematic/solo2/shotN_x.ts`: edit and copy back that file; never create a nested `src/cinematic/solo2/src/` folder.
