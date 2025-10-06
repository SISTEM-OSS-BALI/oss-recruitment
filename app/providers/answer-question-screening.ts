import db from "@/lib/prisma";
import { AnswerQuestionScreeningPayloadCreateModel } from "../models/answer-question-screening";

export const CREATE_ANSWER_SCREENING_QUESTION = async (
  payload: AnswerQuestionScreeningPayloadCreateModel
) => {
  const result = await db.answerQuestionScreening.create({
    data: payload,
  });

  return result;
};
