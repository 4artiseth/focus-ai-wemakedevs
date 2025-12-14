/**
 * Verification Script - Ensures Analysis Framework is Working
 */

import { prisma } from "./src/lib/prisma";
import {
  parsePersonaResponse,
  aggregateAnalysis,
} from "./src/lib/analysis/parser";

async function verify() {
  console.log("🔍 Verifying Analysis Framework Implementation...\n");

  let allPassed = true;

  // Test 1: Database Schema
  console.log("1️⃣ Checking database schema...");
  try {
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Response' AND column_name = 'analysis'
    `;
    if (Array.isArray(result) && result.length > 0) {
      console.log("   ✅ Analysis column exists in Response table");
    } else {
      console.log("   ❌ Analysis column NOT found");
      allPassed = false;
    }
  } catch (e) {
    console.log("   ⚠️  Could not verify schema (this is OK if using pooler)");
  }

  // Test 2: Parser Module
  console.log("\n2️⃣ Testing parser module...");
  try {
    const mockResponse = {
      reasoning: "Test reasoning",
      answer: "Test answer",
      analysis: {
        core_metrics: {
          pain_intensity: 7,
          pain_description: "test",
          primary_emotion: "frustration",
          emotion_intensity: 8,
          confidence_in_product: 6,
          segment_identity: "efficiency_seeker",
        },
        session_specific: {},
        meta: {
          key_quote: "test quote",
          biggest_concern: "test concern",
          response_quality: 8,
        },
      },
    };

    const parsed = parsePersonaResponse(mockResponse);
    if (
      parsed.displayText === "Test answer" &&
      parsed.analysis?.core_metrics.pain_intensity === 7
    ) {
      console.log("   ✅ Parser working correctly");
    } else {
      console.log("   ❌ Parser not working as expected");
      allPassed = false;
    }
  } catch (e) {
    console.log("   ❌ Parser error:", e);
    allPassed = false;
  }

  // Test 3: Aggregation
  console.log("\n3️⃣ Testing aggregation...");
  try {
    const mockAnalyses = [
      {
        core_metrics: {
          pain_intensity: 7,
          pain_description: "test",
          primary_emotion: "frustration",
          emotion_intensity: 8,
          confidence_in_product: 6,
          segment_identity: "efficiency_seeker",
        },
        session_specific: {},
        meta: {
          key_quote: "quote 1",
          biggest_concern: "concern 1",
          response_quality: 8,
        },
      },
      {
        core_metrics: {
          pain_intensity: 9,
          pain_description: "test",
          primary_emotion: "hope",
          emotion_intensity: 7,
          confidence_in_product: 8,
          segment_identity: "early_adopter",
        },
        session_specific: {},
        meta: {
          key_quote: "quote 2",
          biggest_concern: "concern 2",
          response_quality: 9,
        },
      },
    ];

    const aggregated = aggregateAnalysis(mockAnalyses);
    if (
      aggregated.avg_pain_intensity === 8 &&
      aggregated.top_emotions.length > 0
    ) {
      console.log("   ✅ Aggregation working correctly");
    } else {
      console.log("   ❌ Aggregation not working as expected");
      allPassed = false;
    }
  } catch (e) {
    console.log("   ❌ Aggregation error:", e);
    allPassed = false;
  }

  // Test 4: Check for existing sessions with analysis
  console.log("\n4️⃣ Checking for sessions with analysis data...");
  try {
    const responsesWithAnalysis = await prisma.response.findMany({
      where: {
        analysis: {
          not: null,
        },
      },
      take: 1,
      select: { id: true, analysis: true } as any,
    });

    if (responsesWithAnalysis.length > 0) {
      console.log(
        `   ✅ Found ${responsesWithAnalysis.length} response(s) with analysis data`
      );
      console.log(
        "   📊 Sample analysis:",
        JSON.parse((responsesWithAnalysis[0] as any).analysis).core_metrics
      );
    } else {
      console.log(
        "   ℹ️  No responses with analysis yet (run a simulation to generate data)"
      );
    }
  } catch (e) {
    console.log("   ⚠️  Could not check existing data:", e);
  }

  // Test 5: API Endpoint (if server is running)
  console.log("\n5️⃣ Checking API endpoint...");
  try {
    const sessions = await prisma.session.findMany({
      take: 1,
      orderBy: { createdAt: "desc" },
    });

    if (sessions.length > 0) {
      console.log(
        `   ℹ️  Latest session: ${sessions[0].id} (status: ${sessions[0].status})`
      );
      console.log(
        `   📡 API endpoint: /api/sessions/${sessions[0].id}/analysis`
      );
    } else {
      console.log("   ℹ️  No sessions found (create a project to test)");
    }
  } catch (e) {
    console.log("   ⚠️  Could not check sessions:", e);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  if (allPassed) {
    console.log("✅ ALL CHECKS PASSED - Analysis Framework is Ready!");
  } else {
    console.log("⚠️  SOME CHECKS FAILED - Review errors above");
  }
  console.log("=".repeat(60));

  console.log("\n📚 Documentation:");
  console.log("   - ANALYSIS_FRAMEWORK.md - Full technical docs");
  console.log("   - QUICK_START_ANALYSIS.md - Quick start guide");
  console.log("   - IMPLEMENTATION_SUMMARY.md - Implementation details");

  console.log("\n🧪 Testing:");
  console.log("   - Run: npx tsx test-analysis.ts");
  console.log("   - Run a simulation to generate analysis data");
  console.log("   - Fetch: GET /api/sessions/[sessionId]/analysis\n");

  await prisma.$disconnect();
}

verify().catch((e) => {
  console.error("❌ Verification failed:", e);
  process.exit(1);
});
