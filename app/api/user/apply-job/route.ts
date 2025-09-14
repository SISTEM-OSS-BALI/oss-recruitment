import { CandidatePayloadCreateModel } from "@/app/models/apply-job";
import { CREATE_CANDIDATE } from "@/app/providers/apply-job";
import { GET_JOB } from "@/app/providers/job";
import { GeneralError } from "@/app/utils/general-error";
import { sendRecruitmentEmail } from "@/app/utils/send-email";

import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const payload: CandidatePayloadCreateModel = await req.json();

    const data = await CREATE_CANDIDATE(payload);

    const getDetailJob = await GET_JOB(payload.job_id);
    await sendRecruitmentEmail(payload.email, payload.name, {
      type: "applied",
      jobTitle: getDetailJob?.name,
      idApply: getDetailJob?.id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Successfully registered!",
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
        message: "Failed to register user",
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
};