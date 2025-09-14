import ActionTable from "@/app/components/common/action-table";
import "dayjs/locale/id";

import { TableProps } from "antd";
import { LocationDataModel } from "@/app/models/location";

export const LocationColumns = ({
  onDelete,
  onEdit,
}: {
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}): TableProps<LocationDataModel>["columns"] => {
  return [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (_: string, __: LocationDataModel, index: number) => index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Maps",
      dataIndex: "maps_url",
      key: "maps_url",
    },
    {
      title: "Action",
      key: "action",
      render: (record: LocationDataModel) => (
        <ActionTable
          title="Location"
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
