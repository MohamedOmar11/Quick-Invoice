import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/app/api/admin/_auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const payment = await prisma.payment.findUnique({
    where: { id },
  });

  if (!payment) return new NextResponse("Not Found", { status: 404 });
  if (payment.status !== "PENDING") return new NextResponse("Payment is not pending", { status: 400 });

  await prisma.payment.update({
    where: { id },
    data: { status: "REJECTED" },
  });

  return NextResponse.json({ success: true });
}

