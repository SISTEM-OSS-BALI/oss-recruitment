import ActionTable from "@/app/components/common/action-table";
import "dayjs/locale/id";

import { TableProps } from "antd";
import { EvaluatorDataModel } from "@/app/models/evaluator";
import { makeActionsByType } from "@/app/utils/presets";

export const EvaluatorColumns = ({
  onDelete,
  onEdit,
}: {
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}): TableProps<EvaluatorDataModel>["columns"] => {
  return [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (_: string, __: EvaluatorDataModel, index: number) => index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (text) => {
        return (
          <span
            style={{
              backgroundColor: text ? "#28C76F" : "#1E1E1E",
              color: "#fff",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              display: "inline-block",
              fontWeight: 500,
            }}
          >
            {text ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "is_default",
      key: "is_default",
      render: (text) => {
        return (
          <span
            style={{
              backgroundColor: text ? "#28C76F" : "#1E1E1E",
              color: "#fff",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              display: "inline-block",
              fontWeight: 500,
            }}
          >
            {text ? "Default" : "Not Default"}
          </span>
        );
      },
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
            type: "default",
            confirmDelete: {
              title: "Hapus Evaluator",
              description: `Data "${
                record.name ?? "-"
              }" akan dihapus permanen. Lanjut?`,
              okText: "Hapus",
            },
            onEdit: (id: string) => onEdit(id),
            onDelete: (id: string) => onDelete(id),
          })}
        />
      ),
    },
  ];
};
