"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
// server.ts
const http_1 = __importDefault(require("http"));
const next_1 = __importDefault(require("next"));
const socket_io_1 = require("socket.io");
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("./prisma"));
/* ================== CONFIG ================== */
const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = Number(process.env.PORT || 3000);
const corsOrigins = (_b = (_a = process.env.CORS_ORIGIN) === null || _a === void 0 ? void 0 : _a.split(",")) !== null && _b !== void 0 ? _b : [
    "http://localhost:3000",
];
/* ============== HELPER PRESENCE ============== */
const roomMembers = new Map();
function trackJoin(room, socketId) {
    var _a;
    const set = (_a = roomMembers.get(room)) !== null && _a !== void 0 ? _a : new Set();
    set.add(socketId);
    roomMembers.set(room, set);
}
function trackLeave(room, socketId) {
    const set = roomMembers.get(room);
    if (!set)
        return;
    set.delete(socketId);
    if (set.size === 0)
        roomMembers.delete(room);
}
function broadcastPresence(io, room, online, exceptSocketId) {
    if (exceptSocketId)
        io.to(room).except(exceptSocketId).emit("presence:update", online);
    else
        io.to(room).emit("presence:update", online);
}
function getRuntimeData(socket) {
    var _a;
    const data = ((_a = socket.data) !== null && _a !== void 0 ? _a : {});
    if (!data.roomsMeta) {
        data.roomsMeta = {};
        socket.data = data;
    }
    return data;
}
function extractIds(input) {
    return Array.isArray(input) ? input : input.ids;
}
function extractRoom(input) {
    return Array.isArray(input) ? undefined : input.room;
}
async function ensureParticipant(userId, conversationId) {
    const now = new Date();
    await prisma_1.default.participant.upsert({
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
async function resolveConversation(room, userId) {
    if (!userId) {
        throw new Error("Unauthorized socket");
    }
    if (!room) {
        throw new Error("Invalid room");
    }
    const [namespace, ...rest] = room.split(":");
    const identifier = rest.join(":");
    if (namespace === "conversation") {
        if (!identifier)
            throw new Error("Conversation id is required");
        const conversation = await prisma_1.default.conversation.findUnique({
            where: { id: identifier },
            select: { id: true },
        });
        if (!conversation)
            throw new Error("Conversation not found");
        await ensureParticipant(userId, conversation.id);
        return { conversationId: conversation.id };
    }
    if (namespace === "recruitment") {
        if (!identifier)
            throw new Error("Applicant id is required");
        let conversation = await prisma_1.default.conversation.findFirst({
            where: { applicantId: identifier },
            select: { id: true },
        });
        if (!conversation) {
            conversation = await prisma_1.default.conversation.create({
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
    const fallbackConversation = await prisma_1.default.conversation.findUnique({
        where: { id: room },
        select: { id: true },
    });
    if (!fallbackConversation)
        throw new Error("Conversation not found");
    await ensureParticipant(userId, fallbackConversation.id);
    return { conversationId: fallbackConversation.id };
}
async function ensureJoinedRoom(socket, room) {
    var _a;
    const data = getRuntimeData(socket);
    const meta = (_a = data.roomsMeta) === null || _a === void 0 ? void 0 : _a[room];
    if (meta)
        return meta;
    const resolved = await resolveConversation(room, data.userId);
    data.roomsMeta[room] = resolved;
    return resolved;
}
async function persistMessage(params) {
    const { conversationId, messageId, senderId, text, createdAt, attachments = [], } = params;
    const now = new Date();
    const message = await prisma_1.default.$transaction(async (tx) => {
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
        const messageType = attachments.length > 0 ? client_1.MessageType.FILE : client_1.MessageType.TEXT;
        const created = await tx.message.create({
            data: {
                id: messageId,
                conversationId,
                senderId,
                type: messageType,
                content: text !== null && text !== void 0 ? text : "",
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
                data: attachments.map((item) => {
                    var _a, _b;
                    return ({
                        messageId: created.id,
                        url: item.url,
                        mimeType: (_a = item.mimeType) !== null && _a !== void 0 ? _a : null,
                        size: (_b = item.size) !== null && _b !== void 0 ? _b : null,
                    });
                }),
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
async function markMessagesRead(userId, ids) {
    if (!ids.length)
        return { conversationIds: new Set() };
    const messages = await prisma_1.default.message.findMany({
        where: { id: { in: ids } },
        select: { id: true, conversationId: true },
    });
    if (!messages.length)
        return { conversationIds: new Set() };
    const now = new Date();
    const conversationIds = new Set(messages.map((m) => m.conversationId));
    const readUpserts = messages.map((m) => prisma_1.default.messageRead.upsert({
        where: { messageId_userId: { messageId: m.id, userId } },
        update: { readAt: now },
        create: { messageId: m.id, userId, readAt: now },
    }));
    const participantUpdates = Array.from(conversationIds).map((conversationId) => prisma_1.default.participant.updateMany({
        where: { conversationId, userId },
        data: { lastReadAt: now, unreadCount: 0 },
    }));
    await prisma_1.default.$transaction([...readUpserts, ...participantUpdates]);
    return { conversationIds };
}
/* ================== BOOT ================== */
async function main() {
    const app = (0, next_1.default)({ dev, hostname, port });
    const handle = app.getRequestHandler();
    await app.prepare();
    const server = http_1.default.createServer((req, res) => handle(req, res));
    const io = new socket_io_1.Server(server, {
        cors: { origin: corsOrigins, credentials: true },
        // transports: ["websocket"],
    });
    io.use((socket, next) => {
        var _a;
        try {
            const auth = (_a = socket.handshake.auth) !== null && _a !== void 0 ? _a : {};
            const userId = typeof auth.userId === "string" && auth.userId.trim().length > 0
                ? auth.userId.trim()
                : undefined;
            if (!userId) {
                return next(new Error("unauthorized"));
            }
            const data = getRuntimeData(socket);
            data.userId = userId;
            next();
        }
        catch (error) {
            next(error instanceof Error ? error : new Error("unauthorized"));
        }
    });
    io.on("connection", (socket) => {
        socket.on("room:join", async (room) => {
            var _a, _b;
            try {
                const meta = await ensureJoinedRoom(socket, room);
                const hadOtherMembers = ((_b = (_a = roomMembers.get(room)) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : 0) > 0;
                socket.join(room);
                trackJoin(room, socket.id);
                broadcastPresence(io, room, true, socket.id);
                socket.emit("presence:update", hadOtherMembers);
                socket.emit("room:joined", {
                    room,
                    conversationId: meta.conversationId,
                });
            }
            catch (error) {
                socket.emit("room:error", {
                    room,
                    message: error instanceof Error ? error.message : "Failed to join room",
                });
            }
        });
        socket.on("chat:send", async (msg) => {
            var _a, _b, _c, _d;
            const data = getRuntimeData(socket);
            const userId = data.userId;
            if (!userId)
                return;
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
                    attachments: (_a = msg.attachments) !== null && _a !== void 0 ? _a : [],
                });
                const mappedAttachments = (_c = (_b = message.attachments) === null || _b === void 0 ? void 0 : _b.map((att) => {
                    var _a, _b, _c, _d, _e, _f;
                    const original = ((_a = msg.attachments) !== null && _a !== void 0 ? _a : []).find((item) => item.url === att.url);
                    return {
                        url: att.url,
                        mimeType: (_b = att.mimeType) !== null && _b !== void 0 ? _b : undefined,
                        size: (_c = att.size) !== null && _c !== void 0 ? _c : undefined,
                        name: (_f = (_d = original === null || original === void 0 ? void 0 : original.name) !== null && _d !== void 0 ? _d : (_e = att.url.split("/").pop()) === null || _e === void 0 ? void 0 : _e.split("?")[0]) !== null && _f !== void 0 ? _f : undefined,
                    };
                })) !== null && _c !== void 0 ? _c : [];
                const payload = {
                    id: message.id,
                    room: msg.room,
                    text: (_d = message.content) !== null && _d !== void 0 ? _d : msg.text,
                    senderId: userId,
                    createdAt: message.createdAt.toISOString(),
                    conversationId: meta.conversationId,
                    attachments: mappedAttachments,
                };
                io.to(msg.room).emit("chat:message", payload);
                socket.emit("chat:delivered", [payload.id]);
            }
            catch (error) {
                socket.emit("chat:error", {
                    room: msg.room,
                    message: error instanceof Error ? error.message : "Failed to send message",
                });
            }
        });
        socket.on("chat:markDelivered", (input) => {
            const ids = extractIds(input);
            if (!ids.length)
                return;
            const explicitRoom = extractRoom(input);
            const targetRooms = new Set();
            if (explicitRoom)
                targetRooms.add(explicitRoom);
            else {
                for (const room of socket.rooms) {
                    if (room === socket.id)
                        continue;
                    targetRooms.add(room);
                }
            }
            for (const room of targetRooms) {
                socket.to(room).emit("chat:delivered", ids);
            }
        });
        socket.on("chat:markRead", async (input) => {
            var _a, _b;
            const ids = extractIds(input);
            if (!ids.length)
                return;
            const data = getRuntimeData(socket);
            const userId = data.userId;
            if (!userId)
                return;
            try {
                const { conversationIds } = await markMessagesRead(userId, ids);
                const explicitRoom = extractRoom(input);
                const roomsToNotify = new Set();
                if (explicitRoom) {
                    roomsToNotify.add(explicitRoom);
                }
                else {
                    for (const [room, meta] of Object.entries((_a = data.roomsMeta) !== null && _a !== void 0 ? _a : {})) {
                        if (conversationIds.has(meta.conversationId)) {
                            roomsToNotify.add(room);
                        }
                    }
                    if (!roomsToNotify.size) {
                        for (const room of socket.rooms) {
                            if (room === socket.id)
                                continue;
                            roomsToNotify.add(room);
                        }
                    }
                }
                for (const room of roomsToNotify) {
                    socket.to(room).emit("chat:read", ids);
                }
            }
            catch (error) {
                socket.emit("chat:error", {
                    room: (_b = extractRoom(input)) !== null && _b !== void 0 ? _b : "",
                    message: error instanceof Error ? error.message : "Failed to mark read",
                });
            }
        });
        socket.on("typing:start", async (room) => {
            try {
                await ensureJoinedRoom(socket, room);
                socket.to(room).emit("typing:update", { room, typing: true });
            }
            catch {
                /* ignore */
            }
        });
        socket.on("typing:stop", async (room) => {
            try {
                await ensureJoinedRoom(socket, room);
                socket.to(room).emit("typing:update", { room, typing: false });
            }
            catch {
                /* ignore */
            }
        });
        socket.on("presence:ping", () => {
            for (const room of socket.rooms) {
                if (room === socket.id)
                    continue;
                broadcastPresence(io, room, true, socket.id);
            }
        });
        socket.on("disconnect", () => {
            for (const room of socket.rooms) {
                if (room === socket.id)
                    continue;
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
            }
            else {
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
        console.log(`> Ready on http://${hostname}:${port}  (NODE_ENV=${process.env.NODE_ENV})`);
    });
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
