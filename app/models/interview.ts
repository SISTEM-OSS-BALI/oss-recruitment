/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Location, Prisma, ScheduleInterview } from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export interface ScheduleInterviewDataModel extends ScheduleInterview {
  location: Location;
}

export interface ScheduleInterviewPayloadCreateModel
  extends Prisma.ScheduleInterviewUncheckedCreateInput {}

export interface ScheduleInterviewPayloadUpdateModel
  extends Omit<
    Prisma.ScheduleInterviewUncheckedUpdateInput,
    GeneralOmitModel
  > {}

export interface ScheduleInterviewFormModel
  extends Omit<ScheduleInterviewDataModel, GeneralOmitModel> {}
