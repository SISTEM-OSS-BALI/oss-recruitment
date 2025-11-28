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
  onTypingChange?: (typing: boolean) => void;
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

function PresenceBadge({
  online,
  typing,
}: {
  online?: boolean;
  typing?: boolean;
}) {
  const color = typing ? "#faad14" : online ? "#52c41a" : "#bfbfbf";
  const label = typing ? "Typing..." : online ? "Online" : "Offline";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 500,
        color,
        background: "rgba(255,255,255,0.15)",
        padding: "4px 10px",
        borderRadius: 999,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          display: "inline-block",
        }}
      />
      {label}
    </span>
  );
}

const typingStyleId = "chat-widget-typing-style";

function ensureTypingAnimation() {
  if (typeof document === "undefined") return;
  if (document.getElementById(typingStyleId)) return;
  const style = document.createElement("style");
  style.id = typingStyleId;
  style.innerHTML =
    "@keyframes chatTypingDots{0%,60%,100%{transform:translateY(0);opacity:.4;}30%{transform:translateY(-4px);opacity:1;}}";
  document.head.appendChild(style);
}

function TypingIndicator({
  align = "left",
  name,
}: {
  align?: "left" | "right";
  name?: string;
}) {
  useEffect(() => {
    ensureTypingAnimation();
  }, []);

  const base = align === "right" ? "flex-end" : "flex-start";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: base,
        marginTop: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          borderRadius: 12,
          background: "rgba(24, 144, 255, 0.12)",
          border: "1px solid rgba(24, 144, 255, 0.2)",
          color: "#1677ff",
          fontSize: 12,
          maxWidth: 220,
        }}
      >
        <span>{name ? `${name} is typing` : "Typing"}</span>
        <span style={{ display: "inline-flex", gap: 4 }}>
          {[0, 1, 2].map((idx) => (
            <span
              key={idx}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "currentColor",
                opacity: 0.4,
                animation: "chatTypingDots 1.2s ease-in-out infinite",
                animationDelay: `${idx * 0.15}s`,
              }}
            />
          ))}
        </span>
      </div>
    </div>
  );
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
      style={{ marginBottom: 10 }}
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
          background: isMine
            ? "linear-gradient(135deg,#1677ff 0%,#62a1ff 100%)"
            : "#ffffff",
          color: isMine ? "#fff" : "#1f1f1f",
          padding: "10px 14px",
          borderRadius: 16,
          borderTopRightRadius: isMine ? 6 : 16,
          borderTopLeftRadius: isMine ? 16 : 6,
          boxShadow: isMine
            ? "0 6px 18px rgba(22,119,255,0.22)"
            : "0 4px 16px rgba(15,23,42,0.08)",
          border: isMine
            ? "1px solid rgba(255,255,255,0.25)"
            : "1px solid #f0f0f0",
        }}
      >
        {m.text && (
          <div style={{ whiteSpace: "pre-wrap", fontSize: 14 }}>{m.text}</div>
        )}

        {m.attachments?.length ? (
          <Flex gap={8} wrap style={{ marginTop: m.text ? 10 : 0 }}>
            {m.attachments.map((a) => (
              <AttachmentPreview
                key={a.id}
                a={a}
                align={isMine ? "right" : "left"}
              />
            ))}
          </Flex>
        ) : null}

        <Flex
          gap={8}
          align="center"
          style={{ marginTop: 8, opacity: isMine ? 0.9 : 0.7 }}
        >
          <small style={{ fontSize: 11 }}>{time}</small>
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
  onTypingChange,
  placeholder = "Tulis pesan…",
  height = 560,
  allowUpload = true,
}) => {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);
  const markedReadRef = useRef<Set<string>>(new Set());
  const typingActiveRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [composerFocused, setComposerFocused] = useState(false);

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

  const emitTyping = (next: boolean) => {
    if (!onTypingChange) return;
    if (typingActiveRef.current === next) return;
    typingActiveRef.current = next;
    onTypingChange(next);
  };

  const scheduleStopTyping = () => {
    if (!onTypingChange) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTyping(false), 1200);
  };

  const handleTextChange = (value: string) => {
    setText(value);
    if (!onTypingChange) return;
    const hasContent = value.trim().length > 0 || files.length > 0;
    if (hasContent) {
      emitTyping(true);
      scheduleStopTyping();
    } else {
      emitTyping(false);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (typingActiveRef.current) emitTyping(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed && files.length === 0) return;
    try {
      await onSend({ text: trimmed, files });
      setText("");
      setFiles([]);
      emitTyping(false);
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
        border: "1px solid #e6f4ff",
        boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
      }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Header */}
      <div
        style={{
          position: "relative",
          padding: "18px 22px",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
          background: "linear-gradient(135deg,#031b4f 0%,#14448a 68%,#1677ff 100%)",
          color: "#fff",
        }}
      >
        <Flex align="center" gap={16} justify="space-between">
          <Flex align="center" gap={16}>
            <Badge
              dot={Boolean(peer.online || peer.typing)}
              color={peer.typing ? "#faad14" : peer.online ? "#52c41a" : "#bfbfbf"}
              offset={[-4, 4]}
            >
              <Avatar
                src={applicant ? applicant?.user.photo_url : peer.avatarUrl}
                size={54}
                style={{ border: "2px solid rgba(255,255,255,0.25)" }}
              >
                {(applicant ? applicant.user?.name : peer.name)?.[0]}
              </Avatar>
            </Badge>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>
                {applicant ? applicant?.user.name : peer.name}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.75)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                {applicant?.job?.job_title && (
                  <span>{applicant.job.job_title}</span>
                )}
                <PresenceBadge online={peer.online} typing={peer.typing} />
              </div>
            </div>
          </Flex>
          <div style={{ textAlign: "right", fontSize: 12, opacity: 0.75 }}>
            {applicant?.stage && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "4px 12px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.15)",
                  fontWeight: 600,
                }}
              >
                Tahap: {applicant.stage.replace(/_/g, " ")}
              </div>
            )}
          </div>
        </Flex>
      </div>

      {/* Message list */}
      <div
        ref={listRef}
        style={{
          height,
          overflowY: "auto",
          padding: "18px 20px 12px 20px",
          background: "linear-gradient(180deg,#f6f8fb 0%,#fff 60%)",
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
        {peer.typing && (
          <TypingIndicator align="left" name={peer.name} />
        )}
      </div>

      {/* Composer */}
      <div
        style={{
          borderTop: "1px solid #f0f0f0",
          padding: 14,
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
                if (onTypingChange) {
                  emitTyping(true);
                  scheduleStopTyping();
                }
                return false; // jangan upload otomatis
              }}
            >
              <Button icon={<PaperClipOutlined />} />
            </Upload>
          )}

          <div
            style={{
              flex: 1,
              border: composerFocused
                ? "1px solid #1677ff"
                : "1px solid #f0f0f0",
              borderRadius: 12,
              padding: 6,
              transition: "border 0.2s ease",
            }}
          >
            <TextArea
              autoSize={{ minRows: 1, maxRows: 5 }}
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={placeholder}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              onFocus={() => setComposerFocused(true)}
              onBlur={() => setComposerFocused(false)}
              style={{
                border: "none",
                boxShadow: "none",
                background: "transparent",
                paddingLeft: 4,
                paddingRight: 4,
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
