import { db } from "@/lib/prisma";
import { JobPayloadCreateModel, JobPayloadUpdateModel } from "../models/job";

export const GET_JOBS = async () => {
  const result = await db.job.findMany({
    include: {
      location: true,
    },
  });
  return result;
};

export const GET_JOB = async (id: string) => {
  const result = await db.job.findUnique({
    where: {
      id,
    },
    include: {
      location: true,
    },
  });
  return result;
};
export const CREATE_JOB = async (payload: JobPayloadCreateModel) => {
  const result = await db.job.create({
    data: payload,
  });

  return result;
};

export const UPDATE_JOB = async (
  id: string,
  payload: JobPayloadUpdateModel
) => {
  const result = await db.job.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

export const DELETE_JOB = async (id: string) => {
  const result = await db.job.delete({
    where: {
      id,
    },
  });
  return result;
};
