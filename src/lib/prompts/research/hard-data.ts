/**
 * Research prompt: extract hard data (company profile numbers) from client website.
 */

import { buildSystemMessage } from "../shared/system-preamble";

export function buildHardDataPrompt(clientName: string, websiteContent: string) {
  return {
    system: buildSystemMessage(`你现在执行的是 Phase 1.1 硬数据提取。`),
    messages: [
      {
        role: "user" as const,
        content: `从以下网页内容中提取 ${clientName} 的硬数据（带数字的全要）。

需要提取的维度：
- 行业排名（亚太/全球第几，哪年）
- 用户/客户规模（注册数、活跃数、付费数）
- 产品规模（SKU 数、品类数、合作品牌数）
- 运营规模（日订单、仓储面积、覆盖国家数）
- 顶级合作方名字（用来背书）
- 成立年份、品牌认证、行业奖项

规则：
1. 只提取官网或公开报道中明确写出的数字，不要编造
2. 如果某个维度找不到数据，标注"待客户提供"
3. 数字必须带单位和时间点（如有）

请以 JSON 格式返回：
\`\`\`json
{
  "industryRanking": "string or null",
  "userScale": "string or null",
  "productScale": "string or null",
  "operationScale": "string or null",
  "topPartners": ["string"],
  "foundedYear": "string or null",
  "certifications": ["string"],
  "awards": ["string"],
  "otherMetrics": [{"label": "string", "value": "string"}]
}
\`\`\`

---
网页内容：
${websiteContent}`,
      },
    ],
  };
}
