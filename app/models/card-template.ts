/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Prisma, CardTemplate } from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export interface CardTemplateDataModel extends CardTemplate {}

export interface CardTemplatePayloadCreateModel
  extends Prisma.CardTemplateUncheckedCreateInput {}

export interface CardTemplatePayloadUpdateModel
  extends Omit<Prisma.CardTemplateUncheckedUpdateInput, GeneralOmitModel> {}

export interface CardTemplateFormModel
  extends Omit<CardTemplateDataModel, GeneralOmitModel> {}
