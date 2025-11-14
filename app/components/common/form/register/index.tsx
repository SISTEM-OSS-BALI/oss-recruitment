import { primaryColor } from "@/app/utils/color";
import { Button, Form, Input } from "antd";

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

export default function RegisterForm({
  onFinish,
  loading,
}: {
  onFinish: (values: RegisterFormValues) => Promise<void>;
  loading?: boolean;
}) {
  const [form] = Form.useForm<RegisterFormValues>();

  return (
    <Form layout="vertical" onFinish={onFinish} form={form}>
      <Form.Item
        label="Full Name"
        name="name"
        rules={[{ required: true, message: "Full name is required." }]}
      >
        <Input placeholder="Enter your full name" size="large" />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: "Email is required." },
          { type: "email", message: "Email format is invalid." },
        ]}
      >
        <Input placeholder="name@example.com" size="large" />
      </Form.Item>

      <Form.Item label="Phone Number" name="phone">
        <Input placeholder="Optional" size="large" />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[
          { required: true, message: "Password is required." },
          {
            min: 8,
            message: "Password must be at least 8 characters.",
          },
        ]}
      >
        <Input.Password placeholder="Minimum 8 characters" size="large" />
      </Form.Item>

      <Form.Item
        label="Confirm Password"
        name="confirmPassword"
        dependencies={["password"]}
        rules={[
          { required: true, message: "Please confirm your password." },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error("Passwords do not match, please double-check.")
              );
            },
          }),
        ]}
      >
        <Input.Password placeholder="Re-enter your password" size="large" />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          size="large"
          style={{
            width: "100%",
            backgroundColor: primaryColor,
            borderColor: primaryColor,
          }}
        >
          Create Account
        </Button>
      </Form.Item>
    </Form>
  );
}
