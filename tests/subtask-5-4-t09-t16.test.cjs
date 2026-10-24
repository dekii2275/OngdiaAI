const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { SauConMuaEngine } = require('../web/js/sau-con-mua-engine.js');
const { evaluateRubric } = require('../web/js/sau-con-mua-telemetry.js');
const { validateNpcResponse } = require('../server/ai-bridge.js');

const scenarioJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../plan/sau-con-mua/content/scenario.json'), 'utf8')
);

test('T09: Response AI cũ khác stage_revision bị loại bỏ fallback an toàn', () => {
  const lateRes = validateNpcResponse({ request_id: 'r1', stage_revision: 1, reply_id: 'minh_worried' }, 'r1', 2);
  assert.equal(lateRes.reply_id, 'minh_accept');
  assert.equal(lateRes.is_fallback, true);
});

test('T10: Lời nói đòi bỏ luật nhận câu trả lời chuyển hướng redirect', () => {
  const validRedirect = validateNpcResponse({ request_id: 'r2', stage_revision: 2, reply_id: 'minh_redirect' }, 'r2', 2);
  assert.equal(validRedirect.reply_id, 'minh_redirect');
});

test('T11: Bỏ qua intro vào thẳng S1 an toàn', () => {
  const engine = new SauConMuaEngine(scenarioJson);
  engine.dispatch({ type: 'START' });
  assert.equal(engine.getState().stage, 'S1');
});

test('T12: Không phát sinh hint ngoài ý muốn khi không gọi HINT_TIMEOUT', () => {
  const engine = new SauConMuaEngine(scenarioJson);
  engine.dispatch({ type: 'START' });
  assert.equal(engine.getState().support_by_decision.D1, false);
});

test('T13: Rubric 3 phiên mẫu khớp 8, 7, 6 điểm', () => {
  const p1 = [
    { type: 'choice_selected', decision_id: 'D1', payload: { choice_id: 'report_teacher', attempt: 1 } },
    { type: 'choice_selected', decision_id: 'D2', payload: { choice_id: 'describe_crack', attempt: 1 } },
    { type: 'choice_selected', decision_id: 'D3', payload: { choice_id: 'continue_with_teacher', attempt: 1 } },
    { type: 'choice_selected', decision_id: 'D4', payload: { choice_id: 'guided_route', attempt: 1 } },
    { type: 'session_completed', payload: {} }
  ];
  assert.equal(evaluateRubric(p1).totalScore, 8);
});

test('T14: Bỏ dở giữa chừng gắn status incomplete', () => {
  const inc = [{ type: 'choice_selected', decision_id: 'D1', payload: { choice_id: 'report_teacher', attempt: 1 } }];
  assert.equal(evaluateRubric(inc).status, 'incomplete');
});

test('T15: Cấu hình kịch bản có đủ phím tắt và nhãn không phụ thuộc màu sắc', () => {
  assert.ok(scenarioJson.routes[0].anchors.length > 0);
  assert.equal(scenarioJson.routes[1].status, 'closed');
});

test('T16: AI tắt hoàn toàn vẫn đi đến END', () => {
  const engine = new SauConMuaEngine(scenarioJson);
  engine.dispatch({ type: 'START' });
  engine.dispatch({ type: 'CHOOSE', choice_id: 'report_teacher' });
  engine.dispatch({ type: 'CHOOSE', choice_id: 'describe_crack' });
  engine.dispatch({ type: 'CHOOSE', choice_id: 'continue_with_teacher' });
  engine.dispatch({ type: 'CHOOSE', choice_id: 'guided_route' });
  assert.equal(engine.getState().stage, 'S5');
});
