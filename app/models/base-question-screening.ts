/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Prisma } from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export type QuestionBaseScreeningDataModel =
  Prisma.QuestionBaseScreeningGetPayload<{}>;

export interface QuestionBaseScreeningPayloadCreateModel
  extends Prisma.QuestionBaseScreeningUncheckedCreateInput {}

export interface QuestionBaseScreeningPayloadUpdateModel
  extends Omit<
    Prisma.QuestionBaseScreeningUncheckedUpdateInput,
    GeneralOmitModel
  > {}

export interface QuestionBaseScreeningFormModel
  extends Omit<QuestionBaseScreeningDataModel, GeneralOmitModel> {}
