/**
 * Section prompt: generate Hero section (段00 — cover + headline + stat cards).
 */

import { buildSystemMessage } from "../shared/system-preamble";

export function buildHeroPrompt(context: {
  clientName: string;
  hardData: string;
  differentiation: string;
  ecosystem: string;
}) {
  return {
    system: buildSystemMessage(`你现在生成提案的 段00 · Hero 封面段。`),
    messages: [
      {
        role: "user" as const,
        content: `为 ${context.clientName} 生成提案 Hero 段数据。

## 标题公式（三行排版）
{客户的行业地位}<br>
如何让{客户的目标用户}<br>
<span class="accent">{核心动作}</span>?

例子（参考措辞风格，不要照搬）：
- LCSC → "亚太区第一<br>如何让全球工程师<br><span class="accent">在 AI 时代主动找到你</span>?"
- 博京 → "ALB 精品律所<br>如何让全球企业客户<br><span class="accent">在搜索法律服务时主动找到你</span>?"
- 某跨境女装品牌 → "TikTok 千万粉丝<br>如何让北美用户<br><span class="accent">主动搜到你的官网</span>?"

## 一句话主张公式（lede）
{客户} 已具备 {3个客户硬实力}——规模/平台已经在那里。真正的增量来自两件事：**{核心服务01的价值}**，以及 **{核心服务02的价值}**。Sitesfy 提供 {一句话方案概括}，帮 {客户} 在 AI 时代建立可持续的 {目标}。

用 <strong> 标签包裹2个核心价值词——这是视觉上唯一的高亮，要精准。

## 4 个数据卡（stat-row）
从硬数据选最有冲击力的 3 个数字 + 第 4 个固定填"提案方 Sitesfy / YYYY 年 M 月"。
数据卡是"杂志式"风格：大号衬线数字 + 细线分隔 + 灰色 label。要选有冲击力的数字（行业排名、用户规模、SKU/产品数、覆盖国家数等）。

## 客户研究资料
硬数据：
${context.hardData}

差异化定位：
${context.differentiation}

业务生态：
${context.ecosystem}

请以 JSON 格式返回（严格使用以下字段名）：
\`\`\`json
{
  "eyebrow": "Sitesfy × ${context.clientName}",
  "titleHtml": "行业地位部分<br>如何让目标用户<br><span class=\\"accent\\">核心动作</span>?",
  "lede": "一句话主张全文，可用 <strong> 标签强调关键词",
  "stats": [
    {"value": "数字", "label": "说明", "note": "补充备注（可为空字符串）"},
    {"value": "数字", "label": "说明", "note": ""},
    {"value": "数字", "label": "说明", "note": ""},
    {"value": "提案方 Sitesfy", "label": "YYYY 年 M 月", "note": ""}
  ]
}
\`\`\`

titleHtml 必须包含 <br> 换行和 <span class="accent"> 强调。`,
      },
    ],
  };
}
