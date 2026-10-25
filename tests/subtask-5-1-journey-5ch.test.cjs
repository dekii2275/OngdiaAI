const test = require('node:test');
const assert = require('node:assert/strict');
const J = require('../web/js/journey.js');

test('Subtask 5.1: journey.js keys hỗ trợ đầy đủ 5 chương', () => {
  assert.equal(J.keys.chapter01, 'ongdia.scene1.v1');
  assert.equal(J.keys.chapter02, 'ongdia.chapter02.v2');
  assert.equal(J.keys.chapter03, 'ongdia.chapter03.v1');
  assert.equal(J.keys.chapter04, 'ongdia.chapter04.v1');
  assert.equal(J.keys.chapter05, 'ongdia.chapter05.v1');
});

test('Subtask 5.1: getOverallProgress tính toán tiến độ tổng thể 5 chương', () => {
  assert.ok(typeof J.getOverallProgress === 'function', 'Phải có hàm getOverallProgress');

  const mockStorage = {
    'ongdia.scene1.v1': JSON.stringify({ Scene1Completed: true, started: true }),
    'ongdia.chapter02.v2': JSON.stringify({ complete: true, started: true }),
    'ongdia.chapter03.v1': JSON.stringify({ complete: false, started: true, solved: ['ridge_entry'] }),
  };

  const progress = J.getOverallProgress(mockStorage);
  assert.equal(progress.totalChapters, 5);
  assert.equal(progress.completedCount, 2);
  assert.equal(progress.currentChapter, 3);
  assert.ok(progress.percent >= 40);
});

test('Subtask 5.1: summary hỗ trợ tạo bản tóm tắt qua từng chương', () => {
  const originWithBear = { version: 1, id: 'test-1', hasBear: true, choices: {} };
  const originNoBear = { version: 1, id: 'test-2', hasBear: false, choices: { SafetyIntervention: true } };

  assert.ok(J.summary(originWithBear).includes('gấu'));
  assert.ok(J.summary(originNoBear).includes('lớp'));
});
