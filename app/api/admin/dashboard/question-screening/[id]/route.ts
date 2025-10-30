import { NextRequest, NextResponse } from "next/server";
import { GeneralError } from "@/app/utils/general-error";
import {
  DELETE_QUESTION_SCREENING,
  GET_QUESTION_SCREENING_BY_ID,
  UPDATE_QUESTION_SCREENING,
} from "@/app/providers/question-screening";
import {
  QuestionScreeningUpdateDTO,
  QuestionOptionUpsertDTO,
} from "@/app/models/question-screening";

type QuestionScreeningType =
  QuestionScreeningUpdateDTO["inputType"];

function normalizeNullableString(value: unknown) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function sanitizeOption(
  option: QuestionOptionUpsertDTO,
  index: number
): QuestionOptionUpsertDTO {
  const id =
    typeof option.id === "string" && option.id.trim().length > 0
      ? option.id.trim()
      : undefined;

  const label =
    typeof option.label === "string" ? option.label.trim() : "";
  const value =
    typeof option.value === "string" ? option.value.trim() : "";

  return {
    id,
    label,
    value,
    order: option.order ?? index + 1,
    active: option.active ?? true,
  };
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

    const data = await GET_QUESTION_SCREENING_BY_ID(id);

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

    const existing = await GET_QUESTION_SCREENING_BY_ID(id);

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Data not found" },
        { status: 404 }
      );
    }

    const body = (await req.json()) as QuestionScreeningUpdateDTO & {
      options?: {
        upsert?: QuestionOptionUpsertDTO[];
        deleteIds?: string[];
      };
    };

    const payload: QuestionScreeningUpdateDTO = {};

    if (body.text !== undefined) {
      const text =
        typeof body.text === "string" ? body.text.trim() : "";
      if (!text) {
        return NextResponse.json(
          { success: false, message: "text cannot be empty" },
          { status: 400 }
        );
      }
      payload.text = text;
    }

    if (body.inputType !== undefined) {
      payload.inputType = body.inputType;
    }

    if (body.required !== undefined) {
      payload.required = body.required;
    }

    if (body.order !== undefined) {
      payload.order = body.order;
    }

    if (body.helpText !== undefined) {
      payload.helpText = normalizeNullableString(body.helpText) ?? null;
    }

    if (body.placeholder !== undefined) {
      payload.placeholder = normalizeNullableString(body.placeholder) ?? null;
    }

    if (body.minLength !== undefined) {
      payload.minLength =
        typeof body.minLength === "number" ? body.minLength : null;
    }

    if (body.maxLength !== undefined) {
      payload.maxLength =
        typeof body.maxLength === "number" ? body.maxLength : null;
    }

    const nextInputType = payload.inputType ?? existing.inputType;

    if (body.options !== undefined) {
      const rawUpsert = Array.isArray(body.options.upsert)
        ? body.options.upsert
        : [];
      const upsert = rawUpsert
        .map((option, index) => sanitizeOption(option, index))
        .filter((option) => option.label.length > 0 && option.value.length > 0);

      const deleteIds = Array.isArray(body.options.deleteIds)
        ? body.options.deleteIds
            .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
            .map((id) => id.trim())
        : undefined;

      if (upsert.length > 0 || (deleteIds && deleteIds.length > 0)) {
        payload.options = {};

        if (upsert.length > 0) {
          payload.options.upsert = upsert;
        }

        if (deleteIds && deleteIds.length > 0) {
          payload.options.deleteIds = deleteIds;
        }
      } else {
        payload.options = {};
      }

      if (payload.options && !payload.options.upsert && !payload.options.deleteIds) {
        delete payload.options;
      }

      if (isChoiceType(nextInputType)) {
        const existingOptionIds = new Set(
          existing.options?.map((opt) => opt.id) ?? []
        );

        if (deleteIds) {
          deleteIds.forEach((idToDelete) => existingOptionIds.delete(idToDelete));
        }

        const createCount = upsert.filter((opt) => !opt.id).length;
        const finalCount = existingOptionIds.size + createCount;

        if (finalCount <= 0) {
          return NextResponse.json(
            {
              success: false,
              message: "Choice input requires at least one option",
            },
            { status: 400 }
          );
        }
      }
    }

    if (!isChoiceType(nextInputType)) {
      const deleteIds =
        existing.options?.map((opt) => opt.id) ?? [];
      if (deleteIds.length > 0) {
        payload.options = { deleteIds };
      } else {
        delete payload.options;
      }
    }

    const data = await UPDATE_QUESTION_SCREENING(id, payload);

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

    const data = await DELETE_QUESTION_SCREENING(id);

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
