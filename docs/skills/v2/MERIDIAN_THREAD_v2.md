# MERIDIAN THREAD v2: production brief

No.10's special pass, rebuilt from the ground up because it has to leave the ground.

> No.10 taps under his eye and draws a line across the sky with one finger: a promise to his friend.
> Threads of light shoot from his eyes and fingertips and pin the whole stadium like a loom. Then,
> looking the other way, he lofts the ball with the outside of his right boot. It climbs into a great
> jade arc across the whole stadium, 26 m up at floodlight height, a brush stroke of light with a
> thread at its heart, and every floodlight it passes catches its jade light. At the top the world
> stops. An eye of light opens in the night with the ball as its pupil and stares down at the
> defence. The Tower, the biggest centre-back, leaps impossibly high, grabs the thread and hauls with
> all his weight; the arc sags and its light drains, but the ball keeps creeping on. Far below, No.10
> strums the air with his whole hand. **TWANG.** The thread snaps taut and flings the giant into the
> night. The eye closes into a needle that falls onto No.7's run, and No.7 meets it with a flying
> header. The whole thread's light pours down into the ball, the line snaps straight like a
> bowstring, it lashes the keeper down onto the turf, and the net lights up and rings like a jade
> harp. Under the arc that still hangs across the stadium, the two friends point at each other.

**The playground test** (what a 9-year-old says on the way home): *"He pointed at his friend and drew
a line in the sky, and strings came out of his eyes and fingers to the lights! Then he kicked it
WITHOUT LOOKING and it went so high the lights went green! At the top a giant EYE opened in the sky.
The biggest defender jumped up and grabbed the string and pulled and pulled, but the ball kept going,
and No.10 just strummed the air like a guitar and TWANG, the giant flew away! Then it fell like a
needle, No.7 did a diving header, the string whipped the keeper down, and the net played music!"* Every shot below gives one
sentence of that story.

This brief replaces `docs/skills/MERIDIAN_THREAD.md` and `src/cinematic/meridian/SPEC.md` (v1, 6 shots,
10.9 s). The v1 shot files are deleted; v2 keeps `common.ts` helpers that still fit (listed in the
engine cheat-sheet). ZENITH METEOR is the quality bar, CRIMSON CRESCENT's SPEC is the format.

| | v1 (shipped) | v2 (this brief) |
|---|---|---|
| Runtime / shots / SP | 10.9 s / 6 / 50 | **16.8 s / 9 / 70** |
| The pass | a ground roll, never above 4 px | **a lofted outside-of-the-boot pass**, 26 m apex at floodlight height, 35 m long, a needle-steep drop onto No.7's run |
| Hits | strike at 3.7 s, then quieter | loft **3.70 s (22 %)**, apex hang **7.62-8.72 s (the midpoint)**, TWANG **10.10 s (60 %)**, header **12.46 s (74 %)**, harp net + GOAL! **13.84-14.10 s**: every hit after the midpoint is bigger than the one before |
| World | grey ink-on-paper page (colour removed) | **Night Ink**: the stadium crushed to ink-black and emerald-black, the only saturated light is jade (the arc, the ball, the lamps it turns) |
| Ball on screen | 4-24 px, at the bottom of wide frames | **48-72 px** with jade-lit seams in the ride, **60 px** at the apex, 48-70 px in the fall, ~60 px on No.7's forehead |
| Giant energy shape | a 2-4 px thread with a 22 % halo | **the Meridian** (a 75 px brush stroke of light, 180 px with halo, the full frame long), **the Sky Eye** (340 x 150 px), **the Needle / Bowstring** (400-640 px), **the Harp** (the lit goal, 520 x 200 px) |
| Contact stacks | an ink freeze and a pluck | loft **12 layers**, TWANG **11**, header **13**, harp **10**, each with MERIDIAN's own **halftone impact frame** and **pluck warp** |
| Opponents | sprawl politely | the Tower **flung into the night** by a strum; the keeper **lashed by the line and spun 1.5 turns down onto the turf at the near post**, a jade loop still on his wrist; the line left looking up at the sky in fear |
| Camera | locked comic panels, no roll | a needle's-eye iris, a **crane-and-tilt up the star chart**, a **chase-crane catch and ride up the arc**, a **look-down hang past the ball**, a worm's-eye up at the eye, **a fall with the needle**, crash zooms (to 3.4), whip-tilts and a whip-pan on the shared streak; roll stays 0 |
| Sound | plucks and ticks, booms at most 0.4 | the arc **sings as a bowed string**, the held note at the apex, **twang** on every string event, booms up to 1.4, roar, a **harp glissando** across the net |

**The look decision: evolve, do not drop, the ink/manga look.** The grey paper page is gone: it can
never out-shine anything, so the thread could never be the light source (v1: 1.0 % saturated light,
the least of the five). **The page turns black.** MERIDIAN keeps its manga grammar as punctuation
(slanted panels with ink borders and paper gutters, ink outlines and under-strokes under every glow,
screentone in the deepest shadows, hand-lettered ink SFX, the stitched title, the diptych) and its
impact frame is printed in halftone like a manga page.

## Where it came from (synthesis of the three pitches and the judges)

Built on the **power** pitch (49/60: world, impact stacks, the big ball, the bowstring snap, the
halftone print), with the **camera** pitch's arc rig and apex look-down (47) and the **hero** pitch's
story beats (48: the Meridian Sign, the Tower struggle and the pluck, the Sky Eye, the needle).

