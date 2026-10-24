(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.VietnameseSpeechEngine = factory().VietnameseSpeechEngine;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  class VietnameseSpeechEngine {
    constructor() {
      this.hasSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window;
      this.cachedVoice = null;
      this.enabled = true;

      if (this.hasSpeech) {
        this._initVoice();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = () => this._initVoice();
        }
      }
    }

    _initVoice() {
      if (!this.hasSpeech) return;
      try {
        const voices = window.speechSynthesis.getVoices() || [];
        this.cachedVoice = voices.find(v => v.lang && (v.lang.toLowerCase().includes('vi') || v.lang.startsWith('vi-'))) || null;
      } catch (_) {}
    }

    isAvailable() {
      return this.hasSpeech;
    }

    getVoice() {
      if (!this.cachedVoice && this.hasSpeech) {
        this._initVoice();
      }
      return this.cachedVoice;
    }

    speak(text, options = {}) {
      if (!this.enabled || !this.hasSpeech || !text) return false;
      try {
        this.stop();
        const utter = new window.SpeechSynthesisUtterance(text);
        utter.lang = 'vi-VN';
        const v = this.getVoice();
        if (v) utter.voice = v;
        utter.rate = options.rate || 0.95; // Slight slower pace for children
        utter.pitch = options.pitch || 1.05; // Slightly warmer/friendly pitch
        window.speechSynthesis.speak(utter);
        return true;
      } catch (_) {
        return false;
      }
    }

    stop() {
      if (!this.hasSpeech) return;
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }

    toggle(bool) {
      if (typeof bool === 'boolean') {
        this.enabled = bool;
      } else {
        this.enabled = !this.enabled;
      }
      if (!this.enabled) this.stop();
      return this.enabled;
    }
  }

  return { VietnameseSpeechEngine };
}));
