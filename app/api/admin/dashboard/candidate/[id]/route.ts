import { UPDATE_STATUS_CANDIDATE } from "@/app/providers/candidate";
import { CREATE_HISTORY_CANDIDATE } from "@/app/providers/history-candidate";
import { NextRequest, NextResponse } from "next/server";

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const id = params.id;
    const body = await req.json();
    const stage = body.stage;

    const data = await UPDATE_STATUS_CANDIDATE(id, stage);

    await CREATE_HISTORY_CANDIDATE({
      candidate_id: id,
      stage: stage,
    });

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
