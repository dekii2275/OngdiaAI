const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Subtask 1.2: 3 file background plates (bg_school, bg_route, bg_assembly) phải tồn tại và hợp lệ', () => {
  const bgs = ['bg_school.webp', 'bg_route.webp', 'bg_assembly.webp'];
  for (const b of bgs) {
    const fullPath = path.resolve(__dirname, '../web/assets/sau-con-mua/backgrounds', b);
    assert.ok(fs.existsSync(fullPath), `LỖI: Chưa có file background: ${b}`);
    const stat = fs.statSync(fullPath);
    assert.ok(stat.size > 10000, `LỖI: File ${b} quá nhỏ (${stat.size} bytes)`);
  }
});
