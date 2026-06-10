import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// PrismaPg 适配器不会自动处理 @updatedAt，需要在 create 时手动注入
const MODELS_WITH_UPDATED_AT = new Set([
  "User", "Client", "Proposal", "ProposalTemplate", "GenerationJob",
]);

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  const client = new PrismaClient({ adapter });

  client.$use(async (params: { model?: string; action: string; args: { data?: Record<string, unknown> } }, next: (params: unknown) => Promise<unknown>) => {
    if (
      params.model &&
      MODELS_WITH_UPDATED_AT.has(params.model) &&
      params.action === "create" &&
      params.args.data &&
      !params.args.data.updatedAt
    ) {
      params.args.data.updatedAt = new Date();
    }
    return next(params);
  });

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
