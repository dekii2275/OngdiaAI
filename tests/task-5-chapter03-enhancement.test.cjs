const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Task 5: chapter03.html nạp voice-tts.js và có nút điều khiển giọng đọc', () => {
  const html = fs.readFileSync(path.resolve(__dirname, '../web/chapter03.html'), 'utf8');
  assert.ok(html.includes('voice-tts.js'), 'Thiếu nạp voice-tts.js trong chapter03.html');
  assert.ok(html.includes('id="voice-toggle"') || html.includes('voice-toggle'), 'Phải có nút điều khiển giọng đọc voice-toggle');
});

test('Task 5: chapter03.js tích hợp VoiceTTS trong luồng thoại', () => {
  const js = fs.readFileSync(path.resolve(__dirname, '../web/js/chapter03.js'), 'utf8');
  assert.ok(js.includes('VoiceTTS.speak'), 'Phải gọi VoiceTTS.speak trong luồng hội thoại');
  assert.ok(js.includes('VoiceTTS.toggle') || js.includes('voice-toggle'), 'Phải hỗ trợ bật/tắt giọng đọc AI');
});

test('Task 5: chapter03.css và chapter03.js tích hợp hiệu ứng screen shake', () => {
  const css = fs.readFileSync(path.resolve(__dirname, '../web/chapter03.css'), 'utf8');
  assert.ok(css.includes('screen-shake') || css.includes('@keyframes shake'), 'CSS phải có animation screen-shake');
  
  const js = fs.readFileSync(path.resolve(__dirname, '../web/js/chapter03.js'), 'utf8');
  assert.ok(js.includes('triggerScreenShake') || js.includes('screen-shake'), 'JS phải có hàm kích hoạt rung màn hình');
});

test('Task 5: chapter03.js có tình huống LLM 1 báo cáo bộ đàm khẩn cấp cho Trưởng làng Minh Anh về vệt nứt D1', () => {
  const js = fs.readFileSync(path.resolve(__dirname, '../web/js/chapter03.js'), 'utf8');
  assert.ok(js.includes('/api/radio/chat'), 'Phải gọi /api/radio/chat để liên lạc bộ đàm');
  assert.ok(js.includes("channel: 'minh_anh'") || js.includes('channel:"minh_anh"'), 'Phải gửi persona channel minh_anh');
  assert.ok(js.includes('D1') || js.includes('vết nứt') || js.includes('cánh cung'), 'Phải báo cáo thông tin vệt nứt');
});

test('Task 5: chapter03.js có tình huống LLM 2 can ngăn Bác Mạnh không trèo qua đá tảng rêu trơn', () => {
  const js = fs.readFileSync(path.resolve(__dirname, '../web/js/chapter03.js'), 'utf8');
  assert.ok(js.includes("channel: 'manh'") || js.includes('channel:"manh"'), 'Phải gửi persona channel manh');
  assert.ok(js.includes('đá tảng') || js.includes('trèo qua') || js.includes('rêu trơn'), 'Phải có nội dung can ngăn trèo qua đá tảng rêu trơn');
});

test('Task 5: chapter03.js có mini-sequence WASD vượt khúc cua suối bùn với gậy dò đường', () => {
  const js = fs.readFileSync(path.resolve(__dirname, '../web/js/chapter03.js'), 'utf8');
  assert.ok(js.includes('mudflow-minigame') || js.includes('startMudflowWalk') || js.includes('crossMudflow'), 'Phải có hàm mini-sequence vượt suối bùn');
  assert.ok(js.includes('gậy dò đường') || js.includes('probe'), 'Phải có cơ chế gậy dò đường');
  assert.ok(js.includes('bùn lún') || js.includes('vũng bùn'), 'Phải có nguy cơ vũng bùn lún');
  assert.ok(js.includes('gờ đá') || js.includes('stone ridge'), 'Phải có cơ chế bước trên gờ đá an toàn');
});

test('Task 5: chapter03.js có khảo hạch AI kết thúc chương cấp PASS CHƯƠNG 03', () => {
  const js = fs.readFileSync(path.resolve(__dirname, '../web/js/chapter03.js'), 'utf8');
  assert.ok(js.includes('/api/debrief/evaluate'), 'Phải gọi API khảo hạch cuối chương');
  assert.ok(js.includes('Khi phát hiện vết nứt sườn đồi hình cánh cung và rặng tre nghiêng về phía taluy âm'), 'Câu hỏi khảo hạch phải đúng câu hỏi sư phạm');
  assert.ok(js.includes('PASS CHƯƠNG 03: ĐỘI VIÊN TRINH SÁT ĐỊA HÌNH'), 'Phải cấp danh hiệu PASS CHƯƠNG 03: ĐỘI VIÊN TRINH SÁT ĐỊA HÌNH');
  assert.ok(js.includes('chapter04.html'), 'Phải mở khóa liên kết tới Chương 04');
});

test('Task 5: 4 ảnh nền phong cảnh núi sạt lở tồn tại trong web/assets/chapter03/', () => {
  const dir = path.resolve(__dirname, '../web/assets/chapter03');
  for (const f of ['ridge_entry.webp', 'crack_zone.webp', 'mudflow_bend.webp', 'boulder_pass.webp']) {
    const p = path.join(dir, f);
    assert.ok(fs.existsSync(p), `Thiếu ảnh ${f}`);
    assert.ok(fs.statSync(p).size > 10000, `Ảnh ${f} phải là ảnh độ phân giải cao`);
  }
});
