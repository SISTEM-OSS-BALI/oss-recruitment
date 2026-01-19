import { ProcedureDocumentPayloadUpdateModel } from "@/app/models/procedure-documents";
import { DELETE_PROCEDURE_DOCUMENT, GET_PROCEDURE_DOCUMENT, UPDATE_PROCEDURE_DOCUMENT } from "@/app/providers/procedure-document";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const id = params.id;

    const data = await GET_PROCEDURE_DOCUMENT(id);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully get location!",
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
        message: "Unexpected error.",
      },
      { status: 500 }
    );
  }
};

export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const id = params.id;
    const payload: ProcedureDocumentPayloadUpdateModel = await req.json();

    const data = await UPDATE_PROCEDURE_DOCUMENT(id, payload);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully updated location!",
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
        message: "Unexpected error.",
      },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const id = params.id;

    const data = await DELETE_PROCEDURE_DOCUMENT(id);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully deleted location!",
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
        message: "Unexpected error.",
      },
      { status: 500 }
    );
  }
};
