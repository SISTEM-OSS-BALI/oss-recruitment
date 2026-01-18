"use client";

import React from "react";
import { Card, Typography, Space, Divider, Tag } from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { formatDate } from "@/app/utils/date-helper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressCard, faMars } from "@fortawesome/free-solid-svg-icons";

const { Title, Text } = Typography;

type LeftPanelProps = {
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  gender?: string | null;
  dateOfBirth?: string | Date | null;
  cvUrl?: string | null;
  portfolioUrl?: string | null;
  interests?: string[];
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
  address,
  gender,
  dateOfBirth,
  interests = [],
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
      <div style={{ padding: "20px 20px 8px" }}>
        <Space direction="vertical" size={18} style={{ width: "100%" }}>
          <RowItem
            icon={<CalendarOutlined />}
            primary={<span>{formatDate(dateOfBirth)}</span>}
            secondary="Date of Birth"
          />
        </Space>
        <Space direction="vertical" size={18} style={{ width: "100%", }}>
          <RowItem
            icon={<FontAwesomeIcon icon={faAddressCard} />}
            primary={<span>{address || "-"}</span>}
            secondary="Address"
          />
        </Space>
        <Space direction="vertical" size={18} style={{ width: "100%" }}>
          <RowItem
            icon={<FontAwesomeIcon icon={faMars} />}
            primary={<span>{gender || "-"}</span>}
            secondary="Gender"
          />
        </Space>
      </div>

      {interests.length > 0 && (
        <>
          <div style={{ padding: "20px 20px 8px" }}>
            <SectionTitle>Professional Interests</SectionTitle>
          </div>
          <Divider style={{ margin: "10px 0 0" }} />
          <div style={{ padding: "16px 20px 20px" }}>
            <Space size={[8, 8]} wrap>
              {interests.map((interest) => (
                <Tag
                  key={interest}
                  color="blue"
                  style={{ borderRadius: 999, padding: "4px 12px" }}
                >
                  {interest}
                </Tag>
              ))}
            </Space>
          </div>
        </>
      )}
    </Card>
  );
}
