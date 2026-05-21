/**
 * Research prompt: diagnose website weaknesses (opportunities for Sitesfy).
 */

import { buildSystemMessage } from "../shared/system-preamble";

export function buildDiagnosisPrompt(clientName: string, websiteContent: string) {
  return {
    system: buildSystemMessage(`你现在执行的是 Phase 1.4 官网弱点诊断。`),
    messages: [
      {
        role: "user" as const,
        content: `分析 ${clientName} 的官网内容，从 4 个维度诊断弱点/机会。

4 个诊断维度：
1. **SEO 内容覆盖** — 与海外头部竞品比，内容数量、长尾词覆盖、博客更新频率
2. **多语言** — 支持几种语言？目标市场的语言有没有？是机翻还是本地化？
3. **产品/服务页内容深度** — 只有规格/简介，还是有应用场景/选型/案例？
4. **技术 SEO** — Schema、sitemap、Core Web Vitals、移动端、AI 爬虫友好度

规则：
1. 每条诊断必须具体，包含至少一个专有名词（竞品名/语言名/具体场景）
2. 不要写"贵司SEO较弱"这种空话
3. 要写"在 {具体场景} 时，{具体问题}，竞品 {具体竞品名} 在 {具体维度} 上更成熟"
4. 如果无法从内容推断，给出合理假设并标注"需验证"

请以 JSON 格式返回：
\`\`\`json
{
  "seoContentCoverage": {
    "diagnosis": "string",
    "severity": "high | medium | low",
    "competitors": ["string"],
    "specifics": "string"
  },
  "multilingual": {
    "diagnosis": "string",
    "severity": "high | medium | low",
    "currentLanguages": ["string"],
    "missingLanguages": ["string"],
    "specifics": "string"
  },
  "contentDepth": {
    "diagnosis": "string",
    "severity": "high | medium | low",
    "specifics": "string"
  },
  "technicalSeo": {
    "diagnosis": "string",
    "severity": "high | medium | low",
    "specifics": "string"
  },
  "overallDiagnosisSummary": "string"
}
\`\`\`

---
网页内容：
${websiteContent}`,
      },
    ],
  };
}
