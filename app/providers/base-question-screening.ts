import db from "@/lib/prisma";
import {
  QuestionBaseScreeningPayloadCreateModel,
  QuestionBaseScreeningPayloadUpdateModel,
} from "../models/base-question-screening";

export const GET_BASE_QUESTIONS_SCREENING = async () => {
  const result = await db.questionBaseScreening.findMany({
    include: {
      questions: {
        include: {
          options: true,
        },
      },
    },
  });
  return result;
};

export const GET_BASE_QUESTION_SCREENING = async (id: string) => {
  const result = await db.questionBaseScreening.findUnique({
    where: {
      id,
    },
  });
  return result;
};

export const CREATE_QUESTION_BASE_SCREENING = async (
  payload: QuestionBaseScreeningPayloadCreateModel
) => {
  const result = await db.questionBaseScreening.create({
    data: payload,
  });

  return result;
};

export const UPDATE_QUESTION_BASE_SCREENING = async (
  id: string,
  payload: QuestionBaseScreeningPayloadUpdateModel
) => {
  const result = await db.questionBaseScreening.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

export const DELETE_QUESTION_BASE_SCREENING = async (id: string) => {
  const result = await db.questionBaseScreening.delete({
    where: {
      id,
    },
  });
  return result;
};
