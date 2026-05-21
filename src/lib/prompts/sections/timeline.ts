/**
 * Section prompt: generate Timeline section (段05 — 执行路径).
 */

import { buildSystemMessage } from "../shared/system-preamble";

export function buildTimelinePrompt(context: {
  clientName: string;
  servicesData: string;
}) {
  return {
    system: buildSystemMessage(`你现在生成提案的 段05 · 执行路径段。`),
    messages: [
      {
        role: "user" as const,
        content: `为 ${context.clientName} 生成执行路径（时间轴）段数据。

## 定位
这段是让客户看到"合作启动后我具体要做什么"——降低未知恐惧，同时展示 Sitesfy 的专业执行力。

## 4 阶段标准时间轴（Sitesfy 标准，框架不变，内容根据客户调整）
1. 第 1–4 周：研究 & 准备
2. 第 2–3 个月：专人陪跑 · 内容启动
3. 第 3 个月：专人陪跑 · 移交准备
4. 第 4–6 个月：全自动运营

## 需要根据客户调整的部分（重点！）
- 第 1 阶段里的具体工作项必须匹配客户业务术语：
  - 电商客户 → 用"SKU 类目"、"产品线"
  - SaaS 客户 → 用"功能模块"、"用例场景"
  - 律所/专业服务 → 用"专业领域"、"服务品类"
  - 制造业/工业 → 用"产品系列"、"应用场景"
- 每个阶段 3-5 个具体交付项，用分号分隔
- 不要写成 SaaS 产品的 step-card 风格——这是咨询项目路径图

## 写作要求
1. desc 里的交付项要具体，不要写"优化网站"这种空话，要写"完成 ${context.clientName} 官网 Core Web Vitals 审计 + 技术 SEO 基线报告"
2. 每个阶段的交付项要和服务方案对应——第 1 阶段对应核心01，第 2-3 阶段对应核心02，第 4 阶段对应全自动

## 参考的服务方案
${context.servicesData}

请以 JSON 格式返回（严格使用以下字段名）：
- 保留 desc 做概述句，新增 deliverables 数组列出 3-5 个具体交付物标签（用于渲染标签列表）
\`\`\`json
{
  "phases": [
    {
      "num": "01",
      "time": "第 1–4 周",
      "title": "研究 & 准备",
      "desc": "具体交付项1；具体交付项2；具体交付项3",
      "deliverables": ["交付物1", "交付物2", "交付物3"]
    },
    {
      "num": "02",
      "time": "第 2–3 个月",
      "title": "专人陪跑 · 内容启动",
      "desc": "具体交付项1；具体交付项2；具体交付项3",
      "deliverables": ["交付物1", "交付物2", "交付物3"]
    },
    {
      "num": "03",
      "time": "第 3 个月",
      "title": "专人陪跑 · 移交准备",
      "desc": "具体交付项1；具体交付项2；具体交付项3",
      "deliverables": ["交付物1", "交付物2", "交付物3"]
    },
    {
      "num": "04",
      "time": "第 4–6 个月",
      "title": "全自动运营",
      "desc": "具体交付项1；具体交付项2；具体交付项3",
      "deliverables": ["交付物1", "交付物2", "交付物3"]
    }
  ]
}
\`\`\`

desc 字段用分号分隔多个交付项作为概述句，deliverables 数组列出具体交付物标签（每个标签 2-8 个字，简洁明了）。`,
      },
    ],
  };
}
