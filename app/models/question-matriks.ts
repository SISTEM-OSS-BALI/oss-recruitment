// src/app/models/matriks.ts
/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { Prisma, QuestionMatriksType } from "@prisma/client";

/* =========================================================
 * READ MODELS (DataModel) – langsung match schema Prisma
 * ========================================================= */
export type MatriksBaseQuestionDataModel =
  Prisma.MatriksBaseQuestionGetPayload<{
    include: {
      columns: true;
      rows: true;
      options: true;
    };
  }>;

export type MatriksColumnDataModel = Prisma.MatriksColumnGetPayload<{}>;
export type MatriksQuestionDataModel = Prisma.MatriksQuestionGetPayload<{}>;

/* =========================================================
 * DTOs: payload dari client (tanpa Zod)
 * ========================================================= */
// Kolom (header) matriks
export type MatriksColumnCreateDTO = {
  label: string;
  value: string; // unik per baseId
  order?: number | null;
  active?: boolean | null;
};

export type MatriksColumnUpsertDTO = {
  id?: string; // ada → update, tidak ada → create
  label: string;
  value: string;
  order?: number | null;
  active?: boolean | null;
};

// Baris/pertanyaan matriks (tipe input SINGLE_CHOICE)
export type MatriksQuestionCreateDTO = {
  text: string;
  inputType: QuestionMatriksType; // sebaiknya SINGLE_CHOICE
  required?: boolean;
  order?: number;
  helpText?: string | null;
  placeholder?: string | null;
  options?: MatriksColumnCreateDTO[]; // optional helper untuk UI; kosong = undefined
};

export type MatriksQuestionUpdateDTO = {
  text?: string;
  inputType?: QuestionMatriksType;
  required?: boolean;
  order?: number;
  helpText?: string | null;
  placeholder?: string | null;
};

// ===== Optional: mapper kecil untuk single-row update =====
export function toPrismaMatriksQuestionUpdate(
  dto: MatriksQuestionUpdateDTO
): Prisma.MatriksQuestionUncheckedUpdateInput {
  const data: Prisma.MatriksQuestionUncheckedUpdateInput = {};
  if (dto.text !== undefined) data.text = dto.text.trim();
  if (dto.inputType !== undefined) data.inputType = dto.inputType;
  if (dto.required !== undefined) data.required = dto.required;
  if (dto.order !== undefined) data.order = dto.order;
  if (dto.helpText !== undefined) data.helpText = dto.helpText;
  if (dto.placeholder !== undefined) data.placeholder = dto.placeholder;
  return data;
}

export type MatriksQuestionUpsertDTO = {
  id?: string; // ada → update, tidak ada → create
  text: string;
  inputType: QuestionMatriksType;
  required?: boolean;
  order?: number;
  helpText?: string | null;
  placeholder?: string | null;
  options?: {
    upsert?: MatriksColumnUpsertDTO[];
    deleteIds?: string[];
  };
};

// CREATE base + (opsional) nested columns/rows
export type MatriksBaseCreateDTO = {
  name: string;
  desc?: string | null;
  columns?: MatriksColumnCreateDTO[];
  rows?: MatriksQuestionCreateDTO[];
};

// UPDATE base + strategi nested (upsert & delete)
export type MatriksBaseUpdateDTO = {
  name?: string;
  desc?: string | null;
  columns?: {
    upsert?: MatriksColumnUpsertDTO[];
    deleteIds?: string[];
  };
  rows?: {
    upsert?: MatriksQuestionUpsertDTO[];
    deleteIds?: string[];
  };
};

/* =========================================================
 * Helpers ringan
 * ========================================================= */
function isNonEmptyArray<T>(x: T[] | undefined | null): x is T[] {
  return Array.isArray(x) && x.length > 0;
}

/* =========================================================
 * Mapper: DTO -> Prisma (CREATE Base)
 * =========================================================
 * Catatan tipe nested:
 *  - columns: Prisma.MatriksColumnUncheckedCreateNestedManyWithoutBaseInput
 *  - rows   : Prisma.MatriksQuestionUncheckedCreateNestedManyWithoutBaseInput
 */
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

  // penting: jangan kirim array kosong
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
 * Mapper: DTO -> Prisma (UPDATE Base)
 * =========================================================
 * Catatan tipe nested:
 *  - columns: Prisma.MatriksColumnUncheckedUpdateManyWithoutBaseNestedInput
 *  - rows   : Prisma.MatriksQuestionUncheckedUpdateManyWithoutBaseNestedInput
 */
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
