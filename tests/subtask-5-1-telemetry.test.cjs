const test = require('node:test');
const assert = require('node:assert/strict');
const { TelemetryLogger } = require('../web/js/sau-con-mua-telemetry.js');

test('Subtask 5.1: TelemetryLogger tính elapsed_ms tăng dần và loại bỏ event_id trùng lặp', async () => {
  const logger = new TelemetryLogger('sess-01');
  
  const ok1 = logger.logEvent({ event_id: 'e-1', type: 'stage_entered', stage: 'S0' });
  await new Promise(r => setTimeout(r, 20));
  const ok2 = logger.logEvent({ event_id: 'e-2', type: 'choice_selected', stage: 'S1', decision_id: 'D1' });
  const okDuplicate = logger.logEvent({ event_id: 'e-2', type: 'choice_selected', stage: 'S1', decision_id: 'D1' });

  assert.equal(ok1, true);
  assert.equal(ok2, true);
  assert.equal(okDuplicate, false, 'Event trùng ID phải bị từ chối');

  const events = logger.getEvents();
  assert.equal(events.length, 2);
  assert.ok(events[1].elapsed_ms >= events[0].elapsed_ms, 'elapsed_ms phải là đơn điệu tăng dần');
});
