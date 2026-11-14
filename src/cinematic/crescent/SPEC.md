# CRIMSON CRESCENT: shot spec

No.10's bicycle kick. Back to goal under a high cross, he flips upside down; the stadium turns
over with him; his boot carves a crescent moon of crimson fire through the sky, and the ball
rides that crescent into the net while he lands facing away from goal and never turns around.

This is the second special shot in the game. The first, ZENITH METEOR (`../zenith/`), is the
quality bar: study its shots for structure, effects, pacing and polish. CRIMSON CRESCENT must
feel like a sibling (same engine, same pixel-art + post-FX look, same punch) but every beat,
camera move and color grade must be its **own**, not a recolor of Zenith.

## Identity

| | ZENITH METEOR (done) | CRIMSON CRESCENT (this) |
|---|---|---|
| Palette | fire orange / gold, night blue | **crimson + silver-white**, deep indigo night |
| Signature camera | vertical tilt up into the sky | **camera roll**: the world turns upside down, then whip-rolls back |
| Signature shape | meteor + fire trail | **crescent**: arc slash, crescent blades, crescent crater, crescent moon |
| New post effect | — | **slash split** (`fx.cut*`): the frame is cut along the crescent and the halves slide apart |
| Impact frame | black/white, red/black | crimson/black or silver/indigo two-tone |

Palette constants: `PAL` in `./common.ts`. Ball after the kick: `drawBall(..., 'crimson')`,
trail: `crimsonRibbon`, flames: `meteorFlames(..., 'crimson')`, particles: ramps `'crimson'`, `'silver'`.

## Continuity (all shots)

- Night stadium. A thin **crescent moon** hangs in the sky in every outdoor shot where the sky shows.
- Goal is to the **right** (+x). No.10 is in the box with his **back to goal**: in side views he
  faces **left** (`HERO_FACING` = -1: the Bicycle frames are played from their west strip).
- The cross came from the right wing, high; the ball drops above him.
- The bicycle kick sends the ball to the **right**, toward goal.
- Kits: `HERO_KIT` (No.10), `RIVAL_KIT` / `RIVAL_KIT_B` (white defenders), `KEEPER_KIT` (green keeper).
- No.10 is always the drawn studio character (Pixel Studio "Sochetra", `src/art/anim/`), never the
  puppet. Close-ups facing the camera (shots 1-2) use the hand-drawn sprite (`drawHero`, `env.art.hero`).
  Shots 3-5 play the **Bicycle** frames (BK1-BK12c) through `./hero.ts`: west strip (numbers read
  "10"), rotated by rot = -spin about the pelvis (airborne) or the planted contact pixel (BK1-BK3);
  every aura, rim, ghost and impact cut-out is a tinted / silhouette copy of the same frame. Shot 8
  plays **Land** (L1-L4) then **Stand Front** a/b. Puppets remain only for the keeper and defenders.

## Shots (durations are fixed: do not change them)

| # | File / export | Dur | Seed |
|---|---|---|---|
| 1 | `shot1_cutin.ts` / `shotCutIn` | 1.7 | 101 |
| 2 | `shot2_read.ts` / `shotRead` | 1.7 | 102 |
| 3 | `shot3_liftoff.ts` / `shotLiftoff` | 1.4 | 103 |
| 4 | `shot4_inverted.ts` / `shotInverted` | 1.9 | 104 |
| 5 | `shot5_crescent.ts` / `shotCrescent` | 1.7 | 105 |
| 6 | `shot6_orbit.ts` / `shotOrbit` | 2.0 | 106 |
| 7 | `shot7_fingertips.ts` / `shotFingertips` | 1.7 | 107 |
| 8 | `shot8_backtogoal.ts` / `shotBackToGoal` | 3.2 | 108 |

Each shot's `name` field: "Cut-in", "Read the cross", "Lift-off", "Inverted sky", "The crescent",
"Crescent orbit", "Fingertips", "Back to goal".

