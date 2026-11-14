// SHOT 6 — FOOTPRINTS OF AIR (2.6 s): the payoff and the celebration (SPEC.md §6).
//
// Back view, centred: No.10 lands his follow-through hop on the kicking foot right in front of us, framed by the
// ballooned goal straight ahead. The camera cranes up and back (0.00-1.30) and the pitch unrolls above his head:
// three ring footprints of flattened grass lie between his boots and the net like stepping stones, each still
// breathing thin dew mist (no line ever joins them). He settles, breathing (Stand Back a/b), his breath smoking in
// the cold. At 0.50 the late thunder reaches the stands: a wave of camera flashes ripples round them left to right
// under a travelling refraction bulge (canvas, on the stand only, so it never warps him). GOAL! slams in above the goal (ice, cobalt, navy) with confetti. Then the
// palm blow (1.05-1.79): he lifts his right palm flat to mouth height, aims it at the goal and blows across it; the
// breath drifts off his palm toward the net (soft, curling, never a line) to the G-B-D chord, and at 1.50 all three
// stamps exhale a ring of dew mist together. The name card slides in at 1.70 and the frame fades to [8,4,14].
//
// Layers: the down-the-pitch ground is a perspective backdrop with its own crane (eye height, focal length,
// horizon); No.10 and his particles are a foreground layer on the cinematic camera (world = screen at zoom 1, the
// frames at integer x2 with (64,102) on (320,330)), which the crane zooms 1.15 -> 0.90 while lowering him in frame.
// After the crane a slow 3 % push holds the frame alive. Titles, confetti and the card are screen space. The shake
// is a pure function of t applied to both layers. The keeper (flat in the goal mouth) is the one puppet render.
// No.10's frames come from the StrikeBack / StandBack studio strips by frame name (hasAnim fallbacks, then the
// library stand-ins through drawNo10: never a puppet), on the strips' own schedule: B9 0.00, a 0.25, b 0.45, a 0.65,
// b 0.85, B11h 1.05, B11 1.12, B12 1.30, B11 1.60, B11h 1.72, a 1.79, b 2.06, a 2.33.

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { TAU, Rng, clamp, ease, lerp, noise1 } from '../../engine/math';
import { PK, drawGlow, glowOf, softSprite } from '../../engine/particles';
import { anim, drawAnim, findFrame, hasAnim, type StudioAnim } from '../../art/studioAnim';
import { TITLE_FONT } from '../../art/fx';
import { KEEPER_KIT, P, POSES, drawPuppet, renderPuppet } from '../../art/puppet';
import {
  AIR_TONES, BLINK, DOWN_PITCH_VIEW, HEX, MUFFLE, PAL, STAMPS, TITLE_STYLE, drawDownPitch, drawNo10, drawStamp, galeGrade,
  nameCard, projectDecal, pulse, sparkleCyan, type DownPitchView, type No10Key,
} from './common';

// ---------------------------------------------------------------- timing (shot-local)
const DUR = 2.6;
/** Boot contact of the hop landing (frames 0-1 are the last of the fall), then 2 frames of squash. */
const LAND = 2 / 60;
const SQUASH_END = LAND + 2 / 60;
const BREATH = [0.3, 0.7] as const;
const THUNDER = 0.5, WAVE = 0.3;
const GOAL_T = 0.75;
const BLOW = 1.3, EXHALE = 1.5;
const CARD = 1.7;
const FADE = 0.35;
const CRANE = 1.3;

// ---------------------------------------------------------------- No.10's back frames

type BackKey = 'B9' | 'B11h' | 'B11' | 'B12' | 'a' | 'b';
type Strip = 'StrikeBack' | 'StandBack';
/** Studio frame names (in order of preference), a studio stand-in, and the library ID drawNo10 falls back to. */
const BACK: Record<BackKey, { strip: Strip; names: string[]; alt?: { strip: Strip; names: string[] }; lib: No10Key }> = {
  B9: { strip: 'StrikeBack', names: ['B9'], lib: 'B9' },
  B11h: { strip: 'StrikeBack', names: ['B11h', 'B11'], alt: { strip: 'StandBack', names: ['b'] }, lib: 'B11' },
  B11: { strip: 'StrikeBack', names: ['B11'], alt: { strip: 'StandBack', names: ['b'] }, lib: 'B11' },
  B12: { strip: 'StrikeBack', names: ['B12', 'B11'], alt: { strip: 'StandBack', names: ['a'] }, lib: 'B12' },
  a: { strip: 'StandBack', names: ['a', 'Sa'], lib: 'Sa' },
  b: { strip: 'StandBack', names: ['b', 'Sb'], lib: 'Sb' },
};
const SCHED: readonly (readonly [number, BackKey])[] = [
  [0, 'B9'], [0.25, 'a'], [0.45, 'b'], [0.65, 'a'], [0.85, 'b'], [1.05, 'B11h'], [1.12, 'B11'], [1.3, 'B12'], [1.6, 'B11'],
  [1.72, 'B11h'], [1.79, 'a'], [2.06, 'b'], [2.33, 'a'],
];
function keyAt(t: number): BackKey {
  let k: BackKey = SCHED[0][1];
  for (const [at, f] of SCHED) if (t >= at) k = f;
  return k;
}

interface Fr {
  a: StudioAnim;
  i: number;
}
/** Resolved studio frames (rebuilt in init; null = draw the library stand-in with drawNo10). */
let FR: Record<BackKey, Fr | null> = { B9: null, B11h: null, B11: null, B12: null, a: null, b: null };
function resolveFrames(): Record<BackKey, Fr | null> {
  const pick = (strip: Strip, names: string[]): Fr | null => {
    if (!hasAnim(strip)) return null;
    const a = anim(strip);
    const i = findFrame(a, ...names);
    return i >= 0 ? { a, i } : null;
  };
  const out = {} as Record<BackKey, Fr | null>;
  for (const k of Object.keys(BACK) as BackKey[]) {
    const d = BACK[k];
    out[k] = pick(d.strip, d.names) ?? (d.alt ? pick(d.alt.strip, d.alt.names) : null);
  }
  return out;
}

/** Floodlight rim (ice) and floodlight-shadow tints of his frames. */
const RIM: [number, number, number] = [205, 240, 255];
const SHADOW: [number, number, number] = [6, 12, 30];
/** Registration of every back frame: body centre x 64, soles on row 102 (the Idle Back grid), on world (320, 330). */
const PIV: [number, number] = [64, 103];
const WX = 320, WY = 330, SC = 2;

