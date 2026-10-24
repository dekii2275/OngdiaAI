const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Subtask 1.3: 3 file cues (cue_crack, cue_tree, cue_stream) phải tồn tại và hợp lệ', () => {
  const cues = ['cue_crack.webp', 'cue_tree.webp', 'cue_stream.webp'];
  for (const c of cues) {
    const fullPath = path.resolve(__dirname, '../web/assets/sau-con-mua/cues', c);
    assert.ok(fs.existsSync(fullPath), `LỖI: Chưa có file cue: ${c}`);
    const stat = fs.statSync(fullPath);
    assert.ok(stat.size > 5000, `LỖI: File ${c} quá nhỏ (${stat.size} bytes)`);
  }
});
