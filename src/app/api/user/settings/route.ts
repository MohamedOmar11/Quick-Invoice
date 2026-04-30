import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateInvoiceStyleStrict } from "@/lib/invoice-style-validation";

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
      brandName: true,
      brandLogoUrl: true,
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
  const { instapayUrl, vodafoneCashNumber, defaultInvoiceStyle, brandName, brandLogoUrl } = body ?? {};

  let safeDefaultStyle: any = null;
  if (defaultInvoiceStyle != null) {
    const v = validateInvoiceStyleStrict(defaultInvoiceStyle);
    if (!v.ok) return new NextResponse("Invalid default invoice style", { status: 400 });
    safeDefaultStyle = v.value;
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      instapayUrl: typeof instapayUrl === "string" ? instapayUrl : null,
      vodafoneCashNumber: typeof vodafoneCashNumber === "string" ? vodafoneCashNumber : null,
      defaultInvoiceStyle: safeDefaultStyle as any,
      brandName: typeof brandName === "string" ? brandName : null,
      brandLogoUrl: typeof brandLogoUrl === "string" ? brandLogoUrl : null,
    },
    select: {
      instapayUrl: true,
      vodafoneCashNumber: true,
      defaultInvoiceStyle: true,
      brandName: true,
      brandLogoUrl: true,
    },
  });

  return NextResponse.json(user);
}
