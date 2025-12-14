import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Explicitly set connection limit to 10 to prevent "connection limit: 1" timeouts
const dbUrl = process.env.DATABASE_URL || "";
const connectionString = dbUrl.includes("?")
  ? `${dbUrl}&connection_limit=20`
  : `${dbUrl}?connection_limit=20`;

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: connectionString,
    },
  },
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
