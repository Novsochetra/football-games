// SHOT 7 — ON THE MARK (2.4 s = beats 18-23, global 8.6-11.0). SPEC.md §7: the last touches, the brake, and the
// sole that stops the ball dead on the penalty spot on the final drum hit; the cymbal choke into silence; the
// keeper's spot clunks on; the floodlights slam back on; 1 ON 1; the name card; the fade into the result view.
//
// A medium-wide side view on the field view's oblique, the goal mouth at the right edge. The ground is a perspective
// plane seen from a raised camera: a figure at depth s (1 = his plane) stands at y = 87 + 233 s and is drawn s times
// his size (No.10 x2 at s 1 with his soles on y 320; the keeper s 0.7, feet y 250; the beaten defenders s 0.46-0.62,
// far behind him on the left). The pitch lines converge on (500, 87), so the goal line leans at the field's gentle
// slant. The camera is still apart from three beat-snaps: 0.80 zoom 1.08 on him (the stop), 1.60 back to 1.0 and up
// 44 px (the reveal: the stadium, the four defenders, and the sole on the ball clear of the name card).
//
// No.10 (Dribble F1-F7 into Settle F1-F3b at x2, the brief's schedule) runs in from the left: every frame's canvas
// is pinned to the turf at its JSON origin (Dribble originDx, Settle +48), so the planted toe never slides and the
// left toe of Dribble F6 is the same pixel as Settle F2's. The ball is re-pushed on the two touches (F1 right laces
// 0.00, F5 left instep 0.40), decelerates through the frames' own ball anchors, rolls into the upturned sole of the
// brake and is trapped dead on the spot at 0.80, still rolling (so the stop is felt).
//
// Beats (shot-local; touches, keys and lamps on the 16th grid):
//   0.00 touch R (tom D3), exposure of F1 dropped where he is (the performance trail)
//   0.20 exposure of F3        0.40 touch L (tom C3) + exposure of F5; the ball rolls ahead onto the spot
//   0.60 BRAKE (Settle F1, heel plant, snare drag 0.60 / 0.70)
//   0.80 SOLE STOP (Settle F2): kick + crash + boom, cam.hit, beat-snap 1.08, rate 0.1, dim 0.85. The exposures come
//        home: each rushes in over the 16th before and merges ON its own (0.80 F5, 0.90 F3, 1.00 F1), his
//        rim flashing lilac for one frame; the ball glints ivory on the last one. 0.86 the cymbal is choked, the
//        crowd ducked: only the lamp hum is left.
//   1.00 CLUNK: the keeper's own spot from the top-left (beam, pool rx 70 ry 80); the two beams cross: the duel.
//   1.10 his gloves twitch (one frame).   1.20 Settle F3 chin up + the bookend eye panel (G2, eyes on the keeper).
//   1.40 a lilac glint in his eye.   1.60 FREEZE (rate 0): the floodlights slam back on in three 16ths (1.60, 1.70,
//   1.80; dim 0.85 -> 0.45 -> 0.15 -> 0), "1 ON 1" lights one group per bank, the beat-snap reveal.
//   1.70 the name card slides in; 2.05-2.40 fade to [8,4,14].
//
// Determinism: the picture is a pure function of t except the follow-spot operator, the keeper's sim clock (his crouch
// crawls at the world rate), the ball spin and the particles, all advanced in update() and reset in init().

