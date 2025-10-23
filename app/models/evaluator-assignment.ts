/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Prisma } from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export type EvaluatorAssignmentDataModel =
  Prisma.EvaluatorAssignmentGetPayload<{
    include: {
      baseMatriks: {
        include: {
          columns: true;
          rows: {
            include: {
              matriksQuestionOption: {
                orderBy: [{ order: "asc" }, { createdAt: "asc" }];
              };
            };
            orderBy: [{ order: "asc" }, { createdAt: "asc" }];
          };
        };
      };
      evaluator: true;
      applicant: {
        include: {
          user: true;
        };
      };
    };
  }>;

export interface EvaluatorAssignmentPayloadCreateModel
  extends Prisma.EvaluatorAssignmentUncheckedCreateInput {}

export interface EvaluatorAssignmentPayloadUpdateModel
  extends Omit<
    Prisma.EvaluatorAssignmentUncheckedUpdateInput,
    GeneralOmitModel
  > {}

export interface EvaluatorAssignmentFormModel
  extends Omit<EvaluatorAssignmentDataModel, GeneralOmitModel> {}
