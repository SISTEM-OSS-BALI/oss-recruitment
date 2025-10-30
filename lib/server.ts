// server.ts
import http from "http";
import next from "next";
import { Server, Socket } from "socket.io";
import { MessageType } from "@prisma/client";
import db from "./prisma";

/* ================== CONFIG ================== */
const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = Number(process.env.PORT || 3000);
const corsOrigins = process.env.CORS_ORIGIN?.split(",") ?? [
  "http://localhost:3000",
];

/* ============== (OPSI) TIPE EVENT ============== */
type ChatPayload = {
  id: string;
  room: string;
  text?: string;
  senderId: string;
  createdAt: string;
  conversationId?: string;
  attachments?: {
    url: string;
    name?: string;
    mimeType?: string;
    size?: number;
  }[];
};

type RoomMeta = {
  conversationId: string;
};

type SocketRuntimeData = {
  userId?: string;
  roomsMeta?: Record<string, RoomMeta>;
};

/* ============== HELPER PRESENCE ============== */
const roomMembers = new Map<string, Set<string>>();
function trackJoin(room: string, socketId: string) {
  const set = roomMembers.get(room) ?? new Set<string>();
  set.add(socketId);
  roomMembers.set(room, set);
}
function trackLeave(room: string, socketId: string) {
  const set = roomMembers.get(room);
  if (!set) return;
  set.delete(socketId);
  if (set.size === 0) roomMembers.delete(room);
}
function broadcastPresence(
  io: Server,
  room: string,
  online: boolean,
  exceptSocketId?: string
) {
  if (exceptSocketId)
    io.to(room).except(exceptSocketId).emit("presence:update", online);
  else io.to(room).emit("presence:update", online);
}

function getRuntimeData(socket: Socket): SocketRuntimeData {
  const data = (socket.data ?? {}) as SocketRuntimeData;
  if (!data.roomsMeta) {
    data.roomsMeta = {};
    socket.data = data;
  }
  return data;
}

function extractIds(input: string[] | { room: string; ids: string[] }) {
  return Array.isArray(input) ? input : input.ids;
}

function extractRoom(
  input: string[] | { room: string; ids: string[] }
): string | undefined {
  return Array.isArray(input) ? undefined : input.room;
}

async function ensureParticipant(userId: string, conversationId: string) {
  const now = new Date();
  await db.participant.upsert({
    where: { userId_conversationId: { userId, conversationId } },
    update: {
      lastReadAt: now,
    },
    create: {
      userId,
      conversationId,
      lastReadAt: now,
    },
  });
}

async function resolveConversation(
  room: string,
  userId: string
): Promise<{ conversationId: string }> {
  if (!userId) {
    throw new Error("Unauthorized socket");
  }
  if (!room) {
    throw new Error("Invalid room");
  }

  const [namespace, ...rest] = room.split(":");
  const identifier = rest.join(":");

  if (namespace === "conversation") {
    if (!identifier) throw new Error("Conversation id is required");
    const conversation = await db.conversation.findUnique({
      where: { id: identifier },
      select: { id: true },
    });
    if (!conversation) throw new Error("Conversation not found");
    await ensureParticipant(userId, conversation.id);
    return { conversationId: conversation.id };
  }

  if (namespace === "recruitment") {
    if (!identifier) throw new Error("Applicant id is required");
    let conversation = await db.conversation.findFirst({
      where: { applicantId: identifier },
      select: { id: true },
    });
    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          applicantId: identifier,
          title: `Recruitment ${identifier}`,
          isGroup: false,
        },
        select: { id: true },
      });
    }
    await ensureParticipant(userId, conversation.id);
    return { conversationId: conversation.id };
  }

  // fallback → treat whole room name as conversation id
  const fallbackConversation = await db.conversation.findUnique({
    where: { id: room },
    select: { id: true },
  });
  if (!fallbackConversation) throw new Error("Conversation not found");
  await ensureParticipant(userId, fallbackConversation.id);
  return { conversationId: fallbackConversation.id };
}

async function ensureJoinedRoom(socket: Socket, room: string) {
  const data = getRuntimeData(socket);
  const meta = data.roomsMeta?.[room];
  if (meta) return meta;
  const resolved = await resolveConversation(room, data.userId as string);
  data.roomsMeta![room] = resolved;
  return resolved;
}

