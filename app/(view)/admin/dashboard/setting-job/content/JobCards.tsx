import {
  Card,
  Space,
  Tag,
  Switch,
  Button,
  Typography,
  Divider,
  Flex,
  Dropdown,
} from "antd";
import {
  MoreOutlined,
  ThunderboltOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { JobDataModel } from "@/app/models/job";

const { Title, Text } = Typography;

type Props = {
  job: JobDataModel;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, next: boolean) => void;
};

export default function JobCard({
  job,
  onEdit,
  onDelete,
  onTogglePublish,
}: Props) {
  const published = Boolean(job.is_published);

  const menu = {
    items: [
      { key: "edit", label: "Edit", onClick: () => onEdit(job.id) },
      {
        key: "delete",
        danger: true,
        label: "Delete",
        onClick: () => onDelete(job.id),
      },
    ],
  };

  return (
    <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 16 }}>
      <Flex align="flex-start" justify="space-between" wrap="wrap" gap={12}>
        {/* Left: Title + meta */}
        <Space direction="vertical" size={6} style={{ minWidth: 280 }}>
          <Title level={4} style={{ margin: 0 }}>
            {job.name}
          </Title>

          <Space size="small">
            <Text type="secondary">Full-time</Text>
          </Space>

          <Space direction="vertical" size={4}>
            <Space size="small">
              <EnvironmentOutlined />
              <Text>
                {job.location?.name || "-"}
                {job.location?.address ? `, ${job.location.address}` : ""}
              </Text>
            </Space>
            <Space size="small">
              <ClockCircleOutlined />
              <Text>
                Active until: {dayjs(job.until_at).format("DD MMM YYYY")}
              </Text>
            </Space>
          </Space>
        </Space>

        {/* Right: status */}
        <Space align="center">
          <Tag
            color={published ? "green" : "default"}
            style={{ marginRight: 8 }}
          >
            {published ? "Active" : "Inactive"}
          </Tag>
          <Switch
            checked={published}
            onChange={(v) => onTogglePublish(job.id, v)}
          />
          <Dropdown menu={menu} trigger={["click"]}>
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      </Flex>

      <Divider style={{ margin: "12px 0" }} />

      {/* Stats panel */}
      <Flex gap={12} wrap="wrap">
        <StatBox label="Chat Started" value={0} />
        <StatBox label="Connected" value={0} />
        <StatBox label="Not Suitable" value={0} />
      </Flex>

      <Divider style={{ margin: "12px 0" }} />

      <Flex gap={12} wrap="wrap">
        <Button icon={<ThunderboltOutlined />} type="default">
          Boost Job
        </Button>
        <Button type="primary">Manage Candidates</Button>
        <Button>Recommended Talents</Button>
      </Flex>
    </Card>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <Card
      size="small"
      style={{ width: 200, borderRadius: 10 }}
      bodyStyle={{ padding: 12, textAlign: "center" }}
    >
      <Title level={4} style={{ margin: 0 }}>
        {value}
      </Title>
      <Text type="secondary">{label}</Text>
    </Card>
  );
}
