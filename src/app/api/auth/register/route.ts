import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/rate-limit";
import { logServerError } from "@/lib/safe-log";

export async function POST(req: Request) {
  try {
    const ip = getClientIpFromHeaders(req.headers);
    const ipLimit = checkRateLimit({ key: `register:ip:${ip}`, limit: 10, windowMs: 60 * 60 * 1000 });
    if (!ipLimit.ok) {
      const retryAfter = Math.max(1, Math.ceil((ipLimit.resetAt - Date.now()) / 1000));
      return new NextResponse("Too Many Requests", { status: 429, headers: { "Retry-After": String(retryAfter) } });
    }

    const { name, email, password } = await req.json();

    if (!email || !password) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const emailLimit = checkRateLimit({ key: `register:email:${String(email).toLowerCase()}`, limit: 5, windowMs: 60 * 60 * 1000 });
    if (!emailLimit.ok) {
      const retryAfter = Math.max(1, Math.ceil((emailLimit.resetAt - Date.now()) / 1000));
      return new NextResponse("Too Many Requests", { status: 429, headers: { "Retry-After": String(retryAfter) } });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse("User already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    logServerError("REGISTER_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
