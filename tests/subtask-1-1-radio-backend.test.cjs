const test = require('node:test');
const assert = require('node:assert/strict');
const { handleRadioChat } = require('../server/radio-ai-handler.js');

test('Subtask 1.1: handleRadioChat xử lý request và trả về phản hồi hợp lệ cho Trưởng làng Minh Anh', async () => {
  const res = await handleRadioChat({
    channel: 'minh_anh',
    playerName: 'Bạn',
    message: 'Bác Minh Anh ơi, sườn đồi trước mặt có vết nứt dài, chúng cháu nên làm gì?',
    chapter: 3,
    scene: 'crack_zone'
  });

  assert.equal(res.success, true);
  assert.equal(res.channel, 'minh_anh');
  assert.equal(res.speaker_name, 'Trưởng làng Minh Anh');
  assert.ok(typeof res.reply_text === 'string' && res.reply_text.length > 10);
  assert.ok(res.latency_ms >= 0);
});

test('Subtask 1.1: handleRadioChat hỗ trợ các kênh Bác Mạnh, Cô Thảo, Bạn Minh', async () => {
  const resManh = await handleRadioChat({ channel: 'manh', message: 'Tình hình đường phía trước thế nào bác?' });
  assert.equal(resManh.speaker_name, 'Bác Mạnh');
  assert.ok(resManh.reply_text.length > 5);

  const resThao = await handleRadioChat({ channel: 'thao', message: 'Cô ơi, các bạn đang hoang mang' });
  assert.equal(resThao.speaker_name, 'Cô Thảo');
  assert.ok(resThao.reply_text.length > 5);
});
