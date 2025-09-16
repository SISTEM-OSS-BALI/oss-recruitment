import db from "@/lib/prisma";
import { EvaluatorAssignmentPayloadCreateModel } from "../models/evaluator-assignment";

export const CREATE_EVALUATOR_ASSIGNMENT = async (
  payload: EvaluatorAssignmentPayloadCreateModel
) => {
  const { candidate_id, evaluatorIds } = payload;

  if (
    !candidate_id ||
    !Array.isArray(evaluatorIds) ||
    evaluatorIds.length === 0
  ) {
    throw new Error("candidate_id dan evaluatorIds wajib diisi");
  }

  // Buat satu record EvaluatorAssignment untuk setiap evaluatorId
  const created = await db.$transaction(
    evaluatorIds.map((evaluatorId) =>
      db.evaluatorAssignment.create({
        data: {
          candidate_id, // pakai scalar FK karena ada fieldnya
          evaluatorId,
        },
        include: {
          candidate: true,
          evaluator: true,
        },
      })
    )
  );

  return created; // array of EvaluatorAssignment
};

export const UPDATE_EVALUATOR_ASSIGNMENT = async (
  id: string,
  payload: EvaluatorAssignmentPayloadCreateModel
) => {
  const result = await db.evaluatorAssignment.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

export const GET_EVALUATOR_ASSIGNMENTS = async () => {
  const result = await db.evaluatorAssignment.findMany();
  return result;
};

export const GET_EVALUATOR_ASSIGNMENT = async (id: string) => {
  const result = await db.evaluatorAssignment.findUnique({
    where: {
      id,
    },
  });
  return result;
};

export const DELETE_EVALUATOR_ASSIGNMENT = async (id: string) => {
  const result = await db.evaluatorAssignment.delete({
    where: {
      id,
    },
  });
  return result;
};