import type { Env, Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { Rng, clamp, ease, lerp, type RGB } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import { mixPose, type Kit, type Pose } from '../../art/puppet';
import { slamTitle } from '../../art/fx';
import {
  FADE, FollowSpot, HEX, HUM, KEEPER_KIT, PAL, P, POSES, PuppetCache, RATE, RIVAL_KIT, RIVAL_KIT_B, RIVAL_KIT_C,
  RIVAL_KIT_D, SEQ, TOMS, beatCam, drawBall, drawSolo, drawSoloGhost, fourCount, joints, lampTitle, onFrames, onGrid,
  padsFor, pixelText, soloAt, soloGrade, soloPic, stage, warmSolo, type CamKey, type SoloKey, type StagePool,
} from './common';

const DUR = 2.4;
/** No.10's integer sprite scale (SCALE[7]). */
const SC = 2;
/** His sole line (world y), the size horizon and the vanishing x of the pitch lines. */
const GY = 320;
const HZ = 87;
const VX = 500;
/** Frame-space y of the sole line: the bottom edge of row 102. */
const SOLE = 103;
/** World x of the Dribble cycle's canvas origin (frame px 0, at x2): he stops with his pelvis near x 216. */
const O = -18;
/** Canvas origin (frame px) of each frame he plays: Dribble.json originDx, Settle at the Dribble origin + 48. */
const ORIGIN: Partial<Record<SoloKey, number>> = { D1: 0, D2: 24, D3: 24, D4: 24, D5: 24, D6: 42, D7: 42, ST1: 48, ST2: 48, ST3: 48, ST3b: 48 };
/** The planted toe / heel (frame px x) of each frame, for stand-in art that is placed by its contact anchor. */
const CONTACT: Partial<Record<SoloKey, number>> = { D1: 76, D2: 73, D3: 73, D4: 73, D5: 73, D6: 76, D7: 76, ST1: 78, ST2: 70, ST3: 70, ST3b: 70 };

// ---------------------------------------------------------------- the beats (shot-local)

const TOUCH = [onGrid(0, 'touch R'), onGrid(0.4, 'touch L')] as const;
const BRAKE = onGrid(0.6, 'brake');
const STOP = onGrid(0.8, 'SOLE STOP');
const KEEPER_ON = onGrid(1.0, 'keeper spot');
const TWITCH = onGrid(1.1, 'gloves');
const CHIN = onGrid(1.2, 'chin up');
const GLINT = onGrid(1.4, 'glint');
const LIGHTS = [onGrid(1.6, 'lights 1'), onGrid(1.7, 'lights 2'), onGrid(1.8, 'lights 3')] as const;
const CARD = 1.7;
const FADE_T = DUR - 0.35;
/** The performance trail: [drop time, frame, the 16th it comes home on]. Nearest first home. */
const TRAIL: readonly (readonly [number, SoloKey, number])[] = [
  [onGrid(0, 'trail 1'), 'D1', onGrid(1.0, 'home 3')],
  [onGrid(0.2, 'trail 2'), 'D3', onGrid(0.9, 'home 2')],
  [onGrid(0.4, 'trail 3'), 'D5', onGrid(0.8, 'home 1')],
];
/** An exposure rushes home over the 16th before the one it merges on (6 frames). */
const RUSH = 0.1;
/** Footfalls (dust): F2 right foot down, F6 left foot down; the brake heel at 0.60. */
const FOOTFALL = [0.1, 0.45] as const;

// ---------------------------------------------------------------- the stage (world = screen at the rest framing)

/** Ground y of a depth s. */
const yOf = (s: number) => HZ + (GY - HZ) * s;
/** Ground point of pitch line coordinate X (screen x at depth 1) at depth s. */
const gp = (X: number, s: number): [number, number] => [VX + (X - VX) * s, yOf(s)];

/** The pitch: far touchline, six-yard far side; the goal's far / near post depths. */
const S_FT = 0.237;
const S_6 = 0.459;
const S_FAR = 0.578;
const S_NEAR = 0.885;
/** Lines of constant X: goal line, six-yard line (screen x at depth 1). */
const XG = 603;
const SPOT_X = O + SC * 148; // the ball's rest under the sole = the penalty spot (278)
const X6 = XG - (XG - SPOT_X) / 2;
/** Goal height at depth 1 (2.44 m against his 1.8 m), the net depth behind the line. */
const GOAL_H = 266;
const GOAL_D = 150;
/** The keeper: depth, ground x (screen) when set, and where he starts (on his way off the line). */
const K_S = 0.7;
const K_X0 = 478;
/** The far stand: the crowd canvas sits on the far touchline. */
const STAND_Y = yOf(S_FT);
const CROWD_X = -330;

// ---------------------------------------------------------------- module state (reset in init)

let spin = new BallSpin();
let prevBall = 0;
const spot = new FollowSpot(0.06);
let simT = 0;
let fired: boolean[] = [];

// ---------------------------------------------------------------- No.10

const seq = SEQ[7];
const keyAt = (t: number): SoloKey => soloAt(seq, t);
/** World x of a frame's canvas origin. */
const heroX = (k: SoloKey) => O + SC * (ORIGIN[k] ?? 48);
/** Draw arguments for No.10's frame (the library frame pinned by its canvas; a stand-in by its planted contact). */
function heroArgs(env: Env, k: SoloKey, x = heroX(k)): { x: number; o: { pivot?: [number, number] } } {
  if (soloPic(env, k).source === 'studio') return { x, o: { pivot: [0, SOLE] } };
  return { x: x + SC * (CONTACT[k] ?? 72), o: {} };
}
function drawHero(env: Env, k: SoloKey, alpha = 1, img?: HTMLCanvasElement) {
  const a = heroArgs(env, k);
  drawSolo(env, k, a.x, GY, SC, { ...a.o, alpha }, img);
}
/** The performance trail's layer: one full-frame canvas (device px), reused every frame; composited at TRAIL_A. */
const TRAIL_A = 0.68;
let trailCv: HTMLCanvasElement | null = null;
function trailLayer(ctx: CanvasRenderingContext2D): HTMLCanvasElement {
  const { width: w, height: h } = ctx.canvas;
  if (!trailCv) trailCv = document.createElement('canvas');
  if (trailCv.width !== w || trailCv.height !== h) {
    trailCv.width = w;
    trailCv.height = h;
  }
  return trailCv;
}
/** An ultraviolet exposure of frame k with its canvas at world x (placed exactly like the frame itself). */
function drawGhost(env: Env, k: SoloKey, x: number, alpha: number) {
  const a = heroArgs(env, k, x);
  drawSoloGhost(env, k, a.x, GY, SC, { ...a.o, alpha });
}
/** Pelvis world x of the frame showing at t (the follow-spot's target). */
function pelvisX(env: Env, t: number): number {
  const k = keyAt(t);
  return heroX(k) + SC * soloPic(env, k).anchor('pelvis')[0];
}

/**
 * The ball (frame px from the cycle origin, x1): the right-lace push at 0.00 decelerates through the Dribble ball
 * anchors (99 -> 121 at the left touch, constant friction), the left instep re-pushes it toward the spot at about
 * 2 m/s on grass friction (through the D6 / D7 ball anchors), it meets the upturned sole of the brake exactly at
 * Settle F1's own ball anchor (144) on the snare, the sole cushions it from 30 to 10 px/s, and it is trapped on the
 * spot (148) at 0.80 while still rolling: the sole stops it dead.
 */
function ball1(t: number): number {
  if (t < TOUCH[1]) return 99 + 74 * t - 47.5 * t * t;
  if (t < BRAKE) {
    const u = t - TOUCH[1];
    return 121 + 120 * u - 25 * u * u;
  }
  if (t < STOP) {
    const u = t - BRAKE;
    return 144 + 30 * u - 50 * u * u;
  }
  return 148;
}
const ballX = (t: number) => O + SC * ball1(t);
const BALL_R = 6 * SC;
const BALL_Y = GY - BALL_R;

// Derived pictures per frame (built once): the lilac rim (the merge flash) and the fluorescent boots.
const derived = new Map<string, { rim: HTMLCanvasElement; boots: HTMLCanvasElement; halo: HTMLCanvasElement; deep: HTMLCanvasElement }>();
const near = (p: Uint8ClampedArray, i: number, hex: number) =>
  Math.abs(p[i] - (hex >> 16)) < 8 && Math.abs(p[i + 1] - ((hex >> 8) & 255)) < 8 && Math.abs(p[i + 2] - (hex & 255)) < 8;
function derive(env: Env, key: SoloKey) {
  const p = soloPic(env, key);
  let d = derived.get(p.id);
  if (d) return d;
  const { w, h, px } = p;
  const mk = () => {
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    const g = cv.getContext('2d')!;
    return [cv, g, g.createImageData(w, h)] as const;
  };
  const op = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && px[(y * w + x) * 4 + 3] > 40;
  const [rim, rg, ri] = mk();
  const [boots, bg, bi] = mk();
  const [halo, hg, hi] = mk();
  const [deep, dg, di] = mk();
  const put = (img: ImageData, i: number, c: RGB) => {
    img.data[i] = c[0];
    img.data[i + 1] = c[1];
    img.data[i + 2] = c[2];
    img.data[i + 3] = 255;
  };
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (!op(x, y)) continue;
      const i = (y * w + x) * 4;
      // The merge flash: his whole outline turns lilac (the edge pixels, on his own grid).
      if (!op(x + 1, y) || !op(x - 1, y) || !op(x, y - 1) || !op(x, y + 1)) put(ri, i, PAL.lilac);
      if (y < 84) continue;
      const white = near(px, i, 0xdfdae6), shade = near(px, i, 0x8980ae);
      if (!white && !shade) continue;
      put(bi, i, white ? PAL.ivory : PAL.lilac);
      put(hi, i, PAL.uv);
      put(di, i, PAL.uvDeep);
    }
  rg.putImageData(ri, 0, 0);
  bg.putImageData(bi, 0, 0);
  hg.putImageData(hi, 0, 0);
  dg.putImageData(di, 0, 0);
  derived.set(p.id, (d = { rim, boots, halo, deep }));
  return d;
}

/** His white boots under the ultraviolet light: a uvDeep halo, a violet halo, then the fluorescent pixels. */
function drawBoots(env: Env, key: SoloKey, a: number) {
  if (a <= 0) return;
  const ctx = env.ctx;
  const d = derive(env, key);
  const { x, o } = heroArgs(env, key);
  ctx.save();
  for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 1]]) drawSolo(env, key, x + dx * 1.5, GY + dy * 1.5, SC, { ...o, alpha: 0.3 * a }, d.deep);
  ctx.globalCompositeOperation = 'lighter';
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1]]) drawSolo(env, key, x + dx * 1.5, GY + dy * 1.5, SC, { ...o, alpha: 0.2 * a }, d.halo);
  drawSolo(env, key, x, GY, SC, { ...o, alpha: 0.5 * a }, d.boots);
  ctx.restore();
}

// ---------------------------------------------------------------- the keeper and the beaten four (puppets)

const PD = 2;
const DEG = Math.PI / 180;
/** Rim light for the dark-stage silhouettes: the spill of the rigs on the main-stand roof (top-right). */
const RIM = { lx: 0.6, ly: -0.8 };
/**
 * Planted keeper poses: the shared gkReady / gkSpread fold the far shin back to knee height (a heel kicked up, he reads
 * as lunging), so this shot sets both boots on the turf: crouched wide and set. The crouch crawls deeper in the slow
 * window (GK_LOW); one frame of fingers spread at 1.10.
 */
