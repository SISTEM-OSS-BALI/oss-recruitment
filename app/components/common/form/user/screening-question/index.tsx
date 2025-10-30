"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  Empty,
  Form,
  Grid,
  Input,
  Modal,
  Radio,
  Skeleton,
  Space,
  Tabs,
  Typography,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/en";
dayjs.locale("en");

import { useQuestionBaseScreenings } from "@/app/hooks/base-question-screening";
import type {
  QuestionOption,
  QuestionScreening,
  QuestionScreeningType,
} from "@prisma/client";
import { useAnswerQuestionScreenings } from "@/app/hooks/answer-question-screening";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

/* ================= Types ================= */
type QuestionBaseScreeningWithQuestions = {
  id: string;
  name: string;
  desc: string | null;
  /** NEW: flag dari backend */
  allowMultipleSubmissions?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  active: boolean;
  version: number;
  questions: Array<
    QuestionScreening & {
      options: QuestionOption[];
    }
  >;
};

function coerceBases(data: any): QuestionBaseScreeningWithQuestions[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as QuestionBaseScreeningWithQuestions[];
  if (Array.isArray(data?.result))
    return data.result as QuestionBaseScreeningWithQuestions[];
  return [];
}

/* ================= Component ================= */
export default function FormScreeningQuestion({
  job_id,
  user_id,
}: {
  job_id: string;
  user_id: string;
}) {
  const screens = useBreakpoint();
  const { data } = useQuestionBaseScreenings({});
  const bases = useMemo(() => coerceBases(data), [data]);
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const { onCreate } = useAnswerQuestionScreenings({ fetchEnabled: false });

  /** Submit handler yang dipanggil dari tiap tab (BaseAnswerForm) */
  async function handleSubmitAll(values: {
    /** baseId yang sedang disubmit */
    baseId: string;
    /** entries: array dari sekumpulan jawaban (satu atau lebih set) */
    entries: Array<Record<string, any>>;
    /** map tipe pertanyaan untuk mapping */
    qTypeMap: Record<string, QuestionScreeningType>;
  }) {
    const { baseId, entries, qTypeMap } = values;

    // Bentuk answers array:
    // Untuk TEXT: { questionId, answerText }
    // Untuk SINGLE_CHOICE: { questionId, optionIds: [<optionId>] }
    // Untuk MULTIPLE_CHOICE: { questionId, optionIds: [<optionId>, ...] }
    const answers = entries.flatMap((entry) =>
      Object.entries(entry).map(([questionId, val]) => {
        const t = qTypeMap[questionId];
        if (t === "TEXT") {
          return { questionId, answerText: (val ?? "").toString() };
        }
        if (t === "SINGLE_CHOICE") {
          return { questionId, optionIds: val ? [String(val)] : [] };
        }
        // MULTIPLE_CHOICE
        return {
          questionId,
          optionIds: Array.isArray(val) ? val.map(String) : [],
        };
      })
    );

    setSubmitting(true);
    try {
      const payload: {
        job_id: string;
        user_id: string;
        base_id: string;
        answers: Array<
          | { questionId: string; answerText: string }
          | { questionId: string; optionIds: string[] }
        >;
      } = {
        job_id,
        user_id,
        base_id: baseId,
        answers,
      }
      await onCreate(payload);

      Modal.success({
        title: "Thank you!",
        content: (
          <div>
            <p>Your application has been submitted successfully.</p>
            <p>We will review your application and get back to you soon.</p>
          </div>
        ),
        centered: true,
      });
    } catch (e: any) {
      Modal.error({
        title: "Submission failed",
        content:
          e?.response?.data?.message || e?.message || "Unexpected error.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: screens.md ? 24 : 16 }}>
      <Space
        direction="vertical"
        size={4}
        style={{ display: "block", marginBottom: 8 }}
      >
        <Title level={2} style={{ margin: 0, color: "#111827" }}>
          Screening Question
        </Title>
      </Space>

      {/* Tabs per base */}
      <div className="sqb-tabs-wrap">
        {data == null ? (
          <div style={{ padding: 16 }}>
            <Skeleton active paragraph={{ rows: 2 }} />
          </div>
        ) : bases.length === 0 ? (
          <Empty style={{ padding: 24 }} description="No bases found." />
        ) : (
          <Tabs
            activeKey={activeTab || bases[0]?.id}
            onChange={(k) => setActiveTab(k)}
            items={bases.map((b) => ({
              key: b.id,
              label: b.name,
              children: (
                <BaseAnswerForm
                  base={b}
                  onSubmitAll={handleSubmitAll}
                  submitting={submitting}
                />
              ),
            }))}
          />
        )}
      </div>

      <style jsx global>{`
        .sqb-tabs-wrap .ant-tabs-nav {
          margin: 12px 0 8px;
          background: #fff;
          border: 1px solid #eef2f7;
          border-radius: 12px;
          padding: 8px 12px;
        }
      `}</style>
    </div>
  );
}

/* ================= Base Answer Form ================= */
function BaseAnswerForm({
  base,
  onSubmitAll,
  submitting,
}: {
  base: QuestionBaseScreeningWithQuestions;
  onSubmitAll: (values: {
    baseId: string;
    entries: Array<Record<string, any>>;
    qTypeMap: Record<string, QuestionScreeningType>;
  }) => Promise<void>;
  submitting: boolean;
}) {
  const [form] = Form.useForm();
  const questions = (base.questions || [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // peta tipe pertanyaan
  const qTypeMap = useMemo<Record<string, QuestionScreeningType>>(
    () => Object.fromEntries(questions.map((q) => [q.id, q.inputType as any])),
    [questions]
  );

  const allowMultiple = !!base.allowMultipleSubmissions;

  return (
    <div>
      {base.desc ? (
        <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
          {base.desc}
        </Text>
      ) : null}

      {questions.length === 0 ? (
        <Empty
          style={{ padding: 24 }}
          description="No questions in this base."
        />
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={(raw) =>
            onSubmitAll({
              baseId: base.id,
              entries: raw.entries ?? [],
              qTypeMap,
            })
          }
          style={{ maxWidth: 880 }}
          initialValues={{
            // default: satu set (entry) kosong
            entries: [{}],
          }}
        >
          <Form.List name="entries">
            {(fields, { add, remove }) => (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {fields.map((field, idx) => (
                  <div
                    key={field.key}
                    style={{
                      background: "#fff",
                      border: "1px solid #edf1f5",
                      borderRadius: 12,
                      padding: 16,
                    }}
                  >
                    {/* Header tiap entry */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <Text strong>{`Entry #${idx + 1}`}</Text>
                      {allowMultiple && fields.length > 1 ? (
                        <Button
                          danger
                          type="link"
                          onClick={() => remove(field.name)}
                        >
                          Remove
                        </Button>
                      ) : null}
                    </div>

                    <div className="q-stack">
                      {questions.map((q) => (
                        <QuestionInput
                          key={q.id}
                          q={q}
                          /** path ke field: entries[idx][q.id] */
                          namePath={[field.name, q.id]}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                {/* Tombol tambah jika base memperbolehkan multiple submissions */}
                {allowMultiple ? (
                  <>
                    <Button
                      onClick={() => add({})}
                      type="dashed"
                      style={{ width: "100%" }}
                    >
                      + Add another
                    </Button>
                    <Text type="secondary">Click + to add another entry</Text>
                  </>
                ) : null}
              </div>
            )}
          </Form.List>

          <Space style={{ marginTop: 16 }}>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Submit Answers
            </Button>
          </Space>
        </Form>
      )}

      <style jsx>{`
        .q-stack {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
      `}</style>
    </div>
  );
}

/* ================= Single Question Input ================= */
function QuestionInput({
  q,
  namePath,
}: {
  q: QuestionScreening & { options: QuestionOption[] };
  /** contoh: ['entries', 0, q.id] – tetapi kita kirim dari parent sebagai [field.name, q.id] */
  namePath: (string | number)[];
}) {
  const isSingle = q.inputType === "SINGLE_CHOICE";
  const isMulti = q.inputType === "MULTIPLE_CHOICE";
  const isText = q.inputType === "TEXT";

  return (
    <div className="qi">
      <div className="qi-head">
        <Text strong className="qi-question">
          {q.text}
        </Text>
        {q.required && <span className="qi-required">Required</span>}
      </div>

      {q.helpText ? (
        <Text type="secondary" style={{ display: "block", marginTop: 4 }}>
          {q.helpText}
        </Text>
      ) : null}

      <div className="qi-body">
        {isText && (
          <Form.Item
            name={namePath}
            rules={[
              { required: q.required, message: "This field is required." },
            ]}
          >
            <Input
              placeholder={q.placeholder || "Type your answer…"}
              maxLength={q.maxLength ?? undefined}
              showCount={!!q.maxLength}
            />
          </Form.Item>
        )}

        {isSingle && (
          <Form.Item
            name={namePath}
            rules={[
              { required: q.required, message: "Please select one option." },
            ]}
          >
            <Radio.Group style={{ display: "grid", gap: 8 }}>
              {q.options
                ?.slice()
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((op) => (
                  <Radio key={op.id} value={op.id /* pakai option.id */}>
                    {op.label}
                  </Radio>
                ))}
            </Radio.Group>
          </Form.Item>
        )}

        {isMulti && (
          <Form.Item
            name={namePath}
            rules={[
              {
                validator: (_, value: string[]) => {
                  if (!q.required) return Promise.resolve();
                  return Array.isArray(value) && value.length > 0
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error("Please select at least one option.")
                      );
                },
              },
            ]}
          >
            <Checkbox.Group style={{ display: "grid", gap: 8 }}>
              {q.options
                ?.slice()
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((op) => (
                  <Checkbox key={op.id} value={op.id /* pakai option.id */}>
                    {op.label}
                  </Checkbox>
                ))}
            </Checkbox.Group>
          </Form.Item>
        )}
      </div>

      <style jsx>{`
        .qi {
          background: #fff;
          border: 1px solid #edf1f5;
          border-radius: 12px;
          padding: 16px;
        }
        .qi-head {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .qi-question {
          font-size: 16px;
          color: #0f172a;
        }
        .qi-required {
          font-size: 12px;
          color: #b91c1c;
          background: #ffe9e9;
          border: 1px solid rgba(185, 28, 28, 0.2);
          padding: 0 8px;
          border-radius: 999px;
          line-height: 20px;
        }
        .qi-body {
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
}
