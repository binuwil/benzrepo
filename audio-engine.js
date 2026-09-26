/**
 * Cockapoo Audio Engine (v3.0 - Real Canine Soundboard)
 * Powered by authentic recorded dog barks with real-time Web Audio API pitch tuning
 */

class CockapooAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.compressor = null;
    this.loadPromise = null;
    this.pitchMultiplier = 1.0; // 0.7x (Big Dog) to 1.4x (Puppy)
    this.masterVolume = 0.90;
    this.activeSources = new Set();
    this.playbackId = 0;
    this.playbackEndTimer = null;
    this.activeHowlSource = null;
    this.currentSoundName = null;

    // Decoded real audio buffers cache
    this.buffers = {};
    this.isLoaded = false;

    // Visualizer callbacks
    this.onSoundStart = null;
    this.onSoundEnd = null;
  }

  /**
    * Initialize Web Audio API and pre-decode bundled canine recordings
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
      this.loadPromise = this.loadRealBarkBuffers();
    }

    if (this.loadPromise) await this.loadPromise;

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
    for (const [key, b64Data] of Object.entries(window.REAL_BARKS || {})) {
      try {
        const arrayBuf = this.base64ToArrayBuffer(b64Data);
        // decodeAudioData returns a promise in modern browsers
        this.buffers[key] = await this.ctx.decodeAudioData(arrayBuf);
      } catch (err) {
        console.warn(`Could not decode bark ${key}:`, err);
      }
    }

    try {
      const response = await fetch('audio/classic_squeak_pixabay.mp3');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this.buffers.classic_squeak = await this.ctx.decodeAudioData(await response.arrayBuffer());
    } catch (err) {
      console.warn('Could not decode Pixabay squeaky-toy recording:', err);
    }

    for (const [key, path] of Object.entries({
      double_squeak: 'audio/double_squeak_pixabay.mp3',
      squeak_burst: 'audio/squeak_burst_pixabay.mp3',
      rubber_duck: 'audio/rubber_duck_pixabay.mp3'
    })) {
      try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        this.buffers[key] = await this.ctx.decodeAudioData(await response.arrayBuffer());
      } catch (err) {
        console.warn(`Could not decode ${key} recording:`, err);
      }
    }

    try {
      const response = await fetch('audio/dog_howl.mp3');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this.buffers.howl = await this.ctx.decodeAudioData(await response.arrayBuffer());
    } catch (err) {
      console.warn('Could not decode dog howl recording:', err);
    }

    for (const [key, path] of Object.entries({
      breed_german_shepherd: 'audio/breed-german-shepherd.mp3',
      breed_bulldog: 'audio/breed-bulldog.mp3',
      breed_terrier: 'audio/breed-terrier.mp3'
    })) {
      try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        this.buffers[key] = await this.ctx.decodeAudioData(await response.arrayBuffer());
      } catch (err) {
        console.warn(`Could not decode ${key} recording:`, err);
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

  trackSource(source) {
    this.activeSources.add(source);
    source.onended = () => {
      this.activeSources.delete(source);
      if (this.activeHowlSource === source) this.activeHowlSource = null;
    };
  }

  stopActivePlayback() {
    this.playbackId++;
    if (this.playbackEndTimer) clearTimeout(this.playbackEndTimer);
    this.playbackEndTimer = null;
    this.currentSoundName = null;

    for (const source of this.activeSources) {
      try {
        source.stop(this.ctx.currentTime);
      } catch (err) {
        console.warn('Could not stop active audio source:', err);
      }
    }
    this.activeSources.clear();
    this.activeHowlSource = null;
  }

  /**
   * Plays a genuine dog bark recording buffer with live pitch adjustment
   */
  async playRealBark(soundKey, soundName, category = 'bark', repetitions = 1, repeatGap = 0.16, maxDuration = 0, startOffset = 0) {
    const playbackId = this.playbackId;
    await this.initContext();
    if (playbackId !== this.playbackId) return;

    const buffer = this.buffers[soundKey];
    if (!buffer) {
      console.warn(`Audio buffer ${soundKey} not loaded yet`);
      return;
    }

    const startTime = this.ctx.currentTime;
    const bufferOffset = Math.min(Math.max(0, startOffset), buffer.duration);
    const availableDuration = buffer.duration - bufferOffset;
    let playbackRate;
    let sourceDuration;
    let duration;

    for (let index = 0; index < repetitions; index++) {
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      this.trackSource(source);

      // Natural micro-variation (±2% pitch jitter so repeated taps sound organic)
      const naturalJitter = 1.0 + (Math.random() - 0.5) * 0.04;
      playbackRate = this.pitchMultiplier * naturalJitter;
      source.playbackRate.setValueAtTime(playbackRate, startTime);

      const sourceGain = soundName === 'howl' ? this.ctx.createGain() : null;
      if (sourceGain) {
        sourceGain.gain.setValueAtTime(4, startTime);
        source.connect(sourceGain);
        sourceGain.connect(this.compressor);
      } else {
        source.connect(this.compressor);
      }

      sourceDuration = soundName === 'howl'
        ? Math.min(availableDuration, 4 * playbackRate)
        : maxDuration > 0
          ? Math.min(availableDuration, maxDuration * playbackRate)
          : availableDuration;
      duration = sourceDuration / playbackRate;
      const sourceStart = startTime + index * (duration + repeatGap);

      if (soundName === 'howl') {
        this.activeHowlSource = source;
      }

      if (soundName === 'howl' || maxDuration > 0) {
        source.start(sourceStart, bufferOffset, sourceDuration);
      } else {
        source.start(sourceStart, bufferOffset);
      }
    }

    const totalDuration = duration * repetitions + repeatGap * (repetitions - 1);
    this.notifyStart(soundName, category, totalDuration);
    return totalDuration;
  }

  notifyStart(name, category, duration) {
    if (this.playbackEndTimer) clearTimeout(this.playbackEndTimer);
    const playbackId = this.playbackId;
    this.currentSoundName = name;
    if (this.onSoundStart) {
      this.onSoundStart(name, category, { duration, pitch: this.pitchMultiplier });
    }
    this.playbackEndTimer = setTimeout(() => {
      if (playbackId !== this.playbackId) return;
      this.playbackEndTimer = null;
      this.currentSoundName = null;
      if (this.onSoundEnd) this.onSoundEnd(name);
    }, duration * 1000);
  }

  // -------------------------------------------------------------------------
  // Core Dog Bark Sounds (Real Recordings)
  // -------------------------------------------------------------------------
  playClassicBark() {
    return this.playRealBark('single', 'classic_bark');
  }

  playDoubleBark() {
    return this.playRealBark('double', 'double_bark');
  }

  playPuppyYip() {
    return this.playRealBark('puppy', 'puppy_yip');
  }

  playCuriousBoof() {
    return this.playRealBark('boof', 'curious_boof');
  }

  playDeepWoof() {
    return this.playRealBark('woof', 'deep_woof');
  }

  playAlertBark() {
    return this.playRealBark('alert', 'alert_bark');
  }

  playBreedBark(soundKey, startOffset = 0) {
    return this.playRealBark(soundKey, 'breed_bark', 'bark', 1, 0.16, 4, startOffset);
  }

  // -------------------------------------------------------------------------
  // Bonus Dog Attention Sounds (Squeaker & Sing-Along Howl)
  // -------------------------------------------------------------------------

  async playSqueakPattern(soundName, notes) {
    const playbackId = this.playbackId;
    await this.initContext();
    if (playbackId !== this.playbackId) return;
    const now = this.ctx.currentTime;
    let totalDuration = 0;

    for (const note of notes) {
      const start = now + note.delay;
      const duration = note.duration;
      const baseFrequency = note.frequency * this.pitchMultiplier;
      const attack = Math.min(0.018, duration * 0.2);
      const carrier = this.ctx.createOscillator();
      const modulator = this.ctx.createOscillator();
      this.trackSource(carrier);
      this.trackSource(modulator);
      const modGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      const envelope = this.ctx.createGain();

      carrier.type = note.waveform || 'sine';
      modulator.type = 'triangle';
      modulator.frequency.setValueAtTime(baseFrequency * (note.modRate || 1.5), start);
      modGain.gain.setValueAtTime(baseFrequency * (note.modDepth || 0.4), start);
      modGain.gain.exponentialRampToValueAtTime(baseFrequency * 0.05, start + duration);

      modulator.connect(modGain);
      modGain.connect(carrier.frequency);

      carrier.frequency.setValueAtTime(baseFrequency * 0.85, start);
      carrier.frequency.exponentialRampToValueAtTime(baseFrequency * (note.peak || 1.25), start + Math.min(0.06, duration * 0.25));
      carrier.frequency.exponentialRampToValueAtTime(baseFrequency * 0.95, start + duration);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(baseFrequency * 1.1, start);
      filter.Q.setValueAtTime(note.filterQ || 5, start);

      envelope.gain.setValueAtTime(0.001, start);
      envelope.gain.linearRampToValueAtTime(note.volume || 0.9, start + attack);
      envelope.gain.exponentialRampToValueAtTime(0.001, start + duration);

      carrier.connect(filter);
      filter.connect(envelope);
      envelope.connect(this.compressor);

      modulator.start(start);
      carrier.start(start);
      modulator.stop(start + duration);
      carrier.stop(start + duration);
      totalDuration = Math.max(totalDuration, note.delay + duration);
    }

    this.notifyStart(soundName, 'squeak', totalDuration);
    return totalDuration;
  }

  playSqueak() {
    return this.playRealBark('classic_squeak', 'squeak', 'squeak');
  }

  playDoubleSqueak() {
    return this.playRealBark('double_squeak', 'double_squeak', 'squeak', 2, 0.12);
  }

  playSqueakBurst() {
    return this.playRealBark('squeak_burst', 'squeak_burst', 'squeak');
  }

  playRubberDuck() {
    return this.playRealBark('rubber_duck', 'rubber_duck', 'squeak');
  }

  playWheezySqueak() {
    return this.playSqueakPattern('wheezy_squeak', [
      { delay: 0, duration: 0.55, frequency: 1700, waveform: 'sawtooth', modRate: 2.2, modDepth: 0.25, peak: 1.18, filterQ: 2 }
    ]);
  }

  /** Plays a recorded dog howl with the other real canine audio. */
  playHowl() {
    return this.playRealBark('howl', 'howl', 'howl');
  }
}

window.CockapooAudio = new CockapooAudioEngine();
