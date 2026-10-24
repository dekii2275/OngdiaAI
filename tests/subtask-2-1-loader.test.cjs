const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadAndValidateScenario } = require('../web/js/sau-con-mua-loader.js');

test('Subtask 2.1: Loader phải nạp và xác nhận scenario.json đầy đủ các thành phần bắt buộc', () => {
  const rawJson = fs.readFileSync(path.resolve(__dirname, '../plan/sau-con-mua/content/scenario.json'), 'utf8');
  const scenario = loadAndValidateScenario(rawJson);

  assert.equal(scenario.id, 'sau_con_mua_01');
  assert.equal(scenario.stages.length >= 6, true, 'Kịch bản phải có tối thiểu 6 stages (S0-S5, END)');
  assert.ok(scenario.cues.find(c => c.id === 'ground_crack'), 'Thiếu cue ground_crack');
  assert.ok(scenario.recap.find(r => r.id === 'R1'), 'Thiếu recap R1');
});
