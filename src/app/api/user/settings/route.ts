import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      instapayUrl: true,
      vodafoneCashNumber: true,
      defaultInvoiceStyle: true,
    },
  });

  return NextResponse.json(user);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { instapayUrl, vodafoneCashNumber, defaultInvoiceStyle } = body ?? {};

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      instapayUrl: typeof instapayUrl === "string" ? instapayUrl : null,
      vodafoneCashNumber: typeof vodafoneCashNumber === "string" ? vodafoneCashNumber : null,
      defaultInvoiceStyle: typeof defaultInvoiceStyle === "object" ? defaultInvoiceStyle : null,
    },
    select: {
      instapayUrl: true,
      vodafoneCashNumber: true,
      defaultInvoiceStyle: true,
    },
  });

  return NextResponse.json(user);
}
