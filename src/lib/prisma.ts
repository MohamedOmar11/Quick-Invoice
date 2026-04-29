import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(
      new Pool(
        process.env.DATABASE_URL &&
          (process.env.DATABASE_URL.includes("supabase.co") ||
            process.env.DATABASE_URL.includes("supabase.com"))
          ? {
              connectionString: process.env.DATABASE_URL,
              ssl: { rejectUnauthorized: false },
            }
          : {
              connectionString: process.env.DATABASE_URL,
            }
      )
    ),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