const GK_SET = P({ ...POSES.gkSpread, thighF: -22 * DEG, kneeF: 12 * DEG, footF: 6 * DEG });
const GK_READY = P({ ...POSES.gkReady, thighF: -14 * DEG, kneeF: 16 * DEG, footF: 6 * DEG });
const GK_LOW = P({ ...GK_SET, torso: 21 * DEG, thighN: 50 * DEG, kneeN: 74 * DEG, thighF: -28 * DEG, kneeF: 16 * DEG, armN: 70 * DEG, elbowN: 18 * DEG, armF: 56 * DEG, elbowF: 20 * DEG });
/** The twitch: the same crouch, both gloves flick up and open for one frame. */
const twitch = (p: Pose): Pose => ({ ...p, armN: p.armN + 10 * DEG, elbowN: p.elbowN - 10 * DEG, armF: p.armF + 10 * DEG, elbowF: p.elbowF - 10 * DEG });
const STEPS = 8;
const q = (x: number) => Math.round(clamp(x) * STEPS);

/** The keeper's pose at sim time `sim` (shot time t for the one-frame twitch): set 0..8, crawl 0..8, twitch. */
function keeperPose(sim: number, t: number): { name: string; pose: Pose } {
  const set = q(ease.inOutQuad(clamp((sim - 0.42) / 0.38)));
  if (set < STEPS) return { name: `gkSet${set}`, pose: mixPose(GK_READY, GK_SET, set / STEPS) };
  const crawl = q((sim - STOP) / 0.08);
  const pose = mixPose(GK_SET, GK_LOW, crawl / STEPS);
  if (onFrames(t, TWITCH, 1)) return { name: `gkTwitch${crawl}`, pose: twitch(pose) };
  return { name: `gkLow${crawl}`, pose };
}
/** Two short shuffles off his line, in the dark (sim time). */
function keeperX(sim: number): { x: number; lift: number } {
  let x = K_X0, lift = 0;
  for (const [t0, d] of [[0.12, -13], [0.34, -13]] as const) {
    const u = (sim - t0) / (5 / 60);
    if (u >= 1) x += d;
    else if (u >= 0) {
      x += d * ease.inOutQuad(u);
      lift = 3 * Math.sin(Math.PI * u);
    }
  }
  return { x, lift };
}

interface Down {
  name: 'kneelStumble' | 'faceDown' | 'sideTopple' | 'sitBack';
  kit: Kit;
  s: number;
  x: number;
}
/** The beaten four, far behind him on the left (puppet scale 2 s = 0.72-1.24), spread in depth and x so each comic
 *  fall reads on its own inside the reveal framing: A knelt, B face-down at the end of his slide, C on his hip after
 *  the comic split (furthest back), D sat back. */
const DOWN: Down[] = [
  { name: 'kneelStumble', kit: RIVAL_KIT, s: 0.44, x: 40 },
  { name: 'faceDown', kit: RIVAL_KIT_B, s: 0.62, x: 64 },
  { name: 'sideTopple', kit: RIVAL_KIT_C, s: 0.36, x: 104 },
  { name: 'sitBack', kit: RIVAL_KIT_D, s: 0.5, x: 146 },
];

/** Far to near (draw order). */
const DOWN_ORDER = [...DOWN].sort((a, b) => a.s - b.s);

const pc = new PuppetCache();
const hipCache = new Map<string, number>();
/** Hip height above the turf (puppet units): the lowest joint touches the ground (lying poses too). */
function hipAbove(name: string, pose: Pose): number {
  let h = hipCache.get(name);
  if (h === undefined) {
    const j = joints(pose);
    h = Math.max(j.toeN[1] + 3, j.toeF[1] + 3, j.ankleN[1] + 3, j.kneeN[1] + 5, j.handN[1] + 3, j.handF[1] + 3, j.head[1] + 12, j.neck[1] + 8);
    hipCache.set(name, h);
  }
  return h;
}

function drawKeeper(ctx: CanvasRenderingContext2D, t: number, lit: number, alpha = 1) {
  const { name, pose } = keeperPose(simT, t);
  const { x, lift } = keeperX(simT);
  const y = yOf(K_S) - lift * K_S - hipAbove(name, pose) * K_S * PD;
  pc.draw(ctx, name, KEEPER_KIT, pose, K_S, -1, x, y, PD, lit, RIM, alpha);
}

function drawDown(ctx: CanvasRenderingContext2D, alpha: number) {
  for (const f of DOWN_ORDER) {
    const y = yOf(f.s);
    ctx.fillStyle = `rgba(6,4,14,${0.35 * alpha})`;
    ctx.beginPath();
    ctx.ellipse(f.x, y - 1, 30 * f.s, 5 * f.s, 0, 0, Math.PI * 2);
    ctx.fill();
    const pose = POSES[f.name];
    pc.draw(ctx, f.name, f.kit, pose, f.s, -1, f.x, y - hipAbove(f.name, pose) * f.s * PD, PD, 1, RIM, alpha);
    // B's slide tore the turf behind him (he came in from the right): a short streak of dark divots, no glow.
    if (f.name === 'faceDown') {
      ctx.globalAlpha = 0.8 * alpha;
      for (let i = 0; i < 8; i++) {
        const x = f.x + 34 * f.s + i * 7 * f.s + ((i * 7) % 3);
        ctx.fillStyle = i % 3 === 0 ? '#3a2a1c' : '#1d4a24';
        ctx.fillRect(Math.round(x), Math.round(y - 1 + ((i * 5) % 3) - 1), 4 - (i % 2), 2);
      }
      ctx.globalAlpha = 1;
    }
  }
}

// ---------------------------------------------------------------- the stadium (far stand, pitch, goal)

const phones: { x: number; y: number; big: boolean; lilac: boolean; f: number; ph: number }[] = [];
const specks: { x: number; y: number; q: number; dark: boolean }[] = [];
let standing: HTMLCanvasElement | null = null;
function build(env: Env) {
  if (!phones.length) {
    const r = new Rng(5071);
    for (let i = 0; i < 90; i++)
      phones.push({ x: r.range(-60, 700), y: r.range(STAND_Y - 104, STAND_Y - 16), big: r.next() < 0.2, lilac: r.next() < 0.34, f: r.range(0.8, 2.1), ph: r.range(0, 6.3) });
  }
  if (!specks.length) {
    const r = new Rng(507);
    for (let i = 0; i < 640; i++) {
      const y = r.range(STAND_Y + 4, 420);
      const s = (y - HZ) / (GY - HZ);
      specks.push({ x: r.range(-80, 720), y, q: s > 1.05 && r.next() < 0.4 ? 3 : s > 0.55 ? 2 : 1, dark: r.next() < 0.55 });
    }
  }
  if (!standing) {
    // The crowd on its feet: the stand canvas with raised arms (a skin pixel two rows above some heads).
    const src = env.art.stadium.crowd;
    const cv = document.createElement('canvas');
    cv.width = src.width;
    cv.height = src.height;
    const g = cv.getContext('2d', { willReadFrequently: true })!;
    g.drawImage(src, 0, 0);
    const img = g.getImageData(0, 0, cv.width, cv.height);
    const d = img.data, W = cv.width;
    const r = new Rng(5072);
    for (let y = 3; y < 96; y++)
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        // Skin tones in the crowd canvas (red well above blue, green between): the heads.
        if (d[i] < 70 || d[i] < d[i + 2] + 40 || d[i + 1] < 30 || d[i] > 252 || d[i + 1] > 0.86 * d[i]) continue;
        if (r.next() > 0.3) continue;
        const j = ((y - 2) * W + x) * 4;
        d[j] = d[i];
        d[j + 1] = d[i + 1];
        d[j + 2] = d[i + 2];
        d[j + 3] = 255;
      }
    g.putImageData(img, 0, 0);
    standing = cv;
  }
}

