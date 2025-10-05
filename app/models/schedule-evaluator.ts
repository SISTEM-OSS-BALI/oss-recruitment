/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Prisma } from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export type ScheduleEvaluatorDataModel = Prisma.ScheduleEvaluatorGetPayload<{
  include: {
    evaluator: true;
    days: {
      include: { times: true };
    };
  };
}>;

export interface ScheduleEvaluatorPayloadCreateModel
  extends Prisma.ScheduleEvaluatorUncheckedCreateInput {}

export interface ScheduleEvaluatorPayloadUpdateModel
  extends Omit<
    Prisma.ScheduleEvaluatorUncheckedUpdateInput,
    GeneralOmitModel
  > {}

export interface ScheduleEvaluatorFormModel
  extends Omit<ScheduleEvaluatorDataModel, GeneralOmitModel> {}
