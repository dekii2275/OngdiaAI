const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Subtask 4.4: HTML phải có màn hình ôn tập S5 và 3 thẻ thành tích định tính', () => {
  const html = fs.readFileSync(path.resolve(__dirname, '../web/sau-con-mua.html'), 'utf8');
  assert.ok(html.includes('id="recap-container"'), 'Thiếu recap-container');
  assert.ok(html.includes('id="recap-quiz"'), 'Thiếu recap-quiz');
  assert.ok(html.includes('id="cards-result"'), 'Thiếu cards-result');
  assert.ok(html.includes('card-report'), 'Thiếu thẻ Báo người lớn');
  assert.ok(html.includes('card-safety'), 'Thiếu thẻ Ưu tiên an toàn');
  assert.ok(html.includes('card-group'), 'Thiếu thẻ Đi cùng nhóm');
});
