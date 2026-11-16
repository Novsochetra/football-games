// SPOTLIGHT SOLO v2: the glue cam (SPEC.md §6 shot 7a, §10.6 item 28), faked in screen space (no pitch3D): the ball
// is fixed at (320, 290) at r 52 while a turf plane (mowing stripe bands and lilac fluorescent line segments in a
// ground frame) flows past at 6.5 m/s and turns with the fake yaw psi; the stands are a dark band above the horizon
// that slides 8 px per degree of psi (parallax 0.2x) with phone lights. The shot sets fx.streak along the tangent during
// the whips with a sharp hole on the ball (R 0.12). Pure function of (psi, flow, t).

import { clamp, lerp } from '../../engine/math';
import { drawGlow, glowOf } from '../../engine/particles';
import { VW, VH } from '../../engine/camera';

/** The ball's fixed screen position and radius in the glue cam. */
export const GLUE_BALL = { x: 320, y: 290, r: 52 } as const;

export interface GlueOpts {
  /** Screen y of the horizon (default 150). */
  horizon?: number;
  /** Eye height above the turf (world px; 1.5 = 0.15 m) and the focal length (screen px). */
  eye?: number;
  f?: number;
  /** Stage dim already applied by the caller? (default false: the turf is drawn at the dimmed stage level here). */
  lit?: number;
  /** Phone lights in the stands band (default 120). */
  phones?: number;
  /** The camera's heading off his running line (degrees, default 30: the front-right three-quarter). */
  heading?: number;
}

const h01 = (i: number, s: number) => {
  const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/**
 * Draw the glue cam's world: the stands band (sliding 8 px per degree of psi), then the turf plane rotated by psi
 * (degrees) and scrolled by `flow` world px along the running line, with fluorescent line segments. Screen space.
 */
export function glueGround(ctx: CanvasRenderingContext2D, psi: number, flow: number, t: number, o: GlueOpts = {}) {
  const hz = o.horizon ?? 150, eye = o.eye ?? 1.5, f = o.f ?? 420;
  const lit = clamp(o.lit ?? 1);
  // Stands: a dark band with a roofline, sliding 8 px per degree of psi.
  const slide = -psi * 8;
  ctx.save();
  ctx.fillStyle = '#07040f';
  ctx.fillRect(0, 0, VW, hz + 2);
  ctx.fillStyle = '#0d0820';
  ctx.fillRect(0, hz - 46, VW, 46);
  ctx.globalCompositeOperation = 'lighter';
  const n = o.phones ?? 120;
  for (let i = 0; i < n; i++) {
    const span = 2400;
    const x = ((((h01(i, 1) * span + slide) % span) + span) % span) - 880;
    if (x < -4 || x > VW + 4) continue;
    const y = hz - 44 + h01(i, 2) * 40;
    const k = 0.5 + 0.5 * Math.sin(t * (1 + h01(i, 3)) + i);
    const c: [number, number, number] = i % 3 === 0 ? [201, 182, 255] : [246, 240, 223];
    drawGlow(ctx, glowOf(c), x, y, 3, 0.3 * k * lit);
    ctx.globalAlpha = clamp(k * lit);
    ctx.fillStyle = i % 3 === 0 ? '#C9B6FF' : '#F6F0DF';
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  // Turf: the ground plane in a frame rotated by psi. Camera ground coords: X across (right +), Z forward.
  ctx.fillStyle = lit < 1 ? `rgb(${Math.round(lerp(12, 36, lit))},${Math.round(lerp(28, 110, lit))},${Math.round(lerp(18, 46, lit))})` : '#245f2d';
  ctx.fillRect(0, hz, VW, VH - hz);
  // The running line is `heading` + psi degrees off the camera's forward axis (the glue cam rides 30 deg off his line).
  const th = (((o.heading ?? 30) + psi) * Math.PI) / 180;
  const st = Math.sin(th), ct = Math.cos(th);
  // Ground point (s along the running line, c across it) -> camera ground (X right, Z forward).
  const toCam = (s: number, c: number): [number, number] => [s * st + c * ct, s * ct - c * st];
  const NEAR = 0.6;
  const proj = (X: number, Z: number): [number, number] => [VW / 2 + (f * X) / Z, hz + (f * eye) / Z];
  /** A ground polygon clipped to Z >= NEAR, projected. */
  const poly = (pts: [number, number][]): [number, number][] => {
    const cam = pts.map(([sv, cv]) => toCam(sv, cv));
    const out: [number, number][] = [];
    for (let i = 0; i < cam.length; i++) {
      const A = cam[i], B = cam[(i + 1) % cam.length];
      const ina = A[1] >= NEAR, inb = B[1] >= NEAR;
      if (ina) out.push(A);
      if (ina !== inb) {
        const u = (NEAR - A[1]) / (B[1] - A[1]);
        out.push([A[0] + (B[0] - A[0]) * u, NEAR]);
      }
    }
    return out.map(([X, Z]) => proj(X, Z));
  };
  const W = 50; // a 5 m mowing stripe
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, hz, VW, VH - hz);
  ctx.clip();
  const off = ((flow % (2 * W)) + 2 * W) % (2 * W);
  for (let k = -12; k <= 12; k++) {
    // Bands across the running line: they rush past the ball as `flow` grows.
    const s0 = k * 2 * W - off, s1 = s0 + W;
    const q = poly([[s0, -600], [s0, 600], [s1, 600], [s1, -600]]);
    if (q.length < 3) continue;
    ctx.fillStyle = lit < 1 ? `rgba(60,150,70,${0.28 * lit + 0.06})` : '#2f8a3c';
    ctx.beginPath();
    q.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.closePath();
    ctx.fill();
  }
  // Fluorescent line segments (lilac, additive) in the ground frame.
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = 'rgba(201,182,255,0.55)';
  for (let i = 0; i < 18; i++) {
    // Short painted-line segments lying along the running line, scattered across it, flowing past.
    const c = (h01(i, 5) - 0.5) * 160;
    const sv = ((((h01(i, 6) * 400 - flow) % 400) + 400) % 400) - 60;
    const [X0, Z0] = toCam(sv, c), [X1, Z1] = toCam(sv + 8, c);
    if (Z0 < NEAR || Z1 < NEAR) continue;
    const p0 = proj(X0, Z0), p1 = proj(X1, Z1);
    ctx.lineWidth = Math.max(1, (f * 0.12) / Math.max(1, (Z0 + Z1) / 2));
    ctx.beginPath();
    ctx.moveTo(p0[0], p0[1]);
    ctx.lineTo(p1[0], p1[1]);
    ctx.stroke();
  }
  ctx.restore();
  ctx.restore();
}
