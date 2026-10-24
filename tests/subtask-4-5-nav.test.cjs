const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Subtask 4.5: web/index.html phải có card/nút chọn phân đoạn Sau Cơn Mưa', () => {
  const indexHtml = fs.readFileSync(path.resolve(__dirname, '../web/index.html'), 'utf8');
  assert.ok(indexHtml.includes('sau-con-mua.html'), 'web/index.html chưa có link tới sau-con-mua.html');
  assert.ok(indexHtml.includes('Sau Cơn Mưa'), 'Thiếu tên hiển thị Sau Cơn Mưa trên trang chủ');
});
