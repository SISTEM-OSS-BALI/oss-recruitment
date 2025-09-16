"use client";

import React, { useState } from "react";
import { Card, Timeline, Typography, Space, Button, Tag, Form } from "antd";
import {
  CalendarOutlined,
  EnvironmentOutlined,
  VideoCameraOutlined,
  BankOutlined,
  CalendarTwoTone,
  CheckOutlined,
} from "@ant-design/icons";
import { formatDate, formatTime } from "@/app/utils/date-helper";
import EvaluationAssignmentModal from "@/app/components/common/modal/admin/evaluation-assignment";
import {
  useEvaluatorAssignment,
  useEvaluatorAssignments,
} from "@/app/hooks/evaluatorAssignment";
import { EvaluatorAssignmentPayloadCreateModel } from "@/app/models/evaluator-assignment";

const { Title, Text, Link } = Typography;

type Schedule = {
  id: string;
  date: string | Date;
  start_time: string | Date;
  meeting_link?: string | null;
  location?: {
    id: string;
    name: string;
    address?: string | null;
    maps_url?: string | null;
  } | null;
};

export default function ScheduleTimeline({
  schedules,
  onReschedule,
  candidate_id
}: {
  schedules: Schedule[];
  onReschedule: (item: Schedule) => void;
  candidate_id: string
}) {
  // warna aksen sesuai contoh (indigo-ish)
  const accent = "#5b5ce2";
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm<EvaluatorAssignmentPayloadCreateModel>();
  const [selectedEvaluatorAssignment, setSelectedEvaluatorAssignment] =
    useState<EvaluatorAssignmentPayloadCreateModel | null>(null);
  const [modalType, setModalType] = useState<"create" | "update">("create");
  const {
    data: evaluatorsData,
    onCreate: createEvaluatorAssignment,
    onCreateLoading: loadingCreate,
  } = useEvaluatorAssignments({});
  const {
    onUpdate: updateEvaluatorAssignment,
    onUpdateLoading: loadingUpdate,
  } = useEvaluatorAssignment({
    id: selectedEvaluatorAssignment?.id || "",
  });

  const handleEdit = (id: string) => {
    const evaluatorEdit = evaluatorsData?.find(
      (evaluator) => evaluator.id === id
    );
    if (evaluatorEdit) {
      setSelectedEvaluatorAssignment(evaluatorEdit);
      setModalType("update");
      setModalOpen(true);
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
  };

  const handleFinish = async (
    values: EvaluatorAssignmentPayloadCreateModel
  ) => {
    const payload = {
      ...values,
      candidate_id
    }
    if (modalType === "create") {
      await createEvaluatorAssignment(payload);
    } else if (selectedEvaluatorAssignment?.id) {
      await updateEvaluatorAssignment({
        id: selectedEvaluatorAssignment.id,
        payload: payload,
      });
    }
    form.resetFields();
    setSelectedEvaluatorAssignment(null);
    setModalOpen(false);
    setModalType("create");
  };

  return (
    <div
      style={{
        background: "#fff",
        padding: 16,
        borderRadius: 12,
      }}
    >
      <Timeline
        style={{ marginLeft: 8 }}
        items={schedules.flatMap((item) => {
          const isOnline = !!item.meeting_link;

          const interviewCard = {
            dot: (
              <span
                style={{
                  display: "inline-block",
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  border: `3px solid ${accent}`,
                  background: "#fff",
                  boxShadow: "0 0 0 4px #f0f2ff",
                }}
              />
            ),
            color: accent,
            children: (
              <Card
                bodyStyle={{ padding: 24 }}
                style={{
                  borderRadius: 16,
                  boxShadow:
                    "0 8px 30px rgba(17, 38, 146, 0.06), 0 2px 8px rgba(17, 38, 146, 0.04)",
                  border: "none",
                }}
              >
                <Text type="secondary" style={{ display: "block" }}>
                  {formatDate(item.date)}
                </Text>

                <Space size={10} align="center" style={{ marginTop: 6 }}>
                  {isOnline ? (
                    <VideoCameraOutlined
                      style={{ fontSize: 20, color: accent }}
                    />
                  ) : (
                    <BankOutlined style={{ fontSize: 20, color: accent }} />
                  )}
                  <Title
                    level={4}
                    style={{
                      margin: 0,
                      color: "#2a3342",
                      letterSpacing: 0.2,
                      fontWeight: 800,
                    }}
                  >
                    {isOnline ? "Online Interview" : "On-site Interview"}
                  </Title>
                </Space>

                <Text
                  style={{ display: "block", marginTop: 8, color: "#556070" }}
                >
                  {isOnline
                    ? "Online interview via meeting link."
                    : "Face-to-face interview at the company location"}
                </Text>

                <Space size={10} style={{ marginTop: 14 }}>
                  <Text strong style={{ fontSize: 18, color: accent }}>
                    Time {formatTime(item.start_time)}
                  </Text>
                </Space>
              </Card>
            ),
          };

          const locationCard = {
            dot: (
              <span
                style={{
                  display: "inline-block",
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  border: `3px solid ${accent}`,
                  background: "#fff",
                  boxShadow: "0 0 0 4px #f0f2ff",
                }}
              />
            ),
            color: accent,
            children: (
              <Card
                bodyStyle={{ padding: 24 }}
                style={{
                  marginTop: 10,
                  borderRadius: 16,
                  boxShadow:
                    "0 8px 30px rgba(17, 38, 146, 0.06), 0 2px 8px rgba(17, 38, 146, 0.04)",
                  border: "none",
                }}
              >
                <Space align="center" size={10} style={{ marginBottom: 8 }}>
                  <EnvironmentOutlined
                    style={{ fontSize: 22, color: accent }}
                  />
                  <Title
                    level={4}
                    style={{ margin: 0, color: "#2a3342", fontWeight: 800 }}
                  >
                    Location
                  </Title>
                </Space>

                {isOnline ? (
                  <>
                    <Text strong style={{ display: "block", color: "#2a3342" }}>
                      Meeting Link
                    </Text>
                    <Space wrap size={8} style={{ marginTop: 6 }}>
                      <Tag
                        color="processing"
                        icon={<CalendarTwoTone twoToneColor={accent} />}
                      >
                        Online
                      </Tag>
                      {item.meeting_link && (
                        <Link
                          href={item.meeting_link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {item.meeting_link}
                        </Link>
                      )}
                    </Space>
                  </>
                ) : (
                  <>
                    <Text strong style={{ display: "block", color: "#2a3342" }}>
                      {item.location?.name ?? "-"}
                    </Text>
                    {item.location?.address && (
                      <Text
                        type="secondary"
                        style={{ display: "block", marginTop: 4 }}
                      >
                        {item.location.address}
                      </Text>
                    )}

                    <Space size={12} wrap style={{ marginTop: 18 }}>
                      <Button
                        size="large"
                        style={{
                          borderRadius: 12,
                          height: 44,
                          background: "#fff",
                          borderColor: "#dfe3f0",
                        }}
                        icon={<CalendarOutlined />}
                        onClick={() => onReschedule(item)}
                      >
                        Reschedule
                      </Button>
                      <Button
                        size="large"
                        icon={<CheckOutlined />}
                        onClick={() => {
                          form.resetFields();
                          setSelectedEvaluatorAssignment(null);
                          setModalType("create");
                          setModalOpen(true);
                        }}
                      >
                        Evaluation
                      </Button>
                    </Space>
                  </>
                )}
              </Card>
            ),
          };

          // dua node timeline per jadwal: detail interview + lokasi
          return [interviewCard, locationCard];
        })}
      />

      <EvaluationAssignmentModal
        open={modalOpen}
        onClose={() => handleCancel()}
        handleFinish={handleFinish}
        loadingCreate={loadingCreate}
        loadingUpdate={loadingUpdate}
        type={modalType}
        // initialValues={initialValues}
      />
    </div>
  );
}
