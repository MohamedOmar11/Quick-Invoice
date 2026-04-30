import { NextResponse } from "next/server";
import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";
import { validateUploadthingToken } from "@/lib/uploadthing-token";

const handler = createRouteHandler({
  router: ourFileRouter,
});

function tokenErrorResponse() {
  const v = validateUploadthingToken(process.env.UPLOADTHING_TOKEN);
  return new NextResponse(
    v.ok ? "UploadThing token is missing." : `Upload is not configured.\n${v.error}`,
    { status: 500 }
  );
}

export async function GET(req: Request) {
  const v = validateUploadthingToken(process.env.UPLOADTHING_TOKEN);
  if (!v.ok) return tokenErrorResponse();
  return handler.GET(req as any);
}

export async function POST(req: Request) {
  const v = validateUploadthingToken(process.env.UPLOADTHING_TOKEN);
  if (!v.ok) return tokenErrorResponse();
  return handler.POST(req as any);
}
