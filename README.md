# Football game: special-shot prototype

Special-shot scenes for No.10. The review page has a picker for each special:

- **ZENITH METEOR** (sky volley, set up by a dribble)
- **CRIMSON CRESCENT** (bicycle kick, set up by a high cross from No.7)
- **GALE HAMMER** (long-range power shot from 30 m: the air-pressure super shot that shoves the goal)
- **MERIDIAN THREAD** (no-look outside-of-the-boot through pass to No.7)
- **SPOTLIGHT SOLO** (special dribble past four defenders, on the beat)

Specials still in production can be marked `wip: true` in `src/cinematic/specials.ts`; they show only in
the preview build (`npm run build:preview`) or with `?all` in the page URL.

Other abilities (dribble, pass, block, keeper saves) come after these pass quality check.

## CRIMSON CRESCENT

Back to goal under a high cross, No.10 flips upside down; the camera rolls with him until the
stadium hangs upside down; his boot carves a crescent moon of crimson fire through the sky, and
the ball rides that crescent into the net while he lands facing away from goal and never turns around.
Shot-by-shot brief: `src/cinematic/crescent/SPEC.md`.

| # | Shot | What happens | Cut into the next shot |
|---|------|--------------|------------------------|
| 1 | Cut-in | A crescent-shaped panel swings in with No.10's face upside down (the flip to come), eye glint, the name revealed behind a sweeping crescent blade | White blade wipe (the only white cut) |
| 2 | Read the cross | Back to goal, he reads the high cross dropping onto him: heartbeat pulses, silver hair glint, a crimson crescent halo flares round his head | Smash cut on the glint |
| 3 | Lift-off | Plant, deep crouch, a crescent crater stamped into the turf, launch; the camera starts rolling with him | Roll match (the roll continues across the cut) |
| 4 | Inverted sky | Time stops with the stadium hanging upside down: eclipse negative frame, a charge runs down the kicking leg into the boot while the camera keeps turning | Crimson snap |
| 5 | The crescent | The strike: impact frames, the slash split along the crescent arc, the world whip-rolls back upright, the comet is released | Whip pan after the comet |
| 6 | Crescent orbit | Overhead: the comet rockets in, crescent blades orbit the ball, three defenders blasted aside, the pitch sears into a burnt crescent | Black blink |
| 7 | Fingertips | The keeper's full-stretch dive in slow motion; the ball tears the glove off his fingertips | Hard cut on the landing |
| 8 | Back to goal | No.10 lands facing away; the ball rips into the net behind him as the keeper crashes; GOAL!, name card | Fade to the result |

Total runtime 15.3 s at 1×.

No.10 is drawn from the studio animations **Bicycle** (side, played mirrored with readable numbers via
`Bicycle_west.png`), **Land** and **Stand** (front) in shots 3, 4, 5 and 8 (`src/art/anim/`).

New engine pieces for it: the **slash split** post effect (`fx.cut*`, the frame is cut along an arc
and the halves slide apart), `crescentArc` / `crescentPath` drawing helpers, crimson ball/flame/particle
palettes, bicycle-kick poses (`bikePlant` … `bikeFollow`, `landHands`, `landCrouch`), a keeper dive,
and the cross scenario on the field.

## ZENITH METEOR

No.10 flicks the ball straight up out of the stadium, leaps after it, and at the top of the
sky, in front of the full moon, somersaults and volleys it straight down like a meteor.

| # | Shot | What happens | Effects |
|---|------|--------------|---------|
| 1 | Cut-in | Special-move declaration: eyes close-up, glint, name slammed in | Slanted panel, focus lines, letter slam, stinger |
| 2 | Power-up | Low-angle hero shot charging up | Body-hugging flame aura, cracked pitch, floating debris, hair ignition, eye flash, zoom slam |
| 3 | Flick-up | Stands, winds up and scoops the ball into the sky (Flick K1-K3), then crouches and launches after it (Jump F1-F7) | Hit-stop, black/white impact frame, shockwave refraction, camera whip-tilt, aura flare |
| 4 | Ascent | Camera rides the ball through the clouds; No.10 chases it, reaching for the ball (jump sprite F6/F7 loop at 2×) | Speed lines, zoom blur, cloud punch-through ring, altitude-graded sky |
| 5 | Zenith | Time slows before the moon; he tucks and somersaults (Jump F8-F10, spun about its centre), snaps open and volleys it down (Volley V0-V3) | Rim-lit silhouette, sun corona, two-tone red impact frame, sky-wide shock ring |
| 6 | Descent | POV: meteor falls at the lens; then it skims the pitch | Scorched grass trail, two defenders blasted aside |
| 7 | Keeper | Catch, grind, skid, gloves burn, keeper blown into the net | Spin arcs, sparks, skid marks, glove heat, double impact |
| 8 | Net / Goal | Reverse angle: the net stretches toward the lens and tears | Spring-mesh net sim, strand snapping, GOAL slam, confetti, crowd |

