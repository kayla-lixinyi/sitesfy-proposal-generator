/**
 * Research prompt: extract business ecosystem (sub-brands, tools, communities).
 */

import { buildSystemMessage } from "../shared/system-preamble";

export function buildEcosystemPrompt(clientName: string, websiteContent: string) {
  return {
    system: buildSystemMessage(`你现在执行的是 Phase 1.2 业务生态提取。`),
    messages: [
      {
        role: "user" as const,
        content: `从以下网页内容中提取 ${clientName} 的业务生态信息。

需要找的内容：
- 子品牌、子产品
- 社区平台
- 工具/SaaS 产品
- 自媒体/内容渠道
- 特色团队（如 Japan Desk、海外团队）
- 任何主营业务之外的资产

这些是稀缺的护城河，也是 upsell 的钩子。

规则：
1. 只提取官网上能看到的，不要编造
2. 对每个资产说明其战略价值（1 句话）
3. 如果找不到明显的生态资产，标注"该客户生态较单一，建议进一步沟通了解"

请以 JSON 格式返回：
\`\`\`json
{
  "subBrands": [{"name": "string", "description": "string", "strategicValue": "string"}],
  "communities": [{"name": "string", "description": "string", "strategicValue": "string"}],
  "tools": [{"name": "string", "description": "string", "strategicValue": "string"}],
  "mediaChannels": [{"name": "string", "description": "string", "strategicValue": "string"}],
  "specialTeams": [{"name": "string", "description": "string", "strategicValue": "string"}],
  "otherAssets": [{"name": "string", "description": "string", "strategicValue": "string"}],
  "ecosystemSummary": "string"
}
\`\`\`

---
网页内容：
${websiteContent}`,
      },
    ],
  };
}
