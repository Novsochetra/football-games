// SHOT 4 · NEEDLE'S EYE (2.4 s): the ball scene as ONE manga page (SPEC.md §4).
//
// No.10 is off screen: the ball is the star. Three slanted panels on warm paper (PAGE in common.ts), each a LOCKED
// camera that the ball crosses (never a tracking rail), with a 0.12 s page-pan between them:
//   panel 1 (0.00-0.68) low side view at ball height: D1's poke tackle; at 0.42 his sole sweeps 3 px over the ball, a
//            vertical needle eye opens between sole and turf, freeze, SHK!; he swipes air and sprawls onto his hip.
//   panel 2 (0.80-1.40) low camera behind the ball (drawDownPitch): D2 and D3 lunge in from both sides; at 1.05 their
//            boots are one ball-width apart, the ball alone in a flat almond eye between them, the camera pushes in 8 %;
//            on release the boots clack one frame behind the ball (KLAK!, 3 px shake) and both stumble.
//   panel 3 (1.52-2.10) raised near-side view: the ball enters deep at the upper left still drifting to the far side,
//            then the sidespin curls it down toward the lens round D4's trailing heel (1.75, diagonal eye, SWSH) and
//            out at the bottom right; the whole curl stays on screen as the thread's one long bend.
//   2.10-2.40 the whole page (zoom 1 -> 0.5): three frozen ink panels, one jade running stitch through all three and
//            across both gutters, three fading eyes strung on it, three defenders down. One-frame paper flash, hard cut.
//
// How it is built
//   - Everything on screen is a pure function of the shot clock t. Motion runs on the simulated clock simAt(t), built
//     from rate() on the runner's 1/60 grid, so the three hit-stops slow the ball, the defenders and the grass
//     clippings alike, and a seek lands on exactly the frame a play-through shows. update() keeps no state.
//   - The page renderer is this file's own (MangaPage's model, plus "waiting" panels: a panel that has not started is
//     already drawn on the page, in full ink, its defenders set and no ball). Per frame: paper; the live and waiting
//     panels' environments and defender puppets; ONE inkGrade clipped to those panels; the finished panels from their
//     two snapshot canvases (allocated in prepare(), rebuilt lazily after init, so a seek is exact); the live panel's
//     colour layer (thread, eye, ball, spin marks, clippings, SFX); gutters and ink borders; then the thread outside
//     the live panel (finished panels and gutters) and the finished panels' eyes, in screen space.
//   - The thread is one running stitch from the page's left edge to the ball, mapped panel by panel into screen
//     space and pinned to junction points in the gutters, so it runs on unbroken across the page whatever each
//     panel's camera does (panel 2's push-in and shake included). Its stitches are locked to the page (they scale
//     with the zoom) and it stays 2 px on screen (4 px of page at the whole-page view).
//   - Puppets: only the live panel renders (D1; D2 + D3; D4). Waiting and finished poses and the keeper are cached in
//     prepare(), so no frame renders more than 2 puppets.

import type { Env, Shot } from '../timeline';
import { STEP } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { clamp, ease, lerp, smooth } from '../../engine/math';
import { drawGlow, glowOf } from '../../engine/particles';
import { BallSpin } from '../../engine/pixel';
import {
  KEEPER_KIT, P, POSES, RIVAL_KIT, RIVAL_KIT_B, RIVAL_KIT_C, RIVAL_KIT_D, joints, poseAt, renderPuppet, type Kit, type Pose,
} from '../../art/puppet';
import {
  HEX, PAGE, THREAD_NOTES as N, drawBall, drawDownPitch, drawGrassFore, inkGrade, inkSfx, inkSmear, meridianGrade, needleEye,
  paperFlash, prepareGrassFore, prepareInk, projectDecal, pulse, spinMarks, threadLine, warp, type DownPitchView,
} from './common';

const DUR = 2.4;
const D = Math.PI / 180;

// ---------------------------------------------------------------- clock

/** Hit-stops [start, length, rate]: eye 1 the poke, eye 2 the scissors, eye 3 the heel. */
const STOPS: [number, number, number][] = [[0.42, 0.16, 0.06], [1.05, 0.22, 0.05], [1.75, 0.15, 0.08]];
const rate = (t: number) => warp(t, STOPS);

/** The simulated clock on the runner's grid: SIM[k] = sum of STEP * rate(j * STEP), j = 1..k (exactly what update sees). */
const SIM: number[] = (() => {
  const n = Math.ceil(DUR / STEP) + 2;
  const out = [0];
  for (let k = 1; k <= n; k++) out.push(out[k - 1] + STEP * rate(k * STEP));
  return out;
})();
function simAt(t: number) {
  const f = clamp(t / STEP, 0, SIM.length - 1);
  const k = Math.floor(f);
  return lerp(SIM[k], SIM[Math.min(SIM.length - 1, k + 1)], f - k);
}

/** True while panel i's hit-stop holds. */
const frozenAt = (i: number, t: number) => t >= STOPS[i][0] && t < STOPS[i][0] + STOPS[i][1];

/** Deterministic hash in [0, 1) (no state: finished panels and seeks redraw identical pixels). */
function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

// ---------------------------------------------------------------- page geometry

type XY = { x: number; y: number };
const xy = (x: number, y: number): XY => ({ x, y });
const PANELS = PAGE.panels;

/** x of a panel polygon's edge (corner a -> corner b) at page height y. Corners: TL, TR, BR, BL. */
function edgeX(i: number, a: number, b: number, y: number) {
  const [ax, ay] = PANELS[i].poly[a], [bx, by] = PANELS[i].poly[b];
  return lerp(ax, bx, (y - ay) / (by - ay));
}
/** Gutter junction between panel i's right edge and panel i+1's left edge at page height y. */
function junction(i: number, y: number): XY {
  return { x: (edgeX(i, 1, 2, y) + edgeX(i + 1, 0, 3, y)) / 2, y };
}

/** Page-space thread junctions: J0 off the page's left edge, J1 / J2 mid-gutter, J3 off the bottom-right corner. */
const GROUND1 = 282;
const J_PAGE: XY[] = [xy(-70, GROUND1), junction(0, GROUND1), junction(1, 165), xy(1330, 420)];

const toView = (i: number, p: XY): XY => ({ x: p.x - PANELS[i].view[0], y: p.y - PANELS[i].view[1] });

// ---------------------------------------------------------------- the ball's path in each panel (view space)

interface PanelPath {
  /** Dense ground-contact polyline (view space). */
  pts: XY[];
  cum: number[];
  L: number;
  /** Arc lengths: thread in / out junctions, the eye, the ball's contact at the panel's start and end. */
  Lin: number;
  Lout: number;
  Leye: number;
  Lstart: number;
  Lend: number;
  /** Ball radius (whole px) at arc length L. */
  r: (L: number) => number;
}

/** Catmull-Rom through ctrl; the marks are indices into ctrl. */
function buildPath(
  ctrl: XY[], m: { in: number; out: number; eye: number; start: number; end: number }, r: (L: number, P: PanelPath) => number,
): PanelPath {
  const SUB = 14;
  const pts: XY[] = [];
  const knot: number[] = [];
  const n = ctrl.length;
  for (let i = 0; i < n - 1; i++) {
    const a = ctrl[Math.max(0, i - 1)], b = ctrl[i], c = ctrl[i + 1], d = ctrl[Math.min(n - 1, i + 2)];
    knot.push(pts.length);
    for (let k = 0; k < SUB; k++) {
      const t = k / SUB, t2 = t * t, t3 = t2 * t;
      const cr = (p0: number, p1: number, p2: number, p3: number) =>
        0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
      pts.push({ x: cr(a.x, b.x, c.x, d.x), y: cr(a.y, b.y, c.y, d.y) });
    }
  }
  knot.push(pts.length);
  pts.push(ctrl[n - 1]);
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  const at = (k: number) => cum[knot[k]];
  const P: PanelPath = { pts, cum, L: cum[cum.length - 1], Lin: at(m.in), Lout: at(m.out), Leye: at(m.eye), Lstart: at(m.start), Lend: at(m.end), r: () => R0 };
  P.r = (L) => Math.round(r(L, P));
  return P;
}