/** Frame-space point (pixel centre) of a named anchor of the frame drawn for k, with stand-in values. */
function anchorOf(k: BackKey, name: 'head' | 'tip' | 'soleR'): [number, number] {
  const f = FR[k];
  const p = f?.a.frames[f.i].anchors[name];
  if (p) return [p[0] + 0.5, p[1] + 0.5];
  if (name === 'head') return [64.5, 18.5];
  if (name === 'tip') return [84.5, 30.5];
  return [77.5, 102.5];
}
/** World point of a frame-space point (frames drawn at x2 with PIV on (WX, WY), lifted by `lift` px). */
const toWorld = (p: [number, number], lift = 0): [number, number] => [WX + (p[0] - PIV[0]) * SC, WY + (p[1] - PIV[1]) * SC - lift];

// ---------------------------------------------------------------- the crane (pure functions of t)

/** Goal line (field x) and the goal's width (world px) on the down-the-pitch ground. */
const GOAL_X = 1180, GOAL_W = 74;
const craneK = (t: number) => ease.inOutCubic(clamp(t / CRANE));
interface FgCam {
  zoom: number;
  x: number;
  y: number;
}
/** Foreground camera: zoom 1.15 -> 0.90; his soles go from screen y 322 to 342 (the camera rises, he sinks). */
function fgCam(t: number): FgCam {
  const c = craneK(t);
  const zoom = lerp(1.15, 0.9, c);
  const feet = lerp(322, 342, c);
  return { zoom, x: WX, y: WY - (feet - VH / 2) / zoom };
}
/**
 * The backdrop's crane: the eye rises (0.5 m -> 4.4 m) and pulls back 14 m while the lens widens, so the pitch
 * unrolls above his head as he sinks in frame: the goal (straight ahead, framing his head at first) settles near
 * the top, and the stamps come out from behind him one by one (6 m, 17 m, then 25 m), stepping stones from his
 * boots to the net. Solved per frame from eased screen targets (the goal line's y and width, stamp 1's y), so
 * every feature moves monotonically; any (x, h, f, horizon) is a true level camera.
 */
function viewAt(t: number): DownPitchView {
  const c = craneK(t);
  const e = lerp(840, 700, c);
  // The goal line settles at y 98, so the crossbar (about y 68) stays clear of GOAL!'s navy outline above it.
  const yg = lerp(128, 98, c), y1 = 152, w = lerp(135, 92, c);
  const dg = GOAL_X - e, d1 = STAMPS[0].x - e;
  const A = (y1 - yg) / (1 / d1 - 1 / dg);
  const f = (w * dg) / GOAL_W;
  return { x: e, z: DOWN_PITCH_VIEW.z, h: A / f, f, horizon: yg - A / dg, cx: VW / 2 };
}
/** Camera shake (screen px), a pure function of t: the landing, the thunder reaching the stands, GOAL!. */
function shake(t: number): [number, number] {
  const tr = 0.42 * pulse(t, LAND, 0.3) + 0.3 * pulse(t, THUNDER, 0.35) + 0.18 * pulse(t, GOAL_T + 0.12, 0.3);
  const s = tr * tr * 9;
  return [noise1(t * 28, 1) * s, noise1(t * 28, 2) * s];
}

/** After the crane settles, a slow push-in (3 %) about the goal area keeps the hold alive under GOAL! and the card. */
const PUSH_X = VW / 2, PUSH_Y = 150;
const pushK = (t: number) => 1 + 0.03 * ease.inOutQuad(clamp((t - CRANE) / (DUR - CRANE)));
function applyPush(ctx: CanvasRenderingContext2D, k: number) {
  ctx.translate(PUSH_X, PUSH_Y);
  ctx.scale(k, k);
  ctx.translate(-PUSH_X, -PUSH_Y);
}

// ---------------------------------------------------------------- stamps, ball, net

/** Stamp world radii on the down-the-pitch ground (the pressure rings spread wide as they flattened the turf). */
const STAMP_R = [21, 21, 30];
/** The ball, caught in the far top corner of the net (field x past the line, z, height). */
const BALL_IN_NET = { x: 1196, z: 224, h: 19 };
/** The keeper, still flat on the turf just off his line where the front pressed him (gkSwept laid down). */
const KEEPER_AT = { x: 1172, z: 249, h: 1 };
const KEEPER_FLAT = P({ ...POSES.gkSwept, spin: -1.0 });
const netBulge = (t: number) => lerp(0.32, 0.22, ease.outQuad(clamp(t / DUR)));

// ---------------------------------------------------------------- the palm blow's breath (deterministic puffs)

interface Puff {
  /** Birth (shot t), life (s), how far up the stamp corridor it carries (0 = stamp 1, 1 = the goal line), and its
   *  sideways spread across the corridor (-0.32..0.32). */
  b: number;
  life: number;
  reachU: number;
  dev: number;
  /** Curl amplitude (px), frequency (rad/s) and phase; size factor. */
  curl: number;
  freq: number;
  ph: number;
  size: number;
}
let PUFFS: Puff[] = [];
interface Glint {
  s: number;
  th: number;
  at: number;
  r: number;
}
let GLINTS: Glint[] = [];

/**
 * The far stand's camera flashes: fixed seats (u across the frame, v down the stand, a jitter on the thunder wave,
 * a brightness, a phase for the GOAL! flashes). Each flash pops and decays over a few frames: never re-placed.
 */
interface Seat {
  u: number;
  v: number;
  j: number;
  a: number;
  ph: number;
}
let SEATS: Seat[] = [];
/** Dew in the far turf (field x, z) and on the stamp rings (stamp, angle, radius factor): fixed, slow twinkles. */
interface Dew {
  x: number;
  z: number;
  ph: number;
  f: number;
  a: number;
  ice: boolean;
}
let DEWS: Dew[] = [];
interface Bead {
  s: number;
  th: number;
  rr: number;
  ph: number;
  f: number;
  r: number;
}
let BEADS: Bead[] = [];

// ---------------------------------------------------------------- one-shot flags
let landed = false;
let breathed = [false, false];
let goalBurst = false;

const CONFETTI = ['#2D52E0', '#2D52E0', '#F2F6FF', '#F2F6FF', '#E0283C', '#FFC23A'];

