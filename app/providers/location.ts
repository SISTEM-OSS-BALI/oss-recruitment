import { db } from "@/lib/prisma";
import { LocationPayloadCreateModel, LocationPayloadUpdateModel } from "../models/location";

export const GET_LOCATIONS = async () => {
  const result = await db.location.findMany({});
  return result;
};


export const GET_LOCATION = async (id: string) => {
  const result = await db.location.findUnique({
    where: {
      id,
    },
  });
  return result;
};
export const CREATE_LOCATION = async (payload: LocationPayloadCreateModel) => {
  const result = await db.location.create({
    data: payload,
  });

  return result;
};

export const UPDATE_LOCATION = async (
  id: string,
  payload: LocationPayloadUpdateModel
) => {
  const result = await db.location.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

export const DELETE_LOCATION = async (id: string) => {
  const result = await db.location.delete({
    where: {
      id,
    },
  });
  return result;
};
