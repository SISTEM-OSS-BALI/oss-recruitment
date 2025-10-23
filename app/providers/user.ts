import db from "@/lib/prisma";
import { UserPayloadCreateModel, UserPayloadUpdateModel } from "../models/user";
import bcrypt from "bcrypt";

export const CREATE_USER = async (payload: UserPayloadCreateModel) => {
  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const result = await db.user.create({
    data: {
      ...payload,
      password: hashedPassword,
    },
  });

  return result;
};

export const GET_USER = async (id: string) => {
  const result = await db.user.findUnique({
    where: {
      id,
    },
  });
  return result;
};

export const UPDATE_USER = async (
  id: string,
  payload: UserPayloadCreateModel
) => {
  const result = await db.user.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

export const DELETE_USER = async (id: string) => {
  const result = await db.user.delete({
    where: {
      id,
    },
  });
  return result;
};

export const UPDATE_USER_DOCUMENT = async (user_id: string, payload: UserPayloadUpdateModel) => {
  const result = await db.user.update({
    where: {
      id: user_id,
    },

    data: {
      no_identity: payload.no_identity,
      no_identity_url: payload.no_identity_url,
    },
  });
  return result;
}
