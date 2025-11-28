/* eslint-disable @typescript-eslint/no-empty-object-type */

import type { Prisma } from "@prisma/client";

export type ApplicantEmployeeSetupDataModel =
  Prisma.ApplicantEmployeeSetupGetPayload<{
    include: {
      employeeSetup: {
        include: {
          employeeSetupQuestion: {
            include: {
              employeeSetupAnswers: true;
            };
          };
        };
      };
    };
  }>;

export interface AssignEmployeeSetupPayload {
  applicantId: string;
  employeeSetupIds: string[];
}
