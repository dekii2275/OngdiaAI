const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { 
  handleChapterDebrief, 
  handleBridgeBlueprint, 
  handleIncidentDispatch, 
  handleMedicalTriage 
} = require('../server/debrief-ai-handler.js');

test('Task 2: handleChapterDebrief đánh giá câu trả lời đúng trọng tâm là PASS', async () => {
  const res = await handleChapterDebrief({
    chapter: 1,
    question: 'Khi có báo động sơ tán khẩn cấp, thái độ đúng đắn đối với đồ đạc để quên là gì?',
    playerAnswer: 'Tính mạng là quan trọng nhất, không quay lại lấy đồ để quên, đi theo cô giáo ngay lập tức.'
  });
  assert.equal(res.success, true);
  assert.equal(res.passed, true);
  assert.ok(typeof res.feedback === 'string' && res.feedback.length > 5);
});

test('Task 2: handleChapterDebrief từ chối câu trả lời nguy hiểm hoặc quay lại lấy tài sản', async () => {
  const res = await handleChapterDebrief({
    chapter: 1,
    question: 'Khi có báo động sơ tán khẩn cấp, thái độ đúng đắn đối với đồ đạc để quên là gì?',
    playerAnswer: 'Quay lại lớp học để tìm balo và điện thoại vì đó là đồ đắt tiền.'
  });
  assert.equal(res.success, true);
  assert.equal(res.passed, false);
  assert.ok(typeof res.feedback === 'string' && res.feedback.length > 5);
});

test('Task 2: handleChapterDebrief xử lý câu trả lời quá ngắn', async () => {
  const res = await handleChapterDebrief({
    chapter: 1,
    question: 'Nguyên tắc an toàn',
    playerAnswer: 'ko'
  });
  assert.equal(res.success, true);
  assert.equal(res.passed, false);
  assert.ok(res.feedback.length > 5);
});

test('Task 2: handleBridgeBlueprint phân tích 3 điểm kiểm tra thành phác đồ qua cầu', async () => {
  const res = await handleBridgeBlueprint({
    inspection: ['Mối buộc tre lỏng', 'Thân tre đực rêu trơn', 'Dòng xoáy mạn phải']
  });
  assert.equal(res.success, true);
  assert.ok(Array.isArray(res.zones) && res.zones.length >= 3);
  assert.ok(typeof res.tacticalNote === 'string' && res.tacticalNote.length > 10);
});

test('Task 2: handleBridgeBlueprint chấp nhận tham số inspectionData', async () => {
  const res = await handleBridgeBlueprint({
    inspectionData: ['Mối tre đầu cầu', 'Đoạn giữa nhịp rung', 'Mố đá bờ đối diện']
  });
  assert.equal(res.success, true);
  assert.ok(Array.isArray(res.zones) && res.zones.length >= 3);
});

test('Task 2: handleIncidentDispatch biên tập bức điện cứu hộ chuẩn quân báo', async () => {
  const res = await handleIncidentDispatch({
    hazards: ['Sạt lở taluy km32', 'Cột điện gãy suối cạn', 'Ngập úng xóm ngoài']
  });
  assert.equal(res.success, true);
  assert.ok(typeof res.dispatchCode === 'string' && res.dispatchCode.length > 0);
  assert.ok(typeof res.reportText === 'string' && res.reportText.length > 20);
});

test('Task 2: handleMedicalTriage phản biện ca hạ thân nhiệt và ngạt khí CO', async () => {
  const resHypothermia = await handleMedicalTriage({
    caseId: 'hypothermia',
    solutionText: 'Lau khô, thay quần áo khô, ủ ấm ngực bụng từ từ bằng chăn ấm, không hơ trực tiếp vào lửa nóng'
  });
  assert.equal(resHypothermia.success, true);
  assert.equal(resHypothermia.approved, true);
  assert.ok(typeof resHypothermia.critique === 'string' && resHypothermia.critique.length > 5);

  const resStove = await handleMedicalTriage({
    caseId: 'co_hazard',
    solutionText: 'Mở toang cửa sổ thông gió, dập tắt bếp than và mang ra ngoài hiên thoáng khí'
  });
  assert.equal(resStove.success, true);
  assert.equal(resStove.approved, true);
  assert.ok(typeof resStove.critique === 'string' && resStove.critique.length > 5);
});

test('Task 2: handleMedicalTriage từ chối giải pháp sơ cứu sai phương pháp y tế', async () => {
  const resBadHypo = await handleMedicalTriage({
    caseId: 'hypothermia',
    solutionText: 'Đưa ngay vào sát bếp lửa đỏ hơ cho nóng thật nhanh, xoa bóp thật mạnh'
  });
  assert.equal(resBadHypo.success, true);
  assert.equal(resBadHypo.approved, false);
  assert.ok(typeof resBadHypo.critique === 'string' && resBadHypo.critique.length > 5);
});

test('Task 2: handleMedicalTriage hỗ trợ ca rách vết thương dính bùn đất (laceration)', async () => {
  const resWound = await handleMedicalTriage({
    caseId: 'laceration',
    solutionText: 'Rửa sạch bằng nước muối sinh lý, sát trùng bằng cồn đỏ povidone và băng ép gạc vô trùng cầm máu'
  });
  assert.equal(resWound.success, true);
  assert.equal(resWound.approved, true);

  const resBadWound = await handleMedicalTriage({
    caseId: 'laceration',
    solutionText: 'Hái lá rừng nhai nhỏ đắp lá lên vết thương rồi bịt bùn lại'
  });
  assert.equal(resBadWound.success, true);
  assert.equal(resBadWound.approved, false);
});

test('Task 2: server.js khai báo và định tuyến 4 endpoints mới', () => {
  const serverCode = fs.readFileSync(path.resolve(__dirname, '../server.js'), 'utf8');
  assert.ok(serverCode.includes('/api/debrief/evaluate'), 'Phải có endpoint /api/debrief/evaluate');
  assert.ok(serverCode.includes('/api/tactical/bridge-blueprint'), 'Phải có endpoint /api/tactical/bridge-blueprint');
  assert.ok(serverCode.includes('/api/tactical/incident-dispatch'), 'Phải có endpoint /api/tactical/incident-dispatch');
  assert.ok(serverCode.includes('/api/medical/triage-solver'), 'Phải có endpoint /api/medical/triage-solver');
  assert.ok(serverCode.includes('handleChapterDebrief'), 'Phải import và dùng handleChapterDebrief');
  assert.ok(serverCode.includes('handleBridgeBlueprint'), 'Phải import và dùng handleBridgeBlueprint');
  assert.ok(serverCode.includes('handleIncidentDispatch'), 'Phải import và dùng handleIncidentDispatch');
  assert.ok(serverCode.includes('handleMedicalTriage'), 'Phải import và dùng handleMedicalTriage');
});
