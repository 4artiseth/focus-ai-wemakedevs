import { createVertex } from "@ai-sdk/google-vertex";

// Parse credentials from environment variable (for Vercel deployment)
const getCredentials = () => {
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (credentialsJson) {
    try {
      return JSON.parse(credentialsJson);
    } catch (e) {
      console.error("Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON");
    }
  }
  return undefined;
};

// Vertex AI configuration
export const vertex = createVertex({
  project: process.env.GOOGLE_CLOUD_PROJECT || "",
  location: process.env.GOOGLE_CLOUD_LOCATION || "us-central1",
  googleAuthOptions: {
    credentials: getCredentials(),
  },
});

export const LLM_CONFIG = {
  model: "gemini-2.0-flash-001",
  temperature: 0.5, // Reduced from 0.7 to improve persona consistency
  maxTokens: 2000,
};

export const FAST_LLM_CONFIG = {
  model: "gemini-2.0-flash-001",
  temperature: 0.5,
};
