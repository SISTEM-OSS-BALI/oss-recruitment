"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Input,
  Progress,
  Row,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  ArrowRightOutlined,
  CalendarOutlined,
  EyeOutlined,
} from "@ant-design/icons";

import Loading from "@/app/components/common/custom-loading";
import { useCandidateByUserId } from "@/app/hooks/applicant";
import { useAuth } from "@/app/utils/useAuth";
import {
  PROGRESS_STAGE_ORDER,
  type ProgressStage,
  getStageLabel,
  toProgressStage,
} from "@/app/utils/recruitment-stage";
import { useMobile } from "@/app/hooks/use-mobile";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const STAGES = PROGRESS_STAGE_ORDER;

type StageFilterValue = "ALL" | "ACTIVE" | ProgressStage;
type StageFilterOption = { value: StageFilterValue; label: string };

const stageFilterOptions: StageFilterOption[] = [
  { value: "ALL", label: "All stages" },
  { value: "ACTIVE", label: "Active only" },
  ...STAGES.map((stage) => ({
    value: stage,
    label: getStageLabel(stage),
  })),
];

function stageIndex(stage?: string) {
  const progressStage = toProgressStage(stage);
  const idx = STAGES.findIndex((s) => s === progressStage);
  return idx >= 0 ? idx : 0;
}

function stagePercent(stage?: string) {
  const progressStage = toProgressStage(stage);
  const idx = stageIndex(stage);
  const total =
    progressStage === "REJECTED"
      ? STAGES.length
      : Math.max(STAGES.length - 1, 1);
  const position = Math.min(idx + 1, total);
  return Math.round((position / total) * 100);
}

