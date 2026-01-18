/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Input,
  List,
  Row,
  Select,
  Skeleton,
  Tag,
  Typography,
  Upload,
  message as antdMessage,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { RecruitmentStage } from "@prisma/client";
import {
  PaperClipOutlined,
  DownloadOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useJobs } from "@/app/hooks/job";
import { useConversations } from "@/app/hooks/conversation";
import type { ConversationDataModel } from "@/app/models/conversation";
import { useAuth } from "@/app/utils/useAuth";
import { useSocket } from "@/app/hooks/socket";
import { ChatPayload } from "@/app/utils/socket-type";
import { useQueryClient } from "@tanstack/react-query";
import type { RcFile, UploadFile } from "antd/es/upload/interface";
import { uploadChatFiles } from "@/app/vendor/chat-upload";

dayjs.extend(relativeTime);

type ConversationItem = ConversationDataModel;

type ChatMessage = {
  id: string;
  content: string | null;
  createdAt: string;
  type: string;
  senderId: string;
  sender?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  attachments?: MessageAttachment[];
};

type MessageAttachment = {
  id: string;
  name: string;
  url: string;
  mimeType?: string;
  size?: number;
};

type RawAttachment = {
  url: string;
  name?: string | null;
  mimeType?: string | null;
  size?: number | null;
};

const generateId = () =>
  typeof window !== "undefined" &&
  window.crypto &&
  "randomUUID" in window.crypto
    ? window.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const buildRoomId = (applicantId?: string | null) =>
  applicantId ? `recruitment:${applicantId}` : null;

const mapAttachments = (
  messageId: string,
  attachments?: RawAttachment[]
): MessageAttachment[] =>
  (attachments ?? []).map((att, idx) => ({
    id: `${messageId}-att-${idx}`,
    name: att.name ?? att.url.split("/").pop()?.split("?")[0] ?? "Attachment",
    url: att.url,
    mimeType: att.mimeType ?? undefined,
    size: att.size ?? undefined,
  }));

function AttachmentPreview({
  attachment,
  align,
}: {
  attachment: MessageAttachment;
  align: "left" | "right";
}) {
  const isImage = (attachment.mimeType ?? "").startsWith("image/");
  const downloadName = attachment.name.replace(/\s+/g, "_");

  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: align === "right" ? "flex-end" : "flex-start",
        gap: 6,
        maxWidth: 280,
      }}
    >
      <a
        href={attachment.url}
        target="_blank"
        rel="noreferrer"
        download={downloadName}
        style={{
          display: "inline-block",
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid #f0f0f0",
          maxWidth: "100%",
        }}
      >
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={attachment.url}
            alt={attachment.name}
            style={{ display: "block", width: "100%", height: "auto" }}
          />
        ) : (
          <Flex
            align="center"
            gap={8}
            style={{
              padding: "8px 12px",
              background: align === "right" ? "#f5f5f5" : "#fff",
            }}
          >
            <PaperClipOutlined />
            <span style={{ fontSize: 12 }}>{attachment.name}</span>
          </Flex>
        )}
      </a>
      <Button
        size="small"
        icon={<DownloadOutlined />}
        href={attachment.url}
        target="_blank"
        rel="noreferrer"
        download={downloadName}
      >
        Download
      </Button>
    </div>
  );
}

