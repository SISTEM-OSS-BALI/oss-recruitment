import { EmployeeSetupPayloadQuestionUpdateModel } from "@/app/models/employee-setup-question";
import {
  DELETE_EMPLOYEE_QUESTION_SETUP,
  UPDATE_EMPLOYEE_QUESTION_SETUP,
} from "@/app/providers/employee-setup-question";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";

export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const id = params.id;
    const payload: EmployeeSetupPayloadQuestionUpdateModel = await req.json();

    const data = await UPDATE_EMPLOYEE_QUESTION_SETUP(id, payload);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully updated employee setup!",
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

export const DELETE = async (
  _req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const id = params.id;

    const data = await DELETE_EMPLOYEE_QUESTION_SETUP(id);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully deleted employee setup!",
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
