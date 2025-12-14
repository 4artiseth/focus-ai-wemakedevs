import "dotenv/config";
import { generateText } from "ai";
import { vertex, LLM_CONFIG } from "./src/lib/llm/config";

async function testConnection() {
  try {
    console.log("Testing Google AI Studio connection...");
    console.log(
      "API Key:",
      process.env.GOOGLE_API_KEY
        ? `${process.env.GOOGLE_API_KEY.substring(0, 15)}...`
        : "NOT FOUND"
    );
    console.log("Model:", LLM_CONFIG.model);

    const { text } = await generateText({
      model: vertex(LLM_CONFIG.model),
      prompt: 'Say "API Connected" if you can hear me.',
    });
    console.log("Success:", text);
  } catch (error) {
    console.error("Connection Failed:", error);
  }
}

testConnection();
