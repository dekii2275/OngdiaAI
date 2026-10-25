(function (root, factory) {
  'use strict';
  const instance = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = instance;
  }
  if (typeof root !== 'undefined') {
    root.VoiceTTS = instance;
  }
}(typeof self !== 'undefined' ? self : (typeof window !== 'undefined' ? window : this), function () {
  'use strict';

  const VOICE_PROFILES = Object.freeze({
    thao: Object.freeze({
      id: 'thao',
      name: 'Cô giáo Thảo',
      description: 'ấm áp, điềm tĩnh',
      rate: 0.95,
      pitch: 1.05
    }),
    manh: Object.freeze({
      id: 'manh',
      name: 'Bác Mạnh cựu chiến binh',
      description: 'trầm ấm, dứt khoát',
      rate: 0.9,
      pitch: 0.8
    }),
    minh_anh: Object.freeze({
      id: 'minh_anh',
      name: 'Trưởng làng Minh Anh',
      description: 'nghiêm trang, rành rọt',
      rate: 0.95,
      pitch: 0.9
    }),
    minh: Object.freeze({
      id: 'minh',
      name: 'Bạn Minh',
      description: 'hơi hoảng sợ, nhanh hơn chút',
      rate: 1.05,
      pitch: 1.2
    }),
    duyen: Object.freeze({
      id: 'duyen',
      name: 'Bạn Duyên',
      description: 'nhỏ nhẹ, lo lắng',
      rate: 1.0,
      pitch: 1.3
    }),
    ban: Object.freeze({
      id: 'ban',
      name: 'Nhân vật người chơi',
      description: 'tự tin, rõ ràng',
      rate: 1.0,
      pitch: 1.0
    })
  });

  let _enabled = true;
  let _cachedVoice = null;

  function _getSpeechSynthesis() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      return window.speechSynthesis;
    }
    if (typeof global !== 'undefined' && global.window && global.window.speechSynthesis) {
      return global.window.speechSynthesis;
    }
    return null;
  }

  function _getSpeechSynthesisUtteranceClass() {
    if (typeof window !== 'undefined' && window.SpeechSynthesisUtterance) {
      return window.SpeechSynthesisUtterance;
    }
    if (typeof global !== 'undefined' && global.window && global.window.SpeechSynthesisUtterance) {
      return global.window.SpeechSynthesisUtterance;
    }
    return null;
  }

  function _initVoice() {
    const synth = _getSpeechSynthesis();
    if (!synth || typeof synth.getVoices !== 'function') return null;
    try {
      const voices = synth.getVoices() || [];
      _cachedVoice = voices.find(v => v.lang && (v.lang.toLowerCase().includes('vi') || v.lang.startsWith('vi-'))) || null;
      return _cachedVoice;
    } catch (_) {
      return null;
    }
  }

  // Setup listener if available
  const initialSynth = _getSpeechSynthesis();
  if (initialSynth && typeof initialSynth === 'object') {
    _initVoice();
    if ('onvoiceschanged' in initialSynth) {
      initialSynth.onvoiceschanged = () => {
        _initVoice();
      };
    }
  }

  const VoiceTTS = {
    VOICE_PROFILES,

    isEnabled() {
      return _enabled;
    },

    toggle(forceState) {
      if (typeof forceState === 'boolean') {
        _enabled = forceState;
      } else {
        _enabled = !_enabled;
      }
      if (!_enabled) {
        this.stop();
      }
      return _enabled;
    },

    stop() {
      const synth = _getSpeechSynthesis();
      if (!synth || typeof synth.cancel !== 'function') return;
      try {
        synth.cancel();
      } catch (_) {}
    },

    getVoice() {
      if (!_cachedVoice) {
        _initVoice();
      }
      return _cachedVoice;
    },

    speak(speaker, text) {
      if (!_enabled || !text || typeof text !== 'string') return false;

      const synth = _getSpeechSynthesis();
      const UtteranceClass = _getSpeechSynthesisUtteranceClass();
      if (!synth || !UtteranceClass || typeof synth.speak !== 'function') {
        return false;
      }

      try {
        this.stop();

        const profile = VOICE_PROFILES[speaker] || VOICE_PROFILES.ban || { rate: 1.0, pitch: 1.0 };
        const utter = new UtteranceClass(text);
        utter.lang = 'vi-VN';

        const voice = this.getVoice();
        if (voice) {
          utter.voice = voice;
        }

        utter.rate = typeof profile.rate === 'number' ? profile.rate : 1.0;
        utter.pitch = typeof profile.pitch === 'number' ? profile.pitch : 1.0;

        synth.speak(utter);
        return true;
      } catch (_) {
        return false;
      }
    }
  };

  return VoiceTTS;
}));
