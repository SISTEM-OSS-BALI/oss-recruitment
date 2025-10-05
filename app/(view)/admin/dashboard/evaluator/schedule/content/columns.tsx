import ActionTable from "@/app/components/common/action-table";
import { TableProps, Tooltip, Space, Button, Typography, message } from "antd";
import { LinkOutlined, CopyOutlined } from "@ant-design/icons";
import { EvaluatorDataModel } from "@/app/models/evaluator";
import { makeActionsByType } from "@/app/utils/presets";

const { Text } = Typography;

export const EvaluatorColumns = ({
  onDelete,
  onEdit,
  onClick, // (id: string) => void
}: {
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onClick: (id: string) => void;
}): TableProps<EvaluatorDataModel>["columns"] => {
  const copyToClipboard = async (text?: string | null) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      message.success("Link copied to clipboard!");
    } catch {
      // Fallback sederhana
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        message.success("Link copied to clipboard!");
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  return [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (_: unknown, __: EvaluatorDataModel, i: number) => i + 1,
      width: 64,
    },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Position", dataIndex: "position", key: "position" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Link Schedule",
      dataIndex: "link_schedule",
      key: "link_schedule",
      render: (link: string | undefined) => {
        if (!link) return <Text type="secondary">—</Text>;
        return (
          <Space size={8}>
            <Tooltip title="Open link">
              <Button
                type="link"
                icon={<LinkOutlined />}
                onClick={() =>
                  window.open(link, "_blank", "noopener,noreferrer")
                }
              >
                <Text ellipsis style={{ maxWidth: 220 }}>
                  {link}
                </Text>
              </Button>
            </Tooltip>

            <Tooltip title="Copy link">
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(link)}
              />
            </Tooltip>
          </Space>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (active: boolean) => (
        <span
          style={{
            backgroundColor: active ? "#28C76F" : "#1E1E1E",
            color: "#fff",
            padding: "4px 12px",
            borderRadius: 20,
            fontSize: 12,
            display: "inline-block",
            fontWeight: 500,
          }}
        >
          {active ? "Active" : "Inactive"}
        </span>
      ),
      width: 120,
    },
    {
      title: "Action",
      key: "action",
      render: (record: EvaluatorDataModel) => (
        <ActionTable
          id={record.id}
          title="Evaluator"
          description={record.name ?? ""}
          items={makeActionsByType({
            type: "schedule-evaluator",
            confirmDelete: {
              title: "Hapus Evaluator",
              description: `Data "${
                record.name ?? "-"
              }" akan dihapus permanen. Lanjut?`,
              okText: "Hapus",
            },
            onEdit: onEdit,
            onDelete: onDelete,
            onClick: onClick, // kirim ID apa adanya
          })}
        />
      ),
      width: 220,
    },
  ];
};
