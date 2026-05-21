/**
 * Restore a specific version.
 * POST /api/proposals/[id]/versions/[versionId]/restore
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, versionId } = await params;

  const version = await prisma.proposalVersion.findUnique({
    where: { id: versionId },
  });

  if (!version || version.proposalId !== id) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 });
  }

  const sectionData = (version.sectionData ?? {}) as Record<string, unknown>;

  await prisma.proposal.update({
    where: { id },
    data: {
      htmlContent: version.htmlContent,
      heroData: (sectionData.heroData as object) ?? undefined,
      profileData: (sectionData.profileData as object) ?? undefined,
      diagnosisData: (sectionData.diagnosisData as object) ?? undefined,
      competitorData: (sectionData.competitorData as object) ?? undefined,
      serviceData: (sectionData.serviceData as object) ?? undefined,
      pricingData: (sectionData.pricingData as object) ?? undefined,
      outcomeData: (sectionData.outcomeData as object) ?? undefined,
      timelineData: (sectionData.timelineData as object) ?? undefined,
      upsellData: (sectionData.upsellData as object) ?? undefined,
      ctaData: (sectionData.ctaData as object) ?? undefined,
    },
  });

  await prisma.activity.create({
    data: {
      type: "VERSION_RESTORED",
      description: `恢复到版本 v${version.versionNumber}`,
      userId: session.user.id,
      proposalId: id,
    },
  });

  return NextResponse.json({ success: true });
}
