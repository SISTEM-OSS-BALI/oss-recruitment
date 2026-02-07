"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Grid,
  Input,
  message,
  Modal,
  notification,
  Popconfirm,
  Row,
  Skeleton,
  Space,
  Typography,
} from "antd";
import type { FormInstance } from "antd/es/form";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/en";
dayjs.locale("en");

import {
  useQuestionBaseMatrik,
  useQuestionBaseMatriks,
} from "@/app/hooks/base-question-matriks";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

type BaseMatriks = {
  id: string;
  name: string;
  desc?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  // tambahkan field lain jika ada (misal allowMultipleSubmissions)
};

type CreatePayload = {
  name: string;
  desc?: string | null;
  // allowMultipleSubmissions?: boolean;
};

type UpdatePayload = {
  name?: string;
  desc?: string | null;
  // allowMultipleSubmissions?: boolean;
};

export default function Content() {
  const screens = useBreakpoint();

  // ---- data & actions
  const {
    data: bases,
    onCreate,
    onCreateLoading,
    onDelete,
    onDeleteLoading,
  } = useQuestionBaseMatriks({});

  const { onUpdate, onUpdateLoading } = useQuestionBaseMatrik({ id: "" });

  const goToDetail = (id: string) => {
    router.push(`/admin/dashboard/evaluator/matriks-question/${id}`);
  };

  // ---- ui state
  const [search, setSearch] = useState("");
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BaseMatriks | null>(null);
  const router = useRouter();

  const [createForm] = Form.useForm<CreatePayload>();
  const [editForm] = Form.useForm<UpdatePayload>();

  // ---- filter
  const list: BaseMatriks[] = useMemo(() => {
    if (!bases) return [];
    if (Array.isArray(bases)) return bases as BaseMatriks[];
    if (Array.isArray((bases as any)?.result))
      return (bases as any).result as BaseMatriks[];
    return [];
  }, [bases]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((b) => {
      const n = (b.name || "").toLowerCase();
      const d = (b.desc || "").toLowerCase();
      return n.includes(q) || d.includes(q);
    });
  }, [list, search]);

  // ---- handlers
  async function handleCreate(values: CreatePayload) {
    try {
      await onCreate?.({
        name: values.name.trim(),
        desc: values.desc?.trim?.() || null,
      } as any);
      createForm.resetFields();
      setCreateOpen(false);
      message.success("Base matriks created.");
    } catch (e: any) {
      notification.error({
        message: "Create failed",
        description:
          e?.response?.data?.message || e?.message || "Unexpected error.",
      });
    }
  }

  function openEdit(item: BaseMatriks) {
    setEditTarget(item);
    editForm.setFieldsValue({
      name: item.name || "",
      desc: item.desc || "",
    });
    setEditOpen(true);
  }

  async function handleUpdate(values: UpdatePayload) {
    if (!editTarget?.id) return;
    try {
      await onUpdate?.({
        id: editTarget.id,
        payload: {
          name: values.name?.trim(),
          desc: values.desc?.trim?.() ?? null,
        } as any,
      });
      setEditOpen(false);
      message.success("Base matriks updated.");
    } catch (e: any) {
      notification.error({
        message: "Update failed",
        description:
          e?.response?.data?.message || e?.message || "Unexpected error.",
      });
    }
  }

  async function handleDelete(id: string) {
    try {
      await onDelete?.(id);
      message.success("Base matriks deleted.");
    } catch (e: any) {
      notification.error({
        message: "Delete failed",
        description:
          e?.response?.data?.message || e?.message || "Unexpected error.",
      });
    }
  }

  const loadingList = bases == null;

  // ---- render
  return (
    <div style={{ padding: screens.md ? 24 : 16 }}>
      {/* Header */}
      <Space direction="vertical" size={6} style={{ display: "block" }}>
        <Title level={3} style={{ margin: 0, color: "#111827" }}>
          Matrix Question Base
        </Title>
        <Text type="secondary">Manage matrix question base</Text>

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
            placeholder="Search base matriks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 600, borderRadius: 10 }}
          />

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
          >
            Create Base
          </Button>
        </Space>
      </Space>

      <Divider style={{ marginTop: 16, marginBottom: 16 }} />

      {/* Cards */}
      {loadingList ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Col key={i} xs={24} sm={12} md={8} lg={6} xl={6}>
              <Card style={{ borderRadius: 14 }}>
                <Skeleton active paragraph={{ rows: 3 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : filtered.length === 0 ? (
        <Empty style={{ padding: 24 }} description="No matrix bases found." />
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map((b) => {
            const updatedAt = b.updatedAt ? dayjs(b.updatedAt) : null;
            const createdAt = b.createdAt ? dayjs(b.createdAt) : null;

            return (
              <Col key={b.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                <Card
                  title={
                    <Space direction="vertical" size={4}>
                      <Text
                        strong
                        style={{ color: "#0f172a", cursor: "pointer" }}
                        onClick={() => goToDetail(b.id)}
                      >
                        {b.name}
                      </Text>
                      {b.desc ? (
                        <Text type="secondary" style={{ display: "block" }}>
                          {b.desc}
                        </Text>
                      ) : null}
                    </Space>
                  }
                  bodyStyle={{ padding: 14 }}
                  style={{
                    borderRadius: 14,
                    border: "1px solid #eef2f7",
                    boxShadow:
                      "0 8px 20px rgba(0,0,0,0.04), 0 3px 8px rgba(0,0,0,0.03)",
                  }}
                  actions={[
                    <Button
                      key="edit"
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => openEdit(b)}
                    >
                      Edit
                    </Button>,
                    <Popconfirm
                      key="del"
                      title="Delete base?"
                      description="Are you sure you want to delete this matrix base? This action cannot be undone."
                      okText="Delete"
                      okButtonProps={{ danger: true, loading: onDeleteLoading }}
                      cancelText="Cancel"
                      onConfirm={() => handleDelete(b.id)}
                    >
                      <Button
                        danger
                        type="text"
                        icon={<DeleteOutlined />}
                        loading={onDeleteLoading}
                      >
                        Delete
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <Space
                    direction="vertical"
                    size={2}
                    style={{ width: "100%" }}
                  >
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Created:{" "}
                      {createdAt ? createdAt.format("MMM DD, YYYY HH:mm") : "-"}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Updated:{" "}
                      {updatedAt ? updatedAt.format("MMM DD, YYYY HH:mm") : "-"}
                    </Text>
                  </Space>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Create Modal */}
      <Modal
        title="Create Matrix Base"
        open={isCreateOpen}
        onCancel={() => setCreateOpen(false)}
        okText="Save"
        cancelText="Cancel"
        onOk={() => createForm.submit()}
        confirmLoading={onCreateLoading}
      >
        <BaseForm form={createForm} onSubmit={handleCreate} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Matrix Base"
        open={isEditOpen}
        onCancel={() => setEditOpen(false)}
        okText="Update"
        cancelText="Cancel"
        onOk={() => editForm.submit()}
        confirmLoading={onUpdateLoading}
      >
        <BaseForm form={editForm} onSubmit={handleUpdate} isEdit />
      </Modal>
    </div>
  );
}

/* =================== Reusable Form =================== */
type BaseFormProps<T extends CreatePayload | UpdatePayload> = {
  form: FormInstance<T>;
  onSubmit: (values: T) => Promise<void>;
  isEdit?: boolean;
};

function BaseForm<T extends CreatePayload | UpdatePayload>({
  form,
  onSubmit,
  isEdit,
}: BaseFormProps<T>) {
  return (
    <Form<T>
      form={form}
      layout="vertical"
      onFinish={onSubmit}
      initialValues={{
        name: "",
        desc: "",
        // allowMultipleSubmissions: false,
      }}
    >
      <Form.Item
        label="Base Name"
        name="name"
        rules={[
          { required: true, message: "Name is required." },
          { min: 3, message: "Minimum 3 characters." },
        ]}
      >
        <Input placeholder="e.g., Work or Achievement History" />
      </Form.Item>

      <Form.Item label="Description" name="desc">
        <Input.TextArea rows={3} placeholder="Optional description…" />
      </Form.Item>

      {/* Jika nanti ingin menambahkan kontrol multiple submissions:
      <Form.Item
        label="Allow multiple submissions"
        name="allowMultipleSubmissions"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
      */}
    </Form>
  );
}
