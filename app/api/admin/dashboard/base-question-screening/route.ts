import { QuestionBaseScreeningPayloadCreateModel } from "@/app/models/base-question-screening";
import {
  CREATE_QUESTION_BASE_SCREENING,
  GET_BASE_QUESTIONS_SCREENING,
} from "@/app/providers/base-question-screening";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () => {
  try {
    const data = await GET_BASE_QUESTIONS_SCREENING();
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
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const payload: QuestionBaseScreeningPayloadCreateModel = await req.json();

    const data = await CREATE_QUESTION_BASE_SCREENING(payload);

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
