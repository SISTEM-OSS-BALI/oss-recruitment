import { db } from "@/lib/prisma";
import { ProcedureDocumentPayloadCreateModel, ProcedureDocumentPayloadUpdateModel } from "../models/procedure-documents";

export const GET_PROCEDURE_DOCUMENTS = async () => {
  const result = await db.procedureDocument.findMany({});
  return result;
};


export const GET_PROCEDURE_DOCUMENT = async (id: string) => {
  const result = await db.procedureDocument.findUnique({
    where: {
      id,
    },
  });
  return result;
};
export const CREATE_PROCEDURE_DOCUMENT = async (payload: ProcedureDocumentPayloadCreateModel) => {
  const result = await db.procedureDocument.create({
    data: payload,
  });

  return result;
};

export const UPDATE_PROCEDURE_DOCUMENT = async (
  id: string,
  payload: ProcedureDocumentPayloadUpdateModel
) => {
  const result = await db.procedureDocument.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

export const DELETE_PROCEDURE_DOCUMENT = async (id: string) => {
  const result = await db.procedureDocument.delete({
    where: {
      id,
    },
  });
  return result;
};
