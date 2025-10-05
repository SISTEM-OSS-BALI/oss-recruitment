// src/app/services/question-screening.provider.ts
import { db } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  QuestionScreeningCreateDTO,
  QuestionScreeningDataModel,
  QuestionScreeningUpdateDTO,
} from "../models/question-screening";

// ================== DTO yang simpel untuk client ==================

// ================== Helpers kecil (tanpa zod) ==================
function isNonEmptyArray<T>(x: T[] | undefined | null): x is T[] {
  return Array.isArray(x) && x.length > 0;
}

// Map CREATE: DTO -> Prisma input (hindari options: [])
function toPrismaCreate(
  dto: QuestionScreeningCreateDTO
): Prisma.QuestionScreeningUncheckedCreateInput & {
  options?: Prisma.QuestionOptionUncheckedCreateNestedManyWithoutQuestionInput;
} {
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

// Map UPDATE: DTO -> Prisma input (nested update/create/deleteMany)
function toPrismaUpdate(
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

// ================== Provider functions ==================

export async function GET_QUESTIONS_SCREENING(base_id: string) {
  return db.questionScreening.findMany({
    where: { baseId: base_id },
    include: { options: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
}

// SINGLE create — aman untuk TEXT/CHOICE (tanpa options: [])
export async function CREATE_QUESTION_SCREENING(
  dto: QuestionScreeningCreateDTO
) {
  const data = toPrismaCreate(dto);
  return db.questionScreening.create({ data });
}

// BULK create — bikin banyak sekaligus dengan Promise.allSettled
export async function CREATE_QUESTION_SCREENING_BULK(
  baseId: string,
  items: Omit<QuestionScreeningCreateDTO, "baseId">[]
) {
  const results = await Promise.allSettled(
    items.map((it, idx) =>
      db.questionScreening.create({
        data: toPrismaCreate({ ...it, baseId, order: it.order ?? idx + 1 }),
      })
    )
  );

  // optional: pisahkan sukses/gagal untuk feedback ke UI
  const created = results
    .filter(
      (r): r is PromiseFulfilledResult<QuestionScreeningDataModel> =>
        r.status === "fulfilled"
    )
    .map((r) => r.value);
  const errors = results
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map((r) => r.reason);

  return { created, errors };
}

// UPDATE satu pertanyaan + nested options
export async function UPDATE_QUESTION_SCREENING(
  id: string,
  dto: QuestionScreeningUpdateDTO
) {
  const data = toPrismaUpdate(dto);
  return db.questionScreening.update({
    where: { id },
    data,
    include: { options: true },
  });
}

// DELETE — akan ikut menghapus opsi jika foreign key di Prisma diset onDelete: Cascade
export async function DELETE_QUESTION_SCREENING(id: string) {
  return db.questionScreening.delete({ where: { id } });
}
