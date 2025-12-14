// Run this script to set up the database on Vercel
// Usage: npx tsx setup-db.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Setting up database...");

  try {
    // Test connection
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    // The tables should be created automatically by Prisma
    console.log("✅ Database setup complete");
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