export const shotFootprints: Shot = {
  name: 'Footprints of air',
  dur: DUR,
  seed: 306,
  muffle: MUFFLE[6],
  prepare() {
    // Warm the frame lookups and the tinted rim / shadow copies, so the cut into this shot never hitches.
    FR = resolveFrames();
    for (const f of Object.values(FR)) {
      if (!f) continue;
      f.a.tinted(f.i, RIM);
      f.a.tinted(f.i, SHADOW);
    }
  },
  init(env) {
    env.sfx.clearBus();
    env.cam.set(VW / 2, VH / 2, 1, 0);
    FR = resolveFrames();
    landed = false;
    breathed = [false, false];
    goalBurst = false;
    // The palm blow's breath: 40 puffs born over 1.30-1.58, each a soft ice puff carried off his palm up the stamp
    // corridor toward the net (each settles somewhere between stamp 1 and the goal line).
    const r = new Rng(3061);
    PUFFS = [];
    for (let i = 0; i < 40; i++) {
      const u = i / 39;
      PUFFS.push({
        b: BLOW + 0.26 * Math.pow(u, 1.3) + r.range(0, 0.02),
        life: r.range(1.0, 1.4),
        reachU: r.range(0.35, 1),
        dev: r.range(-0.32, 0.32),
        curl: r.range(6, 16),
        freq: r.range(5, 9),
        ph: r.range(0, TAU),
        size: r.range(0.8, 1.25),
      });
    }
    GLINTS = [];
    for (let s = 0; s < 3; s++) for (let k = 0; k < 4; k++) GLINTS.push({ s, th: r.range(0, TAU), at: EXHALE + r.range(0, 0.25), r: r.range(0.8, 1.15) });
    // The stand's flash seats (the thunder ripple and the GOAL! flashes), the far dew and the ring beads: fixed.
    const rs = new Rng(3062);
    SEATS = Array.from({ length: 150 }, () => ({ u: rs.range(-0.02, 1.02), v: rs.range(0.05, 0.95), j: rs.range(0, 0.06), a: rs.range(0.6, 1), ph: rs.range(0, 1.4) }));
    DEWS = Array.from({ length: 40 }, () => ({
      x: rs.range(760, 1170), z: DOWN_PITCH_VIEW.z + rs.range(-260, 260), ph: rs.range(0, TAU), f: rs.range(2.5, 6), a: rs.range(0.45, 0.95), ice: rs.next() < 0.5,
    }));
    BEADS = [];
    for (let s = 0; s < 3; s++) {
      for (let k = 0; k < 4; k++) BEADS.push({ s, th: rs.range(0, TAU), rr: rs.range(0.7, 1.0), ph: rs.range(0, TAU), f: rs.range(3, 6), r: rs.range(2, 4) });
    }
  },
  update(env, t) {
    const rng = env.rng;
    const parts = env.parts;
    const k = keyAt(t);
    // ---- The hop lands on the kicking foot: a small dust ring and a few dew beads kicked off the grass.
    if (!landed && t >= LAND) {
      landed = true;
      const [sx, sy] = toWorld(anchorOf('B9', 'soleR'));
      parts.spawn({ kind: PK.Ring, x: sx, y: sy, s0: 6, s1: 40, max: 0.45, k: 0.22, ramp: 'dust', r0: 0, r1: 1, a0: 0.7, a1: 0, add: false, layer: 0 });
      for (let i = 0; i < 9; i++) {
        const side = i % 2 ? 1 : -1;
        parts.spawn({
          kind: PK.Smoke, x: sx + side * rng.range(4, 18), y: sy - rng.range(0, 3), vx: side * rng.range(40, 110), vy: -rng.range(6, 26), drag: 3.2,
          max: rng.range(0.45, 0.8), s0: rng.range(4, 7), s1: rng.range(12, 20), ramp: 'dust', r0: 0, r1: 1, a0: 0.42, a1: 0, add: false, layer: i < 5 ? 0 : 1,
        });
      }
      for (let i = 0; i < 8; i++) {
        const a = -Math.PI / 2 + rng.range(-1.1, 1.1);
        const sp = rng.range(60, 150);
        parts.spawn({
          kind: PK.Glow, x: sx + rng.range(-10, 10), y: sy - 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, ay: 520, drag: 1,
          max: rng.range(0.35, 0.6), s0: rng.range(1.6, 2.4), s1: 0.8, ramp: 'dew', r0: 0, r1: 0.7, a0: 1, a1: 0, layer: 1,
        });
      }
    }
    // ---- Breath mist beside his head at 0.30 and 0.70 (cold night): it billows out round both sides and rises.
    for (let j = 0; j < 2; j++) {
      if (breathed[j] || t < BREATH[j]) continue;
      breathed[j] = true;
      const [hx, hy] = toWorld(anchorOf(k, 'head'));
      // From behind, the breath he blows out ahead of his face billows into view round both sides of his head
      // (spawned just behind its silhouette) and rises over his hair.
      for (let i = 0; i < 6; i++) {
        const side = i % 2 ? 1 : -1;
        parts.spawn({
          kind: PK.Smoke, x: hx + side * rng.range(16, 30), y: hy + rng.range(-6, 8), vx: side * rng.range(10, 30), vy: -rng.range(55, 85), drag: 1.8,
          max: rng.range(0.7, 1.0), s0: rng.range(4, 6), s1: rng.range(16, 24), ramp: 'white', r0: 0, r1: 0.6, a0: 0.3, a1: 0, add: false, layer: 0,
        });
      }
    }
    // ---- Steam off his shoulders and hair after the sprint: thin, slow, constant.
    if (rng.next() < 0.45) {
      const [hx, hy] = toWorld(anchorOf(k, 'head'));
      const side = rng.next() < 0.5 ? -1 : 1;
      parts.spawn({
        kind: PK.Smoke, x: hx + side * rng.range(4, 40), y: hy + rng.range(6, 52), vx: side * rng.range(2, 8), vy: -rng.range(16, 30), drag: 0.6,
        max: rng.range(0.9, 1.4), s0: 3, s1: rng.range(10, 15), ramp: 'white', r0: 0, r1: 0.5, a0: 0.1, a1: 0, add: false, layer: 1,
      });
    }
    // ---- GOAL!: confetti (screen space: layer 2) from both top corners, then drifting down from the top edge.
    if (t >= GOAL_T) {
      const gt = t - GOAL_T;
      if (!goalBurst) {
        goalBurst = true;
        for (let i = 0; i < 34; i++) {
          const left = i % 2 === 0;
          parts.spawn({
            kind: PK.Confetti, x: left ? -8 : VW + 8, y: rng.range(10, 120), vx: (left ? 1 : -1) * rng.range(150, 380), vy: rng.range(-170, -30),
            ay: 160, drag: 1.4, vrot: rng.range(-9, 9), max: rng.range(2.0, 2.8), s0: rng.range(5, 8), s1: 5, a0: 1, a1: 1, add: false,
            color: rng.pick(CONFETTI), k: rng.next(), layer: 2,
          });
        }
      }
      if (rng.next() < (gt < 0.6 ? 0.9 : 0.55)) {
        parts.spawn({
          kind: PK.Confetti, x: rng.range(-10, VW + 10), y: -10, vx: rng.range(-40, 40), vy: rng.range(30, 100),
          ay: 45, drag: 0.9, vrot: rng.range(-8, 8), max: rng.range(2.6, 3.4), s0: rng.range(4, 6.5), s1: 4.5, a0: 1, a1: 1, add: false,
          color: rng.pick(CONFETTI), k: rng.next(), layer: 2,
        });
      }
    }
  },
  render(env, t) {
    const { ctx, fx } = env;
    const st = env.art.stadium;
    const [shx, shy] = shake(t);
    const v = viewAt(t);
    const cam = fgCam(t);
    const k = keyAt(t);
    const pk = pushK(t);
    const crane = craneK(t);

    // ================= The down-the-pitch backdrop (screen space, its own crane) =================
    env.screen();
    ctx.translate(shx, shy);
    applyPush(ctx, pk);
    const wave = t >= THUNDER && t < THUNDER + WAVE ? (t - THUNDER) / WAVE : undefined;
    drawDownPitch(ctx, st, v, t, { bulge: netBulge(t), flashWave: wave, flashAmt: 0.6 });
    standHaze(ctx, v);
    // While the eye is low the painted lines collapse into one band on the horizon: a soft turf band lies over
    // them (it lifts as the crane rises and the lines open out), so the horizon never blows out.
    {
      const hz = projectDecal(GOAL_X, v.z, 0, v).y;
      const a = 0.5 * (1 - crane);
      if (a > 0.005) {
        const g = ctx.createLinearGradient(0, hz - 4, 0, hz + 26);
        g.addColorStop(0, 'rgba(18,58,36,0)');
        g.addColorStop(0.35, `rgba(18,58,36,${a.toFixed(3)})`);
        g.addColorStop(1, 'rgba(18,58,36,0)');
        ctx.fillStyle = g;
        ctx.fillRect(-20, hz - 4, VW + 40, 30);
      }
    }
    // Floodlight spill from the towers just above frame: cool, high-key (never dimmed).
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf([200, 225, 255]), -30, -60, 260, 0.22);
    drawGlow(ctx, glowOf([200, 225, 255]), VW + 30, -60, 260, 0.22);
    // The floodlights pool on the corridor of footprints (the brightest turf: the eye runs boots -> stamps -> net),
    // and the turf nearest the lens falls off into the shade behind him. Faint while the stamps still project onto
    // the horizon (the crane's start), full once the corridor has opened out.
    {
      const a = projectDecal(STAMPS[0].x, STAMPS[0].z, 0, v), c = projectDecal(STAMPS[2].x, STAMPS[2].z, 0, v);
      drawGlow(ctx, glowOf([200, 225, 255]), (a.x + c.x) / 2, (a.y + c.y) / 2 + 6, 230, 0.13 * (0.2 + 0.8 * crane), 1.25, 0.42);
      ctx.globalCompositeOperation = 'source-over';
      const shade = ctx.createLinearGradient(0, 230, 0, VH);
      shade.addColorStop(0, 'rgba(6,14,34,0)');
      shade.addColorStop(1, 'rgba(6,14,34,0.38)');
      ctx.fillStyle = shade;
      ctx.fillRect(-20, 230, VW + 40, VH - 230 + 20);
    }
    drawAtmosphere(ctx, v, t, crane);
    if (wave !== undefined) flashWave(ctx, v, wave);
    // The late thunder's ripple of camera flashes round the stand, then the GOAL! flashes (fixed seats, decaying).
    crowdFlashes(ctx, v, t);
    // The ball, caught in the far top corner of the ballooned net: a small ice ball (cobalt panels) on a navy halo,
    // with a soft cyan glow, so the payoff reads at every crane height.
    {
      const b = projectDecal(BALL_IN_NET.x, BALL_IN_NET.z, BALL_IN_NET.h, v);
      const r = Math.max(3, 1.4 * b.s);
      const bx = Math.round(b.x), by = Math.round(b.y);
      drawGlow(ctx, glowOf(PAL.navy), bx, by, r + 7, 0.6);
      ctx.fillStyle = HEX.navy;
      ctx.beginPath();
      ctx.arc(bx, by, r + 2, 0, TAU);
      ctx.fill();
      ctx.fillStyle = HEX.ice;
      ctx.beginPath();
      ctx.arc(bx, by, r, 0, TAU);
      ctx.fill();
      // Two cobalt panels, off-centre (a ball, not a target).
      ctx.fillStyle = HEX.cobalt;
      ctx.fillRect(bx - Math.round(r * 0.6), by - Math.round(r * 0.6), 2, 1);
      ctx.fillRect(bx + Math.round(r * 0.3), by + Math.round(r * 0.2), 1, 2);
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.cyan), bx, by, 10, 0.3 + 0.12 * Math.sin(t * 6));
      ctx.globalCompositeOperation = 'source-over';
    }
    // The keeper still lies flat in the goal mouth where the front pressed him (the one puppet render here).
    {
      const kp = projectDecal(KEEPER_AT.x, KEEPER_AT.z, KEEPER_AT.h, v);
      const k = Math.max(0.2, Math.round(0.19 * kp.s * 50) / 50);
      const r = renderPuppet(KEEPER_KIT, KEEPER_FLAT, { k, facing: -1 });
      drawPuppet(ctx, r, kp.x, kp.y, (0.19 * kp.s) / k);
    }
    // The three footprints of air, still breathing dew mist; they exhale a ring of mist together at 1.50.
    const breathe = 0.5 + 0.5 * Math.sin(((t + 0.3) / 1.2) * TAU);
    const ex = t - EXHALE;
    STAMPS.forEach((s, i) => {
      const p = projectDecal(s.x, s.z, 0, v);
      const R = STAMP_R[i] * p.s;
      const mist = Math.min(1.15, 0.6 + 0.3 * breathe + (ex > 0 ? 0.5 * pulse(ex, 0, 0.9) : 0));
      drawFootprint(ctx, p.x, p.y, R, p.k, t, i, breathe, ex, mist);
      if (ex > 0) exhaleRing(ctx, p.x, p.y, R, p.k, ex, i);
    });
    // Dew glints catching the floodlights on the exhaling rings.
    for (const g of GLINTS) {
      const a = t - g.at;
      if (a < 0 || a > 0.22) continue;
      const s = STAMPS[g.s];
      const p = projectDecal(s.x, s.z, 0, v);
      const R = STAMP_R[g.s] * p.s * g.r * (1 + 0.3 * clamp((t - EXHALE) / 0.6));
      const f = Math.sin((a / 0.22) * Math.PI);
      sparkleCyan(ctx, p.x + Math.cos(g.th) * R, p.y + Math.sin(g.th) * R * p.k - 2, 3 + 3 * f, f, 0.3);
    }

    // ================= No.10 and his particles (the foreground camera) =================
    // The push folded into the camera: screen = PUSH + (crane screen - PUSH) * pk.
    const zp = cam.zoom * pk;
    const cy = cam.y - ((VH / 2 - PUSH_Y) * (pk - 1)) / zp;
    env.cam.set(cam.x - shx / zp, cy - shy / zp, zp, 0);
    env.world();
    env.parts.draw(ctx, 0);
    drawNo10Back(env, k, t);
    env.parts.draw(ctx, 1);

    // ================= The palm blow's breath (screen space: the crane has settled by 1.30) =================
    env.screen();
    ctx.translate(shx, shy);
    applyPush(ctx, pk);
    if (t >= BLOW) drawBlow(env, t, cam, v);
    env.screen();
    drawBokeh(ctx, t);

    // ================= Titles, confetti, card (screen space) =================
    env.screen();
    if (t >= GOAL_T) drawGoalTitle(ctx, t - GOAL_T);
    env.parts.draw(ctx, 2);
    if (t >= CARD) nameCard(ctx, t - CARD);

    // ================= Post =================
    galeGrade(fx, 1, [228, 242, 255], 1.07);
    fx.bloom = 0.9;
    // A higher bloom threshold while the eye is low (the horizon is dense with lines and light), easing to 0.68.
    fx.bloomThresh = lerp(0.8, 0.68, crane);
    fx.vignette = 0.42;
    // GOAL!: one soft pressure ring from the title.
    const gr = t - GOAL_T - 0.16;
    if (gr > 0 && gr < 0.45) fx.shocks.push({ x: 0.5, y: (TITLE_Y - 22) / VH, r: gr * 0.75, s: 0.018 * (1 - gr / 0.45) });
    fx.ca = 0.0008 + 0.003 * pulse(t, THUNDER, 0.25);
    // Open: the navy blink from shot 5 lifts over 3 frames. Close: fade to [8,4,14] over the last 0.35 s, reaching
    // it exactly on the last rendered frame (t = DUR - 1/60) so the cut into the result view is clean.
    const fOut = ease.inQuad(clamp((t - (DUR - FADE)) / (FADE - 1 / 60)));
    const fIn = t < 0.05 ? 0.55 * (1 - t / 0.05) : 0;
    if (fOut > 0) {
      fx.flash = fOut;
      fx.flashColor = BLINK.fade;
    } else if (fIn > 0) {
      fx.flash = fIn;
      fx.flashColor = BLINK.navy;
    }
  },
  cues: [
    { at: 0.02, fn: (env) => env.sfx.kick(0.25) },
    { at: 0.3, fn: (env) => env.sfx.breath() },
    { at: 0.5, fn: (env) => env.sfx.boom(0.4, 0.9) },
    { at: 0.7, fn: (env) => env.sfx.breath() },
    { at: 0.75, fn: (env) => (env.sfx.stinger(), env.sfx.whistle(), env.sfx.crowd(3, 0.5)) },
    {
      at: 1.3,
      fn: (env) => {
        env.sfx.breath(0.6);
        for (const f of [AIR_TONES.G5, AIR_TONES.B5, AIR_TONES.D6]) env.sfx.airTone(f, 0.15);
      },
    },
    { at: 1.5, fn: (env) => env.sfx.whoosh(0.4, 600, 200, 0.15) },
  ],
};

