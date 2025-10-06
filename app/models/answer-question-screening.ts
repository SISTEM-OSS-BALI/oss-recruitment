/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Prisma } from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export type AnswerQuestionScreeningDataModel =
  Prisma.AnswerQuestionScreeningGetPayload<{
    include: {
      question: {
        include: {
          options: true;
        };
      };
    };
  }>;

export interface AnswerQuestionScreeningPayloadCreateModel
  extends Prisma.AnswerQuestionScreeningUncheckedCreateInput {}

export interface AnswerQuestionScreeningPayloadUpdateModel
  extends Omit<
    Prisma.AnswerQuestionScreeningUncheckedUpdateInput,
    GeneralOmitModel
  > {}

export interface AnswerQuestionScreeningFormModel
  extends Omit<AnswerQuestionScreeningDataModel, GeneralOmitModel> {}
