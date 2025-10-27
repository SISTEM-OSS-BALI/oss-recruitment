"use client";

import React, { useMemo, useState } from "react";
import {
  Row,
  Col,
  Card,
  Tag,
  Typography,
  Space,
  Input,
  Button,
  Tooltip,
  Empty,
  Skeleton,
  Alert,
  List,
} from "antd";
import {
  FileTextOutlined,
  DownloadOutlined,
  UserOutlined,
  ApartmentOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { useOfferingContracts } from "@/app/hooks/offering-contract";

const { Title, Text } = Typography;

const STAGE_COLOR = {
  APPLICATION: "default",
  SCREENING: "processing",
  INTERVIEW: "geekblue",
  OFFER_SENT: "gold",
  SIGNED: "cyan",
  HIRED: "green",
  REJECTED: "red",
};

export default function HistoryContractContent() {
  const { data, fetchLoading } = useOfferingContracts({});

  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const qNorm = q.trim().toLowerCase();
    return (data || []).filter((c) => {
      const name = c?.applicant?.user?.name || "";
      const job = c?.applicant?.job?.name || "";

      const matchQ =
        !qNorm ||
        name.toLowerCase().includes(qNorm) ||
        job.toLowerCase().includes(qNorm) ||
        String(c?.id || "")
          .toLowerCase()
          .includes(qNorm);


      return matchQ;
    });
  }, [data, q,]);

  if (!data) {
    return (
      <Alert
        type="error"
        message="Failed to load data"
        description="An error occurred while fetching the contract history."
        showIcon
      />
    );
  }

  return (
    <div className="w-full">
      {/* Header & Controls */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            Contract History
          </Title>
          <Text type="secondary">Manage and browse all offer contracts.</Text>
        </Col>
        <Col>
          <Space wrap>
            <Input.Search
              allowClear
              placeholder="Search candidate, position, or contract ID…"
              onSearch={setQ}
              onChange={(e) => setQ(e.target.value)}
              style={{ width: 320 }}
            />
          </Space>
        </Col>
      </Row>

      {/* Content */}
      {fetchLoading ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Col key={i} xs={24} sm={12} lg={8}>
              <Card>
                <Skeleton active paragraph={{ rows: 3 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : filtered.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No matching contracts"
        />
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, lg: 3, xl: 3 }}
          dataSource={filtered}
          renderItem={(contract) => {
            const id = contract?.id;
            const name = contract?.applicant?.user?.name || "-";
            const job = contract?.applicant?.job?.name || "-";
            const stage = contract?.applicant?.stage || "UNKNOWN";
            const filePath = contract?.filePath || "";

            return (
              <List.Item key={id}>
                <Card
                  hoverable
                  title={
                    <Space align="center">
                      <FileTextOutlined />
                      <Tag color={STAGE_COLOR[stage] || "default"}>{stage}</Tag>
                    </Space>
                  }
                  actions={[
                    filePath ? (
                      <Tooltip key="open" title="Open contract file">
                        <Button
                          type="text"
                          icon={<LinkOutlined />}
                          href={filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open
                        </Button>
                      </Tooltip>
                    ) : (
                      <Button key="open" type="text" disabled>
                        No file
                      </Button>
                    ),
                    filePath ? (
                      <Tooltip key="download" title="Download contract file">
                        <Button
                          type="text"
                          icon={<DownloadOutlined />}
                          href={filePath}
                          download
                        >
                          Download
                        </Button>
                      </Tooltip>
                    ) : null,
                  ]}
                  style={{ borderRadius: 12 }}
                >
                  <Space
                    direction="vertical"
                    size={6}
                    style={{ width: "100%" }}
                  >
                    <Space>
                      <UserOutlined />
                      <Text>{name}</Text>
                    </Space>
                    <Space>
                      <ApartmentOutlined />
                      <Text type="secondary">{job}</Text>
                    </Space>

                    {contract?.createdAt && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Created: {new Date(contract.createdAt).toLocaleString()}
                      </Text>
                    )}
                  </Space>
                </Card>
              </List.Item>
            );
          }}
        />
      )}
    </div>
  );
}
