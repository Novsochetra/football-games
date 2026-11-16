// WebGL post-processing: shockwave refraction, pressure lens (pinch/bulge), zoom blur, chromatic
// aberration, bloom, impact frames (2-tone posterize), flash, grading, vignette, grain.
// The game draws everything with Canvas2D; this pass turns it into the final image.

import type { RGB } from './math';

export interface Shock {
  /** Center in screen UV (0..1, y down). */
  x: number;
  y: number;
  /** Ring radius in screen-height units. */
  r: number;
  /** Refraction strength (UV units). */
  s: number;
  /**
   * SPOTLIGHT SOLO v2 (chunk FLATSHOCK): vertical squash of the ring distance (default 1 = round). 0.25-0.4 lays the
   * refraction flat along the turf (the ring distance uses d.y / sy). Only frames with fx.pass 'solo' read it.
   */
  sy?: number;
}

/** Per-frame effect parameters. Shots write into this; it is reset every frame. */
export class FxState {
  shocks: Shock[] = [];
  shockWidth = 0.035;
  ca = 0;
  radialX = 0.5;
  radialY = 0.5;
  radial = 0;
  impact = 0;
  impA: RGB = [10, 4, 12];
  impB: RGB = [255, 250, 240];
  impThresh = 0.42;
  flashColor: RGB = [255, 255, 255];
  flash = 0;
  bloom = 0.85;
  bloomThresh = 0.6;
  vignette = 0.45;
  sat = 1;
  contrast = 1.04;
  tint: RGB = [255, 255, 255];
  grain = 0.035;
  /**
   * Slash split: the frame is cut along a circle (huge radius = nearly straight line).
   * Pixels inside slide along (cutDirX, cutDirY) by `cut` (UV units), outside slides the
   * opposite way, and a bright seam is drawn along the cut.
   */
  cut = 0;
  cutX = 0.5;
  cutY = 0.5;
  cutR = 0.6;
  cutDirX = 1;
  cutDirY = 0;
  cutGlow = 0;
  cutWidth = 0.006;
  cutColor: RGB = [255, 240, 250];
  /** Limit the cut to an arc between these angles (radians, canvas convention: 0 = +x, PI/2 = down). Equal = full circle. */
  cutA0 = 0;
  cutA1 = 0;
  /**
   * Pressure lens (GALE HAMMER): a radial pinch / bulge of the frame around (lensX, lensY).
   * lens = strength k: positive bulges (magnifies the centre), negative pinches (pulls the
   * surroundings inward). lensR = radius in screen-height units. 0 = off (neutral).
   */
  lens = 0;
  lensX = 0.5;
  lensY = 0.5;
  lensR = 0.2;
  /**
   * Beat echo (SPOTLIGHT SOLO): up to three lighten-blended copies of the frame, offset by k·(echoDX, echoDY)
   * (UV units, y down; k = 1, 2, 3 at weights 0.6 / 0.35 / 0.18) and multiplied by echoColor. The copies only show
   * where they are brighter than what is underneath (violet exposures of the lit No.10 in the dark around him).
   * echoR > 0 limits it to a soft disc of that radius (screen-height units) around (echoX, echoY) (UV, y down).
   * echo = 0 is off (the frame then runs the shader without the echo block). Never more than 4 consecutive frames.
   */
  echo = 0;
  echoDX = 0;
  echoDY = 0;
  echoX = 0.5;
  echoY = 0.5;
  echoR = 0;
  echoColor: RGB = [0.62, 0.44, 1.25];
  /**
   * Isobar impact frame (GALE HAMMER v2, chunk ISO): the frame is printed as a weather map of `isoBands` bands of
   * isoCols (navy, cobalt, cyan, ice by default) with 1-logical-px contour lines (isoLine) on the band edges.
   * Band value v = clamp(mix(luma, 1 - |(p - (isoX, isoY))·(aspect, 1)| / isoR, isoMix) + isoWob·sin(6θ + 9t), 0, 0.999):
   * isoMix 0 = luminance bands only, 1 = rings round (isoX, isoY) only. isoInvert 1 reverses the band colours.
   * iso = 0 is off (the frame then runs a program without the ISO chunk). Use the `galeIso` helper for the two stages.
   */
  iso = 0;
  isoBands = 4;
  isoInvert = 0;
  isoCols: [RGB, RGB, RGB, RGB] = [[10, 18, 56], [45, 82, 224], [70, 216, 255], [238, 251, 255]];
  isoLine: RGB = [238, 251, 255];
  isoX = 0.5;
  isoY = 0.5;
  isoR = 0.6;
  isoMix = 0.55;
  isoWob = 0;
  /**
   * Directional motion blur (shared STREAK chunk, built once for the set): 12 taps along (streakDX, streakDY) (unit
   * direction, UV, y down) over `streak` UV units; the smear trails opposite the direction. A sharp hole of radius
   * streakHoleR (screen-height units) round (streakHoleX, streakHoleY) keeps a subject (the ball) crisp:
   * m = smoothstep(0.7·R, R, distance) scales the length. streak = 0 is off.
   */
  streak = 0;
  streakDX = 1;
  streakDY = 0;
  streakHoleX = 0.5;
  streakHoleY = 0.5;
  streakHoleR = 0;
  /**
   * Cone-masked impact (SPOTLIGHT SOLO v2, chunk IMPMASK): with impMask 1 the two-tone impact only prints inside a cone
   * from the apex (impMaskX, impMaskY) (UV, y down) along the unit axis (impMaskDX, impMaskDY) (screen space, y down)
   * with half-angle impMaskHalf (rad) and a soft edge impMaskSoft (rad); outside the cone the frame is pushed to impOut
   * by impact·impOutAmt. With impMask 0 the impact is the original full-frame line. Reset to neutral every frame.
   */
  impMask = 0;
  impMaskX = 0.5;
  impMaskY = 0;
  impMaskDX = 0;
  impMaskDY = 1;
  impMaskHalf = 0.35;
  impMaskSoft = 0.04;
  impOut: RGB = [8, 3, 16];
  impOutAmt = 1;
  /**
   * Neon edge frame (SPOTLIGHT SOLO v2, chunk NEON; an optional prototype behind the ?neon dev flag, never shipped by
   * default): a 3x3 Sobel on luminance, edges above neonThresh glow ivory -> volt, the rest crushed to void, mixed in
   * by `neon`. 0 = off (the frame then runs a program without the NEON chunk).
   */
  neon = 0;
  neonThresh = 0.18;
  /**
   * Shared photosensitivity flag: a shot sets it on frames where a wipe or a shroud covers most of the frame, so the
   * FlashBudget guard (cinematic/timeline.ts) counts its rising edge as a full-frame event. No effect on the picture.
   */
  fullFrame = false;
  /**
   * Which special's post program family this frame belongs to ('' = none). A pass registered with registerPostPass()
   * always compiles its whole chunk set into one program whenever any of its chunks is active (GALE v2: 'gale' =
   * LENS + ISO + STREAK). Other values are free for the other specials (e.g. 'meridian', 'solo').
   */
  pass = '';
  /**
   * Pluck warp (MERIDIAN THREAD v2, chunk PLUCK): the picture bends in a standing wave along a quadratic Bezier
   * pluckP0 -> pluckP1 (control) -> pluckP2 (screen UV, y down). `pluck` = this frame's signed amplitude in
   * screen-height units (the CPU has already multiplied it by cos(2π·hz·t)·exp(-t/decay)); pluckN = antinodes (1-3);
   * pluckW = gaussian falloff width (screen heights; 0.8 = the whole frame). For every pixel the nearest curve point
   * (8-segment search, aspect-corrected) gives u, the unit normal n and the distance d:
   * uv -= n · pluck · sin(N·π·u) · exp(-(d/W)²). pluckGlow adds a faint jade line glow exp(-(d/0.006)²).
   * pluck = 0 and pluckGlow = 0 is off (the frame then runs a program without the PLUCK chunk).
   */
  pluck = 0;
  pluckP0: [number, number] = [0.2, 0.5];
  pluckP1: [number, number] = [0.5, 0.5];
  pluckP2: [number, number] = [0.8, 0.5];
  pluckN = 1;
  pluckW = 0.05;
  pluckGlow = 0;
  /**
   * Halftone impact (MERIDIAN THREAD v2, chunk TONE): with tone > 0 (dot cell in logical px) the two-tone impact line
   * prints the mid-tones inside ±toneBand of impThresh as a rotated dot screen (angle toneAng), the dots growing with
   * brightness; outside the band it stays the plain two-tone. tone = 0 is off (stage B of the impact never sets it).
   */
  tone = 0;
  toneAng = 0.785;
  toneBand = 0.16;