export default function Content() {
  const router = useRouter();
  const { user_id } = useAuth();
  const { data: applicants, fetchLoading } = useCandidateByUserId({
    id: user_id,
  });
  const isMobile = useMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] =
    useState<StageFilterValue>("ALL");
  const summary = useMemo(() => {
    const total = applicants?.length ?? 0;
    const active = (applicants ?? []).filter(
      (app) => toProgressStage(app.stage) !== "REJECTED"
    ).length;
    return { total, active };
  }, [applicants]);

  const filteredApplicants = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return (applicants ?? []).filter((app) => {
      const stage = toProgressStage(app?.stage);
      const matchesStage =
        stageFilter === "ALL"
          ? true
          : stageFilter === "ACTIVE"
          ? stage !== "REJECTED"
          : stage === stageFilter;
      const matchesSearch = normalizedSearch
        ? [
            app?.user?.name,
            app?.job?.job_title,
            app?.id,
            app?.job?.location?.name,
          ]
            .filter(Boolean)
            .some((value) =>
              value?.toString().toLowerCase().includes(normalizedSearch)
            )
        : true;
      return matchesStage && matchesSearch;
    });
  }, [applicants, searchTerm, stageFilter]);

  if (fetchLoading) return <Loading />;
  if (!applicants?.length) return <Empty description="No application found" />;

  const goToDetail = (id: string) =>
    router.push(
      `/user/home/apply-job/detail?applicant_id=${encodeURIComponent(id)}`
    );

  return (
    <div
      style={{
        padding: isMobile ? "24px 16px 48px" : "32px 24px 64px",
        maxWidth: 1300,
        margin: "0 auto",
      }}
    >
      <Space direction="vertical" size={8} style={{ display: "flex" }}>
        <div>
          <Title level={3} style={{ margin: 0, marginBottom: 12}}>
            Your Applications
          </Title>
          <Space size={16} wrap>
            <Text type="secondary">
              {summary.total}{" "}
              {summary.total > 1 ? "applications" : "application"}
            </Text>
            <Tag color="geekblue" style={{ borderRadius: 999 }}>
              {summary.active} active
            </Tag>
            <Text type="secondary">
              Showing {filteredApplicants.length}{" "}
              {filteredApplicants.length === 1
                ? "result"
                : "results"}
            </Text>
          </Space>
        </div>
      </Space>

      <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
        <Col xs={24} md={16}>
          <Input
            allowClear
            size="large"
            placeholder="Search by candidate, job, or location"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col xs={24} md={8}>
          <Select
            size="large"
            style={{ width: "100%" }}
            value={stageFilter}
            onChange={(value) => setStageFilter(value)}
            options={stageFilterOptions}
          />
        </Col>
      </Row>

      {!filteredApplicants.length ? (
        <Card
          style={{ marginTop: 24, borderRadius: 18, borderColor: "#F1F5F9" }}
          bodyStyle={{ padding: "48px 16px" }}
        >
          <Empty description="No applications match your filters" />
        </Card>
      ) : (
        <Row gutter={isMobile ? [12, 12] : [16, 16]} style={{ marginTop: 16 }}>
          {filteredApplicants.map((app) => {
            const name = app?.user?.name || "Candidate";
            const initials =
              name
                .split(" ")
                .map((s: string) => s[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || "C";
            const jobName = app?.job?.job_title || "—";
            const created = app?.createdAt ? dayjs(app.createdAt) : null;
            const since = created ? dayjs().to(created) : "—";
            const pct = stagePercent(app?.stage ?? "");
            const progressStage = toProgressStage(app?.stage);
            const stageLabelText = getStageLabel(progressStage);
            const stageDisplayCount =
              progressStage === "REJECTED"
                ? STAGES.length
                : Math.max(STAGES.length - 1, 1);
            const stageDisplayNumber = Math.min(
              stageIndex(progressStage) + 1,
              stageDisplayCount
            );
            const appliedLabel = created ? created.format("MMM DD, YYYY") : "—";

            return (
              <Col xs={24} key={app.id}>
                <ApplicationCard
                  id={app.id}
                  name={name}
                  initials={initials}
                  jobName={jobName}
                  appliedLabel={appliedLabel}
                  since={since}
                  pct={pct}
                  stageLabelText={stageLabelText}
                  stageDisplayNumber={stageDisplayNumber}
                  stageDisplayCount={stageDisplayCount}
                  avatarUrl={app?.user?.photo_url}
                  onDetail={goToDetail}
                  isMobile={isMobile}
                />
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
}

type ApplicationCardProps = {
  id: string;
  name: string;
  initials: string;
  jobName: string;
  appliedLabel: string;
  since: string;
  pct: number;
  stageLabelText: string;
  stageDisplayNumber: number;
  stageDisplayCount: number;
  avatarUrl?: string | null;
  onDetail: (id: string) => void;
  isMobile: boolean;
};

function ApplicationCard({
  id,
  name,
  initials,
  jobName,
  appliedLabel,
  since,
  pct,
  stageLabelText,
  stageDisplayNumber,
  stageDisplayCount,
  avatarUrl,
  onDetail,
  isMobile,
}: ApplicationCardProps) {
  return (
    <Card
      hoverable
      style={{
        borderRadius: 20,
        border: "1px solid #EBEEF5",
        boxShadow: "0 24px 40px rgba(15, 23, 42, 0.06)",
        cursor: "pointer",
      }}
      bodyStyle={{ padding: isMobile ? 20 : 24 }}
      onClick={() => onDetail(id)}
    >
      <Row
        align="middle"
        justify={isMobile ? "start" : "space-between"}
        gutter={[16, 16]}
      >
        <Col flex="auto">
          <Space
            align={isMobile ? "start" : "center"}
            size={isMobile ? 14 : 18}
          >
            <Avatar
              size={isMobile ? 56 : 64}
              src={avatarUrl || undefined}
              style={{
                background:
                  "linear-gradient(130deg, rgba(99,102,241,1) 0%, rgba(14,165,233,1) 100%)",
                fontWeight: 700,
                fontSize: 20,
              }}
            >
              {initials}
            </Avatar>
            <Space direction="vertical" size={2}>
              <Text style={{ fontSize: 20, fontWeight: 700 }}>{name}</Text>
              <Text style={{ color: "#2563EB", fontWeight: 600 }}>
                {jobName}
              </Text>
              <Space size={6} wrap>
                <Tag
                  icon={<CalendarOutlined />}
                  style={{
                    borderRadius: 999,
                    background: "#F0F5FF",
                    borderColor: "transparent",
                    color: "#1D39C4",
                  }}
                >
                  Applied {appliedLabel}
                </Tag>
                <Text type="secondary">• {since}</Text>
              </Space>
            </Space>
          </Space>
        </Col>
        <Col style={{ textAlign: isMobile ? "left" : "right" }}>
          <Tooltip title="Application ID">
            <Tag
              color="black"
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              #{String(id).toUpperCase().slice(0, 8)}
            </Tag>
          </Tooltip>
        </Col>
      </Row>

      <Card
        size="small"
        bordered={false}
        style={{
          background: "#F9FBFF",
          borderRadius: 16,
          marginTop: 20,
        }}
        bodyStyle={{ padding: 16 }}
      >
        <Row
          align="middle"
          gutter={[16, 12]}
          style={{ flexDirection: isMobile ? "column" : "row" }}
        >
          <Col xs={24} md={6}>
            <Tag
              style={{
                borderRadius: 999,
                padding: "8px 18px",
                fontWeight: 700,
                background: "rgba(248,94,94,0.12)",
                color: "#E03131",
                borderColor: "rgba(248,94,94,0.4)",
              }}
            >
              {stageLabelText}
            </Tag>
          </Col>
          <Col xs={24} md={18} style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Text type="secondary">
                Stage {stageDisplayNumber} of {stageDisplayCount}
              </Text>
              <div style={{ flex: 1, minWidth: 160 }}>
                <Progress
                  percent={pct}
                  showInfo={false}
                  strokeColor="#111"
                  trailColor="#E0E7FF"
                  size={{ height: 8 }}
                />
              </div>
              <Text strong>{pct}% complete</Text>
            </div>
          </Col>
        </Row>
      </Card>

      <Row
        justify="space-between"
        align="middle"
        style={{ marginTop: 20, gap: 12 }}
      >
        <Col>
          <Text type="secondary">Need more info?</Text>
          <Text style={{ display: "block", fontWeight: 600 }}>
            Tap to open detailed timeline
          </Text>
        </Col>
        <Col style={{ width: isMobile ? "100%" : "auto" }}>
          <Tooltip title="View details">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              style={{
                width: isMobile ? "100%" : 180,
                height: 48,
                borderRadius: 14,
                background:
                  "linear-gradient(130deg, rgba(59,130,246,1) 0%, rgba(96,165,250,1) 100%)",
                border: "none",
                fontSize: 16,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onDetail(id);
              }}
            >
              Detail
              <ArrowRightOutlined />
            </Button>
          </Tooltip>
        </Col>
      </Row>
    </Card>
  );
}
