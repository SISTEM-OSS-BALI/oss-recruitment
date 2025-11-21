"use client";

import { useMemo, useState } from "react";
import {
  App as AntdApp,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Grid,
  Input,
  Modal,
  Popconfirm,
  Row,
  Space,
  Tag,
  Typography,
  Skeleton,
  Switch,
  Tooltip,
  Select,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/en";
dayjs.locale("en");

import { TypeJob, type QuestionBaseScreening } from "@prisma/client";
import type {
  QuestionBaseScreeningDataModel,
  QuestionBaseScreeningPayloadCreateModel,
  QuestionBaseScreeningPayloadUpdateModel,
} from "@/app/models/base-question-screening";
import { useRouter } from "next/navigation";
import {
  useQuestionBaseScreening,
  useQuestionBaseScreenings,
} from "@/app/hooks/base-question-screening";

const JOB_TYPE_LABELS: Record<TypeJob, string> = Object.values(TypeJob).reduce(
  (acc, type) => {
    const label = type
      .toLowerCase()
      .split("_")
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" ");
    acc[type] = label;
    return acc;
  },
  {} as Record<TypeJob, string>
);

const BRAND = "#003A6F";
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

function getErrMsg(e: unknown): string {
  const anyErr = e as any;
  return (
    anyErr?.response?.data?.message ||
    anyErr?.data?.message ||
    anyErr?.message ||
    "An unexpected error occurred."
  );
}

