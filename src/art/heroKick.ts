// No.10's hand-drawn side-view FLICK and OVERHEAD VOLLEY: 8 frames of 128x128 (facing east), drawn
// on the jump's model and canvas registration, used by ZENITH METEOR shot 3 (stand, K1 load, K2 scoop,
// K3 follow-through) and shot 5 (V0 snap open, V1 volley load, V2 strike, V3 follow-through) in
// place of the skeletal puppet.
//
// Same anchors and derived images as heroJump (see there). Extra anchor: `ball`, the pixel where the
// foot meets the ball on the strike frames (K2 toe under the ball, V2 instep).
// Registration: the K frames' contact is the far (standing) boot ball (72,102); the jump F1/F2
// contact is the near boot ball (69,102) on the same canvas, so a K frame sits at the jump contact
// x + 3 sprite px and the standing boot never slides at the K3 -> F1 cut.

import stripUrl from './hero_kick_side.png';
import meta from './hero_kick.json';
import { drawStrip, loadStrip, type HeroStrip, type JumpDraw } from './heroJump';

/** Frame indices (0-based) by name. */
export const KF = { stand: 0, k1: 1, k2: 2, k3: 3, v0: 4, v1: 5, v2: 6, v3: 7 } as const;

/** Sprite px the K frames' contact sits right of the jump F1/F2 contact (same standing boot). */
export const KICK_CONTACT_DX = 3;

let K: HeroStrip | null = null;

/** The loaded flick/volley frames (call after loadHeroKick has resolved at boot). */
export function heroKick(): HeroStrip {
  if (!K) throw new Error('hero kick sprite not loaded');
  return K;
}

export async function loadHeroKick(): Promise<HeroStrip> {
  if (!K) K = await loadStrip(stripUrl, meta);
  return K;
}

/** Ball-contact point of frame i in frame pixels (pixel centre), or null. */
export function kickBallOf(i: number): [number, number] | null {
  const b = heroKick().frames[i].ball;
  return b ? [b[0] + 0.5, b[1] + 0.5] : null;
}

/** drawJump for the kick strip. */
export function drawKick(ctx: CanvasRenderingContext2D, img: HTMLCanvasElement | null, i: number, x: number, y: number, scale: number, o: JumpDraw = {}) {
  drawStrip(ctx, heroKick(), img, i, x, y, scale, o);
}
