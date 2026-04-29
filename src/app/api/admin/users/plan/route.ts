import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { email, plan, planExpiresAt } = body ?? {};

  if (typeof email !== "string" || !email) {
    return new NextResponse("Email is required", { status: 400 });
  }

  if (plan !== "FREE" && plan !== "PRO" && plan !== "LIFETIME") {
    return new NextResponse("Invalid plan", { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return new NextResponse("User not found", { status: 404 });
  }

  const expires =
    typeof planExpiresAt === "string" && planExpiresAt
      ? new Date(planExpiresAt)
      : null;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      plan,
      planExpiresAt: plan === "LIFETIME" ? null : expires,
    },
    select: {
      id: true,
      email: true,
      plan: true,
      planExpiresAt: true,
    },
  });

  return NextResponse.json(updated);
}

