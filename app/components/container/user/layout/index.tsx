"use client";

import dynamic from "next/dynamic";
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Layout,
  Menu,
  Typography,
} from "antd";
import type { MenuProps } from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";
import { usePathname, useRouter } from "next/navigation";
import { SiderUser } from "../../admin/sider/user";
import { MainBreadcrumb } from "@/app/components/common/breadcrumb";
import { LogoutOutlined } from "@ant-design/icons";
import getInitials from "@/app/utils/initials-username";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useChatUnread } from "@/app/hooks/chat";

// penting: matikan SSR untuk header
const MainHeader = dynamic(() => import("../header"), { ssr: false });

export default function UserLayout({
  children,
  username,
  userProfilePic,
}: {
  children: React.ReactNode;
  username: string;
  userProfilePic?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { unreadCount, conversations, isFetching } = useChatUnread();

  const showHeader = !pathname.startsWith("/user/home");
  const showSider = pathname.startsWith("/user/home");
  const showHeaderDashboard = pathname.startsWith("/user/home");

  const headerStyle = {
    background: "#fff",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  };

  const contentStyle = {
    margin: "24px 16px",
    padding: 24,
    height: "auto",
    background: "#fff",
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  };

  const menu = (
    <Menu>
      <Menu.Item
        key="logout"
        icon={<LogoutOutlined />}
        onClick={() => {
          alert("Logout clicked! (Ganti dengan logic logout aslimu)");
        }}
      >
        Logout
      </Menu.Item>
    </Menu>
  );

  const notificationItems: MenuProps["items"] =
    conversations.length > 0
      ? conversations.map((item) => {
          const title = "OSS Recruitment";
          const updatedAt = item.conversation?.updatedAt
            ? new Date(item.conversation.updatedAt).toLocaleString()
            : "";
          return {
            key: item.conversationId,
            label: (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  maxWidth: 280,
                }}
              >
                <div style={{ fontWeight: 600 }}>{title}</div>
                <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                  {item.unreadCount} pesan belum dibaca
                </div>
                {updatedAt && (
                  <div style={{ fontSize: 11, color: "#bfbfbf" }}>
                    {updatedAt}
                  </div>
                )}
              </div>
            ),
          };
        })
      : [
          {
            key: "empty",
            disabled: true,
            label: (
              <div style={{ padding: "8px 12px", fontSize: 13, color: "#999" }}>
                No new messages
              </div>
            ),
          },
        ];

  const handleNotificationClick: MenuProps["onClick"] = ({ key }) => {
    const target = conversations.find((item) => item.conversationId === key);
    if (!target) return;
    const applicantId =
      target.conversation?.applicant?.id ?? target.conversation?.applicantId;
    if (applicantId) {
      router.push(`/user/home/apply-job/${applicantId}/chat`);
    } else {
      router.push(`/user/home`);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {showSider && <SiderUser />}
      <Layout>
        {showHeader && <MainHeader />}
        {showHeaderDashboard && (
          <Header style={headerStyle}>
            <div style={{ padding: 24 }}>
              <MainBreadcrumb />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                minWidth: 240,
                justifyContent: "flex-end",
              }}
            >
              <Dropdown
                trigger={["click"]}
                placement="bottomRight"
                menu={{
                  items: notificationItems,
                  onClick: handleNotificationClick,
                }}
              >
                <Badge
                  count={unreadCount}
                  overflowCount={99}
                  style={{ backgroundColor: "#ff4d4f" }}
                  offset={[-2, 6]}
                  showZero={false}
                >
                  <Button
                    type="text"
                    loading={isFetching && unreadCount === 0}
                    icon={<FontAwesomeIcon icon={faBell} />}
                  />
                </Badge>
              </Dropdown>
              <Dropdown
                overlay={menu}
                placement="bottomRight"
                trigger={["click"]}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <Avatar
                    size={50}
                    src={userProfilePic || undefined} // undefined kalau kosong, biar pakai fallback
                    style={{
                      border: "2px solid #1890ff",
                      background: "#e6f7ff",
                      color: "#1890ff",
                      fontWeight: 700,
                      fontSize: 22,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {!userProfilePic && getInitials(username)}
                  </Avatar>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      marginRight: 15,
                    }}
                  >
                    <Typography.Text strong style={{ fontSize: 15 }}>
                      {username}
                    </Typography.Text>
                    <Typography.Text
                      type="secondary"
                      style={{ fontSize: 14, marginTop: 0 }}
                    >
                      Candidate
                    </Typography.Text>
                  </div>
                </div>
              </Dropdown>
            </div>
          </Header>
        )}
        <Content style={contentStyle}>{children}</Content>
        <Footer style={{ textAlign: "center", background: "#fff" }}>
          {/* Tambahkan isi footer di sini jika perlu */}
        </Footer>
      </Layout>
    </Layout>
  );
}
