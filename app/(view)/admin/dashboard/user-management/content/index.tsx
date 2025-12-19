"use client";

import { SearchOutlined, TeamOutlined } from "@ant-design/icons";
import {
  Avatar,
  Card,
  Col,
  Flex,
  Input,
  Row,
  Space,
  Table,
  Typography,
} from "antd";
import { useCallback, useMemo, useState } from "react";

import { useUsers } from "@/app/hooks/user";
import UserManagementColumns from "./columns";

export default function UserManagementContent() {
  const {
    data = [],
    fetchLoading,
    isFetching,
    onDelete,
    onDeleteLoading,
  } = useUsers({});
  const [searchValue, setSearchValue] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const loading = fetchLoading || isFetching;

  const filteredUsers = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    return data.filter((user) => {
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query);
      return matchesSearch;
    });
  }, [data, searchValue]);

  const stats = useMemo(() => {
    const total = data.length;
    const admin = data.filter((u) => u.role === "ADMIN").length;
    const superAdmin = data.filter((u) => u.role === "SUPER_ADMIN").length;
    return { total, admin, superAdmin };
  }, [data]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        setDeletingId(id);
        await onDelete(id);
      } finally {
        setDeletingId(null);
      }
    },
    [onDelete]
  );

  const columns = useMemo(
    () =>
      UserManagementColumns({
        onDelete: handleDelete,
        onDeleteLoading,
        deletingId,
      }),
    [deletingId, handleDelete, onDeleteLoading]
  );

  return (
    <Space direction="vertical" size={18} style={{ width: "100%" }}>
      <Flex justify="space-between" align="center">
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            User Management
          </Typography.Title>
          <Typography.Text type="secondary">
            Quickly manage internal users and candidates, including search, as
            well as delete actions.
          </Typography.Text>
        </div>
      </Flex>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <Card
            size="small"
            styles={{ body: { padding: 14 } }}
            bordered={false}
            style={{ background: "#0c1426", color: "#fff" }}
          >
            <Flex align="center" justify="space-between">
              <div>
                <div style={{ opacity: 0.8 }}>Total Users</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>
                  {stats.total}
                </div>
              </div>
              <Avatar
                style={{ background: "#1890ff" }}
                size={40}
                icon={<TeamOutlined />}
              />
            </Flex>
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card size="small" styles={{ body: { padding: 14 } }}>
            <div style={{ opacity: 0.7 }}>Super Admin</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>
              {stats.superAdmin}
            </div>
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card size="small" styles={{ body: { padding: 14 } }}>
            <div style={{ opacity: 0.7 }}>Admin</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{stats.admin}</div>
          </Card>
        </Col>
      </Row>

      <Card
        style={{ borderRadius: 12 }}
        bodyStyle={{ padding: 16, paddingTop: 20 }}
      >
        <Row gutter={[12, 12]} align="middle" style={{ marginBottom: 12 }}>
          <Col xs={24} md={12}>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Search by name, email, or phone"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </Col>
          <Col xs={24} md={12}>
            <Space
              style={{ width: "100%", justifyContent: "flex-end" }}
              wrap
              size={8}
            ></Space>
          </Col>
        </Row>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredUsers}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </Card>
    </Space>
  );
}
