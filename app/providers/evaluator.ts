import db from "@/lib/prisma";
import { EvaluatorPayloadCreateModel } from "../models/evaluator";

export const GET_EVALUATORS = async () => {
  const result = await db.evaluator.findMany();
  return result;
};

export const CREATE_EVALUATOR = async (
  payload: EvaluatorPayloadCreateModel
) => {
  const result = await db.evaluator.create({
    data: payload,
  });
  return result;
};

export const UPDATE_EVALUATOR = async (
  id: string,
  payload: EvaluatorPayloadCreateModel
) => {
  const result = await db.evaluator.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

export const DELETE_EVALUATOR = async (id: string) => {
  const result = await db.evaluator.delete({
    where: {
      id,
    },
  });
  return result;
};

