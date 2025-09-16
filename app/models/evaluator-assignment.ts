/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Prisma, EvaluatorAssignment } from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export interface EvaluatorAssignmentDataModel extends EvaluatorAssignment {}

export interface EvaluatorAssignmentPayloadCreateModel
  extends Prisma.EvaluatorAssignmentUncheckedCreateInput {}

export interface EvaluatorAssignmentPayloadUpdateModel
  extends Omit<
    Prisma.EvaluatorAssignmentUncheckedUpdateInput,
    GeneralOmitModel
  > {}

export interface EvaluatorAssignmentFormModel
  extends Omit<EvaluatorAssignmentDataModel, GeneralOmitModel> {}
