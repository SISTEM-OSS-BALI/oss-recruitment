"use client";

import React, { useMemo } from "react";
import { Alert, Card, Col, Empty, Progress, Row, Skeleton, Space } from "antd";

import type { ApplicantDataModel } from "@/app/models/applicant";
import { ScheduleHiredDataModel } from "@/app/models/schedule-hired";
import ScheduleHiredForm, {
  ScheduleHiredFormValues,
} from "@/app/components/common/form/admin/hired";
import CandidateInfoPanel from "@/app/components/common/information-panel";
import SchedulePretty from "./ScheduleCard";
import { useApplicantEmployeeSetups } from "@/app/hooks/employee-setup";

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
    () =>
      listData.filter((schedule) => schedule.applicant_id === candidate?.id),
    [listData, candidate?.id]
  );
  const hasSchedules = schedules.length > 0;

  const { data: applicantEmployeeSetups = [] } = useApplicantEmployeeSetups({
    applicantId: candidate?.id,
  });

  const employeeSetupStats = useMemo(() => {
    const assignments = applicantEmployeeSetups ?? [];
    const base = assignments.reduce(
      (acc, assignment) => {
        const questions = assignment.employeeSetup?.employeeSetupQuestion ?? [];
        acc.total += questions.length;
        acc.completed += questions.filter((question) => {
          const answer = question.employeeSetupAnswers?.[0];
          return Boolean(answer?.is_done);
        }).length;
        return acc;
      },
      { total: 0, completed: 0 }
    );
    const percent = base.total
      ? Math.round((base.completed / base.total) * 100)
      : 0;

    return {
      ...base,
      percent,
      finished: percent === 100 && base.total > 0,
    };
  }, [applicantEmployeeSetups]);

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
          jobName={candidate.job?.job_title}
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

          <Card style={{ marginTop: "20px" }}>
            <Space direction="vertical" style={{ width: "100%" }} size={16}>
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>
                    Employee Setup Progress
                  </span>
                  <span>{employeeSetupStats.percent}%</span>
                </div>
                <Progress
                  percent={employeeSetupStats.percent}
                  size="small"
                  status={employeeSetupStats.finished ? "success" : "active"}
                />
                <div style={{ marginTop: 4, fontSize: 12, color: "#888" }}>
                  {employeeSetupStats.completed}/{employeeSetupStats.total}{" "}
                  tasks completed
                </div>
              </div>

              {applicantEmployeeSetups.length > 0 ? (
                <Alert
                  type="success"
                  showIcon
                  message="Employee setup assigned"
                  description={
                    employeeSetupStats.finished
                      ? "All assigned activities have been completed."
                      : "This candidate already has employee setups assigned."
                  }
                />
              ) : (
                <Alert
                  type="info"
                  showIcon
                  message="No employee setup assigned"
                  description="This candidate does not have any employee setup yet."
                />
              )}
            </Space>
          </Card>
        </Space>
      </Col>
    </Row>
  );
}
