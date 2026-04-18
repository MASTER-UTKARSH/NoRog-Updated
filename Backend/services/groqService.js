import axios from "axios";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Ordered fallback chain of Groq models.
 * When one hits a rate limit, the next one is tried automatically.
 * Groq free tier has different rate limits per model — spreading
 * requests across models dramatically increases total throughput.
 */
const MODEL_CHAIN = [
  "llama-3.3-70b-versatile",    // Best quality, lowest free-tier limit
  "llama-3.1-8b-instant",       // Fast, higher limit
  "llama3-70b-8192",            // Older Llama3, separate limit pool
  "llama3-8b-8192",             // Older small Llama3, very high limit
  "gemma2-9b-it",               // Google Gemma on Groq, separate pool
  "mixtral-8x7b-32768",         // Mistral MoE, separate pool
];

/**
 * Try a single Groq API call with a specific model.
 * Returns { success: true, data } or { success: false, status, error }.
 */
const tryModel = async (model, messages, options = {}) => {
  const { temperature = 0.2, max_tokens = 3000, timeout = 50000 } = options;
  try {
    const key = process.env.GROQ_API_KEY?.trim();
    if (!key) {
      return { success: false, status: 0, error: "GROQ_API_KEY is missing" };
    }

    const response = await axios.post(
      GROQ_URL,
      { model, messages, temperature, max_tokens },
      {
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json"
        },
        timeout
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      return { success: false, status: 0, error: "Empty response" };
    }
    return { success: true, data: content };
  } catch (error) {
    const status = error.response?.status || 0;
    const msg = error.response?.data?.error?.message || error.message;
    return { success: false, status, error: msg };
  }
};

/**
 * Call Groq API with automatic multi-model fallback.
 * Tries each model in MODEL_CHAIN until one succeeds.
 * Returns parsed JSON object from the AI response.
 */
export const callGroq = async (systemPrompt, userMessage) => {
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage }
  ];

  // If user set a specific model via env, put it first
  const envModel = process.env.GROQ_MODEL?.trim();
  const chain = envModel
    ? [envModel, ...MODEL_CHAIN.filter(m => m !== envModel)]
    : [...MODEL_CHAIN];

  let lastError = "";

  for (let i = 0; i < chain.length; i++) {
    const model = chain[i];
    const result = await tryModel(model, messages, { temperature: 0.2, max_tokens: 3000 });

    if (result.success) {
      if (i > 0) console.log(`✅ Groq succeeded with fallback model: ${model}`);

      // Parse JSON from response
      const content = result.data;
      const startIdx = content.indexOf('{');
      const endIdx = content.lastIndexOf('}');

      if (startIdx === -1 || endIdx === -1) {
        console.warn(`Model ${model} returned non-JSON, trying next...`);
        lastError = "AI returned non-JSON response";
        continue; // Try next model if this one gave garbage
      }

      try {
        return JSON.parse(content.substring(startIdx, endIdx + 1));
      } catch (parseError) {
        console.warn(`Model ${model} returned invalid JSON, trying next...`);
        lastError = "Failed to parse AI response";
        continue;
      }
    }

    // If rate limited (429), try next model immediately
    if (result.status === 429) {
      console.warn(`⚠️ Rate limit on ${model}, trying next model...`);
      lastError = result.error;
      continue;
    }

    // If auth error, don't bother trying other models
    if (result.status === 401) {
      throw new Error("Invalid Groq API Key. Please check your GROQ_API_KEY.");
    }

    // For other errors (500, timeout, etc.), try next model
    console.warn(`⚠️ Error with ${model}: ${result.error}`);
    lastError = result.error;

    // Small delay before trying next model on server errors
    if (result.status >= 500) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  // All models exhausted
  throw new Error(`AI service temporarily unavailable. All models are rate-limited. Please wait 30-60 seconds and try again. Last error: ${lastError}`);
};

/**
 * Call Groq for raw text response (no JSON parsing).
 * Also uses multi-model fallback.
 */
export const callGroqRaw = async (systemPrompt, userMessage) => {
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage }
  ];

  const envModel = process.env.GROQ_MODEL?.trim();
  const chain = envModel
    ? [envModel, ...MODEL_CHAIN.filter(m => m !== envModel)]
    : [...MODEL_CHAIN];

  let lastError = "";

  for (let i = 0; i < chain.length; i++) {
    const model = chain[i];
    const result = await tryModel(model, messages, { temperature: 0.4, max_tokens: 2000 });

    if (result.success) {
      if (i > 0) console.log(`✅ Groq raw succeeded with fallback model: ${model}`);
      return result.data.trim();
    }

    if (result.status === 429) {
      console.warn(`⚠️ Raw rate limit on ${model}, trying next...`);
      lastError = result.error;
      continue;
    }

    if (result.status === 401) {
      throw new Error("Invalid Groq API Key. Please check your GROQ_API_KEY.");
    }

    console.warn(`⚠️ Raw error with ${model}: ${result.error}`);
    lastError = result.error;
    if (result.status >= 500) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  throw new Error(`AI service temporarily unavailable. Please wait 30-60 seconds and try again.`);
};
