// tests/full-5-chapters-regression.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Core Modules
const J = require('../web/js/journey.js');
const M = require('../web/js/model.js');
const C2 = require('../web/js/chapter02-data.js');
const C3 = require('../web/js/chapter03-data.js');
const C4 = require('../web/js/chapter04-data.js');
const C5 = require('../web/js/chapter05-data.js');
const VoiceTTS = require('../web/js/voice-tts.js');

// AI Backend Handlers
const {
  handleChapterDebrief,
  handleBridgeBlueprint,
  handleIncidentDispatch,
  handleMedicalTriage
} = require('../server/debrief-ai-handler.js');

test('Regression Suite 1: Luồng tích hợp toàn diện 5 chương (Ch1 -> Ch2 -> Ch3 -> Ch4 -> Ch5)', () => {
  // 1.1 Khởi tạo và hoàn thành Chương 1
  const ch1Initial = M.fresh();
  assert.equal(ch1Initial.phase, 'intro');
  assert.equal(ch1Initial.Scene1Completed, false);

  const ch1Completed = {
    ...ch1Initial,
    started: true,
    phase: 'complete',
    Scene1Completed: true,
    runId: 'regression-run-001',
    LockerOpened: true,
    RouteUnderstood: true,
    settings: { sound: false, reducedMotion: true, showSpots: false }
  };

  // 1.2 Đóng gói bàn giao sang Chương 2 qua J.origin & J.attach
  const origin = J.origin(ch1Completed);
  assert.ok(origin, 'Chương 1 hoàn thành phải tạo được origin handoff');
  assert.equal(origin.hasBear, true);
  assert.equal(origin.id, 'regression-run-001');

  // 1.3 Chương 2 lifecycle
  const ch2State = J.attach(C2.initial(), origin);
  assert.equal(ch2State.scene, 'gate');
  assert.equal(ch2State.complete, false);
  assert.equal(ch2State.origin.hasBear, true);
  ch2State.solved.push('gate');
  assert.ok(C2.canTravel(ch2State, 'junction'));
  ch2State.complete = true;

  // 1.4 Chương 3 lifecycle & Clues 10/10
  const ch3State = C3.initial();
  assert.equal(ch3State.scene, 'ridge_entry');
  const allCh3Clues = [
    'radio-crack', 'bamboo_pole', 'steep_slope', 'fresh_fissure',
    'mud_stream', 'drain_clog', 'sound_rumble', 'pebble_slide',
    'blocked_path', 'detour_ridge'
  ];
  allCh3Clues.forEach(c => ch3State.clues.push(c));
  assert.equal(ch3State.clues.length, 10, 'Chương 3 phải có đủ 10 manh mối bao gồm blocked_path');
  ch3State.solved.push('ridge_entry', 'crack_zone', 'mudflow_bend', 'boulder_pass');
  ch3State.complete = true;

  // 1.5 Chương 4 lifecycle
  const ch4State = C4.initial();
  assert.equal(ch4State.scene, 'village_outskirts');
  ch4State.solved.push('village_outskirts');
  assert.ok(C4.canTravel(ch4State, 'isolation_post'));
  ch4State.scene = 'isolation_post';
  ch4State.solved.push('isolation_post');
  ch4State.minhSaved = true;
  assert.ok(C4.canTravel(ch4State, 'bamboo_bridge'));
  ch4State.complete = true;

  // 1.6 Chương 5 lifecycle & certPraise restore
  const ch5State = C5.initial();
  assert.equal(ch5State.scene, 'summit_gate');
  ch5State.solved.push('summit_gate', 'command_post', 'safe_hall');
  ch5State.complete = true;
  ch5State.certPraise = 'Tuyên dương tinh thần dũng cảm, quyết đoán và kỷ luật cứu nạn cao nhất!';

  const rawCh5 = JSON.parse(JSON.stringify(ch5State));
  const restoredCh5 = C5.restore(rawCh5);
  assert.equal(restoredCh5.complete, true);
  assert.equal(restoredCh5.certPraise, 'Tuyên dương tinh thần dũng cảm, quyết đoán và kỷ luật cứu nạn cao nhất!');

  // 1.7 Báo cáo tiến độ tổng thể 5 chương
  const mockStorage = {
    [J.keys.chapter01]: JSON.stringify(ch1Completed),
    [J.keys.chapter02]: JSON.stringify(ch2State),
    [J.keys.chapter03]: JSON.stringify(ch3State),
    [J.keys.chapter04]: JSON.stringify(ch4State),
    [J.keys.chapter05]: JSON.stringify(restoredCh5)
  };

  const progress = J.getOverallProgress(mockStorage);
  assert.equal(progress.totalChapters, 5);
  assert.equal(progress.completedCount, 5);
  assert.equal(progress.percent, 100, 'Cả 5 chương hoàn thành đạt 100%');
});

