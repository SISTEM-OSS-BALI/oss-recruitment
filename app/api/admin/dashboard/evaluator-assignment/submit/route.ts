import { EvaluatorReviewPayloadCreateModel } from "@/app/models/evaluator-review";
import { SUBMIT_EVALUATOR_ASSIGNMENT_ANSWERS } from "@/app/providers/evaluator-review";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

class GeneralError extends Error {
  code: number;
  error_code?: string;
  details?: unknown;
  constructor(
    message: string,
    code = 400,
    error_code?: string,
    details?: unknown
  ) {
    super(message);
    this.code = code;
    this.error_code = error_code;
    this.details = details;
  }
}

export const POST = async (req: NextRequest) => {
  try {
    const payload =
      (await req.json()) as Partial<EvaluatorReviewPayloadCreateModel>;

      console.log("Payload received in API:", payload);

    // Validasi cepat & jelas
    if (!payload?.id) {
      throw new GeneralError(
        "Field 'id' wajib diisi",
        400,
        "VALIDATION_ID_REQUIRED"
      );
    }
    if (!Array.isArray(payload?.answers)) {
      throw new GeneralError(
        "Field 'answers' harus berupa array",
        400,
        "VALIDATION_ANSWERS_ARRAY"
      );
    }

    const data = await SUBMIT_EVALUATOR_ASSIGNMENT_ANSWERS(
      payload.id,
      payload.answers as Array<{ questionId: string; value: unknown }>
    );

    return NextResponse.json(
      { success: true, message: "Successfully created data!", result: data },
      { status: 200 }
    );
  } catch (error: unknown) {
    // 1) Error yang kamu definisikan sendiri
    if (error instanceof GeneralError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          error_code: error.error_code ?? "GENERAL_ERROR",
          details: error.details,
        },
        { status: error.code }
      );
    }

    // 2) Error Prisma yang umum
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Contoh mapping P2002: unique constraint
      if (error.code === "P2002") {
        return NextResponse.json(
          {
            success: false,
            message: "Data bentrok dengan constraint unik.",
            error_code: "DB_P2002",
            details: error.meta,
          },
          { status: 409 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          message: "Kesalahan database.",
          error_code: `DB_${error.code}`,
          details: error.meta,
        },
        { status: 500 }
      );
    }

    // 3) Fallback unknown error → tetap harus return
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        error_code: "UNHANDLED_EXCEPTION",
      },
      { status: 500 }
    );
  }
};