export default function BaseScreeningCards(): JSX.Element {
  const { notification, message } = AntdApp.useApp();
  const screens = useBreakpoint();
  const router = useRouter();

  const {
    data: baseScreeningData,
    onCreate: onCreateBaseScreening,
    onCreateLoading: onCreateBaseScreeningLoading,
    onDelete: onDeleteBaseScreening,
    onDeleteLoading: onDeleteBaseScreeningLoading,
  } = useQuestionBaseScreenings({});

  const [editTarget, setEditTarget] = useState<QuestionBaseScreening | null>(
    null
  );
  const { onUpdate: onUpdateBaseScreening, onUpdateLoading } =
    useQuestionBaseScreening({ id: editTarget?.id ?? "" });

  /* ---------- Create Modal ---------- */
  const [isCreateOpen, setCreateOpen] = useState<boolean>(false);
  const [createForm] = Form.useForm<QuestionBaseScreeningPayloadCreateModel>();

  /* ---------- Edit Modal ---------- */
  const [isEditOpen, setEditOpen] = useState<boolean>(false);
  const [editForm] = Form.useForm<QuestionBaseScreeningPayloadUpdateModel>();

  /* ---------- Search & filter ---------- */
  const [search, setSearch] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<TypeJob | "ALL">("ALL");

  const filtered: QuestionBaseScreening[] = useMemo(() => {
    const q = search.trim().toLowerCase();
    const arr = Array.isArray(baseScreeningData)
      ? (baseScreeningData as QuestionBaseScreening[])
      : [];

    return arr.filter((x) => {
      const name = (x?.name || "").toLowerCase();
      const desc = (x?.desc || "").toLowerCase();
      const version = String(x?.version ?? "");
      const matchesSearch = q
        ? name.includes(q) || desc.includes(q) || version.includes(q)
        : true;
      const matchesType = typeFilter === "ALL" || x.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [baseScreeningData, search, typeFilter]);

  /* ---------- Handlers: Create ---------- */
  async function handleCreate(values: QuestionBaseScreeningPayloadCreateModel) {
    try {
      await onCreateBaseScreening({
        name: values.name?.trim(),
        desc: values.desc?.trim?.() || null,
        type: values.type,
      });
      createForm.resetFields();
      setCreateOpen(false);
      message.success("Screening base created.");
      // await refetch?.();
    } catch (e) {
      notification.error({
        message: "Create failed",
        description: getErrMsg(e),
      });
    }
  }

  /* ---------- Handlers: Edit ---------- */
  function openEdit(item: QuestionBaseScreeningDataModel) {
    setEditTarget(item);
    editForm.setFieldsValue({
      name: item.name || "",
      desc: item.desc || "",
      active: item.active ?? true,
      type: item.type,
    });
    setEditOpen(true);
  }

  async function handleUpdate(values: QuestionBaseScreeningPayloadUpdateModel) {
    if (!editTarget) return;
    try {
      await onUpdateBaseScreening({
        id: editTarget.id,
        payload: values,
      });
      setEditOpen(false);
      message.success("Screening base updated.");
    } catch (e) {
      notification.error({
        message: "Update failed",
        description: getErrMsg(e),
      });
    }
  }

  /* ---------- Handlers: Delete ---------- */
  async function handleDelete(id: string) {
    try {
      await onDeleteBaseScreening(id);
      message.success("Screening base deleted.");
      // await refetch?.();
    } catch (e) {
      notification.error({
        message: "Delete failed",
        description: getErrMsg(e),
      });
    }
  }

  const loadingList =
    baseScreeningData === undefined || baseScreeningData === null;

  const openDetail = (id: string) => {
    router.push(`/admin/dashboard/assignment-setting/screening-question/${id}`);
  };

  return (
    <div style={{ padding: screens.md ? 24 : 16 }}>
      {/* Header */}
      <Space
        direction="vertical"
        size={screens.md ? 12 : 8}
        style={{ display: "block" }}
      >
        <Space
          align="center"
          style={{
            width: "100%",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Title level={3} style={{ margin: 0, color: BRAND }}>
            Screening Base
          </Title>

          <Space.Compact>
            {/* <Button icon={<ReloadOutlined />} onClick={() => refetch?.()} /> */}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ background: BRAND, borderRadius: 12 }}
              onClick={() => setCreateOpen(true)}
            >
              Create Base
            </Button>
          </Space.Compact>
        </Space>

        <Space
          wrap
          style={{ width: "100%", justifyContent: "space-between", gap: 12 }}
        >
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search screening bases (name/description/version)…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 520, borderRadius: 12, marginTop: 20 }}
          />
          <Select
            value={typeFilter}
            onChange={(value) => setTypeFilter(value as TypeJob | "ALL")}
            style={{ minWidth: 220, borderRadius: 12, marginTop: 20 }}
          >
            <Select.Option value="ALL">All Job Types</Select.Option>
            {Object.values(TypeJob).map((type) => (
              <Select.Option key={type} value={type}>
                {JOB_TYPE_LABELS[type]}
              </Select.Option>
            ))}
          </Select>
        </Space>
      </Space>

      <Divider style={{ marginTop: 16, marginBottom: 16 }} />

      {/* Grid Cards */}
      {loadingList ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Col key={i} xs={24} sm={12} md={8} lg={6} xl={6}>
              <Card
                style={{
                  borderRadius: 16,
                  boxShadow:
                    "0 1px 3px rgba(16,24,40,0.06), 0 1px 2px rgba(16,24,40,0.03)",
                }}
              >
                <Skeleton active paragraph={{ rows: 3 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 24 }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                No screening base yet. Click <b>Create Base</b> to add one.
              </span>
            }
          />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map((item) => {
            const id = item.id;
            const name = item.name || "(Untitled)";
            const desc = item.desc || "";
            const version = item.version ?? 1;
            const active = item.active ?? true;
            const createdAt = item.createdAt ? dayjs(item.createdAt) : null;
            const updatedAt = item.updatedAt ? dayjs(item.updatedAt) : null;

            return (
              <Col key={id} xs={24} sm={12} md={8} lg={6} xl={6}>
                <Card
                  size="small"
                  bodyStyle={{ padding: 14 }}
                  style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    border: "1px solid #edf1f5",
                    boxShadow:
                      "0 8px 20px rgba(0,0,0,0.04), 0 3px 8px rgba(0,0,0,0.03)",
                  }}
                  className="screening-card"
                  title={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      <Text
                        strong
                        style={{ color: BRAND, fontSize: 16 }}
                        onClick={() => openDetail(id)}
                        ellipsis
                      >
                        {name}
                      </Text>
                      <Space size={6}>
                        <Tag
                          color={active ? "green" : "red"}
                          style={{ borderRadius: 999 }}
                        >
                          {active ? "Active" : "Inactive"}
                        </Tag>
                        <Tag color="purple" style={{ borderRadius: 999 }}>
                          {JOB_TYPE_LABELS[item.type as TypeJob] || item.type}
                        </Tag>
                        <Tag style={{ borderRadius: 999 }}>{`v${version}`}</Tag>
                      </Space>
                    </div>
                  }
                  actions={[
                    <Button
                      key="edit"
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => openEdit(item)}
                    >
                      Edit
                    </Button>,
                    <Popconfirm
                      key="del"
                      title="Delete base?"
                      description="This action cannot be undone."
                      okText="Delete"
                      okButtonProps={{
                        danger: true,
                        loading: onDeleteBaseScreeningLoading,
                      }}
                      cancelText="Cancel"
                      onConfirm={() => handleDelete(id)}
                    >
                      <Button
                        danger
                        type="text"
                        icon={<DeleteOutlined />}
                        loading={onDeleteBaseScreeningLoading}
                      >
                        Delete
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <Space
                    direction="vertical"
                    size={10}
                    style={{ display: "flex" }}
                  >
                    <Text
                      type="secondary"
                      style={{ minHeight: 44, lineHeight: 1.6 }}
                    >
                      {desc || <i>No description provided.</i>}
                    </Text>

                    <Divider style={{ margin: "8px 0" }} />

                    <Space direction="vertical" size={2}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Created:{" "}
                        {createdAt
                          ? createdAt.format("MMM DD, YYYY HH:mm")
                          : "-"}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Updated:{" "}
                        {updatedAt
                          ? updatedAt.format("MMM DD, YYYY HH:mm")
                          : "-"}
                      </Text>
                    </Space>
                  </Space>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Create Modal */}
      <Modal
        title="Create Screening Base"
        open={isCreateOpen}
        onCancel={() => setCreateOpen(false)}
        okText="Save"
        cancelText="Cancel"
        onOk={() => createForm.submit()}
        confirmLoading={onCreateBaseScreeningLoading}
      >
        <Form<QuestionBaseScreeningPayloadCreateModel>
          form={createForm}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{
            name: "",
            desc: "",
            type: TypeJob.TEAM_MEMBER,
            allowMultipleSubmissions: false,
          }}
        >
          <Form.Item
            label="Base Name"
            name="name"
            rules={[
              { required: true, message: "Base name is required." },
              { min: 3, message: "Minimum 3 characters." },
            ]}
          >
            <Input placeholder="Base Question Screening" />
          </Form.Item>

          <Form.Item label="Description" name="desc">
            <Input.TextArea
              rows={4}
              placeholder="Short description about what this base is for…"
            />
          </Form.Item>

          <Form.Item
            label="Type Screening"
            name="type"
            rules={[{ required: true, message: "Type is required." }]}
          >
            <Select placeholder="Select job type">
              {Object.entries(TypeJob).map(([key, value]) => (
                <Select.Option key={value} value={value}>
                  {key
                    .toLowerCase()
                    .split("_")
                    .map(
                      (segment) =>
                        segment.charAt(0).toUpperCase() + segment.slice(1)
                    )
                    .join(" ")}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label={
              <span>
                Allow Multiple Submissions{" "}
                <Tooltip title="If ON, the same user can submit this screening more than once. If OFF, each user can only submit once.">
                  <QuestionCircleOutlined style={{ color: "#909399" }} />
                </Tooltip>
              </span>
            }
            name="allowMultipleSubmissions"
            valuePropName="checked"
          >
            <Switch checkedChildren="Allowed" unCheckedChildren="One-time" />
          </Form.Item>

          <Text type="secondary" style={{ fontSize: 12, marginBottom: 20 }}>
            A base is a template. Add questions & options on its detail page.
          </Text>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Screening Base"
        open={isEditOpen}
        onCancel={() => setEditOpen(false)}
        okText="Update"
        cancelText="Cancel"
        onOk={() => editForm.submit()}
        confirmLoading={onUpdateLoading}
      >
        <Form<QuestionBaseScreeningPayloadUpdateModel>
          form={editForm}
          layout="vertical"
          onFinish={handleUpdate}
          initialValues={{
            name: "",
            desc: "",
            active: true,
            type: TypeJob.TEAM_MEMBER,
          }}
        >
          <Form.Item
            label="Base Name"
            name="name"
            rules={[
              { required: true, message: "Base name is required." },
              { min: 3, message: "Minimum 3 characters." },
            ]}
          >
            <Input placeholder="Base Question Screening" />
          </Form.Item>

          <Form.Item label="Description" name="desc">
            <Input.TextArea
              rows={4}
              placeholder="Short description about what this base is for…"
            />
          </Form.Item>

          <Form.Item
            label="Type Screening"
            name="type"
            rules={[{ required: true, message: "Type is required." }]}
          >
            <Select placeholder="Select job type">
              {Object.entries(TypeJob).map(([key, value]) => (
                <Select.Option key={value} value={value}>
                  {key
                    .toLowerCase()
                    .split("_")
                    .map(
                      (segment) =>
                        segment.charAt(0).toUpperCase() + segment.slice(1)
                    )
                    .join(" ")}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Active" name="active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <style jsx global>{`
        .screening-card .ant-card-head {
          padding: 12px 14px;
          background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
          border-bottom: 1px solid #edf1f5;
        }
        .screening-card .ant-card-head-title {
          padding: 0;
        }
        .screening-card .ant-card-actions {
          border-top: 1px solid #edf1f5;
        }
        .screening-card .ant-tag {
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
