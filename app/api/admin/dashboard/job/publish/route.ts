import { NextRequest, NextResponse } from "next/server";

import { PUBLISH_JOB } from "@/app/providers/job";
import { GeneralError } from "@/app/utils/general-error";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const jobId = body?.id;

    if (!jobId || typeof jobId !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Job id is required",
        },
        { status: 400 }
      );
    }

    const data = await PUBLISH_JOB(jobId);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully published job",
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
        message:
          error instanceof Error ? error.message : "Failed to publish job",
      },
      { status: 500 }
    );
  }
};
