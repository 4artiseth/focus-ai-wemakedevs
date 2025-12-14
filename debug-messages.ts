import "dotenv/config";
import { prisma } from "./src/lib/prisma";

async function debugMessages() {
  try {
    // Find the most recent running or completed session
    const session = await prisma.session.findFirst({
      where: {
        OR: [{ status: "running" }, { status: "completed" }],
      },
      include: {
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
      console.log("No sessions found");
      return;
    }

    console.log("\n=== SESSION DEBUG ===");
    console.log("Session ID:", session.id);
    console.log("Status:", session.status);
    console.log("Messages count:", session.messages?.length || 0);
    console.log("Responses count:", session.responses?.length || 0);

    console.log("\n=== MESSAGES ===");
    session.messages?.slice(0, 5).forEach((msg: any, i: number) => {
      console.log(`\n${i + 1}. ${msg.sender} (${msg.createdAt})`);
      console.log("   Content:", msg.content.substring(0, 100));
      console.log("   Metadata:", msg.metadata ? "Yes" : "No");
    });

    console.log("\n=== RESPONSES ===");
    session.responses?.slice(0, 5).forEach((res: any, i: number) => {
      console.log(`\n${i + 1}. ${res.persona?.name || "Unknown"}`);
      console.log("   Question:", res.question.substring(0, 50));
      console.log(
        "   Answer:",
        res.answer ? res.answer.substring(0, 100) : "NO ANSWER"
      );
      console.log("   Reasoning:", res.reasoning ? "Yes" : "No");
    });

    await prisma.$disconnect();
  } catch (error: any) {
    console.error("Error:", error.message);
  }
}

debugMessages();
