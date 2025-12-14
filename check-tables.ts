import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkTables() {
  try {
    console.log("Checking if tables exist...\n");

    // Use raw SQL to check tables
    const tables = await prisma.$queryRawUnsafe<any[]>(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log("Tables found:");
    tables.forEach((t: any) => console.log(`  - ${t.table_name}`));

    console.log(`\nTotal: ${tables.length} tables`);

    await prisma.$disconnect();
  } catch (error: any) {
    console.error("Error:", error.message);
  }
}

checkTables();
