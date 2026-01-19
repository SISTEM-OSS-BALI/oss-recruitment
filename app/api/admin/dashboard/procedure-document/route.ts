import { ProcedureDocumentPayloadCreateModel } from "@/app/models/procedure-documents";
import { CREATE_PROCEDURE_DOCUMENT, GET_PROCEDURE_DOCUMENTS } from "@/app/providers/procedure-document";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () => {
  try {
    const data = await GET_PROCEDURE_DOCUMENTS();
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
        message: "Unexpected error.",
      },
      { status: 500 }
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const payload: ProcedureDocumentPayloadCreateModel= await req.json();

    const data = await CREATE_PROCEDURE_DOCUMENT(payload);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully created data!",
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
