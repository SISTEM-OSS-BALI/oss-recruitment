/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Prisma, ProcedureDocument} from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export interface ProcedureDocumentDataModel extends ProcedureDocument {}

export interface ProcedureDocumentPayloadCreateModel
  extends Prisma.ProcedureDocumentUncheckedCreateInput {}

export interface ProcedureDocumentPayloadUpdateModel
  extends Omit<Prisma.ProcedureDocumentUncheckedUpdateInput, GeneralOmitModel> {}

export interface ProcedureDocumentFormModel
  extends Omit<ProcedureDocumentDataModel, GeneralOmitModel> {}
