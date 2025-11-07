import ActionTable from "@/app/components/common/action-table";
import "dayjs/locale/id";

import { TableProps } from "antd";
import { makeActionsByType } from "@/app/utils/presets";
import { ConsultantDataModel } from "@/app/models/consultant";

export const ConsultantColumns = ({
  onDelete,
  onEdit,
}: {
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}): TableProps<ConsultantDataModel>["columns"] => {
  return [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (_: string, __: ConsultantDataModel, index: number) => index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "No Whatsapp",
      dataIndex: "no_whatsapp",
      key: "no_whatsapp",
    },
    {
      title: "Action",
      key: "action",
      render: (record: ConsultantDataModel) => (
        <ActionTable
          id={record.id}
          title="Consultant"
          description={record.name ?? ""}
          items={makeActionsByType({
            type: "default",
            confirmDelete: {
              title: "Delete Consultant",
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
