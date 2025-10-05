"use client";

import React from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Row,
  Space,
  Tag,
  Tooltip,
  Typography,
  Progress,
} from "antd";

import Loading from "@/app/components/common/custom-loading";
import { useCandidateByUserId } from "@/app/hooks/applicant";
import { useAuth } from "@/app/utils/useAuth";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const STAGES = ["APPLICATION", "SCREENING", "INTERVIEW", "HIRED"] as const;

function stageIndex(stage?: string) {
  const idx = STAGES.findIndex((s) => s === stage);
  return idx >= 0 ? idx : 0;
}

function stagePercent(stage?: string) {
  const idx = stageIndex(stage);
  const total = STAGES.length - 1; // 0..3
  return Math.round((idx / total) * 100);
}

export default function Content() {
  const router = useRouter();
  const { user_id } = useAuth();
  const { data: applicants, fetchLoading } = useCandidateByUserId({
    id: user_id,
  });

  if (fetchLoading) return <Loading />;
  if (!applicants?.length) return <Empty description="No application found" />;

  const goToDetail = (id: string) =>
    router.push(
      `/user/home/apply-job/detail?applicant_id=${encodeURIComponent(id)}`
    );

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <Space direction="vertical" size={12} style={{ display: "flex" }}>
        <Title level={3} style={{ margin: 0 }}>
          Your Applications
        </Title>
        <Text type="secondary">
          {applicants.length}{" "}
          {applicants.length > 1 ? "applications" : "application"}
        </Text>
      </Space>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {applicants.map((app) => {
          const name = app?.user?.name || "Candidate";
          const initials =
            name
              .split(" ")
              .map((s: string) => s[0])
              .slice(0, 2)
              .join("")
              .toUpperCase() || "C";
          const jobName = app?.job?.name || "—";
          const created = app?.createdAt ? dayjs(app.createdAt) : null;
          const since = created ? dayjs().to(created) : "—";
          const pct = stagePercent(app?.stage ?? "");

          return (
            <Col xs={24} key={app.id}>
              <Card
                hoverable
                style={{ borderRadius: 16, cursor: "pointer" }}
                bodyStyle={{ padding: 20 }}
                onClick={() => goToDetail(app.id)}
              >
                {/* Header */}
                <Row align="middle" justify="space-between" gutter={[16, 16]}>
                  <Col flex="auto">
                    <Space align="center" size={16}>
                      <Avatar
                        size={56}
                        src={app?.user?.photo_url || undefined}
                        style={{
                          background:
                            "linear-gradient(135deg,#7C4DFF 0%, #6CA6FF 100%)",
                          fontWeight: 700,
                        }}
                      >
                        {initials}
                      </Avatar>
                      <Space direction="vertical" size={0}>
                        <Text style={{ fontSize: 20, fontWeight: 700 }}>
                          {name}
                        </Text>
                        <a
                          onClick={(e) => e.preventDefault()}
                          style={{ color: "#2F6FFF", fontWeight: 600 }}
                        >
                          {jobName}
                        </a>
                        <Text type="secondary">
                          Applied:{" "}
                          {created ? created.format("MMM DD, YYYY") : "—"} •{" "}
                          {since}
                        </Text>
                      </Space>
                    </Space>
                  </Col>

                  <Col>
                    <Tag
                      color="black"
                      style={{
                        padding: "6px 12px",
                        borderRadius: 999,
                        color: "white",
                        fontWeight: 700,
                      }}
                    >
                      #
                      {String(app?.id || "")
                        .toUpperCase()
                        .slice(0, 8)}
                    </Tag>
                  </Col>
                </Row>

                {/* Progress compact card */}
                <div
                  style={{
                    background: "#F8F8F8",
                    borderRadius: 12,
                    padding: 16,
                    marginTop: 16,
                    border: "1px solid #EEE",
                  }}
                >
                  <Row align="middle" justify="space-between" gutter={[16, 8]}>
                    <Col>
                      <Tag
                        style={{
                          borderRadius: 999,
                          padding: "8px 14px",
                          fontWeight: 700,
                          background: "rgba(255,0,0,0.08)",
                          borderColor: "rgba(255,0,0,0.25)",
                          color: "#E53935",
                        }}
                      >
                        {app?.stage || "APPLICATION"}
                      </Tag>
                    </Col>

                    <Col flex="auto">
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          alignItems: "center",
                        }}
                      >
                        <Text type="secondary" style={{ whiteSpace: "nowrap" }}>
                          Stage {stageIndex(app?.stage ?? "") + 1} of {STAGES.length}
                        </Text>
                        <div style={{ flex: 1 }}>
                          <Progress
                            percent={pct}
                            showInfo={false}
                            strokeColor="#111"
                            trailColor="#EDEDED"
                            size={[undefined, 6]}
                          />
                        </div>
                        <Text type="secondary" style={{ whiteSpace: "nowrap" }}>
                          {pct}% complete
                        </Text>
                      </div>
                    </Col>
                  </Row>
                </div>

                {/* Single long button */}
                <div style={{ marginTop: 16 }}>
                  <Tooltip title="View details">
                    <Button
                      block
                      size="large"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToDetail(app.id);
                      }}
                      style={{
                        height: 56,
                        borderRadius: 16,
                        borderWidth: 2,
                        fontSize: 18,
                        fontWeight: 700,
                      }}
                      icon={null}
                    >
                      Detail
                    </Button>
                  </Tooltip>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
