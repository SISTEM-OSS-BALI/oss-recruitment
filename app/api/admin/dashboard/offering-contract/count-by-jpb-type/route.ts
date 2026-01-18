import COUNT_OFFERING_CONTRACTS from "@/app/providers/offering-contract";
import { GeneralError } from "@/app/utils/general-error";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const data = await COUNT_OFFERING_CONTRACTS();
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