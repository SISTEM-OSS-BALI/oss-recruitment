import { NextRequest, NextResponse } from "next/server";
import { GeneralError } from "@/app/utils/general-error";
import {
  GET_QUESTION_MATRIKS,
  CREATE_QUESTION_MATRIKS,
} from "@/app/providers/question-matriks";
import type { QuestionMatriksCreateDTO } from "@/app/models/question-matriks";

type CreateBody = { baseId: string } & QuestionMatriksCreateDTO;

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
    const body: CreateBody = await req.json();

    if (!body?.baseId) {
      return NextResponse.json(
        { success: false, message: "baseId is required" },
        { status: 400 }
      );
    }
    if (!body?.text || body.text.trim().length < 1) {
      return NextResponse.json(
        { success: false, message: "text is required" },
        { status: 400 }
      );
    }
    if (!body?.inputType) {
      return NextResponse.json(
        { success: false, message: "inputType is required" },
        { status: 400 }
      );
    }

    const { baseId, ...dto } = body;
    const data = await CREATE_QUESTION_MATRIKS(baseId, {
      text: dto.text.trim(),
      inputType: dto.inputType, // biasanya SINGLE_CHOICE
      required: dto.required ?? true,
      order: dto.order ?? 0,
      helpText: dto.helpText ?? null,
      placeholder: dto.placeholder ?? null,
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
