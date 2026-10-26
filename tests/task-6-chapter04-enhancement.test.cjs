const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Task 6: chapter04.html nạp voice-tts.js và có nút điều khiển giọng đọc', () => {
  const html = fs.readFileSync(path.resolve(__dirname, '../web/chapter04.html'), 'utf8');
  assert.ok(html.includes('voice-tts.js'), 'Thiếu nạp voice-tts.js trong chapter04.html');
  assert.ok(html.includes('id="voice-toggle"') || html.includes('voice-toggle'), 'Phải có nút điều khiển giọng đọc voice-toggle');
});

test('Task 6: chapter04.js tích hợp VoiceTTS trong luồng thoại', () => {
  const js = fs.readFileSync(path.resolve(__dirname, '../web/js/chapter04.js'), 'utf8');
  assert.ok(js.includes('VoiceTTS.speak'), 'Phải gọi VoiceTTS.speak trong luồng hội thoại');
  assert.ok(js.includes('VoiceTTS.toggle') || js.includes('voice-toggle'), 'Phải hỗ trợ bật/tắt giọng đọc AI');
});

test('Task 6: chapter04.css và chapter04.js tích hợp hiệu ứng dòng suối lũ cuộn xoáy hoặc cầu tre đu đưa', () => {
  const css = fs.readFileSync(path.resolve(__dirname, '../web/chapter04.css'), 'utf8');
  assert.ok(
    css.includes('bridge-sway') || css.includes('flood-current') || css.includes('swirl') || css.includes('@keyframes sway'),
    'CSS phải có animation dòng suối lũ hoặc cầu tre đu đưa'
  );

  const js = fs.readFileSync(path.resolve(__dirname, '../web/js/chapter04.js'), 'utf8');
  assert.ok(
    js.includes('triggerBridgeSway') || js.includes('triggerScreenShake') || js.includes('bridge-sway'),
    'JS phải có hiệu ứng rung lắc / chao đảo cầu tre'
  );
});

test('Task 6: chapter04.js có tình huống LLM 1 đối thoại tâm lý thuyết phục Minh ưu tiên tính mạng', () => {
  const js = fs.readFileSync(path.resolve(__dirname, '../web/js/chapter04.js'), 'utf8');
  assert.ok(js.includes('/api/radio/chat'), 'Phải gọi /api/radio/chat để trò chuyện với Minh');
  assert.ok(js.includes("channel: 'minh'") || js.includes('channel:"minh"'), 'Phải gửi channel minh');
  assert.ok(js.includes('minhSaved') || js.includes('tranh') || js.includes('tính mạng'), 'Phải xử lý cứu Minh và giải tỏa tâm lý tiếc tranh');
});

test('Task 6: chapter04.js có tình huống LLM 2 AI Giám định hiện trường & Lập phác đồ vượt cầu tre (Tactical Bridge Blueprint)', () => {
  const js = fs.readFileSync(path.resolve(__dirname, '../web/js/chapter04.js'), 'utf8');
  assert.ok(js.includes('/api/tactical/bridge-blueprint'), 'Phải gọi /api/tactical/bridge-blueprint');
  assert.ok(
    js.includes('Mối buộc tre lỏng') || js.includes('Thân tre đực rêu trơn') || js.includes('Dòng xoáy mạn phải'),
    'Phải gửi dữ liệu kiểm tra hiện trường cầu tre'
  );
  assert.ok(js.includes('zones') || js.includes('tacticalNote') || js.includes('phác đồ') || js.includes('blueprint'), 'Phải xử lý hiển thị phác đồ kỹ thuật 3 phân khu');
});

test('Task 6: chapter04.js có mini-sequence WASD bọc lót cho Minh qua cầu tre dã chiến', () => {
  const js = fs.readFileSync(path.resolve(__dirname, '../web/js/chapter04.js'), 'utf8');
  assert.ok(
    js.includes('bridge-minigame') || js.includes('startBridgeCrossing') || js.includes('crossBambooBridge') || js.includes('startBridgeWalk'),
    'Phải có hàm mini-sequence vượt cầu tre'
  );
  assert.ok(js.includes('thăng bằng') || js.includes('balance') || js.includes('chao đảo') || js.includes('sway'), 'Phải có cơ chế giữ thăng bằng chống chao đảo');
  assert.ok(js.includes('xoáy nước') || js.includes('dòng nước') || js.includes('current') || js.includes('whirlpool'), 'Phải có yếu tố hiểm họa dòng xoáy nước lũ');
});

test('Task 6: chapter04.js có khảo hạch AI kết thúc chương cấp PASS CHƯƠNG 04', () => {
  const js = fs.readFileSync(path.resolve(__dirname, '../web/js/chapter04.js'), 'utf8');
  assert.ok(js.includes('/api/debrief/evaluate'), 'Phải gọi API khảo hạch cuối chương');
  assert.ok(
    js.includes('Tại sao khi vượt cầu tre dã chiến trong dòng nước lũ, chúng ta bắt buộc phải đi từng người một cách nhau 3 mét và tuyệt đối không nhìn xuống xoáy nước?'),
    'Câu hỏi khảo hạch phải đúng câu hỏi sư phạm'
  );
  assert.ok(js.includes('PASS CHƯƠNG 04: CHIẾN SĨ CỨU HỘ ĐỒNG ĐỘI'), 'Phải cấp danh hiệu PASS CHƯƠNG 04: CHIẾN SĨ CỨU HỘ ĐỒNG ĐỘI');
  assert.ok(js.includes('chapter05.html'), 'Phải mở khóa liên kết tới Chương 05');
});

test('Task 6: 4 ảnh nền xóm đồi chia cắt và cầu tre tồn tại trong web/assets/chapter04/', () => {
  const dir = path.resolve(__dirname, '../web/assets/chapter04');
  for (const f of ['village_outskirts.webp', 'isolation_post.webp', 'bamboo_bridge.webp', 'safe_ascent.webp']) {
    const p = path.join(dir, f);
    assert.ok(fs.existsSync(p), `Thiếu ảnh ${f}`);
    assert.ok(fs.statSync(p).size > 10000, `Ảnh ${f} phải là ảnh độ phân giải cao`);
  }
});
