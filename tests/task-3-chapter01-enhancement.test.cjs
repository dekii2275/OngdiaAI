const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Task 3: web/index.html nạp voice-tts.js, nút voice-toggle và có container khảo hạch debrief', () => {
  const html = fs.readFileSync(path.resolve(__dirname, '../web/index.html'), 'utf8');
  assert.ok(html.includes('voice-tts.js'), 'HTML phải nạp voice-tts.js');
  assert.ok(html.includes('id="voice-toggle"'), 'HTML phải có nút điều khiển voice-toggle');
  assert.ok(html.includes('id="ch1-debrief-modal"') || html.includes('debrief'), 'Phải có modal hoặc container khảo hạch debrief');
});

test('Task 3: story.js có lời thoại hỗ trợ tình huống LLM Duyên và Cô Thảo', () => {
  const storyJs = fs.readFileSync(path.resolve(__dirname, '../web/js/story.js'), 'utf8');
  assert.ok(storyJs.includes('ai-duyen-comfort'), 'story.js phải có nhánh ai-duyen-comfort');
  assert.ok(storyJs.includes('ai-thao-safety'), 'story.js phải có nhánh ai-thao-safety');
  assert.ok(storyJs.includes('30 giây'), 'story.js phải có phân tích ranh giới 30 giây');
  assert.ok(storyJs.includes('tính mạng con người'), 'story.js phải nhấn mạnh nguyên tắc tính mạng');
});

test('Task 3: game.js có cơ chế kiểm tra Pass Chương 01 và gọi debrief evaluate trước khi mở Chương 02', () => {
  const gameJs = fs.readFileSync(path.resolve(__dirname, '../web/js/game.js'), 'utf8');
  assert.ok(gameJs.includes('performDebriefEvaluation'), 'Phải có hàm performDebriefEvaluation');
  assert.ok(gameJs.includes('/api/debrief/evaluate'), 'Phải gọi API /api/debrief/evaluate để chấm khảo hạch');
  assert.ok(gameJs.includes('PASS CHƯƠNG 01'), 'Phải cấp huy hiệu PASS CHƯƠNG 01');
  assert.ok(gameJs.includes('ch1-debrief-submit'), 'Phải có nút submit khảo hạch');
});

test('Task 3: game.js debrief có logic offline fallback chuẩn sư phạm cứu nạn', () => {
  const gameJs = fs.readFileSync(path.resolve(__dirname, '../web/js/game.js'), 'utf8');
  assert.ok(gameJs.includes('quay lại') && gameJs.includes('tiếc của'), 'Phải kiểm tra từ chối tiếc của quay lại lấy đồ');
  assert.ok(gameJs.includes('length < 5'), 'Phải kiểm tra độ dài câu trả lời');
});

test('Task 3: game.js tích hợp VoiceTTS trong playLine và cung cấp cơ chế điều khiển giọng đọc', () => {
  const gameJs = fs.readFileSync(path.resolve(__dirname, '../web/js/game.js'), 'utf8');
  assert.ok(gameJs.includes('VoiceTTS.speak'), 'game.js phải gọi VoiceTTS.speak trong luồng hội thoại');
  assert.ok(gameJs.includes('VoiceTTS.toggle'), 'game.js phải hỗ trợ VoiceTTS.toggle');
  assert.ok(gameJs.includes('toggle-voice'), 'game.js phải có tùy chọn toggle-voice trong settings');
});

test('Task 3: game.js có mini-sequence WASD hành lang né vật cản / vũng nước trơn', () => {
  const gameJs = fs.readFileSync(path.resolve(__dirname, '../web/js/game.js'), 'utf8');
  assert.ok(gameJs.includes('hallway-puddle'), 'game.js phải render vũng nước hành lang');
  assert.ok(gameJs.includes('hallway-obstacle') || gameJs.includes('Chậu cây ngã'), 'game.js phải render chậu cây ngã');
  assert.ok(gameJs.includes('hallway-runner') || gameJs.includes('GỜ THẢM KHÔ'), 'game.js phải có gờ thảm khô dẫn đường');
  assert.ok(gameJs.includes('inPuddle') || gameJs.includes('trơn trượt'), 'game.js phải xử lý trơn trượt khi bước vào vũng nước');
});

test('Task 3: game.js có tình huống LLM 1 trấn an Duyên tại tủ đồ với đúng channel duyen', () => {
  const gameJs = fs.readFileSync(path.resolve(__dirname, '../web/js/game.js'), 'utf8');
  assert.ok(gameJs.includes('showDuyenComfortModal'), 'Phải có modal trấn an Duyên');
  assert.ok(gameJs.includes('choice-comfort-duyen'), 'Phải có lựa chọn trấn an Duyên');
  assert.ok(gameJs.includes('/api/radio/chat'), 'Phải hỗ trợ tương tác AI với Duyên');
  assert.ok(gameJs.includes("channel: 'duyen'"), 'Phải gọi đúng persona channel duyen');
  const radioHandler = fs.readFileSync(path.resolve(__dirname, '../server/radio-ai-handler.js'), 'utf8');
  assert.ok(radioHandler.includes("channel: 'duyen'"), 'radio-ai-handler phải cấu hình persona duyen');
});

test('Task 3: game.js có tình huống LLM 2 trao đổi với Cô Thảo về giới hạn an toàn', () => {
  const gameJs = fs.readFileSync(path.resolve(__dirname, '../web/js/game.js'), 'utf8');
  assert.ok(gameJs.includes('ask-thao-safety'), 'Phải có nút hỏi Cô Thảo về 30 giây an toàn');
  assert.ok(gameJs.includes('ai-thao-safety'), 'Phải kích hoạt hội thoại ai-thao-safety');
});