test('Regression Suite 2: Cả 5 cổng Khảo hạch AI (Debrief Gates Ch1-Ch5) phản hồi chuẩn xác', async () => {
  // Gate 1: Chương 1
  const d1 = await handleChapterDebrief({
    chapter: 1,
    question: 'Khi có chuông báo động sơ tán khẩn cấp, thái độ đúng đắn với tài sản để quên là gì?',
    playerAnswer: 'Tính mạng là ưu tiên số một, không quay lại lấy đồ để quên, tuân thủ kỷ luật di tản theo hướng dẫn của cô giáo.'
  });
  assert.equal(d1.success, true);
  assert.equal(d1.passed, true);
  assert.ok(d1.feedback && d1.feedback.length > 5);

  // Gate 2: Chương 2
  const d2 = await handleChapterDebrief({
    chapter: 2,
    question: 'Tại sao không được mạo hiểm lội qua suối khi nước đã dâng cao ngập đến đùi và chảy xiết?',
    playerAnswer: 'Dòng nước xiết cuốn trôi sỏi cát dưới chân gây mất thăng bằng ngã chìm ngay lập tức, cần dùng gậy thăm dò hoặc tìm lối đi vòng gờ đá an toàn.'
  });
  assert.equal(d2.success, true);
  assert.equal(d2.passed, true);
  assert.ok(d2.feedback && d2.feedback.length > 5);

  // Gate 3: Chương 3
  const d3 = await handleChapterDebrief({
    chapter: 3,
    question: 'Dấu hiệu nứt đất hình cánh cung và đá rơi trên sườn dốc cảnh báo điều gì?',
    playerAnswer: 'Cảnh báo nguy cơ sạt lở cấp tốc quy mô lớn, phải lập tức phát báo động bằng bộ đàm và sơ tán khẩn cấp theo sống đá gốc ổn định.'
  });
  assert.equal(d3.success, true);
  assert.equal(d3.passed, true);
  assert.ok(d3.feedback && d3.feedback.length > 5);

  // Gate 4: Chương 4
  const d4 = await handleChapterDebrief({
    chapter: 4,
    question: 'Nguyên tắc an toàn then chốt khi bước qua cầu tre dã chiến giữa dòng nước xoáy là gì?',
    playerAnswer: 'Bỏ lại xe đạp nặng, một tay bám chắc dây vịn, chân đi ngang từng bước theo nhịp rung, luôn giữ trọng tâm cơ thể cân bằng trong vùng an toàn.'
  });
  assert.equal(d4.success, true);
  assert.equal(d4.passed, true);
  assert.ok(d4.feedback && d4.feedback.length > 5);

  // Gate 5: Chương 5 - Khảo Hạch Tốt Nghiệp Toàn Khóa
  const d5 = await handleChapterDebrief({
    chapter: 5,
    question: 'Bài học sống còn và trách nhiệm của người đội viên cứu hộ khi đối mặt thiên tai thảm khốc là gì?',
    playerAnswer: 'Bảo vệ tính mạng con người là tối thượng, giữ vững kỷ luật tập thể, chia sẻ hơi ấm và sơ cứu y tế đúng khoa học, giữ vững thông tin liên lạc thông suốt.'
  });
  assert.equal(d5.success, true);
  assert.equal(d5.passed, true);
  assert.ok(d5.feedback && d5.feedback.length > 5);

  // Negative validation: Câu trả lời liều lĩnh bị từ chối
  const badAnswer = await handleChapterDebrief({
    chapter: 1,
    question: 'Hành vi thoát nạn',
    playerAnswer: 'Quay lại tìm tiền bạc và trang sức trong cặp sách'
  });
  assert.equal(badAnswer.success, true);
  assert.equal(badAnswer.passed, false);
});

