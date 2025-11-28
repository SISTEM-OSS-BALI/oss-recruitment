import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  Space,
  Tag,
  Typography,
  message as antdMessage,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { RecruitmentStage } from "@prisma/client";
import { useJobs } from "@/app/hooks/job";
import { useConversations } from "@/app/hooks/conversation";
import type { ConversationDataModel } from "@/app/models/conversation";
import { useAuth } from "@/app/utils/useAuth";
import { useSocket } from "@/app/hooks/socket";
import { ChatPayload } from "@/app/utils/socket-type";
import { useQueryClient } from "@tanstack/react-query";

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
};

const generateId = () =>
  typeof window !== "undefined" &&
  window.crypto &&
  "randomUUID" in window.crypto
    ? window.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const buildRoomId = (applicantId?: string | null) =>
  applicantId ? `recruitment:${applicantId}` : null;

export default function ChatContent() {
  const { data: jobs } = useJobs({});
  const { user_id, user_name } = useAuth();
  const currentUser = useMemo(() => {
    if (!user_id) return null;
    return { id: user_id, name: user_name ?? "Admin" };
  }, [user_id, user_name]);
  const socket = useSocket(currentUser ? { userId: currentUser.id } : undefined);
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
        label: job.job_title ?? job.name ?? "Untitled Job",
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
          })) ?? [];
        history.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(history);
        setActiveConversationId(
          data.result?.conversationId ?? conversation.id
        );
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
      setActiveConversationId(
        (prev) => prev ?? payload.conversationId ?? prev
      );
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
              email: undefined,
            },
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
    if (!text || !currentUser || !socket || !roomId || !selectedConversation) {
      return;
    }
    setSending(true);
    const id = generateId();
    const now = new Date().toISOString();

    const optimistic: ChatMessage = {
      id,
      content: text,
      createdAt: now,
      type: "TEXT",
      senderId: currentUser.id,
      sender: {
        id: currentUser.id,
        name: currentUser.name ?? "Admin",
        email: undefined,
      },
    };
    setMessages((prev) => [...prev, optimistic]);
    setComposer("");

    const payload: ChatPayload = {
      id,
      room: roomId,
      text,
      senderId: currentUser.id,
      createdAt: now,
      conversationId: activeConversationId ?? selectedConversation.id,
    };

    try {
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

  const handleComposerKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>
  ) => {
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

    return (
      <List.Item
        onClick={() => handleSelectConversation(item)}
        style={{
          cursor: "pointer",
          borderRadius: 12,
          padding: 16,
          border:
            selectedConversation?.id === item.id
              ? "1px solid #1677ff"
              : "1px solid #f0f0f0",
          background:
            selectedConversation?.id === item.id ? "#f0f7ff" : "#fff",
        }}
      >
        <List.Item.Meta
          avatar={
            <Avatar style={{ backgroundColor: "#1677ff" }}>
              {applicantName.slice(0, 1).toUpperCase()}
            </Avatar>
          }
          title={
            <Space>
              <Typography.Text strong>{applicantName}</Typography.Text>
              {item.applicant?.stage && (
                <Tag color="blue">
                  {item.applicant.stage.replace(/_/g, " ")}
                </Tag>
              )}
            </Space>
          }
          description={
            <div>
              <Typography.Text type="secondary">{jobTitle}</Typography.Text>
              <div style={{ marginTop: 4, color: "#555" }}>{lastSnippet}</div>
            </div>
          }
        />
        <Typography.Text type="secondary">{lastTime}</Typography.Text>
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
      <List
        dataSource={messages}
        renderItem={(msg) => {
          const fromCandidate = msg.senderId === candidateId;
          const displayName = fromCandidate
            ? selectedConversation.applicant?.user?.name ??
              msg.sender?.name ??
              "Candidate"
            : currentUser?.name ?? msg.sender?.name ?? "Admin";
          return (
            <List.Item
              key={msg.id}
              style={{
                justifyContent: fromCandidate ? "flex-start" : "flex-end",
              }}
            >
              <Card
                style={{
                  maxWidth: "80%",
                  borderRadius: 16,
                  background: fromCandidate ? "#ffffff" : "#e6f4ff",
                  border: fromCandidate
                    ? "1px solid #f0f0f0"
                    : "1px solid #b3daff",
                }}
              >
                <Space
                  direction="vertical"
                  style={{ width: "100%", gap: 4 }}
                >
                  <Space
                    align="baseline"
                    style={{
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <Typography.Text strong>{displayName}</Typography.Text>
                    <Typography.Text
                      type="secondary"
                      style={{ fontSize: 12 }}
                    >
                      {dayjs(msg.createdAt).format("DD MMM YYYY • HH:mm")}
                    </Typography.Text>
                  </Space>
                  <Typography.Text style={{ whiteSpace: "pre-line" }}>
                    {msg.content || (
                      <em>
                        {msg.type === "IMAGE"
                          ? "Shared an image"
                          : msg.type === "FILE"
                          ? "Shared a file"
                          : "No text content"}
                      </em>
                    )}
                  </Typography.Text>
                </Space>
              </Card>
            </List.Item>
          );
        }}
      />
    );
  };

  return (
    <div style={{ padding: 24 }}>
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

      <Card style={{ marginBottom: 16 }}>
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
            style={{ borderRadius: 16, overflow: "hidden", height: "70vh" }}
          >
            {fetchLoading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : conversationData.length === 0 ? (
              <Empty description="No conversations found" style={{ margin: 24 }} />
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
              selectedConversation?.applicant?.user?.name ??
              selectedConversation?.title ??
              "Conversation"
            }
            extra={
              selectedConversation?.applicant?.stage && (
                <Tag color="blue">
                  {selectedConversation.applicant.stage.replace(/_/g, " ")}
                </Tag>
              )
            }
            style={{ borderRadius: 16, height: "70vh" }}
            bodyStyle={{
              height: "calc(70vh - 56px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ flex: 1, overflowY: "auto", paddingRight: 8 }}>
              {renderMessages()}
            </div>
            <div style={{ marginTop: 12 }}>
              <Input.TextArea
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                placeholder="Type a message..."
                autoSize={{ minRows: 3, maxRows: 4 }}
                onKeyDown={handleComposerKeyDown}
                disabled={!currentUser || !roomId}
              />
              <Flex justify="flex-end" gap={8} style={{ marginTop: 8 }}>
                <Button
                  type="primary"
                  onClick={handleSendMessage}
                  disabled={!currentUser || !roomId || !composer.trim()}
                  loading={sending}
                >
                  Send
                </Button>
              </Flex>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
