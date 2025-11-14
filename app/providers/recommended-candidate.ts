// providers/recommend.ts

import db from "@/lib/prisma";
import { recommendCandidates } from "../utils/recommended-candidate";


export async function recommendForJob(jobId: string) {
  const job = await db.job.findUnique({
    where: { id: jobId },
    select: { name: true, description: true },
  });
  if (!job) return [];

  // Ambil kandidat + interestTags
  const candidates = await db.user.findMany({
    where: { role: "CANDIDATE" },
    select: {
      id: true,
      name: true,
      interestTags: { select: { interest: true } },
    },
  });

  // Hitung & urutkan
  return recommendCandidates(
    job,
    candidates.map((candidate) => ({
      ...candidate,
      interestTags: candidate.interestTags.map((tag) => ({
        name: tag.interest,
      })),
    })),
    { minScore: 2, limit: 50 }
  );
}
