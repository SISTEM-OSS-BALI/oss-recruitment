import ActionTable from "@/app/components/common/action-table";
import { JobDataModel } from "@/app/models/job";
import dayjs from "dayjs";
import "dayjs/locale/id";

import { TableProps } from "antd";
import ShortDescWithDetail from "@/app/utils/short-desc";

export const JobColumns = ({
  onDelete,
  onEdit,
}: {
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}): TableProps<JobDataModel>["columns"] => {
  return [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (_: string, __: JobDataModel, index: number) => index + 1,
    },
    {
      title: "Name Job",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (value: string) => <ShortDescWithDetail value={value} />,
    },
    {
      title: "Location",
      key: "location",
      render: (_: string, record: JobDataModel) => record.location?.name ?? "-",
    },
    {
      title: "Until At",
      dataIndex: "until_at",
      key: "until_at",
      render: (text) => dayjs(text).locale("id").format("DD MMMM YYYY"),
    },
    {
      title: "Status",
      dataIndex: "is_published",
      key: "is_published",
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
            {text ? "Publish" : "Draft"}
          </span>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (record: JobDataModel) => (
        <ActionTable
          title="Job"
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
