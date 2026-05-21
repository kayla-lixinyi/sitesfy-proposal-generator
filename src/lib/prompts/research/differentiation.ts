/**
 * Research prompt: extract core differentiation positioning (client's own words).
 */

import { buildSystemMessage } from "../shared/system-preamble";

export function buildDifferentiationPrompt(clientName: string, websiteContent: string) {
  return {
    system: buildSystemMessage(`你现在执行的是 Phase 1.3 核心差异化定位提取。`),
    messages: [
      {
        role: "user" as const,
        content: `从以下网页内容中提取 ${clientName} 的核心差异化定位。

重点看：
- 首页 hero 文案
- About / 关于我们 第一段
- 产品页 / 服务页 H1 标题
- Slogan / 品牌宣言

规则：
1. 用客户原词，不要翻译成自己的话——客户读到自己说过的话会有"懂我"感
2. 区分"客户怎么说自己"和"实际做了什么"
3. 提取 3-5 条核心定位关键词/短语

请以 JSON 格式返回：
\`\`\`json
{
  "heroTagline": "string or null",
  "aboutFirstParagraph": "string or null",
  "brandClaims": ["string"],
  "corePositioning": ["string"],
  "targetAudience": "string or null",
  "differentiationSummary": "用一段话总结客户的差异化定位"
}
\`\`\`

---
网页内容：
${websiteContent}`,
      },
    ],
  };
}
