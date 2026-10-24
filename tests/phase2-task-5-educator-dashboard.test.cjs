const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { generateEducatorReport } = require('../web/js/sau-con-mua-telemetry.js');

test('Phase 2 Task 5: generateEducatorReport tính toán đầy đủ 4 chỉ số LO1-LO4 và thời lượng phản hồi', () => {
  assert.equal(typeof generateEducatorReport, 'function', 'generateEducatorReport phải là một function');

  const sampleEvents = [
    { type: 'stage_entered', stage: 'S0', elapsed_ms: 100 },
    { type: 'choice_selected', decision_id: 'D1', elapsed_ms: 2500, payload: { choice_id: 'report_teacher', attempt: 1 } },
    { type: 'choice_selected', decision_id: 'D2', elapsed_ms: 5000, payload: { choice_id: 'describe_crack', attempt: 1 } },
    { type: 'choice_selected', decision_id: 'D3', elapsed_ms: 8000, payload: { choice_id: 'continue_with_teacher', attempt: 1 } },
    { type: 'choice_selected', decision_id: 'D4', elapsed_ms: 11000, payload: { choice_id: 'guided_route', attempt: 1 } },
    { type: 'session_completed', elapsed_ms: 13000, payload: {} }
  ];

  const report = generateEducatorReport(sampleEvents);
  assert.equal(report.status, 'completed');
  assert.ok(report.totalDurationMs >= 12000);
  assert.equal(report.objectives.LO1.achieved, true);
  assert.equal(report.objectives.LO2.achieved, true);
  assert.equal(report.objectives.LO3.achieved, true);
  assert.equal(report.objectives.LO4.achieved, true);
  assert.equal(report.summaryScore, '8/8');
});

test('Phase 2 Task 5: HTML phải có modal bảng điều khiển giáo viên và nút xuất telemetry JSON', () => {
  const html = fs.readFileSync(path.resolve(__dirname, '../web/sau-con-mua.html'), 'utf8');
  assert.ok(html.includes('id="educator-modal"'), 'Thiếu id="educator-modal"');
  assert.ok(html.includes('id="btn-open-educator"'), 'Thiếu nút Mở bảng đánh giá sư phạm');
  assert.ok(html.includes('id="btn-export-telemetry"'), 'Thiếu nút Xuất dữ liệu JSON');
});
