import { callGroq } from "../services/groqService.js";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

async function test() {
  try {
    const res = await callGroq("You are a helpful AI. Output only valid JSON. Format: {\"status\": \"ok\"}", "Hello");
    console.log("Success:", res);
  } catch (err) {
    console.error("Test failed:", err.message);
  }
}

test();
