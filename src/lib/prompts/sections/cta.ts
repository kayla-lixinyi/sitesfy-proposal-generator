/**
 * Section prompt: generate CTA section (末尾 — 行动召唤).
 */

import { buildSystemMessage } from "../shared/system-preamble";

export function buildCtaPrompt(context: {
  clientName: string;
  differentiation: string;
  targetAudience: string;
}) {
  return {
    system: buildSystemMessage(`你现在生成提案的末尾 CTA 行动召唤段。`),
    messages: [
      {
        role: "user" as const,
        content: `为 ${context.clientName} 生成 CTA 段数据。

## 定位
这是提案的最后一页——像咨询报告的结尾，不是电商促销页。气质必须延续前面的纸感/杂志感，温和但有力，不逼迫。

## CTA 公式（必须包含以下要素）
${context.clientName} 的{产品力/专业实力}已经成立。Sitesfy 帮你升级官网、建立 AI 内容获客渠道，让 {目标用户} 在搜索时主动找到 ${context.clientName}——前 3 个月专人陪跑，之后系统全自动，选择权始终在你。

## 固定元素（不要修改）
- 按钮文字：预约沟通 →
- 联系方式：hello@sitesfy.ai · sitesfy.ai

## titleHtml 写法
- 大标题要用客户名字 + 行动号召，可用 <span class="accent">强调词</span> 高亮关键动词
- 例如：「让全球买家主动找到 <span class="accent">${context.clientName}</span>」

## 规则
1. **视觉**：CTA 区块用纸色背景或浅米色，绝对不用紫色 gradient——和整体杂志气质保持一致
2. **语气**：温和但有力，像"我们准备好了，等你一个信号"，不是"立即行动！限时优惠！"
3. **text 正文**：1-2 句话即可，不要写一大段。核心信息："你的产品力已成立 + 我们帮你在线上被找到 + 选择权在你"
4. 客户名字 ${context.clientName} 至少出现 1 次

## 客户研究资料
差异化定位：
${context.differentiation}

目标受众：
${context.targetAudience}

请以 JSON 格式返回（严格使用以下字段名）：
\`\`\`json
{
  "titleHtml": "CTA 大标题，可包含 <span class=\\"accent\\">强调词</span>",
  "text": "CTA 主文案正文",
  "buttonText": "预约沟通 →",
  "email": "hello@sitesfy.ai",
  "contact": "sitesfy.ai"
}
\`\`\``,
      },
    ],
  };
}
