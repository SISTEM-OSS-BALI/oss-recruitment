/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Prisma } from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export type NoteInterviewDataModel = Prisma.NoteInterviewGetPayload<{
  include: {
    applicant: true;
  };
}>;

export interface NoteInterviewPayloadCreateModel
  extends Prisma.NoteInterviewUncheckedCreateInput {}

export interface NoteInterviewPayloadUpdateModel
  extends Omit<Prisma.NoteInterviewUncheckedUpdateInput, GeneralOmitModel> {}

export interface NoteInterviewFormModel
  extends Omit<NoteInterviewDataModel, GeneralOmitModel> {}
