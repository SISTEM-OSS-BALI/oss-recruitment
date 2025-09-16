import db from "@/lib/prisma";
import { RecruitmentStage } from "@prisma/client";
import dayjs from "dayjs";

export const GET_CANDIDATES = async () => {
  const candidates = await db.user.findMany({
    where: { role: "CANDIDATE", job_id: { not: null } },
    orderBy: { createdAt: "desc" },
    include: {
      job: true,
    },
  });

  return candidates;
};

export const GET_CANDIDATE = async (id: string) => {
  const detailCandidate = await db.user.findUnique({
    where: { id },
  });

  return detailCandidate;
};

export const UPDATE_STATUS_CANDIDATE = async (
  id: string,
  stage: RecruitmentStage
) => {
  const dateUpdated = dayjs();
  const updatedCandidate = await db.user.update({
    where: { id, role: "CANDIDATE" },
    data: { stage, updatedAt: dateUpdated.toDate() },
  });

  return updatedCandidate;
};
