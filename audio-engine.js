/**
 * Cockapoo Audio Engine (v3.0 - Real Canine Soundboard)
 * Powered by authentic recorded dog barks with real-time Web Audio API pitch tuning
 */

class CockapooAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.compressor = null;
    this.pitchMultiplier = 1.0; // 0.7x (Big Dog) to 1.4x (Puppy)
    this.masterVolume = 0.90;

    // Decoded real audio buffers cache
    this.buffers = {};
    this.isLoaded = false;

    // Visualizer callbacks
    this.onSoundStart = null;
    this.onSoundEnd = null;
  }

  /**
   * Initialize Web Audio API and pre-decode all real dog bark recordings
   */
  async initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Master compressor to ensure clean, loud, punchy playback without clipping
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-8, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(14, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(5, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.002, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.12, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);

      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      // Pre-decode all real audio files into memory
      await this.loadRealBarkBuffers();
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  async loadRealBarkBuffers() {
    if (!window.REAL_BARKS) return;

    for (const [key, b64Data] of Object.entries(window.REAL_BARKS)) {
      try {
        const arrayBuf = this.base64ToArrayBuffer(b64Data);
        // decodeAudioData returns a promise in modern browsers
        this.buffers[key] = await this.ctx.decodeAudioData(arrayBuf);
      } catch (err) {
        console.warn(`Could not decode bark ${key}:`, err);
      }
    }
    this.isLoaded = true;
  }

  setPitchMultiplier(val) {
    this.pitchMultiplier = Math.max(0.65, Math.min(1.5, val));
  }

  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1.2, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Plays a genuine dog bark recording buffer with live pitch adjustment
   */
  async playRealBark(soundKey, soundName) {
    await this.initContext();

    const buffer = this.buffers[soundKey];
    if (!buffer) {
      console.warn(`Audio buffer ${soundKey} not loaded yet`);
      return;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    // Natural micro-variation (±2% pitch jitter so repeated taps sound organic)
    const naturalJitter = 1.0 + (Math.random() - 0.5) * 0.04;
    source.playbackRate.setValueAtTime(this.pitchMultiplier * naturalJitter, this.ctx.currentTime);

    source.connect(this.compressor);
    source.start(this.ctx.currentTime);

    const duration = buffer.duration / this.pitchMultiplier;
    this.notifyStart(soundName, 'bark', duration);
  }

  notifyStart(name, category, duration) {
    if (this.onSoundStart) {
      this.onSoundStart(name, category, { duration, pitch: this.pitchMultiplier });
    }
    setTimeout(() => {
      if (this.onSoundEnd) this.onSoundEnd(name);
    }, duration * 1000);
  }

  // -------------------------------------------------------------------------
  // Core Dog Bark Sounds (Real Recordings)
  // -------------------------------------------------------------------------
  playClassicBark() {
    this.playRealBark('single', 'classic_bark');
  }

  playDoubleBark() {
    this.playRealBark('double', 'double_bark');
  }

  playPuppyYip() {
    this.playRealBark('puppy', 'puppy_yip');
  }

  playCuriousBoof() {
    this.playRealBark('boof', 'curious_boof');
  }

  playDeepWoof() {
    this.playRealBark('woof', 'deep_woof');
  }

  playAlertBark() {
    this.playRealBark('alert', 'alert_bark');
  }

  // -------------------------------------------------------------------------
  // Bonus Dog Attention Sounds (Squeaker & Sing-Along Howl)
  // -------------------------------------------------------------------------

  /**
   * Authentic Dual-Tone Squeaky Toy (Press & Release Squeak)
   */
  async playSqueak() {
    await this.initContext();
    const t = this.ctx.currentTime;
    const dur = 0.35;
    const baseFreq = 2100 * this.pitchMultiplier;

    // Carrier & FM Modulator for realistic rubber toy squish
    const carrier = this.ctx.createOscillator();
    const modulator = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    carrier.type = 'sine';
    modulator.type = 'triangle';
    modulator.frequency.setValueAtTime(baseFreq * 1.5, t);
    modGain.gain.setValueAtTime(baseFreq * 0.4, t);
    modGain.gain.exponentialRampToValueAtTime(baseFreq * 0.05, t + dur);

    modulator.connect(modGain);
    modGain.connect(carrier.frequency);

    carrier.frequency.setValueAtTime(baseFreq * 0.85, t);
    carrier.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, t + 0.06);
    carrier.frequency.exponentialRampToValueAtTime(baseFreq * 0.95, t + dur);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(baseFreq * 1.1, t);
    filter.Q.setValueAtTime(5.0, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.9, t + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    carrier.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);

    modulator.start(t);
    carrier.start(t);
    modulator.stop(t + dur);
    carrier.stop(t + dur);

    this.notifyStart('squeak', 'squeak', dur);
  }

  /**
   * "AWOOO" Sing-Along Pack Howl (triggers howling back)
   */
  async playHowl() {
    await this.initContext();
    const t = this.ctx.currentTime;
    const dur = 2.2;
    const base = 280 * this.pitchMultiplier;
    const peak = 490 * this.pitchMultiplier;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const formant = this.ctx.createBiquadFilter();
    const env = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sine';

    const rise = 0.6;
    const plateau = 1.6;

    [osc1, osc2].forEach(osc => {
      osc.frequency.setValueAtTime(base, t);
      osc.frequency.exponentialRampToValueAtTime(peak, t + rise);
      osc.frequency.setValueAtTime(peak, t + plateau);
      osc.frequency.exponentialRampToValueAtTime(peak * 0.72, t + dur);
    });

    lfo.frequency.setValueAtTime(5.4, t);
    lfoGain.gain.setValueAtTime(2, t);
    lfoGain.gain.linearRampToValueAtTime(14 * this.pitchMultiplier, t + rise);
    lfoGain.gain.setValueAtTime(14 * this.pitchMultiplier, t + plateau);
    lfoGain.gain.linearRampToValueAtTime(2, t + dur);

    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfoGain.connect(osc2.frequency);

    formant.type = 'bandpass';
    formant.frequency.setValueAtTime(base * 1.6, t);
    formant.frequency.exponentialRampToValueAtTime(peak * 1.5, t + rise);
    formant.Q.setValueAtTime(3.2, t);

    env.gain.setValueAtTime(0.001, t);
    env.gain.linearRampToValueAtTime(0.75, t + 0.4);
    env.gain.setValueAtTime(0.75, t + plateau);
    env.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc1.connect(formant);
    osc2.connect(formant);
    formant.connect(env);
    env.connect(this.compressor);

    lfo.start(t);
    osc1.start(t);
    osc2.start(t);
    lfo.stop(t + dur);
    osc1.stop(t + dur);
    osc2.stop(t + dur);

    this.notifyStart('howl', 'howl', dur);
  }
}

window.CockapooAudio = new CockapooAudioEngine();
