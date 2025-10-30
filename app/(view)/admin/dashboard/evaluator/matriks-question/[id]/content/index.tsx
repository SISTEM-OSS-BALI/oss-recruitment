"use client";

import { useEffect, useMemo, useState } from "react";
import {
  App as AntdApp,
  Button,
  Divider,
  Empty,
  Form,
  Grid,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Skeleton,
  Space,
  Switch,
  Typography,
  Select,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useParams } from "next/navigation";

import {
  useQuestionMatriks,
  useQuestionMatriksById,
} from "@/app/hooks/question-matriks";

import type { QuestionMatriksType } from "@prisma/client";
import { prettyType } from "@/app/utils/humanize";

const BRAND = "#003A6F";
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

/* -------------------- Types -------------------- */
type OptionItem = {
  label: string;
  value: string;
  order?: number | null;
  active?: boolean | null;
  id?: string;
};

type CreateFormValues = {
  text: string;
  inputType: QuestionMatriksType;
  required?: boolean;
  order?: number;
  helpText?: string | null;
  placeholder?: string | null;
  options?: OptionItem[];
};

type UpdateFormValues = {
  text?: string;
  inputType?: QuestionMatriksType;
  required?: boolean;
  order?: number;
  helpText?: string | null;
  placeholder?: string | null;
  options?: OptionItem[];
};

