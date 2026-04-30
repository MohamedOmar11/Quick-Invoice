import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/app/api/admin/_auth";

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const codes = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(codes);
}

export async function POST(req: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const body = await req.json();
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const product = body.product ?? null;
  const duration = body.duration ?? null;
  const maxUses = Number.isFinite(Number(body.maxUses)) ? Number(body.maxUses) : 1;
  const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

  if (!code) return new NextResponse("Code is required", { status: 400 });
  if (maxUses < 1) return new NextResponse("maxUses must be >= 1", { status: 400 });

  if (product && product !== "PRO_MONTHLY" && product !== "PRO_YEARLY" && product !== "LIFETIME") {
    return new NextResponse("Invalid product", { status: 400 });
  }

  const promo = await prisma.promoCode.create({
    data: {
      code,
      type: "PRO",
      product,
      duration: duration ? Number(duration) : null,
      maxUses,
      currentUses: 0,
      expiresAt,
    },
  });

  return NextResponse.json(promo);
}

