const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { SauConMuaEngine } = require('../web/js/sau-con-mua-engine.js');
const { TelemetryLogger, evaluateRubric } = require('../web/js/sau-con-mua-telemetry.js');
const { selectNpcReply, validateNpcResponse } = require('../server/ai-bridge.js');

const scenarioJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../plan/sau-con-mua/content/scenario.json'), 'utf8')
);

test('Full QA: Toàn bộ hành trình S0 -> S5 với đầy đủ Telemetry và tính điểm Rubric hoàn hảo 8/8', async () => {
  const logger = new TelemetryLogger('full-qa-session');
  const engine = new SauConMuaEngine(scenarioJson);

  // S0: Bắt đầu
  logger.logEvent({ event_id: 'qa-s0-enter', type: 'stage_entered', stage: 'S0' });
  const startRes = engine.dispatch({ type: 'START' });
  assert.equal(startRes.success, true);
  assert.equal(engine.getState().stage, 'S1');

  // S1: D1 - Báo cô giáo
  logger.logEvent({
    event_id: 'qa-d1-choose',
    type: 'choice_selected',
    decision_id: 'D1',
    stage: 'S1',
    payload: { choice_id: 'report_teacher', attempt: 1, support_before_choice: 'none' }
  });
  const d1Res = engine.dispatch({ type: 'CHOOSE', choice_id: 'report_teacher' });
  assert.equal(d1Res.success, true);
  assert.equal(engine.getState().stage, 'S2');

  // S2: D2 - Miêu tả vệt nứt
  logger.logEvent({
    event_id: 'qa-d2-choose',
    type: 'choice_selected',
    decision_id: 'D2',
    stage: 'S2',
    payload: { choice_id: 'describe_crack', attempt: 1, support_before_choice: 'none' }
  });
  const d2Res = engine.dispatch({ type: 'CHOOSE', choice_id: 'describe_crack' });
  assert.equal(d2Res.success, true);
  assert.equal(engine.getState().stage, 'S3');
  assert.equal(engine.getState().teacher_instruction_received, true);

  // S3: D3 - Khuyên Minh đi cùng cô
  logger.logEvent({
    event_id: 'qa-d3-choose',
    type: 'choice_selected',
    decision_id: 'D3',
    stage: 'S3',
    payload: { choice_id: 'continue_with_teacher', attempt: 1, support_before_choice: 'none' }
  });
  const d3Res = engine.dispatch({ type: 'CHOOSE', choice_id: 'continue_with_teacher' });
  assert.equal(d3Res.success, true);
  assert.equal(engine.getState().stage, 'S4');
  assert.equal(engine.getState().minh_resolved, true);

  // S4: D4 - Đi theo lối cô chỉ dẫn
  logger.logEvent({
    event_id: 'qa-d4-choose',
    type: 'choice_selected',
    decision_id: 'D4',
    stage: 'S4',
    payload: { choice_id: 'guided_route', attempt: 1, support_before_choice: 'none' }
  });
  const d4Res = engine.dispatch({ type: 'CHOOSE', choice_id: 'guided_route' });
  assert.equal(d4Res.success, true);
  assert.equal(engine.getState().stage, 'S5');
  assert.equal(engine.getState().arrived, true);

  // S5: Recap R1, R2, R3
  engine.dispatch({ type: 'RECAP_ANSWER', recap_id: 'R1', recap_choice_id: 'tell_adult' });
  engine.dispatch({ type: 'RECAP_ANSWER', recap_id: 'R2', recap_choice_id: 'adult_and_group' });
  engine.dispatch({ type: 'RECAP_ANSWER', recap_id: 'R3', recap_choice_id: 'follow_guidance' });

  logger.logEvent({ event_id: 'qa-session-complete', type: 'session_completed', payload: {} });

  const rubric = evaluateRubric(logger.getEvents());
  assert.equal(rubric.status, 'completed');
  assert.equal(rubric.totalScore, 8);
  assert.equal(rubric.childCards.tell_adult, true);
  assert.equal(rubric.childCards.safety_first, true);
  assert.equal(rubric.childCards.stay_with_group, true);
});
