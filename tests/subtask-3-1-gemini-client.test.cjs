const test = require('node:test');
const assert = require('node:assert/strict');
const { parseEnvLine, getGeminiConfig } = require('../server/env-loader.js');

test('Subtask 3.1: parseEnvLine phải loại bỏ dấu nháy đơn, nháy kép và khoảng trắng', () => {
  const line1 = "GEMINI_API_KEY= 'MOCK_TEST_KEY_XYZ_12345'";
  const parsed1 = parseEnvLine(line1);
  assert.equal(parsed1.key, 'GEMINI_API_KEY');
  assert.equal(parsed1.value, 'MOCK_TEST_KEY_XYZ_12345');

  const line2 = 'GEMINI_MODEL="gemini-2.0-flash-lite"';
  const parsed2 = parseEnvLine(line2);
  assert.equal(parsed2.key, 'GEMINI_MODEL');
  assert.equal(parsed2.value, 'gemini-2.0-flash-lite');
});

test('Subtask 3.1: getGeminiConfig đọc chính xác cấu hình từ .env của dự án', () => {
  const config = getGeminiConfig();
  assert.ok(config.apiKey, 'Thiếu apiKey trong cấu hình');
  assert.ok(config.apiKey.length > 10, 'API key không hợp lệ');
  assert.ok(config.model, 'Thiếu model name');
});
