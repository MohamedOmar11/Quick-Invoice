import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false as const, response: new NextResponse("Unauthorized", { status: 401 }) };
  }
  if (session.user.role !== "ADMIN") {
    return { ok: false as const, response: new NextResponse("Forbidden", { status: 403 }) };
  }
  return { ok: true as const, session };
}

