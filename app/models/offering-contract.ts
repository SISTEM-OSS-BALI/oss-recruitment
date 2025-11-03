/* eslint-disable @typescript-eslint/no-empty-object-type */

import type { Prisma } from "@prisma/client";
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

export type OfferDecisionValue = "PENDING" | "ACCEPTED" | "DECLINED";

export type OfferingContractDecisionPayload = {
  decision: OfferDecisionValue;
  signatureUrl?: string | null;
  signaturePath?: string | null;
  rejectionReason?: string | null;
};

export type DirectorSignatureRequestPayload = {
  contractId: string;
  email?: string;
};

export type DirectorSignatureUploadPayload = {
  contractId: string;
  signatureUrl: string | null;
  signaturePath: string | null;
};
