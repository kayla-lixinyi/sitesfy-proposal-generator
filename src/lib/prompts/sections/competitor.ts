/**
 * Section prompt: generate Competitor Matrix section (段02.5 — 竞品对标矩阵).
 */

import { buildSystemMessage } from "../shared/system-preamble";

export function buildCompetitorPrompt(context: {
  clientName: string;
  diagnosis: string;
  differentiation: string;
  ecosystem: string;
}) {
  return {
    system: buildSystemMessage(`你现在生成提案的 段02.5 · 竞品对标矩阵段。`),
    messages: [
      {
        role: "user" as const,
        content: `为 ${context.clientName} 生成竞品对标矩阵数据。

## 为什么需要这段
这是提案中说服力最强的一段——一张表胜过 1000 字诊断。客户高管看完会立刻理解自己在行业中的位置。

## 结构
- 横轴：3 个竞品（不超过 3 个，信息密度刚好）
- 纵轴：4-6 个评估维度
- 每格：一句话评价 + badge

## 维度选择（根据客户业务调整，以下为参考）
- 内容数量级（博客 + 选型指南数量）
- 多语言覆盖
- 技术 SEO 完备度（Schema、Core Web Vitals、AI 爬虫友好度）
- 产品页/服务页内容深度
- 社区/UGC/特色团队（若客户有这个资产，这一行是杀招）
- AI 搜索可见性（GEO/AEO，2026 必加）

## 关键规则
1. 客户列必须有至少 1 个 ✓（good）优势——不能全是劣势，否则客户读完会防御
2. 每格只写一句话，不要写段落
3. 结论句要收口到 Sitesfy 的能力范围，公式："差距不在产品力，在{具体能力}——而这正是 AI 能批量解决的部分"

## badge 视觉语言（模板的小徽章，不要改成全格背景填色）
- good（优势）→ badge: "✓", badgeClass: "b-good"
- warn（需改善）→ badge: "⚠", badgeClass: "b-warn"
- soso（一般）→ badge: "△", badgeClass: "b-soso"

## 客户研究资料
诊断结果：
${context.diagnosis}

差异化定位：
${context.differentiation}

业务生态：
${context.ecosystem}

请以 JSON 格式返回（严格使用以下字段名）：
- 每个 cell 的 score（0-100）：反映该维度的能力分数，用于渲染分数横条
\`\`\`json
{
  "intro": "一句话引入竞品对标分析",
  "clientName": "${context.clientName}",
  "competitors": ["竞品A", "竞品B", "竞品C"],
  "dimensions": [
    {
      "label": "维度名",
      "clientCell": { "badge": "✓", "badgeClass": "b-good", "text": "一句话评价", "score": 75 },
      "competitorCells": [
        { "badge": "✓", "badgeClass": "b-good", "text": "一句话评价", "score": 80 },
        { "badge": "⚠", "badgeClass": "b-warn", "text": "一句话评价", "score": 50 },
        { "badge": "△", "badgeClass": "b-soso", "text": "一句话评价", "score": 35 }
      ]
    }
  ],
  "conclusion": "总结句，用 <strong> 强调关键词"
}
\`\`\`

competitorCells 数组顺序必须与 competitors 数组一一对应。`,
      },
    ],
  };
}
