import db from "@/lib/prisma";
import { MatriksBaseQuestionPayloadCreateModel, MatriksBaseQuestionPayloadUpdateModel } from "../models/base-question-matriks";


export const GET_BASE_QUESTIONS_MATRIKS = async () => {
  const result = await db.matriksBaseQuestion.findMany({
    include: {
      columns: true,
      rows: true,
    },
  });
  return result;
};

export const GET_BASE_QUESTION_MATRIK = async (id: string) => {
  const result = await db.matriksBaseQuestion.findUnique({
    where: {
      id,
    },
  });
  return result;
};

export const CREATE_QUESTION_BASE_MATRIK = async (
  payload: MatriksBaseQuestionPayloadCreateModel
) => {
  const result = await db.matriksBaseQuestion.create({
    data: payload,
  });

  return result;
};

export const UPDATE_QUESTION_BASE_MATRIK = async (
  id: string,
  payload: MatriksBaseQuestionPayloadUpdateModel
) => {
  const result = await db.matriksBaseQuestion.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

export const DELETE_QUESTION_BASE_MATRIKS= async (id: string) => {
  const result = await db.matriksBaseQuestion.delete({
    where: {
      id,
    },
  });
  return result;
};
