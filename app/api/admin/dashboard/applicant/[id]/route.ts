import {
  GET_APPLICANT,
  UPDATE_STATUS_CANDIDATE,
} from "@/app/providers/applicant";
import { CREATE_HISTORY_CANDIDATE } from "@/app/providers/history-candidate";
import { GET_USER_BY_APPLICANT_ID } from "@/app/providers/user";
import { toRecruitmentStage } from "@/app/utils/recruitment-stage";
import { formatPhoneNumber, sendWhatsAppMessage } from "@/app/utils/send-message-helper";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const id = params.id;
    const data = await GET_APPLICANT(id);
    return NextResponse.json(
      {
        success: true,
        message: "Successfully get data!",
        result: data,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get data",
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const id = params.id;
    const body = await req.json();
    // Normalize stage string to a valid RecruitmentStage enum value
    const stageRaw = body.stage as string | undefined;
    const stage = toRecruitmentStage(stageRaw ?? "");

    const data = await UPDATE_STATUS_CANDIDATE(id, stage);

    const user = await GET_USER_BY_APPLICANT_ID(id)

    await CREATE_HISTORY_CANDIDATE({
      applicantId: id,
      stage,
    });

    const waMessage = `Hi ${user?.name}, your status has been updated to ${stage}.`;

    const phone = formatPhoneNumber(user?.phone || "");
    if (phone) {
      await sendWhatsAppMessage(phone, waMessage);
    }


    return NextResponse.json(
      {
        success: true,
        message: "Successfully updated!",
        result: data,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user",
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
};
