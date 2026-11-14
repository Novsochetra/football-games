import { noise1 } from './math';

/** Logical resolution every scene is authored in. The canvas scales this up. */
export const VW = 640;
export const VH = 360;

/**
 * 2D cinematic camera: position, zoom, roll, and trauma-based shake
 * (shake = trauma^2, so small hits stay subtle and big hits feel violent).
 */
export class Camera {
  x = VW / 2;
  y = VH / 2;
  zoom = 1;
  rot = 0;
  trauma = 0;
  /** Max shake offset in logical px at trauma 1. */
  shakeAmp = 14;
  shakeRoll = 0.05;
  traumaDecay = 1.6;
  private t = 0;
  private sx = 0;
  private sy = 0;
  private sr = 0;

  reset() {
    this.x = VW / 2;
    this.y = VH / 2;
    this.zoom = 1;
    this.rot = 0;
    this.trauma = 0;
    this.shakeAmp = 14;
    this.shakeRoll = 0.05;
    this.traumaDecay = 1.6;
    this.t = 0;
    this.sx = this.sy = this.sr = 0;
  }

  set(x: number, y: number, zoom = 1, rot = 0) {
    this.x = x;
    this.y = y;
    this.zoom = zoom;
    this.rot = rot;
  }

  hit(amount: number) {
    this.trauma = Math.min(1, this.trauma + amount);
  }

  update(dt: number) {
    this.t += dt;
    this.trauma = Math.max(0, this.trauma - this.traumaDecay * dt);
    const s = this.trauma * this.trauma;
    const f = 28;
    this.sx = noise1(this.t * f, 1) * this.shakeAmp * s;
    this.sy = noise1(this.t * f, 2) * this.shakeAmp * s;
    this.sr = noise1(this.t * f, 3) * this.shakeRoll * s;
  }

  /** Apply world transform. `S` = device pixels per logical pixel. */
  apply(ctx: CanvasRenderingContext2D, S: number) {
    ctx.setTransform(S, 0, 0, S, 0, 0);
    ctx.translate(VW / 2, VH / 2);
    ctx.rotate(this.rot + this.sr);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.x + this.sx, -this.y + this.sy);
  }

  /** World point -> screen UV (0..1), used to place post-FX shockwaves. */
  toUV(wx: number, wy: number): [number, number] {
    const r = this.rot + this.sr;
    let dx = (wx - this.x + this.sx) * this.zoom;
    let dy = (wy - this.y + this.sy) * this.zoom;
    const c = Math.cos(r), s = Math.sin(r);
    const x = dx * c - dy * s;
    const y = dx * s + dy * c;
    return [(x + VW / 2) / VW, (y + VH / 2) / VH];
  }
}
