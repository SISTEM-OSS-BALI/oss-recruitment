/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Prisma, HistoryCandidate } from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export interface HistoryCandidateDataModel extends HistoryCandidate {}

export interface HistoryCandidatePayloadCreateModel
  extends Prisma.HistoryCandidateUncheckedCreateInput {}

export interface HistoryCandidatePayloadUpdateModel
  extends Omit<Prisma.HistoryCandidateUncheckedUpdateInput, GeneralOmitModel> {}

export interface HistoryCandidateFormModel
  extends Omit<HistoryCandidateDataModel, GeneralOmitModel> {}
