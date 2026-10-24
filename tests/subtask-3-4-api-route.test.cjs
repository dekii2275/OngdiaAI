const test = require('node:test');
const assert = require('node:assert/strict');
const { selectNpcReply } = require('../server/ai-bridge.js');

test('Subtask 3.4: selectNpcReply handler tiếp nhận và phản hồi đúng chuẩn schema', async () => {
  const result = await selectNpcReply({
    requestId: 'req-test-route',
    stageRevision: 2,
    playerText: 'Minh ơi đừng lo, cô sẽ giúp chúng mình'
  });

  assert.equal(result.request_id, 'req-test-route');
  assert.equal(result.stage_revision, 2);
  assert.ok(['minh_accept', 'minh_regret', 'minh_worried', 'minh_ask_teacher', 'minh_redirect'].includes(result.reply_id));
  assert.ok(result.reply_text.length > 0);
});