// ---------------------------------------------------------------- drawing helpers

/**
 * No.10 from behind at x2 on (WX, WY): a contact shadow, a soft navy separation halo, an ice rim from the floodlights
 * ahead of him, then the frame (studio strip, else the library stand-in). Landing: the last 2 frames of the fall,
 * then 2 frames of squash at y-scale 0.96.
 */
function drawNo10Back(env: Env, k: BackKey, t: number) {
  const ctx = env.ctx;
  const lift = t < LAND ? (LAND - t) * 60 * 2 * SC : 0;
  const sy = t >= LAND && t < SQUASH_END ? 0.96 : 1;
  ctx.save();
  ctx.globalAlpha = 0.42 * (1 - clamp(lift / 10));
  ctx.fillStyle = 'rgb(8,14,30)';
  ctx.beginPath();
  ctx.ellipse(WX + 2, WY - 1, 42, 5.5, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
  const [hx, hy] = toWorld(anchorOf(k, 'head'), lift);
  drawGlow(ctx, glowOf(PAL.navy), hx, hy + 40, 70, 0.32);

  const f = FR[k];
  // Two floodlight shadows thrown away from the towers behind the camera, fanning up the pitch to either side of
  // him (the classic floodlit cross-shadow): his silhouette sheared onto the turf, faint.
  if (f) {
    const sh = f.a.tinted(f.i, SHADOW);
    const fade = 1 - clamp(lift / 8);
    for (const sgn of [-1, 1]) {
      ctx.save();
      ctx.translate(WX + sgn * 2, WY);
      ctx.transform(SC * 0.9, 0, (-sgn * 104) / 97, 70 / 97, 0, 0);
      drawAnim(ctx, f.a, sh, f.i, 0, 0, 1, { pivot: PIV, alpha: 0.18 * fade });
      ctx.restore();
    }
  }
  ctx.save();
  ctx.translate(WX, WY - lift);
  ctx.scale(1, sy);
  if (f) {
    const rim = f.a.tinted(f.i, RIM);
    const o = (dx: number, dy: number, a: number) => drawAnim(ctx, f.a, rim, f.i, dx * SC, dy * SC, SC, { pivot: PIV, alpha: a });
    o(0, -1, 0.55);
    o(-1, 0, 0.3);
    o(1, 0, 0.3);
    drawAnim(ctx, f.a, null, f.i, 0, 0, SC, { pivot: PIV });
  } else {
    drawNo10(env, BACK[k].lib, 0, 0, SC, { anchor: 'contact' });
  }
  ctx.restore();
}

/**
 * The late thunder reaching the stands (0.50-0.80): the pressure front runs round the crowd left to right, a
 * travelling bulge of air under a soft cool light band (only the stand lights up: not a full-frame event). The
 * camera flashes it sets off are the stand's seats (crowdFlashes). p = 0..1, the front's position across the frame.
 */
function flashWave(ctx: CanvasRenderingContext2D, v: DownPitchView, p: number) {
  const bot = projectDecal(1270, v.z, 0, v).y;
  const fx = lerp(-30, VW + 30, p);
  // The refraction band, on the stand only (so it never warps No.10): the slice of crowd under the front is
  // redrawn magnified about the front, a travelling bulge of air. Canvas copy of what is already drawn, in device
  // px, in three nested passes (60, 44, 28 px wide) so the bulge's edges feather instead of cutting a seam.
  {
    const m = ctx.getTransform();
    const env = 0.85 * Math.sin(Math.PI * clamp(p));
    const mag = 1.15;
    for (const [hw, al] of [[30, 0.4], [22, 0.4], [14, 0.45]] as const) {
      const a = m.transformPoint({ x: fx - hw, y: 0 }), b = m.transformPoint({ x: fx + hw, y: bot });
      const w = b.x - a.x;
      if (w <= 1 || b.y <= 1) continue;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = al * env;
      ctx.drawImage(ctx.canvas, a.x, 0, w, b.y, a.x - (w * (mag - 1)) / 2, 0, w * mag, b.y);
      ctx.restore();
    }
  }
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const a = Math.sin(Math.PI * clamp(p * 1.1));
  drawGlow(ctx, glowOf([200, 225, 255]), fx, bot * 0.5, 60, 0.3 * a, 1, Math.max(1, bot / 60));
  ctx.restore();
}

/**
 * The stand's camera flashes, on fixed seats. The late thunder: each seat pops as the front passes it (left to
 * right over 0.30 s, a little jitter) and decays over 0.18 s, so the ripple leaves a fading wake behind its front.
 * GOAL!: the seats keep firing, each once every 0.7 s (a 0.1 s decay), thinning out over 1.4 s.
 */
function crowdFlashes(ctx: CanvasRenderingContext2D, v: DownPitchView, t: number) {
  // The seats spread over the part of the stand in frame (its top is above frame through the whole crane).
  const top = Math.max(2, projectDecal(GOAL_X + 90, v.z, 150, v).y);
  const bot = projectDecal(1270, v.z, 0, v).y - 6;
  const thr = 0.6 + 0.35 * clamp((t - GOAL_T) / 1.4);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const s of SEATS) {
    let a = 0;
    const age = t - (THUNDER + WAVE * s.u + s.j);
    if (age >= 0 && age < 0.18) a = s.a * (1 - age / 0.18) ** 2;
    if (t >= GOAL_T && s.a > thr) {
      const ph = ((t - GOAL_T) * 2 + s.ph) % 1.4;
      // (the seats drop out softly as the threshold rises past them)
      if (ph < 0.1) a = Math.max(a, s.a * (1 - ph / 0.1) * clamp((s.a - thr) / 0.04));
    }
    if (a < 0.02) continue;
    drawGlow(ctx, glowOf([255, 255, 255]), s.u * VW, lerp(top, bot, s.v), 3.5 + 2.5 * s.a, a);
  }
  ctx.restore();
}