  reset() {
    this.shocks.length = 0;
    this.shockWidth = 0.035;
    this.ca = 0.0012;
    this.radial = 0;
    this.radialX = 0.5;
    this.radialY = 0.5;
    this.impact = 0;
    this.impA = [10, 4, 12];
    this.impB = [255, 250, 240];
    this.impThresh = 0.42;
    this.flash = 0;
    this.flashColor = [255, 255, 255];
    this.bloom = 0.85;
    this.bloomThresh = 0.6;
    this.vignette = 0.45;
    this.sat = 1;
    this.contrast = 1.04;
    this.tint = [255, 255, 255];
    this.grain = 0.035;
    this.cut = 0;
    this.cutX = 0.5;
    this.cutY = 0.5;
    this.cutR = 0.6;
    this.cutDirX = 1;
    this.cutDirY = 0;
    this.cutGlow = 0;
    this.cutWidth = 0.006;
    this.cutColor = [255, 240, 250];
    this.cutA0 = 0;
    this.cutA1 = 0;
    this.lens = 0;
    this.lensX = 0.5;
    this.lensY = 0.5;
    this.lensR = 0.2;
    this.echo = 0;
    this.echoDX = 0;
    this.echoDY = 0;
    this.echoX = 0.5;
    this.echoY = 0.5;
    this.echoR = 0;
    this.echoColor = [0.62, 0.44, 1.25];
    this.impMask = 0;
    this.impMaskX = 0.5;
    this.impMaskY = 0;
    this.impMaskDX = 0;
    this.impMaskDY = 1;
    this.impMaskHalf = 0.35;
    this.impMaskSoft = 0.04;
    this.impOut = [8, 3, 16];
    this.impOutAmt = 1;
    this.neon = 0;
    this.neonThresh = 0.18;
    this.iso = 0;
    this.isoBands = 4;
    this.isoInvert = 0;
    this.isoCols = [[10, 18, 56], [45, 82, 224], [70, 216, 255], [238, 251, 255]];
    this.isoLine = [238, 251, 255];
    this.isoX = 0.5;
    this.isoY = 0.5;
    this.isoR = 0.6;
    this.isoMix = 0.55;
    this.isoWob = 0;
    this.streak = 0;
    this.streakDX = 1;
    this.streakDY = 0;
    this.streakHoleX = 0.5;
    this.streakHoleY = 0.5;
    this.streakHoleR = 0;
    this.fullFrame = false;
    this.pass = '';
    this.pluck = 0;
    this.pluckP0 = [0.2, 0.5];
    this.pluckP1 = [0.5, 0.5];
    this.pluckP2 = [0.8, 0.5];
    this.pluckN = 1;
    this.pluckW = 0.05;
    this.pluckGlow = 0;
    this.tone = 0;
    this.toneAng = 0.785;
    this.toneBand = 0.16;
  }
}

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const BRIGHT = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uTexel;
uniform float uThresh;
void main(){
  vec3 c = texture2D(uTex, vUv + uTexel * vec2(-1.0, -1.0)).rgb;
  c += texture2D(uTex, vUv + uTexel * vec2( 1.0, -1.0)).rgb;
  c += texture2D(uTex, vUv + uTexel * vec2(-1.0,  1.0)).rgb;
  c += texture2D(uTex, vUv + uTexel * vec2( 1.0,  1.0)).rgb;
  c *= 0.25;
  float br = max(c.r, max(c.g, c.b));
  float w = smoothstep(uThresh, uThresh + 0.3, br);
  gl_FragColor = vec4(c * w, 1.0);
}`;

const BLUR = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uDir;
void main(){
  vec3 c = texture2D(uTex, vUv).rgb * 0.227027;
  c += texture2D(uTex, vUv + uDir * 1.0).rgb * 0.1945946;
  c += texture2D(uTex, vUv - uDir * 1.0).rgb * 0.1945946;
  c += texture2D(uTex, vUv + uDir * 2.0).rgb * 0.1216216;
  c += texture2D(uTex, vUv - uDir * 2.0).rgb * 0.1216216;
  c += texture2D(uTex, vUv + uDir * 3.0).rgb * 0.054054;
  c += texture2D(uTex, vUv - uDir * 3.0).rgb * 0.054054;
  c += texture2D(uTex, vUv + uDir * 4.0).rgb * 0.016216;
  c += texture2D(uTex, vUv - uDir * 4.0).rgb * 0.016216;
  gl_FragColor = vec4(c, 1.0);
}`;

