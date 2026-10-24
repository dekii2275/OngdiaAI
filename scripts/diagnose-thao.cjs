// Run manually: node scripts/diagnose-thao.cjs. Never prints API keys or headers.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
if (fs.existsSync(path.join(root, '.env'))) process.loadEnvFile(path.join(root, '.env'));
const model = process.env.LLM_MODEL || 'gemma-4-26b-a4b-it';
const key = process.env.API_KEY;
if (!key || !/^[a-zA-Z0-9._-]+$/.test(model)) {
  console.error('Missing API_KEY or invalid LLM_MODEL'); process.exit(1);
}
const clean = value => String(value || '').split(key).join('[REDACTED]').slice(0, 500);
const basic = { contents: [{ parts: [{ text: 'Reply with exactly: Xin chào' }] }] };
const cases = [
  { name: 'model-metadata', model },
  { name: 'minimal-generation', model, body: basic },
  { name: 'minimal-with-generation-config', model, body: { ...basic, generationConfig: { temperature: 0.2, maxOutputTokens: 2048, thinkingConfig: { thinkingLevel: 'minimal' } } } }
];
async function run(item) {
  const start = Date.now();
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${item.model}${item.body ? ':generateContent' : ''}`, {
      method: item.body ? 'POST' : 'GET',
      headers: { 'x-goog-api-key': key, ...(item.body ? { 'Content-Type': 'application/json' } : {}) },
      body: item.body ? JSON.stringify(item.body) : undefined, signal: AbortSignal.timeout(20000)
    });
    const data = await response.json();
    return { test: item.name, model: item.model, httpStatus: response.status, elapsedMs: Date.now() - start, providerStatus: clean(data.error?.status), message: clean(data.error?.message), finishReason: data.candidates?.[0]?.finishReason || null, hasOutput: Boolean(data.candidates?.[0]?.content?.parts?.some(p => !p.thought && p.text)), errorDetails: data.error?.details?.map(d => ({ type: clean(d['@type']), reason: clean(d.reason), domain: clean(d.domain) })) || [] };
  } catch (error) {
    return { test: item.name, model: item.model, elapsedMs: Date.now() - start, networkError: clean(error.name), causeCode: clean(error.cause?.code) };
  }
}
const selected = process.argv.includes('--minimal') ? cases.filter(item => item.name === 'minimal-generation') : cases;
Promise.all(selected.map(run)).then(results => {
  console.log(JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2));
}).catch(() => { console.error('Diagnostic failed'); process.exitCode = 1; });
