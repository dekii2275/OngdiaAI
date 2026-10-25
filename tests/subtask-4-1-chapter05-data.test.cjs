const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ch05Data = require('../web/js/chapter05-data.js');
const ch05Puzzles = require('../web/js/chapter05-puzzles.js');

test('Subtask 4.1: Chapter05 data chứa đủ 3 scenes với cấu trúc hợp lệ', () => {
  const { scenes } = ch05Data;
  assert.ok(scenes.summit_gate, 'Thiếu scene summit_gate');
  assert.ok(scenes.command_post, 'Thiếu scene command_post');
  assert.ok(scenes.safe_hall, 'Thiếu scene safe_hall');

  assert.equal(scenes.summit_gate.links.includes('command_post'), true);
  assert.equal(scenes.command_post.links.includes('safe_hall'), true);
});

test('Subtask 4.1: Chapter05 required clues và canTravel logic', () => {
  const state = ch05Data.initial();
  assert.equal(state.scene, 'summit_gate');
  assert.equal(ch05Data.canTravel(state, 'command_post'), false, 'Chưa giải puzzle cổng không thể vào');

  state.solved.push('summit_gate');
  assert.equal(ch05Data.canTravel(state, 'command_post'), true);

  state.scene = 'command_post';
  assert.equal(ch05Data.canTravel(state, 'safe_hall'), false);
  state.solved.push('command_post');
  assert.equal(ch05Data.canTravel(state, 'safe_hall'), true);
});

test('Subtask 4.1: Chapter05 Puzzles có bài trắc nghiệm tổng hợp 5 chương', () => {
  const { puzzles, correct } = ch05Puzzles;
  assert.ok(puzzles.summit_gate, 'Thiếu puzzle summit_gate');
  assert.ok(puzzles.command_post, 'Thiếu puzzle command_post');
  assert.ok(puzzles.safe_hall, 'Thiếu puzzle safe_hall');

  assert.equal(correct('summit_gate', puzzles.summit_gate.answer), true);
  assert.equal(correct('command_post', puzzles.command_post.answer), true);
  assert.equal(correct('safe_hall', puzzles.safe_hall.answer), true);
});
