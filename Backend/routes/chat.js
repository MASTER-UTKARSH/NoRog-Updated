import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getChatHistory, addToChatHistory, clearChatHistory, getInsights, getFamilyMembers } from "../services/firebaseDB.js";
import { processAssistantMessage } from "../services/assistantService.js";

const router = Router();
router.use(authMiddleware);

// GET /api/chat/history - Load chat history
router.get("/history", async (req, res) => {
  try {
    const history = await getChatHistory(req.user.id);
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to load history" });
  }
});

// POST /api/chat - Send message to assistant
router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, error: "Message is required" });

    // Store user message
    const userMsgEntry = await addToChatHistory(req.user.id, { role: "user", content: message });

    // Process with AI
    const aiResponse = await processAssistantMessage(req.user.id, message);

    // Store AI response
    const aiMsgEntry = await addToChatHistory(req.user.id, aiResponse);

    res.json({ success: true, data: aiMsgEntry });
  } catch (error) {
    console.error("Chat route error:", error);
    res.status(500).json({ success: false, error: "Assistant is unavailable" });
  }
});

// GET /api/chat/insights - Get extracted traits
router.get("/insights", async (req, res) => {
  try {
    const insights = await getInsights(req.user.id);
    const family = await getFamilyMembers(req.user.id);
    res.json({ success: true, data: { insights, family } });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to load insights" });
  }
});

// DELETE /api/chat/history - Reset chat
router.delete("/history", async (req, res) => {
  try {
    await clearChatHistory(req.user.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to clear history" });
  }
});

export default router;
