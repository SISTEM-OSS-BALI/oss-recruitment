// src/app/models/matriks.ts
/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { Prisma, QuestionMatriksType } from "@prisma/client";

/* =========================================================
 * READ MODELS (DataModel) – untuk response dari Prisma
 * ========================================================= */
export type MatriksBaseQuestionDataModel =
  Prisma.MatriksBaseQuestionGetPayload<{
    include: { columns: true; rows: true };
  }>;

export type MatriksColumnDataModel = Prisma.MatriksColumnGetPayload<{}>;
export type MatriksQuestionDataModel = Prisma.MatriksQuestionGetPayload<{}>;

/* =========================================================
 * DTOs: client-side payloads (tanpa Zod)
 * ========================================================= */
/** Kolom di header matriks (opsi yang bisa dipilih per baris) */
export type MatriksColumnCreateDTO = {
  label: string;
  value: string; // unik per base
  order?: number | null;
  active?: boolean | null;
};

export type MatriksColumnUpsertDTO = {
  id?: string; // ada → update, tdk ada → create
  label: string;
  value: string;
  order?: number | null;
  active?: boolean | null;
};

/** Baris/pertanyaan matriks (tipe input SINGLE_CHOICE) */
export type QuestionMatriksCreateDTO = {
  text: string;
  inputType: QuestionMatriksType; // sebaiknya SINGLE_CHOICE
  required?: boolean;
  order?: number;
  helpText?: string | null;
  placeholder?: string | null;
};

export type QuestionMatriksUpsertDTO = {
  id?: string; // ada → update, tdk ada → create
  text: string;
  inputType: QuestionMatriksType; // sebaiknya SINGLE_CHOICE
  required?: boolean;
  order?: number;
  helpText?: string | null;
  placeholder?: string | null;
};

/** CREATE base + optional nested columns/rows */
export type MatriksBaseCreateDTO = {
  name: string;
  desc?: string | null;

  columns?: MatriksColumnCreateDTO[];
  rows?: QuestionMatriksCreateDTO[];
};

/** UPDATE base + nested strategi (upsert & delete) */
export type MatriksBaseUpdateDTO = {
  name?: string;
  desc?: string | null;

  columns?: {
    upsert?: MatriksColumnUpsertDTO[];
    deleteIds?: string[];
  };
  rows?: {
    upsert?: QuestionMatriksUpsertDTO[];
    deleteIds?: string[];
  };
};

/* =========================================================
 * Helpers ringan (tanpa Zod)
 * ========================================================= */
function isNonEmptyArray<T>(x: T[] | undefined | null): x is T[] {
  return Array.isArray(x) && x.length > 0;
}

/* =========================================================
 * Mapper: DTO -> Prisma (CREATE)
 * ========================================================= */
export function toPrismaMatriksBaseCreate(
  dto: MatriksBaseCreateDTO
): Prisma.MatriksBaseQuestionUncheckedCreateInput & {
  columns?: Prisma.MatriksColumnUncheckedCreateNestedManyWithoutBaseInput;
  rows?: Prisma.MatriksQuestionUncheckedCreateNestedManyWithoutBaseInput;
} {
  const data: Prisma.MatriksBaseQuestionUncheckedCreateInput & {
    columns?: Prisma.MatriksColumnUncheckedCreateNestedManyWithoutBaseInput;
    rows?: Prisma.MatriksQuestionUncheckedCreateNestedManyWithoutBaseInput;
  } = {
    name: dto.name.trim(),
    desc: dto.desc ?? null,
  };

  // Penting: jangan kirim array kosong — Prisma akan menolak tipe nested dengan []
  if (isNonEmptyArray(dto.columns)) {
    data.columns = {
      create: dto.columns.map((c, i) => ({
        label: c.label.trim(),
        value: c.value.trim(),
        order: c.order ?? i + 1,
        active: c.active ?? true,
      })),
    };
  }

  if (isNonEmptyArray(dto.rows)) {
    data.rows = {
      create: dto.rows.map((r, i) => ({
        text: r.text.trim(),
        inputType: r.inputType,
        required: r.required ?? true,
        order: r.order ?? i + 1,
        helpText: r.helpText ?? null,
        placeholder: r.placeholder ?? null,
      })),
    };
  }

  return data;
}

