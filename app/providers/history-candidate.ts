import db from "@/lib/prisma";
import { RecruitmentStage } from "@prisma/client";

export const GET_HISTORY_CANDIDATES = async () => {
  const result = await db.historyCandidate.findMany();
  return result;
};

export const CREATE_HISTORY_CANDIDATE = async ({
  applicantId,
  stage,
}: {
  applicantId: string;
  stage: RecruitmentStage;
}) => {
  const created = await db.historyCandidate.create({
    data: {
      stage,
      applicant_id: applicantId,
    },
  });

  return created;
};
