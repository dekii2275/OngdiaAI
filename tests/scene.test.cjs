const test = require('node:test');
const assert = require('node:assert/strict');
const { fresh, step, restore, achievements } = require('../web/js/model.js');
function puzzle() { return step(step(fresh(), { type: 'START' }), { type: 'INITIAL_CHOICE', leave: false }); }
function submit(s, code) {
  s = step(s, { type: 'END_DIALOGUE' });
  for (const value of code) s = step(s, { type: 'DIRECTION', value });
  return step(s, { type: 'SUBMIT' });
}
test('success after observing route preserves all narrative flags and restores partial input', () => {
  let s = step(puzzle(), { type: 'CLUE' });
  s = step(s, { type: 'ROUTE_START' });
  s = step(s, { type: 'ROUTE_SEGMENT', index: 2 });
  assert.equal(s.routeProgress, 0, 'route must be read from the beginning');
  for (let index = 0; index < 4; index++) s = step(s, { type: 'ROUTE_SEGMENT', index });
  assert.equal(s.RouteUnderstood, true);
  s = step(s, { type: 'DIRECTION', value: '↑' });
  s = step(s, { type: 'DIRECTION', value: '→' });
  s = restore(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(s.lockInput, ['↑', '→']);
  s = submit(s, ['↑', '→']);
  assert.equal(s.LockerOpened, true); assert.equal(s.SafeTime, 3);
  assert.equal(s.LockerAttempt, 1); assert.deepEqual(s.inventory, ['bear']);
  assert.ok(achievements(s).includes('Giải mã'));
  assert.ok(achievements(s).includes('Nhà quan sát'));
  assert.ok(achievements(s).includes('Không thử đại'));
});
test('three wrong submissions force evacuation and permanently disable the puzzle', () => {
  let s = puzzle();
  for (let attempt = 0; attempt < 3; attempt++) s = submit(s, ['↓', '↓', '↓', '↓']);
  assert.equal(s.SafeTime, 0); assert.equal(s.phase, 'teacher');
  assert.equal(s.SafetyIntervention, true); assert.equal(s.EvacuatedWithoutBear, true);
  assert.equal(s.LockerOpened, false); assert.equal(s.dialogue.id, 'intervention');
  s = submit(s, ['↑', '→', '↑', '→']);
  assert.equal(s.LockerOpened, false); assert.equal(s.LockerAttempt, 3);
  assert.equal(s.SafeTime, 0);
});
test('leaving at one unit is a positive safety ending and can finish without bear', () => {
  let s = puzzle(); s = submit(s, ['←', '←', '←', '←']); s = submit(s, ['←', '←', '←', '←']);
  s = step(s, { type: 'LEAVE' });
  assert.equal(s.LeftAtLowTime, true); assert.equal(s.SafeTime, 1);
  assert.ok(achievements(s).includes('An toàn trước tiên'));
  s = step(s, { type: 'HALLWAY' }); s = step(s, { type: 'END_DIALOGUE' });
  for (let i = 0; i < 3; i++) { s = step(s, { type: 'FOLLOW' }); s = step(s, { type: 'END_DIALOGUE' }); }
  s = step(s, { type: 'COMPLETE' });
  assert.equal(s.Scene1Completed, true); assert.equal(s.phase, 'complete');
  assert.equal(restore(s).EvacuatedWithoutBear, true);
});
test('short entries do not spend time, early guesses lose achievement, and no elapsed countdown exists', () => {
  let s = puzzle(); s = step(s, { type: 'DIRECTION', value: '↑' }); s = step(s, { type: 'SUBMIT' });
  assert.equal(s.LockerAttempt, 0); assert.equal(s.SafeTime, 3);
  s = step(s, { type: 'CLEAR' }); s = submit(s, ['↑', '→', '↑', '→']);
  assert.equal(s.LockerOpened, true); assert.equal(s.TriedBeforeClue, true);
  assert.ok(!achievements(s).includes('Không thử đại'));
  const waiting = step(puzzle(), { type: 'ELAPSED', value: 3600 });
  assert.equal(waiting.SafeTime, 3);
});
test('save validation rejects corrupt format, clamps malformed values, and keeps hallway constraints', () => {
  assert.equal(restore({ version: 2 }), null);
  let s = restore({ ...puzzle(), SafeTime: -8, HintLevel: 88, inventory: ['injected'], lockInput: ['garbage', '↑'] });
  assert.equal(s.SafeTime, 0); assert.equal(s.HintLevel, 4); assert.deepEqual(s.inventory, []);
  assert.deepEqual(s.lockInput, ['↑']);
  s = step(puzzle(), { type: 'HALLWAY' });
  const position = { ...s.player };
  s = step(s, { type: 'MOVE', x: -50, y: -50 }); assert.deepEqual(s.player, position);
  s = step(s, { type: 'MOVE', x: 1000, y: 1000 }); assert.deepEqual(s.player, position);
});
