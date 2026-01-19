import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { generateTeamMemberCard } from "@/app/vendor/generate-team-member-card";
import {
  GET_USER_BY_APPLICANT_ID,
  UPDATE_TEAM_MEMBER_CARD,
} from "@/app/providers/user";
import { supabase } from "@/app/vendor/supabase-client";
import { GET_TEAM_MEMBER_CARD_TEMPLATE } from "@/app/providers/team-member-card-template";
import { GeneralError } from "@/app/utils/general-error";

export const runtime = "nodejs";

const TEAM_MEMBER_CARD_BUCKET =
  process.env.SUPABASE_TEAM_MEMBER_CARD_BUCKET ??
  process.env.SUPABASE_MEMBER_CARD_BUCKET ??
  "web-oss-recruitment";

const TEAM_MEMBER_CARD_FOLDER =
  process.env.SUPABASE_TEAM_MEMBER_CARD_FOLDER ?? "team-member-cards";

const bufferFromUrl = async (url: string): Promise<Buffer> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch asset (${res.status})`);
  }
  return Buffer.from(await res.arrayBuffer());
};

const uploadPdf = async (userId: string, buffer: Buffer, prefix?: string) => {
  const safePrefix = prefix ? prefix.replace(/[^a-zA-Z0-9-_]/g, "_") : "team";
  const fileName = `${safePrefix}-${Date.now()}-team-card.pdf`;
  const folder = `${TEAM_MEMBER_CARD_FOLDER}/${userId}`;
  const filePath = `${folder}/${fileName}`;

  const { error } = await supabase.storage
    .from(TEAM_MEMBER_CARD_BUCKET)
    .upload(filePath, buffer, {
      contentType: "application/pdf",
      cacheControl: "public, max-age=31536000",
      upsert: true,
    });
  if (error) {
    throw new GeneralError({
      code: 502,
      error: error.message,
      error_code: "SUPABASE_UPLOAD_FAILED",
      details: "Failed to upload team member card to Supabase",
    });
  }

  const { data } = supabase.storage
    .from(TEAM_MEMBER_CARD_BUCKET)
    .getPublicUrl(filePath);
  if (!data?.publicUrl) {
    throw new GeneralError({
      code: 502,
      error: "SUPABASE_PUBLIC_URL_FAILED",
      error_code: "SUPABASE_PUBLIC_URL_FAILED",
      details: "Unable to retrieve team member card public URL",
    });
  }
  return data.publicUrl;
};

const createPdfFromPng = async (imageBuffer: Buffer) => {
  const pdf = await PDFDocument.create();
  const png = await pdf.embedPng(imageBuffer);
  const { width, height } = png.scale(1);
  const page = pdf.addPage([width, height]);
  page.drawImage(png, { x: 0, y: 0, width, height });
  return Buffer.from(await pdf.save());
};

const formatDateKey = (date: Date) => {
  const day = `${date.getDate()}`.padStart(2, "0");
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const year = `${date.getFullYear()}`;
  return `${day}${month}${year}`;
};

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const {
      applicant_id,
      templateId,
      contractDate,
      position,
      whatsappNumber,
    }: {
      applicant_id?: string;
      templateId?: string;
      contractDate?: string;
      position?: string;
      whatsappNumber?: string;
    } = body;

    if (!applicant_id || !templateId || !contractDate || !position) {
      return NextResponse.json(
        {
          success: false,
          message: "applicant_id, templateId, contractDate, and position are required",
        },
        { status: 400 }
      );
    }

    const templateRecord = await GET_TEAM_MEMBER_CARD_TEMPLATE(templateId);
    if (!templateRecord?.image) {
      return NextResponse.json(
        {
          success: false,
          message: "Template not found or missing image",
        },
        { status: 404 }
      );
    }

    const user = await GET_USER_BY_APPLICANT_ID(applicant_id);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found for the provided applicant",
        },
        { status: 404 }
      );
    }

    if (!user.date_of_birth) {
      return NextResponse.json(
        {
          success: false,
          message: "User date of birth is required to build employee number",
        },
        { status: 400 }
      );
    }

    const contractDateValue = new Date(contractDate);
    if (Number.isNaN(contractDateValue.valueOf())) {
      return NextResponse.json(
        { success: false, message: "Invalid contract date" },
        { status: 400 }
      );
    }

    const templateBuffer = await bufferFromUrl(templateRecord.image);
    const avatarBuffer = user.photo_url
      ? await bufferFromUrl(user.photo_url)
      : undefined;

    const normalizeWhatsApp = (value?: string | null) =>
      value ? value.replace(/[^\d]/g, "") : "";
    const normalizedWhatsApp =
      normalizeWhatsApp(whatsappNumber) || normalizeWhatsApp(user.phone);

    if (!normalizedWhatsApp) {
      return NextResponse.json(
        { success: false, message: "WhatsApp number is required" },
        { status: 400 }
      );
    }

    const employeeNumber = `OSS BALI/66BEMP - ${formatDateKey(
      contractDateValue
    )} - ${formatDateKey(new Date(user.date_of_birth))}`;

    const frontImage = await generateTeamMemberCard(
      {
        name: user.name,
        position,
        employeeNumber,
        whatsappNumber: normalizedWhatsApp,
      },
      {
        template: templateBuffer,
        avatar: avatarBuffer,
        format: "png",
        uppercaseName: true,
      }
    );

    const pdfBuffer = await createPdfFromPng(frontImage);
    const publicUrl = await uploadPdf(user.id, pdfBuffer, user.name);

    await UPDATE_TEAM_MEMBER_CARD(user.id, {
      team_member_card_url: publicUrl,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Team member card generated successfully",
        result: {
          front: frontImage.toString("base64"),
          team_member_card_url: publicUrl,
          employeeNumber,
          mimeType: "image/png",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof GeneralError) {
      return NextResponse.json(
        {
          success: false,
          message: error.error,
          error_code: error.error_code,
          details: error.details,
        },
        { status: error.code }
      );
    }
    const message =
      error instanceof Error ? error.message : "Failed to generate team member card";
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
};
