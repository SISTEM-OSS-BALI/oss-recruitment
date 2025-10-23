// src/app/api/admin/dashboard/question-matriks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GeneralError } from "@/app/utils/general-error";
import {
  CREATE_QUESTION_MATRIKS,
  GET_QUESTION_MATRIKS,
} from "@/app/providers/question-matriks";
import { MatriksQuestionCreateDTO } from "@/app/models/question-matriks";

type CreateBody = { baseId: string } & MatriksQuestionCreateDTO;

function normalizeOptions<T extends { options?: any[] }>(x: T): T {
  return {
    ...x,
    options:
      Array.isArray(x.options) && x.options.length > 0 ? x.options : undefined,
  };
}

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const baseId = searchParams.get("base_id");

    if (!baseId) {
      return NextResponse.json(
        { success: false, message: "Missing base_id parameter" },
        { status: 400 }
      );
    }

    const data = await GET_QUESTION_MATRIKS(baseId);

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
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const raw: CreateBody = await req.json();

    if (!raw?.baseId) {
      return NextResponse.json(
        { success: false, message: "baseId is required" },
        { status: 400 }
      );
    }
    if (!raw?.text || raw.text.trim().length < 1) {
      return NextResponse.json(
        { success: false, message: "text is required" },
        { status: 400 }
      );
    }
    if (!raw?.inputType) {
      return NextResponse.json(
        { success: false, message: "inputType is required" },
        { status: 400 }
      );
    }

    const { baseId, ...dto } = raw;
    const normalized = normalizeOptions(dto);

    const data = await CREATE_QUESTION_MATRIKS(baseId, {
      text: normalized.text.trim(),
      inputType: normalized.inputType,
      required: normalized.required ?? true,
      order: normalized.order ?? 0,
      helpText: normalized.helpText ?? null,
      placeholder: normalized.placeholder ?? null,
      options: normalized.options, // <-- forward options to provider
    });

    return NextResponse.json(
      {
        success: true,
        message: "Successfully created data!",
        result: data,
      },
      { status: 201 }
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
        message: "Failed to create data",
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
};
