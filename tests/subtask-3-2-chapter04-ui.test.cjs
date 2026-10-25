const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Subtask 3.2: web/chapter04.html tồn tại và chứa cấu trúc chuẩn 2D với bạn Minh', () => {
  const htmlPath = path.resolve(__dirname, '../web/chapter04.html');
  assert.ok(fs.existsSync(htmlPath), 'web/chapter04.html phải tồn tại');
  const html = fs.readFileSync(htmlPath, 'utf8');

  assert.ok(html.includes('chapter04.css'), 'Phải link chapter04.css');
  assert.ok(html.includes('radio-ai.css'), 'Phải link radio-ai.css');
  assert.ok(html.includes('radio-ai.js'), 'Phải nạp radio-ai.js');
  assert.ok(html.includes('chapter04-data.js'), 'Phải nạp chapter04-data.js');
  assert.ok(html.includes('chapter04-puzzles.js'), 'Phải nạp chapter04-puzzles.js');
  assert.ok(html.includes('chapter04.js'), 'Phải nạp chapter04.js');

  assert.ok(html.includes('id="stage"'), 'Phải có #stage');
  assert.ok(html.includes('id="party"'), 'Phải có #party');
  assert.ok(html.includes('id="player"'), 'Phải có #player');
  assert.ok(html.includes('minh'), 'Phải có hình ảnh hoặc avatar bạn Minh');
  assert.ok(html.includes('id="dialogue"'), 'Phải có #dialogue');
  assert.ok(html.includes('id="btn-radio"') || html.includes('hud-radio-btn'), 'Phải có nút bộ đàm AI trên HUD');
});

test('Subtask 3.2: Thư mục web/assets/chapter04/ chứa đủ 4 ảnh nền cảnh', () => {
  const dir = path.resolve(__dirname, '../web/assets/chapter04');
  assert.ok(fs.existsSync(dir), 'Thư mục web/assets/chapter04 phải tồn tại');
  const files = ['village_outskirts.webp', 'isolation_post.webp', 'bamboo_bridge.webp', 'safe_ascent.webp'];
  for (const f of files) {
    const p = path.join(dir, f);
    assert.ok(fs.existsSync(p), `Thiếu ảnh nền ${f}`);
    const stat = fs.statSync(p);
    assert.ok(stat.size > 1000, `Ảnh nền ${f} quá nhỏ (${stat.size} bytes)`);
  }
});

test('Subtask 3.2: Sprite nhân vật bạn Minh tồn tại đầy đủ', () => {
  const idle = path.resolve(__dirname, '../web/assets/characters/minh/idle.png');
  const portrait = path.resolve(__dirname, '../web/assets/characters/minh/portrait.png');
  assert.ok(fs.existsSync(idle), 'Thiếu minh/idle.png');
  assert.ok(fs.existsSync(portrait), 'Thiếu minh/portrait.png');
});
