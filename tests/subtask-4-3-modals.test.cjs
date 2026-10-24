const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Subtask 4.3: HTML phải có modal S2_HELP và modal Chat Minh với giới hạn 160 ký tự', () => {
  const html = fs.readFileSync(path.resolve(__dirname, '../web/sau-con-mua.html'), 'utf8');
  assert.ok(html.includes('id="help-modal"'), 'Thiếu help-modal');
  assert.ok(html.includes('id="help-pictures"'), 'Thiếu lưới chọn tranh help-pictures');
  assert.ok(html.includes('id="minh-chat-modal"'), 'Thiếu minh-chat-modal');
  assert.ok(html.includes('maxlength="160"'), 'Ô nhập chat với Minh phải có maxlength=160');
  assert.ok(html.includes('id="btn-skip-chat"'), 'Thiếu nút Đi cùng cô ngay để bỏ qua chat');
});
