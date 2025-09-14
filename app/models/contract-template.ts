/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Prisma, ContractTemplate } from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export interface ContractTemplateDataModel extends ContractTemplate {}

export interface ContractTemplatePayloadCreateModel
  extends Prisma.ContractTemplateUncheckedCreateInput {}

export interface ContractTemplatePayloadUpdateModel
  extends Omit<Prisma.ContractTemplateUncheckedUpdateInput, GeneralOmitModel> {}

export interface ContractTemplateFormModel
  extends Omit<ContractTemplateDataModel, GeneralOmitModel> {}