async function persistMessage(params: {
  conversationId: string;
  messageId: string;
  senderId: string;
  text?: string;
  createdAt: Date;
  attachments?: {
    url: string;
    name?: string;
    mimeType?: string;
    size?: number;
  }[];
}) {
  const {
    conversationId,
    messageId,
    senderId,
    text,
    createdAt,
    attachments = [],
  } = params;
  const now = new Date();

  const message = await db.$transaction(async (tx) => {
    const existing = await tx.message.findUnique({
      where: { id: messageId },
      include: { attachments: true },
    });
    if (existing) {
      await tx.messageRead.upsert({
        where: {
          messageId_userId: { messageId: existing.id, userId: senderId },
        },
        update: { readAt: now },
        create: { messageId: existing.id, userId: senderId, readAt: now },
      });
      return existing;
    }

    const messageType =
      attachments.length > 0 ? MessageType.FILE : MessageType.TEXT;

    const created = await tx.message.create({
      data: {
        id: messageId,
        conversationId,
        senderId,
        type: messageType,
        content: text ?? "",
        createdAt,
      },
    });

    await tx.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: createdAt, updatedAt: now },
    });

    await tx.participant.upsert({
      where: { userId_conversationId: { userId: senderId, conversationId } },
      update: {
        lastReadAt: now,
        unreadCount: 0,
      },
      create: {
        userId: senderId,
        conversationId,
        lastReadAt: now,
        unreadCount: 0,
      },
    });

    await tx.participant.updateMany({
      where: {
        conversationId,
        NOT: { userId: senderId },
      },
      data: {
        unreadCount: {
          increment: 1,
        },
      },
    });

    if (attachments.length) {
      await tx.attachment.createMany({
        data: attachments.map((item) => ({
          messageId: created.id,
          url: item.url,
          mimeType: item.mimeType ?? null,
          size: item.size ?? null,
        })),
      });
    }

    await tx.messageRead.upsert({
      where: { messageId_userId: { messageId: created.id, userId: senderId } },
      update: { readAt: now },
      create: { messageId: created.id, userId: senderId, readAt: now },
    });

    return tx.message.findUnique({
      where: { id: created.id },
      include: { attachments: true },
    });
  });

  if (!message) {
    throw new Error("Failed to persist message");
  }

  return message;
}

async function markMessagesRead(userId: string, ids: string[]) {
  if (!ids.length) return { conversationIds: new Set<string>() };

  const messages = await db.message.findMany({
    where: { id: { in: ids } },
    select: { id: true, conversationId: true },
  });

  if (!messages.length) return { conversationIds: new Set<string>() };

  const now = new Date();
  const conversationIds = new Set(messages.map((m) => m.conversationId));

  const readUpserts = messages.map((m) =>
    db.messageRead.upsert({
      where: { messageId_userId: { messageId: m.id, userId } },
      update: { readAt: now },
      create: { messageId: m.id, userId, readAt: now },
    })
  );

  const participantUpdates = Array.from(conversationIds).map(
    (conversationId) =>
      db.participant.updateMany({
        where: { conversationId, userId },
        data: { lastReadAt: now, unreadCount: 0 },
      })
  );

  await db.$transaction([...readUpserts, ...participantUpdates]);

  return { conversationIds };
}

