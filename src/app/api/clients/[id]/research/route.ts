/**
 * Trigger client research (Phase 1 AI pipeline).
 * POST /api/clients/[id]/research — SSE stream returning per-dimension progress.
 */

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchWebsiteContent, runResearch } from "@/lib/pipeline/research";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { id } = await params;

  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) {
    return new Response(JSON.stringify({ error: "Client not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(data: Record<string, unknown>) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      }

      try {
        send({ type: "step", step: "网页抓取", status: "running" });
        const websiteContent = await fetchWebsiteContent(client.websiteUrl);
        send({ type: "step", step: "网页抓取", status: "completed" });

        const research = await runResearch(
          client.name,
          websiteContent,
          (progress) => {
            send({ type: "step", step: progress.step, status: progress.status, error: progress.error });
          }
        );

        await prisma.client.update({
          where: { id },
          data: {
            hardData: research.hardData as object,
            ecosystem: research.ecosystem as object,
            differentiation: research.differentiation as object,
            weaknessDiagnosis: research.diagnosis as object,
            leverageableAssets: research.assets as object,
            researchedAt: new Date(),
          },
        });

        send({ type: "done", research });
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : String(error);
        send({ type: "error", message: errorMsg });
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
