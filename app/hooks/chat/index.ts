"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/app/utils/useAuth";
import { useSocket } from "@/app/hooks/socket";
import { ChatPayload } from "@/app/utils/socket-type";

type UnreadSummary = {
  totalUnread: number;
  conversations: Array<{
    conversationId: string;
    unreadCount: number;
    conversation: {
      applicantId: string | null;
      title: string | null;
      updatedAt: string;
      applicant: {
        id: string;
        user: {
          name: string | null;
        } | null;
      } | null;
    } | null;
  }>;
};

async function fetchUnreadSummary(): Promise<UnreadSummary> {
  const res = await fetch("/api/chat/unread", {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch unread summary");
  }

  const data = await res.json();
  return data.result as UnreadSummary;
}

export function useChatUnread() {
  const { user_id } = useAuth();
  const queryClient = useQueryClient();
  const socket = useSocket(user_id ? { userId: user_id } : undefined);

  const query = useQuery({
    queryKey: ["chat-unread", user_id],
    queryFn: fetchUnreadSummary,
    enabled: Boolean(user_id),
    staleTime: 30_000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (!socket || !user_id) return;

    const invalidate = () =>
      queryClient.invalidateQueries({
        queryKey: ["chat-unread", user_id],
      });

    const handleIncoming = (payload: ChatPayload) => {
      if (payload.senderId === user_id) return;
      invalidate();
    };

    socket.on("chat:message", handleIncoming);
    socket.on("chat:read", invalidate);

    return () => {
      socket.off("chat:message", handleIncoming);
      socket.off("chat:read", invalidate);
    };
  }, [socket, user_id, queryClient]);

  return {
    unreadCount: query.data?.totalUnread ?? 0,
    conversations: query.data?.conversations ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}
