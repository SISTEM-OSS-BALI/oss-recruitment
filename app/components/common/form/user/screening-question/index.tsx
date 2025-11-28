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
import { TypeJob } from "@prisma/client";
import { useAnswerQuestionScreenings } from "@/app/hooks/answer-question-screening";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

/* ================= Types ================= */
type QuestionBaseScreeningWithQuestions = {
  id: string;
  name: string;
  desc: string | null;
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

/* ================= Komponen Utama ================= */
export default function FormScreeningQuestionAll({
  job_id,
  user_id,
  job_type,
}: {
  job_id: string;
  user_id: string;
  job_type: TypeJob;
}) {
  const screens = useBreakpoint();
  const { data, fetchLoading } = useQuestionBaseScreenings({
    queryString: `type=${job_type}`,
  });
  const bases = useMemo(() => coerceBases(data), [data]);
  const selectedBaseId = bases.find((base) =>
    base.questions?.some((question) => question.job_id === job_id)
  )?.id;

  // form global untuk SEMUA base
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const { onCreate } = useAnswerQuestionScreenings({
    fetchEnabled: false,
    showNotification: false,
  });

  const firstBaseId = bases[0]?.id;
  const lastBaseId = bases[bases.length - 1]?.id;
  const isLastTab = (activeTab || firstBaseId) === lastBaseId;

  // mapping entries -> answers (per base)
  function mapEntriesToAnswers(
    entries: Array<Record<string, any>>,
    qTypeMap: Record<string, QuestionScreeningType>
  ) {
    return entries.flatMap((entry) =>
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
  }

  // SUBMIT: validasi semua tab + kirim semua base
  async function handleSubmitAll() {
    try {
      if (!job_id || !user_id) {
        Modal.error({
          title: "Missing information",
          content: "Pastikan kamu sudah login dan memilih pekerjaan.",
        });
        return;
      }

      setSubmitting(true);
      // validasi semua field dari seluruh base
      const raw = await form.validateFields();
      // Struktur yang kita pakai: { bases: { [baseId]: { entries: [...] } } }
      const all = (raw?.bases || {}) as Record<
        string,
        { entries?: Array<Record<string, any>> }
      >;

      // Bangun qTypeMap untuk setiap base
      const baseTypeMaps: Record<
        string,
        Record<string, QuestionScreeningType>
      > = Object.fromEntries(
        bases.map((b) => [
          b.id,
          Object.fromEntries(
            (b.questions || []).map((q) => [q.id, q.inputType as any])
          ),
        ])
      );

      // Kirim per base (hanya kalau ada jawaban)
      const payloads: Array<{
        job_id: string;
        user_id: string;
        base_id: string;
        answers: Array<
          | { questionId: string; answerText: string }
          | { questionId: string; optionIds: string[] }
        >;
      }> = [];

      for (const b of bases) {
        const entries = all?.[b.id]?.entries ?? [];
        const answers = mapEntriesToAnswers(entries, baseTypeMaps[b.id] || {});
        // buang base tanpa jawaban sama sekali (semua kosong)
        const hasAny =
          answers.find((a: any) =>
            "answerText" in a
              ? (a.answerText || "").trim().length > 0
              : Array.isArray(a.optionIds) && a.optionIds.length > 0
          ) != null;

      if (!hasAny) continue;

      payloads.push({ job_id, user_id, base_id: b.id, answers });
    }

      if (payloads.length === 0) {
        Modal.error({
          title: "No answers detected",
          content: "Isi setidaknya satu jawaban sebelum mengirimkan screening.",
        });
        return;
      }

      for (const payload of payloads) {
        await onCreate(payload);
      }

      Modal.success({
        title: "Thank you!",
        content: (
          <div>
            <p>Your screening question answers have been submitted.</p>
            <p>We will review your answers and get back to you soon.</p>
          </div>
        ),
        centered: true,
        onOk: () => {
          router.push("/user/home/apply-job")
        },
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

      {fetchLoading ? (
        <div style={{ padding: 16 }}>
          <Skeleton active paragraph={{ rows: 3 }} />
        </div>
      ) : bases.length === 0 ? (
        <Empty style={{ padding: 24 }} description="No bases found." />
      ) : (
        <>
          {/* Form GLOBAL membungkus semua tab */}
          <Form
            form={form}
            layout="vertical"
            // siapkan object untuk setiap base → { bases: { [id]: { entries: [{}] } } }
            initialValues={{
              bases: Object.fromEntries(
                bases.map((b) => [b.id, { entries: [{}], base_id: b.id }])
              ),
              job_id,
              user_id,
            }}
            style={{ maxWidth: 920 }}
          >
            <Tabs
              activeKey={activeTab || firstBaseId}
              onChange={(k) => setActiveTab(k)}
              destroyInactiveTabPane={false} // penting: jangan hancurkan state tab lain
              items={bases.map((b) => ({
                key: b.id,
                label: b.name,
                children: (
                  <BaseAnswerFields
                    base={b}
                    // path ke form global → ['bases', base.id]
                    basePath={["bases", b.id]}
                  />
                ),
              }))}
            />
          </Form>

          {/* Tombol submit hanya muncul di TAB TERAKHIR */}
          {isLastTab ? (
            <Space style={{ marginTop: 16 }}>
              <Button
                type="primary"
                onClick={handleSubmitAll}
                loading={submitting}
              >
                Submit Answers
              </Button>
            </Space>
          ) : null}
        </>
      )}

      <style jsx global>{`
        .ant-tabs-nav {
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

/* =============== Field per Base (pakai form global) =============== */
function BaseAnswerFields({
  base,
  basePath,
}: {
  base: QuestionBaseScreeningWithQuestions;
  /** contoh: ['bases', base.id] */
  basePath: (string | number)[];
}) {
  const questions = (base.questions || [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

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
        <Form.List name={[...basePath, "entries"]}>
          {(fields, { add, remove }) => (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
                        // relative path → [fieldIndex, questionId]
                        namePath={[field.name, q.id]}
                        fieldKey={[field.fieldKey, q.id]}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {allowMultiple ? (
                <>
                  <Button
                    onClick={() => add({})}
                    type="dashed"
                    style={{ width: "100%" }}
                  >
                    + Add another
                  </Button>
                  <Text type="secondary">Klik + untuk menambah entri baru</Text>
                </>
              ) : null}
            </div>
          )}
        </Form.List>
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
  fieldKey,
}: {
  q: QuestionScreening & { options: QuestionOption[] };
  /** contoh: [fieldIndex, q.id] – relative terhadap Form.List */
  namePath: (string | number)[];
  fieldKey?: (string | number)[];
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
            fieldKey={fieldKey}
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
            fieldKey={fieldKey}
            rules={[
              { required: q.required, message: "Please select one option." },
            ]}
          >
            <Radio.Group style={{ display: "grid", gap: 8 }}>
              {q.options
                ?.slice()
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((op) => (
                  <Radio key={op.id} value={op.id /* gunakan option.id */}>
                    {op.label}
                  </Radio>
                ))}
            </Radio.Group>
          </Form.Item>
        )}

        {isMulti && (
          <Form.Item
            name={namePath}
            fieldKey={fieldKey}
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
                  <Checkbox key={op.id} value={op.id /* gunakan option.id */}>
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
