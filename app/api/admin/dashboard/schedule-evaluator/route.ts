import { ScheduleEvaluatorPayloadCreateModel } from "@/app/models/schedule-evaluator";
import {
  CREATE_OR_REPLACE_SCHEDULE_EVALUATOR,
  GENERATE_LINK_SCHEDULE_BY_EVALUATOR, 
  GET_SCHEDULE_EVALUATORS,
} from "@/app/providers/schedule-evaluator";
import { GeneralError } from "@/app/utils/general-error";
import db from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export const GET = async () => {
  try {
    const data = await GET_SCHEDULE_EVALUATORS();
    return NextResponse.json(
      { success: true, message: "Successfully get data!", result: data },
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
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const payload = (await req.json()) as ScheduleEvaluatorPayloadCreateModel;

    const evaluator_id = payload?.evaluator_id;
    if (!evaluator_id) {
      return NextResponse.json(
        { success: false, message: "evaluator_id is required" },
        { status: 400 }
      );
    }

    const result = await db.$transaction(async (tx) => {
      const evaluator = await tx.evaluator.findUnique({
        where: { id: evaluator_id },
        select: { id: true, link_schedule: true },
      });
      if (!evaluator) {
        throw new Error("Evaluator not found");
      }

      const existsCount = await tx.scheduleEvaluator.count({
        where: { evaluator_id },
      });

      const created = await CREATE_OR_REPLACE_SCHEDULE_EVALUATOR(tx, payload);

      if (existsCount === 0 || !evaluator.link_schedule) {
        await GENERATE_LINK_SCHEDULE_BY_EVALUATOR(
          tx,
          evaluator_id,
          created.schedule_id,
          {
            onlyIfEmpty: true,
          }
        );
      }

      return created;
    });

    return NextResponse.json(
      { success: true, message: "Successfully created data!", result },
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

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // contoh mapping error Prisma (P2003: FK constraint, P2025: record not found, dll.)
      const code = error.code;
      const msg =
        code === "P2025"
          ? "Record not found"
          : code === "P2003"
          ? "Foreign key constraint failed"
          : error.message;
      return NextResponse.json(
        { success: false, message: msg, code },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
};