const FINAL = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uScene;
uniform sampler2D uBloomTex;
uniform vec2 uRes;
uniform float uTime;
uniform vec4 uShock[4];
uniform float uShockW;
uniform float uCA;
uniform vec3 uRadial;
uniform float uImpact;
uniform vec3 uImpA;
uniform vec3 uImpB;
uniform float uImpThresh;
uniform vec4 uFlash;
uniform float uBloom;
uniform float uVig;
uniform float uSat;
uniform float uContrast;
uniform vec3 uTint;
uniform float uGrain;
uniform vec4 uCut;
uniform vec2 uCutDir;
uniform vec4 uCutGlow;
uniform float uCutW;
uniform vec2 uCutArc;

float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main(){
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  float cutLine = 0.0;
  if (uCut.w != 0.0 || uCutGlow.a > 0.0) {
    vec2 cd = uv - uCut.xy;
    cd.x *= aspect;
    float sd = length(cd) - uCut.z;
    float side = sd < 0.0 ? 1.0 : -1.0;
    float win = 1.0;
    float span = uCutArc.y - uCutArc.x;
    if (span > 0.0001) {
      float ang = atan(-cd.y, cd.x);
      float da = mod(ang - uCutArc.x, 6.2831853);
      win = smoothstep(0.0, 0.3, da) * smoothstep(0.0, 0.3, span - da);
      if (da > span) win = 0.0;
    }
    uv -= uCutDir * uCut.w * side * win;
    float w = uCutW + abs(uCut.w) * 0.6;
    cutLine = exp(-(sd * sd) / (w * w)) * win;
  }
  //LENS
  for (int i = 0; i < 4; i++) {
    vec4 s = uShock[i];
    if (s.w != 0.0) {
      vec2 d = uv - s.xy;
      d.x *= aspect;
      float dist = length(d);
      float x = (dist - s.z) / uShockW;
      float ring = exp(-x * x) * x;
      vec2 dir = d / max(dist, 0.0001);
      dir.x /= aspect;
      uv -= dir * ring * s.w;
    }
  }
  vec2 caDir = (uv - 0.5) * uCA;
  vec3 col;
  if (uRadial.z > 0.0005) {
    vec2 toC = uRadial.xy - uv;
    col = vec3(0.0);
    for (int i = 0; i < 12; i++) {
      float f = float(i) / 11.0;
      vec2 o = toC * uRadial.z * f;
      col.r += texture2D(uScene, uv + o + caDir).r;
      col.g += texture2D(uScene, uv + o).g;
      col.b += texture2D(uScene, uv + o - caDir).b;
    }
    col /= 12.0;
  } else {
    col.r = texture2D(uScene, uv + caDir).r;
    col.g = texture2D(uScene, uv).g;
    col.b = texture2D(uScene, uv - caDir).b;
  }
  col += texture2D(uBloomTex, uv).rgb * uBloom;

  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(lum), col, uSat);
  col = (col - 0.5) * uContrast + 0.5;
  col *= uTint;

  float k = smoothstep(uImpThresh - 0.03, uImpThresh + 0.03, lum);
  col = mix(col, mix(uImpA, uImpB, k), uImpact);

  col = mix(col, uFlash.rgb, uFlash.a);
  col = mix(col, uCutGlow.rgb, clamp(cutLine * uCutGlow.a, 0.0, 1.0));

  vec2 q = vUv - 0.5;
  q.x *= 0.9;
  col *= clamp(1.0 - dot(q, q) * uVig * 2.2, 0.0, 1.0);

  col += (hash(vUv * uRes + fract(uTime) * 91.7) - 0.5) * uGrain;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

// Pressure lens (GALE HAMMER), compiled into a second FINAL program that is used only on frames with fx.lens != 0,
// so every other frame runs the exact original shader:
// uv -= (d / (aspect,1)) * k * (1 - r^2)^2 inside radius R (d = (uv - c)*(aspect,1), r = |d| / R).
const FINAL_LENS = FINAL.replace('void main(){', 'uniform vec4 uLens;\nvoid main(){').replace(
  '  //LENS',
  `  {
    vec2 ld = uv - uLens.xy;
    ld.x *= aspect;
    float lr = length(ld) / max(uLens.z, 0.0001);
    if (lr < 1.0) {
      float f = 1.0 - lr * lr;
      ld.x /= aspect;
      uv -= ld * uLens.w * f * f;
    }
  }`,
);

// Beat echo (SPOTLIGHT SOLO), compiled into two more FINAL programs (with and without the pressure lens) that are
// used only on frames with fx.echo > 0, so every other frame runs the exact shaders above. Inserted after the base
// colour fetch and before the bloom add: e_k = tex(uv - k·d)·echoColor·w_k·echo·mask, col = max(col, e1, e2, e3).
const ECHO_BLOCK = `  {
    vec2 ed = uv - uEcho.xy;
    ed.x *= aspect;
    float em = uEchoR > 0.0 ? 1.0 - smoothstep(0.7 * uEchoR, uEchoR, length(ed)) : 1.0;
    vec3 ek = uEchoColor * (uEcho.z * em);
    vec3 e1 = texture2D(uScene, uv - uEchoD).rgb * ek * 0.6;
    vec3 e2 = texture2D(uScene, uv - 2.0 * uEchoD).rgb * ek * 0.35;
    vec3 e3 = texture2D(uScene, uv - 3.0 * uEchoD).rgb * ek * 0.18;
    col = max(col, max(e1, max(e2, e3)));
  }
  col += texture2D(uBloomTex, uv).rgb * uBloom;`;
const withEcho = (src: string) =>
  src
    .replace('void main(){', 'uniform vec3 uEcho;\nuniform float uEchoR;\nuniform vec2 uEchoD;\nuniform vec3 uEchoColor;\nvoid main(){')
    .replace('  col += texture2D(uBloomTex, uv).rgb * uBloom;', ECHO_BLOCK);
const FINAL_ECHO = withEcho(FINAL);
const FINAL_LENS_ECHO = withEcho(FINAL_LENS);

// ---------------------------------------------------------------- composable post programs (v2 set)
//
// The v2 specials assemble their FINAL programs from named chunks with one buildFinal(chunks), so each chunk exists
// once. The programs above stay exactly as they were and are still used on every frame where no chunk outside them
// (iso, streak, or any chunk added with registerPostChunk) is active: shipped specials run their shaders byte for
// byte. A frame that needs a v2 chunk runs buildFinal(the active set), compiled lazily and cached by its chunk list.

type UniformLoc = (name: string) => WebGLUniformLocation | null;

