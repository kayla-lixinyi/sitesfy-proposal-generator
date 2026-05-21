import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  // Only admins can change the API key
  if ((session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "仅管理员可操作" }, { status: 403 });
  }

  const { anthropicApiKey } = await req.json();
  if (
    !anthropicApiKey ||
    typeof anthropicApiKey !== "string" ||
    anthropicApiKey.length < 10
  ) {
    return NextResponse.json(
      { error: "无效的 API Key 格式" },
      { status: 400 }
    );
  }

  // In production, write to Vercel env or a secrets manager.
  // For now, update the runtime environment variable.
  process.env.LLM_API_KEY = anthropicApiKey;

  return NextResponse.json({ ok: true });
}