/** Night over the roof, the roof edge, the far stand and its boards; `veil` sinks it further in the dark. */
function drawStands(env: Env, lit: number, veil: number) {
  const ctx = env.ctx;
  const top = STAND_Y - 110;
  const g = ctx.createLinearGradient(0, top - 120, 0, top);
  g.addColorStop(0, '#05030a');
  g.addColorStop(1, '#170c28');
  ctx.fillStyle = g;
  ctx.fillRect(-120, top - 300, 880, 300);
  ctx.fillStyle = '#07050f';
  ctx.fillRect(-120, top - 12, 880, 12);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(lit > 0 && standing ? standing : env.art.stadium.crowd, CROWD_X, top);
  // The board strip (the canvas's own LED boards are not this special's colours): dark, lit with the stadium.
  ctx.fillStyle = '#05040b';
  ctx.fillRect(-120, STAND_Y - 12, 880, 12);
  const cols = ['#c81e2a', '#f6f0df', '#7a4dff', '#f6f0df'];
  for (let i = -2; i < 10; i++) {
    const x = i * 80 + 4;
    ctx.fillStyle = '#120a1e';
    ctx.fillRect(x, STAND_Y - 9, 60, 6);
    if (lit > 0) {
      ctx.globalAlpha = 0.8 * lit;
      ctx.fillStyle = cols[((i % 4) + 4) % 4];
      ctx.fillRect(x, STAND_Y - 9, 60, 6);
      ctx.fillStyle = '#05040b';
      for (let k = 0; k < 6; k++) ctx.fillRect(x + 4 + k * 9, STAND_Y - 8, 4, 4);
      ctx.globalAlpha = 1;
    }
  }
  if (veil > 0) {
    const [r, gg, b] = stage.dimColor(veil);
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = `rgb(${r | 0},${gg | 0},${b | 0})`;
    ctx.fillRect(-120, top - 300, 880, STAND_Y - top + 300);
    ctx.globalCompositeOperation = 'source-over';
  }
}

/** A line on the turf at constant X from depth s0 to s1 (tapered: thinner far away). */
function lineX(ctx: CanvasRenderingContext2D, X: number, s0: number, s1: number, w = 2.4) {
  const [x0, y0] = gp(X, s0), [x1, y1] = gp(X, s1);
  const a = Math.max(0.6, w * s0) / 2, b = Math.max(0.6, w * s1) / 2;
  ctx.beginPath();
  ctx.moveTo(x0 - a, y0);
  ctx.lineTo(x0 + a, y0);
  ctx.lineTo(x1 + b, y1);
  ctx.lineTo(x1 - b, y1);
  ctx.closePath();
  ctx.fill();
}
/** A line on the turf at constant depth s from X0 to X1 (horizontal on screen, foreshortened thickness). */
function lineS(ctx: CanvasRenderingContext2D, s: number, X0: number, X1: number) {
  const [x0, y] = gp(X0, s), [x1] = gp(X1, s);
  const th = Math.max(0.7, 1.9 * s * s);
  ctx.fillRect(Math.min(x0, x1), y - th / 2, Math.abs(x1 - x0), th);
}
/**
 * The markings in view: the far touchline, the goal line and the six-yard box. The penalty box's own lines stay out
 * of the picture (its eighteen-yard line would cut diagonally behind him and through the beaten four).
 */
