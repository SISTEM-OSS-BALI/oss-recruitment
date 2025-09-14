import { db } from "@/lib/prisma";
import {
  ContractTemplatePayloadCreateModel,
  ContractTemplatePayloadUpdateModel,
} from "../models/contract-template";

export const GET_CONTRACT_TEMPLATES = async () => {
  const result = await db.contractTemplate.findMany({
  });
  return result;
};

export const GET_CONTRACT_TEMPLATE = async (id: string) => {
  const result = await db.contractTemplate.findUnique({
    where: {
      id,
    },
  });
  return result;
};
export const CREATE_CONTRACT_TEMPLATE = async (
  payload: ContractTemplatePayloadCreateModel
) => {
  const result = await db.contractTemplate.create({
    data: payload,
  });

  return result;
};

export const UPDATE_CONTRACT_TEMPLATE = async (
  id: string,
  payload: ContractTemplatePayloadUpdateModel
) => {
  const result = await db.contractTemplate.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

export const DELETE_CONTRACT_TEMPLATE = async (id: string) => {
  const result = await db.contractTemplate.delete({
    where: {
      id,
    },
  });
  return result;
};
