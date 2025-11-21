/* eslint-disable @typescript-eslint/no-empty-object-type */

import type { Prisma } from "@prisma/client";
import type { GeneralOmitModel } from "./general-omit";

export type EmployeeSetupDataModel = Prisma.EmployeeSetupGetPayload<{
  include: {
    employeeSetupQuestion: true;
  };
}>;

export interface EmployeeSetupPayloadCreateModel
  extends Prisma.EmployeeSetupUncheckedCreateInput {}

export interface EmployeeSetupPayloadUpdateModel
  extends Omit<Prisma.EmployeeSetupUncheckedUpdateInput, GeneralOmitModel> {}

export interface EmployeeSetupFormModel
  extends Omit<EmployeeSetupDataModel, GeneralOmitModel> {}
