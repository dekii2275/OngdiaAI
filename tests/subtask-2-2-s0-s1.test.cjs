const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { SauConMuaEngine } = require('../web/js/sau-con-mua-engine.js');

const scenarioJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../plan/sau-con-mua/content/scenario.json'), 'utf8')
);

test('Subtask 2.2: Khởi tạo S0 -> START chuyển sang S1 với cue ground_crack', () => {
  const engine = new SauConMuaEngine(scenarioJson);
  assert.equal(engine.getState().stage, 'S0');
  
  engine.dispatch({ type: 'START' });
  const state = engine.getState();
  assert.equal(state.stage, 'S1');
  assert.ok(state.observed_cues.includes('ground_crack'));
});

test('Subtask 2.2: S1 chọn report_teacher an toàn sang S2, chọn approach_cue bị chặn', () => {
  const engine = new SauConMuaEngine(scenarioJson);
  engine.dispatch({ type: 'START' });

  // Chọn tiếp cận -> bị chặn
  const resBlocked = engine.dispatch({ type: 'CHOOSE', choice_id: 'approach_cue' });
  assert.equal(resBlocked.movement, 'blocked');
  assert.equal(engine.getState().stage, 'S1');
  assert.equal(engine.getState().support_by_decision.D1, true);

  // Chọn báo cô -> sang S2
  const resSafe = engine.dispatch({ type: 'CHOOSE', choice_id: 'report_teacher' });
  assert.equal(resSafe.movement, 'allowed');
  assert.equal(engine.getState().stage, 'S2');
  assert.equal(engine.getState().first_choice_by_decision.D1, 'approach_cue');
});
