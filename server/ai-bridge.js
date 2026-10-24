'use strict';

const { REPLY_BANK, buildSystemInstruction } = require('./npc-classifier.js');
const { callGeminiApi } = require('./gemini-client.js');

const ALLOWED_IDS = Object.keys(REPLY_BANK);

function validateNpcResponse(rawJson, expectedRequestId, expectedStageRevision) {
  if (
    rawJson &&
    rawJson.request_id === expectedRequestId &&
    rawJson.stage_revision === expectedStageRevision &&
    ALLOWED_IDS.includes(rawJson.reply_id)
  ) {
    return {
      request_id: rawJson.request_id,
      stage_revision: rawJson.stage_revision,
      reply_id: rawJson.reply_id,
      reply_text: REPLY_BANK[rawJson.reply_id],
      is_fallback: false
    };
  }

  // Fallback an toàn
  return {
    request_id: expectedRequestId,
    stage_revision: expectedStageRevision,
    reply_id: 'minh_accept',
    reply_text: REPLY_BANK.minh_accept,
    is_fallback: true
  };
}

async function selectNpcReply({ requestId, stageRevision, playerText, customCaller }) {
  const timeoutMs = 3000;
  let timeoutHandle;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error('AI Call Timeout')), timeoutMs);
  });

  const caller = customCaller || (async () => {
    const prompt = buildSystemInstruction(requestId, stageRevision);
    return await callGeminiApi(prompt, playerText);
  });

  try {
    const rawResult = await Promise.race([caller(), timeoutPromise]);
    clearTimeout(timeoutHandle);
    return validateNpcResponse(rawResult, requestId, stageRevision);
  } catch (err) {
    clearTimeout(timeoutHandle);
    return {
      request_id: requestId,
      stage_revision: stageRevision,
      reply_id: 'minh_accept',
      reply_text: REPLY_BANK.minh_accept,
      is_fallback: true
    };
  }
}

module.exports = {
  REPLY_BANK,
  validateNpcResponse,
  selectNpcReply
};
