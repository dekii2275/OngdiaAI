// tests/task-1-voice-tts.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Task 1: File web/js/voice-tts.js phải tồn tại và xuất cấu hình phân vai 6 nhân vật', () => {
  const filePath = path.resolve(__dirname, '../web/js/voice-tts.js');
  assert.ok(fs.existsSync(filePath), 'Thiếu web/js/voice-tts.js');
  const content = fs.readFileSync(filePath, 'utf8');
  assert.ok(content.includes('VOICE_PROFILES'), 'Thiếu VOICE_PROFILES');
  assert.ok(content.includes('thao'), 'Thiếu profile thao');
  assert.ok(content.includes('manh'), 'Thiếu profile manh');
  assert.ok(content.includes('minh_anh'), 'Thiếu profile minh_anh');
  assert.ok(content.includes('minh'), 'Thiếu profile minh');
  assert.ok(content.includes('duyen'), 'Thiếu profile duyen');
  assert.ok(content.includes('ban'), 'Thiếu profile ban');
});

test('Task 1: VoiceTTS cung cấp đầy đủ các phương thức điều khiển', () => {
  const VoiceTTS = require('../web/js/voice-tts.js');
  assert.equal(typeof VoiceTTS.speak, 'function');
  assert.equal(typeof VoiceTTS.stop, 'function');
  assert.equal(typeof VoiceTTS.toggle, 'function');
  assert.equal(typeof VoiceTTS.isEnabled, 'function');
});

test('Task 1: VoiceTTS.VOICE_PROFILES cấu hình chính xác rate và pitch cho 6 nhân vật', () => {
  const VoiceTTS = require('../web/js/voice-tts.js');
  const profiles = VoiceTTS.VOICE_PROFILES;
  assert.ok(profiles, 'VoiceTTS.VOICE_PROFILES phải tồn tại');

  // Thao: rate 0.95, pitch 1.05
  assert.equal(profiles.thao.rate, 0.95);
  assert.equal(profiles.thao.pitch, 1.05);

  // Manh: rate 0.9, pitch 0.8
  assert.equal(profiles.manh.rate, 0.9);
  assert.equal(profiles.manh.pitch, 0.8);

  // Minh Anh: rate 0.95, pitch 0.9
  assert.equal(profiles.minh_anh.rate, 0.95);
  assert.equal(profiles.minh_anh.pitch, 0.9);

  // Minh: rate 1.05, pitch 1.2
  assert.equal(profiles.minh.rate, 1.05);
  assert.equal(profiles.minh.pitch, 1.2);

  // Duyen: rate 1.0, pitch 1.3
  assert.equal(profiles.duyen.rate, 1.0);
  assert.equal(profiles.duyen.pitch, 1.3);

  // Ban: rate 1.0, pitch 1.0
  assert.equal(profiles.ban.rate, 1.0);
  assert.equal(profiles.ban.pitch, 1.0);
});

test('Task 1: VoiceTTS toggle và isEnabled quản lý trạng thái bật/tắt đúng logic', () => {
  const VoiceTTS = require('../web/js/voice-tts.js');
  // Reset enabled
  VoiceTTS.toggle(true);
  assert.equal(VoiceTTS.isEnabled(), true);

  const toggledOff = VoiceTTS.toggle();
  assert.equal(toggledOff, false);
  assert.equal(VoiceTTS.isEnabled(), false);

  const toggledOn = VoiceTTS.toggle();
  assert.equal(toggledOn, true);
  assert.equal(VoiceTTS.isEnabled(), true);

  VoiceTTS.toggle(false);
  assert.equal(VoiceTTS.isEnabled(), false);

  VoiceTTS.toggle(true);
  assert.equal(VoiceTTS.isEnabled(), true);
});

test('Task 1: VoiceTTS hoạt động an toàn trong Node.js (không crash khi thiếu window.speechSynthesis)', () => {
  const VoiceTTS = require('../web/js/voice-tts.js');
  VoiceTTS.toggle(true);
  assert.doesNotThrow(() => {
    VoiceTTS.stop();
  });
  const result = VoiceTTS.speak('thao', 'Chào các em!');
  // In Node environment without window.speechSynthesis, returns false safely
  assert.equal(typeof result, 'boolean');
});

test('Task 1: VoiceTTS phát âm chuẩn với mock window.speechSynthesis', () => {
  let spokenUtterance = null;
  let cancelCalled = false;

  global.window = {
    speechSynthesis: {
      speak: (utter) => { spokenUtterance = utter; },
      cancel: () => { cancelCalled = true; },
      getVoices: () => [
        { lang: 'vi-VN', name: 'Vietnamese Voice' },
        { lang: 'en-US', name: 'English Voice' }
      ]
    },
    SpeechSynthesisUtterance: class MockUtterance {
      constructor(text) {
        this.text = text;
        this.lang = '';
        this.voice = null;
        this.rate = 1;
        this.pitch = 1;
      }
    }
  };

  // Re-require to pick up mock window
  delete require.cache[require.resolve('../web/js/voice-tts.js')];
  const VoiceTTS = require('../web/js/voice-tts.js');

  VoiceTTS.toggle(true);
  const ok = VoiceTTS.speak('manh', 'Bác Mạnh chỉ huy!');
  assert.equal(ok, true);
  assert.equal(cancelCalled, true);
  assert.ok(spokenUtterance);
  assert.equal(spokenUtterance.text, 'Bác Mạnh chỉ huy!');
  assert.equal(spokenUtterance.rate, 0.9);
  assert.equal(spokenUtterance.pitch, 0.8);
  assert.equal(spokenUtterance.voice.lang, 'vi-VN');

  // Test speaker fallback
  spokenUtterance = null;
  VoiceTTS.speak('unknown_speaker', 'Lời thoại chung');
  assert.ok(spokenUtterance);
  assert.equal(spokenUtterance.rate, 1.0); // fallback to ban / default
  assert.equal(spokenUtterance.pitch, 1.0);

  // Clean up global mock
  delete global.window;
  delete require.cache[require.resolve('../web/js/voice-tts.js')];
});
