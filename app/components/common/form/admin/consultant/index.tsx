import { Button, Form, Input, FormInstance } from "antd";
import { useEffect } from "react";
import { ConsultantDataModel } from "@/app/models/consultant";

export default function ConsultantForm({
  form,
  onFinish,
  loadingCreate,
  loadingUpdate,
  type,
  open,
  initialValues,
}: {
  onFinish: (values: ConsultantDataModel) => Promise<void>;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  initialValues?: ConsultantDataModel;
  form: FormInstance<ConsultantDataModel>;
  type: "create" | "update";
  open: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    if (type === "update" && initialValues) {
      form.setFieldsValue({
        ...initialValues,
      });
    } else {
      form.resetFields();
    }
  }, [open, type, initialValues, form]);

  return (
    <Form layout="vertical" onFinish={onFinish} form={form}>
      <Form.Item
        name="name"
        label="Name Consultant"
        rules={[{ required: true, message: "Name Consultant" }]}
      >
        <Input placeholder="Add Name Consultant" size="large" />
      </Form.Item>
      <Form.Item name="no_whatsapp" label="No Whatsapp">
        <Input placeholder="Add No Whatsapp" size="large" />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={type === "create" ? loadingCreate : loadingUpdate}
          size="large"
          style={{
            width: "100%",
            backgroundColor: "#C30010",
            borderColor: "#C30010",
          }}
        >
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}
