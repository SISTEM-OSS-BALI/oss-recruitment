"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Button,
  Card,
  Col,
  Row,
  Skeleton,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  CalendarOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import { useJob } from "@/app/hooks/job";
import { sanitizeHtml } from "@/app/utils/sanitize-html";
import { toCapitalized } from "@/app/utils/capitalized";
import PreviewComponent from "../../../home/profile/content/PreviewComponent";
import formatSalary from "@/app/utils/format-salary";

const { Title, Text } = Typography;

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

  const formattedClosingDate = data?.until_at
    ? dayjs(data.until_at).format("dddd, DD MMM YYYY")
    : undefined;
  const formattedLocation = data?.location
    ? `${toCapitalized(data.location.name)} • ${data.location.address}`
    : undefined;
  const metaItems: MetaItem[] = [
    {
      label: "Employment Type",
      value: formatLabel(data?.commitment),
    },
    {
      label: "Work Arrangement",
      value: formatLabel(data?.arrangement),
    },
    {
      label: "Job Category",
      value: formatLabel(data?.type_job),
    },
    {
      label: "Salary Range",
      value: data?.show_salary
        ? formatSalary(data?.salary_min, data?.salary_max)
        : "Confidential",
    },
    {
      label: "Application Deadline",
      value: formattedClosingDate,
    },
    {
      label: "Location",
      value: formattedLocation,
      href: data?.location?.maps_url,
      icon: <EnvironmentOutlined />,
    },
  ].filter((item) => Boolean(item.value)) as MetaItem[];

  const stats: StatItem[] = [
    {
      label: "In Process",
      description: "Candidates still progressing",
      value: data?.stats?.connected ?? 0,
    },
    {
      label: "New Chats",
      description: "Recent candidate conversations",
      value: data?.stats?.chatStarted ?? 0,
    },
    {
      label: "Not Suitable",
      description: "Filtered out applicants",
      value: data?.stats?.notSuitable ?? 0,
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 64px" }}>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <HeroCard
          isLoading={isLoading}
          jobName={data?.job_title}
          locationLabel={formattedLocation}
          closingDate={formattedClosingDate}
          onApply={() => goToQuestinScreening(id)}
        />

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={15}>
            <Card
              bordered={false}
              style={{ borderRadius: 16, boxShadow: "0 12px 32px rgba(15,23,42,0.04)" }}
              bodyStyle={{ padding: 24 }}
            >
              <SectionHeader
                icon={<FileTextOutlined />}
                title="Role Overview"
                subtitle="Understand what the team is looking for"
              />
              {isLoading ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : (
                <div
                  style={{
                    whiteSpace: "pre-line",
                    padding: "12px 0",
                    color: "rgba(0,0,0,0.75)",
                    lineHeight: 1.65,
                  }}
                  dangerouslySetInnerHTML={{
                    __html: overviewHTML || "<p>No overview provided.</p>",
                  }}
                />
              )}
            </Card>

            <Card
              bordered={false}
              style={{ marginTop: 24, borderRadius: 16, boxShadow: "0 8px 24px rgba(15,23,42,0.05)" }}
              bodyStyle={{ padding: 24 }}
            >
              <SectionHeader
                icon={<ThunderboltOutlined />}
                title="Your Application Snapshot"
                subtitle="Keep your candidate profile sharp before submitting"
              />
              <div style={{ marginTop: 12 }}>
                <PreviewComponent />
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={9}>
            <Card
              title="Key Job Details"
              bordered={false}
              style={{ borderRadius: 16, boxShadow: "0 12px 32px rgba(15,23,42,0.05)" }}
              bodyStyle={{ padding: 0 }}
            >
              <Space
                direction="vertical"
                style={{ width: "100%", padding: 24 }}
                size={20}
              >
                {metaItems.map((item) => (
                  <MetaInfoRow key={item.label} {...item} />
                ))}
              </Space>
            </Card>

            <Card
              bordered={false}
              style={{
                marginTop: 24,
                borderRadius: 16,
                background:
                  "linear-gradient(135deg, #182235 0%, #101828 100%)",
                color: "#E2E8F0",
              }}
              bodyStyle={{ padding: 24 }}
            >
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Space align="center">
                  <TeamOutlined style={{ color: "#9DB7FF", fontSize: 18 }} />
                  <div>
                    <Text style={{ color: "#E2E8F0" }}>Recruitment Pulse</Text>
                    <Text style={{ display: "block", color: "#C2CEE8" }}>
                      Latest pipeline insights
                    </Text>
                  </div>
                </Space>
                <Row gutter={[12, 12]}>
                  {stats.map((stat) => (
                    <Col xs={12} key={stat.label}>
                      <StatCard {...stat} />
                    </Col>
                  ))}
                </Row>
              </Space>
            </Card>
          </Col>
        </Row>

        <Card
          bordered={false}
          style={{
            borderRadius: 18,
            background:
              "linear-gradient(135deg, rgba(79,129,255,0.12) 0%, rgba(96,110,255,0.08) 100%)",
          }}
          bodyStyle={{ padding: 24 }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={16}>
              <Title level={4} style={{ margin: 0 }}>
                Ready to move forward?
              </Title>
              <Text type="secondary">
                Submit your application and complete the screening questions to
                let recruiters know you are interested.
              </Text>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: "right" }}>
              <Button
                type="primary"
                size="large"
                style={{
                  minWidth: 200,
                  border: "none",
                  background:
                    "linear-gradient(135deg, #1f4ed8 0%, #5a67f2 100%)",
                }}
                onClick={() => goToQuestinScreening(id)}
              >
                Continue to Screening
              </Button>
            </Col>
          </Row>
        </Card>
      </Space>
    </div>
  );
}

