import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { productName, features, category, description, coreFeatures } =
      await request.json();

    if (!productName) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Perplexity API key not configured" },
        { status: 500 }
      );
    }

    // Build comprehensive search query with all context
    const categoryContext = category ? ` (${category} category)` : "";
    const descriptionContext = description
      ? `\n\nProduct Description: ${description}`
      : "";
    const coreFeaturesList = coreFeatures
      ? `\n\nCore Features: ${coreFeatures}`
      : "";
    const additionalFeatures =
      features && features.length > 0
        ? `\n\nAdditional Features: ${features.slice(0, 5).join(", ")}`
        : "";

    const query = `Find the top 5 CURRENT competitors for ${productName}${categoryContext} as of 2024-2025.${descriptionContext}${coreFeaturesList}${additionalFeatures}

For EACH competitor provide:
1) Company name and product name
2) DETAILED pricing with ALL tiers (Free, Basic, Pro, Enterprise, etc.)
3) Specify if pricing is Monthly, Annual, or One-time
4) List 5-7 KEY features for each tier
5) Target market/audience

Format each competitor clearly with pricing breakdowns. Use LATEST 2024-2025 pricing data.`;

    // Call Perplexity API
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
      console.error("Perplexity API error:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch competitor data" },
        { status: response.status }
      );
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "No results found";

    // Clean up the response - remove thinking tags and citations
    content = content.replace(/<think>[\s\S]*?<\/think>/g, "");
    content = content.replace(/\[\d+\]/g, ""); // Remove citation numbers like [1], [2]
    content = content.trim();

    return NextResponse.json({
      success: true,
      data: content,
      query: query,
    });
  } catch (error) {
    console.error("Competitor search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
