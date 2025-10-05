// app/chat/page.tsx
"use client";

import ChatWidget, { ChatMessage } from "@/app/components/common/chat";
import { useCandidate } from "@/app/hooks/applicant";
import { useSocket } from "@/app/hooks/socket";
import { ChatPayload } from "@/app/utils/socket-type";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

export default function ChatPage() {
  const params = useSearchParams();
  const applicantId = params.get("applicant_id") || "demo";
  const roomId = useMemo(() => `recruitment:${applicantId}`, [applicantId]);

  // const roomId = "recruitment:123";

  const { data: userDetailData } = useCandidate({ id: applicantId });
  const socket = useSocket();

  // Tentukan identitas lokal (sementara hardcode)
  const currentUser = { id: "me-125", name: "Anda" };
  const peer = { id: "agent-1", name: "Care Agent", online: true };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      text: "Halo! Ada yang bisa saya bantu?",
      senderId: peer.id,
      createdAt: new Date().toISOString(),
      status: "read",
    },
  ]);

  // JOIN room saat socket siap
  useEffect(() => {
    if (!socket) return;
    socket.emit("room:join", roomId);
    socket.emit("presence:ping");
  }, [socket, roomId]);

  // Listener: pesan baru + ACK delivered/read + presence
  useEffect(() => {
    if (!socket) return;

    const onMessage = (msg: ChatPayload) => {
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
          },
        ];
      });

      // Kirim ACK delivered ke pengirim (supaya statusnya jadi "delivered" di sisi dia)
      // Tanpa DB, kita kirim global; pengirim akan match-by-id
      socket.emit("chat:markDelivered", [msg.id]);
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
      // Bisa kamu sambungkan ke state peer.online kalau mau ditampilkan
      // console.log("peer online?", online);
    };

    socket.on("chat:message", onMessage);
    socket.on("chat:delivered", onDelivered);
    socket.on("chat:read", onRead);
    socket.on("presence:update", onPresence);

    return () => {
      socket.off("chat:message", onMessage);
      socket.off("chat:delivered", onDelivered);
      socket.off("chat:read", onRead);
      socket.off("presence:update", onPresence);
    };
  }, [socket]);

  // Kirim pesan (optimistic update → emit ke server)
  async function handleSend({ text, files }: { text: string; files: File[] }) {
    if (!text.trim()) return;

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // 1) Optimistic push (status: sent)
    const newMsg: ChatMessage = {
      id,
      text,
      senderId: currentUser.id,
      createdAt: now,
      status: "sent",
    };
    setMessages((m) => [...m, newMsg]);

    // 2) Emit ke server
    const payload: ChatPayload = {
      id,
      room: roomId,
      text,
      senderId: currentUser.id,
      createdAt: now,
    };
    socket.emit("chat:send", payload);
    // Server akan balas "chat:delivered" → state auto update ke delivered
    // “read” akan di-trigger saat peer mengirim chat:markRead
  }

  // Tandai pesan dari peer sebagai read → kirim ACK read ke server
  function handleMarkRead(ids: string[]) {
    if (!ids.length) return;
    socket.emit("chat:markRead", ids);
    // Boleh juga langsung update lokal (untuk pesan yang kita kirim),
    // tapi biasanya ACK read datang dari peer/ server.
  }

  return (
    <div style={{ maxWidth: 920, margin: "24px auto", padding: 16 }}>
      <ChatWidget
        applicant={userDetailData}
        currentUser={currentUser}
        peer={peer}
        messages={messages}
        onSend={handleSend}
        onMarkRead={handleMarkRead}
      />
    </div>
  );
}
