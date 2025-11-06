import { db } from "@/lib/prisma";
import { ConsultantPayloadCreateModel, ConsultantPayloadUpdateModel } from "../models/consultant";

export const GET_CONSULTANTS= async () => {
  const result = await db.consultant.findMany({});
  return result;
};


export const GET_CONSULTANT = async (id: string) => {
  const result = await db.consultant.findUnique({
    where: {
      id,
    },
  });
  return result;
};
export const CREATE_CONSULTANT = async (payload: ConsultantPayloadCreateModel) => {
  const result = await db.consultant.create({
    data: payload,
  });

  return result;
};

export const UPDATE_CONSULTANT = async (
  id: string,
  payload: ConsultantPayloadUpdateModel
) => {
  const result = await db.consultant.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

export const DELETE_CONSULTANT = async (id: string) => {
  const result = await db.consultant.delete({
    where: {
      id,
    },
  });
  return result;
};
