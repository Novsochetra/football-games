# GALE HAMMER: shot spec

No.10's second power shot, a long-range strike. From 30 m out he hits the ball so hard it never
touches the grass again. It skims on cushions of crushed air, and each cushion stamps a ring of
flattened turf into the pitch as the ball climbs toward the top corner. It is faster than its own
sound: the world goes quiet, and the thunder only reaches each defender, the net and the stands
after the ball has already gone past.

This is the third special in the game. ZENITH METEOR (`../zenith/`) is still the top tier and the
quality bar. CRIMSON CRESCENT (`../crescent/SPEC.md`) is the format this brief follows. GALE HAMMER
must feel like a sibling (same engine, same pixel art and post-FX look, same punch), but it is
**one tier below ZENITH METEOR**: 6 shots and 11.3 s instead of 8 shots and about 17 s. It stays at
ground level the whole time, with no sky, no moon and no fire, and the net balloons but does not
tear. It must not copy the look, motion or name of any existing anime move. In particular the ball
never rises high and then dips sharply, and the word "drive" appears nowhere: not in the name,
captions or code names (use `gale` and `strike`).

Where it came from: this brief takes pitch A (GALE HAMMER) and adds the best ideas from pitches B and C:
- the three-note **air-tone motif** (G–B–D), now heard only on the title and in the palm blow;
- the **ankle-lock click** during the load;
- the **30 M readout** and the **ghost stamps** in the command window;
- a celebration kids can copy (**the palm blow**);
- the readability rules: the ball stays at least 20 px across, and the radial blur is capped.

It also fixes three problems in pitch A:
- the net now moves **after** the ball, never before, so every shot follows the same "ball first,
  sound later" rule;
- the caption no longer says "drives";
- the Mach cone is drawn on the canvas, so there is only one new shader effect.

