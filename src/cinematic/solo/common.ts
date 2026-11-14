// SPOTLIGHT SOLO — shared constants and helpers for every shot (SPEC.md "Engine cheat-sheet", "The beat").
//
// Continuity (all shots): night stadium, no moon and no sky shot; the goal is to the RIGHT (+x) and in side views
// No.10 runs east (his studio Side view, unmirrored: HERO_FACING = 1). In front views the camera stands between
// him and the goal, so screen-left is HIS RIGHT. The follow-spot rigs hang on the roof of the main stand: his beam
// enters from the top of frame (top-right in side views, top-centre in front views) and lights a pool under him;
// shot 5 is the one exception (spot behind the camera, footlights). The keeper's beam (shot 7) enters top-left.
// Defenders wait in the dark as plum figures with lilac rims and turn full colour inside the pool. No.10 is always
// studio-drawn (./frames.ts), never a puppet. Roll is 0 in every shot (apart from shake); sat stays 1; the mix is
// never filtered; no exposure is ever a decoy that a defender hits.

import type { Env } from '../timeline';
import type { FxState } from '../../engine/post';
import { VW, VH } from '../../engine/camera';
import { clamp, ease, lerp, type RGB } from '../../engine/math';
import { renderPuppet, type Kit, type Pose } from '../../art/puppet';
import { drawSoloGhost, type GhostOpts, type SoloKey } from './frames';

export * from '../kit';
export * from './frames';
export { stage, FollowSpot, DIM_MAX, DIM_RGB, PENALTY_SPOT, dimColor, type StagePool, type BeamOpts } from '../../art/stage';
export { lampTitle, marqueeTag, fourCount, MARQUEE, pixelText, lensFlare, sparkle, TITLE_FONT, PIXEL_FONT } from '../../art/fx';
export { drawFieldBackdrop, drawPhoneLights, drawGoal, drawShadow, FIELD, type FieldBackdropOpts } from '../../art/stadium';
export { POSES, P, RIVAL_KIT, RIVAL_KIT_B, RIVAL_KIT_C, RIVAL_KIT_D, KEEPER_KIT, HERO_KIT, joints, jointWorld, renderPuppet, drawPuppet } from '../../art/puppet';

export const SHOT_NAME = 'SPOTLIGHT SOLO';
/** In side views he runs east, his studio Side view unmirrored. */
export const HERO_FACING = 1;

// ---------------------------------------------------------------- palette

/** Signature palette (SPEC "Palette"): ultraviolet / violet + ivory over plum; his red shirt is the only warm colour. */
export const PAL: Record<'uv' | 'lilac' | 'ivory' | 'uvDeep' | 'plum' | 'kit', RGB> = {
  uv: [122, 77, 255],
  lilac: [201, 182, 255],
  ivory: [246, 240, 223],
  uvDeep: [42, 22, 96],
  plum: [22, 10, 38],
  kit: [223, 35, 33],
};
/** The same colours as CSS hex strings. */
export const HEX = { uv: '#7A4DFF', lilac: '#C9B6FF', ivory: '#F6F0DF', uvDeep: '#2A1660', plum: '#160A26', kit: '#DF2321' } as const;
/** The stage dim layer's multiply colour at level 1 (stage.dim). */
export const DIM: RGB = [70, 52, 120];
/** Fade colour into the result view (and the end of shot 7). */
export const FADE: RGB = [8, 4, 14];

// ---------------------------------------------------------------- the beat (tempo map)

