import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { effectivePlanForUser, freeMonthlyInvoiceLimit, isTemplateAllowedForPlan } from "@/lib/plan-gating";
import { validateInvoiceStyleStrict } from "@/lib/invoice-style-validation";
import { logServerError } from "@/lib/safe-log";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const {
      invoiceNumber,
      clientName,
      clientEmail,
      issueDate,
      dueDate,
      currency,
      tax,
      notes,
      template,
      style,
      items,
      subtotal,
      total,
    } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, planExpiresAt: true },
    });

    const now = new Date();
    const effectivePlan = effectivePlanForUser(user, now);

    if (user?.plan === "PRO" && user.planExpiresAt && new Date(user.planExpiresAt) < now) {
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

      if (!isTemplateAllowedForPlan("FREE", template)) {
        return new NextResponse("Upgrade to Pro to use this template", { status: 403 });
      }
    }

    let styleToSave: any = effectivePlan === "FREE" ? null : null;
    if (effectivePlan !== "FREE" && style != null) {
      const v = validateInvoiceStyleStrict(style);
      if (!v.ok) return new NextResponse("Invalid invoice style", { status: 400 });
      styleToSave = v.value;
    }

    const invoice = await prisma.invoice.create({
      data: {
        userId: session.user.id,
        invoiceNumber,
        clientName,
        clientEmail,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        currency,
        tax,
        notes,
        template,
        style: styleToSave,
        items,
        subtotal,
        total,
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    logServerError("INVOICE_POST", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const invoices = await prisma.invoice.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    logServerError("INVOICE_GET", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
