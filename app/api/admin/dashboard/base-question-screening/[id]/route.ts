import { QuestionBaseScreeningPayloadUpdateModel } from "@/app/models/base-question-screening";
import {
  DELETE_QUESTION_BASE_SCREENING,
  GET_BASE_QUESTION_SCREENING,
  UPDATE_QUESTION_BASE_SCREENING,
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

    const data = await GET_BASE_QUESTION_SCREENING(id);

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

    const body =
      (await req.json()) as QuestionBaseScreeningPayloadUpdateModel;

    const payload: QuestionBaseScreeningPayloadUpdateModel = {};

    if (body.name !== undefined) {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (!name) {
        return NextResponse.json(
          { success: false, message: "name cannot be empty" },
          { status: 400 }
        );
      }
      payload.name = name;
    }

    if (body.desc !== undefined) {
      payload.desc = normalizeNullableString(body.desc) ?? null;
    }

    if (body.allowMultipleSubmissions !== undefined) {
      payload.allowMultipleSubmissions = body.allowMultipleSubmissions;
    }

    if (body.active !== undefined) {
      payload.active = body.active;
    }

    if (body.version !== undefined) {
      payload.version = body.version;
    }

    const data = await UPDATE_QUESTION_BASE_SCREENING(id, payload);

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

    const data = await DELETE_QUESTION_BASE_SCREENING(id);

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
