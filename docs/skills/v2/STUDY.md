# STUDY: why ZENITH METEOR and CRIMSON CRESCENT feel powerful, and why GALE HAMMER, MERIDIAN THREAD and SPOTLIGHT SOLO feel simple

Owner feedback this answers:
1. "the shot of gal hammer look so simple and not powerful ... more powerful ... great effect, great camera movement ... good cinematic"
2. "the pass meridian thread should [be a] good pass high, not flat in the ground ... the pass flat in the ground makes the cinematic scene look so simple. Also the spotlight looks so simple, not like a powerful dribble skill. Make sure all the 3 skills have good cinematic moves and look as powerful and scary as they can with good visual effects, cinematic scene, camera move, and great ball showcase."

## 0. Method and material

Paths below were relative to the design team's scratch folder (captures, sheets and tools are not in the repo).
The team's earlier strips (`scratchpad/gale_diag/*_strip.png`) were 2.5 fps and partial; these replace them.

- Build: the current tree, built once (live, `vite build`) in `study_ws/` (this folder).
- Filmstrips: every special captured at **6 fps over its full length** with `tools/capall.cjs`
  (a resume-safe variant of the team's `capseq.cjs`; 640 px stage, page-clip screenshots).
  Raw frames: `film/<id>/g_<t>.png` (zenith 104, crescent 92, gale 68, meridian 66, solo 66).
  (The first 1-4 frames of zenith, gale, solo and crescent came from an earlier 972 px-stage attempt
  of the same build; sheets and metrics resample every frame, so this does not matter.)
- Contact sheets (`tools/filmsheet.py`; every tile is labelled `S<shot> <global t> (+<local t>)`
  and a coloured bar marks each cut):
  - `sheets/zenith_6fps.png`, `sheets/crescent_6fps.png` (8 columns),
  - `sheets/gale_6fps.png`, `sheets/meridian_6fps.png`, `sheets/solo_6fps.png` (6 columns),
  - `sheets/compare_keyframes.png`: four key frames of each special side by side. **Look at this
    one first**: the top two rows are full of huge glowing energy shapes, impact frames and big
    silhouettes; the bottom three rows look like ordinary match frames.
- Code read: every shot file of all five specials (cameras, `rate()` curves, cues, fx), `timeline.ts`,
  `camera.ts`, `post.ts`, `kit.ts`, `audio.ts`, the three skill briefs and CRESCENT's SPEC.
- Picture metrics: `tools/metrics.py` over all frames (320x180), table in section 4.

## 1. TL;DR

- ZENITH and CRESCENT win on six things: a **dark world with one hot, saturated energy shape**
  (fire column, crescent blade) that is **enormous on screen** even though the ball is only 20-29 px;
  **every contact is a stack of 8-12 effects** (hit-stop at 0.03, trauma 1, punch zoom, a two-stage
  impact frame, double shock ring, rings, sparks, focus lines, CA, radial, flash, layered boom/kick/crack);
  a **long frozen near-silent breath right before each strike** and a violent release; a camera that
  **travels** (crash zoom to 3.4x, 840-2950 px tilts/rides, 180 deg roll and whip-roll, POV at the
  lens, top-down); **every shot is a new place**; and **opponents visibly overpowered** (keeper burned
  and blown into a tearing net, glove ripped off).
- The weak three are well crafted but their **briefs told them to be smaller** ("one tier below",
  "a notch below every shot in raw power", "smaller than every shot", "the ball rolls ... never rises
  more than about 4 px", rings/impact/roll/sky/roar banned) and their signature effects all **subtract**
  (mute, desaturate to ink, switch the lights off).
- Measured: ZENITH has 29 violent frame changes (flash/impact/whip) in 104 frames, CRESCENT 8 in 92;
  GALE 6, MERIDIAN 11 (mostly paper flashes and panel cuts), SOLO 5. ZENITH/CRESCENT spend 43-52 % of
  pixels in deep shadow with 2.4-4.9 % hot pixels; GALE has 11 % shadow (flat daylight), SOLO 69 %
  shadow but only 0.5 % hot pixels (murky, no light source).

## 2. ZENITH METEOR (17.2 s, 8 shots): what each shot does

Hero scale reference: the studio No.10 is 98 px tall at 1x. "SC 2.55" = 250 px on a 360 px frame.
Ball reference: `drawBall(r, D)` = radius r x D on screen before camera zoom.

| # | Shot (dur) | Camera (numbers) | Hit-stop / speed ramp | Hero framing | Ball staging | VFX layers | Sound | Exit |
|---|---|---|---|---|---|---|---|---|
| 1 | Cut-in (1.75) | zoom 1.00 -> 1.05, roll -0.01 -> +0.012 | none | **eyes crop at 12x** (face ~400 px wide), slanted panel slides in 0.22 s (outExpo) | none | crimson radial burst bg, 2 layers of focus lines, speed streaks in panel, embers, eye sparkle + lens flare at 0.5, title slammed letter-by-letter 66 px | stinger + whoosh, shing on glint, boom 0.5 on title, whoosh out | panel exits inExpo + flash 1.0, impact frame on t<0.05 |
| 2 | Power-up (2.35) | low angle; push 1.04 -> 1.16 over 1.9 s with roll -0.03 -> +0.025; **crash zoom 1.16 -> 3.4 onto the eyes in 0.35 s (inExpo)**; constant tremor trauma 0.25-0.60, shakeAmp 6 | none | **full body, front, SC 2.55 (~250-290 px), low angle**, feet at y 338 | at his boot, r5 x 2.55 (~25 px), crackling electric arcs 38 px long, gold motes spiral in | 3 tinted aura silhouettes (1.09/1.05/1.02 scale, additive, flicker), edge flames from silhouette edges (up to 36/frame), light pillar 40->110 px wide, ground glow pool, **pitch cracks grow**, debris floats up, dust ring, upward streaks, hair ignites, eye flash + lens flare, bloom 0.9->1.1, CA ramps to 0.012 on the slam, radial 0.12 | rumble 2.2 s + crackle, whoosh rising, shing at eye flash, whoosh into the slam | inExpo flash 1.0 on the crash zoom |
| 3 | Flick-up (1.35) | grass-level side view; hold, then **whip-tilt up ~840 px in 0.73 s** (y 200 -> -640, inCubic, zoom 1 -> 1.1, roll 0 -> -0.06) | **warp [HIT 0.14 s at 0.04] then [0.12 s at 0.4]** | drawn kick + jump frames at 2x (196 px), whole body; he launches after the ball (rise 1100u + 1600u^2 px) | r5 x 2 = 20 px, launched at vy -1500; 16-pt fire ribbon width 26 (halo 62 px) | **impact frame 0.07 s full + 0.05 s at 0.6 (black/white)**, focus lines that flip black/white, shock ring (r 1.6/s, s 0.05), rings white+gold, 40 gold sparks, 26 grass chunks, dust burst, aura silhouettes, speed streaks upward, radial blur 0.06 | whoosh, **kick 1.2 + boom 0.9** on contact, whoosh 0.8 rising | camera leaves the pitch |
| 4 | Ascent (1.8) | camera **rides the ball 2950 px straight up** (outQuad), roll sway 0.02, zoom 1.08 -> 1.0; trauma 0.3 x speed | none (real speed) | No.10 rockets up behind/left at 2x with a 2-layer aura ribbon 36/16 px | **ball is the centre of frame the whole shot**: r6 x 2 = 24 px + 320 px fire ribbon (width 30, halo 72 px) + meteor flames | sky gradient by altitude (purple -> navy -> black), floodlight towers passing, **cloud punch at y -1300: 70 smoke puffs, ring 10 -> 360 px, shock, boom**, clouds parted (push 140 px), stars fade in, moon rising, 10-50 speed streaks | long whoosh 1.5 s + second whoosh; boom 0.7 on cloud punch | moon enters at the top |
| 5 | Zenith (2.6) | slow drift, zoom 1.02 -> 1.10, **punch +0.18 on contact**, then **leans 110/120 px toward the meteor and pulls out -0.2**; shakeAmp 22, cam.hit(1) | **warp [0.7, 0.55 s at 0.42] (time slows), [HIT 0.2 s at 0.03], [0.15 s at 0.35]** | rim-lit **black silhouette against a 232 px full moon**, JS 1.5 (~147 px), somersault (spin through a full turn), crimson aura copy at 1.1x | ball hangs in front of the moon with an **eclipse halo + rotating corona (18 motes) + 12 sun rays 60-160 px**; motes sucked in; after the hit r7 x 2 = 28 px, accelerating to 2600 px/s, ribbon width 46 (halo 110 px) | sat 1 -> 0.55 + blue tint during the time-stop (colour returns on the hit); **two-stage impact: 0.07 s black/white, then 0.09 s INVERTED red/black (impA [255,54,40])**; two shock rings (0.07 and 0.04); rings white 8->260, gold, aura; 70 sparks + 40 fire blobs; focus lines 110; clouds below blasted outward | whoosh, **timeStop(1.3) silence-drone**, then **boom 1.4 + kick 1.4 + crack 1** on contact, roar 1.1 after | inExpo flash 0.9 |
| 6 | Descent (2.14) | (a) **POV from the pitch, meteor falls at the lens**: zoom 1 -> 1.08, trauma 0.2 -> 0.8; (b) wide field, cam x 860 -> 1060, zoom 1.32 -> 1.42, trauma 0.22 | none | defenders as puppets (k 0.42), small | (a) **ball grows from r 4 to r 22 at 2x (16 -> 88 px across)** with a flame plume; (b) skims in low, scorching a burning line in the grass | (a) burning radial sky, stadium rim seen from below as a dark ring, ember streaks at the lens, radial 0.05; (b) red glow pool on the pitch, **scorch trail + grass fire**, **two defenders jump to block and are blasted spinning** (ring, 30 sparks, shock, impact 0.85 for 0.05 s each), speed streaks | roar, whoosh 3000 -> 300 Hz, roar + crowd; boom 0.8 + crack per defender | inExpo flash |
| 7 | Keeper (1.95) | close side view; **push 1.0 -> 1.4 onto the gloves** while trauma rises 0.35 -> 0.8; then pull back -0.25 and truck +60 | **warp [CATCH 0.1 s at 0.03], [BREAK 0.08 s at 0.05]** | keeper puppet at k1 x 1.9 (~150 px), big | ball r6 x 1.9 (23 px) **grinds in his gloves for 1.1 s**, jittering ±1.5 px, spin arcs, gloves glow and smoke | sparks spray back at 3/frame, smoke from gloves, **skid dust + grass from his boots, skid marks carved**, net mesh behind bulges on the break; impact frame on catch and on break; 2 shock rings; speed streaks after the break | boom 1.0 + crack on the catch, **strain() over the struggle**, boom 1.3 + crack + whoosh on the break | inExpo flash |
| 8 | Net / Goal (3.3) | reverse angle from behind the goal; push-in 0.1 after arrival, release on GOAL | rate 0.15 for 0.08 s on arrival | keeper slams the mesh first (left) | **ball comes at the lens through the net**: 30 x 20 spring-mesh net pushed up to 205 px toward camera, strands snap with white sparks, smoke + fire grinding | keeper dent, net tearing, post shake, smoke, fire, **GOAL! slam 132 px**, confetti 4/frame, crowd camera flashes, shock at GOAL, name card | roar, kick, **boom 1.2 + strain**, crack x2 (strands), crowd 3.2 s + boom + stinger, whistle | fade to [8,4,14] |

**Pacing.** 8 cuts in 17.2 s; the flick lands at 3.9 s and the volley at 8.6 s (50 %), so half the film
is build-up and half is the meteor's consequences, each one a bigger hit than the last (defenders,
keeper, net). In code: **7 cam.hit() sites up to 1.0, 9 boom sites (0.5-1.4), 7 impact-frame sites,
9 shock-ring sites**; on film, 29 violent frame changes in 104 frames.
Shots 1, 2, 5, 6 and 7 close on an inExpo white flash (0.85-1.0) and shots 3, 4 and 8 open on one, so
cuts land like punches.

**The escalation is spatial.** Pitch (shot 2-3) -> stadium falling away (4) -> above the clouds (4)
-> space and the full moon (5) -> back down at the lens (6a) -> skimming the grass (6b) -> the
keeper's hands (7) -> through the net into the lens (8). Every shot is a new place and a new
camera axis (front low angle, side, vertical ride, silhouette, POV up, wide, close side, reverse).

## 3. CRIMSON CRESCENT (15.3 s, 8 shots): what each shot does

| # | Shot (dur) | Camera (numbers) | Hit-stop / speed ramp | Hero framing | Ball staging | VFX layers | Sound | Exit |
|---|---|---|---|---|---|---|---|---|
| 1 | Cut-in (1.7) | zoom 1 -> 1.05 + pulse 0.025 on glint, roll -0.015 -> +0.02, hit 0.32 | none | eyes close-up **starts upside down and rotates upright with a crescent-shaped panel** (swing ~120 deg) | none | indigo -> crimson bg, silver focus lines, huge rotating crescent moon shape, title revealed by a **sweeping crescent of light** | stinger, shing, whoosh on the sweep, boom 0.4 | panel spins away, flash, radial 0.22, impact 1 frame |
| 2 | Read the cross (1.7) | Dutch angle -0.035 -> -0.06; **dolly zoom: background 1.0 -> ~1.7 while he stays the same size**, lurching +0.1 on each heartbeat; ends with push 0.22 + roll kick 0.16 onto his eyes | rate 0.35 for 0.08 s at the eye flash | **chest-up, low angle, SC 3.4** (feet at y 505, off frame), looking up | the cross falls in slow motion from top-right to just above his hair; its shadow crosses his face | crimson + silver edge flames (thin), crimson hair glint, desaturation 0.9 -> 0.5 + cold tint with the heartbeats, shock ripple per heartbeat (s 0.012), CA, radial | crowd bed 0.07, **two heartbeat booms 0.35**, shing, whoosh | smash cut on flash |
| 3 | Lift-off (1.4) | grass level, smash-cut punch-in (+8 % kick-back in 0.14 s) while panning 26 px off the cross, **then rolls with his rotation**: rot = -FOLLOW x spin, reaching ~70 deg; push-in Z0 -> Z_END; parallax layers; shakeAmp 12, hits 0.5 / 0.55 | hit-stop on the plant (warp [PLANT, HS_LEN, HS_RATE]) | Bicycle frames at 2x (196 px), pinned on the contact pixel, hip flies 130 px up | cross drops into frame top-right to the exact point shot 4 holds it | **crescent-shaped crater** with glowing crimson rim, grass chunks, ring, dust, crimson ribbon on the rising boot, silver speed lines, roll-speed arcs + radial blur | crowd, kick 0.6 + boom 0.5 + crack on the plant, rising whoosh | **roll-match cut** into shot 4 |
| 4 | Inverted sky (1.9) | camera rolled ~180 deg (ROLL -PI + 0.7 -> -PI - 0.07, still turning ~27 deg through the freeze); push-in 0.91 -> 1.19; breath on the heartbeat 0.035; snap punch 0.09 | **rate 0.55 -> 0.08 in 0.16 s, held 0.08 to 1.75, then 1.2** | Bicycle frames at 2.4x, upside down, hip at screen centre; the coil trembles BK8 <-> BK8b every 0.3 s | ball hangs just above his raised foot with **lock-on crescents** circling it | **the whole stadium hangs upside down** (stands, 2x crowd, ad boards, floodlights pointing down, pitch overhead); dust, embers and crowd flashes frozen as points; desaturated indigo except the aura and ball; crimson charge runs down the leg; glint; time-stop negative frames (impact) | **timeStop(1.75)**, one lub-dub heartbeat, strain, shing, whoosh into the snap | snap flash into shot 5 (exact framing match) |
| 5 | The crescent (1.7) | rolled -PI -> **whip-roll back upright in 0.32 s (lerp to -2PI, inOutCubic)** with pull-out 1.05 -> 0.82 and +0.1 overshoot; punch +0.12 on HIT; whip-pan out 300 px in the last 0.1 s (motion cut) | **rate 0.03 for 0.18 s at HIT, 0.22 until release (0.92), then 1** | 2.4x, coil -> 3-frame smear -> STRIKE -> tumble | ball r6 x 2 = 24 px at zoom 1.19 = 29 px; **a crescent of fire R ~95+ px, 32 px thick** carved by the boot; after release a crimson comet (ribbon + flames) | **slash split fx.cut 0.024 along the crescent arc with glow**, two-tone impact (crimson/black, silver/indigo), 2 shock rings, crescent embers 70-220/s, 90 crowd camera flashes popping, grade warms back from cold, radial on the whip | whoosh, **boom 1.3 + kick 1.3 + crack 1**, whoosh on the whip-roll, boom 0.6 + whoosh on release, roar | **whip-pan motion cut** (no flash) |
| 6 | Crescent orbit (2.0) | **new axis: top-down** at zoom 1.95 -> 1.8, banked 1.0 rad, then rises for a reveal (REV_Z) | 3 hit-stops at 0.15 / 0.1 / 0.15 rate on each defender | top-down figures | comet on a banana path, **two crescent blades orbiting the ball** scorch curved lines in the grass; darts at 3x speed at the end | 3 defenders knocked spinning (hits 0.42-0.6, ring, dust), burnt crescent ignites tail -> head, zoom-blur streak along the heading, cold grade | whoosh + roar + crackle, shing, crack + boom per defender, rumble on ignition | ball reaches the keeper |
| 7 | Fingertips (1.7) | chase cam at keeper height, Dutch angle, push-in during the near-miss, **whip-pan with the ball** after the rip; parallax + depth-of-field by zoom | **rate 1 -> 0.06 (0.2-0.36), held to RIP 1.0, 0.012 hit-stop, then 1** | keeper puppet k1 x 2, full stretch dive | fingertips a few px from the ball; a blade whirls between them; **the glove is torn off and spins away** | silver sparks blade-on-glove, slash split 0.012 around the orbit, shocks, CA, desaturation by freeze | timeStop, shing, strain, **crack 1.2 + boom 0.9** on the rip, whoosh, roar | whip |
| 8 | Back to goal (3.2) | front view, he drops into frame; zoom 1.06 -> 1.0 + punch; **snap-zoom onto his eyes for the glint (0.3 eyeZ)** | hit-stops [LAND 0.06 at 0.25], [NET 0.09 at 0.08] | **Land frames at 2.4x in the foreground, facing camera, back to goal** | ball rips into the net BEHIND him | crescent crack under his feet, dust ring, **crescent burst of crimson light back-lights him** (tinted rims), net bulge, keeper thuds down, GOAL!, confetti, crowd flashes, name card | kick 0.9 + boom 0.55 on the land, **boom 1.3 + crack + strain on the net**, crowd 2.2 + stinger, whistle, shing on eye glint | fade |

**Pacing.** 15.3 s, strike at 7.15 s (47 %). Two long time-freezes (shot 4 at 0.08 for 1.6 s, shot 7
at 0.06 for 0.64 s) are the "breath" that makes the two releases violent. In code: 13 cam.hit() sites,
12 boom sites, 13 shock-ring sites, 13 focus-line bursts, 5 impact-frame sites, 2 slash splits.

**The escalation is rotational.** Upside-down eyes in the cut-in -> Dutch angle -> rolling camera ->
the stadium fully inverted -> whip-roll upright -> top-down -> Dutch chase -> upright front. The
signature idea is planted in shot 1 and pays off in shots 4-5: the audience is taught the language.

## 4. The power recipe: what ZENITH and CRESCENT do that the other three do not

These are the techniques both loved specials share. Each is measurable in the code and visible in the
filmstrips. The three weak skills break most of them, and the briefs told them to (section 5.0).

1. **Dark world, hot subject.** Both live at night with crushed, desaturated backgrounds (ZENITH
   shot 5 sat 0.55 and a blue tint during the time-stop; CRESCENT shots 4-6 grade indigo, sat 0.82).
   The ball, the aura and the trail are the only saturated, additive light in the frame, so bloom
   (0.9-1.1, threshold 0.6-0.72) makes them glow and the eye cannot look anywhere else. GALE plays
   in high-key floodlight, MERIDIAN on grey paper and SOLO in plum murk: none of them has a light
   source that out-shines its background.
2. **The ball's energy is huge on screen even when the ball is small.** The ball is only 20-29 px,
   but its *signature shape* is enormous: ZENITH's fire ribbon is 26-46 px wide with a halo of
   62-110 px and runs up to 320 px long (shot 4 is a full-height column of fire); the POV meteor grows
   to 88 px across; CRESCENT's crescent blade is a ~95 px radius arc, 32 px thick, and its comet
   carries a crimson ribbon across the full frame width, with orbiting blades ~40 px across in the
   top-down shot. GALE's ball is 24 px (r6 x 1.25 at zoom 1.6) with an ~11 px pale cyan vapour streak
   (`vaporRibbon` w 7); MERIDIAN's ball is 24 px in close shots but 4-6 px in its wide reveal, its
   thread a 2-4 px line with a 22 % emerald halo; SOLO's ball is a plain 24-36 px white disc with a
   faint lilac glow and no trail (its "strobe chain" is faint lilac discs). None of them owns a
   giant energy shape.
3. **Every contact is a stack of 8-12 layers in the same frame.** ZENITH's volley: hit-stop rate 0.03
   for 0.2 s, cam.hit(1) with shakeAmp 22, a punch-in +0.18 zoom, a two-stage impact frame
   (0.07 s black/white, then 0.09 s inverted red/black), two shock rings (strength 0.07 and 0.04),
   three particle rings, 70 sparks, 40 fire blobs, 110 focus lines flipping black/white, CA 0.014,
   radial blur, a flash at +0.16 s, colour flooding back from sat 0.55 to 1, and
   boom 1.4 + kick 1.4 + crack 1 then roar. CRESCENT's strike adds the slash split along its own arc.
   GALE's strike has 3 frames of impact and one lens bulge; MERIDIAN's has an ink freeze and a pluck;
   SOLO's three skill hits have 2 frames of a flat violet impact frame and a 3-4 frame echo, with one cam.hit(0.15) in the whole film.
4. **Silence/freeze, then violence.** Both specials hold a long, near-frozen, near-silent breath
   immediately before the hit: ZENITH rate 0.42 for 0.55 s + timeStop(1.3) drone and desaturation;
   CRESCENT rate 0.08 for 1.6 s with the stadium upside down + timeStop(1.75) + one heartbeat. The
   release is a whip (CRESCENT: whip-roll 180 deg in 0.32 s; ZENITH: meteor accelerates to 2600 px/s).
   The contrast between the freeze and the release is what reads as "scary power".
5. **The camera always moves with intent, and big.** Crash zoom 1.16 -> 3.4 in 0.35 s (ZENITH 2),
   whip-tilt ~840 px in 0.73 s (ZENITH 3), a 2950 px vertical ride (ZENITH 4), a POV with the threat
   coming at the lens (ZENITH 6a, ZENITH 8 through the net), the dolly zoom (CRESCENT 2), the
   continuous roll to 180 deg and the whip-roll back (CRESCENT 3-5), a top-down orbit (CRESCENT 6),
   a Dutch chase and whip-pan (CRESCENT 7). Shake is used as a *build* (trauma held at 0.25-0.8 for a
   whole shot), not just a bump. Of the weak three, SOLO is built on "the camera holds still and snaps
   only on the beat" (one cam.hit 0.15 in the whole film); MERIDIAN locks the camera in panels and
   has no roll by rule; GALE's rail is level and locked to the ball.
6. **Each shot is a new place.** ZENITH travels pitch -> clouds -> space -> lens -> net. CRESCENT
   inverts the stadium, then goes overhead. The weak three stay on one flat pitch (GALE side views at
   grass level; MERIDIAN the same pitch inked grey; SOLO the same pitch in the dark).
7. **The defenders and the keeper suffer.** ZENITH blasts two defenders aside, burns the keeper's
   gloves for 1.1 s, blows him into the net and tears the net. CRESCENT knocks three defenders
   spinning, tears the keeper's glove off at 1/80 speed, and back-lights the scorer with a crimson
   burst while he never turns round. That is the "scary" part: an opponent who tries and is
   overpowered. GALE flings one defender in a comic heap and lets the net "exhale dew"; MERIDIAN's
   defenders sprawl politely; SOLO's four fall over at small scale in the dark and it ends with no goal.
8. **The hero is a monument.** Front low-angle full-body at 250-290 px with a three-layer fire aura
   (ZENITH 2), chest-up at 3.4x under a dolly zoom (CRESCENT 2), a rim-lit silhouette against a
   232 px full moon (ZENITH 5), upside down at 2.4x in a frozen stadium (CRESCENT 4), landing in the
   foreground back to goal (CRESCENT 8). The weak three mostly show him in neutral side views with
   no aura and flat light.
9. **Every cut lands on a flash or a motion match.** ZENITH: inExpo white flash 0.85-1.0 into or out of
   every cut. CRESCENT: flash, roll-match (3 -> 4 -> 5 share the exact framing), whip-pan motion cut (5 -> 6).
   The weak three use their own quieter transitions (ring-pop, cyan/navy blink, thread wipe, paper
   flash, spot iris, ghost wipe), several of which read as a fade or a blink rather than a punch.
10. **Sound: big low-end on every hit, silence before it, roar after it.** ZENITH and CRESCENT each
    have 9-12 boom cues (up to 1.3-1.4), roar 3-4 times and use timeStop. GALE is muffled for half its
    length by design (muffle bus) and its booms top out at 1.0; MERIDIAN has 2 booms (0.35, 0.4)
    and lives on plucks and ticks; SOLO has 5 booms of 0.2-0.5 and lives on toms, hats and OLE.

| Measured in code | ZENITH | CRESCENT | GALE | MERIDIAN | SOLO |
|---|---|---|---|---|---|
| cam.hit() code sites (max) | 7 (1.0) | 13 (1.0) | 10 (0.9) | 11 (0.35) | 1 (0.15) |
| boom code sites (max power) | 9 (1.4) | 12 (1.3) | 8 (1.0) | 2 (0.4) | 5 (0.5) |
| roar / timeStop | 4 / 1 | 3 / 2 | 0 / 0 | 0 / 0 | 0 / 0 |
| shock-ring code sites | 9 | 13 | 1 | 0 (banned) | 0 |
| impact-frame code sites | 7 | 5 | 1 (3 frames) | 0 (banned) | 3 (2 frames each, flat violet) |
| focus-line bursts | 7 | 13 | 2 | 6 (ink, faint) | 0 |
| camera roll | sways | 180 deg + whip-roll | none | none (banned) | none |
| goal / payoff | net tears, GOAL 132 px | glove torn, crimson burst | net balloons, dew | No.7 side-foot | no goal, freeze |

Picture metrics measured on the 6 fps filmstrips (`tools/metrics.py`, frames at 320x180):

| | ZENITH | CRESCENT | GALE | MERIDIAN | SOLO |
|---|---|---|---|---|---|
| luminance contrast (mean std) | 0.208 | 0.159 | 0.145 | 0.219 (ink + paper) | **0.130** |
| deep-shadow pixels (L < 0.12) | 43 % | 52 % | **11 %** | 32 % | 69 % |
| hot pixels (L > 0.85) | **4.9 %** | 2.4 % | 1.4 % | 3.4 % (paper whites) | **0.5 %** |
| saturated light (S > 0.6, V > 0.75) | 2.7 % | 1.8 % | 1.9 % | **1.0 %** | 4.0 % (violet pools, violet impact frames) |
| mean frame-to-frame change | **0.125** | 0.095 | 0.088 | 0.098 | **0.063** |
| violent changes (> 0.15 per 1/6 s) | **29** | 8 | 6 | 11 | **5** |

Read: GALE is the only one without darkness (flat daylight look); SOLO is dark and its light is
violet haze with almost no white-hot core (murky, nothing to lock the eye on) and it has the least motion; MERIDIAN's contrast
is ink-on-paper (black and grey-white), not light, and it has the least coloured light of all.
CRESCENT's low change rate is its deliberate 1.6 s freeze, which is then spent in one violent release.

## 5. The three weak skills

### 5.0 Root cause: the briefs asked for "smaller"

The three weak skills are well built. They are simple because their briefs told them to be, and the
code followed the briefs faithfully. Quotes from `docs/skills/*.md`:

- GALE HAMMER: "**one tier below ZENITH METEOR**: 6 shots and 11.3 s ... It stays at ground level the
  whole time, with **no sky, no moon and no fire**, and the net balloons but **does not tear**."
  Its signature is "**the world goes mute**", i.e. power shown by subtraction.
- MERIDIAN THREAD: "a **clear notch below every shot in raw power**: no fire, explosions, shock rings
  or sky; nobody is blasted"; "**The ball rolls.** It is a true ground pass and never skips or
  bounces"; "never rises more than about 4 px"; banned: `fx.shocks`, `ring()`, any ring, flames,
  **camera roll**, the impact shader, sky shots, a crowd duck deeper than 0.6, `roar()`, `timeStop()`.
  This is exactly what the owner objects to: "the pass flat in the ground ... make the cinematic
  scene look so simple."
- SPOTLIGHT SOLO: "**smaller than every shot**: 11.0 s, it never leaves the grass, it scores no goal
  and it never beats the keeper"; the camera "**holds still, snaps only on the beat**"; the only
  shake in the film is one `cam.hit(0.15)`.
- The five-skill "set rule" ("each special changes exactly one dimension of the world, and never
  touches another skill's") then locked each weak skill out of the tools that make the loved two
  powerful: no desaturation for GALE/SOLO, no roll/impact/rings for MERIDIAN, no muffle/silence for
  MERIDIAN/SOLO, no slide-tackle or tracking rail outside their owner, no heartbeat, no sky.

The owner's standing rule is the opposite: **each special needs the strongest effects, camera and
scene**. The redesign should drop "one tier below", "a notch below" and "smaller than every shot",
and replace the one-dimension rule with a looser *identity* rule (each skill keeps its own palette,
signature shape and signature camera move, but every skill may use the full power toolkit: hit-stops,
impact frames in its own colours, shock rings, rolls, crash zooms, sky, fire-like energy in its own
element, a keeper/defender payoff, roar and silence).

### 5.1 GALE HAMMER (11.3 s, 6 shots): frank critique

Sheet: `sheets/gale_6fps.png` (68 frames). The owner: "look so simple and not powerful".

**The one-line diagnosis:** GALE is staged like a well-made gameplay replay in daylight: a flat
high-key stadium, level side views, a 24 px ball with an 11 px pale streak, and its power is
expressed through *absence* (mute, delayed boom, dew, a palm blow), which does not read on screen
or for a young audience. Its single great image (the macro squash) is followed by 0.9 s of a man
hopping in an empty frame.

| # | Shot (time) | What reads on screen | Why it reads as simple | Keep |
|---|---|---|---|---|
| 1 | Cut-in (0.0-1.2) | navy screen, a small elliptical window (face at 4x, ~130 px incl. shoulders), thin faint isobars, glowing ice title, ring-pop to a pale blue disc | the face is a third of ZENITH's 12x eye crop; no speed lines, no burst, no flare; isobars at low alpha read as a dark empty background; 1.2 s is short and calm | the spring-open window shape, the ice title treatment, the ring-pop exit |
| 2 | The load (1.2-3.1) | full-body side view at 3x (294 px) running in a flat, evenly lit stadium; ball 36 px; in the slow-mo inhale, thin cyan rings round the boot and a tiny face in a dew drop (~20 px) | **no aura, no darkness, no light source on him**: the "inhale" is a few thin lines; the lens pinch ratchets are 2 % zoom steps (invisible); defenders are 40 px figures far away; the camera dolly 1.0 -> 1.7 is smooth and polite. Compare ZENITH 2: a 3-layer fire aura, cracks, crash zoom to 3.4 | the **last frame (3.0 s): the ice smash with cyan focus lines** is the strongest frame in the film; the run-up/plant frames are good animation |
| 3 | Squash (3.1-4.7) | macro boot on ball, **ball 92 px across, squashing flat**, bokeh, dew beads; ball leaves as a white smear; then the "recoil": No.10 at 2x hopping on one foot in a flat side view for ~0.9 s | the macro hit-stop is 0.5 s of a **locked camera with nothing escalating** (no shock ring, no CA burst, no crack, no aura, 3 frames of a mostly-white cobalt/ice impact); after release the energy drains instantly: no trail, no blast wave, the world goes *muffled*, and we watch a follow-through hop with the ball off screen | **the macro squash is the best ball showcase in the three weak skills**: keep it, but make it the detonation (impact frames, shock, crash zoom out) |
| 4 | Air steps (4.7-7.3) | side rail at grass level, ball held left third, **24 px ball + ~11 px pale cyan vapour streak**, faint ring stamps on the turf, defender 1 jump-blocks and is flung in mid-air (best gag), defender 2 cowers, whip zoom to the keeper | daylight flat lighting and a level, locked rail = gameplay camera; the ball never gets big and never threatens anyone (knee height); the "late boom" is a thin refraction band and a faint ring, not visible in stills; stamp rings are pale decals | **defender 1 flung spinning in mid-air**, the air-step stamp idea (ball bouncing on air), the whip zoom out |
| 5 | Pressure front (7.3-8.7) | keeper dives at 2x, ball ~12 px floats into the top corner, net balloons gently with glitter, navy blink | the keeper is not overpowered, he simply misses; the ball arrives "almost silently" by design; the net "exhales dew" (pretty, not scary); no impact, no tear, no fire, no flash | the slow-mo moment of the ball sliding over the gloves; the net balloon timing gag (ball first, boom later) if the boom is made huge |
| 6 | Footprints (8.7-11.3) | back view, No.10 small (~140 px) in the centre, three faint ring decals between him and the goal, ice GOAL! (54 px), the palm blow with a small breath puff, card | a static, symmetrical, calm ending; GOAL! is 54 px against ZENITH's 132 px, no confetti burst or camera flashes of note; the palm blow is a cute gesture, not a power pose | the footprints-of-air image (three stamps leading to the net) as a final wide; StrikeBack/StandBack frames |

**Numbers that explain it.** 1 shock ring in the whole film, 1 impact frame (3 frames, cobalt/ice,
threshold 0.35 so mostly white), no roll, booms max 1.0 and half the film under the muffle bus, no
roar, no timeStop, ball 24 px with an 11 px trail in its own "ball scene" (ZENITH: 24 px ball with
a 72 px wide, 320 px long fire column).

**Pacing.** The strike lands at 3.22 s (28 % of the film) and is followed by 8 s of aftermath played
*quieter* (muffled, then a polite net, then a breath). ZENITH and CRESCENT strike at ~50 % and every
later beat hits harder than the one before. GALE's intensity curve peaks early and decays.

### 5.2 MERIDIAN THREAD (10.9 s, 6 shots): frank critique

Sheet: `sheets/meridian_6fps.png` (66 frames). The owner: "the pass should be a good pass, high, not
flat in the ground ... the pass flat in the ground makes the cinematic scene look so simple."

**The one-line diagnosis:** the whole film is grey. The signature effect *removes* colour (the ink
page), the ball rolls along the turf by rule (never above ~4 px), the thread is a 2-4 px line with a
22 % halo, the camera is locked in comic panels with no roll, and the brief banned rings, shocks,
impact frames, sky, flames, roar and timeStop. What is left is a clever, quiet diagram of a pass. It
is a tutorial, not a super-move; nothing is ever in danger.

| # | Shot (time) | What reads on screen | Why it reads as simple | Keep |
|---|---|---|---|---|
| 1 | Stitch-in (0.0-1.3) | warm paper page, two slanted panels (eyes at 4x in a dark panel, the boot on the ball), a needle stitches MERIDIAN THREAD (48 px) in jade | a **bright paper background** (the opposite of ZENITH's crimson burst), small faces, the title is stitched calmly, the only motion is a 3 % push; no flash punch, no heat | the two-panel manga cut-in is a distinct identity; the stitched title |
| 2 | Playmaker's eye (1.3-3.1) | over-the-shoulder back view at 3x, the pitch drains to grey within 0.25 s; defenders 36-46 px far away; thin dashed jade sightlines; eyes inset; the stitched route (2-3 px) draws to No.7 | 1.8 s of a man standing still seen from behind, then the picture *loses* colour; the read happens in tiny figures at the horizon; the camera dolly is 1.0 -> 1.08 and the only energy is the 0.25 radial on the last 0.2 s | the read itself (sightlines + four defenders swivelling to his look-off) is the clever idea of the skill; the over-the-shoulder view; the route preview |
| 3 | Outside of the boot (3.1-4.8) | side view 2x in a grey stadium; ball 24 px at the boot; an "eyes here" inset and a small "OUTSIDE OF THE BOOT" caption; the ball rolls away along the grass on a 2 px jade line; then a 3/4 close-up of No.10 and **the wink** | the strike has a dry `kick(0.9)` + pluck and a 0.03 hit-stop but **no impact frame, ring or flash by rule**; the freeze reads as a coaching diagram; the ball leaves at ground level with nothing on it | the trivela technique, the no-look head turn, **the wink** (the character beat kids will copy), Trivela T1-T9 frames |
| 4 | Needle's eye (4.8-7.2) | **the ball scene is a comic page**: three slanted panels, locked cameras, a 24 px ball rolling across grey grass, grey puppet defenders (poke, scissors, heel), tiny ink SFX (SHK!, KLAK!, SWSH), then the whole page at 0.5 zoom | each panel shows the ball small at the bottom of a wide grey frame; the camera never follows the ball; the whole-page still makes everything half size; the thread hugs the turf, so the "bending curve" is a flat squiggle; 2.4 s with no colour, no light and no threat | the near-miss idea (three defenders beaten by millimetres), the scissors frame (ball alone between two boots), the rising pluck per near-miss (E-F#-A) |
| 5 | Meridian (7.2-8.5) | broadcast wide over the grey pitch: players ~30 px, **ball ~4-6 px**, the 2 px thread, "?" over defenders, then a push-in with radial blur | the pass's big reveal is the smallest picture in the film; everything is grey except two tiny red shirts | the "everyone looks the wrong way" gag (? marks), the push-in |
| 6 | First touch (8.5-10.9) | side medium on No.7 at 2x; the colour washes back (green grass, crowd); No.7's side-foot finish with a **plain ball** (by design "it is No.10's special, not No.7's"); keeper dives late and lies flat; GOAL! (76 px, shrinks to ~40 px for the diptych); the fingertip diptych; card | the payoff is a normal goal; the net is barely seen; the colour return is the only "wow" and it is a gentle 0.35 s wash | **the friendship ending**: No.10 and No.7 pointing at each other (owner's brief: "friends point at each other"), Point/Receive studio frames, the colour-return idea |

**Why "flat on the ground" kills it.** A ground pass keeps the ball at 0-4 px off the turf, so every
camera that shows it is a low side view or a top/wide view, the ball is always the smallest object
in frame and there is no vertical space for the camera to travel in. ZENITH's and CRESCENT's best
shots are all about the ball in the air (rising column, hanging under the moon, hanging upside down
above the boot, a comet). A high pass gives MERIDIAN: a launch, an apex (a frozen ball high over
the defenders' heads), a long fall onto No.7, and a volley/scissor finish.

**Pacing.** The pass is struck at 3.72 s, then 2.4 s of comic panels, 1.3 s of a wide diagram and a
calm finish. There is no escalation: the loudest moment in the film is the paper flash between
panels. By code, 2 boom cues (0.35, 0.4), 0 shock rings, 0 impact frames, no roll, crowd never
ducked past 0.6, no roar.

### 5.3 SPOTLIGHT SOLO (11.0 s, 7 shots): frank critique

Sheet: `sheets/solo_6fps.png` (66 frames). The owner: "the spotlight looks so simple, not like a
powerful dribble skill".

**The one-line diagnosis:** the special turns the lights *off* and then shows small, real-football
footwork (a step-over, a sole roll, an elastico, a nutmeg) at human scale in a dark plum frame, with
a camera that by design "holds still and snaps only on the beat" (one `cam.hit(0.15)` in 11 s). Its
power effects are soft violet: afterimages that read as smudges, a 3-4 frame echo, and 2-frame
flat violet impact frames. Defenders fall over gently, nobody is overpowered, and there is no goal.
It reads as a stylish music video, not a super-move.

| # | Shot (time) | What reads on screen | Why it reads as simple | Keep |
|---|---|---|---|---|
| 1 | Count-in (0.0-1.4) | black, a follow-spot clunks on, an oval violet pool with his face at 5x, the title lit word by word (56 px) to drum sticks, iris to his eye | elegant but quiet: a soft violet oval on black, no speed lines, no burst, no flash by rule ("no impact frame and no white flash") | the spotlight-as-panel idea and the stick count-in; the iris-out |
| 2 | House lights (1.4-2.6) | side view, No.10 ~120 px running at the wall of four; floodlights die bank by bank; the defenders become plum silhouettes; the follow-spot lands on him | the frame gets **darker and emptier**; the "lights off" beat is the opposite of a power-up; the ball (24 px) is lost at his feet; camera zoom 1.0 -> 1.3 snap only | the wall of four defenders and the lights-out beat as a setup |
| 3 | Step-over (2.6-4.2) | front worm's-eye, No.10 ~150 px in a pool, A in silhouette; the sell frame is a full-violet impact frame with white outlines; violet ghosts; A lunges; iris to black | the step-over is a **tiny leg movement**; the ghosts look like motion-blur smudges; the impact frame is a flat lilac field (impA bright violet, threshold 0.62) that washes the frame out rather than punching; A's lunge is small and slow; the ball sits still at his feet (by design) | front low view, A biting the wrong way, StepOver/Break frames |
| 4 | Sole lift (4.2-6.2) | side view at 3x (294 px): sole on, drag, scoop, flick; B's slide tackle comes out of the dark and passes under his hop; the ball's violet "strobe chain"; whip pan | **the best shot of the film**: big hero, a real threat (studs-first slide), a held money frame. But the ball only rises to knee height (94 px apex), the hop is 25 cm, the strobe chain is faint lilac discs, B's slide is seen mostly in slow motion and B is never hit, and there is no impact/shock when No.10 clears it | **keep and amplify**: the slide tackle under the hop, the frozen money frame, SoleLift frames, RivalSlide frames |
| 5 | Elastico (6.2-7.4) | front view ~150 px, C slides in; the elastico is two frames of foot movement; a violet ghost; then the ghost wipe (a giant violet silhouette blob) | the elastico itself is almost invisible at this scale and speed; the ghost wipe reads as a purple blob, not a power transition | the elastico is a famous skill kids know; C ending in a comic split |
| 6 | Nutmeg (7.4-8.6) | reverse angle through D's legs (a silhouetted arch), No.10 small (~50 px) in the spot, the ball rolls at the lens and grows to ~40 px, D looks back through his own legs | **the best composition in the film**, but the hero is tiny and the payoff is a comedy gag (head between legs) rather than power | keep the arch composition and the ball rolling at the lens; make the ball and hero the threat |
| 7 | On the mark (8.6-11.0) | side oblique, No.10 ~120 px stops the ball on the penalty spot; the keeper gets his own spot; eyes bookend; the floodlights slam back on; "1 ON 1" (~40 px); the four defenders lie small in the background | **no shot, no goal, no keeper beaten**: the ending is a freeze and a caption; the result is literally "breakthrough"; the camera barely moves | the lights-on reveal of the four beaten defenders behind him (make it a big, slow, low-angle hero reveal) |

**What a "powerful dribble" needs that SOLO lacks:** speed (the ball and hero cross the frame fast,
with motion streaks and whip pans), defenders physically overpowered (spun, flung, crashing into
each other), at least one camera move that travels (an orbit round him, a crane over the four
beaten defenders), hard impact frames in its own colours on each skill, and a payoff shot (a
finish, or at minimum the keeper beaten). The ultraviolet afterimage idea can stay as its signature
if it becomes bright and sharp (crisp lilac silhouettes with an additive core and speed lines, not
soft smudges).

**Pacing.** Four skills of near-identical size (each a 0.1-0.2 s hit-stop at 0.06-0.25 and a violet
flash) at a steady 150 BPM, then a freeze. The drum structure makes every beat equal, so nothing
builds: the climax is a cymbal choke into silence and a caption, with no strike, no keeper beaten and
no goal.

## 6. What is worth keeping (assets and ideas that already work)

- **Studio frames (all keep):** No.10 Run, Approach, Strike F5-F10, StrikeMacro M1-M3, StrikeBack,
  StandBack, Glance, Trivela T1-T9 (+ the wink T8a/T8b), Dribble, SoleLift, StepOver, Elastico, Nutmeg,
  Break, Settle, Carry, Scan, Point; No.7 Idle, Run, Receive, Point; RivalSlide. The motion is good;
  it is the staging around it that is weak.
- **GALE:** the macro boot-on-ball squash (92 px ball, dent, lens bulge) as the detonation shot; the
  ice smash frame with cyan focus lines (end of shot 2); defender 1 flung spinning in mid-air; the
  air-step stamps (ball bouncing on cushions of air) as the ball's signature; the "late boom"
  (thunder arriving after the ball) only if the boom is then enormous; the ice/cobalt palette.
- **MERIDIAN:** the no-look look-off and the wink (personality); the read with sightlines and four
  defenders swivelling the wrong way; the friendship ending (the two friends pointing at each other,
  the diptych); the jade palette and the thread motif (as a thread of light the ball draws *through
  the sky*); the near-miss notes (E-F#-A-D); the colour wash returning along the thread.
- **SOLO:** the sole-lift hop over the slide tackle (best shot: big hero, real threat); the nutmeg
  arch composition with the ball rolling at the lens; the follow-spot cut-in and stick count-in; the
  four real skills (kids learn their names); the lights-on reveal of four beaten defenders.

## 7. Levers for the redesign (what the study says to change)

These follow directly from sections 2-5; they are not a design, just the gaps to close.

1. Remove the "smaller / a tier below / one dimension only" rules from all three briefs; keep each
   skill's palette, signature shape and one signature camera idea, and give each the full power kit.
2. Give each skill **one giant energy shape for the ball**, in its own element, readable in a still:
   GALE a torn-air cone / pressure vortex 60-120 px wide behind the ball; MERIDIAN a high, glowing jade
   arc (the thread drawn across the night sky); SOLO a bright ultraviolet light-trail/afterimage chain
   that is sharp and additive, not smudged.
3. **Darken the world, light the subject**: night grade, crushed backgrounds, one additive saturated
   source (aura, trail, follow-spot) per frame. GALE must leave flat daylight; SOLO's spot must be
   bright and hot inside the dark; MERIDIAN's ink page must have glowing colour on it, not grey.
4. **Stack every contact** to ZENITH's level: rate 0.03 hit-stop for 0.15-0.2 s, cam.hit 0.8-1.0 with
   shakeAmp 16-22, punch-in +0.12-0.18, a two-stage impact frame in the skill's own colours, 2 shock
   rings, rings, sparks, focus lines, CA spike, radial, flash; boom 1.2-1.4 + kick + crack, then roar.
5. **Breathe before the strike**: a 0.5-1.6 s near-freeze (rate 0.05-0.4) with timeStop-like
   silence or a drone and a cold grade, then a whip release.
6. **Travel with the camera**: at least one crash zoom (to 3x), one long move that follows the ball
   through space (tilt/ride/orbit 1000+ px), one roll or Dutch whip, one POV or reverse angle where
   the ball comes at the lens.
7. **New places per shot**: MERIDIAN should go up (a high pass gives sky, apex and a falling ball for
   a volley); GALE should go down the pitch with the ball through the defence and into the net from the
   ball's POV; SOLO should orbit round him and finish at the goal.
8. **Overpower the opponents** and end on a payoff: defenders flung, keeper beaten or burned/blasted,
   the net torn or blown open, GOAL! at 100+ px with confetti and crowd flashes; SOLO needs a finish
   (or at least the keeper beaten and the ball in the net) instead of a freeze.
9. **Cut on punches**: inExpo flashes into cuts, match cuts on motion, whip pans; fewer soft blinks,
   wipes and irises.
10. **Hero as monument** once per skill: a low-angle full-body power-up with an aura (GALE, SOLO)
    or a silhouette against a giant light source (MERIDIAN at the apex of the lofted pass).
