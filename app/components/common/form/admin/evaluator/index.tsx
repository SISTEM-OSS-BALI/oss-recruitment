import { EvaluatorDataModel } from "@/app/models/evaluator";
import {
  Button,
  Form,
  Input,
  FormInstance,
  Checkbox,
} from "antd";
import { useEffect } from "react";

export default function EvaluatorForm({
  form,
  onFinish,
  loadingCreate,
  loadingUpdate,
  type,
  initialValues,
  open,
}: {
  onFinish: (values: EvaluatorDataModel) => Promise<void>;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  initialValues?: EvaluatorDataModel;
  form: FormInstance<EvaluatorDataModel>;
  type: "create" | "update";
  open: boolean;
}) {
  useEffect(() => {
    if (!open) return; // only when modal is open
    if (type === "update" && initialValues) {
      form.setFieldsValue({
        ...initialValues,
      });
    } else {
      form.resetFields();
    }
  }, [open, type, initialValues, form]);
  return (
    <Form
      layout="vertical"
      onFinish={onFinish}
      form={form}
      initialValues={initialValues}
    >
      <Form.Item
        name="name"
        label="Name Evaluator"
        rules={[{ required: true, message: "Name Evaluator is required" }]}
      >
        <Input placeholder="Add Name Evaluator" size="large" />
      </Form.Item>
      <Form.Item
        name="email"
        label="Email"
        rules={[{ required: true, message: "Description is required" }]}
      >
        <Input placeholder="Add Email" size="large" />
      </Form.Item>
      <Form.Item name="is_active" valuePropName="checked">
        <Checkbox>
          Active{" "}
          <span
            style={{
              fontStyle: "italic",
              color: "#888",
            }}
          >
            * Default is active.
          </span>
        </Checkbox>
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
