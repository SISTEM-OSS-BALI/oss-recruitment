import { AssignEmployeeSetupPayload } from "@/app/models/applicant-employee-setup";
import {
  GET_APPLICANT_EMPLOYEE_SETUPS,
  UPSERT_APPLICANT_EMPLOYEE_SETUPS,
} from "@/app/providers/applicant-employee-setup";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const applicantId = searchParams.get("applicant_id") ?? "";

    const data = await GET_APPLICANT_EMPLOYEE_SETUPS(applicantId);

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

export const POST = async (req: NextRequest) => {
  try {
    const payload: AssignEmployeeSetupPayload = await req.json();
    const data = await UPSERT_APPLICANT_EMPLOYEE_SETUPS(payload);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully updated applicant employee setups!",
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
