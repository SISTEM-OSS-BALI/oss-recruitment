import { QuestionScreeningCreateDTO } from "@/app/models/question-screening";
import {
  CREATE_QUESTION_SCREENING,
  GET_QUESTIONS_SCREENING,
} from "@/app/providers/question-screening";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("base_id") as string;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing id parameter",
        },
        { status: 400 }
      );
    }

    const data = await GET_QUESTIONS_SCREENING(id);

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