function pitchLines(ctx: CanvasRenderingContext2D) {
  const a0 = ctx.globalAlpha;
  ctx.globalAlpha = a0 * 0.55;
  lineS(ctx, S_FT, -3000, 4000);
  ctx.globalAlpha = a0;
  lineX(ctx, XG, S_FT, 1.5);
  lineX(ctx, X6, S_6, 1.5);
  lineS(ctx, S_6, X6, XG);
}
/** The mark: the penalty spot under the ball's rest. */
function spotMark(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.ellipse(SPOT_X, GY - 0.5, 4, 1.4, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawPitch(env: Env) {
  const ctx = env.ctx;
  const left = -120, right = 760, bottom = 430;
  const g = ctx.createLinearGradient(0, STAND_Y, 0, bottom);
  g.addColorStop(0, '#173f22');
  g.addColorStop(0.2, '#205a2b');
  g.addColorStop(0.62, '#2a7a36');
  g.addColorStop(1, '#2c8238');
  ctx.fillStyle = g;
  ctx.fillRect(left, STAND_Y, right - left, bottom - STAND_Y);
  // Mowing stripes: bands of constant X converging on the vanishing point (clipped at the far touchline).
  const SW = 120;
  const sB = (bottom - HZ) / (GY - HZ);
  ctx.save();
  ctx.beginPath();
  ctx.rect(left, STAND_Y, right - left, bottom - STAND_Y);
  ctx.clip();
  ctx.fillStyle = 'rgba(150,230,140,0.07)';
  ctx.beginPath();
  for (let k = -10; k <= 12; k += 2) {
    const [xa] = gp(k * SW, sB), [xb] = gp((k + 1) * SW, sB);
    ctx.moveTo(VX, HZ);
    ctx.lineTo(xa, bottom);
    ctx.lineTo(xb, bottom);
    ctx.closePath();
  }
  ctx.fill();
  ctx.restore();
  // The far side recedes into the stand's shadow.
  const hz = ctx.createLinearGradient(0, STAND_Y, 0, STAND_Y + 44);
  hz.addColorStop(0, 'rgba(14,10,26,0.55)');
  hz.addColorStop(1, 'rgba(14,10,26,0)');
  ctx.fillStyle = hz;
  ctx.fillRect(left, STAND_Y, right - left, 44);
  for (const p of specks) {
    ctx.fillStyle = p.dark ? 'rgba(16,52,24,0.55)' : 'rgba(120,196,100,0.22)';
    ctx.fillRect(p.x, p.y, p.q, Math.max(1, p.q - 1));
  }
  ctx.fillStyle = 'rgba(236,242,250,0.8)';
  pitchLines(ctx);
  spotMark(ctx);
}

/** Goal corners: post foot at the far and near post depths, the back of the net, the post heights. */
function goalPts() {
  const [fx, fy] = gp(XG, S_FAR), [nx, ny] = gp(XG, S_NEAR);
  const [bfx, bfy] = gp(XG + GOAL_D, S_FAR), [bnx, bny] = gp(XG + GOAL_D, S_NEAR);
  return { fx, fy, nx, ny, bfx, bfy, bnx, bny, hF: GOAL_H * S_FAR, hN: GOAL_H * S_NEAR };
}
/** The net (side panels, roof and back, lower at the back) and the far post: behind the keeper. */
function drawGoalBack(ctx: CanvasRenderingContext2D, fluoro = 0) {
  const g = goalPts();
  ctx.save();
  ctx.globalAlpha = fluoro ? 0.24 * fluoro : 0.32;
  ctx.strokeStyle = fluoro ? HEX.lilac : '#d8dde8';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  for (let i = 0; i <= 8; i++) {
    const u = i / 8;
    const x0 = lerp(g.fx, g.nx, u), y0 = lerp(g.fy - g.hF, g.ny - g.hN, u);
    const x1 = lerp(g.bfx, g.bnx, u), y1 = lerp(g.bfy - g.hF * 0.7, g.bny - g.hN * 0.7, u);
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x1, lerp(g.bfy, g.bny, u));
  }
  for (const [px, py, bx, by, h] of [[g.fx, g.fy, g.bfx, g.bfy, g.hF], [g.nx, g.ny, g.bnx, g.bny, g.hN]] as const)
    for (let j = 0; j <= 6; j++) {
      const v = j / 6;
      ctx.moveTo(px, py - h * (1 - v));
      ctx.lineTo(bx, by - h * 0.7 * (1 - v));
    }
  for (let j = 1; j <= 5; j++) {
    const v = j / 6;
    ctx.moveTo(g.bfx, lerp(g.bfy - g.hF * 0.7, g.bfy, v));
    ctx.lineTo(g.bnx, lerp(g.bny - g.hN * 0.7, g.bny, v));
  }
  ctx.stroke();
  ctx.restore();
  post(ctx, g.fx, g.fy, g.hF, S_FAR, fluoro);
}
/** The near post and the crossbar: in front of the keeper. */
function drawGoalFront(ctx: CanvasRenderingContext2D, fluoro = 0) {
  const g = goalPts();
  ctx.save();
  ctx.fillStyle = fluoro ? HEX.lilac : '#eef0f6';
  ctx.globalAlpha = fluoro ? 0.45 * fluoro : 1;
  const w0 = 12 * S_FAR, w1 = 12 * S_NEAR;
  ctx.beginPath();
  ctx.moveTo(g.fx, g.fy - g.hF);
  ctx.lineTo(g.nx, g.ny - g.hN);
  ctx.lineTo(g.nx, g.ny - g.hN + w1);
  ctx.lineTo(g.fx, g.fy - g.hF + w0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  post(ctx, g.nx, g.ny, g.hN, S_NEAR, fluoro);
}
function post(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, s: number, fluoro: number) {
  const w = 13 * s;
  ctx.save();
  if (fluoro) {
    ctx.globalAlpha = 0.45 * fluoro;
    ctx.fillStyle = HEX.lilac;
    ctx.fillRect(x - w / 2, y - h, w, h);
  } else {
    ctx.fillStyle = '#eef0f6';
    ctx.fillRect(x - w / 2, y - h, w, h);
    ctx.fillStyle = 'rgba(120,128,160,0.55)';
    ctx.fillRect(x + w / 6, y - h, w / 3, h);
  }
  ctx.restore();
}

/** Phone lights in the dark stand: steady, twinkling slowly (±30%). Light sources: drawn after the dim. */
function drawPhones(ctx: CanvasRenderingContext2D, t: number, a: number) {
  if (a <= 0) return;
  for (const p of phones) {
    const k = a * (1 + 0.3 * Math.sin(t * p.f * 2.4 + p.ph));
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, glowOf(p.lilac ? PAL.lilac : PAL.ivory), p.x + 0.5, p.y + 0.5, p.big ? 4.5 : 3.2, 0.3 * k);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = clamp(0.85 * k);
    ctx.fillStyle = p.lilac ? HEX.lilac : HEX.ivory;
    ctx.fillRect(p.x, p.y, p.big ? 2 : 1, p.big ? 2 : 1);
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- light levels and the camera

/** How many floodlight banks are back on (0-3): one per 16th from 1.60. */
const banks = (t: number) => LIGHTS.filter((b) => t >= b - 1e-6).length;
/** Stage dim outside the pools: the stage (0.8), deeper at the stop (0.85), then the floodlights in three steps. */
const dimAt = (t: number) => [t < STOP - 1e-6 ? 0.8 : 0.85, 0.45, 0.15, 0][banks(t)];
/** How much of the stage is left (1 in the dark, 0 with the floodlights on): beams, pools, glows, phone lights. */
const stageK = (t: number) => Math.min(1, dimAt(t) / 0.8);

/** The keeper's lamp: 60% on its first frame, then full; the iris opens 0.82 -> 1 over 4 frames. */
const kSpotK = (t: number) => (t < KEEPER_ON - 1e-6 ? 0 : t < KEEPER_ON + 1 / 60 - 1e-6 ? 0.6 : 1);
const kSpotOpen = (t: number) => lerp(0.82, 1, ease.outBack(clamp((t - KEEPER_ON) / (4 / 60))));

/** Beat-snap keys (camera centre x / y, zoom): hold, snap on the stop, snap back and up for the reveal. */
function camKeys(env: Env): CamKey[] {
  // 0.80: zoom 1.08 about his chest at the stop (it stays where it is on screen).
  const px = heroX('ST2') + SC * soloPic(env, 'ST2').anchor('pelvis')[0] + 4, py = GY - 92;
  const z = 1.08;
  return [
    [0, VW / 2, VH / 2, 1],
    [STOP, px - (px - VW / 2) / z, py - (py - VH / 2) / z, z],
    [LIGHTS[0], VW / 2, VH / 2 + 44, 1],
  ];
}
let KEYS: CamKey[] = [[0, VW / 2, VH / 2, 1]];
const view = { x: VW / 2, y: VH / 2, z: 1 };
const toScreen = (x: number, y: number): [number, number] => [(x - view.x) * view.z + VW / 2, (y - view.y) * view.z + VH / 2];

// ---------------------------------------------------------------- the HUD: eye panel, title, card

/** The bookend: the cut-in's soft oval pool, 60 px tall across the top third, with his eyes on the keeper (G2). */
const PANEL = { x: VW / 2, y: 54, rx: 206, ry: 26, soft: 14, scale: 4 };
let panelCv: HTMLCanvasElement | null = null;
function panelLayer(env: Env): HTMLCanvasElement {
  const S = env.S;
  const w = Math.ceil((PANEL.rx + PANEL.soft) * 2 * S) + 4, h = Math.ceil((PANEL.ry + PANEL.soft) * 2 * S) + 4;
  if (!panelCv) panelCv = document.createElement('canvas');
  if (panelCv.width !== w || panelCv.height !== h) {
    panelCv.width = w;
    panelCv.height = h;
  }
  return panelCv;
}
function eyePanel(env: Env, t: number) {
  const open = t - CHIN;
  if (open < -1e-6 || t >= LIGHTS[0] - 1e-6) return;
  // It opens like an eyelid on the beat (half open on its first frame, full by the fifth) and irises shut over the 3
  // frames before the floodlights, so "1 ON 1" takes the top third on the downbeat.
  const k = ease.outCubic(clamp((open + 1 / 60) / (5 / 60))) * ease.outQuad(clamp((LIGHTS[0] - t) / (3 / 60)));
  const ry = PANEL.ry * k;
  if (ry <= 0.5) return;
  const S = env.S;
  const cv = panelLayer(env);
  const g = cv.getContext('2d')!;
  const ox = PANEL.x - PANEL.rx - PANEL.soft - 2 / S, oy = PANEL.y - PANEL.ry - PANEL.soft - 2 / S;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-over';
  g.globalAlpha = 1;
  g.clearRect(0, 0, cv.width, cv.height);
  g.setTransform(S, 0, 0, S, -ox * S, -oy * S);
  // The pool's light: an ivory core where his eyes are, lilac, ultraviolet, uvDeep at the rim.
  const R = PANEL.rx + PANEL.soft;
  g.save();
  g.translate(PANEL.x, PANEL.y);
  g.scale(1, Math.max(ry, 1) / PANEL.rx);
  const lg = g.createRadialGradient(0, 0, 0, 0, 0, R);
  lg.addColorStop(0, 'rgba(246,240,223,1)');
  lg.addColorStop(0.28, 'rgba(201,182,255,0.95)');
  lg.addColorStop(0.62, 'rgba(122,77,255,0.85)');
  lg.addColorStop(1, 'rgba(42,22,96,0.9)');
  g.fillStyle = lg;
  g.fillRect(-R, -R, R * 2, R * 2);
  g.restore();
  // His eyes (Glance G2: both irises in the screen-right corner, on the keeper), nearest-neighbour x4.
  const pic = soloPic(env, 'G2');
  const [ex, ey] = pic.anchor('eye');
  const sc = PANEL.scale;
  g.imageSmoothingEnabled = false;
  g.drawImage(pic.img, Math.round(PANEL.x - ex * sc), Math.round(PANEL.y - ey * sc), pic.w * sc, pic.h * sc);
  // Warm key from his own spot (top-right), a violet bounce from the dark (bottom-left).
  g.globalCompositeOperation = 'source-atop';
  const kl = g.createLinearGradient(PANEL.x + 120, PANEL.y - 40, PANEL.x - 80, PANEL.y + 40);
  kl.addColorStop(0, 'rgba(246,240,223,0.16)');
  kl.addColorStop(0.6, 'rgba(246,240,223,0)');
  kl.addColorStop(1, 'rgba(122,77,255,0.14)');
  g.fillStyle = kl;
  g.fillRect(PANEL.x - R, PANEL.y - R, R * 2, R * 2);
  // The soft oval edge (never an outline).
  g.globalCompositeOperation = 'destination-in';
  g.save();
  g.translate(PANEL.x, PANEL.y);
  g.scale(1, (ry + PANEL.soft * 0.5) / (PANEL.rx + PANEL.soft * 0.5));
  const mg = g.createRadialGradient(0, 0, 0, 0, 0, R);
  mg.addColorStop(0, 'rgba(0,0,0,1)');
  mg.addColorStop(PANEL.rx / R, 'rgba(0,0,0,1)');
  mg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = mg;
  g.fillRect(-R, -R, R * 2, R * 2);
  g.restore();
  // The squashed oval's soft zone is only ~2 px tall: a vertical falloff of its own (14 px) so the hair and the collar
  // fade out instead of being cut by a horizontal edge.
  const vg = g.createLinearGradient(0, PANEL.y - ry - 8, 0, PANEL.y + ry + 8);
  const e = Math.min(0.5, 14 / (2 * ry + 16));
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(e, 'rgba(0,0,0,1)');
  vg.addColorStop(1 - e, 'rgba(0,0,0,1)');
  vg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = vg;
  g.fillRect(PANEL.x - R, PANEL.y - R, R * 2, R * 2);
  g.globalCompositeOperation = 'source-over';
  const ctx = env.ctx;
  // A uvDeep halo under the panel, so its violet never sits straight on the dark.
  ctx.save();
  drawGlow(ctx, glowOf(PAL.uvDeep), PANEL.x, PANEL.y, PANEL.rx + 34, 0.85, 1, (ry + 22) / (PANEL.rx + 34));
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.drawImage(cv, Math.round(ox * S), Math.round(oy * S));
  ctx.restore();
  // 1.40: one lilac glint in his eye (4 frames, decaying), on the shing.
  const gl = t - GLINT;
  if (gl >= -1e-6 && gl < 4 / 60) {
    const [rx, rY] = pic.anchor('eyeR');
    const a = 1 - gl / (4 / 60);
    glint(ctx, PANEL.x + (rx - ex) * sc + 2, PANEL.y + (rY - ey) * sc - 2, 16 + 10 * (1 - a), a, 0.3 + gl * 3);
  }
}

/** A four-point star of light: ivory spikes over a lilac glow on a uvDeep halo (no cyan anywhere). */
function glint(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: number, rot = 0) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  drawGlow(ctx, glowOf(PAL.uvDeep), x, y, r * 0.9, 0.6 * a);
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(ctx, glowOf(PAL.lilac), x, y, r * 0.75, 0.75 * a);
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = clamp(a);
  ctx.fillStyle = HEX.ivory;
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.1, 0);
    ctx.lineTo(-r * 0.1, 0);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** The name card, matching the other specials: SPOTLIGHT SOLO (left), No.10 · SPECIAL DRIBBLE, 4 DEFENDERS BEATEN. */
function nameCard(ctx: CanvasRenderingContext2D, t: number) {
  const card = ease.outCubic(clamp(t / 0.35));
  if (card <= 0) return;
  const y = lerp(VH + 40, 286, card);
  ctx.fillStyle = 'rgba(22,10,38,0.9)';
  ctx.fillRect(0, y - 6, VW, VH - (y - 6) + 2);
  ctx.fillStyle = HEX.uv;
  ctx.fillRect(0, y - 6, VW, 3);
  ctx.fillStyle = HEX.lilac;
  ctx.fillRect(0, y + 53, VW, 3);
  slamTitle(ctx, 'SPOTLIGHT SOLO', 40, y + 47, 30, t, { stagger: 0.02, align: 'left', fill: HEX.ivory, fill2: HEX.lilac, stroke: HEX.uv, outer: HEX.plum });
  pixelText(ctx, 'No.10  ·  SPECIAL DRIBBLE', 40, y + 1, 10, HEX.lilac, 'left', HEX.plum);
  pixelText(ctx, '4 DEFENDERS BEATEN', VW - 40, y + 20, 14, HEX.ivory, 'right', HEX.plum);
}

// ---------------------------------------------------------------- the shot

export const shotOnTheMark: Shot = {
  name: 'On the mark',
  dur: DUR,
  seed: 507,
  rate: RATE[7],
  prepare(env) {
    const keys = [...new Set([...seq.map(([, k]) => k), ...TRAIL.map(([, k]) => k)])] as SoloKey[];
    warmSolo(env, [...keys, 'G2'], { ghosts: true });
    for (const k of keys) derive(env, k);
    build(env);
    KEYS = camKeys(env);
    panelLayer(env);
    trailLayer(env.ctx);
    for (const c of [PAL.ivory, PAL.lilac, PAL.uv, PAL.uvDeep, [255, 255, 255]] as RGB[]) glowOf(c);
    // Every puppet picture this shot can show (no live renders): the keeper's set / crawl / twitch poses in colour and
    // as the dark-stage silhouette, and the beaten four.
    for (let i = 0; i <= STEPS; i++) {
      const low = mixPose(GK_SET, GK_LOW, i / STEPS);
      for (const [name, pose] of [[`gkSet${i}`, mixPose(GK_READY, GK_SET, i / STEPS)], [`gkLow${i}`, low], [`gkTwitch${i}`, twitch(low)]] as const) {
        pc.get(name, KEEPER_KIT, pose, K_S, -1);
        pc.get(name, KEEPER_KIT, pose, K_S, -1, RIM);
      }
    }
    for (const f of DOWN) pc.get(f.name, f.kit, POSES[f.name], f.s, -1);
  },
  init(env) {
    env.sfx.clearBus();
    build(env);
    KEYS = camKeys(env);
    spin = new BallSpin();
    spin.rotate(0.3, 1, 0.2, 0.9);
    prevBall = ballX(0);
    spot.snap(pelvisX(env, 0) + 22, GY - 100);
    simT = 0;
    fired = [false, false, false, false];
    const c = beatCam(KEYS, 0);
    env.cam.set(c.x, c.y, c.zoom, 0);
  },
  update(env, t, dt) {
    env.sfx.hum(HUM[7](t));
    simT += dt;
    // Ball spin locked to its roll (r 12 at x2); dead under the sole from the stop.
    const bx = ballX(t);
    if (bx !== prevBall) spin.rotate(0, 0, 1, (bx - prevBall) / BALL_R);
    prevBall = bx;
    // The operator follows his pelvis (stepped with the frames) a little ahead, so the ball rolls inside the light.
    spot.update(pelvisX(env, t) + 22, GY - 100, dt);
    // Turf: a puff at each footfall, the brake's heel spray, a breath of dust under the sole (it hangs in the slow
    // window and freezes with the world).
    const once = (i: number, at: number) => !fired[i] && t >= at - 1e-6 && (fired[i] = true);
    FOOTFALL.forEach((at, i) => {
      if (!once(i, at)) return;
      const toe = heroX(keyAt(at)) + SC * (CONTACT[keyAt(at)] ?? 74) - 4;
      for (let n = 0; n < 4; n++) {
        const side = n % 2 ? 1 : -1;
        env.parts.spawn({
          kind: PK.Smoke, x: toe + env.rng.range(-6, 4), y: GY - 2, vx: side * env.rng.range(20, 60), vy: -env.rng.range(6, 22),
          drag: 3, max: env.rng.range(0.3, 0.5), s0: 3, s1: env.rng.range(7, 11), ramp: 'dust', r0: 0.2, r1: 1, a0: 0.26, a1: 0, add: false, layer: 1,
        });
      }
    });
    if (once(2, BRAKE)) {
      const heel = heroX('ST1') + SC * 78;
      for (let n = 0; n < 5; n++) {
        const a = env.rng.range(0.35, 1.1), s = env.rng.range(90, 200);
        env.parts.spawn({
          kind: PK.Debris, x: heel + env.rng.range(-3, 5), y: GY - 2, vx: Math.cos(a) * s, vy: -Math.sin(a) * s, ay: 900, drag: 0.6,
          vrot: env.rng.range(-12, 12), max: env.rng.range(0.14, 0.2), s0: env.rng.range(1.5, 2.4), s1: 1.4, ramp: 'grass', r0: env.rng.range(0, 0.35), r1: env.rng.range(0.2, 0.5), a0: 1, a1: 1, add: false, layer: 1,
        });
      }
      for (let n = 0; n < 4; n++)
        env.parts.spawn({
          kind: PK.Smoke, x: heel + env.rng.range(-4, 8), y: GY - 2, vx: env.rng.range(30, 90), vy: -env.rng.range(8, 26),
          drag: 3, max: env.rng.range(0.35, 0.55), s0: 3, s1: env.rng.range(8, 13), ramp: 'dust', r0: 0.2, r1: 1, a0: 0.3, a1: 0, add: false, layer: 1,
        });
    }
    if (once(3, STOP)) {
      for (let n = 0; n < 6; n++) {
        const side = n % 2 ? 1 : -1;
        env.parts.spawn({
          kind: PK.Smoke, x: SPOT_X + side * env.rng.range(6, 14), y: GY - 1, vx: side * env.rng.range(30, 80), vy: -env.rng.range(4, 18),
          drag: 2.5, max: env.rng.range(0.5, 0.8), s0: 2, s1: env.rng.range(6, 10), ramp: 'dust', r0: 0.1, r1: 0.9, a0: 0.3, a1: 0, add: false, layer: 1,
        });
      }
    }
  },
  render(env, t) {
    const ctx = env.ctx;
    const c = beatCam(KEYS, t);
    view.x = c.x;
    view.y = c.y;
    view.z = c.zoom;
    env.cam.set(c.x, c.y, c.zoom, 0);
    const key = keyAt(t);
    const nb = banks(t);
    const lit = nb > 0;
    const dim = dimAt(t);
    const sk = stageK(t);
    const kOn = t >= KEEPER_ON - 1e-6;
    const kLamp = kSpotK(t);
    const kOpen = kOn ? kSpotOpen(t) : 1;
    const bX = ballX(t);
    // The touches are drum hits: the ball's glow kicks and decays over an 8th.
    let hit = 0;
    for (const tt of [...TOUCH, STOP]) if (t >= tt - 1e-6 && t < tt + 0.2) hit = Math.max(hit, 1 - (t - tt) / 0.2);
    hit *= hit;

    // ---- the world (under the stage dim)
    env.world();
    drawStands(env, nb / 3, lit ? 0 : 0.6);
    drawPitch(env);
    if (lit) drawDown(ctx, 1);
    drawGoalBack(ctx);
    const kx = keeperX(simT).x;
    ctx.fillStyle = 'rgba(6,4,14,0.4)';
    ctx.beginPath();
    ctx.ellipse(kx - 2, yOf(K_S), 30 * K_S, 5 * K_S, 0, 0, Math.PI * 2);
    ctx.fill();
    drawKeeper(ctx, t, 1);
    drawGoalFront(ctx);
    // His contact shadow and the ball's: short and straight under them (the light is above).
    const pX = pelvisX(env, t);
    ctx.fillStyle = 'rgba(8,4,16,0.45)';
    ctx.beginPath();
    ctx.ellipse(pX + 8, GY - 0.5, 36, 5, 0, 0, Math.PI * 2);
    ctx.ellipse(bX, GY - 0.5, 11, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // ---- the stage dim: his pool, and from 1.00 the keeper's
    const pools: StagePool[] = [];
    // The beat flare on the final hit: his pool brightens and grows for 2 frames (local, never a full-frame flash).
    const hfl = stage.flare(t, STOP);
    const [hx, hy] = toScreen(spot.x, GY - 100);
    pools.push({ x: hx, y: hy, rx: 96 * view.z * hfl.size, ry: 136 * view.z * hfl.size, soft: 40 * view.z, gain: 1 });
    if (kOn) {
      const [sx, sy] = toScreen(kx, yOf(K_S) - 70);
      pools.push({ x: sx, y: sy, rx: 70 * view.z * kOpen, ry: 80 * view.z * kOpen, soft: 34 * view.z, gain: kLamp });
    }
    env.screen();
    stage.dim(ctx, dim, pools);

    // ---- light sources and fluorescent accents
    env.world();
    drawPhones(ctx, t, sk);
    if (sk > 0) {
      ctx.save();
      ctx.globalAlpha = 0.3 * sk;
      ctx.fillStyle = HEX.lilac;
      pitchLines(ctx);
      ctx.restore();
      drawGoalBack(ctx, sk);
      drawGoalFront(ctx, sk);
      // The mark: the penalty spot glows faintly lilac on the dark turf (a little more as the ball rolls onto it).
      const close = clamp(1 - Math.abs(bX - SPOT_X) / 90);
      ctx.save();
      drawGlow(ctx, glowOf(PAL.uvDeep), SPOT_X, GY - 1, 16, 0.7 * sk);
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.lilac), SPOT_X, GY - 1, 10 + 4 * close, (0.35 + 0.25 * close) * sk, 1, 0.45);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = (0.65 + 0.35 * close) * sk;
      ctx.fillStyle = HEX.lilac;
      spotMark(ctx);
      ctx.restore();
    }
    // The keeper waits in the dark: a plum silhouette with lilac rims, crossing into colour as his lamp strikes.
    const kSil = 1 - clamp((t - KEEPER_ON) / (3 / 60));
    if (kSil > 0 && sk > 0) drawKeeper(ctx, t, 0, 0.9 * kSil);

    // ---- the follow-spots: beams from the main-stand roof, floor pools
    const fl = stage.flare(t, KEEPER_ON);
    if (sk > 0) {
      env.screen();
      const [px, py] = toScreen(spot.x, GY);
      stage.beam(ctx, 586, -30, px, py, 26, 150 * view.z * hfl.size, 0.17 * sk * hfl.gain, { t, seed: 7, motes: 26 });
      if (kOn) {
        const [qx, qy] = toScreen(kx, yOf(K_S));
        stage.beam(ctx, 58, -30, qx, qy, 22, 104 * view.z * kOpen, 0.16 * sk * kLamp * fl.gain, { t, seed: 17, motes: 18 });
      }
      env.world();
      stage.floorPool(ctx, spot.x, GY - 1, 74 * hfl.size, 12.5 * hfl.size, 0.35 * sk * hfl.gain);
      if (kOn) stage.floorPool(ctx, kx - 4, yOf(K_S) - 0.5, 54 * kOpen * fl.size, 9 * kOpen * fl.size, 0.32 * sk * kLamp * fl.gain);
    }

    // ---- the floodlights return: three banks over the far roof, one per 16th (light sources, above the frame)
    if (lit) {
      env.screen();
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const BX = [96, 320, 544];
      for (let b = 0; b < nb; b++) {
        const pop = t - LIGHTS[b] < 2 / 60 ? 1.25 : 1;
        drawGlow(ctx, glowOf(PAL.ivory), BX[b], -26, 170, 0.2 * pop);
        drawGlow(ctx, glowOf([255, 255, 255]), BX[b], -26, 60, 0.32 * pop);
      }
      ctx.restore();
      env.world();
    }

    // ---- the performance trail: exposures where he WAS, coming home on the 16ths. They are drawn into one layer at
    // full strength and composited once, so overlapping exposures never stack into a slab: one even violet print,
    // each exposure delineated by its own lilac leading rim (a chronophotograph).
    let merge = false;
    const active = TRAIL.filter(([t0, , home]) => t >= t0 - 1e-6 && t < home - 1e-6);
    for (const [, , home] of TRAIL) if (onFrames(t, home, 1)) merge = true;
    if (active.length) {
      const ctx0 = env.ctx, tl = trailLayer(ctx0), tg = tl.getContext('2d')!;
      tg.setTransform(1, 0, 0, 1, 0, 0);
      tg.globalAlpha = 1;
      tg.globalCompositeOperation = 'source-over';
      tg.clearRect(0, 0, tl.width, tl.height);
      tg.setTransform(ctx0.getTransform());
      tg.imageSmoothingEnabled = false;
      env.ctx = tg;
      for (const [, k, home] of active) {
        const x0 = heroX(k);
        const u = (t - (home - RUSH)) / RUSH;
        if (u < -1e-6) {
          drawGhost(env, k, x0, 1);
          continue;
        }
        // The rush: accelerating into him over a 16th, two fainter copies behind it (the speed reads as a smear of
        // light). Frame n of 6 sits at ease-in (n + 1) / 6.5 of the way; the 16th it lands on, it is gone into him.
        const xh = heroX(key);
        const n = Math.min(5, Math.max(0, Math.round(u * 6)));
        const f = (v: number) => lerp(x0, xh, ease.inQuad(clamp(v / 6.5)));
        drawGhost(env, k, f(n - 1.2), 0.16 / 0.6);
        drawGhost(env, k, f(n - 0.5), 0.3 / 0.6);
        drawGhost(env, k, f(n + 1), 1);
      }
      env.ctx = ctx0;
      ctx0.save();
      ctx0.setTransform(1, 0, 0, 1, 0, 0);
      ctx0.globalAlpha = TRAIL_A;
      ctx0.globalCompositeOperation = 'source-over';
      ctx0.drawImage(tl, 0, 0);
      ctx0.restore();
    }

    // ---- No.10 in full colour, his fluorescent boots, the merge flash; the ball
    // From the stop the ball goes under him, lifted 1 px (the contact shadow hides it), so the sole's bottom row always
    // overlaps it: at the 1.08 snap zoom the tangent rows would otherwise open a 1 px line of grass.
    const glintBall = onFrames(t, TRAIL[0][2], 1);
    const ballGlow = (0.8 + 0.3 * hit) * sk + 0.15 + (glintBall ? 0.5 : 0);
    const under = t >= STOP - 1e-6;
    if (under) drawBall(env, spin, bX, BALL_Y - 1, BALL_R, 1, 0, ballGlow, 'blacklight');
    drawHero(env, key);
    drawBoots(env, key, 0.85 * sk);
    if (merge) drawHero(env, key, 1, derive(env, key).rim);
    if (!under) drawBall(env, spin, bX, BALL_Y, BALL_R, 1, 0, ballGlow, 'blacklight');
    if (glintBall) glint(ctx, bX + 5, BALL_Y - 6, 14, 1, 0.4);
    env.parts.draw(ctx, 1);

    // ---- HUD
    env.screen();
    if (t < LIGHTS[0] - 1e-6) fourCount(ctx, padsFor(7), t);
    eyePanel(env, t);
    if (lit) lampTitle(ctx, ['1 ', 'ON ', '1'], VW / 2, 76, 48, t, LIGHTS);
    if (t >= CARD - 1e-6) nameCard(ctx, t - CARD);
    soloGrade(env.fx);
    // Fade to [8,4,14] over the last 0.35 s: the result view fades up from it.
    if (t > FADE_T) {
      env.fx.flash = ease.inQuad(clamp((t - FADE_T) / (DUR - FADE_T - 1 / 60)));
      env.fx.flashColor = FADE;
    }
  },
  cues: [
    // 0.00 (beat 18): the right-lace touch; 0.40 (beat 19): the left-foot touch onto the spot.
    { at: TOUCH[0], fn: (env) => env.sfx.tom(TOMS.D3) },
    { at: FOOTFALL[0], fn: (env) => env.sfx.scuff(0.1) },
    { at: TOUCH[1], fn: (env) => env.sfx.tom(TOMS.C3) },
    { at: FOOTFALL[1], fn: (env) => env.sfx.scuff(0.1) },
    // 0.60 / 0.70: the snare drag into the stop (the brake heel scuffs the turf).
    { at: BRAKE, fn: (env) => (env.sfx.snare(0.4), env.sfx.scuff(0.16)) },
    { at: onGrid(0.7, 'drag 2'), fn: (env) => env.sfx.snare(0.55) },
    // 0.80 (beat 20, the ONE): SOLE STOP, the final hit.
    { at: STOP, fn: (env) => (env.sfx.kickDrum(1.0), env.sfx.crash(1.0), env.sfx.boom(0.5), env.cam.hit(0.15)) },
    // 0.86: the drummer grabs the cymbal; the crowd hushes. Only the lamp hum is left (a musical stop, no filter).
    // The duck releases exactly on the ONE at 1.60, so the exhale's roar starts with the floodlights.
    { at: 0.86, fn: (env) => (env.sfx.choke(), env.sfx.duck(0.95, LIGHTS[0] - 0.86)) },
    // 1.00: the keeper's spot clunks on.
    { at: KEEPER_ON, fn: (env) => env.sfx.spotOn(0.8) },
    { at: GLINT, fn: (env) => env.sfx.shing(1.1) },
    // 1.60 (beat 22): the stadium exhales; the lamp hum stops (HUM[7]). duck(0) snaps the bus open on the ONE (40 ms,
    // instead of the scheduled 150 ms release), so the roar rises with the floodlights at crowd()'s own attack.
    { at: LIGHTS[0], fn: (env) => (env.sfx.duck(0), env.sfx.lightsOn(1.0), env.sfx.kickDrum(0.8), env.sfx.crash(1.0), env.sfx.crowd(3, 0.5)) },
    { at: LIGHTS[1], fn: (env) => env.sfx.lightsOn(0.8) },
    { at: LIGHTS[2], fn: (env) => (env.sfx.lightsOn(0.7), env.sfx.boom(0.4), env.sfx.shing(1.0)) },
  ],
};