function pathAt(P: PanelPath, L: number): XY {
  const d = clamp(L, 0, P.L);
  let lo = 0, hi = P.cum.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (P.cum[mid] <= d) lo = mid;
    else hi = mid;
  }
  const k = (d - P.cum[lo]) / Math.max(1e-6, P.cum[hi] - P.cum[lo]);
  return { x: lerp(P.pts[lo].x, P.pts[hi].x, k), y: lerp(P.pts[lo].y, P.pts[hi].y, k) };
}
function pathDir(P: PanelPath, L: number): XY {
  const a = pathAt(P, L - 2), b = pathAt(P, L + 2);
  const l = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  return { x: (b.x - a.x) / l, y: (b.y - a.y) / l };
}

/** "Scale 1" ball: r 12 (24 px across; the ball never drops below 20 px). */
const R0 = 12;

const J1v1 = toView(0, J_PAGE[1]), J1v2 = toView(1, J_PAGE[1]), J2v2 = toView(1, J_PAGE[2]), J2v3 = toView(2, J_PAGE[2]);

/** Ball contact points at the three eyes (view space). */
const EYE1 = xy(440, GROUND1);
const EYE2 = xy(346, 233);
const EYE3 = xy(488, 238);

const PATHS: PanelPath[] = [
  // Panel 1: a straight roll left to right along the turf, at ball height.
  buildPath([J_PAGE[0], xy(-7, GROUND1), EYE1, J1v1, xy(J1v1.x + 0.9 * R0, GROUND1), xy(640, GROUND1)], { in: 0, start: 1, eye: 2, out: 3, end: 4 }, () => R0),
  // Panel 2: in from the left edge low and near (r 16), up into the eye between the boots (r 12); released, the
  // sidespin carries it right, clearly nearer the lens than D3's trailing boot (its contact ~18 px below his feet),
  // then it hooks up into depth and out of the right edge (r 11). It never crosses a defender's body.
  buildPath(
    [xy(J1v2.x - 30, J1v2.y + 2), J1v2, xy(J1v2.x + 6, J1v2.y), xy(214, 281), xy(276, 264), EYE2, xy(400, 250), xy(448, 253), xy(482, 220), J2v2, xy(J2v2.x + 8, J2v2.y - 14), xy(530, 110)],
    { in: 1, start: 2, eye: 5, out: 9, end: 10 },
    (L, P) => (L <= P.Leye ? lerp(16, 12, smooth(clamp((L - P.Lstart) / (P.Leye - P.Lstart)))) : lerp(12, 11, clamp((L - P.Leye) / (P.Lout - P.Leye)))),
  ),
  // Panel 3: in deep at the upper left, still drifting up toward the far side where he looked (passing high behind
  // D4), then the sidespin curls it down his trailing side, round his heel, toward the lens and out at the bottom
  // right; the ball grows from 0.88 to 1.06.
  buildPath(
    [xy(J2v3.x - 30, J2v3.y + 2), J2v3, xy(J2v3.x + 5, J2v3.y), xy(334, 146), xy(398, 128), xy(452, 132), xy(482, 178), EYE3, xy(522, 290), xy(566, 326), xy(612, 352), toView(2, J_PAGE[3]), xy(760, 480)],
    { in: 1, start: 2, eye: 7, out: 11, end: 12 },
    (L, P) => (L <= P.Leye ? lerp(R0 * 0.88, R0, smooth(clamp((L - P.Lstart) / (P.Leye - P.Lstart)))) : lerp(R0, R0 * 1.06, clamp((L - P.Leye) / 200))),
  ),
];
// Panel 3's thread runs on to J3 (off the page) behind the ball: the ball's trailing edge reaches it at 2.10.
PATHS[2].Lend = PATHS[2].Lout + 0.9 * R0 * 1.06;

/** Sim time at each panel's start, at its eye (the middle of the hit-stop) and at its end. */
const SIMS = PANELS.map((p, i) => ({ s0: simAt(p.live[0]), sE: simAt(STOPS[i][0] + STOPS[i][1] * 0.5), s1: simAt(p.live[1]) }));

/** Ball contact arc length in panel i at sim time s (passes the eye's centre at the middle of the hit-stop). */
function ballLs(i: number, s: number) {
  const P = PATHS[i], m = SIMS[i];
  if (s <= m.sE) return lerp(P.Lstart, P.Leye, (s - m.s0) / (m.sE - m.s0));
  return lerp(P.Leye, P.Lend, (s - m.sE) / (m.s1 - m.sE));
}

interface BallState {
  x: number;
  y: number;
  r: number;
  L: number;
}
function ballAt(i: number, tp: number): BallState {
  const P = PATHS[i];
  const L = ballLs(i, simAt(tp));
  const r = P.r(L);
  const c = pathAt(P, L);
  return { x: c.x, y: c.y - r, r, L };
}

/** Spin: one fixed axis per panel (the forward roll plus the clockwise sidespin), angle from sim time (pure function). */
const SPIN_AXIS: [number, number, number][] = [[0, -0.45, 1], [1, 0.5, 0.15], [0.35, -0.5, 1]];
const SPIN_W = Math.PI * 2 * 3.4;
const spinBuf = new BallSpin();
function spinAt(i: number, tp: number) {
  spinBuf.m = new Float64Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  const [a, b, c] = SPIN_AXIS[i];
  spinBuf.rotate(a, b, c, SPIN_W * simAt(tp) + i * 1.7);
  return spinBuf;
}

// ---------------------------------------------------------------- panel cameras (push-in and shake inside the clip)

const CLACK_T = 1.28;

/** Panel 2's push-in about the eye during its freeze (8 %, held after) and the 3 px shake on the clack. */
function localM(i: number, tp: number): DOMMatrix {
  const m = new DOMMatrix();
  if (i !== 1) return m;
  const k = 1 + 0.08 * ease.inOutQuad(clamp((tp - STOPS[1][0]) / STOPS[1][1]));
  const f = Math.floor((tp - CLACK_T) / STEP + 1e-6);
  const SH: [number, number][] = [[3, -2], [-3, 2], [2, -1], [-2, 1], [1, 0], [-1, 0]];
  const [sx, sy] = f >= 0 && f < SH.length ? SH[f] : [0, 0];
  const cx = EYE2.x, cy = EYE2.y - R0;
  return m.translate(sx, sy).translate(cx, cy).scale(k, k).translate(-cx, -cy);
}

/** Page -> device at t (PAGE.view), and panel view -> device. */
function pageM(S: number, t: number) {
  const v = PAGE.view(t);
  return new DOMMatrix().scale(S, S).translate(VW / 2, VH / 2).scale(v.zoom, v.zoom).translate(-v.cx, -v.cy);
}
function panelM(pm: DOMMatrix, i: number, tp: number) {
  return pm.translate(PANELS[i].view[0], PANELS[i].view[1]).multiply(localM(i, tp));
}

function polyPath(ctx: CanvasRenderingContext2D, poly: readonly (readonly [number, number])[]) {
  poly.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
}

// ---------------------------------------------------------------- defenders (puppets, inked with the page)

interface Actor {
  kit: Kit;
  k: number;
  facing: 1 | -1;
  track: [number, Pose][];
  /** Hip keys [sim, x, y] (view space). */
  hip: [number, number, number][];
}

