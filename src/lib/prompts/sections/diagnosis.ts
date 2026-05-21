/**
 * Section prompt: generate Diagnosis section (段02 — 机会与诊断).
 */

import { buildSystemMessage } from "../shared/system-preamble";

export function buildDiagnosisPrompt(context: {
  clientName: string;
  diagnosis: string;
  assets: string;
  ecosystem: string;
}) {
  return {
    system: buildSystemMessage(`你现在生成提案的 段02 · 机会与诊断段。`),
    messages: [
      {
        role: "user" as const,
        content: `为 ${context.clientName} 生成提案"机会与诊断"段数据。

## 结构（模板里是 .diagnosis-grid 两列排版，用编号区分，不用颜色区分）
- 左列"待解决的差距"：4 条具体诊断（编号 01-04）
- 右列"你已具备的牌"：4 条对应的可利用资产（编号 01-04）
- 收尾钩子句（.pullquote 样式，承上启下到服务方案）

## "待解决"写作要求
每条都要**具体**，不要写"SEO 做得不好"这种空话。正确写法：
"在 {具体场景} 时，{具体问题}，竞品 {具体竞品名} 在 {具体维度} 上更成熟"
每条至少出现一个专有名词（竞品名/语言名/具体场景）

## "可利用优势"写作要求
每条回扣生态/资产研究，把客户内部已有资源翻译成内容/获客资产。
告诉客户"你已经有牌，只是没打出来"。

## 顺序
技术层 → 内容层 → 渠道层 → 差异化层

## 钩子句公式（pullquote，用 <strong> 标签强调）
{客户} 需要的是两件配套的事：**{服务01的概括}**，以及 **{服务02的概括}**。两者缺一，流量来了没有转化，内容好了没有入口。

## 客户研究资料
诊断结果：
${context.diagnosis}

可利用资产：
${context.assets}

业务生态：
${context.ecosystem}

请以 JSON 格式返回（严格使用以下字段名）：
- gaps 每项的 severity（1-5）：1=轻微, 5=严重，反映该差距的紧迫程度
- strengths 每项的 leverage（1-5）：1=弱, 5=强，反映该优势的可利用程度
\`\`\`json
{
  "intro": "一句话引入诊断分析",
  "gaps": [
    {"title": "简短标题", "desc": "具体诊断描述", "severity": 3},
    {"title": "简短标题", "desc": "具体诊断描述", "severity": 3},
    {"title": "简短标题", "desc": "具体诊断描述", "severity": 3},
    {"title": "简短标题", "desc": "具体诊断描述", "severity": 3}
  ],
  "strengths": [
    {"title": "简短标题", "desc": "可利用资产描述", "leverage": 3},
    {"title": "简短标题", "desc": "可利用资产描述", "leverage": 3},
    {"title": "简短标题", "desc": "可利用资产描述", "leverage": 3},
    {"title": "简短标题", "desc": "可利用资产描述", "leverage": 3}
  ],
  "pullquote": "收尾钩子句，可包含 <strong> 标签"
}
\`\`\``,
      },
    ],
  };
}
