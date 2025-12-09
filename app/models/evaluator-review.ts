/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Prisma } from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export type EvaluatorReviewAnswerPayload = {
  questionId: string;
  value: unknown;
};

export type EvaluatorReviewDataModel =
  Prisma.EvaluatorReviewGetPayload<{
    include: {
        assignment: true;
        question: true;
    }
  }>;

export interface EvaluatorReviewPayloadCreateModel {
  id: string;
  answers: EvaluatorReviewAnswerPayload[];
}

export interface EvaluatorReviewPayloadUpdateModel
  extends Omit<
    Prisma.EvaluatorReviewUncheckedUpdateInput,
    GeneralOmitModel
  > {}

export interface EvaluatorReviewFormModel
  extends Omit<EvaluatorReviewDataModel, GeneralOmitModel> {}