/**
 * The cold floodlit haze over the far stand, as shots 2-5 lay it over theirs (shot 5's depth haze, cool and lifted):
 * without it the bare crowd strip reads warm red right after shot 5's cold blue stands, a colour jump at the cut.
 * From the frame top down to the stand's foot (the turf behind the goal keeps its own depth haze); the thunder ripple,
 * the GOAL! flashes and the floodlight spill are drawn after it, so they still pop.
 */
function standHaze(ctx: CanvasRenderingContext2D, v: DownPitchView) {
  const bot = projectDecal(1270, v.z, 0, v).y;
  const hz = ctx.createLinearGradient(0, 0, 0, bot);
  hz.addColorStop(0, 'rgba(70,104,170,0.55)');
  hz.addColorStop(1, 'rgba(150,186,230,0.4)');
  ctx.fillStyle = hz;
  ctx.fillRect(-20, -20, VW + 40, bot + 20);
}

/**
 * Dew bokeh: a few big out-of-focus droplets drifting right in front of the lens, catching the floodlights (soft
 * ice discs, normal blend), kept clear of No.10. Screen space, a pure function of t.
 */
function drawBokeh(ctx: CanvasRenderingContext2D, t: number) {
  ctx.save();
  for (let i = 0; i < 7; i++) {
    const r = 9 + ((i * 13.7) % 14);
    const x = ((i * 151.3 + 40) % (VW + 40)) - 20 + Math.sin(t * 0.7 + i * 2.1) * 6;
    const y = 30 + ((i * 89.1) % 250) + t * (5 + (i % 3) * 3);
    if (Math.abs(x - VW / 2) < 95 + r && y > 120) continue;
    drawGlow(ctx, softSprite('dew', 0.1), x, y, r, 0.07 + 0.04 * ((i * 0.37) % 1));
  }
  ctx.restore();
}

