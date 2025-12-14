import "dotenv/config";
import { prisma } from "./src/lib/prisma";

async function compareResponses() {
  console.log("\n=== PERSONA RESPONSE COMPARISON ===\n");

  const session = await prisma.session.findFirst({
    where: {
      OR: [{ status: "running" }, { status: "completed" }],
    },
    include: {
      project: {
        include: {
          personas: true,
        },
      },
      responses: {
        include: { persona: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!session || session.responses.length === 0) {
    console.log("❌ No session with responses found");
    return;
  }

  // Pick the first question with multiple responses
  const firstQuestion = session.responses[0].question;
  const responsesToQuestion = session.responses.filter(
    (r: any) => r.question === firstQuestion
  );

  console.log(`Question: "${firstQuestion}"\n`);
  console.log("=".repeat(80));

  responsesToQuestion.forEach((response: any) => {
    const persona = response.persona;

    // Parse traits
    let traits: any = {};
    try {
      traits = persona.traits ? JSON.parse(persona.traits) : {};
    } catch (e) {
      traits = {};
    }

    console.log(`\n👤 ${persona.name}`);
    console.log(`   Age: ${persona.age} | Occupation: ${persona.occupation}`);
    console.log(`   Income: ${persona.income}`);
    console.log(`   Attitude: ${traits.attitude || "Unknown"}`);
    console.log(`   Experience: ${traits.experience_level || "Unknown"}`);
    console.log(`   Values: ${traits.life_values || "Unknown"}`);
    console.log(`\n   💭 Internal Reasoning:`);
    if (response.reasoning) {
      const reasoning = response.reasoning.substring(0, 200);
      console.log(
        `   "${reasoning}${response.reasoning.length > 200 ? "..." : ""}"`
      );
    } else {
      console.log(`   (No reasoning captured)`);
    }
    console.log(`\n   💬 Public Response:`);
    console.log(`   "${response.answer}"`);
    console.log("\n" + "-".repeat(80));
  });

  console.log("\n=== DIVERSITY ANALYSIS ===\n");

  // Check for unique themes
  const themes = new Set<string>();
  const concerns = new Set<string>();

  responsesToQuestion.forEach((response: any) => {
    const answer = response.answer.toLowerCase();

    // Extract key themes
    if (
      answer.includes("price") ||
      answer.includes("cost") ||
      answer.includes("expensive")
    ) {
      themes.add("price_concern");
    }
    if (answer.includes("time") || answer.includes("busy")) {
      themes.add("time_concern");
    }
    if (
      answer.includes("trust") ||
      answer.includes("security") ||
      answer.includes("privacy")
    ) {
      themes.add("trust_concern");
    }
    if (
      answer.includes("simple") ||
      answer.includes("easy") ||
      answer.includes("complicated")
    ) {
      themes.add("complexity_concern");
    }
    if (
      answer.includes("family") ||
      answer.includes("kids") ||
      answer.includes("children")
    ) {
      themes.add("family_context");
    }
    if (
      answer.includes("work") ||
      answer.includes("job") ||
      answer.includes("career")
    ) {
      themes.add("work_context");
    }
  });

  console.log(`Unique Themes Mentioned: ${themes.size}`);
  console.log(`Themes: ${Array.from(themes).join(", ")}`);
  console.log(`\nDiversity Score: ${themes.size >= 3 ? "✅ GOOD" : "⚠️  LOW"}`);
  console.log(`(Good diversity = 3+ unique themes across responses)`);

  await prisma.$disconnect();
}

compareResponses();
