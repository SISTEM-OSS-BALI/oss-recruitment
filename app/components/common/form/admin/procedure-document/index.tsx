import { Button, Form, Input, FormInstance, Select } from "antd";
import { useEffect } from "react";
import SupaPdfUploader from "@/app/utils/pdf-uploader";
import { ProcedureDocumentDataModel } from "@/app/models/procedure-documents";
import { RecruitmentStage } from "@prisma/client";

export default function ProcedureDocumentForm({
  form,
  onFinish,
  loadingCreate,
  loadingUpdate,
  type,
  open,
  initialValues,
}: {
  onFinish: (values: ProcedureDocumentDataModel) => Promise<void>;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  initialValues?: ProcedureDocumentDataModel;
  form: FormInstance<ProcedureDocumentDataModel>;
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
        label="Name Procedure Management"
        rules={[{ required: true, message: "Name location is required" }]}
      >
        <Input placeholder="Add Name Procedure Management" size="large" />
      </Form.Item>
      <Form.Item name="filePath" label="File">
        <SupaPdfUploader bucket="web-oss-recruitment" folder="pdf" />
      </Form.Item>
      <Form.Item
        name="stage"
        label="Stage"
        rules={[{ required: true, message: "Stage is required" }]}
      >
        <Select placeholder="Select Stage">
          {Object.values(RecruitmentStage).map((stage) => (
            <Select.Option key={stage} value={stage}>
              {stage}
            </Select.Option>
          ))}
        </Select>
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
