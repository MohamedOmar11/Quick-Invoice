import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePricing } from "@/lib/pricing";
import { requireAdmin } from "@/app/api/admin/_auth";

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const settings = await prisma.appSettings.upsert({
    where: { id: "app" },
    update: {},
    create: { id: "app" },
    select: { pricing: true },
  });

  return NextResponse.json(normalizePricing(settings.pricing));
}

export async function PUT(req: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const body = await req.json();
  const pricing = normalizePricing(body);

  const settings = await prisma.appSettings.upsert({
    where: { id: "app" },
    update: { pricing },
    create: { id: "app", pricing },
    select: { pricing: true },
  });

  return NextResponse.json(normalizePricing(settings.pricing));
}

