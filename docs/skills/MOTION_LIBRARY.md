# No.10 MOTION LIBRARY: shared studio animations for every special

Pixel Studio project **"Sochetra"** (128×128, No.10 98 px tall standing, ground row 102, the 15-colour
palette `a..o`), plus a new project **"No.7"** for the winger. Every studio frame must pass the on-model
checklist in §1.0 below (condensed from the Jump plan, so it travels with this file: 29 px head, the
navy hair MOP (never a radial star), 9×8 fists, 12+12 px arm, 15+13 px leg, 17-18 px chunky boots,
2-3 cel tones, 1 px `a` outline, light from the upper front, far limbs one step darker, no AA, no new
colours).

This file replaces the per-skill "Studio art" frame lists in:
- `shot2/SPEC.md` (GALE HAMMER);
- `pass/SPEC.md` (MERIDIAN THREAD);
- `dribble/SPEC.md` (SPOTLIGHT SOLO);
- the puppet moments in `src/cinematic/crescent/` (CRIMSON CRESCENT).

Those briefs keep their timings and beats. This library decides **which drawing** each beat uses, so
that no motion is drawn twice: one run cycle, one dribble cycle, one bound, one instep-kick base, one
3/4 break-away cycle, one front approach touch, and one breathing stand per view. It also sets one
anchor schema and one production plan for all of them.

Legend used in the tables:
- **N**: a new full drawing.
- **V**: a variant, a copy of an approved final with at most about 40 % of its pixels redrawn (head
  turn, breath, hair drift, arm change).
- **R**: a re-skin, a scripted palette, number and head swap of a final, then a touch-up.
- **C**: a straight copy.

---------------------------------------------------------------------------------------------

## 0. At a glance

| Family | Studio animation (view) | Frames | Type | Used by |
|---|---|---|---|---|
| model | Idle (F/S/B) | 3 | exists | master model sheet, Zenith "stand" frame |
| model | **Stand** (Front, Back) | 4 | 2 C + 2 V | Crescent shot 8 hold, GALE shot 6 breathe, base for Point |
| locomotion | **Run** (Side) | 8 | N | GALE run-up, pass T1, No.7 Run (re-skin), field/result caches |
| locomotion | **Approach** (Side) | 3 | 1 N + 2 V | GALE F4 bound, pass T1/T2 (head-away) |
| locomotion | **Dribble** (Side) | 8 | N | dribble shots 2/4/7, field carry, result caches |
| kick | **Strike** (Side) | 8 | 7 N + 1 V | GALE shots 2-3; base for No.7 R4 |
| kick | **StrikeMacro** (Side, macro) | 3 | N | GALE shot 3 insert |
| kick | **Trivela** (Side) | 8 | 7 N + 1 V | pass shots 1 (crop), 3, 5 (cache) |
| kick | Flick (Side), Volley (Side) | 3 + 4 | in progress (`../kick/final`) | Zenith shots 3, 5 |
| airborne | Jump (Side) | 10 | exists | Zenith shots 3-5 |
| airborne | **Bicycle** (Side, played mirrored) | 15 | 12 N + 3 V | Crescent shots 3, 4, 5 (replaces the puppet) |
| ball skill | **SoleLift** (Side) | 12 | 11 N + 1 V | dribble shot 4 |
| ball skill | **Settle** (Side) | 4 | 1 N + 3 V | dribble shot 7, dribble result |
| front | **FrontTouch** (Front) | 1 | N | dribble shots 3, 5, 6 (each F1) |
| front | **Break** (Front, 3/4) | 3 (+1 opt) | N | dribble shots 3, 5 (mirrored), 6 |
| front | **StepOver** (Front) | 6 | N | dribble shot 3 |
| front | **Elastico** (Front) | 4 | N | dribble shot 5 |
| front | **Nutmeg** (Front) | 3 | N | dribble shot 6 |
| front | **Land** (Front) | 4 | N | Crescent shot 8 (replaces the squashed static sprite) |
| front | **Point** (Front) | 4 | 3 N + 1 V | pass shot 6 diptych; No.7 Point (mirror re-skin) |
| back | **Carry** (Back) | 4 | N | pass shot 2 |
| back | **Scan** (Back) | 4 | 4 V (of Carry) | pass shot 2 |
| back | **StrikeBack** (Back) | 3 | 2 N + 1 V | GALE shot 6 |
| face | **Glance** (face crop 48×26, own small project) | 4 | 4 V | pass 1-3 insets, dribble 1 + 7, GALE 2 dew mirror |
| results | **Celebrate** (Side), **wave 2, required** | 2 | 1 N + 1 V | the result views of GALE and the pass now (no puppet No.10 in any new special), later Zenith and Crescent |

**No.10 new work: 89 N + 24 V + 2 C = 115 studio frames**, Celebrate included (effort ≈ 96
full-drawing units, counting a V as 0.3). On top of that come 4 reference canvases (heads, boots, 3/4 model). Existing or in progress:
Idle 3, Jump 10, Flick 3, Volley 4.

**No.7: 20 frames** (4 N + 2 V + 14 R, his Celebrate re-skin included). **Rivals/keeper (phase 3): about 13 frames.** The full table
is in §8.

Compared with each skill drawing its own list: the briefs ask for 91 No.10 slots (GALE 19, pass 24,
dribble 48) plus about 21 for Crescent and 14 for No.7. Drawn separately, that is about 114 full
drawings. The library needs **92** (88 for No.10 and 4 for No.7) and still adds:
- a complete 8-frame run;
- drawn holds where the briefs held one drawing too long;
- one consistent body for No.10, No.7 and, later, the rivals.

---------------------------------------------------------------------------------------------

## 1. Library-wide rules (every animation)

### 1.0 On-model checklist (every final frame must pass; derived from Idle Side)
- **Scale.** Standing height 98 px (rows 5..102), about 3.4 heads. Head (hair crown to chin) 29 px.
  Hair mass about 33 px wide, overhanging the back of the skull by about 13 px. Face block 19×15.
  Neck 3 px wide and short.
- **Body.** Jersey 25 px tall and 18-19 px deep in side view; baggy shorts 14 px tall, 15-16 px
  wide. Upper arm 12 px (9-10 px thick at the sleeve), forearm to fist centre 12 px, fist 9×8 in
  every frame. Thigh 15 px, shin 13 px, boot 17-18 px long × 11 px high. Never change these; rotate
  and foreshorten only.
- **Hair.** One spiky mop: about 7 long spikes fanning back/up-back, 3-4 tall crown spikes, a short
  fringe and one strand before the ear. Body `c`, highlight streaks `e` running along each spike
  (2-4 px dashes), `m` in the deepest gaps, `a` outline. Never flat, never a radial star.
- **Face (side).** One eye: a dark `a` block with an `n` pupil at the front-top and `h` catchlights;
  a thick brow; ear with a white `h` stud under it; 1 px nose bump; small mouth; `g` jaw shadow.
  Skin `b` light, `g` shade, `k` crevices only.
- **Kit.** Jersey `d` / `l` / `f`, yellow `j` collar and slanted sleeve trim, the small sleeve "10"
  and the chest "0" sliver (side), the big back "10" (back view). Shorts `e` with `m`/`k` shade and
  white side stripes on the outer seam. Red socks from just below the knee, with a skin gap at the
  knee. White `h` boots with `i` shade, sole line and cleat dashes, rounded toe.
- **Light.** Key light from the front/upper-front: lit faces east and up, shade west and under.
  2-3 tones per material, hard cel edges, no dithering, no AA, no new colours. Far limbs one step
  darker. Outline `a` #180411, 1 px everywhere, 4-connected corners; `n` black only for the pupil.
  No orphan pixels, no outline gaps (`pal.py orphans`, `pal.py outline`).

### 1.1 Studio structure
- **One studio animation per row of §0.** The studio gives every animation Front/Side/Back with equal
  frame counts. Draw only the listed view and leave the other views blank, as Jump Front/Back are now.
  Animation names are unique: `Stand Run Approach Dribble Strike StrikeMacro Trivela Bicycle SoleLift
  Settle FrontTouch Break StepOver Elastico Nutmeg Land Point Carry Scan StrikeBack Celebrate`, plus
  `Flick` and `Volley` from the kick plan. The briefs' names map as follows: DribbleSide = `Dribble`
  Side; Strike Finish = `StrikeBack`.
- Studio fps (preview only): 12, except Run 14 (70 ms) and Dribble 13 (75 ms). **The game never plays
  studio ms.** Each shot schedules frames on its own clock `t` as listed in its brief and in §3. The
  ms below are the preview holds and the default for field use.
