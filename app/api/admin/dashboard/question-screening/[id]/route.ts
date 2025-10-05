import { QuestionScreeningCreateDTO} from "@/app/models/question-screening";
import { CREATE_QUESTION_SCREENING } from "@/app/providers/question-screening";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const payload: QuestionScreeningCreateDTO = await req.json();

    const data = await CREATE_QUESTION_SCREENING(payload);

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
