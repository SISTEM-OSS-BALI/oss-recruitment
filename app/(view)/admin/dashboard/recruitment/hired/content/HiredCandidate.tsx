"use client";

import React, { useMemo } from "react";
import { Card, Col, Empty, Row, Skeleton, Space } from "antd";

import type { ApplicantDataModel } from "@/app/models/applicant";
import { ScheduleHiredDataModel } from "@/app/models/schedule-hired";
import ScheduleHiredForm, {
  ScheduleHiredFormValues,
} from "@/app/components/common/form/admin/hired";
import CandidateInfoPanel from "@/app/components/common/information-panel";
import SchedulePretty from "./ScheduleCard";

type Props = {
  candidate: ApplicantDataModel | null;
  listData?: ScheduleHiredDataModel[];
  listLoading?: boolean;
  onCreateSchedule: (payload: ScheduleHiredFormValues) => Promise<void>;
  onLoadingCreate: boolean;
};

export default function HiredCandidate({
  candidate,
  listData = [],
  listLoading = false,
  onCreateSchedule,
  onLoadingCreate,
}: Props) {
  const schedules = useMemo(
    () => listData.filter((schedule) => schedule.applicant_id === candidate?.id),
    [listData, candidate?.id]
  );
  const hasSchedules = schedules.length > 0;

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

  return (
    <Row gutter={[16, 16]}>
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

      <Col xs={24} md={16}>
        <Space
          direction="vertical"
          size={12}
          style={{ width: "100%", display: "block" }}
        >
          {listLoading ? (
            <Card style={{ borderRadius: 14 }}>
              <Skeleton active />
            </Card>
          ) : hasSchedules ? (
            schedules.map((schedule) => (
              <SchedulePretty
                key={schedule.id}
                date={schedule.date}
                time={schedule.start_time}
                location={{
                  name: schedule.location?.name ?? "-",
                  description: schedule.location?.address ?? undefined,
                }}
              />
            ))
          ) : (
            <Card style={{ borderRadius: 14 }}>
              <ScheduleHiredForm
                candidateId={candidate.id!}
                loading={onLoadingCreate}
                onSubmit={onCreateSchedule}
              />
            </Card>
          )}
        </Space>
      </Col>
    </Row>
  );
}
