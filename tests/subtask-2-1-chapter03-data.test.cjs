const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ch03Data = require('../web/js/chapter03-data.js');
const ch03Puzzles = require('../web/js/chapter03-puzzles.js');

test('Subtask 2.1: Chapter03 data chứa đủ 4 scenes với cấu trúc hợp lệ', () => {
  const { scenes } = ch03Data;
  assert.ok(scenes.ridge_entry, 'Thiếu scene ridge_entry');
  assert.ok(scenes.crack_zone, 'Thiếu scene crack_zone');
  assert.ok(scenes.mudflow_bend, 'Thiếu scene mudflow_bend');
  assert.ok(scenes.boulder_pass, 'Thiếu scene boulder_pass');

  assert.equal(scenes.ridge_entry.links.includes('crack_zone'), true);
  assert.equal(scenes.crack_zone.links.includes('mudflow_bend'), true);
  assert.equal(scenes.mudflow_bend.links.includes('boulder_pass'), true);
});

test('Subtask 2.1: Chapter03 required clues và canTravel logic', () => {
  const state = ch03Data.initial();
  assert.equal(state.scene, 'ridge_entry');
  assert.equal(ch03Data.canTravel(state, 'crack_zone'), false, 'Chưa giải puzzle không thể đi tiếp');

  state.solved.push('ridge_entry');
  assert.equal(ch03Data.canTravel(state, 'crack_zone'), true, 'Đã giải puzzle ridge_entry thì được đi');
});

test('Subtask 2.1: Chapter03 Puzzles xác thực đáp án chính xác', () => {
  const { puzzles, correct } = ch03Puzzles;
  assert.ok(puzzles.ridge_entry, 'Thiếu puzzle ridge_entry');
  assert.ok(puzzles.crack_zone, 'Thiếu puzzle crack_zone');
  assert.ok(puzzles.mudflow_bend, 'Thiếu puzzle mudflow_bend');
  assert.ok(puzzles.boulder_pass, 'Thiếu puzzle boulder_pass');

  // Kiểm tra đáp án chuẩn cho puzzle boulder_pass
  assert.equal(correct('boulder_pass', puzzles.boulder_pass.answer), true);
  assert.equal(correct('boulder_pass', ['wrong', 'order']), false);
});
