'use strict';
const { buildContents } = require('./thao-prompt');
const enums = {
  status: ['answered', 'needs_context', 'out_of_scope'],
  topic: ['storm', 'flood', 'landslide', 'lightning', 'evacuation', 'preparedness', 'other'],
  urgency: ['normal', 'caution', 'emergency']
};
class ChatError extends Error {
  constructor(status, code, message) { super(message); Object.assign(this, { status, code }); }
}
function validateAnswer(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid answer');
  const keys = ['status', 'topic', 'urgency', 'answer', 'actions', 'avoid', 'follow_up'];
  if (Object.keys(value).length !== keys.length || keys.some(key => !Object.hasOwn(value, key))) throw new Error('Invalid fields');
  for (const [key, values] of Object.entries(enums)) if (!values.includes(value[key])) throw new Error('Invalid enum');
  for (const [key, max] of [['answer', 700], ['follow_up', 220]]) {
    if (typeof value[key] !== 'string' || value[key].length > max || (key === 'answer' && !value[key].trim())) throw new Error('Invalid text');
  }
  for (const [key, min, max] of [['actions', 1, 4], ['avoid', 0, 3]]) {
    if (!Array.isArray(value[key]) || value[key].length < min || value[key].length > max || value[key].some(text => typeof text !== 'string' || !text.trim() || text.length > 220)) throw new Error('Invalid list');
  }
  return value;
}
function validateInput(value) {
  if (!value || typeof value !== 'object' || typeof value.message !== 'string' || !value.message.trim() || value.message.length > 1200) {
    throw new ChatError(400, 'INVALID_INPUT', 'Em hãy nhập câu hỏi từ 1 đến 1.200 ký tự nhé.');
  }
  const context = {};
  for (const key of ['chapter', 'location', 'objective']) {
    if (typeof value.context?.[key] === 'string') context[key] = value.context[key].slice(0, 300);
  }
  const history = Array.isArray(value.history) ? value.history.slice(-6).filter(turn => turn && ['user', 'assistant'].includes(turn.role) && typeof turn.text === 'string').map(turn => ({ role: turn.role, text: turn.text.slice(0, 1600) })) : [];
  return { message: value.message.trim(), context, history };
}
async function askThao(raw, { fetchImpl = fetch, env = process.env } = {}) {
  const input = validateInput(raw);
  if (!env.API_KEY) throw new ChatError(503, 'NOT_CONFIGURED', 'Cô chưa kết nối được. Máy chủ cần cấu hình API_KEY.');
  const model = env.LLM_MODEL || 'gemma-4-26b-a4b-it';
  if (!/^[a-zA-Z0-9._-]+$/.test(model)) throw new ChatError(503, 'MODEL_CONFIG', 'Cấu hình model chưa hợp lệ.');
  let response;
  const signal = AbortSignal.timeout(25000);
  try {
    const options = {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.API_KEY },
      body: JSON.stringify({ contents: buildContents(input), generationConfig: { temperature: 0.2, maxOutputTokens: 2048, thinkingConfig: { thinkingLevel: 'minimal' } } }),
      signal
    };
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    response = await fetchImpl(url, options);
    // One retry for transient server failures; both calls share the 25-second deadline.
    if ([500, 502, 503, 504].includes(response.status)) {
      await response.body?.cancel();
      await new Promise(resolve => setTimeout(resolve, 400));
      response = await fetchImpl(url, options);
    }
  } catch (error) {
    if (signal.aborted || error.name === 'TimeoutError') throw new ChatError(504, 'PROVIDER_TIMEOUT', 'Google chưa trả lời trong thời gian chờ. Em thử gửi lại nhé.');
    throw new ChatError(504, 'CONNECTION_FAILED', 'Kết nối với cô bị gián đoạn. Em thử gửi lại nhé.');
  }
  if (!response.ok) {
    const code = response.status;
    if (code === 401 || code === 403) throw new ChatError(503, 'API_AUTH', 'Khóa API chưa hợp lệ hoặc chưa được cấp quyền dùng model.');
    if (code === 404) throw new ChatError(503, 'MODEL_UNAVAILABLE', 'Model đã cấu hình chưa khả dụng với khóa API này.');
    if (code === 429) throw new ChatError(429, 'PROVIDER_LIMIT', 'Cô đang nhận nhiều câu hỏi. Em đợi một chút rồi thử lại nhé.');
    if (code === 400) {
      let data;
      try { data = await response.json(); } catch { /* Do not expose provider text. */ }
      const reasons = data?.error?.details?.map(detail => detail.reason) || [];
      if (reasons.includes('API_KEY_INVALID')) throw new ChatError(503, 'API_AUTH', 'Google báo khóa API không hợp lệ. Cần kiểm tra khóa trên máy chủ.');
      throw new ChatError(502, 'PROVIDER_REQUEST', 'Google không chấp nhận cấu hình yêu cầu. Cần kiểm tra model và tham số trên máy chủ.');
    }
    if (code >= 500) throw new ChatError(502, 'PROVIDER_ERROR', `Google trả lỗi ${code} khi sinh câu trả lời sau khi đã thử lại. Em thử lại sau nhé.`);
    throw new ChatError(502, 'PROVIDER_ERROR', 'Dịch vụ trả lời đang gián đoạn. Em thử lại sau nhé.');
  }
  try {
    const data = await response.json();
    const candidate = data.candidates?.[0];
    if (candidate?.finishReason !== 'STOP') throw new Error('Incomplete answer');
    let text = (candidate.content?.parts || []).filter(part => !part.thought).map(part => part.text || '').join('').trim();
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    return { ...validateAnswer(JSON.parse(text)), source: 'llm', model };
  } catch {
    throw new ChatError(502, 'INVALID_RESPONSE', 'Cô chưa tạo được câu trả lời đúng định dạng. Em thử gửi lại nhé.');
  }
}
module.exports = { askThao, validateInput, validateAnswer, ChatError };
