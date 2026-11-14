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

/**
 * The MERIDIAN THREAD plucked motif, D-major pentatonic (Hz): the cut-in's open fifths D4-A4-E5, the strike's low
 * root D3, the three needle eyes E5-F#5-A5, and No.7's touch D6 that resolves it ("mi-fa-sol... DO!").
 */
export const THREAD_NOTES = { D3: 146.83, D4: 293.66, A4: 440, D5: 587.33, E5: 659.26, Fs5: 739.99, A5: 880, D6: 1174.66 } as const;

type VoiceKind = 'tail' | 'ring';
interface Voice {
  kind: VoiceKind;
  g: GainNode;
  srcs: AudioScheduledSourceNode[];
  end: number;
  /** SPOTLIGHT SOLO: 'cymbal' (crash, swell: choke() cuts them) or 'hum' (the lamp hum). */
  tag?: 'cymbal' | 'hum';
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

  /**
   * Choke held voices. choke() (SPOTLIGHT SOLO) is the drummer grabbing the cymbal: every ringing crash and swell
   * is cut in 20 ms (a musical stop, never a filter). choke('ring' | 'tail') is clearBus's per-kind choke (30 ms).
   */
  choke(kind: VoiceKind | 'cymbal' = 'cymbal') {
    if (!this.ac) return;
    if (kind === 'cymbal') return this.chokeTag('cymbal', 0.02);
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

  // ---------------------------------------------------------------- SPOTLIGHT SOLO voices
  // The drum solo (toms, snare, rim, hats, kick drum, crash, reversed swell, the choke, the stick count-in), the
  // stage (relay CHUNKs, the follow-spot clunk, the lamp hum) and the crowd counting OLÉ!s. Every touch is a tuned
  // tom with a boot "tok" layered in, so it stays football and not a UI chime.

  /** A boot "tok": a 4 ms band-passed noise click plus a 15 ms 420 Hz blip. */
  private tok(t: number, gain: number, pan: number) {
    const ac = this.ac!;
    const n = this.noiseSrc();
    const f = ac.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 1500;
    f.Q.value = 1.1;
    const g = ac.createGain();
    this.env(g, t, 0.0008, 0.32 * gain, 0.012);
    n.connect(f).connect(g).connect(this.dest(0.08, pan));
    n.start(t);
    n.stop(t + 0.04);
    const o = ac.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(520, t);
    o.frequency.exponentialRampToValueAtTime(380, t + 0.015);
    const og = ac.createGain();
    this.env(og, t, 0.001, 0.22 * gain, 0.02);
    o.connect(og).connect(this.dest(0.05, pan));
    o.start(t);
    o.stop(t + 0.05);
  }

  /**
   * Tuned tom (a touch on the ball): a sine dropping from 1.6x to 1x `freq` in 40 ms, a triangle membrane partial
   * (1.59x) and the boot tok. Low notes ring longer. Use the TOMS pitches (solo/common.ts). pan -1..1.
   */
  tom(freq: number, gain = 0.5, pan = 0) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const dec = 0.2 + 20 / Math.max(40, freq);
    const o = ac.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq * 1.6, t);
    o.frequency.exponentialRampToValueAtTime(freq, t + 0.04);
    const g = ac.createGain();
    this.env(g, t, 0.002, 0.95 * gain, dec);
    o.connect(g).connect(this.dest(0.22, pan));
    o.start(t);
    o.stop(t + dec + 0.05);
    const o2 = ac.createOscillator();
    o2.type = 'triangle';
    o2.frequency.setValueAtTime(freq * 1.59 * 1.5, t);
    o2.frequency.exponentialRampToValueAtTime(freq * 1.59, t + 0.04);
    const g2 = ac.createGain();
    this.env(g2, t, 0.002, 0.32 * gain, dec * 0.45);
    o2.connect(g2).connect(this.dest(0.18, pan));
    o2.start(t);
    o2.stop(t + dec * 0.45 + 0.05);
    this.tok(t, gain * 2, pan);
  }

  /** Snare: band-passed noise (1.8-4 kHz) plus a 185 Hz body. power 0.3 = a ghost note, 1 = a full hit. */
  snare(power = 1, pan = 0) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const n = this.noiseSrc();
    const hp = ac.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1800;
    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 4000;
    const g = ac.createGain();
    const dec = 0.1 + 0.08 * power;
    this.env(g, t, 0.001, 0.55 * power, dec);
    n.connect(hp).connect(lp).connect(g).connect(this.dest(0.3, pan));
    n.start(t);
    n.stop(t + dec + 0.05);
    const o = ac.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(185, t + 0.02);
    const og = ac.createGain();
    this.env(og, t, 0.001, 0.45 * power, 0.09);
    o.connect(og).connect(this.dest(0.2, pan));
    o.start(t);
    o.stop(t + 0.14);
  }

  /** Rimshot (the sole landing on the ball): a hard wooden crack, two short partials and a small body. */
  rim(power = 1, pan = 0) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    for (const [fr, gn, d] of [[1720, 0.22, 0.03], [820, 0.18, 0.045], [330, 0.25, 0.06]] as const) {
      const o = ac.createOscillator();
      o.type = fr > 1000 ? 'square' : 'triangle';
      o.frequency.value = fr;
      const g = ac.createGain();
      this.env(g, t, 0.0008, gn * power, d);
      o.connect(g).connect(this.dest(0.25, pan));
      o.start(t);
      o.stop(t + d + 0.03);
    }
    const n = this.noiseSrc();
    const f = ac.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 3200;
    f.Q.value = 1.4;
    const g = ac.createGain();
    this.env(g, t, 0.0005, 0.5 * power, 0.025);
    n.connect(f).connect(g).connect(this.dest(0.3, pan));
    n.start(t);
    n.stop(t + 0.06);
  }

  /** Hi-hat: high-passed noise, closed (45 ms) or open (0.32 s). The feints' ghost notes. */
  hat(open = false, gain = 0.2, pan = 0) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const n = this.noiseSrc();
    const hp = ac.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7000;
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 10000;
    bp.Q.value = 0.7;
    const g = ac.createGain();
    const dec = open ? 0.32 : 0.045;
    this.env(g, t, 0.0008, gain, dec);
    n.connect(hp).connect(bp).connect(g).connect(this.dest(0.15, pan));
    n.start(t);
    n.stop(t + dec + 0.05);
  }

  /** Kick drum (the skill keys): a sine falling 150 -> 48 Hz with a beater click. */
  kickDrum(power = 1) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const o = ac.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(48, t + 0.11);
    const g = ac.createGain();
    this.env(g, t, 0.002, 0.85 * power, 0.42);
    o.connect(g).connect(this.dest(0.12));
    o.start(t);
    o.stop(t + 0.5);
    // A quiet octave so phone speakers (no sub) still hear the beat.
    const o2 = ac.createOscillator();
    o2.type = 'triangle';
    o2.frequency.setValueAtTime(300, t);
    o2.frequency.exponentialRampToValueAtTime(96, t + 0.08);
    const g2 = ac.createGain();
    this.env(g2, t, 0.002, 0.22 * power, 0.12);
    o2.connect(g2).connect(this.dest(0.05));
    o2.start(t);
    o2.stop(t + 0.18);
    const n = this.noiseSrc();
    const f = ac.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 3500;
    const ng = ac.createGain();
    this.env(ng, t, 0.0005, 0.3 * power, 0.008);
    n.connect(f).connect(ng).connect(this.dest(0.05));
    n.start(t);
    n.stop(t + 0.03);
  }

  /** Metallic cymbal partials (inharmonic squares, high-passed) into `to`; returns the sources. */
  private cymbal(t: number, to: AudioNode, gain: number, len: number, rise = 0): AudioScheduledSourceNode[] {
    const ac = this.ac!;
    const hp = ac.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 5200;
    const g = ac.createGain();
    if (rise > 0) {
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain, t + rise);
      g.gain.linearRampToValueAtTime(0, t + rise + 0.015);
    } else this.env(g, t, 0.002, gain, len);
    hp.connect(g).connect(to);
    const srcs: AudioScheduledSourceNode[] = [];
    for (const fr of [205.3, 304.4, 369.6, 522.7, 540, 800]) {
      const o = ac.createOscillator();
      o.type = 'square';
      o.frequency.value = fr * 1.6;
      const og = ac.createGain();
      og.gain.value = 0.16;
      o.connect(og).connect(hp);
      srcs.push(o);
    }
    const n = this.noiseSrc();
    const nf = ac.createBiquadFilter();
    nf.type = 'highpass';
    nf.frequency.value = 6500;
    const ngn = ac.createGain();
    ngn.gain.value = 0.9;
    n.connect(nf).connect(ngn).connect(g);
    srcs.push(n);
    const end = t + (rise > 0 ? rise + 0.03 : len + 0.05);
    for (const s of srcs) {
      s.start(t);
      s.stop(end);
    }
    return srcs;
  }

  /** Register the last held voice as a cymbal (choke() finds it). */
  private tagLast(tag: 'cymbal' | 'hum') {
    const v = this.voices[this.voices.length - 1];
    if (v) v.tag = tag;
    return v;
  }

  /** Crash cymbal (the snap, the poke, the stop): rings ~1.5 s. A 'ring' voice: choke() and clearBus() cut it. */
  crash(power = 1, pan = 0) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const len = 0.9 + 0.7 * power;
    const out = this.held('ring', this.dest(0.45, pan), [], t + len + 0.05);
    const v = this.tagLast('cymbal')!;
    v.srcs.push(...this.cymbal(t, out, 0.28 * power, len));
  }

  /** Reversed cymbal: swells for `dur` seconds and stops dead (into a downbeat). Choked by choke() only. */
  crashSwell(dur = 0.4, gain = 0.22) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const out = this.held('tail', this.dest(0.35), [], t + dur + 0.05);
    const v = this.tagLast('cymbal')!;
    v.srcs.push(...this.cymbal(t, out, gain, 0, Math.max(0.05, dur)));
  }

  /** Cut every voice with `tag` (fade `fade` s). */
  private chokeTag(tag: 'cymbal' | 'hum', fade: number) {
    const ac = this.ac!, t = ac.currentTime;
    this.voices = this.voices.filter((v) => {
      if (v.tag !== tag || v.end <= t) return v.end > t;
      v.g.gain.cancelScheduledValues(t);
      v.g.gain.setValueAtTime(v.g.gain.value, t);
      v.g.gain.linearRampToValueAtTime(0, t + fade);
      for (const s of v.srcs) {
        try {
          s.stop(t + fade + 0.01);
        } catch {
          /* already stopped */
        }
      }
      return false;
    });
  }

  /** Drumsticks clicked together (the count-in): one dry wooden click. */
  sticks(gain = 0.5) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const n = this.noiseSrc();
    const f = ac.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 2500;
    f.Q.value = 4;
    const g = ac.createGain();
    this.env(g, t, 0.0005, 0.7 * gain, 0.03);
    n.connect(f).connect(g).connect(this.dest(0.25));
    n.start(t);
    n.stop(t + 0.06);
    for (const [fr, gn, d] of [[1850, 0.35, 0.04], [2960, 0.2, 0.025]] as const) {
      const o = ac.createOscillator();
      o.type = 'sine';
      o.frequency.value = fr;
      const og = ac.createGain();
      this.env(og, t, 0.0005, gn * gain, d);
      o.connect(og).connect(this.dest(0.25));
      o.start(t);
      o.stop(t + d + 0.03);
    }
  }

  /** A floodlight bank dying: a 60 Hz relay thump, a metallic click and a 100 Hz hum that dies over 0.3 s. */
  lightsOff(power = 1) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const o = ac.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(64, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
    const g = ac.createGain();
    this.env(g, t, 0.003, 0.8 * power, 0.24);
    o.connect(g).connect(this.dest(0.35));
    o.start(t);
    o.stop(t + 0.3);
    const thump = this.noiseSrc();
    const tf = ac.createBiquadFilter();
    tf.type = 'lowpass';
    tf.frequency.value = 900;
    const tg = ac.createGain();
    this.env(tg, t, 0.002, 0.45 * power, 0.07);
    thump.connect(tf).connect(tg).connect(this.dest(0.4));
    thump.start(t);
    thump.stop(t + 0.12);
    const c = ac.createOscillator();
    c.type = 'square';
    c.frequency.value = 3150;
    const cg = ac.createGain();
    this.env(cg, t, 0.0005, 0.06 * power, 0.018);
    c.connect(cg).connect(this.dest(0.3));
    c.start(t);
    c.stop(t + 0.04);
    const h = ac.createOscillator();
    h.type = 'sawtooth';
    h.frequency.setValueAtTime(100, t);
    h.frequency.linearRampToValueAtTime(88, t + 0.3);
    const hl = ac.createBiquadFilter();
    hl.type = 'lowpass';
    hl.frequency.setValueAtTime(900, t);
    hl.frequency.exponentialRampToValueAtTime(200, t + 0.3);
    const hg = ac.createGain();
    hg.gain.setValueAtTime(0.07 * power, t);
    hg.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    h.connect(hl).connect(hg).connect(this.dest(0.3));
    h.start(t);
    h.stop(t + 0.35);
  }

  /** A floodlight bank slamming back on: a relay clunk and an electric hum that swells and settles. */
  lightsOn(power = 1) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const o = ac.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(80, t);
    o.frequency.exponentialRampToValueAtTime(50, t + 0.16);
    const g = ac.createGain();
    this.env(g, t, 0.003, 0.75 * power, 0.22);
    o.connect(g).connect(this.dest(0.4));
    o.start(t);
    o.stop(t + 0.3);
    const n = this.noiseSrc();
    const f = ac.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 1500;
    const ng = ac.createGain();
    this.env(ng, t, 0.001, 0.4 * power, 0.06);
    n.connect(f).connect(ng).connect(this.dest(0.4));
    n.start(t);
    n.stop(t + 0.1);
    const h = ac.createOscillator();
    h.type = 'sawtooth';
    h.frequency.setValueAtTime(92, t);
    h.frequency.linearRampToValueAtTime(100, t + 0.15);
    const hl = ac.createBiquadFilter();
    hl.type = 'lowpass';
    hl.frequency.setValueAtTime(300, t);
    hl.frequency.exponentialRampToValueAtTime(1300, t + 0.15);
    const hg = ac.createGain();
    hg.gain.setValueAtTime(0.0001, t);
    hg.gain.exponentialRampToValueAtTime(0.05 * power, t + 0.12);
    hg.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
    h.connect(hl).connect(hg).connect(this.dest(0.35));
    h.start(t);
    h.stop(t + 0.8);
  }

  /** The follow-spot striking: a heavy clunk plus a short 800 Hz ring. */
  spotOn(power = 1) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const o = ac.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(96, t);
    o.frequency.exponentialRampToValueAtTime(52, t + 0.12);
    const g = ac.createGain();
    this.env(g, t, 0.002, 0.8 * power, 0.17);
    o.connect(g).connect(this.dest(0.35));
    o.start(t);
    o.stop(t + 0.25);
    const n = this.noiseSrc();
    const f = ac.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 1200;
    const ng = ac.createGain();
    this.env(ng, t, 0.001, 0.5 * power, 0.05);
    n.connect(f).connect(ng).connect(this.dest(0.35));
    n.start(t);
    n.stop(t + 0.08);
    for (const [fr, gn] of [[800, 0.07], [1612, 0.025]] as const) {
      const r = ac.createOscillator();
      r.type = 'sine';
      r.frequency.value = fr;
      const rg = ac.createGain();
      this.env(rg, t + 0.004, 0.002, gn * power, 0.26);
      r.connect(rg).connect(this.dest(0.45));
      r.start(t);
      r.stop(t + 0.32);
    }
  }

  /** Current lamp hum voice (hum() keeps exactly one alive). */
  private humV?: Voice;

  /** The quiet lamp hum: 120 + 240 Hz buzz with a faint shimmer (a 'ring' voice: clearBus() and hum(false) stop it). */
  private startHum(dur: number, gain: number) {
    const ac = this.ac!, t = ac.currentTime;
    const end = dur > 0 ? t + dur + 0.08 : Infinity;
    const out = this.held('ring', this.dest(0.12), [], end);
    const v = this.tagLast('hum')!;
    this.humV = v;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.04);
    if (dur > 0) {
      g.gain.setValueAtTime(gain, t + dur);
      g.gain.linearRampToValueAtTime(0, t + dur + 0.06);
    }
    g.connect(out);
    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1100;
    lp.connect(g);
    for (const [type, fr, lvl] of [['sine', 120, 1], ['sine', 240, 0.6], ['sawtooth', 120, 0.22]] as const) {
      const o = ac.createOscillator();
      o.type = type;
      o.frequency.value = fr;
      const og = ac.createGain();
      og.gain.value = lvl;
      o.connect(og).connect(lp);
      v.srcs.push(o);
    }
    // Faint shimmer: a high partial with a slow tremolo (bypasses the low-pass).
    const sh = ac.createOscillator();
    sh.type = 'sine';
    sh.frequency.value = 2400;
    const sg = ac.createGain();
    sg.gain.value = 0.05;
    const lfo = ac.createOscillator();
    lfo.frequency.value = 5.5;
    const lg = ac.createGain();
    lg.gain.value = 0.04;
    lfo.connect(lg).connect(sg.gain);
    sh.connect(sg).connect(g);
    v.srcs.push(sh, lfo);
    for (const s of v.srcs) {
      s.start(t);
      if (dur > 0) s.stop(t + dur + 0.08);
    }
  }

  /** Start the lamp hum for `dur` s (0 = until clearBus() or hum(false)). An event: ignored while silent. */
  lampHum(dur = 0, gain = 0.025) {
    if (!this.ok()) return;
    this.startHum(dur, gain);
  }

  /**
   * The lamp hum as a state (works while silent, like muffle): hum(true) keeps exactly one hum alive, hum(false)
   * stops it in 50 ms. Shots that should hum call it from update() every step, so seek and replay are exact
   * (clearBus() in init stops it; the next step starts it again, a seamless 40 ms cross-fade).
   */
  hum(on: boolean, gain = 0.025) {
    if (!this.ac) return;
    const t = this.ac.currentTime;
    const live = !!this.humV && this.humV.end > t && this.voices.includes(this.humV);
    if (on && !live) {
      if (this.enabled) this.startHum(0, gain);
    } else if (!on && live) this.chokeTag('hum', 0.05);
  }

  /**
   * One crowd OLÉ! (level 1-4: the defender count). Many detuned voices through two moving formant band-passes,
   * O -> LÉ (400/800 Hz -> 500/1700 Hz), the pitch rising on the stressed LÉ. Each level adds voices, gain and
   * formant height; the fourth swells. Through the shared crowd bus (duck applies).
   */
  ole(level = 1) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const L = Math.max(1, Math.min(4, Math.round(level)));
    const n = 3 + 2 * L;
    const gain = 0.14 + 0.05 * L;
    const lift = 1 + 0.045 * (L - 1);
    const f0 = 140 * Math.pow(2, (L - 1) / 12);
    const oEnd = 0.2, leEnd = 0.62 + 0.08 * (L - 1);
    const mix = ac.createGain();
    mix.gain.value = 1 / Math.sqrt(n);
    const env = ac.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(gain * 0.7, t + 0.05);
    env.gain.setValueAtTime(gain * 0.7, t + oEnd - 0.03);
    env.gain.exponentialRampToValueAtTime(gain, t + oEnd + 0.05);
    env.gain.setValueAtTime(gain, t + leEnd * 0.7);
    env.gain.exponentialRampToValueAtTime(0.0001, t + leEnd);
    env.connect(this.crowdIn);
    for (const [fa, fb, q, lvl] of [[400, 500, 5, 1], [800, 1700, 7, 0.7]] as const) {
      const bp = ac.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = q;
      bp.frequency.setValueAtTime(fa * lift, t);
      bp.frequency.setValueAtTime(fa * lift, t + oEnd - 0.02);
      bp.frequency.exponentialRampToValueAtTime(fb * lift, t + oEnd + 0.05);
      const bg = ac.createGain();
      bg.gain.value = lvl * 3;
      mix.connect(bp).connect(bg).connect(env);
    }
    for (let i = 0; i < n; i++) {
      const o = ac.createOscillator();
      o.type = 'sawtooth';
      const f = f0 * (1 + (Math.random() - 0.5) * 0.08) * (i % 3 === 0 ? 1.5 : 1);
      const on = t + Math.random() * 0.035;
      o.frequency.setValueAtTime(f, on);
      o.frequency.setValueAtTime(f, t + oEnd - 0.02);
      o.frequency.exponentialRampToValueAtTime(f * 1.26, t + oEnd + 0.06);
      o.frequency.exponentialRampToValueAtTime(f * 1.12, t + leEnd);
      const og = ac.createGain();
      og.gain.setValueAtTime(0, t);
      og.gain.setValueAtTime(0.5 + Math.random() * 0.5, on);
      o.connect(og).connect(mix);
      o.start(t);
      o.stop(t + leEnd + 0.05);
    }
    // Breath of the crowd under the voices.
    const nz = this.noiseSrc();
    const ng = ac.createGain();
    ng.gain.value = 0.35;
    nz.connect(ng).connect(mix);
    nz.start(t);
    nz.stop(t + leEnd + 0.05);
  }

  /** An awed (or laughing) crowd "ooooh": voices through an OO formant (320/800 Hz), pitch up then down, ~1.2 s. */
  ooh(power = 0.3) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const dur = 1.2;
    const env = ac.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(Math.max(0.0002, 0.5 * power), t + 0.35);
    env.gain.setValueAtTime(Math.max(0.0002, 0.5 * power), t + 0.6);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    env.connect(this.crowdIn);
    const mix = ac.createGain();
    mix.gain.value = 0.35;
    for (const [fr, q, lvl] of [[320, 5, 1], [800, 6, 0.5]] as const) {
      const bp = ac.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = fr;
      bp.Q.value = q;
      const bg = ac.createGain();
      bg.gain.value = lvl * 3;
      mix.connect(bp).connect(bg).connect(env);
    }
    for (let i = 0; i < 8; i++) {
      const o = ac.createOscillator();
      o.type = 'sawtooth';
      const f = 170 * (1 + (Math.random() - 0.5) * 0.1);
      o.frequency.setValueAtTime(f, t);
      o.frequency.exponentialRampToValueAtTime(f * 1.35, t + 0.45);
      o.frequency.exponentialRampToValueAtTime(f * 1.05, t + dur);
      o.connect(mix);
      o.start(t + Math.random() * 0.06);
      o.stop(t + dur + 0.05);
    }
    const nz = this.noiseSrc();
    const ng = ac.createGain();
    ng.gain.value = 0.5;
    nz.connect(ng).connect(mix);
    nz.start(t);
    nz.stop(t + dur + 0.05);
  }

  /** Studs grinding the turf (B's slide tackle): a fluttering noise band, `dur` s. */
  scrape(dur = 0.9, gain = 0.3) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const n = this.noiseSrc();
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(1100, t);
    bp.frequency.exponentialRampToValueAtTime(650, t + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.03);
    g.gain.setValueAtTime(gain, t + dur * 0.55);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const fl = ac.createGain();
    fl.gain.value = 0.7;
    const lfo = ac.createOscillator();
    lfo.type = 'sawtooth';
    lfo.frequency.value = 23;
    const lg = ac.createGain();
    lg.gain.value = 0.35;
    lfo.connect(lg).connect(fl.gain);
    n.connect(bp).connect(g).connect(fl).connect(this.dest(0.25));
    n.start(t);
    lfo.start(t);
    n.stop(t + dur + 0.05);
    lfo.stop(t + dur + 0.05);
  }

  /** A quiet stud scuff on a footfall or a landing. */
  scuff(gain = 0.18, pan = 0) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const n = this.noiseSrc();
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1300;
    bp.Q.value = 0.9;
    const g = ac.createGain();
    this.env(g, t, 0.002, gain, 0.06);
    n.connect(bp).connect(g).connect(this.dest(0.12, pan));
    n.start(t);
    n.stop(t + 0.1);
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

  // ---------------------------------------------------------------- MERIDIAN THREAD voices

  /** A soft waveshaper curve (cached): the faint "buzz" that leans the pluck toward a Cambodian chapei. */
  private buzzCurve?: Float32Array<ArrayBuffer>;

  /**
   * One plucked-string voice starting at AudioContext time t0 (shared by pluck and strum). Additive partials at
   * 1, 2, 3 and 4.1x freq (1, 0.5, 0.25, 0.12; the upper ones die faster), a 2 ms attack and an exponential decay,
   * a 15-cent sharp onset settling to pitch in 40 ms (string tension), a 3 ms band-passed noise "pick" at 3 kHz and
   * a quiet waveshaped buzz. Wet 0.65 (it rings in the stadium). A 'tail' voice: it rings across a cut, a seek chokes it.
   */
  private pluckAt(t0: number, freq: number, decay: number, gain: number, pan = 0) {
    const ac = this.ac!;
    const d = Math.max(0.05, decay);
    const end = t0 + d + 0.1;
    const srcs: AudioScheduledSourceNode[] = [];
    const out = this.held('tail', this.dest(0.65, pan), srcs, end);
    const body = ac.createGain();
    body.gain.value = 1;
    body.connect(out);
    for (const [k, amp, dk] of [[1, 1, 1], [2, 0.5, 0.55], [3, 0.25, 0.35], [4.1, 0.12, 0.22]] as const) {
      const f = freq * k;
      if (f > ac.sampleRate / 2 - 200) continue;
      const o = ac.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(f, t0);
      o.detune.setValueAtTime(15, t0);
      o.detune.linearRampToValueAtTime(0, t0 + 0.04);
      const g = ac.createGain();
      this.env(g, t0, 0.002, gain * amp, d * dk);
      o.connect(g).connect(body);
      o.start(t0);
      o.stop(end);
      srcs.push(o);
    }
    // The chapei buzz: the fundamental through a soft clipper, very quiet, decaying with the string.
    if (!this.buzzCurve) {
      const n = 1024;
      const c = new Float32Array(new ArrayBuffer(n * 4));
      for (let i = 0; i < n; i++) {
        const x = (i / (n - 1)) * 2 - 1;
        c[i] = Math.tanh(3 * x) * 0.8 + 0.2 * x * x * Math.sign(x);
      }
      this.buzzCurve = c;
    }
    const bo = ac.createOscillator();
    bo.type = 'triangle';
    bo.frequency.setValueAtTime(freq, t0);
    const sh = ac.createWaveShaper();
    sh.curve = this.buzzCurve;
    const bg = ac.createGain();
    this.env(bg, t0, 0.003, gain * 0.07, d * 0.4);
    bo.connect(sh).connect(bg).connect(body);
    bo.start(t0);
    bo.stop(end);
    srcs.push(bo);
    // The pick: 3 ms of band-passed noise at 3 kHz.
    const n = this.noiseSrc();
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 3000;
    bp.Q.value = 1.4;
    const ng = ac.createGain();
    this.env(ng, t0, 0.0005, gain * 0.35, 0.003);
    n.connect(bp).connect(ng).connect(body);
    n.start(t0);
    n.stop(t0 + 0.02);
  }

  /**
   * MERIDIAN THREAD: a bright plucked string (between a harp and a small lute). Use the exact THREAD_NOTES pitches.
   * decay = seconds to silence, gain = peak (the eye notes climb 0.45 -> 0.5 -> 0.55; the touch is the loudest).
   */
  pluck(freq: number, decay = 1.2, gain = 0.5, pan = 0) {
    if (!this.ok()) return;
    this.pluckAt(this.ac!.currentTime, freq, decay, gain, pan);
  }

  /** MERIDIAN THREAD: plucks in sequence, `gap` seconds apart (the diptych strum of every note of the motif). */
  strum(freqs: readonly number[], gap = 0.025, decay = 1.6, gain = 0.32) {
    if (!this.ok()) return;
    const t = this.ac!.currentTime;
    freqs.forEach((f, i) => this.pluckAt(t + i * gap, f, decay, gain, ((i / Math.max(1, freqs.length - 1)) * 2 - 1) * 0.25));
  }

  /** MERIDIAN THREAD: his inner clock, a dry watch tick (1 ms high-passed noise click + a 20 ms 3.2 kHz sine blip). */
  tick(gain = 0.4) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const n = this.noiseSrc();
    const hp = ac.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 4500;
    const ng = ac.createGain();
    this.env(ng, t, 0.0003, gain, 0.001);
    n.connect(hp).connect(ng).connect(this.dest(0));
    n.start(t);
    n.stop(t + 0.01);
    const o = ac.createOscillator();
    o.type = 'sine';
    o.frequency.value = 3200;
    const g = ac.createGain();
    this.env(g, t, 0.001, gain * 0.45, 0.019);
    o.connect(g).connect(this.dest(0));
    o.start(t);
    o.stop(t + 0.03);
  }

  /**
   * MERIDIAN THREAD: the zipper (a thread pulled through cloth): band-passed noise (Q 6) sweeping f0 -> f1, amplitude
   * modulated by a 70 Hz square (the teeth). Sweep down (f0 > f1) for stitches pulling tight.
   */
  zip(dur = 0.4, f0 = 600, f1 = 4000, gain = 0.3) {
    if (!this.ok()) return;
    const ac = this.ac!, t = ac.currentTime;
    const n = this.noiseSrc();
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 6;
    bp.frequency.setValueAtTime(Math.max(40, f0), t);
    bp.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + Math.min(0.03, dur * 0.2));
    g.gain.setValueAtTime(Math.max(0.0002, gain), t + dur * 0.75);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    // Teeth: a 70 Hz square swinging the AM gain between 0 and 1.
    const am = ac.createGain();
    am.gain.value = 0.5;
    const lfo = ac.createOscillator();
    lfo.type = 'square';
    lfo.frequency.value = 70;
    const lg = ac.createGain();
    lg.gain.value = 0.5;
    lfo.connect(lg).connect(am.gain);
    n.connect(bp).connect(g).connect(am).connect(this.dest(0.3));
    n.start(t);
    lfo.start(t);
    n.stop(t + dur + 0.05);
    lfo.stop(t + dur + 0.05);
  }
}
