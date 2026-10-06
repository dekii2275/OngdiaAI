const test = require('node:test');
const assert = require('node:assert/strict');
const J = require('../web/js/journey.js');
const M = require('../web/js/model.js');
const D = require('../web/js/chapter02-data.js');
const completed = bear => ({ ...M.fresh(), started: true, phase: 'complete', Scene1Completed: true,
  runId: 'journey-test', LockerOpened: bear, RouteUnderstood: true,
  settings: { sound: false, reducedMotion: true, showSpots: false } });
test('only a completed first chapter can become a chapter handoff', () => {
  assert.equal(J.origin(M.fresh()), null);
  assert.equal(J.origin({ ...completed(true), Scene1Completed: false }), null);
  assert.equal(J.origin({ ...completed(true), version: 99 }), null);
  assert.equal(J.origin(completed(true)).hasBear, true);
  assert.equal(J.origin(completed(false)).hasBear, false);
});
test('handoff carries choices and preferences into the next chapter save', () => {
  const state = J.attach(D.initial(), J.origin(completed(true)));
  const restored = D.restore(JSON.parse(JSON.stringify(state)));
  assert.equal(restored.origin.id, 'journey-test');
  assert.equal(restored.origin.hasBear, true);
  assert.equal(restored.origin.choices.RouteUnderstood, true);
  assert.deepEqual(restored.settings, { sound: false, reduced: true });
});
test('replays have distinct identities and never rewrite the context of an existing save', () => {
  const state = J.attach(D.initial(), J.origin(completed(true))); state.started = true;
  assert.ok(J.sameJourney(state, J.origin(completed(true))));
  assert.equal(J.sameJourney(state, J.origin({ ...completed(false), runId: 'new-run' })), false);
  assert.equal(D.restore(state).origin.hasBear, true);
  assert.equal(M.restore(completed(true)).runId, 'journey-test');
});
test('legacy journeys and malformed context remain safe to load', () => {
  const old = completed(false); delete old.runId;
  assert.match(J.origin(old).id, /^legacy-/);
  assert.equal(J.restoreOrigin({ version: 1, id: '<script>' }), null);
  assert.equal(D.restore({ ...D.initial(), origin: { version: 5 } }).origin, null);
});
test('the title does not send a fresh first-chapter run into an older second-chapter save', () => {
  const first = completed(true), second = J.attach(D.initial(), J.origin(first)); second.started = true;
  assert.equal(J.canContinue(first, second), true);
  assert.equal(J.canContinue({ ...first, runId: 'fresh-run', Scene1Completed: false }, second), false);
  assert.equal(J.canContinue(null, second), true);
  assert.equal(J.canContinue(first, { ...second, scene: 'unknown' }), false);
});
