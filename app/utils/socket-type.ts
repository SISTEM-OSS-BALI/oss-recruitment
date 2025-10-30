// app/(lib)/socket-types.ts
export type ChatAttachmentPayload = {
  url: string;
  name?: string;
  mimeType?: string;
  size?: number;
};

export type ChatPayload = {
  id: string;
  room: string;
  text?: string;
  senderId: string;
  createdAt: string;
  conversationId?: string;
  attachments?: ChatAttachmentPayload[];
};

export type ServerToClientSocketEvents = {
  "chat:message": (msg: ChatPayload) => void;
  "chat:delivered": (ids: string[]) => void;
  "chat:read": (ids: string[]) => void;
  "presence:update": (online: boolean) => void;
  "typing:update": (payload: { room: string; typing: boolean }) => void;
  "room:joined": (payload: { room: string; conversationId: string }) => void;
  "room:error": (payload: { room: string; message: string }) => void;
  "chat:error": (payload: { room: string; message: string }) => void;
};

export type ClientToServerSocketEvents = {
  "room:join": (room: string) => void;
  "chat:send": (msg: ChatPayload) => void;
  "chat:markDelivered": (
    ids: string[] | { room: string; ids: string[] }
  ) => void;
  "chat:markRead": (ids: string[] | { room: string; ids: string[] }) => void;
  "presence:ping": () => void;
  "typing:start": (room: string) => void;
  "typing:stop": (room: string) => void;
};
