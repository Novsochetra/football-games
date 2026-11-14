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
  private sceneTex: WebGLTexture;
  private quad: WebGLBuffer;
  private a?: Target;
  private b?: Target;
  private w = 0;
  private h = 0;
  private uniCache = new Map<WebGLProgram, Map<string, WebGLUniformLocation | null>>();

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
    this.quad = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    this.sceneTex = this.texture();
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
    if (lens) gl.uniform4f(this.u(p, 'uLens'), fx.lensX, 1 - fx.lensY, fx.lensR, fx.lens);
    this.draw(p, null);
  }
}
