import SupaImageUploader from "@/app/utils/image-uploader";
import { Button, Form, Input } from "antd";

interface PatchNoIdentityDocuments {
  no_identity: string;
  no_identity_url: string;
}

interface UploadIdentityComponentManualProps {
  onSubmit?: (nik: string, imageUrl: string) => void | Promise<void>;
  onClose?: () => void;
}

export default function UploadIdentityComponentManual({
  onSubmit,
  onClose,
}: UploadIdentityComponentManualProps) {
  const handleFinish = async (values: PatchNoIdentityDocuments) => {
    await onSubmit?.(values.no_identity, values.no_identity_url);
    onClose?.();
  };

  return (
    <Form onFinish={handleFinish} layout="vertical">
      <Form.Item
        name="no_identity"
        label="No Identity"
        rules={[
          { required: true, message: "Please input No Identity!" },
          { pattern: /^\d{16}$/, message: "No Identity must be 16 digits." },
        ]}
      >
        <Input placeholder="No Identity" maxLength={16} inputMode="numeric" />
      </Form.Item>
      <Form.Item
        label="Identity Card"
        name="no_identity_url"
        valuePropName="value"
        getValueFromEvent={(value) => value}
        rules={[{ required: true, message: "Please upload your ID card!" }]}
      >
        <SupaImageUploader
          bucket="web-oss-recruitment"
          folder="template"
          label="Upload Identity Card"
          previewStyle={{
            width: 240,
            maxHeight: 140,
            objectFit: "cover",
            borderRadius: 8,
          }}
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}
