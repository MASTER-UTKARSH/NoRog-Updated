import axios from "axios";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

/**
 * Call Groq API with system prompt and user message.
 * Returns parsed JSON object from the AI response.
 */
export const callGroq = async (systemPrompt, userMessage, fallbackMode = false) => {
  const CURRENT_MODEL = process.env.GROQ_MODEL || (fallbackMode ? "llama-3.1-8b-instant" : "llama-3.3-70b-versatile");

  try {
    const key = process.env.GROQ_API_KEY?.trim();
    if (!key) console.error("GROQ_API_KEY is MISSING in process.env");

    const response = await axios.post(
      GROQ_URL,
      {
        model: CURRENT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.2, // lower temperature for more consistent JSON
        max_tokens: 3000
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY?.trim()}`,
          "Content-Type": "application/json"
        },
        timeout: 45000 // slightly longer timeout
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from Groq");
    }

    // ROBUST JSON EXTRACTION: Find the first { and last }
    const startIdx = content.indexOf('{');
    const endIdx = content.lastIndexOf('}');
    
    if (startIdx === -1 || endIdx === -1) {
      console.warn("AI did not return a valid JSON block, content:", content);
      throw new Error("AI returned a non-JSON response");
    }

    const jsonStr = content.substring(startIdx, endIdx + 1);
    
    try {
      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("JSON Parse Error. Data:", jsonStr);
      throw new Error("Failed to parse AI response");
    }
  } catch (error) {
    if (error.response?.status === 429 && !fallbackMode) {
      console.warn(`Groq rate limit hit for ${CURRENT_MODEL}. Attempting fallback to llama-3.1-8b-instant...`);
      // Wait 1 second before retrying to let the API breathe slightly
      await new Promise(resolve => setTimeout(resolve, 1000));
      return callGroq(systemPrompt, userMessage, true);
    }
    
    if (error.response?.status === 401) {
      console.error("Groq Authentication Error. Check your API key.");
      throw new Error("Invalid Groq API Key.");
    }
    if (error.response?.status === 429) {
      console.error("Groq rate limit hit completely.");
      throw new Error("AI service is busy. Please try again in a moment.");
    }
    console.error("Groq API error:", error.message);
    if (error.response?.data) {
      console.error("Groq API Error Details:", JSON.stringify(error.response.data, null, 2));
    }
    throw new Error(`AI service Error: ${error.message}`);
  }
};

/**
 * Call Groq for raw text response (no JSON parsing).
 */
export const callGroqRaw = async (systemPrompt, userMessage, fallbackMode = false) => {
  const CURRENT_MODEL = process.env.GROQ_MODEL || (fallbackMode ? "llama-3.1-8b-instant" : "llama-3.3-70b-versatile");

  try {
    const key = process.env.GROQ_API_KEY?.trim();
    if (!key) console.error("GROQ_API_KEY is MISSING in process.env");

    const response = await axios.post(
      GROQ_URL,
      {
        model: CURRENT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.4,
        max_tokens: 2000
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY?.trim()}`,
          "Content-Type": "application/json"
        },
        timeout: 45000
      }
    );

    return response.data?.choices?.[0]?.message?.content?.trim() || "";
  } catch (error) {
    if (error.response?.status === 429 && !fallbackMode) {
      console.warn(`Groq raw rate limit hit for ${CURRENT_MODEL}. Attempting fallback...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return callGroqRaw(systemPrompt, userMessage, true);
    }
    
    console.error("Groq raw call error:", error.message);
    if (error.response?.data) {
      console.error("Groq Raw API Error Details:", JSON.stringify(error.response.data, null, 2));
    }
    throw new Error(`AI service unavailable: ${error.message}`);
  }
};
