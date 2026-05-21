/**
 * Section prompt: generate Outcomes section (段04.5 — 预期效果区间).
 */

import { buildSystemMessage } from "../shared/system-preamble";

export function buildOutcomesPrompt(context: {
  clientName: string;
  hardData: string;
  diagnosis: string;
}) {
  return {
    system: buildSystemMessage(`你现在生成提案的 段04.5 · 预期效果区间段。`),
    messages: [
      {
        role: "user" as const,
        content: `为 ${context.clientName} 生成预期效果区间数据。

## 定位
这段的目的是**让客户看到合作后的具体数字预期**——不是画饼，是用行业基准反推的合理估算。数字必须"够大让人激动，够保守让人相信"。

## 结构（模板里是 .outcome-table 表格样式）
3 个时间节点 × 3 个指标维度

| 时间节点 | 自然搜索流量 | 有效海外询盘 | AI 搜索可见性 |
|---|---|---|---|
| 第 3 个月 | +X% ~ +Y% | A ~ B 条/月 | 关键词覆盖率 % |
| 第 6 个月 | +X% ~ +Y% | A ~ B 条/月 | 被 AI 引用次数 |
| 第 12 个月 | +X% ~ +Y% | A ~ B 条/月 | 关键品类 GEO 占位 |

## 数字估算方法（必须基于客户硬数据反推）
- **流量**：找到客户当前流量基线（从硬数据中提取），用公式：基线 ×（1 + 内容产能比例 × SEO转化系数 0.15–0.3）
- **询盘**：流量 × 1–2% 转化率（B2B 行业基准），如客户已有询盘数据则以此为锚点
- **AI 引用**：从 0 开始给增长目标，因为大多数客户目前 AI 搜索可见性为零
- **关键原则**：数字要"够大让人激动，够保守让人相信"——用区间而非单点数字

## 规则
1. 用区间（如 +30%~50%），不用单点数字（如 +40%）
2. 结尾必加免责声明，模板：「以上预估基于行业公开基准数据和 ${context.clientName} 现状推算，实际结果受内容质量、市场变化、竞争态势等多重因素影响，Sitesfy 承诺按效果付费，不见效不收钱。」
3. 挂钩 Leads 计费——"不见效不收钱"是收尾的心理钩子
4. notes 数组写 1-2 条数据来源说明（如"基于 SimilarWeb 公开数据"），增加可信度

## 客户研究资料
硬数据：
${context.hardData}

诊断结果：
${context.diagnosis}

请以 JSON 格式返回（严格使用以下字段名）：
- 每个 metric 的 trend 字段："up"（上升）、"big_up"（大幅上升）或 "flat"（持平），用于渲染趋势箭头
\`\`\`json
{
  "intro": "一句话引入预期效果",
  "headers": ["自然搜索流量", "有效海外询盘", "AI 搜索可见性"],
  "rows": [
    {"timeline": "第 3 个月", "metrics": [{"value": "数据区间", "note": "补充说明", "trend": "up"}, {"value": "数据区间", "note": "", "trend": "up"}, {"value": "数据区间", "note": "", "trend": "flat"}]},
    {"timeline": "第 6 个月", "metrics": [{"value": "数据区间", "note": "", "trend": "up"}, {"value": "数据区间", "note": "", "trend": "up"}, {"value": "数据区间", "note": "", "trend": "up"}]},
    {"timeline": "第 12 个月", "metrics": [{"value": "数据区间", "note": "", "trend": "big_up"}, {"value": "数据区间", "note": "", "trend": "big_up"}, {"value": "数据区间", "note": "", "trend": "up"}]}
  ],
  "notes": ["注意事项1", "注意事项2"],
  "promise": "不见效不收钱的承诺句 + 免责声明"
}
\`\`\`

metrics 数组长度必须与 headers 一一对应。`,
      },
    ],
  };
}
