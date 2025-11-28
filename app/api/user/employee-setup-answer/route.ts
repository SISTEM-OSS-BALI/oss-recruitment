import { EmployeeSetupAnswerUpdateRequest } from "@/app/models/employee-setup-answer";
import { UPSERT_EMPLOYEE_SETUP_ANSWER } from "@/app/providers/employee-setup-answer";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";

export const PATCH = async (req: NextRequest) => {
  try {
    const payload: EmployeeSetupAnswerUpdateRequest = await req.json();
    const data = await UPSERT_EMPLOYEE_SETUP_ANSWER(payload);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully updated employee setup answer!",
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
