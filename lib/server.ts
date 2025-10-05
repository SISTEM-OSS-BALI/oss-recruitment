// server.ts
import http from "http";
import next from "next";
import { Server } from "socket.io";

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

  io.on("connection", (socket) => {
    socket.on("room:join", (room: string) => {
      socket.join(room);
      trackJoin(room, socket.id);
      broadcastPresence(io, room, true, socket.id);
      socket.emit("room:joined", room);
    });

    socket.on("chat:send", (msg: ChatPayload) => {
      io.to(msg.room).emit("chat:message", msg);
      socket.emit("chat:delivered", [msg.id]);
    });

    socket.on(
      "chat:markDelivered",
      (ids: string[] | { room: string; ids: string[] }) => {
        const list = Array.isArray(ids) ? ids : ids.ids;
        for (const room of socket.rooms) {
          if (room === socket.id) continue;
          socket.to(room).emit("chat:delivered", list);
        }
      }
    );

    socket.on(
      "chat:markRead",
      (ids: string[] | { room: string; ids: string[] }) => {
        const list = Array.isArray(ids) ? ids : ids.ids;
        for (const room of socket.rooms) {
          if (room === socket.id) continue;
          socket.to(room).emit("chat:read", list);
        }
      }
    );

    socket.on("typing:start", (room: string) => {
      socket.to(room).emit("typing:update", { room, typing: true });
    });
    socket.on("typing:stop", (room: string) => {
      socket.to(room).emit("typing:update", { room, typing: false });
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
