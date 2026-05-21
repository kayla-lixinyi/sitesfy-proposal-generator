/**
 * Trigger proposal generation (AI pipeline).
 * POST /api/proposals/[id]/generate
 *
 * Kicks off the full generation pipeline:
 * 1. Fetches client research data (or runs research if missing)
 * 2. Generates 10 sections serially
 * 3. Renders HTML
 * 4. Updates proposal record
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchWebsiteContent, runResearch } from "@/lib/pipeline/research";
import { generateSections } from "@/lib/pipeline/generate";
import { renderProposal, type ProposalSections } from "@/lib/template-engine";

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
    include: { client: true },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  // Create generation job
  const job = await prisma.generationJob.create({
    data: {
      proposalId: id,
      status: "RUNNING",
      currentStep: "初始化",
      progress: 0,
      startedAt: new Date(),
      stepsLog: [],
    },
  });

  // Update proposal status
  await prisma.proposal.update({
    where: { id },
    data: { status: "GENERATING" },
  });

  // Run pipeline in background (non-blocking response)
  runPipeline(id, proposal.client, job.id, session.user.id).catch(
    console.error
  );

  return NextResponse.json({
    jobId: job.id,
    message: "Generation started",
  });
}

async function runPipeline(
  proposalId: string,
  client: {
    id: string;
    name: string;
    websiteUrl: string;
    hardData: unknown;
    ecosystem: unknown;
    differentiation: unknown;
    weaknessDiagnosis: unknown;
    leverageableAssets: unknown;
  },
  jobId: string,
  userId: string
) {
  const stepsLog: Array<{
    step: string;
    status: string;
    message?: string;
    timestamp: string;
  }> = [];

  function log(step: string, status: string, message?: string) {
    stepsLog.push({ step, status, message, timestamp: new Date().toISOString() });
  }

  try {
    // Step 1: Research (use existing or run new)
    let research = {
      hardData: (client.hardData as Record<string, unknown>) ?? {},
      ecosystem: (client.ecosystem as Record<string, unknown>) ?? {},
      differentiation: (client.differentiation as Record<string, unknown>) ?? {},
      diagnosis: (client.weaknessDiagnosis as Record<string, unknown>) ?? {},
      assets: (client.leverageableAssets as Record<string, unknown>) ?? {},
    };

    // Check if existing research data is actually populated (not just truthy empty objects)
    const hasValidResearch = (data: unknown): boolean => {
      return data != null && typeof data === "object" && Object.keys(data as object).length > 0;
    };

    const needsResearch = !hasValidResearch(client.hardData) || !hasValidResearch(client.differentiation);

    if (needsResearch) {
      await prisma.generationJob.update({
        where: { id: jobId },
        data: { currentStep: "客户研究", progress: 5, stepsLog },
      });

      log("网页抓取", "running");
      const websiteContent = await fetchWebsiteContent(client.websiteUrl);
      log("网页抓取", "completed");

      log("AI 研究", "running");
      research = await runResearch(client.name, websiteContent, (p) => {
        log(p.step, p.status, p.error);
      });
      log("AI 研究", "completed");

      // Save research data to client
      await prisma.client.update({
        where: { id: client.id },
        data: {
          hardData: research.hardData as object,
          ecosystem: research.ecosystem as object,
          differentiation: research.differentiation as object,
          weaknessDiagnosis: research.diagnosis as object,
          leverageableAssets: research.assets as object,
          researchedAt: new Date(),
        },
      });

      await prisma.generationJob.update({
        where: { id: jobId },
        data: { currentStep: "研究完成", progress: 30, stepsLog },
      });
    } else {
      // Validate cached research data before proceeding
      if (!hasValidResearch(research.hardData) || !hasValidResearch(research.differentiation)) {
        throw new Error("客户研究数据不完整: 硬数据或差异化数据为空，请重新运行研究");
      }
      log("研究数据", "completed", "使用已有研究数据");
    }

    // Step 2: Generate sections
    // If research was skipped, sections span 0-95%; if research ran, sections span 30-95%
    const sectionStart = needsResearch ? 30 : 0;
    const sectionRange = 95 - sectionStart; // available range for 10 sections

    await prisma.generationJob.update({
      where: { id: jobId },
      data: { currentStep: "逐段生成", progress: sectionStart, stepsLog },
    });

    const sections = await generateSections(client.name, research, (p) => {
      log(p.step, p.status, p.error);
      const progress = sectionStart + Math.round((p.sectionIndex / p.totalSections) * sectionRange);
      prisma.generationJob
        .update({
          where: { id: jobId },
          data: { currentStep: p.step, progress, stepsLog },
        })
        .catch(console.error);
    });

    // Step 3: Render HTML
    log("HTML 渲染", "running");
    const today = new Date();
    const dateStr = `${today.getFullYear()} 年 ${today.getMonth() + 1} 月`;

    const proposalSections: ProposalSections = {
      clientName: client.name,
      date: dateStr,
      hero: sections.heroData as unknown as ProposalSections["hero"],
      profile: sections.profileData as unknown as ProposalSections["profile"],
      diagnosis: sections.diagnosisData as unknown as ProposalSections["diagnosis"],
      competitor: sections.competitorData as unknown as ProposalSections["competitor"],
      service: sections.serviceData as unknown as ProposalSections["service"],
      pricing: sections.pricingData as unknown as ProposalSections["pricing"],
      outcome: sections.outcomeData as unknown as ProposalSections["outcome"],
      timeline: sections.timelineData as unknown as ProposalSections["timeline"],
      upsell: sections.upsellData as unknown as ProposalSections["upsell"],
      cta: sections.ctaData as unknown as ProposalSections["cta"],
    };

    const htmlContent = renderProposal(proposalSections);
    log("HTML 渲染", "completed");

    // Step 4: Save everything
    await prisma.proposal.update({
      where: { id: proposalId },
      data: {
        status: "REVIEW",
        heroData: (sections.heroData ?? undefined) as object | undefined,
        profileData: (sections.profileData ?? undefined) as object | undefined,
        diagnosisData: (sections.diagnosisData ?? undefined) as object | undefined,
        competitorData: (sections.competitorData ?? undefined) as object | undefined,
        serviceData: (sections.serviceData ?? undefined) as object | undefined,
        pricingData: (sections.pricingData ?? undefined) as object | undefined,
        outcomeData: (sections.outcomeData ?? undefined) as object | undefined,
        timelineData: (sections.timelineData ?? undefined) as object | undefined,
        upsellData: (sections.upsellData ?? undefined) as object | undefined,
        ctaData: (sections.ctaData ?? undefined) as object | undefined,
        htmlContent,
      },
    });

    await prisma.generationJob.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        currentStep: "完成",
        progress: 100,
        stepsLog,
        completedAt: new Date(),
      },
    });

    // Auto-create a version snapshot after generation
    const lastVersion = await prisma.proposalVersion.findFirst({
      where: { proposalId },
      orderBy: { versionNumber: "desc" },
    });
    const nextVersion = (lastVersion?.versionNumber ?? 0) + 1;

    await prisma.proposalVersion.create({
      data: {
        proposalId,
        versionNumber: nextVersion,
        htmlContent,
        sectionData: {
          heroData: sections.heroData,
          profileData: sections.profileData,
          diagnosisData: sections.diagnosisData,
          competitorData: sections.competitorData,
          serviceData: sections.serviceData,
          pricingData: sections.pricingData,
          outcomeData: sections.outcomeData,
          timelineData: sections.timelineData,
          upsellData: sections.upsellData,
          ctaData: sections.ctaData,
        } as object,
      },
    });

    await prisma.activity.create({
      data: {
        type: "PROPOSAL_GENERATED",
        description: `提案生成完成，自动保存为版本 v${nextVersion}`,
        userId,
        proposalId,
      },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log("错误", "failed", errorMsg);

    await prisma.generationJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        error: errorMsg,
        stepsLog,
        completedAt: new Date(),
      },
    });

    await prisma.proposal.update({
      where: { id: proposalId },
      data: { status: "DRAFT" },
    });
  }
}
