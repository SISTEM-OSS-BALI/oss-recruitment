import db from "@/lib/prisma";
import { RecruitmentStage } from "@prisma/client";
import dayjs from "dayjs";

export const GET_CANDIDATES = async () => {
  const candidates = await db.candidate.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      job: true,
    },
  });

  return candidates;
};

export const UPDATE_STATUS_CANDIDATE = async (
  id: string,
  stage: RecruitmentStage,
) => {
  const dateUpdated = dayjs();
  const updatedCandidate = await db.candidate.update({
    where: { id },
    data: { stage, updatedAt: dateUpdated.toDate() },
  });

  return updatedCandidate;
};
