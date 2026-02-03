import { NextResponse } from "next/server";

import { GET_REFERRAL_JOB_BY_CODE } from "@/app/providers/referral-link";

export async function GET(
  _req: Request,
  { params }: { params: { code?: string } }
) {
  const code = params?.code?.trim();

  if (!code) {
    return NextResponse.json(
      { success: false, message: "Referral code is required" },
      { status: 400 }
    );
  }

  try {
    const result = await GET_REFERRAL_JOB_BY_CODE(code);
    if (!result) {
      return NextResponse.json(
        { success: false, message: "Referral link not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully get referral job",
      result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get referral job";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
