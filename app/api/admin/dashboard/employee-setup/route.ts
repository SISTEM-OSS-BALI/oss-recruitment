import { EmployeeSetupPayloadCreateModel } from "@/app/models/employee-setup";
import {
  CREATE_EMPLOYEE_SETUP,
  GET_EMPLOYEE_SETUPS,
} from "@/app/providers/employee-setup";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () => {
  try {
    const data = await GET_EMPLOYEE_SETUPS();
    return NextResponse.json(
      {
        success: true,
        message: "Successfully get employee setup data!",
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

export const POST = async (req: NextRequest) => {
  try {
    const payload: EmployeeSetupPayloadCreateModel = await req.json();

    const data = await CREATE_EMPLOYEE_SETUP(payload);

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
