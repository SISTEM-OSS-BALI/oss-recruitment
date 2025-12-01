import { GET_USERS } from "@/app/providers/user";
import { GeneralError } from "@/app/utils/general-error";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const data = await GET_USERS();
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
