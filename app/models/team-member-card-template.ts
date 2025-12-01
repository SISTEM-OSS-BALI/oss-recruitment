/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Prisma, TeamMemberCardTemplate } from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export interface TeamMemberCardTemplateDataModel extends TeamMemberCardTemplate {}

export interface TeamMemberCardTemplatePayloadCreateModel
  extends Prisma.TeamMemberCardTemplateUncheckedCreateInput {}

export interface TeamMemberCardTemplatePayloadUpdateModel
  extends Omit<Prisma.TeamMemberCardTemplateUncheckedUpdateInput, GeneralOmitModel> {}

export interface TeamMemberCardTemplateFormModel
  extends Omit<TeamMemberCardTemplateDataModel, GeneralOmitModel> {}