Total runtime about 17 s at 1×.

## GALE HAMMER

From 30 m out the keeper laughs and beckons. No.10 grabs the wind out of the stadium, hammers the ball through
the sound barrier, and when the keeper punches it to a dead stop, the thunder catches up and hammers it again,
tearing the keeper away and shoving the whole goal off its pegs. A storm night in ice white, electric cyan,
cobalt and navy; 9 shots, 16.7 s. Brief: `docs/skills/v2/GALE_HAMMER_v2.md` (copy in `src/cinematic/gale2/SPEC.md`).

| # | Shot | What happens |
|---|------|--------------|
| 1 | Thirty metres | The keeper's dare; the wall of three locks arms; the 30 M counter rushes past; No.10 traps the ball and the gust blows the counter away |
| 2 | Grab the wind | He closes his fist on the wind; a ring of air pops out of the stadium |
| 3 | Eye of the storm | The camera punches through a hurricane wall into the calm eye, where he stands in the storm |
| 4 | The inhale | The stadium is sucked toward the ball in three lurches; the plant |
| 5 | Hammer | Hammer 1: the ball is crushed on the laces, the weather-map impact frame, the hit-stop |
| 6 | Sound barrier | The ball's ride, the vapour halo, the detonation that flings the wall, the chase to the keeper |
| 7 | Dead stop | The keeper punches the ball to a dead stop; the thunder wall rolls in |
| 8 | Thunder hammer | Hammer 2: the keeper is torn away, the goal is shoved off its line, GOAL!, the wind wipe |
| 9 | Return the wind | No.10 blows the storm back out of his palm; name card |

New engine pieces (shared with the v2 set): composable post passes (iso/weather-map print, streak), the
FlashBudget photosensitivity guard (at most 3 full-frame events per second), camera shove/buffet, the shared
puppet cache and name card, wind particles, the tilted pitch projector, and the `'longshot2'` field scenario
(`src/game/longshot2.ts`). The v1 film (6 shots) stays in `src/cinematic/gale/` but is no longer registered.

## MERIDIAN THREAD

No.10's special pass. Head up and eyes on the far side, he sells the whole back line one way, then
without looking plays it with the outside of his right boot. The ball rolls low across the grass on a
taut jade thread, through three needle-eye gaps and round the last defender's heel, into No.7's stride.
From the read the stadium drains into a manga page of ink and paper; only the two red shirts, the ball
and the thread keep their colour, until No.7's first touch pulls the thread tight and the colour washes
back along it. No fire, no blasts: defenders are beaten by the disguise. Jade, emerald and pearl on ink
and paper; 6 shots, 10.9 s. Brief: `docs/skills/MERIDIAN_THREAD.md` (copy in `src/cinematic/meridian/SPEC.md`).

| # | Shot | What happens |
|---|------|--------------|
| 1 | Stitch-in | Manga panels stitched together by a needle: No.10's face and the boot on the ball; the title is sewn in |
| 2 | Playmaker's eye | Back view: the stadium drains to ink as he looks far right; three needle eyes open in the back line |
| 3 | Outside of the boot | The trivela, struck while looking the other way: an ink freeze with only No.10 and the ball in colour |
| 4 | Needle's eye | The ball scene, three locked manga panels: the poke-tackle missed, the ball alone between two defenders, round the last heel |
| 5 | Meridian | Overhead: the whole thread laid across the pitch, beaten defenders with question marks, No.7 converging on the X |
| 6 | First touch | No.7 receives in stride, the colour washes back along the thread, he finishes; the two friends point at each other |

