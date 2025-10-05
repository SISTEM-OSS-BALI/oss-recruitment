import { Button, Col, Divider, Form, Row, Space } from "antd";
import Paragraph from "antd/es/typography/Paragraph";
import dayjs from "dayjs";

import SupaImageUploader from "@/app/utils/image-uploader";
import SupaPdfUploader from "@/app/utils/pdf-uploader";
import { UserPayloadUpdateModel } from "@/app/models/user";
import { useUser } from "@/app/hooks/user";
import { useAuth } from "@/app/utils/useAuth";
import { useEffect, useMemo } from "react";

type SubmitProps = {
  loading?: boolean;
};

function toFileList(url?: string) {
  if (!url) return [];
  const name = decodeURIComponent(url.split("/").pop() || "file");
  return [{ uid: url, name, url }];
}

export default function DocumentsComponent({ loading }: SubmitProps) {
  const [form] = Form.useForm<UserPayloadUpdateModel>();
  const { user_id } = useAuth();

  const { data: detailUserData, onUpdate: onUpdateUser } = useUser({
    id: user_id!,
  });

  const updateUser = async (values: UserPayloadUpdateModel) => {
    await onUpdateUser({ id: user_id!, payload: values });
  };

  const initialValues = useMemo(() => {
    if (!detailUserData) return undefined;
    return {
      name: detailUserData.name ?? "",
      email: detailUserData.email ?? "",
      phone: detailUserData.phone ?? "",
      date_of_birth: detailUserData.date_of_birth
        ? dayjs(detailUserData.date_of_birth)
        : undefined,
      curiculum_vitae_url: toFileList(
        detailUserData.curiculum_vitae_url ?? undefined
      ),
      photo_url: toFileList(detailUserData.photo_url ?? undefined),
      portfolio_url: toFileList(detailUserData.portfolio_url ?? undefined),
      address: detailUserData.address ?? undefined,
      no_identity: detailUserData.no_identity ?? undefined,
      gender: detailUserData.gender ?? undefined,
    } as unknown as UserPayloadUpdateModel;
  }, [detailUserData]);

  useEffect(() => {
    if (initialValues) form.setFieldsValue(initialValues);
    else form.resetFields();
  }, [initialValues, form]);

  // ===== Preview ringkas jika data sudah ada =====

  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        size="large"
        requiredMark="optional"
        onFinish={updateUser}
        initialValues={initialValues}
      >
        {/* Personal Information */}

        {/* Required Documents */}
        <Paragraph style={{ margin: "0 0 8px", fontWeight: 600 }}>
          Required Documents
        </Paragraph>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Form.Item
              label="CV / Resume"
              name="curiculum_vitae_url"
              valuePropName="fileList"
              rules={[{ required: true, message: "Please upload your CV" }]}
            >
              <SupaPdfUploader bucket="web-oss-recruitment" folder="pdf" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              label="Profile Photo"
              name="photo_url"
              valuePropName="fileList"
              rules={[{ required: true, message: "Please upload your photo" }]}
            >
              <SupaImageUploader
                bucket="web-oss-recruitment"
                folder="profile"
                label="Upload Photo"
                previewStyle={{
                  width: 240,
                  maxHeight: 140,
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              label="Upload Portfolio"
              name="portfolio_url"
              valuePropName="fileList"
            >
              <SupaPdfUploader bucket="web-oss-recruitment" folder="pdf" />
            </Form.Item>
          </Col>
        </Row>

        <Divider style={{ margin: "8px 0 16px" }} />

        <Space
          size="middle"
          style={{ width: "100%", justifyContent: "flex-end" }}
        >
          <Button htmlType="reset">Reset</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save
          </Button>
        </Space>
      </Form>
    </div>
  );
}
