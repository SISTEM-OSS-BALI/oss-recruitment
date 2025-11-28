/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Prisma } from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export type ProfileCompanyDataModel = Prisma.ProfileCompanyGetPayload<{}>;

export interface ProfileCompanyPayloadCreateModel
  extends Prisma.ProfileCompanyUncheckedCreateInput {}

export interface ProfileCompanyPayloadUpdateModel
  extends Omit<Prisma.ProfileCompanyUncheckedUpdateInput, GeneralOmitModel> {}

export interface ProfileCompanyFormModel
  extends Omit<ProfileCompanyDataModel, GeneralOmitModel> {}
