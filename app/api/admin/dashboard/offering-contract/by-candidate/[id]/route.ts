import {
  GET_OFFERING_CONTRACT_BY_APPLICATION_ID,
  UPDATE_OFFERING_CONTRACT_CANDIDATE_DECISION,
} from "@/app/providers/offering-contract";
import type { OfferDecisionValue } from "@/app/models/offering-contract";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";

const OFFER_DECISION_STATUSES: readonly OfferDecisionValue[] = [
  "PENDING",
  "ACCEPTED",
  "DECLINED",
];

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await GET_OFFERING_CONTRACT_BY_APPLICATION_ID(params.id);
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

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get offering contract",
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicantId = params.id;
    const payload = (await req.json()) as {
      decision?: string;
      signatureUrl?: string | null;
      signaturePath?: string | null;
      rejectionReason?: string | null;
    };

    if (!payload?.decision) {
      throw new GeneralError({
        code: 400,
        error: "Bad Request",
        error_code: "BAD_REQUEST",
        details: "decision is required",
      });
    }

    const normalizedDecision = payload.decision
      .toString()
      .trim()
      .toUpperCase() as OfferDecisionValue;

    if (!OFFER_DECISION_STATUSES.includes(normalizedDecision)) {
      throw new GeneralError({
        code: 400,
        error: "Bad Request",
        error_code: "INVALID_DECISION",
        details: "Invalid decision value",
      });
    }

    const data = await UPDATE_OFFERING_CONTRACT_CANDIDATE_DECISION({
      applicant_id: applicantId,
      decision: normalizedDecision,
      signatureUrl: payload.signatureUrl ?? null,
      signaturePath: payload.signaturePath ?? null,
      rejectionReason: payload.rejectionReason ?? null,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Candidate decision updated successfully!",
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
        message: "Failed to update candidate decision",
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