function hipAt(k: [number, number, number][], s: number): [number, number] {
  if (s <= k[0][0]) return [k[0][1], k[0][2]];
  for (let i = 1; i < k.length; i++) {
    if (s <= k[i][0]) {
      const a = k[i - 1], b = k[i];
      const u = smooth((s - a[0]) / (b[0] - a[0]));
      return [lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
    }
  }
  const e = k[k.length - 1];
  return [e[1], e[2]];
}

const [S1, S2, S3] = SIMS;
const REL2 = simAt(STOPS[1][0] + STOPS[1][1]);
const REL3 = simAt(STOPS[2][0] + STOPS[2][1]);

/** The poke: POSES.pokeTackle with the ankle extended, so the toe reaches forward and the sole sweeps flat over the ball. */
const POKE = P({ ...POSES.pokeTackle, footN: 66 * D });
/** Fallen forward onto his hip (body tipped forward 75 deg), propped on the near arm, head up, far knee kicked up. */
const FALL_FWD = P({ torso: -14 * D, head: -38 * D, thighN: 24 * D, kneeN: 56 * D, footN: 10 * D, thighF: -18 * D, kneeF: 70 * D, footF: 10 * D, armN: 70 * D, elbowN: 30 * D, armF: 130 * D, elbowF: 30 * D, spin: 1.3 });

/** D1, the presser (facing the ball): set, wind-up, the long poke over the ball, the swipe through air, onto his hip. */
const D1: Actor = {
  kit: RIVAL_KIT,
  k: 1.0,
  facing: -1,
  track: [
    [0, P({ torso: 20 * D, head: -14 * D, thighN: -14 * D, kneeN: 50 * D, thighF: 18 * D, kneeF: 44 * D, armN: 34 * D, elbowN: 40 * D, armF: -30 * D, elbowF: 44 * D })],
    [0.2, P({ torso: 12 * D, head: -8 * D, thighN: -42 * D, kneeN: 88 * D, footN: 10 * D, thighF: 6 * D, kneeF: 32 * D, armN: 52 * D, elbowN: 30 * D, armF: -54 * D, elbowF: 30 * D })],
    [0.35, P({ torso: -2 * D, head: 10 * D, thighN: 44 * D, kneeN: 44 * D, footN: -6 * D, thighF: -10 * D, kneeF: 36 * D, armN: -24 * D, elbowN: 30 * D, armF: 62 * D, elbowF: 24 * D })],
    [S1.sE, POKE],
    // Overbalanced forward over his own poking leg (never blasted backwards)...
    [S1.sE + 0.05, P({ torso: 38 * D, head: -6 * D, thighN: 70 * D, kneeN: 8 * D, footN: 40 * D, thighF: -26 * D, kneeF: 64 * D, armN: 80 * D, elbowN: 20 * D, armF: -50 * D, elbowF: 30 * D, spin: 0.3 })],
    // ...and down forward onto his hip, propped on his near arm, one knee kicked up behind: screen-left of the ball's
    // exit, the eye he missed over his legs.
    [S1.s1, FALL_FWD],
  ],
  hip: [[0, 498, 239], [0.3, 488, 237], [S1.sE, 482, 236], [S1.sE + 0.05, 474, 244], [S1.s1, 428, 268]],
};

/** D2 (screen-left, facing +1) and D3 (screen-right, facing -1): the scissors, the clack, the stumble. */
const lungeIn = P({ torso: 18 * D, head: -6 * D, thighN: 34 * D, kneeN: 46 * D, thighF: -22 * D, kneeF: 40 * D, footF: 6 * D, armN: -20 * D, elbowN: 50 * D, armF: 40 * D, elbowF: 40 * D });
const lungeClack = P({ ...POSES.lungeL, torso: 32 * D, thighN: 82 * D, kneeN: 4 * D, head: 10 * D, armN: -60 * D, armF: 90 * D });
const tangle = P({ torso: 46 * D, head: -28 * D, thighN: 24 * D, kneeN: 84 * D, footN: 14 * D, thighF: -34 * D, kneeF: 64 * D, footF: 10 * D, armN: 150 * D, elbowN: 34 * D, armF: 118 * D, elbowF: 44 * D });
const scissors = (pose: Pose): [number, Pose][] => [
  [S2.s0 - 0.05, lungeIn],
  [S2.sE, pose],
  [REL2 + 0.006, lungeClack],
  [REL2 + 0.05, POSES.stumble],
  [S2.s1, tangle],
];
const HIP2Y = EYE2.y - 35;
const scissorsHip = (side: -1 | 1): [number, number, number][] => [
  [S2.s0 - 0.05, EYE2.x + side * 92, HIP2Y - 6],
  [S2.sE, EYE2.x + side * 57, HIP2Y],
  [REL2 + 0.006, EYE2.x + side * 50, HIP2Y + 1],
  [REL2 + 0.05, EYE2.x + side * 42, HIP2Y - 2],
  [S2.s1, EYE2.x + side * 42, HIP2Y + 9],
];
const D2A: Actor = { kit: RIVAL_KIT_B, k: 1.09, facing: 1, track: scissors(POSES.lungeL), hip: scissorsHip(-1) };
const D3A: Actor = { kit: RIVAL_KIT_C, k: 1.09, facing: -1, track: scissors(POSES.lungeR), hip: scissorsHip(1) };

/** D4, the near-side full-back: shuffling, the stretch (his trailing heel 2 px from the ball), left stretched on the turf. */
const D4A: Actor = {
  kit: RIVAL_KIT_D,
  k: 1.0,
  facing: -1,
  track: [
    [S3.s0 - 0.05, POSES.jockey],
    [S3.sE - 0.09, P({ torso: 24 * D, head: -14 * D, thighN: 44 * D, kneeN: 30 * D, footN: -8 * D, thighF: -30 * D, kneeF: 30 * D, footF: 12 * D, armN: 40 * D, elbowN: 30 * D, armF: -50 * D, elbowF: 30 * D })],
    [S3.sE, POSES.stretchBlock],
    [REL3 + 0.03, P({ torso: 40 * D, head: -4 * D, thighN: 78 * D, kneeN: 2 * D, footN: -16 * D, thighF: -62 * D, kneeF: 10 * D, footF: 24 * D, armN: 70 * D, elbowN: 16 * D, armF: -84 * D, elbowF: 20 * D })],
    [S3.s1, P({ torso: 52 * D, head: -24 * D, thighN: 88 * D, kneeN: 0, footN: -10 * D, thighF: -84 * D, kneeF: 4 * D, footF: 20 * D, armN: 84 * D, elbowN: 10 * D, armF: -96 * D, elbowF: 16 * D })],
  ],
  hip: [
    [S3.s0 - 0.05, EYE3.x - 60, EYE3.y - 40],
    [S3.sE - 0.09, EYE3.x - 55, EYE3.y - 37],
    [S3.sE, EYE3.x - 51, EYE3.y - 33],
    [REL3 + 0.03, EYE3.x - 54, EYE3.y - 27],
    [S3.s1, EYE3.x - 56, EYE3.y - 20],
  ],
};

const ACTORS: Actor[][] = [[D1], [D2A, D3A], [D4A]];

type PupImg = { cv: HTMLCanvasElement; ox: number; oy: number };
const pupCache = new Map<string, PupImg>();
function cached(key: string, kit: Kit, pose: Pose, k: number, facing: 1 | -1): PupImg {
  let c = pupCache.get(key);
  if (!c) {
    const r = renderPuppet(kit, pose, { k, facing });
    const cv = document.createElement('canvas');
    cv.width = r.cv.width;
    cv.height = r.cv.height;
    cv.getContext('2d')!.drawImage(r.cv, 0, 0);
    pupCache.set(key, (c = { cv, ox: r.ox, oy: r.oy }));
  }
  return c;
}

type Mode = 'live' | 'pending' | 'frozen';
const simOf = (i: number, tp: number, mode: Mode) => (mode === 'pending' ? SIMS[i].s0 : mode === 'frozen' ? SIMS[i].s1 : simAt(tp));

/** Panel i's defenders: the live panel renders them; a waiting or finished panel blits a cached pose. */
function drawActors(ctx: CanvasRenderingContext2D, i: number, tp: number, mode: Mode) {
  const s = simOf(i, tp, mode);
  ACTORS[i].forEach((a, n) => {
    const [hx, hy] = hipAt(a.hip, s);
    const img = mode === 'live' ? renderPuppet(a.kit, poseAt(a.track, s), { k: a.k, facing: a.facing }) : cached(`${i}.${n}.${mode}`, a.kit, poseAt(a.track, s), a.k, a.facing);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img.cv, Math.round(hx - img.ox), Math.round(hy - img.oy));
  });
}

