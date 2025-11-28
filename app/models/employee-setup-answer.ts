/* eslint-disable @typescript-eslint/no-empty-object-type */

import type { Prisma } from "@prisma/client";
import type { GeneralOmitModel } from "./general-omit";

export type EmployeeSetupAnswerDataModel =
  Prisma.EmployeeSetupAnswerGetPayload<{
    include: {
      employeeSetupQuestion: true;
    };
  }>;

export interface EmployeeSetupAnswerPayloadCreateModel
  extends Prisma.EmployeeSetupAnswerUncheckedCreateInput {}

export interface EmployeeSetupAnswerPayloadUpdateModel
  extends Omit<Prisma.EmployeeSetupAnswerUncheckedUpdateInput, GeneralOmitModel> {}

export interface EmployeeSetupAnswerUpdateRequest {
  applicantId: string;
  employeeSetupQuestionId: string;
  is_done?: boolean;
  value_text?: string | null;
  value_link?: string | null;
  value_file_url?: string | null;
  notes?: string | null;
  implementation_date?: Date | null;
}
