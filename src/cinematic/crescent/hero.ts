// No.10 in CRIMSON CRESCENT: the drawn studio character (Pixel Studio "Sochetra"), never the puppet.
//  - Bicycle (side, shots 3-5): drawn in body space facing east, PLAYED FROM THE WEST STRIP (`flip`, so the
//    shirt numbers still read "10") and rotated by rot = -spin (the old puppet's whole-body spin) about the
//    pelvis (airborne) or the planted contact pixel (BK1-BK3). The camera adds its roll on top.
//  - Land + Stand Front (front view, shot 8): not mirrored, soles on row 102.
// Every effect pass (aura, rim, ghosts, impact cut-outs) is a tinted / silhouette copy of the same frame.

import { anim, drawAnim, type Silhouette, type StudioAnim } from '../../art/studioAnim';

export type Pt = [number, number];

/** A frame placed in the world: pivot `piv` (frame px, east coords, continuous) lands on (x, y). */
export interface Place {
  a: StudioAnim;
  i: number;
  x: number;
  y: number;
  /** World px per sprite px. */
  s: number;
  /** Rotation in radians (clockwise on screen) about the pivot. */
  rot: number;
  piv: Pt;
  flip: boolean;
}

export const bike = () => anim('Bicycle');
export const land = () => anim('Land');
export const stand = () => anim('StandFront');

/** Frame index by frame name (Bicycle 'BK7b', Land 'L3', StandFront 'a' / 'b'). */
export function fi(a: StudioAnim, name: string) {
  return a.index(name);
}

/**
 * Body-space joints the strip JSON does not carry, solved from the frames' rig poses (the Side rig the
 * roughs were built with; checked against the finals): both knees and ankles and the neck (base of the
 * skull). East frame coords at pixel centres. Used for effects only (the charge running down the kicking
 * leg in shot 4, halos, aura emitters).
 */
const RIG: Record<string, { kneeN: Pt; ankleN: Pt; kneeF: Pt; ankleF: Pt; neck: Pt }> = {
  BK1: { kneeN: [75.5, 63], ankleN: [73.2, 75.8], kneeF: [61.6, 77.1], ankleF: [59.8, 90], neck: [61.2, 32.4] },
  BK2: { kneeN: [74, 82.6], ankleN: [65.5, 92.5], kneeF: [63.6, 86.7], ankleF: [55.7, 76.4], neck: [54.4, 43.5] },
  BK3: { kneeN: [73.1, 74.1], ankleN: [74.6, 87], kneeF: [88.2, 57], ankleF: [91.3, 69.6], neck: [58.2, 30.7] },
  BK4: { kneeN: [57, 81.5], ankleN: [44, 82.4], kneeF: [82.3, 66], ankleF: [95.1, 68.3], neck: [55.7, 39.6] },
  BK5: { kneeN: [64, 83.5], ankleN: [51.7, 87.9], kneeF: [80.2, 60.1], ankleF: [92.3, 55.3], neck: [58.5, 38.9] },
  BK6: { kneeN: [71.1, 82], ankleN: [62, 91.3], kneeF: [75.4, 55.6], ankleF: [83.2, 45.1], neck: [62.4, 38.4] },
  BK7: { kneeN: [61.9, 83.3], ankleN: [50.9, 76.3], kneeF: [79.9, 60.3], ankleF: [83.2, 47.6], neck: [66.4, 38.4] },
  BK7b: { kneeN: [61.9, 83.3], ankleN: [51.1, 76.1], kneeF: [79.9, 60.3], ankleF: [83.2, 47.6], neck: [66.4, 38.4] },
  BK8: { kneeN: [58.4, 82.3], ankleN: [52.4, 70.7], kneeF: [79.9, 60.4], ankleF: [83.2, 47.7], neck: [66.6, 38.4] },
  BK8b: { kneeN: [57.5, 81.8], ankleN: [52.3, 69.8], kneeF: [79.8, 60.2], ankleF: [82.8, 47.5], neck: [66.7, 38.4] },
  BK9: { kneeN: [79.5, 67.4], ankleN: [88.5, 76.8], kneeF: [75.4, 81.9], ankleF: [71.7, 94.5], neck: [70, 38.8] },
  BK10: { kneeN: [79.5, 68.5], ankleN: [92.6, 69], kneeF: [73.5, 83.1], ankleF: [67.3, 94.6], neck: [72.8, 39.5] },
  BK11: { kneeN: [78.8, 63.8], ankleN: [91.5, 60.7], kneeF: [68, 84.3], ankleF: [56.9, 91.2], neck: [71.8, 39.2] },
  BK12: { kneeN: [78.9, 64.3], ankleN: [89.4, 72], kneeF: [77.5, 80.2], ankleF: [68.4, 89.5], neck: [68.7, 38.6] },
  BK12b: { kneeN: [78.2, 62.3], ankleN: [84.7, 73.7], kneeF: [80.5, 76.7], ankleF: [72, 86.6], neck: [70.8, 39] },
  BK12c: { kneeN: [78.2, 62.3], ankleN: [80.8, 75.1], kneeF: [80.5, 76.7], ankleF: [69.3, 83.5], neck: [70.8, 39] },
};

