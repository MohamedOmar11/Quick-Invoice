import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { getThemeById } from "@/components/invoice/themes";
import { buildEffectiveTokens } from "@/components/invoice/theme-tokens";
import { renderInvoiceHtml } from "@/components/invoice/invoice-html";
import { renderToStream } from "@react-pdf/renderer";
import { InvoicePdf } from "@/components/invoice/invoice-pdf";
import React from "react";

export const runtime = "nodejs";

async function renderPdfWithReactPdf(invoice: any) {
  const stream = await renderToStream(InvoicePdf({ invoice }) as any);
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function renderPdfWithChromium(html: string) {
  const executablePath = await chromium.executablePath();
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id: invoiceId } = await params;
    
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        user: {
          select: {
            defaultInvoiceStyle: true,
            instapayUrl: true,
            vodafoneCashNumber: true,
          },
        },
      },
    });

    if (!invoice || invoice.userId !== session.user.id) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const theme = getThemeById(invoice.template);
    const tokens = buildEffectiveTokens(theme.tokens, invoice.user.defaultInvoiceStyle, invoice.style);

    const html = renderInvoiceHtml({
      theme: { id: theme.id, direction: theme.direction, layoutVariant: theme.layoutVariant },
      tokens,
      invoice: {
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail ?? "",
        issueDate: invoice.issueDate.toISOString().slice(0, 10),
        dueDate: invoice.dueDate.toISOString().slice(0, 10),
        currency: invoice.currency,
        tax: invoice.tax,
        notes: invoice.notes ?? "",
        items: invoice.items as any,
      },
      payment: {
        instapayUrl: invoice.user.instapayUrl ?? null,
        vodafoneCashNumber: invoice.user.vodafoneCashNumber ?? null,
      },
    });

    let pdf: Buffer;
    try {
      pdf = await renderPdfWithChromium(html);
    } catch (error) {
      console.error("PDF_CHROMIUM_ERROR", error);
      pdf = await renderPdfWithReactPdf(invoice);
    }

    const body = new Uint8Array(pdf);
    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${invoice.invoiceNumber}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("PDF_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
