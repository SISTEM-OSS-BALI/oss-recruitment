import ActionTable from "@/app/components/common/action-table";
import "dayjs/locale/id";

import { TableProps } from "antd";
import { makeActionsByType } from "@/app/utils/presets";
import { ProcedureDocumentDataModel } from "@/app/models/procedure-documents";
import Link from "next/link";

export const ProdecureDocumentColumns = ({
  onDelete,
  onEdit,
}: {
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}): TableProps<ProcedureDocumentDataModel>["columns"] => {
  return [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (_: string, __: ProcedureDocumentDataModel, index: number) =>
        index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Stage",
      dataIndex: "stage",
      key: "stage",
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
      render: (record: ProcedureDocumentDataModel) => (
        <ActionTable
          id={record.id}
          title="Procedure Document"
          description={record.name ?? ""}
          items={makeActionsByType({
            type: "default",
            confirmDelete: {
              title: "Delete Procedure Document",
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
