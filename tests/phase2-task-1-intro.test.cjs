const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Phase 2 Task 1: 4 file ảnh intro (intro_1, intro_2, intro_3, intro_poster) phải tồn tại', () => {
  const introFiles = ['intro_1.webp', 'intro_2.webp', 'intro_3.webp', 'intro_poster.webp'];
  for (const f of introFiles) {
    const fullPath = path.resolve(__dirname, '../web/assets/sau-con-mua/intro', f);
    assert.ok(fs.existsSync(fullPath), `Thiếu file intro: ${f}`);
    const stat = fs.statSync(fullPath);
    assert.ok(stat.size > 2000, `File ${f} quá nhỏ (${stat.size} bytes)`);
  }
});

test('Phase 2 Task 1: HTML và CSS phải chứa container cinematic intro và nút bỏ qua', () => {
  const html = fs.readFileSync(path.resolve(__dirname, '../web/sau-con-mua.html'), 'utf8');
  assert.ok(html.includes('id="cinematic-intro"'), 'Thiếu container cinematic-intro');
  assert.ok(html.includes('id="intro-caption"'), 'Thiếu intro-caption phụ đề');
  assert.ok(html.includes('id="btn-skip-intro"'), 'Thiếu nút Bỏ qua intro');

  const css = fs.readFileSync(path.resolve(__dirname, '../web/sau-con-mua.css'), 'utf8');
  assert.ok(css.includes('cinematic-intro') || css.includes('intro-shot'), 'CSS phải có định kiểu cho intro');
});
