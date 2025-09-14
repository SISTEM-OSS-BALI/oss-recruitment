import db from "@/lib/prisma";
import { HistoryCandidatePayloadCreateModel } from "../models/history-candidate";

export const GET_HISTORY_CANDIDATES = async () => {
  const result = await db.historyCandidate.findMany();
  return result;
};

export const CREATE_HISTORY_CANDIDATE = async (
  payload: HistoryCandidatePayloadCreateModel
) => {
  const result = await db.historyCandidate.create({
    data: payload,
  });

  return result;
};
 
