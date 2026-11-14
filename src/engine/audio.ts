// Procedural sound effects (WebAudio). No audio files: every hit, whoosh and
// stinger is synthesized, so the cinematic stays a single self-contained page.

export class Sfx {
  private ac?: AudioContext;
  private out!: GainNode;
  private verb!: ConvolverNode;
  private verbSend!: GainNode;
  private noise!: AudioBuffer;
  enabled = true;
  /** When true, calls are ignored (used while fast-forwarding a seek). */
  silent = false;

  unlock() {
    if (this.ac) {
      if (this.ac.state === 'suspended') this.ac.resume();
      return;
    }
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    const ac = new AC();
    this.ac = ac;
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 6;
    comp.attack.value = 0.003;
    comp.release.value = 0.2;
    this.out = ac.createGain();
    this.out.gain.value = 0.8;
    // Brick-wall limiter after the glue compressor: the biggest hits (strike, net) stay clean on phone speakers.
    const lim = ac.createDynamicsCompressor();
    lim.threshold.value = -3;
    lim.knee.value = 0;
    lim.ratio.value = 20;
    lim.attack.value = 0.001;
    lim.release.value = 0.08;
    this.out.connect(comp).connect(lim).connect(ac.destination);

    const len = ac.sampleRate * 2;
    this.noise = ac.createBuffer(1, len, ac.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

    // Big-hall reverb from a decaying noise impulse.
    const irLen = ac.sampleRate * 2.6;
    const ir = ac.createBuffer(2, irLen, ac.sampleRate);
    for (let c = 0; c < 2; c++) {
      const ch = ir.getChannelData(c);
      for (let i = 0; i < irLen; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, 2.6);
    }
    this.verb = ac.createConvolver();
    this.verb.buffer = ir;
    this.verbSend = ac.createGain();
    this.verbSend.gain.value = 0.35;
    this.verbSend.connect(this.verb).connect(this.out);
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (this.out && this.ac) this.out.gain.setTargetAtTime(on ? 0.8 : 0, this.ac.currentTime, 0.02);
  }

  private ok() {
    return !!this.ac && this.enabled && !this.silent;
  }

  private env(g: GainNode, t0: number, a: number, peak: number, d: number) {
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  }

  private dest(wet = 0.3) {
    const ac = this.ac!;
    const g = ac.createGain();
    g.connect(this.out);
    if (wet > 0) {
      const s = ac.createGain();
      s.gain.value = wet;
      g.connect(s).connect(this.verbSend);
    }
    return g;
  }

  private noiseSrc() {
    const s = this.ac!.createBufferSource();
    s.buffer = this.noise;
    s.loop = true;
    s.loopStart = Math.random();
    return s;
  }

  /** Deep cinematic hit: pitch-dropping sine + filtered noise burst. */
  boom(power = 1, wet = 0.5) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const o = ac.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(32, t + 0.7);
    const g = ac.createGain();
    this.env(g, t, 0.005, 0.9 * power, 1.1);
    o.connect(g).connect(this.dest(wet));
    o.start(t);
    o.stop(t + 1.3);
    const n = this.noiseSrc();
    const f = ac.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(3200, t);
    f.frequency.exponentialRampToValueAtTime(120, t + 0.6);
    const ng = ac.createGain();
    this.env(ng, t, 0.002, 0.7 * power, 0.7);
    n.connect(f).connect(ng).connect(this.dest(wet));
    n.start(t);
    n.stop(t + 0.9);
  }