### 1 · Cut-in (1.7 s)
Declare the move. Same family as Zenith's cut-in, different shape.
- Background: deep indigo to crimson with silver focus lines; a huge thin crescent moon shape slowly rotating behind.
- The window is a **crescent-shaped panel** (`crescentPath`) that swings in by rotating ~120° into place (0–0.25 s), with a silver outline and crimson rim.
- Inside: No.10's eyes close-up (crop `art.hero.face`, eye positions `art.hero.eyes`). It starts **upside down** and rotates upright with the panel (foreshadows the inversion). Crimson rim light from below.
- ~0.55 s eye glint: `sparkle` on both eyes + silver `lensFlare`; `sfx.shing()`.
- ~0.8–1.15 s the title **CRIMSON CRESCENT** is *revealed by a sweeping crescent of light* (`crescentArc` passing across it; letters appear behind its edge), not slammed letter by letter. Crimson stroke, silver-white fill, dark outer stroke.
- Small tag: `SPECIAL SHOT · No.10 · BICYCLE KICK` (pixel font).
- 1.5–1.7 s the panel spins away + flash.
- Audio: `stinger()` at 0, `shing()` at the glint, `whoosh` on the sweep.

### 2 · Read the cross (1.7 s)
Anticipation, cool and quiet, the opposite of Zenith's roaring power-up.
- Front low-angle close-up of No.10 with the hand-drawn sprite (chest-up framing, scale ~3–3.4, feet below frame). Looking up at the ball.
- The ball falls from the sky in slow motion behind/above him, spinning, toward the top of frame; its shadow darkens his face as it passes.
- **Dolly zoom (vertigo)**: the background (stands, floodlights, sky, crescent moon) scales from ~1.0 to ~1.5 while he stays the same size.
- Cold aura: crimson + silver flames along his silhouette edges (like Zenith shot 2's edge flames, but `'crimson'`/`'silver'` ramps, thinner), hair glinting crimson.
- Two heartbeats (~0.3 s and ~0.75 s): low `boom(0.35)`, matching zoom pulse + brief desaturation.
- ~1.35 s eyes flash silver (`sparkle`), whoosh, cut on a flash.

### 3 · Lift-off (1.4 s)
- Side view at grass level, indigo night grade. No.10's Bicycle frames at scale 2 (2-px pixels), facing -1.
- Frames: BK1 gather (0–0.35) → BK2 stamp (on the plant, held through the hit-stop) → BK3 spring onto
  the toe (0.44) → BK4 rise (0.54, off the turf) → BK5 swing (0.72) → BK6 scissor (0.92) → BK7 cock
  (1.18–1.4). Ground frames stand on their contact pixel; his hip then flies ~130 px up to the apex
  shot 4 picks up.
- The ball drops into frame from top-right toward a point above his head (contact happens in shot 5).
- ~0.35 s launch: the plant foot cracks the turf into a **crescent-shaped crater** (filled `crescentPath`, squashed for perspective, glowing crimson rim), grass chunks, dust, ring.
- From ~0.4 s the **camera rolls** with his rotation and pushes in; by the end the world is tilted ~70° (leads into shot 4's full inversion).
- Crimson ribbon trailing the rising far boot; silver speed lines.
- Audio: `kick(0.6)` on the plant, rising whoosh.

### 4 · Inverted sky (1.9 s): the signature beat
- Camera rolled ~180°: the **stadium hangs upside down** (stands and floodlights at the top of the screen, beams pointing down; sky and the crescent moon at the bottom). The inversion must be unmistakable.
- **Time almost frozen** (`rate` ~0.08 for most of the shot): dust motes, embers and crowd camera flashes hang still as points of light; the ball hangs just above his raised foot.
- Grade: desaturated indigo/silver; only the crimson aura and the ball keep color.
- `timeStop()` at the start, two slow heartbeats, subtle zoom pulses. Frames (scale 2.4, the shot-3 body
  1.2x closer): BK7 cock → BK7b weightless drift (0.3) → the coil trembling BK8 ↔ BK8b every 0.3 s,
  ending on BK8 at the snap. Late glint (~1.5 s).
- 1.75–1.9 s everything snaps (flash) into shot 5.

### 5 · The crescent (1.7 s): the strike
- Camera still rolled ~π at the start. Frames: the coil winding BK8 ↔ BK8b (0–0.40) → BK9 whip smear
  (0.40–0.45) → **BK10 STRIKE at HIT = 0.45 s**: the instep (`boot` anchor) meets the ball, which waits
  tangent to it (`strikeBallOffset`) → BK11 follow (0.66) → BK12 / BK12b / BK12c tumbling over (0.85, 1.15, 1.4).
- The kicking boot carves a **huge crescent arc of fire** (`crescentArc`, center ≈ hip, radius ≈ leg length × draw scale), growing with the boot from the cocked angle to the strike angle, ~25–40 px thick. It lingers after contact and dissolves into crimson embers spawned along it (~0.8 s).
- **Contact**: hit-stop (`rate` ~0.03 for ~0.18 s), two-tone impact frame (crimson/black or silver/indigo), and the **slash split**: `fx.cutX/cutY` = hip in screen UV (`cam.toUV`), `fx.cutR` = arc radius in screen-height units, `fx.cutA0/cutA1` = the crescent's start/end angles (so only the slash arc splits, not a full ring), `fx.cut` shift 0 → ~0.015 → 0 over ~0.35 s, `fx.cutGlow` ~1 with a silver `fx.cutColor`.
- Then the camera **whip-rolls back upright** (~0.3 s, with `fx.radial` blur) and the ball fires off screen-right as a crimson comet (`drawBall` `'crimson'`, `crimsonRibbon`, `meteorFlames` `'crimson'`), with a crescent-shaped shockwave expanding.
- Audio: `boom(1.3)` + `kick` + `crack` at HIT; `whoosh` on the whip-roll; `roar` after.

### 6 · Crescent orbit (2.0 s): bird's-eye
- **New camera angle: top-down** over the penalty area: mowing stripes, penalty box, six-yard box, penalty arc; the goal at the right edge seen from above (posts, net rectangle).
- Players from above: simple top-down pixel figures (head with hair, shoulders in shirt color, arms; soft shadow). 3 white defenders + the green keeper on the line.
- The ball (crimson comet from above) travels toward goal on a **curved crescent path** (banana) that swerves around the defenders. Two **crescent blades** (`crescentPath`, silver edge, crimson body) orbit the ball, spinning; each blade burns a curved scorch line into the grass.
- Defenders lunge at the ball and are knocked spinning as the blades pass (rotate + push the figure, dust puff, ring).
- Camera follows the ball with a slow roll drift and slight zoom; motion streaks on the grass.
- Ends as the ball reaches the six-yard box near the keeper.

### 7 · Fingertips (1.7 s)
- Chase/side camera at keeper height: the keeper (`KEEPER_KIT`, `k` 1, draw scale ~2) launches into `gkDive`, full stretch toward the ball's path.
- **Extreme slow motion** (`rate` ~0.1) as his glove fingertips come within a few pixels of the ball; a crescent blade whirls around the ball between them; tiny silver sparks where blade meets glove.
- Then the spin rips through: his **glove is torn off** and spins away; time snaps back to 1×; the ball blazes past; he keeps falling.
- Dutch angle; push-in during the near-miss; whip pan with the ball at release.
- Audio: held tension (`timeStop`), `crack` at the rip, `whoosh`, `roar`.

### 8 · Back to goal (3.2 s)
- Front view. No.10 lands in the **foreground** (the drawn Land frames, scale 2.4), facing the camera with his back to the goal. The goal is behind him in the background (smaller, darker, slightly soft).
- 0–0.62 s he drops into frame and lands, the squash and stretch drawn: L1 drop (toes down, arms up) → L2 impact on the turf (0.26) → L3 absorb (0.33) → L4 rebound (0.47) → Stand Front a/b panting every 0.3 s; dust ring, a crescent-shaped crack under his feet, small camera bump.
- ~0.6 s behind him the ball rips into the net: net bulge/ripple, a **crescent-shaped burst of crimson light** explodes behind him and back-lights him (strong crimson rim from the frame's `tinted()` additive copies offset outward, per-frame pixel rims, silver bloom). **He does not turn around.**
- ~1.0 s **GOAL!** (`slamTitle`) above him without covering his face; crowd roar + `stinger` + `whistle`; confetti; crowd camera flashes.
- 2.0–3.2 s name card slides in at the bottom, matching Zenith's card: `CRIMSON CRESCENT` (left), `No.10 · SPECIAL SHOT`, `CAM 1 - 0 RIV` (right). Fade to dark over the last 0.35 s.

## Engine cheat-sheet

- Logical canvas 640×360 (`VW`, `VH`). `env.world()` applies the camera; `env.screen()` = screen space.
- `env.cam.set(x, y, zoom, rot)`, `cam.hit(trauma)`, `cam.shakeAmp`, `cam.toUV(wx, wy)` (for post-FX positions).
- `env.fx` (`FxState` in `engine/post.ts`) is reset every frame; set fields in `render`: `bloom`, `bloomThresh`, `vignette`, `ca`, `radial`/`radialX`/`radialY`, `impact`/`impA`/`impB`/`impThresh`, `flash`/`flashColor`, `sat`, `tint`, `contrast`, `shocks.push({x, y, r, s})`, and the slash split `cut`, `cutX`, `cutY`, `cutR`, `cutDirX`, `cutDirY`, `cutGlow`, `cutWidth`, `cutColor`, `cutA0`/`cutA1` (limit the cut to an arc; angles in canvas convention, equal = full circle).
- Particles: `env.parts.spawn({...})` (`PK.Glow`, `Pixel`, `Streak`, `Smoke`, `Debris`, `Ring`, `Confetti`), drawn with `env.parts.draw(ctx, layer)` (layer 0 = behind, 1 = front).
- No.10: `./hero.ts` (`place`, `at` for any anchor or rig joint in world space, `drawPlace`, `silOf`) over
  `../../art/studioAnim` (`anim`, `drawAnim`, `tinted`, `silhouette`).
- Puppets (keeper, defenders): `renderPuppet(kit, pose, {k, facing, silhouette?})` returns a canvas that is **reused on the next call with the same size/hair/silhouette**, so draw it (`drawPuppet`) before rendering another. `joints(pose)` + `jointWorld(...)` give hand/toe positions (use them to put the boot exactly on the ball, gloves near the ball). `poseAt(track, t)` blends a pose track.
- Shot contract (`../timeline.ts`): `init` resets ALL module state; `update(env, t, dt)` simulates with `env.rng` (seeded, deterministic); `render(env, t)` draws (use `env.frng()` for flicker); `rate(t)` for hit-stop/slow-mo; `cues` for one-shot sounds. Use flags (not `t - dt < X`) for one-time events inside `update`, because `dt` is time-warped.
- Sounds (`engine/audio.ts`): `boom`, `crack`, `kick`, `whoosh`, `rumble`, `crackle`, `shing`, `stinger`, `timeStop`, `roar`, `strain`, `crowd`, `blip`, `whistle`.
- Helpers: `../kit.ts` (drawHero, Trail, fireRibbon, crimsonRibbon, drawBall, meteorFlames, ring, sparks, dustBurst, grassChunks, warp, pulse), `../../art/fx.ts` (focusLines, speedStreaks, ribbon, arc, lensFlare, sparkle, slamTitle, pixelText, crescentArc, crescentPath, makeCracks/drawCracks), `../../art/stadium.ts` (stadium art: crowd, crowdNear, tower, pitch, stars, flashes, moon, cloud; drawFieldBackdrop, drawGoal, drawShadow).

## Quality bar (what reviewers check)

1. The action reads instantly in a still frame: who, what, which direction.
2. Nothing is blown out for long: additive glow on a bright background turns white, so put a dark halo behind it or use normal blending.
3. The subject is never lost in particles, smoke or blur.
4. Pixel-art consistency: crisp sprites, no smeared scaling of the hand-drawn sprite.
5. Every shot opens and closes cleanly for a hard cut (short flash in/out where it helps).
6. It is clearly CRIMSON CRESCENT: crimson + silver, crescent shapes, the roll/inversion idea.
7. Performance: no big canvas allocations per frame, at most ~4 puppet renders per frame, particles under ~1500.
