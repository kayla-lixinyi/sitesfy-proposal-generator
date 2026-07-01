/**
 * Proposal AI chat API (streaming SSE)
 * POST /api/proposals/[id]/chat
 *
 * Accepts { messages: [{role, content}] }
 * Streams back SSE events:
 *   - {"type":"delta","content":"..."} — text fragment
 *   - {"type":"section_update","key":"heroData","data":{...}} — section JSON update
 *   - {"type":"done"} — stream finished
 */

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, cuid, now } from "@/lib/prisma";
import { streamClaude, type ClaudeMessage } from "@/lib/claude";
import { buildSystemMessage } from "@/lib/prompts/shared/system-preamble";

const SECTION_KEYS = [
  "heroData",
  "profileData",
  "diagnosisData",
  "competitorData",
  "serviceData",
  "pricingData",
  "outcomeData",
  "timelineData",
  "upsellData",
  "ctaData",
] as const;

const SECTION_LABELS: Record<string, string> = {
  heroData: "Hero 封面",
  profileData: "公司画像",
  diagnosisData: "机会与诊断",
  competitorData: "竞品对标矩阵",
  serviceData: "服务方案",
  pricingData: "合作结构",
  outcomeData: "预期效果",
  timelineData: "执行路径",
  upsellData: "更多可能",
  ctaData: "行动召唤",
};

function buildChatSystemPrompt(
  sectionData: Record<string, unknown>,
  clientName: string,
): string {
  const sectionsContext = SECTION_KEYS.map((key) => {
    const label = SECTION_LABELS[key];
    const data = sectionData[key];
    return `### ${label} (key: "${key}")\n${data ? JSON.stringify(data, null, 2) : "(空)"}`;
  }).join("\n\n");

  const chatInstructions = `你现在是提案编辑助手模式。用户会用自然语言要求你修改提案中的某个段落。

当前客户：${clientName}

当前提案的 10 个段落数据如下：
${sectionsContext}

当你需要修改某个段落的数据时，在回复中使用以下格式输出修改后的完整 JSON：
<section_update key="段落key">
修改后的完整JSON对象
</section_update>

重要规则：
1. <section_update> 标签内必须是合法的 JSON 对象
2. key 必须是以下之一：${SECTION_KEYS.join(", ")}
3. 输出的必须是修改后的完整段落 JSON，不要只输出修改的部分
4. 你可以在一次回复中修改多个段落
5. 在 <section_update> 标签外，用简洁的中文说明你做了什么改动
6. 如果用户的要求不涉及具体段落修改，正常回答即可，不需要输出 <section_update>`;

  return buildSystemMessage(chatInstructions);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { id } = await params;

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: { client: true },
  });

  if (!proposal) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const messages: ClaudeMessage[] = body.messages ?? [];

  if (messages.length === 0) {
    return new Response(JSON.stringify({ error: "No messages" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Build section data context
  const sectionData: Record<string, unknown> = {};
  for (const key of SECTION_KEYS) {
    sectionData[key] = (proposal as Record<string, unknown>)[key] ?? null;
  }

  const systemPrompt = buildChatSystemPrompt(
    sectionData,
    proposal.client.nameZh ?? proposal.client.name,
  );

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(data: Record<string, unknown>) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
        );
      }

      const updatedSections: string[] = [];

      try {
        let buffer = "";

        for await (const delta of streamClaude({
          system: systemPrompt,
          messages,
          maxTokens: 8192,
          temperature: 0.4,
        })) {
          buffer += delta;

          // Check for complete <section_update> tags in the buffer
          const tagRegex =
            /<section_update\s+key="([^"]+)">\s*([\s\S]*?)\s*<\/section_update>/g;
          let match: RegExpExecArray | null;
          let lastEnd = 0;
          const parts: { type: "text" | "section"; value: string; key?: string }[] = [];

          while ((match = tagRegex.exec(buffer)) !== null) {
            // Text before this tag
            if (match.index > lastEnd) {
              parts.push({
                type: "text",
                value: buffer.slice(lastEnd, match.index),
              });
            }
            parts.push({
              type: "section",
              key: match[1],
              value: match[2],
            });
            lastEnd = match.index + match[0].length;
          }

          if (parts.length > 0) {
            // Send completed parts
            for (const part of parts) {
              if (part.type === "text" && part.value) {
                send({ type: "delta", content: part.value });
              } else if (part.type === "section" && part.key) {
                try {
                  const data = JSON.parse(part.value);
                  send({
                    type: "section_update",
                    key: part.key,
                    data,
                  });
                  updatedSections.push(part.key);
                } catch {
                  // JSON parse failed — send as text
                  send({
                    type: "delta",
                    content: `<section_update key="${part.key}">${part.value}</section_update>`,
                  });
                }
              }
            }
            // Keep only the remaining (incomplete) part
            buffer = buffer.slice(lastEnd);
          } else {
            // No complete tags found — check if we might be mid-tag
            const openTagIdx = buffer.lastIndexOf("<section_update");
            if (openTagIdx === -1) {
              // No partial tag — flush entire buffer as delta
              if (buffer) {
                send({ type: "delta", content: buffer });
                buffer = "";
              }
            }
            // else: partial tag in progress, keep buffering
          }
        }

        // Flush remaining buffer
        if (buffer.trim()) {
          send({ type: "delta", content: buffer });
        }

        send({ type: "done" });

        // Log activity if sections were updated
        if (updatedSections.length > 0) {
          const labels = updatedSections.map((k) => SECTION_LABELS[k] ?? k).join("、");
          await prisma.activity.create({
            data: {
              id: cuid(),
              type: "AI_CHAT_EDIT",
              description: `通过 AI 助手修改了：${labels}`,
              userId: session.user!.id,
              proposalId: id,
              createdAt: now(),
            },
          });
        }
      } catch (err) {
        send({
          type: "error",
          message: err instanceof Error ? err.message : "Unknown error",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
