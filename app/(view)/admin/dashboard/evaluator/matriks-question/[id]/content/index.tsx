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
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useParams } from "next/navigation";

import {
  useQuestionMatriks,
  useQuestionMatriksById,
} from "@/app/hooks/question-matriks";

import type { QuestionMatriksType } from "@prisma/client";

const BRAND = "#003A6F";
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

type CreateFormValues = {
  text: string;
  required?: boolean;
  order?: number;
  helpText?: string | null;
  placeholder?: string | null;
};

type UpdateFormValues = {
  text?: string;
  inputType?: QuestionMatriksType;
  required?: boolean;
  order?: number;
  helpText?: string | null;
  placeholder?: string | null;
};

export default function Content() {
  const { notification } = AntdApp.useApp();
  const screens = useBreakpoint();

  // baseId dari route
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

  // Create form
  const [createForm] = Form.useForm<CreateFormValues>();

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string>("");

  // Detail + update hook (diaktifkan hanya ketika ada id)
  const {
    data: editingRow,
    onUpdate,
    onUpdateLoading,
  } = useQuestionMatriksById({ id: editingId || "" });

  const [editForm] = Form.useForm<UpdateFormValues>();

  // Ketika modal edit dibuka & data siap → isi form
  useEffect(() => {
    if (editingRow) {
      editForm.setFieldsValue({
        text: editingRow.text,
        inputType: editingRow.inputType,
        required: editingRow.required,
        order: editingRow.order,
        helpText: editingRow.helpText ?? null,
        placeholder: editingRow.placeholder ?? null,
      });
    }
  }, [editingRow, editForm]);

  async function handleCreate(values: CreateFormValues) {
    if (!baseId) {
      notification.error({ message: "Missing base id" });
      return;
    }
    try {
      await onCreate({
        baseId,
        text: values.text.trim(),
        inputType: "SINGLE_CHOICE", // Matriks row = single choice
        required: values.required ?? true,
        order: values.order ?? 0,
        helpText: values.helpText ?? null,
        placeholder: values.placeholder ?? null,
      });
      createForm.resetFields();
    } catch (e: any) {
      notification.error({
        message: "Create failed",
        description: e?.response?.data?.message || e?.message || "Error",
      });
    }
  }

  async function openEdit(id: string) {
    setEditingId(id);
    setEditOpen(true);
  }

  async function handleUpdate(values: UpdateFormValues) {
    if (!editingId) return;
    try {
      await onUpdate({
        text: values.text?.trim(),
        inputType: "SINGLE_CHOICE",
        required: values.required,
        order: values.order,
        helpText: values.helpText ?? null,
        placeholder: values.placeholder ?? null,
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

  return (
    <div style={{ padding: screens.md ? 24 : 16 }}>
      {/* Header */}
      <Space direction="vertical" size={6} style={{ display: "block" }}>
        <Title level={3} style={{ margin: 0, color: "#111827" }}>
          Matriks Questions
        </Title>
        <Text type="secondary">
          Tambah, edit, dan hapus baris pertanyaan untuk matriks (single
          choice).
        </Text>
      </Space>

      <Divider style={{ marginTop: 16, marginBottom: 16 }} />

      {/* Create panel */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #EDF1F5",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <Space
          align="center"
          style={{ justifyContent: "space-between", width: "100%", gap: 12 }}
        >
          <Text strong style={{ color: BRAND }}>
            Tambah Pertanyaan
          </Text>
        </Space>

        <Form<CreateFormValues>
          form={createForm}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{
            text: "",
            required: true,
            order: 0,
            helpText: "",
            placeholder: "",
          }}
          style={{ marginTop: 12 }}
        >
          <Form.Item
            label="Teks Pertanyaan"
            name="text"
            rules={[
              { required: true, message: "Pertanyaan wajib diisi." },
              { min: 3, message: "Minimal 3 karakter." },
            ]}
          >
            <Input placeholder="Tuliskan pertanyaan…" />
          </Form.Item>

          <Space size="large" wrap>
            <Form.Item label="Wajib" name="required" valuePropName="checked">
              <Switch defaultChecked />
            </Form.Item>

            <Form.Item
              label="Urutan"
              name="order"
              tooltip="Urutan tampil (menaik)"
            >
              <InputNumber min={0} style={{ width: 140 }} />
            </Form.Item>
          </Space>

          <Form.Item label="Bantuan (opsional)" name="helpText">
            <Input placeholder="Teks bantu singkat…" />
          </Form.Item>

          <Form.Item label="Placeholder (opsional)" name="placeholder">
            <Input placeholder="Placeholder input…" />
          </Form.Item>

          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<PlusOutlined />}
              loading={onCreateLoading}
              disabled={!baseId}
            >
              Tambah
            </Button>
          </Space>
        </Form>
      </div>

      {/* List */}
      {fetchLoading ? (
        <Space direction="vertical" style={{ width: "100%" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} active paragraph={{ rows: 2 }} />
          ))}
        </Space>
      ) : sortedRows.length === 0 ? (
        <Empty description="Belum ada pertanyaan." />
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {sortedRows.map((row) => (
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
                        background: "#F6FFED",
                        border: "1px solid rgba(0,0,0,0.05)",
                        marginRight: 8,
                      }}
                    >
                      SINGLE_CHOICE
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
                </div>

                <Space>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => openEdit(row.id)}
                  >
                    Edit
                  </Button>
                  <Popconfirm
                    title="Hapus pertanyaan?"
                    description="Tindakan ini tidak dapat dibatalkan."
                    okText="Hapus"
                    okButtonProps={{ danger: true, loading: onDeleteLoading }}
                    cancelText="Batal"
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

      {/* Edit Modal */}
      <Modal
        title="Edit Pertanyaan Matriks"
        open={editOpen}
        onCancel={() => {
          setEditOpen(false);
          setEditingId("");
        }}
        okText="Update"
        cancelText="Batal"
        onOk={() => editForm.submit()}
        confirmLoading={onUpdateLoading}
        width={680}
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
          }}
        >
          <Form.Item
            label="Teks Pertanyaan"
            name="text"
            rules={[
              { required: true, message: "Pertanyaan wajib diisi." },
              { min: 3, message: "Minimal 3 karakter." },
            ]}
          >
            <Input placeholder="Ubah pertanyaan…" />
          </Form.Item>

          <Space size="large" wrap>
            <Form.Item label="Wajib" name="required" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="Urutan" name="order">
              <InputNumber min={0} style={{ width: 140 }} />
            </Form.Item>
          </Space>

          <Form.Item label="Bantuan (opsional)" name="helpText">
            <Input placeholder="Teks bantu singkat…" />
          </Form.Item>

          <Form.Item label="Placeholder (opsional)" name="placeholder">
            <Input placeholder="Placeholder input…" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
