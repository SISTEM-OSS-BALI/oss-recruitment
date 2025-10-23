"use client";

import React, { useMemo } from "react";
import {
  Alert,
  Button,
  Card,
  Divider,
  Form,
  Input,
  Modal,
  notification,
  Radio,
  Skeleton,
  Space,
  Typography,
} from "antd";
import { CheckCircleTwoTone } from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";

// hooks
import { useEvaluatorAssignment } from "@/app/hooks/evaluatorAssignment";
import { useEvalutorReviews } from "@/app/hooks/evaluator-review";
import { EvaluatorReviewDataModel } from "@/app/models/evaluator-review";

// helper tampilan
const { Title, Text } = Typography;

type AssignmentRow = {
  id: string;
  text: string;
  inputType: "SINGLE_CHOICE" | "TEXT";
  required: boolean;
  order?: number | null;
  helpText?: string | null;
  placeholder?: string | null;
  matriksQuestionOption?: Array<{
    id: string;
    label: string;
    value: string;
    order?: number | null;
    active?: boolean | null;
  }>;
};

export default function Content() {
  const params = useSearchParams();
  const assignmentId = params.get("evaluator_assignment_id") ?? "";
  const router = useRouter();

  const { data, fetchLoading, error } = useEvaluatorAssignment({
    id: assignmentId || "",
  });

  const { onCreate, onCreateLoading } = useEvalutorReviews({});

  const [form] = Form.useForm();

  // Normalisasi & sorting rows
  const rows: AssignmentRow[] = useMemo(() => {
    const r =
      (data as any)?.baseMatriks?.rows &&
      Array.isArray((data as any).baseMatriks.rows)
        ? (data as any).baseMatriks.rows
        : [];
    return r
      .slice()
      .sort(
        (a: AssignmentRow, b: AssignmentRow) => (a.order ?? 0) - (b.order ?? 0)
      );
  }, [data]);

  const handleSubmit = React.useCallback(
    async (values: EvaluatorReviewDataModel) => {
      // guard: jangan jalan kalau tidak ada assignmentId atau nilai kosong
      if (!assignmentId) return;

      const entries = Object.entries(values ?? {});
      if (entries.length === 0) return;

      const answers = entries.map(([questionId, value]) => ({
        questionId,
        value,
      }));
      await onCreate({ id: assignmentId, answers });
      router.push("/evaluator/assessment/success");
    },
    [assignmentId, onCreate]
  );

  // Loading & error state
  if (!assignmentId) {
    return (
      <Alert
        type="error"
        message="Parameter evaluator_assignment_id tidak ada."
        showIcon
      />
    );
  }

  if (fetchLoading) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton active />
        <Divider />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            active
            paragraph={{ rows: 2 }}
            style={{ marginBottom: 16 }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        message="Gagal memuat data assignment"
        description={String(error)}
        showIcon
      />
    );
  }

  if (!data) {
    return (
      <Alert
        type="warning"
        message="Data assignment tidak ditemukan"
        showIcon
      />
    );
  }

  const base = (data as any).baseMatriks;
  const evaluator = (data as any).evaluator;
  const applicant = (data as any).applicant;

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: 16 }}>
      {/* Header ala Google Form */}
      <Card
        style={{ borderRadius: 12, border: "1px solid #eef0fc" }}
        bodyStyle={{ padding: 24 }}
      >
        <Space direction="vertical" size={6} style={{ width: "100%" }}>
          <Title level={3} style={{ margin: 0 }}>
            {base?.name ?? "Evaluation Form"}
          </Title>
          {base?.desc ? (
            <Text type="secondary" style={{ whiteSpace: "pre-wrap" }}>
              {base.desc}
            </Text>
          ) : null}

          <Divider style={{ margin: "12px 0" }} />

          <Space wrap size={16}>
            <Text>
              <strong>Evaluator:</strong> {evaluator?.name ?? "-"}
            </Text>
            <Text>
              <strong>Candidate:</strong> {applicant.user.name ?? "-"}
            </Text>
            <Text>
              <strong>Status:</strong>{" "}
              <span style={{ color: "#3f8600" }}>
                <CheckCircleTwoTone twoToneColor="#52c41a" />{" "}
                {data?.status ?? "PENDING"}
              </span>
            </Text>
          </Space>
        </Space>
      </Card>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: 16 }}
      >
        {/* Render setiap pertanyaan */}
        {rows.map((q, idx) => {
          const fieldName = q.id; // gunakan id untuk key field
          const isSingle = q.inputType === "SINGLE_CHOICE";

          return (
            <Card
              key={q.id}
              style={{
                marginTop: 12,
                borderRadius: 12,
                border: "1px solid #eef0fc",
                background: "#fff",
              }}
              bodyStyle={{ padding: 20 }}
            >
              <Space direction="vertical" size={6} style={{ width: "100%" }}>
                <div
                  style={{ display: "flex", gap: 8, alignItems: "baseline" }}
                >
                  <Text style={{ fontWeight: 600, fontSize: 16 }}>
                    {idx + 1}. {q.text}
                  </Text>
                  {/* {q.required && (
                    <Text type="danger" style={{ fontSize: 12 }}>
                      (required)
                    </Text>
                  )} */}
                </div>
                {q.helpText ? (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {q.helpText}
                  </Text>
                ) : null}

                <Form.Item
                  name={fieldName}
                  rules={
                    q.required
                      ? [{ required: true, message: "Wajib diisi" }]
                      : undefined
                  }
                  style={{ marginTop: 8, marginBottom: 0 }}
                >
                  {isSingle ? (
                    <Radio.Group
                      style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
                    >
                      {(q.matriksQuestionOption || [])
                        .filter((op) => op.active !== false)
                        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                        .map((op) => (
                          <Radio key={op.id} value={op.value}>
                            {op.label}
                          </Radio>
                        ))}
                    </Radio.Group>
                  ) : (
                    <Input.TextArea
                      placeholder={q.placeholder || "Type your answer..."}
                      autoSize={{ minRows: 3, maxRows: 6 }}
                      showCount
                      maxLength={1000}
                    />
                  )}
                </Form.Item>
              </Space>
            </Card>
          );
        })}

        {/* Submit */}
        <Space style={{ marginTop: 16 }}>
          <Button type="primary" htmlType="submit" size="large">
            Submit
          </Button>
          <Button
            size="large"
            onClick={() => {
              form.resetFields();
            }}
          >
            Reset
          </Button>
        </Space>
      </Form>
    </div>
  );
}
