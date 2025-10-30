// src/app/services/matriks.provider.ts
import { db } from "@/lib/prisma";
import {
  // Data Models
  MatriksBaseQuestionDataModel,
  MatriksColumnDataModel,
  MatriksQuestionDataModel,
  MatriksBaseCreateDTO,
  MatriksBaseUpdateDTO,
  MatriksColumnCreateDTO,
  MatriksColumnUpsertDTO,
  MatriksQuestionCreateDTO,
  MatriksQuestionUpsertDTO,
  toPrismaMatriksBaseCreate,
  toPrismaMatriksBaseUpdate,
} from "@/app/models/question-matriks";

/* ========================================================================
 * Helpers
 * ===================================================================== */
function isNonEmptyArray<T>(x: T[] | undefined | null): x is T[] {
  return Array.isArray(x) && x.length > 0;
}

/* ========================================================================
 * BASE (MatriksBaseQuestion)
 * ===================================================================== */

/** (Opsional) Ambil semua base lengkap */
export async function GET_MATRIKS_BASES() {
  return db.matriksBaseQuestion.findMany({
    include: {
      columns: true,
      rows: {
        include: {
          // pakai nama relasi sesuai schema
          matriksQuestionOption: {
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          },
        },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      },
    },
    orderBy: [{ createdAt: "desc" }],
  }) as Promise<MatriksBaseQuestionDataModel[]>;
}

/** Ambil satu base by id (lengkap) */
export async function GET_MATRIKS_BASE(id: string) {
  return db.matriksBaseQuestion.findUnique({
    where: { id },
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
  }) as Promise<MatriksBaseQuestionDataModel | null>;
}

/** CREATE base + nested columns/rows */
export async function CREATE_MATRIKS_BASE(dto: MatriksBaseCreateDTO) {
  const data = toPrismaMatriksBaseCreate(dto);

  return db.matriksBaseQuestion.create({
    data,
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
  }) as Promise<MatriksBaseQuestionDataModel>;
}

/** UPDATE base + nested columns/rows */
export async function UPDATE_MATRIKS_BASE(
  id: string,
  dto: MatriksBaseUpdateDTO
) {
  const data = toPrismaMatriksBaseUpdate(dto);

  return db.matriksBaseQuestion.update({
    where: { id },
    data,
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
  }) as Promise<MatriksBaseQuestionDataModel>;
}

export async function DELETE_MATRIKS_BASE(id: string) {
  return db.matriksBaseQuestion.delete({ where: { id } });
}

/* ========================================================================
 * COLUMNS (MatriksColumn)
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
 * ROWS (MatriksQuestion) + OPTIONS (MatriksQuestionOption)
 * ===================================================================== */

/** Ambil semua pertanyaan (rows) untuk satu base, beserta options */
export async function GET_QUESTION_MATRIKS(baseId: string) {
  return db.matriksQuestion.findMany({
    where: { baseId },
    include: {
      matriksQuestionOption: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      },
    },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  }) as Promise<MatriksQuestionDataModel[]>;
}

/** Ambil satu pertanyaan matriks beserta option-nya */
export async function GET_QUESTION_MATRIKS_BY_ID(id: string) {
  return db.matriksQuestion.findUnique({
    where: { id },
    include: {
      matriksQuestionOption: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      },
    },
  }) as Promise<MatriksQuestionDataModel | null>;
}

/** CREATE satu pertanyaan + (opsional) nested options */
export async function CREATE_QUESTION_MATRIKS(
  baseId: string,
  dto: MatriksQuestionCreateDTO
) {
  const data: any = {
    baseId,
    text: dto.text.trim(),
    inputType: dto.inputType,
    required: dto.required ?? true,
    order: dto.order ?? 0,
    helpText: dto.helpText ?? null,
    placeholder: dto.placeholder ?? null,
  };

  if (isNonEmptyArray(dto.options)) {
    data.matriksQuestionOption = {
      create: dto.options.map((o, i) => ({
        label: o.label.trim(),
        value: o.value.trim(),
        order: o.order ?? i + 1,
        active: o.active ?? true,
      })),
    };
  }

  return db.matriksQuestion.create({
    data,
    include: { matriksQuestionOption: true },
  }) as Promise<MatriksQuestionDataModel>;
}

/** BULK create multiple pertanyaan + (opsional) options */
export async function CREATE_QUESTION_MATRIKS_BULK(
  baseId: string,
  items: MatriksQuestionCreateDTO[]
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
          ...(isNonEmptyArray(r.options)
            ? {
                matriksQuestionOption: {
                  create: r.options.map((o, i) => ({
                    label: o.label.trim(),
                    value: o.value.trim(),
                    order: o.order ?? i + 1,
                    active: o.active ?? true,
                  })),
                },
              }
            : {}),
        },
        include: { matriksQuestionOption: true },
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

/** UPDATE satu pertanyaan + nested options (update/create/deleteMany) */
export async function UPDATE_QUESTION_MATRIKS(
  id: string,
  dto: MatriksQuestionUpsertDTO
) {
  const data: any = {
    text: dto.text?.trim(),
    inputType: dto.inputType,
    required: dto.required ?? undefined,
    order: dto.order ?? undefined,
    helpText: dto.helpText ?? undefined,
    placeholder: dto.placeholder ?? undefined,
  };

  if (dto.options) {
    const nested: any = {};

    if (isNonEmptyArray(dto.options.deleteIds)) {
      nested.deleteMany = dto.options.deleteIds.map((oid) => ({ id: oid }));
    }

    if (isNonEmptyArray(dto.options.upsert)) {
      const toUpdate = dto.options.upsert.filter((o) => !!o.id);
      const toCreate = dto.options.upsert.filter((o) => !o.id);

      if (toUpdate.length > 0) {
        nested.update = toUpdate.map((o) => ({
          where: { id: o.id! },
          data: {
            label: o.label.trim(),
            value: o.value.trim(),
            order: o.order ?? undefined,
            active: o.active ?? undefined,
          },
        }));
      }

      if (toCreate.length > 0) {
        nested.create = toCreate.map((o, i) => ({
          label: o.label.trim(),
          value: o.value.trim(),
          order: o.order ?? i + 1,
          active: o.active ?? true,
        }));
      }
    }

    if (nested.create || nested.update || nested.deleteMany) {
      data.matriksQuestionOption = nested;
    }
  }

  return db.matriksQuestion.update({
    where: { id },
    data,
    include: { matriksQuestionOption: true },
  }) as Promise<MatriksQuestionDataModel>;
}

export async function DELETE_QUESTION_MATRIKS(id: string) {
  return db.matriksQuestion.delete({ where: { id } });
}