type MetaItem = {
  label: string;
  value: string;
  href?: string;
  icon?: React.ReactNode;
};

function MetaInfoRow({ label, value, href, icon }: MetaItem) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: "#F4F6FB",
          display: "grid",
          placeItems: "center",
        }}
      >
        {icon ?? <CalendarOutlined style={{ color: "#1D39C4" }} />}
      </div>
      <div style={{ flex: 1 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {label}
        </Text>
        {href ? (
          <Typography.Link href={href} target="_blank" rel="noopener noreferrer">
            {value}
          </Typography.Link>
        ) : (
          <Text style={{ display: "block", fontWeight: 600 }}>{value}</Text>
        )}
      </div>
    </div>
  );
}

type StatItem = {
  label: string;
  value: number;
  description: string;
};

function StatCard({ label, value, description }: StatItem) {
  return (
    <Card
      bordered={false}
      style={{
        background: "rgba(255,255,255,0.12)",
        borderRadius: 12,
        color: "#E2E8F0",
        border: "1px solid rgba(148, 163, 184, 0.2)",
      }}
      bodyStyle={{ padding: 16 }}
    >
      <Text style={{ fontSize: 28, fontWeight: 700, display: "block" }}>
        {value}
      </Text>
      <Text style={{ display: "block", color: "#F8FAFC" }}>{label}</Text>
      <Text style={{ color: "#CBD5F5", fontSize: 12 }}>{description}</Text>
    </Card>
  );
}

type HeroCardProps = {
  isLoading: boolean;
  jobName?: string;
  locationLabel?: string;
  closingDate?: string;
  onApply: () => void;
};

function HeroCard({
  isLoading,
  jobName,
  locationLabel,
  closingDate,
  onApply,
}: HeroCardProps) {
  return (
    <Card
      bordered={false}
      style={{
        borderRadius: 24,
        background:
          "linear-gradient(135deg, #1d2760 0%, #1f4ed8 100%)",
        color: "white",
      }}
      bodyStyle={{ padding: 32 }}
    >
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 2 }} title />
      ) : (
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Space size={[8, 8]} wrap>
            <Tag
              style={{
                borderRadius: 999,
                border: "none",
                background: "rgba(255,255,255,0.16)",
                color: "#E0EAFF",
                fontWeight: 600,
              }}
            >
              Apply For
            </Tag>
            {locationLabel && (
              <Tag
                style={{
                  borderRadius: 999,
                  border: "none",
                  background: "rgba(255,255,255,0.16)",
                  color: "#E0EAFF",
                  fontWeight: 600,
                }}
              >
                {locationLabel}
              </Tag>
            )}
            {closingDate && (
              <Tag
                style={{
                  borderRadius: 999,
                  border: "none",
                  background: "rgba(253,224,71,0.25)",
                  color: "#FDE68A",
                  fontWeight: 600,
                }}
              >
                Close on {closingDate}
              </Tag>
            )}
          </Space>
          <Title level={2} style={{ color: "white", margin: 0 }}>
            {jobName ?? "Job Title"}
          </Title>
          <Text style={{ color: "rgba(226,232,240,0.85)" }}>
            Showcase your experience and demonstrate why you are the right fit for
            this opportunity.
          </Text>
          {/* <Button
            type="primary"
            size="large"
            style={{ width: "fit-content", marginTop: 8 }}
            onClick={onApply}
          >
            Submit Application
          </Button> */}
        </Space>
      )}
    </Card>
  );
}

function formatLabel(value?: string | null) {
  if (!value) return undefined;
  return toCapitalized(value.replace(/_/g, " "));
}
