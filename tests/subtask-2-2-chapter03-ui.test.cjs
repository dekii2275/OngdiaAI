const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Subtask 2.2: web/chapter03.html tồn tại và chứa cấu trúc chuẩn 2D của game', () => {
  const htmlPath = path.resolve(__dirname, '../web/chapter03.html');
  assert.ok(fs.existsSync(htmlPath), 'web/chapter03.html phải tồn tại');
  const html = fs.readFileSync(htmlPath, 'utf8');

  assert.ok(html.includes('chapter03.css'), 'Phải link chapter03.css');
  assert.ok(html.includes('radio-ai.css'), 'Phải link radio-ai.css');
  assert.ok(html.includes('radio-ai.js'), 'Phải nạp radio-ai.js');
  assert.ok(html.includes('chapter03-data.js'), 'Phải nạp chapter03-data.js');
  assert.ok(html.includes('chapter03-puzzles.js'), 'Phải nạp chapter03-puzzles.js');
  assert.ok(html.includes('chapter03.js'), 'Phải nạp chapter03.js');

  assert.ok(html.includes('id="stage"'), 'Phải có #stage');
  assert.ok(html.includes('id="party"'), 'Phải có #party');
  assert.ok(html.includes('id="player"'), 'Phải có #player');
  assert.ok(html.includes('id="dialogue"'), 'Phải có #dialogue');
  assert.ok(html.includes('id="btn-radio"') || html.includes('hud-radio-btn'), 'Phải có nút bộ đàm AI trên HUD');
});

test('Subtask 2.2: Thư mục web/assets/chapter03/ chứa đủ 4 ảnh nền cảnh', () => {
  const dir = path.resolve(__dirname, '../web/assets/chapter03');
  assert.ok(fs.existsSync(dir), 'Thư mục web/assets/chapter03 phải tồn tại');
  const files = ['ridge_entry.webp', 'crack_zone.webp', 'mudflow_bend.webp', 'boulder_pass.webp'];
  for (const f of files) {
    const p = path.join(dir, f);
    assert.ok(fs.existsSync(p), `Thiếu ảnh nền ${f}`);
    const stat = fs.statSync(p);
    assert.ok(stat.size > 1000, `Ảnh nền ${f} quá nhỏ (${stat.size} bytes)`);
  }
});
