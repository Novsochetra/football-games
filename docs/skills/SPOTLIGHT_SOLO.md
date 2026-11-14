# SPOTLIGHT SOLO: shot spec

No.10's special dribble. Four white shirts wall off the box. The floodlights crash off bank by bank,
one follow-spot finds No.10, and the pitch becomes a stage. His feet play a drum solo: every touch
is a drum hit and every skill lands on the beat. On every beat the light keeps an **ultraviolet
exposure** of him, like a strobe photograph, so the shape of each trick hangs in the dark for a
moment after he has gone.
Step-over, sole lift over a slide tackle, elastico, nutmeg: four defenders, four real skills, and
four OLÉ!s from the crowd. On the last beat his sole stops the ball dead on the penalty spot. A
second spot clunks on over the keeper, and the floodlights slam back on: one on one.

This is No.10's special dribble, a sibling of ZENITH METEOR (`../zenith/`), CRIMSON CRESCENT
(`../crescent/`) and GALE HAMMER (`../gale/`): same engine, same pixel art + post-FX look, same punch.
It is **smaller than every shot**: 11.0 s, it never leaves the grass, it scores no goal and it never
beats the keeper. Every beat, camera move and colour grade is its own.

Where it came from: the footwork, rhythm and sound structure of the SQUALL LINE concept (step-over
feint, sole-lift hurdle, elastico, drum-fill touches, the crowd counting OLÉ!s, the dead-ball
ending), staged with SILK SERENADE's stage idea (the stadium dims under a follow-spot, chronophotograph
afterimages of No.10, every move a beat). Everything about air, weather, pressure, sonic booms,
rings, threads and strings has been removed. The identity is now **rhythm, stage light and
afterimages**.

The one-line read for kids: **every beat leaves a print of light.** The violet exposures show the
path his feet just drew; the defenders are beaten by the real skill, and the real No.10, in full
colour, has already gone.

**Originality guard.** An exposure is never a decoy: no defender ever tackles a ghost that then
vanishes. That "afterimage technique" gag is a well-known anime trope, so here the exposures only
record the rhythm (like a chronophotograph) and fade on the beat grid. Defenders are fooled by the
real feints (the body sell, the shown ball), as in real football. The name was checked by web search
(Nov 2026): no game or anime move called "SPOTLIGHT SOLO" turned up. Re-check before shipping.

**Set-critic fixes** (Nov 2026; these keep the five specials apart, see the identity table):
- the decoy-ghost gag is gone (see the originality guard);
- the impact frame is bright ultraviolet / ivory: the old deep-indigo / ivory was nearly CRIMSON
  CRESCENT's silver/indigo;
