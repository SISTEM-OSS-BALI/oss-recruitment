/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Prisma } from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export type OfferingContractDataModel = Prisma.OfferingContractGetPayload<{
  include: {
    applicant: {
      include: {
        user: true;
        job: true
      };
    };
  };
}>;

export interface OfferingContractPayloadCreateModel
  extends Prisma.OfferingContractUncheckedCreateInput {}

export interface OfferingContractPayloadUpdateModel
  extends Omit<Prisma.OfferingContractUncheckedUpdateInput, GeneralOmitModel> {}

export interface OfferingContractFormModel
  extends Omit<OfferingContractDataModel, GeneralOmitModel> {}
