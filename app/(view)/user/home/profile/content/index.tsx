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
} from "antd";
import Paragraph from "antd/es/typography/Paragraph";
import SupaImageUploader from "@/app/utils/image-uploader";
import SupaPdfUploader from "@/app/utils/pdf-uploader";
import { UserPayloadUpdateModel } from "@/app/models/user";

type SubmitProps = {
  onUpdate?: (values: UserPayloadUpdateModel) => void;
  loading?: boolean;
};

export default function Content({ onUpdate, loading }: SubmitProps) {
  return (
    <div>
      <Form
        layout="vertical"
        size="large"
        requiredMark="optional"
        onFinish={onUpdate}
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
                { required: true, message: "Please enter your first name" },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="First Name" />
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

        <Divider style={{ margin: "6px 0 16px" }} />

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
