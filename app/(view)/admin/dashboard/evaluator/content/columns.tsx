import ActionTable from "@/app/components/common/action-table";
import "dayjs/locale/id";

import { TableProps } from "antd";
import { EvaluatorDataModel } from "@/app/models/evaluator";

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
      title: "Action",
      key: "action",
      render: (record: EvaluatorDataModel) => (
        <ActionTable
          title="Evaluator"
          description={record.name ? record.name : ""}
          actions="delete"
          id={record.id}
          onEdit={() => {
            onEdit(record.id);
          }}
          onDelete={() => {
            onDelete(record.id);
          }}
        />
      ),
    },
  ];
};
