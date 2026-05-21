/**
 * Section prompt: generate Upsell section (段06 — 更多可能).
 */

import { buildSystemMessage } from "../shared/system-preamble";

export function buildUpsellPrompt(context: {
  clientName: string;
  ecosystem: string;
  assets: string;
  differentiation: string;
}) {
  return {
    system: buildSystemMessage(`你现在生成提案的 段06 · 更多可能段。这是最考验销售功力的一段。`),
    messages: [
      {
        role: "user" as const,
        content: `为 ${context.clientName} 生成 4 个 upsell 钩子。

## 定位
这是最考验销售功力的一段——不是推销更多服务，而是让客户看到"AI + 我的业务 = 之前不敢想的可能性"。好的段06能让客户主动找你聊。

## 生成公式
每条 = {一个客户已有资产} × {一个 AI 能力} = {一个新业务价值}

## 操作流程（必须严格执行）
1. **先列客户独有资产 5-10 条**（从业务生态和可利用资产中提取，如：技术文档库、工程师社区、产品参数数据库、行业认证体系、客户案例库等）
2. **再列 Sitesfy 能调用的 AI 能力**（推荐系统/NLP/文档生成/合规监控/线索评分/多语言对话/语义搜索/视觉识别/智能问答/自动翻译 等）
3. **做组合穷举**，选 4 个最性感的——"性感"标准：客户听完会说"这个我要"

## 参考案例（仅供理解格式，禁止照抄）
- LCSC 电子元器件 → "AI 选型助手"（产品参数数据库 × 语义搜索 = 工程师直接在官网完成选型）
- 博京律所 → "AI 法律咨询预筛"（专业领域知识库 × 智能问答 = 潜在客户自助评估案件可行性）

## 关键规则
1. **必须基于客户独有生态原创**——如果把你的 4 个钩子换到任何其他客户的提案里也说得通，说明没有基于独有资产，重做
2. 每个钩子必须和客户的具体资产挂钩，formula 字段要写清楚"哪个资产 × 哪个能力 = 什么价值"
3. icon 用和业务场景相关的 emoji，不要全用通用图标（如🚀💡）
4. desc 写 1-2 句话，要让客户能想象出使用场景

## 客户研究资料
业务生态：
${context.ecosystem}

可利用资产：
${context.assets}

差异化定位：
${context.differentiation}

请以 JSON 格式返回（严格使用以下字段名）：
\`\`\`json
{
  "intro": "一句话引入更多可能方向",
  "cards": [
    {
      "icon": "emoji 图标",
      "title": "钩子标题",
      "formula": "{客户资产} × {AI 能力} = {新价值}",
      "desc": "1-2 句描述"
    },
    {
      "icon": "emoji 图标",
      "title": "钩子标题",
      "formula": "{客户资产} × {AI 能力} = {新价值}",
      "desc": "1-2 句描述"
    },
    {
      "icon": "emoji 图标",
      "title": "钩子标题",
      "formula": "{客户资产} × {AI 能力} = {新价值}",
      "desc": "1-2 句描述"
    },
    {
      "icon": "emoji 图标",
      "title": "钩子标题",
      "formula": "{客户资产} × {AI 能力} = {新价值}",
      "desc": "1-2 句描述"
    }
  ],
  "coda": "以上方向均可单独立项推进，不影响当前合作启动。如有兴趣深入探讨任何一项，欢迎在沟通中提出。"
}
\`\`\``,
      },
    ],
  };
}
