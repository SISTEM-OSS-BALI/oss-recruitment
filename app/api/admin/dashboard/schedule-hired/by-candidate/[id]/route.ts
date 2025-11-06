import { GET_SCHEDULES_BY_CANDIDATE } from "@/app/providers/schedule-hired";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { id?: string } }
) => {
  try {
    if (!params?.id) {
      return NextResponse.json(
        { success: false, message: "Candidate id is required" },
        { status: 400 }
      );
    }

    const data = await GET_SCHEDULES_BY_CANDIDATE(params.id);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully get data!",
        result: data,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    // Known app error
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

    // Always return a response for unknown errors too
    const msg =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch schedules by candidate",
        error: msg,
      },
      { status: 500 }
    );
  }
};