- no desaturation anywhere (colour is MERIDIAN THREAD's dimension): the darkness is light only;
- C no longer falls on his backside (two backside falls in a row echo the anime "ankle break"): he
  freezes in a comic split and topples sideways;
- the four-defender field set-up, the shared `duck(depth, dur)` signature, and the motion-library
  frame IDs (FrontTouch, Break) are written into the shots.

## Identity: the five-skill set

This table is identical in all three new briefs (GALE HAMMER, MERIDIAN THREAD, SPOTLIGHT SOLO). If one
brief changes a row, change it in all three.

**The set rule: each special changes exactly one dimension of the world, and never touches another
skill's.** ZENITH METEOR changes altitude, CRIMSON CRESCENT orientation, GALE HAMMER sound, MERIDIAN
THREAD colour, SPOTLIGHT SOLO light. So GALE HAMMER never desaturates or dims the lights, MERIDIAN
THREAD never filters or silences the sound and never dims the lights, and SPOTLIGHT SOLO never
desaturates and never filters the sound.

| | ZENITH METEOR | CRIMSON CRESCENT | GALE HAMMER | MERIDIAN THREAD | SPOTLIGHT SOLO |
|---|---|---|---|---|---|
| Move | sky volley (power shot, top tier) | bicycle kick | long-range power shot, one tier below Zenith | no-look outside-of-the-boot through pass, assist for No.7 | special dribble, ends 1-on-1 (no goal) |
| What it changes | **altitude**: up into the sky and down as a meteor | **orientation**: the stadium turns upside down | **sound**: the world goes mute and the thunder arrives late | **colour**: the world drains to manga ink, the players stay in colour | **light**: the floodlights die and one follow-spot lights him |
| Palette | fire orange / gold, night blue | crimson + silver, indigo night | ice white, electric cyan, cobalt, navy; high-key floodlit | jade / emerald + pearl on manga ink + warm paper | ultraviolet / violet + ivory over plum |
| Space | vertical | rotation | horizontal and low (knee height) | horizontal, human scale | a stage: one pool of light in the dark |
| Signature camera | tilt up into the sky; POV meteor at the lens | camera roll, inverted stadium | **the recoil** off the contact, then a tracking side rail at grass level, knocked back by each late boom | **the manga page**: locked panels that the ball crosses, a page-pan between them; over-the-shoulder read; broadcast crane | **the beat-snap**: holds still, snaps only on the beat |
| Signature shapes | meteor, flames, full moon | crescent arcs, blades, crescent moon | pressure rings stamped in the turf, isobars, the squash ellipse, the Mach chevron | one taut thread with one long bend, almond needle eyes, running stitches, the cross-stitch X, manga panels | soft light pools, tapered beams, chronophotograph exposures (afterimages), stage lamps |
| Signature effect | flame aura, shock rings in the sky | slash split (`fx.cut*`) | pressure lens (`fx.lens*`) + muffle bus | ink page (`inkGrade`, canvas only) | beat echo (`fx.echo*`) + stage dim |
| Ball scene | ride the ball up through the clouds; the meteor POV down | the crescent orbit, overhead | **air steps**: three stamps on a side rail, the ball never touches the grass | **the needle's-eye page**: three locked panels, three needle eyes, one bending curve | **the sole lift**: sole on, drag, scoop, flick, hurdle the slide; the strobe chain of the ball |
| Defender beat | two blasted aside by the meteor | three blasted aside by the comet | a jump-block hopped under, then flung by the late boom; one spun down | beaten by the disguise: a poke tackle, the scissors, a stretching heel | four real skills: step-over, sole lift over a **slide tackle**, elastico, nutmeg |
| Impact frame | black/white, red/black | crimson/black, silver/indigo | **cobalt / ice, high-key** (`impThresh` 0.35) | **no shader impact**: a canvas ink freeze (the world in ink, the players in colour) | **ultraviolet / ivory**, mostly bright violet |
| Own transition | flash | white crescent-blade wipe | ring-pop, cyan blink | thread wipe (a straight taut edge), paper flash | spot iris, ghost wipe |
| Signature sound | roar, fire, time-stop | metal shing, heartbeats | **the mute, then the late thunder**; the ear-pop; air tones only on the title and the palm blow | **the plucked string**: each needle eye plucks the next note (E–F#–A → D); watch ticks | **the drum solo**: stick count-in, tom touches, the fill, the cymbal choke; the crowd's OLÉ count |
| Ending | GOAL! slam, the net tears | lands back to goal and never turns | **the palm blow**, net ballooned (never torn) | fingertip-to-fingertip diptych with No.7 | sole on the ball on the spot, chin up, 1 ON 1 |
| Runtime / SP | about 17 s / 80 | 15.3 s / 90 | 11.3 s / 60 | 10.9 s / 50 | 11.0 s / 50 |

**Shared engine tools, not shared looks:** hit-stops, the impact shader (each with its own colours),
`focusLines`, `slamTitle`, the name card, `stinger()` (Zenith, Crescent, GALE and SOLO cut-ins),
`studioAnim`, `drawDownPitch`, the one `crowdBus` with `duck(depth, dur)`, and `sfx.clearBus()`.

### SPOTLIGHT SOLO owned motifs and palette

**Reserved for SPOTLIGHT SOLO** (other skills must not use these): the lights-down and follow-spot
stage, chronophotograph afterimages of No.10 and of the ball, the beat echo post effect, the
beat-snap camera, the ultraviolet / ivory / plum palette, the four-count lamp HUD, the marquee skill
tags, the drum-kit footwork sound with the stick count-in, the cymbal choke into silence, the
crowd counting OLÉ!s, and the **slide tackle** as a featured beat (the other specials use a
jump-block and a poke tackle instead).

**Never in SPOTLIGHT SOLO**:
- air, wind, weather, pressure, vapour, sonic booms or a master muffle (GALE HAMMER owns those);
- rings of any kind: no `ring()`, no `fx.shocks`, no ripples, no concentric outlines (the follow-spot
  pool is always a filled soft-edged pool, never an outline);
- threads, strings, stitches, staves, needles, ink line-art, paper tones, halftone or manga panel
  splits (the pass owns those);
- cyan, aqua, cobalt or jade; fire, gold (except the shared UI card), moon, crescents or sky shots;
- camera roll (roll is 0 in every shot, apart from shake);
- `timeStop()` and `roar()` (the shots' signatures);
- desaturation or any colour drain (MERIDIAN THREAD): `sat` stays 1 in every shot;
- a low-pass or any filtering of the mix (GALE HAMMER): the silence at the end is a musical stop
  (the choke) plus a crowd `duck`, never a filter;
- heartbeats (CRIMSON CRESCENT) and plucked strings (MERIDIAN THREAD);
- decoy ghosts that a defender hits and that blink out.

The darkness is made by **light, not ink**: a dimmed stadium in plum and violet with points of light
in it, never black outlines on paper. Ivory is only ever *light* (the spot core, glows, the ball,
the title), never a flat full-frame ground, so it never reads as the pass's paper.

### Palette (`PAL` in `./common.ts`)

| key | hex | RGB | use |
|---|---|---|---|
| `uv` | #7A4DFF | 122,77,255 | afterimage bodies, beat echo tint, title stroke, violet glows, impact dark tone |
| `lilac` | #C9B6FF | 201,182,255 | afterimage rims, defender rims in the dark, fluorescent pitch lines, tag text accents |
| `ivory` | #F6F0DF | 246,240,223 | the spot's light core, ball and boot glow, title fill, impact light tone |
| `uvDeep` | #2A1660 | 42,22,96 | dark halo under **every** violet glow, unlit lamp pads |
| `plum` | #160A26 | 22,10,38 | the dark stage, backdrops, outer title stroke |
| `dim` | multiply [70,52,120] | — | the stage dim layer at level 1 (it darkens and pulls the world toward violet) |
| `kit` | #DF2321 | 223,35,33 | his shirt: the only warm colour on screen |

- Grade for every shot unless noted: `tint` [238,230,255], `sat` 1.0, `contrast` 1.06, `bloom` 0.7,
  `bloomThresh` 0.74, `vignette` 0.55, `ca` 0.0015. The darkness comes from the stage layer, not the
  grade.
- Impact frames: `impA` [122,77,255] (bright ultraviolet), `impB` [246,240,223], `impThresh` 0.62,
  so most of the frame flashes saturated violet and only the brightest pixels go ivory. 1-2 frames
  each. Never a near-black indigo dark tone (that reads as CRIMSON CRESCENT's silver/indigo).
- Ball: `drawBall(..., 'blacklight')`. Under ultraviolet light white glows: the ball's white panels and
  No.10's white boots are the brightest things in the dark. **The footwork is literally lit up.**
- Particle ramps: `'uv'` and `'mote'` (dust drifting in the beam), plus the existing `'dust'` and
  `'grass'`.

## Continuity (all shots)

- Night stadium. **No moon and no sky shot.** In shots 2-6 the house lights are down.
- The goal is to the **right** (+x). In side views No.10 runs **east**: his studio Side view,
  unmirrored (`HERO_FACING = 1`).
- In front views the camera stands between him and the goal and he runs at the lens, so screen-left
  is **his right**.
- **The follow-spot rigs hang on the roof of the main stand.** His beam always enters from the top of
  frame (top-right in side views, top-centre in front views). It lights a pool on the turf under him,
  so his shadow is short and directly beneath him. The one exception is shot 5, where the spot sits
  behind the camera like footlights. The keeper's beam (shot 7 only) enters from the top-left.
- Defenders wait **in the dark** as dim plum figures with lilac rims. A tackle comes out of the dark
  into the light. A defender inside the pool is drawn in full colour.
- Defenders are always **side-on** (profile puppets), except D in shot 6, who is a back-lit
  silhouette.
- Kits: `RIVAL_KIT` (A), `RIVAL_KIT_B` (B), `RIVAL_KIT_C` and `RIVAL_KIT_D` (new hair variants for C
  and D), `KEEPER_KIT`. `HERO_KIT` is used for colour reference only.
- **No.10 is always studio-drawn** (`studioAnim`), and close-ups use the hand-drawn face
  (`env.art.hero`). He is never a puppet anywhere in this special, including the result view.
- Each defender is beaten by a **different, readable, real skill**: A by a STEP-OVER, B by a SOLE
  LIFT over his slide, C by an ELASTICO, D by a NUTMEG. The light only frames each one.
- The skill route zigzags: escape to his right (A), straight over (B), escape to his left (C),
  straight through (D).
- Falls stay comic (a knee skid, a spin-out, a sit-down, a look between his own legs). Nothing hits a
  head and no studs touch a body or the ball.

## The beat (tempo map)

The whole special runs on one tempo: **150 BPM**. A beat is 0.4 s (24 frames), an 8th 0.2 s, a 16th
0.1 s (6 frames), so every hit sits exactly on the 1/60 s grid.

- Shot 1 is the count-in: four stick clicks on 8ths (0.6, 0.8, 1.0, 1.2). The grid's beat 0 is global
  1.4 s, the first frame of shot 2.
- Shots 2-7 last whole beats (3, 4, 5, 3, 3, 6), so the grid runs unbroken across every cut.
- Every touch, skill key, lamp and OLÉ lands on the 16th grid, and the big moments land on the ONE
  of a bar:

| Bar | Global | Shot | On the ONE |
|---|---|---|---|
| 1 | 1.4 s | 2 | the first floodlight bank crashes off |
| 2 | 3.0 s | 3 (0.4) | **THE SELL** of the step-over |
| 3 | 4.6 s | 4 (0.4) | **SOLE ON** the ball |
| 4 | 6.2 s | 5 (0.0) | the elastico approach (its SNAP is beat 2, 6.6 s) |
| 5 | 7.8 s | 6 (0.4) | **THE POKE** through the legs |
| 6 | 9.4 s | 7 (0.8) | **SOLE STOP** on the penalty spot, the final hit |

- `rate()` slows only the simulation, never the shot clock, so the music never drifts. **A hit-stop
  or slow-motion window is a rest in the bar, never off the grid.**
- No.10's studio frames are keyed to the times listed under each shot, not to the studio `ms` holds
  (those are for studio preview). Contact frames always land exactly on their drum hit.
- `common.ts` exports `BPM = 150`, `BEAT = 0.4`, `GRID0 = 1.4` and `onGrid(t)` (a dev assert that
  warns if a listed cue is off the 16th grid).

## Field scenario `'gauntlet'` (`src/game/field.ts`)

**Setup**
- 87th minute, 0-0. No.10 picks the ball up at field x 690, z 262 and runs right with the existing
  small-touch logic. He is drawn from the motion library's **Dribble** cycle as a box-filtered cache
  at the field scale (built in `prepare()`), not the field puppet: no new drawings, and No.10 is
  never a puppet anywhere in this special.
- Four defenders in a staggered wall:
  - A presses from his right: x 900, z 296 (`RIVAL_KIT`)
  - B covers the near lane: x 965, z 300 (`RIVAL_KIT_B`)
  - C holds the far side of the box edge: x 1015, z 244 (`RIVAL_KIT_C`)
  - D is the last man, central: x 1055, z 272 (`RIVAL_KIT_D`)
  - C and D are the two extra defender actors (`defC`, `defD`) that MERIDIAN THREAD's `'through'`
    scenario also adds; build them once, gated to `'through'` and `'gauntlet'`, so `'dribble'`,
    `'cross'` and `'longshot'` are unchanged. `RIVAL_KIT_C` / `RIVAL_KIT_D` (hair and skin variants)
    are shared with the pass.
- The keeper is on his line at x 1168, z 282.
- Intro caption: `No.10 FACES A WALL OF FOUR`.
- Defenders close toward (A h.x+50, h.z+26), (B h.x+105, h.z+36), (C h.x+150, h.z−20),
  (D h.x+185, h.z+8). The existing clamp stops them overlapping him.
- The intro skip in `game.ts` jumps to hero x 850 for `'gauntlet'`.

**Command window**
- It opens when A is about 40 px away (hero x ≥ 860), with `blip(660)`. Time eases to 0.06 as now,
  and the four defenders' run cycles crawl so the wall visibly closes in.
- Stage theme: the field floodlights dim to 70% and a soft ivory floor pool settles around No.10's
  feet (it replaces the rising aura glows; where motes are still drawn they use the `'uv'` ramp, from
  the one shared mapping in `field.ts`: zenith → `'aura'`, crescent → `'crimson'`, gale → `'cobalt'`,
  meridian → `'jade'`, solo → `'uv'`). **The tempo starts here**: the panel's four lamp pads chase at
  150 BPM and the gauge pulses on every beat.
- Accent ultraviolet: the border #7A4DFF, the gauge gradient #2A1660 → #7A4DFF, a lilac portrait glow.
- Menu rows:
  - **DRIBBLE** is lit: `> SPOTLIGHT SOLO  SP 50`.
  - SHOOT is dimmed: `OUT OF RANGE`.
  - PASS is dimmed: `LANES CLOSED`.
  - Prompt: `SPACE / TAP · TAKE THE STAGE`.
- **Bridge into the cinematic** (0.15 s, skipped when autoplay is on): on confirm, `sticks()`, the
  floor pool snaps tight onto his feet, every field light drops to black in one frame, then a hard cut
  to shot 1 (which opens on black). Build it as a short `launch` sub-mode in Field; `game.confirm`
  waits for it before `unleash(0)`.

**Result: `'breakthrough'`** (new `SpecialDef.result?: 'goal' | 'breakthrough'`, default `'goal'`)
- The view picks up from the cinematic's last frame, floodlights on:
  - No.10 on the penalty spot (x 1114, z 282) with his **sole on the ball**, drawn from Settle F3 out
    of a half-size cache built at load (no puppet No.10).
  - The keeper crouched wide at x 1150 (`gkSpread`).
  - The four defenders down: A kneeling at (925, 276), B face-down at the end of his slide at
    (935, 300) with a streak of torn turf behind him that fades over 3 s, C on his hip after his
    comic split at (1030, 256) (`sideTopple`), D sat back at (1062, 276).
- Fade up from [8,4,14] as today. Banner: `BREAKTHROUGH · 1 ON 1`. Crowd `crowd(3, 0.35)`.
- **Chain hook**: the command window reopens with **SHOOT** lit, offering ZENITH METEOR (the
  dribble-fed power shot, inside its 25 m range; GALE HAMMER is a 25–35 m shot and stays dimmed), so
  the dribble flows into a shot like a combo (`game.ts`: on `special.done` with result `'breakthrough'`, call
  `field.showBreakthrough()`; a confirm there selects the shot and unleashes it).
- Fallback if chaining is out of scope: the banner, then `R REPLAY · SPACE KICK-OFF`.

**Registry** (`specials.ts`): `{ id: 'solo', name: 'SPOTLIGHT SOLO', kind: 'Special dribble', scenario: 'gauntlet', cost: 50, result: 'breakthrough', shots: spotlightSolo }`.
Extend `SpecialId` with `'solo'` and `Scenario` with `'gauntlet'`.

## Shots (durations are fixed: do not change them)

| # | File / export | Dur | Seed | `name` |
|---|---|---|---|---|
| 1 | `shot1_countin.ts` / `shotCountIn` | 1.4 | 501 | "Count-in" |
| 2 | `shot2_lights.ts` / `shotLights` | 1.2 | 502 | "House lights" |
| 3 | `shot3_stepover.ts` / `shotStepOver` | 1.6 | 503 | "Step-over" |
| 4 | `shot4_sole.ts` / `shotSoleLift` | 2.0 | 504 | "Sole lift" |
| 5 | `shot5_elastico.ts` / `shotElastico` | 1.2 | 505 | "Elastico" |
| 6 | `shot6_nutmeg.ts` / `shotNutmeg` | 1.2 | 506 | "Nutmeg" |
| 7 | `shot7_mark.ts` / `shotOnTheMark` | 2.4 | 507 | "On the mark" |

Total **11.0 s** at 1×.

| # | Shot | What happens | Cut into the next shot |
|---|---|---|---|
| 1 | Count-in | A follow-spot clunks on and its pool is the window: his eyes, the feint in his pupils, a glint. Four stick clicks light the title word by word | Iris down onto his eye, black |
| 2 | House lights | The wall of four in a lit stadium. Two floodlight banks crash off on the beat, phone lights twinkle in the dark stands, the follow-spot slams onto him | Match cut on a touch |
| 3 | Step-over | Front view: the step-over sells screen-right; A bites on the body feint while its violet exposure hangs in the dark, and No.10 cuts the other way. OLÉ! 1 | Spot iris to black |
| 4 | Sole lift | **The ball's scene**: sole on, drag, scoop, flick, hop. B's slide comes out of the dark under his boots while the ball's arc freezes into a strobe chain of violet balls. OLÉ! 2 | Whip pan |
| 5 | Elastico | The ball is shown left and snapped right in two frames; a strobe of the ball draws the hairpin V, and C stabs at its empty end. OLÉ! 3 | Ghost wipe (his afterimages sweep the frame) |
| 6 | Nutmeg | Reverse angle: D's legs form an arch; the ball rolls through it at the lens; D looks back between his own legs. OLÉ! 4, the loudest | Hard cut |
| 7 | On the mark | Last touches, brake, **the sole stops the ball dead on the penalty spot** on the final drum hit; choke into silence; the keeper's spot clunks on; the floodlights slam back on; name card | Fade to [8,4,14] |

**The four-count** (HUD, shots 2-7): four 12×12 lamp pads numbered 1-4 sit top-right (x 566-622,
y 16) on a plum pill. They are unlit (uvDeep, lilac 1 px border, numeral at 40%) until each OLÉ!.
Then the pad flares ivory for one frame and stays lit (ivory core, plum numeral, violet glow over a
uvDeep halo) with a small lamp clunk. Kids count along: 1, 2, 3, 4. It is hidden from the shot 7
freeze, where the name card says it.

**Marquee tags** (shots 3-6): a small pixel-font tag (ivory text) in a plum pill with a 1 px lilac
border and a row of six tiny lamp dots along its top edge that chase on 16ths. It names the real
skill: `STEP-OVER`, `SOLE LIFT`, `ELASTICO`, `NUTMEG`. It slides in 12 px from the left on the beat
(3 frames), holds 0.6 s and fades out (4 frames). Young players learn the real move names.

**Afterimages** (the special's language): a ghost is one of No.10's studio frames frozen where he
**was**, drawn as an ultraviolet silhouette (`uv` body, 1 px `lilac` rim on the side facing the
beam, normal blend), starting at alpha 0.6 and fading over its life (default 0.6 s of shot time).
Ghosts are dropped only on listed beats, at most 6 hero ghosts and 9 ball ghosts alive. Ball ghosts
are lilac discs with a 1 px `uv` edge. ("Ghost" is shorthand for one exposure.)
- **Exposures never interact with anyone.** Nobody tackles, touches or passes through one to make
  it vanish. Each dies on the grid like a strobe decay: over the last three 16ths of its life its
  alpha steps 0.6 → 0.4 → 0.2 → 0.
- Defenders are beaten by the real feint (the body sell, the shown ball, the dipped shoulder). The
  exposure only shows the shape the trick drew.

**Beat flare**: on each skill key the follow-spot pool brightens by up to 25% and grows 6% for 2
frames, with a lamp tick. It is local to the pool, never a full-frame flash.

### 1 · Count-in (1.4 s)
Declare the move. It is the same family as the other cut-ins (eyes, glint, title, tag), but here a
spotlight *is* the window and the title arrives on a drummer's count.
- 0.00: total black. `stinger()`.
- 0.05: **CLUNK.** A follow-spot slams on from the top-right. A tapered beam (top 30 px, bottom wide)
  falls to a horizontal oval pool of ivory light centred at (320, 140): it snaps on at 70% size (a
  2-frame lamp ramp) and opens to rx 250, ry 72 over 0.15 s (`ease.outBack`).
  - **The pool is the panel.** Inside it: No.10's eyes close-up (crop of `art.hero.face`,
    nearest-neighbour ×5, slow push 1.0 → 1.06), lit warm. The pool edge is a 12 px soft falloff into
    the plum stage, never an outline.
  - Outside it: plum-ink with a faint `uvDeep` haze around the pool, dust motes drifting in the beam.
- 0.15-0.35: **the feint is in his eyes first.** His pupils dart screen-left at 0.20 (Glance G2L) and
  screen-right at 0.30 (Glance G2): drawn face crops on the same pixel grid, no smearing. Each dart
  leaves a 2-frame violet exposure of the pupils at their old position: the afterimage idea in
  miniature.
- 0.45: glint. `sparkle` on both eyes plus a lilac `lensFlare` (tint [201,182,255]) and a beat flare
  of the pool.
- 0.55: the pool eases up to y 118 and narrows to rx 220 to make room for the title below it.
- **0.60, 0.80, 1.00, 1.20: the count-in.** On each stick click a small lamp snaps on above one word
  group and drops a narrow cone of light onto it, and the group lights (`lampTitle`): `SPOT` (0.60),
  `LIGHT` (0.80), `SO` (1.00), `LO` (1.20).
  - Before it lights, a group is a faint plum shape (uvDeep stroke at 30%).
  - Lit: TITLE_FONT 56 px at y 262, ivory fill, 2 px `uv` stroke, 3 px plum outer stroke.
  - As each group lights, a violet echo copy slides 6 px left and fades over 0.2 s, and `fx.echo`
    runs for 3 frames (offset −0.01 UV, centred on the group, `echoR` 0.2).
  - Under the title, four small lamp pads light one per click: the four-count, foreshadowing four
    defenders.
- 1.05: the tag `SPECIAL DRIBBLE · No.10` slides in under the title (pixel font, lilac).
- 1.20: on the fourth click the whole title flares (one frame of +20% brightness).
- 1.25-1.40: every lamp CHUNKs off except the eye pool, which **irises down onto his right eye**
  (rx 220 → 6 over 0.12 s). Two frames of black, then a hard cut onto the downbeat.
- FX: `bloom` 0.75, `bloomThresh` 0.76, `vignette` 0.65. No impact frame and no white flash.
- Audio:
  - 0.00: `stinger()`, the shared special-move signature.
  - 0.05: `spotOn(1.0)`, a heavy lamp clunk, then the quiet lamp hum.
  - 0.20 and 0.30: `hat()` ticks on the eye darts.
  - 0.45: `shing(1.2)`.
  - 0.60, 0.80, 1.00, 1.20: `sticks()`, each with a soft `spotOn(0.3)`. The drummer counts in: 1, 2,
    3, 4.
  - 1.00-1.40: `crashSwell(0.4)` (a reversed cymbal) rising into the downbeat of shot 2.
  - 1.25: `lightsOff(0.4)`.
- Motion: face crop G1 → Glance G2L (0.20) → G2 (0.30), integer ×5.

### 2 · House lights (1.2 s)
Show the wall of four, then turn the stadium into a stage.
- Medium-wide side view at chest height. Ground line y ≈ 300, horizon y ≈ 170. Crowd at parallax
  0.25, two floodlight towers visible at parallax 0.5.
- No.10 (**Dribble**, scale 2, pelvis at x ≈ 170) runs right. The world scrolls left at stride
  speed read from the contact anchors, so the planted foot never slides; the holds shorten (below), so
  he visibly accelerates into the wall.
- The wall reads in one still frame, left to right: A nearest (x ≈ 430, puppet scale 2, `jockey`),
  B deeper (scale 1.6, y −16), C and D deeper still (scale 1.3), the keeper small on his line, the goal
  mouth at the right edge.
- Camera (beat-snap keys): 0.00 wide (zoom 1.0, the whole wall); **1.00 snap** to No.10 and A
  (zoom 1.3, centred between them).
- **0.00 (beat 0, the ONE): CHUNK.** The far-left and far-right floodlight banks die in one frame
  (lamp grids go dark, their glow sprites fade over 3 frames). Stage dim 0 → 0.45. The crowd's
  "ooooh" rises.
- **0.40 (beat 1): CHUNK.** The remaining banks die. Stage dim → 0.8: the stadium is plum and violet.
  - **Phone lights**: about 60 steady ivory/lilac points come on across the dark stands, each
    twinkling slowly (±30%). Drawn after the dim layer, because they are light sources.
  - The pitch lines fluoresce faintly lilac (redrawn after the dim at alpha 0.3).
- **0.80 (beat 2): SPOT ON.** The follow-spot slams onto No.10 from the top-right:
  - a beam from (560, −30) down to his pool (ivory, additive at most 0.18, over a normal-blend plum
    underlay at 0.2 so it never blooms white against the stands);
  - a floor pool under his feet (rx 70, ry 12, ivory 0.35);
  - the stage hole around him (screen ellipse rx 90, ry 130, soft 40 px);
  - a beat flare.
  - The four defenders become dim plum figures with lilac rims. His boots and the ball glow ivory.
  - The four-count pads fade in top-right, unlit.
- 1.00-1.20: A steps up into the edge of the pool (`jockey`); the half of him nearest No.10 is lit.
  The shot cuts on the next touch, a match cut on the action.
- **Touches** on 0.00 (right), 0.40 (left), 0.80 (right), 1.00 (left): quarter notes, then a pickup
  8th. Each touch keeps the ball within one foot-length.
- **Ball:** glued to him, never more than one foot-length (≈ 24 px at scale 2) ahead, spin locked to
  its ground speed. Its ivory glow brightens when the spot lands.
- Audio:
  - 0.00: `lightsOff(1.0)` + `tom(D2)`.
  - 0.40: `lightsOff(0.9)` + `tom(D2)`.
  - The crowd: `crowd(1.2, 0.18)`, then `duck(0.5, 0.6)` (the hush: depth 0.5 for 0.6 s), then an awed `ooh(0.3)` at 0.55
    as the phone lights appear.
  - 0.80: `spotOn(1.0)` + `tom(F2)`; `lampHum` starts (it runs whenever the spot is on).
  - 1.00: `tom(A2)` + `hat()`.
  - Quiet stud scuffs on every footfall.
- Motion: **Dribble** F1 0.00 · F2 0.10 · F3 0.20 · F4 0.30 · F5 0.40 · F6 0.50 · F7 0.60 ·
  F8 0.70 · F1 0.80 · F2 0.85 · F3 0.90 · F4 0.95 · F5 1.00 · F6 1.05 · F7 1.10 · F8 1.15.
  Defenders: `jockey` (new), cached `run1-4`; keeper `gkReady`.

### 3 · Step-over (1.6 s): defender A
- Front view from a worm's-eye camera between No.10 and the goal (knee height). The perspective pitch
  recedes to the halfway line; the dark stands sit at the top with their phone lights.
- No.10 (**StepOver Front**, scale 2, feet at y ≈ 322) runs at the lens inside his pool (screen
  ellipse rx 110, ry 150; floor pool rx 90, ry 22). The beam comes from the top of frame.
- A (puppet scale 2.4, a little nearer the camera than No.10) comes in from **screen-left facing +1**,
  jockeying sideways in the dark (plum with a lilac rim), closing from x ≈ 150 to x ≈ 240 by 0.40.
- 0.00 (beat 3): FrontTouch FT1, an approach touch with the right foot.
- 0.14: F2. The right foot plants beside the ball on its screen-left side; the left knee lifts.
- 0.27: F3. The **left** leg circles over the ball from inside to outside; the shoulders start to dip.
- **0.40 (beat 4, the ONE): THE SELL** (F4, held until 0.60). The left foot lands wide on
  screen-right; shoulders and head drop to his left. Everything says "I'm going right".
  - HIT-STOP: `rate` 0.1 from 0.40 to 0.60.
  - A beat flare, and a violet ghost of F4 is dropped exactly where he stands (life 0.9 s), with F2
    and F3 ghosts behind it (life 0.5 s): a chronophotograph of the step-over.
  - `fx.echo` 0.8 for 4 frames, offset **+0.012 UV** (echoes to screen-right), centred on him,
    `echoR` 0.35: the fake throws its light to the right.
  - Two frames of ultraviolet/ivory impact frame.
  - Beat-snap: zoom 1.0 → 1.12 on No.10.
  - **A bites on the body feint**: a full-stretch lunge toward screen-right (`lungeCommit`) into the
    space the sell pointed at, beside the F4 exposure. He turns full colour as he enters the light.
- 0.45: tag `STEP-OVER`.
- 0.60: F5. Full weight on the left leg, the lowest frame.
- 0.70: F6. He pushes back across; the right foot reaches the outside of the ball.
- **0.80 (beat 5): THE CUT** (F7). The outside of the right boot snaps the ball to **screen-left**
  (his right), into the space A has just left.
  - The ball zips left at about 520 px/s, leaving three ball ghosts.
  - `fx.echo` 0.6 for 3 frames, offset −0.012 UV.
  - Beat-snap: the camera trucks left (cam.x −90) in 2 frames. The pool's operator lag lets him
    escape the centre of the light for 3-4 frames before it catches up: he is faster than the light.
- 0.85: Break BR1, 1.00: BR2, 1.15: BR3, then BR2 / BR3 on 8ths (1.30, 1.40, 1.50). He bursts away
  to screen-left and toward the lens, turning 3/4. His sprite scale steps 2 → 3 on the beat-snap at
  1.00 (no gliding scale).
- 0.90-1.10: A's lunge carries him on past where No.10 was, while the step-over exposures fade out on
  the grid (0.90, 1.00, 1.10). At 1.10 he lands on one knee (`kneelStumble`) and skids 20 px.
- **1.20 (beat 6): OLÉ! 1.** Four-count pad 1 lights.
- 1.30-1.60: he fills the left of the frame. **Spot iris**: stage dim → 1.0 outside the pool and the
  pool closes on him (rx → 0, 1.45-1.60). Cut on black.
- **Ball:** **dead still** under the step-over (its stillness sells the fake), snapped left at 0.80,
  back on the ball anchor by 0.95.
- Audio:
  - 0.00: `tom(A2)`.
  - 0.20: `hat()`; 0.30: `hat(true)` (open) as the leg circles; a short cloth `whoosh(0.15)`.
  - 0.40: `kickDrum(0.8)` + `whoosh(0.2, 300, 1600)` panned right (the body drop).
  - 0.80: `snare(1.0)` + `kick(0.4)` + `whoosh(0.2)` panned left.
  - 0.85, 0.95, 1.05: `tom(C3)`, `tom(A2)`, `tom(F2)` (16ths on his strides).
  - 1.10: A hits the turf: `boom(0.2)` + `scuff()`.
  - 1.20: `ole(1)`.
  - 1.45: `lightsOff(0.3)` for the iris.
- Motion: **FrontTouch** FT1 0.00 · **StepOver** F2 0.14 · F3 0.27 · F4 0.40 (held to 0.60) ·
  F5 0.60 · F6 0.70 · F7 0.80 · **Break** BR1 0.85 · BR2 1.00 · BR3 1.15 · BR2 1.30 · BR3 1.40 ·
  BR2 1.50. A: `jockey` → `lungeCommit` (0.40) →
  `kneelStumble` (1.10).

### 4 · Sole lift (2.0 s): defender B (the ball's scene)
- Side view at shin height. No.10 (**SoleLift Side**, scale 3, feet at y ≈ 340) is drawn full-body:
  at 294 px tall he fills the frame, so every pixel of footwork is a 3×3 block.
- The ball is r 18 (36 px across). Behind: the dark plum stands with phone lights, the beam from the
  top-right, his floor pool (rx 150, ry 18) and the stage hole (rx 200, ry 230).
- B (puppet scale 3) enters from the **right edge** at 0.10, sprinting in the dark (`run1-4`, plum
  with a lilac rim), and launches a slide tackle at 0.30 (`slideTackle`): studs first, along the
  ground toward No.10, throwing grass spray (`grassChunks`) and dust. The tackle comes out of the dark
  into the light.
- Camera (beat-snap keys): 0.00 full body · 0.40 snap to the sole and ball (zoom 1.1) · 0.80 snap up
  (cam.y −40, zoom 1.2) to frame the ball, his boots and B's boot · 1.72 snap back (zoom 1.0) ·
  1.95 whip pan right.
- 0.00 (beat 7): a **Dribble** touch (F1) with the right laces.
- 0.20: F1, the right foot rising toward the ball. 0.30: F2, the sole over the ball, toes up.
- **0.40 (beat 8, the ONE): SOLE ON** (F3). The sole lands on top of the ball and **it stops dead**.
  Beat flare.
- 0.50: F4 DRAG. The sole rolls the ball back toward him by half a ball.
- 0.60: F5 SCOOP. The toe dips behind and under the ball as it rolls onto his laces.
- **0.70: FLICK** (F6). The ankle flicks and the knee rises. The ball leaves the laces: vy 526 px/s
  up, vx 250 px/s forward, real gravity (1648 px/s² at this scale). The ball apex is 94 px above the
  turf (≈ 56 cm, knee height).
- **0.80 (beat 9): HOP** (F7). He pushes off the left foot like a hurdler; his pelvis follows a real
  hop arc (rise 42 px ≈ 25 cm) and carries forward at the ball's 250 px/s, so the ball comes down in
  front of him onto the instep. The camera stays locked to his pelvis.
- 0.90: F8 AIR. 1.25: F8b (the drawn hold variant). 1.58: F9 DESCEND, the left leg reaching for the
  turf.
- **0.95-1.55: the slow window**, `rate` 0.25, with a deeper hold at 0.06 from **1.30 to 1.42: the
  money frame.** At that instant:
  - the ball is exactly at its apex;
  - No.10 is at the top of his hop, knees up, eyes on the ball;
  - B's studs slide under his trailing boot with **8 px to spare** (place them with `jointWorld`:
    nudge B's hip so his boot top sits 8 px below No.10's lowest boot pixel);
  - **the strobe chain**: the ball's chronophotograph arcs from his laces up to the apex. Ball ghosts
    are dropped every 1/40 s of *simulation* time (so they bunch toward the apex like a real strobe
    photograph), live 0.6 s of shot time (0.9 s for those alive at the hold), at most 9;
  - his own ghosts of F5, F6 and F7 stand on the hop path (dropped at 0.60, 0.70, 0.80, life 0.7 s);
  - two frames of ultraviolet/ivory impact frame at 1.30, then a clean still (no echo);
  - stage dim 0.8 → 0.88 outside the pool.
- 1.30: tag `SOLE LIFT`.
- 1.72: F10 LAND on the left foot, the right instep raised and soft.
- **1.80 (8th): CUSHION** (F11). The ball drops onto his instep and the ankle gives 2 px. It is glued
  again. (These numbers fall out of the time-warp: the flick is at sim 0, the hold covers the ball's
  apex at sim ≈ 0.34, he lands at sim ≈ 0.55 and the catch is at sim ≈ 0.63. If a constant changes,
  re-solve so the catch still lands on 1.80.)
- 1.45-2.00: B slides on out of frame-left, spinning slowly (`slideSpin`), leaving a short streak of
  torn turf (dark divots, no glow).
- 1.85-1.95: Dribble F2-F4. **1.90: OLÉ! 2.** Pad 2 lights.
- 1.95-2.00: whip pan right (`fx.radial` ≤ 0.25 for 3 frames) and cut onto the ONE of shot 5.
- **Ball:** stopped dead under the sole, dragged back half a ball, scooped onto the laces, flicked
  into a clean parabola with its strobe chain, cushioned on the instep. Its plum shadow sits on the
  floor pool directly beneath it and shrinks as it rises: the light is above, so the shadow shows the
  height.
- Audio:
  - 0.00: `tom(F2)`.
  - 0.30: `scrape(0.9)`, B's slide grinding the turf.
  - 0.40: `rim()` + `kick(0.15)`: the sole on the ball is a rimshot.
  - 0.50: `snare(0.3)` (ghost note). 0.60: `hat()`.
  - 0.70: `tom(C3)` + `kick(0.2)`.
  - 0.80: `kickDrum(0.8)` + `whoosh(0.25, 300, 1800)`.
  - 1.00-1.80: `crashSwell(0.8)` under the lamp hum, resolving on the catch.
  - 1.20 (beat 10): one long low `tom(D2)`, the fermata.
  - 1.30: a quiet `shing(1.4)` at the money frame.
  - 1.72: `scuff()` (landing). 1.80: `tom(A2)` + the boot `tok`.
  - 1.90: `ole(2)`. 1.95: `whoosh(0.2)`.
- Motion: **Dribble** F1 0.00 · F2 0.07 · F3 0.13; **SoleLift** F1 0.20 · F2 0.30 · F3 0.40 ·
  F4 0.50 · F5 0.60 · F6 0.70 · F7 0.80 · F8 0.90 · F8b 1.25 · F9 1.58 · F10 1.72 · F11 1.80;
  **Dribble** F2 1.85 · F3 1.90 · F4 1.95. B: `run1-4` → `slideTackle` (0.30) → `slideSpin`
  (1.45). At the money frame B shares a ×3 frame with the drawn No.10, so B's slide uses the motion
  library's **Rival Slide** studio frames (S1 launch 0.30, S2 slide 0.50, S2b hold 1.25, S3 slide-out
  1.45) once they exist; the puppet poses are the fallback.

### 5 · Elastico (1.2 s): defender C
- Front view at knee height. No.10 (**Elastico Front**, scale 2, feet at y ≈ 322) runs at the lens.
  For variety the spot here sits **behind the camera**: he is lit flat and frontal like a soloist at
  the footlights, and his long shadow stretches up the pitch behind him.
- C (puppet scale 2.2) comes in from **screen-right facing −1**, sprinting out of the dark.
- 0.00 (beat 12, the ONE): opens out of the whip pan (`fx.radial` 0.2 → 0 over 3 frames). FrontTouch
  FT1, an approach touch.
- 0.10: C reaches the edge of the pool and turns full colour as he enters.
- 0.20: F2. The outside of the right boot **shows the ball to screen-left** (his right) and his whole
  body leans with it.
- 0.30: F3 wrap. C stabs his leg out toward screen-left (`lungeCommit`), at the ball he has been
  shown.
- 0.367-0.40: F4, the smear frame, on screen for exactly 2 frames.
- **0.40 (beat 13): SNAP** (F5, held until 0.55). The inside of the right boot whips the ball back to
  **screen-right** (his left), behind C's back.
  - HIT-STOP: `rate` 0.06 from 0.40 to 0.55.
  - **The strobe draws the hairpin**: three ball exposures (alpha 0.7, 0.55, 0.4) trace the ball's
    out-and-back V, from where it was shown (screen-left) round the turn to where the real ball sits
    now (screen-right), with an exposure of F2 (leaning left) at the turn. C's boot stabs at the
    empty end of the V: he reacted to the real outside push, and the ball has already gone.
  - Two frames of ultraviolet/ivory impact frame. `fx.echo` 0.6 for 3 frames, offset +0.012 UV.
  - Beat-snap: zoom 1.0 → 1.15.
- 0.45: tag `ELASTICO`.
- 0.55: Break BR2 (west strip), 0.70: BR3 (west strip). He bursts toward the lens and screen-right.
- 0.55-0.75: C's stab finds only grass. He overcommits into a full **comic split** (`splitFreeze`),
  freezes there for one beat-snap, then topples sideways onto his hip (`sideTopple` at 0.75). The V
  exposures fade out on the grid.
- **0.80 (beat 14): OLÉ! 3.** Pad 3 lights. His sprite scale steps 2 → 3 on the beat-snap.
- **0.80-1.20: the ghost wipe.** He runs past the lens to screen-right, alternating Break BR2/BR3
  (west strip) every 8th.
  On each 16th (0.80, 0.90, 1.00, 1.10) a ghost of his current frame is dropped at scales 3, 4, 5 and
  6, sweeping left to right across the frame. The last one, a solid ultraviolet silhouette at
  scale 6, covers most of the frame at 1.15. Cut on the violet at 1.20. (Fallback: a violet flash
  wipe.)
- **Ball:** shown left on F2, wrapped on F3, reversed in two frames (F4 → F5) with no visible
  slowdown (the visual gag), then glued to the right boot's ball anchor through the burst.
- Audio:
  - 0.00: `kickDrum(0.6)` + `tom(D2)`.
  - 0.20: `hat()`. 0.30: `hat()`.
  - 0.40: `snare(1.0)` + `crash(0.6)` (the first crash of the special) + `kick(0.3)`.
  - 0.75: C topples onto his hip: `boom(0.2)` + `scuff()`.
  - 0.80: `ole(3)`.
  - 0.80-1.10: a 16th tom fill: D3, C3, A2, F2.
  - 1.00: `whoosh(0.25)` panned left to right with the wipe.
- Motion: **FrontTouch** FT1 0.00 · **Elastico** F2 0.20 · F3 0.30 · F4 0.367 · F5 0.40 (held to
  0.55) · **Break west strip** BR2 0.55 · BR3 0.70 · then BR2/BR3 alternating on 8ths for the wipe.
  C: `run1-4` → `lungeCommit` (0.30) → `splitFreeze` (0.55) → `sideTopple` (0.75).

### 6 · Nutmeg (1.2 s): defender D
- **Reverse angle**: the camera is low behind D (between D and the goal), looking back up the pitch
  at No.10.
- D fills the foreground as a **back-lit silhouette** seen from behind, framed from the waist down:
  his legs spread in a wide block (`wideBlock`) form an **arch**, like a stage's proscenium. Puppet
  scale 3.5, silhouette fill #0E0618, rims `lilac` / `uv` on the edges facing the spot. The arch spans
  at least 200 px at the ground and its top is near y ≈ 170.
- No.10 (**Nutmeg Front**, scale 1, feet at y ≈ 290) runs at the lens **inside the arch**, in his
  spot. The light spills through the arch: the floor pool (rx 140, ry 26) lies between D's boots and
  No.10.
- 0.00 (beat 15): opens out of the violet (`fx.flash` 0.6 in [122,77,255] → 0 over 3 frames). FT1, an
  approach touch, eyes up on D.
- 0.10-0.30: D sinks into a wider block (his legs spread 10% more by 0.20).
- 0.20: F2. No.10's shoulders dip to screen-right as if to go round that side; D shifts his weight
  onto his screen-right leg (the silhouette leans).
- 0.30: F3. He plants beside the ball; the right toe is aimed at the gap.
- **0.40 (beat 16, the ONE): THE POKE** (F4, held to 0.55). The right toe pokes the ball straight at
  the lens, through the arch. It is a tiny movement: the disguise is the point.
- 0.45: tag `NUTMEG`.
- **0.50-0.70: the money frame**, `rate` 0.2. The ball rolls exactly between D's boots, ivory-bright
  against the dark, framed by the arch, with No.10 behind it in the spot already moving round. Four
  ball ghosts trail back through the arch toward his boot. The ball grows with perspective, stepping
  its radius 6 → 22 in whole pixels (each radius rasterised and cached; never scaled). No impact
  frame and no echo: this frame should be clean and beautiful.
- 0.55: Break BR1, the go-round, a first step to screen-left (his right) round D. 0.70: BR2, sprint,
  3/4 toward the lens. 0.85: BR3.
- 0.60-0.90: **the gag.** D folds forward and looks back **through his own legs** (`lookThrough`):
  his upside-down head silhouette, rim-lit hair and all, appears in the arch following the ball.
- **0.80 (beat 17): OLÉ! 4, the loudest.** Pad 4 lights and all four pads flare. His scale steps
  1 → 2 on the beat-snap as he comes round D's side.
- 0.90: D topples back onto his bottom (`sitBack`) and the silhouette drops out of the bottom of
  frame.
- 0.90-1.20: the ball rolls out under the camera (bottom edge) and No.10 runs out of frame-left past
  the lens; his pool slides with him. Hard cut at 1.20.
- **Ball:** poked at about 4 m/s, rolling straight with its spin locked, passing between D's boots
  with at least 8 px of clearance on each side.
- Audio:
  - 0.00: `tom(F2)`.
  - 0.10, 0.20, 0.30: a 16th `snare` roll, crescendo (0.3, 0.5, 0.7).
  - 0.40: `kickDrum(0.9)` + `crash(0.7)` + a light `kick(0.25)` for the toe poke.
  - 0.50-0.70: the cymbal rings on under the lamp hum.
  - 0.65: a crowd laugh, `ooh(0.4)`, as D looks through his legs.
  - 0.80: `ole(4)`, swelling into a big `crowd(1.5, 0.4)`.
  - 0.80-1.10: the fill's climax, 16th toms D3, D3, C3, A2.
  - 0.90: D sits down: `boom(0.2)`.
- Motion: **FrontTouch** FT1 0.00 · **Nutmeg** F2 0.20 · F3 0.30 · F4 0.40 (held to 0.55) ·
  **Break** BR1 0.55 · BR2 0.70 · BR3 0.85 · BR2 1.00 · BR3 1.10. D: `wideBlock` → `lookThrough` (0.60) → `sitBack` (0.90), all in
  silhouette.

### 7 · On the mark (2.4 s)
- Medium-wide side view at waist height on a slight oblique (the field view's 0.35 ground slant), so
  the goal mouth shows at the right edge (`drawGoal`).
- No.10 (scale 2, feet at y ≈ 320) in the left third. The keeper (`KEEPER_KIT`, puppet scale 1.4,
  feet at y ≈ 250, further back) right of centre, crouched in `gkSpread`.
- The penalty spot glows faintly lilac on the dark turf: **the mark.**
- The four beaten defenders are on the turf far behind him on the left (A kneeling, B face-down,
  C on his hip, D sat back; puppets at scale 1.0-1.2, pre-rendered in `prepare()`). They are invisible in
  the dark until the floodlights return.
- 0.00 (beat 18): he cuts in at speed from the left (**Dribble**, short holds) with the ball. His
  pool slides with him and a ghost is dropped every 8th (0.00, 0.20, 0.40) along his path: the
  performance trail. Touch.
- 0.40 (beat 19): a touch with the left foot. The ball rolls ahead onto the penalty spot.
- 0.60: Settle F1 BRAKE: heel plant, torso back 6°, arms forward for balance.
- **0.80 (beat 20, the ONE): SOLE STOP** (Settle F2). His sole comes down on the ball **exactly on
  the penalty spot** and it **stops dead**: no roll, no wobble. This is the final drum hit, and then
  the drums choke into silence.
  - The world `rate` drops to 0.1 (the keeper's crouch crawls); stage dim 0.85. The darkness is
    light only: saturation stays 1.
  - **The afterimages come home**: the trail ghosts rush forward and merge into him one per 16th
    (0.80, 0.90, 1.00, in shot time). Each merge flashes his rim lilac for one frame.
  - `cam.hit(0.15)`, beat-snap zoom 1.0 → 1.08 on him.
- **1.00 (the "and"): CLUNK.** A second follow-spot slams onto the keeper from the top-left: his own
  beam, his own pool (screen ellipse rx 70, ry 80). The two beams cross above the pitch. Two pools of
  light, darkness between them: **the duel.** His gloves twitch at 1.10 (a one-frame pose nudge).
- 1.20 (beat 21): Settle F3, chin up, eyes on the keeper.
  - **Bookend**: the cut-in's soft oval pool panel opens across the top third (60 px tall) with his
    eyes looking screen-right at the keeper. One lilac glint at 1.40.
- **1.60 (beat 22): FREEZE** (`rate` 0). The floodlights **slam back on** in three 16th steps (1.60,
  1.70, 1.80): stage dim 0.85 → 0.45 → 0.15 → 0, and the pools melt into general light.
  - The stadium is revealed: the four beaten defenders down behind him, and the crowd on its feet.
  - **1 ON 1** lights up top-centre with the cut-in's `lampTitle`: "1" (1.60), "ON" (1.70), "1"
    (1.80), one group per floodlight bank.
- 1.70-2.40: the name card slides in at the bottom, matching the Zenith and Crescent cards:
  - left: `SPOTLIGHT SOLO`
  - under it: `No.10 · SPECIAL DRIBBLE`
  - right: `4 DEFENDERS BEATEN`
  - Fade to [8,4,14] over the last 0.35 s (2.05-2.40), into the result view.
- **Ball:** rolling just ahead after the brake, stopped dead on the spot by the sole, the last ball
  beat of the special. A one-frame ivory glint on the ball as the last ghost merges.
- Audio:
  - 0.00: `tom(D3)`. 0.40: `tom(C3)`.
  - 0.60, 0.70: a `snare` drag (two 16ths).
  - **0.80: `kickDrum(1.0)` + `crash(1.0)` + `boom(0.5)`, then `choke()` at 0.86** (the cymbal is
    grabbed) and `duck(0.95, 0.8)` on the crowd. A musical stop, never a low-pass: only the lamp hum is
    left.
  - 1.00: `spotOn(0.8)`.
  - 1.40: `shing(1.1)`.
  - **1.60: the stadium exhales**: `lightsOn(1.0)` + `kickDrum(0.8)` + `crash(1.0)` +
    `crowd(3, 0.5)`. 1.70 and 1.80: `lightsOn(0.8)`, `lightsOn(0.7)`. The lamp hum stops.
  - 1.80: `boom(0.4)` + `shing(1.0)` under the card.
- Motion: **Dribble** F1 0.00 (touch) · F2 0.10 · F3 0.20 · F4 0.30 · F5 0.40 (touch) ·
  F6 0.45 · F7 0.50; **Settle** F1 0.60 · F2 0.80 · F3 1.20 · F3b 1.40 ·
  F3 1.50 · F3b 1.60 (held through the freeze). Keeper: `gkSpread` (+ nudge at 1.10).

## Sound design

- **The footwork is a drum solo.**
  - A stick count-in in the cut-in: four clicks, which are also the four defenders to come.
  - Every touch is a tuned tom with the dry "tok" of a boot layered in, so it stays football and not
    a UI chime: lower toms for the right foot, higher for the left. Sole touches are rimshots and
    snares. Feints add hi-hat ghost notes (the step-over circle, the elastico push and wrap). Skill
    keys land on the kick drum, and the two biggest (the snap, the poke) bring the crash.
  - Tom notes: D2 73.4, F2 87.3, A2 110, C3 130.8, D3 146.8 Hz.
  - **It builds like a drum fill**: quarter notes (shot 2) → 8ths with 16th tails (shot 3) → a
    half-time break with a fermata in the slow motion (shot 4) → 8ths and a 16th tom fill (shot 5) → a
    16th snare roll into the crash and the fill's climax (shot 6) → **the final hit on the ONE** as the
    sole stops the ball, and a cymbal **choke** into silence (shot 7).
- **The stage is heard.** Floodlight banks die with heavy relay CHUNKs (`lightsOff`) and come back
  with `lightsOn`. The follow-spot strikes with a clunk (`spotOn`) and then hums quietly
  (`lampHum`): in the final silence the hum of the lamp is the only sound.
- **The crowd counts the defenders.** A murmur, a hush as the lights go down, an awed "ooooh" at the
  phone lights, then **OLÉ! 1, 2, 3, 4**, each with more voices and a higher, louder shout, the
  fourth swelling into a roar. A laugh at D looking through his legs. Then a dead hush at the stop,
  and the stadium exhales when the floodlights return.
- **The payoff is silence**: the fill resolves, the cymbal is grabbed, and two pools of light wait in
  a humming stadium.
- The cut-in keeps the shared `stinger()`. Everything runs through the glue compressor and the
  brick-wall limiter, and the loudest moment (the stop) stays below Zenith's strike.

## No.10 studio animations (Pixel Studio project "Sochetra")

Every No.10 drawing comes from the shared **motion library** (`../MOTION_LIBRARY.md`): its §1 rules
(canvas 128×128, 98 px tall standing, sole bottom on row 102, the 15-colour palette, the on-model
checklist, the `Art` / `Num` / `Ball` layers, the west strip for mirrored use, the anchor schema)
and its frame IDs. The full poses are in the library (§3.2 Dribble, §3.5 SoleLift and Settle, §3.6
FrontTouch, StepOver, Elastico, Nutmeg and Break, §3.8 Glance). This brief only schedules them.

Ultraviolet, rim and silhouette passes stay in the engine. **The ball is never drawn in the frames**;
the game draws it at the frame's `ball` anchor. The ball is 12 px across at scale 1 (radius 6), so
r 12 at scale 2 and r 18 at scale 3.

| Shot | Library frames (shot-local time) | Scale |
|---|---|---|
| 1 | face crop G1 → Glance G2L 0.20 → G2 0.30 | ×5 |
| 2 | Dribble F1–F8 with shortening holds (see shot 2) | ×2 |
| 3 | FrontTouch FT1 0.00 · StepOver F2 0.14 · F3 0.27 · F4 0.40–0.60 · F5 0.60 · F6 0.70 · F7 0.80 · Break BR1 0.85 · BR2 1.00 · BR3 1.15 · BR2 1.30 · BR3 1.40 · BR2 1.50 | ×2, ×3 from 1.00 |
| 4 | Dribble F1 0.00 · F2 0.07 · F3 0.13 · SoleLift F1 0.20 … F11 1.80 (F8b 1.25) · Dribble F2 1.85 · F3 1.90 · F4 1.95 | ×3 |
| 5 | FrontTouch FT1 0.00 · Elastico F2 0.20 · F3 0.30 · F4 0.367 · F5 0.40–0.55 · Break BR2/BR3 west strip from 0.55, alternating on 8ths for the ghost wipe | ×2, ×3 from 0.80, wipe ×3–×6 |
| 6 | FrontTouch FT1 0.00 · Nutmeg F2 0.20 · F3 0.30 · F4 0.40–0.55 · Break BR1 0.55 · BR2 0.70 · BR3 0.85 · BR2 1.00 · BR3 1.10 | ×1, ×2 from 0.80 |
| 7 | Dribble F1–F7 0.00–0.50 · Settle F1 0.60 · F2 0.80 · F3 1.20 · F3b 1.40 · F3 1.50 · F3b 1.60 (held through the freeze) | ×2 |
| field, result | Dribble cycle (field intro and command window); Settle F3 (result), as box-filtered 0.4×/0.5× caches | |

SPOTLIGHT SOLO plays 43 library frames: Dribble 8, FrontTouch 1, Break 3, StepOver 6, Elastico 4,
Nutmeg 3, SoleLift 12, Settle 4, and Glance G2L/G2.

**Dribble-specific drawing notes**
- Every pose that becomes an exposure (StepOver F2-F4, SoleLift F5-F7, Elastico F2, the Dribble
  trail frames) must read as a solid silhouette on its own, with no ambiguous overlap of the two
  legs. StepOver F4 is the shot's key still: a complete "going right" pose.
- SoleLift is drawn for ×3, so the sole line and the white studs must be clean.
- In the front views the shoulder dip leads the leg by one frame, the ball stays dead still under
  the step-over, the elastico reads in the ankle and the lean (hips square), and the poke has no
  wind-up.
- Elastico's burst uses the Break **west strip**, so the chest "10" never reads "01".

**Natural-motion rules** (reviewers check every animation at 12 fps in the studio and on an onion
skin):
1. Keys first (contacts, downs, passes, ups), then breakdowns, then in-betweens. Block **two-value
   silhouettes** for the whole animation and approve the motion before any detail.
2. **Pinned feet**: a planted foot keeps exactly the same pixels until it lifts. Build each frame with
   `add_frame` (copy) and redraw only what moves.
3. Toe, knee and hand paths follow **arcs**; check by stacking frames.
4. **Weight**: the pelvis moves 2-4 px on down and up frames; the hip shifts 4-6 px toward the loaded
   leg in every feint.
5. **Counter-rotation**: shoulders oppose hips, and the arms never mirror each other.
6. **Overlap**: hair spikes and the shirt hem trail the body by one frame.
7. **The eyes stay up**, on the defender or the keeper, never down on the ball; the head moves less
   than the shoulders.
8. **Front-view readability** where legs cross the body: keep strong value separation (blue shorts
   #283ca0, red socks #df2321, white boots #dfdae6) and add 1 px outline breaks where limbs overlap.
9. **Every pose that becomes an exposure** (StepOver F2-F4, SoleLift F5-F7, Elastico F2, the Dribble
   trail frames) must read as a solid silhouette on its own: no ambiguous overlaps of the two legs.
10. Proportions match Idle and Jump: use Idle Side/Front as the model sheet and Jump F1-F3 as the
    crouch reference.

**Studio workflow (MCP)**
- Ask the owner to close "Sochetra" in the studio while editing; otherwise the studio saves over the
  changes.
- `add_animation(project 'Sochetra', name 'Dribble', frames 8, fps 13)` and so on, one studio
  animation per library row, with the library's names (`Dribble`, `FrontTouch`, `Break`, `StepOver`,
  `Elastico`, `Nutmeg`, `SoleLift`, `Settle`).
- In every frame, `add_layer` a **`Ball`** guide layer and draw a 12 px disc in the key colour
  #00FF00 where the ball should be; draw the `Art` layer around it. `read_frame` (image) after every
  `set_pixels`.
- When an animation is approved:
  1. `read_frame(layer 'Ball', as 'text')` gives the disc centroid, which becomes the frame's `ball`
     anchor.
  2. Clear the Ball layer.
  3. `export_sheet`; the library's `export_anim.py` crops the drawn row into
     `src/art/hero_<anim>_<view>.png` + `.json` (and the west strip for Break).
  4. The export fails if any #00FF00 pixel survives.
- Per-frame JSON: the library's one schema (§1.2): `{ name, ms, pelvis, contact, ball, touch, boot,
  bootPart, … }`.

**Priority** (library batches): (1) Dribble (A), SoleLift and Settle (G); (2) FrontTouch and Break,
then StepOver, Elastico and Nutmeg (D); (3) Glance G2L/G2 (H).

## Engine cheat-sheet

The Crescent cheat-sheet still applies (camera, `FxState`, particles, puppets, the shot contract,
helpers). New for SPOTLIGHT SOLO:

- **Studio frames**: use the shared `src/art/studioAnim.ts` (the generalised `heroJump.ts` loader,
  also used by GALE HAMMER). Frames carry `ball` and `touch`; draw the ball at `ball` × scale so it
  stays glued. Add an **afterimage cache** per frame: the silhouette filled `uv` with a 1 px `lilac`
  rim on one side, built once per frame and scale.
- **Stage light** (`src/art/stage.ts`, canvas, not a shader, so the draw order decides exactly what
  is dimmed):
  - `stage.dim(ctx, level, pools)`: one reused 640×360 canvas filled with the `dim` colour (mixed
    from white by `level`), with soft elliptical holes punched with `destination-out` radial
    gradients (`pools`: up to 2 × `{x, y, rx, ry, soft, gain}` in screen space), drawn onto the frame
    with `multiply`. Skipped when `level` is 0.
  - **Draw order**: world + defenders (and the dark stands) → `stage.dim` → fluorescent accents
    (pitch lines, defender lilac rims, phone lights) → beam and floor pool → afterimages → No.10 →
    ball → HUD.
  - `stage.beam(ctx, x0, y0, x1, y1, w0, w1, a)`: a tapered shaft (ivory gradient, additive, at most
    0.18) over a normal-blend plum underlay, with 20-30 seeded `'mote'` particles drifting in it.
  - `stage.floorPool(ctx, x, y, rx, ry, a)`: the soft ivory pool on the turf.
  - `stage.flare(t, at)`: the beat-flare gain (×1.25 and +6% size for 2 frames).
  - The pool follows its target with a critically damped lag of about 60 ms (a human operator).
  - Defenders outside the pool are drawn as silhouettes (`renderPuppet(..., { silhouette: { fill
    [26,15,46], rim lilac, rim2 uv } })`) and cross-fade to their normal render over 3-4 frames as
    they enter the light.
- **Afterimages** (`Afterimages` class in `solo/common.ts`): `drop(kind, anim, frame, x, y, scale, t,
  life)`, `draw(ctx, t)`, `clear()`. World-anchored, dropped only from `update` on listed times or
  sim-time steps, alpha 0.6 → 0 over `life` of shot time, capped (6 hero, 9 ball), reset in `init`.
- **Beat echo** (`engine/post.ts`), the one new shader block:
  - `FxState` fields: `echo` (0-1), `echoDX`/`echoDY` (UV offset per copy), `echoX`/`echoY` (centre,
    UV), `echoR` (radius in screen-height units, 0 = whole frame), `echoColor` (RGB multiplier,
    default [0.62, 0.44, 1.25]). All reset every frame.
  - In FINAL, after the base colour fetch and before the bloom add:
    `m = echoR > 0 ? 1 − smoothstep(0.7·R, R, |(uv − c)·(aspect,1)|) : 1`;
    `e_k = tex(uv − k·d).rgb · echoColor · w_k · echo · m` for k = 1, 2, 3 with w = 0.6, 0.35, 0.18;
    `col = max(col, max(e1, max(e2, e3)))`.
  - The "lighten" blend means the echoes show only where they are brighter than what is underneath:
    violet copies of the lit No.10 in the dark around him, invisible on the bright pool.
  - Skipped when `echo == 0`. Never on more than 4 consecutive frames.
- **Beat-snap camera** (`beatCam(keys, t)` in `solo/common.ts`): `keys` = `[t, x, y, zoom][]` on the
  8th grid. Between keys the camera holds; at a key it moves to the new framing in 2 frames
  (`easeOutCubic`) with a 3% overshoot that settles over 4 frames. It is a pure function of `t`, so
  seek is exact. In tracking shots the camera is locked to No.10's pelvis (the world scrolls) and the
  keys change only the framing offset and zoom. Roll is always 0. Because zoom only ever changes in
  snaps and then holds, studio sprites never crawl with nearest-neighbour shimmer.
- **Stadium** (`art/stadium.ts`): `drawFieldBackdrop(..., opts?: { towers?: boolean[]; phones?: number })`
  (per-tower lamp grids on/off with their glow; `phones` = the strength of steady twinkling phone
  lights, reusing the `flashes` positions).
- **`src/art/fx.ts`**: `lampTitle(ctx, groups, x, y, size, t, onTimes)` (word groups that snap on
  under their own lamp cone, with a violet echo copy), `marqueeTag(ctx, text, x, y, t)`,
  `fourCount(ctx, litAt[], t)`.
- **Ball**: `BallPalette` gains `'blacklight'`: ivory white panels with lilac shading, uvDeep black
  panels, plum outline, and a soft violet halo drawn normal-blend over a uvDeep halo. `renderBall` is
  rasterised per integer radius (shot 6 steps r 6 → 22).
- **Particles**: ramps `'uv'` [255,255,255] → [246,240,223] → [201,182,255] → [122,77,255] →
  [42,22,96] and `'mote'` [246,240,223] → [201,182,255] → [90,70,140] (normal blend). `sparks()`
  accepts `'uv'`. Exposures never burst or blink out on contact; they fade on the grid.
- **Puppets** (`POSES`, joint angles only): `jockey`, `lungeCommit`, `kneelStumble`, `slideTackle`
  (this special's alone; the motion library's Rival Slide studio set replaces it at the money frame),
  `slideSpin`, `splitFreeze` (a full comic split, arms flung up), `sideTopple` (lying on one hip,
  legs still split), `wideBlock` and `lookThrough`
  (authored for the silhouette: legs spread in the picture plane; the torso folds about 150° so the
  head hangs upside down between the knees), `sitBack`, `faceDown`, keeper `gkSpread`. Kits
  `RIVAL_KIT_C` and `RIVAL_KIT_D` are hair variants. Pre-render `run1-4` and every static pose per kit
  and scale in `prepare()`.
- **Audio** (`engine/audio.ts`, all procedural):
  - Drum kit: `tom(freq, gain?, pan?)` (a sine dropping from 1.6× to 1× in 40 ms, a triangle partial
    and a short noise click: the boot "tok"), `snare(power)` (band-passed noise 1.8-4 kHz plus a
    185 Hz body), `rim()`, `hat(open?)`, `kickDrum(power)`, `crash(power)`, `crashSwell(dur)` (a
    reversed envelope), `choke()` (cuts every ringing crash in 20 ms), `sticks()`.
  - Stage: `lightsOff(power)` (a 60 Hz relay thump, a metallic click and a 100 Hz hum that dies over
    0.3 s), `lightsOn(power)`, `spotOn(power)` (a heavy clunk plus a short 800 Hz ring),
    `lampHum(dur)` (120 + 240 Hz buzz with a faint shimmer, gain ≈ 0.025).
  - Crowd: `ole(level 1-4)` (crowd noise through two moving formant band-passes, O → LE:
    400/800 Hz → 500/1700 Hz; more voices, gain and formant height per level), `ooh(power)`,
    `duck(depth, dur)` (depth first: the one signature shared with GALE HAMMER and MERIDIAN THREAD)
    on the shared `crowdBus` (built by whichever of the three lands first),
    `scrape(dur)`, `scuff()`.
  - **`sfx.clearBus()`** (shared with GALE HAMMER and MERIDIAN THREAD: un-mute, un-duck, un-choke,
    stop the lamp hum) is called in every SPOTLIGHT SOLO shot's `init`, even when `silent`, and by
    `Cinematic.seek`, `Game.unleash` and `kickoff`, so a seek never leaves the mix ducked or humming.
- **Folder** `src/cinematic/solo/`: `common.ts` (PAL, `SHOT_NAME = 'SPOTLIGHT SOLO'`,
  `HERO_FACING = 1`, the tempo constants, `beatCam`, `Afterimages`, the continuity note),
  `shot1_countin.ts` … `shot7_mark.ts`, `index.ts` (`spotlightSolo`), and this SPEC.md.

## Quality bar (what reviewers check)

1. **A still frame reads instantly**: who beats whom, with which technique, in which direction. The
   violet exposures show the shape of the trick; the full-colour No.10 shows where he really is.
2. **On the beat**: every touch, skill key, lamp and OLÉ lands within one frame of its listed time,
   picture and sound on the same step. Every ONE in the tempo map holds.
3. **Nothing blows out**: every violet glow sits on a uvDeep halo; beams stay ≤ 0.18 additive over
   their plum underlay; `bloomThresh` ≥ 0.72.
4. **The subject is never lost in the dark**: No.10, the ball and his boots are always inside his
   pool; stage dim ≤ 0.88; defenders stay readable through their lilac rims; the ball always has its
   ivory glow.
5. **Pixel consistency**: No.10 is always studio-drawn, nearest-neighbour, at integer scales (1, 2, 3;
   the ghost wipe 3-6), and sprite scale only changes on a beat-snap. **No puppet No.10 anywhere**,
   including the result view.
6. **Feet never slide**: the world scroll equals the stride from the contact anchors.
7. **The ball stays under control**: within one foot-length of the boot except the scripted moments
   (the cut, the flick, the snap, the poke).
8. **Clean cuts** with the listed transitions: iris, match cut, spot iris, whip pan, ghost wipe, hard
   cut, fade.
9. **It is clearly SPOTLIGHT SOLO**: ultraviolet, ivory and plum; the follow-spot; afterimages; the
   beat-snap camera; the drum solo. No air or weather, no rings, no threads or stitches, no ink or
   paper, no cyan, aqua, cobalt or jade, no fire, gold, moon, crescent or sky. Roll is 0.
   Saturation stays 1, the mix is never low-passed, and no exposure is ever a decoy that a defender
   hits (see the set rule in the identity section and the originality guard).
10. **Photosensitivity** (this is a game for children): at most 3 full-frame flashes or impact frames
    in any 1 s; beat flares are local to the pool, at most +25% brightness and at most 2 per second;
    nothing strobes.
11. **Tier**: below the shots. 11.0 s, no goal, the keeper is never beaten, impact frames last 1-2
    frames, peak loudness below Zenith's strike.
12. **Tone**: falls are comic; B's studs pass at least 8 px from No.10's boots and never touch the
    ball; nothing hits a head.
13. **Performance**: at most ~4 live puppet renders per frame (cache run cycles and static poses in
    `prepare()`); the stage canvas and afterimage silhouettes are reused, never allocated per frame;
    particles under ~1500; the shader skips the echo block when it is zero.

## Risks and fallbacks

- **Art budget is the critical path** (43 library frames, 17 of them front views). Draw in the
  library's priority order.
  - Fallbacks: Break BR3 is BR2 with only the legs redrawn; Settle F3 can reuse Idle Side for a first
    pass; if the front footwork is late, StepOver F5/F6 can be dropped and F4 held one more 16th (a
    beat-snap hides the jump). Mirrored uses always come from the west strip.
- **Front-view footwork** (StepOver, Elastico, Nutmeg) is the hardest to keep readable at 98 px.
  Approve the two-value silhouette motion first; the exposures depend on those silhouettes.
- **Ghost clutter**: too many afterimages turn into noise. Keep the caps (6 hero, 9 ball), and keep
  ghosts out of the money frames except the strobe chain.
- **The dark can swallow the action.** Cap the stage dim at 0.88, keep defender rims, and check every
  shot at phone size in a bright room.
- **The beat grid makes the timing rigid.** That is the point: if a move feels rushed, move it by a
  16th, never off the grid, and re-check the ONE of its bar.
- **D's back-view silhouette** needs leg spread in the picture plane, which the profile rig was not
  built for. Fallback: two simple hand-drawn silhouette canvases (block, look-through) built in code.
- **The OLÉ! formant** may sound synthetic. Keep it short and crowd-dense; fall back to `ooh`.
- **Name**: web searches (Nov 2026, re-run by the set critic) found no anime or game move called
  "SPOTLIGHT SOLO". The fallback name is VIOLET ENCORE (also not found). Re-check before shipping.
- **Originality**: afterimage dribbles are a common anime look. What keeps this one original is the
  stage (a follow-spot in a darkened stadium), the beat grid, the chronophotograph exposures that
  only record the rhythm, and the real, named skills. Never let a defender "tackle the ghost".
- **Replays**: 11 s every time may tire a player who uses it often. A later option is a short replay
  that skips shots 1 and 7 after the first viewing.
- **Chaining into SHOOT** touches `game.ts`. Fallback: the banner, then kick-off.
- **Old Safari** lacks `StereoPannerNode`; panned drums fall back to mono.
