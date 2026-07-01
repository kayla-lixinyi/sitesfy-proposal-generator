/**
 * Single proposal API
 * GET    /api/proposals/[id]  — get proposal detail
 * PATCH  /api/proposals/[id]  — update proposal
 * DELETE /api/proposals/[id]  — delete proposal
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, cuid, now } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      client: true,
      author: { select: { id: true, name: true, email: true } },
      template: { select: { id: true, name: true } },
      jobs: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (proposal.authorId !== session.user!.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(proposal);
}

const SECTION_LABELS: Record<string, string> = {
  heroData: "Hero 封面",
  profileData: "公司画像",
  diagnosisData: "机会与诊断",
  competitorData: "竞品对标矩阵",
  serviceData: "服务方案",
  pricingData: "合作结构",
  outcomeData: "预期效果",
  timelineData: "执行路径",
  upsellData: "更多可能",
  ctaData: "行动召唤",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "草稿",
  GENERATING: "生成中",
  REVIEW: "待审核",
  APPROVED: "已通过",
  SENT: "已发送",
  ARCHIVED: "已归档",
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  // Allow updating section data, title, status
  const sectionFields = [
    "heroData",
    "profileData",
    "diagnosisData",
    "competitorData",
    "serviceData",
    "pricingData",
    "outcomeData",
    "timelineData",
    "upsellData",
    "ctaData",
  ];

  const allowedFields = [
    "title",
    "status",
    ...sectionFields,
    "htmlContent",
    "qualityScore",
    "qualityChecks",
  ];

  const data: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) {
      data[field] = body[field];
    }
  }

  // Get old proposal for change detection + ownership check
  const oldProposal = await prisma.proposal.findUnique({
    where: { id },
    select: { status: true, title: true, authorId: true },
  });

  if (!oldProposal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (oldProposal.authorId !== session.user!.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const proposal = await prisma.proposal.update({
    where: { id },
    data,
    include: {
      client: { select: { id: true, name: true } },
    },
  });

  // Log activities for meaningful changes
  const activities: { type: string; description: string }[] = [];

  if ("status" in body && oldProposal && body.status !== oldProposal.status) {
    activities.push({
      type: "STATUS_CHANGED",
      description: `提案状态从「${STATUS_LABELS[oldProposal.status] ?? oldProposal.status}」变更为「${STATUS_LABELS[body.status] ?? body.status}」`,
    });
  }

  if ("title" in body && oldProposal && body.title !== oldProposal.title) {
    activities.push({
      type: "TITLE_CHANGED",
      description: `提案标题修改为「${body.title}」`,
    });
  }

  const editedSections = sectionFields.filter((f) => f in body);
  if (editedSections.length > 0 && !("status" in body)) {
    const labels = editedSections.map((f) => SECTION_LABELS[f] ?? f).join("、");
    activities.push({
      type: "SECTION_EDITED",
      description: `编辑了段落：${labels}`,
    });
  }

  if (activities.length > 0) {
    await prisma.activity.createMany({
      data: activities.map((a) => ({
        id: cuid(),
        ...a,
        userId: session.user!.id,
        proposalId: id,
      })),
    });
  }

  return NextResponse.json(proposal);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Get proposal info before deleting for activity log
  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: { client: { select: { name: true } } },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (proposal.authorId !== session.user!.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Log activity before cascade delete removes it
  await prisma.activity.create({
    data: {
      id: cuid(),
      type: "PROPOSAL_DELETED",
      description: `删除了提案「${proposal.title}」（客户：${proposal.client.name}）`,
      userId: session.user!.id,
      // Don't link proposalId since it's about to be deleted
      createdAt: now(),
    },
  });

  await prisma.proposal.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
