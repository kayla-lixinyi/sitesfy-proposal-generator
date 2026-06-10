/**
 * Quality check API.
 * POST /api/proposals/[id]/quality-check
 *
 * Runs Phase 3 quality checks (programmatic + Claude semantic).
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, cuid } from "@/lib/prisma";
import { callClaudeJSON } from "@/lib/claude";
import { buildQualityCheckPrompt } from "@/lib/prompts/quality/quality-check";

interface QualityCheck {
  name: string;
  passed: boolean;
  severity: "critical" | "warning" | "info";
  details: string;
}

/**
 * Run programmatic quality checks (no LLM needed).
 */
function runProgrammaticChecks(
  clientName: string,
  htmlContent: string,
  sectionData: Record<string, unknown>
): QualityCheck[] {
  const checks: QualityCheck[] = [];

  // 1. Client name appears >= 6 times
  const escapedName = clientName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const nameCount = (htmlContent.match(new RegExp(escapedName, "g")) || []).length;
  checks.push({
    name: "客户名出现频率",
    passed: nameCount >= 6,
    severity: "critical",
    details: `客户名"${clientName}"出现 ${nameCount} 次（要求 ≥ 6 次）`,
  });

  // 2. No buzzwords
  const buzzwords = ["赋能", "打造", "助力", "闭环", "聚合", "链路", "抓手"];
  const foundBuzzwords = buzzwords.filter((w) => htmlContent.includes(w));
  checks.push({
    name: "无空话词",
    passed: foundBuzzwords.length === 0,
    severity: "critical",
    details:
      foundBuzzwords.length === 0
        ? "未发现空话词"
        : `发现空话词：${foundBuzzwords.join("、")}`,
  });

  // 3. Has "保密文件" marking
  const hasConfidential = htmlContent.includes("保密文件") || htmlContent.includes("Confidential");
  checks.push({
    name: "保密文件标注",
    passed: hasConfidential,
    severity: "warning",
    details: hasConfidential ? "已标注保密文件" : "缺少保密文件标注",
  });

  // 4. Has date
  const hasDate = /\d{4}\s*年\s*\d{1,2}\s*月/.test(htmlContent);
  checks.push({
    name: "提案日期",
    passed: hasDate,
    severity: "warning",
    details: hasDate ? "已包含日期" : "缺少提案日期",
  });

  // 5. Competitor matrix: client has at least 1 advantage
  const competitorData = sectionData.competitorData as Record<string, unknown> | undefined;
  if (competitorData) {
    const dimensions = competitorData.dimensions as Array<{ clientRating: string }> | undefined;
    const hasAdvantage = dimensions?.some((d) => d.clientRating === "good");
    checks.push({
      name: "竞品矩阵客户优势",
      passed: !!hasAdvantage,
      severity: "critical",
      details: hasAdvantage
        ? "客户在竞品矩阵中有至少 1 个优势"
        : "客户在竞品矩阵中没有任何优势",
    });
  }

  // 6. Outcome uses ranges, not single numbers
  const outcomeData = sectionData.outcomeData as Record<string, unknown> | undefined;
  if (outcomeData) {
    const rows = outcomeData.rows as Array<{ values?: string[] }> | undefined;
    const usesRanges = rows?.every((row) =>
      row.values?.every((v) => v.includes("~") || v.includes("–") || v.includes("-") || v.includes("%"))
    );
    checks.push({
      name: "预期效果用区间",
      passed: !!usesRanges,
      severity: "warning",
      details: usesRanges ? "预期效果使用区间表示" : "预期效果可能使用了单点数字",
    });
  }

  // 7. Has disclaimer on outcomes
  if (outcomeData) {
    const disclaimer = outcomeData.disclaimer as string | undefined;
    checks.push({
      name: "预期效果免责声明",
      passed: !!disclaimer && disclaimer.length > 20,
      severity: "warning",
      details: disclaimer ? "已包含免责声明" : "缺少免责声明",
    });
  }

  // 8. Pricing mentions "选择权"
  const hasChoiceWording =
    htmlContent.includes("选择权") || htmlContent.includes("按效果付费");
  checks.push({
    name: "报价选择权措辞",
    passed: hasChoiceWording,
    severity: "warning",
    details: hasChoiceWording
      ? "报价部分包含选择权/按效果付费措辞"
      : '报价部分缺少"选择权在客户"或"按效果付费"',
  });

  // 9. CSS integrity check — contains key design tokens
  const hasDesignTokens =
    htmlContent.includes("--paper: #fafaf7") || htmlContent.includes("Noto Serif SC");
  checks.push({
    name: "CSS 视觉一致性",
    passed: hasDesignTokens,
    severity: "critical",
    details: hasDesignTokens
      ? "模板 CSS 设计 token 完整"
      : "可能缺少模板 CSS（未检测到关键设计 token）",
  });

  // 10. No purple gradient in hero
  const hasPurpleGradient =
    htmlContent.includes("linear-gradient") &&
    (htmlContent.includes("#6366f1") || htmlContent.includes("purple"));
  checks.push({
    name: "Hero 无紫色渐变",
    passed: !hasPurpleGradient,
    severity: "critical",
    details: hasPurpleGradient
      ? "检测到紫色渐变背景（违反模板规范）"
      : "未检测到紫色渐变",
  });

  return checks;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!proposal.htmlContent) {
    return NextResponse.json(
      { error: "Proposal has no generated HTML" },
      { status: 400 }
    );
  }

  // Run programmatic checks
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

  const programmaticChecks = runProgrammaticChecks(
    proposal.client.name,
    proposal.htmlContent,
    sectionData as Record<string, unknown>
  );

  // Run Claude semantic checks
  let semanticChecks: QualityCheck[] = [];
  try {
    const prompt = buildQualityCheckPrompt({
      clientName: proposal.client.name,
      htmlContent: proposal.htmlContent.slice(0, 10000), // Truncate for context
      sectionData: JSON.stringify(sectionData, null, 2).slice(0, 10000),
    });

    const result = await callClaudeJSON<{
      checks: QualityCheck[];
      overallScore: number;
      overallAssessment: string;
      suggestions: string[];
    }>({
      system: prompt.system,
      messages: prompt.messages,
      maxTokens: 4096,
      temperature: 0.2,
    });

    semanticChecks = result.checks ?? [];
  } catch {
    semanticChecks = [
      {
        name: "语义检查",
        passed: false,
        severity: "warning",
        details: "语义检查执行失败，请手动审核",
      },
    ];
  }

  const allChecks = [...programmaticChecks, ...semanticChecks];
  const passedCount = allChecks.filter((c) => c.passed).length;
  const qualityScore = Math.round((passedCount / allChecks.length) * 100);

  // Save quality results
  await prisma.proposal.update({
    where: { id },
    data: {
      qualityScore,
      qualityChecks: allChecks as unknown as object,
    },
  });

  // Log activity
  await prisma.activity.create({
    data: {
      id: cuid(),
      type: "QUALITY_CHECK",
      description: `执行质检，得分 ${qualityScore}（${passedCount}/${allChecks.length} 通过）`,
      userId: session.user.id,
      proposalId: id,
    },
  });

  return NextResponse.json({
    score: qualityScore,
    checks: allChecks,
    passedCount,
    totalCount: allChecks.length,
  });
  } catch (err) {
    console.error("[quality-check] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "质检执行异常" },
      { status: 500 }
    );
  }
}
