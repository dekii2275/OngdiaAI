const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Subtask 4.2: UI phải có hộp thoại, nút trợ giúp cô giáo và container lựa chọn kích thước lớn', () => {
  const html = fs.readFileSync(path.resolve(__dirname, '../web/sau-con-mua.html'), 'utf8');
  assert.ok(html.includes('id="dialogue-box"'), 'Thiếu dialogue-box');
  assert.ok(html.includes('id="btn-teacher-help"'), 'Thiếu nút Cô ơi giúp em');
  assert.ok(html.includes('id="btn-repeat-speech"'), 'Thiếu nút Đọc lại lời thoại');
  assert.ok(html.includes('id="choice-buttons"'), 'Thiếu container choice-buttons');

  const css = fs.readFileSync(path.resolve(__dirname, '../web/sau-con-mua.css'), 'utf8');
  assert.ok(css.includes('min-height: 48px') || css.includes('min-height: 52px'), 'Nút lựa chọn phải có min-height >= 48px');
});
