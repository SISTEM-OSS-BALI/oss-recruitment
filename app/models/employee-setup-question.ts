/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { Prisma } from "@prisma/client";
import type { GeneralOmitModel } from "./general-omit";

export interface EmployeeSetupQuestionPayloadCreateModel
  extends Prisma.EmployeeSetupQuestionUncheckedCreateInput {}

export interface EmployeeSetupPayloadQuestionUpdateModel
  extends Omit<Prisma.EmployeeSetupQuestionUncheckedUpdateInput, GeneralOmitModel> {}