/**
 * The cold floodlit night: a thin layer of ground mist hanging over the far turf (drifting; thinner while the eye
 * is low and the far turf is one band on the horizon) and dew twinkling in the grass (fixed drops, each fading
 * slowly in and out: never re-placed). Screen space.
 */
function drawAtmosphere(ctx: CanvasRenderingContext2D, v: DownPitchView, t: number, crane: number) {
  ctx.save();
  const yA = projectDecal(GOAL_X + 4, v.z, 0, v).y, yB = projectDecal(1040, v.z, 0, v).y;
  const mist = 0.07 * (0.35 + 0.65 * crane);
  for (let i = 0; i < 16; i++) {
    const dir = i % 2 ? 1 : -1;
    const x = ((((i * 97.3 + t * 10 * dir) % (VW + 160)) + VW + 160) % (VW + 160)) - 80;
    const y = lerp(yA, yB, ((i * 0.618) % 1) * 0.8);
    drawGlow(ctx, glowOf([225, 240, 255]), x, y, 38 + 12 * Math.sin(i * 1.7), mist, 1.9, 0.32);
  }
  for (const d of DEWS) {
    if (d.x < v.x + 60) continue;
    const p = projectDecal(d.x, d.z, 0, v);
    if (p.y > VH || p.x < 0 || p.x > VW) continue;
    const tw = 0.5 + 0.5 * Math.sin(t * d.f + d.ph);
    ctx.globalAlpha = d.a * tw * tw;
    if (ctx.globalAlpha < 0.04) continue;
    ctx.fillStyle = d.ice ? HEX.ice : '#bfeeff';
    const q = p.s > 2.2 ? 2 : 1;
    ctx.fillRect(Math.round(p.x), Math.round(p.y), q, q);
  }
  ctx.restore();
}

