(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ProceduralStormAmbient = factory().ProceduralStormAmbient;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  class ProceduralStormAmbient {
    constructor() {
      this.ctx = null;
      this.rainGain = null;
      this.rainSource = null;
      this.isPlaying = false;
      this.enabled = true;
      this.volume = 0.15; // Gentle ambient rain
    }

    _initContext() {
      if (this.ctx) return true;
      const AudioContext = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
      if (!AudioContext) return false;
      try {
        this.ctx = new AudioContext();
        return true;
      } catch (_) {
        return false;
      }
    }

    _createRainBuffer() {
      if (!this.ctx) return null;
      const bufferSize = this.ctx.sampleRate * 2; // 2 seconds loop
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate soft pink/white noise
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.95 * b1 + white * 0.1;
        b2 = 0.85 * b2 + white * 0.2;
        data[i] = (b0 + b1 + b2) * 0.4;
      }
      return buffer;
    }

    start() {
      if (!this.enabled || this.isPlaying) return false;
      if (!this._initContext()) return false;

      try {
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }

        const rainBuffer = this._createRainBuffer();
        if (!rainBuffer) return false;

        this.rainSource = this.ctx.createBufferSource();
        this.rainSource.buffer = rainBuffer;
        this.rainSource.loop = true;

        // Bandpass filter to sculpt rain character (~800Hz)
        const bandpass = this.ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(800, this.ctx.currentTime);
        bandpass.Q.setValueAtTime(1.0, this.ctx.currentTime);

        // Lowpass filter to smooth harsh highs
        const lowpass = this.ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(2200, this.ctx.currentTime);

        this.rainGain = this.ctx.createGain();
        this.rainGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

        this.rainSource.connect(bandpass);
        bandpass.connect(lowpass);
        lowpass.connect(this.rainGain);
        this.rainGain.connect(this.ctx.destination);

        this.rainSource.start();
        this.isPlaying = true;
        return true;
      } catch (_) {
        return false;
      }
    }

    stop() {
      if (!this.isPlaying) return;
      try {
        if (this.rainSource) {
          this.rainSource.stop();
          this.rainSource.disconnect();
          this.rainSource = null;
        }
        this.isPlaying = false;
      } catch (_) {}
    }

    setVolume(v) {
      this.volume = Math.max(0, Math.min(1, Number(v) || 0));
      if (this.rainGain && this.ctx) {
        this.rainGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      }
    }

    toggle(bool) {
      if (typeof bool === 'boolean') {
        this.enabled = bool;
      } else {
        this.enabled = !this.enabled;
      }

      if (this.enabled) {
        this.start();
      } else {
        this.stop();
      }
      return this.enabled;
    }
  }

  return { ProceduralStormAmbient };
}));
