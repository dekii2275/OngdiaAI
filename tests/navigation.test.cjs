const test = require('node:test');
const assert = require('node:assert/strict');
const navigation = require('../web/js/navigation.js');
test('painted desks and furniture are outside the walkable floor', () => {
  for (const point of [{ x: 20, y: 85 }, { x: 34, y: 69 }, { x: 92, y: 85 }, { x: 38, y: 64 }]) assert.equal(navigation.walkable(point), false);
  for (const point of [{ x: 51, y: 84 }, { x: 54, y: 70 }, { x: 84, y: 68 }]) assert.equal(navigation.walkable(point), true);
});
test('click routes stay on the floor around concave desk corners', () => {
  const origin = { x: 39, y: 91 }, goal = { x: 47, y: 67 };
  const route = navigation.path(origin, goal);
  assert.ok(route.length > 1, 'must route around the desk corner');
  let previous = origin;
  for (const waypoint of route) { assert.ok(navigation.clearLine(previous, waypoint, 'classroom', 82)); previous = waypoint; }
  assert.deepEqual(previous, goal);
});
test('keyboard movement stops at desks and escort boundary instead of teleporting', () => {
  const start = { x: 39, y: 90 };
  assert.deepEqual(navigation.move(start, { x: 20, y: 90 }), start);
  const hallway = { x: 38, y: 82 };
  assert.deepEqual(navigation.move(hallway, { x: 41, y: 82 }, 'hallway', 35), hallway);
});
test('old saves and clicks onto desks are projected onto usable floor', () => {
  const projected = navigation.project({ x: 32, y: 85 });
  assert.ok(navigation.walkable(projected)); assert.ok(projected.x > 37);
  const route = navigation.path({ x: 51, y: 84 }, { x: 15, y: 80 });
  assert.ok(route.length > 0); assert.ok(navigation.walkable(route.at(-1)));
});
test('walking to a locker routes around a classmate rather than through their feet', () => {
  const actors = [{ x: 71, y: 75 }];
  const start = { x: 60, y: 81 }, goal = { x: 78, y: 71 };
  const route = navigation.path(start, goal, 'classroom', 82, actors);
  assert.ok(route.length > 1);
  let previous = start;
  for (const waypoint of route) { assert.ok(navigation.clearLine(previous, waypoint, 'classroom', 82, actors)); previous = waypoint; }
  assert.deepEqual(previous, goal);
});