/**
 * One footprint of air on the down-the-pitch turf: the pressed ring (drawStamp, with its dark hollow, flicked
 * blades and breathing dew mist), the flattened grass catching the floodlights (a soft sheen), a faint cyan rim
 * that breathes with the others (the command window's ghost stamps, now real; cyan on a navy halo) and dew beads
 * twinkling on the ring (fixed beads, each fading slowly in and out).
 */
function drawFootprint(
  ctx: CanvasRenderingContext2D, x: number, y: number, R: number, k: number, t: number, i: number, breathe: number, ex: number,
  mist: number,
) {
  // Seen at a grazing angle (the crane's start) the pressed grass barely shows; it comes out as the camera rises.
  const vis = ease.inOutQuad(clamp((k - 0.04) / 0.11));
  ctx.save();
  // The pressed turf lies over the painted lines too (the 17 m stamp sits on the box line and the D): they show
  // only faintly inside a ring, so every stepping stone reads whole.
  ctx.globalAlpha = 0.8 * vis;
  ctx.fillStyle = '#2b8239';
  ctx.beginPath();
  ctx.ellipse(x, y, R * 1.05, R * 1.05 * k, 0, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf([170, 230, 200]), x, y, R * 1.15, 0.16 * vis, 1, k * 1.1);
  ctx.restore();
  drawStamp(ctx, x, y, R, 5, { squash: k, mist: mist * (0.4 + 0.6 * vis), time: t + i * 0.37, alpha: 0.45 + 0.55 * vis });
  const rimA = (0.22 + 0.16 * breathe) * vis + (ex > 0 ? 0.5 * pulse(ex, 0, 0.45) : 0);
  ctx.save();
  ctx.globalAlpha = clamp(rimA * 0.9);
  ctx.strokeStyle = HEX.navy;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(x, y, R * 0.98, R * 0.98 * k, 0, 0, TAU);
  ctx.stroke();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = clamp(rimA);
  ctx.strokeStyle = HEX.cyan;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
  for (const b of BEADS) {
    if (b.s !== i) continue;
    const tw = Math.max(0, Math.sin(t * b.f + b.ph));
    const a = 0.85 * vis * tw * tw;
    if (a < 0.05) continue;
    const rr = R * b.rr;
    sparkleCyan(ctx, x + Math.cos(b.th) * rr, y + Math.sin(b.th) * rr * k, b.r, a, 0.3);
  }
}

/** One stamp's exhale (1.50): a ring of soft dew mist puffs leaving the ring, rising a little and fading, over a
 *  quick ice rim pulse on a navy halo. ex = seconds since the exhale. */
function exhaleRing(ctx: CanvasRenderingContext2D, x: number, y: number, R: number, k: number, ex: number, i: number) {
  if (ex > 1.0) return;
  const u = ease.outCubic(clamp(ex / 0.85));
  const rr = R * (0.95 + 0.7 * u);
  const fade = clamp(ex / 0.06) * (1 - clamp(ex / 1.0));
  ctx.save();
  const n = 16;
  for (let j = 0; j < n; j++) {
    const th = (j / n) * TAU + i * 0.7 + Math.sin(j * 3.7) * 0.12;
    const wob = 1 + 0.08 * Math.sin(j * 5.1 + ex * 6);
    const px = x + Math.cos(th) * rr * wob, py = y + Math.sin(th) * rr * wob * k - u * R * 0.35;
    const sz = R * (0.16 + 0.22 * u) * (0.85 + 0.3 * Math.abs(Math.sin(j * 2.3)));
    drawGlow(ctx, glowOf(PAL.ice), px, py, sz, 0.2 * fade);
  }
  const ra = 1 - clamp(ex / 0.35);
  if (ra > 0) {
    ctx.globalAlpha = 0.35 * ra;
    ctx.strokeStyle = HEX.navy;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x, y, rr, rr * k, 0, 0, TAU);
    ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.7 * ra;
    ctx.strokeStyle = HEX.ice;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * The palm blow: soft ice puffs blown across his palm. Each leaves the palm's outer edge heading up and out (the
 * way he blows across it), then bends away up the pitch along the stamp corridor toward the net, a breath carried
 * over the stepping stones: each puff settles at its own spot between stamp 1 and the goal line (a point on the
 * ground view, 1.7 m up), shrinking with distance, spreading, curling and thinning out as it goes (soft puffs on a
 * curve: never a line). Screen space through the settled foreground camera.
 */
