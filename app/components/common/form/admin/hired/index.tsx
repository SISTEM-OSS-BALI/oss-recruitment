"use client";

import React, { useMemo } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Space,
  TimePicker,
  Typography,
  message,
} from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { useLocations } from "@/app/hooks/location";

const { Text } = Typography;

export type ScheduleHiredFormValues = {
  date: Dayjs;
  start_time: Dayjs;
  location_id?: string;
  note?: string;
};

type Props = {
  candidateId: string;
  loading?: boolean;
  onSubmit: (values: ScheduleHiredFormValues) => Promise<void>;
};

/* ==================== Component ==================== */
export default function ScheduleHiredForm({ loading, onSubmit }: Props) {
  const [form] = Form.useForm<ScheduleHiredFormValues>();
  const { data: location } = useLocations({});
  const disabledDate = useMemo(
    () => (current: Dayjs) => current && current < dayjs().startOf("day"),
    []
  );

  const handleFinish = async (values: ScheduleHiredFormValues) => {
    await onSubmit(values);
    message.success("Hired schedule submitted");
    form.resetFields();
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
        Set up Hired schedule for the candidate. Default Hired duration is
        flexible.
      </Text>

      <Form<ScheduleHiredFormValues>
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
          label="Location"
          name="location_id"
          rules={[{ required: true, message: "Please select location" }]}
        >
          <Select>
            {location?.map((location) => (
              <Select.Option key={location.id} value={location.id}>
                {location.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

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
