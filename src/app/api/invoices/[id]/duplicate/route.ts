import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { effectivePlanForUser, freeMonthlyInvoiceLimit, isTemplateAllowedForPlan } from "@/lib/plan-gating";
import { logServerError } from "@/lib/safe-log";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { id: invoiceId } = await params;
    const existing = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { user: { select: { plan: true, planExpiresAt: true } } },
    });

    if (!existing || existing.userId !== session.user.id) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const now = new Date();
    const effectivePlan = effectivePlanForUser(existing.user, now);

    if (existing.user?.plan === "PRO" && existing.user.planExpiresAt && new Date(existing.user.planExpiresAt) < now) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { plan: "FREE", planExpiresAt: null },
      });
    }

    if (effectivePlan === "FREE") {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const invoiceCount = await prisma.invoice.count({
        where: {
          userId: session.user.id,
          createdAt: { gte: startOfMonth },
        },
      });

      if (invoiceCount >= freeMonthlyInvoiceLimit()) {
        return new NextResponse("Free plan limit reached", { status: 403 });
      }

      if (!isTemplateAllowedForPlan("FREE", existing.template)) {
        return new NextResponse("Upgrade to Pro to use this template", { status: 403 });
      }
    }

    const copyNumber = `${existing.invoiceNumber}-copy`;

    const invoice = await prisma.invoice.create({
      data: {
        userId: session.user.id,
        invoiceNumber: copyNumber,
        clientName: existing.clientName,
        clientEmail: existing.clientEmail,
        issueDate: existing.issueDate,
        dueDate: existing.dueDate,
        currency: existing.currency,
        tax: existing.tax,
        notes: existing.notes,
        template: existing.template,
        style: (effectivePlan === "FREE" ? null : existing.style) as any,
        items: existing.items as any,
        subtotal: existing.subtotal,
        total: existing.total,
      },
    });

    return NextResponse.json({ id: invoice.id });
  } catch (error) {
    logServerError("INVOICE_DUPLICATE", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
