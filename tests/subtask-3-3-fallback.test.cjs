const test = require('node:test');
const assert = require('node:assert/strict');
const { selectNpcReply, validateNpcResponse } = require('../server/ai-bridge.js');

test('Subtask 3.3: Quá 3000ms phải tự động fallback minh_accept và is_fallback=true', async () => {
  const hangingCaller = async () => {
    await new Promise(r => setTimeout(r, 3500));
    return { request_id: 'r1', stage_revision: 1, reply_id: 'minh_regret' };
  };

  const start = Date.now();
  const res = await selectNpcReply({
    requestId: 'r1',
    stageRevision: 1,
    playerText: 'Tiếc tranh',
    customCaller: hangingCaller
  });
  const elapsed = Date.now() - start;

  assert.ok(elapsed <= 3300, `Timeout không ngắt kịp (${elapsed}ms)`);
  assert.equal(res.reply_id, 'minh_accept');
  assert.equal(res.is_fallback, true);
});

test('Subtask 3.3: Response có reply_id lạ ngoài whitelist bị ép về minh_accept', () => {
  const badIdOutput = { request_id: 'r2', stage_revision: 2, reply_id: 'minh_hack_game' };
  const res = validateNpcResponse(badIdOutput, 'r2', 2);
  assert.equal(res.reply_id, 'minh_accept');
  assert.equal(res.is_fallback, true);
});
