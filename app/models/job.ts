/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Prisma, Job, Location } from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export interface JobDataModel extends Job {
  location: Location;
}

export interface JobPayloadCreateModel
  extends Prisma.JobUncheckedCreateInput {}

export interface JobPayloadUpdateModel
  extends Omit<Prisma.JobUncheckedUpdateInput, GeneralOmitModel> {}

export interface JobFormModel extends Omit<JobDataModel, GeneralOmitModel> {}
