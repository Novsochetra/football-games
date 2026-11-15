# GALE HAMMER v2: shot spec ("The Thunder Catches Up")

No.10's long-range power shot from 30 m. The keeper laughs and dares him to shoot. No.10 reaches out
and **grabs the wind** out of the stadium, then stands calm in the eye of a hurricane he made himself.
He sucks the whole storm into one cocked boot and hammers the ball through the sound barrier: a white
vapour cone wraps it, the air ahead of it flings a wall of three defenders apart, and it rides its own
pressure wave toward the goal, faster than its own sound. The keeper punches it and **stops it dead**.
He grins at us. But the ball's thunder, left 30 m behind, is still coming, and we can see it racing
up the pitch behind him. It hits the ball like a second hammer. The ball blasts through his fists,
the goal is ripped off its pegs and **shoved 2.8 m behind its own painted line**, and the stadium is
blown back. No.10 opens his fist and blows the wind back.

**The playground test** (what a 9-year-old says on the way home): *"The keeper laughed at him, so he
grabbed the wind and made a hurricane and kicked it so hard it broke the sound barrier! The keeper
STOPPED it and he was smiling, but the THUNDER was coming and it smashed the ball in and pushed the
whole goal back!"* Every shot below gives one sentence of that story.

This brief replaces `docs/skills/GALE_HAMMER.md` (v1, 6 shots, 11.3 s, "one tier below ZENITH METEOR").
The owner's verdict on v1: *"look so simple and not powerful ... make it more powerful, with great effect,
great camera movement, good cinematic. The previous 2 (ZENITH METEOR, CRIMSON CRESCENT) are so amazing."*
And for all three new skills: *"as powerful and scary as they can, with good visual effects, cinematic
scene, camera move and great ball showcase."* So v2 drops every "smaller" rule from v1 and takes the full
power kit, while keeping GALE's element (air pressure), palette (ice / cyan / cobalt) and its best v1 ideas.
The format follows `src/cinematic/crescent/SPEC.md` and v1's brief.

## 0. What changed and where it came from

### 0.1 v1 → v2