- **Layers in every frame** (bottom to top):
  - `Art`;
  - `Num`: the jersey numbers only, meaning the chest "10" (Front), the back "10" (Back) and the sleeve
    "10" plus the chest "0/D" sliver (Side). The `Art` layer underneath holds plain shirt;
  - `Ball`: a guide layer with a 12 px disc in `#00FF00` where the ball sits.

  The export strips `Ball` and fails if any `#00FF00` pixel survives. `Num` is what makes mirroring
  and re-skinning safe (§1.4).
- **Wave-0 retrofit:** move the numbers of Idle F/S/B, Jump, Flick and Volley onto a `Num` layer with a
  script that takes the `j` pixels inside the number boxes. Then check with `pal.py diff` that the
  composite is unchanged.
- The owner must **close "Sochetra" in the studio while frames are written over MCP**. Always
  `read_frame` before and after `set_pixels`.

### 1.2 Registration and anchors (one schema for all strips)
Per-frame JSON (the `hero_jump.json` format extended):

```
{ name, ms, pelvis:[x,y], contact:[x,y]|null, com:[x,y] (loader computes), ball?:[x,y], touch?:bool,
  boot?:[x,y], bootPart?:'instep'|'outside'|'inside'|'sole'|'toe'|'laces', head?:[x,y], tip?:[x,y],
  eye?:[x,y], num?:[x0,y0,x1,y1] (from the Num layer), spinMid?:rad, worldDown?:[dx,dy] (Bicycle) }
animation-level: { frameW:128, frameH:128, view:'side'|'front'|'back'|'face', facing:'east', ground:102,
  westStrip?: 'hero_bicycle_side_w.png' }
```

- **Ground frames:** the lowest pixel is on row 102 and `contact` is the planted toe pixel. A planted
  foot keeps **exactly the same pixels** until it lifts. Build the next frame as a copy (`add_frame`) and
  redraw only what moves.
- **Airborne frames:** `contact` is null, the frame sits on `pelvis`, and the bbox stays inside
  x/y 2..125. A spin pivots on `com`.
- **Side registration:** the idle boot spot, as in the jump and kick plans. **Front/Back
  registration:** the body centre at x 64 and soles on row 102, like Idle Front/Back.
- `ball` and `boot` are measured on the final art: the `Ball` layer centroid and the contact pixel.
  Shots place the ball from these and never draw it inside the frame.

### 1.3 Scales
- Integer nearest-neighbour ×1/×2/×3 (SoleLift ×3, so every pixel shows; dribble ghost wipe ×3-×6),
  or box-filtered caches at 0.4×/0.5× built in `prepare()` for wide shots.
- A sprite scale changes only on a cut or a beat-snap, never by gliding.

### 1.4 Mirroring (Crescent faces west; dribble and diptych reuse)
- Draw everything **facing east** (Side) or toward the camera (Front), lit from the facing side.
- When the game needs a mirrored frame, the export writes a pre-flipped **west strip**: flip `Art`,
  flip `Num`, then re-mirror `Num` inside its own `num` box so the digits read "10", not "01".
  `studioAnim` picks the west strip when `flip` is requested. Runtime `flip` without a west strip is
  allowed only for frames whose `Num` layer is empty.
- Mirrored uses: **Bicycle** (all of it), **Break** in Elastico F6/F7, and **Point** for No.7 Q1/Q2
  (re-skinned, with "7").

### 1.5 Rotation (Bicycle, and the existing tuck/volley spins)
- Bicycle frames are drawn in **body space**, the same frame as the puppet's local pose with spin 0, so
  the on-model checklist and the rig apply. The game rotates them by `spin + camera roll`.
- Each frame carries `spinMid` (the world spin at the middle of its hold) and `worldDown` (the world-down
  direction expressed in body space), both computed by a small script from the shot code. The artist
  draws hair, hem and shorts flutter toward `worldDown`, trailing against the rotation.
- `studioAnim` builds a **RotSprite cache in `prepare()`** (Scale2x ×3, rotate, sample) in 3° buckets,
  only for the angles each shot actually reaches. It samples them from the shot's spin and roll
  functions, so seek stays exact. Fallback: the current nearest-neighbour rotation of `heroJump`.

### 1.6 Pose sources (consistency between artists)
- **Side animations:** roughs come from the jump cut-out rig (`../jump/tools/rig.py`, `plan_src.py`
  pattern), with one `<anim>_src.py` per animation and the roughs approved before crafting. All side
  artists use the same rig parts and the same **kick base** pose module (`kickbase.py`: plant,
  backswing, downswing and contact skeletons). Strike, Trivela and No.7's R4/R5 start from it, so their
  hips, plant and leg lengths agree.
- **Front/back animations:** roughs are hand-blocked **two-value silhouettes** (dribble brief rule 1).
  A front/back rig is optional, built by the tools engineer in wave 0.
- **Heads and boots are stamped from the wave-0 reference sheets** (§3.1), never invented per frame.
  The face, the hair mop and the boot are where artists drift first.

---------------------------------------------------------------------------------------------

## 2. Dedup map: brief frame → library frame (publishers use this)

| Skill | Brief frame(s) | Library frame | Note |
|---|---|---|---|
| GALE | Strike F1 (optional) | dropped (Dribble F2 if ever needed) | |
| GALE | Strike F2, F3 (run-up) | **Run R1 0.00 · R2 0.07 · R3 0.14 · R4 0.21-0.30** | fixes the cadence: F2 at 0.00 → F3 at 0.15 skipped a whole step |
| GALE | Strike F4 bound | **Approach AP2** 0.30-0.55 (COM dips along its path) | shared with the pass |
| GALE | Strike F5a…F10 | Strike F5a, F5b, F6, F7, F8, **F8b (new)**, F9, F10 | F8 was held 0.45 s mid-air; now F8 0.70-0.92, F8b 0.92-1.15 |
| GALE | Finish B9, B11, B12 | StrikeBack B9, B11, B12 | |
| GALE | Finish B10a / B10b | **Stand Back a / b** | the shared breathing pair |
| pass | Trivela T1 last stride | **Approach AP1** (Run R4 with head away) | anchor `contact` right toe |
| pass | Trivela T2 bound | **Approach AP3** (AP2 with head away) | |
| pass | Trivela T3…T9 | Trivela T3…T9 (T8a/T8b) | |
| pass | Carry B1-B4; Scan S1-S3 | Carry B1-B4; Scan S1, S2a, S2b, S3 (all V of Carry) | |
| pass | Point P1-P3b | Point P1, P2, P3a, P3b | |
| pass | Glance G2, G3 | Glance G2, G3 | |
| pass | No.7 Run N1-N4 | No.7 Run **R1, R4, R5, R8** (4-frame subset of the 8 re-skinned) | the full 8 for shot 6 at ×2 |
| pass | No.7 Receive R1-R6 | No.7 Receive (R3 = V of Run R4; R4 = V of Strike F5a) | |
| pass | No.7 Point Q1, Q2 | **Point P2, P3a mirrored + re-skinned** | |
| dribble | DribbleSide F1-F8 | Dribble F1-F8 | |
| dribble | StepOver F1, Elastico F1, Nutmeg F1 | **FrontTouch FT1** (one drawing) | the same right-foot approach touch |
| dribble | StepOver F2-F7 | StepOver F2-F7 | |
| dribble | StepOver F8, F9, F10 | **Break BR1 0.85, BR2 1.00, BR3 1.15**, then BR2/BR3 on 8ths (1.30, 1.40, 1.50) | removes the 0.45 s held F10 |
| dribble | Elastico F2-F5 | Elastico F2-F5 | |
| dribble | Elastico F6/F7 (burst, loop) | **Break BR2/BR3 west strip** (mirrored) | |
| dribble | Nutmeg F2-F4 | Nutmeg F2-F4 | |
| dribble | Nutmeg F5, F6, F7 | **Break BR1, BR2, BR3** | |
| dribble | SoleLift F1-F11, F8b | SoleLift (same ids) | |
| dribble | Settle F1, F2, F3, F3b | Settle F1 (N), F2 (V of SoleLift F3), F3, F3b | |
| dribble | count-in pupil darts (code override) | **Glance G2L / G2** with the code afterimage | |
| Crescent | puppet `LIFT/LOAD/PUSH/bikeRise/bikeScissor/bikeCock` (shot 3) | Bicycle BK1-BK7 | table §3.4 |
| Crescent | `bikeCock → COIL` frozen hold (shot 4) | Bicycle BK7, BK7b, BK8, BK8b | |
| Crescent | `COIL4/WIND → bikeStrike → bikeFollow → FALL` (shot 5) | Bicycle BK8, BK8b, BK9, BK10, BK11, BK12, BK12b | |
| Crescent | shot 8: the static hand-drawn sprite squashed in code | **Land L1-L4 → Stand Front a/b** | |
| Zenith | `flickLoad/Hit/Follow`, `ohLoad/STRIKE/FOLLOW` puppets | Flick K1-K3, Volley V0-V3 | in progress; `../kick/PLAN.md` |

