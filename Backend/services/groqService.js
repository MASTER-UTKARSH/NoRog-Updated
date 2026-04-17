import axios from "axios";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

/**
 * Call Groq API with system prompt and user message.
 * Returns parsed JSON object from the AI response.
 */
export const callGroq = async (systemPrompt, userMessage) => {
  try {
    const response = await axios.post(
      GROQ_URL,
      {
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.4,
        max_tokens: 2000
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from Groq");
    }

    // Clean any markdown formatting the model might add
    let cleaned = content.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.slice(7);
    }
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (error) {
    if (error.response?.status === 429) {
      console.error("Groq rate limit hit. Try again in a moment.");
      throw new Error("AI service is busy. Please try again in a moment.");
    }
    if (error instanceof SyntaxError) {
      console.error("Failed to parse Groq response as JSON:", error.message);
      throw new Error("AI returned an invalid response. Please try again.");
    }
    console.error("Groq API error:", error.message);
    throw new Error("AI service unavailable. Please try again later.");
  }
};

/**
 * Call Groq for raw text response (no JSON parsing).
 */
export const callGroqRaw = async (systemPrompt, userMessage) => {
  try {
    const response = await axios.post(
      GROQ_URL,
      {
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.4,
        max_tokens: 2000
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    return response.data?.choices?.[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("Groq raw call error:", error.message);
    throw new Error("AI service unavailable.");
  }
};