/**
 * A named frame point in east frame coords (continuous: pixel index + 0.5): 'pelvis', 'contact' (bottom
 * centre of the contact pixel), 'com', any JSON anchor (head, eye, toeN, toeF, laces, boot, ball, catch,
 * handN, handF...) or a rig joint (kneeN, ankleN, kneeF, ankleF, neck).
 */
export function framePt(a: StudioAnim, i: number, name: string): Pt {
  const f = a.frames[i];
  if (name === 'pelvis') return [f.pelvis[0] + 0.5, f.pelvis[1] + 0.5];
  if (name === 'contact' && f.contact) return [f.contact[0] + 0.5, f.contact[1] + 1];
  if (name === 'com') return [f.com[0], f.com[1]];
  const v = f.anchors[name];
  if (v) return [v[0] + 0.5, v[1] + 0.5];
  const r = RIG[f.name] as Record<string, Pt> | undefined;
  if (r && r[name]) return [r[name][0], r[name][1]];
  return [f.pelvis[0] + 0.5, f.pelvis[1] + 0.5];
}

/** Place frame i so its pelvis (or, with onContact, its planted contact pixel) lands on (x, y). */
export function place(a: StudioAnim, i: number, x: number, y: number, s: number, rot: number, flip: boolean, onContact = false): Place {
  return { a, i, x, y, s, rot, flip, piv: framePt(a, i, onContact && a.frames[i].contact ? 'contact' : 'pelvis') };
}

/** World position of a frame point (east frame coords) for this placement. */
export function worldPt(p: Place, q: Pt): Pt {
  const dx = (p.flip ? p.piv[0] - q[0] : q[0] - p.piv[0]) * p.s;
  const dy = (q[1] - p.piv[1]) * p.s;
  const c = Math.cos(p.rot), s = Math.sin(p.rot);
  return [p.x + dx * c - dy * s, p.y + dx * s + dy * c];
}

/** World position of a named point (see framePt). */
export function at(p: Place, name: string): Pt {
  return worldPt(p, framePt(p.a, p.i, name));
}

/** The same placement re-anchored on another named point (its world position is kept). */
export function pivotOn(p: Place, name: string): Place {
  const [x, y] = at(p, name);
  return { ...p, x, y, piv: framePt(p.a, p.i, name) };
}

/**
 * Draw the placed frame: `img` null = the frame itself (west strip when flipped, numbers read "10"), or
 * a tinted / silhouette copy of it. `k` scales about the pivot (aura volumes), (ox, oy) offsets in world px.
 */
export function drawPlace(ctx: CanvasRenderingContext2D, p: Place, img: HTMLCanvasElement | null = null, alpha = 1, k = 1, ox = 0, oy = 0) {
  if (alpha <= 0) return;
  drawAnim(ctx, p.a, img, p.i, p.x + ox, p.y + oy, p.s * k, { pivot: p.piv, rot: p.rot, flip: p.flip, alpha: Math.min(1, alpha) });
}

/** Silhouette copy for this placement (rim on the world-space light side, see studioAnim). */
export function silOf(p: Place, s: Silhouette): HTMLCanvasElement {
  return p.a.silhouette(p.i, s, p.rot, p.flip);
}

/** Pick a frame from [startTime, frameName] keys (sorted by time). */
export function keyAt(keys: readonly (readonly [number, string])[], t: number): string {
  let n = keys[0][1];
  for (const [k, name] of keys) if (t >= k - 1e-6) n = name;
  return n;
}

/**
 * The ball at the strike, relative to the pelvis, for BK10 drawn with rotation `rot` at scale `s`: the ball
 * of radius `ballR` (world px) sits tangent to the instep pixel (`boot`), along the laces' normal (the
 * BK10 Ball-layer centroid direction). This is exactly where the boot meets it.
 */
export function strikeBallOffset(s: number, rot: number, ballR: number): Pt {
  const a = bike();
  const p = place(a, fi(a, 'BK10'), 0, 0, s, rot, true);
  const boot = at(p, 'boot');
  const ctr = at(p, 'ball');
  const dx = ctr[0] - boot[0], dy = ctr[1] - boot[1];
  const l = Math.hypot(dx, dy) || 1;
  const d = ballR + 0.5 * s; // ball radius + half the boot pixel
  return [boot[0] + (dx / l) * d, boot[1] + (dy / l) * d];
}

/** Sprite scale in shot 3 (the puppet's k 1 at 2x: same height, 2-px pixels). */
export const S3 = 2;
/** Sprite scale in shots 4-5 (the puppet's k 1.2 at 2x: the inverted world is framed 1.2x closer). */
export const S45 = 2.4;
/** Whole-body rotation at the strike (the old bikeStrike spin -2.0): rot = -spin. */
export const STRIKE_ROT = 2.0;