---------------------------------------------------------------------------------------------

## 3. The animations

Column key:
- **ms**: the studio preview hold.
- **anchors**: `c` contact, `p` pelvis, `b` ball, `t` touch, `bt` boot (with its part), `hd` head,
  `tip` fingertip, `eye`. `num` and `com` are added automatically.
- **used in**: shot numbers with the shot-local time.

### 3.1 Foundation (wave 0, lead artist; blocks everyone)

**Idle** (exists, F/S/B, 1 each): the master model. It gets only the `Num` layer split.

**Stand** (Front, Back; 2 frames per view):

| # | pose | ms | anchors | used in |
|---|---|---|---|---|
| a | copy of Idle (C) | 300 | c (both soles) | Crescent 8 hold; GALE 6 B10a (Back); base of Point P1 |
| b | breathe (V): chest and shoulders +1 px, hair mass settled 1 px, fists unchanged; Back: shoulder blades +1 px | 300 | c | alternates with a every 0.25-0.3 s on any hold: Crescent 8 (post-landing panting, Front), GALE 6 0.25-1.05 (Back) |

**Reference canvases** (drawn in a scratch studio project `Sochetra REF`, never exported). They are
stamped by every artist:
1. **Heads (Side):**
   - level; up 20°; up 40°; down 25°; down 45° (eyes on the ball);
   - eyes closed;
   - **head away** (turned to his left, away from camera: back of the mop and ear, no eye);
   - **3/4 to camera** with a 1 px smirk;
   - the same with a **wink**;
   - **chin tucked** (Bicycle).

   Each head comes with its hair mop at rest, streaming back, streaming down and streaming "up"
   (inverted).
2. **Heads (Front/Back):**
   - Front: level; tipped down; grin; eyes left/right; blink.
   - Back: level; chin dip; **turned left** (cheek, ear and eye edge showing).
3. **Boots:**
   - side: flat; toe-down 30°, 60° and pointed; heel-down with the toe up; sole flat on top of the
     ball; **outside-of-foot inverted** (sole tipping to camera); **inside-foot turned out** (toe toward
     camera, for No.7);
   - front: planted pair; lifted with the sole showing;
   - back: lifted sole with cleats.
4. **Model 3/4** (front, body turned to his right / screen-left, standing): the turnaround that Break,
   StepOver F8+, Nutmeg F5+ and Point P1 are drawn from.

### 3.2 Locomotion (Side)

**Run** (8 frames, 70 ms, a 0.56 s cycle; the sprint without close control; every frame ground-anchored,
with the flight between R4→R5 and R8→R1):

| # | pose | anchors |
|---|---|---|
| R1 | R-contact: right midfoot lands under the knee just ahead of the hips, left heel kicked up behind, left fist forward at chin height, right arm back, torso 10° | c R toe |
| R2 | R-down: pelvis −3 px, right knee 25° absorbing, left thigh swinging forward, both fists passing the hips | c |
| R3 | L-pass: left knee swinging past the standing leg, left heel tucked high under the seat, pelvis rising, arms crossing (most compact silhouette) | c |
| R4 | R-push: right toe-tip still on the turf, leg long behind, left thigh horizontal in front, right fist forward, pelvis +2 px (highest) | c R toe-tip |
| R5-R8 | the same four phases on the other leg (L-contact, L-down, R-pass, L-push) | c |

Used in:
- GALE 2 run-up (R1 0.00, R2 0.07, R3 0.14, R4 0.21-0.30);
- the pass: the base of AP1, plus the shots 2/5 cache of No.10 in the distance;
- **No.7 Run** (all 8 re-skinned; the {R1, R4, R5, R8} subset for the 0.4×/0.5× caches);
- the base for No.7 R3;
- the field-view caches of the three new scenarios (wave 2) and, later, all field play.

**Approach** (3 frames; the penultimate stride into any plant):

| # | pose | ms | anchors | used in |
|---|---|---|---|---|
| AP1 | V of Run R4, head turned to his left (head-away from REF: mop and ear, no eye), eyes nowhere near the ball | 90 | c R toe-tip, b (ball a foot ahead) | pass 3 T1 0.00 |
| AP2 | **bound** (N): long flight off the right foot, hips low (COM dipping), right leg extended behind with the toe just off, left knee leading forward and the heel reaching to plant, torso 0-5° back (braking), far arm forward-out, near arm back, head down, eyes on the ball | 90 (held 0.25 s along its path) | p, b | GALE 2 F4 0.30-0.55 |
| AP3 | V of AP2 with head away (as AP1) | 80 | p, b | pass 3 T2 0.09 |

