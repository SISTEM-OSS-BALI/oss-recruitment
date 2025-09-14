import db from "@/lib/prisma";

export const GET_SCHEDULES_BY_CANDIDATE = async (candidateId: string) => {
  return db.scheduleHired.findMany({
    where: { candidate_id: candidateId },
    include: {
      location: true,
    },
    orderBy: { date: "desc" },
  });
};
