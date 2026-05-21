/**
 * Quality check prompt: runs Phase 3 checklist items that require Claude semantic analysis.
 * Programmatic checks are handled separately in the quality checker module.
 */

import { buildSystemMessage } from "../shared/system-preamble";

export function buildQualityCheckPrompt(context: {
  clientName: string;
  htmlContent: string;
  sectionData: string;
}) {
  return {
    system: buildSystemMessage(`你现在执行的是 Phase 3 质检——语义类检查项。`),
    messages: [
      {
        role: "user" as const,
        content: `对 ${context.clientName} 的提案进行语义质检。

## 需要你检查的语义类项目

### 1. 服务方案首句检查
段03 每个服务卡的第一句话，是否针对客户痛点？
- ✅ 好："${context.clientName} 目前的多语言页面仅覆盖英语，德语和日语市场的工程师无法…"
- ❌ 坏："我们的官网 AI 化升级服务是…"

### 2. 段06 钩子独特性检查
4 个 upsell 钩子是否完全基于客户独有资产？
- 测试方法：把每个钩子放到 LCSC（电子元件分销商）的提案里，如果不违和 = 没有基于客户独有资产 = 不合格
- 每个钩子必须包含客户的具体资产名称

### 3. 整篇叙事连贯性
- 段02 的诊断是否在段03 的服务方案中被回应？
- 段01 提到的客户资产是否在段06 被复用？
- Hero 的主张是否贯穿全文？

### 4. "懂我"感评估
- 如果你是 ${context.clientName} 的 CEO，读完后第一反应是"这哪里像群发的"还是"挺好看的"？
- 客户专有名词/原话出现频率是否足够？

## 提案数据
${context.sectionData}

## 提案 HTML
${context.htmlContent}

请以 JSON 格式返回：
\`\`\`json
{
  "checks": [
    {
      "name": "检查项名称",
      "passed": true,
      "severity": "critical | warning | info",
      "details": "具体说明"
    }
  ],
  "overallScore": 85,
  "overallAssessment": "整体评价",
  "suggestions": ["改进建议1", "改进建议2"]
}
\`\`\``,
      },
    ],
  };
}