export default function ChatContent() {
  const { data: jobs } = useJobs({});
  const { user_id, user_name } = useAuth();
  const currentUser = useMemo(() => {
    if (!user_id) return null;
    return { id: user_id, name: user_name ?? "Admin" };
  }, [user_id, user_name]);
  const socket = useSocket(
    currentUser ? { userId: currentUser.id } : undefined
  );
  const queryClient = useQueryClient();

  const [jobFilter, setJobFilter] = useState<string | undefined>(undefined);
  const [stageFilter, setStageFilter] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (jobFilter) params.append("job_id", jobFilter);
    stageFilter.forEach((stage) => params.append("stage", stage));
    if (search.trim()) params.append("search", search.trim());
    const str = params.toString();
    return str.length ? str : undefined;
  }, [jobFilter, stageFilter, search]);
  const queryKeyRef = useRef(queryString);
  useEffect(() => {
    queryKeyRef.current = queryString;
  }, [queryString]);

  const { data: conversationData = [], fetchLoading } = useConversations({
    queryString,
  });

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [composer, setComposer] = useState("");
  const [sending, setSending] = useState(false);
  const readAckRef = useRef<Set<string>>(new Set());
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const stageOptions = useMemo(
    () =>
      Object.values(RecruitmentStage).map((stage) => ({
        value: stage,
        label: stage.replace(/_/g, " "),
      })),
    []
  );

  const jobOptions = useMemo(
    () =>
      (jobs ?? []).map((job) => ({
        label: job.job_title ?? job.job_role ?? "Untitled Job",
        value: job.id,
      })),
    [jobs]
  );

  useEffect(() => {
    if (!conversationData.length) {
      setSelectedConversationId(null);
      return;
    }
    if (
      !selectedConversationId ||
      !conversationData.some((conv) => conv.id === selectedConversationId)
    ) {
      setSelectedConversationId(conversationData[0].id);
    }
  }, [conversationData, selectedConversationId]);
  useEffect(() => {
    setFileList([]);
  }, [selectedConversationId]);

  const selectedConversation = useMemo(
    () =>
      conversationData.find((conv) => conv.id === selectedConversationId) ??
      null,
    [conversationData, selectedConversationId]
  );

  const roomId = useMemo(
    () => buildRoomId(selectedConversation?.applicant?.id),
    [selectedConversation]
  );

  const invalidateConversations = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["conversations", queryKeyRef.current],
    });
  }, [queryClient]);

  const fetchMessages = useCallback(
    async (conversation: ConversationItem | null) => {
      if (!conversation) {
        setMessages([]);
        setActiveConversationId(null);
        readAckRef.current.clear();
        return;
      }
      setMessagesLoading(true);
      try {
        const { data } = await axios.get("/api/chat/messages", {
          params: { conversationId: conversation.id },
        });
        const history: ChatMessage[] =
          data.result?.messages?.map((msg: any) => ({
            id: msg.id,
            content: msg.content ?? "",
            createdAt: msg.createdAt,
            type: msg.type,
            senderId: msg.senderId,
            sender: msg.sender ?? null,
            attachments: mapAttachments(msg.id, msg.attachments),
          })) ?? [];
        history.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(history);
        setActiveConversationId(data.result?.conversationId ?? conversation.id);
        readAckRef.current.clear();
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        setMessages([]);
      } finally {
        setMessagesLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchMessages(selectedConversation);
  }, [selectedConversation, fetchMessages]);

  useEffect(() => {
    if (!socket || !roomId) return;
    socket.emit("room:join", roomId);
    socket.emit("presence:ping");
  }, [socket, roomId]);

  const handleSelectConversation = (item: ConversationItem) => {
    setSelectedConversationId(item.id);
  };

  const handleIncomingMessage = useCallback(
    (payload: ChatPayload) => {
      if (!roomId || payload.room !== roomId) return;
      setActiveConversationId((prev) => prev ?? payload.conversationId ?? prev);
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === payload.id)) return prev;
        const senderName =
          payload.senderId === selectedConversation?.applicant?.user?.id
            ? selectedConversation?.applicant?.user?.name ?? "Candidate"
            : currentUser?.name ?? "Admin";
        return [
          ...prev,
          {
            id: payload.id,
            content: payload.text ?? "",
            createdAt: payload.createdAt,
            type: "TEXT",
            senderId: payload.senderId,
            sender: {
              id: payload.senderId,
              name: senderName,
              email: null,
            },
            attachments: mapAttachments(payload.id, payload.attachments),
          },
        ];
      });
      invalidateConversations();
    },
    [roomId, currentUser, selectedConversation, invalidateConversations]
  );

  useEffect(() => {
    if (!socket || !currentUser) return;
    socket.on("chat:message", handleIncomingMessage);
    const handleRoomJoined = ({
      room,
      conversationId,
    }: {
      room: string;
      conversationId: string;
    }) => {
      if (room === roomId) {
        setActiveConversationId(conversationId);
      }
    };
    socket.on("room:joined", handleRoomJoined);
    return () => {
      socket.off("chat:message", handleIncomingMessage);
      socket.off("room:joined", handleRoomJoined);
    };
  }, [socket, currentUser, handleIncomingMessage, roomId]);

  useEffect(() => {
    if (!socket || !roomId || !selectedConversation) return;
    const candidateId = selectedConversation.applicant?.user?.id;
    if (!candidateId) return;
    const newIds = messages
      .filter((msg) => msg.senderId === candidateId)
      .map((msg) => msg.id)
      .filter((id) => !readAckRef.current.has(id));
    if (!newIds.length) return;
    newIds.forEach((id) => readAckRef.current.add(id));
    socket.emit("chat:markRead", { room: roomId, ids: newIds });
  }, [messages, socket, roomId, selectedConversation]);

  const handleSendMessage = async () => {
    const text = composer.trim();
    const filesToUpload = fileList
      .map((file) => file.originFileObj)
      .filter((file): file is RcFile => Boolean(file));
    if (
      (!text && filesToUpload.length === 0) ||
      !currentUser ||
      !socket ||
      !roomId ||
      !selectedConversation
    ) {
      return;
    }
    setSending(true);
    const id = generateId();
    const now = new Date().toISOString();
    const uploadFolder =
      selectedConversation.applicant?.id ??
      activeConversationId ??
      selectedConversation.id ??
      currentUser.id ??
      "chat";

    const optimistic: ChatMessage = {
      id,
      content: text,
      createdAt: now,
      type: "TEXT",
      senderId: currentUser.id,
      sender: {
        id: currentUser.id,
        name: currentUser.name ?? "Admin",
        email: null,
      },
    };

    try {
      const uploaded = filesToUpload.length
        ? await uploadChatFiles(filesToUpload, {
            folder: `recruitment-${uploadFolder}`,
          })
        : [];

      const attachmentsForState = mapAttachments(
        id,
        uploaded.map((file) => ({
          url: file.url,
          name: file.name,
          mimeType: file.mimeType,
          size: file.size,
        }))
      );

      const optimisticMessage: ChatMessage = {
        ...optimistic,
        attachments: attachmentsForState.length
          ? attachmentsForState
          : undefined,
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      setComposer("");
      if (fileList.length) {
        setFileList([]);
      }

      const payload: ChatPayload = {
        id,
        room: roomId,
        text,
        senderId: currentUser.id,
        createdAt: now,
        conversationId: activeConversationId ?? selectedConversation.id,
        attachments: uploaded.map((file) => ({
          url: file.url,
          name: file.name,
          mimeType: file.mimeType,
          size: file.size,
        })),
      };

      socket.emit("chat:send", payload);
      invalidateConversations();
    } catch (error) {
      antdMessage.error(
        error instanceof Error
          ? error.message
          : "Failed to send message. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const renderConversationMeta = (item: ConversationItem) => {
    const applicantName = item.applicant?.user?.name ?? "Unknown Candidate";
    const jobTitle =
      item.applicant?.job?.job_title ??
      item.applicant?.job?.job_role ??
      "No job assigned";
    const lastMessage = item.messages?.[0];
    const lastSnippet =
      lastMessage?.content ??
      (lastMessage?.type === "IMAGE"
        ? "Shared an image"
        : lastMessage?.type === "FILE"
        ? "Shared a file"
        : "No messages yet");

    const lastTime = lastMessage?.createdAt
      ? dayjs(lastMessage.createdAt).fromNow()
      : dayjs(item.updatedAt).fromNow();

    const isActive = selectedConversation?.id === item.id;

    return (
      <List.Item
        onClick={() => handleSelectConversation(item)}
        style={{
          cursor: "pointer",
          borderRadius: 16,
          padding: 16,
          margin: "8px 16px",
          border: isActive
            ? "1px solid rgba(22,119,255,0.45)"
            : "1px solid #e8eef6",
          background: isActive
            ? "linear-gradient(135deg, rgba(22,119,255,0.1), rgba(22,119,255,0.02))"
            : "#fff",
          boxShadow: isActive
            ? "0 16px 35px rgba(22,119,255,0.18)"
            : "0 6px 18px rgba(15,23,42,0.06)",
          transition: "all 0.2s ease",
        }}
      >
        <List.Item.Meta
          avatar={
            <Avatar
              style={{
                background: "linear-gradient(135deg,#1677ff,#69b1ff)",
                fontWeight: 600,
              }}
            >
              {applicantName.slice(0, 1).toUpperCase()}
            </Avatar>
          }
          title={
            <Flex gap={8} align="center">
              <Typography.Text strong style={{ fontSize: 15 }}>
                {applicantName}
              </Typography.Text>
              {item.applicant?.stage && (
                <Tag
                  color="blue"
                  style={{ borderRadius: 999, padding: "0 10px" }}
                >
                  {item.applicant.stage.replace(/_/g, " ")}
                </Tag>
              )}
            </Flex>
          }
          description={
            <div>
              <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                {jobTitle}
              </Typography.Text>
              <div style={{ marginTop: 4, color: "#5c5f66", fontSize: 13 }}>
                {lastSnippet}
              </div>
            </div>
          }
        />

        <Typography.Text type="secondary" style={{ fontSize: 12}}>
          {lastTime}
        </Typography.Text>
      </List.Item>
    );
  };

  const renderMessages = () => {
    if (!selectedConversation) {
      return <Empty description="Select a conversation to view messages" />;
    }

    if (messagesLoading) {
      return <Skeleton active paragraph={{ rows: 6 }} />;
    }

    if (messages.length === 0) {
      return <Empty description="No messages yet" />;
    }

    const candidateId = selectedConversation.applicant?.user?.id;

    return (
      <div style={{ padding: "12px 8px" }}>
        {messages.map((msg) => {
          const fromCandidate = msg.senderId === candidateId;
          const displayName = fromCandidate
            ? selectedConversation.applicant?.user?.name ??
              msg.sender?.name ??
              "Candidate"
            : currentUser?.name ?? msg.sender?.name ?? "Admin";
          return (
            <Flex
              key={msg.id}
              justify={fromCandidate ? "flex-start" : "flex-end"}
              style={{ marginBottom: 12 }}
            >
              <div
                style={{
                  maxWidth: "75%",
                  background: fromCandidate
                    ? "#fff"
                    : "linear-gradient(135deg,#1677ff,#69b1ff)",
                  color: fromCandidate ? "#1f1f1f" : "#fff",
                  padding: "12px 18px",
                  borderRadius: 20,
                  borderTopLeftRadius: fromCandidate ? 6 : 20,
                  borderTopRightRadius: fromCandidate ? 20 : 6,
                  boxShadow: "0 10px 30px rgba(15,23,42,0.1)",
                  border: fromCandidate ? "1px solid #f1f5f9" : "none",
                }}
              >
                <Flex
                  justify="space-between"
                  align="baseline"
                  style={{ marginBottom: 6 }}
                >
                  <Typography.Text
                    strong
                    style={{
                      color: fromCandidate ? "#0f172a" : "#fff",
                      fontSize: 13,
                    }}
                  >
                    {displayName}
                  </Typography.Text>
                  <Typography.Text
                    type="secondary"
                    style={{
                      fontSize: 11,
                      color: fromCandidate
                        ? "#94a3b8"
                        : "rgba(255,255,255,0.7)",
                      marginLeft: 12,
                    }}
                  >
                    
                    {dayjs(msg.createdAt).format("DD MMM YYYY • HH:mm")}
                  </Typography.Text>
                </Flex>
                {msg.content?.trim() ? (
                  <Typography.Paragraph
                    style={{
                      margin: 0,
                      color: fromCandidate ? "#1f2937" : "#fff",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {msg.content}
                  </Typography.Paragraph>
                ) : !msg.attachments?.length ? (
                  <Typography.Text
                    italic
                    style={{ color: fromCandidate ? "#94a3b8" : "#e0eaff" }}
                  >
                    {msg.type === "IMAGE"
                      ? "Shared an image"
                      : msg.type === "FILE"
                      ? "Shared a file"
                      : "No text content"}
                  </Typography.Text>
                ) : null}
                {msg.attachments?.length ? (
                  <Flex gap={12} wrap style={{ marginTop: 10 }}>
                    {msg.attachments.map((attachment) => (
                      <AttachmentPreview
                        key={attachment.id}
                        attachment={attachment}
                        align={fromCandidate ? "left" : "right"}
                      />
                    ))}
                  </Flex>
                ) : null}
              </div>
            </Flex>
          );
        })}
      </div>
    );
  };

  return (
    <div
      style={{
        padding: 24,
        minHeight: "calc(100vh - 160px)",
        // background: "linear-gradient(180deg,#f6f8ff 0%,#fff 60%)",
      }}
    >
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <div>
          <Typography.Title level={3} style={{ marginBottom: 0 }}>
            Candidate Chat
          </Typography.Title>
          <Typography.Text type="secondary">
            Review all chat and filter by job or recruitment stage.
          </Typography.Text>
        </div>
      </Flex>

      <Card
        style={{
          marginBottom: 16,
          borderRadius: 20,
          border: "1px solid #e7ecf5",
          boxShadow: "0 25px 50px rgba(15,23,42,0.05)",
        }}
        bodyStyle={{ padding: 20 }}
      >
        <Row gutter={[12, 12]}>
          <Col xs={24} md={8}>
            <Select
              allowClear
              placeholder="Filter by job"
              options={jobOptions}
              value={jobFilter}
              onChange={setJobFilter}
              style={{ width: "100%" }}
              size="large"
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              mode="multiple"
              placeholder="Filter by stage"
              options={stageOptions}
              value={stageFilter}
              onChange={setStageFilter}
              style={{ width: "100%" }}
              size="large"
              maxTagCount="responsive"
            />
          </Col>
          <Col xs={24} md={8}>
            <Input.Search
              placeholder="Search candidate or job"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              size="large"
            />
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Card
            title="Conversations"
            bodyStyle={{ padding: 0 }}
            style={{
              borderRadius: 24,
              overflow: "hidden",
              height: "72vh",
              border: "1px solid #e7ecf5",
              boxShadow: "0 25px 50px rgba(15,23,42,0.08)",
            }}
          >
            {fetchLoading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : conversationData.length === 0 ? (
              <Empty
                description="No conversations found"
                style={{ margin: 24 }}
              />
            ) : (
              <List
                dataSource={conversationData}
                renderItem={renderConversationMeta}
                style={{ maxHeight: "70vh", overflowY: "auto" }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card
            title={
              <Flex align="center" justify="space-between">
                <Flex align="center" gap={12}>
                  <Avatar
                    size={48}
                    style={{
                      background: "linear-gradient(135deg,#1677ff,#69b1ff)",
                      fontWeight: 600,
                      fontSize: 20,
                    }}
                  >
                    {(
                      selectedConversation?.applicant?.user?.name ??
                      selectedConversation?.title ??
                      "Conversation"
                    )
                      .slice(0, 1)
                      .toUpperCase()}
                  </Avatar>
                  <div>
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      {selectedConversation?.applicant?.user?.name ??
                        selectedConversation?.title ??
                        "Conversation"}
                    </Typography.Title>
                    <Typography.Text type="secondary">
                      {selectedConversation?.applicant?.job?.job_title ??
                        "No job assigned"}
                    </Typography.Text>
                  </div>
                </Flex>
                {selectedConversation?.applicant?.stage && (
                  <Tag
                    color="blue"
                    style={{ borderRadius: 999, padding: "4px 16px" }}
                  >
                    {selectedConversation.applicant.stage.replace(/_/g, " ")}
                  </Tag>
                )}
              </Flex>
            }
            style={{
              borderRadius: 24,
              height: "72vh",
              border: "1px solid #e7ecf5",
              boxShadow: "0 25px 50px rgba(15,23,42,0.08)",
            }}
            bodyStyle={{
              height: "calc(72vh - 56px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "0 12px",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              {renderMessages()}
            </div>
            <div style={{ paddingTop: 12 }}>
              <Flex gap={10} align="flex-end">
                <div style={{ flex: 1 }}>
                  <Input.TextArea
                    value={composer}
                    onChange={(e) => setComposer(e.target.value)}
                    placeholder="Type a message..."
                    autoSize={{ minRows: 3, maxRows: 4 }}
                    onKeyDown={handleComposerKeyDown}
                    disabled={!currentUser || !roomId}
                  />
                  {fileList.length > 0 && (
                    <Flex gap={8} wrap style={{ marginTop: 8 }}>
                      {fileList.map((file) => (
                        <Tag
                          key={file.uid}
                          closable
                          onClose={() =>
                            setFileList((prev) =>
                              prev.filter((item) => item.uid !== file.uid)
                            )
                          }
                        >
                          {file.name}
                        </Tag>
                      ))}
                    </Flex>
                  )}
                </div>
                <Upload
                  multiple
                  fileList={fileList}
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={({ fileList: newList }) => setFileList(newList)}
                >
                  <Button
                    icon={<PaperClipOutlined />}
                    shape="circle"
                    disabled={!currentUser || !roomId}
                  />
                </Upload>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  shape="circle"
                  onClick={handleSendMessage}
                  disabled={
                    !currentUser ||
                    !roomId ||
                    (!composer.trim() &&
                      !fileList.some((file) => !!file.originFileObj))
                  }
                  loading={sending}
                />
              </Flex>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