| Judged weakness | Fix in this brief |
|---|---|
| Camera: the signature camera needs a `pitch3D` rig (tilt, yaw, three solved dolly zooms) the engine lacks | No pitch3D. Side elevations use a 2D "ride world"; the two looks down use `DownPitchView` plus one small addition, a **pitch-only `tilt`** (no yaw, no roll, no solver), with the judges' lens shift (principal point moved) as its fallback. Geometry note in Continuity |
| Camera: "MERIDIAN bends distance" makes the dolly zoom its signature, and the dolly zoom is CRESCENT's shot-2 move | **No dolly zoom anywhere.** MERIDIAN's distance move is vertical: the crane-and-tilt up the star chart to its 26 M tick (2b), the chase-crane catch up the arc (4) and the fall with the needle (7). No crash pull-out (that is GALE's blow-back) |
| Camera + power: defenders' shadows stitched to the turf (Naruto's shadow sewing) | **Dropped entirely.** No shadow is ever pinned |
| Camera: the 70 degree fake-3D wink swing and the reverse dolly zoom cost a lot for little | Dropped. The wink is a crash punch-in |
| Power: shot 5 Keystone is a zoom-0.55 broadcast wide with a 16 px ball and 34 px figures (v1's diagram) | The apex is a **look-down hang past a 60 px ball** in the foreground, the whole box laid out below |
| Power: motif overload (8 giant shapes, sky dome, seam pucker, turf seam, aura, curtain, phone-flash waves) | **4 giant shapes, one per act**; supports capped (the aurora is a hem of at most 160 rays); no sky dome, no seam pucker (the pluck warp is the one line warp), no phone-light waves, **no turf seam** (the loft's ground beat is the flat stitched ring at the plant) and **no aura** (shot 2a's loom is drawn with the stroke's own `threadLine`). A frame has one subject shape and at most 2 supports |
| Power: a 42 m apex above the roof drifts toward ZENITH's climb | **26 m, inside the bowl, at floodlight height.** Every high frame contains a stadium structure (roof rim, pylon, lamp heads) |
| Power: the least daring camera | arc ride, look-down hang, worm's-eye, fall with the needle, crash zooms, whip-tilts, a whip-pan |
| Hero: comic undercut (cartoon twinkle, keeper spun like a top into a dizzy sit, X plaster, GOAL! embroidered over 0.8 s) | The Tower is flung with no twinkle and lands face-down far away; the keeper is lashed and spun down onto the turf (never into the netting); no plaster; GOAL! is stitched in 0.12 s and slammed |
| Hero: the Fingertips freeze repeats CRESCENT shot 7, plus two more fingertip near-misses at the header | **No fingertip near-miss anywhere.** The Tower goes straight for the thread; the header's contact frame has no keeper hand in it; the keeper's beat is a lash at full speed |
| Hero: crowded shots (4 set-ups in 1.8 s; 8 sub-beats in 1.9 s) | At most 2 set-ups per shot (shot 9 has 3 across 3.0 s) plus at most one inset panel; no three-panel faces strip |
| Hero: the heaviest art load (32 frames, a new character with 8 frames) | **24 required frames** (the Tower 5); 3 optional; puppet fallbacks for every rival |
| Hero: the ball literally stopped at the apex; "the giant caught it" risk | **No dead stop anywhere.** The 0.30 s sag is a tug-of-war: the ball keeps creeping forward (never below about 30 % speed) while the Tower strains; the ride is a 2.4 s showcase; the strum insert is a ×2 bust and the TWANG is bigger than anything before it |

**Kept from v1** (it works): the no-look look-off and the four defenders swivelling after it; "eyes
here, ball there"; the outside-of-the-boot technique (now a loft); **the wink** (T8a/T8b); the watch
ticks (his inner clock); the rising plucked motif (now E-F#-A-B, resolving to D on the header); the
cross-stitch X target; the thread wipe idea (as the bowstring snap); the colour returning along the
line; the stitched title; the friends pointing and the fingertip diptych; the `'pearl'` ball, the
`'jade'` and `'ink'` ramps, `JADE_FLARE`, `THREAD_NOTES`, `stitchTitle`, `crossStitch`, `needlePoint`,
`mangaPanels`, `inkSfx`, `spinMarks`; the name card (now the set's one shared `nameCard`).

**Dropped from v1:** the ground roll and its 4 px rule; the grey paper grade; the comic-page ball
scene; the broadcast wide with a 4-6 px ball; No.7's plain side-foot; "a clear notch below every shot
in raw power"; the bans on rings, shocks, the impact shader, sky, roar and deep ducks; the one-
dimension set rule.

## Identity

**The identity rule (replaces v1's "one dimension each" set rule).** The owner's standing rule is
that every special gets the strongest effects, camera and scene. So every skill may use the full power
kit (hit-stops, impact frames in its own colours, shock rings, crash zooms, sky or darkness, roar,
near-silence, an overpowered keeper). What stays exclusive is each skill's **palette, element,
signature energy shape, signature camera move, signature post effect, impact-frame style, transition,
signature sound, gesture, keeper beat and false defeat** (the rows of the shared set table below).

**What MERIDIAN does to the world:** *the pass draws a line of light across the stadium that stays
there, and the whole world reacts to it as to a string*: it is strung (the loom), bowed (the arc
sings), held (the apex), grabbed (the Tower), plucked by a strum of his hand (TWANG), drawn taut (the
bowstring) and strummed (the harp net).

| | ZENITH METEOR | CRIMSON CRESCENT | GALE HAMMER v2 | **MERIDIAN THREAD v2** | SPOTLIGHT SOLO v2 |
|---|---|---|---|---|---|
| Move | sky volley | bicycle kick | 30 m power shot | **no-look lofted outside-of-the-boot pass, No.7's flying header** | special dribble through four, ends 1 on 1 |
| Element | fire, the sky, the moon | the crescent blade, rotation | air pressure: vacuum, vapour, shock, wind, late thunder | **a line of jade light that the world treats as a string (strung, bowed, held, grabbed, strummed, drawn taut)** | stage light as a weapon: blackout, white-hot beams, ultraviolet pouring from torn turf |
| Palette | fire orange / gold, night blue | crimson + silver, indigo | ice white and electric cyan on storm navy; cobalt only as halo, stroke and iso band | **jade / emerald / mint / pearl on night-ink** | white-hot + ultraviolet / volt + ivory on plum-black |
| Space | vertical: up through the clouds to the moon | rotation: the stadium turns over | horizontal and low (ball at most 1.9 m), down the pitch | **a long lateral arc inside the bowl, 26 m at floodlight height; never above the roofs** | a stage on the turf (ball at most 1.4 m), one 22 m crane |
| Signature camera | ride straight up 2950 px; POV meteor at the lens | roll to 180 deg, whip-roll | GALE §1.3: vacuum pull, blow-back, shove, ride, swing-orbit, chase POV, proof reveal; never rolls | **the chase-crane catch and ride up the arc; the look-down hang past the ball; the fall with the needle; the crane-and-tilt up the star chart.** Roll 0, no dolly zoom, no pull-out | the beat-slam camera on a 150 BPM grid; the glue cam; the arc round his body; the shadow crane-rush; never rolls |
| Energy shape | meteor, fire column, full moon | crescent blade, crescent moon | vapour cone, vapour disc, cyclone wall, pressure orb, pressed V-wake, thunder wall | **the Meridian brush stroke, the Sky Eye, the needle, the bowstring, the harp** | the hammer beam, the Chorus (crisp UV copies of him), light gashes with UV shafts, neon statues, the strobe chain |
| Signature post effect | two-stage black/white then red/black impact | slash split `fx.cut*` | pressure lens `fx.lens*` + isobar frame `fx.iso*` | **pluck warp `fx.pluck*`** (the picture bends along the line in a standing wave) + **halftone impact** `fx.tone*` | cone-masked beam impact (+ echo) |
| Impact frame | black/white, then red/black | crimson/black, silver/indigo | isobar weather map, then inverted | **jade print (night/mint, halftone dots in the threshold band only), then a plain pearl negative (pearl/emerald, no dots)** | beam impact |
| Own transition | white flash | white crescent-blade wipe | wind wipe, ring-pop | **the needle's-eye iris, whip-tilts on the shared streak, the mint whiteout out of the ball's core** | blackout cuts, chorus wipe, whip-pans (no irises) |
| Signature sound | roar, fire, `timeStop` | metal shing, heartbeats | howl → vacuum → hammer; sonic boom; the thunder that catches up; ear-pops; G-B-D air tones; digit clacks | **the string: plucked motif, bowed arc, held note, `twang`, harp glissando; watch ticks** | the snap; the stick count-in and the 150 BPM drum solo; the choke into silence; OLÉ 1-4; the relight |
| Gesture | (power-up roar) | (back to goal) | grab the wind / return the wind (the palm blow) | **the Meridian Sign (tap, sweep, point) and the strum** | the snap |
| Opponents | defenders blasted, keeper burned into a torn net | defenders spun, glove torn off | wall flung by the detonation; keeper punches it dead, then is folded and cartwheeled; goal shoved off its line | **the Tower flung by the TWANG of a strum; the keeper lashed and spun down onto the turf; the net never torn or moved** | four wrecked one by one and frozen mid-defeat as neon statues; all four crash at once when the lights return; the keeper rocked back |
| Keeper beat | holds the meteor in a 1.1 s grind, burned into a torn net | fingertips on the ball, glove torn off | the set's only double-fist punch (`gkPunch`); folded and cartwheeled by the thunder; the set's only side-netting end pose (`netTangle`) | **one glove reaching in `gkDive` at full speed (never frozen), lashed by the line and spun 1.5 turns down onto the turf at the near post, a fading jade loop on his wrist; never in the netting** | his own spot slams on for the duel; rocked back on his heels shielding his eyes (no goal) |
| False defeat | the grind: the keeper seems to hold it | the fingertip near-miss freeze | the set's only dead stop + grin: the ball hangs dead, the keeper grins at us, the thunder wall races in behind him (0.45 s) | **the tug-of-war: the Tower hauls the thread into a V and its light drains, but the ball keeps creeping on (never below about 30 % speed); he strains, never grins** | D smothers him: black, silence, a sliver of light, CRACK |
| Ending | GOAL!, net torn | lands back to goal | the goal 2.8 m behind its painted line; GOAL! on the wind wave; Return the Wind | **the bridge: two friends at the two ends of the arc, the fingertip diptych** | the curtain drop: the stadium relights, 1 ON 1 at 130 px |
| Runtime / SP | 17.2 s / 80 | 15.3 s / 90 | 16.7 s / 75 | **16.8 s / 70** | 16.4 s / 65 |

The rows are the shared set table's (`GALE_HAMMER_v2.md` §1.1; single source `docs/skills/SET_TABLE.md`),
and the GALE v2 and SOLO v2 cells follow it with the set critic's re-sync (GALE: the isobar impact, the
§1.3 camera, its opponents; SOLO: the beam impact, the cone-masked beam impact (+ echo), the glue cam, the
arc and the shadow crane-rush). GALE v2 §1.1 already prints MERIDIAN's v2 column except four pre-critic
phrases (the "pluck" in Gesture and Opponents, "a hang of at most 0.12 s inside a 0.30 s sag" in False
defeat, and a camera cell without the climb up the star chart); SOLO v2 §1.1 still prints the pitch-era
column ("rides the arc; apex freeze", "about 16.6 s / tbd"). Both take this column at their next sync,
so all three v2 briefs carry the same rows.

**MERIDIAN owns** (nobody else uses these as a core look): jade/emerald/mint/pearl on night-ink;
threads, strings, stitches, running stitches, the cross-stitch X, the needle and the needle's eye (and
the needle's-eye iris); the loom (a string web from the hero's eyes and fingertips to the stadium); the
brush stroke of light; the eye of light in the sky; manga panels, ink SFX, halftone print and the
diptych; the pluck warp; plucked, bowed and struck string sounds and the harp; the watch ticks; the
strum gesture; the chase-crane ride up an arc; the crane-and-tilt up a star chart; the look-down hang;
floodlight lamp heads catching jade light from the arc (passive, a smooth function of distance, never a
switch).

**MERIDIAN never uses:**
- *ZENITH's:* fire, flames, the moon, clouds, stars or open space above the stadium, a vertical climb,
  the black/white or red/black impact, an object falling at the lens from a ground POV, the view
  through the net from behind the goal, a torn net, `timeStop()`.
- *CRESCENT's:* crimson, **any camera roll** (`rot` 0 in every shot, `cam.shakeRoll` 0.015), Dutch angles,
  **the dolly zoom**, crescents, the slash split `fx.cut*`, heartbeats, a top-down orbit, a torn
  glove, **a fingertip near-miss freeze**.
- *GALE v2's:* air, wind, vapour, storm, isobars, cyan/cobalt/ice, the pressure lens `fx.lens*`, the
  isobar impact `fx.iso*`, the muffle bus, `sonicBoom`, `earPop`, `gust`, `breath`, `inhale`, dew, the
  recoil, **the blow-back** (a crash pull-out off a hit), a yaw orbit round a frozen subject, a low
  straight ball line, a goal shoved off its line, **the ball stopped dead while the opponent grins**,
  **a double-fist punch at the lens**, **a keeper tangled in the side netting**.
- *SOLO v2's:* violet/UV, a follow-spot, floodlights dimmed, switched off or blown, **floodlight bank
  events** (banks surging out, relighting or switching one by one, with clunks), beams, light shafts
  or god rays cast from the ball or a lamp (the aurora hem is a curtain hanging from the stroke, never
  a shaft from a source), the beam impact and the beat echo `fx.echo*`, afterimage copies of a player, **light
  gashes in the turf** (a lit seam opening in the ground, in any colour), ripped turf, divots or sods, a
  slide tackle, drums, `ole`, `lightsOff/On`, `spotOn`, a chant, the snap gesture (or any finger
  snap).

**Originality guard.** The name was checked in Nov 2026 (v1): no anime or game move is called
"Meridian Thread"; re-check before shipping. A lofted outside-of-the-boot pass and a diving header are
real football, taught to kids. It is not a Captain Tsubasa move: no twin shot, no combination play,
one player passes and one finishes. Re-check before shipping that no named football-anime move uses an
eye of light whose pupil is the ball, a needle-fall, a string web shot from a player's eyes and
fingertips, a strum that flings a defender or a net that plays like a harp. **The banned word appears nowhere** in names, captions, identifiers or comments:
use `loft`, `pass`, `header`, `arc`, `line`, `push-off`.

## Palette, light and the four giant shapes

`PAL` in `meridian/common.ts` keeps its v1 keys and adds two.

| Key | Hex | RGB | Use |
|---|---|---|---|
| `jade` | #2FE08A | 47,224,138 | stroke body, eye lashes, the tint lamp heads catch from the arc, sparks, GOAL! fill |
| `emerald` | #0B8F58 | 11,143,88 | stroke halo, iris field, the ball's outer glow, impact stage B dark |
| `mint` (new) | #BFFFE0 | 191,255,224 | stroke inner, the hot core where bloom catches, impact stage A light, the shot 4 → 5 whiteout |
| `pearl` | #FBF6EA | 251,246,234 | thread core, ball core, eye rim, stitch-hole stars, **flashes** (`PEARL_FLASH`) |
| `night` (new) | #06140F | 6,20,15 | the world's deepest shadow, sky floor, impact stage A dark |
| `ink` | #0D0D14 | 13,13,20 | outlines, under-strokes, focus lines, panel borders |
| `paper` | #EFE7D6 | 239,231,214 | panel gutters, the diptych, the name card only |
| `tone` | #77716B | 119,113,107 | screentone dots |
| `gold` | #FCB94C | 252,185,76 | HUD and name card only |

- `fx.flash` colour is **pearl** in Night Ink (paper reads yellow on black), except the shot 4 → 5
  whiteout, which is **mint** (`fx.flashColor` [191,255,224]) grown out of the ball's jade core. Never
  pure white.
- `lensFlare` always gets `JADE_FLARE` [150,255,200], never the default cyan.
- The ball after the strike is `drawBall(..., 'pearl')` with the new `seamGlow` (jade panel seams).

**The Night Ink grade** (`nightInk(ctx, amount, restore?)`, canvas, built on v1's `inkGrade` and its
scratch, mask and screentone canvases):
1. `'saturation'` fill toward mid-grey at 0.85 x `amount`;
2. `'multiply'` of [70,92,84] at `amount`: the environment drops to about 25 % luminance with a cold
   green-black cast;
3. `'multiply'` of the cached screentone at 0.35 x `amount`, so the shadows print as manga dots;
4. **restore** (optional): a masked copy of the ungraded frame drawn back along a band (the stroke's
   light band, w 90, soft 60; or an ellipse pool under the ball). Colour comes back where jade light
   falls.

Layer order in every inked shot: sky, stands, pitch, rivals, keeper → `nightInk(...)` → stroke and
hem, ball, No.10, No.7, the Tower's studio frames, particles, panels, text. **No.10, No.7 and the ball
are never graded**; rivals are inked with the world (in ink they read as manga extras).

**The floodlights stay ON and passive** (light is not MERIDIAN's dimension, and lamp events are SOLO's).
Their **lamp heads** (not the glare over the pitch) only catch the arc's light: each head's tint toward
jade-white [200,255,225] is a smooth function of its screen distance to the nearest point of the stroke
or the ball (`lampTintFor`: smoothstep from 1 at 60 px to 0 at 260 px, times the stroke's light), so it
rises and fades as the arc passes and drains when the stroke drains. **No per-bank switching, no clunk
ticks, `JADE_FLARE` on a lamp head at most 120 px, and no "back to white" beat**: when colour returns at
GOAL! the tint simply fades with the dissolving arc.

**Post settings** (`nightGrade(fx, o)` sets the shared ones: contrast 1.12, sat 1, tint [235,255,245],
vignette 0.6, grain 0.05):

| Shot | `nightInk` | bloom | bloomThresh | extras |
|---|---|---|---|---|
| 1 | none (black page background) | 1.0 | 0.70 | vignette 0.5 |
| 2a / 2b | 0 → 0.85 (bleeds in 0.00-0.25) / 0.85 | 1.0 → 1.15 / 1.0 | 0.64 | |
| 3 | 0.80, stroke band restore from 0.66 | 1.05 (1.2 at contact) | 0.64 | |
| 4 | 0.85, stroke band restore | 1.10 | 0.64 | CA 0.004 base; `fx.fullFrame` 2.33-2.40 (F4) |
| 5 | 0.90, pool restore under the ball (ellipse 220 x 90) | 1.15 | 0.62 | vignette 0.65; `fx.fullFrame` 0.00-0.12 (F4 held) |
| 6 | 0.85 | 1.15 | 0.62 | |
| 7 | 0.85, pool restore under the X | 1.10 | 0.64 | |
| 8 | 0.85, then a 120 px band lifts along the spear from 0.36 | 1.2 at contact | 0.64 | |
| 9a | 0.85 → 0 (lifts from the net outward, 0.30-0.70) | 1.0 | 0.70 | `fx.fullFrame` 0.30-0.70 (F10) |
| 9b, 9c | 0 | 0.9 | 0.72 | full colour; lamp heads tinted only by the dissolving arc |

**The four giant energy shapes** (one per act; a frame has one subject shape and at most two of the
small supports below it). Each glow sits on an **ink under-stroke** (normal blend), so nothing blows
out to flat white and the shapes read as inked manga lines.

1. **The Meridian** (shots 1, 3, 4, 5, 6, 9): the ball's path drawn as a **brush stroke of light**
   that stays in the sky after the ball has passed.
   - Outside in: ink under-stroke (w + 8), emerald halo 2.4w (additive, alpha 0.35), jade body w, mint
     inner 0.5w, pearl thread core 3 px with stitch glints travelling toward the ball.
   - **Dry-brush bristles**: 8 thin 1 px jade/mint streaks along each edge with noise gaps (this makes
     it a brush stroke, not ZENITH's smooth fire ribbon); jade droplets flicked off it.
   - **Stitch-hole stars** every 34 px pop as the ball passes (pearl 4-point stars 10-18 px), then hold
     as dots; short **ink cross-stitches** every 68 px; **star-chart ticks** every 5 m (pearl, 1 px),
     numerals every 10 m in the plan views.
   - Width: 18 px in the cut-in, 44 px at the boot in shot 3, 60-90 px over the monument, **75 px at the
     ball in the ride (180 px with halo)**, tapering to 3 px at the boot end. A comet head wraps the
     ball.
2. **The Sky Eye** (shot 6): an almond of light 340 x 150 px, opened to 70 % (lid gap 105 px). Pearl
   rimmed lids on an ink outline; a dark emerald iris field; 24 jade **meridian lines** radiating from
   the ball as iris striations inside the lids and as faint lashes outside (up to 260 px); a ring of
   degree ticks at r 46. **The ball is the pupil.** It is never a disc (the moon is ZENITH's) and it
   only ever looks at the defenders, never at No.10 or the viewer.
3. **The Needle, then the Bowstring** (shots 7-8): the eye's lids squeeze into a narrow vesica at the
   tail (the needle's eye), the stroke tightens into a straight shaft (18 → 10 px, pearl core) and the
   ball is the point: a needle of light 400+ px long. At the header the whole line **snaps straight**
   into the bowstring spear: body 24 px, halo 90 px, pearl core 6 px, 640 px long, a standing wave of
   14 px decaying to 0 in 0.6 s with 3 nodes; the ball runs along it like a bead.
4. **The Harp** (shot 9): the goal mouth (520 x 200 px on screen) with its net lit strand by strand
   from the entry point outward, every strand vibrating like a string, the crossbar and posts singing
   in three ghost positions. The net stretches into a cone; it is **never torn and never moved**.

Small supports (never the subject): the **aurora hem** (at most 160 vertical rays hanging 60-200 px
under the stroke, pearl at the top to jade to emerald to 0, 2 slow sine folds, additive over an ink
under-layer, alpha capped 0.35); stitch-hole stars; the cross-stitch X (20 → 90 px); stitched rings
(MERIDIAN's ring style: a running-stitch dashed ring with needle-hole dots, vesica-squashed on the
turf); **the loom** (shot 2a only: 12 taut threads drawn with the stroke's own `threadLine`, no aura
system); the **plumb line** (shot 5 only: one pearl thread from the ball down to the X). Nothing ever
opens in the turf, and nothing rises off a figure.

**Measured targets** on the 6 fps film (`tools/metrics.py`, 320 x 180): deep shadow 40-50 % (v1 32 %),
hot pixels 3-5 % (v1 3.4 %, all of it paper), saturated light at least 2.5 % (v1 1.0 %), at least 15
violent frame changes (v1 11; this plan has about 28).

## Continuity (all shots)

**Setting and direction**
- Night match under floodlights. Goal to the **right** (+x). Field scale 10 px = 1 m; goal line x 1180,
  far post z 214, near post z 300, crossbar 2.44 m.
- No.10 is right-footed and runs east. Side views are seen from the near (south) touchline, so screen
  direction is **always left to right**; no shot crosses the line.
- His left is the **far side** (low z, screen-left in every east-looking view). His right is the
  **near side** (high z), where No.7 runs.
- **Camera roll is 0 in every shot.** Set `cam.shakeRoll = 0.015` in every `init`.

**The pass, as real football**
- He sells the far side with his eyes and head. Outside of the right boot: the standing foot planted
  wide of the ball and a little behind it; ankle locked, toes down and in; the outside of the boot
  scoops **under** the inside-back of the ball. Clockwise spin seen from above: the ball sets off
  slightly toward the far side, then bends right (near side) behind the line onto No.7.
- No.7 is **onside** at the strike (behind D4, the second-last opponent). He meets the falling ball
  with a **diving header** at 0.9 m, across the keeper into the far top corner.
- The field view (gameplay) flies the same curve with a real 16 m apex (h x 0.62) in 2.6 s. The
  cinematic flies the anime version: 26 m, slow climb, a hang, a slingshot fall.

**Layout v2** (`LAYOUT` in `common.ts`; one table feeds the field scenario, every projection and every
composed shot). Field (x, z, h):

| Key | (x, z, h) | What |
|---|---|---|
| `no10Start` | (700, 268, 0) | No.10 carries in |
| `strike` | (772, 268, 0) | the loft, 41 m from goal, centre-right |
| `d1` | (1004, 222, 0) | far centre-back, stepped up to press |
| `tower` | (1030, 250, 0) | **the Tower**, the set's one big captain (Rivals model, armband, 1.3x the others' bulk; SOLO v2's defender D) |
| `d3` | (1040, 282, 0) | near centre-back |
| `d4` | (1052, 314, 0) | near full-back, the offside line |
| `keeper` | (1168, 258, 0) → (1146, 280, 0) | comes off his line toward the near post as the ball falls |
| `no7Start` | (940, 344, 0) | No.7 on the near touchline |
| `no7Strike` | (994, 336, 0) | No.7 at the strike: **onside** |
| `apex` | (1060, 276, 260) | **26 m**, 3 m beyond the Tower, just under the lamp heads (towers 32 m) |
| `target` | (1122, 296, 9) | the cross-stitch X; the ball meets No.7's forehead at 0.9 m, 5.8 m out |
| `finish` | (1180, 218, 21) | the far top corner, inside the far post |

**The arc** (`ARC` in `common.ts`, the single source for every view):
- Rising limb, u 0 → 0.72 (arc length): quadratic Bezier in (x, h) P0 (772, 0), P1 (910, 260), P2
  (1060, 260). It leaves the boot at 62 deg and flattens into the apex.
- Falling limb, u 0.72 → 1: P2 (1060, 260), P3 (1105, 260), P4 (1122, 9): the slingshot fall, 85 deg at
  the bottom (a needle).
- z(u): Catmull-Rom through (0, 268), (0.25, 262), (0.55, 270), (0.72, 276), (1, 296): sets off toward
  the far side, bends right.
- The ball passes over D1 at u 0.59, the Tower at u 0.655, D3 at u 0.68, D4 at u 0.713. The thread
  over the Tower (u 0.655) is at h 258: the height he leaps to.
- The header line: target → finish, straight (the bowstring).

**Ball u by shot** (keyed on each shot's unwarped clock `t`, slow motion baked into the spacing, so
seek is exact):

| Shot | keys (t: u) |
|---|---|
| 3 | 0.66: 0 · 0.78: 0.05 (leaves the frame) |
| 4 | 0.00: 0.05 · 0.40: 0.12 · 1.00: 0.30 · 1.70: 0.56 · 1.78: 0.59 · 1.94: 0.655 · 2.02: 0.68 · 2.14: 0.713 · 2.40: 0.72 |
| 5 | 0.72 (creeps to 0.721) |
| 6 | 0.00: 0.721 · 0.70: 0.728 · 0.86: 0.734 · **the tug-of-war, never a stop**: its speed eases 100 % → 30 % over 0.86-0.98 (outQuad) and holds at 30 % to 1.20: 0.734 → 0.739 · 1.20 → 1.34: 0.739 → 0.744 · slingshot from 1.34: 0.744 → 0.79 at 2.00 (inQuad) |
| 7 | 0.79 → 0.995 (inQuad) |
| 8 | 0.995 → 1.0 at 0.36; then the spear s 0 → 1 over 0.58-1.70 |

**Three kinds of view, one arc**
- **Side elevations** (shots 3, 8 close; shots 4 and 6b the "ride world"). The close side world draws
  the characters at their art scale (No.10 at 2.4x = 235 px) with the ground line at world y 318. The
  **ride world** (shots 4, 6b) maps the arc as X = (x - 772) x 3, Y = -h x 4 (30 px per m across, 40
  px per m up), with stadium layers in parallax; the ball, stroke head and characters are drawn at art
  scale (ZENITH's convention), keyed separately.
- **Projected views** (2b, 5, 7): `DownPitchView` looking east, with the new **pitch-only `tilt`**
  (radians, + looks down, − looks up as at the end of 2b; `horizon` becomes the principal point's y;
  a shared build item, see the cheat-sheet). Everything (pitch, puppets,
  the X, the arc) is placed with `projectDecal`; the ball is drawn at art scale at its projected point.
- **Composed views** (1, 2a, 6a, 9a, 9b, 9c): screen-space compositions; the stroke is drawn in screen
  space through the listed anchors.

*Geometry note (why `tilt`):* the apex frame needs the ball in the foreground and the defenders almost
straight below it. A level pinhole with a lens shift can only show 20-65 deg below the horizon with
heavy stretch; the defenders sit at 75-85 deg from any camera that sees the ball low in frame. A
pitch-only tilt of the same pinhole is about 6 lines in `projectDecal` (rotate (Z, Y) by the tilt)
and lets `drawDownPitch` draw its projected stripes, box lines, goal and far stand unchanged. The
lens-shift fallback is in Risks.

**Characters**
- Kits: `HERO_KIT` (No.10), `WINGER_KIT` (No.7), `RIVAL_KIT` / `RIVAL_KIT_B` (white defenders; the
  Tower is `RIVAL_KIT` with a captain's armband), `KEEPER_KIT`.
- **No.10 and No.7 are never puppets**: studio frames at integer scale, a box-filtered cache built in
  `prepare()` below 1x, or inside a camera zoom. A fractional scale outside a camera zoom is allowed
  only while the camera moves faster than 600 px/s or under radial blur of 0.05 or more; every hold is
  integer or boxed.
- The Tower (the set's one big captain, the same model as SOLO v2's defender D) uses his studio
  frames in shot 6 and `PuppetCache` puppets elsewhere. Defenders and the keeper are
  puppets. At most 3 live puppet renders per frame.

**Times.** All times are shot-local `t` on the runner's unwarped clock unless marked global.
`warp` rows are `[start, length, rate]` windows for `kit.warp`. Sprite frames are scheduled on `t`.
Use flags for one-time events in `update` (dt is warped).

## Intensity ladder (global)

| Global t | Beat | Size |
|---|---|---|
| 0.30 | needle-eye glint in the cut-in | shing, jade flare |
| 0.74-1.00 | the Meridian Sign lands on No.7's eye; the title slams | pluck E5-A5, twang 0.5 + boom 0.6 |
| 1.22-1.40 | the needle's-eye iris: a push to 2.0 on his pupil, the vesica opens to frame size, the stroke threads through | zip; no flash above 0.25 (the rim glint) |
| 1.70-2.20 | **the loom**: 12 threads shoot from his eyes and fingertips to the lamp heads, the roof rim, the crossbar and No.7; the web is plucked on each tick | boom 0.5, bow D2, plucks D4 F#4 A4 |
| 2.30-3.20 | the look-off; the four defenders swivel; the star chart draws over them; the crane-and-tilt up the chart to its 26 M tick | ticks, pluck D5, rising bow D4 → D5 |
| 3.44-3.70 | **the breath**: the wide plant, head turned away, rate 0.3, crowd ducked | one tick |
| **3.70** | **LOFT**: Stack A, the halftone print, the flat stitched ring at the plant | kick 1.2 + boom 1.2 + crack 0.8 + twang 0.7 + pluck D3 |
| 4.05-4.65 | **the monument** under the rising arc; the wink at 4.82 | bow swells, shing |
| 5.10-7.50 | **the Meridian Ride**: catch, pylon whip, lamp heads catching the arc's jade, rate 0.45 over the line, the line looking up in fear | bow A3 → A4, plucks E5 F#5 A5 B5 |
| 7.40-7.50 | mint whiteout out of the ball's core | F3, F4 |
| **7.62-8.72** | **the apex hang**: rate 0.06 for 1.10 s, crowd ducked to 0.15, held bowed D6, 26 M | near silence, 3 slow ticks |
| 8.95 | **the Sky Eye opens** | `eyeOpen` bell |
| 9.60-10.06 | the Tower leaps and grabs the thread: the tug-of-war (the ball never stops); the strum insert | strain, fray, OHHH |
| **10.10** | **TWANG**: Stack B, a full-frame standing wave, the Tower flung | twang 1.3 + boom 1.3 + crack 0.8, roar |
| 10.90-12.10 | the needle falls; ticks accelerate | falling bow, whoosh |
| 12.32-12.46 | the reel-in: the whole line's light pours into the ball | reel zip |
| **12.46** | **FLYING HEADER**: Stack C (the biggest), the bowstring snaps straight | kick 1.4 + boom 1.4 + crack 1.0 + twang 1.0 + D-major strum + D6 |
| 13.32 | **the keeper lashed and spun down onto the turf** | twang 0.9 + pluck A2 + crack 1.0 + boom 0.9 |
| **13.84** | **THE HARP**: the net lights and rings, pearl flash | boom 1.3 + kick 1.0 + harp glissando |
| 14.10 | GOAL! 124 px, colour returns | crowd 3.0 + roar 1.6 + stinger |
| 14.90-16.00 | the bridge under the arc; the spark runs fingertip to fingertip at 15.50 | strum, pluck D6 |
| 16.10-16.80 | diptych, name card, fade | |

The pattern is **hush, then a string strike**, three times: the plant breath before the loft, the
apex hang before the TWANG, the needle fall before the header. Each release is bigger than the last,
and the loudest moment is the harp and GOAL!.

## Shots (durations are fixed: do not change them)

| # | File / export | `name` | Dur | Seed | Global |
|---|---|---|---|---|---|
| 1 | `shot1_sign.ts` / `shotSign` | Meridian Sign | 1.4 | 411 | 0.0-1.4 |
| 2 | `shot2_loom.ts` / `shotLoom` | The Loom | 1.8 | 412 | 1.4-3.2 |
| 3 | `shot3_loft.ts` / `shotLoft` | Outside Loft | 1.9 | 413 | 3.2-5.1 |
| 4 | `shot4_ride.ts` / `shotRide` | Meridian Ride | 2.4 | 414 | 5.1-7.5 |
| 5 | `shot5_apex.ts` / `shotApex` | Apex | 1.4 | 415 | 7.5-8.9 |
| 6 | `shot6_twang.ts` / `shotTwang` | Sky Eye | 2.0 | 416 | 8.9-10.9 |
| 7 | `shot7_fall.ts` / `shotNeedleFall` | Needle Fall | 1.2 | 417 | 10.9-12.1 |
| 8 | `shot8_header.ts` / `shotHeader` | Flying Header | 1.7 | 418 | 12.1-13.8 |
| 9 | `shot9_harp.ts` / `shotHarp` | Harp Net | 3.0 | 419 | 13.8-16.8 |

Total **16.8 s**. `index.ts` exports `meridianThread = [shotSign, shotLoom, shotLoft, shotRide,
shotApex, shotTwang, shotNeedleFall, shotHeader, shotHarp]`.

| # | What happens | Cut into the next shot |
|---|---|---|
| 1 | Two slanted panels on a black page: No.10 makes the Meridian Sign; his fingertip draws the arc out of his panel and onto No.7's eye; the title is stitched along it | **the needle's-eye iris**: a push to 2.0 on his needle pupil, its vesica opens to frame size and the stroke threads through (no flash above 0.25) |
| 2 | 2a chest-up front bust: Night Ink falls, **the loom** (threads from his eyes and fingertips pin the stadium), chin up to the sky, the decision. 2b over the shoulder: the look-off, four defenders swivel, the star chart draws over them, the camera cranes and tilts up the chart to its 26 M tick | **smash cut on the tick** |
| 3 | Run-up, the breath, the no-look loft (Stack A), the monument under the rising arc, the wink | **whip-tilt up** (motion cut) |
| 4 | The ball showcase: wide, chase-crane catch past a pylon, the ride, rate 0.45 over the line, four plucks | **mint whiteout out of the ball's core** |
| 5 | The apex hang: look-down past a 60 px ball at the whole box, the world frozen, 26 M | **hard cut, reverse angle**, on the swell |
| 6 | Worm's-eye: the Sky Eye opens; the Tower's face; side at apex height: leap, grab, the tug-of-war, the strum insert, TWANG, the Tower flung | **whip-tilt down** (motion cut) |
| 7 | Falling with the needle: the eye closes into the needle, the X grows, No.7 and the keeper converge | **motion cut on No.7's push-off** |
| 8 | The flying header: the reel-in, Stack C, the bowstring, the bead, the keeper lashed and spun down onto the turf | **motion cut** as the ball touches the net |
| 9 | 9a the harp and GOAL!; 9b the bridge; 9c the diptych and the name card | fade to [8,4,14] |

### 1 · Meridian Sign (cut-in, 1.4 s) [0.0-1.4]

**Job:** the declaration. Before we know the move, the hero tells his friend (and us) to watch. It
plants the three images the film pays off: the needle eyes, the arc, the thread between friends. The
film teaches the gesture before it shows the pass, as CRESCENT plants its roll in its cut-in.

**Layout** (screen space)
- Background: a **black ink page** (v1's paper, inverted). A radial burst from the arc's apex point
  (320, 34): [2,12,9] at the edges to [20,90,60] at the centre, 24 emerald wedges turning at 0.4
  rad/s; two layers of focus lines (90 ink, 40 with jade tips) rotating 0.1 rad/s; jade speed
  streaks at -18 deg (v1's angle, alpha 0.5); screentone in the corners; jade motes (`PK.Glow`
  `'jade'`, 2 per frame) rising.
- **Panel A** (left, 360 x 320, centred (200, 190), slanted -3 deg, 4 px ink border, 6 px paper
  gutter): No.10 front chest-up, **MeridianSign** frames at 3x (head top near y 50).
- **Panel B** (top right, 250 x 130, centred (500, 110), slanted +4 deg): **No.7's eyes** at 5x, a crop
  of his hand-drawn front head (neutral, then grin).

**Camera keys**

| t | value | ease |
|---|---|---|
| 0.00 → 1.22 | zoom 1.00 → 1.06 about (320, 180) | outSine |
| 0.10 | `cam.hit(0.25)`, shakeAmp 10 | |
| 0.16 | punch +0.04 (0.05 in, 0.20 out) | |
| 1.00 | `cam.hit(0.3)` on the title slam | |
| 1.22 → 1.40 | **the needle's-eye iris**: push `zoomAbout(his right needle pupil (MS4 `eye` anchor), 320, 180)`, 1.06 → 2.0 | inOutCubic |

**Beats**
- **0.00-0.16** both panels slam in from opposite corners (outExpo); MS1 already up.
- **0.16 MS1**: his right index finger taps just under his right eye. **0.20-0.30** his pupils narrow
  into **needle eyes** (`needlePupil` overlay: jade vesica pupils, a pearl glint). **0.30** sparkle on
  the eye and a `lensFlare` (size 140, `JADE_FLARE`).
- **0.40 MS3**: the arm sweeps up and over. His `fingertip` anchor draws **the Meridian** (18 px body,
  44 px halo) from his eye up out of panel A, over the top of the frame (apex y 34) and down into
  panel B, landing on No.7's left eye at 0.74 (outCubic, 0.34 s). It is drawn after the panels,
  unclipped: the power ignores the page borders.
- **0.74 MS4**: the point, chin up, grin. In panel B a pearl stitch pierces where the stroke lands;
  No.7's pupils glint (`needlePupil` glint only, no needle shape: the needle eyes are No.10's) and
  at 0.84 his eyes narrow into a grin (front head grin frame): the promise is answered.
- **0.62-1.00 the title**: a pearl needle (`needlePoint`) rides the stroke and stitches
  **MERIDIAN THREAD** (64 px, `TITLE_STYLE`: pearl fill, jade stroke, ink outer) along the chord under
  the arc, one letter per 0.027 s. **1.00** the letters lock: slam (scale 1.4 → 1.0, outBack), 24 jade
  sparks off the title, a small shock under it (s 0.02). Tag `SPECIAL PASS · No.10 > No.7` (pixel font
  12 px, pearl) types in under it.
- **1.05 MS4b** (blink grin).
- **1.00-1.22 the stroke breathes**: the **pluck warp debuts** along the stroke (amp 0.010 UV ≈ 4 px,
  N 2, 9 Hz, decay 0.4 s, width 0.05): the picture bends along the line. It teaches the TWANG's
  language.
- **1.22-1.40 exit: the needle's eye.** The camera pushes to 2.0 on his right needle pupil while its
  jade vesica opens to frame size as an iris (`needleIris`, 1.26-1.40, outCubic: the vertical vesica
  grows from 6 x 2 px until it covers the frame, a 6 px jade rim with a pearl glint running round it).
  Inside the vesica is 2a's opening frame (a still of the GZ3 bust on the loom backdrop, cached in
  `prepare()`), so the eye opens onto shot 2. At 1.28-1.40 the Meridian's pearl thread core runs into
  the vesica's centre like a thread through a needle and on into shot 2. No flash above 0.25 (the rim
  glint), so this cut costs nothing from the flash budget.

**VFX:** black page burst, 2 focus-line layers, speed streaks, motes, needle pupils, flare, the
Meridian (18/44 px, bristles, droplets), stitched title, title sparks + shock, pluck warp, CA 0.006
on the slam, the needle's-eye iris (vesica rim, travelling glint, the 2a still inside), the thread
running through it.

**Rate:** 1 throughout.

| t | sound |
|---|---|
| 0.00 | `bow(146.83, 1.4, 0.22)` (a low D3 swell) + `crowd(1.4, 0.1)` |
| 0.10 | `kick(0.4)` + `boom(0.4)` (the panel slam) |
| 0.30 | `tick()` + `shing(1.2)` |
| 0.40 | `whoosh(0.34, 400, 2400, 0.4)` (the sweep) |
| 0.62-0.98 | `tick(0.2)` on every second letter (7 ticks) |
| 0.74 | `pluck(659.26)` (E5) |
| 0.84 | `pluck(880)` (A5): the two-note promise |
| 1.00 | **`twang(0.5)` + `boom(0.6)` + `strum([293.66, 369.99, 440, 587.33], 0.02)`**: the signature's debut |
| 1.24 | `zip(0.16, 600, 5000, 0.4)` (the thread through the needle's eye) |

**Cut:** the needle's-eye iris (the vesica opens onto 2a, the thread runs through it); flash at most
0.25. Not a budget event.

**Motion:** MeridianSign MS1 0.00 · MS3 0.40 · MS4 0.74 · MS4b 1.05 (MS2 at 0.30, if drawn); No.7
front head neutral 0.00 → grin 0.84 (crop at 5x).

### 2 · The Loom (1.8 s) [1.4-3.2]

**Job:** the power-up and the read. First the hero strings the whole stadium like a loom, his eyes on
the sky; then the clever part kids love: he looks one way and the whole defence follows his eyes,
while the real plan draws itself over their heads. (MERIDIAN's monument is LF4 under the rising arc in
shot 3, not here.)

#### 2a · The loom (0.00-0.90)

**Framing** (composed): front, **chest-up**, lens level with his chest (no low angle, no ground strip,
no ZENITH backdrop). No.10 as a **GazeFront bust at ×3** (the bust convention in Studio art: head about
120 px), `chest` anchor (sternum) at (320, 200), head top near y 30, the frame cutting at the belt.
Behind him the west end of the bowl in Night Ink: the roof rim as a dark band across the top of the
frame, two floodlight towers whose lamp heads sit in the upper corners (about (80, 40) and (560, 34)),
the stand as screentone. The goal he attacks and No.7 are behind the camera.

| t | camera | ease |
|---|---|---|
| 0.00 → 0.90 | zoom 1.00 → 1.10 about his chest (320, 200) | inOutSine |
| 0.00 → 0.90 | `holdTrauma` floor 0.20 → 0.40, shakeAmp 8 | |
| 0.30 | `cam.hit(0.35)` (the loom shoots) | |
| 0.42 / 0.57 / 0.72 | `punch` +0.02 on each tick (0.03 in, 0.12 out) | |

**Beats**
- **0.00 GZ3**: head down, eyes on the ball below the frame, hands down out of frame. It opens inside
  shot 1's iris: the vesica's jade rim slides off the frame edges in 0.08 s, and the thread that came
  through the needle's eye runs on over his head.
- **0.00-0.25 the ink falls**: Night Ink bleeds in from the frame edges like ink dropped in water
  (`nightInk` 0 → 0.85 through a soft blot mask growing from the edges). He stays in colour.
- **0.30 GZ2 and THE LOOM** (money image): chin up, eyes to the sky, both hands raised at chest height
  out to the sides, fingers curled as if each one holds a string (a puppeteer's hands). In 0.10 s
  (outExpo) **12 taut jade threads** shoot out of him and pin themselves, each with a pearl
  stitch-star, to the stadium:
  - from his eyes: the four lamp heads of the two towers (left eye to the left pair, right eye to the
    right pair);
  - from his fingertips: six pins along the roof rim (three per hand);
  - from his eyes, at the lens: two threads that widen 2 → 8 px as they leave the bottom corners of the
    frame, one to the crossbar of the goal he attacks and one to No.7 (both behind us; their pins are
    seen in 2b).

  Together they make a string web over the stadium with him at its centre. Each thread is
  `meridianStroke` in its thin preset (ink under-stroke 4 px, emerald halo 8 px, jade body 2 px, the
  `threadLine` pearl core 1 px), straight and taut: no tendrils, no rising aura, no ground pool, no
  focus lines, nothing lifting off the turf. A 1 px jade rim lights his edges only where the threads
  leave him (eyes, fingertips); the lamp heads take the jade tint where the threads pin them.
- **0.42 / 0.57 / 0.72 the web is plucked on each tick** (his inner clock): one thread per tick takes
  the shader pluck warp (amp 0.008 UV, N 2, 9 Hz, decay 0.3 s, width 0.04: the picture bends along it)
  while the whole web shivers 2 px in canvas (`meridianStroke` `pluck`), each with a soft note.
- **0.42-0.80** GZ2 ⇄ GZ2b every 0.15 s: his fingers flex on the strings, his hair lifts.
- **0.80 GZ3**: eyes snap down to the ball, a 2 px crouch, the hands drop: the decision, on a hard
  tick. Ten threads let go of him and fade on their pins in 0.10 s; the two to the crossbar and No.7
  stay.
- **0.90** hard cut to 2b.

#### 2b · The read (0.90-1.80)

**Framing:** over-the-shoulder back view (v1's view). `DownPitchView` eye (726, 286, h 16), f 560,
horizon 120, cx 300, tilt 0. No.10 from the **Scan** back frames at 2.4x, bottom-left, cropped at
mid-calf; the ball at his right foot. Thirty metres ahead the line: D1, the Tower (1.3x), D3, D4 as
cached puppets at their projected scale (18-26 px); No.7 tiny at screen-right on the near side (Run
boxed 0.4x).

| t | camera | ease |
|---|---|---|
| 0.90 → 1.45 | eye x 726 → 716 (a slow push), handheld 0.04 | inOutSine |
| **1.45 → 1.78** | **the climb: crane and tilt up the star chart** from the defenders to its apex: eye (716, 286, h 16) → (716, 286, **h 30**), tilt 0 → **−0.30** (17 deg up, toward the sky), horizon (principal point) 120 → **227** (the lens shift), **f held at 560** (no zoom, so it never reads as a pull-out); No.10's sprite slides down 220 px with the ground and leaves the bottom-left by about 1.66 (S3 at 1.62 is his last frame in view) | inOutCubic, 0.33 s |
| 1.78 | hard stop on the `26 M` apex tick; `cam.hit(0.25)` | |

The climb, computed with the tilt formula (screen y of the line's heads / the apex): 1.45 (start) the
line at y ~108-117 and the apex at -277, far above the frame; halfway the line at y ~258-268, the apex
at -99; the heads leave the bottom edge at about 1.67. **Target picture at 1.78**: the top of the star
chart, the rising limb climbing in from the bottom-left to the apex at (286, 60) with the `26 M` tick
beside it, the falling limb dropping out of the bottom edge toward the X; below the apex the far
stand's roofline at y ~193 and a lamp head at (219, 115), screentone sky above them. The defenders,
the X and No.10 have all slid out below the frame: we have climbed the plan from the line to its
peak.

**Beats**
- **0.90-1.20 the look-off** (Scan S1 → S2a, head to screen-left, the far side): sightline dashes tick
  from his head toward the far side; **all four defenders swivel** their heads and shoulders after his
  look and lean that way (two cached poses each, swapped at 1.02 with ink swish marks); the Tower
  leans hardest. S2b at 1.10 (the hold breathes).
- **0.90-1.20 the two forward threads**: from his head the loom's last two threads still run ahead over
  the defence, pinned with pearl stitch-stars on the crossbar (far, centre) and on No.7's shoulder
  (screen-right; he glances up at it): his eyes go one way, his threads the other. They fade 1.10-1.20
  as the star chart takes over.
- **1.15-1.45 the star chart**: a dotted jade arc draws from his boot up over the whole defence
  (`starChart` on the projected `ARC`; it leaves the top of the frame, then the climb brings its
  apex inside) and down to a pulsing **cross-stitch X** (24 px) beyond the line on the near side.
  Pearl degree ticks every 5 m, 6 px numerals every 10 m, `26 M` at the apex. 2 px line, 14 px
  emerald halo.
- **1.45-1.78 the climb**: the camera cranes up and tilts toward the sky along the drawn chart, from
  the defenders' heads (which slide out below the frame at about 1.67) up its pearl 5 m ticks (the
  `10 M` and `20 M` numerals passing) to the apex: MERIDIAN's vertical language, no pull-out and no
  zoom. **1.62 S3**, his last stride before the plant (head
  still to the far side, right toe turned in: the outside-of-the-boot set), slides down out of the
  bottom-left as the camera rises.
- **1.78** the `26 M` apex tick lands top-centre on a hard tick: the tick mark glints pearl (a local
  8 px glint, not a flash) and the smash cut fires on it.

**Rate:** warp `[[0.92, 0.50, 0.45]]` (the read in slow motion), else 1.

| t | sound |
|---|---|
| 0.00 | `crowd(1.8, 0.4)` + `duck(0.3, 1.5)` |
| 0.05 | `rumble(1.2, 0.35)` (the ink falls) |
| 0.30 | `boom(0.5)` + `bow(73.42, 1.5, 0.3, 110)` (a D2 drone swelling to A2) + `zip(0.12, 400, 3000)` (the loom shoots) |
| 0.42 / 0.57 / 0.72 | `tick()` + `pluck(293.66 / 369.99 / 440, 0.8, 0.3)` (D4, F#4, A4: the web plucked on each tick) |
| 0.80 | `tick(0.6)` (the decision) |
| 0.92 / 1.06 / 1.20 | `tick()` (his inner clock, one per glance) |
| 1.02 | `whoosh(0.15, 2000, 600, 0.2)` (the swivel) |
| 1.42 | `pluck(587.33, 0.8, 0.4)` (D5) as the X locks |
| 1.45 | `bow(293.66, 0.33, 0.2, 587.33)` (a bowed D4 → D5 climbing with the camera) + `whoosh(0.33, 400, 2400, 0.3)` (rising) |
| 1.78 | `tick(0.7)` (hard) |

**Cut:** smash cut on the tick into shot 3's running stride. No flash.

**Motion:** GazeFront busts GZ3 0.00 · GZ2 0.30 · GZ2b/GZ2 every 0.15 s from 0.42 · GZ3 0.80; Scan S1 0.90 · S2a 0.98 · S2b 1.10 · S2a 1.30 · S3 1.62; No.7 Run
boxed 0.4x.

### 3 · Outside Loft (1.9 s) [3.2-5.1], contact at 0.50 [3.70]

**Job:** the trick, the first BOOM, then the pose kids remember, then the wink.

**Framing:** close side view from the near touchline, lens at hip height, ground line at world y 318;
the stands loom with the floodlight row in the top band; No.10 at **2.4x (235 px)**.

| t | camera (world x, y; zoom) | ease |
|---|---|---|
| 0.00 → 0.50 | x = pelvis x + 40 (locks at the plant x at 0.22), y 200; zoom 1.00 → 1.12 | inQuad |
| 0.50 | **punch +0.16** (0.05 s in inExpo, 0.30 s out outCubic); `cam.hit(0.9)`, shakeAmp 18 | |
| 0.66 → 0.85 | y 200 → 180 following the ball's exit | outCubic |
| 0.85 → 1.25 | **the monument move**: y 180 → 150, zoom 1.12 → 1.00; the stand layer slides down 40 px (parallax 0.4) so the stands loom and the lamp row fills the top band | outCubic |
| 1.25 → 1.45 | push 1.00 → 1.02 | linear |
| 1.45 → 1.59 | **crash punch-in** `zoomAbout(his head, 320, 160)`, 1.02 → 3.0 (the LF4b → T8a swap hides in it) | inExpo |
| 1.59 → 1.78 | 3.0 → 3.1 | linear |
| 1.78 → 1.90 | **whip-tilt up**: y -200 world (600 screen px), `fx.streak` 0.10 along (0, -1) (no hole: the ball has left the frame) | inCubic |

**Frames:** Approach AP1 0.00 · AP3 0.10 (the bound) · **LF1 0.22** (wide plant, head away; held
through the breath) · Trivela T5 0.46 (the swing) · **LF2 0.50** (contact, held through the
hit-stop) · LF3 0.66 (smear) · **LF4 0.72** · LF4b / LF4 every 0.2 s to 1.45 · T8a 1.52 · **T8b 1.62**
(the wink) held to 1.90.

**Beats**
- **0.00-0.22** last strides; the ball rolls a foot ahead; his head is already turned up-screen to
  the far side (we see the hair mop and the ear, never his eyes on the ball). Ink speed streaks.
- **0.22-0.46 the breath** (rate 0.3): the wide plant; crowd ducked; one tick. The **"eyes here, ball
  there"** inset (180 x 100, top-left, -4 deg, ink border, paper gutter) slams in at 0.26: GlanceFace
  G2 crop at 4x, a jade `<` over his eyes looking away, and in the main frame a jade `>` pointing at
  the ball; caption `OUTSIDE OF THE BOOT` (pixel font 8 px). It leaves at 0.70.
- **0.50 CONTACT: Stack A** (see the stacks table). The outside of the right boot scoops under the
  inside-back of the ball. The ball squashes along the boot normal (sx 0.7, sy 1.25): r6 D2.4 at zoom
  1.28 = **37 px**, two jade spin marks.
- **0.50-0.70 the ground beat** is Stack A's flat stitched ring at the plant (a running-stitch ring on
  the turf, 10 → 160 px, squash 0.35, needle-hole dots). Nothing opens in the turf and no grass is
  pulled up (light gashes and torn turf are SOLO's).
- **0.66 release**: the ball rockets up-right at 62 deg (screen vy -1700 px/s) and leaves the frame at
  0.78. **The Meridian bursts out of the boot** (44 px at the root, bristles, 40 droplets) and climbs
  out of the top-right corner.
- **0.85-1.45 THE MONUMENT** (money shot 1): LF4, the high follow-through (kicking leg up across his
  body at shoulder height, sole to camera, arms wide, head still turned away). The stroke rises behind
  his boot and arcs across the whole top of the frame like a jade rainbow (60-90 px body, 180 px halo),
  exiting top-right. The lamp heads in the top band catch its jade light as it nears them and keep it
  while it passes (`lampTintFor`, a smooth function of distance; one `JADE_FLARE` of at most 120 px on
  the nearest head; no switching, no ticks). Jade rim light from above on his edges; jade motes rising
  (3 per frame). Far behind him, the four small defenders (cached puppets 0.4x, `craneUp`) tip their
  heads back.
- **1.52 T8a**: three-quarter to camera, smirk. **1.62 T8b: the wink**: a 14 px pearl sparkle on the
  open eye, a 120 px `JADE_FLARE`; the risen stroke glows behind his head.
- **1.78** the whip-tilt up follows the stroke out of the top of the frame.

**VFX:** Stack A (its flat stitched ring at the plant is the ground beat), the inset panel, the stroke
burst and the rainbow, lamp heads catching jade, rim light, motes, the wink sparkle, speed streaks on
the run, the streak on the whip-tilt.

**Rate:** warp `[[0.24, 0.20, 0.30], [0.50, 0.16, 0.03], [0.66, 0.14, 0.30], [1.45, 0.45, 0.60]]`.

| t | sound |
|---|---|
| 0.02 / 0.12 | `scuff(0.2)` (footsteps) |
| 0.22 | `kick(0.2)` + `crack(0.15)` (the plant) + `duck(0.3, 0.3)` |
| 0.26 | `tick(0.5)` + `shing(0.8)` (the inset) |
| 0.44 | `whoosh(0.15, 300, 1800, 0.4)` (the swing) |
| **0.50** | **`kick(1.2)` + `boom(1.2)` + `crack(0.8)` + `twang(0.7)` + `pluck(146.83, 2.5, 0.6)`** (the low D3 root) |
| 0.66 | `zip(0.5, 600, 4000)` + `whoosh(0.9, 300, 3000, 0.5)` rising with the ball |
| 0.85 | `bow(146.83, 1.6, 0.3, 220)` (the arc starts to sing, D3 → A3) + `crowd(2.0, 0.45)` + `ooh(0.45)` |
| 1.62 | `shing(1.4)` + `pluck(880)` (A5) on the wink |
| 1.78 | `whoosh(0.2, 800, 4000, 0.35)` (the whip-tilt) |

**Cut:** whip-tilt up, a motion cut into shot 4 (which opens with the same upward blur decaying).
**[F1, F2 at global 3.70 and 3.76]**

### 4 · Meridian Ride (2.4 s) [5.1-7.5]: THE BALL SHOWCASE

**Job:** wonder. The ball is the star, big and glowing and high; the camera catches it and flies with
it up the arc, over the whole defence, toward the top.

**The ride world** (side elevation; X = (x - 772) x 3, Y = -h x 4). Parallax layers, back to front: the
**screentone ink sky** (0.08; [4,17,12] → [10,42,30], no stars, no moon, no clouds); the far stand
roofline with its floodlight lamp heads (0.35; each head's jade tint follows its distance to the ball,
`lampTintFor`); **the pitch far below** (0.35, a strip pre-rendered in `prepare()` from the 2.5D field view at
0.35 scale, along the bottom 90 px, with the back four as 24 px cached puppets placed so each one
passes under the ball when the ball's x does); the near-stand roof edge (0.7); the stroke, hem and
ball (1.0); **one foreground floodlight pylon** (1.4, placed so it crosses the frame 0.70-0.90).

| t | camera (ride world; zoom) | ease |
|---|---|---|
| 0.00 | (312, -187), zoom 0.80: No.10 (LF4 boxed 0.4x, 40 px) at screen (70, 330), the ball a 12 px pearl head at (85, 282) | |
| 0.00 → 0.40 | (312, -187) → (318, -215), zoom 0.80 → 0.86; `fx.streak` 0.10 → 0 along (0, -1), hole on the ball (R 0.08) (the whip carries in) | outSine |
| **0.40 → 1.00** | **the catch**: a chase-crane from the free key into the lock `zoomAbout(ball, 392, 176)`, zoom 0.86 → 1.50 (about 400 world px straight up) | inOutCubic |
| 1.00 → 2.22 | **the ride**: lock eases (392, 176) → (330, 168), zoom 1.50 → 1.36 (about 470 px right and 350 px up in the ride world, ≈ 840 screen px with the parallax); flight tremor `holdTrauma` 0.15, shakeAmp 6 | inOutSine |
| 0.70 | `cam.hit(0.35)` (the pylon) | |
| **2.22 → 2.40** | **snap into the core**: lock (330, 168) → (320, 212), zoom 1.36 → 3.4 | inExpo |

**Ball and shape scale** (the depth cheat: the ball and the stroke head are nearer the lens than the
stadium): ball `drawBall(r12 spin, D, 'pearl', glow 1.2, seamGlow 0.8)` with D 0.6 → 2.0 over the
catch (inOutCubic), so **12 px → 72 px**, then 72 → 65 px through the ride; the stroke head body
20 → 75 px with it.

**Beats**
- **0.00-0.40 wide reveal**: the arc climbs out of No.10's boot over the stadium; the hem starts to
  unfurl under it.
- **0.40-1.00 the catch**: the camera rushes up after the ball. **0.70-0.90 the near pylon whips past
  the foreground** (an ink silhouette with an 8 x 4 lamp grid), `fx.streak` 0.06 along (1, 0) with the
  hole on the ball (R 0.10); **its lamp grid catches the stroke's jade light as the stroke sweeps
  past**, brightest on the rows nearest the ball (`drawPylon` row tints from `lampTintFor`: smooth, no
  switching, no ticks), one `JADE_FLARE` of at most 120 px on the nearest row.
- **1.00-1.70 the ride**: the ball at 72-65 px, its truncated-icosahedron panels turning (backspin
  6 rev/s plus sidespin), **seams glowing jade**, a pearl core glow, two ink spin marks, pearl motes
  shedding (40/s). Behind it the Meridian: 75 px body, 180 px halo, tapering to 3 px at the boot end
  far back-left; stitch-hole stars pop behind the ball about 5 per second; star-chart ticks. Under it
  **the aurora hem** (up to 160 rays, 60-200 px) whose light falls on the pitch far below. Ink wind
  streaks (30-60 px) rush down-left; jade motes peel off the stroke.
- **1.70-2.22 over the line (rate 0.45)**: far below, the back four pass under the ball one by one,
  and each one is **afraid**: as the ball crosses him his head tips right back (`craneUp`), his mouth
  hangs open and his face is under-lit jade by the hem, with one rising pluck each (D1 1.78, the
  Tower 1.94, D3 2.02, D4 2.14). No lettering over their heads. **The Tower alone bends his knees,
  eyes locked on the ball**: the only one who is not afraid (the villain is planted).
- **2.22-2.40** the ball slows into the apex; the camera snaps into its pearl core; the frame fills
  with mint light out of the ball's jade core.

**VFX:** the 48-72 px seam-glowing ball, spin marks, motes, the Meridian (75/180 px) with stars,
ticks, bristles and cross-stitches, the hem, the pylon wipe (streak with a hole on the ball), lamp
heads catching jade (flares ≤ 120 px), wind streaks, the four fear faces (`craneUp`, under-lit by the
hem), radial 0.03 on the ball, CA 0.004, bloom 1.1, `nightInk` 0.85 with the stroke band restored, the
mint whiteout.

**Rate:** warp `[[1.70, 0.05, 0.70], [1.75, 0.47, 0.45], [2.22, 0.18, 0.70]]`, else 1.

| t | sound |
|---|---|
| 0.00 | `whoosh(2.4, 500, 1400, 0.35)` (the long wind) + `bow(220, 2.3, 0.3, 440)` (the arc sings, A3 → A4 with height) |
| 0.70 | `boom(0.5)` + `whoosh(0.25, 300, 2000, 0.5)` (the pylon) |
| 1.10 | `crowd(1.6, 0.6)` + `ooh(0.5)` far below |
| 1.78 / 1.94 / 2.02 / 2.14 | **`pluck` E5 659.26, F#5 739.99, A5 880, B5 987.77** (one per defender passed) |
| 2.22 | `shing(1.6)` |
| 2.32 | `duck(0.15, 1.4)` (the swell cuts toward near silence) |

**Cut:** a **mint whiteout out of the ball's core**: a canvas radial grows from the ball (jade
[47,224,138] at its rim, mint at its centre) while `fx.flash` rises 0 → 0.85 over 2.30-2.38 with
`fx.flashColor` mint [191,255,224], held to 2.40; `fx.fullFrame` from 2.33 (as the flash passes 0.3).
Shot 5 clears it outward from the ball. **[F3, F4 at global 7.43, peak 7.48]**

### 5 · Apex (1.4 s) [7.5-8.9]: the breath

**Job:** the held breath at the exact middle of the film. Height you can feel: we hang beside a 60 px
ball and look down past it at the whole box laid out like a map, the world frozen, a number climbing.

**View:** `DownPitchView` eye (990, 276, h 380), **tilt 58 deg (1.012 rad)**, f 300, horizon
(principal point) 180, cx 320. Projected picture (computed):
- the ball (art scale, r12 D2.5 = **60 px**) at screen **(320, 189)**;
- the cross-stitch X at (336, 248), just below the ball: the ball hangs over its destination;
- the goal line at y ~209 behind the ball, the far stand at y ~85 with its crowd above it to the
  frame's top edge; the true horizon sits about 300 px above the frame, so **no sky is in view** (the
  eye at h 380 is above the 32 m lamp heads only because it looks steeply down: Risk 3);
- D4 (354, 306), the Tower (296, 327), D1 (268, 352) in the bottom band, about 17 px tall, faces up;
- No.7 frozen mid-stride at (357, 299), face up;
- the keeper a step off his line, looking up;
- the stroke rising into the frame from the bottom edge (it comes from No.10, behind the camera) up
  to the ball; **the plumb line**: a single pearl thread hanging from the ball down to the X (the
  plan; on screen nearly vertical, (320, 189) → (336, 248)).

| t | camera | ease |
|---|---|---|
| 0.00 → 0.12 | the mint white clears outward from the ball: a mint overlay with a hole growing r 0 → 700 px (a jade rim on the hole's edge); `fx.fullFrame` held, the same event as F3/F4 | outCubic |
| 0.12 → 1.22 | f 300 → 318 (a 6 % push), cx 320 → 314 (a slow drift); `holdTrauma` 0.10, shakeAmp 4 | inOutSine |
| 1.22 → 1.40 | f 318 → 330 | inQuad |

**Beats** (the world is frozen; effects run on the real clock `t`)
- **0.12-1.22 THE HANG** (rate 0.06): the ball's spin slowed to a crawl (its panels readable); the
  stroke hums in a standing wave (pluck warp N 3, amp 0.004 UV, 6 Hz, width 0.04, along the stroke);
  the hem folds drift at 0.2x; crowd camera flashes pop in extreme slow motion, one at a time (each
  lasts 1.2 s, never in unison).
- **The plumb line**: one pearl thread (1 px core, 6 px jade halo, v1's `threadLine`) hangs from the
  ball down to the X and sways 1 px with the stroke's hum, like a plumb bob over its mark. The ball's
  light falls only in the restored pool under it; every figure's ink shadow points away from the
  ball's ground point (alpha 0.35, short). No shafts, no rays, no beams.
- **0.30-0.80 the readout**: `26 M` ticks up from `00` beside the ball (pearl, pixel font 16 px, a
  jade bracket and a 1 px leader line to the apex tick).
- **1.22-1.40** time stirs (rate 0.06 → 0.3): heads twitch; the Tower sinks lower into his jump load.

**VFX:** the mint clear, the 60 px ball (panels, seam glow 1.0), the stroke with stars and the
humming standing wave, the plumb line, the X pulsing (20 → 28 px), short ink shadows, slow camera
flashes, the readout, `nightInk` 0.90 with the pool under the ball restored, bloom 1.15, vignette
0.65. No lamp flares: the lamp heads are below the lens.

**Rate:** warp `[[0.02, 0.10, 0.30], [0.12, 1.10, 0.06], [1.22, 0.18, 0.30]]`.

| t | sound |
|---|---|
| 0.00 | `duck(0.15, 1.3)`: the crowd almost gone, never total silence |
| 0.12 | **`bow(1174.66, 1.3, 0.16, undefined, 6)`**: the held D6 with tremolo, the string at its peak (MERIDIAN's breath; not `timeStop`) |
| 0.30 / 0.66 / 1.02 | `tick(0.5)`: the inner clock, slowed |
| 0.45 / 0.70 | `blip(1318.5)` (quiet, the readout) |
| 1.20 | `whoosh(0.2, 200, 1200, 0.3)` (a swell from below) |

**Cut:** hard cut on the swell to the **reverse angle** (from looking down to looking up). No flash.

### 6 · Sky Eye (2.0 s) [8.9-10.9], TWANG at 1.20 [10.10]

**Job:** awe, fear, a villain who almost wins, and the smallest gesture in the film beating the
biggest player in the film. The TWANG is the laugh-and-cheer beat.

#### 6a · The eye opens (0.00-0.70)

**Framing** (composed, `upView` backdrop): a worm's-eye from among the defenders, over **the Tower's
shoulder**. Bottom-left 40 %: his head and shoulders from behind-below (**TC1** at 3x as an ink
silhouette with a jade rim from above, trembling 1 px); bottom-right: the heads of D3 and D4 (cached
puppet crops as silhouettes). Above: the emerald-black screentone sky; the stadium roof rim as dark
wedges in the top corners; two floodlight towers leaning in toward the top (perspective), their lamp
heads tinted jade by the nearby arc; **the Meridian** crossing the sky from the bottom-left corner up to **the ball at
(320, 96)** (art scale r6 D2.5, 30 px), barely creeping, its spin still turning.

| t | camera | ease |
|---|---|---|
| 0.00 → 0.70 | zoom 1.00 → 1.10 about (320, 120) | inSine |
| 0.00 → 0.70 | `holdTrauma` 0.15, shakeAmp 6 | |

**Beats**
- **0.05 THE EYE OPENS** (money shot): a pearl hairline 360 px wide splits the sky through the ball
  (0.05-0.11); the lids part (outCubic, 0.30 s) into the almond, 340 x 150 px, **opened to 70 %**
  (`skyEye`). The ball is the pupil. Inside: the dark emerald iris field, 24 jade meridian lines, the
  degree-tick ring; outside, the lines continue as faint lashes. **0.35** the ball's pearl glint
  slides down toward the defenders: it is looking at them. Their silhouettes are under-lit jade from
  above. The eye covers about 25 % of the frame and ramps over 0.30 s: a local light, not a flash.
  Bloom 1.15; one slow shock at the pupil (s 0.025, r 0 → 0.6 over 0.6 s); CA 0.006.
- **0.42-0.70 the coil**: a slanted manga panel slams in at the right (230 x 200, +3 deg, ink border,
  paper gutter): **the Tower's face, TF3** (a bust under GALE's convention) at ×2: grim, teeth gritted, the jade eye reflected in both
  pupils (code: two tiny jade almonds), screentone shadow. Ink SFX `GRR` (24 px). The panel shakes
  1 px. At 0.66 the panel rips upward (his launch): cut on the motion.

#### 6b · The leap, the tug-of-war, the strum, TWANG (0.70-2.00)

**Framing:** the ride world at apex height. Lock `zoomAbout(ball, 360, 120)`; the Sky Eye behind the
ball as a slimmer almond (280 x 110, lids at 70 %) in screen space; the stroke descending to the
bottom-left; floodlight lamp heads (tinted jade by the arc) at the upper left, just above us; the
stand roofline below the frame.

| t | camera | ease |
|---|---|---|
| 0.70 | zoom 1.70; `cam.hit(0.4)` as the Tower enters | |
| 0.86 → 1.16 | zoom 1.70 → 1.90 (pushing into the tug-of-war); `holdTrauma` 0.30; **the lock lets go in x**: the camera holds its 0.86 x, so the ball visibly creeps about 28 px right while the V deepens behind it | outSine |
| 1.20 | **punch +0.12**, `cam.hit(0.9)`, shakeAmp 18 | |
| 1.20 → 1.34 | the lock re-catches the ball | outCubic |
| 1.34 → 1.72 | zoom 1.90 → 1.60 (release) | outCubic |
| 1.72 → 2.00 | **whip-tilt down** after the ball: y +520 screen px in 0.28 s, `fx.streak` 0.10 along (0, 1), hole on the ball (R 0.08) | inCubic |

**Beats**
- **0.70 the leap**: the Tower erupts from the bottom of the frame (**TJ1** at 2.4x, 235 px): arms
  straight up, fingers spread, body arched. Ink speed lines stream down behind him; a dust plume
  rises from far below (at the frame bottom, small).
- **0.86 the grab**: his fist closes on **the thread** 40 px behind the ball (**TJ2**): he never
  reaches for the ball (no near-miss freeze). 20 jade sparks at the fist.
- **0.86-1.16 the tug-of-war** (0.30 s): his weight hauls the line down into a V (60 px); the stroke
  bends; **the ball never stops**: it keeps creeping forward (its speed eases to about 30 % and holds
  there, never lower; about 28 px on screen against the held camera, its panels still turning, stitch
  stars still popping behind it), so the stretch of thread between his fist and the ball grows 40 →
  70 px and thins; fibres fray at his fist (short jade `PK.Streak`, 6 per frame); **the stroke's light
  drains** (`drain` 0 → 0.6: the body thins 75 → 40 px and flickers); the Sky Eye's lids narrow 70 % →
  45 %. **He strains** (TJ2): teeth gritted, eyes squeezed shut, the thread biting into his glove. The
  crowd's fearful `OHHH`.
- **0.98-1.34 the strum insert**: a manga panel slams in bottom-right (200 x 210, +3 deg, centred
  (528, 250)): No.10 far below as a **Pluck bust at ×2** (head about 80 px, cropped crown to belt):
  **PL1** (calm half-smile, eyes up, the whole right hand hooked round an invisible string at chest
  height) → **PL2** at 1.12 (**the strum**: the hand pulled down and across past his left hip and out
  of the panel's bottom edge, a 1 px motion arc behind it), a pearl spark running along the arc. No
  finger snap, no click. The panel holds to 1.34.
- **1.14-1.20 the vibration travels**: a pearl pulse runs up the stroke from the bottom-left (his end)
  to the Tower's fist in 0.06 s.
- **1.20 TWANG!** **Stack B** (see the stacks table). The whole frame bends in a standing wave along
  the line (pluck warp 18 px, 3 antinodes); the stroke swings in the same wave; the drained light
  slams back to full (the lamp heads near it brighten with it, smoothly: no flare event). "TWANG!" is lettered across the sky (48 px,
  jade with an ink outline, 0.4 s).
- **1.20-1.55 the Tower is flung**: **TJ3** (curled, tumbling) rotated at 14 rad/s, flying up and left
  (vx -700, vy -500 screen px/s) out of the frame over the roofline in 0.35 s; his shadow flicks across
  the eye. No twinkle: he is gone.
- **1.34-2.00 the release**: the line snaps straight like a slingshot; **the ball whips out of the
  apex and starts to fall**; the Sky Eye's lids begin to close (70 % → 20 %); the whip-tilt down
  follows the ball.

**VFX:** `upView` sky with roof wedges and leaning towers, TC1 silhouette, the Sky Eye (open, look,
narrow, close), the slow pupil shock, the faces panel, TJ1-TJ3, ink speed lines, the tug-of-war
geometry (`threadSag`), fibres, the drain, the strum insert, the pulse, Stack B, "TWANG!", the
whip-tilt (streak, the ball sharp).

**Rate:** warp `[[0.00, 0.70, 0.35], [0.70, 0.16, 0.60], [0.86, 0.34, 0.50], [1.20, 0.14, 0.04]]`, else 1.

| t | sound |
|---|---|
| 0.00 | the held D6 carries over: `bow(1174.66, 1.2, 0.14, undefined, 6)` |
| 0.05 | **`eyeOpen()`** (a deep bell on D2, a reverse whoosh into it, a soft choir pad) + `ooh(0.5)` |
| 0.42 | `boom(0.3)` (panel slam) + `strain(0.25, 0.3)` (the Tower's breath) |
| 0.70 | `whoosh(0.3, 300, 2400, 0.5)` upward + `boom(0.45)` + `strain(0.2, 0.3)` |
| 0.86 | `zip(0.1, 2000, 600)` + `fray(0.3)` + `strain(0.35, 0.35)` |
| 0.90 | `ooh(0.6)` (the crowd's OHHH) |
| 1.12 | `zip(0.08, 1200, 400, 0.3)` (the hand brushing across the string: a strum, not a click) |
| 1.14 | `strum([587.33, 659.26, 739.99, 880, 987.77], 0.012, 0.6, 0.25)` (the pulse runs up) |
| **1.20** | **`twang(1.3)`** (D2, 1.5 s ring) + **`boom(1.3)`** + `crack(0.8)`; `sfx.choke('bow')` (the held note cuts) |
| 1.30 | `roar(1.2, 0.8)` |
| 1.72 | `whoosh(0.3, 2400, 400, 0.45)` (the whip-tilt) |

**Cut:** whip-tilt down, a motion cut into shot 7 (which opens moving down with the same blur
decaying). **[F5, global 10.10]**

**Motion:** the Tower TC1 0.00, TF3 (panel) 0.42, TJ1 0.70, TJ2 0.86, TJ3 1.20; No.10 PL1 0.98,
PL2 1.12.

### 7 · Needle Fall (1.2 s) [10.9-12.1]

**Job:** speed and tension. The needle of light dives out of the sky at the X; the friend and the
keeper race for it; the inner clock runs out.

**View:** `DownPitchView` falling with the ball, behind and above it, looking down at the box:

| key | t 0.00 | t 0.60 | t 1.20 | ease |
|---|---|---|---|---|
| eye x | 1000 | 1020 | 1080 | inQuad |
| eye z | 290 | 292 | 296 | linear |
| eye h | 360 | 285 | 60 | inQuad |
| tilt | 58 deg | 51.5 deg | 45 deg | linear |
| f | 300 | 325 | 400 | inQuad |

(horizon/principal point 180, cx 320.) Computed: the X stays in frame the whole shot (y 251 → 291 →
~303 at 0.80 → 250); the ball rides the upper-middle (y 167 → 208 → 216), drawn at art scale 48 → 70 px
(r12, D 2.0 → 2.9) and stretched along its fall (sx 0.85, sy 1.2), with a white-hot pearl core.

**Beats**
- **0.00-0.25 the needle forms**: the Sky Eye's lids squeeze into a narrow vesica that stays high at
  the tail (the top of the frame): **the needle's eye**. The stroke tightens into a straight shaft
  (18 → 10 px, pearl core) from the eye to the ball: **a needle of light 400+ px long** seen from
  behind, pointing down at the X. Jade droplets are sheared off the shaft.
- **Below**: the box rushing up; the **cross-stitch X** on the turf grows 20 → 90 px (a bomb-sight)
  and pulses on each of No.7's footsteps; a jade glow pool grows under it; the shaft's shadow line
  races across the turf onto No.7.
- **No.7** (Run, boxed 0.5x → integer 1x at 0.90) sprints in from the lower right (the near side);
  **the keeper** (puppet `gkReady`, leaning into his charge) charges off his line from the upper left. They
  converge on the X.
- **0.80** No.7's push-off (**H1**, 1x) as the keeper commits.
- **1.05-1.20** the ball and the X fill the lower half; No.7's head rises into it.

**VFX:** the carried-in whip (`fx.streak` 0.10 → 0 along (0, 1) over 0.00-0.12, hole on the ball R
0.08), the needle (eye, shaft, ball point), droplets, converging speed streaks, radial (zoom blur)
0.08 → 0.18 centred on the X, the X and its pool, the shaft's shadow, jade motes off the ball, CA
0.006, `nightInk` 0.85 with the pool under the X restored.

**Rate:** 1.0; warp `[[1.06, 0.14, 0.60]]` (a last stretch before the cut).

| t | sound |
|---|---|
| 0.00 | `whoosh(1.1, 3000, 400, 0.5)` (falling) + `bow(587.33, 1.08, 0.25, 293.66)` (a falling gliss D5 → D4) |
| 0.10 | `crowd(1.2, 0.6)` |
| 0.20 / 0.40 / 0.58 / 0.72 | `scuff(0.2)` (No.7's strides) |
| 0.70 / 0.80 / 0.89 / 0.97 / 1.04 / 1.10 | `tick()`: the inner clock accelerates |
| 1.10 | `sfx.choke('bow')` + `duck(0.25, 0.3)`: 0.08 s of near silence before the header |

**Cut:** motion cut on No.7's push-off into shot 8's flight. No flash.

### 8 · Flying Header (1.7 s) [12.1-13.8], contact at 0.36 [12.46]

**Job:** the payoff hit and the teamwork moment: all of No.10's line pours into No.7's header. Then
the keeper learns what the line can do.

**Framing:** close side view at 1 m height from the near touchline (ground line world y 318); No.7
from his new **Header** frames at **2x** (his flat body about 200 px long); the dark stands above, the
lamp heads faintly jade where the arc passed near them.

| t | camera | ease |
|---|---|---|
| 0.00 → 0.10 | tracking right 60 px with No.7, zoom 1.20; `holdTrauma` 0.2 → 0.5, shakeAmp 12 | linear |
| 0.10 → 0.36 | **crash zoom** `zoomAbout(meeting point, 300, 190)`, 1.20 → 2.40 | inExpo |
| 0.36 | **punch +0.18**, `cam.hit(1.0)`, shakeAmp 22 | |
| 0.58 → 0.62 | hold | |
| 0.62 → 0.84 | **whip-pan right** +720 screen px, `fx.streak` 0.10 along (1, 0), hole on the bead (R 0.08) | inOutQuad |
| 1.00 → 1.70 | chase beside the bead: ball held at screen (300, 170); zoom 1.00 → 1.30; the goal fills the right third and grows | outCubic |
| 1.22 | `cam.hit(0.8)` (the lash) | |

**Beats**
- **0.00-0.36 the launch**: **H1** 0.00 → **H2** 0.10: No.7 flies flat, arms swept back, neck braced,
  eyes on the ball. The needle-ball falls from the top-right toward his forehead with the shaft above
  it. The keeper is a dark inked shape coming off his line in the background, out of reach (no hand in
  the contact frame).
- **0.22-0.36 the reel-in** (the teamwork beat): **the whole line's light rushes down into the ball**:
  a 60 px pearl pulse enters at the top-left edge and runs the shaft at 4000 px/s; the shaft's tail
  whips taut; No.7's rim light turns jade and, for 0.14 s, the loom's No.7 thread from 2a flickers
  back between the shaft and his eyes. No.10's pass arriving in No.7's head.
- **0.36 CONTACT (H3): Stack C**, the biggest in the film (see the stacks table). The ball squashes on
  his forehead (sx 0.6, sy 1.3), about 60 px. **The bowstring**: the whole line **snaps straight in
  0.05 s** into the jade spear (24 px body, 90 px halo, 640 px) from his forehead to the far top corner
  (off the right edge), vibrating in a standing wave (14 px → 0 in 0.6 s, 3 nodes). **The colour floods
  back along the spear**: the night ink lifts in a 120 px band down its length. H3b (if drawn) holds
  through the hit-stop.
- **0.58-1.00 the bead**: the ball rides the spear toward goal like a bead on a string (2400 px/s on
  screen); the whip-pan follows it; No.7 drops behind (**H4** 0.62, **H5** belly slide 0.80, grass
  blades flicking, teeth gritted in a grin).
- **1.00-1.70 the keeper** (rate 0.35): the goal fills the right third (crossbar ~266 px above the
  line at zoom 1.0). **1.05** the keeper dives across the bead's path from the right (the existing
  puppet `gkDive` at k1 D2.0, about 150 px): one glove reaching across the ball's line. **The reach is
  never frozen**: it plays through at the shot's rate, with no hold while the glove is near the ball.
- **1.22 THE LASH**: the spear's standing wave whips: the taut line just behind the ball lashes down
  across his reaching forearm, a jade loop wraps that forearm twice and bites (0.06 s), and the line's
  recoil **plucks him away**: he spins 1.5 turns (puppet `plucked` rotated, 21 rad/s, 0.45 s) **down
  toward the turf at the near post**, his wrist still bound by the jade loop (it fades over 2.0 s). He
  never enters the netting. The ball sails on above his glove (by the lash it is already 80 px past
  his fingertips, so the hit-stop can never read as a near-miss). Keeper stack: hit-stop `[1.22, 0.08,
  0.06]` (on the lash, not the reach), `cam.hit(0.8)`, one shock (s 0.05) at his forearm, a stitched
  ring 8 → 120 px, 40 jade sparks, CA 0.010. **No impact frame and no flash here** (the budget).
- **1.40-1.70** the ball closes on the far top corner; cut as it touches the net.

**Rate:** warp `[[0.26, 0.10, 0.30], [0.36, 0.22, 0.03], [0.58, 0.12, 0.30], [1.00, 0.22, 0.35],
[1.22, 0.08, 0.06], [1.30, 0.40, 0.35]]`, else 1.

| t | sound |
|---|---|
| 0.00 | `scuff(0.3)` (the push-off) + `whoosh(0.3, 400, 2000, 0.4)` |
| 0.22 | `zip(0.14, 800, 6000, 0.45)` (the reel-in) |
| **0.36** | **`kick(1.4)` + `boom(1.4)` + `crack(1.0)` + `twang(1.0)` + `strum([293.66, 369.99, 440, 587.33, 739.99, 880], 0.012, 1.6, 0.4)`** (D major) **+ `pluck(1174.66, 1.8, 0.6)`** (D6: the motif resolves) |
| 0.58 | `whoosh(0.5, 3000, 300, 0.5)` along the spear |
| 0.62 | `roar(1.6, 1.0)` + `crowd(2.4, 0.6)` |
| 0.80 | `scuff(0.35)` (the belly slide) |
| **1.22** | **`twang(0.9)` + `pluck(110, 1.5, 0.5)` (A2) + `crack(1.0)` + `boom(0.9)`** |
| 1.30 | `whoosh(0.4, 1200, 300, 0.4)` (the keeper spinning) |

**Cut:** motion cut as the ball touches the net (1.70). **[F6, F7 at global 12.46 and 12.53]**

**Motion:** No.7 Header H1 0.00 · H2 0.10 · H3 0.36 · (H3b 0.40) · H4 0.62 · H5 0.80; keeper puppet
`gkDive` 1.05 → `plucked` 1.22 (spin applied at runtime; he lands in `sprawl` in 9a at 0.12).

### 9 · Harp Net (3.0 s) [13.8-16.8]

**Job:** catharsis (the goal plays like an instrument), then pride and friendship: the bridge between
the two friends, the diptych, the name card.

#### 9a · The harp (0.00-1.10)

**Framing** (composed): front-on to the goal from the penalty spot, lens at 1 m: the goal mouth fills
**520 x 200 px** (posts at x 60 and 580, crossbar y 70, goal line y 270), so the frame reads like a
stringed instrument. The far post is screen-left. Behind it the shared spring mesh (`NetMesh` 30 x 14,
front view). The keeper, lashed in shot 8, is still spinning down at the right, by the near post.

| t | camera | ease |
|---|---|---|
| 0.00 → 0.30 | zoom 1.00 → 1.12; `holdTrauma` 0.3 | inCubic |
| 0.04 | `cam.hit(0.9)`, punch +0.08 | |
| 0.30 | punch +0.10 on GOAL!, `cam.hit(0.5)` | |
| 0.60 → 1.10 | 1.12 → 1.20 | inOutSine |

**Beats**
- **0.00** the spear pierces in from the left foreground and angles into the far top corner; the ball
  (30 px) rides it.
- **0.04 THE HARP** (money shot): the ball buries into the far top corner. The net stretches away from
  the camera into a long cone (up to 160 px deep). **The thread weaves through it**: strands light from
  the entry point outward in a diamond wave over 0.45 s (pearl at the front, then jade, then emerald),
  pearl tips on every knot. **Every strand vibrates like a harp string** (4-10 px, decaying over
  0.8 s, nodes at the frame). **The goal frame sings**: the crossbar and both posts vibrate as standing
  waves (6 px, decaying over 1.2 s), drawn as three ghost positions with a jade glow on each bar (a
  drawn shape, never a full-frame flicker). Two shocks at the corner (s 0.06, 0.035), two stitched
  rings, 60 jade sparks, pearl flash 0.7 (0.12 s).
- **0.12** the keeper slams down onto the turf in front of the near post (screen right) and lands in
  `sprawl`: a turf impact with a dust burst (30 puffs, `dustBurst`), a 4 px bounce, the fading jade
  loop still round his wrist. He never touches the netting; the side netting stays still.
- **0.30 GOAL!** (124 px): jade fill, pearl inner stroke, ink outline; stitched in by a fast running
  stitch (0.12 s), then slammed (scale 1.4 → 1.0, outBack), with a stitched underline; a small flash
  0.45 (a budget event, F9). Confetti (jade, pearl, red; 4 per frame). A wave of crowd camera flashes (points of 6 px or
  less). **The night ink lifts completely** in 0.4 s from the net outward (`fx.fullFrame` 0.30-0.70: a
  budget event, F10): full colour returns. The lamp heads have no beat of their own: they keep only
  the tint the dissolving arc lends them.
- **0.95** the referee's whistle.

#### 9b · The bridge (1.10-2.30)

**Framing** (composed): a low wide from the near touchline at grass level, ground line y 300. **The
Meridian still hangs across the night sky as a bridge**, its two feet planted at the two friends
(from No.10's spot to the goal behind No.7), apex near y 30, dissolving slowly from the middle.
No.7 in the foreground right at **2x** (196 px, west strip so he faces left, feet at y 350); No.10 in
the mid-ground left at **1x** (98 px, feet at y 300). Background, small: the Tower face-down near
the halfway line in a settling dust plume, the three defenders standing with their heads tipped back
(`craneUp`), still looking at the sky; the keeper sprawled on the turf by the near post, out of the
netting.

| t | camera | ease |
|---|---|---|
| 1.10 | zoom 1.30 about No.7's face | |
| 1.10 → 2.10 | **crane up** 120 px and pull back to 0.92 so both friends and the whole arc fit | inOutCubic |
| 1.70 | punch +0.04 (the point) | |

**Beats**
- **1.10** No.7, back on his feet, turns (No7Point west strip, so the 7 reads): **Q1 1.10 → Q2 1.55**,
  pointing back at No.10.
- No.10 jogs in (Run, 1x) and **answers with the Meridian Sign**: **MS1 1.40** (tap) → **MS3 1.52**
  (sweep) → **MS4 1.66** (point).
- **1.70-2.20** a single pearl spark runs along the arch from No.10's fingertip to No.7's fingertip; on
  arrival the arch unpicks stitch by stitch from the middle outward and falls over the stadium as jade
  motes.

#### 9c · The diptych and the name card (2.30-3.00)

- **2.30** two slanted manga panels slam in (0.10 s; ink borders, paper gutters; the slam's flash 0.4
  is a budget event, F11): left, No.10 (Point
  **P3a** at 2x, front chest-up, grinning, pointing right; **P3b** blink at 2.62); right, No.7 (No7Point
  **Q2** at 2x, west strip, pointing left).
- A jade thread stitches across the gutter between their fingertips (`tip` anchors), pulls taut and
  plucks (pluck warp amp 0.006, N 1, 6 Hz, decay 0.3).
- **2.45** the name card (the set's shared `nameCard`, `style: 'meridian'`, the stitched title):
  `MERIDIAN THREAD` (stitched), `No.10 > No.7 · ASSIST`, `CAM 1 - 0 RIV`.
- **2.70-3.00** fade to [8,4,14] (the result view fades up from it).

**Rate:** warp `[[0.04, 0.10, 0.06]]`, else 1.

| t | sound |
|---|---|
| **0.04** | **`boom(1.3)` + `kick(1.0)` + `crack(0.8)` + `harpGliss([293.66, 329.63, 369.99, 440, 493.88, 587.33, 659.26, 739.99, 880, 987.77, 1174.66, 1318.51, 1479.98, 1760], 0.03)`** |
| 0.12 | `boom(0.9)` + `scuff(0.4)` + `strain(0.4, 0.3)` (the keeper slams onto the turf) |
| **0.30** | **`crowd(3.0, 0.65)` + `roar(1.6, 1.0)` + `stinger()`** + `zip(0.12)` (the stitch) |
| 0.95 | `whistle()` |
| 1.40 | `whoosh(0.25, 500, 2000, 0.25)` (the answering sign) |
| 1.70 | `strum([293.66, 369.99, 440, 587.33], 0.03, 2.0, 0.3)` |
| 2.20 | `pluck(1174.66, 1.5, 0.5)` (D6) as the spark arrives |
| 2.30 | `kick(0.3)` (panel slam) |
| 2.40 | `pluck(587.33)` + `pluck(1174.66)` (the fingertip thread) |
| 2.45 | `blip(880)` (the card) |

**Cut:** fade to [8,4,14]. **[F8 at global 13.84; F9, F10 at 14.10; F11 at 16.10]**

**Motion:** No.7 Point Q1 (west) 1.10 · Q2 1.55 · diptych Q2 2.30; No.10 Run (1x) 1.10 ·
MS1 1.40 · MS3 1.52 · MS4 1.66 · diptych P3a 2.30 · P3b 2.62.

## The impact stacks

| Layer | A: Loft (shot 3, 3.70) | B: TWANG (shot 6, 10.10) | C: Header (shot 8, 12.46) | D: Harp (shot 9, 13.84) |
|---|---|---|---|---|
| Hit-stop | `[0.50, 0.16, 0.03]`, then `[0.66, 0.14, 0.30]` | `[1.20, 0.14, 0.04]` | `[0.36, 0.22, 0.03]`, then `[0.58, 0.12, 0.30]` | `[0.04, 0.10, 0.06]` |
| Trauma | `cam.hit(0.9)`, shakeAmp 18 | `cam.hit(0.9)`, shakeAmp 18 | `cam.hit(1.0)`, shakeAmp 22 | 0.9, then 0.5 on GOAL! |
| Punch zoom | +0.16 | +0.12 | +0.18 | +0.08, +0.10 |
| Impact frame | **two stages**: A (halftone in the band) 0.06 s, B (plain) 0.07 s | **stage A only**, 0.06 s (so the header can be bigger) | **two stages**: A (halftone in the band) 0.07 s, B (plain) 0.09 s | none; pearl flash 0.7 (0.12 s) |
| Shock rings | 2 at the boot (s 0.06, then 0.035 at +0.05) | 1 at the fist (s 0.06) | 3 at the forehead (0.075, 0.045 at +0.06, 0.03 at release) | 2 at the corner (0.06, 0.035) |
| Stitched rings | 3: flat at the plant 10 → 160 (squash 0.35), upright 8 → 220, pearl 6 → 200 | 1: 10 → 240 | 3: pearl 8 → 300, jade 10 → 260, emerald 12 → 220 (squash 0.6) | 2 at the corner |
| Particles | 60 jade sparks (cone 1.2 rad at -62 deg) + 30 `PK.Stitch` + 30 ink flecks | 60 jade sparks + 30 `PK.Stitch` + 20 fibres | 80 jade sparks + 40 `PK.Stitch` + 30 ink flecks, grass fanned flat | 60 jade sparks, confetti |
| Focus lines | 90 ink with jade tips, flipping to pearl with stage B | 80 ink and jade | 120 ink with jade tips, flipping to pearl with stage B | none: the frame sings instead |
| Energy shape | the Meridian bursts out of the boot (the ground beat is the flat stitched ring above) | the drained stroke slams back to full | **the bowstring**: the line snaps straight into the 640 px spear | **the harp**: strands lit and ringing, the frame singing |
| Warp | pluck warp along the rising stroke: amp 0.020 UV (7 px), N 2, 9 Hz, decay 0.6 s, width 0.08 | **full-frame standing wave**: amp 0.050 UV (18 px), N 3, 9 Hz, decay 0.6 s, width 0.8 | along the spear: amp 0.030 UV (11 px), N 1, 9 Hz, decay 0.4 s, width 0.12 | none |
| CA / radial | CA 0.012, radial 0.10 at the boot | CA 0.010, radial 0.08 at the fist | CA 0.016, radial 0.14 at the contact | CA 0.008 |
| Grade | the stroke band restores colour behind it | bloom pulse 1.3 | **colour floods back along the spear** (a 120 px band) | **the night ink lifts completely** (`fullFrame`) |
| Sound | kick 1.2 + boom 1.2 + crack 0.8 + twang 0.7 + pluck D3, then zip | **twang 1.3 + boom 1.3 + crack 0.8**, then roar 1.2 | **kick 1.4 + boom 1.4 + crack 1.0 + twang 1.0 + D-major strum + pluck D6**, then roar 1.6 | **boom 1.3 + kick 1.0 + crack 0.8 + harp glissando**, then crowd 3.0 + roar 1.6 + stinger |

Plus the keeper lash (shot 8, 13.32): hit-stop `[1.22, 0.08, 0.06]`, `cam.hit(0.8)`, one shock, one
stitched ring, 40 sparks, CA 0.010, twang 0.9 + pluck A2 + crack 1.0 + boom 0.9. No impact frame.

**The halftone impact frame** is MERIDIAN's own: the shared impact shader with a dot screen in the
transition band only (`fx.tone*`), so the frame looks printed on a manga page.
- **Stage A, "jade print"**: `impA` [6,20,15] (night), `impB` [191,255,224] (mint), `impThresh` 0.45,
  `tone` 3 px cells at 45 deg, `toneBand` 0.16: only the mid-tones inside the threshold band print as
  growing jade dots; everything outside the band is the plain two-tone. **The band holds at most 25 %
  of the frame's pixels**: the dev capture measures it on every stage-A frame, and a site whose band
  holds more narrows its `toneBand` (0.16 → 0.10 → 0.06) until it passes. A fine dot screen over the
  whole frame is a photosensitivity risk; a band is a print accent.
- **Stage B, "pearl negative"**: `impA` [251,246,234] (pearl), `impB` [11,143,88] (emerald): light
  shapes turn emerald and dark shapes turn pearl. **A plain two-tone with no dot screen** (`tone` 0),
  so B is never the in-place negative of A's dots.
- It never uses black with white, crimson, cobalt or violet.

## Photosensitivity budget (at most 3 full-frame events in any 1 s)

Counted with the **shared `FlashBudget` definition** (GALE v2 §10.1 item 6, built once for the set): an
event is a rising edge of `fx.flash ≥ 0.3`, `fx.impact ≥ 0.5` or a shot-flagged `fx.fullFrame` (a
luminance jump over most of the frame), over a rolling 60-frame window, across cuts. The guard counts
each signal's rising edge, so a frame on which a flash and `fullFrame` rise together costs 2.

| # | Global t | Event | Signal, peak |
|---|---|---|---|
| F1 | 3.70 | loft, stage A (halftone in the band) | impact, 0.06 s |
| F2 | 3.76 | loft, stage B (plain) | impact, 0.07 s |
| F3 | 7.43 | the mint whiteout out of the ball's core | flash, peak 0.85 at 7.48 |
| F4 | 7.43 | the same whiteout, flagged (held through shot 5's clear to 7.62) | fullFrame |
| F5 | 10.10 | TWANG, stage A | impact, 0.06 s |
| F6 | 12.46 | header, stage A | impact, 0.07 s |
| F7 | 12.53 | header, stage B | impact, 0.09 s |
| F8 | 13.84 | the harp, pearl flash | flash 0.7, 0.12 s |
| F9 | 14.10 | GOAL!, small flash | flash 0.45 |
| F10 | 14.10 | the night ink lifts from the net outward (14.10-14.50) | fullFrame |
| F11 | 16.10 | the diptych slam | flash 0.4 |

- **Worst window: 13.84-14.84 holds 3 (F8, F9, F10), exactly the limit.** Nothing else may land in it:
  no flash or impact at the keeper's landing (13.92), the referee's whistle is sound only, confetti and
  crowd camera flashes stay local. Every other window holds at most 2 (3.70-4.70: F1, F2; 7.43-8.43:
  F3, F4; 12.46-13.46: F6, F7).
- Not counted (below the threshold or local): the needle's-eye iris that ends shot 1 (flash ≤ 0.25, a
  rim glint, never a white frame); the Sky Eye (about 25 % of the frame, ramping over 0.30 s); the lamp
  heads (a smooth tint with distance, no switching, flares ≤ 120 px); stitch-hole stars under 18 px at
  about 5 per second; crowd camera flashes 6 px or less, never in unison; the 26 M tick glint.
- No flash or impact at the keeper lash (13.32). The halftone dots stay inside the threshold band
  (≤ 25 % of the frame) and stage B has none.
- The pluck warp is a displacement, never a brightness change: frequency 9 Hz or lower, decay 0.6 s or
  shorter. The singing goal frame is drawn ghosts, not a flicker.
- The shared `FlashBudget` guard asserts this table in dev captures (`console.assert(count ≤ 3)`, a red
  scrubber marker, the event list printed by the capture tools) and at runtime clamps any extra event
  (flash/impact → 0) once a window's budget is spent.

## Field scenario `'through'` becomes lofted (`src/game/field.ts`, `src/cinematic/specials.ts`)

- `SPECIALS`: `{ id: 'meridian', name: 'MERIDIAN THREAD', kind: 'No-look lofted pass', scenario:
  'through', cost: 70, shots: meridianThread }` (was 50).
- **Setup from `LAYOUT` v2**: No.10 carries from `no10Start` (700, 268) at 118 px/s with the existing
  Dribble cache; D1 steps up from (1016, 222) to (1004, 222) at field t 0.8 s; the Tower, D3 and D4
  hold and side-step to mirror him; the keeper rocks on his line; No.7 jogs from `no7Start` (940, 344)
  and reaches `no7Strike` (994, 336) at the trigger, onside. The Tower is one of the `'through'` defender
  actors, drawn 1.3x wide with a captain's armband (the set's one big captain: the same model is SOLO
  v2's defender D in `'gauntlet'`). Other scenarios are unchanged; the extra actors stay
  gated to `'through'` and `'gauntlet'`.
- **Command window** opens when No.10 reaches x ≥ 760 (`blip(660)`, `timeScale` 0.06, slight
  desaturation). `> MERIDIAN THREAD   SP 70` highlighted; dim options `['SHOOT', 'SHORT PASS',
  'DRIBBLE']`.
  - **The preview is the star chart**: a dotted jade arc rises from the ball in the field's 2.5D view
    (the real 16 m flight: h x 0.62, drawn as y = ground y - h), over the line, and drops onto a pulsing
    cross-stitch X at `target`; pearl ticks along it. Four soft plucks as it passes over the four
    defenders (E5, F#5, A5, B5 at `cmdT` 0.20 / 0.32 / 0.44 / 0.56, gain 0.12): the player sees and
    hears the move before choosing it.
  - The field's command-window mote ramp (`AURA_RAMP.meridian`, shared by every special) stays
    `'jade'`; the field ball gets the pearl halo while the window is open.
- **Handoff**: the cinematic starts at shot 1; the field view is not shown flying the ball (the
  cinematic owns the flight).
- **Result view** (fades up from [8,4,14]): banner `GOAL · MERIDIAN THREAD`, smaller line `No.7 SCORES ·
  ASSIST No.10`, score 1-0. The ball in the net at `finish`. No.7 celebrates near the far post
  (Celebrate re-skin, fallback No7Point Q2); No.10 runs in pointing (Point P3a, 0.5x boxed; **never the
  puppet**). The Tower lies face-down at (1050, 236) (cached `faceDown`); D1, D3 and D4 stand with
  their heads tipped back (`craneUp`), still looking at the sky (the gag, now pointing up). The keeper lies
  on the turf by the near post (`sprawl`), never in the netting.
- `game.ts` intro skip for `'through'` jumps to x 759.

## Sound design

**Concept: the thread is a string, and the stadium plays it.** It is plucked (the motif), bowed (the
arc sings while it climbs, the held note at the apex, the falling gliss), struck (`twang` on every
string event, rising in power: 0.5, 0.7, 1.3, 1.0, 0.9) and strummed (the D-major chord at the header,
the harp across the net). Every note is in **D-major pentatonic** (inside the key of `stinger()`).

| Moment | Notes | Hz |
|---|---|---|
| the promise (cut-in) | E5, A5 | 659.26, 880 |
| the title lock | D-major strum + twang 0.5 | 293.66, 369.99, 440, 587.33 |
| the loom (2a, one per tick) | D4, F#4, A4 | 293.66, 369.99, 440 |
| the climb up the star chart (2b, bowed) | D4 → D5 | 293.66 → 587.33 |
| the loft's low root | D3 | 146.83 |
| the arc sings (bowed) | A3 → A4 (shot 4), D3 → A3 (shot 3) | 220 → 440, 146.83 → 220 |
| over the four defenders | **E5, F#5, A5, B5** | 659.26, 739.99, 880, 987.77 |
| the apex (held, tremolo) | D6 | 1174.66 |
| the TWANG | D2 (with a pitch drop) | 73.42 |
| the fall (bowed gliss) | D5 → D4 | 587.33 → 293.66 |
| **the header** | D-major strum + **D6** (the motif resolves) | 293.66 … 880, 1174.66 |
| the keeper lash | A2 + twang 0.9 | 110 |
| the harp | 14 notes D4 → A6 | 293.66 … 1760 |
| the bridge, the diptych | D6; D5 + D6 | 1174.66; 587.33 |

The figure "mi-fa-sol-la … DO" (E-F#-A-B, then D) is stepwise, then leaps: a child can hum the pass.

**Breath and silence.** MERIDIAN's breath is its own: a deep `duck` (to 0.15, never total silence),
one held bowed note and the slowed watch ticks. Not `timeStop` (ZENITH), not heartbeats (CRESCENT),
not a vacuum or the muffle bus (GALE), not SOLO's choke into silence.

**Power.** Booms at 0.9 or more: loft 1.2, TWANG 1.3, header 1.4, lash 0.9, harp 1.3, the keeper's
landing 0.9 (6 sites). Roar three times (TWANG, header, GOAL!). The loudest moment is the harp and GOAL!, then the
header.

**Mix.** Plucks and the harp on a 0.6-0.7 reverb send; `bow` on 0.5; `twang` dry-ish (0.3) with its
own long ring. Ticks always dry. The limiter keeps the strums clean.

**New procedural voices** (`src/engine/audio.ts`):
- **`twang(power = 1, f0 = 73.42)`**: the move's name sound. A Karplus-Strong low string (noise burst
  into a tuned delay, damping 0.996) with a pitch drop of 2 semitones over 80 ms, a noise slap
  (band-pass 1.8 kHz, 15 ms), a sub thump (55 Hz sine, 0.12 s) and a long metallic ring (band-pass
  2.2 kHz, 1.5 s tail scaled by `power`). Pan follows the call's optional `pan`.
- **`bow(freq, dur, gain = 0.25, glideTo?, tremolo = 0, pan = 0)`**: a bowed string: sawtooth into a
  band-pass (Q 4) that tracks the pitch, vibrato 5.5 Hz ±12 cents, a quiet bow-noise layer (band-
  passed noise at 3 kHz), 0.15 s attack, optional exponential glide to `glideTo` over `dur` and an
  amplitude tremolo at `tremolo` Hz. Registered as a held voice kind `'bow'`, so `choke('bow')` and
  `clearBus({ tails: true })` stop it (seek safety).
- **`eyeOpen()`**: a deep bell on D2 (inharmonic partials 1, 2.0, 2.76, 5.4, 4 s decay), a 0.4 s reverse
  whoosh into it, and a soft choir pad (3 detuned saws, low-passed at 1.2 kHz, 1.5 s).
- **`fray(dur)`**: a string under tension: band-passed noise (600-1400 Hz) gated at random 30-60 Hz
  grains, rising in pitch.
- **`harpGliss(freqs, gap = 0.03, panFrom = -0.8, panTo = 0.8)`**: `strum` with a per-note pan sweep
  and slightly brighter partials.

**Reused:** `pluck`, `strum`, `tick`, `zip`, `duck`, `kick`, `boom`, `crack`, `whoosh`, `rumble`,
`shing`, `ooh`, `crowd`, `roar`, `strain`, `scuff`, `stinger`, `whistle`, `blip`. **Never:** `timeStop`,
`sonicBoom`, `earPop`, `gust`, `inhale`, `breath`, `whine`, `airTone`, `muffle`, `tom`, `snare`, `rim`,
`hat`, `kickDrum`, `crash`, `crashSwell`, `sticks`, `ole`, `lightsOff`, `lightsOn`, `spotOn`,
`lampHum`, `hum`. Every shot's `init` calls `sfx.clearBus()`, even when silent.

## Studio art (Pixel Studio)

All frames: 128 x 128, No.10 98 px tall standing, ground row 102, the 15-colour palette, the motion
library's rules (`docs/skills/MOTION_LIBRARY.md` §1: `Art` / `Num` / `Ball` layers, the anchor schema,
west strips for mirrored use so numbers read). **The ball is never drawn in a frame**: the game draws
it at the `ball` / `boot` / `forehead` anchors. Every hold longer than 0.3 s on screen has a drawn
variant. **24 required frames, 3 optional.**

**Busts** (GALE v2's convention, `GALE_HAMMER_v2.md` §9): GazeFront GZ2/GZ2b/GZ3 and Pluck PL1/PL2
(No.10) and TowerFace TF3 (the Tower) are busts drawn at **twice the figure scale** on the 128 x 128
canvas (head about 40 px tall, shoulders about 70 px wide, the waist near row 110), the same palette
and 1 px outline, more facial detail; `chest` anchor = the sternum, the bust's pivot. No.10's five are
built on GALE's **WindHand bust base** (the same body, shoulders, shirt and head construction; new
arms, hands and faces), so the set has one No.10 bust model. Busts are used at ×2-×3.

**No.10, project "Sochetra" (14 new)**

| Strip / id | View | Pose | Holds on screen | Anchors |
|---|---|---|---|---|
| **Loft LF1** | side, east | the plant: standing (left) foot planted wide of the ball and about one ball behind it, body leaning back 10 deg, kicking knee cocked to about 90 deg behind, arms wide, **head turned away up-screen** (hair mop and ear, no eye) | shot 3, 0.22-0.46 (0.24 s at rate 0.3) | `contact` (left toe, the same pixel as T3/T5 by the library rule), `ball`, `head` |
| **Loft LF2** | side, east | contact: the outside of the right boot under the inside-back of the ball, ankle locked, toes down and in, sole tipped to the camera, body back 14 deg, arms wide, head still away | shot 3, 0.50-0.66 (the hit-stop) | `contact`, `boot` (outside of the right boot), `ball` |
| **Loft LF3** | side, east | the swing as one tapered smear sweeping up and across (BK9 style) | shot 3, 0.66-0.72 | `contact`, `boot` |
| **Loft LF4** | side, east | **the monument**: high follow-through, the kicking leg up across and out to his right at shoulder height, sole to the camera, body leaning back, left arm up and out, head still turned away in profile looking up-screen, up on the left toe | shot 3, 0.72-1.45 with LF4b; shot 4 as a 0.4x boxed cache | `contact`, `boot`, `head` |
| **Loft LF4b** | side, east | LF4 with the hair lifted 3 px and the shirt hem lifted (the updraft) | alternates with LF4 every 0.2 s | as LF4 |
| **GazeFront GZ2** | front bust (WindHand base, 2x figure scale) | **chin up, eyes to the sky**, shoulders back, chest open, both hands raised at chest height out to the sides, fingers curled as if each one holds a string (a puppeteer's hands) | shot 2a, 0.30-0.80 with GZ2b (×3) | `eyeL`, `eyeR`, `tip1`-`tip6` (index, middle and ring fingertips of each hand: where the threads leave), `head`, `chest` |
| **GazeFront GZ2b** | front bust | GZ2 with the hair lifted 3 px and the fingers flexed on the strings (two fingers curled 1 px more) | alternates every 0.15 s | as GZ2 |
| **GazeFront GZ3** | front bust | head down, eyes down on the ball (below the frame), shoulders dropped 2 px (the crouch), hands down out of the frame, mouth set (the decision) | shot 2a, 0.00-0.30 and 0.80-0.90 (×3); inside shot 1's iris as a cached still | `eyeL`, `eyeR`, `head`, `chest` |
| **MeridianSign MS1** | front, full body standing (cropped chest-up at 3x in shot 1, full at 1x in shot 9b) | right index finger tapping just under his right eye, eyes narrowed, a smirk | shot 1, 0.00-0.40; shot 9b, 1.40 | `fingertip`, `eye`, `contact` |
| **MeridianSign MS3** | front | the arm swept up and over his head, body twisting, eyes following the fingertip | shot 1, 0.40-0.74; shot 9b, 1.52 | `fingertip`, `eye`, `contact` |
| **MeridianSign MS4** | front | the arm out pointing to the viewer's right, chin up, a grin | shot 1, 0.74-1.05; shot 9b, 1.66 | `fingertip`, `eye`, `contact` |
| **MeridianSign MS4b** | front | MS4 with a blink-grin | shot 1, 1.05-1.40 | as MS4 |
| **Pluck PL1** | front bust (WindHand base) | calm half-smile, eyes up, the whole right hand raised at chest height and hooked round an invisible string (four fingers curled together, the thumb along them) | shot 6 insert, 0.98-1.12 (×2) | `hand`, `chest` |
| **Pluck PL2** | front bust (WindHand base) | **the strum**: the whole hand pulled down and across his body past the left hip, fingers trailing open, the shoulder following, a 1 px motion arc from chest height to the hip; never a snap | shot 6 insert, 1.12-1.34 (×2) | `hand`, `chest` |
| *MS2 (optional)* | front | the hand flung up above his head, finger up (between MS1 and MS3) | shot 1, 0.30 | `fingertip` |

**Reused No.10:** Approach AP1, AP3; Trivela T5 (the swing), **T8a, T8b (the wink)**; Scan S1, S2a, S2b,
S3; GlanceFace G2 (the inset crop); Run; Point P3a, P3b (diptych); Celebrate or Point (result view);
the hand-drawn face sprite for the needle-pupil overlay. Do **not** use StrikeBack B11 for the look-off
(its palm-to-face is GALE's palm blow).

**No.7, project "No.7" (5 new + 1 optional)**

| Strip / id | View | Pose | Holds | Anchors |
|---|---|---|---|---|
| **Header H1** | side, east | the push-off: the left leg pushing off the turf, body forward 30 deg, arms swinging back, eyes up on the ball | shot 7, 0.80 (1x); shot 8, 0.00-0.10 | `contact` (left toe), `forehead`, `pelvis` |
| **Header H2** | side, east | **full flight**: body flat and horizontal, arms swept back like wings, neck braced, eyes open on the ball, legs together trailing | shot 8, 0.10-0.36 | `forehead`, `pelvis` |
| **Header H3** | side, east | **contact**: head snapped forward, forehead square to the ball, hair whipped back, mouth open, arms starting forward. Must read in silhouette | shot 8, 0.36-0.62 (the hit-stop) | `forehead`, `pelvis` |
| **Header H4** | side, east | follow-through: body arching, arms coming forward to brace, legs dropping | shot 8, 0.62-0.80 | `pelvis` |
| **Header H5** | side, east | the belly slide: chest on the turf, hands down, face up toward the camera, teeth gritted in a grin | shot 8, 0.80-1.00 and behind | `contact` (chest), `pelvis` |
| *H3b (optional)* | side, east | the hit-stop hold: cheeks pushed, eyes squeezed half shut | shot 8, 0.40-0.58 | as H3 |

**Reused No.7:** Run R1-R8 (shots 2b, 5, 7, 0.4x / 0.5x boxed caches and 1x);
Point Q1, Q2 (+ west strips) for 9b and 9c; the hand-drawn front head (neutral, grin) cropped at 5x for
the cut-in eyes.

**Rivals, project "Rivals": the Tower (5 new + 1 optional)**

A new centre-back and captain: buzz cut, heavy brow, broad shoulders, a captain's armband, black
field-player gloves, `RIVAL_KIT` colours. Drawn on the 128 canvas at the same 98 px height but about
1.3x the defenders' bulk. **He is the set's one big captain**: the same Rivals model (armband, 1.3x
bulk) plays SOLO v2's defender D (each special dresses him by its own tone-for-tone kit swap), so
kids meet one recurring villain across the specials, and SOLO's optional fear face (RivalFearFace FF1)
is drawn on TF3's head. In MERIDIAN he is the only rival with
studio frames.

| Strip / id | View | Pose | Holds | Anchors |
|---|---|---|---|---|
| **TowerCrane TC1** | head and shoulders from behind-below, three-quarter, looking straight up | back of the buzz cut, the armband, shoulders hunched, chin up (used as an ink silhouette with a jade rim) | shot 6a, 0.00-0.70 (code tremble 1 px) | `head` |
| **TowerFace TF3** | front three-quarter **bust** (GALE's bust convention, 2x figure scale) | grim, teeth gritted, brows down, eyes up (code adds the jade reflections); the head SOLO's FF1 is drawn on | shot 6a panel, 0.42-0.70 (×2) | `eyeL`, `eyeR`, `head`, `chest` |
| **TowerLeap TJ1** | side, east | the leap: full stretch, arms straight up, fingers spread, body arched, legs trailing | shot 6b, 0.70-0.86 | `pelvis`, `fist` (the higher hand) |
| **TowerLeap TJ2** | side, east | hanging: one gloved fist clamped on the thread above his head, the other arm flung out, legs dangling, **straining**: teeth gritted, eyes squeezed shut, the neck corded, the thread biting into his glove | shot 6b, 0.86-1.20 (the tug-of-war) | `pelvis`, `fist` (the grab point) |
| **TowerLeap TJ3** | side, east | flung: curled and tumbling (used rotated at runtime) | shot 6b, 1.20-1.55 | `pelvis` |
| *TC1b (optional)* | as TC1 | shoulders risen one breath | alternates with TC1 every 0.25 s | `head` |

**Puppet poses** (joint angles only; add to `POSES`): `craneUp` (head tipped right back, mouth open,
arms limp at the sides: the fear pose), `plucked` (keeper twisting, arms flung back and up, legs split;
rotation applied at runtime). Reused: `gkDive` (the keeper's one-glove reach in shot 8), `sprawl` (his
landing in 9a and the result view), `leap` and `tuck` (Tower fallbacks at 1.3x), `faceDown`,
`lookFar`, `gkReady`. No `flyingPunch` and no `tangled` (a double-fist punch and a side-netting tangle
are GALE's keeper beats). Every puppet renders through the shared `PuppetCache`.

**Drawing notes**
- **The disguise lives in the head**: head away on LF1-LF4b (mop and ear, no eye), three-quarter to the
  camera with a smirk on T8a, the wink on T8b. A reviewer must never read LF2 as a toe-poke or an
  inside-foot lob: the ankle turns **in**, the sole tips to the camera, the plant is wide.
- **LF4 is the poster frame**: the silhouette must read at 320 x 180 (leg up across at shoulder
  height, arms wide, head turned the other way). Review it at 4x and at 0.4x.
- **H2/H3 carry the film's peak**: a horizontal body at 2x, the neck snap readable in silhouette.
  Review them at 2x beside the keeper puppet at k1 D2.0.
- **The Tower must look dangerous, not comic**: square jaw, heavy brow; TJ2 is all effort (gritted
  teeth, squeezed eyes, corded neck, the thread biting the glove), never a grin and never goofy. No
  cartoon eyes.
- MeridianSign is drawn full-body so the same frames serve the 3x chest-up crop and the 1x bridge.
- The busts (GZ, PL, TF3) are drawn once GALE's WindHand base is final, so the set shares one bust model.

**Priority:** LF2, LF4 → H2, H3 → TJ2 → MS1, MS3, MS4 → GZ2, GZ3 → LF1, LF3, LF4b → H1, H4, H5 → TJ1,
TJ3, TC1, TF3 → PL1, PL2 → GZ2b, MS4b → optional (MS2, H3b, TC1b).

**Fallbacks** (never a puppet for No.10 or No.7)
- Loft late: Trivela T3 (plant), T6 (contact), T5 (smear), T7 (follow-through) with the same ball path.
- GazeFront late: StandFront a/b cropped chest-up at 6x (integer; the bust framing's 120 px head)
  with the needle-pupil overlay; the loom then leaves from his eyes only (6 threads).
- MeridianSign late: Point P1 → P2 → P3a (the point), the stroke drawn from P3a's `tip`.
- Pluck late: a Point P2 crop with a code-drawn strum (the hand smeared down and across in 3 frames, a
  1 px motion arc). Never a snap.
- Header late: shot 8 becomes a **first-time half-volley** on No.7's Receive R5/R6 (the ball meets his
  boot at knee height after the needle fall; the same Stack C, reel-in and bowstring). The owner allowed
  "volley, header or first-time strike".
- The Tower late: puppets (`leap`, a `hang` mix of `leap` with one arm lowered, `tuck`) at 1.3x; TC1/TF3
  replaced by a cached puppet crop silhouette and the panel cut.

## Engine cheat-sheet (new pieces; everything else is as in CRESCENT's sheet)

**Post** (`src/engine/post.ts`; one new program variant, used only by MERIDIAN)
- **Pluck warp** (`FxState`): `pluck = 0` (signed UV amplitude for this frame, already multiplied by
  `cos(2π·hz·t)·exp(-t/decay)` on the CPU), `pluckP0 = [x, y]`, `pluckP1 = [x, y]` (control point),
  `pluckP2 = [x, y]` (a quadratic Bezier in screen UV, y down), `pluckN = 1` (antinodes 1-3),
  `pluckW = 0.05` (falloff width in screen-height units; 0.8 = the whole frame), `pluckGlow = 0`
  (a faint jade brightening along the curve). Shader (inserted at `//LENS`, before the shocks): find
  the nearest point on the curve by an 8-segment search (u along the curve, unit normal n, distance d,
  aspect-corrected), then `uv -= n * pluck * sin(N·π·u) * exp(-(d/W)²)`; after the colour fetch,
  `col += jade * pluckGlow * exp(-(d/0.006)²)`. Reset to 0 every frame.
- **Halftone impact** (`FxState`): `tone = 0` (dot cell in logical px; 3), `toneAng = 0.785`,
  `toneBand = 0.16`. In the impact line, when `tone > 0`: inside ±`toneBand` of `impThresh` the tone is
  chosen by a rotated dot screen (`dotR = length(fract(R·fragCoord/cell) - 0.5)·1.414`, `k = step(dotR,
  sqrt(m))` with m the position across the band), so mid-tones print as dots that grow with
  brightness; outside the band the plain two-tone. Only stage A sets `tone`; stage B is the plain
  two-tone. The dev capture checks that the band covers at most 25 % of the frame on every stage-A
  frame (narrow `toneBand` per site if not).
- **`FINAL_MERIDIAN`** = `FINAL` + both blocks + the **shared streak block** (GALE v2 §10.1 item 3, the
  same string as in `FINAL_GALE` and `FINAL_SOLO`, one implementation), compiled lazily and warmed from
  shot 1's `prepare()`; `render()` selects it when `fx.pass === 'meridian'` (SOLO v2's `pass` field
  gains `'meridian'`) and `fx.pluck !== 0 || fx.tone > 0 || fx.streak > 0`. MERIDIAN never sets `lens`,
  `iso`, `impMask` or `echo` (dev assert), so no combined variants are needed. Every other
  frame keeps running the exact original shader.
- **Shared, built once for the set** (GALE v2 §10.1): `fx.streak*` (every whip-tilt and whip-pan, with
  `streakHoleX/Y/R` on the ball so it stays sharp), `fx.fullFrame` and the `FlashBudget` guard (rising
  edges of flash ≥ 0.3, impact ≥ 0.5 and fullFrame; at most 3 per 60 frames).
- Helpers in `meridian/common.ts`: `setPluck(fx, cam, worldPts3, { amp, hz, n, w, tSince, decay, glow })`
  (projects three world points with `cam.toUV`, or takes screen points when `cam` is null);
  `halftoneImpact(fx, stage: 'A' | 'B', a)` (B leaves `tone` at 0); `MERIDIAN_IMPACT` (the two stage
  colour sets).

**Camera and timing** (`src/cinematic/kit.ts`): **the set's only camera helpers**, published once and
used by MERIDIAN, GALE v2 and SOLO v2. No special ships its own lock, zoom envelope or trauma helper.
- `keys(track, t)`: keyed numbers with per-key easing (`[t, value, ease]` rows; eases include `'step'`,
  hold until the next key), for every camera table in this brief. It supersedes `engine/math.ts`'s
  single-ease `keys`, which stays as a one-line wrapper.
- `punch(t, at, amt, tin = 0.05, tout = 0.30)`: an additive zoom envelope (inExpo in, outCubic out), a
  pure function of `t`.
- `holdTrauma(cam, floor)`: call in `update`; trauma never decays below `floor` (held tremors).
- `zoomAbout(cam, wx, wy, sx, sy, zoom)`: sets `cam.x/y` so world (wx, wy) lands on screen (sx, sy) at
  `zoom` (rot 0): `x = wx - (sx - 320)/zoom`, `y = wy - (sy - 180)/zoom`. Used for every lock, crash and
  punch-in.
- **Wrappers, not copies**: SOLO v2's `punch(t, at, amt, dur)` calls `kit.punch(t, at, amt, 0.25·dur,
  0.75·dur)`, and GALE v2's v1 `steps()` lurches become `keys()` rows with GALE's own easing presets
  (`'step2'`, `'vacuum'`, `'blowBack'`, registered on this shared track: GALE v2 §10.2 item 9); neither
  keeps a private zoom curve or lock.
- **Whips use the shared `fx.streak`**: every whip-tilt and whip-pan (shots 3, 4, 6, 7, 8) sets `streak`
  (amount), `streakDX/DY` (direction) and `streakHoleX/Y/R` round the ball, so the ball keeps a sharp
  hole. There is no `whipBlur` (the radial-blur hack is not built).
- `NetMesh`: ZENITH shot 8's spring mesh extracted and generalised (rows x cols, pinned frame, `push`,
  `step`, a `front` projection for the goal-mouth view). When extracting, drop the header comment of
  `zenith/shot8_net.ts`, which uses the banned word. Plus `netLight(mesh, entry, p)` (per-strand light
  by distance from the entry, ramp pearl → jade → emerald) and `ringStrands(mesh, amp, decay)` (per-
  strand transverse vibration).

**Views** (`src/art/stadium.ts`)
- **`DownPitchView.tilt?: number`**, a **shared build item** (built once in `stadium.ts`; used by
  MERIDIAN shots 2b, 5 and 7 and by SOLO v2's 9b constellation crane, which needs it to look down 22 m
  without stretching) (radians, + looks down, − looks up as at the end of 2b; default 0 = today's
  view). `projectDecal`:
  with Z = x - eye.x, X = z - eye.z, Y = h - eye.h: `Zc = Z·cos t - Y·sin t`, `Yc = Z·sin t + Y·cos t`,
  screen `x = cx + f·X/Zc`, `y = horizon - f·Yc/Zc`, `s = f/Zc` (Zc clamped to 2). `horizon` is the
  principal point's y (it equals the horizon only at tilt 0). `drawDownPitch` keeps drawing its stripes,
  box lines, goal and far stand through `projectDecal`; with the horizon above the frame it skips the
  sky band. Pitch only: no yaw, no roll, no dolly-zoom solver.
- `drawFieldBackdrop(..., { lampTint?: number[] })`: per tower 0..1, lamp heads white → jade-white
  [200,255,225] (the glare over the pitch keeps its colour). `drawPylon(ctx, x, y, s, rowTint[4])`: the
  foreground floodlight pylon with per-row tint for shot 4. Both take continuous values from
  `lampTintFor` every frame: never switched per bank, no lamp events.
- `altitudeBackdrop(ctx, st, camX, camY, o)`: shot 4 and 6b's ride-world layers (screentone sky, far
  roofline with its lamp heads, the pre-rendered pitch strip far below, the near roof edge), built on ZENITH
  shot 4's sky-by-altitude skeleton, re-skinned; no stars, no clouds, no moon.
- `upView(ctx, st, o)`: the worm's-eye stadium (sky, roof-rim wedges in the top corners, two towers
  leaning in, their lamp heads tinted by `lampTintFor`), adapted from ZENITH shot 6a's rim-from-below renderer and regraded.

**Art** (`src/cinematic/meridian/common.ts` unless noted)
- `LAYOUT` v2, `ARC` (`arcAt(u) → {x, z, h}`, `U_APEX = 0.72`, `RIDE = { sx: 3, sy: 4 }`,
  `arcSide(u0, u1, n)`, `arcProjected(view, u0, u1, n)`), `BALL_U` (the per-shot u keys).
- `nightInk(ctx, amount, restore?)` (on `inkGrade`'s scratch/mask/screentone canvases, allocated in
  `prepare()`); `nightGrade(fx, o)` (post settings).
- `meridianStroke(ctx, pts, w, o)`: o = `{ head, bristles, stars: { spacing, uBall }, ticks, cross,
  drain, pluck: { amp, phase, nodes }, pulse: { u, w } }`. Calls v1's `threadLine` for the pearl core.
  Bristle streaks come from a cached noise texture per width bucket.
- `auroraHem(ctx, pts, h, phase, a)`: at most 160 rays, drawn from a strip canvas cached per shot,
  folds updated at 30 Hz.
- `loom(ctx, from, pins, t, o)`: shot 2a's string web: 10-12 straight threads from anchor points (eyes,
  fingertips) to screen pins, each drawn by `meridianStroke` in its thin preset (its `threadLine` pearl
  core), a pearl stitch-star at each pin; `o.shoot` (0..1 reach), `o.pluck` (per-thread canvas
  shiver), `o.release` (fade from the hands). Built from the stroke, not an aura system: no tendrils,
  no rising particles.
- `skyEye(ctx, cx, cy, w, h, open, look, t)`: `open` 0 (hairline) → 1; values below 0 squeeze it into
  the needle's eye vesica; `look` slides the pupil glint. Lids cached per size bucket.
- `needleShaft(ctx, eye, tip, w, t)`; `jadeSpear(ctx, x0, y0, x1, y1, w, amp, phase, nodes)`;
  `threadSag(pts, grab, sag)` (geometry through the grab point).
- `stitchRing` + a `StitchRings` list (expanding,
  squashable running-stitch rings, MERIDIAN's ring style); `starChart(ctx, pts, every, labels)`;
  `readout(ctx, x, y, text, a)`; `needlePupil(ctx, x, y, s, k)`; `needleIris(ctx, cx, cy, p, still)`
  (shot 1's exit: the vertical vesica grown to cover the frame, a 6 px jade rim with a travelling
  glint, the cached 2a still drawn inside); `stringFrame(ctx, goal, amp, phase)`
  (posts and bar as plucked strings with 3 ghosts); `lampTintFor(head, pts, light)` (the passive
  lamp-head tint: smoothstep of screen distance to the stroke or ball, 1 at 60 px → 0 at 260 px, times
  the stroke's light). Shot 5's plumb line is a `threadLine`.
- Kept from v1: `threadLine`, `crossStitch`, `needlePoint`, `stitchTitle`, `TITLE_STYLE`, `PAL`, `HEX`,
  `JADE_FLARE`, `FADE_RGB`. **Moved to the shared set:** `cachePuppet` is replaced by the shared
  `PuppetCache` (today in `solo/common.ts`; moved to `kit.ts` as GALE v2 §10.0 lists it, and used by
  all three v2 specials), and MERIDIAN's `nameCard` copy is deleted in favour of the one shared
  `nameCard(ctx, t, o)` in `kit.ts` (which also replaces the copies in `gale/common.ts` and
  `solo/shot7_mark.ts`), called as `{ title: 'MERIDIAN THREAD', line2: 'No.10 > No.7 · ASSIST', score:
  'CAM 1 - 0 RIV', style: 'meridian' }` (the stitched title). Removed: `PAGE`, `MangaPage`, `PATH`, `placeholderShot`, `meridianGrade`
  (replaced by `nightGrade`). Not built: `inkAura`, `turfSeam`, `lightShafts`, `whipBlur`.
- **Ball**: `renderBall(r, spin, heat, outline, 'pearl', squash, { seamGlow })` in `src/engine/pixel.ts`:
  panel-boundary pixels lit jade at r ≥ 10 (the cache key includes it). Used at r 12.

**Particles** (`src/engine/particles.ts`)
- `PK.Stitch`: a 3-6 px dash oriented along its velocity with a 2 px cross at its head, ramp `'jade'`
  (light-stitches at every impact, sparks at the grab). Fibres are short slow `PK.Streak` in `'jade'`.
  Confetti is `PK.Confetti` with `color` set (jade, pearl, red). Cap 1500.

**Audio:** `twang`, `bow`, `eyeOpen`, `fray`, `harpGliss` (see Sound design).

**Files:** `src/cinematic/meridian/`: `index.ts`, `common.ts`, `shot1_sign.ts` … `shot9_harp.ts`, and
this brief as `SPEC.md` (the v1 SPEC and `docs/skills/MERIDIAN_THREAD.md` are replaced by it).

## Quality bar (what reviewers check)

1. **It goes high.** The ball is visibly in the air in shots 3-8; in shot 4 it passes beside a pylon's
   lamp array, in shot 5 the whole box is far below it. Nothing about the pass is flat.
2. **Ball showcase.** At least 48 px for most of shot 4, 60 px in shot 5, 48-70 px in shot 7, about
   60 px on No.7's forehead; seams glowing jade; always the brightest point with an ink outline and an
   ink halo; never lost in particles.
3. **Power.** Stack A has at least 10 of its 12 layers, B 11, C 13. At least 6 boom cues at 0.9 or more,
   10 shock sites, 5 impact-frame stages, `cam.hit` up to 1.0, roar three times.
4. **Breath and release.** Shot 5 holds rate 0.06 for at least 1.0 s with the crowd ducked to 0.15; every
   release after it is bigger than the one before (TWANG < header < harp + GOAL!).
5. **Opponents overpowered.** The Tower strains in the tug-of-war (TJ2) while the ball keeps creeping,
   then is flung in a readable still (TJ3, the line, "TWANG!"); the keeper visibly lashed by the line
   (one forearm wrapped by a jade loop) and spun 1.5 turns down onto the turf at the near post, never
   into the netting. The line shows fear, not jokes. No comic undercut: no twinkle, no dizzy sit, no
   plaster, no `?`/`!` lettering.
6. **Teamwork reads.** The Meridian Sign lands on No.7's eye (shot 1); the reel-in pours No.10's light
   into No.7's header (shot 8); the bridge joins them (shot 9b); the diptych.
7. **Stills read at 320 x 180**: who, what, which direction. The arc reads as one curve across every cut
   and always runs left to right. The Sky Eye reads as light (a lantern), not as a face.
8. **Night Ink metrics** (6 fps film, `tools/metrics.py`): deep shadow 40-50 %, hot pixels 3-5 %,
   saturated light at least 2.5 %, at least 15 violent changes. No long blow-outs: every jade glow sits
   on an ink under-stroke.
9. **It is clearly MERIDIAN THREAD**: jade/mint/pearl on night-ink, the stroke, stitches, the eye, the
   needle, the bowstring, the harp, manga panels, the pluck warp, the halftone print, the plucked and
   bowed string. And none of the "never uses" list: camera `rot` 0, no dolly zoom, no fingertip
   freeze, no black/white impact, no crimson, cyan or violet, no fire, moon or clouds, no torn or moved
   net, no ripped turf and nothing opening in the turf, no follow-spot, no light shafts, no lamp-bank
   switching, no crash pull-out, no dead stop, no double-fist punch, no keeper in the netting, no
   finger snap, no `timeStop`.
10. **Pixel art.** No.10 and No.7 only from studio frames (integer, boxed, or inside a camera zoom;
    fractional only in fast moves); face crops at integer scale; the Tower's studio frames only in
    shot 6.
11. **Football is right.** The outside of the right boot, a wide plant, clockwise spin bending right
    onto No.7's near-side run; No.7 onside; the header goes across the keeper into the far top corner.
12. **Clean cuts**, each exactly as listed: the needle's-eye iris, smash cut on the tick (after the
    climb up the star chart), whip-tilt, mint whiteout, hard reverse cut, whip-tilt, push-off motion
    cut, net-touch motion cut, fade. Every whip uses the shared `fx.streak` with the ball sharp.
13. **Photosensitivity.** The budget table holds under the shared FlashBudget definition (at most 3
    events in any 1 s; 3 only in 13.84-14.84); the halftone band holds at most 25 % of the frame and
    stage B has no dots; the FlashBudget dev check passes.
14. **Performance.** `nightInk` once per frame; at most 3 live puppet renders per frame; particles under
    1500; the hem at most 160 rays from a cached strip; the net 30 x 14; every scratch canvas, the
    `PuppetCache`, boxed studio cache, the shot-4 pitch strip and shot 1's cached 2a still built in
    `prepare()`; `FINAL_MERIDIAN` only on
    frames that need it.
15. **The playground test.** Shown once to a child, the retelling includes "so high", "the eye", "TWANG",
    "the header" and "his friend". It must never be "the giant caught it".

## Risks and fallbacks

1. **The tilted view (shots 5, 7, end of 2b).** It is the one new projection. Prototype shot 5 first
   and check the computed picture (ball (320, 189), X (336, 248), the line at y 306-352). Fallback (the
   judges' lens shift): tilt 0 with the principal point moved down; it frames the ball, the X, the
   keeper and the goal but not the defenders under the ball, so shot 5 then loses the craning line (it
   is shown in shot 4's slow pass and in 6a). The end of 2b tilts up (−0.30); its fallback is the lens
   shift alone (tilt 0, the principal point sliding 120 → 434, f 560), with the top of the arch
   stretched.
2. **The arc reads as a cute rainbow.** It is one colour family on an ink under-stroke, with bristles,
   stitches and ticks, under a dark sky, and it acts on the world (the TWANG, the bowstring, the lash).
   If it still looks soft, thicken the ink under-stroke and the cross-stitches; never add colours.
3. **Too close to ZENITH's height.** The camera rises above the floodlight lamp heads (32 m) **only
   while looking down with no sky in frame**: shot 5 (h 380, tilt 58 deg, the true horizon about 300 px
   above the frame) and the top of shot 7 (h 360 → 60, tilt 58 → 45 deg). Every frame that shows sky is
   shot from at or below the lamp heads; the sky is screentone (no stars, moon or clouds), and every
   high frame has a stadium structure in it.
4. **The Sky Eye is too creepy for the youngest players.** It is jade and pearl, lit from inside like a
   lantern, opened to 70 % at most, it looks at the defenders and never at the viewer, and it closes into
   the needle. Playtest: kids should say "whoa", not look away. Fallback: lids to 55 % and no lashes
   outside the almond.
5. **"The giant caught it."** The ball never stops: through the 0.30 s tug-of-war it keeps creeping
   forward at no less than about 30 % of its apex speed (about 28 px on screen against the held
   camera, spin turning, stitch stars popping), and the Tower is drawn straining (TJ2), never grinning
   or holding it in triumph; the strum insert is a ×2 bust on its own sound; the TWANG is bigger than
   anything before it; the ball visibly whips out of the apex at 1.34. Playtest: kids should say "he
   pulled and pulled but it kept going".
6. **The fantasy leap.** The Tower jumps 25 m. It is anime: sell it with ink speed lines, the dust plume
   far below and TJ1's arch, and never show the take-off from the ground.
7. **Motif creep.** Reviewers reject any frame with two giant shapes as subjects or more than two
   supports. The hem never exceeds 160 rays; no sky dome, no seam pucker, no extra auras.
8. **No7 Header is on the critical path** (H2/H3 carry the peak). Draw it second, review at 2x beside the
   keeper puppet. Fallback: the first-time half-volley on Receive R5/R6 (Studio art).
9. **The keeper lash turns comic.** He is at full stretch at 150 px in `gkDive`, one glove reaching
   (never frozen), the lash is a defeat played with twang + crack + boom, and he slams down onto the
   turf in `sprawl` with dust, his wrist still bound by the fading loop: not dizzy, never in the
   netting.
10. **Fill rate.** `nightInk` (3 full-frame composites) + the additive hem + the pluck warp shader + bloom
    (+ 12 streak taps on whip frames).
    Cache the hem and bristles, run `FINAL_MERIDIAN` only while `pluck`, `tone` or a whip's `streak` is set, and test on a
    low-end phone at DPR 2.
11. **Runtime and pacing.** 16.8 s (ZENITH 17.2, CRESCENT 15.3). If it must shrink, cut 9b to 0.9 s and
    shot 7 to 1.0 s; never cut the apex hang or the TWANG.
12. **Identity drift with GALE v2 and SOLO v2.** Their briefs have landed, and the identity table and
    never-list are synced to the shared set table (see Set-critic revisions). GALE owns air, the low
    straight line, the blow-back, the keeper's punch and the dead stop with a grin, and the
    side-netting tangle; SOLO owns the turf (and anything opening in it), the dark, beams, the spot,
    afterimages, the finger snap and every floodlight-bank event. Keep MERIDIAN's floodlights on and
    passive (lamp heads only catch the arc's light). GALE v2 §1.1 prints an earlier v2 MERIDIAN column
    (the "pluck", a 0.12 s hang) and SOLO v2 §1.1 the pitch-era one; both take this brief's column at
    their next sync.
13. **Layout ripple.** `LAYOUT` v2 moves No.10 deeper and No.7 wider and staggers the line: the field
    scenario, the command preview and the result view must all read `LAYOUT` and `ARC`.

## Set-critic revisions

Applied after the set critic compared the three v2 briefs. Durations, the 9 shots, 16.8 s, SP 70 and
the 24 + 3 frame count are unchanged.

1. **Tug-of-war, not a dead stop** (6b, TJ2; GALE v2 shot 7 owns "ball stopped dead while the opponent
   grins"). The ball is no longer dragged back or stopped: through the 0.86-1.16 sag it keeps creeping
   forward (speed eased to about 30 %, never lower; new shot-6 `BALL_U` keys 0.721 → 0.744 before the
   slingshot), the camera's x lock lets go so the creep reads (~28 px), the V sags and the light drains.
   TJ2 strains (gritted teeth, squeezed eyes, the thread biting his glove). Risk 5 and the playground
   test updated.
2. **Turf seam deleted** (shot 3; SOLO v2's light gash). Beat, VFX, stitch ticks, Stack A's seam and
   grass threads, `turfSeam` and its supports entry are gone; the loft's ground beat is Stack A's flat
   stitched ring at the plant.
3. **Keeper** (7, 8, 9a, 9b, result; GALE v2's `gkPunch` and `netTangle`). The existing `gkDive`
   replaces `flyingPunch`: one glove reaching across the bead's path, never frozen. The lash wraps that
   forearm and spins him 1.5 turns down onto the turf at the near post, the wrist bound by a fading
   jade loop (`plucked` → `sprawl`); he never enters the netting. 9a 0.12 is a turf impact with dust.
   `flyingPunch` and `tangled` deleted.
4. **Shot 1 exit** (ZENITH shot 2's crash + flash). Now the needle's-eye iris: a push to 2.0 on the
   needle pupil while its jade vesica opens to frame size onto 2a and the stroke threads through
   (`needleIris`); flash ≤ 0.25, so old F1 leaves the budget. The 4 → 5 whiteout is mint/jade out of
   the ball's core instead of pearl.
5. **2a is the loom** (ZENITH shot 2 re-skinned + GALE-like tendrils). Shot 2 is renamed **The Loom**
   (`shot2_loom.ts` / `shotLoom`). A chest-up front bust; 12 taut jade threads from his eyes and
   fingertips pin the lamp heads, the roof rim, the crossbar and No.7 (the last two seen in 2b), built
   with `meridianStroke`/`threadLine` (`loom()` replaces `inkAura`); the pluck warp plucks the web on
   each tick (plucks D4, F#4, A4). GZ2/GZ2b/GZ3 are busts on GALE's WindHand base. The monument stays
   LF4 in shot 3. Shot 8's reel-in flickers the loom's No.7 thread instead of an ink aura.
6. **Floodlights passive** (SOLO v2's bank events). No bank flips, clunk ticks, 220 px flares, TWANG
   lamp flare or GOAL! "back to white"; lamp heads catch jade as a smooth function of distance
   (`lampTintFor`), flares ≤ 120 px. Shot 5's 12 light shafts became one pearl plumb line from the ball
   to the X (which also carries the plan).
7. **The strum** (PL1/PL2; SOLO's snap). Whole-hand hook at chest height, pulled down and across past
   the hip with a 1 px motion arc; a soft `zip` replaces the dry tick; busts on the WindHand base at ×2
   in a 200 x 210 panel. "Pluck insert" became "strum insert" throughout.
8. **2b exit** (GALE's blow-back). The 0.35 s outExpo crash pull-out is replaced by the climb: crane
   (h 16 → 30) and tilt up (0 → −0.30) with a lens shift (principal point 120 → 227) and f held at 560,
   from the defenders to the 26 M apex tick (picture recomputed), then the hard tick and the smash cut.
   The opening table's distance move now reads as vertical.
9. **Camera height rule.** Risk 3 lets the eye rise above the 32 m lamp heads only while looking down
   with no sky in frame (shot 5 at h 380, the top of shot 7); shot 5's lamp-flare line is deleted.
10. **Shot 4 fear.** The `?` → `!` gag is gone: `craneUp` heads, open mouths, faces under-lit jade by
    the hem, one pluck per defender; the Tower alone is unafraid.
11. **Photosensitivity.** Counted with the shared FlashBudget definition (flash ≥ 0.3, impact ≥ 0.5,
    fullFrame, each signal's edge counted): 11 events. The GOAL! flash (14.10) and diptych slam (16.10)
    count; the whiteout and the 9a ink lift are flagged `fullFrame`; the worst window, 13.84-14.84,
    holds 3 (the limit). Halftone dots stay in the threshold band (≤ 25 % of the frame); stage B is a
    plain two-tone.
12. **Shared engine.** Every whip uses the shared `fx.streak` with a hole on the ball (`whipBlur` not
    built; `FINAL_MERIDIAN` carries the streak block, selected by `fx.pass === 'meridian'`). `keys()`,
    `punch(t, at, amt, tin, tout)`, `holdTrauma()` and `zoomAbout()` in `kit.ts` are the set's only
    camera helpers (SOLO's `punch` wraps `kit.punch`; GALE's `steps()` lurches are `keys()` rows with its
    `'step2'`/`'vacuum'`/`'blowBack'` presets). `cachePuppet` → the shared `PuppetCache` (in `kit.ts`);
    one shared `nameCard` (`style: 'meridian'`); `DownPitchView.tilt` is a shared build item (SOLO 9b).
13. **Cast.** The Tower is the set's one big captain: the same Rivals model (armband, 1.3x bulk,
    gloves) is SOLO v2's defender D, SOLO's optional fear face is drawn on TF3's head, and TF3 is a bust
    under GALE's convention (×2 in 6a).
14. **Identity table and never-list** re-synced to the shared set table (GALE: isobar impact, the §1.3
    camera, its opponents, 16.7 s / 75; SOLO: beam impact, cone-masked beam impact (+ echo), the glue
    cam / arc / shadow crane-rush, 16.4 s / 65). Dropped "a keeper pinned to the net" and "a wall of
    defenders whose shadows swallow the hero"; added GALE's dead stop + grin, double-fist punch at the
    lens, side-netting tangle (and the blow-back) and SOLO's light gashes in the turf and floodlight
    bank events (and beams / shafts). The table now carries the shared table's full row set (Element,
    Own transition, Keeper beat and False defeat added; "Space" and "Energy shape" renamed), and the
    GALE cells not named by the critic follow GALE v2 §1.1 (palette, thunder wall, lens + iso with no
    front block, digit clacks, the goal 2.8 m behind its line). GALE v2 §1.1 still prints an earlier v2
    MERIDIAN column (the "pluck", a 0.12 s hang) and SOLO v2 §1.1 the pitch-era one; both take this
    column at their next sync.
