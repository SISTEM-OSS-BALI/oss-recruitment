"use client";

import ChatWidget, { ChatMessage } from "@/app/components/common/chat";
import { useCandidate } from "@/app/hooks/applicant";
import { useSocket } from "@/app/hooks/socket";
import { ChatPayload } from "@/app/utils/socket-type";
import { useAuth } from "@/app/utils/useAuth";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { uploadChatFiles } from "@/app/utils/chat-upload";
import { message } from "antd";

const generateId = () =>
  typeof window !== "undefined" &&
  window.crypto &&
  "randomUUID" in window.crypto
    ? window.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function ChatPage() {
  const params = useParams();
  const applicantId = params.applicant_id || "demo";
  const roomId = useMemo(() => `recruitment:${applicantId}`, [applicantId]);

  const { user_id, user_name } = useAuth();
  const currentUser = useMemo(() => {
    if (!user_id) return null;
    return { id: user_id, name: user_name ?? "Anda" };
  }, [user_id, user_name]);
  const { data: userDetailData } = useCandidate({ id: applicantId ?? "" });
  const socket = useSocket(
    currentUser ? { userId: currentUser.id } : undefined
  );
  const [peerOnline, setPeerOnline] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const greetedRef = React.useRef(false);
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
    if (userDetailData?.stage && !greetedRef.current) {
      const stageLabel =
        (
          {
            SCREENING: "Screening",
            INTERVIEW: "Interview",
            HIRED: "HIRED",
            NEW_APLICANT: "New Applicant",
            REJECTED: "Rejected",
            WAITING: "Waiting",
          } as const
        )[userDetailData.stage] ?? userDetailData.stage; // fallback pakai raw value

      setMessages((prev) => [
        {
          id: "1",
          text: `Selamat Kamu Sudah Berada di Tahap ${stageLabel}!`,
          senderId: "agent-1",
          createdAt: new Date().toISOString(),
          status: "read",
        },
        ...prev,
      ]);
      greetedRef.current = true;
    }
  }, [userDetailData?.stage]);

  useEffect(() => {
    if (!currentUser) return;
    let ignore = false;

    const loadHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const res = await fetch(
          `/api/chat/messages?applicantId=${applicantId}`,
          { credentials: "include" }
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
        console.error("[chat-candidate] gagal mengambil history", error);
      } finally {
        if (!ignore) setIsLoadingHistory(false);
      }
    };

    loadHistory();

    return () => {
      ignore = true;
    };
  }, [applicantId, currentUser]);

  // --- Listener untuk pesan dan ACK status
  useEffect(() => {
    if (!socket) return;

    const onMessage = (msg: ChatPayload) => {
      if (msg.conversationId) {
        setConversationId(msg.conversationId);
      }
      // Hindari duplikasi kalau ini pesan yang baru kita kirim (sudah ada di state)
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
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

      // Kirim ACK delivered ke pengirim
      socket.emit("chat:markDelivered", { room: msg.room, ids: [msg.id] });
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
    };

    const onTyping = (p: { room: string; typing: boolean }) => {
      if (p.room === roomId) setPeerTyping(p.typing);
    };

    socket.on("chat:message", onMessage);
    socket.on("chat:delivered", onDelivered);
    socket.on("chat:read", onRead);
    socket.on("presence:update", onPresence);
    socket.on("typing:update", onTyping);
    const onRoomJoined = (payload: { room: string; conversationId: string }) =>
      setConversationId(payload.conversationId);
    socket.on("room:joined", onRoomJoined);

    return () => {
      socket.off("chat:message", onMessage);
      socket.off("chat:delivered", onDelivered);
      socket.off("chat:read", onRead);
      socket.off("presence:update", onPresence);
      socket.off("typing:update", onTyping);
      socket.off("room:joined", onRoomJoined);
    };
  }, [socket, roomId]);

  // --- JOIN ROOM & presence ping saat siap
  useEffect(() => {
    if (!socket || !currentUser) return;
    socket.emit("room:join", roomId);
    socket.emit("presence:ping");
  }, [socket, roomId, currentUser]);

  // --- Kirim pesan (optimistic → emit)
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
        folder: `candidate-${uploadFolder}`,
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

      // 1) Optimistic update
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
      // Server akan kirim balik "chat:delivered" → status berubah otomatis
    } catch (err) {
      message.error(
        err instanceof Error
          ? err.message
          : "Gagal mengirim pesan. Silakan coba lagi."
      );
      throw err;
    }
  }

  // --- Tandai pesan peer sebagai read (dipanggil ChatWidget)
  function handleMarkRead(ids: string[]) {
    if (!ids.length) return;
    if (!socket) return;
    socket.emit("chat:markRead", { room: roomId, ids });
    // Status "read" untuk pesan kita akan di-update oleh event "chat:read" dari server.
  }

  // --- (Opsional) Typing indicator sederhana
  // Kamu bisa panggil ini dari event onChange textarea kalau mau (ChatWidget sekarang tidak expose onTyping).
  const typingTimer = useRef<NodeJS.Timeout | null>(null);
  function notifyTypingStart() {
    if (!socket || !currentUser) return;
    socket.emit("typing:start", roomId);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      if (socket) {
        socket.emit("typing:stop", roomId);
      }
    }, 800);
  }
  // Contoh: panggil notifyTypingStart() di handler onChange TextArea → butuh sedikit modif di ChatWidget untuk meneruskan callback.

  if (!currentUser) return null;

  return (
    <div style={{ maxWidth: 920, margin: "24px auto", padding: 16 }}>
      <ChatWidget
        currentUser={currentUser}
        peer={{
          id: "agent-1",
          name: "Care Agent",
          online: peerOnline,
          typing: peerTyping,
        }}
        messages={messages}
        onSend={handleSend}
        onMarkRead={handleMarkRead}
        loading={isLoadingHistory}
        // placeholder="Tulis pesan…" // opsional
      />
    </div>
  );
}
