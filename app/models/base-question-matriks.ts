/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Prisma } from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export type MatriksBaseQuestionDataModel =
  Prisma.MatriksBaseQuestionGetPayload<{
    include: {
      columns: true;
      rows: true;
    };
  }>;

export interface MatriksBaseQuestionPayloadCreateModel
  extends Prisma.MatriksBaseQuestionUncheckedCreateInput {}

export interface MatriksBaseQuestionPayloadUpdateModel
  extends Omit<
    Prisma.MatriksBaseQuestionUncheckedUpdateInput,
    GeneralOmitModel
  > {}

export interface MatriksBaseQuestionFormModel
  extends Omit<MatriksBaseQuestionDataModel, GeneralOmitModel> {}
