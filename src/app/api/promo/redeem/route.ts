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

    const { code } = await req.json();

    const promoCode = await prisma.promoCode.findUnique({
      where: { code },
    });

    if (!promoCode) {
      return new NextResponse("Invalid promo code", { status: 400 });
    }

    if (promoCode.expiresAt && new Date() > promoCode.expiresAt) {
      return new NextResponse("Promo code expired", { status: 400 });
    }

    if (promoCode.currentUses >= promoCode.maxUses) {
      return new NextResponse("Promo code fully redeemed", { status: 400 });
    }

    // Apply promo code
    let planExpiresAt = null;
    if (promoCode.duration) {
      planExpiresAt = new Date();
      planExpiresAt.setDate(planExpiresAt.getDate() + promoCode.duration);
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          plan: "PRO",
          planExpiresAt,
        },
      }),
      prisma.promoCode.update({
        where: { id: promoCode.id },
        data: { currentUses: promoCode.currentUses + 1 },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PROMO_REDEEM_POST", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
