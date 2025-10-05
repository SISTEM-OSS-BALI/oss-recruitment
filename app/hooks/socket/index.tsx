"use client";

import { io, Socket } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { ChatPayload } from "@/app/utils/socket-type";

// Event minimal yang kita pakai


type ServerToClientEvents = {
  "chat:message": (msg: ChatPayload) => void;
  "chat:delivered": (ids: string[]) => void;
  "chat:read": (ids: string[]) => void;
  "presence:update": (online: boolean) => void;
  "typing:update": (p: { room: string; typing: boolean }) => void;
};

type ClientToServerEvents = {
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

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

let socketSingleton: Socket<ServerToClientEvents, ClientToServerEvents> | null =
  null;

export function useSocket() {
  const [, force] = useState(0);
  const ref = useRef(socketSingleton);

  useEffect(() => {
    if (!ref.current) {
      ref.current = io(SOCKET_URL, {
        withCredentials: true,
        transports: ["websocket"], // boleh dihapus kalau ingin fallback polling
      });
      socketSingleton = ref.current;

      ref.current.on("connect", () => force((x) => x + 1));
      ref.current.on("disconnect", () => force((x) => x + 1));
    }
  }, []);

  return ref.current!;
}
