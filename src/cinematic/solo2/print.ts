// SPOTLIGHT SOLO v2: StrobePrint (SPEC.md §3 "The prints and the falls", §10.4 item 20). A snapshot plus an ordinary fall:
// each defender is beaten by a real skill and falls IN REAL TIME; the strobe pop at popAt photographs his mid-defeat pose
// into a cached neon print that hangs where he was, while his body completes the fall and rests on the turf under it.
// Nobody is ever frozen, nothing falls late; at the relight only the prints shatter. Everything is a pure function of
// the global time (the falls are keyed poses, the shatter's glass comes from shatterBurst in a cue), so shots seek exactly.

import type { Env } from '../timeline';
import { clamp, ease, lerp, type RGB } from '../../engine/math';
import { PK, drawGlow, glowOf } from '../../engine/particles';
import { mixPose, renderPuppet, type Kit, type Pose } from '../../art/puppet';
import { PAL, PUPPETS, DEF_SIL, TOWER_BULK } from './common';

/** One key of a fall: at global t the body is in `pose` at field (x, z), its hip h world px up, turned rot (rad). */
export interface FallKey {
  t: number;
  pose: Pose;
  x: number;
  z: number;
  h: number;
  rot: number;
}

export interface PrintDef {
  id: 'A' | 'B' | 'C' | 'D';
  kit: Kit;
  /** The Tower (D): drawn 1.3x wide. */
  tower?: boolean;
  /** The pop (global): the print is made. */
  popAt: number;
  /** The print: the body's pose at the pop, where it hangs (field x, z, hip h world px) and its turn (rad). */
  printPose: Pose;
  printName: string;
  print: { x: number; z: number; h: number; rot: number };
  /** The body's fall from the pop (global times, real time). The last key is the rest pose at landAt. */
  fall: readonly FallKey[];
  landAt: number;
  restName: string;
  /** The trophy spot clanks on over print and body. */
  trophyAt: number;
  /** The relight: the print shatters into glass and light. */
  shatterAt: number;
}

export interface PrintState {
  phase: 'live' | 'falling' | 'down';
  pose: Pose;
  x: number;
  z: number;
  h: number;
  rot: number;
  print: null | { pose: Pose; x: number; z: number; h: number; rot: number };
  shattered: boolean;
  /** 0..1 strength of the pop flash (3 frames from popAt). */
  pop: number;
}

/** A projector from field (x, z, h) to the screen: x, y and the screen px per world px. */
export type Project = (x: number, z: number, h?: number) => { x: number; y: number; s: number; k?: number };

/** Puppet units per world px (a standing player, ~100 units, is 1.8 m = 18 world px tall). */
const UNIT = 0.18;

const neonCache = new Map<string, { cv: HTMLCanvasElement; ox: number; oy: number }>();
let readCv: HTMLCanvasElement | null = null;

/**
 * The neon print of a pose (cached, never re-posed): fill uvDeep, a 1-2 px volt edge, an ivory core on the lit side
 * (from the top), a faint ivory after-glow (drawn with it). k = the puppet's px per unit (render scale).
 */
function neonPrint(kit: Kit, pose: Pose, name: string, k: number): { cv: HTMLCanvasElement; ox: number; oy: number } {
  const key = `${name}|${kit.shirt[0]}|${k}`;
  let r = neonCache.get(key);
  if (r) return r;
  const out = renderPuppet(kit, pose, { k, facing: -1 });
  const w = out.cv.width + 4, h = out.cv.height + 4;
  // Read the render back through one reusable willReadFrequently canvas (the puppet buffer is shared and drawn to often).
  readCv ??= document.createElement('canvas');
  readCv.width = out.cv.width;
  readCv.height = out.cv.height;
  const rg = readCv.getContext('2d', { willReadFrequently: true })!;
  rg.clearRect(0, 0, readCv.width, readCv.height);
  rg.drawImage(out.cv, 0, 0);
  const src = rg.getImageData(0, 0, out.cv.width, out.cv.height).data;
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const g = cv.getContext('2d')!;
  const img = g.createImageData(w, h);
  const d = img.data;
  const op = (x: number, y: number) => x >= 0 && y >= 0 && x < out.cv.width && y < out.cv.height && src[(y * out.cv.width + x) * 4 + 3] > 40;
  const put = (x: number, y: number, c: RGB) => {
    const i = ((y + 2) * w + (x + 2)) * 4;
    d[i] = c[0];
    d[i + 1] = c[1];
    d[i + 2] = c[2];
    d[i + 3] = 255;
  };
  for (let y = -2; y < out.cv.height + 2; y++)
    for (let x = -2; x < out.cv.width + 2; x++) {
      if (op(x, y)) {
        const edge = !op(x - 1, y) || !op(x + 1, y) || !op(x, y - 1) || !op(x, y + 1);
        const top = !op(x, y - 1) || !op(x, y - 2);
        put(x, y, edge ? PAL.volt : top ? PAL.ivory : PAL.uvDeep);
      } else if (op(x - 1, y) || op(x + 1, y) || op(x, y - 1) || op(x, y + 1)) put(x, y, PAL.uv);
    }
  g.putImageData(img, 0, 0);
  neonCache.set(key, (r = { cv, ox: out.ox + 2, oy: out.oy + 2 }));
  return r;
}

export class StrobePrint {
  constructor(public def: PrintDef) {}