/* ================== BOOT ================== */
async function main() {
  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();
  await app.prepare();

  const server = http.createServer((req, res) => handle(req, res));
  const io = new Server(server, {
    cors: { origin: corsOrigins, credentials: true },
    // transports: ["websocket"],
  });

  io.use((socket, next) => {
    try {
      const auth = socket.handshake.auth ?? {};
      const userId =
        typeof auth.userId === "string" && auth.userId.trim().length > 0
          ? auth.userId.trim()
          : undefined;
      if (!userId) {
        return next(new Error("unauthorized"));
      }
      const data = getRuntimeData(socket);
      data.userId = userId;
      next();
    } catch (error) {
      next(error instanceof Error ? error : new Error("unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("room:join", async (room: string) => {
      try {
        const meta = await ensureJoinedRoom(socket, room);
        const hadOtherMembers = (roomMembers.get(room)?.size ?? 0) > 0;
        socket.join(room);
        trackJoin(room, socket.id);
        broadcastPresence(io, room, true, socket.id);
        socket.emit("presence:update", hadOtherMembers);
        socket.emit("room:joined", {
          room,
          conversationId: meta.conversationId,
        });
      } catch (error) {
        socket.emit("room:error", {
          room,
          message:
            error instanceof Error ? error.message : "Failed to join room",
        });
      }
    });

    socket.on("chat:send", async (msg: ChatPayload) => {
      const data = getRuntimeData(socket);
      const userId = data.userId;
      if (!userId) return;

      try {
        const meta = await ensureJoinedRoom(socket, msg.room);
        const createdAt = msg.createdAt
          ? new Date(msg.createdAt)
          : new Date();

        const message = await persistMessage({
          conversationId: meta.conversationId,
          messageId: msg.id,
          senderId: userId,
          text: msg.text,
          createdAt,
          attachments: msg.attachments ?? [],
        });

        const mappedAttachments =
          message.attachments?.map((att) => {
            const original = (msg.attachments ?? []).find(
              (item) => item.url === att.url
            );
            return {
              url: att.url,
              mimeType: att.mimeType ?? undefined,
              size: att.size ?? undefined,
              name:
                original?.name ??
                att.url.split("/").pop()?.split("?")[0] ??
                undefined,
            };
          }) ?? [];

        const payload: ChatPayload = {
          id: message.id,
          room: msg.room,
          text: message.content ?? msg.text,
          senderId: userId,
          createdAt: message.createdAt.toISOString(),
          conversationId: meta.conversationId,
          attachments: mappedAttachments,
        };

        io.to(msg.room).emit("chat:message", payload);
        socket.emit("chat:delivered", [payload.id]);
      } catch (error) {
        socket.emit("chat:error", {
          room: msg.room,
          message:
            error instanceof Error ? error.message : "Failed to send message",
        });
      }
    });

    socket.on(
      "chat:markDelivered",
      (input: string[] | { room: string; ids: string[] }) => {
        const ids = extractIds(input);
        if (!ids.length) return;
        const explicitRoom = extractRoom(input);
        const targetRooms = new Set<string>();

        if (explicitRoom) targetRooms.add(explicitRoom);
        else {
          for (const room of socket.rooms) {
            if (room === socket.id) continue;
            targetRooms.add(room);
          }
        }

        for (const room of targetRooms) {
          socket.to(room).emit("chat:delivered", ids);
        }
      }
    );

    socket.on(
      "chat:markRead",
      async (input: string[] | { room: string; ids: string[] }) => {
        const ids = extractIds(input);
        if (!ids.length) return;

        const data = getRuntimeData(socket);
        const userId = data.userId;
        if (!userId) return;

        try {
          const { conversationIds } = await markMessagesRead(userId, ids);
          const explicitRoom = extractRoom(input);
          const roomsToNotify = new Set<string>();

          if (explicitRoom) {
            roomsToNotify.add(explicitRoom);
          } else {
            for (const [room, meta] of Object.entries(
              data.roomsMeta ?? {}
            )) {
              if (conversationIds.has(meta.conversationId)) {
                roomsToNotify.add(room);
              }
            }

            if (!roomsToNotify.size) {
              for (const room of socket.rooms) {
                if (room === socket.id) continue;
                roomsToNotify.add(room);
              }
            }
          }

          for (const room of roomsToNotify) {
            socket.to(room).emit("chat:read", ids);
          }
        } catch (error) {
          socket.emit("chat:error", {
            room: extractRoom(input) ?? "",
            message:
              error instanceof Error ? error.message : "Failed to mark read",
          });
        }
      }
    );

    socket.on("typing:start", async (room: string) => {
      try {
        await ensureJoinedRoom(socket, room);
        socket.to(room).emit("typing:update", { room, typing: true });
      } catch {
        /* ignore */
      }
    });

    socket.on("typing:stop", async (room: string) => {
      try {
        await ensureJoinedRoom(socket, room);
        socket.to(room).emit("typing:update", { room, typing: false });
      } catch {
        /* ignore */
      }
    });

    socket.on("presence:ping", () => {
      for (const room of socket.rooms) {
        if (room === socket.id) continue;
        broadcastPresence(io, room, true, socket.id);
      }
    });

    socket.on("disconnect", () => {
      for (const room of socket.rooms) {
        if (room === socket.id) continue;
        trackLeave(room, socket.id);
        broadcastPresence(io, room, false, socket.id);
      }
    });
  });

  /* ================== GRACEFUL SHUTDOWN ================== */
  function shutdown(reason = "SIGINT/SIGTERM") {
    console.log(`\nShutting down (${reason})...`);
    // Stop menerima koneksi baru
    io.removeAllListeners();
    // Tutup Socket.IO (menutup semua namespace & transport)
    io.close(() => console.log("Socket.IO closed"));

    // Tutup HTTP server (selesaikan koneksi aktif dulu)
    server.close((err) => {
      if (err) {
        console.error("HTTP server close error:", err);
        process.exit(1);
      } else {
        console.log("HTTP server closed");
        process.exit(0);
      }
    });

    // Fallback hard-exit jika masih ngegantung
    setTimeout(() => {
      console.warn("Force exit after timeout.");
      process.exit(0);
    }, 2000).unref();
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("uncaughtException", (e) => {
    console.error("Uncaught exception:", e);
    shutdown("uncaughtException");
  });
  process.on("unhandledRejection", (e) => {
    console.error("Unhandled rejection:", e);
    shutdown("unhandledRejection");
  });
  /* ======================================= */

  server.listen(port, hostname, () => {
    console.log(
      `> Ready on http://${hostname}:${port}  (NODE_ENV=${process.env.NODE_ENV})`
    );
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