**Dribble** (8 frames, 75 ms; close control; the dribble brief's text kept):

| # | pose | anchors |
|---|---|---|
| F1 | R-touch: right laces meet the ball mid-stride, left foot planted under the hips, torso 10°, left arm forward, right arm back | c L toe, t, b |
| F2 | R-down: right foot sets down just past the ball, pelvis −2, knees soft | c, b |
| F3 | pass: left leg swings through under the hips, most upright, arms crossing | c, b |
| F4 | R-up: right foot pushes off, pelvis +2 | c, b |
| F5 | L-touch: left instep nudges the ball forward | c R toe, t, b |
| F6-F8 | L-down (pelvis −2) · pass (right leg through) · L-up (pelvis +2) | c, b |

- Natural: head bob ≤ 2 px with the eyes up and forward; centre of gravity 3-4 px below Idle; feet
  never more than about 30 px apart; compact 90° arms; shoulders counter-rotating.
- Used in:
  - dribble 2 (whole cycle, shortening holds);
  - dribble 4 (F1 0.00, F2-F4 at the end);
  - dribble 7 (F1-F7);
  - the field carry of the three new scenarios (`'longshot'`, `'through'`, `'gauntlet'`) and the result caches.

### 3.3 Kicks (Side)

**Kick base** (`kickbase.py`, shared rig poses):
- the plant leg lands heel-first then flat, with the knee 20-30° soft;
- the pelvis is lowest at the plant;
- in the backswing the hip is extended and the knee folded;
- in the downswing the thigh leads and the shin lags (the whip);
- at contact the knee is over the ball and the head is still down;
- the arm opposite the kicking leg swings forward and wide, and the near arm goes back.

Strike, Trivela and No.7 Receive all start from it. The far-toe contact pixel is the same in every
plant → contact frame, so the plant foot never slides.

**Strike** (GALE HAMMER instep power shot, 8 frames; the right/near leg kicks):

| # | pose | ms | anchors | used in (GALE) |
|---|---|---|---|---|
| F5a | plant + backswing: left foot flat beside the ball pointing at goal, plant knee 25°, pelvis lowest, kicking heel up near the seat (knee ~120°), torso 5° back, near arm back-down, far arm flung wide forward-up, head down over the ball | 140 | c far toe, b, bt instep | 2: 0.55, 1.00, 1.50 |
| F5b | V of F5a: hair spikes and shirt hem drift 1-2 px toward the boot (the inhale), fingers 1 px | 140 | same pixels | 2: 0.75, 1.25 |
| F6 | downswing: hips open, knee leading over the back of the ball, shin trailing (knee ~100°), ankle locked toe-down, far arm starting across, chest coming over | 50 | c far toe, bt | 2: 1.58 |
| F7 | contact: knee over the ball, shin near vertical, laces through the ball's centre, plant leg straightening, chest over the ball, far arm forward across, near arm back, head still down, hair lagging back | 60 | c far toe, bt laces, b | 3: 0.66-0.70 |
| F8 | follow-through: kicking leg high along the flight line (thigh near horizontal), plant foot lifting off its toes into the hop, body rising, arms wide, head lifting, hair whipping forward | 100 | p | 3: 0.70-0.92 |
| F8b | **new**: still airborne, kicking leg lowering to land ahead, plant leg trailing lifted, arms wide, hair settling | 100 | p | 3: 0.92-1.15 |
| F9 | hop landing on the kicking foot ahead, knee 35° absorbing, plant leg trailing lifted, arms wide, hair bouncing down | 100 | c near toe | 3: 1.15-1.45 |
| F10 | settle: both feet down in a split stance, chest up, eyes on goal, arms lowering, hair settling 1 frame late | 160 | c | 3: 1.45-1.60 |

**StrikeMacro** (GALE shot 3 insert; the shin and boot fill the canvas at macro detail with sock
creases and laces; anchor `laces`):
- M1 arriving 50: ankle locked, toe down, motion lean.
- M2 laces on the ball 80: a flat instep where the ball's dented face goes.
- M3 through 60: the boot carries on, toe lifting, shin passing upright.

Optional **M4**: outside of the boot on the ball, toes in. It would serve the pass shot 1 bottom panel
instead of a ×4 crop of Trivela T6. Fallback for the whole macro: Strike F6/F7 cropped ×3.

**Trivela** (MERIDIAN THREAD outside-of-the-boot pass, 8 frames; T1/T2 = Approach AP1/AP3):

| # | pose | ms | anchors | used in (pass) |
|---|---|---|---|---|
| T3 | plant: left foot **wide** of the ball and a little behind (the ball guide sits nearer the camera than in F5a), knee soft, kicking leg still trailing from the bound, arms wide, near shoulder up 2 px (body leaning away from the ball), **head away** | 140 | c far toe, b | 3: 0.18-0.40 |
| T4 | wind-up: short backswing (right knee ~90°, heel at knee height, not the seat), hip opened back, ankle already turned in, left arm wide, right arm across the chest, head away | 80 | c, b | 3: 0.40 |
| T5 | swing: shin whipping through, ankle locked **toes down and in**, the sole tipping toward camera (white studs appear), knee leading, head away | 50 | c, b | 3: 0.55 |
| T6 | contact: outside of the right boot on the inside-back of the ball, the foot across and in front of the plant foot (overlapping it toward the camera), body over the ball, weight on the plant, head still away | 60 | c, bt outside, b | 1 (×4 crop), 3: 0.62-0.84 |
| T7 | follow-through: leg finishing forward and **out to his right** (toward the camera, shin over the plant leg, sole showing), standing heel lifting, head swinging round into profile, eyes half-closed | 120 | c far toes | 3: 0.84 |
| T8a | reveal: up on the left toes, kicking foot still out, head and shoulders turned 3/4 to the camera (REF head), eyes off the ball, 1 px smirk | 140 | c, eye | 3: 0.95 |
| T8b | V of T8a: near eye closed in a **wink**, hair drifted 1 px | 160 | c, eye | 3: 1.15 |
| T9 | recover: kicking foot lands across and forward, weight moving onto it, hair settling one frame late, head turning to follow the pass (screen-right) | 140 | c R toe | 3: 1.30-1.70; 5 (0.5× cache) |

- The ankle turns **in**, never out. A reviewer must never read it as an inside-foot pass or a toe-poke.
- Every frame T3→T7 keeps the left toe's pixel.

**Flick K1-K3, Volley V0-V3** (Zenith): see `../kick/PLAN.md`; the finals are in `../kick/final`.
Write them to the studio as `Flick` and `Volley` (Side) with the `Num` layer.

### 3.4 Airborne (Side)

**Jump** F1-F10: exists (Zenith shots 3-5).

**Bicycle** (CRIMSON CRESCENT, 15 frames):
- Drawn facing east and **played from the west strip** (§1.4).
- The **near leg is the plant and kicking leg** (as the puppet's `thighN`); the far leg is the lead leg
  that swings up first.
- Drawn in body space (§1.5). Each row lists the puppet pose it replaces and its shot time.

| # | pose (body space) | ms | anchors | replaces · shot time |
|---|---|---|---|---|
| BK1 | gather: standing on the far leg, near (plant) knee lifted high in front, torso 4° back, head tipped back 30° with eyes UP on the cross, near arm forward-low, far arm back | 100 | c far toe | `STAND0→LIFT` · s3 0.00-0.27 |
| BK2 | load (the stamp): near foot flat, deep crouch on it (knee ~80°), torso leaning **back** 24°, far heel kicked up behind, both arms swung back behind the hips, head back 40°, hair compressed | 140 | c near foot | `LOAD` · s3 0.27-0.44 (held through the hit-stop) |
| BK3 | spring: near leg snapping straight onto the toes, far knee punching up, near arm swinging forward-up, far arm back, torso 30° back | 60 | c near toe-tip | `PUSH` · s3 0.44-0.54 |
| BK4 | rise: airborne, lead (far) leg swinging up nearly straight, near knee bent and hanging, near arm forward-up, far arm back-down, head back, eyes on the ball above | 80 | p | `bikeRise` · s3 0.54-0.72 |
| BK5 | swing: lead leg past horizontal, reaching over, near knee starting to rise, arms opening, spine arching | 90 | p | (breakdown) · s3 0.72-0.92 |
| BK6 | scissor: lead leg high overhead and straight, kicking leg bent down-forward, arms spread opposite (near forward, far back), legs an open scissor | 110 | p | `bikeScissor` · s3 0.92-1.18 |
| BK7 | cock: lead leg still up, kicking knee folded tight beneath (cocked), both arms flung back overhead toward the ground, chin toward chest, eyes on the ball | 120 | p | `bikeCock` · s3 1.18-1.40, s4 0.00-0.30 |
| BK7b | V: weightless drift in frozen time (hair, hem and fingers 1-2 px toward `worldDown`) | 120 | p | s4 0.30-0.60 |
| BK8 | coil: kicking leg wound tighter (heel at the seat), lead leg higher, arms further back: the loaded spring | 150 | p | `COIL` · s4 0.60-0.90, 1.20-1.50, 1.75-1.90; s5 0.00-0.08 |
| BK8b | V: 3-5° deeper wind plus hair/hem drift (a trembling spring); doubles as shot 5's WIND | 150 | p | s4 0.90-1.20, 1.50-1.75; s5 `WIND` 0.08-0.30 |
| BK9 | whip (smear): kicking leg whipping up and over, the boot as a 2-3 position smear in palette, lead leg dropping (the legs crossing), hips starting to pike, arms flaring | 40 | p | s5 0.30-0.45 |
| BK10 | **strike**: inverted, kicking leg fully extended overhead, **instep on the ball**, toe pointed, one clean line hips → toe, lead leg dropped down-forward, arms flung back and wide toward the ground, chin tucked, eyes on the ball | 80 | p, bt instep, b | `bikeStrike` · s5 0.45-0.66 (hit-stop and impact frames) |
| BK11 | follow: kicking leg carried past overhead, body still turning, lead knee bent, arms reaching back toward the ground, eyes closing | 100 | p | `bikeFollow` · s5 0.66-0.85 |
| BK12 | fall: tumbling over the top, knees folding, arms reaching for the landing, head tucked, hair flung | 150 | p | `FALL` · s5 0.85-1.25 |
| BK12b | V: legs further folded, arms nearer the catch, hair trailing against the rotation | 150 | p | s5 1.25-1.70 |

- Shot 3's ghost silhouettes and every silhouette, aura or rim pass come from these frames through the
  `studioAnim` caches. **No `renderPuppet(HERO_KIT, …)` remains** in Crescent shots 3-5.
- Silhouette rule (as for the volley): the mop lobe, the round head, the boxy jersey, the baggy shorts
  and the chunky boots must read in the shot 4 white silhouette and the shot 5 dark gap pass. Keep
  negative space between the legs and between the arms and the torso.

### 3.5 Ball skills (Side, the dribble)

**SoleLift** (12 frames; the dribble brief's poses kept; drawn for **×3**, so the sole line and white
studs must be clean):

| # | pose | ms | anchors | used in (dribble 4) |
|---|---|---|---|---|
| F1 | approach: right foot lifting toward the ball 12 px ahead | 70 | c L toe, b | 0.20 |
| F2 | sole over: right knee up, toes up, sole hovering, arms opening | 70 | c, b | 0.30 |
| F3 | **SOLE ON**: sole flat on top of the ball, knee 30°, 60 % of the weight on the left, arms wide | 60 | c, t, bt sole, b | 0.40 |
| F4 | DRAG: sole rolls the ball back half a ball, heel low, knee straightening, torso upright | 70 | c, t, b | 0.50 |
| F5 | SCOOP: toe dips behind and under the ball, ankle extended, hips −2 | 60 | c, t, b | 0.60 (ghost) |
| F6 | FLICK: ankle flicks up, knee rising, ball leaving the laces, left heel lifting | 50 | c, t, b | 0.70 (ghost) |
| F7 | HOP: push-off from the left like a hurdler, both knees lifting, arms out | 60 | p | 0.80 (ghost) |
| F8 | AIR: right knee high in front, left foot tucked under, eyes up on the ball | 100 | p | 0.90 |
| F8b | V: hair and hem 1-2 px, arms 1 px wider | 100 | p | 1.25 (the money-frame hold) |
| F9 | DESCEND: left leg reaching for the turf, right knee still up | 70 | p | 1.58 |
| F10 | LAND on the left, knee absorbing, right instep raised and soft | 70 | c L toe | 1.72 |
| F11 | CUSHION: ball onto the instep, ankle gives 2 px | 90 | c, t, bt instep, b | 1.80 |

**Settle** (4 frames):

| # | pose | ms | anchors | used in |
|---|---|---|---|---|
| F1 | brake (N): right heel plant, torso back 6°, arms forward for balance, ball rolling just ahead | 80 | c R heel, b | dribble 7 0.60 |
| F2 | sole stop (V of SoleLift F3): arms lowered to relaxed, knee 20° | 90 | c, t, bt sole, b | 7: 0.80 |
| F3 | chin up (V of F2): head lifted, chest open, eyes on the keeper (screen-right) | 200 | c, b | 7: 1.20, 1.50; dribble result (0.5× cache) |
| F3b | V of F3: chest and shoulders +1 px | 200 | c, b | 7: 1.40, 1.60 (held through the freeze) |

### 3.6 Front view (toward the camera)

**FrontTouch** (1 frame):
- **FT1**, approach touch, 80 ms, anchors c L toe, t, b. The right foot has just pushed the ball
  forward, the left foot is planted, the eyes are up and forward and the arms counter-swing.
- Used in: dribble 3 F1 0.00, 5 F1 0.00, 6 F1 0.00. The ball offset (6/front/10 px) is set by each
  shot, not drawn.

**StepOver** (6 frames; the left leg circles, the outside of the right foot cuts to his right):

| # | pose | ms | anchors | dribble 3 |
|---|---|---|---|---|
| F2 | plant: right foot beside the ball on its screen-left side, heel lifting (pivot), left knee lifting, hips opening | 70 | c R toe, b | 0.14 (ghost) |
| F3 | circle: left foot passing over the ball inside → outside, toes pointed, arms out; the shoulder dip starts one frame ahead of the leg | 70 | c R toe, b | 0.27 (ghost) |
| F4 | **THE SELL**: left foot lands wide screen-right, knee flexed, shoulders and head dropped to his left, right arm high, left arm low, hips 6 px screen-right, eyes on A | 140 | c L toe, b | 0.40-0.60 (ghost) |
| F5 | load: full weight on the left, pelvis −4 (lowest), torso tilted 18° | 90 | c L toe, b | 0.60 |
| F6 | push: the left leg pushes him back across, right foot reaching the outside of the ball | 60 | c, b | 0.70 |
| F7 | cut: outside of the right boot snaps the ball screen-left | 60 | c, t, bt outside, b | 0.80 |

**Elastico** (4 frames; the right foot pushes out to his right with the outside, then snaps back to
his left with the inside):

| # | pose | ms | anchors | dribble 5 |
|---|---|---|---|---|
| F2 | outside push: ball one ball-width screen-left, the whole body leaning with it, left arm out screen-right | 70 | c L toe, t, bt outside, b | 0.20 (ghost) |
| F3 | wrap: foot riding round the outside of the ball, ankle rolled, knee turned in | 50 | c, b | 0.30 |
| F4 | SNAP smear: the boot as a 3-position palette smear whipping round the front of the ball | 33 | c, b | 0.367 (2 game frames) |
| F5 | drag inside: inside of the right boot carries the ball screen-right, body whipping back, left foot hopping to follow | 60 | c, t, bt inside, b | 0.40-0.55 |

**Nutmeg** (3 frames):

| # | pose | ms | anchors | dribble 6 |
|---|---|---|---|---|
| F2 | shape: shoulders dip screen-right as if going round that side, right foot drawing back | 80 | c L toe, b | 0.20 |
| F3 | set: left foot plants beside the ball, right foot cocked behind, toe aimed at the gap | 60 | c L toe, b | 0.30 |
| F4 | POKE: right toe pokes the ball straight at the lens; a tiny motion, no wind-up | 60 | c, t, bt toe, b | 0.40-0.55 |

**Break** (3 frames + 1 optional; 3/4 front, accelerating away to **his right / screen-left**; drawn
from REF Model 3/4):

| # | pose | ms | anchors | used in |
|---|---|---|---|---|
| BR1 | first crossover: turning 3/4 toward screen-left, 25° lean into the turn, left leg crossing over in front, outside (left) arm swinging high, eyes following the play | 70 | c R toe, b | dribble 3 F8 0.85; 6 F5 0.55 |
| BR2 | sprint stride: 3/4 toward screen-left and the lens, right foot down, arms pumping | 70 | c, b | 3 F9 1.00, 1.30, 1.50; 6 F6 0.70, 1.00; **5 F6 (west strip)** 0.55, wipe |
| BR3 | sprint stride b: left foot down (loops with BR2) | 70 | c, b | 3 F10 1.15, 1.40; 6 F7 0.85, 1.10; **5 F7 (west strip)** 0.70, wipe |
| (BR4) | optional: opening to nearly side-on facing screen-left | 80 | c | dribble 3 1.15 instead of BR3 |

- The `ball` sits at the leading foot. Nutmeg ignores it, because the ball is gone through D's legs.
- In Elastico's mirrored use the ball rides the mirrored foot. That is accepted for a 0.4 s burst at
  ×3-×6 ghost scale.

**Land** (CRIMSON CRESCENT shot 8, 4 frames; back to goal, facing the camera; he never turns round):

| # | pose | ms | anchors | shot 8 |
|---|---|---|---|---|
| L1 | drop: falling into frame feet-first, legs together and slightly bent, toes pointing down, arms raised up and out, shirt hem lifted, hair streaming UP, eyes down on the landing | 120 | p | 0.00-0.26 |
| L2 | impact: feet wider than the shoulders, knees just bent ~30°, arms whipping down-out, hair still up (lag) | 60 | c both soles | 0.26-0.33 (with the land hit-stop) |
| L3 | absorb: deepest squash (knees ~90° flared, pelvis −14 px), torso forward, fists down by the knees, head down, hair slamming down over the brow | 100 | c | 0.33-0.47 |
| L4 | rebound: rising, knees ~25°, chest lifting, arms opening slightly back, head level, hair overshooting up 1-2 px | 80 | c | 0.47-0.62 |
| → | **Stand Front a/b** alternating every 0.3 s (panting): the fists-down hero stance | 300 | c | 0.62-3.20 (the crimson back-light and rim come from the silhouette caches) |

**Point** (MERIDIAN THREAD diptych; drawn full-body, cropped chest-up by the shot):

| # | pose | ms | anchors | pass 6 |
|---|---|---|---|---|
| P1 | turning to the camera from the 3/4 model, weight shifting onto his left leg (hip pops screen-right), arms low | 100 | c | 1.40 |
| P2 | right arm rising, elbow leading, fingers closed | 100 | c | 1.50 |
| P3a | two-finger point forward-right with a grin, hair settling | 240 | c, tip | 1.60 |
| P3b | V of P3a: blink | 240 | c, tip | 1.95 |

### 3.7 Back view (from behind; the goal is far up-screen)

**Carry** (4 frames, 83 ms, `c` on every frame; the ball at the right toe on B1):
- B1 right foot down, ball at the right toe.
- B2 passing, hair lifts.
- B3 left foot down, right arm forward.
- B4 passing, the boot sole flashes white with cleats.

Used in pass 2, 0.00-0.35, looping at 12 fps.

**Scan** (4 V of Carry; the read in slow motion):

| # | pose | ms | anchors | pass 2 |
|---|---|---|---|---|
| S1 | V of B1: chin dip, head down 2-3 px, mop tipping forward | 150 | c, hd | 0.35 |
| S2a | V of B2: head turned to his left (screen-left), cheek, ear and eye edge showing (REF back head) | 250 | c, hd | 0.50, 1.00 |
| S2b | V of S2a: hair drifted 1 px, shoulders +1 px (breath) | 250 | c, hd | 0.75 |
| S3 | V of B4: the tell, head still left, right leg trailing with the toe turned in (outside of the boot showing), left arm out | 160 | c, hd | 1.25 |

**StrikeBack** (GALE HAMMER finish):

| # | pose | ms | anchors | GALE 6 |
|---|---|---|---|---|
| B9 | hop landing: right foot down at screen-right, knee bent, left leg trailing toward camera and lifted (sole showing), arms wide | 100 | c R toe | 0.00-0.25 |
| (B10a/b) | = **Stand Back a/b** | 200 | c | 0.25-1.05, after 1.70 |
| B11 | palm raise: right forearm up and forward, palm flat at mouth height aimed at the goal, head tipped toward it, left arm relaxed | 160 | c | 1.05, 1.60-1.70 |
| B12 | V of B11: head 1 px forward, shoulders lifted, hair spikes flicked back 1-2 px | 120 | c | 1.30 |

### 3.8 Face crops

**Glance** (its own small studio project, `Sochetra Face`): the 48×26 crop of `hero_no10.png` at
(26, 8), on the crop's exact pixel grid so the frames swap without a jump. Always integer ×2-×5.

| # | variant | used in |
|---|---|---|
| G1 | the existing face | Zenith, Crescent and GALE cut-ins |
| G2 | pupils to his left (screen-right), brows level | pass 1 0.30, pass 2 inset, pass 3 freeze inset; dribble 1 0.30; dribble 7 bookend (eyes on the keeper) |
| G2L | pupils to his right (screen-left) | dribble 1 0.20 (the first dart) |
| G3 | G2 + 1 px smirk | pass 2 inset |
| G4 | pupils down-right on the ball, brows 1 px lower | GALE 2 dew mirror (at ×2, inside the drop) |

### 3.9 Results and field (wave 2 for the three new specials)

**Celebrate** (Side):
- C1 (N): right fist pumped high, chest out, shouting, knees soft.
- C2 (V): arm higher, hair bounce.

Each is 200 ms with `c`. It is used through a 0.5× cache in the result view of GALE HAMMER and
MERIDIAN THREAD (SPOTLIGHT SOLO's result uses Settle F3), and later of Zenith and Crescent (Crescent
plays the west strip, back to goal). This removes the last `POSES.celebrate` puppet No.10. No.7's
re-skin (2 R) serves the pass's result view.

**Field caches (no new drawings).** In the three new scenarios (`'longshot'`, `'through'`,
`'gauntlet'`) the field view draws No.10 from Dribble (and Run) box-filtered caches at the field
scale, built in `prepare()`, so No.10 is never a puppet anywhere in those specials. The two shipped
scenarios (`'dribble'`, `'cross'`) can switch the same way later.

---------------------------------------------------------------------------------------------

## 4. No.7 (new project "No.7", 128×128)

The palette is Sochetra's plus exactly the five `WINGER_KIT` colours:
- skin `#d69668 #b06e4a #74422c`;
- hair `#463428 #281c16`.

He has the **same body** as No.10, short dark hair and a yellow "7".

**Re-skin pipeline** (`reskin7.py`):
1. Take the Sochetra final.
2. Remap skin `b → #d69668`, `g → #b06e4a`, and `k` inside the skin mask `→ #74422c`.
3. Swap the `Num` layer for the "7" glyph (mirrored safely like the "10").
4. Stamp the No.7 head from his head sheet: short dark hair, no mop. It sits **inside the No.10
   silhouette footprint minus the mop**, so the neck and collar joins stay.
5. Touch up the joins and run `pal.py check` against the No.7 palette.

| Animation | Frames | Type | Poses | Used in (pass) |
|---|---|---|---|---|
| Idle (Side, Front) | 2 | R + head | the model sheet | reference, result view |
| Heads (ref) | 1 canvas | N | side level/down/up, front grin, 3/4, eyes closed | stamping |
| Run (Side) | 8 | R of Run R1-R8 | the same sprint, darker skin | shots 2, 5 (0.4×/0.5× caches, subset R1/R4/R5/R8), 6 (×2, all 8) |
| **Receive** (Side) | 6 | 4 N + 2 V | see below | shot 6 |
| Point (Front) | 2 | R of mirrored Point | Q1 = P2 mirrored ("turning in"), Q2 = P3a mirrored (points back across with a grin) | shot 6 diptych |
| Celebrate (Side) | 2 | R of Celebrate C1/C2 | fist pump, arm higher | result view (0.5× cache) |

**Receive** (drawn on the shared body with the kick base, then re-skinned):

| # | pose | ms | anchors | shot 6 |
|---|---|---|---|---|
| R1 | reach (N): mid-stride, right foot opening to the ball (toe turning out), eyes down on it, arms out; the pelvis keeps travelling | 90 | c L toe, b | 0.25 |
| R2 | touch (N): inside of the right foot meets the ball and pushes it a stride ahead, body still travelling forward (in stride, never a stop) | 60 | c L toe, t, bt inside, b | 0.35 (hit-stop) |
| R3 | push-off (V of Run R4 re-skin): off the right foot, chest up, eyes flick to goal | 80 | c R toe | 0.47 |
| R4 | plant (V of Strike F5a re-skin): left foot beside the ball, backswing shortened (knee ~90°), left arm out | 100 | c far toe, b | 0.62 |
| R5 | strike (N): side-foot, hips open, right foot turned out so the inside faces the ball (boot seen nearly end-on from REF "inside-foot turned out"), ankle locked, knee over the ball | 60 | c far toe, bt inside, b | 0.80 |
| R6 | follow-through (N): the leg swings through toward the far post (away from camera), landing on the right foot, arms balancing | 140 | c R toe | 0.88 |

In R1 → R3 the pelvis moves forward on every frame (+x), so a reviewer sees a receive in stride.

---------------------------------------------------------------------------------------------

## 5. Opponents and keeper: which moments get studio frames

Rule: defenders and the keeper stay **puppets** (the briefs' poses, ≤ 3-4 renders per frame, caches in
`prepare()`). The exceptions are the moments where a puppet shares a large, slowed-down frame with the
drawn No.10/No.7. There the puppet's chibi capsule style would be the odd one out, which is the user's
original complaint. These sets are **phase 3**. They are drawn on the **same shared body**, re-skinned
like No.7 with a material mask and a head per kit.

| Priority | Studio set (project) | Frames | Why / where | Replaces puppet |
|---|---|---|---|---|
| 1 | **Rival Slide** (Side), project `Rival` | 3 N + 1 V: S1 launch (plant, dropping), S2 slide (studs first, extended), S2b slide hold (V, for the slow window), S3 slide out / spin | **dribble 4 money frame** (B at ×3 under No.10 at ×3, 8 px clearance, in colour in the pool). The slide tackle is SPOTLIGHT SOLO's beat only: GALE's defender 1 now jump-blocks and the pass's D1 poke-tackles (both puppets) | `slideTackle`, `slideSpin` |
| 2 | **Rival Lunge** (Side; the west strip gives `lungeL`/`lungeR`) | 3 N: J1 jockey, J2 full-stretch lunge commit, J3 overstretch / stumble | dribble 3 (A at ×2.4 lunging beside No.10's exposure) and 5 (C); pass 4 scissors (D2/D3 at ×2.6 in panel 2) and the heel (panel 3); `stretchBlock` = J2 | `jockey`, `lungeCommit`, `lungeL/R`, `stretchBlock`, `stumble` |
| 3 | **Keeper Dive** (Side), project `Keeper` | 4 N: K1 set, K2 push, K3 full stretch (fingertips), K4 crash/land | Crescent 7 (the keeper is the star at ×2 in extreme slow motion); pass 6 (beside the studio No.7); GALE 5 (the low dive = K3 rotated, with `gkSwept` staying a puppet) | `gkReady`, `gkDive` (keep the puppet for Zenith 7's catch, grind and skid) |
| 4 (opt) | Rival Back silhouette (Back) | 2 N: wide block, look-through | dribble 6 D (legs spread in the picture plane, which the rig cannot do). The brief's own fallback is code silhouettes | `wideBlock`, `lookThrough` |

These stay puppets:
- `jumpBlock`, `blown`, `flinch` (GALE: fast and spinning);
- `pokeTackle`, `sprawl`, `sitWrongWay`, `lookFar` (the pass: inked, 0.5× caches);
- `kneelStumble`, `splitFreeze`, `sideTopple`, `sitBack`, `faceDown` (dribble: brief and comic);
- the run cycles `run1-4` (pre-rendered);
- `gkSpread`, `gkSwept`, `gkCatch/Strain/Blown`;
- all field play;
- No.7's field `crossKick` in Crescent's intro.

Kit palettes for the re-skins:
- `RIVAL_KIT` white `#ffffff/#d6deec/#828caa`, teal trim `#28beaa`, grey shorts, light skin, blond hair.
  Variants B/C/D are hair and skin swaps.
- `KEEPER_KIT` lime, grey and gloves.

Each is its own studio project and palette.

---------------------------------------------------------------------------------------------

## 6. Natural motion (reviewers check onions and gifs side by side with Idle, Jump and the owner's kick sheet)

**For every animation**
1. **Keys, then breakdowns, then in-betweens.** Approve two-value silhouettes and rig roughs before any
   detail. The keys to draw first:

   | Animation | Keys |
   |---|---|
   | Run | R1, R3 |
   | Strike | F5a, F7 |
   | Trivela | T3, T6, T8a |
   | Bicycle | BK2, BK6, BK10 |
   | StepOver | F4 |
   | Elastico | F5 |
   | SoleLift | F3, F8 |
   | Land | L3 |
   | Receive | R2, R5 |
   | Scan | S2a |

2. **Weight.**
   - In every ground frame the centre of mass sits over the support foot or between the feet.
   - The pelvis moves 2-4 px on down and up frames, and the hips shift 4-6 px toward the loaded leg in
     every feint.
   - Landings absorb over two frames (contact, then deepest).
   - Take-offs are preceded by a crouch.
3. **Timing.**
   - Anticipation is long, the action short (smears ≤ 50 ms, 1-2 game frames), and the follow-through
     medium.
   - Contact frames land exactly on their hit (sound or drum).
   - **Any hold of more than 0.3 s on screen has a drawn variant** (F5b, S2b, T8b, F8b, P3b, BK7b,
     BK8b, BK12b, Stand b, Settle F3b).
   - An airborne drawing is never held more than 0.25 s at rate 1 (hence Strike F8b).
4. **Overlap.** The eyes lead the head by a frame, the head leads the shoulders, and the hair, shirt hem
   and shorts follow a frame later.
   - The hair is **one mop mass** that squashes, streams and settles. It is never a star.
   - Its direction opposes the acceleration. In Bicycle it falls toward `worldDown`; in shot 4's frozen
     time it floats.
5. **Counterbalance.** The arms oppose the legs and the shoulders counter-rotate against the hips; the
   arms never mirror each other. In every kick the arm opposite the kicking leg swings forward or wide
   at contact.
6. **Arcs.** Toes, knees, fists and the head follow arcs. Check with stacked onions (`preview.py onion`)
   per animation and across every seam in §7.4.
7. **Volumes.** Limb lengths are constant (arm 12+12, leg 15+13, boot 17-18, fist 9×8). Squash and
   stretch come from the pose (knee bend, spine curl), with at most 1-2 px of torso stretch on extremes.
   Never scale the drawing.
8. **Eyes.** Each frame's look direction is in its row (ball, defender, keeper, away, camera, closed).
   In the dribble the eyes stay up, never on the ball, except the contact read in SoleLift F8.
9. **Readability.**
   - Front views keep blue shorts, red socks and white boots separated, with 1 px outline breaks where
     limbs overlap.
   - Every ghost pose (StepOver F2-F4, SoleLift F5-F7, Elastico F2, Dribble trail frames, Bicycle in
     shot 3) reads as one silhouette.
   - Back-lit uses (volley, Bicycle, Land) read from the contour alone.

**Per family**
- **Run and Dribble.**
  - The contact foot lands under the knee, not out in front (no overstriding).
  - In Run the heel tucks high on the pass frames; in Dribble the steps are short and the knees soft.
  - The head bob is ≤ 2 px.
  - The world scroll in every shot equals the contact-to-contact stride, so the feet never slide.
- **Instep kick** (Strike, and R4 for No.7).
  - At the plant the knee is soft, the hips are lowest and the plant toe points at the target.
  - The thigh leads the shin (the whip).
  - The ankle is locked toe-down from F6 to F7, the knee is over the ball and the head is still down.
  - The energy carries into a hop. The hair lags back at contact and whips forward on F8.
- **Trivela.**
  - The backswing is shorter (a knee flick), the plant wider, and the ankle inverted with the sole
    showing to camera.
  - The disguise lives in the head and shoulders: they stay away until T7, turn 3/4 in T8a and wink in
    T8b.
- **Bicycle.**
  - The lead leg swings first and the take-off is from the kicking leg. The spine arches on the rise
    and piques at contact (a jackknife).
  - The legs scissor through each other between BK8b and BK10, with the chin tucked from BK7.
  - The arms reach back toward the ground for the fall.
- **Front footwork.**
  - The shoulder dip leads the leg by one frame. The ball stays dead still under the step-over.
  - In the elastico the hips stay square: it reads in the ankle and the lean. The poke has no wind-up.
  - The break leans 20-25° into the turn with the outside arm high.
- **Back views.**
  - The boot soles flash on lifts and the mop bounces on contacts.
  - In a head turn the skull rotates and the mop rotates with it as one mass. The cheek and eye edge
    appear; the face never pops round flat.
- **Landing (Land, F9, SoleLift F10).** Touchdown, then deepest, then rebound, then settle. The hair
  and hem overshoot on the rebound by 1-2 px.

---------------------------------------------------------------------------------------------

## 7. Production order and parallel batches

### 7.1 Wave 0: model lock (the lead artist and the tools engineer; blocks everyone, small)
- **Lead:**
  - the `Num` layer retrofit of Idle, Jump, Flick and Volley;
  - Stand Front b and Stand Back b;
  - REF Heads (Side, Front/Back), REF Boots and REF Model 3/4;
  - write Flick and Volley (in progress) to the studio.
- **Tools engineer:**
  - `motionlib` tools: the jump tools plus `kickbase.py`;
  - the `Ball` guide extraction and the `Num` box;
  - `export_anim.py` (strip + JSON, west strip with digit fix, a fail on `#00FF00`);
  - `reskin.py` (No.7, Rival, Keeper);
  - the `src/art/studioAnim.ts` loader (GALE's planned generalisation of `heroJump.ts`, plus the west
    strip and the RotSprite cache);
  - optionally front/back cut-out rigs.
- **Calibration gate:** each artist's **first final** is reviewed at 1× and 4× beside Idle, Jump F6,
  K2 and V2 before they continue.

### 7.2 Batches

Each batch owns whole animations. Never split an animation between artists.

| Batch | Artist profile | Animations (frames) | Effort | Depends on |
|---|---|---|---|---|
| **A** Locomotion | side | Run 8 → Approach AP2, then AP1/AP3 → Dribble 8 | 17.6 | W0 heads (head-away for AP1/AP3) |
| **B** Instep strike | side | Strike F5a, F7 keys → F6, F8, F8b, F9, F10 → F5b | 7.3 | W0, `kickbase.py` |
| **C** Bicycle | side (rotation-savvy) | Bicycle keys BK2, BK6, BK10 → rest → variants | 12.9 | W0, `spinMid`/`worldDown` table |
| **D** Front footwork | front | FrontTouch, Break (shared, first) → StepOver → Elastico → Nutmeg | 17.0 | W0 Model 3/4 |
| **E** Back views | back | Carry 4 → Scan 4 V → StrikeBack B9, B11, B12 | 7.5 | W0 back heads, Stand Back |
| **F** Trivela | side | T3, T6, T8a keys → T4, T5, T7, T9 → T8b | 7.3 | W0 heads (away, 3/4, wink), `kickbase.py` |
| **G** Sole skills | side (×3 cleanliness) | SoleLift 12 → Settle 4 | 13.2 | Dribble F1 and F2-F4 finals for the seams (A) |
| **H** Front misc | front | Land 4 → Point 4 → Glance 4 crops | 8.5 | Stand Front (W0), Model 3/4 |
| **I** Macro | macro specialist | StrikeMacro 3 (+M4) | 3.0 | Strike F6/F7 roughs (B) |
| **J** No.7 | side + front | heads → Idle 2 R → Run 8 R → Receive R1, R2, R5, R6 N + R3, R4 V → Point 2 R | ≈ 9.6 | Run (A), Strike F5a (B), Point (H) finals |
| **K** Rival/Keeper | side | Slide 4 → Lunge 3 → Keeper Dive 4 (→ Rival Back 2) | ≈ 13 | `reskin.py`, Rival/Keeper heads |
| **L** Results | side | Celebrate 2 + field caches | 1.3 | A |

### 7.3 Waves (staffing by priority)

**Wave 1** (up to 6 side and front artists in parallel; listed in priority order, so with fewer artists
take them top-down):
- **C Bicycle.** CRIMSON CRESCENT is shipped and still shows the puppet No.10 the user complained about.
- **A Locomotion.** The shared trunk; it unblocks GALE, the pass and No.7.
- **B Strike.**
- **F Trivela.**
- **G Sole skills.**
- **D Front footwork.**

**Wave 2:**
- **H**: Land (Crescent shot 8) first, then Point and Glance.
- **E** Back views. Pass shot 2 has a Trivela fallback.
- **I** Macro. It has a crop fallback.

**Wave 3:** **J No.7.** His Receive comes first: the brief puts his receiving and finishing first
after No.10.

**Wave 2 (cont.):** **L** Results (Celebrate C1/C2 and No.7's re-skin): no new special may ship
with a puppet No.10 in its result view.

**Wave 4:** **K** Rival/Keeper (Rival Slide first: SPOTLIGHT SOLO's money frame).

Single-artist order: W0 → C → A → B → F → G → D → H (Land) → J (Receive and Run) → E → H (Point,
Glance) → L → I → K.

### 7.4 Rules that keep parallel batches consistent
1. **One owner per shared frame.** Consumers reference IDs (§2) and never redraw a shared frame. The
   shared frames are Run, Approach, Dribble, FrontTouch, Break, Stand and Carry. Changes go back
   through the owner.
2. **Variants are made from approved finals only**, never from roughs, by the base owner or once the
   base is locked.
3. **Heads, boots and the 3/4 model are stamped from REF** and then re-angled. The face construction
   (eye block, brow, nose bump, ear and white stud) is identical everywhere.
4. **Seam reviews** (onion plus gif across batch borders) before a batch is called done:

   | Seam | Batches |
   |---|---|
   | Run R4 → Approach AP2 → Strike F5a | A ↔ B |
   | AP1 → AP3 → Trivela T3 | A ↔ F |
   | Dribble F1 → SoleLift F1 · SoleLift F11 → Dribble F2 · Dribble F7 → Settle F1 | A ↔ G |
   | FrontTouch → StepOver F2 / Elastico F2 / Nutmeg F2 · StepOver F7 → BR1 | D |
   | Carry B4 → Scan S3 · Stand Back → B9 / B11 | E |
   | Bicycle BK12b → Land L1 (a cut, so only the costume and lighting must match) | C ↔ H |
   | Run R4 → No.7 R1 · Strike F5a → No.7 R4 | J ↔ A, B |

5. **Weekly library sheet.** All finals at 1×, grouped by view. Check for drift in:
   - hair mass area (±10 % of idle);
   - outline weight;
   - the number of tones per material;
   - boot size;
   - colour counts per material (±15 % of the idle ratio).
6. **Same tools, same checks:**
   - `pal.py check` and `orphans`/`outline`;
   - the ground row and contact pixel;
   - pelvis within 1 px of the plan;
   - silhouette tests (`kick_preview.py moon` style) for every back-lit or ghost use.

---------------------------------------------------------------------------------------------

## 8. Totals

| | N (new) | V (variant) | R (re-skin) | C (copy) | frames |
|---|---|---|---|---|---|
| No.10, wave 0 (Stand) | 0 | 2 | 0 | 2 | 4 |
| No.10, batch A (Run, Approach, Dribble) | 17 | 2 | 0 | 0 | 19 |
| No.10, batch B (Strike) | 7 | 1 | 0 | 0 | 8 |
| No.10, batch C (Bicycle) | 12 | 3 | 0 | 0 | 15 |
| No.10, batch D (FrontTouch, Break, StepOver, Elastico, Nutmeg) | 17 | 0 | 0 | 0 | 17 (+1 opt BR4) |
| No.10, batch E (Carry, Scan, StrikeBack) | 6 | 5 | 0 | 0 | 11 |
| No.10, batch F (Trivela) | 7 | 1 | 0 | 0 | 8 |
| No.10, batch G (SoleLift, Settle) | 12 | 4 | 0 | 0 | 16 |
| No.10, batch H (Land, Point, Glance) | 7 | 5 | 0 | 0 | 12 |
| No.10, batch I (StrikeMacro) | 3 | 0 | 0 | 0 | 3 (+1 opt M4) |
| **No.10 subtotal** | **88** | **23** | 0 | **2** | **113** |
| No.10, batch L (Celebrate, now wave 2) | 1 | 1 | 0 | 0 | 2 |
| **No.10 total** | **89** | **24** | 0 | **2** | **115** |
| **No.7** (incl. Celebrate re-skin) | 4 | 2 | 14 | 0 | **20** |
| Rival/Keeper (phase 3, priorities 1-3; +2 for the optional back silhouettes) | 10 | 1 | 2 (model sheets) | 0 | **13** (+2) |
| Reference canvases (not shipped) | 4 + No.7 heads 1 | | | | 5 |

Per skill, the No.10 frames each special plays:

| Skill | Frames played | Breakdown |
|---|---|---|
| ZENITH METEOR | 17 | Jump 10, Flick 3, Volley 4 (+Idle) |
| CRIMSON CRESCENT | 21 | Bicycle 15, Land 4, Stand Front 2 |
| GALE HAMMER | 22 | Run R1-R4, AP2, Strike 8, Macro 3, StrikeBack 3, Stand Back 2, Glance G4 |
| MERIDIAN THREAD | 25 | AP1, AP3, Trivela 8, Carry 4, Scan 4, Point 4, Glance G1-G3; plus No.7's 18 |
| SPOTLIGHT SOLO | 43 | Dribble 8, FrontTouch 1, Break 3, StepOver 6, Elastico 4, Nutmeg 3, SoleLift 12, Settle 4, Glance G2/G2L |

Some drawings serve several skills, characters or slots:
- Run R1-R4 (GALE, the pass through AP1, No.7 R1-R4/R3);
- Strike F5a (No.7 R4);
- Point P2/P3a (No.7 Q1/Q2);
- Glance G2 (pass and dribble);
- FrontTouch (3 dribble slots);
- Break (8 dribble slots from 3 drawings).

Run R5-R8 and Celebrate exist for No.7, field play and the result views.

---------------------------------------------------------------------------------------------

## 9. Fixes this library makes to the briefs

The set critic (Nov 2026) has written fixes 1-8 and 10-14 into the three briefs; 9 is for the
Crescent shot code.
1. **GALE shot 2:**
   - The run-up becomes Run R1-R4 on the real cadence. The brief's F2 → F3 at 0.15 s skipped a step.
   - F1 is dropped.
2. **GALE shot 3:** F8 was held 0.45 s mid-air. Add **F8b** at 0.92.
3. **GALE shot 6:** B10a/B10b = Stand Back a/b.
4. **Dribble shot 3:**
   - F10 was held 1.15-1.60 while running. Loop Break BR2/BR3 on 8ths instead.
   - F1 is FrontTouch; F8-F10 are Break.
5. **Dribble shot 5:**
   - F6/F7 are the Break west strip.
   - The brief's fallback "Nutmeg F7 = F6 mirrored" must also use the west strip, because the chest
     "10" would otherwise read "01".
6. **Dribble shot 1:** use Glance G2L/G2 instead of the code pupil override.
7. **Pass shot 3:** T1/T2 are Approach AP1/AP3, so T1's anchor stays the right toe-tip.
8. **Pass, No.7:**
   - Run is the 8-frame re-skin, with the 4-frame subset for the caches.
   - Q1/Q2 are mirrored re-skins of P2/P3a.
9. **Crescent shots 3-5:** every `renderPuppet(HERO_KIT, …)` becomes a Bicycle frame drawn through
   `studioAnim` with the west strip and the RotSprite cache. **Shot 8** replaces the code-squashed
   static sprite with Land L1-L4 + Stand Front a/b.
10. **All result views:** `POSES.celebrate` for No.10 becomes Celebrate C1/C2 (now wave 2, required
    for GALE and the pass). The dribble result already uses Settle F3.
11. **GALE shot 2:** the eye strip is gone; Glance G4 appears at ×2 inside the dew mirror.
12. **GALE shot 6:** StrikeBack and Stand Back are drawn at integer ×2 (the brief had 2.2), centred.
13. **GALE shot 4 / pass shot 4:** no slide tackles (puppet `jumpBlock` and `pokeTackle` instead); the
    Rival Slide set serves SPOTLIGHT SOLO only.
14. **Field views of the three new scenarios:** No.10 from Dribble caches, never the field puppet.
