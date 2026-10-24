const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateRubric } = require('../web/js/sau-con-mua-telemetry.js');

test('Subtask 5.2: Đánh giá đúng 3 phiên mẫu chuẩn sư phạm: 8 điểm, 7 điểm, 6 điểm', () => {
  // Phiên 1: Độc lập hoàn toàn không hint -> 8đ
  const p1 = [
    { type: 'choice_selected', decision_id: 'D1', payload: { choice_id: 'report_teacher', attempt: 1, support_before_choice: 'none' } },
    { type: 'choice_selected', decision_id: 'D2', payload: { choice_id: 'describe_crack', attempt: 1, support_before_choice: 'none' } },
    { type: 'choice_selected', decision_id: 'D3', payload: { choice_id: 'continue_with_teacher', attempt: 1, support_before_choice: 'none' } },
    { type: 'choice_selected', decision_id: 'D4', payload: { choice_id: 'guided_route', attempt: 1, support_before_choice: 'none' } },
    { type: 'session_completed', payload: {} }
  ];
  const r1 = evaluateRubric(p1);
  assert.equal(r1.totalScore, 8);
  assert.equal(r1.childCards.tell_adult, true);
  assert.equal(r1.childCards.safety_first, true);
  assert.equal(r1.childCards.stay_with_group, true);

  // Phiên 2: Báo cô sớm, có hỗ trợ diễn đạt ở D2 -> 7đ
  const p2 = [
    { type: 'choice_selected', decision_id: 'D1', payload: { choice_id: 'report_teacher', attempt: 1, support_before_choice: 'none' } },
    { type: 'choice_selected', decision_id: 'D2', payload: { choice_id: 'need_help_describing', attempt: 1, support_before_choice: 'hint' } },
    { type: 'choice_selected', decision_id: 'D3', payload: { choice_id: 'continue_with_teacher', attempt: 1, support_before_choice: 'none' } },
    { type: 'choice_selected', decision_id: 'D4', payload: { choice_id: 'guided_route', attempt: 1, support_before_choice: 'none' } },
    { type: 'session_completed', payload: {} }
  ];
  assert.equal(evaluateRubric(p2).totalScore, 7);

  // Phiên 3: Ban đầu muốn đến gần D1, D3 muốn quay lại sau đó sửa -> 6đ
  const p3 = [
    { type: 'choice_selected', decision_id: 'D1', payload: { choice_id: 'approach_cue', attempt: 1, support_before_choice: 'none' } },
    { type: 'choice_selected', decision_id: 'D1', payload: { choice_id: 'report_teacher', attempt: 2, support_before_choice: 'corrective' } },
    { type: 'choice_selected', decision_id: 'D2', payload: { choice_id: 'describe_crack', attempt: 1, support_before_choice: 'none' } },
    { type: 'choice_selected', decision_id: 'D3', payload: { choice_id: 'return_for_drawing', attempt: 1, support_before_choice: 'none' } },
    { type: 'choice_selected', decision_id: 'D3', payload: { choice_id: 'continue_with_teacher', attempt: 2, support_before_choice: 'corrective' } },
    { type: 'choice_selected', decision_id: 'D4', payload: { choice_id: 'guided_route', attempt: 1, support_before_choice: 'none' } },
    { type: 'session_completed', payload: {} }
  ];
  assert.equal(evaluateRubric(p3).totalScore, 6);
});