/** One shader chunk of the FINAL composite. */
export interface PostChunk {
  /** Unique name; also its place in the canonical order (registration order). */
  name: string;
  /** GLSL declarations (uniforms, helper functions) inserted before main(); FINAL's uniforms are visible. */
  decl: string;
  /**
   * Where `code` goes: 'warp' = UV warps before the shock rings (the lens site), 'fetch' = after the scene colour
   * fetch and before the bloom add, 'impact' = after the grade and the two-tone impact line, before the flash.
   */
  at: 'warp' | 'fetch' | 'impact';
  code: string;
  /** Extra text substitutions applied to the program source (for chunks that change an existing line). */
  edits?: [string, string][];
  /** True on frames that need this chunk. */
  active(fx: FxState): boolean;
  /** Upload the chunk's uniforms (the program is already in use). */
  bind(gl: WebGLRenderingContext, u: UniformLoc, fx: FxState): void;
  /**
   * Legacy chunks (LENS, ECHO) have hand-built programs of their own; they only join a composed program when some
   * non-legacy chunk is active on the same frame.
   */
  legacy?: boolean;
}

const SITE = {
  warp: '  //LENS',
  fetch: '  col += texture2D(uBloomTex, uv).rgb * uBloom;',
  impact: '  col = mix(col, uFlash.rgb, uFlash.a);',
} as const;

const CHUNKS: PostChunk[] = [];
const PASSES = new Map<string, string[]>();

/** Add a chunk to the set (call once, at module load). Canonical order = registration order. */
export function registerPostChunk(c: PostChunk) {
  if (CHUNKS.some((k) => k.name === c.name)) throw new Error(`post chunk ${c.name} registered twice`);
  CHUNKS.push(c);
}

/**
 * Declare a special's program family: whenever fx.pass === name and any of its chunks is active, the frame runs the
 * one program built from all of `chunks` (plus any other chunk active on that frame), so a pass compiles a single
 * program that warmPost(name) can build ahead of time.
 */
export function registerPostPass(name: string, chunks: string[]) {
  PASSES.set(name, chunks);
}

/** The FINAL composite with `chunks` inserted at their sites (in the canonical order). */
export function buildFinal(chunks: PostChunk[]): string {
  const list = CHUNKS.filter((c) => chunks.includes(c));
  let src = FINAL;
  for (const c of list) for (const [a, b] of c.edits ?? []) src = src.replace(a, b);
  const decl = list.map((c) => c.decl).join('\n');
  src = src.replace('void main(){', `${decl}\nvoid main(){`);
  for (const site of ['warp', 'fetch', 'impact'] as const) {
    const code = list.filter((c) => c.at === site).map((c) => c.code).join('\n');
    if (code) src = src.replace(SITE[site], `${code}\n${SITE[site]}`);
  }
  return src;
}

/** LENS: the pressure lens (the same GLSL as FINAL_LENS). */
export const LENS_CHUNK: PostChunk = {
  name: 'LENS',
  legacy: true,
  decl: 'uniform vec4 uLens;',
  at: 'warp',
  code: `  {
    vec2 ld = uv - uLens.xy;
    ld.x *= aspect;
    float lr = length(ld) / max(uLens.z, 0.0001);
    if (lr < 1.0) {
      float f = 1.0 - lr * lr;
      ld.x /= aspect;
      uv -= ld * uLens.w * f * f;
    }
  }`,
  active: (fx) => fx.lens !== 0,
  bind: (gl, u, fx) => gl.uniform4f(u('uLens'), fx.lensX, 1 - fx.lensY, fx.lensR, fx.lens),
};

/**
 * STREAK (shared, built once for the set): directional motion blur, 12 taps along the direction over `streak` UV
 * units, the smear trailing opposite it; a sharp hole round (streakHoleX, streakHoleY) of radius streakHoleR.
 */
export const STREAK_CHUNK: PostChunk = {
  name: 'STREAK',
  decl: 'uniform vec4 uStreak;\nuniform vec3 uStreakHole;',
  at: 'fetch',
  code: `  if (uStreak.x > 0.0) {
    vec2 hd = uv - uStreakHole.xy;
    hd.x *= aspect;
    float sm = uStreakHole.z > 0.0 ? smoothstep(0.7 * uStreakHole.z, uStreakHole.z, length(hd)) : 1.0;
    if (sm > 0.001) {
      vec2 sd = uStreak.zw * (uStreak.x * sm);
      vec3 acc = col;
      for (int i = 1; i < 12; i++) acc += texture2D(uScene, uv + sd * (float(i) / 11.0)).rgb;
      col = acc / 12.0;
    }
  }`,
  active: (fx) => fx.streak > 0,
  bind: (gl, u, fx) => {
    const l = Math.hypot(fx.streakDX, fx.streakDY) || 1;
    gl.uniform4f(u('uStreak'), Math.max(0, fx.streak), 0, fx.streakDX / l, -fx.streakDY / l);
    gl.uniform3f(u('uStreakHole'), fx.streakHoleX, 1 - fx.streakHoleY, fx.streakHoleR);
  },
};

/** ECHO: SPOTLIGHT SOLO's beat echo (the same GLSL as FINAL_ECHO). */
export const ECHO_CHUNK: PostChunk = {
  name: 'ECHO',
  legacy: true,
  decl: 'uniform vec3 uEcho;\nuniform float uEchoR;\nuniform vec2 uEchoD;\nuniform vec3 uEchoColor;',
  at: 'fetch',
  code: ECHO_BLOCK.replace('\n  col += texture2D(uBloomTex, uv).rgb * uBloom;', ''),
  active: (fx) => fx.echo > 0,
  bind: (gl, u, fx) => {
    gl.uniform3f(u('uEcho'), fx.echoX, 1 - fx.echoY, Math.min(1, fx.echo));
    gl.uniform1f(u('uEchoR'), fx.echoR);
    gl.uniform2f(u('uEchoD'), fx.echoDX, -fx.echoDY);
    gl.uniform3f(u('uEchoColor'), fx.echoColor[0], fx.echoColor[1], fx.echoColor[2]);
  },
};

/**
 * ISO (GALE HAMMER v2): the isobar impact frame. v(p) from the scene luminance (+ bloom) mixed with a monotonic radial
 * term round (isoX, isoY) (no fract: rings never repeat), b = floor(v·bands), band colour isoCols[b] (reversed when
 * inverted), and a 1 logical px contour line where any of the 4 neighbours (± one logical px) is in another band.
 */
