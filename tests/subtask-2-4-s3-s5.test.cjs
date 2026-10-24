const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { SauConMuaEngine } = require('../web/js/sau-con-mua-engine.js');

const scenarioJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../plan/sau-con-mua/content/scenario.json'), 'utf8')
);

test('Subtask 2.4: S3 xử lý D3 (nhờ cô giải quyết Minh) -> S4 xử lý D4 (tuyến cô chỉ) -> S5', () => {
  const engine = new SauConMuaEngine(scenarioJson);
  engine.dispatch({ type: 'START' });
  engine.dispatch({ type: 'CHOOSE', choice_id: 'report_teacher' });
  engine.dispatch({ type: 'CHOOSE', choice_id: 'describe_crack' });

  // Tại S3: Nhờ cô
  engine.dispatch({ type: 'CHOOSE', choice_id: 'ask_teacher' });
  assert.equal(engine.getState().minh_resolved, true);
  assert.equal(engine.getState().stage, 'S4');

  // Tại S4: Lối cô chỉ
  engine.dispatch({ type: 'CHOOSE', choice_id: 'guided_route' });
  assert.equal(engine.getState().arrived, true);
  assert.equal(engine.getState().stage, 'S5');

  // Tại S5: Trả lời câu hỏi ôn tập R1
  const rRes = engine.dispatch({ type: 'RECAP_ANSWER', recap_id: 'R1', recap_choice_id: 'tell_adult' });
  assert.equal(rRes.correct, true);
  assert.equal(engine.getState().recap_first_answers.R1, true);

  // Replay
  engine.dispatch({ type: 'REPLAY' });
  assert.equal(engine.getState().stage, 'S0');
});
