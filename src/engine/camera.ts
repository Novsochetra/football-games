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
  /**
   * Shove (shared, GALE HAMMER v2): a damped spring offset in screen px (k 220, c 18: settles in about 0.35 s with a
   * small overshoot), kicked by shove(dx, dy). Added in apply() (before the roll) and in toUV().
   */
  shoveX = 0;
  shoveY = 0;
  private shoveVX = 0;
  private shoveVY = 0;
  /** Buffet (shared): a held anisotropic low-frequency shake in screen px, independent of trauma (see buffet()). */
  private buffetAmp = 0;
  private buffetHz = 9;
  private bx = 0;
  private by = 0;

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
    this.shoveX = this.shoveY = this.shoveVX = this.shoveVY = 0;
    this.buffetAmp = 0;
    this.buffetHz = 9;
    this.bx = this.by = 0;
  }

  /**
   * The pressure wave knocks the lens sideways: an impulse into the shove spring (velocity += 14 × the given screen px).
   * Shared by the v2 specials; pure on the camera clock (cam.update), so seek and replay are exact.
   */
  shove(dx: number, dy: number) {
    this.shoveVX += dx * 14;
    this.shoveVY += dy * 14;
  }

  /**
   * A held anisotropic low-frequency shake (y amplitude `amp` screen px, x amp × 0.35, value noise at `hz` on the
   * camera clock), independent of trauma, until buffet(0). Shared (the ride, the chase POV).
   */
  buffet(amp: number, hz = 9) {
    this.buffetAmp = Math.max(0, amp);
    this.buffetHz = hz;
    if (amp <= 0) this.bx = this.by = 0;
  }

  /** Screen-space offset (px) added by the shove spring and the buffet. */
  get screenOffset(): [number, number] {
    return [this.shoveX + this.bx, this.shoveY + this.by];
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
    if (this.shoveX || this.shoveY || this.shoveVX || this.shoveVY) {
      // Semi-implicit Euler in 4 substeps (stable for k 220 at any frame step).
      const n = 4, h = dt / n;
      for (let i = 0; i < n; i++) {
        this.shoveVX += (-220 * this.shoveX - 18 * this.shoveVX) * h;
        this.shoveVY += (-220 * this.shoveY - 18 * this.shoveVY) * h;
        this.shoveX += this.shoveVX * h;
        this.shoveY += this.shoveVY * h;
      }
      if (Math.abs(this.shoveX) + Math.abs(this.shoveY) < 0.01 && Math.abs(this.shoveVX) + Math.abs(this.shoveVY) < 0.05)
        this.shoveX = this.shoveY = this.shoveVX = this.shoveVY = 0;
    }
    if (this.buffetAmp > 0) {
      this.bx = noise1(this.t * this.buffetHz, 11) * this.buffetAmp * 0.35;
      this.by = noise1(this.t * this.buffetHz, 12) * this.buffetAmp;
    }
  }

  /** Apply world transform. `S` = device pixels per logical pixel. */
  apply(ctx: CanvasRenderingContext2D, S: number) {
    ctx.setTransform(S, 0, 0, S, 0, 0);
    ctx.translate(VW / 2 + this.shoveX + this.bx, VH / 2 + this.shoveY + this.by);
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
    return [(x + VW / 2 + this.shoveX + this.bx) / VW, (y + VH / 2 + this.shoveY + this.by) / VH];
  }
}
