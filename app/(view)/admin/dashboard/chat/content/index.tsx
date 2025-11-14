// app/chat/page.tsx
"use client";

import ChatWidget, { ChatMessage } from "@/app/components/common/chat";
import { useCandidate } from "@/app/hooks/applicant";
import { useSocket } from "@/app/hooks/socket";
import { ChatPayload } from "@/app/utils/socket-type";
import { useAuth } from "@/app/utils/useAuth";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { uploadChatFiles } from "@/app/vendor/chat-upload";
import { message } from "antd";

const generateId = () =>
  typeof window !== "undefined" &&
  window.crypto &&
  "randomUUID" in window.crypto
    ? window.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function ChatPage() {
  const params = useSearchParams();
  const applicantId = params.get("applicant_id") || "demo";
  const roomId = useMemo(() => `recruitment:${applicantId}`, [applicantId]);

  const { user_id, user_name } = useAuth();
  const { data: userDetailData } = useCandidate({ id: applicantId });
  const currentUser = useMemo(() => {
    if (!user_id) return null;
    return { id: user_id, name: user_name ?? "Anda" };
  }, [user_id, user_name]);
  const socket = useSocket(
    currentUser ? { userId: currentUser.id } : undefined
  );
  const [peerOnline, setPeerOnline] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);

  const peer = useMemo(() => {
    const candidateUser = userDetailData?.user;
    return {
      id: candidateUser?.id ?? applicantId,
      name: candidateUser?.name ?? "Candidate",
      online: peerOnline,
      typing: peerTyping,
    };
  }, [userDetailData?.user, applicantId, peerOnline, peerTyping]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const typingStateRef = useRef(false);

  const mapAttachments = (
    messageId: string,
    attachments?:
      | {
          url: string;
          name?: string;
          mimeType?: string;
          size?: number;
        }[]
  ) =>
    (attachments ?? []).map((att, idx) => ({
      id: `${messageId}-att-${idx}`,
      name:
        att.name ??
        att.url.split("/").pop()?.split("?")[0] ??
        "Lampiran",
      url: att.url,
      type: att.mimeType,
      size: att.size,
    }));

  useEffect(() => {
    if (!currentUser) return;
    let ignore = false;

    const loadHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const res = await fetch(
          `/api/chat/messages?applicantId=${applicantId}`,
          {
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("Failed to load history");
        const data = await res.json();
        if (ignore) return;

        if (data?.result?.conversationId) {
          setConversationId(data.result.conversationId);
        }

        const history: ChatMessage[] =
          data?.result?.messages?.map(
            (msg: {
              id: string;
              content?: string | null;
              senderId: string;
              createdAt: string;
              reads?: { userId: string }[];
              attachments?: {
                url: string;
                mimeType?: string | null;
                size?: number | null;
              }[];
            }) => {
              const othersRead = Array.isArray(msg.reads)
                ? msg.reads.some((read) => read.userId !== msg.senderId)
                : false;
              return {
                id: msg.id,
                text: msg.content ?? "",
                senderId: msg.senderId,
                createdAt: msg.createdAt,
                status:
                  msg.senderId === currentUser.id
                    ? othersRead
                      ? "read"
                      : "delivered"
                    : undefined,
                attachments: mapAttachments(
                  msg.id,
                  (msg.attachments ?? []).map((att) => ({
                    url: att.url,
                    mimeType: att.mimeType ?? undefined,
                    size: att.size ?? undefined,
                  }))
                ),
              };
            }
          ) ?? [];

        setMessages((prev) => {
          const merged = new Map<string, ChatMessage>();
          history.forEach((item) => merged.set(item.id, item));
          prev.forEach((item) => {
            if (!merged.has(item.id)) merged.set(item.id, item);
          });
          return Array.from(merged.values()).sort(
            (a, b) =>
              new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime()
          );
        });
      } catch (error) {
        console.error("[chat] gagal mengambil history", error);
      } finally {
        if (!ignore) setIsLoadingHistory(false);
      }
    };

    loadHistory();

    return () => {
      ignore = true;
    };
  }, [applicantId, currentUser]);

  // Listener: pesan baru + ACK delivered/read + presence
  useEffect(() => {
    if (!socket) return;

    const onMessage = (msg: ChatPayload) => {
      if (msg.conversationId) {
        setConversationId(msg.conversationId);
      }
      // Hindari duplikasi (kalau kita sendiri yang baru kirim dan sudah masuk state)
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === msg.id);
        if (exists) return prev;
        return [
          ...prev,
          {
            id: msg.id,
            text: msg.text,
            senderId: msg.senderId,
            createdAt: msg.createdAt,
            attachments: mapAttachments(msg.id, msg.attachments),
          },
        ];
      });

      // Kirim ACK delivered ke pengirim (supaya statusnya jadi "delivered" di sisi dia)
      // Tanpa DB, kita kirim global; pengirim akan match-by-id
      socket.emit("chat:markDelivered", [msg.id]);
      if (msg.senderId !== currentUser?.id) {
        setPeerTyping(false);
      }
    };

    const onDelivered = (ids: string[]) => {
      setMessages((prev) =>
        prev.map((m) =>
          ids.includes(m.id) ? { ...m, status: "delivered" } : m
        )
      );
    };

    const onRead = (ids: string[]) => {
      setMessages((prev) =>
        prev.map((m) => (ids.includes(m.id) ? { ...m, status: "read" } : m))
      );
    };

    const onPresence = (online: boolean) => {
      setPeerOnline(online);
      if (!online) setPeerTyping(false);
    };

    const onTyping = (payload: { room: string; typing: boolean }) => {
      if (payload.room === roomId) {
        setPeerTyping(payload.typing);
      }
    };

    const onRoomJoined = (payload: { room: string; conversationId: string }) =>
      setConversationId(payload.conversationId);

    socket.on("chat:message", onMessage);
    socket.on("chat:delivered", onDelivered);
    socket.on("chat:read", onRead);
    socket.on("presence:update", onPresence);
    socket.on("typing:update", onTyping);
    socket.on("room:joined", onRoomJoined);

    return () => {
      socket.off("chat:message", onMessage);
      socket.off("chat:delivered", onDelivered);
      socket.off("chat:read", onRead);
      socket.off("presence:update", onPresence);
      socket.off("typing:update", onTyping);
      socket.off("room:joined", onRoomJoined);
    };
  }, [socket, roomId, currentUser?.id]);

  // JOIN room saat socket siap
  useEffect(() => {
    if (!socket || !currentUser) return;
    socket.emit("room:join", roomId);
    socket.emit("presence:ping");
  }, [socket, roomId, currentUser]);

  // Kirim pesan (optimistic update → emit ke server)
  async function handleSend({ text, files }: { text: string; files: File[] }) {
    const trimmed = text.trim();
    if (!trimmed && files.length === 0) return;
    if (!socket || !currentUser) return;

    const id = generateId();
    const now = new Date().toISOString();
    const uploadFolder =
      conversationId ?? applicantId ?? currentUser.id ?? "chat";

    try {
      const uploaded = await uploadChatFiles(files, {
        folder: `recruitment-${uploadFolder}`,
      });
      const attachmentsForState = mapAttachments(
        id,
        uploaded.map((file) => ({
          url: file.url,
          name: file.name,
          mimeType: file.mimeType,
          size: file.size,
        }))
      );

      // 1) Optimistic push (status: sent)
      const newMsg: ChatMessage = {
        id,
        text: trimmed || undefined,
        senderId: currentUser.id,
        createdAt: now,
        status: "sent",
        attachments: attachmentsForState.length ? attachmentsForState : undefined,
      };
      setMessages((m) => [...m, newMsg]);

      // 2) Emit ke server
      const payload: ChatPayload = {
        id,
        room: roomId,
        text: trimmed || undefined,
        senderId: currentUser.id,
        createdAt: now,
        conversationId: conversationId ?? undefined,
        attachments: uploaded.map((file) => ({
          url: file.url,
          name: file.name,
          mimeType: file.mimeType,
          size: file.size,
        })),
      };
      socket.emit("chat:send", payload);
      // Server akan balas "chat:delivered" → state auto update ke delivered
      // “read” akan di-trigger saat peer mengirim chat:markRead
    } catch (err) {
      message.error(
        err instanceof Error
          ? err.message
          : "Gagal mengirim pesan. Silakan coba lagi."
      );
      throw err;
    }
  }

  // Tandai pesan dari peer sebagai read → kirim ACK read ke server
  function handleMarkRead(ids: string[]) {
    if (!ids.length) return;
   if (!socket) return;
    socket.emit("chat:markRead", { room: roomId, ids });
    // Boleh juga langsung update lokal (untuk pesan yang kita kirim),
    // tapi biasanya ACK read datang dari peer/ server.
  }

  const handleTypingChange = useCallback(
    (typing: boolean) => {
      if (!socket) return;
      if (typing && !typingStateRef.current) {
        socket.emit("typing:start", roomId);
        typingStateRef.current = true;
      }
      if (!typing && typingStateRef.current) {
        socket.emit("typing:stop", roomId);
        typingStateRef.current = false;
      }
    },
    [socket, roomId]
  );

  useEffect(() => {
    return () => {
      if (typingStateRef.current && socket) {
        socket.emit("typing:stop", roomId);
        typingStateRef.current = false;
      }
    };
  }, [socket, roomId]);

  if (!currentUser) return null;

  return (
    <div style={{ maxWidth: 920, margin: "24px auto", padding: 16 }}>
      <ChatWidget
        applicant={userDetailData}
        currentUser={currentUser}
        peer={peer}
        messages={messages}
        onSend={handleSend}
        onMarkRead={handleMarkRead}
        onTypingChange={handleTypingChange}
        loading={isLoadingHistory}
      />
    </div>
  );
}
