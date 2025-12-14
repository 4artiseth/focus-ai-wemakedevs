import "dotenv/config";
import { prisma } from "./src/lib/prisma";

async function testDatabase() {
  try {
    console.log("Testing database connection...");
    console.log(
      "Database URL:",
      process.env.DATABASE_URL?.substring(0, 30) + "..."
    );

    // Try to connect
    await prisma.$connect();
    console.log("✓ Database connected successfully");

    // Try a simple query
    const projectCount = await prisma.project.count();
    console.log(`✓ Found ${projectCount} projects in database`);

    await prisma.$disconnect();
    console.log("✓ Database test completed");
  } catch (error) {
    console.error("✗ Database connection failed:", error);
    process.exit(1);
  }
}

testDatabase();
