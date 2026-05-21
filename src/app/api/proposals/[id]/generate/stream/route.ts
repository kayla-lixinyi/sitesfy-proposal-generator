/**
 * SSE stream for generation progress.
 * GET /api/proposals/[id]/generate/stream
 *
 * Polls the generation job and streams progress updates to the client.
 */

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const jobId = request.nextUrl.searchParams.get("jobId");

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: Record<string, unknown>) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      }

      let lastProgress = -1;
      let done = false;

      while (!done) {
        try {
          const job = jobId
            ? await prisma.generationJob.findUnique({ where: { id: jobId } })
            : await prisma.generationJob.findFirst({
                where: { proposalId: id },
                orderBy: { createdAt: "desc" },
              });

          if (!job) {
            send({ type: "error", message: "No generation job found" });
            done = true;
            break;
          }

          if (job.progress !== lastProgress || job.status === "COMPLETED" || job.status === "FAILED") {
            lastProgress = job.progress;
            send({
              type: "progress",
              jobId: job.id,
              status: job.status,
              currentStep: job.currentStep,
              progress: job.progress,
              stepsLog: job.stepsLog,
              error: job.error,
            });
          }

          if (job.status === "COMPLETED" || job.status === "FAILED") {
            done = true;
            break;
          }

          // Poll every 1 second
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch {
          send({ type: "error", message: "Stream error" });
          done = true;
        }
      }

      controller.close();
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
