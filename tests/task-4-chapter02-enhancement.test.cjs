const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Task 4: chapter02.html nạp voice-tts.js và có nút điều khiển giọng đọc', () => {
  const html = fs.readFileSync(path.resolve(__dirname, '../web/chapter02.html'), 'utf8');
  assert.ok(html.includes('voice-tts.js'), 'Thiếu nạp voice-tts.js trong chapter02.html');
  assert.ok(html.includes('id="voice-toggle"') || html.includes('voice-toggle'), 'Phải có nút điều khiển giọng đọc voice-toggle');
});

test('Task 4: chapter02.js tích hợp VoiceTTS trong luồng thoại', () => {
  const js = fs.readFileSync(path.resolve(__dirname, '../web/js/chapter02.js'), 'utf8');
  assert.ok(js.includes('VoiceTTS.speak'), 'Phải gọi VoiceTTS.speak trong luồng hội thoại');
  assert.ok(js.includes('VoiceTTS.toggle') || js.includes('voice-toggle'), 'Phải hỗ trợ bật/tắt giọng đọc AI');
});

test('Task 4: chapter02.js có tình huống LLM 1 tranh luận an toàn với Duyên tại ngã ba', () => {
  const js = fs.readFileSync(path.resolve(__dirname, '../web/js/chapter02.js'), 'utf8');
  assert.ok(js.includes('/api/radio/chat'), 'Phải gọi /api/radio/chat để tương tác với Duyên');
  assert.ok(js.includes("channel: 'duyen'") || js.includes('channel:"duyen"'), 'Phải gửi persona channel duyen');
  assert.ok(js.includes('Cầu treo') || js.includes('200m'), 'Nội dung tranh luận phải xoay quanh cầu treo 200m');
});

test('Task 4: chapter02.js có tình huống LLM 2 báo cáo thực địa với Bác Mạnh tại Cầu Bắc', () => {
  const js = fs.readFileSync(path.resolve(__dirname, '../web/js/chapter02.js'), 'utf8');
  assert.ok(js.includes("channel: 'manh'") || js.includes('channel:"manh"'), 'Phải gửi persona channel manh');
  assert.ok(js.includes('báo cáo') || js.includes('thực địa'), 'Phải có chức năng báo cáo thực địa với bác Mạnh');
});

test('Task 4: chapter02.js có mini-sequence WASD Cầu Bắc trong gió giật', () => {
  const js = fs.readFileSync(path.resolve(__dirname, '../web/js/chapter02.js'), 'utf8');
  assert.ok(js.includes('tim cầu') || js.includes('centerline') || js.includes('thăng bằng'), 'Phải có cơ chế giữ thăng bằng tim cầu');
  assert.ok(js.includes('gió giật') || js.includes('gust'), 'Phải có cơ chế gió giật lệch hướng');
});

test('Task 4: chapter02.js có khảo hạch AI kết thúc chương thay thế trắc nghiệm cũ', () => {
  const js = fs.readFileSync(path.resolve(__dirname, '../web/js/chapter02.js'), 'utf8');
  assert.ok(js.includes('/api/debrief/evaluate'), 'Phải gọi API khảo hạch cuối chương');
  assert.ok(js.includes('Tại ngã ba, vì sao cả đoàn lại chọn đi đường vòng phía Bắc 650m'), 'Câu hỏi khảo hạch phải đúng câu hỏi sư phạm');
  assert.ok(js.includes('PASS CHƯƠNG 02: NHÀ ĐIỀU HƯỚNG TÀI BA'), 'Phải cấp danh hiệu PASS CHƯƠNG 02: NHÀ ĐIỀU HƯỚNG TÀI BA');
  assert.ok(js.includes('chapter03.html'), 'Phải mở khóa liên kết tới Chương 03');
});
