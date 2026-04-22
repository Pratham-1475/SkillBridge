const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'];

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '';
}

function getGeminiModels(primaryModel) {
  const configuredModels = [
    primaryModel,
    process.env.GEMINI_MODEL,
    ...(process.env.GEMINI_FALLBACK_MODELS || '').split(','),
    ...DEFAULT_GEMINI_MODELS,
  ];

  return [...new Set(configuredModels.map((model) => model?.trim()).filter(Boolean))];
}

function createGeminiError(message, { statusCode = 502, providerStatus, model, isTransient = false } = {}) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.providerStatus = providerStatus;
  error.model = model;
  error.isTransient = isTransient;
  return error;
}

function isTransientGeminiError(status, message = '') {
  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    /high demand|overloaded|temporarily unavailable|try again later/i.test(message)
  );
}

async function callGeminiJson({
  apiKey,
  model,
  systemInstruction,
  prompt,
  temperature,
}) {
  const response = await fetch(`${GEMINI_API_BASE_URL}/${model}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature,
        responseMimeType: 'application/json',
      },
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const providerMessage = data.error?.message || 'Gemini request failed.';
    throw createGeminiError(providerMessage, {
      statusCode: isTransientGeminiError(response.status, providerMessage) ? 503 : 502,
      providerStatus: response.status,
      model,
      isTransient: isTransientGeminiError(response.status, providerMessage),
    });
  }

  const rawText = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();

  if (!rawText) {
    const blockReason = data.promptFeedback?.blockReason;
    throw createGeminiError(
      blockReason
        ? `Gemini could not complete the scope request: ${blockReason}.`
        : 'Gemini returned an empty response.',
      { model },
    );
  }

  return rawText;
}

export async function generateGeminiJson({
  apiKey,
  model,
  systemInstruction,
  prompt,
  temperature = 0.35,
}) {
  if (!apiKey) {
    throw createGeminiError('GEMINI_API_KEY is required for the AI scoping assistant.', { statusCode: 500 });
  }

  let lastError;
  const models = getGeminiModels(model);

  for (const candidateModel of models) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        return await callGeminiJson({
          apiKey,
          model: candidateModel,
          systemInstruction,
          prompt,
          temperature,
        });
      } catch (error) {
        lastError = error;

        if (!error.isTransient) {
          throw error;
        }

        if (attempt < 2) {
          await sleep(450 * attempt);
        }
      }
    }
  }

  throw createGeminiError(
    `Gemini is temporarily overloaded after retrying ${models.join(', ')}. Please try again in a minute.`,
    {
      statusCode: 503,
      providerStatus: lastError?.providerStatus,
      model: lastError?.model,
      isTransient: true,
    },
  );
}
