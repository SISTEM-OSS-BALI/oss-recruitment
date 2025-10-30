"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  Flex,
  Input,
  Tooltip,
  Upload,
  theme,
} from "antd";
import {
  SendOutlined,
  PaperClipOutlined,
  CheckOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { ApplicantDataModel } from "@/app/models/applicant";

const { TextArea } = Input;

/* ----------------------------- Types ----------------------------- */
export type ChatUser = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type ChatMessage = {
  id: string;
  text?: string;
  senderId: string;
  createdAt: string | number | Date;
  status?: "sent" | "delivered" | "read"; // untuk pesan currentUser
  attachments?: {
    id: string;
    name: string;
    url: string;
    type?: string; // "image/png" dsb
    size?: number;
  }[];
};

export type ChatWidgetProps = {
  applicant?: ApplicantDataModel;
  currentUser: ChatUser;
  peer: ChatUser & { online?: boolean; typing?: boolean };
  messages: ChatMessage[];
  loading?: boolean;
  onSend: (payload: { text: string; files: File[] }) => Promise<void> | void;
  onUpload?: (file: File) => Promise<void> | void;
  onMarkRead?: (messageIds: string[]) => void;
  placeholder?: string;
  height?: number | string;
  allowUpload?: boolean;
};

/* -------------------------- Utilities --------------------------- */
function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function dayLabel(d: Date) {
  const today = new Date();
  const y = new Date(today);
  y.setDate(today.getDate() - 1);
  if (isSameDay(d, today)) return "Hari ini";
  if (isSameDay(d, y)) return "Kemarin";
  return d.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* --------------------------- Subviews --------------------------- */
function DateDivider({ date }: { date: Date }) {
  return (
    <Divider style={{ margin: "10px 0", color: "#999" }}>
      {dayLabel(date)}
    </Divider>
  );
}

function ReadReceipt({ status }: { status?: ChatMessage["status"] }) {
  if (status === "read")
    return (
      <Tooltip title="Dibaca">
        <CheckCircleOutlined style={{ fontSize: 12 }} />
      </Tooltip>
    );
  if (status === "delivered")
    return (
      <Tooltip title="Terkirim">
        <CheckOutlined style={{ fontSize: 12 }} />
      </Tooltip>
    );
  return null;
}

function AttachmentPreview({
  a,
  align = "left",
}: {
  a: NonNullable<ChatMessage["attachments"]>[number];
  align?: "left" | "right";
}) {
  const isImage = (a.type || "").startsWith("image/");
  const displayName =
    a?.name || a.url?.split("/").pop()?.split("?")[0] || "Lampiran";
  const downloadName = displayName.replace(/\s+/g, "_");

  const downloadUrl = useMemo(() => {
    try {
      const parsed = new URL(
        a.url,
        typeof window !== "undefined" ? window.location.href : undefined
      );
      parsed.searchParams.set("download", downloadName);
      return parsed.toString();
    } catch {
      return a.url;
    }
  }, [a.url, downloadName]);

  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: align === "right" ? "flex-end" : "flex-start",
        gap: 6,
        maxWidth: 260,
      }}
    >
      <a
        href={a.url}
        target="_blank"
        rel="noreferrer"
        download={downloadName}
        style={{
          display: "inline-block",
          maxWidth: "100%",
          borderRadius: 10,
          overflow: "hidden",
          border: "1px solid #f0f0f0",
        }}
      >
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={a.url}
            alt={displayName}
            style={{ display: "block", width: "100%", height: "auto" }}
          />
        ) : (
          <Flex
            align="center"
            gap={8}
            style={{
              padding: "8px 10px",
              background: align === "right" ? "#F5F5F5" : "#fff",
            }}
          >
            <PaperClipOutlined />
            <span style={{ fontSize: 12 }}>{displayName}</span>
          </Flex>
        )}
      </a>
      <Button
        size="small"
        icon={<DownloadOutlined />}
        href={a.url}
        target="_blank"
        rel="noreferrer"
        download={downloadName}
      >
        Download
      </Button>
    </div>
  );
}

function MessageBubble({
  m,
  isMine,
  user,
}: {
  m: ChatMessage;
  isMine: boolean;
  user?: ChatUser;
}) {
  const time = formatTime(new Date(m.createdAt));
  return (
    <Flex
      justify={isMine ? "flex-end" : "flex-start"}
      style={{ marginBottom: 8 }}
    >
      {!isMine && (
        <Avatar
          src={user?.avatarUrl}
          size={32}
          style={{ marginRight: 8, alignSelf: "flex-end" }}
        >
          {user?.name?.[0]}
        </Avatar>
      )}
      <div
        style={{
          maxWidth: 520,
          background: isMine ? "#1677ff" : "#F5F5F5",
          color: isMine ? "#fff" : "#000",
          padding: "8px 12px",
          borderRadius: 14,
          borderTopRightRadius: isMine ? 4 : 14,
          borderTopLeftRadius: isMine ? 14 : 4,
          boxShadow: "0 1px 4px rgba(0,0,0,.06)",
        }}
      >
        {m.text && <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>}

        {m.attachments?.length ? (
          <Flex gap={8} wrap style={{ marginTop: m.text ? 8 : 0 }}>
            {m.attachments.map((a) => (
              <AttachmentPreview
                key={a.id}
                a={a}
                align={isMine ? "right" : "left"}
              />
            ))}
          </Flex>
        ) : null}

        <Flex gap={8} align="center" style={{ marginTop: 6, opacity: 0.8 }}>
          <small>{time}</small>
          {isMine && <ReadReceipt status={m.status} />}
        </Flex>
      </div>
    </Flex>
  );
}

