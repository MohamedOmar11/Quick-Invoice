import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id: invoiceId } = await params;
    const body = await req.json();
    
    // Verify ownership
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!existingInvoice || existingInvoice.userId !== session.user.id) {
      return new NextResponse("Not Found", { status: 404 });
    }

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

    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
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
    console.error("INVOICE_PUT", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id: invoiceId } = await params;
    
    // Verify ownership
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!existingInvoice || existingInvoice.userId !== session.user.id) {
      return new NextResponse("Not Found", { status: 404 });
    }

    await prisma.invoice.delete({
      where: { id: invoiceId },
    });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.error("INVOICE_DELETE", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
