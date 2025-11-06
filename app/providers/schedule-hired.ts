import { db } from "@/lib/prisma";
import { ScheduleHiredPayloadCreateModel, ScheduleHiredPayloadUpdateModel } from "../models/schedule-hired";


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
  payload: ScheduleHiredPayloadUpdateModel
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


export const GET_SCHEDULES_BY_CANDIDATE = async (applicant_id: string) => {
  return db.scheduleHired.findFirst({
    where: { applicant_id: applicant_id },
    include: {
      location: true,
    },
    orderBy: { date: "desc" },
  });
};

