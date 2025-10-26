/* eslint-disable @typescript-eslint/no-empty-object-type */

import { OfferingContract, Prisma} from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export interface OfferingContractDataModel extends OfferingContract {
}

export interface OfferingContractPayloadCreateModel
  extends Prisma.OfferingContractUncheckedCreateInput {}

export interface OfferingContractPayloadUpdateModel
  extends Omit<Prisma.OfferingContractUncheckedUpdateInput, GeneralOmitModel> {}

export interface OfferingContractFormModel extends Omit<OfferingContractDataModel, GeneralOmitModel> {}
