import { NextRequest, NextResponse } from "next/server";
import { generateMemberCard } from "@/app/utils/generate-member-card";

export const runtime = "nodejs";

const bufferFromUrl = async (url: string): Promise<Buffer> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch template asset (${res.status})`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

export const POST = async (req: NextRequest) => {
  try {
    const { name, no_unique, templateFrontUrl, templateBackUrl } =
      await req.json();

    if (!name || !templateFrontUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "name and templateFrontUrl are required",
        },
        { status: 400 }
      );
    }

    const frontBuffer = await bufferFromUrl(templateFrontUrl);
    const backBuffer = templateBackUrl
      ? await bufferFromUrl(templateBackUrl)
      : undefined;

    const { front, back } = await generateMemberCard(name, no_unique, {
      frontTemplate: frontBuffer,
      backTemplate: backBuffer,
      format: "png",
      uppercase: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Card generated successfully",
        result: {
          front: front.toString("base64"),
          back: back ? back.toString("base64") : null,
          mimeType: "image/png",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate member card";
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
};
