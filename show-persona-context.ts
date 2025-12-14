import "dotenv/config";
import { prisma } from "./src/lib/prisma";

async function showPersonaContext() {
  try {
    const project = await prisma.project.findFirst({
      where: { name: { contains: "BlockM8" } },
      include: { details: true, personas: { take: 1 } },
    });

    if (!project) {
      console.log("No project found");
      return;
    }

    const persona = project.personas[0];
    const sampleQuestion =
      "Tell me about the last time you had a problem related to service.";

    console.log("\n=== WHAT PERSONA RECEIVES IN EACH API CALL ===\n");

    console.log("📋 SYSTEM PROMPT (Who they are):");
    console.log("─".repeat(60));
    console.log(
      `You are ${persona.name}, a ${persona.age}-year-old ${persona.occupation}.`
    );
    console.log(`Bio: ${persona.bio}`);

    try {
      const traits = JSON.parse(persona.traits || "{}");
      console.log(`Attitude: ${traits.attitude}`);
      console.log(`Communication Style: ${traits.communication_style}`);
      console.log(`Hidden Agenda: ${traits.hidden_agenda}`);
    } catch (e) {}

    console.log("\nYou are participating in a focus group.");
    console.log("\nINSTRUCTIONS:");
    console.log(
      "- Think like a real human (show anxiety, excitement, confusion)"
    );
    console.log("- Reference YOUR specific life and problems");
    console.log("- Be conversational, not formal");
    console.log("\nReturn JSON: { reasoning: '...', answer: '...' }");

    console.log("\n\n📦 USER MESSAGE (Context + Question):");
    console.log("─".repeat(60));

    const productContext = `
PRODUCT CONTEXT:
- Name: ${project.name}
- Description: ${project.description}
- Category: ${project.category}
- Target Audience: ${project.audience}
${
  project.details?.coreFeatures
    ? `- Core Features: ${project.details.coreFeatures}`
    : ""
}
${
  project.details?.premiumFeatures
    ? `- Premium Features: ${project.details.premiumFeatures}`
    : ""
}
${
  project.details?.priceExpected
    ? `- Expected Price: $${project.details.priceExpected}`
    : ""
}
${
  project.details?.competitors
    ? `- Competitors: ${project.details.competitors}`
    : ""
}

CONVERSATION SO FAR:
[Previous messages would be here]

CURRENT QUESTION: ${sampleQuestion}
`;

    console.log(productContext);

    console.log("\n\n✅ WHAT THIS MEANS:");
    console.log("─".repeat(60));
    console.log("✅ Persona knows WHO they are (name, age, job, bio)");
    console.log("✅ Persona knows their ATTITUDE and COMMUNICATION STYLE");
    console.log(
      "✅ Persona knows the FULL PRODUCT (description, features, price)"
    );
    console.log("✅ Persona sees RECENT CONVERSATION (last 5 messages)");
    console.log("✅ Persona gets the CURRENT QUESTION");

    console.log("\n\n🎯 EXPECTED RESPONSE:");
    console.log("─".repeat(60));
    console.log(
      "{\n  \"reasoning\": \"Okay so they're asking about problems with business development. Last month I was trying to close a deal with this DeFi protocol and I had NO idea who to talk to. Spent 3 weeks in their Discord just trying to find the right person. It was exhausting. I'm making $75k which sounds good but I'm bootstrapping this compliance firm and every hour wasted is money lost. So when I hear 'BlockM8' I'm thinking... does this actually solve that? Or is it just another tool I have to learn?\",\n  \"answer\": \"Honestly? Last month I wasted 3 weeks trying to find the right contact at a DeFi protocol. Just endless Discord messages, no clear BD process. As someone running a compliance firm, that's time I can't afford to lose. So I'm curious if BlockM8 actually solves that or if it's just another platform to manage.\"\n}"
    );

    console.log("\n\n📊 CONTEXT IS SENT:");
    console.log("─".repeat(60));
    console.log("✅ EVERY API CALL - Full context sent each time");
    console.log(
      "✅ UPDATED CONTEXT - Includes last 5 messages from conversation"
    );
    console.log(
      "✅ RICH CONTEXT - Product details, features, price, competitors"
    );

    await prisma.$disconnect();
  } catch (error: any) {
    console.error("Error:", error.message);
  }
}

showPersonaContext();
