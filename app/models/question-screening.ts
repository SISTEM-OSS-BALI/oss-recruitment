/* eslint-disable @typescript-eslint/no-empty-object-type */
import { PrismaClient } from "@prisma/client";
import type { Prisma, QuestionScreeningType } from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

/* =========================
 * READ MODELS (DataModel)
 * ========================= */
export type QuestionScreeningDataModel = Prisma.QuestionScreeningGetPayload<{
  include: { options: true };
}>;

export interface QuestionScreeningFormModel
  extends Omit<QuestionScreeningDataModel, GeneralOmitModel> {}

/* =========================
 * OPTION DTOs (client side)
 * ========================= */
export type QuestionOptionCreateDTO = {
  label: string;
  value: string;
  order?: number | null;
  active?: boolean | null;
};

export type QuestionOptionUpsertDTO = {
  /** kalau ada id → update; kalau tidak ada → create */
  id?: string;
  label: string;
  value: string;
  order?: number | null;
  active?: boolean | null;
};

/* =========================
 * QUESTION DTOs (client side)
 * ========================= */
export type QuestionScreeningCreateDTO = {
  baseId: string; // wajib pada create
  text: string;
  inputType: QuestionScreeningType; // "TEXT" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE"
  required?: boolean;
  order?: number;
  helpText?: string | null;
  placeholder?: string | null;
  minLength?: number | null;
  maxLength?: number | null;
  options?: QuestionOptionCreateDTO[]; // kosong = undefined (jangan kirim [])
};

export type QuestionScreeningUpdateDTO = {
  text?: string;
  inputType?: QuestionScreeningType;
  required?: boolean;
  order?: number;
  helpText?: string | null;
  placeholder?: string | null;
  minLength?: number | null;
  maxLength?: number | null;

  /** Strategi update relasi */
  options?: {
    upsert?: QuestionOptionUpsertDTO[]; // campur create (tanpa id) & update (dengan id)
    deleteIds?: string[]; // id yang dihapus
  };
};

/* =========================
 * Helper: runtime guards ringan
 * (tanpa zod)
 * ========================= */
function isNonEmptyArray<T>(x: T[] | undefined | null): x is T[] {
  return Array.isArray(x) && x.length > 0;
}

function assertCreateDTO(dto: QuestionScreeningCreateDTO) {
  if (!dto?.baseId) throw new Error("baseId is required.");
  if (!dto?.text || dto.text.trim().length < 3)
    throw new Error("text is required (min 3 chars).");
  if (!dto?.inputType) throw new Error("inputType is required.");
  if (
    (dto.inputType === "SINGLE_CHOICE" ||
      dto.inputType === "MULTIPLE_CHOICE") &&
    !isNonEmptyArray(dto.options)
  ) {
    throw new Error("Choice type requires at least one option.");
  }
}

/* =========================================================
 * Mapper: DTO -> Prisma (CREATE)
 * ========================================================= */
export function toPrismaCreate(
  dto: QuestionScreeningCreateDTO
): Prisma.QuestionScreeningUncheckedCreateInput & {
  options?: Prisma.QuestionOptionUncheckedCreateNestedManyWithoutQuestionInput;
} {
  assertCreateDTO(dto);

  const {
    baseId,
    text,
    inputType,
    required,
    order,
    helpText,
    placeholder,
    minLength,
    maxLength,
    options,
  } = dto;

  const data: Prisma.QuestionScreeningUncheckedCreateInput & {
    options?: Prisma.QuestionOptionUncheckedCreateNestedManyWithoutQuestionInput;
  } = {
    baseId,
    text: text.trim(),
    inputType,
    required: required ?? true,
    order: order ?? 0,
    helpText: helpText ?? null,
    placeholder: placeholder ?? null,
    minLength: minLength ?? null,
    maxLength: maxLength ?? null,
  };

  // Penting: JANGAN kirim options: [] ke Prisma
  if (isNonEmptyArray(options)) {
    data.options = {
      create: options.map((o, i) => ({
        label: o.label.trim(),
        value: o.value.trim(),
        order: o.order ?? i + 1,
        active: o.active ?? true,
      })),
    };
  }

  return data;
}

/* =========================================================
 * Mapper: DTO -> Prisma (UPDATE)
 * ========================================================= */
export function toPrismaUpdate(
  dto: QuestionScreeningUpdateDTO
): Prisma.QuestionScreeningUncheckedUpdateInput & {
  options?: Prisma.QuestionOptionUncheckedUpdateManyWithoutQuestionNestedInput;
} {
  const data: Prisma.QuestionScreeningUncheckedUpdateInput & {
    options?: Prisma.QuestionOptionUncheckedUpdateManyWithoutQuestionNestedInput;
  } = {};

  if (dto.text !== undefined) data.text = dto.text.trim();
  if (dto.inputType !== undefined) data.inputType = dto.inputType;
  if (dto.required !== undefined) data.required = dto.required;
  if (dto.order !== undefined) data.order = dto.order;
  if (dto.helpText !== undefined) data.helpText = dto.helpText;
  if (dto.placeholder !== undefined) data.placeholder = dto.placeholder;
  if (dto.minLength !== undefined) data.minLength = dto.minLength;
  if (dto.maxLength !== undefined) data.maxLength = dto.maxLength;

  const rel = dto.options;
  if (rel) {
    const nested: Prisma.QuestionOptionUncheckedUpdateManyWithoutQuestionNestedInput =
      {};

    if (isNonEmptyArray(rel.deleteIds)) {
      nested.deleteMany = rel.deleteIds.map((id) => ({ id }));
    }

    if (isNonEmptyArray(rel.upsert)) {
      const toUpdate = rel.upsert.filter((o) => !!o.id);
      const toCreate = rel.upsert.filter((o) => !o.id);

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
      data.options = nested;
    }
  }

  return data;
}

/* =========================================================
 * Contoh pemakaian di service (tanpa Zod)
 * ========================================================= */
export async function createQuestionService(
  db: PrismaClient,
  dto: QuestionScreeningCreateDTO
) {
  const data = toPrismaCreate(dto);
  return db.questionScreening.create({ data });
}

export async function updateQuestionService(
  db: PrismaClient,
  id: string,
  dto: QuestionScreeningUpdateDTO
) {
  const data = toPrismaUpdate(dto);
  return db.questionScreening.update({ where: { id }, data });
}
