// Procedural sound effects (WebAudio). No audio files: every hit, whoosh and
// stinger is synthesized, so the cinematic stays a single self-contained page.
//
// Buses (GALE HAMMER added the last three; at rest they are transparent, so the other specials sound
// exactly as before):
//   voices -> out -> muffle low-pass (+ gain dip) -> glue compressor -> limiter -> speakers
//   reverb send -> hall -> out
//   crowd() -> crowdBus (duck gain -> muffle duck gain) -> out   (one shared crowd bus: duck(depth, dur))
//   dry bus (whine, breath, airTone) -> glue compressor: bypasses the muffle, so they stay audible over it.

/** The GALE HAMMER air-tone motif, exact pitches (Hz). Heard only on the title and in the palm blow. */
export const AIR_TONES = { G5: 783.99, B5: 987.77, D6: 1174.66 } as const;

type VoiceKind = 'tail' | 'ring';
interface Voice {
  kind: VoiceKind;
  g: GainNode;
  srcs: AudioScheduledSourceNode[];
  end: number;
}

export class Sfx {
  private ac?: AudioContext;
  private out!: GainNode;
  private verb!: ConvolverNode;
  private verbSend!: GainNode;
  private noise!: AudioBuffer;
  /** Master low-pass for the GALE HAMMER mute (cutoff at Nyquist = transparent). */
  private lp!: BiquadFilterNode;
  /** Gain after the low-pass: 1 when open, dipping ~4 dB at full muffle (the world goes quiet, not just dull). */
  private lpGain!: GainNode;
  /** Bus that bypasses the low-pass (whine, breath, air tones). */
  private dry!: GainNode;
  /** Shared crowd bus: crowd() feeds crowdIn; duck() drives crowdDuck; muffle() also drives crowdMuf. */
  private crowdIn!: GainNode;
  private crowdDuck!: GainNode;
  private crowdMuf!: GainNode;
  /** Current muffle level (0 = open). */
  private muf = 0;
  /** True once an ear-pop has moved the low-pass away from its rest value (clearBus re-parks it). */
  private lpDirty = false;
  private ducked = false;
  /** Sustained voices that clearBus() can choke ('ring': cymbals, hums; 'tail': whine, gust, inhale). */
  private voices: Voice[] = [];
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
    this.out.gain.value = this.enabled ? 0.8 : 0;
    // Brick-wall limiter after the glue compressor: the biggest hits (strike, net) stay clean on phone speakers.
    const lim = ac.createDynamicsCompressor();
    lim.threshold.value = -3;
    lim.knee.value = 0;
    lim.ratio.value = 20;
    lim.attack.value = 0.001;
    lim.release.value = 0.08;
    // Muffle low-pass between out and the compressor; parked at Nyquist it is a pass-through.
    this.lp = ac.createBiquadFilter();
    this.lp.type = 'lowpass';
    this.lp.frequency.value = ac.sampleRate / 2;
    this.lp.Q.value = 0.5;
    this.lpGain = ac.createGain();
    this.out.connect(this.lp).connect(this.lpGain).connect(comp).connect(lim).connect(ac.destination);
    this.dry = ac.createGain();
    this.dry.gain.value = this.enabled ? 0.8 : 0;
    this.dry.connect(comp);

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

