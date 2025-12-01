"use client";

import ActionTable from "@/app/components/common/action-table";
import "dayjs/locale/id";
import { Image, TableProps } from "antd";
import { makeActionsByType } from "@/app/utils/presets";
import { CardTemplateDataModel } from "@/app/models/card-template";

const thumbStyle: React.CSSProperties = {
  width: 120,
  height: 72,
  objectFit: "cover",
  borderRadius: 8,
};

export const CardTemplateColumns = ({
  onDelete,
  onEdit,
}: {
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}): TableProps<CardTemplateDataModel>["columns"] => {
  return [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (_: string, __: CardTemplateDataModel, index: number) =>
        index + 1,
      width: 72,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Image Front",
      dataIndex: "image_url_front",
      key: "image_url_front",
      render: (image_url_front: string) => (
        <Image
          src={image_url_front}
          alt="image_front"
          style={thumbStyle}
          preview={{ mask: "Preview" }}
          fallback="/assets/images/image-fallback.png"
        />
      ),
      width: 160,
    },
    {
      title: "Image Back",
      dataIndex: "image_url_back",
      key: "image_url_back",
      render: (image_url_back: string) => (
        <Image
          src={image_url_back}
          alt="image_back"
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
      render: (record: CardTemplateDataModel) => (
        <ActionTable
          id={record.id}
          title="Card Template"
          description={record.name ?? ""}
          items={makeActionsByType({
            type: "default",
            confirmDelete: {
              title: "Delete Card Template",
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