test('Regression Suite 3: Tactical Bridge Blueprint Generator phân tích phác đồ đa phân khu', async () => {
  const result = await handleBridgeBlueprint({
    inspection: [
      'Mối mộc dây mây mố cầu bờ gần bị tưa rách',
      'Đoạn giữa nhịp tre trơn trượt võng sâu 30cm',
      'Mạn phải có xoáy nước ngầm xói lở mố đá bờ xa'
    ]
  });

  assert.equal(result.success, true);
  assert.ok(Array.isArray(result.zones));
  assert.ok(result.zones.length >= 3, 'Phải lập phác đồ ít nhất 3 phân khu cầu');

  result.zones.forEach((zone, idx) => {
    assert.ok(zone.zoneId || zone.id || zone.name, `Phân khu ${idx} phải có định danh`);
    assert.ok(typeof (zone.advice || zone.risk || zone.status || zone.caution) !== 'undefined', `Phân khu ${idx} phải có chỉ dẫn an toàn`);
  });

  assert.ok(typeof result.tacticalNote === 'string' && result.tacticalNote.length > 10);
});

test('Regression Suite 4: Incident Dispatcher biên tập bức điện quân báo cứu nạn gửi Huyện', async () => {
  const hazards = [
    'Sạt lở taluy âm dài 40m tại khúc cua dốc Mạ',
    'Cột hạ thế đổ gãy đè ngang dòng suối cạn',
    'Xóm Trại 12 hộ bị cô lập hoàn toàn do đứt gãy cầu gỗ'
  ];

  const dispatch = await handleIncidentDispatch({ hazards });
  assert.equal(dispatch.success, true);
  assert.ok(typeof dispatch.dispatchCode === 'string' && dispatch.dispatchCode.length >= 3, 'Phải có mã điện văn');
  assert.ok(typeof dispatch.reportText === 'string' && dispatch.reportText.length > 25, 'Phải có nội dung điện văn chi tiết');
});

