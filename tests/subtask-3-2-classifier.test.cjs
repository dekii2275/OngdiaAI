const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSystemInstruction, REPLY_BANK } = require('../server/npc-classifier.js');

test('Subtask 3.2: System instruction phải chứa đầy đủ 5 reply_id và quy tắc bảo mật', () => {
  const prompt = buildSystemInstruction('req-01', 3);
  assert.ok(prompt.includes('minh_accept'));
  assert.ok(prompt.includes('minh_regret'));
  assert.ok(prompt.includes('minh_worried'));
  assert.ok(prompt.includes('minh_ask_teacher'));
  assert.ok(prompt.includes('minh_redirect'));
  assert.ok(prompt.includes('req-01'));
  assert.ok(prompt.includes('"stage_revision": 3'));
});

test('Subtask 3.2: REPLY_BANK phải khớp 100% văn bản đã duyệt trong scenario.json', () => {
  assert.equal(REPLY_BANK.minh_accept, 'Ừ, tớ sẽ đi cùng cô và các bạn.');
  assert.equal(REPLY_BANK.minh_regret, 'Tớ cũng tiếc bức tranh. Tớ sẽ đi cùng cô và các bạn.');
  assert.equal(REPLY_BANK.minh_worried, 'Tớ cũng lo một chút. Mình nói với cô và ở cùng nhóm nhé.');
  assert.equal(REPLY_BANK.minh_ask_teacher, 'Mình nhờ cô giúp nhé. Tớ sẽ ở cùng mọi người.');
  assert.equal(REPLY_BANK.minh_redirect, 'Mình đi cùng cô nhé. Chuyện khác mình nói sau.');
});
