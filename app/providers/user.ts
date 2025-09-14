import db from "@/lib/prisma";
import { UserPayloadCreateModel } from "../models/user";
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
