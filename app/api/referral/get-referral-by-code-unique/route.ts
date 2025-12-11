import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";
import { GET_REFERRAL } from "@/app/providers/referral";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const code_referral = body?.code_referral?.toString().trim();
    if (!code_referral) {
      return NextResponse.json(
        { success: false, message: "code_referral is required" },
        { status: 400 }
      );
    }

    const data = await GET_REFERRAL(code_referral);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully created data!",
        result: data,
      },
      { status: 201 }
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
        { status: error.code }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create data",
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
};
