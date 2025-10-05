"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Card,
  Col,
  Row,
  Space,
  Steps,
  Tag,
  Typography,
  List,
  Button,
  Tooltip,
  Descriptions,
  Divider,
} from "antd";
import {
  CheckCircleTwoTone,
  SearchOutlined,
  MessageOutlined,
  LaptopOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  CalendarOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { ApplicantDataModel } from "@/app/models/applicant";
import ResultMBTIComponent from "./ResultMBTIComponent";

const { Title, Text } = Typography;

type Props = {
  applicant: ApplicantDataModel;
  meta?: {
    screeningStartedOn?: string;
    screeningDeadline?: string;
    assignedTo?: string;
    interviewDate?: string;
    offerUrl?: string;
    rejectedReason?: string;
  };
};

const stageOrder = [
  "APPLICATION",
  "SCREENING",
  "INTERVIEW",
  "HIRED",
  "REJECTED",
] as const;

const stageLabel: Record<string, string> = {
  APPLICATION: "Application",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  HIRED: "Hired",
  REJECTED: "Rejected",
};

// ---------------- Stage Config ----------------
type ActionItem = {
  key: string;
  label: string;
  button?: {
    text: string;
    disabled?: boolean;
    tooltip?: string;
    onClick?: () => void;
  };
};

function getStageConfig(
  stage: string,
  applicant: ApplicantDataModel,
  router: ReturnType<typeof useRouter>,
  meta?: Props["meta"]
) {
  const m = meta || {};
  const startedOn =
    m.screeningStartedOn || applicant.updatedAt || applicant.createdAt;
  const deadline =
    m.screeningDeadline ||
    dayjs(applicant.createdAt).add(7, "day").toISOString();

  const mbtiUrl = applicant.mbti_test?.link_url || undefined;
  const mbtiDone = applicant.mbti_test?.is_complete === true;

  switch (stage) {
    case "APPLICATION":
      return {
        title: "Application Details",
        info: [
          {
            label: "Submitted On",
            value: dayjs(applicant.createdAt).format("MMMM D, YYYY"),
          },
          { label: "Position", value: applicant.job?.name ?? "-" },
        ],
        actions: [
          {
            key: "cv-review",
            label: "Recruiter will review your CV",
            button: {
              text: "View CV",
              onClick: () =>
                window.open(
                  applicant.user?.curiculum_vitae_url || "#",
                  "_blank"
                ),
              disabled: !applicant.user?.curiculum_vitae_url,
              tooltip: !applicant.user?.curiculum_vitae_url
                ? "No CV found"
                : "Open CV",
            },
          },
        ] as ActionItem[],
      };

    case "SCREENING":
      return {
        title: "Screening Stage Details",
        info: [
          { label: "STATUS", value: mbtiDone ? "Completed" : "In Progress" },
          { label: "DEADLINE", value: dayjs(deadline).format("MMMM D, YYYY") },
          {
            label: "STARTED ON",
            value: dayjs(startedOn).format("MMMM D, YYYY"),
          },
          { label: "ASSIGNED TO", value: m.assignedTo || "Recruitment Team" },
        ],
        actions: [
          {
            key: "mbti",
            label: "Complete MBTI Personality Test",
            button: {
              text: mbtiDone ? "Done" : "Take MBTI Test",
              disabled: mbtiDone ? true : !mbtiUrl,
              tooltip: mbtiDone
                ? "Already completed"
                : mbtiUrl
                ? "Open MBTI Test"
                : "Link unavailable",
              onClick: () => mbtiUrl && window.open(mbtiUrl, "_blank"),
            },
          },
        ] as ActionItem[],
      };

    case "INTERVIEW":
      return {
        title: "Interview Stage Details",
        info: [
          {
            label: "STATUS",
            value: m.interviewDate ? "Scheduled" : "Awaiting schedule",
          },
          {
            label: "INTERVIEW DATE",
            value: m.interviewDate
              ? dayjs(m.interviewDate).format("MMMM D, YYYY • HH:mm")
              : "-",
          },
        ],
        actions: [
          {
            key: "schedule",
            label: "Schedule interview with recruiter",
            button: {
              text: m.interviewDate ? "Reschedule" : "Schedule",
              tooltip: "Pick interview time",
              onClick: () =>
                window.open(
                  `/evaluator/schedule?applicant_id=${applicant.id}`,
                  "_blank",
                  "noopener,noreferrer"
                ),
            },
          },
          {
            key: "prep",
            label: "Read interview preparation guideline",
            button: {
              text: "Open Guide",
              onClick: () => window.open("/guide/interview", "_blank"),
            },
          },
        ] as ActionItem[],
      };

    case "HIRED":
      return {
        title: "Offer & Onboarding",
        info: [
          { label: "STATUS", value: "Hired 🎉" },
          { label: "POSITION", value: applicant.job?.name ?? "-" },
        ],
        actions: [
          {
            key: "offer",
            label: "Review and sign the offer letter",
            button: {
              text: "View Offer",
              onClick: () => m.offerUrl && window.open(m.offerUrl, "_blank"),
              disabled: !m.offerUrl,
              tooltip: m.offerUrl ? "Open Offer" : "No offer link",
            },
          },
          {
            key: "onboarding",
            label: "Complete onboarding documents",
            button: {
              text: "Open Onboarding",
              onClick: () => window.open("/onboarding", "_blank"),
            },
          },
        ] as ActionItem[],
      };

    case "REJECTED":
      return {
        title: "Application Result",
        info: [
          { label: "STATUS", value: "Rejected" },
          { label: "REASON", value: m.rejectedReason || "—" },
        ],
        actions: [
          {
            key: "feedback",
            label: "Read feedback & resources to improve",
            button: {
              text: "View Resources",
              onClick: () => window.open("/resources/improve", "_blank"),
            },
          },
        ] as ActionItem[],
      };

    default:
      return {
        title: "Information",
        info: [],
        actions: [] as ActionItem[],
      };
  }
}

// ---------------- Component ----------------
export default function CandidateProgress({ applicant, meta }: Props) {
  const router = useRouter();
  const currentStage = applicant.stage ?? "APPLICATION";
  const nowStageIndex = stageOrder.findIndex((s) => s === currentStage);
  const normalizedStageIndex = nowStageIndex === -1 ? 0 : nowStageIndex;

  const initials =
    (applicant.user?.name || "Candidate")
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "C";

  const cfg = getStageConfig(currentStage, applicant, router, meta);

  return (
    <Space direction="vertical" size={16} style={{ display: "flex" }}>
      {/* Title */}
      <Space align="center" size={8}>
        <Title level={2} style={{ margin: 0 }}>
          Apply Job Progress Tracking
        </Title>
      </Space>
      <Text type="secondary">
        Monitor candidate journey through recruitment stages
      </Text>

      {/* Header */}
      <Card style={{ borderRadius: 16 }} bodyStyle={{ padding: 20 }}>
        <Row align="middle" gutter={[16, 16]} justify="space-between">
          <Col flex="auto">
            <Space align="center" size={16}>
              <Avatar
                size={56}
                src={applicant.user?.photo_url || undefined}
                style={{ background: "#7C4DFF" }}
              >
                {initials}
              </Avatar>
              <Space direction="vertical" size={0}>
                <Title level={4} style={{ margin: 0 }}>
                  {applicant.job?.name || "Candidate"}
                </Title>
                <Text type="secondary">
                  {applicant.user?.name ? `${applicant.user.name}` : "—"} •
                  Application ID:{" "}
                  <b>#{applicant.id.toUpperCase().slice(0, 8)}</b>
                </Text>
              </Space>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                size="large"
                onClick={() =>
                  router.push(`/user/home/apply-job/${applicant.id}/chat`)
                }
              >
                <Tooltip title="Chat">
                  <MessageOutlined />
                </Tooltip>
              </Button>
              <Tag
                color="green"
                style={{ padding: "6px 12px", fontWeight: 600 }}
              >
                Current Stage:{" "}
                {stageLabel[currentStage] ?? stageLabel.APPLICATION}
              </Tag>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Steps */}
      <Card style={{ borderRadius: 16 }} bodyStyle={{ padding: 20 }}>
        <Steps
          current={normalizedStageIndex}
          responsive
          items={[
            {
              title: "Application",
              description: dayjs(applicant.createdAt).format("MMM DD, YYYY"),
              icon: <CheckCircleTwoTone twoToneColor="#52c41a" />,
              status: normalizedStageIndex >= 0 ? "finish" : "wait",
            },
            {
              title: "Screening",
              description:
                normalizedStageIndex === 1
                  ? "In Progress"
                  : normalizedStageIndex > 1
                  ? "Done"
                  : "Pending",
              icon: <SearchOutlined />,
              status:
                normalizedStageIndex >= 1
                  ? normalizedStageIndex === 1
                    ? "process"
                    : "finish"
                  : "wait",
            },
            {
              title: "Interview",
              description:
                normalizedStageIndex >= 2
                  ? normalizedStageIndex === 2
                    ? "In Progress"
                    : "Done"
                  : "Pending",
              icon: <MessageOutlined />,
              status:
                normalizedStageIndex >= 2
                  ? normalizedStageIndex === 2
                    ? "process"
                    : "finish"
                  : "wait",
            },
            {
              title: "Hired",
              description:
                normalizedStageIndex === 3 ? "In Progress" : "Pending",
              icon: <LaptopOutlined />,
              status: normalizedStageIndex >= 3 ? "process" : "wait",
            },
            {
              title: "Rejected",
              description:
                normalizedStageIndex === 4 ? "In Progress" : "Pending",
              icon: <CloseCircleOutlined />,
              status: normalizedStageIndex >= 4 ? "process" : "wait",
            },
          ]}
        />
      </Card>

      {/* Stage info */}
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <span>{cfg.title}</span>
          </Space>
        }
        style={{ borderRadius: 16 }}
        bodyStyle={{ paddingTop: 8 }}
      >
        {cfg.info.length > 0 && (
          <>
            <Descriptions bordered size="middle" column={1}>
              {cfg.info.map((i) => (
                <Descriptions.Item key={i.label} label={i.label}>
                  {i.value}
                </Descriptions.Item>
              ))}
            </Descriptions>
            <Divider />
          </>
        )}

        <Title level={5} style={{ marginTop: 0 }}>
          Required Actions
        </Title>
        <List
          size="small"
          dataSource={cfg.actions}
          renderItem={(act) => (
            <List.Item
              key={act.key}
              actions={
                act.button
                  ? [
                      <Tooltip
                        key={`${act.key}-tt`}
                        title={act.button.tooltip || act.button.text}
                      >
                        <Button
                          type="primary"
                          disabled={act.button.disabled}
                          onClick={act.button.onClick}
                          icon={
                            act.key === "schedule" ? (
                              <CalendarOutlined />
                            ) : act.key === "offer" ? (
                              <FileDoneOutlined />
                            ) : undefined
                          }
                        >
                          {act.button.text}
                        </Button>
                      </Tooltip>,
                    ]
                  : undefined
              }
              style={{ paddingLeft: 0 }}
            >
              <span>• {act.label}</span>
            </List.Item>
          )}
        />
      </Card>

      {/* Hanya tampilkan hasil MBTI di SCREENING bila sudah ada */}
      {currentStage === "SCREENING" && applicant.mbti_test?.result && (
        <Card style={{ borderRadius: 16 }}>
          <ResultMBTIComponent result={applicant.mbti_test.result} />
        </Card>
      )}
    </Space>
  );
}
