import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { entitlementForProduct } from "@/lib/entitlements";
import { logServerError } from "@/lib/safe-log";

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

    let nextPlan: "PRO" | "LIFETIME" = "PRO";
    let planExpiresAt: Date | null = null;
    if (promoCode.product) {
      if (promoCode.product !== "PRO_MONTHLY" && promoCode.product !== "PRO_YEARLY" && promoCode.product !== "LIFETIME") {
        return new NextResponse("Invalid promo product", { status: 400 });
      }
      const ent = entitlementForProduct(promoCode.product, new Date());
      nextPlan = ent.plan;
      planExpiresAt = ent.planExpiresAt;
    } else if (promoCode.duration) {
      planExpiresAt = new Date();
      planExpiresAt.setDate(planExpiresAt.getDate() + promoCode.duration);
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          plan: nextPlan,
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
    logServerError("PROMO_REDEEM_POST", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
