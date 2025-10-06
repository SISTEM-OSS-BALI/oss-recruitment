// app/api/admin/dashboard/question-matriks/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GeneralError } from "@/app/utils/general-error";
import { UPDATE_QUESTION_MATRIKS } from "@/app/providers/question-matriks";
import type { QuestionMatriksUpsertDTO } from "@/app/models/question-matriks";

export const POST = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing id parameter" },
        { status: 400 }
      );
    }

    const body: QuestionMatriksUpsertDTO = await req.json();

    if (body.text !== undefined && body.text.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "text cannot be empty" },
        { status: 400 }
      );
    }

    const data = await UPDATE_QUESTION_MATRIKS(id, {
      text: body.text?.trim(),
      inputType: body.inputType,
      required: body.required,
      order: body.order,
      helpText: body.helpText ?? undefined,
      placeholder: body.placeholder ?? undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Successfully updated data!",
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
        message: "Failed to update data",
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
};
