import { NextRequest, NextResponse } from "next/server";
import { GET_OFFERING_CONTRACT } from "@/app/providers/offering-contract";
import { sendRecruitmentEmail } from "@/app/vendor/send-email";
import { GeneralError } from "@/app/utils/general-error";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contract = await GET_OFFERING_CONTRACT(params.id);
    if (!contract) {
      throw new GeneralError({
        code: 404,
        error: "Not Found",
        error_code: "OFFER_CONTRACT_NOT_FOUND",
        details: "Kontrak tidak ditemukan.",
      });
    }
    if (!contract.candidateSignedPdfUrl || !contract.notifyEmail) {
      throw new GeneralError({
        code: 400,
        error: "Bad Request",
        error_code: "SIGNED_DOC_OR_EMAIL_MISSING",
        details:
          "Pastikan email tujuan dan PDF bertanda tangan sudah tersedia.",
      });
    }

    await sendRecruitmentEmail(
      contract.notifyEmail,
      contract.applicant?.user?.name ?? "Candidate",
      {
        type: "applied", // atau buat type baru, mis. "offerSent"
        jobTitle: contract.applicant?.job?.name ?? "Offer",
        idApply: contract.applicant?.id,
      }
    );

    return NextResponse.json(
      { success: true, message: "Email kontrak bertanda tangan dikirim." },
      { status: 200 }
    );
  } catch (error) {
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
        message: "Gagal mengirim email final.",
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
