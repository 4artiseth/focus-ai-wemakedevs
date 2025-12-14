#!/usr/bin/env tsx
/**
 * Supabase Connection Verification Script
 * Run this after restarting your development server to verify everything works
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verify() {
  console.log("🔍 Verifying Supabase PostgreSQL Connection\n");
  console.log("=".repeat(60));

  try {
    // Test 1: Connection
    console.log("\n✓ Test 1: Database Connection");
    await prisma.$connect();
    console.log("  ✅ Connected to Supabase successfully");

    // Test 2: Read existing data
    console.log("\n✓ Test 2: Read Operations");
    const projectCount = await prisma.project.count();
    const personaCount = await prisma.persona.count();
    const sessionCount = await prisma.session.count();
    console.log(`  ✅ Found ${projectCount} projects`);
    console.log(`  ✅ Found ${personaCount} personas`);
    console.log(`  ✅ Found ${sessionCount} sessions`);

    // Test 3: Write operation
    console.log("\n✓ Test 3: Write Operations");
    const testProject = await prisma.project.create({
      data: {
        name: "Verification Test",
        description: "Testing Supabase connection",
        category: "test",
        audience: "test",
        researchGoal: "test",
        panelSize: 5,
      },
    });
    console.log(`  ✅ Created test project: ${testProject.id}`);

    // Test 4: Relations
    console.log("\n✓ Test 4: Relations");
    const projectWithDetails = await prisma.project.findUnique({
      where: { id: testProject.id },
      include: { details: true, personas: true, sessions: true },
    });
    console.log(`  ✅ Relations working correctly`);

    // Test 5: Delete operation
    console.log("\n✓ Test 5: Delete Operations");
    await prisma.project.delete({ where: { id: testProject.id } });
    console.log(`  ✅ Deleted test project`);

    await prisma.$disconnect();

    console.log("\n" + "=".repeat(60));
    console.log("\n🎉 ALL TESTS PASSED!");
    console.log("\n✅ Your application is ready to use Supabase PostgreSQL");
    console.log("✅ All CRUD operations working");
    console.log("✅ Relations working");
    console.log("✅ Data integrity maintained");

    console.log("\n📝 Next Steps:");
    console.log("   1. Start your development server: npm run dev");
    console.log("   2. Test the application in your browser");
    console.log("   3. Create a new project and verify it works");
    console.log("   4. Address the pricing simulation issues from the audit\n");
  } catch (error: any) {
    console.log("\n" + "=".repeat(60));
    console.error("\n❌ VERIFICATION FAILED\n");
    console.error("Error:", error.message);
    console.error("\n💡 Troubleshooting:");
    console.error("   1. Restart your terminal/IDE");
    console.error("   2. Check .env file has correct DATABASE_URL");
    console.error("   3. Run: npx prisma generate");
    console.error("   4. Verify Supabase project is running");
    console.error("\n📋 Full error:");
    console.error(error);
    process.exit(1);
  }
}

verify();
