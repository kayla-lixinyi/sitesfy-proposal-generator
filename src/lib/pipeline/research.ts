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

  // At least hardData and differentiation are critical for proposal generation
  const criticalKeys: (keyof ResearchResult)[] = ["hardData", "differentiation"];
  const missingCritical = criticalKeys.filter(
    (k) => Object.keys(researchResult[k]).length === 0
  );

  if (missingCritical.length > 0) {
    throw new Error(
      `研究失败: 关键维度缺失 [${missingCritical.join(", ")}]。` +
      `成功: ${succeeded.length}/5, 失败: ${failed.length}/5` +
      (failed.length > 0 ? ` (${failed.join(", ")})` : "")
    );
  }

  return researchResult;
}
