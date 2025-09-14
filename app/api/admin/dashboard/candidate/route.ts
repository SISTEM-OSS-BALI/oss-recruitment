import { GET_CANDIDATES } from "@/app/providers/candidate";
import { GeneralError } from "@/app/utils/general-error";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const data = await GET_CANDIDATES();
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

    // return NextResponse.json(
    //   {
    //     success: false,
    //     message: "Failed to get data",
    //     error: error instanceof Error ? error.message : "Internal server error",
    //   },
    //   { status: 500 }
    // );
  }
};
