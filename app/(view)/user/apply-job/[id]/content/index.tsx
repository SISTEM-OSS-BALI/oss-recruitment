"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, Typography, Skeleton, Space, Modal, Button, Flex } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import { useJob } from "@/app/hooks/job";
import { sanitizeHtml } from "@/app/utils/sanitize-html";
import { toCapitalized } from "@/app/utils/capitalized";
import PreviewComponent from "../../../home/profile/content/PreviewComponent";
import { useAuth } from "@/app/utils/useAuth";
import { useMemo, useState } from "react";
import { useCandidates } from "@/app/hooks/applicant";

const { Title, Text } = Typography;

/* ----------------------------- Reusable UI ------------------------------ */
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "4px 10px",
        borderRadius: 999,
        background: "#F6FFED",
        color: "#389E0D",
        fontWeight: 600,
        fontSize: 12,
        border: "1px solid #B7EB8F",
      }}
    >
      {children}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        marginBottom: 8,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "#F0F5FF",
          display: "grid",
          placeItems: "center",
          color: "#2F54EB",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <Title level={5} style={{ margin: 0 }}>
          {title}
        </Title>
        {subtitle && (
          <Text type="secondary" style={{ fontSize: 13 }}>
            {subtitle}
          </Text>
        )}
      </div>
    </div>
  );
}

/* ------------------------------- Page ----------------------------------- */
export default function ApplyJobContent() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { data, fetchLoading: isLoading } = useJob({ id });

  const overviewHTML = useMemo(
    () => sanitizeHtml(data?.description ?? ""),
    [data?.description]
  );

  const goToQuestinScreening = (id: string) => {
    router.push(`/user/apply-job/${id}/question-screening`);
  };

  return (
    <div
      style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px 48px" }}
    >
      {/* Pills */}
      <Space size={8} wrap style={{ marginBottom: 10 }}>
        <Pill>Apply For</Pill>
        {!!data?.location && <Pill>{toCapitalized(data.location.name)}</Pill>}
        {!!data?.location && <Pill>{data.location.maps_url}</Pill>}
      </Space>

      {/* Title */}
      {isLoading ? (
        <Skeleton active paragraph={false} title={{ width: 320 }} />
      ) : (
        <Title level={2} style={{ margin: 0, lineHeight: 1.2 }}>
          {data?.name ?? "Job Title"}
        </Title>
      )}

      {/* Overview */}
      <Card
        size="small"
        style={{
          marginTop: 16,
          borderRadius: 14,
          borderColor: "#F0F0F0",
          background: "#FAFAFA",
        }}
        bodyStyle={{ padding: 18 }}
      >
        <SectionHeader
          icon={<FileTextOutlined />}
          title="Job Overview"
          subtitle="A brief summary of the role"
        />
        {!isLoading && (
          <div
            style={{ whiteSpace: "pre-line", padding: 24 }}
            dangerouslySetInnerHTML={{
              __html: overviewHTML || "<p>No overview provided.</p>",
            }}
          />
        )}
      </Card>

      <PreviewComponent />
      <Flex justify="end">
        <Button
          type="primary"
          // loading={onCreateLoading}
          onClick={() => goToQuestinScreening(id)}
          style={{
            marginTop: 20,
            borderRadius: 14,
            padding: "0 24px",
            height: 44,
            fontSize: 16,
          }}
        >
          Submit Application
        </Button>
      </Flex>
    </div>
  );
}