/** One tempo for the whole special: 150 BPM. A beat is 0.4 s (24 frames), an 8th 0.2 s, a 16th 0.1 s (6 frames). */
export const BPM = 150;
export const BEAT = 0.4;
export const EIGHTH = 0.2;
export const SIXTEENTH = 0.1;
/** The grid's beat 0 is global 1.4 s, the first frame of shot 2 (shot 1 is the count-in). */
export const GRID0 = 1.4;
/** Global start time of each shot (index 0 = shot 1) and the total (index 7 = 11.0 s). */
export const SHOT_T0 = [0, 1.4, 2.6, 4.2, 6.2, 7.4, 8.6, 11.0] as const;
/** Bars: the ONE of bar n (1-6) at global GRID0 + (n-1)·4 beats: 1.4, 3.0, 4.6, 6.2, 7.8, 9.4. */
export const BAR = (n: number) => GRID0 + (n - 1) * 4 * BEAT;
/** Global time of shot-local time t in shot (1-7). */
export const globalT = (shot: number, t: number) => SHOT_T0[shot - 1] + t;
/** Beat number (fractional) at global time gt (beat 0 = 1.4 s). */
export const beatOf = (gt: number) => (gt - GRID0) / BEAT;
/** Snap a time to the grid (default the 16th). */
export const snapGrid = (t: number, grid = SIXTEENTH) => Math.round(t / grid) * grid;
/** True if t sits on the grid (shot-local times work too: every shot from 2 on starts on a whole beat). */
export const isOnGrid = (t: number, grid = SIXTEENTH) => Math.abs(t / grid - Math.round(t / grid)) < 1e-6;
const warned = new Set<string>();
/**
 * Dev assert for a listed cue (touches, skill keys, lamps, OLÉs): warns once if `t` is off the 16th grid.
 * Returns t, so it can wrap a cue time: `{ at: onGrid(0.4, 'THE SELL'), fn }`.
 */
export function onGrid(t: number, what = '', grid = SIXTEENTH): number {
  if (!isOnGrid(t, grid)) {
    const k = `${what}@${t}`;
    if (!warned.has(k)) {
      warned.add(k);
      console.warn(`SPOTLIGHT SOLO: cue ${what || ''} at ${t} s is off the ${grid} s grid`);
    }
  }
  return t;
}
/** 0..1 pulse that snaps to 1 on every `every` (default a beat) of t and decays over `decay` s (HUD lamps, gauge). */
export const beatPulse = (t: number, every = BEAT, decay = 0.12) => {
  const ph = ((t % every) + every) % every;
  return clamp(1 - ph / decay);
};

/** Tom pitches (Hz): lower toms for the right foot, higher for the left. */
export const TOMS = { D2: 73.42, F2: 87.31, A2: 110, C3: 130.81, D3: 146.83 } as const;

// ---------------------------------------------------------------- grade, impact, echo

/**
 * The SPOTLIGHT SOLO grade (every shot unless noted): tint [238,230,255], sat 1 (never desaturate), contrast 1.06,
 * bloom 0.7, bloomThresh 0.74 (never below 0.72), vignette 0.55, ca 0.0015. The darkness comes from the stage layer.
 */
export function soloGrade(fx: FxState, o: { bloom?: number; bloomThresh?: number; vignette?: number; ca?: number } = {}) {
  fx.tint = [238, 230, 255];
  fx.sat = 1;
  fx.contrast = 1.06;
  fx.bloom = o.bloom ?? 0.7;
  fx.bloomThresh = Math.max(0.72, o.bloomThresh ?? 0.74);
  fx.vignette = o.vignette ?? 0.55;
  fx.ca = o.ca ?? 0.0015;
}

/** The ultraviolet / ivory impact frame (impA bright violet, impB ivory, threshold 0.62). 1-2 frames each. */
export function soloImpact(fx: FxState, amt = 1) {
  fx.impact = clamp(amt);
  fx.impA = [122, 77, 255];
  fx.impB = [246, 240, 223];
  fx.impThresh = 0.62;
}

/**
 * The beat echo for `frames` frames (capped at 4) starting at `at`: `amount` 0..1, `dx` / `dy` = the UV offset per
 * copy (+0.012 echoes to screen-right), centred on screen point (sx, sy) (logical px) with radius R in screen
 * heights (0 = whole frame). Returns true while it is on.
 */
export function echoAt(env: Env, t: number, at: number, frames: number, amount: number, dx: number, o: { dy?: number; sx?: number; sy?: number; R?: number } = {}) {
  const n = Math.min(4, Math.max(1, Math.round(frames)));
  if (t < at - 1e-6 || t >= at + n / 60 - 1e-6) return false;
  const fx = env.fx;
  fx.echo = clamp(amount);
  fx.echoDX = dx;
  fx.echoDY = o.dy ?? 0;
  fx.echoX = (o.sx ?? VW / 2) / VW;
  fx.echoY = (o.sy ?? VH / 2) / VH;
  fx.echoR = o.R ?? 0;
  return true;
}

