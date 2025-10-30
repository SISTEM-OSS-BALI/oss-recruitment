import type { Prisma } from "@prisma/client";
import db from "@/lib/prisma";
import {
  QuestionBaseScreeningPayloadCreateModel,
  QuestionBaseScreeningPayloadUpdateModel,
} from "../models/base-question-screening";

const baseInclude = {
  questions: {
    include: {
      options: true,
    },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  },
} satisfies Prisma.QuestionBaseScreeningInclude;

function normalizeNullableString(value?: string | null) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toPrismaCreate(
  payload: QuestionBaseScreeningPayloadCreateModel
): Prisma.QuestionBaseScreeningUncheckedCreateInput {
  const name = payload.name?.trim();
  if (!name) {
    throw new Error("Name is required");
  }

  return {
    name,
    desc: normalizeNullableString(payload.desc) ?? null,
    allowMultipleSubmissions:
      payload.allowMultipleSubmissions ?? false,
    active: payload.active ?? true,
    version: payload.version ?? 1,
  };
}

function toPrismaUpdate(
  payload: QuestionBaseScreeningPayloadUpdateModel
): Prisma.QuestionBaseScreeningUncheckedUpdateInput {
  const data: Prisma.QuestionBaseScreeningUncheckedUpdateInput = {};

  if (payload.name !== undefined) {
    const name = payload.name?.trim?.();
    if (!name) {
      throw new Error("Name cannot be empty");
    }
    data.name = name;
  }

  if (payload.desc !== undefined) {
    data.desc = normalizeNullableString(payload.desc) ?? null;
  }

  if (payload.allowMultipleSubmissions !== undefined) {
    data.allowMultipleSubmissions = payload.allowMultipleSubmissions;
  }

  if (payload.active !== undefined) {
    data.active = payload.active;
  }

  if (payload.version !== undefined) {
    data.version = payload.version;
  }

  return data;
}

export const GET_BASE_QUESTIONS_SCREENING = async () => {
  return db.questionBaseScreening.findMany({
    include: baseInclude,
    orderBy: [{ createdAt: "desc" }],
  });
};

export const GET_BASE_QUESTION_SCREENING = async (id: string) => {
  return db.questionBaseScreening.findUnique({
    where: { id },
    include: baseInclude,
  });
};

export const CREATE_QUESTION_BASE_SCREENING = async (
  payload: QuestionBaseScreeningPayloadCreateModel
) => {
  const data = toPrismaCreate(payload);

  return db.questionBaseScreening.create({
    data,
    include: baseInclude,
  });
};

export const UPDATE_QUESTION_BASE_SCREENING = async (
  id: string,
  payload: QuestionBaseScreeningPayloadUpdateModel
) => {
  const data = toPrismaUpdate(payload);

  return db.questionBaseScreening.update({
    where: { id },
    data,
    include: baseInclude,
  });
};

export const DELETE_QUESTION_BASE_SCREENING = async (id: string) => {
  return db.questionBaseScreening.delete({
    where: { id },
  });
};
