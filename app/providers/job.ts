import { RecruitmentStage } from "@prisma/client";

import { db } from "@/lib/prisma";
import {
  JobDataModel,
  JobPayloadCreateModel,
  JobPayloadUpdateModel,
  JobStats,
} from "../models/job";

type JobFilter = {
  is_published?: boolean;
};

const CONNECTED_STAGES: RecruitmentStage[] = [
  "INTERVIEW",
  "OFFERING",
  "HIRED",
  "WAITING",
];

function buildStats(applicants: Array<{ stage: RecruitmentStage | null; Conversation: { id: string }[] }>): JobStats {
  let chatStarted = 0;
  let connected = 0;
  let notSuitable = 0;

  applicants.forEach((app) => {
    if (Array.isArray(app.Conversation) && app.Conversation.length > 0) {
      chatStarted += 1;
    }
    if (app.stage && CONNECTED_STAGES.includes(app.stage)) {
      connected += 1;
    }
    if (app.stage === "REJECTED") {
      notSuitable += 1;
    }
  });

  return { chatStarted, connected, notSuitable };
}

const selectApplicantsForStats = {
  stage: true,
  Conversation: { select: { id: true } },
};

export const GET_JOBS = async (filter?: JobFilter): Promise<JobDataModel[]> => {
  const rows = await db.job.findMany({
    where:
      filter?.is_published === undefined
        ? undefined
        : { is_published: filter.is_published },
    include: {
      location: true,
      Applicant: {
        select: selectApplicantsForStats,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((row) => {
    const { Applicant, ...rest } = row;
    return {
      ...rest,
      stats: buildStats(Applicant),
    };
  });
};

export const GET_JOB = async (id: string) => {
  const result = await db.job.findUnique({
    where: {
      id,
    },
    include: {
      location: true,
      Applicant: {
        select: selectApplicantsForStats,
      },
    },
  });

  if (!result) return result;
  const { Applicant, ...rest } = result;
  return {
    ...rest,
    stats: buildStats(Applicant),
  };
};
export const CREATE_JOB = async (payload: JobPayloadCreateModel) => {
  const result = await db.job.create({
    data: payload,
    include: { location: true },
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
    include: { location: true },
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
