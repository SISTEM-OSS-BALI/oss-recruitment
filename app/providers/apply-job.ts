import db from "@/lib/prisma";
import { CandidatePayloadCreateModel } from "../models/apply-job";


export const CREATE_CANDIDATE = async (
  payload: CandidatePayloadCreateModel
) => {
  const result = await db.candidate.create({
    data: payload,
  });

  return result;
};


