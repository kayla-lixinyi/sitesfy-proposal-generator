import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { randomUUID } from "crypto";

/**
 * PrismaPg 适配器不自动处理 @default(cuid()) 和 @updatedAt，
 * 所有 create() 调用必须显式传入 id 和 updatedAt。
 * 用 cuid() 生成唯一 ID，用 now() 生成时间戳。
 */
export function cuid() {
  return randomUUID();
}

export function now() {
  return new Date();
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

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
  return new PrismaClient({ adapter });
}

/**
 * 延迟初始化 Prisma 客户端。
 * 构建时 DATABASE_URL 不可用，顶层初始化会导致构建失败。
 * 用 Proxy 拦截属性访问，首次使用时才创建真实客户端。
 */
function getLazyPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getLazyPrisma();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
