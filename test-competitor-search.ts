// Test script for Perplexity competitor search
async function testCompetitorSearch() {
  const apiKey = process.env.PERPLEXITY_API_KEY || "your_api_key_here";

  const productName = "TaskMaster Pro";
  const category = "SaaS";
  const description =
    "A modern project management tool that helps teams collaborate efficiently and track progress in real-time.";
  const coreFeatures = "Task lists, Reminders, Mobile App, Team Collaboration";

  const categoryContext = category ? ` (${category} category)` : "";
  const descriptionContext = description
    ? `\n\nProduct Description: ${description}`
    : "";
  const coreFeaturesList = coreFeatures
    ? `\n\nCore Features: ${coreFeatures}`
    : "";

  const query = `Find the top 5 CURRENT competitors for ${productName}${categoryContext} as of 2024-2025.${descriptionContext}${coreFeaturesList}

For EACH competitor provide:
1) Company name and product name
2) DETAILED pricing with ALL tiers (Free, Basic, Pro, Enterprise, etc.)
3) Specify if pricing is Monthly, Annual, or One-time
4) List 5-7 KEY features for each tier
5) Target market/audience

Format each competitor clearly with pricing breakdowns. Use LATEST 2024-2025 pricing data.`;

  console.log("Testing Perplexity API...");
  console.log("Query:", query);
  console.log("");

  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content:
              "You are a market research analyst. Search the web and provide a comprehensive competitor analysis with DETAILED pricing and features. Use your web search capabilities to find the LATEST 2024-2025 pricing data from official sources. Format clearly with pricing tiers, billing cycles (monthly/annual/one-time), and key features. Do NOT include sources, citations, or reference numbers in the output - just the clean competitor data.",
          },
          {
            role: "user",
            content: query,
          },
        ],
        temperature: 0.2,
        max_tokens: 3000,
        return_citations: false,
        return_images: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      return;
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "No results";

    // Clean up the response
    content = content.replace(/<think>[\s\S]*?<\/think>/g, "");
    content = content.replace(/\[\d+\]/g, "");
    content = content.trim();

    console.log("✅ Success!");
    console.log("");
    console.log("Response:");
    console.log("─".repeat(80));
    console.log(content);
    console.log("─".repeat(80));
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testCompetitorSearch();
