"use client";

import {
  Alert,
  Card,
  Empty,
  Progress,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import type { ApplicantEmployeeSetupDataModel } from "@/app/models/applicant-employee-setup";
import { useCallback   } from "react";
import { useRouter } from "next/navigation";

const { Text } = Typography;

type Props = {
  data?: ApplicantEmployeeSetupDataModel[];
  loading?: boolean;
  emptyDescription?: string;
  loadingMessage?: string;
  applicantId?: string;
};

const getQuestionStatus = (
  question: ApplicantEmployeeSetupDataModel["employeeSetup"]["employeeSetupQuestion"][number]
) => {
  const answer = question.employeeSetupAnswers?.[0];
  return Boolean(answer?.is_done);
};


export default function AssignEmplyeeSetupContent({
  data = [],
  loading = false,
  emptyDescription = "This candidate does not have any employee setup assigned.",
  loadingMessage = "Loading employee setup progress…",
  applicantId,
}: Props) {

  const router = useRouter();

  const goToDetailBasedOnAssignment = useCallback(
    (assignmentId: string) => {
      if (!applicantId) {
        message.error("Applicant not found.");
        return;
      }
      const params = new URLSearchParams({
        applicant_id: applicantId,
        assignment_id: assignmentId,
      });
      router.push(
        `/user/home/apply-job/detail/employee-setup/assignment-detail?${params.toString()}`
      );
    },
    [applicantId, router]
  );


  if (loading) {
    return <Alert type="info" message={loadingMessage} showIcon />;
  }

  if (!data.length) {
    return (
      <Empty
        description={emptyDescription}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {data.map((assignment) => {
        const questions = assignment.employeeSetup?.employeeSetupQuestion ?? [];
        const completed = questions.filter(getQuestionStatus).length;
        const percent = questions.length
          ? Math.round((completed / questions.length) * 100)
          : 0;

        return (
          <div key={assignment.id}>
            <div>
              <Card
                onClick={() => goToDetailBasedOnAssignment(assignment.id)}
                style={{ borderRadius: 12, cursor: "pointer" }}
              >
                <Text strong>{assignment.employeeSetup?.name}</Text>
                <div style={{ marginTop: 4 }}>
                  <Tag color="blue">{questions.length} Activities</Tag>
                </div>
                <div style={{ minWidth: 160 }}>
                  <Text type="secondary" style={{ display: "block" }}>
                    Progress
                  </Text>
                  <Progress
                    percent={percent}
                    size="small"
                    status={percent === 100 ? "success" : "active"}
                  />
                </div>
              </Card>
            </div>

            {/* <Space direction="vertical" size={12} style={{ width: "100%" }}>
              {questions.map((question, index) => {
                return (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    index={index}
                    onUpdate={handleUpdate}
                    updating={onUpdateAnswerLoading}
                  />
                );
              })}
            </Space> */}
          </div>
        );
      })}
    </Space>
  );
}