export const ISO_CHUNK: PostChunk = {
  name: 'ISO',
  decl: `uniform vec4 uIso;
uniform vec4 uIsoGeo;
uniform vec3 uIsoC0;
uniform vec3 uIsoC1;
uniform vec3 uIsoC2;
uniform vec3 uIsoC3;
uniform vec3 uIsoLine;
float isoV(vec2 p, float aspect){
  vec3 c = texture2D(uScene, p).rgb + texture2D(uBloomTex, p).rgb * uBloom;
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  vec2 d = p - uIsoGeo.xy;
  d.x *= aspect;
  float rad = 1.0 - length(d) / max(uIsoGeo.z, 0.0001);
  float th = atan(d.y, d.x);
  return clamp(mix(l, rad, uIsoGeo.w) + uIso.w * sin(6.0 * th + 9.0 * uTime), 0.0, 0.999);
}`,
  at: 'impact',
  code: `  if (uIso.x > 0.0) {
    float nb = uIso.y;
    float ib = floor(isoV(uv, aspect) * nb);
    vec2 lp = vec2(1.0 / 640.0, 1.0 / 360.0);
    float edge = step(0.5, abs(floor(isoV(uv + vec2(lp.x, 0.0), aspect) * nb) - ib));
    edge += step(0.5, abs(floor(isoV(uv - vec2(lp.x, 0.0), aspect) * nb) - ib));
    edge += step(0.5, abs(floor(isoV(uv + vec2(0.0, lp.y), aspect) * nb) - ib));
    edge += step(0.5, abs(floor(isoV(uv - vec2(0.0, lp.y), aspect) * nb) - ib));
    float ci = uIso.z > 0.5 ? nb - 1.0 - ib : ib;
    vec3 ic = ci < 0.5 ? uIsoC0 : ci < 1.5 ? uIsoC1 : ci < 2.5 ? uIsoC2 : uIsoC3;
    ic = mix(ic, uIsoLine, clamp(edge, 0.0, 1.0));
    col = mix(col, ic, clamp(uIso.x, 0.0, 1.0));
  }`,
  active: (fx) => fx.iso > 0,
  bind: (gl, u, fx) => {
    gl.uniform4f(u('uIso'), fx.iso, Math.max(1, Math.min(4, Math.round(fx.isoBands))), fx.isoInvert > 0.5 ? 1 : 0, fx.isoWob);
    gl.uniform4f(u('uIsoGeo'), fx.isoX, 1 - fx.isoY, fx.isoR, fx.isoMix);
    fx.isoCols.forEach((c, i) => gl.uniform3f(u(`uIsoC${i}`), c[0] / 255, c[1] / 255, c[2] / 255));
    gl.uniform3f(u('uIsoLine'), fx.isoLine[0] / 255, fx.isoLine[1] / 255, fx.isoLine[2] / 255);
  },
};

registerPostChunk(LENS_CHUNK);
registerPostChunk(STREAK_CHUNK);
registerPostChunk(ECHO_CHUNK);
registerPostChunk(ISO_CHUNK);
/** FINAL_GALE = buildFinal([LENS, ISO, STREAK]): GALE HAMMER v2's one program (fx.pass = 'gale'). */
registerPostPass('gale', ['LENS', 'ISO', 'STREAK']);

/**
 * PLUCK (MERIDIAN THREAD v2): the pluck warp. An 8-segment nearest-point search on the Bezier (aspect-corrected, in
 * screen-height units) gives u along the curve, the segment's unit normal n and the distance d (pluckD, also used by
 * the line glow after the bloom add). uv -= n·amp·sin(N·π·u)·exp(-(d/W)²): the picture bends along the line in a
 * standing wave with nodes at both ends. A displacement only: it never changes brightness (photosensitivity).
 */
export const PLUCK_CHUNK: PostChunk = {
  name: 'PLUCK',
  decl: `uniform vec4 uPluck;
uniform vec4 uPluckA;
uniform vec2 uPluckB;
vec2 pluckBez(float u){ float v = 1.0 - u; return v * v * uPluckA.xy + 2.0 * v * u * uPluckA.zw + u * u * uPluckB; }`,
  at: 'warp',
  code: `  float pluckD = 1.0e3;
  {
    vec2 pAsp = vec2(aspect, 1.0);
    vec2 pp = uv * pAsp;
    vec2 pa = pluckBez(0.0) * pAsp;
    float bu = 0.0;
    vec2 bt = vec2(1.0, 0.0);
    for (int i = 1; i <= 8; i++) {
      vec2 pb = pluckBez(float(i) / 8.0) * pAsp;
      vec2 sg = pb - pa;
      float l2 = max(dot(sg, sg), 1.0e-10);
      float kk = clamp(dot(pp - pa, sg) / l2, 0.0, 1.0);
      float dd = length(pp - (pa + sg * kk));
      if (dd < pluckD) {
        pluckD = dd;
        bu = (float(i - 1) + kk) / 8.0;
        bt = sg / sqrt(l2);
      }
      pa = pb;
    }
    if (uPluck.x != 0.0) {
      float q = pluckD / max(uPluck.z, 1.0e-4);
      vec2 disp = vec2(-bt.y, bt.x) * (uPluck.x * sin(uPluck.y * 3.14159265 * bu) * exp(-q * q));
      disp.x /= aspect;
      uv -= disp;
    }
  }`,
  edits: [[SITE.fetch, `${SITE.fetch}\n  if (uPluck.w > 0.0) col += vec3(0.184, 0.878, 0.541) * (uPluck.w * exp(-(pluckD / 0.006) * (pluckD / 0.006)));`]],
  active: (fx) => fx.pluck !== 0 || fx.pluckGlow > 0,
  bind: (gl, u, fx) => {
    gl.uniform4f(u('uPluck'), fx.pluck, Math.max(1, Math.min(3, Math.round(fx.pluckN))), fx.pluckW, Math.max(0, fx.pluckGlow));
    gl.uniform4f(u('uPluckA'), fx.pluckP0[0], 1 - fx.pluckP0[1], fx.pluckP1[0], 1 - fx.pluckP1[1]);
    gl.uniform2f(u('uPluckB'), fx.pluckP2[0], 1 - fx.pluckP2[1]);
  },
};

/** Dev probe flag for TONE (see PostFX.toneProbe): uTone.w = 1 renders the threshold-band mask instead of the frame. */
let toneProbeFlag = 0;

/**
 * TONE (MERIDIAN THREAD v2): the halftone impact. Rewrites the two-tone impact line: inside ±toneBand of impThresh the
 * tone is chosen by a dot screen rotated by toneAng (dotR = |fract(R·p/cell) − 0.5|·√2 on the logical-px grid,
 * k = step(dotR, √m), m = the position across the band), so the mid-tones print as dots that grow with brightness;
 * outside the band it is the plain two-tone. With the dev probe on, the frame outputs the band mask (red = in band).
 */