**Set-critic fixes** (Nov 2026; these keep the five specials apart, see the identity table):
- **No heartbeats** in the load (they are CRIMSON CRESCENT's read): two **pressure ratchet** steps
  with a new `earPop()` sound instead.
- **No desaturation** anywhere (colour is MERIDIAN THREAD's dimension).
- The **eye strip** (a manga-style inset; panels are the pass's) becomes the **dew mirror**: his eyes
  seen in a dew drop on the ball.
- Defender 1 **jump-blocks** instead of sliding: the slide tackle is SPOTLIGHT SOLO's money beat.
- **No pitched notes on the three air steps** and none in the command window: a rising note per ball
  event is the pass's needle-eye language. Under the mute the steps are muffled thooms, which makes
  the late boom hit harder.
- **No vibrating crossbar and no taut lines** (a vibrating tuned line is the pass's plucked thread):
  shot 5 is now "Pressure front", where the net balloons and then exhales; vapour is always soft and
  turbulent; the stamps are never joined by a line.
- The impact frame is **cobalt / ice, high-key**. The old navy/ice was nearly CRIMSON CRESCENT's
  silver/indigo.
- Shot 6 draws No.10 at integer ×2, centred on the stamps, so it is no longer the pass's
  over-the-shoulder composition.

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

### GALE HAMMER palette and owned motifs

Palette constants (`PAL` in `./common.ts`):

| name | hex | use |
|---|---|---|
| `ice` | `#EEFBFF` | cores, title fill, ball core, air sliver core |
| `cyan` | `#46D8FF` | energy, isobars, air slivers, glints, the motif's glow |
| `cobalt` | `#2D52E0` | body glows, ball halo, title stroke (it echoes No.10's shorts `#283CA0`) |
| `navy` | `#0A1238` | dark halo behind every glow (normal blend), blinks |
| `pressed` | `#9BE08A` | flattened-grass highlight (stamp rings, the pressed wedge, the V-shaped wake) |
| `pressedCore` | `#1E5A2A` | stamp shadow core |
| `dew` | ramp `[255,255,255] > [214,248,255] > [140,220,255] > [70,150,210]` | dew beads and glints |

- Ball after the kick: `drawBall(..., 'cobalt')`.
- Trail: `vaporRibbon`.
- Particles: ramps `'cobalt'` (`[238,251,255] > [70,216,255] > [45,82,224] > [10,18,56]`) and `'dew'`.
- Grade: tint around `[228,242,255]`, contrast 1.06. Keep it high-key and floodlit, not an indigo
  night, so it never reads as a CRIMSON CRESCENT recolour.

- Impact frame: `impA [36,64,210]` (cobalt), `impB [238,251,255]` (ice), `impThresh` 0.35, so the
  frame flashes mostly ice with saturated cobalt shadows. It must never be near-black indigo with
  white, which is CRIMSON CRESCENT's silver/indigo.

**Motifs this move owns.** No other special may use them as its core look:
- pressure rings and isobars (rings on the turf; ZENITH METEOR's existing sky shock rings stay as they are);
- the Mach chevron and its V-shaped wake in the grass;
- dew crowns, dew beads and the dew mirror;
- the mute then late-boom sound gag, and the master muffle low-pass;
- sonic booms and the ear-pop;
- the pinch/bulge lens look;
- the cobalt/cyan/ice palette;
- the G-B-D air-tone motif (title and palm blow).

**Never in GALE HAMMER:**
- crescents, camera roll, the moon, fire, the sky, a vertical meteor, or a ball that rises high and
  then dips;
- desaturation or any colour drain (MERIDIAN THREAD), dimmed floodlights, spotlights or afterimages
  (SPOTLIGHT SOLO);
- taut or persistent lines, dotted route lines, a line joining the stamps, vibrating strings or bars,
  rising single notes on ball events, manga panels, insets or eye strips (MERIDIAN THREAD);
- heartbeats (CRIMSON CRESCENT);
- slide tackles (SPOTLIGHT SOLO's money beat).

Engine pieces (the lens uniform, the muffle bus, `studioAnim`, the down-pitch ground) are shared
tools. Their look is not shared.

## Continuity (all shots)

**Setting**
- Night match, floodlights, clear sky, cold air. The sky is almost never in frame, because every
  camera stays at grass or crossbar height. **No moon in any shot**: the moon belongs to the other
  two specials.
- Cold night: breath mist and **dew on the grass**. Dew is this move's particle material. The
  command window introduces it (dew drifting toward the boot).

**Direction and characters**
- The goal is to the **right** (+x). No.10 faces **east** in side views (studio frames are drawn
  facing east, no flip).
- No.10 is right-footed. In side views the **kicking leg is the near (right) leg** and the plant leg
  is the far (left) leg, the same as the flick frames in the kick plan.
- No.10 is always studio-drawn (motion library frames: Run, Approach, Strike, StrikeMacro, StrikeBack,
  Stand Back, Glance G4, Celebrate) or the hand-drawn face sprite. **He is never a puppet**, in the
  field view and the result view too.
- Defenders (`RIVAL_KIT`, `RIVAL_KIT_B`) and the keeper (`KEEPER_KIT`) are puppets. Use at most
  3 puppet renders per frame.

**The ball's flight**
- It has **near-zero spin**: knuckle detail, panels turning at most 15°/s.
- After the kick it **never touches the grass**: it makes three air steps.
- Heights above the turf: it starts at 0.4 m, each step dips to 0.15 m, and the high points are
  **0.7 m, then 1.2 m, then 2.3 m**. They only climb. There is never a big rise-and-dip.
- Use a defender puppet's height as the ruler (1.8 m).

**Stamp positions** (`STAMPS` in `common.ts`). The three stamps sit 25 m, 17 m and 6 m from the
goal line, the last at the edge of the six-yard box.
- Each shot rebuilds its stamp decals in `init` from `STAMPS` and its own clock. Nothing is carried
  between shots, so every shot stays self-contained and seekable.

**Rhythm rule: picture first, sound later.** Every big event happens first in silence or near
silence, and its boom arrives a beat later:
- shot 4: each defender;
- shot 5: the net;
- shot 6: the stands.
This is the move's whole personality. Never put a boom on the same frame as the ball passing
something.

**Muffle window.** The master low-pass closes over shot 3, from 0.70 s to 1.05 s, and opens at shot 4
0.92 s, so it is fully closed for about 1.5 s. It is never true silence: the dry bus keeps the thin
whine and No.10's breath audible.

**Times.** All times below are shot-local `t`, the runner's unwarped clock. `rate(t)` only slows the
simulation in `update`, so sprite frame changes are scheduled on `t` exactly as listed.

## Shots (durations are fixed: do not change them)

| # | File / export | Dur | Seed |
|---|---|---|---|
| 1 | `shot1_cutin.ts` / `shotCutIn` | 1.2 | 301 |
| 2 | `shot2_load.ts` / `shotLoad` | 1.9 | 302 |
| 3 | `shot3_squash.ts` / `shotSquash` | 1.6 | 303 |
| 4 | `shot4_airsteps.ts` / `shotAirSteps` | 2.6 | 304 |
| 5 | `shot5_front.ts` / `shotFront` | 1.4 | 305 |
| 6 | `shot6_footprints.ts` / `shotFootprints` | 2.6 | 306 |

Total 11.3 s at 1×. Each shot's `name` field is one of: "Cut-in", "The load", "Squash", "Air steps",
"Pressure front", "Footprints of air".

| # | Shot | What happens | Cut into the next shot |
|---|---|---|---|
| 1 | Cut-in | An elliptical window springs open like a squashed ball, eyes glint, and the title springs out letter by letter to the first air-tone motif | Ring-pop wipe (the move's own transition) |
| 2 | The load | Run-up, plant, then **the inhale** in slow motion: air, dust and dew are sucked toward the cocked boot, the pressure lens pinches the stadium inward in two ratchet steps, his eyes appear in a dew drop on the ball, the ankle locks | Ice flash one frame before contact |
| 3 | Squash | Macro: the ball squashes flat on the laces and the lens bulges. Release, then **the recoil**: the camera is blasted back to reveal his follow-through and hop. The world goes muffled | Straight cut (the muffle carries over) |
| 4 | Air steps | **The ball's scene**, on a side rail at grass level: three air steps with stamps; the ball skims under a jump-blocking defender, then the **late boom** flings him in mid-air and the sound slams back; the second defender spun; step 3 launches it toward the corner | Cyan blink |
| 5 | Pressure front | The keeper's feet are swept; the ball slips under the bar into the corner almost silently; **then** the pressure front balloons the net, and the net exhales a curtain of dew | Navy blink |
| 6 | Footprints of air | Back view, centred: three ring footprints lie like stepping stones between his boots and the net; the stands get the late thunder; GOAL!; **the palm blow** celebration; name card | Fade to `[8,4,14]` (the result view fades up from it) |

### 1 · Cut-in (1.2 s)

Declare the move. It is in the same family as the other cut-ins but has its own shape: a squashed
ball springing open.

**Background** (screen space)
- A navy-to-cobalt vertical gradient.
- 6-8 thin cyan **isobar contour rings** (wavy concentric loops, radius wobble `sin(5θ + t·3)`,
  1 px, alpha 0.35) centred on the frame. They contract inward at about 40 %/s and speed up,
  showing pressure building. They replace the focus lines the other cut-ins use.
- The whole composition pushes in from 1.00 to 1.06 across the shot.

**Window** (0.00–0.22)
- It arrives as a vertical ellipse sliver at 6 % width and springs open horizontally into a wide
  ellipse, overshooting to 110 % at 0.14 and settling at 100 % by 0.22. This is squash and stretch,
  like a ball.
- Border: 2 px ice outline, 3 px cobalt rim, 6 px navy outer halo (normal blend).

**Inside the window**
- No.10's eyes in close-up: a crop of `art.hero.face`, integer scale 4, nearest-neighbour.
- A cool cyan rim light from the right: a tinted copy offset 1 px, additive at 0.5.
- A ring of 12 tiny dew beads (2 px, white core) orbits the inside edge of the panel.

**Beats**
- 0.38 eye glint: `sparkle` on both eyes (`art.hero.eyes`), `lensFlare` tinted `[120,220,255]`, and
  a bloom pulse (bloom 1.3 decaying to 0.9).
- 0.50–0.80 the title **GALE HAMMER**:
  - Each letter enters squeezed into a 4 px wide sliver and springs out to full width. The letters
    are staggered 0.03 s apart, left to right, and each overshoots to 115 % before settling, so a
    pressure wave runs through the word.
  - Ice fill, 3 px cobalt stroke, 2 px navy outer stroke.
  - Tag in pixel font, cyan: `SPECIAL SHOT · No.10 · LONG-RANGE 30 M`.
- 1.00–1.12 exit: the ellipse squashes vertically flat into a horizontal line.
- 1.12 POP:
  - `fx.shocks` ring from the centre, `r` 0 → 0.5, `s` 0.03;
  - a `PK.Ring` in the `'cobalt'` ramp;
  - `fx.flash` 0.5 in `[220,248,255]`.
- Hard cut at 1.20. This **ring-pop wipe** is GALE HAMMER's own transition (Zenith uses a flash,
  Crescent a white blade).

**Audio**

| t | sound |
|---|---|
| 0.00 | `stinger()` |
| 0.02 | `inhale(0.4)`: a short reverse air sweep that cuts off hard |
| 0.38 | `shing(1.1)` |
| 0.50 | `kick(0.35)` and a soft `whoosh(0.3, 800, 2400, 0.25)` |
| 0.52 / 0.64 / 0.76 | `airTone(G5)`, `airTone(B5)`, `airTone(D6)` at gain 0.3: **the first statement of the motif**, riding the letter wave |
| 1.12 | `crack(0.8)` + `boom(0.4)` |

**Motion:** no studio frames. The shot uses the existing face sprite only.

### 2 · The load (1.9 s)

The charge-up. It is the opposite of Zenith's roaring aura: the air around the boot is sucked in
and the world holds its breath.

**Setting**
- Side view at knee height, floodlit night, high-key cool grade.
- `drawFieldBackdrop` (no moon) with parallax: crowd 0.25, towers 0.5.
- Dew sparkles on the turf.
- 2-3 out-of-focus foreground grass blades: dark soft strips across the bottom edge, parallax 1.6.

**Camera**
- Zoom 1.0. It trucks right at his running speed until the plant, then locks.
- 0.65–1.55: dolly in along a low arc to hip-to-ball framing (zoom 1.0 → 1.7, camera y lowering
  about 20 px).
- **Pressure ratchet** at 0.85 and 1.20: the dolly lurches 2 % further in over 2 frames and stays
  there (a step, never a pulse that springs back).

**Beats**
- 0.00–0.08 cyan flash-in: `flash` 0.6 → 0, `flashColor [190,240,255]`.
- 0.00–0.55 **Run-up.** Run R1 (0.00), R2 (0.07), R3 (0.14), R4 (0.21), then Approach AP2
  (0.30–0.55, the long airborne bound, its centre of mass dipping along its path).
  - The ball rolls its last metre and arrives at the plant spot exactly at 0.55, using F5a's
    `ball` guide anchor.
  - Background: the two white defenders (puppets, `k` 0.7, dimmed to 70 %) backpedal into a screen
    near the box. They face -1 and move +x, using the run poses played backward.
- 0.55 **Plant** (F5a):
  - a small ring of flattened grass under the plant foot (`pressureStamp` mini, r 10);
  - `dustBurst` 8;
  - `cam.hit(0.25)`.
  - The rate eases from 1 to 0.12 by 0.65.
- 0.65–1.55 **The inhale** (rate 0.12).
  - **Drawn hold variants:** the pose alternates F5a / F5b every 0.25 s (F5b at 0.75, F5a at 1.00,
    F5b at 1.25, F5a at 1.50). The hair spikes and shirt hem drift 1-2 px toward the boot, so the
    pose is never a frozen still.
  - **Inhale field:** about 120 particles (dust motes, grass clippings, dew beads) stream toward a
    point 10 px behind the heel (`boot` anchor), accelerating as they get close. Grass blades
    around him bend toward that point, with lean proportional to 1/distance.
  - **Isobars:** three thin cyan ellipses around the cocked leg tighten (radius × 0.7 over the
    inhale). On each ratchet step the outermost one **snaps** inward.
  - **Pressure lens pinch:** centred on the boot (`cam.toUV`), `fx.lensR` 0.22 (screen-height
    units). `fx.lens` closes like a ratchet: 0 → −0.10 (ease-in, 0.65–0.85), a 2-frame snap to
    −0.18 at 0.85, a 2-frame snap to −0.25 at 1.20, held to 1.55. The floodlights and crowd behind
    him visibly bend inward, one notch at a time.
  - **Grade:** no desaturation (colour changes are MERIDIAN THREAD's). Contrast 1.06 → 1.12 and
    vignette 0.35 → 0.5 over the inhale. The isobars and dew are additive over navy halos.
  - **Ball tremble:** ±1 px toward the boot at about 20 Hz (`frng`).
  - **Ratchet steps** at 0.85 and 1.20: the dolly lurch, the lens notch and the isobar snap land on
    the same frame as an `earPop`. There is no heartbeat: heartbeats are CRIMSON CRESCENT's.
- 1.12–1.50 **Dew mirror.**
  - One fat dew bead sits on top of the trembling ball. At 1.12 it swells (over 4 frames) into a
    64 px convex drop hovering just above the ball, and in it we see his face looking down at it:
    the Glance G4 crop at integer ×2, pupils locked down-right on the ball.
  - The drop is drawn on the canvas (the lens uniform is busy pinching): a filled disc with the
    face inside, darkening toward a navy edge, a 1 px ice rim light on the lit side and one ice
    specular highlight top-left. It is a disc, never an outlined ring.
  - A cyan glint `sparkle` in his eye at 1.30.
  - 1.42–1.50 the drop shrinks back into the bead and the bead quivers.
  - This restores his face and intent while the dolly frames only his hip and the ball, using the
    move's own materials (dew and a lens) instead of a bordered inset (panels belong to MERIDIAN
    THREAD).
- 1.48 **Ankle lock:** a 4-point `sparkle` on the laces (`boot` anchor) and a 1 px ice tick on the
  ankle. This teaches the locked ankle.
- 1.55–1.90 **Release.**
  - The rate eases back to 1 over 1.55–1.65 (accelerating). F6 (downswing) from 1.58.
  - **Smear arc:** a wide translucent cobalt band along the heel's path, from F5's `boot` anchor
    through F6's to the projected contact. Ice leading edge, navy halo underneath (normal blend).
  - The pinch springs back: `lens` −0.25 → +0.05 → 0 (damped, 0.15 s).
  - Cyan speed lines converge on the ball (`focusLines` centred on the ball).
- 1.80–1.90 ice flash up to 1 and a hard cut, **one frame before contact**. The contact belongs to
  shot 3.

**Muffle:** 0 → 0.35 over 0.65–0.80 (the world holds its breath), then a snap to 0 at 1.55.

**Audio**

| t | sound |
|---|---|
| 0.00 | `crowd(1.9, 0.15)` (low bed) |
| 0.00 / 0.15 / 0.30 | footsteps: soft `kick(0.15)` |
| 0.55 | `kick(0.45)` + `boom(0.25)` |
| 0.60 | `inhale(0.9)` |
| 0.85 / 1.20 | `earPop(0.6)` / `earPop(0.8)`: the pressure step you feel in your ears, as in a lift or a plane (new) |
| 1.48 | `shing(1.4)` |
| 1.58 | `whoosh(0.3, 300, 3000, 0.5)` |

**Motion:** Run R1–R4, Approach AP2, Strike F5a, F5b, F6; Glance G4 in the dew mirror.
- Ground frames sit on `contact`. AP2 is airborne and sits on `pelvis`.
- The plant toe never slides from F5a onward.

### 3 · Squash (1.6 s)

The strike, at two scales: a macro insert of boot on ball, then the camera blasted backward.

**0.00–0.12 Macro insert**
- Grass level, locked camera.
- Strike Macro frames at draw scale 2. The ball is `renderBall` at r 23, drawn ×2 nearest, so it
  sits on the same pixel grid as the macro boot.
- 8-12 dew beads sit on the ball's upper surface with cyan glints.
- Out-of-focus foreground blades for depth. Background: dark turf and cool-white floodlight bokeh
  (soft circles).
- M1 enters from the left at full speed (x −80 → contact), with a 2-frame smear (a stretched copy
  at 0.5 alpha behind it).

**0.12 Contact** (M2)
- **Hit-stop:** rate 0.08 for 0.12–0.62.
- **Impact frame:** cobalt/ice two-tone, high-key (`impact` 1 for 3 frames; colours in the palette
  section).
- **Squash:**
  - `drawBall` squash `sx` 1 → 0.58 and `sy` 1 → 1.25 over 0.12–0.47 (ease-out);
  - a flattened contact face against the laces (`dent`), with the panel seams bending;
  - 3 thin ice ripple arcs run outward across the panels from the contact point.
- **Dew crown:** about 24 beads burst off the ball and hang in the air (nearly still at rate 0.08),
  glinting.
- **Pressure lens bulge** at the contact point: `lens` 0 → +0.2, `lensR` 0.18.
- The grass under the ball fans flat (blades lean outward). 2 px micro-shake.

**0.62 Release**
- The rate snaps to 1.
- The ball springs back with overshoot, then stretches along the flight line (`sx` 1.35, `sy` 0.8)
  and leaves frame right within 2 frames.
- M3: the boot carries through with the toe lifting. Turf spray: `grassChunks` plus dew.
- **Vapour collar** at the exit point: a short cone of white mist (`PK.Smoke`, normal blend,
  alpha 0.5).
- `fx.shocks` at the exit (`r` 0 → 0.4, `s` 0.03), `flash` 0.5, `cam.hit(0.8)`.

**0.66–1.60 The recoil** (signature camera beat)
- **Hidden swap:** under the release flash (0.62–0.66) the macro layer is swapped for the world
  view, framed tight on the boot at zoom 2.4, so the swap reads as one continuous move.
- The camera is **blasted backward**: zoom 2.4 → 1.0 in 0.25 s (`ease.outCubic`), with heavy shake
  (`cam.hit(0.9)`).
- No.10's frames:

  | frame | t | notes |
  |---|---|---|
  | F7 | 0.66–0.70 | 2 frames: the instant just after contact |
  | F8 | 0.70–0.92 | follow-through |
  | F8b | 0.92–1.15 | still airborne, the kicking leg lowering to land (the drawn variant: no airborne hold passes 0.25 s) |
  | F9 | 1.15–1.45 | hop landing on the kicking foot: a small dust ring plus a mini pressed ring under it |
  | F10 | 1.45–1.60 | settle |

- In front of him a **wedge of pressed grass** lies flat and pale (a `pressed` decal) pointing at
  goal, while turf and dew rain down.
- His hair and shirt whip toward goal in the ball's wake: wind particles stream right.
- Only a soft **vapour trail** remains, 10–16 px wide, pointing at the goal, curling into small
  eddies and dissolving over 0.8 s. It is never a crisp taut line (those are the pass's). The ball
  has already gone.
- Grade: cold tint `[220,238,255]`; saturation stays 1.

**Muffle:** 0 → 1 over 0.70–1.05 (ease-in). The release boom's tail is swallowed as it rings out, as
if the sound were being left behind. It stays at 1 to the end of the shot.

**Audio**

| t | sound |
|---|---|
| 0.12 | `kick(1.4)` + `squash(0.5)` (a rubbery compression groan, pitch falling, stretched across the hit-stop) |
| 0.62 | `crack(1.2)` + `boom(1.0)` (before the mute closes) |
| 0.66 | `whine(1.9, 0.12)` on the dry bus (a thin high tone in the `timeStop` family) |
| 1.15 | `breath()` on the dry bus as he lands |

**Motion:** StrikeMacro M1, M2, M3, then Strike F7, F8, F8b, F9, F10.
- The macro frames anchor on their `laces` point, placed on the ball's contact face.
- The side frames use `contact`, except F8 and F8b, which are airborne and use `pelvis`.

### 4 · Air steps (2.6 s): the ball's scene

The ball is the star. No.10 is off screen.

**Camera**
- A side rail at grass level, **locked to the ball**: the ball is held at x = 0.38·VW, leaving lead
  room toward the goal on the right. Zoom 1.6.
- **The horizon stays level**: no roll and no lean.
- Stadium parallax rushes past (crowd 0.25, towers 0.5, pitch 1.0) with horizontal cyan
  `speedStreaks`.
- The vertical follow is damped (camera y follows ball y at 25 %), so the hops read as up-and-down
  motion in frame.

**Ball**
- `drawBall` `'cobalt'`, at least 20 px across on screen, with a navy halo behind it.
- Near-zero spin, plus a ±1 px knuckle wobble at about 6 Hz.
- `vaporRibbon` trail, short (18 points, at most 0.25 s of path): navy halo (normal blend), cyan body
  (additive), ice core. It widens toward its tail and breaks into turbulent puffs. It is never a thin
  taut line and it never persists.
- **Mach cone:** two ice lines opening back from the ball at ±18°, about 120 px long, with a navy
  halo underneath and a small `fx.ca` (0.002) near it. It is drawn on the canvas.

**Beats**
- 0.00 the ball enters from the left at 0.4 m. The world is muffled.
- 0.35 **Air step 1.**
  - The ball dips to 0.15 m. A bright cyan **air sliver** (lens-shaped, at least 4 px tall on
    screen, ice core) flashes between ball and grass for 0.08 s. **The ball never touches the grass.**
  - **Pressure stamp:**
    - a pale ring of flattened grass expands as a squashed ellipse (squash 0.25, r 0 → 40 px over
      0.3 s), with blades flicking outward and a dark core;
    - a dew fountain (30 beads, `'dew'`) and `grassChunks` 6;
    - `fx.shocks` at the stamp (`r` 0 → 0.25) and `cam.hit(0.3)`.
  - The ball springs up toward 0.7 m. Stamp 1 stays in the turf.
- 0.50–0.66 **Defender 1** (`RIVAL_KIT`) steps across the ball's line from the right, plants, and at
  0.62 **jumps to block** (new `jumpBlock` pose): legs together, knees soft, arms tucked behind his
  back, the safe block young defenders are taught. Dew sprays off his take-off.
- 0.72 **Air step 2** lands right under his airborne boots.
  - Hit-stop: rate 0.12 for 0.72–0.82.
  - The ball skims under his studs with a hand's width of air to spare (at least 6 px on screen)
    while he hangs above it. Stamp 2 blooms in the turf beneath him.
- 0.92 **The late boom.** The trailing edge of the Mach cone sweeps over defender 1 a beat after
  the ball has gone, and catches him while he is still coming down.
  - He is flung up and spun in mid-air (`blown` pose, rotation 0 → −2.4 rad over 0.5 s, rising
    about 40 px), and lands in a comic heap.
  - A **V-shaped wake** of flattened grass opens behind the ball: the Mach cone's footprint, a
    chevron decal.
  - A **near-planar refraction band** sweeps across the frame: one `fx.shocks` entry with its
    centre far off-screen left and a big `r`, animated so the band crosses the screen in 0.2 s,
    with `s` 0.04.
  - `fx.ca` spikes to 0.006.
  - The camera is **knocked back** 30 px and springs after the ball (pressure lag). `cam.hit(0.6)`.
  - **The muffle snaps off in one frame, and the full stadium slams back in.**
- 1.10–1.45 **Defender 2** (`RIVAL_KIT_B`) plants to block, then flinches and turns his back (new
  `flinch` pose: shoulders turned away, arms up shielding). The ball whips past his hip at about
  1.1 m on its way up, around 1.28.
- 1.55 a second, **smaller late boom** spins defender 2 down to the turf (`blown` plus a smaller
  rotation, and a smaller band).
- 1.85 **Air step 3**, the biggest, at the edge of the six-yard box.
  - A double-size stamp (r 0 → 80 px) and a curtain of dew and turf.
  - The cushion launches the ball steeply upward.
  - The camera follows it up about 60 px (roughly 8° of tilt). **No sky:** the top of the frame
    reaches the floodlight towers and stops there.
  - Parallax brings the goal frame and the set keeper into the right of the frame over 2.00–2.35.
- 2.35–2.60 whip zoom toward the goal: `fx.radial` 0 → 0.35 (the cap while the ball is on screen),
  centred on the ball, with zoom 1.6 → 2.2.
- The last 2 frames: a cyan blink (`flash` 0.7 in `[70,216,255]`) and the cut.

**Muffle:** 1 from 0.00, snapping to 0 at 0.92.

**Audio**

| t | sound |
|---|---|
| 0.00 | the whine continues (dry), plus a filtered air hiss |
| 0.35 | `boom(0.5, 0)` muffled sub "thoom" + a dew hiss (`crackle(0.3, 0.05)`, muffled) |
| 0.62 | defender 1's take-off scuff, `kick(0.1)`, muffled |
| 0.72 | `boom(0.5, 0)` muffled |
| 0.92 | `sonicBoom(1.0, pan −0.3)` + `crowd(2.5, 0.45)` |
| 1.55 | `sonicBoom(0.6, pan +0.3)` |
| 1.85 | `boom(0.9)` + `crack(0.8)`: the first full-band step |
| 2.30 | `whoosh(0.35, 500, 6000, 0.5)` |

The steps are felt more than heard: under the mute they are only muffled thooms, so the late boom at
0.92 hits like a door slammed open. There are no pitched notes on the steps: a rising note per ball
event is MERIDIAN THREAD's language.

**Motion:** no No.10 frames. Puppets: `jumpBlock` (new), `flinch` (new), and `blown` with spin.
At most 3 puppet renders per frame (2 defenders, plus the keeper at the end).

### 5 · Pressure front (1.4 s)

The finish. The goal follows the same rule as the defenders: the ball arrives first, almost
silently, and the pressure front arrives after it.

**Setting**
- Side view at the goal, camera at crossbar height, a slow push-in (zoom 1.9 → 2.1).
- Goal on the right. The keeper (`KEEPER_KIT`, `k` 1, draw scale 2) is set on his line.

**Beats**
- 0.00–0.22 the pressure ring from step 3 rolls across the six-yard box as a wave of flattening
  grass (the expanding edge of a stamp ellipse) and sweeps the keeper's feet as he pushes off.
  - Poses: `gkReady` → `gkSwept` (new: body tilted back, legs taken) over 0.10–0.30 → a **low**
    `gkDive` (spin tilted toward the turf).
  - He is knocked off balance, so he goes low.
- 0.30–0.62 slow motion (rate 0.15).
  - The ball climbs over his outstretched glove with a clear gap (at least 8 px), inside its vapour
    cone.
  - It passes a hand's width under the crossbar and lights the bar's underside cyan (an additive
    strip over a navy halo).
- 0.62 the rate snaps to 1. The ball punches into the top corner.
  - **The net only dimples** (a local `drawGoal` bulge of 0.15 at the corner), with a tiny tick.
- 0.62–0.80 a held beat: the dew still hangs on the mesh.
- 0.80 **The late boom on the net.** The pressure front arrives.
  - **The whole net balloons:** `drawGoal` bulge 0.15 → 0.85 in 0.08 s. **It does not tear.**
  - Dew and dust blast off the mesh in a squashed ring (the front's footprint on the goal), and the
    gust presses the keeper flat to the turf.
  - A near-planar refraction band crosses the goal; `flash` 0.3, cyan.
  - The posts and crossbar **shudder once**: a single 3 px knock-back that settles in 0.15 s. They
    do not ring or oscillate (a vibrating tuned line is MERIDIAN THREAD's plucked thread).
- 0.90–1.30 **The net exhales.** The balloon holds for 0.1 s, then sighs back (bulge 0.85 → 0.3,
  ease-out), blowing a fan of dew mist out of the mesh toward the camera and shaking a **curtain of
  droplets** (`dropletCurtain`, about 150 beads) off the bar and the top of the net.
- 0.90–1.40 the keeper lies flat and the droplets keep falling.
- The last 2 frames: a navy blink (`flash` 0.8 in `[10,18,56]`).

**Audio**

| t | sound |
|---|---|
| 0.00 | `crowd(3, 0.5)` building |
| 0.30 | `whoosh(0.4, 400, 2500, 0.4)` as the ball passes |
| 0.62 | `kick(0.15)`: the tick of the ball hitting the net |
| 0.80 | `sonicBoom(0.8)` + `boom(0.6, 0.2)` (net whump) + `kick(0.5)` (one dull knock of the frame, no ring) |
| 0.90 | **`gust(1.4)`**: the net exhaling, a long breathy rush that keeps sighing out into shot 6 (new) |
| 0.85 | `crackle(0.6, 0.12)` (droplet patter) |

**Motion:** keeper puppet only: `gkReady` → `gkSwept` (new) → low `gkDive` → flat on the turf.

### 6 · Footprints of air (2.6 s)

The payoff and the celebration.

**Setting**
- **Back view, centred.** No.10 in the foreground, seen from behind (StrikeBack and Stand Back
  frames at integer ×2, centred at x 320, feet at about y 330).
- The pitch recedes toward the goal on the shared **down-the-pitch perspective ground**: projected
  mowing stripes, box lines, and the goal small and straight ahead at the vanishing area (about
  (320, 150)), the net still bellied out.
- **The three stamps** lie on the turf between his boots and the net like stepping stones, each
  still breathing thin dew mist. No line joins them.
- This symmetrical, centred composition is GALE HAMMER's. MERIDIAN THREAD's over-the-shoulder read
  sits off-centre, at ×3, cropped at the knees.

**Camera:** cranes up and back over 0.00–1.30 (camera height +3 m, zoom 1.15 → 0.90, ease in-out).
It is a short crane, not a sky shot: the top of the frame stays on the stands and floodlights. The
three footprints read like stepping stones to the goal.

**Beats**
- 0.00–0.25 B9: he lands the hop on the kicking foot. Squash on landing (2 frames at y-scale 0.96),
  a small dust ring.
- 0.25–1.05 he settles, alternating Stand Back a / b every 0.2 s (shoulders rise and fall: breathing).
  - Breath-mist puffs drift up beside his head at 0.30 and 0.70 (soft white smoke, normal blend).
  - His hair settles.
- 0.50 **Late thunder in the stands.** The pressure front reaches the crowd:
  - a wave of camera flashes ripples around the stands from left to right (0.50–0.80);
  - a refraction band sweeps across them.
- 0.75 **GOAL!** `slamTitle` above the goal, not covering No.10. Ice fill, cobalt stroke, navy
  outline. Confetti (cobalt, white, red, gold) and crowd flashes.
- 1.05–1.70 **The palm blow**, a celebration kids can copy anywhere.
  - B11 at 1.05: he raises his right palm flat to mouth height, aimed at the goal.
  - B12 at 1.30: he blows across it, and the blow sounds like blowing across a bottle: the motif's
    G–B–D **together**, as one breathy chord. A stream of breath mist (ice, about 40 particles,
    alpha 0.5, normal blend) drifts off his palm toward the net, spreading and curling as it goes
    (soft, never a line).
  - **The stamps answer together:** at 1.50 all three exhale a ring of dew mist at once, like one
    breath out.
  - B11 holds 1.60–1.70 (palm still raised), then Stand Back a.
- 1.70–2.60 the **name card** slides in at the bottom, matching Zenith and Crescent:
  `GALE HAMMER` (left), `No.10 · SPECIAL SHOT`, and `CAM 1 - 0 RIV` (right).
- Fade to `[8,4,14]` over the last 0.35 s.

**Audio**

| t | sound |
|---|---|
| 0.00 | the net's `gust` from shot 5 is still sighing out |
| 0.02 | landing thud `kick(0.25)` |
| 0.30 / 0.70 | `breath()` |
| 0.50 | `boom(0.4, 0.9)`: the echoing front hitting the stands |
| 0.75 | `stinger()` + `whistle()` + `crowd(3, 0.5)` |
| 1.30 | `breath(0.6)` (the long blow) + `airTone(G5)`, `airTone(B5)` and `airTone(D6)` together at 0.15 each: the motif's last statement, one blown chord |
| 1.50 | a soft `whoosh(0.4, 600, 200, 0.15)` as the three stamps exhale together |

**Motion:** StrikeBack B9, Stand Back a/b, StrikeBack B11, B12, at integer ×2, anchored on `contact`
like the Jump ground frames.

## Field scenario `'longshot'` (`src/game/field.ts`)

**Registry and constants**
- Add `'longshot'` to `Scenario` and `'gale'` to `SpecialId` in `specials.ts`.
- Field scale: the goal line is at about x 1180, and 10 px is about 1 m.

**Intro** (about 2.0 s)
- 87th minute, 0-0. No.10 collects a loose ball at about x 640 and runs right at 118 px/s, with the
  existing small dribble touches. He is drawn from the motion library's **Dribble** cycle as a
  box-filtered cache at the field scale (built in `prepare()`), not the field puppet: no new
  drawings, and No.10 is never a puppet anywhere in this special.
- The two white defenders do **not** close him down. They drop back to x ≈ 1012 (z 240) and
  x ≈ 1022 (z 292), facing −1, and side-step to mirror his z, forming a screen at the edge of the
  box that blocks the lane.
- The keeper stands about 2 m off his line (x 1160).
- Caption: `No.10 RUNS AT A PACKED DEFENCE · 30 M OUT`. Never "drives".

**Command window**
- It opens when No.10 reaches x 880 (30 m), with `blip(660)`.
- Same panel and slow motion as the other scenarios: `timeScale` → 0.06, desaturation.
- Additions for GALE HAMMER:
  - The SPIRIT gauge is restyled cobalt → cyan (`#2D52E0` → `#46D8FF`).
  - The highlighted row reads `> GALE HAMMER   SP 60`, with a cyan **`30 M`** readout beside it.
    `SHOOT / PASS / DRIBBLE` are dimmed below.
  - **Ghost stamps:** three faint cyan stamp ellipses on the turf at the `STAMPS` positions
    **breathe together** (scale 0.92 ↔ 1.0 over 1.2 s, in time with a soft looping `inhale(1.2)` at
    gain 0.1). No line, arc or note joins them: a route line with a note per marker is MERIDIAN
    THREAD's preview.
  - **Air loading:** a faint pressure-lens pinch on his boot (`lens` −0.06, `lensR` 0.06), with dew
    motes (`'dew'`) drifting toward his boot instead of the rising `'aura'` motes. The aura
    particles use `'cobalt'`. One shared mapping in `field.ts` gives each special its aura ramp:
    zenith → `'aura'`, crescent → `'crimson'`, gale → `'cobalt'`, meridian → `'jade'`,
    solo → `'uv'`.
- Confirm with SPACE or tap. Auto-confirm works unchanged.
- Fix the intro skip in `game.ts`: for `'longshot'` it must jump to x 879 (it currently jumps to
  924).

**Result view**
- The three stamp decals stay in the field turf, with no line between them.
- The ball sits in the top corner of the net.
- The keeper lies flat on the turf (`gkSwept` rotated, `h` −6).
- The defenders are down (`sitA` spun, `sitB`).
- No.10 celebrates from the library's Celebrate C1/C2 (a 0.5× box-filtered cache), never the
  `celebrate` puppet. Fallback: Strike F10.
- Caption `GOAL · GALE HAMMER`. It fades up from `[8,4,14]`.

**Optional design hook:** when both power shots are equipped, offer ZENITH METEOR within 25 m
(after the dribble) and GALE HAMMER at 25–35 m, so each shot owns its own range.

## Studio art (Pixel Studio project "Sochetra")

Every No.10 drawing comes from the shared **motion library** (`../MOTION_LIBRARY.md`): its §1 rules
(canvas 128×128, 98 px tall standing, ground row 102, the 15-colour palette, the on-model checklist,
the `Art` / `Num` / `Ball` layers and the anchor schema) and its frame IDs. This brief only schedules
the frames. The ball is **never** drawn in a frame; the game draws it at the `ball` / `boot` /
`laces` anchors.

| Shot | Library frames (shot-local time) | Anchors |
|---|---|---|
| 2 | Run R1 0.00 · R2 0.07 · R3 0.14 · R4 0.21 · Approach AP2 0.30–0.55 · Strike F5a 0.55 · F5b 0.75 · F5a 1.00 · F5b 1.25 · F5a 1.50 · F6 1.58; the dew mirror shows Glance G4 at ×2 (1.12–1.50) | `contact`; AP2 on `pelvis`; the ball is placed from F5a's `ball` |
| 3 | StrikeMacro M1 0.00 · M2 0.12 · M3 0.62; Strike F7 0.66 · F8 0.70 · F8b 0.92 · F9 1.15 · F10 1.45 | macro on `laces`; F8 and F8b on `pelvis` |
| 6 | StrikeBack B9 0.00 · Stand Back a/b alternating every 0.2 s over 0.25–1.05 · B11 1.05 · B12 1.30 · B11 1.60 · Stand Back a from 1.70 | `contact` |
| field, result | Dribble cycle (intro and command window), Celebrate C1/C2 (result), as box-filtered 0.4×/0.5× caches | `contact` |

GALE HAMMER plays 22 library frames: Run R1–R4, AP2, Strike 8, StrikeMacro 3, StrikeBack 3, Stand
Back 2 and Glance G4, plus Dribble and Celebrate, which all the specials share.

**GALE-specific drawing notes** (the full poses are in the library, §3.2, §3.3 and §3.7):
- The kick reads like the owner's 10-frame kick sheet: the plant toe points at goal, the thigh leads
  the shin, the ankle is locked toe-down from F6 to F7, the knee is over the ball, the head is still
  down, and the energy carries into the hop.
- F5a → F7 share the far toe's pixel. The `boot` anchor (instep) places the smear arc and the
  ankle-lock sparkle. `laces` on the macro frames sits on the ball's dented face.
- The hair lags at contact and whips toward goal on F8 (wind particles stream right).
- In B11/B12 the right palm is flat at mouth height and aimed at the goal, and the head tips toward it.

**Priority:** Strike (batch B), then Run and AP2 (batch A, shared), then StrikeBack and Stand Back
(batch E), then StrikeMacro (batch I), then Celebrate (batch L).

**Fallbacks**
- If StrikeMacro is late, shot 3 crops Strike F6/F7 at integer ×3 on the boot. This is chunkier, but
  it stays on-model.
- If B11/B12 are late, the palm blow is Stand Back a/b with only the breath stream and the chord.
- If Glance G4 is late, the dew mirror shows the existing face crop (G1).
- If Celebrate is late, the result view uses Strike F10. Never the puppet.

## Engine cheat-sheet (new pieces; everything else is as in Crescent's sheet)

**Post FX** (`engine/post.ts`): the **pressure lens**.
- New fields: `fx.lens` (k: positive = bulge or magnify, negative = pinch), `fx.lensX`, `fx.lensY`
  (UV), and `fx.lensR` (screen-height units). All are reset in `reset()`.
- In FINAL, before the shock loop:
  `d = (uv − c)·(aspect,1); r = |d|/R; if r<1: uv −= (d/(aspect,1))·k·(1−r²)²`.
- This is the only new shader work.
- The **near-planar band** for the late booms is one `fx.shocks` entry with its centre far off-screen
  and a large `r`. Remember the 4-slot limit.
- The Mach cone is canvas-drawn. An optional `fx.mach*` refraction can come later.

**Ball** (`engine/pixel.ts`, `kit.ts`)
- `renderBall(..., palette, squash?: { sx, sy, dent })`: ellipsoid normals, a flattened contact face
  on the −x side, and bending seams. The cache key quantises the squash to 0.02.
- New `BallPalette` `'cobalt'`: ice core, cobalt halo.
- `drawBall` passes the squash through.

**Particles:** new ramps `'cobalt'` and `'dew'`. `ring()` and `sparks()` accept them.

**Studio loader:** generalise `art/heroJump.ts` into `art/studioAnim.ts`.
- It loads any strip plus JSON.
- It keeps anchors, tinted and silhouette caches, nearest-neighbour drawing, and rotation about a
  pivot.
- `heroJump()` stays as a thin wrapper.
- The pass and dribble specials reuse it.

**`gale/common.ts` helpers:** `PAL`, `STAMPS`, `vaporRibbon`, `machCone`, `airSliver`,
`pressureStamp` (burst) plus `drawStamps` (decals rebuilt from `STAMPS` and time), `isobars`,
`inhaleField`, `smearArc`, `dewMirror` (the face-in-a-drop disc), `machWake` (the V-shaped wake
decal), `netExhale` (the bulge envelope and the mist fan), `dropletCurtain`, and `recoilSpring` (the
camera knock-back and lag).

**Down-the-pitch ground** (`art/stadium.ts`, `drawDownPitch`)
- A perspective pitch for back views: projected stripes, box lines, the goal at the vanishing area.
- `projectDecal(x, z)` places the stamps.
- MERIDIAN THREAD reuses it (shot 2 and the needle's-eye page, panel 2).

**Puppet poses** (`POSES`), joint angles only:
- `jumpBlock`: airborne, legs together, knees soft, arms tucked behind the back, chin down;
- `flinch`: shoulders turned away, arms up shielding;
- `gkSwept`: body tilted back, legs taken.

`slideTackle` is not used here: the slide tackle belongs to SPOTLIGHT SOLO.

**Audio** (`engine/audio.ts`, all procedural)
- New sounds:
  - `inhale(dur)`: a noise band sweeping 4 kHz → 200 Hz with rising gain and a hard cut;
  - `squash(dur)`: a falling 180 → 70 Hz rubbery groan;
  - `sonicBoom(power, pan?)`: two high-passed noise cracks 0.12 s apart over a 50 Hz sub, with a
    hall tail;
  - `earPop(power)`: a sine sub dropping 90 → 35 Hz over 0.12 s with a soft click and a brief
    low-pass dip, the pressure "pop" felt in the ears;
  - `gust(dur)`: a long breathy rush (band-passed noise sweeping 1.2 kHz → 300 Hz) with a slow
    flutter, for the net exhaling;
  - `breath(len?)`: a band-passed noise puff;
  - `whine(dur, gain)`;
  - `airTone(freq, gain?)`: a breathy bottle tone (noise through a Q 30 band-pass at `freq` plus a
    quiet sine).
- The motif's pitches are exact: G5 783.99, B5 987.77, D6 1174.66 Hz. They are heard only on the
  title (one after another) and in the palm blow (together, as one chord).
- Optional `pan` on `boom` and `whoosh` (a `StereoPannerNode`).
- **Muffle bus:**
  - A `BiquadFilter` low-pass between `out` and the compressor; `muffle(level)` sets the cutoff
    from 20 kHz to 300 Hz with `setTargetAtTime(…, 0.015)` and ducks the shared `crowdBus`.
  - A **dry bus** that bypasses the low-pass carries `whine`, `breath` and `airTone`.
  - The muffle is GALE HAMMER's alone. MERIDIAN THREAD and SPOTLIGHT SOLO only use the shared
    `crowdBus` gain through `duck(depth, dur)`, never the low-pass.
- **One crowd bus, one signature:** `crowd()` connects to `crowdBus`; `duck(depth, dur)` (depth
  first) is shared with the other two new specials, whichever lands first builds it.

**Shot contract** (`timeline.ts`)
- Optional `muffle?(t): number` on `Shot`.
- `Cinematic.step` applies `sfx.muffle(shot.muffle?.(t) ?? 0)` every step.
- **`sfx.clearBus()`** (shared with the pass and the dribble) resets the muffle to 0, releases any
  duck, chokes ringing cymbals and stops the lamp hum. `Game.unleash`, `kickoff`, `Cinematic.seek`
  and every GALE shot's `init` call it (even when `silent`), so scrubbing never leaves the master
  filtered.

**Registry:** `{ id: 'gale', name: 'GALE HAMMER', kind: 'Long-range power shot', scenario: 'longshot', cost: 60, shots: galeHammer }`,
with the folder `src/cinematic/gale/` (index, common, 6 shots, this SPEC).

## Quality bar (what reviewers check)

1. **Still frames read instantly:** who, what, which direction. In shot 4 the cyan air gap under the
   ball is visible in any paused frame of a step (at least 4 px), and the stamp ring is wider than
   the ball.
2. **No long blow-outs.** Every additive cyan glow, especially on the pale pressed grass and in front
   of the floodlights, has a navy halo behind it. The pinch lens must not drag the floodlights into a
   white smear.
3. **The subject is never lost.**
   - The ball stays at least 20 px across on screen, with a navy halo.
   - Particles fade within about 20 px of the ball and of No.10.
   - `fx.radial` stays at or below 0.35 while the ball is on screen.
4. **Pixel-art consistency.** Studio frames and the face sprite are drawn nearest-neighbour at
   integer scales. No.10 is never a puppet.
5. **Clean cuts.** Every shot opens and closes cleanly for a hard cut, using its listed transition:
   ring-pop, ice flash, cyan blink, navy blink, fade.
6. **It is clearly GALE HAMMER:**
   - cyan, cobalt and ice under floodlights;
   - rings, squash and chevrons;
   - level horizons;
   - picture first, boom later.
   It has no crescents, no camera roll, no moon, no fire, no sky and no vertical meteor. The ball
   never rises high and then dips. It never desaturates, never dims the floodlights, never draws a
   taut line, a route line or a panel, never rings a tuned bar, has no heartbeat and no slide tackle
   (see the set rule in the identity section).
7. **Tier discipline.**
   - 6 shots and 11.3 s.
   - Full-frame events are limited to the shot 3 contact, the shot 4 late boom and the shot 5 net
     balloon.
   - The net never tears.
   - Peak loudness stays below Zenith's biggest moment.
8. **Sound.**
   - The mute never reads as a bug: it is closed for about 1.5 s at most, the whine and breath stay
     audible over it, and it is clocked by cinematic time, so seek and replay are exact.
   - The air tones are exactly in tune, and only on the title and in the palm blow.
   - The ear-pops read as pressure, not as heartbeats: one step each, never a lub-dub pair.
9. **Natural motion.**
   - No sliding feet.
   - No hold longer than 0.3 s without a drawn variant.
   - Arms counterbalance, and the hair and hem follow through.
   - The kick reads like the owner's reference sheet.
10. **Performance and determinism.**
    - No big canvas allocations per frame.
    - At most 3 puppet renders per frame.
    - Particles under about 1500.
    - Simulation only on `env.rng` in `update`, with one-time events behind flags.
11. **Photosensitivity** (a game for children): at most 3 full-frame flashes or impact frames in any
    1 s window, across cuts too (shot 2's ice flash, shot 3's impact and its release flash are the
    tightest cluster: keep them at 3). Nothing strobes.
