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

    const { method, amount, screenshotUrl } = await req.json();

    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        method, // INSTAPAY, VODAFONE
        amount,
        screenshotUrl,
        status: "PENDING",
      },
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error("MANUAL_PAYMENT_POST", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
