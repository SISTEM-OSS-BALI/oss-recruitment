import ActionTable from "@/app/components/common/action-table";
import "dayjs/locale/id";

import { TableProps } from "antd";
import { ContractTemplateDataModel } from "@/app/models/contract-template";
import { makeActionsByType } from "@/app/utils/presets";
import Link from "next/link";

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
          <Link href={filePath} target="_blank" rel="noopener noreferrer">
            View File
          </Link>
        ) : (
          <span style={{ color: "#999" }}>No file</span>
        ),
    },
    {
      title: "Action",
      key: "action",
      render: (record: ContractTemplateDataModel) => (
        <ActionTable
          id={record.id}
          title="Contract Template"
          description={record.name ?? ""}
          items={makeActionsByType({
            type: "default",
            confirmDelete: {
              title: "Delete Contract Template",
              description: `Record "${
                record.name ?? "-"
              }" will be permanently deleted. Continue?`,
              okText: "Delete",
            },
            onEdit: (id: string) => onEdit(id),
            onDelete: (id: string) => onDelete(id),
          })}
        />
      ),
    },
  ];
};
