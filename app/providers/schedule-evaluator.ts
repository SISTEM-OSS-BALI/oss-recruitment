// providers/schedule-evaluator.ts
import type { Prisma } from "@prisma/client";
import db from "@/lib/prisma";
import type {
  ScheduleEvaluatorPayloadCreateModel,
  ScheduleEvaluatorDataModel,
} from "@/app/models/schedule-evaluator";

const withClient = (tx?: Prisma.TransactionClient) => tx ?? db;

export async function GET_SCHEDULE_EVALUATORS() {
  return db.scheduleEvaluator.findMany({
    include: {
      evaluator: true,
      days: { include: { times: true } },
    },
    orderBy: { createdAt: "desc" },
  }) as unknown as ScheduleEvaluatorDataModel[];
}


export async function CREATE_OR_REPLACE_SCHEDULE_EVALUATOR(
  tx: Prisma.TransactionClient,
  payload: ScheduleEvaluatorPayloadCreateModel // { evaluator_id, days: { create: [...] } }
) {
  const existing = await tx.scheduleEvaluator.findFirst({
    where: { evaluator_id: payload.evaluator_id },
    select: { schedule_id: true },
  });

  if (existing) {
    // bersihkan hari & times lama
    await tx.scheduleTime.deleteMany({
      where: { day: { schedule_id: existing.schedule_id } },
    });
    await tx.scheduleDay.deleteMany({
      where: { schedule_id: existing.schedule_id },
    });

    // isi ulang
    return tx.scheduleEvaluator.update({
      where: { schedule_id: existing.schedule_id },
      data: { days: payload.days ?? undefined },
      include: { days: { include: { times: true } } },
    });
  }

  // baru
  return tx.scheduleEvaluator.create({
    data: payload,
    include: { days: { include: { times: true } } },
  });
}

/** Generate link berdasarkan evaluator_id */
export async function GENERATE_LINK_SCHEDULE_BY_EVALUATOR(
  tx: Prisma.TransactionClient | undefined,
  evaluatorId: string,
  schedule_id?: string,
  opts?: { onlyIfEmpty?: boolean; baseUrl?: string }
) {
  const client = withClient(tx);
  const {
    onlyIfEmpty = true,
    baseUrl = process.env.NEXT_PUBLIC_BASE_URL,
  } = opts ?? {};

  const existing = await client.evaluator.findUnique({
    where: { id: evaluatorId },
    select: { id: true, link_schedule: true },
  });
  if (!existing) throw new Error("Evaluator not found");

  if (onlyIfEmpty && existing.link_schedule) {
    return existing;
  }

  const link = `${baseUrl}/evaluator/schedule?schedule_id=${schedule_id}`;
  return client.evaluator.update({
    where: { id: evaluatorId },
    data: { link_schedule: link },
    select: { id: true, link_schedule: true },
  });
}

export async function GET_SCHEDULE_EVALUATOR(id: string) {
  return db.scheduleEvaluator.findUnique({
    where: { schedule_id: id },
    include: {
      evaluator: true,
      days: { include: { times: true } },
    },
  }) as unknown as ScheduleEvaluatorDataModel | null;
}
