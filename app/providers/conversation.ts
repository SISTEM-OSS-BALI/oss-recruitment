import db from "@/lib/prisma";
import { Prisma, RecruitmentStage } from "@prisma/client";

type ConversationFilter = {
  job_id?: string;
  stages?: RecruitmentStage[];
  search?: string;
};

const buildConversationWhere = (
  filter?: ConversationFilter
): Prisma.ConversationWhereInput | undefined => {
  if (!filter) return undefined;
  const conditions: Prisma.ConversationWhereInput[] = [];

  if (filter.job_id) {
    conditions.push({
      applicant: { job_id: filter.job_id },
    });
  }

  if (filter.stages && filter.stages.length > 0) {
    conditions.push({
      applicant: { stage: { in: filter.stages } },
    });
  }

  if (filter.search && filter.search.trim()) {
    const keyword = filter.search.trim();
    conditions.push({
      OR: [
        { title: { contains: keyword, mode: "insensitive" } },
        {
          applicant: {
            user: { name: { contains: keyword, mode: "insensitive" } },
          },
        },
        {
          applicant: {
            job: {
              job_title: { contains: keyword, mode: "insensitive" },
            },
          },
        },
      ],
    });
  }

  if (!conditions.length) return undefined;
  return { AND: conditions };
};

export const GET_CONVERSATIONS = async (filter?: ConversationFilter) => {
  const result = await db.conversation.findMany({
    where: buildConversationWhere(filter),
    include: {
      applicant: {
        select: {
          id: true,
          stage: true,
          job_id: true,
          job: {
            select: {
              id: true,
              job_title: true,
              job_role: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              photo_url: true,
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          content: true,
          createdAt: true,
          type: true,
        },
      },
    },
    orderBy: [
      { updatedAt: "desc" },
      { lastMessageAt: "desc" },
    ],
  });
  return result;
};
