import { GET_APPLICANT_EMPLOYEE_SETUPS } from "@/app/providers/applicant-employee-setup";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  _req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const data = await GET_APPLICANT_EMPLOYEE_SETUPS(params.id);
    return NextResponse.json(
      {
        success: true,
        message: "Successfully get applicant employee setups!",
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

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
};
