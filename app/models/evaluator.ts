/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Prisma, Evaluator } from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export interface EvaluatorDataModel extends Evaluator {}

export interface EvaluatorPayloadCreateModel
  extends Prisma.EvaluatorUncheckedCreateInput {}

export interface EvaluatorPayloadUpdateModel
  extends Omit<Prisma.EvaluatorUncheckedUpdateInput, GeneralOmitModel> {}

export interface EvaluatorFormModel
  extends Omit<EvaluatorDataModel, GeneralOmitModel> {}
