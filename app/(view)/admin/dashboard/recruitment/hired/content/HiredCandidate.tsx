"use client";

import React, { useMemo } from "react";
import { Card, Col, Row, Space, Empty, List, Skeleton, Button } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import type { ApplicantDataModel } from "@/app/models/applicant";
import {
  ScheduleHiredDataModel,
  ScheduleHiredPayloadCreateModel,
} from "@/app/models/hired";
import ScheduleHiredForm from "@/app/components/common/form/admin/hired";
import { formatDate, formatTime } from "@/app/utils/date-helper";
import CandidateInfoPanel from "@/app/components/common/information-panel";

/* ---------- helpers ---------- */

/* ================== Page ================== */
export default function HiredSchedulePage({
  listData = [],
  listLoading = false,
  candidate,
  onCreateSchedule,
  onLoadingCreate,
}: {
  selectedScheduleId?: string | null;
  candidate: ApplicantDataModel | null;
  listData?: ScheduleHiredDataModel[];
  listLoading?: boolean;
  onCreateSchedule: (payload: ScheduleHiredPayloadCreateModel) => Promise<void>;
  onLoadingCreate: boolean;
}) {
  const schedules = useMemo(
    () => listData.filter((s) => s.candidate_id === candidate?.id),
    [listData, candidate?.id]
  );

  if (!candidate) {
    return (
      <div
        style={{
          height: 560,
          display: "grid",
          placeItems: "center",
          color: "#bfbfbf",
        }}
      >
        <Empty description="No Candidate Selected" />
      </div>
    );
  }

  const hasSchedules = schedules.length > 0;

  return (
    <Row gutter={[16, 16]}>
      {/* LEFT PANEL (Profile) */}
      <Col xs={24} md={8}>
        <CandidateInfoPanel
          email={candidate.user.email}
          phone={candidate.user.phone}
          dateOfBirth={candidate.user.date_of_birth}
          jobName={candidate.job?.name}
          appliedAt={candidate.createdAt}
          stage={candidate.stage}
          updatedAt={candidate.updatedAt}
          cvUrl={candidate.user.curiculum_vitae_url}
          portfolioUrl={candidate.user.portfolio_url}
        />
      </Col>

      {/* RIGHT PANEL (Schedule / Form) */}
      <Col xs={24} md={16}>
        <Button style={{ marginBottom: 12 }}>Create Contract</Button>
        {listLoading ? (
          <Card style={{ borderRadius: 14 }}>
            <Skeleton active />
          </Card>
        ) : hasSchedules ? (
          <Card
            style={{ borderRadius: 14 }}
            title={
              <Space>
                <ClockCircleOutlined />
                <span>Schedule</span>
              </Space>
            }
            headStyle={{ borderBottom: "none" }}
          >
            <List
              dataSource={schedules}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space size={8} wrap>
                        <strong>{formatDate(item.date)}</strong>
                        <span>at</span>
                        <strong>{formatTime(item.start_time)}</strong>
                      </Space>
                    }
                    description={<span>Location: {item.location.name}</span>}
                  />
                </List.Item>
              )}
            />
          </Card>
        ) : (
          <Card style={{ borderRadius: 14 }}>
            <ScheduleHiredForm
              candidateId={candidate.id!}
              loading={onLoadingCreate}
              onSubmit={onCreateSchedule}
            />
          </Card>
        )}
      </Col>
    </Row>
  );
}
