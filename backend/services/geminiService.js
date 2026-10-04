/**
 * Gemini provider for SkillForge AI.
 *
 * The browser never receives GEMINI_API_KEY.  All calls are made from the API
 * server and callers can fall back to the local ML service when a free-tier
 * quota is exhausted or a key has not been configured.
 */
const axios = require('axios');

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

// Model cascade prioritized by availability and speed
const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL,
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite-preview',
  'gemini-3-flash-preview',
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
].filter(Boolean);

const MAX_PROMPT_CHARS = 24000;
let warned = false;

const truncate = (value, max = MAX_PROMPT_CHARS) => String(value || '').slice(0, max);
const key = () => (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();

function warn(error, modelName) {
  if (!warned) {
    console.warn(`[Gemini:${modelName || 'default'}] error (${error.response?.status || error.code || error.message}).`);
  }
}

function toContents(history, prompt) {
  const turns = (history || []).slice(-10).map((turn) => ({
    role: turn.role === 'assistant' || turn.role === 'model' ? 'model' : 'user',
    parts: [{ text: truncate(turn.content, 6000) }],
  }));
  turns.push({ role: 'user', parts: [{ text: truncate(prompt) }] });
  return turns;
}

async function generate({ prompt, systemInstruction, history = [], json = false, maxOutputTokens = 3000, temperature = 0.45 }) {
  if (!key()) return null;

  // Deduplicate candidates
  const modelsToTry = [...new Set(MODEL_CANDIDATES)];

  for (const currentModel of modelsToTry) {
    try {
      const { data } = await axios.post(
        `${API_BASE}/models/${encodeURIComponent(currentModel)}:generateContent`,
        {
          contents: toContents(history, prompt),
          ...(systemInstruction ? { systemInstruction: { parts: [{ text: truncate(systemInstruction, 8000) }] } } : {}),
          generationConfig: {
            temperature,
            maxOutputTokens,
            ...(json ? { responseMimeType: 'application/json' } : {}),
          },
        },
        { headers: { 'x-goog-api-key': key(), 'Content-Type': 'application/json' }, timeout: 35000 }
      );
      const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
      if (text) {
        return { text, model: currentModel, usage: data.usageMetadata || null };
      }
    } catch (error) {
      const status = error.response?.status;
      // If 429 (rate limit/quota), 404 (retired), or 503 (overloaded), try next model in cascade
      if (status === 429 || status === 404 || status === 503) {
        console.warn(`[Gemini Cascade] ${currentModel} returned ${status}; failing over to next model.`);
        continue;
      }
      warn(error, currentModel);
    }
  }

  return null;
}

function parseJson(text) {
  try { return JSON.parse(text); } catch (_) {
    const candidate = String(text || '').match(/\{[\s\S]*\}|\[[\s\S]*\]/)?.[0];
    try { return candidate ? JSON.parse(candidate) : null; } catch (_) { return null; }
  }
}

async function generateJson(options) {
  const result = await generate({ ...options, json: true });
  if (!result) return null;
  const value = parseJson(result.text);
  return value ? { value, generatedBy: `gemini:${result.model}` } : null;
}

async function chat(message, contextChunks = [], history = [], systemInstruction = '') {
  const context = (contextChunks || []).slice(0, 8).map((chunk, i) => `[${i + 1}] ${truncate(chunk, 2200)}`).join('\n');
  const result = await generate({
    prompt: `${context ? `Use this private career context when relevant:\n${context}\n\n` : ''}User message: ${message}`,
    history,
    systemInstruction: `${systemInstruction || 'You are SkillForge AI, an accurate and encouraging career coach.'}\nDo not invent resume facts. Give practical, concise answers.`,
    maxOutputTokens: 2500,
    temperature: 0.55,
  });
  return result ? { reply: result.text, used_context: contextChunks.slice(0, 8), generated_by: `gemini:${result.model}` } : null;
}

module.exports = { generate, generateJson, chat, isConfigured: () => Boolean(key()), model: MODEL_CANDIDATES[0] };
