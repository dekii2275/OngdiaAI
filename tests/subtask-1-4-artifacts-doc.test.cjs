const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Subtask 1.4: Docs/sau-con-mua-art-artifacts.md phải ghi chép đủ thông số tái sử dụng', () => {
  const docPath = path.resolve(__dirname, '../Docs/sau-con-mua-art-artifacts.md');
  assert.ok(fs.existsSync(docPath), 'LỖI: Chưa có file Docs/sau-con-mua-art-artifacts.md');
  const content = fs.readFileSync(docPath, 'utf8');

  assert.ok(content.includes('bg_school.webp'), 'Thiếu ghi chú bg_school');
  assert.ok(content.includes('an.png'), 'Thiếu ghi chú an.png');
  assert.ok(content.includes('#F6F0DF'), 'Thiếu bảng màu chuẩn');
  assert.ok(content.includes('Tọa độ anchor'), 'Thiếu bảng tọa độ anchor chuẩn');
});
