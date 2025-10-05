import { GET_AVAILABLE_SCHEDULE } from "@/app/controller/find-available-schedule";
import { GeneralError } from "@/app/utils/general-error";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const schedule_id = searchParams.get("schedule_id") ?? "";
    const selected_date = searchParams.get("selected_date") ?? "";

    


    if (!schedule_id.trim()) {
      return NextResponse.json(
        { success: false, message: "schedule_id is required" },
        { status: 400 }
      );
    }

    const data = await GET_AVAILABLE_SCHEDULE({
      schedule_id,
      selected_date
    });

    return NextResponse.json(
      { success: true, message: "Successfully get data!", result: data },
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
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}