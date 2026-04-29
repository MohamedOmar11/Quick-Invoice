import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
      items,
      subtotal,
      total,
    } = body;

    // Check plan limits (Free = 5/month)
    if (session.user.plan === "FREE") {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const invoiceCount = await prisma.invoice.count({
        where: {
          userId: session.user.id,
          createdAt: { gte: startOfMonth },
        },
      });

      if (invoiceCount >= 5) {
        return new NextResponse("Free plan limit reached", { status: 403 });
      }
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
        items,
        subtotal,
        total,
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("INVOICE_POST", error);
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
    console.error("INVOICE_GET", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
