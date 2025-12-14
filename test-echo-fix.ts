import "dotenv/config";
import { prisma } from "./src/lib/prisma";

async function testEchoFix() {
  console.log("\n=== TESTING ANTI-ECHO CHAMBER FIX ===\n");

  // Find the latest session
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

  console.log("📊 Analyzing Session:", session.id);
  console.log("Project:", session.project.name);
  console.log("Total Responses:", session.responses.length);
  console.log("\n=== CHECKING FOR ECHO CHAMBER PATTERNS ===\n");

  // Group responses by question
  const responsesByQuestion = new Map<string, any[]>();
  session.responses.forEach((response: any) => {
    const question = response.question;
    if (!responsesByQuestion.has(question)) {
      responsesByQuestion.set(question, []);
    }
    responsesByQuestion.get(question)!.push(response);
  });

  let totalQuestions = 0;
  let questionsWithEchoing = 0;
  let totalUniqueAngles = 0;

  responsesByQuestion.forEach((responses, question) => {
    totalQuestions++;
    console.log(`\n📝 Question: "${question.substring(0, 80)}..."`);
    console.log(`   Responses: ${responses.length}\n`);

    // Check for echo patterns
    const echoPatterns = [
      "I agree with",
      "That's a great point",
      "Building on what",
      "I see both sides",
      "You make a valid point",
    ];

    let hasEchoing = false;
    const uniqueAngles = new Set<string>();

    responses.forEach((response: any) => {
      const answer = response.answer.toLowerCase();
      const hasEchoPattern = echoPatterns.some((pattern) =>
        answer.includes(pattern.toLowerCase())
      );

      if (hasEchoPattern) {
        hasEchoing = true;
        console.log(`   ⚠️  ${response.persona.name}: ECHOING DETECTED`);
        console.log(`      "${response.answer.substring(0, 100)}..."`);
      } else {
        console.log(`   ✓ ${response.persona.name}: UNIQUE PERSPECTIVE`);
        console.log(`      "${response.answer.substring(0, 100)}..."`);
      }

      // Extract key themes from reasoning
      if (response.reasoning) {
        const reasoning = response.reasoning.toLowerCase();
        // Look for personal references
        if (
          reasoning.includes("my") ||
          reasoning.includes("i'm a") ||
          reasoning.includes("as a")
        ) {
          uniqueAngles.add(response.persona.name);
        }
      }
    });

    if (hasEchoing) {
      questionsWithEchoing++;
    }

    totalUniqueAngles += uniqueAngles.size;
    console.log(
      `\n   Unique Perspectives: ${uniqueAngles.size}/${responses.length}`
    );
  });

  console.log("\n=== SUMMARY ===\n");
  console.log(`Total Questions: ${totalQuestions}`);
  console.log(`Questions with Echoing: ${questionsWithEchoing}`);
  console.log(
    `Echo Rate: ${((questionsWithEchoing / totalQuestions) * 100).toFixed(1)}%`
  );
  console.log(
    `Average Unique Perspectives per Question: ${(
      totalUniqueAngles / totalQuestions
    ).toFixed(1)}`
  );

  if (questionsWithEchoing === 0) {
    console.log("\n✅ SUCCESS: No echo chamber patterns detected!");
  } else {
    console.log(
      "\n⚠️  WARNING: Echo chamber patterns still present. May need further tuning."
    );
  }

  await prisma.$disconnect();
}

testEchoFix();
