import { db } from "@/lib/prisma";
import { JobPayloadCreateModel, JobPayloadUpdateModel } from "../models/job";
import { ScheduleHiredPayloadCreateModel } from "../models/hired";

export const GET_SCHEDULE_HIREDS = async () => {
  const result = await db.scheduleHired.findMany({
    include: {
      location: true,
      applicant: true,
    },
  });
  return result;
};

export const GET_SCHEDULE_HIRED = async (id: string) => {
  const result = await db.scheduleHired.findUnique({
    where: {
      id,
    },
    include: {
      applicant: true,
      location: true,
    },
  });
  return result;
};
export const CREATE_SCHEDULE_HIRED = async (payload: ScheduleHiredPayloadCreateModel) => {
  const result = await db.scheduleHired.create({
    data: payload,
  });

  return result;
};

export const UPDATE_SCHEDULE_HIRED = async (
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

export const DELETE_SCHEDULE_HIRED = async (id: string) => {
  const result = await db.job.delete({
    where: {
      id,
    },
  });
  return result;
};
