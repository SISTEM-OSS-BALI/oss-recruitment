"use client";

import ChatWidget, { ChatMessage } from "@/app/components/common/chat";
import { useCandidate } from "@/app/hooks/applicant";
import { useSocket } from "@/app/hooks/socket";
import { ChatPayload } from "@/app/utils/socket-type";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";

export default function ChatPage() {
  const params = useParams();
  const applicantId = params.applicant_id || "demo";
  const roomId = useMemo(() => `recruitment:${applicantId}`, [applicantId]);

  const { data: userDetailData } = useCandidate({ id: applicantId ?? "" });
  const socket = useSocket();

  const currentUser = { id: "me-123", name: "Anda" };
  const [peerOnline, setPeerOnline] = useState(true);
  const [peerTyping, setPeerTyping] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const greetedRef = React.useRef(false);

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

  // --- JOIN ROOM & presence ping saat siap
  useEffect(() => {
    if (!socket) return;
    socket.emit("room:join", roomId);
    socket.emit("presence:ping");
  }, [socket, roomId]);

  // --- Listener untuk pesan dan ACK status
  useEffect(() => {
    if (!socket) return;

    const onMessage = (msg: ChatPayload) => {
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

    return () => {
      socket.off("chat:message", onMessage);
      socket.off("chat:delivered", onDelivered);
      socket.off("chat:read", onRead);
      socket.off("presence:update", onPresence);
      socket.off("typing:update", onTyping);
    };
  }, [socket, roomId]);

  // --- Kirim pesan (optimistic → emit)
  async function handleSend({ text, files }: { text: string; files: File[] }) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // 1) Optimistic update
    const newMsg: ChatMessage = {
      id,
      text: trimmed,
      senderId: currentUser.id,
      createdAt: now,
      status: "sent",
    };
    setMessages((m) => [...m, newMsg]);

    // 2) Emit ke server
    const payload: ChatPayload = {
      id,
      room: roomId,
      text: trimmed,
      senderId: currentUser.id,
      createdAt: now,
    };
    socket.emit("chat:send", payload);
    // Server akan kirim balik "chat:delivered" → status berubah otomatis
  }

  // --- Tandai pesan peer sebagai read (dipanggil ChatWidget)
  function handleMarkRead(ids: string[]) {
    if (!ids.length) return;
    socket.emit("chat:markRead", { room: roomId, ids });
    // Status "read" untuk pesan kita akan di-update oleh event "chat:read" dari server.
  }

  // --- (Opsional) Typing indicator sederhana
  // Kamu bisa panggil ini dari event onChange textarea kalau mau (ChatWidget sekarang tidak expose onTyping).
  const typingTimer = useRef<NodeJS.Timeout | null>(null);
  function notifyTypingStart() {
    socket.emit("typing:start", roomId);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("typing:stop", roomId);
    }, 800);
  }
  // Contoh: panggil notifyTypingStart() di handler onChange TextArea → butuh sedikit modif di ChatWidget untuk meneruskan callback.

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
        // placeholder="Tulis pesan…" // opsional
      />
    </div>
  );
}
