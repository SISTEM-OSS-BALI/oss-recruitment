"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type {
  ClientToServerSocketEvents,
  ServerToClientSocketEvents,
} from "@/app/utils/socket-type";

type SocketAuth = {
  userId?: string;
  token?: string;
};

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

type SocketCache = {
  instance: Socket<ServerToClientSocketEvents, ClientToServerSocketEvents>;
  authKey: string;
};

let socketCache: SocketCache | null = null;

const normalizeAuth = (auth?: SocketAuth) => {
  if (!auth) return null;
  const userId =
    typeof auth.userId === "string" ? auth.userId.trim() : undefined;
  if (!userId) return null;
  return { ...auth, userId };
};

export function useSocket(auth?: SocketAuth) {
  const normalizedAuth = useMemo(() => normalizeAuth(auth), [auth]);
  const authKey = useMemo(
    () => JSON.stringify(normalizedAuth ?? {}),
    [normalizedAuth]
  );
  const [, force] = useState(0);
  const ref = useRef<
    Socket<ServerToClientSocketEvents, ClientToServerSocketEvents> | null
  >(socketCache?.instance ?? null);

  useEffect(() => {
    if (!normalizedAuth) {
      // Jangan buka koneksi saat belum ada identitas pengguna
      ref.current = null;
      if (socketCache?.instance && socketCache.authKey !== authKey) {
        socketCache.instance.disconnect();
        socketCache = null;
      }
      return;
    }

    if (socketCache && socketCache.authKey === authKey) {
      ref.current = socketCache.instance;
      return;
    }

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"],
      auth: normalizedAuth,
    }) as Socket<
      ServerToClientSocketEvents,
      ClientToServerSocketEvents
    >;

    const handleStatusChange = () => force((x) => x + 1);

    socket.on("connect", handleStatusChange);
    socket.on("disconnect", handleStatusChange);

    if (socketCache?.instance && socketCache.authKey !== authKey) {
      socketCache.instance.disconnect();
    }

    socketCache = { instance: socket, authKey };
    ref.current = socket;
    force((x) => x + 1);

    return () => {
      socket.off("connect", handleStatusChange);
      socket.off("disconnect", handleStatusChange);
    };
  }, [authKey, normalizedAuth]);

  return ref.current;
}
