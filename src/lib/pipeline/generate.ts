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

function fallbackSection(name: string, clientName: string): Record<string, unknown> {
  const note = "AI 生成该段时失败，已生成可编辑的基础占位内容。";

  switch (name) {
    case "Hero 封面":
      return {
        eyebrow: `Sitesfy x ${clientName}`,
        titleHtml: `${clientName}<br>如何让目标客户<br><span class="accent">主动找到你</span>?`,
        lede: `${clientName} 已具备业务基础。下一步重点是通过 <strong>官网升级</strong> 与 <strong>AI 可见性建设</strong>，让更多潜在客户理解并信任你们。`,
        stats: [
          { value: clientName, label: "客户", note: "待补充关键数据" },
          { value: "官网升级", label: "核心方向", note: "品牌与转化" },
          { value: "AI 可见性", label: "增长方向", note: "搜索与内容资产" },
          { value: "提案方 Sitesfy", label: new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long" }), note },
        ],
      };
    case "公司画像":
      return {
        cards: [
          { big: "待补充", label: "核心业务规模" },
          { big: "待补充", label: "目标市场" },
          { big: "待补充", label: "差异化资产" },
        ],
        definition: `${clientName} 的公司画像需要结合官网、产品资料和客户补充信息进一步完善。`,
      };
    case "机会与诊断":
      return {
        intro: `${clientName} 的官网增长机会需要进一步复核，以下为基础诊断框架。`,
        gaps: [
          { title: "信息结构待强化", desc: "需要让目标客户更快理解业务价值。", severity: 3 },
          { title: "转化路径待明确", desc: "需要更清晰地引导咨询、留资或预约。", severity: 3 },
        ],
        strengths: [
          { title: "已有品牌基础", desc: "可继续提炼为官网内容和可信资产。", leverage: 3 },
        ],
        pullquote: "先让客户看懂，再让客户愿意行动。",
      };
    case "竞品对标矩阵":
      return {
        intro: "竞品对标需要补充行业样本后进一步完善。",
        clientName,
        competitors: ["竞品 A", "竞品 B", "竞品 C"],
        dimensions: [
          {
            label: "品牌表达",
            clientCell: { badge: "△", badgeClass: "b-soso", text: "待复核" },
            competitorCells: [
              { badge: "△", badgeClass: "b-soso", text: "待补充" },
              { badge: "△", badgeClass: "b-soso", text: "待补充" },
              { badge: "△", badgeClass: "b-soso", text: "待补充" },
            ],
          },
        ],
        conclusion: "建议补充竞品名单后重新生成该段。",
      };
    case "服务方案":
      return {
        sectionTitle: "服务方案",
        sectionTitleQuiet: "从基础到增长",
        services: [
          {
            tag: "官网升级",
            title: "品牌官网诊断与重构",
            tagline: "让目标客户更快看懂你",
            price: "定制",
            desc: "梳理信息架构、页面叙事与转化路径，形成可执行的网站升级方案。",
            chips: ["信息架构", "页面文案", "转化路径"],
            iconKey: "website",
          },
        ],
      };
    case "合作结构":
      return {
        intro: "以下为基础合作结构，可根据范围进一步报价。",
        rows: [
          { moduleName: "官网诊断", moduleSub: "策略与结构", price: "定制", priceSub: "", note: "明确问题与改版优先级" },
          { moduleName: "页面升级", moduleSub: "设计与开发", price: "定制", priceSub: "", note: "按页面范围评估" },
        ],
        pullquote: "先用最小闭环验证价值，再逐步扩大投入。",
      };
    case "预期效果":
      return {
        intro: "预期效果需结合当前流量与转化基线确认。",
        headers: ["品牌理解", "转化效率", "AI 可见性"],
        rows: [
          {
            timeline: "上线后 1-3 个月",
            metrics: [
              { value: "提升", note: "核心信息清晰度", trend: "up" },
              { value: "提升", note: "咨询路径明确度", trend: "up" },
              { value: "积累", note: "可被搜索理解的内容资产", trend: "up" },
            ],
          },
        ],
        notes: ["具体指标需接入 analytics 后校准。"],
        promise: "所有效果目标都应以当前基线为参照。",
      };
    case "执行路径":
      return {
        phases: [
          { num: "01", time: "第 1 周", title: "诊断与策略", desc: "确认目标客户、页面问题与内容优先级。" },
          { num: "02", time: "第 2-4 周", title: "设计与开发", desc: "完成关键页面升级与内容落地。" },
          { num: "03", time: "上线后", title: "复盘与优化", desc: "基于数据继续调整转化路径。" },
        ],
      };
    case "更多可能":
      return {
        intro: "官网升级后，可以继续延伸到内容、SEO 与 AI 搜索可见性。",
        cards: [
          { icon: "01", title: "内容资产", formula: "行业问题 x 专业回答", desc: "持续产出可被搜索和 AI 引用的内容。" },
          { icon: "02", title: "线索转化", formula: "访问行为 x 跟进动作", desc: "把访问者转化为可跟进的销售线索。" },
        ],
        coda: "先建立可信官网，再叠加增长系统。",
      };
    case "行动召唤":
      return {
        titleHtml: `让 ${clientName}<br><span class="quiet">更容易被理想客户看见</span>`,
        text: "下一步建议安排一次 30 分钟沟通，确认目标市场、关键页面与优先级。",
        buttonText: "预约沟通",
        email: "hello@sitesfy.ai",
        contact: "sitesfy.ai",
      };
    default:
      return { note };
  }
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
      return fallbackSection(name, clientName) as T;
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
