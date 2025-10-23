"use client";

import { useEffect, useMemo } from "react";
import { Button, Form, FormInstance, Select, Tag, Input } from "antd";
import type { EvaluationStatus } from "@prisma/client";

// HOOKS
import { useEvalutors } from "@/app/hooks/evaluator";
import { useQuestionBaseMatriks } from "@/app/hooks/base-question-matriks";

/* ===================== Types ===================== */
/** CREATE: assign ke banyak evaluator sekaligus */
export type CreatePayload = {
  applicant_id: string;
  base_matriks_id: string;
  evaluator_ids: string[];
  link_url?: string | null;
};

/** UPDATE: update satu assignment */
export type UpdatePayload = {
  base_matriks_id?: string;
  evaluatorId?: string;
  status?: EvaluationStatus;
  link_url?: string | null;
};

type Props = {
  handleFinish: (values: CreatePayload | UpdatePayload) => Promise<void>;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  type: "create" | "update";
  initialValues?: Partial<UpdatePayload> & {
    base_matriks_id?: string;
    evaluatorId?: string;
    status?: EvaluationStatus;
    link_url?: string | null;
  };
  /** applicant_id WAJIB dikirim saat create */
  applicantId?: string;
  form?: FormInstance<any>;
};

export default function EvaluationAssignmentForm({
  handleFinish,
  loadingCreate,
  loadingUpdate,
  type,
  initialValues,
  applicantId,
  form: externalForm,
}: Props) {
  const [form] = Form.useForm<any>();
  const usedForm = externalForm ?? form;

  // data evaluators
  const { data: evaluatorsData, onCreateLoading: loadingEvaluators } =
    useEvalutors({});

  // data base matriks
  const { data: basesData, fetchLoading: loadingBases } =
    useQuestionBaseMatriks({});

  // ===== Prefill =====
  useEffect(() => {
    if (type === "create") {
      usedForm.setFieldsValue({
        base_matriks_id: initialValues?.base_matriks_id ?? undefined,
        evaluator_ids: [],
        link_url: initialValues?.link_url ?? "",
      });
    } else {
      usedForm.setFieldsValue({
        base_matriks_id: initialValues?.base_matriks_id ?? undefined,
        evaluatorId: initialValues?.evaluatorId ?? undefined,
        status: initialValues?.status ?? undefined,
        link_url: initialValues?.link_url ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, initialValues]);

  const submitting = loadingCreate || loadingUpdate;

  const idToLabel = useMemo(
    () => new Map((evaluatorsData ?? []).map((e: any) => [e.id, e.name])),
    [evaluatorsData]
  );

  // ===== Submit handler (normalisasi) =====
  const onFinish = async (vals: any) => {
    if (type === "create") {
      if (!applicantId) {
        // Guard: applicantId wajib saat create
        // (boleh ganti jadi notification.error kalau kamu pakai antd App)
        throw new Error("Missing applicantId for create");
      }
      const payload: CreatePayload = {
        applicant_id: applicantId,
        base_matriks_id: vals.base_matriks_id,
        evaluator_ids: vals.evaluator_ids, // array
        link_url: vals.link_url ?? "",
      };
      await handleFinish(payload);
    } else {
      const payload: UpdatePayload = {
        base_matriks_id: vals.base_matriks_id,
        evaluatorId: vals.evaluatorId,
        status: vals.status,
        link_url: vals.link_url ?? "",
      };
      await handleFinish(payload);
    }
  };

  return (
    <Form
      form={usedForm}
      layout="vertical"
      onFinish={onFinish}
      disabled={submitting}
    >
      {/* Base Matriks */}
      <Form.Item
        name="base_matriks_id"
        label="Matrix Base"
        rules={[{ required: true, message: "Pilih base matriks" }]}
      >
        <Select
          placeholder="Pilih base matriks"
          loading={loadingBases}
          options={(basesData ?? []).map((b: any) => ({
            label: b.name,
            value: b.id,
          }))}
          showSearch
          optionFilterProp="label"
        />
      </Form.Item>

      {type === "create" ? (
        <>
          {/* Evaluators multiple */}
          <Form.Item
            name="evaluator_ids"
            label="Evaluators"
            rules={[
              { required: true, message: "Pilih minimal satu evaluator" },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Pilih evaluator"
              loading={loadingEvaluators}
              options={(evaluatorsData ?? []).map((e: any) => ({
                label: e.name,
                value: e.id,
              }))}
              showSearch
              optionFilterProp="label"
              allowClear
              maxTagCount="responsive"
              tagRender={(tagProps) => {
                const { label, value, closable, onClose } = tagProps;
                return (
                  <Tag
                    closable={closable}
                    onClose={onClose}
                    style={{ marginRight: 4 }}
                  >
                    {label ?? idToLabel.get(value as string) ?? value}
                  </Tag>
                );
              }}
            />
          </Form.Item>
        </>
      ) : (
        <>
          {/* Evaluator single (opsional) */}
          <Form.Item name="evaluatorId" label="Evaluator">
            <Select
              placeholder="Pilih evaluator (opsional)"
              loading={loadingEvaluators}
              allowClear
              options={(evaluatorsData ?? []).map((e: any) => ({
                label: e.name,
                value: e.id,
              }))}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          {/* Status */}
          <Form.Item name="status" label="Status">
            <Select
              placeholder="Pilih status"
              allowClear
              options={[
                { value: "PENDING", label: "PENDING" },
                { value: "IN_PROGRESS", label: "IN_PROGRESS" },
                { value: "SUBMITTED", label: "SUBMITTED" },
                { value: "CANCELLED", label: "CANCELLED" },
              ]}
            />
          </Form.Item>

          {/* Link URL (opsional) */}
          <Form.Item name="link_url" label="Link URL (opsional)">
            <Input placeholder="https://meeting-link/..." />
          </Form.Item>
        </>
      )}

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={type === "create" ? loadingCreate : loadingUpdate}
          size="large"
          style={{
            width: "100%",
            backgroundColor: "#C30010",
            borderColor: "#C30010",
          }}
        >
          {type === "create" ? "Assign Evaluators" : "Update Assignment"}
        </Button>
      </Form.Item>
    </Form>
  );
}
