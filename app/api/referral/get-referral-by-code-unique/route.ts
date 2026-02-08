import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";
import { GET_REFERRAL } from "@/app/providers/referral";

const corsOrigins = process.env.CORS_ORIGIN?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isOriginAllowed = (origin: string | null) => {
  if (!origin) return true;
  if (!corsOrigins || corsOrigins.length === 0) return true;
  if (corsOrigins.includes("*")) return true;
  return corsOrigins.includes(origin);
};

const buildCorsHeaders = (req: NextRequest) => {
  const origin = req.headers.get("origin");
  const allowAll = !corsOrigins || corsOrigins.length === 0;
  const allowOrigin =
    allowAll || corsOrigins?.includes("*")
      ? "*"
      : origin && corsOrigins?.includes(origin)
      ? origin
      : corsOrigins?.[0];

  return {
    "Access-Control-Allow-Origin": allowOrigin ?? "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
};

const parseCodeReferral = async (req: NextRequest) => {
  const url = new URL(req.url);
  const queryCode = url.searchParams.get("code_referral")?.trim();
  if (queryCode) return { code: queryCode };

  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = await req.formData();
    const value = form.get("code_referral");
    return { code: value ? value.toString().trim() : null };
  }

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const value = form.get("code_referral");
    return { code: value ? value.toString().trim() : null };
  }

  const text = await req.text();
  if (!text.trim()) return { code: null };

  try {
    const body = JSON.parse(text);
    return { code: body?.code_referral?.toString().trim() ?? null };
  } catch {
    return { code: null, error: "Invalid JSON body" };
  }
};

const handleRequest = async (req: NextRequest) => {
  const corsHeaders = buildCorsHeaders(req);

  if (!isOriginAllowed(req.headers.get("origin"))) {
    return NextResponse.json(
      { success: false, message: "Origin not allowed" },
      { status: 403, headers: corsHeaders }
    );
  }

  try {
    const { code: code_referral, error } = await parseCodeReferral(req);
    if (error) {
      return NextResponse.json(
        { success: false, message: error },
        { status: 400, headers: corsHeaders }
      );
    }
    if (!code_referral) {
      return NextResponse.json(
        { success: false, message: "code_referral is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const data = await GET_REFERRAL(code_referral);
    if (!data) {
      return NextResponse.json(
        { success: false, message: "Referral not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Successfully fetched data!",
        result: data,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    if (error instanceof GeneralError) {
      return NextResponse.json(
        {
          success: false,
          message: error.error,
          error_code: error.error_code,
          details: error.details,
        },
        { status: error.code, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create data",
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
};

export const GET = handleRequest;
export const POST = handleRequest;
export const OPTIONS = async (req: NextRequest) =>
  new NextResponse(null, { status: 204, headers: buildCorsHeaders(req) });
