/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Prisma, Job, Applicant, User } from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export interface ApplicantDataModel extends Applicant {
  job: Job;
  applicant: User;
}

export interface ApplicantPayloadCreateModel
  extends Prisma.ApplicantUncheckedCreateInput {}

export interface ApplicantPayloadUpdateModel
  extends Omit<Prisma.ApplicantUncheckedUpdateInput, GeneralOmitModel> {}

export interface ApplicantFormModel
  extends Omit<ApplicantDataModel, GeneralOmitModel> {}