No.7 is drawn in the studio too (project "No.7": Idle, Run, Receive, Point), and No.10's pass frames are
the studio animations **Trivela**, **Carry**, **Scan** and **Point**. New engine pieces: the ink grade
(`inkGrade` and the manga helpers in `src/art/fx.ts`), plucked-string audio (`pluck`, `strum`, `tick`,
`zip`), the pearl ball, front-view pixel defenders (`src/art/figures.ts`), `src/art/no7.ts`, and the
`'through'` field scenario.

## SPOTLIGHT SOLO

No.10's special dribble. Four white shirts wall off the box; the floodlights crash off bank by bank, one
follow-spot finds No.10, and the pitch becomes a stage. His feet play a drum solo: every touch is a drum
hit and every skill lands on the beat, and on every beat the light keeps an ultraviolet exposure of him,
like a strobe photograph, so the shape of each trick hangs in the dark after he has gone. Four defenders,
four real skills (step-over, sole lift over a slide tackle, elastico, nutmeg), four OLÉ!s from the crowd.
On the last beat his sole stops the ball dead on the penalty spot, a second spot clunks on over the
keeper, and the floodlights slam back on: one on one. No goal, no fire: 7 shots, 11.0 s.
Brief: `docs/skills/SPOTLIGHT_SOLO.md` (copy in `src/cinematic/solo/SPEC.md`).

| # | Shot | What happens |
|---|------|--------------|
| 1 | Count-in | The follow-spot finds his face; the title lights up lamp by lamp to a four-count on the sticks |
| 2 | House lights | The floodlights crash off bank by bank; the wall of four turns to silhouettes; one spot on No.10 |
| 3 | Step-over | Defender A buys the body sell and dives the wrong way; the first violet exposure, the first OLÉ! |
| 4 | Sole lift | The ball's scene: B's slide tackle, the sole lift over his studs, the ball's afterimages on the beat |
| 5 | Elastico | C stabs at the shown ball and freezes in a comic split; No.10 is already gone |
| 6 | Nutmeg | Through D's legs, seen from behind the ball; D's upside-down face; the strobe chain |
| 7 | On the mark | Sole on the ball on the penalty spot, the keeper's spot clunks on, lights up: 1 ON 1, name card |

The result view is **BREAKTHROUGH · 1 ON 1** (no goal). No.10 is drawn from the studio animations
**Dribble**, **SoleLift**, **Settle**, **StepOver**, **Elastico**, **Nutmeg** and **Break**; B's slide is
**RivalSlide**. New engine pieces: the beat echo post effect (`fx.echo*`), the stage lighting module
(`src/art/stage.ts`: dimming, beams, floor pools, follow-spot), drum and crowd sounds (`tom`, `snare`, `ole`,
`lampHum`, …), the blacklight ball, and the `'gauntlet'` field scenario (`src/game/gauntlet.ts`).

## No.10 jump animation (Pixel Studio)

A hand-crafted 10-frame side-view jump, drawn at the studio model's exact scale (128×128 canvas, 98 px
tall) and palette, in the studio project "Sochetra" as the animation **Jump** (view Side), and in the game
as `src/art/hero_jump_side.png` + `src/art/hero_jump.json` (frame names, holds, pelvis/contact anchors).

| # | Frame | ms | # | Frame | ms |
|---|---|---|---|---|---|
| 1 | load | 100 | 6 | knee lift | 100 |
| 2 | crouch | 130 | 7 | rise float (loops with 6) | 100 |
| 3 | push | 60 | 8 | pre-tuck | 80 |
| 4 | take-off | 60 | 9 | tuck | 100 |
| 5 | leap | 80 | 10 | tuck roll | 120 |