    // One shared crowd bus (same mix as before: dry to out, half to the hall).
    this.crowdIn = ac.createGain();
    this.crowdDuck = ac.createGain();
    this.crowdMuf = ac.createGain();
    this.crowdIn.connect(this.crowdDuck).connect(this.crowdMuf).connect(this.out);
    const crowdSend = ac.createGain();
    crowdSend.gain.value = 0.5;
    this.crowdMuf.connect(crowdSend).connect(this.verbSend);
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (this.out && this.ac) {
      this.out.gain.setTargetAtTime(on ? 0.8 : 0, this.ac.currentTime, 0.02);
      this.dry.gain.setTargetAtTime(on ? 0.8 : 0, this.ac.currentTime, 0.02);
    }
  }

  private ok() {
    return !!this.ac && this.enabled && !this.silent;
  }

  private env(g: GainNode, t0: number, a: number, peak: number, d: number) {
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  }

  /** A voice's output: to `bus` (default the main bus, through the muffle), optionally panned, plus a reverb send. */
  private dest(wet = 0.3, pan = 0, bus?: AudioNode) {
    const ac = this.ac!;
    const g = ac.createGain();
    const to = bus ?? this.out;
    if (pan && typeof ac.createStereoPanner === 'function') {
      const p = ac.createStereoPanner();
      p.pan.value = Math.max(-1, Math.min(1, pan));
      g.connect(p).connect(to);
    } else g.connect(to);
    if (wet > 0) {
      const s = ac.createGain();
      s.gain.value = wet;
      g.connect(s).connect(this.verbSend);
    }
    return g;
  }

  /** A chokeable voice output (see clearBus): register sources that end at `end` (AudioContext time). */
  private held(kind: VoiceKind, to: AudioNode, srcs: AudioScheduledSourceNode[], end: number) {
    const ac = this.ac!;
    const g = ac.createGain();
    g.connect(to);
    const now = ac.currentTime;
    this.voices = this.voices.filter((v) => v.end > now);
    this.voices.push({ kind, g, srcs, end });
    return g;
  }

  private choke(kind: VoiceKind) {
    const ac = this.ac!, t = ac.currentTime;
    this.voices = this.voices.filter((v) => {
      if (v.kind !== kind || v.end <= t) return v.end > t;
      v.g.gain.cancelScheduledValues(t);
      v.g.gain.setValueAtTime(v.g.gain.value, t);
      v.g.gain.linearRampToValueAtTime(0, t + 0.03);
      for (const s of v.srcs) {
        try {
          s.stop(t + 0.05);
        } catch {
          /* already stopped */
        }
      }
      return false;
    });
  }

  private mufFreq(level: number) {
    const ny = this.ac!.sampleRate / 2;
    return level <= 0 ? ny : Math.min(ny, 20000 * Math.pow(300 / 20000, Math.min(1, level)));
  }

  /** Point the master low-pass back at the current muffle level (snapping exactly to Nyquist when open). */
  private lpRest(t: number, tc: number) {
    const f = this.lp.frequency;
    const target = this.mufFreq(this.muf);
    f.setTargetAtTime(target, t, tc);
    if (this.muf <= 0) f.setValueAtTime(target, t + tc * 12);
  }

  /**
   * GALE HAMMER master muffle: 0 = open, 1 = fully muffled (cutoff 20 kHz -> 300 Hz, exponential, with a
   * 15 ms smoothing; the main bus also dips ~4 dB) and the crowd bus ducked with it. The dry bus (whine, breath, airTone) is not filtered.
   * A state, not an event: it works while `silent` (seek), so the level always matches the cinematic clock.
   * Cinematic.step calls it every step with the shot's muffle(t); calling with an unchanged level is free.
   */
  muffle(level: number) {
    if (!this.ac) return;
    const l = Math.round(Math.max(0, Math.min(1, level)) * 1000) / 1000;
    // Unchanged level: nothing to do (and an ear-pop dip in flight is left to finish).
    if (l === this.muf) return;
    this.muf = l;
    this.lpDirty = false;
    const t = this.ac.currentTime;
    this.lp.frequency.cancelScheduledValues(t);
    this.lpRest(t, 0.015);
    this.lpGain.gain.cancelScheduledValues(t);
    this.lpGain.gain.setTargetAtTime(1 - 0.4 * l, t, 0.015);
    if (l <= 0) this.lpGain.gain.setValueAtTime(1, t + 0.2);
    this.crowdMuf.gain.cancelScheduledValues(t);
    this.crowdMuf.gain.setTargetAtTime(1 - 0.6 * l, t, 0.015);
  }

  /** Current muffle level (0..1). */
  get muffleLevel() {
    return this.muf;
  }

  /**
   * Duck the shared crowd bus by `depth` (0..1, 1 = silent). With dur > 0 it releases by itself after
   * `dur` seconds; with dur = 0 it holds until duck(0) or clearBus(). Shared by the new specials.
   */
  duck(depth: number, dur = 0) {
    if (!this.ac) return;
    const t = this.ac.currentTime, g = this.crowdDuck.gain;
    const d = Math.max(0, Math.min(1, depth));
    g.cancelScheduledValues(t);
    g.setTargetAtTime(1 - d, t, 0.04);
    this.ducked = d > 0;
    if (d > 0 && dur > 0) {
      g.setTargetAtTime(1, t + dur, 0.15);
      g.setValueAtTime(1, t + dur + 1.5);
    }
  }

  /**
   * Reset the shared buses: muffle back to 0 (open), any duck released, ringing voices (cymbals, hums)
   * choked. With { tails: true } the long GALE voices (whine, gust, inhale) are choked too: use that when
   * the timeline jumps (seek, unleash, kickoff); a plain clearBus() on a cut lets a tail ring into the next shot.
   * Works while `silent`.
   */
  clearBus(o: { tails?: boolean } = {}) {
    if (!this.ac) return;
    const t = this.ac.currentTime;
    if (this.muf !== 0 || this.lpDirty) {
      this.muf = 0;
      this.lpDirty = false;
      this.lp.frequency.cancelScheduledValues(t);
      this.lpRest(t, 0.015);
      this.lpGain.gain.cancelScheduledValues(t);
      this.lpGain.gain.setTargetAtTime(1, t, 0.015);
      this.lpGain.gain.setValueAtTime(1, t + 0.2);
      this.crowdMuf.gain.cancelScheduledValues(t);
      this.crowdMuf.gain.setTargetAtTime(1, t, 0.015);
    }
    if (this.ducked) {
      this.ducked = false;
      this.crowdDuck.gain.cancelScheduledValues(t);
      this.crowdDuck.gain.setTargetAtTime(1, t, 0.04);
    }
    this.choke('ring');
    if (o.tails) this.choke('tail');
  }

  private noiseSrc() {
    const s = this.ac!.createBufferSource();
    s.buffer = this.noise;
    s.loop = true;
    s.loopStart = Math.random();
    return s;
  }

  /** Deep cinematic hit: pitch-dropping sine + filtered noise burst. pan -1..1 (optional). */
  boom(power = 1, wet = 0.5, pan = 0) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const o = ac.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(32, t + 0.7);
    const g = ac.createGain();
    this.env(g, t, 0.005, 0.9 * power, 1.1);
    o.connect(g).connect(this.dest(wet, pan));
    o.start(t);
    o.stop(t + 1.3);
    const n = this.noiseSrc();
    const f = ac.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(3200, t);
    f.frequency.exponentialRampToValueAtTime(120, t + 0.6);
    const ng = ac.createGain();
    this.env(ng, t, 0.002, 0.7 * power, 0.7);
    n.connect(f).connect(ng).connect(this.dest(wet, pan));
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

  /** Filtered-noise whoosh sweeping from f0 to f1. pan -1..1 (optional). */
  whoosh(dur = 0.6, f0 = 300, f1 = 2400, gain = 0.5, pan = 0) {
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
    n.connect(f).connect(g).connect(this.dest(0.4, pan));
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
      // Through the shared crowd bus (duck / muffle); same mix as dest(0.5).
      n.connect(f).connect(g).connect(this.crowdIn);
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

  // ---------------------------------------------------------------- GALE HAMMER voices

  /** Reverse air sweep: a noise band falling 4 kHz -> 200 Hz with rising gain and a hard cut (the inhale). */
  inhale(dur = 0.6, gain = 0.5) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const n = this.noiseSrc();
    const f = ac.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 0.9;
    f.frequency.setValueAtTime(4000, t);
    f.frequency.exponentialRampToValueAtTime(200, t + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain * 0.5), t + dur * 0.6);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain * 2.2), t + dur);
    g.gain.linearRampToValueAtTime(0, t + dur + 0.012);
    n.connect(f).connect(g).connect(this.held('tail', this.dest(0.15), [n], t + dur + 0.05));
    n.start(t);
    n.stop(t + dur + 0.05);
  }

  /** Rubbery compression groan, pitch falling 180 -> 70 Hz, stretched over `dur` (the ball squashing). */
  squash(dur = 0.5, gain = 0.26) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const out = this.dest(0.15);
    const lf = ac.createBiquadFilter();
    lf.type = 'lowpass';
    lf.frequency.setValueAtTime(1100, t);
    lf.frequency.exponentialRampToValueAtTime(320, t + dur);
    lf.Q.value = 4;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(gain * 0.4, t + dur * 0.85);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.05);
    lf.connect(g).connect(out);
    const vib = ac.createOscillator();
    vib.frequency.value = 23;
    const vg = ac.createGain();
    vg.gain.value = 7;
    vib.connect(vg);
    for (const [type, k, lvl] of [['sawtooth', 1, 0.7], ['triangle', 0.5, 1]] as const) {
      const o = ac.createOscillator();
      o.type = type;
      o.frequency.setValueAtTime(180 * k, t);
      o.frequency.exponentialRampToValueAtTime(70 * k, t + dur);
      vg.connect(o.frequency);
      const og = ac.createGain();
      og.gain.value = lvl;
      o.connect(og).connect(lf);
      o.start(t);
      o.stop(t + dur + 0.1);
    }
    vib.start(t);
    vib.stop(t + dur + 0.1);
  }

  /** Sonic boom: two high-passed noise cracks 0.12 s apart over a 50 Hz sub, with a long hall tail. */
  sonicBoom(power = 1, pan = 0) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const o = ac.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(50, t);
    o.frequency.exponentialRampToValueAtTime(36, t + 0.9);
    const g = ac.createGain();
    this.env(g, t, 0.006, 0.8 * power, 1.2);
    o.connect(g).connect(this.dest(0.45, pan));
    o.start(t);
    o.stop(t + 1.3);
    const body = this.noiseSrc();
    const bf = ac.createBiquadFilter();
    bf.type = 'lowpass';
    bf.frequency.value = 420;
    const bg = ac.createGain();
    this.env(bg, t, 0.002, 0.45 * power, 0.4);
    body.connect(bf).connect(bg).connect(this.dest(0.4, pan));
    body.start(t);
    body.stop(t + 0.5);
    for (const [dt, pk] of [[0, 0.62], [0.12, 0.5]] as const) {
      const n = this.noiseSrc();
      const f = ac.createBiquadFilter();
      f.type = 'highpass';
      f.frequency.value = 1400;
      const cg = ac.createGain();
      this.env(cg, t + dt, 0.001, pk * power, 0.16);
      n.connect(f).connect(cg).connect(this.dest(0.85, pan));
      n.start(t + dt);
      n.stop(t + dt + 0.25);
    }
  }

  /**
   * Ear-pop: the pressure step you feel in your ears (a lift, a plane). A sine sub dropping 90 -> 35 Hz over
   * 0.12 s, a soft click, and a brief dip of the master low-pass that springs back to the current muffle level.
   * One step, never a lub-dub pair.
   */
  earPop(power = 1) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const o = ac.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(90, t);
    o.frequency.exponentialRampToValueAtTime(35, t + 0.12);
    const g = ac.createGain();
    this.env(g, t, 0.004, 0.75 * power, 0.32);
    o.connect(g).connect(this.dest(0.1));
    o.start(t);
    o.stop(t + 0.4);
    // A quiet octave above, so phone speakers (no sub) still feel the step.
    const o2 = ac.createOscillator();
    o2.type = 'triangle';
    o2.frequency.setValueAtTime(180, t);
    o2.frequency.exponentialRampToValueAtTime(70, t + 0.12);
    const g2 = ac.createGain();
    this.env(g2, t, 0.004, 0.22 * power, 0.18);
    o2.connect(g2).connect(this.dest(0.05));
    o2.start(t);
    o2.stop(t + 0.3);
    const n = this.noiseSrc();
    const f = ac.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 2600;
    f.Q.value = 1.2;
    const cg = ac.createGain();
    this.env(cg, t, 0.001, 0.18 * power, 0.012);
    n.connect(f).connect(cg).connect(this.dest(0.05));
    n.start(t);
    n.stop(t + 0.05);
    // The world dips for a moment, then comes back to where the muffle had it.
    const lf = this.lp.frequency;
    const base = this.mufFreq(this.muf);
    const dip = Math.max(260, Math.min(1600, base * 0.16));
    lf.cancelScheduledValues(t);
    lf.setTargetAtTime(dip, t, 0.008);
    lf.setTargetAtTime(base, t + 0.07, 0.05);
    if (this.muf <= 0) lf.setValueAtTime(base, t + 0.7);
    this.lpDirty = true;
  }

  /** The net exhaling: a long breathy rush (noise band 1.2 kHz -> 300 Hz) with a slow flutter. A tail voice. */
  gust(dur = 1.4, gain = 0.3) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const n = this.noiseSrc();
    const f = ac.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 0.9;
    f.frequency.setValueAtTime(1200, t);
    f.frequency.exponentialRampToValueAtTime(300, t + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.15, dur * 0.2));
    g.gain.setValueAtTime(gain, t + dur * 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const fl = ac.createGain();
    fl.gain.value = 1;
    const lfo = ac.createOscillator();
    lfo.frequency.setValueAtTime(5.5, t);
    lfo.frequency.linearRampToValueAtTime(2.5, t + dur);
    const lg = ac.createGain();
    lg.gain.value = 0.35;
    lfo.connect(lg).connect(fl.gain);
    n.connect(f).connect(g).connect(fl).connect(this.held('tail', this.dest(0.4), [n, lfo], t + dur + 0.05));
    n.start(t);
    lfo.start(t);
    n.stop(t + dur + 0.05);
    lfo.stop(t + dur + 0.05);
  }

  /** A band-passed breath puff on the dry bus (heard over the muffle). len = seconds. */
  breath(len = 0.35, gain = 0.32) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const n = this.noiseSrc();
    const hp = ac.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 300;
    const f = ac.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 0.8;
    f.frequency.setValueAtTime(1600, t);
    f.frequency.exponentialRampToValueAtTime(1050, t + len);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + len * 0.28);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    n.connect(hp).connect(f).connect(g).connect(this.dest(0.1, 0, this.dry));
    n.start(t);
    n.stop(t + len + 0.05);
  }

  /** Thin high whine (timeStop family) on the dry bus: the ringing left behind by the strike. A tail voice. */
  whine(dur = 1.9, gain = 0.12) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const out = this.held('tail', this.dest(0.2, 0, this.dry), [], t + dur + 0.05);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.08);
    g.gain.setValueAtTime(gain, t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(out);
    const v = this.voices[this.voices.length - 1];
    for (const [fr, lvl] of [[2580, 1], [5160, 0.18]] as const) {
      const o = ac.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(fr, t);
      o.frequency.linearRampToValueAtTime(fr * 0.977, t + dur);
      const og = ac.createGain();
      og.gain.value = lvl;
      o.connect(og).connect(g);
      o.start(t);
      o.stop(t + dur + 0.05);
      v.srcs.push(o);
    }
  }

  /**
   * Breathy bottle tone on the dry bus: noise through a Q 30 band-pass at `freq` plus a quiet sine at the same
   * pitch. Use the exact AIR_TONES pitches. About 0.9 s long.
   */
  airTone(freq: number, gain = 0.3) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const env = ac.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(gain, t + 0.06);
    env.gain.setValueAtTime(gain, t + 0.42);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    env.connect(this.dest(0.25, 0, this.dry));
    const n = this.noiseSrc();
    const f = ac.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 30;
    f.frequency.value = freq;
    const ng = ac.createGain();
    ng.gain.value = 9;
    n.connect(f).connect(ng).connect(env);
    const o = ac.createOscillator();
    o.type = 'sine';
    o.frequency.value = freq;
    const og = ac.createGain();
    og.gain.value = 0.22;
    o.connect(og).connect(env);
    // Breath flutter on the noise part only.
    const lfo = ac.createOscillator();
    lfo.frequency.value = 6.5;
    const lg = ac.createGain();
    lg.gain.value = 2.5;
    lfo.connect(lg).connect(ng.gain);
    for (const s of [n, o, lfo]) {
      s.start(t);
      s.stop(t + 0.95);
    }
  }
}
