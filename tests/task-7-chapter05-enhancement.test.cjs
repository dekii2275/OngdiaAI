const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Task 7: chapter05.html nạp voice-tts.js và có nút điều khiển giọng đọc', () => {
  const html = fs.readFileSync(path.resolve(__dirname, '../web/chapter05.html'), 'utf8');
  assert.ok(html.includes('voice-tts.js'), 'Thiếu nạp voice-tts.js trong chapter05.html');
  assert.ok(html.includes('id="voice-toggle"') || html.includes('voice-toggle'), 'Phải có nút điều khiển giọng đọc voice-toggle');
});

test('Task 7: chapter05.js tích hợp VoiceTTS trong luồng thoại', () => {
  const js = fs.readFileSync(path.resolve(__dirname, '../web/js/chapter05.js'), 'utf8');
  assert.ok(js.includes('VoiceTTS.speak'), 'Phải gọi VoiceTTS.speak trong luồng hội thoại');
  assert.ok(js.includes('VoiceTTS.toggle') || js.includes('voice-toggle'), 'Phải hỗ trợ bật/tắt giọng đọc AI');
});

test('Task 7: chapter05.css có keyframes sunrise-glow và hearth-fire', () => {
  const css = fs.readFileSync(path.resolve(__dirname, '../web/chapter05.css'), 'utf8');
  assert.ok(css.includes('@keyframes sunrise-glow') || css.includes('sunrise-glow'), 'CSS phải có animation sunrise-glow cho vệt nắng hửng rạng');
  assert.ok(css.includes('@keyframes hearth-fire') || css.includes('hearth-fire'), 'CSS phải có animation hearth-fire cho bếp lửa reo');
});

test('Task 7: 3 ảnh nền đỉnh đồi, trạm chỉ huy, hội trường tồn tại trong web/assets/chapter05/', () => {
  const dir = path.resolve(__dirname, '../web/assets/chapter05');
  for (const f of ['summit_gate.webp', 'command_post.webp', 'safe_hall.webp']) {
    const p = path.join(dir, f);
    assert.ok(fs.existsSync(p), `Thiếu ảnh ${f}`);
    assert.ok(fs.statSync(p).size > 10000, `Ảnh ${f} phải là ảnh độ phân giải cao`);
  }
});

test('Task 7: chapter05.js có mini-sequence WASD dẫn đoàn 5 người bước qua cổng an toàn', () => {
  const js = fs.readFileSync(path.resolve(__dirname, '../web/js/chapter05.js'), 'utf8');
  assert.ok(
    js.includes('startSummitGateMarch') || js.includes('gate-minigame') || js.includes('marchThroughGate') || js.includes('gateMarch'),
    'Phải có hàm mini-sequence dẫn đoàn qua cổng an toàn'
  );
  assert.ok(
    js.includes('Cô Thảo') && js.includes('Bác Mạnh') && js.includes('Duyên') && js.includes('Minh'),
    'Phải có đầy đủ 5 thành viên trong đội hình qua cổng an toàn'
  );
});

test('Task 7: chapter05.js tích hợp AI Incident Dispatch biên tập bức điện cứu hộ gửi Huyện', () => {
  const js = fs.readFileSync(path.resolve(__dirname, '../web/js/chapter05.js'), 'utf8');
  assert.ok(js.includes('/api/tactical/incident-dispatch'), 'Phải gọi API /api/tactical/incident-dispatch');
  assert.ok(js.includes('hazards'), 'Phải truyền danh sách hazards vào incident dispatch');
  assert.ok(js.includes('dispatchCode') && js.includes('reportText'), 'Phải hiển thị mã dispatchCode và nội dung bức điện reportText');
});

test('Task 7: chapter05.js tích hợp Medical Triage Solver phản biện 3 ca khủng hoảng y tế sau bão', () => {
  const js = fs.readFileSync(path.resolve(__dirname, '../web/js/chapter05.js'), 'utf8');
  assert.ok(js.includes('/api/medical/triage-solver'), 'Phải gọi API /api/medical/triage-solver');
  assert.ok(js.includes('hypothermia'), 'Phải xử lý ca hạ thân nhiệt hypothermia');
  assert.ok(js.includes('laceration') || js.includes('wound'), 'Phải xử lý ca vết rách dính bùn laceration/wound');
  assert.ok(js.includes('co_hazard') || js.includes('stove'), 'Phải xử lý ca ngạt khí độc than củi co_hazard/stove');
  assert.ok(js.includes('critique') || js.includes('approved'), 'Phải hiển thị phản biện y tế chuẩn Chữ Thập Đỏ');
});

test('Task 7: chapter05.js có Khảo Hạch Tốt Nghiệp và khắc lời khen cá nhân hóa lên Chứng Nhận', () => {
  const js = fs.readFileSync(path.resolve(__dirname, '../web/js/chapter05.js'), 'utf8');
  assert.ok(js.includes('/api/debrief/evaluate'), 'Phải gọi API /api/debrief/evaluate để khảo hạch tốt nghiệp');
  assert.ok(js.includes('chapter: 5') || js.includes('chapter:5'), 'Phải gửi khảo hạch với chapter 5');
  assert.ok(
    js.includes('cert-feedback') || js.includes('cert-praise') || js.includes('feedback'),
    'Phải khắc lời khen cá nhân hóa từ LLM vào chứng nhận'
  );
  assert.ok(js.includes('cert-card'), 'Phải hiển thị thẻ chứng nhận cert-card');
  assert.ok(js.includes('CHIẾN SĨ NHÍ AN TOÀN') || js.includes('Chiến Sĩ Nhí An Toàn'), 'Phải có danh hiệu Chiến Sĩ Nhí An Toàn');
});