`src/art/heroJump.ts` loads the strip at boot and draws frames nearest-neighbour around their anchors
(ground frames on the planted toe, airborne frames on the pelvis), with cached tinted and rim-lit
silhouette copies for the shot effects and rotation about the tuck's centre for the somersault.
ZENITH METEOR shots 3-5 use it for the take-off, ascent and tuck. The flick (Flick, 3 frames) and the
overhead volley (Volley, 4 frames) are drawn too (`src/art/heroKick.ts`, `hero_kick_side.png`), so No.10
is the drawn character in every Zenith shot. New animations go in `src/art/anim/` and load through
`src/art/studioAnim.ts`; the plan for every skill's frames is `docs/skills/MOTION_LIBRARY.md`.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # single-file build in dist/index.html
npm run build:artifact   # dist/zenith-meteor.html for publishing as a page
```

Controls: **Space / tap** confirm, **R** replay special, **1–8** jump to a shot, **P** pause,
**.** step one frame, **K** kick-off. The review console under the canvas has speed (0.1×–1×),
a timeline scrubber, and toggles for sound, post FX, and auto-confirm.

Dev pages: `dev/puppets.html` renders every pose for every kit (`?d=3&kits=1&only=stand,leap`).
`/?special=crescent&seek=9.2&pause` opens a special frozen at 9.2 s.

## Code map

```
src/
  engine/   math, camera (trauma shake), WebGL post FX, particles, pixel rasterizer, procedural audio
  art/      hero sprite (your 100×100 pixel art) + derived masks, jump sprite (heroJump.ts + hero_jump_side.png),
            skeletal pixel puppets, stadium, FX drawing
  cinematic/timeline.ts    shot runner: cues, hit-stop time warps, deterministic seek
  cinematic/kit.ts         shared shot helpers (trails, ribbons, ball, flames, sparks, dust…)
  cinematic/specials.ts    registry: name, move type, field scenario, shots
  cinematic/zenith/        the 8 shots of ZENITH METEOR
  cinematic/crescent/      the 8 shots of CRIMSON CRESCENT (+ SPEC.md)
  cinematic/gale2/         the 9 shots of GALE HAMMER (+ SPEC.md); cinematic/gale/ is the retired v1
  cinematic/meridian2/, solo2/  MERIDIAN THREAD v2 and SPOTLIGHT SOLO v2 (wip, preview build only)
  cinematic/meridian/      the 6 shots of MERIDIAN THREAD (+ SPEC.md)
  cinematic/solo/          the 7 shots of SPOTLIGHT SOLO (+ SPEC.md)
  game/     field play (dribble → command window) and the top-level flow
```

How it is built:

- **Rendering**: everything is drawn with Canvas2D in a 640×360 logical space, then a WebGL pass adds
  bloom, shockwave refraction, zoom blur, chromatic aberration, impact frames, flash, and grading.
- **Characters**: the close-ups use the hand-drawn No.10 sprite. Action poses use skeletal "pixel
  puppets" rasterized from capsules into a pixel buffer with cel shading and outlines, in the same
  palette, so new poses are a few joint angles (see `POSES` in `src/art/puppet.ts`).
- **Shots are self-contained**: each shot owns its state and a seeded RNG, so any shot replays
  identically and the scrubber can seek anywhere.
- **Audio** is synthesized with WebAudio (no files).

To add another special: create a folder of shots like `src/cinematic/crescent/`, register it in
`src/cinematic/specials.ts` (name, move type, field scenario), and it appears in the review picker.

### Determinism and the review loop

Every frame of a special can be reproduced exactly, which is what makes frame-by-frame review possible:

- `Cinematic.render` starts each frame from a cleared canvas and a reset 2D context, so a frame never
  depends on what the previous frame or shot left behind.
- Steps snap to the 1/60 s grid and `seek` is frame-exact; each sound cue fires exactly once per shot.
- `env.frng()` flicker and the film grain follow the cinematic clock during a special.
- Pooled particles reset every field on reuse; puppet outline/silhouette passes reuse one scratch buffer.
- Shots may define `prepare(env)` to build caches when a special is selected (no hitch on first play).
- The audio master has a brick-wall limiter after the glue compressor so the biggest hits stay clean.

Dev hook for captures: `window.__qc.seekShot('crescent', shotIndex, localSeconds)` freezes any frame.

## Pixel Studio (MCP)

The hero's sprites live in the team's Pixel Clean Studio project "Sochetra" (canvas 128×128; Idle in
Front/Side/Back views). `.mcp.json` registers the studio's MCP server for Claude Code sessions in this
repo. It holds no secret: the token comes from `PIXEL_STUDIO_TOKEN` on your machine, and cloud sessions
get it injected by the environment's network secret.
