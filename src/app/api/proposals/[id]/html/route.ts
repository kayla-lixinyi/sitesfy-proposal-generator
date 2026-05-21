/**
 * Render proposal HTML for iframe preview.
 * GET /api/proposals/[id]/html
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    select: { htmlContent: true },
  });

  if (!proposal?.htmlContent) {
    return new Response(
      "<html><body><p style='font-family:sans-serif;color:#888;padding:40px;'>提案尚未生成</p></body></html>",
      {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }

  return new Response(proposal.htmlContent, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
