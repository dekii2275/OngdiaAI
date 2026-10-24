const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { SauConMuaEngine } = require('../web/js/sau-con-mua-engine.js');

const scenarioJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../plan/sau-con-mua/content/scenario.json'), 'utf8')
);

test('Subtask 2.3: S2 chọn mô tả đúng chuyển thẳng sang S3 và phát lệnh sơ tán', () => {
  const engine = new SauConMuaEngine(scenarioJson);
  engine.dispatch({ type: 'START' });
  engine.dispatch({ type: 'CHOOSE', choice_id: 'report_teacher' });

  engine.dispatch({ type: 'CHOOSE', choice_id: 'describe_crack' });
  const state = engine.getState();
  assert.equal(state.stage, 'S3');
  assert.equal(state.teacher_instruction_received, true);
  assert.equal(state.support_by_decision.D2, false);
});

test('Subtask 2.3: S2 chọn chưa biết nói mở S2_HELP, chọn still_unsure vẫn sang S3 không kẹt', () => {
  const engine = new SauConMuaEngine(scenarioJson);
  engine.dispatch({ type: 'START' });
  engine.dispatch({ type: 'CHOOSE', choice_id: 'report_teacher' });

  engine.dispatch({ type: 'CHOOSE', choice_id: 'need_help_describing' });
  assert.equal(engine.getState().stage, 'S2_HELP');
  assert.equal(engine.getState().support_by_decision.D2, true);

  engine.dispatch({ type: 'CHOOSE', choice_id: 'still_unsure' });
  const state = engine.getState();
  assert.equal(state.stage, 'S3');
  assert.equal(state.teacher_instruction_received, true);
});
