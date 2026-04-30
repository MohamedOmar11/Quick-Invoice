import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePricing } from "@/lib/pricing";

export async function GET() {
  const settings = await prisma.appSettings.upsert({
    where: { id: "app" },
    update: {},
    create: { id: "app" },
    select: { pricing: true },
  });

  return NextResponse.json(normalizePricing(settings.pricing));
}

