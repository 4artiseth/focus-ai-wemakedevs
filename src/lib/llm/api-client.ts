import { generateText } from "ai";
import { vertex, LLM_CONFIG } from "./config";

// Helper for raw LLM calls using Vertex AI
export async function callLLM(
  messages: { role: string; content: string }[],
  jsonMode: boolean = false,
  model: string = LLM_CONFIG.model,
  useSearch: boolean = false
) {
  const project = process.env.GOOGLE_CLOUD_PROJECT;

  if (!project) throw new Error("Missing GOOGLE_CLOUD_PROJECT");

  // ... (Rate Limiter code remains same) ...

  // --- GLOBAL RATE LIMITER (TIER 3: 2000 RPM) ---
  const MIN_DELAY_BETWEEN_CALLS = 60; // 60ms = ~1000 RPM
  let lastCallTime = 0;
  let rateLimitLock = Promise.resolve();

  async function enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    const waitTime = Math.max(0, MIN_DELAY_BETWEEN_CALLS - timeSinceLastCall);
    lastCallTime = now + waitTime;
    if (waitTime > 0)
      await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  const acquireToken = () => {
    const next = rateLimitLock.then(() => enforceRateLimit());
    rateLimitLock = next;
    return next;
  };

  const maxRetries = 5;
  let attempt = 0;
  let delay = 2000;

  while (attempt < maxRetries) {
    try {
      await acquireToken();

      const systemMessage = messages.find((m) => m.role === "system");
      const userMessages = messages.filter((m) => m.role !== "system");
      const prompt = userMessages.map((m) => m.content).join("\n\n");

      console.log("[LLM] Calling API with:", {
        model: model,
        useSearch: useSearch,
        attempt: attempt + 1,
      });

      const { text } = await generateText({
        model: vertex(model),
        system: systemMessage?.content,
        prompt: prompt,
        temperature: LLM_CONFIG.temperature,
      });

      // Validate that we got a response
      if (!text || text.trim().length === 0) {
        throw new Error("LLM returned empty response");
      }

      console.log("[LLM] Success, received", text.length, "characters");
      return text;
    } catch (error: any) {
      console.error("[LLM] Error:", {
        message: error?.message,
        attempt: attempt + 1,
        willRetry: attempt < maxRetries - 1,
      });

      // Check for empty response errors (likely safety filters)
      if (error?.message?.includes("output text or tool calls")) {
        console.error(
          "LLM returned empty output. This may be due to safety filters or prompt issues."
        );

        // Only retry a few times for this specific error
        if (attempt >= 2) {
          throw new Error(
            "LLM consistently returning empty responses. This may indicate:\n" +
              "1. Content safety filters are being triggered\n" +
              "2. Prompt format issues\n" +
              "3. API configuration problems\n" +
              "Please check the prompt content and try simplifying it."
          );
        }

        console.error("Retrying with increased backoff...");
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
        attempt++;
        continue;
      }

      if (
        error?.message?.includes("429") ||
        error?.message?.includes("rate limit")
      ) {
        console.warn(`Rate limited. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        // Add jitter to prevent thundering herd: 1.5x to 2.0x backoff
        delay *= 1.5 + Math.random() * 0.5;
        attempt++;
        continue;
      }

      if (attempt === maxRetries - 1) throw error;
      console.warn(`API call failed. Retrying in ${delay}ms...`, error);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
      attempt++;
    }
  }
  throw new Error("Max retries exceeded");
}