function drawBlow(env: Env, t: number, cam: FgCam, v: DownPitchView) {
  const ctx = env.ctx;
  const [px, py] = toWorld(anchorOf(t < 1.6 ? 'B12' : 'B11', 'tip'));
  // The stream starts just past his palm's outer edge, outside his hair's silhouette.
  const sx = VW / 2 + (px - cam.x) * cam.zoom + 6, sy = VH / 2 + (py - cam.y) * cam.zoom - 4;
  const out = -1.05;
  // A navy halo under the stream's root while the puffs leave the palm, so they never flare white on his hair.
  const root = clamp((t - BLOW) / 0.03) * (1 - clamp((t - (BLOW + 0.3)) / 0.35));
  if (root > 0) drawGlow(ctx, glowOf(PAL.navy), sx, sy, 16, 0.25 * root);
  // The blow: a cyan glint on the flat palm as the breath leaves it (on a navy halo).
  const gl = pulse(t, BLOW, 0.22);
  if (gl > 0) {
    drawGlow(ctx, glowOf(PAL.navy), sx - 6, sy + 4, 14, 0.35 * gl);
    sparkleCyan(ctx, sx - 4, sy + 1, 5 + 6 * gl, gl, 0.4);
  }
  ctx.save();
  const cx = sx + Math.cos(out) * 24, cy = sy + Math.sin(out) * 24;
  for (const p of PUFFS) {
    const a = t - p.b;
    if (a < 0 || a > p.life) continue;
    const q = a / p.life;
    // A breath leaves fast and slows as it carries: each puff reaches its spot in 0.5-0.8 s (the farther, the
    // longer), so the stream never piles up on his palm, then hangs there rising a little and thinning out.
    const tr = lerp(0.5, 0.8, p.reachU);
    const u = ease.outCubic(clamp(a / tr));
    // Quadratic path: out across the palm, then bending up the pitch to its spot over the corridor.
    const e = projectDecal(lerp(STAMPS[0].x, GOAL_X, p.reachU), DOWN_PITCH_VIEW.z - 8 + p.dev * 60, 17, v);
    const ex = e.x, ey = e.y - 10 * clamp((a - tr) / 0.8);
    const d = Math.atan2(ey - sy, ex - sx);
    const w = 1 - u;
    let x = w * w * sx + 2 * w * u * cx + u * u * ex;
    let y = w * w * sy + 2 * w * u * cy + u * u * ey;
    const lat = p.curl * u * (1 - 0.5 * u) * Math.sin(p.ph + a * p.freq);
    x += -Math.sin(d) * lat;
    y += Math.cos(d) * lat;
    // Shrinking with distance as it carries away up the pitch.
    const r = lerp(5, 11, Math.sqrt(u)) * (1 - 0.55 * u) * p.size;
    const al = 0.5 * clamp(a / 0.03) * Math.pow(1 - q, 1.1);
    drawGlow(ctx, softSprite('dew', 0.2), x, y, r, al);
  }
  ctx.restore();
}

/** Damped spring for each title letter (shot 1's title motion): from a thin sliver to a 115 % overshoot, settling
 *  at 100 % by about 0.14 s. */
function letterSpring(lt: number, s0: number): number {
  if (lt <= 0) return s0;
  return 1 + (s0 - 1) * Math.exp(-lt / 0.0363) * Math.cos((TAU * lt) / 0.13);
}

/** GOAL!'s baseline, size and cap height (screen px): settled, the letters span about y 14-68, under the frame top
 *  and above the crossbar. */
const TITLE_Y = 61, TITLE_SIZE = 54, TITLE_CAP = TITLE_SIZE * 0.74;

/**
 * GOAL! above the goal: ice letters, cobalt stroke, navy outline, on a navy halo with a soft cobalt glow, and a
 * pressure ring popping out of it as the first letter lands (GALE's ring-pop, never a full-frame flash). The
 * letters slam in one by one with the cut-in title's spring: each grows up from a white-hot sliver on the
 * baseline (at most 1.35x tall), overshoots and squashes about its cap centre, so no letter ever leaves the frame.
 */
function drawGoalTitle(ctx: CanvasRenderingContext2D, gt: number) {
  const X = VW / 2, Y = TITLE_Y, size = TITLE_SIZE, capH = TITLE_CAP, skew = -0.18;
  const inA = clamp(gt / 0.25);
  ctx.save();
  drawGlow(ctx, glowOf(PAL.navy), X, Y - 26, 150, 0.55 * inA, 1.25, 0.5);
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.cobalt), X, Y - 26, 130, 0.35 * inA, 1.2, 0.45);
  ctx.globalCompositeOperation = 'source-over';
  const bounce = 1 + pulse(gt, 0.4, 0.3) * 0.04;
  ctx.translate(X, Y - capH / 2);
  ctx.scale(bounce, bounce);
  ctx.translate(0, capH / 2);
  ctx.font = `${size}px ${TITLE_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  const text = 'GOAL!';
  const widths = [...text].map((c) => ctx.measureText(c).width + size * 0.02);
  const fill = ctx.createLinearGradient(0, -size * 0.8, 0, 0);
  fill.addColorStop(0, '#ffffff');
  fill.addColorStop(0.55, TITLE_STYLE.fill);
  fill.addColorStop(1, TITLE_STYLE.fill2);
  let lx = -widths.reduce((s, w) => s + w, 0) / 2;
  for (let i = 0; i < text.length; i++) {
    const w = widths[i];
    const lt = gt - i * 0.07;
    const gx = lx + w / 2;
    lx += w;
    if (lt <= 0) continue;
    const sx = letterSpring(lt, 4 / (w + 10));
    const sy = sx < 1 ? Math.min(1.35, 1 + 0.45 * (1 - sx)) : 1 - 0.6 * (sx - 1);
    ctx.save();
    ctx.translate(gx, -capH / 2);
    ctx.transform(1, 0, skew, 1, 0, 0);
    // The stretched sliver grows up from the baseline; the overshoot squash stays centred on the cap (the two
    // pivots agree at sy = 1, so there is no jump).
    const piv = sy > 1 ? capH / 2 : 0;
    ctx.translate(0, piv);
    ctx.scale(sx, sy);
    ctx.translate(0, capH / 2 - piv);
    ctx.globalAlpha = clamp(lt / 0.04);
    ctx.strokeStyle = TITLE_STYLE.outer;
    ctx.lineWidth = size * 0.26;
    ctx.strokeText(text[i], 0, 0);
    ctx.strokeStyle = TITLE_STYLE.stroke;
    ctx.lineWidth = size * 0.13;
    ctx.strokeText(text[i], 0, 0);
    ctx.fillStyle = fill;
    ctx.fillText(text[i], 0, 0);
    // White-hot while it springs.
    const hot = 1 - clamp(lt / 0.1);
    if (hot > 0) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = hot * 0.8;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(text[i], 0, 0);
    }
    ctx.restore();
  }
  ctx.restore();
  const rp = (gt - 0.16) / 0.45;
  if (rp > 0 && rp < 1) {
    const r = lerp(40, 190, ease.outCubic(rp));
    const a = 1 - rp;
    ctx.save();
    ctx.globalAlpha = 0.45 * a;
    ctx.strokeStyle = HEX.navy;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(X, Y - 22, r, r * 0.36, 0, 0, TAU);
    ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.8 * a;
    ctx.strokeStyle = HEX.cyan;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }
}
