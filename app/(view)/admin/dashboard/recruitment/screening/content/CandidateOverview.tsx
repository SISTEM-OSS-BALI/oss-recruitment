"use client";
import React, { useMemo } from "react";
import {
  Row,
  Col,
  Space,
  Tabs,
  Empty,
} from "antd";
import {
  FilePdfOutlined,
} from "@ant-design/icons";
import type { CandidateDataModel } from "@/app/models/apply-job";
import dayjs from "dayjs";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import CandidateInfoPanel from "@/app/components/common/information-panel";
dayjs.extend(utc);
dayjs.extend(timezone);




function PDFViewer({ src }: { src?: string | null }) {
  if (!src) {
    return (
      <div
        style={{
          height: 560,
          display: "grid",
          placeItems: "center",
          border: "1px solid #f0f0f0",
          borderRadius: 12,
          background: "#fafafa",
        }}
      >
        <Empty
          description={
            <Space>
              <FilePdfOutlined />
              <span>No file</span>
            </Space>
          }
        />
      </div>
    );
  }
  // pakai <iframe> untuk preview cepat
  return (
    <iframe
      src={src}
      style={{
        width: "100%",
        height: 650,
        border: "1px solid #f0f0f0",
        borderRadius: 12,
      }}
    />
  );
}

export default function CandidateOverview({
  candidate,
}: {
  candidate: CandidateDataModel | null;
}) {

  const tabs = useMemo(
    () => [
      {
        key: "cv",
        label: (
          <Space>
            <FilePdfOutlined />
            Curriculum Vitae
          </Space>
        ),
        children: <PDFViewer src={candidate?.curiculum_vitae_url} />,
      },
      {
        key: "cert",
        label: (
          <Space>
            <FilePdfOutlined />
            Portofolio
          </Space>
        ),
        children: <PDFViewer src={candidate?.portfolio_url} />,
      },
    ],
    [candidate?.curiculum_vitae_url, candidate?.portfolio_url]
  );

  if (!candidate) {
    return (
      <div
        style={{
          height: 560,
          display: "grid",
          placeItems: "center",
          color: "#bfbfbf",
        }}
      >
        <Empty description="No Candidate Selected" />
      </div>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {/* LEFT PANEL */}
      <Col xs={24} md={8}>
        {/* Profile card */}

        {/* Contact info */}
        <CandidateInfoPanel
          email={candidate.email}
          phone={candidate.phone}
          dateOfBirth={candidate.date_of_birth}
          jobName={candidate.job?.name}
          appliedAt={candidate.createdAt}
          updatedAt={candidate.updatedAt}
          cvUrl={candidate.curiculum_vitae_url}
          portfolioUrl={candidate.portfolio_url}
        />
      </Col>

      {/* RIGHT PANEL */}
      <Col xs={24} md={16}>
        <Tabs
          items={tabs}
          defaultActiveKey="cv"
          style={{
            background: "#fff",
            borderRadius: 14,
            padding: 8,
          }}
          tabBarStyle={{ marginBottom: 12 }}
        />
      </Col>
    </Row>
  );
}
