"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Divider,
  Empty,
  Form,
  Grid,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Typography,
  Skeleton,
  InputNumber,
  Tooltip,
  notification,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  QuestionCircleOutlined,
  EyeOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { useParams } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/en";
dayjs.locale("en");

import {
  useQuestionScreening,
  useQuestionScreenings,
} from "@/app/hooks/question-screening";

import type { QuestionScreeningDataModel } from "@/app/models/question-screening";
import type { QuestionScreeningType, QuestionOption } from "@prisma/client";

// === DTOs dari models (pastikan path sama dengan project Anda) ===
import type {
  QuestionScreeningCreateDTO,
  QuestionScreeningUpdateDTO,
} from "@/app/models/question-screening";

const BRAND = "#003A6F";
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

type QuestionOptionDataModel = QuestionOption;

/** Form option untuk edit (bawa id jika existing) */
type OptionEditForm = {
  id?: string;
  label: string;
  value: string;
  order?: number | null;
  active?: boolean | null;
};

/** Item tiap row pada BulkCreate (tanpa baseId) */
type BulkCreateItem = Omit<QuestionScreeningCreateDTO, "baseId">;

/* ------------------------------------------------------- */
function getErrMsg(e: unknown): string {
  const anyErr = e as any;
  return (
    anyErr?.response?.data?.message ||
    anyErr?.data?.message ||
    anyErr?.message ||
    "An unexpected error occurred."
  );
}

function typeBadgeBg(t: QuestionScreeningType) {
  switch (t) {
    case "TEXT":
      return "#E6F4FF";
    case "SINGLE_CHOICE":
      return "#F6FFED";
    case "MULTIPLE_CHOICE":
      return "#FFF7E6";
    default:
      return "#F5F5F5";
  }
}

function noOptionsLabel(t: QuestionScreeningType) {
  if (t === "TEXT") return "No options – Text input field";
  if (t === "SINGLE_CHOICE") return "Add options to render as radio buttons";
  if (t === "MULTIPLE_CHOICE") return "Add options to render as checkboxes";
  return "No options";
}

function isChoice(t?: QuestionScreeningType) {
  return t === "SINGLE_CHOICE" || t === "MULTIPLE_CHOICE";
}
/* ------------------------------------------------------- */

