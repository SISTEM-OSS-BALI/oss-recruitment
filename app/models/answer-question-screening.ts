/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Prisma } from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export type AnswerQuestionScreeningDataModel =
  Prisma.AnswerQuestionScreeningGetPayload<{
    include: {
      question: {
        include: {
          options: true;
          base: true;
        };
      };
      selectedOptions: true;
    };
  }>;

export interface AnswerQuestionScreeningAnswerPayload {
  questionId: string;
  answerText?: string | null;
  optionIds?: string[];
}

export interface AnswerQuestionScreeningPayloadCreateModel {
  job_id: string;
  user_id: string;
  base_id: string;
  answers: AnswerQuestionScreeningAnswerPayload[];
}

export interface AnswerQuestionScreeningPayloadUpdateModel
  extends Omit<
    Prisma.AnswerQuestionScreeningUncheckedUpdateInput,
    GeneralOmitModel
  > {}

export interface AnswerQuestionScreeningFormModel
  extends Omit<AnswerQuestionScreeningDataModel, GeneralOmitModel> {}
