import { NextResponse } from "next/server";
import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

const handler = createRouteHandler({
  router: ourFileRouter,
});

function missingTokenResponse() {
  return new NextResponse(
    "Upload is not configured. Missing UPLOADTHING_TOKEN environment variable (set it in Vercel).",
    { status: 500 }
  );
}

export async function GET(req: Request) {
  if (!process.env.UPLOADTHING_TOKEN) return missingTokenResponse();
  return handler.GET(req as any);
}

export async function POST(req: Request) {
  if (!process.env.UPLOADTHING_TOKEN) return missingTokenResponse();
  return handler.POST(req as any);
}
