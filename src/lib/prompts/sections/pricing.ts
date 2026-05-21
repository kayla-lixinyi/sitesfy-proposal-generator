/**
 * Section prompt: generate Pricing section (段04 — 合作结构).
 */

import { buildSystemMessage } from "../shared/system-preamble";

export function buildPricingPrompt(context: {
  clientName: string;
  servicesData: string;
}) {
  return {
    system: buildSystemMessage(`你现在生成提案的 段04 · 合作结构 / 透明定价段。`),
    messages: [
      {
        role: "user" as const,
        content: `为 ${context.clientName} 生成合作结构（定价）段数据。

## 定位
这段是 Sitesfy 标准模板，几乎不需要大幅修改。核心目的：**透明定价 + 风险共担 + 降低决策门槛**。

## 三档结构（Sitesfy 标准）
1. 网站升级：¥20,000 起，一次性
2. Leads 费：¥800–1,500 / 条（B2B 行业参考价）
3. 持续运营月费：单独洽谈，可选

## 写作要求
1. 开头用"每一分投入都与获客结果挂钩"或其变体——这是销售心理学的钩子，强调风险共担，降低决策门槛
2. 末尾必加"选择权在 ${context.clientName}"——降低被套牢恐惧
3. 强调"按效果付费"
4. pullquote 用 <strong> 标签强调关键承诺

## 参考的服务方案
${context.servicesData}

请以 JSON 格式返回（严格使用以下字段名）：
\`\`\`json
{
  "intro": "开头句（强调风险共担）",
  "rows": [
    {"moduleName": "项目名称", "moduleSub": "项目子标题/说明", "price": "价格", "priceSub": "价格补充（如/月、起等）", "note": "备注说明"},
    {"moduleName": "项目名称", "moduleSub": "项目子标题/说明", "price": "价格", "priceSub": "价格补充", "note": "备注说明"},
    {"moduleName": "项目名称", "moduleSub": "项目子标题/说明", "price": "价格", "priceSub": "价格补充", "note": "备注说明"}
  ],
  "pullquote": "选择权在客户的收尾句，可包含 <strong> 标签"
}
\`\`\``,
      },
    ],
  };
}
