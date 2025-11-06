/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Prisma, Consultant } from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export interface ConsultantDataModel extends Consultant {
}

export interface ConsultantPayloadCreateModel
  extends Prisma.ConsultantUncheckedCreateInput {}

export interface ConsultantPayloadUpdateModel
  extends Omit<Prisma.ConsultantUncheckedUpdateInput, GeneralOmitModel> {}

export interface ConsultantFormModel extends Omit<ConsultantDataModel, GeneralOmitModel> {}