/** True on exactly the frames [at, at + frames/60) (impact frames, one-frame flares). */
export const onFrames = (t: number, at: number, frames = 1) => t >= at - 1e-6 && t < at + frames / 60 - 1e-6;

/** 0 -> 1 over `frames` frames from `at` (a defender cross-fading into the light over 3-4 frames). */
export const fadeIn = (t: number, at: number, frames = 4) => clamp((t - at) / (frames / 60));

// ---------------------------------------------------------------- the beat-snap camera

/** A beat-snap key: [time (on the 8th grid), x, y, zoom]. In tracking shots x / y are offsets from No.10's pelvis. */
export type CamKey = readonly [t: number, x: number, y: number, zoom: number];
export interface CamPose {
  x: number;
  y: number;
  zoom: number;
}
/**
 * The signature camera: it HOLDS between keys and SNAPS on the beat. At a key it moves to the new framing in 2 frames
 * (easeOutCubic) with a 3% overshoot that settles over the next 4 frames. A pure function of t (seek is exact).
 * Roll is always 0. Because zoom only changes in snaps, studio sprites never crawl with nearest-neighbour shimmer.
 */
export function beatCam(keys: readonly CamKey[], t: number): CamPose {
  let k = 0;
  for (let i = 0; i < keys.length; i++) if (t >= keys[i][0] - 1e-6) k = i;
  const cur = keys[k], prev = keys[Math.max(0, k - 1)];
  const u = t - cur[0];
  let f = 1;
  if (k > 0 && u < 6 / 60) {
    f = u < 2 / 60 ? 1.03 * ease.outCubic(clamp(u / (2 / 60))) : lerp(1.03, 1, ease.outQuad(clamp((u - 2 / 60) / (4 / 60))));
  }
  return { x: lerp(prev[1], cur[1], f), y: lerp(prev[2], cur[2], f), zoom: lerp(prev[3], cur[3], f) };
}

// ---------------------------------------------------------------- afterimages (chronophotograph exposures)

export interface Exposure {
  kind: 'hero' | 'ball';
  /** Hero: the studio frame key. */
  key?: SoloKey;
  /** Ball: radius (world px). */
  r?: number;
  x: number;
  y: number;
  scale: number;
  /** Drop time (shot time) and life (s of shot time). */
  t0: number;
  life: number;
  /** Starting alpha (default 0.6). */
  a0: number;
  o: GhostOpts;
}

