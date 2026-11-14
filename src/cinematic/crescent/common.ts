// Shared constants for the CRIMSON CRESCENT shots (generic helpers live in ../kit).

import type { RGB } from '../../engine/math';
import type { Shot } from '../timeline';
import { VW, VH } from '../../engine/camera';
import { pixelText } from '../../art/fx';

export * from '../kit';
export { crescentArc, crescentPath } from '../../art/fx';

export const SHOT_NAME = 'CRIMSON CRESCENT';

/** Signature palette: crimson fire, silver-white edges, deep indigo night. */
export const PAL: Record<'crimson' | 'rose' | 'silver' | 'indigo' | 'night' | 'gold', RGB> = {
  crimson: [222, 26, 66],
  rose: [255, 122, 152],
  silver: [242, 245, 255],
  indigo: [22, 16, 58],
  night: [8, 6, 22],
  gold: [252, 185, 76],
};

/**
 * Continuity: the goal is to the RIGHT (+x). No.10 stands in the box with his BACK to goal,
 * so in side views he faces LEFT (facing = -1: the Bicycle frames play from their west strip). The cross arrives from the right wing,
 * high, dropping above him. The bicycle kick sends the ball to the RIGHT, toward goal.
 */
export const HERO_FACING = -1 as const;

/** Temporary stand-in used until a shot is implemented. */
export function placeholderShot(name: string, dur: number, seed: number, idx: number): Shot {
  return {
    name,
    dur,
    seed,
    init(env) {
      env.cam.set(VW / 2, VH / 2, 1, 0);
    },
    update() {},
    render(env, t) {
      env.screen();
      const ctx = env.ctx;
      ctx.fillStyle = '#0b0614';
      ctx.fillRect(0, 0, VW, VH);
      pixelText(ctx, `SHOT ${idx} · ${name.toUpperCase()}`, VW / 2, VH / 2 - 12, 14, '#ffffff', 'center');
      pixelText(ctx, `${t.toFixed(2)} / ${dur.toFixed(2)}s  (in production)`, VW / 2, VH / 2 + 10, 10, '#9f98bd', 'center');
    },
  };
}
