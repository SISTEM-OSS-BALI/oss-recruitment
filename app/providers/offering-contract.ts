import { db } from "@/lib/prisma";
import { OfferingContractPayloadCreateModel } from "../models/offering-contract";

export const GET_OFFERING_CONTRACTS = async () => {
  const result = await db.offeringContract.findMany({});
  return result;
};

export const GET_OFFERING_CONTRACT = async (id: string) => {
  const result = await db.offeringContract.findUnique({
    where: {
      id,
    },
  });
  return result;
};
export const CREATE_OFFERING_CONTRACT = async (
  payload: OfferingContractPayloadCreateModel
) => {
  const result = await db.offeringContract.create({
    data: payload,
  });

  return result;
};

export const UPDATE_OFFERING_CONTRACT = async (
  id: string,
  payload: OfferingContractPayloadCreateModel
) => {
  const result = await db.offeringContract.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

export const DELETE_OFFERING_CONTRACT = async (id: string) => {
  const result = await db.offeringContract.delete({
    where: {
      id,
    },
  });
  return result;
};

export const GET_OFFERING_CONTRACT_BY_APPLICATION_ID = async (applicant_id: string) => {
  const result = await db.offeringContract.findFirst({
    where: {
      applicant_id,
    },
  });
  return result;
}