export const TONE_CHUNK: PostChunk = {
  name: 'TONE',
  decl: 'uniform vec4 uTone;',
  at: 'impact',
  code: '',
  edits: [[
    '  float k = smoothstep(uImpThresh - 0.03, uImpThresh + 0.03, lum);',
    `  float k = smoothstep(uImpThresh - 0.03, uImpThresh + 0.03, lum);
  if (uTone.x > 0.0) {
    float tb = max(uTone.z, 1.0e-4);
    float tm = (lum - (uImpThresh - tb)) / (2.0 * tb);
    bool inBand = tm > 0.0 && tm < 1.0;
    if (inBand) {
      vec2 fc = vUv * vec2(640.0, 360.0);
      float ca = cos(uTone.y), sa = sin(uTone.y);
      vec2 rc = vec2(ca * fc.x - sa * fc.y, sa * fc.x + ca * fc.y) / uTone.x;
      float dotR = length(fract(rc) - 0.5) * 1.41421356;
      k = step(dotR, sqrt(tm));
    }
    if (uTone.w > 0.5) {
      gl_FragColor = vec4(inBand ? 1.0 : 0.0, 0.0, 0.0, 1.0);
      return;
    }
  }`,
  ]],
  active: (fx) => fx.tone > 0,
  bind: (gl, u, fx) => gl.uniform4f(u('uTone'), Math.max(0, fx.tone), fx.toneAng, fx.toneBand, toneProbeFlag),
};

registerPostChunk(PLUCK_CHUNK);
registerPostChunk(TONE_CHUNK);
/**
 * FINAL_MERIDIAN = buildFinal([STREAK, PLUCK, TONE]): MERIDIAN THREAD v2's one program (fx.pass = 'meridian'), used
 * only on frames with pluck, pluckGlow, tone or a whip's streak; every other MERIDIAN frame runs the plain FINAL.
 */
registerPostPass('meridian', ['PLUCK', 'TONE', 'STREAK']);

/** Compile the program of a registered pass on every live PostFX now (call from a shot's prepare()). */
export function warmPost(pass: string) {
  for (const p of PostFX.live) p.warm(pass);
}

// ---------------------------------------------------------------- SPOTLIGHT SOLO v2 chunks (FINAL_SOLO)

/**
 * IMPMASK (SPOTLIGHT SOLO v2): the beam impact. Rewrites the two-tone impact line: with uImpMask.x > 0.5 the impact
 * prints only inside the cone d = (vUv - apex)·(aspect, 1), m = (1 - smoothstep(half - soft, half + soft,
 * acos(dot(normalize(d), axis))))·step(0, dot(d, axis)), and outside it the frame goes to impOut by impact·(1-m)·amt.
 * With uImpMask.x 0 it is exactly the original full-frame line.
 */
export const IMPMASK_CHUNK: PostChunk = {
  name: 'IMPMASK',
  decl: 'uniform vec4 uImpMask;\nuniform vec4 uImpMaskB;\nuniform vec4 uImpOut;',
  at: 'impact',
  code: '',
  edits: [[
    '  col = mix(col, mix(uImpA, uImpB, k), uImpact);',
    `  if (uImpMask.x > 0.5) {
    vec2 md = (vUv - uImpMask.yz) * vec2(aspect, 1.0);
    float ml = length(md);
    vec2 mn = ml > 1.0e-5 ? md / ml : uImpMaskB.xy;
    float mang = acos(clamp(dot(mn, uImpMaskB.xy), -1.0, 1.0));
    float mm = (1.0 - smoothstep(uImpMaskB.z - uImpMaskB.w, uImpMaskB.z + uImpMaskB.w, mang)) * step(0.0, dot(md, uImpMaskB.xy));
    col = mix(col, mix(uImpA, uImpB, k), uImpact * mm);
    col = mix(col, uImpOut.rgb, uImpact * (1.0 - mm) * uImpOut.a);
  } else col = mix(col, mix(uImpA, uImpB, k), uImpact);`,
  ]],
  active: (fx) => fx.impMask > 0,
  bind: (gl, u, fx) => {
    const l = Math.hypot(fx.impMaskDX, fx.impMaskDY) || 1;
    gl.uniform4f(u('uImpMask'), fx.impMask > 0 ? 1 : 0, fx.impMaskX, 1 - fx.impMaskY, 0);
    // The axis is a screen direction (aspect-corrected space, y down in FxState): flip y for the GL uv.
    gl.uniform4f(u('uImpMaskB'), fx.impMaskDX / l, -fx.impMaskDY / l, Math.max(0, fx.impMaskHalf), Math.max(1e-4, fx.impMaskSoft));
    gl.uniform4f(u('uImpOut'), fx.impOut[0] / 255, fx.impOut[1] / 255, fx.impOut[2] / 255, clamp01(fx.impOutAmt));
  },
};

/**
 * FLATSHOCK (SPOTLIGHT SOLO v2): flat refraction shocks. The shock loop's ring distance uses d.y / sy (uShockSY[i],
 * from Shock.sy, default 1), so a sy of 0.25-0.4 lays the invisible refraction flat along the turf. SOLO never draws a
 * ring. Active on frames where any shock has sy != 1.
 */
export const FLATSHOCK_CHUNK: PostChunk = {
  name: 'FLATSHOCK',
  decl: 'uniform float uShockSY[4];',
  at: 'warp',
  code: '',
  edits: [['      float dist = length(d);', '      float dist = length(vec2(d.x, d.y / max(uShockSY[i], 0.05)));']],
  active: (fx) => fx.shocks.some((s, i) => i < 4 && s.sy !== undefined && s.sy !== 1),
  bind: (gl, u, fx) => {
    const sy = new Float32Array([1, 1, 1, 1]);
    fx.shocks.slice(0, 4).forEach((s, i) => (sy[i] = s.sy ?? 1));
    gl.uniform1fv(u('uShockSY[0]'), sy);
  },
};

/**
 * NEON (SPOTLIGHT SOLO v2, optional prototype behind the ?neon dev flag): a 3x3 Sobel on the scene luminance at the
 * logical pixel grid; edges above neonThresh glow ivory -> volt, the rest is crushed to void, mixed in by fx.neon.
 * Not part of the 'solo' pass: a frame with fx.neon > 0 compiles its own program (never in the shipped film).
 */
