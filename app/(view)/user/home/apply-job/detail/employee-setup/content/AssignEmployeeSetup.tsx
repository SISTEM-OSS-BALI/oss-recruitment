'use client';

import {
  Alert,
  Checkbox,
  Empty,
  Input,
  Progress,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import type { ApplicantEmployeeSetupDataModel } from "@/app/models/applicant-employee-setup";
import type { EmployeeSetupAnswerUpdateRequest } from "@/app/models/employee-setup-answer";
import { useCallback, useEffect, useState } from "react";
import { useUpdateEmployeeSetupAnswer } from "@/app/hooks/employee-setup";
import SupaFileUploader from "@/app/utils/pdf-uploader";

const { Text } = Typography;

type Props = {
  data?: ApplicantEmployeeSetupDataModel[];
  loading?: boolean;
  emptyDescription?: string;
  loadingMessage?: string;
  applicantId?: string;
};

const getQuestionStatus = (question: ApplicantEmployeeSetupDataModel["employeeSetup"]["employeeSetupQuestion"][number]) => {
  const answer = question.employeeSetupAnswers?.[0];
  return Boolean(answer?.is_done);
};

type UpdateAnswerPayload = Omit<
  EmployeeSetupAnswerUpdateRequest,
  "applicantId" | "employeeSetupQuestionId"
>;

type QuestionCardProps = {
  question: ApplicantEmployeeSetupDataModel["employeeSetup"]["employeeSetupQuestion"][number];
  index: number;
  onUpdate: (questionId: string, payload: UpdateAnswerPayload) => Promise<void>;
  updating: boolean;
};

function QuestionCard({ question, index, onUpdate, updating }: QuestionCardProps) {
  const answer = question.employeeSetupAnswers?.[0];
  const [inputValue, setInputValue] = useState(answer?.value_text ?? "");

  useEffect(() => {
    setInputValue(answer?.value_text ?? "");
  }, [answer?.value_text]);

  const handleCheckboxChange = useCallback(
    async (checked: boolean) => {
      await onUpdate(question.id, { is_done: checked });
    },
    [onUpdate, question.id]
  );

  const handleInputSave = useCallback(async () => {
    if (inputValue === answer?.value_text) return;
    await onUpdate(question.id, {
      value_text: inputValue,
    });
  }, [answer?.value_text, inputValue, onUpdate, question.id]);

  const handleUpload = useCallback(
    async (_path: string, url: string) => {
      await onUpdate(question.id, {
        value_file_url: url,
      });
    },
    [onUpdate, question.id]
  );

  const handleRemoveUpload = useCallback(async () => {
    if (!answer?.value_file_url) return;
    await onUpdate(question.id, {
      value_file_url: null,
    });
  }, [answer?.value_file_url, onUpdate, question.id]);

  return (
    <div
      style={{
        border: "1px solid #f5f5f5",
        borderRadius: 10,
        padding: 12,
        backgroundColor: answer?.is_done ? "#f6ffed" : "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Text strong>
            {index + 1}. {question.name_activity}
          </Text>
          <div>
            <Text type="secondary">Executor: {question.executor}</Text>
          </div>
        </div>
        <Checkbox
          checked={answer?.is_done}
          onChange={(e) => handleCheckboxChange(e.target.checked)}
          disabled={updating}
        >
          Completed
        </Checkbox>
      </div>

      {question.description ? (
        <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
          {question.description}
        </Text>
      ) : null}

      {question.method === "LINK" && question.default_link ? (
        <a
          href={question.default_link}
          target="_blank"
          rel="noreferrer"
          style={{ display: "inline-block", marginTop: 8 }}
        >
          Open Link
        </a>
      ) : null}

      {question.method === "INPUT" ? (
        <div style={{ marginTop: 12 }}>
          <Input.TextArea
            rows={3}
            value={inputValue}
            placeholder={question.input_label ?? "Enter your answer"}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleInputSave}
            disabled={updating}
          />
          <div style={{ textAlign: "right", marginTop: 4 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Value saved automatically when you leave the field.
            </Text>
          </div>
        </div>
      ) : null}

      {question.method === "UPLOAD" ? (
        <div style={{ marginTop: 12 }}>
          <SupaFileUploader
            bucket="web-oss-recruitment"
            folder="employee-setup"
            value={answer?.value_file_url ?? null}
            onUpload={handleUpload}
            onChange={(val) => {
              if (!val) {
                handleRemoveUpload();
              }
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

export default function AssignEmplyeeSetupContent({
  data = [],
  loading = false,
  emptyDescription = "This candidate does not have any employee setup assigned.",
  loadingMessage = "Loading employee setup progress…",
  applicantId,
}: Props) {
  const { onUpdateAnswer, onUpdateAnswerLoading } =
    useUpdateEmployeeSetupAnswer({
      applicantId,
    });

  const handleUpdate = useCallback(
    async (questionId: string, payload: UpdateAnswerPayload) => {
      if (!applicantId) {
        message.error("Applicant not found.");
        return;
      }
      try {
        await onUpdateAnswer({
          ...payload,
          employeeSetupQuestionId: questionId,
        });
      } catch (error: unknown) {
        const msg =
          error instanceof Error ? error.message : "Failed to update answer";
        message.error(msg);
      }
    },
    [applicantId, onUpdateAnswer]
  );

  if (loading) {
    return (
      <Alert
        type="info"
        message={loadingMessage}
        showIcon
      />
    );
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
          <div
            key={assignment.id}
            style={{
              border: "1px solid #f0f0f0",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
                gap: 12,
              }}
            >
              <div>
                <Text strong>{assignment.employeeSetup?.name}</Text>
                <div style={{ marginTop: 4 }}>
                  <Tag color="blue">{questions.length} Activities</Tag>
                </div>
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
            </div>

            <Space
              direction="vertical"
              size={12}
              style={{ width: "100%" }}
            >
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
            </Space>
          </div>
        );
      })}
    </Space>
  );
}
