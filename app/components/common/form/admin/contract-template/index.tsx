import { ContractTemplateDataModel } from "@/app/models/contract-template";
import SupaPdfUploader from "@/app/utils/pdf-uploader";
import { Button, Form, Input, FormInstance } from "antd";
import { useEffect } from "react";

export default function ContractTemplateForm({
  form,
  onFinish,
  loadingCreate,
  loadingUpdate,
  type,
  initialValues,
  open
}: {
  onFinish: (values: ContractTemplateDataModel) => Promise<void>;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  initialValues?: ContractTemplateDataModel;
  form: FormInstance<ContractTemplateDataModel>;
  type: "create" | "update";
  open: boolean
}) {
  useEffect(() => {
    if (!open) return;
    if (type === "update" && initialValues) {
      form.setFieldsValue({
        name: initialValues.name ?? "",
        filePath: initialValues.filePath ?? undefined,
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
    >
      <Form.Item
        name="name"
        label="Name File"
        rules={[{ required: true, message: "Name file is required" }]}
      >
        <Input placeholder="Add Name File" size="large" />
      </Form.Item>
      <Form.Item label="Upload File" name="filePath">
        <SupaPdfUploader bucket="web-oss-recruitment" folder="pdf" />
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
