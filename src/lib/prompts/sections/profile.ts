/**
 * Section prompt: generate Profile section (段01 — 公司画像).
 */

import { buildSystemMessage } from "../shared/system-preamble";

export function buildProfilePrompt(context: {
  clientName: string;
  hardData: string;
  differentiation: string;
  ecosystem: string;
}) {
  return {
    system: buildSystemMessage(`你现在生成提案的 段01 · 公司画像段。`),
    messages: [
      {
        role: "user" as const,
        content: `为 ${context.clientName} 生成提案"公司画像"段数据。

## 段标题
标题格式固定为："{客户名} <span class="quiet">是谁</span>"（quiet 是浅灰样式，不要改）

## 结构
- 3 个 profile-card：每张 = 一个大数字（衬线 big）+ 一行说明（label）
- 1 段核心定位描述（definition 框，带左侧紫色竖线）

## 核心定位描述公式
**核心定位**：{客户} 以"{客户原话定位}"为核心差异化，服务 {目标用户群体}。旗下生态还包括 **{子品牌列表}**，构成 {一句话生态价值}。

用 <strong> 标签包裹子品牌名和关键差异化词。

## 规则
1. 这段 90% 来自客户官网，目的是让客户感受到"你真的研究过我们"
2. 不要把官网首页内容复制粘贴当画像——要提炼成简洁有力的数字+定位
3. 数字必须来自官网/公开报道，带数字的全要（行业排名、用户规模、产品规模、运营规模、顶级合作方名字、成立年份等）
4. profile-card 的大数字要有冲击力，和 Hero 的 stat-row 不要重复

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
  "cards": [
    {"big": "大数字", "label": "说明"},
    {"big": "大数字", "label": "说明"},
    {"big": "大数字", "label": "说明"}
  ],
  "definition": "核心定位描述，可包含 <strong> 标签强调关键词"
}
\`\`\``,
      },
    ],
  };
}
