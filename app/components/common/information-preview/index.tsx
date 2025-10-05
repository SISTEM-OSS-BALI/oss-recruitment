"use client";

import React from "react";
import { Card, Typography, Space, Divider } from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { formatDate } from "@/app/utils/date-helper";

const { Title, Text } = Typography;

type LeftPanelProps = {
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: string | Date | null;
  cvUrl?: string | null;
  portfolioUrl?: string | null;
};


function RowItem({
  icon,
  primary,
  secondary,
}: {
  icon: React.ReactNode;
  primary: React.ReactNode;
  secondary: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", gap: 14 }}>
      <div style={{ fontSize: 20, color: "#2f66f5" }}>{icon}</div>
      <div>
        <div style={{ fontWeight: 600, color: "#0f172a" }}>{primary}</div>
        <Text
          type="secondary"
          style={{ marginTop: 2, display: "inline-block" }}
        >
          {secondary}
        </Text>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Title
      level={4}
      style={{
        color: "#2f66f5",
        margin: 0,
        fontWeight: 800,
        letterSpacing: 0.2,
      }}
    >
      {children}
    </Title>
  );
}

export default function CandidatePreview({
  email,
  phone,
  dateOfBirth,
}: LeftPanelProps) {
  return (
    <Card
      style={{ borderRadius: 14 }}
      bodyStyle={{ padding: 0 }}
      bordered={false}
    >
      {/* Contact Information */}
      <div style={{ padding: "20px 20px 8px" }}>
        <SectionTitle>Contact Information</SectionTitle>
      </div>
      <Divider style={{ margin: "10px 0 0" }} />
      <div style={{ padding: "16px 20px 8px" }}>
        <Space direction="vertical" size={18} style={{ width: "100%" }}>
          <RowItem
            icon={<MailOutlined />}
            primary={<span>{email || "-"}</span>}
            secondary="Email"
          />
          <RowItem
            icon={<PhoneOutlined />}
            primary={<span>{phone || "-"}</span>}
            secondary="Phone"
          />
        </Space>
      </div>

      {/* Personal Details */}
      <div style={{ padding: "20px 20px 8px" }}>
        <SectionTitle>Personal Details</SectionTitle>
      </div>
      <Divider style={{ margin: "10px 0 0" }} />
      <div style={{ padding: "16px 20px 8px" }}>
        <Space direction="vertical" size={18} style={{ width: "100%" }}>
          <RowItem
            icon={<CalendarOutlined />}
            primary={<span>{formatDate(dateOfBirth)}</span>}
            secondary="Date of Birth"
          />
        </Space>
      </div>

      {/* Application Details */}
      {/* <div style={{ padding: "20px 20px 8px" }}>
        <SectionTitle>Application Details</SectionTitle>
      </div>
      <Divider style={{ margin: "10px 0 0" }} />
      <div style={{ padding: "16px 20px 20px" }}>
      </div> */}
    </Card>
  );
}
