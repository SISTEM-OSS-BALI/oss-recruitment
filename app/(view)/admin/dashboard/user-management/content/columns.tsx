import {
  DeleteOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Flex, Popconfirm, Space, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import { UserDataModel } from "@/app/models/user";
import getInitials from "@/app/utils/initials-username";
import { normalizedRole } from "@/app/utils/normalized";

type ColumnProps = {
  onDelete: (id: string) => Promise<void> | void;
  onDeleteLoading: boolean;
  deletingId: string | null;
};

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "magenta",
  ADMIN: "blue",
  CANDIDATE: "gold",
};

export default function UserManagementColumns({
  onDelete,
  onDeleteLoading,
  deletingId,
}: ColumnProps): ColumnsType<UserDataModel> {
  return [
    {
      title: "User",
      dataIndex: "name",
      key: "name",
      render: (_, user) => (
        <Flex align="center" gap={12}>
          <Avatar
            size={44}
            icon={<UserOutlined />}
            src={user.photo_url || undefined}
          >
            {getInitials(user.name)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600 }}>{user.name}</div>
            <div style={{ color: "#7c7c7c" }}>{user.email}</div>
          </div>
        </Flex>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag color={roleColors[role] || "default"}>{normalizedRole(role)}</Tag>
      ),
    },
    // {
    //   title: "Contact",
    //   dataIndex: "phone",
    //   key: "contact",
    //   render: (phone: string | null | undefined, user) => (
    //     <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    //       <span style={{ fontWeight: 500 }}>{phone || "-"}</span>
    //       {user.address ? (
    //         <span style={{ color: "#8c8c8c" }}>
    //           {user.address.length > 32
    //             ? `${user.address.slice(0, 32)}...`
    //             : user.address}
    //         </span>
    //       ) : (
    //         <span style={{ color: "#8c8c8c" }}>No address</span>
    //       )}
    //     </div>
    //   ),
    // },
    // {
    //   title: "Interests",
    //   dataIndex: "interestTags",
    //   key: "interests",
    //   render: (interestTags: UserDataModel["interestTags"]) =>
    //     interestTags?.length ? (
    //       <Space size={[6, 6]} wrap>
    //         {interestTags.slice(0, 3).map((item) => (
    //           <Tag key={`${item.user_id}-${item.interest}`} color="geekblue">
    //             {item.interest}
    //           </Tag>
    //         ))}
    //         {interestTags.length > 3 && (
    //           <Tag color="default">+{interestTags.length - 3} more</Tag>
    //         )}
    //       </Space>
    //     ) : (
    //       <span style={{ color: "#8c8c8c" }}>No tags</span>
    //     ),
    // },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string | Date) =>
        dayjs(value).format("DD MMM YYYY, HH:mm"),
    },
    {
      title: "Action",
      key: "action",
      align: "right",
      render: (_, user) => (
        <Space>
          <Popconfirm
            title="Are you sure to delete this user?"
            description="This action cannot be undone."
            okText="Delete"
            okButtonProps={{
              danger: true,
              loading: deletingId === user.id && onDeleteLoading,
            }}
            cancelText="Cancel"
            placement="left"
            onConfirm={() => onDelete(user.id)}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              loading={deletingId === user.id && onDeleteLoading}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
}
