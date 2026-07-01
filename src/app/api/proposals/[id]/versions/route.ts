/**
 * Proposal versions API.
 * GET  /api/proposals/[id]/versions — list versions
 * POST /api/proposals/[id]/versions — create a version snapshot
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

  const versions = await prisma.proposalVersion.findMany({
    where: { proposalId: id },
    orderBy: { versionNumber: "desc" },
    select: {
      id: true,
      versionNumber: true,
      createdAt: true,
    },
  });

  return NextResponse.json(versions);
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const proposal = await prisma.proposal.findUnique({
    where: { id },
  });

  if (!proposal || !proposal.htmlContent) {
    return NextResponse.json(
      { error: "Proposal has no HTML content to snapshot" },
      { status: 400 }
    );
  }

  // Get next version number
  const lastVersion = await prisma.proposalVersion.findFirst({
    where: { proposalId: id },
    orderBy: { versionNumber: "desc" },
  });
  const nextVersion = (lastVersion?.versionNumber ?? 0) + 1;

  const sectionData = {
    heroData: proposal.heroData,
    profileData: proposal.profileData,
    diagnosisData: proposal.diagnosisData,
    competitorData: proposal.competitorData,
    serviceData: proposal.serviceData,
    pricingData: proposal.pricingData,
    outcomeData: proposal.outcomeData,
    timelineData: proposal.timelineData,
    upsellData: proposal.upsellData,
    ctaData: proposal.ctaData,
  };

  const version = await prisma.proposalVersion.create({
    data: {
      id: cuid(),
      proposalId: id,
      versionNumber: nextVersion,
      htmlContent: proposal.htmlContent,
      sectionData: sectionData as object,
      createdAt: now(),
    },
  });

  await prisma.activity.create({
    data: {
      id: cuid(),
      type: "VERSION_CREATED",
      description: `保存了版本 v${nextVersion}`,
      userId: session.user.id,
      proposalId: id,
      createdAt: now(),
    },
  });

  return NextResponse.json(version, { status: 201 });
}
