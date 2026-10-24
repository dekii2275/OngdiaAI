const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Phase 2 Task 2: 9 file chân dung biểu cảm nhân vật phải tồn tại và có kích thước hợp lệ', () => {
  const portraits = [
    'an_neutral.png', 'an_worried.png', 'an_relieved.png',
    'minh_neutral.png', 'minh_worried.png', 'minh_relieved.png',
    'teacher_neutral.png', 'teacher_encouraging.png', 'teacher_serious.png'
  ];
  for (const p of portraits) {
    const fullPath = path.resolve(__dirname, '../web/assets/sau-con-mua/portraits', p);
    assert.ok(fs.existsSync(fullPath), `Thiếu file chân dung: ${p}`);
    const stat = fs.statSync(fullPath);
    assert.ok(stat.size > 2000, `File ${p} quá nhỏ (${stat.size} bytes)`);
  }
});

test('Phase 2 Task 2: HTML phải có phần tử avatar trong hộp thoại #dialogue-box', () => {
  const html = fs.readFileSync(path.resolve(__dirname, '../web/sau-con-mua.html'), 'utf8');
  assert.ok(html.includes('id="speaker-avatar"'), 'Thiếu id="speaker-avatar" trong dialogue box');
});
