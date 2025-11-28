/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Prisma, ScheduleHired, Applicant, Location } from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export interface ScheduleHiredDataModel extends ScheduleHired {
  applicant: Applicant;
  location: Location;
}

export interface ScheduleHiredPayloadCreateModel
  extends Prisma.ScheduleHiredUncheckedCreateInput {}

export interface ScheduleHiredPayloadUpdateModel
  extends Omit<Prisma.ScheduleHiredUncheckedUpdateInput, GeneralOmitModel> {}

export interface ScheduleHiredFormModel
  extends Omit<ScheduleHiredDataModel, GeneralOmitModel> {}
