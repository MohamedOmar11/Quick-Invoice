import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/app/api/admin/_auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const body = await req.json();

  const data: any = {};
  if (typeof body.maxUses !== "undefined") data.maxUses = Number(body.maxUses);
  if (typeof body.expiresAt !== "undefined") data.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
  if (typeof body.duration !== "undefined") data.duration = body.duration ? Number(body.duration) : null;
  if (typeof body.product !== "undefined") data.product = body.product || null;

  const updated = await prisma.promoCode.update({
    where: { id },
    data,
  });

  return NextResponse.json(updated);
}

