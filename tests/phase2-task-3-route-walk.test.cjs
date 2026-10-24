const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Phase 2 Task 3: HTML phải có route-canvas để vẽ tuyến đường sơ tán và roadblock marker', () => {
  const html = fs.readFileSync(path.resolve(__dirname, '../web/sau-con-mua.html'), 'utf8');
  assert.ok(html.includes('id="route-canvas"'), 'Thiếu route-canvas');
  assert.ok(html.includes('id="roadblock-marker"'), 'Thiếu roadblock-marker');
});

test('Phase 2 Task 3: sau-con-mua-ui.js phải có hàm animatePartyRoute và xử lý anchor waypoints', () => {
  const js = fs.readFileSync(path.resolve(__dirname, '../web/js/sau-con-mua-ui.js'), 'utf8');
  assert.ok(js.includes('animatePartyRoute'), 'Thiếu hàm animatePartyRoute');
  assert.ok(js.includes('drawRoutePath'), 'Thiếu hàm drawRoutePath');
});
