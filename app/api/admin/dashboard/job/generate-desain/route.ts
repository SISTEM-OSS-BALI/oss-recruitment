// app/api/poster/job/route.ts
import { generateJobPosterPNG } from "@/app/utils/generate-desain-job";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json();

  const png = await generateJobPosterPNG({
    company: body.company,
    headline: body.headline,
    role: body.role,
    badgeLeft: body.badgeLeft,
    badgeRight: body.badgeRight,
    sectionTitle: body.sectionTitle,
    requirements: body.requirements,
    ctaTitle: body.ctaTitle,
    contact: body.contact,
    theme: body.theme,
    logoUrl: body.logoUrl,
    illustrationUrl: body.illustrationUrl,
  });

  const bytes = Buffer.isBuffer(png) ? png : Buffer.from(png);
  const arrayBuffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(arrayBuffer).set(bytes);

  return new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
