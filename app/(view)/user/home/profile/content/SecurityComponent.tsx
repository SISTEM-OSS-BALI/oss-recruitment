"use client";

import { useState } from "react";
import { Button, Form, Input, Space, Typography, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;

const MIN_PASSWORD_LENGTH = 8;

type ChangePasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function SecurityComponent() {
  const [form] = Form.useForm<ChangePasswordFormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: ChangePasswordFormValues) => {
    setIsSubmitting(true);
    try {
      await axios.post("/api/user/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success("Password updated successfully.");
      form.resetFields();
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to update password."
        : "Failed to update password.";
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Space direction="vertical" size={4} style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>
          Change Password
        </Title>
        <Text type="secondary">
          Use at least {MIN_PASSWORD_LENGTH} characters to keep your account
          secure.
        </Text>
      </Space>

      <Form
        form={form}
        layout="vertical"
        size="large"
        requiredMark="optional"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Current Password"
          name="currentPassword"
          rules={[{ required: true, message: "Please enter your current password" }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Enter current password"
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[
            { required: true, message: "Please enter a new password" },
            {
              min: MIN_PASSWORD_LENGTH,
              message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Create new password"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          label="Confirm New Password"
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Please confirm your new password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Password confirmation does not match.")
                );
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Re-enter new password"
            autoComplete="new-password"
          />
        </Form.Item>

        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
          <Button htmlType="reset">Reset</Button>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            Update Password
          </Button>
        </Space>
      </Form>
    </div>
  );
}
