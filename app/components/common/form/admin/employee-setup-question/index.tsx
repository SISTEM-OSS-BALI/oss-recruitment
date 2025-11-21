import { Button, Form, FormInstance, Input, Select } from "antd";
import { useEffect } from "react";

const { TextArea } = Input;

export type MethodEmployeeSetupQuestion = "CHECK" | "INPUT" | "LINK" | "UPLOAD";

export type EmployeeSetupQuestionFormValues = {
  name_activity: string;
  executor: string;
  method: MethodEmployeeSetupQuestion;
  description?: string | null;
  default_link?: string | null;
  input_label?: string | null;
};

export default function EmployeeSetupQuestionForm({
  form,
  onFinish,
  loadingCreate,
  loadingUpdate,
  type,
  open,
  initialValues,
}: {
  onFinish: (values: EmployeeSetupQuestionFormValues) => Promise<void>;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  form: FormInstance<EmployeeSetupQuestionFormValues>;
  type: "create" | "update";
  open: boolean;
  initialValues?: EmployeeSetupQuestionFormValues | null;
}) {
  useEffect(() => {
    if (!open) return;

    if (type === "update" && initialValues) {
      form.setFieldsValue({
        ...initialValues,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        method: "CHECK",
      });
    }
  }, [open, type, initialValues, form]);

  const loading = type === "create" ? loadingCreate : loadingUpdate;

  return (
    <Form
      layout="vertical"
      onFinish={onFinish}
      form={form}
      initialValues={{
        method: "CHECK",
      }}
    >
      <Form.Item
        name="name_activity"
        label="Activity Name"
        rules={[{ required: true, message: "Activity name is required" }]}
      >
        <Input placeholder="Example: Company Email Setup" size="large" />
      </Form.Item>

      <Form.Item
        name="executor"
        label="Owner / Responsible"
        rules={[{ required: true, message: "Owner is required" }]}
      >
        <Input placeholder="Example: HR / IT" size="large" />
      </Form.Item>

      <Form.Item
        name="method"
        label="Task Type"
        rules={[{ required: true, message: "Task type is required" }]}
      >
        <Select
          size="large"
          placeholder="Select task type"
          options={[
            { label: "Checklist only", value: "CHECK" },
            { label: "Text Input (Form)", value: "INPUT" },
            { label: "External Link", value: "LINK" },
            { label: "Document Upload", value: "UPLOAD" },
          ]}
        />
      </Form.Item>

      <Form.Item name="description" label="Description (Optional)">
        <TextArea
          rows={3}
          placeholder="Example: Employee must complete the email setup and mark this step as done once finished."
        />
      </Form.Item>

      {/* Dynamic fields based on method */}
      <Form.Item
        noStyle
        shouldUpdate={(prev, cur) => prev.method !== cur.method}
      >
        {({ getFieldValue }) => {
          const method = getFieldValue("method") as MethodEmployeeSetupQuestion;

          if (method === "INPUT") {
            return (
              <Form.Item
                name="input_label"
                label="Input Label"
                rules={[
                  {
                    required: true,
                    message: "Input label is required for INPUT type",
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder='Example: "Enter Slack username"'
                />
              </Form.Item>
            );
          }

          if (method === "LINK") {
            return (
              <Form.Item
                name="default_link"
                label="Related Link"
                rules={[
                  {
                    required: true,
                    message: "Link is required for LINK type",
                  },
                  { type: "url", message: "Invalid URL format" },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Example: https://portal.company.com/onboarding"
                />
              </Form.Item>
            );
          }

          // For UPLOAD & CHECK we don't need additional fields for now
          return null;
        }}
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          size="large"
          style={{
            width: "100%",
            backgroundColor: "#C30010",
            borderColor: "#C30010",
          }}
        >
          {type === "create" ? "Save" : "Update"}
        </Button>
      </Form.Item>
    </Form>
  );
}
