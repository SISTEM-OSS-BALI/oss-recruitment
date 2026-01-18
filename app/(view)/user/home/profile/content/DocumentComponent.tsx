import {
  Button,
  Card,
  Col,
  Divider,
  Image,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";

import SupaImageUploader from "@/app/utils/image-uploader";
import SupaPdfUploader from "@/app/utils/pdf-uploader";
import { UserPayloadUpdateModel } from "@/app/models/user";
import { useUser } from "@/app/hooks/user";
import { useAuth } from "@/app/utils/useAuth";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;
type SubmitProps = {
  loading?: boolean;
};

function getFileName(url?: string | null) {
  if (!url) return "—";
  return decodeURIComponent(url.split("/").pop() || "file");
}

export default function DocumentsComponent({ loading }: SubmitProps) {
  const { user_id } = useAuth();

  const { data: detailUserData, onUpdate: onUpdateUser } = useUser({
    id: user_id!,
  });

  const [draftCv, setDraftCv] = useState<string | null>(null);
  const [draftPhoto, setDraftPhoto] = useState<string | null>(null);
  const [draftPortfolio, setDraftPortfolio] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<
    "cv" | "photo" | "portfolio" | null
  >(null);

  const currentCv = detailUserData?.curiculum_vitae_url ?? null;
  const currentPhoto = detailUserData?.photo_url ?? null;
  const currentPortfolio = detailUserData?.portfolio_url ?? null;

  const isCvDirty = draftCv !== currentCv;
  const isPhotoDirty = draftPhoto !== currentPhoto;
  const isPortfolioDirty = draftPortfolio !== currentPortfolio;

  useEffect(() => {
    if (!detailUserData) return;
    setDraftCv(detailUserData.curiculum_vitae_url ?? null);
    setDraftPhoto(detailUserData.photo_url ?? null);
    setDraftPortfolio(detailUserData.portfolio_url ?? null);
  }, [detailUserData]);

  const handleSave = async (
    key: "cv" | "photo" | "portfolio",
    payload: UserPayloadUpdateModel
  ) => {
    if (!user_id) return;
    try {
      setSavingKey(key);
      await onUpdateUser({ id: user_id, payload });
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div>
      <Space direction="vertical" size={4} style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>
          Professional Documents
        </Title>
        <Text type="secondary">
          Upload up-to-date files to help hiring managers understand your
          experience.
        </Text>
      </Space>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card
            bordered
            style={{ borderRadius: 16, height: "100%" }}
            bodyStyle={{ padding: 16 }}
          >
            <Space direction="vertical" size={12} style={{ display: "block" }}>
              <Space align="center" size={8}>
                <Title level={5} style={{ margin: 0 }}>
                  CV / Resume
                </Title>
                <Tag color={currentCv ? "green" : "default"}>
                  {currentCv ? "Uploaded" : "Missing"}
                </Tag>
                {isCvDirty && <Tag color="gold">Unsaved</Tag>}
              </Space>
              <Text type="secondary">
                Accepted formats: PDF (max 10MB).
              </Text>

              <Divider style={{ margin: "8px 0" }} />

              <Space direction="vertical" size={6} style={{ display: "block" }}>
                <Text type="secondary">Current file</Text>
                {currentCv ? (
                  <Space direction="vertical" size={2}>
                    <Text strong>{getFileName(currentCv)}</Text>
                    <Button type="link" href={currentCv} target="_blank">
                      View current CV
                    </Button>
                  </Space>
                ) : (
                  <Text type="secondary">No CV uploaded yet.</Text>
                )}
              </Space>

              <Divider style={{ margin: "8px 0" }} />

              <Space
                direction="vertical"
                size={10}
                style={{ display: "block" }}
              >
                <Text type="secondary">Update file</Text>
                <SupaPdfUploader
                  bucket="web-oss-recruitment"
                  folder="pdf"
                  value={draftCv ?? undefined}
                  onChange={(value) => setDraftCv(value)}
                />
                <Space wrap style={{ marginTop: 12 }}>
                  <Button
                    onClick={() => setDraftCv(currentCv)}
                    disabled={!isCvDirty}
                  >
                    Reset
                  </Button>
                  <Button
                    type="primary"
                    onClick={() =>
                      handleSave("cv", {
                        curiculum_vitae_url: draftCv ?? null,
                      })
                    }
                    loading={loading || savingKey === "cv"}
                    disabled={!isCvDirty}
                  >
                    Save CV
                  </Button>
                </Space>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            bordered
            style={{ borderRadius: 16, height: "100%" }}
            bodyStyle={{ padding: 16 }}
          >
            <Space direction="vertical" size={12} style={{ display: "block" }}>
              <Space align="center" size={8}>
                <Title level={5} style={{ margin: 0 }}>
                  Profile Photo
                </Title>
                <Tag color={currentPhoto ? "green" : "default"}>
                  {currentPhoto ? "Uploaded" : "Missing"}
                </Tag>
                {isPhotoDirty && <Tag color="gold">Unsaved</Tag>}
              </Space>
              <Text type="secondary">
                Use a clear, professional headshot (max 5MB).
              </Text>

              <Divider style={{ margin: "8px 0" }} />

              <Space direction="vertical" size={6} style={{ display: "block" }}>
                <Text type="secondary">Current photo</Text>
                {currentPhoto ? (
                  <Image
                    src={currentPhoto}
                    alt="Profile photo"
                    width={96}
                    height={96}
                    style={{ borderRadius: 16, objectFit: "cover" }}
                    preview
                  />
                ) : (
                  <Text type="secondary">No photo uploaded yet.</Text>
                )}
              </Space>

              <Divider style={{ margin: "8px 0" }} />

              <Space
                direction="vertical"
                size={10}
                style={{ display: "block" }}
              >
                <Text type="secondary">Update photo</Text>
                <SupaImageUploader
                  bucket="web-oss-recruitment"
                  folder="profile"
                  label="Upload Photo"
                  value={draftPhoto ?? undefined}
                  onChange={(value) => setDraftPhoto(value)}
                  wrapperStyle={{
                    width: "100%",
                    maxWidth: 240,
                  }}
                />
                <Space wrap style={{ marginTop: 12 }}>
                  <Button
                    onClick={() => setDraftPhoto(currentPhoto)}
                    disabled={!isPhotoDirty}
                  >
                    Reset
                  </Button>
                  <Button
                    type="primary"
                    onClick={() =>
                      handleSave("photo", { photo_url: draftPhoto ?? null })
                    }
                    loading={loading || savingKey === "photo"}
                    disabled={!isPhotoDirty}
                  >
                    Save Photo
                  </Button>
                </Space>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            bordered
            style={{ borderRadius: 16, height: "100%" }}
            bodyStyle={{ padding: 16 }}
          >
            <Space direction="vertical" size={12} style={{ display: "block" }}>
              <Space align="center" size={8}>
                <Title level={5} style={{ margin: 0 }}>
                  Portfolio
                </Title>
                <Tag color={currentPortfolio ? "green" : "default"}>
                  {currentPortfolio ? "Uploaded" : "Optional"}
                </Tag>
                {isPortfolioDirty && <Tag color="gold">Unsaved</Tag>}
              </Space>
              <Text type="secondary">
                Share a portfolio or work sample (PDF).
              </Text>

              <Divider style={{ margin: "8px 0" }} />

              <Space direction="vertical" size={6} style={{ display: "block" }}>
                <Text type="secondary">Current file</Text>
                {currentPortfolio ? (
                  <Space direction="vertical" size={2}>
                    <Text strong>{getFileName(currentPortfolio)}</Text>
                    <Button type="link" href={currentPortfolio} target="_blank">
                      View portfolio
                    </Button>
                  </Space>
                ) : (
                  <Text type="secondary">No portfolio uploaded yet.</Text>
                )}
              </Space>

              <Divider style={{ margin: "8px 0" }} />

              <Space
                direction="vertical"
                size={10}
                style={{ display: "block" }}
              >
                <Text type="secondary">Update file</Text>
                <SupaPdfUploader
                  bucket="web-oss-recruitment"
                  folder="pdf"
                  value={draftPortfolio ?? undefined}
                  onChange={(value) => setDraftPortfolio(value)}
                />
                <Space wrap style={{ marginTop: 12 }}>
                  <Button
                    onClick={() => setDraftPortfolio(currentPortfolio)}
                    disabled={!isPortfolioDirty}
                  >
                    Reset
                  </Button>
                  <Button
                    type="primary"
                    onClick={() =>
                      handleSave("portfolio", {
                        portfolio_url: draftPortfolio ?? null,
                      })
                    }
                    loading={loading || savingKey === "portfolio"}
                    disabled={!isPortfolioDirty}
                  >
                    Save Portfolio
                  </Button>
                </Space>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
