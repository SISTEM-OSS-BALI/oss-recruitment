import db from "@/lib/prisma";

export const GET_REFERRAL = async (code_referral: string) => {
  const normalizedCode = code_referral?.trim();
  if (!normalizedCode) return null;

  const detailCandidate = await db.user.findFirst({
    where: { no_unique: normalizedCode },
    select: {
      name: true,
      no_unique: true,
      email: true,
    },
  });

  return detailCandidate;
};
