import { LocationPayloadCreateModel } from "@/app/models/location";
import { CREATE_LOCATION, GET_LOCATIONS } from "@/app/providers/location";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () => {
  try {
    const data = await GET_LOCATIONS();
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
    const payload: LocationPayloadCreateModel = await req.json();

    const data = await CREATE_LOCATION(payload);

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