export default function Content() {
  const { notification } = AntdApp.useApp();
  const screens = useBreakpoint();

  // baseId from route
  const params = useParams();
  const baseId = String(params?.id ?? "");

  // List & CRUD hooks
  const {
    data: rows,
    fetchLoading,
    onCreate,
    onCreateLoading,
    onDelete,
    onDeleteLoading,
  } = useQuestionMatriks({
    queryString: baseId ? `base_id=${baseId}` : undefined,
  });

  // Create modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm] = Form.useForm<CreateFormValues>();
  const createInputType = Form.useWatch("inputType", createForm);

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string>("");

  // Detail + update hook (enabled only when id available)
  const {
    data: editingRow,
    onUpdate,
    onUpdateLoading,
  } = useQuestionMatriksById({ id: editingId || "" });

  const [editForm] = Form.useForm<UpdateFormValues>();
  const editInputType = Form.useWatch("inputType", editForm);

  // Prefill edit form when data is loaded
  useEffect(() => {
    if (!editingRow) return;

    const mappedOptions: OptionItem[] = (
      editingRow.matriksQuestionOption ?? []
    ).map((o) => ({
      label: o.label,
      value: o.value,
      order: o.order ?? 0,
      active: o.active ?? true,
      id: o.id,
    }));

    editForm.setFieldsValue({
      text: editingRow.text,
      inputType: editingRow.inputType,
      required: editingRow.required,
      order: editingRow.order,
      helpText: editingRow.helpText ?? null,
      placeholder: editingRow.placeholder ?? null,
      options: mappedOptions,
    });
  }, [editingRow, editForm]);

  // When the user switches a create form to TEXT, clear options
  useEffect(() => {
    if (createInputType === "TEXT") {
      createForm.setFieldValue("options", []);
    }
  }, [createInputType, createForm]);

  // When the user switches an edit form to TEXT, clear options
  useEffect(() => {
    if (editInputType === "TEXT") {
      editForm.setFieldValue("options", []);
    }
  }, [editInputType, editForm]);

  async function handleCreate(values: CreateFormValues) {
    if (!baseId) {
      notification.error({ message: "Missing base id" });
      return;
    }

    // Only send options on SINGLE_CHOICE
    const shouldSendOptions = values.inputType === "SINGLE_CHOICE";
    const payloadOptions =
      shouldSendOptions &&
      Array.isArray(values.options) &&
      values.options.length > 0
        ? values.options.map((o, i) => ({
            label: o.label.trim(),
            value: o.value.trim(),
            order: o.order ?? i + 1,
            active: o.active ?? true,
          }))
        : undefined;

    try {
      await onCreate({
        baseId,
        text: values.text.trim(),
        inputType: values.inputType,
        required: values.required ?? true,
        order: values.order ?? 0,
        helpText: values.helpText ?? null,
        placeholder: values.placeholder ?? null,
        options: payloadOptions,
      });
      createForm.resetFields();
      setCreateOpen(false);
    } catch (e: any) {
      notification.error({
        message: "Create failed",
        description: e?.response?.data?.message || e?.message || "Error",
      });
    }
  }

  function openEdit(id: string) {
    setEditingId(id);
    setEditOpen(true);
  }

  async function handleUpdate(values: UpdateFormValues) {
    if (!editingId) return;

    const shouldSendOptions = values.inputType === "SINGLE_CHOICE";
    const optionSource = Array.isArray(values.options) ? values.options : [];
    const payloadOptions = shouldSendOptions
      ? optionSource
          .map((o, i) => ({
            id:
              typeof o.id === "string" && o.id.trim().length > 0
                ? o.id.trim()
                : undefined,
            label: (o.label ?? "").trim(),
            value: (o.value ?? "").trim(),
            order: o.order ?? i + 1,
            active: o.active ?? true,
          }))
          .filter((o) => o.label.length > 0 && o.value.length > 0)
      : [];

    try {
      await onUpdate({
        text: values.text?.trim(),
        inputType: values.inputType,
        required: values.required,
        order: values.order,
        helpText: values.helpText ?? null,
        placeholder: values.placeholder ?? null,
        options: payloadOptions,
      });
      setEditOpen(false);
      setEditingId("");
    } catch (e: any) {
      notification.error({
        message: "Update failed",
        description: e?.response?.data?.message || e?.message || "Error",
      });
    }
  }

  const sortedRows = useMemo(
    () => (rows || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [rows]
  );

  const typeBadgeColor = (t: QuestionMatriksType) =>
    t === "SINGLE_CHOICE" ? "#F6FFED" : "#E6F4FF";

  return (
    <div style={{ padding: screens.md ? 24 : 16 }}>
      {/* Header */}
      <Space
        align="center"
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Space direction="vertical" size={6}>
          <Title level={3} style={{ margin: 0, color: "#111827" }}>
            Matrix Questions
          </Title>
          <Text type="secondary">
            Manage rows for your matrix (supports Single Choice and Text).
          </Text>
        </Space>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ background: BRAND, borderRadius: 12 }}
          onClick={() => setCreateOpen(true)}
          disabled={!baseId}
        >
          Add Question
        </Button>
      </Space>

      <Divider style={{ marginTop: 16, marginBottom: 16 }} />

      {/* List FIRST */}
      {fetchLoading ? (
        <Space direction="vertical" style={{ width: "100%" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} active paragraph={{ rows: 2 }} />
          ))}
        </Space>
      ) : sortedRows.length === 0 ? (
        <Empty description="No questions yet." />
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {sortedRows.map((row: any) => (
            <div
              key={row.id}
              style={{
                background: "#fff",
                border: "1px solid #EDF1F5",
                borderRadius: 12,
                padding: 16,
                display: "grid",
                gap: 6,
              }}
            >
              <Space
                align="start"
                style={{ justifyContent: "space-between", width: "100%" }}
              >
                <div>
                  <Text strong style={{ color: "#0f172a", fontSize: 16 }}>
                    {row.text}
                  </Text>
                  <div style={{ marginTop: 8 }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 999,
                        fontSize: 12,
                        lineHeight: "20px",
                        background: typeBadgeColor(row.inputType),
                        border: "1px solid rgba(0,0,0,0.05)",
                        marginRight: 8,
                      }}
                    >
                      {prettyType(row.inputType)}
                    </span>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 999,
                        fontSize: 12,
                        lineHeight: "20px",
                        background: row.required ? "#FFE9E9" : "#F5F7FB",
                        color: row.required ? "#B91C1C" : "#475569",
                        border: "1px solid rgba(0,0,0,0.05)",
                        marginRight: 8,
                      }}
                    >
                      {row.required ? "Required" : "Optional"}
                    </span>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 999,
                        fontSize: 12,
                        lineHeight: "20px",
                        background: "#F5F7FB",
                        color: "#475569",
                        border: "1px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      Order: {row.order ?? 0}
                    </span>
                  </div>
                  {row.helpText ? (
                    <Text
                      type="secondary"
                      style={{ display: "block", marginTop: 8 }}
                    >
                      {row.helpText}
                    </Text>
                  ) : null}

                  {/* NEW: show options for SINGLE_CHOICE */}
                  {row.inputType === "SINGLE_CHOICE" &&
                    Array.isArray(row.matriksQuestionOption) &&
                    row.matriksQuestionOption.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <Text
                          type="secondary"
                          style={{ display: "block", marginBottom: 4 }}
                        >
                          Options:
                        </Text>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 8,
                          }}
                        >
                          {row.matriksQuestionOption
                            .slice()
                            .sort(
                              (a: any, b: any) =>
                                (a.order ?? 0) - (b.order ?? 0)
                            )
                            .map((opt: any) => (
                              <span
                                key={opt.id}
                                title={`value: ${opt.value}`}
                                style={{
                                  display: "inline-block",
                                  padding: "2px 10px",
                                  borderRadius: 999,
                                  fontSize: 12,
                                  lineHeight: "20px",
                                  background: "#FFF7ED",
                                  border: "1px solid rgba(0,0,0,0.06)",
                                }}
                              >
                                {opt.label}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                </div>

                <Space>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => openEdit(row.id)}
                  >
                    Edit
                  </Button>
                  <Popconfirm
                    title="Delete question?"
                    description="This action cannot be undone."
                    okText="Delete"
                    okButtonProps={{ danger: true, loading: onDeleteLoading }}
                    cancelText="Cancel"
                    onConfirm={() => onDelete(row.id)}
                  >
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      loading={onDeleteLoading}
                    >
                      Delete
                    </Button>
                  </Popconfirm>
                </Space>
              </Space>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal (choose input type + options for Single Choice) */}
      <Modal
        title="Add Matrix Question"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        okText="Create"
        cancelText="Cancel"
        onOk={() => createForm.submit()}
        confirmLoading={onCreateLoading}
        width={720}
      >
        <Form<CreateFormValues>
          form={createForm}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{
            text: "",
            inputType: "SINGLE_CHOICE",
            required: true,
            order: 0,
            helpText: "",
            placeholder: "",
            options: [],
          }}
        >
          <Form.Item
            label="Question Text"
            name="text"
            rules={[
              { required: true, message: "Question is required." },
              { min: 3, message: "Minimum 3 characters." },
            ]}
          >
            <Input placeholder="Type the question…" />
          </Form.Item>

          <Form.Item
            label="Input Type"
            name="inputType"
            rules={[{ required: true, message: "Input type is required." }]}
          >
            <Select
              options={[
                { value: "SINGLE_CHOICE", label: "Single Choice" },
                { value: "TEXT", label: "Text" },
              ]}
              style={{ maxWidth: 280 }}
            />
          </Form.Item>

          <Space size="large" wrap>
            <Form.Item label="Required" name="required" valuePropName="checked">
              <Switch defaultChecked />
            </Form.Item>

            <Form.Item label="Order" name="order" tooltip="Ascending order">
              <InputNumber min={0} style={{ width: 140 }} />
            </Form.Item>
          </Space>

          <Form.Item label="Help Text (optional)" name="helpText">
            <Input placeholder="Optional hint…" />
          </Form.Item>

          <Form.Item label="Placeholder (optional)" name="placeholder">
            <Input placeholder="Placeholder…" />
          </Form.Item>

          {/* Options section — visible only for SINGLE_CHOICE */}
          <FormDependency path={["inputType"]}>
            {(type: QuestionMatriksType) =>
              type === "SINGLE_CHOICE" && (
                <>
                  <Divider style={{ margin: "12px 0" }} />
                  <Space align="center">
                    <Text strong>Options</Text>
                    <Tooltip title="Provide at least one option for SINGLE_CHOICE.">
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </Space>

                  <Form.List name="options">
                    {(fields, { add, remove }) => (
                      <Space direction="vertical" style={{ width: "100%" }}>
                        {fields.map(({ key, name, ...rest }, idx) => (
                          <Space
                            key={key}
                            align="baseline"
                            wrap
                            style={{ width: "100%" }}
                          >
                            <Form.Item {...rest} name={[name, "id"]} hidden>
                              <Input type="hidden" />
                            </Form.Item>
                            <Form.Item
                              {...rest}
                              name={[name, "label"]}
                              label={idx === 0 ? "Label" : ""}
                              rules={[
                                {
                                  required: true,
                                  message: "Label is required.",
                                },
                              ]}
                            >
                              <Input
                                placeholder="e.g., Strongly Disagree"
                                style={{ width: 240 }}
                              />
                            </Form.Item>

                            <Form.Item
                              {...rest}
                              name={[name, "value"]}
                              label={idx === 0 ? "Value" : ""}
                              rules={[
                                {
                                  required: true,
                                  message: "Value is required.",
                                },
                              ]}
                            >
                              <Input
                                placeholder="e.g., sd"
                                style={{ width: 200 }}
                              />
                            </Form.Item>

                            <Form.Item
                              {...rest}
                              name={[name, "order"]}
                              label={idx === 0 ? "Order" : ""}
                            >
                              <InputNumber min={0} style={{ width: 120 }} />
                            </Form.Item>

                            <Form.Item
                              {...rest}
                              name={[name, "active"]}
                              label={idx === 0 ? "Active" : ""}
                              valuePropName="checked"
                              initialValue={true}
                            >
                              <Switch />
                            </Form.Item>

                            <Button
                              danger
                              type="link"
                              onClick={() => remove(name)}
                            >
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
              )
            }
          </FormDependency>
        </Form>
      </Modal>

      {/* Edit Modal (also supports options for SINGLE_CHOICE) */}
      <Modal
        title="Edit Matrix Question"
        open={editOpen}
        onCancel={() => {
          setEditOpen(false);
          setEditingId("");
        }}
        okText="Update"
        cancelText="Cancel"
        onOk={() => editForm.submit()}
        confirmLoading={onUpdateLoading}
        width={720}
      >
        <Form<UpdateFormValues>
          form={editForm}
          layout="vertical"
          onFinish={handleUpdate}
          initialValues={{
            inputType: "SINGLE_CHOICE",
            required: true,
            order: 0,
            helpText: "",
            placeholder: "",
            options: [],
          }}
        >
          <Form.Item
            label="Question Text"
            name="text"
            rules={[
              { required: true, message: "Question is required." },
              { min: 3, message: "Minimum 3 characters." },
            ]}
          >
            <Input placeholder="Edit the question…" />
          </Form.Item>

          <Form.Item
            label="Input Type"
            name="inputType"
            rules={[{ required: true, message: "Input type is required." }]}
          >
            <Select
              options={[
                { value: "SINGLE_CHOICE", label: "Single Choice" },
                { value: "TEXT", label: "Text" },
              ]}
              style={{ maxWidth: 280 }}
            />
          </Form.Item>

          <Space size="large" wrap>
            <Form.Item label="Required" name="required" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="Order" name="order">
              <InputNumber min={0} style={{ width: 140 }} />
            </Form.Item>
          </Space>

          <Form.Item label="Help Text (optional)" name="helpText">
            <Input placeholder="Optional hint…" />
          </Form.Item>

          <Form.Item label="Placeholder (optional)" name="placeholder">
            <Input placeholder="Placeholder…" />
          </Form.Item>

          {/* Options section — visible only for SINGLE_CHOICE */}
          <FormDependency path={["inputType"]}>
            {(type: QuestionMatriksType) =>
              type === "SINGLE_CHOICE" && (
                <>
                  <Divider style={{ margin: "12px 0" }} />
                  <Space align="center">
                    <Text strong>Options</Text>
                    <Tooltip title="Edit options for SINGLE_CHOICE question.">
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </Space>

                  <Form.List name="options">
                    {(fields, { add, remove }) => (
                      <Space direction="vertical" style={{ width: "100%" }}>
                        {fields.map(({ key, name, ...rest }, idx) => (
                          <Space
                            key={key}
                            align="baseline"
                            wrap
                            style={{ width: "100%" }}
                          >
                            <Form.Item {...rest} name={[name, "id"]} hidden>
                              <Input type="hidden" />
                            </Form.Item>
                            <Form.Item
                              {...rest}
                              name={[name, "label"]}
                              label={idx === 0 ? "Label" : ""}
                              rules={[
                                {
                                  required: true,
                                  message: "Label is required.",
                                },
                              ]}
                            >
                              <Input
                                placeholder="e.g., Strongly Disagree"
                                style={{ width: 240 }}
                              />
                            </Form.Item>

                            <Form.Item
                              {...rest}
                              name={[name, "value"]}
                              label={idx === 0 ? "Value" : ""}
                              rules={[
                                {
                                  required: true,
                                  message: "Value is required.",
                                },
                              ]}
                            >
                              <Input
                                placeholder="e.g., sd"
                                style={{ width: 200 }}
                              />
                            </Form.Item>

                            <Form.Item
                              {...rest}
                              name={[name, "order"]}
                              label={idx === 0 ? "Order" : ""}
                            >
                              <InputNumber min={0} style={{ width: 120 }} />
                            </Form.Item>

                            <Form.Item
                              {...rest}
                              name={[name, "active"]}
                              label={idx === 0 ? "Active" : ""}
                              valuePropName="checked"
                              initialValue={true}
                            >
                              <Switch />
                            </Form.Item>

                            <Button
                              danger
                              type="link"
                              onClick={() => remove(name)}
                            >
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
              )
            }
          </FormDependency>
        </Form>
      </Modal>
    </div>
  );
}

/* -------------------- Small helper -------------------- */
/** Render conditional fields based on a form path value */
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
        // re-render when specific nested field changed
        const get = (obj: any, keys: (string | number)[]) =>
          keys.reduce((acc, k) => (acc ? acc[k] : undefined), obj);
        return get(prev, path) !== get(cur, path);
      }}
    >
      {({ getFieldValue }) => children(getFieldValue(path))}
    </Form.Item>
  );
}
