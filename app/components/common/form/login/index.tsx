import { UserFormModel } from "@/app/models/user";
import { primaryColor } from "@/app/utils/color";
import { Button, Form, Input } from "antd";

export default function FormLogin({
  onFinish,
  loading,
}: {
  onFinish: (values: UserFormModel) => Promise<void>;
  loading?: boolean;
}) {
  return (
    <div>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, message: "Email tidak boleh kosong!" }]}
        >
          <Input placeholder="Masukkan email Anda" size="large" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Kata Sandi"
          rules={[{ required: true, message: "Kata sandi wajib diisi!" }]}
        >
          <Input.Password placeholder="Masukkan kata sandi" size="large" />
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
            Masuk
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
