/**
 * Section generation orchestrator: runs 10 serial Claude calls to generate
 * each proposal section. Serial because later sections depend on earlier ones
 * for narrative coherence.
 */

import { callClaudeJSON } from "../claude";
import { buildHeroPrompt } from "../prompts/sections/hero";
import { buildProfilePrompt } from "../prompts/sections/profile";
import { buildDiagnosisPrompt } from "../prompts/sections/diagnosis";
import { buildCompetitorPrompt } from "../prompts/sections/competitor";
import { buildServicesPrompt } from "../prompts/sections/services";
import { buildPricingPrompt } from "../prompts/sections/pricing";
import { buildOutcomesPrompt } from "../prompts/sections/outcomes";
import { buildTimelinePrompt } from "../prompts/sections/timeline";
import { buildUpsellPrompt } from "../prompts/sections/upsell";
import { buildCtaPrompt } from "../prompts/sections/cta";
import type { ResearchResult } from "./research";

export interface GenerationProgress {
  step: string;
  sectionIndex: number;
  totalSections: number;
  status: "running" | "completed" | "failed";
  error?: string;
}

export interface GeneratedSections {
  heroData: Record<string, unknown> | null;
  profileData: Record<string, unknown> | null;
  diagnosisData: Record<string, unknown> | null;
  competitorData: Record<string, unknown> | null;
  serviceData: Record<string, unknown> | null;
  pricingData: Record<string, unknown> | null;
  outcomeData: Record<string, unknown> | null;
  timelineData: Record<string, unknown> | null;
  upsellData: Record<string, unknown> | null;
  ctaData: Record<string, unknown> | null;
}

function stringify(data: Record<string, unknown>): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Generate all 10 proposal sections serially.
 * Each section builds on the narrative of previous sections.
 */
export async function generateSections(
  clientName: string,
  research: ResearchResult,
  onProgress?: (progress: GenerationProgress) => void
): Promise<GeneratedSections> {
  const sections: GeneratedSections = {
    heroData: null,
    profileData: null,
    diagnosisData: null,
    competitorData: null,
    serviceData: null,
    pricingData: null,
    outcomeData: null,
    timelineData: null,
    upsellData: null,
    ctaData: null,
  };

  const totalSections = 10;
  let sectionIndex = 0;

  async function runSection<T extends Record<string, unknown>>(
    name: string,
    buildPrompt: () => { system: string; messages: { role: "user"; content: string }[] }
  ): Promise<T> {
    sectionIndex++;
    onProgress?.({ step: name, sectionIndex, totalSections, status: "running" });
    try {
      const prompt = buildPrompt();
      const result = await callClaudeJSON<T>({
        system: prompt.system,
        messages: prompt.messages,
        maxTokens: 4096,
        temperature: 0.3,
      });
      onProgress?.({ step: name, sectionIndex, totalSections, status: "completed" });
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onProgress?.({ step: name, sectionIndex, totalSections, status: "failed", error: errorMsg });
      throw error;
    }
  }

  // 1. Hero
  sections.heroData = await runSection("Hero 封面", () =>
    buildHeroPrompt({
      clientName,
      hardData: stringify(research.hardData),
      differentiation: stringify(research.differentiation),
      ecosystem: stringify(research.ecosystem),
    })
  );

  // 2. Profile
  sections.profileData = await runSection("公司画像", () =>
    buildProfilePrompt({
      clientName,
      hardData: stringify(research.hardData),
      differentiation: stringify(research.differentiation),
      ecosystem: stringify(research.ecosystem),
    })
  );

  // 3. Diagnosis
  sections.diagnosisData = await runSection("机会与诊断", () =>
    buildDiagnosisPrompt({
      clientName,
      diagnosis: stringify(research.diagnosis),
      assets: stringify(research.assets),
      ecosystem: stringify(research.ecosystem),
    })
  );

  // 4. Competitor Matrix
  sections.competitorData = await runSection("竞品对标矩阵", () =>
    buildCompetitorPrompt({
      clientName,
      diagnosis: stringify(research.diagnosis),
      differentiation: stringify(research.differentiation),
      ecosystem: stringify(research.ecosystem),
    })
  );

  // 5. Services
  sections.serviceData = await runSection("服务方案", () =>
    buildServicesPrompt({
      clientName,
      diagnosis: stringify(research.diagnosis),
      assets: stringify(research.assets),
      ecosystem: stringify(research.ecosystem),
    })
  );

  // 6. Pricing
  sections.pricingData = await runSection("合作结构", () =>
    buildPricingPrompt({
      clientName,
      servicesData: stringify(sections.serviceData ?? {}),
    })
  );

  // 7. Outcomes
  sections.outcomeData = await runSection("预期效果", () =>
    buildOutcomesPrompt({
      clientName,
      hardData: stringify(research.hardData),
      diagnosis: stringify(research.diagnosis),
    })
  );

  // 8. Timeline
  sections.timelineData = await runSection("执行路径", () =>
    buildTimelinePrompt({
      clientName,
      servicesData: stringify(sections.serviceData ?? {}),
    })
  );

  // 9. Upsell
  sections.upsellData = await runSection("更多可能", () =>
    buildUpsellPrompt({
      clientName,
      ecosystem: stringify(research.ecosystem),
      assets: stringify(research.assets),
      differentiation: stringify(research.differentiation),
    })
  );

  // 10. CTA
  sections.ctaData = await runSection("行动召唤", () =>
    buildCtaPrompt({
      clientName,
      differentiation: stringify(research.differentiation),
      targetAudience:
        (research.differentiation as Record<string, string>)?.targetAudience ??
        "目标客户",
    })
  );

  return sections;
}
