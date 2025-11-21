import { EmployeeSetupQuestionPayloadCreateModel } from "@/app/models/employee-setup-question";
import { CREATE_EMPLOYEE_QUESTION_SETUP } from "@/app/providers/employee-setup-question";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const payload: EmployeeSetupQuestionPayloadCreateModel = await req.json();

    const data = await CREATE_EMPLOYEE_QUESTION_SETUP(payload);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully created employee setup!",
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
      },
      { status: 500 }
    );
  }
};
