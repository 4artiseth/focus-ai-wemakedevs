#!/usr/bin/env tsx
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addMessageTable() {
  try {
    console.log("Adding Message table to Supabase...\n");

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Message" (
        "id" TEXT PRIMARY KEY,
        "sessionId" TEXT NOT NULL,
        "sender" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "metadata" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Message_sessionId_fkey" FOREIGN KEY ("sessionId") 
          REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    console.log("✅ Message table created");

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Message_sessionId_idx" ON "Message"("sessionId");
    `);

    console.log("✅ Index created");

    // Test it
    const count = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) FROM "Message"`
    );
    console.log("✅ Table verified:", count);

    await prisma.$disconnect();
    console.log("\n🎉 Message table added successfully!");
  } catch (error: any) {
    console.error("❌ Failed:", error.message);
    process.exit(1);
  }
}

addMessageTable();
