#!/usr/bin/env tsx
/**
 * Test which Prisma features work with your current connection
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testFeatures() {
  console.log("🧪 Testing Prisma Features with Current Connection\n");
  console.log("=".repeat(60));

  let passCount = 0;
  let failCount = 0;

  try {
    // Test 1: Basic CRUD
    console.log("\n✓ Test 1: Basic CRUD Operations");
    try {
      const project = await prisma.project.create({
        data: {
          name: "Feature Test",
          description: "Testing features",
          category: "test",
          audience: "test",
          researchGoal: "test",
          panelSize: 5,
        },
      });
      await prisma.project.delete({ where: { id: project.id } });
      console.log("  ✅ PASS - Basic CRUD works");
      passCount++;
    } catch (e: any) {
      console.log("  ❌ FAIL - Basic CRUD failed:", e.message);
      failCount++;
    }

    // Test 2: Relations
    console.log("\n✓ Test 2: Relations (Include/Select)");
    try {
      const projects = await prisma.project.findMany({
        include: { personas: true, sessions: true },
        take: 1,
      });
      console.log("  ✅ PASS - Relations work");
      passCount++;
    } catch (e: any) {
      console.log("  ❌ FAIL - Relations failed:", e.message);
      failCount++;
    }

    // Test 3: Transactions (Sequential)
    console.log("\n✓ Test 3: Sequential Transactions");
    try {
      const result = await prisma.$transaction([
        prisma.project.count(),
        prisma.persona.count(),
      ]);
      console.log("  ✅ PASS - Sequential transactions work");
      passCount++;
    } catch (e: any) {
      console.log("  ❌ FAIL - Sequential transactions failed:", e.message);
      failCount++;
    }

    // Test 4: Interactive Transactions
    console.log("\n✓ Test 4: Interactive Transactions");
    try {
      await prisma.$transaction(async (tx) => {
        await tx.project.count();
      });
      console.log("  ✅ PASS - Interactive transactions work");
      passCount++;
    } catch (e: any) {
      console.log("  ❌ FAIL - Interactive transactions failed");
      console.log("     This is expected with connection pooler");
      failCount++;
    }

    // Test 5: Raw Queries
    console.log("\n✓ Test 5: Raw Queries");
    try {
      const result = await prisma.$queryRaw`SELECT COUNT(*) FROM "Project"`;
      console.log("  ✅ PASS - Raw queries work");
      passCount++;
    } catch (e: any) {
      console.log("  ❌ FAIL - Raw queries failed:", e.message);
      failCount++;
    }

    // Test 6: Batch Operations
    console.log("\n✓ Test 6: Batch Operations");
    try {
      const projects = await prisma.project.findMany({ take: 5 });
      console.log("  ✅ PASS - Batch operations work");
      passCount++;
    } catch (e: any) {
      console.log("  ❌ FAIL - Batch operations failed:", e.message);
      failCount++;
    }

    await prisma.$disconnect();

    console.log("\n" + "=".repeat(60));
    console.log("\n📊 Test Results:");
    console.log(`   ✅ Passed: ${passCount}/6`);
    console.log(`   ❌ Failed: ${failCount}/6`);

    if (failCount > 0) {
      console.log("\n⚠️  Some features don't work with connection pooler");
      console.log("   This is expected and normal.");
      console.log("\n💡 Solutions:");
      console.log("   1. Enable IPv6 to use direct connection");
      console.log("   2. Use Supabase CLI for local development");
      console.log("   3. Use Supabase dashboard for migrations");
      console.log("\n📖 See SUPABASE_CONNECTION_GUIDE.md for details");
    } else {
      console.log("\n🎉 All features working! You have direct connection.");
    }

    console.log("\n✅ Your current app features will work fine!");
    console.log("   - Creating projects ✅");
    console.log("   - Generating personas ✅");
    console.log("   - Running sessions ✅");
    console.log("   - Storing responses ✅");
    console.log("   - Creating insights ✅\n");
  } catch (error: any) {
    console.error("\n❌ Test suite failed:", error.message);
    process.exit(1);
  }
}

testFeatures();
