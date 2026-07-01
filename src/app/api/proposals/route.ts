/**
 * Proposals CRUD API
 * GET  /api/proposals       — list proposals with filters
 * POST /api/proposals       — create a new proposal
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, cuid, now } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const clientId = searchParams.get("clientId");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const where: Record<string, unknown> = { authorId: session.user.id };
  if (status) where.status = status;
  if (clientId) where.clientId = clientId;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { client: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [proposals, total] = await Promise.all([
    prisma.proposal.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, nameZh: true } },
        author: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.proposal.count({ where }),
  ]);

  return NextResponse.json({ proposals, total, page, limit });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, clientId, duplicateFrom } = body;

  if (!title || !clientId) {
    return NextResponse.json(
      { error: "title and clientId are required" },
      { status: 400 }
    );
  }

  // If duplicating, copy section data from source proposal
  const sectionData: Record<string, unknown> = {};
  if (duplicateFrom) {
    const source = await prisma.proposal.findUnique({
      where: { id: duplicateFrom },
    });
    if (source) {
      const sectionKeys = [
        "heroData", "profileData", "diagnosisData", "competitorData",
        "serviceData", "pricingData", "outcomeData", "timelineData",
        "upsellData", "ctaData", "htmlContent",
      ];
      for (const key of sectionKeys) {
        const val = (source as Record<string, unknown>)[key];
        if (val !== null && val !== undefined) {
          sectionData[key] = val;
        }
      }
    }
  }

  try {
    const timestamp = now();
    const proposal = await prisma.proposal.create({
      data: {
        id: cuid(),
        title,
        clientId,
        authorId: session.user.id,
        status: "DRAFT",
        createdAt: timestamp,
        updatedAt: timestamp,
        ...sectionData,
      },
      include: {
        client: { select: { id: true, name: true } },
      },
    });

    await prisma.activity.create({
      data: {
        id: cuid(),
        type: duplicateFrom ? "PROPOSAL_DUPLICATED" : "PROPOSAL_CREATED",
        description: duplicateFrom
          ? `复制了提案「${title}」`
          : `创建了提案「${title}」`,
        userId: session.user.id,
        proposalId: proposal.id,
        createdAt: now(),
      },
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (error) {
    console.error("[POST /api/proposals] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "创建提案失败" },
      { status: 500 }
    );
  }
}