  /** What exists at global time gt. */
  at(gt: number): PrintState {
    const d = this.def;
    const f = d.fall;
    let pose = f[0].pose, x = f[0].x, z = f[0].z, h = f[0].h, rot = f[0].rot;
    if (gt >= f[f.length - 1].t) ({ pose, x, z, h, rot } = f[f.length - 1]);
    else if (gt > f[0].t)
      for (let i = 1; i < f.length; i++) {
        if (gt > f[i].t) continue;
        const a = f[i - 1], b = f[i];
        const u = ease.inOutQuad(clamp((gt - a.t) / Math.max(1e-3, b.t - a.t)));
        pose = mixPose(a.pose, b.pose, u);
        x = lerp(a.x, b.x, u);
        z = lerp(a.z, b.z, u);
        h = lerp(a.h, b.h, u);
        rot = lerp(a.rot, b.rot, u);
        break;
      }
    const phase = gt < d.popAt ? 'live' : gt < d.landAt ? 'falling' : 'down';
    const shattered = gt >= d.shatterAt;
    const print = gt >= d.popAt && !shattered ? { pose: d.printPose, ...d.print } : null;
    const pop = gt >= d.popAt && gt < d.popAt + 3 / 60 ? 1 - (gt - d.popAt) * 20 : 0;
    return { phase, pose, x, z, h, rot, print, shattered, pop };
  }

  /** Pre-render the print's neon snapshot at the scales a shot uses (prepare()). */
  warm(ks: readonly number[]) {
    for (const k of ks) neonPrint(this.def.kit, this.def.printPose, this.def.printName, k);
  }

  /**
   * Draw the body (a live puppet while it falls, a cached rest pose when down: PuppetCache either way), its neon print
   * (at `printAlpha`, 0.6 for background prints), the pop flash and the trophy spot's local light. `lit` 0..1 crossfades
   * the body from the dark-stage silhouette to full colour. The caller draws the trophy beam (stage.trophy) itself.
   */
  draw(ctx: CanvasRenderingContext2D, project: Project, gt: number, o: { lit?: number; printAlpha?: number; body?: boolean; noPrint?: boolean } = {}) {
    const d = this.def;
    const s = this.at(gt);
    const bulk = d.tower ? TOWER_BULK : 1;
    if (o.body !== false) {
      const p = project(s.x, s.z, s.h);
      const k = kBucket(UNIT * p.s);
      const D = (UNIT * p.s) / k;
      const name = s.phase === 'down' ? d.restName : s.phase === 'live' ? 'live' : `fall${Math.round(gt * 60)}`;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(bulk, d.tower ? 1.06 : 1);
      PUPPETS.draw(ctx, `${d.id}:${name}`, d.kit, s.pose, k, -1, 0, 0, D, o.lit ?? 1, { ...DEF_SIL, lx: 0, ly: -1 }, 1, s.rot);
      ctx.restore();
    }
    if (s.print && !o.noPrint) {
      const p = project(s.print.x, s.print.z, s.print.h);
      const k = kBucket(UNIT * p.s);
      const D = (UNIT * p.s) / k;
      const r = neonPrint(d.kit, d.printPose, d.printName, k);
      const a = clamp(o.printAlpha ?? 1);
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.translate(p.x, p.y);
      ctx.rotate(s.print.rot);
      ctx.scale(bulk, d.tower ? 1.06 : 1);
      // The faint ivory after-glow behind it, then the print itself.
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf(PAL.ivory), 0, -20 * UNIT * p.s, 40 * UNIT * p.s, 0.18 * a);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = a;
      ctx.drawImage(r.cv, -r.ox * D, -r.oy * D, r.cv.width * D, r.cv.height * D);
      ctx.restore();
    }
    if (s.pop > 0) {
      // The strobe pop: a local flash-bulb (radius <= 90 px, 3 frames) at his chest. Never full frame.
      const p = project(d.print.x, d.print.z, d.print.h + 8);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glowOf([255, 255, 255]), p.x, p.y, Math.min(90, 40 + 30 * p.s), s.pop);
      drawGlow(ctx, glowOf(PAL.volt), p.x, p.y, Math.min(90, 60 + 30 * p.s), 0.6 * s.pop);
      ctx.restore();
    }
  }
}

/** Snap a puppet render scale to a small set of buckets (so the caches stay few and crisp). */
function kBucket(k: number) {
  const b = [0.25, 0.35, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6];
  let best = b[0];
  for (const v of b) if (Math.abs(v - k) < Math.abs(best - k)) best = v;
  return best;
}

/**
 * A print shattering (call once from a cue at shatterAt, particles in the caller's transform): 24 PK.Glass glints and a
 * burst of volt-ivory streaks round (x, y) (the light splash is stage.splash, drawn by the shot).
 */
export function shatterBurst(env: Env, x: number, y: number, power = 1) {
  const { rng, parts } = env;
  for (let i = 0; i < 24; i++) {
    const a = rng.range(0, Math.PI * 2), sp = rng.range(40, 220) * power;
    parts.spawn({
      kind: PK.Glass, x: x + rng.range(-6, 6), y: y + rng.range(-10, 6), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, ay: 420, drag: 0.8,
      max: rng.range(0.5, 1.1), s0: rng.range(1, 2.2), s1: 1, ramp: 'glass', r0: 0, r1: 1, a0: 1, a1: 0.1, k: 0.35, layer: 1,
    });
  }
  for (let i = 0; i < 10; i++) {
    const a = rng.range(0, Math.PI * 2), sp = rng.range(80, 260) * power;
    parts.spawn({
      kind: PK.Streak, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 3, max: rng.range(0.2, 0.4), s0: 1.5, s1: 0.4,
      ramp: 'uv', r0: 0, r1: 0.8, k: 1, layer: 1,
    });
  }
}