/* -------------------------- Main Component -------------------------- */
const ChatWidget: React.FC<ChatWidgetProps> = ({
  applicant,
  currentUser,
  peer,
  messages,
  loading,
  onSend,
  onUpload,
  onMarkRead,
  placeholder = "Tulis pesan…",
  height = 560,
  allowUpload = true,
}) => {
  const { token } = theme.useToken();
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);
  const markedReadRef = useRef<Set<string>>(new Set());

  // Group by day untuk divider
  const grouped = useMemo(() => {
    const out: { date: Date; items: ChatMessage[] }[] = [];
    let bucket: ChatMessage[] = [];
    let curDay: Date | null = null;

    messages.forEach((m) => {
      const d = new Date(m.createdAt);
      if (!curDay || !isSameDay(curDay, d)) {
        if (bucket.length) out.push({ date: curDay!, items: bucket });
        curDay = d;
        bucket = [m];
      } else {
        bucket.push(m);
      }
    });
    if (bucket.length && curDay) out.push({ date: curDay, items: bucket });
    return out;
  }, [messages]);

  // Scroll ke bawah saat pesan berubah
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (autoScrollRef.current) {
      el.scrollTop = el.scrollHeight + 1000;
    }
  }, [messages, loading]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const handleScroll = () => {
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      autoScrollRef.current = distanceFromBottom < 80;
    };

    el.addEventListener("scroll", handleScroll);
    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Tandai read ketika ada pesan peer yang terbaru
  useEffect(() => {
    if (!onMarkRead) return;

    // bersihkan cache untuk pesan yang sudah tidak ada di list
    const existingIds = new Set(messages.map((m) => m.id));
    for (const cachedId of markedReadRef.current) {
      if (!existingIds.has(cachedId)) {
        markedReadRef.current.delete(cachedId);
      }
    }

    const unreadIds = messages
      .filter(
        (m) =>
          m.senderId !== currentUser.id &&
          !markedReadRef.current.has(m.id) &&
          m.status !== "read"
      )
      .map((m) => m.id);

    if (unreadIds.length) {
      onMarkRead(unreadIds);
      unreadIds.forEach((id) => markedReadRef.current.add(id));
    }
  }, [messages, currentUser.id, onMarkRead]);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed && files.length === 0) return;
    try {
      await onSend({ text: trimmed, files });
      setText("");
      setFiles([]);
    } catch (error) {
      // Biarkan komponen pemanggil menampilkan notifikasi error
      // Form tetap mempertahankan input & file agar user bisa retry
    }
  }

  return (
    <Card
      style={{
        width: "100%",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid #f0f0f0",
      }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #f0f0f0",
          background: "#fff",
        }}
      >
        <Flex align="center" gap={10} justify="space-between">
          <Flex align="center" gap={10}>
            <Badge dot={peer.online} color="green" offset={[-4, 4]}>
              <Avatar src={applicant ? applicant?.user.photo_url : ""}></Avatar>
            </Badge>
            <div>
              <div style={{ fontWeight: 700 }}>
                {applicant ? applicant?.user.name : "OSS Recruitment"}
              </div>
              <div style={{ fontSize: 12, color: token.colorTextTertiary }}>
                {peer.typing ? "Typing" : peer.online ? "Online" : "Offline"}
              </div>
            </div>
          </Flex>
        </Flex>
      </div>

      {/* Message list */}
      <div
        ref={listRef}
        style={{
          height,
          overflowY: "auto",
          padding: "14px 16px",
          background:
            "linear-gradient(180deg, rgba(250,250,250,1) 0%, rgba(255,255,255,1) 100%)",
        }}
        onMouseEnter={() => (autoScrollRef.current = false)}
        onMouseLeave={() => (autoScrollRef.current = true)}
      >
        {grouped.map((g) => (
          <div key={g.date.toISOString()}>
            <DateDivider date={g.date} />
            {g.items.map((m) => {
              const isMine = m.senderId === currentUser.id;
              return (
                <MessageBubble
                  key={m.id}
                  m={m}
                  isMine={isMine}
                  user={isMine ? currentUser : peer}
                />
              );
            })}
          </div>
        ))}
        {loading && (
          <Divider plain style={{ color: "#999" }}>
            Memuat…
          </Divider>
        )}
      </div>

      {/* Composer */}
      <div
        style={{
          borderTop: "1px solid #f0f0f0",
          padding: 12,
          background: "#fff",
        }}
      >
        <Flex gap={8} align="flex-end">
          {allowUpload && (
            <Upload
              multiple
              showUploadList={false}
              beforeUpload={(file) => {
                setFiles((f) => [...f, file]);
                onUpload?.(file);
                return false; // jangan upload otomatis
              }}
            >
              <Button icon={<PaperClipOutlined />} />
            </Upload>
          )}

          <div style={{ flex: 1 }}>
            <TextArea
              autoSize={{ minRows: 1, maxRows: 5 }}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={placeholder}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            {/* Preview file sederhana */}
            {files.length > 0 && (
              <Flex gap={8} wrap style={{ marginTop: 6 }}>
                {files.map((f, i) => (
                  <span
                    key={`${f.name}-${i}`}
                    style={{
                      fontSize: 12,
                      background: "#F5F5F5",
                      padding: "2px 8px",
                      borderRadius: 999,
                    }}
                  >
                    {f.name}
                  </span>
                ))}
              </Flex>
            )}
          </div>

          <Button type="primary" icon={<SendOutlined />} onClick={handleSend}>
            Kirim
          </Button>
        </Flex>
      </div>
    </Card>
  );
};

export default ChatWidget;
