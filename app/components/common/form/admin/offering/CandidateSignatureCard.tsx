"use client";

import React from "react";
import dayjs from "dayjs";
import {
  Alert,
  Button,
  Card,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  DownloadOutlined,
  FileDoneOutlined,
  MailOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

type Props = {
  candidateSignatureUrl: string | null;
  candidateSignedPdfUrl: string | null;
  candidateSignedPdfAt: string | Date | null;
  candidateNotifyEmail: string;
  onApplyCandidateSignature: () => void;
  onSendFinalEmail: () => void;
  applyLoading: boolean;
  sendEmailLoading: boolean;
};

export default function CandidateSignatureCard({
  candidateSignatureUrl,
  candidateSignedPdfUrl,
  candidateSignedPdfAt,
  candidateNotifyEmail,
  onApplyCandidateSignature,
  onSendFinalEmail,
  applyLoading,
  sendEmailLoading,
}: Props) {
  const signedLabel = candidateSignedPdfAt
    ? dayjs(candidateSignedPdfAt).format("MMM D, YYYY HH:mm")
    : null;

  const statusType = candidateSignedPdfUrl
    ? "success"
    : candidateSignatureUrl
    ? "info"
    : "warning";

  const statusMessage = candidateSignedPdfUrl
    ? "Signed PDF generated. You can download or send it to the candidate."
    : candidateSignatureUrl
    ? "Candidate has uploaded a signature. Apply it to the contract."
    : "Waiting for candidate to upload signature.";

  return (
    <Card
      style={{ borderRadius: 14, marginTop: 12 }}
      title={
        <Space>
          <FileDoneOutlined />
          <span>Candidate Signature</span>
        </Space>
      }
    >
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Alert type={statusType} showIcon message={statusMessage} />

        <Space direction="vertical" size={6}>
          <Text type="secondary">Candidate signature status</Text>
          <Space wrap>
            <Button
              type="primary"
              icon={<FileDoneOutlined />}
              disabled={!candidateSignatureUrl}
              loading={applyLoading}
              onClick={onApplyCandidateSignature}
            >
              Generate Signed PDF
            </Button>
            {!candidateSignatureUrl ? (
              <Tag>Signature not uploaded yet</Tag>
            ) : null}
            {signedLabel ? <Tag color="green">Signed {signedLabel}</Tag> : null}
          </Space>
        </Space>

        <Space direction="vertical" size={6}>
          <Text type="secondary">Candidate contact (notify email)</Text>
          <Text strong>
            {candidateNotifyEmail || "— (fill in contract form)"}
          </Text>
        </Space>

        {candidateSignedPdfUrl ? (
          <Space direction="vertical" size={8}>
            <Space wrap>
              <Button
                icon={<DownloadOutlined />}
                href={candidateSignedPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download Signed PDF
              </Button>
              <Button
                type="primary"
                icon={<MailOutlined />}
                loading={sendEmailLoading}
                disabled={!candidateNotifyEmail}
                onClick={onSendFinalEmail}
              >
                Send Final Email
              </Button>
            </Space>
            {!candidateNotifyEmail ? (
              <Text type="danger">
                Assign candidate email in the contract form before sending.
              </Text>
            ) : null}
          </Space>
        ) : (
          <Text type="secondary">
            Generate the signed PDF to enable download and email actions.
          </Text>
        )}
      </Space>
    </Card>
  );
}
