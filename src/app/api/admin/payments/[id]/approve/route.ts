import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/app/api/admin/_auth";
import { entitlementForProduct } from "@/lib/entitlements";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const payment = await prisma.payment.findUnique({
    where: { id },
  });

  if (!payment) return new NextResponse("Not Found", { status: 404 });
  if (payment.status !== "PENDING") return new NextResponse("Payment is not pending", { status: 400 });
  if (!payment.product) return new NextResponse("Payment product missing", { status: 400 });

  if (payment.product !== "PRO_MONTHLY" && payment.product !== "PRO_YEARLY" && payment.product !== "LIFETIME") {
    return new NextResponse("Invalid payment product", { status: 400 });
  }

  const ent = entitlementForProduct(payment.product, new Date());

  await prisma.$transaction([
    prisma.payment.update({
      where: { id },
      data: { status: "APPROVED" },
    }),
    prisma.user.update({
      where: { id: payment.userId },
      data: { plan: ent.plan, planExpiresAt: ent.planExpiresAt },
    }),
  ]);

  return NextResponse.json({ success: true });
}
