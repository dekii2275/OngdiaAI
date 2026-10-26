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

test('Task 1 / F-01: VoiceTTS.speak chuẩn hóa tên nhân vật chính xác (Cô Thảo, Bác Mạnh, Trưởng làng Minh Anh, Minh, Duyên, Bạn)', () => {
  let spokenUtterance = null;
  global.window = {
    speechSynthesis: {
      speak: (utter) => { spokenUtterance = utter; },
      cancel: () => {},
      getVoices: () => [{ lang: 'vi-VN', name: 'Vietnamese Voice' }]
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

  delete require.cache[require.resolve('../web/js/voice-tts.js')];
  const VoiceTTS = require('../web/js/voice-tts.js');
  VoiceTTS.toggle(true);

  // 'Cô Thảo' -> thao profile (rate 0.95, pitch 1.05)
  spokenUtterance = null;
  VoiceTTS.speak('Cô Thảo', 'Chào các em');
  assert.ok(spokenUtterance);
  assert.equal(spokenUtterance.rate, 0.95);
  assert.equal(spokenUtterance.pitch, 1.05);

  // 'Thảo' -> thao profile
  spokenUtterance = null;
  VoiceTTS.speak('Thảo', 'Chào các em');
  assert.ok(spokenUtterance);
  assert.equal(spokenUtterance.rate, 0.95);
  assert.equal(spokenUtterance.pitch, 1.05);

  // 'Bác Mạnh' -> manh profile (rate 0.9, pitch 0.8)
  spokenUtterance = null;
  VoiceTTS.speak('Bác Mạnh', 'Đứng yên');
  assert.ok(spokenUtterance);
  assert.equal(spokenUtterance.rate, 0.9);
  assert.equal(spokenUtterance.pitch, 0.8);

  // 'Mạnh' -> manh profile
  spokenUtterance = null;
  VoiceTTS.speak('Mạnh', 'Đứng yên');
  assert.ok(spokenUtterance);
  assert.equal(spokenUtterance.rate, 0.9);
  assert.equal(spokenUtterance.pitch, 0.8);

  // 'Trưởng làng Minh Anh' -> minh_anh profile (rate 0.95, pitch 0.9)
  spokenUtterance = null;
  VoiceTTS.speak('Trưởng làng Minh Anh', 'Bà con bình tĩnh');
  assert.ok(spokenUtterance);
  assert.equal(spokenUtterance.rate, 0.95);
  assert.equal(spokenUtterance.pitch, 0.9);

  // 'Minh Anh' -> minh_anh profile
  spokenUtterance = null;
  VoiceTTS.speak('Minh Anh', 'Bà con bình tĩnh');
  assert.ok(spokenUtterance);
  assert.equal(spokenUtterance.rate, 0.95);
  assert.equal(spokenUtterance.pitch, 0.9);

  // 'Bạn Minh' -> minh profile (rate 1.05, pitch 1.2)
  spokenUtterance = null;
  VoiceTTS.speak('Bạn Minh', 'Em sợ quá');
  assert.ok(spokenUtterance);
  assert.equal(spokenUtterance.rate, 1.05);
  assert.equal(spokenUtterance.pitch, 1.2);

  // 'Minh' -> minh profile
  spokenUtterance = null;
  VoiceTTS.speak('Minh', 'Em sợ quá');
  assert.ok(spokenUtterance);
  assert.equal(spokenUtterance.rate, 1.05);
  assert.equal(spokenUtterance.pitch, 1.2);

  // 'Bạn Duyên' -> duyen profile (rate 1.0, pitch 1.3)
  spokenUtterance = null;
  VoiceTTS.speak('Bạn Duyên', 'Nước đang dâng');
  assert.ok(spokenUtterance);
  assert.equal(spokenUtterance.rate, 1.0);
  assert.equal(spokenUtterance.pitch, 1.3);

  // 'Duyên' -> duyen profile
  spokenUtterance = null;
  VoiceTTS.speak('Duyên', 'Nước đang dâng');
  assert.ok(spokenUtterance);
  assert.equal(spokenUtterance.rate, 1.0);
  assert.equal(spokenUtterance.pitch, 1.3);

  // 'Bạn' -> ban profile (rate 1.0, pitch 1.0)
  spokenUtterance = null;
  VoiceTTS.speak('Bạn', 'Chúng ta cùng đi nào');
  assert.ok(spokenUtterance);
  assert.equal(spokenUtterance.rate, 1.0);
  assert.equal(spokenUtterance.pitch, 1.0);

  delete global.window;
  delete require.cache[require.resolve('../web/js/voice-tts.js')];
});

test('Task 1 / F-02: server.js kiểm tra giới hạn 1MB trên body accumulation và trả về 413 Payload Too Large', (t, done) => {
  const { EventEmitter } = require('node:events');
  const { handleJsonPost } = require('../server.js');

  const req = new EventEmitter();
  req.destroy = () => {};
  let statusCode = 0;
  let responseData = '';
  const res = {
    writeHead: (code) => { statusCode = code; },
    end: (data) => {
      responseData = data;
      assert.equal(statusCode, 413);
      assert.ok(responseData.includes('Payload Too Large'));
      done();
    }
  };

  handleJsonPost(req, res, () => {});
  // Send chunk exceeding 1MB (1024 * 1024 + 10 bytes)
  const bigChunk = 'a'.repeat(1024 * 1024 + 10);
  req.emit('data', bigChunk);
});

test('Task 1 / F-02: server.js chấp nhận request hợp lệ dưới 1MB', async () => {
  const { EventEmitter } = require('node:events');
  const { handleJsonPost } = require('../server.js');

  const req = new EventEmitter();
  let statusCode = 0;
  let responseData = '';
  const res = {
    writeHead: (code) => { statusCode = code; },
    end: (data) => { responseData = data; }
  };

  let processed = false;
  handleJsonPost(req, res, async (data) => {
    assert.equal(data.msg, 'hello');
    processed = true;
    return { ok: true };
  });

  req.emit('data', JSON.stringify({ msg: 'hello' }));
  req.emit('end');

  // Allow async microtask turn
  await new Promise(r => setTimeout(r, 20));
  assert.ok(processed);
  assert.equal(statusCode, 200);
  assert.ok(responseData.includes('"ok":true'));
});

test('Task 1 / F-02: server.js chứa cấu hình 1MB và xử lý mã lỗi 413 Payload Too Large', () => {
  const serverCode = fs.readFileSync(path.resolve(__dirname, '../server.js'), 'utf8');
  assert.ok(serverCode.includes('1024 * 1024'), 'server.js phải có biểu thức 1024 * 1024');
  assert.ok(serverCode.includes('413'), 'server.js phải trả mã trạng thái 413');
  assert.ok(serverCode.includes('Payload Too Large'), 'server.js phải có thông điệp Payload Too Large');
});
