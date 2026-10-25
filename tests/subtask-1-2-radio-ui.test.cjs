const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Subtask 1.2: File web/radio-ai.css tồn tại và chứa phong cách giao diện bộ đàm cứu hộ', () => {
  const cssPath = path.resolve(__dirname, '../web/radio-ai.css');
  assert.ok(fs.existsSync(cssPath), 'web/radio-ai.css phải tồn tại');
  const css = fs.readFileSync(cssPath, 'utf8');
  assert.ok(css.includes('.radio-modal'), 'CSS phải có .radio-modal');
  assert.ok(css.includes('.radio-chassis'), 'CSS phải có .radio-chassis');
  assert.ok(css.includes('.radio-led-online'), 'CSS phải có .radio-led-online');
  assert.ok(css.includes('.radio-channel-btn'), 'CSS phải có .radio-channel-btn');
});

test('Subtask 1.2: File web/js/radio-ai.js tồn tại và cung cấp module RadioAI', () => {
  const jsPath = path.resolve(__dirname, '../web/js/radio-ai.js');
  assert.ok(fs.existsSync(jsPath), 'web/js/radio-ai.js phải tồn tại');
  const js = fs.readFileSync(jsPath, 'utf8');
  assert.ok(js.includes('RadioAI'), 'Phải khai báo RadioAI');
  assert.ok(js.includes('toggleRadio'), 'Phải có hàm toggleRadio');
  assert.ok(js.includes('setChannel'), 'Phải có hàm setChannel');
  assert.ok(js.includes('sendMessage'), 'Phải có hàm sendMessage');
  assert.ok(js.includes('/api/radio/chat'), 'Phải gọi endpoint /api/radio/chat');
  assert.ok(js.includes("'KeyR'") || js.includes('"KeyR"') || js.includes("'r'") || js.includes('"r"'), 'Phải có phím tắt R để mở bộ đàm');
});
