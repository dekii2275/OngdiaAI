const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ch04Data = require('../web/js/chapter04-data.js');
const ch04Puzzles = require('../web/js/chapter04-puzzles.js');

test('Subtask 3.1: Chapter04 data chứa đủ 4 scenes với cấu trúc hợp lệ', () => {
  const { scenes } = ch04Data;
  assert.ok(scenes.village_outskirts, 'Thiếu scene village_outskirts');
  assert.ok(scenes.isolation_post, 'Thiếu scene isolation_post');
  assert.ok(scenes.bamboo_bridge, 'Thiếu scene bamboo_bridge');
  assert.ok(scenes.safe_ascent, 'Thiếu scene safe_ascent');

  assert.equal(scenes.village_outskirts.links.includes('isolation_post'), true);
  assert.equal(scenes.isolation_post.links.includes('bamboo_bridge'), true);
  assert.equal(scenes.bamboo_bridge.links.includes('safe_ascent'), true);
});

test('Subtask 3.1: Chapter04 required clues và canTravel logic', () => {
  const state = ch04Data.initial();
  assert.equal(state.scene, 'village_outskirts');
  assert.equal(ch04Data.canTravel(state, 'isolation_post'), false, 'Chưa giải puzzle không thể đi tiếp');

  state.solved.push('village_outskirts');
  assert.equal(ch04Data.canTravel(state, 'isolation_post'), true, 'Đã giải puzzle village_outskirts thì được đi');

  // Đến isolation_post, chặn đi tiếp tới bamboo_bridge nếu chưa thuyết phục Minh
  state.scene = 'isolation_post';
  assert.equal(ch04Data.canTravel(state, 'bamboo_bridge'), false);
  state.solved.push('isolation_post');
  state.minhSaved = true;
  assert.equal(ch04Data.canTravel(state, 'bamboo_bridge'), true);
});

test('Subtask 3.1: Chapter04 Puzzles xác thực đáp án chính xác', () => {
  const { puzzles, correct } = ch04Puzzles;
  assert.ok(puzzles.village_outskirts, 'Thiếu puzzle village_outskirts');
  assert.ok(puzzles.isolation_post, 'Thiếu puzzle isolation_post');
  assert.ok(puzzles.bamboo_bridge, 'Thiếu puzzle bamboo_bridge');
  assert.ok(puzzles.safe_ascent, 'Thiếu puzzle safe_ascent');

  assert.equal(correct('isolation_post', puzzles.isolation_post.answer), true);
  assert.equal(correct('bamboo_bridge', puzzles.bamboo_bridge.answer), true);
});
