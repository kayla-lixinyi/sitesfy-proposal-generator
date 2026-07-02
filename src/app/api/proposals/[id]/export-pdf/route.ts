/**
 * Export proposal HTML as a PDF.
 * POST /api/proposals/[id]/export-pdf
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 60;

function safeFilename(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "_")
    .slice(0, 80);
}

async function launchBrowser() {
  const puppeteer = await import("puppeteer");
  const chromium = await import("@sparticuz/chromium");
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_REGION);

  return puppeteer.default.launch({
    args: isServerless ? chromium.default.args : ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: { width: 1280, height: 1600 },
    executablePath: isServerless ? await chromium.default.executablePath() : undefined,
    headless: true,
  });
}

export async function POST(
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
    select: {
      title: true,
      htmlContent: true,
      client: { select: { name: true } },
    },
  });

  if (!proposal?.htmlContent) {
    return NextResponse.json(
      { error: "Proposal has no generated HTML" },
      { status: 400 }
    );
  }

  let browser: Awaited<ReturnType<typeof launchBrowser>> | null = null;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setContent(proposal.htmlContent, {
      waitUntil: ["domcontentloaded", "networkidle0"],
      timeout: 30000,
    });
    await page.emulateMediaType("screen");
    await page.evaluate(() => document.fonts?.ready);

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });

    const filename = `Sitesfy_x_${safeFilename(proposal.client.name || "Client")}_Proposal.pdf`;
    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[export-pdf] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "导出 PDF 失败" },
      { status: 500 }
    );
  } finally {
    await browser?.close().catch(() => undefined);
  }
}
