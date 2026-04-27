import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const promos = await prisma.promoCode.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(promos);
  } catch (error) {
    console.error("ADMIN_PROMO_GET", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { code, maxUses, duration } = await req.json();

    const finalCode = code || `INV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const promo = await prisma.promoCode.create({
      data: {
        code: finalCode,
        maxUses,
        duration,
        type: "PRO",
      },
    });

    return NextResponse.json(promo);
  } catch (error) {
    console.error("ADMIN_PROMO_POST", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
