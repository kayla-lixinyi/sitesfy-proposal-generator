/**
 * Clients CRUD API
 * GET  /api/clients  — list clients
 * POST /api/clients  — create a new client
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, cuid, now } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { nameZh: { contains: search, mode: "insensitive" } },
      { websiteUrl: { contains: search, mode: "insensitive" } },
    ];
  }

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      include: {
        _count: { select: { proposals: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.client.count({ where }),
  ]);

  return NextResponse.json({ clients, total, page, limit });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const nameZh = typeof body.nameZh === "string" ? body.nameZh.trim() : "";
  const websiteUrl =
    typeof body.websiteUrl === "string" ? body.websiteUrl.trim() : "";
  const industry = typeof body.industry === "string" ? body.industry.trim() : "";
  const targetMarket =
    typeof body.targetMarket === "string" ? body.targetMarket.trim() : "";

  if (!name) {
    return NextResponse.json(
      { error: "name is required" },
      { status: 400 }
    );
  }

  try {
    const id = cuid();
    const timestamp = now();

    // Prisma v7 + WASM 编译器忽略 @id @default(cuid()) 和 @updatedAt 的显式值，
    // 用 $executeRaw 直接写入，绕过 ORM 层确保 id/updatedAt 不为 null
    await prisma.$executeRaw`
      INSERT INTO "Client" ("id", "name", "nameZh", "websiteUrl", "industry", "targetMarket", "createdAt", "updatedAt")
      VALUES (
        ${id},
        ${name},
        ${nameZh || null},
        ${websiteUrl || "https://placeholder.local"},
        ${industry || null},
        ${targetMarket || null},
        ${timestamp},
        ${timestamp}
      )
    `;
    const client = await prisma.client.findUnique({ where: { id } });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("[POST /api/clients] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "创建客户失败" },
      { status: 500 }
    );
  }
}
