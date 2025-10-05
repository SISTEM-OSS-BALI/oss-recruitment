/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Prisma, MbtiTest } from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export interface MbtiTestDataModel extends MbtiTest {}

export interface MbtiTestPayloadCreateModel
  extends Prisma.MbtiTestUncheckedCreateInput {}

export interface MbtiTestPayloadUpdateModel
  extends Omit<Prisma.MbtiTestUncheckedUpdateInput, GeneralOmitModel> {}

export interface MbtiTestFormModel extends Omit<MbtiTestDataModel, GeneralOmitModel> {}