export default function Content(): JSX.Element {
  const screens = useBreakpoint();

  // -------------------------- Base (from route) --------------------------
  const params = useParams();
  const baseId = String(params?.id || "");

  // ----------------------------- UI states -------------------------------
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<
    | (QuestionScreeningDataModel & { options?: QuestionOptionDataModel[] })
    | null
  >(null);

  // Modals
  const [isBulkOpen, setBulkOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);

  // Forms
  const [bulkForm] = Form.useForm<{ questions: BulkCreateItem[] }>();
  const [editForm] = Form.useForm<
    Omit<QuestionScreeningUpdateDTO, "options"> & { options?: OptionEditForm[] }
  >();

  // ----------------------------- Data & CRUD -----------------------------
  const {
    data: questionScreening,
    onCreate,
    onCreateLoading,
    onDelete,
    onDeleteLoading,
    // refetch,
  } = useQuestionScreenings({
    queryString: `base_id=${baseId}`,
  });

  const { onUpdate, onUpdateLoading } = useQuestionScreening({
    id: String(editTarget?.id || ""),
  });

  // ------------------------------ Filtering ------------------------------
  const list = Array.isArray(questionScreening) ? questionScreening : [];
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((x) => {
      const t = (x?.text || "").toLowerCase();
      const help = (x?.helpText || "").toLowerCase();
      const type = (x?.inputType || "").toLowerCase();
      return t.includes(q) || help.includes(q) || type.includes(q);
    });
  }, [list, search]);

  // ------------------------------ Handlers -------------------------------
  async function handleBulkCreate(values: { questions: BulkCreateItem[] }) {
    if (!baseId) {
      notification.error({ message: "Missing base id" });
      return;
    }
    const items = values.questions || [];

    // Validate basic: choice must have at least one option
    for (const it of items) {
      if (isChoice(it.inputType) && !(it.options && it.options.length)) {
        notification.warning({
          message: "Please add at least one option for choice type.",
        });
        return;
      }
    }

    try {
      await Promise.allSettled(
        items.map((it, idx) => {
          // bentuk DTO; hapus options jika kosong
          const dto: QuestionScreeningCreateDTO = {
            baseId,
            text: it.text?.trim(),
            inputType: it.inputType,
            required: it.required ?? true,
            order: typeof it.order === "number" ? it.order : idx + 1,
            helpText: it.helpText?.trim?.() || null,
            placeholder: it.placeholder?.trim?.() || null,
            minLength: it.minLength ?? null,
            maxLength: it.maxLength ?? null,
          };
          if (isChoice(it.inputType) && it.options && it.options.length > 0) {
            dto.options = it.options.map((o, i) => ({
              label: o.label?.trim(),
              value: o.value?.trim(),
              order: typeof o.order === "number" ? o.order : i + 1,
              active: o.active ?? true,
            }));
          }
          return onCreate?.(dto);
        })
      );

      bulkForm.resetFields();
      setBulkOpen(false);
      message.success("Questions created.");
      // await refetch?.();
    } catch (e) {
      notification.error({
        message: "Create failed",
        description: getErrMsg(e),
      });
    }
  }

  function openEdit(
    item: QuestionScreeningDataModel & { options?: QuestionOptionDataModel[] }
  ) {
    setEditTarget(item);

    // isi form: options berisi id agar bisa hitung deleteIds & upsert
    editForm.setFieldsValue({
      text: item.text || "",
      inputType: item.inputType as QuestionScreeningType,
      required: item.required ?? true,
      order: item.order ?? 0,
      helpText: item.helpText || "",
      placeholder: item.placeholder || "",
      minLength: item.minLength ?? null,
      maxLength: item.maxLength ?? null,
      options:
        item?.options?.map((o) => ({
          id: o.id,
          label: o.label,
          value: o.value,
          order: o.order ?? null,
          active: (o as any).active ?? true,
        })) || [],
    });
    setEditOpen(true);
  }

  async function handleUpdate(
    values: Omit<QuestionScreeningUpdateDTO, "options"> & {
      options?: OptionEditForm[];
    }
  ) {
    if (!editTarget) return;

    // Validasi pilihan
    if (
      isChoice(values.inputType) &&
      !(values.options && values.options.length)
    ) {
      notification.warning({
        message: "Please add at least one option for choice type.",
      });
      return;
    }

    try {
      // hitung deleteIds & upsert dibanding data existing
      const prev = (editTarget.options || []) as QuestionOptionDataModel[];
      const next = (values.options || []) as OptionEditForm[];

      const nextIds = new Set(next.filter((x) => x.id).map((x) => x.id!));
      const deleteIds = prev.map((p) => p.id).filter((id) => !nextIds.has(id));

      const upsert = next.map((o, i) => ({
        id: o.id,
        label: o.label?.trim(),
        value: o.value?.trim(),
        order: typeof o.order === "number" ? o.order : i + 1,
        active: o.active ?? true,
      }));

      const payload: QuestionScreeningUpdateDTO = {
        text: values.text?.trim(),
        inputType: values.inputType,
        required: values.required,
        order: values.order,
        helpText: values.helpText?.trim?.() ?? null,
        placeholder: values.placeholder?.trim?.() ?? null,
        minLength: values.minLength ?? null,
        maxLength: values.maxLength ?? null,
      };

      if (isChoice(values.inputType)) {
        payload.options = {
          upsert,
          deleteIds,
        };
      }

      await onUpdate?.(payload);
      setEditOpen(false);
      message.success("Question updated.");
      // await refetch?.();
    } catch (e) {
      notification.error({
        message: "Update failed",
        description: getErrMsg(e),
      });
    }
  }

  async function handleDelete(id: string) {
    try {
      await onDelete?.(id);
      message.success("Question deleted.");
      // await refetch?.();
    } catch (e) {
      notification.error({
        message: "Delete failed",
        description: getErrMsg(e),
      });
    }
  }

  // ------------------------------ Render ------------------------------
  return (
    <div style={{ padding: screens.md ? 24 : 16 }}>
      {/* Header */}
      <Space direction="vertical" size={6} style={{ display: "block" }}>
        <Title level={2} style={{ margin: 0, color: "#111827" }}>
          Screening Questions
        </Title>
        <Text type="secondary">
          Manage and organize your screening questions
        </Text>

        <Space
          align="center"
          style={{
            width: "100%",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            marginTop: 8,
          }}
        >
          <Input
            allowClear
            placeholder="Search questions (text/help/type)…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 520, borderRadius: 12 }}
          />

          <Space.Compact>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ background: BRAND, borderRadius: 12 }}
              onClick={() => setBulkOpen(true)}
              disabled={!baseId}
            >
              Create Multiple
            </Button>
          </Space.Compact>
        </Space>
      </Space>

      <Divider style={{ marginTop: 16, marginBottom: 16 }} />

      {/* Stack Panels */}
      {questionScreening == null ? (
        <Row gutter={[0, 12]}>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="q-panel skeleton">
              <Skeleton active paragraph={{ rows: 3 }} />
            </div>
          ))}
        </Row>
      ) : filtered.length === 0 ? (
        <Empty
          style={{ padding: 24 }}
          description={
            <span>
              No questions yet. Click <b>Create Multiple</b> to add some.
            </span>
          }
        />
      ) : (
        <div className="q-stack">
          {filtered
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((q) => {
              const updatedAt = q.updatedAt ? dayjs(q.updatedAt) : null;
              const choice = isChoice(q.inputType);
              const hasOptions = (q as any)?.options?.length > 0;

              return (
                <div key={q.id} className="q-panel">
                  {/* Header line: title + toolbar */}
                  <div className="q-head">
                    <div className="q-title">
                      <Text strong className="q-title-text">
                        {q.text}
                      </Text>
                      {q.helpText ? (
                        <Text type="secondary" className="q-subtitle">
                          {q.helpText}
                        </Text>
                      ) : null}

                      <div className="q-badges">
                        <span
                          className="q-pill"
                          style={{ background: typeBadgeBg(q.inputType) }}
                        >
                          {q.inputType}
                        </span>
                        <span
                          className={`q-pill ${
                            q.required ? "q-pill-danger" : "q-pill-muted"
                          }`}
                        >
                          {q.required ? "Required" : "Optional"}
                        </span>
                        <span className="q-pill q-pill-muted">{`Order: ${
                          q.order ?? 0
                        }`}</span>
                      </div>
                    </div>

                    <div className="q-toolbar">
                      <Tooltip title="Edit">
                        <Button
                          size="small"
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => openEdit(q as any)}
                        />
                      </Tooltip>
                      <Tooltip title="Preview">
                        <Button
                          size="small"
                          type="text"
                          icon={<EyeOutlined />}
                          onClick={() =>
                            message.info("Preview coming soon (mock).")
                          }
                        />
                      </Tooltip>
                      <Tooltip title="Duplicate">
                        <Button
                          size="small"
                          type="text"
                          icon={<CopyOutlined />}
                          onClick={async () => {
                            try {
                              const dto: QuestionScreeningCreateDTO = {
                                baseId,
                                text: `${q.text} (copy)`,
                                inputType: q.inputType,
                                required: q.required,
                                order: (q.order ?? 0) + 1,
                                helpText: q.helpText ?? null,
                                placeholder: q.placeholder ?? null,
                                minLength: q.minLength ?? null,
                                maxLength: q.maxLength ?? null,
                              };
                              if (choice && (q as any)?.options?.length > 0) {
                                dto.options = (q as any).options.map(
                                  (o: QuestionOptionDataModel, i: number) => ({
                                    label: o.label,
                                    value: o.value,
                                    order: o.order ?? i + 1,
                                    active: (o as any).active ?? true,
                                  })
                                );
                              }
                              await onCreate?.(dto);
                              message.success("Question duplicated.");
                            } catch (e) {
                              notification.error({
                                message: "Duplicate failed",
                                description: getErrMsg(e),
                              });
                            }
                          }}
                        />
                      </Tooltip>
                    </div>
                  </div>

                  {/* Options box */}
                  <div className="q-options">
                    {choice ? (
                      hasOptions ? (
                        <Space wrap>
                          {(q as any).options.map(
                            (o: QuestionOptionDataModel) => (
                              <span className="q-chip" key={o.id}>
                                {o.label}
                              </span>
                            )
                          )}
                        </Space>
                      ) : (
                        <span className="q-empty">
                          {noOptionsLabel(q.inputType)}
                        </span>
                      )
                    ) : (
                      <span className="q-empty">
                        {noOptionsLabel(q.inputType)}
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="q-foot">
                    <Text type="secondary">
                      Updated:{" "}
                      {updatedAt ? updatedAt.format("MMM DD, YYYY HH:mm") : "-"}
                    </Text>

                    <Space>
                      <Button onClick={() => openEdit(q as any)}>Edit</Button>
                      <Popconfirm
                        title="Delete question?"
                        description="This action cannot be undone."
                        okText="Delete"
                        okButtonProps={{
                          danger: true,
                          loading: onDeleteLoading,
                        }}
                        cancelText="Cancel"
                        onConfirm={() => handleDelete(q.id)}
                      >
                        <Button danger loading={onDeleteLoading}>
                          Delete
                        </Button>
                      </Popconfirm>
                    </Space>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Bulk Create Modal */}
      <Modal
        title="Create Multiple Questions"
        open={isBulkOpen}
        onCancel={() => setBulkOpen(false)}
        okText="Save All"
        cancelText="Cancel"
        onOk={() => bulkForm.submit()}
        confirmLoading={onCreateLoading}
        width={900}
      >
        <BulkCreateForm
          form={bulkForm}
          baseId={baseId}
          onSubmit={handleBulkCreate}
          submitLoading={onCreateLoading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Question"
        open={isEditOpen}
        onCancel={() => setEditOpen(false)}
        okText="Update"
        cancelText="Cancel"
        onOk={() => editForm.submit()}
        confirmLoading={onUpdateLoading}
        width={700}
      >
        <QuestionForm form={editForm} onSubmit={handleUpdate} />
      </Modal>

      {/* Styles */}
      <style jsx global>{`
        .q-stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .q-panel {
          background: #fff;
          border: 1px solid #edf1f5;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
          transition: box-shadow 160ms ease, border-color 160ms ease;
        }
        .q-panel:hover {
          border-color: #dbe7ff;
          box-shadow: 0 6px 18px rgba(16, 24, 40, 0.06);
        }
        .q-panel.skeleton {
          padding: 20px;
        }
        .q-head {
          display: flex;
          align-items: start;
          justify-content: space-between;
          gap: 12px;
        }
        .q-title-text {
          font-size: 18px;
          color: #0f172a;
        }
        .q-subtitle {
          display: block;
          margin-top: 4px;
        }
        .q-badges {
          display: flex;
          gap: 8px;
          margin-top: 10px;
          flex-wrap: wrap;
        }
        .q-pill {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 12px;
          line-height: 20px;
          color: #0f172a;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        .q-pill-muted {
          background: #f5f7fb;
          color: #475569;
        }
        .q-pill-danger {
          background: #ffe9e9;
          color: #b91c1c;
          border-color: rgba(185, 28, 28, 0.2);
        }
        .q-toolbar .ant-btn {
          border-radius: 8px;
        }
        .q-options {
          margin-top: 12px;
          padding: 14px;
          border: 1px dashed #e5e7eb;
          border-radius: 10px;
          background: #fafbfe;
          min-height: 48px;
          display: flex;
          align-items: center;
        }
        .q-empty {
          color: #64748b;
          font-style: italic;
        }
        .q-chip {
          display: inline-block;
          padding: 4px 10px;
          font-size: 12px;
          border-radius: 999px;
          background: #f1f5ff;
          border: 1px solid #e0e7ff;
        }
        .q-foot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
        }
      `}</style>
    </div>
  );
}

/* ====================================================================== */
/*                           Bulk Create Form                              */
/* ====================================================================== */
type BulkCreateFormProps = {
  baseId: string;
  form: any;
  submitLoading?: boolean;
  onSubmit: (payload: { questions: BulkCreateItem[] }) => Promise<void>;
};

function BulkCreateForm({ baseId, form, onSubmit }: BulkCreateFormProps) {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
      initialValues={{
        questions: [
          {
            text: "",
            inputType: "TEXT" as QuestionScreeningType,
            required: true,
            order: 0,
            helpText: "",
            placeholder: "",
            minLength: null,
            maxLength: null,
            options: [],
          } as BulkCreateItem,
        ],
      }}
    >
      <Form.List name="questions">
        {(fields, { add, remove }) => (
          <Space direction="vertical" style={{ width: "100%" }}>
            {fields.map(({ key, name, ...rest }, idx) => (
              <div
                key={key}
                style={{
                  padding: 12,
                  border: "1px solid #edf1f5",
                  borderRadius: 12,
                }}
              >
                <Space
                  align="baseline"
                  style={{ justifyContent: "space-between", width: "100%" }}
                >
                  <Text strong style={{ color: BRAND }}>
                    Question #{idx + 1}
                  </Text>
                  <Button danger type="link" onClick={() => remove(name)}>
                    Remove
                  </Button>
                </Space>

                <Form.Item
                  {...rest}
                  name={[name, "text"]}
                  label="Question Text"
                  rules={[
                    { required: true, message: "Question text is required." },
                    { min: 3, message: "Minimum 3 characters." },
                  ]}
                >
                  <Input placeholder="Write your question here…" />
                </Form.Item>

                <Space size="large" wrap style={{ width: "100%" }}>
                  <Form.Item
                    {...rest}
                    name={[name, "inputType"]}
                    label="Input Type"
                    rules={[{ required: true }]}
                  >
                    <Select
                      style={{ width: 240 }}
                      options={[
                        { value: "TEXT", label: "TEXT (free text)" },
                        {
                          value: "SINGLE_CHOICE",
                          label: "SINGLE_CHOICE (one answer)",
                        },
                        {
                          value: "MULTIPLE_CHOICE",
                          label: "MULTIPLE_CHOICE (many answers)",
                        },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item
                    {...rest}
                    name={[name, "required"]}
                    label="Required"
                    valuePropName="checked"
                  >
                    <Switch defaultChecked />
                  </Form.Item>

                  <Form.Item
                    {...rest}
                    name={[name, "order"]}
                    label="Order"
                    tooltip="Display order (ascending)"
                  >
                    <InputNumber min={0} style={{ width: 120 }} />
                  </Form.Item>
                </Space>

                <Form.Item
                  {...rest}
                  name={[name, "helpText"]}
                  label="Help Text"
                >
                  <Input.TextArea
                    rows={2}
                    placeholder="Optional hint for respondents…"
                  />
                </Form.Item>

                {/* TEXT-only fields */}
                <FormDependency path={["questions", name, "inputType"]}>
                  {(type: QuestionScreeningType) =>
                    type === "TEXT" && (
                      <Space size="large" wrap style={{ width: "100%" }}>
                        <Form.Item
                          {...rest}
                          name={[name, "placeholder"]}
                          label="Placeholder"
                        >
                          <Input placeholder="e.g., Tell us about your experience…" />
                        </Form.Item>
                        <Form.Item
                          {...rest}
                          name={[name, "minLength"]}
                          label="Min Length"
                        >
                          <InputNumber min={0} style={{ width: 160 }} />
                        </Form.Item>
                        <Form.Item
                          {...rest}
                          name={[name, "maxLength"]}
                          label="Max Length"
                        >
                          <InputNumber min={1} style={{ width: 160 }} />
                        </Form.Item>
                      </Space>
                    )
                  }
                </FormDependency>

                {/* Choice options */}
                <FormDependency path={["questions", name, "inputType"]}>
                  {(type: QuestionScreeningType) =>
                    (type === "SINGLE_CHOICE" ||
                      type === "MULTIPLE_CHOICE") && (
                      <>
                        <Divider style={{ margin: "12px 0" }} />
                        <Space align="center">
                          <Text strong>Options</Text>
                          <Tooltip title="Provide at least one option for choice types.">
                            <QuestionCircleOutlined />
                          </Tooltip>
                        </Space>

                        <Form.List name={[name, "options"]}>
                          {(optFields, optOps) => (
                            <Space
                              direction="vertical"
                              style={{ width: "100%" }}
                            >
                              {optFields.map(
                                ({ key: ok, name: oname, ...orest }, oi) => (
                                  <Space
                                    key={ok}
                                    align="baseline"
                                    wrap
                                    style={{ width: "100%" }}
                                  >
                                    <Form.Item
                                      {...orest}
                                      name={[oname, "label"]}
                                      label={oi === 0 ? "Label" : ""}
                                      rules={[
                                        {
                                          required: true,
                                          message: "Label is required.",
                                        },
                                      ]}
                                    >
                                      <Input
                                        placeholder="e.g., Daily"
                                        style={{ width: 220 }}
                                      />
                                    </Form.Item>

                                    <Form.Item
                                      {...orest}
                                      name={[oname, "value"]}
                                      label={oi === 0 ? "Value" : ""}
                                      rules={[
                                        {
                                          required: true,
                                          message: "Value is required.",
                                        },
                                      ]}
                                    >
                                      <Input
                                        placeholder="e.g., daily"
                                        style={{ width: 220 }}
                                      />
                                    </Form.Item>

                                    <Form.Item
                                      {...orest}
                                      name={[oname, "order"]}
                                      label={oi === 0 ? "Order" : ""}
                                    >
                                      <InputNumber
                                        min={0}
                                        style={{ width: 120 }}
                                      />
                                    </Form.Item>

                                    <Form.Item
                                      {...orest}
                                      name={[oname, "active"]}
                                      label={oi === 0 ? "Active" : ""}
                                      valuePropName="checked"
                                      initialValue={true}
                                    >
                                      <Switch />
                                    </Form.Item>

                                    <Button
                                      danger
                                      type="link"
                                      onClick={() => optOps.remove(oname)}
                                    >
                                      Remove
                                    </Button>
                                  </Space>
                                )
                              )}

                              <Button
                                onClick={() => optOps.add({ active: true })}
                                icon={<PlusOutlined />}
                              >
                                Add Option
                              </Button>
                            </Space>
                          )}
                        </Form.List>
                      </>
                    )
                  }
                </FormDependency>
              </div>
            ))}

            <Button
              onClick={() =>
                add({
                  text: "",
                  inputType: "TEXT" as QuestionScreeningType,
                  required: true,
                  order: 0,
                  helpText: "",
                  placeholder: "",
                  minLength: null,
                  maxLength: null,
                  options: [],
                } as BulkCreateItem)
              }
              icon={<PlusOutlined />}
            >
              Add Question
            </Button>
          </Space>
        )}
      </Form.List>
    </Form>
  );
}

/* ====================================================================== */
/*                           Single Edit Form                              */
/* ====================================================================== */
type QuestionFormProps = {
  form: any;
  onSubmit: (
    payload: Omit<QuestionScreeningUpdateDTO, "options"> & {
      options?: OptionEditForm[];
    }
  ) => Promise<void>;
};

function QuestionForm({ form, onSubmit }: QuestionFormProps) {
  const type = Form.useWatch<QuestionScreeningType>("inputType", form);
  const choice = isChoice(type);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
      initialValues={{
        text: "",
        inputType: "TEXT" as QuestionScreeningType,
        required: true,
        order: 0,
        helpText: "",
        placeholder: "",
        minLength: null,
        maxLength: null,
        options: [],
      }}
    >
      <Form.Item
        label="Question Text"
        name="text"
        rules={[
          { required: true, message: "Question text is required." },
          { min: 3, message: "Minimum 3 characters." },
        ]}
      >
        <Input placeholder="Write your question here…" />
      </Form.Item>

      <Form.Item
        label="Input Type"
        name="inputType"
        rules={[{ required: true }]}
      >
        <Select
          options={[
            { value: "TEXT", label: "TEXT (free text)" },
            { value: "SINGLE_CHOICE", label: "SINGLE_CHOICE (one answer)" },
            {
              value: "MULTIPLE_CHOICE",
              label: "MULTIPLE_CHOICE (many answers)",
            },
          ]}
        />
      </Form.Item>

      <Space size="large" wrap style={{ width: "100%" }}>
        <Form.Item label="Required" name="required" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item
          label="Order"
          name="order"
          tooltip="Display order (ascending)"
        >
          <InputNumber min={0} style={{ width: 120 }} />
        </Form.Item>
      </Space>

      <Form.Item label="Help Text" name="helpText">
        <Input.TextArea rows={3} placeholder="Optional hint for respondents…" />
      </Form.Item>

      {type === "TEXT" && (
        <>
          <Form.Item label="Placeholder" name="placeholder">
            <Input placeholder="e.g., Tell us about your experience…" />
          </Form.Item>

          <Space size="large" wrap style={{ width: "100%" }}>
            <Form.Item label="Min Length" name="minLength">
              <InputNumber
                min={0}
                style={{ width: 160 }}
                placeholder="optional"
              />
            </Form.Item>
            <Form.Item label="Max Length" name="maxLength">
              <InputNumber
                min={1}
                style={{ width: 160 }}
                placeholder="optional"
              />
            </Form.Item>
          </Space>
        </>
      )}

      {choice && (
        <>
          <Divider style={{ marginTop: 8, marginBottom: 12 }} />
          <Space align="center">
            <Text strong>Options</Text>
            <Tooltip title="Provide at least one option for choice types.">
              <QuestionCircleOutlined />
            </Tooltip>
          </Space>

          <Form.List name="options">
            {(fields, { add, remove }) => (
              <Space direction="vertical" style={{ width: "100%" }}>
                {fields.map(({ key, name, ...restField }, idx) => (
                  <Space
                    key={key}
                    align="baseline"
                    wrap
                    style={{ width: "100%" }}
                  >
                    {/* id (hidden) untuk existing option */}
                    <Form.Item {...restField} name={[name, "id"]} hidden>
                      <Input />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "label"]}
                      label={idx === 0 ? "Label" : ""}
                      rules={[
                        { required: true, message: "Label is required." },
                      ]}
                    >
                      <Input placeholder="e.g., Daily" style={{ width: 220 }} />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "value"]}
                      label={idx === 0 ? "Value" : ""}
                      rules={[
                        { required: true, message: "Value is required." },
                      ]}
                    >
                      <Input placeholder="e.g., daily" style={{ width: 220 }} />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "order"]}
                      label={idx === 0 ? "Order" : ""}
                    >
                      <InputNumber min={0} style={{ width: 120 }} />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "active"]}
                      label={idx === 0 ? "Active" : ""}
                      valuePropName="checked"
                      initialValue={true}
                    >
                      <Switch />
                    </Form.Item>

                    <Button danger type="link" onClick={() => remove(name)}>
                      Remove
                    </Button>
                  </Space>
                ))}

                <Button
                  onClick={() => add({ active: true })}
                  icon={<PlusOutlined />}
                >
                  Add Option
                </Button>
              </Space>
            )}
          </Form.List>
        </>
      )}
    </Form>
  );
}

/* -------------------------- Small helper -------------------------- */
/** Render conditional fields inside Form.List item */
function FormDependency<T>({
  path,
  children,
}: {
  path: (string | number)[];
  children: (val: any) => T;
}) {
  return (
    <Form.Item
      noStyle
      shouldUpdate={(prev, cur) => {
        // rerender when specific nested field changed
        const get = (obj: any, keys: (string | number)[]) =>
          keys.reduce((acc, k) => (acc ? acc[k] : undefined), obj);
        return get(prev, path) !== get(cur, path);
      }}
    >
      {({ getFieldValue }) => children(getFieldValue(path))}
    </Form.Item>
  );
}