  /** Sharp crack layered on top of hits. */
  crack(power = 1) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const n = this.noiseSrc();
    const f = ac.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 1800;
    const g = ac.createGain();
    this.env(g, t, 0.001, 0.6 * power, 0.12);
    n.connect(f).connect(g).connect(this.dest(0.4));
    n.start(t);
    n.stop(t + 0.2);
  }

  /** Ball strike thump. */
  kick(power = 1) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const o = ac.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(60, t + 0.12);
    const g = ac.createGain();
    this.env(g, t, 0.002, 0.8 * power, 0.16);
    o.connect(g).connect(this.dest(0.2));
    o.start(t);
    o.stop(t + 0.2);
    this.crack(0.5 * power);
  }

  /** Filtered-noise whoosh sweeping from f0 to f1. */
  whoosh(dur = 0.6, f0 = 300, f1 = 2400, gain = 0.5) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const n = this.noiseSrc();
    const f = ac.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 1.2;
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(f).connect(g).connect(this.dest(0.4));
    n.start(t);
    n.stop(t + dur + 0.05);
  }

  /** Low rumble that swells for `dur` seconds (charging power). */
  rumble(dur = 2, gain = 0.6) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const n = this.noiseSrc();
    const f = ac.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(90, t);
    f.frequency.linearRampToValueAtTime(260, t + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.85);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.25);
    n.connect(f).connect(g).connect(this.dest(0.2));
    n.start(t);
    n.stop(t + dur + 0.3);
    const o = ac.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(38, t);
    o.frequency.linearRampToValueAtTime(70, t + dur);
    const lf = ac.createBiquadFilter();
    lf.type = 'lowpass';
    lf.frequency.value = 160;
    const og = ac.createGain();
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(gain * 0.5, t + dur * 0.9);
    og.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.2);
    o.connect(lf).connect(og).connect(this.dest(0.1));
    o.start(t);
    o.stop(t + dur + 0.3);
  }

  /** Flame crackle bed. */
  crackle(dur = 2, gain = 0.25) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const n = this.noiseSrc();
    const f = ac.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 900;
    f.Q.value = 0.6;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.3);
    g.gain.setValueAtTime(gain, t + dur - 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    // amplitude flutter
    const lfo = ac.createOscillator();
    lfo.frequency.value = 13;
    const lg = ac.createGain();
    lg.gain.value = gain * 0.6;
    lfo.connect(lg).connect(g.gain);
    n.connect(f).connect(g).connect(this.dest(0.2));
    n.start(t);
    lfo.start(t);
    n.stop(t + dur);
    lfo.stop(t + dur);
  }

  /** Metallic glint ("shing"). `pitch` scales every partial so repeated glints can vary. */
  shing(pitch = 1) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    for (const [fr, gn] of [[2637, 0.18], [3951, 0.12], [5274, 0.08], [3136, 0.1]] as const) {
      const o = ac.createOscillator();
      o.type = 'sine';
      o.frequency.value = fr * pitch;
      const g = ac.createGain();
      this.env(g, t, 0.002, gn, 0.9);
      o.connect(g).connect(this.dest(0.7));
      o.start(t);
      o.stop(t + 1);
    }
    this.whoosh(0.18, 3000 * pitch, 9000 * pitch, 0.2);
  }

  /** Brassy power-chord stinger for the special-move cut-in. */
  stinger() {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const notes = [110, 164.8, 220, 277.2, 329.6];
    for (const fr of notes) {
      for (const det of [-6, 6]) {
        const o = ac.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = fr;
        o.detune.value = det;
        const f = ac.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.setValueAtTime(400, t);
        f.frequency.exponentialRampToValueAtTime(4200, t + 0.12);
        f.frequency.exponentialRampToValueAtTime(900, t + 1.2);
        const g = ac.createGain();
        this.env(g, t, 0.02, 0.07, 1.3);
        o.connect(f).connect(g).connect(this.dest(0.6));
        o.start(t);
        o.stop(t + 1.5);
      }
    }
    this.boom(0.6, 0.6);
  }

  /** Reverse-swell into a held high tone: time stops. */
  timeStop(dur = 1.2) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const o = ac.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(1760, t);
    o.frequency.linearRampToValueAtTime(1660, t + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.dest(0.9));
    o.start(t);
    o.stop(t + dur + 0.05);
    const o2 = ac.createOscillator();
    o2.type = 'triangle';
    o2.frequency.value = 55;
    const g2 = ac.createGain();
    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.exponentialRampToValueAtTime(0.25, t + dur * 0.9);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o2.connect(g2).connect(this.dest(0.3));
    o2.start(t);
    o2.stop(t + dur + 0.05);
  }

  /** Roaring meteor (sustained, pitch dropping as it nears). */
  roar(dur = 1.6, gain = 0.5) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const n = this.noiseSrc();
    const f = ac.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 0.8;
    f.frequency.setValueAtTime(1800, t);
    f.frequency.exponentialRampToValueAtTime(220, t + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.8);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(f).connect(g).connect(this.dest(0.4));
    n.start(t);
    n.stop(t + dur + 0.05);
  }

  /** Strained net / glove friction. */
  strain(dur = 1, gain = 0.3) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const o = ac.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(90, t);
    o.frequency.linearRampToValueAtTime(140, t + dur);
    const fm = ac.createOscillator();
    fm.frequency.value = 31;
    const fg = ac.createGain();
    fg.gain.value = 40;
    fm.connect(fg).connect(o.frequency);
    const f = ac.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 700;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f).connect(g).connect(this.dest(0.3));
    o.start(t);
    fm.start(t);
    o.stop(t + dur);
    fm.stop(t + dur);
    this.crackle(dur, gain * 0.7);
  }

  /** Stadium roar. */
  crowd(dur = 3, gain = 0.45) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    for (const [fr, q] of [[500, 0.7], [1200, 1], [2500, 1.4]] as const) {
      const n = this.noiseSrc();
      const f = ac.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = fr;
      f.Q.value = q;
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain, t + 0.25);
      g.gain.setValueAtTime(gain, t + dur * 0.6);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      n.connect(f).connect(g).connect(this.dest(0.5));
      n.start(t);
      n.stop(t + dur);
    }
  }

  /** Short UI blip for the command menu. */
  blip(f = 880) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const o = ac.createOscillator();
    o.type = 'square';
    o.frequency.setValueAtTime(f, t);
    o.frequency.setValueAtTime(f * 1.5, t + 0.05);
    const g = ac.createGain();
    this.env(g, t, 0.002, 0.08, 0.12);
    o.connect(g).connect(this.dest(0));
    o.start(t);
    o.stop(t + 0.15);
  }

  whistle() {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const o = ac.createOscillator();
    o.type = 'sine';
    o.frequency.value = 2900;
    const lfo = ac.createOscillator();
    lfo.frequency.value = 38;
    const lg = ac.createGain();
    lg.gain.value = 120;
    lfo.connect(lg).connect(o.frequency);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
    g.gain.setValueAtTime(0.12, t + 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    o.connect(g).connect(this.dest(0.4));
    o.start(t);
    lfo.start(t);
    o.stop(t + 0.5);
    lfo.stop(t + 0.5);
  }
}
