/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Prisma } from "@prisma/client";

export type ConversationDataModel = Prisma.ConversationGetPayload<{
  include: {
    messages: true;
    participants: true;
    applicant: {
      include: {
        user: true;
        job: true;
      };
    };
  };
}>;

