import { db } from "@/lib/prisma";

import { GET_JOB } from "./job";

export const GET_REFERRAL_JOB_BY_CODE = async (code: string) => {
  const trimmedCode = code.trim();
  if (!trimmedCode) return null;

  const referral = await db.referralLink.findUnique({
    where: { code: trimmedCode },
  });

  if (!referral || !referral.is_active) {
    return null;
  }

  const job = await GET_JOB(referral.job_id);
  if (!job || job.is_draft || !job.is_published) {
    return null;
  }

  return { referral, job };
};
