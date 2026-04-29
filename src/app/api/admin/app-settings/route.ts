import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const settings = await prisma.appSettings.upsert({
    where: { id: "app" },
    update: {},
    create: { id: "app" },
  });

  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { ownerInstapayUrl, ownerVodafoneCashNumber } = body ?? {};

  const settings = await prisma.appSettings.upsert({
    where: { id: "app" },
    update: {
      ownerInstapayUrl: typeof ownerInstapayUrl === "string" ? ownerInstapayUrl : null,
      ownerVodafoneCashNumber:
        typeof ownerVodafoneCashNumber === "string" ? ownerVodafoneCashNumber : null,
    },
    create: {
      id: "app",
      ownerInstapayUrl: typeof ownerInstapayUrl === "string" ? ownerInstapayUrl : null,
      ownerVodafoneCashNumber:
        typeof ownerVodafoneCashNumber === "string" ? ownerVodafoneCashNumber : null,
    },
  });

  return NextResponse.json(settings);
}

