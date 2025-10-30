import { GET_ANSWER_SCREENING_QUESTIONS_BY_APPLICANT_ID } from "@/app/providers/answer-question-screening";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const data = await GET_ANSWER_SCREENING_QUESTIONS_BY_APPLICANT_ID(
      params.id
    );
    return NextResponse.json(
      {
        success: true,
        message: "Successfully get data!",
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
        message: "Failed to get data",
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
};
