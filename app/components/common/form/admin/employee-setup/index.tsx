import { EmployeeSetupDataModel } from "@/app/models/employee-setup";
import { Button, Form, FormInstance, Input } from "antd";
import { useEffect } from "react";

export type EmployeeSetupFormValues = {
  name: string;
};

export default function EmployeeSetupForm({
  form,
  onFinish,
  loadingCreate,
  loadingUpdate,
  type,
  open,
  initialValues,
}: {
  onFinish: (values: EmployeeSetupFormValues) => Promise<void>;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  initialValues?: EmployeeSetupDataModel;
  form: FormInstance<EmployeeSetupFormValues>;
  type: "create" | "update";
  open: boolean;
}) {
  useEffect(() => {
    if (!open) return;

    if (type === "update" && initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
      });
    } else {
      form.resetFields();
    }
  }, [open, type, initialValues, form]);

  return (
    <Form layout="vertical" onFinish={onFinish} form={form}>
      <Form.Item
        name="name"
        label="Name Employee Set Up"
        rules={[{ required: true, message: "Employee setup name is required" }]}
      >
        <Input placeholder="Enter a template name" size="large" />
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
