const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Subtask 4.1: sau-con-mua.html và css phải có cấu trúc canvas 16:9 và 3 layer hiển thị', () => {
  const htmlPath = path.resolve(__dirname, '../web/sau-con-mua.html');
  const cssPath = path.resolve(__dirname, '../web/sau-con-mua.css');

  assert.ok(fs.existsSync(htmlPath), 'Thiếu file web/sau-con-mua.html');
  assert.ok(fs.existsSync(cssPath), 'Thiếu file web/sau-con-mua.css');

  const html = fs.readFileSync(htmlPath, 'utf8');
  assert.ok(html.includes('id="stage-viewport"'), 'Thiếu stage-viewport');
  assert.ok(html.includes('id="background-layer"'), 'Thiếu background-layer');
  assert.ok(html.includes('id="characters-layer"'), 'Thiếu characters-layer');
  assert.ok(html.includes('id="hotspots-layer"'), 'Thiếu hotspots-layer');

  const css = fs.readFileSync(cssPath, 'utf8');
  assert.ok(css.includes('aspect-ratio: 16 / 9') || css.includes('aspect-ratio: 16/9') || css.includes('56.25%'), 'CSS phải giữ tỷ lệ 16:9');
});
