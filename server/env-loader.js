'use strict';
const fs = require('fs');
const path = require('path');

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;
  const idx = trimmed.indexOf('=');
  if (idx === -1) return null;
  const key = trimmed.slice(0, idx).trim();
  let value = trimmed.slice(idx + 1).trim();
  // Bỏ nháy đơn hoặc nháy kép bọc quanh
  if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
    value = value.slice(1, -1).trim();
  }
  return { key, value };
}

function loadEnvFile() {
  const envPath = path.resolve(__dirname, '../.env');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const res = parseEnvLine(line);
    if (res) env[res.key] = res.value;
  });
  return env;
}

function getGeminiConfig() {
  const env = loadEnvFile();
  const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || '';
  const model = process.env.GEMINI_MODEL || env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  return { apiKey, model };
}

module.exports = { parseEnvLine, loadEnvFile, getGeminiConfig };
