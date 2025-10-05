"use client";

import React, { useMemo } from "react";
import {
  Card,
  Col,
  Descriptions,
  Empty,
  List,
  Progress,
  Row,
  Space,
  Tag,
  Typography,
  Alert,
  Divider,
  Tooltip,
  Button,
} from "antd";
import {
  LinkOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";


const { Title, Text } = Typography;

/* ====== Types dari Devil check_test ====== */
type DevilResultData = {
  prediction: string; // "ISTJ"
  predictions: Record<string, number>; // { ISTJ: 5, INFP: 5, ... }
  trait_order_conscious?: {
    hero?: string;
    parent?: string;
    child?: string;
    inferior?: string;
  };
  trait_order_shadow?: {
    nemesis?: string;
    critic?: string;
    trickster?: string;
    demon?: string;
  };
  matches?: Record<string, string>; // berisi HTML anchor dari vendor
  test_id: string;
  result_date?: string; // "YYYY-MM-DD HH:mm:ss"
  results_page?: string; // url publik hasil
};

type DevilCheckTestResp = {
  meta: {
    status_code: number;
    success: boolean;
    docs_url?: string;
    total_results?: number;
  };
  data?: DevilResultData;
};

/* ====== Props fleksibel ====== */
type ApplicantLike = {
  mbti_test?: { result?: string | null } | null;
};

type Props =
  | { applicant: ApplicantLike; result?: never }
  | { applicant?: never; result: DevilCheckTestResp | string };

/* ====== Util ====== */
function parseDevilResult(
  input?: DevilCheckTestResp | string | null
): DevilResultData | null {
  if (!input) return null;
  try {
    const obj =
      typeof input === "string"
        ? (JSON.parse(input) as DevilCheckTestResp)
        : input;
    return obj?.data ?? null;
  } catch {
    return null;
  }
}



/* ====== Komponen ====== */
export default function ResultMBTIComponent(props: Props) {
  const devilData: DevilResultData | null = useMemo(() => {
    if ("applicant" in props && props.applicant) {
      return parseDevilResult(props.applicant.mbti_test?.result ?? null);
    }
    if ("result" in props) {
      return parseDevilResult(props.result);
    }
    return null;
  }, [props]);

  if (!devilData) {
    return (
      <Empty
        description={
          <Space direction="vertical" size={4}>
            <Text strong>Tidak ada hasil MBTI</Text>
            <Text type="secondary">
              Hasil belum tersedia atau format tidak valid.
            </Text>
          </Space>
        }
      />
    );
  }

  const {
    prediction,
    predictions,
    trait_order_conscious,
    trait_order_shadow,
    matches,
    results_page,
  } = devilData;

  const sortedPreds = Object.entries(predictions || {}).sort(
    (a, b) => (b[1] ?? 0) - (a[1] ?? 0)
  );

  const maxAbs = Math.max(1, ...sortedPreds.map(([, v]) => Math.abs(v ?? 0)));

  return (
    <Space direction="vertical" size={16} style={{ display: "flex" }}>
      {/* Header */}
      <Card style={{ borderRadius: 16 }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col flex="auto">
            <Space direction="vertical" size={4}>
              <Title level={3} style={{ margin: 0 }}>
                MBTI Result
              </Title>
            </Space>
          </Col>
          <Col>
            <Tag color="blue" style={{ padding: "6px 12px", fontSize: 16 }}>
              Prediksi: <b>{prediction}</b>
            </Tag>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
          <Col
            xs={24}
            md={8}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            {results_page ? (
              <Button
                icon={<LinkOutlined />}
                onClick={() => window.open(results_page, "_blank")}
              >
                Open Results Page
              </Button>
            ) : (
              <Tooltip title="Vendor tidak menyediakan tautan publik untuk hasil ini">
                <Tag>no public link</Tag>
              </Tooltip>
            )}
          </Col>
        </Row>
      </Card>

      {/* Predictions list */}
      <Card
        title={
          <Space>
            <span>Type Scores</span>
            <Tooltip title="Skor relatif; nilai negatif berarti kecocokan rendah menurut vendor">
              <InfoCircleOutlined />
            </Tooltip>
          </Space>
        }
        style={{ borderRadius: 16 }}
      >
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          {sortedPreds.map(([type, score]) => {
            const pct = Math.round((Math.abs(score) / maxAbs) * 100);
            const isNeg = (score ?? 0) < 0;
            return (
              <div key={type}>
                <Space
                  style={{ width: "100%", justifyContent: "space-between" }}
                >
                  <Text strong>{type}</Text>
                  <Text type={isNeg ? "danger" : "success"}>{score}</Text>
                </Space>
                <Progress
                  percent={pct}
                  showInfo={false}
                  status={isNeg ? "exception" : "active"}
                />
              </div>
            );
          })}
        </Space>
      </Card>

      {/* Trait orders */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Conscious Function Stack" style={{ borderRadius: 16 }}>
            {trait_order_conscious ? (
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="Hero">
                  {trait_order_conscious.hero?.toUpperCase() || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Parent">
                  {trait_order_conscious.parent?.toUpperCase() || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Child">
                  {trait_order_conscious.child?.toUpperCase() || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Inferior">
                  {trait_order_conscious.inferior?.toUpperCase() || "-"}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Alert
                type="info"
                message="Tidak ada data function stack sadar."
                showIcon
              />
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Shadow Function Stack" style={{ borderRadius: 16 }}>
            {trait_order_shadow ? (
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="Nemesis">
                  {trait_order_shadow.nemesis?.toUpperCase() || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Critic">
                  {trait_order_shadow.critic?.toUpperCase() || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Trickster">
                  {trait_order_shadow.trickster?.toUpperCase() || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Demon">
                  {trait_order_shadow.demon?.toUpperCase() || "-"}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Alert
                type="info"
                message="Tidak ada data function stack bayangan."
                showIcon
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Matches (HTML dari vendor) */}
      <Card title="Matches" style={{ borderRadius: 16 }}>
        {matches && Object.keys(matches).length > 0 ? (
          <List
            size="small"
            dataSource={Object.entries(matches).sort(
              (a, b) => Number(a[0]) - Number(b[0])
            )}
            renderItem={([k, html]) => (
              <List.Item key={k} style={{ paddingLeft: 0 }}>
                {/* vendor mengirim HTML; render apa adanya */}
                <span dangerouslySetInnerHTML={{ __html: html }} />
              </List.Item>
            )}
          />
        ) : (
          <Alert type="info" message="Tidak ada catatan kecocokan." showIcon />
        )}
        <Divider style={{ margin: "12px 0" }} />
        <Text type="secondary" style={{ fontSize: 12 }}>
          Catatan: Hasil MBTI bersifat indikatif. Gunakan sebagai referensi
          ringan, bukan keputusan final.
        </Text>
      </Card>
    </Space>
  );
}
