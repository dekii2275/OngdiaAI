'use strict';
const { getGeminiConfig } = require('./env-loader.js');

async function callGeminiApi(systemPrompt, userText) {
  const { apiKey, model } = getGeminiConfig();
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\nLời của người chơi: "${userText}"` }]
      }
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1
    }
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(textOutput || '{}');
}

module.exports = { callGeminiApi };
