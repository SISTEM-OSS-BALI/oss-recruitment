import { db } from "@/lib/prisma";

type ConversationLite = { id: string; applicantId: string | null };

type GetConversationParams =
  | { conversationId: string; applicantId?: never }
  | { conversationId?: never; applicantId: string };

export const getConversationForRecruitment = async (
  params: GetConversationParams
): Promise<ConversationLite | null> => {
  if ("conversationId" in params) {
    const conversation = await db.conversation.findUnique({
      where: { id: params.conversationId },
      select: { id: true, applicantId: true },
    });
    return conversation;
  }

  const conversation = await db.conversation.findFirst({
    where: { applicantId: params.applicantId },
    select: { id: true, applicantId: true },
  });

  if (conversation) return conversation;

  return db.conversation.create({
    data: {
      applicantId: params.applicantId,
      title: `Recruitment ${params.applicantId}`,
      isGroup: false,
    },
    select: { id: true, applicantId: true },
  });
};

export const getConversationMessages = async (conversationId: string) => {
  const messages = await db.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    include: {
      reads: {
        select: { userId: true },
      },
      attachments: {
        select: {
          id: true,
          url: true,
          mimeType: true,
          size: true,
        },
      },
    },
  });

  return messages;
};

export const getUnreadSummaryByUser = async (userId: string) => {
  const [aggregate, conversations] = await Promise.all([
    db.participant.aggregate({
      where: {
        userId,
      },
      _sum: { unreadCount: true },
    }),
    db.participant.findMany({
      where: {
        userId,
        unreadCount: { gt: 0 },
      },
      select: {
        conversationId: true,
        unreadCount: true,
        conversation: {
          select: {
            applicantId: true,
            title: true,
            updatedAt: true,
            applicant: {
              select: {
                id: true,
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        conversation: {
          updatedAt: "desc",
        },
      },
    }),
  ]);

  return {
    totalUnread: aggregate._sum.unreadCount ?? 0,
    conversations,
  };
};
