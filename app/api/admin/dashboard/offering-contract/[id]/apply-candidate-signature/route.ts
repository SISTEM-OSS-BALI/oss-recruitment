import { NextRequest, NextResponse } from "next/server";

import { GET_OFFERING_CONTRACT } from "@/app/providers/offering-contract";
import { GeneralError } from "@/app/utils/general-error";
import { applyCandidateSignatureToContract } from "@/app/utils/contract-signature";

export async function POST(
  _req: NextRequest,
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
    if (!contract.filePath || !contract.candidateSignatureUrl) {
      throw new GeneralError({
        code: 400,
        error: "Bad Request",
        error_code: "MISSING_SIGNATURE_OR_FILE",
        details: "PDF kontrak atau signature belum tersedia.",
      });
    }

    const updated = await applyCandidateSignatureToContract(contract);

    return NextResponse.json(
      {
        success: true,
        message: "Signature berhasil ditempelkan.",
        result: updated.candidateSignedPdfUrl,
      },
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
        message: "Gagal memproses signature PDF.",
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
