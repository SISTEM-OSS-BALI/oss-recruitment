import db from "@/lib/prisma";
import { CandidatePayloadCreateModel } from "../models/apply-job";


export const CREATE_APPLY_JOB = async (
  payload: CandidatePayloadCreateModel
) => {
  const result = await db.applicant.create({
    data: payload,
  });

  return result;
};