export const NEON_CHUNK: PostChunk = {
  name: 'NEON',
  decl: `uniform vec2 uNeon;
float neonL(vec2 p){ return dot(texture2D(uScene, p).rgb, vec3(0.299, 0.587, 0.114)); }`,
  at: 'impact',
  code: `  if (uNeon.x > 0.0) {
    vec2 np = vec2(1.0 / 640.0, 1.0 / 360.0);
    float n00 = neonL(vUv + np * vec2(-1.0, -1.0)), n10 = neonL(vUv + np * vec2(0.0, -1.0)), n20 = neonL(vUv + np * vec2(1.0, -1.0));
    float n01 = neonL(vUv + np * vec2(-1.0, 0.0)), n21 = neonL(vUv + np * vec2(1.0, 0.0));
    float n02 = neonL(vUv + np * vec2(-1.0, 1.0)), n12 = neonL(vUv + np * vec2(0.0, 1.0)), n22 = neonL(vUv + np * vec2(1.0, 1.0));
    float gx = n20 + 2.0 * n21 + n22 - n00 - 2.0 * n01 - n02;
    float gy = n02 + 2.0 * n12 + n22 - n00 - 2.0 * n10 - n20;
    float e = smoothstep(uNeon.y, uNeon.y + 0.25, length(vec2(gx, gy)));
    vec3 nc = mix(vec3(0.031, 0.012, 0.063), mix(vec3(0.659, 0.502, 1.0), vec3(0.965, 0.941, 0.875), smoothstep(0.5, 1.0, e)), e);
    col = mix(col, nc, clamp(uNeon.x, 0.0, 1.0));
  }`,
  active: (fx) => fx.neon > 0,
  bind: (gl, u, fx) => gl.uniform2f(u('uNeon'), fx.neon, fx.neonThresh),
};

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

registerPostChunk(IMPMASK_CHUNK);
registerPostChunk(FLATSHOCK_CHUNK);
registerPostChunk(NEON_CHUNK);
/**
 * FINAL_SOLO = buildFinal([IMPMASK, FLATSHOCK, STREAK, ECHO]): SPOTLIGHT SOLO v2's one program (fx.pass = 'solo'),
 * used on frames with a cone-masked impact, a flat shock or a whip's streak (a SOLO frame with only fx.echo runs the
 * legacy FINAL_ECHO, the same GLSL). The STREAK chunk is the set's one shared string (GALE's, byte for byte).
 */
registerPostPass('solo', ['IMPMASK', 'FLATSHOCK', 'STREAK', 'ECHO']);

interface Target {
  fb: WebGLFramebuffer;
  tex: WebGLTexture;
  w: number;
  h: number;
}

export class PostFX {
  readonly gl: WebGLRenderingContext;
  private progBright: WebGLProgram;
  private progBlur: WebGLProgram;
  private progFinal: WebGLProgram;
  private progFinalLens: WebGLProgram;
  private progFinalEcho: WebGLProgram;
  private progFinalLensEcho: WebGLProgram;
  private sceneTex: WebGLTexture;
  private quad: WebGLBuffer;
  private a?: Target;
  private b?: Target;
  private w = 0;
  private h = 0;
  private uniCache = new Map<WebGLProgram, Map<string, WebGLUniformLocation | null>>();
  /** Composed programs (buildFinal), by chunk list; null = failed to compile (the legacy program is used). */
  private composed = new Map<string, { p: WebGLProgram; chunks: PostChunk[] } | null>();
  /** Every PostFX alive on the page (warmPost compiles on each). */
  static live: PostFX[] = [];
  /**
   * Dev probe (MERIDIAN THREAD v2): while true, every frame with fx.tone > 0 and fx.impact >= 0.5 also renders the TONE
   * band mask into a 160 x 90 target and logs the fraction of pixels inside the threshold band to toneLog (the brief's
   * at-most-25 % rule for the halftone stage). Off by default (no cost).
   */
  static toneProbe = false;
  static toneLog: { t: number; frac: number }[] = [];
  private probe?: Target;

