import { db } from "@/lib/prisma";
import { CardTemplatePayloadCreateModel, CardTemplatePayloadUpdateModel } from "../models/card-template";

export const GET_CARD_TEMPLATES = async () => {
  const result = await db.cardTemplate.findMany({
    orderBy: { createdAt: "desc" },
  });
  return result;
};

export const GET_CARD_TEMPLATE = async (id: string) => {
  const result = await db.cardTemplate.findUnique({
    where: {
      id,
    },
  });
  return result;
};
export const CREATE_CARD_TEMPLATE = async (
  payload: CardTemplatePayloadCreateModel
) => {
  const result = await db.cardTemplate.create({
    data: payload,
  });

  return result;
};

export const UPDATE_CARD_TEMPLATE = async (
  id: string,
  payload: CardTemplatePayloadUpdateModel
) => {
  const result = await db.cardTemplate.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

export const DELETE_CARD_TEMPLATE = async (id: string) => {
  const result = await db.cardTemplate.delete({
    where: {
      id,
    },
  });
  return result;
};