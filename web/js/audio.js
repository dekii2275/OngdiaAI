window.SceneAudio = class {
  constructor() { this.ctx = null; this.enabled = true; }
  async start() {
    try {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.master = this.ctx.createGain(); this.master.gain.value = this.enabled ? .55 : 0; this.master.connect(this.ctx.destination);
        const length = this.ctx.sampleRate * 3;
        this.noise = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
        const samples = this.noise.getChannelData(0);
        for (let i = 0; i < length; i++) samples[i] = Math.random() * 2 - 1;
        const rain = this.ctx.createBufferSource(); rain.buffer = this.noise; rain.loop = true;
        const filter = this.ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 2800;
        this.rainGain = this.ctx.createGain(); this.rainGain.gain.value = .11;
        rain.connect(filter); filter.connect(this.rainGain); this.rainGain.connect(this.master); rain.start();
        this.musicGain = this.ctx.createGain(); this.musicGain.gain.value = .025; this.musicGain.connect(this.master);
        for (const frequency of [110, 164.81, 220.5]) { const oscillator = this.ctx.createOscillator(); oscillator.type = 'sine'; oscillator.frequency.value = frequency; oscillator.connect(this.musicGain); oscillator.start(); }
      }
      await this.ctx.resume();
    } catch { /* Browsers without audio still have the complete playable story. */ }
  }
  setEnabled(value) { this.enabled = value; if (this.ctx) this.master.gain.setTargetAtTime(value ? .55 : 0, this.ctx.currentTime, .1); }
  ambience(safeTime, elapsed, phase) {
    if (!this.ctx) return;
    // Rain evolves independently of wrong answers; SafeTime describes time spent at the lock.
    this.rainGain.gain.setTargetAtTime(.11 + Math.min(elapsed / 1200, .06), this.ctx.currentTime, 2);
    this.musicGain.gain.setTargetAtTime(phase === 'intro' ? 0 : .025 + (3 - safeTime) * .006, this.ctx.currentTime, 1);
  }
  tone(frequency, duration = .13, delay = 0, gain = .12) {
    if (!this.ctx || !this.enabled) return;
    const time = this.ctx.currentTime + delay, oscillator = this.ctx.createOscillator(), volume = this.ctx.createGain();
    oscillator.frequency.value = frequency; oscillator.type = 'sine'; volume.gain.setValueAtTime(.001, time); volume.gain.exponentialRampToValueAtTime(gain, time + .015); volume.gain.exponentialRampToValueAtTime(.001, time + duration);
    oscillator.connect(volume); volume.connect(this.master); oscillator.start(time); oscillator.stop(time + duration + .02);
  }
  noiseBurst(type) {
    if (!this.ctx || !this.enabled) return;
    const time = this.ctx.currentTime, source = this.ctx.createBufferSource(), filter = this.ctx.createBiquadFilter(), gain = this.ctx.createGain();
    source.buffer = this.noise; filter.type = type === 'thunder' ? 'lowpass' : 'bandpass'; filter.frequency.value = type === 'thunder' ? 220 : 1900;
    gain.gain.setValueAtTime(type === 'thunder' ? .55 : .07, time); gain.gain.exponentialRampToValueAtTime(.001, time + (type === 'thunder' ? 1.7 : .28));
    source.connect(filter); filter.connect(gain); gain.connect(this.master); source.start(); source.stop(time + (type === 'thunder' ? 2 : .3));
  }
  play(type) {
    if (type === 'click') this.tone(520, .055, 0, .065);
    if (type === 'wrong') { this.tone(190); this.tone(145, .18, .19); }
    if (type === 'unlock') { this.tone(440); this.tone(660, .2, .15); }
    if (type === 'alarm') { for (let i = 0; i < 4; i++) this.tone(i % 2 ? 630 : 440, .24, i * .26, .1); }
    if (type === 'radio' || type === 'thunder') this.noiseBurst(type);
  }
};
