import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getThemeById } from "@/components/invoice/themes";
import { buildEffectiveTokens } from "@/components/invoice/theme-tokens";
import { renderInvoiceHtml } from "@/components/invoice/invoice-html";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

