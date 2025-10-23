"use client";

import React from "react";
import {
  Result,
  Card,
  Space,
  Typography,
  Row,
  Col,
} from "antd";
import {
  CheckCircleTwoTone,
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;

/**
 * Halaman Success yang profesional berbasis Ant Design (tanpa Tailwind)
 * - Cocok untuk konfirmasi submit/aksi yang berhasil
 * - Menampilkan optional reference dari query param ?ref=...
 * - Tiga CTA: Dashboard, Beranda, Lihat Aktivitas
 */
export default function SuccessPage() {

  return (
    <Row
      justify="center"
      align="middle"
      style={{
        minHeight: "100vh",
        padding: 24,
        background: "linear-gradient(180deg, #ffffff 0%, #f7f9fc 100%)",
      }}
    >
      <Col xs={24} sm={22} md={18} lg={14} xl={12} xxl={10}>
        <Card bordered style={{ boxShadow: "0 6px 24px rgba(0,0,0,0.06)" }}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Result
              status="success"
              title={
                <Title level={3} style={{ margin: 0 }}>
                  Success!
                </Title>
              }
              subTitle={
                <Paragraph style={{ margin: 0, color: "#667085" }}>
                    Your review has been submitted successfully.
                </Paragraph>
              }
              icon={
                <CheckCircleTwoTone
                  twoToneColor="#52c41a"
                  style={{ fontSize: 56 }}
                />
              }
            />
          </Space>
        </Card>
      </Col>
    </Row>
  );
}
