const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { SauConMuaEngine } = require('../web/js/sau-con-mua-engine.js');
const { validateNpcResponse } = require('../server/ai-bridge.js');

const scenarioJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../plan/sau-con-mua/content/scenario.json'), 'utf8')
);

test('T01: Báo cô ngay không mở cue phụ vẫn sang S2 đầy đủ', () => {
  const engine = new SauConMuaEngine(scenarioJson);
  engine.dispatch({ type: 'START' });
  engine.dispatch({ type: 'CHOOSE', choice_id: 'report_teacher' });
  assert.equal(engine.getState().stage, 'S2');
});

test('T02: Chọn đến gần 3 lần bị cản cả 3 lần', () => {
  const engine = new SauConMuaEngine(scenarioJson);
  engine.dispatch({ type: 'START' });
  for (let i = 0; i < 3; i++) {
    const res = engine.dispatch({ type: 'CHOOSE', choice_id: 'approach_cue' });
    assert.equal(res.movement, 'blocked');
    assert.equal(engine.getState().stage, 'S1');
  }
});

test('T03: D2 chọn chưa biết, tiếp tục chưa biết vẫn sang S3', () => {
  const engine = new SauConMuaEngine(scenarioJson);
  engine.dispatch({ type: 'START' });
  engine.dispatch({ type: 'CHOOSE', choice_id: 'report_teacher' });
  engine.dispatch({ type: 'CHOOSE', choice_id: 'need_help_describing' });
  engine.dispatch({ type: 'CHOOSE', choice_id: 'still_unsure' });
  assert.equal(engine.getState().stage, 'S3');
});

test('T04: D3 chọn nhờ cô giúp Minh', () => {
  const engine = new SauConMuaEngine(scenarioJson);
  engine.dispatch({ type: 'START' });
  engine.dispatch({ type: 'CHOOSE', choice_id: 'report_teacher' });
  engine.dispatch({ type: 'CHOOSE', choice_id: 'describe_crack' });
  engine.dispatch({ type: 'CHOOSE', choice_id: 'ask_teacher' });
  assert.equal(engine.getState().minh_resolved, true);
});

test('T05: D3 quay lại bị chặn, sau đó chọn đi cùng cô', () => {
  const engine = new SauConMuaEngine(scenarioJson);
  engine.dispatch({ type: 'START' });
  engine.dispatch({ type: 'CHOOSE', choice_id: 'report_teacher' });
  engine.dispatch({ type: 'CHOOSE', choice_id: 'describe_crack' });
  const bRes = engine.dispatch({ type: 'CHOOSE', choice_id: 'return_for_drawing' });
  assert.equal(bRes.movement, 'blocked');
  engine.dispatch({ type: 'CHOOSE', choice_id: 'continue_with_teacher' });
  assert.equal(engine.getState().minh_resolved, true);
});

test('T06: D4 chọn lối tắt bị chặn, chọn lối cô chỉ sang S5', () => {
  const engine = new SauConMuaEngine(scenarioJson);
  engine.dispatch({ type: 'START' });
  engine.dispatch({ type: 'CHOOSE', choice_id: 'report_teacher' });
  engine.dispatch({ type: 'CHOOSE', choice_id: 'describe_crack' });
  engine.dispatch({ type: 'CHOOSE', choice_id: 'continue_with_teacher' });
  const bRes = engine.dispatch({ type: 'CHOOSE', choice_id: 'closed_shortcut' });
  assert.equal(bRes.movement, 'blocked');
  engine.dispatch({ type: 'CHOOSE', choice_id: 'guided_route' });
  assert.equal(engine.getState().stage, 'S5');
});

test('T07: Double click trùng choice không làm sai lệch stage', () => {
  const engine = new SauConMuaEngine(scenarioJson);
  engine.dispatch({ type: 'START' });
  engine.dispatch({ type: 'CHOOSE', choice_id: 'report_teacher' });
  const stage = engine.getState().stage;
  engine.dispatch({ type: 'CHOOSE', choice_id: 'report_teacher' });
  assert.equal(engine.getState().stage, stage);
});

test('T08: AI timeout hoặc sai schema dùng fallback minh_accept an toàn', () => {
  const bad = validateNpcResponse({ reply_id: 'unknown' }, 'req', 1);
  assert.equal(bad.reply_id, 'minh_accept');
});
