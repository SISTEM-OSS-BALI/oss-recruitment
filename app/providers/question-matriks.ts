// src/app/services/matriks.provider.ts
import { db } from "@/lib/prisma";
import {
  // Data Models
  MatriksBaseQuestionDataModel,
  MatriksColumnDataModel,
  MatriksQuestionDataModel,
  // DTOs
  MatriksBaseCreateDTO,
  MatriksBaseUpdateDTO,
  MatriksColumnCreateDTO,
  MatriksColumnUpsertDTO,
  QuestionMatriksCreateDTO,
  QuestionMatriksUpsertDTO,
  // Mappers
  toPrismaMatriksBaseCreate,
  toPrismaMatriksBaseUpdate,
} from "@/app/models/question-matriks";

/* ========================================================================
 * Helpers
 * ===================================================================== */

/* ========================================================================
 * BASE (MatriksBaseQuestion)
 * ===================================================================== */

/** Ambil semua base (beserta columns & rows) */
export async function GET_MATRIKS_BASES() {
  return db.matriksBaseQuestion.findMany({
    include: { columns: true, rows: true },
    orderBy: [{ createdAt: "desc" }],
  }) as Promise<MatriksBaseQuestionDataModel[]>;
}

/** Ambil daftar pertanyaan (rows) milik sebuah base */
export async function GET_QUESTIONS_MATRIK(base_id: string) {
  return db.matriksQuestion.findMany({
    where: { baseId: base_id },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  }) as Promise<MatriksQuestionDataModel[]>;
}

/** Ambil satu base by id (beserta columns & rows) */
export async function GET_MATRIKS_BASE(id: string) {
  return db.matriksBaseQuestion.findUnique({
    where: { id },
    include: { columns: true, rows: true },
  }) as Promise<MatriksBaseQuestionDataModel | null>;
}

/** CREATE base + nested columns & rows */
export async function CREATE_MATRIKS_BASE(dto: MatriksBaseCreateDTO) {
  const data = toPrismaMatriksBaseCreate(dto);
  return db.matriksBaseQuestion.create({
    data,
    include: { columns: true, rows: true },
  }) as Promise<MatriksBaseQuestionDataModel>;
}

/** UPDATE base + nested upsert/delete untuk columns & rows */
export async function UPDATE_MATRIKS_BASE(
  id: string,
  dto: MatriksBaseUpdateDTO
) {
  const data = toPrismaMatriksBaseUpdate(dto);
  return db.matriksBaseQuestion.update({
    where: { id },
    data,
    include: { columns: true, rows: true },
  }) as Promise<MatriksBaseQuestionDataModel>;
}

/** DELETE base (cascade ke columns & rows sesuai schema) */
export async function DELETE_MATRIKS_BASE(id: string) {
  return db.matriksBaseQuestion.delete({ where: { id } });
}

/* ========================================================================
 * COLUMNS (MatriksColumn) — CRUD terpisah bila diperlukan
 * ===================================================================== */
export async function GET_MATRIKS_COLUMNS(baseId: string) {
  return db.matriksColumn.findMany({
    where: { baseId },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  }) as Promise<MatriksColumnDataModel[]>;
}

export async function CREATE_MATRIKS_COLUMN(
  baseId: string,
  dto: MatriksColumnCreateDTO
) {
  return db.matriksColumn.create({
    data: {
      baseId,
      label: dto.label.trim(),
      value: dto.value.trim(),
      order: dto.order ?? 0,
      active: dto.active ?? true,
    },
  }) as Promise<MatriksColumnDataModel>;
}

export async function CREATE_MATRIKS_COLUMN_BULK(
  baseId: string,
  items: MatriksColumnCreateDTO[]
) {
  const results = await Promise.allSettled(
    (items || []).map((c, idx) =>
      db.matriksColumn.create({
        data: {
          baseId,
          label: c.label.trim(),
          value: c.value.trim(),
          order: c.order ?? idx + 1,
          active: c.active ?? true,
        },
      })
    )
  );

  const created = results
    .filter(
      (r): r is PromiseFulfilledResult<MatriksColumnDataModel> =>
        r.status === "fulfilled"
    )
    .map((r) => r.value);

  const errors = results
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map((r) => r.reason);

  return { created, errors };
}

export async function UPDATE_MATRIKS_COLUMN(
  id: string,
  dto: MatriksColumnUpsertDTO
) {
  return db.matriksColumn.update({
    where: { id },
    data: {
      label: dto.label.trim(),
      value: dto.value.trim(),
      order: dto.order ?? undefined,
      active: dto.active ?? undefined,
    },
  }) as Promise<MatriksColumnDataModel>;
}

export async function DELETE_MATRIKS_COLUMN(id: string) {
  return db.matriksColumn.delete({ where: { id } });
}

/* ========================================================================
 * ROWS (MatriksQuestion = baris pertanyaan) — CRUD terpisah
 * ===================================================================== */
export async function GET_QUESTION_MATRIKS(baseId: string) {
  return db.matriksQuestion.findMany({
    where: { baseId },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  }) as Promise<MatriksQuestionDataModel[]>;
}

export async function CREATE_QUESTION_MATRIKS(
  baseId: string,
  dto: QuestionMatriksCreateDTO
) {
  return db.matriksQuestion.create({
    data: {
      baseId,
      text: dto.text.trim(),
      inputType: dto.inputType, // biasanya SINGLE_CHOICE
      required: dto.required ?? true,
      order: dto.order ?? 0,
      helpText: dto.helpText ?? null,
      placeholder: dto.placeholder ?? null,
    },
  }) as Promise<MatriksQuestionDataModel>;
}

export async function CREATE_QUESTION_MATRIKS_BULK(
  baseId: string,
  items: QuestionMatriksCreateDTO[]
) {
  const results = await Promise.allSettled(
    (items || []).map((r, idx) =>
      db.matriksQuestion.create({
        data: {
          baseId,
          text: r.text.trim(),
          inputType: r.inputType,
          required: r.required ?? true,
          order: r.order ?? idx + 1,
          helpText: r.helpText ?? null,
          placeholder: r.placeholder ?? null,
        },
      })
    )
  );

  const created = results
    .filter(
      (r): r is PromiseFulfilledResult<MatriksQuestionDataModel> =>
        r.status === "fulfilled"
    )
    .map((r) => r.value);

  const errors = results
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map((r) => r.reason);

  return { created, errors };
}

export async function UPDATE_QUESTION_MATRIKS(
  id: string,
  dto: QuestionMatriksUpsertDTO
) {
  return db.matriksQuestion.update({
    where: { id },
    data: {
      text: dto.text.trim(),
      inputType: dto.inputType,
      required: dto.required ?? undefined,
      order: dto.order ?? undefined,
      helpText: dto.helpText ?? undefined,
      placeholder: dto.placeholder ?? undefined,
    },
  }) as Promise<MatriksQuestionDataModel>;
}

export async function DELETE_QUESTION_MATRIKS(id: string) {
  return db.matriksQuestion.delete({ where: { id } });
}
