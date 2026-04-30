import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizePricing } from "@/lib/pricing";
import { logServerError } from "@/lib/safe-log";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { method, product, screenshotUrl } = await req.json();
    if (!method || !product) {
      return new NextResponse("Missing payment details", { status: 400 });
    }

    if (method !== "PAYPAL" && method !== "INSTAPAY" && method !== "VODAFONE") {
      return new NextResponse("Invalid payment method", { status: 400 });
    }

    if (product !== "PRO_MONTHLY" && product !== "PRO_YEARLY" && product !== "LIFETIME") {
      return new NextResponse("Invalid product", { status: 400 });
    }

    const settings = await prisma.appSettings.upsert({
      where: { id: "app" },
      update: {},
      create: { id: "app" },
      select: { pricing: true },
    });

    const pricing = normalizePricing(settings.pricing);
    const amount =
      product === "PRO_YEARLY"
        ? pricing.proYearly
        : product === "LIFETIME"
        ? pricing.lifetime
        : pricing.proMonthly;

    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        method, // INSTAPAY, VODAFONE
        amount,
        screenshotUrl,
        product,
        status: "PENDING",
      },
    });

    return NextResponse.json(payment);
  } catch (error) {
    logServerError("MANUAL_PAYMENT_POST", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
