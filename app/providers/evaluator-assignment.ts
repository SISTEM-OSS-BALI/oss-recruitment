// src/app/providers/evaluator-assignment.provider.ts
import db from "@/lib/prisma";
import type { EvaluationStatus, Prisma } from "@prisma/client";

/** Payload untuk CREATE (assign ke banyak evaluator sekaligus) */
export type EvaluatorAssignmentPayloadCreateModel = {
  applicant_id: string;
  base_matriks_id: string;
  /** daftar evaluator yang akan di-assign */
  evaluator_ids: string[];
  /** opsional kalau mau kirim link saat assign */
  link_url?: string | null;
  /** override waktu assign (jarang dipakai) */
  assignedAt?: Date;
};

/** Payload untuk UPDATE satu assignment */
export type EvaluatorAssignmentUpdatePayload = Partial<{
  applicant_id: string;
  base_matriks_id: string;
  evaluatorId: string;
  status: EvaluationStatus;
  submittedAt: Date | null;
  link_url: string | null;
}>;

/* ========================================================================
 * CREATE – assign base matriks ke banyak evaluator utk satu applicant
 * ===================================================================== */

export const CREATE_EVALUATOR_ASSIGNMENT = async (
  payload: EvaluatorAssignmentPayloadCreateModel
) => {
  const {
    applicant_id,
    base_matriks_id,
    evaluator_ids,
    link_url, // opsional; jika diisi, akan dipakai apa adanya (trimmed)
    assignedAt, // opsional
  } = payload;

  if (!applicant_id) throw new Error("applicant_id wajib diisi");
  if (!base_matriks_id) throw new Error("base_matriks_id wajib diisi");
  if (!Array.isArray(evaluator_ids) || evaluator_ids.length === 0) {
    throw new Error("evaluator_ids wajib berupa array dan tidak boleh kosong");
  }

  // Ambil origin absolut untuk membangun URL
  const ORIGIN_RAW =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";

  const ORIGIN = /^https?:\/\//i.test(ORIGIN_RAW)
    ? ORIGIN_RAW
    : `http://${ORIGIN_RAW}`;

  const makeLinkFromAssignmentId = (assignmentId: string) => {
    const url = new URL("/evaluator/assessment", ORIGIN);
    url.search = new URLSearchParams({
      evaluator_assignment_id: assignmentId,
    }).toString();
    return url.toString();
  };

  const pickManual = (manual?: string | null) => {
    const trimmed = typeof manual === "string" ? manual.trim() : "";
    return trimmed || null;
  };
  const manualLink = pickManual(link_url);
  const created = await db.$transaction(async (tx) => {
    const results: any[] = [];

    for (const evaluatorId of evaluator_ids) {
      const createdRow = await tx.evaluatorAssignment.create({
        data: {
          applicant_id,
          base_matriks_id,
          evaluatorId,
          ...(assignedAt ? { assignedAt } : {}),
        },
      });

      const finalLink = manualLink ?? makeLinkFromAssignmentId(createdRow.id);
      const updated = await tx.evaluatorAssignment.update({
        where: { id: createdRow.id },
        data: { link_url: finalLink },
        include: {
          applicant: true,
          baseMatriks: true,
          evaluator: true,
          answers: true,
        },
      });

      results.push(updated);
    }

    return results;
  });

  return created; // array EvaluatorAssignment (sudah include dan link_url berbasis assignment id)
};

/* ========================================================================
 * UPDATE – update 1 assignment by id
 * ===================================================================== */
export const UPDATE_EVALUATOR_ASSIGNMENT = async (
  id: string,
  payload: EvaluatorAssignmentUpdatePayload
) => {
  if (!id) throw new Error("id wajib diisi");

  const result = await db.evaluatorAssignment.update({
    where: { id },
    data: {
      ...(payload.applicant_id ? { applicant_id: payload.applicant_id } : {}),
      ...(payload.base_matriks_id
        ? { base_matriks_id: payload.base_matriks_id }
        : {}),
      ...(payload.evaluatorId ? { evaluatorId: payload.evaluatorId } : {}),
      ...(payload.status ? { status: payload.status } : {}),
      ...(payload.submittedAt !== undefined
        ? { submittedAt: payload.submittedAt }
        : {}),
      ...(payload.link_url !== undefined ? { link_url: payload.link_url } : {}),
    },
    include: {
      applicant: true,
      baseMatriks: true,
      evaluator: true,
      answers: true,
    },
  });

  return result;
};

/* ========================================================================
 * GET MANY – dengan filter opsional
 * ===================================================================== */
export const GET_EVALUATOR_ASSIGNMENTS = async (filter?: {
  applicant_id?: string;
  base_matriks_id?: string;
  evaluatorId?: string;
  status?: EvaluationStatus;
}) => {
  const result = await db.evaluatorAssignment.findMany({
    where: {
      ...(filter?.applicant_id
        ? { applicant_id: filter.applicant_id }
        : undefined),
      ...(filter?.base_matriks_id
        ? { base_matriks_id: filter.base_matriks_id }
        : undefined),
      ...(filter?.evaluatorId
        ? { evaluatorId: filter.evaluatorId }
        : undefined),
      ...(filter?.status ? { status: filter.status } : undefined),
    },
    include: {
      applicant: true,
      baseMatriks: true,
      evaluator: true,
      answers: true,
    },
    orderBy: [{ assignedAt: "desc" }, { createdAt: "desc" as any }], // createdAt jika ada
  });
  return result;
};

/* ========================================================================
 * GET ONE – by id
 * ===================================================================== */
export const GET_EVALUATOR_ASSIGNMENT = async (id: string) => {
  if (!id) throw new Error("id wajib diisi");

  const result = await db.evaluatorAssignment.findUnique({
    where: { id },
    include: {
      applicant: {
        include: {
          user: true,
        },
      },
      baseMatriks: {
        include: {
          columns: true,
          rows: {
            include: {
              matriksQuestionOption: {
                orderBy: [{ order: "asc" }, { createdAt: "asc" }],
              },
            },
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          },
        },
      },
      evaluator: true,
    },
  });
  return result;
};

/* ========================================================================
 * DELETE – by id
 * ===================================================================== */
export const DELETE_EVALUATOR_ASSIGNMENT = async (id: string) => {
  if (!id) throw new Error("id wajib diisi");

  const result = await db.evaluatorAssignment.delete({
    where: { id },
  });
  return result;
};


