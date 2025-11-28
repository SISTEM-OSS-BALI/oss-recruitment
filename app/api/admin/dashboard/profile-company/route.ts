import { ProfileCompanyPayloadCreateModel } from "@/app/models/profile-company";
import { CREATE_PROFILE_COMPANY } from "@/app/providers/profile-company";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const payload: ProfileCompanyPayloadCreateModel = await req.json();

    const data = await CREATE_PROFILE_COMPANY(payload);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully created data!",
        result: data,
      },
      { status: 200 }
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
  }
};
