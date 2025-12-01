"use client";

import ActionTable from "@/app/components/common/action-table";
import "dayjs/locale/id";
import { Image, TableProps } from "antd";
import { makeActionsByType } from "@/app/utils/presets";
import { TeamMemberCardTemplateDataModel } from "@/app/models/team-member-card-template";

const thumbStyle: React.CSSProperties = {
  width: 120,
  height: 72,
  objectFit: "cover",
  borderRadius: 8,
};

export const TeamMemberCardTemplateColumns = ({
  onDelete,
  onEdit,
}: {
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}): TableProps<TeamMemberCardTemplateDataModel>["columns"] => {
  return [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (_: string, __: TeamMemberCardTemplateDataModel, index: number) =>
        index + 1,
      width: 72,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image: string) => (
        <Image
          src={image}
          alt="image"
          style={thumbStyle}
          preview={{ mask: "Preview" }}
          fallback="/assets/images/image-fallback.png"
        />
      ),
      width: 160,
    },
    {
      title: "Action",
      key: "action",
      render: (record: TeamMemberCardTemplateDataModel) => (
        <ActionTable
          id={record.id}
          title="Team Member Card Template"
          description={record.name ?? ""}
          items={makeActionsByType({
            type: "default",
            confirmDelete: {
              title: "Delete Team Member Card Template",
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
      width: 160,
    },
  ];
};
