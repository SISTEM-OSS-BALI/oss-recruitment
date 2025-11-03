import { NextRequest, NextResponse } from "next/server";
import {
  GET_OFFERING_CONTRACT,
  UPDATE_DIRECTOR_SIGNATURE_DOCUMENT,
} from "@/app/providers/offering-contract";
import { GeneralError } from "@/app/utils/general-error";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = (await req.json()) as {
      signatureUrl?: string | null;
      signaturePath?: string | null;
    };

    const contract = await GET_OFFERING_CONTRACT(params.id);

    if (!contract) {
      throw new GeneralError({
        code: 404,
        error: "Not Found",
        error_code: "OFFER_CONTRACT_NOT_FOUND",
        details: "Offering contract not found.",
      });
    }

    const signatureUrl =
      payload.signatureUrl === undefined ? contract.directorSignatureUrl : payload.signatureUrl;
    const signaturePath =
      payload.signaturePath === undefined ? contract.directorSignaturePath : payload.signaturePath;

    if (signatureUrl && !signaturePath) {
      throw new GeneralError({
        code: 400,
        error: "Bad Request",
        error_code: "SIGNATURE_PATH_REQUIRED",
        details: "signaturePath is required when signatureUrl is provided.",
      });
    }

    const updated = await UPDATE_DIRECTOR_SIGNATURE_DOCUMENT({
      contractId: contract.id,
      signatureUrl: signatureUrl ?? null,
      signaturePath: signaturePath ?? null,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Director signature document updated successfully.",
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
        message: "Failed to update director signature document.",
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
