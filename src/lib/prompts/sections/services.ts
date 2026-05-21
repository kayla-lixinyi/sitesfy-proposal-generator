/**
 * Section prompt: generate Services section (段03 — 服务方案).
 */

import { buildSystemMessage } from "../shared/system-preamble";

export function buildServicesPrompt(context: {
  clientName: string;
  diagnosis: string;
  assets: string;
  ecosystem: string;
}) {
  return {
    system: buildSystemMessage(`你现在生成提案的 段03 · 服务方案段。`),
    messages: [
      {
        role: "user" as const,
        content: `为 ${context.clientName} 生成服务方案段数据。

## Sitesfy 标准服务菜单（价格基本不变，只换嫁接话术）
1. 核心01：官网 AI 化升级（¥20,000 起，一次性）
2. 核心02：AI 多语言 SEO 内容引擎（月费制）
3. 增值01：产品页/服务页 SEO 内容优化（按批次报价）
4. 增值02：技术内容营销 + 社区运营 / 客户独有的特色专项（按需报价）

## 每个服务卡的写法（模板里是 .service-card 卡片）
1. **痛点描述第一句**（最关键！）：写客户当前的具体问题（用诊断结果），这是客户读到时唯一会停留的位置
2. **中间 chips**：Sitesfy 标准交付物列表 4-5 个标签
3. **嫁接句**：回扣客户场景的卖点（用客户独有资产）

## 关键规则
1. 每段第一句必须针对客户痛点，绝对不要写"我们的服务是…"
2. 不要把服务说明写成功能列表
3. chips 标签简洁，4-5 个
4. 增值02 要基于客户独有资产来定制标题和内容，不要照抄
5. sectionTitle + sectionTitleQuiet 组成本段的大标题，要结合客户场景，克制、专业，例如"四项服务,一套方案"、"两个引擎,持续获客"。前半句是核心主张（加粗），后半句是补充（灰色弱化）。不要用口号式语言，保持咨询报告的冷静调性

## 客户研究资料
诊断结果：
${context.diagnosis}

可利用资产：
${context.assets}

业务生态：
${context.ecosystem}

请以 JSON 格式返回（严格使用以下字段名）：
\`\`\`json
{
  "sectionTitle": "前半句（黑色加粗）",
  "sectionTitleQuiet": "后半句（灰色弱化）",
  "services": [
    {
      "tag": "核心 01",
      "title": "官网 AI 化升级",
      "tagline": "一句话定位",
      "price": "¥20,000 起",
      "priceIsMonthly": false,
      "iconKey": "website",
      "desc": "针对客户痛点的描述 + 回扣客户场景的嫁接句",
      "chips": ["交付物1", "交付物2", "交付物3", "交付物4"]
    },
    {
      "tag": "核心 02",
      "title": "AI 多语言 SEO 内容引擎",
      "tagline": "一句话定位",
      "price": "月费另议",
      "priceIsMonthly": true,
      "iconKey": "seo",
      "desc": "针对客户痛点的描述 + 回扣客户场景的嫁接句",
      "chips": ["交付物1", "交付物2", "交付物3", "交付物4"]
    },
    {
      "tag": "增值 01",
      "title": "产品页/服务页 SEO 内容优化",
      "tagline": "一句话定位",
      "price": "按批次报价",
      "priceIsMonthly": false,
      "iconKey": "content",
      "desc": "针对客户痛点的描述 + 回扣客户场景的嫁接句",
      "chips": ["交付物1", "交付物2", "交付物3", "交付物4"]
    },
    {
      "tag": "增值 02",
      "title": "客户特色专项名称（必须基于客户独有资产）",
      "tagline": "一句话定位",
      "price": "按需报价",
      "priceIsMonthly": false,
      "iconKey": "custom",
      "desc": "针对客户痛点的描述 + 回扣客户场景的嫁接句",
      "chips": ["交付物1", "交付物2", "交付物3", "交付物4"]
    }
  ]
}
\`\`\`

注意：desc 字段合并痛点描述和嫁接句为一段，price 必须填写。iconKey 从以下值中选择："website"（官网相关）、"seo"（SEO/搜索相关）、"content"（内容相关）、"custom"（定制/特色专项）。`,
      },
    ],
  };
}
