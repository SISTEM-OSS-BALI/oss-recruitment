import { NextRequest, NextResponse } from "next/server";
import { GeneralError } from "@/app/utils/general-error";
import {
  DELETE_QUESTION_MATRIKS,
  GET_QUESTION_MATRIKS_BY_ID,
  UPDATE_QUESTION_MATRIKS,
} from "@/app/providers/question-matriks";
import {
  MatriksQuestionUpdateDTO,
  MatriksColumnUpsertDTO,
} from "@/app/models/question-matriks";

type OptionPayload = MatriksColumnUpsertDTO;
type UpdateBody = MatriksQuestionUpdateDTO & {
  options?: OptionPayload[];
};

function normalizeNullableString(value: string | null | undefined) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function handleGeneralError(error: unknown) {
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

export const GET = async (
  _req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const id = params?.id;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing id parameter" },
        { status: 400 }
      );
    }

    const data = await GET_QUESTION_MATRIKS_BY_ID(id);

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Data not found" },
        { status: 404 }
      );
    }

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

export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const id = params?.id;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing id parameter" },
        { status: 400 }
      );
    }

    const body: UpdateBody = await req.json();

    if (body.text !== undefined && body.text.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "text cannot be empty" },
        { status: 400 }
      );
    }

    const existing = await GET_QUESTION_MATRIKS_BY_ID(id);

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Data not found" },
        { status: 404 }
      );
    }

    const normalizedOptions = Array.isArray(body.options)
      ? body.options
          .map<OptionPayload>((option, index) => ({
            id:
              typeof option.id === "string" && option.id.trim().length > 0
                ? option.id.trim()
                : undefined,
            label: option.label?.trim() ?? "",
            value: option.value?.trim() ?? "",
            order: option.order ?? index + 1,
            active: option.active ?? true,
          }))
          .filter((option) => option.label.length > 0 && option.value.length > 0)
      : undefined;

    const existingOptionIds =
      existing.matriksQuestionOption?.map((opt) => opt.id) ?? [];

    const deleteOptionIds =
      normalizedOptions && existingOptionIds.length > 0
        ? existingOptionIds.filter(
            (existingId) =>
              !normalizedOptions.some((option) => option.id === existingId)
          )
        : existingOptionIds.length > 0 && Array.isArray(body.options)
          ? existingOptionIds
          : undefined;

    const data = await UPDATE_QUESTION_MATRIKS(id, {
      text:
        body.text !== undefined
          ? body.text.trim()
          : undefined,
      inputType: body.inputType,
      required: body.required,
      order: body.order,
      helpText: normalizeNullableString(body.helpText ?? undefined),
      placeholder: normalizeNullableString(body.placeholder ?? undefined),
      options:
        Array.isArray(body.options)
          ? {
              upsert: normalizedOptions,
              deleteIds:
                deleteOptionIds && deleteOptionIds.length > 0
                  ? deleteOptionIds
                  : undefined,
            }
          : undefined,
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
    return handleGeneralError(error);
  }
};

export const DELETE = async (
  _req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const id = params?.id;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing id parameter" },
        { status: 400 }
      );
    }

    const data = await DELETE_QUESTION_MATRIKS(id);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully deleted data!",
        result: data,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleGeneralError(error);
  }
};
