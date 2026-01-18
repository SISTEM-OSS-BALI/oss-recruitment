"use client";

import React, { useMemo } from "react";
import { Card, Empty, Space, Typography } from "antd";
import Loading from "@/app/components/common/custom-loading";
import { useAuth } from "@/app/utils/useAuth";
import { useCandidateByUserId } from "@/app/hooks/applicant";
import { useApplicantEmployeeSetupsByApplicant } from "@/app/hooks/employee-setup";
import AssignEmplyeeSetupContent from "./AssignEmployeeSetup";
import { useSearchParams } from "next/navigation";

const { Title, Paragraph, Text } = Typography;

export default function EmployeeSetupPage() {
  const { user_id } = useAuth();
  const params = useSearchParams();
  const applicant_id = params.get("applicant_id");
  const { data: applicants, fetchLoading } = useCandidateByUserId({
    id: user_id,
  });

  const applicant = applicant_id
    ? applicants?.find((item) => item?.id === applicant_id)
    : applicants?.[0];

  const {
    data: applicantEmployeeSetups = [],
    fetchLoading: assignmentLoading,
  } = useApplicantEmployeeSetupsByApplicant({
    applicantId: applicant?.id,
  });

  const totals = useMemo(() => {
    const totalQuestions = applicantEmployeeSetups.reduce((sum, assignment) => {
      const questions = assignment.employeeSetup?.employeeSetupQuestion ?? [];
      return sum + questions.length;
    }, 0);

    const completedQuestions = applicantEmployeeSetups.reduce(
      (sum, assignment) => {
        const questions = assignment.employeeSetup?.employeeSetupQuestion ?? [];
        const completed = questions.filter((question) => {
          const answer = question.employeeSetupAnswers?.[0];
          return Boolean(answer?.is_done);
        }).length;

        return sum + completed;
      },
      0
    );

    const percent = totalQuestions
      ? Math.round((completedQuestions / totalQuestions) * 100)
      : 0;

    return { totalQuestions, completedQuestions, percent };
  }, [applicantEmployeeSetups]);

  if (fetchLoading) return <Loading />;
  if (!applicant)
    return <Empty description="No application found" />;

  return (
    <div style={{ padding: 16, maxWidth: 1200, margin: "0 auto" }}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Card>
          <Title level={4} style={{ marginBottom: 4 }}>
            Employee Setup Progress
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            Track and complete every onboarding activity assigned to your
            application.
          </Paragraph>

          <Space size={32} wrap>
            <div>
              <Text type="secondary">Overall Progress</Text>
              <div style={{ fontSize: 32, fontWeight: 600 }}>
                {totals.percent}%
              </div>
            </div>
            <div>
              <Text type="secondary">Completed Tasks</Text>
              <div style={{ fontSize: 32, fontWeight: 600 }}>
                {totals.completedQuestions}/{totals.totalQuestions}
              </div>
            </div>
          </Space>
        </Card>

        <AssignEmplyeeSetupContent
          data={applicantEmployeeSetups}
          loading={assignmentLoading}
          emptyDescription="No employee setup activities assigned yet."
          loadingMessage="Loading your employee setup progress…"
          applicantId={applicant.id}
        />
      </Space>
    </div>
  );
}
