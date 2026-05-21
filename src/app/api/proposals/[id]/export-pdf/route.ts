/**
 * PDF export API.
 * POST /api/proposals/[id]/export-pdf
 *
 * Renders the proposal HTML to PDF using headless Chromium.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    include: { client: true },
  });

  if (!proposal?.htmlContent) {
    return NextResponse.json(
      { error: "Proposal has no generated HTML" },
      { status: 400 }
    );
  }

  try {
    // Dynamic import to avoid bundling issues in serverless
    const puppeteer = await import("puppeteer");

    let browser;
    try {
      // Try with @sparticuz/chromium for serverless (Vercel)
      const chromium = await import("@sparticuz/chromium").catch(() => null);
      if (chromium) {
        browser = await puppeteer.default.launch({
          args: chromium.default.args,
          executablePath: await chromium.default.executablePath(),
          headless: true,
        });
      } else {
        // Local development fallback
        browser = await puppeteer.default.launch({ headless: true });
      }
    } catch {
      browser = await puppeteer.default.launch({ headless: true });
    }

    const page = await browser.newPage();
    await page.setContent(proposal.htmlContent, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });

    await browser.close();

    const fileName = `Sitesfy_x_${proposal.client.name}_Proposal.pdf`;

    // Log activity
    await prisma.activity.create({
      data: {
        type: "PDF_EXPORTED",
        description: `导出了 PDF`,
        userId: session.user!.id,
        proposalId: id,
      },
    });

    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
      },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `PDF generation failed: ${errorMsg}` },
      { status: 500 }
    );
  }
}
