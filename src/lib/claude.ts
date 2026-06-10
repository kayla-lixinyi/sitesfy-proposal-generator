/**
 * LLM API client wrapper (OpenAI-compatible endpoint).
 * Handles both streaming and non-streaming calls.
 */

import OpenAI from "openai";

let _client: OpenAI | null = null;

function getClient() {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.LLM_API_KEY,
      baseURL: process.env.LLM_BASE_URL,
    });
  }
  return _client;
}

const MODEL = process.env.LLM_MODEL ?? "anthropic/claude-opus-4.7";

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClaudeCallOptions {
  system?: string;
  messages: ClaudeMessage[];
  maxTokens?: number;
  temperature?: number;
}

/**
 * Non-streaming call. Returns full text.
 */
export async function callClaude(options: ClaudeCallOptions): Promise<string> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

  if (options.system) {
    messages.push({ role: "system", content: options.system });
  }
  for (const m of options.messages) {
    messages.push({ role: m.role, content: m.content });
  }

  const response = await getClient().chat.completions.create({
    model: MODEL,
    max_tokens: options.maxTokens ?? 4096,
    temperature: options.temperature ?? 0.3,
    messages,
  });

  return response.choices[0]?.message?.content ?? "";
}

/**
 * Streaming call. Yields text deltas.
 */
export async function* streamClaude(
  options: ClaudeCallOptions
): AsyncGenerator<string, void, unknown> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

  if (options.system) {
    messages.push({ role: "system", content: options.system });
  }
  for (const m of options.messages) {
    messages.push({ role: m.role, content: m.content });
  }

  const stream = await getClient().chat.completions.create({
    model: MODEL,
    max_tokens: options.maxTokens ?? 4096,
    temperature: options.temperature ?? 0.3,
    messages,
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) {
      yield delta;
    }
  }
}

/**
 * Attempt to repair common LLM JSON mistakes before parsing.
 */
function repairJSON(raw: string): string {
  let s = raw.trim();

  // Remove trailing commas before } or ]
  s = s.replace(/,\s*([}\]])/g, "$1");

  // Fix unescaped newlines inside string values
  s = s.replace(/(?<=:\s*"[^"]*)\n(?=[^"]*")/g, "\\n");

  // Remove control characters that break JSON (except \n \r \t)
  s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");

  return s;
}

/**
 * Extract JSON string from LLM response text (handles markdown code blocks).
 */
function extractJSON(text: string): string {
  const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  return (jsonMatch ? jsonMatch[1] : text).trim();
}

/**
 * Call LLM expecting a JSON response. Parses and returns typed result.
 * On parse failure, attempts JSON repair then retries the LLM call once.
 */
export async function callClaudeJSON<T>(
  options: ClaudeCallOptions
): Promise<T> {
  const text = await callClaude({
    ...options,
    messages: options.messages,
  });

  const jsonStr = extractJSON(text);

  // First attempt: direct parse
  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    // noop — try repair
  }

  // Second attempt: repair common issues
  try {
    return JSON.parse(repairJSON(jsonStr)) as T;
  } catch {
    // noop — retry with LLM
  }

  // Third attempt: ask LLM to fix its own JSON
  const retryText = await callClaude({
    system: "你是一个 JSON 修复助手。用户会给你一段有语法错误的 JSON，请修复它并只返回合法的 JSON，不要加任何解释或 markdown 格式。",
    messages: [{ role: "user", content: jsonStr }],
    maxTokens: options.maxTokens ?? 4096,
    temperature: 0,
  });

  const retryStr = extractJSON(retryText);
  return JSON.parse(repairJSON(retryStr)) as T;
}
