import { DELETE_EVALUATOR_ASSIGNMENT, GET_EVALUATOR_ASSIGNMENT, UPDATE_EVALUATOR_ASSIGNMENT, EvaluatorAssignmentUpdatePayload } from "@/app/providers/evaluator-assignment";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";


export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const id = params.id;

    const data = await GET_EVALUATOR_ASSIGNMENT(id);

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

export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const id = params.id;
    const body = (await req.json()) as Partial<
      EvaluatorAssignmentUpdatePayload & { submittedAt?: string | Date | null }
    >;

    const payload: EvaluatorAssignmentUpdatePayload = {
      ...body,
    };

    if ("submittedAt" in body) {
      const rawValue = body.submittedAt;
      if (rawValue === null) {
        payload.submittedAt = null;
      } else if (rawValue instanceof Date) {
        payload.submittedAt = rawValue;
      } else if (typeof rawValue === "string") {
        const parsed = new Date(rawValue);
        payload.submittedAt = Number.isNaN(parsed.valueOf())
          ? undefined
          : parsed;
      } else if (rawValue === undefined) {
        payload.submittedAt = undefined;
      }
    }

    const data = await UPDATE_EVALUATOR_ASSIGNMENT(id, payload);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully updated!",
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

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const id = params.id;

    const data = await DELETE_EVALUATOR_ASSIGNMENT(id);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully deleted!",
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
