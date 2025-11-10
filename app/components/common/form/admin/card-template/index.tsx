import { Button, Form, Input, FormInstance } from "antd";
import { useEffect } from "react";
import { CardTemplateDataModel } from "@/app/models/card-template";
import SupaImageUploader from "@/app/utils/image-uploader";

export default function CardTemplateForm({
  form,
  onFinish,
  loadingCreate,
  loadingUpdate,
  type,
  open,
  initialValues,
}: {
  onFinish: (values: CardTemplateDataModel) => Promise<void>;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  initialValues?: CardTemplateDataModel;
  form: FormInstance<CardTemplateDataModel>;
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
        label="Name Template"
        rules={[{ required: true, message: "Name template is required" }]}
      >
        <Input placeholder="Add Name Template" size="large" />
      </Form.Item>

      <Form.Item label="Photo Template Front" name="image_url_front">
        <SupaImageUploader
          bucket="web-oss-recruitment"
          folder="template"
          label="Upload Photo"
          previewStyle={{
            width: 240,
            maxHeight: 140,
            objectFit: "cover",
            borderRadius: 8,
          }}
        />
      </Form.Item>

      <Form.Item label="Photo Template Front" name="image_url_back">
        <SupaImageUploader
          bucket="web-oss-recruitment"
          folder="template"
          label="Upload Photo"
          previewStyle={{
            width: 240,
            maxHeight: 140,
            objectFit: "cover",
            borderRadius: 8,
          }}
        />
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
