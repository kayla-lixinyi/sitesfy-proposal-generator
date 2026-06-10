import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { randomUUID } from "crypto";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// PrismaPg 适配器不自动处理 @default(cuid()) 和 @updatedAt，
// 通过 Proxy 拦截 create/createMany/update/updateMany 操作自动注入
const MODELS_WITH_UPDATED_AT = new Set([
  "user", "client", "proposal", "proposalTemplate", "generationJob",
]);

function injectDefaults(model: string, data: Record<string, unknown>) {
  if (!data.id) data.id = randomUUID();
  if (MODELS_WITH_UPDATED_AT.has(model) && !data.updatedAt) {
    data.updatedAt = new Date();
  }
}

function injectUpdatedAt(model: string, data: Record<string, unknown>) {
  if (MODELS_WITH_UPDATED_AT.has(model) && !data.updatedAt) {
    data.updatedAt = new Date();
  }
}

function wrapPrisma(client: PrismaClient): PrismaClient {
  return new Proxy(client, {
    get(target, prop: string) {
      const value = (target as unknown as Record<string, unknown>)[prop];
      if (typeof value !== "object" || value === null) return value;

      // 拦截模型访问（如 prisma.client, prisma.proposal 等）
      return new Proxy(value, {
        get(modelTarget, method: string) {
          const original = (modelTarget as Record<string, unknown>)[method];
          if (typeof original !== "function") return original;

          if (method === "create") {
            return (args: { data: Record<string, unknown>; [k: string]: unknown }) => {
              injectDefaults(prop, args.data);
              return (original as Function).call(modelTarget, args);
            };
          }
          if (method === "createMany") {
            return (args: { data: Record<string, unknown> | Record<string, unknown>[]; [k: string]: unknown }) => {
              const items = Array.isArray(args.data) ? args.data : [args.data];
              for (const item of items) injectDefaults(prop, item);
              return (original as Function).call(modelTarget, args);
            };
          }
          if (method === "update" || method === "updateMany") {
            return (args: { data: Record<string, unknown>; [k: string]: unknown }) => {
              injectUpdatedAt(prop, args.data);
              return (original as Function).call(modelTarget, args);
            };
          }
          return original;
        },
      });
    },
  }) as PrismaClient;
}

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
  return wrapPrisma(new PrismaClient({ adapter }));
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
