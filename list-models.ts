import "dotenv/config";

async function listModels() {
  const apiKey = process.env.GOOGLE_API_KEY;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    const data = await response.json();

    console.log("Available models:");
    data.models?.forEach((model: any) => {
      if (model.supportedGenerationMethods?.includes("generateContent")) {
        console.log(`- ${model.name.replace("models/", "")}`);
      }
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

listModels();