  static create(canvas: HTMLCanvasElement): PostFX | null {
    try {
      const gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false });
      if (!gl) return null;
      return new PostFX(gl);
    } catch (e) {
      console.warn('PostFX disabled:', e);
      return null;
    }
  }

  private constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.progBright = this.program(VERT, BRIGHT);
    this.progBlur = this.program(VERT, BLUR);
    this.progFinal = this.program(VERT, FINAL);
    this.progFinalLens = this.program(VERT, FINAL_LENS);
    this.progFinalEcho = this.program(VERT, FINAL_ECHO);
    this.progFinalLensEcho = this.program(VERT, FINAL_LENS_ECHO);
    this.quad = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    this.sceneTex = this.texture();
    PostFX.live.push(this);
  }

  /** The composed program for `chunks` (compiled once, lazily). */
  private composedProgram(chunks: PostChunk[]) {
    const key = chunks.map((c) => c.name).join('+');
    let e = this.composed.get(key);
    if (e === undefined) {
      try {
        e = { p: this.program(VERT, buildFinal(chunks)), chunks };
      } catch (err) {
        console.error(`post program ${key} failed to compile`, err);
        e = null;
      }
      this.composed.set(key, e);
    }
    return e;
  }

  /** Compile a registered pass's program now (see warmPost). */
  warm(pass: string) {
    const names = PASSES.get(pass);
    if (names) this.composedProgram(CHUNKS.filter((c) => names.includes(c.name)));
  }

  /**
   * The chunk set of this frame when it needs a composed program, else null (the legacy programs: exactly the
   * shaders the shipped specials have always run).
   */
  private chunksFor(fx: FxState): PostChunk[] | null {
    const fresh = CHUNKS.filter((c) => !c.legacy && c.active(fx));
    if (!fresh.length) return null;
    const names = new Set(fresh.map((c) => c.name));
    for (const c of CHUNKS) if (c.legacy && c.active(fx)) names.add(c.name);
    const pass = fx.pass ? PASSES.get(fx.pass) : undefined;
    if (pass) for (const n of pass) names.add(n);
    return CHUNKS.filter((c) => names.has(c.name));
  }

  private shader(type: number, src: string) {
    const gl = this.gl;
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
    return s;
  }

  private program(vs: string, fs: string) {
    const gl = this.gl;
    const p = gl.createProgram()!;
    gl.attachShader(p, this.shader(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, this.shader(gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, 'aPos');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'link');
    return p;
  }

  private texture() {
    const gl = this.gl;
    const t = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  private target(w: number, h: number): Target {
    const gl = this.gl;
    const tex = this.texture();
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    const fb = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { fb, tex, w, h };
  }

  private u(p: WebGLProgram, name: string) {
    let m = this.uniCache.get(p);
    if (!m) this.uniCache.set(p, (m = new Map()));
    if (!m.has(name)) m.set(name, this.gl.getUniformLocation(p, name));
    return m.get(name)!;
  }

  private resize(w: number, h: number) {
    if (w === this.w && h === this.h) return;
    const gl = this.gl;
    this.w = w;
    this.h = h;
    for (const t of [this.a, this.b]) {
      if (t) {
        gl.deleteFramebuffer(t.fb);
        gl.deleteTexture(t.tex);
      }
    }
    const bw = Math.max(1, Math.round(w / 4));
    const bh = Math.max(1, Math.round(h / 4));
    this.a = this.target(bw, bh);
    this.b = this.target(bw, bh);
  }

  private draw(p: WebGLProgram, out: Target | null) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, out ? out.fb : null);
    gl.viewport(0, 0, out ? out.w : this.w, out ? out.h : this.h);
    gl.useProgram(p);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  render(src: HTMLCanvasElement, fx: FxState, time: number) {
    const gl = this.gl;
    const w = gl.canvas.width, h = gl.canvas.height;
    this.resize(w, h);
    const A = this.a!, B = this.b!;

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.sceneTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);

    // Bloom: bright pass at 1/4 res, then two separable blur iterations.
    let p = this.progBright;
    gl.useProgram(p);
    gl.uniform1i(this.u(p, 'uTex'), 0);
    gl.uniform2f(this.u(p, 'uTexel'), 1 / w, 1 / h);
    gl.uniform1f(this.u(p, 'uThresh'), fx.bloomThresh);
    this.draw(p, A);

    p = this.progBlur;
    gl.useProgram(p);
    gl.uniform1i(this.u(p, 'uTex'), 0);
    for (const spread of [1, 2.2]) {
      gl.bindTexture(gl.TEXTURE_2D, A.tex);
      gl.uniform2f(this.u(p, 'uDir'), spread / A.w, 0);
      this.draw(p, B);
      gl.bindTexture(gl.TEXTURE_2D, B.tex);
      gl.uniform2f(this.u(p, 'uDir'), 0, spread / A.h);
      this.draw(p, A);
    }

    // Final composite (the lens variant only while a pressure lens is active).
    const lens = fx.lens !== 0;
    p = lens ? this.progFinalLens : this.progFinal;
    const echo = fx.echo > 0;
    if (echo) p = lens ? this.progFinalLensEcho : this.progFinalEcho;
    // A v2 chunk on this frame: the composed program (its chunks upload their own uniforms below).
    const want = this.chunksFor(fx);
    const comp = want ? this.composedProgram(want) : null;
    if (comp) p = comp.p;
    gl.useProgram(p);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.sceneTex);
    gl.uniform1i(this.u(p, 'uScene'), 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, A.tex);
    gl.uniform1i(this.u(p, 'uBloomTex'), 1);
    gl.activeTexture(gl.TEXTURE0);

    gl.uniform2f(this.u(p, 'uRes'), w, h);
    gl.uniform1f(this.u(p, 'uTime'), time);
    const sh = new Float32Array(16);
    fx.shocks.slice(0, 4).forEach((s, i) => {
      sh[i * 4] = s.x;
      sh[i * 4 + 1] = 1 - s.y;
      sh[i * 4 + 2] = s.r;
      sh[i * 4 + 3] = s.s;
    });
    gl.uniform4fv(this.u(p, 'uShock[0]'), sh);
    gl.uniform1f(this.u(p, 'uShockW'), fx.shockWidth);
    gl.uniform1f(this.u(p, 'uCA'), fx.ca);
    gl.uniform3f(this.u(p, 'uRadial'), fx.radialX, 1 - fx.radialY, fx.radial);
    gl.uniform1f(this.u(p, 'uImpact'), fx.impact);
    gl.uniform3f(this.u(p, 'uImpA'), fx.impA[0] / 255, fx.impA[1] / 255, fx.impA[2] / 255);
    gl.uniform3f(this.u(p, 'uImpB'), fx.impB[0] / 255, fx.impB[1] / 255, fx.impB[2] / 255);
    gl.uniform1f(this.u(p, 'uImpThresh'), fx.impThresh);
    gl.uniform4f(
      this.u(p, 'uFlash'),
      fx.flashColor[0] / 255,
      fx.flashColor[1] / 255,
      fx.flashColor[2] / 255,
      Math.min(1, Math.max(0, fx.flash)),
    );
    gl.uniform1f(this.u(p, 'uBloom'), fx.bloom);
    gl.uniform1f(this.u(p, 'uVig'), fx.vignette);
    gl.uniform1f(this.u(p, 'uSat'), fx.sat);
    gl.uniform1f(this.u(p, 'uContrast'), fx.contrast);
    gl.uniform3f(this.u(p, 'uTint'), fx.tint[0] / 255, fx.tint[1] / 255, fx.tint[2] / 255);
    gl.uniform1f(this.u(p, 'uGrain'), fx.grain);
    gl.uniform4f(this.u(p, 'uCut'), fx.cutX, 1 - fx.cutY, fx.cutR, fx.cut);
    gl.uniform2f(this.u(p, 'uCutDir'), fx.cutDirX, -fx.cutDirY);
    gl.uniform4f(this.u(p, 'uCutGlow'), fx.cutColor[0] / 255, fx.cutColor[1] / 255, fx.cutColor[2] / 255, fx.cutGlow);
    gl.uniform1f(this.u(p, 'uCutW'), fx.cutWidth);
    gl.uniform2f(this.u(p, 'uCutArc'), fx.cutA0, fx.cutA1 < fx.cutA0 ? fx.cutA1 + Math.PI * 2 : fx.cutA1);
    if (comp) {
      const prog = p;
      if (PostFX.toneProbe && fx.tone > 0 && fx.impact >= 0.5 && comp.chunks.includes(TONE_CHUNK)) {
        toneProbeFlag = 1;
        for (const c of comp.chunks) c.bind(gl, (n) => this.u(prog, n), fx);
        this.probe ??= this.target(160, 90);
        // target() leaves its own texture bound on unit 0: put the scene back before sampling it.
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.sceneTex);
        this.draw(p, this.probe);
        const px = new Uint8Array(160 * 90 * 4);
        gl.readPixels(0, 0, 160, 90, gl.RGBA, gl.UNSIGNED_BYTE, px);
        let n = 0;
        for (let i = 0; i < px.length; i += 4) if (px[i] > 127) n++;
        PostFX.toneLog.push({ t: time, frac: n / (160 * 90) });
        toneProbeFlag = 0;
      }
      for (const c of comp.chunks) c.bind(gl, (n) => this.u(prog, n), fx);
      this.draw(p, null);
      return;
    }
    if (lens) gl.uniform4f(this.u(p, 'uLens'), fx.lensX, 1 - fx.lensY, fx.lensR, fx.lens);
    if (echo) {
      gl.uniform3f(this.u(p, 'uEcho'), fx.echoX, 1 - fx.echoY, Math.min(1, fx.echo));
      gl.uniform1f(this.u(p, 'uEchoR'), fx.echoR);
      gl.uniform2f(this.u(p, 'uEchoD'), fx.echoDX, -fx.echoDY);
      gl.uniform3f(this.u(p, 'uEchoColor'), fx.echoColor[0], fx.echoColor[1], fx.echoColor[2]);
    }
    this.draw(p, null);
  }
}
