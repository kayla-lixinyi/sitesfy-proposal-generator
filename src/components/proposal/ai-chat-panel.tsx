"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, Send, Loader2, CheckCircle2, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";

/* ─── Types ─── */

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sectionUpdates?: { key: string; label: string }[];
}

interface AIChatPanelProps {
  proposalId: string;
  sectionData: Record<string, unknown>;
  onSectionUpdate: (key: string, data: Record<string, unknown>) => void;
  clientName: string;
}

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

const QUICK_CHIPS = [
  { label: "润色文案", prompt: "请帮我润色整体提案的文案，让语言更专业、更有说服力" },
  { label: "补充数据", prompt: "请检查提案中是否缺少关键数据支撑，并补充合理的数据点" },
  { label: "精简内容", prompt: "请帮我精简提案内容，去掉冗余的表述，让每段更简洁有力" },
  { label: "检查一致性", prompt: "请检查提案各段之间的数据和表述是否一致，如有矛盾请指出并修正" },
];

let msgIdCounter = 0;
function genId() {
  return `msg_${++msgIdCounter}_${Date.now()}`;
}

/* ─── Component ─── */

export default function AIChatPanel({
  proposalId,
  onSectionUpdate,
}: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return;

    const userMsg: Message = {
      id: genId(),
      role: "user",
      content: text.trim(),
    };

    const assistantMsg: Message = {
      id: genId(),
      role: "assistant",
      content: "",
      sectionUpdates: [],
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setStreaming(true);

    // Build messages array for API (all history)
    const apiMessages = [
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: userMsg.role, content: userMsg.content },
    ];

    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      const res = await fetch(`/api/proposals/${proposalId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
        signal: abortController.signal,
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let partial = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        partial += decoder.decode(value, { stream: true });

        // Process complete SSE lines
        const lines = partial.split("\n\n");
        partial = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6);

          try {
            const event = JSON.parse(jsonStr);

            if (event.type === "delta") {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === "assistant") {
                  updated[updated.length - 1] = {
                    ...last,
                    content: last.content + event.content,
                  };
                }
                return updated;
              });
            } else if (event.type === "section_update") {
              const key = event.key as string;
              const data = event.data as Record<string, unknown>;
              onSectionUpdate(key, data);
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === "assistant") {
                  updated[updated.length - 1] = {
                    ...last,
                    sectionUpdates: [
                      ...(last.sectionUpdates ?? []),
                      { key, label: SECTION_LABELS[key] ?? key },
                    ],
                  };
                }
                return updated;
              });
            }
            // "done" and "error" handled by stream ending
          } catch {
            // Skip malformed JSON
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === "assistant") {
            updated[updated.length - 1] = {
              ...last,
              content: last.content || `出错了：${(err as Error).message}`,
            };
          }
          return updated;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-lg border bg-card">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-indigo-500" />
          <h3 className="text-sm font-semibold">AI 助手</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          用自然语言修改提案内容
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bot className="h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              试试告诉我你想怎么修改提案
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              例如：&ldquo;把 Hero 标题改得更有冲击力&rdquo;
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.role === "user" ? (
              <div className="flex justify-end">
                <div className="flex items-start gap-2 max-w-[85%]">
                  <div className="rounded-2xl rounded-tr-sm bg-indigo-600 px-3 py-2 text-sm text-white whitespace-pre-wrap">
                    {msg.content}
                  </div>
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                    <User className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-start">
                <div className="flex items-start gap-2 max-w-[85%]">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <Bot className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <div className="space-y-2">
                    {msg.content && (
                      <div className="rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                        {streaming &&
                          messages[messages.length - 1]?.id === msg.id && (
                            <span className="inline-block w-1.5 h-4 ml-0.5 bg-current animate-pulse align-text-bottom" />
                          )}
                      </div>
                    )}
                    {!msg.content &&
                      streaming &&
                      messages[messages.length - 1]?.id === msg.id && (
                        <div className="rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-sm">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    {/* Section update cards */}
                    {msg.sectionUpdates?.map((su, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        已更新「{su.label}」
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick chips */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-2">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip.label}
              onClick={() => sendMessage(chip.prompt)}
              disabled={streaming}
              className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入修改要求..."
            rows={1}
            disabled={streaming}
            className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50 disabled:opacity-50"
            style={{ maxHeight: "120px" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = Math.min(target.scrollHeight, 120) + "px";
            }}
          />
          <Button
            size="icon"
            onClick={() => sendMessage(input)}
            disabled={streaming || !input.trim()}
            className="h-9 w-9 shrink-0"
          >
            {streaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground/50">
          Enter 发送 · Shift+Enter 换行
        </p>
      </div>
    </div>
  );
}
