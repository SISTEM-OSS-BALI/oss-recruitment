import { CREATE_ANSWER_SCREENING_QUESTION } from "@/app/providers/answer-question-screening";
import { GeneralError } from "@/app/utils/general-error";
import { AnswerQuestionScreening } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const payload: AnswerQuestionScreening= await req.json();

    const data = await CREATE_ANSWER_SCREENING_QUESTION(payload);

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