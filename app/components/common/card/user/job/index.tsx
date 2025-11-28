import { Button, Card, Row, Col, Typography } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import stripHtml from "@/app/utils/strip-html";
import { JobDataModel } from "@/app/models/job";
import { useRouter } from "next/navigation";
import { useState } from "react";

const { Text } = Typography;

export default function JobCard({ job }: { job: JobDataModel }) {
  const hoursLeft = dayjs(job.until_at).diff(dayjs(), "hour");
  const [openModal, isOpenModal] = useState(false);
  const deadlineStr =
    hoursLeft < 0
      ? "Closed"
      : hoursLeft < 24
      ? `${hoursLeft} hours left`
      : `${Math.floor(hoursLeft / 24)} days left`;

  const router = useRouter();
  return (
    <Card
      bodyStyle={{ padding: 28, paddingBottom: 18 }}
      style={{
        borderRadius: 16,
        boxShadow: "0 2px 16px rgba(55,120,240,0.03)",
        border: "1px solid #f1f3fa",
      }}
    >
      <Row
        align="middle"
        justify="space-between"
        style={{ marginBottom: 12, flexWrap: "wrap" }}
      >
        <Col>
          <Text style={{ fontSize: 16, fontWeight: 700 }}>{job.job_title}</Text>
          <div
            style={{ marginTop: 8, display: "flex", gap: 7, flexWrap: "wrap" }}
          >
            <ClockCircleOutlined style={{ marginRight: 5 }} />
            {deadlineStr}
          </div>
        </Col>
        <Col>{/* Kosong untuk responsive */}</Col>
      </Row>
      <Text style={{ color: "#5d5d5d", fontSize: 17 }}>
        {stripHtml(job.description).slice(0, 60)}...
      </Text>
      <Row justify="end" style={{ marginTop: 24, gap: 12 }}>
        <Button
          size="large"
          style={{
            borderColor: "#2467e7",
            color: "#2467e7",
            borderRadius: 9,
            fontWeight: 500,
          }}
        >
          View Detail
        </Button>
        <Button
          type="primary"
          size="large"
          style={{
            background: "#2467e7",
            borderRadius: 9,
            fontWeight: 500,
            padding: "0 26px",
          }}
          onClick={() => {
            router.push(`/user/apply-job/${job.id}`);
          }}
        >
          Apply Now
        </Button>
      </Row>
    </Card>
  );
}