// ---------------------------------------------------------------- environments (drawn before the ink grade)

let bg1: HTMLCanvasElement | null = null;
let bg3: HTMLCanvasElement | null = null;

const mk = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  return [c, g] as const;
};

/** A floodlight bank: a lamp grid on a dark frame. */
function lampBank(g: CanvasRenderingContext2D, x: number, y: number, s = 1) {
  g.fillStyle = '#1b1830';
  g.fillRect(x - 2, y - 2, 40 * s + 4, 26 * s + 4);
  g.fillStyle = '#fffbe8';
  for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) g.fillRect(x + k * 6.6 * s, y + r * 6.4 * s, 4.6 * s, 4.4 * s);
}

/** Advertising boards: a dark band with pale "logo" blocks. */
function boards(g: CanvasRenderingContext2D, y: number, h: number, seed: number) {
  g.fillStyle = '#0b0a14';
  g.fillRect(0, y, VW, h);
  g.fillStyle = '#d8d2e6';
  let x = 6 + hash(seed) * 20;
  for (let i = 0; x < VW; i++) {
    const w = 26 + Math.floor(hash(seed + i * 3.1) * 44);
    const bh = Math.max(3, Math.round(h * (0.3 + hash(seed + i * 7.7) * 0.25)));
    g.fillRect(Math.round(x), Math.round(y + (h - bh) / 2), w, bh);
    if (hash(seed + i * 1.9) < 0.5) g.fillRect(Math.round(x + w + 4), Math.round(y + (h - bh) / 2), 6, bh);
    x += w + 22 + hash(seed + i * 5.3) * 30;
  }
  g.fillStyle = '#3a3550';
  g.fillRect(0, y + h - 1, VW, 1);
}

/** Panel 1 background (static, 1x pixel art): sky, floodlights, the far stand, boards, the turf at ball height. */
function buildBg1(env: Env) {
  const [c, g] = mk(VW, VH);
  const st = env.art.stadium;
  g.fillStyle = '#06040f';
  g.fillRect(0, 0, VW, 110);
  lampBank(g, 70, 18, 1);
  lampBank(g, 360, 10, 1.1);
  g.globalCompositeOperation = 'lighter';
  drawGlow(g, glowOf([255, 250, 220]), 90, 31, 70, 0.4);
  drawGlow(g, glowOf([255, 250, 220]), 382, 24, 80, 0.45);
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = '#07050f';
  g.fillRect(0, 92, VW, 14);
  // The far stand, magnified by the long lens.
  g.drawImage(st.crowd, 260, 0, 470, 110, 0, 104, VW, 144);
  boards(g, 246, 20, 3);
  // A dark run of boards behind the poke, so the inked boot over the ball reads as a pale silhouette on ink.
  g.fillStyle = '#0b0a14';
  g.fillRect(372, 247, 168, 18);
  // Turf: far ground compressed above the ball's contact line, near ground below it.
  const turf = g.createLinearGradient(0, 266, 0, VH);
  turf.addColorStop(0, '#1d5527');
  turf.addColorStop(0.2, '#2a7a36');
  turf.addColorStop(1, '#34923f');
  g.fillStyle = turf;
  g.fillRect(0, 266, VW, VH - 266);
  // Mowing stripes seen almost edge-on: thin light bands that thicken toward the lens.
  for (let k = 0; k < 7; k++) {
    const y0 = 266 + Math.pow(k / 7, 1.8) * 94;
    const y1 = 266 + Math.pow((k + 0.5) / 7, 1.8) * 94;
    g.fillStyle = 'rgba(160,220,140,0.10)';
    g.fillRect(0, Math.round(y0), VW, Math.max(1, Math.round(y1 - y0)));
  }
  // Blade specks, denser and longer toward the lens.
  for (let i = 0; i < 900; i++) {
    const y = 268 + Math.pow(hash(i * 1.37), 0.7) * 92;
    const x = hash(i * 2.11 + 9) * VW;
    const h = 1 + Math.floor(((y - 266) / 94) * 3 * hash(i * 0.73));
    g.fillStyle = hash(i * 4.9) < 0.5 ? '#174a20' : '#4aa650';
    g.fillRect(Math.round(x), Math.round(y - h), 1, h);
  }
  // The far touchline, a sliver right under the boards.
  g.fillStyle = 'rgba(235,240,250,0.7)';
  g.fillRect(0, 268, VW, 1);
  return c;
}

/** Panel 3's ground: field x -> view x at view height y (a raised view looking at the far side). */
const P3X = (x: number, y: number) => 482 + (x - 1068) * (4.2 + 2.2 * (y / VH));
/** Panel 3 background (static): the far stand and boards high up, then the turf toward the lens. */
function buildBg3(env: Env) {
  const [c, g] = mk(VW, VH);
  const st = env.art.stadium;
  g.drawImage(st.crowd, 900, 30, 360, 80, 0, -8, VW, 44);
  boards(g, 34, 14, 11);
  const turf = g.createLinearGradient(0, 48, 0, VH);
  turf.addColorStop(0, '#1f5a2a');
  turf.addColorStop(1, '#33903e');
  g.fillStyle = turf;
  g.fillRect(0, 48, VW, VH - 48);
  // The ground plane (so a ball far up the panel reads as far away on the turf, never in the air): 2.5 m mowing
  // stripes (constant field x, aligned to the 18-yard line at 1015), light and dark in turn, converging toward the
  // far side (the panel sees field x ~1023-1099, so 5 m stripes would show one edge), with a soft cross-cut whose
  // bands (equal field depth: equal steps of 1 / scale) deepen toward the lens.
  const ROWS = [48, 94, 147, 208, 278, VH];
  const quad = (x: number, y0: number, y1: number) => {
    g.beginPath();
    g.moveTo(P3X(x, y0), y0);
    g.lineTo(P3X(x + 25, y0), y0);
    g.lineTo(P3X(x + 25, y1), y1);
    g.lineTo(P3X(x, y1), y1);
    g.closePath();
    g.fill();
  };
  for (let k = 0, x = 940; x < 1200; k++, x += 25) {
    const light = k % 2 === 1;
    g.fillStyle = light ? 'rgba(170,230,150,0.5)' : 'rgba(6,30,12,0.22)';
    quad(x, 48, VH);
    g.fillStyle = light ? 'rgba(6,30,12,0.16)' : 'rgba(170,230,150,0.22)';
    for (let r = 1; r + 1 < ROWS.length; r += 2) quad(x, ROWS[r], ROWS[r + 1]);
  }
  // Distance: the far turf darkens toward the boards (reads as depth once inked).
  const haze = g.createLinearGradient(0, 48, 0, 170);
  haze.addColorStop(0, 'rgba(8,20,12,0.45)');
  haze.addColorStop(1, 'rgba(8,20,12,0)');
  g.fillStyle = haze;
  g.fillRect(0, 48, VW, 122);
  // The far touchline and the penalty spot (the 18-yard line, field x 1015, lies left of the panel's clip).
  g.fillStyle = 'rgba(235,240,250,0.8)';
  g.fillRect(0, 52, VW, 2);
  const sx = Math.round(P3X(1070, 100));
  g.fillRect(sx - 3, 97, 7, 2);
  g.fillRect(sx - 2, 96, 5, 1);
  g.fillRect(sx - 2, 99, 5, 1);
  for (let i = 0; i < 1100; i++) {
    const y = 56 + Math.pow(hash(i * 1.91 + 3), 0.85) * 304;
    const x = hash(i * 3.17 + 1) * VW;
    const h = 1 + Math.floor((y / VH) * 2.4 * hash(i * 0.61));
    g.fillStyle = hash(i * 5.3) < 0.55 ? '#184c21' : '#4aa650';
    g.fillRect(Math.round(x), Math.round(y - h), 1, h);
  }
  return c;
}

