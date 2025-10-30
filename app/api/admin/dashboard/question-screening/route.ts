import { QuestionScreeningCreateDTO } from "@/app/models/question-screening";
import {
  CREATE_QUESTION_SCREENING,
  GET_QUESTIONS_SCREENING,
} from "@/app/providers/question-screening";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";

type QuestionScreeningType =
  QuestionScreeningCreateDTO["inputType"];

function normalizeNullableString(value: unknown) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isChoiceType(type: QuestionScreeningType | undefined) {
  return type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE";
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

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const baseId = searchParams.get("base_id") || "";

    if (!baseId) {
      return NextResponse.json(
        { success: false, message: "Missing base_id parameter" },
        { status: 400 }
      );
    }

    const data = await GET_QUESTIONS_SCREENING(baseId);

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
    const body = (await req.json()) as QuestionScreeningCreateDTO;

    const baseId = typeof body.baseId === "string" ? body.baseId.trim() : "";
    if (!baseId) {
      return NextResponse.json(
        { success: false, message: "baseId is required" },
        { status: 400 }
      );
    }

    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (text.length < 3) {
      return NextResponse.json(
        {
          success: false,
          message: "text is required (min 3 characters)",
        },
        { status: 400 }
      );
    }

    const inputType = body.inputType;
    if (!inputType) {
      return NextResponse.json(
        { success: false, message: "inputType is required" },
        { status: 400 }
      );
    }

    const normalizedOptions = Array.isArray(body.options)
      ? body.options
          .map((option, index) => ({
            label: typeof option.label === "string" ? option.label.trim() : "",
            value: typeof option.value === "string" ? option.value.trim() : "",
            order: option.order ?? index + 1,
            active: option.active ?? true,
          }))
          .filter((option) => option.label.length > 0 && option.value.length > 0)
      : undefined;

    if (isChoiceType(inputType) && (!normalizedOptions || normalizedOptions.length === 0)) {
      return NextResponse.json(
        {
          success: false,
          message: "Choice input requires at least one option",
        },
        { status: 400 }
      );
    }

    const payload: QuestionScreeningCreateDTO = {
      baseId,
      text,
      inputType,
      required: body.required ?? true,
      order: body.order ?? 0,
      helpText: normalizeNullableString(body.helpText) ?? null,
      placeholder: normalizeNullableString(body.placeholder) ?? null,
      minLength:
        typeof body.minLength === "number" ? body.minLength : null,
      maxLength:
        typeof body.maxLength === "number" ? body.maxLength : null,
      options: isChoiceType(inputType) ? normalizedOptions : undefined,
    };

    const data = await CREATE_QUESTION_SCREENING(payload);

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
