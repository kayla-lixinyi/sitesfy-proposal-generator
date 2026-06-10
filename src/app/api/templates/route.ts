/**
 * Templates CRUD API
 * GET  /api/templates  — list templates
 * POST /api/templates  — create template (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, cuid, now } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const templates = await prisma.proposalTemplate.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      isLocked: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { proposals: true } },
    },
  });

  return NextResponse.json({ templates });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRole = (session.user as { role?: string }).role;
  if (userRole !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await request.json();
  const { name, cssContent, htmlSkeleton, placeholders } = body;

  if (!name || !cssContent || !htmlSkeleton) {
    return NextResponse.json(
      { error: "name, cssContent, and htmlSkeleton are required" },
      { status: 400 }
    );
  }

  const template = await prisma.proposalTemplate.create({
    data: {
      id: cuid(),
      name,
      cssContent,
      htmlSkeleton,
      placeholders: placeholders ?? [],
      updatedAt: now(),
    },
  });

  return NextResponse.json(template, { status: 201 });
}
