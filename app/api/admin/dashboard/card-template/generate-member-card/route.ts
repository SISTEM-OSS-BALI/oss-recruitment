import { NextRequest, NextResponse } from "next/server";
import { generateMemberCard } from "@/app/vendor/generate-member-card";
import { supabase } from "@/app/vendor/supabase-client";
import {
  GET_USER_BY_APPLICANT_ID,
  UPDATE_MEMBER_CARD,
} from "@/app/providers/user";
import { GeneralError } from "@/app/utils/general-error";
import { PDFDocument } from "pdf-lib";

export const runtime = "nodejs";

const bufferFromUrl = async (url: string): Promise<Buffer> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch template asset (${res.status})`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

const MEMBER_CARD_BUCKET =
  process.env.SUPABASE_MEMBER_CARD_BUCKET ?? "web-oss-recruitment";
const MEMBER_CARD_FOLDER =
  process.env.SUPABASE_MEMBER_CARD_FOLDER ?? "member-cards";

const uploadPdf = async (userId: string, buffer: Buffer, prefix?: string) => {
  const folder = `${MEMBER_CARD_FOLDER}/${userId}`;
  const safePrefix = prefix
    ? prefix.replace(/[^a-zA-Z0-9-_]/g, "_")
    : "generated";
  const fileName = `${safePrefix}-${Date.now()}-member-card.pdf`;
  const filePath = `${folder}/${fileName}`;
  const { error } = await supabase.storage
    .from(MEMBER_CARD_BUCKET)
    .upload(filePath, buffer, {
      contentType: "application/pdf",
      cacheControl: "public, max-age=31536000",
      upsert: true,
    });
  if (error) {
    throw new GeneralError({
      code: 502,
      details: "Gagal mengunggah kartu anggota ke Supabase",
      error: error.message,
      error_code: "SUPABASE_UPLOAD_FAILED",
    });
  }
  const { data } = supabase.storage
    .from(MEMBER_CARD_BUCKET)
    .getPublicUrl(filePath);
  const publicUrl = data?.publicUrl;
  if (!publicUrl) {
    throw new GeneralError({
      code: 502,
      details: "Gagal mendapatkan URL publik kartu anggota",
      error: "Public URL tidak tersedia",
      error_code: "SUPABASE_PUBLIC_URL_FAILED",
    });
  }
  return publicUrl;
};

const createMemberCardPdf = async (
  frontBuffer: Buffer,
  backBuffer?: Buffer
) => {
  const pdfDoc = await PDFDocument.create();

  const embedPng = async (buf: Buffer) => pdfDoc.embedPng(buf);

  const addImagePage = async (imageBuffer: Buffer) => {
    const embeddedImage = await embedPng(imageBuffer);
    const { width, height } = embeddedImage.scale(1);
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width,
      height,
    });
  };

  await addImagePage(frontBuffer);
  if (backBuffer) {
    await addImagePage(backBuffer);
  }

  return Buffer.from(await pdfDoc.save());
};

export const POST = async (req: NextRequest) => {
  try {
    const payload = await req.json();
    const {
      name,
      no_unique,
      applicant_id,
      templateFrontUrl,
      templateBackUrl,
      prefix,
    } = payload;

    if (!name || !templateFrontUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "name and templateFrontUrl are required",
        },
        { status: 400 }
      );
    }

    const user = await GET_USER_BY_APPLICANT_ID(applicant_id);
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "userId is required to update member_card_url",
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

    const pdfBuffer = await createMemberCardPdf(front, back);
    const memberCardUrl = await uploadPdf(userId, pdfBuffer, prefix);
    await UPDATE_MEMBER_CARD(userId, { member_card_url: memberCardUrl });

    return NextResponse.json(
      {
        success: true,
        message: "Card generated successfully",
        result: {
          front: front.toString("base64"),
          back: back ? back.toString("base64") : null,
          member_card_url: memberCardUrl,
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
