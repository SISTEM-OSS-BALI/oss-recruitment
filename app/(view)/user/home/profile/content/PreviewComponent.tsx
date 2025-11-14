"use client";
import { useUser } from "@/app/hooks/user";
import { useAuth } from "@/app/utils/useAuth";
import CandidatePreview from "@/app/components/common/information-preview";
import { useMemo } from "react";
import {
  Card,
  Col,
  Row,
  Space,
  Tabs,
  Typography,
  Avatar,
  Tag,
} from "antd";
import { FilePdfOutlined, StarFilled } from "@ant-design/icons";
import { PDFViewer } from "@/app/utils/pdf-viewer";
import { UserDataModel } from "@/app/models/user";

const { Title, Text } = Typography;

export default function PreviewComponent() {
  const { user_id } = useAuth();
  const { data: detailUserData } = useUser({ id: user_id! });

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
        children: <PDFViewer src={detailUserData?.curiculum_vitae_url} />,
      },
      {
        key: "cert",
        label: (
          <Space>
            <FilePdfOutlined />
            Portofolio
          </Space>
        ),
        children: <PDFViewer src={detailUserData?.portfolio_url} />,
      },
    ],
    [detailUserData?.curiculum_vitae_url, detailUserData?.portfolio_url]
  );

  const completionScore = useMemo(() => {
    const fields = [
      detailUserData?.name,
      detailUserData?.email,
      detailUserData?.phone,
      detailUserData?.curiculum_vitae_url,
      detailUserData?.photo_url,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100) || 0;
  }, [
    detailUserData?.curiculum_vitae_url,
    detailUserData?.email,
    detailUserData?.name,
    detailUserData?.phone,
    detailUserData?.photo_url,
  ]);

  const documentsUploaded = useMemo(() => {
    if (!detailUserData) return 0;
    const keys: Array<keyof UserDataModel> = [
      "curiculum_vitae_url",
      "photo_url",
      "portfolio_url",
    ];
    return keys.reduce(
      (acc, key) => (detailUserData[key] ? acc + 1 : acc),
      0
    );
  }, [detailUserData]);

  const interestCount = detailUserData?.interestTags?.length ?? 0;

  const initials =
    detailUserData?.name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  const insightCards = [
    { label: "Profile completeness", value: `${completionScore}%` },
    { label: "Documents ready", value: `${documentsUploaded}/3 files` },
    { label: "Interests", value: `${interestCount} tags` },
  ];

  return (
    <Row gutter={[16, 16]}>
      {/* LEFT PANEL */}
      <Col xs={24} md={8}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Card
            bordered={false}
            style={{
              borderRadius: 18,
              background:
                "linear-gradient(135deg, rgba(36,103,231,0.12), rgba(99,102,241,0.12))",
            }}
            bodyStyle={{ padding: 24 }}
          >
            <Space size={18} direction="vertical" style={{ width: "100%" }}>
              <Space size={16} align="center">
                <Avatar
                  size={64}
                  style={{
                    background: "#2467e7",
                    fontWeight: 600,
                    fontSize: 22,
                  }}
                >
                  {initials}
                </Avatar>
                <div>
                  <Title level={4} style={{ marginBottom: 0 }}>
                    {detailUserData?.name ?? "Candidate Name"}
                  </Title>
                  <Text type="secondary">
                    {detailUserData?.address ||
                      "Let recruiters know where you are based."}
                  </Text>
                </div>
              </Space>
              <Tag
                icon={<StarFilled />}
                color="blue"
                style={{ alignSelf: "flex-start", borderRadius: 999 }}
              >
                Ready for opportunities
              </Tag>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                  gap: 12,
                }}
              >
                {insightCards.map((card) => (
                  <div
                    key={card.label}
                    style={{
                      background: "#fff",
                      borderRadius: 14,
                      padding: "10px 12px",
                      boxShadow: "0 5px 18px rgba(15,23,42,0.08)",
                    }}
                  >
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {card.label}
                    </Text>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>
                      {card.value}
                    </div>
                  </div>
                ))}
              </div>
            </Space>
          </Card>
          <CandidatePreview
            email={detailUserData?.email}
            phone={detailUserData?.phone}
            dateOfBirth={detailUserData?.date_of_birth}
            cvUrl={detailUserData?.curiculum_vitae_url}
            portfolioUrl={detailUserData?.portfolio_url}
            interests={
              detailUserData?.interestTags?.map((item) => item.interest) ?? []
            }
          />
        </Space>
      </Col>

      {/* RIGHT PANEL */}
      <Col xs={24} md={16}>
        <Card
          bordered={false}
          style={{
            borderRadius: 18,
            boxShadow: "0 20px 45px rgba(15,23,42,0.08)",
          }}
          bodyStyle={{ padding: 20 }}
        >
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
        </Card>
      </Col>
    </Row>
  );
}
