/**
 * Research prompt: identify leverageable assets (pair with diagnosis).
 */

import { buildSystemMessage } from "../shared/system-preamble";

export function buildAssetsPrompt(
  clientName: string,
  websiteContent: string,
  diagnosisContext?: string
) {
  return {
    system: buildSystemMessage(`你现在执行的是 Phase 1.5 可利用资产提取。`),
    messages: [
      {
        role: "user" as const,
        content: `分析 ${clientName} 的官网内容，识别可以被翻译成内容生产/获客优势的内部资产。

每条"待解决"对应一条"可利用优势"——告诉客户"你已经有牌，只是没打出来"。

需要找的资产类型：
- 海量产品/SKU/案例 → 可转化为内容素材库
- 社区/论坛/UGC → 可作为分发渠道
- 特色团队/专家 → 可转化为信任信号
- 物流/基础设施 → 已就位的履约能力
- 独特市场定位 → 差异化 SEO 角度
- 合作伙伴网络 → 背书和共创内容

规则：
1. 每条资产必须具体，指向客户真实拥有的东西
2. 必须说明如何转化为内容/获客优势（1 句话）
3. 和 Phase 1.4 的诊断配对——每个弱点对应一个可利用资产

${diagnosisContext ? `参考诊断结果：\n${diagnosisContext}\n` : ""}

请以 JSON 格式返回：
\`\`\`json
{
  "assets": [
    {
      "asset": "客户具体拥有的资产",
      "contentValue": "如何转化为内容/获客优势",
      "pairedDiagnosis": "对应的诊断弱点（如有）"
    }
  ],
  "assetsSummary": "用一段话总结客户的可利用资产组合"
}
\`\`\`

---
网页内容：
${websiteContent}`,
      },
    ],
  };
}