/** Panel 2's locked camera behind the ball, looking downfield (drawDownPitch; vanishing area at the panel's top). */
const V2: DownPitchView = { x: 959, z: 252, h: 23.6, f: 420, horizon: 95, cx: 340 };

/** Pale dust puffs, inked with the page: [panel, sim time, x, y, count, spread]. */
const DUST: [number, number, number, number, number, number][] = [
  [0, S1.sE + 0.07, 440, GROUND1, 5, 1.2],
  [1, REL2 + 0.01, EYE2.x, EYE2.y + 1, 4, 0.8],
  [2, REL3 + 0.04, EYE3.x - 70, EYE3.y + 6, 5, 1.1],
];
function drawDust(ctx: CanvasRenderingContext2D, i: number, s: number) {
  ctx.globalCompositeOperation = 'source-over';
  for (const [pi, s0, x, y, n, sp] of DUST) {
    if (pi !== i || s < s0) continue;
    const age = s - s0;
    for (let k = 0; k < n; k++) {
      const life = 0.35 + 0.3 * hash(k * 3.3 + pi);
      const u = age / life;
      if (u >= 1) continue;
      const vx = (hash(pi * 31 + k * 7.7) - 0.5) * 140 * sp;
      const px = x + (vx * (1 - Math.exp(-age * 6))) / 6;
      const py = y - 4 - 22 * sp * ease.outCubic(clamp(u * 1.4)) * (0.4 + 0.6 * hash(k + pi * 5));
      // Pale paper puffs (manga dust clouds), not dark smudges, once inked.
      drawGlow(ctx, glowOf([239, 231, 214]), px, py, lerp(6, 18, ease.outCubic(u)) * sp, 0.45 * (1 - u));
    }
  }
}

/** Where each panel's turf starts (view y): the ink page lifts it toward paper. */
const TURF_Y = [266, projectDecal(1270, V2.z, 0, V2).y, 48];
/** Defender feet (view y) for their ground shadows. */
const FEET_Y = [GROUND1 + 1, EYE2.y + 1, EYE3.y + 1];

/** A soft ground shadow (inked with the page). */
function shadow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, a = 0.4) {
  ctx.fillStyle = `rgba(5,8,20,${a})`;
  ctx.beginPath();
  ctx.ellipse(x, y, w, Math.max(3, w * 0.22), 0, 0, Math.PI * 2);
  ctx.fill();
}

/** Panel i's environment and defenders (view space; called inside the panel's clip, before the grade). */
function drawPanelBase(env: Env, ctx: CanvasRenderingContext2D, i: number, tp: number, mode: Mode) {
  ctx.imageSmoothingEnabled = false;
  if (i === 0) ctx.drawImage(bg1!, 0, 0);
  else if (i === 1) drawDownPitch(ctx, env.art.stadium, V2, tp);
  else ctx.drawImage(bg3!, 0, 0);
  // The ink page wants paper-grey turf, not a dark photo (shot 2's lift), and a little light on the stands.
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = 'rgb(190,184,174)';
  ctx.globalAlpha = i === 2 ? 0.5 : 0.75; // panel 3 keeps its stripes and pitch line through the grade (depth)
  ctx.fillRect(-40, TURF_Y[i], VW + 80, VH + 60 - TURF_Y[i]);
  ctx.globalAlpha = 0.22;
  ctx.fillRect(-40, i === 0 ? 100 : -40, VW + 80, TURF_Y[i] - (i === 0 ? 100 : -40) - (i === 0 ? 20 : 0));
  ctx.restore();
  if (i === 1) {
    // The untouched keeper, small on his line under the goal.
    const kp = projectDecal(1168, 258, 0, V2);
    const kr = cached('keeper', KEEPER_KIT, POSES.gkReady, 0.34, -1);
    shadow(ctx, kp.x, kp.y, 7, 0.3);
    ctx.drawImage(kr.cv, Math.round(kp.x - kr.ox), Math.round(kp.y - 15 - kr.oy));
  }
  const s = simOf(i, tp, mode);
  ACTORS[i].forEach((a) => shadow(ctx, hipAt(a.hip, s)[0] - a.facing * 4, FEET_Y[i], 24 * a.k, 0.38));
  if (mode === 'live') {
    const b = ballAt(i, tp);
    shadow(ctx, b.x + 2, b.y + b.r + 1, b.r * 1.3, 0.6);
  }
  // Dust behind the defenders (paper puffs kicked up at their feet), then the defenders.
  if (mode !== 'pending') drawDust(ctx, i, simOf(i, tp, mode));
  drawActors(ctx, i, tp, mode);
  if (i === 0) drawGrassFore(ctx, 37, 0, { y: VH + 4 });
}

// ---------------------------------------------------------------- the thread (one running stitch across the page)

interface TPt {
  x: number;
  y: number;
  /** Scale (perspective x page zoom; 1 = the 24 px ball at zoom 1). */
  s: number;
  /** Stitch arch height per unit scale (px). */
  arch: number;
}

/** Panel i's thread from its in-junction to arc length `to` (view space); near the ball it lifts into its back. */
function trailView(i: number, to: number): TPt[] {
  const P = PATHS[i];
  const a = P.Lin, b = Math.min(to, P.Lout);
  if (b <= a) return [];
  const out: TPt[] = [];
  const lift = i === 0 ? 0 : 0.45;
  const head = to < P.Lout;
  for (let d = a; ; d += 5) {
    const L = Math.min(d, b);
    const c = pathAt(P, L);
    const r = P.r(L);
    const up = head ? smooth(clamp(1 - (b - L) / (r * 1.6))) * r * (i === 0 ? 0.55 : 0.15) : 0;
    out.push({ x: c.x, y: c.y - lift * r - up, s: r / R0, arch: i === 0 ? 2 : 1.6 });
    if (L >= b) break;
  }
  return out;
}

/** Map panel i's view-space thread into logical screen space and pin its ends to the page junctions. */
function trailScreen(i: number, tp: number, pts: TPt[], pm: DOMMatrix, S: number, zoom: number, pinEnd: boolean): TPt[] {
  const m = panelM(pm, i, tp);
  const o = pts.map((p) => {
    const q = m.transformPoint(new DOMPoint(p.x, p.y));
    return { x: q.x / S, y: q.y / S, s: p.s * zoom, arch: p.arch };
  });
  const pin = (k: number, J: XY) => {
    const q = pm.transformPoint(new DOMPoint(J.x, J.y));
    o[k].x = q.x / S;
    o[k].y = q.y / S;
  };
  if (o.length) {
    pin(0, J_PAGE[i]);
    if (pinEnd) pin(o.length - 1, J_PAGE[i + 1]);
  }
  return o;
}

/**
 * The running stitch along a screen-space polyline: jade dashes (ink under-stroke, emerald halo, jade body, pearl
 * core) that arch a little above the turf, and short dips "through" it with two ink needle holes each. Dash, dip and
 * width follow each point's scale (perspective and page zoom), so the pattern stays locked to the page.
 */
