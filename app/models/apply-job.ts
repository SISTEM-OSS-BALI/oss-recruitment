/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Prisma, Candidate, Job } from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export interface CandidateDataModel extends Candidate {
  job: Job;
}

export interface CandidatePayloadCreateModel
  extends Prisma.CandidateUncheckedCreateInput {}

export interface CandidatePayloadUpdateModel
  extends Omit<Prisma.CandidateUncheckedUpdateInput, GeneralOmitModel> {}

export interface CandidateFormModel
  extends Omit<CandidateDataModel, GeneralOmitModel> {}
