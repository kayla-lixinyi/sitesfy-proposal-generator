/**
 * Research orchestrator: runs 5 parallel Claude calls to extract client research data.
 * Phase 1 of the SKILL.md process.
 */

import { callClaudeJSON } from "../claude";
import { buildHardDataPrompt } from "../prompts/research/hard-data";
import { buildEcosystemPrompt } from "../prompts/research/ecosystem";
import { buildDifferentiationPrompt } from "../prompts/research/differentiation";
import { buildDiagnosisPrompt } from "../prompts/research/diagnosis";
import { buildAssetsPrompt } from "../prompts/research/assets";

export interface ResearchResult {
  hardData: Record<string, unknown>;
  ecosystem: Record<string, unknown>;
  differentiation: Record<string, unknown>;
  diagnosis: Record<string, unknown>;
  assets: Record<string, unknown>;
}

export interface ResearchProgress {
  step: string;
  status: "running" | "completed" | "failed";
  error?: string;
}

function buildFallbackResearch(
  clientName: string,
  websiteContent: string,
  failed: string[]
): ResearchResult {
  const excerpt = websiteContent.slice(0, 1200);
  const fallbackNote =
    failed.length > 0
      ? `AI 研究部分维度失败，已使用官网抓取文本生成基础占位资料。失败维度: ${failed.join(", ")}`
      : "AI 研究未返回完整结构，已使用官网抓取文本生成基础占位资料。";

  return {
    hardData: {
      companyName: clientName,
      source: "website_fallback",
      note: fallbackNote,
      availableEvidence: excerpt,
    },
    ecosystem: {
      source: "website_fallback",
      note: "未能提取完整业务生态，请在后续编辑中补充子品牌、社区、工具或媒体资产。",
    },
    differentiation: {
      companyName: clientName,
      source: "website_fallback",
      differentiationSummary:
        `${clientName} 的差异化定位需要基于官网内容和补充材料进一步确认。`,
      note: fallbackNote,
      availableEvidence: excerpt,
    },
    diagnosis: {
      source: "website_fallback",
      note: "未能完成结构化官网诊断，请在提案草稿中人工复核 SEO、多语言、内容深度与技术体验。",
    },
    assets: {
      source: "website_fallback",
      note: "未能提取完整可利用资产，请补充案例、产品资料、行业数据或品牌素材。",
    },
  };
}

/**
 * Fetch and clean website content. Returns raw text for Claude to analyze.
 */
export async function fetchWebsiteContent(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; SitesfyBot/1.0; +https://sitesfy.ai)",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  const html = await response.text();

  // Strip scripts, styles, and HTML tags to get clean text
  const cleaned = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

  // Truncate to ~15k chars to stay within Claude context limits
  return cleaned.slice(0, 15000);
}

/**
 * Run all 5 research prompts in parallel.
 * Returns structured research data for each dimension.
 */
export async function runResearch(
  clientName: string,
  websiteContent: string,
  onProgress?: (progress: ResearchProgress) => void
): Promise<ResearchResult> {
  const dimensions = [
    { key: "hardData" as const, name: "硬数据提取", buildPrompt: buildHardDataPrompt },
    { key: "ecosystem" as const, name: "业务生态分析", buildPrompt: buildEcosystemPrompt },
    { key: "differentiation" as const, name: "差异化定位", buildPrompt: buildDifferentiationPrompt },
    { key: "diagnosis" as const, name: "官网诊断", buildPrompt: buildDiagnosisPrompt },
    { key: "assets" as const, name: "可利用资产", buildPrompt: buildAssetsPrompt },
  ];

  const researchResult: ResearchResult = {
    hardData: {},
    ecosystem: {},
    differentiation: {},
    diagnosis: {},
    assets: {},
  };

  const succeeded: string[] = [];
  const failed: string[] = [];

  // Run dimensions serially so the frontend can show sequential progress
  for (const dim of dimensions) {
    onProgress?.({ step: dim.name, status: "running" });
    try {
      const prompt = dim.buildPrompt(clientName, websiteContent);
      const result = await callClaudeJSON<Record<string, unknown>>({
        system: prompt.system,
        messages: prompt.messages,
        maxTokens: 4096,
        temperature: 0.2,
      });
      researchResult[dim.key] = result;
      succeeded.push(dim.name);
      onProgress?.({ step: dim.name, status: "completed" });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onProgress?.({ step: dim.name, status: "failed", error: errorMsg });
      failed.push(dim.name);
    }
  }

  if (failed.length > 0) {
    const fallback = buildFallbackResearch(clientName, websiteContent, failed);
    for (const key of Object.keys(researchResult) as (keyof ResearchResult)[]) {
      if (Object.keys(researchResult[key]).length === 0) {
        researchResult[key] = fallback[key];
      }
    }
  }

  return researchResult;
}