function stitch(ctx: CanvasRenderingContext2D, pts: TPt[], alpha = 1) {
  const n = pts.length;
  if (n < 2 || alpha <= 0) return;
  const cum = [0];
  for (let k = 1; k < n; k++) cum.push(cum[k - 1] + Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y));
  const L = cum[n - 1];
  let kk = 1;
  const at = (d: number): TPt => {
    if (d < cum[kk - 1]) kk = 1;
    while (kk < n - 1 && cum[kk] < d) kk++;
    const u = clamp((d - cum[kk - 1]) / Math.max(1e-6, cum[kk] - cum[kk - 1]));
    const a = pts[kk - 1], b = pts[kk];
    return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), s: lerp(a.s, b.s, u), arch: lerp(a.arch, b.arch, u) };
  };
  ctx.save();
  let d = 0;
  while (d < L) {
    const p0 = at(d);
    const dash = 14 * p0.s, dip = 6 * Math.max(0.6, p0.s);
    const d1 = Math.min(L, d + dash);
    const seg: XY[] = [];
    const m = Math.max(2, Math.ceil((d1 - d) / 3));
    for (let k = 0; k <= m; k++) {
      const dd = lerp(d, d1, k / m);
      const q = at(dd);
      const u = (dd - d) / dash;
      seg.push({ x: q.x, y: q.y - q.arch * q.s * Math.sin(Math.PI * Math.min(u, 1)) });
    }
    threadLine(ctx, seg, clamp(2 * Math.max(1, p0.s), 2, 4.2), alpha, { halo: 0.9 });
    ctx.fillStyle = HEX.ink;
    ctx.globalAlpha = alpha;
    for (const hd of [d1, d1 + dip]) {
      if (hd >= L - 0.5 || hd <= 0) continue;
      const q = at(hd);
      const hs = q.s > 1.25 ? 2 : 1;
      ctx.fillRect(Math.round(q.x - hs / 2), Math.round(q.y - hs / 2), hs, hs);
    }
    d = d1 + dip;
  }
  ctx.restore();
}

/** Pluck a polyline: a standing wave with nodes at the given arc fractions (ends fixed), keeping scale and arch. */
function pluckPts(pts: TPt[], amp: number, phase: number, nodes: number[]): TPt[] {
  if (pts.length < 3 || Math.abs(amp) < 0.05) return pts;
  const n = pts.length;
  const cum = [0];
  for (let k = 1; k < n; k++) cum.push(cum[k - 1] + Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y));
  const L = cum[n - 1] || 1;
  const bounds = [0, ...nodes.filter((v) => v > 0.02 && v < 0.98).sort((a, b) => a - b), 1];
  return pts.map((p, k) => {
    const f = cum[k] / L;
    let j = 0;
    while (j < bounds.length - 2 && f > bounds[j + 1]) j++;
    const a = bounds[j], seg = bounds[j + 1] - a;
    const dsp = amp * Math.sqrt(seg) * Math.sin((Math.PI * (f - a)) / Math.max(1e-6, seg)) * Math.cos(phase / Math.max(0.15, seg));
    const A = pts[Math.max(0, k - 1)], B = pts[Math.min(n - 1, k + 1)];
    const tl = Math.hypot(B.x - A.x, B.y - A.y) || 1;
    return { ...p, x: p.x - ((B.y - A.y) / tl) * dsp, y: p.y + ((B.x - A.x) / tl) * dsp };
  });
}

const polyLen = (p: TPt[]) => p.reduce((s, q, j) => (j ? s + Math.hypot(q.x - p[j - 1].x, q.y - p[j - 1].y) : 0), 0);

// ---------------------------------------------------------------- eyes, SFX, speed lines, clippings

/** Panel i's needle eye in view space: centre (the ball at the middle of the hit-stop), length, axis, squash. */
const EYES = [
  { c: xy(EYE1.x, EYE1.y - R0 - 2), len: 62, rot: Math.PI / 2, squash: 0.74 },
  { c: xy(EYE2.x, EYE2.y - R0), len: 58, rot: 0, squash: 0.92 },
  { c: xy(EYE3.x, EYE3.y - R0), len: 60, rot: -0.72, squash: 1 },
];
/** It opens like an eyelid into the stop, breathes while time is held, then stays strung on the thread, fainter. */
function eyeState(i: number, t: number) {
  const [a, l] = STOPS[i];
  if (t < a - 0.03) return { open: 0, alpha: 0 };
  const o = ease.outBack(clamp((t - (a - 0.03)) / 0.07));
  const after = clamp((t - (a + l)) / 0.2);
  const breathe = t < a + l ? 1 + 0.03 * Math.sin((t - a) * 40) : 1;
  return { open: lerp(o * breathe, 0.82, after), alpha: lerp(1, 0.62, after) };
}

const SFX = [
  { text: 'SHK!', x: 318, y: 196, rot: -0.16, at: STOPS[0][0] },
  { text: 'KLAK!', x: 236, y: 128, rot: -0.12, at: CLACK_T },
  { text: 'SWSH', x: 552, y: 120, rot: -0.1, at: STOPS[2][0] },
];
function drawSfx(ctx: CanvasRenderingContext2D, i: number, tp: number) {
  const f = SFX[i];
  if (tp < f.at) return;
  inkSfx(ctx, f.text, f.x, f.y, 27, f.rot, { pop: clamp((tp - f.at) / 0.07) });
}

