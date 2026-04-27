import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { status } = await req.json(); // APPROVED or REJECTED
    const { id: paymentId } = await params;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return new NextResponse("Payment not found", { status: 404 });
    }

    if (payment.status !== "PENDING") {
      return new NextResponse("Payment already processed", { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentId },
        data: { status },
      });

      if (status === "APPROVED") {
        // Grant Pro access
        const planExpiresAt = new Date();
        planExpiresAt.setDate(planExpiresAt.getDate() + 30); // 1 month Pro

        await tx.user.update({
          where: { id: payment.userId },
          data: {
            plan: "PRO",
            planExpiresAt,
          },
        });
      }
    });

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.error("ADMIN_PAYMENT_APPROVE_POST", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
