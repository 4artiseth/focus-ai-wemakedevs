import "dotenv/config";
import { prisma } from "./src/lib/prisma";

async function debugFullSession() {
  try {
    console.log("\n=== FINDING LATEST SESSION ===\n");

    // Get the most recent session
    const session = await prisma.session.findFirst({
      where: {
        OR: [{ status: "running" }, { status: "completed" }],
      },
      include: {
        project: {
          include: {
            details: true,
            personas: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
        },
        responses: {
          include: { persona: true },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!session) {
      console.log("❌ No sessions found");
      return;
    }

    console.log("📊 SESSION INFO");
    console.log("  ID:", session.id);
    console.log("  Status:", session.status);
    console.log("  Project:", session.project.name);
    console.log("  Created:", session.createdAt);
    console.log("  Messages:", session.messages.length);
    console.log("  Responses:", session.responses.length);
    console.log("  Personas:", session.project.personas.length);

    console.log("\n=== PROJECT DETAILS ===\n");
    console.log("Name:", session.project.name);
    console.log(
      "Description:",
      session.project.description.substring(0, 100) + "..."
    );
    console.log("Category:", session.project.category);
    console.log("Research Goal:", session.project.researchGoal);

    console.log("\n=== PERSONAS ===\n");
    session.project.personas.forEach((p: any, i: number) => {
      console.log(`${i + 1}. ${p.name} (${p.age}, ${p.occupation})`);
      console.log(`   Income: ${p.income}`);
      console.log(`   Bio: ${p.bio.substring(0, 80)}...`);

      try {
        const traits = JSON.parse(p.traits || "{}");
        console.log(`   Attitude: ${traits.attitude || "N/A"}`);
        console.log(`   Communication: ${traits.communication_style || "N/A"}`);
      } catch (e) {
        console.log(`   Traits: ${p.traits?.substring(0, 50) || "N/A"}`);
      }
      console.log();
    });

    console.log("\n=== MESSAGES (Chronological) ===\n");
    session.messages.forEach((msg: any, i: number) => {
      const time = new Date(msg.createdAt).toLocaleTimeString();
      console.log(`[${time}] ${msg.sender}:`);
      console.log(`  "${msg.content}"`);
      if (msg.metadata) {
        console.log(`  Metadata: ${msg.metadata.substring(0, 100)}`);
      }
      console.log();
    });

    console.log("\n=== RESPONSES (What Got Saved) ===\n");
    if (session.responses.length === 0) {
      console.log("❌ NO RESPONSES SAVED!");
      console.log("\nThis means:");
      console.log("  1. Personas are not responding");
      console.log("  2. OR responses are failing the success check");
      console.log("  3. OR LLM is returning errors");
    } else {
      session.responses.forEach((res: any, i: number) => {
        console.log(`${i + 1}. ${res.persona.name}`);
        console.log(`   Question: "${res.question}"`);
        console.log(`   Answer: "${res.answer}"`);
        console.log(
          `   Reasoning: ${
            res.reasoning ? `"${res.reasoning.substring(0, 100)}..."` : "NONE"
          }`
        );
        console.log();
      });
    }

    console.log("\n=== WHAT MODERATOR IS ASKING ===\n");
    const moderatorMessages = session.messages.filter(
      (m: any) => m.sender === "Moderator"
    );
    moderatorMessages.forEach((msg: any, i: number) => {
      console.log(`Q${i + 1}: ${msg.content}`);
    });

    console.log("\n=== WHAT PERSONAS ARE SAYING ===\n");
    const personaMessages = session.messages.filter(
      (m: any) => m.sender !== "Moderator"
    );
    if (personaMessages.length === 0) {
      console.log("❌ NO PERSONA MESSAGES!");
      console.log("\nThis confirms personas are not responding at all.");
    } else {
      personaMessages.forEach((msg: any, i: number) => {
        console.log(`${msg.sender}: "${msg.content}"`);
      });
    }

    console.log("\n=== DIAGNOSIS ===\n");

    if (session.messages.length > 0 && session.responses.length === 0) {
      console.log("🔴 PROBLEM: Messages exist but no responses saved");
      console.log("\nPossible causes:");
      console.log("  1. success flag missing (we just fixed this)");
      console.log("  2. LLM returning errors");
      console.log("  3. getPersonaResponse throwing exceptions");
      console.log("\nNext step: Check server logs for errors");
    }

    if (personaMessages.length === 0) {
      console.log("🔴 PROBLEM: No persona messages in database");
      console.log("\nThis means:");
      console.log("  1. prisma.message.create() is failing");
      console.log("  2. OR loop is skipping all personas");
      console.log("  3. OR Prisma client not updated");
    }

    if (session.responses.length > 0 && session.responses[0].answer === "NO") {
      console.log("🔴 PROBLEM: Personas responding with just 'NO'");
      console.log("\nThis means:");
      console.log("  1. LLM not following JSON format");
      console.log("  2. Prompt not being sent correctly");
      console.log("  3. Context/question malformed");
    }

    console.log("\n=== RECONSTRUCTING WHAT PROMPT WAS SENT ===\n");

    if (session.project.personas.length > 0 && moderatorMessages.length > 0) {
      const samplePersona = session.project.personas[0];
      const sampleQuestion = moderatorMessages[0].content;

      console.log("Sample Persona:", samplePersona.name);
      console.log("Sample Question:", sampleQuestion);
      console.log("\nExpected System Prompt (simplified):");
      console.log(`---`);
      console.log(
        `You are ${samplePersona.name}, a ${samplePersona.age}-year-old ${samplePersona.occupation}.`
      );
      console.log(`Bio: ${samplePersona.bio.substring(0, 100)}...`);
      console.log(
        `\nYou are participating in a focus group for "${session.project.name}".`
      );
      console.log(`\nReturn JSON: { "reasoning": "...", "answer": "..." }`);
      console.log(`---`);

      console.log("\nExpected User Message:");
      console.log(`"${sampleQuestion}"`);
    }

    await prisma.$disconnect();
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    console.error(error);
  }
}

debugFullSession();
