"use client";

import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Space,
  TimePicker,
  Typography,
  message,
} from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { ScheduleHiredPayloadCreateModel } from "@/app/models/hired";

const { Text } = Typography;

type FormValues = {
  interviewer: string;
  date: Dayjs;
  time: Dayjs;
  online?: boolean;
  link?: string;
  note?: string;
};

type Props = {
  candidateId: string;
  loading?: boolean;
  onSubmit: (values: ScheduleHiredPayloadCreateModel) => Promise<void>;
};

/* ==================== Component ==================== */
export default function ScheduleHiredForm({ loading, onSubmit }: Props) {
  const [form] = Form.useForm<FormValues>();
  const [isOnline, setIsOnline] = useState(false);

  const disabledDate = useMemo(
    () => (current: Dayjs) => current && current < dayjs().startOf("day"),
    []
  );

  const handleFinish = async (values: ScheduleHiredPayloadCreateModel) => {
    await onSubmit(values);
    message.success("Hired schedule submitted");
    form.resetFields();
    setIsOnline(false);
  };

  return (
    <Card
      style={{ borderRadius: 14 }}
      title={
        <Space>
          <CalendarOutlined />
          <span>Schedule Hired</span>
        </Space>
      }
      headStyle={{ borderBottom: "none" }}
    >
      <Text type="secondary">
        Set up Hired schedule for the candidate. Default Hired duration
        is flexible.
      </Text>

      <Form<FormValues>
        form={form}
        layout="vertical"
        style={{ marginTop: 16 }}
        size="large"
        onFinish={handleFinish}
      >
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Hired Date"
              name="date"
              rules={[{ required: true, message: "Please choose date" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                disabledDate={disabledDate}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Start Time"
              name="start_time"
              rules={[{ required: true, message: "Please choose time" }]}
            >
              <TimePicker
                style={{ width: "100%" }}
                format="HH:mm"
                minuteStep={5}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="online"
          valuePropName="checked"
          style={{ marginBottom: 8 }}
        >
          <Checkbox onChange={(e) => setIsOnline(e.target.checked)}>
            Is this Hired online?
          </Checkbox>
        </Form.Item>

        {isOnline && (
          <Form.Item
            label="Meeting Link"
            name="link"
            rules={[
              { required: true, message: "Please input meeting link" },
              { type: "url", message: "Link must be a valid URL (https://…)" },
            ]}
          >
            <Input placeholder="https://meet.google.com/abc-defg-hij" />
          </Form.Item>
        )}

        <Form.Item label="Notes (optional)" name="note">
          <Input.TextArea
            placeholder="Add additional info for Hireder…"
            autoSize={{ minRows: 3 }}
          />
        </Form.Item>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            Submit Schedule
          </Button>
        </div>
      </Form>
    </Card>
  );
}
