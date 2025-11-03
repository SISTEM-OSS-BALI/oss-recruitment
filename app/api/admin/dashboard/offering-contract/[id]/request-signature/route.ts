import {
  GET_OFFERING_CONTRACT,
  MARK_DIRECTOR_SIGNATURE_REQUESTED,
} from "@/app/providers/offering-contract";
import { GeneralError } from "@/app/utils/general-error";
import { sendDirectorSignatureEmail } from "@/app/utils/send-email";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await req
      .json()
      .catch(() => ({}) as { email?: string; message?: string });

    const directorEmail =
      payload?.email || process.env.DIRECTOR_SIGNATURE_EMAIL;

    if (!directorEmail) {
      throw new GeneralError({
        code: 400,
        error: "Bad Request",
        error_code: "DIRECTOR_EMAIL_MISSING",
        details:
          "Director email is not configured. Please set DIRECTOR_SIGNATURE_EMAIL in environment variables or provide email in request body.",
      });
    }

    const contract = await GET_OFFERING_CONTRACT(params.id);

    if (!contract) {
      throw new GeneralError({
        code: 404,
        error: "Not Found",
        error_code: "OFFER_CONTRACT_NOT_FOUND",
        details: "Offering contract not found.",
      });
    }

    if (!contract.filePath) {
      throw new GeneralError({
        code: 400,
        error: "Bad Request",
        error_code: "CONTRACT_FILE_MISSING",
        details: "Contract filePath is missing. Generate the contract first.",
      });
    }

    const candidateName = contract.applicant?.user?.name ?? "Candidate";
    const jobTitle = contract.applicant?.job?.name ?? "Requested Position";

    await sendDirectorSignatureEmail({
      to: directorEmail,
      candidateName,
      jobTitle,
      contractUrl: contract.filePath,
      notes: payload?.message,
    });

    const updated = await MARK_DIRECTOR_SIGNATURE_REQUESTED(contract.id);

    return NextResponse.json(
      {
        success: true,
        message: "Signature request sent successfully.",
        result: updated,
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
        message: "Failed to send director signature request.",
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
