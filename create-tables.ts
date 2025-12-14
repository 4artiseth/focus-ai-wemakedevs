#!/usr/bin/env tsx
/**
 * Create all tables in Supabase using raw SQL
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createTables() {
  console.log("🚀 Creating tables in Supabase\n");
  console.log("=".repeat(60));

  try {
    console.log("\n1️⃣ Connecting to Supabase...");
    await prisma.$connect();
    console.log("   ✅ Connected");

    console.log("\n2️⃣ Creating Project table...");
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Project" (
        "id" TEXT PRIMARY KEY,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "audience" TEXT NOT NULL,
        "demographics" TEXT,
        "researchGoal" TEXT NOT NULL,
        "panelSize" INTEGER NOT NULL DEFAULT 8
      );
    `);
    console.log("   ✅ Project table created");

    console.log("\n3️⃣ Creating Settings table...");
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Settings" (
        "id" TEXT PRIMARY KEY,
        "projectId" TEXT NOT NULL UNIQUE,
        "tone" INTEGER NOT NULL DEFAULT 50,
        "skepticism" INTEGER NOT NULL DEFAULT 50,
        "detailLevel" INTEGER NOT NULL DEFAULT 50,
        "analysisDepth" TEXT NOT NULL DEFAULT 'standard',
        CONSTRAINT "Settings_projectId_fkey" FOREIGN KEY ("projectId") 
          REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    console.log("   ✅ Settings table created");

    console.log("\n4️⃣ Creating ProjectDetails table...");
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ProjectDetails" (
        "id" TEXT PRIMARY KEY,
        "projectId" TEXT NOT NULL UNIQUE,
        "category" TEXT,
        "panelSize" INTEGER NOT NULL DEFAULT 8,
        "researchGoal" TEXT,
        "customQuestions" TEXT,
        "priceExpected" DOUBLE PRECISION,
        "priceMin" DOUBLE PRECISION,
        "priceMax" DOUBLE PRECISION,
        "pricingModel" TEXT,
        "coreFeatures" TEXT,
        "premiumFeatures" TEXT,
        "futureFeatures" TEXT,
        "conjointFeatures" TEXT,
        "competitors" TEXT,
        "personaConstraints" TEXT,
        "toneFormality" INTEGER DEFAULT 50,
        "toneSkepticism" INTEGER DEFAULT 50,
        "analysisDepth" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ProjectDetails_projectId_fkey" FOREIGN KEY ("projectId") 
          REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    console.log("   ✅ ProjectDetails table created");

    console.log("\n5️⃣ Creating Persona table...");
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Persona" (
        "id" TEXT PRIMARY KEY,
        "projectId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "age" INTEGER NOT NULL,
        "occupation" TEXT NOT NULL,
        "income" TEXT,
        "location" TEXT,
        "bio" TEXT NOT NULL,
        "traits" TEXT,
        CONSTRAINT "Persona_projectId_fkey" FOREIGN KEY ("projectId") 
          REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    console.log("   ✅ Persona table created");

    console.log("\n6️⃣ Creating Session table...");
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Session" (
        "id" TEXT PRIMARY KEY,
        "projectId" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'draft',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Session_projectId_fkey" FOREIGN KEY ("projectId") 
          REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    console.log("   ✅ Session table created");

    console.log("\n7️⃣ Creating Response table...");
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Response" (
        "id" TEXT PRIMARY KEY,
        "sessionId" TEXT NOT NULL,
        "personaId" TEXT NOT NULL,
        "question" TEXT NOT NULL,
        "answer" TEXT NOT NULL,
        "reasoning" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Response_sessionId_fkey" FOREIGN KEY ("sessionId") 
          REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "Response_personaId_fkey" FOREIGN KEY ("personaId") 
          REFERENCES "Persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `);
    console.log("   ✅ Response table created");

    console.log("\n8️⃣ Creating Insight table...");
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Insight" (
        "id" TEXT PRIMARY KEY,
        "sessionId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "confidence" DOUBLE PRECISION NOT NULL,
        "citations" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Insight_sessionId_fkey" FOREIGN KEY ("sessionId") 
          REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    console.log("   ✅ Insight table created");

    console.log("\n9️⃣ Creating indexes...");
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "Persona_projectId_idx" ON "Persona"("projectId")`
    );
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "Session_projectId_idx" ON "Session"("projectId")`
    );
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "Response_sessionId_idx" ON "Response"("sessionId")`
    );
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "Response_personaId_idx" ON "Response"("personaId")`
    );
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "Insight_sessionId_idx" ON "Insight"("sessionId")`
    );
    console.log("   ✅ Indexes created");

    console.log("\n🔟 Verifying tables...");
    const projectCount = await prisma.project.count();
    console.log(`   ✅ Project table working (${projectCount} records)`);

    await prisma.$disconnect();

    console.log("\n" + "=".repeat(60));
    console.log("\n🎉 SUCCESS! All tables created in Supabase");
    console.log("\n📝 Next steps:");
    console.log("   1. Refresh your Supabase dashboard");
    console.log("   2. You should see 7 tables in the 'public' schema");
    console.log("   3. Run: npx tsx verify-supabase.ts");
    console.log("   4. Start your app: npm run dev\n");
  } catch (error: any) {
    console.error("\n❌ Failed to create tables:", error.message);
    console.error("\n📋 Full error:", error);
    process.exit(1);
  }
}

createTables();
