import { callGroqRaw } from "./groqService.js";
import { 
  getProfile, 
  getInsights, 
  getFamilyMembers, 
  updateInsights, 
  addOrUpdateFamilyMember,
  getChatHistory,
  findUserById
} from "./firebaseDB.js";

const ASSISTANT_SYSTEM_PROMPT = `You are NoRog Assistant, a helpful and concise medical & lifestyle AI observer.

CORE GUIDELINES:
1. RESPONSE QUALITY & BREVITY:
   - Provide a Direct Answer first.
   - Give a brief, clear explanation ONLY if it helps the user understand the context.
   - Provide one practical suggestion or example.
   - Keep it concise. Do NOT be overly talkative.

2. MINIMIZE QUESTIONING (IMPORTANT):
   - Only ask follow-up questions if critical to providing a safe or accurate response.
   - Do NOT probe for "lifestyle", "habits", or "goals" unless the user explicitly starts that conversation or asks for a general health review.
   - If the user is just saying hello or sharing a small update, acknowledge it warmly and stop there.

3. SMART OPTIONS:
   - Use options ONLY when the user needs to make a decision or choose a path for diagnosis.
   - Format: ["Option 1", "Option 2", ...]

4. INSIGHTS:
   - Quietly track mentioned traits (mood, family) without announcing it or asking for more details unless relevant to the current topic.

5. RESTRICTIONS:
   - No medical diagnoses.
   - No lecturing.
   - Stay useful, reactive, and supportive.

OUTPUT FORMAT (JSON):
{
  "message": "Direct answer + brief reasoning + suggestion",
  "options": [], 
  "internal": { "insightsUpdate": {}, "familyUpdate": {} }
}`;

/**
 * processMessage
 * @param {string} userId
 * @param {string} message - User's last input
 */
export const processAssistantMessage = async (userId, userMessage) => {
  try {
    const user = await findUserById(userId);
    const profile = await getProfile(userId);
    const insights = await getInsights(userId);
    const family = await getFamilyMembers(userId);
    const history = await getChatHistory(userId, 10); // last 10 turns

    const contextStr = `
User: ${user?.name}
Profile: ${JSON.stringify(profile)}
Detected Insights: ${JSON.stringify(insights)}
Family Profiles: ${JSON.stringify(family)}
Recent History: ${JSON.stringify(history)}
`;

    const fullPrompt = `${ASSISTANT_SYSTEM_PROMPT}\n\nUSER CONTEXT:\n${contextStr}`;

    const rawResponse = await callGroqRaw(fullPrompt, userMessage);
    
    // Parse the JSON from the AI
    let result;
    try {
      // Find start and end of JSON in case model adds fluff
      const startIdx = rawResponse.indexOf('{');
      const endIdx = rawResponse.lastIndexOf('}');
      if (startIdx === -1 || endIdx === -1) throw new Error("No JSON found");
      const jsonStr = rawResponse.substring(startIdx, endIdx + 1);
      result = JSON.parse(jsonStr);
    } catch (e) {
      console.warn("AI failed to return valid JSON, falling back to text:", e.message);
      result = {
        message: rawResponse,
        options: [],
        internal: null
      };
    }

    // Process internal updates
    if (result.internal?.insightsUpdate) {
      await updateInsights(userId, result.internal.insightsUpdate);
    }
    if (result.internal?.familyUpdate) {
      await addOrUpdateFamilyMember(userId, result.internal.familyUpdate);
    }

    return {
      role: "assistant",
      content: result.message,
      options: result.options || []
    };
  } catch (error) {
    console.error("Assistant Service Error:", error);
    return {
      role: "assistant",
      content: "I'm having a bit of trouble connecting right now, but I'm still here for you. How else can I help?",
      options: []
    };
  }
};
