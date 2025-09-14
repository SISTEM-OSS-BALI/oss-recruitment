import ActionTable from "@/app/components/common/action-table";
import "dayjs/locale/id";

import { TableProps } from "antd";
import { ContractTemplateDataModel } from "@/app/models/contract-template";

export const ContractTemplateColumns = ({
  onDelete,
  onEdit,
}: {
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}): TableProps<ContractTemplateDataModel>["columns"] => {
  return [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (_: string, __: ContractTemplateDataModel, index: number) =>
        index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "File",
      dataIndex: "filePath",
      key: "filePath",
      render: (filePath: string) =>
        filePath ? (
          <a
            href={filePath}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1677ff" }}
          >
            {filePath.split("/").pop() || "View File"}
          </a>
        ) : (
          <span style={{ color: "#999" }}>No file</span>
        ),
    },
    {
      title: "Action",
      key: "action",
      render: (record: ContractTemplateDataModel) => (
        <ActionTable
          title="Contract Template"
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
