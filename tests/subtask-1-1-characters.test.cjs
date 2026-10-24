const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Subtask 1.1: 3 file nhân vật (an, minh, teacher) phải tồn tại và có dung lượng hợp lệ', () => {
  const chars = ['an.png', 'minh.png', 'teacher.png'];
  for (const c of chars) {
    const fullPath = path.resolve(__dirname, '../web/assets/sau-con-mua/characters', c);
    assert.ok(fs.existsSync(fullPath), `LỖI: Chưa có file nhân vật: ${c}`);
    const stat = fs.statSync(fullPath);
    assert.ok(stat.size > 5000, `LỖI: File ${c} quá nhỏ (${stat.size} bytes), có thể bị lỗi`);
  }
});