| | v1 (shipped) | **v2 (this brief)** |
|---|---|---|
| Runtime / shots / SP | 11.3 s / 6 / 60 | **16.7 s / 9 / 75** (under ZENITH's 17.2 s) |
| Story | a strong shot, then quieter aftermath | **two hammer blows**: the strike, then the thunder catches up and hammers the stopped ball |
| Peaks | contact at 28 %, then decays | hammer 1 at **40 %**, sound-barrier detonation at **58 %**, hammer 2 at **75 %**, each bigger |
| World | high-key floodlit daylight (11 % deep shadow) | **storm night**: cloud lid, wind, navy stands; one hot ice/cyan subject per frame (target 40 %+ shadow) |
| Hero monument | none (side views) | **Eye of the Storm**: No.10 at 255 px, front, low angle, calm inside a stadium cyclone |
| Ball's energy shape | 24 px ball, 11 px pale streak | **vapour cone 170 x 320 px**, **vapour disc 320 px**, pressure bubble, barrier torus, pressed V-wake |
| Contact stack | 3 frames of a mostly white impact, 1 lens bulge | **12 layers** on hammer 1 and hammer 2, GALE's own **isobar impact frame** (two stages) |
| Camera | level gameplay rail, polite dolly | **the camera breathes with the air**: vacuum pull (sucked in), blow-back (blown out), `cam.shove`, the ride, a swing-orbit to the halo, a chase POV, a proof push |
| Sound | muffled for half the film, booms max 1.0, no roar | three short **vacuum gaps**, each ending in a blast; booms up to **1.5**; `hammerBoom`, `thunderFront`, roar |
| Opponents | one defender flung, keeper simply misses, net exhales dew | the wall of three **flung by the detonation**, one hurled at the lens; keeper **folded and cartwheeled**; the **goal shoved 2.8 m** off its line, crossbar bent |
| Ending | back view, palm blow, GOAL! 54 px | GOAL! **130 px** riding the stadium's wind wave over the shoved goal; **Return the Wind** front pose kids can copy |

### 0.2 Synthesis

The spine is the **hero pitch** ("The Thunder Catches Up": the dare, the grab/return gesture, the eye of
the storm, two hammers). Inside it:
- from the **power pitch**: the visual language of air (vapour cone, vapour disc halo, pressure bubble,
  isobar spiral with implosion lines, air craters, pressed V-wake), the 12-layer contact stack on a
  109 px macro with **M2c**, the isobar impact-frame shader spec, the 65 px **ride** with the ball, the
  **swing-orbit** to the halo, the skidding plant boot **F9r**, the FlashBudget guard;
- from the **camera pitch**: `cam.shove`, the strict sound rule (silence only as a short vacuum gap
  right before a blast), the dry and open N-wave detonation, and **the proof that the goal moved**
  (the white goal line painted in front of the shoved posts, with two furrows behind them; v2 shows it
  in a crane-down push to zoom 1.9 in the side view, §6 shot 8b).
- Full `pitch3D` is **deferred**: the swing-orbit is a 0.40 s 2.5D move over a crushed-dark background,
  and the chase POV uses the existing `drawDownPitch`.

### 0.3 Every weakness the judges named, and its fix

| Pitch | Weakness | Fix in this brief |
|---|---|---|
| camera | the money shot depends on `pitch3D` and new rear sprites | no `pitch3D`; no rear/3Q wind-up sprites; the only yaw move is 0.40 s over a 15 %-bright background (shot 6b), projected by a 30-line helper (§10.4) |
| camera | no front low-angle hero monument with an aura | shot 3, Eye of the Storm: 255 px, cyclone, wind aura, crop circle, bent floodlights |
| camera | the cut-in is still a window | no window: shot 2 is a full-frame chest-up grab (head 150 px, palm 140 px) |
| camera | contact at 23 % | 40 %, with bigger peaks at 58 % and 75 % |
| camera | impact stage A (cobalt/ice at threshold 0.35) reads mostly white | retired; GALE's only impact frame is the **isobar frame**; stage 1 must show 45 %+ navy/cobalt area |
| camera | the ball shrinks to 12 px; the shape outshines the ball | the ball is 56-109 px whenever it is the subject; a navy halo keeps the ball's ice core the hottest point inside its cone |
| power | "power by subtraction": silent detonation, muffled goal shunt | the detonation is **loud and dry** (`sonicBoom 1.4 + boom 1.35 + crack 1.2`); the goal shove plays fully open with the roar |
| power | mid-film peaks of 0.6-1.0 | every No.10 hit is boom 1.3+; tallies in §11 |
| power | 9 shots, 4 freezes, 2 defender and 2 keeper beats | one defender beat (the wall, shot 6), one keeper beat (shots 7-8, continuous); three breaths of three different kinds (inhale 0.85 s, halo 0.5 s, dead stop 0.45 s) |
| power | the keeper pinned against his net sits close to ZENITH | dropped: the keeper punches once, then is folded and cartwheeled out; he never holds or grinds the ball; the net never tears |
| power | a long engine list (iso, streak, lens2, 6 shocks, yaw) | one new post program `FINAL_GALE` (lens + iso + streak, composed from shared chunks); no `lens2` and no front shader: the thunder wall is built from large-radius shock rings in the existing 4 slots |
| hero | the dead stop can read as the shot failing; a 0.58 s fist struggle near ZENITH's 1.1 s grind | **one 0.1 s punch, no struggle**; the stillness lasts 0.45 s; **the thunder wall is on screen behind him from the first frame of the grin** (the audience sees it, he does not) |
| hero | the restart must be the visible wall, never spin pushing through the gloves | knuckle ball: its panels are dead still during the stop; the wall touches the ball on the cut; the fists are flung open before the ball moves |
| hero | comic beats dilute "scary" | cut: no boot sucked off, no bowling pins, no puzzled defenders hanging, no boot sole at the lens; defenders are flung by the blast, one hurled at the lens as a dark tumbling body (menace) |
| hero | the least inventive camera | GALE's camera grammar (§1.3): vacuum pull, blow-back, shove, ride + buffet, swing-orbit, chase POV, proof push |
| hero | about 26 new frames, incl. a foreshortened palm at ×4 | **22 frames, of which 4 are 1-2 px tremble variants**; grab and return share one strip (`WindHand`); taunt and face share `KeeperFront`; the punching keeper is a puppet pose (as ZENITH's keeper); WH1 is drawn first with a less-foreshortened fallback |

## 1. Identity

### 1.1 The five specials: the shared set table

The v1 "set rule" (each special changes one dimension of the world and never touches another's) is
**dropped**: it is what made the three new skills small. The new **identity rule**: every special may use
the full power kit (hit-stops, impact frames, shock rings, crash zooms, shake, silence, roar, a keeper
payoff), but each keeps its own **palette, element, signature energy shape, signature camera move,
signature post effect, impact-frame style, transition, sound signature, gesture, keeper beat and false
defeat**, and never borrows another's.

**One shared file.** This table is the set table. Its single source is `docs/skills/SET_TABLE.md`; the
GALE, MERIDIAN and SOLO v2 briefs carry the same rows word for word. A change is made in that file first
and then copied into all three briefs (synced with the MERIDIAN THREAD v2 and SPOTLIGHT SOLO v2 briefs,
Nov 2026).

| | ZENITH METEOR | CRIMSON CRESCENT | **GALE HAMMER v2** | MERIDIAN THREAD v2 | SPOTLIGHT SOLO v2 |
|---|---|---|---|---|---|
| Move | sky volley | bicycle kick | **30 m power shot** | no-look lofted outside-of-the-boot pass, No.7's flying header | special dribble through four, ends 1 on 1 |
| Element | fire, the sky, the moon | the crescent blade, rotation | **air pressure**: vacuum, vapour, shock, wind, late thunder | a line of jade light that the world treats as a string (bowed, held, plucked, strummed) | stage light as a weapon: blackout, white-hot beams, ultraviolet pouring from torn turf |
| Palette | fire orange / gold, night blue | crimson + silver, indigo | **ice white and electric cyan on storm navy; cobalt only as halo, stroke and iso band** | jade / emerald / mint / pearl on night-ink | white-hot + ultraviolet / volt + ivory on plum-black |
| Space | vertical, up into space | rotation, stadium upside down | **horizontal and low** (ball at most 1.9 m), down the pitch | 26 m inside the bowl at floodlight height, never above the roofs | a stage on the turf (ball at most 1.4 m), one 22 m crane |
| Signature camera | tilt and ride up into the sky; meteor POV at the lens | camera roll, whip-roll | **vacuum pull + blow-back**; ride + swing-orbit round the vapour disc; chase POV inside the wake; the proof push; **never rolls** | chase-crane catch and ride up the arc, look-down hang, fall with the needle; roll 0, no dolly zoom | the beat-slam camera on a 150 BPM grid; the glue cam; an arc round his body; the shadow crane-rush; never rolls |
| Energy shape | fire column, meteor | crescent arc and blades | **vapour cone, vapour disc, cyclone wall, pressure orb, pressed V-wake, thunder wall** | Meridian brush stroke, Sky Eye, needle / bowstring, harp | the hammer beam, the Chorus (crisp UV copies of him), light gashes with UV shafts, neon statues, the strobe chain |
| Signature post effect | two-tone impact `fx.impact` | slash split `fx.cut*` | **pressure lens `fx.lens*` + isobar frame `fx.iso*`** | pluck warp `fx.pluck*` + halftone `fx.tone*` | beat echo `fx.echo*` + cone-masked impact `fx.impMask*` |
| Impact frame | black/white, then red/black | crimson/black, silver/indigo | **isobar weather map** (≤ 4 band pairs, rings round the contact), then a **luminance-only negative print** (no rings) | jade halftone print (night/mint), then pearl negative (pearl/emerald) | beam impact (cone-masked volt/white-hot, then lilac cut-out) |
| Own transition | white flash | white crescent-blade wipe | **wind wipe, ring-pop** | needle-eye iris, whip-tilts, whiteout from the ball core | blackout cuts, chorus wipe, whip-pans (no irises) |
| Signature sound | roar, fire, `timeStop` | metal shing, heartbeats | **howl → vacuum → hammer; sonic boom; the thunder that catches up; ear-pops; G-B-D air tones; digit clacks** | the string: plucked motif, bowed arc, held note, `twang`, harp glissando; watch ticks | the snap; the stick count-in and the 150 BPM drum solo; the choke into silence; OLÉ 1-4; the relight |
| Gesture | (power-up roar) | (back to goal) | **grab the wind / return the wind (the palm blow)** | the Meridian Sign (tap, sweep, point) and the pluck | the snap |
| Opponents | defenders blasted, keeper burned, net torn | defenders spun, glove torn off | **the wall flung by the barrier blast, one body hurled at the lens; the goal shoved off its line** | Tower flung by a pluck; keeper lashed and spun to the turf | four wrecked one by one, frozen mid-defeat as neon statues; all four crash at once when the lights return |
| Keeper beat | holds the meteor in a 1.1 s grind, burned into a torn net | fingertips on the ball, glove torn off | **the set's only double-fist punch (`gkPunch`); folded and cartwheeled by the thunder; the set's only side-netting end pose (`netTangle`)** | lashed by the line at full speed and spun to the turf | his own spot slams on for the duel; rocked back on his heels shielding his eyes (no goal) |
| False defeat | the grind: the keeper seems to hold it | the fingertip near-miss freeze | **the set's only dead stop + grin: the ball hangs dead, the keeper grins at us, the thunder wall races in behind him (0.45 s)** | the Tower grabs the thread and the arc sags (a hang of at most 0.12 s inside a 0.30 s sag) | D smothers him: black, silence, a sliver of light, CRACK |
| Ending | GOAL! slam (132 px), torn net | lands back to goal, never turns | **the goal 2.8 m behind its painted line; GOAL! on the wind wave; Return the Wind** | the friends point at each other under the arc; the fingertip diptych | the curtain drop: the stadium relights, 1 ON 1 at 130 px |
| Runtime / SP | 17.2 s / 80 | 15.3 s / 90 | **16.7 s / 75** | 16.8 s / 70 | 16.4 s / 65 |

**Shared engine tools, not shared looks**: hit-stops and `rate()` curves, the existing shock rings and
`pushShock`; the `STREAK` shader chunk, `FlashBudget`, `fx.fullFrame`, `cam.shove`, `cam.buffet`,
`PK.Blade` and `Particles.wind` (built by GALE for all three, §10.0); the `keys()` track (MERIDIAN's); the
`PuppetCache` (SOLO's, moved to `kit.ts`); the one `nameCard`; the one engine particle cap;
`drawDownPitch`, `studioAnim`, `stinger()`, `duck`, `sfx.clearBus()`.

### 1.2 GALE owns (no other special may use these as its core look)

- **Air as a character**: the vacuum (everything pulled toward the boot), the vapour cone, the vapour
  disc and its halo, the barrier torus (a white smoke ring), the pressure bubble (a glass-marble lens on
  the ball), the **thunder wall** (a pressure front of shock-ring refraction with an ice edge line and a
  dust/dew curtain), wind in hair, flags, scarves and mist.
- The **isobar language**: contour rings, the isobar spiral, air craters and crop circles in the turf,
  the isobar impact frame.
- The **pressed wake**: grass combed and ironed flat in a V with dew-mist walls. GALE presses, irons and
  stamps the turf; it never rips it. The only torn turf in GALE is the two furrows the shoved goal ploughs.
- The camera grammar of **suction and blast** (§1.3).
- The **grab** and **return** gestures, the G-B-D air-tone motif, the ear-pop, the rising digit clacks,
  `vacuum()`, `howl()`, `sonicBoom()`, `thunderFront()`, `hammerBoom()`.
- **The goal shoved off its line.**
- **Three keeper beats that are GALE's alone in the set** (MERIDIAN and SOLO drop their copies): the
  **ball stopped dead in front of an opponent who grins at us** (the dead stop), the **double-fist punch**
  (`gkPunch`) and the **side-netting end pose** (`netTangle`).

**Never in GALE HAMMER:** fire, embers, the moon, the sky as a place (the cloud lid is a ceiling, never a
destination), vertical travel, **lightning or electric arcs** (GALE's thunder is air pressure, never
electricity; ZENITH owns arcs), camera roll or Dutch angles (shake roll at most 0.015 rad), crimson,
crescents, the slash split, heartbeats, dolly zooms, black/white impact frames, the ball held or ground in
gloves, a torn net, a crash zoom onto the eyes ending in a white flash (ZENITH shot 2), a letter-slam GOAL!
with confetti and crowd camera flashes (ZENITH's), aura that peels upward off a silhouette edge (ZENITH's
edge flames, MERIDIAN's ink tendrils), jade, threads, lofted or dipping balls, watch or clock ticks
(MERIDIAN's), irises (MERIDIAN's needle-eye), ultraviolet, violet, cobalt as the largest additive glow in
a frame (it sits 28° of hue from SOLO's uv), follow-spots, **any copy of a player's silhouette**
(afterimages, smears, a chorus: SOLO's), camera moves locked to a beat grid, turf ripped by footwork, drum
grids, finger snaps, slide tackles, comic gags.

### 1.3 GALE's camera grammar: the camera breathes with the air

Every camera table below is a `keys()` track (the shared `kit.ts` helper) using GALE's three easing
presets `'step2'`, `'vacuum'` and `'blowBack'` (§10.2 item 9).

| Move | What it is | Where |
|---|---|---|
| **Vacuum pull** | the camera is *sucked* toward the subject in 2-frame lurches that hold (never spring back), each with an ear-pop and an isobar snap | shot 4 (onto the boot); shot 3's crane creeps in three small lurches spaced like quickening breaths (0.85 / 1.15 / 1.32), never on a beat |
| **Blow-back** | the camera is *blasted backward* off a hit: zoom 2.4-2.6 → 0.9 in 0.25-0.30 s (`'blowBack'`); the small form is shot 3's exit, 1.42 → 1.15 as the cyclone wall bursts past the lens | shot 3 (exit), shot 5 (recoil), shot 8 (hammer 2) |
| **Shove** | the pressure wave physically knocks the lens sideways (`cam.shove`, a spring) | every hit |
| **The ride** | locked to the 65 px ball at ball height, the world scrolling at about 2800 px/s, `cam.buffet` | shot 6a |
| **Swing-orbit** | yaw only, side → front 3/4 round the ball as its cone snaps into the vapour disc; never a roll | shot 6b |
| **Chase POV** | behind the ball inside its own wake (vortex tunnel) | shot 6c |
| **Proof push** | crane down and push to zoom 1.9 on the near post foot, the painted line and the furrow, so the 2.8 m gap is ≥ 45 px on screen for ≥ 0.5 s; then pull out for GOAL! | shot 8b |

GALE has two suction beats (the fist in shot 2, the boot in shot 4); shot 3 between them ends by blowing
**outward**, so the film never sucks three times in a row.

### 1.4 Name and originality check

- **The name.** GALE HAMMER: a web search in Nov 2026 found no anime, manga or game move of that name (the
  nearest are Super Smash Bros.' "Gale Strike" and Pokémon's "Gigaton Hammer"). **Re-check before
  shipping**; the fallback name is STORM ANVIL.
- **The keeper beat.** The genre often has a charged shot blow the keeper into his own net (for example the
  super shots of the Captain Tsubasa games). GALE's beat must stay different: the keeper **wins first** (one
  punch, a dead ball, a grin), and the restart comes from somewhere else, the shot's own thunder arriving
  from 30 m back as a visible wall. The same Nov 2026 search found no named football-anime shot that is
  stopped by the keeper and then pushed through by its own delayed sonic boom. **Confirm this again before
  shipping** (the move lists of the major football anime and their games); if one turns up, take it to the
  owner before release.
- **Not a Captain Tsubasa move**: none of its named shots, no twin shot, no spinning dip, no keeper grinding
  the ball. The grab and return gestures, the vapour disc halo, the dead stop with the thunder wall behind
  it and the goal shoved off its line are not known moves.
- Real football underneath: a 30 m instep strike with a big back-lift. The grab and the blow are
  play-acting gestures kids can copy.
- Not Khmer-styled (owner rule): storm, air and stadium; no traditional instruments or motifs (the G-B-D
  air tones are a plain triad).
- **The banned word (d-r-i-v-e) appears nowhere** in names, captions, identifiers, cue labels or comments:
  use `gale`, `strike`, `hammer`, `shot`, `push`.

## 2. Palette and grade

Constants in `./common.ts` (`PAL`, `HEX`; v1 values kept, new entries marked):

| name | hex / ramp | use |
|---|---|---|
| `ice` | `#EEFBFF` | cores, title fill, vapour core, ball core, contour lines in iso stage 1 |
| `cyan` | `#46D8FF` | energy, isobars, rims, glints, the orb core, implosion lines |
| `cobalt` | `#2D52E0` | **halo, stroke and iso band only**: the ball's halo ring (normal blend), title and letter strokes, iso band 2, crater core rings and disc contour rings; never an additive glow |
| `navy` | `#0A1238` | the dark halo behind every glow (normal blend), iso band 1 |
| `stormNavy` (new) | `#060B24` | crushed backgrounds (shot 2 void, shot 6b swing) |
| `pressed` | `#9BE08A` | pressed-grass highlight (wake, craters, crop circle) |
| `pressedCore` | `#1E5A2A` | pressed groove at the wake's centre, crater shadow |
| `vapor` ramp (new) | `[255,255,255] > [226,246,255] > [170,220,250] > [90,140,200]` | condensation: cone, disc, torus, shards, mist |
| `storm` ramp (new) | `[200,214,240] > [120,136,170] > [58,70,104] > [20,26,48]` | cloud lid, dust curtain, ground fog (normal blend) |
| `cobalt`, `dew` ramps | as v1 | sparks, dew beads |

- Ball after the strike: `drawBall(..., 'cobalt')`, ice core (heat 0.8), navy halo. The `'cobalt'` branch of
  `drawBall` (GALE-only) is re-layered: navy halo (normal) → cobalt halo ring (normal blend, r × 2.6,
  alpha 0.35) → **cyan** additive outer glow (r × 4.0, alpha 0.4) → ice core; v1's additive cobalt sprite
  (r × 4.6) is gone.
- **Hot colours are ice and cyan.** Cobalt is halo, stroke and iso band only and is never the largest
  additive glow in a frame: `#2D52E0` sits only 28° of hue from SOLO's uv `#7A4DFF`, so a big cobalt bloom
  would read as SOLO's ultraviolet. Every additive layer (cone shell, orb core, aura, rims, sparks' heads,
  crater glow lines, eye streaks) is ice or cyan.
- Particles: `'cobalt'`, `'dew'`, `'vapor'`, `'storm'`. No orange, crimson, violet or jade anywhere.

**Grades** (`common.ts`; they replace v1's high-key `galeGrade`):

| helper | tint | sat | contrast | vignette | bloom / thresh | use |
|---|---|---|---|---|---|---|
| `galeStorm(fx, k)` | `[186,206,255]` | 0.92 | 1.14 | 0.60 | 1.0 / 0.62 | default, all shots |
| `vacuumGrade(fx, k)` | `[170,198,255]` | 0.75 | 1.20 | 0.72 | 0.9 / 0.62 | the inhale freeze, the barrier swing, the dead stop |
| `floodBack(fx, u)` | `[235,245,255]` → storm | 1.05 → 0.92 over 0.3 s | 1.14 | 0.55 | 1.3 → 1.0 | 0.3 s after hammer 1, the detonation and hammer 2 |

- **Canvas darken pass**: `stormDarken(ctx, k = 0.45)` multiplies the backdrop by navy after the stadium
  and before any figure or additive layer, so the stands sit at 35-40 % brightness and the vapour, aura,
  eyes, craters and ball are the only hot pixels.
- **Picture targets** (6 fps film, `tools/metrics.py`): deep shadow (L < 0.12) **40-50 %** (v1: 11 %), hot
  pixels (L > 0.85) **3 %+** (v1: 1.4 %), violent frame changes **18+ per 100 frames** (v1: about 9),
  luminance contrast **0.18+** (v1: 0.145).

## 3. Continuity (all shots)

**Setting.** Night, a **storm** over the stadium: a low cloud lid scudding fast over the roofline (never a
place, only a ceiling on wide shots; it hides the moon), wind-blown mist streaks across the floodlight
glare, flags and scarves whipping in the stands. The floodlights stay **on** (SOLO turns them off); their
glare is bent by the pressure lens. No rain, no lightning. Dew on the grass is the move's particle
material.

**Direction and characters.**
- The goal is to the **right** (+x). No.10 faces **east** in side views (studio frames are drawn east;
  GALE never mirrors). He is right-footed: the near (right) leg kicks, the far (left) leg plants.
- No.10 is always studio-drawn (library frames + the new strips in §9). **Never a puppet**, in the field
  and result views too. No.7 does not appear.
- Defenders: the **wall of three** (`RIVAL_KIT`, `RIVAL_KIT_B`, `RIVAL_KIT_C`), puppets. The keeper
  (`KEEPER_KIT`): puppet body, plus the drawn `KeeperFront` bust for close-ups. At most 3 puppet renders
  per frame, all through the shared `PuppetCache` (§10.0).

**Field positions** (field coordinates, 10 px = 1 m; `common.ts` constants):

| item | x | m from goal line | z | shot / local t |
|---|---|---|---|---|
| `STRIKE` | 880 | 30 | 266 | 5 / 0.08 |
| air step 1 (`STAMPS[0]`) | 930 | 25 | 259 | 6 / 0.15 |
| `WALL` (three defenders, arms linked) | 960 | 22 | 246 / 262 / 278 | 6 / 0.28-0.68 |
| air step 2 (`STAMPS[1]`) | 1010 | 17 | 247 | 6 / 0.82 |
| `BARRIER` (the vapour disc) | 1045 | 13.5 | 241 | 6 / 1.10-1.60 |
| air step 3 (`STAMPS[2]`) | 1120 | 6 | 231 | 6 / 2.45 |
| `KEEPER` (the dead stop) | 1158 | 2.2 | 226 | 7 / 0.06-1.50 |
| net, far top corner | 1180 | 0 | 222 | 8 / 0.40 |
| `GOAL_SLIDE` | +28 | the frame ends **2.8 m** behind its painted line (anime licence, as the 2x hero ball: a true 1.2 m was 9-11 px on screen) | | 8 / 0.48-0.95 |

**The ball's flight.**
- **Knuckle ball**: near-zero spin, panels turning at most 15°/s, and **dead still** during the stop.
- It never touches the grass after the strike: three air steps (each dips to 0.15 m with a ≥ 4 px air
  sliver under the ball).
- Heights (m): 0.4 at the strike → 0.15 at step 1 → **0.35 under the wall** (top of the ball 0.46 m; the
  lowest stud of the jumping wall 0.62 m) → peak 0.7 → 0.15 at step 2 → **1.2 at the barrier** → 0.15 at
  step 3 → **1.5 at the keeper's fists** → **1.9 into the net** (crossbar 2.44 m). Peaks only climb; it
  never rises high and dips, never enters the sky.
- **Hero-ball scale**: in shots where the ball is the subject and no boot touches it (6, 7, 8a), it may be
  drawn up to **2x true scale** (as anime does). Never next to No.10's boot (shots 4 and 5 use the
  library's true ball). The goal's slide (`GOAL_SLIDE` 28, 2.8 m) takes the same licence, so the climax
  reads as "the goal moved", never as "the net ballooned".

**Wind map** (hair, hems, flags and particles obey it; it is the move's continuity of air):

| shot | wind |
|---|---|
| 1 | light gust west → east from 1.05 (his hair lifts) |
| 2 | outward at the lens (0.00-0.28), then **sucked into the fist** |
| 3 | updraft inside the eye (hair and hem up); the cyclone orbits counter-clockwise and the aura wraps him with it; from 1.62 it bursts **outward** past the lens |
| 4 | **toward the boot** (vacuum); the keeper's hair 30 m away is pulled west |
| 5 | blasted **west** off the contact (hair back), then pulled **east** by the wake from 1.00 |
| 6 | the ball's own wind: along the flight line, east |
| 7 | dead calm at the stop; then **east**, ahead of the oncoming thunder wall |
| 8 | blast east; the stadium wave left → right |
| 9 | dies: his hair falls for the first time in the film |

**Sound rule: vacuum, then blast.** The master muffle (v1's low-pass bus) closes fully (≥ 0.8) only in
**three vacuum gaps**, each ending in a blast within 0.1 s of opening; total ≤ 2.0 s (v1: about half
the film). Inside a gap the dry bus keeps breath, whine, the sub-drone or a glass ring, so it never reads
as a bug. Shot 3's calm inside the eye is a half muffle (0.45) under a dry howl.

| `MUFFLE[n](t)` | curve (unwarped shot-local t) |
|---|---|
| 1, 2, 5, 8, 9 | 0 |
| 3 | 0 → 0.45 over 0.62-0.70; held; snap to 0 at 1.55 |
| 4 | 0 → 0.95 over 0.55-0.62 (gap 1, 0.85 s); snap to 0 at 1.40 |
| 6 | 1.0 from 1.10 (one frame) to 1.60 (gap 2, 0.50 s); snap to 0 at 1.60 |
| 7 | 0.9 from 0.24 (with `sfx.clearBus()`) to 0.80 (gap 3, 0.56 s); ramp to 0 by 1.10 under the rising thunder |

`Shot.muffle` and `sfx.clearBus()` work as in v1: every GALE `init` calls `sfx.clearBus()`.

**Text.** At most three words on screen at a time: GALE HAMMER, 30 M, GOAL! (plus the small tag and the
name card). Never the forbidden word (d-r-i-v-e) in names, captions or identifiers: use `gale`, `strike`,
`hammer`, `shot`.

**Times.** All times are shot-local `t` on the runner's unwarped clock. `rate(t)` only slows `update`;
sprite frames, the camera, cues, the muffle and screen-space effects are scheduled on `t` exactly as
listed. Every decal and rig state (craters, wake, crop circle, goal rig) is a pure function of the shot
clock, rebuilt in `init`, so each shot seeks exactly.

## 4. Pacing and escalation

| # | Shot | Dur | Global |
|---|---|---|---|
| 1 | Thirty metres (the dare) | 1.2 | 0.0-1.2 |
| 2 | Grab the wind (declaration, title) | 1.6 | 1.2-2.8 |
| 3 | Eye of the storm (monument) | 2.0 | 2.8-4.8 |
| 4 | The inhale (the breath) | 1.8 | 4.8-6.6 |
| 5 | Hammer (strike, recoil) | 1.5 | 6.6-8.1 |
| 6 | Sound barrier (the ball's scene) | 2.8 | 8.1-10.9 |
| 7 | Dead stop (the false defeat) | 1.5 | 10.9-12.4 |
| 8 | Thunder hammer (climax, the goal moves) | 2.4 | 12.4-14.8 |
| 9 | Return the wind (the pose) | 1.9 | 14.8-16.7 |

```
feeling  TEASE  RESOLVE  AWE        DREAD       BOOM!   WONDER         TERROR(def)  FALSE DEFEAT  SUSPENSE  CATHARSIS      PRIDE
shot     1      2        3          4           5       6              6            7             7         8              9
global   0.0    1.2      2.8        4.8         6.6     8.1            9.7          10.9          11.3      12.4           14.8   16.7
power    ▁      ▃▄       ▅▆(calm)▆  ▆ ▁▁▁▁▁ ▆   █▇▅     ▅▆ ▁▁(halo) █   ▇▆           ▅ ▁▁          ▂▃▅▆      ███▇▇▆         ▃▂▁
```

**No.10's hits, each bigger than the one before** (the keeper's punch is the opponent's counter-beat and
deliberately smaller):

| global t | beat | sound peak | picture |
|---|---|---|---|
| 1.70 | the grab | kick 0.6 + boom 0.5 | shock 0.04, cyan flash 0.45 |
| 2.65 | ring-pop | crack 0.9 + boom 0.6 | full-frame ring, flash 0.6 |
| 4.35-4.65 | eyes ignite; the cyclone bursts outward | crack 1.0 + boom 0.7 | the wall blown past the lens, `cam.shove(0, -14)`, zoom 1.42 → 1.15 |
| 5.22 | the plant | kick 0.5 | crater, cam.hit 0.35 |
| **6.68** | **HAMMER 1** (40 %) | **kick 1.4 + boom 1.3 + crack 1.0** | 12-layer stack, isobar ×2, blow-back |
| 7.18 | release | sonicBoom 1.0 | vapour collar, barrier torus |
| **9.70** | **SOUND BARRIER DETONATION** (58 %) | **sonicBoom 1.4 + boom 1.35 + crack 1.2 + kick 1.0** | disc shatters, 2 full-frame shocks, isobar ×2, the wall flung, a defender at the lens |
| 10.55 | air step 3 | boom 0.7 + crack 0.6 | 400 px crater under the lens |
| 10.96 | the keeper's punch (counter) | kick 1.1 + boom 0.9 | shock 0.045, then silence |
| **12.50** | **HAMMER 2, the thunder** (75 %) | **hammerBoom 1.5 + kick 1.4** (the loudest moment) | 12-layer stack, 3 shocks, the cone reborn ×2, blow-back |
| 12.80-13.35 | the goal is shoved 2.8 m | boom 1.1 + metalGroan + 6 pegPops | the frame skids, pegs, furrows, crossbar U; dome ≤ 1.0 |
| 13.35-14.02 | the proof push | kick 0.5 (the stop), clods, under the roar | zoom 1.9: the painted line and the post foot 53 px apart |
| 14.02 | the stadium hears it; GOAL! rides its wind wave | boom 0.8 (wet) + gust 0.8 + crowd, under the roar | stadium wind wave, boards fold, GOAL! on the wave |

**Every cut lands on a punch**: wind wipe, ring-pop, wind wipe out of the bursting cyclone, smash cut on
motion, whip-pan, hard cut on contact, hard cut on the touching front, wind wipe, fade. No soft blinks and
no white flash on any cut.

### 4.1 Photosensitivity budget (a game for children)

**Flashes.** At most **3 full-frame events in any 1 s window**, across cuts. The counting rule is the set's
single **FlashBudget** definition (§10.1 item 6), which MERIDIAN and SOLO import unchanged: an event is the
rising edge of `fx.flash ≥ 0.3`, `fx.impact ≥ 0.5` or `fx.iso ≥ 0.5`, or a shot-flagged full-frame wipe or
shroud (`fx.fullFrame`). Wind wipes cover ≤ 50 % of the frame on any frame and do not count. Crowd lights,
glints and shocks are local and do not count. No saturated red, nothing strobes, impact stages last
≤ 0.08 s.

| # | global t | event |
|---|---|---|
| E1 | 1.70 | clench flash 0.45 cyan |
| E2 | 2.65 | ring-pop flash 0.6 |
| E3 | 3.25 | punch-through wind bands (`fullFrame`) |
| E4 / E5 | 6.68 / 6.74 | hammer 1, iso stages 1 and 2 |
| E6 / E7 | 9.70 / 9.76 | detonation, iso stages 1 and 2 |
| E8 / E9 / E10 | 12.50 / 12.57 / 12.72 | hammer 2, iso stages 1 and 2; the white shroud (`fullFrame`) |

Worst window: 12.50-13.50 with 3 (the limit). All others ≤ 2. Shot 3's exit (the cyclone burst: its bands
cover ≤ 45 % of any frame, and the old exit ice flash is gone), shot 4's ice smash, shot 5's release,
shot 6's air steps and the GOAL! are deliberately not flashes. The `FlashBudget` guard asserts this table
in dev captures and clamps any extra event at runtime.

**Patterns.** The isobar frame is a full-frame pattern of bands and contour lines, and broadcast
photosensitivity guidance treats large high-contrast regular patterns, and their reversal, as a hazard
separate from flashes. So:
- **Stage 1** (the weather map) holds **at most 4 light/dark band pairs** across the frame: `isoBands` 4, a
  monotonic radial term (no repeating rings), contour lines only on band boundaries, `isoWob` ≤ 0.02. The
  dev capture counts band changes along the row and the column through the contact: ≤ 8.
- **Stage 2** (the negative print) is **a different geometry, never stage 1 inverted**: luminance-only
  bands (`isoMix` 0, 3 bands, no rings, no wobble) that follow the picture's own shapes, so no frame is the
  contrast reversal of the frame before it.
- The thunder wall is at most 3 moving refraction rings and a 1-2 px ice edge line, never stripes; wind
  wipes use irregularly spaced streaks; the isobar spiral of shot 2 is 2-3 px cyan lines at alpha 0.7 over
  the void (low contrast against cyan streaks, never a black/white pattern).

## 5. Shots (durations are fixed: do not change them)

| # | File / export | Dur | Seed | `name` |
|---|---|---|---|---|
| 1 | `shot1_dare.ts` / `shotDare` | 1.2 | 311 | "Thirty metres" |
| 2 | `shot2_grab.ts` / `shotGrab` | 1.6 | 312 | "Grab the wind" |
| 3 | `shot3_eye.ts` / `shotEye` | 2.0 | 313 | "Eye of the storm" |
| 4 | `shot4_inhale.ts` / `shotInhale` | 1.8 | 314 | "The inhale" |
| 5 | `shot5_hammer.ts` / `shotHammer` | 1.5 | 315 | "Hammer" |
| 6 | `shot6_barrier.ts` / `shotBarrier` | 2.8 | 316 | "Sound barrier" |
| 7 | `shot7_deadstop.ts` / `shotDeadStop` | 1.5 | 317 | "Dead stop" |
| 8 | `shot8_thunder.ts` / `shotThunder` | 2.4 | 318 | "Thunder hammer" |
| 9 | `shot9_return.ts` / `shotReturn` | 1.9 | 319 | "Return the wind" |

Total **16.7 s** at 1×. The v1 files (`shot1_cutin.ts` … `shot6_footprints.ts`) are deleted; helpers that
v2 still uses stay in `common.ts`, the new heavy canvas FX go to `gale/air.ts`, the goal rig to
`gale/goal.ts` and the 2.5D swing to `gale/swing.ts` (§10).

| # | Shot | What happens | Cut into the next shot |
|---|---|---|---|
| 1 | Thirty metres | The keeper smirks and beckons; the camera flies 30 m backward over a wall of three locking arms, a 30 M counter clacking up; No.10 traps the ball dead | Wind wipe |
| 2 | Grab the wind | Full-frame chest-up: his palm thrust at the lens, the wind reverses and is sucked into his fist, GALE HAMMER is sucked in with it; isobar spiral, implosion lines, the eye streak | Ring-pop from the fist |
| 3 | Eye of the storm | Outside a stadium cyclone, punch through its wall; inside the calm eye he stands at 255 px; crop circle, bent floodlights, a wind aura wrapping him with the cyclone; his eyes ignite and the cyclone wall bursts outward past the lens | Wind wipe |
| 4 | The inhale | Run-up, plant, the **hammer leg**; time freezes; the storm is sucked into a pressure orb on his boot in three lurches; the keeper's hair pulled from 30 m; his eyes in a dew drop; the ice smash | Smash cut on motion |
| 5 | Hammer | Macro: the 109 px ball crushed on the laces under the isobar impact frame; release, vapour collar, barrier torus; the camera is blown back; he skids; the pressed wake unzips toward the goal | Whip-pan motion cut |
| 6 | Sound barrier | **The ball's scene**: ride with the 65 px ball under the airborne wall; silence; swing round to the halo of the 320 px vapour disc; **loud detonation**; the wall flung, one defender at the lens; ball's-eye chase POV, the keeper's fists at the lens | Hard cut on contact |
| 7 | Dead stop | One punch: the ball stops dead in front of his fists; silence; he grins at us while the thunder wall races toward him in the background | Hard cut as the wall's ice edge touches the ball |
| 8 | Thunder hammer | The wall hammers the ball through his fists; he is folded and cartwheeled out; blow-back; the goal is ripped off its pegs and shoved 2.8 m; the camera cranes down onto the painted line and the near post foot 53 px behind it, then pulls out as the stadium's wind wave carries GOAL! in | Wind wipe |
| 9 | Return the wind | Front: he opens his fist, a tiny tornado spins on his palm, he blows it at us; the gust flies down the wake past the three craters to the shoved goal; name card | Fade to `[8,4,14]` |

---

## 6. Shot by shot

Conventions: "×n" = integer studio draw scale (nearest neighbour); "zoom" = `cam.zoom`; on-screen size =
draw scale × zoom. `drawBall(r, D)` is r × D px in radius before zoom. `warp` rows are `kit.warp(t,
[[start, len, rate]])` windows on top of the listed ramps. Side-rail shots use field metres for camera
centres; the ground row is `GY` 300 as in v1.

### 1 · Thirty metres (1.2 s): the dare

**Story job.** The stakes: it is far, there is a wall, and the keeper thinks it is funny.

**Setting.** Side rail, storm grade from frame 1: `drawFieldBackdrop(..., { storm: 1, wind: 0.4 })` +
`stormDarken(0.45)`; flags flutter. Sprites at ×2 (No.10 196 px, puppets k 2).

**Camera**

| t | centre | zoom | ease / notes |
|---|---|---|---|
| 0.00 | the keeper's chest (1.8 m out) | 1.50 | flash-in 0.25 `[190,240,255]` (not a counted flash); push to 1.53 by 0.38 |
| 0.38 | same | 1.53 | **reverse whip-truck** starts: inOutExpo, 0.52 s |
| 0.64 | 14 m | 0.95 | mid-move: `fx.streak` 0.05 along −x, `fx.radial` 0.06; passes the wall at 22 m |
| 0.90 | No.10 + 0.8 m lead (29.2 m) | 0.80 | lands: `cam.hit(0.2)`, `cam.shove(-6, 0)` |
| 1.20 | same | 0.77 | 4 % settle (outQuad) |

**Beats**
- 0.00-0.38 the keeper (`KeeperFront` at ×2 over the goal-end world; face about 120 px): KF1 smirk with
  his right glove raised palm-up (0.00), **KF1b** fingers curl (0.14), KF1 (0.22), KF1b (0.30): *come on*.
  When the truck starts, the bust leaves frame right inside 0.08 s under the streak.
- 0.45-0.75 the wall: three defenders side-step into a line at 22 m and **lock arms** (`wideBlock`, hands
  linked), faces to No.10. The camera rushes past them at their shoulder height.
- 0.90 No.10 traps the rolling ball dead under his sole: Settle F1 (0.90), F3 (0.98), F3b (1.10).
- 1.05 the first gust lifts his hair (F3b); his head lifts toward the goal.

**VFX**
1. Storm backdrop: cloud lid, mist streaks, stands at 35-40 %.
2. **30 M counter**: `PIXEL_FONT` 28 px, cyan with a 2 px navy outline, bottom centre (320, 318); counts
   0 → 30 in 5 m steps over 0.40-0.88 (each new digit clacks in with a 1-frame 115 % pop), then stamps at
   0.90 (squash 1.3/0.7 → 1 in 0.08 s).
3. 40 horizontal speed streaks during the truck.
4. At the trap: `airCrater` R 24 (one ring) + a dew crown of 12.
5. Wind 0.4 → 0.7 at 1.05 (flags, his hair).

**Rate.** 1 throughout.

**Sound**

| t | sound |
|---|---|
| 0.00 | `crowd(1.2, 0.35)`, `rumble(1.2, 0.2)` |
| 0.38 | `whoosh(0.5, 300, 2400, 0.5, -0.4)` |
| 0.45-0.85 | **digit clacks**, one per step every 0.08 s, rising: `blip(1200)`, `blip(1320)`, `blip(1440)`, `blip(1560)`, `blip(1680)`, `blip(1800)` at 0.18 (never `tick()`: ticks are MERIDIAN's watch) |
| 0.90 | `scuff(0.3)` + `kick(0.4)` (the trap); `kick(0.3)` + `boom(0.3)` (the counter stamp) |
| 1.05 | `gust(0.6, 0.25)` |
| 1.08 | `whoosh(0.15, 800, 5000, 0.4)` (the wipe) |

**Cut.** **Wind wipe** (GALE's new transition, `windWipe`): 1.08-1.20, sixty ice/white streaks 2-6 px
tall sweep left → right with navy halos; shot 2 is revealed behind the trailing edge.

### 2 · Grab the wind (1.6 s): the declaration and the title

**Story job.** No.10 answers the dare: he grabs the stadium's wind in his fist, and the special gets its
name. Replaces v1's small elliptical window with a full-frame hero. Kids will copy it: *reach, grab, pull*.

**Composition** (screen space)
- Background: the `stormNavy` void with a giant **isobar spiral** (`isobarSpiral`): 8 cyan contour loops,
  2-3 px, alpha 0.7, wobble `sin(5θ + 3t)`, centred on the fist point, tightening (radius × 0.6 per s)
  and turning at 0.8 rad/s; dew motes.
- No.10 **`WindHand` at ×3** (a bust drawn at twice the figure scale, §9.1) under a composition zoom of
  1.25: chest-up, the frame cutting at mid-chest, centred x 300, head about 150 px; the `palm` anchor at
  about (360, 200). Cyan rim light on his right edge (additive 0.5).

**Camera** (screen-space composition). Zoom 1.25 → 1.30 (0.00-1.40). At 0.50: punch +0.06 (back over
0.25 s), `cam.hit(0.5)`, `shakeAmp` 10. 0.80-1.40: tremor, trauma held 0.3 (`shakeAmp` 6). 1.45:
`cam.hit(0.6)`.

**Beats**
- 0.00-0.28 **WH1**: open palm thrust at the lens (about 140 px wide). Sixty wind streaks pour *out* past
  him toward us; his hair is blown back.
- 0.28-0.50 **WH2**: his fingers curl. The streaks slow, bend and **reverse**, spiralling into the palm;
  160 **implosion lines** start streaming inward to the palm.
- 0.50 **WH3, the clench** (at arm's length):
  - every streak is sucked into the fist in 3 frames; a 40 px cyan orb glows between his fingers;
  - the isobar loops snap inward (radius × 0.8 in 2 frames);
  - `fx.shocks` at the fist (r 0 → 0.35, s 0.04); a `PK.Ring` in `'cobalt'`; cyan flash 0.45
    `[70,216,255]` for 2 frames (**E1**).
- 0.52-0.87 **the title is sucked in**: GALE HAMMER, letter by letter (0.035 s apart), flies in from the
  four frame edges toward the fist and stops on an arc of radius 170 px above it (−150° to −30°).
  - `TITLE_FONT` 70 px, ice fill, 3 px cobalt stroke, 2 px navy outer stroke.
  - Each arrives squashed to 60 %, springs to 110 %, settles at 100 % (0.08 s), and stamps a small
    isobar ring and a cyan spark.
  - Tag at 0.90: `SPECIAL SHOT · No.10 · 30 M` (`PIXEL_FONT` 9 px, cyan) under the arc.
- 0.75 **WH4**: the fist pulled to his chest. From 0.87 WH4 / **WH4b** alternate every 0.12 s (a drawn
  tremble); eight thin cyan wisps leak between his knuckles.
- 1.00 eye glint: `sparkle` on both eyes, a **600 px anamorphic cyan streak** through the eyes
  (`anamorphic`, 2 px core, 10 px soft), `lensFlare [120,220,255]`, bloom 0.9 → 1.3 → 1.0 over 0.25 s.
- 1.05-1.40 the letters wobble on the isobars; the loops tighten.
- 1.38 a crack of light between his knuckles (a 3 px ice line).
- 1.45 **ring-pop** from the fist (kept from v1): `fx.shocks` r 0 → 1.2 over 0.15 s, s 0.05; `PK.Ring`;
  flash 0.6 `[220,248,255]` (**E2**); the title shards blow outward.

**VFX layers.** Isobar spiral, implosion lines, dew motes, wind streaks (out, then in), rim light, orb in
the fist, knuckle wisps, title with ring stamps, anamorphic eye streak and flare, shock rings, flash.

**Rate.** 1.

**Sound**

| t | sound |
|---|---|
| 0.00 | `stinger()`; `howl(0.5, 0.35)` (the wind pouring out) |
| 0.50 | `inhale(0.25)` cut off hard + `kick(0.6)` + `boom(0.5)` |
| 0.55 / 0.64 / 0.73 | `airTone(G5)`, `airTone(B5)`, `airTone(D6)` at 0.3: **the motif's first statement**, riding the letters |
| 1.00 | `shing(1.2)` |
| 1.45 | `crack(0.9)` + `boom(0.6)` + `earPop(0.5)` |

**Cut.** Ring-pop; hard cut at 1.60.

### 3 · Eye of the storm (2.0 s): the monument

**Story job.** Awe: he is bigger than the weather. GALE's answer to ZENITH's fire aura and CRESCENT's
inverted stadium. Money shot 1.

**Setting.** Front, low angle (eye about 1 m), looking west at him; behind him the west stands under the
cloud lid, flags whipping, floodlights. He stands 3 m behind the ball.

**Camera** (a `keys()` track)

| t | zoom | centre / move | notes |
|---|---|---|---|
| 0.00 | 0.85 | his chest, outside the cyclone | push inCubic; trauma 0.35, `shakeAmp` 10 |
| 0.45 | 1.20 | | **punch-through** begins; `cam.hit(0.4)` |
| 0.60 | 1.30 | inside the eye: he is **255 px** (StormStand ×2) | calm; creeping tremor trauma 0.2 → 0.45, `shakeAmp` 6 |
| 0.85 / 1.15 / 1.32 | +0.03 each (1.33 / 1.36 / 1.39) | crane up 10 px each | `'step2'` lurches that hold (the cyclone tightens), spaced like quickening breaths (0.30 s, then 0.17 s): never an even beat, so they never read as SOLO's on-the-beat snaps |
| 1.32-1.55 | 1.39 → 1.42 | | slow creep (linear) |
| 1.55 | 1.42 | unchanged | SS3: **the eyes ignite at this framing** (≤ 1.45): no push, no crash |
| 1.62-1.85 | 1.42 → 1.15 (outCubic) | | **the eye bursts**: the cyclone wall blasts outward past the lens; `cam.shove(0, -14)`, `cam.hit(0.5)`, trauma 0.6 |
| 1.85-2.00 | 1.15 | | wind wipe into shot 4 |

No crash onto the eyes (that is ZENITH shot 2's ending: an inExpo crash onto the eyes and a white flash)
and no third suction beat in a row (the fist in shot 2 and the boot in shot 4 are GALE's suctions): shot 3
ends by **blowing outward**, a small blow-back (§1.3).

**Beats**
- 0.00-1.55 **StormStand** SS1 / SS2 alternate every 0.1 s (a 10 fps loop): wide stance, arms loose, hair
  and shirt hem whipping **up** in the updraft, still as a statue.
- The **ball** sits in the foreground bottom-right, 3 m in front of him, about 55 px; it trembles ±1 px toward
  him at 20 Hz and lifts 3 px on each crane lurch, then settles.
- 1.55 **SS3**: his head snaps up to the lens and his eyes ignite.
- 1.62 the calm breaks: the cyclone wall he has been holding in place **blows outward**, past us; the ball
  is rocked 4 px toward the lens and settles; his hair and hem stay up, he does not move.

**VFX** (the giant energy shape of this shot is the cyclone)
1. **Cyclone wall** (`cycloneWall`): footprint ellipse rx 220 × ry 40, 260 px tall; 14 bands 3-8 px thick,
   ice and cyan, alpha 0.4-0.9, orbiting at 1.4 rev/s; back halves drawn before him, front halves after.
   Debris rides the bands: grass, dew, 3 paper cups, a spinning corner flag, a scarf torn from the stands.
   Outside (0.00-0.45) the wall fills the frame and he is half-hidden inside it.
2. **Punch-through** (0.45-0.60): front-arc wind bands at parallax 2.5 cover 80 % of the frame for
   0.15 s; radial 0.2, CA 0.01 (**E3**, `fx.fullFrame`).
3. **The calm eye**: 30 dew beads hang motionless round him, glinting.
4. **Wind aura** (`windAura`): up to 30 streamers per frame, each a **horizontal arc** wrapping his body:
   20-60° of an ellipse centred on his axis at the height of the row it was sampled from the studio
   `Silhouette` (rx = his half-width at that row + 6-18 px, ry = 0.22 × rx), the back half drawn before him,
   the front half after. They **travel tangentially with the counter-clockwise cyclone** at its 1.4 rev/s,
   rise at most 10 px/s and fade along the arc; ice and cyan over a navy halo. They **never peel upward off
   the silhouette edge** (ZENITH shot 2's edge flame; MERIDIAN 2a's ink tendrils) and there are **no copies
   of his silhouette** (the v2 draft's `windSmear` is deleted: two sideways cyan copies are SOLO's Chorus
   language, whatever the shear).
5. **Isobar crop circle** (`airCrater` rings, ground squash 0.25) pressed into the turf under him: r 50
   at 0.60, then 110 / 170 / 240 px at the three crane lurches (0.85 / 1.15 / 1.32); each adds a dew spray
   of 20 and a turf shock (s 0.02). At 1.62 its rings blow outward (r × 1.6) and fade by 1.85.
6. **Lens pinch** at his chest, `lensR` 0.6: −0.06 at 0.60, then −0.12 / −0.17 / −0.22 at the lurches:
   the stands and floodlights bend in toward him. At 1.62 the pinch releases −0.22 → 0 by 1.75 (outCubic):
   the stadium springs back out.
7. **Bent floodlight beams**: volumetric cones (additive, alpha 0.15) drawn already bent toward him, so
   the bend reads even in a paused frame; they spring straight with the lens at 1.62.
8. Cyan rim from behind (additive 0.6); mist streaks across the floodlight glare; bloom 1.0, vignette 0.6.
9. 1.55 **eyes ignite** at the current framing (zoom 1.42): two cyan points, 300 px anamorphic streaks,
   `lensFlare`, bloom 0.9 → 1.3.
10. 1.62-1.85 **the burst**: `cycloneWall(..., { burst })` with `burst` 0 → 1 (outCubic): the bands fly
    outward (radius × 1 → 2.6) and the front arcs sweep past the lens at parallax 2.5. They cover ≤ 45 % of
    any frame (the centre stays open on him), so it is not a counted full-frame event. The cups, the corner
    flag and the scarf are flung past the camera; dew sprays outward; radial 0.10 centred on his chest;
    CA 0.008.

**Rate.** 1.

**Sound**

| t | sound |
|---|---|
| 0.00 | `howl(2.0, 0.5, 1.2)` + `rumble(2.0, 0.4)`; `sfx.duck(0.4, 2.0)` |
| 0.45 | `whoosh(0.4, 300, 3000)` (punch-through) |
| 0.62-1.55 | muffle 0.45: the calm inside the eye, the howl low-passed |
| 0.85 / 1.15 / 1.32 | `kick(0.35)` + `boom(0.25)`: felt thumps (ear-pops are the inhale's) |
| 1.55 | `shing(1.2)` + `breath(0.3)` |
| 1.62 | `crack(1.0)` + `boom(0.7)` + `whoosh(0.35, 3000, 250, 0.6)` (the wall blown past us) + `gust(0.5, 0.4)`; the howl cut off |
| 1.85 | `whoosh(0.15, 800, 5000, 0.4)` (the wipe) |

**Cut.** **Wind wipe** (`windWipe`, as shot 1) at 1.85-2.00 on the tail of the burst. No flash.

### 4 · The inhale (1.8 s): the breath before the strike

**Story job.** Dread. A coiled hammer, silence, and the whole storm sucked into one boot. The
freeze-then-release both loved specials have, done GALE's way: a **vacuum**, not a time-stop.

**Setting.** Side view at knee height, storm grade, foreground grass blades (parallax 1.6). No.10 at ×2
(196 px), the ball at the library's true scale (r 6 × 2).

**Camera** (a `keys()` track; the three lurches use the `'vacuum'` preset)

| t | zoom | centre | notes |
|---|---|---|---|
| 0.00 | 1.10 | his hip + 60 px lead | trucks right at his run speed |
| 0.42 | 1.10 | locks at the plant | `cam.hit(0.35)` |
| 0.66 | 1.40 | midpoint of the orb and the ball | **vacuum pull** lurch 1 (2 frames, holds) |
| 0.88 | 1.80 | same | lurch 2 |
| 0.94-1.14 | (insert 4b) | | |
| 1.20 | 2.30 | same | lurch 3: orb and ball both in frame (orb top-left, ball bottom-right) |
| 1.40 | 2.30 → 2.40 | onto the boot | snap: punch +0.1, `cam.hit(0.5)`, radial 0.18 on the boot |
| 1.48-1.80 | 2.40 → 2.20 | pans 30 px right with the boot | trauma 0.5 |

**Frames.** Run R1 0.00 · R2 0.06 · R3 0.12 · R4 0.18 · Approach AP2 0.24-0.42 · Strike F5a 0.42 (the plant)
· **HammerCock HC1 0.48 · HC2 0.68 · HC1 0.88 · HC2 1.08 · HC1 1.28 · HCs 1.44** · Strike F6 1.50-1.80.
F5a → HC1 → HCs → F6 share the plant toe pixel; AP2 sits on `pelvis`.

**Rate.** 1 to 0.42; 1 → 0.06 over 0.42-0.55 (outQuad); **0.06 held to 1.40** (the 0.85 s breath);
0.06 → 1 over 1.40-1.46 (inExpo); **1.3 from 1.46** (the leg moves faster than life).

**Beats and VFX**
- 0.00-0.42 run-up: the cyclone collapses into a funnel trailing behind him; each footfall stamps a small
  ring (`airCrater` R 30) and blows dew.
- 0.42 **plant**: `airCrater` R 30 + a dew crown of 16 + `dustBurst` 10 + a turf shock (s 0.02).
- 0.48 **HC1, the hammer leg**: kicking leg raised high behind, heel above the hip, torso pitched forward,
  arms flung wide. The silhouette of the special.
- **Pressure orb** (`pressureOrb`) on the `boot` anchor from 0.48: R 20 world px (**92 px across at zoom
  2.3**), cyan core, 3 isobar rings wrapping it at tilts turning 0.6 rad/s (unwarped); the funnel
  collapses into it over 0.48-0.62.
- **The vacuum**:
  - 80 white **wind lines** converge into the boot at 900 px/s on the unwarped clock: the only fast thing
    in a frozen world;
  - `inhaleField` with 300 particles: plucked grass blades (`PK.Blade`), dew, dust, two paper cups;
  - the flags in the stands all point toward him; the mist streaks bend toward the boot.
- **Lens pinch** at the orb, `lensR` 0.35: −0.18 / −0.26 / −0.35 at the three lurches (2-frame snaps): the
  stadium is dragged in, one notch at a time. Each lurch also snaps the outermost isobar inward.
- **Grade**: `vacuumGrade` from 0.55; the orb, his rim and the wind lines are the only colour.
- **Insert 4b** (0.94-1.14, hard cut in and out, screen space): the keeper's face, `KeeperFront` **KF2**
  at ×2 on the right third over a navy blur of the goal: his hair, a sweat drop and the dew on his gloves
  stream **left**, toward No.10 30 m away; three cyan isobar arcs bend left; he gulps. The smirk is gone.
- **Dew mirror** (1.22-1.38, `dewMirror`): a dew drop on the trembling ball swells to 56 px; in it, his
  eyes (Glance G4 ×2) look down at the ball. Ice rim, one specular.
- 1.40 **the snap**: the orb is crushed into a flat disc on the laces (`crush` 0 → 1 in 0.08 s); the lens
  flips −0.35 → +0.15 in 2 frames and decays by 1.60; the wind lines reverse and blast outward.
- 1.44-1.80 **the ice smash** (v1's best frame, kept): 100 ice/cyan focus lines converge on the boot,
  speed streaks, CA 0.012; `smearArc` band from HC1's boot through F6's; the boot whips out of frame
  right at 1.74-1.80.

**Sound**

| t | sound |
|---|---|
| 0.00-0.18 | `howl` continues (0.4); `scuff()` × 4 |
| 0.42 | `kick(0.5)` |
| 0.48 | `inhale(0.5)` |
| 0.55 | **`vacuum(0.85)`** (gap 1: muffle 0.95; 38 Hz drone, tinnitus whine, air creaks) |
| 0.66 / 0.88 / 1.20 | `earPop(0.7)` / `earPop(0.85)` / `earPop(1.0)` |
| 0.94 / 1.00 | the gulp: `blip(520)`, `blip(360)` |
| 1.30 | `breath(0.3)` (dry) |
| 1.40 | the muffle snaps open; `whoosh(0.35, 200, 4000, 0.6)` |
| 1.74 | `whoosh(0.1, 1000, 6000, 0.5)` |

**Cut.** Smash cut on motion at 1.80, no flash: the boot whips out right; shot 5's macro boot enters from
the left.

### 5 · Hammer (1.5 s): hammer 1, the cone is born, the camera is blown back

**Story job.** BOOM. The first hammer blow. v1's macro squash, now a real detonation.

**Macro (0.00-0.62).** Screen space, grass level, dark grass bokeh, floodlight bokeh. StrikeMacro at MD 2,
the ball `renderBall` r 23 drawn ×2 (92 px at zoom 1, **109 px** at the punch zoom 1.18), dew beads on it.

**Camera**

| t | zoom | notes |
|---|---|---|
| 0.00 | 1.00 | locked |
| 0.08 | 1.00 → 1.18 in 0.05 s | **punch**; `cam.hit(1.0)`, `shakeAmp` 22, `shakeRoll` 0.015; `cam.shove(-14, 0)` |
| 0.08-0.58 | 1.18 → 1.10 | relax; trauma held ≥ 0.3 (micro-shake through the hit-stop) |
| 0.58 | 1.10 | release: `cam.hit(0.9)` |
| 0.62 | world view, 2.40 on the boot | **hidden swap** under the vapour collar |
| 0.62-0.87 | 2.40 → 0.90 (`'blowBack'`) | **BLOW-BACK**: `cam.shove(-40, -10)`, trauma 0.8 |
| 0.87-1.36 | 0.90 → 0.92 | settle; trucking back 60 px |
| 1.36-1.50 | x +500 px in 0.12 s (inCubic) | whip-pan right; `fx.streak` 0.06 along +x |

**Frames.** M1 0.00 (enters at full speed, 2-frame smear) · M2 0.08 · **M2c 0.14** (the deepest squash) ·
M2b 0.40 (rebound) · M3 0.56; then world view at ×2: Strike F7 0.62 · F8 0.66 · **F9r 0.80** (the skid:
10 world px back by 1.12, outQuad, two pressed skid streaks; the only planned foot slide in the film) ·
F9 1.12 · F10 1.30. Macro frames anchor on `laces`; F8 on `pelvis`; F9r on its plant heel; F9/F10 placed
from F9r's end.

**Rate.** `warp [0.08, 0.20, 0.03]`, `[0.28, 0.30, 0.12]`; 1 at 0.58; then **0.35 → 1 over 0.62-1.10**
(inQuad: the recoil in slow motion; dew and blades hang, then fall).

**VFX at contact (0.08): the 12-layer stack, all on the same frame**
1. **Isobar impact, stage 1** (0.08-0.14, **E4**): `galeIso(fx, 1, ballUV)`: four bands navy / cobalt /
   cyan / ice with ice contour lines on the band edges, `isoMix` 0.55 so the rings centre on the contact,
   **at most 4 light/dark band pairs** across the frame, `isoWob` 0.02. Navy + cobalt must cover 45 %+ of
   the frame.
2. **Stage 2, the negative print** (0.14-0.21, **E5**): `galeIso(fx, 2)`: luminance-only bands (`isoMix` 0,
   3 bands, no rings, no wobble), negative: the dark grass bokeh prints as an ice field, the boot and the
   crushed ball print navy with cobalt mids and navy contour lines. A different geometry from stage 1,
   never its contrast reversal (§4.1).
3. Two shock rings at the contact: s 0.07 at 0.08, s 0.045 at 0.14 (each r 0 → 0.9 over 0.35 s).
4. Lens bulge +0.40 at the contact, `lensR` 0.30, decaying over 0.5 s.
5. Squash `sx` 1 → 0.5, `sy` 1 → 1.32 over 0.08-0.40 (outQuad), dent, 5 ice ripple arcs across the panels.
6. A dew crown of 40 beads bursts off and hangs (nearly still at rate 0.03).
7. 70 ice sparks (`'cobalt'`) + 30 dew beads.
8. 120 ice/cyan focus lines: inward at 0.08, flipping to outward at 0.14.
9. CA 0.016; radial 0.08 at the contact.
10. Grass fanned flat in a 300 px ellipse, blades lifted (`makeBlades` + `leanAway`).
11. Bloom 1.3 (thresh 0.6); the floodlight bokeh pulses × 1.6.
12. `cam.hit(1.0)` + punch +0.18 + `cam.shove`.

**At release (0.58)**
- The ball springs back past round (`sx` 1.15), stretches 2.2× along the flight line and is gone in
  2 frames.
- **Vapour collar**: a white condensation ring bursts from the boot, r 30 → 160 px in 0.1 s (ice core,
  cyan rim, navy halo). It covers about 60 % of the frame at 0.62 and hides the swap.
- **Barrier torus** (`vaporTorus`): a white smoke ring hangs where the ball broke away, 40 → 260 px over
  0.6 s, breaking up.
- Shock s 0.05. No full-frame flash.

**The recoil (0.62-1.50)**
- The **vapour cone** streaks away toward the goal as a white javelin (`vaporCone` len 600, out of frame
  right in 0.15 s).
- The **pressed wake** unzips from his boot to the right edge in 0.25 s (`pressedWake`: grass combed pale
  in a V, the dark pressed groove at its centre, 40 px dew-mist walls), with the **bow wave** (`bowWave`):
  walls of dew and plucked blades 40-70 px high thrown up along it. The grass parts like water; it is not
  torn.
- The barrier torus hangs round his boot and dissolves.
- His **wind aura is ripped off him** toward the goal like a cape (`windAura` streamers advected +x at
  600 px/s for 0.3 s).
- F9r: his hair and shirt are blasted **back** (west); from 1.00 they whip **toward the goal** in the
  wake. Turf crumbs and dew rain down in slow motion.
- At the right edge, the far wall (8 m ahead) rocks back, forearms up (`flinch`).

**Sound** (muffle 0 throughout: the hammer is heard in full)

| t | sound |
|---|---|
| 0.08 | **`kick(1.4)` + `boom(1.3)` + `crack(1.0)`** + `squash(0.5)`; `whine(0.6, 0.12)` (dry) |
| 0.58 | `sonicBoom(1.0)` + `whoosh(0.6, 4000, 200)` |
| 0.62 | `rumble(0.8, 0.5)` |
| 0.90 | `roar(1.2, 0.4)`: the crowd wakes |
| 1.36 | `whoosh(0.15, 600, 5000)` (whip) |

**Cut.** Whip-pan motion cut at 1.50.

### 6 · Sound barrier (2.8 s): the ball's scene

**Story job.** Wonder, then terror. The ball is the star, huge, and the camera rides it. The air does what
no tackle can: the wall is beaten by the ball passing under it, and then destroyed by its sound.

#### 6a · The ride (0.00-1.00)

**Camera.** Side rail at ball height, **locked to the ball**: ball at screen x 230 → 260, y 210; vertical
follow damped 25 %; zoom 1.35 → 1.45; the world scrolls at about 2800 px/s; `cam.buffet(3, 9)` + trauma
0.3; `fx.streak` 0.035 along −x with a sharp hole round the ball (R 0.14). Scale: a defender is 280 px
tall (155 px per m on screen).

**The ball.** Hero scale `drawBall(8, 3)` at zoom 1.35 = **65 px**, `'cobalt'`, glow 1, heat 0.8 (ice core);
knuckle panels; dew streams off its surface like rain on a windscreen.

**VFX**
1. **Vapour cone** (`vaporCone`): bell **170 px** tall at the mouth, **320 px** long behind the ball; three
   layers (outer soft white alpha 0.45 normal blend over a navy halo, inner cyan additive shell, ice core
   streak); 4 Mach diamonds pulsing at 12 Hz; 2 wingtip corkscrews (white, 8 px) peeling off its top and
   bottom edges; a navy pocket round the ball so the ball stays the hottest point.
2. **Pressure bubble**: `fx.lens` +0.22, `lensR` 0.16 tracking the ball, plus `bubbleRim` (a chromatic
   fringe and an ice specular arc): the stands behind warp like seen through a glass marble.
3. The pressed wake with dew-mist walls along the turf; 40 speed streaks.

**Beats**
- 0.15 **air step 1** (25 m): the ball dips to 0.15 m; an air sliver (≥ 4 px) flashes under it; an
  `airCrater` 90 × 22 px (3 contour rings: pressed band, cyan glow line, cobalt core) blooms in the turf;
  the bubble squashes 0.8 / 1.2 and rebounds; a dew geyser of 30; `cam.hit(0.4)`; shock s 0.025.
- 0.25 the wall enters frame right: three defenders, arms linked. 0.28 they **jump as one** (`wallJump`):
  we see them from the waist down, 280 px bodies, heads above frame.
- 0.32-0.68 slow motion. 0.40-0.60 **the ball shoots under their airborne boots** with a hand's width to
  spare (≥ 6 px between the ball's top and the lowest stud): the cone's shoulder shoves their shins apart,
  socks and shorts ripple, their shadows on the turf smear flat, dew and blades stream off their boots
  into the wake. It does not touch them. Nothing happens to them yet: picture first.
- 0.68 the rate snaps to 1; the wall, still in the air, slides out of frame left.
- 0.82 **air step 2** (17 m): as step 1.

#### 6b · The barrier (1.00-1.95)

- 1.00-1.10 **approach**: push 1.45 → 1.55; the cone tightens (bell 170 → 80 px) and brightens; 30 contour
  loops compress into a visible pressure wall one ball radius ahead of the nose; the bubble rim turns
  ice-white; a rising shriek.
- 1.10 **SILENCE** (gap 2): the muffle slams to 1 in one frame; only a faint glass ring.
- 1.10-1.50 **SWING-ORBIT** (`gale/swing.ts`): yaw 90° (side) → 25° (front three-quarter), inOutCubic,
  0.40 s on the unwarped clock.
  - The background is crushed to 15 % (`stormNavy`): what is left are floodlight bokeh points on 4 depth
    bands sliding by parallax, the dark turf's stripe lines and the pressed wake rotating into
    perspective, isobars rippling slowly across the frame.
  - At 1.12 the cone **snaps into the vapour disc** in 2 frames; its aspect follows the yaw
    (`cos(yaw)`: 0.0 → 0.91), so it opens from a line into a circle and sells the turn.
  - Zoom 1.55 → 1.25 so the 320 px disc fits the frame height; dew is frozen as glitter round it.
  - Deep in the dark background, small, the three defenders still hang in mid-air (placed by
    `swingProject`).
- 1.50-1.60 **THE HALO** (money frame): the ball (60 px) dead centre in a **320 px** ice-white disc
  (turbulent fringe, cyan rim glow, 3 cobalt contour rings), the stadium warped in its bubble.
- 1.60 **DETONATION** (loud, dry, open):
  1. the muffle snaps 1 → 0 in one frame;
  2. **isobar impact** stage 1 at 1.60 (**E6**), centred on the ball; stage 2, the negative print, at 1.66
     (**E7**);
  3. the disc blows apart into 100 vapour shards (`PK.Mist`, `'vapor'`) streaming outward;
  4. two full-frame shock rings: s 0.065 at 1.60, s 0.04 at 1.65;
  5. radial 0.12 on the ball, CA 0.014, bloom 1.35;
  6. `cam.hit(1.0)`, `shakeAmp` 22, pull-out punch −0.12, `cam.shove(0, -10)`;
  7. the ball rockets toward lens-left, **60 → 120 px in 0.15 s**, and leaves frame;
  8. the cone reforms behind it as a needle-sharp **Mach chevron** 400 px long;
  9. 80 dew sparks; `floodBack`.
- 1.65-1.95 **the wall is flung**: the detonation ring sweeps back over the three airborne defenders and
  throws them apart in three directions (`blown`, spinning 6-9 rad/s; a shock s 0.03 at each chest;
  20 blades and 20 dew each). **Defender B is hurled straight at the lens**: his puppet scales 1 → 3.4
  over 1.70-1.92, tumbling, arms flailing, face turned away; drawn as a dark silhouette (navy multiply)
  with a 1 px ice rim; `fx.streak` 0.05 along his motion; his studs flash past the lens and his body
  covers about 70 % of the frame for 2 frames (1.90-1.92), then is gone. `cam.hit(0.8)`,
  `cam.shove(+20, +8)`. Menace, not comedy.

#### 6c · Ball's-eye (1.95-2.80)

- 1.95 motion cut (inside the shot, a 0.06 s whip) into the **chase POV** on `drawDownPitch`: the eye
  1.6 m behind and 0.3 m above the ball (view `x` = ball x − 16, `h` = ball h + 3, `z` = ball z); the
  ball travels x 1060 → 1156 (linear) so the eye runs 1044 → 1140; `f` 560 → 760; horizon 140; trauma
  0.3 → 0.6; `cam.buffet(4, 9)`; radial 0.08 centred on the goal.
- The ball centred low (320, 236), `drawBall(7, 4)` = **56 px**, in its bubble.
- **Vortex tunnel** (`vortexTunnel`): 10 elliptical vapour rings peel off the cone and expand past the
  frame edges (0.2 → 1.4 of the frame, turning); vapour filaments along the edges; Mach diamonds pulsing
  at the centre. We ride inside the wake.
- Ahead of the ball the grass bows flat in a V **before** it arrives: the pressure travels ahead of it.
- 2.45 **air step 3** (6 m, ball x ≈ 1116): a **400 px** crater (cyan glow line, cobalt core ring) stamped right under
  the camera (`airCrater` R 200 in projected space); the camera bounces up (horizon 140 → 172 in 0.1 s, back by
  0.30 s); a dew curtain.
- The keeper grows from 40 → 170 px tall; 2.30 he sets (`gkReady`); 2.60 he throws a **double-fist
  punch** straight at the lens (`gkPunch`), his fists filling the frame at 2.76-2.80.

**Rate.** 1 to 0.32; 1 → 0.12 over 0.32-0.38; 0.12 to 0.68; 1 at 0.68-0.70; 1 to 1.00; 1 → 0.06 over
1.00-1.10 (inQuad); 0.06 to 1.50; **0.04** for the halo 1.50-1.60; **1.6** over 1.60-1.75; 1 from 1.75;
`warp [2.45, 0.06, 0.2]` (air step 3).

**Sound**

| t | sound |
|---|---|
| 0.00 | `howl(1.0, 0.5, 1.4)` (the jet wind) + `whine(1.0, 0.1)` (dry); `sfx.duck(0.35, 1.0)` |
| 0.15 / 0.82 | `kick(0.5)` + `boom(0.4)` (air steps) |
| 0.28 | `scuff()` × 3 (the wall's take-off) |
| 0.40 | `whoosh(0.4, 300, 1500, 0.4)` (under the boots, slowed) |
| 0.68 | `whoosh(0.2, 800, 4000)` |
| 1.00 | `whoosh(0.12, 400, 5000, 0.5)` + `whine` rising (the shriek) |
| 1.10 | gap 2: muffle 1; `glassRing(0.25)` (dry) |
| **1.60** | **`sonicBoom(1.4)` + `boom(1.35)` + `crack(1.2)` + `kick(1.0)`**, dry and open |
| 1.62 | `roar(1.4, 0.5)` |
| 1.70 | `whoosh(0.25, 300, 2000, 0.5, -0.6)` (the body past the lens) + `kick(0.4)` |
| 1.95 | `whoosh(0.8, 400, 3200, 0.5)`; `crowd(2.0, 0.5)` swelling |
| 2.45 | `boom(0.7)` + `crack(0.6)` (air step 3) |
| 2.62 | `whoosh(0.15, 300, 2500)` (the fists) |

**Cut.** Hard cut on contact at 2.80 (the fists at the lens).

### 7 · Dead stop (1.5 s): the false defeat

**Story job.** The keeper is strong: he WINS, for a moment. Kids shout "nooo!", then "LOOK!", because they
can see what he cannot: the thunder is coming. This is GALE's own keeper beat, and the set's only one of
its kind (§1.2): one double-fist punch, a dead ball, a grin, and a reversal from somewhere else. No
grinding, no smoke, no burn (ZENITH's), no near-miss (CRESCENT's), no lash (MERIDIAN's).

#### 7a · The punch (0.00-0.42)

**Camera.** Side close-up at the keeper's chest height (camera south, looking north); keeper puppet
(`KEEPER_KIT`, k 2) on the right facing west; zoom 1.20 on his fists. 0.06: punch +0.10, `cam.hit(0.7)`,
`shakeAmp` 16, `cam.shove(+12, 0)`. 0.24: **trauma set to 0**, dead still (the first frames without shake
since shot 3); push 1.20 → 1.30 by 0.42.

**Beats**
- 0.00 the ball arrives from the left in its crumpled cone; the keeper's double-fist punch (`gkPunch`).
- 0.06 **contact**: fists meet ball. Shock s 0.045; 50 dew sparks sprayed back left; the cone crumples
  and **wraps round him** as a vapour shroud (60 `PK.Mist`) that blows his hair flat back; his boots plough
  back 6 world px (pressed skid streaks and dust).
- 0.24 **THE BALL STOPS DEAD**: it hangs 25 cm in front of his fists, its panels perfectly still; the cone
  collapses into a curtain of falling dew (`dropletCurtain` 120); his fists open a little. Silence.

#### 7b · The grin (0.42-1.50)

**Camera.** Hard cut (no flash) to a **two-shot**: camera south-west of the keeper at head height, looking
north-east; zoom 1.00, static, no shake. The ball hangs in the left-centre foreground (hero scale,
**62 px**); the keeper's head and shoulders on the right (`KeeperFront` ×2, head about 80 px), turned to
the lens; deep in the background on the left, the pitch recedes west with the pressed wake running back to
the horizon and the fallen wall tiny on the turf. 0.95: slow push 1.00 → 1.06, trauma 0.05 → 0.25 as the
rumble builds. 1.30-1.50: 1.06 → 1.12, trauma 0.45.

**Beats**
- 0.42-0.70 **KF3, the grin**: he turns from the ball to us and grins. No glint and no "ding": a comic
  beat would dilute the scare (§0.3); the grin is enough, and the dread comes from the wall. The ball sinks
  6 px over 0.42-1.40, heavy, hanging on its cushion of air.
- 0.70-0.95 **KF3b**: the first breath of the oncoming air lifts his hair and collar to the right; he
  does not notice. Still grinning.
- **The wall (dramatic irony)**, from 0.42: on the far left horizon a shimmer, then the **thunder wall**
  (`thunderWall`, §10.3), built from the existing post shocks plus two canvas layers (no new shader):
  - **Refraction**: three large-radius shock rings centred off-frame left at UV (−2.0, 0.55), pushed with
    `pushShock` (3 of the 4 slots). Ring A is the leading edge: its UV x `e` runs 0.02 → 0.40 by 1.50
    (outQuad); the shader measures radius in screen heights with dx scaled by the aspect 1.78, so
    `r = (e + 2.0) × 1.78` = 3.59 → 4.27; s 0.006 → 0.03. Rings B and C trail it by 0.05 and 0.10 UV (the
    trailing ripples) at s × 0.6 and × 0.35. At this radius the edge is a near-straight wall bowing
    slightly toward us. `fx.shockWidth` 0.05 on these frames. 7b's only other shock is the frame-edge
    ripple at 1.30-1.50 (4 of 4).
  - **Ice edge line** (canvas, `iceEdge`): a 1-2 px ice line along ring A's leading edge (screen x per row
    from the same circle), additive over a 3 px navy halo, alpha 0.3 → 0.9, steady (no flicker).
  - **Dust/dew curtain** (canvas, `dustCurtain`): a white curtain of dust and dew behind the edge,
    40 → 240 px tall, `'storm'` smoke sprites (normal blend) + `PK.Mist`, its top torn by noise, its front
    locked to the ice line.
  Ahead of it the turf **peels** in a line (blades flipped pale, dust: never torn sod); the fallen
  defenders are rolled over again as it passes them; a corner flag snaps. It grows from a 20 px shimmer
  into a wall filling the left 40 % of the frame. It is on screen from the first frame of the grin.
- 0.95-1.15 KF3 / KF3b alternate every 0.1 s (his hair fluttering): **the grin freezes**. The dew on
  the hanging ball shivers and drifts right.
- 1.15 **KF4**: his eyes snap left to the wall; eyes wide, mouth open, hair blown back. Terror. (KF4 is
  held through the cut under rising shake plus a 1 px code tremor of the bust.)
- 1.30-1.50 the wall fills the left 40 %; the frame edges ripple (shock centred on frame, r 1.4 → 1.2,
  s 0.01: the one other shock); the ball trembles. The cut lands on the frame the ice edge touches the
  ball.

**Rate.** `warp [0.06, 0.10, 0.04]`; 0.3 → 1 over 0.16-0.24; then 1 (the stillness is real time: the dew
falls at full speed while the ball hangs).

**Sound**

| t | sound |
|---|---|
| 0.06 | `kick(1.1)` + `boom(0.9)` + `strain(0.5, 0.3)` + `scrape(0.3, 0.2)` |
| 0.24 | `sfx.clearBus()` + muffle 0.9 (gap 3): total silence |
| 0.32 | `glassRing(0.05)`: one dew drop, very quiet, dry (no ticks: they are MERIDIAN's watch) |
| 0.80 | **`thunderFront(0.70)`** starts low; the muffle opens 0.9 → 0 by 1.10 under it |
| 1.15 | `whoosh(0.3, 200, 1200)` (his head snaps) |
| 1.40 | the thunder's crescendo peaks into the cut |

**Cut.** Hard cut at 1.50 as the wall's ice edge touches the ball; its ripple continues across the cut.

### 8 · Thunder hammer (2.4 s): the climax

**Story job.** Catharsis. The thunder catches up and hammers: the biggest hit in the film, and it must
look like it could break the goal, so it moves the goal.

#### 8a · Hammer 2 (0.00-0.36)

**Camera.** Low reverse behind the ball (camera west of it, 0.5 m below, looking east up at the keeper):
the ball in the foreground at **91 px** (`drawBall(6, 2)` at zoom 3.8); past it, 1.5 m further back, his
open fists and his terrified face (`KeeperFront` KF4 at ×2 as a screen-space depth layer that the zoom
does not scale, head about 80 px). 0.00-0.10: **the thunder wall arrives from behind the lens**. This is
the reverse angle, so its one large ring is centred on the frame rather than off-frame left: an imploding
`pushShock` ring, r 1.30 → 0.55, s 0.03, with the canvas ice edge line drawn on the same circle and the
dust/dew curtain as streaks shooting past the frame edges toward the centre; it is released at 0.10, when
hammer 2's three rings take 3 of the 4 slots. `cam.shove(0, +6)`. 0.10: punch +0.20, `cam.hit(1.0)`,
`shakeAmp` 24, `cam.shove(+18, 0)`; trauma held ≥ 0.4 through the hit-stop.

**0.10 HAMMER 2: the 12-layer stack, the biggest in the film**
1. Isobar impact stage 1 (0.10-0.17, **E8**), `isoMix` 0.6 centred on the ball, ≤ 4 band pairs.
2. Stage 2, the negative print (0.17-0.25, **E9**): luminance only, no rings.
3. Three shock rings: s 0.08, 0.05, 0.03, staggered 0.03 s (`pushShock`; 3 of the 4 slots).
4. **The vapour cone reborn at double size**: a 260 world px mouth that fills the frame like a white
   shroud by 0.32-0.36 (**E10**, `fx.fullFrame`; it hides the swap).
5. A second barrier torus, 400 px.
6. 90 dew sparks + 60 `PK.Blade`.
7. 120 ice/cyan focus lines.
8. CA 0.016, radial 0.15.
9. Bloom 1.3 (thresh 0.6).
10. Lens bulge +0.45, `lensR` 0.35 on the ball.
11. `cam.hit(1.0)` + punch +0.20 + `cam.shove`.
12. `floodBack`: saturation 1.05, tint `[235,245,255]`, easing to the storm grade over 0.3 s.

- 0.32 the keeper's fists are flung apart, **then** the ball blasts through where they were. He is
  **folded backward like a sail** (`gkFold`) and cartwheeled out of frame up-right (spin 10 rad/s, gloves
  still on). He never holds the ball.

#### 8b · The goal moves (0.36-2.40)

**Camera.** The **side world view** (camera south, looking north, as the world views of shots 1, 4 and 5;
the goal to the right). It is the view the existing side-view `drawGoal` and the §10.5 rig draw, so no
new goal renderer is needed, and the slide reads along the screen's x axis against the painted line,
which never moves. A `keys()` track:

| t | zoom | centre | notes |
|---|---|---|---|
| 0.36 | 2.60 | the far top corner (the ball's entry) | **BLOW-BACK**: 2.60 → 0.92 by 0.66 (`'blowBack'`); `cam.shove(-30, -12)`, trauma 0.8 |
| 0.66 | 0.92 | the goal mouth at crossbar height | settle; trucking +28 world px with the sliding goal |
| 0.95 | 0.92 | | `cam.hit(0.5)` as the frame lurches to a stop |
| 0.95-1.15 | 0.92 → 1.90 (inOutCubic) | cranes down 60 px onto the turf at the near post foot | **the proof push** |
| 1.15-1.62 | 1.90 → 1.96 (linear creep) | the painted line at screen x ≈ 250, the near post foot at x ≈ 303, the turf at y ≈ 250 | **the hold**: trauma 0.12, no shake spikes |
| 1.62-1.88 | 1.96 → 0.95 (outCubic) | cranes up 60 px to the goal mouth | **the pull-out for GOAL!**; `cam.shove(+10, 0)` from the wind wave |
| 1.88-2.25 | 0.95 → 0.93 | | hold wide |

**Readability.** The gap between the painted line and the near post foot is `GOAL_SLIDE` 28 world px:
26 px at the wide zoom 0.92, **53 px** in the push at 1.90. It is ≥ 45 px from about 1.05 (zoom passes
1.61) to about 1.68 on the pull-out: **about 0.63 s**. The dome is capped at bulge 1.0 (46 world px,
42 px at 0.92), so it never outgrows the slide, and in the push the net is out of frame: the read is "the
goal moved", never "the net ballooned".

**Beats**
- 0.40 the ball hits the net in the far top corner (1.9 m): `warp [0.40, 0.08, 0.06]`; the net domes out
  (`goalRig.dome` 0 → **1.0** in 0.08 s, the cap), the ball spinning at its tip inside its bubble; the dome
  relaxes to 0.6 by 1.20. The net never tears.
- 0.45-0.70 the six net pegs pop out of the turf one after another (0.05 s apart), each with a puff of
  dirt and dew.
- 0.48-0.95 **THE GOAL IS SHOVED**: the whole frame skids back **28 world px (2.8 m)** (outCubic); the post
  feet plough two furrows that start at the painted line (soil core, grass lips, clods: the only torn turf
  in GALE); the crossbar bows **14 px** back into a U (peak at 0.56, a damped 4 Hz spring settling by
  1.15); the side netting snaps taut; frost races along the frame from the impact corner (0.48-0.70). It
  skids, bends and springs, and stays standing: posts never snap or fly.
- 0.95 the frame lurches to a stop.
- 0.95-1.62 **THE PROOF** (the push and the hold), filling the frame at turf level from left to right: the
  pressed wake running in from the left edge; the **white goal line, painted and unmoved** (a 2 px stripe
  across the turf band at `FIELD.goalX`; one cyan glint runs along it at 1.18); the **furrow**, 53 px of
  ploughed soil between torn grass lips; at its end **the near post foot**, clods still rolling off it; a
  peg lying on its side; dew and dust drifting down through the floodlights.
- 1.62-1.95 **the stadium hears it**, and GOAL! rides it: as the camera pulls out, a stadium **wind wave**
  rolls in from screen-left (`windWave` 0 → 1 over 1.62-1.97): flags and scarves whip in sequence along the
  stands, the ad boards fold back in a domino wave (`boardsFold`), the floodlight towers sway 2 px, a slow
  pressure ring rolls across the turf (shock r 0.2 → 1.6 over 0.6 s, s 0.025). The pull-out reveals the
  whole shoved goal, its two furrows, the six pegs and the keeper hooked in the side netting
  (`netTangle`). No confetti and no crowd camera flashes (ZENITH's).
- 1.66 **GOAL!** (`gustTitle`, **130 px**, ice fill, 4 px cobalt stroke, navy outer stroke): the five glyphs
  arrive **on the wind wave's front from screen-left**, 0.05 s apart, each sheared up to 0.5 and
  **fluttering like the flags** (shear and y on a damped 7 Hz sine), decelerating into place (outCubic,
  0.18 s); on arrival each **snaps upright** in 2 frames (shear → 0, 110 % → 100 %) and stamps an **isobar
  echo** (two 1 px ice contour lines tracing the letter outline, expanding 12 px over 0.2 s). All settled
  by 1.92 and held to the wipe; dew streams past the letters along the wave.

**Rate.** `warp [0.10, 0.22, 0.03]`, `[0.32, 0.04, 0.3]`, `[0.40, 0.08, 0.06]`; otherwise 1.

**Sound**

| t | sound |
|---|---|
| 0.00 | the `thunderFront` tail + `whoosh(0.1, 200, 3000)` |
| **0.10** | **`hammerBoom(1.5)` + `kick(1.4)`**: the loudest moment of the film |
| 0.32 | `whoosh(0.3, 300, 5000, 0.6)` (the tear through his fists) + `kick(0.6)` |
| 0.36 | `roar(1.6, 0.6)` |
| 0.40 | `boom(1.1)` + `kick(0.8)` (the net) |
| 0.45-0.70 | `pegPop()` × 6 |
| 0.48 | `metalGroan(0.8)` + `scrape(0.5, 0.35)` (the frame ploughing) |
| 0.95 | `kick(0.5)` (the frame stops) |
| 1.00-1.60 | clods pattering (`scuff(0.15)` × 4, dry) and the crossbar's spring dying, under the roar |
| 1.62 | `boom(0.8, 0.9)` (late and wet: the stands) + `gust(0.8, 0.45)` (the wave) + `crowd(3.0, 0.65)` |
| 1.66 | `stinger()` + `crashSwell(0.5, 0.25)`; a `whoosh(0.08, 2400, 900, 0.2)` flutter per glyph, 0.05 s apart |
| 2.25 | `whoosh(0.15, 800, 5000)` (the wipe) |

**Cut.** Wind wipe at 2.25-2.40.

### 9 · Return the wind (1.9 s): the pose kids copy

**Story job.** Pride, and the bookend of the grab: he grabbed the wind at the start, now he gives it back.

#### 9a · The blow (0.00-1.05)

**Camera.** Front, low angle; No.10 waist-up, **`WindHand` ×2** at zoom 1.50 (head about 120 px, the
waist at the frame's bottom edge), left of centre (x 260). Behind him: the west stands under the cloud
lid, flags still whipping, torn scarf strands and dew drifting, floodlight bokeh. Push 1.50 → 1.62 with a crane down of
10 px (we look up more); `cam.hit(0.15)` at 0.70.

**Beats**
- **WH4** 0.00 / **WH4b** 0.12: the fist at his chest. His hair, lifted all film, **begins to fall** (the
  wind is dying).
- **WH5** 0.25-0.55: the fist opens palm-up and a **mini tornado** spins on it (`miniTornado`: 72 px tall
  on screen, ice and cyan streaks, 6 orbiting dew beads).
- **WH6** 0.55-0.80: palm to his lips, cheeks puffed, eyes closed: **the blow**. 0.62 the tornado lifts
  off his palm and flies at the lens, growing until its spiral streaks wrap past the frame edges at 0.85.
- **WH7** 0.80-1.05: palm extended toward us at shoulder height, chin up, a grin.

#### 9b · Footprints of air (1.05-1.90)

At 1.05 the gust's tail sweeps left → right (`windWipe`) into the **back view down the pitch**
(`drawDownPitch` view `{ x 845, z 266, h 14, f 560, horizon 150, cx 320 }`, `storm: 1`, `goalSlide: 28`,
`bulge` 0.6):
- StandBack a/b at ×2 in the foreground centre (feet y 330), alternating every 0.2 s (breathing).
- The pressed wake runs straight to the goal; the **three air craters** lie on it like stepping stones
  (v1's footprints of air, kept).
- The gust (a translucent white streak band) travels away from us down the wake; each crater exhales a
  ring of dew mist as it passes (1.20, 1.32, 1.44); the shoved goal sits small at the vanishing area with
  its domed net, which flutters once at 1.52.
- Dew falls like snow through the floodlights. Camera: crane up 12 px, zoom 1.00 → 0.96.
- 1.25 the **name card** slides in (the shared `nameCard` in `kit.ts`, `style: 'gale'`): `GALE HAMMER`
  (left), `No.10 · SPECIAL SHOT`,
  `CAM 1 - 0 RIV` (right).
- 1.60-1.90 fade to `[8,4,14]`.

**Rate.** 1.

**Sound**

| t | sound |
|---|---|
| 0.00 | `roar(2.0, 0.5)` + the crowd bed |
| 0.25 | `gust(0.4, 0.15)` with a whirl (the tornado) |
| 0.62 | `breath(0.6)` (the blow) + `airTone(G5)`, `airTone(B5)`, `airTone(D6)` together at 0.15 each: **the motif's last statement**, one blown chord |
| 0.85 | `whoosh(0.3, 2000, 400)` (the gust past the lens) |
| 1.20 / 1.32 / 1.44 | `whoosh(0.2, 600, 200, 0.12)` (the craters exhale) |
| 1.25 | `stinger()` |
| 1.50 | `whistle()` |

**Cut.** Fade to `[8,4,14]`; the result view fades up from it.

---

## 7. Money shots and the ball showcase

**Money shots** (frames a kid would screenshot):
1. **Grab the Wind** (2, about 1.75 s): a fist the size of the screen, a cyan orb in it, GALE HAMMER
   being sucked into it, isobars spiralling in.
2. **Eye of the Storm** (3, about 3.9 s): No.10 at 255 px, calm, inside a stadium hurricane full of
   flying cups, a flag and a scarf; dew hanging still; floodlights bent toward him.
3. **The Hammer Leg** (4, about 5.9 s): the leg raised like a hammer, a 92 px cyan pressure orb on the
   boot, the stadium pinched and sucked toward it.
4. **Weather Map** (5, 6.68 s): the 109 px ball crushed on the laces, the frame turned into an isobar
   chart with the tightest rings round the contact.
5. **Under the Wall** (6, about 8.6 s): a 65 px ball in a 170 × 320 px vapour cone, shooting under three
   airborne defenders.
6. **The Halo** (6, 9.6-9.7 s): the ball in a 320 px vapour disc seen almost face-on, the stadium warped
   in its bubble, the wall still hanging in the dark behind.
7. **The Grin** (7, about 11.5 s): the ball hanging dead in front of the keeper, him grinning at us, and
   the thunder wall racing toward him behind his back.
8. **The Goal Moved** (8, about 13.8 s): at turf level in the proof push, the painted goal line in the
   foreground and, 53 px behind it at the end of its furrow, the near post foot of the shoved goal; a peg
   on its side, clods rolling, dew falling. Then **GOAL!** (about 14.3 s): 130 px glyphs snapping upright
   on the stadium's wind wave over the whole goal 2.8 m behind its line, two furrows, six pegs, the
   crossbar still springing.
9. **Return the Wind** (9, about 15.5 s): the palm tornado blown at the lens.

**The ball showcase.** Shot 6 (2.8 s) is the ball's scene: ride with it (65 px, cone 170 × 320 px, bubble,
two craters, under the wall), swing round it to its halo (60 px in a 320 px disc), detonate with it
(60 → 120 px past the lens), then ride inside its wake (56 px, vortex tunnel, a 400 px crater). The ball
is also the subject at 109 px (shot 5), 62 px hanging dead (7), 91 px at hammer 2 (8a), and spinning at the
tip of the net's dome (8b). Its energy shape (the vapour cone and disc) is always drawn with a navy pocket round the ball,
so the ball's ice core stays the hottest point and the shape never swallows it.

## 8. Field scenario `'longshot'` (`src/game/field.ts`, `src/game/game.ts`, `specials.ts`)

**Registry.** `{ id: 'gale', name: 'GALE HAMMER', kind: 'Long-range power shot', scenario: 'longshot',
cost: 75, shots: galeHammer }`. Update the README row (drop "a tier below Zenith Meteor").

**Intro** (about 2.0 s, the v1 dribble kept)
- No.10 collects the loose ball at about x 640 and runs right (the library **Dribble** cycle as a
  box-filtered cache, never the puppet).
- The defence forms **a wall of three** at x ≈ 960 (z 246 / 262 / 278, `RIVAL_KIT` / `_B` / `_C`), side-
  stepping to mirror his z (v1 had two).
- The keeper stands 2 m off his line (x 1160) and beckons once (a puppet arm wave, glove up).
- Caption: `No.10 · 30 M OUT · THE KEEPER DARES HIM` (never the forbidden word).

**Command window** (opens at x 880 with `blip(660)`)
- `> GALE HAMMER   SP 75` with a cyan **`30 M`** readout; SHOOT / PASS / DRIBBLE dimmed below; SPIRIT
  gauge cobalt → cyan (as v1).
- The three **ghost craters** at `STAMPS` breathe together (`ghostStamp`, scale 0.92 ↔ 1.0 over 1.2 s,
  with `inhale(1.2)` at gain 0.1).
- **Air loading**: lens −0.06 / `lensR` 0.06 on his boot, dew motes drifting toward it, aura ramp
  `'cobalt'` (`AURA_RAMP` unchanged); new: the field stand flags start whipping (`wind` 0.3) and the
  field grade cools to `[214,228,255]`.
- Intro skip for `'longshot'` stays at x 879.

**Result view** (fades up from `[8,4,14]`)
- **The goal frame drawn 28 px back** (2.8 m) off its painted line (`goalRigAt(Infinity)`): two furrows
  from the line to the post feet, six pegs on the turf, the net still domed (bulge 0.6), the crossbar
  straight again.
- The pressed wake and the three crater decals in the turf (no line joins them).
- The keeper tangled in the side netting (`netTangle`, small); the three defenders down (`sprawl`,
  `faceDown`, `sitWrongWay`).
- No.10 celebrates from Celebrate C1/C2 (0.5× box-filtered cache), fallback Strike F10; never the puppet.
- Caption `GOAL · GALE HAMMER`.

## 9. Studio art (Pixel Studio)

Canvas 128 × 128, No.10 98 px tall standing, ground row 102, the 15-colour palette, the `Art` layer and
the anchor schema of `../MOTION_LIBRARY.md` §1. The ball is **never** drawn in a frame. Facing east unless
stated. **22 new frames: 18 drawings + 4 tremble variants** (v2 pitches asked for about 26).

**New convention: close-up busts.** `WindHand` (No.10) and `KeeperFront` (keeper) are busts drawn at
**twice the figure scale** on the 128 × 128 canvas (head about 40 px tall, shoulders about 70 px wide,
the waist near row 110), so a close-up needs only ×2-×3 in game instead of ×4-×6 of a full figure. Same
15-colour palette, same outline weight as the figure frames (1 px), more facial detail (eyelids,
teeth). Registration: `chest` anchor = the sternum, the bust's pivot.

### 9.1 Project "Sochetra" (No.10): 16 frames

| Strip / ID | View | Pose | Used (shot, t, scale) | Holds | Anchors |
|---|---|---|---|---|---|
| **WindHand WH1** | front bust, waist-up (2× figure scale) | open right palm thrust at the viewer, fingers spread, elbow nearly straight, palm 30-40 px wide (foreshortened); hair streaming back and up, eyes hard on the lens over the hand | 2 / 0.00 / ×3 | 0.28 | `palm`, `eyeL`, `eyeR`, `head`, `chest`, `bbox` |
| WindHand WH2 | same | fingers curling, wrist turning; hair starting to lift forward | 2 / 0.28 / ×3 | 0.22 | same |
| WindHand WH3 | same | **fist clenched at arm's length**, knuckles to the viewer, forearm tense, jaw set | 2 / 0.50 / ×3 | 0.25 | same + `fist` |
| WindHand WH4 | same | fist pulled to his chest, elbow out, chin down, eyes up at the lens; hair lifted (updraft) | 2 / 0.75 / ×3; 9 / 0.00 / ×2 | ≤ 0.12 alternating | same |
| WindHand **WH4b** | same | tremble variant of WH4: fist 1 px, two knuckle-wisp pixels, hair spikes 1 px | 2 / from 0.87; 9 / 0.12 | alternating 0.12 s | same |
| WindHand WH5 | same | fist opened palm-up at chest height, fingers relaxed; hair beginning to fall | 9 / 0.25 / ×2 | 0.30 | `palm` (the tornado's base) |
| WindHand WH6 | same | the blow: palm just below his lips, cheeks puffed, eyes closed, head tipped toward the palm | 9 / 0.55 / ×2 | 0.25 | `palm`, `mouth` |
| WindHand WH7 | same | palm extended toward the viewer at shoulder height, chin up, a confident grin; hair settled | 9 / 0.80 / ×2 | 0.25 | `palm`, `eyeL`, `eyeR` |
| **StormStand SS1** | front, full body (base on StandFront) | wide stance, knees soft, arms loose and slightly out from the body, chin level, eyes down at the ball; **hair and shirt hem whipping up** (updraft) | 3 / 0.00-1.55 / ×2 | 10 fps loop with SS2 | `contact`, `eyeL`, `eyeR`, `head`, `chest` |
| StormStand SS2 | same | the updraft variant: hem, sleeves and hair spikes in their second flap position (2-3 px) | 3 / loop | 0.1 each | same |
| StormStand SS3 | same | head snapped up to the lens, jaw set, eyes lit (2 ice pixels + cyan iris per eye) | 3 / 1.55-2.00 / ×2 | 0.45 (eyes igniting, the cyclone bursting outward past the lens) | same |
| **HammerCock HC1** | side, east; **Strike canvas** (plant toe = F5a's (76, 102)) | plant (left, far) foot down, knee soft; kicking (right, near) leg raised high behind: thigh about 40° behind vertical, knee about 90°, heel above the hip line; torso pitched forward about 20°; left arm flung forward and up, right arm back and down; head down, eyes on the ball; hair and hem drifting toward the boot | 4 / 0.48, 0.88, 1.28 / ×2 | 0.2 alternating | `contact`, `pelvis`, `boot` (the raised heel/instep: the orb centre), `ball` (83, 96), `eye` |
| HammerCock HC2 | same | tremble variant: hair spikes and hem 1-2 px further toward the boot, fingers spread, 1 px shoulder rise | 4 / 0.68, 1.08 | 0.2 alternating | same |
| HammerCock HCs | same | the leg whipping down as one tapered smear streak (like Bicycle BK9), heel-high to under the hip; torso coming upright 5° | 4 / 1.44 | 0.06 | same |
| Strike **F9r** | side, east, Strike canvas | the recoil skid: plant (left) boot skidding back on its heel, toe up; kicking leg still high in follow-through (about 30° lower than F8); torso thrown back about 15° behind vertical; arms flung back; hair and shirt blasted back (west) | 5 / 0.80-1.12 / ×2 | 0.32 (moving: the skid) | `contact` (the plant heel on row 102), `pelvis`, `eye` |
| StrikeMacro **M2c** | side macro (as M2b) | the deepest squash: the boot sunk about 6 px further into the ball than M2b, laces bulging into the ball's face, toe flexed | 5 / 0.14-0.40 / MD 2 | 0.26 (inside a 0.03 hit-stop) | `laces` |

### 9.2 Project "Rivals": 6 frames

| Strip / ID | View | Pose | Used | Anchors |
|---|---|---|---|---|
| **KeeperFront KF1** | front three-quarter bust (`KEEPER_KIT`), 2× figure scale | smirk; right glove raised palm-up at shoulder height | 1 / 0.00, 0.22 / ×2 | `eyeL`, `eyeR`, `mouth`, `glove`, `head` |
| KeeperFront KF1b | same | the beckon: glove fingers curled toward himself | 1 / 0.14, 0.30 | same |
| KeeperFront KF2 | same | gulp: smirk gone, eyes wide, a sweat drop; hair, collar and the dew on his glove streaming **screen-left** | 4 insert / 0.94-1.14 | same |
| KeeperFront KF3 | same | the grin: eyes on the lens, teeth bared, chin up (no glint) | 7 / 0.42-0.70, then alternating with KF3b 0.95-1.15 | same |
| KeeperFront KF3b | same | the same grin with hair and collar lifting **screen-right**, a sweat drop starting | 7 / 0.70-0.95, then alternating 0.1 s | same |
| KeeperFront KF4 | same | terror: eyes wide looking screen-left (toward the oncoming wall), mouth open, hair blown back screen-right, cheeks pressed | 7 / 1.15-1.50; 8 / 0.00-0.32 | same |

### 9.3 Reused library frames (no change)

| Shot | Frames (shot-local t) | Anchors |
|---|---|---|
| 1 | Settle F1 0.90 · F3 0.98 · F3b 1.10 (×2) | `contact` |
| 4 | Run R1 0.00 · R2 0.06 · R3 0.12 · R4 0.18 · Approach AP2 0.24 · Strike F5a 0.42 · F6 1.50 (×2); Glance G4 in the dew mirror 1.22-1.38 (×2) | `contact`; AP2 on `pelvis` |
| 5 | StrikeMacro M1 0.00 · M2 0.08 · M2b 0.40 · M3 0.56 (MD 2); Strike F7 0.62 · F8 0.66 · F9 1.12 · F10 1.30 (×2) | `laces`; F8 on `pelvis` |
| 9 | StandBack a/b alternating every 0.2 s from 1.05 (×2) | `contact` |
| field | Dribble cycle (intro), Celebrate C1/C2 or Strike F10 (result) | `contact` |

### 9.4 Puppet poses (joint angles only, `POSES` in `puppet.ts`)

- `wallJump`: airborne, knees tucked 30-40°, arms out sideways at shoulder height so neighbours' hands meet.
- `gkPunch`: both arms straight forward at shoulder height, fists together, torso forward 10°, knees bent.
- `gkFold`: torso arched back about −70°, arms flung forward, legs trailing forward (folded like a sail);
  used with spin for the cartwheel.
- `netTangle`: sprawled, one arm hooked up in the side netting, legs crossed, head down.
- Existing: `wideBlock`, `flinch`, `blown`, `gkReady`, `sprawl`, `faceDown`, `sitWrongWay`.
- **Set ownership**: `gkPunch` and `netTangle` are GALE's alone (MERIDIAN's and SOLO's keepers use neither).
  All poses render through the shared `PuppetCache` (§10.0).

**Props in code**: flags and scarves in the stands, paper cups, a corner flag, folding ad boards, six net
pegs, the goal rig.

### 9.5 Drawing notes, priority, fallbacks

- **Natural motion**: no hold longer than 0.3 s without a drawn variant (SS, HC, WH4 and KF3 have theirs).
  The only exceptions sit under violent camera motion: SS3 (0.45 s under the cyclone burst, the shove and
  the wipe), KF4 (under rising shake and a 1 px code tremor), F9r (moving: the skid);
  arms counterbalance; hair and hems obey the wind map (§3); the plant toe never slides from F5a to F6;
  F9r's skid is the only planned slide and it leaves streak decals.
- HC1 is the special's silhouette: review it at ×4 first, then in game at ×2 × zoom 2.3 with the orb.
- WH1 is the hardest drawing (a palm at the lens, 140 px on screen). Review it first at ×4. **Fallback**:
  a less-foreshortened three-quarter palm (hand turned 30° off the lens, 26 px wide).
- **Priority**: HC1/HC2/HCs → WH1-WH4 → SS1-SS3 → KF3/KF3b/KF4 → M2c → F9r → WH5-WH7 → KF1/KF1b/KF2 → WH4b.
- **Fallbacks while art is late** (never a puppet for No.10):
  - HammerCock → Strike F5b with code offsets (weaker);
  - WindHand → the hand-drawn face sprite at ×4 with a canvas-drawn fist (weaker);
  - StormStand → StandFront a/b ×2 plus the wind aura (hair static);
  - F9r → F8 → F8b → F9 (v1's hop);
  - M2c → M2b with a deeper `renderBall` squash;
  - KeeperFront → the keeper puppet head at ×2 (last resort, blocky).

## 10. Engine cheat-sheet (new pieces; everything else as in v1 and CRESCENT)

### 10.0 Shared set pieces

**GALE builds these once, for all three specials**; MERIDIAN and SOLO import them unchanged, and none of
them carries a look:

| piece | file | item |
|---|---|---|
| the `STREAK` shader chunk and `fx.streak*` | `engine/post.ts` | 3 |
| `fx.fullFrame` | `engine/post.ts` (`FxState`) | 5 |
| `FlashBudget`, the set's single definition | `cinematic/timeline.ts` | 6 |
| `cam.shove`, `cam.buffet` | `engine/camera.ts` | 7, 8 |
| `PK.Blade`, `Particles.wind` | `engine/particles.ts` | 31, 32 |

**GALE uses these from the other briefs, with no copies of its own:**
- **`keys(track, t)`** (MERIDIAN's keyed track, `kit.ts`): every GALE camera table is a `keys()` track;
  GALE adds three easing presets to it (item 9). v1's `steps()` and the draft's `vacuumPull` / `blowBack`
  curve functions are not written.
- **`PuppetCache`** (SOLO's class, moved from `solo/common.ts` to `kit.ts`): the wall's three defenders and
  the keeper in every pose of §9.4; at most 3 puppet renders per frame.
- **`nameCard(ctx, t, o)`** in `kit.ts`: one card (`title`, `line2`, `score`, `style`) replacing the copies
  in `gale/common.ts` and `meridian/common.ts`; GALE passes `style: 'gale'` (ice title, cobalt stroke).
- **The single engine particle cap** `Particles.CAP` (one constant in `particles.ts` for every special, set
  value 1500, oldest-first recycling) in place of per-brief caps. GALE's frames stay at or under 900 live
  (its own budget, checked by the dev overlay; not a second cap).
- **Shader chunks**: post programs are assembled from named chunks (`LENS`, `ISO`, `STREAK`, MERIDIAN's
  `PLUCK` / `TONE`, SOLO's `IMPMASK` / `ECHO`) by one `buildFinal(chunks)` in `post.ts`, so each chunk
  exists once.

### 10.1 Post (`engine/post.ts`) and the runner

1. **Isobar impact frame** (GALE's own two stages, chunk `ISO`):
   - Fields: `iso` (0..1), `isoBands` (3-4), `isoInvert` (0/1), `isoCols: [RGB × 4]` (navy, cobalt, cyan,
     ice), `isoLine: RGB` (ice; navy when inverted), `isoX`, `isoY` (UV), `isoR` (screen-height units,
     default 0.6), `isoMix` (0 = luminance bands only, 1 = rings round (isoX, isoY) only; default 0.55),
     `isoWob` (contour wobble, 0..0.05).
   - Shader: `v(p) = clamp(mix(luma(p), 1 − |(p − isoXY)·(aspect,1)| / isoR, isoMix) + isoWob·sin(6θ +
     9·uTime), 0, 0.999)`; `b = floor(v·bands)` (no `fract`: the radial term never repeats); band colour
     from `isoCols[b]` (reversed when inverted); a 1 logical px contour line where any of 4 neighbours
     (± one logical pixel) falls in another band; `col = mix(col, isoCol, iso)`.
   - Helper `galeIso(fx, stage: 1 | 2, uv?)`:
     - **stage 1, the weather map**: `isoBands` 4, `isoMix` 0.55-0.6 round `uv`, `isoWob` ≤ 0.02, ice lines;
       **at most 4 light/dark band pairs** across the frame (dev check: ≤ 8 band changes along the row and
       the column through `uv`);
     - **stage 2, the negative print**: `isoMix` 0 (luminance only, **no rings**), `isoBands` 3,
       `isoInvert` 1, `isoWob` 0, navy lines: a different geometry from stage 1, never its contrast
       reversal (§4.1).
   - Used at hammer 1, the detonation, hammer 2 (3 sites, 6 events). v1's `galeImpact` (cobalt/ice at
     threshold 0.35) is retired.
2. **`FINAL_GALE` = `buildFinal([LENS, ISO, STREAK])`**: the post picks it on any frame with `fx.iso > 0 ||
   fx.streak > 0` (lens alone keeps `FINAL_LENS`). Compiled lazily and warmed by `post.warm('gale')` from
   shot 1's `prepare()`. It never combines with `ECHO`, `PLUCK`, `TONE` or `IMPMASK` (dev assert). All new
   fields default to off and are reset in `FxState.reset()`. **There is no front block** (the v2 draft's
   item 2 is dropped): the thunder wall is shock rings plus canvas (item 27).
3. **Streak** (directional motion blur, shared chunk `STREAK`, built by GALE): `streak` (UV length),
   `streakDX/DY` (unit direction, the smear trails opposite it), `streakHoleX/Y/R` (a sharp disc, e.g. the
   ball). 12 taps; `m = smoothstep(0.7·R, R, |(uv − hole)·(aspect,1)|)` scales the length so the subject
   stays sharp. Used by whip-pans, the truck, the ride and bodies at the lens; SOLO's `FINAL_SOLO` uses the
   same string. A shared tool; its look is not.
4. **Lens**: unchanged. The pressure bubble's glass rim is canvas (`bubbleRim`, item 23).
5. **`fx.fullFrame`** (boolean, reset per frame; shared): set by a shot on frames where a wipe or shroud
   covers most of the frame, so the guard counts it.
6. **FlashBudget** (`timeline.ts`, dev and runtime): **the set's single definition**, imported unchanged
   by MERIDIAN and SOLO (their briefs point here and restate no thresholds). After each render it records
   rising edges of `flash ≥ 0.3`, `impact ≥ 0.5`, `iso ≥ 0.5` and `fullFrame` over a rolling 60-frame
   (1 s) window. Dev: a `console.assert(count ≤ 3)` and a red marker on the review page's scrubber; capture
   tools print the event list to compare with each brief's table. Runtime: once a window holds 3, any
   further event is clamped (flash/iso/impact → 0) until the window clears.

### 10.2 Camera (`engine/camera.ts`) and timing (`kit.ts`)

7. **`cam.shove(dx, dy)`** (shared): an impulse into a damped spring offset (`shoveX/Y`, velocity × 14 per
   px; k 220, c 18: settles in about 0.35 s with about 15 % overshoot). Added in screen px in `apply()`
   (translate before rotate) and in `toUV()`. `reset()` clears it.
8. **`cam.buffet(amp, hz = 9)`** (shared): a held anisotropic low-frequency shake (y amplitude `amp`, x
   `amp × 0.35`, `noise1` on the camera clock), independent of trauma, until `cam.buffet(0)`. `reset()`
   clears it.
9. **Easing presets on the shared `keys()` track** (`kit.ts`; rows `[t, value, ease]`, the ease applying
   from the previous row to this one):
   - `'step2'`: v1's `steps()`: the value snaps over the last 2 frames before the row's time and holds;
   - `'vacuum'`: as `'step2'` but inExpo inside the 2 frames (a sucked lurch that accelerates into the
     hold, never springing back); the shot fires the ear-pop and isobar snap as cues at the row's time;
   - `'blowBack'`: outCubic over the interval with a 2 % settle back at the end (v2 draft's `blowBack()`).
   They are pure functions of `t`, so every shot seeks exactly.

### 10.3 Canvas FX (`gale/air.ts`; caches built in `prepare()`)

10. `vaporCone(ctx, x, y, dir, bell, len, t, a = 1, o?: { aspect?, pocket? })`: three-layer bell shroud
   (outer soft white over a navy halo, inner cyan additive, ice core streak), noisy pixel-snapped edges,
   4 Mach diamonds (12 Hz), 2 wingtip corkscrews; `pocket` draws the navy pocket round the ball.
   6 phase sprites × 3 size buckets cached. Replaces `machCone` and `vaporRibbon` as the ball's trail.
11. `vaporDisc(ctx, x, y, r, aspect, t)` + `vaporShards(env, x, y, r, n)`: the condensation disc
    (turbulent fringe, cyan rim, 3 cobalt inner contour rings) and its 100-shard burst.
12. `vaporTorus(ctx, x, y, r, t, a)`: the barrier ring, a white smoke torus expanding and breaking up.
13. `cycloneWall(ctx, cx, cy, rx, ry, h, t, half: 'back' | 'front', o?: { debris, funnel, burst })`: 14
    bands with debris riders; `funnel` stretches it into the trailing run-up funnel (shot 4); `burst` (0..1)
    blows the bands outward (radius × 1 → 2.6) with the front arcs at parallax 2.5, covering ≤ 45 % of the
    frame (shot 3's exit).
14. `windAura(env, a: StudioAnim, frame, x, y, scale, t, o?: { advect, spin })`: streamers as **horizontal
    arcs** wrapping the body, sampled per row from the studio `Silhouette` width (rx = half-width + 6-18 px,
    ry = 0.22 rx, 20-60° long), travelling tangentially at `spin` rev/s (shot 3: 1.4, counter-clockwise
    with the cyclone), rising ≤ 10 px/s, back halves before the figure and front halves after; never
    peeling upward off the edge. `advect` sweeps them off him (shot 5: +x at 600 px/s). **No `windSmear`**:
    GALE draws no copies of a silhouette.
15. `pressureOrb(ctx, x, y, R, t, crush = 0)`: compressed-air sphere, cyan core, 3 tilted isobar rings;
    `crush` flattens it to a disc on the laces.
16. `pressedWake(ctx, path, t, o)` (pure function of the ball path and the shot clock) and
    `bowWave(env, x, y, dir, power)` (dew, `PK.Mist`, `PK.Blade` walls). Builds on `machWake`.
17. `airCrater(ctx, x, y, R, k, age, rings = 3)`: generalises `drawStamp` / `pressureStamp` to any radius
    up to 400 px (pressed band, cyan glow line, cobalt core ring in normal blend).
18. `isobarSpiral(ctx, cx, cy, t, o)` and `implosionLines(ctx, cx, cy, n, t, inward = true)` (shot 2).
19. `vortexTunnel(ctx, t, speed, cx, cy)`: rings rushing past the lens for the chase POV.
20. `miniTornado(ctx, x, y, h, t)`: the palm tornado.
21. `windWipe(ctx, p, dir = 1)`: the transition (60 irregularly spaced streaks, ≤ 50 % coverage per frame);
    cuts out of shots 1, 3 and 8 and inside 9.
22. `anamorphic(ctx, x, y, w, a)`: the horizontal cyan eye streak (up to 600 px).
23. `bubbleRim(ctx, x, y, R, t)`: chromatic fringe + ice specular arc for the pressure bubble.
24. `stormDarken(ctx, k)`, `galeStorm`, `vacuumGrade`, `floodBack` (in `common.ts`, §2).
25. **`gustTitle(ctx, text, x, y, size, t, t0, o)`**: GALE's GOAL!: glyphs carried in from screen-left on a
    wind-wave front (0.05 s apart, outCubic into place over 0.18 s), sheared up to 0.5 and fluttering
    (shear and y on a damped 7 Hz sine), each snapping upright in 2 frames (110 % → 100 %) and stamping an
    isobar echo (2 ice contour lines, 1 px, +12 px over 0.2 s). Ice fill, cobalt stroke, navy outer stroke.
    Replaces `slamTitle` in GALE (ZENITH's GOAL! stays ZENITH's).
26. **`drawBall` `'cobalt'`** (`kit.ts`, GALE-only branch): re-layered so the additive outer glow is cyan
    and cobalt is a normal-blend halo ring (§2).
27. **`thunderWall(fx, ctx, t, o)`** (shots 7b and 8a; no shader of its own):
    - pushes **1-3 large-radius shock rings** through `pushShock` (the existing 4 slots). 7b: three rings
      centred off-frame left at UV (−2.0, 0.55), leading-edge UV x `e` 0.02 → 0.40, `r = (e + 2.0) × 1.78`
      (the shader scales dx by the aspect), trailing rings at −0.05 / −0.10 UV with s × 0.6 / × 0.35, at most
      one other shock in the shot. 8a (the reverse angle): one ring centred on the frame, imploding
      r 1.30 → 0.55;
    - `iceEdge(ctx, ring)`: the 1-2 px ice edge line on the same circle (additive, navy halo, steady);
    - `dustCurtain(ctx, env, ring, h)`: the dust/dew curtain behind the edge (`'storm'` smoke sprites in
      normal blend + `PK.Mist`, 40 → 240 px tall, torn top).

### 10.4 2.5D swing (`gale/swing.ts`, shot 6b only)

28. `interface SwingView { yaw: number; dist: number; f: number; cx: number; cy: number }` (yaw 90° = side,
    0° = facing the ball's nose). `swingProject(v, dx, dz, dh)`: offsets from the ball in metres (x along
    the flight, z across, h up) rotated by yaw about the vertical axis; depth `d = dist + forward`;
    screen `(cx + f·lateral/d, cy − f·dh/d)`, scale `f/d`. `drawSwingGround(ctx, v, t)`: a dark turf plane
    with 9 stripe lines, the pressed wake and the two craters; `swingBokeh(ctx, v, t)`: 24 floodlight
    bokeh points on 4 depth bands. The disc aspect is `cos(yaw)`.

### 10.5 Goal and stadium

29. `gale/goal.ts`: `interface GoalRig { slide; dome; bend; pegs; furrow; frost }`; `goalRigAt(t, o)` (a
    pure function of the shot clock: hit 0.40; slide 0 → `GOAL_SLIDE` 28 over 0.48-0.95, outCubic; dome
    0 → 1.0 (the cap) over 0.40-0.48, relaxing to 0.6 by 1.20; bend spring 4 Hz, peak 14 px at 0.56);
    `drawGoalRig(ctx, part, rig, t)` wraps the **side-view** `drawGoal` (the only goal view 8b uses; no
    three-quarter goal renderer is needed) with the frame offset, crossbar bend and dome profile, and draws
    the furrows (from the painted line to the post feet), the pegs and the frost. **The painted goal line
    stays at `FIELD.goalX`** and is drawn by the backdrop, never by the rig. The field result view and 9b
    use `goalRigAt(Infinity)` = slide 28, dome 0.6, bend 0. ZENITH's spring-mesh net stays ZENITH's.
30. `drawDownPitch` options: `goalSlide?: number` (28 in 9b), `storm?: number`; the existing `bulge` takes
    the dome (≤ 1.0; 0.6 in 9b). `FieldBackdropOpts` additions: `storm?` (cloud lid, mist streaks, navy
    stand multiply), `wind?` (flag/scarf whip 0..1), `windDir?` (±1), `windWave?` (0..1, a travelling gust
    wave left → right through the crowd with flag particles; it also gives `gustTitle` its front x),
    `boardsFold?` (0..1 domino), `towerSway?` (px).

### 10.6 Particles (`engine/particles.ts`)

31. **`PK.Blade`** (shared; a spinning grass blade, 3-5 px, `rot`/`vrot`) and `PK.Mist` (a vapour puff
    stretched along its velocity, normal blend); ramps `'vapor'` and `'storm'` (§2).
32. **`Particles.wind: [number, number]`** (shared; reset in `clear()`) is added to the acceleration of
    particles spawned with the new optional `wind` (0..1, default 0), so other specials are unaffected.
- The cap is the single engine `Particles.CAP` (§10.0); GALE's own budget is ≤ 900 live.

### 10.7 Audio (`engine/audio.ts`, procedural)

33. `howl(dur, gain = 0.4, rise = 1)`: multi-band storm wind (three band-passed noises with resonant peaks
    near 380 / 900 / 2100 Hz drifting, pitch rising by `rise`).
34. `vacuum(dur)`: on the dry bus: a 0.12 s reverse swell, then a 38 Hz sub-drone, a 7 kHz tinnitus whine
    at −30 dB and filtered air creaks. The shot's `muffle` curve closes the master; `vacuum` only adds
    sound. Its own timbre: never `timeStop`.
35. `glassRing(gain)`: a faint glass ring (2.6 kHz and 3.9 kHz partials, 1.2 s decay), dry (6b at 0.25, the
    7a dew drop at 0.05).
36. `thunderFront(dur)`: rolling thunder that approaches: a low rumble crescendo, rising crackle, the
    low-pass opening as it nears.
37. `hammerBoom(power)`: `boom(power)` + `sonicBoom(0.87·power)` + `crack(0.8·power)` + a sub drop (sine
    60 → 38 Hz over 0.6 s), as one call.
38. `metalGroan(dur)`: the goal frame bending and scraping (detuned saws through a falling band-pass).
39. `pegPop()`: a short pop with a dirt crumble.
- Kept: `sonicBoom`, `earPop`, `inhale`, `squash`, `gust`, `breath`, `whine`, `blip` (the digit clacks,
  1200-1800 Hz), `airTone` (G5 783.99, B5 987.77, D6 1174.66 Hz), the muffle bus, the dry bus, `duck`,
  `clearBus`. **Not used**: `tick()` (MERIDIAN's watch), `timeStop()`, heartbeats, drums.

### 10.8 `gale/common.ts`

- `PAL`/`HEX` + `stormNavy`; `STAMPS` keep their positions, with `t6`/`r6` replacing v1's `t4`/`r4`; new
  `WALL`, `BARRIER`, `KEEPER`, **`GOAL_SLIDE = 28`**; `ballPathH(x)` (the heights in §3); `MUFFLE` (§3);
  `SEQ` (No.10 frame schedules per shot, §9); `BLINK` gains `windWipe`.
- Kept from v1: `recoilSpring`, `refractionBand`, `stampShock`, `lensAt`, `drawStamp`, `ghostStamp` (the
  field), `isobars`, `inhaleField`, `makeBlades`/`leanToward`/`leanAway`/`drawBlades`, `smearArc`,
  `dewMirror`, `sparkleCyan`, `dropletCurtain`, `airSliver`. Deleted: `galeGrade`, `galeImpact`,
  `netExhale`, `exhaleMist`, `vaporRibbon`, `machCone`, `airStepHeight`, `placeholderShot`, **`steps`**
  (now the `'step2'` preset of `keys()`) and **`nameCard`** (now the shared one in `kit.ts`).

## 11. Quality bar (what reviewers check)

1. **Still frames read instantly**: who, what, which way. Every frame of shots 2-8 holds **one giant
   energy shape** (spiral, cyclone, orb, collar/torus, cone, disc, thunder wall, shroud). Re-run
   `compare_keyframes.png`: GALE's row must read like ZENITH's and CRESCENT's rows.
2. **Dark world, hot subject**: the §2 metric targets on a 6 fps film (deep shadow 40-50 %, hot 3 %+,
   violent changes 18+ per 100 frames, contrast 0.18+). Every additive glow has a navy halo; the lens
   never drags the floodlights into a white smear.
3. **The ball**: at least 56 px whenever it is the subject in shots 5-8 (109 macro, 65 ride, 60 halo,
   56 POV, 62 dead, 91 hammer 2); its ice core is the hottest point inside its cone or disc; `fx.radial`
   ≤ 0.35 while it is on screen (except the 0.06 s detonation stage).
4. **The hero**: at least 150 px in every shot he leads (157 at the trap, 255 in the eye, 216-450 in the
   inhale, 176 in the recoil, 196 in the back view); busts at ×2-×3.
5. **Contact stacks**: hammer 1 and hammer 2 show all 12 listed layers on the same frame; the detonation
   all 10. Iso stage 1 shows 45 %+ navy/cobalt (never mostly white) and at most 4 light/dark band
   pairs; stage 2 is the luminance-only negative print with no rings.
6. **Escalation**: No.10's three hits grow (sound peak, shock count, frame coverage); hammer 2 is the
   loudest moment of the film.
7. **Code tallies**: cam.hit/shove sites ≥ 16 (max 1.0); boom/sonicBoom/hammerBoom sites ≥ 14 (max 1.5);
   shock-ring sites ≥ 14; iso sites 3 (6 events); roar 3+; vacuum gaps exactly 3; focus-line bursts ≥ 5.
8. **Silence**: muffle ≥ 0.8 only in the three gaps (≤ 2.0 s in total), each ending on a blast within
   0.1 s; never reads as a bug; clocked on cinematic time, so seek and replay are exact.
9. **Camera**: the grammar of §1.3 is all present; no roll (shake roll ≤ 0.015 rad); every cut is its
   listed punch; no crash onto the eyes and no flash out of shot 3; shot 3's crane lurches are unevenly
   spaced (never on a beat grid).
10. **Opponents overpowered, menace not slapstick**: the wall untouched by the ball and then flung by its
    sound; one body at the lens; the keeper's single punch (no catch, no grind, no spin through gloves),
    the thunder visible from the first frame of his grin; the keeper folded and cartwheeled; the goal 2.8 m
    behind its painted line with furrows, pegs and a U crossbar; the net never torn. **The climax reads**:
    in 8b the gap between the painted line and the near post foot is ≥ 45 px on screen for ≥ 0.5 s, and
    the dome never exceeds bulge 1.0. No boots flying off,
    no bowling pins, no comic heaps.
11. **Identity**: nothing on the never-list of §1.2; the ball's height table of §3; grass pressed, not
    ripped (except the goal furrows).
12. **Pixel-art consistency**: studio frames at integer scales, nearest neighbour; No.10 never a puppet;
    at most 3 puppet renders per frame (the shared `PuppetCache`).
13. **Sound**: the motif exactly in tune, only on the title (arpeggio) and the blow (chord); ear-pops only
    in the inhale; every No.10 hit carries a low end ≥ boom 1.3; the roar after the detonation and hammer 2;
    no `tick()` anywhere (the 30 M counter clacks, the dew drop is a glass ring); no "ding" on the grin.
14. **Natural motion**: §9.5.
15. **Performance and determinism**: no large canvas allocations per frame; sprite caches and
    `FINAL_GALE` warmed in `prepare()`; ≤ 900 live particles under the single engine cap; simulation
    only on `env.rng` in `update`, one-time events behind flags; every decal and rig a pure function of
    the shot clock; 60 fps on a low-end phone.
16. **Photosensitivity**: §4.1 (flash events and the pattern rule); the shared FlashBudget assert passes
    on a full capture.
17. **Text and names**: ≤ 3 words of on-screen text at a time; the forbidden word nowhere; §1.4 re-checked.
18. **Colour**: cobalt only as halo, stroke and iso band; the largest additive glow in every frame is ice
    or cyan (check the brightest additive layer's hue on the film).
19. **Set ownership**: GALE's dead stop + grin, `gkPunch` and `netTangle` appear in no other special;
    no copies of No.10's silhouette anywhere; aura streamers wrap him sideways and never rise off his edge;
    GOAL! arrives on the wind wave (no slam, no confetti, no crowd flashes).

## 12. Risks and fallbacks

| Risk | Fallback |
|---|---|
| The **swing-orbit** reads as a slide, not a turn | The disc's aspect change carries it; 4 bokeh depth bands; the background at 15 % hides geometry. If still flat: a side crash zoom into the disc (aspect 0.3), then a 0.1 s hard cut to the front-on halo |
| The **dead stop** reads as the shot failing | The wall is on screen from the first grin frame; stillness ≤ 0.45 s; the rumble starts at 0.80; KF3 must be big and clear. Playtest with kids: they should point at the wall, not look away |
| The **hero-ball scale** (65 px next to 280 px defenders) looks wrong | Their heads stay out of frame; the ball is never beside No.10's boot at hero scale. If it still jars: 52 px |
| **Art load** (22 frames) | The priority order and fallbacks in §9.5; 4 frames are tremble variants |
| **WH1** (a palm at the lens, 140 px on screen) | Drawn first, reviewed at ×4; the three-quarter palm fallback |
| **Performance**: cyclone + 300 inhale particles + cone + wake + `FINAL_GALE` + lens in one frame | Cached cone/torus/cyclone sprites; GALE's 900-live budget under the single engine cap; `FINAL_GALE` only on iso/streak frames; test on a low-end phone |
| **ZENITH overlap** | The keeper beat is one punch and a still ball (no grind, no burn); no crash onto the eyes and no white flash out of shot 3 (the cyclone bursts outward instead); the aura wraps him sideways (never edge flames); GOAL! rides the wind wave (no letter slam, no confetti, no crowd flashes); iso stage 2 is a 3-band navy/cobalt/ice print with contour lines, never a black/white two-tone; the POV looks forward from inside the ball's wake (not a meteor falling at the lens); no fire, no arcs, no lightning; the net never tears |
| **CRESCENT overlap** | No roll, no dolly zoom, no slash split; iso stage 2 is 3 navy/cobalt/ice bands with contour lines, never a silver/indigo two-tone |
| **SOLO v2 overlap** | GALE's only orbit is a 0.40 s yaw round the ball's disc (never round a body); GALE draws no copies of No.10 at all (`windSmear` deleted); shot 3's lurches are unevenly spaced, never on a beat; cobalt is never the hot glow (28° of hue from SOLO's uv); grass is pressed, never ripped by feet; no snaps, no lights off |
| **MERIDIAN v2 overlap** | GALE's ball stays below 1.9 m and never arcs; no thread, no jade, no irises; no ticks (digit clacks, a glass-ring dew drop); aura streamers never peel up (MERIDIAN 2a's ink tendrils); GALE keeps the dead stop + grin, `gkPunch` and `netTangle` (MERIDIAN drops its copies; its keeper is lashed and spun to the turf) |
| The **goal moving** reads as a broken prop | It skids, bends, springs and stays standing; posts never snap or fly; the painted line is the proof |
| The **slide reads as the net ballooning** (v1's read) | `GOAL_SLIDE` 28 (2.8 m), the dome capped at bulge 1.0, the side view with the unmoved painted line, the proof push to 1.9 (53 px gap for about 0.63 s). If a playtest still says "the net blew out": hold the push 0.1 s longer (GOAL! at 1.76) and run a second cyan glint along the painted line |
| The **flash budget** is at its limit in 12.50-13.50 | FlashBudget clamps; the shroud's peak alpha may drop to 0.75 if a capture measures a fourth luminance jump |
| **Runtime** 16.7 s (v1 11.3 s) | SP 75; durations fixed for seek; under ZENITH's 17.2 s |
| **Originality** (Captain Tsubasa and the genre) | §1.4: the name re-checked before shipping (fallback STORM ANVIL); the keeper wins first and is never simply blown into the net; he never holds or grinds the ball and spin never pushes it through; the restart is an external wall of air; confirm again that no named football-anime shot is stopped and then pushed through by its own delayed sonic boom; the ball never bounces on the ground or dips |

## 13. Set-critic revisions (Nov 2026)

Applied after the set critic compared the three v2 briefs side by side. Durations, shot count, runtime
(16.7 s) and SP (75) are unchanged.

1. **Climax readability (8b, result view, 9b).** 8b is staged in the existing **side world view** (no
   three-quarter goal renderer). `GOAL_SLIDE` 12 → **28** world px (**2.8 m**, the hero-ball licence). The
   1.05-2.10 pull-back to 0.78 is replaced by the **proof push**: crane down and push 0.92 → 1.90 onto the
   near post foot, the painted line and the furrow (gap 53 px, ≥ 45 px for about 0.63 s), then a pull-out
   for GOAL!. Dome capped at bulge **1.0** (was 2.4), relaxing to 0.6; 9b `goalSlide` 28 / `bulge` 0.6;
   `goalRigAt(Infinity)` and the result view 28 px / 0.6; story text, §1.3 (proof push), §3, §4, money
   shot 8 and §11-12 updated.
2. **Shot 3 exit.** The three-lurch crash onto the eyes (to ×3.2) and the inExpo ice flash are gone: SS3's
   eyes ignite at zoom 1.42, then over 1.62-1.85 the cyclone wall bursts outward past the lens (front-arc
   bands at parallax 2.5, ≤ 45 % coverage, `cam.shove(0, -14)`, zoom 1.42 → 1.15 outCubic); cut with the
   wind wipe; E4 dropped from §4.1 (events renumbered E1-E10). The crane lurches move to 0.85 / 1.15 /
   1.32 (quickening breaths, never on a beat).
3. **Shot 3 aura.** `windSmear` deleted (no copies of No.10 anywhere). `windAura` streamers are horizontal
   arcs travelling tangentially with the counter-clockwise cyclone; they never peel upward off the edge.
4. **No `fx.front` shader.** The thunder wall (7b, 8a) is 1-3 large-radius `pushShock` rings (7b: centred
   at UV (−2.0, 0.55), leading edge UV x 0.02 → 0.40, r = (e + 2.0) × 1.78 for the shader's aspect scaling;
   8a, the reverse angle: one ring centred on the frame), plus the canvas `iceEdge` line and `dustCurtain`.
   7b uses one other shock at most. `FINAL_GALE` = lens + iso + streak.
5. **Photosensitivity.** §10.1 item 6 FlashBudget is the set's single definition (flash ≥ 0.3, impact/iso
   ≥ 0.5, `fullFrame`), imported unchanged by MERIDIAN and SOLO. Iso stage 1 is capped at ≤ 4 light/dark
   band pairs; stage 2 is a different geometry (luminance-only negative print, `isoMix` 0, 3 bands, no
   rings), never stage 1 inverted. A pattern rule is added to §4.1.
6. **GOAL!** `slamTitle`, confetti and crowd camera flashes (ZENITH's) are replaced by `gustTitle`: 130 px
   glyphs carried in from screen-left on the stadium wind wave, sheared and fluttering like the flags,
   snapping upright with an isobar echo. The stadium wave moves to 1.62 to carry them; 9a's confetti
   becomes scarf strands and dew.
7. **Keeper ownership and tone.** GALE keeps the set's only dead stop + grin, double-fist punch (`gkPunch`)
   and side-netting end pose (`netTangle`) (§1.2, §9.4); MERIDIAN drops its copies. The 0.55 tooth glint
   and `blip(2400)` "ding" are removed; KF3 has no highlight glint.
8. **Sound and colour.** The 30 M counter's `tick` × 6 becomes rising digit clacks (`blip` 1200 → 1800
   Hz); the 7a dew-drip ticks become one very quiet `glassRing(0.05)`; GALE never calls `tick()`. Cobalt is
   halo, stroke and iso band only, never the largest additive glow (the `'cobalt'` ball's additive glow is
   now cyan); GALE's hot colours are ice and cyan.
9. **Shared engine (§10.0).** GALE builds, for all three specials, the `STREAK` chunk, FlashBudget,
   `fx.fullFrame`, `cam.shove`, `cam.buffet`, `PK.Blade` and `Particles.wind`. `steps` / `vacuumPull` /
   `blowBack` become the `'step2'` / `'vacuum'` / `'blowBack'` presets on MERIDIAN's shared `keys()` track;
   the wall and keeper use SOLO's `PuppetCache` (moved to `kit.ts`); one shared `nameCard` replaces the
   copy in `gale/common.ts`; one engine particle cap `Particles.CAP` (1500) with GALE's budget ≤ 900 live;
   `FINAL_GALE = buildFinal([LENS, ISO, STREAK])` from shared chunks. §10.1 keeps item 3 (streak) and
   item 6 (FlashBudget) at the numbers the SOLO brief cites.
10. **Identity table (§1.1)** replaced with the shared set table (new rows: signature post effect,
    gesture, keeper beat, false defeat; MERIDIAN's and SOLO's columns synced to their briefs), sourced
    from one shared file, `docs/skills/SET_TABLE.md`.
11. **Name and originality check (§1.4)** added, in the format of MERIDIAN's and SOLO's: GALE HAMMER found
    unused in a Nov 2026 search (fallback STORM ANVIL), re-check before shipping; confirm again that no
    named football-anime shot is stopped by the keeper and then pushed through by its own delayed sonic
    boom.
