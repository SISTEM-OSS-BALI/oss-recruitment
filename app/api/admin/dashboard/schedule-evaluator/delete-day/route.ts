import { DELETE_SCHEDULE_TIME } from "@/app/providers/schedule-time";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("dayId") as string;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing id parameter",
        },
        { status: 400 }
      );
    }

    const data = await DELETE_SCHEDULE_TIME(id);

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
