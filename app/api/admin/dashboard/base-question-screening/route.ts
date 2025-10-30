import { QuestionBaseScreeningPayloadCreateModel } from "@/app/models/base-question-screening";
import {
  CREATE_QUESTION_BASE_SCREENING,
  GET_BASE_QUESTIONS_SCREENING,
} from "@/app/providers/base-question-screening";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";

function normalizeNullableString(value: unknown) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function handleGeneralError(error: unknown) {
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
      error: error instanceof Error ? error.message : String(error),
    },
    { status: 500 }
  );
}

export const GET = async () => {
  try {
    const data = await GET_BASE_QUESTIONS_SCREENING();
    return NextResponse.json(
      {
        success: true,
        message: "Successfully retrieved data!",
        result: data,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleGeneralError(error);
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const body = (await req.json()) as QuestionBaseScreeningPayloadCreateModel;
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name) {
      return NextResponse.json(
        { success: false, message: "name is required" },
        { status: 400 }
      );
    }

    const payload: QuestionBaseScreeningPayloadCreateModel = {
      name,
      desc: normalizeNullableString(body.desc) ?? null,
      allowMultipleSubmissions:
        body.allowMultipleSubmissions ?? false,
      active: body.active ?? true,
      version: body.version ?? 1,
    };

    const data = await CREATE_QUESTION_BASE_SCREENING(payload);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully created data!",
        result: data,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return handleGeneralError(error);
  }
};