/** Ink speed lines trailing the ball along its own (curving) path. */
function speedLines(ctx: CanvasRenderingContext2D, i: number, b: BallState, a: number) {
  if (a <= 0) return;
  const P = PATHS[i];
  ctx.save();
  ctx.strokeStyle = HEX.ink;
  ctx.lineCap = 'round';
  const LINES: [number, number, number][] = [[-0.66, 3.4, 1], [-0.14, 5.6, 2], [0.4, 2.8, 1], [0.8, 4.4, 1.5]];
  for (const [off, len, w] of LINES) {
    const pts: XY[] = [];
    const L0 = b.L - b.r * 1.25, L1 = L0 - len * b.r;
    for (let L = L0; L >= L1; L -= 4) {
      const c = pathAt(P, L), d = pathDir(P, L), rr = P.r(L);
      // Side view: offsets are vertical; the raised views: perpendicular to the path.
      const nx = i === 0 ? 0 : -d.y, ny = i === 0 ? 1 : d.x;
      pts.push({ x: c.x + nx * off * rr, y: c.y - rr + ny * off * rr });
    }
    for (let k = 0; k + 1 < pts.length; k++) {
      ctx.globalAlpha = a * (1 - k / (pts.length - 1));
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(pts[k].x, pts[k].y);
      ctx.lineTo(pts[k + 1].x, pts[k + 1].y);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/** D1's poking boot: a swipe smear along the toe's path (the poke over the ball, then the swipe through air). */
function bootSmear(ctx: CanvasRenderingContext2D, tp: number) {
  const s = simAt(tp);
  const s0 = Math.max(0.3, s - 0.07);
  if (s < 0.33 || s > S1.sE + 0.07) return;
  const pts: XY[] = [];
  for (let k = 0; k <= 10; k++) {
    const ss = lerp(s0, s, k / 10);
    const j = joints(poseAt(D1.track, ss));
    const [hx, hy] = hipAt(D1.hip, ss);
    pts.push({ x: hx + j.toeN[0] * D1.k * D1.facing, y: hy + j.toeN[1] * D1.k });
  }
  // A pale swipe (paper, ink speed lines) reads on the dark inked stand behind him.
  const a = 0.5 * clamp((S1.sE + 0.07 - s) / 0.04);
  inkSmear(ctx, pts, 10, a, { lines: 0, color: HEX.paper });
  inkSmear(ctx, pts, 10, a * 0.7, { lines: 3 });
}

/** Tiny grass clippings flicked off the spin: spawned on a sim-time grid (2-3 per frame), frozen by the hit-stops. */
const CLIP_DT = 1 / 150, CLIP_LIFE = 0.22;
const GRASS = ['#78c85a', '#46963c', '#a6e07c'];
function clippings(ctx: CanvasRenderingContext2D, i: number, tp: number) {
  const s = simAt(tp);
  const P = PATHS[i];
  const k1 = Math.floor(s / CLIP_DT), k0 = Math.max(Math.ceil(SIMS[i].s0 / CLIP_DT), Math.ceil((s - CLIP_LIFE) / CLIP_DT));
  ctx.save();
  for (let k = k0; k <= k1; k++) {
    const ss = k * CLIP_DT, age = s - ss;
    if (age < 0 || age > CLIP_LIFE) continue;
    const L = ballLs(i, ss);
    const c = pathAt(P, L), d = pathDir(P, L), r = P.r(L);
    const h1 = hash(k * 1.731 + i * 91), h2 = hash(k * 2.917 + i * 37), h3 = hash(k * 0.613 + i * 11);
    const back = 30 + 60 * h1, side = (h2 - 0.5) * 70 * (i === 0 ? 0.2 : 1), upv = 70 + 90 * h3;
    const sc = r / R0;
    const x = c.x + (-d.x * back - d.y * side) * age * sc + (h2 - 0.5) * r * 0.8;
    const y = c.y - 1 + (-d.y * back + d.x * side) * age * sc - (upv * age - 260 * age * age) * sc;
    ctx.globalAlpha = 1 - age / CLIP_LIFE;
    ctx.fillStyle = HEX.ink;
    ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 3, 4);
    ctx.fillStyle = GRASS[k % 3];
    ctx.fillRect(Math.round(x), Math.round(y), 1, 2);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- snapshots of the finished panels

const snaps: (HTMLCanvasElement | null)[] = [null, null];
const snapOk = [false, false];

function allocSnaps(w: number, h: number) {
  for (let i = 0; i < 2; i++) {
    const c = snaps[i];
    if (!c || c.width !== w || c.height !== h) {
      const n = c ?? document.createElement('canvas');
      n.width = w;
      n.height = h;
      snaps[i] = n;
      snapOk[i] = false;
    }
  }
}

/** Panel i's last frame frozen: environment and defenders in full ink, its SFX on top (thread and eye are overlays). */
function buildSnap(env: Env, i: number) {
  const c = snaps[i]!;
  const g = c.getContext('2d')!;
  const S = c.width / VW;
  const tp = PANELS[i].live[1];
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = HEX.paper;
  g.fillRect(0, 0, c.width, c.height);
  g.setTransform(new DOMMatrix().scale(S, S).multiply(localM(i, tp)));
  drawPanelBase(env, g, i, tp, 'frozen');
  inkGrade(g, 1);
  drawSfx(g, i, tp);
  g.restore();
  snapOk[i] = true;
}

// ---------------------------------------------------------------- prepare

function prepareAll(env: Env) {
  prepareInk(env.ctx);
  prepareGrassFore();
  allocSnaps(env.ctx.canvas.width, env.ctx.canvas.height);
  if (!bg1) bg1 = buildBg1(env);
  if (!bg3) bg3 = buildBg3(env);
  // Waiting and finished poses (blits only during play) and the keeper.
  ACTORS.forEach((list, i) =>
    list.forEach((a, n) => {
      cached(`${i}.${n}.pending`, a.kit, poseAt(a.track, SIMS[i].s0), a.k, a.facing);
      cached(`${i}.${n}.frozen`, a.kit, poseAt(a.track, SIMS[i].s1), a.k, a.facing);
    }),
  );
  cached('keeper', KEEPER_KIT, POSES.gkReady, 0.34, -1);
}

// ---------------------------------------------------------------- render

/**
 * The page at shot-local t (steps 1-7): a pure function of t that touches no fx state and builds its own caches.
 * Exported (drawNeedlePage) so shot 3's thread wipe can reveal shot 4's real first frame.
 */
function renderPage(env: Env, t: number) {
  if (!bg1 || !bg3 || !pupCache.size) prepareAll(env);
  const ctx = env.ctx;
  const W = ctx.canvas.width, H = ctx.canvas.height, S = W / VW;
  allocSnaps(W, H);
  const v = PAGE.view(t);
  const pm = pageM(S, t);
  const liveI = PAGE.liveAt(t);
  const whole = t >= PAGE.whole[0];

  // Panel states (off-screen panels are skipped).
  const state: (Mode | 'hidden')[] = PANELS.map((p) => {
    const xs = p.poly.map((q) => q[0]);
    const sx0 = VW / 2 + (Math.min(...xs) - v.cx) * v.zoom, sx1 = VW / 2 + (Math.max(...xs) - v.cx) * v.zoom;
    if (sx1 < -4 || sx0 > VW + 4) return 'hidden';
    if (t < p.live[0]) return 'pending';
    if (t < p.live[1]) return 'live';
    return 'frozen';
  });
  const tpOf = (i: number) => (state[i] === 'live' ? t : state[i] === 'pending' ? PANELS[i].live[0] : PANELS[i].live[1]);

  // 1. Paper.
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = HEX.paper;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // 2. Environments + defenders of the live and waiting panels (and of panel 3 on the whole page), each in its clip.
  const graded: number[] = [];
  PANELS.forEach((p, i) => {
    const st = state[i];
    if (st === 'hidden' || (st === 'frozen' && i < 2)) return;
    graded.push(i);
    const tp = tpOf(i);
    ctx.save();
    ctx.setTransform(pm);
    ctx.beginPath();
    polyPath(ctx, p.poly);
    ctx.clip();
    ctx.setTransform(panelM(pm, i, tp));
    drawPanelBase(env, ctx, i, tp, st);
    ctx.restore();
  });

  // 3. The ink grade, by phase (not by liveI, so a waiting panel holds 0.85 through the page-pan into its own play and
  //    nothing flickers): 0.85 on the live and waiting panels; 1.0 with doubled screentone inside the live panel during
  //    its freeze; 1.0 on the whole page. Panels that share a grade are graded in one pass.
  const freeze = liveI >= 0 && frozenAt(liveI, t);
  const deep = (i: number) => whole || (freeze && i === liveI);
  for (const d of [false, true]) {
    const group = graded.filter((i) => deep(i) === d);
    if (!group.length) continue;
    ctx.save();
    ctx.setTransform(pm);
    ctx.beginPath();
    for (const i of group) polyPath(ctx, PANELS[i].poly);
    ctx.clip();
    inkGrade(ctx, d ? 1 : 0.85, undefined, { tone: d && freeze ? 1.6 : 1 });
    ctx.restore();
  }

  // 4. Finished panels 1-2 from their snapshots (built once, lazily: a seek rebuilds them exactly); panel 3's SFX.
  for (let i = 0; i < 2; i++) {
    if (state[i] !== 'frozen') continue;
    if (!snapOk[i]) buildSnap(env, i);
    ctx.save();
    ctx.setTransform(pm);
    ctx.beginPath();
    polyPath(ctx, PANELS[i].poly);
    ctx.clip();
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(snaps[i]!, PANELS[i].view[0], PANELS[i].view[1], VW, VH);
    ctx.restore();
  }
  if (state[2] === 'frozen') {
    ctx.save();
    ctx.setTransform(pm);
    ctx.beginPath();
    polyPath(ctx, PANELS[2].poly);
    ctx.clip();
    ctx.setTransform(panelM(pm, 2, PANELS[2].live[1]));
    drawSfx(ctx, 2, PANELS[2].live[1]);
    ctx.restore();
  }

  // The thread across the page, in screen space (built once; drawn inside, then outside, the live panel).
  const parts: TPt[][] = [];
  for (let i = 0; i < 3; i++) {
    if (t < PANELS[i].live[0]) break;
    const done = t >= PANELS[i].live[1];
    const tp = done ? PANELS[i].live[1] : t;
    const b = ballAt(i, tp);
    const head = done ? PATHS[i].Lout : b.L - 0.9 * b.r;
    let pts = trailScreen(i, tp, trailView(i, head), pm, S, v.zoom, done);
    const [a] = STOPS[i];
    if (!done && t >= a && pts.length > 2) {
      // The pluck: after each eye's note the string vibrates, pinned at the eye and at the ball.
      const ef = (PATHS[i].Leye - PATHS[i].Lin) / Math.max(1, head - PATHS[i].Lin);
      pts = pluckPts(pts, 2.4 * Math.exp(-(t - a) / 0.16), (t - a) * 70, [ef]);
    }
    parts.push(pts);
  }
  let thread: TPt[] = [];
  for (const p of parts) thread = thread.concat(thread.length ? p.slice(1) : p);
  if (whole && parts.length === 3 && t > 2.12) {
    // The whole page: the soft D5 rings the whole string, pinned at the three eyes.
    const lens = parts.map(polyLen);
    const tot = lens.reduce((x, y) => x + y, 0) || 1;
    let acc = 0;
    const nodes = PATHS.map((P, i) => {
      const f = (acc + ((P.Leye - P.Lin) / (P.Lout - P.Lin)) * lens[i]) / tot;
      acc += lens[i];
      return f;
    });
    const tt = t - 2.12;
    thread = pluckPts(thread, 1.6 * Math.exp(-tt / 0.2), tt * 55, nodes);
  }

  // 5. The live panel's colour layer: speed lines, thread, the eye it is strung through, clippings, ball, SFX.
  if (liveI >= 0) {
    const i = liveI;
    const b = ballAt(i, t);
    ctx.save();
    ctx.setTransform(pm);
    ctx.beginPath();
    polyPath(ctx, PANELS[i].poly);
    ctx.clip();
    const lm = panelM(pm, i, t);
    ctx.setTransform(lm);
    if (i === 0) bootSmear(ctx, t);
    speedLines(ctx, i, b, freeze ? 0.9 : 0.75);
    ctx.setTransform(S, 0, 0, S, 0, 0);
    stitch(ctx, thread);
    ctx.setTransform(lm);
    const es = eyeState(i, t);
    const E = EYES[i];
    needleEye(ctx, E.c.x, E.c.y, E.len, es.open, E.rot, es.alpha, E.squash, { fill: 0.2 });
    clippings(ctx, i, t);
    drawBall(env, spinAt(i, t), b.x, b.y, b.r, 1, 0, 0.95, 'pearl');
    spinMarks(ctx, b.x, b.y, b.r, simAt(t) * 22 + i, { squash: i === 0 ? 1 : i === 1 ? 0.42 : 0.55, alpha: 0.95 });
    drawSfx(ctx, i, t);
    ctx.restore();
  }

  // 6. Paper gutters and ink borders (the live panel's freeze thickens 3 -> 5 px with a 2 px kick).
  ctx.save();
  ctx.setTransform(pm);
  ctx.lineJoin = 'miter';
  const border = (i: number) => {
    const [a, l] = STOPS[i];
    if (i !== liveI || t < a || t >= a + l) return 3;
    return 5 + (t < a + 2 * STEP - 1e-6 ? 2 : 0);
  };
  for (const pass of [0, 1])
    PANELS.forEach((p, i) => {
      ctx.beginPath();
      polyPath(ctx, p.poly);
      const bw = border(i);
      ctx.strokeStyle = pass ? HEX.ink : HEX.paper;
      ctx.lineWidth = pass ? bw : bw + 6;
      ctx.stroke();
    });
  ctx.restore();

  // 7. Overlay, screen space: the thread outside the live panel (finished panels, gutters), the finished eyes.
  ctx.save();
  if (liveI >= 0) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.beginPath();
    ctx.rect(-10, -10, W + 20, H + 20);
    ctx.setTransform(pm);
    polyPath(ctx, PANELS[liveI].poly);
    ctx.clip('evenodd');
  }
  ctx.setTransform(S, 0, 0, S, 0, 0);
  stitch(ctx, thread);
  const fade = whole ? lerp(1, 0.55, clamp((t - PAGE.whole[0]) / 0.25)) : 1;
  for (let i = 0; i < 3; i++) {
    if (t < PANELS[i].live[1]) continue;
    const E = EYES[i];
    const q = panelM(pm, i, PANELS[i].live[1]).transformPoint(new DOMPoint(E.c.x, E.c.y));
    const es = eyeState(i, t);
    ctx.setTransform(S, 0, 0, S, 0, 0);
    needleEye(ctx, q.x / S, q.y / S, E.len * v.zoom * (i === 1 ? 1.08 : 1), es.open, E.rot, es.alpha * fade, E.squash, { fill: 0.2 });
  }
  ctx.restore();
}

/**
 * Shot 4's page at shot-local t (default: its first frame), drawn into env.ctx in screen space and inside the caller's
 * clip. No fx, no state: for shot 3's thread wipe, so the revealed page is pixel-identical to shot 4's t = 0.
 */
export function drawNeedlePage(env: Env, t = 0) {
  renderPage(env, t);
}

function render(env: Env, t: number) {
  renderPage(env, t);
  // 8. Post: the move's grade, a tiny chromatic pulse on each eye, the one-frame paper flash at the cut.
  const fx = env.fx;
  meridianGrade(fx, true);
  fx.ca = Math.max(...STOPS.map(([a]) => 0.004 * pulse(t, a, 0.12)));
  if (t >= DUR - STEP - 1e-6) paperFlash(fx, 1);
}

// ---------------------------------------------------------------- the shot

export const shotNeedle: Shot = {
  name: "Needle's eye",
  dur: DUR,
  seed: 404,
  prepare(env) {
    prepareAll(env);
  },
  init(env) {
    env.sfx.clearBus();
    env.cam.set(VW / 2, VH / 2, 1, 0);
    snapOk[0] = snapOk[1] = false;
  },
  rate,
  update() {
    // Stateless: every frame is a pure function of the shot clock (see simAt).
  },
  render,
  cues: [
    // The grass hiss over the stadium bed (shots 2-3's level), so the three freeze ducks dip a live crowd: MERIDIAN
    // never silences the stadium. It holds past eye 3 and tails off under shot 5's own bed.
    { at: 0, fn: (env) => (env.sfx.whoosh(2.2, 200, 600, 0.18), env.sfx.crowd(3.0, 0.16)) },
    { at: 0.42, fn: (env) => (env.sfx.tick(), env.sfx.pluck(N.E5, 1.2, 0.45), env.sfx.crack(0.2), env.sfx.duck(0.5, 0.16)) },
    { at: 0.68, fn: (env) => env.sfx.whoosh(0.12, 2000, 5000, 0.15) },
    { at: 1.05, fn: (env) => (env.sfx.pluck(N.Fs5, 1.2, 0.5), env.sfx.duck(0.5, 0.22)) },
    { at: 1.28, fn: (env) => (env.sfx.kick(0.3), env.sfx.crack(0.4)) },
    { at: 1.4, fn: (env) => env.sfx.whoosh(0.12, 2000, 5000, 0.15) },
    { at: 1.75, fn: (env) => (env.sfx.pluck(N.A5, 1.2, 0.55), env.sfx.duck(0.5, 0.15)) },
    { at: 2.05, fn: (env) => env.sfx.crowd(1.0, 0.25) },
    { at: 2.12, fn: (env) => env.sfx.pluck(N.D5, 0.6, 0.2) },
  ],
};