/* =========================================================
 * Mapper: DTO -> Prisma (UPDATE)
 * ========================================================= */
export function toPrismaMatriksBaseUpdate(
  dto: MatriksBaseUpdateDTO
): Prisma.MatriksBaseQuestionUncheckedUpdateInput & {
  columns?: Prisma.MatriksColumnUncheckedUpdateManyWithoutBaseNestedInput;
  rows?: Prisma.MatriksQuestionUncheckedUpdateManyWithoutBaseNestedInput;
} {
  const data: Prisma.MatriksBaseQuestionUncheckedUpdateInput & {
    columns?: Prisma.MatriksColumnUncheckedUpdateManyWithoutBaseNestedInput;
    rows?: Prisma.MatriksQuestionUncheckedUpdateManyWithoutBaseNestedInput;
  } = {};

  if (dto.name !== undefined) data.name = dto.name.trim();
  if (dto.desc !== undefined) data.desc = dto.desc;

  // Nested: COLUMNS
  if (dto.columns) {
    const nestedCols: Prisma.MatriksColumnUncheckedUpdateManyWithoutBaseNestedInput =
      {};

    if (isNonEmptyArray(dto.columns.deleteIds)) {
      nestedCols.deleteMany = dto.columns.deleteIds.map((id) => ({ id }));
    }

    if (isNonEmptyArray(dto.columns.upsert)) {
      const toUpdate = dto.columns.upsert.filter((c) => !!c.id);
      const toCreate = dto.columns.upsert.filter((c) => !c.id);

      if (toUpdate.length > 0) {
        nestedCols.update = toUpdate.map((c) => ({
          where: { id: c.id! },
          data: {
            label: c.label.trim(),
            value: c.value.trim(),
            order: c.order ?? undefined,
            active: c.active ?? undefined,
          },
        }));
      }

      if (toCreate.length > 0) {
        nestedCols.create = toCreate.map((c, i) => ({
          label: c.label.trim(),
          value: c.value.trim(),
          order: c.order ?? i + 1,
          active: c.active ?? true,
        }));
      }
    }

    if (nestedCols.create || nestedCols.update || nestedCols.deleteMany) {
      data.columns = nestedCols;
    }
  }

  // Nested: ROWS (MatriksQuestion)
  if (dto.rows) {
    const nestedRows: Prisma.MatriksQuestionUncheckedUpdateManyWithoutBaseNestedInput =
      {};

    if (isNonEmptyArray(dto.rows.deleteIds)) {
      nestedRows.deleteMany = dto.rows.deleteIds.map((id) => ({ id }));
    }

    if (isNonEmptyArray(dto.rows.upsert)) {
      const toUpdate = dto.rows.upsert.filter((r) => !!r.id);
      const toCreate = dto.rows.upsert.filter((r) => !r.id);

      if (toUpdate.length > 0) {
        nestedRows.update = toUpdate.map((r) => ({
          where: { id: r.id! },
          data: {
            text: r.text.trim(),
            inputType: r.inputType,
            required: r.required ?? undefined,
            order: r.order ?? undefined,
            helpText: r.helpText ?? undefined,
            placeholder: r.placeholder ?? undefined,
          },
        }));
      }

      if (toCreate.length > 0) {
        nestedRows.create = toCreate.map((r, i) => ({
          text: r.text.trim(),
          inputType: r.inputType,
          required: r.required ?? true,
          order: r.order ?? i + 1,
          helpText: r.helpText ?? null,
          placeholder: r.placeholder ?? null,
        }));
      }
    }

    if (nestedRows.create || nestedRows.update || nestedRows.deleteMany) {
      data.rows = nestedRows;
    }
  }

  return data;
}
