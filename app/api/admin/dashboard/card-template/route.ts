import { CardTemplatePayloadCreateModel } from "@/app/models/card-template";
import { CREATE_CARD_TEMPLATE, GET_CARD_TEMPLATES } from "@/app/providers/card-template";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () => {
  try {
    const data = await GET_CARD_TEMPLATES();
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

export const POST = async (req: NextRequest) => {
  try {
    const payload: CardTemplatePayloadCreateModel = await req.json();

    const data = await CREATE_CARD_TEMPLATE(payload);

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
  }
};