const ballGhosts = new Map<number, HTMLCanvasElement>();
/** A ball exposure: a lilac disc with a 1 px ultraviolet edge, rasterised once per integer radius. */
export function ballGhost(r: number): HTMLCanvasElement {
  const R = Math.max(2, Math.round(r));
  let cv = ballGhosts.get(R);
  if (cv) return cv;
  cv = document.createElement('canvas');
  cv.width = cv.height = R * 2 + 2;
  const g = cv.getContext('2d')!;
  const img = g.createImageData(cv.width, cv.height);
  const c0 = R + 1;
  for (let y = 0; y < cv.height; y++)
    for (let x = 0; x < cv.width; x++) {
      const d = Math.hypot(x + 0.5 - c0, y + 0.5 - c0);
      if (d > R + 0.5) continue;
      const edge = d > R - 0.5;
      const c = edge ? PAL.uv : PAL.lilac;
      const k = (y * cv.width + x) * 4;
      img.data[k] = c[0];
      img.data[k + 1] = c[1];
      img.data[k + 2] = c[2];
      img.data[k + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  ballGhosts.set(R, cv);
  return cv;
}

/**
 * The special's language: ultraviolet exposures of No.10 (and of the ball) frozen where he WAS. World-anchored
 * (drawn in whatever transform is current), dropped only from update() on listed times or sim-time steps, capped
 * (6 hero, 9 ball: the oldest goes), reset in init. Each holds its alpha (0.6) and dies on the grid like a strobe
 * decay: over the last three 16ths of its life it steps 0.6 -> 0.4 -> 0.2 -> 0. Exposures never interact with
 * anyone: nobody tackles one, nothing makes one blink out.
 */
export class Afterimages {
  hero: Exposure[] = [];
  ball: Exposure[] = [];
  constructor(public maxHero = 6, public maxBall = 9) {}

  clear() {
    this.hero.length = 0;
    this.ball.length = 0;
  }

  /** Generic drop (the brief's signature): kind 'hero' takes a frame key, 'ball' a radius. */
  drop(kind: 'hero' | 'ball', keyOrR: SoloKey | number, x: number, y: number, scale: number, t: number, life = 0.6, o: GhostOpts = {}, a0 = 0.6) {
    if (kind === 'ball') return this.dropBall(x, y, typeof keyOrR === 'number' ? keyOrR : 6, t, life, a0);
    return this.dropHero(keyOrR as SoloKey, x, y, scale, t, life, o, a0);
  }

  /** Drop a hero exposure of frame `key` placed like drawSolo(env, key, x, y, scale, o). */
  dropHero(key: SoloKey, x: number, y: number, scale: number, t: number, life = 0.6, o: GhostOpts = {}, a0 = 0.6) {
    this.hero.push({ kind: 'hero', key, x, y, scale, t0: t, life, a0, o });
    while (this.hero.length > this.maxHero) this.hero.shift();
  }

  /** Drop a ball exposure of radius r (world px) centred on (x, y). */
  dropBall(x: number, y: number, r: number, t: number, life = 0.6, a0 = 0.6) {
    this.ball.push({ kind: 'ball', r, x, y, scale: 1, t0: t, life, a0, o: {} });
    while (this.ball.length > this.maxBall) this.ball.shift();
  }

  /** Alpha of an exposure at shot time t (stepped strobe decay over the last three 16ths). 0 = dead. */
  static alpha(e: Exposure, t: number): number {
    const age = t - e.t0;
    if (age < 0 || age >= e.life) return 0;
    const left = e.life - age;
    return left > 0.2 + 1e-6 ? e.a0 : left > 0.1 + 1e-6 ? e.a0 * (2 / 3) : e.a0 / 3;
  }

  /** Draw the live exposures (normal blend; ball ones first, under the hero ones). */
  draw(env: Env, t: number, which: 'all' | 'hero' | 'ball' = 'all') {
    const ctx = env.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.imageSmoothingEnabled = false;
    if (which !== 'hero')
      for (const e of this.ball) {
        const a = Afterimages.alpha(e, t);
        if (a <= 0) continue;
        const cv = ballGhost(e.r!);
        const s = (e.r! * 2 + 2) / cv.width;
        ctx.globalAlpha = a;
        ctx.drawImage(cv, e.x - (cv.width / 2) * s, e.y - (cv.height / 2) * s, cv.width * s, cv.height * s);
      }
    ctx.restore();
    if (which !== 'ball')
      for (const e of this.hero) {
        const a = Afterimages.alpha(e, t);
        if (a <= 0) continue;
        drawSoloGhost(env, e.key!, e.x, e.y, e.scale, { ...e.o, alpha: a * (e.o.alpha ?? 1) });
      }
  }

  /** Live counts at time t. */
  live(t: number) {
    return { hero: this.hero.filter((e) => Afterimages.alpha(e, t) > 0).length, ball: this.ball.filter((e) => Afterimages.alpha(e, t) > 0).length };
  }
}

// ---------------------------------------------------------------- defenders in the dark

/** Defender silhouette in the dark: plum-ink body, lilac rim on the lit side, ultraviolet inner rim. */
export const DEF_SIL = { fill: [26, 15, 46] as RGB, rim: PAL.lilac, rim2: PAL.uv };

/**
 * Puppet render cache (renderPuppet reuses one buffer per size, so every pose is COPIED here). Pre-render run1-4 and
 * every static pose per kit and scale in prepare(); then a frame costs a drawImage. `sil` renders the dark-stage
 * silhouette (light from (lx, ly), screen space).
 */
export class PuppetCache {
  private m = new Map<string, { cv: HTMLCanvasElement; ox: number; oy: number }>();
  get(name: string, kit: Kit, pose: Pose, k: number, facing: 1 | -1 = 1, sil?: { lx: number; ly: number }) {
    const key = `${name}|${kit.hair[0]}|${kit.skin[0]}|${kit.shirt[0]}|${k}|${facing}|${sil ? `${sil.lx},${sil.ly}` : ''}`;
    let r = this.m.get(key);
    if (!r) {
      const out = renderPuppet(kit, pose, { k, facing, silhouette: sil ? { ...DEF_SIL, lx: sil.lx, ly: sil.ly } : undefined });
      const cv = document.createElement('canvas');
      cv.width = out.cv.width;
      cv.height = out.cv.height;
      cv.getContext('2d')!.drawImage(out.cv, 0, 0);
      this.m.set(key, (r = { cv, ox: out.ox, oy: out.oy }));
    }
    return r;
  }
  /** Draw a cached pose so its hip lands on (x, y) at D world px per puppet px; `lit` 0 = silhouette, 1 = full colour. */
  draw(ctx: CanvasRenderingContext2D, name: string, kit: Kit, pose: Pose, k: number, facing: 1 | -1, x: number, y: number, D: number, lit = 1, light = { lx: 0.6, ly: -0.8 }, alpha = 1) {
    const l = clamp(lit);
    ctx.imageSmoothingEnabled = false;
    const one = (r: { cv: HTMLCanvasElement; ox: number; oy: number }, a: number) => {
      if (a <= 0) return;
      ctx.globalAlpha = a;
      ctx.drawImage(r.cv, x - r.ox * D, y - r.oy * D, r.cv.width * D, r.cv.height * D);
    };
    if (l < 1) one(this.get(name, kit, pose, k, facing, light), alpha);
    if (l > 0) one(this.get(name, kit, pose, k, facing), alpha * l);
    ctx.globalAlpha = 1;
  }
  clear() {
    this.m.clear();
  }
}

// ---------------------------------------------------------------- layout (field coordinates, goal to the right)

/** The 'gauntlet' set-up and the result view, in field world px (the goal line is x 1180). */
export const LAYOUT = {
  heroStart: { x: 690, z: 262 },
  A: { x: 900, z: 296 },
  B: { x: 965, z: 300 },
  C: { x: 1015, z: 244 },
  D: { x: 1055, z: 272 },
  keeper: { x: 1168, z: 282 },
  /** The mark: the penalty spot, where the sole stops the ball. */
  spot: { x: 1114, z: 282 },
  /** Result view: where everyone ends up. */
  result: {
    hero: { x: 1114, z: 282 },
    keeper: { x: 1150, z: 282 },
    A: { x: 925, z: 276 },
    B: { x: 935, z: 300 },
    C: { x: 1030, z: 256 },
    D: { x: 1062, z: 276 },
  },
} as const;

/** The OLÉ times (global) and the four-count pad times per shot (shot-local): OLÉ 1 shot 3 1.20, 2 shot 4 1.90, 3 shot 5 0.80, 4 shot 6 0.80. */
export const OLE_GLOBAL = [SHOT_T0[2] + 1.2, SHOT_T0[3] + 1.9, SHOT_T0[4] + 0.8, SHOT_T0[5] + 0.8] as const;
/** The four-count pads' lit times in shot-local time of shot `shot` (2-7): pass to fourCount(ctx, padsFor(shot), t). */
export const padsFor = (shot: number) => OLE_GLOBAL.map((g) => g - SHOT_T0[shot - 1]);

// ---------------------------------------------------------------- No.10's frame schedules (SPEC "No.10 studio animations")

/** [shot-local start time, frame key] keys, exactly as the brief schedules them (contact frames on their drum hits). */
export type SoloSeq = readonly (readonly [number, SoloKey])[];
export const SEQ: Record<1 | 2 | 3 | 4 | 5 | 6 | 7, SoloSeq> = {
  1: [[0, 'G1'], [0.2, 'G2L'], [0.3, 'G2']],
  2: [
    [0, 'D1'], [0.1, 'D2'], [0.2, 'D3'], [0.3, 'D4'], [0.4, 'D5'], [0.5, 'D6'], [0.6, 'D7'], [0.7, 'D8'],
    [0.8, 'D1'], [0.85, 'D2'], [0.9, 'D3'], [0.95, 'D4'], [1.0, 'D5'], [1.05, 'D6'], [1.1, 'D7'], [1.15, 'D8'],
  ],
  3: [
    [0, 'FT1'], [0.14, 'SO2'], [0.27, 'SO3'], [0.4, 'SO4'], [0.6, 'SO5'], [0.7, 'SO6'], [0.8, 'SO7'],
    [0.85, 'BR1'], [1.0, 'BR2'], [1.15, 'BR3'], [1.3, 'BR2'], [1.4, 'BR3'], [1.5, 'BR2'],
  ],
  4: [
    [0, 'D1'], [0.07, 'D2'], [0.13, 'D3'], [0.2, 'SL1'], [0.3, 'SL2'], [0.4, 'SL3'], [0.5, 'SL4'], [0.6, 'SL5'],
    [0.7, 'SL6'], [0.8, 'SL7'], [0.9, 'SL8'], [1.25, 'SL8b'], [1.58, 'SL9'], [1.72, 'SL10'], [1.8, 'SL11'],
    [1.85, 'D2'], [1.9, 'D3'], [1.95, 'D4'],
  ],
  5: [
    [0, 'FT1'], [0.2, 'EL2'], [0.3, 'EL3'], [0.367, 'EL4'], [0.4, 'EL5'], [0.55, 'BR2'], [0.7, 'BR3'], [0.8, 'BR2'], [1.0, 'BR3'],
  ],
  6: [
    [0, 'FT1'], [0.2, 'NM2'], [0.3, 'NM3'], [0.4, 'NM4'], [0.55, 'BR1'], [0.7, 'BR2'], [0.85, 'BR3'], [1.0, 'BR2'], [1.1, 'BR3'],
  ],
  7: [
    [0, 'D1'], [0.1, 'D2'], [0.2, 'D3'], [0.3, 'D4'], [0.4, 'D5'], [0.45, 'D6'], [0.5, 'D7'],
    [0.6, 'ST1'], [0.8, 'ST2'], [1.2, 'ST3'], [1.4, 'ST3b'], [1.5, 'ST3'], [1.6, 'ST3b'],
  ],
};
/** The frame of a schedule at shot time t. */
export function soloAt(seq: SoloSeq, t: number): SoloKey {
  let k = seq[0][1];
  for (const [at, key] of seq) if (t >= at - 1e-6) k = key;
  return k;
}
/** No.10's integer sprite scale per shot (it changes only on a beat-snap). The shot 5 wipe ghosts use 3-6. */
export const SCALE: Record<1 | 2 | 3 | 4 | 5 | 6 | 7, (t: number) => number> = {
  1: () => 5,
  2: () => 2,
  3: (t) => (t >= 1.0 - 1e-6 ? 3 : 2),
  4: () => 3,
  5: (t) => (t >= 0.8 - 1e-6 ? 3 : 2),
  6: (t) => (t >= 0.8 - 1e-6 ? 2 : 1),
  7: () => 2,
};
/** Simulation rate per shot (hit-stops and slow windows are rests in the bar; rate never slows the shot clock). */
export const RATE: Record<1 | 2 | 3 | 4 | 5 | 6 | 7, (t: number) => number> = {
  1: () => 1,
  2: () => 1,
  3: (t) => (t >= 0.4 && t < 0.6 ? 0.1 : 1),
  4: (t) => (t >= 1.3 && t < 1.42 ? 0.06 : t >= 0.95 && t < 1.55 ? 0.25 : 1),
  5: (t) => (t >= 0.4 && t < 0.55 ? 0.06 : 1),
  6: (t) => (t >= 0.5 && t < 0.7 ? 0.2 : 1),
  7: (t) => (t >= 1.6 ? 0 : t >= 0.8 ? 0.1 : 1),
};

// ---------------------------------------------------------------- lamp hum

/**
 * Lamp hum per shot (it runs whenever the spot is on): shot 1 0.05-1.25, shot 2 from 0.80, shots 3-6 throughout,
 * shot 7 until 1.60. Drive it from update() every step: `env.sfx.hum(HUM[n](t))` (seek-exact; clearBus in init
 * stops it, the next step restarts it with a 40 ms cross-fade).
 */
export const HUM: Record<1 | 2 | 3 | 4 | 5 | 6 | 7, (t: number) => boolean> = {
  1: (t) => t >= 0.05 && t < 1.25,
  2: (t) => t >= 0.8,
  3: () => true,
  4: () => true,
  5: () => true,
  6: () => true,
  7: (t) => t < 1.6,
};
