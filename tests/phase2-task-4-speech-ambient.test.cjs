const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Phase 2 Task 4: File sau-con-mua-speech.js và sau-con-mua-ambient.js phải tồn tại', () => {
  const speechPath = path.resolve(__dirname, '../web/js/sau-con-mua-speech.js');
  const ambientPath = path.resolve(__dirname, '../web/js/sau-con-mua-ambient.js');
  assert.ok(fs.existsSync(speechPath), 'Thiếu web/js/sau-con-mua-speech.js');
  assert.ok(fs.existsSync(ambientPath), 'Thiếu web/js/sau-con-mua-ambient.js');
});

test('Phase 2 Task 4: VietnameseSpeechEngine có đầy đủ interface speak, stop, isAvailable', () => {
  const { VietnameseSpeechEngine } = require('../web/js/sau-con-mua-speech.js');
  const engine = new VietnameseSpeechEngine();
  assert.equal(typeof engine.speak, 'function');
  assert.equal(typeof engine.stop, 'function');
  assert.equal(typeof engine.isAvailable, 'function');
});

test('Phase 2 Task 4: ProceduralStormAmbient có đầy đủ interface start, stop, toggle, setVolume', () => {
  const { ProceduralStormAmbient } = require('../web/js/sau-con-mua-ambient.js');
  const ambient = new ProceduralStormAmbient();
  assert.equal(typeof ambient.start, 'function');
  assert.equal(typeof ambient.stop, 'function');
  assert.equal(typeof ambient.toggle, 'function');
  assert.equal(typeof ambient.setVolume, 'function');
});

test('Phase 2 Task 4: HTML phải nhúng hai script âm thanh mới', () => {
  const html = fs.readFileSync(path.resolve(__dirname, '../web/sau-con-mua.html'), 'utf8');
  assert.ok(html.includes('sau-con-mua-speech.js'), 'Thiếu nhúng sau-con-mua-speech.js trong HTML');
  assert.ok(html.includes('sau-con-mua-ambient.js'), 'Thiếu nhúng sau-con-mua-ambient.js trong HTML');
});
