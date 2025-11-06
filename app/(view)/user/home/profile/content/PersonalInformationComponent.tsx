import { MailOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  Row,
  Space,
  Select,
} from "antd";
import Paragraph from "antd/es/typography/Paragraph";
import dayjs from "dayjs";
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

export default function PersonalInformationDocuments({ loading }: SubmitProps) {
  const [form] = Form.useForm<UserPayloadUpdateModel>();
  const { user_id } = useAuth();

  const { data: detailUserData, onUpdate: onUpdateUser } = useUser({
    id: user_id!,
  });

  const updateUser = async (values: UserPayloadUpdateModel) => {
    const payload: UserPayloadUpdateModel = {
      ...values,
      interestTags: Array.isArray(values.interestTags)
        ? values.interestTags
            .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
            .filter((tag) => tag.length > 0)
        : undefined,
    };

    if (values.date_of_birth && typeof values.date_of_birth !== "string") {
      payload.date_of_birth = dayjs(values.date_of_birth).toISOString();
    } else if (!values.date_of_birth) {
      payload.date_of_birth = null;
    }

    await onUpdateUser({ id: user_id!, payload });
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
      interestTags: detailUserData.interestTags?.map(
        (tag) => tag.interest
      ) ?? [],
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
        <Paragraph style={{ margin: "0 0 8px", fontWeight: 600 }}>
          Personal Information
        </Paragraph>

        <Row gutter={[16, 8]}>
          <Col xs={24} md={24}>
            <Form.Item
              label="Full Name"
              name="name"
              rules={[
                { required: true, message: "Please enter your full name" },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Full Name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 8]}>
          <Col xs={24}>
            <Form.Item
              label="Professional Interests"
              name="interestTags"
              tooltip="Share preferred roles or skills. Add multiple interests using commas."
            >
              <Select
                mode="tags"
                placeholder="e.g. Frontend, Data Analyst, HR"
                tokenSeparators={[","]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 8]}>
          <Col xs={24} md={8}>
            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Email is not valid" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="candidate@example.com"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Phone Number"
              name="phone"
              rules={[
                { required: true, message: "Please enter your phone number" },
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="Enter your active phone number"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Date of Birth"
              name="date_of_birth"
              rules={[
                { required: true, message: "Please select your birth date" },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Select birth date"
              />
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
