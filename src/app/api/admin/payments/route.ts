import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/app/api/admin/_auth";

export async function GET(req: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const where =
    status === "PENDING" || status === "APPROVED" || status === "REJECTED"
      ? { status }
      : undefined;

  const payments = await prisma.payment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true, name: true, plan: true } } },
  });

  return NextResponse.json(payments);
}

