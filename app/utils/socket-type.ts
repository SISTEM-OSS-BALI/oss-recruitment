// app/(lib)/socket-types.ts
export type ChatPayload = {
  id: string; // message id (uuid dari client)
  room: string; // room id
  text?: string; // text optional kalau nanti ada attachment-only
  senderId: string; // "me-123" atau "agent-1"
  createdAt: string; // ISO string
};

export type ServerToClientEvents = {
  "chat:message": (msg: ChatPayload) => void; // broadcast pesan baru
  "chat:delivered": (ids: string[]) => void; // ACK delivered utk pesan2 current user
  "chat:read": (ids: string[]) => void; // ACK read utk pesan2 current user
  "presence:update": (online: boolean) => void; // presence peer
};

export type ClientToServerEvents = {
  "room:join": (room: string) => void; // masuk room
  "chat:send": (msg: ChatPayload) => void; // kirim pesan (tanpa DB)
  "chat:markDelivered": (ids: string[]) => void; // tandai delivered ke pengirim
  "chat:markRead": (ids: string[]) => void; // tandai read ke pengirim
  "presence:ping": () => void; // ping presence
};
