"use client";

import React, { useState } from "react";
import { Card, Timeline, Typography, Space, Button, Tag, Form } from "antd";
import {
  VideoCameraOutlined,
  BankOutlined,
  CalendarTwoTone,
} from "@ant-design/icons";
import { formatDate, formatTime } from "@/app/utils/date-helper";
import { EvaluatorAssignmentPayloadCreateModel } from "@/app/models/evaluator-assignment";

const { Title, Text, Link } = Typography;

type Schedule = {
  id: string;
  date: string | Date;
  start_time: string | Date;
  meeting_link?: string | null;
};

export default function ScheduleTimeline({
  schedules,
  // onReschedule,
  applicant_id
}: {
  schedules: Schedule[];
  onReschedule: (item: Schedule) => void;
  applicant_id: string
}) {
  // warna aksen sesuai contoh (indigo-ish)
  const accent = "#5b5ce2"
  const [form] = Form.useForm<EvaluatorAssignmentPayloadCreateModel>();
    useState<EvaluatorAssignmentPayloadCreateModel | null>(null);




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
                      {/* <Button
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
                      </Button> */}
                      {/* <Button
                        size="large"
                        icon={<CheckOutlined />}
                        onClick={() => {
                          form.resetFields();
                          setModalType("create");
                          setModalOpen(true);
                        }}
                      >
                        Evaluation
                      </Button> */}
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
    </div>
  );
}
