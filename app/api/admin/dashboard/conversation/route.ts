import { GET_CONVERSATIONS } from "@/app/providers/conversation";
import { GeneralError } from "@/app/utils/general-error";
import { RecruitmentStage } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async (req: NextRequest) => {
  try {
    const jobId = req.nextUrl.searchParams.get("job_id") || undefined;
    const search = req.nextUrl.searchParams.get("search") || undefined;
    const stagesRaw = req.nextUrl.searchParams.getAll("stage");
    const stages = stagesRaw
      .map((value) => value.trim())
      .filter(Boolean) as RecruitmentStage[];

    const data = await GET_CONVERSATIONS({
      job_id: jobId,
      search,
      stages: stages.length ? stages : undefined,
    });
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
    console.error("[api/admin/dashboard/conversation] unexpected error", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error_code: "UNHANDLED_EXCEPTION",
      },
      { status: 500 }
    );
  }
};