test('Regression Suite 5: Medical Crisis Triage Solver phản biện y tế đủ 3 ca sau bão', async () => {
  // Ca 1: Hạ thân nhiệt (Hypothermia)
  const hypoGood = await handleMedicalTriage({
    caseId: 'hypothermia',
    solutionText: 'Lau khô người, thay quần áo khô, đắp nhiều lớp chăn ấm, cho uống nước đường gừng ấm, sưởi ấm từ từ.'
  });
  assert.equal(hypoGood.success, true);
  assert.equal(hypoGood.approved, true);

  const hypoBad = await handleMedicalTriage({
    caseId: 'hypothermia',
    solutionText: 'Đốt lửa to hơ tay chân sát than hồng thật nóng, cạo gió thật mạnh.'
  });
  assert.equal(hypoBad.success, true);
  assert.equal(hypoBad.approved, false);

  // Ca 2: Vết thương hở / Rách mô sâu dính bùn đất (Wound / Laceration)
  const woundGood = await handleMedicalTriage({
    caseId: 'laceration',
    solutionText: 'Rửa sạch vết thương bằng nước muối sinh lý hoặc nước sạch, sát trùng bằng povidone iodine, băng ép gạc vô khuẩn cầm máu.'
  });
  assert.equal(woundGood.success, true);
  assert.equal(woundGood.approved, true);

  const woundBad = await handleMedicalTriage({
    caseId: 'laceration',
    solutionText: 'Lấy bùn đất và lá cây rừng giã nát đắp bịt kín miệng vết thương.'
  });
  assert.equal(woundBad.success, true);
  assert.equal(woundBad.approved, false);

  // Ca 3: Nguy cơ ngạt khí CO do đốt than sưởi ấm trong phòng kín (CO Hazard)
  const coGood = await handleMedicalTriage({
    caseId: 'co_hazard',
    solutionText: 'Mở toang cửa sổ và cửa chính thông gió ngay lập tức, dập tắt bếp than và di chuyển bếp ra hiên ngoài thoáng khí.'
  });
  assert.equal(coGood.success, true);
  assert.equal(coGood.approved, true);

  const coBad = await handleMedicalTriage({
    caseId: 'co_hazard',
    solutionText: 'Đóng chặt hết các khe cửa sổ để giữ nhiệt độ ấm trong phòng không cho gió lùa.'
  });
  assert.equal(coBad.success, true);
  assert.equal(coBad.approved, false);
});

test('Regression Suite 6: VoiceTTS Engine xuất đủ 6 hồ sơ nhân vật và giao diện điều khiển chuẩn', () => {
  assert.ok(VoiceTTS.VOICE_PROFILES, 'VoiceTTS phải xuất VOICE_PROFILES');
  const expectedCharacters = ['ban', 'thao', 'manh', 'minh_anh', 'minh', 'duyen'];
  expectedCharacters.forEach((char) => {
    const profile = VoiceTTS.VOICE_PROFILES[char];
    assert.ok(profile, `Thiếu profile cho nhân vật ${char}`);
    assert.ok(Number.isFinite(profile.rate) && profile.rate > 0, `Rate của ${char} không hợp lệ`);
    assert.ok(Number.isFinite(profile.pitch) && profile.pitch > 0, `Pitch của ${char} không hợp lệ`);
    assert.ok(typeof profile.name === 'string' && profile.name.length > 0, `Name của ${char} không hợp lệ`);
  });

  assert.equal(typeof VoiceTTS.speak, 'function');
  assert.equal(typeof VoiceTTS.stop, 'function');
  assert.equal(typeof VoiceTTS.toggle, 'function');
  assert.equal(typeof VoiceTTS.isEnabled, 'function');
});

test('Regression Suite 7: Kiểm tra tích hợp mã nguồn các điểm Polish & Cleanup', () => {
  // Chapter 3: blocked_path trong s.clues
  const c3Code = fs.readFileSync(path.resolve(__dirname, '../web/js/chapter03.js'), 'utf8');
  assert.ok(
    c3Code.includes("s.clues.push('blocked_path')"),
    'chapter03.js phải bổ sung blocked_path vào s.clues khi can ngăn Bác Mạnh'
  );

  // Chapter 4: cleanup() khi bấm close-bridge-game
  const c4Code = fs.readFileSync(path.resolve(__dirname, '../web/js/chapter04.js'), 'utf8');
  assert.ok(
    c4Code.includes("cleanup();\r\n      $('modal').hidden = true;") ||
    c4Code.includes("cleanup();\n      $('modal').hidden = true;"),
    'chapter04.js phải gọi cleanup() khi đóng close-bridge-game'
  );

  // Chapter 5: certPraise được lưu giữ trong restore()
  const c5DataCode = fs.readFileSync(path.resolve(__dirname, '../web/js/chapter05-data.js'), 'utf8');
  assert.ok(
    c5DataCode.includes('s.certPraise = typeof raw.certPraise === \'string\' ? raw.certPraise : null;'),
    'chapter05-data.js phải phục hồi certPraise từ dữ liệu lưu trữ'
  );
});
