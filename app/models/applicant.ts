/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Prisma } from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export type ApplicantDataModel = Prisma.ApplicantGetPayload<{
  include: {
    job: true;
    user: true;
    mbti_test: true;
    scheduleInterview: true;
    evaluatorAssignment: {
      include: {
        evaluator: true;
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
      }
    }
  };
}>;

export interface ApplicantPayloadCreateModel
  extends Prisma.ApplicantUncheckedCreateInput {}

export interface ApplicantPayloadUpdateModel
  extends Omit<Prisma.ApplicantUncheckedUpdateInput, GeneralOmitModel> {}

export interface ApplicantFormModel
  extends Omit<ApplicantDataModel, GeneralOmitModel> {}
